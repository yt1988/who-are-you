package main

import (
	"fmt"
	"net"
	"strings"
	"sync"
	"time"

	"github.com/google/gopacket"
	"github.com/google/gopacket/layers"
	"github.com/google/gopacket/pcap"
)

// The SYN a browser's system opens the connection with: the system writes it, not the browser, so a user agent
// can't change it. Its initial TTL and its option layout tell the OS family; its MSS, the path's MTU (a tunnel
// takes some: 1500 bytes is a plain line, 1420 or less often a VPN). JA4T: window_options_mss_wscale.
type synInfo struct {
	at     time.Time
	ttl    uint8
	v6     bool
	window uint16
	mss    uint16
	wscale int
	opts   []uint8
}

type synTable struct {
	mu sync.Mutex
	m  map[string]*synInfo
}

func newSynTable() *synTable {
	t := &synTable{m: map[string]*synInfo{}}
	go func() {
		for range time.Tick(30 * time.Second) {
			t.mu.Lock()
			for k, s := range t.m {
				if time.Since(s.at) > time.Minute {
					delete(t.m, k)
				}
			}
			t.mu.Unlock()
		}
	}()
	return t
}

func key(ip net.IP, port int) string { return ip.String() + "|" + fmt.Sprint(port) }

func (t *synTable) put(k string, s *synInfo) {
	t.mu.Lock()
	t.m[k] = s
	t.mu.Unlock()
}

// the SYN of the connection from ip:port, once (a SYN is read by its own connection only)
func (t *synTable) take(ip net.IP, port int) *synInfo {
	k := key(ip, port)
	for i := 0; i < 20; i++ { // (the capture may trail the accept by a moment)
		t.mu.Lock()
		s := t.m[k]
		delete(t.m, k)
		t.mu.Unlock()
		if s != nil {
			return s
		}
		time.Sleep(5 * time.Millisecond)
	}
	return nil
}

func defaultIface() string {
	ifs, _ := net.Interfaces()
	for _, i := range ifs {
		if i.Flags&net.FlagLoopback == 0 && i.Flags&net.FlagUp != 0 {
			return i.Name
		}
	}
	return "eth0"
}

// SYNs to the listening port, IPv4 or IPv6 (the IPv6 TCP header starts at byte 40: its flags at 53). The port comes
// from -addr, so a probe on 9443 captures 9443, not 443.
func synFilter(port int) string {
	return fmt.Sprintf("tcp dst port %d and ((ip and tcp[13] & 0x12 == 2) or (ip6 and ip6[6] == 6 and ip6[53] & 0x12 == 2))", port)
}

func captureSyns(iface string, port int, t *synTable) error {
	if iface == "" {
		iface = defaultIface()
	}
	h, err := pcap.OpenLive(iface, 256, false, pcap.BlockForever)
	if err != nil {
		return err
	}
	if err := h.SetBPFFilter(synFilter(port)); err != nil {
		return err
	}
	src := gopacket.NewPacketSource(h, h.LinkType())
	for p := range src.Packets() {
		var ip net.IP
		s := &synInfo{at: time.Now(), wscale: -1}
		if l := p.Layer(layers.LayerTypeIPv4); l != nil {
			v := l.(*layers.IPv4)
			ip, s.ttl = v.SrcIP, v.TTL
		} else if l := p.Layer(layers.LayerTypeIPv6); l != nil {
			v := l.(*layers.IPv6)
			ip, s.ttl, s.v6 = v.SrcIP, v.HopLimit, true
		}
		tl := p.Layer(layers.LayerTypeTCP)
		if ip == nil || tl == nil {
			continue
		}
		tc := tl.(*layers.TCP)
		s.window = tc.Window
		for _, o := range tc.Options {
			s.opts = append(s.opts, uint8(o.OptionType))
			switch o.OptionType {
			case layers.TCPOptionKindMSS:
				if len(o.OptionData) >= 2 {
					s.mss = uint16(o.OptionData[0])<<8 | uint16(o.OptionData[1])
				}
			case layers.TCPOptionKindWindowScale:
				if len(o.OptionData) >= 1 {
					s.wscale = int(o.OptionData[0])
				}
			}
		}
		t.put(key(ip, int(tc.SrcPort)), s)
	}
	return nil
}

// what the SYN says: initial TTL and hops, the OS family its layout matches, the MTU, JA4T
func (s *synInfo) report() map[string]any {
	init := 64
	switch {
	case s.ttl > 128:
		init = 255
	case s.ttl > 64:
		init = 128
	case s.ttl <= 32:
		init = 32
	}
	o := make([]string, len(s.opts))
	for i, k := range s.opts {
		o[i] = fmt.Sprint(k)
	}
	opts := strings.Join(o, "-")
	mtu := 0
	if s.mss > 0 {
		mtu = int(s.mss) + 40
		if s.v6 {
			mtu = int(s.mss) + 60
		}
	}
	ws := "00"
	if s.wscale >= 0 {
		ws = fmt.Sprint(s.wscale)
	}
	return map[string]any{
		"ttl": s.ttl, "initial_ttl": init, "hops": init - int(s.ttl), "window": s.window, "mss": s.mss, "wscale": s.wscale,
		"options": opts, "mtu": mtu, "ja4t": fmt.Sprintf("%d_%s_%d_%s", s.window, opts, s.mss, ws), "os": osOf(opts),
	}
}

// The OS family a SYN's option layout matches (p0f-style, the common systems only). The initial TTL is not used:
// over IPv6 the first hop's hop limit comes from the router's RA (RFC 4861 6.3.4), commonly 64, so a Windows host
// can send 64 there while sending 128 on IPv4. The layout is what the host's stack writes. Windows: mss,nop,ws,nop,
// nop,sack (2-1-3-1-1-4); Apple (macOS, iOS): the same with timestamps and eol (2-1-3-1-1-8-4); Linux and Android:
// mss,sack,ts,nop,ws (2-4-8-1-3). Anything else is "other": no evidence for a family, never a guess of "unix".
func osOf(opts string) string {
	switch {
	case strings.HasPrefix(opts, "2-1-3-1-1-8-4"):
		return "apple"
	case strings.HasPrefix(opts, "2-4-8-1-3"):
		return "linux"
	case strings.HasPrefix(opts, "2-1-3-1-1-4"):
		return "windows"
	}
	return "other"
}

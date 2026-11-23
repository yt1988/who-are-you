package main

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/md5"
	"crypto/rand"
	"crypto/sha256"
	"crypto/tls"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/hex"
	"fmt"
	"math/big"
	"sort"
	"strconv"
	"strings"
	"time"
)

// The ClientHello as the browser sent it, GREASE values left out (they change every time on purpose)
type helloInfo struct {
	version   uint16   // the record's legacy version
	ciphers   []uint16 // in the browser's order
	exts      []uint16 // in the browser's order (Chrome shuffles it per connection)
	groups    []uint16
	points    []uint8
	sigalgs   []uint16
	alpn      []string
	versions  []uint16 // supported_versions
	sni       bool
	keyShares []uint16
	quic      bool // read from a QUIC handshake (JA4's "q")
}

func grease(v uint16) bool { return v&0x0f0f == 0x0a0a && v>>8 == v&0xff }

// raw: the connection's first bytes; the ClientHello is the first handshake record(s)
func parseClientHello(raw []byte) *helloInfo {
	// the handshake message, put back together from its records
	var hs []byte
	for len(raw) >= 5 && raw[0] == 0x16 {
		n := int(raw[3])<<8 | int(raw[4])
		if len(raw) < 5+n {
			break
		}
		hs = append(hs, raw[5:5+n]...)
		raw = raw[5+n:]
		if len(hs) >= 4 && len(hs) >= 4+(int(hs[1])<<16|int(hs[2])<<8|int(hs[3])) {
			break
		}
	}
	if len(hs) < 4 || hs[0] != 1 {
		return nil
	}
	b := hs[4:]
	h := &helloInfo{}
	r := reader{b: b}
	h.version = r.u16()
	r.skip(32)
	r.skip(int(r.u8()))
	for i, n := 0, int(r.u16())/2; i < n; i++ {
		if c := r.u16(); !grease(c) {
			h.ciphers = append(h.ciphers, c)
		}
	}
	r.skip(int(r.u8()))
	end := r.u16()
	e := reader{b: r.take(int(end))}
	for e.ok() {
		t, d := e.u16(), reader{b: e.take(int(e.u16()))}
		if grease(t) {
			continue
		}
		h.exts = append(h.exts, t)
		switch t {
		case 0x0000:
			h.sni = true
		case 0x000a:
			for i, n := 0, int(d.u16())/2; i < n; i++ {
				if g := d.u16(); !grease(g) {
					h.groups = append(h.groups, g)
				}
			}
		case 0x000b:
			for i, n := 0, int(d.u8()); i < n; i++ {
				h.points = append(h.points, d.u8())
			}
		case 0x000d:
			for i, n := 0, int(d.u16())/2; i < n; i++ {
				h.sigalgs = append(h.sigalgs, d.u16())
			}
		case 0x0010:
			l := reader{b: d.take(int(d.u16()))}
			for l.ok() {
				h.alpn = append(h.alpn, string(l.take(int(l.u8()))))
			}
		case 0x002b:
			for i, n := 0, int(d.u8())/2; i < n; i++ {
				if v := d.u16(); !grease(v) {
					h.versions = append(h.versions, v)
				}
			}
		case 0x0033:
			l := reader{b: d.take(int(d.u16()))}
			for l.ok() {
				g := l.u16()
				l.skip(int(l.u16()))
				if !grease(g) {
					h.keyShares = append(h.keyShares, g)
				}
			}
		}
	}
	return h
}

func join16(v []uint16, hexed bool, sep string) string {
	s := make([]string, len(v))
	for i, x := range v {
		if hexed {
			s[i] = fmt.Sprintf("%04x", x)
		} else {
			s[i] = strconv.Itoa(int(x))
		}
	}
	return strings.Join(s, sep)
}

// JA3: version,ciphers,extensions,groups,point formats (decimal, dash-joined), and its MD5. Chrome shuffles its
// extensions, so JA3 changes per connection there; "ja3n" sorts them first
func (h *helloInfo) ja3(sorted bool) string {
	exts := append([]uint16(nil), h.exts...)
	if sorted {
		sort.Slice(exts, func(i, j int) bool { return exts[i] < exts[j] })
	}
	pts := make([]string, len(h.points))
	for i, p := range h.points {
		pts[i] = strconv.Itoa(int(p))
	}
	return fmt.Sprintf("%d,%s,%s,%s,%s", h.version, join16(h.ciphers, false, "-"), join16(exts, false, "-"), join16(h.groups, false, "-"), strings.Join(pts, "-"))
}

// JA4 (FoxIO): t13d1516h2_<ciphers sorted, sha256/12>_<extensions sorted without SNI and ALPN, then the signature
// algorithms in order, sha256/12>
func (h *helloInfo) ja4() string {
	// (supported_versions, when sent, over the record's legacy version: its highest)
	ver := h.version
	if len(h.versions) > 0 {
		ver = 0
		for _, v := range h.versions {
			if v > ver {
				ver = v
			}
		}
	}
	vs := map[uint16]string{0x0304: "13", 0x0303: "12", 0x0302: "11", 0x0301: "10", 0x0300: "s3"}[ver]
	if vs == "" {
		vs = "00"
	}
	d := "i"
	if h.sni {
		d = "d"
	}
	al := "00"
	if len(h.alpn) > 0 && len(h.alpn[0]) > 0 {
		a := h.alpn[0]
		al = string(a[0]) + string(a[len(a)-1])
	}
	cnt := func(n int) string {
		if n > 99 {
			n = 99
		}
		return fmt.Sprintf("%02d", n)
	}
	p := "t"
	if h.quic {
		p = "q"
	}
	a := p + vs + d + cnt(len(h.ciphers)) + cnt(len(h.exts)) + al
	cs := append([]uint16(nil), h.ciphers...)
	sort.Slice(cs, func(i, j int) bool { return cs[i] < cs[j] })
	var es []uint16
	for _, e := range h.exts {
		if e != 0x0000 && e != 0x0010 {
			es = append(es, e)
		}
	}
	sort.Slice(es, func(i, j int) bool { return es[i] < es[j] })
	sum := func(s string) string {
		if s == "" {
			return "000000000000"
		}
		x := sha256.Sum256([]byte(s))
		return hex.EncodeToString(x[:])[:12]
	}
	c := join16(es, true, ",")
	if len(h.sigalgs) > 0 {
		c += "_" + join16(h.sigalgs, true, ",")
	}
	return a + "_" + sum(join16(cs, true, ",")) + "_" + sum(c)
}

func (h *helloInfo) report() map[string]any {
	j3, j3n := h.ja3(false), h.ja3(true)
	m3, m3n := md5.Sum([]byte(j3)), md5.Sum([]byte(j3n))
	return map[string]any{
		"ja4": h.ja4(), "ja3": hex.EncodeToString(m3[:]), "ja3n": hex.EncodeToString(m3n[:]), "ja3_raw": j3,
		"ciphers": len(h.ciphers), "exts": h.exts, "groups": h.groups, "sigalgs": h.sigalgs, "alpn": h.alpn,
		"versions": h.versions, "key_shares": h.keyShares, "sni": h.sni,
	}
}

type reader struct {
	b   []byte
	bad bool
}

func (r *reader) ok() bool { return !r.bad && len(r.b) > 0 }
func (r *reader) take(n int) []byte {
	if n < 0 || n > len(r.b) {
		r.bad = true
		x := r.b
		r.b = nil
		return x
	}
	x := r.b[:n]
	r.b = r.b[n:]
	return x
}
func (r *reader) skip(n int) { r.take(n) }
func (r *reader) u8() uint8 {
	x := r.take(1)
	if len(x) < 1 {
		return 0
	}
	return x[0]
}
func (r *reader) u16() uint16 {
	x := r.take(2)
	if len(x) < 2 {
		return 0
	}
	return uint16(x[0])<<8 | uint16(x[1])
}

// testing by IP: a certificate the browser will warn about
func selfSigned(name string) tls.Certificate {
	k, _ := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	t := &x509.Certificate{SerialNumber: big.NewInt(1), Subject: pkix.Name{CommonName: name}, DNSNames: []string{name},
		NotBefore: time.Now().Add(-time.Hour), NotAfter: time.Now().Add(30 * 24 * time.Hour)}
	der, _ := x509.CreateCertificate(rand.Reader, t, t, &k.PublicKey, k)
	return tls.Certificate{Certificate: [][]byte{der}, PrivateKey: k}
}

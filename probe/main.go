// The probe: what a browser's own connection gives away, read where Cloudflare can't: the TCP SYN (initial TTL,
// window, options, MSS), the TLS ClientHello (JA3, JA4) and the HTTP/2 preface (SETTINGS, window update, priorities,
// pseudo-header order: the Akamai fingerprint). Browsers reach it directly (DNS only), the page asks GET /fp and gets
// its own connection's readings back. Nothing is logged or kept: a SYN waits in memory for its connection, a minute
// at most.
package main

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"golang.org/x/crypto/acme/autocert"
	"golang.org/x/net/http2"
)

type ctxKey struct{}

// what one connection gave away, filled as it is accepted, handshaken and read
type connInfo struct {
	syn   *synInfo
	hello *helloInfo
	rec   *recorder // the first plaintext bytes (HTTP/2 preface and frames)
}

func main() {
	addr := flag.String("addr", ":443", "listen address")
	domain := flag.String("domain", "", "certificate name (required)")
	cache := flag.String("certs", "/var/lib/probe/certs", "certificate cache")
	certFile := flag.String("certfile", "", "TLS certificate file (PEM; with -keyfile; turns autocert off)")
	keyFile := flag.String("keyfile", "", "TLS private key file (PEM; with -certfile)")
	iface := flag.String("iface", "", "interface for the SYN capture (empty: the default route's)")
	dev := flag.Bool("dev", false, "a self-signed certificate (testing by IP)")
	flag.Parse()
	if *domain == "" {
		log.Fatal("-domain is required: the certificate name")
	}

	syns := newSynTable()
	go func() {
		if err := captureSyns(*iface, portOf(*addr), syns); err != nil {
			log.Printf("SYN capture off: %v", err)
		}
	}()

	tcfg, err := tlsSetup(*domain, *certFile, *keyFile, *cache, *dev)
	if err != nil {
		log.Fatal(err)
	}

	h := handler()
	// the two probe routes take the shell's token when this server has a secret; everything else is unchanged
	if secret := os.Getenv("MS_AUTH_SECRET"); secret != "" {
		inner := h
		guarded := authHandler(secret, inner)
		h = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path == "/fp" || r.URL.Path == "/conn" {
				guarded.ServeHTTP(w, r)
				return
			}
			inner.ServeHTTP(w, r)
		})
	}
	// HTTP/3 on the same port over UDP (quic.go)
	go serveQUIC(*addr, tcfg, h)
	ln, err := net.Listen("tcp", *addr)
	if err != nil {
		log.Fatal(err)
	}
	h2s := &http2.Server{}
	// (the HTTP libraries' own error lines name the client's address: they go nowhere, nothing about a visitor is logged)
	quiet := log.New(io.Discard, "", 0)
	h1s := &http.Server{Handler: h, ReadHeaderTimeout: 10 * time.Second, IdleTimeout: 30 * time.Second, ErrorLog: quiet,
		ConnContext: func(ctx context.Context, c net.Conn) context.Context {
			if pc, ok := c.(*plainConn); ok {
				return context.WithValue(ctx, ctxKey{}, pc.info)
			}
			return ctx
		}}
	h1 := newChanListener(ln.Addr())
	go h1s.Serve(h1)
	log.Printf("probe on %s (%s)", *addr, *domain)
	for {
		c, err := ln.Accept()
		if err != nil {
			continue
		}
		go serve(c, tcfg, syns, h1, h2s, h, quiet)
	}
}

func serve(c net.Conn, tcfg *tls.Config, syns *synTable, h1 *chanListener, h2s *http2.Server, h http.Handler, quiet *log.Logger) {
	info := &connInfo{}
	if ta, ok := c.RemoteAddr().(*net.TCPAddr); ok {
		info.syn = syns.take(ta.IP, ta.Port)
	}
	raw := &teeConn{Conn: c, rec: &recorder{max: 32 << 10}}
	tc := tls.Server(raw, tcfg)
	tc.SetDeadline(time.Now().Add(15 * time.Second))
	if err := tc.Handshake(); err != nil {
		c.Close()
		return
	}
	tc.SetDeadline(time.Time{})
	info.hello = parseClientHello(raw.rec.bytes())
	info.rec = &recorder{max: 16 << 10}
	pc := &plainConn{Conn: tc, info: info}
	switch tc.ConnectionState().NegotiatedProtocol {
	case "acme-tls/1":
		c.Close()
	case "h2":
		h2s.ServeConn(pc, &http2.ServeConnOpts{Handler: h, Context: context.WithValue(context.Background(), ctxKey{}, info), BaseConfig: &http.Server{ErrorLog: quiet}})
	default:
		h1.push(pc)
	}
}

// The TLS configuration: -dev signs a certificate itself, -certfile/-keyfile use a pair from disk (a wildcard
// renewed elsewhere, for a host whose 80/443 are blocked), and with neither the probe gets its own through autocert.
// The two file flags go together; a file pair turns autocert off entirely.
func tlsSetup(domain, certFile, keyFile, cache string, dev bool) (*tls.Config, error) {
	tcfg := &tls.Config{NextProtos: []string{"h2", "http/1.1"}, MinVersion: tls.VersionTLS10}
	if dev {
		tcfg.Certificates = []tls.Certificate{selfSigned(domain)}
		return tcfg, nil
	}
	if (certFile == "") != (keyFile == "") {
		return nil, fmt.Errorf("-certfile and -keyfile must be given together")
	}
	if certFile != "" {
		c, err := tls.LoadX509KeyPair(certFile, keyFile)
		if err != nil {
			return nil, fmt.Errorf("certificate: %w", err)
		}
		tcfg.Certificates = []tls.Certificate{c}
		return tcfg, nil
	}
	m := &autocert.Manager{Prompt: autocert.AcceptTOS, HostPolicy: autocert.HostWhitelist(domain), Cache: autocert.DirCache(cache)}
	// (a certificate that can't be had is logged, its reason only: nothing about who asked)
	tcfg.GetCertificate = func(h *tls.ClientHelloInfo) (*tls.Certificate, error) {
		c, err := m.GetCertificate(h)
		if err != nil && h.ServerName == domain {
			log.Printf("certificate: %v", err)
		}
		return c, err
	}
	tcfg.NextProtos = append(tcfg.NextProtos, "acme-tls/1")
	return tcfg, nil
}

func handler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/fp", func(w http.ResponseWriter, r *http.Request) {
		info, _ := r.Context().Value(ctxKey{}).(*connInfo)
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Cache-Control", "no-store")
		w.Header().Set("Content-Type", "application/json")
		out := map[string]any{"ip": hostOf(r.RemoteAddr), "proto": r.Proto}
		altSvc(w, r)
		// (over HTTP/3: the QUIC handshake's hello)
		if r.ProtoMajor == 3 {
			if hh := hellos3.get(r.RemoteAddr); hh != nil {
				out["tls"] = hh.report()
			}
		}
		if info != nil {
			if info.syn != nil {
				out["tcp"] = info.syn.report()
			}
			if info.hello != nil {
				out["tls"] = info.hello.report()
			}
			if r.ProtoMajor == 2 {
				if f := parseH2(info.rec.bytes()); f != nil {
					out["http2"] = f
				}
			}
		}
		out["ua"] = r.UserAgent()
		json.NewEncoder(w).Encode(out)
	})
	// /conn: this connection's SYN only, for the other 1ms.dog tools (ipqs, egress, check) reading it from the
	// browser: the address and its family, MSS, TTL and the initial TTL it rounds up to, window, window scale. Without
	// a SYN (not captured) the SYN's fields are left out, not null
	mux.HandleFunc("/conn", func(w http.ResponseWriter, r *http.Request) {
		info, _ := r.Context().Value(ctxKey{}).(*connInfo)
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Cache-Control", "no-store")
		w.Header().Set("Content-Type", "application/json")
		ip := hostOf(r.RemoteAddr)
		fam := 4
		if strings.Contains(ip, ":") {
			fam = 6
		}
		out := map[string]any{"ip": ip, "family": fam}
		altSvc(w, r)
		if info != nil && info.syn != nil {
			rep := info.syn.report()
			for _, k := range []string{"mss", "ttl", "initial_ttl", "window"} {
				out[k] = rep[k]
			}
			if info.syn.wscale >= 0 {
				out["wscale"] = info.syn.wscale
			}
		}
		json.NewEncoder(w).Encode(out)
	})
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		w.Write([]byte("the probe: the connection readings of the asking page (GET /fp). Nothing is logged.\n"))
	})
	return mux
}

// a connection's reads, kept up to max bytes, for the ClientHello and the HTTP/2 preface
type recorder struct {
	mu  sync.Mutex
	buf []byte
	max int
}

func (r *recorder) add(p []byte) {
	r.mu.Lock()
	if room := r.max - len(r.buf); room > 0 {
		if len(p) > room {
			p = p[:room]
		}
		r.buf = append(r.buf, p...)
	}
	r.mu.Unlock()
}
func (r *recorder) bytes() []byte {
	r.mu.Lock()
	defer r.mu.Unlock()
	return append([]byte(nil), r.buf...)
}

type teeConn struct {
	net.Conn
	rec *recorder
}

func (c *teeConn) Read(p []byte) (int, error) {
	n, err := c.Conn.Read(p)
	if n > 0 {
		c.rec.add(p[:n])
	}
	return n, err
}

// the decrypted connection, its first bytes recorded (HTTP/2 frames)
type plainConn struct {
	net.Conn
	info *connInfo
}

func (c *plainConn) Read(p []byte) (int, error) {
	n, err := c.Conn.Read(p)
	if n > 0 {
		c.info.rec.add(p[:n])
	}
	return n, err
}

// HTTP/1.1 connections, handed to net/http one by one
type chanListener struct {
	ch   chan net.Conn
	addr net.Addr
}

func newChanListener(a net.Addr) *chanListener {
	return &chanListener{ch: make(chan net.Conn, 64), addr: a}
}
func (l *chanListener) push(c net.Conn)           { l.ch <- c }
func (l *chanListener) Accept() (net.Conn, error) { return <-l.ch, nil }
func (l *chanListener) Close() error              { return nil }
func (l *chanListener) Addr() net.Addr            { return l.addr }

// over TCP, the offer of HTTP/3 on the same port, which a browser takes up on its next connections
func altSvc(w http.ResponseWriter, r *http.Request) {
	if r.ProtoMajor < 3 {
		w.Header().Set("Alt-Svc", `h3=":443"; ma=86400`)
	}
}

func hostOf(a string) string {
	h, _, err := net.SplitHostPort(a)
	if err != nil {
		return a
	}
	return h
}
func portOf(a string) int {
	_, p, _ := net.SplitHostPort(a)
	n := 0
	for _, ch := range p {
		n = n*10 + int(ch-'0')
	}
	if n == 0 {
		n = 443
	}
	return n
}

var _ = strings.TrimSpace

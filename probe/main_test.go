package main

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/pem"
	"math/big"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

func TestPortOfAndSynFilterNonstandard(t *testing.T) {
	for _, c := range []struct {
		addr string
		port int
	}{
		{":443", 443}, {":9443", 9443}, {"127.0.0.1:9443", 9443}, {"[::]:9443", 9443},
	} {
		if got := portOf(c.addr); got != c.port {
			t.Errorf("portOf(%q) = %d, want %d", c.addr, got, c.port)
		}
	}
	f := synFilter(9443)
	if !strings.Contains(f, "tcp dst port 9443") || !strings.Contains(f, "ip6[53]") {
		t.Errorf("synFilter(9443) = %q, want the port and IPv6 flags", f)
	}
}

// A certificate pair from disk is used as is, with no autocert and no acme-tls/1 ALPN; neither flag leaves the
// autocert path as it was; one flag alone is a mistake.
func TestTLSSetup(t *testing.T) {
	cert, key := testPair(t)
	cfg, err := tlsSetup("probe.dog.1msapp.com", cert, key, "", false)
	if err != nil {
		t.Fatal(err)
	}
	if len(cfg.Certificates) != 1 || cfg.GetCertificate != nil {
		t.Fatal("a file pair should be the only certificate source")
	}
	for _, p := range cfg.NextProtos {
		if p == "acme-tls/1" {
			t.Fatal("acme-tls/1 should be off with a file pair")
		}
	}
	cfg, err = tlsSetup("probe.1ms.dog", "", "", t.TempDir(), false)
	if err != nil {
		t.Fatal(err)
	}
	if cfg.GetCertificate == nil {
		t.Fatal("autocert should still be the default")
	}
	if !strings.Contains(strings.Join(cfg.NextProtos, ","), "acme-tls/1") {
		t.Fatal("autocert needs acme-tls/1")
	}
	if _, err := tlsSetup("probe.1ms.dog", cert, "", "", false); err == nil {
		t.Fatal("certfile without keyfile should be an error")
	}
	if _, err := tlsSetup("probe.1ms.dog", "", key, "", false); err == nil {
		t.Fatal("keyfile without certfile should be an error")
	}
}

func testPair(t *testing.T) (string, string) {
	t.Helper()
	k, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		t.Fatal(err)
	}
	tmpl := &x509.Certificate{SerialNumber: big.NewInt(1), Subject: pkix.Name{CommonName: "probe.dog.1msapp.com"},
		DNSNames: []string{"probe.dog.1msapp.com"}, NotBefore: time.Now().Add(-time.Hour), NotAfter: time.Now().Add(time.Hour)}
	der, err := x509.CreateCertificate(rand.Reader, tmpl, tmpl, &k.PublicKey, k)
	if err != nil {
		t.Fatal(err)
	}
	kb, err := x509.MarshalECPrivateKey(k)
	if err != nil {
		t.Fatal(err)
	}
	dir := t.TempDir()
	cert, key := filepath.Join(dir, "cert.pem"), filepath.Join(dir, "key.pem")
	if err := os.WriteFile(cert, pem.EncodeToMemory(&pem.Block{Type: "CERTIFICATE", Bytes: der}), 0600); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(key, pem.EncodeToMemory(&pem.Block{Type: "EC PRIVATE KEY", Bytes: kb}), 0600); err != nil {
		t.Fatal(err)
	}
	return cert, key
}

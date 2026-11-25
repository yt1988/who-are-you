package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func tokenFor(secret, scope string, exp int64) string {
	msg := fmt.Sprintf("v1|%d|nonce|%s", exp, scope)
	m := hmac.New(sha256.New, []byte(secret))
	m.Write([]byte(msg))
	return fmt.Sprintf("v1.%d.nonce.%s.%s", exp, scope, base64.RawURLEncoding.EncodeToString(m.Sum(nil)))
}

func authRequest(handler http.Handler, header string) *httptest.ResponseRecorder {
	r := httptest.NewRequest(http.MethodGet, "/fp", nil)
	if header != "" {
		r.Header.Set("Authorization", header)
	}
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, r)
	return w
}

func TestAuthDisabledAllows(t *testing.T) {
	ok := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(http.StatusOK) })
	if got := authRequest(authHandler("", ok), "").Code; got != http.StatusOK {
		t.Fatalf("no secret: got %d, want 200", got)
	}
}

func TestAuthDisabledPreflight(t *testing.T) {
	ok := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(http.StatusOK) })
	r := httptest.NewRequest(http.MethodOptions, "/fp", nil)
	w := httptest.NewRecorder()
	authHandler("", ok).ServeHTTP(w, r)
	if w.Code != http.StatusNoContent || w.Header().Get("Access-Control-Allow-Headers") != "Authorization" {
		t.Fatalf("disabled preflight: got %d %q", w.Code, w.Header().Get("Access-Control-Allow-Headers"))
	}
}

func TestAuthNoToken(t *testing.T) {
	ok := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(http.StatusOK) })
	w := authRequest(authHandler("secret", ok), "")
	if w.Code != http.StatusUnauthorized || !strings.Contains(w.Body.String(), `"no_token"`) {
		t.Fatalf("no token: got %d %s", w.Code, w.Body.String())
	}
}

func TestAuthExpired(t *testing.T) {
	ok := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(http.StatusOK) })
	w := authRequest(authHandler("secret", ok), "Bearer "+tokenFor("secret", "probe", time.Now().Add(-time.Second).Unix()))
	if w.Code != http.StatusUnauthorized || !strings.Contains(w.Body.String(), `"bad_token"`) {
		t.Fatalf("expired: got %d %s", w.Code, w.Body.String())
	}
}

func TestAuthScopeMismatch(t *testing.T) {
	ok := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(http.StatusOK) })
	w := authRequest(authHandler("secret", ok), "Bearer "+tokenFor("secret", "reach", time.Now().Add(time.Minute).Unix()))
	if w.Code != http.StatusUnauthorized || !strings.Contains(w.Body.String(), `"bad_token"`) {
		t.Fatalf("scope mismatch: got %d %s", w.Code, w.Body.String())
	}
}

func TestAuthScopeList(t *testing.T) {
	token, exp := tokenFor("secret", "probe,reach", time.Now().Add(time.Minute).Unix()), time.Now()
	if err := authError("secret", "Bearer "+token, "probe", exp); err != "" {
		t.Fatalf("probe in scope: got %q, want valid", err)
	}
	if err := authError("secret", "Bearer "+token, "ipv6", exp); err != "bad_token" {
		t.Fatalf("ipv6 not in scope: got %q, want bad_token", err)
	}
}

func TestAuthValid(t *testing.T) {
	ok := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(http.StatusOK) })
	w := authRequest(authHandler("secret", ok), "Bearer "+tokenFor("secret", "probe", time.Now().Add(time.Minute).Unix()))
	if w.Code != http.StatusOK {
		t.Fatalf("valid: got %d %s", w.Code, w.Body.String())
	}
}

func TestAuthPreflight(t *testing.T) {
	ok := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(http.StatusOK) })
	r := httptest.NewRequest(http.MethodOptions, "/fp", nil)
	w := httptest.NewRecorder()
	authHandler("secret", ok).ServeHTTP(w, r)
	if w.Code != http.StatusNoContent || w.Header().Get("Access-Control-Allow-Headers") != "Authorization" {
		t.Fatalf("preflight: got %d %q", w.Code, w.Header().Get("Access-Control-Allow-Headers"))
	}
}

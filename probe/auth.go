package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"
)

// Endpoint auth (platform/tool-contract.md, "端点鉴权"): the shell signs a short-lived
// `v1.<exp>.<nonce>.<scope>.<hmac>` token, the HMAC over `v1|exp|nonce|scope` with the scope exactly as it appears
// in the token, and the two probe routes accept it only when it is signed with this service's secret, unexpired and
// this service's capability (`probe`) is one of the comma-separated scope names. The token carries the scope, so its
// order is the signer's business and no candidate list is guessed here. No secret means no check: the self-hosted
// default and the rollout switch. The token is not issued yet, so with no secret the server behaves as before.
const probeScope = "probe"

func authHandler(secret string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// The page will send Authorization, which is not a simple header: answer the CORS preflight here even
		// before this service has a secret, so the page can be rolled out before the secrets are set.
		if r.Method == http.MethodOptions {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Authorization")
			w.Header().Set("Access-Control-Max-Age", "600")
			w.WriteHeader(http.StatusNoContent)
			return
		}
		if secret == "" {
			next.ServeHTTP(w, r)
			return
		}
		switch authError(secret, r.Header.Get("Authorization"), probeScope, time.Now()) {
		case "":
			next.ServeHTTP(w, r)
		case "no_token":
			unauthorized(w, "no_token")
		default:
			unauthorized(w, "bad_token")
		}
	})
}

// authError returns "" for a valid token, "no_token" when none was sent, and "bad_token" for anything else:
// wrong shape, version, expiry, signature or scope.
func authError(secret, header, own string, now time.Time) string {
	const prefix = "Bearer "
	if !strings.HasPrefix(header, prefix) || strings.TrimSpace(strings.TrimPrefix(header, prefix)) == "" {
		return "no_token"
	}
	token := strings.TrimSpace(strings.TrimPrefix(header, prefix))
	parts := strings.Split(token, ".")
	if len(parts) != 5 || parts[0] != "v1" || parts[2] == "" || parts[3] == "" {
		return "bad_token"
	}
	exp, err := strconv.ParseInt(parts[1], 10, 64)
	if err != nil || now.Unix() > exp {
		return "bad_token"
	}
	msg := fmt.Sprintf("v1|%s|%s|%s", parts[1], parts[2], parts[3])
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(msg))
	want := mac.Sum(nil)
	got, err := base64.RawURLEncoding.DecodeString(parts[4])
	if err != nil || !hmac.Equal(got, want) {
		return "bad_token"
	}
	if !scopeHas(parts[3], own) {
		return "bad_token"
	}
	return ""
}

// scopeHas reports whether one capability is in a comma-separated scope list, exactly as written.
func scopeHas(scope, want string) bool {
	for _, s := range strings.Split(scope, ",") {
		if strings.TrimSpace(s) == want {
			return true
		}
	}
	return false
}

func unauthorized(w http.ResponseWriter, code string) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("WWW-Authenticate", "Bearer")
	w.WriteHeader(http.StatusUnauthorized)
	io.WriteString(w, `{"error":"`+code+`"}`)
}

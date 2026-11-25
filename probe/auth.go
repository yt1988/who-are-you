package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"
)

// Endpoint auth (platform/tool-contract.md, "端点鉴权"): the shell signs a short-lived
// `v1.<exp>.<nonce>.<hmac>` token over `v1|exp|nonce|scope`, and the two probe routes accept it only when it is
// signed with this service's secret, unexpired and scoped to `probe`. No secret means no check: the self-hosted
// default and the rollout switch. The token is not issued yet, so with no secret the server behaves as before.
const probeScope = "probe"

func authHandler(secret string, next http.Handler) http.Handler {
	if secret == "" {
		return next
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// The page will send Authorization, which is not a simple header: answer the CORS preflight here.
		if r.Method == http.MethodOptions {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Authorization")
			w.Header().Set("Access-Control-Max-Age", "600")
			w.WriteHeader(http.StatusNoContent)
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
func authError(secret, header, scope string, now time.Time) string {
	const prefix = "Bearer "
	if !strings.HasPrefix(header, prefix) || strings.TrimSpace(strings.TrimPrefix(header, prefix)) == "" {
		return "no_token"
	}
	token := strings.TrimSpace(strings.TrimPrefix(header, prefix))
	parts := strings.Split(token, ".")
	if len(parts) != 4 || parts[0] != "v1" || parts[2] == "" {
		return "bad_token"
	}
	exp, err := strconv.ParseInt(parts[1], 10, 64)
	if err != nil || now.Unix() > exp {
		return "bad_token"
	}
	if !strings.Contains(","+scope+",", ","+probeScope+",") {
		return "bad_token"
	}
	msg := fmt.Sprintf("v1|%s|%s|%s", parts[1], parts[2], scope)
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(msg))
	want := mac.Sum(nil)
	got, err := hex.DecodeString(parts[3])
	if err != nil {
		got, err = base64.RawURLEncoding.DecodeString(parts[3])
	}
	if err != nil || !hmac.Equal(got, want) {
		return "bad_token"
	}
	return ""
}

func unauthorized(w http.ResponseWriter, code string) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("WWW-Authenticate", "Bearer")
	w.WriteHeader(http.StatusUnauthorized)
	io.WriteString(w, `{"error":"`+code+`"}`)
}

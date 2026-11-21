package main

import "testing"

// A Windows SYN keeps the same option layout over IPv4 and IPv6; only the hop limit differs, and over IPv6 that is
// the router's RA value (often 64). The layout decides, not the TTL (#138).
func TestOSOfByOptionLayout(t *testing.T) {
	for _, c := range []struct{ opts, want string }{
		{"2-1-3-1-1-4", "windows"},
		{"2-1-3-1-1-8-4", "apple"},
		{"2-4-8-1-3", "linux"},
		{"2-1-3-1-1-6", "other"},
		{"", "other"},
	} {
		if got := osOf(c.opts); got != c.want {
			t.Errorf("osOf(%q) = %q, want %q", c.opts, got, c.want)
		}
	}
}

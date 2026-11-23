# The probe

What a browser's own connection gives away, read where Cloudflare can't: the TCP SYN (initial TTL, window, options,
MSS: the OS family and a tunnel's MTU, JA4T), the TLS ClientHello (JA3, JA4), the HTTP/2 preface (the Akamai
fingerprint) and, over HTTP/3, the QUIC Initial (QUIC JA4). The page asks `GET https://<probe-domain>/fp` and gets its
own connection's readings back as JSON. Nothing is logged or kept.

Other tools may read it too, so these names stay as they are: `/fp` ip, tcp.os, tcp.mtu, tcp.mss, tcp.initial_ttl;
`/conn` ip, family, mss, ttl, initial_ttl, window, wscale (a flat object, with CORS). A field the probe couldn't read
is left out, never null.

- DNS: the probe's name has A (and AAAA) records straight to the server, not proxied: the browser has to reach this
  machine itself, or there is no SYN of its own to read.
- Certificate: by default Let's Encrypt through autocert (TLS-ALPN-01 on 443), cached in the directory `-certs` names.
  On a host whose 80/443 are blocked (or on a nonstandard port), give `-certfile` and `-keyfile`: the pair is used as
  is and autocert is off. Both flags go together; `-domain` is not enforced for a file pair (a wildcard renewed
  elsewhere, e.g. with DNS-01).
- Logs: only startup and errors. net/http, HTTP/2 and quic-go would write client addresses on connection errors, so
  their loggers are discarded (main.go, quic.go); after any change to the servers, check `journalctl` for addresses.

Build and install, from nothing: AGENTS.md, "The probe, from nothing". In short, on the host:

```
go build -o /opt/<app>/probe . && systemctl restart <app>
```

`1ms-who.service` is the unit one deployment uses (its paths and name are that deployment's): a dynamic user with
only the capabilities it needs (port 443, the raw socket for the SYN capture). The SYN capture's BPF filter uses the
port from `-addr`, so `-addr :9443` captures SYNs to 9443 (with `-iface` or the default route's interface). Testing by
IP: `probe -dev -addr :8443` serves a self-signed certificate.

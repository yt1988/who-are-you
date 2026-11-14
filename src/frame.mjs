// The cross-site frame page: served on this tool's second domain (cross.1ms.one), framed by its own pages. It lives
// apart from the Worker so it can be tested without Cloudflare's runtime, which the Worker's other imports need.

// The cross-site frame (2026-11-14): a second registrable domain (cross.1ms.one, the owner's) so the page can finally
// ask the one question a first-party page can't — whether a site on another domain can still recognise the visitor.
// It stores nothing about anyone: one short-lived cookie of its own, a localStorage tag, and the answers back over
// postMessage. Served by this Worker only on that host; every other host gets the usual 404 from the end of fetch().
const FRAME = `<!doctype html><meta charset="utf-8"><title>3p</title><body><script>
(function(){var r={};
var put=function(n,a){try{document.cookie=n+"=1; "+a+"; Max-Age=30; Path=/"}catch(e){}return ("; "+document.cookie).indexOf("; "+n+"=")>=0};
try{r.c3p=put("w3p","SameSite=None; Secure")}catch(e){r.c3p=false}
try{r.chips=put("w3pp","SameSite=None; Secure; Partitioned")}catch(e){r.chips=false}
try{localStorage.setItem("w3p","1");r.ls=localStorage.getItem("w3p")==="1"}catch(e){r.ls=false}
if(window.parent!==window)window.parent.postMessage(r,"*")})();
</script>`;
export function framePage(url) {
  if (url.pathname !== "/" && url.pathname !== "/f") return new Response(null, { status: 404 });
  return new Response(FRAME, {
    headers: {
      "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff",
      // framable by this tool alone (its pages, every language), not by anyone else
      "Content-Security-Policy": "default-src 'none'; script-src 'unsafe-inline'; frame-ancestors https://*.1ms.dog https://1ms.dog",
      "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex",
    },
  });
}

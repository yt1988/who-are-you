// who-are-you Worker. Pages and assets are static files (public/, served without running this script); this script
// answers
//   GET /api/me   what the server learns from the request alone: the address, Cloudflare's geolocation and network
//                 data for it, the TLS and HTTP details, the headers the browser sent, the address's reverse DNS and
//                 the server's clock.
//   GET [/<lang>]/r/<code>  a shared portrait: its language's page with the result in the title and preview (src/share.mjs)
//   POST /api/seen  one check's trait values and results, counted (src/tally.mjs) unless "add" is false; answers how many
//                 checks had each value. Only from this site's own pages.
//   GET /api/stats  every check's results per day, all visitors together
// No address and no request is logged; the counter keeps numbers per value, no record of a single visit. Every other
// path is a bare 404 (the 1ms.dog shell shows its own page for those).
import { decode, findings, tier, SLUG, parsePath } from "./share.mjs";
import { Tally } from "./tally.mjs";
import { regionName } from "./regions.mjs";
import { framePage } from "./frame.mjs";
export { Tally };
import en from "./i18n/en.mjs";
import zhCN from "./i18n/zh-CN.mjs";
import zhTW from "./i18n/zh-TW.mjs";
import ja from "./i18n/ja.mjs";
import ko from "./i18n/ko.mjs";
import es from "./i18n/es.mjs";
import fr from "./i18n/fr.mjs";
import de from "./i18n/de.mjs";
import pt from "./i18n/pt.mjs";
import ru from "./i18n/ru.mjs";

const json = (body, more) => new Response(JSON.stringify(body), {
  headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...more },
});

// The high-entropy Client Hints the page asks the browser to send on its next request (a script can rewrite what
// navigator says, not what the request carries): asked for on /api/me, read on /api/hints
const HINTS = ["Sec-CH-UA-Full-Version-List", "Sec-CH-UA-Arch", "Sec-CH-UA-Bitness", "Sec-CH-UA-Model", "Sec-CH-UA-Platform-Version",
  "Sec-CH-UA-WoW64", "Sec-CH-UA-Form-Factors"].join(", ");

// request.cf fields worth showing (all of them are on every Cloudflare plan)
const CF = ["country", "city", "region", "regionCode", "postalCode", "latitude", "longitude", "timezone", "continent", "isEUCountry",
  "asn", "asOrganization", "colo", "httpProtocol", "tlsVersion", "tlsCipher", "clientTcpRtt", "tlsClientHelloLength", "tlsClientExtensionsSha1"];
// headers the browser sent; Cloudflare's own (cf-*, x-forwarded-*, cdn-loop…) and cookies are left out
const SKIP = /^(cf-|x-forwarded-|x-real-ip$|cdn-loop$|cookie$|host$|connection$|true-client-ip$)/;

// the address's PTR record, over DNS over HTTPS; null when there is none or it takes too long
async function ptr(ip) {
  let name;
  if (ip.includes(":")) {
    const parts = ip.split("::"), head = parts[0] ? parts[0].split(":") : [], tail = parts[1] ? parts[1].split(":") : [];
    const groups = parts.length > 1 ? [...head, ...Array(8 - head.length - tail.length).fill("0"), ...tail] : head;
    name = groups.map(g => g.padStart(4, "0")).join("").split("").reverse().join(".") + ".ip6.arpa";
  } else name = ip.split(".").reverse().join(".") + ".in-addr.arpa";
  try {
    const r = await fetch(`https://cloudflare-dns.com/dns-query?name=${name}&type=PTR`, { headers: { Accept: "application/dns-json" }, signal: AbortSignal.timeout(1500) });
    const a = ((await r.json()).Answer || []).find(x => x.type === 12);
    return a ? a.data.replace(/\.$/, "") : null;
  } catch (e) { return null; }
}

// Tor's public exit list (check.torproject.org), kept an hour in the isolate and at the edge: the address is matched
// here, so a visitor's address never goes to the Tor Project. The bulk list has IPv4 addresses only.
let TOR = { at: 0, set: null };
async function torExits(request) {
  if (TOR.set && Date.now() - TOR.at < 3600e3) return TOR.set;
  const cache = caches.default, key = new Request(new URL("/api/tor-list", request.url));
  let text = null;
  const hit = await cache.match(key);
  if (hit) text = await hit.text();
  if (!text) {
    const r = await fetch("https://check.torproject.org/torbulkexitlist", { signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw new Error("tor list " + r.status);
    text = await r.text();
    await cache.put(key, new Response(text, { headers: { "Cache-Control": "public, max-age=3600" } }));
  }
  TOR = { at: Date.now(), set: new Set(text.split("\n").map(s => s.trim()).filter(Boolean)) };
  return TOR.set;
}

// A shared portrait, [/<lang>]/r/<code>[?lang=xx]: the language's page with its own title, description and preview
// image, so a link pasted into a chat previews the result. The page script reads the portrait from the path and draws
// it. The language: ?lang, else the path's folder, else the sharer's (older links have no folder).
const I18N = { en, "zh-CN": zhCN, "zh-TW": zhTW, ja, ko, es, fr, de, pt, ru };
const fill = (s, v) => { for (const k in v) s = s.split("{" + k + "}").join(v[k]); return s; };
// a count's own form in a language: k_one, k_few, k_many as Intl.PluralRules says, k_other otherwise (as the page does)
const plural = (d, lang, k, n) => { let c = "other"; try { c = new Intl.PluralRules(lang).select(n); } catch (e) {} return d[k + "_" + c] ?? d[k + "_other"]; };
const attr = (name, value) => ({ element(el) { el.setAttribute(name, value); } });
async function result(request, env, { code, lang: dir }, url) {
  const P = decode(code);
  if (!P) return new Response(null, { status: 404 });
  const q = url.searchParams.get("lang");
  const lang = I18N[q] ? q : dir || (I18N[P.l] ? P.l : "en"), d = I18N[lang], slug = SLUG[lang];
  const page = await env.ASSETS.fetch(new URL("/" + (slug ? slug + "/" : ""), url));
  if (!page.ok) return page;
  let nat = P.nat || "";
  if (nat) nat = regionName(nat, lang);
  const n = findings(P);
  const title = n ? fill(plural(d, lang, "r_title", n), { n }) : d.r_title_clean;
  const desc = fill(d.r_desc, { nat: nat || "?", os: P.os || "?", browser: P.browser || "?" });
  const img = `${url.origin}/og/r${tier(n)}-${lang.toLowerCase()}.png`;
  const res = new HTMLRewriter()
    .on("html", { element(el) { el.removeAttribute("data-root"); } })   // no redirect to a saved language: it would drop the portrait
    .on("title", { element(el) { el.setInnerContent(title + " · " + d.app_name); } })
    .on('meta[name="description"]', attr("content", desc))
    .on('meta[name="robots"]', attr("content", "noindex, follow"))
    .on('meta[property="og:title"]', attr("content", title))
    .on('meta[name="twitter:title"]', attr("content", title))
    .on('meta[property="og:description"]', attr("content", desc))
    .on('meta[name="twitter:description"]', attr("content", desc))
    .on('meta[property="og:url"]', attr("content", url.origin + url.pathname))
    .on('meta[property="og:image"]', attr("content", img))
    .on('meta[name="twitter:image"]', attr("content", img))
    .transform(page);
  const h = new Headers(res.headers);
  // the page names its stylesheet and scripts by content hash, and the next deploy deletes them: a cached share page
  // would then ask for a file that is gone (1ms.dog#112), so it revalidates like every other page
  h.set("Cache-Control", "no-cache");
  h.delete("ETag");
  return new Response(res.body, { status: 200, headers: h });
}

// the counter: counts only from this site's own pages (the Origin a browser sends with a POST), the stats for anyone
async function tally(request, env, url) {
  const stub = env.TALLY.get(env.TALLY.idFromName("all"));
  if (url.pathname === "/api/stats") {
    if (request.method !== "GET") return new Response(null, { status: 405, headers: { Allow: "GET" } });
    // kept a minute at the edge: the main page asks on every visit, the counter needn't answer each one
    const key = new Request(url.origin + "/api/stats"), cache = caches.default, hit = await cache.match(key);
    if (hit) return hit;
    const r = await stub.fetch("https://tally/stats");
    const res = new Response(await r.text(), { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=60", "Access-Control-Allow-Origin": "*" } });
    await cache.put(key, res.clone());
    return res;
  }
  if (request.method !== "POST") return new Response(null, { status: 405, headers: { Allow: "POST" } });
  if (request.headers.get("Origin") !== url.origin) return new Response(null, { status: 403 });
  const body = await request.text();
  if (body.length > 4000) return new Response(null, { status: 413 });
  const r = await stub.fetch("https://tally/seen", { method: "POST", body });
  return new Response(r.body, { status: r.status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
}

// The cache as an ID (no cookie, no storage): the first answer carries a random ID as its ETag and asks to be
// checked every time; the browser then sends it back in If-None-Match on its own, and is told it still holds. Nothing
// is kept here: the ID exists only in that browser's HTTP cache, and clearing the cache ends it.
function etag(request) {
  const h = { "Cache-Control": "private, no-cache", "Content-Type": "text/plain", "X-Content-Type-Options": "nosniff" };
  const sent = (request.headers.get("If-None-Match") || "").replace(/^W\//, "").replace(/"/g, "");
  if (/^[0-9a-f]{16}$/.test(sent)) return new Response(null, { status: 304, headers: { ...h, ETag: `"${sent}"`, "X-Etag-Seen": "1" } });
  const id = [...crypto.getRandomValues(new Uint8Array(8))].map(b => b.toString(16).padStart(2, "0")).join("");
  return new Response(id, { headers: { ...h, ETag: `"${id}"`, "X-Etag-Seen": "0" } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === "cross.1ms.one") return framePage(url);
    const r = parsePath(url.pathname);
    if (r && request.method === "GET") return result(request, env, r, url);
    if (url.pathname === "/api/seen" || url.pathname === "/api/stats") return tally(request, env, url);
    if (url.pathname === "/api/etag") return etag(request);
    // the high-entropy Client Hints of a request the browser made after reading Accept-CH on /api/me's answer
    if (url.pathname === "/api/hints") {
      if (request.method !== "GET") return new Response(null, { status: 405, headers: { Allow: "GET" } });
      const hints = {};
      for (const [k, v] of request.headers) if (!SKIP.test(k)) hints[k] = v;
      return json({ h: hints }, { "Accept-CH": HINTS });
    }
    // whether this request's address is a public Tor exit node (the list is IPv4 only)
    if (url.pathname === "/api/tor") {
      if (request.method !== "GET") return new Response(null, { status: 405, headers: { Allow: "GET" } });
      const ip = request.headers.get("CF-Connecting-IP") || "";
      if (!/^\d+\.\d+\.\d+\.\d+$/.test(ip)) return json({ ok: false, v6: ip.includes(":") });
      try { return json({ ok: true, tor: (await torExits(request)).has(ip) }); }
      catch (e) { return json({ ok: false }); }
    }
    if (url.pathname !== "/api/me") return new Response(null, { status: 404 });
    if (request.method !== "GET") return new Response(null, { status: 405, headers: { Allow: "GET" } });
    const at = Date.now();
    const ip = request.headers.get("CF-Connecting-IP") || "";
    const cf = {};
    for (const k of CF) if (request.cf && request.cf[k] != null && request.cf[k] !== "") cf[k] = request.cf[k];
    const h = {};
    for (const [k, v] of request.headers) if (!SKIP.test(k)) h[k] = v;
    return json({ ip, v: ip.includes(":") ? 6 : 4, cf, h, ptr: ip ? await ptr(ip) : null, at }, { "Accept-CH": HINTS });
  },
};

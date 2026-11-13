#!/usr/bin/env node
// Tap targets at phone width: serves public/ (with a stand-in for /api/me and Cloudflare's trace) and opens every
// language's page at 390x844 with touch emulation, then measures every control the visitor can tap. WCAG 2.2's
// minimum (2.5.8) is 24 by 24 CSS px; a control smaller than that in either direction is reported, except a link
// inline in a sentence, which the same rule exempts. The check rows' "fix" and "check again" buttons only show when a
// check gives you away, so the topic pages are scanned too: each one focuses its check and shows them.
// Usage: node scripts/touch.mjs [lang]
import { createServer } from "node:http";
import { readFile, access } from "node:fs/promises";
import { extname } from "node:path";
import puppeteer from "puppeteer-core";
import { LANGS } from "./build.mjs";
import { PAGES } from "../src/pages.mjs";

const pub = new URL("../public/", import.meta.url);
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".ico": "image/x-icon" };
const ME = { ip: "203.0.113.7", v: 4, ptr: null, h: { "user-agent": "touch", "accept-language": "en-US" },
  cf: { country: "JP", city: "Tokyo", timezone: "Asia/Tokyo", asn: 2516, asOrganization: "KDDI Corporation", colo: "NRT", httpProtocol: "HTTP/2", clientTcpRtt: 12 } };
const TYPES_OK = TYPES;
const handles = async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (path === "/api/me") { res.writeHead(200, { "content-type": "application/json" }); return res.end(JSON.stringify({ ...ME, at: Date.now() })); }
  if (path === "/api/stats") { res.writeHead(200, { "content-type": "application/json" }); return res.end(JSON.stringify({ total: 0, days: {}, top: {} })); }
  if (path === "/cdn-cgi/trace") { res.writeHead(200, { "content-type": "text/plain" }); return res.end("ip=203.0.113.7\nkex=X25519MLKEM768\nsni=plaintext\nwarp=off\ngateway=off\n"); }
  if (path.startsWith("/api/")) { res.writeHead(200, { "content-type": "application/json" }); return res.end("{}"); }
  try {
    const body = await readFile(new URL("." + (path.endsWith("/") ? path + "index.html" : path), pub));
    res.writeHead(200, { "content-type": TYPES_OK[extname(path)] || (path.endsWith("/") ? TYPES_OK[".html"] : "application/octet-stream") }); res.end(body);
  } catch (e) { res.writeHead(404); res.end(); }
};

const CANDIDATES = [process.env.CHROME_PATH, "C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome", "/usr/bin/chromium-browser", "/usr/bin/chromium", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"].filter(Boolean);
let exe = null;
for (const c of CANDIDATES) { try { await access(c); exe = c; break; } catch (e) {} }
if (!exe) { console.error("No Chrome or Edge found; set CHROME_PATH."); process.exit(1); }

const only = process.argv[2];
const langs = LANGS.filter(([l]) => !only || l === only);
const topics = Object.keys(PAGES).map(s => [s + "/", s]);

const server = createServer(handles);
await new Promise(r => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: ["--no-sandbox",
  // nothing else answers: the probes fail at once instead of holding the run open
  "--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1"] });

// every control the page offers, measured in CSS pixels; a link inline in a sentence is exempt (WCAG 2.5.8)
const scan = () => {
  const SEL = "a, button, summary, input, select, textarea, [role=button], [tabindex]:not([tabindex='-1'])";
  const out = [], seen = new Set();
  for (const el of document.querySelectorAll(SEL)) {
    if (seen.has(el) || el.closest("dialog:not([open])")) continue;
    seen.add(el);
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    if (cs.visibility === "hidden" || cs.display === "none" || r.width === 0 || r.height === 0) continue;
    if (r.bottom < 0 || r.top > document.documentElement.scrollHeight) continue;   // laid out, but no box on the page
    // a text run is not a control: a link — or a focusable span that opens a note — inside a sentence is the rule's
    // own exception, and the page sets those to display: inline
    if (cs.display === "inline") continue;
    if (r.width >= 24 && r.height >= 24) continue;
    const text = (el.getAttribute("aria-label") || el.innerText || el.value || "").replace(/\s+/g, " ").trim().slice(0, 30);
    out.push({ tag: el.tagName.toLowerCase(), cls: (el.className || "").toString().slice(0, 40), text, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 });
  }
  return out;
};

let bad = 0;
for (const [lang, slug] of langs) {
  // the main page in every language (the longest ones rewrap first); the topic pages in Chinese, whose focus panel
  // carries the row-level controls at their longest labels
  const pages = lang === "zh-CN" ? [["", "the portrait"], ...topics] : [["", "the portrait"]];
  for (const [path, what] of pages) {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", e => errors.push(String(e.message || e)));
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto(`${base}/${slug ? slug + "/" : ""}${path}`);
    await page.waitForFunction(() => !document.querySelector("#rerun") || !document.querySelector("#rerun").disabled, { timeout: 30000 }).catch(() => {});
    // the topic pages hold a focus panel with its own "check again"; the main page's rows open their fix with a tap
    await page.evaluate(() => { for (const b of document.querySelectorAll(".ck-fix, .ck-rp")) b.hidden = false; });
    await new Promise(r => setTimeout(r, 150));
    const small = await page.evaluate(scan);
    for (const e of errors) { console.log(`  ✖ ${lang}/${slug || "(main)"}/ ${what}: script error ${e}`); bad++; }
    if (small.length) {
      bad += small.length;
      console.log(`${lang}${slug ? "/" + slug : ""} ${path || "(main)"} — ${what}: ${small.length}`);
      for (const s of small) console.log(`  ✖ ${s.w}×${s.h} ${s.tag}.${s.cls} "${s.text}"`);
    }
    await page.close();
  }
}
await browser.close();
server.close();
console.log(bad ? `\n${bad} ${bad === 1 ? "problem" : "problems"}` : "every tap target is at least 24 by 24 CSS px");
process.exit(bad ? 1 : 0);

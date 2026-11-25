#!/usr/bin/env node
// Smoke test in a real browser: serves public/ (with a stand-in for /api/me and Cloudflare's trace), opens every
// language page in headless Chrome and checks that the page script ran through: no script errors, every sniffer row
// filled, every blank of the portrait filled with no placeholder or "undefined" left, every check judged. Then it
// shares the English portrait (link and image card) and opens the link: the link must carry no address, city,
// network or fingerprint, and the shared view must show the portrait with the city and fingerprint masked. Last, every
// topic page in every language: its focus panel must get a verdict and fill every row.
// Requests to other sites (the exit and DNS probes, analytics) are cut off at once, so those rows read "couldn't read"
// right away instead of after their timeouts; a row must not stay "…". Several pages run at a time; the topic pages
// are a sample.
// Usage: node scripts/smoke.mjs            (finds Chrome or Edge; CHROME_PATH=… to pick one)
//        node scripts/smoke.mjs quick      the language pages and the share only (about 20 s), for a small change
import { createServer } from "node:http";
import { readFile, access } from "node:fs/promises";
import { extname } from "node:path";
import puppeteer from "puppeteer-core";
import { LANGS } from "./build.mjs";
import { SNIFFERS, BLANKS, CHECKS, PROTO } from "../src/sniffers.mjs";
import { decode, SLUG, parsePath } from "../src/share.mjs";
import { PAGES } from "../src/pages.mjs";

const pub = new URL("../public/", import.meta.url);
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".ico": "image/x-icon" };
const ME = { ip: "203.0.113.7", v: 4, ptr: null, h: { "user-agent": "smoke", "accept-language": "en-US" },
  cf: { country: "JP", city: "Tokyo", region: "Tokyo", latitude: "35.69", longitude: "139.69", timezone: "Asia/Tokyo", asn: 2516, asOrganization: "KDDI Corporation",
    colo: "NRT", httpProtocol: "HTTP/2", tlsVersion: "TLSv1.3", tlsCipher: "AEAD-AES128-GCM-SHA256", clientTcpRtt: 12 } };

const handle = async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (path === "/api/stats") { const d = new Date().toISOString().slice(0, 10); res.writeHead(200, { "content-type": "application/json" }); return res.end(JSON.stringify({ total: 5000, days: { [d]: { tz: { ok: 600, bad: 400 }, split: { ok: 500, warn: 500 }, dns: { ok: 800, bad: 200 } } }, top: { os: [["Windows 11", 2000]], tz: [["Asia/Shanghai", 1500]] } })); }
  if (path === "/api/me") { res.writeHead(200, { "content-type": "application/json" }); return res.end(JSON.stringify({ ...ME, at: Date.now() })); }
  // a shared portrait: the Worker serves its language's page (here without the preview tags it adds)
  const r = parsePath(path);
  if (r) {
    const P = decode(r.code), slug = P && SLUG[r.lang || P.l];
    res.writeHead(P ? 200 : 404, { "content-type": TYPES[".html"] });
    return res.end(P ? await readFile(new URL((slug ? slug + "/" : "") + "index.html", pub)) : "");
  }
  if (path === "/cdn-cgi/trace") { res.writeHead(200, { "content-type": "text/plain" }); return res.end("ip=203.0.113.7\nkex=X25519MLKEM768\nsni=plaintext\nwarp=off\ngateway=off\n"); }
  try {
    let body = await readFile(new URL("." + (path.endsWith("/") ? path + "index.html" : path), pub));
    // a test page can opt into deploy anchors; the normal pages stay on the no-meta fallback
    if ((path.endsWith("/") || extname(path) === ".html") && new URL(req.url, "http://x").searchParams.has("anchors"))
      body = Buffer.from(String(body).replace("</head>", '<meta name="ms-anchors" content="cn=https://cn.test/conn;intl=https://intl.test/conn"></head>'));
    res.writeHead(200, { "content-type": TYPES[extname(path)] || (path.endsWith("/") ? TYPES[".html"] : "application/octet-stream") }); res.end(body);
  } catch (e) { res.writeHead(404); res.end(); }
};
// one server per page running at a time, each on its own port: Chrome keeps six connections per host and port, and six
// pages sharing one would wait on each other
const N = 6, servers = [];
for (let i = 0; i < N; i++) { const s = createServer(handle); await new Promise(r => s.listen(0, "127.0.0.1", r)); servers.push(s); }
const bases = servers.map(s => `http://127.0.0.1:${s.address().port}`), base = bases[0];

const CANDIDATES = [process.env.CHROME_PATH, "C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome", "/usr/bin/chromium-browser", "/usr/bin/chromium", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"].filter(Boolean);
let exe = null;
for (const c of CANDIDATES) { try { await access(c); exe = c; break; } catch (e) {} }
if (!exe) { console.error("No Chrome or Edge found; set CHROME_PATH."); process.exit(1); }
const browserArgs = ["--no-sandbox", "--use-fake-ui-for-media-stream",
  // pages run side by side: none is throttled for being in the background
  "--disable-background-timer-throttling", "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows",
  // only these servers answer: every other name fails to resolve at once, as a blocked network would (in the browser, not
  // through request interception, which stalls with several pages at a time)
  "--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1"];
let browser = await puppeteer.launch({ executablePath: exe, headless: true, args: browserArgs });
// after a group of pages the renderer can be left fat enough to crash a later one: start a clean browser for the
// language and topic groups rather than make the tests depend on what ran before them
async function freshBrowser() { await browser.close(); browser = await puppeteer.launch({ executablePath: exe, headless: true, args: browserArgs }); }

const failures = [];
const fail = (where, what) => { failures.push(where + ": " + what); console.log("  ✖ " + where + ": " + what); };
const quick = process.argv.includes("quick");
// a few at a time: each page spends most of its run waiting
// (each runner on its own server: fn gets the item and that server's address)
async function pool(items, n, fn) { const q = [...items]; await Promise.all(Array.from({ length: n }, async (_, i) => { while (q.length) await fn(q.shift(), bases[i]); })); }
// before: a function run in the page before any of its own scripts (a stand-in for a reading a report is about)
async function open(url, before, arg) {
  const page = await browser.newPage(), errors = [];
  page.on("pageerror", e => errors.push(String(e.message || e)));
  page.on("console", m => { if (m.type() === "error" && !/Failed to load resource|ERR_NAME_NOT_RESOLVED/.test(m.text())) errors.push("console: " + m.text()); });
  await page.setViewport({ width: 1280, height: 900 });
  if (before) await page.evaluateOnNewDocument(before, arg);
  await page.goto(url, { waitUntil: "load" });
  return { page, errors };
}

// WebGL blocked or stood in for by an extension: getContext("webgl") answers an object that is not a context. The GPU
// rows must say so and the rest of the run must finish (17 front-end errors, `t.getExtension is not a function`)
console.log("webgl: a stand-in context");
{
  const { page, errors } = await open(`${base}/?lang=en`, () => {
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
      return /^(experimental-)?webgl/.test(String(type)) ? {} : orig.call(this, type, ...rest);
    };
  });
  await page.waitForFunction(() => !document.querySelector("#rerun").disabled, { timeout: 30000 }).catch(() => fail("webgl", "the run never finished"));
  const r = await page.evaluate(() => ({
    rows: Object.fromEntries(["gpu", "webgl", "glx", "glimg"].map(id => [id, (document.querySelector(`.pr[data-s="${id}"] .pa`) || {}).textContent || ""])),
    waiting: document.querySelectorAll(".bl.wait").length,
  }));
  for (const e of errors) fail("webgl", "script error: " + e);
  for (const [id, v] of Object.entries(r.rows)) if (!v.trim() || v === "…") fail("webgl", `the ${id} row is empty ("${v}")`);
  if (r.waiting) fail("webgl", `${r.waiting} blanks still waiting`);
  await page.close();
}

// Two measuring points for a visitor in China: the domestic probe's device reading and the Tokyo probe's cross-border
// reading, with an MSS difference called out, and one side failing leaving the other. The probes and /api/me are
// answered by the test (the browser's host rules otherwise cut every outside name).
console.log("two probes: domestic and cross-border");
{
  const page = await browser.newPage(), errors = [];
  page.on("pageerror", e => errors.push(String(e.message || e)));
  await page.setViewport({ width: 1280, height: 900 });
  await page.setRequestInterception(true);
  let nearFail = false, nearCalls = 0;
  const json = (body) => ({ status: 200, contentType: "application/json", headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(body) });
  const tcp = (mss, mtu) => ({ proto: "HTTP/2.0", ip: "203.0.113.7", tcp: { os: "windows", mss, mtu, ja4t: `65535_2-1-3-1-1-4_${mss}_8`, initial_ttl: 64, hops: 0, window: 65535 }, http2: { pseudo: "m,a,s,p" }, tls: { ja4: "t13d1516h2" } });
  page.on("request", req => {
    const u = req.url();
    if (u.includes("/api/me")) return req.respond(json({ ...ME, cf: { ...ME.cf, country: "CN", city: "Shanghai" }, at: Date.now() }));
    if (u.includes("intl.test/fp?h3")) return req.respond({ status: 404, body: "" });
    if (u.includes("intl.test/fp")) return req.respond(json(tcp(1400, 1440)));
    if (u.includes("cn.test/fp")) { nearCalls++; return req.respond(nearFail ? { status: 500, body: "no" } : json(tcp(1460, 1500))); }
    req.continue();
  });
  await page.goto(`${base}/?lang=en&anchors=test`, { waitUntil: "load" });
  await page.waitForFunction(() => !document.querySelector("#rerun").disabled, { timeout: 30000 }).catch(() => fail("two probes", "the run never finished"));
  let r = await page.evaluate(() => ({
    visible: !document.querySelector("#probe2").hidden,
    near: [...document.querySelectorAll("#p2Near dd")].map(x => x.textContent.trim()),
    far: [...document.querySelectorAll("#p2Far dd")].map(x => x.textContent.trim()),
    nearMss: ((document.querySelector('#p2Near [data-k="mss"]') || {}).textContent || "").trim(),
    farMss: ((document.querySelector('#p2Far [data-k="mss"]') || {}).textContent || "").trim(),
    diff: (document.querySelector("#p2Diff") || {}).textContent || "",
    na: (document.querySelector("#p2Na") || {}).textContent || "",
    first: !document.querySelector("#p2first").hidden && !!document.querySelector("#p2firstBody").textContent.trim(),
    firstText: (document.querySelector("#p2firstBody") || {}).textContent || "",
  }));
  for (const e of errors) fail("two probes", "script error: " + e);
  if (!r.visible) fail("two probes", "the card is hidden for a visitor in China");
  if (r.nearMss !== "1460" || r.farMss !== "1400") fail("two probes", `MSS columns read ${r.nearMss} / ${r.farMss}`);
  if (!/1400/.test(r.diff)) fail("two probes", "the MSS difference is not called out: " + r.diff);
  if (!r.first || !/TTL|1400/.test(r.firstText)) fail("two probes", "the first-screen conclusion is missing: " + r.firstText);
  if (!nearCalls) fail("two probes", "the domestic probe was not asked");
  nearFail = true;
  await page.reload({ waitUntil: "load" });
  await page.waitForFunction(() => !document.querySelector("#rerun").disabled, { timeout: 30000 }).catch(() => fail("two probes", "the fallback run never finished"));
  r = await page.evaluate(() => ({ visible: !document.querySelector("#probe2").hidden, na: (document.querySelector("#p2Na") || {}).textContent || "", far: [...document.querySelectorAll("#p2Far dd")].map(x => x.textContent.trim()), farMss: ((document.querySelector('#p2Far [data-k="mss"]') || {}).textContent || "").trim(), firstText: (document.querySelector("#p2firstBody") || {}).textContent || "" }));
  if (!r.visible || !/domestic reading is unavailable/.test(r.na)) fail("two probes", "a failed domestic probe should say so: " + r.na);
  if (!/domestic reading is unavailable/.test(r.firstText)) fail("two probes", "the first screen should say the domestic reading is unavailable: " + r.firstText);
  if (r.farMss !== "1400") fail("two probes", "the cross-border reading should remain: " + r.farMss);
  await page.close();
}

// Intro fields settle independently of a deliberately slow, unrelated sniffer.
// Voices must still block nationality; returnVisit must run only once per completed measurement.
console.log("progressive intro");
{
  const { page, errors } = await open(`${base}/?lang=en`, () => {
    const store = Storage.prototype.setItem;
    window.__lastWrites = 0;
    Storage.prototype.setItem = function (key, value) { if (key === "who:last") window.__lastWrites++; return store.call(this, key, value); };
    navigator.getBattery = () => new Promise(resolve => { window.__releaseBattery = () => resolve(null); });
    let ready = false, changed;
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: {
      getVoices: () => ready ? [{ localService: true, lang: "ja-JP" }] : [],
      addEventListener: (event, fn) => { if (event === "voiceschanged") changed = fn; },
    } });
    window.__releaseVoices = () => { ready = true; if (changed) changed(); };
    window.msOpenReport = () => {};   // a stand-in for the shell's dialog: the entries must still wait for a result
  });
  await page.waitForFunction(() => window.__releaseBattery && !document.querySelector('.bl[data-b="lang"]').classList.contains("wait"), { timeout: 5000 });
  const early = await page.evaluate(() => ({ natWait: document.querySelector('.bl[data-b="nat"]').classList.contains("wait"),
    shareDisabled: document.querySelector("#share").disabled, writes: window.__lastWrites,
    reportHidden: document.querySelector("#rpRead").hidden && document.querySelector("#rpCheck").hidden }));
  if (!early.natWait || !early.shareDisabled || early.writes || !early.reportHidden) fail("intro", "nationality, finalization or the report entry happened before its dependencies");
  await page.evaluate(() => window.__releaseVoices());
  await page.waitForFunction(() => !document.querySelector('.bl[data-b="nat"]').classList.contains("wait") && !document.querySelector('.bl[data-b="city"]').classList.contains("wait"), { timeout: 5000 });
  const partial = await page.evaluate(() => ({ intro: [...document.querySelectorAll('#story p:first-child .bl')].map(x => x.textContent),
    batteryWait: document.querySelector('.pr[data-s="battery"]').classList.contains("wait"), shareDisabled: document.querySelector("#share").disabled, writes: window.__lastWrites }));
  if (!partial.batteryWait || !partial.shareDisabled || partial.writes) fail("intro", "a slow unrelated sniffer did not keep the final result pending");
  await page.evaluate(() => window.__releaseBattery());
  await page.waitForFunction(() => !document.querySelector("#rerun").disabled, { timeout: 30000 });
  const final = await page.evaluate(() => ({ intro: [...document.querySelectorAll('#story p:first-child .bl')].map(x => x.textContent),
    waiting: document.querySelectorAll(".bl.wait").length, writes: window.__lastWrites }));
  if (JSON.stringify(partial.intro) !== JSON.stringify(final.intro)) fail("intro", "a settled intro changed at finalization");
  if (final.waiting || final.writes !== 1) fail("intro", `finalization: ${final.waiting} blanks waiting, ${final.writes} last-visit writes`);
  if (await page.evaluate(() => document.querySelector("#rpRead").hidden || document.querySelector("#rpCheck").hidden)) fail("intro", "the report entries did not appear once the result was ready");
  await page.click("#rerun");
  await page.waitForFunction(() => document.querySelector("#rerun").disabled);
  await page.waitForFunction(() => window.__releaseBattery && !document.querySelector('.bl[data-b="lang"]').classList.contains("wait"));
  await page.evaluate(() => window.__releaseBattery());
  await page.waitForFunction(() => !document.querySelector("#rerun").disabled, { timeout: 30000 });
  if (await page.evaluate(() => window.__lastWrites) !== 2) fail("intro", "rerun wrote last-visit more or less than once");
  for (const e of errors) fail("intro", "script error: " + e);
  await page.close();
}

// The visitor's report (1ms-shell#88): navigator.getBattery replaced with a stub, so a desktop read like a laptop.
// The lie check sees the swap, so the battery cannot name the device; and a NaN level is no reading at all, so no
// NaN may reach the page. A laptop-shaped stub (0.62, charging) would decide "laptop" if either defence failed.
for (const broken of [false, true]) {
  console.log(broken ? "battery: NaN" : "battery: replaced");
  const { page, errors } = await open(`${base}/`, nan => {
    navigator.getBattery = async () => nan ? { level: NaN, charging: true, chargingTime: 0 } : { level: 0.62, charging: true, chargingTime: 5400 };
  }, broken);
  await page.waitForFunction(() => !document.querySelector("#rerun").disabled, { timeout: 30000 }).catch(() => fail("battery", "the run never finished"));
  const r = await page.evaluate(() => ({
    model: (document.querySelector('.pr[data-s="model"] .pa') || {}).textContent || "",
    gpu: (document.querySelector('.pr[data-s="gpu"] .pa') || {}).textContent || "",
    battery: (document.querySelector('.pr[data-s="battery"] .pa') || {}).textContent || "",
    pc: (window.L1MS || {}).md_pc || "",
    story: document.querySelector("#story").textContent,
  }));
  for (const e of errors) fail("battery", "script error: " + e);
  // (a card sold as a laptop's names the laptop by itself, with or without a battery, and so does an Apple chip
  // ("Apple M1 Pro" names the Mac by its chip and display): only other machines are judged)
  if (!/Laptop GPU|Mobile|Max-Q|Adreno|Snapdragon|Apple M\d/i.test(r.gpu) && r.model !== r.pc) fail("battery", `a replaced getBattery named the device "${r.model}", not "${r.pc}"`);
  if (broken) { if (/NaN/.test(r.battery + r.story)) fail("battery", "a NaN reading reached the page: " + r.battery); }
  else if (!/62/.test(r.battery)) fail("battery", `the stand-in never reached the page (battery reads "${r.battery}")`);
  await page.close();
}

await freshBrowser();
await pool(LANGS, N, async ([lang, slug], base) => {
  console.log(lang);
  const { page, errors } = await open(`${base}/${slug ? slug + "/" : ""}`);
  // done when the rerun button is enabled again (the run, WebRTC included, is over)
  await page.waitForFunction(() => !document.querySelector("#rerun").disabled, { timeout: 30000 }).catch(() => fail(lang, "the run never finished"));
  const r = await page.evaluate(() => ({
    rows: [...document.querySelectorAll(".pr[data-s]")].map(x => [x.dataset.s, x.querySelector(".pa").textContent]),
    waiting: document.querySelectorAll(".bl.wait").length, blanks: document.querySelectorAll(".bl[data-b]").length,
    story: document.querySelector("#story").textContent, checks: [...document.querySelectorAll(".ckr")].map(x => [x.dataset.c, x.className]),
    num: document.querySelector("#mNum").textContent, fp: document.querySelector("#fpId").textContent, ret: document.querySelector("#fpRet").textContent,
    firstHidden: document.querySelector("#p2first").hidden,
    probe2Hidden: document.querySelector("#probe2").hidden,
  }));
  for (const e of errors) fail(lang, "script error: " + e);
  if (r.rows.length !== SNIFFERS.length) fail(lang, `${r.rows.length} rows, expected ${SNIFFERS.length}`);
  for (const [id, v] of r.rows) if (!v.trim() || v === "…") fail(lang, `row ${id} not filled ("${v}")`);
  if (r.blanks !== Object.keys(BLANKS).length) fail(lang, `${r.blanks} blanks, expected ${Object.keys(BLANKS).length}`);
  if (r.waiting) fail(lang, `${r.waiting} blanks still waiting`);
  if (/\{\w+\}|undefined|null|NaN/.test(r.story)) fail(lang, "portrait has a leftover: " + r.story.match(/.{0,20}(\{\w+\}|undefined|null|NaN).{0,20}/)[0]);
  for (const [id, cls] of r.checks) if (!/st-/.test(cls)) fail(lang, `check ${id} not judged`);
  if (r.checks.length !== CHECKS.length + PROTO.length) fail(lang, `${r.checks.length} checks, expected ${CHECKS.length + PROTO.length}`);
  if (!/^\d+$/.test(r.num)) fail(lang, `count "${r.num}"`);
  if (!r.fp.trim() || !r.ret.trim()) fail(lang, "ID card not filled");
  if (!r.firstHidden || !r.probe2Hidden) fail(lang, "without anchors the connection cards should be hidden");

  if (lang === "zh-CN") {
    // share (1ms.dog's share dialog), then open the link as someone else would
    await page.click("#share");
    // the link, in this language's folder, and the image card, made in the page
    await page.waitForFunction(() => { const d = document.querySelector("dialog.ms-share"); return d && d.open && /\/zh-cn\/r\/\d+\./.test(d.querySelector(".ms-share-link input").value) && d.querySelector(".ms-share-img").src; }, { timeout: 8000 })
      .catch(() => fail("share", "no link or no image"));
    // the whole dialog on one screen: a card taller than the window put every action below the fold (2026-11-17)
    const fit = await page.evaluate(() => { const d = document.querySelector("dialog.ms-share"), b = s => Math.round(d.querySelector(s).getBoundingClientRect().bottom);
      return { vh: innerHeight, link: b(".ms-share-link"), acts: b(".ms-share-acts") }; });
    if (fit.link > fit.vh || fit.acts > fit.vh) fail("share", `the actions sit below the fold (link ${fit.link}, actions ${fit.acts}, window ${fit.vh})`);
    const link = await page.$eval("dialog.ms-share .ms-share-link input", x => x.value), P = decode(link.split("/r/")[1] || "");
    if (!P) fail("share", "the link doesn't decode");
    else {
      if (/203\.0\.113\.7|Tokyo|KDDI/.test(JSON.stringify(P))) fail("share", "the link carries the address, city or network");
      if ("fp" in P || "x" in P) fail("share", "the link carries the fingerprint");
    }
    const s = await open(link, () => { window.msOpenReport = () => {}; });
    await s.page.waitForSelector("html.shared", { timeout: 5000 }).catch(() => fail("share", "shared view not shown"));
    await s.page.waitForSelector(".ms-recv", { timeout: 5000 }).catch(() => {});   // the banner comes with the component
    const v = await s.page.evaluate(() => ({ waiting: document.querySelectorAll(".bl.wait").length, city: document.querySelector('.bl[data-b="city"]').textContent, fp: document.querySelector("#fpId").textContent,
      story: document.querySelector("#story").textContent, mine: !document.querySelector("#mine").hidden, reportHidden: document.querySelector("#rpRead").hidden,
      banner: !!document.querySelector(".ms-recv .ms-recv-b") }));
    if (!v.reportHidden) fail("share", "the report entry showed on a shared portrait, where there is no result of the viewer's own");
    for (const e of s.errors) fail("share", "script error: " + e);
    if (v.waiting) fail("share", `${v.waiting} blanks still waiting`);
    if (v.city !== "•••") fail("share", `city shows "${v.city}"`);
    if (v.fp !== "•••") fail("share", `fingerprint shows "${v.fp}"`);
    if (/\{\w+\}|undefined|null|NaN/.test(v.story)) fail("share", "portrait has a leftover");
    if (!v.mine) fail("share", "no \"check mine\" button");
    if (!v.banner) fail("share", "no banner from the share component above the shared portrait");
    await s.page.close();
  }
  await page.close();
});

// the topic pages: their focus panel fills with the verdict and every row it repeats
// (a sample: every topic in Chinese and English, and one topic in every language; their texts in every language are the
// unit tests', and the page script is the same in all of them)
const SAMPLE = [...Object.keys(PAGES).flatMap(topic => LANGS.filter(([l]) => l === "zh-CN" || l === "en").map(l => [topic, ...l])),
  ...LANGS.filter(([l]) => l !== "zh-CN" && l !== "en").map(l => ["dns-leak", ...l])];
await freshBrowser();
await pool(quick ? [] : SAMPLE, 3, async ([topic, lang, slug], base) => {
  const where = `${lang} ${topic}`;
  const t0 = Date.now();
  // (?lang: the root language's pages would otherwise follow the language another page of this host remembered)
  const { page, errors } = await open(`${base}/${slug ? slug + "/" : ""}${topic}/?lang=${lang}`);
  if (PAGES[topic].stats) {
    await page.waitForFunction(() => /\d/.test(document.querySelector("#crN").textContent) && document.querySelectorAll("#crBars li").length, { timeout: 15000 }).catch(() => fail(where, "the numbers never came"));
    for (const e of errors) fail(where, "script error: " + e);
    await page.close();
    return;
  }
  // (90 s: once in a while a page takes a minute when several run; slow ones are named below, a stuck one fails)
  await page.waitForFunction(() => !document.querySelector("#rerun").disabled, { timeout: 90000 })
    .catch(async () => fail(where, "the run never finished; still waiting: " + ((await page.evaluate(() => [...document.querySelectorAll(".pr.wait")].map(x => x.dataset.s).join(" "))) || "no row")));
  const ms = Date.now() - t0;
  if (ms > 30000) console.log("  … " + where + " took " + Math.round(ms / 1000) + " s");
  const f = await page.evaluate(() => ({ v: document.querySelector("#focusV").className, rows: [...document.querySelectorAll(".focus-rows [data-f]")].map(x => [x.dataset.f, x.querySelector("b").textContent]) }));
  for (const e of errors) fail(where, "script error: " + e);
  if (!/st-/.test(f.v)) fail(where, "no verdict in the focus panel");
  for (const [id, v] of f.rows) if (!v.trim() || v === "…") fail(where, `focus row ${id} not filled`);
  // only its own topic: the way to the main page for the whole test, and none of the main page's other sniffers run
  const own = await page.evaluate(() => ({ all: (document.querySelector(".focus-all") || {}).pathname || null,
    ran: [...document.querySelectorAll(".pr[data-s]:not(.wait)")].map(r => r.dataset.s).filter(s => !document.querySelector(`.focus-rows [data-f="${s}"]`)) }));
  if (!own.all || own.all !== new URL(base + "/" + (slug ? slug + "/" : "")).pathname) fail(where, `no link to the whole test on the main page (${own.all})`);
  const extra = own.ran.filter(s => ["battery", "media", "codecs", "drm", "perms", "webgpu", "mathfp", "emoji", "heap", "sysui", "bt", "bio"].includes(s));
  if (extra.length) fail(where, "ran sniffers it doesn't need: " + extra.join(", "));
  await page.close();
});
await browser.close();
servers.forEach(s => s.close());
console.log(failures.length ? `\n${failures.length} failures` : "\nall ok");
process.exit(failures.length ? 1 : 0);

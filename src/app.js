// who-are-you page. The hero tells the visitor who sites take them for, as a paragraph with blanks, and checks the
// readings against each other the way a site would to spot a disguise. The second card lists every sniffer and what it
// read; each row is in the HTML from the start and is filled the moment its sniffer answers. The paragraph is filled
// once, when every sniffer it needs is in, so its text doesn't reflow piece by piece. Strings: window.L1MS.
import "./compat.mjs";
import { GROUPS, SNIFFERS, BLANKS, CHECKS, PROTO, COUNTED, TODO_SK } from "./sniffers.mjs";
import { TRAITS, rarity, MIN_TOTAL, durOf, STUCK_MS } from "./traits.mjs";
import { TW, flagCode } from "./regions.mjs";
import { encode, decode, linkPath, parsePath } from "./share.mjs";
import { nationality, device, browser, gpuName, gpuOS, kbdLayout, isDataCenter, netKind, fontHints, checks, giveaways, protocols, offTxt, splitOf, tzCC, langCC, sysLangs, SYS_FONT_LIST, grade, physicalScreen, isSoftGpu, vmOf, looksLikeAddress, isIntegratedGpu, discreteGpu, isRelayIp, rfpClock, idLies, FEATURES, engineRange, engineOff, platformOff, glVendorOff, armSay, armGpu, tunnelOf, macOf, v6Type } from "./infer.mjs";
import { wasmProbe, WASM_FEATURES } from "./wasm.mjs";
import { TZ_CC } from "./tz.mjs";
import { appleModel, pcKind, bucket, batteryReading } from "./models.mjs";
import { exifOf } from "./exif.mjs";

(function () {
  "use strict";
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const D = JSON.parse($("#data").textContent);
  const L = window.L1MS || {}, LANG = D.lang;
  const t = (k, v) => { let s = L[k] ?? k; if (v) for (const x in v) s = s.split("{" + x + "}").join(v[x]); return s; };
  // a count in the language's own form: k_one, k_few, k_many as Intl.PluralRules says, k_other otherwise
  const tn = (k, n, v) => { let c = "other"; try { c = new Intl.PluralRules(LANG).select(n); } catch (e) {} return t(L[k + "_" + c] != null ? k + "_" + c : k + "_other", v); };
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  const K = { seen: "who:seen", optout: "who:optout", scene: "who:scene", theme: "who:theme", lang: "who:lang", mask: "who:mask", last: "who:last", prev: "who:prev", target: "who:target", hist: "who:hist" };
  const dn = type => { try { return new Intl.DisplayNames([LANG], { type }); } catch (e) { return null; } };
  const REG = dn("region"), LNG = dn("language");
  // Cloudflare names cities in English ("Tokyo"): in the languages that write them in another script, the city's own
  // name in that language (scripts/cities.mjs, public/assets/city/), loaded on those pages only; any other stays as is
  let CITIES = {};
  const citiesP = ["ja", "ko", "zh-CN", "zh-TW", "ru"].includes(LANG)
    ? fetch("/assets/city/" + LANG.toLowerCase() + ".json").then(r => r.ok ? r.json() : {}).then(m => { CITIES = m || {}; }).catch(() => {}) : Promise.resolve();
  const cityName = s => s ? CITIES[String(s).toLowerCase()] || s : s;
  // a city and its region, named in the page's language, the region left out when it says the same ("東京, 東京")
  const place = (...parts) => parts.filter(Boolean).map(cityName).filter((p, i, a) => a.indexOf(p) === i);
  // (Taiwan: "中国台湾 / Taiwan, China" and China's flag, in every language; src/regions.mjs)
  const country = cc => { if (cc === "TW") return TW[LANG]; try { return REG ? REG.of(cc) : cc; } catch (e) { return cc; } };
  // a language's name, Taiwan's part named the same way ("中文（中国台湾）")
  const language = tag => {
    let s; try { s = LNG ? LNG.of(tag) : tag; } catch (e) { s = tag; }
    if (/-TW\b/i.test(tag) && REG) { try { const sys = REG.of("TW"); if (sys && s.includes(sys)) s = s.replace(sys, TW[LANG]); } catch (e) {} }
    return s;
  };
  const flag = cc => /^[A-Z]{2}$/.test(cc || "") ? `<img class="flag" src="/flags/${flagCode(cc)}.svg" alt="" width="20" height="15">` : "";
  // A flag and the text after it, the flag kept on the line of the text's first word; that word can be a link.
  const flagged = (cc, s, href) => {
    const m = String(s).match(/^(\S+)([\s\S]*)$/) || ["", "", ""];
    const w = href ? `<a href="${esc(href)}" target="_blank" rel="noopener" title="${esc(t("go_ipqs"))}">${esc(m[1])}</a>` : esc(m[1]);
    return `<span class="nw">${flag(cc)}${w}</span>${esc(m[2])}`;
  };
  // other 1ms.dog tools, when the host announces them (absent when self-hosted)
  const META = n => (document.querySelector(`meta[name="${n}"]`) || {}).content || "";
  // Embedded in Connection Checkup: only when opened with ?embed=checkup by the report page the host names in
  // <meta name="check">; anything else (no meta when self-hosted, another referrer) is an ordinary page. The report
  // page is the only origin the page talks to. Only the home page embeds: not a topic page, not a shared portrait.
  const EMBED = (() => {
    const check = META("check");
    if (new URLSearchParams(location.search).get("embed") !== "checkup" || !check || window.parent === window) return "";
    if (D.focus || parsePath(location.pathname)) return "";
    try { const o = new URL(check).origin; return new URL(document.referrer).origin === o ? o : ""; } catch (e) { return ""; }
  })();
  if (EMBED) document.documentElement.setAttribute("data-who-embed", "");
  const post = m => { if (EMBED) window.parent.postMessage({ ms: "checkup", v: 1, tool: "who", ...m }, EMBED); };
  // a run that can't report anything says so once, and then sends no result (the page itself still finishes)
  let failed = false;
  const fail = () => { if (!failed) { failed = true; post({ type: "error", text: t("em_blocked") }); } };
  // the icon that ends a link to another tool (the same as the build's EXT)
  const EXT = '<svg class="ext" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 2.5h4.5V7M13.5 2.5 7.5 8.5M12 10v3.5H2.5V4H6"/></svg>';
  const IPQS = META("ipqs"), EGRESS = META("egress"), DNSTEST = META("dns"), ASN = META("asn"), IPV6 = META("ipv6"), UNLOCK = META("unlock");
  // another tool's page in this page's language (every 1ms.dog tool keeps the same language folders)
  const inLang = host => host.replace(/\/$/, "") + ((D.base || D.paths)[LANG] || "/");
  // only public addresses get a link: there is nothing to look up about a private, loopback or link-local one
  const PRIVATE = /^(10\.|127\.|0\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.|::1?$|f[cd][0-9a-f]{2}:|fe[89ab][0-9a-f]:)/i;
  const ipqsOf = ip => IPQS && ip && !PRIVATE.test(ip) ? inLang(IPQS) + "?ip=" + encodeURIComponent(ip) : "";
  // a public address's page on ASN Lookup (who runs the network it belongs to)
  const ipLink = ip => ASN && !PRIVATE.test(ip) ? `<a href="${esc(inLang(ASN) + "ip/" + ip)}" target="_blank" rel="noopener" title="${esc(t("go_asn"))}">${esc(ip)}</a>` : esc(ip);
  if (EGRESS && $("#egLink")) { $("#egLink").href = inLang(EGRESS); $("#egLink").hidden = false; }
  // whether this exit works for ChatGPT, Netflix and the rest: the next thing a visitor on a proxy or a cloud IP wants
  // to know (the line is in the markup from the first paint; without the tool, self-hosted, it steps aside)
  const unlockHref = UNLOCK ? inLang(UNLOCK) + "ai/" : "";
  if ($("#unGo")) { if (unlockHref) $("#unGo").href = unlockHref; else $("#unGo").hidden = true; }
  // a topic page's link to the tool that looks deeper: DNS Test, or EgressLens for every exit
  const focusHref = D.focus && ({ dns: DNSTEST && inLang(DNSTEST), egress: EGRESS && inLang(EGRESS) })[D.focus.go];
  if (focusHref && $("#focusGo")) { $("#focusGo").href = focusHref; $("#focusGo").hidden = false; }
  // an AS number links to its page on ASN Lookup
  const asnOf = n => ASN && n ? inLang(ASN) + "AS" + n : "";
  const asnLink = n => { const h = asnOf(n); return h ? `<a href="${esc(h)}" target="_blank" rel="noopener" title="${esc(t("go_asn"))}">AS${n}</a>` : "AS" + n; };
  const list = a => a.join(t("v_join"));
  // a network's everyday name: "Alibaba Cloud (Singapore) Private Limited" → "Alibaba Cloud", "Amazon.com, Inc." → "Amazon.com"
  const shortOrg = s => {
    let x = String(s || "").replace(/\s*\([^)]*\)/g, "").trim(), y;
    do { y = x; x = x.replace(/[,.]?\s+(inc|llc|l\.l\.c|ltd|limited|co|corp|corporation|company|gmbh|ag|s\.?a\.?|b\.?v\.?|pte|private|plc|oy|ab|as|srl|sas|kg)\.?$/i, "").trim(); } while (x !== y && x);
    return x || String(s || "");
  };
  // the network's name for the portrait and the checks: its AS number when it's registered under an address
  const orgName = (s, asn) => s && !looksLikeAddress(s) ? shortOrg(s) : asn ? "AS" + asn : null;
  const within = (p, ms, fb) => Promise.race([p, new Promise(r => setTimeout(() => r(fb), ms))]);
  const sha = async s => {
    try { const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join(""); }
    catch (e) { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return (h >>> 0).toString(16).padStart(8, "0"); }
  };
  const mq = q => matchMedia(q).matches;
  const getJ = (u, ms = 5000) => fetch(u, { cache: "no-store", credentials: "omit", signal: AbortSignal.timeout(ms) }).then(r => r.ok ? r.json() : Promise.reject());
  const getT = (u, ms = 5000) => fetch(u, { cache: "no-store", credentials: "omit", signal: AbortSignal.timeout(ms) }).then(r => r.ok ? r.text() : Promise.reject());

  /* ---------- theme and language (synced across the 1ms.dog tools) ---------- */
  const thBtn = $("#theme"), TH = ["system", "light", "dark"];
  const applyTheme = th => {
    if (th === "light" || th === "dark") document.documentElement.setAttribute("data-theme", th); else document.documentElement.removeAttribute("data-theme");
    thBtn.dataset.th = th; thBtn.title = t("th_" + th); thBtn.setAttribute("aria-label", t("th_" + th));
  };
  applyTheme(TH.includes(store.get(K.theme)) ? store.get(K.theme) : "system");
  thBtn.onclick = () => { const n = TH[(TH.indexOf(thBtn.dataset.th) + 1) % 3]; store.set(K.theme, n); applyTheme(n); };
  $("#lang").onchange = e => { const l = e.target.value; store.set(K.lang, l); const r = parsePath(location.pathname); location.href = r ? linkPath(l, r.code) : D.paths[l] + location.search + location.hash; };   // a shared portrait comes along

  /* ---------- dialogs ---------- */
  function openDlg(id) { $("#" + id).hidden = false; document.documentElement.style.overflow = "hidden"; $("#" + id + " [data-close]").focus(); }
  function closeDlg() { $$(".scrim").forEach(s => { s.hidden = true; }); document.documentElement.style.overflow = ""; }
  $$("[data-close]").forEach(b => { b.onclick = closeDlg; });
  $$(".scrim").forEach(s => s.addEventListener("click", e => { if (e.target === s) closeDlg(); }));
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeDlg(); });
  // help: one answer at a time; a picker with previous / next on phones. The questions ship in one file per language
  // (fetched when help is first opened), not in every page's HTML: the same four to eight answers in 18 folders
  let HELP = null, helpIdx = 0, helpN = 0, STORE_Q = 0;
  const HELP_PAGE = (D.focus && D.focus.page) || "";
  function helpRender() {
    const docs = HELP || [];
    helpN = docs.length; STORE_Q = typeof D.store === "number" ? D.store : 0;
    $("#helpNav").innerHTML = docs.map(([q], i) => `<button type="button" role="tab" data-hq="${i}"${i === D.store ? " data-store" : ""} aria-selected="${i === 0}">${esc(q)}</button>`).join("");
    $("#helpC").innerHTML = docs.map(([q, a], i) => `<article data-hqb="${i}"${i ? " hidden" : ""}><h3>${esc(q)}</h3>${a.split(/\n+/).map(p => `<p>${esc(p)}</p>`).join("")}</article>`).join("");
    $("#helpSel").innerHTML = docs.map(([q], i) => `<option value="${i}">${i + 1} / ${helpN} · ${esc(q)}</option>`).join("");
    $$("#helpNav [data-hq]").forEach(b => { b.onclick = () => showHelp(+b.dataset.hq); });
  }
  function showHelp(i) {
    helpIdx = Math.max(0, Math.min(helpN - 1, i));
    $$("#helpNav [data-hq]").forEach(b => b.setAttribute("aria-selected", +b.dataset.hq === helpIdx));
    $$("#helpC [data-hqb]").forEach(a => { a.hidden = +a.dataset.hqb !== helpIdx; });
    $("#helpSel").value = helpIdx;
    $$("[data-hstep]").forEach(b => { b.disabled = helpIdx + +b.dataset.hstep < 0 || helpIdx + +b.dataset.hstep >= helpN; });
    $("#helpC").scrollTop = 0;
  }
  async function openHelp(i) {
    if (!HELP) {
      HELP = [];
      try { const m = await import(D.help); HELP = (m.default && (m.default[HELP_PAGE] || m.default[""])) || []; } catch (e) {}
      helpRender();
    }
    showHelp(typeof i === "number" ? i : helpIdx);
    openDlg("help");
  }
  $("#helpBtn").onclick = () => openHelp(helpIdx);
  $("#helpSel").onchange = e => showHelp(+e.target.value);
  $$("[data-hstep]").forEach(b => { b.onclick = () => showHelp(helpIdx + +b.dataset.hstep); });

  /* ---------- blur the address and location (for screenshots) ---------- */
  const masked = () => store.get(K.mask) === "1";
  const applyMask = () => { $("#main").classList.toggle("masked", masked()); $("#eyeT").textContent = t(masked() ? "show" : "hide"); $("#eye").setAttribute("aria-pressed", masked()); };
  $("#eye").onclick = () => { store.set(K.mask, masked() ? "0" : "1"); applyMask(); };
  applyMask();

  // the tooltip: blanks, rows and checks that explain themselves on hover (data-why)
  let tipEl;
  function showTip(el) {
    if (!tipEl) { tipEl = document.body.appendChild(Object.assign(document.createElement("div"), { className: "tip" })); addEventListener("scroll", () => tipEl.classList.remove("on"), { passive: true }); }
    tipEl.textContent = el.dataset.why;
    const b = el.getBoundingClientRect(), w = tipEl.offsetWidth;
    tipEl.style.left = Math.max(8, Math.min(innerWidth - w - 8, b.left + b.width / 2 - w / 2)) + "px";
    tipEl.style.top = b.bottom + 6 + "px"; tipEl.classList.add("on");
  }
  document.addEventListener("mouseover", e => { const el = e.target.closest && e.target.closest("[data-why]"); if (el) showTip(el); else if (tipEl) tipEl.classList.remove("on"); });
  document.addEventListener("focusin", e => { const el = e.target.closest && e.target.closest("[data-why]"); if (el) showTip(el); });
  // a blank points at the rows it came from: hovering it lights them up
  document.addEventListener("mouseover", e => {
    const b = e.target.closest && e.target.closest(".bl[data-b]");
    $$(".pr.lit").forEach(r => r.classList.remove("lit"));
    if (b) for (const id of (b.dataset.from || "").split(" ")) { const r = PR[id]; if (r) r.classList.add("lit"); }
  });

  /* ---------- rows: each keeps its size from the first paint; only the text changes ---------- */
  const PR = Object.fromEntries($$(".pr[data-s]").map(r => [r.dataset.s, r]));
  const FR = Object.fromEntries($$(".focus-rows [data-f]").map(r => [r.dataset.f, r]));
  const N = SNIFFERS.length;
  // Network Checkup, the run of every 1ms.dog tool at once, beside the verdict (when the host announces it; never
  // inside it)
  const CHECK = META("check");
  if (CHECK && !EMBED) { const a = $("#checkGo"); a.href = inLang(CHECK); a.innerHTML = esc(t("go_check")) + EXT; a.hidden = false; }
  // the row under the bar takes its place from the start when it will hold something, so nothing moves later
  if (!EMBED && (store.get("who:prev") || store.get("who:hist"))) $("#vMeta").hidden = false;
  let gen = 0, done = new Set(), unsup = new Set();
  // (the paragraph is filled blank by blank as each reading lands, instead of all at once after the slowest probe:
  // PARTIAL marks such a pass, which leaves a blank that isn't ready and never rewrites one already filled)
  let PARTIAL = false, ppQueued = false, introReady = false;
  // fill a row: html is trusted markup built here, everything read from the browser or the server goes through esc()
  function row(id, html, opt = {}) {
    const r = PR[id]; if (!r || done.has(id)) return;
    done.add(id);
    r.classList.remove("wait"); r.classList.toggle("na", !!opt.na);
    const a = r.querySelector(".pa"); a.innerHTML = html;
    if (FR[id]) { FR[id].querySelector("b").innerHTML = html; FR[id].classList.toggle("na", !!opt.na); }
    const why = opt.why || (a.scrollWidth > a.clientWidth + 1 ? a.textContent : "");
    if (why) { r.dataset.why = why; r.tabIndex = 0; } else { delete r.dataset.why; r.removeAttribute("tabindex"); }
    progress();
    schedulePortrait();
  }
  // The paragraph fills as the readings do: a frame after a row lands, the blanks whose sources are all in take
  // their answer. Not on a topic page (no portrait there), never inside a partial pass, and not before the first
  // paragraph's own readings (its nationality rests on the system languages, so it would be a guess rewritten later)
  function schedulePortrait() {
    if (!introReady || D.focus || PARTIAL || ppQueued || R.end) return;
    const myGen = gen; ppQueued = true;
    requestAnimationFrame(() => {
      ppQueued = false;
      if (gen !== myGen || R.end || D.focus) return;
      PARTIAL = true;
      try { paint(portrait(), false); readings(portrait(), R.ck); } finally { PARTIAL = false; }
    });
  }
  const txt = (id, s, opt) => row(id, esc(s), opt);
  // (the rows the browser itself withholds, "this browser doesn't provide": counted for the line under the portrait)
  const na = (id, key = "v_unsup") => { if (key === "v_unsup" && PR[id] && !done.has(id)) unsup.add(id); row(id, esc(t(key)), { na: true }); };
  // a row can keep one small line under its value (its place is in the HTML from the start: nothing moves when it is
  // filled). For a value that needs a phrase to be read right, such as the graphics card's (1ms-shell#92): the line
  // under the value on a wide screen, a short phrase after the value on a phone, where a long name's row would
  // otherwise be three lines
  function note(id, full, short, lie) {
    const r = PR[id]; if (!r) return;
    const el = r.querySelector(".pnote");
    if (el) { el.textContent = full || ""; el.classList.toggle("lie", !!lie); }
    const a = r.querySelector(".pa"); if (!a) return;
    let s = a.querySelector(".pnote-s");
    if (!full) { if (s) s.remove(); return; }
    if (!s) { s = document.createElement("span"); s.className = "pnote-s"; a.appendChild(s); }
    s.textContent = short || "";
    s.classList.toggle("lie", !!lie);
  }
  function progress() {
    const n = done.size;
    $("#prog i").style.transform = `scaleX(${n / N})`;
    $("#prog").classList.toggle("end", n >= N);
    // A browser that withholds many readings (Safari, Firefox, Brave) can look like a test that failed: say whose
    // choice it is, and that it is a good one
    const br = (R && R.br && R.br.name) || t("br_this");
    $("#progTxt").textContent = n >= N ? t("done_n", { n: N }) + (unsup.size >= 5 ? " · " + t("unsup_n", { b: br, k: unsup.size }) : "")
      : t("progress", { n, of: N });
    post({ type: "progress", done: n, total: N, text: $("#progTxt").textContent });
  }
  // run a sniffer; one that throws marks its rows as unreadable
  const guard = async (ids, f) => { try { await f(); } catch (e) { for (const id of [].concat(ids)) na(id, "v_fail"); } };

  /* ---------- the sniffers ---------- */
  let R;   // this run's readings

  // what the server saw: the address, Cloudflare's data for it, TLS, the headers, the clock
  async function server() {
    const ids = ["ip", "geo", "coords", "isp", "tzip", "ptr", "edge", "proto", "tlsfp", "clock", "h_ua", "h_lang", "h_chua", "h_plat", "h_enc", "h_dnt"];
    let j, t0, t1;
    try {
      t0 = Date.now();
      const r = await fetch("/api/me", { cache: "no-store", signal: AbortSignal.timeout(8000) });
      j = await r.json(); t1 = Date.now();
    } catch (e) { for (const id of ids) na(id, "v_fail"); R.srv = {}; return; }
    const c = j.cf || {}, h = j.h || {};
    R.srv = j;
    row("ip", flagged(null, j.ip + " · IPv" + j.v, ipqsOf(j.ip)));
    // (the place and the point are an IP database's guess for the address, said so on the row itself)
    await within(citiesP, 1500, null);
    row("geo", c.country ? flagged(c.country, [...place(c.city, c.region), country(c.country)].join(", ") + t("ex_geo")) : esc(t("v_empty")), c.country ? { why: t("ex_geo_why") } : { na: true });
    if (c.latitude != null) txt("coords", [(+c.latitude).toFixed(2) + ", " + (+c.longitude).toFixed(2), c.postalCode].filter(Boolean).join(" · ") + t("ex_geo"), { why: t("ex_geo_why") }); else na("coords", "v_empty");
    if (c.asn) {
      const kind = netKind(c.asn, c.asOrganization);
      row("isp", asnLink(c.asn) + esc(" · " + (c.asOrganization || "") + (kind === "vpn" ? " · " + t("nk_vpn") : kind === "dc" ? " · " + t("nk_dc") : "")), { why: t("nk_why") });
    } else na("isp", "v_empty");
    if (c.timezone) txt("tzip", c.timezone + " · UTC" + offTxt(tzOffset(c.timezone)) + tzNote(c.timezone)); else na("tzip", "v_empty");
    if (j.ptr) txt("ptr", j.ptr); else na("ptr", "v_empty");
    if (c.colo) txt("edge", c.colo + (c.clientTcpRtt ? " · RTT " + c.clientTcpRtt + " ms" : "")); else na("edge", "v_empty");
    txt("proto", [c.httpProtocol, c.tlsVersion, c.tlsCipher].filter(Boolean).join(" · ") || "–");
    if (c.tlsClientExtensionsSha1) txt("tlsfp", (await sha(c.tlsClientExtensionsSha1)).slice(0, 12) + (c.tlsClientHelloLength ? " · " + c.tlsClientHelloLength + " B" : "")); else na("tlsfp", "v_empty");
    // the server's clock at the request, against the middle of the round trip on this one
    const skew = (t0 + t1) / 2 - j.at, sec = Math.abs(skew) / 1000;
    txt("clock", sec < 1 ? t("clk_ok", { ms: Math.round(Math.abs(skew)) }) : t(skew > 0 ? "clk_fast" : "clk_slow", { s: sec < 10 ? sec.toFixed(1) : Math.round(sec) }));
    const hv = (id, v) => v ? txt(id, v) : na(id, "v_none");
    hv("h_ua", h["user-agent"]); hv("h_lang", h["accept-language"]); hv("h_chua", h["sec-ch-ua"]);
    hv("h_plat", [h["sec-ch-ua-platform"], h["sec-ch-ua-mobile"] === "?1" ? "mobile" : ""].filter(Boolean).join(" · "));
    hv("h_enc", h["accept-encoding"]);
    hv("h_dnt", [h.dnt != null ? "DNT: " + h.dnt : "", h["sec-gpc"] != null ? "Sec-GPC: " + h["sec-gpc"] : ""].filter(Boolean).join(" · "));
  }

  // Web Bot Auth (RFC 9421): an AI agent that signs its requests says who runs it in Signature-Agent, a claim a
  // spoofer can't invent without the key. Most visitors sign nothing, so the row says that in as many words
  const AGENTS = [["ChatGPT-User", /ChatGPT-User/i], ["Claude-User", /Claude-User/i], ["Claude-SearchBot", /Claude-SearchBot/i],
    ["PerplexityBot", /PerplexityBot/i], ["Perplexity-User", /Perplexity-User/i], ["Operator", /OpenAI-Operator/i]];
  function webBotAuth() {
    const h = (R.srv && R.srv.h) || {}, ua = h["user-agent"] || "";
    const said = (AGENTS.find(([, re]) => re.test(ua)) || [])[0];
    const who = (h["signature-agent"] || h["signed-agent"] || "").replace(/^"|"$/g, "");
    if (who) return txt("wba", t("wba_sig", { a: who }) + (said ? " · " + said : ""), { why: h["signature-input"] || "" });
    if (h.signature || h["signature-input"]) return txt("wba", t("wba_sig0"), { why: h["signature-input"] || "" });
    if (said) return txt("wba", t("wba_ua", { a: said }));
    txt("wba", t("wba_none"));
  }

  // a time zone's name in the page's language ("北美太平洋时间"), with its offset
  // (a shared link leaves the address's zone out unless it shows the city: its country stands in, "日本 UTC+09:00")
  function zoneLabel(tz, off, cc) {
    let name = "";
    try { if (tz) name = new Intl.DateTimeFormat(LANG, { timeZone: tz, timeZoneName: "longGeneric" }).formatToParts(new Date()).find(x => x.type === "timeZoneName").value; } catch (e) {}
    if (!name && cc) name = country(cc);
    return (name && !/^GMT|^UTC/.test(name) ? name + " " : "") + "UTC" + off;
  }

  // a time zone's UTC offset now, in minutes
  function tzOffset(tz) {
    try {
      const p = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "longOffset" }).formatToParts(new Date()).find(x => x.type === "timeZoneName").value;
      const m = p.match(/GMT([+-−])(\d{2}):?(\d{2})?/);
      return m ? (m[1] === "+" ? 1 : -1) * (+m[2] * 60 + +(m[3] || 0)) : 0;
    } catch (e) { return null; }
  }

  function referrer() {
    txt("h_ref", document.referrer || t("v_none"), { na: !document.referrer });
    txt("history", tn("hist_v", history.length, { n: history.length }));
  }

  // language, region and formats
  function locale() {
    const langs = navigator.languages && navigator.languages.length ? [...navigator.languages] : [navigator.language].filter(Boolean);
    R.langs = langs;
    txt("langs", langs.join(", ") || "–");
    const ro = Intl.DateTimeFormat().resolvedOptions();
    R.tz = ro.timeZone; R.tzOff = tzOffset(ro.timeZone);
    // The same clock read the two ways Date offers (anti-detect browsers rewrite each API on its own): getTimezoneOffset's
    // minutes, and the offset Date's own string ends with. When they agree with Intl — every browser nobody has touched
    // — there is nothing to report; when one doesn't, the tz check says the browser contradicts itself
    let dOff = null, sOff = null;
    try { const n = -new Date().getTimezoneOffset(); if (Number.isInteger(n)) dOff = n; } catch (e) {}
    try { const m = /GMT([+−-])(\d{1,2})(\d{2})?/.exec(new Date().toString()); if (m) sOff = (m[1] === "+" ? 1 : -1) * (+m[2] * 60 + +(m[3] || 0)); } catch (e) {}
    R.tzAlt = R.tzOff == null ? null : [dOff, sOff].find(o => o != null && o !== R.tzOff) ?? null;
    txt("locale", [ro.locale, ro.calendar, ro.numberingSystem].filter(Boolean).join(" · "));
    let tzName = "";
    try { tzName = new Intl.DateTimeFormat(LANG, { timeZone: R.tz, timeZoneName: "longGeneric" }).formatToParts(new Date()).find(x => x.type === "timeZoneName").value; } catch (e) {}
    R.tzName = tzName || R.tz;
    txt("tz", R.tz + " · UTC" + offTxt(R.tzOff) + tzNote(R.tz), { why: tzName });
    // (each Intl call on its own: a browser with trimmed ICU data throws on some of them)
    let hc, now;
    try { hc = new Intl.DateTimeFormat(undefined, { hour: "numeric" }).resolvedOptions().hourCycle; } catch (e) {}
    try { now = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date()); } catch (e) { now = new Date().toTimeString().slice(0, 5); }
    R.h12 = hc === "h11" || hc === "h12";
    txt("hour", t(R.h12 ? "ck_12" : "ck_24") + " · " + now, { why: t("hour_why") });
    try {
      const loc = new Intl.Locale(langs[0] || ro.locale), wi = loc.getWeekInfo ? loc.getWeekInfo() : loc.weekInfo;
      if (!wi) throw 0;
      // 2024-01-01 was a Monday: day d (1 = Monday … 7 = Sunday) is January d
      txt("week", t("week_v", { d: new Intl.DateTimeFormat(LANG, { weekday: "long" }).format(new Date(2024, 0, wi.firstDay)) }));
    } catch (e) { na("week"); }
    let fmt = null;
    try { fmt = new Intl.NumberFormat().format(1234567.89) + " · " + new Intl.DateTimeFormat().format(new Date()); } catch (e) {}
    if (fmt) txt("fmt", fmt); else na("fmt");
  }

  async function keyboard() {
    if (!navigator.keyboard || !navigator.keyboard.getLayoutMap) return na("kbd");
    const map = await within(navigator.keyboard.getLayoutMap(), 1500, null);
    const k = kbdLayout(map);
    R.kbd = k;
    if (k) txt("kbd", k); else na("kbd");
  }

  async function voices() {
    if (!window.speechSynthesis) return na("voices");
    let v = speechSynthesis.getVoices();
    if (!v.length) v = await within(new Promise(r => speechSynthesis.addEventListener("voiceschanged", () => r(speechSynthesis.getVoices()), { once: true })), 1500, []);
    if (!v.length) return na("voices", "v_none");
    R.voices = v.filter(x => x.localService).map(x => x.lang || "");
    const langs = [...new Set(v.map(x => (x.lang || "").split(/[-_]/)[0]).filter(Boolean))];
    txt("voices", t("voices_v", { n: v.length, list: list(langs.slice(0, 6).map(language)) + (langs.length > 6 ? "…" : "") }), { why: langs.map(language).join(", ") });
  }

  function winByFonts() {
    const c = document.createElement("canvas").getContext("2d");
    if (!c) return null;
    const W = "mmmmmmmmmlli1WO@", base = ["monospace", "sans-serif", "serif"];
    const w = f => { c.font = "72px " + f; return c.measureText(W).width; }, b = base.map(w);
    const has = f => base.some((g, i) => w(`"${f}", ${g}`) !== b[i]);
    if (!has("Segoe UI")) return null;   // (fonts hidden or unreadable: nothing to go by)
    return has("Segoe UI Variable Text") || has("Segoe UI Variable Display") ? "11" : has("Bahnschrift") || has("Segoe UI Historic") || has("Ink Free") ? "10"
      : has("Segoe UI Emoji") ? "8" : "7";
  }
  // the system, the browser, the hardware
  async function hardware() {
    const ua = navigator.userAgent, uad = navigator.userAgentData;
    let hi = {};
    if (uad) {
      hi = { platform: uad.platform, mobile: uad.mobile, brands: uad.brands };
      try { Object.assign(hi, await within(uad.getHighEntropyValues(["platformVersion", "architecture", "bitness", "model", "fullVersionList", "formFactors", "wow64"]), 1500, {})); } catch (e) {}
    }
    R.hi = hi;
    const dv = device(ua, hi, navigator.maxTouchPoints || 0);
    R.dev = dv;
    // A Windows 11 the hints claim, checked against the fonts each Windows ships: 11 has Segoe UI Variable, 10
    // Bahnschrift, Segoe UI Historic and Ink Free, 8 Segoe UI Emoji, 7 only Segoe UI. A browser on an older Windows that reports
    // 11 to sites (Supermium on 7) is read for what the fonts say; Brave, which hides fonts, is left alone
    const claim = dv.os === "Windows" && dv.osv === "11" && !navigator.brave ? winByFonts() : null;
    if (claim && claim !== "11") { R.osClaim = "Windows 11"; dv.osv = claim; }
    R.osTxt = [dv.os, dv.osv].filter(Boolean).join(" ");
    txt("os", R.osClaim ? t("os_claim", { os: R.osTxt, claim: R.osClaim }) : R.osTxt || navigator.platform || "–");
    const b = browser(ua, hi.fullVersionList || hi.brands || []);
    R.br = b;
    R.browser = [b.name, b.v].filter(Boolean).join(" ");
    txt("browser", R.browser || "–");
    // The architecture the browser names, against the machine it runs on. An ArkWeb or Android browser answers from
    // the user agent's Windows compatibility segment ("Win32", and "x86" in the hints) on an ARM tablet, which says
    // nothing about the CPU (1ms-shell #114). The graphics card settles it when it can — Mali, Maleoon and
    // Adreno are ARM — so the row says ARM when the card is one, and 未知 beside what the browser claimed otherwise
    const say = armSay({ arch: hi.architecture, platform: navigator.platform, os: dv.os, gpu: R.gpuRaw });
    if (say) txt("arch", t("arch_off", { a: armGpu(R.gpuRaw) ? "ARM" : t("v_unknown"), said: say.said }));
    else if (hi.architecture) txt("arch", t("arch_v", { a: hi.architecture, b: hi.bitness || "?" }) + (dv.model ? " · " + dv.model : "") + (hi.wow64 ? " · " + t("arch_32") : ""));
    else if (navigator.platform) txt("arch", navigator.platform);
    else na("arch");
    // what the browser calls the device's form: Desktop, Mobile, Tablet, XR, Watch, EInk, Automotive (Chromium says)
    if (hi.formFactors && hi.formFactors.length) txt("form", hi.formFactors.join(" · ")); else na("form");
    // a page loaded out of sight (a background pane, a prerender) can read a 0-wide screen for a moment
    if (!screen.width) await within(new Promise(r => { const f = () => screen.width ? r() : setTimeout(f, 200); f(); }), 3000, null);
    const s = screen, dpr = Math.round((devicePixelRatio || 1) * 100) / 100;
    // in physical pixels: screen.width is after the system's scaling (a 4K monitor at 150% reports 2560×1440)
    const [pw, ph] = s.width ? physicalScreen(s.width, s.height, devicePixelRatio || 1) : [0, 0];
    R.screen = s.width ? pw + "×" + ph : t("v_unknown");
    if (!s.width) na("screen");
    else txt("screen", t("scr_v", { w: pw, h: ph, dpr, d: s.colorDepth }), { why: t("scr_which") + "\n" + t("scr_css", { w: s.width, h: s.height }) + "\n" + t("scr_avail", { w: s.availWidth, h: s.availHeight, iw: innerWidth, ih: innerHeight }) });
    if (navigator.hardwareConcurrency) txt("cpu", tn("cores", navigator.hardwareConcurrency, { n: navigator.hardwareConcurrency })); else na("cpu");
    if (navigator.deviceMemory) txt("mem", t("mem_v", { n: navigator.deviceMemory })); else na("mem");
    txt("touch", [t("touch_v", { n: navigator.maxTouchPoints || 0 }), t(mq("(pointer: coarse)") ? "ptr_coarse" : "ptr_fine"),
      navigator.maxTouchPoints > 0 && mq("(any-hover: hover)") ? t("touch_hybrid") : ""].filter(Boolean).join(" · "));
    const c = navigator.connection;
    if (c && (c.effectiveType || c.type)) txt("conn", [c.type, c.effectiveType, c.rtt != null ? c.rtt + " ms" : "", c.downlink ? c.downlink + " Mbps" : "", c.saveData ? "save-data" : ""].filter(Boolean).join(" · "));
    else na("conn");
  }

  function gpu() {
    const cv = document.createElement("canvas");
    const gl = cv.getContext("webgl") || cv.getContext("experimental-webgl");
    if (!gl) { R.gpuRaw = null; na("gpu"); na("webgl"); na("glx"); return null; }
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const ren = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    const ven = ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR);
    R.gpuVen = ven;
    // a software renderer means the browser isn't using the card at all (remote desktop, a virtual machine, no driver,
    // hardware acceleration off): say so rather than pass it off as one
    // (WebKit says "Apple GPU" whatever the card: off Apple's systems, a WebKitGTK browser on Linux, that is no card)
    const mask = ren === "Apple GPU" && !/Macintosh|iPhone|iPad|iPod/.test(navigator.userAgent);
    R.gpuRaw = ren; R.gpuSoft = isSoftGpu(ren); R.gpu = R.gpuSoft || mask ? null : gpuName(ren);
    // a stand-in for the card's name, or a software renderer: the value says so itself, so it gets no note
    const standIn = ren === "Mozilla" || ren === "Brave" || mask || R.gpuSoft;
    R.gpuStandIn = standIn;
    // pages draw on a laptop's integrated card; asked for high performance, the browser may use the discrete one
    try {
      const hg = document.createElement("canvas").getContext("webgl", { powerPreference: "high-performance" }), he = hg && hg.getExtension("WEBGL_debug_renderer_info");
      R.gpuHiRaw = he ? hg.getParameter(he.UNMASKED_RENDERER_WEBGL) : null; R.gpuHi = gpuName(R.gpuHiRaw);
    } catch (e) { R.gpuHi = null; }
    const dg = discreteGpu(R.gpu, R.gpuHi, null);
    txt("gpu", R.gpuSoft ? (ren || "–") + " · " + t("gpu_soft") : mask ? ren + " · " + t("gpu_webkit") : ren === "Mozilla" ? "Mozilla · " + t("gpu_rfp") : ren === "Brave" ? t("gpu_brave") : /or similar$/.test(ren || "") && R.gpu ? t("gpu_like", { g: R.gpu }) : (R.gpu || ren || "–") + (dg ? " · " + t("gpu_d", { d: dg }) : ""),
      { why: (/or similar$/.test(ren || "") ? t("gpu_like_why") + "\n" : "") + [ven, ren, R.gpuHiRaw && R.gpuHiRaw !== ren ? R.gpuHiRaw : ""].filter(Boolean).join(" · ") });
    // the name is only the one string the browser chose to hand over: say so under it
    if (!standIn) note("gpu", t("gpu_note"), t("gpu_note_short"));
    const gl2 = !!document.createElement("canvas").getContext("webgl2");
    // the shader precision each stage reports: a value of the driver's own, and one a stand-in renderer usually gets
    // wrong (high float: 23 bits and a range of 127 on nearly every desktop card; 0 where a stage has no high float)
    const prec = sh => { try { const p = gl.getShaderPrecisionFormat(sh, gl.HIGH_FLOAT); return p && p.precision ? p : null; } catch (e) { return null; } };
    const pv = prec(gl.VERTEX_SHADER), pf = prec(gl.FRAGMENT_SHADER), pa = pv ? pv.precision : "–", pb = pf ? pf.precision : "–";
    txt("glx", t("glx_v", { v: gl2 ? "WebGL 2" : "WebGL 1", tex: gl.getParameter(gl.MAX_TEXTURE_SIZE), n: (gl.getSupportedExtensions() || []).length }) +
      (pv || pf ? " · " + t("glx_shader", { a: pa, b: pb }) : ""),
      pv || pf ? { why: t("glx_shader_why", { a: pa, b: pb, r: Math.max(pv ? pv.rangeMax : 0, pf ? pf.rangeMax : 0) }) } : undefined);
    // everything WebGL reports about the card and driver, for the WebGL fingerprint
    const P = ["MAX_TEXTURE_SIZE", "MAX_RENDERBUFFER_SIZE", "MAX_VIEWPORT_DIMS", "MAX_VERTEX_ATTRIBS", "MAX_VERTEX_UNIFORM_VECTORS", "MAX_FRAGMENT_UNIFORM_VECTORS",
      "MAX_VARYING_VECTORS", "MAX_COMBINED_TEXTURE_IMAGE_UNITS", "ALIASED_LINE_WIDTH_RANGE", "ALIASED_POINT_SIZE_RANGE", "SHADING_LANGUAGE_VERSION", "VERSION"];
    return [ven, ren, ...P.map(p => String(gl.getParameter(gl[p]))), pa, pb, (gl.getSupportedExtensions() || []).join(",")].join("|");
  }

  // A virtual machine or a remote desktop, from the renderer string alone: a hint, with other causes (acceleration
  // off, a server without a card), so the value says what it saw rather than declaring a VM
  function virt() {
    const k = R.vm = vmOf(R.gpuRaw);
    const name = { vmware: "VMware", virtualbox: "VirtualBox", qemu: "QEMU / KVM", parallels: "Parallels", hyperv: "Hyper-V", citrix: "Citrix" }[k];
    txt("vm", k === "soft" ? t("vm_soft") : k ? t("vm_yes", { name }) : t("vm_no"), { why: t("vm_why") });
  }

  // the sound card's rate and channels (an AudioContext that never plays, closed at once)
  async function audioHw() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return na("audiohw");
    const ac = new AC();
    try {
      // the output buffer the system's audio stack adds: another draw of the machine, and Bluetooth headphones show
      const lat = typeof ac.baseLatency === "number" && ac.baseLatency > 0 ? Math.round(ac.baseLatency * 1000) : null;
      txt("audiohw", t("aud_v", { r: +(ac.sampleRate / 1000).toFixed(1), c: ac.destination.maxChannelCount }) + (lat ? " · " + t("aud_lat", { l: lat }) : ""));
    } finally { ac.close().catch(() => {}); }
  }
  // The high-entropy Client Hints the request itself carried. The Worker asks for them with Accept-CH on /api/me's
  // answer; the browser then adds them to a later request, which a script that rewrites navigator cannot do
  const CH = [["sec-ch-ua-arch", "arch"], ["sec-ch-ua-bitness", "bitness"], ["sec-ch-ua-model", "model"], ["sec-ch-ua-platform-version", "platform"],
    ["sec-ch-ua-wow64", "wow64"], ["sec-ch-ua-form-factors", "forms"], ["sec-ch-ua-full-version-list", "full"]];
  const unq = v => String(v == null ? "" : v).replace(/"/g, "").trim();
  async function chHints() {
    // the hints only come after the browser has read Accept-CH on /api/me's answer, so wait for that answer
    for (let i = 0; i < 30 && !R.srv; i++) await new Promise(r => setTimeout(r, 50));
    let j = null;
    try { const r = await within(fetch("/api/hints", { cache: "no-store" }), 2500, null); j = r && r.ok ? await r.json() : null; } catch (e) {}
    if (!j || !j.h) return na("ch", "v_fail");
    R.chHdr = j.h;
    const got = CH.filter(([k]) => j.h[k] != null);
    if (!got.length) return na("ch");
    txt("ch", got.map(([k, n]) => n + " " + unq(j.h[k])).join(" · "), { why: got.map(([k]) => k + ": " + j.h[k]).join("\n") });
  }

  // A game controller the page can see, with no permission: the browser names the pad and its mapping once a button
  // has been pressed (Firefox waits for that interaction on purpose, so this needs a button of our own)
  function gamepad() {
    if (!navigator.getGamepads) return na("gamepad");
    row("gamepad", `<button type="button" class="pa-go gp-go">${esc(t("gp_btn"))}</button>`, { why: t("gp_why") });
    $('.pr[data-s="gamepad"] .gp-go').onclick = async e => {
      e.target.disabled = true; e.target.textContent = t("gp_wait");
      const pads = () => [...(navigator.getGamepads() || [])].filter(Boolean);
      let found = pads()[0] || null;
      for (let i = 0; i < 50 && !found; i++) { await new Promise(r => setTimeout(r, 200)); found = pads()[0] || null; }
      const a = $('.pr[data-s="gamepad"] .pa');
      if (!found) { a.textContent = t("gp_none"); return; }
      a.textContent = t("gp_v", { id: found.id || "–", b: (found.buttons || []).length, a: (found.axes || []).length }) + (found.mapping ? " · " + found.mapping : "");
    };
  }

  // Whether the browser could present VR or AR here, no headset asked and no permission: an XR device a site can see
  async function xr() {
    const X = navigator.xr;
    if (!X || !X.isSessionSupported) return na("xr");
    const modes = [];
    for (const [m, n] of [["immersive-vr", "VR"], ["immersive-ar", "AR"]]) {
      if (await within(X.isSessionSupported(m), 1200, false)) modes.push(n);
    }
    txt("xr", modes.length ? modes.join(" · ") : t("xr_none"), { why: t("xr_why") });
  }

  // Windows Hello, Touch ID or a fingerprint reader the browser can use for passkeys: asked, never used
  async function biometric() {
    const PK = window.PublicKeyCredential;
    if (!PK || !PK.isUserVerifyingPlatformAuthenticatorAvailable) return na("bio");
    const ok = await within(PK.isUserVerifyingPlatformAuthenticatorAvailable(), 1500, null);
    if (ok == null) return na("bio");
    // what else the browser says it can do with passkeys (Chromium 133, Safari 18): keep them on this device, sign in
    // with a phone's QR code, offer them in the sign-in box's autofill
    let caps = null;
    if (PK.getClientCapabilities) caps = await within(PK.getClientCapabilities().catch(() => null), 2500, null);
    const more = caps ? [["passkeyPlatformAuthenticator", "bio_pk"], ["hybridTransport", "bio_hy"], ["conditionalGet", "bio_cg"]].filter(([k]) => caps[k]).map(([, s]) => t(s)) : [];
    txt("bio", [t(ok ? "v_yes" : "v_no"), ...more].join(" · "));
  }
  // Which model the device is (src/models.mjs): Apple's from the screen and the chip, Android's from its model code
  // in Google Play's device list, a PC's laptop or not from the battery and the GPU
  async function deviceModel() {
    const d = R.dev;
    if (!d || !d.os) return na("model");
    const am = appleModel({ kind: d.kind, os: d.os, ua: navigator.userAgent, w: screen.width, h: screen.height, dpr: devicePixelRatio || 1, gpu: R.gpuRaw || "" });
    if (am) {
      R.model = am;
      if (am.name) { d.model = am.name; return txt("model", am.name); }
      // ("iPhone 17 Pro / 17 / 16 Pro")
      const short = l => l.map((n, i) => i ? n.replace(/^(iPhone|iPad) /, "") : n).join(" / ");
      d.model = am.list.length > 3 ? short(am.list.slice(0, 3)) + " …" : short(am.list);
      return txt("model", t("md_list", { l: short(am.list) }));
    }
    if (d.os === "iOS" || d.os === "iPadOS") return txt("model", t("md_new", { w: screen.width, h: screen.height }));
    const code = (R.hi && R.hi.model) || d.model;
    if ((d.os === "Android" || d.os === "HarmonyOS") && code) {
      const f = "/assets/m/" + bucket(code).toString(16).padStart(2, "0") + ".json";
      const map = await within(fetch(f).then(r => r.ok ? r.json() : null).catch(() => null), 2500, null);
      const name = map && map[code.toUpperCase()];
      R.model = { name: name || null, code };
      if (name) { d.model = name; return txt("model", name + " · " + code); }
      return txt("model", t("md_code", { c: code }));
    }
    // (a battery is only evidence if the lie check didn't already find navigator.getBattery rewritten: the API it
    // calls fake can't be the one that decides the model)
    const batteryTrusted = !(R.lies && R.lies.list.some(x => /getBattery/i.test(x)));
    if (d.kind === "pc" && pcKind({ battery: R.battery, gpu: R.gpuRaw || "", batteryTrusted }) === "laptop") { R.laptop = true; return txt("model", t("md_laptop")); }
    if (d.kind === "pc") return txt("model", t("md_pc"));
    na("model");
  }

  // How the pointer moves before a click: a hand draws a path (a stream of small mousemoves); an AI agent or a script
  // that drives the browser jumps the pointer to the spot and presses at once (one move, far from the last, then
  // pointerdown), and an extension's script clicks with untrusted events (FP-Agent, arXiv 2605.01247). Watched for
  // as long as the page is open, kept in memory only; the row and the automation check follow it.
  const ACT = { moves: [], last: null, smooth: 0, human: 0, jump: 0, untrusted: 0, state: null };
  function actState() {
    if (ACT.untrusted) return "script";
    if (ACT.jump >= 2 && !ACT.human) return "agent";
    if (ACT.human || ACT.smooth >= 30) return "human";
    return null;
  }
  function actPaint() {
    const s = ACT.state, fine = matchMedia("(any-pointer: fine)").matches;
    const text = t(({ human: "ag_human", agent: "ag_agent", script: "ag_script" })[s] || (fine ? "ag_wait" : "ag_touch"));
    if (!done.has("agent")) return txt("agent", text);
    const r = PR.agent; if (r) r.querySelector(".pa").textContent = text;
    if (FR.agent) FR.agent.querySelector("b").textContent = text;
  }
  function actNote() {
    const s = actState();
    if (s === ACT.state) return;
    ACT.state = s;
    actPaint();
    // (a verdict already out takes the agent in)
    if ((s === "agent" || s === "script") && R && R.ck) judge(!!R.end);
  }
  addEventListener("mousemove", e => {
    if (!e.isTrusted) return;
    const now = e.timeStamp, d = ACT.last ? Math.hypot(e.clientX - ACT.last[0], e.clientY - ACT.last[1]) : null;
    ACT.moves.push([now, d]); if (ACT.moves.length > 40) ACT.moves.shift();
    if (d != null && d < 60) ACT.smooth++;
    ACT.last = [e.clientX, e.clientY];
    if (ACT.smooth === 30) actNote();
  }, { capture: true, passive: true });
  addEventListener("pointerdown", e => {
    if (!e.isTrusted || e.pointerType !== "mouse" || e.button !== 0) return;
    const recent = ACT.moves.filter(([at]) => e.timeStamp - at < 300);
    if (recent.length >= 4) ACT.human++;
    else if (recent.length && (recent[0][1] == null || recent[0][1] >= 80)) ACT.jump++;
    actNote();
  }, { capture: true, passive: true });
  // (nothing on this page clicks for the visitor: a click it didn't get from the browser came from someone's script)
  addEventListener("click", e => { if (!e.isTrusted) { ACT.untrusted++; actNote(); } }, { capture: true, passive: true });
  // (a pen or stylus is its own pointer type: a touchscreen with an active pen, or an Apple Pencil, says so)
  addEventListener("pointerdown", e => {
    if (!e.isTrusted || e.pointerType !== "pen" || R.pen) return;
    R.pen = true;
    const a = PR.touch && PR.touch.querySelector(".pa");
    if (a && done.has("touch")) a.textContent += " · " + t("ptr_pen");
  }, { capture: true, passive: true });

  // The browser's own AI (Chrome's Gemini Nano, Edge's Phi): whether the model is on the disk, and which translation
  // languages were downloaded, each one someone translated pages into. availability() only asks: nothing downloads.
  const AI_LANGS = ["zh", "zh-Hant", "ja", "ko", "es", "fr", "de", "pt", "ru", "ar", "hi", "it", "vi", "th", "id", "tr", "pl", "nl", "uk"];
  async function builtinAI() {
    const LM = window.LanguageModel || window.Summarizer, TR = window.Translator;
    if (!LM && !TR) return na("ai");
    const ask = f => within(Promise.resolve().then(f).catch(() => null), 2000, null);
    const [m, pairs] = await Promise.all([LM ? ask(() => LM.availability()) : null,
      TR ? Promise.all(AI_LANGS.map(l => ask(() => TR.availability({ sourceLanguage: "en", targetLanguage: l })).then(a => [l, a]))) : []]);
    const have = pairs.filter(([, a]) => a === "available").map(([l]) => l);
    R.aiLangs = have;
    const name = R.br && R.br.name === "Edge" ? "Phi-4-mini" : "Gemini Nano";
    const parts = [];
    if (m) parts.push(t({ available: "ai_ready", downloadable: "ai_can", downloading: "ai_dl" }[m] || "ai_no", { m: name }));
    if (TR && pairs.some(([, a]) => a)) parts.push(have.length ? t("ai_tr", { l: have.map(language).join(", ") }) : t("ai_tr0"));
    if (!parts.length) return na("ai");
    txt("ai", parts.join(" · "));
  }
  // whether there is a Bluetooth adapter (Chromium answers without asking)
  async function bluetooth() {
    if (!navigator.bluetooth || !navigator.bluetooth.getAvailability) return na("bt");
    const ok = await within(navigator.bluetooth.getAvailability(), 1500, null);
    if (ok == null) return na("bt");
    txt("bt", t(ok ? "v_yes" : "v_no"));
  }
  // the JavaScript engine, from the wording of an error: it can't be changed the way a user agent can
  // Devices a site may already name: once a site has been given a USB, HID or serial device, getDevices/getPorts lists
  // it again without asking, so the list of what is plugged in can follow the permission around
  async function devices() {
    let u = 0, h = 0, s = 0;
    try { if (navigator.usb) u = (await navigator.usb.getDevices()).length; } catch (e) {}
    try { if (navigator.hid) h = (await navigator.hid.getDevices()).length; } catch (e) {}
    try { if (navigator.serial) s = (await navigator.serial.getPorts()).length; } catch (e) {}
    txt("devs", u + h + s ? t("devs_v", { u, h, s }) : t("devs_none"));
  }

  function engine() {
    let m = "";
    try { JSON.parse("null").x; } catch (e) { m = String(e.message); }
    const e = /Cannot read prop/.test(m) ? "V8" : /is null|has no properties/.test(m) ? "SpiderMonkey" : /not an object/.test(m) ? "JavaScriptCore" : null;
    R.engine = e;
    txt("engine", e ? e + " · " + ({ V8: "Chromium", SpiderMonkey: "Firefox", JavaScriptCore: "WebKit" })[e] : t("v_unknown"), { why: m });
  }

  async function battery() {
    if (!navigator.getBattery) return na("battery");
    const b = await within(navigator.getBattery(), 1500, null);
    // a reading that isn't one (a NaN level from a rewritten or a broken API) is a failed read, not a battery: it
    // says nothing about the device (1ms-shell#88)
    const r = b && batteryReading(b);
    if (!r) return na("battery", "v_fail");
    R.battery = r;
    // a desktop reports a full battery that is always charging and never needs to
    if (r.level === 1 && r.charging && r.chargingTime === 0) txt("battery", t("bat_ac"));
    else txt("battery", t("bat_v", { p: Math.round(r.level * 100), s: t(r.charging ? "bat_chg" : "bat_dis") }));
  }

  async function media() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return na("media");
    const l = await within(navigator.mediaDevices.enumerateDevices(), 1500, null);
    if (!l) return na("media");
    const n = k => l.filter(d => d.kind === k).length;
    txt("media", t("med_v", { c: n("videoinput"), m: n("audioinput"), s: n("audiooutput") }));
  }

  // Traces: one random tag in four of the browser's stores, read back on the next visit. A store the browser empties
  // when it closes (or a private window) loses it; any one that keeps it lets a site recognize the visitor even after
  // the others were cleared. The tag stays in this browser, never sent; the fingerprint card's × removes it everywhere.
  const TAG = "who:tag", CACHE = "who-tag";
  const idb = (mode, f) => new Promise((res, rej) => {
    const o = indexedDB.open("who", 1);
    o.onupgradeneeded = () => o.result.createObjectStore("kv");
    o.onerror = () => rej(o.error);
    o.onsuccess = () => { const db = o.result, tx = db.transaction("kv", mode), r = f(tx.objectStore("kv")); tx.oncomplete = () => { db.close(); res(r.result); }; tx.onerror = () => rej(tx.error); };
  });
  const STORES = [
    ["ls", { get: async () => localStorage.getItem(TAG), set: async v => localStorage.setItem(TAG, v), del: async () => localStorage.removeItem(TAG) }],
    ["idb", { get: () => idb("readonly", s => s.get("tag")), set: v => idb("readwrite", s => s.put(v, "tag")), del: async () => indexedDB.deleteDatabase("who") }],
    ["cache", { get: async () => { const r = await (await caches.open(CACHE)).match("/__who_tag"); return r ? r.text() : null; },
      set: async v => (await caches.open(CACHE)).put("/__who_tag", new Response(v)), del: () => caches.delete(CACHE) }],
    // (only a name this page set: another page's own window.name is left alone)
    ["wname", { get: async () => /^who:/.test(window.name) ? window.name.slice(4) : null, set: async v => { if (!window.name || /^who:/.test(window.name)) window.name = "who:" + v; },
      del: async () => { if (/^who:/.test(window.name)) window.name = ""; } }],
  ];
  const tries = f => Promise.all(STORES.map(([, s]) => within(Promise.resolve().then(() => f(s)).catch(() => null), 1500, null)));
  async function traces() {
    const got = await tries(s => s.get());
    const tag = got.find(Boolean) || Math.random().toString(36).slice(2, 10), first = !got.some(Boolean);
    await tries(s => s.set(tag));
    const held = await tries(s => s.get());
    const kept = STORES.filter((_, i) => got[i] === tag).map(([k]) => k), lost = first ? [] : STORES.filter((_, i) => got[i] !== tag).map(([k]) => k);
    const now = STORES.filter((_, i) => held[i] === tag).map(([k]) => k), nm = ks => list(ks.map(k => t("tr_" + k)));
    R.traces = { first, kept, lost, blocked: first && !now.length };
    txt("traces", first ? (now.length ? tn("tr_first", now.length, { n: now.length, list: nm(now) }) : t("tr_none")) : lost.length ? t("tr_some", { kept: nm(kept), lost: nm(lost) }) : t("tr_all", { list: nm(kept) }),
      { why: t("tr_why") });
  }
  const forgetTraces = () => tries(s => s.del());
  // The APIs that reach the machine's hardware and apps, each behind a prompt when used: only whether this browser
  // has them (Chrome ships most, Firefox and Safari refused most), which tells browsers apart before anyone asks
  const APIS = [["WebUSB", () => "usb" in navigator], ["Web Serial", () => "serial" in navigator], ["WebHID", () => "hid" in navigator],
    ["Web MIDI", () => "requestMIDIAccess" in navigator], ["Web NFC", () => "NDEFReader" in window], ["Idle Detection", () => "IdleDetector" in window],
    ["Compute Pressure", () => "PressureObserver" in window], ["Local Font Access", () => "queryLocalFonts" in window], ["Window Management", () => "getScreenDetails" in window],
    ["Contact Picker", () => "contacts" in navigator], ["Installed Related Apps", () => "getInstalledRelatedApps" in navigator], ["File System Access", () => "showOpenFilePicker" in window]];
  function apis() {
    const on = APIS.filter(([, f]) => { try { return f(); } catch (e) { return false; } }).map(([n]) => n);
    R.apis = on;
    txt("apis", on.length ? t("api_v", { n: on.length, of: APIS.length, list: on.join(" · ") }) : t("api_none"), { why: t("api_why") });
  }

  // The probe: this browser's own connection, read whole by a server Cloudflare doesn't stand in front of
  // (probe.1ms.dog, DNS only): the SYN the system opened it with, the TLS ClientHello, the HTTP/2 preface
  const PROBE = "https://probe.1ms.dog/fp";
  const h2Engine = p => ({ "m,a,s,p": "blink", "m,p,a,s": "gecko", "m,s,p,a": "webkit", "m,s,a,p": "webkit" })[p] || (p ? "tool" : null);
  async function probe() {
    let j = null;
    try { const r = await within(fetch(PROBE, { cache: "no-store" }), 6000, null); j = r && r.ok ? await r.json() : null; } catch (e) {}
    R.probe = j;
    const tc = j && j.tcp, tl = j && j.tls, h2 = j && j.http2;
    if (tc) txt("tcpfp", t("tcp_v", { os: t("tos_" + (tc.os || "unix")), ttl: tc.initial_ttl, hops: tc.hops, mtu: tc.mtu || "?" }), { why: t("tcp_why") + "\nJA4T " + tc.ja4t });
    else na("tcpfp", j ? "v_empty" : "v_fail");
    if (tl) txt("ja4", tl.ja4, { why: t("ja4_why") + "\nJA3 " + tl.ja3 });
    else na("ja4", j ? "v_empty" : "v_fail");
    if (h2) txt("h2fp", t("h2_v", { e: t("h2e_" + h2Engine(h2.pseudo)), p: h2.pseudo || "?" }), { why: t("h2_why") + "\n" + h2.akamai + (Array.isArray(h2.settings) && h2.settings.length ? "\nSETTINGS " + h2.settings.join(" · ") : "") + (h2.window_update ? "\nWINDOW_UPDATE " + h2.window_update : "") });
    else na("h2fp", j ? (j.proto === "HTTP/2.0" ? "v_empty" : "v_unsup") : "v_fail");
    // HTTP/3: the probe offers it with its answer; asked again a little later, a browser that takes the offer
    // comes back over QUIC (a firewall that drops UDP keeps it on TCP)
    if (!j) return na("quicfp", "v_fail");
    let q = null;
    for (let i = 0; i < 3 && !(q && q.proto === "HTTP/3.0"); i++) {
      await new Promise(r => setTimeout(r, 700));
      try { const r = await within(fetch(PROBE + "?h3", { cache: "no-store" }), 4000, null); q = r && r.ok ? await r.json() : q; } catch (e) {}
    }
    R.quic = q && q.proto === "HTTP/3.0" ? (q.tls || {}) : null;
    if (R.quic && R.quic.ja4) txt("quicfp", "HTTP/3 · " + R.quic.ja4, { why: t("qf_why") });
    else txt("quicfp", t(q && q.proto === "HTTP/3.0" ? "qf_noja4" : "qf_tcp"), { why: t("qf_why") });
  }

  // Lies: the APIs a spoofer rewrites (what navigator and screen say, how canvas, WebGL and audio draw, the clock,
  // the element sizes), each checked for being the browser's own: its source "[native code]" by a fresh iframe's
  // Function.prototype.toString (the page's own may be rewritten too), no prototype of its own (a native method has
  // none), a getter that refuses a stranger (a native one throws). Then a fresh iframe's readings against the page's:
  // a spoofer that patched the page only leaves the frame telling the truth.
  const LIE_GET = [["Navigator", ["userAgent", "appVersion", "platform", "vendor", "language", "languages", "hardwareConcurrency", "deviceMemory",
    "maxTouchPoints", "webdriver", "plugins", "mimeTypes", "userAgentData", "connection", "doNotTrack", "pdfViewerEnabled"]],
    ["Screen", ["width", "height", "availWidth", "availHeight", "colorDepth", "pixelDepth"]], ["HTMLElement", ["offsetWidth", "offsetHeight"]]];
  const LIE_FN = [["HTMLCanvasElement", ["toDataURL", "toBlob", "getContext"]], ["CanvasRenderingContext2D", ["getImageData", "measureText", "fillText", "isPointInPath"]],
    ["WebGLRenderingContext", ["getParameter", "getExtension", "getSupportedExtensions", "readPixels", "getShaderPrecisionFormat"]], ["WebGL2RenderingContext", ["getParameter", "readPixels"]],
    ["AudioBuffer", ["getChannelData", "copyFromChannel"]], ["AnalyserNode", ["getFloatFrequencyData"]], ["OfflineAudioContext", ["startRendering"]],
    ["Date", ["getTimezoneOffset", "toString"]], ["Element", ["getBoundingClientRect", "getClientRects"]], ["Range", ["getBoundingClientRect", "getClientRects"]],
    ["Navigator", ["getBattery", "sendBeacon"]], ["MediaDevices", ["enumerateDevices"]], ["Permissions", ["query"]], ["Function", ["toString"]], ["Math", ["random"]]];
  function lies() {
    const fr = document.createElement("iframe");
    fr.style.cssText = "position:absolute;width:0;height:0;border:0;visibility:hidden"; fr.setAttribute("aria-hidden", "true"); fr.tabIndex = -1;
    document.body.appendChild(fr);
    const w = fr.contentWindow, src = (w && w.Function.prototype.toString) || Function.prototype.toString, out = [];
    const native = f => { try { return /\{\s*\[native code\]\s*\}\s*$/.test(src.call(f)); } catch (e) { return false; } };
    const check = (name, f, getterOf) => {
      if (typeof f !== "function") return;
      let bad = !native(f) || Object.prototype.hasOwnProperty.call(f, "prototype");
      if (!bad && getterOf) { try { f.call(Object.create(getterOf)); bad = true; } catch (e) { bad = !(e instanceof TypeError) && !(w && e instanceof w.TypeError); } }
      if (bad) out.push(name);
    };
    let n = 0;
    for (const [c, ks] of LIE_GET) { const p = window[c] && window[c].prototype; if (!p) continue;
      for (const k of ks) { const d = Object.getOwnPropertyDescriptor(p, k); if (d && d.get) { n++; check(c + "." + k, d.get, p); } } }
    for (const [c, ks] of LIE_FN) { const o = c === "Math" ? Math : window[c] && window[c].prototype; if (!o) continue;
      for (const k of ks) { const d = Object.getOwnPropertyDescriptor(o, k); if (d && typeof d.value === "function") { n++; check(c + "." + k, d.value); } } }
    // (own properties on navigator or screen: written straight onto the object)
    for (const [o, nm] of [[navigator, "navigator"], [screen, "screen"]]) for (const k of Object.getOwnPropertyNames(o)) out.push(nm + "." + k);
    // the frame's readings against the page's
    const frame = [];
    try {
      const a = navigator, b = w.navigator, same = (k, x, y) => { if (String(x) !== String(y)) frame.push(k); };
      same("userAgent", a.userAgent, b.userAgent); same("platform", a.platform, b.platform); same("languages", a.languages, b.languages);
      same("hardwareConcurrency", a.hardwareConcurrency, b.hardwareConcurrency); same("deviceMemory", a.deviceMemory, b.deviceMemory);
      same("screen", screen.width + "x" + screen.height, w.screen.width + "x" + w.screen.height);
      same("timeZone", Intl.DateTimeFormat().resolvedOptions().timeZone, w.Intl.DateTimeFormat().resolvedOptions().timeZone);
      same("timezoneOffset", new Date().getTimezoneOffset(), new w.Date().getTimezoneOffset());
    } catch (e) {}
    fr.remove();
    R.lies = { n, list: [...new Set(out)], frame };
    const k = R.lies.list.length + frame.length;
    txt("lies", k ? t("ls_v", { k, list: [...R.lies.list, ...frame.map(x => "iframe ≠ " + x)].slice(0, 6).join(" · ") }) : t("ls_none", { n }),
      { why: t("ls_why") + (k ? "\n" + [...R.lies.list, ...frame.map(x => "iframe ≠ " + x)].join("\n") : "") });
  }

  // Whose protection scrambles or hides the readings, told by how it does it: Brave's farbling (noise, and
  // navigator.brave), Firefox's resistFingerprinting (a stand-in clock and card), Firefox's fingerprinting protection
  // (noise per session), Safari's advanced fingerprinting protection (noise), an extension (the drawing functions
  // rewritten), a user-agent switcher (the user agent's getter rewritten)
  function shield() {
    const name = (R.br && R.br.name) || "", L = (R.lies && R.lies.list) || [], noisy = !!(R.noise || R.rand);
    const ext = L.some(x => /Canvas|WebGL|AudioBuffer|Analyser|OfflineAudio/.test(x)), ua = L.some(x => /userAgent|platform|appVersion/.test(x));
    const apple = name === "Safari" || /^(iOS|iPadOS)/.test((R.dev && R.dev.os) || "");
    const k = navigator.brave ? (noisy ? "sh_brave" : "sh_brave_off") : rfp() ? "sh_rfp" : /Firefox/.test(name) && noisy ? "sh_fpp"
      : apple && noisy ? "sh_atfp" : ext ? "sh_ext" : ua ? "sh_ua" : noisy ? "sh_noise" : "sh_none";
    R.shield = k;
    txt("shield", t(k), { why: t("sh_why") });
  }

  // Readings a real browser can't produce: the marks an anti-detect browser or a user-agent switcher leaves, which the
  // lie check doesn't cover because nothing was rewritten — the values are simply impossible together
  function adsp() {
    const L = [], ua = navigator.userAgent || "", mob = /Mobile|Android|iPhone|iPad/.test(ua);
    if (mob && navigator.maxTouchPoints === 0) L.push(t("adsp_mobile"));
    if (screen.availWidth > screen.width || screen.availHeight > screen.height) L.push(t("adsp_screen"));
    if (!outerWidth || !outerHeight || (outerWidth && innerWidth > outerWidth + 2)) L.push(t("adsp_win"));
    if (!mob && R.fonts && R.fonts.length && R.fonts.length < 8) L.push(t("adsp_fonts"));
    txt("adsp", L.length ? t("adsp_v", { list: L.join(" · ") }) : t("adsp_none"));
  }

  // Rendering and engine fingerprints (as CreepJS and BrowserLeaks read them): how this system lays out and draws
  // text and shapes, what its graphics and media stacks offer, what its engine exposes and how fine its clock is.
  // Each varies with the system, its fonts and card, or the browser version; none goes into the fingerprint ID,
  // which stays comparable with earlier visits
  const hhex = async s => { const h = await sha(s); return h.slice(0, 8) + "·" + h.slice(8, 16); };
  async function domRect() {
    const d = document.createElement("div");
    d.style.cssText = "position:absolute;left:-9999px;top:0;font:16px serif;width:max-content";
    d.innerHTML = '<span style="display:inline-block;transform:rotate(7.3deg) skewX(3deg)">Who are you 你是谁 😃</span><span style="font:italic 13px monospace;letter-spacing:.37px">0.123 WWW</span>';
    document.body.appendChild(d);
    const v = [...d.querySelectorAll("span")].flatMap(s => [...s.getClientRects()].map(r => [r.x, r.y, r.width, r.height].map(x => x.toFixed(6)).join(",")));
    const rg = document.createRange(); rg.selectNodeContents(d); const rr = rg.getBoundingClientRect();
    v.push(rr.width.toFixed(6) + "," + rr.height.toFixed(6));
    d.remove();
    txt("domrect", await hhex(v.join("|")), { why: t("dr_why") });
  }
  async function svgRect() {
    const ns = "http://www.w3.org/2000/svg", s = document.createElementNS(ns, "svg"), tx = document.createElementNS(ns, "text");
    s.setAttribute("style", "position:absolute;left:-9999px;top:0"); tx.setAttribute("x", "0"); tx.setAttribute("y", "20"); tx.setAttribute("font-size", "17");
    tx.textContent = "Cwm fjordbank glyphs vext quiz 你是谁 😃";
    s.appendChild(tx); document.body.appendChild(s);
    const b = tx.getBBox(), v = [b.width, b.height, tx.getComputedTextLength(), tx.getSubStringLength(0, 10)].map(x => x.toFixed(6)).join(",");
    s.remove();
    txt("svgrect", await hhex(v), { why: t("dr_why") });
  }
  async function textMetrics() {
    const c = document.createElement("canvas").getContext("2d");
    if (!c) return na("textm");
    const v = ["16px serif", "16px sans-serif", "16px monospace", "italic 15px cursive"].map(f => {
      c.font = f; const m = c.measureText("Who are you? 你是谁 😃 1ms");
      return [m.width, m.actualBoundingBoxAscent, m.actualBoundingBoxDescent, m.actualBoundingBoxLeft, m.actualBoundingBoxRight].map(x => (+x || 0).toFixed(5)).join(",");
    });
    txt("textm", await hhex(v.join("|")), { why: t("tm_why") });
  }
  // a triangle shaded by the card, read back pixel by pixel
  async function glImage() {
    const cv = document.createElement("canvas"); cv.width = cv.height = 64;
    const gl = cv.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) return na("glimg");
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const p = gl.createProgram();
    gl.attachShader(p, sh(gl.VERTEX_SHADER, "attribute vec2 a;varying vec2 v;void main(){v=a;gl_Position=vec4(a,0.,1.);}"));
    gl.attachShader(p, sh(gl.FRAGMENT_SHADER, "precision mediump float;varying vec2 v;void main(){gl_FragColor=vec4(sin(v.x*9.7)*.5+.5,cos(v.y*7.3)*.5+.5,fract(v.x*v.y*37.1),1.);}"));
    gl.linkProgram(p); gl.useProgram(p);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-.9, -.8, .85, -.7, -.1, .95]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(p, "a"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    const px = new Uint8Array(64 * 64 * 4); gl.readPixels(0, 0, 64, 64, gl.RGBA, gl.UNSIGNED_BYTE, px);
    const e = gl.getExtension("WEBGL_lose_context"); if (e) e.loseContext();
    txt("glimg", await hhex(Array.from(px).join(",")), { why: t("gi_why") });
  }
  async function gpuLimits() {
    if (!navigator.gpu) return na("gpulim");
    const a = await within(navigator.gpu.requestAdapter().catch(() => null), 2000, null);
    if (!a) return na("gpulim", "v_empty");
    const lim = []; for (const k in a.limits) lim.push(k + "=" + a.limits[k]);
    const f = [...a.features].sort();
    txt("gpulim", t("gl_v", { n: f.length }) + " · " + await hhex(lim.sort().join(",") + "|" + f.join(",")), { why: t("gpl_why") + (f.length ? "\n" + f.join(" · ") : "") });
  }
  function rtcCodecs() {
    const cap = k => { try { return (RTCRtpSender.getCapabilities(k) || {}).codecs || []; } catch (e) { return []; } };
    if (!window.RTCRtpSender || !RTCRtpSender.getCapabilities) return na("rtccodecs");
    const a = cap("audio"), v = cap("video");
    const names = [...new Set([...a, ...v].map(c => c.mimeType.split("/")[1]))].filter(x => !/^(rtx|red|ulpfec|flexfec-03|CN|telephone-event)$/i.test(x));
    txt("rtccodecs", t("rc_v", { a: a.length, v: v.length }) + " · " + names.join(" "), { why: [...a, ...v].map(c => c.mimeType + (c.sdpFmtpLine ? " " + c.sdpFmtpLine : "")).join("\n") });
  }
  function recMime() {
    if (!window.MediaRecorder || !MediaRecorder.isTypeSupported) return na("recmime");
    const L = ["video/webm;codecs=vp8", "video/webm;codecs=vp9", "video/webm;codecs=av1", "video/webm;codecs=h264", "video/mp4;codecs=avc1", "video/mp4;codecs=hvc1",
      "video/mp4;codecs=av01", "video/x-matroska;codecs=avc1", "audio/webm;codecs=opus", "audio/mp4;codecs=mp4a.40.2", "audio/ogg;codecs=opus", "audio/mpeg"];
    const ok = L.filter(x => { try { return MediaRecorder.isTypeSupported(x); } catch (e) { return false; } });
    txt("recmime", t("rm_v", { n: ok.length, of: L.length }), { why: ok.join("\n") });
  }
  // the engine's surface: how many names the window, an element and the computed style have (each browser version
  // adds some), the clock's step and how deep a function can call itself
  function engineKeys() {
    const w = Object.getOwnPropertyNames(window).length, h = Object.getOwnPropertyNames(HTMLElement.prototype).length, c = getComputedStyle(document.documentElement).length;
    txt("keys", "window " + w + " · HTMLElement " + h + " · CSS " + c, { why: t("ky_why") });
  }
  function timerRes() {
    let m = Infinity, a = performance.now();
    for (let i = 0; i < 20000; i++) { const b = performance.now(); if (b > a) { m = Math.min(m, b - a); a = b; } }
    txt("timer", m === Infinity ? t("v_unknown") : t("ti_v", { v: +m.toFixed(4) }), { why: t("ti_why") });
  }
  function stackDepth() {
    let n = 0; const f = () => { n++; f(); };
    try { f(); } catch (e) {}
    txt("callstack", n.toLocaleString(LANG), { why: t("sk_why") });
  }

  // Tracker blocking, as Cover Your Tracks tests it: seven common trackers' scripts, asked for only when the visitor
  // presses the button (each of these companies then sees the address, as on any page that uses them), without
  // cookies or referrer. Refused at once (under 50 ms) is a blocker's doing, an extension or DNS filter; slower is the
  // network (a firewall, a dead route), not counted as blocked; loaded is let through
  const LIST_SEP = () => /^(zh|ja)/.test(LANG) ? "、" : ", ";
  const TRACKERS = [["Google Analytics","https://www.google-analytics.com/analytics.js"],["Google Ads","https://securepubads.g.doubleclick.net/tag/js/gpt.js"],["Meta Pixel","https://connect.facebook.net/en_US/fbevents.js"],["Microsoft Ads","https://bat.bing.com/bat.js"],["TikTok Pixel","https://analytics.tiktok.com/i18n/pixel/events.js"],["百度统计","https://hm.baidu.com/hm.js"],["Hotjar","https://static.hotjar.com/c/hotjar-0.js?sv=6"]];
  function trackers() {
    row("trackers", `<button type="button" class="pa-go tr-go">${esc(t("tk_btn"))}</button>`, { why: t("tk_why") });
    $('.pr[data-s="trackers"] .tr-go').onclick = async e => {
      e.target.disabled = true; e.target.textContent = t("re_wait");
      const res = await Promise.all(TRACKERS.map(async ([name, url]) => {
        const t0 = performance.now();
        try { return [name, await within(fetch(url, { mode: "no-cors", credentials: "omit", cache: "no-store", referrerPolicy: "no-referrer" }).then(() => "ok"), 6000, "net")]; }
        catch (x) { return [name, performance.now() - t0 < 50 ? "blocked" : "net"]; }
      }));
      const by = k => res.filter(([, v]) => v === k).map(([n]) => n === "百度统计" ? t("tk_baidu") : n);
      const b = by("blocked"), ok = by("ok"), net = by("net");
      const a = $('.pr[data-s="trackers"] .pa');
      a.textContent = t("tk_v", { b: b.length, n: TRACKERS.length }) + (ok.length ? " · " + t("tk_ok", { list: ok.join(LIST_SEP()) }) : "") + (net.length ? " · " + t("tk_net", { list: net.join(LIST_SEP()) }) : "");
      $('.pr[data-s="trackers"]').dataset.why = t("tk_why") + (b.length ? "\n" + t("tk_blocked", { list: b.join(LIST_SEP()) }) : "");
    };
  }

  // A hardware ID: only what the machine decides (the system family, the screen in physical pixels and its colors,
  // the cores, the graphics card, the time zone, the installed fonts), so another browser on this machine gets about
  // the same; what the browser decides (its engine's maths, its audio, canvas noise) is left out
  async function hwid() {
    const fam = ((R.dev && R.dev.os) || "").split(" ")[0], gpu = (R.gpu || "").replace(/,? or similar$/, "");
    const parts = [fam, R.screen, screen.colorDepth + "-bit", navigator.hardwareConcurrency, gpu, R.tz, (R.fonts || []).length + " fonts"];
    const h = await sha([fam, R.screen, screen.colorDepth, navigator.hardwareConcurrency, gpu, R.tz, (R.fonts || []).slice().sort().join(",")].join("|"));
    R.hwid = h.slice(0, 8);
    txt("hwid", h.slice(0, 4) + "·" + h.slice(4, 8) + " · " + t("hw_v"), { why: t("hw_why") + "\n" + parts.filter(Boolean).join(" · ") });
  }
  // The cache as an ID: the site hands out a random ID as the answer's ETag; the browser sends it back by itself next
  // time (If-None-Match), past cleared cookies and storage, until the cache itself is cleared (src/worker.js etag())
  async function etagId() {
    try {
      const r = await within(fetch("/api/etag"), 4000, null);
      if (!r || !r.ok) return na("etag", "v_fail");
      const id = (await r.text()).slice(0, 16), seen = r.headers.get("X-Etag-Seen") === "1";
      R.etag = { id, seen };
      txt("etag", id.slice(0, 4) + "·" + id.slice(4, 8) + " · " + t(seen ? "et_seen" : "et_new"), { why: t("et_why") });
    } catch (e) { na("etag", "v_fail"); }
  }

  // Two readings that need the visitor's yes, each behind its own button, kept in the page (nothing sent): where the
  // device says it is, against where the address puts it; and the motion sensors, whose noise and rate differ from
  // one phone to the next (their calibration is a fingerprint of its own)
  const km = (a, b, c, d) => { const r = x => x * Math.PI / 180, h = Math.sin(r(c - a) / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(r(d - b) / 2) ** 2; return 12742 * Math.asin(Math.sqrt(h)); };
  function geoloc() {
    if (!navigator.geolocation) return na("geoloc");
    row("geoloc", `<button type="button" class="pa-go gl-go">${esc(t("gl_btn"))}</button>`, { why: t("gl_why") });
    $('.pr[data-s="geoloc"] .gl-go').onclick = e => {
      e.target.disabled = true; e.target.textContent = t("re_wait");
      const a = $('.pr[data-s="geoloc"] .pa');
      navigator.geolocation.getCurrentPosition(p => {
        const c = (R.srv && R.srv.cf) || {}, { latitude: la, longitude: lo, accuracy: ac } = p.coords;
        const d = c.latitude != null ? km(+c.latitude, +c.longitude, la, lo) : null;
        a.textContent = t("geo_v", { acc: Math.round(ac) }) + (d == null ? "" : " · " + t(d < 25 ? "gl_near" : "gl_far", { km: Math.round(d).toLocaleString(LANG) }));
      }, err => { a.textContent = t(err.code === 1 ? "gl_denied" : "gl_fail"); }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
    };
  }
  function sensors() {
    if (!window.DeviceMotionEvent || !matchMedia("(pointer: coarse)").matches) return na("sensors");
    row("sensors", `<button type="button" class="pa-go sn-go">${esc(t("sn_btn"))}</button>`, { why: t("sn_why") });
    $('.pr[data-s="sensors"] .sn-go').onclick = async e => {
      const a = $('.pr[data-s="sensors"] .pa');
      e.target.disabled = true;
      // (iOS asks first)
      if (typeof DeviceMotionEvent.requestPermission === "function") {
        try { if (await DeviceMotionEvent.requestPermission() !== "granted") { a.textContent = t("gl_denied"); return; } } catch (x) { a.textContent = t("gl_denied"); return; }
      }
      e.target.textContent = t("sn_hold");
      const s = [], on = ev => { const g = ev.accelerationIncludingGravity || {}, r = ev.rotationRate || {}; s.push([g.x, g.y, g.z, r.alpha, r.beta, r.gamma, ev.interval]); };
      addEventListener("devicemotion", on);
      await new Promise(r => setTimeout(r, 1500));
      removeEventListener("devicemotion", on);
      if (s.length < 5) { a.textContent = t("sn_none"); return; }
      const col = i => s.map(x => +x[i] || 0), mean = v => v.reduce((p, q) => p + q, 0) / v.length;
      const sd = v => { const m = mean(v); return Math.sqrt(mean(v.map(x => (x - m) ** 2))); };
      const hz = Math.round(1000 / (mean(col(6)) || (1500 / s.length)) ) || Math.round(s.length / 1.5);
      const noise = mean([0, 1, 2].map(i => sd(col(i))));
      const id = await hhex([0, 1, 2, 3, 4, 5].map(i => mean(col(i)).toFixed(3)).join(","));
      a.textContent = t("sn_v", { hz, n: noise.toFixed(4) }) + " · " + id;
    };
  }

  // An IPv6 address of this browser's (the page's, Radar's, WebRTC's) built from the network card's MAC: then the
  // address carries the card's hardware ID, the same on every network it joins. Otherwise its type still says
  // something: a 6to4 or Teredo tunnel (an old way through IPv4), or interface IDs that change between destinations
  // (the temporary addresses browsers use on purpose)
  function v6mac() {
    const ips = [R.srv && R.srv.ip, ...(R.stack || []), ...(Array.isArray(R.rtc) ? R.rtc : [])].filter(ip => ip && String(ip).includes(":"));
    if (!ips.length) return na("v6mac", "v_empty");
    const mac = ips.map(macOf).find(Boolean), type = R.v6type = v6Type(ips);
    R.v6mac = mac || null;
    const val = mac ? t("mac_v", { mac }) : type === "6to4" ? t("v6_6to4") : type === "teredo" ? t("v6_teredo")
      : type === "temporary" ? t("mac_none") + " · " + t("v6_tmp") : t("mac_none");
    txt("v6mac", val, { why: t("mac_why") });
  }
  // The ICU data the browser carries: how many time zones, currencies, units and calendars Intl knows. Each version
  // of each engine has its own counts; a browser that trims them (to be smaller) shows it
  function icu() {
    if (!Intl.supportedValuesOf) return na("icu");
    const K = ["timeZone", "currency", "unit", "calendar", "collation", "numberingSystem"];
    const c = K.map(k => { try { return Intl.supportedValuesOf(k).length; } catch (e) { return 0; } });
    txt("icu", t("icu_v", { tz: c[0], cur: c[1], u: c[2], cal: c[3] }), { why: t("icu_why") + "\n" + K.map((k, i) => k + " " + c[i]).join(" · ") });
  }
  // How wide the system draws a scrollbar: Windows and most Linux a classic one, macOS, iOS and Android an overlay one
  function scrollbar() {
    const d = document.createElement("div");
    d.style.cssText = "position:absolute;top:-999px;left:0;width:100px;height:100px;overflow:scroll;scrollbar-width:auto";
    document.body.appendChild(d);
    const w = d.offsetWidth - d.clientWidth;
    d.remove();
    R.sbw = w;
    txt("scrollbar", w ? t("sb_v", { w }) : t("sb_overlay"), { why: t("sb_why") });
  }
  // Extensions found by a file they let pages load (Chromium only: Firefox gives each install its own random address)
  const EXTS = [["MetaMask", "nkbihfbeogaeaoehlefnkodbefgpgknn", ["scripts/inpage.js", "inpage.js"]], ["Phantom", "bfnaelmomeimhlpmgjnjophhpkkoljpa", ["injected.js"]],
    ["LastPass", "hdokiejnpimakedhajhdlcegeplioahd", ["overlay.html", "images/icon48.png"]], ["Bitwarden", "nngceckbapebfimnlniiiahkandclblb", ["notification/bar.html", "overlay/menu-list.html"]],
    ["1Password", "aeblfdkhhhdcdjpifhhbdiojplfjncoa", ["inline/injected.js"]], ["Google Translate", "aapbdbdomjkkjkaonfhkkikfgjllcleb", ["popup_css_compiled.css"]],
    ["Honey", "bmnlcjabgnpnenekpadlanbbkooimhnj", ["icons/icon48.png"]], ["AdBlock", "gighmmpiobklfepjocnamgkkbiglidom", ["icons/icon24.png"]],
    ["Adblock Plus", "cfhdojbkjhnklbpkdaibdccddilifddb", ["icons/abp-16.png"]], ["Tampermonkey", "dhdgffkkebhmkfjojejmpbldmpobfkfo", ["images/icon.png"]],
    ["Wappalyzer", "gppongmhjkpfnbhagpmjfkannfbllamg", ["images/icons/default.svg"]], ["Proxy SwitchyOmega", "padekgcemlokbadohgkifijomclgjgif", ["img/icons/omega-48.png"]],
    ["ZeroOmega", "pfnededegaaopdmhkdmcofjmoldfiped", ["img/icons/omega-48.png"]], ["Immersive Translate", "bpoadfkcbjbfhfodiogcnhhhpibjhbnh", ["styles/inject.css"]],
    ["ColorZilla", "bhlhnicpbhignbdhedgjhgdocnmhomnp", ["html/content-script-iframe.html"]]];
  async function extFiles() {
    if (R.engine !== "V8" || /Firefox/.test(navigator.userAgent)) return na("extwar", "xw_na");
    const hit = await Promise.all(EXTS.map(async ([name, id, files]) => {
      for (const f of files) { const r = await within(fetch(`chrome-extension://${id}/${f}`, { cache: "no-store" }).then(x => x.ok, () => false), 1500, false); if (r) return name; }
      return null;
    }));
    const found = hit.filter(Boolean);
    R.extwar = found;
    txt("extwar", found.length ? t("xw_v", { n: EXTS.length, list: found.join(" · ") }) : t("xw_none", { n: EXTS.length }), { why: t("xw_why") });
  }
  // The newest CSS features this engine has, each with the Chromium version that brought it: the level the engine
  // really is, set against the version the user agent claims
  const CSSV = [[105, "selector(:has(*))"], [111, "color: color-mix(in srgb, red, blue)"], [114, "text-wrap: balance"], [115, "animation-timeline: scroll()"],
    [117, "transition-behavior: allow-discrete"], [123, "field-sizing: content"], [125, "anchor-name: --a"], [129, "interpolate-size: allow-keywords"],
    [133, "text-box: trim-both cap alphabetic"], [137, "reading-flow: flex-visual"]];
  function cssLevel() {
    if (R.engine !== "V8" || !window.CSS || !CSS.supports) return na("cssv", "xw_na");
    let v = 0, miss = null;
    for (const [ver, q] of CSSV) { let ok = false; try { ok = CSS.supports(q); } catch (e) {} if (ok) v = ver; else if (miss == null) miss = ver; }
    R.cssv = { v, miss };
    txt("cssv", v ? t("cv_v", { v }) : t("v_unknown"), { why: t("cv_why") });
  }
  // How the system smooths text: subpixel (colored fringes, as ClearType), grayscale, or not at all
  function smoothing() {
    const c = document.createElement("canvas"); c.width = 140; c.height = 30;
    const x = c.getContext("2d", { alpha: false });
    if (!x) return na("smooth");
    x.fillStyle = "#fff"; x.fillRect(0, 0, 140, 30); x.fillStyle = "#000"; x.font = "16px sans-serif"; x.fillText("Wwg ii 你好 Ma", 2, 21);
    const d = x.getImageData(0, 0, 140, 30).data; let gray = 0, color = 0;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      if (Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b)) > 8) color++; else if (r > 0 && r < 255) gray++;
    }
    txt("smooth", t(color > 10 ? "sm_sub" : gray > 10 ? "sm_gray" : "sm_off"), { why: t("sm_why") });
  }

  async function storage() {
    if (!navigator.storage || !navigator.storage.estimate) return na("storage");
    const e = await within(navigator.storage.estimate(), 1500, null);
    if (!e || !e.quota) return na("storage");
    txt("storage", t("sto_v", { n: e.quota >= 1e9 ? Math.round(e.quota / 1e9) + " GB" : Math.round(e.quota / 1e6) + " MB" }));
  }

  // What gives an automation tool away in the page itself, read without a permission: a headless browser's traces, a
  // driver's injected globals (Selenium, Puppeteer, Playwright, PhantomJS, Nightmare), or an Electron app's process.
  // One weak headless sign alone proves nothing; two, or the user agent's own "HeadlessChrome", do
  function autoTraces() {
    const w = window, ua = navigator.userAgent, says = [];
    const chromeUA = /Chrome\/|Chromium\/|Edg\//.test(ua) && !/Android/.test(ua);
    if (/HeadlessChrome/i.test(ua)) says.push("HeadlessChrome in the user agent");
    if (w.outerWidth === 0) says.push("outerWidth 0");
    if (w.outerHeight === 0) says.push("outerHeight 0");
    if (innerWidth === 0) says.push("innerWidth 0");
    if (!(navigator.languages || []).length) says.push("navigator.languages empty");
    if (chromeUA && !w.chrome) says.push("no window.chrome");
    const headless = /HeadlessChrome/i.test(ua) || says.length >= 2;
    const globals = Object.keys(w).filter(k => /^(cdc_|__playwright|__puppeteer|__nightmare|callPhantom|_phantom|domAutomation|_selenium)/.test(k));
    const electron = !!(w.process && w.process.versions && w.process.versions.electron);
    const list = [...(headless ? ["headless"] : []), ...(globals.length ? ["cdp"] : []), ...(electron ? ["electron"] : [])];
    return { list, why: [...says, ...(globals.length ? ["driver globals: " + globals.join(", ")] : []), ...(electron ? ["process.versions.electron " + w.process.versions.electron] : [])].join("\n") };
  }

  // settings and preferences the browser shares
  function prefs() {
    R.dark = mq("(prefers-color-scheme: dark)");
    txt("scheme", t(R.dark ? "sch_dark" : "sch_light") + (mq("(prefers-contrast: more)") ? " · " + t("sch_contrast") : "") + (mq("(forced-colors: active)") ? " · forced-colors" : ""));
    R.rm = mq("(prefers-reduced-motion: reduce)"); R.hc = mq("(prefers-contrast: more)") || mq("(forced-colors: active)");
    txt("motion", t(R.rm ? "mo_reduce" : "mo_no"));
    const g = mq("(color-gamut: rec2020)") ? "Rec.2020" : mq("(color-gamut: p3)") ? "Display P3" : mq("(color-gamut: srgb)") ? "sRGB" : "–";
    txt("gamut", g + " · " + (mq("(dynamic-range: high)") ? "HDR" : "SDR") + (mq("(video-dynamic-range: high)") ? " · " + t("gamut_hdrv") : ""));
    const dnt = navigator.doNotTrack === "1" || window.doNotTrack === "1";
    txt("dnt", "DNT " + t(dnt ? "v_on" : "v_off") + " · GPC " + t(navigator.globalPrivacyControl ? "v_on" : "v_off"));
    txt("cookies", t(navigator.cookieEnabled ? "v_on" : "v_off"));
    if (navigator.pdfViewerEnabled != null) txt("pdf", t(navigator.pdfViewerEnabled ? "v_yes" : "v_no")); else na("pdf");
    R.webdriver = !!navigator.webdriver;
    txt("webdriver", t(R.webdriver ? "wd_yes" : "wd_no"));
    // (a headless browser, a driver's injected globals, or an Electron app: the page itself says so, no permission)
    const at = autoTraces();
    R.auto = at.list;
    txt("auto", R.auto.length ? R.auto.map(k => t("auto_" + k)).join(" · ") : t("auto_none"), { why: at.why });
    // (the identity strings a user-agent switcher forgets: they say Chromium, Firefox or WebKit on their own)
    R.vendor = navigator.vendor; R.productSub = navigator.productSub;
    const plugins = navigator.plugins ? [...navigator.plugins].map(x => x.name) : [];
    txt("idstr", [navigator.vendor || "–", navigator.productSub || "–", t("id_plugins", { n: plugins.length })].join(" · "), { why: plugins.join("\n") });
    // the window, and what the system's bar (taskbar, Dock) takes off the screen
    txt("win", t("win_v", { w: innerWidth, h: innerHeight, tb: Math.max(0, screen.height - screen.availHeight) }));
    const a11y = [["(prefers-contrast: more)", "a11y_contrast"], ["(forced-colors: active)", "a11y_forced"], ["(prefers-reduced-transparency: reduce)", "a11y_transp"], ["(inverted-colors: inverted)", "a11y_invert"], ["(prefers-reduced-data: reduce)", "a11y_data"], ["(update: slow)", "a11y_slow"]]
      .filter(([q]) => mq(q)).map(([, k]) => t(k));
    txt("a11y", a11y.length ? list(a11y) : t("a11y_none"));
    const dm = ["fullscreen", "standalone", "minimal-ui"].find(m => mq(`(display-mode: ${m})`));
    // (a foldable's own API, where the browser has it: the shape the device is held in, beyond the media query above)
    const pos = navigator.devicePosture && navigator.devicePosture.type;
    txt("display", t(dm === "fullscreen" ? "dm_full" : dm ? "dm_app" : "dm_tab") + (mq("(device-posture: folded)") ? " · " + t("dm_folded") : "") + (pos ? " · " + t("dm_posture", { p: pos }) : ""));
  }

  // What the browser offers a site to target ads with, cookies aside (Chrome's Privacy Sandbox). It changes with the
  // version, the region and the visitor's own settings; the row names what is here rather than judging it
  function sandbox() {
    const L = [], w = window;
    if ("browsingTopics" in document) L.push("Topics");
    if (typeof navigator.runAdAuction === "function") L.push("Protected Audience");
    if (w.sharedStorage) L.push("Shared Storage");
    if (w.attributionReporting) L.push("Attribution Reporting");
    txt("psb", L.length ? t("psb_v", { list: L.join(" · ") }) : t("psb_none"));
  }

  // an element with the class names ad blockers hide: if it has no height, something hid it
  // Two baits: an element named like an ad (blockers that hide them), and a request for Google's ad script (blockers
  // that only block requests, like uBlock Origin Lite). The request counts only when google.com itself answers: a
  // network that can't reach Google at all says nothing
  async function adblock() {
    await new Promise(r => setTimeout(r, 120));
    const el = $("#ad-slot"), cs = el && getComputedStyle(el);
    const hid = !el || el.offsetHeight === 0 || cs.display === "none" || cs.visibility === "hidden";
    const reach = u => within(fetch(u, { method: "HEAD", mode: "no-cors", cache: "no-store", credentials: "omit" }).then(() => true, () => false), 3000, null);
    const [ad, g] = hid ? [true, true] : await Promise.all([reach("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"), reach("https://www.google.com/generate_204")]);
    const net = !hid && ad === false && g === true;
    R.adblock = hid || net;
    txt("adblock", t(hid ? "ab_on" : net ? "ab_on_net" : "ab_off"));
  }

  // Fonts: a word set in a font is measured against the generic fallbacks; a different width means the font is there.
  const FONTS = ["Segoe UI", "Calibri", "Cambria", "Consolas", "Microsoft YaHei", "SimSun", "Microsoft JhengHei", "Yu Gothic", "Meiryo", "MS Gothic",
    "Malgun Gothic", "Leelawadee UI", "Nirmala UI", "Helvetica Neue", "PingFang SC", "PingFang TC", "Hiragino Sans", "Apple SD Gothic Neo", "Menlo",
    "Avenir", "Songti SC", "Ubuntu", "DejaVu Sans", "Liberation Sans", "Noto Sans CJK SC", "WenQuanYi Micro Hei", "Cantarell", "Roboto", "Noto Color Emoji",
    "Aptos", "Myriad Pro", "Minion Pro", "Source Han Sans", "Adobe Clean", "JetBrains Mono", "Fira Code", "Cascadia Code", "Source Code Pro", "Hack", "Inconsolata",
    "Comic Sans MS", "Arial", "Times New Roman", "Courier New", "Verdana", "Georgia"];
  function fonts() {
    const c = document.createElement("canvas").getContext("2d");
    if (!c) { R.fonts = []; na("fonts"); return; }
    const W = "mmmmmmmmmlli你是谁あア한1WO@", base = ["monospace", "sans-serif", "serif"];
    const w = f => { c.font = "72px " + f; return c.measureText(W).width; };
    const b = base.map(w);
    R.fonts = FONTS.filter(f => base.some((g, i) => w(`"${f}", ${g}`) !== b[i]));
    R.sysFonts = SYS_FONT_LIST.filter(f => base.some((g, i) => w(`"${f}", ${g}`) !== b[i]));
    const val = t("fonts_v", { n: R.fonts.length, of: FONTS.length }) + " " + R.fonts.join(", ");
    // the browser's own list of every installed font, behind its permission prompt, for the browsers that have the
    // Local Font Access API (Chromium): asked only when the visitor clicks
    const lf = window.queryLocalFonts ? `<button type="button" class="pa-go lf-go">${esc(t("lf_btn"))}</button>` : "";
    row("fonts", esc(val) + lf, { why: R.fonts.join(", ") });
    const btn = $(".pr[data-s=\"fonts\"] .lf-go");
    if (btn) btn.onclick = async () => {
      btn.disabled = true; btn.textContent = t("lf_wait");
      const back = v => { done.delete("fonts"); row("fonts", esc(val + " · " + v), { why: R.fonts.join(", ") }); };
      try {
        const all = await window.queryLocalFonts();
        const fam = [...new Set(all.map(f => f.family))].sort((a, b) => a.localeCompare(b));
        R.localFonts = fam;
        back(t("lf_n", { n: fam.length }) + (fam.length ? " " + fam.slice(0, 24).join(", ") + (fam.length > 24 ? " …" : "") : ""));
      } catch (e) { back(t("lf_no")); }
    };
  }

  // A photo's own small print: the camera or phone that took it, the moment, often the place. Read here, in this tab:
  // the file never leaves the browser, and the page has no upload to leave by
  function exif() {
    row("exif", esc(t("ex_none")) + `<button type="button" class="pa-go ex-go">${esc(t("ex_btn"))}</button>`, { why: t("ex_why") });
    const el = $('.pr[data-s="exif"] .ex-go'); if (!el) return;
    const inp = document.createElement("input");
    inp.type = "file"; inp.accept = "image/jpeg,image/jpg"; inp.hidden = true; document.body.appendChild(inp);
    el.onclick = () => inp.click();
    inp.onchange = async () => {
      const f = inp.files && inp.files[0]; if (!f) return;
      el.disabled = true; el.textContent = t("ex_wait");
      let b = null; try { b = new Uint8Array(await f.arrayBuffer()); } catch (e) {}
      const e = b ? exifOf(b) : null;
      const v = e ? [e.cam, e.time, e.lat != null ? t("ex_gps", { lat: e.lat.toFixed(4), lon: e.lon.toFixed(4) }) : null, e.soft].filter(Boolean).join(" · ") : "";
      done.delete("exif");
      row("exif", esc(v || t("ex_read0")), { why: t("ex_why") });
      el.remove(); inp.remove();
    };
  }
  // Cross-site: this page frames cross.1ms.one, another domain of this tool, which writes a SameSite=None cookie, a
  // Partitioned one (CHIPS) and a localStorage tag, then says which of them it could write and read back. It is the
  // one question a page can't ask its own domain, and the frame keeps nothing: its cookie names nobody and the server
  // sets it to expire in 30 seconds. Asked when the visitor clicks, never on its own, and nothing is sent anywhere.
  const XS = "https://cross.1ms.one";
  function xsite() {
    row("xsite", esc(t("xs_none")) + `<button type="button" class="pa-go xs-go">${esc(t("xs_btn"))}</button>`, { why: t("xs_why") });
    const btn = $('.pr[data-s="xsite"] .xs-go'); if (!btn) return;
    btn.onclick = async () => {
      btn.disabled = true; btn.textContent = t("xs_wait");
      const a = await new Promise(resolve => {
        const f = document.createElement("iframe");
        f.title = "cross-site"; f.tabIndex = -1; f.referrerPolicy = "no-referrer";
        f.style.cssText = "position:fixed;left:-20px;top:0;width:2px;height:2px;border:0;opacity:0";
        const end = v => { removeEventListener("message", msg); clearTimeout(timer); f.remove(); resolve(v); };
        const msg = e => { if (e.origin === XS && e.source === f.contentWindow && e.data && typeof e.data.c3p === "boolean") end(e.data); };
        const timer = setTimeout(() => end(null), 8000);
        addEventListener("message", msg);
        f.src = XS + "/f";
        document.body.appendChild(f);
      });
      done.delete("xsite");
      if (!a) { row("xsite", esc(t("xs_fail")), { why: t("xs_why"), na: true }); return; }
      const yn = v => t(v ? "xs_yes" : "xs_no");
      row("xsite", esc(t(a.c3p ? "xs_share" : a.chips ? "xs_chips" : "xs_block")),
        { why: t("xs_why2", { c: yn(a.c3p), p: yn(a.chips), s: yn(a.ls) }) });
    };
  }
  // fingerprints: the same drawing, sound or setup comes out slightly differently on every system
  function canvasPrint() {
    const cv = document.createElement("canvas"); cv.width = 280; cv.height = 60;
    const c = cv.getContext("2d"); if (!c) return null;
    const g = c.createLinearGradient(0, 0, 280, 0); g.addColorStop(0, "#f60"); g.addColorStop(1, "#06c");
    c.fillStyle = g; c.fillRect(0, 0, 280, 60);
    c.textBaseline = "top"; c.font = "18px Arial"; c.fillStyle = "#069"; c.fillText("Who are you? 你是谁 😃 1ms", 4, 8);
    c.font = "bold 15px serif"; c.fillStyle = "rgba(255,255,255,.7)"; c.fillText("Cwm fjordbank glyphs vext quiz", 6, 32);
    c.beginPath(); c.arc(250, 30, 18, 0, Math.PI * 2); c.strokeStyle = "#fc0"; c.lineWidth = 3; c.stroke();
    return cv.toDataURL();
  }
  async function audioPrint() {
    const AC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!AC) return null;
    const ctx = new AC(1, 5000, 44100), o = ctx.createOscillator(), k = ctx.createDynamicsCompressor();
    o.type = "triangle"; o.frequency.value = 10000;
    k.threshold.value = -50; k.knee.value = 40; k.ratio.value = 12; k.attack.value = 0; k.release.value = 0.25;
    o.connect(k); k.connect(ctx.destination); o.start(0);
    const buf = await within(ctx.startRendering(), 2000, null);
    if (!buf) return null;
    const d = buf.getChannelData(0); let s = 0;
    for (let i = 4500; i < 5000; i++) s += Math.abs(d[i]);
    return s.toString();
  }
  async function audioNoise() {
    const O = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!O || !window.ConstantSourceNode) return false;
    const c = new O(1, 4096, 44100), s = c.createConstantSource();
    s.offset.value = 0.5; s.connect(c.destination); s.start();
    const b = await c.startRendering(), d = b.getChannelData(0);
    return d.some(v => v !== 0.5);
  }
  async function prints(glInfo) {
    const short = h => h.slice(0, 8) + "·" + h.slice(8, 16);
    const c1 = canvasPrint(), c2 = canvasPrint();
    const ch = c1 ? await sha(c1) : null;
    if (ch) txt("canvas", short(ch)); else na("canvas");
    const gh = glInfo ? await sha(glInfo) : null;
    if (gh) txt("webgl", short(gh));
    const a = await audioPrint().catch(() => null), ah = a ? await sha(a) : null;
    if (ah) txt("audio", short(ah)); else na("audio");
    const fh = await sha(R.fonts.join(","));
    txt("fontfp", short(fh));
    // a browser that adds noise to protect the visitor draws the same picture differently each time
    R.rand = !!(c1 && c2 && c1 !== c2);
    // A square of two colours read back pixel for pixel: exact everywhere, unless the browser adds noise to what pages
    // read (Brave per site and session; Firefox's fingerprinting protection per session, which leaves a picture of a
    // single colour alone): then the fingerprint changes from site to site, or from one session to the next
    try {
      const cv = document.createElement("canvas"); cv.width = cv.height = 32;
      const x = cv.getContext("2d"); x.fillStyle = "rgb(100,150,200)"; x.fillRect(0, 0, 16, 32); x.fillStyle = "rgb(200,90,40)"; x.fillRect(16, 0, 16, 32);
      const px = x.getImageData(0, 0, 32, 32).data, want = (i, k) => (((i >> 2) % 32) < 16 ? [100, 150, 200, 255] : [200, 90, 40, 255])[k];
      R.noise = px.some((v, i) => v !== want(i, i % 4));
    } catch (e) { R.noise = false; }
    // A checkerboard of single pixels read back: an extension that marks only the pixels unlike all four neighbours
    // (my-fingerprint) leaves the square alone but not this; and a constant sound rendered and read back, which an
    // extension nudging every so many non-zero samples gives back changed
    try {
      const cv = document.createElement("canvas"); cv.width = cv.height = 16;
      const x = cv.getContext("2d"), A = [30, 160, 90], B = [220, 60, 140];
      for (let y = 0; y < 16; y++) for (let i = 0; i < 16; i++) { x.fillStyle = "rgb(" + ((i + y) % 2 ? B : A) + ")"; x.fillRect(i, y, 1, 1); }
      const px = x.getImageData(0, 0, 16, 16).data;
      R.pxNoise = px.some((v, i) => { const p = i >> 2, k = i % 4; return v !== (k === 3 ? 255 : (((p % 16) + (p >> 4)) % 2 ? B : A)[k]); });
      if (R.pxNoise) R.noise = true;
    } catch (e) { R.pxNoise = false; }
    R.auNoise = await audioNoise().catch(() => false);
    txt("rand", t(R.rand ? "rand_yes" : "rand_no"));
    // everything that stays put on this device and browser; the address is left out, so it survives a VPN
    const all = [ch, gh, ah, fh, screen.width + "x" + screen.height + "x" + screen.colorDepth, devicePixelRatio, R.tz, (R.langs || []).join(), navigator.hardwareConcurrency,
      navigator.deviceMemory, navigator.platform, navigator.maxTouchPoints].join("|");
    R.fpHex = await sha(all); R.fp = short(R.fpHex);
    R.fpParts = { canvas: ch && ch.slice(0, 8), webgl: gh && gh.slice(0, 8), audio: ah && ah.slice(0, 8), fontfp: fh.slice(0, 8),
      screen: screen.width + "x" + screen.height, tz: R.tz, langs: (R.langs || []).join() };
    txt("fpid", R.fp);
  }

  // WebRTC: the public addresses STUN servers see, which can be another than the one the page's requests come from
  async function webrtc() {
    if (!window.RTCPeerConnection) { R.rtc = false; na("lan", "rtc_off"); return txt("webrtc", t("rtc_off")); }
    const ips = new Set(), lan = new Set();
    const one = async url => {
      let pc;
      try {
        pc = new RTCPeerConnection({ iceServers: [{ urls: url }] });
        pc.createDataChannel("x");
        const fin = new Promise(res => {
          pc.onicecandidate = e => {
            if (!e.candidate) return res();
            const m = (e.candidate.candidate || "").match(/ ([0-9a-f.:]+) \d+ typ srflx/i);
            if (m) ips.add(m[1]);
            const h = (e.candidate.candidate || "").match(/ (\S+) \d+ typ host/i);
            if (h) lan.add(h[1]);
          };
          setTimeout(res, 3500);
        });
        await pc.setLocalDescription(await pc.createOffer());
        await fin;
      } catch (e) {} finally { try { pc && pc.close(); } catch (e) {} }
    };
    await Promise.all(["stun:stun.cloudflare.com:3478", "stun:stun.l.google.com:19302"].map(one));
    R.rtc = [...ips];
    // IPv4 first, each public address linked to its network
    R.rtc.sort((x, y) => x.includes(":") - y.includes(":"));
    if (R.rtc.length) row("webrtc", R.rtc.map(ipLink).join(", ")); else na("webrtc", "rtc_none");
    // local addresses as they are; an mDNS name (a random one ending in .local) only says the browser hides them
    const local = [...lan], shown = local.filter(x => !/\.local$/i.test(x)), mdns = local.length > shown.length;
    if (shown.length || mdns) txt("lan", [...shown, mdns ? t("lan_mdns") : ""].filter(Boolean).join(", "), mdns ? { why: t("lan_mdns_why") } : {});
    else na("lan", "v_empty");
  }

  // The address each kind of destination sees: a site in mainland China, an IP service abroad, two AI services and
  // Cloudflare (its trace on each service's own domain). A rule-based proxy or VPN picks the route by destination.
  const EXITS = [
    ["ex_cn", () => getJ("https://myip.ipip.net/json").then(b => ({ ip: b.data.ip, cc: null, note: (b.data.location || []).filter(Boolean).join(" ") }))],
    ["ex_intl", () => getJ("https://api.ip.sb/geoip").then(b => ({ ip: b.ip, cc: b.country_code, note: b.isp || b.asn_organization || "" }))],
    ...[["ex_gpt", "chatgpt.com"], ["ex_claude", "claude.ai"], ["ex_cf", "www.cloudflare.com"]].map(([id, host]) => [id, () => getT(`https://${host}/cdn-cgi/trace`).then(s => {
      const v = Object.fromEntries(s.split("\n").map(l => l.split("=")).filter(p => p.length === 2));
      return { ip: v.ip, cc: v.loc, note: [v.colo, v.warp && v.warp !== "off" ? "WARP" : ""].filter(Boolean).join(" · ") };
    })]),
  ];
  async function exits() {
    R.ex = {};
    // (a topic page asks only the exits it shows)
    await Promise.all(EXITS.filter(([id]) => !D.focus || FR[id]).map(async ([id, get]) => {
      let r = null;
      try { r = await get(); } catch (e) {}
      if (!r || !r.ip) { R.ex[id] = null; return na(id, "v_fail"); }
      R.ex[id] = r.ip;
      const cc = /^[A-Z]{2}$/.test(r.cc || "") && r.cc !== "XX" ? r.cc : null;
      const geo = id === "ex_cn" && r.note;
      row(id, flagged(cc, [r.ip, geo ? r.note + t("ex_geo") : r.note].filter(Boolean).join(" · "), ipqsOf(r.ip)), geo ? { why: t("ex_geo_why") } : undefined);
    }));
    R.exDone = true;
  }

  // the addresses this browser leaves by over IPv4 and over IPv6, from Cloudflare Radar's single-stack hosts
  async function stack() {
    const one = fam => getJ(`https://ipv${fam}-check-perf.radar.cloudflare.com/`).then(b => b.ip_address || null).catch(() => null);
    const [v4, v6] = await Promise.all([one(4), one(6)]);
    R.stack = [v4, v6].filter(Boolean);
    if (!v4 && !v6) return na("stack", "v_empty");
    const s = esc("IPv4 " + (v4 || "–") + " · IPv6 " + (v6 || "–"));
    row("stack", IPV6 ? `<span class="pa-t">${s}</span><a class="pa-go" href="${esc(inLang(IPV6))}" target="_blank" rel="noopener">${esc(t("go_ipv6"))}${EXT}</a>` : s);
  }

  // The DNS resolver: a name nobody looked up before goes to the visitor's resolver, and ip-api's name server tells
  // who asked (and the client subnet the resolver passed along, if any). Its answer names the country in English.
  const CC_ALIAS = { "Hong Kong": "HK", Macao: "MO", Macau: "MO", Taiwan: "TW", "South Korea": "KR", Russia: "RU", Vietnam: "VN", Turkey: "TR", "Türkiye": "TR",
    Czechia: "CZ", "The Netherlands": "NL", Netherlands: "NL", "United States": "US", "United Kingdom": "GB" };
  let EN_CC;
  function ccOfName(name) {
    if (CC_ALIAS[name]) return CC_ALIAS[name];
    if (!EN_CC) {
      EN_CC = {};
      try {
        // (retired codes name today's countries too: FX is "France", DY "Benin", YU "Serbia"… so they're left out,
        // and the first code for a name stands)
        const en = new Intl.DisplayNames(["en"], { type: "region" }), A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const RETIRED = new Set("AN BU CS DD DY FX HV NH NT QU RH SU TP UK VD YD YU ZR".split(" "));
        for (const x of A) for (const y of A) { const c = x + y, n = en.of(c); if (n && n !== c && !RETIRED.has(c) && !(n in EN_CC)) EN_CC[n] = c; }
      } catch (e) {}
    }
    return EN_CC[name] || null;
  }
  async function dnsResolver() {
    const ask = async () => {
      const id = [...crypto.getRandomValues(new Uint8Array(16))].map(b => b.toString(16).padStart(2, "0")).join("");
      try { return await getJ(`https://${id}.edns.ip-api.com/json`, 6000); } catch (e) { return null; }
    };
    const j = await ask();
    if (!j) { R.dnsCC = null; return na("dns", "v_fail"); }
    const d = j.dns || {}, geo = String(d.geo || ""), parts = geo.split(" - "), cname = parts[0].trim();
    R.dnsCC = ccOfName(cname); R.dnsOrg = parts.slice(1).join(" - ").trim();
    const ecs = j.edns && j.edns.ip ? "ECS " + j.edns.ip : "";
    // a second name right after the first: one resolver answering both is the one a site meets. Two answers from two
    // countries mean the resolver varies per request (a proxy pool whose nodes resolve for themselves, a DoH endpoint
    // that moved), and the check says the route varies rather than naming one of them
    let why2 = "", d2 = null;
    const j2 = await ask();
    if (j2 && j2.dns) {
      d2 = j2.dns;
      const g2 = String(d2.geo || ""), p2 = g2.split(" - "), c2 = ccOfName(p2[0].trim()), e2 = j2.edns && j2.edns.ip ? "ECS " + j2.edns.ip : "";
      R.dns2CC = c2;
      if (R.dnsCC && c2 && c2 !== R.dnsCC) R.dnsRot = true;
      if (d2.ip !== d.ip || c2 !== R.dnsCC || e2 !== ecs) why2 = [d2.ip, g2, e2].filter(Boolean).join("\n");
    }
    row("dns", flagged(R.dnsCC, [d.ip, R.dnsOrg || cname, ecs].filter(Boolean).join(" · ")), { why: [d.ip, geo, ecs, why2 && "— " + why2].filter(Boolean).join("\n") });
  }

  // Whether this address is a public Tor exit node. The Worker keeps Tor's exit list and matches the address there,
  // so the visitor's address never goes to the Tor Project; the bulk list has IPv4 only
  async function torCheck() {
    let j;
    try { const r = await within(fetch("/api/tor", { cache: "no-store" }), 6000, null); j = r && r.ok ? await r.json() : null; } catch (e) {}
    if (!j) return na("tor", "v_fail");
    if (j.v6) return na("tor", "tor_v6");
    if (!j.ok) return na("tor", "v_fail");
    R.tor = !!j.tor;
    txt("tor", t(R.tor ? "tor_yes" : "tor_no"), { why: t("tor_why") });
  }

  // Cloudflare's own trace on this domain: the key exchange (post-quantum or not), encrypted ClientHello, WARP
  async function trace() {
    const s = await getT("/cdn-cgi/trace").catch(() => "");
    const v = Object.fromEntries(s.split("\n").map(l => l.split("=")).filter(p => p.length === 2));
    R.tr = v;
    if (!v.kex && !v.warp) { na("kex"); na("warp"); return; }
    if (v.kex) txt("kex", v.kex + (/MLKEM|Kyber/i.test(v.kex) ? " · " + t("kex_pq") : "") + " · ECH " + t(v.sni === "encrypted" ? "v_on" : "v_off")); else na("kex");
    txt("warp", "WARP " + (v.warp || "–") + " · Gateway " + (v.gateway || "–"));
  }

  // Whether this browser gets anywhere over HTTP/3. Requests to this site keep riding the connection the page came in
  // on (usually TCP, the browser learns from that first answer that the site speaks HTTP/3), so the protocol every
  // request of the page went over counts too (Resource Timing: Cloudflare Radar's probes allow it); the trace is
  // asked again a few times, a moment apart, until either shows QUIC
  const seenProtos = () => performance.getEntriesByType("navigation").concat(performance.getEntriesByType("resource")).map(e => e.nextHopProtocol).filter(Boolean);
  async function http3() {
    R.http = [];
    for (let i = 0; i < 4 && !seenProtos().includes("h3"); i++) {
      await new Promise(r => setTimeout(r, 700));
      const s = await getT("/cdn-cgi/trace").catch(() => "");
      const m = s.match(/^http=(.+)$/m);
      if (m) R.http.push(m[1].trim());
      if (m && /^http\/3$/i.test(m[1].trim())) break;
    }
    R.http.push(...seenProtos());
  }

  async function webgpu() {
    if (!navigator.gpu) return na("webgpu");
    // the high-performance adapter (the discrete card where there is one) and the low-power one: two answers, two cards
    const info = async ad => {
      if (!ad) return null;
      const i = ad.info || (ad.requestAdapterInfo ? await within(ad.requestAdapterInfo(), 1000, {}) : {});
      return { vendor: i.vendor, architecture: i.architecture, device: i.device, description: i.description };
    };
    const ad = await within(navigator.gpu.requestAdapter({ powerPreference: "high-performance" }), 2000, null);
    if (!ad) return na("webgpu", "v_empty");
    const i = await info(ad);
    R.wgpu = i; R.wgpuLo = await info(await within(navigator.gpu.requestAdapter({ powerPreference: "low-power" }), 2000, null));
    const s = [i.vendor, i.architecture, i.device, i.description].filter(Boolean).join(" · ");
    if (s) txt("webgpu", s); else na("webgpu", "v_empty");
  }

  // the display's refresh rate, from the time between animation frames
  async function refresh() {
    const ts = await within(new Promise(res => { const a = []; const f = x => { a.push(x); if (a.length < 40) requestAnimationFrame(f); else res(a); }; requestAnimationFrame(f); }), 2000, null);
    if (!ts) return na("hz");
    const d = ts.slice(1).map((x, i) => x - ts[i]).sort((x, y) => x - y), hz = 1000 / d[d.length >> 1];
    const near = [24, 30, 48, 50, 60, 72, 75, 90, 100, 120, 144, 165, 180, 240, 360].reduce((b, x) => Math.abs(x - hz) < Math.abs(b - hz) ? x : b);
    R.hz = Math.abs(near - hz) < 4 ? near : Math.round(hz);
    txt("hz", t("hz_v", { n: R.hz }));
  }

  // WebAssembly's features, each probed with its own tiny module (src/wasm.mjs): the count is the face of it, the
  // hover shows which. Newer engines compile more of them, so the list tells an engine's real version apart too
  function wasmFeatures() {
    const r = R.wasm = wasmProbe();
    if (!r) return na("wasm");
    const yes = r.filter(([, ok]) => ok);
    txt("wasm", t("wasm_v", { n: yes.length, of: r.length }), { why: r.map(([k, ok]) => k + (ok ? " ✓" : " ✗")).join(" · ") });
  }

  // the engine's version from the JavaScript it supports (a rewritten user agent leaves the engine as it was)
  function engineVer() {
    const probe = { findLast: () => [].findLast, structuredClone: () => window.structuredClone, groupBy: () => Object.groupBy, withResolvers: () => Promise.withResolvers,
      fromAsync: () => Array.fromAsync, union: () => Set.prototype.union, try: () => Promise.try, DurationFormat: () => Intl.DurationFormat,
      isError: () => Error.isError, Float16Array: () => window.Float16Array, escape: () => RegExp.escape };
    const has = {};
    for (const [k, f] of Object.entries(probe)) { try { has[k] = typeof f() === "function"; } catch (e) { has[k] = false; } }
    const r = R.engVer = engineRange(has);
    txt("engver", R.engine === "V8" ? (r.hi == null ? t("ev_all", { v: r.lo }) : t("ev_range", { lo: r.lo, hi: r.hi })) : t("ev_n", { n: r.n, of: FEATURES.length }),
      { why: FEATURES.map(([v, k]) => k + " " + v + (has[k] ? " ✓" : " ✗")).join(" · ") });
  }
  // what Math returns for a few hard cases differs by engine, system and processor
  async function mathPrint() {
    const v = [Math.tan(-1e300), Math.sin(1e300), Math.cos(1e10), Math.exp(100 / 3), Math.atanh(0.5), Math.cbrt(Math.PI), Math.expm1(1), Math.log1p(10),
      Math.sinh(1), Math.cosh(10), Math.pow(Math.PI, -100), Math.acosh(1e300)].map(String).join(",");
    const h = await sha(v);
    R.mathfp = h ? h.slice(0, 8) : null;
    if (h) txt("mathfp", h.slice(0, 16), { why: v }); else na("mathfp");
  }
  // the newest emoji the system's font draws: one glyph as wide as 😀, where a missing one is a box or its parts side by side
  function emoji() {
    const c = document.createElement("canvas").getContext("2d");
    c.font = "32px sans-serif";
    const w = s => c.measureText(s).width, base = w("\u{1F600}"), box = w("\u{10FFFD}");
    if (!base || Math.abs(base - box) < base * 0.1) return na("emoji");
    const V = [["16.0", "\u{1FAE9}"], ["15.1", "\u{1F642}\u200D\u2194\uFE0F"], ["15.0", "\u{1FAE8}"], ["14.0", "\u{1FAE0}"], ["13.0", "\u{1F978}"], ["12.0", "\u{1F971}"]];
    const v = V.find(([, s]) => Math.abs(w(s) - base) < base * 0.2 && Math.abs(w(s) - box) > base * 0.1);
    R.emoji = v ? v[0] : "<12";
    txt("emoji", v ? t("em_v", { v: v[0] }) : t("em_old"));
  }
  // video the system decodes on the graphics card (power-efficient), not just plays
  async function hwdec() {
    const mc = navigator.mediaCapabilities;
    if (!mc || !mc.decodingInfo) return na("hwdec");
    const L = [["H.264", 'video/mp4; codecs="avc1.640028"'], ["HEVC", 'video/mp4; codecs="hvc1.1.6.L120.90"'], ["VP9", 'video/webm; codecs="vp09.00.40.08"'], ["AV1", 'video/mp4; codecs="av01.0.08M.08"']];
    const r = await Promise.all(L.map(([n, ct]) => within(mc.decodingInfo({ type: "media-source", video: { contentType: ct, width: 1920, height: 1080, bitrate: 8e6, framerate: 30 } }), 1500, null)
      .then(i => i && i.supported && i.powerEfficient ? n : null, () => null)));
    const yes = r.filter(Boolean);
    R.hwdec = yes.join(" · ") || "-";
    txt("hwdec", yes.length ? yes.join(" · ") : t("hw_none"));
  }
  // the most a page may use (Chromium): 4 GB on a 64-bit system, about 2 on a 32-bit one
  function heap() {
    const m = performance.memory;
    if (!m || !m.jsHeapSizeLimit) return na("heap");
    txt("heap", t("heap_v", { g: +(m.jsHeapSizeLimit / 2 ** 30).toFixed(1) }), { why: String(m.jsHeapSizeLimit) });
  }
  // the browser's default font size (changed in its settings, it's one more trait) and the system's accent colour
  function sysui() {
    const d = document.createElement("div");
    d.style.cssText = "position:absolute;visibility:hidden;font-size:medium" + (CSS.supports("color", "AccentColor") ? ";color:AccentColor" : "");
    document.body.appendChild(d);
    const cs = getComputedStyle(d), px = R.fontPx = Math.round(parseFloat(cs.fontSize)), acc = CSS.supports("color", "AccentColor") ? cs.color : "";
    d.remove();
    txt("sysui", [t("ui_font", { n: px }), acc && t("ui_accent", { c: acc })].filter(Boolean).join(" · "));
  }
  // navigator as a worker reads it: extensions and some anti-detect browsers rewrite only the page's
  async function workerNav() {
    const read = "{ua:navigator.userAgent,langs:[...(navigator.languages||[])].join(),plat:navigator.platform,tz:Intl.DateTimeFormat().resolvedOptions().timeZone}";
    const url = URL.createObjectURL(new Blob(["postMessage(" + read + ")"], { type: "text/javascript" }));
    let w;
    try { w = new Worker(url); } catch (e) { URL.revokeObjectURL(url); R.wdiff = null; return na("worker"); }
    const m = await within(new Promise(res => { w.onmessage = e => res(e.data); w.onerror = () => res(null); }), 2000, null);
    w.terminate(); URL.revokeObjectURL(url);
    if (!m) { R.wdiff = null; return na("worker", "v_empty"); }
    const main = { ua: navigator.userAgent, langs: [...(navigator.languages || [])].join(), plat: navigator.platform, tz: Intl.DateTimeFormat().resolvedOptions().timeZone };
    const NAME = { ua: "userAgent", langs: "languages", plat: "platform", tz: "timeZone" };
    R.wdiff = Object.keys(main).filter(k => m[k] != null && m[k] !== "" && m[k] !== main[k]);
    txt("worker", R.wdiff.length ? t("wk_diff", { list: R.wdiff.map(k => NAME[k]).join(", ") }) : t("wk_same"),
      { why: R.wdiff.map(k => NAME[k] + ": " + m[k]).join(" · ") });
  }
  // an anti-detect browser's traces: parts that each look right but don't agree with each other
  function fpbTraces() {
    if (R.wdiff === undefined || !R.dev) return null;
    const out = [], cv = +((/Chrome\/(\d+)/.exec(navigator.userAgent) || [])[1]) || 0;
    if (R.engine === "V8" && engineOff(cv, R.engVer)) out.push("fb_ver");
    // (a CSS feature the claimed version has, missing: the engine is older than it says)
    else if (R.engine === "V8" && R.cssv && R.cssv.miss && cv >= R.cssv.miss + 2) out.push("fb_css");
    if (R.wdiff && R.wdiff.length) out.push("fb_worker");
    if (platformOff(navigator.platform, R.dev.os)) out.push("fb_plat");
    if (glVendorOff(R.gpuVen, R.gpuRaw)) out.push("fb_gl");
    return out;
  }

  function screens() {
    const ext = screen.isExtended;
    R.multi = ext;
    txt("screens", (ext == null ? t("v_unsup") : t(ext ? "scr_multi" : "scr_single")) + " · " + t("win_at", { x: screenX, y: screenY }));
    // (the browser counts every display it is told about, virtual ones included: say so, like the graphics card row)
    if (ext != null) note("screens", t("screens_note"), t("screens_note_short"));
  }

  function codecs() {
    const v = document.createElement("video");
    const ok = type => { try { return window.MediaSource && MediaSource.isTypeSupported ? MediaSource.isTypeSupported(type) : !!v.canPlayType(type); } catch (e) { return false; } };
    const L = [["H.264", 'video/mp4; codecs="avc1.42E01E"'], ["VP9", 'video/webm; codecs="vp9"'], ["AV1", 'video/mp4; codecs="av01.0.05M.08"'],
      ["HEVC", 'video/mp4; codecs="hvc1.1.6.L93.B0"'], ["Dolby Vision", 'video/mp4; codecs="dvh1.05.06"'], ["E-AC-3", 'audio/mp4; codecs="ec-3"']];
    const yes = L.filter(([, ty]) => ok(ty)).map(([n]) => n);
    if (yes.length) txt("codecs", yes.join(" · ")); else na("codecs", "v_empty");
  }

  // DRM systems the browser can use; Firefox asks the visitor before it turns DRM on, so it isn't asked there
  async function drm() {
    if (!navigator.requestMediaKeySystemAccess || /Firefox\//.test(navigator.userAgent)) return na("drm");
    const cfg = [{ initDataTypes: ["cenc"], videoCapabilities: [{ contentType: 'video/mp4; codecs="avc1.42E01E"' }] }];
    const L = [["Widevine", "com.widevine.alpha"], ["PlayReady", "com.microsoft.playready.recommendation"], ["FairPlay", "com.apple.fps"], ["ClearKey", "org.w3.clearkey"]];
    const r = await Promise.all(L.map(([n, ks]) => within(navigator.requestMediaKeySystemAccess(ks, cfg).then(() => n, () => null), 2000, null)));
    const yes = r.filter(Boolean);
    if (yes.length) txt("drm", yes.join(" · ")); else na("drm", "v_empty");
  }

  // what this site may already use: granted or blocked. A query never asks; browsers that don't know a permission
  // reject it, so the list is the same everywhere and each name stands or falls on its own. The ones still asking
  // are left out (a fresh browser would otherwise print two dozen "ask"), unless nothing has been decided yet
  async function perms() {
    if (!navigator.permissions) return na("perms");
    const L = [["geolocation", "perm_geo"], ["notifications", "perm_notif"], ["camera", "perm_cam"], ["microphone", "perm_mic"],
      ["clipboard-read", "perm_clip_r"], ["clipboard-write", "perm_clip_w"], ["midi", "perm_midi"], ["push", "perm_push"],
      ["persistent-storage", "perm_store"], ["storage-access", "perm_sa"], ["local-fonts", "perm_fonts"], ["window-management", "perm_win"],
      ["screen-wake-lock", "perm_wake"], ["bluetooth", "perm_bt"], ["idle-detection", "perm_idle"], ["accelerometer", "perm_acc"],
      ["gyroscope", "perm_gyro"], ["magnetometer", "perm_mag"], ["local-network-access", "perm_lan"], ["display-capture", "perm_capture"],
      ["speaker-selection", "perm_speaker"]];
    const r = (await Promise.all(L.map(([p, k]) => navigator.permissions.query({ name: p }).then(s => [k, s.state], () => null)))).filter(Boolean);
    if (!r.length) return na("perms");
    R.perms = r;
    const yes = r.filter(([, s]) => s !== "prompt");
    txt("perms", yes.length ? yes.map(([k, s]) => t(k) + " " + t("ps_" + s)).join(" · ") : t("perm_ask_all"), { why: t("perm_why") });
  }

  // Extensions that leave a mark any page can see: crypto wallets announce themselves to the page, developer tools
  // install a global hook, some extensions tag the document. Read a moment after load, when they have run.
  async function extensions() {
    await new Promise(r => setTimeout(r, 1200));
    const w = window, d = document.documentElement, b = document.body, q = s => { try { return !!document.querySelector(s); } catch (e) { return false; } };
    const found = [], eth = w.ethereum;
    if (eth) found.push(["crypto", eth.isRabby ? "Rabby" : eth.isCoinbaseWallet ? "Coinbase Wallet" : eth.isBraveWallet ? "Brave Wallet" : eth.isOkxWallet || w.okxwallet ? "OKX Wallet"
      : eth.isTrust ? "Trust Wallet" : eth.isTokenPocket ? "TokenPocket" : eth.isMetaMask ? "MetaMask" : "Ethereum wallet"]);
    else if (w.okxwallet) found.push(["crypto", "OKX Wallet"]);
    if (w.phantom || (w.solana && w.solana.isPhantom)) found.push(["crypto", "Phantom"]);
    if (w.tronLink || w.tronWeb) found.push(["crypto", "TronLink"]);
    if (w.__REACT_DEVTOOLS_GLOBAL_HOOK__) found.push(["dev", "React DevTools"]);
    if (w.__VUE_DEVTOOLS_GLOBAL_HOOK__) found.push(["dev", "Vue DevTools"]);
    if (w.__REDUX_DEVTOOLS_EXTENSION__) found.push(["dev", "Redux DevTools"]);
    if (b.hasAttribute("data-gr-ext-installed") || b.hasAttribute("data-new-gr-c-s-check-loaded")) found.push(["", "Grammarly"]);
    if (d.hasAttribute("data-darkreader-mode") || d.hasAttribute("data-darkreader-scheme") || q('meta[name="darkreader"]')) found.push(["", "Dark Reader"]);
    if (q('[id*="immersive-translate"],[class*="immersive-translate"]') || d.hasAttribute("imt-state")) found.push(["", "Immersive Translate"]);
    if (w.keplr) found.push(["crypto", "Keplr"]);
    if (w.bitkeep) found.push(["crypto", "Bitget Wallet"]);
    if (w.coinbaseWalletExtension && !found.some(([, n]) => n === "Coinbase Wallet")) found.push(["crypto", "Coinbase Wallet"]);
    if (q("#loom-companion-mv3")) found.push(["", "Loom"]);
    // antivirus web protection adds its own script to every page (and often reads HTTPS on the way)
    if (q('script[src*="kaspersky-labs"],link[href*="kaspersky-labs"]')) found.push(["", "Kaspersky"]);
    if (d.classList.contains("translated-ltr") || d.classList.contains("translated-rtl")) found.push(["", "Google Translate"]);
    R.ext = found;
    if (found.length) txt("ext", found.map(([, n]) => n).join(" · ")); else txt("ext", t("ext_none"), { na: true });
  }

  /* ---------- the portrait: what the paragraph, the ID card and a shared link are drawn from ---------- */
  // Language-neutral, so a shared link reads in its viewer's language. The local view adds tooltips (X) that a shared
  // one leaves out, and a shared one has no address, no city and no addresses in the checks.
  const allExits = () => R.exDone && R.stack && R.srv
    ? [["ip", R.srv.ip], ...EXITS.map(([id]) => [id, R.ex[id]]), ...R.stack.map(ip => ["stack", ip])].filter(([, ip]) => ip)
    : null;
  // an app's own browser (X, WeChat…), named when it names itself, "wv" for an Android web view that doesn't
  const inApp = () => R.br && /^(X|WeChat|Weibo|QQ|Instagram|Facebook|LINE|TikTok|Telegram)$/.test(R.br.name) ? R.br.name : /; wv\)/.test(navigator.userAgent) ? "wv" : null;
  // Firefox's resistFingerprinting: the clock and the graphics card are stand-ins
  const rfp = () => rfpClock(/Firefox\//.test(navigator.userAgent), R.tz, R.gpuRaw);
  function jobsOf() {
    // (extensions found by their files count too: wallets for crypto, web developer tools for development)
    const war = (R.extwar || []).map(n => /MetaMask|Phantom/.test(n) ? ["crypto", n] : /Wappalyzer|ColorZilla/.test(n) ? ["dev", n] : null).filter(Boolean);
    const out = [...fontHints(R.fonts || [], R.dev && R.dev.os), ...(R.ext || []).filter(([k]) => k), ...war];
    return out.filter(([k], i) => out.findIndex(([x]) => x === k) === i);
  }
  // the connection, as the probe read it: the TCP's OS family, a tunnel, a cloud's inside, HTTPS re-made on the way
  function connOf() {
    const p = R.probe, tc = p && p.tcp;
    if (p === undefined) return {};
    if (!p || !tc) return { cna: true };
    const v6 = String(p.ip || "").includes(":"), cn = R.ck && R.ck.conn;
    return { tos: tc.os || undefined, tun: tunnelOf(tc.mss, v6) || undefined, mtu: tc.mtu || undefined, cloud: tc.mtu > 1500 || undefined,
      mitm: (cn && cn[1] === "c_conn_mitm") || undefined, cos: (cn && cn[1] === "c_conn_os") || undefined };
  }
  function portrait() {
    const c = (R.srv && R.srv.cf) || {}, d = R.dev || {};
    const nat = nationality({ langs: R.langs, tz: rfp() ? null : R.tz, ipcc: c.country, sys: sysOf() || undefined, ios: !!(R.dev && /^(iOS|iPadOS)/.test(R.dev.os || "")) });
    const ex = allExits(), split = ex && splitOf(ex);
    return { v: 1, nat: nat ? nat.cc : null, natFrom: nat ? nat.from : null, cc: c.country || null, city: c.city || null, langs: R.langs || [],
      tz: R.tz || null, rf: rfp() || undefined, h12: !!R.h12, os: R.osTxt || null, kind: d.kind || null, model: d.model || null, lt: R.laptop || undefined, browser: R.browser || null,
      screen: R.screen || null, gpu: discreteGpu(R.gpu, R.gpuHi, R.wgpu, R.wgpuLo) || R.gpu || null, gi: discreteGpu(R.gpu, R.gpuHi, R.wgpu, R.wgpuLo) ? R.gpu : undefined, gl: /or similar$/.test(R.gpuRaw || "") || undefined, gs: R.gpuSoft || undefined, org: orgName(c.asOrganization, c.asn), asn: c.asn ?? null,
      nt: split ? "split" : R.tor === true ? "tor" : c.asn == null ? null : netKind(c.asn, c.asOrganization), nx: split ? split.n : 0,
      dns: R.dnsCC || null, dark: !!R.dark, ab: !!R.adblock, jobs: jobsOf(), fp: R.fp || null, rand: !!R.rand, app: inApp() || undefined, fz: !!R.noise || undefined, tb: (R.traces && R.traces.blocked) || undefined, hz: R.hz || null,
      ...connOf(), sh: R.shield || undefined, ln: R.lies ? (R.lies.list.length + R.lies.frame.length) || undefined : undefined,
      et: (R.etag && R.etag.seen) || undefined, lost: R.traces && R.traces.lost.length ? R.traces.lost : undefined, kept: R.traces && !R.traces.first ? R.traces.kept : undefined,
      hw: R.hwid || undefined, mc: R.v6mac || undefined,
      cpu: navigator.hardwareConcurrency || null, multi: R.multi === true || undefined, fs: R.fontPx || null, rm: R.rm || undefined, hc: R.hc || undefined,
      bat: !R.battery ? undefined : R.battery.level === 1 && R.battery.charging && R.battery.chargingTime === 0 ? "ac" : (R.battery.charging ? "c" : "b") + Math.round(R.battery.level * 100),
      x: { split, fullOrg: [c.asn ? "AS" + c.asn : "", c.asOrganization].filter(Boolean).join(" · "), dnsOrg: R.dnsOrg || "", fpHex: R.fpHex } };
  }

  /* ---------- the fingerprint ID card ---------- */
  function fpArt(hex) {
    const by = i => parseInt(hex.substr((i * 2) % hex.length, 2), 16);
    const pt = (r, deg) => { const t = (deg - 90) * Math.PI / 180; return (32 + r * Math.cos(t)).toFixed(2) + " " + (32 + r * Math.sin(t)).toFixed(2); };
    let d = "", k = 0;
    for (let i = 0; i < 7; i++) {
      const r = 6 + i * 3.9, parts = 1 + (by(k++) % 3), turn = 360 / parts;
      for (let p = 0; p < parts; p++) {
        const s = p * turn + (by(k++) / 255) * turn * 0.5, len = turn * (0.45 + (by(k++) / 255) * 0.45);
        d += `M${pt(r, s)}A${r} ${r} 0 ${len > 180 ? 1 : 0} 1 ${pt(r, s + len)}`;
      }
    }
    return `<circle cx="32" cy="32" r="2.2"/><path d="${d}"/>`;
  }
  // "3 days ago", in the page's language
  function ago(ts) {
    const s = Math.max(1, (Date.now() - ts) / 1000);
    const [n, u] = s < 60 ? [s, "second"] : s < 3600 ? [s / 60, "minute"] : s < 86400 ? [s / 3600, "hour"] : s < 2592000 ? [s / 86400, "day"] : s < 31536000 ? [s / 2592000, "month"] : [s / 31536000, "year"];
    try { return new Intl.RelativeTimeFormat(LANG, { numeric: "auto" }).format(-Math.floor(n), u); } catch (e) { return Math.floor(n) + " " + u; }
  }
  // The visit before this one, kept in this browser only: was the fingerprint the same? That is how a site that
  // never set a cookie still knows you came back.
  function returnVisit(P) {
    let last = null;
    try { last = JSON.parse(store.get(K.last) || "null"); } catch (e) {}
    const where = cityName(P.city) || (P.cc ? country(P.cc) : "");
    const parts = R.fpParts || {};
    store.set(K.last, JSON.stringify({ at: Date.now(), fp: P.rand ? null : P.fp, where, br: R.browser || "", parts }));
    $("#forget").hidden = false;
    if (P.rand) return t("rv_rand");
    const other = R.traces && !R.traces.first ? R.traces.kept.filter(k => k !== "ls") : [];
    if ((!last || !last.at) && other.length) return t("rv_revived", { list: list(other.map(k => t("tr_" + k))) });
    if (!last || !last.at) return t("rv_first");
    const said = t(last.fp === P.fp ? "rv_same" : "rv_diff", { ago: ago(last.at), where: last.where || "?" });
    // the fingerprint's parts, one by one, against the last visit: a site needs every one to stay the same
    if (last.parts && Object.keys(parts).length) {
      const keys = Object.keys(parts), same = keys.filter(k => last.parts[k] === parts[k]);
      $("#stabL").innerHTML = keys.map(k => `<li><span>${esc(rowName(k))}</span><b class="${last.parts[k] === parts[k] ? "ok" : "bad"}">${last.parts[k] === parts[k] ? "=" : "≠"}</b></li>`).join("");
      $("#stabD summary").textContent = t("stab_h") + " · " + t("stab_same", { a: same.length, b: keys.length });
      $("#stabD").hidden = false;
    }
    if (last.fp === P.fp || !last.parts) return said;
    // a browser update changes the drawing and the version at once; otherwise name the parts that moved
    const moved = Object.keys(parts).filter(k => last.parts[k] !== parts[k]);
    const why = last.br && R.browser && last.br !== R.browser ? t("rv_why_br", { a: last.br, b: R.browser }) : moved.length ? t("rv_why", { list: list(moved.map(rowName)) }) : "";
    return said + (why ? (/^(zh|ja)/.test(LANG) ? "" : " ") + why : "");
  }
  $("#forget").onclick = () => { forgetTraces(); try { localStorage.removeItem(K.last); localStorage.removeItem(K.prev); localStorage.removeItem(K.hist); } catch (e) {} $("#vHist").hidden = true; $("#fpRet").textContent = t("rv_forgot"); $("#forget").hidden = true; };
  function idCard(P, shared) {
    $("#fpId").textContent = P.rand ? t("fp_rand") : P.fp || t("masked");
    $("#fpNote").textContent = t(shared ? "sh_fp" : P.rand ? "id_note_rand" : P.fz ? "id_note_site" : "id_note");
    $("#fpArt").innerHTML = P.rand || !P.x.fpHex ? "" : fpArt(P.x.fpHex);
    $("#idc").classList.toggle("rand", !!P.rand);
    $("#fpRet").textContent = shared ? " " : returnVisit(P);
  }

  /* ---------- the paragraph ---------- */
  const BL = Object.fromEntries($$("#story .bl[data-b]").map(b => [b.dataset.b, b]));
  const BL0 = Object.fromEntries(Object.entries(BL).map(([k, b]) => [k, b.innerHTML]));   // each blank's filler, for a rerun
  const rowName = id => t("s_" + id);
  // a destination in the exits: the page's own request is "this site"
  const exitName = id => id === "ip" ? t("ex_self") : rowName(id);
  function blank(k, html, from = BLANKS[k], why) {
    const b = BL[k]; if (!b) return;
    // a partial pass fills only a blank whose readings are all in, and only while it still waits
    if (PARTIAL && from.length && (!from.every(id => done.has(id)) || !b.classList.contains("wait"))) return;
    // and only once the rest of its line is ready too: a paragraph that filled blank by blank rewrapped itself at every
    // answer, and each rewrap moved the words after it (the largest layout shift on the page); filled in one frame, it
    // moves once. The paragraph still fills the moment its last reading lands
    if (PARTIAL) { const p = b.closest("p"); if (p && [...p.querySelectorAll(".bl.wait[data-b]")].some(x => { const f = BLANKS[x.dataset.b] || []; return f.length && !f.every(id => done.has(id)); })) return; }
    b.innerHTML = html; b.classList.remove("wait");
    b.dataset.from = from.join(" ");
    b.dataset.why = why || (from.length ? t("from", { list: list(from.map(rowName)) }) : "");
    b.tabIndex = 0;
  }
  // Asia/Shanghai is the zone all of China is named by: said so, so it doesn't read as "in Shanghai"
  function tzNote(tz) { return tz === "Asia/Shanghai" ? t("tz_cn") : ""; }
  function tzLabel(tz) {
    try { return new Intl.DateTimeFormat(LANG, { timeZone: tz, timeZoneName: "longGeneric" }).formatToParts(new Date()).find(x => x.type === "timeZoneName").value; } catch (e) { return tz; }
  }
  // Paint only settled intro fields. This has no verdict, storage or sharing side effects.
  function paintIntro(P, keys = ["nat", "city", "lang", "tz", "clock"], shared = false) {
    const U = esc(t("v_unknown"));
    if (keys.includes("nat")) {
      // (one source alone is a guess: the language points to habits, the clock to where the device was set up)
      const nf = P.natFrom || [], own = P.nat && nf.length === 1 ? nf[0] : null;
      blank("nat", P.nat ? t(own === "tz" ? "pt_nat_clock" : own === "langs" ? "pt_nat_soft" : "pt_nat_sure", { c: flagged(P.nat, country(P.nat)) })
        : esc(t("pt_nat_na")), P.natFrom || BLANKS.nat, own === "tz" ? t("pt_nat_clock_why") : own === "langs" ? t("pt_nat_soft_why") : "");
    }
    // (the city is the address's, from an IP database: said so on hover or tap, not in the sentence, which reads as prose)
    if (keys.includes("city")) {
      blank("city", shared && !P.city ? esc(t("masked")) : P.cc ? flagged(P.cc, [...place(P.city), country(P.cc)].join(", ")) : U, BLANKS.city,
        shared && !P.city ? t("masked_why") : P.cc ? t("ex_geo_why") : "");
      BL.city.classList.toggle("hid", shared && !P.city);
    }
    if (keys.includes("lang")) blank("lang", P.langs.length ? esc(language(P.langs[0])) : U, BLANKS.lang, P.langs.map(language).join(", "));
    if (keys.includes("tz")) blank("tz", P.rf ? esc(t("pt_tz_rfp")) : P.tz ? esc(tzLabel(P.tz)) : U, BLANKS.tz, P.tz || "");
    if (keys.includes("clock")) blank("clock", esc(t(P.h12 ? "ck_12" : "ck_24")), BLANKS.clock, t("hour_why"));
  }
  function paint(P, shared) {
    const X = P.x || {}, U = esc(t("v_unknown"));
    paintIntro(P, undefined, shared);
    BL.isp.classList.toggle("hid", shared && !P.org);
    blank("device", esc(!P.os ? t("dv_unknown") : (P.kind === "phone" || P.kind === "tablet" || P.kind === "mac") && P.model ? t("dv_model", { model: P.model, os: P.os })
      : t(P.lt ? "dv_laptop" : "dv_" + (P.kind || "pc"), { os: P.os })));
    blank("browser", P.browser ? esc(P.browser) : U);
    blank("screen", P.screen ? esc(P.screen + (P.hz ? " · " + P.hz + " Hz" : "")) : U);
    blank("gpu", esc(P.gs ? t("gpu_soft") : P.rf && !P.gpu ? t("gpu_rfp") : !P.gpu && /^Brave\b/.test(P.browser || "") ? t("gpu_brave") : P.gl && P.gpu ? t("gpu_like", { g: P.gpu }) : P.gi ? t("gpu_dual", { d: P.gpu, i: P.gi }) : P.gpu || t("gpu_unknown")),
      BLANKS.gpu, P.gl ? t("gpu_like_why") : "");
    blank("isp", P.org ? (!shared && asnOf(P.asn) ? `<a href="${esc(asnOf(P.asn))}" target="_blank" rel="noopener" title="${esc(t("go_asn"))}">${esc(P.org)}</a>` : esc(P.org)) : shared ? esc(t("masked")) : U, BLANKS.isp, X.fullOrg || (shared && !P.org ? t("masked_why") : ""));
    blank("dns", P.dns ? flagged(P.dns, country(P.dns)) : esc(t("dns_na")), BLANKS.dns, X.dnsOrg || "");
    const sp = X.split;
    blank("nettype", esc(P.nt === "split" ? t("nt_split", { n: P.nx }) : P.nt ? t("nt_" + P.nt) : t("v_unknown")),
      BLANKS.nettype, sp ? exitName(sp.a) + ": " + sp.ipA + "\n" + exitName(sp.b) + ": " + sp.ipB : "");
    blank("age", esc(t("age_v")), [], t("age_why"));
    blank("theme", esc(P.app ? t("pt_app", { m: t(P.dark ? "pt_dark" : "pt_light"), app: P.app === "wv" ? t("pt_app_any") : P.app }) : t(P.dark ? "pt_dark" : "pt_light")));
    blank("adblock", esc(t(P.ab ? "pt_ab" : "pt_noab")));
    // who protects the fingerprint, from the protection row (and how much of a disguise was caught)
    blank("shield", esc(P.sh ? tn("pt_sh_" + P.sh.replace(/^sh_/, ""), P.ln || 0, { n: P.ln || 0 }) : t("pt_sh_none")));
    // who opened the connection: HTTPS re-made on the way, another machine, a cloud's inside, a tunnel, or your own
    const ua = String(P.os || "").split(" ")[0] || "?";
    blank("conn", esc(P.cna ? t("cn_na") : P.mitm ? t("cn_mitm") : P.cos ? t("cn_os", { os: t("tos_" + P.tos), ua }) : P.cloud ? t("cn_cloud")
      : P.tun && P.tun !== "pppoe" ? (P.tun === "other" ? t("cn_tun2", { m: P.mtu }) : t("cn_tun", { t: { wireguard: "WireGuard", openvpn: "OpenVPN", ipsec: "IPsec" }[P.tun], m: P.mtu }))
      : P.tos || P.mtu ? t("cn_self", { ua }) : t("cn_na")));
    // the worst of it, in a sentence of its own (good news when there is none)
    blank("wow", esc(P.nt === "tor" ? t("pt_wow_tor") : P.mc ? t("pt_wow_mac", { mac: P.mc }) : P.mitm ? t("pt_wow_mitm") : P.cos ? t("pt_wow_os", { os: t("tos_" + P.tos), ua })
      : P.et && (P.lost || []).includes("ls") ? t("pt_wow_etag") : P.ln >= 3 ? tn("pt_wow_lies", P.ln, { n: P.ln }) : t("pt_wow_none")), BLANKS.wow);
    blank("job", esc(P.jobs.length ? list(P.jobs.map(([k]) => t("jb_" + k))) : t("jb_none")), BLANKS.job, P.jobs.length ? t("from", { list: P.jobs.map(([, f]) => f).join(", ") }) : "");
    if (!PARTIAL) {
      $("#story").classList.remove("wait"); $("#storySk").hidden = true;
      idCard(P, shared);
    }
  }

  /* ---------- the portrait's conclusions ---------- */
  // Three blanks are what a site makes of the readings rather than readings: what the machine is for, whether the
  // place adds up (or a site will guess a proxy), and whether clearing cookies would shake a site off.
  function readings(P, ck) {
    // (before the checks are judged there is no verdict to state: the read blank and the labels wait for it)
    if (ck) {
      const { away, spots, at, strong, one } = giveaways(ck, P);
      const ipc = P.cc && country(P.cc);
      // (giveaways that point to different countries each say their own: the clock's country is not the DNS's)
      const each = strong && ipc && spots.length && !one ? list(spots.map(([k, c]) => t("gs_p_" + k, { c: country(c) }))) : null;
      const home = one ? country(one) : !spots.length && P.nat && P.nat !== P.cc ? country(P.nat) : !spots.length && P.dns && P.dns !== P.cc ? country(P.dns) : null;
      // (the network's blank already says "a proxy" for a data center or a split: then just the mismatch)
      blank("read", esc(P.nt === "tor" ? t("rd_tor") : each ? t(P.nt === "dc" || P.nt === "split" ? "rd_off_each" : "rd_proxy_each", { ipc, list: each })
        : strong && ipc && home ? t(P.nt === "dc" || P.nt === "split" ? "rd_off" : "rd_proxy", { ipc, home, list: list(away.map(k => t("gs_i_" + k))) })
        : P.nt === "split" ? t("rd_split") : P.nt === "dc" ? t("rd_dc") : P.nt === "vpn" ? t("rd_vpn") : away.length && ipc && home ? t("rd_abroad", { ipc, home }) : ipc ? t("rd_home", { ipc }) : t("rd_none")));
    }
    // (a discrete card beside the integrated one counts as a high-end machine)
    const g = P.gpu || "", hi = !!P.gi || /RTX\s?(20|30|40|50)\d0|RX\s?[679]\d{3}|Arc A7|Apple M\d+ (Pro|Max|Ultra)/i.test(g);
    const low = /UHD|HD Graphics|Iris|Radeon\(TM\) Graphics|Radeon Graphics|Vega \d+ Graphics/i.test(g), pc = P.kind === "pc" || P.kind === "mac";
    blank("rig", esc(t(P.gs ? "rg_soft" : pc && hi && P.hz >= 120 ? "rg_game" : pc && hi ? "rg_power" : pc && low ? "rg_basic" : "rg_none")));
    // how a site recognizes you anyway: scrambled (it can't), the cache's ID, a store that survived, the hardware ID
    const kept = (P.kept || []).filter(k => k !== "ls");
    // (the store probes answer this, not the fingerprint alone: in a partial pass it waits for them, not for "same")
    if (!PARTIAL || R.traces) blank("track", esc(P.rand ? t("tk_rand") : P.fz ? t("tk_site") : P.et ? t("tk_etag") : (P.lost || []).includes("ls") && kept.length ? t("tk_revive", { list: list(kept.map(k => t("tr_" + k))) })
      : P.hw ? t("tk_hw", { id: P.hw.slice(0, 4) + "·" + P.hw.slice(4, 8) }) : t("tk_same")), BLANKS.track);
    // the paragraphs after: what the machine is worth, updates, when, power, settings; then the labels and standing out
    const tier = tierOf(P);
    blank("tier", esc(tier.text));
    const b = behind(P);
    blank("fresh", esc(b == null ? t("fr_na") : b <= 2 ? t("fr_new") : tn("fr_old", b, { n: b })), BLANKS.fresh, P.browser || "");
    blank("when", esc(whenOf(P)));
    blank("power", esc(!P.bat ? t("pw_na") : P.bat === "ac" ? t("pw_ac") : t(P.bat[0] === "c" ? t("pw_chg") : t("pw_bat", { p: P.bat.slice(1) }))));
    const pf = [P.fs && P.fs !== 16 && t("pf_font", { n: P.fs }), P.rm && t("pf_motion"), P.hc && t("pf_contrast")].filter(Boolean);
    blank("prefs", esc(P.fs == null && P.rm == null ? t("pf_na") : pf.length ? list(pf) : t("pf_none")));
    if (ck) labels(P, ck, tier);
    if (P.u) blank("stand", esc(standText(P.u.m, P.u.k, P.u.top)));
    else if (!PARTIAL && !(R && R.uniq)) blank("stand", esc(t(!shownShared && (optedOut() || navigator.globalPrivacyControl) ? "st_off" : "st_wait")));
  }
  // what a site makes of the machine: high-end, mainstream or entry-level, from the card, the screen and the processor
  function tierOf(P) {
    if (P.kind === "phone" || P.kind === "tablet") return { lv: null, text: t("tr_phone") };
    const g = P.gpu || "", hiG = !!P.gi || /RTX\s?(20|30|40|50)\d0|RX\s?[679]\d{3}|Arc A7|Apple M\d+ (Pro|Max|Ultra)/i.test(g);
    const lowG = /UHD|HD Graphics|Iris|Radeon\(TM\) Graphics|Radeon Graphics|Vega \d+ Graphics|Radeon \d{3}M|Arc\(TM\) Graphics/i.test(g);
    const big = Math.max(...String(P.screen || "").split("×").map(Number).filter(Boolean), 0);
    const score = (hiG ? 2 : lowG ? 0 : 1) + (big >= 3840 ? 1 : 0) + (P.hz >= 120 ? 1 : 0) + (P.cpu >= 16 ? 1 : 0);
    const lv = score >= 3 ? "high" : score >= 2 ? "mid" : "low";
    const spec = list([{ 7680: "8K", 6016: "6K", 5120: "5K", 3840: "4K", 2560: "2K", 1920: "1080p" }[big] || P.screen,   // (2880×1800 is no "2K")
      P.hz >= 90 ? P.hz + " Hz" : "", g, P.cpu ? tn("cores", P.cpu, { n: P.cpu }) : ""].filter(Boolean));
    return { lv, text: t("tr_" + lv, { spec }) + (P.multi ? t("tr_multi") : "") };
  }
  // how many versions behind the browser is: a recent release of each, and one every four weeks since
  const LATEST = { Chrome: [156, "2026-11-03"], Edge: [156, "2026-11-03"], Firefox: [159, "2026-11-03"] };
  function behind(P) {
    const m = /^(Chrome|Edge|Firefox) (\d+)/.exec(P.browser || "");
    if (!m) return null;
    const [v0, d0] = LATEST[m[1]], want = v0 + Math.floor(((P.t || Date.now()) - Date.parse(d0)) / (28 * 864e5));
    return Math.max(0, want - +m[2]);
  }
  // the visitor's local time when they came, by their clock (not when the clock is a stand-in)
  function whenOf(P) {
    if (!P.tz || P.rf) return t("wh_na");
    let h;
    try { h = +new Intl.DateTimeFormat("en-US", { timeZone: P.tz, hour: "numeric", hourCycle: "h23" }).format(new Date(P.t || Date.now())) % 24; } catch (e) { return t("wh_na"); }
    const part = h < 5 ? 0 : h < 8 ? 1 : h < 11 ? 2 : h < 13 ? 3 : h < 18 ? 4 : h < 22 ? 5 : 6;
    return t("wh_v", { part: t("wh_" + part), h, h12: h % 12 || 12 });
  }
  // the labels a site would file the visitor under, each from the readings it rests on
  function labels(P, ck, tier) {
    const lv = id => ck && ck[id] && ck[id][0], jobs = (P.jobs || []).map(([k]) => k), pc = P.kind === "pc" || P.kind === "mac";
    const g = P.gpu || "", hiG = !!P.gi || /RTX\s?(20|30|40|50)\d0|RX\s?[679]\d{3}|Arc A7|Apple M\d+ (Pro|Max|Ultra)/i.test(g);
    let hour = null;
    try { if (P.tz && !P.rf) hour = +new Intl.DateTimeFormat("en-US", { timeZone: P.tz, hour: "numeric", hourCycle: "h23" }).format(new Date(P.t || Date.now())) % 24; } catch (e) {}
    const proxy = lv("tz") === "bad" || lv("dns") === "bad" || P.nt === "dc" || P.nt === "split";
    const L = [
      [tier.lv === "high" || /Apple M\d+ (Pro|Max|Ultra)/i.test(g), "lb_rich", ["gpu", "screen", "cpu"]],
      [pc && hiG && P.hz >= 120, "lb_game", ["gpu", "hz"]],
      [jobs.includes("dev"), "lb_dev", ["fonts"]], [jobs.includes("design"), "lb_design", ["fonts"]], [jobs.includes("crypto"), "lb_crypto", ["ext"]],
      [proxy, "lb_proxy", ["isp", "dns", "tz", "ex_cn"]],
      [!proxy && lv("lang") === "warn", "lb_abroad", ["langs", "geo"]],
      [/^(macOS|iOS|iPadOS)/.test(P.os || ""), "lb_apple", ["os"]],
      [!!P.multi, "lb_multi", ["screens"]],
      [hour != null && hour < 5, "lb_night", ["tz"]],
      [!!P.tun && P.tun !== "pppoe", "lb_tunnel", ["tcpfp"]],
      [!!P.et, "lb_back", ["etag"]],
      [((R && R.extwar) || []).some(n => /LastPass|Bitwarden|1Password/.test(n)), "lb_pw", ["extwar"]],
    ].filter(([on]) => on).slice(0, 5);
    // (a browser that keeps no store at all, as strict settings do, counts as careful too)
    L.push([true, P.rand || P.fz || P.rf || P.tb || /^sh_(brave|rfp|fpp|atfp|ext)$/.test(P.sh || "") ? "lb_priv_hi" : P.ab ? "lb_priv_mid" : "lb_priv_lo", ["rand", "adblock", "traces"]]);
    if (R) R.labels = L.map(([, k]) => k);
    $("#lbsL").innerHTML = L.map(([, k, from]) => `<span class="lb" tabindex="0" title="${esc(t("from", { list: list(from.map(rowName)) }))}">${esc(t(k))}</span>`).join("");
    $("#lbs").hidden = false;
  }
  // how much the visitor stands out: how many had the same fingerprint, and the readings that are rarest
  const READABLE = ["gpu", "screen", "browser", "os", "langs", "tz", "emoji", "hwdec", "fontfp", "canvas", "audio", "webgl", "mathfp",
    "arch", "cpu", "mem", "hz", "engine", "engver", "kbd", "locale", "scheme", "a11y", "scrollbar", "touch", "form"];
  const rarest = n => READABLE.filter(k => n[k]).sort((a, b) => n[a] - n[b]).slice(0, 2);
  function standText(m, k, top) {
    const others = Math.max(0, k - 1), v = { m: m.toLocaleString(LANG), n: others.toLocaleString(LANG), top: list((top || []).map(rowName)) };
    const s = !others ? t("st_only", v) : tn(others <= 20 ? "st_few" : "st_many", others, v);
    // (Chinese puts a space between Chinese and Latin: "显眼的是 WebGL")
    return /^zh/.test(LANG) ? s.replace(/([\u3400-\u9fff])([A-Za-z0-9])/g, "$1 $2").replace(/([A-Za-z0-9])([\u3400-\u9fff])/g, "$1 $2") : s;
  }

  /* ---------- this run against the last one ---------- */
  // Kept in this browser only: how many things gave you away last time and which, so a change of settings shows
  // what it fixed ("rerun" after switching DNS, say)
  function compare() {
    let prev = null;
    try { prev = JSON.parse(store.get(K.prev) || "null"); } catch (e) {}
    const bad = l => l === "bad" || l === "warn", lvl = Object.fromEntries(CHECKS.map(id => [id, R.ck[id] ? R.ck[id][0] : null]));
    const n = COUNTED.filter(id => bad(lvl[id])).length;
    store.set(K.prev, JSON.stringify({ at: Date.now(), n, ck: lvl }));
    const el = $("#vCmp");
    if (!prev || !prev.ck) { el.hidden = true; return; }
    const fixed = COUNTED.filter(id => bad(prev.ck[id]) && lvl[id] === "ok"), worse = COUNTED.filter(id => prev.ck[id] === "ok" && bad(lvl[id]));
    const out = [t(prev.n === n ? "cmp_same" : "cmp_v", { ago: ago(prev.at), a: prev.n, b: n })];
    if (fixed.length) out.push(t("cmp_fixed", { list: list(fixed.map(id => t("c_" + id))) }));
    if (worse.length) out.push(t("cmp_new", { list: list(worse.map(id => t("c_" + id))) }));
    el.textContent = t(n < prev.n ? "cmp_down" : n > prev.n ? "cmp_up" : "cmp_eq", { d: Math.abs(n - prev.n) });
    el.title = out.join(/^(zh|ja)/.test(LANG) ? "" : " ");
    el.className = "v-cmp" + (n < prev.n ? " ok" : n > prev.n ? " bad" : "");
    el.hidden = false; $("#vMeta").hidden = false;
  }

  /* ---------- reporting a problem (the host's dialog) ---------- */
  // When the host provides the dialog (msOpenReport), two entries sit beside the results, each starting the text
  // box, only once this run has a result (R.end) and never on a shared, topic or embedded view. The dialog asks this
  // page for what the visitor saw: the portrait as a shared link carries it (no address, no fingerprint, city and
  // network masked), with the raw readings people most often say were read wrong, e.g. the graphics card's renderer,
  // the screen in CSS pixels and its ratio, the client hints, the engine, the keyboard, the voices and system fonts.
  const RP_ENTRIES = [["#rpRead", "rp_read_pre"], ["#rpCheck", "rp_check_pre"]];
  function syncReportEntries() {
    const show = typeof window.msOpenReport === "function" && !EMBED && !D.focus && !!(R && R.end);
    for (const [id, k] of RP_ENTRIES) { const b = $(id); if (!b) continue; b.setAttribute("data-ms-report", t(k)); b.hidden = !show; }
  }
  // each check that gives a verdict gets its own "this looks wrong" entry, carrying that check's verdict into the
  // dialog so the report starts with the sentence it is about (the whole check is named, not only the grade)
  function syncCheckReports() {
    const show = typeof window.msOpenReport === "function" && !EMBED && !D.focus && !!(R && R.end && R.ck);
    $$(".ckr").forEach(r => {
      const b = r.querySelector(".ck-rp"); if (!b) return;
      const id = r.dataset.c, ck = R && R.ck && R.ck[id];
      b.hidden = !(show && ck);
      if (show && ck) b.setAttribute("data-ms-report", t("rp_one", { c: t("c_" + id), v: ((r.querySelector(".ck-v") || {}).textContent || "").trim() }));
    });
  }
  if (typeof window.msOpenReport === "function" && !EMBED) {
    for (const [id, k] of RP_ENTRIES) $(id).setAttribute("data-ms-report", t(k));
    syncCheckReports();
    window.msReport = () => {
      if (!R || !R.ck || $("#rerun").disabled) return null;
      const c = (R.srv && R.srv.cf) || {}, gr = grade(R.ck, COUNTED.filter(id => R.ck[id])), hi = R.hi || {};
      // the screen as it is now, in physical pixels with the CSS size and ratio (the most reported reading)
      const sc = screen.width ? physicalScreen(screen.width, screen.height, devicePixelRatio || 1).join("×") + " (" + screen.width + "×" + screen.height + " @" + (devicePixelRatio || 1) + "x)" : R.screen;
      const summary = [$("#vHead").textContent, t("grade_v", { g: gr.grade }), R.osTxt, R.browser, sc, R.gpuSoft ? R.gpuRaw : R.gpu].filter(Boolean).join(" · ").slice(0, 300);
      const data = { portrait: sharedPortrait(false), raw: { wgpu: R.wgpu ? [R.wgpuLo, R.wgpu] : null,
        gpu: R.gpuRaw || null, screen: [screen.width, screen.height, devicePixelRatio], hints: { platform: hi.platform, platformVersion: hi.platformVersion, model: hi.model, mobile: hi.mobile },
        engine: R.engine || null, lies: R.lies && R.lies.list.length ? R.lies.list.slice(0, 12) : undefined, kbd: R.kbd || null, sysFonts: R.sysFonts || [], voices: [...new Set((R.voices || []).map(v => v.split(/[-_]/)[0]))],
        tz: R.tz, langs: R.langs, rtt: [R.rttB == null ? null : Math.round(R.rttB), c.clientTcpRtt || null], http: c.httpProtocol || null } };
      // what a visitor most often says is wrong, as "label: value" to pick from when they write nothing else: the graphics
      // card, the time zone check, the screen, the language check, the system, the system languages, the browser, then
      // any other check that gave them away (the reports so far, most frequent first)
      const sep = /^(zh|ja)/.test(LANG) ? "：" : ": ", flagged = id => R.ck[id] && (R.ck[id][0] === "bad" || R.ck[id][0] === "warn");
      const reading = (id, v) => v ? [t("s_" + id), v] : null, check = id => flagged(id) ? [t("c_" + id), CK[id].querySelector(".ck-v").textContent] : null;
      const picks = [reading("gpu", R.gpuSoft ? R.gpuRaw : R.gpu || R.gpuRaw), check("tz"), reading("screen", sc), check("lang"), reading("os", R.osTxt), check("syslang"),
        reading("browser", R.browser), ...CHECKS.filter(id => !["tz", "lang", "syslang"].includes(id)).map(check)]
        .filter(Boolean).slice(0, 8).map(([k, v]) => (k + sep + v).slice(0, 60));
      return { summary, data, picks };
    };
  }

  /* ---------- the last runs, as a line ---------- */
  // Kept in this browser only, ten at most: the count of each run, oldest on the left, each point's time on hover
  function history() {
    let h = [];
    try { h = JSON.parse(store.get(K.hist) || "[]"); } catch (e) {}
    const n = COUNTED.filter(id => R.ck[id] && (R.ck[id][0] === "bad" || R.ck[id][0] === "warn")).length;
    h = [...(Array.isArray(h) ? h : []), { at: Date.now(), n }].slice(-10);
    store.set(K.hist, JSON.stringify(h));
    const el = $("#vHist");
    if (h.length < 2) { el.hidden = true; return; }
    const W = 120, H = 26, top = Math.max(1, ...h.map(x => x.n)), x = i => (i * W / (h.length - 1)).toFixed(1), y = v => (H - 3 - v / top * (H - 6)).toFixed(1);
    const pts = h.map((p, i) => x(i) + "," + y(p.n)).join(" ");
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t("runs_v", { n: h.length }))}"><polyline points="${pts}"/>` +
      h.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.n)}" r="2.6"><title>${esc(t("hist_pt", { ago: ago(p.at), n: p.n }))}</title></circle>`).join("") + "</svg>";
    el.hidden = false; $("#vMeta").hidden = false;
  }

  // Compare with a friend: the portrait a shared link carried here (?vs=), beside the visitor's own, field by field
  function versus() {
    const code = new URLSearchParams(location.search).get("vs"), Q = code && decode(code);
    if (!Q) return;
    const P = sharedPortrait(false), gP = grade(P.ck || {}, COUNTED.filter(id => (P.ck || {})[id])), gQ = grade(Q.ck || {}, COUNTED.filter(id => (Q.ck || {})[id]));
    const found = X => COUNTED.filter(id => X.ck && X.ck[id] && (X.ck[id][0] === "bad" || X.ck[id][0] === "warn")).length;
    const F = [["s_geo", X => X.cc ? country(X.cc) : ""], ["s_os", X => X.os], ["s_browser", X => X.browser], ["s_screen", X => X.screen], ["s_gpu", X => X.gpu],
      ["s_langs", X => (X.langs || [])[0] ? language(X.langs[0]) : ""], ["s_tz", X => X.tz], ["s_dns", X => X.dns ? country(X.dns) : ""],
      ["vs_net", X => X.nt ? t("nt_" + X.nt, { n: X.nx || 0 }) : ""], ["s_scheme", X => t(X.dark ? "pt_dark" : "pt_light")], ["s_adblock", X => t(X.ab ? "vs_yes" : "vs_no")],
      ["vs_grade", X => X === Q ? gQ.grade : gP.grade], ["vs_found", X => String(found(X))]];
    const rows = F.map(([k, f]) => [k, f(P) || "–", f(Q) || "–"]).filter(([, a, b]) => a !== "–" || b !== "–");
    const same = rows.filter(([, a, b]) => a === b).length;
    // The same screen and the same system, but another browser: most likely one computer with two browsers, and what
    // differs below is the browser's own doing. (Not the hardware ID: a shared link carries no fingerprint, so the
    // comparison rests on what it does carry — the screen, the system and the browser's name.)
    const hwSame = !!Q.os && Q.os === P.os && !!Q.screen && Q.screen === P.screen && !!Q.browser && Q.browser !== P.browser;
    $("#vsN").textContent = (hwSame ? t("vs_samehw") + " · " : "") + t("vs_n", { n: same, m: rows.length });
    $("#vsT").innerHTML = `<thead><tr><th></th><th>${esc(t("vs_me"))}</th><th>${esc(t("vs_them"))}</th><td class="mk"></td></tr></thead><tbody>` +
      rows.map(([k, a, b]) => `<tr class="${a === b ? "same" : ""}"><th>${esc(k.startsWith("s_") ? t(k) : t(k))}</th><td>${esc(a)}</td><td>${esc(b)}</td><td class="mk">${a === b ? "=" : "≠"}</td></tr>`).join("") + "</tbody>";
    $("#vs").hidden = false;
    $("#vs").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "nearest" });
  }

  /* ---------- the portrait as text, to paste into a post ---------- */
  // The paragraph with the city and the network masked, every check with addresses cut to their network (as in a
  // shared link), the grade, and the page's own address to try it (the text is the result; a result link is long)
  function asText() {
    const P = sharedPortrait(false), c = (R.srv && R.srv.cf) || {}, colon = /^(zh|ja)/.test(LANG) ? "：" : ": ";
    const story = $$("#story p").map(p => [...p.childNodes].map(n => {
      if (n.nodeType === 3) return n.textContent;
      const k = n.dataset && n.dataset.b;
      return k === "city" || k === "isp" ? t("masked") : n.textContent;
    }).join("").trim()).filter(Boolean).join("\n\n");
    const mark = { ok: "✓", warn: "!", bad: "✗", info: "·" };
    const rows = ids => ids.filter(id => P.ck[id]).map(id => mark[P.ck[id][0]] + " " + t("c_" + id) + colon + ckText(id, P.ck[id], c.country));
    const gr = grade(P.ck, COUNTED.filter(id => P.ck[id]));
    return [t("card_me") + " · " + location.host, "", story, "", $("#vHead").textContent + " · " + t("grade_v", { g: gr.grade }), ...rows(CHECKS), "",
      t("h_proto"), ...rows(PROTO), "", t("card_cta") + colon + location.origin + (D.paths[LANG] || "/")].join("\n");
  }
  const copy = async s => {
    try { await navigator.clipboard.writeText(s); return true; } catch (e) {
      const ta = document.createElement("textarea"); ta.value = s; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand("copy"); } catch (x) {} ta.remove(); return ok;
    }
  };
  $("#copyTxt").onclick = async () => {
    const ok = await copy(asText());
    $("#copyT").textContent = t(ok ? "copied_txt" : "copy_fail");
    setTimeout(() => { $("#copyT").textContent = t("copy_txt"); }, 2000);
  };

  // Everything the run read, as a file the visitor keeps: the portrait, every sniffer row, every check. Built here and
  // downloaded from this browser; nothing is sent anywhere.
  function exportData() {
    const rows = $$(".pr[data-s]").map(r => ({ id: r.dataset.s, name: t("s_" + r.dataset.s), method: ((r.querySelector(".pm") || {}).textContent || "").trim(), value: ((r.querySelector(".pa") || {}).textContent || "").trim() }));
    const checks = $$(".ckr").map(r => ({ id: r.dataset.c, name: t("c_" + r.dataset.c), verdict: ((r.querySelector(".ck-v") || {}).textContent || "").trim() }));
    return {
      site: location.origin, page: location.href, when: new Date().toISOString(),
      portrait: $$("#story p").map(p => p.textContent.trim()).filter(Boolean).join("\n\n"),
      grade: ($("#mGrade").textContent || "").trim(), fingerprint: ($("#fpId").textContent || "").trim(),
      readings: rows, checks,
    };
  }
  $("#dlJson").onclick = () => {
    const blob = new Blob([JSON.stringify(exportData(), null, 2)], { type: "application/json" }), a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "who-are-you-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  $("#printPg").onclick = () => window.print();

  // The bid request an ad exchange builds from readings like these: the fields OpenRTB names, filled from what this
  // page read, shown so the visitor sees what is already known before any profile is attached. Built only when the
  // card is opened, and nothing is sent anywhere.
  function adProfile() {
    if (EMBED || D.focus || document.documentElement.classList.contains("shared") || !R) return;
    // (the card is drawn when the run starts, not when it ends: its collapsed row takes its line from the first
    // paint, so the tally under it does not move down at the end of every run. Its body is built when it is opened,
    // and only once the run is in — opened early, it fills at the end)
    const box = $("#adpD");
    box.hidden = false;
    const fill = () => {
      if (R.adpFilled || !R.end) return; R.adpFilled = true;
      const c = (R.srv && R.srv.cf) || {}, d = R.dev || {};
      const req = {
        site: { domain: location.hostname, page: location.origin + location.pathname },
        device: {
          ua: navigator.userAgent, ip: R.srv && R.srv.ip, lang: (R.langs || [])[0], languages: R.langs || [],
          tz: R.tz, w: screen.width, h: screen.height, dpr: devicePixelRatio || 1, devicetype: { phone: 4, tablet: 5, pc: 2 }[d.kind] || 2,
          os: d.os, osv: d.osv, js: 1, dnt: navigator.doNotTrack === "1" ? 1 : 0,
          geo: c.country ? { country: c.country, city: c.city, lat: c.latitude != null ? +c.latitude : undefined, lon: c.longitude != null ? +c.longitude : undefined, type: 2 } : undefined,
        },
        user: { ext: { consent: "none" } },
      };
      $("#adpJ").textContent = JSON.stringify(req, (k, v) => v === undefined ? undefined : v, 2);
    };
    if (!box.dataset.wired) { box.dataset.wired = "1"; box.addEventListener("toggle", () => { if (box.open) fill(); }); }
    if (box.open) fill();
  }

  // in an app's own browser: the page's address, to open it in the visitor's usual browser
  $("#iaCopy").onclick = async () => {
    const ok = await copy(location.origin + location.pathname);
    $("#iaCopy").textContent = t(ok ? "ia_copied" : "copy_fail");
    setTimeout(() => { $("#iaCopy").textContent = t("ia_copy"); }, 2000);
  };

  /* ---------- fixes for the visitor's own system ---------- */
  // The DNS and WebRTC fixes name the clients and settings of the system the visitor is on, when there are any
  function osTips() {
    const os = (R.dev && R.dev.os) || "", plat = /^Windows/.test(os) ? "win" : /^macOS/.test(os) ? "mac" : /^(iOS|iPadOS)/.test(os) ? "ios" : /^Android/.test(os) ? "and" : /Linux|Chrome OS/.test(os) ? "linux" : "";
    const bn = (R.br && R.br.name) || "", brw = bn === "Firefox" ? "ff" : bn === "Safari" ? "sf" : /^(Chrome|Edge|Opera|Brave|Vivaldi|Yandex)$/.test(bn) ? "cr" : "";
    const keys = { tz: plat ? "tip_tz_" + plat : "", lang: plat === "ios" || plat === "and" ? "tip_lang_" + plat : brw ? "tip_lang_" + brw : "",
      dns: plat && plat !== "linux" ? "tip_dns_" + plat : "", webrtc: plat === "ios" ? "tip_webrtc_ios" : plat === "and" ? "tip_webrtc_and" : plat ? "tip_webrtc_desk" : "", fp: plat === "ios" ? "tip_fp_ios" : "" };
    // (a clock a script rewrote is not fixed in the system settings the tz tips name, so that case brings its own)
    if (R.ck && R.ck.tz && R.ck.tz[1] === "c_tz_self") keys.tz = "tip_tz_self";
    for (const [id, k] of Object.entries(keys)) if (k && L[k]) CK[id].querySelector(".ck-tip").innerHTML = t(k).split("\n").map(l => `<li>${esc(l)}</li>`).join("");
  }

  /* ---------- a country to pass for ---------- */
  // By default the one the address is in; pick another to see what still gives you away: the address, the system's
  // time zone, the browser's language, the DNS resolver, WebRTC
  const CCS = [...new Set(Object.values(TZ_CC))].map(cc => [cc, country(cc)]).filter(([cc, n]) => n && n !== cc).sort((a, b) => { try { return a[1].localeCompare(b[1], LANG); } catch (e) { return a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0; } });
  // typed into, not scrolled: the name in the page's language or in English, or the code, narrows the list
  // ("jp", "japan", "日本"); names starting with what's typed come first
  const tgIn = $("#tgIn"), tgOpts = $("#tgOpts");
  // (accents dropped for matching; a browser with trimmed ICU data, as Quark ships, throws on normalize: then as typed)
  const fold = s => { s = String(s || ""); try { s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); } catch (e) {} return s.toLowerCase(); };
  let EN = null; try { EN = new Intl.DisplayNames(["en"], { type: "region" }); } catch (e) {}
  const OPTS = [{ cc: "", n: t("tg_auto"), k: [fold(t("tg_auto"))] }, ...CCS.map(([cc, n]) => ({ cc, n, k: [fold(n), fold(EN && EN.of(cc)), cc.toLowerCase()] }))];
  let tgVal = (!EMBED && store.get(K.target)) || "", tgHit = OPTS, tgAt = 0;
  if (!OPTS.some(o => o.cc === tgVal)) tgVal = "";
  const tgName = () => (OPTS.find(o => o.cc === tgVal) || OPTS[0]).n;
  tgIn.value = tgName(); tgIn.placeholder = t("tg_find");
  function tgShow(q) {
    const f = fold(q).trim(), rank = o => o.k.some(k => k.startsWith(f)) ? 0 : 1;
    tgHit = f ? OPTS.filter(o => o.k.some(k => k.includes(f))).sort((a, b) => rank(a) - rank(b)) : OPTS;
    tgAt = f ? 0 : Math.max(0, tgHit.findIndex(o => o.cc === tgVal));
    tgOpts.innerHTML = tgHit.length ? tgHit.map((o, i) => `<li role="option" id="tgO${i}" data-n="${i}" aria-selected="${o.cc === tgVal}">${o.cc ? flag(o.cc) : '<span class="flag-x"></span>'}<span>${esc(o.n)}</span></li>`).join("")
      : `<li class="none">${esc(t("tg_none"))}</li>`;
    tgOpts.hidden = false; tgIn.setAttribute("aria-expanded", "true"); tgMark();
  }
  function tgMark() {
    [...tgOpts.children].forEach((li, i) => li.classList.toggle("on", i === tgAt));
    const on = tgOpts.children[tgAt];
    if (on && on.id) { tgIn.setAttribute("aria-activedescendant", on.id); on.scrollIntoView({ block: "nearest" }); } else tgIn.removeAttribute("aria-activedescendant");
  }
  function tgClose() { tgOpts.hidden = true; tgIn.setAttribute("aria-expanded", "false"); tgIn.removeAttribute("aria-activedescendant"); tgIn.value = tgName(); }
  function tgPick(o) { tgVal = o.cc; if (!EMBED) store.set(K.target, tgVal); tgClose(); tgIn.blur(); paintTarget(); }
  tgIn.onfocus = () => { tgShow(""); tgIn.select(); };
  tgIn.oninput = () => tgShow(tgIn.value);
  tgIn.onblur = tgClose;
  tgIn.onkeydown = e => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (tgOpts.hidden) return tgShow("");
      if (tgHit.length) { tgAt = (tgAt + (e.key === "ArrowDown" ? 1 : -1) + tgHit.length) % tgHit.length; tgMark(); }
    } else if (e.key === "Enter") { e.preventDefault(); if (!tgOpts.hidden && tgHit[tgAt]) tgPick(tgHit[tgAt]); }
    else if (e.key === "Escape") { tgClose(); tgIn.blur(); }
  };
  tgOpts.onpointerdown = e => e.preventDefault();   // the box keeps the focus until the pick
  tgOpts.onclick = e => { const li = e.target.closest("li[data-n]"); if (li) tgPick(tgHit[+li.dataset.n]); };
  function paintTarget() {
    const c = (R.srv && R.srv.cf) || {}, T = tgVal || c.country;
    if (!T || !R.ck) return;
    const name = country(T), wr = R.ck.webrtc && R.ck.webrtc[0];
    const items = [["ip", c.country ? c.country === T : null], ["tz", R.tz ? tzCC(R.tz) === T : null], ["lang", R.langs && R.langs.length ? langCC(R.langs[0]) === T : null],
      ["dns", R.dnsCC ? R.dnsCC === T : null], ["rtc", wr ? wr !== "bad" : null]];
    for (const [id, ok] of items) {
      const li = $(`#tgList [data-t="${id}"]`);
      li.className = ok == null ? "na" : ok ? "ok" : "bad";
      li.querySelector(".tg-i").textContent = ok == null ? "–" : ok ? "✓" : "✗";
      li.querySelector(".tg-l").textContent = t("tg_" + id, { c: name });
      li.querySelector(".tg-x").textContent = ok === false ? t("tg_" + id + "_fix", { c: name }) : "";
    }
    const left = items.filter(([, ok]) => ok === false).length;
    $("#tgSum").textContent = left ? t("tg_left", { n: left, c: name }) : t("tg_all", { c: name });
    $("#tgSum").className = "tg-sum " + (left ? "bad" : "ok");
  }

  /* ---------- the disguise checks ---------- */
  const CK = Object.fromEntries($$(".ckr[data-c]").map(r => [r.dataset.c, r]));
  // a check's result as text: [level, key, vars]; ipc: the address's country
  function ckText(id, [, key, vars], ipc) {
    const vv = Object.fromEntries(Object.entries(vars).map(([k, x]) => [k, k === "cc" || k === "cc2" ? country(x) : id === "split" ? exitName(x) : id === "conn" && k === "a" ? t("tos_" + x) : x]));
    if (id === "tz" || id === "lang" || id === "dns" || id === "syslang") vv.ipc = ipc ? country(ipc) : "?";
    if (id === "syslang" && vars.from) vv.from = list(String(vars.from).split(",").map(rowName));
    if ((id === "tamper" || id === "fpb") && vars.list) vv.list = list(String(vars.list).split(",").map(k => t(k)));
    // each side as its zone's name with the offset ("Pacific Time UTC-08:00"), or the offset alone
    if (id === "tz") { vv.A = zoneLabel(vars.za, vars.a, ipc); vv.B = zoneLabel(vars.zb, vars.b); }
    return t(key, vv);
  }
  // res: check id → [level, key, vars]; ipc: the address's country
  // a topic page's fix: the check's own steps (for this system and browser, once osTips has named them), when it gives you away
  function focusFix() {
    const id = D.focus && D.focus.check, box = $("#focusFix");
    if (!id || !box || !CK[id] || !R || !R.ck || !R.ck[id]) return;
    box.querySelector("ul").innerHTML = CK[id].querySelector(".ck-tip").innerHTML;
    box.hidden = R.ck[id][0] !== "bad" && R.ck[id][0] !== "warn";
  }
  // The strip under a check holds 怎么改 and the check's own test; 反馈 is an icon at the row's right end, off the strip.
  // A row with neither of the strip's two keeps no strip (its height goes to zero): the empty line under every fine row
  // was what read as a broken layout (see style.css).
  const actsVoid = r => { const a = r.querySelector(".ck-acts"); if (a) a.classList.toggle("void", [...a.children].every(x => x.hidden)); };
  // A row with nothing to say yet: no verdict (the ruler that held its place on the last run), no mark, no 怎么改, no
  // tip, no 反馈 — and its strip gone with them, so a run never shows the numbers it is about to replace.
  const clearRow = r => {
    const off = r.classList.contains("off");
    r.className = "ckr"; if (off) r.classList.add("off");
    delete r.dataset.why;
    r.querySelector(".ck-v").innerHTML = '<i class="skl"></i>'; r.querySelector(".st").textContent = "";
    r.querySelector(".ck-fix").hidden = true; r.querySelector(".ck-tip").hidden = true;
    const go = r.querySelector(".ck-go"); if (go) go.hidden = true;
    const rp = r.querySelector(".ck-rp"); if (rp) { rp.hidden = true; rp.removeAttribute("data-ms-report"); }
    actsVoid(r);
  };
  function paintChecks(res, ipc, final) {
    let bad = 0, warn = 0;
    for (const id of [...CHECKS, ...PROTO]) {
      const r = CK[id], v = res[id];
      if (!v) continue;
      const [lv] = v;
      if (CHECKS.includes(id) && counted(id)) { if (lv === "bad") bad++; if (lv === "warn") warn++; }
      r.className = "ckr st-" + lv + (CHECKS.includes(id) && !counted(id) ? " off" : "");
      const sg = $(`#segs [data-c="${id}"]`); if (sg) sg.className = "st-" + lv + (!counted(id) ? " off" : "");
      // the whole text on hover only when two lines cut it short; otherwise it would just repeat the row
      const cv = r.querySelector(".ck-v"); cv.textContent = ckText(id, v, ipc);
      if (cv.scrollHeight > cv.clientHeight + 1) r.dataset.why = cv.textContent; else delete r.dataset.why;
      r.querySelector(".st").textContent = lv === "ok" ? "✓" : lv === "info" ? "i" : "!";
      if (D.focus && D.focus.check === id) {
        const fv = $("#focusV"); fv.className = "focus-v st-" + lv;
        fv.querySelector("b").textContent = cv.textContent; fv.querySelector(".st").textContent = r.querySelector(".st").textContent;
        focusFix();
      }
      // a check that gives you away says how to fix it
      r.querySelector(".ck-fix").hidden = lv !== "bad" && lv !== "warn";
      const go = r.querySelector(".ck-go");
      if (go) {
        // only when the check gives you away
        const href = id === "dns" ? DNSTEST && inLang(DNSTEST) : id === "dc" ? ipqsOf(R && R.srv && R.srv.ip) : EGRESS && inLang(EGRESS);
        go.hidden = !href || (lv !== "bad" && lv !== "warn"); if (href) go.href = href;
      }
      actsVoid(r);
    }
    if (!final) return;
    // a portrait shared before the protocols were judged has none: their rows step aside
    $("#protoBox").hidden = !PROTO.some(id => res[id]);
    const n = bad + warn;
    $("#vHead").textContent = n ? tn("v_found", n, { n }) : t("v_clean");
    $("#vText").textContent = t(n ? "v_found_d" : "v_clean_d");
    $("#vHead").className = "v-h" + (bad ? " bad" : warn ? " warn" : " ok");
    $("#mNum").textContent = n; $("#mNum").className = "m-num " + (bad ? "bad" : warn ? "warn" : "ok");
    const gr = grade(res, CHECKS.filter(id => res[id] && counted(id)));
    $("#mGrade").textContent = t("grade_v", { g: gr.grade }); $("#mGrade").className = "m-grade g-" + gr.grade.replace("+", "p"); $("#mGrade").hidden = false;
    $("#mGrade").title = t("grade_why", { s: gr.score });
  }
  // What to fix first: the checks that give you away, a contradiction before a hint, the ones a site weighs most first;
  // each with the first step of its fix. A click opens that check's fix
  // the scene: every check counts when passing as someone elsewhere; for privacy, only what leaks or tracks you
  const PRIV = ["webrtc", "dns", "fp", "fpb", "tamper", "bot"];
  let scene = !EMBED && store.get(K.scene) === "priv" ? "priv" : "all";
  let shownShared = false;
  // (a shared portrait is judged as passing as elsewhere: what its link's preview counts)
  const counted = id => scene === "priv" && !shownShared ? PRIV.includes(id) : COUNTED.includes(id);
  function paintScene() {
    $$("#scene [data-sc]").forEach(b => b.setAttribute("aria-checked", b.dataset.sc === scene));
    for (const id of CHECKS) {
      CK[id].classList.toggle("off", !counted(id)); CK[id].title = counted(id) ? "" : t(id === "fp" ? "sc_off_fp" : "sc_off");
      const sg = $(`#segs [data-c="${id}"]`); if (sg) sg.classList.toggle("off", !counted(id));
    }
  }
  $("#scene").onclick = e => {
    const b = e.target.closest("[data-sc]");
    if (!b || b.dataset.sc === scene) return;
    scene = b.dataset.sc; store.set(K.scene, scene);
    if (R.ck) { paintChecks(R.ck, R.srv && R.srv.cf && R.srv.cf.country, true); todo(); }
    paintScene();
  };
  const WEIGHT = { bot: 9, webrtc: 9, dns: 8, tz: 8, tamper: 7, fpb: 7, conn: 7, ua: 6, rtt: 6, split: 5, dc: 5, lang: 4, syslang: 3, fp: 2 };
  function todo() {
    const res = R.ck || {}, lvOf = id => res[id] && res[id][0];
    const top = CHECKS.filter(id => counted(id) && (lvOf(id) === "bad" || lvOf(id) === "warn"))
      .sort((a, b) => (lvOf(a) === "bad" ? 0 : 1) - (lvOf(b) === "bad" ? 0 : 1) || (WEIGHT[b] || 0) - (WEIGHT[a] || 0)).slice(0, 3);
    $("#todo").hidden = !top.length;
    $("#todoL").innerHTML = top.map(id => {
      const step = (CK[id].querySelector(".ck-tip li") || {}).textContent || "";
      return `<li class="${lvOf(id)}"><button type="button" data-go="${id}" title="${esc(step)}"><b>${esc(t("c_" + id))}</b><span>${esc(step)}</span></button></li>`;
    }).join("");
  }
  $("#todoL").onclick = e => {
    const b = e.target.closest("[data-go]");
    if (!b) return;
    const r = CK[b.dataset.go], tip = r.querySelector(".ck-tip"), fix = r.querySelector(".ck-fix");
    tip.hidden = false; fix.setAttribute("aria-expanded", "true");
    r.scrollIntoView({ block: "center", behavior: "smooth" });
  };
  // Phones: the verdict (count, grade, share) right under the title, the portrait from its first paragraph, the
  // sniffer groups folded to their headings but the first; a wider window puts everything back
  const PHONE = matchMedia("(max-width: 720px)"), meter = $(".meter"), meterHome = meter.parentNode, meterNext = meter.nextElementSibling;
  let storyOpen = false;
  function phone() {
    if (PHONE.matches) { if (meter.parentNode !== $("#mSlot")) $("#mSlot").appendChild(meter); }
    else if (meter.parentNode !== meterHome) meterHome.insertBefore(meter, meterNext);
    const many = $$("#story p").length > 1, fold = PHONE.matches && many && !storyOpen;
    $("#story").classList.toggle("fold", fold); $("#storyMore").hidden = !fold;
  }
  $("#storyMore").onclick = () => { storyOpen = true; phone(); };
  $$(".pg").forEach((g, i) => {
    if (PHONE.matches && i > 0) g.classList.add("fold");
    g.querySelector("h3").onclick = e => { if (!e.target.closest("a")) g.classList.toggle("fold"); };
  });
  phone(); paintScene();
  if (PHONE.addEventListener) PHONE.addEventListener("change", phone); else PHONE.addListener(phone);
  // How common the visitor is. After a check the page sends its trait values and results to /api/seen, which counts
  // them (once a day per browser and fingerprint) and answers how many checks had each value. Not counted: an embedded
  // or automated browser, one that sends Global Privacy Control, one whose visitor said "don't count me"
  const optedOut = () => store.get(K.optout) === "1";
  function paintOptout() {
    $("#tlOff").textContent = t(optedOut() ? "tl_back" : "tl_off");
    $("#tally").classList.toggle("off", optedOut());
  }
  $("#tlOff").onclick = () => { store.set(K.optout, optedOut() ? "0" : "1"); paintOptout(); document.documentElement.toggleAttribute("data-nouniq", optedOut()); if (optedOut()) { $("#fpUniq").hidden = true; $$(".rar").forEach(e => e.remove()); R.uniq = null; blank("stand", esc(t("st_off"))); } };
  $("#tlMore").onclick = () => openHelp(typeof D.store === "number" ? D.store : 0);
  paintOptout();
  function traitValues() {
    const p = R.fpParts || {}, loc = (() => { try { return Intl.DateTimeFormat().resolvedOptions().locale; } catch (e) { return null; } })();
    const ev = R.engVer, hi = R.hi || {};
    const v = { os: R.osTxt, browser: R.browser, screen: /×/.test(R.screen || "") ? R.screen : null, gpu: R.gpu, langs: (R.langs || [])[0], tz: R.tz,
      fontfp: p.fontfp, canvas: p.canvas, webgl: p.webgl, audio: p.audio, mathfp: R.mathfp, emoji: R.emoji, hwdec: R.hwdec, fpid: R.fpHex && R.fpHex.slice(0, 8),
      // (the coarse readings beside the fingerprints: each one on its own says something about where a visitor comes from)
      arch: hi.architecture, cpu: navigator.hardwareConcurrency, mem: navigator.deviceMemory, hz: R.hz, engine: R.engine,
      engver: ev ? ev.lo + "-" + (ev.hi == null ? "+" : ev.hi) : null, kbd: R.kbd, locale: loc, scheme: R.dark ? "dark" : "light",
      a11y: R.hc ? "contrast" : "none", scrollbar: R.sbw, touch: navigator.maxTouchPoints, form: hi.formFactors && hi.formFactors.join(",") };
    return Object.fromEntries(TRAITS.filter(k => v[k]).map(k => [k, String(v[k])]));
  }
  async function seen() {
    if (EMBED || R.webdriver || navigator.globalPrivacyControl || optedOut()) return;
    const tv = traitValues();
    if (!tv.fpid) { $("#fpUniq").classList.add("gone"); return; }
    const stamp = new Date().toISOString().slice(0, 10) + ":" + tv.fpid, add = store.get(K.seen) !== stamp, dur = durOf(performance.now() - R.t0);
    const ck = Object.fromEntries([...CHECKS, ...PROTO].filter(id => R.ck && R.ck[id]).map(id => [id, R.ck[id][0]]));
    let r;
    try {
      const res = await within(fetch("/api/seen", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ add, t: tv, ck, dur }) }), 4000, null);
      r = res && res.ok ? await res.json() : null;
    } catch (e) { r = null; }
    if (!r || typeof r.total !== "number") { $("#fpUniq").classList.add("gone"); return; }
    if (add) store.set(K.seen, stamp);
    R.uniq = { total: r.total, n: r.n || {} };
    paintUniq();
  }
  // a run still going STUCK_MS in: counted once as stuck, the time alone (nothing about the visitor)
  function stuck() {
    if (EMBED || navigator.webdriver || navigator.globalPrivacyControl || optedOut()) return;
    fetch("/api/seen", { method: "POST", keepalive: true, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dur: "stuck" }) }).catch(() => {});
  }
  function paintUniq() {
    const u = R.uniq;
    $$(".rar").forEach(e => e.remove());
    if (!u) return;
    const f = $("#fpUniq");
    f.hidden = false; f.classList.remove("wait");
    if (u.total < MIN_TOTAL) { f.textContent = t("tl_wait", { m: u.total.toLocaleString(LANG) }); blank("stand", esc(t("st_wait"))); return; }
    blank("stand", esc(standText(u.total, u.n.fpid || 1, rarest(u.n))));
    const others = Math.max(0, (u.n.fpid || 1) - 1);
    f.textContent = others ? tn("tl_same", others, { m: u.total.toLocaleString(LANG), n: others.toLocaleString(LANG) }) : t("tl_only", { m: u.total.toLocaleString(LANG) });
    rareList(u);
    for (const k of TRAITS) {
      const lv = rarity(u.n[k], u.total), r = PR[k];
      if (!lv || !r) continue;
      r.querySelector(".pn").insertAdjacentHTML("beforeend", `<span class="rar ${lv}">${esc(t("rr_" + lv))}</span>`);
    }
  }
  // Each reading's share of all the checks here, in bits (each one halves the people like you), the rarest first, and
  // the whole fingerprint last from its own count: the readings go together, so it is not their product
  function rareList(u) {
    const bits = n => Math.log2(u.total / Math.max(1, n)), one = n => u.total / Math.max(1, n) < 2 ? t("rr_pct", { p: Math.round(100 * n / u.total) })
      : t("rr_one", { r: Math.round(u.total / Math.max(1, n)).toLocaleString(LANG) });
    const ks = READABLE.filter(k => u.n[k]).sort((a, b) => bits(u.n[b]) - bits(u.n[a])), top = Math.log2(u.total) || 1;
    const li = (name, n, cls) => `<li${cls ? ` class="${cls}"` : ""}><span>${esc(name)}</span><i style="width:${(100 * bits(n) / top).toFixed(1)}%"></i><b>${esc(one(n))} · ${esc(t("rr_bits", { b: bits(n).toFixed(1) }))}</b></li>`;
    $("#rarS").textContent = t("rr_sum", { m: u.total.toLocaleString(LANG) });
    $("#rarL").innerHTML = ks.map(k => li(rowName(k), u.n[k])).join("") + li(t("rr_all"), u.n.fpid || 1, "all");
    $("#rarD").hidden = false;
  }
  // the share card's line about it
  const uniqLine = () => {
    const u = R.uniq;
    if (!u || u.total < MIN_TOTAL) return "";
    const n = u.n.fpid || 1;
    return n <= 1 ? t("card_only", { m: u.total.toLocaleString(LANG) }) : t("card_one_in", { r: Math.round(u.total / n).toLocaleString(LANG) });
  };
  // The stats page: everyone counted (anonymous counts from /api/stats), the last 7 days
  const IC = {
    split: '<path d="M2 4h3l6 8h3M2 12h3l2-2.7M10 6.7L11 4h3M12.5 2.5L14 4l-1.5 1.5M12.5 10.5L14 12l-1.5 1.5"/>',
    tz: '<circle cx="8" cy="8" r="6.2"/><path d="M8 4.5V8l2.5 1.5"/>',
    dns: '<circle cx="8" cy="8" r="6.2"/><path d="M1.8 8h12.4M8 1.8c1.8 1.7 2.6 3.8 2.6 6.2S9.8 12.5 8 14.2C6.2 12.5 5.4 10.4 5.4 8S6.2 3.5 8 1.8z"/>',
    webrtc: '<path d="M4.6 11.4a4.8 4.8 0 0 1 0-6.8M11.4 4.6a4.8 4.8 0 0 1 0 6.8M2.7 13.3a7.5 7.5 0 0 1 0-10.6M13.3 2.7a7.5 7.5 0 0 1 0 10.6"/><circle cx="8" cy="8" r="1.4"/>',
    dc: '<rect x="2" y="2.5" width="12" height="4.5" rx="1"/><rect x="2" y="9" width="12" height="4.5" rx="1"/><path d="M4.5 4.75h.01M4.5 11.25h.01"/>',
    os: '<rect x="1.5" y="2.5" width="13" height="8.5" rx="1.2"/><path d="M5.5 13.5h5M8 11v2.5"/>',
    browser: '<rect x="1.5" y="2.5" width="13" height="11" rx="1.5"/><path d="M1.5 5.5h13M3.8 4h.01M5.6 4h.01"/>',
    screen: '<path d="M2 5V2.5h2.5M11.5 2.5H14V5M14 11v2.5h-2.5M4.5 13.5H2V11"/>',
    gpu: '<rect x="4" y="4" width="8" height="8" rx="1"/><path d="M6.5 1.5V4M9.5 1.5V4M6.5 12v2.5M9.5 12v2.5M1.5 6.5H4M1.5 9.5H4M12 6.5h2.5M12 9.5h2.5"/>',
    langs: '<path d="M2 3.5h7M5.5 2v1.5M3.5 3.5c.5 2.5 2.2 4.4 4.5 5.4M7.5 3.5c-.5 2.6-2.4 4.7-5 5.8M9 14l2.7-6.5L14.5 14M9.9 12h3.7"/>',
  };
  const ic = (k, cls = "cp-i") => `<span class="${cls}"><svg viewBox="0 0 16 16" aria-hidden="true">${IC[k] || ""}</svg></span>`;
  async function crowd() {
    let s = null;
    try { const r = await within(fetch("/api/stats"), 6000, null); s = r && r.ok ? await r.json() : null; } catch (e) {}
    if (!s || !s.days) { $("#crN").textContent = "–"; $("#crFacts").innerHTML = `<li class="card"><p>${esc(t("cr_na"))}</p></li>`; return; }
    const since = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10), sum = {};
    for (const [d, per] of Object.entries(s.days)) if (d >= since) for (const [id, lv] of Object.entries(per)) { const o = sum[id] ||= {}; for (const [k, c] of Object.entries(lv)) o[k] = (o[k] || 0) + c; }
    const all = id => Object.values(sum[id] || {}).reduce((a, b) => a + b, 0), share = (id, lvs) => all(id) ? lvs.reduce((a, l) => a + ((sum[id] || {})[l] || 0), 0) / all(id) : 0;
    const n = Math.max(0, ...COUNTED.map(all)), pc = x => Math.round(x * 100) + "%";
    // the week before, for each check's change (shown once that week has enough checks of it)
    const before = new Date(Date.now() - 14 * 864e5).toISOString().slice(0, 10), prev = {};
    for (const [d, per] of Object.entries(s.days)) if (d >= before && d < since) for (const [id, lv] of Object.entries(per)) { const o = prev[id] ||= {}; for (const [k, c] of Object.entries(lv)) o[k] = (o[k] || 0) + c; }
    const pAll = id => Object.values(prev[id] || {}).reduce((a, b) => a + b, 0), pShare = id => pAll(id) ? (((prev[id] || {}).warn || 0) + ((prev[id] || {}).bad || 0)) / pAll(id) : 0;
    const wk = (id, p) => {
      if (pAll(id) < 200) return "";
      const d = Math.round((p - pShare(id)) * 1000) / 10;
      return Math.abs(d) < 0.5 ? `<small class="wk" title="${esc(t("cr_wk_same"))}">=</small>`
        : `<small class="wk ${d > 0 ? "up" : "down"}" title="${esc(t("cr_wk", { d: (d > 0 ? "+" : "") + d.toLocaleString(LANG) }))}">${d > 0 ? "↑" : "↓"}${Math.abs(d).toLocaleString(LANG)}</small>`;
    };
    $("#crN").textContent = n.toLocaleString(LANG);
    $("#crFacts").innerHTML = [["split", ["warn"], "cr_f_split"], ["tz", ["bad"], "cr_f_tz"], ["dns", ["bad"], "cr_f_dns"], ["webrtc", ["bad"], "cr_f_rtc"], ["dc", ["warn", "bad"], "cr_f_dc"]]
      .map(([id, lvs, k]) => { const p = share(id, lvs); return `<li class="card ${p >= .3 ? "hi" : p >= .15 ? "mid" : ""}">${ic(id)}<b>${pc(p)}</b><p>${esc(t(k))}</p></li>`; }).join("");
    $("#crBars").innerHTML = COUNTED.filter(id => all(id)).map(id => [id, share(id, ["warn", "bad"]), share(id, ["bad"])]).sort((a, b) => b[1] - a[1])
      .map(([id, p, bad]) => `<li class="${bad >= p / 2 && p ? "bad" : p < .05 ? "low" : ""}"><span>${esc(t("c_" + id))}</span><i><span style="width:${Math.max(1, Math.round(p * 100))}%"></span></i><em>${pc(p)}${wk(id, p)}</em></li>`).join("");
    const shown = { os: v => v, browser: v => v, screen: v => v, gpu: v => v, tz: v => tzLabel(v), langs: v => language(v) }, T0 = s.total || 1;
    $("#crTop").innerHTML = Object.keys(shown).filter(f => (s.top || {})[f] && s.top[f].length).map(f => `<div><h3>${ic(f === "tz" ? "tz" : f)}${esc(t("s_" + f))}</h3><ol>` +
      s.top[f].slice(0, 5).map(([v, c]) => `<li><span title="${esc(shown[f](v))}">${esc(shown[f](v))}</span><em>${pc(c / T0)}</em><i><span style="width:${Math.max(2, Math.round(c / s.top[f][0][1] * 100))}%"></span></i></li>`).join("") + "</ol></div>").join("");
    $(".cp-top").hidden = !$("#crTop").children.length;   // (nothing shared by enough checks yet)
  }
  if (D.focus && D.focus.stats) crowd();
  // the main page's pill: the last 7 days' checks, and what gave people away most, once the page has drawn
  async function live() {
    let s = null;
    try { const r = await within(fetch("/api/stats"), 6000, null); s = r && r.ok ? await r.json() : null; } catch (e) {}
    const el = $("#live");
    if (!s || !s.days) { el.classList.add("none"); return; }
    const since = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10), sum = {};
    for (const [d, per] of Object.entries(s.days)) if (d >= since) for (const [id, lv] of Object.entries(per)) { const o = sum[id] ||= {}; for (const [k, c] of Object.entries(lv)) o[k] = (o[k] || 0) + c; }
    const all = id => Object.values(sum[id] || {}).reduce((a, b) => a + b, 0), bad = id => all(id) ? ((sum[id].warn || 0) + (sum[id].bad || 0)) / all(id) : 0;
    const n = Math.max(0, ...COUNTED.map(all)), top = COUNTED.filter(all).sort((a, b) => bad(b) - bad(a))[0];
    if (!n || !top) { el.classList.add("none"); return; }
    let nf; try { nf = new Intl.NumberFormat(LANG, { notation: "compact", maximumFractionDigits: 1 }).format(n); } catch (e) { nf = n.toLocaleString(LANG); }
    el.querySelector(".live-t").innerHTML = t("lv_bar", { n: `<b>${esc(nf)}</b>`, top: esc(t("c_" + top)), p: `<b>${Math.round(bad(top) * 100)}%</b>` });
    el.title = el.querySelector(".live-t").textContent;
  }
  // (when the page is idle, or after 2.5 s at most: the checks keep it busy, and a background tab may never idle)
  if (!D.focus && !EMBED && $("#live")) { if (window.requestIdleCallback) requestIdleCallback(() => live(), { timeout: 2500 }); else setTimeout(live, 1500); }
  $$(".ck-fix").forEach(btn => {
    btn.onclick = e => {
      e.stopPropagation();
      const tip = btn.closest(".ckr").querySelector(".ck-tip"), open = tip.hidden;
      tip.hidden = !open; btn.setAttribute("aria-expanded", open);
    };
  });
  // the languages this system installed (fonts, voices, keyboard), once the device is known
  const sysOf = () => R.dev ? sysLangs({ os: R.dev.os, fonts: [...(R.fonts || []), ...(R.sysFonts || [])], voices: R.voices || [], kbd: R.kbd }) : undefined;
  // Signs that something rewrote what the page reads: a property defined on navigator itself or a getter that isn't
  // the browser's own, a drawing or sound function replaced, a JavaScript engine that isn't the user agent's, a
  // language in JavaScript that the request's header doesn't have, a Date that disagrees with Intl about the zone
  function tampered() {
    const out = [], own = f => typeof f !== "function" || /\{\s*\[native code\]\s*\}\s*$/.test(Function.prototype.toString.call(f));
    const props = ["userAgent", "platform", "language", "languages", "hardwareConcurrency", "deviceMemory", "webdriver", "vendor", "maxTouchPoints"];
    const desc = (o, k) => { for (let p = o; p; p = Object.getPrototypeOf(p)) { const d = Object.getOwnPropertyDescriptor(p, k); if (d) return [p, d]; } return [null, null]; };
    if (props.some(k => { const [p, d] = desc(navigator, k); return p === navigator || (d && d.get && !own(d.get)); })
      || ["width", "height", "colorDepth"].some(k => { const [p, d] = desc(screen, k); return p === screen || (d && d.get && !own(d.get)); })) out.push("tp_props");
    const fns = [window.HTMLCanvasElement && HTMLCanvasElement.prototype.toDataURL, window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype.getImageData,
      window.WebGLRenderingContext && WebGLRenderingContext.prototype.getParameter, window.AudioBuffer && AudioBuffer.prototype.getChannelData,
      Date.prototype.getTimezoneOffset, Intl.DateTimeFormat.prototype.resolvedOptions];
    if (fns.some(f => f && !own(f))) out.push("tp_fn");
    const name = R.br && R.br.name, ios = R.dev && /^iOS|^iPadOS/.test(R.dev.os || "");
    const want = ios || name === "Safari" || name === "WebKit" ? "JavaScriptCore" : name === "Firefox" ? "SpiderMonkey" : /^(Chrome|Edge|Opera|Brave|Vivaldi|Yandex|Samsung Internet)$/.test(name || "") ? "V8" : null;
    if (want && R.engine && R.engine !== want) out.push("tp_engine");
    const hl = ((R.srv && R.srv.h && R.srv.h["accept-language"]) || "").split(",")[0].split(";")[0].trim().toLowerCase();
    if (hl && R.langs && R.langs[0] && hl !== R.langs[0].toLowerCase()) out.push("tp_hdr");
    if (R.tzOff != null && -new Date().getTimezoneOffset() !== R.tzOff) out.push("tp_tz");
    // (navigator.connection: an anti-detect browser describes a phone's network on a machine that doesn't have one. Its
    // getters must be the browser's own like the rest of navigator, and the values must be ones the API can produce:
    // type and effectiveType only from the spec's lists, and in Chromium rtt comes in 25 ms steps)
    const nc = navigator.connection;
    if (nc) {
      if (desc(navigator, "connection")[0] === navigator || ["type", "effectiveType", "rtt", "downlink", "saveData"].some(k => {
        const [p, d] = desc(nc, k); return p === nc || (d && d.get && !own(d.get));
      })) out.push("tp_props");
      const TY = ["bluetooth", "cellular", "ethernet", "none", "wifi", "wimax", "other", "unknown"], ET = ["slow-2g", "2g", "3g", "4g"];
      if ((nc.type != null && !TY.includes(nc.type)) || (nc.effectiveType != null && !ET.includes(nc.effectiveType)) ||
        (R.engine === "V8" && typeof nc.rtt === "number" && nc.rtt !== 0 && nc.rtt % 25 !== 0)) out.push("tp_conn");
    }
    if (R.osClaim) out.push("tp_os");
    // (noise in what canvas or audio read back, where the browser adds none of its own: an extension put it there)
    if (want === "V8" && name !== "Brave" && !navigator.brave && (R.pxNoise || R.auNoise)) out.push("tp_noise");
    // (the lie check's findings: an API that isn't the browser's own, a frame that reads otherwise)
    // (not in the iOS browsers other than Safari: Chrome, Edge, Firefox and the rest on iOS are Safari's engine with the
    // app's own scripts put into every page, which replace some functions; no extension runs there)
    if (R.lies && R.lies.list.length && !(ios && name !== "Safari")) out.push("tp_lies");
    if (R.lies && R.lies.frame.length) out.push("tp_frame");
    // (the identity strings a user-agent switcher forgets: vendor and productSub name the engine family on their own.
    // On iOS every browser is WebKit, so they read Apple's strings whatever the app calls itself — see idLies)
    if (idLies({ name: R.br && R.br.name, ios, vendor: R.vendor, productSub: R.productSub })) out.push("tp_id");
    // (the request's high-entropy Client Hints against the page's own: a script can rewrite navigator, not the headers)
    if (R.chHdr && R.hi && R.hi.architecture && R.hi.bitness) {
      const h = R.chHdr, hf = k => h[k] == null ? null : unq(h[k]);
      const forms = v => String(v || "").split(",").map(s => unq(s)).filter(Boolean).sort().join(",");
      const bad = (hf("sec-ch-ua-arch") != null && hf("sec-ch-ua-arch") !== R.hi.architecture) ||
        (hf("sec-ch-ua-bitness") != null && hf("sec-ch-ua-bitness") !== R.hi.bitness) ||
        (hf("sec-ch-ua-model") != null && hf("sec-ch-ua-model") !== (R.hi.model || "")) ||
        (hf("sec-ch-ua-platform-version") != null && hf("sec-ch-ua-platform-version") !== (R.hi.platformVersion || "")) ||
        (hf("sec-ch-ua-wow64") != null && (hf("sec-ch-ua-wow64") === "?1") !== !!R.hi.wow64) ||
        (hf("sec-ch-ua-form-factors") != null && R.hi.formFactors && forms(hf("sec-ch-ua-form-factors")) !== forms(R.hi.formFactors.join(",")));
      if (bad) out.push("tp_ch");
    }
    return out;
  }
  // The round trip from here to this site's edge: the quickest of a few requests to Cloudflare's trace on the open
  // connection, from the moment it was sent to the first byte back
  async function latency() {
    const t = [];
    // every run asks for URLs of its own: Resource Timing keeps the entries of the run before too, and with the same
    // URLs getEntriesByName(u)[0] answered with the first run's timing for ever after — a second run of the whole test
    // repeated the old round trip (1ms-shell #113). The stamp makes this run's entry the only one for its URL
    const run = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    for (let i = 0; i < 5; i++) {
      const u = new URL("/cdn-cgi/trace?rtt=" + i + "&n=" + run, location.href).href;
      if (!(await getT(u).then(() => true, () => false))) continue;
      const e = performance.getEntriesByName(u).pop();
      if (e && e.responseStart > e.requestStart && e.requestStart > 0) t.push(e.responseStart - e.requestStart);
    }
    R.rttB = t.length >= 3 ? Math.min(...t) : null;
    // the timer's step: a browser that coarsens it (resistFingerprinting: tens of milliseconds) can't time a round trip
    let step = Infinity, last = performance.now();
    for (let i = 0, n = 0; i < 2e6 && n < 5; i++) { const x = performance.now(); if (x !== last) { step = Math.min(step, x - last); last = x; n++; } }
    R.coarse = step >= 10;
  }

  function judge(final) {
    const c = (R.srv && R.srv.cf) || {};
    const res = checks({
      tz: R.tz, rfp: rfp(), tzOff: R.tzOff == null ? null : offTxt(R.tzOff), tzAlt: R.tzAlt == null ? null : offTxt(R.tzAlt), ipTzOff: c.timezone ? offTxt(tzOffset(c.timezone)) : null, ipTz: c.timezone || null, ipcc: c.country,
      langs: R.langs, dnsCC: R.dnsCC, dns2CC: R.dns2CC, dnsRot: R.dnsRot, exits: allExits(), rtc: R.rtc, ip: R.srv && R.srv.ip, asn: c.asn, org: orgName(c.asOrganization, c.asn),
      uaOS: R.dev && R.dev.os, real: !!R.dev, hintOS: R.hi && R.hi.platform, gpuOS: gpuOS(R.gpuRaw), rand: R.rand, noise: R.noise, webdriver: R.webdriver, agent: ACT.state, auto: R.auto,
      rttB: R.latDone ? R.rttB : null, coarse: R.latDone ? !!R.coarse : false, rttCf: c.clientTcpRtt || null, sys: final || R.voices ? sysOf() : undefined, tamper: R.dev && R.srv ? tampered() : null, fpb: fpbTraces(),
      conn: R.probe === undefined ? undefined : R.probe && (R.probe.tcp || R.probe.http2) ? { os: R.probe.tcp && R.probe.tcp.os, pseudo: R.probe.http2 && R.probe.http2.pseudo, engine: R.engine, mtu: R.probe.tcp && R.probe.tcp.mtu } : null,
      brName: R.br && R.br.name,
    });
    if (res.dc === null && R.srv && !c.asn) res.dc = ["info", "c_na", {}];
    const tr = R.tr || {};
    Object.assign(res, protocols({ http: R.http && R.h3done ? [c.httpProtocol, ...R.http].filter(Boolean) : null, rtc: R.rtc, br: R.br,
      sni: tr.sni, kex: tr.kex, warp: tr.warp, gateway: tr.gateway, ios: +((/^(iOS|iPadOS) (d+)/.exec((R.dev && R.dev.os) || "") || [])[2]) || 0 }));
    // at the end, a protocol nothing could be read for (no trace: blocked, or not behind Cloudflare) says so
    if (final) for (const id of [...CHECKS, ...PROTO]) if (!res[id]) res[id] = ["info", "c_na", {}];
    R.ck = res;
    paintChecks(res, c.country, final);
  }

  /* ---------- sharing: 1ms.dog's share dialog (/assets/share/), with a link and a card drawn here ---------- */
  // Neither carries the address or the fingerprint (the very thing that would let anyone follow the sharer); the city
  // and the network only when the sharer ticks the dialog's box. Addresses in the checks are cut to their network.
  const maskIp = ip => ip.includes(":") ? ip.split(":").slice(0, 2).join(":") + ":…" : ip.split(".").slice(0, 2).join(".") + ".•.•";
  function sharedPortrait(show) {
    const P = portrait();
    delete P.x; delete P.fp; delete P.hw;
    if (P.mc) P.mc = "•";
    if (!show) { P.city = null; P.org = null; }
    delete P.asn;
    P.l = LANG; P.t = Date.now();
    const su = R.uniq && R.uniq.total >= MIN_TOTAL ? R.uniq : null;
    if (su) P.u = { m: su.total, k: su.n.fpid || 1, top: rarest(su.n) };
    P.ck = Object.fromEntries(Object.entries(R.ck || {}).filter(([, v]) => v).map(([id, [lv, key, vars]]) =>
      [id, [lv, key, Object.fromEntries(Object.entries(vars).map(([k, x]) => [k, k === "ip" ? maskIp(String(x)) : k === "org" && !show ? t("masked") : k === "za" && !show ? null : x]))]]));
    return P;
  }

  // The card's middle: the paragraph as the page shows it (masked blanks stay masked), then the count with every
  // check. Laid out once to measure the height and once to paint, in the page's theme colors.
  function cardBody(c, kit, paint) {
    const { W, P, F, v } = kit, show = kit.show, FG = v("fg"), MUT = v("muted"), INK = v("ink"), LINE = v("line");
    const LV = { ok: v("t1"), warn: v("t3"), bad: v("t5"), info: MUT };
    // the paragraph as segments: [text, answer?]
    const lines = $$("#story p").map(p => [...p.childNodes].map(n => {
      if (n.nodeType === 3) return [n.textContent, false];
      const k = n.dataset && n.dataset.b;
      return [(k === "city" || k === "isp") && !show ? t("masked") : n.textContent, k !== "age"];
    }));
    const res = R.ck || {}, n = CHECKS.filter(id => counted(id) && res[id] && (res[id][0] === "bad" || res[id][0] === "warn")).length;
    const gr = grade(res, CHECKS.filter(id => res[id] && counted(id))), GC = /^A|^B/.test(gr.grade) ? LV.ok : gr.grade === "C" ? LV.warn : LV.bad;
    c.textBaseline = "alphabetic"; c.textAlign = "left";
    // first, large: the count, the verdict and the grade (a link preview shrinks the whole card into 1200×630)
    let y = kit.top + 116;
    c.font = `800 132px ${F}`; c.fillStyle = n ? (CHECKS.some(id => res[id] && res[id][0] === "bad") ? LV.bad : LV.warn) : LV.ok;
    if (paint) c.fillText(String(n), P, y);
    const nw = c.measureText(String(n)).width, gt = t("grade_v", { g: gr.grade });
    c.font = `800 46px ${F}`; const gw = c.measureText(gt).width + 52;
    if (paint) {
      c.fillStyle = GC; c.beginPath(); c.roundRect ? c.roundRect(W - P - gw, y - 96, gw, 76, 38) : c.rect(W - P - gw, y - 96, gw, 76); c.fill();
      c.fillStyle = "#fff"; c.textAlign = "center"; c.fillText(gt, W - P - gw / 2, y - 41); c.textAlign = "left";
    }
    // the verdict between the two, as large as the room allows
    const head = n ? tn("v_found", n, { n }) : t("v_clean"), room = W - 2 * P - nw - 30 - gw - 24;
    let hs = 52; c.font = `800 ${hs}px ${F}`;
    while (hs > 30 && c.measureText(head).width > room) { hs -= 2; c.font = `800 ${hs}px ${F}`; }
    c.fillStyle = FG; if (paint) c.fillText(head, P + nw + 30, y - 40);
    y += 44;
    if (paint) { c.fillStyle = LINE; c.fillRect(P, y, W - 2 * P, 2); }
    y += 24;
    c.font = `700 34px ${F}`; c.fillStyle = FG; if (paint) c.fillText(t("card_me"), P, y + 34); y += 44;
    const ul = uniqLine();
    if (ul) { c.font = `600 28px ${F}`; c.fillStyle = INK; if (paint) c.fillText(ul, P, y + 30); y += 42; }
    if ((R.labels || []).length) {
      // (on as many lines as it takes, broken between labels: six in French or Russian run past the card's width even at 20px)
      const [pre, post = ""] = t("card_tags", { list: "\0" }).split("\0"), out = [];
      c.font = `600 28px ${F}`; c.fillStyle = FG;
      let cur = pre;
      R.labels.forEach((k, i) => {
        const it = t(k), more = (i ? " · " : "") + it;
        if (i && c.measureText(cur + more + " ·").width > W - 2 * P) { out.push(cur + " ·"); cur = it; } else cur += more;
      });
      out.push(cur + post);
      for (const l of out) { if (paint) c.fillText(kit.clip(c, l, W - 2 * P), P, y + 30); y += 40; }
      y += 2;
    }
    // wrapped word by word (character by character for CJK)
    const size = 28, lh = 48;
    for (const segs of lines) {
      let x = P; y += lh;
      for (const [text, ans] of segs) {
        c.font = `${ans ? 700 : 400} ${size}px ${F}`;
        for (const tok of text.match(/[　-鿿가-힯＀-￯]|[^\s　-鿿가-힯＀-￯]+\s*|\s+/g) || []) {
          const w = c.measureText(tok).width;
          if (x + w > W - P && x > P) { x = P; y += lh; if (/^\s+$/.test(tok)) continue; }
          if (paint) {
            if (ans) { c.globalAlpha = .3; c.fillStyle = INK; c.fillRect(x, y + 6, w, 10); c.globalAlpha = 1; }
            c.fillStyle = ans ? FG : MUT; c.fillText(tok, x, y);
          }
          x += w;
        }
      }
      y += 10;
    }
    y += 40;
    const colW = (W - 2 * P) / 2;
    if (paint) CHECKS.forEach((id, i) => {
      const r = res[id], cx = P + (i % 2) * colW, cy = y + 52 * Math.floor(i / 2) + 30;
      c.fillStyle = r ? LV[r[0]] : LV.info; c.beginPath(); c.arc(cx + 9, cy - 9, 9, 0, Math.PI * 2); c.fill();
      c.font = `500 25px ${F}`; c.fillStyle = FG; c.fillText(t("c_" + id), cx + 30, cy);
    });
    return y + 52 * Math.ceil(CHECKS.length / 2);
  }

  $("#share").onclick = async () => {
    const { share } = await import("/assets/share/share.js?v=10");
    const link = show => location.origin + linkPath(LANG, encode(sharedPortrait(show)));
    share({
      lang: LANG, name: t("app_name"), file: "who-1ms-dog", show: ["city", "isp"], never: ["ip"], ts: Date.now(),
      link, home: location.origin + (D.paths[LANG] || "/"), text: () => t("card_me"),
      height: (c, kit) => cardBody(c, kit, false) + 30 + 70,
      draw: (c, kit) => { cardBody(c, kit, true); },
      foot: () => [t("card_cta")],
    }).open();
  };

  // Someone else's portrait: from /r/<code> (or an older #p=<code> link), drawn from the link with nothing sniffed;
  // the sniffers card and the run controls step aside.
  function showShared(code) {
    shownShared = true;
    const P = decode(code);
    if (!P) return false;
    P.langs = P.langs || []; P.jobs = P.jobs || []; P.x = {};
    document.documentElement.classList.add("shared");
    $("#mine").hidden = false; $("#share").hidden = true; $("#rerun").hidden = true; $("#copyTxt").hidden = true; $("#dlJson").hidden = true; $("#printPg").hidden = true;
    // (testing oneself from a friend's portrait brings it along, for the comparison after the run)
    const mine = () => { location.href = (D.paths[LANG] || "/") + "?vs=" + encodeURIComponent(code); };
    $("#mine").onclick = mine;
    $("#progTxt").textContent = " "; $("#todo").hidden = true;
    paint(P, true);
    // (the city again in the page's language, once its names are in: the same width or close, the blank keeps its place)
    if (P.city) citiesP.then(() => { if (cityName(P.city) !== P.city) paint(P, true); });
    for (const id of CHECKS) if (!(P.ck || {})[id]) { CK[id].hidden = true; const sg = $(`#segs [data-c="${id}"]`); if (sg) sg.hidden = true; }
    paintChecks(P.ck || {}, P.cc, true);
    readings(P, P.ck || {});
    import("/assets/share/share.js?v=10").then(({ received }) => received({ lang: LANG, ts: P.t || undefined, at: $(".hero"), test: mine })).catch(() => {});
    return true;
  }
  const sharedCode = (parsePath(location.pathname) || {}).code || (/^#p=/.test(location.hash) ? location.hash.slice(3) : null);

  /* ---------- a run ---------- */
  async function run() {
    const g = ++gen;
    R = { t0: performance.now() }; done = new Set(); unsup = new Set(); introReady = false; ppQueued = false; PARTIAL = false;
    syncReportEntries(); syncCheckReports();
    // A topic page runs what its own check and rows need (src/pages.mjs "needs") beside the local readings every check
    // rests on; the main page runs every sniffer
    const NEED = D.focus ? new Set(D.focus.needs || []) : null, on = k => !NEED || NEED.has(k);
    if (!NEED) setTimeout(() => { if (g === gen && !R.end) stuck(); }, STUCK_MS);
    for (const r of Object.values(PR)) { r.classList.add("wait"); r.classList.remove("na"); r.querySelector(".pa").textContent = "…"; delete r.dataset.why;
      const n = r.querySelector(".pnote"); if (n) { n.textContent = ""; n.classList.remove("lie"); } }
    for (const r of Object.values(FR)) { r.classList.remove("na"); r.querySelector("b").textContent = "…"; }
    if ($("#focusV")) { $("#focusV").className = "focus-v"; $("#focusV b").innerHTML = '<i class="skl"></i>'; $("#focusV .st").textContent = ""; }
    // the paragraph shows at once, its blanks as placeholders that fill in place
    $("#story").classList.add("wait"); $("#storySk").hidden = false;
    for (const b of Object.values(BL)) { b.classList.add("wait"); b.innerHTML = BL0[b.dataset.b]; delete b.dataset.why; b.removeAttribute("tabindex"); }
    for (const r of Object.values(CK)) clearRow(r);
    $("#todo").hidden = false; $("#todoL").innerHTML = TODO_SK;
    $("#vHead").textContent = t("checking"); $("#vHead").className = "v-h";
    $("#mNum").textContent = "–"; $("#mNum").className = "m-num"; $$("#segs i").forEach(i => { i.className = ""; });
    $("#fpId").innerHTML = '<i class="skl"></i>'; $("#fpArt").innerHTML = ""; $("#fpNote").textContent = t("id_note"); $("#vText").innerHTML = "&nbsp;";
    $("#rerun").disabled = true; $("#share").disabled = true; $("#copyTxt").disabled = true; $("#dlJson").disabled = true; $("#printPg").disabled = true; progress();
    $("#stabD").hidden = true; adProfile();

    // (a paragraph is never held taller than its words: the height it had while its blanks waited is a line or so more
    // than the filled text, and kept it read as blank space under every paragraph — see docs/design.md, 2026-11-13)
    if (on("referrer")) referrer();
    locale(); prefs(); engine();
    const glInfo = on("gpu") ? gpu() : null;
    if (on("gpu") && on("vm")) virt();
    if (on("fonts")) fonts();
    const intro = keys => { if (!NEED && g === gen) paintIntro(portrait(), keys); };
    intro(["lang", "tz", "clock"]);
    const rtc = on("webrtc") ? webrtc().then(() => g === gen && judge(false)) : null;
    const h3 = on("http3") ? http3().then(() => { R.h3done = true; }) : null;
    // the page's own request, and the probes that ask other sites who you are
    const srv = on("server") ? server() : Promise.resolve();
    const probes = [on("stack") && guard("stack", stack), on("exits") && guard(EXITS.map(([id]) => id), exits),
      on("dns") && guard("dns", () => dnsResolver().catch(e => { R.dnsCC = null; throw e; }))].filter(Boolean);
    // the round trip, measured once the connection is open
    const lat = on("rtt") ? srv.then(latency).then(() => { R.latDone = true; }) : null;
    // Embedded, a run with no answer from this site's server, or none from any other site (an ad blocker drops the
    // probes all together, at once), has nothing to report: say so as soon as that's clear, not when the slowest
    // sniffer gives up
    if (EMBED) {
      srv.then(() => { if (g === gen && !R.srv.ip) fail(); });
      Promise.all(probes).then(() => { if (g === gen && !R.dnsCC && !(R.stack || []).length && !Object.values(R.ex || {}).some(Boolean)) fail(); });
    }
    const S = [["kbd", "kbd", keyboard], ["voices", "voices", voices], ["battery", "battery", battery], ["media", "media", media], ["audiohw", "audiohw", audioHw],
      ["bio", "bio", biometric], ["bt", "bt", bluetooth], ["devs", "devs", devices], ["storage", "storage", storage], ["adblock", "adblock", adblock], ["ext", "ext", extensions],
      ["prints", ["canvas", "audio", "fontfp", "rand", "fpid"], () => prints(glInfo)], ["trace", ["kex", "warp"], trace],
      ["webgpu", "webgpu", webgpu], ["tor", "tor", torCheck], ["psb", "psb", sandbox], ["wba", "wba", () => srv.then(webBotAuth)], ["hz", "hz", refresh], ["screens", "screens", screens], ["codecs", "codecs", codecs], ["drm", "drm", drm], ["perms", "perms", perms],
      ["traces", "traces", traces], ["exif", "exif", exif], ["xsite", "xsite", xsite], ["lies", "lies", lies], ["icu", "icu", icu], ["scrollbar", "scrollbar", scrollbar], ["extwar", "extwar", extFiles],
      ["cssv", "cssv", cssLevel], ["smooth", "smooth", smoothing], ["geoloc", "geoloc", geoloc], ["sensors", "sensors", sensors], ["etag", "etag", etagId], ["trackers", "trackers", trackers],
      ["domrect", "domrect", domRect], ["svgrect", "svgrect", svgRect], ["textm", "textm", textMetrics], ["glimg", "glimg", glImage], ["gpulim", "gpulim", gpuLimits],
      ["rtccodecs", "rtccodecs", rtcCodecs], ["recmime", "recmime", recMime], ["keys", "keys", engineKeys], ["timer", "timer", timerRes], ["callstack", "callstack", stackDepth], ["probe", ["tcpfp", "ja4", "h2fp"], probe], ["apis", "apis", apis], ["engver", "engver", engineVer], ["wasm", "wasm", wasmFeatures], ["mathfp", "mathfp", mathPrint], ["emoji", "emoji", emoji], ["hwdec", "hwdec", hwdec], ["heap", "heap", heap], ["sysui", "sysui", sysui], ["worker", "worker", workerNav], ["ai", "ai", builtinAI], ["xr", "xr", xr], ["gamepad", "gamepad", gamepad], ["ch", "ch", chHints], ["agent", "agent", async () => actPaint()]];
    const hw = guard(["os", "browser", "arch", "screen", "cpu", "mem", "touch", "conn"], hardware);
    const tasks = new Map(S.filter(([k]) => on(k) && !(EMBED && (k === "traces" || k === "etag")))
      .map(([k, ids, f]) => [k, guard(ids, f)]));
    // City waits for localized city names; nationality also needs system languages and the device OS.
    // Reuse each measurement promise: progressive rendering must never launch a second measurement.
    const introCity = !NEED ? srv.then(() => intro(["city"])) : null;
    const introNat = !NEED ? Promise.all([srv, hw, tasks.get("kbd"), tasks.get("voices")])
      .then(() => intro(["nat"])) : null;
    // The rest of the paragraph may start filling once the first one is in: its nationality rests on the system
    // languages, and a partial pass before them would be a guess that changes under the reader
    if (introNat) introNat.finally(() => { if (g === gen) { introReady = true; schedulePortrait(); } });
    await Promise.all([srv, hw, ...tasks.values(), ...probes, introCity, introNat]);
    if (g !== gen) return;
    // (once the drawings and the lie check are in)
    if (on("prints") && on("lies")) shield();
    // (after every reading is in: it compares them)
    if (on("adsp")) adsp();
    // The graphics card's note follows the lie check: when browser APIs were found rewritten, the card's name is only
    // what the browser chose to say, and the line says so instead of passing it off as the machine's own card
    if (typeof R.gpuRaw === "string" && !R.gpuStandIn) {
      if (R.lies && (R.lies.list.length || R.lies.frame.length)) note("gpu", t("gpu_note_lie"), t("gpu_note_lie_short"), true);
      else note("gpu", t("gpu_note"), t("gpu_note_short"));
    }
    if (on("stack")) v6mac();
    if (on("fonts") && on("gpu")) await hwid();
    // (once the system, the GPU and the battery are in)
    if (on("model")) await guard("model", deviceModel);
    judge(false);
    if (!NEED) { paint(portrait(), false); readings(portrait(), R.ck); }
    await rtc; await h3; await lat;
    if (g !== gen) return;
    // anything a sniffer couldn't reach (on a topic page, only its own: the rest wasn't asked)
    for (const id of Object.keys(PR)) if (!done.has(id) && (!NEED || FR[id])) na(id);
    judge(true);
    // a topic page ends at its verdict: no portrait, no comparison with the last visit, nothing counted
    if (NEED) { focusFix(); R.end = true; $("#rerun").disabled = false; return; }
    readings(portrait(), R.ck);
    paintTarget(); osTips(); todo(); focusFix();
    R.end = true;
    syncReportEntries(); syncCheckReports();
    adProfile();
    if (!EMBED) { compare(); history(); seen(); versus(); }
    $("#rerun").disabled = false; $("#share").disabled = false; $("#copyTxt").disabled = false; $("#dlJson").disabled = false; $("#printPg").disabled = false;
    if (EMBED && !failed) post(embedResult());
  }

  // The result for the report page: the headline and checks as the page shows them, the link a share would give
  // (without city and network, the share box's default), and facts for its cross-tool rules. Addresses in the
  // findings are cut to their network, as in a shared link.
  function embedResult() {
    const c = (R.srv && R.srv.cf) || {}, ck = R.ck || {}, P = sharedPortrait(false), lv = id => ck[id] && ck[id][0];
    const found = COUNTED.filter(id => ck[id] && (ck[id][0] === "bad" || ck[id][0] === "warn")).length, gr = grade(ck, COUNTED.filter(id => ck[id]));
    const RANK = { bad: 0, warn: 1, ok: 2 };
    const findings = [...CHECKS, ...PROTO].filter(id => P.ck[id] && P.ck[id][0] in RANK).sort((a, b) => RANK[P.ck[a][0]] - RANK[P.ck[b][0]]).slice(0, 4)
      .map(id => ({ level: P.ck[id][0], text: t("c_" + id) + " · " + ckText(id, P.ck[id], c.country) }));
    const stats = [{ label: t("h_checks"), value: found + " / " + CHECKS.length }];
    if (c.country) stats.push({ label: t("s_geo"), value: country(c.country) });
    if (R.dnsCC) stats.push({ label: t("s_dns"), value: country(R.dnsCC) });
    const facts = { problems: found };
    if (c.country) facts.ipCountry = c.country;
    if (ck.tz) facts.tzMismatch = lv("tz") === "bad";                    // another country's zone; one of the same country is only a warning
    if (ck.lang && lv("lang") !== "info") facts.langMismatch = lv("lang") !== "ok";
    if (ck.webrtc) facts.webrtcLeak = lv("webrtc") === "bad";
    if (R.dnsCC) facts.dnsCountry = R.dnsCC;
    if (ck.dc && lv("dc") !== "info") facts.dc = lv("dc") !== "ok";
    // the line, as the probe saw this connection's SYN (1ms-shell docs/checkup.md): left out when not read
    const syn = R.probe && R.probe.tcp;
    if (syn && syn.mss) { const tu = tunnelOf(syn.mss, String(R.probe.ip || "").includes(":")); if (tu !== null) facts.tunnel = tu; facts.mss = syn.mss; }
    if (syn && syn.ttl) facts.ttl = syn.ttl;
    if (ck.fp) facts.fpSame = ck.fp[1] === "c_fp_same";
    if (ck.rtt && lv("rtt") !== "info") facts.rttGap = lv("rtt") !== "ok";
    if (ck.syslang && lv("syslang") !== "info") facts.sysLangMismatch = lv("syslang") !== "ok";
    if (ck.tamper && lv("tamper") !== "info") facts.tampered = lv("tamper") === "bad";
    // HTTP/3 true once seen, false when UDP gets out nowhere, left out when there's no telling
    if (ck.h3 && (lv("h3") === "ok" || lv("h3") === "warn")) facts.h3 = lv("h3") === "ok";
    if (ck.ech) facts.ech = lv("ech") === "ok";
    if (ck.pq) facts.pq = lv("pq") === "ok";
    if (ck.warp) facts.warp = ck.warp[1] === "c_warp_on";
    return { type: "result", lang: LANG, path: linkPath(LANG, encode(P)), grade: gr.grade, score: gr.score, headline: $("#vHead").textContent, stats, findings, facts };
  }
  // the report page sizes the frame to the content
  if (EMBED && window.ResizeObserver) {
    let h = 0;
    new ResizeObserver(() => { const n = Math.ceil($(".app").getBoundingClientRect().height); if (n !== h) post({ type: "size", height: h = n }); }).observe($(".app"));
  }

  $("#rerun").onclick = run;
  const shared = !EMBED && sharedCode && showShared(sharedCode);
  // (the stats page is everyone's numbers: no check of its own)
  if (!shared && !(D.focus && D.focus.stats)) run();
})();

#!/usr/bin/env node
// Builds the static site in public/ from src/:
//   index.html, <lang>/index.html              the page per language
//   <lang>/<page>/index.html                   the topic pages (src/pages.mjs) per language
//   assets/app.<hash>.js, assets/app.<hash>.css the page's code and styles, shared by every language
//   assets/l.<lang>.<hash>.js                    the strings the browser code needs, per language
//   sitemap.xml, robots.txt, llms.txt, _headers  SEO and security headers (CSP)
// The Worker (src/worker.js) is deployed from source by wrangler; it isn't built here.
// Usage: node scripts/build.mjs          write the files
//        node scripts/build.mjs --check  exit 1 if anything in public/ is out of date (CI)
import { mkdir, readFile, readdir, writeFile, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { critical } from "./critical.mjs";
import { fileURLToPath } from "node:url";
import { build as bundle, transform } from "esbuild";
import { GROUPS, COLUMNS, SNIFFERS, BLANKS, CHECKS, PROTO, TODO_SK } from "../src/sniffers.mjs";
import { BLANK_W } from "../src/blank-widths.mjs";
import { IN_APPS } from "../src/infer.mjs";
import { PAGES, TEXT } from "../src/pages.mjs";

const SITE = (process.env.SITE_URL || "https://who.1ms.dog").replace(/\/+$/, "");
const pub = new URL("../public/", import.meta.url), src = new URL("../src/", import.meta.url);
// language, URL folder, og:locale; the first is the root
export const LANGS = [["en", "", "en_US"], ["zh-CN", "zh-cn", "zh_CN"], ["zh-TW", "zh-tw", "zh_TW"], ["ja", "ja", "ja_JP"], ["ko", "ko", "ko_KR"],
  ["es", "es", "es_ES"], ["fr", "fr", "fr_FR"], ["de", "de", "de_DE"], ["pt", "pt", "pt_BR"], ["ru", "ru", "ru_RU"]];

// Runs before first paint: apply the saved theme. On the English root, send visitors to their language's page
// (a saved choice first, then the browser languages); crawlers and English readers stay, and so does an embedded
// page, which the report page opens in the language it wants (a redirect would also lose its referrer).
// (also: an app's own browser, named on the root so the line about it shows from the first paint)
const IA = JSON.stringify(IN_APPS.map(([n, re]) => [n, re.source]));
const PREPAINT = `(function(){var d=document.documentElement,th=null,s=null;try{th=localStorage.getItem("who:theme");s=localStorage.getItem("who:lang");if(localStorage.getItem("who:optout")==="1")d.setAttribute("data-nouniq","");if(localStorage.getItem("who:last"))d.setAttribute("data-back","")}catch(e){}var sh=location.pathname.indexOf("/r/")>=0||/^#p=/.test(location.hash);if(sh)d.setAttribute("data-back","");if(sh||navigator.globalPrivacyControl||navigator.webdriver)d.setAttribute("data-nouniq","");if(th==="light"||th==="dark")d.setAttribute("data-theme",th);var u=navigator.userAgent,A=${IA};for(var j=0;j<A.length;j++)if(new RegExp(A[j][1]).test(u)){d.setAttribute("data-inapp",A[j][0]);break}if(!d.hasAttribute("data-inapp")&&/; wv\\)/.test(u))d.setAttribute("data-inapp","wv");if(!d.hasAttribute("data-root")||/[?&]embed=/.test(location.search))return;var P=JSON.parse(d.getAttribute("data-paths")||"{}"),l=null;try{var q=new URLSearchParams(location.search).get("lang");if(P[q])l=q}catch(e){}if(!l&&P[s])l=s;for(var ls=navigator.languages||[navigator.language||"en"],i=0;!l&&!s&&i<ls.length;i++){var x=String(ls[i]).toLowerCase(),b=x.split("-")[0];l=b==="zh"?(/tw|hk|mo|hant/.test(x)?"zh-TW":"zh-CN"):P[b]?b:null}if(l&&l!=="en")location.replace(P[l]+location.search+location.hash)})();`;

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const hash = s => createHash("sha256").update(s).digest("hex").slice(0, 10);
const sha = s => createHash("sha256").update(s).digest("base64");

async function loadI18n() {
  const out = {};
  for (const f of (await readdir(new URL("i18n/", src))).filter(f => f.endsWith(".mjs")))
    out[f.slice(0, -4)] = (await import(new URL("i18n/" + f, src).href + "?" + Date.now())).default;
  return out;
}

// Strings only the build uses (the page already shows them); everything else goes to the browser (the check names
// too: the share card draws them)
// the main page's question about what is stored (the counting note links to it)
const STORE_DOC = 5;
const BUILD_ONLY = new Set(["name", "seo_title", "seo_desc", "seo_kw", "og_sub", "h1", "docs", "lang_label", "faq_h", "story", "ia_txt", "ia_wv", "ia_wx"]);

// the icon after a link to another 1ms.dog tool, the site's own (never an arrow)
export const EXT = '<svg class="ext" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 2.5h4.5V7M13.5 2.5 7.5 8.5M12 10v3.5H2.5V4H6"/></svg>';

// the checks another 1ms.dog tool looks into deeper; the page links there when the host announces that tool
export const GO = { dns: "dns", split: "egress", webrtc: "egress", dc: "ipqs" };

// the paragraph: one line per theme (where from, device, network, habits), a placeholder for every blank, each once
export function storyHtml(s, lang) {
  const used = [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]);
  const want = Object.keys(BLANKS);
  const odd = [...used.filter(k => !want.includes(k)), ...want.filter(k => !used.includes(k))];
  if (odd.length || new Set(used).size !== used.length) throw new Error(`i18n/${lang}.mjs story: blanks ${odd.join(", ") || "repeated"}`);
  // each blank waits as filler about as long as its answer (CJK: one character per em; others: "xxxx " per 2.6 em, as the blank's bold font draws it),
  // transparent on a skeleton background, so it wraps like the words that will replace it
  const cjk = /^(zh|ja|ko)/.test(lang), w = BLANK_W[lang] || {};
  // (as long as measured: while the paragraph kept a height of its own, a fifth longer was free — the paragraph had
  // room to spare, and a longer answer could not push the page down. With the paragraph never held taller than its
  // words (2026-11-13), a fifth longer is a line of the paragraph's height given back at every fill, so the filler
  // aims at the answer's own width and leaves the paragraph its own height from the first paint)
  const filler = b => { const n = Math.round((w && w[b]) || 7);
    return cjk ? "口".repeat(n) : "xxxx ".repeat(Math.max(1, Math.round(n / 2.6))).trim(); };
  const line = l => l.split(/(\{\w+\})/).map(p => /^\{\w+\}$/.test(p) ? `<span class="bl wait" data-b="${p.slice(1, -1)}"><i class="skt">${filler(p.slice(1, -1))}</i></span>` : esc(p)).join("");
  return s.split("\n").map(l => `<p>${line(l)}</p>`).join("");
}

export async function build({ check = false } = {}) {
  const I = await loadI18n(), en = I.en;
  const langs = LANGS.filter(([l]) => I[l]);
  // (a plural form beside key_other only where the language needs it: 1ms-shell docs/translation.md §2)
  for (const [l] of langs) for (const k of Object.keys(en)) if (!(/_(zero|one|two|few|many)$/.test(k) && k.replace(/_(zero|one|two|few|many)$/, "_other") in en) && !(k in I[l])) throw new Error(`i18n/${l}.mjs is missing "${k}"`);
  const tpl = await readFile(new URL("page.html", src), "utf8");

  const root = fileURLToPath(new URL("..", import.meta.url));
  const js = (await bundle({ entryPoints: [fileURLToPath(new URL("app.js", src))], bundle: true, minify: true, format: "iife",
    // (old in-app browsers, Chrome 70 and Safari 13 era, can't parse ?? or ?.: one unparsable token and the page reads nothing)
    target: ["es2019", "chrome70", "safari13", "firefox68", "edge79"],
    // 1ms.dog's share dialog stays out: it is copied verbatim to public/assets/share/ and loaded when someone shares
    legalComments: "none", write: false, absWorkingDir: root, external: ["/assets/share/*"] })).outputFiles[0].text;
  const cssFull = (await Promise.all(["fonts.css", "base.css", "style.css"].map(f => readFile(new URL(f, src), "utf8")))).join("\n");
  const css = (await transform(cssFull, { loader: "css", minify: true, legalComments: "none" })).code;
  const jsName = `app.${hash(js)}.js`, cssName = `app.${hash(css)}.css`;
  const files = { ["assets/" + jsName]: js, ["assets/" + cssName]: css };

  // a page's URL path: the language folder, then the topic page's folder ("" for the main page)
  const path = (slug, page = "") => "/" + (slug ? slug + "/" : "") + (page ? page + "/" : "");
  const pageList = ["", ...Object.keys(PAGES)];
  for (const page of Object.keys(PAGES)) for (const [l] of langs) for (const k of ["seo_title", "seo_desc", "seo_kw", "h1", "og_sub", "intro", "focus_h", "docs"])
    if (!TEXT[page][l] || !(k in TEXT[page][l])) throw new Error(`src/pages.mjs: ${page} ${l} has no "${k}"`);
  for (const [lang, slug, locale] of langs) {
    const base = I[lang];
    const strings = Object.fromEntries(Object.keys(en).filter(k => !BUILD_ONLY.has(k)).map(k => [k, base[k]]));
    const sjs = `window.L1MS=${JSON.stringify(strings).replace(/</g, "\\u003c")};\n`;
    const sName = `l.${lang.toLowerCase()}.${hash(sjs)}.js`;
    files["assets/" + sName] = sjs;
    // The help's questions and answers: one file per language, fetched when help is first opened. They used to be in
    // every page's HTML, the same four to eight questions in 18 folders, about a tenth of each page
    const pageDocs = Object.fromEntries(Object.keys(TEXT).map(p => [p, TEXT[p][lang].docs]));
    const hjs = `export default ${JSON.stringify({ "": base.docs, ...pageDocs }).replace(/</g, "\\u003c")};\n`;
    const hName = `h.${lang.toLowerCase()}.${hash(hjs)}.js`;
    files["assets/" + hName] = hjs;

    for (const page of pageList) {
      // a topic page has its own title, description, H1, body text and questions; everything else is the main page's
      const d = page ? { ...base, ...TEXT[page][lang] } : base;
      const T = k => { if (!(k in d)) throw new Error(`i18n/${lang}.mjs has no "${k}"`); return d[k]; };
      const url = SITE + path(slug, page), docs = T("docs"), og = `${SITE}/og/${page ? page + "-" : ""}${lang.toLowerCase()}.png`;
      const alts = langs.map(([l, sl]) => `<link rel="alternate" hreflang="${l}" href="${SITE + path(sl, page)}">`).join("\n") + `\n<link rel="alternate" hreflang="x-default" href="${SITE + path("", page)}">`;
      const graph = [
        { "@type": "WebApplication", name: (page ? T("h1") : T("app_name")) + " · 1ms.dog", url, applicationCategory: "UtilitiesApplication", operatingSystem: "Any",
          browserRequirements: "Requires JavaScript", description: T("seo_desc"), inLanguage: lang, isAccessibleForFree: true,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
        // (the questions and answers are the page's own; a topic page repeats the same set on every folder, so only
        // the main language page carries them as structured data: the help itself is fetched when it is opened)
        ...(page ? [] : [{ "@type": "FAQPage", mainEntity: docs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a.replace(/\n+/g, " ") } })) }]),
      ];
      const head = [
        `<title>${esc(T("seo_title"))}</title>`,
        `<meta name="description" content="${esc(T("seo_desc"))}">`,
        `<meta name="keywords" content="${esc(T("seo_kw"))}">`,
        ...(lang === "zh-CN" ? [`<meta http-equiv="Cache-Control" content="no-transform">`, `<meta http-equiv="Cache-Control" content="no-siteapp">`, `<meta name="applicable-device" content="pc,mobile">`] : []),
        `<meta name="robots" content="index, follow, max-image-preview:large">`,
        `<meta name="application-name" content="${esc(T("app_name"))}">`,
        `<meta name="theme-color" content="#f6f6f7" media="(prefers-color-scheme: light)">`,
        `<meta name="theme-color" content="#1c1c1c" media="(prefers-color-scheme: dark)">`,
        // the faces the first screen draws with, fetched before the stylesheet asks for them: with font-display:
        // optional a font that is late is never swapped in, and a font that arrives in time is used from the start —
        // either way the text does not reflow when it lands
        ...["geist-latin", ...(lang === "ru" ? ["geist-cyrillic"] : []), "geist-mono-latin"].map(f => `<link rel="preload" href="/assets/fonts/${f}.woff2" as="font" type="font/woff2" crossorigin>`),
        `<link rel="canonical" href="${url}">`, alts,
        `<link rel="icon" href="/favicon.ico" sizes="any">`, `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">`, `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`,
        `<meta property="og:type" content="website">`, `<meta property="og:site_name" content="1ms.dog">`,
        `<meta property="og:title" content="${esc(T("seo_title"))}">`, `<meta property="og:description" content="${esc(T("og_sub"))}">`, `<meta property="og:url" content="${url}">`,
        `<meta property="og:locale" content="${locale}">`, `<meta property="og:image" content="${og}">`,
        `<meta property="og:image:width" content="1200">`, `<meta property="og:image:height" content="630">`,
        `<meta name="twitter:card" content="summary_large_image">`, `<meta name="twitter:image" content="${og}">`,
        `<meta name="twitter:title" content="${esc(T("seo_title"))}">`, `<meta name="twitter:description" content="${esc(T("og_sub"))}">`,
        `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c")}</script>`,
      ].join("\n");

      // the checks and every sniffer have their rows from the start; readings fill them in place
      // (the connection's protocols follow under their own heading, in the same rows)
      // 「反馈」 is on every row that has a verdict, so it is drawn as an icon at the row's right end rather than as the
      // same words eighteen times (the owner, 2026-11-13). 怎么改 and the check's own test stay words, in a strip under
      // the name, because they say something: the strip keeps no height on a row that has neither
      // (the flag is the shell's own, every 1ms.dog page's 「报告问题」: src/fragments.js FLAG in the shell repo — a
      // visitor has already seen this mark mean "report", and a speech bubble of our own would be a second one)
      const ICON = {
        rp: `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 14.5V2.5M3.5 3h8.5l-1.8 3 1.8 3H3.5"/></svg>`,
      };
      const ckRows = (id, list) => `<ul class="ck" id="${id}">` + list.map(c => `<li class="ckr" data-c="${c}"><i class="st"></i><span class="ck-l">${esc(T("c_" + c))}</span><span class="ck-v"><i class="skl"></i></span>` +
        `<span class="ck-btns"><button class="ck-rp" type="button" hidden aria-label="${esc(T("rp_btn"))}" title="${esc(T("rp_btn"))}">${ICON.rp}</button></span>` +
        `<span class="ck-acts"><button class="ck-fix" type="button" aria-expanded="false" hidden>${esc(T("fix"))}</button>` +
        (GO[c] ? `<a class="ck-go" target="_blank" rel="noopener" hidden>${esc(T("go_" + GO[c]))}${EXT}</a>` : "") +
        `</span>` +
        `<ul class="ck-tip" hidden>${T("tip_" + c).split("\n").map(l => `<li>${esc(l)}</li>`).join("")}</ul></li>`).join("") + "</ul>";
      const checks = ckRows("checks", CHECKS) + `<div class="proto" id="protoBox"><div class="sec-h"><span>${esc(T("h_proto"))}</span></div>${ckRows("proto", PROTO)}</div>`;
      const G = Object.fromEntries(GROUPS);
      const group = g => `<div class="pg" data-g="${g}"><h3>${esc(T("g_" + g))}<span class="pg-n">${G[g].length}</span>` +
        (g === "exit" ? `<a class="pg-a" id="egLink" target="_blank" rel="noopener" hidden>${esc(T("ex_more"))}${EXT}</a>` : "") + "</h3>" +
        G[g].map(s => `<div class="pr wait" data-s="${s.id}"${s.s ? " data-sens" : ""}${s.note ? " data-note" : ""}><span class="pn">${esc(T("s_" + s.id))}</span><span class="pa">…</span><code class="pm">${esc(s.m)}</code>` +
          (s.note ? `<span class="pnote"></span>` : "") + `</div>`).join("") + "</div>";
      const groups = COLUMNS.map(col => `<div class="pcol">${col.map(group).join("")}</div>`).join("");
      // A topic page opens with its own H1, body text and the one result it is about; the portrait follows under
      // its own heading. The main page has no focus panel.
      const P = PAGES[page];
      const focus = !page ? "" : P.stats ? `<section class="cp" id="crowd" data-page="${page}">
      <div class="cp-head card"><div class="cp-t"><h1>${esc(T("h1"))}</h1><p>${esc(T("intro"))}</p><a class="btn primary cp-try" href="${path(slug)}">${esc(T("cr_try"))}</a></div>
        <div class="cp-n"><span class="cp-i"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 7.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM1 14c.4-2.6 2.2-4 4.5-4s4.1 1.4 4.5 4M11 7.5a2 2 0 1 0 0-4M12 10c1.6.3 2.7 1.6 3 4"/></svg></span><b id="crN"><i class="skl"></i></b><span>${esc(T("cr_n_l"))}</span></div></div>
      <ul class="cp-facts" id="crFacts">${'<li class="card"><i class="skl"></i></li>'.repeat(5)}</ul>
      <div class="cp-grid">
        <div class="card cp-bars"><h2><span class="cp-i"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.8l6.5 11.4H1.5zM8 6v3.4M8 11.3v.2"/></svg></span>${esc(T("cr_bars_h"))}</h2><ul id="crBars"></ul></div>
        <div class="card cp-top"><h2><span class="cp-i"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5l6.5 3.5L8 8.5 1.5 5zM1.5 8L8 11.5 14.5 8M1.5 11L8 14.5 14.5 11"/></svg></span>${esc(T("cr_top_h"))}</h2><div id="crTop"></div></div>
      </div>
      <div class="cp-foot"><p class="cp-note"><span class="cp-i"><svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5 7V5a3 3 0 0 1 6 0v2"/></svg></span>${esc(T("cr_note"))}</p></div>
    </section>` : `<section class="focus card" id="focus" data-page="${page}">
      <div class="focus-t"><h1>${esc(T("h1"))}</h1><p>${esc(T("intro"))}</p></div>
      <div class="focus-r"><h2>${esc(T("focus_h"))}</h2>
        <p class="focus-v" id="focusV"><i class="st"></i><b><i class="skl"></i></b></p>
        ${P.check ? `<div class="focus-fix" id="focusFix" hidden><p>${esc(T("fix"))}</p><ul></ul></div>` : ""}
        <ul class="focus-rows">${P.rows.map(id => `<li data-f="${id}"><span>${esc(T("s_" + id))}</span><b>…</b></li>`).join("")}</ul>
        ${P.go ? `<a class="focus-go" id="focusGo" target="_blank" rel="noopener" hidden>${esc(T("go_" + P.go))}${EXT}</a>` : ""}
        <a class="btn ink focus-all" href="${path(slug)}">${esc(T("go_all").replace("{n}", SNIFFERS.length))}</a>
      </div>
    </section>`;
      const heroTitle = page ? `<h2 class="h1">${esc(base.h1)}</h2>` : `<h1>${esc(T("h1"))}</h1>`;
      // the other pages of this tool, in this language: the topic pages, and the main page from a topic page
      const topics = pageList.filter(p => p !== page).map(p => `<a href="${path(slug, p)}">${esc(p ? TEXT[p][lang].h1 : base.h1)}</a>`).join("");
      // (the help's own markup is built in the page from the language's help file: nothing of it in the HTML)
      const helpNav = "", helpC = "";
      const langOpts = langs.map(([l]) => `<option value="${l}"${l === lang ? " selected" : ""}>${esc(I[l].name)}</option>`).join("");
      const paths = Object.fromEntries(langs.map(([l, sl]) => [l, path(sl, page)]));
      // base: every language's main page, which other 1ms.dog tools share (links to them use it)
      const data = { lang, paths, base: Object.fromEntries(langs.map(([l, sl]) => [l, path(sl)])), focus: page ? { page, ...P } : null, help: "/assets/" + hName, store: STORE_DOC };

      let html = tpl
        .replace(/(<(\w+)\b[^>]*\sdata-i="(\w+)"[^>]*>)([^<]*)(<\/\2>)/g, (m, open, tag, k, inner, close) => open + esc(T(k)) + close)
        .replace(/\{\{a:(\w+)\}\}/g, (m, k) => esc(T(k)))   // translated attribute values (aria-label)
        .replace("{{lang}}", lang).replace("{{pathsAttr}}", esc(JSON.stringify(paths))).replace("{{rootAttr}}", slug ? "" : " data-root")
        .replace("{{prepaint}}", PREPAINT).replace("{{head}}", head).replace("{{ext}}", EXT).replace("{{js}}", jsName).replace("{{strings}}", sName)
        .split("{{homeHref}}").join(path(slug)).replace("{{statsHref}}", path(slug, "stats")).replace("{{langOpts}}", langOpts).replace("{{focus}}", focus).replace("{{mainAttr}}", page ? ` class="topic${PAGES[page].stats ? " stats" : ""}"` : "").replace("{{heroTitle}}", heroTitle)
        .replace("{{story}}", storyHtml(T("story"), lang)).replace("{{checks}}", checks).replace("{{todoSk}}", TODO_SK).replace("{{iaTxt}}", esc(T("ia_txt")).replace("{app}", '<b class="ia-n"></b>')).replace("{{segs}}", CHECKS.map(c => `<i data-c="${c}"></i>`).join(""))
        .replace("{{eyebrow}}", esc(T("eyebrow").replace("{n}", SNIFFERS.length))).replace("{{groups}}", groups).replace("{{topics}}", topics)
        .replace("{{helpNav}}", helpNav).replace("{{helpC}}", helpC).replace("{{data}}", JSON.stringify(data).replace(/</g, "\\u003c"));
      // The main page sets its first screen's share of the stylesheet inside the page (the top bar and the portrait, up to
      // the labels: scripts/critical.mjs) and links the whole file at its end, where it doesn't hold up the paint and the
      // scripts after it wait for it. A phone far from the edge (most visitors, through a proxy from China) paints a round
      // trip sooner. The topic and stats pages, with another first screen, link the file in the head as before.
      const link = `<link rel="stylesheet" href="/assets/${cssName}">`;
      if (!page) {
        const end = html.indexOf('<div class="lbs"');
        if (end < 0) throw new Error("page.html: the first screen ends at the labels (.lbs), right after .story-w");
        html = html.replace("{{style}}", () => "<style>" + critical(css, html.slice(html.indexOf("<body>"), end), lang) + "</style>").replace("{{styleLate}}", () => link);
      } else html = html.replace("{{style}}", () => link).replace("{{styleLate}}", "");
      if (/\{\{\w+\}\}/.test(html)) throw new Error("unfilled placeholder in " + path(slug, page) + ": " + /\{\{\w+\}\}/.exec(html)[0]);
      files[path(slug, page).slice(1) + "index.html"] = html;
    }
  }

  files["sitemap.xml"] = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
    pageList.flatMap(page => langs.map(([, s]) => `  <url>\n    <loc>${SITE + path(s, page)}</loc>\n` + langs.map(([l, s2]) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE + path(s2, page)}"/>`).join("\n") +
      `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE + path("", page)}"/>\n  </url>`)).join("\n") + "\n</urlset>\n";
  files["robots.txt"] = `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE}/sitemap.xml\n`;
  files["llms.txt"] = `# Who Are You · 1ms.dog

> Free privacy self-check. Shows who websites take you for, as a paragraph with the blanks filled in (likely
> nationality, city, language, time zone, device, browser, screen, graphics card, network, preferences, what your
> fonts say about your work, browser fingerprint), checks those readings against each other the way a site would to
> spot a VPN, proxy or spoofed browser, and lists all ${SNIFFERS.length} sniffers with what each one read: what the server sees
> in the request (address, Cloudflare geolocation, ASN, TLS, headers, clock) and standard browser APIs (languages,
> Intl, keyboard layout, speech voices, client hints, WebGL, screen, battery, media devices, fonts, canvas and audio
> fingerprints, WebRTC), plus the exit each kind of site sees and the DNS resolver. Nothing is stored.

- Page: ${SITE}/ (also ${langs.slice(1).map(([, s]) => "/" + s + "/").join(", ")})
- API (what the server sees, JSON): ${SITE}/api/me
- Browser fingerprint test: ${SITE}/fingerprint/
- DNS leak test: ${SITE}/dns-leak/
- Source code: https://github.com/yt1988/who-are-you
`;
  // The only inline script is the pre-paint snippet, identical on every page: one hash covers the site. Besides its
  // own origin the page asks the exit probes (an IP service in mainland China and one abroad, the Cloudflare trace
  // on chatgpt.com, claude.ai and www.cloudflare.com), Cloudflare Radar's IPv4-only and IPv6-only hosts and ip-api's
  // DNS name server (WebRTC's STUN requests aren't governed by CSP). Camera, microphone and speakers stay allowed by Permissions-Policy:
  // forbidding them would hide the devices from the media sniffer, which never asks for access.
  // Geolocation is this page's own (the precise location row, asked for behind its button only).
  const csp = ["default-src 'self'", `script-src 'self' 'sha256-${sha(PREPAINT)}'`, "style-src 'self' 'unsafe-inline'", "font-src 'self'", "img-src 'self' data:",
    "connect-src 'self' https://myip.ipip.net https://api.ip.sb https://chatgpt.com https://claude.ai https://www.cloudflare.com https://ipv4-check-perf.radar.cloudflare.com https://ipv6-check-perf.radar.cloudflare.com https://*.edns.ip-api.com https://pagead2.googlesyndication.com https://www.google.com https://probe.1ms.dog https://www.google-analytics.com https://securepubads.g.doubleclick.net https://connect.facebook.net https://bat.bing.com https://analytics.tiktok.com https://hm.baidu.com https://static.hotjar.com chrome-extension:", "manifest-src 'self'", "worker-src 'self' blob:", "object-src 'none'", "base-uri 'none'", "form-action 'none'", "frame-ancestors 'none'"].join("; ");
  // Every page names its stylesheet and scripts by content hash, and a deploy deletes the hashes of the build before it.
  // So a cached page must not outlive the assets it names: the HTML revalidates on every request (an ETag answer is
  // 304, a few hundred bytes), where the platform's own HTML policy let a stale page sit for ten minutes and ask for a
  // file that no longer exists — the asset-404s behind 1ms.dog#112. The hashed files under /assets keep their year.
  files["_headers"] = `# Generated by scripts/build.mjs
/*
  Cache-Control: no-cache
  Content-Security-Policy: ${csp}
  Referrer-Policy: strict-origin-when-cross-origin
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Cross-Origin-Opener-Policy: same-origin
  Permissions-Policy: geolocation=(self), payment=(), usb=(), interest-cohort=()
  Accept-CH: Sec-CH-UA-Full-Version-List, Sec-CH-UA-Arch, Sec-CH-UA-Bitness, Sec-CH-UA-Model, Sec-CH-UA-Platform-Version, Sec-CH-UA-WoW64, Sec-CH-UA-Form-Factors
/assets/*
  Cache-Control: public, max-age=604800
/assets/app.*
  ! Cache-Control
  Cache-Control: public, max-age=31536000, immutable
/assets/l.*
  ! Cache-Control
  Cache-Control: public, max-age=31536000, immutable
/assets/h.*
  ! Cache-Control
  Cache-Control: public, max-age=31536000, immutable
/assets/fonts/*
  ! Cache-Control
  Cache-Control: public, max-age=31536000, immutable
/assets/share/*
  ! Cache-Control
  Cache-Control: public, max-age=0, must-revalidate
/flags/*
  Cache-Control: public, max-age=2592000
/og/*
  Cache-Control: public, max-age=604800
/llms.txt
  Access-Control-Allow-Origin: *
  Content-Type: text/plain; charset=utf-8
`;

  // generated files that are no longer produced (old hashes) are stale too
  const gen = async () => (await readdir(new URL("assets/", pub))).filter(f => /^(app|l|h)\..+\.(js|css)$/.test(f)).map(f => "assets/" + f);
  const stale = [];
  for (const [f, body] of Object.entries(files)) {
    let cur = null; try { cur = await readFile(new URL(f, pub), "utf8"); } catch (e) {}
    if (cur !== body) stale.push(f);
  }
  const orphans = (await gen()).filter(f => !(f in files));
  if (check) return [...stale, ...orphans];
  for (const f of stale) { await mkdir(new URL(".", new URL(f, pub)), { recursive: true }); await writeFile(new URL(f, pub), files[f]); }
  for (const f of orphans) await rm(new URL(f, pub));
  return [...stale, ...orphans];
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const check = process.argv.includes("--check");
  const changed = await build({ check });
  if (check && changed.length) { console.error("public/ is out of date: " + changed.join(", ") + "\nRun npm run build and commit public/."); process.exit(1); }
  console.log(check ? "public/ is up to date" : changed.length ? "wrote " + changed.join(", ") : "nothing to do");
}

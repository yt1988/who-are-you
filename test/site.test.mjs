// The built pages keep the 1ms.dog tool contract (1ms-shell docs/tool-contract.md), render every row up front, and
// every string the page uses exists in every language.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { LANGS, storyHtml } from "../scripts/build.mjs";
import { SNIFFERS, BLANKS, CHECKS, PROTO } from "../src/sniffers.mjs";

const read = f => readFile(new URL("../" + f, import.meta.url), "utf8");
const page = slug => read(`public/${slug ? slug + "/" : ""}index.html`);
const all = (s, re) => [...s.matchAll(re)].map(m => m[1]);

test("every language page keeps the shell contract", async () => {
  for (const [lang, slug] of LANGS) {
    const h = await page(slug);
    assert.match(h, new RegExp(`<html lang="${lang}"`), lang);
    assert.match(h, /<head>\r?\n<meta charset="utf-8">\r?\n<script>/, lang + ": charset first, then the pre-paint script");
    assert.match(h, /id="helpBtn"[^>]*aria-haspopup="dialog"/, lang + ": help button");
    assert.match(h, /<div class="scrim" id="help" hidden>/, lang + ": help dialog hidden by default");
    assert.match(h, /class="logo-light" src="\/assets\/logo-light.svg" width="90" height="36"/);
    assert.ok(!/\{\{\w+\}\}/.test(h), lang + ": unfilled placeholder");
    // (134 sniffers and 15 checks, every row in the HTML from the start, in the longest language)
    // (the whole page, the first screen's styles set inside it included; those have their own cap: the theme's tokens
    // in both schemes are 3 KB of it, the faces for the first screen's characters 1 KB)
    // (120,000 since 2026-11-09: the Client Hints and automation rows plus two more topic pages; gzip is still around
    // 22 KB, well inside the contract's 300 KB. The help itself no longer sits in the HTML: it ships in h.<lang>.js,
    // fetched when help is opened, which is what let the French FAQ be written out in full again)
    assert.ok(h.length < 100000, lang + ": page is " + h.length + " characters");
    const st = (h.match(/<style>([\s\S]*?)<\/style>/) || [])[1];
    // 13,000 since 2026-11-12: the shared base.css now carries the site's type and radius tokens (docs/design.md §2, §3),
    // about 0.7 KB of them in the first screen, where they have to be to keep it from moving
    assert.ok(st && st.length < 13000, lang + ": the first screen's styles are " + (st || "").length + " characters");
    assert.ok(!/--css:/.test(st), lang + ": the sign that the whole stylesheet has come stays in the file");
    assert.match(h, /<link rel="stylesheet" href="\/assets\/app\.\w+\.css">\s*<script type="application\/json" id="data">/, lang + ": the whole stylesheet linked at the end, before the scripts");
    assert.equal((h.match(/<script>/g) || []).length, 1, lang + ": the only inline script is the pre-paint one");
  }
});

test("every sniffer, blank and check has its place before any reading", async () => {
  for (const [lang, slug] of LANGS) {
    const h = await page(slug);
    assert.equal((h.match(/<div class="pr wait" data-s="/g) || []).length, SNIFFERS.length, lang);
    assert.equal((h.match(/<span class="bl wait" data-b="/g) || []).length, Object.keys(BLANKS).length, lang);
    assert.equal((h.match(/<li class="ckr" data-c="/g) || []).length, CHECKS.length + PROTO.length, lang);   // the checks, then the protocols
    // the rows that keep a small line under their value (the IP's place, the graphics card, the monitor count), in the
    // HTML from the start so nothing moves
    assert.equal((h.match(/<span class="pnote"><\/span>/g) || []).length, 3, lang + ": the note lines");
  }
  assert.equal(new Set(SNIFFERS.map(s => s.id)).size, SNIFFERS.length, "sniffer ids are unique");
  for (const ids of Object.values(BLANKS)) for (const id of ids) assert.ok(SNIFFERS.some(s => s.id === id), "blank source " + id);
  assert.throws(() => storyHtml("{nat} {nat}", "x"));
});

test("every key the page uses exists in every language, with the same placeholders", async () => {
  const [app, page] = await Promise.all(["src/app.js", "src/page.html"].map(read));
  const en = (await import("../src/i18n/en.mjs")).default;
  const keys = new Set([
    ...all(app, /\bt\("(\w+)"/g).filter(k => !k.endsWith("_")),
    ...all(app, /\bna\("\w+", "(\w+)"\)/g),
    ...all(page, /data-i="(\w+)"/g), ...all(page, /\{\{a:(\w+)\}\}/g),
    ...SNIFFERS.map(s => "s_" + s.id), ...CHECKS.map(c => "c_" + c),
    ...["net", "hdr", "loc", "dev", "brw", "fp"].map(g => "g_" + g),
    ...["pc", "mac", "phone", "tablet"].map(k => "dv_" + k),
    ...["dev", "design", "office"].map(k => "jb_" + k),
    ...["system", "light", "dark"].map(x => "th_" + x),
    // what the checks return
    ...all(await read("src/infer.mjs"), /"(c_\w+)"/g),
    "c_na",
  ]);
  assert.ok(keys.size > 120, "found " + keys.size + " keys");
  const vars = s => (s.match(/\{\w+\}/g) || []).sort().filter((x, i, a) => a.indexOf(x) === i).join();
  for (const [lang] of LANGS) {
    const d = (await import(`../src/i18n/${lang}.mjs`)).default;
    const missing = [...keys].filter(k => !(k in d));
    assert.deepEqual(missing, [], `${lang} lacks ${missing.join(", ")}`);
    // (a plural form beside key_other, as key_one, key_few, key_many, only where the language needs it:
    // 1ms-shell docs/translation.md §2)
    const FORM = /_(zero|one|two|few|many)$/, form = k => FORM.test(k) && k.replace(FORM, "_other") in en, other = k => k.replace(FORM, "_other");
    for (const k of Object.keys(en)) assert.ok(form(k) || k in d, `${lang}: ${k}`);
    for (const k of Object.keys(d)) if (form(k)) assert.ok(other(k) in d, `${lang}: ${k} without its _other`);
    for (const k of Object.keys(en)) if (typeof en[k] === "string" && k in d) assert.equal(vars(d[k]), vars(en[k]), `${lang}: ${k} placeholders`);
    for (const k of Object.keys(d)) if (form(k) && typeof d[k] === "string") assert.equal(vars(d[k]), vars(en[other(k)]), `${lang}: ${k} placeholders`);
    assert.equal(d.docs.length, en.docs.length, lang + ": help entries");
    assert.ok(d.seo_desc.includes(String(SNIFFERS.length)), lang + ": the description counts " + SNIFFERS.length + " sniffers");
  }
});

test("no English fallback in the page script or the build", async () => {
  const [app, build] = await Promise.all(["src/app.js", "scripts/build.mjs"].map(read));
  for (const [name, s] of [["src/app.js", app], ["scripts/build.mjs", build]]) {
    assert.ok(!/\|\|\s*\w+(\.name)?\.en\b|\?\?\s*en\[/.test(s), name + " falls back to English");
  }
});

test("every topic page is its own page in every language", async () => {
  const { PAGES, TEXT } = await import("../src/pages.mjs");
  const sitemap = await read("public/sitemap.xml");
  for (const page of Object.keys(PAGES)) for (const [lang, slug] of LANGS) {
    const p = (slug ? slug + "/" : "") + page + "/", h = await read(`public/${p}index.html`), main = await page0(slug);
    const where = `${lang} ${page}`;
    assert.equal((h.match(/<h1[\s>]/g) || []).length, 1, where + ": one h1");
    assert.ok(h.includes(`<h1>${TEXT[page][lang].h1}</h1>`), where + ": its own h1");
    assert.match(h, new RegExp(`<link rel="canonical" href="https://who.1ms.dog/${p}">`), where + ": canonical to itself");
    assert.equal((h.match(/<link rel="alternate" hreflang=/g) || []).length, LANGS.length + 1, where + ": hreflang to every language and x-default");
    assert.notEqual(h.match(/<title>[^<]*/)[0], main.match(/<title>[^<]*/)[0], where + ": its own title");
    assert.ok(h.includes(`<meta name="description" content="${TEXT[page][lang].seo_desc}">`), where + ": its own description");
    assert.match(h, new RegExp(`og:image" content="https://who.1ms.dog/og/${page}-${lang.toLowerCase()}\\.png\\?v=${SNIFFERS.length}"`), where + ": its own preview");
    assert.equal((h.match(/<li data-f="/g) || []).length, PAGES[page].rows.length, where + ": focus rows");
    assert.ok(sitemap.includes(`<loc>https://who.1ms.dog/${p}</loc>`), where + ": in the sitemap");
  }
});
const page0 = slug => read(`public/${slug ? slug + "/" : ""}index.html`);

// a key written twice in a language file silently keeps the last one (two features reusing a name, say)
test("no language file defines a key twice", async () => {
  for (const [lang] of LANGS) {
    const s = await read(`src/i18n/${lang}.mjs`), seen = new Map();
    let depth = 0, q = null;
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (q) { if (c === "\\") i++; else if (c === q) q = null; continue; }
      if (c === '"' || c === "'" || c === "`") { q = c; continue; }
      if (c === "{" || c === "[" || c === "(") depth++;
      else if (c === "}" || c === "]" || c === ")") depth--;
      else if (depth === 1 && /[A-Za-z_]/.test(c) && /[\s{,]/.test(s[i - 1])) {
        const m = /^([A-Za-z_]\w*)\s*:/.exec(s.slice(i, i + 80));
        if (m) { assert.ok(!seen.has(m[1]), `${lang}: "${m[1]}" twice`); seen.set(m[1], 1); i += m[1].length - 1; }
      }
    }
  }
});

// Old browsers: the page's script must parse where the reported visits were (Chrome 57, Safari 11), and use no runtime
// API that is newer than that without the compat shim filling it in (2026-11-15, issue #124: white pages on Chrome 57-79).
test("the script parses on the browsers an in-app browser still runs", async () => {
  const build = await read("scripts/build.mjs");
  assert.match(build, /target: \["es2017", "chrome57", "safari11"\]/, "the build's floor is Chrome 57 / Safari 11");
  const name = (await read("public/index.html")).match(/\/assets\/(app\.[0-9a-f]+\.js)/)[1];
  const js = await read("public/assets/" + name);
  // (the syntax esbuild lowers at that target never survives; these two it can only lower if they are there at all)
  assert.ok(!/\bcatch\s*\{/.test(js), "optional catch binding (Chrome 66) is lowered");
  assert.ok(!/\?\.\w/.test(js), "optional chaining (Chrome 80) is lowered");
  // (runtime APIs: the compat shim fills in the ones the page needs, so the page must not call a newer one bare)
  for (const api of [".flatMap(", ".replaceAll(", "Object.hasOwn(", "structuredClone("]) assert.ok(!js.includes(api), `${api} is not in the page script`);
  // (PluginArray is an array-like, not iterable, on Firefox and Safari: spreading it throws and takes the run with it)
  assert.ok(!/\[\.\.\.navigator\.plugins\]/.test(js), "navigator.plugins is not spread");
  assert.match((await read("src/compat.mjs")), /Object\.fromEntries/, "the shims are in the bundle");
  // (a dynamic import() can't survive that target either: esbuild turns it into a require() no browser has, which took
  // the share dialog and help down with no error anyone saw. Modules are reached through a module script instead, and
  // the questions ship as a classic script — 2026-11-15)
  assert.ok(!/\bimport\s*\(/.test(js), "the built page script has no import()");
  assert.ok(!/Dynamic require/.test(js), "the bundle carries no require() shim");
  const assets = await readdir(new URL("../public/assets/", import.meta.url));
  const boot = assets.find(f => /^share-boot\.[0-9a-f]+\.js$/.test(f));
  assert.ok(boot, "the share dialog's module boot is built");
  assert.match(js, new RegExp("/assets/" + boot.replace(/\./g, "\\.")), "the page script names the boot");
  // (the stylesheet's address rides along, so the page can warm it before the first opening)
  assert.match(await read("public/assets/" + boot), /^import\*as m from"\/assets\/share\/share\.js\?v=(\d+)";window\.__1msShare=m;window\.__1msShareCss="\/assets\/share\/share\.css\?v=\1";\n$/, "the boot imports the dialog, its stylesheet's address and leaves it on the page");
  const help = assets.find(f => /^h\.en\.[0-9a-f]+\.js$/.test(f));
  assert.match(await read("public/assets/" + help), /^window\.L1MS_HELP=/, "the questions are a classic script");
});

test("a browser too old to parse the page says so instead of showing nothing", async () => {
  const build = await read("scripts/build.mjs");
  assert.match(build, /data-old/, "the pre-paint snippet sets data-old");
  assert.match(build, /__whoAlive/, "the page script marks itself alive");
  const h = await page("");
  assert.match(h, /<p class="oldapp" id="old" hidden><\/p>/, "the notice's place is in the page, hidden");
  const en = (await read("src/i18n/en.mjs")).match(/old_b: "([^"]*)"/);
  assert.ok(en && en[1].length > 20, "old_b says what to do");
  for (const [lang] of LANGS) assert.ok(new RegExp(`old_b: "`).test(await read(`src/i18n/${lang}.mjs`)), lang + ": old_b");
});

// A long string that repeats a whole sentence reads as a stutter and ships to search results with it (audit #136):
// no value in any language says the same sentence twice. Sentences end at 。！？!? or a full stop and a space.
test("no string says the same sentence twice", async () => {
  const cut = v => String(v).split(/[。！？!?]+|\.\s+/).map(x => x.trim()).filter(x => x.length >= 20);
  for (const [lang] of LANGS) {
    const d = (await import(`../src/i18n/${lang}.mjs`)).default;
    for (const [k, v] of Object.entries(d)) {
      if (typeof v !== "string" || v.length < 60) continue;
      const seen = new Set(), twice = cut(v).find(x => seen.has(x) || !seen.add(x));
      assert.equal(twice, undefined, `${lang}: ${k} repeats "${String(twice).slice(0, 40)}"`);
    }
  }
});

// The probe hosts are deployment details; user-facing copy names the sites instead (Tokyo, Shanghai). The absolute
// URLs in it may name this site (and the cross-site frame's second domain) or a third party: anything else is a
// leaked endpoint.
const COPY_HOSTS = new Set(["1ms.dog", "who.1ms.dog", "cross.1ms.one", "github.com", "localhost"]);
test("page copy and the README do not name the probe hosts", async () => {
  const files = ["src/pages.mjs", "src/sniffers.mjs"];
  const root = new URL("../", import.meta.url);
  for (const f of await readdir(root)) if (/^README.*\.md$/.test(f)) files.push(f);
  for (const [lang] of LANGS) files.push(`src/i18n/${lang}.mjs`);
  for (const f of files) {
    const s = await read(f);
    for (const [, host] of s.matchAll(/https?:\/\/([A-Za-z0-9.-]+)/g)) assert.ok(COPY_HOSTS.has(host.toLowerCase()), f + " links to " + host);
  }
});

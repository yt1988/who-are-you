#!/usr/bin/env node
// Renders the link-preview images with resvg (dev dependency), 1200 × 630: public/og/<lang>.png for each language,
// public/og/<page>-<lang>.png for each topic page (src/pages.mjs), and public/og/r<tier>-<lang>.png for shared results (the Worker picks one by how many checks give the sharer away).
// The headline and subtitle come from the page's strings; the rings are the page's fingerprint picture; the colored
// bars are the disguise check. Run when the headline or the look changes, and commit the output. Uses system fonts
// for the text: Windows' names first, then macOS's (PingFang, Hiragino, Apple SD Gothic Neo), then Linux's Noto CJK.
// Usage: node scripts/og.mjs
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { Resvg } from "@resvg/resvg-js";
import { SNIFFERS } from "../src/sniffers.mjs";
import { PAGES, TEXT } from "../src/pages.mjs";

const pub = new URL("../public/", import.meta.url), src = new URL("../src/", import.meta.url);
const render = svg => new Resvg(svg, { fitTo: { mode: "width", value: 1200 }, font: { loadSystemFonts: true, defaultFontFamily: "Arial" } }).render().asPng();
const logo = Buffer.from(await readFile(new URL("assets/logo-dark.svg", pub))).toString("base64");
const FONTS = { "zh-CN": "'Microsoft YaHei', 'PingFang SC', 'Hiragino Sans GB', 'Noto Sans CJK SC'", "zh-TW": "'Microsoft JhengHei', 'PingFang TC', 'Noto Sans CJK TC'",
  ja: "'Yu Gothic UI', 'Hiragino Sans', 'Noto Sans CJK JP'", ko: "'Malgun Gothic', 'Apple SD Gothic Neo', 'Noto Sans CJK KR'" };
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const LIME = "#a3e635", OK = "#3ecf8e", WARN = "#f5c524", BAD = "#f56565";

// the fingerprint rings, as on the page's ID card, from a fixed hash
function rings(cx, cy, scale) {
  const hex = "5e9023a1f00fb94f3c7d1e2a9b8c4d6e5f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c";
  const by = i => parseInt(hex.substr((i * 2) % hex.length, 2), 16);
  const pt = (r, deg) => { const t = (deg - 90) * Math.PI / 180; return (cx + r * Math.cos(t)).toFixed(1) + " " + (cy + r * Math.sin(t)).toFixed(1); };
  let d = "", k = 0;
  for (let i = 0; i < 7; i++) {
    const r = (6 + i * 3.9) * scale, parts = 1 + (by(k++) % 3), turn = 360 / parts;
    for (let p = 0; p < parts; p++) {
      const s = p * turn + (by(k++) / 255) * turn * 0.5, len = turn * (0.45 + (by(k++) / 255) * 0.45);
      d += `M${pt(r, s)}A${r} ${r} 0 ${len > 180 ? 1 : 0} 1 ${pt(r, s + len)}`;
    }
  }
  return `<circle cx="${cx}" cy="${cy}" r="${2.2 * scale}" fill="${LIME}"/><path d="${d}" fill="none" stroke="${LIME}" stroke-width="${1.7 * scale * 0.55}" stroke-linecap="round"/>`;
}

// tier: the result previews of shared links (0 nothing gives the sharer away, 1 a few things, 2 many); none: the page
const TIER_BARS = [[OK, OK, OK, OK, OK, OK, OK, OK, OK], [OK, WARN, OK, OK, WARN, OK, OK, WARN, OK], [OK, BAD, WARN, BAD, WARN, BAD, OK, WARN, BAD]];
function card(lang, d, tier) {
  const ff = `${FONTS[lang] ? FONTS[lang] + ", " : ""}'Segoe UI', 'Helvetica Neue', 'Arial', 'Noto Sans', sans-serif`;
  const title = tier == null ? d.h1 : d["og_r" + tier], sub = tier == null ? d.og_sub : d.card_me, chip = d.eyebrow.replace("{n}", SNIFFERS.length);
  const cjk = /[　-鿿가-힯]/.test(title), max = cjk ? 9 : 18;
  // wrap the headline at a space (or in the middle for CJK) when it is long
  let lines = [title];
  if (title.length > max) {
    const sp = title.lastIndexOf(" ", Math.ceil(title.length / 2) + 4);
    const cut = !cjk && sp > 3 ? sp : Math.ceil(title.length / 2);
    lines = [title.slice(0, cut).trim(), title.slice(cut).trim()];
  }
  const size = lines.some(l => l.length > (cjk ? 10 : 20)) ? 64 : 76;
  const bars = (tier == null ? [OK, WARN, BAD, WARN, BAD, WARN, OK, WARN, OK] : TIER_BARS[tier]).map((c, i) => `<rect x="${80 + i * 58}" y="520" width="50" height="10" rx="5" fill="${c}"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs><radialGradient id="g" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(0 0) scale(900 700)">
    <stop offset="0" stop-color="${LIME}" stop-opacity=".18"/><stop offset="1" stop-color="${LIME}" stop-opacity="0"/></radialGradient></defs>
  <rect width="1200" height="630" fill="#161616"/><rect width="1200" height="630" fill="url(#g)"/>
  <image href="data:image/svg+xml;base64,${logo}" x="80" y="64" width="150" height="60"/>
  <rect x="80" y="170" width="${Math.min(560, 40 + chip.length * (cjk ? 26 : 13.5))}" height="44" rx="22" fill="${LIME}" fill-opacity=".14"/>
  <circle cx="104" cy="192" r="6" fill="${LIME}"/>
  <text x="122" y="200" font-family="${ff}" font-size="22" font-weight="600" fill="${LIME}">${esc(chip)}</text>
  ${lines.map((l, i) => `<text x="80" y="${300 + i * (size + 10)}" font-family="${ff}" font-size="${size}" font-weight="800" fill="#f2f2f2" letter-spacing="-1">${esc(l)}</text>`).join("")}
  <text x="80" y="${300 + (lines.length - 1) * (size + 10) + 70}" font-family="${ff}" font-size="30" fill="#a0a0a0">${esc(sub)}</text>
  ${bars}
  ${rings(975, 330, 6.4)}
</svg>`;
}

const out = new URL("og/", pub);
await mkdir(out, { recursive: true });
for (const f of (await readdir(new URL("i18n/", src))).filter(f => f.endsWith(".mjs"))) {
  const lang = f.slice(0, -4), d = (await import(new URL("i18n/" + f, src).href)).default;
  await writeFile(new URL(lang.toLowerCase() + ".png", out), render(card(lang, d)));
  // the topic pages: their own headline and subtitle
  for (const p of Object.keys(PAGES)) await writeFile(new URL(`${p}-${lang.toLowerCase()}.png`, out), render(card(lang, { ...d, ...TEXT[p][lang] })));
  for (const k of [0, 1, 2]) await writeFile(new URL(`r${k}-${lang.toLowerCase()}.png`, out), render(card(lang, d, k)));
  console.log("og/" + lang.toLowerCase() + ".png");
}

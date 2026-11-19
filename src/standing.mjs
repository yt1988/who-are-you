// The trackability standing: how easily a site can tell this visitor apart, from readings the page already has.
//
// It is deliberately modest. Rarity comes from the whole fingerprint's observed count in this site's anonymous
// tally (never from adding up the entropy of each attribute: correlated readings overstate uniqueness, as Google's
// 2024 study on tens of millions of Chrome browsers showed). Stability comes from this visitor's own last visit,
// kept in this browser. Breadth is how many of the readings the browser actually answered. Leaks is the existing
// grade's inverse. Unknown parts count as the middle value and lower the confidence; the page says so.
//
// Score 0–100, higher = easier to tell apart. The A–F grade stays separate: it judges consistency, not identifiability.

export const WEIGHTS = { rarity: 0.45, stability: 0.30, breadth: 0.15, leaks: 0.10 };
export const MIN_TOTAL = 1000;                 // same floor as the rarity tags (src/traits.mjs)

// How much a fixed check is expected to lower the standing, as a conservative estimate shown as "about −N".
export const EXPECT = { fp: 18, conn: 12, rtt: 8, split: 7, tz: 6, dns: 6, webrtc: 6, dc: 5, lang: 4, syslang: 3, tamper: 6, fpb: 3, bot: 4, via: 2, ua: 2 };
const RANK = { fp: 9, conn: 8, rtt: 7, split: 6, tz: 5, dns: 5, webrtc: 5, dc: 4, lang: 3, syslang: 2, tamper: 6, fpb: 2, bot: 4, via: 1, ua: 1 };

const clamp = n => Math.max(0, Math.min(100, n));
const mid = n => (n == null ? 50 : n);

// 10-point buckets, the coarsest that still separates a common visitor from a rare one
export const BUCKETS = ["0-9", "10-19", "20-29", "30-39", "40-49", "50-59", "60-69", "70-79", "80-89", "90-100"];
export function bucketOf(score) {
  const b = BUCKETS[Math.min(9, Math.max(0, Math.floor(Number(score) / 10)))];
  return b;
}

export function standing({ total, fpid, lastParts, parts, rand, noise, rf, fz, tb, available, rows, gradeScore, checks }) {
  // rarity: the whole fingerprint's share among the checks counted. A prefix seen once is as rare as it gets.
  const canRarity = total != null && total >= MIN_TOTAL && fpid != null && fpid > 0;
  const rarity = canRarity ? Math.round(clamp(100 * (1 - Math.log10(Math.max(fpid, 1)) / Math.log10(total)))) : null;
  // stability: the fingerprint parts this visitor's last visit left, compared with this one
  const keys = parts ? Object.keys(parts) : [];
  const lastKeys = lastParts ? Object.keys(lastParts) : [];
  const common = keys.filter(k => lastKeys.includes(k));
  const same = common.filter(k => lastParts[k] === parts[k]).length;
  const canStability = common.length >= 3;
  let stability = canStability ? Math.round(100 * same / common.length) : null;
  // (a browser that offers no last visit but says its readings are randomized: its own answer)
  if (stability == null) stability = rand ? 15 : noise ? 45 : rf || fz || tb ? 35 : null;
  const breadth = rows ? Math.round(clamp(100 * (available || 0) / rows)) : null;
  const leaks = gradeScore == null ? null : clamp(100 - gradeScore);

  const score = Math.round(WEIGHTS.rarity * mid(rarity) + WEIGHTS.stability * mid(stability) + WEIGHTS.breadth * mid(breadth) + WEIGHTS.leaks * mid(leaks));

  // confidence: the parts that are measurements, not stand-ins
  const known = [rarity, breadth, leaks].filter(x => x != null).length;
  const confidence = canRarity && canStability && breadth != null && leaks != null && available / rows >= 0.8 ? "hi"
    : canRarity && known >= 2 && (canStability || stability != null) ? "mid" : "lo";

  const findings = Object.entries(checks || {})
    .filter(([, v]) => v && (v[0] === "bad" || v[0] === "warn"))
    .map(([id, v]) => [id, v[0]])
    .sort((a, b) => (RANK[b[0]] || 0) - (RANK[a[0]] || 0))
    .slice(0, 3)
    .map(([id, level]) => ({ id, level, expected: Math.max(2, Math.round((EXPECT[id] || 3) * (level === "bad" ? 1 : 0.6))) }));

  return { score, rarity, stability, breadth, leaks, confidence,
    rarityN: { k: fpid, total }, stabilityN: { same, total: common.length }, breadthN: { a: available || 0, b: rows || 0 }, findings };
}

// The bucket's midpoint: a visitor at 92 is compared with the middle of 90-100, not with its floor.
const midOf = b => { const i = BUCKETS.indexOf(b); return i < 0 ? null : i === BUCKETS.length - 1 ? 95 : i * 10 + 4.5; };

// The share of counted visitors above and below this score (higher = easier to identify). Null until there are
// enough counted runs. The bucket holding the score is split by its midpoint, so a top-bucket score is not called
// "better than nobody".
export function shares(hist, score) {
  if (!hist || typeof hist !== "object") return null;
  let all = 0, higher = 0, lower = 0;
  for (const [b, n] of Object.entries(hist)) {
    const c = Number(n), m = midOf(b);
    if (!Number.isFinite(c) || c <= 0 || m == null) continue;
    all += c;
    if (m > score) higher += c; else if (m < score) lower += c;
  }
  return all >= MIN_TOTAL ? { all, higher, lower } : null;
}
export function percentile(hist, score) {
  const s = shares(hist, score);
  return s ? Math.round(100 * s.higher / s.all) : null;
}

// What the page counts to tell how common a visitor is: one value per trait, named by the sniffer row that shows it.
// Coarse values as they are (a system, a browser, a screen); fingerprint hashes cut to their first 8 characters.
// Used by the page (what to send, which rows get a "common / rare / only you" tag) and the Worker (what it accepts).
import { CHECKS, PROTO } from "./sniffers.mjs";

export const TRAITS = ["os", "browser", "screen", "gpu", "langs", "tz", "fontfp", "canvas", "webgl", "audio", "mathfp", "emoji", "hwdec", "fpid",
  // (the coarse readings beside the fingerprints: one value each, counted the same way, so every row with one can say
  // how common it is — the page sends them, the Worker accepts them, src/tally.mjs counts them)
  "arch", "cpu", "mem", "hz", "engine", "engver", "kbd", "locale", "scheme", "a11y", "scrollbar", "touch", "form"];
const HASHED = new Set(["fontfp", "canvas", "webgl", "audio", "mathfp", "fpid"]);
const LEVELS = new Set(["ok", "warn", "bad", "info"]);
const IDS = new Set([...CHECKS, ...PROTO]);
// how long a run took, as a range of seconds; "stuck": a run still going 45 seconds in (counted then, whether it ends or not)
export const DUR = ["0-3", "3-5", "5-10", "10-20", "20-30", "30-60", "60+", "stuck"];
export const STUCK_MS = 45000;
export const durOf = ms => { const s = ms / 1000; return s < 3 ? "0-3" : s < 5 ? "3-5" : s < 10 ? "5-10" : s < 20 ? "10-20" : s < 30 ? "20-30" : s < 60 ? "30-60" : "60+"; };

// a body the Worker takes: { add, t: { trait: value }, ck: { check: level }, dur }, anything else dropped; null if
// unusable. (A stuck run sends its time alone: nothing to add to the traits)
export function cleanSeen(b) {
  if (!b || typeof b !== "object") return null;
  const t = {}, ck = {}, bt = b.t && typeof b.t === "object" ? b.t : {}, dur = DUR.includes(b.dur) ? b.dur : null;
  for (const f of TRAITS) {
    const v = bt[f];
    if (typeof v !== "string" || !v || v.length > 80) continue;
    if (HASHED.has(f) && !/^[0-9a-f]{8}$/.test(v)) continue;
    t[f] = v;
  }
  if (b.ck && typeof b.ck === "object") for (const [id, lv] of Object.entries(b.ck)) if (IDS.has(id) && LEVELS.has(lv)) ck[id] = lv;
  const any = Object.keys(t).length > 0;
  return any || dur ? { add: b.add === true && any, t, ck, ...(dur && { dur }) } : null;
}

// how common a value is among `total` checks: only you, rare (under 2%), or common; null until there are enough checks
export const MIN_TOTAL = 1000;
export function rarity(n, total) {
  if (!total || total < MIN_TOTAL || n == null) return null;
  return n <= 1 ? "uniq" : n / total < 0.02 ? "rare" : "common";
}

// The standing (trackability) score: whole-fingerprint rarity, this visitor's own stability, breadth and leaks.
import { test } from "node:test";
import assert from "node:assert/strict";
import { standing, percentile, bucketOf, BUCKETS, MIN_TOTAL } from "../src/standing.mjs";

const parts = { canvas: "a1", webgl: "b2", audio: "c3", fontfp: "d4", screen: "e5", tz: "f6", langs: "g7" };
const checks = { fp: ["warn", "c_fp_same", {}], conn: ["warn", "c_conn_os", {}], tz: ["bad", "c_tz_off", {}], lang: ["ok", "c_lang_ok", {}] };

test("a rare, stable, readable visitor scores high and is confident", () => {
  const s = standing({ total: 41160, fpid: 2, lastParts: parts, parts, available: 130, rows: 134, gradeScore: 70, checks });
  assert.equal(s.rarity, Math.round(100 * (1 - Math.log10(2) / Math.log10(41160))));
  assert.equal(s.stability, 100);
  assert.equal(s.breadth, 97);
  assert.equal(s.leaks, 30);
  assert.ok(s.score > 80 && s.score <= 100, String(s.score));
  assert.equal(s.confidence, "hi");
  assert.deepEqual(s.findings.map(f => f.id), ["fp", "conn", "tz"]);   // the stable fingerprint ranks first
});

test("a common fingerprint with changed parts scores low", () => {
  const s = standing({ total: 41160, fpid: 41160, lastParts: Object.fromEntries(Object.keys(parts).map(k => [k, "old"])), parts, available: 60, rows: 134, gradeScore: 96, checks: {} });
  assert.equal(s.rarity, 0);
  assert.equal(s.stability, 0);
  assert.equal(s.breadth, 45);
  assert.equal(s.leaks, 4);
  assert.ok(s.score < 20, String(s.score));
  assert.equal(s.confidence, "mid");   // breadth below 80%, but the measured parts are all there
});

test("no last visit: stability is unknown and lowers confidence", () => {
  const s = standing({ total: 41160, fpid: 40, parts, lastParts: null, available: 120, rows: 134, gradeScore: 80, checks: {} });
  assert.equal(s.stability, null);
  assert.equal(s.confidence, "lo");
  assert.ok(s.score > 0 && s.score < 100);
});

test("randomized readings say so when there is no last visit", () => {
  assert.equal(standing({ total: 41160, fpid: 40, parts, lastParts: null, rand: true, available: 120, rows: 134, gradeScore: 80 }).stability, 15);
  assert.equal(standing({ total: 41160, fpid: 40, parts, lastParts: null, noise: true, available: 120, rows: 134, gradeScore: 80 }).stability, 45);
  assert.equal(standing({ total: 41160, fpid: 40, parts, lastParts: null, rf: true, available: 120, rows: 134, gradeScore: 80 }).stability, 35);
});

test("below the corpus floor, rarity is not claimed", () => {
  const s = standing({ total: MIN_TOTAL - 1, fpid: 3, parts, lastParts: parts, available: 130, rows: 134, gradeScore: 70 });
  assert.equal(s.rarity, null);
  assert.equal(s.confidence, "lo");
});

test("findings: only flagged checks, strongest first, three at most", () => {
  const c = { fp: ["warn"], conn: ["bad"], rtt: ["warn"], split: ["warn"], tz: ["warn"], lang: ["ok"] };
  assert.deepEqual(standing({ total: 41160, fpid: 40, parts, lastParts: parts, available: 120, rows: 134, gradeScore: 80, checks: c }).findings.map(f => f.id), ["fp", "conn", "rtt"]);
  const f = standing({ total: 41160, fpid: 40, parts, lastParts: parts, available: 120, rows: 134, gradeScore: 80, checks: { tz: ["warn"] } }).findings[0];
  assert.equal(f.level, "warn");
  assert.ok(f.expected > 0 && f.expected < 18);   // a warning counts as a part of the bad-check estimate
});

test("percentile: the share of counted visitors with a higher (more identifiable) score", () => {
  const hist = { "0-9": 0, "10-19": 0, "20-29": 0, "30-39": 0, "40-49": 0, "50-59": 1000, "60-69": 2000, "70-79": 2000, "80-89": 1000, "90-100": 1000 };
  assert.equal(percentile(hist, 45), 100);         // every counted visitor scores above 45
  assert.equal(percentile(hist, 65), 57);          // 4000 of 7000 score above 65
  assert.equal(percentile({ ...hist }, 5), 100);
  assert.equal(percentile({ "0-9": 999 }, 5), null);   // below the corpus floor
});

test("buckets are ten wide and closed at the top", () => {
  assert.equal(bucketOf(0), "0-9");
  assert.equal(bucketOf(9.9), "0-9");
  assert.equal(bucketOf(10), "10-19");
  assert.equal(bucketOf(89), "80-89");
  assert.equal(bucketOf(100), "90-100");
  assert.equal(BUCKETS.length, 10);
});

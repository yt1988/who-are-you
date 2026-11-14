// The cross-site frame: served on its own host only, framable by this tool alone, and it stores nothing but a
// 30-second cookie. (The page itself is src/frame.mjs; the Worker's imports need Cloudflare's runtime, so the routing
// is checked in its source rather than by calling it.)
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { framePage } from "../src/frame.mjs";

const at = p => framePage(new URL("https://cross.1ms.one" + p));

test("the frame answers at /f and /, and nowhere else", async () => {
  for (const p of ["/", "/f"]) {
    const r = at(p);
    assert.equal(r.status, 200, p);
    assert.match(r.headers.get("content-type"), /text\/html/, p);
    assert.equal(r.headers.get("x-frame-options"), null, p + ": X-Frame-Options would stop the parent framing it");
    assert.match(r.headers.get("content-security-policy"), /frame-ancestors https:\/\/\*\.1ms\.dog https:\/\/1ms\.dog/, p);
    assert.match(r.headers.get("content-security-policy"), /default-src 'none'/, p + ": nothing loads inside it");
    assert.equal(r.headers.get("cache-control"), "no-store", p);
  }
  assert.equal(at("/anything").status, 404);
});

test("the Worker sends that host to the frame, and only that host", async () => {
  const s = await readFile(new URL("../src/worker.js", import.meta.url), "utf8");
  assert.match(s, /if \(url\.hostname === "cross\.1ms\.one"\) return framePage\(url\);/);
  assert.match(s, /import \{ framePage \} from "\.\/frame\.mjs";/);
});

test("the frame writes a 30-second cookie and asks for nothing else", async () => {
  const html = await at("/f").text();
  assert.match(html, /SameSite=None; Secure/);
  assert.match(html, /Partitioned/);
  assert.match(html, /Max-Age=30/);
  assert.match(html, /getItem\("w3p"\)/);                 // the localStorage half
  assert.match(html, /window\.parent\.postMessage/);       // how the answer comes back
  assert.ok(!/fetch\(|XMLHttpRequest|src=|href=/.test(html), "the frame sends nothing anywhere");
});

// What the page script needs that older browsers lack: the in-app browsers of Chrome 57 and Safari 11 vintage that
// visitors still open links in (the build lowers the syntax to that level, scripts/build.mjs; this fills the APIs).
// Imported first by app.js, so it runs before anything else. Anything older than the floor sees the one-line notice
// instead (the pre-paint snippet in scripts/build.mjs), not a page that reads nothing.

// Chrome 71, and the wasm probe takes it as a default argument
if (!window.globalThis) window.globalThis = window;
// Chrome 61: a browser that doesn't know a feature answers "no" instead of throwing inside a sniffer
if (!window.CSS) window.CSS = {};
if (!CSS.supports) CSS.supports = () => false;
// Chrome 73, Safari 12.1
if (!Object.fromEntries) Object.fromEntries = it => { const o = {}; for (const [k, v] of it) o[k] = v; return o; };
// Chrome 103, Safari 16: a fetch that gives up after ms
if (window.AbortSignal && !AbortSignal.timeout && window.AbortController)
  AbortSignal.timeout = ms => { const c = new AbortController(); setTimeout(() => c.abort(), ms); return c.signal; };

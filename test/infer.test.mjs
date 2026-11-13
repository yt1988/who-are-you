// What the readings are taken to mean: system and browser, graphics card, keyboard, network, nationality, checks.
import { test } from "node:test";
import assert from "node:assert/strict";
import { macOf, v6Type, tunnelOf, langCC, nationality, device, browser, gpuName, gpuOS, kbdLayout, isDataCenter, netKind, fontHints, checks, giveaways, protocols, offTxt, splitOf, netOf, sysLangs, grade, physicalScreen, isSoftGpu, vmOf, looksLikeAddress, discreteGpu, isRelayIp, rfpClock, isIntegratedGpu, FEATURES, engineRange, engineOff, platformOff, glVendorOff, idLies, armSay, armGpu } from "../src/infer.mjs";
import { cleanSeen, rarity, durOf } from "../src/traits.mjs";
import { regionName, flagCode } from "../src/regions.mjs";

const WIN = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36";
const MAC_SAFARI = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15";
const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1";
const ANDROID = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36";
const FIREFOX = "Mozilla/5.0 (X11; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0";

test("language tags point at countries only when they can", () => {
  assert.equal(langCC("zh-CN"), "CN");
  assert.equal(langCC("zh-Hant"), "TW");
  assert.equal(langCC("pt-BR"), "BR");
  assert.equal(langCC("ja"), "JP");
  assert.equal(langCC("es"), null);
  assert.equal(langCC("zh-Hans-CN"), "CN");
});

test("nationality: the language first, plain English defers to the time zone", () => {
  assert.deepEqual(nationality({ langs: ["zh-CN"], tz: "Asia/Shanghai", ipcc: "JP" }), { cc: "CN", from: ["langs", "tz"] });
  assert.deepEqual(nationality({ langs: ["en-US"], tz: "Europe/Berlin", ipcc: "US" }), { cc: "DE", from: ["tz"] });
  assert.deepEqual(nationality({ langs: ["ko"], tz: "America/Los_Angeles" }), { cc: "KR", from: ["langs"] });
  assert.deepEqual(nationality({ langs: ["en"], tz: "Etc/UTC", ipcc: "GB" }), { cc: "GB", from: ["geo"] });
  // an American on holiday in Portugal, on an iPad: its time zone followed it, its Region setting didn't
  assert.deepEqual(nationality({ langs: ["en-US"], tz: "Europe/Lisbon", ipcc: "PT", ios: true }), { cc: "US", from: ["langs"] });
  assert.deepEqual(nationality({ langs: ["en-CN"], tz: "Asia/Shanghai", ipcc: "CN", ios: true }), { cc: "CN", from: ["langs", "tz"] });
  // elsewhere en-US alone still says nothing; a language further down the list does
  assert.deepEqual(nationality({ langs: ["en-US"], tz: "Asia/Shanghai", ipcc: "JP" }), { cc: "CN", from: ["tz"] });
  assert.deepEqual(nationality({ langs: ["en-US", "en", "zh-CN"], tz: "Asia/Tokyo", ipcc: "JP" }), { cc: "CN", from: ["langs"] });
  // British spelling is no British passport: en-GB, en-IN and Tamil in India, on India's time zone
  const IN = ["en-GB", "en-IN", "en-US", "en", "ta"];
  assert.deepEqual(nationality({ langs: IN, tz: "Asia/Calcutta", ipcc: "IN" }), { cc: "IN", from: ["langs", "tz"] });
  assert.deepEqual(nationality({ langs: ["en-GB"], tz: "Asia/Singapore", ipcc: "SG" }), { cc: "SG", from: ["tz"] });
  assert.deepEqual(nationality({ langs: ["en-GB"], tz: "Europe/London", ipcc: "GB" }), { cc: "GB", from: ["tz"] });
  assert.equal(checks({ langs: IN, ipcc: "IN" }).lang[0], "ok");
  assert.equal(checks({ langs: ["en-GB"], ipcc: "IN" }).lang[0], "info");
  assert.equal(checks({ langs: ["zh-CN"], ipcc: "JP" }).lang[0], "warn");
  // a language spoken in more than one country: Chinese in Singapore and Malaysia, Spanish in Mexico, German in Austria
  assert.equal(checks({ langs: ["zh-CN", "en-US"], ipcc: "SG" }).lang[0], "ok");
  assert.equal(checks({ langs: ["zh-CN"], ipcc: "MY" }).lang[0], "ok");
  assert.equal(checks({ langs: ["es-ES"], ipcc: "MX" }).lang[0], "ok");
  assert.equal(checks({ langs: ["de-DE"], ipcc: "AT" }).lang[0], "ok");
  assert.equal(checks({ langs: ["zh-TW"], ipcc: "SG" }).lang[0], "warn");   // Traditional Chinese points to Taiwan, Hong Kong
  assert.deepEqual(nationality({ langs: ["zh-CN", "en-US"], tz: "Asia/Kuala_Lumpur", ipcc: "SG" }), { cc: "MY", from: ["langs", "tz"] });
  assert.deepEqual(nationality({ langs: ["zh-CN"], tz: "Asia/Tokyo", ipcc: "JP" }), { cc: "CN", from: ["langs"] });
});

test("system and kind of device", () => {
  assert.deepEqual(device(WIN, { platform: "Windows", platformVersion: "19.0.0" }), { os: "Windows", osv: "11", kind: "pc", model: "" });
  assert.deepEqual(device(WIN, { platform: "Windows", platformVersion: "10.0.0" }).osv, "10");
  assert.equal(device(WIN).osv, "10/11");
  assert.deepEqual(device(MAC_SAFARI), { os: "macOS", osv: "10.15", kind: "mac", model: "" });
  assert.equal(device(MAC_SAFARI, { platform: "macOS", platformVersion: "15.1.0" }).osv, "15.1");
  assert.deepEqual(device(IPHONE), { os: "iOS", osv: "18.1", kind: "phone", model: "iPhone" });
  // browsers inside apps
  assert.deepEqual(browser("Mozilla/5.0 (iPad; CPU OS 27_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/24B119 Twitter for iPhone/12.39"), { name: "X", v: "12" });
  assert.equal(browser("Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.50(0x1800323c) NetType/WIFI Language/zh_CN").name, "WeChat");
  assert.equal(browser("Mozilla/5.0 (Linux; Android 14; K) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/126.0 Mobile Safari/537.36 Instagram 340.0.0.22.109 Android", [{ brand: "Android WebView", version: "126" }]).name, "Instagram");
  assert.equal(browser(IPHONE).name, "Safari");
  assert.equal(device(MAC_SAFARI, {}, 5).os, "iPadOS");   // iPads ask for the desktop site
  // HarmonyOS: ArkWeb names it even where the user agent claims Windows or Android
  const HM = "Mozilla/5.0 (Phone; OpenHarmony 5.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 ArkWeb/4.1.6.1 Mobile HuaweiBrowser/5.0.4.300";
  assert.deepEqual(device(HM), { os: "HarmonyOS", osv: "5.0", kind: "phone", model: "" });
  assert.equal(device("Mozilla/5.0 (PC; OpenHarmony 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 ArkWeb/5.1.0.1").kind, "pc");
  assert.equal(device("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 ArkWeb/5.1.0.1 HuaweiBrowser/5.1").os, "HarmonyOS");
  assert.deepEqual(device("Mozilla/5.0 (Linux; Android 12; HarmonyOS; ALN-AL00; HMSCore 6.13.0.302) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 HuaweiBrowser/15.0.4.312 Mobile Safari/537.36"),
    { os: "HarmonyOS", osv: "", kind: "phone", model: "ALN-AL00" });
  assert.equal(device(WIN, { platform: "HarmonyOS", platformVersion: "5.1.0" }).os, "HarmonyOS");
  assert.deepEqual(device(ANDROID, { platform: "Android", platformVersion: "15.0.0", model: "Pixel 8", mobile: true }), { os: "Android", osv: "15", kind: "phone", model: "Pixel 8" });
  assert.equal(device(FIREFOX).os, "Linux");
});

test("browser and version", () => {
  assert.deepEqual(browser(WIN, [{ brand: "Not)A;Brand", version: "8" }, { brand: "Chromium", version: "142" }, { brand: "Google Chrome", version: "142.0.7444.60" }]), { name: "Chrome", v: "142" });
  assert.deepEqual(browser(WIN, [{ brand: "Chromium", version: "142" }, { brand: "Microsoft Edge", version: "142.0.1" }, { brand: "Not_A Brand", version: "99" }]), { name: "Edge", v: "142" });
  assert.deepEqual(browser(MAC_SAFARI), { name: "Safari", v: "18" });
  assert.deepEqual(browser(FIREFOX), { name: "Firefox", v: "144" });
});

test("a HarmonyOS tablet is not an x86 machine (#114)", () => {
  // ArkWeb says Windows in the user agent to get the right pages, and the user agent's compatibility segment
  // ("Windows NT 10.0; Win64; x64") comes back as navigator.platform "Win32" — and sometimes as the hints' architecture.
  // The system alone could be an x86 emulator, so the reading waits for the graphics card: Mali, Maleoon and Adreno are
  // ARM, and anything else leaves the row at 未知 beside what the browser claimed.
  assert.deepEqual(armSay({ arch: "", platform: "Win32", os: "HarmonyOS 7.0", gpu: "Maleoon 920" }), { said: "Win32" });
  assert.deepEqual(armSay({ arch: "x86", platform: "Win32", os: "HarmonyOS 7.0", gpu: null }), { said: "x86" });
  assert.equal(armGpu("Maleoon 920"), true);
  assert.equal(armGpu("ANGLE (Qualcomm, Adreno (TM) 740, OpenGL ES 3.2)"), true);
  assert.equal(armGpu("ANGLE (NVIDIA, NVIDIA GeForce RTX 4060 Direct3D11 vs_5_0 ps_5_0, D3D11)"), false);
  // a Windows machine saying x86 is a Windows machine, and an Android that already says ARM is no contradiction
  assert.equal(armSay({ arch: "x86", platform: "Win32", os: "Windows 11", gpu: "ANGLE (NVIDIA, NVIDIA GeForce RTX 4060 Direct3D11 vs_5_0 ps_5_0, D3D11)" }), null);
  assert.equal(armSay({ arch: "arm", platform: "Linux armv8l", os: "Android 14", gpu: "Adreno (TM) 740" }), null);
  // and the tamper check stays quiet on HarmonyOS: every one of its browsers says Win32
  assert.equal(platformOff("Win32", "HarmonyOS 7.0"), false);
});

test("graphics card names and the system they give away", () => {
  assert.equal(gpuName("ANGLE (NVIDIA, NVIDIA GeForce RTX 4080 SUPER (0x00002702) Direct3D11 vs_5_0 ps_5_0, D3D11)"), "NVIDIA GeForce RTX 4080 SUPER");
  assert.equal(gpuName("ANGLE (Apple, ANGLE Metal Renderer: Apple M2, Unspecified Version)"), "Apple M2");
  assert.equal(gpuName("ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0, D3D11)"), "Intel UHD Graphics 620");
  assert.equal(gpuName("Apple GPU"), "Apple GPU");
  assert.equal(gpuName(""), null);
  assert.equal(gpuOS("ANGLE (NVIDIA, NVIDIA GeForce RTX 4080 (0x00002702) Direct3D11 vs_5_0 ps_5_0, D3D11)"), "Windows");
  assert.equal(gpuOS("Adreno (TM) 740"), "Android");
  assert.equal(gpuOS("Mesa Intel(R) UHD Graphics 620"), null);
});

test("keyboard layouts", () => {
  const m = o => new Map(Object.entries(o));
  assert.equal(kbdLayout(m({ KeyQ: "q", KeyW: "w", KeyY: "y", KeyZ: "z" })), "QWERTY");
  assert.equal(kbdLayout(m({ KeyQ: "a", KeyW: "z", KeyY: "y", KeyZ: "w" })), "AZERTY");
  assert.equal(kbdLayout(m({ KeyQ: "q", KeyW: "w", KeyY: "z", KeyZ: "y" })), "QWERTZ");
  assert.equal(kbdLayout(m({ KeyQ: "й", KeyW: "ц" })), "ЙЦУКЕН");
  assert.equal(kbdLayout(new Map()), null);
});

test("data center networks", () => {
  assert.ok(isDataCenter(16509, "Amazon.com, Inc."));
  assert.ok(isDataCenter(999999, "Some Hosting Ltd"));
  assert.ok(isDataCenter(45102, "Alibaba Cloud (Singapore) Private Limited"));
  assert.ok(!isDataCenter(4134, "Chinanet"));
  assert.ok(!isDataCenter(7922, "Comcast Cable Communications, LLC"));
});

test("giveaways: a clock in one country and a DNS in another stay apart", () => {
  // #102: an English page, the IP in Japan, the clock on Bangkok's time, the DNS in Vietnam
  const x = { tz: "Asia/Bangkok", tzOff: "+07:00", ipTzOff: "+09:00", ipcc: "JP", langs: ["en-US", "en"], dnsCC: "VN", sys: false };
  const ck = checks(x);
  assert.equal(ck.tz[0], "bad");
  // (the resolver alone is only a hint since #108; with the clock already off it is a second place)
  assert.equal(ck.dns[0], "warn");
  const g = giveaways(ck, { tz: x.tz, dns: "VN", langs: x.langs });
  assert.deepEqual(g.away, ["tz", "dns"]);
  assert.deepEqual(g.spots, [["tz", "TH"], ["dns", "VN"]]);
  assert.equal(g.one, null);   // no single country to name for both
  // the resolver alone claims nothing: HU, the clock local, the resolver in DE
  const hu = { tz: "Europe/Budapest", tzOff: "+01:00", ipTzOff: "+01:00", ipcc: "HU", langs: ["hu-HU"], dnsCC: "DE", sys: false };
  assert.deepEqual(giveaways(checks(hu), { tz: hu.tz, dns: "DE", langs: hu.langs }).away, []);
  // they agree: one country for all of them
  assert.equal(giveaways(checks({ ...x, dnsCC: "TH" }), { ...x, dns: "TH" }).one, "TH");
  // a language that doesn't fit the IP, with the clock and the DNS local, is someone living abroad: no giveaway
  const i = { tz: "Asia/Bangkok", tzOff: "+07:00", ipTzOff: "+07:00", ipcc: "TH", langs: ["zh-CN"], dnsCC: "TH", sys: false };
  assert.deepEqual(giveaways(checks(i), i).away, []);
});

test("fonts: only ones the system doesn't bring say something", () => {
  assert.deepEqual(fontHints(["Segoe UI", "Calibri", "Cascadia Code"], "Windows"), []);
  assert.deepEqual(fontHints(["Calibri", "JetBrains Mono"], "macOS"), [["dev", "JetBrains Mono"], ["office", "Calibri"]]);
  assert.deepEqual(fontHints(["Aptos", "Calibri"], "Windows"), [["office", "Aptos"]]);
});

test("disguise checks", () => {
  const base = { tz: "Asia/Shanghai", tzOff: "+08:00", ipTzOff: "+08:00", ipcc: "CN", langs: ["zh-CN"], rtc: ["1.2.3.4"], ip: "1.2.3.4",
    asn: 4134, org: "Chinanet", uaOS: "Windows", real: true, hintOS: "Windows", gpuOS: "Windows", rand: false, webdriver: false,
    dnsCC: "CN", exits: [["ip", "1.2.3.4"], ["ex_cn", "1.2.3.4"]], rttB: 30, rttCf: 25, sys: { cc: ["CN"], from: ["fonts"] }, tamper: [], fpb: [], conn: { os: "windows", pseudo: "m,a,s,p", engine: "V8" } };
  const c = checks(base);
  assert.deepEqual(Object.fromEntries(Object.entries(c).map(([k, v]) => [k, v[0]])),
    { tz: "ok", lang: "ok", dns: "ok", split: "ok", webrtc: "ok", dc: "ok", ua: "ok", fp: "warn", bot: "ok", rtt: "ok", syslang: "ok", tamper: "ok", fpb: "ok", conn: "ok" });
  // through a proxy, Cloudflare only sees the proxy's leg of the round trip
  assert.deepEqual(checks({ ...base, rttB: 190, rttCf: 12 }).rtt, ["bad", "c_rtt_bad", { a: 12, b: 190 }]);
  assert.equal(checks({ ...base, rttB: 80, rttCf: 20 }).rtt[0], "warn");
  assert.equal(checks({ ...base, rttB: 210, rttCf: 180 }).rtt[0], "ok");
  assert.equal(checks({ ...base, rttCf: 0 }).rtt, null);
  // a system with Chinese installed behind a Japanese address; other systems can't tell
  assert.deepEqual(checks({ ...base, ipcc: "JP", sys: { cc: ["CN"], from: ["fonts", "voices"] } }).syslang, ["warn", "c_sys_warn", { cc: "CN", from: "fonts,voices" }]);
  assert.equal(checks({ ...base, sys: false }).syslang[1], "c_sys_na");
  assert.equal(checks({ ...base, sys: { cc: [], from: [] } }).syslang[1], "c_sys_none");
  assert.deepEqual(checks({ ...base, tamper: ["tp_engine", "tp_hdr"] }).tamper, ["bad", "c_tamper_bad", { list: "tp_engine,tp_hdr" }]);
  // a HarmonyOS phone on a Mali or Maleoon GPU is no contradiction
  assert.equal(checks({ ...base, uaOS: "HarmonyOS", hintOS: "HarmonyOS", gpuOS: "Android" }).ua[0], "ok");
  assert.equal(gpuOS("Maleoon 910"), "Android");
  // client hints say "Chrome OS", the user agent's reading says "ChromeOS": the same system
  assert.equal(checks({ ...base, uaOS: "ChromeOS", hintOS: "Chrome OS", gpuOS: null }).ua[0], "ok");
  // Brave: the same drawing twice on one page, noise in what the page reads back
  assert.deepEqual(checks({ ...base, rand: false, noise: true }).fp, ["ok", "c_fp_site", {}]);
  assert.equal(gpuName("Brave"), null);
  // Firefox's resistFingerprinting: Reykjavik's clock and "Mozilla" for the card are stand-ins, not Iceland
  assert.equal(gpuName("Mozilla"), null);
  // iOS: a steady canvas is WebKit's, shared by every iPhone of a model and version; elsewhere it's a warning
  assert.equal(checks({ ...base, uaOS: "iOS", rand: false, noise: false }).fp[1], "c_fp_ios");
  assert.equal(checks({ ...base, uaOS: "Windows", rand: false, noise: false }).fp[0], "warn");
  assert.equal(rfpClock(true, "Atlantic/Reykjavik", "Mozilla"), true);
  assert.equal(rfpClock(true, "Atlantic/Reykjavik", "ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0, D3D11)"), false);
  assert.equal(rfpClock(false, "Atlantic/Reykjavik", null), false);
  const rf = { tz: "Atlantic/Reykjavik", tzOff: "+00:00", ipTzOff: "+01:00", ipcc: "ES", langs: ["en-GB"] };
  assert.equal(checks(rf).tz[0], "bad");
  assert.deepEqual(checks({ ...rf, rfp: true }).tz, ["warn", "c_tz_rfp", { a: "+01:00" }]);
  // iCloud Private Relay: the page's and WebRTC's exits differ, both are relay exits, nothing leaks
  const relay = { ...base, ip: "104.28.10.1", exits: [["ip", "104.28.10.1"]], rtc: ["104.28.77.9"] };
  assert.equal(checks(relay).webrtc[1], "c_rtc_relay");
  assert.equal(checks({ ...relay, rtc: ["104.28.77.9", "114.254.1.2"] }).webrtc[0], "bad");   // a real address beside it still leaks
  assert.equal(checks({ ...relay, asn: 13335 }).dc[1], "c_dc_relay");
  assert.equal(isRelayIp("2a02:26f7:1::1"), true);
  assert.equal(isRelayIp("8.8.8.8"), false);
  // a laptop with two cards: the high-performance WebGL context or WebGPU names the discrete one
  assert.equal(discreteGpu("Intel(R) UHD Graphics 630", "NVIDIA GeForce RTX 4060 Laptop GPU", null), "NVIDIA GeForce RTX 4060 Laptop GPU");
  assert.equal(discreteGpu("Intel(R) Iris(R) Xe Graphics", "Intel(R) Iris(R) Xe Graphics", { vendor: "nvidia", architecture: "ada-lovelace" }), "NVIDIA Ada Lovelace");
  assert.equal(discreteGpu("Intel(R) Iris(R) Xe Graphics", null, { vendor: "intel", architecture: "xe" }), null);
  // AMD's numbered integrated cards and Intel's Arc Graphics are integrated; an RX or an Arc A-series isn't
  assert.equal(discreteGpu("AMD Radeon 610M", "NVIDIA GeForce RTX 4070 Laptop GPU", null), "NVIDIA GeForce RTX 4070 Laptop GPU");
  assert.equal(isIntegratedGpu("Intel(R) Arc(TM) Graphics"), true);
  // an AMD integrated card beside an AMD discrete one: the two adapters answer differently
  assert.equal(discreteGpu("AMD Radeon 610M", null, { vendor: "amd", architecture: "rdna-3" }, { vendor: "amd", architecture: "rdna-2" }), "AMD RDNA 3");
  assert.equal(discreteGpu("AMD Radeon 610M", null, { vendor: "amd", architecture: "rdna-2" }, { vendor: "amd", architecture: "rdna-2" }), null);
  // Firefox's stand-in: a card of the same class
  assert.equal(gpuName("ANGLE (AMD, Radeon R9 200 Series Direct3D11 vs_5_0 ps_5_0), or similar"), gpuName("ANGLE (AMD, Radeon R9 200 Series Direct3D11 vs_5_0 ps_5_0)"));
  assert.ok(!/ANGLE/.test(gpuName("ANGLE (AMD, Radeon R9 200 Series Direct3D11 vs_5_0 ps_5_0), or similar")));
  // an anti-detect browser's traces
  assert.deepEqual(checks({ ...base, fpb: [] }).fpb, ["ok", "c_fpb_ok", {}]);
  assert.equal(checks({ ...base, fpb: ["fb_ver"] }).fpb[0], "warn");
  assert.equal(checks({ ...base, fpb: ["fb_ver", "fb_worker"] }).fpb[0], "bad");
  const all = Object.fromEntries(FEATURES.map(([, k]) => [k, true]));
  assert.deepEqual(engineRange(all), { lo: 136, hi: null, n: 11 });
  assert.equal(engineOff(156, engineRange(all)), false);
  const old = { ...all, try: false, DurationFormat: false, isError: false, Float16Array: false, escape: false };
  assert.deepEqual(engineRange(old), { lo: 122, hi: 127, n: 6 });
  assert.equal(engineOff(156, engineRange(old)), true);    // claims 156, the engine stops at 127
  assert.equal(engineOff(125, engineRange(old)), false);
  assert.equal(engineOff(110, engineRange(all)), true);    // claims 110, the engine has 136's features
  assert.equal(platformOff("Win32", "Windows 11"), false);
  assert.equal(platformOff("MacIntel", "Windows 11"), true);
  assert.equal(platformOff("MacIntel", "iPadOS 18"), false);
  assert.equal(platformOff("Linux armv81", "Android 14"), false);
  // #114: a HarmonyOS tablet's browser answers for the Windows machine its user agent names. The system alone could be
  // an x86 emulator, so nothing is claimed until the graphics card settles it; a card that is ARM does
  assert.deepEqual(armSay({ arch: "", platform: "Win32", os: "HarmonyOS 7.0", gpu: "Maleoon 920" }), { said: "Win32" });
  assert.deepEqual(armSay({ arch: "x86", platform: "Win32", os: "HarmonyOS 7.0", gpu: null }), { said: "x86" });
  assert.equal(armGpu("Maleoon 920"), true);
  assert.equal(armGpu("ANGLE (Qualcomm, Adreno (TM) 740, OpenGL ES 3.2)"), true);
  assert.equal(armGpu("ANGLE (NVIDIA, NVIDIA GeForce RTX 4060 Direct3D11 vs_5_0 ps_5_0, D3D11)"), false);
  assert.equal(armSay({ arch: "x86", platform: "Win32", os: "Windows 11", gpu: "ANGLE (NVIDIA, NVIDIA GeForce RTX 4060 Direct3D11 vs_5_0 ps_5_0, D3D11)" }), null);
  assert.equal(armSay({ arch: "arm", platform: "Linux armv8l", os: "Android 14", gpu: "Adreno (TM) 740" }), null);
  // the tamper check stays quiet on HarmonyOS: every one of its browsers says Win32, so the row is where that is said
  assert.equal(platformOff("Win32", "HarmonyOS 7.0"), false);
  assert.equal(glVendorOff("Google Inc. (NVIDIA)", "ANGLE (NVIDIA, NVIDIA GeForce RTX 4060 Direct3D11 vs_5_0 ps_5_0, D3D11)"), false);
  assert.equal(glVendorOff("Google Inc. (AMD)", "ANGLE (NVIDIA, NVIDIA GeForce RTX 4060 Direct3D11 vs_5_0 ps_5_0, D3D11)"), true);
  // the counter takes known traits and checks only, hashes as 8 hex characters
  assert.deepEqual(cleanSeen({ add: true, t: { os: "Windows 11", fpid: "0123abcd", canvas: "not-a-hash", ip: "1.2.3.4" }, ck: { tz: "bad", nope: "ok", dns: "weird" } }),
    { add: true, t: { os: "Windows 11", fpid: "0123abcd" }, ck: { tz: "bad" } });
  // a run's time: a known range rides along; a stuck run sends it alone, which counts no traits
  assert.equal(cleanSeen({ add: true, t: { os: "Windows 11" }, dur: "5-10" }).dur, "5-10");
  assert.equal(cleanSeen({ add: true, t: { os: "Windows 11" }, dur: "forever" }).dur, undefined);
  assert.deepEqual(cleanSeen({ dur: "stuck", add: true }), { add: false, t: {}, ck: {}, dur: "stuck" });
  assert.equal(cleanSeen({ dur: "nope" }), null);
  assert.equal(durOf(2999), "0-3"); assert.equal(durOf(4000), "3-5"); assert.equal(durOf(61000), "60+");
  assert.equal(cleanSeen({ t: { ip: "1.2.3.4" } }), null);
  assert.equal(rarity(1, 5000), "uniq");
  assert.equal(rarity(50, 5000), "rare");
  assert.equal(rarity(500, 5000), "common");
  assert.equal(rarity(1, 500), null);   // too few checks to say
  // 1ms-shell#34: Simplified Chinese fonts and voices in Singapore fit; in Japan they don't
  assert.equal(checks({ ...base, ipcc: "SG", sys: { cc: ["CN"], from: ["fonts", "voices"] } }).syslang[0], "ok");
  assert.equal(checks({ ...base, ipcc: "JP", sys: { cc: ["CN"], from: ["fonts", "voices"] } }).syslang[0], "warn");
  assert.equal(checks({ ...base, ipcc: "HK", sys: { cc: ["TW"], from: ["fonts", "voices"] } }).syslang[0], "ok");
  assert.deepEqual(nationality({ langs: ["en-US"], tz: "Asia/Singapore", ipcc: "SG", sys: { cc: ["CN"], from: ["fonts", "voices"] } }), { cc: "SG", from: ["fonts", "voices", "tz"] });
  // #35: coarse timers can't time the round trip
  assert.equal(checks({ ...base, rttB: 103, rttCf: 1, coarse: true }).rtt[1], "c_rtt_coarse");
  assert.equal(gpuName("Generic Renderer"), null);
  // a language or system that isn't the IP country's, with the clock and DNS local: someone living there
  assert.equal(checks({ ...base, ipcc: "GB", tz: "Europe/London", tzOff: "+00:00", ipTzOff: "+00:00", dnsCC: "GB", sys: { cc: ["CN"], from: ["fonts", "voices"] } }).syslang[1], "c_sys_abroad");
  assert.equal(checks({ ...base, ipcc: "GB", tz: "Europe/London", tzOff: "+00:00", ipTzOff: "+00:00", dnsCC: "GB" }).lang[1], "c_lang_abroad");
  assert.equal(checks({ ...base, ipcc: "GB", tz: "Europe/London", tzOff: "+00:00", ipTzOff: "+00:00", dnsCC: "GB" }).lang[0], "info");   // (not counted: someone living there)
  assert.equal(checks({ ...base, ipcc: "JP", sys: { cc: ["CN"], from: ["fonts", "voices"] } }).syslang[1], "c_sys_warn");   // the clock is China's
  // ECH off is a note
  assert.equal(protocols({ br: { name: "Chrome", v: "156" }, sni: "plaintext" }).ech[0], "info");
  // Chinese on Singapore's clock (the same UTC+8) behind a Chinese IP: someone in China
  assert.deepEqual(nationality({ langs: ["zh-CN"], tz: "Asia/Singapore", ipcc: "CN" }), { cc: "CN", from: ["langs"] });
  assert.deepEqual(nationality({ langs: ["zh-CN"], tz: "Asia/Kuala_Lumpur", ipcc: "SG" }), { cc: "MY", from: ["langs", "tz"] });
  // Taiwan: its fixed name in every language, China's flag; Hong Kong keeps the system's name and its own flag
  assert.equal(regionName("TW", "zh-CN"), "中国台湾");
  assert.equal(regionName("TW", "en"), "Taiwan, China");
  assert.equal(regionName("TW", "ru"), "Тайвань, Китай");
  assert.equal(flagCode("TW"), "cn");
  assert.equal(flagCode("HK"), "hk");
  // iOS: Chrome there connects with Apple's TLS, classical before iOS 26
  assert.equal(protocols({ br: { name: "Chrome", v: "156" }, kex: "X25519", ios: 18 }).pq[0], "info");
  assert.equal(protocols({ br: { name: "Chrome", v: "156" }, kex: "X25519", ios: 26 }).pq[0], "warn");
  assert.equal(protocols({ br: { name: "Chrome", v: "156" }, kex: "X25519" }).pq[0], "warn");
  // Chinese down an English list on Singapore's clock
  assert.deepEqual(nationality({ langs: ["en", "zh", "en-GB"], tz: "Asia/Singapore", ipcc: "JP" }), { cc: "SG", from: ["langs", "tz"] });
  assert.equal(isIntegratedGpu("AMD Radeon RX 7600M XT"), false);
  assert.equal(isIntegratedGpu("Intel(R) Arc(TM) A770 Graphics"), false);
  assert.equal(discreteGpu("NVIDIA GeForce RTX 4080 SUPER", null, { vendor: "nvidia", architecture: "ada-lovelace" }), null);
  // through a VPN in Japan
  const v = checks({ ...base, ipTzOff: "+09:00", ipcc: "JP", asn: 16509, org: "Amazon.com, Inc.", rtc: ["1.2.3.4", "5.6.7.8"], ip: "5.6.7.8" });
  assert.equal(v.tz[0], "bad"); assert.equal(v.lang[0], "warn"); assert.equal(v.dc[0], "warn"); assert.equal(v.webrtc[0], "bad");
  assert.deepEqual(v.webrtc[2], { ip: "1.2.3.4" });
  assert.deepEqual(v.tz, ["bad", "c_tz_off", { a: "+09:00", b: "+08:00", za: null, zb: "Asia/Shanghai" }]);
  // another zone of the IP's own country only hints: New York against an address placed in Los Angeles
  const us = { ...base, tz: "America/New_York", tzOff: "-05:00", ipTz: "America/Los_Angeles", ipTzOff: "-08:00", ipcc: "US" };
  assert.deepEqual(checks(us).tz, ["warn", "c_tz_near", { a: "-08:00", b: "-05:00", za: "America/Los_Angeles", zb: "America/New_York" }]);
  assert.equal(checks({ ...base, tz: "Europe/Moscow", tzOff: "+03:00", ipTz: "Asia/Vladivostok", ipTzOff: "+10:00", ipcc: "RU" }).tz[0], "warn");
  // New York's clock behind an address in Japan is a contradiction; the same offset in another country is not
  assert.equal(checks({ ...us, ipTz: "Asia/Tokyo", ipTzOff: "+09:00", ipcc: "JP" }).tz[0], "bad");
  assert.equal(checks({ ...base, ipTz: "Asia/Singapore", ipcc: "SG" }).tz[0], "ok");
  // the browser contradicting itself: Date reports another offset than the zone Intl names, so the clock is a script's
  // story whatever the address's zone says (and it outranks a match with the IP)
  assert.deepEqual(checks({ ...base, ipTz: "Asia/Singapore", ipcc: "SG", tzAlt: "+07:00" }).tz, ["bad", "c_tz_self", { a: "+08:00", b: "+07:00" }]);
  assert.deepEqual(checks({ ...base, tzAlt: null }).tz, ["ok", "c_tz_ok", { a: "+08:00" }]);
  // an IPv6 address next to an IPv4 page request is only a warning
  assert.equal(checks({ ...base, rtc: ["2001:db8::1", "1.2.3.4"] }).webrtc[0], "warn");
  // an IPv6 address this site sees too is no leak; one that differs from it is
  const v6 = [["ip", "1.2.3.4"], ["stack", "1.2.3.4"], ["stack", "2001:db8::1"]];
  assert.equal(checks({ ...base, exits: v6, rtc: ["2001:db8::1", "1.2.3.4"] }).webrtc[0], "ok");
  assert.deepEqual(checks({ ...base, exits: v6, rtc: ["2001:db8::9", "1.2.3.4"] }).webrtc, ["bad", "c_rtc_bad", { ip: "2001:db8::9" }]);
  // the IPv4 / IPv6 test went direct while the page went through the proxy: its addresses are the ones that leak
  assert.deepEqual(checks({ ...base, ip: "2406:da14::1", exits: [["ip", "2406:da14::1"], ["stack", "1.2.3.4"], ["stack", "2408:8207::1"]], rtc: ["1.2.3.4", "2408:8207::1"] }).webrtc, ["bad", "c_rtc_bad", { ip: "2408:8207::1" }]);
  // the address another destination sees (a rule-based proxy's direct route) still leaks to this site
  assert.equal(checks({ ...base, ip: "5.6.7.8", exits: [["ip", "5.6.7.8"], ["ex_cn", "1.2.3.4"]], rtc: ["1.2.3.4"] }).webrtc[0], "bad");
  assert.equal(checks({ ...base, rtc: false }).webrtc[1], "c_rtc_off");
  // a user agent that claims a Mac on a Direct3D card
  assert.deepEqual(checks({ ...base, uaOS: "macOS", hintOS: null }).ua, ["bad", "c_ua_bad", { a: "macOS", b: "Windows" }]);
  assert.equal(checks({ ...base, langs: ["en-US"] }).lang[0], "info");
  assert.equal(checks({ ...base, rand: true }).fp[0], "ok");
  assert.equal(checks({ ...base, webdriver: true }).bot[0], "bad");
  // still waiting
  assert.equal(checks({ ...base, rtc: undefined }).webrtc, null);
});

test("UTC offsets", () => {
  assert.equal(offTxt(480), "+08:00");
  assert.equal(offTxt(-210), "−03:30");
  assert.equal(offTxt(0), "+00:00");
});

test("split routing: different networks over the same IP version", () => {
  assert.equal(splitOf([["ip", "1.2.3.4"], ["ex_cn", "1.2.9.9"], ["stack", "2001:db8::1"]]), null);
  // the connection: an engine's own HTTP/2 preface, a SYN of the user agent's OS family
  const cn = (conn, uaOS = "Windows 11") => checks({ ipcc: "JP", conn, uaOS }).conn;
  assert.deepEqual(cn({ os: "windows", pseudo: "m,a,s,p", engine: "V8" }), ["ok", "c_conn_ok", {}]);
  assert.deepEqual(cn({ os: "linux", pseudo: "m,a,s,p", engine: "V8" }), ["warn", "c_conn_os", { a: "linux", b: "Windows 11" }]);
  assert.equal(cn({ os: "windows", pseudo: "m,p,s,a", engine: "V8" })[1], "c_conn_mitm");
  assert.equal(cn({ os: "apple", pseudo: "m,s,p,a", engine: "JavaScriptCore" }, "iOS 18.7")[1], "c_conn_ok");
  assert.equal(cn({ os: "unix", pseudo: null, engine: "V8" }, "Android 15")[1], "c_conn_ok");
  assert.deepEqual(cn(null), ["info", "c_conn_na", {}]);
  assert.deepEqual(cn({ os: "windows", pseudo: "m,a,s,p", engine: "V8", mtu: 9001 }), ["warn", "c_conn_cloud", { m: 9001 }]);
  // an IPv6 address built from the card's MAC, and a random one
  assert.equal(macOf("2001:db8::211:22ff:fe33:4455"), "00:11:22:33:44:55");
  assert.equal(macOf("2408:8207:2653:1af0:3c8e:ae84:162f:b0dc"), null);
  assert.equal(macOf("1.2.3.4"), null);
  // what kind of IPv6 address: the card's, a tunnel, one that rotates between destinations, or a random one
  assert.equal(v6Type(["2001:db8::211:22ff:fe33:4455"]), "eui64");
  assert.equal(v6Type(["2002:c000:0204::1", "2001:db8::1"]), "6to4");
  assert.equal(v6Type(["2001:0:53aa:64c:1c2b:3a4d:3e8e:9f5a"]), "teredo");
  assert.equal(v6Type(["2001:db8:1:2:aaaa::1", "2001:db8:1:2:bbbb::2"]), "temporary");
  assert.equal(v6Type(["2001:db8:1:2:aaaa::1"]), "other");
  assert.equal(v6Type(["1.2.3.4"]), null);
  assert.equal(v6Type([]), null);
  // the tunnel an MSS points to
  assert.equal(tunnelOf(1460), false); assert.equal(tunnelOf(1452), "pppoe"); assert.equal(tunnelOf(1380), "wireguard"); assert.equal(tunnelOf(1220, true), "wireguard");
  assert.equal(tunnelOf(1410), "openvpn"); assert.equal(tunnelOf(1360), "ipsec"); assert.equal(tunnelOf(1300), "other"); assert.equal(tunnelOf(null), null);
  // a phone network's NAT gives Radar's IPv4 test another address: no split (1ms-shell#63)
  assert.equal(splitOf([["ip", "172.58.1.1"], ["ex_intl", "172.58.1.1"], ["stack", "100.40.2.2"], ["stack", "2607:fb90::1"]]), null);   // same /16, and IPv6 beside IPv4
  assert.deepEqual(splitOf([["ip", "45.76.1.1"], ["ex_cn", "114.254.73.157"], ["ex_gpt", "45.76.1.1"]]), { a: "ip", b: "ex_cn", ipA: "45.76.1.1", ipB: "114.254.73.157", n: 2 });
  assert.equal(netOf("2406:da14:3c2:6400:f4b7:e910:7738:7af1"), "2406:da14:03c2:6400");
  const base = { ipcc: "JP" };
  assert.equal(checks({ ...base, exits: [["ip", "1.1.1.1"], ["ex_cn", "8.8.8.8"]] }).split[0], "warn");
  assert.equal(checks({ ...base, exits: [["ip", "1.1.1.1"], ["ex_cn", "1.1.2.2"]] }).split[0], "ok");
  assert.equal(checks(base).split, null);
});

test("DNS leak: the resolver's country against the address's", () => {
  // #108: a resolver in another country is a hint, not a contradiction: small countries resolve through a
  // neighbour's, so an ordinary visitor there would be told they look like a proxy (HU here, the resolver in DE)
  assert.equal(checks({ ipcc: "HU", dnsCC: "DE" }).dns[0], "warn");
  assert.equal(checks({ ipcc: "JP", dnsCC: "CN" }).dns[0], "warn");
  assert.equal(checks({ ipcc: "JP", dnsCC: "JP" }).dns[0], "ok");
  assert.equal(checks({ ipcc: "JP", dnsCC: null }).dns[0], "info");
  assert.equal(checks({ ipcc: "JP" }).dns, null);
  // it is a contradiction only with another check saying the route is inconsistent: another system opened the
  // connection, or WebRTC gave away an address the page's exit does not have
  assert.equal(checks({ ipcc: "HU", dnsCC: "DE", uaOS: "Windows", conn: { os: "linux", pseudo: "m,a,s,p", engine: "V8" } }).dns[0], "bad");
  assert.equal(checks({ ipcc: "HU", dnsCC: "DE", ip: "1.2.3.4", rtc: ["5.6.7.8"] }).dns[0], "bad");
  // (a cloud's wide MTU says a server opened the connection, which is what a tunnel is: not a contradiction on its own)
  assert.equal(checks({ ipcc: "HU", dnsCC: "DE", conn: { mtu: 9001 } }).dns[0], "warn");
  // and one hint keeps the grade at A, where a contradiction cost it B
  assert.equal(grade(checks({ ipcc: "HU", dnsCC: "DE" }), ["dns"]).grade, "A");
  // two lookups, two countries: the route varies per request, which is what the check says instead of one country
  assert.deepEqual(checks({ ipcc: "HU", dnsCC: "DE", dns2CC: "NL", dnsRot: true }).dns, ["warn", "c_dns_rot", { cc: "DE", cc2: "NL" }]);
  // (and it outranks the corroborated case: the route's variation is the explanation)
  assert.equal(checks({ ipcc: "HU", dnsCC: "DE", dns2CC: "NL", dnsRot: true, ip: "1.2.3.4", rtc: ["5.6.7.8"] }).dns[1], "c_dns_rot");
  // the same country twice changes nothing
  assert.equal(checks({ ipcc: "HU", dnsCC: "DE", dns2CC: "DE", dnsRot: false }).dns[0], "warn");
});

test("identity strings: on iOS every browser reads Apple's, whatever it calls itself", () => {
  // #109: Chrome on iOS (CriOS) is WebKit with Apple's vendor and productSub; expecting Google's flagged every
  // iOS visitor who changed nothing
  for (const name of ["Chrome", "Edge", "Firefox", "Safari", "Opera"]) {
    assert.equal(idLies({ name, ios: "iOS", vendor: "Apple Computer, Inc.", productSub: "20030107" }), false, name);
  }
  // a desktop Chrome, Edge or Firefox with someone else's strings is still a lie
  assert.equal(idLies({ name: "Chrome", ios: "", vendor: "Apple Computer, Inc.", productSub: "20030107" }), true);
  assert.equal(idLies({ name: "Edge", ios: "", vendor: "", productSub: "20100101" }), true);
  assert.equal(idLies({ name: "Firefox", ios: "", vendor: "Google Inc.", productSub: "20030107" }), true);
  assert.equal(idLies({ name: "Safari", ios: "", vendor: "Google Inc.", productSub: "20030107" }), true);
  // the honest ones, on both
  assert.equal(idLies({ name: "Chrome", ios: "", vendor: "Google Inc.", productSub: "20030107" }), false);
  assert.equal(idLies({ name: "Firefox", ios: "", vendor: "", productSub: "20100101" }), false);
  assert.equal(idLies({ name: "Safari", ios: "", vendor: "Apple Computer, Inc.", productSub: "20030107" }), false);
  // nothing read yet says nothing
  assert.equal(idLies({ name: "", ios: "", vendor: "Google Inc.", productSub: "20030107" }), false);
  assert.equal(idLies({ name: "Chrome", ios: "", vendor: null, productSub: null }), false);
});

test("protocols", () => {
  const chrome = { name: "Chrome", v: "141" }, lv = x => Object.fromEntries(Object.entries(protocols(x)).map(([k, v]) => [k, v && v[1]]));
  const base = { http: ["HTTP/2", "http/2"], rtc: ["1.2.3.4"], br: chrome, sni: "encrypted", kex: "X25519MLKEM768", warp: "off", gateway: "off" };
  assert.deepEqual(lv(base), { h3: "c_h3_wait", ech: "c_ech_ok", pq: "c_pq_ok", warp: "c_warp_off" });
  // HTTP/3 once is enough; never, with no UDP at all, is a blocked or uncarried UDP; without WebRTC, no telling
  assert.equal(protocols({ ...base, http: ["HTTP/2", "http/3"] }).h3[0], "ok");
  assert.equal(protocols({ ...base, http: ["HTTP/3"] }).h3[0], "ok");
  assert.deepEqual(protocols({ ...base, rtc: [] }).h3, ["warn", "c_h3_udp", {}]);
  assert.equal(protocols({ ...base, rtc: false }).h3[1], "c_h3_unk");
  assert.equal(protocols({ ...base, rtc: undefined }).h3, null);
  // ECH off: the likeliest reason by browser
  assert.equal(protocols({ ...base, sni: "plaintext" }).ech[1], "c_ech_dns");
  assert.equal(protocols({ ...base, sni: "plaintext", br: { name: "Firefox", v: "140" } }).ech[1], "c_ech_ff");
  assert.equal(protocols({ ...base, sni: "plaintext", br: { name: "Safari", v: "18" } }).ech[1], "c_ech_safari");
  // a classical key exchange from a browser that offers post-quantum by default: something in between
  assert.deepEqual(protocols({ ...base, kex: "X25519" }).pq, ["warn", "c_pq_mitm", { kex: "X25519", b: "Chrome 141" }]);
  assert.equal(protocols({ ...base, kex: "X25519", br: { name: "Chrome", v: "110" } }).pq[1], "c_pq_old");
  assert.equal(protocols({ ...base, kex: "X25519", br: { name: "Safari", v: "18" } }).pq[1], "c_pq_old");
  assert.equal(protocols({ ...base, kex: "X25519", br: { name: "Firefox", v: "135" } }).pq[1], "c_pq_mitm");
  assert.deepEqual(protocols({ ...base, warp: "plus" }).warp, ["info", "c_warp_on", { w: "plus" }]);
  assert.equal(protocols({ ...base, gateway: "on" }).warp[1], "c_warp_gw");
  assert.deepEqual(protocols({ http: [] }), { h3: null, ech: null, pq: null, warp: null });
});

test("the system's languages and the grade", () => {
  // Windows: the fonts a language adds, the voices of its pack, a keyboard tied to a region
  assert.deepEqual(sysLangs({ os: "Windows", fonts: ["Segoe UI", "KaiTi", "DengXian"], voices: ["en-US", "zh-CN"] }), { cc: ["CN"], from: ["fonts", "voices"], parts: [{ row: "fonts", cc: ["CN"] }, { row: "voices", cc: ["CN"] }] });
  assert.deepEqual(sysLangs({ os: "Windows", fonts: ["Segoe UI"], voices: ["en-US"], kbd: "AZERTY" }), { cc: ["FR", "BE"], from: ["kbd"], parts: [{ row: "kbd", cc: ["FR", "BE"] }] });
  assert.deepEqual(sysLangs({ os: "Windows", fonts: [], voices: ["en-US", "en-GB"] }), { cc: [], from: [], parts: [] });
  // (#107: a Chinese font and Russian voices are two countries, not two witnesses for China: one hint, the font's)
  const two = sysLangs({ os: "Windows", fonts: ["SimHei"], voices: ["en-US", "en-GB", "ru-RU"], kbd: "QWERTY" });
  assert.deepEqual(two, { cc: ["CN", "RU"], from: ["fonts", "voices"], parts: [{ row: "fonts", cc: ["CN"] }, { row: "voices", cc: ["RU"] }] });
  assert.deepEqual(checks({ tz: "Europe/London", tzOff: "+00:00", ipTzOff: "+00:00", ipcc: "GB", langs: ["en-GB"], dnsCC: "GB", sys: two }).syslang, ["info", "c_sys_one", { cc: "CN", from: "fonts" }]);
  // voices naming the font's country too do confirm it
  assert.deepEqual(checks({ ipcc: "GB", sys: sysLangs({ os: "Windows", fonts: ["SimHei"], voices: ["en-US", "zh-CN"] }) }).syslang, ["warn", "c_sys_warn", { cc: "CN", from: "fonts,voices" }]);
  // other systems bring every language's fonts and voices
  assert.equal(sysLangs({ os: "macOS", fonts: ["PingFang SC", "Hiragino Sans"] }), false);
  // plain English in the browser, Chinese in the system
  assert.deepEqual(nationality({ langs: ["en-US"], tz: "Asia/Tokyo", ipcc: "JP", sys: { cc: ["CN"], from: ["fonts", "voices"] } }), { cc: "CN", from: ["fonts", "voices"] });
  // one source alone doesn't say the country (1ms-shell#25: Japanese fonts in Slovakia; #29: a Spanish voice in the US)
  assert.deepEqual(nationality({ langs: ["en-US"], tz: "Europe/Budapest", ipcc: "SK", sys: { cc: ["JP"], from: ["fonts"] } }), { cc: "HU", from: ["tz"] });
  assert.deepEqual(nationality({ langs: ["en-US"], tz: "America/Chicago", ipcc: "US", sys: { cc: ["ES"], from: ["voices"] } }), { cc: "US", from: ["tz"] });
  assert.deepEqual(checks({ tz: "Europe/Budapest", tzOff: "+01:00", ipTzOff: "+01:00", ipcc: "SK", langs: ["en-US"], sys: { cc: ["JP"], from: ["fonts"] } }).syslang, ["info", "c_sys_one", { cc: "JP", from: "fonts" }]);
  const ok = id => ["ok", "x", {}], ids = ["a", "b", "c"];
  assert.deepEqual(grade({ a: ok(), b: ok(), c: ok() }, ids), { score: 100, grade: "A+" });
  assert.deepEqual(grade({ a: ["warn"], b: ok(), c: ok() }, ids), { score: 92, grade: "A" });
  assert.deepEqual(grade({ a: ["bad"], b: ["bad"], c: ["warn"] }, ids), { score: 56, grade: "D" });
});

test("the screen in physical pixels", () => {
  assert.deepEqual(physicalScreen(2560, 1440, 1.5), [3840, 2160]);    // 4K at Windows' default 150%
  assert.deepEqual(physicalScreen(1920, 1080, 2), [3840, 2160]);      // 4K at 200%
  assert.deepEqual(physicalScreen(2560, 1440, 1.875), [3840, 2160]);  // the same, with the page zoomed to 125%
  assert.deepEqual(physicalScreen(2560, 1440, 1), [2560, 1440]);
  assert.deepEqual(physicalScreen(1512, 982, 2), [3024, 1964]);       // a 14-inch MacBook Pro
  assert.deepEqual(physicalScreen(390, 844, 3), [1170, 2532]);
  assert.deepEqual(physicalScreen(1680, 1050, 2), [3360, 2100]);      // a Mac at a scaled resolution, not 1x (1ms-shell#61)        // a phone keeps the plain product
  assert.deepEqual(physicalScreen(1080, 1920, 1), [1080, 1920]);      // a monitor turned upright
});

test("software renderers and networks registered under an address", () => {
  assert.equal(isSoftGpu("ANGLE (Microsoft, Microsoft Basic Render Driver Direct3D11 vs_5_0 ps_5_0, D3D11)"), true);
  assert.equal(isSoftGpu("ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)"), true);
  assert.equal(isSoftGpu("ANGLE (NVIDIA, NVIDIA GeForce RTX 4080 SUPER (0x00002702) Direct3D11 vs_5_0 ps_5_0, D3D11)"), false);
  assert.equal(looksLikeAddress("7F,World peace center,55 wo tong tsui st,kwai chung"), true);
  assert.equal(looksLikeAddress("Room 1203, 12/F, Tower 2"), true);
  assert.equal(looksLikeAddress("Amazon.com, Inc."), false);
  assert.equal(looksLikeAddress("China Unicom Beijing Province Network"), false);
  assert.equal(looksLikeAddress("1&1 Versatel Deutschland GmbH"), false);
  assert.equal(looksLikeAddress("Level 3 Parent, LLC"), false);
});

// yt1988/1ms-shell#82: GNOME Web on Linux reports WebKit's "Apple GPU" stand-in and a Safari-like user agent
test("a WebKit browser on Linux is neither Safari nor an Apple device", () => {
  const EPIPHANY = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/60.5 Safari/605.1.15";
  assert.deepEqual(browser(EPIPHANY), { name: "WebKit", v: "" });
  assert.equal(gpuOS("Apple GPU"), null);
  assert.equal(gpuOS("ANGLE (Apple, ANGLE Metal Renderer: Apple M2, Unspecified Version)"), "Apple");
  assert.equal(checks({ uaOS: "Linux", real: true, gpuOS: gpuOS("Apple GPU") }).ua[0], "ok");
  const p = protocols({ sni: "plaintext", kex: "X25519", br: browser(EPIPHANY) });
  assert.equal(p.ech[1], "c_ech_webkit");
  assert.equal(p.pq[1], "c_pq_old");
});

test("the exit's kind, and a virtual machine's, from the names they report", () => {
  assert.equal(netKind(9009, "Mullvad VPN AB"), "vpn");
  assert.equal(netKind(13335, "Cloudflare, Inc."), "dc");
  assert.equal(netKind(2516, "KDDI Corporation"), "home");
  assert.equal(netKind(null, ""), "home");
  assert.deepEqual(checks({ ip: "1.2.3.4", asn: 9009, org: "Mullvad VPN AB" }).dc, ["warn", "c_dc_vpn", { org: "Mullvad VPN AB" }]);
  assert.equal(vmOf("ANGLE (VMware, Inc., VMware SVGA 3D Direct3D11 vs_5_0 ps_5_0, D3D11)"), "vmware");
  assert.equal(vmOf("VirtualBox Graphics Adapter"), "virtualbox");
  assert.equal(vmOf("Microsoft Basic Render Driver"), "soft");
  assert.equal(vmOf("ANGLE (NVIDIA, NVIDIA GeForce RTX 4070 Direct3D11 vs_5_0 ps_5_0, D3D11)"), null);
  assert.equal(vmOf(null), null);
});

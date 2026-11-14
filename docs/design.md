# Design notes: what who reads, how, and what was tested

The technical side of the project: how it compares with the other privacy tests (what each reads), what has been built
and how it works, what was tested and turned out not to work, and the data that needs upkeep. How to build, test and
deploy is in AGENTS.md.

## Against the other tests (127 readings, 14 disguise checks, 4 protocol checks; 2026-11-11)

Ahead of the field: the portrait (one paragraph from all readings), disguise checks that cross-read the readings
(time zone, language, DNS, split routing, WebRTC, data center, user agent, round trip, system languages, anti-detect
browser traces, tampering, connection fingerprint, automation), six exits per destination type, post-quantum and ECH
checks, real anonymous counts for how common a value is, 10 languages, topic pages.

What the others had that a page needed work for, and how who covers it now:

| Reading | Who has it | In who |
| --- | --- | --- |
| Lie detection: prototype and getter lies, Proxy traces, iframe and worker scope compared | CreepJS | 54 APIs, a fresh iframe, one worker |
| Naming the protection: Brave farbling, Firefox RFP / FPP, Tor Browser, Safari ATFP, extensions | CreepJS | from how it scrambles |
| Rendering fingerprints: DOMRect / ClientRects, SVGRect, text metrics, WebGL pixels, WebGPU limits | CreepJS, BrowserLeaks, BrowserScan | all |
| Engine fingerprints: key counts, CSS features, timer resolution, stack depth | CreepJS | all, shown, not in the ID |
| Codecs and media: WebRTC codecs, MediaRecorder types, speech voices | CreepJS | all |
| Tracker blocking actually working | Cover Your Tracks (EFF) | behind a button |
| Cookie-less re-identification: ETag / cache | supercookie.me-style demos | the Worker's ETag |
| Same machine across browsers (hardware-only ID) | research demos | screen, cores, GPU, fonts |
| Opt-in: precise location vs the IP's, motion sensors | BrowserLeaks, BrowserScan | behind a button each |
| TCP/IP OS (p0f, JA4T), HTTP/2 (Akamai), QUIC, JA3 / JA4 | BrowserLeaks, BrowserScan | the probe (a server of its own: a Worker never sees the raw packets) |
| IP reputation (block lists) | BrowserScan, whoer | not read: it takes a lookup per visit from the server |

## Built

- 2026-11-04: stored traces (four stores), sensitive APIs, how common each reading is (after kuber.studio/cookie).
- 2026-11-04: the probe: TCP/IP (OS family, TTL, hops, MTU, JA4T), JA4 / JA3, HTTP/2 (engine, pseudo-header order,
  Akamai) and the "connection fingerprint" check (TCP OS against the user agent's, HTTP/2 against the engine's),
  dual stack (the SYN captured over IPv4 and IPv6); later the QUIC JA4 over HTTP/3 (443/udp).
- 2026-11-04: lie detection: 54 APIs checked for being the browser's own (source by a fresh iframe's toString, no own
  prototype, getters that refuse a stranger), own properties on navigator / screen, a fresh iframe's readings against
  the page's; feeds the tampering check.
- 2026-11-04: whose protection: Brave (farbling, navigator.brave), Firefox resistFingerprinting (Tor, Mullvad),
  Firefox FPP, Safari ATFP, a fingerprint extension, a user-agent switcher, or none.
- 2026-11-04: rendering and engine fingerprints: DOMRect, SVG text sizes, text metrics, WebGL image, WebGPU limits and
  features, WebRTC codecs, MediaRecorder formats, engine key counts, timer step, call stack depth.
- 2026-11-04: tracker blocking, behind a button: seven common trackers' scripts, without cookies or referrer; refused
  within 50 ms counts as blocked, slower failures as the network.
- 2026-11-04: hardware ID across browsers, and the ETag cache ID.
- 2026-11-04: behind a button each: the precise location against the IP's guess (Permissions-Policy
  geolocation=(self)); a phone's motion sensors (rate, noise, offsets as an ID).
- 2026-11-04: the stats page's week-over-week change; comparing with a friend (a shared portrait's "test myself"
  carries it, ?vs=, and after the run a card sets the two side by side).
- 2026-11-04: the probe's /conn for other tools; an MTU over 1500 read as a cloud's inside network.
- 2026-11-04: IPv6 leaking the MAC (EUI-64), ICU data, scrollbar width, an extension scan, the CSS feature level, font
  smoothing, data saver.
- 2026-11-04: the portrait tells the new readings: the worst of it (or good news) after the first paragraph, who opened
  the connection, who protects the fingerprint, how a site recognizes you anyway (cache ID, a surviving store, the
  hardware ID), labels for tunnels, returning visitors and password managers, a softer origin when only the language
  says it.
- 2026-11-06: the device model (src/models.mjs: iPhone / iPad by screen points, pixel ratio and iOS version; MacBook by
  its built-in display and the chip Chromium's WebGL names; Android by its Client Hints model code in Google Play's
  device list and MobileModels; a laptop by its battery or GPU); an AI agent or a script at the controls (the pointer's
  path before each click, after FP-Agent, arXiv 2605.01247; feeds the automation check); the browser's built-in AI and
  downloaded translation languages; passkey capabilities (getClientCapabilities).
- 2026-11-07: a WebKit browser off Apple's systems (GNOME Web on Linux) reads as "WebKit", not Safari: WebKit reports
  "Apple GPU" on every platform, so that name alone is no Apple tell.
- 2026-11-09: Client Hints the request itself carries (the Worker asks with Accept-CH, the page reads them back and
  compares them with navigator, which a script can rewrite but a header cannot); device form (`formFactors`) and 32-bit
  Windows (`wow64`); automation traces (headless browser, driver globals, Electron) feeding the automation check; the
  identity strings a user-agent switcher forgets (`vendor`, `productSub`, plugins); a game controller behind a button;
  VR/AR availability; audio output latency; folded-posture, slow-update, HDR-video and hybrid touchscreen-pointer
  readings; the full HTTP/2 SETTINGS in the tooltip; two topic pages (`/ai-agent/`, `/client-hints/`).
- 2026-11-09: the help's questions and answers moved out of every page's HTML into one `h.<lang>.js` per language,
  fetched when help is opened (topic pages keep their own set), the FAQ structured data only on the main language
  pages, and the page-size test ceiling raised to 100,000 characters so the French, German and Russian FAQ answers
  could be written out in full again (gzip of the page stayed around 19 KB).
- 2026-11-11: the proxy conclusion names each giveaway's own country: the clock's and the DNS resolver's can be
  different places (a visitor in Vietnam on Bangkok's clock was told both pointed to Thailand). `giveaways()` in
  `src/infer.mjs`, unit tested; they are merged into one name only when they agree. A nationality resting on the
  clock alone now says where the device is set, not where the visitor is from.
- 2026-11-11: different exits for different sites are reported as what was measured, with the usual cause (rule-based
  splitting) given as one of several: a proxy, the network (a mobile carrier, a company line) or security software can
  all do it, and the help says it is not proof that the visitor set up a proxy. The check's tips separate the proxy
  case from the network's.
- 2026-11-11: the permissions reading asks all 21 names the Permissions API knows here (clipboard, push, persistent
  and third-party storage, local fonts, window management, wake lock, Bluetooth, idle, the three sensors, the local
  network, screen capture, speaker selection, beside the first four). Only granted and blocked ones are printed; a
  browser that doesn't know a name rejects it and the rest stand. The query never prompts, and the tooltip says so.
- 2026-11-11: a WebAssembly row (17 features, each its own tiny module from wasm-feature-detect 1.10.0, Apache-2.0;
  the sender's fixtures unchanged, attributed in `src/wasm.mjs`): the count and the missing ones tell an engine's
  version apart the way the JS feature probes do. The WebGL row adds the shader precision each driver reports, and
  the IPv6 row names a 6to4 or Teredo tunnel or an interface ID that changes between destinations, not only the MAC.
- 2026-11-11: the exit's kind from its network's registered name (`netKind`): a VPN provider's own network is named as
  that, not lumped in as "a data center"; hosting and cloud networks keep the data-center wording, and a home line, a
  mobile carrier and an office all read as ordinary. The check says a VPN provider's network is visible, never that
  the visitor uses it.
- 2026-11-11: the Tor check: the Worker keeps Tor Project's public exit list an hour (isolate memory and the edge
  cache) and answers `/api/tor` with whether the request's IPv4 address is on it. The list never reaches the browser,
  and the visitor's address never goes to the Tor Project. IPv6 says it cannot be checked: the bulk list is IPv4 only.
- 2026-11-11: a virtual-machine row from the renderer string (`vmOf`): VMware, VirtualBox, QEMU, Parallels, Hyper-V and
  Citrix name themselves, and no card at all is reported as that, with its other causes (a server, acceleration off)
  in the tooltip; never "you are in a VM".
- 2026-11-11: two topic pages, `/vpn-leak/` (DNS, WebRTC, exits and Tor, headed by the DNS check) and `/webgpu/` (the
  adapter, its limits and the fingerprint they add), in all 10 languages.
- 2026-11-11: every check's verdict carries its own report entry once the run ends: the button hands the host shell a
  prefilled sentence (the check's name, what it concluded, and a blank for the truth), so a wrong verdict takes one
  click to report. Only for the shell's own dialog, never in an embed, a shared portrait or a focus view.
- 2026-11-11: the returning visitor's card compares this visit's seven fingerprint parts with the last one stored
  (`who:last`), marking each the same or changed and counting them; it explains that a site needs all of them equal
  to recognize a visitor without a cookie, and one changed part breaks the ID. It shows whenever parts were stored,
  even when the fingerprint as a whole is unchanged.
- 2026-11-11: an ad-profile card builds the OpenRTB bid request this page's readings would fill (site, device, IP,
  languages, time zone, screen, OS, geo from the edge, consent absent), says which parts a real exchange adds and
  that the interests come from a profile rather than these readings, and never sends it. It is built only when the
  card is opened. The JSON is available whether or not the host dialog is.
- 2026-11-11: the readings export as a JSON file (site, page, time, portrait, grade, fingerprint, every row and every
  check's verdict, from the page as it stands) and the page prints through the browser's own dialog.
- 2026-11-11: the font row offers the full local list behind the browser's Local Font Access permission, listing the
  families it returns in place of the guessed one; a refusal leaves the denied note. Staged loading stays as it was:
  rows paint as they finish, the help arrives when opened, and a topic page runs only its own subset.
- 2026-11-11: the paragraph fills a blank at a time as its readings land (`schedulePortrait` and a partial pass in
  `blank`), instead of six paragraphs appearing together after the slowest probe. A partial pass fills only a blank
  whose listed sources are all in and only while it waits; the checks' verdict, the labels and the store sentence
  keep their own timing.
- 2026-11-11: the fingerprint card follows the paragraph instead of sitting at the foot of the column
  (`margin-top: auto`): opening the two cards under it used to move it up by their height. It now sits 14px under
  the labels and stays put; the blank left at the column's foot is the layout's, not a shift.
- 2026-11-11: the portrait's network sentence names a VPN provider's own network or a Tor exit (`nt_vpn`,
  `nt_tor`), the read sentence says what a site makes of it (`rd_vpn`, `rd_tor`, and Tor first), and Tor leads the
  worst-of line. Before, a VPN provider's exit read as "an ordinary home or mobile network" in the prose while the
  check named the provider.
- 2026-11-11: the stats page's "what gives people away" list gives its value column the width of its widest row and
  keeps the percentage and its week-over-week change on one line in two columns; a fixed 3em could not hold
  "48% ↑7.7", so the change wrapped under the percentage or ran into the card's edge.
- 2026-11-11: a topic page's values are shown whole: a long one (the DNS server, both addresses, the font list) wraps
  inside its column instead of ending in an ellipsis, and a link at the end of a value (the IPv6 test after the two
  addresses) takes the next line rather than sitting over the text. The local-fonts button's label wraps inside the
  column too, instead of running past it on a phone.
- 2026-11-11: printing is its own layout: light colors even in dark mode (the browser drops backgrounds but keeps
  light text, which made the Print button put pale text on white paper), one column, no controls or dialogs, the
  cards and rows kept from breaking across pages. No URLs or theme chrome on paper.
- 2026-11-12: the page no longer jumps while it runs (the shell repo's rule: tool-contract.md §4, blocks drawn at the
  start and filled in place). The fonts load `font-display: optional`, and the three faces the first screen draws
  with are preloaded, so a font that lands late is never swapped in (0.15 of the live page's shift; the Cyrillic face
  alone took 1.2 s here). A paragraph keeps the height it had while it waited — releasing it at the end of the run
  moved the labels, the ID card and everything below them by a paragraph's worth (126 px). (Dropped on 2026-11-13: the
  waiting paragraph is now measured at the answer's width instead, so it mostly keeps its own height; see that entry.)
  A paragraph now fills in
  one frame, when its last reading lands, instead of at every answer: each rewrap moved the words after it, and
  filling a line at a time took the story's share of the shift from about 0.2 to under 0.1. The checks' action strip
  (one line, 18 px, since 2026-11-13 — and none at all on a row with nothing to do), the verdict's two lines, the headline's
  two-line row and the anti-detect card (drawn when the run starts, not when it ends: it pushed the tally down 60 px)
  keep their space from the first paint, so the right column does not move when the verdicts land. Measured at 1280×900 against a mocked Worker: en 0.11, zh 0.08, ru 0.07 CLS
  (0.24/0.24/0.16 with the story filling a blank at a time; 0.4–1.0 before any of this).
- 2026-11-12: the system-language check lets two sources confirm each other only when they name the same country.
  `sysLangs` now returns each row's own countries (`parts`), and `checks` warns only when the rows share one; rows
  naming different countries are one hint, and the line names only the rows pointing at the country it reports. A
  Chinese font beside Russian voices used to count as two witnesses for China and read "Installed fonts, Speech
  voices look like a system from China" for a visitor in Britain (1ms-shell#107). The nationality guess already
  required a single country.
- 2026-11-12: a DNS resolver in another country is a hint, not a contradiction. It costs 8 points (`warn`) and
  stays `bad` only when another check already says the route is inconsistent: another system opened the connection
  (`c_conn_os`, a proxy in front) or WebRTC gave away an address the page's exit does not have. Reason: there are a
  few hundred public resolvers in the world, so a small country's ordinary visitor resolves through a neighbour's,
  and a visitor in Hungary with the resolver in Germany was told they looked like a proxy and dropped from A+ to B
  (1ms-shell#108). The story's giveaway list (`giveaways`) counts the resolver only with the clock already off, so a
  lone resolver claims nothing and a clock plus a resolver still names both places. The check row and its hints now
  say 解析器 in Chinese, as the glossary asks for a public resolver.
- 2026-11-13: the connection check names the carrier's and a company gateway's TCP proxy too. On a phone the OS
  mismatch is often a carrier (or the Wi-Fi gateway at the office) terminating the connection, not a proxy or VPN
  server of the visitor's own (`c_conn_os`, wording only; the level stays `warn`).
- 2026-11-13: the clock read twice in the browser. `Date.getTimezoneOffset` and the offset `Date.toString` ends with
  are compared with the zone Intl names; agreeing readings add nothing, and one that disagrees means a script rewrites
  the clock, so the tz check says the browser contradicts itself (`c_tz_self`, `bad`) whatever the address's zone is.
  That case gets its own fix tip (`tip_tz_self`): the system-settings one the other tz tips give cannot fix a
  rewritten Date.
- 2026-11-13: `navigator.connection` is read like the rest of navigator. An anti-detect browser describes a phone's
  network on a machine that has none, so the tamper check now asks whether `connection` and its getters are the
  browser's own, and whether the values are ones the API can produce: `type` and `effectiveType` only from the spec's
  lists, and in Chromium `rtt` in its 25 ms steps (`tp_conn`). Not judged from the values themselves: the browser's
  own `rtt` is an estimate with a deliberately conservative bias, so it can sit far above the measured round trip
  without anyone rewriting it, and a claim built on it would be wrong often.
- 2026-11-13: the resolver is looked up twice. A second random name right after the first; when the two answers come
  from resolvers in two countries the dns check says the route varies from request to request (`c_dns_rot`, `warn`)
  instead of naming one country — a proxy pool whose nodes resolve for themselves, or a DoH endpoint that moved. The
  same country twice changes nothing, and the row's hover shows the second answer when it differs at all.
- 2026-11-13: `npm run touch` measures every control the visitor can tap at 390 px in every language, plus the topic
  pages in Chinese, against WCAG 2.2's minimum of 24 by 24 CSS px; a text run set to display: inline is exempt, as
  the rule exempts a link in a sentence. It found the local-fonts button one pixel short (`pa-go`, 23 px tall), which
  now has a 24 px minimum height.
- 2026-11-13: the public resolver's name follows the shared glossary in every language: en said "DNS server" in
  the story, Chinese said 服务器/伺服器 in the row label, the story and the country checklist while its checks said
  解析器, and ja, ko, es, fr, de, pt and ru said their DNS-server word everywhere. The reading, the checks, the story
  sentence, the checklist and the dns-leak page's visible copy now use the glossary's word (DNS resolver ·
  解析器 · DNS リゾルバー · DNS 리졸버 · resolvedor DNS · résolveur DNS · DNS-Resolver · DNS-резолвер). The page's
  `seo_*` fields keep the word people search for, and a name server (ip-api's own) stays a サーバー / server.
- 2026-11-13: the comparison card says when it is probably the same machine. The audit's idea was to compare the
  hardware ID, but a shared link deliberately carries no fingerprint (no `hw`, no `fp`; the smoke test checks it), so
  the card uses what the link does carry: the same screen and the same system with a different browser, worded as a
  possibility ("if these are your own two browsers…"). A friend's identical laptop matches the same way, which is why
  the sentence does not claim it.
- 2026-11-13: the row-level 「Check this again」 now covers the protocol rows too: the post-quantum, ECH and WARP
  verdicts re-read the edge's trace, so switching a proxy and re-checking shows the new answer without a reload. The
  rows that rest on what the page read as it loaded (the request's headers, the environment's fingerprints, the
  browser's own choice of HTTP/3) needed a reload, and offered no button. (The row-level button was dropped the same
  day — the owner: not worth a control; see the entry below.)
- 2026-11-13: a paragraph is never held taller than its words. Each paragraph used to be pinned at the height it had
  while its blanks waited — a line or so more than the filled text — so filling moved nothing under it, and the pin
  stayed after the run: on a wide screen that leftover was blank space under every paragraph, until a resize cleared
  it (the owner's report, with a screenshot). Giving the height back at the end (a 0.3 s settle) only moved the blank
  to the loading state, which the owner rejected too. The pin is gone, and the placeholder is the right size instead:
  the filler was built "a fifth longer than measured", because a longer answer must not push the page down while the
  paragraph had room to spare — with no pin, that fifth is a line of the paragraph's own height given back at every
  fill. `scripts/build.mjs` now measures the filler at the answer's own width, so the waiting paragraph has the filled
  paragraph's height. Measured on zh-CN at 1100 px: the story is 563 px from the first paint to the last, and nothing
  moves at all; ru, de, fr and ja still move by a line or two, an answer being not exactly its measured width. CLS
  measured 2026-11-13 at 1280×900 against a mocked Worker: en 0.19, zh-CN 0.05, ru 0.12 (0.11/0.08/0.07 with the pins):
  the pins did hold the story still, and what they cost in blank lines is what the owner saw. zh-CN, which is what the
  placeholders are measured from most often, came out better than before.
- 2026-11-13: the checks' controls moved out of the name's column into one strip across the row, and a row with
  nothing to do keeps no strip. In the name's narrow column (129 px at 1180) the controls wrapped onto a second line,
  and each row held both lines from the first paint so it would not grow when a fix appeared — which left every fine
  row showing an empty line, the "broken layout" the owner reported (screenshots of rows with a void under the name).
  The strip is one line (怎么改 · the check's own test) and its height goes to zero on a row that has neither. The
  price is the one the earlier design paid the strip's height for: a row grows by that line when a verdict — and with
  it a fix — turns up at the end of a run.
- 2026-11-13: 「反馈」 is an icon, not a word. Spelled out it was on all eighteen rows — the owner called the
  repetition out twice: too many of the same word, and the width it took ("if they stay like that it shows up again
  and again, and wastes the layout"). It is the shell's own flag now, the mark every page's 「报告问题」 carries
  (`src/fragments.js` FLAG in the shell repo; the owner asked for it, 2026-11-13 — a speech bubble of our own would
  be a second mark for one action), drawn at the shell's 1.5 stroke in a 24 px button at the row's right end, muted
  until the row is pointed at. The column is a fixed 24 px and not one that fits each row, or the names and verdicts
  would each start at their own x from row to row — the same misalignment in a different place. It waits for the row
  to be pointed at or focused (`:focus-within`, so the keyboard reaches it — opacity rather than visibility, which
  would take it out of the tab order).
- 2026-11-13: the per-row 「重测」 is gone, and with it its code. The owner, having seen it as an icon, decided the
  re-check of one row is not worth a control ("this feature means little") and asked for it removed completely. What
  it read — `RETEST`, the click handler, the busy arrow, the `re_btn` string in ten languages, `.ck-re`, the flash on
  the row when it finished — is deleted; a re-check is the whole page's now (`重新测试`, which runs everything again).
  `#113` stays fixed: the same stale Resource Timing entry came back on a second run of the whole test.
- 2026-11-13: a `.pa-go` that is a button is a link in everything but the element. base.css gives a button the page's
  font and colour and nothing else, so the browser drew its own control underneath: on a machine set to dark, a grey
  block on the light page carrying the ink's green — 列出全部本地字体 in the fonts row was unreadable (the owner's
  screenshot). `button.pa-go` drops the control's border, background and padding. Those rows also lay the link along
  the value's first line (`align-items: baseline`): given the value's whole height to stretch into, the words hung in
  the middle of a tall column.
- 2026-11-13: the CPU architecture is read against the machine, not only from the browser. A Huawei tablet on
  HarmonyOS 7.0 was reported as x86 (#114, the visitor's own report): ArkWeb copies the user agent's Windows
  compatibility segment into `navigator.platform` ("Win32"), the client hints carried no architecture, and the row
  took what the browser said — beside a Maleoon 920, an ARM card. `armSay` in `infer.mjs` recognizes the combination
  (a machine that is ARM by its system — HarmonyOS, OpenHarmony, Android, iOS — or by its card, and a browser answering
  x86, x64 or Win32), and the row names the card's answer instead: ARM when the renderer names Mali, Maleoon, Adreno,
  Immortalis, Xclipse or PowerVR, and 未知 beside the browser's claim when the card says nothing — "ARM（浏览器报的是
  Win32，与这台设备不符）". The system alone never claims ARM: an x86 Android emulator exists, so the card decides.
  The tamper check keeps its HarmonyOS exemption on purpose: every HarmonyOS browser reports Win32, so counting that
  as a contradiction would mark a whole system as tampered; the arch row is where the contradiction is said.
- 2026-11-13: on a phone the verdict goes under the name, across the icon's column too. Three columns beside the dot
  left the name 74 px at 390: UA 和真实系统 broke into three lines and the rows came out anywhere from 44 to 129 px
  tall, each a different shape. Name on the first line with the icon at its right, verdict on the next line
  across the rest of the width: two heights only, 65 px for a fine row and 82 or more for one with a fix. The verdict
  gives up the height it keeps for a second line on a phone (`min-height: 0`, it is not clamped there anyway): that
  line was blank under every short verdict. Nothing above moves when a row below the fold grows — the checks are
  under the first screen on a phone.

## Wording

The sentences beside the readings follow these rules (the reports in `1ms-shell` #102, #103 each broke one):

- A measurement is reported as measured; a meaning drawn from it names what it rests on. "The clock is set to
  Bangkok's time" is a reading; "you are in Thailand" is not.
- Two sources that disagree are never merged into one place. The clock's country, the resolver's and the browser
  language's are named separately; they become one name only when they agree.
- A check with more than one possible cause says so in the help (a proxy, the network, security software), and the
  label keeps the neutral name of the measurement ("rule-based splitting", not "a proxy").
- One weak signal is a hint, not a finding: a nationality from the clock alone says it is a guess; system-language
  fonts alone may have come with Office.
- The portrait's prose carries no inline basis annotations ("(by IP)"): the source lives on hover or tap and in the
  reading's own row, where a reader who wants it looks.

## Tested, and why not

- Private-window detection and disk size from the storage quota: Chrome 156 reports a fixed 10 GB quota in a normal
  window and an incognito one alike (measured 2026-11-06).
- :visited history sniffing: Chrome partitions visited links per site.
- Local port scans (localhost services): Chrome's local network access prompt; nothing may prompt on load.
- Opening apps by URL scheme (scheme flooding): pops dialogs.
- Detecting logins on other sites: it requests other sites on the visitor's behalf, and breaks as they change.
- A Windows laptop's brand and model: no web API gives it; only laptop or not (battery, GPU).
- iPhone models: Apple builds several on one screen, so the screen, the pixel ratio and the iOS version narrow it to a
  short list; refresh rate doesn't help (Safari caps requestAnimationFrame at 60 by default), nor does the GPU name.
- A link inside the IP row moved the row after the first paint (CLS 0.01): links go where the markup has room from
  the start.
- Third-party cookies (whether a cross-site frame may keep one) need a second registrable domain to frame from: a
  subdomain of the site's own is the same site.

## Not yet verified

- Built-in AI: in a fresh Chrome profile every translation pair reads "downloadable"; whether a Chrome that has
  downloaded languages reads them "available", or Chrome masks them, is still to see.

## Layout shifts measured and left (2026-11-05/06, measured again 2026-11-12)

Fixed on 2026-11-12: the Cyrillic font swapping in on ru (optional + preload), the portrait filling in (heights kept,
one frame a paragraph), and the blocks that appeared when a run ended (the checks' buttons, the verdict, the
anti-detect card). Smoke at 1280×900: en 0.11, zh 0.08, ru 0.07.

Changed on 2026-11-13: the kept heights are gone (the gap they left was worse than the move they saved), and the
placeholder is measured at the answer's width instead, so most paragraphs hold their height from the first paint
(zh-CN measured: no movement). The checks' rows now grow by one line when a verdict and its fix turn up — the strip
they used to reserve for that was the empty line the owner reported.

What is left is text filling inside boxes that already have their size: a paragraph's own words rewrapping as it
fills, the checks' verdicts, the values in the readings list. Removing that would mean not filling after the first
paint at all — the whole story filled once at the end of a run measured 0.07–0.08 — which gives up the "fills in as
you are read" the page is built on. Keeping the progressive fill was the owner's call on 2026-11-12 (the other
option measured under the 0.1 gate but left the story a skeleton until the run ended; fixed-width slots were tried
and rejected: long answers wrap into a column inside the prose).

- The stats pill wraps to two lines on phones in fr, de, es, pt, ru, ja and pushes the title down 12 px (fr phone CLS
  about 0.23 in production).

## Upkeep

- A new iPhone or iPad screen size (usually each September) needs a row in src/models.mjs; until then the page says
  it can't name the model, never a wrong one.
- `npm run models` monthly (Android model names); `npm run tz` when the tz database changes.
- `src/wasm.mjs` is wasm-feature-detect 1.10.0's fixtures (Apache-2.0; the notice is in the file). A new WebAssembly
  feature worth probing is copied from that package's release, modules only, and the count in the row follows.
- MobileModels is CC BY-NC-SA 4.0 (non-commercial, share-alike): public/assets/m/ carries that license; a commercial
  deployment has to drop it from scripts/models.mjs and keep Google Play's list only.
- `/api/tor` reads the Tor Project's bulk exit list (IPv4 only) and holds it an hour; if that URL moves, the row says
  it couldn't check rather than answering, and the list stays on the Worker.
- The ad-profile card follows OpenRTB's bid-request names (`src/app.js`, `adProfile`); a field added upstream is a
  change there and a sentence in its note, nothing else.

## Research (2026-11-04, 2026-11-06)

- BrowserLeaks: IP, JavaScript, WebRTC, Canvas, WebGL, fonts, Geolocation, feature detection, TLS (JA3 / JA4, ECH),
  content filters; experimental: QUIC, TCP/IP (JA4T, MTU, hops), HTTP/2 (Akamai), extension scanner, WebGPU,
  Client Hints, CSS media-query brute force, ClientRects, DNT / GPC.
- CreepJS: WebRTC (codecs, devices), time zone, Intl, headless / like-headless / stealth scores, resistance (privacy,
  security, mode, extension), worker scope, WebGL (image, pixels, params, extensions), screen, canvas, fonts, DOMRect,
  SVGRect, audio (trap values), speech, media types, feature version (JS / CSS / Window), CSS media queries, computed
  style, Math, Error, Window / HTMLElement keys, navigator, status (timer resolution, stack size, storage, memory),
  fuzzy hash.
- BrowserScan: authenticity score, IP blacklist, IP seen count, incognito detection, port scan (22, 3389), kernel
  detection, Client Rects, gyroscope visualizer, HTTP2 / TLS test.
- kuber.studio/cookie: narrative reveal, supercookie stores, sensitive API list, OpenRTB bid request, typing rhythm,
  reading pace.
- AmIUnique, Cover Your Tracks (EFF): uniqueness against a dataset; tracker-blocking test, bits of entropy.
- FP-Agent (arXiv 2605.01247): browser fingerprints barely tell AI browsing agents apart; behavior does (a single
  mousemove straight before each click, pasted or programmatic input, zero-duration scroll jumps).
- Chrome's built-in AI (Translator, LanguageModel, Summarizer): availability() answers without downloading; the
  Language Detector's model is shared, so it leaks at most one bit.

## 2026-11-14 — the frontier pass

Five rows and a wider counter, none of which asks for a permission:

- **`wba` (AI agent signature).** A request can carry Web Bot Auth (RFC 9421): `Signature-Agent` names the operator,
  and a page script cannot fake it because the Worker reads it. Most visitors get "no signature", which is the honest
  answer; an agent that signs shows who runs it. Six user-agent names are recognised beside it (ChatGPT-User,
  Claude-User, Claude-SearchBot, PerplexityBot, Perplexity-User, Operator); a name without a signature says so.
- **`devs` (devices already allowed).** `usb.getDevices()`, `hid.getDevices()` and `serial.getPorts()` list what a
  site was once given, with no prompt. The page never opens a chooser (no `requestDevice`/`requestPort` call), and
  Permissions-Policy is now `usb=(self)` where it was `usb=()`: a device appears only if the visitor granted it to
  this site before.
- **`psb` (Privacy Sandbox).** The ad-targeting interfaces this browser exposes (Topics, Protected Audience, Shared
  Storage, Attribution Reporting). Presence, not state: the sentence says "work in this browser", not "on".
  `document.hasStorageAccess` is left out on purpose — it is standard everywhere now and would make the row answer
  "available" on a browser with no ad interfaces at all.
- **`adsp` (anti-detect tells).** Readings a real browser cannot produce: a phone user agent with 0 touch points, an
  available screen larger than the screen, a zero-size or smaller-than-viewport window, a desktop claiming almost no
  fonts. This is the class the lie check cannot see, because nothing was rewritten — the values are simply impossible
  together. It runs after every reading is in, since it compares them.
- **`exif` (a photo's small print).** A picked JPEG is read in the page (`src/exif.mjs`, `test/exif.test.mjs`):
  camera, software, shutter time, GPS point. The file never leaves the tab; the page has no upload path at all. A
  photo stripped by a social network is a clean result, not an error. JPEG only: HEIC needs a decoder the page
  doesn't carry.
- **Rarity on 13 more rows.** `TRAITS` goes from 14 to 27: arch, cores, memory, refresh rate, engine and its version
  range, keyboard layout, locale, colour scheme, contrast setting, scrollbar width, touch points, form factor. A
  per-attribute share was AmIUnique's one real advantage; the corpus here already existed, so this is the trait list
  and nothing else. Values stay coarse and short, and a tag appears only past `MIN_TOTAL`.

Not done, and why:

- **Third-party cookie / CHIPS / storage partitioning.** The test needs a frame from a second registrable domain
  (`who.1ms.dog` and `1ms.dog` are same-site). `workers_dev` is off and the domain is routed from the 1ms.dog Worker,
  so a second origin is an infrastructure decision, not a code change.
- **DNS-level ad filtering (Pi-hole, AdGuard, NextDNS) and ISP script injection.** The first has no signal the
  tracker test does not already give (a filtered resolver fails the same requests); the second needs a pinned hash of
  a third-party file, which changes with every CDN release and would cry wolf.

## 2026-11-14 — the cross-site row (`xsite`)

The row the frontier pass left out, built once the owner put a second registrable domain in place. `1ms.dog` and
`who.1ms.dog` are the same site; a frame from either answers nothing about third-party storage.

- **The origin.** `cross.1ms.one`: a proxied `AAAA 100::` record and a Workers route (`cross.1ms.one/*`) to the `who`
  script, in the owner's own zone. Not a `workers.dev` subdomain (off everywhere here), not another Worker: the same
  script, told by hostname. `src/worker.js` hands that host to `framePage` (`src/frame.mjs`) and nothing else; every
  other path on the site's own host is unchanged. Universal SSL already covers `*.1ms.one`.
- **The frame** (`/f`, and `/` for anyone who types the host in): writes a `SameSite=None; Secure` cookie, a second
  one with `Partitioned` (CHIPS), and a localStorage tag, reads each back, and posts the three booleans to its parent.
  `Max-Age=30`, no identifier in either cookie, `default-src 'none'`, no request of any kind — it can't leak what it
  is asked to store. Framable by `https://*.1ms.dog` alone.
- **The row** asks when clicked, never on its own, and its value is the verdict, not the three booleans: a plain
  third-party cookie that survives means *another site can recognise you here*; one that fails while `Partitioned`
  succeeds means *blocked, but CHIPS still writes* (the browser's own replacement); both failing is *blocked*. The
  three readings sit in the row's tooltip. No answer in 8 s (offline, an extension, a network that drops the host)
  says so rather than guessing.
- **What it can't do.** Without a popup it cannot compare a first-party seed against the third-party copy, so it
  names the mechanism that survived rather than proving a partition boundary. A popup would have to be a user-gesture
  window whose `opener` reaches back — and this site sends `Cross-Origin-Opener-Policy: same-origin`, which severs
  exactly that. Trading COOP for one row wasn't worth it.
- **Cost:** one CSP source (`frame-src`), one Workers route and DNS record in the `1ms.one` zone, one row, one module
  and one test (`test/frame.test.mjs`), 11 strings × 10 languages.

// The topic pages: the same tool with one check in front, each with its own title, description, H1, body text and
// questions in every language, at /<lang>/<page>/. The build gives each page its URLs, sitemap entries, hreflang and
// link preview; the page script fills the focus panel from the same sniffers as the main page.
//   rows   the sniffer rows the focus panel shows
//   check  the disguise check whose verdict heads it
//   go     what to link to when the host announces it: "dns" DNS Test, "egress" EgressLens
//   needs  the sniffers the page runs, beside the local ones every check rests on (the language, the clock, the system
//          and the browser): only these, not the main page's whole set (src/app.js run())
export const PAGES = {
  fingerprint: { rows: ["fpid", "canvas", "webgl", "audio", "fontfp", "rand", "traces"], check: "fp", needs: ["gpu", "fonts", "prints", "traces"] },
  "dns-leak": { rows: ["dns", "ip", "ex_cn", "ex_intl", "stack"], check: "dns", go: "dns", needs: ["server", "dns", "exits", "stack"] },
  "webrtc-leak": { rows: ["webrtc", "lan", "ip", "stack"], check: "webrtc", go: "egress", needs: ["server", "webrtc", "stack"] },
  "browser-check": { rows: ["engine", "browser", "h_ua", "h_lang", "langs", "tz", "fonts"], check: "tamper", needs: ["server", "fonts"] },
  "timezone-check": { rows: ["tz", "tzip", "hour", "geo", "clock"], check: "tz", needs: ["server"] },
  "proxy-check": { rows: ["edge", "ip", "isp", "dns", "webrtc"], check: "rtt", go: "egress", needs: ["server", "rtt", "dns", "webrtc"] },
  "language-check": { rows: ["langs", "h_lang", "locale", "kbd", "voices", "fonts"], check: "lang", needs: ["server", "kbd", "voices", "fonts"] },
  "canvas-fingerprint": { rows: ["canvas", "webgl", "audio", "rand", "fpid"], check: "fp", needs: ["gpu", "fonts", "prints"] },
  "user-agent": { rows: ["h_ua", "os", "browser", "h_chua", "h_plat", "engine"], check: "ua", needs: ["server", "gpu"] },
  "extensions": { rows: ["ext", "adblock", "engine", "h_ua"], check: "tamper", needs: ["server", "ext", "adblock"] },
  "anti-detect-browser": { rows: ["engver", "worker", "h_ua", "browser", "gpu", "tz"], check: "fpb", needs: ["server", "gpu", "engver", "worker"] },
  "icloud-private-relay": { rows: ["ip", "isp", "geo", "webrtc", "ex_intl"], check: "dc", needs: ["server", "webrtc", "exits"] },
  "warp-check": { rows: ["warp", "ip", "isp", "edge", "kex"], check: "warp", needs: ["server", "trace"] },
  "http3-ech": { rows: ["proto", "kex", "tlsfp", "edge"], check: "ech", needs: ["server", "http3", "trace"] },
  "ai-agent": { rows: ["auto", "agent", "webdriver", "h_ua", "engine"], check: "bot", needs: ["server", "agent"] },
  "client-hints": { rows: ["ch", "h_chua", "h_plat", "form", "arch", "model", "os", "browser"], check: "tamper", needs: ["server", "ch"] },
  "vpn-leak": { rows: ["ip", "isp", "tor", "dns", "webrtc", "lan", "v6mac", "stack"], check: "dns", go: "egress", needs: ["server", "dns", "webrtc", "stack", "tor"] },
  webgpu: { rows: ["webgpu", "gpulim", "gpu", "glx", "fpid"], check: "fp", needs: ["gpu", "webgpu", "fonts", "prints"] },
  // everyone counted, not the visitor: its panel is filled from /api/stats
  stats: { rows: [], stats: true },
};

// per page, per language: seo_title, seo_desc, seo_kw, h1, og_sub, intro (the body text above the result),
// focus_h (the result's heading) and docs (the page's own questions)
export const TEXT = {
  fingerprint: {
    en: {
      seo_title: "Browser Fingerprint Test: can sites track you without cookies? · Who Are You",
      seo_desc: "Free browser fingerprint test: see your canvas, WebGL, audio and font fingerprints and the combined ID any site can work out without cookies, whether your browser scrambles it, and whether this site recognized you since your last visit. No IP is kept, only anonymous counts of how common each value is.",
      seo_kw: "browser fingerprint test, browser fingerprinting, canvas fingerprint, WebGL fingerprint, audio fingerprint, fingerprint checker, anti-fingerprinting, am I trackable",
      h1: "Browser fingerprint test", og_sub: "The ID any site can work out for you, without cookies",
      intro: "Sites don't need cookies to recognize you. The way your system draws text and shapes, processes sound and which fonts it has add up to an ID that stays the same across sites, private windows and VPNs. Here is yours, what it's made of, and whether your browser scrambles it.",
      focus_h: "Your fingerprint",
      docs: [
        ["What is a browser fingerprint?", "A set of small differences between computers: how the graphics card and driver draw a canvas or a WebGL scene, how the audio system rounds a sound, which fonts are installed, plus your screen, language and time zone. Each one alone is common; together they're often unique. A site combines them into one ID, and every site that runs the same script gets the same ID for you."],
        ["Does a VPN or a private window change it?", "No. None of it depends on your IP address, and private windows draw and play sound the same way. That's why a fingerprint can follow you after you clear cookies or switch VPN servers. The ID card on this page remembers your last visit (in your browser only) so you can see it happen."],
        ["How do I stop being fingerprinted?", "Use a browser that fights it: Brave adds random noise to canvas, WebGL and audio by default, Firefox has privacy.resistFingerprinting, and Tor Browser makes every user look the same. Extensions that change the user agent or block canvas often make you stand out more, not less. The \"Fingerprint protection\" row shows whether your browser scrambles it."],
        ["Can this test tell how unique I am?", "Roughly, yes. The page counts, anonymously, how many checks had each of your values and your fingerprint ID (its first 8 characters), and shows how many of all the checks on this site matched yours. It keeps no IP and no full fingerprint. The numbers only mean something once enough people have taken the test; until then, the page says the count is still growing."],
      ],
    },
    "zh-CN": {
      seo_title: "浏览器指纹检测：不用 Cookie，网站也能认出你吗？ · 你是谁",
      seo_desc: "免费浏览器指纹检测：看看你的 Canvas、WebGL、音频和字体指纹，以及网站不用 Cookie 就能算出的指纹 ID；你的浏览器有没有打乱它，上次来过之后有没有被认出来。检测在你的浏览器里进行，不存 IP，只累计匿名计数，用来告诉你有多少人和你一样。",
      seo_kw: "浏览器指纹检测, 浏览器指纹, Canvas 指纹, WebGL 指纹, 音频指纹, 指纹浏览器检测, 防指纹, 指纹追踪",
      h1: "浏览器指纹检测", og_sub: "不用 Cookie，网站也能给你算出一个 ID",
      intro: "网站不用 Cookie 也能认出你。你的系统怎么画文字和图形、怎么处理声音、装了哪些字体，合起来就是一个 ID：换网站、开无痕、开 VPN 都不变。下面是你的指纹、它由哪几部分组成，以及你的浏览器有没有把它打乱。",
      focus_h: "你的指纹",
      docs: [
        ["浏览器指纹是什么？", "是电脑和电脑之间的细微差别：显卡和驱动画 Canvas、WebGL 的结果，处理声音时的取整误差，装了哪些字体，再加上屏幕、语言和时区。单看每一项都很普通，合在一起往往就独一无二。网站把它们算成一串固定的编码，也就是指纹 ID；跑同一段脚本的网站，算出来的你都是同一个 ID。"],
        ["开 VPN 或无痕窗口，指纹会变吗？", "不会。这些都和 IP 无关，无痕窗口画图、放声音的方式也和平时一样。所以清了 Cookie、换了 VPN 节点，指纹照样跟着你。页面上的指纹卡会记住你上次来访（只记在你的浏览器里），下次再来就能看到它还认不认得你。"],
        ["怎样防止被指纹追踪？", "换一个会对抗指纹的浏览器：Brave 默认给 Canvas、WebGL 和音频加随机干扰；Firefox 可以打开 privacy.resistFingerprinting；Tor 浏览器让所有用户看起来一模一样。改 UA、屏蔽 Canvas 的扩展反而常常让你更特别。「防指纹」那一行会告诉你，你的浏览器有没有打乱指纹。"],
        ["能看出我有多独特吗？", "能，大致能。页面会匿名统计你的每一项值、以及整个指纹 ID（只取前 8 位）在本站检测里出现过多少次，再告诉你所有检测里有多少次和你一样。不存 IP，也不存完整指纹。测的人足够多，这些数字才有意义；在那之前，页面会提示数据还在积累。"],
      ],
    },
    "zh-TW": {
      seo_title: "瀏覽器指紋檢測：不用 Cookie，網站也認得出你嗎？ · 你是誰",
      seo_desc: "免費瀏覽器指紋檢測：看看你的 Canvas、WebGL、音訊和字型指紋，以及網站不用 Cookie 就能算出的指紋 ID；你的瀏覽器有沒有把它打亂，上次來過之後有沒有被認出來。檢測在你的瀏覽器裡進行，不存 IP，只累計匿名計數，用來告訴你有多少人和你一樣。",
      seo_kw: "瀏覽器指紋檢測, 瀏覽器指紋, Canvas 指紋, WebGL 指紋, 音訊指紋, 指紋瀏覽器, 防指紋, 指紋追蹤",
      h1: "瀏覽器指紋檢測", og_sub: "不用 Cookie，網站也能替你算出一個 ID",
      intro: "網站不用 Cookie 也認得出你。你的系統怎麼畫文字和圖形、怎麼處理聲音、裝了哪些字型，合起來就是一個 ID：換網站、開無痕、開 VPN 都不會變。下面是你的指紋、它由哪幾部分組成，以及你的瀏覽器有沒有把它打亂。",
      focus_h: "你的指紋",
      docs: [
        ["瀏覽器指紋是什麼？", "是電腦和電腦之間的細微差異：顯示卡和驅動程式畫 Canvas、WebGL 的結果，處理聲音時的捨入誤差，裝了哪些字型，再加上螢幕、語言和時區。單看每一項都很普通，合在一起往往就獨一無二。網站把它們算成一串固定的編碼，也就是指紋 ID；執行同一段腳本的網站，算出來的你都是同一個 ID。"],
        ["開 VPN 或無痕視窗，指紋會變嗎？", "不會。這些都和 IP 無關，無痕視窗畫圖、播放聲音的方式也和平常一樣。所以清了 Cookie、換了 VPN 伺服器，指紋照樣跟著你。頁面上的指紋卡會記住你上次造訪（只記在你的瀏覽器裡），下次再來就能看到它還認不認得你。"],
        ["怎麼避免被指紋追蹤？", "改用會對抗指紋的瀏覽器：Brave 預設會替 Canvas、WebGL 和音訊加入隨機干擾；Firefox 可以開啟 privacy.resistFingerprinting；Tor 瀏覽器讓所有使用者看起來一模一樣。改 UA、封鎖 Canvas 的擴充功能反而常讓你更好認。「防指紋」那一列會告訴你，你的瀏覽器有沒有打亂指紋。"],
        ["看得出我有多獨特嗎？", "可以，大致看得出。頁面會匿名統計你的每一項值，以及整個指紋 ID（只取前 8 碼）在本站檢測裡出現過幾次，再告訴你所有檢測裡有多少次和你一樣。不存 IP，也不存完整指紋。測的人夠多，這些數字才有意義；在那之前，頁面會提示資料還在累積。"],
      ],
    },
    ja: {
      seo_title: "ブラウザフィンガープリント検査：Cookie なしで追跡される？ · あなたは誰",
      seo_desc: "無料のブラウザフィンガープリント検査：Canvas・WebGL・オーディオ・フォントのフィンガープリントと、どのサイトでも Cookie なしで割り出せる総合 ID を表示。ブラウザがそれをかき混ぜているか、前回の訪問から見分けられたかも分かります。IP は保存せず、残すのはそれぞれの値がどれだけありふれているかの匿名の集計だけです。",
      seo_kw: "ブラウザフィンガープリント, フィンガープリント 確認, Canvas フィンガープリント, WebGL フィンガープリント, オーディオ フィンガープリント, 追跡 防止, アンチフィンガープリント",
      h1: "ブラウザフィンガープリント検査", og_sub: "Cookie がなくても、サイトはあなたの ID を割り出せる",
      intro: "サイトは Cookie がなくてもあなたを見分けられます。文字や図形の描き方、音の処理、入っているフォントを合わせると 1 つの ID になり、サイトを変えても、プライベートウィンドウでも、VPN を使っても変わりません。あなたの ID とその中身、ブラウザがそれをかき混ぜているかを示します。",
      focus_h: "あなたのフィンガープリント",
      docs: [
        ["ブラウザフィンガープリントとは何ですか？", "端末ごとの小さな違いの集まりです。GPU とドライバーによる Canvas や WebGL の描画結果、音声処理の丸め方、インストール済みのフォント、それに画面・言語・タイムゾーン。一つひとつはありふれていても、合わせると唯一になることがよくあります。サイトはこれをまとめて 1 つの ID にします。同じスクリプトを使うサイトなら、どこでもあなたに同じ ID が付きます。"],
        ["VPN やプライベートウィンドウで変わりますか？", "変わりません。どれも IP とは関係がなく、プライベートウィンドウでも描画や音の処理は同じだからです。そのため、Cookie を消しても VPN のサーバーを変えても、フィンガープリントで追いかけられます。このページの ID カードは前回の訪問を（ブラウザの中にだけ）覚えているので、実際に確かめられます。"],
        ["フィンガープリントによる追跡を防ぐには？", "対策機能のあるブラウザを使いましょう。Brave は標準で Canvas・WebGL・オーディオにノイズを加え、Firefox には privacy.resistFingerprinting があり、Tor Browser は利用者全員を同じに見せます。UA を変えたり Canvas をブロックしたりする拡張機能は、かえって目立つことがよくあります。かき混ぜられているかは「フィンガープリント対策」の行で分かります。"],
        ["自分がどれくらい珍しいか分かりますか？", "おおよそ分かります。ページは、あなたの各値とフィンガープリント ID（先頭 8 文字）がこのサイトの検査で何回出たかを匿名で数え、全検査のうち何回が同じだったかを示します。IP や完全なフィンガープリントは保存しません。十分な人数が検査するまでは数字に意味がないので、それまでは「集計中」と表示します。"],
      ],
    },
    ko: {
      seo_title: "브라우저 지문 검사: 쿠키 없이도 나를 알아볼까? · 당신은 누구",
      seo_desc: "무료 브라우저 지문 검사: Canvas, WebGL, 오디오, 글꼴 지문과, 어느 사이트든 쿠키 없이 계산할 수 있는 종합 지문 ID를 보여 줘요. 브라우저가 지문을 무작위로 섞는지, 지난 방문 이후 나를 알아봤는지도 확인해요. IP와 원본 데이터는 저장하지 않고, 얼마나 흔한지 알려 주는 익명 집계만 남겨요.",
      seo_kw: "브라우저 지문 검사, 브라우저 핑거프린팅, 캔버스 지문, WebGL 지문, 오디오 지문, 지문 검사, 핑거프린팅 방지, 추적 방지",
      h1: "브라우저 지문 검사", og_sub: "쿠키 없이도 사이트가 계산하는 내 ID",
      intro: "사이트는 쿠키가 없어도 나를 알아볼 수 있어요. 시스템이 글자와 도형을 그리는 방식, 소리를 처리하는 방식, 설치된 글꼴을 합치면 하나의 ID가 되고, 이 ID는 사이트를 바꿔도, 시크릿 창에서도, VPN을 켜도 그대로예요. 내 ID와 그 구성, 그리고 브라우저가 이를 뒤섞는지 보여 드려요.",
      focus_h: "내 지문",
      docs: [
        ["브라우저 지문이 뭔가요?", "컴퓨터마다 조금씩 다른 점들의 묶음이에요. 그래픽 카드와 드라이버가 Canvas나 WebGL 장면을 그린 결과, 오디오 처리 과정의 반올림, 설치된 글꼴, 여기에 화면, 언어, 시간대까지요. 하나하나는 흔해도 합치면 유일한 경우가 많아요. 사이트는 이것을 고정된 코드(해시)로 만들어 ID로 쓰고, 같은 스크립트를 쓰는 사이트는 모두 나에게서 같은 ID를 얻어요."],
        ["VPN이나 시크릿 창을 쓰면 바뀌나요?", "아니요. 모두 IP와 상관없고, 시크릿 창도 그림을 그리고 소리를 내는 방식은 같아요. 그래서 쿠키를 지우거나 VPN 서버를 바꿔도 지문은 따라와요. 이 페이지의 ID 카드는 지난 방문을 이 브라우저 안에만 기억해 두고, 이번에 알아봤는지 보여 줘요."],
        ["지문 추적을 막으려면 어떻게 하나요?", "지문 추적에 맞서는 브라우저를 쓰세요. Brave는 기본으로 Canvas, WebGL, 오디오에 무작위 잡음을 섞고, Firefox에는 privacy.resistFingerprinting이 있으며, Tor 브라우저는 모든 사용자를 똑같아 보이게 해요. UA를 바꾸거나 Canvas를 막는 확장 프로그램은 오히려 더 눈에 띄게 만들 때가 많아요. 내 브라우저가 지문을 섞는지는 '지문 보호' 줄에서 볼 수 있어요."],
        ["내 지문이 얼마나 독특한지 알 수 있나요?", "대략 알 수 있어요. 페이지는 내 값 하나하나와 지문 ID 전체(앞 8자리)가 이 사이트의 검사에서 몇 번 나왔는지 익명으로 세고, 전체 검사 중 몇 번이 나와 같았는지 보여 줘요. IP와 전체 지문은 저장하지 않아요. 검사한 사람이 충분히 많아야 숫자가 의미가 있어서, 그 전에는 아직 집계 중이라고 표시해요."],
      ],
    },
    es: {
      seo_title: "Test de huella del navegador: ¿te rastrean sin cookies? · ¿Quién eres?",
      seo_desc: "Test gratuito de huella del navegador: tus huellas canvas, WebGL, de audio y de fuentes, y el ID combinado que cualquier web puede calcular sin cookies. Comprueba si tu navegador lo mezcla y si te reconoció desde tu última visita. No guarda tu IP ni los datos en bruto, solo recuentos anónimos para saber lo común que eres.",
      seo_kw: "test huella digital navegador, browser fingerprint, huella canvas, huella WebGL, huella de audio, fingerprinting, anti fingerprinting, rastreo sin cookies",
      h1: "Test de huella del navegador", og_sub: "El ID que cualquier web calcula para ti, sin cookies",
      intro: "Las webs no necesitan cookies para reconocerte. Cómo dibuja tu sistema el texto y las formas, cómo procesa el sonido y qué fuentes tiene se suman en un ID que no cambia entre webs, en ventanas privadas ni con VPN. Aquí tienes el tuyo, de qué está hecho y si tu navegador lo mezcla.",
      focus_h: "Tu huella",
      docs: [
        ["¿Qué es la huella del navegador?", "Un conjunto de pequeñas diferencias entre equipos: cómo la tarjeta gráfica y su controlador dibujan un canvas o una escena WebGL, cómo se redondea el audio, qué fuentes hay instaladas, más la pantalla, el idioma y la zona horaria. Cada dato por separado es común; juntos suelen ser únicos. Una web los convierte en un código fijo (un hash) que usa como ID, y todas las webs que usan el mismo script obtienen el mismo ID tuyo."],
        ["¿La cambia una VPN o una ventana privada?", "No. Nada de eso depende de tu IP, y una ventana privada dibuja y reproduce sonido igual. Por eso la huella te sigue aunque borres las cookies o cambies de servidor VPN. La tarjeta de ID de esta página recuerda tu última visita (solo en tu navegador) para demostrarlo."],
        ["¿Cómo evito que me rastreen por la huella?", "Usa un navegador que lo combata: Brave añade ruido aleatorio a canvas, WebGL y audio por defecto; Firefox tiene privacy.resistFingerprinting; Tor Browser hace que todos parezcan iguales. Las extensiones que cambian el user agent o bloquean el canvas suelen hacerte más reconocible, no menos. La fila «Protección de huella» te dice si tu navegador la mezcla."],
        ["¿Puede decirme lo único que soy?", "Sí, de forma aproximada. La página cuenta, de forma anónima, en cuántas pruebas de este sitio apareció cada uno de tus valores y tu ID de huella completo (sus 8 primeros caracteres), y te muestra cuántas coincidieron con la tuya. No guarda tu IP ni la huella completa. Los números solo dicen algo cuando ya ha hecho el test suficiente gente; hasta entonces, la página indica que el recuento aún se está formando."],
      ],
    },
    fr: {
      seo_title: "Test d’empreinte du navigateur : un site peut-il vous suivre sans cookies ? · Qui êtes-vous ?",
      seo_desc: "Test gratuit d’empreinte du navigateur : vos empreintes canvas, WebGL, audio et polices, et l’ID combiné que n’importe quel site calcule sans cookies. Vous voyez aussi si votre navigateur le brouille et s’il vous a reconnu depuis votre dernière visite. Aucune IP ni donnée brute n’est gardée, seulement des compteurs anonymes.",
      seo_kw: "test empreinte navigateur, empreinte digitale navigateur, browser fingerprint, empreinte canvas, empreinte WebGL, empreinte audio, anti fingerprinting, pistage sans cookies",
      h1: "Test d’empreinte du navigateur", og_sub: "L’ID que tout site calcule pour vous, sans cookies",
      intro: "Un site n’a pas besoin de cookies pour vous reconnaître. La façon dont votre système dessine le texte et les formes, traite le son, et les polices qu’il contient suffisent à former un ID. Il reste le même d’un site à l’autre, en navigation privée et derrière un VPN. Voici le vôtre, ce qui le compose, et si votre navigateur le brouille.",
      focus_h: "Votre empreinte",
      docs: [
        ["Qu’est-ce qu’une empreinte de navigateur ?", "Un ensemble de petites différences entre appareils : la façon dont la carte graphique et son pilote dessinent un canvas ou une scène WebGL, la manière dont le son est arrondi, les polices installées, plus l’écran, la langue et le fuseau horaire. Chaque détail pris seul est banal ; ensemble, ils sont souvent uniques. Un site les combine en un code fixe qui sert d’ID, et tous les sites qui utilisent le même script obtiennent le même ID pour vous."],
        ["Un VPN ou la navigation privée la changent-ils ?", "Non. Rien de tout cela ne dépend de votre adresse IP, et une fenêtre privée dessine et traite le son exactement de la même façon. C’est pour cela qu’une empreinte vous suit même après avoir effacé vos cookies ou changé de serveur VPN. La carte d’ID de cette page garde le souvenir de votre dernière visite (dans votre navigateur uniquement) pour vous le montrer."],
        ["Comment éviter d’être suivi par empreinte ?", "Prenez un navigateur qui s’en défend : Brave ajoute par défaut un bruit aléatoire au canvas, au WebGL et à l’audio ; Firefox propose privacy.resistFingerprinting ; Tor Browser fait que tous ses utilisateurs se ressemblent. Les extensions qui changent le user agent ou bloquent le canvas vous rendent souvent plus repérable, pas moins. La ligne « Protection anti-empreinte » indique si votre navigateur brouille l’empreinte."],
        ["Le test peut-il dire à quel point je suis unique ?", "Oui, à peu près. La page compte, de façon anonyme, combien de tests avaient chacune de vos valeurs et votre ID d’empreinte (ses 8 premiers caractères), puis montre combien de tests sur ce site correspondaient au vôtre. Elle ne garde ni votre IP ni votre empreinte complète. Ces chiffres n’ont de sens qu’une fois assez de personnes testées ; d’ici là, la page indique que le comptage est en cours."],
      ],
    },
    de: {
      seo_title: "Browser-Fingerprint-Test: Können Websites dich ohne Cookies verfolgen? · Wer bist du?",
      seo_desc: "Kostenloser Browser-Fingerprint-Test: deine Canvas-, WebGL-, Audio- und Schriften-Fingerabdrücke und die Gesamt-ID, die jede Website ohne Cookies berechnen kann. Dazu siehst du, ob dein Browser sie verwürfelt und ob du seit deinem letzten Besuch wiedererkannt wurdest. IP und Rohdaten werden nicht gespeichert, nur anonyme Zähler.",
      seo_kw: "Browser Fingerprint Test, Browser-Fingerabdruck, Canvas Fingerprint, WebGL Fingerprint, Audio Fingerprint, Fingerprinting verhindern, Tracking ohne Cookies",
      h1: "Browser-Fingerprint-Test", og_sub: "Die ID, die jede Website ohne Cookies für dich berechnet",
      intro: "Websites brauchen keine Cookies, um dich wiederzuerkennen. Wie dein System Text und Formen zeichnet, wie es Ton verarbeitet und welche Schriften es hat, ergibt zusammen eine ID. Sie bleibt gleich, egal auf welcher Website, im privaten Fenster und hinter einem VPN. Hier siehst du deine, woraus sie besteht und ob dein Browser sie verwürfelt.",
      focus_h: "Dein Fingerabdruck",
      docs: [
        ["Was ist ein Browser-Fingerabdruck?", "Eine Reihe kleiner Unterschiede zwischen Geräten: wie Grafikkarte und Treiber ein Canvas oder eine WebGL-Szene zeichnen, wie die Audioverarbeitung Töne rundet, welche Schriften installiert sind, dazu Bildschirm, Sprache und Zeitzone. Jedes Detail für sich ist alltäglich, zusammen sind sie oft einmalig. Eine Website rechnet daraus einen festen Code als ID, und jede Website mit demselben Skript bekommt für dich dieselbe ID."],
        ["Ändern ein VPN oder ein privates Fenster ihn?", "Nein. Nichts davon hängt von deiner IP-Adresse ab, und ein privates Fenster zeichnet und spielt Ton genauso ab. Deshalb folgt dir ein Fingerabdruck auch, wenn du Cookies löschst oder den VPN-Server wechselst. Die ID-Karte auf dieser Seite merkt sich deinen letzten Besuch (nur in deinem Browser), damit du das selbst siehst."],
        ["Wie schütze ich mich vor Fingerprinting?", "Nimm einen Browser, der sich dagegen wehrt: Brave verrauscht Canvas, WebGL und Audio standardmäßig; Firefox hat privacy.resistFingerprinting; der Tor Browser lässt alle Nutzer gleich aussehen. Erweiterungen, die den User-Agent ändern oder Canvas blockieren, machen dich oft auffälliger statt unauffälliger. Die Zeile „Fingerabdruckschutz“ zeigt, ob dein Browser verwürfelt."],
        ["Kann der Test sagen, wie einmalig ich bin?", "Ja, ungefähr. Die Seite zählt anonym, wie viele Checks jeden deiner Werte und deine Fingerabdruck-ID (ihre ersten 8 Zeichen) hatten, und zeigt, wie viele Checks auf dieser Website zu deinem passten. Sie speichert weder deine IP noch den vollständigen Fingerabdruck. Aussagekräftig werden die Zahlen erst, wenn genug Leute getestet haben; bis dahin steht dort, dass die Zählung noch läuft."],
      ],
    },
    pt: {
      seo_title: "Teste de impressão digital do navegador: dá para te rastrear sem cookies? · Quem é você?",
      seo_desc: "Teste grátis de impressão digital do navegador: suas impressões canvas, WebGL, de áudio e de fontes, e o ID combinado que qualquer site consegue calcular sem cookies. Veja se o seu navegador embaralha esse ID e se ele te reconheceu desde a última visita. Não guarda seu IP nem os dados brutos, só contagens anônimas para dizer quão comum você é.",
      seo_kw: "teste impressão digital navegador, browser fingerprint, fingerprint canvas, fingerprint WebGL, fingerprint de áudio, anti fingerprinting, rastreamento sem cookies",
      h1: "Teste de impressão digital do navegador", og_sub: "O ID que qualquer site calcula para você, sem cookies",
      intro: "Os sites não precisam de cookies para te reconhecer. O jeito como seu sistema desenha texto e formas, processa som e quais fontes ele tem somam um ID que não muda entre sites, em janela anônima nem com VPN. Aqui está o seu, do que ele é feito e se o seu navegador o embaralha.",
      focus_h: "Sua impressão digital",
      docs: [
        ["O que é a impressão digital do navegador?", "Um conjunto de pequenas diferenças entre computadores: como a placa de vídeo e o driver desenham um canvas ou uma cena WebGL, como o áudio é arredondado, quais fontes estão instaladas, mais tela, idioma e fuso horário. Cada item sozinho é comum; juntos, costumam ser únicos. Um site transforma tudo isso num código fixo (um hash) e usa como ID, e todo site que roda o mesmo script obtém o mesmo ID seu."],
        ["VPN ou janela anônima mudam a impressão?", "Não. Nada disso depende do seu IP, e uma janela anônima desenha e toca som do mesmo jeito. Por isso a impressão continua te seguindo mesmo depois de apagar os cookies ou trocar de servidor VPN. O cartão do ID nesta página lembra sua última visita (só no seu navegador) para mostrar isso."],
        ["Como evitar o rastreamento pela impressão digital?", "Use um navegador que combata isso: o Brave adiciona ruído aleatório a canvas, WebGL e áudio por padrão; o Firefox tem privacy.resistFingerprinting; o Tor Browser faz todo mundo parecer igual. Extensões que trocam o user agent ou bloqueiam o canvas costumam te deixar mais fácil de identificar, não menos. A linha \"Proteção da impressão\" mostra se o seu navegador embaralha."],
        ["O teste diz quão única é a minha impressão?", "Sim, mais ou menos. A página conta, de forma anônima, em quantos testes deste site apareceu cada um dos seus valores e o seu ID de impressão completo (os 8 primeiros caracteres), e mostra quantos bateram com o seu. Não guarda IP nem a impressão completa. Os números só dizem algo quando gente suficiente já fez o teste; até lá, a página avisa que a contagem ainda está se formando."],
      ],
    },
    ru: {
      seo_title: "Проверка отпечатка браузера: могут ли сайты следить за вами без cookie? · Кто вы?",
      seo_desc: "Бесплатная проверка отпечатка браузера: отпечатки canvas, WebGL, аудио и шрифтов и общий ID, который любой сайт вычисляет без cookie. Вы также увидите, перемешивает ли его браузер и узнали ли вас с прошлого визита. IP и исходные данные не сохраняются — только анонимные счётчики.",
      seo_kw: "проверка отпечатка браузера, отпечаток браузера, browser fingerprint, canvas fingerprint, WebGL отпечаток, аудио отпечаток, защита от фингерпринтинга, слежка без cookie",
      h1: "Проверка отпечатка браузера", og_sub: "ID, который любой сайт вычисляет для вас без cookie",
      intro: "Сайтам не нужны cookie, чтобы вас узнать. То, как ваша система рисует текст и фигуры, обрабатывает звук, и какие в ней шрифты, складывается в ID. Он не меняется ни на другом сайте, ни в режиме инкогнито, ни через VPN. Здесь — ваш ID, из чего он состоит и перемешивает ли его ваш браузер.",
      focus_h: "Ваш отпечаток",
      docs: [
        ["Что такое отпечаток браузера?", "Набор мелких различий между устройствами: как видеокарта и драйвер рисуют canvas или сцену WebGL, как округляется звук, какие установлены шрифты, плюс экран, язык и часовой пояс. По отдельности всё это обычно, вместе — часто уникально. Сайт сводит это в постоянный код, который служит ID, и каждый сайт с тем же скриптом получает для вас один и тот же ID."],
        ["Меняют ли его VPN или режим инкогнито?", "Нет. Ничто из этого не зависит от IP-адреса, а окно инкогнито рисует и обрабатывает звук точно так же. Поэтому отпечаток следует за вами, даже если вы очистили cookie или сменили VPN-сервер. Карточка ID на этой странице помнит прошлый визит (только в вашем браузере), чтобы вы увидели это сами."],
        ["Как защититься от слежки по отпечатку?", "Возьмите браузер, который с этим борется: Brave по умолчанию добавляет случайный шум в canvas, WebGL и аудио; в Firefox есть privacy.resistFingerprinting; Tor Browser делает всех пользователей одинаковыми. Расширения, которые меняют User-Agent или блокируют canvas, часто делают вас только заметнее. Строка «Защита от отпечатков» показывает, перемешивает ли отпечаток ваш браузер."],
        ["Покажет ли тест, насколько я уникален?", "Примерно — да. Страница анонимно считает, сколько проверок было с каждым вашим значением и с вашим ID отпечатка (его первыми 8 символами), и показывает, сколько проверок на сайте совпало с вашей. Ни IP, ни полный отпечаток не сохраняются. Числа имеют смысл, только когда тест прошло достаточно людей; до тех пор страница пишет, что данные ещё накапливаются."],
      ],
    },
  },
  "dns-leak": {
    en: {
      seo_title: "DNS Leak Test: does your DNS go around your VPN? · Who Are You",
      seo_desc: "Free DNS leak test: find the DNS resolver that actually looks up sites for you, see its country and network, and compare it with the IP sites see. If they don't match, your VPN or proxy leaks DNS. Includes fixes for Clash, V2Ray and the browser.",
      seo_kw: "DNS leak test, DNS leak, VPN DNS leak, which DNS server am I using, DNS resolver test, Clash DNS leak, fake-ip, proxy DNS leak",
      h1: "DNS leak test", og_sub: "Does your DNS go around your VPN?",
      intro: "Your VPN may carry your traffic while your DNS lookups still go to your own internet provider. Whoever runs those servers can then see where you really are. This test looks up a name nobody has asked for before and asks the name server who asked: that's your resolver. You'll see its country and network next to the address sites see.",
      focus_h: "Your DNS resolver",
      docs: [
        ["What is a DNS leak?", "Before your browser connects to a site, a DNS resolver turns the site's name into an address. If that lookup skips the VPN or proxy, it goes to your internet provider's resolver. Your provider then sees every site you visit, and sites that compare your resolver with your IP can tell you're using a VPN and where you actually are."],
        ["How does this test find my resolver?", "The page looks up a random name under edns.ip-api.com that has never been asked for, so no cache can answer. Your resolver has to ask ip-api's name server, which reports the resolver's address and network, plus your client subnet if the resolver passes it along (ECS). The test then compares the resolver's country with your IP's."],
        ["How do I fix a DNS leak?", "Clash / Mihomo: turn on its DNS with enhanced-mode fake-ip, or use TUN mode so every lookup goes through it. V2Ray / Xray clients: route DNS through the proxy (or set a DoH server that goes through it). In the browser, Secure DNS (DoH) also keeps lookups away from your provider. Then run this test again."],
        ["My resolver is Cloudflare or Google in another city. Is that a leak?", "Usually not. Public resolvers like 1.1.1.1 and 8.8.8.8 answer from the data center nearest the request, so the city can differ from your VPN exit. What gives you away is a resolver run by your home internet provider, or one in your home country while your IP is abroad."],
      ],
    },
    "zh-CN": {
      seo_title: "DNS 泄露检测：你的 DNS 有没有绕过 VPN？ · 你是谁",
      seo_desc: "免费 DNS 泄露检测：找出真正替你解析网址的 DNS 服务器，看它在哪个国家、属于哪家运营商，再和网站看到的 IP 对比。两边对不上，就是 VPN 或代理漏了 DNS。附 Clash、V2Ray 和浏览器里的修复方法。",
      seo_kw: "DNS 泄露检测, DNS 泄漏, VPN DNS 泄露, 查看我的 DNS 服务器, DNS 解析器检测, Clash DNS 泄露, fake-ip, 代理 DNS 泄露",
      h1: "DNS 泄露检测", og_sub: "你的 DNS 有没有绕过 VPN？",
      intro: "VPN 帮你转发了流量，DNS 查询却可能还发给本地运营商，等于告诉别人你真正在哪。这个检测会去查一个从没人查过的域名，再问负责这个域名的服务器：是谁来查的。这样就知道了你用的 DNS 解析器是哪台、在哪个国家、属于哪家运营商，再拿它和网站看到的 IP 对比。",
      focus_h: "你的 DNS 解析器",
      docs: [
        ["什么是 DNS 泄露？", "浏览器连网站之前，要先让 DNS 解析器把网址换成 IP 地址。如果这一步没走 VPN 或代理，查询就发给了本地运营商的 DNS 解析器。结果是：运营商能看到你访问的每个网站；网站把 DNS 解析器和你的 IP 一对比，也能看出你在用 VPN，以及你实际在哪。"],
        ["这个检测怎么找到我的 DNS 解析器？", "页面会去查 edns.ip-api.com 下面一个随机的、从没人查过的域名。没有缓存能直接回答，你的 DNS 解析器只能去问 ip-api 负责这个域名的服务器，于是 ip-api 就知道了它的地址和运营商；如果查询里带上了你所在的网段（ECS），也会一起报出来。检测再拿 DNS 解析器所在的国家和你 IP 的国家比较。"],
        ["DNS 泄露怎么修？", "Clash / Mihomo：打开 DNS，把 enhanced-mode 设成 fake-ip，或者开 TUN 模式，让所有查询都经过它。V2Ray / Xray 客户端：让 DNS 也走代理（或者设一个走代理的 DoH 服务器）。浏览器里打开「安全 DNS」（DoH，加密的 DNS）也能让查询绕开运营商。改完再测一次。"],
        ["显示的 DNS 解析器是 Cloudflare 或 Google，但城市不一样，算泄露吗？", "一般不算。1.1.1.1、8.8.8.8 这类公共 DNS 由离请求最近的机房来回答，所以城市可能和 VPN 出口不同。真正会暴露你的，是本地运营商的 DNS 解析器，或者 IP 在国外、DNS 解析器却在国内。"],
      ],
    },
    "zh-TW": {
      seo_title: "DNS 外洩檢測：你的 DNS 有沒有繞過 VPN？ · 你是誰",
      seo_desc: "免費 DNS 外洩檢測：找出真正幫你解析網址的 DNS 伺服器，看它在哪個國家、屬於哪家電信業者，再和網站看到的 IP 比對。兩邊對不上，就是 VPN 或代理漏掉了 DNS。附 Clash、V2Ray 和瀏覽器的修正方法。",
      seo_kw: "DNS 外洩檢測, DNS 洩漏, VPN DNS 外洩, 查詢我的 DNS 伺服器, DNS 解析器檢測, Clash DNS 外洩, fake-ip, 代理 DNS 外洩",
      h1: "DNS 外洩檢測", og_sub: "你的 DNS 有沒有繞過 VPN？",
      intro: "VPN 幫你轉送了流量，DNS 查詢卻可能還是送到當地電信業者，等於告訴別人你真正在哪裡。這個檢測會去查一個從來沒人查過的網域，再問負責這個網域的伺服器：是誰來查的。這樣就知道你用的 DNS 解析器是哪一台、在哪個國家、屬於哪家電信業者，再拿它和網站看到的 IP 比對。",
      focus_h: "你的 DNS 解析器",
      docs: [
        ["什麼是 DNS 外洩？", "瀏覽器連到網站之前，要先請 DNS 解析器把網址換成 IP 位址。如果這一步沒走 VPN 或代理，查詢就會送到當地電信業者的 DNS 解析器。結果是：電信業者看得到你造訪的每個網站；網站把 DNS 解析器和你的 IP 一比對，也看得出你在用 VPN，以及你實際在哪裡。"],
        ["這個檢測怎麼找到我的 DNS 解析器？", "頁面會去查 edns.ip-api.com 底下一個隨機、從來沒人查過的網域。沒有快取能直接回答，你的 DNS 解析器只能去問 ip-api 負責這個網域的伺服器，於是 ip-api 就知道了它的位址和電信業者；如果查詢裡附上了你所在的網段（ECS），也會一併回報。檢測再拿 DNS 解析器所在的國家和你 IP 的國家比較。"],
        ["DNS 外洩怎麼修？", "Clash / Mihomo：開啟 DNS，把 enhanced-mode 設成 fake-ip，或開啟 TUN 模式，讓所有查詢都經過它。V2Ray / Xray 用戶端：讓 DNS 也走代理（或設定一台走代理的 DoH 伺服器）。在瀏覽器開啟「安全 DNS」（DoH，加密的 DNS）也能讓查詢避開電信業者。改完再測一次。"],
        ["顯示的 DNS 解析器是 Cloudflare 或 Google，但城市不一樣，算外洩嗎？", "通常不算。1.1.1.1、8.8.8.8 這類公共 DNS 會由離請求最近的機房回應，所以城市可能和 VPN 出口不同。真正會讓你露餡的，是當地電信業者的 DNS 解析器，或是 IP 在國外、DNS 解析器卻在國內。"],
      ],
    },
    ja: {
      seo_title: "DNS リークテスト：DNS が VPN を素通りしていない？ · あなたは誰",
      seo_desc: "無料の DNS リークテスト：実際にサイト名を調べている DNS サーバーを見つけ、その国とネットワークを、サイトから見える IP と比べます。食い違っていれば、VPN やプロキシから DNS が漏れています。Clash、V2Ray、ブラウザでの直し方付き。",
      seo_kw: "DNS リーク テスト, DNS 漏れ, VPN DNS リーク, 使っている DNS サーバー 確認, DNS サーバー 確認, Clash DNS 漏れ, fake-ip",
      h1: "DNS リークテスト", og_sub: "DNS が VPN を素通りしていませんか？",
      intro: "VPN が通信を運んでいても、DNS の問い合わせだけは手元のプロバイダーに出ていることがあります。そうなると、DNS リゾルバーを運営する側にあなたの本当の居場所が分かります。このテストは誰も問い合わせたことのない名前を引き、ネームサーバーに「誰が問い合わせてきたか」を聞きます。それがあなたの DNS リゾルバーです。その国とネットワークを、サイトから見えるアドレスと並べて示します。",
      focus_h: "あなたの DNS リゾルバー",
      docs: [
        ["DNS リークとは何ですか？", "ブラウザがサイトにつなぐ前に、DNS リゾルバーがサイト名をアドレスに変換します。この問い合わせが VPN やプロキシを通らないと、手元のプロバイダーの DNS リゾルバーに届きます。するとプロバイダーには訪れたサイトがすべて見え、DNS リゾルバーと IP を比べるサイトには、VPN を使っていることと本当の居場所が分かってしまいます。"],
        ["どうやって DNS リゾルバーを見つけるのですか？", "ページは edns.ip-api.com の下にある、誰も問い合わせたことのないランダムな名前を引きます。キャッシュでは答えられないので、あなたの DNS リゾルバーは ip-api のネームサーバーに聞くしかありません。ネームサーバーはその DNS リゾルバーのアドレスとネットワーク、さらに DNS リゾルバーが付けていればクライアントのサブネット（ECS）を報告します。テストはその国と IP の国を比べます。"],
        ["DNS リークはどう直しますか？", "Clash / Mihomo：DNS を有効にして enhanced-mode を fake-ip にするか、TUN モードですべての問い合わせを通します。V2Ray / Xray：DNS もプロキシ経由にします（プロキシを通る DoH サーバーを設定）。ブラウザの「セキュア DNS」（DoH）でも、プロバイダーへの問い合わせを避けられます。直したら、もう一度テストしてください。"],
        ["DNS リゾルバーが別の都市の Cloudflare や Google です。これは漏れ？", "たいていは違います。1.1.1.1 や 8.8.8.8 のような公開 DNS は問い合わせにいちばん近いデータセンターから答えるので、都市が VPN の出口と違うことがあります。正体がばれるのは、自宅のプロバイダーの DNS リゾルバーが使われている場合や、IP は海外なのに DNS リゾルバーが自国にある場合です。"],
      ],
    },
    ko: {
      seo_title: "DNS 유출 테스트: DNS가 VPN을 우회하고 있나요? · 당신은 누구",
      seo_desc: "무료 DNS 유출 테스트: 실제로 사이트 주소를 찾아 주는 DNS 서버와 그 국가, 네트워크를 찾아서 사이트가 보는 IP와 비교해요. 둘이 다르면 VPN이나 프록시에서 DNS가 새고 있는 거예요. Clash, V2Ray, 브라우저에서 고치는 방법도 알려 드려요.",
      seo_kw: "DNS 유출 테스트, DNS 누수, VPN DNS 유출, 내 DNS 서버 확인, DNS 서버 테스트, Clash DNS 유출, fake-ip, 프록시 DNS 유출",
      h1: "DNS 유출 테스트", og_sub: "DNS가 VPN을 우회하고 있나요?",
      intro: "VPN이 트래픽은 맡아 주는데, 사이트 주소를 찾는 DNS 조회는 여전히 원래 통신사로 가고 있을 수 있어요. 그러면 DNS를 운영하는 쪽에 실제 위치를 알려 주는 셈이에요. 이 테스트는 아무도 조회한 적 없는 주소를 조회한 뒤, 누가 물어 왔는지 확인해요. 그렇게 찾은 DNS 리졸버와 그 국가, 네트워크를 사이트가 보는 주소와 비교해요.",
      focus_h: "내 DNS 리졸버",
      docs: [
        ["DNS 유출이 뭔가요?", "브라우저가 사이트에 접속하기 전에, DNS 리졸버가 사이트 이름을 주소로 바꿔 줘요. 이 조회가 VPN이나 프록시를 거치지 않으면 내 통신사의 DNS 리졸버로 가요. 그러면 통신사는 내가 방문하는 사이트를 모두 볼 수 있고, DNS 리졸버와 IP를 비교하는 사이트는 VPN을 쓴다는 것과 실제 위치까지 알 수 있어요."],
        ["이 테스트는 내 DNS 리졸버를 어떻게 찾나요?", "페이지는 edns.ip-api.com 아래에서 한 번도 조회된 적 없는 무작위 이름을 조회해요. 캐시에 답이 없으니 내 DNS 리졸버는 ip-api의 네임서버에 직접 물어야 하고, 그 네임서버가 DNS 리졸버의 주소와 네트워크를 알려 줘요. DNS 리졸버가 내 서브넷 정보(ECS)를 함께 보내면 그것도 알려 줘요. 테스트는 DNS 리졸버의 국가를 내 IP의 국가와 비교해요."],
        ["DNS 유출은 어떻게 고치나요?", "Clash / Mihomo: DNS를 켜고 enhanced-mode를 fake-ip로 하거나, TUN 모드를 켜서 모든 조회가 거치게 하세요. V2Ray / Xray 클라이언트: DNS도 프록시로 보내세요(또는 프록시를 거치는 DoH 서버를 설정하세요). 브라우저의 보안 DNS(DoH)를 켜도 조회가 통신사로 가지 않아요. 바꾼 뒤 이 테스트를 다시 해 보세요."],
        ["DNS 리졸버가 다른 도시의 Cloudflare나 Google로 나와요. 유출인가요?", "대개 아니에요. 1.1.1.1, 8.8.8.8 같은 공용 DNS는 요청과 가장 가까운 데이터센터에서 답하기 때문에, 도시가 VPN 출구와 다를 수 있어요. 문제가 되는 건 집 통신사가 운영하는 DNS 리졸버이거나, IP는 해외인데 DNS 리졸버는 내 나라에 있는 경우예요."],
      ],
    },
    es: {
      seo_title: "Test de fuga de DNS: ¿tu DNS se salta la VPN? · ¿Quién eres?",
      seo_desc: "Test gratuito de fuga de DNS: encuentra el servidor DNS que de verdad busca las webs por ti, su país y su red, y compáralo con la IP que ven las webs. Si no coinciden, tu VPN o proxy filtra el DNS. Incluye cómo arreglarlo en Clash, V2Ray y el navegador.",
      seo_kw: "test fuga DNS, fuga de DNS, DNS leak test, fuga DNS VPN, qué servidor DNS uso, test servidor DNS, fuga DNS Clash, fake-ip",
      h1: "Test de fuga de DNS", og_sub: "¿Tu DNS se salta la VPN?",
      intro: "Puede que tu VPN lleve tu tráfico mientras tus consultas DNS siguen yendo a tu proveedor de siempre, y eso le dice a quien gestiona esos servidores dónde estás realmente. Este test hace una consulta que nadie ha hecho antes y le pregunta al servidor de nombres quién la hizo: tu resolvedor DNS, su país y su red, comparados con la dirección que ven las webs.",
      focus_h: "Tu resolvedor DNS",
      docs: [
        ["¿Qué es una fuga de DNS?", "Antes de conectarse a una web, tu navegador le pide a un resolvedor DNS que convierta el nombre en una dirección. Si esa consulta se salta la VPN o el proxy, va al resolvedor DNS de tu proveedor: tu proveedor ve cada web que visitas, y las webs que comparan tu resolvedor DNS con tu IP pueden saber que usas una VPN y dónde estás de verdad."],
        ["¿Cómo encuentra el test mi resolvedor DNS?", "La página consulta un nombre aleatorio bajo edns.ip-api.com que nadie ha pedido nunca, así que ninguna caché puede responder: tu resolvedor DNS tiene que preguntar al servidor de nombres de ip-api, que informa de la dirección y la red de tu resolvedor DNS, y también de tu subred si tu servidor la transmite (ECS). El test compara el país de tu resolvedor DNS con el de tu IP."],
        ["¿Cómo arreglo una fuga de DNS?", "Clash / Mihomo: activa su DNS con enhanced-mode en fake-ip, o usa el modo TUN para que todas las consultas pasen por él. Clientes V2Ray / Xray: manda el DNS por el proxy (o configura un servidor DoH que pase por él). En el navegador, el DNS seguro (DoH) también aparta las consultas de tu proveedor. Después, repite este test."],
        ["Mi resolvedor DNS es Cloudflare o Google en otra ciudad. ¿Es una fuga?", "Normalmente no. Los DNS públicos como 1.1.1.1 y 8.8.8.8 responden desde el centro de datos más cercano a la consulta, así que la ciudad puede no coincidir con la salida de tu VPN. Lo que te delata es un resolvedor DNS de tu proveedor de casa, o uno en tu país cuando tu IP está en el extranjero."],
      ],
    },
    fr: {
      seo_title: "Test de fuite DNS : votre DNS passe-t-il à côté du VPN ? · Qui êtes-vous ?",
      seo_desc: "Test gratuit de fuite DNS : trouvez le serveur DNS qui cherche réellement l’adresse des sites pour vous, son pays et son réseau, et comparez-le à l’IP que voient les sites. S’ils ne correspondent pas, votre VPN ou votre proxy laisse fuir le DNS. Avec les corrections pour Clash, V2Ray et le navigateur.",
      seo_kw: "test fuite DNS, fuite DNS, DNS leak test, fuite DNS VPN, quel serveur DNS j’utilise, vérifier serveur DNS, Clash fuite DNS, fake-ip",
      h1: "Test de fuite DNS", og_sub: "Votre DNS passe-t-il à côté du VPN ?",
      intro: "Votre VPN peut transporter votre trafic alors que vos requêtes DNS partent encore chez votre fournisseur d’accès. Celui qui gère ces serveurs voit alors où vous êtes vraiment. Ce test demande une adresse que personne n’a jamais demandée, puis interroge le serveur qui fait autorité sur ce nom pour savoir qui a posé la question : c’est votre résolveur DNS. Vous voyez son pays et son réseau, comparés à l’adresse que voient les sites.",
      focus_h: "Votre résolveur DNS",
      docs: [
        ["Qu’est-ce qu’une fuite DNS ?", "Avant de se connecter à un site, le navigateur demande à un résolveur DNS de transformer le nom du site en adresse. Si cette demande passe à côté du VPN ou du proxy, elle part chez le résolveur DNS de votre fournisseur d’accès : celui-ci voit chaque site que vous visitez. Et un site qui compare votre résolveur DNS à votre IP peut voir que vous utilisez un VPN, et où vous êtes réellement."],
        ["Comment le test trouve-t-il mon résolveur DNS ?", "La page demande un nom aléatoire sous edns.ip-api.com que personne n’a jamais demandé : aucun cache ne connaît la réponse. Votre résolveur DNS doit donc interroger le serveur de noms d’ip-api, qui note l’adresse et le réseau de votre résolveur DNS, ainsi que votre sous-réseau si votre résolveur DNS le transmet (ECS). Le test compare ensuite le pays du résolveur DNS à celui de votre IP."],
        ["Comment corriger une fuite DNS ?", "Clash / Mihomo : activez son DNS avec enhanced-mode en fake-ip, ou passez en mode TUN pour que toutes les requêtes passent par lui. Clients V2Ray / Xray : faites passer le DNS par le proxy (ou configurez un serveur DoH qui passe par lui). Dans le navigateur, le DNS sécurisé (DoH) tient aussi vos requêtes à l’écart du fournisseur d’accès. Puis relancez ce test."],
        ["Mon résolveur DNS est Cloudflare ou Google, mais dans une autre ville. Est-ce une fuite ?", "En général, non. Les DNS publics comme 1.1.1.1 et 8.8.8.8 répondent depuis le centre de données le plus proche de la requête : la ville peut donc différer de la sortie du VPN. Ce qui vous trahit, c’est un résolveur DNS de votre fournisseur d’accès, ou un résolveur DNS situé dans votre pays alors que votre IP est à l’étranger."],
      ],
    },
    de: {
      seo_title: "DNS-Leak-Test: Umgeht dein DNS das VPN? · Wer bist du?",
      seo_desc: "Kostenloser DNS-Leak-Test: Finde den DNS-Server, der die Adressen von Websites wirklich für dich nachschlägt, mit Land und Netz, und vergleiche ihn mit der IP, die Websites sehen. Passen sie nicht zusammen, leckt dein VPN oder Proxy DNS. Mit Lösungen für Clash, V2Ray und den Browser.",
      seo_kw: "DNS Leak Test, DNS-Leck, VPN DNS Leak, welchen DNS-Server nutze ich, DNS-Server prüfen, Clash DNS Leak, fake-ip",
      h1: "DNS-Leak-Test", og_sub: "Umgeht dein DNS das VPN?",
      intro: "Dein VPN leitet vielleicht deinen Verkehr um, während deine DNS-Anfragen weiter bei deinem Provider landen. Wer diese Server betreibt, sieht dann, wo du wirklich bist. Dieser Test fragt nach einem Namen, nach dem noch nie jemand gefragt hat, und erkundigt sich dann beim zuständigen Nameserver, wer gefragt hat: Das ist dein DNS-Resolver. Du siehst sein Land und Netz, verglichen mit der Adresse, die Websites sehen.",
      focus_h: "Dein DNS-Resolver",
      docs: [
        ["Was ist ein DNS-Leck?", "Bevor der Browser eine Website aufruft, übersetzt ein DNS-Resolver den Namen in eine Adresse. Läuft diese Anfrage am VPN oder Proxy vorbei, landet sie beim DNS-Resolver deines Providers: Er sieht jede Website, die du besuchst. Und Websites, die deinen DNS-Resolver mit deiner IP vergleichen, erkennen das VPN und deinen tatsächlichen Standort."],
        ["Wie findet der Test meinen DNS-Resolver?", "Die Seite fragt nach einem zufälligen Namen unter edns.ip-api.com, nach dem noch nie jemand gefragt hat; kein Cache kennt die Antwort. Dein DNS-Resolver muss also den Nameserver von ip-api fragen, und der meldet Adresse und Netz deines DNS-Resolvers, dazu dein Subnetz, falls dein DNS-Resolver es mitschickt (ECS). Der Test vergleicht dann das Land des DNS-Resolvers mit dem deiner IP."],
        ["Wie behebe ich ein DNS-Leck?", "Clash / Mihomo: DNS mit enhanced-mode fake-ip einschalten oder den TUN-Modus nutzen, damit alle Anfragen durch ihn laufen. V2Ray / Xray: DNS ebenfalls über den Proxy schicken (oder einen DoH-Server eintragen, der über ihn läuft). Im Browser hält sicheres DNS (DoH) die Anfragen ebenfalls von deinem Provider fern. Danach den Test wiederholen."],
        ["Mein DNS-Resolver ist Cloudflare oder Google in einer anderen Stadt. Ist das ein Leck?", "Meist nicht. Öffentliche DNS-Resolver wie 1.1.1.1 und 8.8.8.8 antworten aus dem Rechenzentrum, das der Anfrage am nächsten ist; die Stadt kann also vom VPN-Ausgang abweichen. Verräterisch ist ein DNS-Resolver deines eigenen Providers oder einer in deinem Heimatland, während deine IP im Ausland liegt."],
      ],
    },
    pt: {
      seo_title: "Teste de vazamento de DNS: seu DNS está escapando da VPN? · Quem é você?",
      seo_desc: "Teste grátis de vazamento de DNS: descubra o servidor DNS que realmente procura os sites para você, o país e a rede dele, e compare com o IP que os sites veem. Se forem diferentes, sua VPN ou proxy está vazando DNS. Com o passo a passo para corrigir no Clash, no V2Ray e no navegador.",
      seo_kw: "teste vazamento DNS, vazamento de DNS, DNS leak test, vazamento DNS VPN, qual servidor DNS estou usando, teste servidor DNS, vazamento DNS Clash, fake-ip",
      h1: "Teste de vazamento de DNS", og_sub: "Seu DNS está escapando da VPN?",
      intro: "Sua VPN pode estar levando o tráfego enquanto as consultas de DNS continuam indo para a sua operadora, o que conta para quem administra esses servidores onde você realmente está. Este teste faz uma consulta que ninguém fez antes e pergunta ao servidor de nomes quem fez: seu resolvedor DNS, o país e a rede dele, comparados com o endereço que os sites veem.",
      focus_h: "Seu resolvedor DNS",
      docs: [
        ["O que é vazamento de DNS?", "Antes de o navegador se conectar a um site, um resolvedor DNS transforma o nome em endereço. Se essa consulta não passar pela VPN ou pelo proxy, ela vai para o resolvedor DNS da sua operadora: a operadora vê todo site que você visita, e os sites que comparam seu resolvedor DNS com seu IP conseguem saber que você usa VPN e onde você realmente está."],
        ["Como o teste encontra meu resolvedor DNS?", "A página consulta um nome aleatório em edns.ip-api.com que nunca foi pedido, então nenhum cache tem a resposta: seu resolvedor DNS precisa perguntar ao servidor de nomes do ip-api, que informa o endereço e a rede do seu resolvedor DNS, e também a sua sub-rede se o servidor repassar essa informação (ECS). O teste compara o país do resolvedor DNS com o país do seu IP."],
        ["Como corrijo um vazamento de DNS?", "Clash / Mihomo: ative o DNS com enhanced-mode em fake-ip, ou use o modo TUN para toda consulta passar por ele. Clientes V2Ray / Xray: mande o DNS pelo proxy (ou configure um servidor DoH que passe por ele). No navegador, o DNS seguro (DoH) também afasta as consultas da operadora. Depois, faça o teste de novo."],
        ["Meu resolvedor DNS é Cloudflare ou Google em outra cidade. É vazamento?", "Normalmente não. DNS públicos como 1.1.1.1 e 8.8.8.8 respondem a partir do data center mais próximo da consulta, então a cidade pode ser diferente da saída da VPN. O que te entrega é um resolvedor DNS da operadora da sua casa, ou um no seu país enquanto o IP está no exterior."],
      ],
    },
    ru: {
      seo_title: "Проверка утечки DNS: не идёт ли ваш DNS в обход VPN? · Кто вы?",
      seo_desc: "Бесплатная проверка утечки DNS: узнайте, какой DNS-сервер на самом деле ищет для вас адреса сайтов, в какой он стране и сети, и сравните его с IP, который видят сайты. Если они не совпадают, ваш VPN или прокси пропускает DNS мимо себя. С инструкциями для Clash, V2Ray и браузера.",
      seo_kw: "проверка утечки DNS, утечка DNS, DNS leak test, утечка DNS VPN, какой DNS сервер я использую, проверить DNS сервер, Clash утечка DNS, fake-ip",
      h1: "Проверка утечки DNS", og_sub: "Не идёт ли ваш DNS в обход VPN?",
      intro: "VPN может пропускать через себя весь ваш трафик, а DNS-запросы при этом по-прежнему уходят к провайдеру. Тот, кто держит эти серверы, видит, где вы на самом деле. Этот тест запрашивает имя, которое ещё никто не запрашивал, и спрашивает у ответственного за него сервера имён, кто прислал запрос. Это и есть ваш DNS-резолвер: вы увидите его страну и сеть рядом с адресом, который видят сайты.",
      focus_h: "Ваш DNS-резолвер",
      docs: [
        ["Что такое утечка DNS?", "Прежде чем открыть сайт, браузер просит DNS-резолвер превратить имя сайта в адрес. Если этот запрос идёт мимо VPN или прокси, он попадает на DNS-резолвер провайдера: тот видит каждый сайт, который вы открываете. А сайты, которые сравнивают ваш DNS-резолвер с вашим IP, понимают, что вы через VPN, и где вы на самом деле."],
        ["Как тест находит мой DNS-резолвер?", "Страница запрашивает случайное имя в зоне edns.ip-api.com, которое никто раньше не запрашивал, поэтому ни в одном кэше ответа нет. Вашему DNS-резолверу приходится спросить сервер имён ip-api, а тот записывает адрес и сеть вашего DNS-резолвера, а также вашу подсеть, если DNS-резолвер её передаёт (ECS). Затем тест сравнивает страну DNS-резолвера со страной вашего IP."],
        ["Как устранить утечку DNS?", "Clash / Mihomo: включите DNS с enhanced-mode fake-ip или режим TUN, чтобы все запросы шли через него. Клиенты V2Ray / Xray: пустите DNS через прокси (или укажите DoH-сервер, который ходит через него). В браузере безопасный DNS (DoH) тоже уводит запросы от провайдера. Потом пройдите тест ещё раз."],
        ["Мой DNS-резолвер — Cloudflare или Google, но в другом городе. Это утечка?", "Обычно нет. Публичные DNS вроде 1.1.1.1 и 8.8.8.8 отвечают из ближайшего к запросу дата-центра, поэтому город может не совпадать с выходом VPN. Выдаёт вас DNS-резолвер вашего провайдера или DNS-резолвер в вашей стране, когда IP — за границей."],
      ],
    },
  },
  "webrtc-leak": {
    "en": {
      "seo_title": "WebRTC Leak Test: does WebRTC show your real IP? · Who Are You",
      "seo_desc": "Free WebRTC leak test: see the public IPv4 and IPv6 addresses and the local addresses WebRTC hands to any site, compared with the IP your VPN or proxy shows. If they differ, WebRTC leaks your real IP. Includes fixes for Chrome, Firefox, Brave and proxy clients.",
      "seo_kw": "WebRTC leak test, WebRTC leak, WebRTC IP leak, VPN WebRTC leak, check WebRTC, STUN IP leak, local IP leak, disable WebRTC",
      "h1": "WebRTC leak test",
      "og_sub": "Does WebRTC show your real IP?",
      "intro": "Video calls in the browser use WebRTC, and any page can start it without asking. WebRTC asks a STUN server which address you came from, over UDP, and many VPNs and proxies don't carry UDP. Here are the addresses WebRTC gives away, next to the address sites see.",
      "focus_h": "Your WebRTC addresses",
      "docs": [
        [
          "What is a WebRTC leak?",
          "To set up a call, WebRTC collects every address you could be reached at: the local ones on your network card, and the public one a STUN server sees. A page can read them with a few lines of script, no permission needed. If your VPN or proxy carries only the page's web requests, the STUN request goes out over your own connection, and the page learns your real IP behind the VPN."
        ],
        [
          "How does this test work?",
          "The page opens a WebRTC connection to Cloudflare's and Google's STUN servers and lists the addresses they report (\"server reflexive\" candidates). It then compares them with the addresses this site, your other exits and the IPv6 test see. An address none of them show is a leak. The local addresses come from the \"host\" candidates. Nothing is stored or sent anywhere."
        ],
        [
          "How do I fix a WebRTC leak?",
          "Proxy clients (Clash, V2Ray and others): turn on TUN mode so UDP goes through the proxy too. Chrome and Edge: the WebRTC Network Limiter extension, or uBlock Origin's \"Prevent WebRTC from leaking local IP addresses\". Brave: Settings → Privacy → WebRTC IP handling policy → Disable non-proxied UDP. Firefox: in about:config, set media.peerconnection.ice.default_address_only to true, or media.peerconnection.enabled to false to turn WebRTC off. Then run this test again."
        ],
        [
          "Is a local address or a .local name a leak?",
          "A name ending in .local means the browser is hiding your local address (mDNS), which is what you want. A real local address such as 192.168.1.5 doesn't reveal where you are, but it makes your fingerprint more unique. An IPv6 address that differs from your IPv4 exit is a leak only if it isn't your IPv6 exit; the test checks it against the IPv6 address sites see."
        ]
      ]
    },
    "zh-CN": {
      "seo_title": "WebRTC 泄露检测：WebRTC 会暴露你的真实 IP 吗？ · 你是谁",
      "seo_desc": "免费 WebRTC 泄露检测：列出 WebRTC 交给任何网站的公网 IPv4、IPv6 和局域网地址，和 VPN 或代理显示的 IP 对比。对不上，就是 WebRTC 泄露了真实 IP。附 Chrome、Firefox、Brave 和代理客户端的修复方法。",
      "seo_kw": "WebRTC 泄露检测, WebRTC 泄漏检测, WebRTC 泄露, WebRTC IP 泄露, VPN WebRTC 泄漏, WebRTC 检测, 真实 IP 泄露, 关闭 WebRTC, WebRTC leak test",
      "h1": "WebRTC 泄露检测",
      "og_sub": "WebRTC 会不会暴露你的真实 IP？",
      "intro": "浏览器里的视频通话靠的是 WebRTC，任何网页都能直接启动它，不用你同意。它会通过 UDP 去问 STUN 服务器（专门告诉你「外面看到的你是哪个地址」的服务器），而很多 VPN 和代理不转发 UDP。下面是 WebRTC 暴露出来的地址，以及它和网站看到的地址的对比。",
      "focus_h": "你的 WebRTC 地址",
      "docs": [
        [
          "什么是 WebRTC 泄露？",
          "为了接通通话，WebRTC 会收集所有能联系到你的地址：网卡上的局域网地址，以及 STUN 服务器看到的公网地址。网页几行脚本就能读到，不需要任何权限。如果 VPN 或代理只转发网页请求，STUN 请求就会从你自己的线路出去，网页就能拿到 VPN 背后的真实 IP。"
        ],
        [
          "这个检测是怎么做的？",
          "页面向 Cloudflare 和 Google 的 STUN 服务器发起 WebRTC 连接，列出它们报回来的地址（srflx 候选），再和本站、你的其他出口以及 IPv6 测试看到的地址对比。哪个都对不上的地址，就是泄露。局域网地址来自 host 候选。这些地址不会上传，也不会保存。"
        ],
        [
          "WebRTC 泄露怎么修？",
          "代理客户端（Clash、V2Ray 等）：打开 TUN 模式，让 UDP 也走代理。Chrome 和 Edge：装 WebRTC Network Limiter 扩展，或者在 uBlock Origin 里勾选「防止 WebRTC 泄露本地 IP 地址」。Brave：设置 → 隐私 → WebRTC IP 处理策略 → 禁用非代理 UDP。Firefox：在 about:config 把 media.peerconnection.ice.default_address_only 设为 true，或者把 media.peerconnection.enabled 设为 false 彻底关掉。改完再测一次。"
        ],
        [
          "局域网地址或 .local 名字算泄露吗？",
          "以 .local 结尾的名字，说明浏览器把局域网地址藏起来了（mDNS），这正是你想要的。真实的局域网地址（比如 192.168.1.5）暴露不了你在哪，但会让你的指纹更特别。至于和 IPv4 出口不同的 IPv6 地址，只有它不是你的 IPv6 出口时才算泄露：检测会拿它和网站看到的 IPv6 地址比对。"
        ]
      ]
    },
    "zh-TW": {
      "seo_title": "WebRTC 外洩檢測：WebRTC 會暴露你的真實 IP 嗎？ · 你是誰",
      "seo_desc": "免費 WebRTC 外洩檢測：列出 WebRTC 交給任何網站的公開 IPv4、IPv6 和區域網路位址，和 VPN 或代理顯示的 IP 比對。對不上，就是 WebRTC 外洩了真實 IP。附 Chrome、Firefox、Brave 和代理用戶端的修正方法。",
      "seo_kw": "WebRTC 外洩檢測, WebRTC 洩漏檢測, WebRTC 外洩, WebRTC IP 洩漏, VPN WebRTC 外洩, WebRTC 檢測, 真實 IP 外洩, 關閉 WebRTC, WebRTC leak test",
      "h1": "WebRTC 外洩檢測",
      "og_sub": "WebRTC 會不會暴露你的真實 IP？",
      "intro": "瀏覽器裡的視訊通話靠的是 WebRTC，任何網頁都能直接啟動它，不需要你同意。它會透過 UDP 去問 STUN 伺服器（專門告訴你「外面看到的你是哪個位址」的伺服器），而很多 VPN 和代理不轉送 UDP。下面是 WebRTC 暴露出來的位址，以及它和網站看到的位址的比對。",
      "focus_h": "你的 WebRTC 位址",
      "docs": [
        [
          "什麼是 WebRTC 外洩？",
          "為了接通通話，WebRTC 會收集所有聯絡得到你的位址：網路卡上的區域網路位址，以及 STUN 伺服器看到的公開位址。網頁幾行腳本就讀得到，不需要任何權限。如果 VPN 或代理只轉送網頁請求，STUN 請求就會從你自己的線路出去，網頁就能拿到 VPN 背後的真實 IP。"
        ],
        [
          "這個檢測是怎麼做的？",
          "頁面向 Cloudflare 和 Google 的 STUN 伺服器發起 WebRTC 連線，列出它們回報的位址（srflx 候選），再和本站、你的其他出口以及 IPv6 測試看到的位址比對。哪一個都對不上的位址，就是外洩。區域網路位址來自 host 候選。這些位址不會上傳，也不會儲存。"
        ],
        [
          "WebRTC 外洩怎麼修？",
          "代理用戶端（Clash、V2Ray 等）：開啟 TUN 模式，讓 UDP 也走代理。Chrome 和 Edge：安裝 WebRTC Network Limiter 擴充功能，或在 uBlock Origin 勾選「防止 WebRTC 洩漏本機 IP 位址」。Brave：設定 → 隱私權 → WebRTC IP 處理政策 → 停用非代理的 UDP。Firefox：在 about:config 把 media.peerconnection.ice.default_address_only 設為 true，或把 media.peerconnection.enabled 設為 false 完全關掉。改完再測一次。"
        ],
        [
          "區域網路位址或 .local 名稱算外洩嗎？",
          "以 .local 結尾的名稱，代表瀏覽器把區域網路位址藏起來了（mDNS），這正是你要的。真實的區域網路位址（例如 192.168.1.5）透露不了你在哪裡，但會讓你的指紋更好認。至於和 IPv4 出口不同的 IPv6 位址，只有它不是你的 IPv6 出口時才算外洩：檢測會拿它和網站看到的 IPv6 位址比對。"
        ]
      ]
    },
    "ja": {
      "seo_title": "WebRTC リークテスト：WebRTC から本当の IP が漏れていない？ · あなたは誰",
      "seo_desc": "無料の WebRTC リークテスト：WebRTC がどのサイトにも渡してしまう公開 IPv4・IPv6 アドレスとローカルアドレスを一覧にし、VPN やプロキシの IP と比べます。違っていれば、WebRTC から本当の IP が漏れています。Chrome、Firefox、Brave、プロキシのクライアントでの直し方付き。",
      "seo_kw": "WebRTC リークテスト, WebRTC リーク, WebRTC IP 漏れ, VPN WebRTC リーク, WebRTC チェック, ローカル IP 漏洩, WebRTC 無効化, WebRTC leak test",
      "h1": "WebRTC リークテスト",
      "og_sub": "WebRTC から本当の IP が漏れていませんか？",
      "intro": "ブラウザでのビデオ通話には WebRTC が使われ、どのページも許可なしにこれを起動できます。WebRTC は UDP で STUN サーバーに「自分はどのアドレスから来たか」を尋ねますが、UDP を通さない VPN やプロキシは少なくありません。WebRTC が明かすアドレスを、サイトから見えるアドレスと並べて示します。",
      "focus_h": "あなたの WebRTC アドレス",
      "docs": [
        [
          "WebRTC リークとは何ですか？",
          "通話をつなぐため、WebRTC は自分に届く可能性のあるアドレスをすべて集めます。ネットワークカードのローカルアドレスと、STUN サーバーから見た公開アドレスです。ページは数行のスクリプトで、許可なしにそれを読めます。VPN やプロキシがページの通信しか運ばない場合、STUN への問い合わせは自分の回線から直接出ていき、VPN の裏にある本当の IP がページに知られてしまいます。"
        ],
        [
          "このテストはどういう仕組みですか？",
          "ページは Cloudflare と Google の STUN サーバーに WebRTC 接続を開き、返ってきたアドレス（srflx 候補）を一覧にします。それを、このサイト、ほかの出口、IPv6 テストから見えるアドレスと比べます。どれとも一致しないアドレスがあれば、それが漏れです。ローカルアドレスは host 候補から取ります。何も保存せず、どこにも送りません。"
        ],
        [
          "WebRTC リークはどう直しますか？",
          "プロキシのクライアント（Clash、V2Ray など）：TUN モードをオンにして、UDP もプロキシに通します。Chrome と Edge：拡張機能 WebRTC Network Limiter か、uBlock Origin の「WebRTC によるローカル IP アドレスの漏洩を防ぐ」。Brave：設定 → プライバシー → WebRTC IP 処理ポリシー → プロキシ経由でない UDP を無効にする。Firefox：about:config で media.peerconnection.ice.default_address_only を true に、完全に止めるなら media.peerconnection.enabled を false に。変更したら、もう一度テストしてください。"
        ],
        [
          "ローカルアドレスや .local の名前は漏れですか？",
          ".local で終わる名前は、ブラウザがローカルアドレスを隠している（mDNS）しるしで、望ましい状態です。192.168.1.5 のような本物のローカルアドレスは居場所を明かしませんが、フィンガープリントをより珍しくします。IPv4 の出口と違う IPv6 アドレスは、それが自分の IPv6 の出口でない場合だけ漏れです。テストはサイトから見える IPv6 アドレスと照らし合わせます。"
        ]
      ]
    },
    "ko": {
      "seo_title": "WebRTC 유출 테스트: WebRTC가 실제 IP를 드러내나요? · 당신은 누구",
      "seo_desc": "무료 WebRTC 유출 테스트: WebRTC가 어느 사이트에나 넘겨주는 공인 IPv4·IPv6 주소와 내부 주소를, VPN이나 프록시가 보여 주는 IP와 비교해요. 다르면 WebRTC로 실제 IP가 새고 있는 거예요. Chrome, Firefox, Brave, 프록시 클라이언트에서 고치는 방법도 알려 드려요.",
      "seo_kw": "WebRTC 유출 테스트, WebRTC 누출, WebRTC IP 유출, VPN WebRTC 유출, WebRTC 확인, STUN IP 유출, 로컬 IP 유출, WebRTC 끄기",
      "h1": "WebRTC 유출 테스트",
      "og_sub": "WebRTC가 실제 IP를 드러내나요?",
      "intro": "브라우저 영상 통화는 WebRTC를 쓰고, 어느 페이지든 묻지 않고 WebRTC를 켤 수 있어요. WebRTC는 UDP로 STUN 서버에 '내가 어느 주소에서 왔는지' 물어보는데, UDP를 전달하지 않는 VPN과 프록시가 많아요. WebRTC가 드러내는 주소를 사이트가 보는 주소와 나란히 보여 드려요.",
      "focus_h": "내 WebRTC 주소",
      "docs": [
        [
          "WebRTC 유출이 뭔가요?",
          "통화를 연결하려고 WebRTC는 나에게 닿을 수 있는 주소를 모두 모아요. 네트워크 카드의 내부 주소와, STUN 서버가 본 공인 주소예요. 페이지는 스크립트 몇 줄로 권한 없이 이 주소들을 읽어요. VPN이나 프록시가 페이지의 웹 요청만 맡으면 STUN 요청은 원래 회선으로 나가고, 페이지는 VPN 뒤에 숨은 실제 IP를 알게 돼요."
        ],
        [
          "이 테스트는 어떻게 작동하나요?",
          "페이지는 Cloudflare와 Google의 STUN 서버에 WebRTC 연결을 열고, 돌려받은 주소('server reflexive' 후보)를 이 사이트, 다른 출구, IPv6 테스트가 보는 주소와 비교해요. 어디에도 나오지 않는 주소가 있으면 유출이에요. 내부 주소는 'host' 후보에서 나와요. 아무것도 저장하거나 어디로 보내지 않아요."
        ],
        [
          "WebRTC 유출은 어떻게 고치나요?",
          "프록시 클라이언트(Clash, V2Ray 등): TUN 모드를 켜서 UDP도 프록시로 보내세요. Chrome과 Edge: WebRTC Network Limiter 확장 프로그램을 쓰거나, uBlock Origin의 'WebRTC가 로컬 IP 주소를 유출하지 않도록 방지'를 켜세요. Brave: 설정 → 개인정보 보호 → WebRTC IP 처리 정책 → 프록시되지 않은 UDP 사용 중지. Firefox: about:config에서 media.peerconnection.ice.default_address_only를 true로 바꾸거나, WebRTC를 완전히 끄려면 media.peerconnection.enabled를 false로 바꾸세요. 그다음 이 테스트를 다시 해 보세요."
        ],
        [
          "내부 주소나 .local 이름도 유출인가요?",
          ".local로 끝나는 이름은 브라우저가 내부 주소를 숨긴 것(mDNS)이라, 바람직한 상태예요. 192.168.1.5 같은 실제 내부 주소는 위치를 드러내지는 않지만 지문을 더 독특하게 만들어요. IPv4 출구와 다른 IPv6 주소는 그게 내 IPv6 출구가 아닐 때만 유출이에요. 테스트는 사이트가 보는 IPv6 주소와 맞춰 봐요."
        ]
      ]
    },
    "es": {
      "seo_title": "Test de fuga WebRTC: ¿WebRTC muestra tu IP real? · ¿Quién eres?",
      "seo_desc": "Test gratuito de fuga WebRTC: las direcciones IPv4 e IPv6 públicas y las direcciones locales que WebRTC entrega a cualquier web, comparadas con la IP que muestra tu VPN o proxy. Si no coinciden, WebRTC filtra tu IP real. Incluye cómo arreglarlo en Chrome, Firefox, Brave y clientes proxy.",
      "seo_kw": "test fuga WebRTC, fuga WebRTC, WebRTC leak test, fuga IP WebRTC, fuga WebRTC VPN, comprobar WebRTC, fuga IP STUN, desactivar WebRTC",
      "h1": "Test de fuga WebRTC",
      "og_sub": "¿WebRTC muestra tu IP real?",
      "intro": "Las videollamadas en el navegador usan WebRTC, y cualquier página puede ponerlo en marcha sin preguntarte. WebRTC le pregunta a un servidor STUN desde qué dirección llegas, por UDP, y muchas VPN y proxies no transportan UDP. Aquí tienes las direcciones que WebRTC revela, comparadas con la que ven las webs.",
      "focus_h": "Tus direcciones WebRTC",
      "docs": [
        [
          "¿Qué es una fuga de WebRTC?",
          "Para montar una llamada, WebRTC reúne todas las direcciones en las que se te podría localizar: las locales de tu tarjeta de red y la pública que ve un servidor STUN. Una página las lee con unas pocas líneas de código, sin pedir permiso. Si tu VPN o proxy solo lleva las peticiones web de la página, la petición STUN sale por tu propia conexión, y la página descubre tu IP real detrás de la VPN."
        ],
        [
          "¿Cómo funciona este test?",
          "La página abre una conexión WebRTC con los servidores STUN de Cloudflare y Google y anota las direcciones que devuelven (candidatos «server reflexive»). Luego las compara con la dirección que ven este sitio, tus otras salidas y el test de IPv6. Una dirección que no aparece en ninguno de ellos es una fuga. Las direcciones locales salen de los candidatos «host»; no se guarda ni se envía nada."
        ],
        [
          "¿Cómo arreglo una fuga de WebRTC?",
          "Clientes proxy (Clash, V2Ray y otros): activa el modo TUN para que UDP también pase por el proxy. Chrome y Edge: la extensión WebRTC Network Limiter, o la opción de uBlock Origin «Impedir que WebRTC filtre direcciones IP locales». Brave: Configuración → Privacidad → Política de gestión de IP de WebRTC → Desactivar UDP sin proxy. Firefox: en about:config, pon media.peerconnection.ice.default_address_only en true, o media.peerconnection.enabled en false para desactivar WebRTC. Después, repite este test."
        ],
        [
          "¿Una dirección local o un nombre .local es una fuga?",
          "Un nombre que termina en .local es el navegador ocultando tu dirección local (mDNS), que es justo lo que quieres. Una dirección local real como 192.168.1.5 no revela dónde estás, pero hace tu huella más reconocible. Una IPv6 distinta de tu salida IPv4 solo es una fuga si no es tu salida IPv6: el test la compara con la dirección IPv6 que ven las webs."
        ]
      ]
    },
    "fr": {
      "seo_title": "Test de fuite WebRTC : WebRTC révèle-t-il votre vraie IP ? · Qui êtes-vous ?",
      "seo_desc": "Test gratuit de fuite WebRTC : les adresses IPv4 et IPv6 publiques et les adresses locales que WebRTC donne à n’importe quel site, comparées à l’IP qu’affiche votre VPN ou votre proxy. Si elles diffèrent, WebRTC laisse fuir votre vraie IP. Avec les corrections pour Chrome, Firefox, Brave et les clients proxy.",
      "seo_kw": "test fuite WebRTC, fuite WebRTC, fuite IP WebRTC, WebRTC leak test, fuite WebRTC VPN, vérifier WebRTC, désactiver WebRTC, fuite IP locale",
      "h1": "Test de fuite WebRTC",
      "og_sub": "WebRTC révèle-t-il votre vraie IP ?",
      "intro": "Les appels vidéo dans le navigateur passent par WebRTC, et n’importe quelle page peut le lancer sans vous demander votre avis. WebRTC demande à un serveur STUN depuis quelle adresse vous arrivez, en UDP, un trafic que beaucoup de VPN et de proxys ne transportent pas. Voici les adresses que WebRTC laisse voir, comparées à celle que voient les sites.",
      "focus_h": "Vos adresses WebRTC",
      "docs": [
        [
          "Qu’est-ce qu’une fuite WebRTC ?",
          "Pour établir un appel, WebRTC rassemble toutes les adresses où l’on pourrait vous joindre : les adresses locales de votre carte réseau, et l’adresse publique que voit un serveur STUN. Une page les lit en quelques lignes de script, sans autorisation. Si votre VPN ou votre proxy ne transporte que les requêtes web de la page, la requête STUN sort par votre propre connexion, et la page découvre votre vraie IP derrière le VPN."
        ],
        [
          "Comment fonctionne ce test ?",
          "La page ouvre une connexion WebRTC vers les serveurs STUN de Cloudflare et de Google et liste les adresses qu’ils renvoient (candidats « server reflexive »). Elle les compare ensuite à l’adresse que voient ce site, vos autres sorties et le test IPv6. Une adresse qu’aucun d’eux ne voit est une fuite. Les adresses locales viennent des candidats « host » ; rien n’est enregistré ni envoyé ailleurs."
        ],
        [
          "Comment corriger une fuite WebRTC ?",
          "Clients proxy (Clash, V2Ray, etc.) : activez le mode TUN pour que l’UDP passe aussi par le proxy. Chrome et Edge : l’extension WebRTC Network Limiter, ou l’option « Prevent WebRTC from leaking local IP addresses » d’uBlock Origin. Brave : Paramètres → Confidentialité → Règle de traitement des IP WebRTC → Désactiver l’UDP sans proxy. Firefox : dans about:config, passez media.peerconnection.ice.default_address_only à true, ou media.peerconnection.enabled à false pour couper WebRTC. Puis relancez ce test."
        ],
        [
          "Une adresse locale ou un nom en .local, est-ce une fuite ?",
          "Un nom qui finit par .local, c’est le navigateur qui cache votre adresse locale (mDNS) : c’est ce qu’il faut. Une vraie adresse locale comme 192.168.1.5 ne dit pas où vous êtes, mais elle rend votre empreinte plus unique. Une adresse IPv6 différente de votre sortie IPv4 n’est une fuite que si ce n’est pas votre sortie IPv6 : le test la compare à l’adresse IPv6 que voient les sites."
        ]
      ]
    },
    "de": {
      "seo_title": "WebRTC-Leak-Test: Zeigt WebRTC deine echte IP? · Wer bist du?",
      "seo_desc": "Kostenloser WebRTC-Leak-Test: die öffentlichen IPv4- und IPv6-Adressen und die lokalen Adressen, die WebRTC jeder Website verrät, verglichen mit der IP, die dein VPN oder Proxy zeigt. Weichen sie ab, verrät WebRTC deine echte IP. Mit Lösungen für Chrome, Firefox, Brave und Proxy-Clients.",
      "seo_kw": "WebRTC Leak Test, WebRTC-Leck, WebRTC IP Leak, VPN WebRTC Leak, WebRTC prüfen, STUN IP Leak, lokale IP Leak, WebRTC deaktivieren",
      "h1": "WebRTC-Leak-Test",
      "og_sub": "Zeigt WebRTC deine echte IP?",
      "intro": "Videoanrufe im Browser laufen über WebRTC, und jede Seite kann es starten, ohne zu fragen. WebRTC fragt einen STUN-Server, von welcher Adresse du kommst, und zwar über UDP, das viele VPNs und Proxys nicht weiterleiten. Hier siehst du die Adressen, die WebRTC preisgibt, verglichen mit der Adresse, die Websites sehen.",
      "focus_h": "Deine WebRTC-Adressen",
      "docs": [
        [
          "Was ist ein WebRTC-Leck?",
          "Um einen Anruf aufzubauen, sammelt WebRTC jede Adresse, unter der du erreichbar sein könntest: die lokalen deiner Netzwerkkarte und die öffentliche, die ein STUN-Server sieht. Eine Seite liest sie mit ein paar Zeilen Skript, ganz ohne Berechtigung. Leitet dein VPN oder Proxy nur die Webanfragen der Seite weiter, geht die STUN-Anfrage über deine eigene Leitung raus, und die Seite erfährt deine echte IP hinter dem VPN."
        ],
        [
          "Wie funktioniert dieser Test?",
          "Die Seite baut eine WebRTC-Verbindung zu den STUN-Servern von Cloudflare und Google auf und listet die Adressen, die sie melden („server reflexive“-Kandidaten). Dann vergleicht sie sie mit der Adresse, die diese Website, deine anderen Ausgänge und der IPv6-Test sehen. Eine Adresse, die keiner davon zeigt, ist ein Leck. Die lokalen Adressen stammen aus den „host“-Kandidaten; nichts wird gespeichert oder irgendwohin geschickt."
        ],
        [
          "Wie behebe ich ein WebRTC-Leck?",
          "Proxy-Clients (Clash, V2Ray und andere): TUN-Modus einschalten, damit auch UDP über den Proxy läuft. Chrome und Edge: die Erweiterung WebRTC Network Limiter oder in uBlock Origin „Prevent WebRTC from leaking local IP addresses“. Brave: Einstellungen → Datenschutz → WebRTC-IP-Verarbeitungsrichtlinie → Nicht über Proxy geleitetes UDP deaktivieren. Firefox: in about:config media.peerconnection.ice.default_address_only auf true setzen, oder media.peerconnection.enabled auf false, um WebRTC ganz abzuschalten. Danach den Test wiederholen."
        ],
        [
          "Ist eine lokale Adresse oder ein .local-Name ein Leck?",
          "Ein Name, der auf .local endet, bedeutet: Der Browser versteckt deine lokale Adresse (mDNS). Genau das willst du. Eine echte lokale Adresse wie 192.168.1.5 verrät nicht, wo du bist, macht deinen Fingerabdruck aber einmaliger. Eine IPv6-Adresse, die von deinem IPv4-Ausgang abweicht, ist nur dann ein Leck, wenn sie nicht dein IPv6-Ausgang ist: Der Test vergleicht sie mit der IPv6-Adresse, die Websites sehen."
        ]
      ]
    },
    "pt": {
      "seo_title": "Teste de vazamento WebRTC: o WebRTC mostra seu IP real? · Quem é você?",
      "seo_desc": "Teste grátis de vazamento WebRTC: os endereços IPv4 e IPv6 públicos e os endereços locais que o WebRTC entrega a qualquer site, comparados com o IP que sua VPN ou proxy mostra. Se forem diferentes, o WebRTC está vazando seu IP real. Com o passo a passo para corrigir no Chrome, Firefox, Brave e clientes de proxy.",
      "seo_kw": "teste vazamento WebRTC, vazamento WebRTC, WebRTC leak test, vazamento de IP WebRTC, vazamento WebRTC VPN, verificar WebRTC, vazamento IP STUN, desativar WebRTC",
      "h1": "Teste de vazamento WebRTC",
      "og_sub": "O WebRTC mostra seu IP real?",
      "intro": "As chamadas de vídeo no navegador usam WebRTC, e qualquer página pode iniciá-lo sem perguntar. Ele pergunta a um servidor STUN de qual endereço você veio, por UDP, e muitas VPNs e proxies não levam UDP. Aqui estão os endereços que o WebRTC revela, comparados com o endereço que os sites veem.",
      "focus_h": "Seus endereços WebRTC",
      "docs": [
        [
          "O que é vazamento de WebRTC?",
          "Para montar uma chamada, o WebRTC junta todos os endereços em que você pode ser alcançado: os locais, da sua placa de rede, e o público que um servidor STUN vê. Uma página lê esses endereços com poucas linhas de código, sem pedir permissão. Se a VPN ou o proxy leva só as requisições web da página, a requisição STUN sai pela sua conexão normal, e a página descobre seu IP real por trás da VPN."
        ],
        [
          "Como este teste funciona?",
          "A página abre uma conexão WebRTC com os servidores STUN da Cloudflare e do Google e lista os endereços que eles informam (candidatos \"server reflexive\"). Depois compara com o endereço que este site, suas outras saídas e o teste de IPv6 veem. Um endereço que não aparece em nenhum deles é vazamento. Os endereços locais vêm dos candidatos \"host\"; nada é salvo nem enviado para lugar nenhum."
        ],
        [
          "Como corrijo um vazamento de WebRTC?",
          "Clientes de proxy (Clash, V2Ray e outros): ative o modo TUN para o UDP também passar pelo proxy. Chrome e Edge: a extensão WebRTC Network Limiter, ou a opção do uBlock Origin \"Impedir que o WebRTC vaze endereços IP locais\". Brave: Configurações → Privacidade → Política de tratamento de IP do WebRTC → Desativar UDP sem proxy. Firefox: em about:config, coloque media.peerconnection.ice.default_address_only como true, ou media.peerconnection.enabled como false para desligar o WebRTC. Depois, faça o teste de novo."
        ],
        [
          "Endereço local ou nome .local é vazamento?",
          "Um nome terminado em .local é o navegador escondendo seu endereço local (mDNS), que é exatamente o que você quer. Um endereço local real, como 192.168.1.5, não revela onde você está, mas deixa sua impressão digital mais fácil de identificar. Um IPv6 diferente da sua saída IPv4 só é vazamento se não for a sua saída IPv6: o teste compara com o endereço IPv6 que os sites veem."
        ]
      ]
    },
    "ru": {
      "seo_title": "Проверка утечки WebRTC: показывает ли WebRTC ваш настоящий IP? · Кто вы?",
      "seo_desc": "Бесплатная проверка утечки WebRTC: публичные адреса IPv4 и IPv6 и локальные адреса, которые WebRTC отдаёт любому сайту, рядом с IP, который показывает ваш VPN или прокси. Если они не совпадают, WebRTC выдаёт ваш настоящий IP. С инструкциями для Chrome, Firefox, Brave и прокси-клиентов.",
      "seo_kw": "проверка утечки WebRTC, утечка WebRTC, утечка IP через WebRTC, WebRTC leak test, утечка WebRTC VPN, проверить WebRTC, отключить WebRTC, утечка локального IP",
      "h1": "Проверка утечки WebRTC",
      "og_sub": "Показывает ли WebRTC ваш настоящий IP?",
      "intro": "Видеозвонки в браузере работают через WebRTC, и любая страница может запустить его, ничего не спрашивая. WebRTC узнаёт у STUN-сервера, с какого адреса вы пришли, причём по UDP, который многие VPN и прокси не пропускают. Здесь — адреса, которые выдаёт WebRTC, рядом с адресом, который видят сайты.",
      "focus_h": "Ваши адреса WebRTC",
      "docs": [
        [
          "Что такое утечка WebRTC?",
          "Чтобы наладить звонок, WebRTC собирает все адреса, по которым до вас можно достучаться: локальные адреса сетевой карты и публичный адрес, который видит STUN-сервер. Страница читает их парой строк скрипта, без всяких разрешений. Если ваш VPN или прокси пропускает только веб-запросы страницы, запрос к STUN уходит напрямую через ваше подключение, и страница узнаёт ваш настоящий IP за VPN."
        ],
        [
          "Как работает этот тест?",
          "Страница открывает WebRTC-соединение со STUN-серверами Cloudflare и Google и выписывает адреса, которые они сообщают (кандидаты «server reflexive»). Затем сравнивает их с адресом, который видят этот сайт, ваши другие выходы и тест IPv6. Адрес, которого не видит ни один из них, — это утечка. Локальные адреса берутся из кандидатов «host»; ничего не сохраняется и никуда не отправляется."
        ],
        [
          "Как устранить утечку WebRTC?",
          "Прокси-клиенты (Clash, V2Ray и другие): включите режим TUN, чтобы UDP тоже шёл через прокси. Chrome и Edge: расширение WebRTC Network Limiter или в uBlock Origin пункт «Prevent WebRTC from leaking local IP addresses». Brave: Настройки → Конфиденциальность → Правила обработки IP-адресов WebRTC → Отключить UDP без прокси. Firefox: в about:config поставьте media.peerconnection.ice.default_address_only = true или media.peerconnection.enabled = false, чтобы выключить WebRTC совсем. Потом пройдите тест ещё раз."
        ],
        [
          "Локальный адрес или имя на .local — это утечка?",
          "Имя на .local значит, что браузер прячет ваш локальный адрес (mDNS), — так и должно быть. Настоящий локальный адрес вроде 192.168.1.5 не говорит, где вы, но делает ваш отпечаток уникальнее. Адрес IPv6, который отличается от вашего выхода IPv4, — утечка, только если это не ваш выход IPv6: тест сверяет его с адресом IPv6, который видят сайты."
        ]
      ]
    }
  },
  "browser-check": {
    "en": {
      "seo_title": "Browser Environment Check: does your browser give itself away? · Who Are You",
      "seo_desc": "Free browser environment check for anti-detect browsers and multi-account setups: whether the user agent, JavaScript engine, languages, time zone, fonts and fingerprint agree, whether extensions rewrote what sites read, with an A–F grade.",
      "seo_kw": "browser environment check, anti-detect browser test, browser consistency check, fingerprint browser check, user agent spoofing detection, multi-account browser check",
      "h1": "Browser environment check",
      "og_sub": "Does your browser agree with itself?",
      "intro": "Sites that fight fraud don't just look at your IP. They check that everything your browser says fits together. A user agent that says Safari on a Chromium engine, a language changed only in JavaScript, a time zone two APIs disagree on: each one is a giveaway. Here's what this browser says, and where it contradicts itself.",
      "focus_h": "Tampering check",
      "docs": [
        [
          "What does this check look at?",
          "Whether the properties sites read (user agent, platform, languages, screen) were overwritten instead of coming from the browser; whether the drawing and audio functions used for fingerprints were replaced; whether the JavaScript engine matches the user agent; whether the language in the request headers matches the one in JavaScript; and whether Date and Intl agree on the time zone. Every other check on the page counts toward the grade too."
        ],
        [
          "Why do extensions that change the user agent get caught?",
          "They change what JavaScript reads, but not the headers the browser sends with each request, the engine underneath, or the functions they wrap. Each mismatch is something a site can compare. To seem to be somewhere else, change the system itself: its language and time zone."
        ],
        [
          "Is anything stored?",
          "Nothing that identifies you. The checks run in your browser, and the server only answers with what it can already see in this request, keeping no log. Afterwards the page adds one to anonymous counters (which values you had, how each check came out), with no IP and no record of a single visit. \"Don't count me\" on the page turns this off, and browsers that send Global Privacy Control are never counted."
        ]
      ]
    },
    "zh-CN": {
      "seo_title": "浏览器环境检测：指纹浏览器、多开环境露馅了吗？ · 你是谁",
      "seo_desc": "免费浏览器环境检测，适合指纹浏览器和多账号环境：检查 UA、JS 引擎、语言、时区、字体和指纹是否一致，有没有插件篡改网站读到的信息，并给出 A 到 F 的环境等级。",
      "seo_kw": "浏览器环境检测, 指纹浏览器检测, 浏览器指纹检测, 多开环境检测, UA 伪装检测, 环境一致性检测, AdsPower 检测, 跨境电商环境检测",
      "h1": "浏览器环境检测",
      "og_sub": "你的浏览器前后说法一致吗？",
      "intro": "做风控的网站不只看 IP，还会核对浏览器说的每一件事能不能对上：UA 说是 Safari，引擎却是 Chromium；语言只在 JS 里改了，请求头里还是原样；两个接口报的时区不一样……每一处都是破绽。下面是这个浏览器的各种说法，以及它自相矛盾的地方。",
      "focus_h": "篡改检测",
      "docs": [
        [
          "这个检测看哪些地方？",
          "看这几样：网站常读的属性（UA、平台、语言、屏幕）有没有被重新定义；算指纹用的画图和音频函数有没有被替换；JS 引擎和 UA 对不对得上；请求头（浏览器每次请求都会附带的信息）里的语言和 JS 里的是否一致；Date 和 Intl 两个接口报的时区是否相同。页面上其他检测项也都计入等级。"
        ],
        [
          "为什么改 UA 的插件会被识破？",
          "因为它们只改了 JS 读到的那一份。浏览器发出的请求头、底层引擎、被它们包了一层的函数，都还是原样。每一处对不上，网站都比得出来。想装成在别处，要在系统里改：系统语言和时区。"
        ],
        [
          "会保存什么吗？",
          "不会保存关于你个人的东西。检测都在你的浏览器里进行，服务器只回答它从这次请求里本来就看得到的东西，不记日志。检测完，页面会给匿名计数器加一（各项特征值和每项检查结果的计数），不存 IP，不存完整指纹，也没有单次访问的记录。页面上的「不参与统计」可以关掉；开了全局隐私控制（GPC）的浏览器不会计入。"
        ]
      ]
    },
    "zh-TW": {
      "seo_title": "瀏覽器環境檢測：指紋瀏覽器、多開環境露餡了嗎？ · 你是誰",
      "seo_desc": "免費瀏覽器環境檢測，適合指紋瀏覽器和多帳號環境：檢查 UA、JS 引擎、語言、時區、字型和指紋是否一致，有沒有擴充功能竄改網站讀到的資訊，並給出 A 到 F 的環境等級。",
      "seo_kw": "瀏覽器環境檢測, 指紋瀏覽器檢測, 瀏覽器指紋檢測, 多開環境檢測, UA 偽裝檢測, 環境一致性檢測, AdsPower 檢測",
      "h1": "瀏覽器環境檢測",
      "og_sub": "你的瀏覽器前後說法一致嗎？",
      "intro": "做風險控管的網站不只看 IP，還會核對瀏覽器說的每一件事對不對得上：UA 說是 Safari，引擎卻是 Chromium；語言只在 JS 裡改了，請求標頭還是原樣；兩個介面回報的時區不一樣……每一處都是破綻。下面是這個瀏覽器的各種說法，以及它自相矛盾的地方。",
      "focus_h": "竄改檢測",
      "docs": [
        [
          "這個檢測看哪些地方？",
          "看這幾樣：網站常讀的屬性（UA、平台、語言、螢幕）有沒有被重新定義；算指紋用的繪圖和音訊函式有沒有被替換；JS 引擎和 UA 對不對得上；請求標頭（瀏覽器每次發出請求都會附上的資訊）裡的語言和 JS 裡的是否一致；Date 和 Intl 兩個介面回報的時區是否相同。頁面上其他檢測項目也都計入等級。"
        ],
        [
          "為什麼改 UA 的擴充功能會被識破？",
          "因為它們只改了 JS 讀到的那一份。瀏覽器送出的請求標頭、底層引擎、被它們包了一層的函式，都還是原樣。每一處對不上，網站都比對得出來。想假裝在別的地方，要直接改系統：系統語言和時區。"
        ],
        [
          "會儲存什麼嗎？",
          "不會儲存關於你個人的東西。檢測都在你的瀏覽器裡進行，伺服器只回應它從這次請求本來就看得到的東西，不留紀錄。檢測完，頁面會替匿名計數器加一（各項特徵值和每項檢查結果的計數），不存 IP，不存完整指紋，也沒有單次造訪的紀錄。頁面上的「不參與統計」可以關掉；開了全球隱私控制（GPC）的瀏覽器不會計入。"
        ]
      ]
    },
    "ja": {
      "seo_title": "ブラウザ環境チェック：ブラウザの言い分は辻褄が合っている？ · あなたは誰",
      "seo_desc": "アンチディテクトブラウザや複数アカウント運用向けの無料ブラウザ環境チェック：UA、JavaScript エンジン、言語、タイムゾーン、フォント、フィンガープリントが一致しているか、拡張機能がサイトの読む値を書き換えていないかを調べ、A〜F で評価します。",
      "seo_kw": "ブラウザ環境チェック, アンチディテクトブラウザ, ブラウザ指紋チェック, UA 偽装 検出, 複数アカウント 環境",
      "h1": "ブラウザ環境チェック",
      "og_sub": "あなたのブラウザ、辻褄は合っていますか？",
      "intro": "不正対策をするサイトは IP だけを見ているわけではありません。ブラウザの言うことがすべて噛み合っているかを確かめます。UA は Safari なのにエンジンは Chromium、言語を JavaScript の中だけで変えている、2 つの API でタイムゾーンが違う。どれも手がかりになります。このブラウザが何と言っていて、どこで矛盾しているかを示します。",
      "focus_h": "書き換えチェック",
      "docs": [
        [
          "何を調べるのですか？",
          "サイトが読むプロパティ（UA、プラットフォーム、言語、画面）がブラウザ本来の値ではなく書き換えられていないか。フィンガープリントに使われる描画や音声の関数が差し替えられていないか。JavaScript エンジンが UA と合っているか。リクエストヘッダーの言語が JavaScript の言語と同じか。Date と Intl のタイムゾーンが一致しているか。ページのほかの検査も評価に含まれます。"
        ],
        [
          "UA を変える拡張機能はなぜ見破られるのですか？",
          "変わるのは JavaScript が読む値だけで、ブラウザがリクエストごとに送るヘッダー、内部のエンジン、包んだ関数そのものは元のままだからです。食い違いはどれも、サイトが比べられる手がかりになります。別の場所にいるように見せたいなら、システムの言語とタイムゾーンそのものを変えてください。"
        ],
        [
          "何か保存されますか？",
          "あなたを特定できる情報は保存しません。検査はブラウザの中で行い、サーバーはこのリクエストから元々見える情報を返すだけで、ログも残しません。検査のあと、ページは匿名のカウンター（あなたの値、各チェックの結果）に 1 を足しますが、IP も 1 回ごとの記録も残りません。ページの「集計に含めない」で止められ、グローバル・プライバシー・コントロール（GPC）を送るブラウザは集計しません。"
        ]
      ]
    },
    "ko": {
      "seo_title": "브라우저 환경 검사: 내 브라우저는 앞뒤가 맞을까? · 당신은 누구",
      "seo_desc": "안티디텍트 브라우저와 다계정 환경을 위한 무료 브라우저 환경 검사: UA, JavaScript 엔진, 언어, 시간대, 글꼴, 지문이 서로 맞는지, 확장 프로그램이 사이트가 읽는 값을 바꿨는지 확인하고 A~F 등급을 매겨요.",
      "seo_kw": "브라우저 환경 검사, 안티디텍트 브라우저 테스트, 브라우저 일관성 검사, 지문 브라우저 검사, UA 위장 탐지, 다계정 브라우저",
      "h1": "브라우저 환경 검사",
      "og_sub": "내 브라우저는 앞뒤가 맞을까?",
      "intro": "부정 사용을 막는 사이트는 IP만 보지 않아요. 브라우저가 말하는 정보가 모두 서로 맞는지 확인해요. UA는 Safari라는데 엔진은 Chromium이거나, 언어를 JavaScript에서만 바꿨거나, 두 API가 알려 주는 시간대가 다르면 하나하나가 단서가 돼요. 이 브라우저가 말하는 내용과, 앞뒤가 안 맞는 곳을 보여 드려요.",
      "focus_h": "조작 여부 검사",
      "docs": [
        [
          "이 검사는 무엇을 보나요?",
          "사이트가 읽는 속성(UA, 플랫폼, 언어, 화면)이 브라우저 원래 값이 아니라 새로 정의된 건 아닌지, 지문에 쓰이는 그리기·오디오 함수가 바꿔치기되지 않았는지, JavaScript 엔진이 UA와 맞는지, 요청 헤더의 언어가 JavaScript의 언어와 같은지, Date와 Intl이 알려 주는 시간대가 같은지 봐요. 페이지의 다른 검사 결과도 모두 등급에 반영돼요."
        ],
        [
          "UA를 바꾸는 확장 프로그램은 왜 들킬까요?",
          "확장 프로그램은 JavaScript가 읽는 값만 바꿔요. 브라우저가 보내는 요청 헤더, 그 아래의 엔진, 감싼 함수 자체는 그대로예요. 어긋나는 곳마다 사이트가 비교해 볼 수 있어요. 다른 곳에 있는 것처럼 보이려면 시스템 자체의 언어와 시간대를 바꾸세요."
        ],
        [
          "저장되는 게 있나요?",
          "나에 관한 정보는 저장하지 않아요. 검사는 브라우저 안에서 이루어지고, 서버는 이번 요청에서 원래 보이는 것만 답해요. 검사가 끝나면 페이지는 익명 카운터에 1을 더해요(어떤 값이었는지, 각 검사 결과가 어땠는지). IP도, 한 번 한 번의 방문 기록도 남기지 않아요. 페이지의 '집계에서 빼기'로 끌 수 있어요."
        ]
      ]
    },
    "de": {
      "seo_title": "Browser-Umgebungs-Check: Passt alles zusammen, oder verrät sich dein Browser? · Wer bist du?",
      "seo_desc": "Kostenloser Browser-Umgebungs-Check für Anti-Detect-Browser und Multi-Accounting: ob User-Agent, JavaScript-Engine, Sprachen, Zeitzone, Schriften und Fingerabdruck zusammenpassen, ob Erweiterungen umgeschrieben haben, was Websites lesen, und eine Note von A bis F.",
      "seo_kw": "Browser Umgebung prüfen, Anti-Detect-Browser Test, Browser Konsistenz Check, Fingerprint Browser Check, User-Agent Spoofing erkennen, Multi-Account Browser",
      "h1": "Browser-Umgebungs-Check",
      "og_sub": "Passt dein Browser zu sich selbst?",
      "intro": "Websites, die Betrug bekämpfen, lesen nicht nur deine IP: Sie prüfen, ob alles, was dein Browser sagt, zusammenpasst. Ein User-Agent, der Safari behauptet, auf einer Chromium-Engine; eine Sprache, die nur in JavaScript geändert wurde; eine Zeitzone, bei der sich zwei APIs uneinig sind: Jedes Detail verrät dich. Hier siehst du, was dieser Browser sagt und wo er sich widerspricht.",
      "focus_h": "Spuren von Manipulation",
      "docs": [
        [
          "Was prüft dieser Check?",
          "Ob Eigenschaften, die Websites lesen (User-Agent, Plattform, Sprachen, Bildschirm), umdefiniert wurden statt vom Browser zu kommen; ob die Zeichen- und Audiofunktionen, die für Fingerabdrücke genutzt werden, ersetzt wurden; ob die JavaScript-Engine zum User-Agent passt; ob die Sprache im mitgesendeten Header dieselbe ist wie in JavaScript; und ob Date und Intl dieselbe Zeitzone melden. Alle anderen Prüfungen auf der Seite fließen ebenfalls in die Note ein."
        ],
        [
          "Warum fliegen Erweiterungen auf, die den User-Agent ändern?",
          "Sie ändern, was JavaScript liest, aber nicht die Header, die der Browser bei jeder Anfrage mitschickt, nicht die Engine darunter und nicht die Funktionen, die sie umhüllen. Jede Abweichung kann eine Website vergleichen. Um woanders zu wirken, stell das System selbst um: Sprache und Zeitzone."
        ],
        [
          "Wird etwas gespeichert?",
          "Nichts, was dich identifiziert. Die Prüfungen laufen in deinem Browser, und der Server antwortet nur mit dem, was er in dieser Anfrage ohnehin sieht, ohne Protokoll. Danach zählt die Seite anonyme Zähler um eins hoch (welche Werte du hattest, wie jede Prüfung ausging), ohne IP und ohne Eintrag zu einzelnen Besuchen. „Nicht mitzählen“ nimmt dich aus der Zählung, und ein Browser, der Global Privacy Control sendet, wird nie gezählt."
        ]
      ]
    },
    "fr": {
      "seo_title": "Vérification de l’environnement du navigateur : cohérent ou trahi par un détail ? · Qui êtes-vous ?",
      "seo_desc": "Vérification gratuite de l’environnement du navigateur, pour les navigateurs anti-détection et le multicompte : le user agent, le moteur JavaScript, les langues, le fuseau horaire, les polices et l’empreinte concordent-ils ? Une extension a-t-elle réécrit ce que lisent les sites ? Avec une note de A à F.",
      "seo_kw": "vérification environnement navigateur, test navigateur anti-détection, cohérence navigateur, test empreinte navigateur, détection user agent modifié, multicompte navigateur",
      "h1": "Vérification de l’environnement du navigateur",
      "og_sub": "Votre navigateur est-il cohérent avec lui-même ?",
      "intro": "Les sites qui luttent contre la fraude ne lisent pas seulement votre IP : ils vérifient que tout ce que dit votre navigateur va ensemble. Un user agent qui annonce Safari sur un moteur Chromium, une langue changée seulement dans JavaScript, un fuseau horaire sur lequel deux API ne sont pas d’accord : chacun de ces détails vous trahit. Voici ce que dit ce navigateur, et où il se contredit.",
      "focus_h": "Traces de modification",
      "docs": [
        [
          "Qu’est-ce que ce test vérifie ?",
          "Il regarde si les propriétés que lisent les sites (user agent, plateforme, langues, écran) ont été redéfinies au lieu de venir du navigateur ; si les fonctions de dessin et d’audio utilisées pour l’empreinte ont été remplacées ; si le moteur JavaScript correspond au user agent ; si la langue envoyée dans les en-têtes est la même que dans JavaScript ; et si Date et Intl donnent le même fuseau horaire. Tous les autres contrôles de la page comptent aussi dans la note."
        ],
        [
          "Pourquoi les extensions qui changent le user agent se font-elles repérer ?",
          "Elles changent ce que lit JavaScript, mais pas les en-têtes que le navigateur envoie avec chaque requête, ni le moteur en dessous, ni les fonctions qu’elles enveloppent. Chaque décalage est une chose qu’un site peut comparer. Pour paraître ailleurs, changez le système lui-même : sa langue et son fuseau horaire."
        ],
        [
          "Quelque chose est-il enregistré ?",
          "Rien qui vous identifie. Les contrôles se font dans votre navigateur, et le serveur répond seulement avec ce qu’il voit déjà dans cette requête, sans tenir de journal. Ensuite, la page ajoute un à des compteurs anonymes (les valeurs que vous aviez, le résultat de chaque contrôle), sans IP ni trace d’une visite en particulier. Le bouton « Ne pas me compter » vous retire du comptage, et un navigateur qui envoie Global Privacy Control n’est jamais compté."
        ]
      ]
    },
    "es": {
      "seo_title": "Test del entorno del navegador: ¿es coherente o se delata? · ¿Quién eres?",
      "seo_desc": "Test gratuito del entorno del navegador para navegadores antidetección y multicuenta: si el user agent, el motor de JavaScript, los idiomas, la zona horaria, las fuentes y la huella encajan, si alguna extensión ha reescrito lo que leen las webs, y una nota de la A a la F.",
      "seo_kw": "test entorno navegador, test navegador antidetección, coherencia del navegador, comprobar navegador antidetect, detectar user agent falso, navegador multicuenta",
      "h1": "Test del entorno del navegador",
      "og_sub": "¿Tu navegador es coherente consigo mismo?",
      "intro": "Las webs que combaten el fraude no solo miran tu IP: comprueban que todo lo que dice tu navegador encaje. Un user agent que dice Safari sobre un motor Chromium, un idioma cambiado solo en JavaScript, una zona horaria en la que dos API no coinciden: cada uno te delata. Esto es lo que dice este navegador, y dónde se contradice.",
      "focus_h": "Test de manipulación",
      "docs": [
        [
          "¿Qué mira este test?",
          "Si las propiedades que leen las webs (user agent, plataforma, idiomas, pantalla) se han redefinido en lugar de venir del navegador, si se han reemplazado las funciones de dibujo y de audio que usan las huellas, si el motor de JavaScript encaja con el user agent, si el idioma de las cabeceras coincide con el de JavaScript y si Date e Intl coinciden en la zona horaria. Todas las demás pruebas de la página también cuentan para la nota."
        ],
        [
          "¿Por qué se pillan las extensiones que cambian el user agent?",
          "Cambian lo que lee JavaScript, pero no las cabeceras que envía el navegador (los datos que acompañan cada petición), ni el motor que hay debajo, ni las funciones que envuelven. Cada desajuste es algo que una web puede comparar. Para parecer de otro sitio, cambia el propio sistema: su idioma y su zona horaria."
        ],
        [
          "¿Se guarda algo?",
          "Nada sobre ti. Las pruebas se hacen en tu navegador, y el servidor solo responde con lo que ve de esta petición. Después, la página suma uno a unos contadores anónimos (qué valores tenías y cómo salió cada prueba), sin IP y sin registro de ninguna visita concreta; «No contarme», en la página, lo desactiva."
        ]
      ]
    },
    "pt": {
      "seo_title": "Teste do ambiente do navegador: ele é coerente ou se entrega? · Quem é você?",
      "seo_desc": "Teste grátis do ambiente do navegador para navegadores antidetecção e várias contas: veja se user agent, motor de JavaScript, idiomas, fuso horário, fontes e impressão digital batem, se alguma extensão reescreveu o que os sites leem, e receba uma nota de A a F.",
      "seo_kw": "teste ambiente do navegador, teste navegador antidetecção, coerência do navegador, verificar navegador antidetect, detectar user agent falso, navegador multicontas",
      "h1": "Teste do ambiente do navegador",
      "og_sub": "Seu navegador é coerente com ele mesmo?",
      "intro": "Os sites que combatem fraude não olham só o IP: eles conferem se tudo o que o navegador diz se encaixa. Um user agent que diz Safari num motor Chromium, um idioma trocado só no JavaScript, um fuso horário em que duas APIs discordam: cada um te entrega. Isto é o que este navegador diz, e onde ele se contradiz.",
      "focus_h": "Teste de adulteração",
      "docs": [
        [
          "O que este teste olha?",
          "Se as propriedades que os sites leem (user agent, plataforma, idiomas, tela) foram redefinidas em vez de virem do navegador, se as funções de desenho e de áudio usadas nas impressões digitais foram substituídas, se o motor de JavaScript bate com o user agent, se o idioma dos cabeçalhos bate com o do JavaScript e se Date e Intl concordam sobre o fuso horário. Todos os outros testes da página também entram na nota."
        ],
        [
          "Por que as extensões que trocam o user agent são pegas?",
          "Elas mudam o que o JavaScript lê, mas não os cabeçalhos que o navegador envia (os dados que acompanham cada requisição), nem o motor por baixo, nem as funções que elas envolvem. Cada diferença é algo que um site consegue comparar. Para parecer estar em outro lugar, mude o próprio sistema: o idioma e o fuso horário."
        ],
        [
          "Alguma coisa é guardada?",
          "Nada sobre você. Os testes rodam no seu navegador, e o servidor só responde com o que ele vê desta requisição. Depois, a página soma um a contadores anônimos (quais valores você tinha e como saiu cada teste), sem IP e sem registro de nenhuma visita individual; \"Não me contar\", na página, desliga isso."
        ]
      ]
    },
    "ru": {
      "seo_title": "Проверка окружения браузера: всё ли сходится или браузер себя выдаёт? · Кто вы?",
      "seo_desc": "Бесплатная проверка окружения браузера для антидетект-браузеров и мультиаккаунтинга: сходятся ли User-Agent, движок JavaScript, языки, часовой пояс, шрифты и отпечаток, не переписали ли расширения то, что читают сайты. Плюс оценка от A до F.",
      "seo_kw": "проверка окружения браузера, проверка антидетект браузера, проверка согласованности браузера, проверка браузера на отпечатки, обнаружение подмены User-Agent, мультиаккаунтинг",
      "h1": "Проверка окружения браузера",
      "og_sub": "Не противоречит ли браузер сам себе?",
      "intro": "Сайты, которые борются с мошенничеством, смотрят не только на IP: они проверяют, сходится ли всё, что сообщает ваш браузер. User-Agent говорит «Safari», а движок — Chromium; язык поменян только в JavaScript; два API называют разный часовой пояс — каждая такая мелочь вас выдаёт. Здесь — что сообщает этот браузер и в чём он себе противоречит.",
      "focus_h": "Следы подмены",
      "docs": [
        [
          "Что проверяется?",
          "Не переопределены ли свойства, которые читают сайты (User-Agent, платформа, языки, экран), вместо того чтобы браузер отдавал их сам; не подменены ли функции рисования и звука, по которым снимают отпечаток; совпадает ли движок JavaScript с User-Agent; совпадает ли язык в заголовках запроса с языком в JavaScript; одинаковый ли часовой пояс у Date и Intl. В оценку идут и все остальные проверки на странице."
        ],
        [
          "Почему расширения, меняющие User-Agent, попадаются?",
          "Они меняют то, что читает JavaScript, но не заголовки, которые браузер отправляет с каждым запросом, не движок под ними и не функции, которые они оборачивают. Любое расхождение сайт может сравнить. Чтобы сойти за жителя другой страны, меняйте саму систему: её язык и часовой пояс."
        ],
        [
          "Что-нибудь сохраняется?",
          "Ничего, что указывало бы на вас. Проверки идут в вашем браузере, а сервер отвечает только тем, что и так видит в этом запросе, и не ведёт журналов. Затем страница прибавляет единицу к анонимным счётчикам (какие у вас были значения, чем закончилась каждая проверка) — без IP и без записей об отдельных визитах. Кнопка «Не учитывать меня» исключает вас из подсчёта, а браузер с Global Privacy Control не учитывается никогда."
        ]
      ]
    }
  },
  "timezone-check": {
    "en": {
      "seo_title": "Time Zone Check: does your time zone match your IP? · Who Are You",
      "seo_desc": "Free time zone check: your system time zone and clock format next to the time zone of your IP address. A mismatch is one of the first things sites use to spot a VPN or proxy. Includes fixes for Windows, macOS and phones.",
      "seo_kw": "time zone check, timezone IP mismatch, browser time zone, VPN time zone, what is my time zone, time zone detection",
      "h1": "Time zone check",
      "og_sub": "Does your clock match your IP?",
      "intro": "Any page can read your system's time zone without asking, and every site knows roughly where your IP is. When the two disagree, say an IP in Japan and a clock on China Standard Time, it's one of the first signs sites use to spot a VPN or proxy. Here are both, side by side.",
      "focus_h": "Your time zone vs your IP",
      "docs": [
        [
          "How do sites know my time zone?",
          "Through JavaScript's Intl and Date, which any page can use without a permission prompt. The IP's time zone comes from the same kind of location database that places your IP in a city."
        ],
        [
          "How do I fix a mismatch?",
          "Set the system time zone to one in the country your IP is in: on Windows in Settings → Time & language, on macOS in System Settings → General → Date & Time, on phones in the date and time settings. An extension that only changes JavaScript's time zone is easy to catch; the browser environment check shows why."
        ],
        [
          "Why is a different zone in the same country only a warning?",
          "Large countries have several time zones, and an IP is often placed in the right country but the wrong city. A zone in another country is a clear contradiction; a zone in the same country is only a hint."
        ]
      ]
    },
    "zh-CN": {
      "seo_title": "时区检测：系统时区和 IP 对得上吗？ · 你是谁",
      "seo_desc": "免费时区检测：把你的系统时区、时钟格式和 IP 所在地的时区放在一起对比。两者不一致，是网站识别 VPN 和代理最先看的破绽之一。附 Windows、macOS 和手机上的改法。",
      "seo_kw": "时区检测, 时区与 IP 不一致, 浏览器时区, VPN 时区, 我的时区, 系统时区检测, 时区泄露",
      "h1": "时区检测",
      "og_sub": "你的时钟和 IP 对得上吗？",
      "intro": "任何网页都能直接读到你系统的时区，不用你授权；任何网站也大致知道你的 IP 在哪。两者对不上，比如 IP 在日本、时钟却是北京时间，就是网站识别 VPN 和代理时最先看的破绽之一。下面把两者并排列出来。",
      "focus_h": "你的时区和 IP",
      "docs": [
        [
          "网站怎么知道我的时区？",
          "靠 JavaScript 里的 Intl 和 Date 两个接口，任何网页都能用，不会弹授权。IP 的时区则来自 IP 地理位置库，就是把 IP 对应到城市的那种数据库。"
        ],
        [
          "时区对不上怎么改？",
          "把系统时区改成 IP 所在地的：Windows 在「设置 → 时间和语言」，macOS 在「系统设置 → 通用 → 日期与时间」，手机在日期和时间设置里。只改 JS 时区的浏览器插件很容易被识破，原因见浏览器环境检测。"
        ],
        [
          "为什么同一个国家的不同时区只标黄？",
          "大国有好几个时区，IP 定位也常常只准到国家、城市不对。时区在别的国家才算明显矛盾；同一个国家里的，只是提醒你留意。"
        ]
      ]
    },
    "zh-TW": {
      "seo_title": "時區檢測：系統時區和 IP 對得上嗎？ · 你是誰",
      "seo_desc": "免費時區檢測：把你的系統時區、時間格式和 IP 所在地的時區放在一起比對。兩者不一致，是網站辨識 VPN 和代理最先看的破綻之一。附 Windows、macOS 和手機的改法。",
      "seo_kw": "時區檢測, 時區與 IP 不一致, 瀏覽器時區, VPN 時區, 我的時區, 系統時區檢測, 時區外洩",
      "h1": "時區檢測",
      "og_sub": "你的時鐘和 IP 對得上嗎？",
      "intro": "任何網頁都能直接讀到你系統的時區，不需要你授權；任何網站也大概知道你的 IP 在哪裡。兩者對不上，例如 IP 在日本、時鐘卻是台北時間，就是網站辨識 VPN 和代理時最先看的破綻之一。下面把兩者並排列出來。",
      "focus_h": "你的時區和 IP",
      "docs": [
        [
          "網站怎麼知道我的時區？",
          "靠 JavaScript 裡的 Intl 和 Date 兩個介面，任何網頁都能用，不會跳出授權。IP 的時區則來自 IP 地理位置資料庫，也就是把 IP 對應到城市的那種資料庫。"
        ],
        [
          "時區對不上要怎麼改？",
          "把系統時區改成 IP 所在地的：Windows 在「設定 → 時間與語言」，macOS 在「系統設定 → 一般 → 日期與時間」，手機在日期和時間設定裡。只改 JS 時區的瀏覽器擴充功能很容易被識破，原因請看瀏覽器環境檢測。"
        ],
        [
          "為什麼同一個國家的不同時區只標黃？",
          "大國有好幾個時區，IP 定位也常常只準到國家，城市不對。時區在別的國家才算明顯矛盾；同一個國家裡的，只是提醒你留意。"
        ]
      ]
    },
    "ja": {
      "seo_title": "タイムゾーンチェック：端末の時刻と IP は合っている？ · あなたは誰",
      "seo_desc": "無料のタイムゾーンチェック：システムのタイムゾーンと時刻の表示形式を、IP のある場所のタイムゾーンと比べます。この食い違いは、サイトが VPN やプロキシを見抜くときに真っ先に見る手がかりの一つです。Windows・macOS・スマホでの直し方付き。",
      "seo_kw": "タイムゾーン チェック, タイムゾーン IP 不一致, ブラウザ タイムゾーン, VPN タイムゾーン, 時刻 検出",
      "h1": "タイムゾーンチェック",
      "og_sub": "端末の時計と IP は合っていますか？",
      "intro": "どのページも許可なしにシステムのタイムゾーンを読めますし、どのサイトも IP のおおよその場所を知っています。この 2 つが食い違う、たとえば IP は日本なのに時計は中国標準時、というのは、サイトが VPN やプロキシを見抜くときに真っ先に見る手がかりの一つです。両方を並べて示します。",
      "focus_h": "タイムゾーンと IP",
      "docs": [
        [
          "サイトはどうやってタイムゾーンを知るのですか？",
          "JavaScript の Intl と Date からです。どのページでも、許可のダイアログなしに使えます。IP のタイムゾーンは、IP から都市を割り出すのと同じ種類の位置情報データベースから取ります。"
        ],
        [
          "食い違いはどう直しますか？",
          "システムのタイムゾーンを、IP のある国のものにします。Windows は「設定 → 時刻と言語」、macOS は「システム設定 → 一般 → 日付と時刻」、スマホは日付と時刻の設定です。JavaScript のタイムゾーンだけを変える拡張機能はすぐに見破られます（理由はブラウザ環境チェックで分かります）。"
        ],
        [
          "同じ国の別のタイムゾーンが黄色の注意で済むのはなぜですか？",
          "大きな国にはタイムゾーンが複数あり、IP は国は合っていても都市がずれることがよくあるからです。別の国のタイムゾーンははっきりした矛盾ですが、同じ国ならヒント程度にとどめます。"
        ]
      ]
    },
    "ko": {
      "seo_title": "시간대 검사: 내 시간대가 IP와 맞을까? · 당신은 누구",
      "seo_desc": "무료 시간대 검사: 시스템 시간대와 시계 형식을 IP 주소의 시간대와 비교해요. 둘이 다르면 사이트가 VPN이나 프록시를 알아채는 첫 단서가 돼요. Windows, macOS, 휴대폰에서 고치는 방법도 알려 드려요.",
      "seo_kw": "시간대 검사, 시간대 IP 불일치, 브라우저 시간대, VPN 시간대, 내 시간대 확인, 시간대 탐지",
      "h1": "시간대 검사",
      "og_sub": "내 시계는 IP와 맞을까?",
      "intro": "어느 페이지든 묻지 않고 시스템 시간대를 읽을 수 있고, 어느 사이트든 IP가 대략 어디인지 알아요. IP는 일본인데 시계는 한국 시간처럼 둘이 어긋나면, 사이트가 VPN이나 프록시를 알아채는 첫 단서가 돼요. 둘을 나란히 보여 드려요.",
      "focus_h": "내 시간대와 IP",
      "docs": [
        [
          "사이트는 내 시간대를 어떻게 알까요?",
          "JavaScript의 Intl과 Date로 알아요. 어느 페이지에서나 권한 요청 없이 쓸 수 있어요. IP의 시간대는 IP 위치를 도시로 찾아 주는 것과 같은 종류의 위치 데이터베이스에서 나와요."
        ],
        [
          "어긋나면 어떻게 고치나요?",
          "시스템 시간대를 IP가 있는 나라의 시간대로 바꾸세요. Windows는 설정 → 시간 및 언어, macOS는 시스템 설정 → 일반 → 날짜 및 시간, 휴대폰은 날짜 및 시간 설정에서 바꿔요. JavaScript의 시간대만 바꾸는 확장 프로그램은 쉽게 들켜요. 이유는 브라우저 환경 검사에서 볼 수 있어요."
        ],
        [
          "같은 나라의 다른 시간대는 왜 경고만 하나요?",
          "큰 나라에는 시간대가 여러 개 있고, IP 위치는 나라는 맞아도 도시는 틀리는 경우가 많아요. 다른 나라의 시간대면 확실한 모순이지만, 같은 나라 안의 시간대는 단서일 뿐이에요."
        ]
      ]
    },
    "de": {
      "seo_title": "Zeitzonen-Check: Passt deine Zeitzone zu deiner IP? · Wer bist du?",
      "seo_desc": "Kostenloser Zeitzonen-Check: Zeitzone und Uhrzeitformat deines Systems im Vergleich zur Zeitzone deiner IP-Adresse. Eine Abweichung ist eines der ersten Anzeichen, an denen Websites ein VPN oder einen Proxy erkennen. Mit Anleitung für Windows, macOS und Smartphones.",
      "seo_kw": "Zeitzone prüfen, Zeitzone IP Abweichung, Browser Zeitzone, VPN Zeitzone, welche Zeitzone habe ich, Zeitzone erkennen",
      "h1": "Zeitzonen-Check",
      "og_sub": "Passt deine Uhr zu deiner IP?",
      "intro": "Jede Seite kann ohne Nachfrage die Zeitzone deines Systems lesen, und jede Website weiß ungefähr, wo deine IP liegt. Passen beide nicht zusammen, etwa eine IP in Japan und eine Uhr auf chinesischer Zeit, ist das eines der ersten Zeichen, an denen Websites ein VPN oder einen Proxy erkennen. Hier siehst du beides nebeneinander.",
      "focus_h": "Deine Zeitzone im Vergleich zur IP",
      "docs": [
        [
          "Woher kennen Websites meine Zeitzone?",
          "Über Intl und Date in JavaScript, die jeder Seite ohne Berechtigungsabfrage zur Verfügung stehen. Die Zeitzone der IP stammt aus derselben Art von Geodatenbank, die deine IP einer Stadt zuordnet."
        ],
        [
          "Wie behebe ich eine Abweichung?",
          "Stell die Systemzeitzone auf eine im Land deiner IP: unter Windows in Einstellungen → Zeit und Sprache, unter macOS in Systemeinstellungen → Allgemein → Datum & Uhrzeit, auf dem Smartphone in den Einstellungen für Datum und Uhrzeit. Eine Browsererweiterung, die nur die Zeitzone für JavaScript ändert, fällt leicht auf: Der Browser-Umgebungs-Check zeigt, warum."
        ],
        [
          "Warum ist eine andere Zone im selben Land nur eine Warnung?",
          "Große Länder haben mehrere Zeitzonen, und eine IP wird oft dem richtigen Land, aber der falschen Stadt zugeordnet. Eine Zone eines anderen Landes ist ein klarer Widerspruch; eine Zone desselben Landes nur ein Hinweis."
        ]
      ]
    },
    "fr": {
      "seo_title": "Vérification du fuseau horaire : correspond-il à votre IP ? · Qui êtes-vous ?",
      "seo_desc": "Vérification gratuite du fuseau horaire : le fuseau et le format d’heure de votre système, comparés au fuseau de votre adresse IP. Un décalage est l’un des premiers indices qu’utilisent les sites pour repérer un VPN ou un proxy. Avec la marche à suivre sur Windows, macOS et téléphone.",
      "seo_kw": "vérifier fuseau horaire, fuseau horaire IP, fuseau horaire navigateur, fuseau horaire VPN, quel est mon fuseau horaire, détection fuseau horaire",
      "h1": "Vérification du fuseau horaire",
      "og_sub": "Votre horloge correspond-elle à votre IP ?",
      "intro": "N’importe quelle page peut lire le fuseau horaire de votre système sans rien demander, et tout site sait à peu près où se trouve votre IP. Quand les deux ne concordent pas, par exemple une IP au Japon et une horloge à l’heure de Pékin, c’est l’un des premiers signes qu’utilisent les sites pour repérer un VPN ou un proxy. Les voici côte à côte.",
      "focus_h": "Votre fuseau face à votre IP",
      "docs": [
        [
          "Comment les sites connaissent-ils mon fuseau horaire ?",
          "Grâce à Intl et Date en JavaScript, accessibles à toute page sans demande d’autorisation. Le fuseau de l’IP vient du même genre de base de géolocalisation que celle qui place votre IP dans une ville."
        ],
        [
          "Comment corriger un décalage ?",
          "Réglez le fuseau du système sur un fuseau du pays de votre IP : sur Windows dans Paramètres → Heure et langue, sur macOS dans Réglages Système → Général → Date et heure, sur téléphone dans les réglages de date et heure. Une extension qui change seulement le fuseau vu par JavaScript se repère facilement : la vérification de l’environnement du navigateur montre pourquoi."
        ],
        [
          "Pourquoi un autre fuseau du même pays n’est-il qu’un avertissement ?",
          "Les grands pays ont plusieurs fuseaux horaires, et une IP est souvent placée dans le bon pays mais dans la mauvaise ville. Un fuseau d’un autre pays est une vraie contradiction ; un fuseau du même pays n’est qu’un indice."
        ]
      ]
    },
    "es": {
      "seo_title": "Test de zona horaria: ¿tu zona horaria coincide con tu IP? · ¿Quién eres?",
      "seo_desc": "Test gratuito de zona horaria: la zona horaria y el formato de hora de tu sistema frente a la zona horaria de tu dirección IP. Si no coinciden, es una de las primeras pistas que usan las webs para detectar una VPN o un proxy. Incluye cómo arreglarlo en Windows, macOS y el teléfono.",
      "seo_kw": "test zona horaria, zona horaria no coincide con IP, zona horaria del navegador, zona horaria VPN, cuál es mi zona horaria, detección de zona horaria",
      "h1": "Test de zona horaria",
      "og_sub": "¿Tu reloj coincide con tu IP?",
      "intro": "Cualquier página puede leer la zona horaria de tu sistema sin preguntar, y cualquier web sabe más o menos dónde está tu IP. Cuando no coinciden, por ejemplo una IP en Japón y un reloj con la hora de México, es una de las primeras pistas que usan las webs para detectar una VPN o un proxy. Aquí tienes las dos, una al lado de la otra.",
      "focus_h": "Tu zona horaria frente a tu IP",
      "docs": [
        [
          "¿Cómo saben las webs mi zona horaria?",
          "Con Intl y Date de JavaScript, disponibles en cualquier página sin aviso de permiso. La zona horaria de la IP sale del mismo tipo de base de datos de ubicación que sitúa tu IP en una ciudad."
        ],
        [
          "¿Cómo arreglo el desajuste?",
          "Pon en el sistema una zona horaria del país de tu IP: en Windows, en Configuración → Hora e idioma; en macOS, en Ajustes del Sistema → General → Fecha y hora; en el teléfono, en los ajustes de fecha y hora. Una extensión que solo cambia la zona horaria de JavaScript se detecta fácilmente: el test del entorno del navegador muestra por qué."
        ],
        [
          "¿Por qué una zona distinta del mismo país es solo un aviso?",
          "Los países grandes tienen varias zonas horarias, y a menudo se ubica una IP en el país correcto pero en la ciudad equivocada. Una zona de otro país es una contradicción clara; una del mismo país, solo una pista."
        ]
      ]
    },
    "pt": {
      "seo_title": "Teste de fuso horário: seu fuso bate com o seu IP? · Quem é você?",
      "seo_desc": "Teste grátis de fuso horário: o fuso horário e o formato do relógio do seu sistema comparados com o fuso do seu endereço IP. Quando não batem, é uma das primeiras pistas que os sites usam para perceber VPN ou proxy. Com o passo a passo para corrigir no Windows, no macOS e no celular.",
      "seo_kw": "teste fuso horário, fuso horário diferente do IP, fuso horário do navegador, fuso horário VPN, qual é meu fuso horário, detecção de fuso horário",
      "h1": "Teste de fuso horário",
      "og_sub": "Seu relógio bate com o seu IP?",
      "intro": "Qualquer página consegue ler o fuso horário do seu sistema sem perguntar, e qualquer site sabe mais ou menos onde está o seu IP. Quando os dois não batem, como um IP no Japão e um relógio no horário de Brasília, essa é uma das primeiras pistas que os sites usam para perceber VPN ou proxy. Aqui estão os dois, lado a lado.",
      "focus_h": "Seu fuso horário x seu IP",
      "docs": [
        [
          "Como os sites sabem meu fuso horário?",
          "Pelo Intl e pelo Date do JavaScript, disponíveis em qualquer página sem pedido de permissão. O fuso do IP vem do mesmo tipo de banco de localização que coloca o seu IP numa cidade."
        ],
        [
          "Como corrijo a diferença?",
          "Coloque no sistema um fuso do país em que está o seu IP: no Windows, em Configurações → Hora e idioma; no macOS, em Ajustes do Sistema → Geral → Data e Hora; no celular, nas configurações de data e hora. Uma extensão que só muda o fuso do JavaScript é fácil de pegar: o teste do ambiente do navegador mostra por quê."
        ],
        [
          "Por que um fuso diferente no mesmo país é só um aviso?",
          "Países grandes têm vários fusos, e muitas vezes um IP é localizado no país certo, mas na cidade errada. Um fuso de outro país é uma contradição clara; um fuso do mesmo país é só uma pista."
        ]
      ]
    },
    "ru": {
      "seo_title": "Проверка часового пояса: совпадает ли он с вашим IP? · Кто вы?",
      "seo_desc": "Бесплатная проверка часового пояса: часовой пояс и формат времени вашей системы рядом с часовым поясом вашего IP-адреса. Несовпадение — один из первых признаков, по которым сайты замечают VPN или прокси. С инструкциями для Windows, macOS и телефонов.",
      "seo_kw": "проверка часового пояса, часовой пояс не совпадает с IP, часовой пояс браузера, часовой пояс VPN, какой у меня часовой пояс, определение часового пояса",
      "h1": "Проверка часового пояса",
      "og_sub": "Совпадают ли ваши часы с IP?",
      "intro": "Любая страница может без спроса прочитать часовой пояс вашей системы, а любой сайт примерно знает, где находится ваш IP. Если они не сходятся — скажем, IP в Японии, а часы идут по пекинскому времени, — это один из первых признаков, по которым сайты замечают VPN или прокси. Здесь они стоят рядом.",
      "focus_h": "Ваш часовой пояс и ваш IP",
      "docs": [
        [
          "Откуда сайты знают мой часовой пояс?",
          "Из Intl и Date в JavaScript — они доступны любой странице без запроса разрешения. Часовой пояс IP берётся из такой же базы геолокации, которая привязывает ваш IP к городу."
        ],
        [
          "Как исправить несовпадение?",
          "Поставьте в системе часовой пояс страны, где находится ваш IP: в Windows — Параметры → Время и язык, в macOS — Системные настройки → Основные → Дата и время, на телефоне — в настройках даты и времени. Расширение браузера, которое меняет часовой пояс только для JavaScript, легко раскусить: проверка окружения браузера покажет почему."
        ],
        [
          "Почему другой пояс в той же стране — только предупреждение?",
          "В больших странах несколько часовых поясов, а IP часто привязывается к нужной стране, но не к тому городу. Пояс другой страны — явное противоречие; пояс той же страны — лишь намёк."
        ]
      ]
    }
  },
  "proxy-check": {
    "en": {
      "seo_title": "Proxy Check: can sites tell you're behind a proxy? · Who Are You",
      "seo_desc": "Free proxy check: compares the round trip your browser measures with the one Cloudflare sees on its connection, and checks whether your IP belongs to a data center, plus your DNS and WebRTC addresses. A proxy adds a leg sites can measure, even on a clean residential IP.",
      "seo_kw": "proxy check, proxy detection test, am I behind a proxy, VPN detection, latency proxy detection, data center IP check",
      "h1": "Proxy check",
      "og_sub": "Can sites tell there's a proxy in between?",
      "intro": "A proxy hides your IP, but not the extra leg of the trip. Cloudflare measures the round trip on its own connection, which ends at the proxy; your browser measures the whole way. When the browser's number is much bigger, something sits in between, however clean the IP looks. Here are both, with the other signs sites use.",
      "focus_h": "Your round trip",
      "docs": [
        [
          "How does the latency check work?",
          "The page asks this site's nearest Cloudflare server for a tiny response a few times and keeps the fastest, timed from when the request leaves to when the first byte comes back. Cloudflare reports the round trip it measured on the TCP connection it served you on. Without a proxy the two are close; through one, Cloudflare only sees the proxy's part."
        ],
        [
          "Can a residential IP still be caught?",
          "Yes. A residential IP passes the data center check, but the extra round trip, a DNS resolver in another country, a time zone that doesn't match and WebRTC addresses can all still give it away."
        ],
        [
          "Why does the check sometimes say \"couldn't read\"?",
          "Over HTTP/3 there's no TCP connection, so Cloudflare has no round trip to report. Some networks also block the measuring requests."
        ]
      ]
    },
    "zh-CN": {
      "seo_title": "代理检测：网站看得出你在用代理吗？ · 你是谁",
      "seo_desc": "免费代理检测：对比浏览器测到的往返延迟和 Cloudflare 在自己那条连接上测到的延迟，再看 IP 是不是机房 IP、DNS 和 WebRTC 漏了什么。代理会多出一段网站量得出来的路程，换成家宽 IP 也藏不住。",
      "seo_kw": "代理检测, 代理 IP 检测, 是否使用代理, VPN 检测, 延迟检测代理, 机房 IP 检测, 家宽 IP 检测, 住宅 IP 检测, 节点检测",
      "h1": "代理检测",
      "og_sub": "网站看得出中间隔着代理吗？",
      "intro": "代理能藏住 IP，藏不住多出来的那段路。Cloudflare 在它自己那条连接上测往返时间，而那条连接的另一头其实是代理；你的浏览器测的则是全程。浏览器测出来的比 Cloudflare 长很多，就说明中间还隔着一段，不管 IP 看起来多干净。下面是这两个数字，以及网站常看的其他破绽。",
      "focus_h": "你的往返延迟",
      "docs": [
        [
          "延迟是怎么测的？",
          "页面向本站最近的 Cloudflare 机房要几次很小的响应，取最快的一次：从发出请求到收到第一个字节。Cloudflare 则报告它在给你服务的那条 TCP 连接上测到的往返时间。不走代理时，两个数差不多；走代理时，Cloudflare 只看到了代理到它的那一段。"
        ],
        [
          "家宽 IP 也会被识破吗？",
          "会。家宽 IP 能过「机房 IP」这一关，但多出来的延迟、在别国的 DNS 服务器、对不上的时区和 WebRTC 漏出来的地址，照样会把你暴露出来。"
        ],
        [
          "为什么有时测不出来？",
          "走 HTTP/3 时没有 TCP 连接，Cloudflare 就没有往返时间可报；有些网络也会拦下测量请求。"
        ]
      ]
    },
    "zh-TW": {
      "seo_title": "代理偵測：網站看得出你在用代理嗎？ · 你是誰",
      "seo_desc": "免費代理偵測：比對瀏覽器測到的往返延遲和 Cloudflare 在自己那條連線上測到的延遲，再看 IP 是不是機房 IP、DNS 和 WebRTC 漏了什麼。代理會多出一段網站量得出來的路程，換成住宅 IP 也藏不住。",
      "seo_kw": "代理偵測, 代理 IP 檢測, 是否使用代理, VPN 偵測, 延遲偵測代理, 機房 IP 檢測, 住宅 IP 檢測",
      "h1": "代理偵測",
      "og_sub": "網站看得出中間隔著代理嗎？",
      "intro": "代理藏得住 IP，藏不住多出來的那段路。Cloudflare 在它自己那條連線上測往返時間，而那條連線的另一頭其實是代理；你的瀏覽器測的則是全程。瀏覽器測到的比 Cloudflare 長很多，就代表中間還隔著一段，不管 IP 看起來多乾淨。下面是這兩個數字，以及網站常看的其他破綻。",
      "focus_h": "你的往返延遲",
      "docs": [
        [
          "延遲是怎麼測的？",
          "頁面向本站最近的 Cloudflare 機房要幾次很小的回應，取最快的一次：從送出請求到收到第一個位元組。Cloudflare 則回報它在服務你的那條 TCP 連線上測到的往返時間。沒走代理時，兩個數字差不多；走代理時，Cloudflare 只看到從代理到它的那一段。"
        ],
        [
          "住宅 IP 也會被識破嗎？",
          "會。住宅 IP 過得了「機房 IP」這一關，但多出來的延遲、在別國的 DNS 伺服器、對不上的時區和 WebRTC 漏出來的位址，照樣會讓你露餡。"
        ],
        [
          "為什麼有時候測不出來？",
          "走 HTTP/3 時沒有 TCP 連線，Cloudflare 就沒有往返時間可以回報；有些網路也會擋下測量請求。"
        ]
      ]
    },
    "ja": {
      "seo_title": "プロキシチェック：プロキシ経由だとサイトに見抜かれる？ · あなたは誰",
      "seo_desc": "無料のプロキシチェック：ブラウザが測った往復時間と、Cloudflare が自分の接続で見た往復時間を比べます。IP がデータセンターのものか、DNS や WebRTC のアドレスも確認。プロキシを通すと測れる区間が 1 つ増えるので、きれいな家庭用回線の IP でも隠しきれません。",
      "seo_kw": "プロキシ チェック, プロキシ 検出, プロキシ 判定, VPN 検出, 遅延 プロキシ 検出, データセンター IP",
      "h1": "プロキシチェック",
      "og_sub": "間にプロキシがあると見抜かれる？",
      "intro": "プロキシで IP は隠せても、増えた区間は隠せません。Cloudflare は自分の接続で往復時間を測りますが、その接続の相手はプロキシです。一方、ブラウザは全行程を測ります。ブラウザの値のほうがずっと大きければ、IP がどれほどきれいでも、間に何かがあります。2 つの値と、サイトが見るほかの手がかりを示します。",
      "focus_h": "往復時間",
      "docs": [
        [
          "遅延チェックはどういう仕組みですか？",
          "ページはこのサイトのいちばん近い Cloudflare のサーバーに小さな応答を何度か求め、リクエストを送ってから最初の 1 バイトが返るまでの最短時間を取ります。Cloudflare は、あなたとの TCP 接続で測った往復時間を返します。プロキシがなければ 2 つは近い値になり、プロキシ経由なら Cloudflare にはプロキシの区間しか見えません。"
        ],
        [
          "家庭用回線の IP でも見抜かれますか？",
          "はい。家庭用回線の IP ならデータセンターの判定は通りますが、増えた往復時間、別の国にある DNS サーバー、合わないタイムゾーン、WebRTC のアドレスから、やはり分かってしまいます。"
        ],
        [
          "「読み取れず」と出るのはなぜですか？",
          "HTTP/3 では TCP 接続を使わないので、Cloudflare には返す往復時間がありません。また、測定のリクエストを止めるネットワークもあります。"
        ]
      ]
    },
    "ko": {
      "seo_title": "프록시 검사: 사이트가 프록시를 알아챌까? · 당신은 누구",
      "seo_desc": "무료 프록시 검사: 브라우저가 잰 왕복 시간과 Cloudflare가 자기 연결에서 본 왕복 시간을 비교하고, IP가 데이터센터 것인지, DNS와 WebRTC 주소는 어떤지 확인해요. 깨끗한 가정용 IP라도 프록시는 사이트가 잴 수 있는 구간을 하나 더 만들어요.",
      "seo_kw": "프록시 검사, 프록시 탐지 테스트, 프록시 사용 확인, VPN 탐지, 지연 시간 프록시 탐지, 데이터센터 IP 확인",
      "h1": "프록시 검사",
      "og_sub": "중간에 프록시가 있다는 걸 사이트가 알까?",
      "intro": "프록시는 IP를 숨겨 주지만, 길이 한 구간 늘어나는 건 숨기지 못해요. Cloudflare는 자기 연결에서 왕복 시간을 재는데, 그 연결의 반대쪽 끝은 프록시예요. 브라우저는 전체 구간을 재요. 브라우저 쪽이 훨씬 길면 IP가 어떻게 보이든 중간에 뭔가 있다는 뜻이에요. 두 값과 함께, 사이트가 보는 다른 단서도 보여 드려요.",
      "focus_h": "내 왕복 시간",
      "docs": [
        [
          "지연 시간 검사는 어떻게 하나요?",
          "페이지는 이 사이트의 가장 가까운 서버에 아주 작은 응답을 몇 번 요청하고, 요청을 보낸 순간부터 첫 바이트가 돌아올 때까지 가장 빨랐던 값을 써요. Cloudflare는 나에게 응답한 TCP 연결에서 잰 왕복 시간을 알려 줘요. 프록시가 없으면 두 값이 비슷하고, 프록시를 거치면 Cloudflare는 프록시까지의 구간만 봐요."
        ],
        [
          "가정용 IP도 들킬 수 있나요?",
          "네. 가정용 IP는 데이터센터 IP 검사는 통과하지만, 늘어난 왕복 시간, 다른 나라에 있는 DNS 서버, 맞지 않는 시간대, WebRTC 주소에서 여전히 드러나요."
        ],
        [
          "검사가 '읽지 못함'으로 나올 때가 있는 이유는?",
          "HTTP/3에는 TCP 연결이 없어서 Cloudflare가 알려 줄 왕복 시간이 없어요. 측정 요청을 막는 네트워크도 있어요."
        ]
      ]
    },
    "de": {
      "seo_title": "Proxy-Check: Merken Websites, dass du einen Proxy nutzt? · Wer bist du?",
      "seo_desc": "Kostenloser Proxy-Check: die Laufzeit, die dein Browser misst, im Vergleich zu der, die Cloudflare auf seiner Verbindung sieht, ob deine IP zu einem Rechenzentrum gehört, dazu dein DNS und deine WebRTC-Adressen. Ein Proxy fügt einen Umweg hinzu, den Websites messen können, selbst bei einer sauberen IP von einem Privatanschluss.",
      "seo_kw": "Proxy Check, Proxy erkennen Test, bin ich hinter einem Proxy, VPN erkennen, Proxy Erkennung Latenz, Rechenzentrums-IP prüfen",
      "h1": "Proxy-Check",
      "og_sub": "Merken Websites, dass ein Proxy dazwischen sitzt?",
      "intro": "Ein Proxy versteckt deine IP, aber nicht den zusätzlichen Umweg. Cloudflare misst die Laufzeit auf seiner eigenen Verbindung, und die endet am Proxy; dein Browser misst den ganzen Weg. Ist die Zeit des Browsers deutlich länger, sitzt etwas dazwischen, ganz gleich, wie die IP aussieht. Hier siehst du beide Werte und die anderen Anzeichen, auf die Websites achten.",
      "focus_h": "Deine Laufzeit",
      "docs": [
        [
          "Wie funktioniert die Laufzeitmessung?",
          "Die Seite fragt den nächsten Cloudflare-Server dieser Website mehrmals nach einer winzigen Antwort und nimmt die schnellste, vom Absenden bis zum ersten zurückkommenden Byte. Cloudflare meldet die Laufzeit, die es auf der TCP-Verbindung zu dir gemessen hat. Ohne Proxy liegen beide nah beieinander; mit Proxy sieht Cloudflare nur den Teil ab dem Proxy."
        ],
        [
          "Kann eine IP von einem Privatanschluss trotzdem auffallen?",
          "Ja. Eine solche IP besteht den Rechenzentrums-Check, aber die zusätzliche Laufzeit, ein DNS-Server in einem anderen Land, eine unpassende Zeitzone und die WebRTC-Adressen können sie trotzdem verraten."
        ],
        [
          "Warum steht bei der Prüfung manchmal „nicht lesbar“?",
          "Über HTTP/3 gibt es keine TCP-Verbindung, also hat Cloudflare keine Laufzeit zu melden. Außerdem blockieren manche Netze die Messanfragen."
        ]
      ]
    },
    "fr": {
      "seo_title": "Détection de proxy : les sites voient-ils que vous passez par un proxy ? · Qui êtes-vous ?",
      "seo_desc": "Détection de proxy gratuite : le temps d’aller-retour mesuré par votre navigateur comparé à celui que Cloudflare voit sur sa connexion, le type de votre IP (datacenter ou non), votre DNS et vos adresses WebRTC. Un proxy ajoute un détour que les sites peuvent mesurer, même avec une IP résidentielle propre.",
      "seo_kw": "détection proxy, test proxy, suis-je derrière un proxy, détection VPN, détection proxy latence, vérifier IP datacenter",
      "h1": "Détection de proxy",
      "og_sub": "Les sites voient-ils qu’un proxy se glisse entre vous ?",
      "intro": "Un proxy cache votre IP, mais pas le détour qu’il ajoute au trajet. Cloudflare mesure l’aller-retour sur sa propre connexion, qui s’arrête au proxy ; votre navigateur mesure le trajet complet. Quand celui du navigateur est nettement plus long, il y a quelque chose entre les deux, quelle que soit l’allure de l’IP. Voici les deux mesures, avec les autres indices qu’utilisent les sites.",
      "focus_h": "Votre aller-retour",
      "docs": [
        [
          "Comment fonctionne la mesure de latence ?",
          "La page demande plusieurs fois une toute petite réponse au serveur Cloudflare de ce site et garde la plus rapide, du départ de la requête jusqu’au premier octet reçu. Cloudflare indique de son côté l’aller-retour mesuré sur la connexion TCP qui vous a servi. Sans proxy, les deux sont proches ; avec un proxy, Cloudflare ne voit que la partie entre le proxy et lui."
        ],
        [
          "Une IP résidentielle peut-elle quand même être repérée ?",
          "Oui. Une IP résidentielle passe le contrôle « datacenter », mais l’aller-retour supplémentaire, un serveur DNS dans un autre pays, un fuseau horaire qui ne correspond pas et les adresses WebRTC peuvent encore vous trahir."
        ],
        [
          "Pourquoi la mesure indique-t-elle parfois « lecture impossible » ?",
          "En HTTP/3, il n’y a pas de connexion TCP, donc Cloudflare n’a pas d’aller-retour à fournir. Et certains réseaux bloquent les requêtes de mesure."
        ]
      ]
    },
    "es": {
      "seo_title": "Test de proxy: ¿pueden las webs saber que usas un proxy? · ¿Quién eres?",
      "seo_desc": "Test gratuito de proxy: el tiempo de ida y vuelta que mide tu navegador frente al que ve Cloudflare en su conexión, si tu IP pertenece a un centro de datos, y tus direcciones DNS y WebRTC. Un proxy añade un tramo que las webs pueden medir, incluso con una IP residencial limpia.",
      "seo_kw": "test de proxy, detección de proxy, estoy detrás de un proxy, detección de VPN, detectar proxy por latencia, comprobar IP de centro de datos",
      "h1": "Test de proxy",
      "og_sub": "¿Pueden las webs ver que hay un proxy en medio?",
      "intro": "Un proxy oculta tu IP, pero no el tramo extra del camino. Cloudflare mide el tiempo de ida y vuelta en su propia conexión, que termina en el proxy; tu navegador lo mide en todo el recorrido. Si el del navegador es mucho más largo, hay algo en medio, parezca lo que parezca la IP. Aquí tienes los dos, junto con las demás pistas que usan las webs.",
      "focus_h": "Tu tiempo de ida y vuelta",
      "docs": [
        [
          "¿Cómo funciona la prueba de latencia?",
          "La página pide varias veces una respuesta mínima al servidor más cercano de este sitio y se queda con la más rápida, desde que sale la petición hasta que vuelve el primer byte. Cloudflare informa del tiempo de ida y vuelta que midió en la conexión TCP por la que te atendió. Sin proxy, los dos valores se parecen; con proxy, Cloudflare solo ve el tramo del proxy."
        ],
        [
          "¿Se puede detectar una IP residencial?",
          "Sí. Una IP residencial pasa la prueba de centro de datos, pero el tiempo de ida y vuelta extra, un servidor DNS en otro país, una zona horaria que no encaja y las direcciones WebRTC la siguen delatando."
        ],
        [
          "¿Por qué a veces la prueba dice «no se pudo leer»?",
          "Con HTTP/3 no hay conexión TCP, así que Cloudflare no tiene tiempo de ida y vuelta que informar, y algunas redes bloquean las peticiones de medición."
        ]
      ]
    },
    "pt": {
      "seo_title": "Teste de proxy: os sites percebem que você usa proxy? · Quem é você?",
      "seo_desc": "Teste grátis de proxy: o tempo de ida e volta que o seu navegador mede comparado com o que a Cloudflare vê na conexão dela, se o seu IP é de data center, e seus endereços de DNS e WebRTC. Um proxy acrescenta um trecho que os sites conseguem medir, mesmo com um IP residencial limpo.",
      "seo_kw": "teste de proxy, detecção de proxy, estou atrás de um proxy, detecção de VPN, detectar proxy pela latência, verificar IP de data center",
      "h1": "Teste de proxy",
      "og_sub": "Os sites percebem que há um proxy no meio?",
      "intro": "Um proxy esconde seu IP, mas não o trecho a mais no caminho. A Cloudflare mede o tempo de ida e volta na própria conexão, que termina no proxy; o seu navegador mede o caminho inteiro. Quando o do navegador é bem mais longo, tem algo no meio, não importa como o IP pareça. Aqui estão os dois, com as outras pistas que os sites usam.",
      "focus_h": "Seu tempo de ida e volta",
      "docs": [
        [
          "Como funciona o teste de latência?",
          "A página pede algumas vezes uma resposta minúscula ao servidor mais próximo deste site e fica com a mais rápida, do momento em que a requisição sai até o primeiro byte voltar. A Cloudflare informa o tempo de ida e volta que mediu na conexão TCP em que te atendeu. Sem proxy, os dois ficam parecidos; com proxy, a Cloudflare só vê o trecho do proxy."
        ],
        [
          "Um IP residencial ainda pode ser pego?",
          "Sim. Um IP residencial passa no teste de data center, mas o tempo de ida e volta a mais, um servidor DNS em outro país, um fuso horário que não bate e os endereços WebRTC continuam te entregando."
        ],
        [
          "Por que às vezes o teste diz \"não deu para ler\"?",
          "No HTTP/3 não há conexão TCP, então a Cloudflare não tem tempo de ida e volta para informar, e algumas redes bloqueiam as requisições de medição."
        ]
      ]
    },
    "ru": {
      "seo_title": "Проверка на прокси: видят ли сайты, что вы за прокси? · Кто вы?",
      "seo_desc": "Бесплатная проверка на прокси: время отклика, которое измеряет браузер, рядом с тем, что Cloudflare видит на своём соединении; принадлежит ли ваш IP дата-центру; ваш DNS и адреса WebRTC. Прокси добавляет лишний участок пути, который сайты могут измерить, даже если IP чистый и домашний.",
      "seo_kw": "проверка на прокси, обнаружение прокси, я за прокси, проверка VPN, обнаружение прокси по задержке, проверка IP дата-центра",
      "h1": "Проверка на прокси",
      "og_sub": "Видят ли сайты, что между вами есть прокси?",
      "intro": "Прокси скрывает ваш IP, но не лишний участок пути. Cloudflare измеряет время отклика на своём соединении, а оно заканчивается на прокси; браузер измеряет весь путь целиком. Если у браузера заметно дольше, значит, между вами что-то есть, как бы ни выглядел IP. Здесь — оба значения и другие признаки, на которые смотрят сайты.",
      "focus_h": "Ваше время отклика",
      "docs": [
        [
          "Как работает проверка задержки?",
          "Страница несколько раз запрашивает у ближайшего сервера Cloudflare этого сайта крошечный ответ и берёт самый быстрый — от отправки запроса до первого байта ответа. Cloudflare со своей стороны сообщает время отклика, измеренное на TCP-соединении с вами. Без прокси значения близки; через прокси Cloudflare видит только участок от прокси до себя."
        ],
        [
          "Могут ли вычислить даже с домашним IP?",
          "Да. Домашний IP проходит проверку на дата-центр, но лишнее время отклика, DNS-сервер в другой стране, неподходящий часовой пояс и адреса WebRTC всё равно могут вас выдать."
        ],
        [
          "Почему иногда написано «не удалось прочитать»?",
          "По HTTP/3 нет TCP-соединения, поэтому Cloudflare нечего сообщить о времени отклика. Кроме того, некоторые сети блокируют измерительные запросы."
        ]
      ]
    }
  },
  "language-check": {
    "en": {
      "seo_title": "Browser Language Check: what language do sites think you speak? · Who Are You",
      "seo_desc": "Free browser language check: the languages your browser sends in its Accept-Language header and shows to JavaScript, plus your locale, keyboard layout, voices and fonts, and whether they match the country of your IP.",
      "seo_kw": "browser language check, Accept-Language check, what is my browser language, navigator.languages, language IP mismatch, locale test",
      "h1": "Browser language check",
      "og_sub": "What language do sites think you speak?",
      "intro": "Every request your browser sends says which languages you read, and any page can read the same list in JavaScript, along with your locale, keyboard layout and the voices and fonts on your system. Sites compare all this with where your IP is. Here's what yours say.",
      "focus_h": "Your language vs your IP",
      "docs": [
        [
          "Where do sites get my language from?",
          "From the Accept-Language header, a line your browser sends with every request; from navigator.languages in JavaScript; and indirectly from your locale, keyboard layout, speech voices and the fonts your system has installed."
        ],
        [
          "How do I change it?",
          "In the browser's language settings, put the language you want first. Changing it in only one place, such as with an extension that edits navigator.languages, leaves the header as it was, and the two then disagree."
        ],
        [
          "Why is English only marked as \"info\"?",
          "English is used everywhere, so it says little about where you are. Other languages point to a country, and a mismatch with the IP is a hint."
        ]
      ]
    },
    "zh-CN": {
      "seo_title": "浏览器语言检测：网站以为你说什么语言？ · 你是谁",
      "seo_desc": "免费浏览器语言检测：看看浏览器在请求头（Accept-Language）和 JavaScript 里报出的语言，以及区域设置、键盘布局、朗读语音和字体，它们和 IP 所在国家对不对得上。",
      "seo_kw": "浏览器语言检测, Accept-Language 检测, 浏览器语言, navigator.languages, 语言与 IP 不一致, 区域设置检测",
      "h1": "浏览器语言检测",
      "og_sub": "网站以为你说什么语言？",
      "intro": "浏览器每次发请求，都会顺带说明你看得懂哪些语言；任何网页也能在 JavaScript 里读到同一份列表，再加上区域设置、键盘布局，以及系统装了哪些朗读语音和字体。网站会拿这些和 IP 所在地对照。下面是你的。",
      "focus_h": "你的语言和 IP",
      "docs": [
        [
          "网站从哪儿知道我的语言？",
          "每个请求都带着的 Accept-Language 请求头，JavaScript 里的 navigator.languages，还有区域设置、键盘布局、朗读语音和系统字体，都会直接或间接透露。"
        ],
        [
          "怎么改？",
          "在浏览器的语言设置里，把想要的语言排到第一位。只改一处（比如用插件改 navigator.languages），请求头还是原样，两边对不上反而更显眼。"
        ],
        [
          "为什么英语只算「提示」？",
          "英语全世界都在用，说明不了你在哪。其他语言会指向某个国家，和 IP 对不上时才算破绽。"
        ]
      ]
    },
    "zh-TW": {
      "seo_title": "瀏覽器語言檢測：網站以為你說什麼語言？ · 你是誰",
      "seo_desc": "免費瀏覽器語言檢測：看看瀏覽器在請求標頭（Accept-Language）和 JavaScript 裡回報的語言，以及地區設定、鍵盤配置、朗讀語音和字型，它們和 IP 所在國家對不對得上。",
      "seo_kw": "瀏覽器語言檢測, Accept-Language 檢測, 瀏覽器語言, navigator.languages, 語言與 IP 不一致, 地區設定檢測",
      "h1": "瀏覽器語言檢測",
      "og_sub": "網站以為你說什麼語言？",
      "intro": "瀏覽器每次發出請求，都會順便說明你看得懂哪些語言；任何網頁也能在 JavaScript 裡讀到同一份清單，再加上地區設定、鍵盤配置，以及系統裝了哪些朗讀語音和字型。網站會拿這些和 IP 所在地比對。下面是你的。",
      "focus_h": "你的語言和 IP",
      "docs": [
        [
          "網站從哪裡知道我的語言？",
          "每個請求都附帶的 Accept-Language 請求標頭，JavaScript 裡的 navigator.languages，還有地區設定、鍵盤配置、朗讀語音和系統字型，都會直接或間接透露。"
        ],
        [
          "要怎麼改？",
          "在瀏覽器的語言設定裡，把想要的語言排到第一位。只改一處（例如用擴充功能改 navigator.languages），請求標頭還是原樣，兩邊對不上反而更顯眼。"
        ],
        [
          "為什麼英文只算「提示」？",
          "英文全世界都在用，看不出你在哪裡。其他語言會指向某個國家，和 IP 對不上時才算破綻。"
        ]
      ]
    },
    "ja": {
      "seo_title": "ブラウザ言語チェック：サイトはあなたを何語の人だと思っている？ · あなたは誰",
      "seo_desc": "無料のブラウザ言語チェック：ブラウザが Accept-Language ヘッダーで送り、JavaScript にも見せている言語、ロケール、キーボード配列、読み上げ音声、フォントを調べ、IP の国と合っているかを確認します。",
      "seo_kw": "ブラウザ 言語 チェック, Accept-Language, navigator.languages, 言語 IP 不一致, ロケール",
      "h1": "ブラウザ言語チェック",
      "og_sub": "サイトはあなたを何語の人だと思っている？",
      "intro": "ブラウザが送るリクエストには、あなたが読める言語が毎回書かれています。どのページも JavaScript で同じ一覧を読めるうえ、ロケール、キーボード配列、システムの読み上げ音声やフォントも分かります。サイトはそれを IP の場所と照らし合わせます。あなたの場合はこうです。",
      "focus_h": "言語と IP",
      "docs": [
        [
          "サイトはどこから言語を知るのですか？",
          "リクエストのたびに送られる Accept-Language ヘッダー、JavaScript の navigator.languages からです。さらにロケール、キーボード配列、読み上げ音声、インストール済みのフォントからも間接的に分かります。"
        ],
        [
          "どう変えればいいですか？",
          "ブラウザの言語設定で、使いたい言語をいちばん上にします。拡張機能で navigator.languages だけを変えるなど 1 か所だけ変えると、ヘッダーは元のままなので、2 つが食い違ってしまいます。"
        ],
        [
          "英語だと「参考」扱いになるのはなぜですか？",
          "英語は世界中で使われているので、居場所の手がかりにはほとんどなりません。ほかの言語は特定の国を指すので、IP と合わなければヒントになります。"
        ]
      ]
    },
    "ko": {
      "seo_title": "브라우저 언어 검사: 사이트는 내가 무슨 언어를 쓴다고 볼까? · 당신은 누구",
      "seo_desc": "무료 브라우저 언어 검사: 브라우저가 Accept-Language 헤더로 보내고 JavaScript로 드러내는 언어, 로캘, 키보드 배열, 음성, 글꼴을 보여 주고, IP가 있는 나라와 맞는지 확인해요.",
      "seo_kw": "브라우저 언어 검사, Accept-Language 확인, 내 브라우저 언어, navigator.languages, 언어 IP 불일치, 로캘 테스트",
      "h1": "브라우저 언어 검사",
      "og_sub": "사이트는 내가 무슨 언어를 쓴다고 볼까?",
      "intro": "브라우저는 요청을 보낼 때마다 내가 읽는 언어를 함께 알려요. 어느 페이지든 JavaScript로 같은 목록을 읽을 수 있고, 로캘, 키보드 배열, 시스템에 있는 음성과 글꼴도 읽어요. 사이트는 이것을 IP 위치와 비교해요. 내 브라우저가 무엇을 말하는지 보여 드려요.",
      "focus_h": "내 언어와 IP",
      "docs": [
        [
          "사이트는 내 언어를 어디서 알까요?",
          "모든 요청에 붙는 Accept-Language 헤더, JavaScript의 navigator.languages에서 알고, 로캘, 키보드 배열, 음성 읽기 목소리, 시스템에 설치된 글꼴에서도 간접적으로 알아요."
        ],
        [
          "어떻게 바꾸나요?",
          "브라우저 언어 설정에서 원하는 언어를 맨 위로 올리세요. navigator.languages만 고치는 확장 프로그램처럼 한 곳만 바꾸면 헤더는 그대로라서 둘이 어긋나요."
        ],
        [
          "영어는 왜 '참고'로만 나오나요?",
          "영어는 어디서나 쓰여서 위치에 대해 알려 주는 게 거의 없어요. 다른 언어는 특정 나라를 가리키기 때문에, IP와 어긋나면 단서가 돼요."
        ]
      ]
    },
    "de": {
      "seo_title": "Browsersprache prüfen: Welche Sprache sprichst du für Websites? · Wer bist du?",
      "seo_desc": "Kostenloser Check der Browsersprache: die Sprachen, die dein Browser im Accept-Language-Header sendet und in JavaScript zeigt, dein Gebietsschema, Tastaturlayout, Vorlesestimmen und Schriften, und ob sie zum Land deiner IP passen.",
      "seo_kw": "Browsersprache prüfen, Accept-Language prüfen, welche Sprache hat mein Browser, navigator.languages, Sprache IP Abweichung, Gebietsschema Test",
      "h1": "Browsersprache prüfen",
      "og_sub": "Welche Sprache sprichst du für Websites?",
      "intro": "Jede Anfrage deines Browsers sagt, welche Sprachen du liest, und jede Seite kann dieselbe Liste in JavaScript lesen, dazu dein Gebietsschema, dein Tastaturlayout sowie die Stimmen und Schriften deines Systems. Websites vergleichen das mit dem Land deiner IP. Hier siehst du, was deine verraten.",
      "focus_h": "Deine Sprache im Vergleich zur IP",
      "docs": [
        [
          "Woher kennen Websites meine Sprache?",
          "Aus dem Accept-Language-Header, der bei jeder Anfrage mitgeht, aus navigator.languages in JavaScript und indirekt aus Gebietsschema, Tastaturlayout, Vorlesestimmen und den Schriften, die auf deinem System installiert sind."
        ],
        [
          "Wie ändere ich sie?",
          "In den Spracheinstellungen des Browsers: Setz die gewünschte Sprache an die erste Stelle. Änderst du nur eine Stelle, etwa mit einer Erweiterung, die navigator.languages umschreibt, bleibt der Header, wie er war, und beide passen nicht mehr zusammen."
        ],
        [
          "Warum ist Englisch nur ein Hinweis?",
          "Englisch wird überall genutzt und verrät kaum, wo du bist. Andere Sprachen deuten auf ein Land, und eine Abweichung von der IP wird zum Indiz."
        ]
      ]
    },
    "fr": {
      "seo_title": "Vérification de la langue du navigateur : quelle langue les sites vous attribuent-ils ? · Qui êtes-vous ?",
      "seo_desc": "Vérification gratuite de la langue du navigateur : les langues que votre navigateur annonce dans l’en-tête Accept-Language et dans JavaScript, vos paramètres régionaux, la disposition du clavier, les voix et les polices, et si tout cela correspond au pays de votre IP.",
      "seo_kw": "langue du navigateur, vérifier Accept-Language, quelle est la langue de mon navigateur, navigator.languages, langue IP différente, test paramètres régionaux",
      "h1": "Vérification de la langue du navigateur",
      "og_sub": "Quelle langue les sites pensent-ils que vous parlez ?",
      "intro": "Chaque requête de votre navigateur indique les langues que vous lisez, et toute page peut lire la même liste dans JavaScript, ainsi que vos paramètres régionaux, la disposition de votre clavier, et les voix et polices de votre système. Les sites les comparent avec le pays de votre IP. Voici ce que disent les vôtres.",
      "focus_h": "Votre langue face à votre IP",
      "docs": [
        [
          "D’où les sites tirent-ils ma langue ?",
          "De l’en-tête Accept-Language envoyé avec chaque requête, de navigator.languages dans JavaScript, et indirectement des paramètres régionaux, de la disposition du clavier, des voix de synthèse et des polices installées sur votre système."
        ],
        [
          "Comment la changer ?",
          "Dans les réglages de langue du navigateur : placez la langue voulue en premier. Si vous ne changez qu’un seul endroit, par exemple avec une extension qui modifie navigator.languages, l’en-tête reste inchangé et les deux ne concordent plus."
        ],
        [
          "Pourquoi l’anglais n’est-il qu’une « info » ?",
          "L’anglais est utilisé partout : il ne dit presque rien de l’endroit où vous êtes. Les autres langues renvoient à un pays, et un décalage avec l’IP devient un indice."
        ]
      ]
    },
    "es": {
      "seo_title": "Test de idioma del navegador: ¿qué idioma creen las webs que hablas? · ¿Quién eres?",
      "seo_desc": "Test gratuito de idioma del navegador: los idiomas que tu navegador envía en la cabecera Accept-Language y muestra en JavaScript, tu configuración regional, la distribución del teclado, las voces y las fuentes, y si encajan con el país de tu IP.",
      "seo_kw": "test idioma navegador, comprobar Accept-Language, cuál es el idioma de mi navegador, navigator.languages, idioma no coincide con IP, test configuración regional",
      "h1": "Test de idioma del navegador",
      "og_sub": "¿Qué idioma creen las webs que hablas?",
      "intro": "Cada petición que envía tu navegador dice qué idiomas lees, y cualquier página puede leer esa misma lista en JavaScript, junto con tu configuración regional, la distribución del teclado y las voces y fuentes de tu sistema. Las webs las comparan con el lugar donde está tu IP. Esto es lo que dicen las tuyas.",
      "focus_h": "Tu idioma frente a tu IP",
      "docs": [
        [
          "¿De dónde sacan las webs mi idioma?",
          "De la cabecera Accept-Language que va en cada petición, de navigator.languages en JavaScript y, de forma indirecta, de la configuración regional, la distribución del teclado, las voces de lectura y las fuentes que tiene instaladas tu sistema."
        ],
        [
          "¿Cómo lo cambio?",
          "En los ajustes de idioma del navegador: pon primero el idioma que quieras. Si cambias solo un sitio, como hace una extensión que edita navigator.languages, la cabecera sigue igual y las dos no coinciden."
        ],
        [
          "¿Por qué el inglés es solo «informativo»?",
          "El inglés se usa en todas partes, así que dice poco de dónde estás. Los demás idiomas apuntan a un país, y que no coincidan con la IP es una pista."
        ]
      ]
    },
    "pt": {
      "seo_title": "Teste de idioma do navegador: que idioma os sites acham que você fala? · Quem é você?",
      "seo_desc": "Teste grátis de idioma do navegador: os idiomas que o seu navegador envia no cabeçalho Accept-Language e mostra no JavaScript, sua localidade, o layout do teclado, as vozes e as fontes, e se eles batem com o país do seu IP.",
      "seo_kw": "teste idioma do navegador, verificar Accept-Language, qual é o idioma do meu navegador, navigator.languages, idioma diferente do IP, teste de localidade",
      "h1": "Teste de idioma do navegador",
      "og_sub": "Que idioma os sites acham que você fala?",
      "intro": "Toda requisição que o seu navegador envia diz quais idiomas você lê, e qualquer página consegue ler essa mesma lista no JavaScript, junto com a localidade, o layout do teclado e as vozes e fontes do seu sistema. Os sites comparam isso com o lugar onde está o seu IP. Isto é o que os seus dizem.",
      "focus_h": "Seu idioma x seu IP",
      "docs": [
        [
          "De onde os sites tiram meu idioma?",
          "Do cabeçalho Accept-Language, que vai em toda requisição, do navigator.languages no JavaScript e, de forma indireta, da localidade, do layout do teclado, das vozes de leitura e das fontes instaladas no sistema."
        ],
        [
          "Como mudo isso?",
          "Nas configurações de idioma do navegador: coloque em primeiro o idioma que você quer. Se você mudar só um lugar, como uma extensão que edita o navigator.languages, o cabeçalho continua igual e os dois deixam de bater."
        ],
        [
          "Por que o inglês é só \"informativo\"?",
          "O inglês é usado no mundo todo, então diz pouco sobre onde você está. Os outros idiomas apontam para um país, e uma diferença em relação ao IP é uma pista."
        ]
      ]
    },
    "ru": {
      "seo_title": "Проверка языка браузера: на каком языке вы говорите для сайтов? · Кто вы?",
      "seo_desc": "Бесплатная проверка языка браузера: языки, которые браузер отправляет в заголовке Accept-Language и показывает в JavaScript, локаль, раскладка клавиатуры, голоса и шрифты — и совпадают ли они со страной вашего IP.",
      "seo_kw": "проверка языка браузера, проверить Accept-Language, какой язык у моего браузера, navigator.languages, язык не совпадает с IP, проверка локали",
      "h1": "Проверка языка браузера",
      "og_sub": "На каком языке вы говорите для сайтов?",
      "intro": "Каждый запрос браузера сообщает, на каких языках вы читаете, а любая страница может прочитать тот же список в JavaScript — вместе с локалью, раскладкой клавиатуры, голосами и шрифтами вашей системы. Сайты сверяют всё это со страной вашего IP. Здесь — что говорят ваши.",
      "focus_h": "Ваш язык и ваш IP",
      "docs": [
        [
          "Откуда сайты знают мой язык?",
          "Из заголовка Accept-Language, который уходит с каждым запросом, из navigator.languages в JavaScript и косвенно — из локали, раскладки клавиатуры, голосов озвучки и шрифтов, установленных в системе."
        ],
        [
          "Как его поменять?",
          "В языковых настройках браузера: поставьте нужный язык первым. Если поменять только в одном месте — например, расширением, которое переписывает navigator.languages, — заголовок останется прежним, и они разойдутся."
        ],
        [
          "Почему английский — только «для сведения»?",
          "Английским пользуются везде, поэтому он почти ничего не говорит о том, где вы. Другие языки указывают на страну, и несовпадение с IP становится уликой."
        ]
      ]
    }
  },
  "canvas-fingerprint": {
    "en": {
      "seo_title": "Canvas Fingerprint Test: your canvas, WebGL and audio fingerprints · Who Are You",
      "seo_desc": "Free canvas fingerprint test: the codes that come from how your system draws a canvas, renders WebGL and processes audio, whether your browser adds noise to them, and the combined fingerprint ID sites use to recognize you without cookies.",
      "seo_kw": "canvas fingerprint test, canvas fingerprinting, WebGL fingerprint, audio fingerprint, canvas noise, anti canvas fingerprint",
      "h1": "Canvas fingerprint test",
      "og_sub": "The way your computer draws gives it away",
      "intro": "Ask two computers to draw the same text and shapes, and the pixels come out slightly different: the graphics card, the driver, the fonts and the smoothing all leave a mark. Sites turn that drawing into a fingerprint. Here are yours, and whether your browser scrambles them.",
      "focus_h": "Your canvas fingerprint",
      "docs": [
        [
          "What is a canvas fingerprint?",
          "A page draws text and shapes on an invisible canvas, reads the pixels back and turns them into a short fixed code. The code is the same every time on your machine and different on other machines, so it works like an ID."
        ],
        [
          "How do I stop it?",
          "Use a browser that adds random noise to canvas, WebGL and audio, like Brave (on by default) or Firefox with resistFingerprinting. The \"Fingerprint protection\" row shows whether two drawings came out different."
        ],
        [
          "Do privacy extensions help?",
          "Some do, by wrapping the drawing functions. But that can itself be noticed: the browser environment check flags replaced functions."
        ]
      ]
    },
    "zh-CN": {
      "seo_title": "Canvas 指纹检测：查看你的 Canvas、WebGL 和音频指纹 · 你是谁",
      "seo_desc": "免费 Canvas 指纹检测：看看你的系统画 Canvas、渲染 WebGL、处理音频后算出的指纹，浏览器有没有给它们加干扰，以及网站不用 Cookie 就能认出你的综合指纹 ID。",
      "seo_kw": "Canvas 指纹检测, Canvas 指纹, WebGL 指纹, 音频指纹, Canvas 防指纹, Canvas 噪声, 指纹识别",
      "h1": "Canvas 指纹检测",
      "og_sub": "电脑怎么画图，就暴露了它是哪一台",
      "intro": "让两台电脑画同样的文字和图形，像素会有细微差别：显卡、驱动、字体、抗锯齿都会留下痕迹。网站把这张图算成一串固定的编码，就是指纹。下面是你的，以及浏览器有没有把它们打乱。",
      "focus_h": "你的 Canvas 指纹",
      "docs": [
        [
          "Canvas 指纹是什么？",
          "网页在一块你看不见的画布上画文字和图形，再把像素读回来，算成一串编码。同一台机器每次都一样，不同机器各不相同，所以能拿来当 ID。"
        ],
        [
          "怎么防？",
          "用会给 Canvas、WebGL 和音频加随机干扰的浏览器，比如默认就开着的 Brave，或者打开了 resistFingerprinting 的 Firefox。「防指纹」那一行会告诉你，同一张图画两次，结果是不是不一样。"
        ],
        [
          "隐私插件有用吗？",
          "有些有用，它们给画图函数包了一层。但这一层本身也可能被发现：浏览器环境检测会把被替换的函数标出来。"
        ]
      ]
    },
    "zh-TW": {
      "seo_title": "Canvas 指紋檢測：查看你的 Canvas、WebGL 和音訊指紋 · 你是誰",
      "seo_desc": "免費 Canvas 指紋檢測：看看你的系統畫 Canvas、繪製 WebGL、處理音訊後算出的指紋，瀏覽器有沒有替它們加入干擾，以及網站不用 Cookie 就能認出你的綜合指紋 ID。",
      "seo_kw": "Canvas 指紋檢測, Canvas 指紋, WebGL 指紋, 音訊指紋, Canvas 防指紋, Canvas 雜訊, 指紋辨識",
      "h1": "Canvas 指紋檢測",
      "og_sub": "電腦怎麼畫圖，就洩漏了它是哪一台",
      "intro": "讓兩台電腦畫同樣的文字和圖形，像素會有細微差異：顯示卡、驅動程式、字型、反鋸齒都會留下痕跡。網站把這張圖算成一串固定的編碼，就是指紋。下面是你的，以及瀏覽器有沒有把它們打亂。",
      "focus_h": "你的 Canvas 指紋",
      "docs": [
        [
          "Canvas 指紋是什麼？",
          "網頁在一塊你看不見的畫布上畫文字和圖形，再把像素讀回來，算成一串編碼。同一台機器每次都一樣，不同機器各不相同，所以可以拿來當 ID。"
        ],
        [
          "要怎麼防？",
          "改用會替 Canvas、WebGL 和音訊加入隨機干擾的瀏覽器，例如預設就開著的 Brave，或開啟了 resistFingerprinting 的 Firefox。「防指紋」那一列會告訴你，同一張圖畫兩次，結果是不是不一樣。"
        ],
        [
          "隱私擴充功能有用嗎？",
          "有些有用，它們替繪圖函式包了一層。但這一層本身也可能被發現：瀏覽器環境檢測會把被替換的函式標出來。"
        ]
      ]
    },
    "ja": {
      "seo_title": "Canvas フィンガープリント検査：Canvas・WebGL・音声のフィンガープリント · あなたは誰",
      "seo_desc": "無料の Canvas フィンガープリント検査：Canvas の描画、WebGL、音声処理から得られる値、ブラウザがそれにノイズを加えているか、Cookie なしであなたを見分けるのに使われる総合 ID を表示します。",
      "seo_kw": "Canvas フィンガープリント, Canvas 指紋 検査, WebGL フィンガープリント, 音声 指紋, Canvas ノイズ",
      "h1": "Canvas フィンガープリント検査",
      "og_sub": "描き方で、あなたのパソコンが分かる",
      "intro": "2 台のパソコンに同じ文字と図形を描かせると、ピクセルがわずかに違ってきます。GPU、ドライバー、フォント、文字のなめらか処理がそれぞれ跡を残すからです。サイトはその絵をフィンガープリントに変えます。あなたのフィンガープリントと、ブラウザがそれをかき混ぜているかを示します。",
      "focus_h": "Canvas のフィンガープリント",
      "docs": [
        [
          "Canvas フィンガープリントとは何ですか？",
          "ページが見えないキャンバスに文字と図形を描き、そのピクセルを読み取って、短い固定の値に変えたものです。同じパソコンなら毎回同じ、違うパソコンなら違う値になるので、ID のように使えます。"
        ],
        [
          "防ぐにはどうすればいいですか？",
          "Canvas・WebGL・音声にランダムなノイズを加えるブラウザを使います。標準で有効な Brave や、resistFingerprinting を有効にした Firefox です。2 回の描画結果が違ったかは「フィンガープリント対策」の行で分かります。"
        ],
        [
          "プライバシー系の拡張機能は効きますか？",
          "描画の関数を包むことで効くものもあります。ただ、それ自体が気づかれることもあり、ブラウザ環境チェックでは差し替えられた関数として表示されます。"
        ]
      ]
    },
    "ko": {
      "seo_title": "캔버스 지문 검사: 내 Canvas, WebGL, 오디오 지문 확인 · 당신은 누구",
      "seo_desc": "무료 캔버스 지문 검사: 시스템이 Canvas를 그리고 WebGL을 렌더링하고 오디오를 처리한 결과로 만든 코드(해시), 브라우저가 여기에 잡음을 섞는지, 그리고 사이트가 쿠키 없이 나를 알아보는 종합 지문 ID를 보여 줘요.",
      "seo_kw": "캔버스 지문 검사, 캔버스 핑거프린팅, WebGL 지문, 오디오 지문, 캔버스 노이즈, 캔버스 지문 방지",
      "h1": "캔버스 지문 검사",
      "og_sub": "그림 그리는 방식만으로 내 컴퓨터가 드러나요",
      "intro": "두 컴퓨터에 같은 글자와 도형을 그리게 하면 픽셀이 조금씩 다르게 나와요. 그래픽 카드, 드라이버, 글꼴, 안티에일리어싱이 저마다 흔적을 남기거든요. 사이트는 이 그림을 고정된 코드(해시)로 만들어 지문으로 써요. 내 지문과, 브라우저가 이를 뒤섞는지 보여 드려요.",
      "focus_h": "내 캔버스 지문",
      "docs": [
        [
          "캔버스 지문이 뭔가요?",
          "페이지가 보이지 않는 캔버스에 글자와 도형을 그리고, 그 픽셀을 다시 읽어 고정된 코드(해시)로 만든 거예요. 같은 컴퓨터에서는 매번 같고 컴퓨터마다 달라서, ID처럼 쓰여요."
        ],
        [
          "어떻게 막나요?",
          "Canvas, WebGL, 오디오에 무작위 잡음을 섞는 브라우저를 쓰세요. Brave는 기본으로 그렇게 하고, Firefox는 resistFingerprinting을 켜면 돼요. 두 번 그린 결과가 달랐는지는 '지문 보호' 줄에서 볼 수 있어요."
        ],
        [
          "개인정보 보호 확장 프로그램이 도움이 되나요?",
          "그리기 함수를 감싸서 막아 주는 것도 있어요. 다만 그 자체가 눈에 띌 수 있어요. 브라우저 환경 검사는 바꿔치기된 함수를 잡아내요."
        ]
      ]
    },
    "de": {
      "seo_title": "Canvas-Fingerprint-Test: deine Canvas-, WebGL- und Audio-Fingerabdrücke · Wer bist du?",
      "seo_desc": "Kostenloser Canvas-Fingerprint-Test: die Codes daraus, wie dein System ein Canvas zeichnet, WebGL rendert und Audio verarbeitet, ob dein Browser sie verrauscht, und die Gesamt-ID, mit der Websites dich ohne Cookies wiedererkennen.",
      "seo_kw": "Canvas Fingerprint Test, Canvas Fingerprinting, WebGL Fingerprint, Audio Fingerprint, Canvas Rauschen, Canvas Fingerprint verhindern",
      "h1": "Canvas-Fingerprint-Test",
      "og_sub": "Wie dein Computer zeichnet, verrät ihn",
      "intro": "Lass zwei Computer denselben Text und dieselben Formen zeichnen, und die Pixel fallen leicht unterschiedlich aus: Grafikkarte, Treiber, Schriften und Kantenglättung hinterlassen alle ihre Spur. Websites machen aus dieser Zeichnung einen festen Code, den Fingerabdruck. Hier siehst du deine und ob dein Browser sie verwürfelt.",
      "focus_h": "Dein Canvas-Fingerabdruck",
      "docs": [
        [
          "Was ist ein Canvas-Fingerabdruck?",
          "Eine Seite zeichnet Text und Formen auf ein unsichtbares Canvas, liest die Pixel zurück und macht daraus einen Code. Auf deinem Gerät kommt jedes Mal dasselbe heraus, auf anderen Geräten etwas anderes. Damit funktioniert er wie eine ID."
        ],
        [
          "Wie verhindere ich das?",
          "Nutze einen Browser, der Canvas, WebGL und Audio zufällig verrauscht, etwa Brave (standardmäßig) oder Firefox mit resistFingerprinting. Die Zeile „Fingerabdruckschutz“ zeigt, ob zwei gleiche Zeichnungen unterschiedlich herauskamen."
        ],
        [
          "Helfen Datenschutz-Erweiterungen?",
          "Manche schon, indem sie die Zeichenfunktionen umhüllen. Das kann aber selbst auffallen: Der Browser-Umgebungs-Check markiert ersetzte Funktionen."
        ]
      ]
    },
    "fr": {
      "seo_title": "Test d’empreinte canvas : vos empreintes canvas, WebGL et audio · Qui êtes-vous ?",
      "seo_desc": "Test gratuit d’empreinte canvas : les codes tirés de la façon dont votre système dessine un canvas, affiche du WebGL et traite l’audio, si votre navigateur y ajoute du bruit, et l’ID d’empreinte combiné qui permet aux sites de vous reconnaître sans cookies.",
      "seo_kw": "test empreinte canvas, canvas fingerprinting, empreinte WebGL, empreinte audio, bruit canvas, anti empreinte canvas",
      "h1": "Test d’empreinte canvas",
      "og_sub": "La façon dont votre ordinateur dessine le trahit",
      "intro": "Demandez à deux ordinateurs de dessiner le même texte et les mêmes formes : les pixels ne seront pas tout à fait identiques. La carte graphique, le pilote, les polices et le lissage laissent chacun leur marque. Les sites transforment ce dessin en un code fixe qui sert d’empreinte. Voici les vôtres, et si votre navigateur les brouille.",
      "focus_h": "Votre empreinte canvas",
      "docs": [
        [
          "Qu’est-ce qu’une empreinte canvas ?",
          "Une page dessine du texte et des formes sur un canvas invisible, relit les pixels et en tire un code. Le résultat est le même à chaque fois sur votre machine et diffère d’une machine à l’autre : il fonctionne donc comme un ID."
        ],
        [
          "Comment l’éviter ?",
          "Utilisez un navigateur qui ajoute un bruit aléatoire au canvas, au WebGL et à l’audio, comme Brave par défaut ou Firefox avec resistFingerprinting. La ligne « Protection anti-empreinte » montre si deux dessins identiques sont sortis différents."
        ],
        [
          "Les extensions de confidentialité aident-elles ?",
          "Certaines, oui, en enveloppant les fonctions de dessin. Mais cela peut se remarquer : la vérification de l’environnement du navigateur signale les fonctions remplacées."
        ]
      ]
    },
    "es": {
      "seo_title": "Test de huella canvas: tus huellas canvas, WebGL y de audio · ¿Quién eres?",
      "seo_desc": "Test gratuito de huella canvas: los códigos (hashes) que salen de cómo tu sistema dibuja un canvas, renderiza WebGL y procesa audio, si tu navegador les añade ruido, y el ID de huella combinado que usan las webs para reconocerte sin cookies.",
      "seo_kw": "test huella canvas, canvas fingerprinting, huella WebGL, huella de audio, ruido canvas, anti canvas fingerprint",
      "h1": "Test de huella canvas",
      "og_sub": "La forma en que tu equipo dibuja lo delata",
      "intro": "Pide a dos equipos que dibujen el mismo texto y las mismas formas, y los píxeles saldrán un poco distintos: la tarjeta gráfica, el controlador, las fuentes y el suavizado dejan su marca. Las webs convierten ese dibujo en un código fijo (un hash) y lo usan como huella. Aquí tienes las tuyas, y si tu navegador las mezcla.",
      "focus_h": "Tu huella canvas",
      "docs": [
        [
          "¿Qué es una huella canvas?",
          "Una página dibuja texto y formas en un canvas invisible, vuelve a leer los píxeles y los convierte en un código fijo (un hash). El resultado es siempre el mismo en tu equipo y cambia de un equipo a otro, así que funciona como un ID."
        ],
        [
          "¿Cómo lo evito?",
          "Usa un navegador que añada ruido aleatorio a canvas, WebGL y audio, como Brave por defecto o Firefox con resistFingerprinting. La fila «Protección de huella» muestra si dos dibujos salieron distintos."
        ],
        [
          "¿Sirven las extensiones de privacidad?",
          "Algunas sí, envolviendo las funciones de dibujo. Pero eso mismo se puede notar: el test del entorno del navegador señala las funciones reemplazadas."
        ]
      ]
    },
    "pt": {
      "seo_title": "Teste de fingerprint canvas: suas impressões canvas, WebGL e de áudio · Quem é você?",
      "seo_desc": "Teste grátis de fingerprint canvas: os códigos (hashes) que saem do jeito como seu sistema desenha um canvas, renderiza WebGL e processa áudio, se o seu navegador adiciona ruído a eles, e o ID de impressão combinado que os sites usam para te reconhecer sem cookies.",
      "seo_kw": "teste fingerprint canvas, canvas fingerprinting, fingerprint WebGL, fingerprint de áudio, ruído no canvas, anti canvas fingerprint",
      "h1": "Teste de fingerprint canvas",
      "og_sub": "O jeito como seu computador desenha te entrega",
      "intro": "Peça para dois computadores desenharem o mesmo texto e as mesmas formas, e os pixels saem um pouco diferentes: a placa de vídeo, o driver, as fontes e a suavização deixam uma marca. Os sites transformam esse desenho num código fixo (um hash) e usam como impressão digital. Aqui estão as suas, e se o seu navegador as embaralha.",
      "focus_h": "Sua impressão canvas",
      "docs": [
        [
          "O que é fingerprint canvas?",
          "Uma página desenha texto e formas num canvas invisível, lê os pixels de volta e transforma tudo num código fixo (um hash). O resultado é sempre o mesmo na sua máquina e muda de uma máquina para outra, então funciona como um ID."
        ],
        [
          "Como evito isso?",
          "Use um navegador que adicione ruído aleatório a canvas, WebGL e áudio, como o Brave por padrão ou o Firefox com resistFingerprinting. A linha \"Proteção da impressão\" mostra se dois desenhos saíram diferentes."
        ],
        [
          "Extensões de privacidade ajudam?",
          "Algumas sim, envolvendo as funções de desenho. Mas isso também pode ser notado: o teste do ambiente do navegador aponta funções substituídas."
        ]
      ]
    },
    "ru": {
      "seo_title": "Проверка canvas-отпечатка: ваши отпечатки canvas, WebGL и аудио · Кто вы?",
      "seo_desc": "Бесплатная проверка canvas-отпечатка: коды, полученные из того, как ваша система рисует canvas, выводит WebGL и обрабатывает звук, добавляет ли браузер в них шум, и общий ID отпечатка, по которому сайты узнают вас без cookie.",
      "seo_kw": "проверка canvas отпечатка, canvas fingerprinting, WebGL отпечаток, аудио отпечаток, шум canvas, защита от canvas fingerprint",
      "h1": "Проверка canvas-отпечатка",
      "og_sub": "Компьютер выдаёт себя тем, как рисует",
      "intro": "Попросите два компьютера нарисовать один и тот же текст и фигуры — пиксели выйдут чуть-чуть разными: свой след оставляют видеокарта, драйвер, шрифты и сглаживание. Сайты превращают такой рисунок в постоянный код — отпечаток. Здесь — ваши отпечатки и перемешивает ли их браузер.",
      "focus_h": "Ваш canvas-отпечаток",
      "docs": [
        [
          "Что такое canvas-отпечаток?",
          "Страница рисует текст и фигуры на невидимом canvas, считывает пиксели и получает из них код. На вашем устройстве он каждый раз одинаковый, а на других — другой, поэтому работает как ID."
        ],
        [
          "Как от этого защититься?",
          "Используйте браузер, который добавляет случайный шум в canvas, WebGL и аудио, — например, Brave (по умолчанию) или Firefox с resistFingerprinting. Строка «Защита от отпечатков» показывает, вышли ли два одинаковых рисунка разными."
        ],
        [
          "Помогают ли расширения для приватности?",
          "Некоторые — да: они оборачивают функции рисования. Но это само по себе заметно: проверка окружения браузера отмечает подменённые функции."
        ]
      ]
    }
  },
  "user-agent": {
    "en": {
      "seo_title": "User Agent Check: what browser and system do sites think you use? · Who Are You",
      "seo_desc": "Free user agent check: your User-Agent string and client hints (Sec-CH-UA, platform), the system and browser they claim, and whether the JavaScript engine, graphics card and hints agree with them.",
      "seo_kw": "user agent check, what is my user agent, user agent string, client hints, Sec-CH-UA, user agent spoofing check",
      "h1": "User agent check",
      "og_sub": "What browser and system do sites think you use?",
      "intro": "Every request names your browser and system: once in the User-Agent string and, in Chromium browsers, again in client hints. Pages can cross-check that against the JavaScript engine and the graphics card. Here's what yours claims, and whether the rest agrees.",
      "focus_h": "Your user agent vs your system",
      "docs": [
        [
          "What is a user agent?",
          "A line of text your browser sends with every request, naming the browser, its version and your system. Chromium browsers also send client hints: a newer, more structured version of the same information."
        ],
        [
          "Why does it say Windows 10 when I'm on Windows 11?",
          "For privacy, browsers froze the user agent at Windows 10 (and macOS at 10.15). The real version comes from client hints, and that's what this page shows."
        ],
        [
          "Can I fake it?",
          "You can change the string, but the JavaScript engine, the graphics card and client hints usually tell a different story. The checks on this page show where."
        ]
      ]
    },
    "zh-CN": {
      "seo_title": "UA 检测：网站以为你用什么浏览器和系统？ · 你是谁",
      "seo_desc": "免费 User-Agent 检测：查看你的 UA 字符串和 Client Hints（Sec-CH-UA、平台），它们声称的系统和浏览器，以及 JS 引擎、显卡跟它们对不对得上。",
      "seo_kw": "UA 检测, User-Agent 检测, 我的 UA, UA 查询, Client Hints, Sec-CH-UA, UA 伪装检测, 浏览器 UA",
      "h1": "UA 检测",
      "og_sub": "网站以为你用什么浏览器和系统？",
      "intro": "浏览器每次发请求，都会报上自己是什么浏览器、跑在什么系统上：一次写在 User-Agent（UA）字符串里，Chromium 系的浏览器还会在 Client Hints 里再报一次。网页可以拿它们和 JS 引擎、显卡交叉核对。下面是你的 UA 怎么说，以及其他信息认不认。",
      "focus_h": "你的 UA 和真实系统",
      "docs": [
        [
          "UA 是什么？",
          "浏览器每个请求都会带上的一行文字，写着浏览器、版本和系统。Chromium 系的浏览器还会发 Client Hints，内容差不多，只是换成了更新、更规整的格式。"
        ],
        [
          "为什么 Windows 11 显示成 Windows 10？",
          "为了保护隐私，浏览器把 UA 里的系统版本固定成 Windows 10（macOS 固定成 10.15）。真实版本要看 Client Hints，本页显示的就是它。"
        ],
        [
          "UA 能伪装吗？",
          "字符串可以改，但 JS 引擎、显卡和 Client Hints 往往会说出另一个答案；本页的检测会指出哪里对不上。"
        ]
      ]
    },
    "zh-TW": {
      "seo_title": "UA 檢測：網站以為你用什麼瀏覽器和系統？ · 你是誰",
      "seo_desc": "免費 User-Agent 檢測：查看你的 UA 字串和 Client Hints（Sec-CH-UA、平台），它們聲稱的系統和瀏覽器，以及 JS 引擎、顯示卡跟它們對不對得上。",
      "seo_kw": "UA 檢測, User-Agent 檢測, 我的 UA, UA 查詢, Client Hints, Sec-CH-UA, UA 偽裝檢測, 瀏覽器 UA",
      "h1": "UA 檢測",
      "og_sub": "網站以為你用什麼瀏覽器和系統？",
      "intro": "瀏覽器每次發出請求，都會報上自己是什麼瀏覽器、跑在什麼系統上：一次寫在 User-Agent（UA）字串裡，Chromium 系的瀏覽器還會在 Client Hints 裡再報一次。網頁可以拿它們和 JS 引擎、顯示卡交叉比對。下面是你的 UA 怎麼說，以及其他資訊認不認。",
      "focus_h": "你的 UA 和真實系統",
      "docs": [
        [
          "UA 是什麼？",
          "瀏覽器每個請求都會附上的一行文字，寫著瀏覽器、版本和系統。Chromium 系的瀏覽器還會送出 Client Hints，內容差不多，只是改成比較新、比較有條理的格式。"
        ],
        [
          "為什麼 Windows 11 顯示成 Windows 10？",
          "為了保護隱私，瀏覽器把 UA 裡的系統版本固定成 Windows 10（macOS 固定成 10.15）。真實版本要看 Client Hints，本頁顯示的就是它。"
        ],
        [
          "UA 能偽裝嗎？",
          "字串可以改，但 JS 引擎、顯示卡和 Client Hints 往往會說出另一個答案；本頁的檢測會指出哪裡對不上。"
        ]
      ]
    },
    "ja": {
      "seo_title": "ユーザーエージェント確認：サイトから見たブラウザと OS · あなたは誰",
      "seo_desc": "無料のユーザーエージェント確認：User-Agent 文字列とクライアントヒント（Sec-CH-UA、プラットフォーム）、そこで名乗っている OS とブラウザを表示し、JavaScript エンジン・GPU・ヒントと一致しているかを調べます。",
      "seo_kw": "ユーザーエージェント 確認, UA 確認, User-Agent, クライアントヒント, Sec-CH-UA, UA 偽装",
      "h1": "ユーザーエージェント確認",
      "og_sub": "サイトから見たあなたのブラウザと OS",
      "intro": "リクエストのたびに、ブラウザと OS が名乗られています。User-Agent 文字列で一度、Chromium 系のブラウザではクライアントヒントでもう一度。ページはそれを JavaScript エンジンや GPU と突き合わせることができます。あなたの UA が何と名乗っていて、ほかの手がかりと合っているかを示します。",
      "focus_h": "UA と実際のシステム",
      "docs": [
        [
          "ユーザーエージェントとは何ですか？",
          "ブラウザがリクエストのたびに送る 1 行のテキストで、ブラウザの名前とバージョン、OS が書かれています。Chromium 系のブラウザは、同じ情報を整理した新しい形式のクライアントヒントも送ります。"
        ],
        [
          "Windows 11 なのに Windows 10 と出るのはなぜですか？",
          "プライバシーのため、ブラウザは UA を Windows 10（macOS は 10.15）のまま固定しているからです。実際のバージョンはクライアントヒントから分かり、このページはそれを表示しています。"
        ],
        [
          "偽装できますか？",
          "文字列は変えられますが、JavaScript エンジンや GPU、クライアントヒントが別のことを語っている場合がほとんどです。どこが合わないかは、このページの検査で分かります。"
        ]
      ]
    },
    "ko": {
      "seo_title": "UA 검사: 사이트는 내 브라우저와 시스템을 뭐라고 볼까? · 당신은 누구",
      "seo_desc": "무료 사용자 에이전트(UA) 검사: User-Agent 문자열, 클라이언트 힌트(Sec-CH-UA, 플랫폼), 그것이 주장하는 시스템과 브라우저를 보여 주고, JavaScript 엔진, 그래픽 카드, 힌트가 서로 맞는지 확인해요.",
      "seo_kw": "UA 검사, 사용자 에이전트 확인, 내 user agent, user agent 문자열, 클라이언트 힌트, Sec-CH-UA, UA 위장 확인",
      "h1": "사용자 에이전트(UA) 검사",
      "og_sub": "사이트는 내 브라우저와 시스템을 뭐라고 볼까?",
      "intro": "브라우저는 요청할 때마다 자기 이름과 시스템을 밝혀요. 한 번은 User-Agent 문자열로, Chromium 계열이라면 클라이언트 힌트로 한 번 더요. 페이지는 이것을 JavaScript 엔진과 그래픽 카드와 맞춰 볼 수 있어요. 내 브라우저가 뭐라고 주장하는지, 나머지가 거기에 맞는지 보여 드려요.",
      "focus_h": "내 UA와 실제 시스템",
      "docs": [
        [
          "사용자 에이전트(UA)가 뭔가요?",
          "브라우저가 요청마다 함께 보내는 한 줄짜리 문자열로, 브라우저 이름과 버전, 시스템을 알려요. Chromium 계열 브라우저는 같은 정보를 더 새롭고 정리된 형태로 담은 클라이언트 힌트도 보내요."
        ],
        [
          "Windows 11인데 왜 Windows 10으로 나오나요?",
          "브라우저들이 개인정보 보호를 위해 UA를 Windows 10(macOS는 10.15)에서 더 바꾸지 않기로 했기 때문이에요. 실제 버전은 클라이언트 힌트에서 나오고, 이 페이지는 그 값을 보여 줘요."
        ],
        [
          "UA를 속일 수 있나요?",
          "문자열은 바꿀 수 있지만, JavaScript 엔진, 그래픽 카드, 클라이언트 힌트는 대개 다른 이야기를 해요. 어디서 어긋나는지는 이 페이지의 검사에서 보여요."
        ]
      ]
    },
    "de": {
      "seo_title": "User-Agent-Check: Welchen Browser und welches System sehen Websites? · Wer bist du?",
      "seo_desc": "Kostenloser User-Agent-Check: dein User-Agent-String, die Client Hints (Sec-CH-UA, Plattform), das System und der Browser, die sie angeben, und ob JavaScript-Engine, Grafikkarte und Client Hints dazu passen.",
      "seo_kw": "User-Agent Check, was ist mein User-Agent, User-Agent String, Client Hints, Sec-CH-UA, User-Agent Spoofing erkennen",
      "h1": "User-Agent-Check",
      "og_sub": "Welchen Browser und welches System sehen Websites bei dir?",
      "intro": "Jede Anfrage nennt deinen Browser und dein System: einmal im User-Agent-String und in Chromium-Browsern ein zweites Mal in den Client Hints. Seiten können das mit der JavaScript-Engine und der Grafikkarte abgleichen. Hier siehst du, was deiner angibt und ob der Rest dazu passt.",
      "focus_h": "Dein User-Agent im Vergleich zum System",
      "docs": [
        [
          "Was ist ein User-Agent?",
          "Eine Textzeile, die dein Browser bei jeder Anfrage mitschickt und die Browser, Version und System nennt. Chromium-Browser senden zusätzlich Client Hints, eine neuere, strukturierte Fassung derselben Angaben."
        ],
        [
          "Warum steht da Windows 10, obwohl ich Windows 11 habe?",
          "Aus Datenschutzgründen haben die Browser den User-Agent bei Windows 10 (und macOS bei 10.15) eingefroren. Die echte Version kommt aus den Client Hints, und die zeigt diese Seite."
        ],
        [
          "Kann ich ihn fälschen?",
          "Den String kannst du ändern, aber JavaScript-Engine, Grafikkarte und Client Hints erzählen meist etwas anderes; die Prüfungen auf dieser Seite zeigen, wo."
        ]
      ]
    },
    "fr": {
      "seo_title": "Vérification du user agent : quel navigateur et quel système les sites voient-ils ? · Qui êtes-vous ?",
      "seo_desc": "Vérification gratuite du user agent : votre chaîne User-Agent, les client hints (Sec-CH-UA, plateforme), le système et le navigateur qu’ils annoncent, et si le moteur JavaScript, la carte graphique et les client hints sont d’accord avec eux.",
      "seo_kw": "vérifier user agent, quel est mon user agent, chaîne user agent, client hints, Sec-CH-UA, détection user agent modifié",
      "h1": "Vérification du user agent",
      "og_sub": "Quel navigateur et quel système les sites vous prêtent-ils ?",
      "intro": "Chaque requête nomme votre navigateur et votre système : une fois dans la chaîne User-Agent, et une seconde fois, dans les navigateurs Chromium, dans les client hints. Les pages peuvent recouper cela avec le moteur JavaScript et la carte graphique. Voici ce qu’annonce le vôtre, et si le reste confirme.",
      "focus_h": "Votre user agent face à votre système",
      "docs": [
        [
          "Qu’est-ce que le user agent ?",
          "Une ligne de texte que votre navigateur envoie avec chaque requête, qui nomme le navigateur, sa version et votre système. Les navigateurs Chromium envoient aussi des client hints : une version plus récente et mieux structurée des mêmes informations."
        ],
        [
          "Pourquoi affiche-t-il Windows 10 alors que j’ai Windows 11 ?",
          "Pour protéger la vie privée, les navigateurs ont figé le user agent sur Windows 10 (et sur macOS 10.15). La vraie version vient des client hints, et c’est elle que montre cette page."
        ],
        [
          "Puis-je le falsifier ?",
          "Vous pouvez changer la chaîne, mais le moteur JavaScript, la carte graphique et les client hints racontent souvent une autre histoire ; les contrôles de cette page montrent où."
        ]
      ]
    },
    "es": {
      "seo_title": "Test de user agent: ¿qué navegador y sistema creen las webs que usas? · ¿Quién eres?",
      "seo_desc": "Test gratuito de user agent: tu cadena User-Agent, las client hints (Sec-CH-UA, plataforma), el sistema y el navegador que dicen tener, y si el motor de JavaScript, la tarjeta gráfica y las hints encajan con ellos.",
      "seo_kw": "test user agent, cuál es mi user agent, cadena user agent, client hints, Sec-CH-UA, detectar user agent falso",
      "h1": "Test de user agent",
      "og_sub": "¿Qué navegador y sistema creen las webs que usas?",
      "intro": "Cada petición dice cuál es tu navegador y tu sistema: una vez en la cadena User-Agent y otra, en los navegadores Chromium, en las client hints. Las páginas pueden contrastarlo con el motor de JavaScript y la tarjeta gráfica. Esto es lo que dice el tuyo, y si lo demás encaja.",
      "focus_h": "Tu user agent frente a tu sistema",
      "docs": [
        [
          "¿Qué es el user agent?",
          "Una línea de texto que tu navegador envía en cada petición, con el nombre del navegador, su versión y tu sistema. Los navegadores Chromium también envían client hints, una versión más nueva y ordenada de la misma información."
        ],
        [
          "¿Por qué dice Windows 10 si uso Windows 11?",
          "Los navegadores congelaron el user agent en Windows 10 (y macOS en 10.15) por privacidad. La versión real sale de las client hints, que es lo que muestra esta página."
        ],
        [
          "¿Puedo falsearlo?",
          "Puedes cambiar la cadena, pero el motor de JavaScript, la tarjeta gráfica y las client hints suelen contar otra historia; las pruebas de esta página muestran dónde."
        ]
      ]
    },
    "pt": {
      "seo_title": "Teste de user agent: que navegador e sistema os sites acham que você usa? · Quem é você?",
      "seo_desc": "Teste grátis de user agent: sua string User-Agent, as client hints (Sec-CH-UA, plataforma), o sistema e o navegador que elas dizem ter, e se o motor de JavaScript, a placa de vídeo e as hints batem com eles.",
      "seo_kw": "teste user agent, qual é meu user agent, string user agent, client hints, Sec-CH-UA, detectar user agent falso",
      "h1": "Teste de user agent",
      "og_sub": "Que navegador e sistema os sites acham que você usa?",
      "intro": "Toda requisição diz qual é o seu navegador e o seu sistema: uma vez na string User-Agent e outra, nos navegadores Chromium, nas client hints. As páginas podem conferir isso com o motor de JavaScript e a placa de vídeo. Isto é o que o seu diz ser, e se o resto confirma.",
      "focus_h": "Seu user agent x seu sistema",
      "docs": [
        [
          "O que é user agent?",
          "Uma linha de texto que o navegador envia em toda requisição, com o nome do navegador, a versão e o seu sistema. Navegadores Chromium também enviam client hints, uma versão mais nova e organizada da mesma informação."
        ],
        [
          "Por que aparece Windows 10 se uso Windows 11?",
          "Os navegadores congelaram o user agent no Windows 10 (e o macOS no 10.15) por privacidade. A versão real vem das client hints, que é o que esta página mostra."
        ],
        [
          "Dá para falsificar?",
          "Dá para trocar a string, mas o motor de JavaScript, a placa de vídeo e as client hints costumam contar outra história; os testes desta página mostram onde."
        ]
      ]
    },
    "ru": {
      "seo_title": "Проверка User-Agent: какой браузер и систему видят сайты? · Кто вы?",
      "seo_desc": "Бесплатная проверка User-Agent: ваша строка User-Agent, client hints (Sec-CH-UA, платформа), система и браузер, которые они называют, и согласуются ли с ними движок JavaScript, видеокарта и client hints.",
      "seo_kw": "проверка user agent, какой у меня user agent, строка user agent, client hints, Sec-CH-UA, обнаружение подмены user agent",
      "h1": "Проверка User-Agent",
      "og_sub": "Какой браузер и систему видят у вас сайты?",
      "intro": "Каждый запрос называет ваш браузер и систему: один раз в строке User-Agent и ещё раз — в браузерах на Chromium — в client hints. Страницы могут сверить это с движком JavaScript и видеокартой. Здесь — что заявляет ваш браузер и согласуется ли с этим остальное.",
      "focus_h": "Ваш User-Agent и ваша система",
      "docs": [
        [
          "Что такое User-Agent?",
          "Строка текста, которую браузер отправляет с каждым запросом: название браузера, его версия и ваша система. Браузеры на Chromium отправляют ещё и client hints — более новую и упорядоченную версию тех же сведений."
        ],
        [
          "Почему там Windows 10, хотя у меня Windows 11?",
          "Ради приватности браузеры заморозили User-Agent на Windows 10 (а macOS — на 10.15). Настоящая версия берётся из client hints — её эта страница и показывает."
        ],
        [
          "Можно ли его подделать?",
          "Строку поменять можно, но движок JavaScript, видеокарта и client hints обычно рассказывают другое; проверки на этой странице показывают, где именно."
        ]
      ]
    }
  },
  "extensions": {
    "en": {
      "seo_title": "Browser Extension Check: which of your extensions can sites see? · Who Are You",
      "seo_desc": "Free browser extension check: the extensions that leave a mark any site can read (crypto wallets, developer tools, Grammarly, Dark Reader, translators, antivirus web protection), your ad blocker, and whether something rewrote what sites read.",
      "seo_kw": "browser extension check, detect browser extensions, which extensions can websites see, extension fingerprinting, ad blocker detection, crypto wallet detection",
      "h1": "Browser extension check",
      "og_sub": "Which of your extensions can sites see?",
      "intro": "Many extensions change the page to do their job: a wallet adds an object, a dark mode adds attributes, a translator adds elements, antivirus web protection adds its own script. Any site can read those marks, and they say a lot about you. Here are the ones this page found.",
      "focus_h": "Extensions that change the page",
      "docs": [
        [
          "How can a site see my extensions?",
          "It can't list them, but it can see what they leave behind: objects like window.ethereum, attributes on the page, elements they insert, scripts they add. Extensions that leave nothing behind stay invisible."
        ],
        [
          "Why does it matter?",
          "Extensions narrow you down. A crypto wallet, developer tools or a particular translator says something about who you are, and makes your fingerprint more unique."
        ],
        [
          "What does the tampering check have to do with it?",
          "Extensions that change your user agent, language or time zone, or wrap the drawing functions used for fingerprints, rewrite what sites read. That's what the check at the top looks for."
        ]
      ]
    },
    "zh-CN": {
      "seo_title": "浏览器扩展检测：网站能看到你装了哪些插件吗？ · 你是谁",
      "seo_desc": "免费浏览器扩展检测：看看哪些插件留下了任何网站都读得到的痕迹（加密钱包、开发者工具、Grammarly、Dark Reader、翻译插件、杀毒软件的网页防护），有没有装广告拦截插件，以及有没有东西改写了网站读到的信息。",
      "seo_kw": "浏览器扩展检测, 插件检测, 网站能看到我的插件吗, 扩展指纹, 广告拦截检测, 钱包插件检测, 沉浸式翻译检测",
      "h1": "浏览器扩展检测",
      "og_sub": "网站能看到你装了哪些插件？",
      "intro": "很多插件得改动网页才能干活：钱包往页面里塞对象，深色模式加属性，翻译插件插入元素，杀毒软件的网页防护加进自己的脚本。这些痕迹任何网站都读得到，而且很能说明你是什么人。下面是本页找到的。",
      "focus_h": "改写网页的插件",
      "docs": [
        [
          "网站怎么看到我的插件？",
          "网站没法直接列出你装了什么，但能看到插件留下的东西：window.ethereum 这样的对象、页面上的属性、插进来的元素、加进来的脚本。有些插件什么都不留，那就看不到。"
        ],
        [
          "被看到又怎样？",
          "插件会帮网站缩小范围：装了加密钱包、开发者工具或某个翻译插件，都在透露你是什么人，也让你的指纹更特别。"
        ],
        [
          "和「环境被篡改」有什么关系？",
          "改 UA、语言、时区，或者给算指纹用的画图函数包一层的插件，会改写网站读到的信息。最上面那项检测查的就是这个。"
        ]
      ]
    },
    "zh-TW": {
      "seo_title": "瀏覽器擴充功能檢測：網站看得到你裝了哪些擴充功能嗎？ · 你是誰",
      "seo_desc": "免費瀏覽器擴充功能檢測：看看哪些擴充功能留下了任何網站都讀得到的痕跡（加密錢包、開發人員工具、Grammarly、Dark Reader、翻譯工具、防毒軟體的網頁防護），有沒有裝廣告封鎖擴充功能，以及有沒有東西改寫了網站讀到的資訊。",
      "seo_kw": "瀏覽器擴充功能檢測, 擴充功能檢測, 外掛檢測, 網站看得到我的擴充功能嗎, 擴充功能指紋, 廣告封鎖檢測, 錢包擴充功能檢測",
      "h1": "瀏覽器擴充功能檢測",
      "og_sub": "網站看得到你裝了哪些擴充功能？",
      "intro": "很多擴充功能要改動網頁才能運作：錢包在頁面裡加入物件，深色模式加上屬性，翻譯工具插入元素，防毒軟體的網頁防護加進自己的腳本。這些痕跡任何網站都讀得到，而且很能說明你是什麼樣的人。下面是本頁找到的。",
      "focus_h": "改寫網頁的擴充功能",
      "docs": [
        [
          "網站怎麼看到我的擴充功能？",
          "網站沒辦法直接列出你裝了什麼，但看得到擴充功能留下的東西：window.ethereum 這樣的物件、頁面上的屬性、插進來的元素、加進來的腳本。有些擴充功能什麼都不留，那就看不到。"
        ],
        [
          "被看到又怎樣？",
          "擴充功能會幫網站縮小範圍：裝了加密錢包、開發人員工具或某個翻譯工具，都在透露你是什麼樣的人，也讓你的指紋更好認。"
        ],
        [
          "和「環境被竄改」有什麼關係？",
          "改 UA、語言、時區，或替算指紋用的繪圖函式包一層的擴充功能，會改寫網站讀到的資訊。最上面那項檢測查的就是這個。"
        ]
      ]
    },
    "ja": {
      "seo_title": "ブラウザ拡張機能チェック：サイトから見える拡張機能は？ · あなたは誰",
      "seo_desc": "無料のブラウザ拡張機能チェック：どのサイトでも読める跡を残す拡張機能（暗号資産ウォレット、開発者ツール、Grammarly、Dark Reader、翻訳、ウイルス対策ソフトのウェブ保護）、広告ブロッカー、サイトが読む値の書き換えを調べます。",
      "seo_kw": "ブラウザ 拡張機能 チェック, 拡張機能 検出, サイト 拡張機能 見える, 拡張機能 フィンガープリント, 広告ブロッカー 検出",
      "h1": "ブラウザ拡張機能チェック",
      "og_sub": "サイトから見える拡張機能は？",
      "intro": "多くの拡張機能は、働くためにページに手を加えます。ウォレットはオブジェクトを、ダークモードは属性を、翻訳は要素を、ウイルス対策ソフトのウェブ保護は自前のスクリプトを足します。その跡はどのサイトでも読め、あなたについて多くを語ります。このページで見つかったものを示します。",
      "focus_h": "ページに手を加える拡張機能",
      "docs": [
        [
          "サイトはどうやって拡張機能を知るのですか？",
          "一覧を取ることはできませんが、残した跡は見えます。window.ethereum のようなオブジェクト、ページに付いた属性、挿入された要素、追加されたスクリプトなどです。何も跡を残さない拡張機能は見えません。"
        ],
        [
          "それで何が困るのですか？",
          "拡張機能からあなたが絞り込まれます。暗号資産ウォレット、開発者ツール、特定の翻訳ツールは、あなたがどんな人かを物語り、フィンガープリントもより珍しくします。"
        ],
        [
          "書き換えチェックとはどう関係しますか？",
          "UA・言語・タイムゾーンを変えたり、フィンガープリントに使われる描画の関数を包んだりする拡張機能は、サイトが読む値を書き換えます。上のチェックはそれを探しています。"
        ]
      ]
    },
    "ko": {
      "seo_title": "확장 프로그램 검사: 사이트는 내 확장 프로그램을 볼 수 있을까? · 당신은 누구",
      "seo_desc": "무료 브라우저 확장 프로그램 검사: 어느 사이트든 읽을 수 있는 흔적을 남기는 확장 프로그램(암호화폐 지갑, 개발자 도구, Grammarly, Dark Reader, 번역기, 백신의 웹 보호), 광고 차단기, 그리고 무언가가 사이트가 읽는 값을 바꿨는지 보여 줘요.",
      "seo_kw": "확장 프로그램 검사, 브라우저 확장 탐지, 사이트가 볼 수 있는 확장 프로그램, 확장 프로그램 지문, 광고 차단 탐지, 암호화폐 지갑 탐지",
      "h1": "확장 프로그램 검사",
      "og_sub": "사이트는 내 확장 프로그램을 볼 수 있을까?",
      "intro": "많은 확장 프로그램은 제 역할을 하려고 페이지를 바꿔요. 지갑은 객체를 추가하고, 다크 모드는 속성을 붙이고, 번역기는 요소를 넣고, 백신의 웹 보호는 자체 스크립트를 넣어요. 어느 사이트든 이 흔적을 읽을 수 있고, 흔적은 나에 대해 많은 걸 말해 줘요. 이 페이지가 찾아낸 것을 보여 드려요.",
      "focus_h": "페이지를 바꾸는 확장 프로그램",
      "docs": [
        [
          "사이트가 내 확장 프로그램을 어떻게 볼까요?",
          "목록을 직접 볼 수는 없지만, 확장 프로그램이 남긴 흔적은 볼 수 있어요. window.ethereum 같은 객체, 페이지에 붙은 속성, 끼워 넣은 요소, 추가한 스크립트요. 아무 흔적도 남기지 않아 보이지 않는 확장 프로그램도 있어요."
        ],
        [
          "그게 왜 중요한가요?",
          "확장 프로그램은 나를 좁혀 줘요. 암호화폐 지갑, 개발자 도구, 특정 번역기는 내가 어떤 사람인지 말해 주고, 지문도 더 독특하게 만들어요."
        ],
        [
          "조작 여부 검사와는 무슨 관계인가요?",
          "UA, 언어, 시간대를 바꾸거나 지문에 쓰이는 그리기 함수를 감싸는 확장 프로그램은 사이트가 읽는 값을 바꿔요. 맨 위의 검사가 바로 그걸 찾아요."
        ]
      ]
    },
    "de": {
      "seo_title": "Browser-Erweiterungen prüfen: Welche können Websites sehen? · Wer bist du?",
      "seo_desc": "Kostenloser Check der Browser-Erweiterungen: die Erweiterungen, die Spuren hinterlassen, die jede Website lesen kann (Krypto-Wallets, Entwicklertools, Grammarly, Dark Reader, Übersetzer, Webschutz von Virenscannern), dein Werbeblocker, und ob etwas umgeschrieben hat, was Websites lesen.",
      "seo_kw": "Browser Erweiterungen prüfen, Browser Erweiterungen erkennen, welche Erweiterungen sehen Websites, Extension Fingerprinting, Werbeblocker erkennen, Krypto-Wallet erkennen",
      "h1": "Browser-Erweiterungen prüfen",
      "og_sub": "Welche deiner Erweiterungen sehen Websites?",
      "intro": "Viele Erweiterungen verändern die Seite, um ihre Arbeit zu machen: Eine Wallet fügt ein Objekt hinzu, ein Dunkelmodus Attribute, ein Übersetzer Elemente, der Webschutz eines Virenscanners ein eigenes Skript. Jede Website kann diese Spuren lesen, und sie verraten viel über dich. Hier siehst du, welche diese Seite gefunden hat.",
      "focus_h": "Erweiterungen, die die Seite verändern",
      "docs": [
        [
          "Wie kann eine Website meine Erweiterungen sehen?",
          "Eine Liste bekommt sie nicht, aber sie sieht, was Erweiterungen hinterlassen: Objekte wie window.ethereum, Attribute auf der Seite, eingefügte Elemente, zusätzliche Skripte. Manche Erweiterungen hinterlassen nichts und bleiben unsichtbar."
        ],
        [
          "Warum ist das wichtig?",
          "Erweiterungen grenzen dich ein: Eine Krypto-Wallet, Entwicklertools oder ein bestimmter Übersetzer sagen etwas darüber, wer du bist, und machen deinen Fingerabdruck einmaliger."
        ],
        [
          "Was hat die Manipulationsprüfung damit zu tun?",
          "Erweiterungen, die User-Agent, Sprache oder Zeitzone ändern oder die Zeichenfunktionen für Fingerabdrücke umhüllen, schreiben um, was Websites lesen. Genau danach sucht die Prüfung oben auf der Seite."
        ]
      ]
    },
    "fr": {
      "seo_title": "Détection des extensions : lesquelles les sites peuvent-ils voir ? · Qui êtes-vous ?",
      "seo_desc": "Détection gratuite des extensions du navigateur : celles qui laissent une trace que tout site peut lire (portefeuilles crypto, outils de développement, Grammarly, Dark Reader, traducteurs, protection web d’antivirus), votre bloqueur de publicités, et si quelque chose a réécrit ce que lisent les sites.",
      "seo_kw": "détecter extensions navigateur, quelles extensions les sites voient, empreinte extensions, détection bloqueur de publicités, détection portefeuille crypto",
      "h1": "Détection des extensions",
      "og_sub": "Lesquelles de vos extensions les sites voient-ils ?",
      "intro": "Beaucoup d’extensions modifient la page pour faire leur travail : un portefeuille crypto ajoute un objet, un mode sombre ajoute des attributs, un traducteur ajoute des éléments, la protection web d’un antivirus ajoute son propre script. N’importe quel site peut lire ces traces, et elles en disent long sur vous. Voici celles que cette page a trouvées.",
      "focus_h": "Extensions qui modifient la page",
      "docs": [
        [
          "Comment un site peut-il voir mes extensions ?",
          "Il ne peut pas en obtenir la liste, mais il voit ce qu’elles laissent derrière elles : des objets comme window.ethereum, des attributs sur la page, des éléments qu’elles insèrent, des scripts qu’elles ajoutent. Certaines extensions ne laissent rien et restent invisibles."
        ],
        [
          "Pourquoi est-ce important ?",
          "Les extensions vous distinguent : un portefeuille crypto, des outils de développement ou un traducteur précis disent quelque chose de vous, et rendent votre empreinte plus unique."
        ],
        [
          "Quel rapport avec le contrôle des modifications ?",
          "Les extensions qui changent votre user agent, votre langue ou votre fuseau horaire, ou qui enveloppent les fonctions de dessin utilisées pour l’empreinte, réécrivent ce que lisent les sites. C’est exactement ce que recherche le contrôle affiché en tête."
        ]
      ]
    },
    "es": {
      "seo_title": "Test de extensiones: ¿qué extensiones tuyas pueden ver las webs? · ¿Quién eres?",
      "seo_desc": "Test gratuito de extensiones del navegador: las extensiones que dejan una marca que cualquier web puede leer (monederos de criptomonedas, herramientas de desarrollo, Grammarly, Dark Reader, traductores, la protección web del antivirus), tu bloqueador de anuncios, y si algo ha reescrito lo que leen las webs.",
      "seo_kw": "test extensiones navegador, detectar extensiones del navegador, qué extensiones pueden ver las webs, huella de extensiones, detectar bloqueador de anuncios, detectar monedero cripto",
      "h1": "Test de extensiones del navegador",
      "og_sub": "¿Qué extensiones tuyas pueden ver las webs?",
      "intro": "Muchas extensiones modifican la página para hacer su trabajo: un monedero añade un objeto, un modo oscuro añade atributos, un traductor añade elementos, la protección web del antivirus añade su propio script. Cualquier web puede leer esas marcas, y dicen mucho de ti. Estas son las que encontró esta página.",
      "focus_h": "Extensiones que reescriben la página",
      "docs": [
        [
          "¿Cómo puede una web ver mis extensiones?",
          "No puede ver la lista, pero sí lo que dejan a su paso: objetos como window.ethereum, atributos en la página, elementos que insertan, scripts que añaden. Algunas extensiones no dejan nada y son invisibles."
        ],
        [
          "¿Por qué importa?",
          "Las extensiones te acotan: un monedero de criptomonedas, herramientas de desarrollo o un traductor concreto dicen algo de quién eres, y hacen tu huella más reconocible."
        ],
        [
          "¿Qué tiene que ver el test de manipulación?",
          "Las extensiones que cambian tu user agent, tu idioma o tu zona horaria, o que envuelven las funciones de dibujo que usan las huellas, reescriben lo que leen las webs. Eso es lo que busca la prueba de arriba."
        ]
      ]
    },
    "pt": {
      "seo_title": "Teste de extensões: quais das suas extensões os sites conseguem ver? · Quem é você?",
      "seo_desc": "Teste grátis de extensões do navegador: as extensões que deixam uma marca que qualquer site consegue ler (carteiras de criptomoedas, ferramentas de desenvolvedor, Grammarly, Dark Reader, tradutores, proteção web do antivírus), seu bloqueador de anúncios, e se algo reescreveu o que os sites leem.",
      "seo_kw": "teste extensões do navegador, detectar extensões do navegador, quais extensões os sites veem, fingerprint de extensões, detectar bloqueador de anúncios, detectar carteira cripto",
      "h1": "Teste de extensões do navegador",
      "og_sub": "Quais das suas extensões os sites conseguem ver?",
      "intro": "Muitas extensões mexem na página para fazer o trabalho delas: uma carteira adiciona um objeto, um modo escuro adiciona atributos, um tradutor adiciona elementos, a proteção web do antivírus adiciona o próprio script. Qualquer site consegue ler essas marcas, e elas dizem muito sobre você. Estas são as que esta página encontrou.",
      "focus_h": "Extensões que reescrevem a página",
      "docs": [
        [
          "Como um site consegue ver minhas extensões?",
          "Ele não consegue ver a lista, mas vê o que elas deixam para trás: objetos como window.ethereum, atributos na página, elementos que elas inserem, scripts que adicionam. Algumas extensões não deixam nada e ficam invisíveis."
        ],
        [
          "Por que isso importa?",
          "As extensões estreitam quem você é: uma carteira de criptomoedas, ferramentas de desenvolvedor ou um tradutor específico dizem algo sobre você, e deixam sua impressão digital mais fácil de identificar."
        ],
        [
          "O que o teste de adulteração tem a ver com isso?",
          "Extensões que trocam o user agent, o idioma ou o fuso horário, ou que envolvem as funções de desenho usadas nas impressões digitais, reescrevem o que os sites leem. É isso que o teste lá em cima procura."
        ]
      ]
    },
    "ru": {
      "seo_title": "Проверка расширений браузера: какие из них видят сайты? · Кто вы?",
      "seo_desc": "Бесплатная проверка расширений браузера: расширения, которые оставляют следы, видимые любому сайту (криптокошельки, инструменты разработчика, Grammarly, Dark Reader, переводчики, веб-защита антивирусов), ваш блокировщик рекламы и не переписал ли что-то то, что читают сайты.",
      "seo_kw": "проверка расширений браузера, обнаружение расширений браузера, какие расширения видят сайты, отпечаток расширений, обнаружение блокировщика рекламы, обнаружение криптокошелька",
      "h1": "Проверка расширений браузера",
      "og_sub": "Какие ваши расширения видят сайты?",
      "intro": "Многие расширения меняют страницу, чтобы делать свою работу: кошелёк добавляет объект, тёмная тема — атрибуты, переводчик — элементы, веб-защита антивируса — собственный скрипт. Любой сайт может прочитать эти следы, и они многое о вас говорят. Здесь — те, что нашла эта страница.",
      "focus_h": "Расширения, которые меняют страницу",
      "docs": [
        [
          "Как сайт может увидеть мои расширения?",
          "Получить их список он не может, но видит то, что они оставляют: объекты вроде window.ethereum, атрибуты на странице, вставленные элементы, добавленные скрипты. Некоторые расширения не оставляют ничего и остаются невидимыми."
        ],
        [
          "Почему это важно?",
          "Расширения сужают круг: криптокошелёк, инструменты разработчика или определённый переводчик что-то говорят о вас и делают ваш отпечаток уникальнее."
        ],
        [
          "При чём тут проверка на подмену?",
          "Расширения, которые меняют User-Agent, язык или часовой пояс либо оборачивают функции рисования, по которым снимают отпечаток, переписывают то, что читают сайты. Именно это и ищет проверка вверху страницы."
        ]
      ]
    }
  },
  "anti-detect-browser": {
    en: {
      seo_title: "Anti-Detect Browser Test: does your profile give itself away? · Who Are You",
      seo_desc: "Free anti-detect browser test: checks whether the user agent matches the engine's real version, whether a Worker reads the same navigator as the page, and whether platform, graphics card and time zone agree. No IP is kept, only anonymous counts of how common each value is.",
      seo_kw: "anti-detect browser test, antidetect browser check, multilogin detection, browser profile check, fingerprint browser detection, user agent spoofing detection",
      h1: "Anti-detect browser test", og_sub: "Each part looks right. Do they agree?",
      intro: "An anti-detect browser gives each profile its own user agent, screen, time zone and graphics card. Each value can look perfectly ordinary and still contradict another one. This page reads the parts a rewritten profile has trouble keeping consistent, and shows which ones disagree.",
      focus_h: "Your profile's traces",
      docs: [
        ["What gives an anti-detect browser away?", "Parts that don't agree. A user agent that says Chrome 156 while the engine lacks features Chrome shipped long ago; a Worker that reads a different user agent or language than the page; navigator.platform saying Mac with a Windows user agent; WebGL naming one maker as vendor and another as the card. Sites rarely look for the browser itself; they look for these contradictions."],
        ["Why does the engine's real version matter?", "The user agent is just text, and any browser can rewrite it. The JavaScript features an engine supports can't be rewritten the same way: each Chromium version adds functions (Promise.try in 128, RegExp.escape in 136), so which ones exist pins the engine to a range of versions. A user agent outside that range belongs to a profile, not a real browser."],
        ["How do I make a profile pass?", "Pick a user agent version that matches the browser's core; prefer changes made in the browser's core over injected scripts, so a Worker reads the same values; choose system, platform and graphics vendor as one set; and set the time zone and language to the proxy's country. Then check again here."],
      ],
    },
    "zh-CN": {
      seo_title: "指纹浏览器检测：你的环境配置露馅了吗？ · 你是谁",
      seo_desc: "免费指纹浏览器检测：看 UA 和内核的真实版本是否一致，Worker 里读到的 navigator 和页面里是否相同，平台、显卡和时区对不对得上。适合检查 AdsPower、比特浏览器、Multilogin 等环境。检测在你的浏览器里进行，不存 IP，只累计匿名计数。",
      seo_kw: "指纹浏览器检测, 指纹浏览器, 防关联浏览器, AdsPower 检测, 比特浏览器检测, 环境检测, 浏览器环境一致性, UA 伪装检测",
      h1: "指纹浏览器检测", og_sub: "每一项都像真的，合在一起对得上吗？",
      intro: "指纹浏览器会给每个环境配一套 UA、屏幕、时区和显卡。每一项单看都正常，放在一起却可能互相矛盾。这个页面专门读改过的环境最难保持一致的地方，告诉你哪几项对不上。",
      focus_h: "你的环境痕迹",
      docs: [
        ["指纹浏览器会在哪里露馅？", "露馅在各项互相对不上：UA 写着 Chrome 156，内核却缺 Chrome 早就有的功能；Worker 里读到的 UA 或语言和页面里不一样；UA 是 Windows，navigator.platform 却是 Mac；WebGL 报的厂商是一家，显卡却是另一家。网站很少去认浏览器本身，它们找的就是这些矛盾。"],
        ["为什么要看内核的真实版本？", "UA 只是一串文字，谁都能改。内核支持哪些 JavaScript 功能却改不了：Chromium 每个版本都会加新函数（128 加了 Promise.try，136 加了 RegExp.escape），看有没有这些函数，就能把内核版本框在一个范围里。UA 写的版本落在范围外，说明这是配出来的环境，不是真浏览器。"],
        ["怎样让环境通过检测？", "UA 的版本选成和内核一致；尽量用内核级修改，别用注入脚本，这样 Worker 读到的也一样；系统、平台、显卡厂商选同一套，别混搭；时区和语言设成代理所在国的。改完回到这里再测一次。"],
      ],
    },
    "zh-TW": {
      seo_title: "指紋瀏覽器檢測：你的環境設定露餡了嗎？ · 你是誰",
      seo_desc: "免費指紋瀏覽器檢測：看 UA 和核心的真實版本是否一致，Worker 裡讀到的 navigator 和頁面裡是否相同，平台、顯示卡和時區對不對得上。適合檢查 AdsPower、Multilogin 等環境。檢測在你的瀏覽器裡進行，不存 IP，只累計匿名計數。",
      seo_kw: "指紋瀏覽器檢測, 指紋瀏覽器, 防關聯瀏覽器, AdsPower 檢測, 環境檢測, 瀏覽器環境一致性, UA 偽裝檢測",
      h1: "指紋瀏覽器檢測", og_sub: "每一項都像真的，合在一起對得上嗎？",
      intro: "指紋瀏覽器會替每個環境配一套 UA、螢幕、時區和顯示卡。每一項單看都正常，放在一起卻可能互相矛盾。這個頁面專門讀改過的環境最難維持一致的地方，告訴你哪幾項對不上。",
      focus_h: "你的環境痕跡",
      docs: [
        ["指紋瀏覽器會在哪裡露餡？", "露餡在各項互相對不上：UA 寫著 Chrome 156，核心卻缺少 Chrome 早就有的功能；Worker 裡讀到的 UA 或語言和頁面裡不一樣；UA 是 Windows，navigator.platform 卻是 Mac；WebGL 回報的廠商是一家，顯示卡卻是另一家。網站很少去認瀏覽器本身，它們找的就是這些矛盾。"],
        ["為什麼要看核心的真實版本？", "UA 只是一串文字，誰都能改。核心支援哪些 JavaScript 功能卻改不了：Chromium 每個版本都會加入新函式（128 加了 Promise.try，136 加了 RegExp.escape），看有沒有這些函式，就能把核心版本框在一個範圍裡。UA 寫的版本落在範圍外，代表這是設定出來的環境，不是真的瀏覽器。"],
        ["怎麼讓環境通過檢測？", "UA 的版本選成和核心一致；盡量用核心層級的修改，別用注入腳本，這樣 Worker 讀到的也會一樣；系統、平台、顯示卡廠商選同一套，別混搭；時區和語言設成代理所在國的。改完回到這裡再測一次。"],
      ],
    },
    ja: {
      seo_title: "アンチディテクトブラウザ検査：プロファイルがばれていない？ · あなたは誰",
      seo_desc: "無料のアンチディテクトブラウザ検査：ユーザーエージェントとエンジンの実際のバージョンが合っているか、Worker が読む navigator がページと同じか、プラットフォーム・GPU・タイムゾーンが噛み合っているかを確認します。IP は保存せず、残すのは匿名の集計だけです。",
      seo_kw: "アンチディテクトブラウザ 検出, 指紋ブラウザ, ブラウザプロファイル 検査, UA 偽装 検出, 環境 一貫性",
      h1: "アンチディテクトブラウザ検査", og_sub: "一つひとつは本物らしい。でも、互いに合っている？",
      intro: "アンチディテクトブラウザは、プロファイルごとにユーザーエージェント、画面、タイムゾーン、GPU を用意します。一つずつ見ればごく普通の値でも、別の値と矛盾していることがあります。このページは、書き換えた環境では揃えにくい部分を読み取り、どこが合っていないかを示します。",
      focus_h: "プロファイルの痕跡",
      docs: [
        ["アンチディテクトブラウザはどこでばれるのですか？", "値どうしが合わないところです。Chrome 156 を名乗っているのに、Chrome がずっと前に入れた機能がエンジンにない。Worker が読むユーザーエージェントや言語がページと違う。Windows の UA なのに navigator.platform が Mac。WebGL のベンダーと GPU 名でメーカーが違う。サイトはブラウザそのものより、こうした矛盾を探しています。"],
        ["エンジンの実際のバージョンがなぜ大事なのですか？", "ユーザーエージェントはただの文字列なので、どのブラウザでも書き換えられます。でも、エンジンが備える JavaScript の機能は同じようには書き換えられません。Chromium はバージョンごとに関数を追加するので（128 で Promise.try、136 で RegExp.escape）、どの関数があるかでエンジンのバージョンの範囲が絞れます。その範囲から外れた UA は、本物のブラウザではなく作られたプロファイルです。"],
        ["プロファイルを見破られないようにするには？", "UA のバージョンをブラウザ本体に合わせる。Worker でも同じ値になるよう、スクリプト注入ではなくブラウザ本体側で変更する。システム・プラットフォーム・GPU ベンダーは一揃いで選ぶ。タイムゾーンと言語はプロキシの国に合わせる。そのうえで、ここでもう一度確認してください。"],
      ],
    },
    ko: {
      seo_title: "안티디텍트 브라우저 테스트: 내 브라우저 프로필은 들키지 않을까? · 당신은 누구",
      seo_desc: "무료 안티디텍트 브라우저 테스트: UA가 엔진의 실제 버전과 맞는지, Worker가 페이지와 같은 navigator를 읽는지, 플랫폼, 그래픽 카드, 시간대가 서로 맞는지 확인해요. IP와 원본 데이터는 저장하지 않고, 얼마나 흔한지 알려 주는 익명 집계만 남겨요.",
      seo_kw: "안티디텍트 브라우저 테스트, 안티디텍트 브라우저 검사, 멀티로그인 탐지, 브라우저 프로필 검사, 지문 브라우저 탐지, UA 위장 탐지",
      h1: "안티디텍트 브라우저 테스트", og_sub: "하나하나는 그럴듯해도, 서로 맞을까?",
      intro: "안티디텍트 브라우저는 브라우저 프로필마다 UA, 화면, 시간대, 그래픽 카드를 따로 줘요. 값 하나하나는 아주 평범해 보여도 다른 값과 모순될 수 있어요. 이 페이지는 바꿔 쓴 프로필이 서로 맞추기 어려운 부분을 읽고, 어디가 어긋나는지 알려 줘요.",
      focus_h: "내 브라우저 프로필의 흔적",
      docs: [
        ["안티디텍트 브라우저는 어디서 들키나요?", "서로 맞지 않는 부분에서요. UA는 Chrome 156이라는데 엔진에는 Chrome이 오래전에 넣은 기능이 없거나, Worker가 페이지와 다른 UA나 언어를 읽거나, Windows UA인데 navigator.platform은 Mac이거나, WebGL이 제조사와 그래픽 카드를 서로 다른 회사로 알려 주는 경우예요. 사이트는 브라우저 자체를 찾기보다 이런 모순을 찾아요."],
        ["엔진의 실제 버전이 왜 중요한가요?", "UA는 어느 브라우저든 바꿔 쓸 수 있는 문자열이에요. 하지만 엔진이 지원하는 JavaScript는 그렇게 바꿀 수 없어요. Chromium은 버전마다 함수를 추가하고(128에서 Promise.try, 136에서 RegExp.escape), 그 함수가 있는지로 엔진의 버전 범위가 정해져요. UA가 그 범위를 벗어나면 진짜 브라우저가 아니라 꾸민 프로필이라는 뜻이에요."],
        ["프로필이 통과하려면 어떻게 하나요?", "브라우저 커널과 맞는 UA 버전을 고르세요. 스크립트 주입보다 커널에서 바꾸는 방식을 써서 Worker도 같은 값을 읽게 하세요. 시스템, 플랫폼, 그래픽 제조사는 한 세트로 고르고, 시간대와 언어는 프록시 국가에 맞추세요. 그다음 여기서 다시 확인해 보세요."],
      ],
    },
    es: {
      seo_title: "Test de navegador antidetección: ¿tu perfil se delata? · ¿Quién eres?",
      seo_desc: "Test gratuito de navegador antidetección: comprueba si el user agent coincide con la versión real del motor, si un Worker lee el mismo navigator que la página y si la plataforma, la tarjeta gráfica y la zona horaria encajan. No guarda tu IP ni los datos en bruto, solo recuentos anónimos para saber lo común que eres.",
      seo_kw: "test navegador antidetección, comprobar navegador antidetect, detección multilogin, comprobar perfil del navegador, detectar navegador de huellas, detectar user agent falso",
      h1: "Test de navegador antidetección", og_sub: "Cada parte parece correcta; ¿encajan entre sí?",
      intro: "Un navegador antidetección da a cada perfil su propio user agent, pantalla, zona horaria y tarjeta gráfica. Cada valor puede parecer de lo más normal y aun así contradecir a otro. Esta página lee las partes que a un perfil modificado le cuesta mantener alineadas y te dice cuáles no encajan.",
      focus_h: "Rastros de tu perfil",
      docs: [
        ["¿Qué delata a un navegador antidetección?", "Las partes que no encajan. Un user agent que dice Chrome 156 mientras al motor le faltan funciones que Chrome incluyó hace tiempo; un Worker que lee otro user agent u otro idioma que la página; navigator.platform diciendo Mac con un user agent de Windows; WebGL nombrando a un fabricante como proveedor y a otro como tarjeta. Las webs rara vez buscan el navegador en sí: buscan estas contradicciones."],
        ["¿Por qué importa la versión real del motor?", "El user agent es un texto que cualquier navegador puede reescribir. El JavaScript que admite el motor no se puede reescribir igual: cada versión de Chromium añade funciones (Promise.try en la 128, RegExp.escape en la 136), y su presencia sitúa el motor en un rango. Un user agent fuera de ese rango es un perfil, no un navegador."],
        ["¿Cómo hago que un perfil pase?", "Elige una versión de user agent que encaje con el núcleo del navegador; prefiere los cambios hechos en el núcleo a los scripts inyectados, para que un Worker lea los mismos valores; elige sistema, plataforma y fabricante de la gráfica como un conjunto; y pon la zona horaria y el idioma del país del proxy. Luego vuelve a comprobarlo aquí."],
      ],
    },
    fr: {
      seo_title: "Test de navigateur anti-détection : votre profil se trahit-il ? · Qui êtes-vous ?",
      seo_desc: "Test gratuit de navigateur anti-détection : le user agent correspond-il à la vraie version du moteur ? Un Worker lit-il le même navigator que la page ? Plateforme, carte graphique et fuseau horaire concordent-ils ? Aucune IP ni donnée brute n’est gardée, seulement des compteurs anonymes.",
      seo_kw: "test navigateur anti-détection, navigateur antidetect, détection multilogin, vérifier profil navigateur, détection navigateur d’empreinte, détection user agent modifié",
      h1: "Test de navigateur anti-détection", og_sub: "Chaque détail semble juste ; vont-ils ensemble ?",
      intro: "Un navigateur anti-détection donne à chaque profil son propre user agent, son écran, son fuseau horaire et sa carte graphique. Chaque valeur peut sembler parfaitement ordinaire et pourtant en contredire une autre. Cette page lit les éléments qu’un profil réécrit a du mal à garder cohérents, et indique lesquels se contredisent.",
      focus_h: "Traces de votre profil",
      docs: [
        ["Qu’est-ce qui trahit un navigateur anti-détection ?", "Des éléments qui ne concordent pas. Un user agent qui annonce Chrome 156 alors que le moteur n’a pas des fonctions que Chrome a ajoutées depuis longtemps ; un Worker qui lit un autre user agent ou une autre langue que la page ; navigator.platform qui dit Mac avec un user agent Windows ; WebGL qui donne un fabricant comme fournisseur et un autre pour la carte. Les sites cherchent rarement le navigateur lui-même : ils cherchent ces contradictions."],
        ["Pourquoi la vraie version du moteur compte-t-elle ?", "Le user agent est une chaîne que n’importe quel navigateur peut réécrire. Les fonctions JavaScript que le moteur prend en charge ne se réécrivent pas aussi facilement : chaque version de Chromium en ajoute (Promise.try dans la 128, RegExp.escape dans la 136), et leur présence situe le moteur dans une fourchette de versions. Un user agent hors de cette fourchette, c’est un profil, pas un vrai navigateur."],
        ["Comment faire passer un profil ?", "Choisissez une version de user agent qui correspond au moteur du navigateur ; préférez les modifications faites dans le moteur aux scripts injectés, pour qu’un Worker lise les mêmes valeurs ; choisissez système, plateforme et fabricant graphique comme un tout cohérent ; réglez le fuseau horaire et la langue sur le pays du proxy. Puis revenez vérifier ici."],
      ],
    },
    de: {
      seo_title: "Anti-Detect-Browser-Test: Verrät sich dein Profil? · Wer bist du?",
      seo_desc: "Kostenloser Anti-Detect-Browser-Test: Passt der User-Agent zur echten Version der Engine? Liest ein Worker denselben navigator wie die Seite? Passen Plattform, Grafikkarte und Zeitzone zusammen? IP und Rohdaten werden nicht gespeichert, nur anonyme Zähler.",
      seo_kw: "Anti-Detect-Browser Test, Antidetect Browser prüfen, Multilogin erkennen, Browserprofil prüfen, Fingerprint-Browser erkennen, User-Agent Spoofing erkennen",
      h1: "Anti-Detect-Browser-Test", og_sub: "Jedes Detail wirkt echt, aber passen sie zusammen?",
      intro: "Ein Anti-Detect-Browser gibt jedem Profil einen eigenen User-Agent, Bildschirm, eine eigene Zeitzone und Grafikkarte. Jeder Wert kann völlig normal aussehen und trotzdem einem anderen widersprechen. Diese Seite liest die Teile, die ein umgeschriebenes Profil nur schwer stimmig hält, und zeigt, welche sich widersprechen.",
      focus_h: "Spuren deines Profils",
      docs: [
        ["Was verrät einen Anti-Detect-Browser?", "Teile, die nicht zusammenpassen. Ein User-Agent, der Chrome 156 angibt, während der Engine Funktionen fehlen, die Chrome längst hat; ein Worker, der einen anderen User-Agent oder eine andere Sprache liest als die Seite; navigator.platform, das Mac sagt, bei einem Windows-User-Agent; WebGL, das einen Hersteller als Anbieter und einen anderen als Karte nennt. Websites suchen selten nach dem Browser selbst, sondern nach solchen Widersprüchen."],
        ["Warum zählt die echte Version der Engine?", "Der User-Agent ist ein String, den jeder Browser umschreiben kann. Welche JavaScript-Funktionen die Engine kann, lässt sich nicht so einfach umschreiben: Jede Chromium-Version bringt neue mit (Promise.try in 128, RegExp.escape in 136), und ihr Vorhandensein grenzt die Engine auf einen Versionsbereich ein. Ein User-Agent außerhalb dieses Bereichs ist ein Profil, kein echter Browser."],
        ["Wie bekomme ich ein Profil durch?", "Wähl eine User-Agent-Version, die zum Kern des Browsers passt; bevorzuge Änderungen im Kern statt eingeschleuster Skripte, damit ein Worker dieselben Werte liest; wähl System, Plattform und Grafikhersteller als zusammenpassenden Satz; und stell Zeitzone und Sprache auf das Land des Proxys. Dann hier noch einmal prüfen."],
      ],
    },
    pt: {
      seo_title: "Teste de navegador antidetecção: seu perfil se entrega? · Quem é você?",
      seo_desc: "Teste grátis de navegador antidetecção: confere se o user agent bate com a versão real do motor, se um Worker lê o mesmo navigator que a página e se plataforma, placa de vídeo e fuso horário concordam. Não guarda seu IP nem os dados brutos, só contagens anônimas para dizer quão comum você é.",
      seo_kw: "teste navegador antidetecção, verificar navegador antidetect, detecção multilogin, verificar perfil do navegador, detectar navegador de fingerprint, detectar user agent falso",
      h1: "Teste de navegador antidetecção", og_sub: "Cada parte parece certa; elas combinam entre si?",
      intro: "Um navegador antidetecção dá a cada perfil seu próprio user agent, tela, fuso horário e placa de vídeo. Cada valor pode parecer totalmente normal e mesmo assim contradizer outro. Esta página lê as partes que um perfil modificado tem dificuldade de manter alinhadas e diz quais não batem.",
      focus_h: "Rastros do seu perfil",
      docs: [
        ["O que entrega um navegador antidetecção?", "As partes que não combinam. Um user agent que diz Chrome 156 enquanto falta ao motor recurso que o Chrome lançou há muito tempo; um Worker que lê outro user agent ou outro idioma que a página; navigator.platform dizendo Mac com um user agent de Windows; o WebGL citando um fabricante como fornecedor e outro como placa. Os sites raramente procuram o navegador em si: eles procuram essas contradições."],
        ["Por que a versão real do motor importa?", "O user agent é um texto que qualquer navegador pode reescrever. O JavaScript que o motor suporta não pode ser reescrito do mesmo jeito: cada versão do Chromium adiciona funções (Promise.try na 128, RegExp.escape na 136), e a presença delas situa o motor numa faixa de versões. Um user agent fora dessa faixa é um perfil, não um navegador."],
        ["Como faço um perfil passar?", "Escolha uma versão de user agent que combine com o núcleo do navegador; prefira mudanças feitas no núcleo a scripts injetados, para um Worker ler os mesmos valores; escolha sistema, plataforma e fabricante da placa como um conjunto; e coloque fuso horário e idioma do país do proxy. Depois, confira de novo aqui."],
      ],
    },
    ru: {
      seo_title: "Проверка антидетект-браузера: не выдаёт ли себя ваш профиль? · Кто вы?",
      seo_desc: "Бесплатная проверка антидетект-браузера: совпадает ли User-Agent с настоящей версией движка, видит ли Worker тот же navigator, что и страница, согласуются ли платформа, видеокарта и часовой пояс. IP и исходные данные не сохраняются — только анонимные счётчики.",
      seo_kw: "проверка антидетект браузера, antidetect browser проверка, обнаружение multilogin, проверка профиля браузера, обнаружение браузера для отпечатков, обнаружение подмены user agent",
      h1: "Проверка антидетект-браузера", og_sub: "Каждая деталь выглядит правдоподобно — но сходятся ли они?",
      intro: "Антидетект-браузер даёт каждому профилю свой User-Agent, экран, часовой пояс и видеокарту. Каждое значение может выглядеть совершенно обычным и всё же противоречить другому. Эта страница читает то, что переписанному профилю трудно держать согласованным, и показывает, что не сходится.",
      focus_h: "Следы вашего профиля",
      docs: [
        ["Что выдаёт антидетект-браузер?", "Детали, которые не сходятся. User-Agent говорит «Chrome 156», а в движке нет функций, которые Chrome давно добавил; Worker видит другой User-Agent или язык, чем страница; navigator.platform говорит Mac при User-Agent от Windows; WebGL называет одного производителя поставщиком, а другого — у видеокарты. Сайты редко ищут сам браузер — они ищут такие противоречия."],
        ["Почему важна настоящая версия движка?", "User-Agent — это строка, которую может переписать любой браузер. А набор функций JavaScript, которые поддерживает движок, так просто не перепишешь: каждая версия Chromium добавляет новые (Promise.try в 128, RegExp.escape в 136), и по их наличию движок можно отнести к диапазону версий. User-Agent вне этого диапазона — это профиль, а не настоящий браузер."],
        ["Как сделать профиль правдоподобным?", "Выберите версию User-Agent, совпадающую с ядром браузера; предпочитайте правки в самом ядре внедрённым скриптам, чтобы Worker видел те же значения; выбирайте систему, платформу и производителя видеокарты одним согласованным набором; поставьте часовой пояс и язык страны прокси. Потом проверьте здесь ещё раз."],
      ],
    },
  },
  "icloud-private-relay": {
    en: {
      seo_title: "iCloud Private Relay Check: what sites still see · Who Are You",
      seo_desc: "Free iCloud Private Relay check: whether your address is a relay exit, which network it belongs to, the region it shows, and whether WebRTC leaks anything past it. No IP is kept, only anonymous counts of how common each value is.",
      seo_kw: "iCloud Private Relay check, is Private Relay on, Private Relay IP, Private Relay detection, Safari Private Relay test",
      h1: "iCloud Private Relay check", og_sub: "Is the relay on, and what does it still show?",
      intro: "iCloud Private Relay sends Safari's traffic through two hops, so sites see an exit run by Cloudflare, Akamai or Fastly instead of your own address. Sites can still tell it's a relay, and roughly where you are. Here's what yours shows.",
      focus_h: "Your relay",
      docs: [
        ["Can sites tell I use Private Relay?", "Yes. Apple publishes the list of its exit addresses, and this page checks your address against it. A site sees a relay exit, not your own address, and usually a city or region near you, which Apple keeps on purpose so local content still works."],
        ["Is Private Relay a VPN?", "No. It covers Safari and unencrypted traffic from apps, not every app; you can't point it at another country; and it hides your address from sites, and the sites you visit from your network provider. To a site it looks like a privacy relay, not like someone abroad."],
        ["Why does WebRTC show another relay address?", "Each connection gets its own exit, so the page and WebRTC can come out of different relay addresses. If both are relay exits, nothing is leaking; the check only warns when a real address shows up next to them."],
      ],
    },
    "zh-CN": {
      seo_title: "iCloud 专用代理检测：网站还能看到什么？ · 你是谁",
      seo_desc: "免费 iCloud 专用代理（Private Relay）检测：看你的地址是不是中继出口、属于哪家网络、显示在哪个地区，以及 WebRTC 有没有绕过它漏出真实地址。检测在你的浏览器里进行，不存 IP，只累计匿名计数。",
      seo_kw: "iCloud 专用代理检测, iCloud Private Relay, 专用代理 IP, Private Relay 检测, Safari 专用代理",
      h1: "iCloud 专用代理检测", og_sub: "中继开着吗？还漏了什么？",
      intro: "iCloud 专用代理让 Safari 的流量先后经过两个中继，网站看到的是 Cloudflare、Akamai 或 Fastly 的出口，不是你的地址。但网站仍然看得出这是中继，也知道你大概在哪。下面是你的中继在网站眼里的样子。",
      focus_h: "你的中继",
      docs: [
        ["网站看得出我在用专用代理吗？", "看得出。苹果公开了它所有出口的地址列表，这个页面就是拿你的地址去对照的。网站看到的是中继出口，不是你自己的地址，但通常还能看到你附近的城市或地区：苹果有意保留这一点，好让本地内容照常显示。"],
        ["专用代理是 VPN 吗？", "不是。它只管 Safari 和 App 里没加密的流量，不是所有 App；不能选别的国家；它对网站隐藏你的地址，对网络运营商隐藏你访问了什么。在网站眼里，它像一个隐私中继，而不像一个人在国外。"],
        ["为什么 WebRTC 显示的是另一个中继地址？", "每条连接都有自己的出口，所以页面和 WebRTC 可能从不同的中继地址出去。两个都是中继出口，不算泄露；只有旁边出现了你的真实地址，检测才会报警。"],
      ],
    },
    "zh-TW": {
      seo_title: "iCloud 私密轉送檢測：網站還看得到什麼？ · 你是誰",
      seo_desc: "免費 iCloud 私密轉送（Private Relay）檢測：看你的位址是不是轉送的出口、屬於哪家網路、顯示在哪個地區，以及 WebRTC 有沒有繞過它漏出真實位址。檢測在你的瀏覽器裡進行，不存 IP，只累計匿名計數。",
      seo_kw: "iCloud 私密轉送檢測, iCloud Private Relay, 私密轉送 IP, Private Relay 檢測, Safari 私密轉送",
      h1: "iCloud 私密轉送檢測", og_sub: "轉送開著嗎？還漏了什麼？",
      intro: "iCloud 私密轉送讓 Safari 的流量先後經過兩個中繼站，網站看到的是 Cloudflare、Akamai 或 Fastly 的出口，不是你的位址。但網站還是看得出這是中繼，也知道你大概在哪裡。下面是你的轉送在網站眼中的樣子。",
      focus_h: "你的私密轉送",
      docs: [
        ["網站看得出我在用私密轉送嗎？", "看得出來。Apple 公開了所有出口的位址清單，這個頁面就是拿你的位址去比對。網站看到的是轉送出口，不是你自己的位址，但通常還看得到你附近的城市或地區：Apple 刻意保留這一點，讓在地內容照常顯示。"],
        ["私密轉送是 VPN 嗎？", "不是。它只處理 Safari 和 App 裡沒加密的流量，不是所有 App；不能選其他國家；它對網站隱藏你的位址，對網路業者隱藏你造訪了什麼。在網站眼中，它像一個隱私中繼，而不像一個人在國外。"],
        ["為什麼 WebRTC 顯示的是另一個轉送位址？", "每條連線都有自己的出口，所以頁面和 WebRTC 可能從不同的轉送位址出去。兩個都是轉送出口，不算外洩；只有旁邊出現你的真實位址，檢測才會警告。"],
      ],
    },
    ja: {
      seo_title: "iCloud プライベートリレー検査：それでもサイトに見えるもの · あなたは誰",
      seo_desc: "無料の iCloud プライベートリレー検査：あなたのアドレスがリレーの出口か、どのネットワークのものか、どの地域に見えるか、WebRTC からリレーの外へ何か漏れていないかを確認します。IP は保存せず、残すのは匿名の集計だけです。",
      seo_kw: "iCloud プライベートリレー 確認, Private Relay 検出, プライベートリレー IP, Safari プライベートリレー",
      h1: "iCloud プライベートリレー検査", og_sub: "リレーはオン？それでも見えるものは？",
      intro: "iCloud プライベートリレーは Safari の通信を 2 段階で中継するので、サイトにはあなたのアドレスではなく、Cloudflare・Akamai・Fastly が運営する出口が見えます。それでも、リレーを使っていることやおおよその場所は分かります。あなたのリレーの見え方を示します。",
      focus_h: "あなたのリレー",
      docs: [
        ["プライベートリレーを使っているとサイトに分かりますか？", "分かります。Apple は出口アドレスの一覧を公開しており、このページもそれと照らし合わせています。サイトに見えるのはリレーの出口で、あなた自身のアドレスではありません。ただ、近くの都市や地域は見えることが多く、これは地域向けのコンテンツが使えるよう Apple が意図して残しているものです。"],
        ["プライベートリレーは VPN ですか？", "いいえ。対象は Safari と、アプリの暗号化されていない通信だけで、すべてのアプリではありません。別の国を選ぶこともできません。隠すのは、サイトからはあなたのアドレス、通信事業者からはあなたの閲覧先です。サイトから見れば、海外にいる人ではなく、プライバシー用の中継です。"],
        ["WebRTC に別のリレーアドレスが出るのはなぜですか？", "接続ごとに出口が割り当てられるため、ページと WebRTC が別のリレーアドレスから出ることがあります。どちらもリレーの出口なら、漏れではありません。本当のアドレスが並んで見えたときだけ警告します。"],
      ],
    },
    ko: {
      seo_title: "iCloud 비공개 릴레이 검사: 사이트에 아직 보이는 것 · 당신은 누구",
      seo_desc: "무료 iCloud 비공개 릴레이 검사: 내 주소가 릴레이 출구인지, 어느 네트워크 것인지, 어느 지역으로 보이는지, WebRTC로 다른 주소가 새지 않는지 확인해요. IP와 원본 데이터는 저장하지 않고, 얼마나 흔한지 알려 주는 익명 집계만 남겨요.",
      seo_kw: "iCloud 비공개 릴레이 확인, 비공개 릴레이 켜짐 확인, iCloud Private Relay, 비공개 릴레이 IP, 비공개 릴레이 탐지, Safari 비공개 릴레이",
      h1: "iCloud 비공개 릴레이 검사", og_sub: "릴레이가 켜져 있을까, 그래도 보이는 건?",
      intro: "iCloud 비공개 릴레이는 Safari의 트래픽을 두 단계로 거쳐 보내서, 사이트는 내 주소 대신 Cloudflare, Akamai, Fastly가 운영하는 출구를 봐요. 그래도 사이트는 릴레이라는 걸 알 수 있고, 내가 대략 어디 있는지도 알아요. 내 릴레이가 무엇을 보여 주는지 확인해 드려요.",
      focus_h: "내 릴레이",
      docs: [
        ["사이트는 내가 비공개 릴레이를 쓰는 걸 알까요?", "네. Apple이 출구 주소 목록을 공개하고 있고, 이 페이지는 내 주소를 그 목록과 대조해요. 사이트에는 내 주소가 아니라 릴레이 출구가 보이고, 보통 내 근처의 도시나 지역도 보여요. 지역 콘텐츠가 제대로 나오도록 Apple이 일부러 남겨 둔 거예요."],
        ["비공개 릴레이는 VPN인가요?", "아니에요. Safari와 앱의 암호화되지 않은 트래픽만 맡고 모든 앱을 맡지는 않아요. 다른 나라로 지정할 수도 없어요. 사이트에는 내 주소를, 통신사에는 내가 방문하는 곳을 숨겨 줘요. 사이트 눈에는 해외에 있는 사람이 아니라 개인정보 보호용 중계로 보여요."],
        ["WebRTC에 다른 릴레이 주소가 나오는 이유는?", "연결마다 출구가 따로 정해져서, 페이지와 WebRTC가 서로 다른 릴레이 주소로 나갈 수 있어요. 둘 다 릴레이 출구라면 유출이 아니에요. 그 옆에 실제 주소가 보일 때만 경고해요."],
      ],
    },
    es: {
      seo_title: "Test de iCloud Private Relay: lo que las webs siguen viendo · ¿Quién eres?",
      seo_desc: "Test gratuito de iCloud Private Relay: si tu dirección es una salida del relé, a qué red pertenece, qué región muestra y si WebRTC filtra algo por fuera. No guarda tu IP ni los datos en bruto, solo recuentos anónimos para saber lo común que eres.",
      seo_kw: "test iCloud Private Relay, está activado Private Relay, IP de Private Relay, detectar Private Relay, test Private Relay Safari, relé privado iCloud",
      h1: "Test de iCloud Private Relay", og_sub: "¿Está activado el relé, y qué sigue mostrando?",
      intro: "iCloud Private Relay manda el tráfico de Safari por dos saltos, así que las webs ven una salida gestionada por Cloudflare, Akamai o Fastly en lugar de tu dirección. Aun así, las webs pueden saber que es un relé, y más o menos dónde estás. Esto es lo que muestra el tuyo.",
      focus_h: "Tu relé",
      docs: [
        ["¿Pueden saber las webs que uso Private Relay?", "Sí. Apple publica la lista de sus direcciones de salida, y esta página compara la tuya con ella. Una web ve una salida del relé, no tu propia dirección, y normalmente una ciudad o región cercana a ti, que Apple mantiene a propósito para que el contenido local siga funcionando."],
        ["¿Private Relay es una VPN?", "No. Cubre Safari y el tráfico sin cifrar de las apps, no todas las apps; no se puede apuntar a otro país; y oculta tu dirección a las webs, y a tu proveedor de red lo que visitas. Para una web, parece un relé de privacidad, no alguien en el extranjero."],
        ["¿Por qué WebRTC muestra otra dirección del relé?", "Cada conexión tiene su propia salida, así que la página y WebRTC pueden salir por direcciones del relé distintas. Que las dos sean salidas del relé no es una fuga; la prueba solo avisa si aparece una dirección real junto a ellas."],
      ],
    },
    fr: {
      seo_title: "Vérification du relais privé iCloud : ce que les sites voient encore · Qui êtes-vous ?",
      seo_desc: "Vérification gratuite du relais privé iCloud (iCloud Private Relay) : votre adresse est-elle une sortie du relais, à quel réseau appartient-elle, quelle région affiche-t-elle, et WebRTC laisse-t-il fuir quelque chose malgré lui ? Aucune IP ni donnée brute n’est gardée, seulement des compteurs anonymes.",
      seo_kw: "relais privé iCloud, iCloud Private Relay test, relais privé activé, IP relais privé, détection relais privé, Safari relais privé",
      h1: "Vérification du relais privé iCloud", og_sub: "Le relais est-il actif, et que montre-t-il encore ?",
      intro: "Le relais privé iCloud fait passer le trafic de Safari par deux relais : les sites voient une sortie gérée par Cloudflare, Akamai ou Fastly, et non votre adresse. Les sites peuvent quand même voir que c’est un relais, et à peu près où vous êtes. Voici ce que montre le vôtre.",
      focus_h: "Votre relais",
      docs: [
        ["Les sites voient-ils que j’utilise le relais privé ?", "Oui. Apple publie la liste de ses adresses de sortie, et cette page compare votre adresse à cette liste. Un site voit une sortie du relais, pas votre propre adresse, et en général une ville ou une région proche de vous : Apple la garde exprès pour que les contenus locaux continuent de fonctionner."],
        ["Le relais privé est-il un VPN ?", "Non. Il couvre Safari et le trafic non chiffré des apps, pas toutes les apps ; on ne peut pas choisir un autre pays ; il cache votre adresse aux sites, et cache à votre fournisseur d’accès les sites que vous visitez. Pour un site, cela ressemble à un relais de confidentialité, pas à quelqu’un à l’étranger."],
        ["Pourquoi WebRTC affiche-t-il une autre adresse du relais ?", "Chaque connexion reçoit sa propre sortie : la page et WebRTC peuvent donc sortir par des adresses de relais différentes. Si ce sont toutes deux des sorties du relais, il n’y a pas de fuite ; le contrôle ne signale qu’une vraie adresse à côté d’elles."],
      ],
    },
    de: {
      seo_title: "iCloud Privat-Relay prüfen: Was Websites trotzdem sehen · Wer bist du?",
      seo_desc: "Kostenloser Check für iCloud Privat-Relay (Private Relay): ob deine Adresse ein Relay-Ausgang ist, zu welchem Netz sie gehört, welche Region sie zeigt und ob WebRTC an ihm vorbei etwas verrät. IP und Rohdaten werden nicht gespeichert, nur anonyme Zähler.",
      seo_kw: "iCloud Privat-Relay prüfen, iCloud Private Relay Test, ist Privat-Relay an, Private Relay IP, Private Relay erkennen, Safari Privat-Relay",
      h1: "iCloud Privat-Relay prüfen", og_sub: "Ist das Relay an, und was zeigt es noch?",
      intro: "iCloud Privat-Relay leitet den Verkehr von Safari über zwei Stationen, sodass Websites einen Ausgang von Cloudflare, Akamai oder Fastly sehen statt deiner Adresse. Websites erkennen trotzdem, dass es ein Relay ist, und ungefähr, wo du bist. Hier siehst du, was deins zeigt.",
      focus_h: "Dein Relay",
      docs: [
        ["Merken Websites, dass ich Privat-Relay nutze?", "Ja. Apple veröffentlicht die Liste seiner Ausgangsadressen, und diese Seite vergleicht deine Adresse damit. Eine Website sieht einen Relay-Ausgang, nicht deine eigene Adresse, und meist eine Stadt oder Region in deiner Nähe. Die behält Apple absichtlich bei, damit lokale Inhalte weiter funktionieren."],
        ["Ist Privat-Relay ein VPN?", "Nein. Es deckt Safari und unverschlüsselten Verkehr von Apps ab, nicht jede App; du kannst kein anderes Land wählen; und es versteckt deine Adresse vor Websites und vor deinem Provider, welche Websites du besuchst. Für eine Website sieht das nach einem Datenschutz-Relay aus, nicht nach jemandem im Ausland."],
        ["Warum zeigt WebRTC eine andere Relay-Adresse?", "Jede Verbindung bekommt einen eigenen Ausgang, daher können Seite und WebRTC über verschiedene Relay-Adressen rauskommen. Sind beide Relay-Ausgänge, ist das kein Leck; die Prüfung schlägt nur an, wenn daneben eine echte Adresse auftaucht."],
      ],
    },
    pt: {
      seo_title: "Teste do iCloud Private Relay: o que os sites ainda veem · Quem é você?",
      seo_desc: "Teste grátis do iCloud Private Relay: se o seu endereço é uma saída do relay, de qual rede ele é, que região mostra e se o WebRTC vaza algo por fora. Não guarda seu IP nem os dados brutos, só contagens anônimas para dizer quão comum você é.",
      seo_kw: "teste iCloud Private Relay, Retransmissão Privada do iCloud, Private Relay está ativado, IP do Private Relay, detectar Private Relay, teste Private Relay Safari",
      h1: "Teste do iCloud Private Relay", og_sub: "O relay está ligado, e o que ele ainda mostra?",
      intro: "O iCloud Private Relay (Retransmissão Privada) manda o tráfego do Safari por dois saltos, então os sites veem uma saída operada pela Cloudflare, pela Akamai ou pela Fastly em vez do seu endereço. Mesmo assim, os sites conseguem saber que é um relay, e mais ou menos onde você está. Isto é o que o seu mostra.",
      focus_h: "Seu relay",
      docs: [
        ["Os sites sabem que eu uso o Private Relay?", "Sim. A Apple publica a lista dos endereços de saída, e esta página compara o seu com ela. Um site vê uma saída do relay, não o seu endereço, e normalmente uma cidade ou região perto de você, que a Apple mantém de propósito para o conteúdo local continuar funcionando."],
        ["O Private Relay é uma VPN?", "Não. Ele cobre o Safari e o tráfego não criptografado dos apps, não todos os apps; não dá para apontar para outro país; e ele esconde seu endereço dos sites, e o que você visita da sua operadora. Para um site, parece um relay de privacidade, não alguém no exterior."],
        ["Por que o WebRTC mostra outro endereço do relay?", "Cada conexão ganha a própria saída, então a página e o WebRTC podem sair por endereços diferentes do relay. Os dois serem saídas do relay não é vazamento; o teste só avisa quando aparece um endereço real ao lado deles."],
      ],
    },
    ru: {
      seo_title: "Проверка «Частного узла» iCloud: что сайты видят всё равно · Кто вы?",
      seo_desc: "Бесплатная проверка «Частного узла» iCloud (iCloud Private Relay): является ли ваш адрес выходом ретранслятора, какой сети он принадлежит, какой регион показывает и не утекает ли что-то в обход него через WebRTC. IP и исходные данные не сохраняются — только анонимные счётчики.",
      seo_kw: "частный узел iCloud, iCloud Private Relay проверка, включён ли частный узел, IP частного узла, обнаружение Private Relay, Safari частный узел",
      h1: "Проверка «Частного узла» iCloud", og_sub: "Включён ли ретранслятор и что он всё же показывает?",
      intro: "«Частный узел» iCloud пропускает трафик Safari через два ретранслятора, поэтому сайты видят выход Cloudflare, Akamai или Fastly, а не ваш адрес. Но сайты всё равно понимают, что это ретранслятор, и примерно — где вы. Здесь — что показывает ваш.",
      focus_h: "Ваш ретранслятор",
      docs: [
        ["Видят ли сайты, что я пользуюсь «Частным узлом»?", "Да. Apple публикует список своих выходных адресов, и эта страница сверяет с ним ваш адрес. Сайт видит выход ретранслятора, а не ваш собственный адрес, и обычно город или регион рядом с вами: Apple оставляет его нарочно, чтобы местный контент продолжал работать."],
        ["«Частный узел» — это VPN?", "Нет. Он охватывает Safari и незашифрованный трафик приложений, а не все приложения; другую страну выбрать нельзя; он скрывает ваш адрес от сайтов, а от провайдера — то, какие сайты вы открываете. Для сайта это выглядит как ретранслятор для приватности, а не как человек за границей."],
        ["Почему WebRTC показывает другой адрес ретранслятора?", "Каждое соединение получает свой выход, поэтому страница и WebRTC могут выходить через разные адреса ретранслятора. Если оба — выходы ретранслятора, утечки нет; проверка срабатывает, только если рядом с ними появляется настоящий адрес."],
      ],
    },
  },
  "warp-check": {
    en: {
      seo_title: "Cloudflare WARP Check: is WARP on, and can sites tell? · Who Are You",
      seo_desc: "Free Cloudflare WARP check: whether your traffic goes through WARP, the address and network sites see, the Cloudflare data center you reach and the key exchange in use. No IP is kept, only anonymous counts of how common each value is.",
      seo_kw: "Cloudflare WARP check, is WARP on, WARP detection, 1.1.1.1 WARP test, WARP IP",
      h1: "Cloudflare WARP check", og_sub: "Is WARP on, and what do sites see?",
      intro: "WARP, the VPN in Cloudflare's 1.1.1.1 app, sends your traffic into Cloudflare's network. Any site behind Cloudflare can tell whether a visitor arrives through WARP. Here's what yours says, and which address and network the site sees.",
      focus_h: "Your WARP",
      docs: [
        ["How can a site tell I use WARP?", "Sites behind Cloudflare can read Cloudflare's trace, which says warp=on for traffic that comes through WARP. Even elsewhere, a WARP address belongs to Cloudflare's own network (AS13335), which sites treat as a data center rather than a home connection."],
        ["Does WARP hide where I am?", "Mostly not. WARP exits near you, usually in your own country, so a site can still place you roughly. It's built for privacy and speed, not for appearing somewhere else. Sites see a Cloudflare address instead of your internet provider's."],
        ["What does warp=plus mean?", "The trace says plus for WARP+, the paid tier that uses Cloudflare's faster routes. To a site the two look the same: a Cloudflare address with WARP on."],
      ],
    },
    "zh-CN": {
      seo_title: "Cloudflare WARP 检测：WARP 开着吗？网站看得出吗？ · 你是谁",
      seo_desc: "免费 Cloudflare WARP 检测：看你的流量有没有经过 WARP，网站看到的地址和网络，连到的 Cloudflare 机房，以及用的密钥交换方式。检测在你的浏览器里进行，不存 IP，只累计匿名计数。",
      seo_kw: "Cloudflare WARP 检测, WARP 是否开启, WARP 检测, 1.1.1.1 WARP, WARP IP",
      h1: "Cloudflare WARP 检测", og_sub: "WARP 开着吗？网站看到了什么？",
      intro: "WARP 是 Cloudflare 的 1.1.1.1 App 里的 VPN，会把你的流量送进 Cloudflare 的网络。任何接入 Cloudflare 的网站，都能读到访客是不是经 WARP 来的。下面是你的结果，以及网站看到的地址和网络。",
      focus_h: "你的 WARP",
      docs: [
        ["网站怎么知道我在用 WARP？", "接入 Cloudflare 的网站可以读 Cloudflare 的 trace（一份连接信息），经 WARP 来的流量会显示 warp=on。就算不看这个，WARP 的地址也属于 Cloudflare 自己的网络（AS13335），网站会把它当成机房 IP，而不是家宽。"],
        ["WARP 能隐藏我在哪吗？", "基本不能。WARP 从离你近的地方出去，通常就在你自己的国家，所以网站仍能大致定位到你；它是为隐私和速度设计的，不是为了让你装成在别处。网站看到的是 Cloudflare 的地址，不是你运营商的。"],
        ["warp=plus 是什么意思？", "trace 里显示 plus，表示你用的是 WARP+，也就是走 Cloudflare 更快线路的付费版。在网站看来两者一样：一个 Cloudflare 地址，WARP 开着。"],
      ],
    },
    "zh-TW": {
      seo_title: "Cloudflare WARP 檢測：WARP 開著嗎？網站看得出來嗎？ · 你是誰",
      seo_desc: "免費 Cloudflare WARP 檢測：看你的流量有沒有經過 WARP，網站看到的位址和網路，連到的 Cloudflare 機房，以及使用的金鑰交換方式。檢測在你的瀏覽器裡進行，不存 IP，只累計匿名計數。",
      seo_kw: "Cloudflare WARP 檢測, WARP 是否開啟, WARP 檢測, 1.1.1.1 WARP, WARP IP",
      h1: "Cloudflare WARP 檢測", og_sub: "WARP 開著嗎？網站看到了什麼？",
      intro: "WARP 是 Cloudflare 的 1.1.1.1 App 裡的 VPN，會把你的流量送進 Cloudflare 的網路。任何接入 Cloudflare 的網站，都讀得到訪客是不是透過 WARP 來的。下面是你的結果，以及網站看到的位址和網路。",
      focus_h: "你的 WARP",
      docs: [
        ["網站怎麼知道我在用 WARP？", "接入 Cloudflare 的網站可以讀 Cloudflare 的 trace（一份連線資訊），透過 WARP 來的流量會顯示 warp=on。就算不看這個，WARP 的位址也屬於 Cloudflare 自己的網路（AS13335），網站會把它當成機房 IP，而不是住宅 IP。"],
        ["WARP 能隱藏我在哪裡嗎？", "大多不能。WARP 從離你近的地方出去，通常就在你自己的國家，所以網站還是能大致定位到你；它是為了隱私和速度設計的，不是為了讓你假裝在別的地方。網站看到的是 Cloudflare 的位址，不是你電信業者的。"],
        ["warp=plus 是什麼意思？", "trace 裡顯示 plus，代表你用的是 WARP+，也就是走 Cloudflare 較快線路的付費版。在網站看來兩者一樣：一個 Cloudflare 位址，WARP 開著。"],
      ],
    },
    ja: {
      seo_title: "Cloudflare WARP 検査：WARP はオン？サイトに分かる？ · あなたは誰",
      seo_desc: "無料の Cloudflare WARP 検査：通信が WARP を通っているか、サイトに見えるアドレスとネットワーク、つながった Cloudflare のデータセンター、使われている鍵交換を確認します。IP は保存せず、残すのは匿名の集計だけです。",
      seo_kw: "Cloudflare WARP 確認, WARP オン 確認, WARP 検出, 1.1.1.1 WARP, WARP IP",
      h1: "Cloudflare WARP 検査", og_sub: "WARP はオン？サイトには何が見える？",
      intro: "WARP は Cloudflare の 1.1.1.1 アプリに入っている VPN で、通信を Cloudflare のネットワークに送ります。Cloudflare を通して配信しているサイトなら、訪問者が WARP 経由かどうかを読み取れます。あなたの結果と、サイトに見えるアドレスとネットワークを示します。",
      focus_h: "あなたの WARP",
      docs: [
        ["サイトはどうやって WARP の利用を知るのですか？", "Cloudflare を通して配信しているサイトは Cloudflare の trace を読めて、WARP 経由の通信には warp=on と出ます。それ以外のサイトでも、WARP のアドレスは Cloudflare 自身のネットワーク（AS13335）のものなので、家庭用回線ではなくデータセンターとして扱われます。"],
        ["WARP で居場所は隠せますか？", "ほとんど隠せません。WARP は近くの、たいていは自国の出口から出るので、サイトはおおよその場所をつかめます。WARP はプライバシーと速度のためのもので、別の場所にいるように見せるためのものではありません。サイトに見えるのが、プロバイダーのアドレスではなく Cloudflare のアドレスになるだけです。"],
        ["warp=plus とは何ですか？", "trace の plus は、Cloudflare の速い経路を使う有料版 WARP+ のことです。サイトから見ればどちらも同じで、Cloudflare のアドレスで WARP がオン、というだけです。"],
      ],
    },
    ko: {
      seo_title: "Cloudflare WARP 검사: WARP가 켜져 있고, 사이트가 알아챌까? · 당신은 누구",
      seo_desc: "무료 Cloudflare WARP 검사: 트래픽이 WARP를 거치는지, 사이트가 보는 주소와 네트워크, 연결된 Cloudflare 데이터센터, 사용 중인 키 교환 방식을 확인해요. IP와 원본 데이터는 저장하지 않고, 얼마나 흔한지 알려 주는 익명 집계만 남겨요.",
      seo_kw: "Cloudflare WARP 확인, WARP 켜짐 확인, WARP 탐지, 1.1.1.1 WARP 테스트, WARP IP",
      h1: "Cloudflare WARP 검사", og_sub: "WARP가 켜져 있을까, 사이트에는 뭐가 보일까?",
      intro: "WARP는 Cloudflare 1.1.1.1 앱에 들어 있는 VPN으로, 트래픽을 Cloudflare 네트워크 안으로 보내요. Cloudflare를 쓰는 사이트라면 방문자가 WARP로 들어왔는지 읽을 수 있어요. 내 WARP 상태와, 사이트에 보이는 주소와 네트워크를 보여 드려요.",
      focus_h: "내 WARP",
      docs: [
        ["사이트는 내가 WARP를 쓰는 걸 어떻게 알까요?", "Cloudflare를 쓰는 사이트는 Cloudflare trace에 물어볼 수 있고, WARP로 들어온 트래픽에는 warp=on이라고 나와요. 다른 사이트에서도 WARP 주소는 Cloudflare 자체 네트워크(AS13335)에 속해서, 가정용 회선이 아니라 데이터센터로 분류돼요."],
        ["WARP가 내 위치를 숨겨 주나요?", "대부분 아니에요. WARP 출구는 내 근처, 대개 같은 나라에 있어서 사이트는 여전히 내 대략적인 위치를 알아요. WARP는 개인정보 보호와 속도를 위한 것이지, 다른 곳에 있는 것처럼 보이게 하려는 게 아니에요. 사이트에는 통신사 주소 대신 Cloudflare 주소가 보여요."],
        ["warp=plus는 무슨 뜻인가요?", "trace에 plus라고 나오면 Cloudflare의 더 빠른 경로를 쓰는 유료 요금제 WARP+예요. 사이트가 보기에는 둘 다 같아요. Cloudflare 주소이고, WARP가 켜져 있어요."],
      ],
    },
    es: {
      seo_title: "Test de Cloudflare WARP: ¿está activado WARP y lo notan las webs? · ¿Quién eres?",
      seo_desc: "Test gratuito de Cloudflare WARP: si tu tráfico pasa por WARP, la dirección y la red que ven las webs, el centro de datos de Cloudflare al que llegas y el intercambio de claves que se usa. No guarda tu IP ni los datos en bruto, solo recuentos anónimos para saber lo común que eres.",
      seo_kw: "test Cloudflare WARP, está activado WARP, detectar WARP, test WARP 1.1.1.1, IP de WARP",
      h1: "Test de Cloudflare WARP", og_sub: "¿Está activado WARP, y qué ven las webs?",
      intro: "WARP, la VPN de la app 1.1.1.1 de Cloudflare, envía tu tráfico a la red de Cloudflare. Cualquier web detrás de Cloudflare puede saber si un visitante llega a través de WARP. Esto es lo que dice el tuyo, y qué dirección y qué red ve la web.",
      focus_h: "Tu WARP",
      docs: [
        ["¿Cómo sabe una web que uso WARP?", "Las webs detrás de Cloudflare pueden consultar el trace de Cloudflare, que dice warp=on para el tráfico que llega por WARP. Incluso en otras webs, una dirección de WARP pertenece a la propia red de Cloudflare (AS13335), que las webs clasifican como centro de datos y no como conexión doméstica."],
        ["¿WARP oculta dónde estoy?", "En general, no. WARP sale cerca de ti, normalmente en tu propio país, así que una web sigue ubicándote más o menos donde estás; está pensado para la privacidad y la velocidad, no para parecer de otro sitio. Las webs ven una dirección de Cloudflare en lugar de la de tu proveedor."],
        ["¿Qué significa warp=plus?", "El trace dice plus para WARP+, el plan de pago con las rutas más rápidas de Cloudflare. Para una web, los dos se ven igual: una dirección de Cloudflare y WARP activado."],
      ],
    },
    fr: {
      seo_title: "Vérification de Cloudflare WARP : WARP est-il actif, et les sites le voient-ils ? · Qui êtes-vous ?",
      seo_desc: "Vérification gratuite de Cloudflare WARP : votre trafic passe-t-il par WARP, quelle adresse et quel réseau voient les sites, quel centre de données Cloudflare vous atteignez, et quel échange de clés est utilisé. Aucune IP ni donnée brute n’est gardée, seulement des compteurs anonymes.",
      seo_kw: "vérifier Cloudflare WARP, WARP activé, détection WARP, test 1.1.1.1 WARP, IP WARP",
      h1: "Vérification de Cloudflare WARP", og_sub: "WARP est-il actif, et que voient les sites ?",
      intro: "WARP, le VPN de l’app 1.1.1.1 de Cloudflare, fait entrer votre trafic dans le réseau de Cloudflare. Tout site placé derrière Cloudflare peut savoir si un visiteur arrive par WARP. Voici ce que dit le vôtre, et quelle adresse et quel réseau voit le site.",
      focus_h: "Votre WARP",
      docs: [
        ["Comment un site sait-il que j’utilise WARP ?", "Les sites derrière Cloudflare peuvent consulter le trace de Cloudflare, qui indique warp=on pour le trafic venu par WARP. Même ailleurs, une adresse WARP appartient au réseau de Cloudflare (AS13335), que les sites classent comme datacenter et non comme connexion domestique."],
        ["WARP cache-t-il où je suis ?", "En grande partie, non. WARP sort près de chez vous, en général dans votre propre pays : un site vous situe donc toujours à peu près où vous êtes. WARP est pensé pour la confidentialité et la vitesse, pas pour paraître ailleurs. Les sites voient une adresse Cloudflare au lieu de celle de votre fournisseur d’accès."],
        ["Que signifie warp=plus ?", "Le trace indique plus pour WARP+, la formule payante avec les routes plus rapides de Cloudflare. Pour un site, les deux se ressemblent : une adresse Cloudflare et WARP actif."],
      ],
    },
    de: {
      seo_title: "Cloudflare-WARP-Check: Ist WARP an, und merken Websites das? · Wer bist du?",
      seo_desc: "Kostenloser Cloudflare-WARP-Check: ob dein Verkehr über WARP läuft, welche Adresse und welches Netz Websites sehen, welches Cloudflare-Rechenzentrum du erreichst und welcher Schlüsselaustausch genutzt wird. IP und Rohdaten werden nicht gespeichert, nur anonyme Zähler.",
      seo_kw: "Cloudflare WARP Check, ist WARP an, WARP erkennen, 1.1.1.1 WARP Test, WARP IP",
      h1: "Cloudflare-WARP-Check", og_sub: "Ist WARP an, und was sehen Websites?",
      intro: "WARP, das VPN in der App 1.1.1.1 von Cloudflare, leitet deinen Verkehr ins Netz von Cloudflare. Jede Website hinter Cloudflare kann lesen, ob ein Besucher über WARP kommt. Hier siehst du, was deins sagt und welche Adresse und welches Netz die Website sieht.",
      focus_h: "Dein WARP",
      docs: [
        ["Wie merkt eine Website, dass ich WARP nutze?", "Websites hinter Cloudflare können den Cloudflare-Trace abfragen, der bei Verkehr über WARP warp=on meldet. Auch anderswo gehört eine WARP-Adresse zum Netz von Cloudflare (AS13335), das Websites als Rechenzentrum einstufen und nicht als Privatanschluss."],
        ["Versteckt WARP, wo ich bin?", "Meist nicht. WARP kommt in deiner Nähe raus, meist im eigenen Land, also ordnet dich eine Website weiterhin ungefähr richtig ein. WARP ist für Privatsphäre und Tempo gebaut, nicht dafür, woanders zu wirken. Websites sehen eine Cloudflare-Adresse statt der deines Providers."],
        ["Was bedeutet warp=plus?", "Der Trace meldet plus für WARP+, das kostenpflichtige Angebot mit den schnelleren Routen von Cloudflare. Für eine Website sehen beide gleich aus: eine Cloudflare-Adresse und WARP an."],
      ],
    },
    pt: {
      seo_title: "Teste do Cloudflare WARP: o WARP está ligado, e os sites percebem? · Quem é você?",
      seo_desc: "Teste grátis do Cloudflare WARP: se o seu tráfego passa pelo WARP, o endereço e a rede que os sites veem, o data center da Cloudflare ao qual você chega e a troca de chaves em uso. Não guarda seu IP nem os dados brutos, só contagens anônimas para dizer quão comum você é.",
      seo_kw: "teste Cloudflare WARP, WARP está ligado, detectar WARP, teste WARP 1.1.1.1, IP do WARP",
      h1: "Teste do Cloudflare WARP", og_sub: "O WARP está ligado, e o que os sites veem?",
      intro: "O WARP, a VPN do app 1.1.1.1 da Cloudflare, manda o seu tráfego para dentro da rede da Cloudflare. Qualquer site atrás da Cloudflare consegue saber se um visitante chega pelo WARP. Isto é o que o seu diz, e que endereço e que rede o site vê.",
      focus_h: "Seu WARP",
      docs: [
        ["Como um site sabe que eu uso o WARP?", "Sites atrás da Cloudflare podem consultar o trace da Cloudflare, que diz warp=on para o tráfego que chega pelo WARP. Mesmo em outros sites, um endereço do WARP pertence à própria rede da Cloudflare (AS13335), que os sites classificam como data center, e não como conexão doméstica."],
        ["O WARP esconde onde eu estou?", "Na maior parte, não. O WARP sai perto de você, normalmente no seu próprio país, então um site continua te localizando mais ou menos onde você está; ele foi feito para privacidade e velocidade, não para parecer estar em outro lugar. Os sites veem um endereço da Cloudflare em vez do da sua operadora."],
        ["O que significa warp=plus?", "O trace diz plus para o WARP+, o plano pago com as rotas mais rápidas da Cloudflare. Para um site, os dois parecem iguais: um endereço da Cloudflare e o WARP ligado."],
      ],
    },
    ru: {
      seo_title: "Проверка Cloudflare WARP: включён ли WARP и видят ли это сайты? · Кто вы?",
      seo_desc: "Бесплатная проверка Cloudflare WARP: идёт ли ваш трафик через WARP, какой адрес и какую сеть видят сайты, до какого дата-центра Cloudflare вы доходите и какой обмен ключами используется. IP и исходные данные не сохраняются — только анонимные счётчики.",
      seo_kw: "проверка Cloudflare WARP, включён ли WARP, обнаружение WARP, тест 1.1.1.1 WARP, IP WARP",
      h1: "Проверка Cloudflare WARP", og_sub: "Включён ли WARP и что видят сайты?",
      intro: "WARP — VPN из приложения 1.1.1.1 от Cloudflare — заводит ваш трафик в сеть Cloudflare. Любой сайт за Cloudflare может узнать, пришёл ли посетитель через WARP. Здесь — что говорит ваш и какой адрес и сеть видит сайт.",
      focus_h: "Ваш WARP",
      docs: [
        ["Как сайт узнаёт, что я пользуюсь WARP?", "Сайты за Cloudflare могут заглянуть в трассировку Cloudflare: для трафика через WARP там написано warp=on. Даже в других местах адрес WARP принадлежит собственной сети Cloudflare (AS13335), которую сайты относят к дата-центрам, а не к домашним подключениям."],
        ["Скрывает ли WARP, где я?", "В основном нет. WARP выходит рядом с вами, обычно в вашей же стране, так что сайт по-прежнему примерно знает, где вы: WARP сделан для приватности и скорости, а не для того, чтобы казаться в другом месте. Сайты видят адрес Cloudflare вместо адреса вашего провайдера."],
        ["Что значит warp=plus?", "Так трассировка помечает WARP+, платный тариф с более быстрыми маршрутами Cloudflare. Для сайта оба выглядят одинаково: адрес Cloudflare и включённый WARP."],
      ],
    },
  },
  "http3-ech": {
    en: {
      seo_title: "HTTP/3, ECH and Post-Quantum TLS Test · Who Are You",
      seo_desc: "Free connection test: whether your browser uses HTTP/3, hides the site's name with Encrypted Client Hello (ECH), and agrees on a post-quantum key (X25519MLKEM768), and what a missing one says about your network or proxy. No IP is kept, only anonymous counts of how common each value is.",
      seo_kw: "HTTP/3 test, ECH test, encrypted client hello check, post-quantum TLS test, X25519MLKEM768, QUIC test, TLS check",
      h1: "HTTP/3, ECH and post-quantum test", og_sub: "How modern is your connection, and what's in the way?",
      intro: "On an open network, a current browser talks HTTP/3 over UDP, hides which site it connects to with ECH, and agrees on a key that a future quantum computer can't break. When one of these is missing, something along the way is often the reason. Here's your connection.",
      focus_h: "Your connection",
      docs: [
        ["Why isn't HTTP/3 used?", "HTTP/3 runs over UDP port 443. A browser learns that a site supports it from a first answer over TCP, so it may not switch on a first visit. But if UDP can't get out at all, a network or proxy is blocking it or doesn't carry UDP. Many proxy setups carry only TCP."],
        ["What is ECH, and why is it off?", "Encrypted Client Hello encrypts the name of the site you connect to, which TLS otherwise sends in the clear for anyone along the way to read. The browser needs the site's keys from a DNS HTTPS record: Firefox reads them only over its own DNS over HTTPS, Chrome needs a resolver that returns HTTPS records, and Safari doesn't use ECH yet."],
        ["What does a classical key exchange mean?", "Chrome 124+, Firefox 132+ and Safari 26 offer X25519MLKEM768 by default. A current browser that ends up with plain X25519 points to something in between making its own TLS connection: an antivirus, a company proxy, or a proxy client that terminates TLS. On older browsers it just means the browser is old."],
      ],
    },
    "zh-CN": {
      seo_title: "HTTP/3、ECH 和后量子加密检测 · 你是谁",
      seo_desc: "免费连接协议检测：看你的浏览器有没有用上 HTTP/3，有没有用 ECH 隐藏你访问的网站名，有没有协商后量子密钥（X25519MLKEM768）；缺了哪一项，又说明你的网络或代理出了什么问题。检测在你的浏览器里进行，不存 IP，只累计匿名计数。",
      seo_kw: "HTTP/3 检测, ECH 检测, Encrypted Client Hello, 后量子加密检测, X25519MLKEM768, QUIC 检测, TLS 检测",
      h1: "HTTP/3、ECH 和后量子加密检测", og_sub: "你的连接够新吗？卡在了哪里？",
      intro: "新版浏览器在畅通的网络上，会用 UDP 跑 HTTP/3，用 ECH 把你要去的网站名加密，再协商一把将来量子计算机也破解不了的密钥。少了哪一项，往往是路上的某个东西造成的。下面是你的连接情况。",
      focus_h: "你的连接",
      docs: [
        ["为什么没用上 HTTP/3？", "HTTP/3 走 UDP 443 端口。浏览器要先通过普通的 TCP 连接收到网站的第一次回应，才知道它支持 HTTP/3，所以第一次访问可能还没切过去。但如果 UDP 哪儿都出不去，就是网络或代理把它拦了，或者压根不转发 UDP。很多代理配置只转发 TCP。"],
        ["ECH 是什么？为什么没开？", "ECH（Encrypted Client Hello）会把你要访问的网站名加密。没有它，TLS 握手会明文发出网站名，路上谁都看得到。浏览器得先从 DNS 的 HTTPS 记录里拿到网站的密钥：Firefox 只在用它自己的 DNS over HTTPS 时才去读；Chrome 需要一台能返回 HTTPS 记录的 DNS 服务器；Safari 目前还不用 ECH。"],
        ["密钥交换显示传统方式，说明什么？", "Chrome 124+、Firefox 132+ 和 Safari 26 默认都会提供 X25519MLKEM768。新版浏览器最后却用了普通的 X25519，说明中间有东西自己另建了 TLS 连接：杀毒软件、公司代理，或者会解开 TLS 的代理客户端。如果是旧版浏览器，那只是版本太老。"],
      ],
    },
    "zh-TW": {
      seo_title: "HTTP/3、ECH 與後量子加密檢測 · 你是誰",
      seo_desc: "免費連線協定檢測：看你的瀏覽器有沒有用上 HTTP/3，有沒有用 ECH 隱藏你造訪的網站名稱，有沒有協商後量子金鑰（X25519MLKEM768）；缺了哪一項，又代表你的網路或代理出了什麼問題。檢測在你的瀏覽器裡進行，不存 IP，只累計匿名計數。",
      seo_kw: "HTTP/3 檢測, ECH 檢測, Encrypted Client Hello, 後量子加密檢測, X25519MLKEM768, QUIC 檢測, TLS 檢測",
      h1: "HTTP/3、ECH 與後量子加密檢測", og_sub: "你的連線夠新嗎？卡在哪裡？",
      intro: "新版瀏覽器在暢通的網路上，會用 UDP 跑 HTTP/3，用 ECH 把你要去的網站名稱加密，再協商一把未來量子電腦也破解不了的金鑰。少了哪一項，往往是路上的某個東西造成的。下面是你的連線狀況。",
      focus_h: "你的連線",
      docs: [
        ["為什麼沒用上 HTTP/3？", "HTTP/3 走 UDP 443 連接埠。瀏覽器要先透過一般的 TCP 連線收到網站的第一次回應，才知道它支援 HTTP/3，所以第一次造訪可能還沒切過去。但如果 UDP 哪裡都出不去，就是網路或代理把它擋了，或根本不轉送 UDP。很多代理設定只轉送 TCP。"],
        ["ECH 是什麼？為什麼沒開？", "ECH（Encrypted Client Hello）會把你要造訪的網站名稱加密。沒有它，TLS 交握會以明文送出網站名稱，路上誰都看得到。瀏覽器得先從 DNS 的 HTTPS 紀錄拿到網站的金鑰：Firefox 只在使用它自己的 DNS over HTTPS 時才會去讀；Chrome 需要一台能回傳 HTTPS 紀錄的 DNS 伺服器；Safari 目前還不使用 ECH。"],
        ["金鑰交換顯示傳統方式，代表什麼？", "Chrome 124+、Firefox 132+ 和 Safari 26 預設都會提供 X25519MLKEM768。新版瀏覽器最後卻用了一般的 X25519，代表中間有東西另外建立了 TLS 連線：防毒軟體、公司代理，或是會解開 TLS 的代理用戶端。如果是舊版瀏覽器，那只是版本太舊。"],
      ],
    },
    ja: {
      seo_title: "HTTP/3・ECH・耐量子暗号の検査 · あなたは誰",
      seo_desc: "無料の接続検査：ブラウザが HTTP/3 を使っているか、ECH（Encrypted Client Hello）で接続先のサイト名を隠しているか、耐量子の鍵（X25519MLKEM768）で合意しているか、欠けているならネットワークやプロキシについて何が分かるかを確認します。IP は保存せず、残すのは匿名の集計だけです。",
      seo_kw: "HTTP/3 確認, ECH 確認, Encrypted Client Hello, 耐量子暗号 TLS, X25519MLKEM768, QUIC 確認, TLS 確認",
      h1: "HTTP/3・ECH・耐量子暗号の検査", og_sub: "あなたの接続はどれだけ新しい？何が邪魔している？",
      intro: "制限のないネットワークなら、最新のブラウザは UDP で HTTP/3 を使い、ECH でどのサイトにつなぐかを隠し、将来の量子コンピューターでも破れない鍵で合意します。どれかが欠けているときは、途中の経路にある何かが原因であることがよくあります。あなたの接続を示します。",
      focus_h: "あなたの接続",
      docs: [
        ["HTTP/3 が使われないのはなぜですか？", "HTTP/3 は UDP の 443 番ポートを使います。ブラウザはサイトが HTTP/3 に対応していることを TCP での最初の応答で知るので、初回の訪問ではまだ切り替わらないことがあります。ただ、UDP がどこにも出られないなら、ネットワークかプロキシが遮断しているか、UDP を通していません。TCP しか通さないプロキシ設定はよくあります。"],
        ["ECH とは何ですか？オフなのはなぜですか？", "Encrypted Client Hello は、接続先のサイト名を暗号化する仕組みです。これがないと TLS はサイト名を暗号化せずに送るので、経路上の誰でも読めてしまいます。ブラウザは DNS の HTTPS レコードからサイトの鍵を得る必要があります。Firefox は自身の DNS over HTTPS を使うときだけ読み、Chrome は HTTPS レコードを返す DNS サーバーが必要で、Safari はまだ ECH を使っていません。"],
        ["従来型の鍵交換になっているのはどういう意味ですか？", "Chrome 124 以降、Firefox 132 以降、Safari 26 は、標準で X25519MLKEM768 を提示します。最新のブラウザなのに普通の X25519 になっているなら、途中で独自に TLS 接続を張り直すもの（ウイルス対策ソフト、社内プロキシ、TLS を終端するプロキシのクライアント）があると考えられます。古いブラウザなら、単に古いだけです。"],
      ],
    },
    ko: {
      seo_title: "HTTP/3, ECH, 양자 내성 TLS 테스트 · 당신은 누구",
      seo_desc: "무료 연결 테스트: 브라우저가 HTTP/3를 쓰는지, Encrypted Client Hello(ECH)로 사이트 이름을 숨기는지, 양자 내성 키(X25519MLKEM768)를 쓰는지 확인하고, 빠진 게 있으면 네트워크나 프록시에 대해 무엇을 말해 주는지 알려 드려요. IP와 원본 데이터는 저장하지 않고, 얼마나 흔한지 알려 주는 익명 집계만 남겨요.",
      seo_kw: "HTTP/3 테스트, ECH 테스트, Encrypted Client Hello 확인, 양자 내성 TLS 테스트, X25519MLKEM768, QUIC 테스트, TLS 확인",
      h1: "HTTP/3, ECH, 양자 내성 암호 테스트", og_sub: "내 연결은 얼마나 최신일까, 무엇이 막고 있을까?",
      intro: "막힘 없는 네트워크의 최신 브라우저는 UDP 위에서 HTTP/3로 통신하고, ECH로 어느 사이트에 접속하는지 숨기고, 미래의 양자 컴퓨터로도 풀 수 없는 키를 맺어요. 이 중 하나가 빠졌다면, 경로 중간의 무언가가 원인인 경우가 많아요. 내 연결 상태를 보여 드려요.",
      focus_h: "내 연결",
      docs: [
        ["HTTP/3를 왜 안 쓰나요?", "HTTP/3는 UDP 443 포트로 통신해요. 브라우저는 TCP로 받은 첫 응답에서 사이트가 HTTP/3를 지원한다는 걸 알게 되므로, 첫 방문에서는 아직 전환하지 않을 수 있어요. 하지만 UDP가 어디로도 나가지 못한다면 네트워크나 프록시가 막고 있거나 UDP를 아예 전달하지 않는 거예요. TCP만 전달하는 프록시 설정이 많아요."],
        ["ECH가 뭐고, 왜 꺼져 있나요?", "Encrypted Client Hello는 사이트 이름을 암호화해요. 이게 없으면 TLS는 사이트 이름을 그대로 보내서, 경로에 있는 누구나 읽을 수 있어요. 브라우저는 DNS의 HTTPS 레코드에서 사이트의 키를 받아야 해요. Firefox는 자체 DNS over HTTPS를 쓸 때만 키를 읽고, Chrome은 HTTPS 레코드를 돌려주는 DNS 서버가 필요하며, Safari는 아직 ECH를 쓰지 않아요."],
        ["기존 방식의 키 교환이면 무슨 뜻인가요?", "Chrome 124 이상, Firefox 132 이상, Safari 26은 기본으로 X25519MLKEM768을 제안해요. 최신 브라우저인데 일반 X25519로 연결됐다면, 중간에서 TLS 연결을 따로 맺는 무언가가 있다는 뜻이에요. 백신, 회사 프록시, TLS를 풀어 보는 프록시 클라이언트 같은 것이요. 오래된 브라우저라면 단지 버전이 낮아서예요."],
      ],
    },
    es: {
      seo_title: "Test de HTTP/3, ECH y TLS poscuántico · ¿Quién eres?",
      seo_desc: "Test gratuito de conexión: si tu navegador usa HTTP/3, si oculta el nombre del sitio con Encrypted Client Hello (ECH) y si acuerda una clave poscuántica (X25519MLKEM768), y qué dice de tu red o tu proxy que falte alguno. No guarda tu IP ni los datos en bruto, solo recuentos anónimos para saber lo común que eres.",
      seo_kw: "test HTTP/3, test ECH, comprobar encrypted client hello, test TLS poscuántico, X25519MLKEM768, test QUIC, comprobar TLS",
      h1: "Test de HTTP/3, ECH y poscuántico", og_sub: "¿Qué tan moderna es tu conexión, y qué la frena?",
      intro: "Un navegador actual en una red abierta habla HTTP/3 sobre UDP, oculta con ECH a qué sitio se conecta y acuerda una clave que ni la futura computación cuántica podrá romper. Cuando falta alguna de estas cosas, la causa suele ser algo en el camino. Esta es tu conexión.",
      focus_h: "Tu conexión",
      docs: [
        ["¿Por qué no se usa HTTP/3?", "HTTP/3 va por el puerto UDP 443. Un navegador se entera de que un sitio lo habla por una primera respuesta por TCP, así que en la primera visita puede que aún no cambie; pero si UDP no sale por ningún lado, una red o un proxy lo está bloqueando o no transporta UDP en absoluto. Muchas configuraciones de proxy solo llevan TCP."],
        ["¿Qué es ECH y por qué está desactivado?", "Encrypted Client Hello cifra el nombre del sitio, que TLS envía si no en claro, a la vista de cualquiera en el camino. El navegador necesita las claves del sitio desde un registro DNS HTTPS: Firefox solo las lee con su propio DNS sobre HTTPS; Chrome necesita un servidor DNS que devuelva registros HTTPS; Safari todavía no usa ECH."],
        ["¿Qué significa un intercambio de claves clásico?", "Chrome 124+, Firefox 132+ y Safari 26 ofrecen X25519MLKEM768 por defecto. Un navegador actual que termina con X25519 a secas apunta a algo en medio que crea su propia conexión TLS: un antivirus, un proxy de empresa o un cliente proxy que abre el TLS. En navegadores antiguos, solo es cuestión de edad."],
      ],
    },
    fr: {
      seo_title: "Test HTTP/3, ECH et TLS post-quantique · Qui êtes-vous ?",
      seo_desc: "Test de connexion gratuit : votre navigateur utilise-t-il HTTP/3, cache-t-il le nom du site avec Encrypted Client Hello (ECH), et négocie-t-il une clé post-quantique (X25519MLKEM768) ? Et si l’un manque, ce que cela dit de votre réseau ou de votre proxy. Aucune IP ni donnée brute n’est gardée, seulement des compteurs anonymes.",
      seo_kw: "test HTTP/3, test ECH, encrypted client hello, test TLS post-quantique, X25519MLKEM768, test QUIC, vérifier TLS",
      h1: "Test HTTP/3, ECH et post-quantique", og_sub: "Votre connexion est-elle moderne, et qu’est-ce qui la freine ?",
      intro: "Un navigateur à jour sur un réseau ouvert parle HTTP/3 en UDP, cache avec ECH le nom du site auquel il se connecte, et négocie une clé qu’un futur ordinateur quantique ne pourra pas casser. Quand l’un des trois manque, c’est souvent à cause de quelque chose sur le chemin. Voici votre connexion.",
      focus_h: "Votre connexion",
      docs: [
        ["Pourquoi HTTP/3 n’est-il pas utilisé ?", "HTTP/3 passe par le port UDP 443. Le navigateur apprend qu’un site le parle grâce à une première réponse en TCP : à la première visite, il peut donc ne pas encore basculer. Mais si l’UDP ne sort nulle part, un réseau ou un proxy le bloque, ou ne transporte pas l’UDP du tout. Beaucoup de configurations de proxy ne transportent que le TCP."],
        ["Qu’est-ce que l’ECH, et pourquoi est-il désactivé ?", "Encrypted Client Hello chiffre le nom du site que TLS envoie sinon en clair, lisible par quiconque se trouve sur le chemin. Le navigateur a besoin des clés du site, fournies par un enregistrement DNS de type HTTPS : Firefox ne les lit que via son propre DNS over HTTPS ; Chrome a besoin d’un serveur DNS qui renvoie les enregistrements HTTPS ; Safari n’utilise pas encore ECH."],
        ["Que signifie un échange de clés classique ?", "Chrome 124+, Firefox 132+ et Safari 26 proposent X25519MLKEM768 par défaut. Un navigateur à jour qui finit avec un simple X25519 indique qu’un intermédiaire établit sa propre connexion TLS : un antivirus, un proxy d’entreprise, ou un client proxy qui termine le TLS. Sur un navigateur plus ancien, c’est simplement son âge."],
      ],
    },
    de: {
      seo_title: "HTTP/3-, ECH- und Post-Quanten-TLS-Test · Wer bist du?",
      seo_desc: "Kostenloser Verbindungstest: ob dein Browser HTTP/3 nutzt, den Namen der Website mit Encrypted Client Hello (ECH) verbirgt und einen Post-Quanten-Schlüssel (X25519MLKEM768) aushandelt, und was es über dein Netz oder deinen Proxy sagt, wenn eins davon fehlt. IP und Rohdaten werden nicht gespeichert, nur anonyme Zähler.",
      seo_kw: "HTTP/3 Test, ECH Test, Encrypted Client Hello prüfen, Post-Quanten TLS Test, X25519MLKEM768, QUIC Test, TLS prüfen",
      h1: "HTTP/3-, ECH- und Post-Quanten-Test", og_sub: "Wie modern ist deine Verbindung, und was steht im Weg?",
      intro: "Ein aktueller Browser in einem offenen Netz spricht HTTP/3 über UDP, verbirgt mit ECH, zu welcher Website er sich verbindet, und handelt einen Schlüssel aus, den auch ein künftiger Quantencomputer nicht knackt. Fehlt eins davon, liegt das oft an etwas auf dem Weg. Hier ist deine Verbindung.",
      focus_h: "Deine Verbindung",
      docs: [
        ["Warum wird HTTP/3 nicht genutzt?", "HTTP/3 läuft über UDP-Port 443. Dass eine Website es spricht, erfährt der Browser aus einer ersten Antwort über TCP; beim ersten Besuch schaltet er also womöglich noch nicht um. Kommt UDP aber nirgends raus, blockiert ein Netz oder ein Proxy es oder leitet UDP gar nicht weiter. Viele Proxy-Setups leiten nur TCP weiter."],
        ["Was ist ECH, und warum ist es aus?", "Encrypted Client Hello verschlüsselt den Namen der Website, den TLS sonst im Klartext sendet, lesbar für jeden auf dem Weg. Der Browser braucht dafür die Schlüssel der Website aus einem DNS-Eintrag vom Typ HTTPS: Firefox liest sie nur über sein eigenes DNS over HTTPS; Chrome braucht einen DNS-Server, der HTTPS-Einträge liefert; Safari nutzt ECH noch nicht."],
        ["Was bedeutet ein klassischer Schlüsselaustausch?", "Chrome 124+, Firefox 132+ und Safari 26 bieten standardmäßig X25519MLKEM768 an. Landet ein aktueller Browser bei einfachem X25519, deutet das auf etwas dazwischen hin, das eine eigene TLS-Verbindung aufbaut: einen Virenscanner, einen Firmenproxy oder einen Proxy-Client, der TLS terminiert. Bei älteren Browsern liegt es einfach am Alter."],
      ],
    },
    pt: {
      seo_title: "Teste de HTTP/3, ECH e TLS pós-quântico · Quem é você?",
      seo_desc: "Teste grátis de conexão: se o seu navegador usa HTTP/3, esconde o nome do site com Encrypted Client Hello (ECH) e combina uma chave pós-quântica (X25519MLKEM768), e o que a falta de algum deles diz sobre sua rede ou seu proxy. Não guarda seu IP nem os dados brutos, só contagens anônimas para dizer quão comum você é.",
      seo_kw: "teste HTTP/3, teste ECH, verificar encrypted client hello, teste TLS pós-quântico, X25519MLKEM768, teste QUIC, verificar TLS",
      h1: "Teste de HTTP/3, ECH e pós-quântico", og_sub: "Quão moderna é a sua conexão, e o que está no caminho?",
      intro: "Um navegador atual numa rede aberta fala HTTP/3 sobre UDP, esconde com ECH a qual site está se conectando e combina uma chave que um futuro computador quântico não vai conseguir quebrar. Quando falta um desses, muitas vezes a causa é algo no caminho. Esta é a sua conexão.",
      focus_h: "Sua conexão",
      docs: [
        ["Por que o HTTP/3 não é usado?", "O HTTP/3 roda na porta UDP 443. O navegador descobre que um site fala HTTP/3 a partir de uma primeira resposta por TCP, então na primeira visita ele pode ainda não trocar; mas se o UDP não sai para lugar nenhum, uma rede ou um proxy está bloqueando ou nem leva UDP. Muitas configurações de proxy só levam TCP."],
        ["O que é ECH e por que está desligado?", "O Encrypted Client Hello criptografa o nome do site, que o TLS, sem ele, envia aberto para qualquer um no caminho ler. O navegador precisa das chaves do site num registro DNS HTTPS: o Firefox só lê isso com o próprio DNS sobre HTTPS; o Chrome precisa de um servidor DNS que devolva registros HTTPS; o Safari ainda não usa ECH."],
        ["O que significa uma troca de chaves clássica?", "Chrome 124+, Firefox 132+ e Safari 26 oferecem X25519MLKEM768 por padrão. Um navegador atual que acaba com X25519 puro aponta para algo no meio que cria a própria conexão TLS: um antivírus, um proxy da empresa ou um cliente de proxy que abre o TLS. Em navegadores antigos, é só a idade."],
      ],
    },
    ru: {
      seo_title: "Проверка HTTP/3, ECH и постквантового TLS · Кто вы?",
      seo_desc: "Бесплатная проверка соединения: использует ли ваш браузер HTTP/3, скрывает ли имя сайта с помощью Encrypted Client Hello (ECH) и договаривается ли о постквантовом ключе (X25519MLKEM768) — и что говорит отсутствие одного из них о вашей сети или прокси. IP и исходные данные не сохраняются — только анонимные счётчики.",
      seo_kw: "проверка HTTP/3, проверка ECH, encrypted client hello, проверка постквантового TLS, X25519MLKEM768, проверка QUIC, проверка TLS",
      h1: "Проверка HTTP/3, ECH и постквантовой защиты", og_sub: "Насколько современно ваше соединение и что ему мешает?",
      intro: "Свежий браузер в открытой сети работает по HTTP/3 поверх UDP, с помощью ECH скрывает, к какому сайту подключается, и договаривается о ключе, который не взломает и будущий квантовый компьютер. Если чего-то из этого нет, причина часто в чём-то на пути. Здесь — ваше соединение.",
      focus_h: "Ваше соединение",
      docs: [
        ["Почему не используется HTTP/3?", "HTTP/3 работает через UDP-порт 443. О том, что сайт его поддерживает, браузер узнаёт из первого ответа по TCP, поэтому при первом визите он может ещё не переключиться. Но если UDP никуда не выходит, его блокирует сеть или прокси — или прокси вообще не передаёт UDP. Многие прокси-конфигурации передают только TCP."],
        ["Что такое ECH и почему он выключен?", "Encrypted Client Hello шифрует имя сайта, которое TLS иначе отправляет открытым текстом, — его может прочитать любой на пути. Для этого браузеру нужны ключи сайта из DNS-записи типа HTTPS: Firefox читает их только через свой DNS over HTTPS; Chrome нужен DNS-сервер, который возвращает записи HTTPS; Safari ECH пока не использует."],
        ["Что значит классический обмен ключами?", "Chrome 124+, Firefox 132+ и Safari 26 по умолчанию предлагают X25519MLKEM768. Если свежий браузер в итоге получает обычный X25519, значит, посередине что-то устанавливает собственное TLS-соединение: антивирус, корпоративный прокси или прокси-клиент, который сам завершает TLS. У старых браузеров дело просто в возрасте."],
      ],
    },
  },
  "ai-agent": {
    en: {
      seo_title: "AI agent check: is this browser driven by a script? · Who Are You",
      seo_desc: "Is a script or an AI agent driving this browser? Read the headless-browser traces, driver globals and pointer behaviour any site can see: no permission needed, nothing kept. Ten languages.",
      seo_kw: "AI agent detection, headless browser check, bot detection, automation detection, is my browser automated, playwright puppeteer detection",
      h1: "AI agent check", og_sub: "Is a script or an AI at the controls?",
      intro: "AI browsing agents (Atlas, Comet and the like) use the same browsers you do, so the fingerprint alone rarely gives them away. What does: a browser running headless, a driver's globals left in the page, and a pointer that jumps straight to each click. This page reads those, and the disguise check's automation row judges them.",
      focus_h: "Is this browser automated?",
      docs: [
        ["Can a website tell an AI agent from me?", "Often, yes. AI browsing agents are handed the same Chrome you use, so the fingerprint looks ordinary. But the tools that drive them (Playwright, Puppeteer, Selenium, CDP) leave traces: missing browser objects, injected globals, a window with no frame, and clicks that arrive with no mouse path before them. Research on browser agents (FP-Agent, arXiv 2605.01247) found behaviour separates them better than the fingerprint."],
        ["What is a headless browser?", "A browser with no visible window, used by servers, scripts and agent tools. It usually misses window.chrome, reports a zero-size window, has no languages, or says HeadlessChrome in its user agent. A site reads all that without a permission prompt."],
        ["Does my browser look automated if I use an extension?", "Only if the extension injects driver-like globals into the page. A normal privacy extension changes what JavaScript reads, not the browser's window, and lie detection covers that. The row on this page names what was found, so you can tell."],
      ],
    },
    "zh-CN": {
      seo_title: "AI 代理检测：这个浏览器是脚本在操作吗？ · 你是谁",
      seo_desc: "看看这个浏览器像不像脚本或 AI 在操作：无头浏览器痕迹、驱动注入的变量、鼠标轨迹，都是网站不用授权就能看到的。不存任何数据，10 种语言。",
      seo_kw: "AI 代理检测, 无头浏览器检测, 自动化检测, 机器人检测, Playwright 检测, Puppeteer 检测",
      h1: "AI 代理检测", og_sub: "是脚本或 AI 在操作吗？",
      intro: "AI 浏览代理（Atlas、Comet 这类）用的是和你一样的浏览器，光看指纹往往分不出来。能看出来的是：浏览器跑在无头模式、页面里留着驱动注入的变量、指针没有轨迹就直接点到目标上。这一页读这三类信号，防伪检查里的「自动化」一项会给出判断。",
      focus_h: "这个浏览器是自动化的吗？",
      docs: [
        ["网站能分辨 AI 代理和我吗？", "常常能。AI 浏览代理拿到的也是普通的 Chrome，指纹看起来很普通；但驱动它的工具（Playwright、Puppeteer、Selenium、CDP）会留下痕迹：缺浏览器对象、注入的全局变量、没有边框的窗口，以及点击前没有鼠标轨迹。关于浏览代理的研究（FP-Agent, arXiv 2605.01247）发现，行为比指纹更能区分它们。"],
        ["无头浏览器是什么？", "没有可见窗口的浏览器，服务器、脚本和代理工具在用。它通常缺 window.chrome、窗口大小是 0、没有语言列表，或者 UA 里写着 HeadlessChrome。网站不用问就能读到这些。"],
        ["装了扩展会不会被当成自动化？", "只有扩展往页面里塞了类似驱动的变量才会。普通的隐私扩展改的是 JS 读到的值，不是浏览器的窗口，这由「谎言检测」来看。这一页的行会写明具体发现了什么，可以自己判断。"],
      ],
    },
    "zh-TW": {
      seo_title: "AI 代理偵測：這個瀏覽器是腳本在操作嗎？ · 你是誰",
      seo_desc: "看看這個瀏覽器像不像腳本或 AI 在操作：無頭瀏覽器痕跡、驅動程式注入的變數、滑鼠軌跡，都是網站不用授權就能看到的。不存任何資料，10 種語言。",
      seo_kw: "AI 代理偵測, 無頭瀏覽器偵測, 自動化偵測, 機器人偵測, Playwright, Puppeteer",
      h1: "AI 代理偵測", og_sub: "是腳本或 AI 在操作嗎？",
      intro: "AI 瀏覽代理（Atlas、Comet 這類）用的是和你一樣的瀏覽器，光看指紋往往分不出來。能看出來的是：瀏覽器跑在無頭模式、頁面裡留著驅動程式注入的變數、指標沒有軌跡就直接點到目標上。這一頁讀這三類訊號，防偽檢查裡的「自動化」一項會給出判斷。",
      focus_h: "這個瀏覽器是自動化的嗎？",
      docs: [
        ["網站能分辨 AI 代理和我嗎？", "常常能。AI 瀏覽代理拿到的也是普通的 Chrome，指紋看起來很普通；但驅動它的工具（Playwright、Puppeteer、Selenium、CDP）會留下痕跡：缺瀏覽器物件、注入的全域變數、沒有邊框的視窗，以及點擊前沒有滑鼠軌跡。關於瀏覽代理的研究（FP-Agent, arXiv 2605.01247）發現，行為比指紋更能區分它們。"],
        ["無頭瀏覽器是什麼？", "沒有可見視窗的瀏覽器，伺服器、腳本和代理工具在用。它通常缺 window.chrome、視窗大小是 0、沒有語言清單，或 UA 裡寫著 HeadlessChrome。網站不用問就能讀到這些。"],
        ["裝了擴充功能會不會被當成自動化？", "只有擴充功能往頁面裡塞了類似驅動程式的變數才會。普通的隱私擴充功能改的是 JS 讀到的值，不是瀏覽器的視窗，這由「謊言偵測」來看。這一頁的列會寫明具體發現了什麼，可以自己判斷。"],
      ],
    },
    ja: {
      seo_title: "AI エージェント検出：このブラウザはスクリプトが動かしている？ · あなたは誰",
      seo_desc: "このブラウザがスクリプトや AI に動かされているかを調べます。ヘッドレス ブラウザの痕跡、ドライバーが入れた変数、ポインターの動きは、サイトが許可なく読めます。データは保存せず、10 言語対応。",
      seo_kw: "AI エージェント検出, ヘッドレス ブラウザ, 自動化 検出, ボット 判定, Playwright, Puppeteer",
      h1: "AI エージェント検出", og_sub: "スクリプトか AI が動かしている？",
      intro: "AI のブラウジング エージェント（Atlas、Comet など）はあなたと同じブラウザを使うので、指紋だけではなかなか区別できません。手がかりになるのは、ヘッドレスでの実行、ドライバーがページに残した変数、クリックの前にポインターが動かないことです。このページはその 3 つを読み、なりすまし検出の「自動化」項目が判定します。",
      focus_h: "このブラウザは自動化されていますか？",
      docs: [
        ["サイトは AI エージェントと私を見分けられますか？", "多くの場合、見分けられます。AI のブラウジング エージェントは普通の Chrome を使うので指紋は平凡ですが、動かしているツール（Playwright、Puppeteer、Selenium、CDP）が痕跡を残します。ブラウザのオブジェクトが欠ける、グローバル変数が注入される、枠のないウィンドウ、クリックの前にマウスの軌跡がない、などです。ブラウザ エージェントの研究（FP-Agent、arXiv 2605.01247）では、指紋より行動のほうがよく見分けられました。"],
        ["ヘッドレス ブラウザとは？", "画面のないブラウザで、サーバーやスクリプト、エージェントのツールが使います。window.chrome がなく、ウィンドウの大きさが 0、言語リストが空、UA に HeadlessChrome と書いてある、といった特徴があります。サイトはこれらを許可なく読めます。"],
        ["拡張機能を入れていると自動化に見えますか？", "拡張機能がドライバーのような変数をページに入れた場合だけです。普通のプライバシー拡張は JavaScript が読む値を変えるだけで、ブラウザのウィンドウは変えません。それは「嘘検出」が見ます。このページの行には見つかった内容が出るので、自分で判断できます。"],
      ],
    },
    ko: {
      seo_title: "AI 에이전트 검사: 이 브라우저는 스크립트가 조작하나요? · 당신은 누구",
      seo_desc: "이 브라우저가 스크립트나 AI에 의해 조작되는지 봐요. 헤드리스 브라우저 흔적, 드라이버가 넣은 변수, 포인터 움직임은 사이트가 권한 없이 읽을 수 있어요. 아무것도 저장하지 않고 10개 언어를 지원해요.",
      seo_kw: "AI 에이전트 탐지, 헤드리스 브라우저 검사, 자동화 탐지, 봇 판별, Playwright, Puppeteer",
      h1: "AI 에이전트 검사", og_sub: "스크립트나 AI가 조작하고 있나요?",
      intro: "AI 브라우징 에이전트(Atlas, Comet 등)는 여러분과 같은 브라우저를 쓰기 때문에 지문만으로는 구분하기 어려워요. 단서가 되는 건 헤드리스 실행, 드라이버가 페이지에 남긴 변수, 클릭 전에 포인터가 움직이지 않는 점이에요. 이 페이지가 세 가지를 읽고, 위장 검사의 자동화 항목이 판정해요.",
      focus_h: "이 브라우저는 자동화되어 있나요?",
      docs: [
        ["웹사이트가 AI 에이전트와 저를 구분할 수 있나요?", "대개는 구분할 수 있어요. AI 브라우징 에이전트는 평범한 Chrome을 쓰기 때문에 지문은 평범하지만, 조작하는 도구(Playwright, Puppeteer, Selenium, CDP)가 흔적을 남겨요. 브라우저 객체가 빠지고, 전역 변수가 주입되고, 창틀이 없고, 클릭 전에 마우스 궤적이 없는 식이에요. 브라우저 에이전트 연구(FP-Agent, arXiv 2605.01247)에서는 지문보다 행동이 더 잘 구분했어요."],
        ["헤드리스 브라우저란 뭔가요?", "화면 없는 브라우저로, 서버와 스크립트, 에이전트 도구가 써요. 보통 window.chrome이 없고, 창 크기가 0이고, 언어 목록이 비어 있거나 UA에 HeadlessChrome이 적혀 있어요. 사이트는 이런 것들을 권한 없이 읽어요."],
        ["확장 프로그램을 쓰면 자동화로 보이나요?", "확장이 드라이버 같은 변수를 페이지에 넣은 경우에만 그래요. 보통의 프라이버시 확장은 JavaScript가 읽는 값만 바꾸고 브라우저 창은 바꾸지 않아요. 그건 위장 검사가 봐요. 이 페이지의 행에는 발견된 내용이 나오니 직접 판단할 수 있어요."],
      ],
    },
    es: {
      seo_title: "Prueba de agente de IA: ¿un script controla este navegador? · Quién eres",
      seo_desc: "Comprueba si este navegador parece controlado por un script o una IA: rastros de navegador headless, variables inyectadas por drivers y el recorrido del puntero, todo visible sin permisos. No se guarda nada, en 10 idiomas.",
      seo_kw: "detección de agente de IA, navegador headless, detección de automatización, detección de bots, Playwright, Puppeteer",
      h1: "Prueba de agente de IA", og_sub: "¿Hay un script o una IA al mando?",
      intro: "Los agentes de navegación con IA (Atlas, Comet y similares) usan el mismo navegador que tú, así que la huella por sí sola casi nunca los delata. Lo que sí: ejecutarse sin interfaz, variables del driver en la página y un puntero que salta directo a cada clic. Esta página lee esas señales y la fila de automatización del test de disfraz las juzga.",
      focus_h: "¿Este navegador está automatizado?",
      docs: [
        ["¿Puede una web distinguir a un agente de IA de mí?", "A menudo sí. Un agente de navegación recibe el mismo Chrome que usas y su huella parece normal, pero las herramientas que lo mueven (Playwright, Puppeteer, Selenium, CDP) dejan rastros: objetos del navegador que faltan, variables inyectadas, una ventana sin marco y clics sin recorrido previo del ratón. La investigación sobre agentes (FP-Agent, arXiv 2605.01247) encontró que el comportamiento los separa mejor que la huella."],
        ["¿Qué es un navegador headless?", "Un navegador sin ventana visible, usado por servidores, scripts y herramientas de agentes. Suele no tener window.chrome, informa un tamaño de ventana 0, no tiene idiomas o dice HeadlessChrome en el user agent. Una web lee todo eso sin pedir permiso."],
        ["¿Parezco automatizado si uso una extensión?", "Solo si la extensión inyecta variables parecidas a las de un driver. Una extensión de privacidad normal cambia lo que lee JavaScript, no la ventana del navegador, y eso lo ve el test de mentiras. La fila de esta página dice qué se encontró, para que puedas juzgar."],
      ],
    },
    fr: {
      seo_title: "Test d'agent IA : ce navigateur est-il piloté par un script ? · Qui êtes-vous",
      seo_desc: "Vérifiez si ce navigateur semble piloté par un script ou une IA : traces de navigateur headless, variables injectées par un pilote et trajectoire du pointeur, tout est visible sans autorisation. Rien n'est conservé, en 10 langues.",
      seo_kw: "détection agent IA, navigateur headless, détection automatisation, détection bot, Playwright, Puppeteer",
      h1: "Test d'agent IA", og_sub: "Un script ou une IA aux commandes ?",
      intro: "Les agents de navigation par IA (Atlas, Comet et autres) utilisent le même navigateur que vous : l'empreinte seule ne les trahit presque jamais. Ce qui les trahit : un navigateur exécuté sans interface, des variables de pilote laissées dans la page, et un pointeur qui saute directement sur chaque clic. Cette page lit ces signaux, et la ligne automatisation du test de camouflage les juge.",
      focus_h: "Ce navigateur est-il automatisé ?",
      docs: [
        ["Un site peut-il distinguer un agent IA de moi ?", "Souvent, oui. Un agent de navigation reçoit le même Chrome que vous et son empreinte paraît ordinaire, mais les outils qui le pilotent (Playwright, Puppeteer, Selenium, CDP) laissent des traces : objets du navigateur manquants, variables injectées, une fenêtre sans cadre et des clics sans trajectoire de souris. La recherche sur les agents (FP-Agent, arXiv 2605.01247) montre que le comportement les sépare mieux que l'empreinte."],
        ["Qu'est-ce qu'un navigateur headless ?", "Un navigateur sans fenêtre visible, utilisé par des serveurs, des scripts et des outils d'agents. Il lui manque souvent window.chrome, il annonce une fenêtre de taille 0, n'a pas de langues, ou écrit HeadlessChrome dans son user agent. Un site lit tout cela sans autorisation."],
        ["Est-ce que je parais automatisé avec une extension ?", "Seulement si l'extension injecte des variables qui ressemblent à celles d'un pilote. Une extension de confidentialité ordinaire change ce que lit JavaScript, pas la fenêtre du navigateur ; c'est le test des mensonges qui le voit. La ligne de cette page nomme ce qui a été trouvé, à vous de juger."],
      ],
    },
    de: {
      seo_title: "KI-Agenten-Test: Wird dieser Browser von einem Skript gesteuert? · Wer bist du",
      seo_desc: "Prüfe, ob dieser Browser wie von einem Skript oder einer KI gesteuert wirkt: Spuren eines Headless-Browsers, eingeschleuste Treiber-Variablen und der Zeigerverlauf, alles ohne Berechtigung sichtbar. Nichts wird gespeichert, in 10 Sprachen.",
      seo_kw: "KI-Agent erkennen, Headless-Browser Test, Automatisierung erkennen, Bot-Erkennung, Playwright, Puppeteer",
      h1: "KI-Agenten-Test", og_sub: "Steuert ein Skript oder eine KI?",
      intro: "KI-Browsing-Agenten (Atlas, Comet und ähnliche) nutzen denselben Browser wie du, deshalb verrät der Fingerabdruck sie fast nie. Verräterisch sind: ein Browser ohne sichtbares Fenster, Variablen eines Treibers in der Seite und ein Zeiger, der bei jedem Klick direkt auf das Ziel springt. Diese Seite liest diese Signale, die Automatisierungszeile des Tarnungs-Checks urteilt darüber.",
      focus_h: "Ist dieser Browser automatisiert?",
      docs: [
        ["Kann eine Website einen KI-Agenten von mir unterscheiden?", "Oft ja. Ein Browsing-Agent bekommt denselben Chrome wie du, sein Fingerabdruck wirkt gewöhnlich, aber die Werkzeuge dahinter (Playwright, Puppeteer, Selenium, CDP) hinterlassen Spuren: fehlende Browser-Objekte, eingeschleuste Variablen, ein Fenster ohne Rahmen und Klicks ohne Mausbewegung davor. Forschung zu Browsing-Agenten (FP-Agent, arXiv 2605.01247) zeigt, dass Verhalten sie besser trennt als der Fingerabdruck."],
        ["Was ist ein Headless-Browser?", "Ein Browser ohne sichtbares Fenster, den Server, Skripte und Agenten-Werkzeuge nutzen. Ihm fehlt meist window.chrome, er meldet ein Fenster der Größe 0, hat keine Sprachen oder schreibt HeadlessChrome in den User-Agent. Eine Website liest das ohne Berechtigung."],
        ["Wirke ich durch eine Erweiterung automatisiert?", "Nur wenn die Erweiterung treiberähnliche Variablen in die Seite einschleust. Eine normale Datenschutz-Erweiterung ändert, was JavaScript liest, nicht das Fenster des Browsers; das sieht der Lügen-Test. Die Zeile auf dieser Seite nennt, was gefunden wurde, damit du es selbst beurteilen kannst."],
      ],
    },
    pt: {
      seo_title: "Teste de agente de IA: um script controla este navegador? · Quem é você",
      seo_desc: "Veja se este navegador parece controlado por um script ou uma IA: vestígios de navegador headless, variáveis injetadas por drivers e o caminho do ponteiro, tudo visível sem permissão. Nada é guardado, em 10 idiomas.",
      seo_kw: "detecção de agente de IA, navegador headless, detecção de automação, detecção de bots, Playwright, Puppeteer",
      h1: "Teste de agente de IA", og_sub: "Um script ou uma IA no comando?",
      intro: "Agentes de navegação com IA (Atlas, Comet e parecidos) usam o mesmo navegador que você, então a impressão digital quase nunca os entrega. O que entrega: rodar sem interface, variáveis do driver na página e um ponteiro que salta direto para cada clique. Esta página lê esses sinais, e a linha de automação do teste de disfarce os julga.",
      focus_h: "Este navegador está automatizado?",
      docs: [
        ["Um site consegue distinguir um agente de IA de mim?", "Muitas vezes sim. Um agente de navegação recebe o mesmo Chrome que você, e a impressão digital parece comum, mas as ferramentas que o movem (Playwright, Puppeteer, Selenium, CDP) deixam vestígios: objetos do navegador faltando, variáveis injetadas, uma janela sem moldura e cliques sem caminho do mouse antes. Pesquisa sobre agentes (FP-Agent, arXiv 2605.01247) mostrou que o comportamento os separa melhor que a impressão digital."],
        ["O que é um navegador headless?", "Um navegador sem janela visível, usado por servidores, scripts e ferramentas de agentes. Costuma não ter window.chrome, informa janela de tamanho 0, não tem idiomas ou diz HeadlessChrome no user agent. Um site lê tudo isso sem pedir permissão."],
        ["Pareço automatizado se usar uma extensão?", "Só se a extensão injetar variáveis parecidas com as de um driver. Uma extensão de privacidade comum muda o que o JavaScript lê, não a janela do navegador, e isso o teste de mentiras enxerga. A linha desta página diz o que foi encontrado, para você julgar."],
      ],
    },
    ru: {
      seo_title: "Проверка на ИИ-агента: этот браузер управляется скриптом? · Кто вы",
      seo_desc: "Проверьте, не управляет ли этим браузером скрипт или ИИ: следы браузера без интерфейса, внедрённые драйвером переменные и путь указателя — всё видно без разрешения. Ничего не сохраняется, 10 языков.",
      seo_kw: "обнаружение ИИ-агента, браузер без интерфейса, обнаружение автоматизации, детект ботов, Playwright, Puppeteer",
      h1: "Проверка на ИИ-агента", og_sub: "Управляет скрипт или ИИ?",
      intro: "ИИ-агенты для браузера (Atlas, Comet и подобные) используют тот же Chrome, что и вы, поэтому по отпечатку их почти не отличить. Выдают их: запуск без интерфейса, переменные драйвера в странице и указатель, который прыгает прямо к цели перед каждым кликом. Эта страница читает такие сигналы, а строка автоматизации в проверке маскировки даёт вердикт.",
      focus_h: "Этот браузер автоматизирован?",
      docs: [
        ["Сайт может отличить ИИ-агента от меня?", "Часто да. Агент получает тот же Chrome, что и вы, и отпечаток выглядит обычным, но инструменты, которые им управляют (Playwright, Puppeteer, Selenium, CDP), оставляют следы: нет объектов браузера, внедрены переменные, окно без рамки, клики без движения мыши перед ними. Исследование агентов (FP-Agent, arXiv 2605.01247) показало, что поведение отличает их лучше отпечатка."],
        ["Что такое браузер без интерфейса?", "Браузер без видимого окна; его используют серверы, скрипты и инструменты агентов. Обычно у него нет window.chrome, размер окна 0, нет списка языков или в user agent написано HeadlessChrome. Сайт читает это без разрешения."],
        ["Если у меня расширение, я выгляжу автоматизированным?", "Только если расширение внедряет переменные, похожие на драйверные. Обычное расширение приватности меняет то, что читает JavaScript, а не окно браузера, и это видит проверка лжи. Строка на этой странице называет найденное, чтобы вы могли судить сами."],
      ],
    },
  },
  "client-hints": {
    en: {
      seo_title: "Client Hints check: what the request itself says about you · Who Are You",
      seo_desc: "Client Hints are the browser's own account of its platform and version, sent as HTTP headers a script cannot rewrite. See the hints your browser sends, compare them with navigator, and spot a spoofed user agent. No permission needed, nothing kept.",
      seo_kw: "Client Hints test, Sec-CH-UA, user agent check, UA-CH, browser spoofing, navigator.userAgentData",
      h1: "Client Hints check", og_sub: "What the request says, not what the page says",
      intro: "There are two accounts of your browser: the values JavaScript reads from navigator, which a script can rewrite, and the Client Hints headers your browser attaches to its requests, which a script cannot. This page shows both and what they disagree about, which is often the quickest way to spot a spoofed user agent.",
      focus_h: "Do the request and the page agree?",
      docs: [
        ["What are Client Hints?", "A standard for sending parts of your browser's identity as HTTP headers, requested by the site with Accept-CH. The low-entropy ones (brand, version, platform) go with every request; the high-entropy ones (architecture, bitness, model, platform version, form factors, 32-bit mode) are only sent once a site asks. The page has the Worker request them, then reads them back on the next request."],
        ["Why compare them with navigator?", "A user-agent switcher or an anti-detect browser can rewrite what JavaScript reads, but it cannot change the headers the browser itself sends. If navigator says one thing and the headers say another, the page flags it. That is stronger evidence than either value alone."],
        ["Does my browser support Client Hints?", "Chromium browsers (Chrome, Edge, Opera, Brave, Samsung Internet) do. Firefox and Safari don't send them yet, and the row says so instead of guessing. A VPN or proxy does not change them; they are about the browser, not the network."],
      ],
    },
    "zh-CN": {
      seo_title: "Client Hints 检测：请求本身透露了什么 · 你是谁",
      seo_desc: "Client Hints 是浏览器自己报告的系统和版本，以 HTTP 头的形式发出，脚本改不了。看看你的浏览器发了哪些、和 navigator 里的值是否一致，以及 User-Agent 有没有被伪装。不用授权，不存数据，10 种语言。",
      seo_kw: "Client Hints 检测, Sec-CH-UA, User-Agent 检测, UA-CH, 浏览器伪装检测, navigator.userAgentData",
      h1: "Client Hints 检测", og_sub: "请求说的，页面说的",
      intro: "关于你的浏览器有两个说法：JavaScript 从 navigator 读到的值（脚本可以改），和浏览器每次请求附带的 Client Hints 头（脚本改不了）。这一页把两者都列出来，告诉你哪里对不上——这往往是识破伪装 User-Agent 最快的办法。",
      focus_h: "请求和页面对得上吗？",
      docs: [
        ["Client Hints 是什么？", "一套把浏览器身份的一部分放进 HTTP 头的标准，网站用 Accept-CH 请求。低熵的部分（品牌、版本、平台）每个请求都带；高熵的部分（架构、位数、机型、系统版本、设备形态、32 位模式）要网站先要才会发。这一页让 Worker 发出请求，下一次请求时读回来。"],
        ["为什么要和 navigator 对比？", "改 UA 的扩展或反检测浏览器能改写 JavaScript 读到的值，却改不了浏览器自己发出的头。如果 navigator 说的和头里说的不一样，这一页会标出来。比只看其中一个更有说服力。"],
        ["我的浏览器支持 Client Hints 吗？", "Chromium 内核的浏览器（Chrome、Edge、Opera、Brave、Samsung Internet）支持。Firefox 和 Safari 还不发这些头，页面会照实说「这个浏览器不提供」，而不是猜。VPN 或代理不影响它们：这是浏览器的事，和网络无关。"],
      ],
    },
    "zh-TW": {
      seo_title: "Client Hints 偵測：請求本身透露了什麼 · 你是誰",
      seo_desc: "Client Hints 是瀏覽器自己回報的系統和版本，以 HTTP 標頭的形式送出，腳本改不了。看看你的瀏覽器送了哪些、和 navigator 裡的值是否一致，以及 User-Agent 有沒有被偽裝。不用授權，不存資料，10 種語言。",
      seo_kw: "Client Hints 偵測, Sec-CH-UA, User-Agent 偵測, UA-CH, 瀏覽器偽裝偵測, navigator.userAgentData",
      h1: "Client Hints 偵測", og_sub: "請求說的，頁面說的",
      intro: "關於你的瀏覽器有兩種說法：JavaScript 從 navigator 讀到的值（腳本可以改），和瀏覽器每次請求附帶的 Client Hints 標頭（腳本改不了）。這一頁把兩者都列出來，告訴你哪裡對不上——這往往是識破偽裝 User-Agent 最快的辦法。",
      focus_h: "請求和頁面對得上嗎？",
      docs: [
        ["Client Hints 是什麼？", "一套把瀏覽器身分的一部分放進 HTTP 標頭的標準，網站用 Accept-CH 請求。低熵的部分（品牌、版本、平台）每個請求都帶；高熵的部分（架構、位元數、機型、系統版本、裝置形態、32 位元模式）要網站先要才會送。這一頁讓 Worker 發出請求，下一次請求時讀回來。"],
        ["為什麼要和 navigator 對比？", "改 UA 的擴充功能或反偵測瀏覽器能改寫 JavaScript 讀到的值，卻改不了瀏覽器自己送出的標頭。如果 navigator 說的和標頭裡說的不一樣，這一頁會標出來。比只看其中一個更有說服力。"],
        ["我的瀏覽器支援 Client Hints 嗎？", "Chromium 核心的瀏覽器（Chrome、Edge、Opera、Brave、Samsung Internet）支援。Firefox 和 Safari 還不送這些標頭，頁面會照實說「這個瀏覽器不提供」，而不是猜。VPN 或代理不影響它們：這是瀏覽器的事，和網路無關。"],
      ],
    },
    ja: {
      seo_title: "Client Hints 検査：リクエストそのものが何を語るか · あなたは誰",
      seo_desc: "Client Hints はブラウザ自身が申告するシステムとバージョンを HTTP ヘッダーで送る仕組みで、スクリプトからは書き換えられません。送っている値と navigator の値を比べ、User-Agent の偽装を見抜きます。許可不要、データ保存なし、10 言語。",
      seo_kw: "Client Hints 検査, Sec-CH-UA, User-Agent 検査, UA-CH, ブラウザ偽装, navigator.userAgentData",
      h1: "Client Hints 検査", og_sub: "リクエストの言い分、ページの言い分",
      intro: "あなたのブラウザについては 2 つの言い分があります。JavaScript が navigator から読む値（スクリプトが書き換えられる）と、ブラウザがリクエストに付ける Client Hints ヘッダー（スクリプトでは変えられない）です。このページは両方を並べ、どこが食い違うかを示します。偽装された User-Agent を見抜く最短の方法です。",
      focus_h: "リクエストとページは一致していますか？",
      docs: [
        ["Client Hints とは？", "ブラウザの身元の一部を HTTP ヘッダーで送る標準で、サイトは Accept-CH で要求します。低エントロピーの項目（ブランド、バージョン、プラットフォーム）は毎回送られ、高エントロピーの項目（アーキテクチャ、ビット数、機種、OS のバージョン、デバイスの形態、32 ビット動作）はサイトが要求したときだけ送られます。このページは Worker から要求し、次のリクエストで受け取ります。"],
        ["なぜ navigator と比べるのですか？", "UA を変える拡張やアンチディテクト ブラウザは JavaScript が読む値を書き換えても、ブラウザ自身が送るヘッダーは変えられません。navigator とヘッダーが食い違えば、このページが指摘します。片方だけを見るより確かな証拠になります。"],
        ["私のブラウザは Client Hints に対応していますか？", "Chromium 系（Chrome、Edge、Opera、Brave、Samsung Internet）は対応しています。Firefox と Safari はまだ送らないので、ページは推測せず「このブラウザは提供しません」と表示します。VPN やプロキシは影響しません。ネットワークではなくブラウザの話です。"],
      ],
    },
    ko: {
      seo_title: "Client Hints 검사: 요청 자체가 말하는 것 · 당신은 누구",
      seo_desc: "Client Hints는 브라우저가 스스로 알려 주는 시스템과 버전을 HTTP 헤더로 보내는 방식이라 스크립트로 바꿀 수 없어요. 보내는 값과 navigator의 값을 비교해 User-Agent 위장을 잡아냅니다. 권한 불필요, 데이터 저장 없음, 10개 언어.",
      seo_kw: "Client Hints 검사, Sec-CH-UA, User-Agent 검사, UA-CH, 브라우저 위장, navigator.userAgentData",
      h1: "Client Hints 검사", og_sub: "요청이 말하는 것, 페이지가 말하는 것",
      intro: "여러분의 브라우저에는 두 가지 진술이 있어요. JavaScript가 navigator에서 읽는 값(스크립트가 바꿀 수 있음)과 브라우저가 요청마다 붙이는 Client Hints 헤더(스크립트로는 못 바꿈)예요. 이 페이지는 둘을 나란히 보여 주고 어디가 다른지 알려 줘요. 위장한 User-Agent를 잡는 가장 빠른 방법이에요.",
      focus_h: "요청과 페이지가 일치하나요?",
      docs: [
        ["Client Hints가 뭔가요?", "브라우저 신원의 일부를 HTTP 헤더로 보내는 표준이고, 사이트가 Accept-CH로 요청해요. 저엔트로피 항목(브랜드, 버전, 플랫폼)은 매 요청에, 고엔트로피 항목(아키텍처, 비트 수, 기기 모델, OS 버전, 기기 형태, 32비트 동작)은 사이트가 요청할 때만 보내요. 이 페이지는 Worker가 요청하게 하고 다음 요청에서 받아 와요."],
        ["왜 navigator와 비교하나요?", "UA를 바꾸는 확장이나 안티디텍트 브라우저는 JavaScript가 읽는 값은 바꿔도 브라우저가 보내는 헤더는 못 바꿔요. navigator와 헤더가 다르면 이 페이지가 짚어 줘요. 한쪽만 보는 것보다 확실한 증거예요."],
        ["제 브라우저는 Client Hints를 지원하나요?", "Chromium 계열(Chrome, Edge, Opera, Brave, Samsung Internet)은 지원해요. Firefox와 Safari는 아직 보내지 않아서 페이지가 추측하지 않고 '이 브라우저는 제공하지 않음'이라고 표시해요. VPN이나 프록시는 영향이 없어요. 네트워크가 아니라 브라우저 이야기예요."],
      ],
    },
    es: {
      seo_title: "Prueba de Client Hints: lo que dice la petición · Quién eres",
      seo_desc: "Los Client Hints son lo que el navegador declara de su plataforma y versión, en cabeceras HTTP que un script no puede reescribir. Mira qué envía el tuyo, compáralo con navigator y detecta un user agent falsificado. Sin permisos y sin guardar nada, en 10 idiomas.",
      seo_kw: "prueba Client Hints, Sec-CH-UA, prueba user agent, UA-CH, falsificación de navegador, navigator.userAgentData",
      h1: "Prueba de Client Hints", og_sub: "Lo que dice la petición, no la página",
      intro: "Hay dos versiones de tu navegador: lo que JavaScript lee de navigator, que un script puede reescribir, y las cabeceras Client Hints que el navegador adjunta a sus peticiones, que un script no puede. Esta página muestra ambas y en qué no coinciden, que suele ser la forma más rápida de descubrir un user agent falsificado.",
      focus_h: "¿Coinciden la petición y la página?",
      docs: [
        ["¿Qué son los Client Hints?", "Un estándar para enviar parte de la identidad del navegador en cabeceras HTTP, que el sitio pide con Accept-CH. Las de baja entropía (marca, versión, plataforma) van en cada petición; las de alta entropía (arquitectura, bits, modelo, versión del sistema, forma del dispositivo, modo 32 bits) solo se envían si el sitio las pide. La página hace que el Worker las pida y las lee en la siguiente petición."],
        ["¿Por qué compararlos con navigator?", "Un cambiador de user agent o un navegador antidetección puede reescribir lo que lee JavaScript, pero no las cabeceras que el navegador envía. Si navigator dice una cosa y las cabeceras otra, la página lo marca. Es más prueba que cualquiera de los dos valores por separado."],
        ["¿Mi navegador admite Client Hints?", "Los navegadores Chromium (Chrome, Edge, Opera, Brave, Samsung Internet) sí. Firefox y Safari aún no las envían, y la fila lo dice en vez de adivinar. Una VPN o un proxy no las cambian: hablan del navegador, no de la red."],
      ],
    },
    fr: {
      seo_title: "Test Client Hints : ce que dit la requête, pas la page · Qui êtes-vous",
      seo_desc: "Les Client Hints sont ce que le navigateur déclare de sa plateforme et de sa version, dans des en-têtes HTTP qu'un script ne peut pas réécrire. Voyez ce que le vôtre envoie, comparez avec navigator et repérez un user agent falsifié. Sans autorisation et sans rien conserver, en 10 langues.",
      seo_kw: "test Client Hints, Sec-CH-UA, test user agent, UA-CH, falsification de navigateur, navigator.userAgentData",
      h1: "Test Client Hints", og_sub: "Ce que dit la requête, pas la page",
      intro: "Il y a deux versions de votre navigateur : ce que JavaScript lit dans navigator, qu'un script peut réécrire, et les en-têtes Client Hints que le navigateur joint à ses requêtes, qu'un script ne peut pas. Cette page montre les deux et ce qui ne concorde pas, souvent le moyen le plus rapide de repérer un user agent falsifié.",
      focus_h: "La requête et la page concordent-elles ?",
      docs: [
        ["Que sont les Client Hints ?", "Un standard qui envoie une partie de l'identité du navigateur dans des en-têtes HTTP, demandés par le site avec Accept-CH. Les indicateurs à faible entropie (marque, version, plateforme) partent à chaque requête ; ceux à forte entropie (architecture, nombre de bits, modèle, version du système, forme de l'appareil, mode 32 bits) ne sont envoyés que si le site les demande. La page charge le Worker de les demander, puis les lit à la requête suivante."],
        ["Pourquoi les comparer à navigator ?", "Un changeur de user agent ou un navigateur anti-détection peut réécrire ce que lit JavaScript, mais pas les en-têtes que le navigateur envoie lui-même. Si navigator dit une chose et les en-têtes une autre, la page le signale. C'est une preuve plus solide que l'une ou l'autre valeur seule."],
        ["Mon navigateur prend-il en charge les Client Hints ?", "Les navigateurs Chromium (Chrome, Edge, Opera, Brave, Samsung Internet) oui. Firefox et Safari ne les envoient pas encore, et la ligne le dit au lieu de deviner. Un VPN ou un proxy ne les change pas : cela parle du navigateur, pas du réseau."],
      ],
    },
    de: {
      seo_title: "Client-Hints-Test: Was die Anfrage über dich sagt · Wer bist du",
      seo_desc: "Client Hints sind das, was der Browser über Plattform und Version in HTTP-Headern meldet, die ein Skript nicht umschreiben kann. Sieh, was deiner sendet, vergleiche es mit navigator und erkenne einen gefälschten User-Agent. Ohne Berechtigung und ohne Speichern, in 10 Sprachen.",
      seo_kw: "Client Hints Test, Sec-CH-UA, User-Agent Test, UA-CH, Browser-Fälschung, navigator.userAgentData",
      h1: "Client-Hints-Test", og_sub: "Was die Anfrage sagt, nicht die Seite",
      intro: "Es gibt zwei Aussagen über deinen Browser: was JavaScript aus navigator liest, das ein Skript umschreiben kann, und die Client-Hints-Header, die der Browser an seine Anfragen hängt, die ein Skript nicht ändern kann. Diese Seite zeigt beides und wo es nicht zusammenpasst – oft der schnellste Weg, einen gefälschten User-Agent zu erkennen.",
      focus_h: "Passen Anfrage und Seite zusammen?",
      docs: [
        ["Was sind Client Hints?", "Ein Standard, der einen Teil der Browser-Identität in HTTP-Headern sendet, die eine Website mit Accept-CH anfordert. Die mit geringer Entropie (Marke, Version, Plattform) gehen mit jeder Anfrage; die mit hoher Entropie (Architektur, Bitbreite, Modell, Systemversion, Geräteform, 32-Bit-Modus) erst, wenn die Website sie anfordert. Die Seite lässt den Worker sie anfordern und liest sie bei der nächsten Anfrage."],
        ["Warum mit navigator vergleichen?", "Ein User-Agent-Switcher oder ein Anti-Detect-Browser kann umschreiben, was JavaScript liest, aber nicht die Header, die der Browser selbst sendet. Wenn navigator etwas anderes sagt als die Header, markiert die Seite das. Das ist stärker als einer der beiden Werte allein."],
        ["Unterstützt mein Browser Client Hints?", "Chromium-Browser (Chrome, Edge, Opera, Brave, Samsung Internet) ja. Firefox und Safari senden sie noch nicht, und die Zeile sagt das, statt zu raten. Ein VPN oder Proxy ändert sie nicht: Es geht um den Browser, nicht ums Netz."],
      ],
    },
    pt: {
      seo_title: "Teste de Client Hints: o que a requisição diz · Quem é você",
      seo_desc: "Client Hints são o que o navegador declara da própria plataforma e versão em cabeçalhos HTTP que um script não consegue reescrever. Veja o que o seu envia, compare com o navigator e detecte um user agent falsificado. Sem permissão e sem guardar nada, em 10 idiomas.",
      seo_kw: "teste Client Hints, Sec-CH-UA, teste user agent, UA-CH, falsificação de navegador, navigator.userAgentData",
      h1: "Teste de Client Hints", og_sub: "O que a requisição diz, não a página",
      intro: "Há duas versões do seu navegador: o que o JavaScript lê do navigator, que um script pode reescrever, e os cabeçalhos Client Hints que o navegador anexa às requisições, que um script não consegue. Esta página mostra os dois e onde não batem — muitas vezes o jeito mais rápido de pegar um user agent falsificado.",
      focus_h: "A requisição e a página batem?",
      docs: [
        ["O que são Client Hints?", "Um padrão que envia parte da identidade do navegador em cabeçalhos HTTP, pedidos pelo site com Accept-CH. Os de baixa entropia (marca, versão, plataforma) vão em toda requisição; os de alta entropia (arquitetura, bits, modelo, versão do sistema, forma do aparelho, modo 32 bits) só vão quando o site pede. A página faz o Worker pedir e lê na requisição seguinte."],
        ["Por que comparar com o navigator?", "Um trocador de user agent ou navegador antidetecção pode reescrever o que o JavaScript lê, mas não os cabeçalhos que o navegador envia. Se o navigator diz uma coisa e os cabeçalhos outra, a página marca. É prova mais forte que qualquer um dos dois sozinho."],
        ["Meu navegador tem Client Hints?", "Navegadores Chromium (Chrome, Edge, Opera, Brave, Samsung Internet) sim. Firefox e Safari ainda não os enviam, e a linha diz isso em vez de adivinhar. VPN ou proxy não mudam: falam do navegador, não da rede."],
      ],
    },
    ru: {
      seo_title: "Проверка Client Hints: что говорит сам запрос · Кто вы",
      seo_desc: "Client Hints — это то, что браузер сообщает о своей платформе и версии в HTTP-заголовках, которые скрипт не может переписать. Посмотрите, что отправляет ваш браузер, сравните с navigator и найдите подменённый User-Agent. Без разрешения и без сохранения данных, 10 языков.",
      seo_kw: "проверка Client Hints, Sec-CH-UA, проверка user agent, UA-CH, подмена браузера, navigator.userAgentData",
      h1: "Проверка Client Hints", og_sub: "Что говорит запрос, а не страница",
      intro: "О вашем браузере есть два свидетельства: то, что JavaScript читает из navigator (скрипт может переписать), и заголовки Client Hints, которые браузер прикладывает к запросам (скрипт их не изменит). Эта страница показывает оба и расхождения — часто это самый быстрый способ поймать подменённый User-Agent.",
      focus_h: "Запрос и страница совпадают?",
      docs: [
        ["Что такое Client Hints?", "Стандарт, который отправляет часть идентичности браузера в HTTP-заголовках; сайт запрашивает их через Accept-CH. Низкоэнтропийные (бренд, версия, платформа) идут с каждым запросом; высокоэнтропийные (архитектура, разрядность, модель, версия системы, форма устройства, 32-битный режим) — только если сайт попросил. Страница просит Worker запросить их и читает в следующем запросе."],
        ["Зачем сравнивать с navigator?", "Смена UA или антидетект-браузер может переписать то, что читает JavaScript, но не заголовки, которые отправляет сам браузер. Если navigator говорит одно, а заголовки другое, страница это отметит. Это сильнее, чем любое из значений по отдельности."],
        ["Мой браузер поддерживает Client Hints?", "Браузеры на Chromium (Chrome, Edge, Opera, Brave, Samsung Internet) — да. Firefox и Safari пока их не отправляют, и строка честно говорит «браузер не сообщает», а не угадывает. VPN или прокси их не меняют: это про браузер, а не про сеть."],
      ],
    },
  },
  stats: {
    "zh-CN": {
      seo_title: "大家的检测结果：每天上万人测过，最常在哪露馅 · 你是谁",
      seo_desc: "who.1ms.dog 的匿名统计：过去 7 天多少人测过浏览器指纹和 IP，多少人在分流、时区和 IP 对不上、DNS 泄露、WebRTC 泄露，最常见的系统、浏览器、屏幕和显卡。不保存 IP 和原始数据，只累计匿名计数。",
      seo_kw: "浏览器指纹统计, IP 检测统计, 代理检测数据, DNS 泄露比例, WebRTC 泄露比例, 浏览器使用率",
      h1: "大家的检测结果", og_sub: "大家最常在哪露馅",
      intro: "这里的数字来自每一次检测的匿名计数：多少人测过，哪些地方最常露馅，大家用的系统、浏览器和显卡是什么。",
      focus_h: "过去 7 天",
      docs: [
        ["这些数字从哪来？","每次有人在这里测完，页面会给匿名计数器加一：这次各项检查的结果，和系统、浏览器、屏幕这类读到的值。不存 IP，没有单次访问的记录，所以这里只有汇总后的数字。"],
        ["为什么这么多人「露馅」？","来这里测的人，很多本来就在用代理或 VPN，想看看自己藏得好不好。所以分流、时区对不上、DNS 泄露的比例，比普通网民高得多。"],
        ["多久更新一次？","页面每次打开都会读最新的数字，统计每分钟汇总一次。「最常见」只列至少 20 次检测共有的值，少见的值不会出现在这里。"],
      ],
    },
    "zh-TW": {
      seo_title: "大家的檢測結果：每天上萬人測過，最常在哪露餡 · 你是誰",
      seo_desc: "who.1ms.dog 的匿名統計：過去 7 天多少人測過瀏覽器指紋和 IP，多少人在分流、時區和 IP 對不上、DNS 外洩、WebRTC 外洩，最常見的系統、瀏覽器、螢幕和顯示卡。不保存 IP 和原始資料，只累計匿名計數。",
      seo_kw: "瀏覽器指紋統計, IP 檢測統計, 代理檢測資料, DNS 外洩比例, WebRTC 外洩比例, 瀏覽器使用率",
      h1: "大家的檢測結果", og_sub: "大家最常在哪露餡",
      intro: "這裡的數字來自每一次檢測的匿名計數：多少人測過，哪些地方最常露餡，大家用的系統、瀏覽器和顯示卡是什麼。",
      focus_h: "過去 7 天",
      docs: [
        ["這些數字從哪來？","每次有人在這裡測完，頁面會替匿名計數器加一：這次各項檢查的結果，和系統、瀏覽器、螢幕這類讀到的值。不存 IP，沒有單次造訪的紀錄，所以這裡只有彙總後的數字。"],
        ["為什麼這麼多人「露餡」？","來這裡測的人，很多本來就在用代理或 VPN，想看看自己藏得好不好。所以分流、時區對不上、DNS 外洩的比例，比一般網友高得多。"],
        ["多久更新一次？","頁面每次開啟都會讀最新的數字，統計每分鐘彙總一次。「最常見」只列至少 20 次檢測共有的值，少見的值不會出現在這裡。"],
      ],
    },
    en: {
      seo_title: "Who Takes the Test: what gives people away, in numbers · Who Are You",
      seo_desc: "who.1ms.dog's anonymous stats: how many checked their browser fingerprint and IP in the last 7 days, how many split their traffic, have a clock that doesn't match their IP, leak DNS or WebRTC, and the commonest systems, browsers, screens and graphics cards. No IP or raw data is kept, only anonymous counts.",
      seo_kw: "browser fingerprint statistics, IP check statistics, proxy detection data, DNS leak rate, WebRTC leak rate, browser usage",
      h1: "Who takes the test", og_sub: "What gives people away, in numbers",
      intro: "These numbers come from anonymous counts of every check: how many people took the test, what gives them away most, and which systems, browsers and cards they use.",
      focus_h: "The last 7 days",
      docs: [
        ["Where do these numbers come from?","Each time someone finishes a check here, the page adds one to anonymous counters: how each check came out, and readings like the system, browser and screen. No IP and no record of a single visit are kept, so there are only totals here."],
        ["Why do so many people get caught?","Many who test here already use a proxy or VPN and want to see how well they hide. That's why split routing, mismatched clocks and DNS leaks are far more common here than among internet users at large."],
        ["How often is it updated?","The page reads the latest numbers each time it opens; the totals are worked out once a minute. \"Commonest\" lists only values shared by 20 checks or more, so rare values never show up here."],
      ],
    },
    ja: {
      seo_title: "みんなの診断結果：どこで見抜かれやすいか · あなたは誰",
      seo_desc: "who.1ms.dog の匿名集計：過去 7 日間にブラウザフィンガープリントと IP を調べた人数、スプリットトンネル（分流）・時計と IP の不一致・DNS 漏れ・WebRTC 漏れの割合、よくある OS・ブラウザ・画面・GPU。IP や元のデータは保存せず、匿名の集計だけです。",
      seo_kw: "ブラウザフィンガープリント 統計, IP 確認 統計, プロキシ 検出 データ, DNS 漏れ 割合, WebRTC 漏れ 割合",
      h1: "みんなの診断結果", og_sub: "どこで見抜かれやすいか",
      intro: "ここの数字は、毎回の検査の匿名集計からできています。何人が調べたか、どこで見抜かれやすいか、どんな OS・ブラウザ・GPU が使われているか。",
      focus_h: "過去 7 日間",
      docs: [
        ["数字はどこから？","ここで誰かが検査を終えるたびに、ページは匿名のカウンターに 1 を足します。各チェックの結果と、OS・ブラウザ・画面などの読み取った値です。IP も 1 回ごとの記録も保存しないので、ここにあるのは合計だけです。"],
        ["なぜこんなに見抜かれる人が多い？","ここで調べる人の多くは、もともとプロキシや VPN を使っていて、うまく隠れているか確かめたい人です。そのため分流、時計の不一致、DNS 漏れの割合は一般のネット利用者よりずっと高くなります。"],
        ["どのくらいの頻度で更新される？","ページを開くたびに最新の数字を読み込み、集計は 1 分ごとに更新されます。「よくある」は 20 回以上の検査に共通する値だけなので、珍しい値はここには出ません。"],
      ],
    },
    ko: {
      seo_title: "모두의 검사 결과: 어디서 가장 자주 들통날까 · 당신은 누구",
      seo_desc: "who.1ms.dog의 익명 통계: 지난 7일 동안 브라우저 지문과 IP를 검사한 횟수, 분할 라우팅·시계와 IP 불일치·DNS 유출·WebRTC 유출 비율, 가장 흔한 시스템·브라우저·화면·그래픽카드. IP와 원본 데이터는 저장하지 않고 익명 집계만 남깁니다.",
      seo_kw: "브라우저 지문 통계, IP 확인 통계, 프록시 탐지 데이터, DNS 유출 비율, WebRTC 유출 비율",
      h1: "모두의 검사 결과", og_sub: "어디서 가장 자주 들통날까",
      intro: "여기 숫자는 매번 검사의 익명 집계로 만들어졌어요. 몇 명이 검사했는지, 어디서 가장 자주 들통나는지, 어떤 시스템·브라우저·그래픽카드를 쓰는지.",
      focus_h: "지난 7일",
      docs: [
        ["이 숫자는 어디서 오나요?","누군가 여기서 검사를 마칠 때마다 페이지는 익명 카운터에 1을 더해요. 각 검사 결과와 시스템·브라우저·화면 같은 읽은 값이에요. IP와 방문 한 건의 기록은 저장하지 않아서 여기엔 합계만 있어요."],
        ["왜 이렇게 많은 사람이 들통나나요?","여기서 검사하는 사람 상당수는 이미 프록시나 VPN을 쓰면서 잘 숨었는지 확인하려는 사람이에요. 그래서 분할 라우팅, 시계 불일치, DNS 유출 비율이 일반 사용자보다 훨씬 높아요."],
        ["얼마나 자주 업데이트되나요?","페이지를 열 때마다 최신 숫자를 읽고, 집계는 1분마다 갱신돼요. '가장 흔한' 목록은 20번 이상의 검사가 공유한 값만 보여 줘서 드문 값은 여기 나오지 않아요."],
      ],
    },
    es: {
      seo_title: "Quién hace el test: lo que más delata a la gente, en cifras · ¿Quién eres?",
      seo_desc: "Estadísticas anónimas de who.1ms.dog: cuántos comprobaron su huella del navegador e IP en los últimos 7 días, cuántos usan enrutamiento dividido, tienen el reloj desajustado con su IP o fugas de DNS o WebRTC, y los sistemas, navegadores, pantallas y tarjetas gráficas más comunes. Sin IP ni datos en bruto, solo recuentos anónimos.",
      seo_kw: "estadísticas huella del navegador, estadísticas comprobar IP, datos detección proxy, porcentaje fuga DNS, porcentaje fuga WebRTC",
      h1: "Quién hace el test", og_sub: "Lo que más delata a la gente, en cifras",
      intro: "Estas cifras salen de recuentos anónimos de cada comprobación: cuánta gente hizo el test, qué la delata más y qué sistemas, navegadores y tarjetas usa.",
      focus_h: "Los últimos 7 días",
      docs: [
        ["¿De dónde salen estas cifras?","Cada vez que alguien termina una comprobación aquí, la página suma uno a contadores anónimos: el resultado de cada comprobación y valores como el sistema, el navegador y la pantalla. No se guarda la IP ni un registro de cada visita, así que aquí solo hay totales."],
        ["¿Por qué tanta gente queda al descubierto?","Muchos de los que hacen el test ya usan un proxy o una VPN y quieren ver si se esconden bien. Por eso el enrutamiento dividido, los relojes desajustados y las fugas de DNS son mucho más frecuentes aquí que entre los usuarios en general."],
        ["¿Cada cuánto se actualiza?","La página lee las cifras más recientes cada vez que se abre; los totales se calculan una vez por minuto. «Lo más común» solo muestra valores compartidos por 20 comprobaciones o más, así que los valores raros nunca aparecen."],
      ],
    },
    fr: {
      seo_title: "Qui fait le test : ce qui trahit le plus, en chiffres · Qui êtes-vous ?",
      seo_desc: "Statistiques anonymes de who.1ms.dog : combien ont testé leur empreinte du navigateur et leur IP ces 7 derniers jours, combien utilisent le routage séparé, ont une horloge qui ne colle pas à leur IP, une fuite DNS ou WebRTC, et les systèmes, navigateurs, écrans et cartes graphiques les plus courants. Ni IP ni données brutes, seulement des comptages anonymes.",
      seo_kw: "statistiques empreinte navigateur, statistiques test IP, données détection proxy, taux de fuite DNS, taux de fuite WebRTC",
      h1: "Qui fait le test", og_sub: "Ce qui trahit le plus, en chiffres",
      intro: "Ces chiffres viennent de comptages anonymes de chaque test : combien de personnes l’ont fait, ce qui les trahit le plus, et quels systèmes, navigateurs et cartes elles utilisent.",
      focus_h: "Les 7 derniers jours",
      docs: [
        ["D’où viennent ces chiffres ?","Chaque fois que quelqu’un termine un test ici, la page ajoute un à des compteurs anonymes : le résultat de chaque vérification, et des valeurs comme le système, le navigateur et l’écran. Ni l’IP ni la trace d’une visite ne sont gardées : il n’y a ici que des totaux."],
        ["Pourquoi tant de gens se font repérer ?","Beaucoup de ceux qui testent ici utilisent déjà un proxy ou un VPN et veulent voir s’ils se cachent bien. C’est pourquoi le routage séparé, les horloges décalées et les fuites DNS sont bien plus fréquents ici que chez les internautes en général."],
        ["À quelle fréquence est-ce mis à jour ?","La page lit les derniers chiffres à chaque ouverture ; les totaux sont recalculés chaque minute. « Les plus courants » ne montre que des valeurs partagées par au moins 20 tests : les valeurs rares n’y apparaissent jamais."],
      ],
    },
    de: {
      seo_title: "Wer den Test macht: was Leute am häufigsten verrät, in Zahlen · Wer bist du?",
      seo_desc: "Anonyme Statistik von who.1ms.dog: wie viele in den letzten 7 Tagen ihren Browser-Fingerabdruck und ihre IP geprüft haben, wie viele Split-Routing nutzen, eine Uhr haben, die nicht zur IP passt, ein DNS- oder WebRTC-Leck haben, und die häufigsten Systeme, Browser, Bildschirme und Grafikkarten. Keine IP, keine Rohdaten, nur anonyme Zähler.",
      seo_kw: "Browser-Fingerabdruck Statistik, IP-Check Statistik, Proxy-Erkennung Daten, DNS-Leck Anteil, WebRTC-Leck Anteil",
      h1: "Wer den Test macht", og_sub: "Was Leute am häufigsten verrät, in Zahlen",
      intro: "Diese Zahlen kommen aus anonymen Zählern jedes Checks: wie viele den Test gemacht haben, was sie am häufigsten verrät und welche Systeme, Browser und Grafikkarten sie nutzen.",
      focus_h: "Die letzten 7 Tage",
      docs: [
        ["Woher kommen diese Zahlen?","Jedes Mal, wenn hier jemand einen Check beendet, zählt die Seite anonyme Zähler hoch: wie jede Prüfung ausging und Werte wie System, Browser und Bildschirm. Weder die IP noch ein Eintrag pro Besuch wird gespeichert, hier stehen also nur Summen."],
        ["Warum fliegen so viele auf?","Viele, die hier testen, nutzen schon einen Proxy oder ein VPN und wollen sehen, wie gut sie sich verstecken. Deshalb sind Split-Routing, falsch gehende Uhren und DNS-Lecks hier viel häufiger als bei Internetnutzern insgesamt."],
        ["Wie oft wird das aktualisiert?","Die Seite lädt bei jedem Öffnen die neuesten Zahlen; die Summen werden einmal pro Minute berechnet. „Am häufigsten“ zeigt nur Werte, die mindestens 20 Checks teilen, seltene Werte erscheinen hier nie."],
      ],
    },
    pt: {
      seo_title: "Quem faz o teste: o que mais entrega as pessoas, em números · Quem é você?",
      seo_desc: "Estatísticas anônimas do who.1ms.dog: quantos verificaram a impressão digital do navegador e o IP nos últimos 7 dias, quantos usam roteamento dividido, têm o relógio diferente do IP, vazam DNS ou WebRTC, e os sistemas, navegadores, telas e placas de vídeo mais comuns. Sem IP nem dados brutos, só contagens anônimas.",
      seo_kw: "estatísticas impressão digital do navegador, estatísticas verificar IP, dados detecção de proxy, taxa de vazamento DNS, taxa de vazamento WebRTC",
      h1: "Quem faz o teste", og_sub: "O que mais entrega as pessoas, em números",
      intro: "Estes números vêm de contagens anônimas de cada verificação: quantas pessoas fizeram o teste, o que mais as entrega e quais sistemas, navegadores e placas usam.",
      focus_h: "Últimos 7 dias",
      docs: [
        ["De onde vêm esses números?","Cada vez que alguém termina uma verificação aqui, a página soma um a contadores anônimos: o resultado de cada verificação e valores como sistema, navegador e tela. Não se guarda o IP nem registro de cada visita, então aqui só há totais."],
        ["Por que tanta gente é descoberta?","Muitos que testam aqui já usam proxy ou VPN e querem ver se estão bem escondidos. Por isso o roteamento dividido, relógios diferentes do IP e vazamentos de DNS são bem mais comuns aqui do que entre usuários em geral."],
        ["Com que frequência atualiza?","A página lê os números mais recentes sempre que é aberta; os totais são calculados a cada minuto. \"Os mais comuns\" só mostra valores compartilhados por 20 verificações ou mais, então valores raros nunca aparecem aqui."],
      ],
    },
    ru: {
      seo_title: "Кто проходит тест: что чаще всего выдаёт людей, в цифрах · Кто вы?",
      seo_desc: "Анонимная статистика who.1ms.dog: сколько человек за 7 дней проверили цифровой отпечаток браузера и IP, у скольких раздельная маршрутизация, часы не совпадают с IP, утечки DNS или WebRTC, и самые частые системы, браузеры, экраны и видеокарты. Без IP и исходных данных, только анонимные счётчики.",
      seo_kw: "статистика отпечатка браузера, статистика проверки IP, данные обнаружения прокси, доля утечек DNS, доля утечек WebRTC",
      h1: "Кто проходит тест", og_sub: "Что чаще всего выдаёт людей, в цифрах",
      intro: "Эти цифры — анонимные счётчики каждой проверки: сколько людей прошли тест, что чаще всего их выдаёт и какие у них системы, браузеры и видеокарты.",
      focus_h: "Последние 7 дней",
      docs: [
        ["Откуда эти цифры?","Каждый раз, когда кто-то заканчивает проверку, страница прибавляет единицу к анонимным счётчикам: итог каждой проверки и значения вроде системы, браузера и экрана. Ни IP, ни записи о визите не сохраняется, поэтому здесь только суммы."],
        ["Почему столько людей выдают себя?","Многие, кто проверяется здесь, уже пользуются прокси или VPN и хотят понять, хорошо ли прячутся. Поэтому раздельная маршрутизация, часы не по IP и утечки DNS здесь встречаются гораздо чаще, чем у пользователей в целом."],
        ["Как часто обновляется?","Страница загружает свежие цифры при каждом открытии, суммы пересчитываются раз в минуту. «Самое частое» показывает только значения, общие для 20 проверок и больше, поэтому редких значений здесь не бывает."],
      ],
    },
  },
  "vpn-leak": {
    en: {
      seo_title: "VPN Leak Test: do DNS, WebRTC or your real IP give you away? · Who Are You",
      seo_desc: "Free VPN leak test: whether your DNS resolver, WebRTC and the exits each kind of site sees give away your real location, whether the address is a known VPN provider or Tor exit, and what the connection's own fingerprint says. No IP is kept, only anonymous counts.",
      seo_kw: "vpn leak test, dns leak test, webrtc leak, ip leak, vpn check, tor exit node, proxy detection",
      h1: "VPN leak test",
      og_sub: "DNS, WebRTC, and the exits each site sees",
      intro: "A VPN hides the address a site sees, but it can leak elsewhere: DNS queries that go out outside the tunnel, WebRTC finding a local address, or different destinations leaving by different routes. Here is what this visit reveals, and which of the leaks are actually open.",
      focus_h: "Your VPN leak check",
      docs: [
        ["What does a VPN leak test check?", "The places a VPN usually leaks: which country's resolver looked the page's name up (a different country from the IP suggests the query left the tunnel), the addresses WebRTC reports, whether different kinds of site see different exits, whether IPv6 bypasses the tunnel, and whether the address is a public Tor exit. Each is reported separately, never merged into one verdict."],
        ["Does a DNS leak mean my VPN is broken?", "Not necessarily. With Secure DNS (DoH) the browser can send its own queries, outside the VPN; split routing, a fake-ip resolver and a company gateway do the same. Compare the DNS row's country with the IP's, then read the connection fingerprint: together they say whether the query really bypassed the tunnel."],
        ["Why do different sites see different exits?", "The usual cause is rule-based splitting: one proxy client sends local sites direct and foreign sites through the proxy. A mobile carrier, a company network or security software can split traffic the same way. So it is a measurement, not proof that you configured a proxy."],
        ["How do I stop WebRTC leaks?", "Put the proxy client in TUN mode, or route WebRTC through it; in the browser you can limit WebRTC (Chrome's WebRTC Network Limiter). Turning WebRTC off stops the leak but only hides the reading: it does not prove the rest of the traffic is in the tunnel."],
      ],
    },
    "zh-CN": {
      seo_title: "VPN 泄漏检测：DNS、WebRTC 和真实 IP 会不会露出去？ · 你是谁",
      seo_desc: "免费 VPN 泄漏检测：看看 DNS 服务器、WebRTC，以及不同网站看到的出口会不会暴露你的真实位置；地址是不是 VPN 服务商或 Tor 出口；连接本身的指纹又说了什么。不存 IP，只累计匿名计数。",
      seo_kw: "VPN 泄漏检测, DNS 泄漏, WebRTC 泄漏, IP 泄漏, VPN 检测, Tor 出口节点, 代理检测",
      h1: "VPN 泄漏检测",
      og_sub: "DNS、WebRTC，以及不同网站看到的出口",
      intro: "VPN 藏起了网站看到的地址，但别处还可能漏：DNS 查询走出隧道、WebRTC 找到本地地址，或者不同目标走了不同的线路。下面这次访问会露出什么，哪些口子是真的开着。",
      focus_h: "你的 VPN 泄漏情况",
      docs: [
        ["VPN 泄漏检测查什么？", "查 VPN 常见的几个漏点：DNS 查询由哪国的服务器解析（和 IP 对不上，说明查询可能走了隧道外）、WebRTC 报出的地址、不同网站看到的出口是否不同、IPv6 有没有绕过隧道，以及这个地址是不是公开的 Tor 出口。每一项单独说，不合并成一个结论。"],
        ["DNS 泄漏就说明 VPN 坏了吗？", "不一定。浏览器开了安全 DNS（DoH）时，查询可能由浏览器自己发出，不经过 VPN；分流规则、fake-ip 和公司网关也会这样。先看 DNS 那一行和 IP 是不是同一个国家，再看连接的指纹，才能判断查询是不是真的绕过了隧道。"],
        ["为什么不同网站看到不同出口？", "常见原因是按规则分流：同一个代理客户端里，国内站点直连、国外站点走代理。手机运营商、公司网络和安全软件也能把流量分开。所以这是测量结果，不是「你设了代理」的证明。"],
        ["怎样堵住 WebRTC 泄漏？", "代理客户端开 TUN 模式，或让 WebRTC 也走代理；浏览器里可以限制 WebRTC（Chrome 的 WebRTC Network Limiter）。关掉 WebRTC 就不再泄漏，但那只是把读数藏起来，不代表其余流量一定在隧道里。"],
      ],
    },
    "zh-TW": {
      seo_title: "VPN 洩漏檢測：DNS、WebRTC 和真實 IP 會不會露出去？ · 你是誰",
      seo_desc: "免費 VPN 洩漏檢測：看看 DNS 伺服器、WebRTC，以及不同網站看到的出口會不會暴露你的真實位置；位址是不是 VPN 服務商或 Tor 出口；連線本身的指紋又說了什麼。不存 IP，只累計匿名計數。",
      seo_kw: "VPN 洩漏檢測, DNS 洩漏, WebRTC 洩漏, IP 洩漏, VPN 檢測, Tor 出口節點, 代理檢測",
      h1: "VPN 洩漏檢測",
      og_sub: "DNS、WebRTC，以及不同網站看到的出口",
      intro: "VPN 藏起了網站看到的位址，但別處還可能漏：DNS 查詢走出通道、WebRTC 找到本機位址，或者不同目標走了不同的線路。下面是這次造訪會露出什麼，哪些口子是真的開著。",
      focus_h: "你的 VPN 洩漏情況",
      docs: [
        ["VPN 洩漏檢測查什麼？", "查 VPN 常見的幾個漏點：DNS 查詢由哪國的伺服器解析（和 IP 對不上，說明查詢可能走了通道外）、WebRTC 報出的位址、不同網站看到的出口是否不同、IPv6 有沒有繞過通道，以及這個位址是不是公開的 Tor 出口。每一項單獨說，不合并成一個結論。"],
        ["DNS 洩漏就說明 VPN 壞了嗎？", "不一定。瀏覽器開了安全 DNS（DoH）時，查詢可能由瀏覽器自己發出，不經過 VPN；分流規則、fake-ip 和公司閘道也會這樣。先看 DNS 那一列和 IP 是不是同一個國家，再看連線的指紋，才能判斷查詢是不是真的繞過了通道。"],
        ["為什麼不同網站看到不同出口？", "常見原因是按規則分流：同一個代理用戶端裡，本地網站直連、國外網站走代理。行動電信、公司網路和安全軟體也能把流量分開。所以這是測量結果，不是「你設了代理」的證明。"],
        ["怎樣堵住 WebRTC 洩漏？", "代理用戶端開 TUN 模式，或讓 WebRTC 也走代理；瀏覽器裡可以限制 WebRTC（Chrome 的 WebRTC Network Limiter）。關掉 WebRTC 就不再洩漏，但那只是把讀數藏起來，不代表其餘流量一定在通道裡。"],
      ],
    },
    ja: {
      seo_title: "VPN リークテスト：DNS・WebRTC・実際の IP は漏れていない？ · あなたは誰？",
      seo_desc: "無料の VPN リークテスト：DNS リゾルバー、WebRTC、サイトごとに見える出口が本当の場所を漏らしていないか、アドレスが VPN 事業者や Tor 出口か、接続自体の指紋が何を語るかを確認します。IP は保存せず、匿名の集計だけです。",
      seo_kw: "VPN リークテスト, DNS リーク, WebRTC リーク, IP リーク, VPN チェック, Tor 出口ノード, プロキシ検出",
      h1: "VPN リークテスト",
      og_sub: "DNS、WebRTC、サイトごとの出口",
      intro: "VPN はサイトに見えるアドレスを隠しますが、ほかで漏れることがあります。DNS 問い合わせがトンネルの外に出る、WebRTC がローカルアドレスを見つける、行き先ごとに別の経路を通る、などです。この訪問で何が分かるか、どの漏れが実際に開いているかを見ます。",
      focus_h: "VPN リークの結果",
      docs: [
        ["VPN リークテストは何を見ますか？", "VPN がよく漏れる場所です。DNS 問い合わせをどの国のリゾルバーが引いたか（IP と国が違えばトンネルの外に出た可能性）、WebRTC が報告するアドレス、サイトの種類ごとに出口が違うか、IPv6 がトンネルを迂回していないか、公開 Tor 出口かどうか。それぞれ別に表示し、一つの結論にまとめません。"],
        ["DNS リークは VPN が壊れている証拠ですか？", "いいえ。Secure DNS（DoH）ではブラウザ自身が VPN の外に問い合わせることがあり、分割ルーティング、fake-ip、会社のゲートウェイも同じです。DNS の行の国と IP を比べ、接続の指紋も読むと、本当にトンネルを迂回したか分かります。"],
        ["サイトごとに出口が違うのはなぜ？", "よくあるのはルールベースの分割です。同じプロキシクライアントが国内サイトを直結、海外サイトをプロキシ経由にします。携帯キャリア、会社のネットワーク、セキュリティソフトも同じように分けられます。測定結果であって、プロキシを設定した証明ではありません。"],
        ["WebRTC の漏れはどう止めますか？", "プロキシクライアントを TUN モードにするか、WebRTC もプロキシ経由にします。ブラウザでは WebRTC を制限できます（Chrome の WebRTC Network Limiter）。切れば漏れは止まりますが、読めなくなるだけで、残りの通信がトンネル内とは限りません。"],
      ],
    },
    ko: {
      seo_title: "VPN 누출 테스트: DNS, WebRTC, 실제 IP가 새는지 · 당신은 누구?",
      seo_desc: "무료 VPN 누출 테스트: DNS 리졸버, WebRTC, 사이트마다 보이는 출구가 실제 위치를 드러내는지, 주소가 VPN 제공업체나 Tor 출구인지, 연결 자체의 지문이 무엇을 말하는지 확인합니다. IP는 저장하지 않고 익명 집계만 합니다.",
      seo_kw: "VPN 누출 테스트, DNS 누출, WebRTC 누출, IP 누출, VPN 확인, Tor 출구 노드, 프록시 탐지",
      h1: "VPN 누출 테스트",
      og_sub: "DNS, WebRTC, 사이트마다 다른 출구",
      intro: "VPN은 사이트가 보는 주소를 숨기지만 다른 곳에서 샐 수 있습니다. DNS 질의가 터널 밖으로 나가거나, WebRTC가 로컬 주소를 찾거나, 대상마다 다른 경로로 나갈 수 있습니다. 이번 방문에서 무엇이 드러나는지, 어떤 누출이 실제로 열려 있는지 봅니다.",
      focus_h: "VPN 누출 결과",
      docs: [
        ["VPN 누출 테스트는 무엇을 봅니까?", "VPN이 자주 새는 곳입니다. DNS 질의를 어느 나라 리졸버가 조회했는지(IP와 국가가 다르면 터널 밖으로 나갔을 수 있음), WebRTC가 보고하는 주소, 사이트 종류마다 출구가 다른지, IPv6가 터널을 우회하는지, 공개 Tor 출구인지. 각각 따로 보여 주고 하나의 결론으로 합치지 않습니다."],
        ["DNS 누출이 VPN 고장이라는 뜻입니까?", "아닙니다. 보안 DNS(DoH)를 쓰면 브라우저가 VPN 밖으로 직접 질의할 수 있고, 분할 라우팅, fake-ip, 회사 게이트웨이도 마찬가지입니다. DNS 행의 국가와 IP를 비교하고 연결 지문까지 읽어야 질의가 정말 터널을 우회했는지 알 수 있습니다."],
        ["사이트마다 출구가 다른 이유는?", "흔한 원인은 규칙 기반 분할입니다. 한 프록시 클라이언트가 국내 사이트는 직접, 해외 사이트는 프록시로 보냅니다. 이동통신사, 회사 네트워크, 보안 소프트웨어도 같은 방식으로 나눌 수 있습니다. 그래서 측정 결과이지 프록시를 설정했다는 증거가 아닙니다."],
        ["WebRTC 누출은 어떻게 막습니까?", "프록시 클라이언트를 TUN 모드로 두거나 WebRTC도 프록시를 거치게 합니다. 브라우저에서 WebRTC를 제한할 수도 있습니다(Chrome의 WebRTC Network Limiter). 끄면 누출은 멈추지만 읽기만 가릴 뿐, 나머지 트래픽이 터널 안에 있다는 뜻은 아닙니다."],
      ],
    },
    es: {
      seo_title: "Prueba de fugas de VPN: ¿se filtran DNS, WebRTC y tu IP real? · ¿Quién eres?",
      seo_desc: "Prueba gratuita de fugas de VPN: comprueba si el resolutor DNS, WebRTC y las salidas que ve cada sitio delatan tu ubicación real, si la dirección es de un proveedor de VPN o una salida de Tor, y qué dice la huella de la propia conexión. No se guarda la IP, solo recuentos anónimos.",
      seo_kw: "prueba de fugas vpn, fuga dns, fuga webrtc, fuga ip, comprobar vpn, nodo de salida tor, detección de proxy",
      h1: "Prueba de fugas de VPN",
      og_sub: "DNS, WebRTC y las salidas que ve cada sitio",
      intro: "Una VPN oculta la dirección que ve un sitio, pero puede filtrarse por otros lados: consultas DNS que salen fuera del túnel, WebRTC encontrando una dirección local, o destinos distintos saliendo por rutas distintas. Esto es lo que revela esta visita y qué fugas están realmente abiertas.",
      focus_h: "Tu resultado de fugas",
      docs: [
        ["¿Qué comprueba una prueba de fugas de VPN?", "Los puntos por donde una VPN suele filtrarse: qué país resolvió el nombre de la página (otro país distinto del IP sugiere que la consulta salió del túnel), las direcciones que informa WebRTC, si distintos tipos de sitio ven salidas distintas, si IPv6 se salta el túnel y si la dirección es una salida pública de Tor. Cada cosa se informa por separado, nunca en un solo veredicto."],
        ["¿Una fuga de DNS significa que mi VPN falla?", "No necesariamente. Con DNS seguro (DoH) el navegador puede enviar sus propias consultas fuera de la VPN; el enrutamiento dividido, un resolutor fake-ip y la pasarela de una empresa hacen lo mismo. Compara el país de la fila DNS con el del IP y lee la huella de la conexión: juntos dicen si la consulta evitó el túnel."],
        ["¿Por qué distintos sitios ven salidas distintas?", "La causa habitual es el enrutamiento por reglas: un mismo cliente de proxy manda los sitios locales directos y los extranjeros por el proxy. Una operadora móvil, una red de empresa o un software de seguridad pueden dividir el tráfico igual. Es una medición, no la prueba de que hayas configurado un proxy."],
        ["¿Cómo evito las fugas de WebRTC?", "Pon el cliente de proxy en modo TUN, o haz que WebRTC pase por él; en el navegador puedes limitar WebRTC (WebRTC Network Limiter de Chrome). Apagarlo detiene la fuga, pero solo oculta la lectura: no demuestra que el resto del tráfico vaya por el túnel."],
      ],
    },
    fr: {
      seo_title: "Test de fuite VPN : DNS, WebRTC et vraie IP sont-ils exposés ? · Qui êtes-vous ?",
      seo_desc: "Test gratuit de fuite VPN : vérifiez si le résolveur DNS, WebRTC et les sorties vues par chaque site trahissent votre position réelle, si l’adresse appartient à un fournisseur de VPN ou à une sortie Tor, et ce que dit l’empreinte de la connexion. L’IP n’est pas conservée, seulement des comptages anonymes.",
      seo_kw: "test fuite vpn, fuite dns, fuite webrtc, fuite ip, vérifier vpn, nœud de sortie tor, détection de proxy",
      h1: "Test de fuite VPN",
      og_sub: "DNS, WebRTC et les sorties que voit chaque site",
      intro: "Un VPN cache l’adresse qu’un site voit, mais il peut fuir ailleurs : des requêtes DNS qui sortent du tunnel, WebRTC qui trouve une adresse locale, ou des destinations différentes qui partent par des routes différentes. Voici ce que révèle cette visite et quelles fuites sont réellement ouvertes.",
      focus_h: "Votre résultat de fuite VPN",
      docs: [
        ["Que vérifie un test de fuite VPN ?", "Les endroits où un VPN fuit souvent : quel pays a résolu le nom de la page (un autre pays que l’IP suggère que la requête a quitté le tunnel), les adresses rapportées par WebRTC, si des sites différents voient des sorties différentes, si l’IPv6 contourne le tunnel et si l’adresse est une sortie Tor publique. Chaque point est dit séparément, jamais fondu en un seul verdict."],
        ["Une fuite DNS signifie-t-elle que mon VPN est cassé ?", "Pas forcément. Avec le DNS sécurisé (DoH), le navigateur peut envoyer ses propres requêtes hors du VPN ; le routage divisé, un résolveur fake-ip et la passerelle d’une entreprise font de même. Comparez le pays de la ligne DNS avec celui de l’IP, puis lisez l’empreinte de la connexion : ensemble, ils disent si la requête a vraiment évité le tunnel."],
        ["Pourquoi des sites différents voient-ils des sorties différentes ?", "La cause habituelle est le routage par règles : un même client proxy envoie les sites locaux en direct et les sites étrangers par le proxy. Un opérateur mobile, un réseau d’entreprise ou un logiciel de sécurité peuvent diviser le trafic de la même façon. C’est une mesure, pas la preuve que vous avez configuré un proxy."],
        ["Comment arrêter les fuites WebRTC ?", "Mettez le client proxy en mode TUN, ou faites passer WebRTC par lui ; dans le navigateur, vous pouvez limiter WebRTC (WebRTC Network Limiter de Chrome). Le désactiver arrête la fuite mais ne fait que cacher la lecture : cela ne prouve pas que le reste du trafic passe par le tunnel."],
      ],
    },
    de: {
      seo_title: "VPN-Leak-Test: Verraten DNS, WebRTC und die echte IP dich? · Wer bist du?",
      seo_desc: "Kostenloser VPN-Leak-Test: Prüf, ob DNS-Auflöser, WebRTC und die Ausgänge, die einzelne Websites sehen, deinen echten Standort verraten, ob die Adresse zu einem VPN-Anbieter oder einem Tor-Ausgang gehört und was der Fingerabdruck der Verbindung sagt. Die IP wird nicht gespeichert, nur anonym gezählt.",
      seo_kw: "vpn leak test, dns leak, webrtc leak, ip leak, vpn prüfen, tor ausgangsknoten, proxy erkennung",
      h1: "VPN-Leak-Test",
      og_sub: "DNS, WebRTC und die Ausgänge, die jede Website sieht",
      intro: "Ein VPN verbirgt die Adresse, die eine Website sieht, kann aber anderswo lecken: DNS-Anfragen, die außerhalb des Tunnels rausgehen, WebRTC, das eine lokale Adresse findet, oder verschiedene Ziele, die über verschiedene Wege rausgehen. Hier steht, was dieser Besuch verrät und welche Lecks wirklich offen sind.",
      focus_h: "Dein VPN-Leak-Ergebnis",
      docs: [
        ["Was prüft ein VPN-Leak-Test?", "Die Stellen, an denen ein VPN oft leckt: Welches Land den Namen der Seite aufgelöst hat (ein anderes Land als das der IP deutet darauf, dass die Anfrage den Tunnel verlassen hat), die Adressen, die WebRTC meldet, ob verschiedene Arten von Websites verschiedene Ausgänge sehen, ob IPv6 den Tunnel umgeht und ob die Adresse ein öffentlicher Tor-Ausgang ist. Jedes wird einzeln gesagt, nie in ein Urteil zusammengezogen."],
        ["Heißt eine DNS-Leck, dass mein VPN kaputt ist?", "Nicht unbedingt. Mit sicherem DNS (DoH) kann der Browser eigene Anfragen außerhalb des VPNs schicken; geteiltes Routing, ein fake-ip-Auflöser und ein Firmen-Gateway tun dasselbe. Vergleiche das Land der DNS-Zeile mit dem der IP und lies den Fingerabdruck der Verbindung: zusammen sagen sie, ob die Anfrage den Tunnel wirklich umgangen hat."],
        ["Warum sehen verschiedene Websites verschiedene Ausgänge?", "Meist ist es regelbasiertes Aufteilen: Derselbe Proxy-Client schickt lokale Websites direkt und fremde durch den Proxy. Ein Mobilfunknetz, ein Firmennetz oder Sicherheitssoftware können den Verkehr genauso teilen. Es ist eine Messung, kein Beweis, dass du einen Proxy eingerichtet hast."],
        ["Wie stoppe ich WebRTC-Lecks?", "Setz den Proxy-Client in den TUN-Modus oder leite WebRTC durch ihn; im Browser kannst du WebRTC begrenzen (Chromes WebRTC Network Limiter). Ausschalten stoppt das Leck, verbirgt aber nur die Messung: es beweist nicht, dass der übrige Verkehr im Tunnel ist."],
      ],
    },
    pt: {
      seo_title: "Teste de fuga de VPN: o DNS, o WebRTC e o IP real escapam? · Quem é você?",
      seo_desc: "Teste gratuito de fuga de VPN: vê se o servidor DNS, o WebRTC e as saídas que cada site vê revelam a tua localização real, se o endereço é de um fornecedor de VPN ou de uma saída Tor, e o que diz a impressão digital da própria ligação. O IP não é guardado, só contagens anónimas.",
      seo_kw: "teste fuga vpn, fuga dns, fuga webrtc, fuga ip, verificar vpn, nó de saída tor, deteção de proxy",
      h1: "Teste de fuga de VPN",
      og_sub: "DNS, WebRTC e as saídas que cada site vê",
      intro: "Uma VPN esconde o endereço que um site vê, mas pode escapar por outros lados: consultas DNS que saem fora do túnel, WebRTC a encontrar um endereço local, ou destinos diferentes a sair por rotas diferentes. Eis o que esta visita revela e que fugas estão realmente abertas.",
      focus_h: "O teu resultado de fuga de VPN",
      docs: [
        ["O que verifica um teste de fuga de VPN?", "Os pontos por onde uma VPN costuma fugir: que país resolveu o nome da página (outro país diferente do IP sugere que a consulta saiu do túnel), os endereços que o WebRTC informa, se tipos diferentes de site veem saídas diferentes, se o IPv6 contorna o túnel e se o endereço é uma saída pública da Tor. Cada um é dito à parte, nunca juntado num só veredicto."],
        ["Uma fuga de DNS significa que a VPN está avariada?", "Não necessariamente. Com DNS seguro (DoH) o navegador pode enviar as suas próprias consultas fora da VPN; o encaminhamento dividido, um resolvedor fake-ip e a gateway de uma empresa fazem o mesmo. Compara o país da linha DNS com o do IP e lê a impressão digital da ligação: juntos dizem se a consulta evitou mesmo o túnel."],
        ["Porque é que sites diferentes veem saídas diferentes?", "A causa habitual é o encaminhamento por regras: o mesmo cliente de proxy manda os sites locais diretos e os estrangeiros pelo proxy. Uma operadora móvel, uma rede de empresa ou software de segurança podem dividir o tráfego da mesma forma. É uma medição, não a prova de que configuraste um proxy."],
        ["Como paro as fugas de WebRTC?", "Põe o cliente de proxy em modo TUN, ou faz o WebRTC passar por ele; no navegador podes limitar o WebRTC (WebRTC Network Limiter do Chrome). Desligá-lo para a fuga, mas só esconde a leitura: não prova que o resto do tráfego vá pelo túnel."],
      ],
    },
    ru: {
      seo_title: "Тест утечек VPN: выдают ли DNS, WebRTC и настоящий IP? · Кто вы?",
      seo_desc: "Бесплатный тест утечек VPN: проверьте, выдают ли DNS-резолвер, WebRTC и выходы, которые видят разные сайты, ваше настоящее местоположение, принадлежит ли адрес VPN-провайдеру или выходному узлу Tor, и что говорит отпечаток самого соединения. IP не сохраняется, только анонимные счётчики.",
      seo_kw: "тест утечки vpn, утечка dns, утечка webrtc, утечка ip, проверить vpn, выходной узел tor, обнаружение прокси",
      h1: "Тест утечек VPN",
      og_sub: "DNS, WebRTC и выходы, которые видит каждый сайт",
      intro: "VPN скрывает адрес, который видит сайт, но может утекать в другом: DNS-запросы уходят вне туннеля, WebRTC находит локальный адрес, а разные адресаты выходят разными маршрутами. Вот что выдаёт этот визит и какие утечки действительно открыты.",
      focus_h: "Ваш результат утечек",
      docs: [
        ["Что проверяет тест утечек VPN?", "Места, где VPN часто течёт: какая страна разрешила имя страницы (другая страна, не как у IP, значит запрос мог выйти из туннеля), адреса, которые сообщает WebRTC, видят ли разные типы сайтов разные выходы, обходит ли IPv6 туннель и является ли адрес публичным выходом Tor. О каждом говорится отдельно, без единого приговора."],
        ["Утечка DNS значит, что VPN сломан?", "Не обязательно. При защищённом DNS (DoH) браузер может слать свои запросы вне VPN; раздельная маршрутизация, резолвер fake-ip и корпоративный шлюз делают то же. Сравните страну в строке DNS со страной IP и прочитайте отпечаток соединения: вместе они скажут, обошёл ли запрос туннель."],
        ["Почему разные сайты видят разные выходы?", "Чаще всего это разделение по правилам: один прокси-клиент отправляет локальные сайты напрямую, а зарубежные — через прокси. Мобильный оператор, корпоративная сеть или защитное ПО могут делить трафик так же. Это измерение, а не доказательство, что вы настроили прокси."],
        ["Как остановить утечки WebRTC?", "Переведите прокси-клиент в режим TUN или пустите WebRTC через него; в браузере можно ограничить WebRTC (WebRTC Network Limiter в Chrome). Выключение останавливает утечку, но лишь скрывает показание: оно не доказывает, что остальной трафик идёт через туннель."],
      ],
    },
  },
  "webgpu": {
    en: {
      seo_title: "WebGPU Fingerprint Test: what your GPU tells a site · Who Are You",
      seo_desc: "Free WebGPU check: your adapter's vendor, architecture and limits, how they compare with WebGL, and whether WebGPU makes your fingerprint more unique or your browser hides it. No IP is kept, only anonymous counts.",
      seo_kw: "webgpu test, webgpu fingerprint, gpu fingerprint, adapter info, webgpu support, graphics card test",
      h1: "WebGPU check",
      og_sub: "The adapter, its limits, and what they add to your fingerprint",
      intro: "WebGPU gives sites a new, detailed view of the graphics card: its vendor and architecture, its limits and features. Chrome and Edge expose it by default, and Safari and Firefox support it now with differences. Here is what this browser hands over, and whether it agrees with WebGL.",
      focus_h: "Your WebGPU",
      docs: [
        ["What is WebGPU?", "A newer graphics API for the web, closer to modern cards than WebGL: compute shaders, finer control of memory and queues. A site asks navigator.gpu for an adapter and gets its vendor, architecture, description, limits and feature list."],
        ["What does WebGPU add to a fingerprint?", "The adapter name and architecture point at a card's model or family, and the limit and feature lists follow the driver and browser version. They stay stable on one machine, and together with canvas, WebGL and fonts they make a fingerprint more specific."],
        ["Does my browser support it?", "Chrome and Edge 113+, Firefox 141+ on Windows, Safari 26+; it needs HTTPS. A browser without it says so in the row instead of leaving a blank."],
        ["Why does WebGPU name a different card than WebGL?", "Laptops often have two: pages draw on the integrated card by default, and WebGPU asking for a high-performance adapter may get the discrete one. The page reads both the high-performance and low-power adapters and lists what each reports; when only one exists, they are the same card."],
      ],
    },
    "zh-CN": {
      seo_title: "WebGPU 指纹检测：显卡向网站透露了什么 · 你是谁",
      seo_desc: "免费 WebGPU 检测：显卡适配器的厂商、架构和各项上限，和 WebGL 的结果对照，看 WebGPU 是让你的指纹更独特，还是被浏览器藏了起来。不存 IP，只累计匿名计数。",
      seo_kw: "WebGPU 检测, WebGPU 指纹, 显卡指纹, 适配器信息, WebGPU 支持, 显卡检测",
      h1: "WebGPU 检测",
      og_sub: "适配器、它的上限，以及它给指纹添了什么",
      intro: "WebGPU 给了网站一个看显卡的新窗口：厂商、架构、各项上限和特性。Chrome 和 Edge 默认开放，Safari 和 Firefox 现在也支持，细节各有不同。下面这个浏览器交出了什么，和 WebGL 说的是不是同一张卡。",
      focus_h: "你的 WebGPU",
      docs: [
        ["WebGPU 是什么？", "新的网页图形接口，比 WebGL 更接近现代显卡的能力：计算着色器、显存和队列的细粒度控制。网站通过 navigator.gpu 请求适配器，拿到厂商、架构、描述、上限和特性列表。"],
        ["WebGPU 给指纹添了什么？", "适配器名和架构直接指向显卡型号或系列，上限和特性列表则跟着驱动和浏览器版本走。它们在一台机器上很稳定，和 Canvas、WebGL、字体合在一起，能让指纹更具体。"],
        ["我的浏览器支持 WebGPU 吗？", "Chrome 和 Edge 113 起、Windows 上的 Firefox 141 起、Safari 26 起支持；需要 HTTPS。不支持的浏览器这一行会写「这个浏览器没有提供」，不会留空。"],
        ["为什么 WebGPU 和 WebGL 说的显卡不一样？", "笔记本常有两张卡：页面默认用集显，WebGPU 请求高性能适配器时可能拿到独显。页面会分别读高性和低功耗适配器，两张都列出来；只有一张时就是同一张。"],
      ],
    },
    "zh-TW": {
      seo_title: "WebGPU 指紋檢測：顯示卡向網站透露了什麼 · 你是誰",
      seo_desc: "免費 WebGPU 檢測：顯示卡適配器的廠商、架構和各項上限，和 WebGL 的結果對照，看 WebGPU 是讓你的指紋更獨特，還是被瀏覽器藏了起來。不存 IP，只累計匿名計數。",
      seo_kw: "WebGPU 檢測, WebGPU 指紋, 顯示卡指紋, 適配器資訊, WebGPU 支援, 顯示卡檢測",
      h1: "WebGPU 檢測",
      og_sub: "適配器、它的上限，以及它替指紋添了什麼",
      intro: "WebGPU 給了網站一個看顯示卡的新窗口：廠商、架構、各項上限和特性。Chrome 和 Edge 預設開放，Safari 和 Firefox 現在也支援，細節各有不同。下面這個瀏覽器交出了什麼，和 WebGL 說的是不是同一張卡。",
      focus_h: "你的 WebGPU",
      docs: [
        ["WebGPU 是什麼？", "新的網頁圖形介面，比 WebGL 更接近現代顯示卡的能力：計算著色器、視訊記憶體和佇列的細緻控制。網站透過 navigator.gpu 請求適配器，拿到廠商、架構、描述、上限和特性清單。"],
        ["WebGPU 替指紋添了什麼？", "適配器名稱和架構直接指向顯示卡型號或系列，上限和特性清單則跟著驅動程式和瀏覽器版本走。它們在同一台機器上很穩定，和 Canvas、WebGL、字型合在一起，能讓指紋更具體。"],
        ["我的瀏覽器支援 WebGPU 嗎？", "Chrome 和 Edge 113 起、Windows 上的 Firefox 141 起、Safari 26 起支援；需要 HTTPS。不支援的瀏覽器這一列會寫「這個瀏覽器沒有提供」，不會留空。"],
        ["為什麼 WebGPU 和 WebGL 說的顯示卡不一樣？", "筆電常有兩張卡：頁面預設用內顯，WebGPU 要求高效能適配器時可能拿到獨顯。頁面會分別讀高效能和低功耗適配器，兩張都列出來；只有一張時就是同一張。"],
      ],
    },
    ja: {
      seo_title: "WebGPU 指紋テスト：GPU がサイトに何を明かすか · あなたは誰？",
      seo_desc: "無料の WebGPU チェック：アダプターのベンダー、アーキテクチャ、各種上限と、WebGL との一致・不一致。WebGPU が指紋をより固有にするのか、ブラウザが隠しているのかを確認します。IP は保存せず、匿名の集計だけです。",
      seo_kw: "webgpu テスト, webgpu 指紋, gpu 指紋, アダプター情報, webgpu 対応, グラフィックカード 確認",
      h1: "WebGPU チェック",
      og_sub: "アダプター、その上限、指紋に加わるもの",
      intro: "WebGPU はサイトに GPU を見る新しい窓を与えます。ベンダー、アーキテクチャ、上限、機能です。Chrome と Edge は既定で公開し、Safari と Firefox も対応しましたが細部は異なります。このブラウザが何を渡し、WebGL と同じカードを指しているかを見ます。",
      focus_h: "あなたの WebGPU",
      docs: [
        ["WebGPU とは？", "WebGL より現代の GPU に近い、新しいウェブのグラフィックス API です。計算シェーダーや、メモリとキューの細かな制御ができます。サイトは navigator.gpu でアダプターを求め、ベンダー、アーキテクチャ、説明、上限、機能一覧を受け取ります。"],
        ["WebGPU は指紋に何を加えますか？", "アダプター名とアーキテクチャはカードの型番や系列を指し、上限と機能の一覧はドライバーとブラウザの版に従います。同じ機械では安定しており、Canvas、WebGL、フォントと合わさると指紋がより具体的になります。"],
        ["私のブラウザは対応していますか？", "Chrome と Edge 113 以降、Windows の Firefox 141 以降、Safari 26 以降です。HTTPS が必要です。対応していないブラウザでは、行に「このブラウザは提供していません」と出ます。"],
        ["WebGPU と WebGL で違うカード名になるのはなぜ？", "ノート PC にはよく 2 枚あります。ページは既定で内蔵 GPU を使い、WebGPU が高性能アダプターを求めると外付け GPU になることがあります。ページは高性能と低消費電力の両方を読み、それぞれの報告を並べます。1 枚しかなければ同じカードです。"],
      ],
    },
    ko: {
      seo_title: "WebGPU 지문 테스트: GPU가 사이트에 무엇을 알려 주는가 · 당신은 누구?",
      seo_desc: "무료 WebGPU 확인: 어댑터의 제조사, 아키텍처, 각종 한도와 WebGL과의 일치 여부. WebGPU가 지문을 더 특별하게 만드는지, 브라우저가 숨기는지 확인합니다. IP는 저장하지 않고 익명 집계만 합니다.",
      seo_kw: "webgpu 테스트, webgpu 지문, gpu 지문, 어댑터 정보, webgpu 지원, 그래픽 카드 확인",
      h1: "WebGPU 확인",
      og_sub: "어댑터, 그 한도, 그리고 지문에 더해지는 것",
      intro: "WebGPU는 사이트에 GPU를 보는 새 창을 줍니다. 제조사, 아키텍처, 한도, 기능입니다. Chrome과 Edge는 기본으로 공개하고 Safari와 Firefox도 이제 지원하지만 세부는 다릅니다. 이 브라우저가 무엇을 넘기는지, WebGL과 같은 카드인지 봅니다.",
      focus_h: "당신의 WebGPU",
      docs: [
        ["WebGPU란?", "WebGL보다 현대 GPU에 가까운 새 웹 그래픽 API입니다. 컴퓨트 셰이더와 메모리·큐의 세밀한 제어가 가능합니다. 사이트는 navigator.gpu로 어댑터를 요청해 제조사, 아키텍처, 설명, 한도, 기능 목록을 받습니다."],
        ["WebGPU는 지문에 무엇을 더합니까?", "어댑터 이름과 아키텍처는 카드의 모델이나 계열을 가리키고, 한도와 기능 목록은 드라이버와 브라우저 버전을 따릅니다. 한 기기에서 안정적이며 Canvas, WebGL, 글꼴과 합쳐지면 지문이 더 구체해집니다."],
        ["내 브라우저가 지원합니까?", "Chrome과 Edge 113 이상, Windows의 Firefox 141 이상, Safari 26 이상입니다. HTTPS가 필요합니다. 지원하지 않으면 그 행에 '이 브라우저는 제공하지 않음'이라고 나옵니다."],
        ["WebGPU와 WebGL이 다른 카드를 말하는 이유는?", "노트북에는 카드가 둘인 경우가 많습니다. 페이지는 기본으로 내장 GPU를 쓰고, WebGPU가 고성능 어댑터를 요청하면 외장 GPU를 받을 수 있습니다. 페이지는 고성능과 저전력 어댑터를 모두 읽어 각각 표시합니다. 하나뿐이면 같은 카드입니다."],
      ],
    },
    es: {
      seo_title: "Prueba de huella WebGPU: qué le cuenta tu GPU a un sitio · ¿Quién eres?",
      seo_desc: "Comprobación WebGPU gratuita: el fabricante, la arquitectura y los límites de tu adaptador, cómo se comparan con WebGL, y si WebGPU hace tu huella más única o tu navegador la oculta. No se guarda la IP, solo recuentos anónimos.",
      seo_kw: "prueba webgpu, huella webgpu, huella gpu, información del adaptador, soporte webgpu, comprobar tarjeta gráfica",
      h1: "Comprobación WebGPU",
      og_sub: "El adaptador, sus límites y lo que añaden a tu huella",
      intro: "WebGPU da a los sitios una vista nueva y detallada de la tarjeta gráfica: su fabricante y arquitectura, sus límites y funciones. Chrome y Edge la exponen por defecto, y Safari y Firefox ya la admiten con diferencias. Esto es lo que entrega este navegador y si coincide con WebGL.",
      focus_h: "Tu WebGPU",
      docs: [
        ["¿Qué es WebGPU?", "Una API gráfica más reciente para la web, más cercana a las tarjetas modernas que WebGL: sombreadores de cálculo y control fino de memoria y colas. Un sitio pide un adaptador a navigator.gpu y recibe su fabricante, arquitectura, descripción, límites y lista de funciones."],
        ["¿Qué añade WebGPU a una huella?", "El nombre y la arquitectura del adaptador apuntan al modelo o la familia de la tarjeta, y las listas de límites y funciones siguen al controlador y a la versión del navegador. Son estables en una máquina y, junto al canvas, WebGL y las fuentes, hacen la huella más concreta."],
        ["¿Mi navegador lo admite?", "Chrome y Edge 113+, Firefox 141+ en Windows, Safari 26+; necesita HTTPS. Un navegador sin ello lo dice en la fila en vez de dejarla vacía."],
        ["¿Por qué WebGPU nombra otra tarjeta que WebGL?", "Los portátiles suelen tener dos: las páginas dibujan en la integrada por defecto, y WebGPU, al pedir un adaptador de alto rendimiento, puede recibir la dedicada. La página lee los adaptadores de alto rendimiento y de bajo consumo y muestra lo que informa cada uno; si solo hay uno, es la misma tarjeta."],
      ],
    },
    fr: {
      seo_title: "Test d’empreinte WebGPU : ce que votre GPU dit d’un site · Qui êtes-vous ?",
      seo_desc: "Vérification WebGPU gratuite : le fabricant, l’architecture et les limites de votre adaptateur, leur comparaison avec WebGL, et si WebGPU rend votre empreinte plus unique ou si le navigateur la cache. L’IP n’est pas conservée, seulement des comptages anonymes.",
      seo_kw: "test webgpu, empreinte webgpu, empreinte gpu, infos adaptateur, support webgpu, tester carte graphique",
      h1: "Vérification WebGPU",
      og_sub: "L’adaptateur, ses limites et ce qu’elles ajoutent à votre empreinte",
      intro: "WebGPU donne aux sites une vue nouvelle et détaillée de la carte graphique : son fabricant et son architecture, ses limites et ses fonctions. Chrome et Edge l’exposent par défaut, et Safari comme Firefox le prennent en charge désormais, avec des différences. Voici ce que livre ce navigateur et si cela concorde avec WebGL.",
      focus_h: "Votre WebGPU",
      docs: [
        ["Qu’est-ce que WebGPU ?", "Une API graphique plus récente pour le web, plus proche des cartes modernes que WebGL : shaders de calcul, contrôle fin de la mémoire et des files. Un site demande un adaptateur à navigator.gpu et reçoit son fabricant, son architecture, sa description, ses limites et sa liste de fonctions."],
        ["Qu’ajoute WebGPU à une empreinte ?", "Le nom et l’architecture de l’adaptateur désignent le modèle ou la famille de la carte, et les listes de limites et de fonctions suivent le pilote et la version du navigateur. Ils restent stables sur une machine et, avec le canvas, WebGL et les polices, rendent l’empreinte plus précise."],
        ["Mon navigateur le prend-il en charge ?", "Chrome et Edge 113+, Firefox 141+ sous Windows, Safari 26+ ; il faut HTTPS. Un navigateur sans WebGPU l’indique dans la ligne au lieu de la laisser vide."],
        ["Pourquoi WebGPU nomme-t-il une autre carte que WebGL ?", "Un portable en a souvent deux : les pages dessinent sur l’intégrée par défaut, et WebGPU, en demandant un adaptateur haute performance, peut recevoir la dédiée. La page lit les deux adaptateurs, haute performance et basse consommation, et montre ce que chacun rapporte ; s’il n’y en a qu’un, c’est la même carte."],
      ],
    },
    de: {
      seo_title: "WebGPU-Fingerprint-Test: Was deine GPU einer Website verrät · Wer bist du?",
      seo_desc: "Kostenloser WebGPU-Check: Hersteller, Architektur und Limits deines Adapters, der Vergleich mit WebGL und ob WebGPU deinen Fingerabdruck einzigartiger macht oder der Browser ihn verbirgt. Die IP wird nicht gespeichert, nur anonym gezählt.",
      seo_kw: "webgpu test, webgpu fingerabdruck, gpu fingerabdruck, adapter infos, webgpu unterstützung, grafikkarte prüfen",
      h1: "WebGPU-Check",
      og_sub: "Der Adapter, seine Limits und was sie zum Fingerabdruck hinzufügen",
      intro: "WebGPU gibt Websites einen neuen, detaillierten Blick auf die Grafikkarte: Hersteller und Architektur, Limits und Funktionen. Chrome und Edge legen ihn standardmäßig offen, Safari und Firefox unterstützen es inzwischen mit Unterschieden. Hier steht, was dieser Browser herausgibt und ob es mit WebGL übereinstimmt.",
      focus_h: "Dein WebGPU",
      docs: [
        ["Was ist WebGPU?", "Eine neuere Grafik-API fürs Web, näher an modernen Karten als WebGL: Compute-Shader, feinere Kontrolle über Speicher und Warteschlangen. Eine Website fragt navigator.gpu nach einem Adapter und erhält Hersteller, Architektur, Beschreibung, Limits und Funktionsliste."],
        ["Was fügt WebGPU einem Fingerabdruck hinzu?", "Adaptername und Architektur deuten auf Modell oder Familie der Karte, und die Listen von Limits und Funktionen folgen Treiber und Browserversion. Auf einer Maschine bleiben sie stabil und machen mit Canvas, WebGL und Schriften den Fingerabdruck konkreter."],
        ["Unterstützt mein Browser das?", "Chrome und Edge 113+, Firefox 141+ unter Windows, Safari 26+; HTTPS ist nötig. Ein Browser ohne WebGPU sagt das in der Zeile, statt sie leer zu lassen."],
        ["Warum nennt WebGPU eine andere Karte als WebGL?", "Laptops haben oft zwei: Seiten zeichnen standardmäßig auf der integrierten, und WebGPU bekommt mit der Anfrage nach einem Hochleistungs-Adapter womöglich die dedizierte. Die Seite liest beide Adapter, hohe Leistung und geringen Verbrauch, und zeigt, was jeder meldet; gibt es nur einen, ist es dieselbe Karte."],
      ],
    },
    pt: {
      seo_title: "Teste de impressão WebGPU: o que a tua GPU diz a um site · Quem é você?",
      seo_desc: "Verificação WebGPU gratuita: o fabricante, a arquitetura e os limites do teu adaptador, como se comparam com o WebGL, e se o WebGPU torna a tua impressão mais única ou o navegador a esconde. O IP não é guardado, só contagens anónimas.",
      seo_kw: "teste webgpu, impressão webgpu, impressão gpu, informação do adaptador, suporte webgpu, testar placa gráfica",
      h1: "Verificação WebGPU",
      og_sub: "O adaptador, os seus limites e o que acrescentam à tua impressão",
      intro: "O WebGPU dá aos sites uma vista nova e detalhada da placa gráfica: fabricante e arquitetura, limites e funcionalidades. O Chrome e o Edge expõem-no por predefinição, e o Safari e o Firefox já o suportam com diferenças. Eis o que este navegador entrega e se concorda com o WebGL.",
      focus_h: "O teu WebGPU",
      docs: [
        ["O que é o WebGPU?", "Uma API gráfica mais recente para a web, mais próxima das placas modernas do que o WebGL: shaders de computação e controlo fino da memória e das filas. Um site pede um adaptador a navigator.gpu e recebe fabricante, arquitetura, descrição, limites e lista de funcionalidades."],
        ["O que acrescenta o WebGPU a uma impressão?", "O nome e a arquitetura do adaptador apontam para o modelo ou a família da placa, e as listas de limites e funcionalidades seguem o driver e a versão do navegador. Ficam estáveis numa máquina e, com o canvas, o WebGL e as fontes, tornam a impressão mais concreta."],
        ["O meu navegador suporta?", "Chrome e Edge 113+, Firefox 141+ no Windows, Safari 26+; precisa de HTTPS. Um navegador sem ele di-lo na linha em vez de a deixar vazia."],
        ["Porque é que o WebGPU nomeia outra placa que o WebGL?", "Os portáteis costumam ter duas: as páginas desenham na integrada por predefinição, e o WebGPU, ao pedir um adaptador de alto desempenho, pode receber a dedicada. A página lê os adaptadores de alto desempenho e de baixo consumo e mostra o que cada um relata; se só houver um, é a mesma placa."],
      ],
    },
    ru: {
      seo_title: "Тест отпечатка WebGPU: что ваша видеокарта рассказывает сайту · Кто вы?",
      seo_desc: "Бесплатная проверка WebGPU: производитель, архитектура и ограничения адаптера, сравнение с WebGL и то, делает ли WebGPU ваш отпечаток уникальнее или браузер его скрывает. IP не сохраняется, только анонимные счётчики.",
      seo_kw: "тест webgpu, отпечаток webgpu, отпечаток gpu, информация об адаптере, поддержка webgpu, проверить видеокарту",
      h1: "Проверка WebGPU",
      og_sub: "Адаптер, его ограничения и что они добавляют к отпечатку",
      intro: "WebGPU даёт сайтам новый подробный взгляд на видеокарту: производителя и архитектуру, ограничения и функции. Chrome и Edge открывают его по умолчанию, Safari и Firefox теперь тоже поддерживают, но с различиями. Вот что отдаёт этот браузер и совпадает ли это с WebGL.",
      focus_h: "Ваш WebGPU",
      docs: [
        ["Что такое WebGPU?", "Более новый графический API для веба, ближе к современным картам, чем WebGL: вычислительные шейдеры, тонкое управление памятью и очередями. Сайт запрашивает адаптер у navigator.gpu и получает производителя, архитектуру, описание, ограничения и список функций."],
        ["Что WebGPU добавляет к отпечатку?", "Имя и архитектура адаптера указывают на модель или семейство карты, а списки ограничений и функций следуют за драйвером и версией браузера. На одной машине они стабильны и вместе с canvas, WebGL и шрифтами делают отпечаток конкретнее."],
        ["Мой браузер это поддерживает?", "Chrome и Edge 113+, Firefox 141+ в Windows, Safari 26+; нужен HTTPS. Браузер без поддержки так и пишет в строке, а не оставляет её пустой."],
        ["Почему WebGPU называет другую карту, чем WebGL?", "В ноутбуках часто две карты: страницы по умолчанию рисуют на встроенной, а WebGPU с запросом высокопроизводительного адаптера может получить дискретную. Страница читает оба адаптера, высокопроизводительный и энергосберегающий, и показывает, что сообщает каждый; если карта одна, это одна и та же."],
      ],
    },
  },
};

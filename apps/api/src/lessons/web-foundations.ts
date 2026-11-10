import type { TopicLesson } from "../topicLessons.js";

/**
 * Web Foundations — 11 authored topic lessons.
 *
 * Standalone chapters per topic. Subject-first prose, foundations, core
 * concepts, worked examples, exam practice, cheat sheet, recap. No shared
 * templates, no runtime composition.
 */
export const webFoundations: Record<string, TopicLesson> = {
  "web-dev-web-foundations-how-the-web-works": {
    intro: `The web works because a client and a server agree to speak HTTP: the client sends a request, the server sends a response, and browsers and servers are just programs implementing that contract over the lower layers of the network stack. The subject is the complete journey of "the page loaded": from an address pressed into the bar, through DNS (finding the server), TCP (connecting), TLS (securing), HTTP (exchanging), and finally rendering into pixels. Understand that path and every optimization, debugging session, and architecture conversation you will ever have about the web suddenly has a map to hang on the wall.`,
    foundations: `The layer model everything else rests on: L7 application (HTTP, DNS, TLS presentation), L4 transport (TCP, UDP), L3 network (IP), L2 link (Ethernet, Wi-Fi), L1 physical. Key vocabulary: URL (scheme, host, port, path, query, fragment), DNS (A/AAAA records map names to addresses), TCP (three-way handshake SYN → SYN-ACK → ACK; sequence numbers give reliable ordered byte streams), TLS (handshake negotiates keys before HTTP flows), HTTP (stateless request-response: method, path, version, headers, status, body), keep-alive (multiple requests on one connection), rendering (HTML → DOM, CSS → CSSOM, merge → render tree → layout → paint → composite). Ports: 80 HTTP, 443 HTTPS, 53 DNS.`,
    concepts: [
      {
        title: "URLs and DNS: finding the server at all.",
        body: `A URL is a precise addressing scheme: scheme (https), authority (host + optional port), path (/docs/guide), query (?q=x&lang=en), fragment (#section — read only by the browser, never sent to the server). Typing it triggers a DNS lookup: browser cache → OS cache → configured resolver (usually your ISP or 1.1.1.1) → root nameserver → TLD (e.g. .com) → authoritative server for the domain; the answer comes back with a TTL and is cached at every level. If DNS fails, the page never existed as far as your browser is concerned — "site can't be reached" almost always starts here. DNS over HTTPS (DoH) encrypts the query; DNS round robins route across IPs.`,
      },
      {
        title: "TCP and TLS: the connection beneath the conversation.",
        body: `TCP opens with a three-way handshake: client SYN, server SYN-ACK, client ACK — two round trips gone before one byte of HTTP moves. TCP then guarantees in-order, uncorrupted delivery via sequence numbers and retransmission. HTTPS adds TLS on top: client offers cipher suites, server picks and proves identity via certificate (verified against trusted CAs), both derive session keys, and everything after flows encrypted (with HSTS, users cannot be silently downgraded to HTTP). Latency cost of a cold HTTPS connection is roughly one DNS round trip, one TCP round trip, one TLS round trip, then the HTTP request itself — the reason connection reuse (keep-alive, HTTP/2 multiplexing, HTTP/3 QUIC combining handshakes) is so aggressively optimized.`,
      },
      {
        title: "HTTP: the request-response contract.",
        body: `HTTP is stateless: each request is independent (state lives in cookies, tokens, sessions — see the backend modules). A request line (GET /path HTTP/1.1) is followed by headers (Host — mandatory in HTTP/1.1 — plus Accept, Authorization, Cookie, Content-Type), a blank line, and an optional body. The response: status line (HTTP/1.1 200 OK), headers (Content-Type, Cache-Control, ETag, Set-Cookie), blank line, body. Status families: 1xx informational, 2xx success (200, 201, 204), 3xx redirection (301, 302, 304), 4xx client error (400, 401, 403, 404, 429), 5xx server error (500, 502, 503). HTTP/2 multiplexes streams on one connection, compresses headers, and prioritizes; HTTP/3 runs on QUIC over UDP, killing head-of-line blocking from lost packets.`,
      },
      {
        title: "From bytes to pixels: the rendering pipeline.",
        body: `The browser receives bytes → decodes (charset from header/meta) → parses HTML into the DOM (script tags can pause the parse, style tags block rendering) → parses CSS into the CSSOM → combines into the render tree (only visible nodes) → layout (computes exact positions and sizes) → paint (fills pixels) → composite (layers merged, GPU-accelerated for transforms and opacity). JavaScript blocks the parser and the paint; heavy synchronous scripts in <head> freeze everything. Understanding this pipeline is the whole basis of Core Web Vitals: LCP (largest contentful paint), INP (interaction to next paint), CLS (cumulative layout shift). Everything in web performance is a negotiation with this pipeline.`,
      },
    ],
    worked: [
      {
        title: "Trace a cold page load for www.example.com.",
        body: `Step through what actually happens: (1) Browser parses the URL; finds no IP in cache. (2) DNS query: resolver walks root → .com → example.com authoritative, receives e.g. 93.184.216.34, caches at every hop. (3) Browser opens TCP to 93.184.216.34:443 — SYN, SYN-ACK, ACK (one round trip). (4) TLS handshake — hello exchange, certificate validation against the system CA store, session keys derived (another ~1-2 RTTs; resumption shortcuts this on repeat visits). (5) Browser sends: GET / HTTP/1.1, Host: www.example.com. (6) Server responds 200 OK with HTML and headers (Cache-Control, ETag). (7) Browser parses HTML → DOM; hits a CSS link → fetches and parses it (render-blocking); hits a script defer or async → fetches and executes. (8) DOM + CSSOM → render tree → layout → paint → composite: pixels on screen. Total: typically 3-6 round trips before first paint — every one of which can be hunted in DevTools Network panel.`,
      },
      {
        title: 'Diagnose "the site won\'t load".',
        body: `Work the layers: (1) ping/dig www.example.com — does DNS resolve? If not, it is resolver config, ISP outage, or a typo. (2) traceroute — do packets reach a sane host? (3) If DNS works but nothing loads, is it TCP (connection refused/timeout — firewall, wrong port, down server) or TLS (certificate expired/mismatched — every modern browser hard-blocks with a scary error)? (4) If TCP+TLS succeed but content is wrong, it is HTTP — read the status code (404? redirect loop 301↔301? 502 from a dead upstream?). (5) If content loads but renders blank or slow, it is the rendering pipeline — check console errors, blocking scripts, failed asset requests. The habit of naming the layer before touching DevTools saves you from random button-pressing.`,
      },
      {
        title: "Explain why repeat visits are faster.",
        body: `Walk the cache chain: browser DNS cache holds the IP (TTL-bound); the TCP/TLS handshakes re-use session via TLS session tickets (0-RTT or 1-RTT resumption); HTTP caching layer serves CSS/JS/images from browser cache when fresh (Cache-Control: max-age honored, ETag revalidation asking the server "changed since my ETag?" and getting a cheap 304); service workers can serve everything offline. Net effect: repeat visits skip DNS, handshake, and payload transfer entirely for unchanged assets — the gap users feel between "first load" and "second load" is this stack of caches, visible in DevTools as "(memory cache)" or "304" in the transfer column.`,
      },
    ],
    exam: [
      {
        question: "What does the fragment (#section) in a URL participate in?",
        answer:
          "Only the client-side rendering — the browser scrolls to the element with that id or name; the fragment is never transmitted to the server (it is not in the HTTP request line or Host). Anything your backend needs belongs in the path or query, never the fragment.",
      },
      {
        question:
          "Why does HTTP/1.1 require the Host header while HTTP/2 does not feel the need to?",
        answer:
          "Because one IP address can host thousands of HTTPS websites (SNI-based TLS sharing and name-based virtual hosting); the server must know which site was requested. HTTP/2 keeps Host semantics because it is still the same URL namespace — the virtual hosting problem did not go away, the wire format just got more efficient (and HTTP/3 kept it too).",
      },
      {
        question:
          'A page is "blank" but the network tab shows a 200 for the HTML. Where do you look next?',
        answer:
          "The rendering pipeline and the console: parse errors (unclosed tags usually do not block; uncaught JavaScript exceptions during DOM construction usually do), render-blocking CSS that failed, or a root element that never renders because the JS that fills it crashed before mounting. In React apps, this is almost always a client-side exception — check console before anything else.",
      },
      {
        question: "Why do stylesheets block rendering while images do not?",
        answer:
          "CSS must be complete before first paint or you paint unstyled content and repaint (flash of unstyled content); the browser conservatively blocks paint until CSSOM is ready. Images are painted when they arrive and can appear incrementally — they delay LCP if slow, not the first paint itself. Hence: inline critical CSS, load the rest asynchronously.",
      },
    ],
    cheat: [
      "URL = scheme://authority/path?query#fragment; fragment never reaches the server.",
      "DNS: cache chain browser → OS → resolver → root → TLD → authoritative; TTL governs freshness.",
      "TCP handshake = SYN, SYN-ACK, ACK; TLS adds ~1-2 RTT for encryption setup.",
      "HTTP status families: 2xx ok, 3xx redirect/304, 4xx your fault, 5xx their fault.",
      "Rendering: HTML→DOM, CSS→CSSOM, merge→render tree→layout→paint→composite.",
      "Keep-alive reuses connections; HTTP/2 multiplexes; HTTP/3 uses QUIC over UDP.",
      "Repeat visits are fast because of DNS cache + TLS resumption + HTTP caching + service workers.",
    ],
    recap: `The web is layered: DNS finds the server, TCP/TLS connect and secure, HTTP carries request and response, and the browser parses/paints into pixels. Every failure mode and every performance trick in web development maps onto one of those layers; naming the layer is the first move of every competent debugging session.`,
    code: {
      title: "Minimal raw HTTP/1.1 request over TCP",
      language: "text",
      code: `GET /guide HTTP/1.1\nHost: www.example.com\nUser-Agent: curl/8.0\nAccept: text/html\n\n`,
      explanation:
        "Two round trips of ceremony (TCP then TLS if HTTPS), then this plain-text request; the server answers with a status line, headers and a body — everything you see in the Network panel is exactly this, decorated with timing and sizes.",
    },
    diagram: {
      title: "Lifecycle of a web request",
      caption:
        "From a keystroke to pixels: six layers, each separately debuggable.",
      mermaid: `flowchart TD\n  U[URL in address bar] --> D[DNS lookup]\n  D --> T[TCP handshake]\n  T --> S[TLS handshake]\n  S --> H[HTTP request and response]\n  H --> P[Parse HTML and CSS]\n  P --> R[Render pipeline and paint]`,
    },
  },
  "web-dev-web-foundations-html-semantics-and-accessibility": {
    intro: `HTML is the language for naming what things are; semantics is the discipline of choosing the element that means the thing; accessibility is the promise that the page works for everyone, including the millions of people who use screen readers, keyboards, switches, voice control, magnification, or simply tired eyes and a phone in sunlight. The subject is the working set: semantic elements, landmarks, headings, forms and labels, ARIA as a precision instrument rather than a bandage, and keyboard navigation done honestly. Get this layer right and CSS and JavaScript inherit a solid foundation instead of compensating for mush.`,
    foundations: `The document model: elements nest into a tree; every element carries implicit semantics (a <button> is a button to every browser and assistive technology; a <div> is nothing). Landmark structure: <header>, <nav>, <main>, <section> with accessible names where multiple exist, <article>, <aside>, <footer>. Headings: one <h1> per page topic, <h2>..<h6> without skipping levels; assistive tech users navigate a page by heading list. Forms: every input needs a programmatic <label for> (or aria-label), grouping via <fieldset>/<legend>, error text associated via aria-describedby; native HTML validation attributes beat hand-rolled JS when feasible. ARIA rule zero: prefer native elements; ARIA only bridges what HTML cannot express — and bad ARIA is worse than none.`,
    concepts: [
      {
        title: "Semantic elements and document landmarks.",
        body: `Use <main> exactly once per page for the primary content; <header> and <footer> wrap intro and outro of a page or section; <nav> for navigation blocks; <article> for self-contained content that could be syndicated (post, comment, product card); <section> groups related content and takes an accessible name (via heading or aria-labelledby); <aside> for tangential content; <figure>/<figcaption> for media with captions; <time dateTime="2026-11-10"> for machine-readable dates; <address> for contact info. Div and span remain the neutral containers when nothing else fits — but if you reach for <div class="button">, you owe the user role="button" tabindex="0" and keyboard handlers, forever, and you will forget one.`,
      },
      {
        title: "Headings and the outline.",
        body: `Screen-reader users press H to jump between headings — the heading list is the table of contents. One <h1> states the page's purpose; subsequent sections get <h2> in order of appearance; subsections <h3>; never skip levels for visual sizing (style with CSS). Headings are cheap, powerful SEO too — both humans and crawlers use them to skim. A page with no headings, or headings chosen by font size rather than meaning, is a wall of text for the people who navigate structurally. Number your outline mentally before writing markup; the visual design should express the same structure.`,
      },
      {
        title: "Forms done properly.",
        body: `Every control gets a visible <label for="id">; placeholder text is never a label (it vanishes on input). Required fields: required attribute + visible indicator, not color alone. Errors: associated via aria-describedby="field-error", announced via role="alert" or aria-live="assertive", and focus moved to the first invalid field on failed submit; never clear what the user typed. Group related controls with <fieldset>/<legend> (radio groups especially). autocomplete attributes (email, current-password, postal-code) feed password managers and save users real time. Validation should be specific and kind: "Enter the email as name@company.com" beats "Invalid input".`,
      },
      {
        title: "ARIA as the exception, not the rule.",
        body: `If a native element exists, use it — <button> gets focus, Enter/Space activation, and correct name/role/value for free; role="button" on a <div> requires you to re-implement all three, and most people forget. Where HTML falls short (custom tabs, tree grids, live regions), use ARIA deliberately: role names the widget, aria-expanded/selected states, aria-describedby/labelledby wiring, aria-live for dynamic announcements. The five rules of ARIA: do not change native semantics unnecessarily; all interactive ARIA controls must be keyboard accessible; do not add role="presentation" to focusable elements; every interactive element must have an accessible name; do not hide focusable content with aria-hidden. Test with a screen reader (VoiceOver/NVDA/TalkBack) — ARIA that sounds wrong is wrong.`,
      },
      {
        title: "Keyboard navigation and focus management.",
        body: `Every interactive element must be reachable and operable by keyboard alone — buttons, links, form controls, disclosures, menus, dialogs. Focus order follows DOM order; make tabindex avoid jumping around (tabindex="0" includes, positive reorders — avoid). Visible focus indicator is mandatory: never remove outline:none without a strong custom replacement. Dialogs trap focus inside until closed and restore it to the trigger afterward; SPAs must manage focus on route change (announce new page title, move focus to <main> or h1). Keyboard-only users include power users (not just people with disabilities) — a product that fails keyboard is not power-user-friendly, it is hostile.`,
      },
    ],
    worked: [
      {
        title: 'Rebuild a "button" that is actually a button.',
        body: `A marketing site had <div class="cta" onclick="learn()">. Audit: not focusable (Tab skips it), no Enter/Space activation, no name announced, invisible to screen readers. Fix: <button class="cta" type="button" onclick="learn()">Learn more</button> — one element change, and keyboard, screen reader, form behavior, and focus visibility all arrive for free. Result: the accessibility bugs from that component evaporated from the audit report; the fix cost less time than the ticket explaining what was wrong.`,
      },
      {
        title: "Accessible error summary on a signup form.",
        body: `Forms timing out for blind users who could not find which field failed. Fix: on submit with errors, render a summary at the top — "3 errors in this form, first: email is invalid" with links jumping to each field — container role="alert"; each invalid input sets aria-invalid="true" and aria-describedby="email-error"; focus moves to the first invalid field. Screen reader user flow: submit → hears summary → jumps straight to problem fields via links. Completion rates for assistive-tech users rose; just as important, honest sighted users who skim get the same summary.`,
      },
      {
        title: "Dialog that does not trap users.",
        body: `A modal opened but focus stayed on the trigger behind the overlay; screen reader continued reading the background page. Fix: on open, save document.activeElement; move focus to the dialog's first focusable element; constrain Tab/Shift-Tab cycling within the dialog (keydown handler checking element boundaries); on close, restore focus to the saved trigger; aria-modal="true" role="dialog" aria-labelledby pointing at the modal title; background inert (aria-hidden on siblings or inert attribute). Users navigate modals calmly now; nobody gets stranded behind an invisible curtain.`,
      },
    ],
    exam: [
      {
        question:
          "Why is <label> + <input id> pairing superior to relying on placeholder text?",
        answer:
          "Placeholders disappear once the user types, removing the field's purpose and failing contrast requirements in most browsers; labels are programmatically associated (clicking the label focuses the input, screen readers announce it), persistent, and required for any form control to have an accessible name at all.",
      },
      {
        question: "When is ARIA the right tool, and when is it harmful?",
        answer:
          'Right: when HTML has no native equivalent (tree widgets, combobox behavior, live regions). Harmful: when applied to elements that already have correct native semantics — it overrides mappings, confuses state announcements, and lets developers claim "we did a11y" while breaking it. Native first, ARIA second, void elements never ARIA calls on their name.',
      },
      {
        question: "What must happen to focus when a modal dialog closes?",
        answer:
          "Restore it to the element that opened the dialog. If you do not, keyboard users land in the void at document.body with no visible focus — they cannot find their place, and screen-reader users hear nothing identifying where they are. Focus restoration is part of the dialog contract, not a nicety.",
      },
      {
        question:
          "Why do headings need to be used in document outline order, not visual order?",
        answer:
          "The heading list is the document's navigation for assistive tech; skipping levels implies false hierarchy and breaks outline navigation tools (and confuses everyone skimming). Visual styling is CSS's job — semantics is independent of how big the type is.",
      },
    ],
    cheat: [
      "Native elements first: button, a, label, main, nav; <div> is nothing.",
      "One <h1> per page; ordered outline; never skip levels for size reasons.",
      "Landmarks: header, nav, main, section w/ accessible name, article, aside, footer.",
      "Every input: <label for>; errors via aria-describedby + role=alert; focus first error.",
      "ARIA: five rules — native first, accessible names everywhere, nothing focusable hidden.",
      "Dialogs: save/restore focus, trap inside, role=dialog, aria-modal=true.",
      "Keyboard: everything reachable + operable + visible focus; skip-link first in DOM.",
    ],
    recap: `HTML names meaning; CSS styles it; accessibility verifies everyone can use it. Semantic landmarks and headings give structure, labels and errors give forms to everyone, focus management and keyboard operability give control to all users — ARIA only for what HTML cannot say.`,
    code: {
      title: "Accessible settings form skeleton",
      language: "html",
      code: `<form novalidate>\n  <fieldset>\n    <legend>Notifications</legend>\n    <input id="email-alerts" type="checkbox" name="alerts" checked>\n    <label for="email-alerts">Email me weekly</label>\n  </fieldset>\n  <div id="form-errors" role="alert"></div>\n  <button type="submit">Save preferences</button>\n</form>`,
      explanation:
        "Fieldset+legend groups the control and names the group; label association and role=alert cover keyboard and screen-reader flows; novalidate because error UX is custom — but only if your JS actually handles it.",
    },
    diagram: {
      title: "Document outline as a navigation map",
      caption: "Landmarks and headings: the structure screen readers traverse.",
      mermaid: `flowchart TD\n  H1[H1 page topic] --> N1[Nav]\n  H1 --> M[Main]\n  M --> S1[H2 section]\n  S1 --> A1[H3 subsection]\n  M --> AS[Aside]`,
    },
  },
  "web-dev-web-foundations-css-layout-and-responsive-design": {
    intro: `CSS layout is the engineering of how boxes are positioned, sized, aligned and wrapped; responsive design is the practice of making that layout survive every screen, orientation, zoom level and input method the world throws at it. The subject is the working toolkit: the box model, normal flow, display types, positioning, Flexbox for one-dimensional distribution, Grid for two-dimensional structure, breakpoints and container queries, and the modern units that make fluid layouts possible. Master these and you stop fighting the cascade — you start designing systems.`,
    foundations: `Every element is a rectangle built from content, padding, border, margin (box-sizing: border-box is mandatory — width includes padding and border, ending box-model arithmetic forever). Display types: block (full width, vertical stacking), inline (text flow, ignores width/height), inline-block, flex, grid, none. Positioning: static (normal flow), relative (offset from flow position), absolute (removed from flow, positioned against nearest positioned ancestor), fixed (viewport), sticky (sticks at threshold). The cascade resolves conflicts: origin (browser < user < author < author !important — avoid!), specificity (inline > id > class/attribute/pseudo-class > type), order. Inheritance: color/font inherit, layout properties do not (except through flex/grid items subtly). Viewport meta: <meta name="viewport" content="width=device-width, initial-scale=1"> — without it, phones shrink-to-fit desktop pages.`,
    concepts: [
      {
        title: "The box model and box-sizing.",
        body: `Content box: width/height apply to content only. Padding, border, margin add around it outward — classic source of overflow ("why is my 100% wide card clipping?"). Fix once: * { box-sizing: border-box; }. Margin collapsing: adjacent vertical margins merge to the larger single value (not additive) — except inside flex/grid containers, where margins never collapse — a trap that makes beginners distrust CSS entirely. Width behavior differs by display: block stretches to fill, inline-block shrink-wraps, flex items flex per properties. Margin 0 auto centers horizontally (width constrained); vertical centering: flex or grid align-items/justify-content — the two-property answer, no negative-margin hacks.`,
      },
      {
        title: "Flexbox: one-dimensional distribution.",
        body: `display: flex on the parent; children become flex items arranged along a main axis (flex-direction: row|column) with cross axis perpendicular. Key knobs: justify-content (distribution along main axis: flex-start, center, space-between, space-around, space-evenly), align-items (cross-axis alignment), align-content (multi-line distribution), gap (spacing without margin hacks), flex-grow/shrink/basis (how items absorb free space: flex: 1 1 0% is the common equal-grow recipe; shorthand flex: 1 works), align-self (per-item override), order (visual reordering without DOM changes — careful, focus order follows DOM!). Flexbox is for content-driven layout: navbars, button rows, card footers, centering.`,
      },
      {
        title: "Grid: two-dimensional structure.",
        body: `display: grid; grid-template-columns / grid-template-rows define the track system; fr unit divides free space (1fr 2fr = 1:2 split); repeat() and minmax() combine: grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)) — the canonical responsive card grid without media queries. Named areas: grid-template-areas: "header header" "sidebar content" — ASCII-art layout, readable forever. gap for gutters; justify-items/align-items for cell content; justify-content/align-content for the whole grid in its container; grid-column: span 2 for spanning; subgrid where supported. Grid is for page-level and two-dimensional structure; Flexbox distributes items; they compose endlessly — Grid shells, Flex inside.`,
      },
      {
        title:
          "Responsive strategies: breakpoints, container queries, fluid units.",
        body: `Mobile-first: base styles for small screens, min-width media queries layer on complexity for larger. Breakpoints by content, not devices: when your design breaks, that is the breakpoint — typical ranges 30-40em, 48em, 64-80em. Container queries (@container) size components relative to their container rather than the viewport — the end of "this card is responsive in the hero but not the sidebar". Fluid type and spacing with clamp(): font-size: clamp(1rem, 0.5rem + 2vw, 1.5rem) — smooth scaling without breakpoints. Modern units: rem (root-scaled, respects user font-size settings — accessibility!), em (parent-scaled), ch (character width), vw/vh, svh/lvh (small/large viewport height — fixes mobile URL-bar resize jank), dvh.`,
      },
      {
        title: "Images, media and aspect handling.",
        body: `img { max-width: 100%; height: auto; } is the baseline for responsiveness. Prevent CLS: always declare width and height attributes (or CSS aspect-ratio) matching the intrinsic image dimensions — the browser reserves the box before bytes arrive. object-fit: cover|contain for background-like behavior; background-size: cover for decorative backgrounds (never for meaningful images — alt text requires <img>). Next-gen media: <picture> with AVIF/WebP sources + fallback <img>. Aspect-ratio boxes for embedded videos: .video { aspect-ratio: 16 / 9; }. The four moves that fix most responsive bugs: box-sizing, mobile-first, fluid units, aspect-ratio.`,
      },
    ],
    worked: [
      {
        title: "Build the canonical responsive card grid.",
        body: `.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: 1.5rem; } — each column at least 260px, as many as fit, stretching to fill, never overflowing the container, collapsing to a single column on phones with zero media queries. Items: .card { display: flex; flex-direction: column; } .card-body { flex: 1; } — equal height cards with pinned footer buttons. This is the most-copyable layout recipe in CSS; it works because fr + minmax + auto-fit negotiate space instead of dictating it.`,
      },
      {
        title: "Center an unknown-size modal three ways.",
        body: `Way 1 (flex): container { display: flex; align-items: center; justify-content: center; min-height: 100vh; } child just works. Way 2 (grid): same with display: grid; place-items: center; — one line shorter. Way 3 (absolute + transform): top: 50%; left: 50%; transform: translate(-50%, -50%); — works without a flex/grid parent but fights stacking contexts. Prefer the grid one-liner; it also handles multi-line children and is immune to font-metric surprises. Know the transform trick because the world is full of legacy codebases where the modal is absolutely positioned by archaeology.`,
      },
      {
        title: 'Debug "my page scrolls horizontally on mobile".',
        body: `Systematic sweep: (1) Search for elements with fixed widths in px wider than ~320px — replace with max-width or fr. (2) Long unbreakable strings (URLs, code) — overflow-wrap: anywhere. (3) 100vw usage — it includes the scrollbar width, use 100% instead. (4) Negative margins escaping the container. (5) Images without max-width. DevTools: toggle device toolbar, then in Console run document.documentElement.scrollWidth and find the widest children by walking descendants. The methodical hunt beats randomly slapping overflow-x: hidden on body — that hides the disease, not the cause, and breaks sticky positioning later.`,
      },
    ],
    exam: [
      {
        question:
          "Why is box-sizing: border-box the correct default for layout work?",
        answer:
          "It makes declared width/height the total footprint including padding and border — the number you wrote is the size you get, regardless of inner padding. The alternative (content-box) forces you to subtract padding and border from every measurement by hand, which is error-prone across nested components; the industry standardized on border-box for a reason.",
      },
      {
        question: "When do you choose Grid over Flexbox and vice versa?",
        answer:
          "Grid when you are defining a two-dimensional layout system (page shell, card grids, dashboards) and want tracks to align to a shared system; Flexbox when you are distributing items along one axis inside a component and want content-driven flexibility (rows of buttons, navbars, card internals). Nest them; do not treat them as rivals.",
      },
      {
        question:
          "What does grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)) accomplish?",
        answer:
          'It creates as many 250px-minimum columns as fit, stretching each to fill available space (1fr), with empty columns collapsing away when the container is too narrow; the result is a fully responsive grid with zero media queries — the canonical modern answer to "cards on all screens".',
      },
      {
        question: "Why prefer rem over px for font sizes?",
        answer:
          "rem scales with the user's root font-size setting, which is how users with low vision actually control readability; px overrides their setting and breaks their accessibility. Always size type (and spacing) in rem or relative units; reserve px for borders and truly fixed details like shadows.",
      },
    ],
    cheat: [
      "* { box-sizing: border-box; } — then stop doing box-model arithmetic.",
      "Flexbox = 1D distribution (justify main, align cross); Grid = 2D tracks.",
      "repeat(auto-fit, minmax(250px, 1fr)) = responsive grid, no media queries.",
      "Mobile-first: base styles small, min-width queries layer on.",
      "clamp(min, preferred, max) for fluid type/spacing without breakpoints.",
      "rem for type (respects user settings), px for hairlines.",
      "img { max-width: 100%; height: auto; } + width/height attrs to stop CLS.",
    ],
    recap: `CSS layout is space negotiation: the box model with border-box everywhere, Flexbox along one axis, Grid across two, mobile-first breakpoints, clamp() for fluidity, rem for accessible type — and images that declare their dimensions so the browser can reserve space before bytes arrive.`,
    code: {
      title: "Modern responsive card grid",
      language: "css",
      code: `.cards {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));\n  gap: 1.5rem;\n}\n.card { display: flex; flex-direction: column; }\n.card-body { flex: 1; }`,
      explanation:
        "auto-fit + minmax + 1fr: columns at least 260px, as many as fit, stretching to fill; Flex column inside pins the footer button regardless of text length — the entire responsive-cards pattern in five lines.",
    },
    diagram: {
      title: "Space distribution decision tree",
      caption: "One axis or two? Content-driven or track-driven?",
      mermaid: `flowchart TD\n  Q[How many axes?] -->|One| F[Flexbox]\n  Q -->|Two| G[Grid]\n  F --> C[Across main axis: justify-content]\n  G --> R[Define tracks: columns and rows]`,
    },
  },
  "web-dev-web-foundations-css-architecture-and-motion": {
    intro: `CSS architecture is the difference between a stylesheet that scales and one that becomes folklore nobody dares touch; motion is what makes interfaces feel alive and, misused, what makes them nauseating. The subject is the systems side of CSS: design tokens, cascade layers and scoping, utility-first versus semantic naming, custom properties, and the craft of animation — transform/opacity only, reduced-motion respect, purposeful easing, and performance realities. Do this well and your team ships faster with fewer side effects; do it badly and every release is Russian roulette with regressions.`,
    foundations: `Architecture patterns: BEM (.block__element--modifier — explicit, flat, self-documenting), utility-first (Tailwind — composition over naming), CSS Modules / scoped styles (frameworks), ITCSS (layer order: settings, generic, base, objects, components, utilities). Cascade layers (@layer) control specificity battles cleanly; plain specificity wars are technical debt. Design tokens: primitive values (colors, spacing scale) as CSS custom properties; semantic aliases (--surface, --text-muted) map intent to value; themes swap alias values (light/dark) without touching components. Custom properties (--x) inherit and are runtime-dynamic (unlike preprocessor variables). Motion: transitions and animations on compositor properties only.`,
    concepts: [
      {
        title: "Design tokens and custom properties.",
        body: `A token system separates decisions ("brand blue #2563eb", "spacing-4 = 1rem") from application. Primitive layer: --blue-600, --red-400, --space-2, --font-body — few, complete, from a design tool. Semantic layer: --color-surface, --color-border, --color-accent, --text-muted — components reference these, never primitives, so re-theming is swapping ~30 lines, not editing ~800 declarations. CSS custom properties are live: inherited, redefined per context (button inside banner can override accent locally), inspectable, runtime-switchable for dark mode via data-theme attribute or prefers-color-scheme media query. Style Dictionary can generate the same tokens for Swift/Kotlin if you ship apps too.`,
      },
      {
        title: "Cascade discipline: layers and scoping.",
        body: `@layer reset, base, components, utilities; — later layers win over earlier ones regardless of specificity; specificity wars inside utilities end because utilities always trump components. Example order: normalize/reset → element base styles → object layout helpers → components → utilities (your escape hatch) → print. In component-heavy projects prefer scoped CSS (CSS Modules, Vue scoped, CSS-in-JS) — compiler-enforced isolation kills the "why is this button green?" mystery. The worst architecture is one where nobody knows where a rule wins; any pattern that answers that question for a new hire wins.`,
      },
      {
        title: "Naming and scalability frameworks.",
        body: `BEM cost-benefit: owning a name forever (.card__title--large lives in the repo) vs. zero collisions, grep-ability, no documentation needed for intent — excellent for design systems. Utility-first (Tailwind): constraints encoded in a fixed scale, speed of assembly, no dead CSS, at the cost of long class lists — mitigated by extracting components. Semantic naming shines for product UI that designers own; utility-first for velocity; hybrids common. The architecture that fails everywhere: no convention — three naming systems in one codebase, specificity escalation, !important litter, and renames nobody dares. Pick one, document it in one page, enforce in review.`,
      },
      {
        title: "Motion with purpose and performance.",
        body: `Animate transform (translate/scale/rotate) and opacity exclusively — layout properties (width, height, top, margin) trigger layout+paint, 60fps becomes 15fps on mid-tier phones. Choreography: entering elements fade+rise, exiting fade+fall, 150-300ms with ease-out (entering) / ease-in (exiting) / cubic-bezier springs for playful; stagger 20-60ms between siblings. Respect prefers-reduced-motion: reduce — honor it fully or partially (kill parallax and autoplaying video). Motion should communicate causality: origin of the element, what it does, where it goes — never decorative-only. Measurement: DevTools Performance paint flashing; jank appears as long frames; drop animation if you cannot hold 60fps with headroom.`,
      },
      {
        title: "Maintaining the stylesheet as the product grows.",
        body: `Rules: one ownership per component (co-located file), deleting CSS is a feature (dead code is negative value), coverage tool for unused rules, style review in PR for specificity/duplication, visual regression tests (Chromatic or Playwright screenshots) for theme changes. Document the tokens.json and components in a Storybook — the stylesheet is internal documentation of your UI. Refactors should be mechanical if the architecture was chosen well, painful otherwise — architecture is insurance you pay continuously.`,
      },
    ],
    worked: [
      {
        title: "Extract a button system from chaos.",
        body: `Before: 47 button classes, 6 greens, 12 shadow values, inline styles in JSX. After: tokens (--button-bg → --color-accent, --button-radius, --space-button-x), one .btn--primary/.btn--ghost/.btn--danger set, states (:hover/:focus-visible/:disabled with real visible focus), dark mode via semantic aliases, removed 380 lines of dead CSS flagged by coverage tooling. Before: "make the CTA lime" was a day of archaeology; after: two tokens changed, one rebuilt preview, shipped in 30 minutes. Tokens paid for themselves in the first redesign.`,
      },
      {
        title: "Ship dark mode without touching components.",
        body: `Tokens light theme: --surface: #fff; --surface-sheet: #f7f7f8; --text: #111; --border: #e5e5e6; --accent: #2563eb. Dark: --surface: #141414; --surface-sheet: #1d1d1f; --text: #f2f2f2; --border: #2a2a2c; --accent: #60a5fa. Components reference only semantic names. Switch: document.documentElement.dataset.theme = "dark" | "light" | system default from prefers-color-scheme at boot; store choice in localStorage; one attribute, zero component rewrites. The whole dark-mode project becomes a config-and-QA story, not a rewrite — 400 lines of alias overrides + contrast audit on every state.`,
      },
      {
        title: "Design an accessible animated list.",
        body: `Before: items popped in via display:none→block. After: fade+translateY 12px → 0, 200ms ease-out, 40ms stagger per item, transform/opacity only, paused when prefers-reduced-motion: reduce (opacity only, no movement), aria-live=polite region narrates "3 items added" for screen readers, no delay on keyboard focus. Frame budget: each card GPU-composited, no layout thrash; 60 items at 40ms stagger → done in 1.8s... cap stagger to last 12 items for long lists so stragglers appear instantly.`,
      },
    ],
    exam: [
      {
        question:
          "Why should animations restrict themselves to transform and opacity?",
        answer:
          "These run on the compositor thread without re-running layout or paint, so they are cheap and frame-rate-independent; animating width/top/margin/height triggers reflow and repaint of affected subtrees every frame — jank guaranteed on anything below high-end hardware.",
      },
      {
        question: "What are cascade layers (@layer) solving at team scale?",
        answer:
          'Specificity escalation across independently authored components — layers impose a global precedence order independent of selector specificity, so "utility" always beats "component" and "reset" never fights "components"; the alternative is selector-specificity arms races and !important litter.',
      },
      {
        question:
          "Why are semantic token aliases preferable to raw color names in components?",
        answer:
          "Components describe intent (surface, border, danger) rather than mechanism (red-500), so redesigns and themes swap alias values in one place and every component inherits the change coherently — raw color names scatter intent across the codebase like confetti.",
      },
      {
        question: "How must reduced-motion users be handled, honestly?",
        answer:
          'Honor prefers-reduced-motion: reduce — remove or radically minimize non-essential motion (parallax, autoplay video, big transitions); keep essential feedback (focus changes, opacity crossfade) if it aids comprehension; "it looks cool" is never a defense for vestibular harm.',
      },
    ],
    cheat: [
      "Tokens: primitives → semantic aliases → components reference aliases only.",
      "@layer fixes precedence wars: reset < base < components < utilities.",
      "Pick one naming system; document it; enforce in review.",
      "Custom properties (--x) are runtime; preprocessor variables are compile-time — use both correctly.",
      "Animate transform+opacity only; 150-300ms; ease-out in, ease-in out.",
      "Stagger ≤ 60ms; cap at 12 items; honor prefers-reduced-motion fully.",
      "Deleting dead CSS is a feature; measure with coverage tooling.",
    ],
    recap: `CSS architecture is token-first layering: primitives aliased by intent, cascade layers instead of specificity wars, transform-only motion with reduced-motion respected — maintainable by strangers, redesignable by a single attribute flip, and gentle on the vestibular system and mid-tier phones.`,
    code: {
      title: "Token layer + dark mode in 20 lines",
      language: "css",
      code: `:root { --surface: #fff; --text: #111; --accent: #2563eb; }\n[data-theme="dark"] { --surface: #141414; --text: #f2f2f2; --accent: #60a5fa; }\n.card { background: var(--surface); color: var(--text); }\n.cta { background: var(--accent); }`,
      explanation:
        "Semantic aliases make every component themeable by changing the alias block alone; nothing in components changes between light and dark — the theme is a configuration, not a rewrite.",
    },
    diagram: {
      title: "Token flow",
      caption:
        "Design decisions flow downstream; components never see primitives.",
      mermaid: `flowchart TD\n  P[Primitive values] --> S[Semantic aliases]\n  S --> C[Components]\n  C --> UI[Rendered UI]`,
    },
  },
  "web-dev-web-foundations-forms-validation-and-ux-states": {
    intro: `Forms are where the web collects meaning — passwords, addresses, complaints, purchases — and UX states are how the interface communicates what is happening: idle, typing, validating, saving, failed, empty, or done. The subject is the full craft of form design on the web: native HTML validation as the first line of defense, the Constraint Validation API when you need custom logic, error messaging that is specific and humane, and the state machine of loading/empty/success/error that users actually feel. Get this right and users trust your system even when it fails; get it wrong and they bounce mid-checkout forever.`,
    foundations: `The Constraint Validation API: input.validity (valueMissing, typeMismatch, tooShort, tooLong, patternMismatch, customError), input.validationMessage, input.setCustomValidity(msg) — sets validity and gives browser-native styling hooks; form.noValidate disables native bubbles when you roll your own. ARIA wiring: aria-invalid="true" on failing fields, aria-describedby="field-error" referencing the error text element, role="alert" on the error container for announcement; required indicator visible and associated. States to design: initial, dirty (user touched), validating, invalid, submitting (disabled button + spinner), success, failure (network, 4xx, 5xx), offline. Also loading skeletons (content shaped placeholders) vs spinners, and optimistic UI (update locally, reconcile on server response).`,
    concepts: [
      {
        title: "Native validation first — and when to go custom.",
        body: `Start with attributes: required, type="email"/"url"/"number"/"tel", min/max, minlength/maxlength, pattern (regex — prefer type over pattern when possible), step, multiple. Browsers validate on submit and on blur for dirty fields, display localized messages for free. Go custom when: business rules (username availability, cross-field checks like "end date after start date", password strength meter), non-HTML-typeable semantics (custom pickers), or you want styled error surfaces. In custom land use form.noValidate + the Constraint API + your own summary UI — never hand-tokenize validation with ad-hoc regex soup on top of silent noValidate (the worst of both worlds: no bubbles, no messages). Sanitize server-side always; client validation is a courtesy, not security.`,
      },
      {
        title: "Error messaging that users actually read.",
        body: `Specific beats vague: "Password must be at least 12 characters and include a number" beats "Invalid password". Kind beats harsh: users blame themselves, not the system — apologize and guide ("No account with that email — create one?"). Place the error adjacent to the field; also summarize at the top with jump links for assistive tech and screen readers ("3 errors: email, password, terms"); move focus to the first invalid field; keep the user\'s data intact; mark the field aria-invalid and wire aria-describedby to the error element; announce via role="alert". Test the messages with someone unfamiliar with the form — if they cannot recover, the message is wrong, not them.`,
      },
      {
        title: "The state machine of forms.",
        body: `Model explicitly: IDLE → DIRTY (any input) → VALIDATING (on blur/change) → INVALID (show error) → SUBMITTING (disable submit, spinner, keep data!) → SUCCESS (confirm, clear/reset, or redirect) | FAILURE (message with retry; preserve input) | OFFLINE (queue if safe, or hard error with explanation). Every transition visible to the user: button text changes ("Save → Saving… → Saved ✓"), field-level spinners for async checks (username availability with debounce 300-500ms), skeletons while initial data loads (not a spinner for 2 seconds then a layout shift). Empty states are part of the form too: "No allergies on file — add one" beats a blank required field. Disabled vs read-only: disabled fields do not submit (data lost!), read-only submit.`,
      },
      {
        title: "Async validation and server-authoritative checks.",
        body: `Username/email availability: debounce, race-safe (ignore stale responses — version-counter or AbortController), show spinner → green check → error if taken; on submit, server is final authority (the check is advisory). Password breach checking via k-anonymity API: hash, send prefix, compare locally. Multi-step forms: validate per step, persist progress (localStorage or server draft), never lose 10 minutes of input to a network blip. Design the failure as carefully as the success — a form that punishes failure with data loss will be abandoned at the slightest friction, and you will never know exactly where users stopped because they will not come back to tell you.`,
      },
      {
        title: "Optimistic UI and progress preservation.",
        body: `Optimistic update: mutate UI immediately, fire the request, reconcile on response — like-count increments, checkbox toggles, list reordering. On failure: revert with an explanation and retry option; never silently diverge from server truth. Preserve: form state in memory + sessionStorage for navigation, or server-side draft endpoints for long flows (visa applications, onboarding with 40 fields). Autosave indicator ("Draft saved 12:04") builds trust and reduces anxiety. Perceived performance beats actual latency: skeletons and immediate feedback make 800ms feel like 200ms; spinner-then-blank feels like failure even when it succeeds.`,
      },
    ],
    worked: [
      {
        title: "Signup form with full async availability check.",
        body: `Implementation sketch: input#username; on input debounce 400ms → GET /api/check-username?u=x → response {available: bool}; UI states: typing (nothing), checking (spinner near field), available (green ✓ + "Username available"), taken (red ✗ + "Taken — try ari-work, ari-dev"). On submit: server re-validates (never trust client); race safety via request id — if a stale response arrives after newer one, ignore it. Accessibility: aria-live=polite on the status message so screen readers hear it without focus theft; error summary on submit with links to each invalid field; focus to first invalid; data preserved on failure. Completion lift vs the old vague form: +19%, measured on cohorts.`,
      },
      {
        title: "Checkout address form, resilient to network failure.",
        body: `Submit → SUBMITTING (button disabled, "Placing order…") → network drop: catch AbortError/timeout → FAILURE state: banner at top "Could not reach the server. Your order was not placed. Nothing was charged." with [Retry now] and [Save for later] (localStorage copy) — data intact. On retry success: clear, show confirmation number, aria-live announcement "Order confirmed, number 48213". Never clear the cart until the server confirms. Empty-ish optional sections collapsed by default with "+ Add delivery note" to reduce intimidation — completion rate improved on office deliveries roughly 30%.`,
      },
      {
        title: "Settings page with autosave.",
        body: `Profile fields autosave on blur (debounced 1s): optimistic checkmark "Saved" per field; failure → amber "Not saved — retry" with the field marked; network panel shows one POST per field. Tab switching preserves everything; reload mid-edit shows server truth plus a "3 unsaved changes restored" toast. The user never loses work, never clicks "Save", never panics. The unglamorous feature that made the support inbox dry up — because the most expensive form failure is the one that deletes user data after they trusted you with it.`,
      },
    ],
    exam: [
      {
        question:
          "Why must server-side validation exist even with perfect client-side checks?",
        answer:
          "Client code is theater — it runs on a machine the client controls; anyone can send arbitrary HTTP with curl; business rules, security invariants, and referential integrity live on the server or nowhere. Client validation optimizes UX; server validation enforces truth.",
      },
      {
        question:
          "How should an async availability check handle out-of-order responses?",
        answer:
          "With sequencing: tag each request with a monotonically increasing id or an AbortController per keystroke and ignore responses that do not match the latest — otherwise a slow earlier response overwrites a fast later one and the user sees availability flip backwards; classic race, always present, always your bug.",
      },
      {
        question: "What belongs in an error summary for assistive technology?",
        answer:
          'A count, a plain-language list of what is wrong, and jump links to each failing field — role="alert" so it is announced, focus moved to first error for immediate remediation. Without the summary, screen-reader users tab through the whole form to rediscover errors one at a time.',
      },
      {
        question:
          "Why are disabled submit buttons worse than enabled ones in most forms?",
        answer:
          "Disabled buttons are unfocusable and unannounceable — users cannot learn why they cannot submit; an enabled button that fails on validation with a spoken/visible error message teaches the user exactly what is missing, which is strictly more actionable than a gray dead end.",
      },
    ],
    cheat: [
      "Native attributes first: required, type, min/max, pattern; noValidate only with your own complete UX.",
      "Constraint API + aria-invalid + aria-describedby + role=alert = accessible errors.",
      "Debounce availability checks; seq/AbortController for race safety.",
      "Server is the authority; client is courtesy; never trust either alone.",
      "States: IDLE → DIRTY → VALIDATING → INVALID|SUBMITTING → SUCCESS|FAILURE; data never lost.",
      "Optimistic update + revert on failure; autosave indicator; skeletons over spinners.",
      "Error copy: field-specific, kind, actionable, adjacent; summary with jump links.",
    ],
    recap: `Forms are contracts with users: native validation for the baseline, the Constraint API for the rest, specific humane errors, explicit state machines, resilient progress preservation — and server authority always, because a form that lies to the user eventually refunds their trust along with their purchase.`,
    code: {
      title: "Debounced availability check with race guard",
      language: "javascript",
      code: `let seq = 0;\nusernameInput.addEventListener('input', () => {\n  const my = ++seq;\n  clearTimeout(t);\n  t = setTimeout(async () => {\n    const r = await fetch('/api/check?u=' + encodeURIComponent(usernameInput.value));\n    const { available } = await r.json();\n    if (my === seq) statusEl.textContent = available ? 'Username available' : 'Taken';\n  }, 400);\n});`,
      explanation:
        "seq counter kills out-of-order renders; debounce caps request rate; status text always reflects the latest keystroke — the whole pattern in six lines.",
    },
    diagram: {
      title: "Form lifecycle states",
      caption:
        "Every transition visible to the user; data never silently dropped.",
      mermaid: `flowchart TD\n  I[Idle] --> D[Dirty]\n  D --> V[Validating]\n  V --> OK[Submitting]\n  OK --> S[Success]\n  OK --> F[Failure with retry]`,
    },
  },
  "web-dev-web-foundations-seo-metadata-and-structured-data": {
    intro: `SEO is the discipline of making content findable and understandable by search engines; structured data is how you hand machines the semantics to quote you correctly; metadata is the contract between your page and every context it appears in — search results, social cards, AI Overviews, link previews. The subject is the working SEO stack: crawlability (robots.txt, sitemaps, canonicalization), indexability (title, description, canonical, structured data via JSON-LD), and performance as a ranking input via Core Web Vitals. No sorcery, no keyword-stuffing fossils — just honest engineering for discovery.`,
    foundations: `The funnel: crawl (bots fetch pages — robots.txt disallow, crawl-delay where honored; server resources finite, do not let bots hammer your origin) → index (page understood and stored — quality gates: thin content, duplicates) → rank (query-relevance, authority signals, experience) → render (snippet display). Key mechanisms: sitemaps (XML list of canonical URLs), robots.txt (allow/disallow by path, sitemap pointer), canonical <link rel="canonical"> (deduplication), title (~50-60 chars front-loaded), meta description (~150-160, query-intent-matched), Open Graph (og:title/description/image/type/url) + Twitter Card, JSON-LD (schema.org: Article, Product, FAQPage, BreadcrumbList, Organization — placed in <script type="application/ld+json">), hreflang for i18n.`,
    concepts: [
      {
        title: "Crawlability and canonicalization.",
        body: `robots.txt at domain root: User-agent: *, Disallow: /admin/, Allow: /, Sitemap: https://example.com/sitemap.xml — blocks crawling, not indexing (a linked page can still be indexed without being crawled; use noindex for true removal). XML sitemap: list canonical URLs with lastmod — regenerate on deploy; ping search engines on big changes. Canonical: when multiple URLs serve the same content (www/non-www, http/https, UTM params, trailing slash variants), <link rel="canonical" href="preferred"> consolidates ranking signals; pick ONE, redirect others at the server where possible (301 beats canonical). Internal linking: important pages reachable in ≤ 3 clicks from home; orphaned pages die. Pagination: rel=next/prev deprecated by Google but harmless; self-canonical each page. Indexed pages that 404 waste crawl budget — return proper 404/410.`,
      },
      {
        title: "Titles, descriptions and SERP CTR.",
        body: `<title> is the single highest-impact on-page element: unique per page, front-load the primary topic, keep under ~60 chars to avoid truncation mid-word, include brand at the end ("— Acme"). Meta description is a pitch: 150-160 chars stating exactly what the page delivers and for whom; Google rewrites it often — if yours matches intent, it usually stays. Write for humans clicking, not bots matching: query-intent alignment beats keyword density games. H1 mirrors title intent. Social cards: og:image 1200×630, meaningful alt text; without OG, your shared links look like spam. Snippets with structured data (FAQ, how-to steps) win SERP real estate and measurably lift CTR — legitimately.`,
      },
      {
        title: "JSON-LD structured data in practice.",
        body: `Place schema.org JSON-LD in the head (or body — Google reads both): Article — headline, author, datePublished/dateModified, image; Product — name, image, offers{price,priceCurrency,availability}, aggregateRating; FAQPage — mainEntity array of Question/Answer; BreadcrumbList — itemListElement chain with position/name/item; Organization — logo, sameAs links. Google displays rich results only when markup is valid AND content visibly appears on the page (no hidden FAQ gaming). Validate with the Rich Results Test; zero errors required; warnings optional. JSON-LD is the only format Google fully supports and the one you should write; microdata trails along badly.`,
      },
      {
        title: "Core Web Vitals and experience as ranking input.",
        body: `Since 2021, experience signals factor into ranking (page experience): LCP ≤ 2.5s good, INP ≤ 200ms good, CLS ≤ 0.1 good — measured at the 75th percentile of real users (CrUX data), not your dev machine. CWV will not outrank terrible content, but among equals it breaks ties, and it compounds: faster pages get more crawls per budget, more pages indexed per day. SEO tasks that pay double: image sizing and preload, font-display swap, eliminating render-blocking JS, reserving image dimensions — they fix the metric AND the UX AND the bounce rate. Track CrUX per template in Search Console; lab tools (Lighthouse) catch regressions before users.`,
      },
      {
        title: "i18n, freshness and honesty rules.",
        body: `hreflang: <link rel="alternate" hreflang="fr-CA" href="..."> for every locale variant including x-default — missing tags mis-serve French users English pages and divide rankings; implementation bugs here cost more than any title tweak. lastmod in sitemaps + actual content freshness (remove or update stale pages — accuracy is a quality signal in AI-era search too). The honesty contract: structured data matches visible content, reviews are genuine, prices are real — Google penalizes deception algorithmically and a single manual action can erase years of equity. SEO is demand harvesting, not demand creation — build for the query, deliver what you promise, and the compounding will follow.`,
      },
    ],
    worked: [
      {
        title: "Audit a product page SERP listing.",
        body: `Take the wireframe of /products/acme-blender: current title "ACME Blender | ACME" (brand-first, truncated, wastes 20 chars), description missing (Google auto-pulls random text including nav boilerplate), no OG tags, no Product JSON-LD, LCP 4.1s mobile. Fixes: title → "Acme X900 Blender — 1400W, Stainless, 5-Year Warranty | Acme"; description → "The X900 handles ice, nut butters and hot soups with a 1400W motor and tri-blade canister; free shipping + 30-day trial."; add Article/Product JSON-LD with price, rating, availability; preload hero image (AVIF, 1200px, CDN), inline critical CSS; ship. Measurement after 60 days in Search Console: impressions +22%, CTR 1.8%→2.9%, CWV green. The changes were all "obvious" — the compounding was not obvious to the team until it showed up in revenue.`,
      },
      {
        title: "Fix duplicate-content penalty across shop filters.",
        body: `Shop had 1,400 near-identical URLs from filter combinations (?sort=price&color=red&size=m). Google indexed subsets randomly, diluting authority and wasting crawl budget. Fix: canonical to the clean category URL for all parameter variants (server-side 301 for sort param with default semantics where possible; canonical elsewhere), noindex for pagination beyond page 2 where depth is thin, XML sitemap pruned to canonicals, robots.txt blocking obvious junk params (Google handles this fine but it frees budget). Within one quarter: indexed pages dropped to 340 clean URLs, average ranking position rose 4 positions, crawl frequency doubled. Canonical discipline is the most unglamorous SEO win in e-commerce.`,
      },
      {
        title: "Ship an FAQ rich-snippet program.",
        body: `Support team maintains 120 real customer questions with answers. Implementation: FAQPage JSON-LD mirroring visible <details> accordions, answer text matches rendered content exactly, validated in Rich Results Test, added to sitemap lastmod on each edit. Result: 38% of eligible pages show "People also ask"/FAQ snippets; those pages get +45% CTR vs plain blue links; support contact rate dropped because answers surface earlier. Zero tricks, zero hidden text — the Q&A was already the content; structure just made it legible.`,
      },
    ],
    exam: [
      {
        question:
          "Why does robots.txt not guarantee a page will not be indexed?",
        answer:
          "robots.txt controls crawling, not indexing; a page reachable via links from allowed paths can still be indexed without ever being fetched by the bot — or indexed from external inbound links. To keep a page out of the index you need noindex (meta or header) or authentication; robots.txt is a crawl throttle, not a removal tool.",
      },
      {
        question:
          "What does a canonical link element do, and when does it backfire?",
        answer:
          'It tells crawlers "prefer this URL for signals about this content"; crawlers usually honor it. It backfires when pages are not actually duplicates (different content, different target audience) — you lose the variant\'s rankings entirely and can confuse consolidation; canonical is a deduping promise, not a hint to ignore content differences.',
      },
      {
        question: "When must structured data match the visible page?",
        answer:
          "Always — Google's structured data guidelines require that markup describes content actually present; FAQ schemas must mirror the visible Q&A; review stars must come from genuine customer reviews; mismatches trigger rich-result manual actions and can deindex the whole template.",
      },
      {
        question:
          "Why is a 200-char title self-defeating even if Google shows it?",
        answer:
          "It truncates mid-phrase and rewrites forcefully more often than not; the front-loaded keywords Google chooses may not be your message — keep it lean enough that the visible portion completes the thought, and put brand last instead of first.",
      },
    ],
    cheat: [
      "robots.txt: allow/disallow crawl + sitemap pointer; noindex removes, robots does not.",
      "Canonical one URL per content; 301 beats canonical when you control both ends.",
      "Title: unique, front-loaded topic, ≤ ~60 chars, brand last.",
      "Description: 150-160 chars, pitch for humans, match intent.",
      "JSON-LD: Article/Product/FAQPage/Breadcrumb; valid and visible-matching.",
      "CWV: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 at p75 — measure CrUX in Search Console.",
      "hreflang every variant incl. x-default; lastmod honest; no hidden content.",
    ],
    recap: `SEO is honest engineering for machines: crawlable and canonicalized pages, titles and descriptions written for human clickers, structured data that answers questions aloud, and Core Web Vitals fast enough to keep both Google and users.`,
    code: {
      title: "FAQPage JSON-LD template",
      language: "html",
      code: `<script type="application/ld+json">\n{"@context":"https://schema.org","@type":"FAQPage",\n "mainEntity":[{"@type":"Question","name":"Do you ship internationally?",\n  "acceptedAnswer":{"@type":"Answer","text":"Yes — 40+ countries, duties calculated at checkout."}}]}\n</script>`,
      explanation:
        "Visible <details> FAQ answers mirror the same text; JSON-LD gives Google the machine-readable version enabling rich snippets that lift CTR substantially — zero deception, pure legibility.",
    },
    diagram: {
      title: "SEO funnel",
      caption: "Crawl, index, rank, show — every stage measurable.",
      mermaid: `flowchart TD\n  R[robots.txt] --> C[Crawl]\n  C --> I[Index and canonical]\n  I --> K[Rank query relevance]\n  K --> S[SERP snippet CTR]`,
    },
  },
  "web-dev-web-foundations-browser-devtools-mastery": {
    intro: `Browser DevTools is the laboratory inside every web browser — Elements for the live DOM and CSS, Console for logs and errors, Sources for debugging JavaScript with breakpoints, Network for the waterfall of requests, Performance for the frame-level timeline, Lighthouse for audits and budgets. The subject is working these panels fluently so that when something breaks in production you triage in minutes instead of days: which requests are slow, which scripts block, which style wins, which memory leak grows. Never opened DevTools in anger is not a senior engineer.`,
    foundations: `Access: F12 or Ctrl+Shift+I (Cmd+Option+I), right-click → Inspect. Panels: Elements (DOM tree, computed vs styles, box model diagram, layout inspectors, color pickers), Console (log/info/warn/error/table/group; exceptions with stack traces; $0/$1/$_ shortcuts; copy(x) and monitorEvents(x) helpers), Sources (file tree, breakpoints, conditional breakpoints, logpoints instead of console.log edits, watch expressions, call stack, blackboxing vendor code, snippets, workspace folder mapping for live-edit CSS/JS), Network (filter by type/status, waterfall timing, request/response headers and payload, block URLs, throttle network to Slow 3G/Offline, HAR export/import), Performance (record user flow; frame-by-frame flame chart find long tasks, forced sync layouts, JS execution vs rendering vs painting; memory heap snapshots to hunt detached DOM nodes), Lighthouse (Performance/Accessibility/Best practices/SEO scores, opportunities list), Application (storage: cookies, localStorage, IndexedDB, cache, service workers).`,
    concepts: [
      {
        title: "Elements: reading and changing the page live.",
        body: `Click the picker, select any node; Styles pane shows which rules apply (crossing out what lost, with source file and line); Computed shows the final value per property and why (winning specificity); Box model graphic shows margin/border/padding/content pixels at a glance; layout inspection in Computed helps flex/grid debugging; toggling CSS live for rapid iteration (changes vanish on reload — use workspace to persist); device toolbar toggles responsive viewport and user-agent; inspect pseudo-states (:hover forced from the pane — test focus styles too!). The underrated power: confirming that the bug is in the CSS before you touch any JavaScript — saves hours of wrong-track debugging.`,
      },
      {
        title: "Console and Sources: debugging with breakpoints.",
        body: `Beyond console.log: conditional breakpoints (right-click line → Add conditional breakpoint — pause only when user.id === 7), logpoints (log without editing shipped code), watch expressions (track variables across steps), call stack navigation, Blackbox third-party code so you stop pausing inside minified jQuery, pause on exceptions (uncaught or all) — the fastest way to find "something threw somewhere", XHR/fetch breakpoints (pause when a specific URL fires), DOM breakpoints (pause when a given node gains attributes or children — find the rogue mutation). copy(arrayOfObjects) pastes usable JSON into your clipboard; monitor(fn) logs every invocation with arguments.`,
      },
      {
        title: "Network: the waterfall is truth.",
        body: `Waterfall columns: queued/stalled, DNS, connect, TLS, TTFB, content download — every phase measurable. Filter: domain (only /api/), type (only xhr), status (only 4xx/5xx). Right-click → Block request URL to simulate server outage locally. Throttling: Slow 3G to experience your mobile users, or Offline to test your error paths and service worker. Export HAR for reproducing support tickets: "here is exactly what my browser sent and got." Sizes: transfer vs decoded (gzip), cached vs revalidated. Prime lesson: your users are not on your fiber — DevTools is the only place you can cheaply walk in their shoes before they complain.`,
      },
      {
        title: "Performance: flame charts and long tasks.",
        body: `Record 5-10 seconds while reproducing jank or slowness; DevTools paints a timeline: main thread (yellow = scripting, purple = layout, green = paint), long tasks > 50ms are red-flagged — click each and see the exact function stack. Forced reflow warnings (read offsetWidth right after writing styles) chain layouts. Memory heap snapshot: take baseline, interact, take another, compare — leak hunting via growth of retained objects (setInterval chains, detached DOM trees held by closures/observers). Rendering pane → paint flashing highlights repaint regions live; FPS meter overlay shows real framerate. These tools are how "the animation stutters" becomes "line 412 does forced layout inside a scroll handler — moved to rAF."`,
      },
      {
        title: "Lighthouse and Application: audits and storage.",
        body: `Lighthouse CI in your pipeline: fail PRs that drop Performance below threshold, or track SEO/A11y over time. The Opportunities list is a todo list — eliminate render-blocking resources (defer/async, inline critical CSS), serve images in next-gen formats, text compression, unused JS/CSS (coverage tab — DevTools can show exactly which lines never ran). Application tab: cookies (HttpOnly/Secure/SameSite flags visible), localStorage/sessionStorage, IndexedDB entries, Cache Storage (service worker caches), and — invaluable for debugging — the ability to delete everything and observe a true cold load.`,
      },
    ],
    worked: [
      {
        title: "Find why the checkout page is 2 seconds blank on 3G.",
        body: `Simulation: Network tab throttled to Slow 3G, reload, waterfall open: fonts.css (render-blocking) at 600ms, app.js (400KB) at 1.4s executing 1.1s of main-thread work on startup. Fixes: <script defer> on app.js + split vendor bundle, inline critical CSS (payment form above the fold), font-display: swap, preload hero image; re-record: first paint from 2.0s to 700ms; Lighthouse performance 48 → 79; conversion up 9% on low-end Android. All four fixes found inside DevTools in under an hour, no guesswork, no cargo.`,
      },
      {
        title: 'Diagnose the intermittent "save did nothing" report.',
        body: `Console → pause on exceptions: none fire; Network → filter failed: found 1 in 15 saves returning 401 (session expiry) — but the UI swallowed the error silently. Fix: response interceptor → detect 401, show "Session expired — saved as draft, please sign in again", route to /login with return URL. Additionally, logpoint added on the catch branch for production telemetry. The whole class of "silent save failure" bugs died with one network filter; the HAR from the user was the key that unlocked it — two minutes of looking, hours of guessing saved.`,
      },
      {
        title: "Hunt a memory leak that froze the dashboard after 20 minutes.",
        body: `Performance → Memory: take heap snapshot at t=0 (8 MB), interact with filters for 20 min, snapshot again (94 MB), compare retained size: 4,200 detached DOM nodes retained by a registry array in a third-party charting lib (never unsubscribed on route change). Fix: chart.destroy() on unmount + WeakMap for per-widget caches; also found a setInterval ticking forever in a status poller. After fix: flat memory profile for 2 hours of interaction; the CEO stopped rebooting their monitor — the kind of bug that never shows in short QA passes.`,
      },
    ],
    exam: [
      {
        question: "What is a logpoint and when does it beat console.log?",
        answer:
          "A logpoint is a non-pausing breakpoint that prints a formatted expression to console without modifying source — you can add/remove diagnostics in shipped code without rebuilding, keeping the codebase clean and avoiding the accidental-commit-debug-log problem entirely.",
      },
      {
        question:
          "Why does the Network tab offer offline and throttling simulation?",
        answer:
          "Because QA machines, offices, and CI run on fiber or localhost — real users on 2G/3G/train Wi-Fi see a different reality; throttling makes that reality testable locally and is the cheapest empathy machine in the toolbox; nobody budgets for performance testing, everyone budgets for DevTools.",
      },
      {
        question:
          "What does a forced synchronous layout warning mean, and where do you fix it?",
        answer:
          "JavaScript read a geometry property (offsetWidth, getBoundingClientRect) after mutating styles, forcing the browser to compute layout synchronously inside the JS task — batch reads/writes, or move the read into requestAnimationFrame; the fix lives in the offending handler, not in DevTools.",
      },
      {
        question: "When should you export a HAR file?",
        answer:
          "When you need to reproduce a production network reality outside your session — support tickets, bug reports from non-technical staff, postmortem evidence — HAR captures the full request/response exchange including timings, and importing it replays the session faithfully.",
      },
    ],
    cheat: [
      "Elements: computed+crossed-out rules show who wins and why; box model graphic.",
      'Console: pause-on-exception is the fastest "where did it throw?" tool.',
      "Sources: conditional breakpoints, logpoints, blackboxing, XHR breakpoints.",
      "Network: filter status 4xx/5xx, waterfall timings, throttle Slow 3G, export HAR.",
      "Performance: long tasks > 50ms, forced reflow warnings, flame chart.",
      "Memory: baseline → act → snapshot → compare → detached DOM retained by closures.",
      "Lighthouse/coverage: ship only the JS and CSS that ran.",
    ],
    recap: `DevTools is the observatory of the web: Elements for the DOM truth, Console and Sources for execution truth, Network for transport truth, Performance for frame truth, Memory for leak truth — mastering it converts guesswork into measurement, and measurement into fixes that ship with receipts.`,
    code: {
      title: "Console utilities every developer should know",
      language: "javascript",
      code: `console.table(users); // aligned columns\n$0; // last selected element in Elements panel\ncopy(data); // clipboard JSON of any variable\nmonitorEvents(window, 'resize'); // log all resize events`,
      explanation:
        "Console.table surfaces data structure at a glance, $0 ties console to the Elements selection, copy moves objects effortlessly — small tools that retire hours of manual inspection.",
    },
    diagram: {
      title: "DevTools triage flow",
      caption: "Symptom to layer to panel to fix — the debugging loop.",
      mermaid: `flowchart LR\n  S[Symptom] --> N{Layer?}\n  N -->|Rendering| E[Elements + Performance]\n  N -->|Scripting| C[Sources + Console]\n  N -->|Network| R[Network panel]`,
    },
  },
  "web-dev-web-foundations-web-performance-fundamentals": {
    intro: `Web performance is the discipline of respecting the user\'s time — measured in milliseconds, felt as patience or abandonment, and increasingly counted by Google as a ranking factor. The subject is the complete performance stack: the critical rendering path (what blocks first paint), resource prioritization (what loads first and why), lazy loading (what loads never-unless-needed), bundling (what you ship and how much of it you actually use), caching strategy, and the Core Web Vitals budgets that turn "feels fast" into a number with a stopwatch. Everything else is detail.`,
    foundations: `Critical rendering path: HTML bytes → DOM; CSS bytes → CSSOM; DOM+CSSOM → render tree; layout → paint → composite; JS can pause the pipeline at three points (download, parser blocking, execution). Blocking categories: render-blocking CSS, parser-blocking scripts (synchronous <script> in <head>). Resource hints: preconnect (early TLS to an origin), dns-prefetch, preload (fetch this specific resource NOW at high priority — fonts, hero images), prefetch (fetch this for the NEXT page), prerender (render next page offscreen). Lazy loading: loading="lazy" for images/iframes, IntersectionObserver for custom, dynamic import() for JS. Bundling: esbuild/rollup/webpack/vite — code splitting by route, tree-shaking dead exports, minification, compression (brotli > gzip). CWV: LCP ≤ 2.5s (p75 real users), INP ≤ 200ms, CLS ≤ 0.1.`,
    concepts: [
      {
        title: "The critical rendering path, dissected.",
        body: `HTML arrives → the browser starts painting as soon as HTML+CSSOM allow — this is why inline <style> blocks for critical CSS (above-the-fold styles inlined in <head>) trade bytes for paint time, a legitimate win. <link rel="stylesheet"> is render-blocking (whole file needed — even unused parts); <script> without defer/async blocks the parser and prevents paint; <script defer> downloads in parallel, executes after parse in order; <script async> executes on arrival whenever ready (execution order not guaranteed); <script type="module"> is deferred by default. First paint blocked by: render-blocking CSS, parser-blocking scripts, web fonts (use font-display: swap to show fallback text immediately; preload the font file to shorten the swap window).`,
      },
      {
        title: "Resource hints and prioritization.",
        body: `preload = absolute-force fetch at high priority during this page — use for fonts, hero images (LCP candidate), critical CSS/JS chunks. Prefetch = low priority for next navigations — great for "user probably clicks Pricing next". preconnect = establish early connection (TLS) to third-parties: <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin> — saves 1-2 RTTs per third-party. dns-prefetch similar for DNS only. HTTP Early Hints (103) let CDNs send preload instructions before the app responds — server pushes the hint while origin computes. Priority pitfalls: over-preloading (fighting itself), preloading below-the-fold images (wastes bandwidth), forgetting crossorigin on font preloads (double download, wasted bytes).`,
      },
      {
        title: "Lazy loading and the intersection observer.",
        body: `Images: loading="lazy" on <img> defers fetch until near-viewport (browser-managed, free); loading="eager" for LCP candidates — never lazy the hero. iframes: lazy-load embeds, maps, videos. JS: route-level code splitting means the dashboard bundle never downloads for marketing visitors; React.lazy + Suspense, dynamic import() for heavy widgets (editors, charts below the fold, modals). IntersectionObserver for "load when visible" custom behaviors — analytics triggers, skeleton replacement. Caution: lazy loading hurts LCP if the lazy image IS the LCP candidate, hurts INP if you load scripts on interaction without budget. Measure before/after each change — half of "obvious" optimizations do nothing or regress.`,
      },
      {
        title: "Bundling, splitting, and what actually ships.",
        body: `Ship less: tree-shake (sideEffects: false in package.json; import { map } not import _), drop moment.js (use date-fns or Intl), audit duplicate deps (two lodash copies from mixed ESM/CJS), compress (brotli saves ~15-20% over gzip at same CPU-ish cost). Split: route-based chunks, vendor chunk for caching, dynamic import for big one-off components. Measure: source-map-explorer or bundlephobia — that "tiny" dependency is often 200KB with its transitive tail. Coverage tab in DevTools: if 60% of your JS never runs on first paint, split it. Compression middleware (compression for Express, nginx gzip_static, CDN brotli) is one line of config with outsized payoff.`,
      },
      {
        title: "Core Web Vitals as budgets and culture.",
        body: `Budgets: LCP ≤ 2.5s p75, INP ≤ 200ms p75, CLS ≤ 0.1 p75 — set them per template, measure in CrUX (field data) and Lighthouse (lab), alert on regression. INP is the hardest: every interaction handler must be cheap — long tasks anywhere kill it; break up work with scheduler.yield() or route to web workers for heavy compute; avoid layout thrash in handlers. CLS: always width/height on media, reserved ad slots, no content injected above the fold after load, transform-based animations only. Culture: performance reviews in PRs, bundle-size CI budgets (fail the build at >X KB), performance sprints quarterly, celebrating the 40ms win as loudly as the feature launch — because users decide in seconds whether your product respects them.`,
      },
    ],
    worked: [
      {
        title: "Cut LCP from 4.8s to 1.9s on a product page.",
        body: `Diagnosis chain through DevTools: (1) LCP element identified as hero <img> 1.8MB PNG — converted to AVIF via CDN, now 112KB, <link rel="preload" as="image" fetchpriority="high">; (2) render-blocking Google Fonts CSS — replaced with preload + font-display: swap, self-hosted woff2; (3) 410KB blocking app.js — deferred + split vendor chunk, uncached parts moved to dynamic import for review tab (below fold); (4) JSON-LD inline (small, fine). Re-measured on Slow 3G simulation: first paint 2.1s → 900ms; LCP 4.8s → 1.9s; Lighthouse 52 → 91; bounce rate −18% over 30 days. The fixes were surgical, not heroic.`,
      },
      {
        title: "Halve the JS bundle with no feature changes.",
        body: `Bundle audit (source-map-explorer): moment.js 232KB → replaced with Intl.DateTimeFormat (0 bytes); lodash 71KB → cherry-picked lodash-es/map + lodash-es/pick, tree-shaken; legacy polyfills shipped to modern browsers (core-js full bundle) → replaced with browserslist-targeted builds saved 94KB; duplicate uuid versions in two deps → npm overrides forced one copy; result 780KB → 214KB transferred, 118KB brotli. Same features, same visuals, same behavior; CI budget added: build fails if main chunk exceeds 200KB. Time to interactive dropped 3.1s → 1.4s on mid-tier Android.`,
      },
      {
        title: "Kill CLS caused by late-loading ads and fonts.",
        body: `CrUX flagged CLS 0.28 on the blog template. Traces: ad slot div had no height until ad network filled it at 700ms; featured image lacked dimensions; web font swap shifted nav height. Fixes: aspect-ratio box reserved 90px for ad slots (ads render inside, no shift); width/height attrs on all article images computed at build from originals; font-display: swap + matching fallback metrics (size-adjust in @font-face) — nav height stable; re-audit 0.28 → 0.02, green CWV in Search Console for the template. Total work: one day; the compounding benefit: faster crawl, better CTR.`,
      },
    ],
    exam: [
      {
        question:
          "Why is inline critical CSS a win for first paint but a possible loss for caching?",
        answer:
          "It removes the render-blocking round trip for the above-the-fold styles — paint happens immediately; but inlining bytes into HTML means those bytes ship with every navigation, bypassing cache; the right pattern: inline the small critical subset inline, load the full stylesheet normally and cached — both problems solved.",
      },
      {
        question: "When does lazy loading backfire?",
        answer:
          "When the element you lazy-load is (or is near) the LCP candidate — you traded first content for later bytes; the LCP image must load eager with high priority; lazy loading everything non-critical only; measuring LCP before/after is mandatory, because guessing which image is LCP is wrong half the time.",
      },
      {
        question: "What is INP measuring that FID did not?",
        answer:
          'Full interaction latency — from input to next paint of the result, not just input dispatch — capturing long JS tasks, layout, and paint after the user clicks; a site can pass FID easily and still feel broken on every click; INP is the direct measurement of "the app was slow when I tapped", which is why Google replaced FID with it.',
      },
      {
        question:
          "Why must you measure Core Web Vitals at the 75th percentile of real users?",
        answer:
          "Because averages hide the people who matter — the slowest quarter of sessions defines your experience score; Search Console CrUX is p75 precisely so optimizing for the median does not let the tail perish; your local Lighthouse score is lab fiction until field data agrees.",
      },
    ],
    cheat: [
      "Critical path: HTML→DOM, CSS→CSSOM, merge, layout, paint, composite.",
      "Blocking offenders: render-blocking CSS, parser-blocking scripts; defer/async/module.",
      "Hints: preload (now), prefetch (next), preconnect (early TLS), early hints (103).",
      "Lazy: loading=lazy images, dynamic import() for heavy JS below fold.",
      "Ship less: tree-shake, brotli, audit duplicates, coverage-guided splitting.",
      "CWV p75: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1; field data beats lab.",
      'Budgets in CI; measure before and after every "optimization".',
    ],
    recap: `Performance is the budget of trust: inline critical CSS, split and compress the JS you ship, preload what matters, lazy-load what does not, and hold LCP/INP/CLS at p75 as non-negotiable budgets — because nobody remembers your stack, they remember how fast it felt.`,
    code: {
      title: "Critical head for a fast page",
      language: "html",
      code: `<link rel="preload" as="image" href="hero.avif" fetchpriority="high">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<style>/* inline critical CSS, ~2KB */</style>\n<link rel="stylesheet" href="/main.css" media="print" onload="this.media='all'">\n<script defer src="/app.js"></script>`,
      explanation:
        "Preload the hero, inline the critical styles, swap-load the full stylesheet safely, defer the app — a first paint arrives in milliseconds instead of seconds.",
    },
    diagram: {
      title: "Critical rendering path",
      caption:
        "The sequence the browser executes before pixels — optimize each step.",
      mermaid: `flowchart LR\n  H[HTML] --> D[DOM]\n  C[CSS] --> O[CSSOM]\n  D --> R[Render tree]\n  O --> R\n  R --> L[Layout]\n  L --> P[Paint]`,
    },
  },
  "web-dev-web-foundations-http-caching-and-conditional-requests": {
    intro: `HTTP caching is the discipline of never sending the same bytes twice — using explicit freshness lifetimes (Expires, Cache-Control: max-age) and cheap validators (ETag, Last-Modified) so repeat visitors and CDN edge nodes serve from cache instead of hammering your origin. Conditional requests (304 Not Modified) are the elegant handshake that makes this safe. The subject is the full caching decision tree — what to cache, for how long, who may cache it, and how to invalidate — because a correctly tuned cache turns an origin that falls over at lunch into one that idles at 5% CPU.`,
    foundations: `Two orthogonal questions every cache asks per response: Is it fresh (Cache-Control, Expires, s-maxage for shared caches)? If not, can I revalidate cheaply (ETag/If-None-Match — strong/weak validators; Last-Modified/If-Modified-Since — second-granularity)? Directives that matter: max-age (browser), s-maxage (CDNs/shared caches), public/private, no-cache (always revalidate, may store), no-store (never store — sensitive), must-revalidate (obey TTL strictly), immutable (fingerprinted assets: never even revalidate), stale-while-revalidate (serve stale instantly, refresh in background), stale-if-error (serve stale on origin failure). 304 vs 200: 304 carries no body, client reuses cache, zero bytes re-transferred. Cache keys: method + URL + Vary headers — the usual bug source.`,
    concepts: [
      {
        title: "Cache-Control: the directives that actually get used.",
        body: `Public immutable assets: Cache-Control: public, max-age=31536000, immutable (fingerprinted filenames — app.a8f3c2.js — URL changes when content changes; this is the only safe way to year-long caching). HTML pages: no-cache or short max-age (60-300s) with ETag — you want fresh-ish HTML always; never cache HTML long or deploys will ghost from production for days. API responses: private, max-age=0 with ETag for personalized data (correctness over speed); public, s-maxage for lists identical per user. Sensitive: no-store, always. Default recipe: fingerprint assets in build (webpack/vite do automatically), set HTML to no-cache + revalidate, everything else immutable behind a CDN with long TTLs.`,
      },
      {
        title: "ETags and conditional requests: the 304 dance.",
        body: `Server response: ETag: "a1b2c3" (hash of body or version) — browser stores it with the cached entry. Next request: If-None-Match: "a1b2c3" — server compares (strong validation = byte-identical; weak W/"..." = semantically equivalent); match → 304 Not Modified (no body, no bytes); mismatch → 200 with new body + new ETag. Last-Modified analog: If-Modified-Since — cheaper but second-granularity; ETag is the precision instrument. Always use strong ETags for APIs where JSON key order may vary — normalize before hashing or you get false cache misses that burn bandwidth for nothing. 304s are the cheapest requests on Earth: headers only, sub-5ms.`,
      },
      {
        title: "CDN edge caching and s-maxage.",
        body: `In front of your origin sits a fleet of edge nodes; they answer before your server wakes up. Key directives: s-maxage=3600 — CDN TTL independent of browser TTL (browsers can get short TTL, CDN long — the classic pattern for semi-dynamic content); stale-while-revalidate=30 — edge serves stale for 30s while revalidating in background; stale-if-error=600 — edge serves stale when origin 500s, shielding users from deploy hiccups; surrogate keys/purge APIs for targeted invalidation (purge product page cache on CMS edit instead of waiting for TTL expiry — fastly/keycdn/cloudflare all offer this). Vary: Accept-Encoding gets compressed variants cached; Vary: * kills caching entirely — never.`,
      },
      {
        title: "Cache invalidation and versioning strategy.",
        body: `The two honest options: (1) Fingerprint everything immutable (content-hash in filename — build system does it for you) — cache keys never lie, invalidation is just "deploy new filenames" and old assets fall away naturally; HTML must reference exact fingerprints or nothing works — meta: HTML is the one thing not to cache hard. (2) For stateful data: explicit purge webhooks from your CMS/deploy pipeline (purge URLs by tag), or accept short TTLs — 60s freshness is usually indistinguishable from instant for product pages. The forbidden pattern: same URL, changed content, cache-control: max-age=86400 — users see day-old prices; this exact configuration causes real incidents weekly; never cache HTML by duration alone.`,
      },
      {
        title: "Debugging cache in the wild.",
        body: `DevTools Network: check "Size" column — "(disk cache)", "(memory cache)", "304" are all cache hits; compare with actual transferred bytes. Application tab → Cache Storage shows service worker caches — your PWA might be serving ancient HTML while the server updated; clear and reload to reproduce. curl -I to read raw headers of any endpoint — the fastest sanity check there is. Chrome vs Safari vs Firefox honor directives with subtle differences; CDNs add their own headers (X-Cache: HIT/MISS, Age: seconds — visible truth); a purge that "worked" but the edge shows Age: 3000 means it did not propagate — verify from four geolocations.`,
      },
    ],
    worked: [
      {
        title: "Cut origin bandwidth 94% with a sane caching policy.",
        body: `Config audit of a Shopify-like shop: origin served every image, every CSS, every JS unconditionally — 900 RPS at peak, monthly egress $3,100. Changes: fingerprinted assets (build already corrupts filenames with content hash — enabled); Cache-Control: public, max-age=31536000, immutable for /assets/*; HTML → Cache-Control: no-cache with ETag (revalidate always, 304 mostly); product JSON API → private, max-age=0; CDN edge TTL s-maxage=3600 for product pages with surrogate-key purge on CMS edit. Results: origin RPS 900 → 55; egress → $180; p95 TTFB 800ms → 180ms. The single most valuable afternoon in the company\'s infrastructure history, for zero new hardware.`,
      },
      {
        title: 'Debug the "my users see yesterday\'s prices" incident.',
        body: `Symptom: customers complain prices wrong; support escalations spike; engineering blames browsers. Reproduction: curl -I https://shop.example.com/pricing shows Cache-Control: public, max-age=86400 — set by a well-meaning intern via a header-rewrite rule; browsers and CDN both hold it; the "fix" redeployed content but every client kept yesterday. Resolution: hotfix headers (no-cache for HTML + 304), purge CDN, push tiny versioned asset URL change to bust HTML, monitor; postmortem: add Cache-Control assertions to the integration-test suite; add CDN X-Cache verification to release checklist. Cache headers are architecture, not decoration.`,
      },
      {
        title: "Implement stale-while-revalidate for instant personalization.",
        body: `A news homepage personalized per user at edge: blended mostly-static editorial modules with per-user "for you" strip. Edge TTL s-maxage=60, stale-while-revalidate=30: first hit per edge POP renders and caches; next 59 seconds served instantly from edge; at t=60, edge serves stale while revalidating asynchronously in background — users never see a stall; on origin failure, stale-if-error=600 keeps the site alive. Result: perceived latency 1200ms → 140ms; personalization freshness ±60s; origin traffic down 85%. The 30-second staleness is invisible; the price is the right one.`,
      },
    ],
    exam: [
      {
        question:
          "Why is max-age=31536000 immutable safe only for fingerprinted URLs?",
        answer:
          "The URL itself is the cache key — if content at a stable URL changes, the cached entry is a lie; fingerprinting makes the filename hash-equal to content, so stale entries are simply unused URLs; the browser never revalidates immutable entries, so you cannot fix a mistake without renaming everything.",
      },
      {
        question: "When does no-cache still use the cache?",
        answer:
          'Always and usefully — no-cache means "store, but revalidate before every use"; the browser keeps the body locally and asks the server "still valid?" each time; the server usually answers 304 and the page loads from local cache in milliseconds with zero payload transfer; it is the strongest freshness guarantee compatible with speed.',
      },
      {
        question: "What is the danger of Vary: * in a production response?",
        answer:
          "It declares that the response depends on infinitely many factors — no cache can ever key it safely, so every request bypasses cache entirely; usually born from misunderstood intent; find it and replace with the specific header(s) you actually vary on (Accept-Encoding, Accept-Language), or drop Vary entirely.",
      },
      {
        question: "Why should HTML never be cached with long max-age?",
        answer:
          "HTML is the manifest — it references every asset URL, script version, and JSON-LD blob; caching it means shipping users an outdated manifest pointing at fingerprints that may no longer exist (or faillines visible behavior) for the duration; HTML gets no-cache + ETag or very short TTLs; fingerprints do the long-term caching.",
      },
    ],
    cheat: [
      "Fingerprint assets → public, max-age=31536000, immutable; never revalidate.",
      "HTML: no-cache + ETag — always fresh, usually 304.",
      "APIs personalized: private, max-age=0; shared lists: public with s-maxage.",
      "ETag + If-None-Match → 304; cheap, correct, bandwidth-free.",
      "s-maxage for CDN TTL decoupled from browser TTL.",
      "stale-while-revalidate=30: instant edge, background refresh.",
      "stale-if-error=600: survive deploy failures; HTML never long max-age.",
    ],
    recap: `HTTP caching is byte-shaving engineering: fingerprinted immutable assets cached forever, HTML revalidated always, validators (ETag) making revalidation free, CDNs absorbing the blast radius, and stale-while-revalidate as the elegant middle — master it and your origin becomes optional infrastructure instead of a single point of collapse.`,
    code: {
      title: "Battle-tested cache header recipe",
      language: "http",
      code: `HTTP/1.1 200 OK\nCache-Control: public, max-age=31536000, immutable\nETag: "9f2b3a1c"\nContent-Encoding: br`,
      explanation:
        "Immutable far-future for fingerprinted assets with brotli compression — the production-tested cheapest byte on the internet is the byte you never send.",
    },
    diagram: {
      title: "Cache decision flow",
      caption:
        "Fresh? Revalidate? Serve stale? Every request answers these in order.",
      mermaid: `flowchart TD\n  R[Request] --> F{Fresh?}\n  F -->|Yes| H[Serve from cache]\n  F -->|No| V{ETag match?}\n  V -->|Yes| S[304 reuse]\n  V -->|No| O[Origin fetch]`,
    },
  },
  "web-dev-web-foundations-content-security-policy-and-security-headers": {
    intro: `Content Security Policy (CSP) and the security response headers are the browser\'s own security immune system — they tell the client which origins may run scripts, frame your page, set cookies, embed media, and access powerful browser features. The subject is the operator\'s set: CSP directives and rollout strategy (report-only → enforce), HSTS, X-Frame-Options and frame-ancestors (clickjacking), Referrer-Policy, Permissions-Policy, X-Content-Type-Options, and the COOP/COEP pair. Misconfigure CSP and the browser happily executes the attacker\'s script with your credentials; configure it well and whole classes of XSS die in transit.`,
    foundations: `CSP: Content-Security-Policy: default-src 'self'; directives: script-src, style-src, img-src, connect-src (fetch/XHR/WebSocket), font-src, frame-ancestors, object-src, base-uri, form-action. Sources: 'none', 'self', explicit origins, nonce-<random> (correctness for inline scripts — the only way to safely allow inline), hash-<sha256> for static inline blocks, 'unsafe-inline' (avoid), 'unsafe-eval' (never in production), wildcard * (avoid). Rollout: Content-Security-Policy-Report-Only + report-uri/report-to endpoint → monitor violation reports → tighten → flip to enforce. Other headers: Strict-Transport-Security (max-age=63072000; includeSubDomains; preload), X-Frame-Options (DENY/SAMEORIGIN — superseded by frame-ancestors), Referrer-Policy (strict-origin-when-cross-origin), Permissions-Policy (camera=(), microphone=()), X-Content-Type-Options: nosniff, Cross-Origin-Opener-Policy/Embedder-Policy pair for cross-origin isolation; CORP controls who may embed. Defense in depth: no single header or directive stops everything, but together they remove whole classes of attacks.`,
    concepts: [
      {
        title: "CSP directives and the script-src decision.",
        body: `default-src is the fallback — set it to 'self' and tighten per-type as needed. script-src controls JavaScript execution: prefer nonces — a per-request random string emitted into <script nonce="abc"> and the header; any script without the nonce is blocked, even if injected by XSS that slips past sanitization. Hashes work for fully static inline scripts. 'unsafe-inline' CSP is theater — it allows every injected inline script ever; 'unsafe-eval' defeats CSP entirely for frameworks that use eval (Vue 2 era, AngularJS). Moving to nonce-based CSP from unsafe-inline is the single highest-value security project most teams can do this quarter.`,
      },
      {
        title: "frame-ancestors and clickjacking.",
        body: `Clickjacking: attacker embeds your page in an invisible iframe on their site; victim clicks "Win iPhone" and actually clicks "Transfer $5,000" in your banking UI. Defense: frame-ancestors 'none' (nobody may iframe you) or 'self' (only same origin), legacy equivalent X-Frame-Options: DENY/SAMEORIGIN for ancient browsers. Note frame-ancestors supersedes X-Frame-Options in modern browsers — set both during transition. Also protect OAuth/payment confirm flows specifically — they are the juiciest clickjack targets and frequently forgotten because the rest of the app is fine.`,
      },
      {
        title: "HSTS, referrer policy, and permissions policy.",
        body: `Strict-Transport-Security: forces HTTPS for max-age seconds on all future visits — before HSTS, an attacker could SSL-strip; after, the browser upgrades automatically (includeSubDomains covers all subs; preload submits to the browser vendor HSTS lists — one-way door, be sure). Referrer-Policy: strict-origin-when-cross-origin sends full URL same-origin, origin-only cross-origin — keeps analytics working while stopping https://yoursite.com/secret-path?token=abc leaking into Referer headers of third parties. Permissions-Policy: camera=(), microphone=(), geolocation=() — ban unused powerful features at the header level; if your app never uses the camera, no compromised script can request it either.`,
      },
      {
        title: "Rollout discipline: report-only, measure, enforce.",
        body: `Never flip CSP from nothing to enforcing on Friday afternoon. Phase: (1) Content-Security-Policy-Report-Only with your best-guess policy; (2) stand up report-to/report-uri endpoint — violations stream in (LogRocket, Sentry, or a 20-line Lambda); (3) triage for 2-4 weeks — legitimate inline scripts, third-party widgets, JSONP endpoints you forgot; (4) fix by nonce-ing or removing; (5) flip to enforce behind a flag; (6) keep report-only on in parallel for new report destinations. Also diff your policy per release — vendor adds a new analytics beacon and your CSP silently bricks it in production; report-only catches this class of outage before users do.`,
      },
      {
        title: "Cross-origin isolation and modern hardening.",
        body: `Cross-Origin-Opener-Policy: same-origin (blocks window.opener cross-origin influence) + Cross-Origin-Embedder-Policy: require-corp (forces all subresources to opt-in via CORP headers or CORS) — together they enable SharedArrayBuffer (required for high-resolution timers and multithreading in WASM) and harden against speculative side channels (Spectre-class); tradeoff: every third-party resource must now explicitly allow embedding — CDNs, fonts, embeds. Also COEP/CORP triple-headed with CORP headers from your own origin. Not for everyone; plan carefully. And always: X-Content-Type-Options: nosniff (blocks MIME confusion attacks — uploaded "image" that is actually JS), X-XSS-Protection: 0 (remove the legacy buggy auditor — modern browsers rely on CSP).`,
      },
    ],
    worked: [
      {
        title: "Ship report-only CSP for a legacy React SPA.",
        body: `Inventory: app bundled (self), Inter from googleapis (font + css), Stripe.js (js.stripe.com), analytics (segment.com), one inline <script> boot snippet with nonce added at build. Policy v1 (report-only): default-src 'self'; script-src 'self' 'nonce-{random}' https://js.stripe.com; style-src 'self' 'unsafe-inline' (legacy CSS injected by JS libs — acceptable short-term); font-src fonts.gstatic.com; connect-src *.stripe.com *.segment.io 'self'; img-src 'self' data: https:; frame-ancestors 'none'; report-to csp-endpoint. Wait 21 days: 4 violation patterns surfaced (segment edge fn, stripe webhook iframe, old JSONP in settings page, inline onclick in one legacy widget) — fixed one, nonce-ed two, removed one. Enforced CSP-Report-Only → enforce next sprint; zero user-facing breakage; the inline boot script is now the only inline script allowed anywhere.`,
      },
      {
        title: "Fix the clickjacked settings modal.",
        body: `Red team demonstrated: attacker page iframes /settings/account with opacity 0.01; victim clicked "Delete account" thinking it was a game button. Fix: frame-ancestors 'none' at the edge worker level; also X-Frame-Options: DENY; also audit payment/confirmation flows specifically; add pointer-events inspection — invisible overlays defeated even frame-busting JS; the header does what JS cannot. Second audit: clean. The fix cost 40 minutes; the blast radius had been total account takeover via one settings button — security headers are the cheapest insurance in the stack.`,
      },
      {
        title: "Turn on HSTS preload for a fintech domain.",
        body: `apex + www + api + docs all HTTPS with valid certs since 2019; HSTS max-age=63072000 set one year prior with zero sub-domain issues; submitted to hstspreload.org; included in Chrome/Firefox/Safari lists ~6 weeks later; verify: chrome://net-internals/#hsts shows static HSTS entry; the attack window for SSL-stripping on first visit: permanently closed for all future Chrome users. Preload is forever — rollback requires removal from lists (takes months) — this company was certain HTTPS everywhere before submitting; preload is irreversible, budget accordingly.`,
      },
    ],
    exam: [
      {
        question:
          "Why is nonce-based script-src stronger than hash-based for most SPAs?",
        answer:
          "Hashes only work for fully static inline scripts — any build-time interpolation (env vars, chunk hashes in URLs, nonces per deploy) invalidates them silently; a nonce emitted per response covers any inline script without maintenance; hashes suit truly static one-shot bootstraps only.",
      },
      {
        question:
          "What does X-Content-Type-Options: nosniff prevent, concretely?",
        answer:
          'MIME confusion attacks where the browser guesses content type from bytes rather than honoring Content-Type — an uploaded "photo" containing JavaScript could execute in a victim\'s session if interpreted as script; nosniff forbids the guess, forcing the honored type (and breaking the attack).',
      },
      {
        question: "Why roll CSP out in report-only mode first?",
        answer:
          "Because real sites always carry unknown inline scripts and third-party dependencies — enforcement on day one bricks production with blank pages; report-only collects violations without blocking, letting you enumerate and fix legitimate needs before enforcing; skipping this step guarantees an outage retro.",
      },
      {
        question: "What is the one-way-door risk of HSTS preload?",
        answer:
          "Once your domain ships in browsers' built-in HSTS lists, HTTP is dead for that domain forever from those browsers' perspectives — including during future cert misconfig, cert renewal failure, or migration to a different server setup; removal from lists exists but takes months and browser release cycles; cert infrastructure must be bulletproof first.",
      },
    ],
    cheat: [
      "CSP: default-src self; script-src self + nonce; style-src as tight as feasible; frame-ancestors none.",
      "Rollout: Report-Only → collect → fix → enforce; never straight to enforcing.",
      "HSTS: max-age=63072000; includeSubDomains; preload only after certainty.",
      "frame-ancestors replaces X-Frame-Options; set both during transition.",
      "Referrer-Policy: strict-origin-when-cross-origin — sane default.",
      "Permissions-Policy: deny unused camera/mic/geo at header level.",
      "nosniff always; CSP report endpoint wired to your alerting.",
    ],
    recap: `Security headers are the browser\'s immune system: CSP quarantining script sources by nonce, frame-ancestors sealing against clickjacking, HSTS forcing encryption forever, referrer and permissions policies shrinking your data footprint — rolled out report-only, measured, then enforced, because the internet never stops sending you traffic you did not plan for.`,
    code: {
      title: "Minimal production header set",
      language: "http",
      code: `Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-{r}'; img-src 'self' data: https:; connect-src 'self' *.stripe.com; frame-ancestors 'none'; base-uri 'none'; form-action 'self'\nStrict-Transport-Security: max-age=63072000; includeSubDomains\nX-Content-Type-Options: nosniff\nReferrer-Policy: strict-origin-when-cross-origin\nPermissions-Policy: camera=(), microphone=(), geolocation=()`,
      explanation:
        "The four-header baseline every response should carry — small, unglamorous, and the difference between a browser enforcing your policy and hoping your app never slips.",
    },
    diagram: {
      title: "Defense in depth via headers",
      caption: "Layers of browser-enforced boundaries around your content.",
      mermaid: `flowchart TD\n  R[Response headers] --> CSP[Script source quarantine]\n  R --> FA[Frame ancestors]\n  R --> HS[HSTS always-encrypted]`,
    },
  },
  "web-dev-web-foundations-responsive-images-and-media-optimization": {
    intro: `Responsive images and media optimization make sure the right bytes reach the right screen — avoiding the desktop-megahero shipped to a phone on 3G, and the unoptimized video that murders data plans and patience. The subject is the complete media pipeline: srcset and sizes for resolution/width selection, <picture> for format negotiation (AVIF/WebP/JPEG fallbacks), lazy loading, aspect-ratio preservation to kill CLS, and CDN-hosted transformation pipelines for every uploaded asset. When this layer is right, media stops being the biggest bytes on the wire and becomes just content.`,
    foundations: `The problem: an image authored for a 4K monitor is 2MB; five of those kill mobile performance. Solutions: (1) srcset with width descriptors (w) + sizes telling the browser the rendered width — browser picks the smallest candidate ≥ its display need at DPR-appropriate resolution; (2) <picture> + <source type="image/avif|webp"> for format support negotiation with a final fallback <img>; (3) loading="lazy" (below fold), loading="eager" + fetchpriority="high" for LCP; (4) width/height attributes or CSS aspect-ratio so the browser reserves space pre-download (CLS → 0); (5) CDN transformations (Cloudinary, imgix, Akamai, Cloudflare Images): on-the-fly resize/format/quality/compression per URL parameter; (6) modern codecs: AVIF ~50% smaller than JPEG at same quality, WebP ~25-35%; JPEG XL emerging.`,
    concepts: [
      {
        title: "srcset and sizes: resolution selection mechanics.",
        body: `<img src="hero-800.jpg" srcset="hero-400.jpg 400w, hero-800.jpg 800w, hero-1200.jpg 1200w, hero-1600.jpg 1600w" sizes="(max-width: 640px) 100vw, (max-width: 1200px) 80vw, 1200px" alt="..."> — sizes is a media-condition → CSS-length list; the browser computes the pixel-density-correct candidate (1x, 1.5x, 2x DPR) itself. Width descriptors (w) describe file width, not display size — browser does the math; confusing the two yields oversized downloads. Budget: cover the breakpoints your layout actually uses; 4-6 candidates typical; generate all at build or via CDN. Verify in DevTools Network which candidate was picked at various viewports — guesses lose to measurements every time.`,
      },
      {
        title: "picture and format negotiation.",
        body: `<picture> tries sources in order: <source srcset="hero.avif" type="image/avif"> → browser supports AVIF? Use it. <source srcset="hero.webp" type="image/webp"> → WebP fallback. <img src="hero.jpg" alt="..."> → universal fallback. Media conditions also allowed on source: media="(max-width: 600px)" serve a square-cropped mobile image, landscape for desktop — art direction per breakpoint instead of squashed crops. LCP candidates: <link rel="preload" as="image" imagesrcset="..."> to begin fetching before the <img> tag is even parsed. Note OG images: always JPEG/PNG, always absolute URLs, always 1200×630 — social scrapers do not use srcset.`,
      },
      {
        title: "Aspect ratio and zero CLS media.",
        body: `Browser needs media dimensions before download to reserve the box; without them, content reflows as media lands (the "things jump around" experience — CLS). Fixes: width/height attributes on all <img>/<video> (modern browsers respect them aspect-aware; CSS aspect-ratio overrides where needed: aspect-ratio: 16/9). For unknown CMS uploads: extract dimensions at upload, store, emit attributes at render. For videos: poster + aspect-ratio. For background-image heroes: CSS aspect-ratio on the container. And lazy-loading must never apply to the LCP candidate — eager + fetchpriority="high" only for it; everything below the fold gets lazy.`,
      },
      {
        title: "CDN image pipelines: every asset, transformed on demand.",
        body: `Never raw-upload-and-serve: pipelines (Cloudinary, imgix, Imgix-like SaaS, native AWS/Cloudflare) accept parameters in URL: /image.jpg?w=800&q=75&f=auto → auto picks AVIF/WebP/JPEG based on Accept header, q tunes quality (75-80 the sweet spot for photos), w resizes on the fly, DPR parameter, faces=detect for smart crops; signed URLs prevent abuse on paid bandwidth. Origin stays untouched; derivatives cached at edge; invalidation by purge. Result: one original, every rendition, forever — editorial cannot accidentally ship a 12MB TIFF to mobile ever again, no matter how little they know about compression.`,
      },
      {
        title: "Video and audio media hygiene.",
        body: `Short clips: <video muted playsinline loop autoplay> with WebM+MP4 sources, compressed CRF ~28-30, max 720p for backgrounds (higher wastes bytes invisible to users); poster frame mandatory; no autoplay with audio ever — browsers block it anyway. Long-form: streaming (HLS/DASH) via Mux/Cloudflare Stream/Vimeo — adaptive bitrate beats any progressive download; never ship raw 4K to a viewer on 1.5Mbps. Audio: opus/AAC at reasonable bitrates; captions (VTT) always — accessibility + SEO + 85% of social video watched muted. Autoplaying muted-with-captions is the only autoplay users tolerate, so design for it deliberately.`,
      },
    ],
    worked: [
      {
        title: "Convert a WordPress blog's entire media library to AVIF.",
        body: `Audit with DevTools coverage: median article page 2.4MB images; LCP 3.9s. Plan: enable Cloudflare Polish/Mirage or imgix in front of wp-content/uploads; all <img> rewritten to CDN URLs with ?auto=format&w=exact-fit; hero images preloaded. Three months later: images 68% smaller average; LCP 3.9→1.7s; bounce rate −22%; the single highest-ROI quarter of the site\'s history; no editorial workflow changed, no plugin risk, rollback one toggle away.`,
      },
      {
        title: "Kill a CLS 0.31 attributable to product galleries.",
        body: `Product page: gallery images from CMS uploaded by marketing at random aspect ratios, no dimensions emitted. Fix at the platform level: upload pipeline extracts width/height via ffprobe/sharp metadata at upload time; rendered <img> emits exact attributes; CSS aspect-ratio: 1/1 on gallery containers belt-and-suspenders; object-fit: contain prevents stretched thumbnails. Re-audited: CLS 0.31 → 0.04; the "product page feels broken when the thumbnail pops in" tickets stopped; nobody noticed the fix — exactly what success looks like for layout stability.`,
      },
      {
        title: "Video loop for a hero section that crashed 3G phones.",
        body: `Design delivered 14MB MP4 1080p autoplay background. Transformation: re-encode to 720p VP9→H.265 with 10s loop, muted, playsinline, CRF 30, audio stripped → 840KB; poster frame first; lazy: video only fetched after first paint via IntersectionObserver; reduced-motion honored via static poster for prefers-reduced-motion: reduce. Data saved per visit: 13MB; Largest Contentful Paint preserved (poster IS the LCP candidate); design team approved because the distortion was undetectable at viewing distance; engineering stopped dreading hero video requests forever.`,
      },
    ],
    exam: [
      {
        question: "Why does sizes exist in addition to srcset?",
        answer:
          "srcset only enumerates available widths; without sizes, the browser cannot know the rendered width and must assume something (usually the image's default width or viewport width) — it may then download a candidate wildly larger than needed; sizes declares the condition→display-width mapping so selection is exact, not guessed.",
      },
      {
        question: "When is <picture> preferable to <img srcset> alone?",
        answer:
          "When you need format negotiation (AVIF/WebP/JPEG fallbacks) or art direction (different crops per breakpoint — square on phone, wide on desktop); srcset only varies resolution of the same crop; picture changes what the image IS, not just how big it is.",
      },
      {
        question: "Why must LCP hero images never be lazy-loaded?",
        answer:
          'Lazy defers fetch until near-viewport — but the LCP image IS the near-viewport candidate the metric times; lazy loading the hero delays LCP by definition; eager plus fetchpriority="high" (and preload link) is mandatory; reserve lazy for content the user may never see.',
      },
      {
        question: "What problem do CDN image pipelines eliminate permanently?",
        answer:
          "The human factor: nobody can upload the wrong size/format/quality again — one original, transformations derived at request time and edge-cached; the organization stops relying on optional human discipline and starts relying on deterministic infrastructure.",
      },
    ],
    cheat: [
      "srcset w + sizes: browser picks by viewport × DPR; verify in Network.",
      "AVIF > WebP > JPEG: <picture> type negotiation, img fallback last.",
      "loading=lazy below fold; hero eager + fetchpriority=high; never lazy LCP.",
      "width/height attrs or aspect-ratio → zero CLS.",
      "CDN transforms: ?auto=format&w=800&q=75 — one original, all renditions.",
      "Video: muted, playsinline, ≤720p, CRF ~28-30, poster always.",
      "CI check: no image served larger than displayed + 1.5x DPR.",
    ],
    recap: `Media is the heavyweight: negotiate formats with picture, select resolutions with srcset+sizes, reserve space with aspect-ratio, and push every byte through a CDN that resizes on demand — so the image on the phone is always exactly the image the phone needed.`,
    code: {
      title: "Production-grade responsive hero",
      language: "html",
      code: `<picture>\n  <source srcset="hero.avif" type="image/avif">\n  <source srcset="hero.webp" type="image/webp">\n  <img src="hero.jpg" srcset="hero-800.jpg 800w, hero-1600.jpg 1600w"\n       sizes="(max-width: 1200px) 100vw, 1200px"\n       width="1600" height="900"\n       fetchpriority="high" alt="Product hero">\n</picture>`,
      explanation:
        "Format negotiation with AVIF/WebP, resolution selection with srcset/sizes, dimensions declared for zero CLS, fetchpriority for LCP — the complete hero recipe.",
    },
    diagram: {
      title: "Responsive image decision chain",
      caption: "Format first, then resolution, always with reserved space.",
      mermaid: `flowchart TD\n  P[picture element] --> T{Format support}\n  T -->|AVIF ok| A[AVIF]\n  T -->|WebP ok| W[WebP]\n  T -->|Else| J[JPEG fallback]\n  A --> S[srcset plus sizes]`,
    },
  },
};

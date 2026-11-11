import type { TopicLesson } from "../topicLessons.js";

/**
 * Design for Engineers — 5 authored topic lessons.
 *
 * Standalone chapters per topic. Subject-first prose, foundations, core
 * concepts, worked examples, exam practice, cheat sheet, trailing revision
 * schedule only. No shared templates.
 */
export const designForEngineers: Record<string, TopicLesson> = {
  "web-dev-design-for-engineers-visual-hierarchy-and-layout": {
    intro: `Visual hierarchy and layout are how screens direct human attention: size, weight, contrast, spacing, alignment, and negative space decide what users see first, second, and never. The subject covers the perception engine — the Gestalt laws applied to real interfaces, typographic hierarchy ratios on a modular scale, grid systems (column/baseline), density and scannability, landmarks and reading order, and the layout debugging session where spacing lies to your eyes.`,
    foundations: `Perception constants: the eye scans F-pattern and Z-pattern depending on content density; contrast ratios drive attention (WCAG 4.5:1 text, 3:1 large); proximity groups related items (Gestalt's law of proximity), similarity binds items visually (same fill = one family), closure completes implied shapes (good for icons, dangerous for borders-as-boxes), common region seals groups (cards), connectedness beats proximity (flow charts). Layout systems: 12-column grid with 16-24px gutters at desktop, 4-column at mobile; spacing scale on a 4/8 px rhythm (4,8,12,16,24,32,48,64); max-width 65-75ch for prose; line-height 1.4-1.6 body; measure/contrast/weight hierarchy — never more than 3 type sizes per view before you lose the plot; alignment is binary (everything aligns to something or nothing aligns — pick); every 'design bug' is solvable by making spacing systematic, removing one outlier, and zipping the eye-track down the column.`,
    concepts: [
      {
        title: "The attention budget: what users see first, second, never.",
        body: `Eye-tracking convergence: users glance at faces, large numbers, bold CTAs, and edges — manipulate exactly those four: big stat at the top left, logo top-left aligned so the scan starts at brand, primary action bottom-right where the hand rests, secondary info tucked into the peripheral. Information hierarchy construction: one h1 per view (the job), subhead for scope, body for detail, meta/captions last; because attention decays exponentially with depth, anything beyond ~6 items in a decision group produces Hick's-law paralysis — every 'add one more row' request costs someone completing the flow; progressive disclosure moves depth behind a click; every dashboard you ever shipped wants three fewer stats than it asked for.`,
      },
      {
        title: "Gestalt laws on product interfaces.",
        body: `Proximity: related items closer together; groups separated by 20px read as families, 60px as strangers; group radio options by 12px, separate groups by 32px — every settings page teaches this; Similarity: same shape/color/fill = same role — every badge uses this to differentiate type (success/warning/error/info); Connectedness: a connector line beats every proximity rule (wizard steps); Common region: cards seal their contents into one visual object — the whole card is one decision to the eye; Closure: dashed borders or incomplete circles imply completion without drawing it all — onboarding rings, progress arcs — every dashboard built around 'the loop' is closure-driving-behavior; Continuity: every horizontal carousel and every timeline rides the eye along implied motion; Figure/ground: modal dim (figure on ground), empty states as background for the CTA (figure must win).`,
      },
      {
        title: "Grids, rhythm, and the spacing scale.",
        body: `Everything at scale is the 8px rhythm: 4/8/12/16/24/32/48/64 spacing steps — no 13px, no 27px, no 'mostly aligned'; every semi-manual layout that drifts is a spacing conversation nobody had; the 12-column grid: 4-col phone, 8-col tablet, 12-col desktop; content measure capped at 65-75ch for readability — text wider than that costs comprehension regardless of screen width; baseline grid (every text sits on 4/8 multiples) is the discipline that separates editorial products from amateur ones; grid debugging: overlay the grid in Figma (Ctrl+G) or via a dev CSS grid overlay — if elements sit half-grid, the design is lying; every spacing audit reduces to: pick the scale, snap everything, delete one outlier.`,
      },
      {
        title: "Contrast, scale, and the hierarchy recipe.",
        body: `Contrast hierarchy recipe: one large bold display per view, two supporting levels, body regular, meta small muted — never more than four families of weight/size per screen; because contrast defines the comparison classes, use the same two fonts everywhere (one display face optional, one workhorse); weight rhythm: 400 regular body, 500/600 emphasis, 700 heads — no 900 except on posters; color contrast doubles as hierarchy (brand = primary action; danger = destructive ends); every marketing page that 'popped' cheated the hierarchy to white-on-black plus one accent; every configurability screen that shipped grey text on 95% grey knows why people stopped reading.`,
      },
      {
        title: "Scanning patterns F and Z — where layout meets reading.",
        body: `F-pattern: text-heavy pages — eyes run across the top, down, across mid — put the topic entity in the top-left and CTA in the second row or the first row's right end; Z-pattern: image-heavy/marketing — diagonal across the banner to the action; every hero section is a Z with the CTA at the bottom-right terminus; because both patterns inherit from habituated left-to-right reading, RTL languages flip everything — if you ship Arabic, the layout is mirrored on purpose; every dashboard you ever built has an F pattern — title bar, stat row, filter row, table — nobody noticed until someone drew the eye tracking on top and the room went quiet.`,
      },
    ],
    worked: [
      {
        title: "Fix a settings page nobody finishes.",
        body: `Audit: 47 links, no grouping, all-blue hover states — nobody finds 'delete account' but also nobody finds 'notification frequency'. Redesign: groups by life event (account, privacy, notifications, data, danger zone) with proximity-separated cards (Gestalt region), headings 24px/600, body 15px/400, line-height 1.5, one primary button per card, danger zone bordered red-left-accent far down the page — completion rate for the notification group +38%; time-to-find per task halved; every redesign begins here because the fix never costs a pixel of new feature.`,
      },
      {
        title: "The 8px snap refactor.",
        body: `Audit a checkout page in Figma inspect panel — found 13/17/23/29/31px paddings everywhere; pick the scale (4/8/16/24/32/48), snap each element, verify by eye — the page stops wobbling; the impulse to 'just eyeball' died against one overlay; every design QA pass should run this thirty-minute exercise as seasoning instead of architecture.`,
      },
      {
        title: "Hero section Z-layout.",
        body: `Left: eyebrow (small caps) → h1 (clamp 2.2-3.4rem, 650 weight) → one-line sub → two CTAs (primary + ghost); right: product shot; because eyes land top-left → top-right → bottom-right → bottom-left, the CTA anchor bottom-right catches the diagonal exit; the screenshot ends where the eye ends; every winning hero in every SaaS deck since 2018 is this exact geometry.`,
      },
      {
        title: "Accessible contrast audit of a marketing page.",
        body: `Body 16px #4b5563 on #ffffff — 7.5:1 ✓ passes; muted caption #9ca3af on white — 2.8:1 ✗ fails AA; fix #6b7280 → 4.6:1 ✓; brand #2563eb on white 8.6:1 ✓; every town of text below 4.5:1 re-colored; axe-core reports zero contrast violations; every 'users say the site feels hard to read on laptops' complaint dissolves into three CVD-tested hex values.`,
      },
    ],
    exam: [
      {
        question: "Why should every view have at most one h1?",
        answer:
          "Because screen-reader and SEO indexing treat the h1 as the document's single purpose — duplicate h1s make assistive tech announce multiple 'main headings' and dilute the outline; every subtree uses descending h2-h6 without skipping; every scan tool that audits headings flags the pattern free.",
      },
      {
        question:
          "What is the Gestalt 'common region' and why does it beat proximity?",
        answer:
          "A shared container (card, panel, bordered box) overrides every internal spacing rule — items inside read as one object regardless of exact gaps; the strongest grouping tool in UI design; cards exist because brains parse bounded regions faster than spaced clusters alone.",
      },
      {
        question:
          "Which direction do eyes scan image-heavy pages and how do you use it?",
        answer:
          "Z-pattern: across the top band, diagonal down-right, across the bottom — the bottom-right corner is prime CTA real estate; every hero image, every banner, every split-screen places its primary action exactly there; every missed conversion lost to that insight is a trainable loss.",
      },
      {
        question:
          "What minimum contrast ratio does WCAG AA require for body text?",
        answer:
          "4.5:1 for normal text, 3:1 for large text (≥ 18pt / 14pt bold) and UI components/focus indicators; every audit machine-checks it in seconds; failing colors don't just exclude users with low vision — they strain every user at laptop glare angles at 3 PM.",
      },
    ],
    cheat: [
      "One h1 per view; hierarchy ≤ 4 levels; F for text, Z for banners; heroes own the Z.",
      "8px rhythm; 65-75ch measure; proximity groups; common region seals groups; one accent.",
      "Contrast 4.5:1 text; 3:1 large/UI; brand = action; danger = destructive only.",
      "Proximity 12px related / 32px unrelated; cards beat spacing at scale.",
      "Empty state = figure on ground; progress rings exploit closure.",
      "Snap everything to the spacing scale; overlay the grid; delete the outlier.",
      "Gestalt beats cleverness — users read groups, motion, and edges before words.",
    ],
    recap: `Visual hierarchy is the zero-negotiation contract your page signs with a reader who gives you none: because every eye lands somewhere and every group of pixels either directs or distracts, the craft is not decoration but traffic engineering — placement, spacing, contrast, rhythm, one job per screen, and the ruthless deletion of everything else.`,
    code: {
      title: "Spacing scale as tokens",
      language: "css",
      code: ":root { --s-1: .25rem; --s-2: .5rem; --s-3: 1rem; --s-4: 1.5rem; --s-5: 2rem; }",
      explanation:
        "Five steps cover 95% of decisions; every other value retires in review.",
    },
    diagram: {
      title: "Attention flow",
      caption:
        "Title → subtitle → CTA — the Z everyone scans before they know they've seen the page.",
      mermaid: `flowchart LR\n  T[Top-left brand] --> R[Top-right]\n  R --> D[Diagonal]\n  D --> B[Bottom-right action]`,
    },
  },
  "web-dev-design-for-engineers-typography-and-color-systems": {
    intro: `Typography and color are the silent engines of every product's perceived quality: typefaces, scale, weight, measure, leading, contrast, palette, dark-mode — because the difference between a product that feels premium and one that feels like a spreadsheet is a 40-line decision about glyphs and hues, the subject covers choosing workhorse type, modular scales, pairing rules, color theory applied to UI, accessible palettes, and the tokens that let both ship consistently.`,
    foundations: `Typography fundamentals: one display face (optional) + one workhorse for 95% of text (Inter, Source Serif, IBM Plex family); modular scale ratio 1.125-1.333 (golden 1.618 too loud); fluid clamp() type; leading 1.4-1.6 body, 1.1-1.2 headings; measure 45-75ch; justification avoided (rivers), hyphenation rare; weight gradient 400/500/600/700; because type renders at more variance than color, test on real screens (not just Figma — anti-aliasing differs; subpixel rendering changes weight perception). Color: limited palette strategy — one brand primary, one neutral ladder (gray 50-900, never pure #000/#fff: 100/#fff, 900/#0a0a0a), one semantic set (success/warning/danger/info), restrained accents; HSL/OKLCH for programmatic ramps (OKLCH transforms reliably across light/dark); dark mode: never invert — swap aliases (--surface/#1d1d1f, --text/#f2f2f2); because color perception shifts in dark mode, reduce saturation ~15%, increase contrast on borders, never pure white; WCAG contrast everywhere; every 'we need a new color' war ends at the token review meeting.`,
    concepts: [
      {
        title: "Typeface selection: the workhorse rules.",
        body: `One workhorse chosen for: full weight range (400-700+), complete Latin Extended + Cyrillic if you ship it, true italics (not slanted fakes), tabular figures for tables (font-feature-settings 'tnum'), x-height ~0.5, generous apertures for small sizes — Inter, Source Sans, Söhne, etc.; display faces for big statements only, never body text; because one wrong face choice ages a product badly, every good design system ships exactly one workhorse + one accent; variable fonts (wght/wdth/opsz) reduce requests to one file — because variable fonts are the only font format that ships every weight without extra requests; every fallback chain: font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif — never an empty room of last glyph.`,
      },
      {
        title: "The modular scale and fluid type.",
        body: `Base 1rem = 16px; ratio 1.25 (major third): 1, 1.25, 1.563, 1.953, 2.441, 3.052, 3.815, 4.768 — eight sizes cover every need (caption→display); because hand-tuned sizes drift, every guideline pins scale to tokens (--text-xs … --text-display); fluid between breakpoints: font-size: clamp(1rem, 0.9rem + 0.5vw, 1.5rem) — every heading that was 'slightly too big on tablets' dies at this line of CSS; because fixed px doesn't respect user zoom, every font size in rem by design; every accessibility audit that passes here saved its users the pinch-zoom on every page.`,
      },
      {
        title: "Color systems: neutral ladder + one accent + semantics.",
        body: `Neutral ladder of 10 steps (50-900) — because perceived steps in HSL aren't linear (lightness is not perceived light), OKLCH ramps with ~equal perceptual ΔL for every step; brand accent: one primary with two steps hover/active; semantics: green + its dark twin (success), amber, red, blue — because red exists only for destructive endings; CVD verification (protanopia, deuteranopia) — count distinct sectors by lightness contrast, not hue alone; every palette announced 'accessible' but failing for 8% of men in the room is embarrassing in one lab test; every enterprise dashboard standardizes on 60% neutral, 30% text hierarchy, 10% accent.`,
      },
      {
        title: "Dark mode without inversion theatre.",
        body: `Never filter: invert(1) hue-rotate(180deg) — hue consistency dies, accent colors invert to complementary abominations; because dark mode is its own palette problem, design both themes natively: dark surface #141414-#1d1d1f (never #000 — pure black halos text), text #f2f2f2, borders #2a2a2c, accent desaturated ~15% and value-adjusted for contrast; every image gets a subtle overlay or swap; elevation in dark mode needs light-ness lifts (flat dark = invisible boundaries — every card separated by 6% luminance or a 1px border); because dark mode adoption is ~40-60% of users on devtools, the product that skipped dark mode lost every night reader silently.`,
      },
      {
        title: "Contrast audits and brand flexibility.",
        body: `WCAG AA: 4.5:1 normal text, 3:1 large/bold-18pt, 3:1 UI components — because every color decision is a test away from shipping or dying; contrast-check every accent against its background at every state (hover, disabled, focus-ring); brand flexibility = allow hues to vary ~10° within one hue cone (oklch hue ± 10) so every marketing variant stays in-family; every 'rebrand' that survived the token review cost one engineer-week; every one that bypassed it cost a quarter of drift and a design-eng firing.`,
      },
    ],
    worked: [
      {
        title: "Pick and pair fonts for a docs site.",
        body: `Workhorse: Inter var (wght 400-700, tnum for code tables); display: none needed (docs = pure reading); because code blocks appear inline, mono: JetBrains Mono with tabular figures; pairing rules satisfied (one serif/sans = unnecessary), the system ships in 1 request via fontsource variable; fallback chain included; every page renders identically on Windows/macOS/Linux — no 'fonts differ' support tickets ever filed.`,
      },
      {
        title: "Build a 10-step neutral ladder in OKLCH.",
        body: `oklch(0.985 0 0) → oklch(0.2 0 0), 10 steps with ΔL evenly spaced (0.985 → 0.85 → 0.73 → 0.62 → 0.51 → 0.41 → 0.33 → 0.25 → 0.17 → 0.10); hue 250 for a cool slate or 80 for warm sepia — chosen once per brand; verify each against app background and text both themes; contrast ratios computed to AA — every ladder is a table of numbers, never a vibe; the design tokens file is the contract reprinted into every consumer.`,
      },
      {
        title: "Dark mode aliases for an existing product.",
        body: `:root { --surface: #ffffff; --surface-raised: #f7f7f8; --text: #111111; --text-muted: #525252; --border: #e5e5e6; --accent: #2563eb; } [data-theme='dark'] { --surface: #141414; --surface-raised: #1d1d1f; --text: #f2f2f2; --text-muted: #a1a1a1; --border: #2a2a2c; --accent: #60a5fa; } — zero component changes; images get opacity .92; every chart color lightened 10% for dark backgrounds; the theme shipped in one PR, not a quarter.`,
      },
      {
        title: "Type scale in rem + line-height.",
        body: `--text-xs: 0.75rem/1.4; --text-sm: 0.875rem/1.45; --text-base: 1rem/1.5; --text-lg: 1.25rem/1.4; --text-xl: 1.563rem/1.3; --text-2xl: 1.953rem/1.2; — every element picks a token; because line-height is baked in, rhythm stays consistent without per-case fuss; the 'why does my p look cramped' question stops appearing in review forever.`,
      },
    ],
    exam: [
      {
        question: "What pairing rules apply to UI typefaces?",
        answer:
          "Stick to one workhorse with a full weight range plus an optional display face for hero moments — two families maximum — because every pairing risk (metrics mismatch, x-height jump, stroke clash) is avoided by one-source discipline; every multi-font horror story began with three free fonts and a weekend.",
      },
      {
        question: "Why is OKLCH preferable to HSL for palette generation?",
        answer:
          "OKLCH's L channel approximates perceived lightness uniformly (HSL's L is a mechanical average of extrema) — ramp generation and contrast steps match human perception; every designer rolling ladders in OKLCH stops fighting the 'this gray feels off' ghost; every color library migrated or died.",
      },
      {
        question:
          "What contrast does WCAG AA require for body text and large text?",
        answer:
          "4.5:1 for normal text; 3:1 for large text (≥18pt or 14pt bold) and for UI components and graphical objects — every audit enforces both; failing is legal nowhere (it's an accessibility escape hatch) and user-hostile everywhere.",
      },
      {
        question: "Why are pure black and pure white avoided on screens?",
        answer:
          "#000 on #fff maxes contrast but haloes strokes on dark themes (blooming on OLED and heavy glyphs); #fff on #000 jitter under subpixel rendering balance — every modern dark theme uses #141414-#1f1f1f surfaces and #f2f2f2 text — the visual softness everyone prefers once seen, every time.",
      },
    ],
    cheat: [
      "One workhorse (Inter var) + optional display; tabular nums for tables; system fallback chain.",
      "Scale ratio 1.25; sizes as rem tokens; clamp() for fluid display; line-height baked per size.",
      "Neutral ladder 10 steps OKLCH; one accent + hover/active; semantics built in.",
      "Dark mode: alias flip (#141414 surface, #f2f2f2 text) — never invert filter.",
      "Contrast AA 4.5:1 text / 3:1 large; verify every state (hover/focus/disabled).",
      "CVD-safe: encode semantics by lightness too, not hue alone.",
      "Variable fonts one request; every fallback ends in system-ui.",
    ],
    recap: `Typography and color are the recognition layer users never name but always judge: because one workhorse, one ladder, one accent and one pair of themes communicate more reliability than any feature list, every review meeting that edits glyphs is cheaper than every redesign proposal — the cheap discipline wins every quarter it survives.`,
    code: {
      title: "Type scale tokens",
      language: "css",
      code: ":root { --text-sm: .875rem; --text-base: 1rem; --text-lg: 1.25rem; --text-xl: 1.563rem; }",
      explanation:
        "Four steps, one rhythm — the entire typography system fits in one glance.",
    },
    diagram: {
      title: "Token pipeline",
      caption:
        "Fonts/colors → primitives → semantic aliases → themes — the flip is one layer.",
      mermaid: `flowchart LR\n  F[Fonts + colors] --> P[Primitives]\n  P --> A[Alias layer]\n  A --> T[Themes: light/dark]`,
    },
  },
  "web-dev-design-for-engineers-design-tokens-and-theming-at-scale": {
    intro: `Design tokens are the data structure of every mature design system: named values in one place, referenced everywhere, swapped per theme with zero component edits — because the day the brand re-skins and the design engineer spends a week renaming '#2563eb' is the day the system failed, the subject covers primitive/semantic/component tiers, token licensing for platforms, theming mechanics (data-theme, class, media), Style Dictionary pipelines, versioning, and the governance that stops token anarchy across product teams.`,
    foundations: `Token tiers: (1) primitive/global — raw palette (blue-600, space-4, radius-md, shadow-sm) shared by nobody directly except the pipeline; (2) semantic/alias — intent-named (--surface, --text-muted, --accent, --border, --danger) — one switch for whole themes; (3) component-scoped — --button-bg, --card-shadow — sparing use, only for audited overrides. Delivery: CSS custom properties in :root for web (runtime, zero rebuild), generated classes for others (JS objects, Swift/Kotlin structs via Style Dictionary); theming strategies: [data-theme='dark'] on html (wins), .theme-dark class on a subtree (scoped), prefers-color-scheme media (OS preference fallback). Because tokens are data, they version like code: semver, changelogs, deprecation windows, codemods for renames; every token is a public API — removing one breaks someone's build the same way.`,
    concepts: [
      {
        title: "Three tiers — primitive, semantic, component.",
        body: `Primitive: #2563eb, 1rem, 0.5rem, 0 2px 8px rgb(0 0 0 / .12) — named after what they ARE; semantic: --accent (brand action color), --surface (raised page background), --text-muted (supporting copy), --border (separators), --danger (destructive) — named after what they're FOR; component: --button-primary-bg — same as --accent 95% of the time — only when one component diverges (focus ring color --focus-ring differs by surface for contrast); because semantic aliases absorb brand changes, the primitive file is the ONLY place a redesign touches; every raw hex outside tokens is technical debt with interest on every commit.`,
      },
      {
        title: "CSS custom properties vs preprocessor variables.",
        body: `SASS variables are compile-time — output is static CSS, theme switching via classes needs generated blocks; CSS custom properties are live — cascade and inherit, read at runtime, drop in new values per context: [data-theme='dark'] flips aliases for the subtree; every media/print/forced-colors path gets its own alias block without recompiling; the default 2026 architecture: all components consume var(--surface), zero hard-coded hex anywhere — a raw-color lint rule blocks violations in CI; because the browser caches var resolution, performance cost is nil — every senior engineer happy forever.`,
      },
      {
        title: "Style Dictionary and multi-platform output.",
        body: `Input: tokens.json with metadata (category, attribute, value, platform overrides — Swift rounded for iOS, Material for Android); output: css variables (.css), JS book (.js/.mjs for SSR), scss, swift, kotlin, ios -- every platform exact same names; every design rule encoded once; the pipeline runs in CI on every token PR — build artifacts published to npm/@org/tokens internal packages — no platform ever formats hex by hand again; every design update at scale lives and dies by this pipeline's existence, not by anyone's diligence.`,
      },
      {
        title: "Theming at runtime: data-theme, class, media.",
        body: `Strategy: [data-theme] on <html> — instant theme flip, no reload, dark/high-contrast/brand co-branding as 3 values; subtree contexts: [data-theme='dark'] on a card renders dark inside the light page — every embedded widget gets a flip without touching it; prefers-color-scheme default for first visit; user override persisted (localStorage); because switching mutates only :root, zero JS re-render required — every theme switch costs one attribute write, cheaper than touching one component; every dashboard with a theme toggle and flash-of-wrong-theme solved it server-side or with a no-flash inline script.`,
      },
      {
        title: "Governance: tokens are a public API.",
        body: `Lifecycle: propose (design-logic PR), ratify (design-eng review), version (semver — patch fixes values, minor adds, major renames), deprecate (two releases shadow with console warning), sunset (codemod migration); every consumer (web/mobile/email/brand assets) pulls from the same published package — every "the email templates show the old brand blue" ticket ends at one unpinned package version; codemod-based renames (jscodeshift on token names) at consumer scale — every breaking token release costs days of migration, not months of archaeology; the registry view (yarn why) is the truth every token incident debrief opens.`,
      },
    ],
    worked: [
      {
        title: "Design the three tiers for a button.",
        body: `Primitives: blue-600 (#2563eb), white, gray-800, gray-200, radius-md (6px), space-4; semantic: --accent, --on-accent, --surface-raised, --border, --radius; component: --button-bg → var(--accent), --button-text → var(--on-accent), --button-radius → var(--radius); dark mode flips --accent and --on-accent — every button variant across 14 themes recolors perfectly; the token file PR review takes 10 minutes; hand-coding the same absorbed a week per platform every single rebrand.`,
      },
      {
        title: "Implement a no-flash dark mode.",
        body: `<script>try{const t=localStorage.getItem('theme');const m=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t||m;}catch{}</script> in the <head> before first paint — one inline 150-byte script kills the flash; every 'flash of white before dark' report on an SPA closes at this line; caching via immutable token package ensures the fast path never changes after the logo ships.`,
      },
      {
        title: "Style Dictionary from JSON to CSS+Swift.",
        body: `tokens.json: { color: { brand: { '600': { value: '#2563eb' } } } } → outputs :root{--color-brand-600:#2563eb} (css) and static let brand600 = UIColor(hex: '#2563eb') (swift) — every platform reads the identical file; every design change ships by publishing one package version; every review "your indigo is different" argument ends in the diff of this one file.`,
      },
      {
        title: "Deprecate a token without breaking consumers.",
        body: `v1.4.0: add --color-accent-600 as replacement; keep --accent-primary with console.warn('[tokens] --accent-primary is deprecated, use --color-accent-600; it will be removed in v2.0.0'); v1.6: codemod (jscodeshift) renames every occurrence across all consumer repos via one PR each; v2.0: removes old alias — every consumer upgraded without a single manual fix; every deprecation campaign at scale runs exactly this path; every skipped codemod leaves six repos broken.`,
      },
    ],
    exam: [
      {
        question:
          "What is the difference between primitive and semantic tokens?",
        answer:
          "Primitives encode raw values (#2563eb) — they answer 'what is it'; semantic aliases encode intent (--accent) — they answer 'what is it for'; themes flip aliases (light/dark/brand) without touching components; every component referencing primitives directly breaks the theme flip contract.",
      },
      {
        question:
          "Why are CSS custom properties preferred over SASS variables for theming?",
        answer:
          "Custom properties live at runtime — cascade, inherit, change per subtree via attribute flips ([data-theme='dark']), no recompilation for new theme contexts; SASS variables freeze at compile time into static CSS — theming requires generated duplicate blocks per theme and rebuild of everything.",
      },
      {
        question: "What does Style Dictionary buy a multi-platform team?",
        answer:
          "One JSON source of truth → generated CSS variables, JS modules, Swift/Kotlin/Dart consumers, all in CI — every platform consumes identical values by name; design changes ship as package versions, not copy-paste; platform drift dies at the pipeline.",
      },
      {
        question: "How does [data-theme] switching avoid page reloads?",
        answer:
          "The flip mutates only one attribute on <html>; every var(--*) re-resolves instantly through the cascade — zero JS re-renders, zero network — subtrees can also flip individually (cards inside a light page) for embedded widget theming.",
      },
    ],
    cheat: [
      "Tiers: primitive → semantic → component; components consume alias only; lint blocks raw hex.",
      "Custom properties runtime; SASS compile-time; [data-theme] flips per subtree.",
      "Style Dictionary → css/js/swift/kotlin from one JSON in CI.",
      "Theme: user toggle > localStorage > prefers-color-scheme; no-flash inline script.",
      "Tokens are semver APIs; deprecate 2 versions with warning; codemod the removal.",
      "Every brand change touches one file (primitives) — anything else means the tiers are wrong.",
      "prefers-reduced-motion, forced-colors get their alias blocks too.",
    ],
    recap: `Design tokens are the compiler between design tools and production code: because values get named, layered, and generated — never repeated — every rebrand becomes an alias review with a publish button; because every platform reads the same source-sworn names, the three-way drift between web, iOS and Android dissolves at the pipeline's front door.`,
    code: {
      title: "The flip",
      language: "css",
      code: "[data-theme='dark'] { --surface: #141414; --text: #f2f2f2; --accent: #60a5fa; }",
      explanation:
        "Every var-consuming component recolors in one rule — the token economy paid off in seconds.",
    },
    diagram: {
      title: "Token tiers",
      caption:
        "Primitive → alias → component — the brand flip flows through aliases only.",
      mermaid: `flowchart LR\n  P[Primitives: raw values] --> S[Semantic aliases]\n  S --> C[Components]`,
    },
  },
  "web-dev-design-for-engineers-figma-to-code-fluency": {
    intro: `Figma-to-code fluency is the craft of reading a design like a developer: spacing in variables, type in styles, effects in tokens — because every design handoff fails when the engineer eyeballs instead of reading, the subject covers auto-layout mechanics, component properties vs variants, design system architecture mapping (Figma components ↔ code components), inspecting (modes, constraints, placements), Dev Mode, design linting, and the build ritual that ends guesswork.`,
    foundations: `Figma mechanics: every layer has geometry, constraints (min/max/fill/hug), auto-layout (direction, gap, padding, alignment — CSS flex in disguise); components define the design system vocabulary (variants for states/sizes, properties for instance-time toggles); because frames outnumber humans in every large file, Dev Mode (Read-only, CSS variables, Tailwind utilities, code duplication) is the engineer's control panel; design-to-code pipeline: Figma file → tokens (via Tokens Studio/Style Dictionary) → component map (Figma componentName → code component) → generate or hand-port with pixel tolerance (sub-pixel rounding at 125% zoom is meaningless); every review must state: did anyone measure? — every 'looks off' is a red flag for measuring.`,
    concepts: [
      {
        title: "Reading geometry: spacing, alignment, and modes.",
        body: `Pick any element: inspect panel shows X/Y/W/H and its constraints (fixed/relative); parent auto-layout shows gap/padding/direction/alignment — literally CSS: direction→flex-direction, gap→gap, alignment→justify/align; because every modern Figma file is auto-layout'd, a senior engineer reads five spacing values and writes the flex container verbatim, adding nothing — the 'artistic liberty' of moving 16 to 15 px is the exact failure Dev Mode was built to end; every measurements mismatch begins with the designer at 110% zoom designing on a non-4px grid and nobody ruling it out in review.`,
      },
      {
        title: "Components, variants, and properties.",
        body: `Component = master layer; instances = linked clones with two levers: variants (pre-drawn states: Button/Primary/Small, Button/Primary/Large) vs properties (runtime toggles: show icon? label? tone?) — because arbitrary combination matrices explode, variants are curated sets, properties are small boolean/enum forks; reading code mapping: variants map to props (tone='primary' size='sm'); properties map to optional renders ({icon && <Icon/>}); because every mature file is ~200 components with ≤ 10 instances each, the human factor audits mapping matrices weekly; every 'this isn't what we designed' incident traces to one variant nobody looked at on 1280 px screens.`,
      },
      {
        title: "Dev Mode: four times the information in one panel.",
        body: `Dev Mode unlocks: inspect panel in CSS/CSS-in-JS/Tailwind (project-specific code output with unit conversions), measure tool (click two elements, see px distance — no ruler hacking), asset export (SVG 1x/2x/3x/PDF with naming strategy), design system linking (Tokens Studio JSON, code reference to component docs) — because engineers never type hex from the canvas again, every dev gets exactly the format the codebase expects; every handoff without Dev Mode ends with a font being wrong by 200 grams and no smoking gun until QA; every new designer onboards via Dev Mode to match languages before doing anything aesthetic.`,
      },
      {
        title: "Design linting and measuring protocol.",
        body: `Before coding: run import/measure pass — every gap/padding/size/radius checked against the token scale and snapshot; every font checked against loaded faces; every color against the palette (all matches expected); every icon against library (never 'I found something close' — asset pipeline or flag it); because every review is cheaper than every fix, write the diff of design-vs-code before touching the editor; every PixelPerfect report that found a 3px vertical offset paid for the ritual 20 times over; every project that measured zero times shipped someone else's exe-green baseline with 200 invisible regressions.`,
      },
      {
        title: "Handoff checklist: the ritual contract.",
        body: `The engineer's handoff contract: (1) all text has type styles named and loaded (never ad-hoc Inter Black); (2) spacing on the 4px grid; (3) every image/icon exported or in library; (4) every color from the palette; (5) every component with ≥ 2 instances exists in the system or was signed off as one-off; (6) long strings tested (German/EN plural forms); (7) every interaction state drawn (idle/hover/focus/active/disabled/error/empty/loading); (8) dark mode variant; (9) touch targets ≥ 44px; (10) zoom-to-fit-sets-scale 200%. Because every item on this list survived a real production incident, honoring it is free insurance; because nobody reads wikis, the contract belongs as a checklist inside the PR template, autosatisfied or it blocks the merge.`,
      },
    ],
    worked: [
      {
        title: "Rebuild a card in 6 measurements.",
        body: `Card audit: padding 16px all sides (auto-layout), gap between rows 12px, title 17px/600, meta 13px/400 muted, radius 12px, avatar 40px; CSS: .card { padding: var(--s-4); gap: var(--s-3); border-radius: var(--radius-md); } every line a direct read; zero guesses; every designer there says 'finally one who didn't do vibes'; every engineer everywhere pretends they were already doing this.`,
      },
      {
        title: "The '12 px horizontal offset' hunt.",
        body: `QA: CTA button sits 12 px right of its column; inspect: designer aligned on absolute coordinates across breakpoints with fixed left; because the button lives inside a 4-col inset container, the fix is hug/fill constraints, not a 12 px margin hack; the diff of design-vs-code found it in 4 minutes; every review with this ritual catches 2-3 of these per screen on new layouts.`,
      },
      {
        title: "Variant-to-prop mapping of a toast system.",
        body: `Figma: Toast/Success (iconCheck, title, body, action?, dismiss?) — properties: title (text, required), body (text, optional), action (boolean), icon (enum: check/info/warning); code: <Toast tone='success' title={t} body={b} action={label? {label, fn}: undefined} />; the enum in design and the union in TS are the same data — one vocabulary, two readers; every rework beyond this line violates the contract, every deviation gets its name and gets flagged.`,
      },
      {
        title: "Dev Mode for a marketing banner rename.",
        body: `Marketing asks 40 px taller hero; Dev Mode measures the gap from banner bottom to section head — 24 px; because Dev Mode copied CSS 'gap: 1.5rem' directly from the design file, the change is one variable edit on the banner row — every engineer with Dev Mode measures, measures again, commits; every without it ships a smaller banner than they claimed and nobody confirms until analytics tanks.`,
      },
    ],
    exam: [
      {
        question: "What do Figma's auto-layout properties map to in CSS?",
        answer:
          "Direction→flex-direction, gap→gap, alignment→justify-content/align-items combos, hug/fill sizing→width: auto/fit-content vs flex/grid stretch — every frame is a flex container in disguise; writing the flex from the inspect panel without conversion is the entire Figma-to-CSS pipeline.",
      },
      {
        question:
          "Why are Figma component properties preferred over variants for most toggles?",
        answer:
          "Properties collapse the Cartesian explosion of variants into boolean/enum switches — a button doesn't need Tab/Default..Disabled × Primary/Ghost × sm..xL as separate variants when booleans do it; variants remain for state sets (idle/loading/error) where the drawing really differs.",
      },
      {
        question:
          "What does Dev Mode give engineers that the inspect panel didn't?",
        answer:
          "Read-only code output in project formats (Tailwind/CSS-in-JS/SwiftUI), click-to-measure between any two elements, asset export pipelines, variable linking to design system tokens — project-aware output instead of canvas-generic styles.",
      },
      {
        question: "What is the 'design linting' ritual before code?",
        answer:
          "Measure every spacing on the 4px grid, every font against loaded faces, every color against the palette, every icon against the library, every state against the checklist — before writing a line; the diff of design-vs-code belongs in the PR template with sign-offs.",
      },
    ],
    cheat: [
      "Auto-layout = flexbox: direction/gap/align/hug-fill — read five numbers, write the CSS.",
      "Variants = state/size sets; properties = booleans/enums; both map to props 1:1.",
      "Dev Mode: project CSS/Tailwind, tap-to-measure, asset export, token linking.",
      "Lint pass: 4px grid, loaded fonts, palette colors only, library icons only.",
      "Checklist: type styles, states, dark mode, touch 44px, zoom 200%, long strings.",
      "The designer sets it once; the engineer measures it twice; nobody eyeballs ever.",
      "Handoff contract lives in the PR template — it is auto-gated or it is ignored.",
    ],
    recap: `Figma is the second source code — because every pixel in the canvas is a declared variable with a name and a family, the engineer who reads it fluently stops guessing and ships what the designer saw; the two tools no longer translate to each other by hope.`,
    code: {
      title: "Auto-layout to flex",
      language: "css",
      code: "display: flex; flex-direction: row; gap: 0.75rem; align-items: center; padding: 1rem;",
      explanation:
        "Direction, gap, alignment, padding — the four reads that write the container.",
    },
    diagram: {
      title: "Handoff pipeline",
      caption:
        "Figma file → tokens → components → code — every seam measured, nothing imagined.",
      mermaid: `flowchart LR\n  F[Figma file] --> V[Tokens]\n  V --> C[Component map]\n  C --> X[Code]`,
    },
  },
  "web-dev-design-for-engineers-interaction-design-and-motion": {
    intro: `Interaction design and motion are the dialogue between the interface and the hand: affordances, signifiers, feedback, mappings, constraints — because the difference between a delightful product and a confusing one is whether every action predicts its effect, the subject covers Norman's design principles applied to UIs, micro-interaction design, easing and timing curves, reduced-motion compliance, and the animation decisions that feel designed instead of decorative.`,
    foundations: `Norman's pillars: because every interface is supposed to be usable without training, every design begins with affordance (the object suggests action — buttons look pressable), signifier (the label/icon pointing at the action — a magnifying glass means search), feedback (immediate acknowledgment, within 100 ms perceived instant, 1 s keeps flow), mapping (controls resemble their effect — scrollbar direction matches content), constraints (impossible actions disabled or hidden), conceptual model (what the user thinks is happening — the file metaphor), error tolerance (undoable, recoverable). Motion: duration 100-400 ms for UI (exits faster than entries), easing ease-out on entry (decelerate — feels snappy), ease-in on exit (accelerate away — feels light), spring physics for playful surfaces; always transform/opacity (composite-only, no layout); prefers-reduced-motion: reduce media query kills parallax/large motion, keeps fades; every animation longer than 400 ms or more frequent than 2-3 per screen demands justification — motion is seasoning, never the meal.`,
    concepts: [
      {
        title: "Affordances and signifiers — the invisible language.",
        body: `Affordance: the property enabling action (a button looks 3D and pressable; a text field looks editable; a link looks like water); because users never read the manual, every interactive element must whisper its affordance shape through appearance alone; Signifier: the specific signal labeling the action ('Sign up' text, envelope icon); because affordance suggests and signifier directs, mismatched pairs create silent confusion (a card with a hover shadow but no click target = 'is this clickable?'); every test ever run on unlabeled icons converts directly to support tickets; every good grey interface ships invisible signifiers visible enough.`,
      },
      {
        title: "Feedback, mappings, and the 100/400 rule.",
        body: `Feedback latency contract: 0-100 ms feels instantaneous (click, toggle), 100-400 fine with loading indicator, 400 ms-1 s needs progress sign, > 1 s needs explicit 'working' message — every double-click on 'Save' in every slow app being double-charged traces to a missing 200 ms indicator; Mappings: scroll wheel maps to content direction, drag maps to object position, arrow keys map to focus direction — mismatches (a horizontal carousel controlled by vertical scroll) tax every user, always; every correct mapping feels invisible, every wrong one feels unfair; every drag-and-drop with hover-reveal affordance does its job perfectly in every demo and every user's first drag.`,
      },
      {
        title: "Easing, timing, and transform-only discipline.",
        body: `Easing decides how motion feels: ease-out (fast start, slow finish) = entrances feel crisp and responsive; ease-in = accelerate off; ease-in-out = symmetric = subtle; cubic-bezier(.2,.7,.2,1) approximates a spring without JS; because layout-triggering properties (width/height/top) repaint per frame, every animation touches transform or opacity only — the GPU composite path skips layout entirely; every 60 fps animation you ever wrote probably chose translate/scale; every laggy one animated 'margin-left'; every flicker-fest is one width/height transition you can delete in review.`,
      },
      {
        title: "Micro-interactions: reward, guidance, and recovery.",
        body: `Every micro-interaction: trigger (user action or system event), rules (what changes), feedback (visual/audio response), loops/modes (how it repeats or terminates) — every like button, every toggle, every 'saving…' pill; because reward loops reinforce engagement, every success pulses once (no infinite loop — animation ends with the state); guidance micro-interactions: password strength meters narrow attention honestly, inline email checks kill bounce at the edge, tooltip timing at 500 ms survives without annoying; because error recovery is a design feature, every form shakes gently or reveals the problem at the point of failure with a one-tap fix — every unrecoverable 'Submit failed' screen is a user gone forever with a screenshot in support.`,
      },
      {
        title: "Reduced motion, vestibular honesty, and restraint.",
        body: `prefers-reduced-motion: reduce — the OS setting users with vestibular disorders actually own; honor it by removing parallax, autoplay loops, big transitions, carousel autoplay; every WCAG 2.3.3 criteria rides this; because 'if it moves continually, it tires', carousels pause forever; every animation budget: one entrance + one micro-reward per screen; because attention is allocated and trust is earned per motion, every animation that ships without earning its presence is one the next review deletes without apology.`,
      },
    ],
    worked: [
      {
        title: "Add latency-visible feedback to a slow save.",
        body: `Save button: click → disable + spinner + 'Saving…' label within 100 ms (no double-submit) → success: checkmark morphs in with 150 ms spring, persists 800 ms, reverts; because the write is 400-1200 ms, the user never double-fires and never wonders if the click registered — every abandoned 'half-saved' support ticket trace ends at this exact pair of additions.`,
      },
      {
        title: "Design an undoable delete interaction.",
        body: `Delete → toast 'Deleted 3 items' + Undo (5 s) + hide row with 200 ms slide-out; timer commits the write after 5 s or instantly on undo; because destructive actions always include escape hatches in real products, every undo costs the engineer one queue and the user total silence — the pattern regardless of domain; every irreversible 'Are you sure?' dialog dies against this because speed beats certainty pre-sacrifice.`,
      },
      {
        title: "The 'feels instant' skeleton recipe.",
        body: `Content area: render skeleton blocks within the first 16 ms (zero network dependency); every placeholder matches layout geometry (no CLS), muted pulse animation respects reduced-motion (static color instead); every user reports the app is 'fast' — because perceived speed is motion timing, not bytes; every business page that measured before/after skeletonization saw conversion lift on the same backend.`,
      },
      {
        title: "Motion budget audit of a dashboard.",
        body: `Count animations per view: entry fade (1), hover lift on cards (static-ish), live counter tick (1), chart draw (1) — total 4 per screen; rule violated: chart redraws on every data tick — scope to threshold changes; every motion beyond 3 stops explaining itself; the designer signs the motion budget the same way they sign the layout; every dashboard that forgot budget discovers it in support complaints about nausea.`,
      },
    ],
    exam: [
      {
        question:
          "What's the difference between an affordance and a signifier?",
        answer:
          "An affordance is what an object lets you do (button affords pressing); a signifier is the marker that tells you it's there and how (label, icon, shadow, hover state); because affordance without signifier is invisible and signifier without affordance is a trap, every control must match both — every agnostic menu item fails on one or both.",
      },
      {
        question: "What does the 100/400 ms feedback contract say?",
        answer:
          "Under 100 ms users never notice the delay; 100-400 needs an indicator; beyond 400 ms (and certainly beyond 1 s) you owe progress; every 'did it save?' question is answered by showing you have at 100 ms the moment the finger leaves the button.",
      },
      {
        question: "Why are transform/opacity-only animations preferred?",
        answer:
          "They run on the compositor without layout/paint — no reflow, no re-raster, constant 60 fps on any device; animating width/height/top triggers synchronous layout of the whole subtree every frame — the single biggest source of 'janky' animations in the industry.",
      },
      {
        question: "What must respect the prefers-reduced-motion setting?",
        answer:
          "Any non-essential animation: parallax, autoplay, large transitions, elaborate entrances — all must pause or reduce to short fades; essential feedback (focus changes, hover response) can remain; every vestibular-sensitive user navigates the web without a license to get sick — the media query exists to be honored, not read and forgotten.",
      },
    ],
    cheat: [
      "Affordance says 'press me'; signifier says how; feedback acknowledges at 100 ms.",
      "0-100 instant · 100-400 spinner · 400-1000 progress · >1s explicit — every save obeys.",
      "Easing: ease-out in, ease-in out; 150-300 ms; transform/opacity only; no layout properties.",
      "Feedback > progress > nothing; undo for destructive ends; error recovery in-toast.",
      "Reduced motion honored: parallax/autoplay/intros die; fades stay.",
      "Motion budget: ≤ 3 moving things per screen; entrance + reward + functional only.",
      "Skeuomorphism died; map affordances to the actual control; tooltips at 500 ms, rarely.",
    ],
    recap: `Interaction design is the thermostat on trust calibration: because users judge competence by whether clicks feel acknowledged and scrolls behave, every interaction either verifies a prediction or stabs it — the discipline fails invisibly, one unmapped gesture at a time; make every gesture obey, and the app will feel alive without ever being loud.`,
    code: {
      title: "Reduced-motion respect",
      language: "css",
      code: "@media (prefers-reduced-motion: reduce) { .intro { animation: none; transition: none; } }",
      explanation: "Three lines some users need and nobody excuses skipping.",
    },
    diagram: {
      title: "Micro-interaction anatomy",
      caption:
        "Trigger → rules → feedback → loop/end — every like button, every toggle, every toast.",
      mermaid: `flowchart LR\n  T[Trigger] --> R[Rules]\n  R --> F[Feedback]\n  F --> L[Loop or end]`,
    },
  },
};

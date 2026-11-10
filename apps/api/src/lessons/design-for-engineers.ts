import type { TopicLesson } from "../topicLessons.js"; /** * Design for Engineers — 5 authored topic lessons. * * Standalone chapters per topic. Subject-first prose, foundations, core * concepts, worked examples, exam practice, cheat sheet, recap. No shared * templates, no runtime composition. */
export const designForEngineers: Record<string, TopicLesson> = {
  "web-dev-design-for-engineers-visual-hierarchy-and-layout": {
    intro: `Visual hierarchy is the practice of arranging interface elements so the eye naturally reads them in the intended order; layout is the grid and spacing system that places them. The subject is the craft: how contrast, size, proximity, alignment, and whitespace create that order, and how to design screens people parse instantly instead of decode. hierarchy is not decoration, it is information architecture made visible.`,
    foundations: `Foundations: contrast (size, weight, color), proximity (related things near), alignment (things snapped together look intentional), repetition (consistent styles for consistent roles). Gestalt principles explain why: proximity groups, similarity associates, closure completes. Scan patterns: F-pattern for dense text pages, Z-pattern for sparse marketing pages, layer-cake for shaped reading. A spacing scale (4/8 px base) keeps rhythm; a grid (columns and gutters) keeps structure; whitespace is active space, not leftover area.`,
    concepts: [
      {
        title: "Establishing hierarchy with size, weight, and contrast.",
        body: `Every screen should answer "where do I look first, second, third". Use one dominant element (headline or primary action), a supporting tier (body text, secondary actions), and quiet chrome. Hierarchy fails when everything is loud: two headings competing, three accent colors, equal-weight buttons. Contrast does the separating: 700-weight title vs 400-weight body, 16 px vs 14 px, full opacity vs 60%. Repetition builds recognition: the same role always looks the same, so users scan patterns instead of reading labels.`,
      },
      {
        title: "The spacing scale and vertical rhythm.",
        body: `Adopt a base unit — usually 4 or 8 pixels — and derive everything: 4, 8, 12, 16, 24, 32, 48, 64. Vertical spacing between sections, padding inside cards, and gaps in flex/grid all come from the same scale, so the interface has a heartbeat instead of arbitrary gaps. A too-dense layout (everything 4-8 px) fatigues; too airy (everything 48 px) wastes fold. Consistency across components is what reads as "designed" rather than "assembled".`,
      },
      {
        title: "Alignment and grouping.",
        body: `Nothing should be placed "about" aligned; use flex/grid and shared edges. Group by proximity and container: labels closer to their fields than to neighboring fields; related actions share a row or card. Misalignment is the most common cause of "this feels off" — check edges, baselines, and centers. In tables and forms, consistent column alignment and generous cell padding reduce perceived complexity. Grouping also means progressive disclosure: show the essential, hide the rest behind affordances.`,
      },
      {
        title: "Grids and responsive structure.",
        body: `A 12-column grid with consistent gutters gives flexible asymmetric layouts (7/5 splits) and mobile states (stack at <768 px or use container queries). Layout primitives: centered container (max-width 65-75ch for prose), sidebar + content, masonry when appropriate, sticky regions sparingly. Breakpoints by content, not by device: when the layout breaks, add a breakpoint; that rule keeps CSS honest. prefers-reduced-motion and container queries respect the user's environment.`,
      },
      {
        title: "Density, scanning, and task focus.",
        body: `Density matches the job: admin tools favor information density (compact rows, small type, tight spacing); consumer onboarding favors low density with generous whitespace and one action per screen. Every element earns its keep: decorative chrome that does not guide, inform, or act is removed. Empty states, skeleton loaders, and error states are part of the hierarchy too — they keep the eye anchored during loading and failure instead of stranded.`,
      },
    ],
    worked: [
      {
        title: "Fix the page three stakeholders call overwhelming.",
        body: `Audit: five heading levels, two competing accent colors, actions scattered at three positions. Fix: one H1; section headings one weight up from body; body 16 px/1.6; secondary text muted (60% opacity); one accent color for primary actions only; primary action one per section; whitespace doubled between sections. The screen did not gain content; it gained order — users now land on the headline, read the supporting line, and act on the highlighted button.`,
      },
      {
        title: "Build a settings form with a spacing system.",
        body: `Use a single column with max-width 480-560 px; labels above fields (better for scanning and accessibility than left labels at narrow widths); 24 px between field groups, 8 px label-to-field; helper text under fields in muted color; two-column layout only for short related pairs (first/last name) at >=768 px. Error messages appear beneath the field in danger color with icon; success toast confirms save. The form is fast to scan, forgiving to fix, and consistent with every other form in the product.`,
      },
      {
        title: "Turn a wireframe into a grid-based layout.",
        body: `Take the marketing page wireframe: hero, three feature rows, testimonial band. Assign hero 12 cols; features in 4-col rows alternating text/image 7/5 splits; band full-bleed with inner container. Gutters 24 px; container max 1152 px centered; at <=900 px each 7/5 stacks image above text; at <=560 px grid single-column with tighter scale. Same content, same components; the grid delivers it with zero per-element tweaking and one source of truth.`,
      },
    ],
    exam: [
      {
        question:
          'What is the first thing to fix when an interface "feels off"?',
        answer:
          "The spacing and alignment system. Arbitrary gaps and unsnapped edges are the most common cause of visual noise; applying one scale and shared edges resolves most complaints before any color or typography changes.",
      },
      {
        question: "Why is a spacing scale better than arbitrary pixel values?",
        answer:
          "It enforces rhythm and consistency across every component, making layout decisions mechanical, keeping density coherent, and eliminating micro-misalignments; reviewers can spot off-scale values on sight in code and design.",
      },
      {
        question:
          "How do proximity and alignment create grouping without borders?",
        answer:
          "Items closer together than their surroundings are perceived as a group (gestalt proximity); shared edges and baselines reinforce it; whitespace carving groups means fewer boxes and dividers, so the interface communicates structure with less ink.",
      },
      {
        question:
          "What determines the choice between high-density and low-density layout?",
        answer:
          "The task and audience: expert tools and data review favor density; onboarding, checkout, and destructive actions favor low density with one clear next step; consistency of density within a flow matters as much as the absolute level.",
      },
    ],
    cheat: [
      "Hierarchy: one dominant element; tiers by size, weight, contrast.",
      "Spacing scale: 4/8 base; derive everything; one heartbeat.",
      'Align to shared edges and baselines; no "about" alignment.',
      "Gestalt proximity and similarity group without boxes.",
      "Container max-width for prose 65-75ch; grid for structure.",
      "Breakpoints by content breakage, not devices.",
      "Density follows the task; whitespace is active space.",
      "Every element guides, informs, or acts — else remove it.",
    ],
    recap: `Visual hierarchy is ordering made visible through contrast, proximity, alignment and repetition; layout is the systematic grid and spacing scale that holds it; design by answering where the eye lands first, second, third; keep one scale, shared edges, and content-driven breakpoints; density matches the task; and every element that does not guide, inform, or act is removed.`,
    code: {
      title: "Container + spacing tokens in CSS",
      language: "css",
      code: `.container { max-width: 1152px; margin-inline: auto; padding-inline: 1.5rem; }\n.stack > * + * { margin-top: 1.5rem; }`,
      explanation:
        "Centered capped-width container keeps line lengths readable; the stack utility applies consistent vertical rhythm between siblings; both encode the system instead of per-page margins.",
    },
    diagram: {
      title: "Eye-path hierarchy",
      caption: "Where attention goes, in order.",
      mermaid: `flowchart TD\n H[Headline] --> S[Supporting text]\n S --> A[Primary action]`,
    },
  },
  "web-dev-design-for-engineers-typography-and-color-systems": {
    intro: `Typography and color are the two systems that carry most of an interface's identity and readability; getting them systematic turns arbitrary styling into a language the whole product speaks. The subject is choosing type (scales, pairing, loading, measure), and building palettes (contrast, semantics, dark mode) as tokens so they are consistent, accessible, and changeable everywhere. type and color decisions are system decisions — tokens, not whims.`,
    foundations: `Type: a modular scale (e.g., 1.25 ratio) generates sizes; body text 16 px minimum; line-height 1.4-1.7 for prose; measure 45-75 characters per line; limit font families (one for text, at most one for display); weights convey hierarchy; font-display: swap avoids invisible text; variable fonts serve many weights in one file. Color: an accessible palette needs 4.5:1 contrast for normal text, 3:1 for large text and UI components; semantic roles (text, background, surface, primary, danger, success) map to values; dark mode is a token swap, not a separate stylesheet.`,
    concepts: [
      {
        title: "Choosing and pairing typefaces.",
        body: `Start from brand and tone: neutral UI grotesques for tools, serif for editorial warmth, mono for code. One family handles most products; pair display with a workhorse text face only when the brand demands it. Check x-height, legibility at 12-16 px, and the character set you need (symbols, arrows, languages). Test the pair at real sizes in the browser — specimen sheets lie. Prefer families with 3-4 real weights over single weights stretched by faux bold/italic, which synthesize and blur.`,
      },
      {
        title: "Type scales and vertical rhythm.",
        body: `A scale like 12, 14, 16, 20, 24, 32, 40 (ratio ~1.2-1.25) keeps reading sizes distinct and purposeful: captions, body, subheads, heads, display. Line-height: body 1.5-1.7, headings 1.1-1.3; tighter at large sizes. Measure: 65-75ch for prose; never full-width paragraphs. Rhythm: derive margins/padding from the same modular steps so text blocks align to the grid. Variable fonts (font-weight: 400 700 with font-variation-settings or font-weight range) serve every weight in one file — fewer requests, better loading.`,
      },
      {
        title: "Accessible color and contrast.",
        body: `Contrast ratios: 4.5:1 for body text, 3:1 for large text (>=18 pt or 14 pt bold) and for meaningful UI shapes and focus rings. Check with tooling (browser DevTools, Stark, Polypane, axe). Avoid pure black on pure white for long reading — soften to very dark gray on off-white; in dark mode, avoid pure white on black — soften both. Color alone must never encode meaning; pair with icons, labels, and patterns. Test palettes against real users' needs: color blindness (~8% of men), low vision, ambient glare on mobile.`,
      },
      {
        title: "Semantic tokens for color systems.",
        body: `Define roles, not hex: --color-text-primary, --color-surface, --color-border, --color-accent, --color-danger. Components consume roles; themes map roles to values (light/dark, brand variants, high-contrast mode). This decouples meaning from value: components never change when themes do. Alias chains (primitive → semantic → component) allow safe migrations: re-point a primitive, everything downstream shifts coherently. Name tokens by intent (surface-raised, text-muted) not appearance (gray-100), so redesign keeps semantics intact.`,
      },
      {
        title: "Dark mode as a token swap.",
        body: `Dark mode is not "invert everything": surfaces step lighter toward elevation (dark gray → lighter gray at each z-level), text is warm-ish off-white, accents soften and glow less, shadows become borders or glows, images need reduced brightness or caption treatment. Implement with the same semantic tokens under a[data-theme="dark"] or prefers-color-scheme; test every state (focus, disabled, selected, skeleton, error) in both themes; ship with explicit toggle, not only OS preference, because users choose contextually.`,
      },
    ],
    worked: [
      {
        title: "Build a modular type scale and apply it.",
        body: `Pick ratio 1.25, base 16: 12.8, 16, 20, 25, 31, 39. Round: 13, 16, 20, 25, 32, 40. Assign roles: body 16/1.6, small 13, h4 20, h2 25-32, hero 40. On the settings page: body text at 16, field labels at 13 semibold, section headers at 20/1.3, page title at 32. Everything reuses the six steps; adding a new size requires adding to the scale, not a one-off value; the mock and the CSS now agree on the same type story.`,
      },
      {
        title: "Audit and repair contrast across the app.",
        body: `Sweep with axe DevTools: violations on placeholders (3.1:1 on white), disabled buttons (2.4:1), muted text (4.2:1). Fixes: placeholder text is not content — but bump to 4.5:1 anyway; disabled state conveys via shape + label, not color alone; muted text to 4.6:1. Re-run; zero violations; record the palette decisions in the token file so future colors cannot slip. Accessibility is a build gate, not a launch-week scramble.`,
      },
      {
        title: "Ship a dark theme without duplicating styles.",
        body: `Refactor the CSS to roles: .btn-primary { background: var(--accent); color: var(--accent-contrast); } under :root (light values) and [data-theme="dark"] (dark values). Flip the toggle: every component follows — buttons, inputs, cards, toasts, focus rings. Verify elevation order, shadow tokens replaced by border tokens at dark layer, and error/success semantics both readable. Themes become configuration, not parallel stylesheets; adding a high-contrast theme later is another value mapping, zero component changes.`,
      },
    ],
    exam: [
      {
        question: "What is a modular type scale and why use one?",
        answer:
          "A fixed ratio (e.g., 1.25) multiplied repeatedly from a base size, producing a limited set of harmonic sizes; it enforces clear, intentional size relationships, prevents arbitrary one-off sizes, and keeps the interface visually rhythmic and consistent.",
      },
      {
        question: "What contrast ratio does WCAG require for normal text?",
        answer:
          "At least 4.5:1 for body text; at least 3:1 for large text (18 pt+, or 14 pt+ bold) and for significant UI components and graphical objects; non-text contrast applies to meaningful icons, focus rings and control boundaries.",
      },
      {
        question:
          "Why semantic token names beat appearance names like gray-500?",
        answer:
          "Semantic names (--text-muted, --surface-raised) survive redesigns and re-themes — re-map the primitive behind the role and every component adapts; appearance names hardwire hue into components and break on any palette change, causing magic-number churn across the codebase.",
      },
      {
        question: "How should dark mode handle elevation and shadows?",
        answer:
          "Surfaces lighten as they rise in the z-order; drop shadows become subtle borders or faint glows because black shadows vanish on dark backgrounds; accent colors desaturate; contrast is softened at both ends (off-white text on dark gray surfaces, never pure white on pure black).",
      },
    ],
    cheat: [
      "16 px body minimum; line-height 1.4-1.7; measure 45-75ch.",
      "One scale ratio (~1.2-1.25) for all sizes; roles assigned, not ad hoc.",
      "One family for text; display face only with a reason; real weights, no faux.",
      "Contrast: 4.5:1 text, 3:1 large/UI; never meaning by color alone.",
      "Tokens: primitive → semantic → component; names by intent.",
      "Dark mode = token swap with elevation steps and softened corners.",
      "font-display: swap; variable fonts one file many weights.",
    ],
    recap: `Typography and color work systematically: a modular type scale, sane measures and line-heights, limited families and real weights; an accessible, semantic palette with ratios at or above 4.5:1 for text and 3:1 for large/UI elements; colors as intent-named tokens with primitive-semantic layering; dark mode as a mapping of the same roles to dark values; everything auditable and changeable from one place.`,
    code: {
      title: "Semantic color tokens with theme swap",
      language: "css",
      code: `:root { --surface: #ffffff; --text: #1a1a1a; --accent: #2563eb; }\n[data-theme="dark"] { --surface: #141414; --text: #e5e5e5; --accent: #60a5fa; }`,
      explanation:
        "Components reference roles (var(--surface), var(--text), var(--accent)); switching data-theme swaps every value coherently — one attribute controls the whole product theme.",
    },
    diagram: {
      title: "Token layering",
      caption: "Primitive values feed semantic roles feed components.",
      mermaid: `flowchart LR\n P[Primitive: blue 600] --> S[Semantic: accent]\n S --> C[Component: button bg]`,
    },
  },
  "web-dev-design-for-engineers-design-tokens-and-theming-at-scale": {
    intro: `Design tokens are the single source of truth for design decisions — color, type, spacing, radius, shadows, motion — expressed as named values that every platform and component consumes. The subject is the token pipeline at scale: taxonomy (primitive, semantic, component tokens), naming, theming (light, dark, brands, density, accessibility modes), and tooling (Style Dictionary) that turns tokens into CSS variables, Swift, Kotlin, and Android resources from one file. tokens are the API between design and code, and they deserve the same engineering rigor as any API.`,
    foundations: `Token taxonomy: primitives (raw values, e.g., color.blue.600), semantic (intent: color.bg.surface, color.action.primary), component (button.background, input.border). Layers reference each other: component → semantic → primitive. Themes remap the semantic layer (dark theme flips surface values; brand B swaps brand colors; density swaps spacing scale). Tokens are platform-agnostic JSON transformed by Style Dictionary into CSS custom properties, iOS Swift, Android XML, Compose, etc. Version tokens like an API: changelog, deprecation, migration.`,
    concepts: [
      {
        title: "Token taxonomy and naming.",
        body: `Primitives name raw values without meaning (blue-600, space-4); semantic tokens name intent (text-primary, surface-raised, border-subtle, action-danger); component tokens name per-component roles only when the component needs special treatment (button-primary-bg). Name in dot notation, hierarchical, lowercase (color.text.primary); never encode theme in the name (text-primary-dark is wrong — the theme remaps the same token); avoid hue names at semantic layer. Component tokens should reference semantic tokens, not primitives, so theming cascades naturally.`,
      },
      {
        title: "Multi-brand and density theming.",
        body: `A product family with three brands shares components but swaps tokens: brand A (blue accent), brand B (green), brand C (purple); theming maps color.action.primary to each brand's accent. Density mode swaps the spacing scale (compact for data tools vs comfortable for consumer). Enable with a single attribute (data-theme, data-brand, data-density) on the root or per-subtree for embedded contexts. Compose themes independently (brand × dark × density × contrast-boost) — ensure combinations pass contrast audits; generate derived values (hover/active) by algorithm, not hand-picked duplicates.`,
      },
      {
        title: "The Style Dictionary pipeline.",
        body: `Tokens live as JSON (or YAML) in a repo: tokens/color/light.json etc. Style Dictionary reads the tree, applies transformations (name to CSS var, hex passthrough, rem conversion, font-family splitting) and emits platform outputs: :root CSS variables, Swift Colors, Android colors.xml, Compose, Flutter, Figma variables via third-party sync. One build step regenerates everything; designers edit the same JSON (via Token Studio plugin) so the repo is the single source; CI validates contrast and unused tokens; versioning of tokens is explicit semver on the token package.`,
      },
      {
        title: "Adopting tokens without breaking everything.",
        body: `Migrate incrementally: introduce tokens alongside hardcoded styles; replace static values with var(--token) file by file; for legacy code, map globals (a --gray-500 → var(--text-muted) alias shim); ship behind a visual regression gate; document component token usage so future code starts token-first. Expect 80% adoption to be mechanical; the 20% needs designer+engineer pairing on tricky states (focus rings, disabled opacities, skeleton shimmers) to keep semantics honest.`,
      },
      {
        title: "High-contrast and accessibility modes.",
        body: `Accessibility themes are first-class themes, not afterthoughts: forced-colors mode (Windows High Contrast) honors system colors via forced-color-adjust: none and explicit forced-color-adjust tokens; increased-contrast mode swaps to AAA-contrast palette; reduced motion swaps transition durations to 0.01ms; reduced transparency replaces backdrop blurs. Name these themes deliberately (a11y-contrast, a11y-contrast-reduced-motion) and document the guarantees each provides. Every token change must keep these combos passing; add them to the audit matrix.`,
      },
    ],
    worked: [
      {
        title: "Refactor a button color to tokens.",
        body: `Before: .btn { background: #2563eb; color: #fff; border-radius: 8px; } — hardcoded, unthemeable. After: .btn-primary { background: var(--color-action-primary); color: var(--color-on-action-primary); border-radius: var(--radius-md); } — primitives map --color-blue-600 → semantic --color-action-primary → component --color-action-primary is shared; dark theme remaps to --color-blue-400 with automatic text contrast; brand themes remap accent family; the button never changes again when palette evolves.`,
      },
      {
        title: "Ship a compact density mode.",
        body: `Add --space-2: 4px → compact 2px swaps via data-density="compact"; components referencing var(--space-2..8) instantly compact; paddings, gaps, font sizes (density maps text too for data grids) all swap coherently; QA compact in forms and tables; accessibility audit still passes because compact modes keep touch targets >= 24px where interactive; ship behind user setting with default comfortable; measure support tickets and usage metrics.`,
      },
      {
        title: "Sync Figma variables with the repo.",
        body: `Designers maintain Figma variables (color/action/primary etc.) with Token Studio plugin; CI or a sync script pulls variables, converts to Style Dictionary JSON, runs build emitting CSS vars and native outputs; PRs from designer tokens changes go through the same review as code; contrast checks run automatically; breaking changes (renamed tokens) ship with aliases + deprecation warnings; design and engineering now share one vocabulary and one reviewable diff.`,
      },
    ],
    exam: [
      {
        question:
          "Why are three token layers (primitive, semantic, component) better than one?",
        answer:
          "Primitives capture values, semantics capture intent, components capture local specialization; theming remaps the semantic layer so all brands and modes update coherently, migrations alias semantics instead of rewriting components, and design and code share a stable vocabulary with one change point per decision.",
      },
      {
        question: "Why must component tokens reference semantic tokens?",
        answer:
          "To keep theming cascades intact: when the semantic value remaps (dark theme, brand swap), components following semantics update for free; referencing primitives directly freezes hue into components and defeats multi-theme scaling.",
      },
      {
        question: "What does Style Dictionary do in one sentence?",
        answer:
          "It transforms platform-agnostic token trees into per-platform outputs (CSS custom properties, Swift, Android XML, Compose) so every platform consumes the same decisions from one repository.",
      },
      {
        question: "How do you roll out tokens to a legacy codebase safely?",
        answer:
          "Introduce alias shims (legacy variable names mapped onto tokens), migrate file by file behind visual regression tests, then drop the shims in a scheduled cleanup; incremental migration with deprecation warnings keeps the codebase always working, unlike a flag-day rewrite.",
      },
    ],
    cheat: [
      "Layers: primitive → semantic → component; semantics carry intent.",
      "Names: dot-notation, lowercase, by role not hue; no theme in the name.",
      "Themes remap semantics: dark, brand, density, contrast — one attribute.",
      "Style Dictionary: one JSON tree → CSS, Swift, Android, Compose.",
      "Version tokens; deprecate with aliases; review diffs like code.",
      "a11y themes first-class: forced-colors, high contrast, reduced motion.",
      "Migrate incrementally with alias shims + visual regression gates.",
    ],
    recap: `Design tokens are the contract between design and code: JSON trees of primitives feed semantic roles feed components; Style Dictionary emits every platform; themes are remaps of the semantic layer (dark, brand, density, accessibility); names express intent not appearance; migration is incremental with aliases and visual regression gates; the token repo becomes the single source of truth, versioned like any API.`,
    code: {
      title: "A minimal token tree",
      language: "json",
      code: `{\n "color": {\n "blue": { "600": { "value": "#2563eb" } },\n "action": { "primary": { "value": "{color.blue.600}" } }\n }\n}`,
      explanation:
        "Primitive blue-600 defines the value; semantic action.primary references it; the build emits --color-action-primary; dark theme overrides the semantic mapping to blue-400, components unchanged.",
    },
    diagram: {
      title: "Token flow from design to platforms",
      caption: "One source, many outputs.",
      mermaid: `flowchart LR\n F[Figma variables] --> J[Token JSON]\n J --> S[Style Dictionary]\n S --> C[CSS variables]\n S --> I[iOS and Android]`,
    },
  },
  "web-dev-design-for-engineers-figma-to-code-fluency": {
    intro: `Figma-to-code fluency is the skill of reading a design file as an executable specification: layers, components, constraints, auto-layout, and exported assets, and turning them into clean, responsive code without cargo-culting pixel screenshots. The subject is what to extract (measurements, states, assets, content), what to negotiate (impossible or expensive layouts), and how to hand off so design and engineering converge instead of diverge. Figma is not a picture to copy, it is a spec to interpret.`,
    foundations: `Read the file like source code: frames are screens/artboards; auto-layout is flexbox; constraints are responsiveness rules; components and variants are UI kit implementations; styles (color/text/effects) map to tokens; prototypes express flows. Dev Mode exposes sizes, spacing, colors, and CSS. Measurements are relative (stack gaps, paddings, radii) not absolute pixel soup; understand the grid behind the frame. Fonts must exist in your build; images need export at scale; icons are usually SVG.`,
    concepts: [
      {
        title: "Reading the file: frames, auto-layout, constraints.",
        body: `Auto-layout maps almost 1:1 to flexbox (direction, gap, padding, align, wrap); nested auto-layout is nested flex; absolute layers are absolutely positioned exceptions. Constraints (left/right/center, top/bottom/stretch) express how elements respond to frame resize — honor them instead of fixed widths. Component variants (Button/variant=primary, state=hover) are props in disguised clothing: map them directly to your component API (variant, size, disabled). Hidden layers and opacity 0 annotations signal dev-only notes.`,
      },
      {
        title: "Extracting the spec: states, content, assets.",
        body: `Every interactive component exists in states: default, hover, focus-visible, active, disabled, loading, error, empty, selected. Capture all of them, not just default — most implementation bugs live in the undesigned states. Content: check real lengths for truncation/overflow (headers, translated strings), empty states, and skeleton placeholders. Assets: export icons as SVG (or icon font), photos at 1x/2x with modern formats (AVIF/WebP), illustrations natively wherever possible; prefer CSS for gradients, shadows, radii over baked images.`,
      },
      {
        title: "From redlines to CSS: tokens over magic numbers.",
        body: `Map extracted values onto your tokens: spacing 24 → var(--space-6); radius 8 → var(--radius-md); color #1a1a1a → var(--text-primary). If the design uses an off-scale value (e.g., 22 px), ask whether it is intentional; usually it is a gap in the scale — propose adding it to tokens rather than spreading literals. Measurements that repeat become candidates for new components; a page of identical 11 px paddings is a signal, not a spec. Translate type to your scale, colors to roles; the code then reads as if the design system wrote it.`,
      },
      {
        title: "Negotiating constraints like an engineer.",
        body: `Designs are hypotheses about implementation; some are infeasible cheaply. Common negotiations: full-bleed sticky elements overlapping scroll content (needs careful layering), filters/blurs on large surfaces (perf), per-character font pairs (FOIT/FOUT), fixed 1440 px-only frames with no mobile story, heavy illustration backgrounds (download cost), custom cursors, and complex scroll-choreography. Bring alternatives with trade-offs: same feel, cheaper build. Negotiation is bidirectional — sometimes design wins for good reason; record the decision and its rationale in the ticket.`,
      },
      {
        title: "Handoff discipline and design QA.",
        body: `Handoff is a loop: design annotates (states, redlines, tokens), engineering builds, designer compares in Dev Mode against the implementation ("design QA"), mismatches get filed as bugs with screenshots, repeat until the deltas are sub-pixel-noise. Keep a shared glossary (component names identical in both tools); measure implementation with the same scale (8 px grid) as design; never "eyeball" QA with 24 screenshots only. Ship it, then compare with real users — production is the final QA gate.`,
      },
    ],
    worked: [
      {
        title: "Convert a Figma card to a React component.",
        body: `Spec read: 3 variants (default/elevated/interactive), 12 px radius, 16 px padding (auto-layout), image top 16:9, title 20 px/600, meta 13 px muted, action bottom-right. Code: <Card variant="elevated"><img src=... loading="lazy" alt=.../><h3>..</h3><p meta>..</p><Card.Action/></Card> with CSS var tokens matching the file; hover lift via transform 2px + shadow token swap; focus-visible ring from tokens; alt text from the spec; the component matches the file without one magic number.`,
      },
      {
        title: "Handle the design that ignores mobile.",
        body: `Frame is 1440 px fixed; tables overflow at 800 px. Negotiation: propose responsive table pattern (priority columns + horizontal scroll with sticky first column, or card list transformation below 768 px). Design approves card pattern; you implement with CSS grid stacking; both record the decision in the ticket with before/after screenshots; the product ships for phones with the same content and zero redesign sprint.`,
      },
      {
        title: "Design QA a form against the file.",
        body: `Place implementation and Figma side by side in Dev Mode overlay; diff checklist: label 13 px weight 600 vs 13 px 400 mismatch (fix); error text color 2.9:1 contrast vs token danger-600 (fix to pass); spacing label-to-field 8 px vs 7 px (add --space-2 exact 8); focus ring color correct; disabled state restyled per spec; screenshot both states and close the ticket with sign-off. QA closes the loop so the next screen inherits the corrections.`,
      },
    ],
    exam: [
      {
        question: "What in Figma maps most directly to CSS flexbox?",
        answer:
          "Auto-layout: direction, gap, padding, alignment, wrap and nested stacking translate nearly one-to-one onto flex-direction, gap, padding, align/justify-content and nested flex containers; constraints express responsiveness on top of that.",
      },
      {
        question: "Why capture component states, not just the default?",
        answer:
          "Most implementation defects and most design questions live in hover, focus, disabled, loading, error and empty states; capturing them turns the spec complete, and unbuildable or undefined states surface in design review rather than in production bugs.",
      },
      {
        question: "What belongs in a redline and what does not?",
        answer:
          "Redlines specify spacing, sizes, type roles, colors as token references, states, and asset exports; they do not prescribe every implementation detail (hooks, state shape) or dictate pixels where tokens already define the value — referencing the token is the correct redline.",
      },
      {
        question:
          "How do you resolve a design that is infeasible to implement cheaply?",
        answer:
          "Bring the constraint with data (performance cost, complexity, platform limits) plus one or two concrete alternatives that preserve the intent; agree in writing on the chosen approach, with the trade-off recorded; escalate only if the core user experience is at risk.",
      },
    ],
    cheat: [
      "Read Figma like code: frames = artboards, auto-layout = flexbox.",
      "Constraints = responsive rules; honor them over fixed pixels.",
      "Variants map 1:1 to component props; states are the spec too.",
      "Extract states: hover, focus-visible, active, disabled, loading, error.",
      "Export icons as SVG; photos AVIF/WebP with 1x/2x variants.",
      "Tokenize values: spaces, radii, colors, type roles.",
      "Negotiate impossible designs with alternatives + trade-offs.",
      "Design QA loop until deltas are noise; production is the last gate.",
    ],
    recap: `Figma-to-code fluency means interpreting the file as a spec: auto-layout is flexbox, constraints are responsiveness, variants are props, styles are tokens; capture every state; export assets natively; negotiate constraints with data and alternatives; map everything onto your design system so code reads like the system; and close the loop with design QA until implementation and design agree.`,
    code: {
      title: "Constraint-driven responsive CSS",
      language: "css",
      code: `.card { display: flex; flex-direction: column; gap: var(--space-4); padding: var(--space-4); }\n@container (max-width: 480px) { .card { padding: var(--space-3); } }`,
      explanation:
        "flex-direction and gap encode the auto-layout frame; container queries react to the component context instead of the viewport; the component adapts to the space it occupies, like Figma constraints.",
    },
    diagram: {
      title: "Design-to-code loop",
      caption: "Spec, build, compare, fix.",
      mermaid: `flowchart LR\n F[Figma spec] --> B[Build]\n B --> Q[Design QA compare]\n Q --> F`,
    },
  },
  "web-dev-design-for-engineers-interaction-design-and-motion": {
    intro: `Interaction design and motion are about how the interface answers the user's actions — feedback, continuity, orientation — through transitions, springs, and gestures that make the product feel alive and trustworthy rather than sluggish or jumpy. The subject is when to animate (never decoration), how to choose durations and easings, how to keep motion accessible (prefers-reduced-motion, vestibular safety), and how to implement it performantly (compositor-only properties, layout animation). animation is communication — it shows where things come from, where they settle, and that the interface heard you.`,
    foundations: `Motion has jobs: feedback (button pressed, save succeeded), continuity (element moved from here to there), orientation (modal came from the button, list re-ranked). Timing: micro-interactions 100-200 ms; transitions 200-300 ms; complex choreography up to 500 ms; longer feels sluggish. Easing: ease-out for entrances, ease-in-out for moves, ease-in for exits, springs for playful physics (damping ratio ~0.7-0.85 for most UI). CSS transitions for simple state changes; JS/spring libraries for interruptible physics; layout animations via transform. Accessibility: honor prefers-reduced-motion; avoid full-screen parallax/flashes; never block interaction on animation.`,
    concepts: [
      {
        title: "Animation as feedback and continuity.",
        body: `Every interactive element should answer within 100 ms — hover state, pressed scale, loading spinner, success check. Continuity: shared-element transitions between list and detail; FLIP (first, last, invert, play) animates layout changes by transforming between measured positions without animating expensive properties. Continuity reduces perceived latency: a 300 ms reflow animation reads as instant, while a hard cut feels broken. Use motion to explain state changes — items reordering, cards expanding, drawers sliding from the edge they opened from.`,
      },
      {
        title: "Durations, easings, and springs.",
        body: `Durations by scope: color/opacity 100-150 ms; small moves 150-250 ms; large transitions 250-400 ms; choreography ≤ 500 ms. Enter: ease-out (fast start, gentle land); exit: ease-in (gentle start, decisive end); moves across screen: ease-in-out; bouncy outcomes (playful) only on success moments. Springs: stiffness/damping map to duration feel; slight overshoot (10-15%) reads as organic; critical damping reads as mechanical — good for enterprise, wrong for consumer delight. Asymmetric easing for asymmetry of meaning: attention-grabbing entrance faster than exit.`,
      },
      {
        title: "Accessibility and vestibular safety.",
        body: `prefers-reduced-motion: reduce must zero or shorten animations system-wide (wrap in media query); some users get nauseous from parallax, zoom bursts, and rapid multi-element motion. Keep meaningful motion but cut decorative motion. Avoid flashes (no more than 3 per second). Focus rings must remain visible during animation; do not animate focus out of existence; announce dynamic changes to screen readers (aria-live) since SR users get no motion cue. Reduced motion means reduced, not none: cross-fades and opacity remain fine.`,
      },
      {
        title: "Performance: animate the compositor.",
        body: `Animate transform and opacity only — they run on the compositor thread, skip layout and paint. Animating width/height/top/left triggers layout every frame (jank); use scale/translate instead or FLIP with transform. contain: layout paint size and will-change isolate animated subtrees; content-visibility skips offscreen work. Keep animated node count small; throttle scroll-linked animation with rAF or prefer scroll-timeline when supported. Measure with the Performance panel: scripting-heavy frames >16 ms mean animation is fighting layout; fix by promotion, not by shorter durations.`,
      },
      {
        title: "When not to animate — and honesty about it.",
        body: `Motion is not a substitute for speed. Optimize first (fetch earlier, render sooner, cache) then animate the remainder. Skip animation for: high-frequency data updates (live prices, logs), dense tables, power-user keyboard flows, anything under 100 ms anyway, and anywhere it delays a destructive or urgent action. Every animation should be skippable or fast; prefer animations that make waiting feel shorter rather than longer. If an animation ships because "it looks cool", it ships as a bug.`,
      },
    ],
    worked: [
      {
        title: "Add a save feedback micro-interaction.",
        body: `Button: on click → state pending (spinner, disabled, 150 ms ease-out scale to 0.96 and back); on resolve → success (check draw-in 250 ms, color to success); after 900 ms auto revert to default. Reduced motion: skip spinner draw, keep label change and color; no layout shift. The user gets instant acknowledgment of the action and a clear outcome — no modal, no toast pileup, no ambiguity; 600 ms total cognitive cost, zero uncertainty about whether the save landed.`,
      },
      {
        title: "FLIP-animate a reordering list.",
        body: `React list reordered after sorting: getBoundingClientRect of each card before and after render; invert via transform translate(dx, dy); play transition to 0; remove transforms after. Result: cards glide into their new positions; the user perceives order change instead of a confusing instant jump; 60 fps maintained because only transforms animate; implementation is ~30 lines; with reduced-motion, skip transform and re-render normally — same information, no motion.`,
      },
      {
        title: "Gate entrance animations behind prefers-reduced-motion.",
        body: `Wrap all entrance keyframes and transitions in @media (prefers-reduced-motion: no-preference) { ... } and default styles are static; or gate the JS spring config (stiffness 300 if no-preference else instant). Audit with the emulation flag; verify nothing breaks without motion (screenshots diff); document the rule for component authors: every new animation must ship its reduced-motion path in the same PR, checked on the review checklist.`,
      },
    ],
    exam: [
      {
        question: "Which CSS properties are cheapest to animate and why?",
        answer:
          "transform and opacity, because they are handled on the compositor thread without triggering layout or paint; animating geometry properties (width, height, top, left) forces style recalculation and layout every frame.",
      },
      {
        question:
          "What is the main accessibility requirement for interface motion?",
        answer:
          "Honor prefers-reduced-motion: reduce by replacing or removing non-essential animation; users with vestibular disorders must not receive parallax, zoom, or multi-element motion they cannot tolerate; essential feedback may remain as opacity or instant state changes.",
      },
      {
        question: "How does FLIP animation avoid layout thrashing?",
        answer:
          "Measure positions before and after the state change, then animate only the transform between the two snapshots; the browser does one layout for measurement instead of per-frame layout; the visible motion is indistinguishable from layout animation but cheap.",
      },
      {
        question: "When should an animation be cut entirely?",
        answer:
          "When it delays an urgent action (destructive confirm, error recovery), when it plays on high-frequency updates (live data, typing), when it exists purely for flair without informing, or when it pushes frame time past the input budget — static UI is always an acceptable fallback; motion must pay for itself in orientation or feedback.",
      },
    ],
    cheat: [
      "Animate transform + opacity only; compositor thread, no layout.",
      "Durations: 100-150ms micro, 200-300ms UI, <=500ms choreo.",
      "Entrances ease-out; exits ease-in; moves ease-in-out; springs for play.",
      "Feedback < 100ms: pressed, hover, success, error acknowledged.",
      "prefers-reduced-motion: reduce must kill non-essential motion.",
      "FLIP for layout changes; measure, invert, play.",
      "Never animate width/height/top/left; no animating focus rings away.",
      "Motion explains: where it came from, where it settled, that you were heard.",
    ],
    recap: `Interaction motion is communication: instant feedback, continuous orientation, and restraint; durations under 300 ms for UI, eased by direction, springs only for playful payoff moments; reduced-motion users are first-class; performance means animating transform and opacity while the compositor does the work; and every animation earns its existence by explaining state, never by decorating it.`,
    code: {
      title: "Reduced-motion-safe transition",
      language: "css",
      code: `@media (prefers-reduced-motion: no-preference) {\n .card { transition: transform 200ms ease-out; }\n .card:hover { transform: translateY(-4px); }\n}`,
      explanation:
        "Motion exists only for users who have not requested reduction; hover lifts four pixels with a quick ease-out; reduced-motion users get the static card with identical function.",
    },
    diagram: {
      title: "Anatomy of a transition",
      caption: "Trigger, animate, settle, idle.",
      mermaid: `flowchart LR\n T[Trigger] --> A[Transition]\n A --> S[Settle]`,
    },
  },
};

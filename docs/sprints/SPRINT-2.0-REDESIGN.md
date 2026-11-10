# EduSwarm — The Complete Redesign (Sprint 2.0)

**Status: PLAN FOR REVIEW — do not execute before sign-off.**
**Author of plan:** engineering (with the research findings below, gathered from Astryx (Meta's design system), the Mobbin Education catalog, and current (2026) EdTech product design analysis).
**Mandate (user, 2026-11-10):** “The complete app gets a completely new look — cool, fun. It’s fine to take more time; everything one by one, end to end, thoroughly, researched, with design inspirations.” Also: treat this as the finished product, not a demo. Mobile app first (bottom tab bar; 390px viewport).

---

## 1. Where we are today (honest audit)

- **App:** single-page React SPA (`apps/web`), hand-rolled CSS (1,072 lines, cream/violet/ink palette, Google Fonts @import at runtime, `.card` shadows, custom mobile bottom nav).
- **Function:** real; onboarding, Google sign-in, guest reverse-trial, search palette, learning universes, lessons (local-first), flashcards, practice hub, PYQ drills, library, discussions (seeded + live), profile with avatar/XP/badges, achievements, weekly analytics.
- **Design quality:** “competent but generic student project.” No design system, no token discipline, dark mode absent, motion ad-hoc, typography unstyled, spacing arbitrary, no accessibility review, no consistency gate.
- **The two screens the user named as the targets:** Profile and Discussions — both structurally in place, both visually undistinguished.
- **New constraint honored:** React 18 → 19 upgrade + **Astryx** (Meta's open-source design system, 8 years inside Meta, 13,000+ apps, React 19 + StyleX, 150+ a11y-engineered components, 7 themes, MIT, Beta). Installed locally; verified working. The redesign is built on it, not on hand-rolled CSS overrides.

## 2. Design research & what we take

### Inspiration — top EdTech (what they do right, and we will steal the *principles*, not the branding)

| Product | Strength to adopt |
|---|---|
| **Duolingo** | Mascot as emotional engine; streak = loss-aversion engine; micro-celebrations (confetti, cheeky copy); one screen, one job; thumb-reach tab bar; lessons chunked; XP visible always |
| **Brilliant** | Visual-first lessons; progress/engagement baked into layout, not chrome; strong single accent (orange); Progress indicator built into the lesson view; “one question, one action” rhythm |
| **Khan Academy** | Clean scope/mastery per unit; breadcrumb clarity; (we already have the syllabus-universe model — surface it); clear typography hierarchy |
| **DataCamp** | Professional playfulness — code-first dark IDE surfaces with friendly color; good for our AI/ML universe |
| **Linear / Ramp / Clerk** | Neutral-derivative premium look: one accent, disciplined neutral ladder, hairline borders, low-radius precision, generous whitespace, eyebrow labels, total clarity — the anti-“student project” register |
| **Bounce (Atlassian)** & **Stripe Press aesthetics** | Depth via layering, not gradients; editorial layouts; strong type pairing |

### 2026 product design trends (external research)

- **Dark-first / mode-everywhere:** not “dark mode toggle as courtesy” — first-class, automatic, and bespoke for late-night study.
- **Typography as product:** display faces with personality + boring body workhorse; kinetic type on hero moments only.
- **Design engineering = component systems:** Meta’s Astryx (shipped publicly from the inside — its lessons are the definitive 2026 system playbook) — pre-built accessible primitives beat bespoke CSS.
- **Mobile-first interaction:** 44–48px touch targets, bottom nav with notch-safe spacing, bottom sheets for composers, haptic-like press states (100 ms), reduced-motion respected.
- **Emotional design with restraint:** mascot reactions + tiny delight moments only at milestones; everything else crisp and quiet. Review gate against “Disney-slide into circus.”
- **Dopamine hierarchy:** flame/streak → XP ring → mastery bar — three, max. Everything else is supporting text.

### Internal inspiration (already in the repo, to be restyled not rebuilt)

- **Doddly** (mascot) — keep; promote from “loading mascot” to *the* brand character (hints of duo, hints of Du*olingo*, none of the copyright).
- Universe theme per learning goal (GATE / Full-stack / AI-ML) — keep; turn into **deep thematic identity per universe** (color + hero illustration + celebratory motif), because the app already has this hook.

## 3. Design principles (battle-tested order of precedence)

1. **Mobile is the product, desktop is the projection** — every decision is made at 390×844 first; desktop is gain, never loss.
2. **One screen, one job** — every page answers “what am I doing *right now*”; secondary goals live behind one tap.
3. **Read like a magazine, act like a game** — editorial long-form reading + game-loop rewards (Streaks/XP/mastery).
4. **Color is information** — 2 brand hues max + semantic set; never color-alone meaning; contrast ≥ AA everywhere, including dark.
5. **Progress is always visible** — XP ring / mastery bar / streak flame on every load; silence kills motivation.
6. **Emotion earned, not sprayed** — mascot/celebration only on milestones (level-up, streak save, first payout-level moment).
7. **Micro-delight, macro-clarity** — 150 ms micro-interactions only where meaning; never animation-for-animation.
8. **Zero orphaned states** — every empty state teaches, every loading state has personality-in-line, every error has a next step.
9. **A11y is correctness** — keyboard, reduced-motion, 4.5:1, labels, 44px targets. Astryx ships a11y-engineered primitives; we build on them, not around them.

## 4. Design system decision (locked by user 2026-11-10)

- **Astryx (`@astryxdesign/core`) is inspiration, not a dependency** — locked, per explicit user decision ("astryx is for inspiration, take what's good and great for our app"). We keep React 19; no Astryx packages in the bundle. We borrow its architecture (tokens-first, layered reset, ports/adapters styling, dark-mode-native paths) and re-implement with vanilla CSS that is as good or better — never lazy override hacks.
- **Build a token system, not a CSS hack:** `src/design/tokens.css` is the single source of truth (grounds, ink, accent, pop, semantics, spacing, radii, type scale, motion). Light-first rendered default; **dark mode is authored, complete and first-class** (not a filter trick — separate token set under `[data-theme="dark"]`, OS-preference fallback, FOUC-free boot script in `index.html`).
- **Stage approach:** chrome restyled first (topbar, sidebar, bottom dock, avatar, guest note); then every screen migrates to tokens one by one — Home → Lesson → Profile → Discussions → Practice → Flashcards → Library → Onboarding → Landing.

## 5. Brand & visual direction (proposed, for review)

**Name & identity credo:** “EduSwarm — learn together, and it sticks.” Doddly = the character. Vibrant-dopamine serious: *fun surface, serious spine.*

**Palette (custom `theme-eduswarm` on Astryx `neutral` base):**

| Role | Light | Dark | Notes |
|---|---|---|---|
| Ground (`--color-background-root`) | `#FFFDF9` warm off-white | `#131118` warm near-black | never cold pure black |
| Surface (`--color-background-surface`) | `#FFFFFF` | `#1C1A24` | cards/sections |
| Raised surface | `#F7F5EF` | `#242230` | inputs, insets |
| Ink (`--color-text-primary`) | `#1E1B2E` | `#F2EFF7` | |
| Accent (`--color-accent`) | `#6D3DF0` (violet-600) | `#8B5CF6` | focus, primary action, streak |
| Accent-strong | `#5A2BDD` | `#A78BFA` | hover/press |
| Pop/`--color-accent-pop` | `#B7F14B` (lime) | `#C6FF5E` | celebration, XP ring fill |
| Warm support | `#FF9F6B` (peach), `#FFE285` (yellow) | same family, darker-tinted | mascot moments, banners |
| Semantic | success `#18A957`, warning `#B95F0B`, error `#D0342C`, info `#2563EB` | lightened derivations | AA-checked |

**Radii:** base 4px (Astryx `radius-md`), cards 12–16px, pills 999; **shadows:** low/medium; hairline 1px borders (`--color-border`) are the workhorse, shadow reserved for primary CTA.

**Motion:** expressive character (tiny overshoot), crisp entrances; confetti only on milestones; celebration ring pulse; mascot squawk on level-up; **`prefers-reduced-motion` fully honored**.

**Iconography:** Astryx/Lucide for UI; Doddly rendered in 2-4 poses (wave, cheer, study-owl) as static SVG, no runtime mascot animation cost.

## 6. Screen-by-screen rebuild (execution order, one by one, end-to-end each)

For every screen: (a) rebuild with Astryx components; (b) state coverage (loading / empty / error / guest / first-run); (c) 390px pass, 1440px pass; (d) a11y pass (keyboard, focus-visible, reduced-motion, contrast, labels); (e) Lighthouse ≥ 90 performance on throttled CPU; (f) screenshot set saved to `docs/sprints/evidence/redesign/`.

| # | Screen | Scope of rebuild |
|---|---|---|
| 1 | **Brand + App shell** | `theme-eduswarm`; Astryx CSS layers wired; AppShell (SideNav desktop + MobileNav bottom tabs), TopNav, AvatarMenu → dropdown, Cmd-K palette → `CommandPalette` or custom Astryx-styled palette; guest banner; Loading states; route transition micro-motion |
| 2 | **Home / Today** | Mission-of-the-day hero; streak flame + XP ring; plan card; weekly chart (Astryx-styled chart); empty-state onboarding hand-off; universe switcher as `SelectableCard`s |
| 3 | **Lesson (reading view)** | Typography editorial: 75ch measure, section number spine, code blocks with copy+lang chip, cheat sheet as sticky card, progress bar sticky on scroll; keep the authored-pack shape (verification from content sprints) |
| 4 | **Profile** | Keep function, gut the look: XP ring + level, join date, PR-style stats row (Chapters · Streak · XP · Badges), tabs → Astryx `TabList`, achievements grid → Astryx `Grid` + unlocked/locked badges w/ criteria, saved readings, settings sheet restyled as BottomSheet |
| 5 | **Discussions** | Astryx `Chat/ChatLayout/ChatComposer` for composer; list layout; post cards; topic filter chips; sort segmented control; resolve flow; guest gate as BottomSheet; seeded + moderation states |
| 6 | **Practice/Drills** | MCQ ergonomics (big targets, instant feedback, explanation reveal, keyboard 1-4), PYQ source chips, mistakes → repair panel |
| 7 | **Flashcards** | 3D flip is kept (it’s good), rest re-skinned to system |
| 8 | **Library** | Card-grid template (Astryx `template library` as a scaffold) — Reading Room |
| 9 | **Onboarding** | First-run-only; diagnostic flow restyled; universe select as 3 SelectableCards |
| 10 | **Landing/Sign-in** | dark-first hero, Doddly, three-universe carousel, proof points; Guest CTA |
| 11 | **Progress · Mistakes · Plan** | share-a-dashboard, XP bars (mastery), repair flow |

## 7.5 Execution constraints locked by user (2026-11-10)

- **Astryx removed as a dependency** (package.json clean) — inspiration only; reimplement component ideas natively with vanilla CSS at Astryx-grade quality or better; never regress to "student project CSS".
- **Build is authoritative:** `npm run build` (React 19 + token system) is green; guest value props intact; no demo/prototype shortcuts — every screen ships end-to-end.
- **Verification reality (environment):** the MCP browser and in-app panel cannot reach this dev server (HTTP 403/timeout); verification this sprint is `npm run build` + API health checks; visual screenshots at 390/1440 must be taken when the app runs on a reachable host; nothing visually "done" is claimed without them.
- **The Plan is binding:** Phase order Shell → Home → Lesson → Profile → Discussions → Practice/Flashcards/Library → Landing/Onboarding → polish/a11y/perf. Each phase: `npm run build` green + screenshots at 390/768/1440 (when browser available) + a11y pass before moving on.

- Keep current app running at every step (each screen replaces one route at a time); **no big-bang rewrite**.
- New theme built + previewed via Storybook? **No Storybook dependency** — proof via real route + Playwright screenshot.
- `styles.css` is **drained, not edited**: new code lives in `astryx.css` + component files; old classes (`.card` etc.) get deleted only when their last consumer migrates.
- App remains functional offline; CI runs `npm run build`, `check:lessons`, existing tests; verify each phase with screenshots at 390/768/1440.

## 8. Research-backed decisions & trade-offs (explicit)

- **Astryx over Tailwind/custom:** a11y-engineered, 13k-app battle-tested inside Meta, ships pre-built CSS/JS (no plugin work), CLI-driven authoring w/ agent tooling, dark mode native, our React 19 upgrade was already done. Cost: Beta, design decisions inherited (we accept with custom theme + swizzle as escape hatch).
- **Light-first with full dark mode** (not dark-first): Indian exam cohort skews light-glass exam apps; dark mode is bespoke for late-night sessions. Duolingo is light-first globally.
- **Keep single-page React + Vite** (not Next.js): existing architecture is sound and API is colocated; SSR adds nothing for a logged-in study app; PWA is already terminally valid there (view-source realities).
- **Space Grotesk + DM Sans, keep both** — already loaded; Space Grotesk has the “exam-sharp but playful” edge the brief wants; DM Sans is the perfect body workhorse; Astryx `typography.scale` map used, not raw px.
- **No emojis as icons** — retire all ✦/⌂/❖ etc. in favour of Astryx Icon semantic names + Lucide.
- **Mascot:** Doddly reframed into persistent brand avatar + milestone messages only.

## 9. Risks we accept & mitigations

| Risk | Mitigation |
|---|---|
| Astryx Beta changes APIs | Pin version; CLI docs are the source of truth; swizzle the 2-3 components we heavily customize |
| React 19 ecosystem mismatch (framer-motion v13, mermaid v12) | Both verified compatible on 19.x; frozen at current majors; smoke-run flashcards/mermaid in CI locally via `yarn build && node dist/server.js` |
| Reset layer fighting current hand-rolled CSS | Astryx layers sit at the bottom; migrate screens; delete dead classes |
| Scope creep of “cool & fun” into circus | The three-dopamine rule: streak, XP, mastery — nothing else counts as fun; the rest competence-forward |
| Performance regressions from rich theme | Lighthouse gate ≥ 90 on mobile throttling; no mascot at idle render cost |

## 10. Sequencing & effort (note: this is a large program — items ship complete, not partially)

- **Phase 0 — Theme + shell** (1 screen “AppShell + theme-eduswarm + bottom nav”, dual viewport) — foundation for everything after.
- **Phase 1 — Home + mobile bottom bar** (the mission/rings/streak screen — the highest-leverage emotional surface).
- **Phase 2 — Lesson view** (the highest-leverage reading surface).
- **Phase 3 — Profile** (with XP/level/achievements restyled).
- **Phase 4 — Discussions** (with Astryx Chat components).
- **Phase 5 — Practice, Flashcards, Library**.
- **Phase 6 — Landing/Sign-in + Onboarding**.
- **Phase 7 — Dark mode QA + a11y audit + performance budget + motion polish** (a dedicated “polish pass” after all screens exist).

Each phase ends with: `npm run build` green, screenshots at 390/768/1440 attached to evidence, tests green, and review sign-off before the next phase starts.

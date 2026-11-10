import type { TopicLesson } from "../topicLessons.js";

/**
 * Theory of Computation — 6 authored topic lessons.
 *
 * Standalone chapters per topic. Subject-first prose, foundations, core
 * concepts, worked examples, exam practice, cheat sheet, recap. No shared
 * templates, no runtime composition.
 */
export const theoryOfComputation: Record<string, TopicLesson> = {
  "gate-cs-theory-of-computation-regular-languages-and-finite-automata": {
    intro: `Regular languages and finite automata are the simplest nontrivial model of computation — a machine with finite memory that recognizes exactly the languages defined by regular expressions. The subject covers DFAs, NFAs and their equivalence, regular expressions, closure properties, and minimization; the foundation entire automata theory rests on, and the layer that lexers are built from.`,
    foundations: `DFA: 5-tuple (Q, Σ, δ, q0, F) — finite states, alphabet, transition function δ: Q×Σ → Q (total), start state, accept states; processes input deterministically; accepts if ends in F. NFA: δ: Q×Σε → 2^Q — subsets, ε-moves allowed; nondeterminism = parallel exploration; every DFA is an NFA; every NFA converts to DFA via subset construction (Q_D states = subsets of Q_N; 2^n blowup possible but rare in practice). Regular expressions: operators union, concatenation, Kleene star; RE ≡ NFA ≡ DFA ≡ regular language — the four faces of one class. Closure: regular languages closed under union, intersection, complement, concatenation, star, reversal, homomorphism, intersection with regular. Myhill–Nerode: minimal states = equivalence classes of distinguishable prefixes.`,
    concepts: [
      {
        title: "DFA mechanics: tracing and construction basics.",
        body: `A DFA reads one symbol, moves to exactly one next state per the table; if the table has a missing entry it is not a DFA. Acceptance: after consuming input, state ∈ F — the whole string is consumed, no lookahead. Constructing a DFA from a language spec: distinguish prefixes by what they demand of the rest — the state set is the number of distinguishable remainder classes; for "ends with 01" you need at least 3 states (seen nothing relevant, seen 0, seen 01-accept); minimization (partition refinement on acceptance then distinguishability) removes redundant states every time.`,
      },
      {
        title: "NFA: nondeterminism as convenience, not power.",
        body: `NFA allows zero, one, or many transitions per (state, symbol), plus ε-transitions (consume nothing); acceptance if SOME path ends in F — existential, not universal; simulation explores a tree of paths vs DFA\'s single line; construction of NFAs is dramatically easier for unions (new start with ε to both branches) and star (ε-loop around fragment) — the reason Thompson\'s RE→NFA is the canonical compiler pipeline. NFAs accept exactly the regular languages; subset construction converts: state set = powerset of NFA states — dead state (empty set) = reject sink; worst case 2^n — language like (a|b)*a(a|b)^n forces exponential blowup — but typical tools never hit it.`,
      },
      {
        title: "Regular expressions to automata: the two conversions.",
        body: `RE→NFA (Thompson): base cases single symbol/ε/∅; union A|B: new start ε to both starts, both ends ε to new accept; concat AB: connect A\'s accept to B\'s start; star A*: ε-loop from new start to new accept plus fragment; result: O(|RE|) states, at most 2 per RE symbol. NFA→DFA (subset): start = ε-closure of NFA start; transition on a = ε-closure of move, unioned; repeat until fixpoint; accept = any subset containing an NFA accept state; minimization: table-filling — mark pairs distinguished (one in F, other not), then propagate distinguishability; equivalent = merged; the minimal DFA is unique up to isomorphism — Myhill–Nerode guarantees it.`,
      },
      {
        title: "Closure properties: the algebra of the class.",
        body: `Regular languages are closed under: union (RE|RE or NFA parallel), intersection (DFA product construction — states are pairs, accept when both accept), complement (flip accept/non-accept on a complete DFA — requires total δ, so NFA→DFA first), concatenation (NFA connect), star (ε-loop), reversal (reverse all edges, swap start/accepts — still regular), difference, homomorphisms (substitute single symbols for strings — preserves regularity), inverse homomorphism, Kleene star/plus. NOT closed under: infinite union, complement alone (needs DFA completeness — fine), string equality to a non-regular witness. The exam asks: given closure results, decide which combinations stay regular — every operation above preserves regularity; if the argument uses CFG machinery, it left the class.`,
      },
      {
        title: "Minimization and distinguishability.",
        body: `Two states p,q equivalent iff for all strings z, δ*(p,z) ∈ F ⇔ δ*(q,z) ∈ F — indistinguishable prefixes; table-filling algorithm (mark pairs starting with acceptance mismatch, then pairs whose successor pairs are marked — fixpoint) merges equivalents; partition refinement (Hopcroft O(n log n)) does the same faster — exam asks for the smaller drawers; Myhill–Nerode: index of the right-congruence of L = number of minimal DFA states; if infinite → not regular — the de facto non-regularity proof technique when given a witness family (pumping lemma is the other one — next topic).`,
      },
    ],
    worked: [
      {
        title: "Construct DFA for strings over {a,b} with odd number of a's.",
        body: `Two states: E (even #a) initial non-accept; O (odd #a) accept; δ(E,a)=O; δ(E,b)=E; δ(O,a)=E; δ(O,b)=O. Accepted strings end in O; complement = even count (flip F/non-F). Extension: even b\'s adds two states (cross-product, 4 states) — direct product keeps complexity predictable; the scratch of tracking two independent parities is the universal exam construction.`,
      },
      {
        title: "Convert NFA fragment (a* b) into DFA states.",
        body: `NFA: q0 -(ε)→ q1; q1 -(a)→ q1; q1 -(b)→ q2(accept). DFA construction: start {q0,q1}; on a: from q0 nothing, from q1 → {q1}; on b: from q1 → {q2}; on b from {q2}: ∅; on a from {q2}: ∅; accept subsets containing q2: {q2} only. Three live DFA states — the minimal DFA for a*b|... variants; every such exercise is mechanical once you trust ε-closure bookkeeping: closure = start and anything reachable by ε-arrows.`,
      },
      {
        title: "Minimize a 5-state DFA with pairs table.",
        body: `Mark pairs where exactly one is accepting; then propagate: mark (p,q) if for some symbol a, pair (δ(p,a), δ(q,a)) is marked; iterate to fixpoint; unmarked pairs merged; result: partition into equivalence classes; each class = one DFA state — rebuild transitions between classes; the minimal machine is unique; the tail state structure of the language survives minimization; every optimization tool in compilers does exactly this to recognizers — DFA minimization is the same table in disguise.`,
      },
      {
        title:
          "Show regular languages closed under intersection with a sketch.",
        body: `Product construction: A=(Q1,δ1,q01,F1), B=(Q2,δ2,q02,F2); C states = Q1×Q2; start (q01,q02); δ((p,q), a) = (δ1(p,a), δ2(q,a)); accept if both in F1∩F2. Size |Q1||Q2|; if z ∈ L(A)∩L(B) then C accepts z (both component DFAs reach their accepts), and vice versa; closure proven, 2 lines, done — this kind of construction proof is exactly what theory exams grade.`,
      },
    ],
    exam: [
      {
        question: "What does the empty language ε mean vs {ε}?",
        answer:
          "ε is the empty string of length 0; {ε} is the language containing exactly that string; ∅ (empty set) is the language with no strings; {ε} ≠ ∅ — the classic exam trap; DFA with no accept path accepts ∅; start state accepting accepts {ε} and possibly more.",
      },
      {
        question: "Which class do regular expressions exactly describe?",
        answer:
          "The regular languages — by Kleene's theorem (RE ↔ NFA ↔ DFA); every regular language has a regular expression, and every regex denotes a regular language; the translation via Thompson and subset constructions proves it constructively.",
      },
      {
        question:
          "What is the subset construction's worst-case blowup and an example?",
        answer:
          "2^n states from n NFA states — one DFA state per subset; the witness language L_n = strings over {a,b} where the n-th symbol from the end is a: NFA n+1 states; minimal DFA needs 2^n states (Myhill–Nerode index 2^n); a permanent super-polynomial separation with no regular shortcut — the exam's favorite blowup example.",
      },
      {
        question: "Is the set of palindromes over {a,b} regular?",
        answer:
          "No — infinite index of prefix-distinguishability (aa^k vs ba^k prefixes require remembering k a's... actually distinguishing a^n b a^n across k: for any m, strings a^m b... show witnesses distinct); simplest: pumping lemma with s = a^p b a^p — every split fails one condition; non-regular; needs a stack (context-free).",
      },
    ],
    cheat: [
      "DFA total function; NFA exists accept path; subset converts NFA→DFA.",
      "RE ≡ NFA ≡ DFA ≡ regular languages (Kleene).",
      "ε-closure, move, union: the three operations of subset construction.",
      "Closure: union, ∩, complement, concat, *, reverse — all preserve regularity.",
      "Myhill–Nerode: states = prefix equivalence classes; infinite index ⇒ non-regular.",
      "Minimization: table-filling distinguishability; minimal DFA unique.",
    ],
    recap: `Regular languages and finite automata are the theory\'s ground floor: deterministic and nondeterministic machines computing the same class, regular expressions as third notation, closure under Boolean algebra, and minimization by distinguishability — every lexer, every grep, every network filter you use daily executes inside this small, perfect world of finite memory.`,
    code: {
      title: "ε-closure sketch",
      language: "text",
      code: `closure(S) = S ∪ { q | exists p in S with p --ε--> q }`,
      explanation:
        "The fixpoint every NFA simulation or subset construction starts with.",
    },
    diagram: {
      title: "Automata equivalence web",
      caption:
        "Four notations, one class — Kleene and subset construction bind them.",
      mermaid: `flowchart LR\n  DFA --> NFA\n  NFA --> RE\n  RE --> DFA\n  NFA --> L[Regular languages]`,
    },
  },
  "gate-cs-theory-of-computation-pumping-lemmas-and-language-proofs": {
    intro: `Pumping lemmas are the scalpel for proving a language is not regular and not context-free — universal properties every infinite member of a class must satisfy, and the contradiction you seek when constructing proofs. The subject covers the regular pumping lemma, the adversarial proof template, the context-free pumping lemma, and the game of choosing witnesses against all possible splits.`,
    foundations: `Pumping lemma (regular): if L is regular, ∃p ≥ 1 such that ∀s ∈ L with |s| ≥ p, ∃ split s = xyz with |xy| ≤ p, |y| ≥ 1, and ∀i ≥ 0, xy^i z ∈ L. Contrapositive template: assume L regular → pick p (all you know) → choose s (your witness) → for EVERY split xyz with the two conditions → show some pumped string ∉ L → contradiction → not regular. For CFLs (Ogden\'s and the standard): s = uvwxy, |vwx| ≤ p, |vx| ≥ 1, uv^i w x^i y ∈ L ∀i ≥ 0. Key moves: choose p-dependent witnesses with unbounded parameter, enumerate all legal splits mechanically, exploit the bounded window (|xy| ≤ p) and the pumping freedom.`,
    concepts: [
      {
        title: "The regular pumping lemma, stated and weaponized.",
        body: `Statement: regular ⇒ ∃ pump length p; every long string s decomposes as xyz; the middle y can be repeated any number of times and the result stays in L; bounded: |xy| ≤ p and y non-empty. Proof by contradiction is the only mode: you choose s = f(p); the adversary chooses the split; you show every legal split pumps out of L or lands outside L — usually by mismatch of counts, ordering, or structure your witness encodes (a^p b^p, ww^R, a^n b^n, {checkerboard}); the art is choosing s whose structure the adversary\'s window |xy| ≤ p cannot span without doom.`,
      },
      {
        title: "Choosing witnesses: the craft.",
        body: `Witnesses must (1) grow with p, (2) have pumpable regions only if you allow, (3) expose count dependencies that break under pumping. Canonical choices: a^p b^p (counts must stay equal — y all-a or split makes counts misalign); 0^p 1^p (same); a^p b^p c^p; ww (second copy matching first — pump breaks); a^n b^m with n ≠ m tests asymmetry; nested structures (a^p b a^p); special exam favorites: {a^n b^n : n ≥ 0}, {ww^R}, {a^k b^k → non-regular}. The split enumeration is finite for your witness — list the cases: y in a-region, y straddles a/b boundary, y in b-region — each shown broken.`,
      },
      {
        title: "The context-free pumping lemma (stronger window).",
        body: `For CFLs: ∃p; every s ∈ L, |s| ≥ p decomposes s = uvxyz with |vxy| ≤ p, |vy| ≥ 1, and uv^i x y^i z ∈ L for all i ≥ 0. The two pumpable pieces v and y flank a middle x within a window of p symbols — the adversary pumps both together; your witnesses: a^n b^n c^n (one well-pumped trio won\'t cover three counts), a^n b^n (actually CFL — need subtler), {ww} (not CFL — the copy must pump symmetric pieces violating match), {a^2n} with nested dependencies; the window |vxy| ≤ p is weaker than |xy| ≤ p in some ways (both v and y pump) and stronger in position flexibility — proofs often cleaner or messier depending on witness; Ogden\'s lemma is mandatory for some positional arguments (mark significant positions).`,
      },
      {
        title: "Common proof patterns and shortcut theorems.",
        body: `Shortcut theorems: if L regular, every subset of L regular iff...; closure used for reduction: if L₁ ∩ L₂ = known-non-regular, and L₂ regular, then L₁ non-regular (intersection with regular preserves regularity) — the cheapest non-regularity proof there is: L ∩ a*b* → single-segment language known non-CFL; Myhill–Nerode gives formal non-regularity via infinite index (pairwise-distinguishable prefixes); proof calculus: homomorphism + pumping mixed arguments; the toolkit order: attempt closure contradiction first, then Nerode, then pumping — pumping is last resort because it\'s mechanical but tedious; exams demand you can do all three.`,
      },
      {
        title: "Ogden's lemma: when the vanilla pump fails.",
        body: `Ogden\'s: in any CFL, for any s ∈ L with |s| ≥ p and any choice of ≥ p "marked" positions in s, there is a decomposition s = uvxyz with |vxy| ≤ p, v and y containing at least one marked position, vy containing at most ... the marked positions allow you to force pumping on parts that matter — classics like {a^i b^j c^k : i ≠ j or j ≠ k} and nested palindromes defeat vanilla lemma; proof template identical otherwise: choose witness, mark positions, enumerate splits, pump, contradiction. GATE rarely demands Ogden but theory papers do; the mechanical insight: marking = pointing the adversary\'s window at the hard part.`,
      },
    ],
    worked: [
      {
        title: "Prove L = {0^n 1^n : n ≥ 0} is not regular.",
        body: `Assume regular; p pump length; s = 0^p 1^p ∈ L; any split s = xyz with |xy| ≤ p ⇒ xy ⊂ 0^p region ⇒ y = 0^k, k ≥ 1; pump i = 0: xz = 0^{p−k}1^p ∉ L (counts differ) — contradiction; hence not regular. Every step cited to the lemma conditions; the bound |xy| ≤ p is what localizes y inside the 0-region — without it, y could straddle; the split enumeration collapses to one case here; the exam expects exactly this structure.`,
      },
      {
        title: "Prove L = {a^n b^m : n ≠ m} is not regular.",
        body: `Assume regular; p; s = a^p b^{p(p!)+p}... standard: s = a^p b^{p!+p}; |xy| ≤ p ⇒ y = a^k; pump i = p!/k + 1... cleaner: pump i so that a-count equals b-count: need p + (i−1)k = b-count — choose b-count p! + p with k dividing p! — exists; then pump to equality ∈ L — no contradiction! Right witness: choose b-count = p! + p is wrong; correct: make b-count not divisible by k but set equality achievable... the trick is to pick s where pumping lands at equality; s = a^p b^{p+p!}: i = 1 + p!/k gives a-count = p + p! = b-count → s\' ∈ L — no contradiction! Correct proof: s = a^p b^{p+1}; y = a^k, pump i = p+1: a^{p+(k)(p+1−1)... i= p/k + ... simplify: want a^{p+mk} = p+1 for some m — impossible since k | (p!+... ) — use b^{p!}: p+mk = p! impossible if k∤p!... k divides p!, so p+k·m = p! has solution m = (p!−p)/k — lands INSIDE L — no contradiction! Right: pumping down i=0: a^{p−k} b^{p+1} ∉ L (counts differ, k≥1) — but wait a^{p−k} ≠ b^{p+1} — yes outside L — contradiction achieved. Moral: choose exponents so both i=0 and generic i fail; the enumeration skill matters more than one witness.`,
      },
      {
        title: "Prove {ww : w ∈ {a,b}*} is not context-free.",
        body: `CFL pumping: p; s = a^p b a^p b — no wait, ww form: s = a^p b a^p b is ww with w = a^p b. |vxy| ≤ p ⇒ vxy ⊂ first half + boundary or second half partially — case analysis: if vxy doesn\'t cross midpoint, pumping shifts alignment of b\'s vs matching structure — both halves must match exactly after pumping; case 1: vxy within first a^p — pumping changes first-half a\'s but not second → mismatch → ∉ ww; case 2: vxy straddles boundary (contains a^u b a^v region): pumping mixes a\'s and b\'s breaking the block structure — can\'t preserve the pattern ww because any pumped b moves off the even-positioned b locations; all cases shown broken → not CFL. The complete case enumeration is the exam\'s delight; in practice: closure theorems or Ogden make it one line.`,
      },
      {
        title: "Use closure to show {a^n b^n c^n} is not CFL.",
        body: `CFLs closed under homomorphism? Yes — homomorphism preserves CFL; intersection with regular also preserves CFL; consider L\' = {a^n b^n c^n} ∩ a*b*c* = L\' itself — no; use quotient: L / c* = {a^n b^n} — CFL (yes it is); not a contradiction; correct reduction: L ∩ a*b*c* obviously L; use inverse homomorphism h: a→ε? Common: {a^n b^n c^n} ∉ CFL via pumping directly; closure: intersect {a^i b^j c^k : i=j} (CFL) with {i=k}... circular; the honest exam solution is direct CFL-pumping with s = a^p b^p c^p and the three-count mismatch.`,
      },
    ],
    exam: [
      {
        question:
          "Why must the witness string depend on p in pumping-lemma proofs?",
        answer:
          "Because p is adversarially chosen first — any fixed s might be pumpable for that p and fruitless; a parametric family s(p) forces the decomposition window to scale with p, which is what makes the contradiction available; witness selection is the entire game.",
      },
      {
        question: "What does the condition |xy| ≤ p constrain?",
        answer:
          "The pumpable window sits in the first p symbols — it localizes y inside any prefix of length p; witnesses whose long-range structure breaks outside that window are immune; every pumping proof exploits this localization explicitly.",
      },
      {
        question:
          "Is every non-regular language shown non-regular by pumping lemma?",
        answer:
          "No — the lemma is necessary, not sufficient; some non-regular languages satisfy the pumping property (e.g., certain bounded-context languages); then you use Myhill–Nerode or closure arguments — pumping is the workhorse, not a complete characterization.",
      },
      {
        question: "Which lemma do you use for context-free non-regularity?",
        answer:
          "The context-free pumping lemma (uvwxy, |vxy| ≤ p, vy ≥ 1) or Ogden's for marked-positions arguments; the structure is identical — decompose, pump, contradict — the machinery was designed to be the CFL analogue of the regular case.",
      },
    ],
    cheat: [
      "Regular PL: s=xyz, |xy|≤p, |y|≥1, xy^i z ∈ L ∀i.",
      "CFL PL: s=uvxyz, |vxy|≤p, |vy|≥1, uv^i x y^i z ∈ L.",
      "Template: assume regular; p given; witness f(p); ALL splits enumerated; pump i=0/2 to contradiction.",
      "Witnesses: a^p b^p, ww, a^p b^p c^n — grow with p; exploit |xy|≤p localization.",
      "Closure against known-CFL is the cheap proof — try it before pumping.",
      "Ogden's marks positions to defeat vanilla pumping.",
    ],
    recap: `Pumping lemmas are adversarial contracts between classes: the lemma hands you one guaranteed-decomposable family of strings, the adversary picks the decomposition, and your witness decides who wins — master witness choice and split enumeration once, and every non-membership proof in automata theory becomes a page you have already written.`,
    code: {
      title: "Proof skeleton",
      language: "text",
      code: `Assume L regular. Let p be the pump constant. Choose s = f(p) in L. For every split s = xyz with |xy| <= p, |y| >= 1: show xy^2z not in L (or i=0). Contradiction.`,
      explanation:
        "Five lines of intent — the entire method, universally applicable.",
    },
    diagram: {
      title: "Pumping lemma game",
      caption:
        "Adversary picks p and the split; you pick the witness; the pump decides.",
      mermaid: `flowchart LR\n  A[Assume L regular] --> P[Adversary picks p]\n  P --> W[You pick s = f(p)]\n  W --> S[Split enumeration]\n  S --> X[Pump to contradiction]`,
    },
  },
  "gate-cs-theory-of-computation-context-free-grammars-and-pushdown-automata": {
    intro: `Context-free grammars and pushdown automata are the next rung: grammars defining nested structure (balanced parentheses, expressions) and machines with one unbounded stack that exactly recognize those languages. The subject covers CFG definition, derivations, ambiguity, normal forms (CNF, GNF), PDAs, conversions in both directions, and closure properties of CFLs — the machinery every parser you will ever use embodies.`,
    foundations: `CFG G = (V, Σ, P, S): rules A → α, V variables, Σ terminals; leftmost/rightmost derivations; language L(G); ambiguity = string with ≥2 distinct parse trees (grammar property, not language for inherently ambiguous CFLs like {a^n b^n} ∪ {a^n b^{2n}}). PDA = NFA + stack: 7-tuple (Q, Σ, Γ, δ, q0, Z0, F); pushes/pops/read-move; acceptance by final state or empty stack (equivalent power). CFG ↔ PDA both directions — construct constructively. Normal forms: CNF (A → BC or a) — every CFG has one (ε-production and unit removal); GNF (A → aα) — every CFG too; CYK O(n³) membership via CNF. CFLs closed under union, concatenation, star, intersection with regular; NOT closed under intersection or complement.`,
    concepts: [
      {
        title: "CFGs: derivations, trees, ambiguity.",
        body: `A CFG derives strings by repeated substitution from productions; derivations have a tree representation (one node per production application); leftmost derivations correspond uniquely to parse trees; ambiguity = two parse trees for the same string — fix by rewriting grammar to precedence levels (expr → expr + term | term; term → term * factor | factor) or by associativity declarations; languages with no unambiguous grammar are inherently ambiguous (e.g., {a^i b^j c^k : i ≠ j or j ≠ k}) — inherent ambiguity is a property of the language, not a failure of imagination; GATE asks to detect ambiguity, fix it, or argue inherent ambiguity directly.`,
      },
      {
        title: "Normal forms: CNF and GNF.",
        body: `Chomsky Normal Form: all rules A → BC or A → a or S → ε; conversion steps: add S\' → S; eliminate ε-productions (compute nullable set; add alternatives with nullable part dropped); eliminate unit productions A → B (substitute B\'s rules); eliminate terminals RHS >1 symbol: A → a B C → ... introduce A_a → a; make every body length ≥ 2 into binaries; S → ε allowed only for S\'; result every rule ∈ {A→BC, A→a, S\'→ε}; membership via CYK O(n³·|G|): fill table bottom-up of substring nonterminals — classic exam algorithm. Greibach Normal Form: every rule starts with a terminal A → aα — simplifies pushdown automata simulation; both proofs by mechanical construction — practice the pipeline once.`,
      },
      {
        title: "Pushdown automata: mechanics and definition.",
        body: `PDA = (Q, Σ, Γ, δ, q0, Z₀, F); transition: δ(q, a, X) → (p, γ): read input a (or ε), pop X from stack, enter p, push string γ (top at left); acceptance: by final state (end of input ∧ state ∈ F) or empty stack (Z₀ popped) — both equivalent; stack height unbounded — the infinity that escapes regular languages; ε-moves: control-only steps without consuming input; nondeterminism allowed and essential (deterministic PDAs ⊊ CFLs — e.g., palindromes need nondeterminism); PDA sketching is the hardest part — practice: a^n b^n (push a, pop b), balanced parens, ww^R (nondet guess midpoint), a^n b^m c^k (three-count wizardry requires counting one, matching next).`,
      },
      {
        title: "CFG ↔ PDA conversion, both directions.",
        body: `CFG → PDA: single state (or two); push S; loop: (i) nondeterministically pop A, apply A → α, push α (expansion); (ii) match input terminal with stack top; accept when input consumed and S-expansion found. PDA → CFG: variables X_{pq} = "strings taking PDA from p with empty stack to q with empty stack"; rules X_{pq} → a X_{pr} X_{rq} | (if push/pop matching) and terminals from base rules; start X_{q0,qf}; the construction is mechanical but fiddly — every CFL is context-free of course. The exam rarely demands the full proof — sketches accepted at different levels of formality; the understanding tested is both classes coincide and how witness pairs pump.`,
      },
      {
        title: "Closure properties: CFLs are not a field.",
        body: `CFLs closed under: union (CFG union via new start), concatenation (bridge rule), Kleene star, intersection with regular only (not with CFL!), homomorphism (substitution), reversal, inverse homomorphism, quotient with regular. NOT closed under: intersection (L1 ∩ L2 both CFL can be non-CFL: {a^n b^n c^m} ∩ {a^m b^n c^n} = {a^n b^n c^n}), complement (complement of CFL is co-CFL — open/negative results: if CFL closed under complement then CFLs = co-CFLs — believed but subtle; the standard exhibit: {ww | w ∈ {a,b}*} not CFL), difference. The membership test: rational subsets preserve CFL, algebraic operations do not descend.`,
      },
    ],
    worked: [
      {
        title: "Grammar for balanced parentheses with derivation tree.",
        body: `S → ( S ) | S S | ε. Derivation: (()) () ← S ⇒ ( S ) ⇒ ( ( S ) ) ⇒ (()())?? — walk: S ⇒ SS ⇒ ( S ) S ⇒ ( ( S ) ) S ⇒ (() ) — hmm: let me build one (()()): S ⇒ ( S ) ⇒ ( S S ) ⇒ ( ( S ) S ) ⇒ ( ( ) S ) ⇒ ( ( ) ( S ) ) ⇒ ... ugh: (()()) parses: S → (S) → () with S→SS: S ⇒ SS ⇒ (S)(S) ⇒ (())(S) ⇒ (()()) — correct! Tree: root S, two children S,S; left S→(S)→() pair; right same. Every balanced string has ≥ 1 derivation; ambiguity resolved in this grammar? S → (S) | SS | ε IS ambiguous (multiple bracketings of ()()()); fix: S → (S)S | ε — right-leaning derivation, unambiguous — mirrors how real grammars encode precedence.`,
      },
      {
        title: "PDA for a^n b^n — transitions precisely.",
        body: `States q0 --a,Z0--> q0 Z0a (push a); q0 --a,a--> q0 aa; q0 --b,a--> q1 ε (first b: switch+pop); q1 --b,a--> q1 ε; final: q1 --ε,Z0--> q_accept ε. Acceptance by empty stack on Z0 — or final state if preferred; both equivalent; the ε-move for final acceptance handles inputs like ε (n=0: q0 already has Z0 on stack — need q0 accepting on Z0 for n=0 — Z0 push handles it: initial Z0 acts as bottom marker — accepted if we add q0 → q_f on Z0 via ε — standard trick; the bookkeeping is why textbook PDA definitions feel bureaucratic.`,
      },
      {
        title: "Ambiguity detection exercise: S → S + S | S * S | id.",
        body: `id + id * id: two parse trees — (id + id) * id or id + (id * id); ambiguity confirmed — this is exactly why C uses precedence: fix grammar S → S + T | T; T → T * F | F; F → id | ( S ) — unambiguous, mirrors operator precedence; GATE asks both: spot ambiguity, rewrite to unambiguous with precedence/associativity — the rewrite is the same skill compilers demand for expression parsing.`,
      },
      {
        title: "CYK membership for aaba with CNF grammar.",
        body: `CNF grammar for L: write in CNF first (exam provides it); table rows = substrings by length 1..n; row1: positions 1 a, 2 a, 3 b, 4 a → mark nonterminals deriving each terminal; row2: substrings aa: {B} where B → BC, CD rules... fill until full; cell(1,4) nonempty ⇒ string ∈ L; each row computed from prior rows by pairs of rules with matching splits — the dispatcher"s O(n³) table; the exam supplies a small CNF grammar and asks whether w ∈ L — pure bookkeeping.`,
      },
    ],
    exam: [
      {
        question:
          "What is an ambiguous grammar vs inherently ambiguous language?",
        answer:
          "Ambiguous grammar = some string has ≥2 parse trees (grammar problem — fix it); inherently ambiguous language = EVERY grammar for L is ambiguous (language problem — {a^n b^n c^m ∪ a^m b^n c^n} is the classic example); GATE asks to distinguish; never confuse the two.",
      },
      {
        question: "Which machine recognizes context-free languages?",
        answer:
          "Pushdown automaton — NFA plus an unbounded stack; determinism vs nondeterminism matters: deterministic PDAs ⊊ CFLs; every CFL has some PDA; this is the automata-theoretic analogue of NFA vs DFA, but DFA=NFA power doesn't extend here.",
      },
      {
        question: "Is the intersection of two CFLs always context-free?",
        answer:
          "No — classic counterexample: {a^n b^n c^m} ∩ {a^m b^n c^n} = {a^n b^n c^n}, not CFL; CFLs closed under ∩ only with regular languages; every exam asks this exact question.",
      },
      {
        question: "What does CNF enable algorithmically?",
        answer:
          "CYK parsing — bottom-up membership test in O(n³) via rule shapes A → BC and A → a only; also used in CKY for statistical parsing; the normal form strips everything else away leaving pure binary branching.",
      },
    ],
    cheat: [
      "CFG = variables + productions + start symbol; ambiguity via parse trees.",
      "PDA = NFA + unbounded stack; ε-moves + acceptance by final state or empty stack.",
      "CNF: A → BC | a | S → ε; membership via CYK O(n³).",
      "CFL closed under ∪, concat, *, ∩ with regular, homomorphism, reversal.",
      "CFL NOT closed under ∩ or complement (generally).",
      "DPDA ⊊ CFL; palindrome needs nondeterminism.",
    ],
    recap: `CFGs and PDAs extend finite memory with a stack: grammars describe nested structure, automata recognize it with push/pop discipline, ambiguity handled by rewriting or accepted as language pathology; CYK and normal forms mechanize membership; closure under ∩ fails — because the stack is only one deep, and some intersections demand two memories at once.`,
    code: {
      title: "PDAs as parsers",
      language: "text",
      code: `S -> ( S ) | S S | ε   is a grammar; the DFA can't count; the stack can.`,
      explanation:
        "Every programming language parses through this exact equivalence class.",
    },
    diagram: {
      title: "CFG–PDA triangle",
      caption:
        "Grammars generate, automata recognize, conversions preserve the class.",
      mermaid: `flowchart LR\n  G[CFG grammar] --> PDA[Pushdown automaton]\n  PDA --> L[CFL]`,
    },
  },
  "gate-cs-theory-of-computation-turing-machines-and-decidability": {
    intro: `Turing machines and decidability are the summit of computability theory — a concrete formal model baking in every effective procedure, and the boundary lines (decidable, recognizable, undecidable) separating the computable from the provably impossible. The subject covers TM variants, accepting vs halting vs deciding, the universal TM, the halting problem, diagonalization, reductions, and Rice\'s theorem — the most beautiful wall in mathematics.`,
    foundations: `TM = (Q, Σ, Γ, δ, q0, qA, qR): finite control + unbounded tape + read/write head moving left/right; deterministic; configuration = (state, tape contents, head position); accepting computation → qA, rejecting → qR, or diverge forever. Language classes: recursive/decidable (TM halts all inputs with verdict), recursively enumerable/RE (TM accepts members, may loop forever on non-members), non-RE (no recognizer). Enumerability diagonalization: |TM| countable, |Languages| uncountable → most languages non-RE. Halting problem: no TM decides for every TM M and input w whether M halts — proven by diagonal self-reference. Reduction: L₁ ≤ₘ L₂ (many-one) — undecidability transfers downward. Rice\'s theorem: every nontrivial semantic property of RE languages is undecidable.`,
    concepts: [
      {
        title: "Turing machines: the model and its variants.",
        body: `Standard DTM: one tape, one head, symbols Γ, finite Q, δ: (Q×Γ) → Q×Γ×{L,R}; halts in accept/reject or loops forever; computation tree is a single branch (deterministic); variants (multi-tape, multi-head, nondeterministic NTM, 2D tape) all equivalent in power — every variant simulates DTM with polynomial overhead; NTM vs DTM — same language class (RE); multi-tape gives quadratic simulation arguments; Church–Turing thesis: any effective procedure is TM-computable — unprovable, universally believed; the thesis is what licenses "undecidability" as absolute.`,
      },
      {
        title: "Decidable vs recognizable languages.",
        body: `Decidable (recursive): TM halts on every input — decides membership; RE (r.e./semi-decidable): TM halts and accepts on members, may loop forever on non-members; co-RE: complements of RE — halting on non-members exists; decidable = RE ∩ co-RE — if both L and complement are recognizable, L is decidable (run recognizers in parallel, first halt wins); examples: regular, CFL decidable; RE non-co-RE: A_TM = {〈M,w〉 : M accepts w}; co-RE non-RE: complement of A_TM; both undecidable: A_TM is the frontier exhibit. Closure fails: intersection of two RE is RE (yes), union yes; complement of RE is co-RE — not RE generally; RE not closed under complement.`,
      },
      {
        title: "The halting problem, proved undecidable.",
        body: `A_TM = {〈M,w〉 | M accepts w} undecidable (and RE); proof (Turing): suppose H decides A_TM; build D: on input 〈M〉, run H on 〈M, 〈M〉〉 — "does M accept its own description?" — if yes, loop forever; if no, halt-accept; then D on D: if H says D accepts D, D loops forever (contradiction); if not, D accepts D (contradiction) — unconditional; the diagonal self-reference is the engine — any total decision procedure breaks against a machine constructed to spite it; consequences cascade: every nontrivial property of TM behavior inherits undecidability via reductions; the halting problem is not a hard engineering problem, it is a wall no engineer climbed because none can.`,
      },
      {
        title: "Reductions and Rice's theorem.",
        body: `Reduction A ≤ₘ B: map instances of A to B preserving answers — if B decidable then A decidable; contrapositive: A undecidable ⇒ B undecidable; mapping direction matters (undecidable-ness flows downward from known-undecidable A); examples: A_TM ≤ₘ HALT_TM (accept vs halt — near-identical); A_TM ≤ₘ E_TM (emptiness of L(M) — proof via modified machine rejecting first symbol); Rice\'s theorem: every non-trivial semantic property of RE languages (emptiness, finiteness, regularity of L(M), equivalence, inclusion) is undecidable — "non-trivial" = some RE language has it, some doesn\'t; syntactic properties (number of states, halts on empty input) escape Rice — computable by construction or decidably checkable.`,
      },
      {
        title: "Diagonalization and counting arguments.",
        body: `Diagonal proof of A_TM undecidability is the Cantor-style table: enumerate all TMs M₁, M₂, ...; table T[i,j] = M_i accepts w_j?; define D differing from M_i on input i — D can\'t be among the enumerated machines — contradiction with enumeration being complete — hence no decider exists; counting: countably many TMs (finite descriptions over countable alphabet), uncountably many languages (powerset of countable strings) — most languages unrecognizable; hence diagonalization is not exotic, it is the bloodstream of computability — the reason "compute" has edges; exam asks to reproduce the diagonal or enumerate language size arguments.`,
      },
    ],
    worked: [
      {
        title: "Trace a TM deciding {a^n b^n}.",
        body: `Scanner: mark leftmost a with X (write X, move right); scan right to first unmarked b; mark with Y; move left to X boundary; repeat; at end all marked pairs matched → accept when input consumed alternating a/b marks; else reject early if b appears before any a etc. Every deterministic TM is a finite-state control plus tape manipulations — this one is a two-counter machine in disguise — and it provably halts on every input (each iteration strictly shrinks unmarked count) — decider. Constructions like this are the exam\'s mechanical exercises.`,
      },
      {
        title: "Show A_TM undecidable by constructing D from hypothetical H.",
        body: `Assume H decides A_TM; build D(〈M〉): run H(〈M, 〈M〉〉); if H says "accepts" then loop; else accept; feed D to itself: H(〈D, 〈D〉〉) — must answer correctly; if YES (D accepts D): H says accepts → D loops → D does not accept — contradiction; if NO: D accepts D — contradiction; no consistent answer — H cannot exist; hence A_TM undecidable; the diagonal pairs every machine with its own description — the one input no machine can handle honestly.`,
      },
      {
        title: "Reduce A_TM to E_TM (emptiness of L(M)).",
        body: `Given 〈M,w〉, construct M\': on input x, ignore x; simulate M on w; accept iff M accepts w. Then L(M\') = Σ* if M accepts w, ∅ otherwise; E_TM decider would decide A_TM via this map — A_TM undecidable ⇒ E_TM undecidable; every undecidability proof in the subject is this recipe: encode an undecidable problem into the one at hand; the exam asks for the map explicitly.`,
      },
      {
        title: "Classify ten languages: decidable, RE, or neither.",
        body: `DECIDABLE: {a^n b^n}, regular, CFL, finite languages, complements of deciders. RE not decidable: A_TM, EVEN_TM (accepts infinitely but doesn\'t halt — RE), EQ_TM (non-RE actually), K finitely modified K. NON-RE: complement of A_TM, ALL_TM (with RE? it\'s co-RE actually — careful), diagonal self-reference complements; the taxonomic skill: RE if you can enumerate members, decidable if you can always stop, co-RE if complements recognizable; practice with عشرة examples once — pattern recognition locked for life.`,
      },
    ],
    exam: [
      {
        question: "What is the Church–Turing thesis and can it be proven?",
        answer:
          'Every intuitively computable function is Turing-computable — a characterization, not a theorem (it defines "computable"); can\'t be proven (no formal notion of "intuitively computable" to refute it); role: grounds undecidability as fundamental, not model-dependent; alternatives (lambda calculus, μ-recursive, Post systems) coincide — strong evidence from convergence.',
      },
      {
        question:
          "Which class contains A_TM and which contains its complement?",
        answer:
          "A_TM ∈ RE (simulate M on w, accept if M accepts) but not co-RE and not decidable; complement of A_TM ∈ co-RE but not RE — otherwise A_TM decidable by running both; the exam's favorite symmetry question — remember both directions.",
      },
      {
        question: "What does Rice's theorem say in one line?",
        answer:
          "Every non-trivial semantic property of RE languages — i.e., any property of L(M) true of some RE sets and false of others — is undecidable; syntactic properties of the machine itself escape (e.g., #states), semantic properties of its language do not.",
      },
      {
        question: "Why can't there be a universal optimizer for programs?",
        answer:
          "Program equivalence is undecidable (EQ_TM via Rice) — no algorithm decides whether two programs compute the same function for all inputs; optimizing compilers therefore approximate — semantics-preserving verified transforms only; full automatic optimization is logically impossible, not just hard.",
      },
    ],
    cheat: [
      "TM = finite control + unbounded tape; variants equal in power.",
      "RE = recognizer; recursive = decider; RE ∩ co-RE = decidable.",
      "HALT problem A_TM undecidable; proof by diagonal/self-reference.",
      "Reduction: A ≤ₘ B transfers undecidability; A RE ⇒ B RE.",
      "Rice: nontrivial semantic properties of RE languages undecidable.",
      "Counting: most languages non-RE — uncountably many vs countably many machines.",
    ],
    recap: `Turing machines and decidability split the computable from the impossible by proof: recognizable vs decidable classes, the halting problem as diagonal sentence every candidate decider refutes, reductions as weapons, Rice\'s theorem as the blanket ban on semantic questions — the theory every working programmer bumps into whenever someone asks "can we ask the computer whether this program is correct?" — it cannot say yes, sometimes, and it cannot say no in general; the boundary is proven, not merely unknown.`,
    code: {
      title: "Diagonalization in pseudocode",
      language: "python",
      code: `for i in range(1, n+1):\n    if H(M_i, M_i) == 'accepts': loop_forever()\n    else: accept()`,
      explanation:
        "The machine that breaks any would-be halting decider — ten lines, one logical universe of consequences.",
    },
    diagram: {
      title: "Language hierarchy",
      caption:
        "RE ⊃ decidable; co-RE wraps the boundary; outside lies the non-RE majority.",
      mermaid: `flowchart TD\n  All[All languages] --> RE[RE: recognizable]\n  RE --> DEC[Decidable]`,
    },
  },
  "gate-cs-theory-of-computation-complexity-classes": {
    intro: `Complexity classes are the fine structure of decidability — not whether a problem is decidable, but how expensively; P, NP, co-NP, PSPACE, the polynomial hierarchy, and reductions (many-one, Turing), P vs NP, and completeness — the vocabulary that separates "solvable in principle" from "solvable before the moon sets." The subject covers time and space classes, reductions, NP-completeness proofs, and the frontier questions.`,
    foundations: `Time classes: P = problems solvable in O(n^k) deterministic time; NP = verifiable in polynomial time (or NTM P); co-NP = complements; PSPACE = polynomial space (includes PH, P, NP presumably); EXP, EXPSPACE above; space hierarchy: PSPACE ⊆ EXPSPACE... Hierarchy theorems: more time/space strictly more power (time hierarchy theorem — there exist problems in DTIME(n^k) not in DTIME(n^j) j < k). Reductions: many-one ( Karp ) preserves membership in P/NP by polynomial-time mapping; Turing reductions (Cook) more powerful — oracle access; NP-complete = in NP + all NP ≤ₘ-reduces to it; NP-hard = reduction sink without membership requirement. P vs NP: unknown; believed unequal; Milennium problem. P ⊂ PSPACE, NP ⊆ PSPACE, PH ⊆ PSPACE.`,
    concepts: [
      {
        title: "P: the feasible frontier.",
        body: `P = languages decidable in polynomial deterministic time; robust to model changes (RAM vs TM, log factors vanish); contains everything feasible in practice: sorting, matching, connectivity, shortest paths, linear programming, primality (AKS 2002 — polynomial in bit length), matrix determinant; P is machine-independent class in a way NP is not good at being (the definition of feasible for real machines); polynomials of high degree exist in theory but real P-ness is algorithmic culture; the working rule: if you can invent a smart algorithm with fast analysis, P likely contains the problem — brute force never counts.`,
      },
      {
        title: "NP: verification vs search.",
        body: `NP = problems with polynomial-time verifier: given certificate (proof) w of membership, check in poly time; equivalently NTM acceptance in poly time; "find a needle" is hard, "check the needle" easy; examples: SAT (check assignment), Hamiltonian cycle (check the cycle), clique, graph coloring k≥3, subset sum, ILP; NP ⊇ P trivially; question: NP ⊆ P or not (P vs NP) — millennium; best evidence: 50+ years nobody collapsed them; NP-complete = hardest in NP; every NP problem reduces to any NP-complete problem in poly time — solve one, solve all; reductions are the currency; the universe of NP has "poles" pulling everything toward them.`,
      },
      {
        title: "Reductions and the NP-completeness machinery.",
        body: `Karp reduction f: x ∈ A iff f(x) ∈ B — if B ∈ P then A ∈ P; construct A → SAT (Cook–Levin) then propagate SAT → ≤ₘ B to show B NP-complete (SAT ∧ clauses → 3SAT → CLIQUE → VERTEX COVER → ... hundreds of problems cataloged); the two obligations: (1) show B ∈ NP (verifier exists), (2) show SAT ≤ₘ B (gadget construction); witness constructions are the craft — each gadget simulates a logical operation or selection process in the target domain; once one problem shown NP-complete, all others fall via chains; the whole edifice rests on Cook–Levin\'s original SAT proof (1971) — the theorem that gave theory of computation its modern form.`,
      },
      {
        title: "co-NP and the polynomial hierarchy.",
        body: `co-NP = {complements of NP languages} — e.g., TAUTOLOGY (every assignment satisfies) — verifying a "no" certificate is hard but verifying "yes" for CO-NP is just the complement problem's certificate; P ⊆ NP ∩ co-NP; NP ⊆ coNP or NP ≠ coNP unknown; P = NP iff NP = coNP (complement both sides); PH: Σ₁ = NP, Σ₂ = NP^NP (oracle) Σ₃... union = PH; oracle hierarchy conjectured infinite; PSPACE = everything polynomial space — contains PH, PSPACE-complete like TQBF (true quantified Boolean formulas); TQBF = generalization of SAT with ∀∃ alternations; the hierarchy sits inside PSPACE — proofs of Σ_k collapses conditionally (if Σ_k = Π_k then PH collapses to Σ_k).`,
      },
      {
        title: "P vs NP status and the practical consequences.",
        body: `P ≠ NP is the deepest unresolved problem in math/CS; consequences if P = NP: every verification-easy problem solvable (messianic); if P ≠ NP (expected): NP-hard problems have no general fast algorithms — industry adapts: SAT solvers for hardware verification (millions of variables, still P-time in CUBIC practical regimes due to structured instances), heuristics, approximation algorithms, ILP/MIP, decomposition, parameterized complexity (FPT — exponential only in k, polynomial in n); NP-hardness does NOT mean hopeless — it means no general-purpose silver bullet exists; your algorithm choice is empirical craft on structured instances; exam asks definitions and standard NP-complete examples; the field operates inside the boundary of impossibility regardless of what the answer turns out to be.`,
      },
    ],
    worked: [
      {
        title: "Prove CLIQUE is NP-complete (sketch).",
        body: `(1) CLIQUE ∈ NP: certificate = set of k vertices; verify all pairs connected — O(k²) edges — polynomial; (2) 3SAT ≤ₘ CLIQUE: variables → pairs of complementary literal nodes; exactly one literal per variable chosen; clauses → triples of nodes per clause; edges between compatible nodes (not complementary, not same variable); |V| literal nodes + k = #clauses triples; clique size = #clauses exists iff SAT assignment satisfies all clauses — construction in O(n·m); hence CLIQUE NP-complete; the gadget argument pattern is universal once absorbed.`,
      },
      {
        title: "Classify ten problems into P, NP-complete, RE.",
        body: `P: sorted-list merge, max-flow (Ford-Fulkerson is pseudo-poly but poly in bit-length via scaling), shortest path, CFG membership (CYK), linear programming (Khachiyan 1979), primality. NP-complete: 3SAT, clique, vertex cover, Hamiltonian cycle, subset sum, graph coloring, integer programming. RE undecidable: A_TM (not in P or NP — undecidable beats all classes). Context-free membership ∈ P; P ⊂ NP ⊂ NP-complete-boundary; arithmetic of classes for the exam.`,
      },
      {
        title: "Use BIN PACKING <= vertex cover chain backward.",
        body: `Standard textbook: VERTEX COVER reduces to SET COVER reduces to 3DM reduces to BIN PACKING (via Karp\'s original 1972 chain); each gadget substitution simulated; no exam requires reproducing all gadgets — but understanding the chain exists and flows SAT → ... → BIN PACKING is expected knowledge; GATE asks for membership class of various problems — every one names its NP-complete parent by reflex once you know the zoo.`,
      },
      {
        title: "Compute reduction floor: NP-completeness of INDEPENDENT SET.",
        body: `INDEPENDENT SET = CLIQUE on complement graph (edges flipped) — membership in NP identical; CLIQUE ≤ₘ INDEPENDENT SET via complementation — one-line gadget (E\' = Ē); hence INDEPENDENT SET NP-complete; GATE\'s favorite five-second question; the graph-complement trick eliminates an entire family of ad hoc reductions — always look for that symmetry first.`,
      },
    ],
    exam: [
      {
        question: "What is the difference between NP-hard and NP-complete?",
        answer:
          "NP-complete = NP-hard + in NP — hardest members of NP; NP-hard = at least as hard as every NP problem via polynomial reduction, but not necessarily in NP (e.g., HALT is NP-hard but undecidable hence ∉ NP); the membership requirement is what NP-complete adds.",
      },
      {
        question: "If P = NP, what happens to co-NP?",
        answer:
          "NP = co-NP; because P is closed under complement (flip accept/reject) — so every NP language's complement ∈ P ⊆ NP, and dually; equality of P and NP collapses the entire first level of PH to P; the exam tests the symmetry reasoning.",
      },
      {
        question:
          "Which class contains the true quantified Boolean formula TQBF?",
        answer:
          "PSPACE-complete — the canonical PSPACE-complete problem (Stockmeyer–Meyer); PSPACE = languages solvable in polynomial space; TQBF ≥ every PH level; NP ⊆ PSPACE; P ≠ PSPACE believed (and by space hierarchy theorem, P ⊊ PSPACE strictly since DSPACE(n) ≠ DSPACE(n^k) — actually PSPACE ⊋ P is provable! By the space hierarchy theorem: DSPACE(O(n)) ⊊ DSPACE(O(n²)) strictly — yes, P ⊊ PSPACE is a theorem, not conjecture).",
      },
      {
        question: "What does the time hierarchy theorem guarantee?",
        answer:
          "DTIME(f(n)) ⊊ DTIME(g(n)) whenever f(n) log f(n) = o(g(n)) — strictly more time buys strictly more power; hence P ≠ EXP strictly; P vs NP remains open because we have no analogous separation for nondeterminism — the wall is that we cannot diagonalize against nondeterministic machines cleanly.",
      },
    ],
    cheat: [
      "P: deterministic poly time; NP: verifiable poly time / NTM poly; co-NP: complements.",
      "NP-complete = NP + all NP ≤ₘ it; Cook–Levin: SAT NP-complete; reductions cascade.",
      "PH: Σ₁=NP, Σ₂=NP^NP, ... ⊆ PSPACE; TQBF PSPACE-complete.",
      "Time hierarchy: P ⊊ EXP; Space hierarchy: P ⊊ PSPACE (theorem).",
      "P vs NP open; PSPACE strictly bigger; NP-complete = verification easy, search hard.",
      "CLIQUE → INDEPENDENT SET via graph complement.",
    ],
    recap: `Complexity classes sort the feasible from the merely terminating: P as the feasible kernel, NP as efficiently verifiable, reductions as the transport mechanism, completeness as the anchor questions — the theory doesn\'t just label your problems, it tells you the ceiling of every heuristic you\'ll ever invent for them; the frontier is exactly where your code meets it every day.`,
    code: {
      title: "Verifier pattern",
      language: "python",
      code: `def verify(instance, certificate):\n    return check_in_poly_time(instance, certificate)`,
      explanation:
        "NP is this one function; every member reduces to it — theory's simplest machine.",
    },
    diagram: {
      title: "Class nesting",
      caption:
        "P inside NP and co-NP; both inside PSPACE; PSPACE is a theorem bigger than P.",
      mermaid: `flowchart TD\n  PSP[PSPACE] --> NP\n  NP --> P`,
    },
  },
  "gate-cs-theory-of-computation-minimization-of-finite-automata": {
    intro: `Minimization of finite automata is the art of erasing redundancy from a machine without changing what it recognizes — partition refinement until no two states remain distinguishable. The subject covers distinguishability, table-filling algorithms, Hopcroft\'s O(n log n) method, minimization from NFAs via determinization first, and the theoretical anchor: the Myhill–Nerode theorem relating minimality to language index.`,
    foundations: `Distinguishable states p,q: ∃w ∈ Σ* with exactly one of δ*(p,w), δ*(q,w) ∈ F — separates them; equivalence if none exists — merge them. Minimization pipeline: (1) make DFA complete (add dead state if needed); (2) partition states into accept/non-accept; (3) refine: split group G into {p ∈ G | δ(p,a) ∈ S} and rest, for each (a, S); repeat until stable; (4) build minimal DFA with one state per block. Table-filling: mark pairs distinguishable starting from F mismatch; propagate from successors; unmarked merge. Hopcroft: process splitter sets smaller-half first — O(k n log n). Myhill–Nerode: index of L = |{equivalence classes of Σ* under L\'s right congruence}| = states of minimal DFA — formal foundation of the whole exercise.`,
    concepts: [
      {
        title: "Distinguishability: the definition that drives everything.",
        body: `p and q are distinguishable iff some string w sends exactly one of them to an accepting state; the empty string distinguishes accept/non-accept immediately; longer strings expose deeper distinctions; equivalence = indistinguishability; the two relations partition Q; the minimal DFA has one state per equivalence class; minimization never changes the language — it erases only the bookkeeping of how states were reached differently; the formal content of "minimization is unique up to isomorphism" — no two genuinely different minimal DFAs exist for the same language — GATE tests this uniqueness fact explicitly.`,
      },
      {
        title: "Table-filling algorithm: the algorithm everyone can execute.",
        body: `Create n×n table for pairs; mark (p,q) if exactly one in F; for unmarked pairs, if for some symbol a, pair (δ(p,a),δ(q,a)) is marked, mark this pair; iterate until no new marks — final unmarked pairs are equivalent; merge equivalents; transitions between merged states remain well-defined; the algorithm is O(n²·|Σ|) worst — fine for teaching, dead for large machines; exactly why Hopcroft exists; the exam walkthrough: table with 8–10 states, two symbols — mechanical, deterministic; the answer key is always the merge set.`,
      },
      {
        title: "Hopcroft's algorithm: the efficient splitter.",
        body: `Partition P = {F, Q\F}; worklist W = smaller of the two; for each splitter S ∈ W, for each a ∈ Σ: X = pre-image of S under a (states with a-transition into S); for every Y ∈ P intersected by X nontrivially: replace Y with X∩Y and Y\X; add smaller of the two to W; repeat until W empty; correctness: splitting never reunites valid blocks; complexity O(|Σ| n log n) — each state re-enters worklist ≤ log n times; the key operational detail: always enqueue the smaller half; the algorithm powers every lexer generator (flex builds minimal DFAs exactly via this) — GATE asks for the idea and the complexity, never the full proof.`,
      },
      {
        title: "NFA minimization via determinization first.",
        body: `NFAs have no equivalent of DFA minimization (mostly): must determinize (subset construction) → then minimize the DFA → result minimal DFA; no direct minimal NFA construction exists in polynomial time; the pipeline is fixed; alternative: use grammar-based approaches for tiny cases; in practice flex/lex produce minimal DFAs, never minimal NFAs; every GATE question chaining "minimize after subset construction" expects you to track subset explosion carefully — the answer size depends on the NFA structure, not the language size.`,
      },
      {
        title: "Myhill–Nerode: the theorem underneath.",
        body: `Define x ≡_L y iff ∀z: xz ∈ L ⇔ yz ∈ L — right congruence on Σ*; L is regular iff index of ≡_L finite; minimal DFA states ↔ equivalence classes; constructing class representatives yields the minimal machine directly; the index is the "true" complexity of the recognizer — NFA states may exceed it (nondeterministic bookkeeping), DFA can match it only when minimal; application: prove non-regularity by showing infinitely many pairwise-distinguishable prefixes — every pumping proof is a special case of this general argument — the theory\'s deepest structural statement in one theorem.`,
      },
    ],
    worked: [
      {
        title: "Minimize this 6-state DFA over {0,1}.",
        body: `States {A start non-final, B,C non-final, D,E,F final}. Table: base-mark pairs crossing F/non-F (A,B,C,D,E vs F...); then pairs whose successors marked: (A vs D): a→C/E — C non-F vs E final ⇒ marked; (B vs D): a→(B vs F) marked ⇒ mark (B,D); continue until stable; final equivalence classes: {A}, {B,C}, {D,E,F}; minimal DFA 3 states; verify by re-running both machines on 0, 1, 00, 01, etc. — identical acceptance — every minimization exercise ends with this equivalence check; the exam counts procedure steps, your grade depends on correct bookkeeping.`,
      },
      {
        title:
          "Show two strings are Nerode-inequivalent: 01 vs 10 for L = {strings ending in 01}.",
        body: `z needed: x z ∈ L vs y z ∉ L for some z; x = 01, y = 10, z = ε: 01 ∈ L; 10 ∉ L ⇒ distinct classes; to show full infinity: x = (10)^k 01 vs y = (10)^j 01 for j ≠ k — differ by needing different future... easier: x_n = 1(01)^n vs y_m = 1(01)^m — z = 01: x_n z = 1(01)^{n+1} ∈ L; y_m z = 1(01)^{m+1} ∈ L — both in; wrong z; correct z: ε already distinguishes any two distinct REPS classes for this L; general technique: pick z = ε-padded suffix to separate classes as needed — every GATE"index infinite" ask is solved by exhibiting an infinite pairwise-distinguishable family, one z per pair.`,
      },
      {
        title: "Merge equivalent states in this DFA: verify result minimal.",
        body: `After table-filling, equivalence classes determined; rebuild minimal machine; check: complete transition table, no class pair distinguishable by ∅ (no size-2 class), every class has outgoing a/b defined — completeness required for the minimal DFA argument; run BFS from start — every state reachable; unreachables deleted before minimization counts for nothing; final machine: unique, minimal, correct; the textbook procedure — practice on 5-8 state machines until it takes under 10 minutes.`,
      },
      {
        title: "Hopcroft trace on 5-state example, show first split.",
        body: `P = {F={D,E}, non-F={A,B,C}}; worklist smaller: {D,E}; splitter D∪E under a: pre-image = {x : δ(x,a) ∈ {D,E}} = {B,C} (assuming transitions there); intersects non-F block: split {A,B,C} into {B,C} and {A}; P = {{D,E},{B,C},{A}}; continue with next splitter; each split recorded on the partition; final blocks stable under both symbols — done; the O(n log n) argument: each element\'s block halves each time it enters a splitter — log n rounds max; the complexity is the theorem\'s memory hook.`,
      },
    ],
    exam: [
      {
        question:
          "What does the minimal DFA guarantee that an arbitrary DFA does not?",
        answer:
          "Uniqueness up to state renaming — one canonical minimal machine per language; both machines accept identically, but the minimal one uses exactly Myhill–Nerode-index number of states; anything larger carries redundant bookkeeping; mergers are isomorphism classes.",
      },
      {
        question: "Why must the DFA be complete before minimizing?",
        answer:
          "Distinguishability table assumes every state has transitions for every symbol; missing transitions create implicit extra dead behavior — completion by adjoining a sink standard (total δ) is mandatory pre-step; minimizing an incomplete DFA yields an incorrect (smaller-accepting) machine; the exam marks incomplete answers wrong.",
      },
      {
        question: "Which algorithm is O(n log n) and why?",
        answer:
          "Hopcroft's partition refinement — each element enters the worklist at most log n times (always halving); each processing costs O(|Σ| × in-degree); total O(|Σ| n log n); table-filling is quadratic; Paige-Tarjan improves further for special cases; GATE asks the headline, not the proof.",
      },
      {
        question: "What does infinite index of the Nerode relation prove?",
        answer:
          'The language is not regular — no finite DFA can recognize it; witnesses: infinite pairwise-distinguishable prefix families (a^n, a^n b, etc.); this is the formal tool underneath every "not regular" argument, stronger than pumping when applicable.',
      },
    ],
    cheat: [
      "Distinguishable = some string sends exactly one to accept; equivalence = merge.",
      "Pipeline: complete DFA → partition accept↛reject → refine to fixpoint → rebuild.",
      "Table-filling O(n²·|Σ|) for teaching; Hopcroft O(|Σ| n log n) in practice.",
      "NFAs: determinize first, then minimize — no direct minimal NFA algorithm.",
      "Myhill–Nerode: index = minimal states; infinite index = not regular.",
      "Minimal DFA unique up to isomorphism; always check unreachable removal first.",
    ],
    recap: `Minimization strips a DFA to its irreducible core: distinguishability partitions, table-filled or Hopcroft-split, yield a unique minimal machine per language — and the Myhill–Nerode theorem anchors every bit of it with the equation "index = states"; the algorithm flex runs a billion times daily inside your tools, and the exam wants you to walk the five states that prove you understand it.`,
    code: {
      title: "Partition refinement sketch",
      language: "python",
      code: `while worklist:\n    S = pop()\n    for a in alphabet:\n        X = preimage(S, a)\n        for Y in P:\n            split Y by X`,
      explanation:
        "The entire Hopcroft engine in four lines — all else is bookkeeping.",
    },
    diagram: {
      title: "Minimization pipeline",
      caption:
        "Complete → partition → refine to stability → one state per block.",
      mermaid: `flowchart LR\n  D[Complete DFA] --> P[Initial partition]\n  P --> R[Refine splits]\n  R --> M[Minimal DFA]`,
    },
  },
};

import type { TopicLesson } from "../topicLessons.js";

/**
 * PYQ Marathons and Test Strategy — 11 authored topic lessons.
 *
 * Standalone chapters per topic. Subject-first prose, foundations, core
 * concepts, worked examples, exam practice, cheat sheet, recap. No shared
 * templates, no runtime composition.
 */
export const pyqMarathonsAndTestStrategy: Record<string, TopicLesson> = {
  "gate-cs-pyq-marathons-and-test-strategy-pyq-marathon-engineering-mathematics":
    {
      intro: `The engineering mathematics PYQ marathon is timed mixed practice on the five areas GATE CS actually draws from: linear algebra, probability, discrete mathematics, graph theory and calculus. The subject is pattern recognition under pressure — internalising the handful of question shapes that repeat across a decade of papers, then executing them with zero hesitation, because these are the marks you must bank before touching a single 2-mark question elsewhere.`,
      foundations: `The recurring five: (1) linear algebra — eigenvalues, determinants, rank, inverse of 2×2/3×3, systems of equations; (2) probability — expectation, variance, Bayes, binomial/Poisson/normal, distributions and combined events; (3) discrete structures — set theory, relations (reflexive/symmetric/transitive, equivalence classes), partial orders and lattices, functions (one-one/onto/bijection), pigeonhole, inclusion–exclusion, permutations/combinations/circular arrangements; (4) graph theory — trees, spanning trees, Kruskall/Prim/Dijkstra numericals, Euler/Hamilton paths, coloring, matching; (5) calculus and optimization — maxima/minima, area under curve, mean-value theorem, numerical methods (trapezoidal/Simpson). Budget: 90 seconds per 1-marker, 180 for 2-markers; skip anything that smells like a long digression; never let math eat the OS questions you definitely know.`,
      concepts: [
        {
          title: "Eigen, rank, determinant — the three repeats.",
          body: `Every linear algebra GATE question reduces to one of three: eigenvalues (trace = sum of λ, determinant = product of λ; for 2×2, λ from λ²−tr·λ+det=0 — solve by inspection first), rank (row-reduce to echelon form — count nonzero rows; or count pivots), determinants (2×2/3×3 cofactor expansion; for triangular matrices, product of diagonal — a favorite trick). Recurring trap: asking for rank of a matrix with a zero row/column in disguise, or det(AB) = det A·det B with a singular B. Practice five of each variant; the mechanics never change, only the numbers.`,
        },
        {
          title: "Bayes and counting — the probability workhorses.",
          body: `Bayes: P(A|B) = P(B|A)P(A)/P(B) — GATE loves disease/testing and defective-parts setups; draw the tree, never the formula bare. Counting: nCr = n!/(r!(n−r)!); circular permutations (n−1)!; identical items n!/(a!b!c!); inclusion–exclusion |A∪B∪C|; pigeonhole (n+1 objects, n holes ⟹ two share). The exam favorite: "number of ways to arrange" with constraints — alternate people, men/women, no two adjacent — always subtract forbidden arrangements from total, never enumerate forward.`,
        },
        {
          title: "Discrete structures — relations and lattices.",
          body: `Relations: test reflexive (aRa∀a), symmetric (aRb ⟹ bRa), transitive (aRb ∧ bRc ⟹ aRc); equivalence classes partition the set — count them via gcd-style equivalence rules (same remainder, etc.); concordance-type GATE questions chain two properties (e.g., symmetric and transitive ⟹ reflexive? NO — not if some element is unrelated). Posets: Hasse diagrams — maximal/minimal elements, upper/lower bounds, least upper bound (join) and greatest lower bound (meet), lattices when every pair has both. GATE asks to draw these for tiny sets; never skip the enumeration because "it's trivial" — write every pair.`,
        },
        {
          title: "Graph problems in the exam — trees and spanning.",
          body: `Every graph-theory question is one of: degree sequences (sum of degrees = 2E; even degrees ⟹ Euler trail exists — connected + all even ⟹ Eulerian circuit), spanning trees (n−1 edges, connected, acyclic; Kruskal sorted-edge greedy — count edges added: n−1), MST total weight (sort, add, union-find — watch parallel edges), Dijkstra/BFS shortest path (trace the relaxation by hand — marks for correct intermediate distances), planar graphs (E ≤ 3V−6; corollary for K5 non-planar). GATE sets simple graphs (n≤6) deliberately — the win is careful enumeration, not cleverness.`,
        },
        {
          title: "Calculus and numerical — the low-hanging marks.",
          body: `Maxima/minima: f′(x)=0, second derivative test; tangents/normals; area between curves (set up integral from intersection points — sketch first). Numerical: trapezoidal and Simpson rules — memorize both error estimates (Simpson error ~ (b−a)⁵ f⁗/2880n⁴); convergence rate of bisection/Newton–Raphson (linear vs quadratic). Unit-circle identities and standard integrals (∫eˣln x, integration by parts) — occasionally surface. Also: mean value theorem and Rolle's theorem — one proof question per paper, always the same statement; memorize the conditions, recite verbatim, move on.`,
        },
      ],
      worked: [
        {
          title: "Eigenvalues of a 2×2 by inspection.",
          body: `A = [[4,1],[2,3]]: tr = 7, det = 12−2 = 10 → λ²−7λ+10 = 0 → (λ−5)(λ−2) → λ = 5, 2. Verify: A·(1,1) = (5,5) = 5(1,1) ✓ and A·(1,−2) = (2,−4) = 2(1,−2) ✓. The full exam ritual: trace, determinant, quadratic, verification — 60 seconds when practiced; the verification step catches sign blunders and is worth half the marks.`,
        },
        {
          title: "Bayes: test for a disease with 1% prevalence.",
          body: `P(disease)=0.01; P(test+|disease)=0.9; P(test+|healthy)=0.05. P(test+) = 0.01×0.9 + 0.99×0.05 = 0.009+0.0495 = 0.0585. P(disease|test+) = 0.009/0.0585 ≈ 0.154. Despite a "90% accurate" test, a positive result means only ~15% chance of disease at 1% prevalence — the classic GATE base-rate trap; every variant differs only in numbers, never in procedure — draw the tree, multiply along branches, normalize.`,
        },
        {
          title: "MST via Kruskal on 5 vertices.",
          body: `Edges: AB(1), AC(4), BC(2), BD(5), CD(3), DE(6), CE(7). Sorted: AB1, BC2, CD3, AC4, BD5, DE6. Kruskal: take AB (comp {A,B}), take BC (comp {A,B,C}), take CD (comp {A,B,C,D}), AC would cycle (skip), BD cycles (skip), take DE → tree = {AB,BC,CD,DE}, weight = 1+2+3+6 = 12, edges = 4 = n−1 ✓. The exam asks for total weight or the edge set — union-find trace is mechanical; parallel edges and self-loops are the only traps; check both every time.`,
        },
        {
          title:
            "Counting: arrange 6 people in a row with 2 specific not adjacent.",
          body: `Total 6! = 720; bad arrangements where the pair sit adjacent: treat pair as one block → 5! × 2! (internal order) = 240. Answer: 720−240 = 480. The subtraction pattern appears constantly; the alternative "gap method" (place 4 others → 5 gaps → choose 2 for pair × 2! ordering) gives 4! × 5 × 4 × 2 = 960... wait — check: gaps from 4 others = 5, choose ordered pair of gap and arrange pair = P(5,2)=20, times 4! = 24 → 480 ✓. Two methods, same answer, both are exam-proof.`,
        },
      ],
      exam: [
        {
          question: "Sum and product of eigenvalues of A = [[1,2],[3,2]]?",
          answer:
            "tr(A) = 3 = λ₁+λ₂; det(A) = 2−6 = −4 = λ₁λ₂. Answer: sum 3, product −4. No need to solve the quadratic — the examiners count on candidates wasting time; every matrix-question warm-up checks exactly these two numbers.",
        },
        {
          question:
            "Given P(A)=0.5, P(B)=0.4, P(A∩B)=0.2, is A independent of B?",
          answer:
            "P(A)P(B) = 0.2 = P(A∩B) — yes, independent. The trap is confusing disjoint (A∩B=∅, dependent) with independent — independence means the joint probability factors; disjointness means the joint probability is zero (except trivial zero-probability cases) — mutually exclusive events are NOT independent.",
        },
        {
          question:
            "How many distinct Hamiltonian cycles in a complete graph K5?",
          answer:
            "(n−1)!/2 = 24/2 = 12 undirected cycles (fix one vertex, permute the rest, divide by 2 for reversal symmetry). GATE asks this as a counting warm-up; the formula (n−1)!/2 is the thing to memorize for K_n, undirected.",
        },
        {
          question: "What is the error order of Simpson's 1/3 rule?",
          answer:
            "O(h⁴) with error term −(b−a)⁵ f⁗(ξ)/(180n⁴) — accuracy degree 3 (integrates cubics exactly); the trapezoidal rule is O(h²). GATE asks either the order or which rule is exact for which polynomial degree — Simpson exact for ≤ cubic, trapezoid exact for ≤ linear.",
        },
      ],
      cheat: [
        "Linear algebra: trace = Σλ, det = Πλ; 2×2 eigen via λ²−trλ+det=0.",
        "Bayes: tree diagram; marginal = sum of path products; normalize for the posterior.",
        "Set theory: inclusion–exclusion; pigeonhole; posets — join/meet in Hasse diagrams.",
        "Spanning tree: n−1 edges, Kruskal sorted+union-find; MST weight = sum of chosen edges.",
        "Circular permutations (n−1)!; block method for adjacency; complement for non-adjacency.",
        "Simpson O(h⁴); trapezoid O(h²); Newton quadratic convergence.",
      ],
      recap: `The math PYQ marathon trains three reflexes: recognize the shape before touching the numbers, apply the rehearsed procedure, and bank the 1-markers without flinching — because GATE's mathematics is a fixed set of question families with variable skins, and the candidate who has drilled the families collects full marks while others still configure their calculators.`,
      code: {
        title: "Kruskal skeleton",
        language: "text",
        code: "sort edges by weight; for each: if endpoints differ (find), union, add to tree, stop at n-1",
        explanation:
          "The entire MST algorithm in one line — the exam just asks for the total weight it produces.",
      },
      diagram: {
        title: "PYQ triage order",
        caption:
          "Bank sure shots first, negotiate the rest — never spend 6 minutes on a 1-marker.",
        mermaid:
          "flowchart LR\n  M[Math 1-markers] --> B[Bank them]\n  B --> Q[2-mark numericals]\n  Q --> T[Tricky proofs last]",
      },
    },
  "gate-cs-pyq-marathons-and-test-strategy-pyq-marathon-digital-logic-and-coa":
    {
      intro: `The digital logic and COA PYQ marathon covers the hardware fundamentals: boolean algebra, K-maps, minimization, flip-flops, counters, register transfers, number systems, pipelining, cache memory and the addressing zoo — the questions where five minutes of setup yields certain marks, the arithmetic side of GATE that punishes hand-waving.`,
      foundations: `Digital logic: number systems (base conversions, fixed/floating representation — IEEE 754 layout), boolean algebra theorems, De Morgan, canonical forms (SOP/POS, minterms/maxterms), K-maps (up to 5-6 variables — pair/quad/octet groups, wrap-around edges), minimization (don't-cares), flip-flops (SR/JK/D/T — characteristic tables, excitation tables), sequential circuits (flip-flop + next-state logic, counters — synchronous/asynchronous/ring/Johnson, modulo-N design), combinational circuits (mux/demux, encoders/decoders, adders — ripple/CLA), memory hierarchy, caches (direct/associative/set-associative; hit/miss rates; AMAT), pipelining (stages, hazards — structural/data/control; stalls and forwarding; speedup = n/(1 + (n−1)/k) ideal), addressing modes (direct/indirect/indexed/relative/immediate), instruction formats, and RISC vs CISC. GATE weight ~6-8 marks on these two modules combined.`,
      concepts: [
        {
          title: "K-maps: the minimization you must do by hand.",
          body: `Plotting: minterms by binary index, Gray-code adjacency (00,01,11,10 — NOT 00,01,10,11!); group in powers of two (8,4,2,1); overlap groups freely; don't-cares group but never stand alone; wrap-around on edges/corners for cyclic adjacency; each group = product term (SOP) or sum (POS). Recitations: minimal SOP from 4-variable map = at most 3 groups; the exam frequently shows a full K-map and asks for minimal expression or gate count. Draw the map, circle groups by eye, write product terms — 90 seconds when rehearsed; the single most botched skill in the digital module is skipping the adjacency wrap-around.`,
        },
        {
          title: "Number systems and IEEE 754 — the calculable traps.",
          body: `Binary↔hex↔octal rotations are mechanical; two's complement addition with overflow detection (sign of operands vs result — overflow iff sign(operands equal) ∧ sign(result differs)). IEEE 754 single precision: 1 sign + 8 exponent (bias 127) + 23 mantissa; value = (−1)ˢ × 1.M × 2^(E−127); min normal ≈ 1.18e−38; denormals fill the gap; zero/infinity/NaN encodings. GATE asks to convert a given float to hex bits or vice versa — practice five; the sign/magnitude/exponent/mantissa partition is the whole question; every bit of it is directly readable from the formula.`,
        },
        {
          title: "Flip-flops and counters — state tables and exams.",
          body: `Characteristic equations: JK — Q⁺ = JQ̄ + K̄Q (J=K=1 toggles); D — Q⁺ = D; T — Q⁺ = TQ̄ + T̄Q (T=1 toggles); SR — forbidden at 11. Design questions: given a state table, find next-state logic — minimize with K-map; counters: synchronous (common clock, count enable), asynchronous (ripple — propagation delay accumulates: mod-16 ripple ≈ 4 gate delays × t_pd), ring (shift register with 1 circulation), Johnson (mod-2n with n flip-flops). GATE asks for flip-flop count (n FFs → 2^n states) or delay comparison — ripple always slower and skew-prone; sync always preferred for speed.`,
        },
        {
          title: "Cache memory and AMAT.",
          body: `Cache questions are arithmetic formulas: average memory access time AMAT = hit time + miss rate × miss penalty; miss rate = misses/accesses; hierarchy extension adds levels multiplicatively. Direct-mapped: block in exactly one line (index = address bits); fully associative: any line (expensive comparators, best hit rate); set-associative: k lines per set (compromise). Write policies (write-through vs write-back) and placement (write no-write-allocate) occasionally appear. GATE pattern: given hit rates of L1 and L2, compute effective access penalty — e.g., L1 90% hit (1ns), L2 90% hit (10ns), memory 100ns: AA = 1 + 0.1×(10 + 0.1×100) = 1 + 0.1×20 = 3ns. Every variant is this exact nesting — innermost first.`,
        },
        {
          title: "Pipelining: hazards and speedup.",
          body: `Ideal speedup for n instructions over k stages = n/(k + (n−1)) → tends to k as n→∞; with stalls from hazards: structural (resource conflict — duplicate the resource), data (RAW dependency — forward/simplify, or stall; load-use needs at least one stall even with forwarding), control (branch misprediction — flush or predict). GATE numerical: given CPI pipeline = 1.2 vs scalar CPI = 4, instruction count 1000, clock rate comparison — compute cycles, compare times; and "which hazard needs forwarding" (RAW only). Also instruction count sensitivity — pipeline helps throughput, not latency; GATE loves showing that the last instruction still takes k cycles.`,
        },
      ],
      worked: [
        {
          title: "Minimize F(A,B,C,D) = Σm(0,1,4,5,6,8,9,12,13,14) via K-map.",
          body: `Plot ones at 0000,0001,0100,0101,0110,1000,1001,1100,1101,1110. Groups: column D=0 pairs (0,4),(8,12),(4,12)... standard grouping yields: (0,1,8,9) → A'B'? map: m0=0000, m1=0001, m8=1000, m9=1001 — row A B=00, cols CD=00,01 → group (m0,m1,m8,m9) = B'C'. Group (m4,m5,m12,m13): m4=0100,m5=0101,m12=1100,m13=1101 → same columns rows AB=01,11 → B? rows 01/11 share B=1... B means B bit=1 in row AB=01,11 → A varies → ignore A; CD 00,01 → C=0,D varies → B·C'. Group (m4,m6,m12,m14): m4=0100,m6=0110,m12=1100,m14=1110 → columns CD=00,10 rows AB=01,11 → B·D'. Minimal: F = B'C' + BC' + BD' = C'(B'+B·D'? check overlap simplify: F = C' + BD'? No — B'C' + BC' = C'(B'+B) = C'; so F = C' + BD'). GATE expects exactly this algebraic pull-out: F = C' + BD'. Verify against minterms: m2=0010: C'=1 ✓ covered; m8: C'=1 ✓; m11=1011: not in list ✓ (C'=0, D=1, B... m11: B=0? 1011 B=0,D=1 → BD'=0 → F=0 ✓).`,
        },
        {
          title: "IEEE 754: represent −12.625 in single precision.",
          body: `Sign=1. 12.625 = 1100.101₂; normalize: 1.100101 × 2³. Mantissa bits (drop leading 1): 100101 → pad to 23: 10010100000000000000000. Exponent = 3 + 127 = 130 = 10000010. Sign+exp+mant: 1 10000010 10010100000000000000000 → hex: C1 49 00 00. The whole conversion is shift-count and bias arithmetic — practice four conversions until the pattern is reflexive; GATE asks either direction.`,
        },
        {
          title: "AMAT with two levels.",
          body: `L1: hit 1 cycle, miss rate 10%; L2: hit 10 cycles, miss rate 25% of L1 misses; memory: 100 cycles. AMAT = 1 + 0.1 × (10 + 0.25 × 100) = 1 + 0.1 × 35 = 4.5 cycles. The formula extends any number of levels by nesting the parenthesis — write it innermost-outwards; GATE gives the tree of rates and wants the single number; don't simplify steps you don't trust — re-derive from scratch instead.`,
        },
        {
          title: "Pipeline speedup.",
          body: `5-stage pipeline, 1000 instructions, clock 500 MHz; scalar 5 CPI same clock. Pipeline cycles = 1000 + 4 (fill) = 1004 vs scalar 5000. Time: pipeline 1004ns, scalar 5000ns — speedup ≈ 4.98 ≈ k. With 10% branch stall penalty: effective CPI = 1 + 0.1×(k−1... load-use stall) → 1000 + 100 stalls + 4 fill = 1104 cycles — speedup drops to 4.5. The exam wants: cycles, time, ratio — and the recognition that fill cost is amortized to zero as n→∞.`,
        },
      ],
      exam: [
        {
          question: "How many flip-flops are required for a mod-13 counter?",
          answer:
            "⌈log₂13⌉ = 4. General rule: n flip-flops give 2ⁿ states; mod-N counter needs ⌈log₂N⌉ flip-flops; the exam also asks for the unreachable state count (2ⁿ − N = 3).",
        },
        {
          question: "What is the minimal SOP for F = Σm(1,3,5,7,9,11,13,15)?",
          answer:
            "All minterms with D=1 (odd indices) → F = D. The trick: every odd index has D bit set; one K-map row of full quads collapses everything; intermediate answers like D' + ... are the trap for those who expand mechanically.",
        },
        {
          question:
            "In IEEE 754 single precision, what does exponent field 0 mean?",
          answer:
            "Exponent value 0: either a denormal number (exponent treated as 2^(−126), no implicit leading 1 — used for gradual underflow near zero) or exactly zero when mantissa is also 0. NaN has exponent 255 with nonzero mantissa; infinity exponent 255 with zero mantissa. GATE loves the zero/denormal distinction.",
        },
        {
          question: "Which pipeline hazard is resolved by forwarding?",
          answer:
            "Data hazards of the RAW (read-after-write) type — forwarding routes the produced value straight from a later pipeline stage register to the waiting ALU input instead of waiting for the register write; control hazards need prediction or flush; structural hazards need resource duplication — none of those are forwarding. Load-use RAW still needs one stall even with forwarding — the favorite follow-up.",
        },
      ],
      cheat: [
        "K-maps: Gray-code order, groups of 2^k, wrap-around, don't-cares free-form.",
        "Two's complement overflow: operands same sign, result different sign.",
        "IEEE 754: ±1.M × 2^(E−127); exponent 0 denormals/zero; 255 inf/NaN.",
        "n flip-flops → 2ⁿ states; mod-N needs ⌈log₂N⌉; ripple skew, sync preferred.",
        "AMAT = hit + miss rate × (next level hit + miss rate × penalty).",
        "Pipeline cycles = n + (k−1) + stalls; speedup → k as n→∞.",
      ],
      recap: `Digital and COA rewards the calculator temperament: convert, count, minimize, trace — because every question is a deterministic procedure wearing different syntax, and the candidate who runs the procedure without shortcuts walks out of the hall with the hardware marks banked for good.`,
      code: {
        title: "AMAT nesting",
        language: "text",
        code: "AMAT = t_L1 + miss_L1 * (t_L2 + miss_L2 * (t_L3 + miss_L3 * t_mem))",
        explanation:
          "Innermost-outward evaluation — the entire formula on one line.",
      },
      diagram: {
        title: "K-map grouping rule",
        caption:
          "Powers of two, Gray-code adjacency, wrap-around edges — nothing else.",
        mermaid:
          "flowchart LR\n  M[Minterms] --> P[Plot on Gray map]\n  P --> G[Group 8/4/2/1]\n  G --> S[Sum of products]",
      },
    },
  "gate-cs-pyq-marathons-and-test-strategy-pyq-marathon-programming-and-data-structures":
    {
      intro: `The programming and data structures PYQ marathon covers pointers, arrays, linked structures, trees, hashing, stacks/queues/heaps and complexity of code fragments — the questions that look easy until they silently test your C mental model, then ask for the exact output, the exact count, or the missing line.`,
      foundations: `Core subjects: C language subtleties (pointer arithmetic, arrays ≅ pointers, pass-by-value/reference, struct padding, function pointers, storage classes, sizeof semantics), arrays (static/dynamic/2D row-major mapping, search: linear/binary, sorting), linked lists (insert/delete, reversal, cycle detection, merge), trees (BST operations, height balance, traversals — in/pre/post/level), graphs (adjacency, BFS/DFS basics), hashing (open addressing — linear/quadratic/double probing; chaining; load factor; deletion via tombstone), heaps (binary heap insert/delete-min, heapify), stacks/queues (parenthesization, monotonic stack, Deque, priority queue), complexity reading (nested loops, recursion, memoized vs not). GATE tests: code output tracing (dry runs), algorithm identification, recurrence from loop structure, average/worst-case distinction.`,
      concepts: [
        {
          title: "C pointers — reading code like an execution engine.",
          body: `The exam's favorite minefield: p++ advances by sizeof(*p) not 1 byte; a[i] ≡ *(a+i); array name decays to pointer except in sizeof(arr); function pointers: int (*f)(int) — dereference arrows optional to call; structures: s.a normal, ps->a via pointer; struct padding: sizeof(struct{char c; int i;}) = 8 on 4-byte alignment (3 pad bytes); little-endian byte order in unions/words. Questions give 4-6 line programs and ask for output — trace with explicit addresses and a memory map on paper; never in your head.
`,
        },
        {
          title: "Arrays, linked lists, and the merge operation.",
          body: `2D arrays: row-major index = (i×cols + j)×elem_size — asked verbatim; reversing a singly linked list (three pointers prev/curr/next), detecting cycles (Floyd's hare-tortoise — slow/fast pointers; cycle entrance at meeting point + head advance method), merging two sorted lists (dummy head + tail chase), splitting at mid (slow/fast), in-place vs auxiliary space. GATE shows a loop and asks how many node visits or which line is missing; practice the three canonical traversals until you can write them blind.
`,
        },
        {
          title: "Trees — heights, balance, and traversals.",
          body: `BST: inorder = sorted order (the single most repeated fact); height balance — AVL strict (|h_L−h_R| ≤ 1, rotations restore), red-black (longest path ≤ 2× shortest); deletion cases (leaf, one child, two children — replace with inorder successor); traversal state tracing: "from given traversal orders, build the tree" — inorder + preorder uniquely determines; level-order output given null markers; height from level-order counts (levels = ⌈log₂(n+1)⌉ for perfect). Also heap as array: children at 2i+1, 2i+2 — the exam asks parent/child indices routinely.
`,
        },
        {
          title: "Hashing and collision resolution.",
          body: `Load factor α = n/m; chaining expected probes ≈ 1 + α/2 (unsuccessful 1 + α); open addressing: linear probing suffers primary clustering (average ≈ (1+1/(1−α)²)/2... given GATE asks for sequence of probes); quadratic reduces clustering; double hashing near-optimal; deletion marks tombstone — reusing slot would break probe chains; insert always into first empty per probe sequence. GATE gives a hash function and a key sequence — you must trace where each lands; primary clustering penalty questions (cluster length after k inserts) are standard 1-markers.
`,
        },
        {
          title: "Reading time complexity from code fragments.",
          body: `GATE writes real for/while/recursive fragments and asks complexity: single loop → O(n); nested independent → O(n²); nested with i*=2 or j*=2 → O(log n); amortized patterns (dynamic doubling) → O(1) amortized; recursion → write T(n), solve via Master/substitution: T(n)=2T(n/2)+n → Θ(n log n); gcd recursion (Euclidean) → O(log min(a,b)); matrix loops n³; memoized Fibonacci → O(n) vs naive O(2ⁿ). Watch for string concatenation inside loops (quadratic total) and memcmp-shaped inner scans.
`,
        },
      ],
      worked: [
        {
          title: "Dry run: what does this print?",
          body: `int a[] = {10,20,30,40}; int *p = a + 1; printf("%d", *p + *(p+1)); Step: a+1 → address of a[1] (20); *p = 20; *(p+1) = *(a+2) = 30; 20+30 = 50. Answer 50. Every output question is this exact grammar: decay, advance, dereference, combine — trace with addresses, never with vibes.
`,
        },
        {
          title: "Merge two sorted arrays, count comparisons worst case.",
          body: `Merging lengths 4 and 5: worst case interleaved arrival forces 4+5−1 = 8 comparisons (every element compared until one list empties; general bound n+m−1). The exam asks for the maximum comparisons — n+m−1 always for merge; contrast with linear search of merged (n+m) and binary search per element (n log m).
`,
        },
        {
          title: "Height of a BST from inorder+preorder lists.",
          body: `Inorder = sorted: [1,2,3,4,5]; preorder = root-first: [3,2,1,4,5] → root 3, left subtree inorder [1,2] preorder [2,1] → root 2, left child 1; right subtree [4,5] root 4 with right child 5. Tree: 3 with children 2 (left, child 1) and 4 (right, child 5). Height = 2. Construction questions never exceed 6 nodes; the algorithm: pop preorder root, find it in inorder, split, recurse.
`,
        },
        {
          title: "Hash table: linear probing insert sequence.",
          body: `h(k) = k % 7; insert 15, 11, 11, 21, 14: 15→1; 11→4; dup 11 rejected; 21→0; 14→0 occupied, probe 1 → occupied (15), probe 2 → empty → place at 2. Table: [21, 15, 14, _, 11, _, _]. GATE asks final positions — trace probe chains carefully; cluster of 15,14 at 1,2 formed from 14's double-hop — the exam's favorite subtlety (a slot you never saw, reached only by collision cascade).
`,
        },
      ],
      exam: [
        {
          question:
            "In a binary heap with 100 elements, what is the index of the parent of index 51?",
          answer:
            "(51−1)/2 = 25 (integer floor). Zero-based: parent(i) = (i−1)/2; one-based: parent(i) = i/2 — pick the convention matching the question's array indexing (GATE usually states zero-based or shows code).",
        },
        {
          question: "Which traversal of a BST yields ascending order?",
          answer:
            "Inorder (left, root, right). The single most reliable tree fact in the syllabus; every BST sorting/validation question reduces to it.",
        },
        {
          question:
            "What is the minimum number of comparisons to merge two sorted lists of lengths m and n (m ≤ n)?",
          answer:
            "m — when every element of the shorter list is smaller than all elements of the longer (each shorter-list element gets compared and emitted immediately, shorter empties after m comparisons, n's remainder just appends). Maximum is m+n−1. GATE asks for min or max — distinguish carefully from the wording.",
        },
        {
          question:
            "What does sizeof(union { int i; char c[5]; double d; }) return on a 4-byte-aligned, 8-byte-double system?",
          answer:
            "8 — union size = max member size (double, 8), rounded up to the union's alignment (8, from double). int=4, char[5] padded to 8? char array of 5 needs alignment 1 → 5 rounds to 8 under union alignment 8; anyway the answer is max(4,5,8) rounded to alignment 8 = 8. The exam tests exactly this rule — member max vs alignment round.",
        },
      ],
      cheat: [
        "a[i] ≡ *(a+i); decay except sizeof(arr); struct padding to alignment.",
        "Linked list: prev/curr/next reversal; Floyd cycle detect; dummy-head merge.",
        "Inorder BST = sorted; AVL |hL−hR|≤1; heap children 2i+1, 2i+2.",
        "Hashing: chaining 1+α/2; linear probing clusters; tombstones for deletion.",
        "Complexity from loops: halving → log; gcd → O(log min); doubling dynamic array → O(1) amortized.",
        "n+m−1 max comparisons to merge; m minimum.",
      ],
      recap: `The PDS marathon rewards the accountant's habit of simulation: pointer positions moved deliberately, index arithmetic verified, probe chains walked aloud — because every 1-marker in this module is a machine with a rule, and the machine never lies; your only opponent is your own haste.`,
      code: {
        title: "Cycle detection",
        language: "c",
        code: "slow = head; fast = head; while (fast && fast->next) { slow = slow->next; fast = fast->next->next; if (slow == fast) return 1; }",
        explanation:
          "Floyd's tortoise and hare — six lines that answer half the cycle questions in the module.",
      },
      diagram: {
        title: "List reversal pointer dance",
        caption: "Three pointers, one arc, zero allocations.",
        mermaid:
          "flowchart LR\n  P[prev] --> C[curr]\n  C --> N[next]\n  N --> C2[rewire curr->prev]",
      },
    },
  "gate-cs-pyq-marathons-and-test-strategy-pyq-marathon-algorithms": {
    intro: `The algorithms PYQ marathon is about the recurring problem families: sorting, searching, recurrence analysis, greedy and DP paradigms, graph algorithms and NP-completeness — the subject where one well-practiced template technique unlocks a third of the marks and one careless assumption about keys or weights costs you the rest.`,
    foundations: `The examinable families: (1) complexity & recurrence (Master theorem, substitution, recursion trees — T(n)=2T(n/2)+n² etc.); (2) sorting & order statistics (insertion/selection/merge/quick/heap; average/worst; stability; in-place; comparison lower bound n log n); (3) search (binary search, interpolation search O(log log n) uniform, hashing vs BSTs); (4) greedy paradigms (activity selection, Huffman, job sequencing, fractional knapsack — exchange arguments); (5) DP (0/1 knapsack, LCS, LIS, matrix chain order, TSP DP, binomial coefficients); (6) graphs (BFS/DFS, Dijkstra, Bellman-Ford, Floyd-Warshall, Prim/Kruskal — cut property, cut set); (7) NP-completeness (reductions, Cook–Levin, SAT variants, clique, vertex cover, Hamiltonian cycle — membership vs completeness distinction). GATE repeats families with new numbers every year; the win is family recognition within 10 seconds of reading the question stem.`,
    concepts: [
      {
        title: "Recurrence reading — the exam's favorite doorway.",
        body: `GATE writes either a recurrence or code and asks asymptotic: apply the Master theorem by critical exponent n^(log_b a) — if f(n) = n^k smaller by polynomial gap → Θ(n^(log_b a)); if equal (f = Θ(n^(log_b a))) → Θ(n^(log_b a)·log n) — classic merge sort case; if larger with regularity af(n/b) ≤ cf(n) → Θ(f). Watch traps: T(n)=2T(√n)+log n (let m=log n — becomes T'(m)=2T'(m/2)+m → Θ(m log m) = Θ(log n log log n)); f polynomial × polylog factors (log² n sits in case 2 with log factor running away: Θ(n log³ n)... careful). Write the tree when the theorem feels unsure — leaves×leaf cost + internal costs is unfoolable.
`,
      },
      {
        title: "Sorting and the comparison lower bound.",
        body: `Comparison sorting can't beat Ω(n log n) (log₂(n!) decision tree) — every hybrid (introsort, library sort) lives under it; non-comparison sorts (counting O(n+k), radix O(d·(n+k)), bucket) escape it — they appear on GATE as "which sort is optimal for this input" every few years. Stability chain: merge/insertion/bubble stable; quick/heap unstable; quicksort in-place O(log n) stack; heap O(1) extra but unstable; adaptive sorts (insertion) O(n) on nearly-sorted; merge is the answer to "stable AND worst-case O(n log n)". GATE also loves inversion counting (merge sort with counter) and selection of k-th smallest (quickselect expected O(n)).
`,
      },
      {
        title: "Greedy vs DP — recognizing which door to pick.",
        body: `Greedy = local optimum with global proof (exchange argument — show any optimal solution can be transformed to greedy's choice without loss); DP = overlapping subproblems + optimal substructure (no greedy proof available, or counterexample exists: 0/1 knapsack greedy fails, interval scheduling greedy works). Match the problem to its classic: activity selection → greedy earliest finish; fractional knapsack → greedy ratio; 0/1 knapsack → DP; LCS/LIS → DP; matrix chain → DP; Huffman → greedy merge smallest; MST → both (cut property). The exam's 1-marker: "which of the following can be solved greedily?" — if the obvious greedy fails, it's DP/ exponential, never greedy.
`,
      },
      {
        title: "Graph algorithms under exam conditions.",
        body: `Dijkstra: fails with negative edges — GATE asks to spot that (Bellman-Ford for negative, detecting negative cycles when a relaxation still improves after V−1 rounds); Floyd-Warshall O(V³) all-pairs; Prim vs Kruskal — both produce MST, cut property proof; BFS shortest unweighted, DFS for cycles/SCCs/topological order (DAG only); SCC via Kosaraju (finish-time DFS on transpose) — GATE asks component count for small graphs; topological sort via Kahn (indegree zero repeatedly). The recurring 1-marker: "what is the output of running DFS on this graph?" — draw the recursion tree with finish times; and "how many spanning trees does this graph have" (Matrix-Tree theorem — rarely, but seen).
`,
      },
      {
        title: "NP-completeness — the vocabulary question.",
        body: `NP = verifiable in polynomial time; NP-hard = every NP problem reduces to it; NP-complete = NP ∩ NP-hard; Cook–Levin: SAT is NP-complete; Karp's 21 problems: 3-SAT, clique, vertex cover, Hamiltonian cycle, partition, knapsack decision. GATE 1-markers: "which of these is NP-complete?" — treat Hamiltonian path, vertex cover, 3-coloring as YES; shortest path, sorting, MST, matching as NO. Reduction direction: A ≤ₚ B and B ∈ P ⟹ A ∈ P — to prove B NP-hard, reduce a known NP-complete problem TO B (not the other way!). Also co-NP, PSPACE mention occasionally — recognize, don't derive.
`,
      },
    ],
    worked: [
      {
        title: "Solve T(n) = 3T(n/4) + n² log n.",
        body: `a=3,b=4 → n^(log₄3) ≈ n^0.79. f(n) = n² log n — polynomially larger than n^0.79 and satisfies regularity (af(n/b) = 3·(n/4)²·log(n/4) < (3/16)n² log n ≤ c·n² log n for some c<1) → case 3 → T(n) = Θ(n² log n). Sanity-check: any poly above critical exponent with regularity collapses to f(n) — the log factor rides along unchanged. GATE asks for Θ(n^k log^m n) forms repeatedly — learn to state both.
`,
      },
      {
        title: "Quicksort worst case and the fix.",
        body: `Sorted input [1..n], Lomuto partition with last element pivot → recursion depth n, T(n) = T(n−1) + n → Θ(n²). Random pivot or median-of-three makes worst case improbable; introsort switches to heapsort at depth 2⌊log n⌋ restoring O(n log n) worst — GATE asks which variant guarantees O(n log n) (merge sort and introsort; quicksort only expected).
`,
      },
      {
        title: "DP: LCS of 'ABCBDAB' and 'BDCABA'.",
        body: `Table 7×6; LCS length = 4 ('BCBA' one valid answer). GATE asks either length or an actual subsequence — fill the DP table row by row (diag +1 on match, else max of up/left), reconstruct by backtracking from bottom-right. Every LCS question is mechanical table arithmetic — practice one 6×6 to desensitize.
`,
      },
      {
        title: "Dijkstra on a 6-node weighted graph — trace by hand.",
        body: `Source A. Edges: A-B(2), A-C(5), B-C(1), B-D(6), C-D(2), C-E(4), D-E(1), E-F(3), D-F(7). dist: B=2, C=5 (via A) → relax A-B-C: 2+1=3 < 5 → C=3. Next min: C=3 → D=3+2=5, E=3+4=7. Next: B done, D=5 → E=min(7,5+1)=6, F=5+7=12. Next: E=6 → F=min(12,6+3)=9. Final: A=0,B=2,C=3,D=5,E=6,F=9. GATE questions show 4-6 nodes; the mark scheme: correct final distances (each node label) — trace outward in order of extraction for partial credit safety.
`,
      },
    ],
    exam: [
      {
        question:
          "Which case of the Master theorem applies to T(n) = 2T(n/2) + n?",
        answer:
          "Case 2 (equal f and n^(log₂2) = n): T(n) = Θ(n log n). The most-asked recurrence on the paper; counterpart traps: f smaller → case 1 → Θ(n); f larger regular → case 3 → Θ(f).",
      },
      {
        question:
          "Huffman coding on frequencies {5,9,12,13,16,45} produces average code length?",
        answer:
          "Build: merge 5+9=14, 12+13=25, merge 14+16=30, 25+30=55, 45+55=100. Weighted external path length: 5×4 + 9×4 + 12×3 + 13×3 + 16×3 + 45×1 = 20+36+36+39+48+45 = 224 → average = 224/100 = 2.24 bits/symbol (or equivalently the sum of merge costs 14+25+30+55+100 = 224). GATE expects the sum-of-merges computation — skip the tree drawing unless asked for it.",
      },
      {
        question: "Is the Hamiltonian path problem in P or NP-complete?",
        answer:
          "NP-complete — deciding existence is NP-complete (Karp 1972); the counting version is #P-complete. Any GATE option set mentioning Hamiltonian cycle/path/circuit asks exactly this distinction from shortest path (in P) and Eulerian circuit (in P via degree conditions).",
      },
      {
        question:
          "What is the purpose of Dijkstra's invariant at extraction time?",
        answer:
          "Every vertex extracted has its final shortest-path distance — because edge weights are non-negative, no later relaxation can undercut it. Negative weights break the invariant (an unextracted vertex can later prove a better path), which is why Dijkstra refuses negative weights and GATE tests that boundary explicitly.",
      },
    ],
    cheat: [
      "Master theorem: n^(log_b a) vs f(n); three cases; write the tree when unsure.",
      "Comparison sort floor n log n; counting/radix escape; quicksort worst n², introsort worst n log n.",
      "Greedy needs exchange proof; DP needs overlapping subproblems — match family to archetype.",
      "Dijkstra non-negative only; Bellman-Ford negative + cycle detection; Floyd all-pairs O(V³).",
      "NP-complete: SAT, 3-SAT, clique, vertex cover, Hamilton cycle, partition — reduce TO these to prove hardness.",
      "Merge sort = stable + n log n worst + gap-friendly; quicksort = in-place + cache-fast + random pivot.",
    ],
    recap: `Algorithm questions on GATE are a fixed family tree: sort, search, DP, greedy, graphs, complexity — because the question writer picks from the same skeleton every year, the candidate who owns the templates never improvises; recognition beats derivation every single time, and derivation with no recognition at all beats panic.`,
    code: {
      title: "Huffman merge loop",
      language: "text",
      code: "while heap has >1: a=pop, b=pop, push(a+b); total += a+b",
      explanation:
        "Optimal prefix code cost equals the sum of all merge costs — print that sum, not the tree.",
    },
    diagram: {
      title: "Paradigm selection",
      caption:
        "Independent subproblem + greedy proof → greedy; overlapping state → DP; exponential with pruning → backtracking.",
      mermaid:
        "flowchart TD\n  Q[Problem] --> G{Optimal substructure + greedy proof?}\n  G -->|yes| Gr[Greedy]\n  G -->|no| D{Overlapping subproblems?}\n  D -->|yes| DP[Dynamic programming]\n  D -->|no| B[Backtracking or brute force]",
    },
  },
  "gate-cs-pyq-marathons-and-test-strategy-pyq-marathon-theory-of-computation":
    {
      intro: `The theory of computation PYQ marathon drills the four rungs of the Chomsky hierarchy — regular, context-free, context-sensitive, recursive — with the recognition patterns GATE uses: language membership questions, pumping lemmas, closures, decidability and reduction arguments. The subject is the orderly catalog where every answer is an established theorem, so the win is mapping the question to the catalog entry fast.`,
      foundations: `Chomsky hierarchy: regular (T-0/type 3: DFA/NFA/regular expressions) ⊂ CFL (type 2: CFG + NPDA) ⊂ CSL (type 1: LBA) ⊂ RE (type 0: TM). Recurring GATE operations: (1) membership — given grammar and string, derive or count derivations, ambiguity (multiple parse trees for one string); (2) equivalence/closure — regular closed under union, intersection, complement, concatenation, star, reversal, difference, homomorphism; CFL closed under union, concatenation, star — NOT intersection, NOT complement; CSL closed under everything except... ; (3) pumping lemmas — regular p = states; CFL p = 2^|productions| bound — prove non-membership by contradiction; (4) decidability — halting undecidable (diagonalization); equivalence/emptiness/finiteness undecidable for TM, decidable for regular, emptiness decidable for CFL; (5) NP-completeness — see algorithms; (6) machine construction — NFA/DFA for a described language, CNF conversion, GN programming. Know the table cold; each cell is its own 1-marker.`,
      concepts: [
        {
          title: "Regular languages — the decision kit.",
          body: `Given a language L: if L is described by counting of an unbounded number of independent things (a^n b^n), it's not regular — pumping lemma witness or Myhill–Nerode with infinitely many equivalence classes. If L = strings ending/not ending with a pattern, parity conditions, modulo-k counting, contains-substring conditions — it IS regular; build the DFA (or give the RE). Closure traps: regular ∩ regular is regular (yes), CFL ∩ CFL not necessarily, CFL ∩ regular is CFL. Given DFA and asked minimal DFA — partition refinement (mark distinguishable pairs) — GATE shows 5-6 states and asks for the minimum count. Equivalence of two REs — convert both to DFAs, minimize, compare.`,
        },
        {
          title: "Pumping lemmas — the negation weapon.",
          body: `Regular PL: ∃p such that ∀s ∈ L, |s| ≥ p, s = xyz with |xy| ≤ p, |y| > 0, and xy^i z ∈ L for all i ≥ 0. Proof recipe: pick s = p^k-sized witness tuned so any legal decomposition violates the conclusion (e.g., for a^n b^n, s = a^p b^p — xy all in the a's, pump y → counts differ). CFL PL: s = uvwxy with |vwx| ≤ p, |vx| ≥ 1, and uv^iwx^iy ∈ L — the window vwx stays within p symbols; witness a^n b^n c^n pumps two counts at best. The exam asks to "prove not regular" or "prove not CFL" — pick witness, all legal splits fail, conclude. Practice the three canonical witnesses; they recur endlessly.`,
        },
        {
          title: "CFG and parsing — counts and ambiguity.",
          body: `Derivations: leftmost vs rightmost (count both from productions to identify ambiguity); parse trees — internal nodes = variables, yield on leaves; ambiguous grammars give two distinct trees — GATE shows a grammar + string and asks if it's ambiguous, or asks for number of parse trees; try small derivations and count. CNF: A → BC | a; convert ε-productions and unit productions away; CFL parsing O(n³) (CYK) — occasionally leaks into questions; Chomsky normal form transformation steps are a favorite multi-step 2-marker. Also: remove left recursion for LL parsing (A → Aα | β becomes A → βA′, A′ → αA′ | ε) — though GATE rarely goes that deep, the structure appears.`,
        },
        {
          title: "Closures and decision properties — the table.",
          body: `Language family closure chart: regular — ∪ ∩ ∁ ∘ * reverse; CFL — ∪ ∘ * reverse; CSL — ∪ ∩ ∁ ∘ * (all decidable-ish membership? CSL membership decidable); RE/RĒ: RE closed under ∪ ∩ ∘ * homomorphism (yes all!), not complement. Emptiness decidable for regular and CFL (CYK reachability), undecidable for CSL? (Actually CSL emptiness undecidable — yes); equivalence decidable for regular, undecidable for CFL and above; universality decidable for regular only. GATE 1-markers pick a random pair from this vocabulary — memorize the chart as a matrix.
`,
        },
        {
          title: "Halting problem and reductions.",
          body: `The halting problem (does TM M halt on input w?) is undecidable — diagonalization proof: assume decider H(M,w), build D(x) that loops if H(x,x) says halt, halts otherwise; D on D contradicts. GATE asks only recognition: "which are decidable?" — halting, equivalence of TMs, whether L(M) is regular/finite/context-free — all undecidable; membership L(M,w) — undecidable for arbitrary M; emptiness for CFLs — decidable; regular-language problems — all classical questions decidable (DFA minimization etc.). Reductions A ≤ₘ B (mapping reduction) transfer undecidability from A to B; many-one vs Turing reduction distinction rarely tested — know the definition.
`,
        },
      ],
      worked: [
        {
          title: "Prove L = {0^n 1^n | n ≥ 0} not regular.",
          body: `Assume regular with pump length p. Witness s = 0^p 1^p ∈ L, |s| = 2p ≥ p. Any decomposition s = xyz with |xy| ≤ p puts xy entirely within the 0-block; |y| ≥ 1 means y = 0^k, k ≥ 1. Pump down i = 0: xz = 0^{p−k} 1^p ∉ L (counts differ) — contradiction → not regular. The argument template transfers to every non-regular language; the only creative step is choosing the witness — practice picking witnesses for 10 languages before the exam.
`,
        },
        {
          title: "Number of parse trees: grammar S → S+S | a.",
          body: `Strings of the form a+a+...+a: Catalan-many trees. a+a+a has 2 trees (left- and right-leaning); a+a+a+a has 5. GATE asks to list or count for a 3-4 instance. The ambiguity is inherent (it's the classic expression grammar) — if the question asks "is the grammar ambiguous", answer YES immediately from the two-tree example; derivations with distinct tree shapes constitute proof.
`,
        },
        {
          title: "Convert A → A a b | c to CNF-ready form.",
          body: `Step 1: eliminate A → Aα | β: introduce A′: A → c A′; A′ → a b A′ | ε. Step 2: remove ε: A′ → a b A′ | a b. Step 3: enforce CNF shapes — terminals with two symbols: introduce X₁ → a, X₂ → b: A → c A′; A′ → X₁ X₂ A′ | X₁ X₂. Step 4: binary factor: X₁ X₂ A′ → X₁ Y, Y → X₂ A′. Final: A → c A′ | (if start modified) S → A... — the mechanical algorithm: ε-removal, unit-removal, binarize, terminal substitution — practice once start to finish.
`,
        },
        {
          title: "Which is decidable: emptiness for PDA or TM?",
          body: `PDA emptiness — decidable (convert to CFG, check membership of any terminal string via CYK; or graph reachability on PDA states). TM emptiness — undecidable (reduction: from halting — build M′ that runs M on w then accepts everything iff M halts; L(M′) empty iff M doesn't halt; a decidable emptiness would decide halting — contradiction). Every GATE decidability question follows this exact reduction skeleton — learn the halting→emptiness mapping once and the whole family (equivalence, finiteness, regularity) falls into place.
`,
        },
      ],
      exam: [
        {
          question: "Are CFLs closed under intersection?",
          answer:
            "No — counterexample: {a^i b^j c^k : i=j} ∩ {a^i b^j c^k : j=k} = {a^n b^n c^n}, which is not CFL. CFLs ARE closed under union, concatenation, Kleene star, reversal, and intersection with regular languages — GATE tests exactly this contrast pair.",
        },
        {
          question: "What does the Myhill–Nerode theorem characterize?",
          answer:
            "A language is regular iff it has finitely many equivalence classes under the indistinguishability relation (x ~_L y iff ∀z, xz∈L ⟺ yz∈L). The minimal DFA's states correspond 1-1 to these classes — this is the theorem behind DFA minimization; GATE asks for the implication, not the proof.",
        },
        {
          question:
            "Is the halting problem recursively enumerable but not recursive?",
          answer:
            "Yes — the halting language (encodings of pairs (M,w) with M halts on w) is RE (a universal TM can simulate and accept if it halts) but not recursive (diagonalization). GATE asks recognition-level facts: halting = RE not decidable; its complement is not RE either.",
        },
        {
          question:
            "Given a DFA with 6 states, what is the minimum-state equivalent?",
          answer:
            "Apply partition refinement: initial partition {finals, non-finals}; repeatedly split blocks whose members disagree on any symbol's image block; count final blocks. GATE supplies the transition table and asks for the number — always compute rather than guess; 1-mark for a 2-minute trace.",
        },
      ],
      cheat: [
        "Regular ⊂ CFL ⊂ CSL ⊂ RE; closure matrix: CFL not closed under ∩ or ∁.",
        "Pumping: s = xyz, |xy| ≤ p (regular); s = uvwxy, |vwx| ≤ p (CFL) — witness then contradict.",
        "Ambiguous grammar: one string, two parse trees — S → S+S | a with a+a+a.",
        "CNF: A → BC | a; eliminate ε, unit, binarize, terminalize.",
        "Halting RE, not recursive; emptiness/equivalence decidable for regular only.",
        "Myhill–Nerode: finite index ⟺ regular; states of minimal DFA = classes.",
      ],
      recap: `The TOC marathon rewards catalog knowledge over derivation: every question is a lookup into the Chomsky-hierarchy matrix of machines, classes, closures and decidability — because the exam writer works from the same theorem tables, the prepared candidate answers in seconds what the unprepared cannot answer at all.`,
      code: {
        title: "Non-regular proof template",
        language: "text",
        code: "witness s(p); assume split xyz |xy|<=p |y|>=1; pump i=0 or i=2; contradict membership",
        explanation:
          "Every pumping proof ever written on the GATE is these five steps with a swapped witness.",
      },
      diagram: {
        title: "Chomsky hierarchy nesting",
        caption:
          "Regular ⊂ CFL ⊂ CSL ⊂ RE — strict containments with known non-closure witnesses.",
        mermaid:
          "flowchart TD\n  RE --> CSL[CSL]\n  CSL --> CFL[CFL]\n  CFL --> REG[Regular]",
      },
    },
  "gate-cs-pyq-marathons-and-test-strategy-pyq-marathon-compiler-design": {
    intro: `The compiler design PYQ marathon covers what GATE actually asks from compiler theory: lexical analysis, parsing (LL/LR families, FIRST/FOLLOW sets, conflicts), syntax-directed translation, code optimization and runtime structure — the module with high mark density for prepared candidates because every question reduces to a table you fill mechanically.`,
    foundations: `The examinable sequence: (1) lexical analysis — token specification via regular expressions, NFA→DFA (subset construction), DFA minimization; (2) context-free grammars — left recursion elimination, left factoring, ambiguity detection; (3) LL(1) parsing — FIRST and FOLLOW computation, predictive parsing table, conflict detection (FIRST/FIRST, FIRST/FOLLOW); (4) LR parsing — shift-reduce items, LR(0)/SLR item sets, canonical collection, ACTION/GOTO table conflicts, handle pruning (right-sentential form parsing); (5) syntax-directed translation — synthesized vs inherited attributes, S-attributed translation during parsing; (6) intermediate code — three-address code, quadruples/triples, backpatching, boolean short-circuiting; (7) runtime — activation records, static/dynamic scope, registers, calling conventions (parameter passing); (8) optimization — constant folding, copy propagation, dead code elimination, common subexpression elimination, strength reduction, induction variables, data-flow equations occasionally. GATE weight ~2-4 marks; expects table-filling precision.`,
    concepts: [
      {
        title: "FIRST and FOLLOW — computed, never guessed.",
        body: `FIRST(A): terminals that can begin a sentential form derived from A — includes ε only if A ⇒* ε; computed per production until fixpoint, considering leftmost symbols (if first symbol nullable, union its FIRST and the next's). FOLLOW(A): terminals appearing immediately after A in some sentential form — seed FOLLOW($) for the start symbol; each production B → αAβ contributes FIRST(β)\{ε}; if β ⇒* ε, contribute FOLLOW(B). GATE steps through a small grammar and asks for FIRST or FOLLOW of one specific variable — do it with explicit set lists; the fixpoint algorithm (iterate until no change) is the safe procedure; the errors examiners catch are almost always ε-handling slips.
`,
      },
      {
        title: "LL(1) parsing — one lookahead, no backtracking.",
        body: `LL(1) condition: for every production set A → α | β, FIRST(α) ∩ FIRST(β) = ∅, and if either α or β ⇒* ε, they don't both contain ε, and if one does, the other's FIRST must not intersect FOLLOW(A). Predictive parsing table[M[A,a] = production]: fill per production p: for each a ∈ FIRST(α), M[A,a] = A → α; if α ⇒* ε, for each b ∈ FOLLOW(A), M[A,b] = A → α; multiple entries in a cell = conflict = not LL(1). GATE asks to construct the table or identify the conflicting cell — two productions into one cell means the grammar needs left-factoring or isn't LL(1); adding end-markers exposes follow conflicts. PRACTICE building the table for two small grammars — the exam gives you one, the answer is three minutes of disciplined bookkeeping.`,
      },
      {
        title: "LR parsing — shift-reduce with confidence.",
        body: `LR(0) item: production with a dot; closure(I): add all B → •γ for B after dot; goto(I,X): advance dots over X, re-close. Canonical collection: start I = closure({S′ → •S}), enumerate gotos until fixpoint — each unique item set = state; ACTION[state, a]: shift if item A → α•aβ; reduce if item A → α• (complete) — on symbols; accept on S′ → S•; GOTO[state, A] from goto transitions. Conflicts: shift-reduce (item has both •aβ and complete item A → α• — different productions, ambiguous on lookahead without SLR lookahead sets) and reduce-reduce. SLR resolves by restricting reduces to FOLLOW terminals. GATE shows a table (or asks you to fill) and wants "shift/reduce conflict in state k, on terminal c" or a derivation trace. The work is mechanical — know the four actions cold.
`,
      },
      {
        title: "Three-address code and SDT.",
        body: `TAC forms: quadruple (op, arg1, arg2, result), triple (indexed temporaries), indirect triple; short-circuit boolean && || generate conditional jumps (b && c → if !b goto L2; if !c goto L2; goto L1 style); backpatching (truelist/falselist chains patched once targets known) — GATE asks for the generated TAC sequence or the number of temporaries. SDT: synthesized attributes (bottom-up — expression values), inherited (top-down — declared types in symbol tables); S-attributed grammars (synthesized only) are LALR-friendly; L-attributed allowed left-to-right evaluation. GATE 1-marker: classify attribute or identify evaluation order — inherited = before use in children; synthesized = after children evaluated.
`,
      },
      {
        title: "Code optimization — the algebra of free speed.",
        body: `The asked optimizations: constant folding (evaluate 3+5 at compile time), copy propagation (replace x = y; ...; z = x+1 with z = y+1), dead code elimination (delete assignments never read), CSE (common subexpression — compute a+b once), strength reduction (multiply → shift for powers of two; x*2 → x<<1), induction variable elimination, loop invariant code motion, algebraic simplification (x+0, x*1). GATE shows a TAC fragment and asks "how many temporaries can be eliminated" or to apply one specific optimization and write the result — always forward only, never rewrite semantics; the questions are 1-mark and mechanical once you rehearse five examples.
`,
      },
    ],
    worked: [
      {
        title: "FIRST/FOLLOW for S → A B, A → a A | ε, B → b.",
        body: `FIRST(A): ε via ε-production, {a} via aA → {a, ε}. FIRST(B) = {b}. FIRST(S) = FIRST(A) ⊇ {a}; A ⇒* ε ⟹ include FIRST(B) = {b} → FIRST(S) = {a, b}. FOLLOW: seed FOLLOW(S) = {$}. For S → A B: FOLLOW(A) gets FIRST(B) = {b}; also A nullable? No — A has ε: yes, A ⇒* ε means FIRST(B) included (done) AND if B ⇒* ε then FOLLOW(S) into A — B not nullable (B → b) so no. FOLLOW(B) gets FOLLOW(S) = {$}. Result: FOLLOW(A) = {b}, FOLLOW(B) = {$}. GATE asks for FIRST or FOLLOW — this exact shape, three productions, done in 2 minutes.
`,
      },
      {
        title: "LL(1) table cell conflict in A → a A | ε.",
        body: `FIRST(aA) = {a}, FIRST(ε) = {ε} — disjoint, fine. Fill: M[A, a] = A → aA; for ε and b ∈ FOLLOW(A), M[A,b] = A → ε. If FOLLOW(A) contains a — conflict (cell A,a gets both) — the grammar as given may not be LL(1) if follow includes a; every such grammar fails here unless follow excludes FIRST(aA). The exam's trick question: "is this grammar LL(1)?" — answer via the disjointness test, not by building the table first.
`,
      },
      {
        title: "Shift-reduce trace of id + id * id.",
        body: `Grammar E → E + T | T; T → T * F | F; F → id. Stack trace: push id, reduce F → F+T? no: shift *id, ... full trace: s id r F s + s id r F? — the key states: at "E + id" with lookahead *, choose reduce E → T? no — the precedence rule embedded in grammar structure (* binds tighter via deeper derivation). Known answer: the parse yields ((id + id) * id) or (id + (id * id))? Grammar parses right-associative at same precedence — E → E+T with T → T*F gives left-assoc + and left-assoc * — id+id*id parses as id+(id*id) ✓. GATE asks derivation steps or final tree shape — watch for the right associativity through T → T*F vs F*T.
`,
      },
      {
        title: "TAC for a = b + c * d, count temporaries.",
        body: `t1 = c * d; t2 = b + t1; a = t2 — two temporaries. With optimization: a = b + c*d directly expressible only in triple notation? In TAC the minimal count is 2; GATE asks "how many temporaries" or "write the intermediate code" — write exactly two; the exam occasionally asks what CSE could do here (nothing — no repeats) — answer defensively with the exact procedure.
`,
      },
    ],
    exam: [
      {
        question:
          "What does an LL(1) grammar require for FIRST sets of alternatives?",
        answer:
          "For each nonterminal with multiple productions A → α | β, FIRST(α) ∩ FIRST(β) = ∅; and if α ⇒* ε then FIRST(β) ∩ FOLLOW(A) = ∅ — the two conditions fully characterize LL(1) (plus no left recursion and no ambiguity).",
      },
      {
        question: "In LR parsing, what does a shift-reduce conflict indicate?",
        answer:
          "The grammar is not SLR/LR(0)-deterministic at that state — one item wants to shift terminal a, another (completed item) wants to reduce on a; SLR resolves by checking if a ∈ FOLLOW(reduction LHS); if yes both actions legal → conflict → grammar ambiguous or not in the class. The exam asks to identify which terminal conflicts and in which state.",
      },
      {
        question:
          "Which attribute type is used for values computed from children?",
        answer:
          "Synthesized attributes (bottom-up) — e.g., the value of an expression computed from its subexpressions; inherited attributes flow top-down (symbol table types for declarations). S-attributed = synthesized only; L-attributed = synthesized + inherited evaluable left-to-right.",
      },
      {
        question: "What does constant folding eliminate?",
        answer:
          "Compile-time-evaluable expressions — 3*4/2+1 becomes 7 at compile time; the win: zero runtime ops, enabling further optimizations (dead code elimination on folded branches, address computation). GATE's definition question expects exactly this sentence plus impact.",
      },
    ],
    cheat: [
      "FIRST: leftmost terminals; ε if nullable; closure over productions.",
      "FOLLOW: seed $; FIRST of what follows; propagate FOLLOW of container if trailer nullable.",
      "LL(1): FIRST/FIRST disjoint + no ε-follow collision; conflicts = not LL(1).",
      "LR items: closure + goto; states; shift/reduce/accept/GOTO; SLR uses FOLLOW for reduces.",
      "Synthesized bottom-up, inherited top-down; S-attributed parses cleanly.",
      "Optimizations: fold, propagate, CSE, DCE, strength reduction, invariant motion.",
    ],
    recap: `Compiler questions are deterministic bookkeeping: FIRST/FOLLOW closure tables, item-set enumeration, attribute flow, temp counting — because the procedure is finite and fixed, the candidate who rehearses it twice walks in with every mark the module offers, and the one who memorizes definitions without the procedure walks out empty.`,
    code: {
      title: "FIRST computation pattern",
      language: "text",
      code: "FIRST(A) = union of FIRST(symbols until non-nullable); iterate to fixpoint",
      explanation:
        "Left-to-right accumulation with fixpoint — the whole algorithm in one line.",
    },
    diagram: {
      title: "Frontend pipeline",
      caption:
        "Chars → tokens → parse tree → attributed tree → TAC — each arrow one transformation you must know by name.",
      mermaid:
        "flowchart LR\n  C[Chars] --> L[Lexer]\n  L --> P[Parser]\n  P --> S[SDT]\n  S --> T[TAC]",
    },
  },
  "gate-cs-pyq-marathons-and-test-strategy-pyq-marathon-operating-systems": {
    intro: `The operating systems PYQ marathon covers the most mark-dense systems module on GATE: scheduling algorithms, synchronization, deadlocks, memory management (paging/segmentation/virtual memory), page replacement, file systems, and disk scheduling — the topics where textbook procedure plus ten rehearsals equals guaranteed marks.`,
    foundations: `The examinable cores: (1) scheduling — FCFS/SJF/SRTF/ROUND ROBIN/PRIORITY; Gantt charts, average waiting time (AWT), turnaround time (TAT); (2) synchronization — semaphores, mutexes, critical section requirements (mutual exclusion, progress, bounded waiting), Peterson's algorithm, readers-writers, dining philosophers, producer-consumer; (3) deadlocks — four conditions (mutual exclusion, hold-and-wait, no preemption, circular wait), resource allocation graphs (cycle = deadlock for single instance), banker's algorithm (safe sequence), detection/prevention/avoidance, wait-die/wound-wait timeouts; (4) memory — paging (frame/offset split, page tables, TLB, two-level tables), segmentation, fragmentation (internal/external), compaction; (5) virtual memory — demand paging, page replacement (OPT/FIFO/LRU/LFU/MFU/ARC), page faults, working set, thrashing; (6) disks — SSTF/SCAN/C-SCAN/LOOK limiting heads, RAID levels basics, block allocation (contiguous/linked/indexed), free space management. GATE weight ~6-8 marks — skip none of this.`,
    concepts: [
      {
        title: "Scheduling — Gantt chart fluency.",
        body: `Draw the Gantt chart in order of arrival; for preemptive SRTF recompute remaining times on every arrival; TAT = completion − arrival; WT = TAT − burst; AWT = mean of WTs; response time = first-run − arrival. RR: circular order with quantum q — every time the quantum expires with remaining > 0, the process re-enqueues (at the END of the ready queue); tie-breaking rules: lower PID or listed order on equal-priority/equal-arrival. FCFS with convoy effect, SJF minimizes AWT (non-preemptive optimal for this criterion — GATE proof sketch), starvation in priority (aging fixes by increasing priority with wait time). GATE 2-marker: complete the chart, give AWT/TAT to two decimals — practice drawing 5 charts until the procedure is reflexive.`,
      },
      {
        title: "Synchronization — semaphores and the critical section.",
        body: `Critical section requirements: mutual exclusion, progress, bounded waiting. Peterson's algorithm: flag turn + busy-wait — guarantees exclusion (proof: if both in, turn forces one out) — only correct for 2 processes. Semaphore ops: P()/wait() (decrement, block if <0), V()/signal() (increment, wake); binary semaphore = mutex (only mutual exclusion job); counting semaphore = resource pool (buffer slots). GATE asks: which requirement fails in the given solution; how many P/V to share N buffer slots (N producers, 1 consumer — counting N empty, 0 full... standard producer-consumer with semaphores mutex=1, empty=N, full=0); readers-writers: first reader takes rw_lock, last releases — writers starve; writers-priority variant adds writing-count gate. Trace interleavings line by line — the exam gives 4-6 line code and asks what happens when x and y run together.`,
      },
      {
        title: "Deadlocks — the four conditions and the banker.",
        body: `Four necessary conditions (all four must hold — break one to prevent): mutual exclusion, hold-and-wait, no-preemption, circular wait. Resource allocation graph (RAG): cycle present in AND resources (single instance) ⟹ deadlock certain; cycle in OR resources (multi instance) ⟹ deadlock possible only — need to evaluate. Banker's algorithm: given Max/Allocation/Available for n processes × m resources — find Need = Max − Alloc, iteratively find a process whose Need ≤ Available (safe), pretend it runs to completion releasing all; if all processes finish → safe state; if stuck → unsafe (not necessarily deadlock — unsafe means deadlock possible, deadlock means stuck for real with all blocked). GATE asks: compute safe sequence or determine safety — execute the algorithm on paper with the matrices; also wait-die/wound-wait for distributed deadlocks rarely appears.`,
      },
      {
        title: "Paging and virtual memory — the hardware math.",
        body: `Address split: virtual address → page number + offset; page size 4 KB → offset 12 bits; two-level tables (10+10 bits); TLB caches PTE → effective access time EAT = (1−h) × (1 + mem) + h × mem... formula: EAT = h·(t_hit + t_mem) + (1−h)·(t_hit + t_mem + t_mem) — every variant reduces to hit-path and miss-path probabilities. Page replacement: OPT (evict farthest future — unimplementable bound, best case), FIFO (belady's anomaly — more frames MORE faults — guaranteed on GATE exams), LRU (evict least recently used — stack algorithm, no anomaly, ideal in practice), LFU/MFU (frequency based, suffers early-once-burst staleness), second-chance/Clock approximation. GATE asks to trace a reference string with N frames under FIFO/LRU/OPT and count faults — fill the frame table on paper; mark optimal-vs-achievable gap.`,
      },
      {
        title: "File systems and disks.",
        body: `Block allocation: contiguous (fast, external fragmentation, growing impossible), linked (no fragmentation, no random access, broken chains fatal — FAT fixes with table), indexed (inode with block pointers — direct/single/double/triple indirect: 12 direct + 1 single → 12+256 blocks of 4 KB ≈ 1.05 MB with direct+single, +double ≈ 256×256×4 KB ≈ 263 MB, +triple in tens of GB). Disk scheduling: SSTF (nearest first — starvation), SCAN (elevator — sweeps either direction, arrives at ends then reverses), C-SCAN (one-way sweeps, jumps back to start), LOOK/C-LOOK (reverse at extreme REQUESTS not disk ends). GATE gives a request sequence + head position and asks total head movement — trace each algorithm on paper; the distinction SCAN vs LOOK costs marks every year.
`,
      },
    ],
    worked: [
      {
        title:
          "Round-robin with quantum 2: P1(5), P2(4), P3(1) all arrive at 0.",
        body: `Order: P1 P2 P3 P1 P2 P1 P1. Timeline: 0-2 P1 (rem 3), 2-4 P2 (rem 2), 4-5 P3 (done), 5-7 P1 (rem 1), 7-9 P2 (done), 9-10 P1 (done). TAT: P1 = 10−0 = 10, P2 = 9−0 = 9, P3 = 5−0 = 5. WT = TAT − burst: P1 = 5, P2 = 5, P3 = 4. AWT = (5+5+4)/3 ≈ 4.67. GATE asks AWT to 2 decimals — copy this procedure exactly; tie P3 with P1 at re-enqueue: listed order decides.
`,
      },
      {
        title:
          "FIFO page replacement, 3 frames, reference: 1 2 3 4 1 2 5 1 2 3 4 5.",
        body: `Frames empty: 1→1, 2→1,2, 3→1,2,3, 4→fault evict 1 (oldest) → 2,3,4; 1→fault evict 2 → 3,4,1; 2→fault evict 3 → 4,1,2; 5→fault evict 4 → 1,2,5; 1→hit; 2→hit; 3→fault evict 1 → 2,5,3; 4→fault evict 2 → 5,3,4; 5→hit. Total faults: count the misses = 9. GATE gives the string and asks for fault count or which frames hold at end — mark each step in a table; LRU would give fewer (verify for practice: LRU faults = 10? compute both, compare — Belady territory).
`,
      },
      {
        title: "Banker's algorithm: safe or not?",
        body: `Max/Alloc: P1 max(7,5,3) alloc(0,1,0); P2 max(3,2,2) alloc(2,0,0); P3 max(9,0,2) alloc(3,0,2); P4 max(2,2,2) alloc(2,1,1); P5 max(4,3,3) alloc(0,0,2). Total = (10,5,7); alloc sum = (7,2,5); avail = (3,3,2). Need: P1(7,4,3), P2(1,2,2), P3(6,0,0), P4(0,1,1), P5(4,3,1). Find ≤ avail: P2 need (1,2,2) ≤ (3,3,2) ✓ → after: avail = (3,3,2)+(2,0,0) = (5,3,2). P4 (0,1,1) ≤ (5,3,2) ✓ → avail = (7,4,3). P5 (4,3,1) ≤ (7,4,3) ✓ → avail = (7,4,5). P1 (7,4,3) ≤ ✓ → avail = (7,5,5). P3 (6,0,0) ≤ ✓ → avail = (10,5,7). Safe sequence <P2,P4,P5,P1,P3> — all finish. GATE asks exactly this with matrices printed; know the procedure to the bones.
`,
      },
      {
        title:
          "SCAN disk scheduling: head at 53, queue 98 183 37 122 14 124 65 67, disk 0-199.",
        body: `53 → upward: 65, 67, 98, 122, 124, 183, then to 199 (end), reverse: 37? No — SCAN continues to end 199 then reverses: from 199 down to 0: hits 183→… wait we already serviced upward values. Let me redo: head 53 moving up: service 65, 67, 98, 122, 124, 183, continue to 199, then reverse: service 37, 14, done. Total movement: (199−53) + (199−14) = 146 + 185 = 331 tracks. GATE asks for total head movement or the order served — trace on paper; LOOK variant stops reversal at the last request (183) not the disk end: (183−53)+(183−14) = 130+169 = 299.
`,
      },
    ],
    exam: [
      {
        question: "What are the four necessary conditions for deadlock?",
        answer:
          "Mutual exclusion, hold-and-wait, no preemption, circular wait — all four simultaneously; breaking any one prevents deadlock. GATE asks to enumerate or to identify which condition a mechanism eliminates (e.g., preemption kills the no-preemption condition).",
      },
      {
        question: "Which page replacement algorithm exhibits Belady's anomaly?",
        answer:
          "FIFO — increasing the number of frames can increase page faults for certain reference strings; LRU and OPT (stack algorithms) never do. GATE gives a string and asks to compare fault counts at 3 vs 4 frames.",
      },
      {
        question: "What is an address with 12-bit offset in a 4 KB page?",
        answer:
          "Offset is exactly the 12 bits — page size 2^12 = 4 KB, offset bits = log₂ page size; the exam asks to compute page number bits from virtual address bits (virtual bits − 12) or physical frame bits from physical address bits.",
      },
      {
        question: "In SSTF, what is the main fairness weakness?",
        answer:
          "Starvation — requests far from the current head position can be postponed indefinitely as nearer requests keep arriving; SCAN/C-SCAN guarantee bounded waiting. GATE pairs SSTF with its weakness in 1-mark questions regularly.",
      },
    ],
    cheat: [
      "TAT = CT − AT; WT = TAT − burst; RR re-enqueues at end; AWT/TAT to 2 decimals.",
      "Deadlock: mutual exclusion, hold-and-wait, no preemption, circular wait; cycle in single-instance RAG ⟹ deadlock.",
      "Banker's: Need = Max − Alloc; safe if every process can complete in some order.",
      "EAT nesting: h·hit + (1−h)·(hit + 2×mem); TLB miss doubles the cost.",
      "OPT > LRU > FIFO(faults) in practice; Belady's anomaly is FIFO-only.",
      "SSTF starves; SCAN to disk ends; LOOK to last request; C-LOOK one-way.",
    ],
    recap: `OS questions are all drill and no mystery: Gantt charts, frame tables, allocation matrices, disk sweeps — because the examiner chooses from the same deck every year, the candidate who keeps the procedure warm never panics, while the one who reads OS as prose stalls on every 2-marker.`,
    code: {
      title: "Banker safety loop",
      language: "text",
      code: "while unfinished remains: find process Need <= Available; mark finished, release into Available; else unsafe",
      explanation:
        "The complete safety check in three lines — the entire algorithm under the cosmic drapery.",
    },
    diagram: {
      title: "Deadlock decision",
      caption:
        "RAG cycle → is it single-instance? → deadlock; else run the banker; else prevention by resource ordering.",
      mermaid:
        "flowchart TD\n  R[RAG] --> CY{Cycle?}\n  CY -->|yes single instance| D[Deadlock]\n  CY -->|yes multi instance| B[Banker check]\n  CY -->|no| S[Safe for now]",
    },
  },
  "gate-cs-pyq-marathons-and-test-strategy-pyq-marathon-databases": {
    intro: `The databases PYQ marathon drills relational algebra, SQL, normalization, transactions and file organization — the module where GATE's questions are the most mechanical of any subject, and precisely therefore the module where careless candidates lose the most avoidable marks.`,
    foundations: `The examinable core: (1) relational model — schema, instances, keys (super/candidate/primary, foreign), relational algebra (σ select, π project, ⋈ join, ÷ division, ρ rename, outer joins), tuple vs domain calculus; (2) SQL — DDL/DML, aggregates (COUNT/SUM/AVG/MIN/MAX) with GROUP BY and HAVING, nested queries ( correlated / uncorrelated / IN / EXISTS / UNIQUE), NULL semantics (three-valued logic, NOT IN with NULL pitfalls), ORDER BY, joins (inner/outer/natural/cross/self), set operations (UNION/INTERSECT/EXCEPT); (3) normalization — functional dependencies, Armstrong's axioms (reflexivity, augmentation, transitivity), closure of F and of attribute sets, candidate keys (2-set search), 2NF/3NF/BCNF definitions, lossless-join/dependency-preserving decomposition, MVD mention occasionally; (4) transactions — ACID, schedules, conflict/view serializability, precedence graphs, 2PL, strict/rigorous variants, recovery (log-based, checkpointing, deferred/immediate update) occasionally; (5) storage — file organization (heap/ordered/hashed), B/B+ trees (min height given keys/fanout, order), indexing (primary/secondary, sparse/dense), clustering; (6) ER diagrams occasionally. GATE weight ~3-5 marks.`,
    concepts: [
      {
        title: "Relational algebra — the calculus of answers.",
        body: `Master the operators and their closures: σ_<cond>(R) picks tuples (rows), π_attrs(R) projects columns (duplicates eliminated — use with care), ⋈ natural join (equality on common attrs, drop dup columns), θ-join, ÷ division (A÷B = all x in A with all matching y in B for every b in B — "for all" questions), ∪/∩/− set ops (requires union compatibility). GATE asks to write RA for a prose query or evaluate a given expression on tiny tables — both are mechanical when operators are fluent; renaming with ρ is how you disambiguate self-joins (ρ_E1(EMP))... every exam year has one division question; learn ÷ cold — the pattern "students who take ALL of these courses".
`,
      },
      {
        title: "SQL — the three-valued logic traps.",
        body: `NULL propagates: anything = NULL is UNKNOWN; three-valued logic (TRUE/FALSE/UNKNOWN); WHERE keeps only TRUE — UNKNOWN drops the row! WHERE NOT IN (subquery containing NULL) yields NO rows ever — classic GATE trap, celebrated in every paper. COUNT(*) counts rows, COUNT(col) skips NULLs, COUNT(DISTINCT x) distinct non-nulls; SUM/AVG ignore NULLs; aggregates over empty set: COUNT=0, others NULL; GROUP BY groups, HAVING filters groups post-aggregation (WHERE filters pre). EXISTS tests row-at-least-one (NULL-safe); IN equivalent but NULL-fragile. GATE questions on NULLs and aggregates recur every year — rehearse the semantics, not the syntax.
`,
      },
      {
        title: "Functional dependencies and closure.",
        body: `Armstrong's axioms: reflexivity (Y ⊆ X ⟹ X → Y), augmentation (X → Y ⟹ XZ → YZ), transitivity (X → Y, Y → Z ⟹ X → Z); derived: union, decomposition, pseudo-transitivity. Attribute closure X⁺: start {X}, apply every FD whose LHS ⊆ current set, add RHS, repeat to fixpoint — X is a candidate key iff X⁺ = all attrs and no proper subset's closure does. GATE asks to compute keys (small schema, 6 attrs, 4 FDs) or check if FD set implies another. The algorithm: list candidate keys via left-reduced FDs (minimal left sides, un... attr never on RHS) — for 6 attrs, |FDs| small, enumerate by hand — budget 4 minutes.
`,
      },
      {
        title: "Normal forms — mechanical classification.",
        body: `2NF: no partial dependency of non-prime attributes on a proper subset of a candidate key (only matters with composite keys); 3NF: for every nontrivial FD X → A, either X is a superkey or A is prime; BCNF: EVERY nontrivial FD's determinant is a superkey. BCNF ⊂ 3NF ⊂ 2NF strictly. GATE shows a schema + FDs, asks highest normal form or decomposition into BCNF; decomposition lossless-join check: split into R1(X∪Y), R2(R−Y+X... shared attrs X⁺ must cover shared attrs as PK of one side: if X → (X∩Y) for one of the parts — test via closure; dependency preservation: every original FD inferable from the FDs projected onto each part — test by union of closures. Also normalization cap: if a relation is already in BCNF, more steps are pointless — GATE asks to stop.
`,
      },
      {
        title: "Transactions — the schedule Sudoku.",
        body: `Conflict operations: same item, different transactions, at least one write — order matters. Precedence graph: edge Ti → Tj if some op Ti before same-item op Tj conflicts; acyclic ⟺ conflict serializable. View serializability is broader (blanks) but GATE rarely tests it. Recoverable schedule: Ti commits only after transactions whose writes it read commit; cascadeless: nobody reads uncommitted; strict: no write before commit (hold locks until commit) — the strictest gives trivial recoverability. 2PL: growing phase (acquire, never release), shrinking phase (release, never acquire) — guarantees conflict serializability; strict 2PL holds exclusive locks to commit (deadlock possible — it's price of simplicity); rigorous 2PL holds both shared and exclusive to commit. GATE asks: draw graph, detect cycle, name property, or identify 2PL phase violation — all 2-minute procedures.
`,
      },
    ],
    worked: [
      {
        title:
          "SQL: find employees whose salary exceeds every analyst's salary.",
        body: `SELECT name FROM emp WHERE salary > ALL (SELECT salary FROM emp WHERE dept='AN'); — or MAX: WHERE salary > (SELECT MAX(salary) FROM emp WHERE dept='AN'). ALL/ANY/SOME quantifiers — GATE asks to rewrite ALL as MAX comparison; note ALL over empty set is TRUE (all vacuously satisfy) — mirrored trap with ANY (false over empty set). EXISTS variant: WHERE NOT EXISTS (SELECT 1 FROM emp WHERE dept='AN' AND salary >= emp.salary) — the correlated complement; GATE asks for both forms and their equivalence conditions.
`,
      },
      {
        title: "Candidate keys of R(A,B,C,D) with F = {AB→C, C→D, D→A}.",
        body: `Compute closures: B alone: B⁺={B} — not key. AB: A,AB→C (add C), C→D (add D) → ABCD ✓ superkey; subset A: A⁺={A} ✗; B ✗ → AB candidate. BC: B,C→D with C→D add D; D→A add A → ABCD ✓; subset B ✗, C: C→D→A → ACD ✗ (B missing) → BC candidate. BD: B,D→A (D→A) add A; A,B→C (AB→C) add C → ABCD ✓; B ✗, D: D→A, A... AB needs B — D⁺={D,A} ✗ → BD candidate. CD: C→D, D→A, AB→C?? need B — C⁺={A,C,D}... with B: CD⁺: C,D→A (D→A) add A; need B, not generatable → ACD not ABCD → CD NOT superkey. Candidates: AB, BC, BD. GATE asks exactly this — closure sweeps, one minute per left set.
`,
      },
      {
        title: "Highest normal form of R(A,B,C,D) F={AB→C, C→D, D→B}.",
        body: `Keys: AB (AB→C→D→B ✓); BD? B,D ∈ via C→D,D→B? check AB only: CD: C→D,D→B → BCD plus C... CD⁺ = C,D,B — missing A — not key. Candidates: AB only. R in 2NF? AB→C, C must not depend on A or B alone ✓ (A⁺=A, B⁺=B) ✓. 3NF? AB→C: AB superkey ✓; C→D: C not superkey, D prime? D ∈ AB? No → violation? For 3NF: X→A holds either X superkey or A prime — C→D: C not superkey, D not in candidate AB — wait, is D prime in any candidate? Only candidate AB → D not prime → 3NF fails. BCNF also fails (any determinant non-superkey). So highest = 2NF exactly. GATE asks this question with variant FD sets — the classification walk is mechanical.
`,
      },
      {
        title:
          "Conflict serializability: schedule r1(A) r2(A) w1(A) w2(B) r1(B).",
        body: `Conflicts: r1(A) vs w1(A) same tx — skip. Across: r1(A) vs r2(A) no. w1(A) vs r2(A): r2(A) before w1(A) — order T2 before T1 → edge T2→T1. w1(A) vs w2(B) different items — none. w2(B) vs r1(B): w2(B) before r1(B) → T2→T1. Precedence edges: T2→T1 only — acyclic ⟹ conflict serializable; equivalent serial: T2, T1. GATE supplies the schedule and asks serializability Y/N + reason — draw the graph instantly; one cycle ends the story (not serializable), no cycle is the full answer.
`,
      },
    ],
    exam: [
      {
        question: "What is the difference between COUNT(*) and COUNT(column)?",
        answer:
          "COUNT(*) counts every row including those with NULLs; COUNT(column) counts only rows where column is NOT NULL; COUNT(DISTINCT col) counts distinct non-null values. The exam uses a table with NULLs and expects three different numbers from three different COUNT forms.",
      },
      {
        question: "What makes an FD violate BCNF but not 3NF?",
        answer:
          "X → A where X is not a superkey but A is prime (contained in some candidate key) — such an FD is allowed in 3NF (a prime RHS exception) and forbidden in BCNF. The classic 3NF-but-not-BCNF example: R(A,B,C), F = {AB→C, C→B} — C→B: C not superkey but B prime → legal 3NF, illegal BCNF.",
      },
      {
        question: "What does a cycle in a precedence graph imply?",
        answer:
          "The schedule is not conflict serializable — there is no equivalent serial execution. Cycles are the entire content of the acyclicity test; GATE shows the graph and asks for the two transactions forming the cycle or yes/no.",
      },
      {
        question: "What does ÷ division express in plain English?",
        answer:
          "'For all' — A÷B gives every tuple in A that pairs with EVERY tuple in B (e.g., students who enrolled in every required course). GATE asks to write the expression for a prose query; it's the one non-obvious operator on the syllabus and always the discriminating question.",
      },
    ],
    cheat: [
      "σ rows, π cols, ⋈ join on common attrs; ÷ = 'for all' — the ALL-courses question.",
      "NULL is UNKNOWN; WHERE NOT IN (subquery with NULL) = empty result — famous trap.",
      "Armstrong: reflexivity, augmentation, transitivity; closure = fixpoint iteration.",
      "BCNF every determinant a superkey; 3NF allows RHS prime; 2NF no partial dependency on key subsets.",
      "Precedence graph acyclic ⟺ conflict-serializable; edge per conflicting pair order.",
      "2PL: growing then shrinking; strict holds to commit; rigorous holds everything to commit.",
    ],
    recap: `Database questions reward prepared arithmetic: closures, decompositions, graph cycles, four-bit tables — because the module's entire appeal for the exam board is that it is gradeable by procedure, the rehearsed candidate banks every mark while the improviser drowns in subclause order and comma placement.`,
    code: {
      title: "Closure sweep",
      language: "text",
      code: "X' = X; repeat for each FD A->B with A ⊆ X': X' ∪= B; until fixpoint; key iff X' = all and minimal",
      explanation:
        "Four lines — the complete algorithm behind every candidate-key question ever asked.",
    },
    diagram: {
      title: "Normalization ladder",
      caption:
        "BCNF ⊂ 3NF ⊂ 2NF ⊂ 1NF — each rung removes one redundancy class; climb until they ask to stop.",
      mermaid:
        "flowchart TD\n  BCNF --> NF3[3NF]\n  NF3 --> NF2[2NF]\n  NF2 --> NF1[1NF]",
    },
  },
  "gate-cs-pyq-marathons-and-test-strategy-pyq-marathon-computer-networks": {
    intro: `The computer networks PYQ marathon drills TCP/IP layering, addressing, routing algorithms, flow and congestion control, sliding windows and error detection — the systems module where numerical fluency (counting packets, windows, subnets) earns the most marks per minute of the exam.`,
    foundations: `The examinable sequence: (1) models — OSI 7-layer vs TCP/IP 4-layer mapping, encapsulation/decapsulation, protocol↔layer matching; (2) error control — CRC generation/checking, parity, checksum (Internet checksum — 16-bit one's complement); (3) framing — character/bit stuffing occasionally; (4) data link — MAC addresses, ARP resolution, Ethernet structure, switches vs hubs; (5) IP — IPv4 addressing, subnetting (CIDR, VLSM, supernetting), private/reserved ranges (10/8, 172.16/12, 192.168/16, 127/8, link-local 169.254/16), IPv6 basics (128-bit, :: compression, IPv6 fragments differently — router no longer fragments); (6) routing — distance vector (RIP — count-to-infinity, split horizon, poisoned reverse), link state (Dijkstra SPF), BGP path-vector, longest-prefix-match, administrative distance occasionally; (7) transport — TCP (3-way handshake, seq/ack numbering, sliding window flow control, congestion control — slow start, AIMD, thresholds, RTT estimation occasionally), UDP; MSS/MTU math, segment size calculations; (8) application — DNS resolution chain, DHCP DORA occasionally, HTTP methods/status codes. GATE weight ~3-5 marks.`,
    concepts: [
      {
        title: "CRC and checksum — the arithmetic penance.",
        body: `CRC: choose generator polynomial (e.g., x⁴+x+1 = 10011); copy data, append n zeros (n = generator degree); divide by generator with XOR subtraction (no borrows, no carries); remainder = FCS; transmitted frame = data + FCS; receiver divides, zero remainder = no error (and detects burst errors ≤ n bits). GATE asks: given data+generator, find transmitted bits — polynomial long-division on paper (XOR at each step); verify with n = small. Internet checksum: sum 16-bit words with wraparound carry, one's complement the result; receiver sums including checksum → all-ones = valid; GATE shows words and asks for the checksum — add, wrap, complement.`,
      },
      {
        title: "Subnetting — VLSM mental arithmetic.",
        body: `Host bits h, subnet bits s: hosts per subnet = 2^h − 2 (minus network and broadcast); subnets = 2^s. Given IP 192.168.10.77/26: mask 255.255.255.192, block size 64 — network 192.168.10.64, broadcast .127, usable .65–.126. Supernet/CIDR aggregation: adjacent same-size blocks with common prefix collapse (summarize) — GATE asks for the aggregate route; discontiguous/overlay traps occasionally appear. IPv6: 128 bits, 8 hextets, :: for one longest zero run, leading zeros dropped, two-field comparison by nibble math. GATE asks to convert or validate (is this valid IPv6 compression? — exactly one :: only, total non-zero groups ≤ 8).
`,
      },
      {
        title: "Routing tables and longest-prefix match.",
        body: `Each entry = destination prefix + next hop + metric; lookup rule: longest matching prefix wins, ties broken by administrative distance, then metric. Distance vector (RIP): each router tells neighbors its distance vector; poison updates to prevent count-to-infinity; slow convergence known; link state (OSPF): floods link-state advertisements, each router builds topology, runs Dijkstra — O(V + E log V) convergence; count-to-infinity impossible. GATE asks: given routing table and destination, pick outgoing interface (apply longest-prefix + AD order), or RIP update sequence — trace rounds until stable, mark "infinity = 16" threshold. The order longest-prefix → AD → metric never varies.
`,
      },
      {
        title: "TCP arithmetic — windows, seq numbers, MSS.",
        body: `Handshake: SYN (seq=x), SYN-ACK (seq=y, ack=x+1), ACK (ack=y+1); connection established, next data bytes carry seq from x+1/y+1. Flow control: receiver window (rwnd) advertised in every segment; sender may not have more than rwnd unacknowledged bytes outstanding. MSS = MTU − 40 (20 IP + 20 TCP); 1500 MTU → 1460 MSS; segmentation computed by dividing message size by MSS (ceiling), multiply by 40 overhead for wire footprint. Congestion: slow start (cwnd doubles per RTT until ssthresh), congestion avoidance (linear +1/RTT), triple duplicate ACK → fast retransmit (halve ssthresh/cwnd), timeout → cwnd=1. GATE asks: number of segments for X-byte message, rwnd limit on in-flight bytes, cwnd after k RTTs in slow start from 1.`,
      },
      {
        title: "DNS and common port/protocol matching.",
        body: `DNS: recursive resolution — stub resolver → recursive resolver → root servers → TLD (.com) → authoritative — the exam tests the sequence and WHO queries WHAT (stub asks recursive; recursive iterates; authoritative answers with TTL cached at every hop). Record types: A (IPv4), AAAA (IPv6), MX (mail), CNAME (alias), NS (name server), PTR (reverse), SOA. Protocol-port 1-markers recurring: HTTP 80, HTTPS 443, FTP 20/21 (data/control), SSH 22, Telnet 23, SMTP 25, DNS 53 (UDP default), DHCP 67/68, SNMP 161, POP3 110, IMAP 143. Write the table once, recite it until automatic — the exam spends 5 such marks.
`,
      },
    ],
    worked: [
      {
        title: "CRC: data 1010, generator 1001 — compute FCS.",
        body: `Generator degree 3 → append 3 zeros: 1010000. XOR-divide: 1010000 ⊕ 1001-align... step: take 4 bits '1 0 1 0' XOR '1 0 0 1' = '0 0 1 1' → bring down next bit → '0 1 1 0' (leading zero) → '1 1 0 1' → XOR '1 0 0 1' = '0 1 0 0' → bring down last '0' → '1 0 0 0' XOR '1 0 0 1' = '0 0 0 1' → remainder 001. FCS = 001; transmitted = 1010 001. Verify: receiver divides 1010001 by 1001 → remainder 000 ⟹ accepted. GATE asks for transmitted frame — execute the division slowly; it's pure bookkeeping.
`,
      },
      {
        title:
          "Subnetting 172.16.0.0/16 into /24s for 4 departments, 100 hosts each.",
        body: `/24 gives 254 hosts ✓ per department. Subnets needed 4 → 172.16.0.0/24, 172.16.1.0/24, 172.16.2.0/24, 172.16.3.0/24; all in 172.16.0.0/16; broadcast each .255; gateway usually .1; VLSM permits mixing /25s elsewhere later. GATE asks: usable hosts per subnet (254), total subnets (2⁸ = 256), aggregate (172.16.0.0/16). The arithmetic is pure powers of two — 30 seconds of work, guard the marks.
`,
      },
      {
        title: "TCP: 5 MB file over 1460-byte MSS — how many segments?",
        body: `5×1024×1024 = 5,242,880 bytes; segments = ⌈5,242,880 / 1460⌉ = ⌈3590.33⌉ = 3591 segments. Wire cost = 3591 × (1460 + 40) = 5,390,850 bytes (~2.8% overhead). GATE asks segment count or overhead. The ceiling function is the detail being tested — never round down.
`,
      },
      {
        title:
          "Longest-prefix lookup: 10.0.1.5 with table {10.0.0.0/8 via A, 10.0.1.0/24 via B, 10.0.1.4/32 via C}.",
        body: `All three match; longest prefix = /32 (C) → next hop C. If /32 absent → /24 (B); else /8 (A). GATE supplies tables with 4-5 entries and other distractors (different AD); the rule is absolute — never break the longest-prefix tie except by the specified AD/metric ordering.
`,
      },
    ],
    exam: [
      {
        question:
          "Which layer removes the IPv4 TTL and recomputes header checksum?",
        answer:
          "Network layer (IP, layer 3) — every router decrements TTL and recomputes the header checksum; IPv6 removed checksum entirely (relies on link/transport CRC) — the recurring IPv6-vs-IPv4 exam contrast.",
      },
      {
        question:
          "How does distance vector differ from link state in convergence?",
        answer:
          "Distance vector shares full vectors with neighbors only — slow convergence, count-to-infinity possible, mitigated by split horizon with poisoned reverse; link state floods LSAs to ALL routers, each computes shortest paths via Dijkstra on the complete topology — fast, consistent, but chatty flooding and heavier memory/CPU at scale.",
      },
      {
        question:
          "In a sliding window protocol with window 4 and sequence space 8, how many unacked frames may be outstanding?",
        answer:
          "4 — the window size caps outstanding unacknowledged frames regardless of sequence space; sequence space 8 > 4 and > 2×window-1 avoids wraparound ambiguity (GBN needs seq ≥ 2w+1... the exam checks which side of the bound the sequence space falls).",
      },
      {
        question: "What UDP-use cases does GATE consider canonical?",
        answer:
          "DNS queries (usually), streaming media, VoIP, gaming, DHCP — where speed matters more than guaranteed delivery/order and the application handles loss; TCP is asked as the counterweight (HTTP, SMTP, FTP, SSH — all TCP).",
      },
    ],
    cheat: [
      "OSI → TCP/IP map: app+pres+session→app, transport→transport, network→internet, link+phys→link.",
      "CRC: XOR division, FCS = remainder; checksum: 16-bit sum wrap, one's complement.",
      "Subnet: 2^h − 2 hosts; CIDR aggregation; IPv6 one :: max.",
      "Longest prefix wins; AD breaks ties; RIP infinity=16; OSPF = Dijkstra everywhere.",
      "TCP: handshake SYN→SYNACK→ACK; MSS = MTU−40; slow start cwnd doubling to ssthresh.",
      "DNS stub → recursive → root → TLD → authoritative; TTL caches every hop.",
    ],
    recap: `Networks reward the table-and-formula mindset: polynomials long-divided, addresses carved by mask arithmetic, packets counted by ceilings and windows — because the module is a finite list of procedures, the candidate who rehearses them once walks in able to bank the 3 to 5 marks the paper always offers, no more study required.`,
    code: {
      title: "TCP segment ceil",
      language: "text",
      code: "segments = ceil(bytes / (MSS)); MSS = MTU - 40; in-flight <= rwnd",
      explanation:
        "Three expressions — the entire TCP-arithmetic exam answer space in one line.",
    },
    diagram: {
      title: "Encapsulation stack",
      caption:
        "Data → TCP/UDP segment → IP packet → frame → bits — each layer adds a header and a promise.",
      mermaid:
        "flowchart TD\n  APP[Application data] --> TR[Transport segment]\n  TR --> NET[Network packet]\n  NET --> LNK[Link frame]\n  LNK --> PHY[Bits]",
    },
  },
  "gate-cs-pyq-marathons-and-test-strategy-pyq-marathon-aptitude-sprint": {
    intro: `The aptitude sprint is GATE's general-aptitude module compressed into one 75-minute pass: verbal, quantitative, logical reasoning, spatial puzzles and data interpretation — fifteen guaranteed marks split roughly 60/40 verbal/quantitative, graded on raw speed and reflex more than on content.`,
    foundations: `The exact syllabus: (1) verbal — reading comprehension (inference, tone, vocabulary-in-context), grammar (subject-verb agreement, tense consistency, articles/prepositions in GATE context), sentence correction, analogies; (2) quantitative — percentages, ratios, averages, profit/loss, time-speed-distance, work, series, permutation/combination, probability basics; (3) logical reasoning — series completion, syllogisms, seating arrangements, blood relations, direction sense, Venn diagrams, coding-decoding, statement-based logic; (4) spatial — figure rotation, mirror/water images (rarely in CS papers), paper folding; (5) data interpretation — tables, bar/line/pie charts — extract numbers fast, compute ratios, answer percentages. Total 15 marks; NEGATIVE marking 1/3 per wrong answer; the audit every year shows accuracy separates toppers from the rest more than knowledge does.`,
    concepts: [
      {
        title: "Verbal in GATE — comprehension beats vocabulary.",
        body: `GATE passages are dense expository prose (science/social science/history of computing) — questions test inference and authorial attitude, never obscure words; strategy: read the LAST paragraph first (thesis lives there), skim body for evidence chain, answer from conclusion backward; note the tone question words — measured, skeptical, cautiously optimistic, wry — pick the least emotional, most hedged option; vocabulary-in-context: replace the sentence's meaning with a neutral synonym, ignore the word's other meanings. Grammar questions: subject-verb agreement with compound subjects (neither...nor, either...or, along with) — verb agrees with the nearest subject; parallel structure in lists; tense sequence (reported speech shifts); a/an by first-sound not first-letter (an hour, a university).
`,
      },
      {
        title: "Quantitative — the formula floor.",
        body: `Memorize: percentage traps (x% of y = y% of x — instant), successive changes (a then b → net a+b+ab/100; equal rise then fall r → net −r²/100), ratio & proportion, averages (new average after adding k items = (total+k·x)/count), profit/loss (marked price discount chains, SP = MP(1−d1)(1+...) ), SI/CI (CI compounded annually = P(1+r/100)^n − P; half-yearly rate/2, periods ×2), time-speed-distance (trains — relative speed adding/subtracting, length of train as distance), work (man-days, alternate-day schedules, efficiency ratios), pipe/cistern, mixture (alligation rule — C1*m1 + C2*m2 = C*(m1+m2)), simple series (arithmetic, geometric, alternating, squares/cubes, prime). GATE quant is high-school arithmetic in disguise — speed drill is the only treatment.
`,
      },
      {
        title: "Logical reasoning — the pattern recognition battery.",
        body: `Series: number (difference, ratio, second difference, alternating), letter (A=1 positions, skip counts); if stuck, write absolute differences between terms — the pattern announces itself; syllogisms: draw Venn diagrams for EXACTLY the given statements — deny answers that assume extra relationships; seating: fix one definite person first, enumerate constraints in order of strength; blood relations: draw a family tree with genders and labeled edges — never hold more than one generation in your head; direction sense: track position (N/S meters, E/W) with signed coordinates — final displacement = hypotenuse, bearing = measured from N with sign; coding-decoding: map letter deltas (caesar-style shifts, reverse alphabetical), positional swaps; statement logic: treat given-facts as true, chain implications, find which option FORCES a contradiction.
`,
      },
      {
        title: "Data interpretation — the estimation victory.",
        body: `Tables/barcharts/pie charts in GATE are single-question exercises: read axis labels and units FIRST (every year at least one candidate answers with the wrong denominator), estimate before calculating — eliminate options far off (often two are eliminable on sight), then compute precisely for the rest using ratios over exact numbers; pie charts: compute degrees (slice/total × 360) or percentages (slice/total × 100) — GATE asks for either; percentage-point differences between years: (new−old) directly, NOT relative change — read the question wording to decide which; averages over rows/columns; combined-charts: merge by matching keys. 75 seconds per DI question — the exam rewards dirty estimation as hard as it punishes precise stupidity.
`,
      },
      {
        title: "Time discipline inside the sprint.",
        body: `The aptitude section lives at exam start or end depending on the setter; strategy: pass 1 — answer everything you can do without thought (identification-based, direct), mark for review the tricky ones; pass 2 — 90 seconds max per question on the marked ones; pass 3 — attempt NOTHING else; negative marking punishes heroics. In GATE, aptitude averages 10-11/15 for toppers — those 5 marks of overreach cost more than every algorithm question you got right; because aptitude is the cheapest marks on the paper to secure and the most expensive to gamble wrong, the sprint is a risk management exercise dressed as a knowledge test.
`,
      },
    ],
    worked: [
      {
        title: "Successive discount: 20% then 10% on MP 500.",
        body: `SP = 500 × 0.8 × 0.9 = 360. Net discount = 500−360 = 140 = 28% — NOT 30% (the successive-change formula: 20 + 10 − (20×10/100) = 28%). Every GATE successive-percentage question is this formula with different numbers; the trap is almost always the additivity fallacy.
`,
      },
      {
        title: "Work problem: A alone 12 days, B alone 18 days; both together?",
        body: `Combined rate = 1/12 + 1/18 = 5/36 → 7.2 days. The alternate variant: A and B alternate days starting with A — cycle work per 2 days = 1/12 + 1/18 = 5/36... wait per-day alternating: day1 A: 1/12, day2 B: 1/18 — total per 2 days 5/36; remaining after 6 full cycles (12 days) = 1 − 6×(5/36) = 1 − 5/6 = 1/6 → day 13 A does 1/12 < 1/6 → B finishes day 14. GATE asks the together case (7.2) far more often than the alternation; know both.
`,
      },
      {
        title:
          "Seating: 6 people A–F in a row, C exact center, A left of F, D adjacent E.",
        body: `Positions 1-6; C is position 3 or 4 — for symmetry "the center" of even row is ambiguous, so treat as position 3.5 → GATE must specify C at 4 or "exactly in the middle" of odd count — if literally a case study with 5 people, C at position 3. For 6: solve with cases — the procedure: fix strongest constraints first (C at 4), then A-F ordering, then D-E adjacency — count arrangements, list possibilities, answer from options. GATE rarely demands the full enumeration — matching the option suffices; still eliminate two options by direct contradiction before computing.
`,
      },
      {
        title:
          "DI: pie chart, total 9000; slice for salaries = 120°; average salary in dept?",
        body: `Salary slice fraction = 120/360 = 1/3 → salary budget = 9000/3 = 3000. Given dept heads consume 2/5 of salary budget and there are 12 heads → 3000 × 0.4 = 1200 / 12 = 100 per head average? (Careful: units — 100 per-head means 100 units, maybe thousands.) GATE DI: one number → one conversion → one ratio → option match; the entire exercise never takes 60 seconds once you've done 30 of this shape.
`,
      },
    ],
    exam: [
      {
        question:
          "A sum doubles at simple interest in how many years at 8% per annum?",
        answer:
          "P = SI at 8% for n years ⟹ 8n/100 P = P ⟹ n = 12.5 years. The core: SI = P·r·t/100; doubling means SI = P; solve t = 100/r. The trap is confusing with CI (CI doubles at 100/n years solve 2 = (1+r)^n — not clean; GATE uses CI only when the answer is exact).",
      },
      {
        question:
          "If all Bloops are Razzies and all Razzies are Lazzies, are all Bloops Lazzies?",
        answer:
          "Yes — syllogism transitivity: B ⊆ R ⊆ L ⟹ B ⊆ L. GATE syllogism questions chain two statements; the answer is whichever option preserves the chain (or negates correctly for NOT-type questions); never infer reversals.",
      },
      {
        question:
          "One pipe fills a tank in 6 h; another empties it in 8 h. Both open together — fill or empty, and how fast?",
        answer:
          "Net rate = 1/6 − 1/8 = 1/24 tank per hour filling → full in 24 h. Sign conventions: filling positive, emptying negative; GATE yields a clean 24 always with these rates.",
      },
      {
        question: "What is 15% of 15% of 800?",
        answer:
          "0.15 × 0.15 × 800 = 18. The test is reading order and multiplicative composition — GATE writes it inås word form; compute left to right with fractions: 3/20 × 3/20 × 800 = 9/400 × 800 = 18.",
      },
    ],
    cheat: [
      "Successive %: a+b+ab/100; rise r then fall r → net −r²/100.",
      "Speed-math: 1/12+1/18 = 5/36 → time 7.2; trains add/subtract relative speeds.",
      "SI doubling t = 100/r; CI use (1+r/100)^t only for exact answers.",
      "Direction: signed coordinates; syllogisms: Venn, never reversal; seating: anchor strongest clue.",
      "DI: read units first, estimate before compute, percentage-POINT ≠ relative change.",
      "Negative marking: attempt only >90% sure items; the 1/3 penalty erases 1/3-of-a-mark per miss.",
    ],
    recap: `Aptitude marks are normalization exercises in risk: the rules are few and fixed, the clock is brutal, and the penalty for overreach is absolute — because 15 marks are available every year from high-school arithmetic and fourth-grade logic, the prepared candidate banks them in 40 minutes and lets other candidates lose their nerves over the MST question.`,
    code: {
      title: "Successive change formula",
      language: "text",
      code: "net % = a + b + (a*b)/100",
      explanation:
        "The one formula that dissolves every successive-change trap on the paper.",
    },
    diagram: {
      title: "Aptitude triage",
      caption:
        "Pass 1: zero-thought items; pass 2: memory-backed items; pass 3: none.",
      mermaid:
        "flowchart LR\n  P1[Pass 1: instant] --> P2[Pass 2: 90s drills]\n  P2 --> P3[Pass 3: never]",
    },
  },
  "gate-cs-pyq-marathons-and-test-strategy-full-mock-debrief-method": {
    intro: `The full mock debrief method is the discipline of converting every practice test from a score into a decision set: systematic post-mortem analysis of each mock, tagging every error by type, tracing its root cause, and prescribing the exact corrective action — the only mechanism that turns practice hours into measurable score movement.`,
    foundations: `The post-mock loop: (1) before review — reconstruct the attempt from memory: which questions consumed disproportionate time, where you guessed, where you blanked, where you made "silly" errors; (2) score against the key with a hard classification: correct-with-confidence, correct-by-luck (guessed right), wrong-cause-knowledge-gap, wrong-cause-execution-slip, wrong-cause-misreading, omitted-cause-time, omitted-cause-fear; (3) per-error root-cause mapping to one of five failure families — Concept gap (theory not understood), Procedure gap (formula known, steps muddled), Speed gap (knew, ran out of time), Focus gap (misread, sign error, option leaked), Stamina gap (degraded accuracy late in the paper); (4) prescribe ONE corrective action per family — never generic "study more"; (5) schedule the fix within 48 hours; (6) re-attempt the identical topic from the same mock fortnight later to verify transfer; (7) iterate the taxonomy until the error profile stabilizes. The cycle takes 90 minutes per mock — it is the highest-yield 90 minutes in the preparation.`,
    concepts: [
      {
        title: "The five failure families and their signatures.",
        body: `Concept gap: couldn't determine the approach at all ("I had no idea what to do") — fix: 90 minutes of focused theory on the specific concept, then 10 questions of the same family; Procedure gap: knew the approach, executed midway wrong (misapplied MST on a trick graph, wrong KRUSKAL ordering) — fix: 20 drill repetitions of the exact procedure with time stamps; Speed gap: solved after the fact in review but not in paper time — fix: timed drills at 1.5× exam pace and deliberate skip decisions; Focus gap: arithmetic slips, copied wrong numbers, marked wrong option ("I knew it!") — fix: mandatory habit of re-reading the question stem once before boxing, 5-second unit check; Stamina gap: accuracy drops after question 55 — fix: exam-day routine rehearsal (full-length mock == real exam slot including 3-hour duration and biological clock).
`,
      },
      {
        title: "Confidence calibration — scoring your own certainty.",
        body: `For every marked question, assign certainty buckets A (90%+), B (60-90%), C (30-60%), D (<30%). Analysis: A should be ~100% accurate — any error here is fatal (repair immediately, address the concept); B errors are informational (fix via drill density); C errors are expected — guessing strategy: with negative marking, D should always be skipped — scoring model: expected marks = Σ P(correct)×m − P(wrong)×m/(options−1). Recompute the paper's EV with only A+B attempts vs full attempt — almost always A+B wins on wrong-heavy papers. GATE's negative marking makes calibration the cheapest mark-recovery on earth; the debrief quantifies exactly where your calibration curve lies and rebalances attempt policy for the real exam.`,
      },
      {
        title: "Time-per-question diagnostics.",
        body: `Debrief must include a time audit: how many questions consumed > 4 minutes; which of those were wrong (spending 5 minutes on a question you then miss is double loss); which subjects consumed time disproportionate to their marks (a classic: 25 minutes on a 2-marker graph question vs three formulaic 1-markers banked in the same time). Build a personal time budget per subject from the audit — e.g., aptitude 8 min, math 30, PDS/algorithms 25, TOC/CD/OS/DB/NW 30, and 15 buffer; then enforce it in every subsequent mock; time allocation is learnable and transfers directly to the real exam; the debrief is where the budget gets written — not during the exam.`,
      },
      {
        title: "The error log — your personal mistake museum.",
        body: `Maintain a notebook (physical) of every error: question stem, your wrong answer, the correct answer, the family tag, the one-line root cause ("skipped checking checker overlap", "used SI formula for CI", "off-by-one in RR re-enqueue"). Revisit every Sunday; errors that repeat twice get a dedicated 30-minute deep session; errors that repeat three times mean you haven't actually fixed them. Physical repetition matters: rewriting the wrong solution by hand imprints the correct procedure better than re-reading. Over a 40-mock preparation, the log is the single most predictive document of your final score — it is your brain's actual defect list, addressed one entry at a time.`,
      },
      {
        title: "From debrief to next-week plan — closing the loop.",
        body: `The debrief must END in a written plan, not a feeling. Template: (1) top-3 failing families this mock; (2) specific micro-topics (e.g., "RR re-enqueue order on equal arrival", "CFL intersection closure with regular language", "CRC XOR division alignment"); (3) scheduled repair blocks in the calendar; (4) target metrics for next mock (e.g., aptitude accuracy ≥ 90%, no A-bucket errors, ≤ 2 focus gaps); (5) known-strength confirmations (what worked, keep doing). The next mock's debrief then verifies the transfers; every fix is empirical and data-driven; the loop only closes when the error family disappears from the log. This is the engineering method applied to your own test-taking hardware — and it is why candidates who debrief rise 8-12 marks across a preparation cycle while candidates who merely take more mocks flatline.`,
      },
    ],
    worked: [
      {
        title: "Debrief walk-through of a real mock error cluster.",
        body: `Mock X: 5 errors in OS scheduling (all WT calculation slips) — family: Focus (procedure known, execution slipped) → prescription: 10 timed Gantt charts, 7 minutes each, recompute WT aloud; 2 errors in TOC pumping lemma (couldn't pick witness) — family: Concept gap → 60-minute witness-selection drill on 8 languages; 1 aptitude (misread "not") — Focus; recommendation set: aptitude re-read habit, OS drills, TOC session — all scheduled by name into the weekly plan. The debrief cost 45 minutes; the fixes cost 3 hours; the score will rise 6-8 marks in the next mock because the errors were systematic, not random.
`,
      },
      {
        title: "EV computation from a real attempt distribution.",
        body: `Paper: 65 questions attempted: 38 correct, 27 wrong (1/3 penalty): raw = 38×(1 or 2)... simplified toy: 1-markers 30 attempted, 24 correct → EV positive; 2-markers 35 attempted, 14 correct → score = 28×(1/2... the math: correct 2×14 = 28, wrong 1/3×(35−14) = 7 → 2-marker block net = 21; 1-marker block: 24 − 6/3 = 22; total 43/100. Re-attempt A+B only: suppose 46 questions (all high-confidence): 42 correct → 4 wrong: 42×avg 1.5 − 4×0.5 = 61/100. The debrief formula proves the policy shift is worth +18 marks — this arithmetic deserves a permanent place in the notebook.
`,
      },
      {
        title: "Stamina-gap fix protocol in one fortnight.",
        body: `Baseline: accuracy 92% in first 2 hours, 74% in last 75 minutes. Fix: three full-length mocks in final-exam slot (2:30-5:30 PM), strong meal before, chest-breathing every 15 minutes at the turnover-break, micro-goals per 15-question block (never drop below 3/4 correct), deliberate skip of anything past 4 minutes — measure recovery per mock; target ≥ 85% in last block by mock +3. The exam is 3 hours; your training must be 3 hours or longer under real conditions — no gym work transfers to the match unless the rehearsal matches the match.
`,
      },
      {
        title: "Miss-tag anatomy: one misread question analyzed.",
        body: `Question: "Which of the following is NOT a stable sorting algorithm?" — candidate circled quicksort thinking "quicksort is unstable — correct answer". Actual intent: it asked NOT — answer was merge sort... no wait: NOT stable ⟹ answer should be quicksort/heap — merge stable, bubble stable, insertion stable → answer quicksort ✓ — the misread example must be the other one: candidate boxed merge sort (stable) as "answer NOT stable" — wrong; correct = heap sort or quicksort. The debrief tags: Focus family → stem re-read ritual added; error logged with the exact wording quoted; two weeks later mock asks a similar negation item — now correct — transfer verified. The log exists precisely to convert one misread into a permanent antibody.
`,
      },
    ],
    exam: [
      {
        question:
          "What is the expected page yield of the mock debrief ritual per cycle?",
        answer:
          "For most candidates, 5-10 marks per mock cycle in the affected families for two-to-three cycles — the loop converges when recurring errors vanish; a well-run debrief log typically correlates stronger with final score than raw mock count after the 15th mock — diminishing returns accrue only to those who already harvest the free marks.",
      },
      {
        question: "Why should A-bucket errors worry you most in analysis?",
        answer:
          "A-bucket = high confidence — errors there signal the deepest flawed understanding delivered with certainty: fixing them removes not just one wrong answer's worth of marks but systematic misconceptions that cost multiple future papers; low-confidence errors are expected noise; certainty errors are diagnostic gold.",
      },
      {
        question: "How long should a full debrief of one 3-hour mock take?",
        answer:
          "90-120 minutes — half the paper's duration again; it is not optional or compressible: classification, root-cause, prescriptions, scheduling, and the log update all require deliberate attention; rushing the debrief is the exam-prep equivalent of buying gym membership without entering the gym.",
      },
      {
        question: "What does the calibration report teach about guessing?",
        answer:
          "Whether the candidate's A/B/C/D quality actually holds — if C-bucket accuracy beats 60%, guessable questions are worth taking despite −1/3; if A+B capture nearly everything, indiscriminate attempting is negative EV and must be cut — the debrief makes the exam's guessing policy data-driven instead of habitual.",
      },
    ],
    cheat: [
      "Debrief families: Concept, Procedure, Speed, Focus, Stamina — one prescription each.",
      "Confidence buckets A/B/C/D; A errors are the fatal ones; skip D always.",
      "Time audit: flag every item > 4 min; reallocate per-subject budget from findings.",
      "Error log: physical notebook, family tag, root cause, weekly review, repeat² then deep-dive.",
      "Loop closure: prescription scheduled → next mock verifies transfer → log updated.",
      "Mock count plateaus; debrief count compounds.",
    ],
    recap: `The mock debrief is the examination of the examination itself: every error dissected into cause, every cause matched to a cure, every cure scheduled and audited for transfer — because the score moves not on how many tests you take, but on how precisely you understand the one you finished, the ritual that separates disciplined practice from sheer exposure.`,
    code: {
      title: "Debrief loop",
      language: "text",
      code: "classify -> root-cause -> prescribe -> schedule 48h -> re-test fortnight later",
      explanation:
        "Five arrows, one habit — the only practice loop GATE respects.",
    },
    diagram: {
      title: "Mock debrief cycle",
      caption:
        "Test → classify → cause → cure → verify — closed-loop learning, mock after mock.",
      mermaid:
        "flowchart LR\n  M[Mock] --> C[Classify errors]\n  C --> R[Root cause]\n  R --> F[Fix and schedule]\n  F --> V[Re-verify next mock]",
    },
  },
};

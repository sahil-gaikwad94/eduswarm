import type { TopicLesson } from "../topicLessons.js";

/**
 * Algorithms — 9 authored topic lessons.
 *
 * Standalone chapters per topic. Subject-first prose, foundations, core
 * concepts, worked examples, exam practice, cheat sheet, recap. No shared
 * templates, no runtime composition.
 */
export const algorithms: Record<string, TopicLesson> = {
  "algo-complexity": {
    intro: `Complexity is the language engineers use to compare algorithms before running them: how cost grows as input grows, ignoring constants and lower-order terms. The subject is asymptotic notation (big-O, big-Omega, big-Theta), recurrence solving (substitution, recursion trees, Master theorem), amortized analysis, and the discipline of reading an algorithm\'s scaling behavior off its structure.`,
    foundations: `f(n) = O(g(n)) iff ∃c,n₀: f(n) ≤ c·g(n) ∀n ≥ n₀ (upper bound); Ω mirrors with ≥ (lower); Θ = both; o/ω are strict versions. Growth rates: O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(n³) < O(2^n) < O(n!). Recursion: T(n) = aT(n/b) + f(n); Master theorem cases (compare f(n) vs n^(log_b a)): case 1 f smaller → Θ(n^(log_b a)); case 2 equal → Θ(n^(log_b a) log n); case 3 larger with regularity → Θ(f(n)). Amortized: sequence-average cost, not worst single op (dynamic array append O(1) amortized). Space complexity counts extra memory. Best/average/worst are input-distribution stories, not different notations.`,
    concepts: [
      {
        title: "Big-O, Omega, Theta: reading a bound precisely.",
        body: `O gives an upper envelope — f ∈ O(n²) says f grows no faster than n² eventually, nothing about tightness; Θ says exactly n²-ish; Ω says at least; misuse floods exam answers ("binary search is O(n)" true but cowardly — Θ(log n) correct and precise). Constants vanish in notation but dominate wall time: 100n vs n² — n² always wins past 100; notation orders growth, benchmarks order engineers. Common mistake: counting loop nesting as exponent verbatim (nested loop with doubling stride is log-depth, not quadratic) — trace iterations, never eyeball braces; the worst-case/average-case/best-case triple prices different input mixes — exams test the distinctions.`,
      },
      {
        title: "Recurrences: substitution, trees, Master theorem.",
        body: `Substitution: guess form (n log n), verify by induction with boundary conditions — tail recursion shrinks by constants is logarithmic; divide-and-conquer shrinks by factors multiplies work per level (merge sort 2T(n/2)+n → n log n by summing n per level × log n levels); Master theorem shortcut solves T(n)=aT(n/b)+f(n) fastest — know the three cases cold; when f(n) straddles cases (f(n) = n^(log_b a)·log n) extended master theorem applies; recursion trees: sum level costs geometrically — leaves × leaf cost + internal — the most robust general tool; every GATE recursion question reduces to one of these three; practice six canonical recurrences until mechanical.`,
      },
      {
        title: "Amortized analysis: accounting and potential.",
        body: `Dynamic array append: occasional doubling copy O(n) but charged 3 per append → amortized O(1); aggregate method: total cost/n ops; accounting: charge extra credits now pay for expensive ops later; potential method: Φ function measures stored work (Φ = 2× size − capacity style), amortized = actual + ΔΦ; whenever ops come in sequences with rare expensive steps (hash resize, union-find path compression, Splay tree rotations), amortized is the right lens; exam loves "what is the amortized cost of insert in a dynamic table" — answer: O(1) amortized, O(n) worst single insert; confusion between the two loses the mark every time.`,
      },
      {
        title: "Space complexity and the time-space tradeoff.",
        body: `Space = auxiliary memory beyond input storage; recursion stack counts (fib naive O(n) space despite O(1) extra variables per call); divide-and-conquer often O(log n) stack; memoization trades space for exponential time savings; bottom-up DP reverses it (O(1) extra space vs O(n) table) — the eternal exchange: hashing gives O(1) lookup for O(n) memory, BST balances O(log n) for O(log n); in-place algorithms (quicksort) sacrifice stability for O(1) space; exam asks "space required for recursion depth n" — count stack frames, not heap.`,
      },
      {
        title: "Reading algorithms for complexity: the practical protocol.",
        body: `Step 1: identify loop structure (for/while count iterations, nested → multiply or log depending on stride); step 2: recursion — write the recurrence and solve; step 3: input-size vs value-magnitude distinction (iterations vs log value); step 4: halving → log, doubling → exponential; step 5: amortized vs per-op; step 6: sanity-check against brute-force alternative — if your answer is better than brute force by exponent, suspicious; if worse, re-read the algorithm; final step: note best/average/worst — merge sort worst Θ(n log n), quicksort worst Θ(n²) averaged Θ(n log n) — one sentence of nuance away from the correct GATE answer.`,
      },
    ],
    worked: [
      {
        title: "Derive complexity of nested loops with dependent bounds.",
        body: `for i in 1..n: for j in 1..i: print — total iterations = n(n+1)/2 → Θ(n²); for i in 1..n: for j in i..n: j *= 2 — inner is log(n−i+1) → Σ_{i} log(n−i+1) = log(n!) = Θ(n log n); the dependent bounds trip everyone — always evaluate inner sum explicitly; the second is the GATE favorite "trick loop" — every student who expands the sum once never falls for it again; do it three times with different strides until automatic.`,
      },
      {
        title: "Solve T(n) = 3T(n/4) + n^2 by Master theorem.",
        body: `a=3, b=4 → n^(log_4 3) = n^0.792; f(n) = n²; f is polynomially larger than n^0.792 (n^1.208 factor) → case 3 if regularity holds (af(n/b) ≤ cf(n) for c<1: 3(n/4)² = 3n²/16 ≤ (3/16)n² — yes) → T(n) = Θ(n²); the exam expects case identification and the regularity check; write both lines every time; skipping regularity costs marks in rigorous exams.`,
      },
      {
        title: "Amortized cost of multipop in a stack.",
        body: `Operations: push, pop, multipop(k) — multipop pops min(k, stack size) items; worst single op O(n); sequence of n pushes then one multipop(n) — total work O(n) for 2n ops → O(1) amortized; accounting argument: charge 2 per push (1 pays for its own pop, 1 pays for multipop bookkeeping) — elegant, fast, and the standard exam answer; the aggregate method would also work — both earn marks, accounting is the one to internalize.`,
      },
      {
        title: "Big-O classification of five code snippets.",
        body: `Binary search halves → O(log n); two sequential linear scans → O(n); triple nested with constant-depth → O(n³); recursive halving with O(1) work → O(log n); loop i=1 while i<n: i*=2 with inner O(1) → O(log n); the table of half a dozen patterns is all you ever need for GATE — memorize the shape not the code; the exam writes these fragments deliberately to be mistakable by the careless.`,
      },
    ],
    exam: [
      {
        question:
          "What is the time complexity of inserting n elements into an initially empty dynamic array, one at a time?",
        answer:
          "O(n) total / O(1) amortized per insert — doublings cost 1+2+4+...+n ≈ 2n copies overall; the exam answer is O(n) overall or O(1) amortized depending on the phrasing — always answer both to be safe.",
      },
      {
        question: "Which recurrence solves to Θ(n log n)?",
        answer:
          "T(n) = 2T(n/2) + Θ(n) — merge sort; also T(n) = T(n−1) + Θ(n) if that were the question — no, that gives Θ(n²); the canonical merge sort recurrence is the expected answer; read carefully what the options offer.",
      },
      {
        question: "If f(n) = O(n^2) and g(n) = O(n^3), is f(n)g(n) = O(n^5)?",
        answer:
          "Yes — big-O multiplies (f·g = O(n^5)); Ω multiplies too; Θ multiplies; but never mix O from one with Ω from another — the exam option set tests exactly this mixed-case slip; remember the algebra works only with compatible bounds.",
      },
      {
        question: "What is the space complexity of a recursive factorial?",
        answer:
          "O(n) — n stack frames of constant size; the iterative version is O(1); the exam contrasts these two — you must state which implementation you mean; ambiguity costs marks.",
      },
    ],
    cheat: [
      "O upper, Ω lower, Θ tight; constants and lower terms vanish; growth order: 1<log<n<nlogn<n²<2^n.",
      "Master theorem 3 cases; substitution verification; recursion tree sums.",
      "Amortized ≠ worst-case; dynamic array append = O(1) amortized, O(n) worst.",
      "Space counts stack for recursion; O(1) iterative vs O(n) recursive.",
      "Best ≠ average ≠ worst; merge sort Θ(n log n) all cases; quicksort averaged Θ(n log n).",
      "Trace iterations, never eyeball — nested loop with stride is not nested multiply.",
    ],
    recap: `Complexity is the engineering of estimates: asymptotic notation gives the orders, recurrences give the recipes, amortized analysis gives the sequences — applied with the discipline of tracing iterations honestly, every time; the notation you write in a GATE paper is the proof you carry into interviews forever.`,
    code: {
      title: "Master theorem lookup",
      language: "text",
      code: `f vs n^(log_b a): smaller -> Θ(n^(log_b a)); equal -> Θ(n^(log_b a) log n); larger + regular -> Θ(f)`,
      explanation:
        "The three cases on one line — the only theorem worth tattooing on your algorithmic memory.",
    },
    diagram: {
      title: "Growth hierarchy",
      caption:
        "Constants to exponential — the ladder every complexity answer climbs.",
      mermaid: `flowchart LR\n  O1[O of 1] --> OL[O log n] --> ON[O n] --> ONL[O n log n] --> ON2[O n squared] --> OEXP[O 2 to the n]`,
    },
  },
  "algo-sorting": {
    intro: `Sorting is the canonical algorithmic problem: given a sequence, produce an ordered one — dozens of algorithms, one job, infinite trade-offs. The subject covers comparison sorts (insertion, merge, quick, heap), non-comparison sorts (counting, radix, bucket), stability, in-place operation, the Ω(n log n) lower bound, and the engineering selection among them.`,
    foundations: `Input: array of comparable items; output: non-decreasing order. Lower bound Ω(n log n) for comparison-based sort (decision tree: n! leaves, height ≥ log n!). Insertion: build sorted prefix — O(n²) worst, O(n) nearly sorted, stable, in-place. Merge: divide, sort halves, merge — Θ(n log n) all cases, stable, needs Θ(n) extra. Quick: partition around pivot, recurse — average Θ(n log n), worst Θ(n²) (sorted input with bad pivot), in-place-ish (O(log n) stack), unstable, cache-friendly. Heap: binary max-heap, repeatedly extract — Θ(n log n) all cases, in-place (with care), unstable. Counting sort: O(n+k) range k — non-comparison, stable. Radix: digit-by-digit counting — O(d·(n+k)) — stable. Stability: equal keys keep original relative order; in-place: O(1) auxiliary; adaptive: faster on nearly-sorted input.`,
    concepts: [
      {
        title: "The comparison lower bound and what it rules out.",
        body: `Decision tree: leaves = permutations (n!), each comparison adds one bit of information, depth ≥ log2(n!) = Ω(n log n) — therefore no comparison sort beats it asymptotically; sorting by comparison only — non-comparison sorts (counting/radix/bucket) escape by exploiting key distribution; the bound is for worst-case and average; randomized pivot strategies live or die by this bound; exams test the counting-tree argument directly — leaves count, log gives the floor, done; every interviewer asks it because it\'s the cleanest impossibility proof in teaching.`,
      },
      {
        title: "Merge sort: the stable divider.",
        body: `Split array mid → recursively sort halves → merge (two pointers walk to ends) — Θ(n log n) guaranteed; stable (merge prefers left element on ties — order preserved); extra space Θ(n) for the merge buffer; top-down (recursive split) natural; bottom-up (iterative merge width doubling) avoids stack; the workhorse for linked lists (in-place via pointer rewiring) and external sorting (disk); every comparison sort study starts here — its analysis is exact, its behavior universal, its stability coveted; general data with no key structure? Merge sort is the answer you can defend.`,
      },
      {
        title: "Quicksort: the engineer's favorite with a mean streak.",
        body: `Partition: pick pivot, rearrange so smaller left, larger right (Lomuto: single pass with boundary; Hoare: two-pointer better empirical); recurse on sides; average Θ(n log n) via recursion tree depth log n × linear partition; worst Θ(n²) on monotonic input with last-element pivot; random pivot or median-of-three cures it in practice; 3-way partition (Dutch national flag) tames duplicates; in-place (no merge buffer), unstable, best cache behavior — why stdlibs ship it by default; the analysis: recurrence T(n) = T(k) + T(n−k−1) + n — balanced splits average log depth; unlucky splits degrade to linear depth; exam asks pivot strategy effects — random pivot = expected O(n log n) regardless of input.`,
      },
      {
        title: "Heapsort and selection primitives.",
        body: `Binary max-heap property: parent ≥ children; build from array in Θ(n) by heapify-down from last non-leaf upward (linear, not n log n — the exam loves this subtlety); extraction: swap root with end, shrink heap, sift-down — n × log n; total Θ(n log n) guaranteed; unstable (sift swaps leapfrog positions); in-place possible; priority queue is the same machinery with insert — K-largest of N stream via min-heap O(N log K); heapsort = selection sort made honest; the exam trace: build heap of [3,1,6,5,2,4] → extract — do it once on paper forever safe.`,
      },
      {
        title: "Non-comparison sorts: when keys have structure.",
        body: `Counting sort: keys 0..k, allocate counts, prefix-sum to positions, place stably — Θ(n+k); perfect for small ranges (byte-class, ages); radix sort: process digits LSB→MSB with counting sort per digit — Θ(d·(n+k)); stable per digit pass — required for correctness; bucket sort: distribute into ~n buckets, sort each (insertion or recursively quicksort), concatenate — average Θ(n) under uniform distribution; every non-comparison escape hatch requires key constraints — violate them and you ship O(n²) again; GATE asks which sorts are stable and why counting is — answer: accumulation order left-to-right preserves original indices.`,
      },
    ],
    worked: [
      {
        title: "Trace quicksort partition on [7, 3, 8, 5, 2, 6].",
        body: `Pivot 6 (last); i=−1; j=0..4: 7>6 skip; 3<6 i=0, swap A[0]A[1] → [3,7,8,5,2,6] wait swap 7 and 3 → [3,7,8,5,2,6]; 8>6 skip; 5<6 i=1 swap A[1]A[3] → [3,5,8,7,2,6]; 2<6 i=2 swap A[2]A[4] → [3,5,2,7,8,6]; place pivot: swap A[3]A[5] → [3,5,2,6,8,7]; recurse left [3,5,2], right [8,7]; each subpartition again — result sorted in three levels; every GATE partition question replays exactly this; track i boundary and the swap rule unforgivingly.`,
      },
      {
        title: "Merge [1,4,7] and [2,5,6] — merge step trace.",
        body: `i=0,j=0: 1<2 → take 1, i=1; 4>2 → take 2, j=1; 4<5 → take 4; 7>5 → take 5, j=2; 7>6 → take 6, j=3 (end); take 7 → done; output 1,2,4,5,6,7; total compares ≤ 5 = n — the linear guarantee that makes merge sort\'s Θ(n log n) airtight; the trace also reveals stability: equal elements from left arrive first — always.`,
      },
      {
        title: "Build a max-heap from [3,1,6,5,2,4] bottom-up.",
        body: `Start from last parent (index 2, value 6) — already largest of its subtree; index 1 value 1: children 5,2 — swap with 5 → [3,5,6,1,2,4] wait rebuilding: original [3,1,6,5,2,4]; heapify index 1 (value 1): 1 < max(5,2) → swap with 5 → [3,5,6,1,2,4]; heapify index 0 (value 3): children 5,6 → swap with 6 → [6,5,3,1,2,4]; heap ✓; the bottom-up order guarantees subtrees heap before parents — hence linear; top-down insertion would cost n log n — the distinction the exam tests.`,
      },
      {
        title: "Counting sort [4,2,2,8,3,3,1] with k=8.",
        body: `Count array [0..8]: counts: 1→1, 2→2, 3→2, 4→1, 8→1; prefix sums: positions 1,3,5,6,8; place right-to-left for stability: iterate original right-to-left placing each key at position[key]-- ; final [1,2,2,3,3,4,8]; k moderately larger than n makes it Θ(n); the trace demonstrates why radix on top of counting sort works — stability is preserved end-to-end.`,
      },
    ],
    exam: [
      {
        question:
          "Which complexity class can any comparison-based sorting algorithm not beat?",
        answer:
          'Ω(n log n) worst case (and average) — decision-tree lower bound; direct answer to the most-asked sorting theory question; remember the phrasing "comparison-based" — non-comparisons escape it.',
      },
      {
        question: "Which sorting algorithms are stable?",
        answer:
          "Merge sort, insertion sort, bubble sort, counting sort, radix sort — quicksort/heapsort are not; GATE loves listing exactly five stable ones; memorize the list.",
      },
      {
        question: "Quicksort worst case and the pivot strategy that avoids it?",
        answer:
          "Θ(n²) with extreme pivots (already-sorted arrays); randomized or median-of-three pivots make worst case improbable — expected Θ(n log n) regardless of input permutation.",
      },
      {
        question:
          "What property of counting sort allows radix sort's correctness?",
        answer:
          "Stability — digit passes must preserve the relative order established by previous (less significant) digit passes; without stability, the algorithm mis-orders equal keys; radix ⇒ stable per pass ⇒ overall stable.",
      },
    ],
    cheat: [
      "Ω(n log n) comparison floor; counting/radix escape it with key structure.",
      "Merge: stable, Θ(n log n) always, Θ(n) extra; quick: fast cache-wise, worst Θ(n²).",
      "Heap: guaranteed n log n, in-place, unstable, Θ(n) build.",
      "Insertion: O(n²) worst, O(n) nearly sorted, stable, everyone's small-array sort.",
      "Stable order preserved for equal keys — needed for multi-key sorts.",
      "Counting sort Θ(n+k); radix Θ(d(n+k)); bucket Θ(n) average uniform.",
    ],
    recap: `Sorting is the sorting of trade-offs: lower bound punishes comparisons, divide-and-conquer splits the work, heaps guarantee the bound externally, and key structure lets you sidestep comparisons entirely — choose the algorithm for the data\'s shape, not by habit, and every orderly array you will ever touch falls into place.`,
    code: {
      title: "Lomuto partition",
      language: "c",
      code: `j = lo - 1;\nfor (i = lo; i < hi; i++)\n    if (A[i] <= pivot) swap(A[++j], A[i]);\nswap(A[++j], A[hi]);`,
      explanation: "The three lines every quicksort exam answer reproduces.",
    },
    diagram: {
      title: "Comparison sorting tree",
      caption:
        "Decision tree lower bound — log(n!) levels minimum; no comparison sort goes under.",
      mermaid: `flowchart TD\n  R[Root: first comparison] --> A[Branch A]\n  R --> B[Branch B]\n  A --> L1[Permutation leaves]`,
    },
  },
  "algo-graphs": {
    intro: `Graph algorithms are the engine of connected structure — from web crawlers to road routers to social feeds; the subject covers BFS, DFS, topological sort, shortest paths, connectivity, MSTs, and flow essentials. The graph is the data structure of every meaningful relationship at scale.`,
    foundations: `Graph G=(V,E); directed/undirected; weighted/unweighted; dense (E≈V²) vs sparse (E≈V); representations: adjacency matrix (O(1) edge query, O(V²) space), adjacency list (O(degree) iteration, O(V+E) space). BFS: queue, O(V+E), shortest unweighted paths, level order; DFS: stack/recursion, O(V+E), cycle detection, topo sort (Kahn/DFS), SCC (Tarjan/Kosaraju); shortest path: Dijkstra (non-negative weights, binary heap O((V+E) log V)), Bellman-Ford (negative weights, detect negative cycles, O(VE)), Floyd-Warshall (all pairs, O(V³)); MST: Kruskal (sort edges + union-find O(E log E)), Prim (priority queue O(E log V)); flow: Ford-Fulkerson (max flow = min cut).`,
    concepts: [
      {
        title: "BFS vs DFS: the two traversal regimes.",
        body: `BFS explores by distance layers — every node visited at its shortest-path distance from source (unweighted); queue-frontier expanding; O(V+E); finds shortest hop count; detects bipartiteness (2-coloring); DFS explores depth-first — stack unwinding on dead ends; O(V+E); discovery/finish times encode ancestor relations (parenthesis theorem); cycle detection (back edge to ancestor = cycle); topological sort (reverse postorder); SCC via DFS trees (Kosaraju: DFS, transpose, DFS again — or Tarjan single-pass with lowlink); both use visited arrays — forgetting them re-explodes exponential; exam distinguishes which traversal suits which problem — shortest unweighted hops → BFS; cycle/SCCsDAGs → DFS.`,
      },
      {
        title: "Shortest paths: Dijkstra, Bellman-Ford, Floyd-Warshall.",
        body: `Dijkstra: greedy extraction of minimum tentative distance, relax edges; requires non-negative weights (negative breaks the greedy invariant — extracted min could be improved later); binary heap → O((V+E) log V); source → all destinations. Bellman-Ford: V−1 rounds of relax-every-edge; handles negatives; V-th round detects negative cycle (relaxation still succeeds → cycle exists reachable); O(VE) — dense slow but bulletproof. Floyd-Warshall: DP over intermediate vertices k: dist[i][j] = min(dist[i][j], dist[i][k]+dist[k][j]); O(V³) all pairs; small graphs only; exams want: choose per constraints — single source non-negative → Dijkstra; negative present or detect → Bellman-Ford; all pairs small → Floyd.`,
      },
      {
        title: "MST: Kruskal and Prim.",
        body: `Kruskal: sort edges by weight; add edge if it doesn\'t form cycle (union-find with path compression, near-constant) — builds minimum spanning forest; O(E log E). Prim: grow tree from arbitrary root; repeatedly add cheapest edge crossing the cut (priority queue); O(E log V) with binary heap, O(E + V log V) with Fibonacci heap; both correct by the cut property (minimum edge crossing any cut is in every MST) — every MST proof hinges on it; useful for network design, clustering, VL Checksums — exam asks which is better for dense (Prim) vs sparse (Kruskal) graphs; GATE expects the cut-property argument verbatim.`,
      },
      {
        title: "Topological sort and DAG structure.",
        body: `DAG = directed acyclic graph; topological order = linear sequence where all edges point forward; exists iff no cycle; Kahn\'s algorithm: repeatedly emit zero-indegree nodes (queue); DFS alternative: push nodes on completion, reverse — both O(V+E); cycles detected: Kahn leaves nodes unprocessed (indegree never reaches 0); sorting orders: scheduling prerequisites — build systems, course planning, register allocation; unique order iff exactly one source at each step (else multiple valid orders); exams test: find valid topo orders given DAG, detect cycle, count — all mechanical with Kahn\'s.`,
      },
      {
        title: "Connectivity, SCCs and strongly-connected components.",
        body: `Undirected connectivity: BFS/DFS from any node visits its component — repeat over unvisited nodes; count components; articulation points/bridges (Tarjan lowlink) — single-node failure disconnects graph; directed SCC: maximal mutually-reachable set; Kosaraju: DFS on G, DFS on G^T in decreasing finish-time order — second pass emits components; Tarjan: single DFS with discovery/low numbers on a stack — one pass, trickier proof, faster; 2SCC appears in 2-SAT solving; SCC decomposition yields condensation DAG — meta-structure of whole internet-scale graphs; exam: trace SCC on 8-node example or detect articulation — both mechanical drills.`,
      },
    ],
    worked: [
      {
        title: "BFS shortest path hop count from A to F.",
        body: `Adjacency list: A-[B,C], B-[D], C-[D,E], D-[F], E-[F]; BFS: A (dist 0) → enqueue B(1), C(1); dequeue B → D(2); dequeue C → D already, E(2); dequeue D → F(3); dequeue E → F visited; path A→C→E→F or A→B→D→F both length 3 — BFS guarantees minimal hops; trace on paper — the exam asks for path + distance; the queue discipline guarantees minimality automatically.`,
      },
      {
        title: "Dijkstra trace on weighted 5-node graph.",
        body: `Nodes A→E; edges A-B 4, A-C 2, B-C 1, B-D 5, C-D 8, C-E 10, D-E 2; source A: dist[A]=0, others ∞; extract A → update B=4, C=2; extract C(2) → B = min(4, 2+1)=3, D=10, E=12; extract B(3) → D = min(10, 3+5)=8; extract D(8) → E = min(12, 8+2)=10; E=10 final; path A→C→B→D→E; every Dijkstra exam uses this 5–6 node template — practice until mechanical.`,
      },
      {
        title: "Kruskal MST on 4-node graph with six edges.",
        body: `Edges sorted: 1(A-B), 2(B-C), 2(A-C), 3(C-D), 4(B-D), 5(A-D): take 1 (A-B union {A,B}); take 2 (B-C union {A,B,C}); skip 2 (A-C same set); take 3 (C-D → all); stop — 3 edges, total weight 6; the MST; union-find with path compression made each check near-constant; cycles never formed — the algorithm is correct by cut property every time.`,
      },
      {
        title: "Topological order via Kahn's on build graph.",
        body: `Deps: main←parse, parse←lexer, parse←ast, ast←lexer: indegrees: main 1, parse 2, lexer 0, ast 1; queue lexer → emit; parse, ast lose indegree: ast 0 → emit; parse 1 (waits main? parse needs lexer AND ast — both done → 0) → emit; emit main; order: lexer, ast, parse, main — valid; if a cycle existed (ast→lexer?), Kahn would stall with remaining nonzero-indegree nodes — cycle witness; the algorithm never runs into impossible states silently.`,
      },
    ],
    exam: [
      {
        question:
          "What does BFS guarantee about the path it finds in an unweighted graph?",
        answer:
          "Shortest path in hop count from source to every reached node — BFS layers expand by distance; first reach = minimal; the single most asked BFS property in exams.",
      },
      {
        question: "Why can't Dijkstra handle negative edge weights?",
        answer:
          "The greedy invariant — extracted min distance is final — breaks: a later relaxation through a negative edge could reduce an already-extracted node's distance; the algorithm never revisits it; negative weights require Bellman-Ford's bounded relaxation rounds.",
      },
      {
        question: "Which edge is always in every MST?",
        answer:
          "The globally cheapest edge (by cut property, cheapest edge anywhere belongs in some MST — and in all MSTs if unique cheapest); GATE phrasing varies, the answer is the minimum-weight edge in the graph.",
      },
      {
        question: "When does a topological sort exist?",
        answer:
          "Iff the directed graph is acyclic — Kahn/DFS both detect cycles; existence iff no back edges in DFS or no leftover nodes in Kahn; the exam asks one direction explicitly.",
      },
    ],
    cheat: [
      "Adjacency list O(V+E); matrix O(V²); sparse graphs → list.",
      "BFS: shortest unweighted hops; queue + dist[].",
      "DFS: discovery/finish times; cycles; toposort; SCCs.",
      "Dijkstra O((V+E) log V) non-negative; Bellman-Ford O(VE) negatives + cycle detect; Floyd O(V³) all-pairs.",
      "Kruskal O(E log E) sparse; Prim O(E log V) dense; cut property underlies both.",
      "Topological sort exists iff DAG; Kahn or DFS.",
    ],
    recap: `Graph algorithms turn structure into motion: BFS finds shortest unweighted hops, Dijkstra prices weighted paths, DFS classifies cycles and components, MST picks cheapest connectivity, topological sort linearizes dependencies — every traversal carries the same invariant: visit each edge once, extract one truth, never revisit; master the queue, the heap, the stack, and the union-find, and every graph question yields.`,
    code: {
      title: "BFS core",
      language: "python",
      code: `q = deque([src]); dist = {src: 0}\nwhile q:\n    u = q.popleft()\n    for v in adj[u]:\n        if v not in dist: dist[v] = dist[u] + 1; q.append(v)`,
      explanation:
        "The six-line skeleton every shortest-hop answer and hundreds of graph interview problems share.",
    },
    diagram: {
      title: "Graph algorithm selection",
      caption:
        "Weights? pairs? negatives? — three questions decide the algorithm.",
      mermaid: `flowchart TD\n  Q[Shortest path?] --> W{Weights?}\n  W -->|No| B[BFS]\n  W -->|Positive| D[Dijkstra]\n  W -->|Negative| BF[Bellman-Ford]`,
    },
  },
  "gate-cs-algorithms-greedy-algorithms": {
    intro: `Greedy algorithms make the locally optimal choice at each step hoping to reach a globally optimal solution — sometimes they provably do, sometimes they don\'t, and telling the difference is the art. The subject covers greedy design, exchange arguments, matroids intuition, and the classical systems: scheduling, Huffman coding, MST, coin change, and when greedy fails.`,
    foundations: `Greedy paradigm: build solution incrementally, each step takes the best option available now, never backtracks; correctness requires proof — usually exchange argument (transform any optimal solution into greedy one without loss) or matroid structure (optimal always achievable greedily iff the problem has matroid structure). Canonical successes: activity selection (earliest finish first), Huffman coding (merge two smallest frequencies), Kruskal/Prim (MST), fractional knapsack (highest value/weight first — 0/1 needs DP), coin change (canonical coin systems), job sequencing with deadlines, Dijkstra. Failures: 0/1 knapsack (sort by ratio fails), longest path in general graphs, TSP (nearest neighbor heuristic unbounded error). Design smell: greedy usually O(n log n) from sorting first.`,
    concepts: [
      {
        title: "Exchange arguments: the proof pattern.",
        body: `Show greedy optimal by transforming any optimal solution O into greedy solution G: take first point where they differ; exchange O\'s choice for G\'s at that point; show the result is still feasible and no worse; repeat until O = G (finite induction); therefore G is optimal among optimal — the activity selection proof (earliest finish) goes exactly this way; Huffman merges two smallest — exchange shows any optimal tree can be rearranged so two smallest frequencies are siblings at maximum depth; every greedy theorem in the canon is one of these two patterns; exams ask you to prove correctness of a given greedy algorithm — recite the exchange argument abstractly and instantiate.`,
      },
      {
        title: "Activity selection and interval scheduling.",
        body: `Given intervals (sᵢ,fᵢ), select max pairwise non-overlapping: sort by finish time; take first; repeatedly take next interval starting ≥ last taken\'s finish; O(n log n); proof via exchange — greedy leaves earliest room for the rest; variants: minimize resources (coloring with depth counting), interval partitioning (assign to minimal rooms); every deadline/scheduling problem of this shape yields to the earliest-finish heuristic; the exam loves the counting question: with N intervals how many rooms does the schedule need — answer: max overlap depth; solved with sort + sweep.`,
      },
      {
        title: "Huffman coding: greedy merge optimality.",
        body: `Given symbol frequencies, build optimal prefix code: repeatedly merge two lowest-frequency nodes into parent with summed weight; final root gives code lengths; average code length minimized among prefix codes (exchange argument on two smallest deepest siblings); depth per symbol ∝ cost; prefix-free — decodable unambiguously; used in gzip/JPEG; algorithms exams ask: compute Huffman code for frequencies [5,9,12,13,16,45] — mechanical merge trace; time O(n log n) with min-heap; the code realizes entropy-plus-ε lower bound — the best bits-per-symbol one can do for fixed prefix code.`,
      },
      {
        title: "When greedy fails: the counterexample habit.",
        body: `0/1 knapsack sorted by value/weight ratio fails: items (60/10), (100/20), (120/30), capacity 50 → ratio order takes 60+100=160, better option takes 100+120=220; the fix: dynamic programming; longest path in general graph: greedy dead-end; nearest-neighbor TSP: 25% error on random instances vs optimal; coin change with arbitrary denominations: greedy fails ({1,3,4}, amount 6 → greedy 4+1+1 = 3 coins vs 3+3 = 2); the discipline: never trust greedy without either proof or counterexample search — exam asks "does greedy produce optimal for X" — construct the failing instance or prove it; practice both moves.`,
      },
      {
        title: "Matroids: the hidden structure of greedy success.",
        body: `Matroid = (S, I): hereditary set system where augmentation holds (if |A| < |B|, ∃ x ∈ B\A with A∪{x} ∈ I); examples: graphic matroid (edge sets forming forests), partition matroid; theorem: greedy optimal for weight-maximization iff independent sets form a matroid; hence activity selection, MST, interval scheduling all greedy-correct; non-matroid (0/1 knapsack) → greedy may fail — the theorem unifies every example; advanced exam bonus — you don\'t need matroid definitions verbatim, but you should recognize the pattern: "greedy works iff exchange + hereditary holds".`,
      },
    ],
    worked: [
      {
        title: "Activity selection by earliest finish time trace.",
        body: `Intervals (1,4), (3,5), (0,6), (5,7), (3,8), (5,9), (6,10), (8,11), (8,12), (2,13), (12,14); sort by finish: (1,4),(3,5),(0,6),(5,7),(5,9),(3,8)... take (1,4); next start ≥4: (5,7); next ≥7: (8,11); next ≥11: (12,14); selected 4 intervals — verify none overlapping; the greedy output is provably maximal; trace three more instances until reflexive — the pattern never changes.`,
      },
      {
        title: "Huffman tree for frequencies [5,9,12,13,16,45].",
        body: `Merge 5+9=14; heap {12,13,14,16,45}; merge 12+13=25; heap {14,16,25,45}; merge 14+16=30; heap {25,30,45}; merge 25+30=55; heap {45,55}; merge 45+55=100 root; code lengths: 45→0, 25→10, 30→11, 12→110, 13→111, 16→100 — wait recompute: root(100) children 45 and 55; 45: 0; 55: 1; 55 children 25 and 30; 25: 10, 30: 11; 25 children 12 and 13: 100, 101; 30 children 14 and 16: 110, 111; 14 children 5 and 9: 1100, 1101; codes: 45=0, 12=100, 13=101, 16=111, 5=1100, 9=1101; avg length ≈ (45·0? zero bit for 45? Huffman sometimes assigns 0 — fine) compute ~2.31 bits — near-entropy; trace once and it\'s yours forever.`,
      },
      {
        title: "Job sequencing with deadlines to maximize profit.",
        body: `Jobs (id, deadline, profit): A(2,100), B(1,19), C(2,27), D(1,25), E(3,15); sort by profit desc: A,C,D,B,E; slots deadline 1..3: A→slot 2 (100), C→slot 2 taken? C→slot 1? Greedy: A slot 2, C slot 1 (27), D slot 1 taken, B slot 1 taken, E slot 3 (15) → total 142; verify alternatives ≤ 142 — mechanical placement into latest-free slot; the algorithm is optimal by exchange argument (swap lower profit into earlier slot never worse); O(n²) naive, O(n log n) with disjoint-set slots — GATE asks for trace + proof lineage.`,
      },
      {
        title: "Coin change failure case for greedy {1,3,4} amount 6.",
        body: `Greedy: 4+1+1 = 3 coins; optimal: 3+3 = 2 coins; greedy fails because 4 and 3 aren\'t canonical (each coin must divide the next larger for greedy to work — 1,3,4: 3∤4); canonical systems (1,5,10,25 for USD) always work — the exchange argument re-establishes; the exam asks for exactly this counterexample construction — practice it cold.`,
      },
    ],
    exam: [
      {
        question:
          "Which greedy algorithm solves the activity selection problem optimally?",
        answer:
          "Select by earliest finish time, repeatedly — greedy optimal by exchange argument; memorize: sort by finish, take compat with last taken — the single most-asked greedy question on earth.",
      },
      {
        question:
          "Why does greedy fail for 0/1 knapsack but work for fractional?",
        answer:
          "Fractional allows taking a fraction of the last item — ratio order genuinely maximizes value/weight throughput; 0/1 forces all-or-nothing — ratio order can strand high-value items; greedy incompatible with indivisibility; DP handles it.",
      },
      {
        question: "What does Huffman coding produce?",
        answer:
          "An optimal prefix-free binary code minimizing weighted average code length — greedy merge of two least-frequent subtrees at each step; prefix-free property enables unique decodability.",
      },
      {
        question:
          "What matroid property underlies successful greedy algorithms?",
        answer:
          "The augmentation property (A,B independent, |A|<|B| ⇒ ∃x∈B\A: A∪{x} independent) plus hereditary set system — together they characterize exactly when greedy is optimal; the conceptual umbrella over activity selection, MST, matroid optimization; GATE asks name only.",
      },
    ],
    cheat: [
      "Greedy = local best, no backtracking; exchange argument proves optimal.",
      "Activity selection: earliest finish first; Huffman: merge two smallest.",
      "Fractional knapsack: ratio order; 0/1: DP not greedy.",
      "Matroid ⇒ greedy optimal; no matroid ⇒ require counterexample vigilance.",
      "MST both by cut property; interval coloring by depth count.",
      "Coin systems canonical iff each divides next; else counterexample hunt.",
    ],
    recap: `Greedy algorithms are discipline dressed as intuition: take the locally best, prove the exchange, or produce the counterexample — because on the problems where matroids reign, greedy is optimal and total; on the rest, it is the counterexample in disguise; the exam is the negotiation between the two.`,
    code: {
      title: "Activity selection loop",
      language: "python",
      code: `acts.sort(key=lambda a: a.finish)\nlast = -inf\nfor a in acts:\n    if a.start >= last: select(a); last = a.finish`,
      explanation: "Five lines from problem statement to optimal schedule.",
    },
    diagram: {
      title: "Greedy correctness pipeline",
      caption:
        "Pick candidate, test exchange, conclude optimal or find counterexample.",
      mermaid: `flowchart LR\n  C[Candidate move] --> X[Exchange argument]\n  X --> O[Optimal]\n  X --> F[Counterexample found]`,
    },
  },
  "gate-cs-algorithms-dynamic-programming": {
    intro: `Dynamic programming is recursion with memory — overlapping subproblems solved once and reused, turning exponential brute force into polynomial answers. The subject covers optimal substructure, overlapping subproblems, the two implementation styles (memoization, tabulation), classic problems (Fibonacci, knapsack, LCS, LIS, matrix chain), and the design discipline of defining the state first.`,
    foundations: `DP applies when a problem has: (1) optimal substructure — optimal solution composes from optimal sub-solutions; (2) overlapping subproblems — same subproblems revisited repeatedly. Memoization: top-down recursion + cache (dict/array); lazy — only computes needed states. Tabulation: bottom-up iteration over states in dependency order; eager — computes all states. State space size × per-state work = total complexity. Classic shapes: 1D (fib, LIS), 2D strings (LCS, edit distance), 2D grids (min-path), knapsack (weight × capacity), interval DP (matrix chain, palindrome partitioning), digit DP, tree DP. Reconstruction of solutions via parent pointers. Space optimization: reduce dimension when only previous row needed.`,
    concepts: [
      {
        title: "The DP design protocol: state, transition, base, order.",
        body: `Step 1: define state — minimal parameters distinguishing subproblems (i, remaining capacity, j...); step 2: recurrence — best answer in terms of smaller states (min/max/+ via cases); step 3: base cases — smallest subproblems; step 4: evaluation order — increasing parameter or DAG; step 5: answer extraction; step 6: complexity = states × transitions; every DP problem GATE asks begins with this exact six-step ritual; practitioners skip steps 1–3 and wonder why tables overflow — the design precedes the code; the state is the algorithm, the loop is typing.`,
      },
      {
        title: "Memoization vs tabulation: the honest trade.",
        body: `Memoization: write recursion naturally, add cache — syntax mirrors the recurrence; computes only reachable states; recursion overhead (stack depth risk); dict overhead per lookup; tabulation: explicit loops — no stack, tighter loops, cache-friendly, computes all states (wasteful if sparse); rule of thumb: memoize when few states reachable (trees with pruning), tabulate when most states needed (grid DPs, strings); both are identical asymptotically; exam asks difference — memory (stack) vs definite computation; speed differences exam-irrelevant but real: tabulation wins by constant factor; memoization wins by laziness.`,
      },
      {
        title: "Knapsack: the DP archetype.",
        body: `0/1 knapsack: items with weight wᵢ, value vᵢ, capacity W; dp[i][c] = max value with first i items, capacity c; dp[i][c] = max(dp[i−1][c] (skip), dp[i−1][c−wᵢ] + vᵢ (take if c ≥ wᵢ)); O(nW) — pseudo-polynomial (W is numeric); space O(W) by row reuse; unbounded knapsack: take as many i as fit — same recurrence with dp[i][c−wᵢ] instead of dp[i−1][c−wᵢ]; fractional: greedy (above) — different problem; GATE asks trace table for tiny cases — fill 4×6 table by hand once in your life and never fear DP again; the reconstruction backtracks through take/skip decisions.`,
      },
      {
        title: "String DP: LCS, edit distance, LIS.",
        body: `LCS: dp[i][j] = LCS length of prefixes s[:i], t[:j]; if s[i−1]==t[j−1] → dp[i−1][j−1]+1 else max(dp[i−1][j], dp[i][j−1]); O(nm); reconstruct by backtracking matches. Edit distance: unit-cost insert/delete/substitute; same 2D skeleton, min operations; basis of diff tools; LIS: dp[i] = length of longest increasing subsequence ending at i; dp[i] = 1 + max dp[j] for j<i, aⱼ<aᵢ; O(n²); O(n log n) with patience-sorting binary search — GATE asks both; every string algorithm you will meet reduces to these three plus variants.`,
      },
      {
        title: "Interval DP and matrix chain multiplication.",
        body: `dp[i][j] = optimal for subarray i..j; dp[i][j] = min over k from i..j−1 of dp[i][k] + dp[k+1][j] + cost(k, i, j); matrix chain: cost = pᵢ₋₁ · p_k · p_j; O(n³); initialize dp[i][i] = 0; fill by increasing length; same skeleton yields palindrome partitioning, optimal BST, boolean parenthesization; every interval DP looks identical except the combine cost — recognize the shape, swap the cost function; GATE\'s matrix chain question is a rotation of this skeleton.`,
      },
    ],
    worked: [
      {
        title: "Fibonacci dp table from 0 to 10.",
        body: `dp[0]=0, dp[1]=1; dp[i]=dp[i−1]+dp[i−2]; dp[10]=55; in naive recursion 89 calls; memoized 11 — the entire DP pitch in two numbers; the table itself is the artifact; verifying dp[5]=5 against hand count — the confidence ritual; every GATE DP question starts from this exact table shape.`,
      },
      {
        title: 'LCS of "ABCBDAB" and "BDCAB" — table fill.',
        body: `dp table 8×6; final cell 4 — LCS length 4 (BCAB or BCBA); fill carefully : matches add 1 diagonal, mismatch takes max of up/left; trace reconstruct: from bottom-right walk diagonals on match, up/left otherwise — path spells BCAB; every long answer in the exam expects exactly this disciplined fill — practice once with patience.`,
      },
      {
        title: "0/1 knapsack table for (w,v)=(2,3),(3,4),(4,5),(5,6) W=5.",
        body: `dp[0..4][0..5]; dp[1][2..5]=3 (take item1 at c≥2); item2: dp[2][3..5]=max(3, 4)=4... dp[2][5]=max(dp[1][5]=3, dp[1][2]+4=7)=7; item3: dp[3][5]=max(dp[2][5]=7, dp[2][1]+5=5)=7; item4: dp[4][5]=max(7, dp[3][0]+6=6)=7 — answer 7 (items 1+2); the table fills mechanically — do it for five item sets until fluent.`,
      },
      {
        title: 'Edit distance "intention" → "execution".',
        body: `Classic textbook example; dp 9×9; answer 5 operations (delete i,n,t / insert e,c,u,t / substitute…) — the standard mapping: build from shorter string to longer with substitutions costing 1 — reconstruct path of edits — trace once to internalize the 2D walk; the exam asks final distance, not the path.`,
      },
    ],
    exam: [
      {
        question: "When does a problem admit dynamic programming?",
        answer:
          "When it exhibits optimal substructure and overlapping subproblems — both required; one without the other fails (overlapping without optimal substructure → memoized search still exponential in state count); the exact question on every theory paper.",
      },
      {
        question:
          "What is pseudo-polynomial time and which problem exemplifies it?",
        answer:
          "Knapsack O(nW) — polynomial in numeric value of W, exponential in bit-length of W — NP-hard with strong NP-hardness distinctions; the exam loves asking this precise nuance.",
      },
      {
        question: "Difference between memoization and tabulation?",
        answer:
          "Memo = top-down recursion + cache, computes only reached states; tab = bottom-up loops, computes all states in dependency order; no asymptotic difference; exam expects the named directions.",
      },
      {
        question:
          "How do you reconstruct the actual DP solution, not just the value?",
        answer:
          "Track parent choices during the fill (take/skip bits) or re-walk the table backward from the optimum cell following the recurrence's decision — every DP table is a map as well as a measure.",
      },
    ],
    cheat: [
      "State → recurrence → base → order → extract → complexity — the six steps.",
      "Memo = top-down lazy; tab = bottom-up eager; asymptotically identical.",
      "Knapsack O(nW) pseudo-poly; LCS O(nm); LIS O(n²) DP or O(n log n) patience.",
      "Interval DP skeleton: min over splits k; matrix chain cost = pᵢ₋₁p_k p_j.",
      "Optimize space by keeping only needed rows (knapsack row reuse).",
      "Reconstruct via parent bits or backward re-walk.",
    ],
    recap: `Dynamic programming is exhaustive enumeration with amnesia prevented: define the state smaller than the problem, fill tables bottom-up or lazily with cache, never recompute — the exponential collapses into polynomial; every string, grid, and capacity puzzle you dread is this one discipline wearing different masks.`,
    code: {
      title: "Knapsack row update",
      language: "python",
      code: `for c in range(W, w-1, -1):\n    dp[c] = max(dp[c], dp[c-w] + v)`,
      explanation:
        "One line erases the O(nW) table down to two rows — the standard space optimization.",
    },
    diagram: {
      title: "Memo vs tab traversal",
      caption:
        "Top-down lazy vs bottom-up eager — same answer, different walk.",
      mermaid: `flowchart LR\n  R[Recursion] --> M[Memo cache]\n  M --> A[Answer]\n  B[Bottom-up table] --> A`,
    },
  },
  "gate-cs-algorithms-backtracking-and-branch-and-bound": {
    intro: `Backtracking and branch-and-bound are systematic exhaustive search with intelligence: explore a decision tree, prune aggressively, find solutions (backtracking) or provably optimal ones (branch-and-bound). The subject covers the search-tree framework, constraint propagation, N-queens, subset-sum, and bounding functions for optimization — how algorithms beat exponential blowup without solving P=NP.`,
    foundations: `Backtracking: DFS over partial solution tree; at each node check feasibility; prune infeasible subtrees entirely; used for constraint problems (N-queens, Sudoku, graph coloring, Hamiltonian cycle, subsets). Branch-and-bound: same tree + bound estimates (lower bound for minimization, upper for maximization); prune when bound worse than incumbent best; used for optimization (traveling salesman, assignment problem, job sequencing). Key mechanics: state representation, promising()/bound() functions, pruning order (most-constrained-variable first), forward checking, MRV heuristic, least constraining value — general CSP machinery from AI; worst cases remain exponential, but the constants decide what actually runs.`,
    concepts: [
      {
        title:
          "The backtracking framework: choices, constraints, consequences.",
        body: `Template: solve(state): if goal(state): record; for each candidate next move: if legal(move, state): place; solve(state ∪ move); undo; — depth-first with undo — the universal skeleton; correctness passes through all goal states exactly once; efficiency = how aggressively you prune; N-queens on 8×8: ~2 million states explored vs 4 billion naive rows permutation — pruning by conflict-check collapses the tree; the exam wants: which prune happens when, and the count of nodes explored before finding a solution — trace the tree.`,
      },
      {
        title: "N-queens: the canonical backtracking exhibits.",
        body: `Place queens row by row; columns, diagonals occupied sets track conflicts; recurse; backtrack on conflict; counts: n=4 → 2 solutions; n=8 → 92; n=12 → 14,200; complexity empirical O(2.104^n); every pruning exam pays off here — GATE asks for number of recursive calls at depth k, or which constraint kills a branch — write the three legality checks (column, diag1 r+c, diag2 r−c) cold.`,
      },
      {
        title: "Branch-and-bound: pruning with bounds.",
        body: `For optimization problems, maintain best feasible solution so far (incumbent); at each node compute lower bound LB(node) (for minimization); if LB(node) ≥ incumbent, prune entire subtree — it cannot beat the incumbent; TSP: LB from assignment relaxation or MST bound; assignment problem: Hungarian bound; the bound must be cheap to compute — otherwise the pruning costs more than it saves; the invariant: underestimated LB (safe — never prunes optimal) vs true LB (ideal) vs overestimated (illegal — prunes optimum, wrong answer); exams test whether bounds are legal — identify overestimators fast.`,
      },
      {
        title: "Subset problems, Hamiltonian cycle, Sudoku.",
        body: `Subset sum: explore include/exclude per item; prune when running sum > target or remaining sum + current ≤ best... for feasibility (not optimization): prune when sum > target or sum + remaining < target; Hamiltonian: backtracking on vertices with connectivity and remaining-degree pruning; Sudoku: place candidates; prune on row/col/box conflicts; MRV (most constrained variable) + LCV (least constraining value) orderings collapse exponential blowups to practical; GATE asks for variable ordering heuristics and their pruning effect — know MRV/LCV vocabulary cold.`,
      },
      {
        title: "Complexity, pruning power, and the honest ceiling.",
        body: `Backtracking worst-case exponential always — it enumerates; pruning constant-factor only; B&B with strong bounds shrinks to polynomial-looking behavior on typical instances but never in theory; practical ceiling: millions of nodes per second; the art is ordering branches so good solutions appear early (incumbent tight → aggressive pruning); GATE asks "which search strategy visits fewest nodes" — answer: one with strongest bound or earliest solution found; never claim polynomial — that\'s the classic trap answer.`,
      },
    ],
    worked: [
      {
        title: "N-queens trace: place queens rows 0 and 1 on 4×4.",
        body: `Row 0: col 0 chosen (Try Q1 at (0,0)) — mark conflicts; row 1: col 0 taken, col 2 blocked diag (0+0=1+1=2? diag1: r+c equal → (0+0)=(1+1)=0,2? diag1 for (0,0): 0; (1,1): 2 — hmm: (1,1) and (0,0) share anti-diagonal r+c=0? 1+1=2 ≠ 0; r−c=0 both → main diagonal shared → blocked); col 1 (r−c=−1? 0−0=0, 1−1=0 — main diagonal blocked) — so row 0 col 0 ⇒ row 1 no placement... wait 4-queens solution exists; choose row 0 col 0: row 1 options col 2 or 3: (1,2): r−c = −1 vs (0,0) 0 — free; (1,3) fine too; continue — Q at (1,2)? then row 2: col 0 free? (2,0): diag from (0,0) r−c=0? (2,0): r−c=2 — free; (2,3): r+c=5 free; choose (2,3): row 3: col 0: r−c? (3,0)=3 free; (3,1): r+c=4 free... wait 1+2+... final solution exists; the full 4-queens solution set: [(1,3,0,2),(2,0,3,1)] rows→cols; trace once to internalize the recursion shape — every backtracking question mirrors this.`,
      },
      {
        title: "Subset-sum {3, 7, 4, 2}, target 10 — search tree.",
        body: `include 3 → rem 7; include 7 → rem 0 — solution {3,7}; include 4 instead → rem 3: include 2 → rem 1: no; exclude 2 → rem 3: dead; node backtrack; exclude 4 → rem 3: include 2 → 1; exclude 2 → 3: dead; {3,7} sole (or {2+…}: 3+7 vs 4+3? only {3,7},{3+2+…}? 2+…: 2+4+? = 6 no; 4+3? = {4,3,3}? 4+3+2=9; so only {3,7}); prune tests: any partial sum >10 prunes; partial + remaining <10 prunes; the algorithm never visits dead branches — count explored nodes, compare with 2^4 naive — pruning matters hugely at scale.`,
      },
      {
        title: "TSP with branch-and-bound on 4 cities.",
        body: `Cities A,B,C,D; distances: AB=10, AC=15, AD=20, BC=35, BD=25, CD=30; tour lower bound via MST or assignment: start incumbent by nearest neighbor: A→B→D→C→A = 10+25+30+15 = 80; prune any partial tour with LB ≥ 80; expand systematically — B&B explores without cycles, terminates with provably optimal 80 (or finds better 75 etc.); trace the LB calculations on paper once — the method always applies regardless of size.`,
      },
      {
        title: "Sudoku naked single propagation.",
        body: `Cell R3C5 only candidate 7 (row has 1-6,8,9; col has 7 free of them) — place 7 — cascade: row/col/box constraints eliminate 7 elsewhere in units — naked singles chain propagates — the puzzle solves by constraint propagation without search when lucky; if stuck, MRV picks smallest candidate set and branches — backtracking fallback; every solver alternates propagation and search; the propagation is almost exponential-solving power in practice.`,
      },
    ],
    exam: [
      {
        question:
          "Which heuristic most reduces branching factor in CSP backtracking?",
        answer:
          "MRV (most constrained variable — fewest legal values remaining) — combined with forward checking, the two collapse search trees dramatically; the exact question on CSP exams.",
      },
      {
        question: "What distinguishes backtracking from branch-and-bound?",
        answer:
          "Backtracking finds feasible solutions pruning infeasible nodes; B&B additionally prunes by bound against the incumbent for optimization — every B&B is backtracking, not conversely.",
      },
      {
        question: "Is backtracking polynomial or exponential in worst case?",
        answer:
          "Exponential — it enumerates a tree; the exam trap is claiming pruning makes it polynomial — pruning by constant factors never changes the asymptotic class; be adamant in answers.",
      },
      {
        question: "What is the incumbent in B&B?",
        answer:
          "The best complete feasible solution found so far — the pruning reference; without an incumbent, no bounding is possible; early good incumbents via heuristics make B&B dramatically effective.",
      },
    ],
    cheat: [
      "Backtracking: DFS tree, place → recurse → undo; prune infeasible.",
      "B&B: + bounds vs incumbent; prune when bound ≥ incumbent (minimization).",
      "N-queens: row-by-row, column/diagonal tracking, exponential always.",
      "Subset sum, Hamiltonian, Sudoku — all same skeleton, different legality checks.",
      "MRV + forward checking = strongest cheap pruning.",
      "Incumbent quality determines B&B speed — seed with heuristics.",
    ],
    recap: `Backtracking is disciplined guessing: try, test, retreat — because systematic enumeration beats blind brute force whenever constraints prune early; branch-and-bound extends that with provable pruning against the incumbent; because the universe is exponential, wisdom lives in which branches you never visit.`,
    code: {
      title: "Backtracking skeleton",
      language: "python",
      code: `def solve(state):\n    if goal(state): yield state; return\n    for m in moves(state):\n        if legal(state, m):\n            s2 = place(state, m)\n            yield from solve(s2)`,
      explanation:
        "The whole paradigm in five lines — everything else is pruning and representation.",
    },
    diagram: {
      title: "DFS search tree with pruning",
      caption:
        "Branches pruned when constraints or bounds fire — the exponential shrunk on paper.",
      mermaid: `flowchart TD\n  R[Root state] --> C1[Choice 1]\n  R --> C2[Choice 2]\n  C1 --> X[Pruned: illegal]`,
    },
  },
  "gate-cs-algorithms-string-algorithms": {
    intro: `String algorithms are the specialty branch for text — pattern matching, the Knuth-Morris-Pratt prefix function, tries, hashing, suffix arrays — the techniques powering search bars, DNA analyzers, and plagiarism detectors. The subject covers the fundamental mismatch story: why the naive matcher is O(nm) and how prefix knowledge drops it to O(n+m).`,
    foundations: `Pattern matching: find occurrences of pattern P in text T; naive O(|T|·|P|) with backup. KMP: preprocess P to LPS (longest proper prefix-suffix) table O(|P|); then scan T with no backup — O(|T|+|P|); Boyer-Moore: scan right-to-left with bad-character/good-suffix heuristics — sublinear on natural text. Rabin-Karp: rolling hash — hash windows, compare hashes, verify on match — average O(n). Tries: prefix trees — insertion/lookup O(key length); autocomplete, dictionary. Suffix arrays: sorted suffix indices — enables O(log n) or better substring search after O(n log n) construction; suffix automaton/tree for linear indexing. Z-algorithm, Manacher for palindromes.`,
    concepts: [
      {
        title: "KMP and the prefix (LPS) function.",
        body: `LPS[i] = length of longest proper prefix of P[:i+1] that is also a suffix; P="ABABC" → LPS = [0,0,1,2,0]; build with two pointers; KMP scans text once, state = matched prefix length; on mismatch, fall back LPS[state−1] — never revisit T; O(n+m); the table embodies "what we know about matched prefix after mismatch" — no restart, no slide-by-one; every string problem begins with computing borders — prefixes that are also suffixes — the notion underneath palindromes, period detection, and compression; the exam asks to fill LPS by hand.`,
      },
      {
        title: "Rabin-Karp rolling hash.",
        body: `Hash(pattern) vs hash(window T[i:i+m]) with polynomial rolling hash: H = (H·base − old·base^m) mod mod; O(1) per window after first; on collision verify by direct compare; choose mod 2^61−1 or double mod to make collision probability negligible; average O(n+m); used for multiple-pattern search via hash set of pattern hashes; fingerprints everywhere — DNA matching, plagiarism; GATE asks hash update formula — (H − T[i]·b^(m−1))·b + T[i+m] mod p.`,
      },
      {
        title: "Tries: search by prefix sky rockets.",
        body: `Trie node: children[26], isEnd flag; insert O(|word|); lookup O(|word|); prefix existence O(|prefix|); O(alphabet × nodes) space — compress via Patricia (radix) tries; applications: autocomplete (top-k via DFS), T9 predictive, IP routing (longest-prefix match), word games; every text tool above toy size uses tries or radix trees — if you find yourself doing prefix lookups 1000 times, build the trie once; the exam asks node counts for a small word list — count char by char.`,
      },
      {
        title: "Suffix arrays and palindrome algorithms.",
        body: `Suffix array SA: sorted indices of all suffixes — O(n log n) construction (prefix-doubling + radix sort); with LCP array enables constant-time LCP queries; substring search O(m log n) via binary search on SA; Manacher\'s algorithm finds all palindromic substrings in O(n) using symmetry radii — the palindrome champion; every palindrome question GATE dreams of reduces to Manacher or brute DP O(n²); for exam survival know DP exists; for interviews learn Manacher — the linear trick is unique and admired.`,
      },
      {
        title: "When strings attack you: periodicity and borders.",
        body: `Borders via LPS: string S has period p iff LPS[n−1] = n−p and p divides n; KMP used directly for period detection; prefix function answers "is this string a repetition of a smaller block"; used for run-length compression analysis; periodicity theorem: overlapping occurrences of period p imply period gcd — every string algorithmist knows the gcd argument; GATE: "find the smallest period of abcsdabcsd" — answer = gcd argument via LPS; practice one such question to lock it in.`,
      },
    ],
    worked: [
      {
        title: 'Compute LPS for "ABABCABAB".',
        body: `i=0:0; i=1: A≠B 0; i=2: A=A 1; i=3: A≠B 0; i=4: A≠C? P[4]=A vs: len=0, P[4]='A': match → 1; i=5: B vs P[1]: match → 2; i=6: A vs P[2]: match → 3; i=7: B vs P[3]: match → 4; i=8: A vs P[4]: match → 5; LPS=[0,0,1,0,1,2,3,4,5]; verification: suffix "ABABCABAB" longest prefix-suffix = "ABAB"? n=9, LPS=5 → border "ABABC" — yes; the trace builds skill for every KMP exam question.`,
      },
      {
        title: 'KMP search of "ABABCABAB" in "ABABDABACDABABCABAB".',
        body: `Walk with state m: compare T[i] vs P[m]; on match both advance; on mismatch m = LPS[m−1] (or i++ if 0); find match at position 10; full trace mechanical — the point: T never rewinds; practice three strings to internalize; the invariant: at every point T[0:i] processed, m = longest prefix of P matching suffix of processed T.`,
      },
      {
        title: 'Rolling hash of window "ABCD" with base 31, mod 1000003.',
        body: `H("ABCD") = ((((0·31 + 65)·31 + 66)·31 + 67)·31 + 68) = compute; next window "BCDE": H = (H − 65·31³)·31 + 69; O(1) update; the exercise shows modularity juggling; actual exam wants formula, not the number — the update mechanics are the payload.`,
      },
      {
        title: "Insert words into trie, count nodes.",
        body: `Words: cat, car, dogs, do: nodes — root; c→a→t, c→a→r share "ca" — nodes: root, c, a, t, r (5); d→o→g→s (4), d→o→? "do" ends — node "do" shared — add g,s (6); node count 7 + root = 8; trie question style: given word list, compute nodes/edges — trivial but easy to miscount: count every distinct prefix exactly once; discipline: write the tree — faster and safer than mental math.`,
      },
    ],
    exam: [
      {
        question: "What does KMP's prefix function enable?",
        answer:
          "Search without backtracking in the text — O(n+m) matching; the single most famous string-matching question; memorize the definition: longest proper prefix which is also a suffix.",
      },
      {
        question:
          "What is Rabin-Karp's average complexity and when does it degrade?",
        answer:
          "O(n+m) average — hash collisions force verification compares; adversarial input (same hash everywhere) degrades to O(nm); mod-prime doubling makes adversarial hits negligible.",
      },
      {
        question: "What does a suffix array give you that a trie does not?",
        answer:
          "Sorted global order of suffixes enabling binary search for substring membership in O(m log n) with O(n) space — tries are great for prefixes, suffix arrays for arbitrary substrings at scale.",
      },
      {
        question: "What is the time complexity of Manacher's algorithm?",
        answer:
          "O(n) — finds all palindromes in linear time; the exam contrast: brute force O(n²), DP O(n²), Manacher O(n) — know which is which.",
      },
    ],
    cheat: [
      "LPS/borders: longest proper prefix = suffix; KMP = O(n+m) no text backup.",
      "Rolling hash: H = (H·b + next) mod p — O(1) per window.",
      "Trie: insert/lookup O(key length); prefix queries; autocomplete core.",
      "Suffix array: O(n log n) build; substring search O(m log n).",
      "Manacher: O(n) palindromes; period p iff LPS[n−1]=n−p and p|n.",
      "Boyer-Moore: right-to-left scan, sublinear on natural text.",
    ],
    recap: `Strings compress intent into symbols — and algorithms exploit every repetition: KMP never rewinds, Rabin-Karp fingerprints windows, tries index prefixes globally, suffix arrays index everything, Manacher linearizes palindromes; because text is structured by humans, the structure is always there to harvest.`,
    code: {
      title: "LPS skeleton",
      language: "python",
      code: `lps = [0] * m; j = 0\nfor i in range(1, m):\n    while j and p[i] != p[j]: j = lps[j - 1]\n    if p[i] == p[j]: j += 1\n    lps[i] = j`,
      explanation: "The two pointers every KMP implementation carries inside.",
    },
    diagram: {
      title: "String match decision",
      caption:
        "Structure of the pattern decides which algorithm earns its keep.",
      mermaid: `flowchart LR\n  T[Text plus pattern] --> K[KMP: prefix reuse]\n  T --> R[Rabin-Karp: hashing]\n  T --> B[Boyer-Moore: skip heuristic]`,
    },
  },
  "gate-cs-algorithms-asymptotic-analysis-practice": {
    intro: `Asymptotic analysis practice is where notation meets reality: ordering functions, tight bounds, recurrence traps, and the gnarly comparison questions GATE loves — the discipline of seeing through algebraic smoke to the true growth class. The subject is pure muscle: order growth rates, solve recurrences cold, read pseudocode complexity at a glance.`,
    foundations: `Ordering: 1 < log log n < log n < √n < n < n log n < n√n < n² < n³ < 2^n < n! < n^n. Logarithms: any base, log₂ log₂ n etc. Common traps: n^a vs 2^n, n^{log b} vs n^b, log n vs √n, polynomial vs exponential. Recurrence solving drill: T(n) = 2T(n/2) + n log n (case 2 extended: Θ(n log² n)); T(n) = T(n−1) + n²; Master theorem edge cases; substitution pitfalls (forgetting constants/boundary); iteration counting embedded loops. GATE pattern: compare f(n) and g(n), find lim f/g — 0 → smaller, ∞ → larger, constant → same class; L\'Hôpital twice if needed; the infinitesimal hides every answer.`,
    concepts: [
      {
        title: "Ordering functions: the growth ladder.",
        body: `Memorize the ladder cold: 1, log log n, log n, (log n)^k, √n, n/ log n (careful), n, n log n, n log² n, n^1.5, n², n³, n^k, 2^n, n!, n^n; traps: 2^{log n} = n, log(n!) = Θ(n log n), n^{log₅4} = 2^{log₅ n²}... exam killer: n^a vs b^{n} — polynomial always loses; (log n)^k vs n^ε — polylog always loses; the quick triage: replace n with 10^6 mentally and see what wins; the formal proof is one limit evaluation with L\'Hôpital when stuck; practice fifty comparisons until the ladder fires reflexively — speed is the exam skill here.`,
      },
      {
        title: "Solving recurrences blindfolded.",
        body: `Practice sheet: T(n) = 2T(n/2) + n → Θ(n log n); T(n) = T(n/2) + 1 → Θ(log n); T(n) = 3T(n/3) + n → Θ(n log n); T(n) = T(n−1) + n → Θ(n²); T(n) = 2T(n/2) + n log n → Θ(n log² n) (extended master); T(n) = 4T(n/2) + n² → Θ(n²); T(n) = 2T(n/2) + n³ → Θ(n³); T(n) = √n · T(√n) + n → Θ(n log log n); T(n) = T(n−1) + log n → Θ(n log n); T(n) = 2T(n/2) + 1 → Θ(n); the catalog is finite — internalize these twelve and the exam\'s recurrence section is free marks; the extended master theorem handles n log^k n additions — add log factors accordingly.`,
      },
      {
        title: "Comparing functions with limits.",
        body: `lim n→∞ f(n)/g(n): 0 → f≪g (f=o(g)); ∞ → f≫g; constant c>0 → f=Θ(g); undefined/oscillating → incomparable directly (rare in GATE); tools: L\'Hôpital for indeterminate forms, Stirling log(n!) ≈ n log n − n, exponential dominance theorem (a^n ≫ n^k ∀k); two-function comparisons drill: log n vs n^{0.001} → n wins; 2^{√n} vs n^{100} → polynomial always wins; (log n)^{log n} vs n^{log log n} → equal! (both = n^{log log n}) — these equalities between exotic forms are GATE\'s delight; every candidate must recognize n^{log b} = b^{log n} — the universal identity.`,
      },
      {
        title: "Iteration counting and inner-loop multipliers.",
        body: `for i=1..n: for j=1..i: c → Σi = n(n+1)/2 = Θ(n²); for i=1..n: for j=i; j<n; j*=2 → Σ log(n−i+1) = Θ(n log n); while i<n: i*=2 nested with for j=1..i body O(1) → Σ_{k=0..log n} 2^k = Θ(n); for i=1..n: for j=1..n/i: → n·H(n) = Θ(n log n) where H is harmonic — every GATE embedded-loop question reduces to Σ and harmonic series — master the three templates (quadratic count, halving geometric, harmonic) and the exam gives up.`,
      },
      {
        title: "Asymptotic traps: where marks leak.",
        body: `log n base confusion — base is irrelevant for Θ with any constant exponent difference — but comparing log bases 2 and 10 matters when arguments are n^k... harmless — still matters for counting; n^a vs n^b for a<b — a wins for large n; f(n) = O(n) and g(n) = Ω(n²) does NOT imply f+g = Θ(n²) (f may hide g? no: f=O(n) ⊆ O(n²), f+g = Θ(n²) — fine); mixing different classes in sum: Θ of max — dominant term rules; product: exponents add; composition: check inner domain (2^{log n}, log(2^n)); unit confusion: n as count vs n as value — GCD(n) is log n time — bit-length traps everywhere; GATE weaponizes all of these — every one is free marks with discipline.`,
      },
    ],
    worked: [
      {
        title:
          "Order these five: n log n, 2^{log n}, n^{3/2}, log² n, √n log n.",
        body: `2^{log n} = n^{log₂2... base 2} = n; n^{3/2} = n√n; log² n ≪ √n; √n log n ≪ n^{3/2}? For large n: √n log n vs n^{3/2}: ratio = log n / n → 0 so √n log n grows slower; order: log² n < 2^{log n}(=n) < √n log n < n^{3/2}, n log n vs n — n < n log n so: log² n < n < √n log n? No: n vs √n log n: ratio n/(√n log n) = √n/log n → ∞ so n > √n log n. Final: log² n < √n log n < n < n log n < n^{3/2} — verify√n log n < n: yes. The whole ranking by mental rationalization — no calculator needed.`,
      },
      {
        title: "Solve T(n) = √n · T(√n) + n exactly.",
        body: `Let n = 2^{2^k}; S(k) = T(2^{2^k}); S(k) = 2^{2^k}· S(k−1) / ... careful: T(n) = √n·T(√n) + n → T(2^{2^k}) = 2^{2^{k-1}} T(2^{2^{k-1}}) + 2^{2^k}; recursion expands: T(n) = n + n^{3/4}·T(n^{1/4}) + ... ≈ n log log n — iterative expansion: each level cost n + n^{3/4} + n^{7/8} + ... until base n^{1/2^k} ≤ 2 → k = log log n levels × n = Θ(n log log n); the exam tests exactly this — master the doubling-exponent trick once, never again.`,
      },
      {
        title: "Compare f(n) = n^{log₂ 3} vs g(n) = n² using limits.",
        body: `log₂ 3 ≈ 1.585 < 2; f/g = n^{−0.415} → 0 ⇒ f = o(g), f grows strictly slower; the general rule: n^{log₂ a} vs n^b — compare b vs log₂ a; the identity n^{log_c d} = d^{log_c n} handles reciprocal forms; every such comparison in GATE reduces to exponent comparison — the log identity is the universal skeleton key.`,
      },
      {
        title: "Count the inner iterations of for j=1..n^i for i=1..n.",
        body: `Σ_{i=1}^n n^i = (n^{n+1} − n)/(n − 1) = Θ(n^n) — exponential; the trap: thinking Θ(n²) from the outer n × inner n; the inner is a geometric sum — the largest term dominates — Θ(n^n); the humility check: n^{n+1}/n ≈ n^n exactly; the exam asks for this exact flavor of misreading nested bounds as polynomial when geometric dominates; every candidate must master lim Σ n^i/n^n → 1 style arguments.`,
      },
    ],
    exam: [
      {
        question: "Which grows faster for large n: 2^{√n} or n^{100}?",
        answer:
          "n^{100} — any polynomial beats any subexponential of the form 2^{n^ε} for ε<1; the intuition: log of 2^{√n} = √n log 2 ≪ 100 log n eventually; twice in a GATE decade this question appears and slays the unready.",
      },
      {
        question: "What is Θ(log(n!))?",
        answer:
          "Θ(n log n) — by Stirling, log n! = n log n − n + O(log n); the exam treats this as known machinery — yes it will be directly asked; memorize it.",
      },
      {
        question: "Is log n = O(√n)? Is √n = O(log n)?",
        answer:
          "log n = O(√n) yes; √n = O(log n) no — every power of n dominates every power of log; asymmetry drills forever; exam asks one direction only, every time.",
      },
      {
        question: "What is the sum Σ_{i=1}^{n} 1/i?",
        answer:
          "Θ(log n) — the harmonic series; appears in divisor-sum counting arguments; GATE asks to recognize it, not derive it.",
      },
    ],
    cheat: [
      "Ladder: 1<log log n<log n<√n<n<n log n<n²<2^n<n!<n^n — cold.",
      "2^{log n}=n; n^{log b}=b^{log n}; log(n!)=Θ(n log n) — the three identities.",
      "Polynomial beats subexponential 2^{n^ε}; 2^n beats every polynomial.",
      "Nested bounds: Σ geometrics dominated by largest term.",
      "Master theorem case analysis; substitution proves on induction.",
      "Compare via limits — 0, ∞, or constant — no other outcomes in GATE.",
    ],
    recap: `Asymptotic mastery is a hundred pattern recognitions fired at exam speed: ordering functions on the ladder, limits as arbiters, recurrences solved blind, loops counted as harmonic or geometric — because the examiner hides every answer behind one identity or one sum, and the candidate who knows both never wonders.`,
    code: {
      title: "Growth rate litmus",
      language: "text",
      code: `log_2(1000) ~ 10; 2^10 = 1024; n=1000: n < n log n < 2^n`,
      explanation:
        "Three anchors to mentally re-derive any ladder rung when panic strikes in the exam hall.",
    },
    diagram: {
      title: "Comparison decision tree",
      caption:
        "Exponent comparison first, L'Hôpital second — the ladder never lies.",
      mermaid: `flowchart TD\n  F[f of n vs g of n] --> E{Compare exponents}\n  E --> L[Limit of f over g]\n  L --> T[Theta or little-o or omega]`,
    },
  },
  "gate-cs-algorithms-divide-and-conquer": {
    intro: `Divide and conquer is the oldest design strategy still running: split the problem into smaller independent copies, solve the copies recursively, combine their answers — the pattern behind merge sort, quicksort, binary search, Strassen multiplication and every log-factor speedup. The subject is the discipline: how to partition, how to combine, and how the recursion tree shape determines the complexity, plus the cases where a bad split destroys the elegance.`,
    foundations: `The three phases: DIVIDE (split into subproblems, ideally equal size, ideally constant count), CONQUER (recurse — base cases at size 1 or 2), COMBINE (merge subproblem results into the whole). Complexity comes from the recurrence T(n) = aT(n/b) + f(n) where a = subproblem count, b = size shrink factor, f(n) = divide+combine cost — Master theorem solves most instances. Correctness is by induction: assume correct on smaller inputs, show the combine step preserves correctness. Degenerate splits (unbalanced) give linear-depth recursion trees — O(n log n) lost, O(n²) regained. Key examples: merge sort, binary search, quickselect, Strassen, Karatsuba, closest-pair-of-points, FFT (Cooley–Tukey).`,
    concepts: [
      {
        title: "Balanced splits and the recursion tree shape.",
        body: `The power of the strategy lives in the split ratio. Splitting evenly (b=2) with constant combine cost gives log-depth trees with n work per level — merge sort's Θ(n log n). Splitting unevenly (e.g., quicksort's partition) gives balanced trees on average (random pivots) but degenerate linear trees on adversarial input — same asymptotic notation, vastly different constants and worst cases. The shape of the recursion tree is the algorithm's signature: width (subproblem count), depth (levels until size 1), and level cost (combine work) multiply and add to give the total. Reading a recurrence fluently means seeing the tree before solving it algebraically.`,
      },
      {
        title: "The combine step is where the real work hides.",
        body: `Divide is usually mechanical (halve, partition by index); conquer is the recursive contract; the combine is where the correctness argument and the cost live. Merge sort: two sorted halves merge in O(n) with two pointers. Strassen: 8 recursive multiplications reduced to 7 algebraic ones, additions growing to 18 — the subtle part is not the recursion but the algebra that makes the combine legal. Closest pair: merging across the dividing line requires only checking points within δ in a sorted strip — the packing argument (each point inspects constantly many neighbors) is the crux. When analyzing any divide-and-conquer algorithm, interrogate only the combine — the divide recursion is the skeleton, the combine is the muscle.`,
      },
      {
        title: "Binary search and quickselect: single-branch recursion.",
        body: `Binary search is divide-and-conquer with one subproblem (a=1): T(n) = T(n/2) + O(1) → Θ(log n). The correctness invariant — the answer lies in a known interval, each step discards half — is the model for every halving argument. Quickselect generalizes: pick a pivot, partition, recurse only into the side containing the target rank — T(n) = T(n/2) average → Θ(n) expected selection of the k-th smallest element, no sorting needed. The median-of-medians pivot guarantees Θ(n) worst case. Both teach the same lesson: recursion into ONE subproblem per step collapses logarithmically, and the correctness invariant is a shrinking window you can argue about directly.`,
      },
      {
        title: "Strassen, Karatsuba and the sub-n-squared revolution.",
        body: `Matrix multiplication naive is Θ(n³); Strassen recurses into 7 half-size products (M1..M7 via linear combinations) plus 18 additions — T(n) = 7T(n/2) + Θ(n²) = Θ(n^log₂7) ≈ Θ(n^2.807). Karatsuba multiplies n-digit integers with T(n) = 3T(n/2) + Θ(n) = Θ(n^log₂3) ≈ Θ(n^1.585). Both are divide-and-conquer at its most elegant: the combine is pure algebra, the win is replacing multiplications (expensive) with additions (cheap). The modern frontier pushes this further (Coppersmith–Winograd ~n^2.37 theoretically), but Strassen/Karatsuba are the exam fixtures and the working tools for n large enough that constants forgive the extra additions.`,
      },
      {
        title: "When divide and conquer fails: the anti-patterns.",
        body: `Overlapping subproblems without memoization — naive Fibonacci recursion recomputes exponentially; the fix is DP, not more recursion discipline. Combine steps that aren't cheaper than brute force — partitioning costs O(n) but if the merge logic degrades (e.g., closest-pair implemented with nested loops inside the merge), the whole scheme collapses to worse than iterative. Unbalanced input with bad pivots — quicksort mitigations: random pivot, median-of-three, introsort fallback to heapsort on depth limit. Non-independent subproblems — divide requires independence; coupled halves (longest common subsequence across a split boundary) need global reasoning, not recursion. The discipline: verify the recurrence before writing code.`,
      },
    ],
    worked: [
      {
        title: "Solve T(n) = 4T(n/2) + n via Master theorem.",
        body: `a=4, b=2 → n^(log₂4) = n². f(n) = n is polynomially smaller than n² (factor n) → case 1 → T(n) = Θ(n²). Sanity check with recursion tree: level 0 costs n, level 1 costs 4·(n/2) = 2n, level 2 costs 16·(n/4) = 4n, level k costs 2^k n for k up to log₂n — geometric series dominated by leaves: 2^log₂n · n = n² — consistent. The exam asks for the case identification; the tree validates the answer when the case feels unfamiliar.`,
      },
      {
        title: "Merge sort step: merge [1,4,7] and [2,5,6].",
        body: `Two pointers i=0,j=0 over the two halves; repeatedly emit the smaller: 1 (i→1), 2 (j→1), 4 (i→2), 5 (j→2), 6 (j→3, exhausted), 7 (i→3, exhausted) — output 1 2 4 5 6 7. Cost ≤ 2n−1 comparisons for merging two n-halves — Θ(n). Induction: if halves sorted (inductive hypothesis), merge sorts them — base case n≤1 trivially; therefore merge sort is correct. The merge neighborhood is where stability lives: prefer left on ties — every merge sort exam checks this.`,
      },
      {
        title: "Find the 3rd smallest in [9,3,7,1,8,5,2,6] via quickselect.",
        body: `Target rank 3. Pivot 6 (last). Partition around 6: left [3,1,5,2] (<6), right [9,7,8] (>6). Target rank 3 lands in left (size 4). Recurse on [3,1,5,2], pivot 2: partition left [1], right [3,5]. Sizes: left 1 < 3 → target in right part [3,5], rank within = 3−1−1 = 1 (1-indexed 1st smallest of [3,5]) → pivot-like selection: partition [3,5] pivot 5 → left [3], right empty; rank 1 → 3. Answer: 3 (sorted array 1 2 3 5 6 7 8 9 ✓). Quickselect average Θ(n), worst Θ(n²) with adversarial pivots — median-of-medians fixes.`,
      },
      {
        title: "Time complexity of the naive vs balanced closest-pair sweep.",
        body: `Closest pair of points: brute force Θ(n²). Divide-and-conquer: sort by x (Θ(n log n) preprocess), recursively find min distance δ in each half; merge checks points in vertical strip |x−mid| < δ sorted by y — each point compares against constantly many neighbors (packing bound: at most 7 points in the δ-rectangle) — combine Θ(n log n) from the y-sort (amortized Θ(n) with pre-sorted lists) → T(n) = 2T(n/2) + Θ(n log n) → Θ(n log² n) overall. The canonical example of combine doing real algorithmic work — the packing argument is what the exam tests.`,
      },
    ],
    exam: [
      {
        question: "Which recurrence does merge sort satisfy?",
        answer:
          "T(n) = 2T(n/2) + Θ(n), with T(1) = Θ(1) → Θ(n log n) by Master theorem case 2. The coefficient of f(n) and the log factor from equal case define the answer; every variant question (T(n) = 2T(n/2) + n + log n) lands in the same class.",
      },
      {
        question: "Why is binary search Θ(log n) and not Θ(n)?",
        answer:
          "Each step halves the search window — the recursion has one subproblem of half size: T(n) = T(n/2) + Θ(1) — Master theorem a=1, n^(log₂1) = n⁰ = 1, f(n)=1 → case 2 → Θ(log n). The doubling argument: after k steps, window ≤ n/2^k; reach 1 at k = log₂n.",
      },
      {
        question:
          "Strassen reduces 8 recursive matrix multiplications to how many, and why does it matter?",
        answer:
          "Seven — replacing one multiplication with additions; multiplications are costlier, and the reduction from a=8 to a=7 drops the exponent from log₂8 = 3 to log₂7 ≈ 2.807. For large n this beats cubic asymptotically despite higher constants — the celebrated demonstration that clever algebra rewrites the complexity class boundary.",
      },
      {
        question:
          "When should divide and conquer be preferred over dynamic programming?",
        answer:
          "When subproblems are independent — divide-and-conquer is invalid without independence (no shared state between halves); overlapping subproblems (Fibonacci) demand memoization/DP. Rule: independent → D&C; overlapping → DP; both share the recursion-tree skeleton, but the caching policy differs entirely.",
      },
    ],
    cheat: [
      "T(n) = aT(n/b) + f(n); Master theorem three cases — memorize the n^(log_b a) comparison.",
      "Merge sort Θ(n log n) always, stable, Θ(n) extra; quicksort avg Θ(n log n), in-place.",
      "Binary search / quickselect: one-subproblem recursion → logarithmic or linear.",
      "Strassen: 7 products, Θ(n^2.807); Karatsuba: Θ(n^1.585) — algebra beats brute force.",
      "Combine step decides correctness and cost — interrogate it first, always.",
      "Degenerate splits kill balance — random pivots / median-of-medians rescue quicksort.",
    ],
    recap: `Divide and conquer is the strategy of trusted recursion: halve the problem, trust the subanswers, combine with proven algebra — the recurrence T(n) = aT(n/b) + f(n) then dictates the price. Because the shape of the split decides everything, the engineer's first question is never "which sort" but "how balanced is my split?" — because balance, not cleverness, is what buys the logarithmic discount.`,
    code: {
      title: "Merge skeleton",
      language: "text",
      code: "while (i < n && j < m) emit(A[i] <= B[j] ? A[i++] : B[j++]); append remainders",
      explanation:
        "The two-pointer merge — the entire combine step, and the reason Θ(n) is real.",
    },
    diagram: {
      title: "D&C recursion tree",
      caption:
        "Depth log n, level cost n — the Θ(n log n) signature every merge sort carries.",
      mermaid:
        "flowchart TD\n  R[Root: n work] --> A[Half 1: n/2 work]\n  R --> B[Half 2: n/2 work]\n  A --> C[Quarter subtrees]\n  B --> D[Quarter subtrees]",
    },
  },
};

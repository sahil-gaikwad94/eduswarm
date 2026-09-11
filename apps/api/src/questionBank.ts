/**
 * EduSwarm Question Bank
 * ----------------------
 * Curated, exam-grade multiple-choice questions across the three learning
 * universes. GATE questions are PYQ-style (patterned on 2018-2024 papers);
 * web-dev and ai-ml questions are practice-grade with the same contract.
 *
 * Every question carries `marks` + GATE-style negative marking metadata so the
 * mock-exam engine can grade realistically (wrong answer costs marks/3).
 */

export type Question = {
  id: string;
  course: 'gate-cs' | 'web-dev' | 'ai-ml';
  source: 'gate-pyq' | 'practice';
  year: number;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  question: string;
  options: [string, string, string, string];
  answer: number;
  explanation: string;
};

export const QUESTION_BANK: Question[] = [
  // ---------------------------------------------------------------- GATE CS
  { id: 'gate-cse-2023-os-scheduling', course: 'gate-cs', source: 'gate-pyq', year: 2023, subject: 'Operating Systems', topic: 'CPU Scheduling', difficulty: 'medium', marks: 1, question: 'A process scheduling policy that gives each ready process a fixed time slice in cyclic order is:', options: ['FCFS', 'Round Robin', 'Shortest Job First', 'Non-preemptive priority'], answer: 1, explanation: 'Round Robin cycles through ready processes and assigns each a bounded time quantum.' },
  { id: 'gate-cse-2022-db-normalization', course: 'gate-cs', source: 'gate-pyq', year: 2022, subject: 'DBMS', topic: 'Normalization', difficulty: 'medium', marks: 1, question: 'A relation is in BCNF when, for every non-trivial functional dependency X → Y, X is a:', options: ['Foreign key', 'Candidate key', 'Prime attribute', 'Superkey'], answer: 3, explanation: 'BCNF requires every determinant of a non-trivial dependency to be a superkey.' },
  { id: 'gate-cse-2021-algo-complexity', course: 'gate-cs', source: 'gate-pyq', year: 2021, subject: 'Algorithms', topic: 'Complexity', difficulty: 'easy', marks: 1, question: 'The worst-case time complexity of binary search on a sorted array is:', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], answer: 1, explanation: 'Each comparison halves the remaining search interval.' },
  { id: 'gate-cse-2020-cn-routing', course: 'gate-cs', source: 'gate-pyq', year: 2020, subject: 'Computer Networks', topic: 'Routing', difficulty: 'medium', marks: 1, question: 'Which algorithm is classically associated with distance-vector routing?', options: ['Dijkstra', 'Bellman-Ford', 'Kruskal', 'Prim'], answer: 1, explanation: 'Distance-vector protocols exchange route distances and use Bellman-Ford style updates.' },
  { id: 'gate-cse-2019-toc-automata', course: 'gate-cs', source: 'gate-pyq', year: 2019, subject: 'Theory of Computation', topic: 'Finite Automata', difficulty: 'medium', marks: 1, question: 'Regular languages are closed under:', options: ['Union', 'Only reversal', 'Only complement', 'None of these'], answer: 0, explanation: 'Regular languages are closed under union, intersection, complement, concatenation, and more.' },
  { id: 'gate-cse-2018-coa-cache', course: 'gate-cs', source: 'gate-pyq', year: 2018, subject: 'Computer Organization', topic: 'Cache Memory', difficulty: 'hard', marks: 2, question: 'The main benefit of a cache is exploiting:', options: ['Only parallelism', 'Locality of reference', 'Instruction pipelining', 'Virtualization'], answer: 1, explanation: 'Caches rely on temporal and spatial locality of reference.' },

  // Operating Systems
  { id: 'gate-cse-2024-os-deadlock', course: 'gate-cs', source: 'gate-pyq', year: 2024, subject: 'Operating Systems', topic: 'Deadlocks', difficulty: 'medium', marks: 1, question: 'Which of the following is NOT one of the necessary conditions for deadlock?', options: ['Mutual exclusion', 'Hold and wait', 'Preemption', 'Circular wait'], answer: 2, explanation: 'Deadlock needs mutual exclusion, hold-and-wait, no preemption, and circular wait. Allowing preemption breaks deadlock.' },
  { id: 'gate-cse-2022-os-belady', course: 'gate-cs', source: 'gate-pyq', year: 2022, subject: 'Operating Systems', topic: 'Page Replacement', difficulty: 'medium', marks: 1, question: "Belady's anomaly (more frames causing more page faults) can occur with which replacement policy?", options: ['FIFO', 'LRU', 'Optimal', 'Clock'], answer: 0, explanation: 'FIFO is not a stack algorithm, so adding frames can increase the fault rate.' },
  { id: 'gate-cse-2021-os-peterson', course: 'gate-cs', source: 'gate-pyq', year: 2021, subject: 'Operating Systems', topic: 'Synchronization', difficulty: 'medium', marks: 1, question: "Peterson's solution for two processes guarantees:", options: ['Mutual exclusion only', 'Mutual exclusion and progress with bounded waiting', 'Correctness only for three or more processes', 'Freedom from starvation without mutual exclusion'], answer: 1, explanation: 'Peterson’s algorithm gives mutual exclusion, progress, and bounded waiting for two processes.' },
  { id: 'gate-cse-2020-os-inode', course: 'gate-cs', source: 'gate-pyq', year: 2020, subject: 'Operating Systems', topic: 'File Systems', difficulty: 'easy', marks: 1, question: 'In a Unix-style file system, an inode stores all of the following EXCEPT:', options: ['File size', 'Data block pointers', 'File name', 'Permission bits'], answer: 2, explanation: 'File names live in directory entries; the inode holds metadata and block pointers.' },
  { id: 'gate-cse-2019-os-thrashing', course: 'gate-cs', source: 'gate-pyq', year: 2019, subject: 'Operating Systems', topic: 'Virtual Memory', difficulty: 'medium', marks: 1, question: 'Thrashing is best reduced by:', options: ['Increasing multiprogramming', 'Giving each process enough frames for its working set', 'Using smaller pages only', 'Disabling virtual memory'], answer: 1, explanation: 'Thrashing is excessive paging; allocating frames to cover the working set fixes it.' },

  // DBMS
  { id: 'gate-cse-2024-db-serial', course: 'gate-cs', source: 'gate-pyq', year: 2024, subject: 'DBMS', topic: 'Serializability', difficulty: 'medium', marks: 1, question: 'A schedule is conflict-serializable if and only if its precedence graph is:', options: ['Cyclic', 'Acyclic', 'Complete', 'Bipartite'], answer: 1, explanation: 'An acyclic precedence graph means conflicts can be ordered into an equivalent serial schedule.' },
  { id: 'gate-cse-2023-db-btree', course: 'gate-cs', source: 'gate-pyq', year: 2023, subject: 'DBMS', topic: 'Indexing', difficulty: 'medium', marks: 1, question: 'In a B+ tree, all data record pointers are stored:', options: ['Only in internal nodes', 'Only in leaf nodes', 'Equally in every node', 'In the root only'], answer: 1, explanation: 'B+ tree internal nodes hold keys for navigation; records live in the linked leaf level.' },
  { id: 'gate-cse-2021-db-sql', course: 'gate-cs', source: 'gate-pyq', year: 2021, subject: 'DBMS', topic: 'SQL', difficulty: 'easy', marks: 1, question: 'COUNT(*) differs from COUNT(column) in that COUNT(*):', options: ['Ignores NULLs in all columns', 'Counts rows including those with NULLs', 'Returns 0 for empty tables only when grouped', 'Requires a GROUP BY clause'], answer: 1, explanation: 'COUNT(*) counts rows regardless of NULLs; COUNT(column) skips NULL values in that column.' },
  { id: 'gate-cse-2020-db-2pl', course: 'gate-cs', source: 'gate-pyq', year: 2020, subject: 'DBMS', topic: 'Concurrency Control', difficulty: 'hard', marks: 2, question: 'Strict two-phase locking guarantees:', options: ['Serializability and freedom from deadlock', 'Serializability and recoverability', 'Only freedom from starvation', 'Only view serializability'], answer: 1, explanation: 'Strict 2PL (exclusive locks held till commit) ensures conflict-serializable, recoverable schedules.' },
  { id: 'gate-cse-2019-db-er', course: 'gate-cs', source: 'gate-pyq', year: 2019, subject: 'DBMS', topic: 'ER Model', difficulty: 'easy', marks: 1, question: 'In ER diagrams, total participation of an entity set is shown by a:', options: ['Single line', 'Double line', 'Dashed ellipse', 'Double diamond only'], answer: 1, explanation: 'A double line from entity set to relationship denotes total (mandatory) participation.' },

  // Algorithms
  { id: 'gate-cse-2024-algo-kruskal', course: 'gate-cs', source: 'gate-pyq', year: 2024, subject: 'Algorithms', topic: 'Greedy Algorithms', difficulty: 'medium', marks: 1, question: "Kruskal's MST algorithm runs in O(E log E) time primarily because of:", options: ['Union-find path compression', 'Sorting the edges by weight', 'BFS traversal', 'Building an adjacency matrix'], answer: 1, explanation: 'Sorting E edges dominates; union-find operations are nearly constant with path compression.' },
  { id: 'gate-cse-2023-algo-knapsack', course: 'gate-cs', source: 'gate-pyq', year: 2023, subject: 'Algorithms', topic: 'Dynamic Programming', difficulty: 'hard', marks: 2, question: 'The 0/1 knapsack DP solution in O(nW) time is called pseudo-polynomial because:', options: ['It uses recursion', 'Its time depends on the numeric value of W, not its bit length', 'It only works for fractional items', 'It needs exponential space'], answer: 1, explanation: 'W contributes log W bits of input but W units of time, so it is exponential in input size.' },
  { id: 'gate-cse-2022-algo-stable', course: 'gate-cs', source: 'gate-pyq', year: 2022, subject: 'Algorithms', topic: 'Sorting', difficulty: 'easy', marks: 1, question: 'Which sorting algorithm is stable with O(n log n) worst-case time?', options: ['Quick sort', 'Heap sort', 'Merge sort', 'Selection sort'], answer: 2, explanation: 'Merge sort preserves equal-element order and always divides the input in half.' },
  { id: 'gate-cse-2020-algo-bfs', course: 'gate-cs', source: 'gate-pyq', year: 2020, subject: 'Algorithms', topic: 'Graph Algorithms', difficulty: 'easy', marks: 1, question: 'Breadth-first search from a source in an unweighted graph directly yields:', options: ['A minimum spanning tree', 'Shortest-path distances from the source', 'A topological order', 'Strongly connected components'], answer: 1, explanation: 'BFS explores vertices in increasing distance, so first discovery gives the shortest path.' },
  { id: 'gate-cse-2019-algo-heap', course: 'gate-cs', source: 'gate-pyq', year: 2019, subject: 'Algorithms', topic: 'Heaps', difficulty: 'medium', marks: 1, question: 'Building a binary heap from n arbitrary elements takes:', options: ['O(n)', 'O(n log n)', 'O(log n)', 'O(n²)'], answer: 0, explanation: 'Bottom-up heapify costs O(n) because most nodes sit near the leaves with tiny subtrees.' },
  { id: 'gate-cse-2018-algo-master', course: 'gate-cs', source: 'gate-pyq', year: 2018, subject: 'Algorithms', topic: 'Complexity', difficulty: 'medium', marks: 1, question: 'For T(n) = 2T(n/2) + Θ(n), the Master theorem gives:', options: ['Θ(n)', 'Θ(n log n)', 'Θ(n²)', 'Θ(n log² n)'], answer: 1, explanation: 'Here a=2, b=2, f(n)=Θ(n^(log_b a))=Θ(n): case 2 yields Θ(n log n).' },

  // Computer Networks
  { id: 'gate-cse-2024-cn-tcp', course: 'gate-cs', source: 'gate-pyq', year: 2024, subject: 'Computer Networks', topic: 'Transport Layer', difficulty: 'easy', marks: 1, question: 'The TCP three-way handshake sequence is:', options: ['SYN, SYN-ACK, ACK', 'ACK, SYN, FIN', 'SYN, ACK, PSH', 'RST, SYN, ACK'], answer: 0, explanation: 'The client sends SYN, the server replies SYN-ACK, and the client confirms with ACK.' },
  { id: 'gate-cse-2023-cn-subnet', course: 'gate-cs', source: 'gate-pyq', year: 2023, subject: 'Computer Networks', topic: 'IP Addressing', difficulty: 'medium', marks: 1, question: 'A /26 IPv4 subnet provides how many usable host addresses?', options: ['62', '64', '30', '126'], answer: 0, explanation: '6 host bits give 64 addresses; subtracting network and broadcast leaves 62.' },
  { id: 'gate-cse-2022-cn-csmacd', course: 'gate-cs', source: 'gate-pyq', year: 2022, subject: 'Computer Networks', topic: 'Data Link Layer', difficulty: 'easy', marks: 1, question: 'CSMA/CD is the medium access method historically used by:', options: ['Classic Ethernet', 'Token Ring', 'Wi-Fi (802.11)', 'SONET'], answer: 0, explanation: 'Classic Ethernet detects collisions (CD); Wi-Fi avoids them (CSMA/CA) since it cannot detect reliably.' },
  { id: 'gate-cse-2021-cn-dns', course: 'gate-cs', source: 'gate-pyq', year: 2021, subject: 'Computer Networks', topic: 'Application Layer', difficulty: 'easy', marks: 1, question: 'DNS queries are normally transported over:', options: ['UDP port 53', 'TCP port 80', 'UDP port 67', 'TCP port 25'], answer: 0, explanation: 'DNS uses UDP port 53 for fast lookups, falling back to TCP for large transfers.' },
  { id: 'gate-cse-2019-cn-window', course: 'gate-cs', source: 'gate-pyq', year: 2019, subject: 'Computer Networks', topic: 'Flow Control', difficulty: 'medium', marks: 1, question: 'In sliding-window flow control, the sender may have at most ___ unacknowledged segments outstanding.', options: ['One', 'Window size', 'Two', 'Unlimited'], answer: 1, explanation: 'The window bounds unacknowledged data, coupling throughput to the advertised window.' },

  // Theory of Computation
  { id: 'gate-cse-2024-toc-pumping', course: 'gate-cs', source: 'gate-pyq', year: 2024, subject: 'Theory of Computation', topic: 'Regular Languages', difficulty: 'medium', marks: 1, question: 'The pumping lemma for regular languages is used to prove a language is:', options: ['Regular', 'Not regular', 'Context-free', 'Decidable'], answer: 1, explanation: 'It gives a necessary condition for regularity; violating it proves non-regularity.' },
  { id: 'gate-cse-2023-toc-halting', course: 'gate-cs', source: 'gate-pyq', year: 2023, subject: 'Theory of Computation', topic: 'Decidability', difficulty: 'hard', marks: 2, question: 'The halting problem for Turing machines is:', options: ['Decidable', 'Semi-decidable but undecidable', 'Regular', 'Context-free'], answer: 1, explanation: 'A simulator recognizes halting instances (semi-decidable), but no decider exists.' },
  { id: 'gate-cse-2022-toc-cfl', course: 'gate-cs', source: 'gate-pyq', year: 2022, subject: 'Theory of Computation', topic: 'Context-Free Grammars', difficulty: 'medium', marks: 1, question: 'L = {aⁿbⁿ | n ≥ 1} is:', options: ['Regular', 'Context-free but not regular', 'Not context-free', 'Finite'], answer: 1, explanation: 'A PDA can match the counts with its stack, but no finite automaton can count unboundedly.' },
  { id: 'gate-cse-2020-toc-sat', course: 'gate-cs', source: 'gate-pyq', year: 2020, subject: 'Theory of Computation', topic: 'Complexity Classes', difficulty: 'hard', marks: 2, question: 'Boolean satisfiability (SAT) is significant because it was the first problem proven:', options: ['P-complete', 'NP-complete', 'Undecidable', 'To be in co-P only'], answer: 1, explanation: 'The Cook–Levin theorem established SAT as NP-complete, anchoring thousands of reductions.' },

  // Computer Organization
  { id: 'gate-cse-2024-coa-pipeline', course: 'gate-cs', source: 'gate-pyq', year: 2024, subject: 'Computer Organization', topic: 'Pipelining', difficulty: 'medium', marks: 1, question: 'In an ideal 5-stage pipeline with no hazards, steady-state throughput approaches:', options: ['1 instruction per cycle', '5 instructions per cycle', '1 instruction per 5 cycles', '0.2 IPC regardless of stages'], answer: 0, explanation: 'Pipelining overlaps stages so one instruction completes per cycle at steady state.' },
  { id: 'gate-cse-2023-coa-ieee', course: 'gate-cs', source: 'gate-pyq', year: 2023, subject: 'Computer Organization', topic: 'Computer Arithmetic', difficulty: 'easy', marks: 1, question: 'The exponent bias used in IEEE 754 single-precision floating point is:', options: ['127', '255', '1023', '15'], answer: 0, explanation: 'Single precision uses an 8-bit biased exponent with bias 127 (1023 for double).' },
  { id: 'gate-cse-2022-coa-cachemap', course: 'gate-cs', source: 'gate-pyq', year: 2022, subject: 'Computer Organization', topic: 'Cache Memory', difficulty: 'easy', marks: 1, question: 'In a direct-mapped cache, a memory block can be placed:', options: ['In any cache line', 'In exactly one cache line', 'Only in the first set', 'In two alternating lines'], answer: 1, explanation: 'Direct mapping fixes each block to one line via its index bits — simple but conflict-prone.' },
  { id: 'gate-cse-2021-coa-addr', course: 'gate-cs', source: 'gate-pyq', year: 2021, subject: 'Computer Organization', topic: 'Addressing Modes', difficulty: 'easy', marks: 1, question: 'In PC-relative addressing, the effective address is computed as:', options: ['PC + offset', 'Base register + index', 'Stack pointer − offset', 'Opcode + operand'], answer: 0, explanation: 'PC-relative adds a signed offset to the program counter, enabling position-independent code.' },

  // Digital Logic
  { id: 'gate-cse-2023-dl-mux', course: 'gate-cs', source: 'gate-pyq', year: 2023, subject: 'Digital Logic', topic: 'Combinational Circuits', difficulty: 'easy', marks: 1, question: 'A 16-to-1 multiplexer requires ___ select lines.', options: ['2', '3', '4', '16'], answer: 2, explanation: 'Selecting among 2ⁿ inputs needs n select lines; 2⁴ = 16.' },
  { id: 'gate-cse-2022-dl-tff', course: 'gate-cs', source: 'gate-pyq', year: 2022, subject: 'Digital Logic', topic: 'Sequential Circuits', difficulty: 'easy', marks: 1, question: 'A T flip-flop with T = 1 on every active clock edge will:', options: ['Hold its state', 'Toggle its state', 'Reset to 0', 'Become metastable'], answer: 1, explanation: 'T=1 toggles the output each clock, dividing frequency by two.' },
  { id: 'gate-cse-2021-dl-complement', course: 'gate-cs', source: 'gate-pyq', year: 2021, subject: 'Digital Logic', topic: 'Number Systems', difficulty: 'easy', marks: 1, question: "The range of 8-bit 2's complement integers is:", options: ['0 to 255', '−128 to +127', '−127 to +128', '−256 to +255'], answer: 1, explanation: 'n-bit 2’s complement spans −2ⁿ⁻¹ … +(2ⁿ⁻¹ − 1).' },
  { id: 'gate-cse-2020-dl-kmap', course: 'gate-cs', source: 'gate-pyq', year: 2020, subject: 'Digital Logic', topic: 'Boolean Algebra', difficulty: 'medium', marks: 1, question: 'Karnaugh maps minimize sum-of-products expressions by grouping:', options: ['Zeros only', 'Adjacent 1s in powers of two', 'Prime implicants of size 3', 'Only essential hazards'], answer: 1, explanation: 'Groups of 1, 2, 4, 8… adjacent minterms eliminate the variables that change within the group.' },

  // Compiler Design
  { id: 'gate-cse-2023-cd-ll1', course: 'gate-cs', source: 'gate-pyq', year: 2023, subject: 'Compiler Design', topic: 'Parsing', difficulty: 'medium', marks: 1, question: 'An LL(1) parser performs:', options: ['Top-down parsing with one lookahead token', 'Bottom-up parsing with one lookahead token', 'LR table parsing with one state', 'Backtracking over one rule'], answer: 0, explanation: 'LL(1): Left-to-right scan, Leftmost derivation, 1 token of lookahead, top-down.' },
  { id: 'gate-cse-2022-cd-lex', course: 'gate-cs', source: 'gate-pyq', year: 2022, subject: 'Compiler Design', topic: 'Lexical Analysis', difficulty: 'easy', marks: 1, question: 'Maximal munch in lexical analysis means the scanner matches:', options: ['The shortest valid lexeme', 'The longest valid lexeme', 'The first grammar rule only', 'Only keywords'], answer: 1, explanation: 'The lexer consumes the longest prefix that forms a valid token.' },
  { id: 'gate-cse-2021-cd-lr', course: 'gate-cs', source: 'gate-pyq', year: 2021, subject: 'Compiler Design', topic: 'Parsing', difficulty: 'hard', marks: 2, question: 'Which grammar class accepts the largest set of languages?', options: ['LL(1)', 'SLR', 'LALR', 'Canonical LR(1)'], answer: 3, explanation: 'Power increases LL(1) ⊂ SLR ⊂ LALR ⊂ canonical LR; LR(1) handles the most grammars.' },
  { id: 'gate-cse-2020-cd-sdt', course: 'gate-cs', source: 'gate-pyq', year: 2020, subject: 'Compiler Design', topic: 'Syntax-Directed Translation', difficulty: 'medium', marks: 1, question: 'An S-attributed definition uses:', options: ['Only synthesized attributes', 'Only inherited attributes', 'Both with circular dependencies', 'Only lexical attributes'], answer: 0, explanation: 'S-attributed grammars use synthesized attributes only, evaluable bottom-up during parsing.' },

  // Data Structures + C Programming
  { id: 'gate-cse-2024-ds-inorder', course: 'gate-cs', source: 'gate-pyq', year: 2024, subject: 'Data Structures', topic: 'Trees', difficulty: 'easy', marks: 1, question: 'Inorder traversal of a binary search tree visits keys in:', options: ['Sorted order', 'Reverse level order', 'Preorder', 'Arbitrary order'], answer: 0, explanation: 'Inorder visits left subtree, node, right subtree — ascending order for a BST.' },
  { id: 'gate-cse-2023-ds-postfix', course: 'gate-cs', source: 'gate-pyq', year: 2023, subject: 'Data Structures', topic: 'Stacks', difficulty: 'easy', marks: 1, question: "Postfix expression '5 3 2 * +' evaluates to:", options: ['11', '13', '10', '16'], answer: 0, explanation: '3*2 = 6, then 5+6 = 11 using stack evaluation.' },
  { id: 'gate-cse-2022-ds-circular', course: 'gate-cs', source: 'gate-pyq', year: 2022, subject: 'Data Structures', topic: 'Queues', difficulty: 'medium', marks: 1, question: 'A circular queue of capacity N (array implementation, one slot sacrificed) is full when:', options: ['front == rear', '(rear + 1) % N == front', 'rear == N − 1', 'count == N regardless of positions'], answer: 1, explanation: 'Sacrificing one slot disambiguates full from empty: full iff the next rear meets front.' },
  { id: 'gate-cse-2021-c-pointers', course: 'gate-cs', source: 'gate-pyq', year: 2021, subject: 'Programming', topic: 'Pointers', difficulty: 'easy', marks: 1, question: 'If int a[10]; is declared, then the type of (a + 3) in C is:', options: ['int', 'int *', 'int[10]', 'void *'], answer: 1, explanation: 'The array decays to int* pointing at a[0]; adding 3 advances by three ints.' },
  { id: 'gate-cse-2020-ds-stacksort', course: 'gate-cs', source: 'gate-pyq', year: 2020, subject: 'Data Structures', topic: 'Stacks', difficulty: 'medium', marks: 1, question: 'Sorting a stack using only one additional stack takes worst-case time:', options: ['O(n)', 'O(n²)', 'O(n log n)', 'O(1)'], answer: 1, explanation: 'Each of n insertions may shuffle O(n) elements between the two stacks.' },

  // Engineering Mathematics
  { id: 'gate-cse-2024-math-bayes', course: 'gate-cs', source: 'gate-pyq', year: 2024, subject: 'Engineering Mathematics', topic: 'Probability', difficulty: 'medium', marks: 1, question: "Bayes' theorem computes:", options: ['P(A|B) from P(B|A), P(A), P(B)', 'P(A ∧ B) from P(A) alone', 'The mode of any distribution', 'Eigenvalues of a stochastic matrix'], answer: 0, explanation: 'P(A|B) = P(B|A)·P(A)/P(B): it inverts conditional probabilities using priors.' },
  { id: 'gate-cse-2023-math-euler', course: 'gate-cs', source: 'gate-pyq', year: 2023, subject: 'Engineering Mathematics', topic: 'Graph Theory', difficulty: 'medium', marks: 1, question: 'A connected undirected graph has an Eulerian trail if and only if it has:', options: ['Only vertices of even degree', '0 or 2 vertices of odd degree', 'All vertices of odd degree', 'No cycles'], answer: 1, explanation: 'Eulerian circuit needs all-even degrees; a trail allows exactly two odd endpoints.' },
  { id: 'gate-cse-2022-math-equiv', course: 'gate-cs', source: 'gate-pyq', year: 2022, subject: 'Engineering Mathematics', topic: 'Discrete Mathematics', difficulty: 'easy', marks: 1, question: 'A relation is an equivalence relation if and only if it is:', options: ['Reflexive, symmetric, and transitive', 'Reflexive and antisymmetric', 'Symmetric and complete', 'Transitive only'], answer: 0, explanation: 'Equivalence = reflexive + symmetric + transitive; it partitions the set into classes.' },
  { id: 'gate-cse-2021-math-trees', course: 'gate-cs', source: 'gate-pyq', year: 2021, subject: 'Engineering Mathematics', topic: 'Graph Theory', difficulty: 'easy', marks: 1, question: 'A tree with n vertices has exactly ___ edges.', options: ['n', 'n − 1', 'n + 1', '2n − 2'], answer: 1, explanation: 'Trees are minimally connected: n vertices, n−1 edges, no cycles.' },

  // Aptitude
  { id: 'gate-cse-2024-apt-train', course: 'gate-cs', source: 'gate-pyq', year: 2024, subject: 'General Aptitude', topic: 'Speed and Time', difficulty: 'easy', marks: 1, question: 'A 240 m train crosses a pole in 12 s. Its speed is:', options: ['20 m/s', '72 km/h', 'Both 20 m/s and 72 km/h', '48 km/h'], answer: 2, explanation: '240/12 = 20 m/s; ×3.6 gives 72 km/h. Both describe the same speed.' },
  { id: 'gate-cse-2023-apt-percent', course: 'gate-cs', source: 'gate-pyq', year: 2023, subject: 'General Aptitude', topic: 'Percentages', difficulty: 'easy', marks: 1, question: 'If x is 25% more than y, then y is what percent less than x?', options: ['20%', '25%', '75%', '30%'], answer: 0, explanation: 'y = x/1.25 = 0.8x, so y is 20% less than x. Percentage bases differ.' },
  { id: 'gate-cse-2022-apt-series', course: 'gate-cs', source: 'gate-pyq', year: 2022, subject: 'General Aptitude', topic: 'Number Series', difficulty: 'easy', marks: 1, question: 'Next term: 2, 6, 12, 20, 30, ___', options: ['40', '42', '36', '44'], answer: 1, explanation: 'Terms are n(n+1): 1·2, 2·3, …, 6·7 = 42.' },
  { id: 'gate-cse-2021-apt-prob', course: 'gate-cs', source: 'gate-pyq', year: 2021, subject: 'General Aptitude', topic: 'Probability', difficulty: 'medium', marks: 1, question: 'Two fair dice are rolled. P(sum = 9) equals:', options: ['1/9', '1/6', '5/36', '1/12'], answer: 0, explanation: 'Favorable pairs: (3,6),(4,5),(5,4),(6,3) → 4/36 = 1/9.' },

  // ------------------------------------------------------------- WEB DEV
  { id: 'web-html-accessibility', course: 'web-dev', source: 'practice', year: 2025, subject: 'Frontend', topic: 'HTML & Accessibility', difficulty: 'medium', marks: 1, question: 'Which attribute gives an informative accessible name to an icon-only button?', options: ['class', 'aria-label', 'tabindex=-1', 'role=img'], answer: 1, explanation: 'aria-label supplies an accessible name when visible text is not present.' },
  { id: 'web-api-idempotency', course: 'web-dev', source: 'practice', year: 2025, subject: 'Backend', topic: 'API Design', difficulty: 'medium', marks: 1, question: 'Which HTTP method is designed to be idempotent for replacing a resource?', options: ['POST', 'PATCH', 'PUT', 'CONNECT'], answer: 2, explanation: 'Repeating the same PUT replacement has the same intended effect as applying it once.' },
  { id: 'web-db-index', course: 'web-dev', source: 'practice', year: 2025, subject: 'Backend', topic: 'Databases', difficulty: 'medium', marks: 1, question: 'What is the primary trade-off of adding an index to a frequently queried column?', options: ['Reads become impossible', 'Writes and storage cost increase', 'Transactions stop being atomic', 'The table cannot be joined'], answer: 1, explanation: 'Indexes speed compatible reads but must be maintained during writes and consume storage.' },
  { id: 'web-react-effect', course: 'web-dev', source: 'practice', year: 2025, subject: 'Frontend', topic: 'React', difficulty: 'medium', marks: 1, question: 'In React, the cleanup function returned from useEffect runs:', options: ['Never in production', 'Before the next effect run and on unmount', 'Only on unmount', 'After the first paint only'], answer: 1, explanation: 'Cleanup runs before each re-execution of the effect and when the component unmounts.' },
  { id: 'web-css-fr', course: 'web-dev', source: 'practice', year: 2025, subject: 'Frontend', topic: 'CSS', difficulty: 'easy', marks: 1, question: "In CSS Grid, the 'fr' unit represents:", options: ['A fixed pixel size', 'A fraction of free space', 'A font-relative length', 'A frame rate'], answer: 1, explanation: 'fr divides leftover space proportionally after fixed tracks are laid out.' },
  { id: 'web-node-microtask', course: 'web-dev', source: 'practice', year: 2025, subject: 'Backend', topic: 'Node.js', difficulty: 'medium', marks: 1, question: 'In Node.js, resolved promise callbacks (microtasks) run:', options: ['After all macrotasks complete', 'Before the event loop continues to the next macrotask', 'Only on process exit', 'In a worker thread'], answer: 1, explanation: 'The microtask queue drains between macrotasks, so promises resolve before the next timer or I/O callback.' },
  { id: 'web-jwt-claim', course: 'web-dev', source: 'practice', year: 2025, subject: 'Backend', topic: 'Auth', difficulty: 'medium', marks: 1, question: "A signed JWT's payload is:", options: ['Encrypted by default', 'Readable but tamper-evident via the signature', 'Stored server-side', 'Compressed and unreadable'], answer: 1, explanation: 'JWT payloads are base64url-encoded (readable); the signature detects tampering. Use JWE for secrecy.' },
  { id: 'web-rest-201', course: 'web-dev', source: 'practice', year: 2025, subject: 'Backend', topic: 'REST & HTTP', difficulty: 'easy', marks: 1, question: "The correct status for 'resource created' after POST is:", options: ['200', '201', '204', '302'], answer: 1, explanation: '201 Created confirms creation and conventionally includes a Location header.' },
  { id: 'web-sql-leftjoin', course: 'web-dev', source: 'practice', year: 2025, subject: 'Backend', topic: 'Databases', difficulty: 'medium', marks: 1, question: 'LEFT JOIN returns:', options: ['Only matching rows', 'All left rows plus matches (NULLs when none)', 'Only non-matching rows', 'A Cartesian product'], answer: 1, explanation: 'LEFT JOIN preserves every left row, filling NULLs where no right match exists.' },
  { id: 'web-git-rebase', course: 'web-dev', source: 'practice', year: 2025, subject: 'Tooling', topic: 'Git', difficulty: 'medium', marks: 1, question: 'Rebasing a feature branch onto main primarily:', options: ['Merges with a merge commit', 'Replays commits onto the new base for linear history', 'Deletes the branch', 'Squashes all remote history'], answer: 1, explanation: 'Rebase rewrites branch commits on top of the target, keeping history linear.' },
  { id: 'web-docker-cache', course: 'web-dev', source: 'practice', year: 2025, subject: 'DevOps', topic: 'Docker', difficulty: 'easy', marks: 1, question: 'Docker layer caching means:', options: ['Every build starts from scratch', 'Unchanged early layers are reused, speeding rebuilds', 'Images cannot share layers', 'Cache only works with --no-cache'], answer: 1, explanation: 'Each Dockerfile instruction is a layer; unchanged layers are reused until the first changed one.' },

  // --------------------------------------------------------------- AI / ML
  { id: 'ai-ml-overfit', course: 'ai-ml', source: 'practice', year: 2025, subject: 'Machine Learning', topic: 'Generalization', difficulty: 'medium', marks: 1, question: 'Which observation most strongly suggests overfitting?', options: ['Training and validation loss are both high', 'Training loss is low while validation loss remains high', 'Both losses decrease together', 'The dataset has labels'], answer: 1, explanation: 'A large train-validation gap indicates memorization without generalization.' },
  { id: 'ai-ml-recall', course: 'ai-ml', source: 'practice', year: 2025, subject: 'Machine Learning', topic: 'Evaluation', difficulty: 'medium', marks: 1, question: 'When false negatives are especially costly, which metric deserves particular attention?', options: ['Recall', 'Training accuracy only', 'Mean squared error', 'Parameter count'], answer: 0, explanation: 'Recall measures the fraction of actual positives that the model catches.' },
  { id: 'ai-ml-rag', course: 'ai-ml', source: 'practice', year: 2025, subject: 'Generative AI', topic: 'RAG Systems', difficulty: 'medium', marks: 1, question: 'What is the main purpose of retrieval in a RAG system?', options: ['Replace the language model', 'Supply relevant external context to generation', 'Guarantee every answer is true', 'Remove the need for evaluation'], answer: 1, explanation: 'Retrieval supplies relevant evidence that the generator can use and cite.' },
  { id: 'ai-ml-bias-variance', course: 'ai-ml', source: 'practice', year: 2025, subject: 'Machine Learning', topic: 'Generalization', difficulty: 'medium', marks: 1, question: 'High training error AND high validation error indicates:', options: ['Overfitting', 'Underfitting / high bias', 'Perfect fit', 'Label leakage'], answer: 1, explanation: 'The model cannot even fit training data, so capacity or features — not regularization — are the problem.' },
  { id: 'ai-ml-lr', course: 'ai-ml', source: 'practice', year: 2025, subject: 'Deep Learning', topic: 'Optimization', difficulty: 'easy', marks: 1, question: 'A learning rate that is far too large typically causes training loss to:', options: ['Decrease smoothly', 'Diverge or oscillate', 'Stay exactly constant', 'Converge faster always'], answer: 1, explanation: 'Oversized steps overshoot minima; loss explodes or bounces instead of descending.' },
  { id: 'ai-ml-attention', course: 'ai-ml', source: 'practice', year: 2025, subject: 'Deep Learning', topic: 'Transformers', difficulty: 'medium', marks: 1, question: 'Standard self-attention scales with sequence length n as:', options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'], answer: 1, explanation: 'Every token attends to every other token, forming an n×n attention matrix.' },
  { id: 'ai-ml-loss', course: 'ai-ml', source: 'practice', year: 2025, subject: 'Machine Learning', topic: 'Training', difficulty: 'easy', marks: 1, question: 'The standard loss for multi-class classification with softmax outputs is:', options: ['Mean squared error', 'Cross-entropy', 'Hinge loss only', 'Mean absolute error'], answer: 1, explanation: 'Cross-entropy with softmax maximizes the log-likelihood of the correct class.' },
  { id: 'ai-ml-cosine', course: 'ai-ml', source: 'practice', year: 2025, subject: 'Generative AI', topic: 'Embeddings', difficulty: 'easy', marks: 1, question: 'Cosine similarity between embeddings measures:', options: ['Euclidean distance', 'Angular closeness regardless of magnitude', 'Token count overlap', 'Model size'], answer: 1, explanation: 'Cosine compares vector direction, making it robust to embedding magnitude differences.' },
  { id: 'ai-ml-chunking', course: 'ai-ml', source: 'practice', year: 2025, subject: 'Generative AI', topic: 'Chunking & Retrieval', difficulty: 'medium', marks: 1, question: 'In RAG, chunking documents too coarsely risks:', options: ['Slower embedding only', 'Retrieving irrelevant context that dilutes the answer', 'Perfect recall', 'Zero retrieval latency'], answer: 1, explanation: 'Oversized chunks mix topics, so retrieved context carries noise the generator must sift through.' },
  { id: 'ai-ml-lora', course: 'ai-ml', source: 'practice', year: 2025, subject: 'Generative AI', topic: 'Fine-tuning', difficulty: 'medium', marks: 1, question: 'LoRA fine-tuning works by:', options: ['Updating every weight fully', 'Training small low-rank adapter matrices', 'Freezing the model and only tuning prompts', 'Quantizing to 1 bit'], answer: 1, explanation: 'LoRA freezes base weights and learns low-rank updates — cheap to train, store, and swap.' },
  { id: 'ai-ml-leakage', course: 'ai-ml', source: 'practice', year: 2025, subject: 'Machine Learning', topic: 'Evaluation', difficulty: 'medium', marks: 1, question: 'Evaluating on data that was also used for training causes:', options: ['Underfitting', 'Overly optimistic metrics (leakage)', 'Slower inference', 'Larger models'], answer: 1, explanation: 'Train-test contamination leaks answers into evaluation, inflating scores that will not transfer.' },
];

export type BankFilter = {
  course?: string;
  source?: string;
  subject?: string;
  topic?: string;
  year?: string;
  difficulty?: string;
};

const ALL = 'all';

export function filterQuestions(filter: BankFilter = {}): Question[] {
  const course = filter.course || 'gate-cs';
  const source = filter.source || (course === 'gate-cs' ? 'gate-pyq' : 'practice');
  const subject = filter.subject || ALL;
  const topic = filter.topic || ALL;
  const year = filter.year || ALL;
  const difficulty = filter.difficulty || ALL;
  return QUESTION_BANK.filter(
    (item) =>
      item.course === course &&
      (source === ALL || item.source === source) &&
      (subject === ALL || item.subject === subject) &&
      (topic === ALL || item.topic === topic) &&
      (year === ALL || String(item.year) === year) &&
      (difficulty === ALL || item.difficulty === difficulty),
  );
}

export function bankFilters(course: string): { subjects: string[]; topics: string[]; years: number[]; difficulties: string[] } {
  const scoped = QUESTION_BANK.filter((item) => item.course === course);
  return {
    subjects: [...new Set(scoped.map((item) => item.subject))].sort(),
    topics: [...new Set(scoped.map((item) => item.topic))].sort(),
    years: [...new Set(scoped.map((item) => item.year))].sort((a, b) => b - a),
    difficulties: ['easy', 'medium', 'hard'],
  };
}

export function questionById(id: string): Question | undefined {
  return QUESTION_BANK.find((item) => item.id === id);
}

export function difficultyOf(id: string): Question['difficulty'] {
  return questionById(id)?.difficulty || 'medium';
}

export function marksOf(id: string): number {
  return questionById(id)?.marks || 1;
}

/** Strip answers + explanations for pre-attempt delivery (diagnostics, mocks). */
export function stripAnswers(questions: Question[]): Array<Omit<Question, 'answer' | 'explanation'>> {
  return questions.map(({ answer: _a, explanation: _e, ...rest }) => rest);
}

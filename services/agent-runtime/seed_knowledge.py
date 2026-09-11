"""Seed the Qdrant knowledge base with curriculum-grounded concept briefs.

Run from this directory (Qdrant must be reachable; no LLM key required):

    python seed_knowledge.py

Each brief is tagged with exact EduSwarm curriculum topic ids so retrieval
filters hit for real syllabus topics. Seeding is idempotent-safe (re-running
adds new chunk versions; the collection can be dropped and rebuilt anytime).
"""
from __future__ import annotations

import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))) if False else ".")

from app.rag import OpenRouterRag  # noqa: E402


def slug(value: str) -> str:
    return re.sub(r"^-|-$", "", re.sub(r"[^a-z0-9]+", "-", value.lower()))


LEGACY = {"Time and Space Complexity": "algo-complexity", "Searching and Sorting": "algo-sorting", "Graph Algorithms": "algo-graphs"}


def topic_id(module: str, title: str) -> str:
    if title in LEGACY:
        return LEGACY[title]
    return f"gate-cs-{slug(module)}-{slug(title)}"


# (module, title, source title, url, text)
BRIEFS: list[tuple[str, str, str, str, str]] = [
    ("Algorithms", "Time and Space Complexity",
     "MIT OpenCourseWare: Introduction to Algorithms", "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/",
     "Asymptotic notation describes growth as input size increases. Big-O is an upper bound, Omega a lower bound, and Theta a tight bound. "
     "Binary search halves a sorted interval each step, giving Theta(log n) time. Recurrences like T(n) = 2T(n/2) + n solve to Theta(n log n) via the Master theorem. "
     "Always state whether a bound is best, average, or worst case, and count extra space separately from input storage."),
    ("Algorithms", "Searching and Sorting",
     "NPTEL: Design and Analysis of Algorithms", "https://nptel.ac.in/courses/106/106/106106131/",
     "Linear search is O(n); binary search needs sorted input and costs O(log n). Comparison sorts need Omega(n log n) comparisons in the worst case. "
     "Merge sort is stable with guaranteed O(n log n) time and O(n) extra space. Quick sort averages O(n log n) but degrades to O(n^2) on bad pivots. "
     "Counting sort beats the bound for small integer ranges by avoiding comparisons entirely."),
    ("Algorithms", "Dynamic Programming",
     "MIT OpenCourseWare: Introduction to Algorithms", "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/",
     "Dynamic programming solves overlapping subproblems once each. Define the state, write the recurrence with base cases, then choose memoization or tabulation. "
     "The 0/1 knapsack recurrence considers including or skipping each item, running in O(nW) pseudo-polynomial time. Edit distance aligns prefixes with insert, delete, and replace costs. "
     "Verify optimal substructure before applying DP; greedy choice fails where local optima mislead, as in 0/1 knapsack."),
    ("Algorithms", "Graph Algorithms",
     "cp-algorithms: Graph traversal", "https://cp-algorithms.com/graph/breadth-first-search.html",
     "Breadth-first search explores unweighted graphs in increasing distance, yielding shortest paths from the source. Depth-first search classifies edges and finds cycles, topological orders, and connected components. "
     "Dijkstra handles non-negative weights with a priority queue; Bellman-Ford tolerates negative weights and detects negative cycles. "
     "Kruskal sorts edges and unions components for MSTs in O(E log E); union-find with path compression is nearly constant per operation."),
    ("Operating Systems", "CPU Scheduling",
     "NPTEL: Operating Systems", "https://nptel.ac.in/courses/106/105/106105214/",
     "FCFS is simple but suffers convoy effects. Shortest Job First minimizes average waiting time yet risks starvation. Round Robin gives each ready process a fixed quantum in cyclic order, bounding response time. "
     "Priority scheduling orders by importance and needs aging against starvation. Multilevel feedback queues adapt priority from observed behavior."),
    ("Operating Systems", "Synchronization and Deadlocks",
     "NPTEL: Operating Systems", "https://nptel.ac.in/courses/106/105/106105214/",
     "Peterson's algorithm gives two processes mutual exclusion, progress, and bounded waiting using only shared memory. Semaphores generalize locks with wait and signal operations. "
     "Deadlock needs all four Coffman conditions: mutual exclusion, hold-and-wait, no preemption, and circular wait. Breaking any one prevents deadlock; the Banker's algorithm avoids unsafe allocations when maximum needs are known."),
    ("Operating Systems", "Memory Management",
     "NPTEL: Operating Systems", "https://nptel.ac.in/courses/106/105/106105214/",
     "Paging divides memory into fixed frames and processes into pages, eliminating external fragmentation. The TLB caches translations; effective access time blends hit and miss costs. "
     "FIFO replacement can show Belady's anomaly where more frames increase faults, while LRU approximates optimal stack behavior. Thrashing means excessive paging; fixing it requires covering each process's working set with enough frames."),
    ("Database Management Systems", "Functional Dependencies and Normalization",
     "NPTEL: Database Management Systems", "https://nptel.ac.in/courses/106/105/106105175/",
     "BCNF requires every determinant of a non-trivial dependency to be a superkey. Third normal form additionally allows prime attributes on the right side. "
     "Compute attribute closures to find candidate keys, then decompose to remove redundancy while preserving dependencies where possible. Lossless-join decomposition guarantees the natural join of projections reconstructs the original relation."),
    ("Database Management Systems", "Transactions and Concurrency",
     "NPTEL: Database Management Systems", "https://nptel.ac.in/courses/106/105/106105175/",
     "ACID means atomicity, consistency, isolation, and durability. A schedule is conflict-serializable exactly when its precedence graph is acyclic. "
     "Strict two-phase locking holds exclusive locks until commit, guaranteeing serializable and recoverable schedules but permitting deadlock. Timestamp ordering and optimistic validation are deadlock-free alternatives with their own restart costs."),
    ("Computer Networks", "IP Addressing and Routing",
     "NPTEL: Computer Networks", "https://nptel.ac.in/courses/106/105/106105183/",
     "A /26 IPv4 subnet has 6 host bits: 64 addresses minus network and broadcast leaves 62 usable hosts. Distance-vector protocols exchange distance estimates and apply Bellman-Ford updates, converging slowly and risking count-to-infinity. "
     "Link-state protocols flood topology and run Dijkstra locally for fast convergence. Longest-prefix match selects among overlapping routes."),
    ("Computer Networks", "Transport Layer",
     "NPTEL: Computer Networks", "https://nptel.ac.in/courses/106/105/106105183/",
     "TCP opens connections with SYN, SYN-ACK, ACK and closes gracefully with FIN exchanges. Sliding windows bound unacknowledged bytes, coupling throughput to the advertised window and congestion window. "
     "Slow start grows exponentially until loss, then congestion avoidance grows linearly; fast retransmit recovers on triple duplicate ACKs. UDP skips reliability for low latency, suiting DNS and real-time media."),
    ("Theory of Computation", "Regular Languages and Finite Automata",
     "MIT OpenCourseWare: Theory of Computation", "https://ocw.mit.edu/courses/18-404j-theory-of-computation-fall-2020/",
     "DFAs, NFAs, and regular expressions describe exactly the regular languages, which are closed under union, intersection, complement, and concatenation. "
     "The pumping lemma states long regular strings contain a pumpable middle section; violating it proves non-regularity, as with a^n b^n. Minimize DFAs by merging indistinguishable states."),
    ("Theory of Computation", "Turing Machines and Decidability",
     "MIT OpenCourseWare: Theory of Computation", "https://ocw.mit.edu/courses/18-404j-theory-of-computation-fall-2020/",
     "The halting problem is semi-decidable but undecidable: a simulator recognizes halting instances, yet no decider exists for all inputs. Reductions transfer undecidability by transforming instances computably. "
     "SAT was the first NP-complete problem via the Cook-Levin theorem; thousands of problems reduce from it. Rice's theorem says every nontrivial semantic property of programs is undecidable."),
    ("Computer Organization and Architecture", "Memory Hierarchy and Cache",
     "NPTEL: Computer Organization and Architecture", "https://nptel.ac.in/courses/106/103/106103184/",
     "Caches exploit temporal and spatial locality. Direct-mapped caches fix each block to one line via index bits; set-associative designs trade hit rate against lookup cost. "
     "Average access time equals hit time plus miss rate times miss penalty. Write-through updates memory immediately while write-back buffers dirty lines for eviction."),
    ("Computer Organization and Architecture", "Pipelining and Performance",
     "NPTEL: Computer Organization and Architecture", "https://nptel.ac.in/courses/106/103/106103184/",
     "An ideal N-stage pipeline approaches one instruction per cycle at steady state. Data hazards need forwarding or stalls; control hazards need branch prediction or delayed branches. "
     "Speedup is bounded by the serial fraction via Amdahl's law. IEEE 754 single precision uses a bias of 127 for its 8-bit exponent."),
    ("Digital Logic", "Boolean Algebra and Logic Gates",
     "NPTEL: Digital Circuits", "https://nptel.ac.in/courses/117/106/117106086/",
     "Karnaugh maps minimize sum-of-products by grouping adjacent ones in powers of two. A 2^n-to-1 multiplexer needs n select lines. Eight-bit two's complement spans -128 to +127. "
     "T flip-flops with T=1 toggle every clock, dividing frequency by two; D flip-flops capture input for registers and pipelines."),
    ("Compiler Design", "Parsing and Grammars",
     "NPTEL: Compiler Design", "https://nptel.ac.in/courses/106/104/106104072/",
     "LL(1) parsers work top-down with one lookahead token using FIRST and FOLLOW sets. Bottom-up power grows from SLR to LALR to canonical LR(1), which handles the most grammars. "
     "Maximal munch lexing matches the longest valid token. S-attributed definitions use synthesized attributes only and evaluate naturally during bottom-up parsing."),
    ("Programming and Data Structures", "Trees and Heaps",
     "MIT OpenCourseWare: Introduction to Algorithms", "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/",
     "Inorder traversal of a binary search tree yields sorted order. Bottom-up heap construction costs O(n) since most nodes sit near the leaves. "
     "AVL trees rebalance with rotations to keep height logarithmic. Heaps back priority queues with O(log n) insert and extract operations."),
    ("Programming and Data Structures", "Hashing",
     "MIT OpenCourseWare: Introduction to Algorithms", "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/",
     "Hash tables trade memory for expected O(1) lookup via maps, sets, and frequency tables. Separate chaining links collisions; open addressing probes for slots. "
     "Load factor governs performance: resize to keep chains short. Two-sum becomes linear by looking up each complement before inserting the current value."),
    ("Engineering Mathematics", "Probability and Statistics",
     "NPTEL: Probability and Statistics", "https://nptel.ac.in/courses/111/105/111105090/",
     "Bayes' theorem inverts conditionals: P(A|B) = P(B|A)P(A)/P(B). Two dice sum to 9 with probability 4/36 = 1/9. Expectation is linear even for dependent variables. "
     "Bayes-optimal classifiers threshold posterior odds; maximum likelihood fits parameters without priors while MAP estimation adds them."),
    ("Engineering Mathematics", "Graph Theory",
     "NPTEL: Graph Theory", "https://nptel.ac.in/courses/111/106/111106102/",
     "A connected undirected graph has an Eulerian trail exactly when zero or two vertices have odd degree. Trees on n vertices have exactly n-1 edges and no cycles. "
     "Bipartite graphs contain no odd cycles and are two-colorable. Handshaking lemma: the sum of degrees equals twice the edge count."),
]


def main() -> int:
    rag = OpenRouterRag()
    total = 0
    for index, (module, title, source_title, url, text) in enumerate(BRIEFS):
        tid = topic_id(module, title)
        source_id = f"seed-{slug(title)}"
        chunks = rag.ingest(source_id=source_id, title=f"{source_title} — {title}", url=url, text=text, topic_ids=[tid])
        total += chunks
        print(f"[{index + 1}/{len(BRIEFS)}] {title} -> {tid} ({chunks} chunks)")
    print(f"Seeded {total} chunks across {len(BRIEFS)} topics into '{os.getenv('QDRANT_COLLECTION', 'eduswarm_knowledge')}'.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

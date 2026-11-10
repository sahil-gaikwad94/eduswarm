import type { TopicLesson } from "../topicLessons.js";

/**
 * Operating Systems — 6 authored topic lessons.
 *
 * Standalone chapters per topic. Subject-first prose, foundations, core
 * concepts, worked examples, exam practice, cheat sheet, recap. No shared
 * templates, no runtime composition.
 */
export const operatingSystems: Record<string, TopicLesson> = {
  "gate-cs-operating-systems-processes-and-threads": {
    intro: `Processes and threads are the fundamental units of execution the operating system schedules — a process is a program in execution with its own address space, while a thread is an execution flow inside it sharing the same address space. The subject is the mechanics: process states, context switching, threads vs processes, IPC, and coordination primitives; every OS conversation — kernel, scheduling, memory — reduces back here.`,
    foundations: `A process: program code + data + heap + stack + PCB (process control block — PID, state, PC, registers, memory management info, open files). States: new → ready → running → waiting → terminated (five-state model); schedulers: long-term (admission), short-term/CPU (who runs next), medium-term (swapping). Thread: shares code, data, heap; own stack, registers, PC; kernel-level vs user-level threads; multithreading models: many-to-one, one-to-one, many-to-many. IPC: pipes, FIFOs, message queues, shared memory + semaphores, sockets; synchronization via mutexes/semaphores/monitors. Context switch: save state, restore state — pure overhead; cost ~1-10 μs.`,
    concepts: [
      {
        title: "Process states and the PCB.",
        body: `Five states: new (created, not yet admitted), ready (in memory, waiting for CPU), running (on a CPU), waiting/blocked (waiting for I/O or event), terminated (done, awaiting cleanup). PCB stores everything needed to resume: PC, saved registers, memory maps, open file descriptor table, accounting (CPU time used), scheduling info (priority, nice). The OS manipulates PCBs exclusively — userland never touches them; switching = save PCB of current, load PCB of next; that\'s the entire context switch; interrupt storm = PCB thrash = death by overhead — why interrupt coalescing and polling modes exist.`,
      },
      {
        title: "Threads: sharing within one house.",
        body: `Threads share the address space: globals, heap — one process = one address space; each thread has private stack, registers, PC — creating a thread allocates a stack and a PCB-lite (TCB); switching threads is far cheaper than switching processes (same page tables, same TLB entries); user-level threads: library-managed, kernel unaware — one blocks = all block (until scheduler activations), one-to-one (Linux pthreads = clone) — kernel schedules each thread, blocking isolated; shared memory communication is implicit — no IPC needed for thread-thread within a process; synchronization burden shifts: mutexes everywhere, or subtle races.`,
      },
      {
        title: "Context switching: the hidden overhead.",
        body: `Direct costs: save/restore registers and PC (~ hundreds of cycles), PCB manipulations, scheduler invocation; indirect: TLB flush (unless PCID/ASID tags), cache pollution — the working set of the new process displaces the old; total ~1-10 μs; thousands per second per core is normal; millions is catastrophic (thrashing by switching). Mitigations: PCID tags (x86), huge pages, scheduler pinning, kernel bypass. The exam asks for what is saved (all callee/caller-saved registers, PC, stack pointer), why threads are cheaper (shared address space = no flush), and how context switch differs from mode switch (user↔kernel is not full register save by definition).`,
      },
      {
        title: "IPC mechanisms and when to use which.",
        body: `Pipe: unidirectional byte stream, related processes only (parent-child); FIFO/named pipe: unrelated processes, filesystem path; message queues: structured messages, priority, async, kernel-buffered — great for decoupling; shared memory: fastest (zero-copy post setup), needs explicit synchronization — semaphores or atomics; sockets: network-transparent, works across machines — the universal answer; signals: async notification, minimal payload, sample rate limited. Selection: latency-critical local → shared memory + futex; decoupled services → queues; anything network → sockets; legacy Unix plumbing → pipes. GATE asks mechanisms and properties, not tuning.`,
      },
      {
        title: "Process creation: fork, exec, clone.",
        body: `Unix: fork() — creates exact copy (copy-on-write address space — pages shared until written); exec() — replace image with new program (fork+exec = spawn); wait() — parent blocks until child exits; zombie if parent never waits (PCB persists — cleanup needed); orphan if parent dies first — reparented to init (PID 1 reaps them). Windows: CreateProcess single call. clone() (Linux) — the universal spawn behind threads/processes — flags control what is shared (CLONE_VM = threads, share FS, files, signal handlers). The family semantics matter for shells, daemons, and every subprocess spawn you will ever debug.`,
      },
    ],
    worked: [
      {
        title:
          "Count processes after fork bomb line: fork(); fork(); fork(); with parent continuing.",
        body: `Initial 1; after fork1: 2; after fork2: 4; after fork3: 8 processes — each doubles. If the code were if(fork()>0) fork(); the tree shape differs — classic GATE counting problem; solve by drawing the tree level by level; the answer for three unconditional forks is 8.`,
      },
      {
        title:
          "Two threads share a global counter; give exact interleavings that lose updates.",
        body: `counter++ compiles to: load counter, add 1, store. Both threads: T1 load c=5; T2 load c=5; T1 add → store 6; T2 add → store 6 — one increment lost; need mutex or atomic (compare-and-swap) around the read-add-write; x86 LOCK-prefixed instructions make single ops atomic; the bug is the non-atomic three-step sequence; this is why shared mutable state is the original sin of concurrent programming — and why the answer to every concurrency interview question starts with "first, protect the critical section."`,
      },
      {
        title: "Context-switch cost measurement on a real system.",
        body: `Run a ping-pong over pipes between two processes with tight loop; measure wall time/iterations vs a plain loop — delta ≈ 2× context switch + pipe overhead; Linux perf stat -e context-switches shows the counter; typical ~1-3 μs on modern x86; the exercise is the standard way to build intuition that context switches are not free — they are the tax your CPU pays for multitasking, and they grow linearly with runnable thread count.`,
      },
      {
        title: "Explain PCB contents and why OS needs them per process.",
        body: `PID, state, PC, stack pointer, register file (all GP registers), memory maps (page table base), open file descriptor list, signal masks, scheduling params, accounting, parent/children links; without PCB state, a preempted process could never resume exactly where it stopped; the OS scheduler reads PCBs, never user memory — the kernel keeps everything it needs in kernel-allocated structures, untouchable by the process itself — isolation by design, not by politeness.`,
      },
    ],
    exam: [
      {
        question: "What is the difference between a process and a thread?",
        answer:
          "Process has independent address space, own page tables, own resources; thread shares its process's address space and resources — code, heap, fds, signals — but has its own stack/registers/PC — context switch within process avoids TLB flush — cheaper.",
      },
      {
        question: "What does fork() return in parent and child?",
        answer:
          "Parent gets child's PID (>0); child gets 0; on failure both get −1 — the same call returns twice with different values; the child is a near-exact copy with copy-on-write semantics; every spawn tree in Unix starts here.",
      },
      {
        question: "What is a zombie process?",
        answer:
          "A terminated child whose parent has not yet called wait()/waitpid(); the PCB lingers so the parent can collect the exit status; resources mostly freed (memory unmapped), but the PID entry stays; persistent zombies can exhaust the PID space — fix by reaping children (or SIGCHLD handler ignoring them).",
      },
      {
        question: "Why are threads cheaper to switch than processes?",
        answer:
          "Same address space → same page tables → no TLB flush; shared caches of hot data; smaller state to save (no memory map, no fd table); the scheduler can ping threads at kHz rates; processes pay full memory context switch each time — microseconds apart, thousands of times a second.",
      },
    ],
    cheat: [
      "PCB: PID, state, PC, registers, memory map, fds, accounting — kernel-only.",
      "States: new, ready, running, waiting, terminated; schedulers: long/short/medium term.",
      "Threads share code/heap/fd/signals; own stack/registers/PC; cheaper switches.",
      "IPC: pipe (related), FIFO (unrelated), queues (decoupled), shared mem (fast), sockets (network).",
      "fork+exec; zombies await wait(); orphans reparented to init.",
      "Context switch ≈ 1-10 μs; TLB flush is the hidden cost.",
    ],
    recap: `Processes and threads are the atoms the scheduler juggles: processes carry private universes, threads share one, context switching is the tax the OS pays for it, and IPC is the bridge whenever the universes must talk — master the state machine, the PCB, and the fork/thread semantics, and every OS question reduces to "what is being shared and what is being switched."`,
    code: {
      title: "fork-exec spawn skeleton",
      language: "c",
      code: `pid_t p = fork();\nif (p == 0) { execlp("ls", "ls", "-l", NULL); exit(127); }\nwaitpid(p, &st, 0);`,
      explanation:
        "The universal spawn: copy, replace image in child, wait in parent — the heart of every shell.",
    },
    diagram: {
      title: "Process state machine",
      caption:
        "Five states; the OS scheduler only ever chooses among ready processes on CPUs.",
      mermaid: `flowchart LR\n  N[New] --> R[Ready]\n  R --> X[Running]\n  X --> W[Waiting]\n  W --> R\n  X --> T[Terminated]`,
    },
  },
  "gate-cs-operating-systems-system-calls-and-kernel-interfaces": {
    intro: `System calls and the kernel interface are the narrow, guarded bridge between user code and the privileged kernel — every file read, network send, and process spawn crosses it. The subject is the mechanism of the crossing: user vs kernel mode, trap/interrupt handling, the syscall dispatch table, and the performance realities of crossing the boundary thousands of times per second.`,
    foundations: `Hardware privilege rings (x86 ring 0 kernel, ring 3 user); user code cannot touch devices, page tables, or interrupts directly; request via syscall instruction (modern) or interrupt gates (historical int 0x80); kernel executes, returns to userland; libraries wrap syscalls in libc (open, read, write, fork, exec, socket, mmap); kernel API surface (POSIX) is the portability contract — Linux, macOS, BSDs all speak it. Mode switch ≠ full context switch — no PCB swap needed on syscall return to same process; it\'s a privilege transition + register save of user state. Fast paths: vDSO (kernel exports some functions to user memory — gettimeofday without trapping); io_uring (batched async I/O submission, no per-op syscalls); eBPF (kernel-programmable hooks).`,
    concepts: [
      {
        title: "User mode vs kernel mode and why both exist.",
        body: `Ring 0: full instruction set — I/O ports, page table manipulation, interrupt control; ring 3: restricted — page faults, no direct I/O, no halt; crash in userland kills a process, crash in kernel panics the machine; the separation is what lets millions of sloppy user programs coexist on one machine; every OS action a program might "want" — read file, allocate memory, get time, send packet — goes through the gate; the gate is small, audited, and enforced by hardware; the CPU checks privilege on every sensitive instruction, not on trust or cooperation.`,
      },
      {
        title: "The syscall path step by step.",
        body: `User pushes args (registers or stack per ABI), executes syscall (or int 0x80 legacy); CPU switches to kernel stack (TSS), saves minimal user state (PC, SP, flags) into kernel structure, jumps to syscall dispatch entry (MSR_LSTAR); dispatch reads syscall number from rax, indexes syscall table (Linux: sys_call_table), calls handler (sys_read etc.); handler validates args (copies pointers from user memory safely — copy_from_user/copy_to_user), performs operation, returns value in rax; kernel restores registers, osysexit/sysreturn (sysexit), back to userland with return value in rax — errno negated if negative → libc sets errno; failure paths return −1 with errno set. Security: never trust user pointers — always copy, always validate ranges, always check permissions per file/op.`,
      },
      {
        title: "Traps, interrupts, and faults — the exception trilogy.",
        body: `Faults: triggered by instruction execution condition (page fault, divide by zero, general protection fault) — may be fixed and restarted (page fault → load page → retry instruction — invisible to user); traps: synchronous software instruction — syscall/breakpoint — returns to following instruction usually; aborts: unrecoverable — machine check, triple fault — halt or reset; interrupts: asynchronous, external (timer, NIC, disk) — preempt current flow; all funnel into IDT (interrupt descriptor table) — the vector table every CPU exception and interrupt indexes; the same entry code handles them all — showing that kernel entry is one code path, specialized by vector number.`,
      },
      {
        title: "POSIX libc and the layering stack.",
        body: `Your code calls printf; printf formats into buffer; write(1, buf, len) — libc syscall wrapper — syscall instruction — kernel writes to fd; fd 1 = stdout (usually pipe/terminal); other common wrappers: open/close, read (returns bytes), lseek, stat/fstat (metadata), mmap (map file or anonymous memory), fork/clone, execve, waitpid, socket/connect/bind/accept/send/recv; the POSIX definition is what "Unix-like" means; Windows has NT API (ZwCreateFile) with Win32 subsystem on top — conceptually identical layering; the exam tests syscall names and semantics; production debuggers (strace) print them — learn to read strace output fluently.`,
      },
      {
        title: "Why syscalls are expensive and how to avoid them.",
        body: `Each syscall: ring transition (few hundred cycles), privilege checks, copies between user/kernel, scheduler interaction possible, cache pollution; hundreds of nanoseconds each; millions per second break budgets — mitigation: batch writes (stdio buffering — fwrite chunks 4KB), vDSO for time/clocks, mmap-read of files (no read syscalls), io_uring (submit many IOs, harvest many completions per syscall), sendfile/splice (zero-copy kernel-side), kernel bypass (DPDK — full ring-3 networking for extreme cases). The principle: syscall frequency is a design parameter, not a given — the hot path is engineered to amortize.`,
      },
    ],
    worked: [
      {
        title: "Count syscalls in ls -l by strace for a small directory.",
        body: `strace ls -l → execve, brk, mmap xN, access("/etc/ld.so.cache"), openat(libc), read config, getdents64, fstat each entry, write(...) output — typically 60–120 syscalls for a tiny listing; every filename stat is one syscall × N entries — showing why ls -l on huge directories is slower than ls; the exercise converts abstract numbers into observed reality.`,
      },
      {
        title: "Trace open() through kernel: from user call to fd.",
        body: `open("/etc/passwd", O_RDONLY) → syscall(231 or via libc) → sys_openat2 → path walk (dentry cache hit → no disk), permission check (inode mode vs uid), allocate file struct, find free fd in caller\'s fd table, install, return fd number; userland gets integer 3; kernel keeps file object with inode, offset=0, flags; subsequent read(3, buf, n) → sys_read → file->f_op->read → page cache lookup → copy to user buf → return byte count; the full path is 10 layers of abstraction — every layer enforceable, every layer instrumentable.`,
      },
      {
        title: "vDSO benchmark: gettimeofday in user vs syscall.",
        body: `Loop 10M times: gettimeofday via vDSO (~50 ns each) vs raw syscall (~500 ns each) — 10x difference; vDSO maps kernel timekeeping data pages into user memory — read directly, no trap; the Linux kernel exposes time, clock_gettime(CLOCK_MONOTONIC), getcpu through vDSO; without it, every language runtime pinging the clock would melt; vDSO is why Python\'s time.time() is cheap enough to call in a hot loop without guilt.`,
      },
      {
        title: "Check errno semantics after failing syscall.",
        body: `close(fd_invalid) → returns −1, errno=EBADF; open("/nonexistent") → −1, ENOENT; read on O_WRONLY fd → −1, EBADF; errno is thread-local in modern libc; zero it before the call if checking it — it\'s only meaningful when the call returned −1; the EBADF set is the most common real-world cause of "why is my write silently failing?" debugging.`,
      },
    ],
    exam: [
      {
        question: 'What does the "system call" instruction do on x86?',
        answer:
          "Switches from user to kernel context: saves user PC/SP/flags to (MSR_STAR-expanded) kernel stack, jumps to MSR_LSTAR entry — ring transition with minimal bookkeeping; contrast with interrupts/faults — same mechanism class, different source/trigger.",
      },
      {
        question:
          "Why does the kernel copy user pointers before dereferencing them?",
        answer:
          "User memory is untrusted — may change between validation and use (TOCTOU), may point outside the address space (fault), may overlap kernel memory — kernel copies into kernel buffer first, validates, then operates — every copy_from_user does this; direct dereference is a security bug.",
      },
      {
        question: "What is vDSO and why does it exist?",
        answer:
          "Virtual dynamic shared object — kernel maps read-only pages and exported functions (clock_gettime, gettimeofday, getcpu) into every process address space — userland calls them without ring transition — ~10x faster than the syscall path for the hottest clocks.",
      },
      {
        question: "Which returns user-space from a syscall: sysret or iret?",
        answer:
          "sysret (sysexit on Intel P6+ / AMD) for syscall path — faster, less state restore; iret (the heavyweight interrupt return) for interrupts and faults — the kernel chooses based on how it was entered; both restore user mode correctly; the exam asks to distinguish the two instructions.",
      },
    ],
    cheat: [
      "Ring 0 kernel, ring 3 user; hardware checks privilege per instruction.",
      "syscall → MSR_LSTAR → table lookup → handler → sysret; args in registers.",
      "Copy-from-user always; validate everything; errno on −1.",
      "vDSO for clocks/cpu; io_uring batches I/O; sendfile zero-copies.",
      "Faults restartable; traps synchronous; interrupts async — all via IDT.",
      "strace shows everything — the first tool, every time.",
    ],
    recap: `The kernel interface is the thinnest wide door in computing: privilege rings, a syscall instruction, a dispatch table, careful copies — everything a process can legally ask the machine to do, and nothing more; understand the crossing and you understand both the power and the limits of every user program ever written.`,
    code: {
      title: "Minimal syscall in inline assembly (concept)",
      language: "c",
      code: `long n = 1; /* write */\nregister long r10 asm("r10") = 1; /* fd */\nregister long r8  asm("r8")  = (long)buf;\nregister long r9 asm("r9")  = count;\n__asm__ volatile("syscall" :: "a"(n), "D"(r10), "S"(r8), "d"(r9) : "rcx", "r11", "memory");`,
      explanation:
        "The raw instruction beneath every libc wrapper — after this, strace output reads like a story you can follow line by line.",
    },
    diagram: {
      title: "Path of a read() call",
      caption:
        "libc wrapper → syscall → dispatch → handler → back — 10 layers in microseconds.",
      mermaid: `flowchart LR\n  U[User code] --> L[libc]\n  L --> S[syscall instruction]\n  S --> D[Dispatch table]\n  D --> H[sys_read handler]\n  H --> U2[Return]`,
    },
  },
  "gate-cs-operating-systems-cpu-scheduling": {
    intro: `CPU scheduling is the art of choosing which ready process gets the next slice of a contested machine — simple rules with deep consequences for latency, throughput, and fairness. The subject covers the canonical algorithms (FCFS, SJF/SRTF, priority, round robin), turnaround, waiting and response time math, preemption, and the realities of modern multi-core schedulers.`,
    foundations: `Metrics: turnaround time (TAT = completion − arrival), waiting time (WT = TAT − burst), response time (first-run − arrival), throughput; averages across a workload define quality. FCFS: arrival order, convoy effect (short job behind long), non-preemptive — terrible averages. SJF: shortest job first, optimal average WT (non-preemptive), starvation for long jobs. SRTF: preemptive SJF — switches when new shorter job arrives — optimal but needs burst knowledge. Priority: starvation risk; aging fixes (priority increases with waiting time). Round robin: fixed time quantum; quantum too small → overhead, too big → convoy effect returns; typical 10–100 ms. Multilevel feedback queue (MLFQ): heuristics/realms: interactive jobs get short quanta, batch get long; decays priority with CPU use — the actual algorithm general-purpose OSes approximate. Multi-core: per-CPU run queues, load balancing, NUMA awareness; fairness vs locality trade.`,
    concepts: [
      {
        title: "FCFS and the convoy effect.",
        body: `First come, first served: execute in arrival order, run to completion; simple, fair-in-arrival, terrible in practice: P1 burst 24, P2 3, P3 3; average WT = (0 + 24 + 27)/3 = 17; reversed order (short first) would give (0+3+6)/3 = 3 — 5.7x better; one long batch job ahead of many interactive jobs — everyone waits; FCFS survives only in trivial/embedded contexts; the lesson: non-preemptive scheduling without size awareness is a self-inflicted convoy machine; the exam asks you to compute the average WT and feel the pain.`,
      },
      {
        title: "SJF and SRTF: optimality and its price.",
        body: `SJF (non-preemptive): pick smallest burst next — minimizes average waiting time among non-preemptive algorithms (provable); requires knowing burst times — unknown in practice; approximate via exponential averaging of recent bursts (τ_{n+1} = α t_n + (1−α)τ_n, α≈1/2). SRTF (preemptive SJF): when new job arrives with burst < remaining of current, preempt — globally optimal average WT (even compared to non-preemptive optimal); starvation for long jobs; aging (add waiting time to effective priority) prevents permanent starvation. The exam math: given burst table, draw Gantt chart, compute averages — mechanical, frequent.`,
      },
      {
        title: "Priority scheduling and aging.",
        body: `Assign priority; run highest priority (lowest number conventionally, or highest — exam states); preemptive or not; starvation risk: low-priority jobs never run if high-priority stream never ends — aging: priority increases with wait time (e.g., +1 per X seconds skipped/aging unit) → eventually every job reaches the top; example: Windows MLFQ, Linux CFS (fair-share — pick task with least virtual runtime). GATE often asks: given priorities + preemption rule, trace execution, compute average WT; remember: equal priorities → FCFS tie-break; round robin within same priority when combined.`,
      },
      {
        title: "Round robin and the quantum tradeoff.",
        body: `Each runnable process gets one quantum (e.g., 50 ms) per cycle; if unfinished, back to queue; fairness = time slicing, no starvation (everyone runs each round); quantum sizing: << context-switch cost → thrash; >> individual bursts → degenerates to FCFS; optimal ≈ 80% of bursts complete within one quantum; modern CFS/EEVDF pick dynamic, weighted fair-share slices per task (not fixed quantum) — latency-tuned by scheduler weight; response time = time to first quantum — what interactive users feel; throughput = total bursts completed per second — what batch users feel; the two targets pull the quantum in opposite directions.`,
      },
      {
        title: "Multi-core scheduling and practical reality.",
        body: `Multiple CPUs/cores: per-core run queues + load balancing (work stealing, periodic rebalance, wake on idle); cache affinity: keep task on same core to preserve hot caches; NUMA: keep process near its memory node; SMT/hyperthreading: siblings share front-end — heavy FPU tasks may halve throughput each; realtime classes (SCHED_FIFO/RR in Linux, EDF) — unbounded priority inversion nightmares mitigated by priority inheritance; interactive boosting; fair-share domains (cgroup cpu shares in Linux/containers — your container is the tenant, the scheduler is the landlord); preemption points: timer tick typically 1–10 ms / CONFIG_HZ; the theory stops at the door of the machine; the kernel scheduler never sleeps.`,
      },
    ],
    worked: [
      {
        title: "Compute average WT for given Gantt chart arrivals/bursts.",
        body: `Arrivals: P1@0(24), P2@0(3), P3@0(3) with FCFS — draw 0–24 P1, 24–27 P2, 27–30 P3; WT: P1=0, P2=24, P3=27; avg=17. Same with SJF ordering: P2,P3,P1: 0–3, 3–6, 6–30; WT: P2=0, P3=3, P1=6; avg=3. If arrivals stagger (P2@2), adjust — preemption changes the schedule; every GATE scheduling question is this exact procedure; mark early boundaries with vertical lines and double-check each completion time.`,
      },
      {
        title: "Round robin trace with quantum 4.",
        body: `Arrivals: P1(0,8), P2(1,4), P3(2,2): cycles: 0–4 P1, 4–8 P1 → rem 0? P1 rem 4 at t=4; continue 4–8 → P1 done at 8; wait P2 arrived at 1, P3 at 2 — proper trace: Q order initially P1; after 4: P1 re-queued behind P2/P3 which are already queued (P2 arrived at 1 during 0–4? no — P2 arrives at t=1 while P1 runs 0–4, so P2 queued; P3 at 2; order after first quantum: P2, P3, P1). Full Gantt: 0–4 P1, 4–6 P2? quantum 4 covers P2 fully (burst 4? P2=4 → runs 4–8, done), hmm — write out carefully with arrival handling: 0–4 P1, 4–8 P2, 8–10 P3, 10–14 P1 — completion: P1=14, P2=8, P3=10; TAT: 14,7,8; avg TAT 9.67. ALWAYS simulate step-by-step on paper — quantum scheduling mistakes are made by everyone, hence the exam asks it.`,
      },
      {
        title: "Compare FCFS vs SJF for a 5-job table.",
        body: `Jobs: A(0,3), B(0,7), C(0,2), D(0,4), E(0,1): FCFS avg = (0+3+10+12+16)/5=8.2; SJF (E,C,A,D,B): 0–1 E, 1–3 C, 3–6 A, 6–10 D, 10–17 B: WT E0,C1,A3,D6,B10 avg=4.0 — half. The teaching: scheduling choice changes average WT by 2x routinely; SJF is a theorem made executable; the catch: job sizes unknown — heuristics or admission estimates only.`,
      },
      {
        title: "Estimate burst times via exponential averaging.",
        body: `α=0.5; history: τ estimates past bursts; initial τ0=5; actual bursts: 4, 6, 8, τ1=0.5*4+0.5*5=4.5; τ2=0.5*6+0.5*4.5=5.25; τ3=0.5*8+0.5*5.25=6.625 — estimate converges toward recent behavior — the practical bridge between unknown future and known past; every production scheduler does something like this with CPU-time accounting instead of explicit burst prediction (CFS tracks virtual runtime — the moral equivalent).`,
      },
    ],
    exam: [
      {
        question: "Which algorithm gives minimum average waiting time?",
        answer:
          "Shortest job first (SRTF for preemptive); optimal among scheduling policies that do not know the future with certainty given known bursts; GATE answer: SJF / SRTF.",
      },
      {
        question: "What problem does aging solve?",
        answer:
          "Starvation in priority scheduling — low-priority processes wait forever behind endless stream of higher priorities; aging raises effective priority with wait duration — guaranteed eventual execution.",
      },
      {
        question:
          "If quantum is very large, RR degenerates to which algorithm?",
        answer:
          "FCFS — each process runs to completion before the next starts; quantum = infinity reproduces arrival order; quantum too small reproduces excessive context-switch overhead — both extremes kill you; the sweet spot depends on burst distribution — exam asks you to reason, not to memorize a magic number.",
      },
      {
        question: "What is the convoy effect and which algorithm suffers it?",
        answer:
          "One long process ahead of many short ones — all wait for it; FCFS (and RR with huge quantum) suffer it; SJF ordering eliminates it by definition when job sizes are known.",
      },
    ],
    cheat: [
      "TAT = CT − AT; WT = TAT − burst; response = first-run − AT.",
      "FCFS convoy; SJF optimal non-preemptive WT; SRTF optimal preemptive; both need burst estimates.",
      "Priority + aging for starvation; RR fair by quantum; too big → FCFS, too small → overhead.",
      "CFS: least-virtual-runtime fairness in Linux — no fixed quanta.",
      "Multi-core: per-core queues + work stealing + cache affinity; NUMA placement.",
      "Real-time: FIFO/RR classes; priority inversion → inheritance protocol.",
    ],
    recap: `CPU scheduling is the queueing theory the kernel runs every microsecond: FCFS teaches the convoy, SJF proves the optimum, RR buys fairness with a quantum dial, priority plus aging tames starvation, and modern kernels compose them into MLFQ/CFS — the averages you compute by hand are the latencies your users feel.`,
    code: {
      title: "SJF selection at dispatch",
      language: "python",
      code: `next_job = min(ready, key=lambda j: j.burst)`,
      explanation:
        "The entire SJF policy in one line — correctness limited only by knowing the future.",
    },
    diagram: {
      title: "Ready queue dispatch flow",
      caption:
        "Arrivals → ready queue → policy picks → run → done or re-queue.",
      mermaid: `flowchart LR\n  A[Arrivals] --> Q[Ready queue]\n  Q --> D{Policy: FCFS/SJF/RR/Priority}\n  D --> R[Running]\n  R -->|quantum expired| Q`,
    },
  },
  "gate-cs-operating-systems-synchronization-and-deadlocks": {
    intro: `Synchronization and deadlocks are where concurrent programs live or die: critical sections racing to corrupt shared state, semaphores ordering the chaos, and deadlocks freezing entire systems into mutual waiting — the four conditions and the four Coffman attacks. The subject covers race conditions, critical-section requirements, the classical algorithms (Peterson, test-and-set, semaphores, monitors), deadlock detection and avoidance, and the practical menagerie of synchronization bugs.`,
    foundations: `Race condition: outcome depends on interleaving; critical section: code accessing shared data; requirements: mutual exclusion, progress, bounded waiting. Peterson\'s algorithm (2-process flag/turn software solution). Hardware: test_and_set (atomic), compare_and_swap, fetch_and_add. Semaphores: counting (wait/signal), binary (mutex); classic problems: bounded buffer (producer-consumer), readers-writers, dining philosophers. Deadlock: four conditions (mutual exclusion, hold and wait, no preemption, circular wait) — all four required; prevention: deny one condition (resource ordering → circular wait impossible, etc.); avoidance: Banker\'s algorithm (safe state check); detection: resource allocation graph cycle detection; recovery: kill/rollback/preempt. Livelock, starvation, priority inversion distinctions matter.`,
    concepts: [
      {
        title: "The race condition and the critical-section problem.",
        body: `Two threads in read-add-write sharing x: interleavings produce lost increments; any program where correctness depends on schedule timing is broken; critical section = code that may not run concurrently for shared data; solution must guarantee (1) mutual exclusion (only one inside CS), (2) progress (no deadlock of entrants when CS free), (3) bounded waiting (every contender enters within finite time); (2) and (3) together distinguish synchronization from mere locking — many "solutions" satisfy (1) only, starving everyone quietly; Peterson\'s flag/turn meets all three for two processes with only loads/stores — the proof is two pages, memorize the shape if not the steps.`,
      },
      {
        title: "Hardware atomics: test_and_set and compare_and_swap.",
        body: `test_and_set: atomic read-and-set-to-true — used for spinlocks: while (test_and_set(lock)) spin; — lock available when found false; CAS: compare expected value, swap if equal — lock-free building blocks: retry loop: do { old = *p; new = f(old); } while (!CAS(p, old, new)); — used in malloc-free structures, reference counting, work-stealing queues; contention behavior: busy-wait burns CPU vs blocking (sleep) vs futex (fast userspace mutex — spin briefly then sleep in kernel — Linux default); compare-and-swap gives you the foundation of every lock-free data structure ever built; exam asks definitions and properties, production asks why CAS loops livelock under contention.`,
      },
      {
        title: "Semaphores: the universal synchronization primitive.",
        body: `Counting semaphore S integer + atomic wait(S) (P) and signal(S) (V): P: while S<=0 block; S−−; V: S++; wake one; binary semaphore (mutex) S∈{0,1}; counting for resource pools (3 printers → S=3). Mutex vs semaphore: mutex has ownership (unlock by owner only), semaphore doesn\'t — signaling across threads legal; reader-writer: readers concurrent, writer exclusive; dining philosophers: forks as 5 semaphores + chopstick order discipline — deadlock via circular wait, cure by asymmetric pickup (odd philosophers pick left first); producer-consumer: two counting semaphores (empty, full) + mutex — bounded buffer; the three classic problems are the template for half the exam questions and all the interview ones.`,
      },
      {
        title: "Deadlocks: Coffman conditions and the four attacks.",
        body: `Four necessary conditions (all must hold): mutual exclusion (resource non-sharable), hold and wait (hold while blocking), no preemption (can\'t take back forcibly), circular wait (cycle in wait-for graph); prevention = deny one: break mutual exclusion (spool resources — e.g., printer as daemon-queued), break hold and wait (request all at once or release-then-request), break no-preemption (preempt resources, rollback), break circular wait (totally order resources, acquire in order — global numbering kills cycles); avoidance (Banker\'s — keep at least one safe state: a sequence of grants after which everyone can finish); detection (cycle in RAG = deadlock exists) + recovery (kill all/one, preempt, rollback checkpoints); cost model: prevention expensive (resource underuse), avoidance expensive (needs max claim upfront), detection cheap-ish, recovery painful — pick by criticality.`,
      },
      {
        title: "Dining philosophers and priority inversion.",
        body: `Five philosophers, five forks, each needs two adjacent forks to eat — all pick left simultaneously → nobody can eat → circular wait → deadlock; solutions: (a) limit to four at table, (b) odd-even asymmetric pickup, (c) waiter (semaphore for fork pickup permission); priority inversion: low-priority task holds mutex needed by high-priority task → high waits — unbounded inversion possible with medium tasks抢占中 — cure: priority inheritance (holder temporarily boosted to waiter\'s priority) or priority ceiling (mutex pre-elevated — immediate inheritance, prevents chains); the Mars Pathfinder reset was caused by this exact bug — the most famous OS bug report in history.`,
      },
    ],
    worked: [
      {
        title: "Prove Peterson's algorithm satisfies the three requirements.",
        body: `Flag[i]=true; turn=j; while (flag[j] && turn==j) busy wait; critical section; flag[i]=false. Mutual exclusion: both in CS ⇒ both flags true; turn is one value; the one whose turn it is not proceeds only if other\'s flag false — contradiction; progress: flag false for the idle one — waiting loop exits eventually; bounded waiting: turn alternates — after flag[j]=false, blocked i eventually sees turn j and proceeds; three properties independently provable; the core symmetry argument every GATE answer expects.`,
      },
      {
        title: "Solve producer-consumer with semaphores end to end.",
        body: `Buffer of N; empty=N; full=0; mutex=1; producer: wait(empty); wait(mutex); put; signal(mutex); signal(full); consumer: wait(full); wait(mutex); get; signal(mutex); signal(empty). Order matters: wait(empty) before wait(mutex) — else mutex held while blocked on empty → deadlock (everyone stuck holding the buffer lock while waiting for items that can never arrive); the ordering trap is the exam\'s favorite; memorize: count semaphores outside the mutex, never wait inside while holding mutex when condition may not hold.`,
      },
      {
        title: "Banker's algorithm safety check on a given table.",
        body: `Total resources: A=10, B=5, C=7; allocations and max claims for P1–P4; available: compute A,B,C free; find a process whose need ≤ available; grant, reclaim its allocation into available; repeat until all done (safe) or stuck (unsafe); if during operation system remains always on a safe-sequence path — grants approved; otherwise denied (would block); the algorithm is O(n²·m) — fine for small tables in kernel memory; watch for GATE question: "after this grant, is system in safe state?" — the exact procedure, one table, five minutes.`,
      },
      {
        title: "Draw wait-for graph, detect cycle, break it.",
        body: `Processes P1 holds R1 waits R2; P2 holds R2 waits R3; P3 holds R3 waits R1; edges P1→P2→P3→P1 — cycle ⇒ deadlock exists (single instance per resource); recovery: kill P1 (rollback) or preempt R2 from P2 and break edge — choose victim by cost (rollback count, CPU time); prevention by ordering: acquire R1<R2<R3 always — cycles impossible by construction; rolling back is how databases recover from deadlocks in transactions — same machinery at higher layer.`,
      },
    ],
    exam: [
      {
        question: "What are the four necessary conditions for deadlock?",
        answer:
          "Mutual exclusion, hold and wait, no preemption, circular wait — ALL four required simultaneously; denying any one suffices for prevention; the exam asks to list them in this classical order.",
      },
      {
        question: "Difference between binary semaphore and mutex?",
        answer:
          "Mutex has ownership — only the locker can unlock; binary semaphore has no ownership — any thread can signal; mutex protects a critical section; semaphore orders execution/signals events across threads; both provide mutual exclusion as a side effect — ownership semantics differ.",
      },
      {
        question: "What does test_and_set(lock) return and how is it used?",
        answer:
          "Returns the previous value of lock atomically and sets it to 1; spinning loop: while(test_and_set(&lock)); gives mutual exclusion — used for spinlocks on SMP; the atomicity guarantee comes from hardware LOCK-prefix on x86.",
      },
      {
        question: "What is priority inversion and how is it cured?",
        answer:
          "Low-priority holder blocks high-priority waiter while medium preempts holder — high-priority starves indefinitely; cured by priority inheritance (temporarily raise holder to waiter's level) or priority ceiling; the Mars Pathfinder reset was exactly this.",
      },
    ],
    cheat: [
      "Race = schedule-dependent outcome; CS requires exclusion + progress + bounded wait.",
      "Peterson: flags + turn; two-process software proof on loads/stores.",
      "Atomics: TAS, CAS, FAA — building blocks of lock-free code.",
      "Semaphore: counting vs binary; mutex = owned semaphore.",
      "Deadlock Coffman: mutual exclusion, hold-wait, no-preempt, circular — deny any one.",
      "Banker: never grant leaving unsafe state; RAG cycle = deadlock (single instance).",
    ],
    recap: `Synchronization is the discipline between concurrency\'s promise and its peril: atomics and semaphores enforce order, critical-section proofs enforce sanity, Coffman conditions tell you exactly which lock to deny — because concurrent code fails not loudly, but silently, once per million runs; the exam tests your proofs, production tests your logging.`,
    code: {
      title: "Peterson core",
      language: "c",
      code: `flag[i] = true; turn = j;\nwhile (flag[j] && turn == j) {}\n/* critical section */\nflag[i] = false;`,
      explanation:
        "Two variables, mutual exclusion, no hardware help — the complete existence proof for two-process locking.",
    },
    diagram: {
      title: "Deadlock cycle",
      caption: "Wait-for graph cycle — the signature every deadlock wears.",
      mermaid: `flowchart LR\n  P1[P1 holds R1] --> P2[waits R2]\n  P2[P2 holds R2] --> P3[waits R3]\n  P3[P3 holds R3] --> P1`,
    },
  },
  "gate-cs-operating-systems-memory-management": {
    intro: `Memory management is the OS\'s least glamorous and most consequential job — turning scarce physical RAM into the illusion of infinite address space for every process, fast, isolated, and reclaimable. The subject is paging, segmentation, page tables, TLBs, virtual memory, page replacement (LRU, FIFO, OPT), thrashing — the machinery that lets Chrome leak 8 GB without killing the machine (until it does).`,
    foundations: `Physical vs logical/virtual addresses; MMU translates via page tables (virtual page number + offset → physical frame + offset); page size 4 KB typical; page table entry: frame number, valid bit, dirty bit, access rights, A/D bits; single-level vs multi-level page tables (forward or hashed inverted); TLB caches translations (hit ~ nanoseconds, miss → walk page table in memory ~100 ns); virtual memory: pages evicted to disk (swap) on pressure; page replacement: OPT (evict furthest-future — unimplementable, benchmark), FIFO (Belady\'s anomaly possible), LRU (evict least recently used — provably near-optimal stack algorithm, no anomaly), Clock/second-chance (approximate LRU efficiently); thrashing: working set exceeds RAM — no useful work; working set model & page fault frequency control.`,
    concepts: [
      {
        title: "Paging: the finite pieces of infinite space.",
        body: `Physical memory divided into frames (4 KB); virtual into pages — identical sizes; any page maps to any frame — external fragmentation eliminated (only internal page-end waste); page table maps virtual page → frame; single-level table = one entry per page — 4 GB address space / 4 KB pages = 1M entries × 8 B = 8 MB per process — expensive; solved by hierarchical tables (two-level: 10+10+12 bits x86-32; four-level x86-64: 9+9+9+9+12 — 48-bit VA, 52-bit PA); inverted page tables — one entry per frame (space proportional to RAM, not VA); hashed for 64-bit huge spaces. GATE asks: page table size computation, address division into VPN/offset given page size and VA bits — mechanical.`,
      },
      {
        title: "TLB and translation caching.",
        body: `Page table walk costs memory lookups — too slow per instruction; TLB sits inside MMU: fully-associative small cache (64–1024 entries) of VPN→PFN + flags; hit: translation in 1 cycle; miss: page-walk — x86-64 hardware walker, 4 memory references (or fewer with caches); ASIDs tag TLB entries so context switches don\'t flush; invalidate individual entries on page table edits (invlpg); miss rate target < 1%; huge pages (2 MB/1 GB) slash TLB misses dramatically; the TLB is why "random memory access" costs 100 ns and not 100 cycles + 4 cache misses.`,
      },
      {
        title: "Virtual memory and demand paging.",
        body: `Programs demand large virtual space; only hot pages stay resident — rest on disk; first touch of a non-present page → page fault → kernel: find free frame (or evict), load from disk/swap/executable, update PTE (valid=1), resume instruction; valid bit also enforces protection (write to read-only page → fault routed to SIGSEGV); copy-on-write shares fork pages until written; shared libraries mapped once into many processes; demand loading = exec fast — pages loaded on first touch only; the entire illusion costs each process a page table walk per first-touch page plus fault overhead ~μs each.`,
      },
      {
        title: "Page replacement: OPT, FIFO, LRU, Clock.",
        body: `OPT: evict page whose next use is furthest in future — theoretically best, needs future knowledge — used to grade your algorithm; FIFO: evict oldest-loaded — simple, has Belady\'s anomaly (more frames → MORE faults — 9 pages ref string 1,2,3,4,1,2,5,1,2,3,4,5 → 6 faults @3 frames, 10 @4); LRU: evict least recently used — stack algorithm → no anomaly; implementation with counters or doubly-linked list (O(1) touch); Clock: circular buffer with reference bits — sweep, clear bits, evict first found with 0 — approximates LRU without per-access work; GATE asks trace fault counts for each — practice on 8–10 ref strings; the anomaly demonstration is a perennial exam favorite.`,
      },
      {
        title: "Thrashing and the working set model.",
        body: `If the sum of actively used pages (working set) exceeds available RAM, the OS spends all time paging in/out, none executing — CPU utilization collapses to near-zero while disks thrash; detection: page-fault rate vs utilization — classic curve dives off the cliff at critical point; prevention: working set model (count unique pages per time window — guarantee enough frames per process), page-fault frequency trigger (reduce multiprogramming if faults spike), admission control (don\'t schedule more than memory allows); swap devices fix it slowly; the best fix is leaving room in RAM — overcommit kills; the Linux OOM killer exists because preventing thrashing without admission control is impossible.`,
      },
    ],
    worked: [
      {
        title: "Translate 0x12345678 with 4KB pages and two-level page table.",
        body: `12 offset bits (4KB=2^12): offset=0x678; VPN = 0x12345 remaining 20 bits: split 10/10: outer index = 0x48 (288), inner index = 0x345 (837); entries: outer table base + 288×8 → inner page table base; inner base + 837×8 → PTE; extract PFN; physical = PFN|0x678; every GATE address-translation question is this bit surgery; number of levels chosen by VA width / page size — practice with 32 and 64-bit formats.`,
      },
      {
        title:
          "Fault-count trace: LRU vs FIFO on ref string 3 2 1 0 3 2 4 3 2 1 0 4.",
        body: `Frames=3. FIFO order: fill 3,2,1 → faults 3; 0 → evict 3 (oldest) — faults 4; 3 → evict 2 — 5; 2 → evict 1 — 6; 4 → evict 0 — 7; 3 → evict 3 — wait, evict LRU/oldest: need care — FIFO evicts by load time, not use: after 0,3,2 loaded (evicted 1), next 4 → evict 3 (oldest) → fault 7; 3 → evict 2 — fault 8; 2 → evict 0 — 9; 1 → evict 4? order: loaded 4,3,2 — oldest 4 → evict 4 — fault 10; 0 → evict 3 — 11; 4 → evict 2 — 12. LRU: trace with stack discipline: after 3,2,1: [3,2,1] MRU→LRU; 0: evict 1 → [3,2,0]; 3 (hit) → [3,2,0] → 3 MRU; 2 hit → [3,0,2] wait keep MRU at left: [2,3,0] MRU→LRU; 4: evict 0 → [4,2,3]; 3 hit → [3,4,2]; 2 hit → [2,3,4]; 1: evict 4 → [1,2,3]; 0: evict 3 → [0,1,2]; 4: evict 2 → [4,0,1]: 10 faults. LRU beats FIFO by 2 here — the demonstration of the anomaly.`,
      },
      {
        title:
          "Compute page table entries for 64-bit process with 48-bit VAs, 4KB pages.",
        body: `VPN bits = 48 − 12 = 36 bits → 2^36 = 68,719,476,736 entries × 8 B = 550 GB — hence multi-level: four-level 4×9+12; each level only materialized on demand — untouched regions cost zero memory; the hierarchy is what makes 64-bit addressing economical; GATE asks: "why not single-level?" — answer: 512 GB of table per process is absurd; demand-paged page tables exist precisely for this reason.`,
      },
      {
        title: "Working set size vs allocated frames: thrashing demo.",
        body: `Process working set = 120 pages across last 1000 instructions; OS allocates 45 frames; every instruction likely misses a needed page — fault rate ~ 30%; CPU idles; adding frames to 120 → fault rate collapses to < 1%; the curve is non-linear — small allocation increases create cliff-edge recovery — showing why the OS tracks WSS per process and refuses to overcommit past the cliff.`,
      },
    ],
    exam: [
      {
        question: "What is Belady's anomaly and which algorithm exhibits it?",
        answer:
          'For some reference strings, increasing frame count increases page faults — FIFO exhibits it; stack algorithms (LRU, OPT) cannot — fault counts are non-increasing with more frames; the anomaly is the canonical exhibit for "more memory ≠ fewer faults."',
      },
      {
        question: "What does the valid bit in a page table entry mean?",
        answer:
          "Whether the page is resident in a physical frame right now; if invalid → page fault → OS loads it; the same bit doubles as protection enforcement (write to read-only page → fault → SIGSEGV); valid/invalid is the gate the MMU checks on every access.",
      },
      {
        question: "What is the purpose of the TLB and what happens on a miss?",
        answer:
          'Cache recent VPN→PFN translations — hit avoids the multi-level walk; miss → hardware walks the page table (4 memory refs x86-64), inserts entry into TLB (evicting possibly), retries — costs ~100 ns; TLB miss rate is the first suspect for "random access slow" benchmarks.',
      },
      {
        question: "What is thrashing and how does the OS detect it?",
        answer:
          "Paging activity so heavy that CPU utilization collapses — processes wait on page-ins more than they execute; detection via page-fault rate (sudden spike) or WSS tracking; cure: reduce multiprogramming degree, add RAM, or kill the hog; no amount of scheduling cleverness saves a machine overcommitted into the cliff.",
      },
    ],
    cheat: [
      "Page size 4KB; VPN|offset; multi-level tables for 48-bit VA.",
      "TLB caches translations; ASIDs avoid flush on switch; huge pages cut misses.",
      "OPT evicts furthest-future (bound); LRU evicts least-recent (practical); FIFO has Belady anomaly.",
      "Clock approximates LRU with reference bit and hand sweep.",
      "Page fault: invalid PTE → OS loads from disk, sets valid=1, retries instruction.",
      "Working set model prevents thrashing; OOM killer = last resort.",
    ],
    recap: `Memory management is applied illusion engineering: paging and multi-level tables deliver infinite contiguous address spaces from finite scattered RAM, the TLB makes translations free-ish, demand paging lazily loads everything, and replacement algorithms fight physics for your working set — when they lose, the disk sings and the CPU starves; the cliff is measurable, the cure is headroom.`,
    code: {
      title: "Page number/offset split",
      language: "text",
      code: `VPN = addr >> 12\noffset = addr & 0xFFF\nPFN = page_table[VPN]`,
      explanation:
        "Three expressions the MMU performs billions of times a second without asking anyone.",
    },
    diagram: {
      title: "Memory translation pipeline",
      caption:
        "Virtual address → TLB → page table (on miss) → physical frame → cache/memory.",
      mermaid: `flowchart LR\n  VA[Virtual address] --> T{TLB hit?}\n  T -->|yes| PH[Physical frame]\n  T -->|no| W[Page-table walk]\n  W --> T`,
    },
  },
  "gate-cs-operating-systems-file-systems-and-storage": {
    intro: `File systems are the OS\'s face to persistent storage — how bytes outlive processes, how names map to extents, how metadata survives crashes. The subject is inodes, directory structures, allocation strategies (contiguous/linked/indexed), journaling for crash consistency, and the performance realities of storage hierarchy from L1 cache down to cold disk — the map for every ls and dd you run.`,
    foundations: `Storage hierarchy: registers < L1/L2/L3 < RAM < NVMe SSD < SATA SSD < HDD < tape (latency ns→ms, bandwidth GB/s→MB/s). File system core objects: inode (metadata: size, timestamps, owner, mode, block pointers), directory (name → inode number), superblock (FS-wide layout), free-space map (bitmap or inode bitmap). Allocation: contiguous (fast sequential, external fragmentation), linked (no fragmentation issues for growth, slow random), indexed (inode with direct + single/double/triple indirect blocks — ext4-style). Journaling: write-ahead log (WAL) of transactions — metadata-only (ext4 ordered) or full data+metadata (NTFS); crash recovery replays log, tolerated fsck rare. RAID 0/1/5/6/10 for redundancy vs performance.`,
    concepts: [
      {
        title: "Inodes and directory structure.",
        body: `Inode: number (unique per FS), mode (type+perms), uid/gid, size, atime/mtime/ctime, link count, 12 direct block pointers + 1 single indirect + 1 double + 1 triple (ext2/3/4); file data lives in blocks pointed to by inode; directories map names to inode numbers — ls reads directory blocks; hard links: same inode, multiple names; soft links: tiny file containing path; permissions: r=read, w=write, x=search/exec per owner/group/other — chmod/chown change these; inode exhaustion (millions of tiny files) is a separate limit from space — df -i; the 128-byte inode of ext2 packs into efficient metadata blocks; stat anything and you see inode fields plainly.`,
      },
      {
        title: "Allocation strategies: contiguous vs linked vs indexed.",
        body: `Contiguous: file occupies consecutive blocks; read = one seek+stream — fastest possible; growth impossible in place (external fragmentation forces relocation); used by ISO images, tape, some RTOS; linked: each block points to next — no external fragmentation, any growth anywhere on disk; random access O(n) — death for databases; indexed: inode holds direct pointers + indirect levels — best general case; ext4 uses extents (ranges) instead of individual pointers — compresses metadata 100x for large files; FAT: linked allocation with in-memory FAT table — fine for flash/embedded, single point of failure (one bad sector kills the chain); NTFS: master file table (MFT) with extents + journaling.`,
      },
      {
        title: "Journaling and crash consistency.",
        body: `Without journaling: crash mid-write → inode/pointer inconsistent → fsck scans whole disk (hours on TBs) at boot; with journaling: intent to modify metadata written to journal first; commit record → apply to real locations → mark journal entry complete; crash recovery: replay committed transactions (fast, bounded); data journaling (NTFS, ext4 data=journal) also journals file data — strongest, slowest; ext4 default ordered mode journals metadata only but flushes data before metadata update — good protection at low cost; ZFS/Btrfs: copy-on-write everything — the FS itself is a Merkle tree of blocks — checksums everywhere, snapshots free (reference old root), scrubbing finds silent corruption — the gold standard for integrity obsessives.`,
      },
      {
        title: "Storage performance: SSD vs HDD realities.",
        body: `HDD: seek 5–10 ms + rotation 2–5 ms — random IOPS ~200; sequential 100–250 MB/s; fragmentation = death; SSD: no moving parts — random IOPS 10k–1M (NVMe); sequential 200–3500 MB/s; erase-before-write (must erase block before re-program — write amplification), wear leveling, TRIM (inform FS blocks unused — enables efficient garbage collection); the OS page cache absorbs most reads (hot pages in RAM — second read is free); buffering for writes (write-back cache with battery/PLP — power-loss protection crucial for DBs); O_DIRECT bypasses cache for DB self-management; io_uring batches submissions to saturate NVMe; every performance question worth asking: which level of the hierarchy is this touching?`,
      },
      {
        title: "RAID and redundancy levels.",
        body: `RAID 0: striping — speed, zero redundancy, one disk dies = array dies; RAID 1: mirroring — 2x cost, 1x capacity, fast reads; RAID 5: single parity distributed — N disks, N−1 usable, survives one failure, slow writes (read-modify-write parity); RAID 6: double parity — survives two; RAID 10: stripe of mirrors — 2x cost, best random performance, survives one per mirror pair; RAID is not backup — deletion/corruption propagates instantly to all copies; the only correct answer to "is my data safe?" includes off-site, versioned, tested restores — RAID guards against disk failure alone.`,
      },
    ],
    worked: [
      {
        title:
          "Compute max file size with direct+single+double indirect blocks.",
        body: `Block size 4 KB; pointer 4 B → 1024 pointers/block; direct pointers = 12 → 12 blocks = 48 KB; single indirect = 1024 blocks = 4 MB; double indirect = 1024×1024 = 4 GB; triple = 4 TB — ext2 max ~4 TB total; the arithmetic is classic exam fare; compute for block 8 KB and 8-byte pointers: pointers/block=1024, same counts — changing block size cancels out mostly; the exam loves giving different parameters and watching you recompute — practice three variants.`,
      },
      {
        title: "Journal replay after crash mid-deletion.",
        body: `In progress: unlink(file) — journaling records: inode marked free (intent) committed → crash before data block freed — recovery replays: inode already free, directory entry removed — consistent either way; if crash before intent commit: nothing applied, file still exists intact — journal ordered correctly makes both outcomes safe; the property is atomicity: either the whole transaction is visible or none of it — that is what multi-block file operations need and what your filesystem owes you on every crash.`,
      },
      {
        title: "SSD write amplification measurable with fio.",
        body: `fio --name=randwrite --bs=4k --rw=randwrite --size=1G --iodepth=32 → observe SMART percentage used; compare bytes-written counter vs bytes you sent — ratio > 1 means garbage collection rewrites (write amplification); 5x ratio on a cheap drive is common; the takeaway: fill SSD 70–80% max, keep OP (overprovisioning) free, and enable TRIM; every perf-tuning pass on mounts should include atime=off (no metadata rewrite per read) and noatime/relatime to slash metadata writes.`,
      },
      {
        title:
          "RAID 5 array of four 1TB disks: usable space and failure tolerance.",
        body: `Usable = (N−1)×disk = 3 TB; survives single disk failure; rebuild time for 1 TB at 100 MB/s ≈ 3 hours — during rebuild, second failure kills everything; hence RAID 6 for large drives (survives 2); the exam asks: "after one disk fails in RAID 5, what remains?" — array continues in degraded mode, one more failure fatal; compute reliability from MTTF numbers back-of-envelope: with 2^16 h disk MTTF, annual failure rate per disk ~1.4%; RAID 1 for 2 disks: ~1−(1−0.014)²≈2.8% chance of at least one failure — all fine — full loss requires same-hour failure — vanishing.`,
      },
    ],
    exam: [
      {
        question: "What does an inode store that a directory does not?",
        answer:
          'File metadata and data-block pointers — everything except the name; directories store only name → inode number; two hard-linked names share one inode; the exam answer: "all attributes and block locations; directories hold only the mapping."',
      },
      {
        question: "Why is linked allocation bad for random access?",
        answer:
          "Locating block N requires traversing N pointers from the head — O(n) per lookup; seeks dominate; unusable for databases; only sequential streams benefit; indexed allocation exists precisely to kill this cost.",
      },
      {
        question: "What problem does journaling solve?",
        answer:
          "Crash-consistency — partial multi-block updates that leave metadata corrupt; journal = write-ahead log of intent; recovery replays committed intents; no full fsck scan; atomicity of file operations; the cost: double writes of metadata.",
      },
      {
        question: "Which RAID has zero redundancy?",
        answer:
          "RAID 0 (striping); any single disk failure destroys the array; it buys pure throughput; nothing else; the exam checks whether you know 0 vs 1 vs 5 vs 10 from memory.",
      },
    ],
    cheat: [
      "inode = metadata + block pointers; directory = name→inode; superblock = FS layout.",
      "ext4 extents compress pointers; MFT (NTFS) similar.",
      "Direct 12 + single/double/triple indirect — max file sizes.",
      "Journaling: metadata intent → commit → apply; recovery replays.",
      "SSD: erase-before-write, write amplification, TRIM, no seek.",
      "RAID 0/1/5/6/10; RAID ≠ backup — 3-2-1 rule for real safety.",
    ],
    recap: `File systems are the most under-appreciated code you depend on daily: inodes hold everything but the name, directories are name-to-inode maps, allocation strategies trade speed against growth, journaling buys crash atomicity with double writes, and SSD realities rewrote every old assumption — because the machine forgets nothing except what the filesystem didn\'t promise to remember.`,
    code: {
      title: "stat output anatomy",
      language: "bash",
      code: `stat file.txt`,
      explanation:
        "Inode number, perms, timestamps, blocks, links — the inode fields printed by the tool you will run a thousand times.",
    },
    diagram: {
      title: "File read path",
      caption:
        "Path lookup walks directories to inode, page cache serves blocks, one system call returns bytes.",
      mermaid: `flowchart LR\n  P[Path] --> D[Directory blocks]\n  D --> I[inode]\n  I --> B[Data blocks]\n  B --> PC[Page cache to user]`,
    },
  },
};

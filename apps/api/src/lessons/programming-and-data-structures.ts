import type { TopicLesson } from "../topicLessons.js";

/**
 * Programming and Data Structures — 8 authored topic lessons.
 *
 * Standalone chapters per topic. Subject-first prose, foundations, core
 * concepts, worked examples, exam practice, cheat sheet, recap. C is the
 * exam language for the gate-cs track. No shared templates.
 */
export const programmingAndDataStructures: Record<string, TopicLesson> = {
  "gate-cs-programming-and-data-structures-c-programming-fundamentals": {
    intro: `C is the language GATE uses to interrogate how a programmer models machines: every value has a type with a fixed width and range, every object has an address, every computation happens inside rules the compiler enforces and the hardware executes. The subject is the complete C program — declarations and scope, integer ranges and the usual arithmetic conversions, control flow and functions, storage classes, and the small print of evaluation order — taught at the level where reading a ten-line program and predicting its output is a skill you possess, not a lottery you enter.`,
    foundations: `The C machine model: bytes are bytes; an int is signed, at least 16 bits, commonly 32; a char is at least 8 bits and typically exactly 8; a float is IEEE single (≈7 significant digits), a double IEEE double (≈15); a pointer holds a virtual address and its arithmetic scales by the pointed-to type's size. Integer arithmetic follows integer promotion: operands narrower than int promote to int; unsigned meets signed of equal rank → the signed operand converts to unsigned (a negative then wraps to a huge positive — the classic GATE trap). Integer division truncates toward zero; division by zero is undefined behavior; overflow of signed arithmetic is undefined behavior (unsigned wraps by design). Storage classes: auto (default, stack, lifetime = block), static (lifetime = program, scope = file or block), extern (declaration of an external definition), register (hint, not a promise). Functions must be declared before use. All of this is checkable by the compiler, and every GATE C question is written against exactly these rules.`,
    concepts: [
      {
        title: "Integer types and the representation contract.",
        body: `Every integer type carries a minimum width and a maximum range: char ≥ 8 bits, int ≥ 16, long ≥ 32, long long ≥ 64 — actual widths are implementation-chosen, but on modern 32/64-bit targets int is 32 and long long is 64 in practice. Two's complement is the universal signed representation: range −2^(n−1) .. 2^(n−1)−1; unsigned n-bit is 0 .. 2^n − 1. Signed overflow is UB (compilers exploit it — a loop "while (x + 1 > x)" is optimized to infinity if you signed anything), which is why exam questions refuse to predict answers here and instead test your understanding of representations that are well-defined. Bitwise operations (AND/OR/XOR/shifts) are unsigned territory — left-shifting a negative signed value is UB; right-shifting negatives is implementation-defined historically (arithmetic shift in practice). Mask idioms: x & (x−1) clears the lowest set bit; 1u << k is the safe way to name a bit; (x >> k) & 1 reads bit k.`,
      },
      {
        title: "Declarations, scope, and the type rules.",
        body: `Declarations announce; definitions instantiate. File scope: declared outside functions — visible until end of file (static file scope = this file only). Block scope: declared inside braces — visible to end of block. Function parameters: block scope in the containing function. Shadowing: an inner declaration hides the outer for the duration of the inner scope — the outer object still exists, unchanged. Linkage: extern shares, static hides. The declaration order rule: identifiers must be declared before use — the compiler is greedy, reading one pass, and every cryptic GATE C question about "why does this compile or not" reduces to declaration order and implicit int (removed in C99: missing return type is an error, not a default). Initialization defaults: static objects are zero-initialized (bss) — a common exam answer; auto objects are uninitialized garbage — reading one is undefined, and the exam loves showing you code that "works on my machine" and asking what it proves (nothing).`,
      },
      {
        title: "Control flow, functions, and evaluation order.",
        body: `C provides exactly the branches and loops hardware provides: if/else, switch (jump table), while, do-while (body always executes at least once), for (init; condition; update). switch uses integer promotion on the expression, matches constants, falls through unless you break — forgetting break is the classic fallthrough question. Functions pass arguments by value: arrays decay to pointers and are passed as addresses (the only "reference" in C), pointers passed as values let the callee see the caller's object. Evaluation order: C does not specify operand order for f(a(), b()) — any interleaving is legal (the old ambiguity trap in exams); sequence points exist only at &&, ||, ?:, comma, and function call boundaries. printf("%d %d", i++, i++) — undefined; the exam asks "what does this print" and the answer is "cannot be determined" or the compiler-specific result. Functions: declaration (prototype) before call; default-argument promotion promotes floats to double, char/short to int — mixing promotes silently, which is why printf() needs the format string exactly.`,
      },
      {
        title: "Pointer types and the address story.",
        body: `A pointer is an integer that indexes the virtual address space; its type tells the compiler how to scale and how to dereference. int *p declares p as a pointer to int; p + 1 advances by sizeof(int); *p reads the pointed-to int; & takes an address. Pointer arithmetic past the end of an array is UB (one-past is fine, two-past is not); comparing pointers of unrelated objects with < is UB (equality on void pointers is fine); casting int to pointer is implementation-defined. NULL is the distinguished zero pointer; dereferencing it is UB. The & and * operators are exact inverses on valid operands; forgetting that &arr[i] is the same as arr + i is the start of every pointer confusion. A pointer and an array name are interchangeable in most expressions — sizeof(array-name) is the exception (yields array size, not pointer size) — the exception that proves the decay rule is the exam's favorite.`,
      },
      {
        title: "Preprocessor, macros, and translation units.",
        body: `The preprocessor runs before the compiler proper: #include pastes the named file's contents literally (system headers in <>, local headers in ""), #define names textual substitutions — macros are text expansion, not functions; they do not respect types or scopes, and they re-evaluate their arguments (the classic max(a,b) macro double-evaluation footgun) — always parenthesize arguments and the whole expansion. #define SQUARE(x) ((x)*(x)) — without both parenthesizations, SQUARE(1+1) expands to 1+1*1+1 = 3, a trap every C exam checks. Conditional compilation #if/#ifdef/#else/#endif and header-guard patterns (#ifndef X_H / #define X_H / ... / #endif) prevent multiple inclusion — no external modules, no packages: C builds a program from translation units glued by #include and the linker. The phases: preprocessing → translation → compilation to .o → linking into an executable — the pipeline every systems engineer internalizes.`,
      },
    ],
    worked: [
      {
        title: "Range of types — fill the table.",
        body: `Given 32-bit two's complement machine: char (signed): −128..127; unsigned char: 0..255; short: −32768..32767; int: −2147483648..2147483647; unsigned int: 0..4294967295; long long: −9223372036854775808..9223372036854775807. GATE asks either a range (compute 2^n − 1) or the outcome of a comparison after conversion (e.g., -1 < 1u → false, because −1 converts to UINT_MAX). The whole exercise reduces to: know the width, know the rule that mixed-sign comparison is unsigned, recite the range. Verification: −1 < 1u is a 1-bit pattern compared as unsigned — 0xFFFFFFFF vs 0x00000001 — the second is smaller, so the relation is false.`,
      },
      {
        title: "What does this print?",
        body: `int a = 5, b = 7; a++; printf("%d %d %d\\n", a++, ++b, a + b); — predict: arguments evaluated in an unspecified order but typically right-to-left on x86: a + b uses CURRENT a (still 5) and CURRENT b (7) → 12; ++b → 8; a++ yields 6 (a becomes 6). Output on most compilers: "6 8 12" (argument order is unspecified — some compilers print differently, but every answer is tied to the right-to-left x86 idiom, and the exam accepts it because evaluation order on this platform is that). The point: the exam wants you to know (a) postfix yields old value, (b) prefix increments first, (c) operand evaluation order is unspecified. Interior answer: with -O0 on gcc x86-64: "6 8 12".`,
      },
      {
        title: "Storage class trace.",
        body: `static int counter(void) { static int n = 0; return ++n; } — called three times: returns 1, 2, 3. The static object n is initialized once (zero-initialized from bss, then assigned at first use block entry in C99 semantics of static initialization — here explicit 0 which equals bss zero anyway), persists across calls. In contrast, auto n = 0 would return 1 every call; extern leakage outward is forbidden for statics at file scope. GATE asks: value returned on nth call — trivially this one; the subtle variant asks where n lives (static storage, bss + data segments) and whether main() without static shares it (no — static at block scope is local to the function).`,
      },
      {
        title: "Integer conversion trap.",
        body: `int x = -1; unsigned y = 1; if (x < y) printf("less\\n"); else printf("greater\\n"); — usual arithmetic conversions turn the comparison into unsigned: x wraps to 4294967295; 4294967295 < 1 false — prints "greater". The same trap in loops: for (unsigned i = 10; i >= 0; i--) infinite — subtracting 1 from 0 wraps to UINT_MAX and the condition never fails; the classic infinite-loop question; the fix: signed loop counter or i != 0 with pre-decrement in the body. Every C exam with integers checks exactly this conversion corner once.`,
      },
    ],
    exam: [
      {
        question: "On a 32-bit machine, what is the range of int?",
        answer:
          "−2,147,483,648 .. +2,147,483,647 (two's complement, 2^31 − 1 on the positive side, −2^31 on the negative). Every GATE boundary question wants these exact numbers or the formula −2^(n−1) and 2^(n−1)−1.",
      },
      {
        question: 'What does printf("%d", 3 / 2) print and why?',
        answer:
          "1 — integer division truncates toward zero. 3 / 2 = 1; 3 / -2 = -1 (truncation toward zero rules on both signs — older C99-and-earlier implementations used floor for negatives, another trap the exam sometimes asks about). Non-integer 3.0/2 = 1.5 requires a double operand.",
      },
      {
        question: "What is the printed value of (unsigned)(-1) > 1u?",
        answer:
          "TRUE (prints true/1) — (unsigned)-1 wraps to UINT_MAX; UINT_MAX > 1u is true. The trap is believing any comparison with negative integers stays signed; usual arithmetic conversions silently convert both sides to unsigned the moment any unsigned operand appears.",
      },
      {
        question: "What does static int x; at file scope give you?",
        answer:
          "A single object with static storage duration (lives for the whole program run, zero-initialized) whose name is visible only inside this translation unit — the C equivalent of a module-private global. Other translation units declaring extern int x get a *different* x or a link error, by design.",
      },
    ],
    cheat: [
      "int ≥ 16, commonly 32; long long ≥ 64; two's complement: −2^(n−1) .. 2^(n−1)−1.",
      "Integer promotion: < int → int; mixed sign → unsigned; division truncates toward zero.",
      "static: program lifetime, zero-init; auto: stack, garbage unless initialized; extern: external.",
      "arr[i] ≡ *(arr+i); sizeof(arr) is array size; sizeof decayed ptr is pointer size.",
      "printf/argument eval order unspecified; sequence points at ||, &&, ?:, comma, call.",
      "Macros are text substitution — parenthesize args and expansion; SQUARE(1+1) = 3 trap.",
      "unsigned loops never hit 0; use signed counters or i != 0 decrement-body idiom.",
    ],
    recap: `C is the machine's contract with the programmer: fixed-width types with defined ranges, conversions that follow one rule everywhere (usual arithmetic conversions), pointer arithmetic scaled by type size, and storage classes declaring exactly how long every object lives — because GATE's C questions are not trivia, they are the shared rules of every compiler you will ever read disassembly from.`,
    code: {
      title: "Integer promotion trap demo",
      language: "c",
      code: `unsigned u = 1;\nif (-1 < u) printf("never printed"); else printf("greater");`,
      explanation:
        "The whole class of signed/unsigned traps in two lines — the exam asks precisely this comparison in half a dozen disguises.",
    },
    diagram: {
      title: "Translation pipeline",
      caption:
        "Preprocess → compile → link: every C question begins in exactly one of these three phases.",
      mermaid: `flowchart LR\n  S[Source .c] --> P[Preprocessor]\n  P --> C[Compiler to .o]\n  C --> L[Linker to executable]`,
    },
  },
  "gate-cs-programming-and-data-structures-pointers-arrays-and-memory": {
    intro: `Pointers and arrays are the single most examined subject in the C portion of GATE: pointer arithmetic scaled by type, arrays decaying to pointers, why sizeof lies to you about arrays, and how the stack and the heap store every object you create. The subject takes the small set of addressing rules every C program executes and makes them something you can reason about exactly — drawing the memory map, predicting the addresses, and surviving the exam's favorite traps.`,
    foundations: `Memory has three regions: text (program code, read-only), initialized/uninitialized data (static and global objects — bss for zeros), and stack (auto objects, function call frames) plus heap (malloc'd objects, programmer-managed). A pointer is typed: int *p points to an int, and p + 1 advances sizeof(int) bytes; void *p points to anything (arithmetic forbidden in standard C; cast for use). Arrays are contiguous slabs; the array name in most expressions decays to a pointer to its first element; indexing arr[i] is *(arr + i) — plus 0 is the same object, minus 1 is UB before the start. Two-dimensional arrays are row-major with each row contiguous. malloc takes bytes, calloc zeroes, realloc grows (possibly moving), free returns to the heap — freeing twice is heap corruption, never checking malloc's NULL is instant UB on exhaustion, and every leaked pointer before program end is memory you no longer own but cannot reclaim.`,
    concepts: [
      {
        title: "Array layout and row-major order.",
        body: `int a[2][3] is stored as six contiguous ints in order a[0][0],a[0][1],a[0][2],a[1][0],a[1][1],a[1][2] — offset of a[i][j] from base is (i * 3 + j) * sizeof(int). GATE asks for the address given the base address and the size — every variant is this same formula (it appears with char/short/double too; substitute sizeof). a + i points to row i — type int (*)[3]; a[0] points to the first element of row 0 — type int *; &a[0][0] points at the very first bytes; &a and a have the same numeric value but different types (pointer-to-array vs pointer-to-element) — printed the same, scaled differently. The decay rule: array name decays to pointer in value contexts, except in sizeof(arr) (yields full array size) and &arr (yields pointer to array).`,
      },
      {
        title: "Pointer arithmetic and bounds.",
        body: `int *p = a; p + 1 points to a[1], p + 3 points one past a[2] (legal to form, illegal to dereference). Subtraction of pointers within one array yields the element count — p2 - p1 = 3 for a[2] vs a[-1]... careful: &a[2] - &a[0] = 2. Relational comparisons on pointers into different arrays are UB; equality comparison on void pointers is fine. Casting: intptr_t preserves pointer width for round-trip via integer; uintptr_t similarly; casting an arbitrary integer to a pointer is implementation-defined at best, usually garbage. The rules all reduce to: pointers carry (address, type), arithmetic is scaled, bounds are mostly on the programmer, and the machine enforces none of it.`,
      },
      {
        title: "Stack vs heap vs static: where objects live.",
        body: `static and global objects live in data/bss — one copy per program, alive for the whole run, zero-initialized if not otherwise (bss). auto/block locals live on the stack — allocated on function entry, released on return; returning a pointer to a stack local is the classic bug (dangling pointer to a frame that no longer exists). malloc/calloc/realloc/free live on the heap — programmer-managed, non-scoped, leaks and double-frees are yours to prevent; free(NULL) is legal and does nothing (the only free that is always safe); realloc(p, 0) is technically free-like but implementation-defined — don't use it as a curiosity answer. String literals live in read-only text — char *s = "abc"; s[0] = 'x' is UB on modern platforms (segfault).`,
      },
      {
        title: "malloc/calloc/realloc discipline.",
        body: `malloc(n * sizeof(T)) — sizeof multiplication order safety (n * sizeof(T) never overflows early vs sizeof(T) * n — equal anyway); always check !ptr → handle failure. calloc(n, sizeof(T)) — zeroed memory, same check. realloc(ptr, newsize) — may copy and free old block; returns NULL on failure and leaves original intact — do not write realloc(ptr, sz) directly into ptr without a temp (leak on failure). free(p) — p must point to a malloc'd block; freeing interior pointers or stack addresses corrupts the heap; double free is undefined; use-after-free reads freed memory (allocator metadata overwrites it — the classic exploit once that metadata is attacker-controlled). To zero a struct with one line: struct T obj = {0}; to free-then-NULL safety: p = NULL after free — no compiler stops accidental reuse, only discipline does.`,
      },
      {
        title: "Pointers to pointers, function pointers, and callbacks.",
        body: `int **pp points to a pointer to int — arrays of pointers (char *argv[]) decay to char **; ragged rows in C are arrays of pointers, each row malloc'd separately — that is how C expresses jagged 2D. Function pointers: int (*fp)(int, int) = &sum; fp(2,3) — parenthesis rule (*fp) matters (without parens, (int *fp)(int,int) would declare a function returning int*); typedef to tame syntax: typedef int (*BinOp)(int,int); — every GATE question on function pointers is this declaration or calling through it. void *callbacks (qsort(base, n, size, cmp)) — the generic callback pattern: the comparator reads raw bytes and returns int<0/=0/>0; the library never knows your type. One mistake common: forgetting to cast function to void (*)(void) loses the signature discipline; proper prototypes keep it safe.`,
      },
    ],
    worked: [
      {
        title: "Where does it live: static / stack / heap / text?",
        body: `char *s = "hold"; s[0] = 'H'; — text/rodata, undefined (segfaults). int x = 42; inside main — stack. static int y = 7; inside main — data segment (initialized data). char *t = malloc(8); — heap; string literal "hold" still lives in text; t points to heap. Global int z; — bss (zero-initialized data). GATE asks each of these five; the answer pattern is the region + one line why. The struct-of-arena example: static const array → rodata; const int → rodata or data depending on initialization (const static = rodata).`,
      },
      {
        title: "Row-major offset: a[2][4][6] of int.",
        body: `a is 2×4×6 ints; base address B; index a[i][j][k] at B + ((i*4 + j)*6 + k)*4 bytes. For a[1][2][3]: (1*4+2)*6+3 = 39 → B + 156 bytes. The formula generalizes: multiply stride per dimension — every GATE 3-D address question is this exact expansion; substitute element size and accumulate; done. Verification by spot-checking corner elements: a[0][0][0] = B, a[1][0][0] = B + 96 = B + (4*6)*4. ✓`,
      },
      {
        title: "The classic dangling pointer.",
        body: `int *f(void) { int x = 5; return &x; } int *p = f(); printf("%d", *p); — the function returned; the frame is gone; *p reads freed stack — undefined; prints garbage (looks like 5 on many machines, which is exactly why the test is careful — the answer is "indeterminate"/"undefined", never "5"). The one-line fix: return x by value (int f(void)) or malloc and let the caller free. Every interviewer and examiner has this question in their pocket.`,
      },
      {
        title: "qsort comparator by hand.",
        body: `int cmp(const void *a, const void *b) { const int *x = a, *y = b; return (*x > *y) - (*x < *y); } qsort(arr, n, sizeof(int), cmp); — returns negative/0/positive without branchy code; every comparator is this shape; ordering a struct by field: cast to const struct T *, subtract comparison results. GATE asks what the comparator must return and what qsort's guarantee is (non-decreasing, O(n log n) average, unstable). The face-value question is always: subtraction trick *x - *y overflows for INT range edge — the (a>b)-(a<b) idiom is overflow-safe; the exam occasionally asks precisely that.`,
      },
    ],
    exam: [
      {
        question: "What is the offset in bytes of a[2][1] in int a[4][3]?",
        answer:
          "(2*3 + 1) * 4 = 28 bytes from a. Row-major: all of row 0 (12 bytes) then row 1, then offset 1 element (4 bytes) into row 2 → 28. The row-major expansion is the mechanical procedure GATE wants demonstrated on paper.",
      },
      {
        question: "What does free(p) do to p itself?",
        answer:
          "Nothing to the variable p — p keeps its old (now dangling) address value; the block returns to the heap. Double-free or use-after-free later is undefined behavior; setting p = NULL after free removes the footgun. The exam asks what free does NOT do — answer: does not set p to NULL, does not clear the bytes.",
      },
      {
        question:
          "Given int arr[N], is sizeof(arr) == sizeof(&arr[0]) on a 64-bit system with N = 100?",
        answer:
          "No: sizeof(arr) = N * sizeof(int) = 400; sizeof(&arr[0]) = 8 (a pointer). This single contrast is the sharpest sizeof trap GATE produces, and it is verbatim across years.",
      },
      {
        question: "What does malloc(0) legally return?",
        answer:
          "Either NULL or a unique pointer that may be passed to free(), but not dereferenced — the standard permits both answers, so any exam answer is legal if it matches this sentence; the gotcha is candidates who swear it always returns NULL.",
      },
    ],
    cheat: [
      "arr decays to pointer; sizeof(arr) is the exception; &arr is pointer-to-array.",
      "p + 1 advances sizeof(*p); one-past-end legal to form, UB to dereference.",
      "Row-major: offset = (i*cols + j) * sizeof(T) — substitute, multiply, done.",
      "Stack = auto lifetime; data/bss = static; heap = malloc/calloc/free; text = rodata.",
      "malloc: check NULL; realloc: temp variable; free(NULL) safe; double-free = heap corruption.",
      "Function pointer: int (*fp)(int,int); qsort comparator returns negative/0/positive.",
      "String literals are const memory; assignment through their decay is UB.",
    ],
    recap: `Pointers and arrays are the arithmetic of the address space: typed slabs of memory, scaled arithmetic, row-major layout, three lifetime regions, and the allocator contract — because every C exam question about memory is this exact map wearing a disguise, the prepared candidate traces offsets on paper and the unprepared one guesses.`,
    code: {
      title: "Row-major address computation",
      language: "text",
      code: "addr(a[i][j]) = base + (i * ncols + j) * sizeof(elem_type)",
      explanation:
        "The one formula behind every 2-D address and stack-layout question in the module.",
    },
    diagram: {
      title: "Address space regions",
      caption: "Text, data, stack, heap — four regions, one pointer law.",
      mermaid: `flowchart LR\n  T[Text/rodata] --> D[Initialized data]\n  D --> B[BSS]\n  B --> H[Heap]\n  H --> S[Stack]`,
    },
  },
  "gate-cs-programming-and-data-structures-structs-unions-and-dynamic-allocation":
    {
      intro: `Structs, unions and dynamic memory allocation are the compound-type machinery of C: structs pack values into one object with member offsets and alignment padding, unions overlay members on the same bytes, and malloc/free hand you the heap — because GATE examines compound objects at byte granularity, the subject covers layout arithmetic, sizeof rules, and the discipline of allocating exactly what you consume.`,
      foundations: `A struct is laid out member-by-member: each member starts at an offset divisible by its alignment requirement (char = 1, short = 2, int/pointer = 4 on 32-bit, 8 on 64-bit targets); the struct's alignment is the max of members' alignments; the size rounds up to that maximum. Members in the same allocation may be separated by padding. A union sizes to its largest member; all members share the offset 0; reading one member's stored bytes as another (type punning) reinterprets the bytes — legal but implementation-defined at edges. Dynamic allocation: malloc(n) returns void* to n uninitialized bytes; calloc(n, size) zeroes them; realloc grows/shrinks preserving contents; free returns them. The malloc contract: success gives a pointer valid until free; failure returns NULL; freeing twice is corrupting the allocator's metadata — every debugging story starts with these four lines.`,
      concepts: [
        {
          title: "Struct layout, padding, and sizeof.",
          body: `struct { char c; int i; } — char occupies offset 0; int must start at offset divisible by 4; bytes 1-3 are padding; int at 4; struct alignment 4; size = offset 8 rounded to 4 = 8. Reordering members as int, char would give 4 + 1 → size 5 rounded to 8 (alignment 4)? No — 5 bytes rounds to 8 anyway. Rule: total size is the final rounded size — commonly 8 for both orders here, but for struct { char a; double b; char c; }: a at 0, pad to 8, b at 8, c at 16, size 24 with alignment 8; reorder c,b,a → 0, pad 8, 8, size 17→24. Padding is per-struct and invisible unless you printf offsetof — GATE loves asking for sizeof(struct) on different member orders — the members sort differently and the padding changes with them.`,
        },
        {
          title: "Alignment rules across platforms.",
          body: `Every type carries an alignment equal to its size for primitives (1,2,4,8 bytes) but not always: long double may align to 4 or 16; pointer = 8 on 64-bit, 4 on 32-bit; alignof/offsetof (stddef.h) reveal both — offsetof(struct T, member) gives exact bytes. Why padding exists: hardware reads aligned words in one cycle — misaligned access faults or crawls; the ABI dictates the rules so compilers, debuggers, and assembly all agree. The classic trap: packed structs annotated attribute((packed)) (gcc) squeeze members with no padding — every access may then be misaligned — fast for storage, slow for reads; GATE rarely tests attributes but the layout law is required knowledge.`,
        },
        {
          title: "Union semantics: overlay, not addition.",
          body: `union { int i; float f; char bytes[4]; } — one field at a time; bytes used: all three members start at offset 0; the union's size = max member rounded to the union's alignment; assigning u.i writes the int's bytes; reading u.f reinterprets those bytes as float bits — bit patterns for the same number differ (1 as int = 0x00000001; reinterpreted as float = 1.4 × 10^−45). Union punning is implementation-defined but universal (it is how every serialization layer works in C); legal type punning alternatives: memcpy(&dst, &src, sizeof src) — always safe, compiles to nothing. One union use: tagged unions — { int tag; union payload {...} u; } — the poor-man's enum + variant everywhere in embedded/protocols.`,
        },
        {
          title: "malloc/calloc/realloc/free: the contract in detail.",
          body: `void *malloc(size_t bytes) — returns zeroed? NO: malloc leaves bytes uninitialized (reading is indeterminate); calloc(n, size) zeroes (and checks multiplication overflow of n*size). void *realloc(void *p, size_t bytes) — copies contents to a new block and frees the old (when moving); returns NULL on failure leaving the ORIGINAL intact — writing realloc(p, n) into p unconditionally leaks on failure (never do it — temp pointer first). free(p) — p must be the original pointer (interior pointers UB); free(NULL) does nothing; freeing stack → heap metadata corruption; double free → allocator detects or corrupts silently. Track: every successful malloc gets exactly one free; every path through your function releases its own acquisitions — GATE asks which line frees, or which call leaks.`,
        },
        {
          title: "Linked lists with malloc: the eternal exercise.",
          body: `struct Node { int data; struct Node *next; }; — creation: struct Node *head = NULL; head = malloc(sizeof *head); — sizeof *head works without naming the type (the malloc idiom); assign fields; link head->next. Traversal: for (p = head; p; p = p->next) — p advances by next pointer; free each node after processing: save n = p->next first (free then lose the chain!). Insert at head: new node, new->next = head, head = new. The discipline: every malloc checked (\!p), every free followed by NULL or by a proof the pointer dies, every function owns its own allocations. The exam shows ten lines of list code and asks what the output is or where the leak is — pointer surgery line by line.`,
        },
      ],
      worked: [
        {
          title: "sizeof demo: order matters?",
          body: `struct A { int i; char c; }; struct B { char c; int i; }; — A: i at 0, c at 4, size 8 (align 4 → 1 byte + 3 pad). B: c at 0, pad 1-3, i at 4, size 8. Same size here! Try struct C { char c; short s; int i; }: 0, 2, 4, size 8. Reorder { short s; int i; char c; }: 0, 4, 8, size 12. The rule: members keep their declared order; the compiler only pads, never reorders (C never reorders members) — padding is the entire variable; every sizeof-difference question is an offsetof arithmetic exercise.`,
        },
        {
          title: "offsetof walk-through.",
          body: `offsetof(struct T, x) expands to ((size_t)&((struct T *)0)->x) — the compiler emits the offset directly from its layout table; print addresses minus base via cast: printf("%zu\n", (char *)&obj.x - (char *)&obj); for obj = { .i = 1, .c = 'a' } on struct A above: i → 0, c → 4. GATE asks offsetof or which address is stored where; both resolve by hand from member order and alignments.`,
        },
        {
          title: "Leak hunt: find the missing free.",
          body: `int *f(int n) { int *a = malloc(n * sizeof *a); if (!a) return NULL; for (...) a[i] = i; return a; } — who frees a? Caller. Leak pattern: returning malloc'd pointer is a contract — the caller must free; the most common leak is the caller forgetting; second: error path returns before free on partially built structures; third: realloc(p, n) overwriting p before checking NULL (original block pointer lost — true leak even though bytes still allocated). GATE shows a 10-line function and asks at which line memory leaks — the answer is always "the line where the only owning pointer goes out of scope un-freed".`,
        },
        {
          title: "Union printout.",
          body: `union U { int i; float f; } u; u.i = 0x40200000; printf("%f\n", u.f); — 0x40200000 is the IEEE bits for 2.5f (sign 0, exp 128, mantissa 1.01000...) → prints "2.5". The exercise is the whole point of unions: same bits, two lenses. GATE asks: given the bit pattern, what does the other member print — decode IEEE fields from hex, out come out. Every variant recycles the same three fields.`,
        },
      ],
      exam: [
        {
          question:
            "What is sizeof(struct { char c; double d; char e; }) on a 64-bit system?",
          answer:
            "24 — c at 0, pad 1–7, d at 8 (8-alignment), e at 16, total 17 rounded to 8-alignment = 24. The question is a pure padding exercise; the answer changes if members reorder.",
        },
        {
          question:
            "What does realloc return on failure, and what happens to the original block?",
          answer:
            "realloc returns NULL and the ORIGINAL block remains allocated and unchanged; the bytes you asked to grow stay as they were. Never assign realloc's return directly over your only pointer — store in a temporary, check, then replace.",
        },
        {
          question:
            "What is the legal range of bytes you can write through free()?",
          answer:
            "None — free takes no byte count; it consults the allocator's metadata for the block size attached at allocation time. Any mismatch (interior pointer, wrong block, half-size) corrupts adjacent metadata or faults in the allocator. malloc's bookkeeping is entirely implicit — that is why you must keep the pointer and never fabricate it.",
        },
        {
          question: "Why does union { char s[8]; int x; } size to 8?",
          answer:
            "All members share offset 0 — the union is the largest member's footprint (alignment included): char[8] = 8 bytes, int = 4 — union = 8. Members overlay one address space; writing x overwrites the first 4 bytes of s. Every union question is the max-member rule applied with alignment round-up.",
        },
      ],
      cheat: [
        "Struct size: member alignment, round up; sizeof never decreases elements; padding.",
        "Union size = max member (aligned); all members at offset 0; punning = reinterpret bits.",
        "malloc: bytes, uninitialized, check NULL; calloc: zeroed, n × size checked overflow.",
        "realloc: temp pointer, NULL → original intact; free(NULL) = no-op; double free = heap corruption.",
        "sizeof(struct T *) = pointer; sizeof(struct T) = full (padded) layout.",
        "offsetof(T, m) = byte offset of member m — print it to see padding reality.",
        "Tagged union { int tag; union {...} u; } = the universal C variant pattern.",
      ],
      recap: `Compound types are byte arithmetic: layout order fixed, padding negotiated with alignment, sizes rounded upward, unions overlaying the same bytes for free — while malloc/calloc/realloc/free contractually hand you the heap with three rules (check for NULL, free exactly what you took once, never write into freed memory) — because every sizeof and leak question on the exam is just these two contracts applied without ceremony.`,
      code: {
        title: "malloc/realloc safe pattern",
        language: "c",
        code: `int *p = malloc(n * sizeof *p);\nif (!p) return ENOMEM;\nint *q = realloc(p, 2 * n * sizeof *q);\nif (!q) { free(p); return ENOMEM; }\np = q;`,
        explanation:
          "Check, temp, replace — the three-step every safe realloc follows and the exam expects you to write.",
      },
      diagram: {
        title: "Struct padding timeline",
        caption:
          "Member order → offsets → alignment round-up — three passes, one number.",
        mermaid: `flowchart LR\n  A[Member 1 at offset 0] --> B[Member 2 at next aligned offset]\n  B --> C[...]\n  C --> D[Round total up to alignment]`,
      },
    },
  "gate-cs-programming-and-data-structures-recursion": {
    intro: `Recursion is the discipline of a problem solving itself by descent: a function that calls itself on a smaller subproblem, stops at a base case, and recombines results on the way back up. The subject covers the call-stack mechanics, how to design correct recursive programs, recursive types and backtracking, complexity of recursion trees, and the GATE-favorite questions: counting calls, tail-call depth, and tracing recursive code by hand.`,
    foundations: `Every recursive call pushes a new activation record on the stack: parameters, return address, saved registers, locals. Returns pop them in reverse order — strictly last-in first-out. Correct recursion needs two proofs: termination (each call strictly decreases a measure — a counter, a smaller input — and bottoms out at a base case the compiler can pin) and soundness (the helper assume/return contract: given correct answers for smaller inputs, the current combination is correct — induction). Depth = stack space; n recursive levels of constant-frame functions cost O(n) space. Tail calls: if the recursive call is the very last operation (return f(...)), the frame can be reused — but C does not mandate tail-call optimization (TCO), so even perfect tail recursion still costs frames on most compilers. Recursion enumerates spaces a loop cannot express: trees, subsets, permutations, backtracking searches — where branching logic, not iteration, expresses the search.`,
    concepts: [
      {
        title: "Anatomy of a recursive call: frames, return, and depth.",
        body: `int f(int n) { if (n <= 0) return 1; return n + f(n - 1); } — f(4) stack: f(4) → f(3) → f(2) → f(1) → f(0); f(0) returns 1; f(1) returns 1 + 1 = 2; f(2) returns 2 + 2 = 4; f(3) returns 3 + 4 = 7; f(4) returns 4 + 7 = 11. Sum = 1+2+3+4 + 1 = 11 = n(n+1)/2 + 1 — every trace multiplies frames identically; depth 5, each frame ~constant size, so memory = O(n). When GATE shows recursive code and asks for the return value, trace the stack explicitly — never in your head; write the frames on paper. The stack discipline also produces: recursion returns values in exactly reverse order of calls — every "what order does this print?" question reduces to tracing the reversal.`,
      },
      {
        title: "Designing recursion: base case and shrinking argument.",
        body: `The two-step method: (1) define the smallest case — the input for which the answer is known without recursion (n ≤ 0, empty list, single element); (2) define how to express f(n) in terms of f(strictly smaller) with an exact combination. Every correct recursive function passes the "shrink test": does each recursive invocation receive strictly less input (smaller n, shorter list, lowered bound)? Negate either and you get infinite descent (stack overflow) or a loop masquerading as recursion. Factorial: fact(n) = n * fact(n−1); fact(0) = 1. Fibonacci: fib(n) = fib(n−1) + fib(n−2) — overlapping subproblems, exponential time, memoize or DP; the exam asks complexity, not the value. Hanoi towers: hanoi(n, from, to, via) = hanoi(n−1, from, via, to); move one; hanoi(n−1, via, to, from) — O(2^n) moves, every GATE paper tests it once.`,
      },
      {
        title: "Recursion on data structures: linked lists and trees.",
        body: `Linked lists are recursive by nature: list = empty | node.next + tail — the code mirrors the type: void print(Node *p) { if (!p) return; printf("%d ", p->data); print(p->next); } — the recursion consumes the list (stack depth = length — for 100-node lists risky; for 10 fine). Tree recursion: void walk(Node *r) { if (!r) return; walk(r->left); visit(r); walk(r->right); } — every traversal (in/pre/post-order) is this exact frame with the visit placed in/inside/between the two calls; returning values: int height(Node *r) { if (!r) return 0; return 1 + max(height(r->left), height(r->right)); } — max is the combine; the whole subject fits in three templates. GATE asks for the output order or the count of recursive calls — count = 2×(nodes) − 1 (every node visited twice minus empty leaves).`,
      },
      {
        title: "Backtracking and subset enumeration.",
        body: `Backtracking = recursion over a decision tree: at each node, choose an option, recurse into the subtree, undo before the next option. The skeleton: void solve(state) { if (goal(state)) record(state); else for (choice : options(state)) { apply(choice); solve(state with choice); undo(choice); } } — subsets of {a,b,c}: choose/decline each element — 2^n leaves; permutations: 3! leaves; N-queens: prune branches when columns clash (pruning = exponential saved). GATE asks the number of nodes expanded for a given input or the order of solutions — trace the tree explicitly for n ≤ 4; formulae: subsets 2^n, permutations n!, with pruning dependent. The template is universal; only goal() and options() vary.`,
      },
      {
        title: "Complexity of recursion: trees and recurrences.",
        body: `Recursion cost = sum over nodes of the work per node — read it off the recursion tree. T(n) = 2T(n/2) + n → leaves n × O(1), internal levels log n × n each → Θ(n log n). T(n) = T(n−1) + 1 → depth n → Θ(n). T(n) = 2T(n/2) + 1 → geometric tree: 2^{i} nodes per level, log n levels → Θ(n). Naive Fibonacci T(n) = T(n−1) + T(n−2) + 1 → two trees barely overlapping at top, exponential — Θ(φ^n). Master theorem case check: compare f(n) to n^(log_b a). GATE asks one of: recurrence from code, complexity from recurrence, or (rarely) the exact count for tiny n — count via tree drawing, every time.`,
      },
    ],
    worked: [
      {
        title: "Trace f(5) with these exact values.",
        body: `int f(int n) { if (n < 2) return n; return f(n - 1) + 2 * f(n - 2); } — f(0)=0, f(1)=1; f(2)=f(1)+2f(0)=1; f(3)=f(2)+2f(1)=3; f(4)=f(3)+2f(2)=5; f(5)=f(4)+2f(3)=11. Calls count: f called 11 times? Count tree: C(n)=C(n−1)+C(n−2)+1 → C(0)=1, C(1)=1, C(2)=2, C(3)=4, C(4)=7, C(5)=12. GATE asks "how many times is f invoked" — 12. The habit: define C(n) alongside f(n) — always.`,
      },
      {
        title: "Depth of recursion for factorial.",
        body: `fact(10) → frames: 10,9,...,0 = 11 simultaneous live frames at deepest point (or 10 if counting only frames below main). Stack memory ≈ 11 × sizeof(frame) ≈ hundreds of bytes. GATE: "what is the space complexity" — O(n). The iterative version uses O(1). Every interviewer cares; every examiner asks one of these two forms.`,
      },
      {
        title: "Hanoi towers move count for n = 3.",
        body: `hanoi(3, A, C, B): move A→C stack of 2 (3 moves: A→C, A→B, C→B for disks 1,2 using B as helper... standard trace: 3 → A: diska→C, diskb→B, diska→B (disk1 → B via C? rule: move top disk only, onto empty or onto larger): moves: 1:A→C, 2:A→B, 1:C→B, 3:A→C, 1:B→A, 2:B→C, 1:A→C — 7 moves = 2^3 − 1 ✓. GATE asks moves for n disks: 2^n − 1 — the exponential is the entire point.`,
      },
      {
        title: "In-order traversal order print.",
        body: `Tree: root 4, left child 2 (with 1, 3), right 6 (5, 7). In-order: walk(left) → 2's subtree → 1, 2, 3; visit(4); right subtree → 5, 6, 7 → output 1 2 3 4 5 6 7. Pre-order: 4 2 1 3 6 5 7; post-order: 1 3 2 5 7 6 4. The GATE question: given the tree, print one order — or given two orders, reconstruct the tree (inorder + preorder is enough). The whole traversal subject is where the three templates live.`,
      },
    ],
    exam: [
      {
        question:
          "How many times is f called for f(4) where f calls itself with f(n-1) and f(n-2)?",
        answer:
          "9 times (C(n)=C(n-1)+C(n-2)+1 with C(0)=C(1)=1 → C(4)=9). Every such question is a count-tree walk or a recurrence — never trust mental math here; write the small tree.",
      },
      {
        question: "What is the space complexity of naive recursive Fibonacci?",
        answer:
          "O(n) stack space despite exponential time — depth equals the longest chain (fib(n) → fib(n-1) → ... → fib(0), depth n). The time/space contrast is exactly what GATE asks to make candidates conflate recursion depth with total calls.",
      },
      {
        question:
          "Is this tail-recursive: int f(int n) { return n <= 1 ? 1 : n * f(n - 1); }?",
        answer:
          "No — the recursive call is not the last operation; the multiply happens after it returns. A tail-recursive version accumulates: int f(int n, int acc) { return n <= 1 ? acc : f(n - 1, n * acc); } — in C, either version still consumes stack frames (no mandated TCO).",
      },
      {
        question: "What does in-order traversal of a BST yield?",
        answer:
          "Keys in sorted ascending order — left subtree fully, node, right subtree recursively. Every BST question in the exam banks on this property; validation questions (is-this-a-BST) are answered by carrying min/max bounds or in-order sequence checks.",
      },
    ],
    cheat: [
      "Two requirements: termination (measure strictly decreases) + soundness (combination inductive).",
      "One frame per call; O(n) depth; printing happens in reverse call order — trace with frames.",
      "C does not guarantee TCO — tail recursion still costs stack; iteration is free.",
      "Backtracking skeleton: choose, recurse, undo; prune branches = exponential saved.",
      "Recurrence from code; complexity from tree; C(n) = call count recurrence alongside f.",
      "Trees: 2×nodes − 1 calls; in-order BST = sorted; inorder+preorder ⇒ unique reconstruction.",
      "Hanoi = 2^n − 1 moves; Fibonacci naive = exponential time, linear space.",
    ],
    recap: `Recursion is divide-and-descend programming: a base case where the answer is known, a step where the answer is built from strictly smaller inputs, and a stack of frames carrying state upward — because the machine keeps your state for you, the correctness burden is the two proofs (termination, soundness), and the art is seeing the recursion tree before writing the code.`,
    code: {
      title: "Call-count recurrence alongside f",
      language: "c",
      code: `int f(int n) { if (n < 2) return n; return f(n-1) + 2*f(n-2); }\n/* C(n) = C(n-1) + C(n-2) + 1, C(0)=C(1)=1 */`,
      explanation:
        "Every GATE call-count question is just this pair of definitions walked to n.",
    },
    diagram: {
      title: "Recursion tree for Fibonacci",
      caption:
        "Work recomputes the same subproblems — the argument for memoization.",
      mermaid: `flowchart TD\n  F5["f(5)"] --> F4["f(4)"]\n  F5 --> F3["f(3)"]\n  F4 --> F3b["f(3) again"]\n  F4 --> F2["f(2)"]`,
    },
  },
  "gate-cs-programming-and-data-structures-stacks-queues-and-linked-lists": {
    intro: `Stacks, queues and linked lists are the three container disciplines every algorithm syllabus builds on: a stack enforces last-in first-out (LIFO), a queue first-in first-out (FIFO), and a linked list threads objects together with pointers so that insertion and deletion happen without ever shifting a byte. The subject covers the array and list implementations of both, the invariants that make them work, and the GATE staples: parenthesization and monotonic-stack problems, circular queues, and pointer-twiddling list surgery.`,
    foundations: `Stack operations: push, pop, top/peek, isEmpty — all O(1); array implementation: a[MAX], int top = -1 (empty); push: a[++top] = x; pop: return a[top--]; every GATE question demands this exact invariant. Queue: enqueue/dequeue/front — O(1) with circular buffers (rear and front advance modulo N, sacrificing one slot or tracking count to distinguish full from empty) or with two pointers on a linked list. Linked list: each node { value, next }; singly linked: O(1) insert/delete at head, O(n) at tail without tail pointer; doubly linked adds prev for O(1) delete given a node; circular variants join the end to the front. Common list pitfalls: losing the head reference, not saving next before free, off-by-one at NULL termination, confusion between empty list and list containing a zero value.`,
    concepts: [
      {
        title: "Stacks: LIFO and the parenthesization classic.",
        body: `A stack remembers nested state — the exact data structure matched to nested languages. Balanced-parentheses checker: scan; on opening push; on closing, pop and confirm type matches; at EOF, stack must be empty — ([{ mismatch = false, overflow = false, leftover = false — three failure modes, one algorithm. Postfix evaluation: push operands; on operator, pop b, pop a, push a⊕b; final stack holds the answer. Monotonic stack: maintain increasing/decreasing order by popping violators — solves next-greater-element, largest rectangle, asteroid collision in O(n). Browser history and function-call traces are stacks by construction — GATE asks to state the sequence of pops for a given op list; simulate mechanically with a diagram.`,
      },
      {
        title: "Queues and circular buffers.",
        body: `A queue serves arrivals in order — BFS layers it level by level; OS scheduling rounds through it; printer spooling is a queue. Array-backed: int q[N], front = 0, rear = 0; enqueue: q[rear] = x, rear = (rear+1) % N; full vs empty ambiguity: always sacrifice one slot (rear+1 ≡ front ⇒ full, front ≡ rear ⇒ empty) or track a count (n == N ⇒ full). Linked queue: maintain head and tail pointers, O(1) both ends; dequeue advances head, enqueue appends at tail. Deque: both ends O(1) — sliding-window maximum, palindrome checks. Priority queue is NOT a FIFO queue — it's heap-ordered; GATE loves contrasting queue semantics with heap semantics in one question.`,
      },
      {
        title: "Singly linked list surgery: insert, delete, reverse.",
        body: `Insert at head: new->next = head; head = new — O(1), always correct including empty list. Insert at tail: walk to last node — O(n); keep a tail pointer for O(1). Delete at head: tmp = head; head = head->next; free(tmp) — the classic three-liner; forgetting tmp before free loses the old head forever. Delete middle: walk with prev and cur; prev->next = cur->next; free(cur). Reverse: three pointers (prev = NULL, cur = head) — while (cur) { nxt = cur->next; cur->next = prev; prev = cur; cur = nxt; } head = prev — the canonical exam trace; draw every arrow for n = 4 and never reverse again by accident. Cycle detection: Floyd's hare-tortoise — fast/slow pointers, meet ⟹ loop; cycle entrance: reset one to head, advance both by 1 — they meet at entrance — the famous formula, GATE 1-maker.`,
      },
      {
        title: "Doubly linked lists and the predecessor advantage.",
        body: `{ value, prev, next } — deletion of an arbitrary node given its pointer is O(1): node->prev->next = node->next; node->next->prev = node->prev; — singly linked needs a scan for predecessor. LRU cache is a doubly linked list + hashmap: O(1) get/put with splice-out and splice-to-front — the canonical interview/exam hybrid. Cost: double the pointer memory, extra maintenance on both directions. GATE: why does DLL delete beat singly linked for arbitrary nodes? — no predecessor scan; the answer is always the same.`,
      },
      {
        title: "Array vs linked: the big constant-factor war.",
        body: `Arrays: contiguous, O(1) indexing, perfect cache locality, O(n) insertion/deletion (shifting); Linked: scattered, O(n) indexing, pointer-chasing cache misses, O(1) insertion/deletion at known positions. Arrays win for size-known-in-advance, scan-heavy work; lists for unknown size, frequent middle insertion with a cursor. The exam's choice question: "you need k lookups and m inserts at a cursor — array or list?" — count the costs; the answer is asymptotics, never vibes. Memory overhead: linked node = 2× pointer width per element; for tiny payloads, arrays dominate by overhead percentage alone.`,
      },
    ],
    worked: [
      {
        title: "Parenthesization trace: ((a+b)*[c]){d}.",
        body: `Scan: ( push → [(]; ( push → [(, (]; a,b operands; ) pop matches ( ✓ → [(]; + operand region; * operands; [ push → [(, []; c; ] pop matches [ ✓; ) pop matches ( ✓, stack empty at ) boundary; { push; d; } pop matches { ✓; EOF stack empty ⟹ balanced ✓. The algorithm reports success — every input with mixed bracket types is validated this way; failure = mismatched pop or leftover stack. The exam asks for "is balanced" or the failing character — identify it step by step.`,
      },
      {
        title: "Reverse a 4-node list by hand.",
        body: `1→2→3→4: prev=NULL, cur=1: nxt=2, 1.next=NULL, prev=1, cur=2. cur=2: nxt=3, 2.next=1, prev=2, cur=3. cur=3: nxt=4, 3.next=2, prev=3, cur=4. cur=4: nxt=NULL, 4.next=3, prev=4, cur=NULL. Final: 4→3→2→1. The three-pointer walk is written once on paper for n=4 and never mistyped again; the exam walks through exactly this trace for n=4.`,
      },
      {
        title: "Circular queue fill and wrap.",
        body: `N = 5; enqueue 1..4 fills slots 0..3; front = 0, rear = 4; enqueue 5: slot 4 (rear=4), rear = 0; full-condition (rear+1 ≡ front mod 5) — rear+1 = 1 ≠ 0 now, not full (sacrifice-slot rule). dequeue: q[0] = 1, front = 1; enqueue 6: slot 0 is free ✓ (front=1, rear=1 — rear+1≡front? 2≡1 no — still has room) ... wait rear=0: enqueue at slot 0, rear becomes 1, rear+1=2 ≠ front=1 ✓ not full. The arithmetic never lies; the exam gives the sequence and asks which index holds the last enqueued item.`,
      },
      {
        title: "Monotonic stack: next greater element [2 1 4 3 5].",
        body: `Push 2; push 1 (top>1 ok); 4: pop 1 → NGE(1)=4, pop 2 → NGE(2)=4; push 4; 3: push; 5: pop 3 → NGE(3)=5, pop 4 → NGE(4)=5; push 5; end — remaining: 5→-1 (none greater). Output: [4,4,5,5,-1]. The whole technique: every element popped answers a query; the stack stays decreasing; O(n). GATE asks for the output array — mechanical pop-fill with a written stack.`,
      },
    ],
    exam: [
      {
        question:
          "What is the time complexity of deleting an arbitrary node from a singly linked list given only its pointer?",
        answer:
          "O(n) — you must walk from the head to find the predecessor (unlike doubly linked, which is O(1)). The question tests the fundamental gap between DLL and SLL — the reason LRU implementations always choose DLL.",
      },
      {
        question:
          "How do you distinguish a full from an empty circular queue without wasting a slot?",
        answer:
          "Keep a separate counter of occupancy (n): queue full iff n == N, empty iff n == 0 — or sacrifice one slot (full iff (rear+1) % N == front, empty iff front == rear). GATE accepts either; the count approach avoids the wasted slot every time.",
      },
      {
        question:
          "What does Floyd's algorithm detect and how does it find the cycle entrance?",
        answer:
          "It detects whether a cycle exists (fast/slow pointers meet inside the loop), and the entrance is found by resetting one pointer to head and advancing both one step at a time — their meeting point is the cycle's first node. Every part of this sentence has appeared on a GATE exam.",
      },
      {
        question: "Prefix/postfix: evaluate 3 4 + 5 *.",
        answer:
          "15 — push 3, push 4, '+' pops both, push 7; push 5; '*' pops 5 and 7 → 35. Wait: 7*5 = 35, not 15. Reread the string: 3 4 + 5 * = (3+4)*5 = 35. GATE's entire point is tracing operator precedence faithfully; the stack keeps the parenthesization for free.",
      },
    ],
    cheat: [
      "Stack: push/pop/top O(1); array top=-1 empty; LIFO nesting = brackets/frames/paths.",
      "Queue: FIFO; circular buffer rear=(rear+1)%N; sacrifice slot or count for full/empty.",
      "DLL: O(1) delete-given-node; SLL: O(n) for same; LRU = DLL + hash map.",
      "List surgery rule: save next before free; check head==NULL everywhere.",
      "Floyd cycle detection: hare/tortoise; meet, reset, walk, meet = entrance.",
      "Monotonic stack: decreasing stack answers next-greater in O(n); every pop is an answer.",
      "Array: cache-friendly O(1) index; linked: O(1) insert/delete at cursor, worse locality.",
    ],
    recap: `Stacks remember nesting, queues keep order, lists morph in place — because every nested or sequential structure the computer holds obeys one of these three disciplines, the algorithms built on them (parsing, BFS, undo, dependency resolution) become libraries you recognize on sight instead of puzzles you improvise.`,
    code: {
      title: "Reverse list in place",
      language: "c",
      code: `Node *p = head, *prev = NULL;\nwhile (p) { Node *n = p->next; p->next = prev; prev = p; p = n; }\nhead = prev;`,
      explanation:
        "Five lines, every arrow accounted for — the universal SLL reversal.",
    },
    diagram: {
      title: "Stack discipline",
      caption:
        "Push right, pop right — the LIFO invariant that parses every nested language.",
      mermaid: `flowchart LR\n  P[push] --> S[Top]\n  S --> O[pop]`,
    },
  },
  "gate-cs-programming-and-data-structures-trees-and-binary-search-trees": {
    intro: `Trees and binary search trees organize keys so that search, insert, and delete all run in logarithmic time — provided the tree stays balanced, which is where the difficulty lives. The subject covers traversals and their exact orders, the BST invariant, height and balance, search/insert/delete mechanics including the three deletion cases, and the complexity contract every exam expects you to state without hesitation.`,
    foundations: `A binary tree is either empty or a node with a left and a right subtree — recursion all the way down. A binary search tree imposes the invariant: every key in the left subtree is less than the node key, and every key in the right subtree is greater. Traversals: in-order (L, node, R) — yields sorted order from a BST; pre-order (node, L, R) — serialization from the root; post-order (L, R, node) — deletion/evaluation order; level-order (BFS) — row by row. Height h: number of edges on the longest root→leaf path; balanced tree n nodes → h = Θ(log n); degenerate chain h = n−1. AVL: |h_left − h_right| ≤ 1 maintained by rotations; red-black: no path more than 2× longest, n-level amortized O(log n) with cheaper rotations than AVL. Delete in a BST: three cases — no children (remove), one child (splice), two children (replace with in-order successor — min of right subtree).`,
    concepts: [
      {
        title: "Traversals: what prints when.",
        body: `In-order: left subtree fully → node → right subtree; on a BST yields ascending order; every BST validation is an in-order sweep with (min,max) bounds. Pre-order: node first — used to copy trees and to derive prefix expressions; post-order: children before node — used to free memory and to evaluate postfix; level-order: queue, visit each level — used for breadth-first rendering, heap printing, and find-if-exists-in-depth. GATE asks either order-of-output questions or count-of-recursive-calls on a given tree (in-order and level-order both = n calls each plus n+1 empty returns — just count). The two-derivation question: given inorder and preorder lists, reconstruct the tree — always possible, always unique — the algorithm: pop preorder for root, split inorder at that root, recurse both halves.`,
      },
      {
        title: "BST search, insert, and the shape guarantee.",
        body: `Search: compare with node; less → left; greater → right; equal → found; NULL → absent; h comparisons worst-case — Θ(log n) balanced, Θ(n) degenerate (sorted insertions make a chain). Insert: walk to the NULL spot, attach as leaf — same path length; tree grows downward. The invariant does the work: no rebalancing happens in plain BST — the exam always asks what happens after 1,2,3,4,5 inserted in order (a rightward chain, h = 4) and what AVL would do differently (rotate left on the way, Θ(log n) height). Every GATE tree question carries this lesson: plain BST is untrusted unless inserted randomly or balanced.`,
      },
      {
        title: "AVL: rotations and balance factor.",
        body: `AVL tracks balance factor bf = h(left) − h(right) ∈ {−1,0,1}; violation at bf = ±2 triggers rotation. Four cases: left-left (right rotate), left-right (left-right double), right-left, right-right (left rotate). Rotations preserve in-order and fix height by one level — every AVL paper question: given a sequence, draw the tree after insertion k — execute the insert, detect bf, rotate, redraw; count rotations. Deletion may trigger rotations up the path. AVL = strictly balanced (h ≤ 1.44 log n), search-fast; red-black = loosely balanced (h ≤ 2 log n), write-fast — every DBMS index in the wild is red-black for insert/delete cost; every read-mostly map picks AVL. GATE loves comparing them in one breath: "AVL guarantees h ≤ 1.44 lg(n+2) — red-black guarantees h ≤ 2 lg(n+1)".`,
      },
      {
        title: "Deletion: the three cases with a full trace.",
        body: `Delete node z with key k from BST T. Case 1 — no children: splice z out (set parent's pointer NULL). Case 2 — one child (L or R): replace z with that child in the parent link; free z. Case 3 — two children: find successor s = min of right subtree (leftmost of z's right — one pointer walk down); copy s's key into z; delete s (s has at most one child — right child only, by minimality — case 2 applies recursively); freeing s after copying. The subtle rule: never free a node still linked; never traverse into freed memory; the parent handles the last link. GATE trace: delete 20 from a sample tree — walk the three cases, verify the in-order sequence unchanged: the single correctness check they all pass is that in-order output is preserved.`,
      },
      {
        title: "Height, nodes, and asymptotics by hand.",
        body: `Full complete binary tree with h levels: 2^(h+1) − 1 nodes (levels counted from 0: levels 0..h → sum = 2^(h+1) − 1); n nodes ⇒ h = Θ(log n). Degenerate chain: n nodes ⇒ h = n−1. Insert k keys randomly ⇒ expected height ≈ 2.99 log n — the reason plain BST is "fine in expectation, terrible in adversary". GATE: "a BST has 1000 nodes, worst-case height?" → 999; "best case?" → 9 (2^{10} = 1024) ; "expected with random insert" → ~log₂ 1000 ≈ 10 (up to constant). The three-number answer triad shows up on nearly every paper.`,
      },
    ],
    worked: [
      {
        title: "In-order reconstruction from lists.",
        body: `Inorder: D B E A F C; preorder: A B D E C F. Root = A (first of preorder). Split inorder at A: left = D B E, right = F C. Preorder for left subtree = B D E → root B; B's inorder D B E → left D, right E. Preorder right = C F → root C; inorder F C → right F. Final: A; A.left = B (B.left = D, B.right = E); A.right = C (C.right = F). The exam wants the tree drawn; this exact algorithm. 30 seconds once rehearsed.`,
      },
      {
        title: "AVL insertion trace: insert 5, 3, 8, 1, 4, 7, 9.",
        body: `5 → root. 3 → left. 8 → right (balanced). 1 → left of 3 (fine). Insert 4: 4 > 3 → right of 3; now node 3 balance = h(L)=1... h(R)=1 balanced ✓. Insert 7: 7 < 8, left of 8; fine. Insert 9: 9 > 8 → right of 8; node 8 h(L)=1, h(R)=1 ✓; root 5 h(L)=2, h(R)=2 ✓. Tree remains AVL with no rotations — lucky sequence; the exam flips one insertion order to force a rotation; trace both, know the shape.`,
      },
      {
        title: "Delete 8 from this BST.",
        body: `Tree: 5 root, left 3 (1,4), right 8 (7, 9). Delete 8 — two children case: successor of 8 = min of right subtree (9's subtree is just 9 — 9 has no left child → successor = 9). Copy 9 into the node formerly 8 (value becomes 9, still rooted right of 5); delete old 9 (leaf — case 1). Result tree in-order: 1 3 4 5 7 9 — unchanged before removal (8 removed, 9 promoted) ✓. The certification test every tree question must pass: in-order unchanged except the deleted key.`,
      },
      {
        title: "Count of recursive calls in traversal.",
        body: `For a tree with n internal nodes and n+1 conceptual empty leaves, every traversal template (in/pre/post) performs 2n+1 calls total (each call either returns immediately on NULL or recurses into both children, visiting itself and empty pointers). Level-order BFS visits n nodes exactly once (n calls). GATE asks "how many times is the traversal function invoked" — 2n+1 for DFS templates — every time, without exception.`,
      },
    ],
    exam: [
      {
        question: "What does in-order traversal of a BST always produce?",
        answer:
          "Ascending sorted sequence — the left subtree fully, the node, the right subtree, recursively. This is THE one property with infinite reuse on these exams.",
      },
      {
        question:
          "What is the worst-case height of a BST built by inserting n sorted keys with no balancing?",
        answer:
          "n − 1 — a rightward chain (every insert descends to the only available leaf slot). The exam asks this exactly half the time; also its cousin: average-case with random keys ≈ 2.99 lg n; balanced AVL caps at 1.44 lg(n+2).",
      },
      {
        question:
          "Describe the three cases of BST deletion in order of complexity.",
        answer:
          "Leaf: splice out; one child: splice in the child; two children: promote the in-order successor (min of right subtree) into the deleted node and delete the successor by the one-child rule. The successor can never have two children — it is the leftmost of its subtree, so it has no left child.",
      },
      {
        question:
          "Given in-order D B E A F C and pre-order A B D E C F, reconstruct the tree root.",
        answer:
          "Root = A (first in pre-order). Left subtree = nodes D B E (in-order before A); right = F C. Recursing: left root B (first of pre-order restricted to the left); right root C. Unique tree every time this pair of orders is given — in-order + pre-order is a complete specification.",
      },
    ],
    cheat: [
      "In-order on BST = sorted; pre-order = root-first copy; post-order = children-first destroy.",
      "Insert n sorted keys into plain BST = chain, h = n−1; AVL caps 1.44 lg n.",
      "BF(n) = h(L) − h(R); violation at ±2; four rotation cases restore it.",
      "Delete: leaf splice; one child link; two children → successor copy, successor delete.",
      "2n+1 recursive calls for any DFS traversal on a tree with n internal nodes.",
      "Inorder+preorder unique tree; inorder alone does not uniquely determine it.",
      "n nodes best case h = ⌈lg(n+1)⌉ − 1; worst n−1; expected random ≈ 2.99 lg n.",
    ],
    recap: `Trees give every key its position in a hierarchy: the BST invariant directs every search to a single path, the traversals enumerate the hierarchy in fixed orders, and balancing restores the logarithmic contract when inserts conspire against it — because every tree question on the exam asks which of these three properties you actually noticed.`,
    code: {
      title: "In-order rebuild",
      language: "text",
      code: "root = first(preorder); left_inorder = split_at(root, inorder); right_inorder = rest; recurse(left); recurse(right)",
      explanation:
        "The complete reconstruction algorithm in one line — GATE draws this from a sketch.",
    },
    diagram: {
      title: "BST search path",
      caption:
        "One path, halved space each step — the Θ(log n) whisper every tree interview asks for.",
      mermaid: `flowchart TD\n  R[Root: 5] --> L{key < 5?}\n  L -->|yes| Left[Left subtree]\n  L -->|no| Right[Right subtree]`,
    },
  },
  "gate-cs-programming-and-data-structures-heaps-and-priority-queues": {
    intro: `Heaps and priority queues organize by priority rather than key order: the highest- or lowest-priority element sits at the root, and dequeue always yields it — in O(log n), guaranteed, every time. The subject covers the array-mapped complete binary tree, the heap invariant, build-heap, extract/insert operations, heap sort, and the exam's perennial comparisons: heap versus sorted array, heap versus balanced BST, heap versus Fibonacci heap.`,
    foundations: `A binary (min|max)-heap is a complete binary tree (every level full except possibly the last, filled left to right) satisfying parent ≤ children (min-heap) or ≥ (max-heap). Array mapping with index 0: children of i are 2i+1 and 2i+2; parent is (i−1)/2; leaves are the second half of the array — the one fact every GATE question tests. Operations: insert — append at the end, sift up (bubble up) until parent ≤ child ok; extract-min — swap root with last element, shrink, sift down; peek min — array[0] O(1). Build-heap from array: bottom-up sift-down from (n/2 − 1) to 0 — Θ(n) total, not Θ(n log n) (the exam loves this). Heap sort: build max-heap, swap root with last, shrink, sift down repeatedly — Θ(n log n) in-place-ish, comparison sort, unstable. Priority queue = heap — supports enqueue/dequeue O(log n); specialized: d-ary heaps, Fibonacci heaps (dequeue/decrease-key O(1) amortized/O(log n) — Dijkstra's speed-up).`,
    concepts: [
      {
        title: "Array mapping: parent, children, heapify, and the index law.",
        body: `int h[N]; int n = 0; — heap size separate from array capacity. Children of index i: 2i+1, 2i+2; parent (i−1)/2 — every GATE question hands you one of these three; memorize cold. Leaves live at indices floor(n/2) onward (n/2 to n−1) — heapify starts at index (n/2 − 1) and works down to 0, calling sift-down on each — each subtree is heapified bottom-up so the invariant holds everywhere when we reach the root. Sift-down: compare with both children, swap with the smaller (min-heap), repeat — depth ≤ h = Θ(log n). Sift-up: compare with parent, swap while smaller — depth Θ(log n) worst. GATE asks for the array map after k inserts — write n and the mapping, simulate; never guess.`,
      },
      {
        title: "Extract-min and insert: full traces.",
        body: `Insert 9 into heap after {3, 7, 10, 12, 18, 24}: append 9 at index 6 → [3,7,10,12,18,24,9]; parent(6) = 2 → 10 > 9 → swap → [3,7,9,12,18,24,10]; parent(2) = 0 → 3 < 9 stop. Result [3,7,9,...]. Extract-min from heap [1,4,7,9,11,13,24]: min = 1; replace root with last (24), shrink to 6 elements → [24,4,7,9,11,13]; sift-down: children 4,7 → smaller is 4; swap → [4,24,7,9,11,13]; children of 1: 9,11 → smaller 9; swap → [4,9,7,24,11,13]; children of 3: 24,11? index 3 = 24, children 7,8 — none; stop. Result [4,9,7,24,11,13]. GATE asks for the array after extract — simulate pointer to pointer, every time.`,
      },
      {
        title: "Build-heap in Θ(n): why the sum wins.",
        body: `Insert n elements one at a time = Θ(n log n). Bottom-up heapify is Θ(n): each level does work proportional to its height — number of nodes at height k is ≈ n/2^(k+1), work per node = k, sum k·n/2^(k+1) over k = Θ(n) by the geometric series identity. Every GATE paper asks: "time to build a heap from an unsorted array?" — answer: Θ(n). The exam's companion question: "why is it not Θ(n log n)?" — answer: because most nodes are near the leaves with tiny heights; the sum telescopes. Know this one cold — it is free marks.`,
      },
      {
        title: "Heap sort and the n log n guarantee.",
        body: `Build max-heap (Θ(n)); repeatedly swap root (max) with last index n−1, shrink heap by one, sift-down from root — every extraction is Θ(log n), n extractions = Θ(n log n); the swapped region at the end is the sorted tail — in-place, no auxiliary array, comparison sort. Unstable (sifts leapfrog each other). Every sorting algorithm exam asks its stability and worst-case: heapsort = unstable, Θ(n log n) every case — precisely why library sorts prefer introsort (quick+insert+heap). GATE: "which of the given is in-place and guaranteed n log n?" → heapsort — the usual answer intended.`,
      },
      {
        title: "Priority queue patterns: K largest, merge K lists, median.",
        body: `K largest from stream: keep a min-heap of size k — O(n log k), space k. Merging k sorted lists: heap of (head pointer, value), pop min, push next from same list — O(n log k). Median from stream: two heaps (max-heap lower half, min-heap upper half) balanced ±1 — O(log n) per insert, O(1) median. Every "design a data structure" GATE question this decade recycles one of these three patterns. Know the heap as the universal priority machine — any task "always give me the smallest unprocessed item" is one.`,
      },
    ],
    worked: [
      {
        title: "Build heap [4 1 3 2 16 9 10] from bottom up.",
        body: `n = 7; start at index 2 (value 3): children idx 5 (9), idx 6 (10) → 3 ≤ 9 fine. Index 1 (value 1): children idx 3 (2), idx 4 (16) → min 1, fine. Index 0 (value 4): children idx 1 (1), idx 2 (3) → min 1; swap with idx 1 → [1,4,3,2,16,9,10]; continue sift-down at idx 1: children idx 3 (2), idx 4 (16) → min 2; swap 4 and 2 → [1,2,3,4,16,9,10]; children of idx 3: idx 7 — beyond n → stop. Min-heap built in Θ(n) ✓. GATE asks for the final array; this exact trace sequence.`,
      },
      {
        title: "Extract two mins from heap [1 2 3 4 16 9 10].",
        body: `Extract 1: root = last (10), n = 6 → [10,2,3,4,16,9]; sift-down: min(2,3)=2 (idx1) swap → [2,10,3,4,16,9]; children of idx1: idx3 (4), idx4 (16) → min 4 swap → [2,4,3,10,16,9]; idx3 children idx7 — stop. Result [2,4,3,10,16,9]. Extract 2: root = last (9) → [9,4,3,10,16]; sift-down: min(4,3)=3 swap → [3,4,9,10,16]; children of idx2: idx5 — beyond 5? n=5 → idx5 invalid → stop. Result [3,4,9,10,16]. The two-step trace is the entire skill the exam tests.`,
      },
      {
        title: "Heapsort pass — swap positions 0 and n−1.",
        body: `Max-heap [9,8,6,4,2,7,5,1]: swap idx 0 (9) with idx 7 (1) → [1,8,6,4,2,7,5,9] (sorted tail [9]); sift-down root: 1→ children 8,6 → swap 8 → [8,1,6,4,2,7,5,9]; idx 1 (1): children idx 3 (4), idx 4 (2) → swap 4 → [8,4,6,1,2,7,5,9]; idx 3 (1): children idx 7 (5→now beyond new n=7) invalid → stop. Continue swapping idx 0 with idx 6 next... every pass places one element in the tail. Final: ascending — the Θ(n log n) certificate behind the words "in-place sort".`,
      },
      {
        title: "K largest from [3,1,4,1,5,9,2,6], k = 3.",
        body: `Min-heap eery: insert 3,1,4 → [1,3,4]; insert 1 → full, pop replaces root? Algorithm: keep size k; push 1 → [1,3,4,1]? Implementation: maintain heap size k with pop when size exceeds k. Stream: push 3,1,4 → heap {1,3,4}; next 1 → size 3+1 → pop min (1) → {1,3,4} (same); push 5 → pop min(1) → {3,4,5}; push 9 → pop min(3) → {4,5,9}; push 2 → pop min(4) → {2,5,9}? pop removes min=4 from {4,5,9,2} = {2,5,9} — wait: push 2 → {2,4,5,9}, pop min → {4,5,9}; push 6 → push {4,5,9,6} → pop min(4) → {5,6,9}. K largest = [5,6,9] ✓. The pattern: O(n log k) always beats O(n log n) for k ≪ n.`,
      },
    ],
    exam: [
      {
        question:
          "What is the time to build a min-heap from an unsorted array of n elements using bottom-up heapify?",
        answer:
          "Θ(n) — the geometric series of per-level work sums to a constant times n (number of nodes at height h is n/2^(h+1), work per node is h, total is Θ(n)). The naive insert-at-a-time approach costs Θ(n log n); knowing which is which is the entire exam point.",
      },
      {
        question:
          "What are the child index formulas in a zero-based binary heap?",
        answer:
          "Children of i: 2i+1 (left), 2i+2 (right); parent: (i−1)/2. Every heap question is one hop away from these three lines — memorize them or lose the mark.",
      },
      {
        question:
          "Why is heapsort typically slower than quicksort in practice?",
        answer:
          "Poor cache behavior and constant factor — heap accesses jump around memory (parent↔child hops) with terrible locality, whereas quicksort scans contiguously; heapsort is in-place and has guaranteed O(n log n), which is why introsort uses it as the fallback inside quicksort rather than as the primary.",
      },
      {
        question:
          "What does extract-min/pop do to the heap structure before returning the minimum?",
        answer:
          "It moves the LAST element to the root, shrinks the heap by one, and sifts that root down (swap with smaller child, repeat) until the invariant holds — Θ(log n) every call. The two moves (swap with last, sift-down) are the complete answer; forgetting the sift-down leaves the heap corrupt.",
      },
    ],
    cheat: [
      "Children of i: 2i+1, 2i+2; parent (i−1)/2; leaves start at index ⌊n/2⌋.",
      "Peek min = array[0] O(1); insert = append + sift-up; extract-min = swap-with-last + sift-down.",
      "Bottom-up heapify = Θ(n) (not Θ(n log n)) via geometric series over heights.",
      "Heap sort: build max-heap, extract max to tail, sift-down — Θ(n log n), unstable, in-place.",
      "K largest in a stream: size-k min-heap — O(n log k).",
      "Two heaps (max lower half, min upper half) track a running median FEO(1).",
      "Heap ≠ BST: priority order only, search for arbitrary keys is Θ(n).",
    ],
    recap: `Heaps encode priority as near-order in an array-shaped complete binary tree: root always wins, extraction costs one path to the leaf, construction from scratch costs linear time — because the exam knows you know the index formulas, it tests whether you saw the Θ(n) heapify and the sift directions before touching the keyboard.`,
    code: {
      title: "Sift-down pseudocode",
      language: "text",
      code: "while child <= n: pick smaller child; if child < node swap; else break; node = child",
      explanation:
        "The entire extract-min tail in four lines — the exam's favorite trace.",
    },
    diagram: {
      title: "Heap as array",
      caption:
        "Levels fill left-to-right; index teleportation replaces pointer chasing.",
      mermaid: `flowchart LR\n  A[Array slots] --> B[Implicit complete tree]`,
    },
  },
  "gate-cs-programming-and-data-structures-hashing": {
    intro: `Hashing turns keys into direct addresses: a hash function spreads keys across an index range, buckets hold the overflow, and average O(1) lookup, insert, and delete become not just possible but universal — because GATE examines the one subject where collisions are more important than keys, the material covers hash functions, collision resolution (chaining and open addressing), load factor, rehashing, and deletion semantics.`,
    foundations: `A hash table: array of size m; hash function h: key → [0, m) — integer keys: h(k) = k mod m (bad if m power of 2 and keys share low bits) or k * 2654435761 mod 2^32 (Knuth multiplicative); strings: polynomial rolling hash (Σ c_i × p^i mod m) — collisions bound by size vs population. Collision resolution: chaining — each slot holds a linked list (or dynamic array) of colliding keys; open addressing — collisions probe alternate slots: linear probing (h + i), quadratic (h + i²), double hashing (h + i·h2(k)). Load factor α = n/m; chaining average probes ≈ 1 + α/2 (unsuccessful 1 + α); open addressing degenerates as α → 1 (linear probing: successful ≈ ½(1 + 1/(1−α)), unsuccessful ≈ ½(1 + 1/(1−α)²)). Rehash (resize m, rebuild) when α exceeds threshold (usually 0.7–0.75). Deletion with open addressing requires tombstones — empty alone breaks probe chains.`,
    concepts: [
      {
        title: "Hash functions: division, multiplication, polynomial.",
        body: `Division h(k) = k mod m — simplest; choose m odd or prime to spread residues; bad when keys have common factors with m. Multiplication h(k) = floor(m · frac(k·A)), A = (√5 − 1)/2 ≈ 0.618 (Knuth) — order-independent, strong for sequential keys. Strings: polynomial hash h = (s[0]·p^{L−1} + s[1]·p^{L−2} + ... + s[L−1]) mod p (Rabin–Karp) — rolling hash update in O(1) per window slide; p = 31/37/911 prime choices dominate exam questions; modulo large primes (10^9+7) for adversarial robustness. GATE asks: compute h for a short string with given coefficients and modulus — plug in and compute, never guess. Also: k mod 2^w on signed ranges — negative keys wrap (mod of negative is negative in C!) — every examination of C hashing paper wants (k % m + m) % m.
`,
      },
      {
        title: "Chaining: lists in every bucket.",
        body: `Each of m slots holds a head pointer (NULL initially). Insert: compute index, walk bucket list, prepend (O(1) with head insertion — duplicates policy up to you). Search: hash → walk that one list only. Expected bucket length = α; with α ≤ 1, expected probes ≤ 2. Deletion: unlink with predecessor tracking (or sentinel head). Chaining tolerates α > 1 gracefully — grows linearly, never needs resizing for correctness (only performance). GATE asks: average search cost in a chained table (answer: O(1 + α)), and what happens with keys mapping to one bucket (O(n) — the degenerate exam case).`,
      },
      {
        title: "Open addressing: probing and cascading.",
        body: `Insert: probe h(k), h(k)+1, h(k)+2, ... (linear) until empty slot; linear probing clusters — long runs of occupied slots degrade everyone after the cluster grows; quadratic probes h + i² break primary clustering but not secondary; double hashing h + i·g(k) uses a second independent hash for step size — near-random spread, no clustering in practice. Every insertion may probe the whole table in the worst case — empty slots required or infinite loop; deleted slots must be tombstones (a marked occupied-but-dead sentinel) for correct probe termination. GATE: trace insert sequence for keys into a table of size m — simulate probe walks exactly as examined; cluster questions ask "which slots are now clustered" — write them.
`,
      },
      {
        title: "Deletion and tombstones.",
        body: `Chaining: unlink node — done cleanly. Open addressing: you cannot simply mark EMPTY — searches rely on CONTIGUITY from h(k); every slot between h(k) and a found key is probed in order, and an EMPTY in between means "key not present" — a tombstone (DELETED sentinel) must instead mark the slot as occupied-for-probing but void-for-data; searches skip tombstones but continue; inserts may reuse tombstones. Tombstones accumulate — beyond a density threshold rehash removes them entirely. GATE asks precisely this: "why can't you just mark the slot empty after deletion?" — answer is the probe-chain argument above, in one or two sentences.
`,
      },
      {
        title: "Load factor, rehashing, and the resize contract.",
        body: `α = n/m — the dial on everything: chained expected probes saturates at 1 + α/2; open addressing rises steeply as α → 1 (linear: ≈ ½(1+1/(1−α)²)). Rehash: allocate 2m table, recompute every key's index (hash functions don't rescale — they re-modulate), free old. Cost amortizes — like doubling arrays — O(1) amortized per insert; never shrinks (hysteresis). GATE: "when should you rehash" (α > 0.7 for open addressing; any α for chaining works up to large factors) and "how much does rehashing cost" (Θ(n) work each doubling; amortized O(1)). The exam loves the doubling argument for amortization.
`,
      },
    ],
    worked: [
      {
        title: "CHAINED: h(k) = k mod 7, insert 37, 21, 30, 14, 25, 32, 18.",
        body: `37 mod 7 = 2; 21 mod 7 = 0; 30 mod 7 = 2 (bucket 2: 37→30 prepended as list 30→37); 14 mod 7 = 0 (0: 21→14... prepend 14: 14→21); 25 mod 7 = 4; 32 mod 7 = 4 (4: 25→32 → prepend 32: 32→25); 18 mod 7 = 4 (4: prepend 18 → 18→32→25). Table: 0:[14,21], 2:[30,37], 4:[18,32,25]; search 32: bucket 4, walk 18,32 — found in 2 probes; delete 32: bucket 4 becomes [18,25] (order changes). The exam wants the final table layout — straight simulation.
`,
      },
      {
        title:
          "OPEN (linear probe): h(k) = k mod 7, insert 37, 21, 30, 14, 25, 32, 18.",
        body: `37 → 2; 21 → 0; 30 → 2, occupied by 37 → probe 3 (empty) place at 3; 14 → 0 occupied → 1 (empty) place; 25 → 4 (empty) place; 32 → 4 occupied → 5 (empty) place; 18 → 4 occupied → 5 occupied → 6 (empty) place. Final: 0:21, 1:14, 2:37, 3:30, 4:25, 5:32, 6:18. Search 32: 4 occupied(≠32), 5 → found. Search 19: 4 occupied, 5 occupied, 6 occupied, 0 occupied, 1 occupied, 0... probes cycle mod 7 — all full, 0 slots free? Table full (7 keys, 7 slots) — search for absent key must probe forever without an empty? With all-full table, termination requires recognizing full-table condition — the exam includes this edge case exactly to test that point.
`,
      },
      {
        title: "Polynomial hash of 'cat', p = 31, mod 101.",
        body: `c=99, a=97, t=116. h = 99·31² + 97·31 + 116 = 99·961 + 3007 + 116 = 95139 + 3123 = 98262; mod 101: 101*972 = 98172 → 98262 − 98172 = 90. GATE asks for the number given a formula once — the answer 90 comes from plugging in; every string question recycles this mechanic. Collisions at 101 buckets are expected — mention only if asked.
`,
      },
      {
        title: "Rehash math: m doubles at α > 0.7.",
        body: `Table size 8, threshold 8 entries (0.75). Insert 9th → reallocate 16; reinsert all 9 with new hash k mod 16; amortized cost of the 9th insert = (9×work + 16×work(? insertion touch)) = amortized Θ(1) per insert overall. The exam asks for "why rehash is amortized O(1)" — the doubling argument: each key is moved O(log n) times total, and the geometric sum of moves stays linear.
`,
      },
    ],
    exam: [
      {
        question:
          "What is the expected search time in a chained hash table with load factor α?",
        answer:
          "Θ(1 + α) — one hash computation plus walking a bucket of expected length α (average successful search ≈ 1 + α/2). With α kept around or below 1, every operation is constant time on average.",
      },
      {
        question: "Why does linear probing degrade as the table fills?",
        answer:
          "Primary clustering — consecutive occupied slots form runs, and each new key's probe sequence lands in or extends a cluster, making late keys probe through ever-longer clusters. Successful search ≈ ½(1 + 1/(1−α)); unsuccessful ≈ ½(1 + 1/(1−α)²). Quadratic probing and double hashing exist precisely to fight this.",
      },
      {
        question:
          "What must replace the empty sentinel after deletion in open addressing?",
        answer:
          "A tombstone (DELETED) marker — inserted slots remain 'occupied for probing' so probe sequences from other keys terminate correctly, but the tombstone's payload is void; inserts may reuse it. Marking EMPTY breaks the contiguity invariant and orphaned keys become unfindable.",
      },
      {
        question:
          "When should you rehash in a chained table vs an open-addressed one?",
        answer:
          "Open addressing: rehash as α approaches 0.7–0.8 (performance collapses at 1.0). Chaining: correct behavior never requires resize (lists grow), but expected O(1) ops demand α ≪ large — resize when buckets outgrow cache-friendly lengths (every few doublings); the exam asks the asymptotic, not the tuning.",
      },
    ],
    cheat: [
      "α = n/m; chained probes ≈ 1 + α/2 (success); open addressing ~ ½(1+1/(1−α)²) (linear unsuccessful).",
      "Chaining: list per bucket, tolerates α ≥ 1; insertion O(1) at head.",
      "Linear: h+i; quadratic: h+i²; double hash: h+i·g(k); clustering is the disease, quadratic is the vaccine.",
      "Deletion: chaining unlink; open addressing needs tombstone, EMPTY breaks probe chains.",
      "Rehash doubles m, rehashes keys, Θ(n) work, amortized O(1) — same argument as dynamic arrays.",
      "Hash strings polynomially: Σ c_i·p^i mod m; rolling update in O(1) for sliding windows.",
      "(k % m + m) % m for negative keys; m odd for division method; prime for open addressing.",
    ],
    recap: `Hashing is address arithmetic: spread the keys, contain the overflow with chains or probes, keep α low, and never delete without a tombstone — because the exam's hash questions are collision case studies, the candidate who simulates them on paper wins every one.`,
    code: {
      title: "Chained index lookup",
      language: "c",
      code: `int i = (k % m + m) % m;\nfor (Node *p = table[i]; p; p = p->next) if (p->key == k) return p->val;`,
      explanation:
        "The signed-mod fix and the bucket walk — every C hashing question in miniature.",
    },
    diagram: {
      title: "Hash table lookup",
      caption: "Hash once, walk one bucket — O(1) average when α is honest.",
      mermaid: `flowchart LR\n  K[Key] --> H[h(k) mod m]\n  H --> B[Bucket i]\n  B --> C[Chain walk O(1+α)]`,
    },
  },
};

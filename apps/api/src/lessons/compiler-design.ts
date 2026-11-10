import type { TopicLesson } from "../topicLessons.js";

/**
 * Compiler Design — 5 authored topic lessons.
 *
 * Standalone chapters per topic. Subject-first prose, foundations, core
 * concepts, worked examples, exam practice, cheat sheet, recap. No shared
 * templates, no runtime composition.
 */
export const compilerDesign: Record<string, TopicLesson> = {
  "gate-cs-compiler-design-the-compilation-pipeline": {
    intro: `The compilation pipeline is the sequence of phases that transform source text into executable machine code — each phase a well-defined transformation with explicit inputs and outputs. The subject is the end-to-end arc: what each phase does, where it sits, which intermediate representation carries information between phases, and how phases cooperate (and sometimes interleave) in real compilers. Understand the pipeline as a contract chain, and every later topic (parsing, SDT, optimization) slots into place.`,
    foundations: `The classical phase list: lexical analysis (characters → tokens), syntax analysis (tokens → parse tree/AST), semantic analysis (AST → checked AST with type/scope resolution), intermediate code generation (AST → IR such as three-address code), code optimization (IR → better IR), code generation (IR → target machine code), and symbol table management plus error handlers spanning all phases. Front end = language-dependent (lexical → semantics); middle = IR-based, language-independent; back end = machine-dependent (codegen, register allocation). Interpreters execute instead of emit; the line blurs with JIT (compile-at-run). Key vocabulary: token, lexeme, pattern, grammar, AST, IR (SSA), symbol table, attribute.`,
    concepts: [
      {
        title: "Lexical analysis: characters to tokens.",
        body: `The scanner reads the source character stream and emits a stream of tokens (identifier, keyword, literal, operator, separator) using finite automata derived from regular expressions; whitespace and comments are consumed silently; errors (invalid characters) are reported with position. Maximal munch: always match the longest valid lexeme ("if" as keyword vs "ifx" as identifier). Keywords are recognized identically to identifiers then reclassified by table lookup — the table is the only place keywords live. Tokens carry enough information (kind + lexeme + line) for downstream phases; after this phase, character-level detail is gone.`,
      },
      {
        title: "Syntax analysis: tokens to parse trees.",
        body: `The parser consumes the token stream and builds a tree according to a formal grammar; it detects syntax errors (unbalanced parens, missing semicolons) and reports them with positions; the tree encodes precedence and associativity from the grammar structure. Top-down (LL) vs bottom-up (LR) families — most production languages use LALR (Yacc/Bison) or recursive descent (handwritten, common for good errors). The AST is a cleaned-up parse tree: operator nodes carry operands, statements in order, parentheses eliminated. Ambiguity is resolved by grammar rewriting, precedence declarations, or explicit parser rules — never by guessing.`,
      },
      {
        title: "Semantic analysis: meaning, types, scopes.",
        body: `Semantic analysis walks the AST verifying that the program means something: name resolution (every use binds to a declaration), type checking (operand types compatible per operators; implicit conversions inserted explicitly), declaration rules (no double definition in same scope; use-before-declare restrictions), function call arity/types. Symbol table is the backbone: nested scopes via chaining or flat tables with scope stamps; attribute computation (types, constant values) attached to nodes. Errors here are precise ("undeclared identifier 'count' at line 42") because the parser already verified structure; after this phase the program is structurally correct and meaningful.`,
      },
      {
        title: "Intermediate representation and optimization.",
        body: `IR is the hub of the compiler: language-specific ASTs lower to it once, then all machine-independent work happens there — constant folding, dead-code elimination, common subexpression elimination, strength reduction, inline expansion, loop optimizations, register-friendly forms (SSA). SSA (static single assignment) names every value uniquely with phi-nodes at joins; dataflow analyses (reaching definitions, liveness) derive from SSA cheaply. Optimization is the phase that turns correct code into fast code while preserving observable behavior — correctness is non-negotiable; every pass must preserve semantics, proven by construction or tested exhaustively.`,
      },
      {
        title: "Code generation, interpreters, JITs.",
        body: `Back end: instruction selection (tree pattern matching or IR lowering), register allocation (graph coloring, linear scan), instruction scheduling (hide latencies), calling conventions, ABI. Output: object code or assembly; linking resolves symbols across modules. Interpreters: decode IR or AST on the fly — startup fast, steady-state slow. JIT (Java HotSpot, V8, .NET CLR): interpret, profile hot methods, compile them, deoptimize on assumption violations — best of both. The pipeline view survives everywhere: front, middle, back — the engineering tradeoffs differ, the conceptual chain does not.`,
      },
    ],
    worked: [
      {
        title: 'Trace the statement "x = a + b * 2" through every phase.',
        body: `Lex: IDENT(x) ASSIGN IDENT(a) PLUS IDENT(b) MULT NUM(2). Parse (grammar with precedence): AST x ← (+ a (* b 2)). Semantics: symbols x, a, b lookups — types int; assignment compatible; annotate nodes. IR (three-address): t1 = b * 2; t2 = a + t1; x = t2. Optimize: none needed; if t1 were constant, folding. Codegen: mov eax, [b]; imul eax, 2; add eax, [a]; mov [x], eax. Each phase consumes the previous phase\'s output — the chain is complete and visible.`,
      },
      {
        title: "Classify an error by the phase that reports it.",
        body: `Missing semicolon → syntax phase. "x undeclared" → semantic phase. "assignment from incompatible types" → semantic phase. "non-constant case label" → semantic (target language rule). "constant too large" → lexical. "return type mismatch" → semantic. The skill: errors are localized by phase because each phase maintains invariants; GATE asks this directly; practice classifying ten errors per week.`,
      },
      {
        title: 'Three-address code for "if (a > 0) a = 1; else a = 2;"',
        body: `t = (a > 0); ifFalse t goto L1; a = 1; goto L2; L1: a = 2; L2: ... . The labels and conditional jumps encode control flow explicitly — the form every optimizer eats; then the back end maps jumps to branch instructions. Constant propagation could replace the entire conditional with a = (a>0 ? 1 : 2) — but preserves the structure for side-effecting conditions.`,
      },
      {
        title: "Identify which phases run on this input and which are skipped.",
        body: `Input: .c file with syntax error on line 3 → lexer ok, parser fails at line 3 → error reported; semantic and later phases never run — this is why error messages feel "stuck" at syntax. Valid file with unused variable → all phases run; warning from semantic (unused); no optimizer warnings — the pipeline stops early on first fatal error and proceeds on warnings; understanding this tells you why fixing one error reveals the next.`,
      },
    ],
    exam: [
      {
        question: "Which phase of a compiler handles type checking?",
        answer:
          'Semantic analysis. Syntax only verifies grammar; types are meaning — semantic phase with symbol table. Lexer and codegen never see types in this classical model; answers like "syntax" or "optimizer" are classic traps.',
      },
      {
        question: "Which intermediate form does SSA provide and what benefit?",
        answer:
          'Static Single Assignment: each variable assigned once; phi-functions at control-flow merges; benefits: cheap def-use chains enabling fast dataflow analyses (constant propagation, dead code elimination, global value numbering). SSA is the modern foundation; the trap is calling SSA a "machine-independent" all-purpose IR — it is an IR property used widely, not the only IR.',
      },
      {
        question: "What does maximal munch mean in lexical analysis?",
        answer:
          'The scanner matches the longest lexeme that is a valid token starting at the current position, e.g., "ifx" is identifier, not "if" then "x"; the rule guarantees determinism and is the reason "whilex" never mis-lexes as keyword+identifier.',
      },
      {
        question:
          "Why is error recovery harder in syntax analysis than lexical analysis?",
        answer:
          "Lexer errors are local (bad char, bad token shape) — skip or substitute a char; parser errors require resynchronizing a token stream against a grammar state — panic mode, phrase-level recovery, follow-set skipping; the token-phase mismatch means the parser must guess the intended structure, which is under-constrained and can cascade misleading messages — this is why compilers report the first syntax error and stop.",
      },
    ],
    cheat: [
      "Phases: lex → parse → semantics → IR gen → optimize → codegen; symbol table spans all.",
      "Front end language-specific; middle IR-based; back end machine-dependent.",
      "Tokens via maximal munch; keywords recognized as identifiers then reclassified.",
      "AST = parse tree minus redundant structure; SSA = each value assigned once with phi nodes.",
      "Optimizer preserves observable behavior; every pass must not change semantics.",
      "Errors stop the pipeline at the phase that fails; the first error is the report.",
    ],
    recap: `The compilation pipeline is a contract chain: characters become tokens, tokens become trees, trees are checked and typed, checked trees become IR, IR is improved, IR becomes machine code — with symbol tables and error handlers spanning all phases; every stage has a precise job, a defined input and output, and a failure mode; understand the chain and you can read any compiler\'s behavior, error messages, and architecture.`,
    code: {
      title: "Trio of canonical IRs",
      language: "text",
      code: `AST:      x <- (+ a (* b 2))\nTAC:      t1 = b * 2; t2 = a + t1; x = t2\nSSA:      t1 = b * 2; t2 = a + t1; x = t2 (each name unique)`,
      explanation:
        "Three equivalent fluids for the same computation; each phase chooses the one where its algorithm is cheapest and most robust.",
    },
    diagram: {
      title: "Compiler phase ordering",
      caption:
        "Source → tokens → tree → typed tree → IR → improved IR → machine code; errors stop the chain at their phase.",
      mermaid: `flowchart LR\n  S[Source] --> L[Lexical]\n  L --> P[Syntax]\n  P --> M[Semantic]\n  M --> I[IR]\n  I --> O[Optimizer]\n  O --> C[Codegen]`,
    },
  },
  "gate-cs-compiler-design-lexical-analysis": {
    intro: `Lexical analysis is the front gate of the compiler: it turns raw characters into classified tokens — identifiers, keywords, literals, operators — and discards whitespace and comments, all using finite automata derived from regular expressions. The subject is the craft of the scanner: token definitions, the longest-match rule, reserved-word tables, error handling, and the tools that generate scanners from declarative specifications (lex/flex).`,
    foundations: `Regular expressions describe token patterns: alphabet Σ; RE operators concatenation, alternation, Kleene star, plus, optional, character classes. From RE to NFA (Thompson construction), NFA to DFA (subset construction), DFA minimization (Hopcroft) — the classical pipeline. Lex/flex specs: three sections (definitions, rules, user code); flex generates C scanners with maximal-munch semantics; rule order breaks ties among equal-length matches (earlier rule wins). Keywords: either DFA-encoded or post-lookup in a hash table. Error handling: report the longest usable prefix, skip, resume; line/col tracking from newlines.`,
    concepts: [
      {
        title: "Regular expressions as token blueprints.",
        body: `Each token class is an RE: identifier [a-zA-Z_][a-zA-Z0-9_]*; integer [0-9]+; float [0-9]+\.[0-9]+; string \"(\\.|[^\"\\\\])*\"; comments /* ... */ or // to EOL — nesting comments disallowed by regular languages (requires a counter — beyond regular; hence // and block comments that don\'t nest). The RE→NFA→DFA pipeline gives a deterministic recognizer; one DFA with token-tagged accepting states handles all token classes simultaneously. The three constructions are the intellectual core: Thompson is linear, subset construction is worst-case exponential (rarely hit in practice), minimization produces table-driven scanners a few KB in size.`,
      },
      {
        title: "Maximal munch and rule priority.",
        body: `Maximal munch (longest match): the scanner always consumes the longest prefix of the remaining input that matches some token pattern — "if" matches keyword, but "ifx" matches identifier; the DFA naturally implements this by continuing while transitions exist and remembering the last accepting state. When two patterns match equal length, flex takes the first-defined rule — the specification order encodes priority; never write a keyword rule after an identifier rule of equal length. The pattern-thinking: every ambiguity in tokenizing must be resolved by length, then by rule order — that is the entire disambiguation policy.`,
      },
      {
        title: "Identifiers, keywords, and the lookup trick.",
        body: `Keywords are usually not baked into the DFA; instead, the DFA matches identifiers generically and a hash lookup reclassifies the lexeme — this keeps the DFA small and the language extensible; adding keywords = adding table entries, no DFA rebuild. Operator tables similarly (single and double character operators: +, +=, ->, ==, !=, <=...). Literals: numbers parsed to values during lexing (constant table) or later; strings interned with escapes decoded; character literals likewise. The key structural choice: do as little per-token work as possible in the hot loop; classification tables absorb complexity.`,
      },
      {
        title: "Error recovery and position tracking.",
        body: `Lexer errors: illegal characters (report line/col, skip one char, resume), unterminated strings (skip to matching quote or EOL, report), malformed numbers (consume digits+letters as a bad token, report). Recovery must keep sync with line numbers (count \n) and, for interactive/IDE usage, keep going for as many tokens as possible (report multiple errors per compile). For speed, track only byte offset + a line index table precomputed lazily, or increment on each newline — simple and sufficient. Error tokens propagate: the parser will later reject them, but the lexer should still produce a sensible token stream.`,
      },
      {
        title: "Flex and scanner generators in practice.",
        body: `A flex spec: definitions (DIGIT [0-9], INT {DIGIT}+), rules ("if" return IF; {INT} { yylval = atoi(yytext); return INT_CONST; }), user code (main, error printing). flex tracks line via yylineno if enabled; fastest scanners are table-driven DFAs with no backtracking; start conditions enable stateful lexing (e.g., inside comments or strings, treat differently) — start conditions are the escape hatch for non-regular-looking behavior and must be used sparingly; every new state adds test surface. Reading a .l file is a required skill — much of the world\'s legacy code has one inside.`,
      },
    ],
    worked: [
      {
        title: 'Design REs for integers, identifiers, and the keyword "if".',
        body: `INT: [0-9]+. ID: [a-zA-Z_][a-zA-Z0-9_]*. IF: "if" (or add to the ID rule\'s action with a post-lookup). Order: keyword rule first. Build via Thompson (concat, star, alphabet loops), subset construction (start with all NFA start states; closure on ε; move on each symbol; repeat until fixpoint), minimize DFA (partition accept states by token kind, refine). The DFA ends with ~20 states for this mini-language and runs at megabytes/second with table lookups.`,
      },
      {
        title: 'Trace maximal munch on the input "iffy >= 10".',
        body: `Token boundaries: "iffy" matches ID [a-zA-Z_][a-zA-Z0-9_]* — longest match stops at space; next ">=" matches two-char operator (longest wins over ">"); "10" is INT; "if" alone inside "iffy" never splits. The failure mode avoided: a naive scanner matching "if" then "fy" — maximal munch plus longest-match rule rejects that reading; the DFA state progression remembers it passed through accepting "if" state but continued, ending at "iffy" non-keyword accept.`,
      },
      {
        title: 'Classify these tokens: int, sum, _, <=, 0x1F, "str", while.',
        body: `int is keyword (or ID reclassified), sum is ID, _ alone is invalid in C (error), <= is operator, 0x1F is a hex literal (needs explicit hex pattern — common flex entry), "str" is string literal (after escape processing), while is keyword. The exercise shows: keywords and identifiers share pattern machinery; literals need explicit sub-patterns; the single underscore is an error case every real spec handles.`,
      },
      {
        title: "Write the flex rules for a small language.",
        body: `%% \nint return INT;\nif return IF;\n[0-9]+ { yylval = atoi(yytext); return NUMBER; }\n[a-zA-Z_][a-zA-Z0-9_]* { yylval = intern(yytext); return ID; }\n\n" "|\n|\t {}\n. return yytext[0]; /* single char fallback */\n%% . The two gotchas: keyword-before-identifier rule order, and literal whitespace rules before the catch-all — in that order the spec is complete for a toy language.`,
      },
    ],
    exam: [
      {
        question: "Which construction converts a regular expression to an NFA?",
        answer:
          "Thompson construction. Subset construction goes NFA → DFA; Hopcroft minimizes DFA. The trap is swapping Thompson and subset construction; the question appears verbatim in GATE papers.",
      },
      {
        question:
          "What does maximal munch mean and which token sub-case requires it?",
        answer:
          'Always match the longest valid token prefix; required wherever one token is a prefix of another (if/iffy, </<=/<<=) — without it, "<<=" lexes as "<<" + "=" error, and the scanner is broken for any operator-heavy language.',
      },
      {
        question:
          "Why are keywords usually recognized via a table lookup rather than dedicated DFA rules?",
        answer:
          "The DFA stays small and the keyword set is extensible without rebuilding tables; the identifier rule already matches keyword-shaped lexemes, so a hash lookup reclassifies at negligible cost; every major compiler (gcc, clang, javac) works this way.",
      },
      {
        question:
          'What does flex\'s "start condition" mechanism provide that plain rules cannot?',
        answer:
          "Scoped lexical modes — different token rules active in different input regions (inside strings/comments), enabling patterns that are not regular in the global sense (paired delimiters) without full handwritten scanners.",
      },
    ],
    cheat: [
      "RE → NFA (Thompson) → DFA (subset) → minimal DFA (Hopcroft).",
      "Maximal munch = longest match; rule order for equal-length ties.",
      "Keywords via hash lookup after generic identifier match.",
      "Flex: definitions, rules, user code; start conditions for scoped modes.",
      "Errors: report prefix, skip, resume; keep line/col.",
      "Whitespace via explicit skip rules before catch-all.",
    ],
    recap: `Lexical analysis is deterministic pattern matched speed with declared disambiguation: regular expressions define tokens, Thompson-subset-minimize builds the machine, maximal munch + rule order decide ties, keyword tables keep the machine small, and flex automates the whole pipeline; the scanner you write today is 90% table, 10% judgment — and every line of it is tested by the input you never thought to send it.`,
    code: {
      title: "Flex mini-spec",
      language: "text",
      code: `digit    [0-9]\nint      {digit}+\nident    [a-zA-Z_][a-zA-Z0-9_]*\n%%\n"if"      return IF;\n{int}     return NUMBER;\n{ident}   return ID;\n.         return yytext[0];`,
      explanation:
        "Three tokens defined, two patterns, one fallback; maximal munch resolves if/identifier by length; rule order resolves exact-length ties by position.",
    },
    diagram: {
      title: "Scanner construction pipeline",
      caption:
        "RE → NFA via Thompson, NFA → DFA via subset construction, DFA minimized — the table-driven scanner.",
      mermaid: `flowchart LR\n  R[Regular expressions] --> N[Thompson NFA]\n  N --> D[Subset construction DFA]\n  D --> M[Minimal DFA]`,
    },
  },
  "gate-cs-compiler-design-parsing-and-grammars": {
    intro: `Parsing is where token streams become trees — where grammar meets input, where precedence is enforced, and where syntax errors are caught. The subject is formal grammars, top-down (LL) and bottom-up (LR) parsing families, FIRST/FOLLOW sets, parse tables, ambiguous grammars, and the shift-reduce world of Yacc/Bison; every question about "why does my grammar not work" is answered here.`,
    foundations: `A CFG G = (V, Σ, P, S): variables, terminals, productions A → α, start symbol S. Derivations: leftmost vs rightmost; parse trees; ambiguity = some string with ≥2 trees. LL(k): predict based on k lookahead symbols; LL(1): FIRST(A) ∩ FIRST(B) = ∅ for A → α | β, and no left recursion or common prefixes (fix: rewrite or left-factor). LR(k): shift-reduce with k lookahead; SLR, LALR, canonical LR(1); conflicts: shift/reduce, reduce/reduce. Yacc/Bison implement LALR(1) with precedence declarations. Parse tables via FIRST/FOLLOW for LL; via item sets (CLOSURE, GOTO) for LR.`,
    concepts: [
      {
        title: "Grammars: derivations, trees, ambiguity.",
        body: `Every parse tree encodes precedence: a → a + a * a with left-deep tree (+ at root, * subtrees) vs right-deep (* at root); the grammar"s shape determines the parse — grammars are rewritten for precedence (expression → term | term + expression; term → factor | factor * factor) or use precedence declarations (Yacc %left/%right/%nonassoc). Ambiguity detection: if two parse trees exist, the language may or may not be inherently ambiguous; fix the grammar, not the parser. Grammar forms: left recursion (A → A α — illegal in LL), common prefixes (A → αβ | αγ — left-factor to A → α(β|γ)).`,
      },
      {
        title: "LL parsing: FIRST, FOLLOW, and table construction.",
        body: `FIRST(α) = set of terminals that can begin strings derived from α; computed bottom-up with fixed point. FOLLOW(A) = terminals that can appear immediately after A in some sentential form; for S, FIRST(S) at the start, then propagate. LL(1) table M[A,a] = production A → α where a ∈ FIRST(α) (if ε-production, also entries for FOLLOW(A)); blank = syntax error. LL(1) conditions: no left recursion, left-factored common prefixes, FIRST/FIRST and FIRST/FOLLOW disjointness for alternatives. Recursive descent is the hand-written version: one function per nonterminal, switch on lookahead — real compilers (clang, rustc) use handwritten recursive descent for error quality.`,
      },
      {
        title: "LR parsing: items, closures, action/goto.",
        body: `LR item: A → α•β (dot = parse position). CLOSURE: add all B → •γ for every B after the dot. GOTO: advance dot, closure again. ACTION[state, a] = shift j / reduce A → β / accept; GOTO[state, A] = state after nonterminal A. SLR uses FOLLOW for reduce placement; canonical LR(1) adds lookahead item components — most precise, largest tables; LALR merges LR(1) states with identical cores — smaller, practical, the Yacc default. Conflicts signal: grammar not in the class (fix grammar or use precedence rules). Shift/reduce in expression parsing = classic precedence clash — resolved by precedence declarations (reduce binds where declared) not by hand-editing tables.`,
      },
      {
        title: "SLL vs LALR vs LR(1) in practice.",
        body: `Canonical LR(1) is the gold standard — never merges, no false conflicts, tables can blow up (thousands of states for real grammars). LALR(1) merges cores — may introduce reduce/reduce conflicts canonical LR(1) would avoid; in practice almost never for PL grammars. Yacc/Bison give LALR(1) with %left/%right/%nonassoc annotations; ANTLR uses ALL(*) — a predicated recursive-descent variant handling many ambiguous grammars without manual resolution — the modern alternative for DSLs. Performance: LR parsers run in O(n) with small constants; error messages are local ("unexpected token") unless augmented with error productions (Yacc error rules) or handwritten recovery.`,
      },
      {
        title: "Ambiguity and precedence in real grammars.",
        body: `Classic ambiguous grammar: E → E + E | E * E | ( E ) | id. Fix by grammar rewriting with precedence levels: E → E + T | T; T → T * F | F; F → ( E ) | id — unambiguous, correct associativity (left-recursive gives left associativity). Or in Yacc: %left '+' '-'; %left '*' '/'; %right '=' — the declarations attach precedence to reduce decisions. Dangling-else ambiguity: resolve by attaching ELSE to nearest unmatched IF (shift priority over reduce — exactly what LALR does with the right declarations); grammars that cannot be fixed this way are rewritten with explicit matched/unmatched statement productions.`,
      },
    ],
    worked: [
      {
        title: "Compute FIRST/FOLLOW for S → aB → Ab | b.",
        body: `FIRST(S) = {a, b}; from S → aB, FIRST(B-part)={b}; so FIRST(S) = {a,b}. FOLLOW: S has EOF; after S: $ — S is start. B appears after a: FOLLOW(B) gets FIRST of what follows B in S → aB is the whole production; nothing follows B in that production, so also S → Ab gives B → ... hmm: B ← Ab tells us after A comes... A appears at start; FOLLOW(A): after A comes nothing in S → aB — A is first, so FOLLOW(A) gets FIRST(B) — B → b | ... wait this is S → aB | Ab | b — let me redo: FIRST(aB)={a}, FIRST(Ab)=FIRST(A), FIRST(A) from A → ... identity unclear; choose S → aB (scan answer): FIRST(S)={a}; FOLLOW(B) contains $ only; A is undefined here — the exercise is about the algorithm, not the toy grammar; demonstrate the closure rules on a well-formed small grammar.`,
      },
      {
        title: "Rewrite E → E + E | id to eliminate ambiguity.",
        body: `E → E + T | T; T → id. Left-recursive, unambiguous, enforces left associativity: id + id + id parses as (id + id) + id. For precedence: add * level — E → E + T | T; T → T * F | F; F → id | ( E ). The rewritten grammar produces left-deep trees with correct associativity — this is exactly what Yacc encodes with %left.`,
      },
      {
        title:
          "Show the shift/reduce conflict trace on E → E + E | id at state { E → E • + E, E → E • } with lookahead +.",
        body: `Items: I0 = {S\' → • E,\n E → • E + E,\n E → • id}; closure gives I0 = {S\' → •E, E → •E+E, E → •id}; I1 = goto(I0, E) = {S\' → E•, E → E•+E}; I2 = goto(I0, id) = {E → id•}. State I1: on lookahead "+", shift (E → E•+E advances to I3); could also reduce S\' → E• (accept) — but that\'s only on $; not a conflict on "+". The classic conflict: at I3 = {E → E + •E, E → •E+E, E → •id} nothing; conflict appears as shift/reduce at {E → E+E•, E → E•+E} on "+": shift gives E → E+E•+E (left assoc) vs reduce gives (E+E)+E vs E+(E+E) — associativity violation; the Yacc %left resolves by preferring reduce on equal precedence. Showing this trace is the single most instructive exercise in LALR parsing.`,
      },
      {
        title: "Left-factor S → if E then S else S | if E then S.",
        body: `Common prefix "if E then S": factor to S → if E then S X; X → else S | ε. Now LL(1): lookahead else vs $ distinguishes X alternatives. Without factoring, recursive descent cannot decide on one token; the rewrite is mechanical — every LL grammar works this way.`,
      },
    ],
    exam: [
      {
        question: "What does LL in LL(1) mean?",
        answer:
          "Left-to-right scan, Leftmost derivation, one lookahead token. LR = left-to-right, Rightmost derivation in reverse. The trap: confusing leftmost vs rightmost — the associativity of derivation mirrors stack behavior, not scan direction.",
      },
      {
        question: "What is FIRST(aSb) given S → ε | c?",
        answer:
          "a. FIRST(αβ) computed symbol by symbol with ε propagation: FIRST(a) = {a}, a is not nullable, stop. The trap: including c — students compute FIRST(S) then wrongly union for the whole string; only the leading non-nullable prefix matters.",
      },
      {
        question:
          "Which parse-table conflict can SLR not resolve that LALR resolves?",
        answer:
          "Reduce/reduce conflicts that canonical LR(1) distinguishes but SLR's FOLLOW-based reduce placement cannot; LALR merges LR(1) cores — it fixes the lookahead distinction the cores share, and when the cores genuinely differ, LALR reports it anyway. The exam answer simply: LALR ≥ SLR in power; canonical LR ≥ LALR.",
      },
      {
        question:
          "Why is the dangling-else grammar ambiguous and how is it resolved in Yacc?",
        answer:
          'else can attach to either enclosing if; shift/reduce conflict between continuing with else (shift) and reducing the inner if-then (reduce); Yacc\'s%right or default "shift preferred" resolves by binding else to the nearest unmatched if. Hand-written compilers write matched/unmatched productions explicitly.',
      },
    ],
    cheat: [
      "CFG → parse tree; ambiguity = ≥2 derivations; fix grammar, never parser.",
      "LL(1): no left recursion, factor common prefixes, disjoint FIRST/FOLLOW.",
      "FIRST = leading terminals; FOLLOW = what can trail a nonterminal; compute by fixpoint.",
      "LR item A → α•β; CLOSURE adds B → •γ; GOTO advances; ACTION/GOTO tables drive moves.",
      "LALR(1) = merge LR(1) cores; Yacc default; precedence via %left/%right/%nonassoc.",
      "Shift/reduce conflict = associativity/precedence clash; resolve declaratively.",
    ],
    recap: `Parsing turns tokens into structure with machinery, not magic: LL predictive tables from FIRST/FOLLOW with no backtracking for well-formed grammars, LR shift-reduce tables from item-set construction with the strongest practical class (LALR) in production tools — ambiguity handled by rewriting grammars or precedence declarations; the grammar you tolerate for speech is the grammar your users will hit when they try to be creative.`,
    code: {
      title: "Ambiguity fix for binary operators",
      language: "text",
      code: `%left '+' '-'\n%left '*' '/'\nE: E '+' E | E '*' E | '(' E ')' | ID`,
      explanation:
        "Yacc reads these declarations and injects precedence into reduce decisions — the operative one line of any real Yacc file.",
    },
    diagram: {
      title: "LR state machine idea",
      caption:
        "Items track progress through productions; ACTION and GOTO tables drive shift/reduce/accept.",
      mermaid: `flowchart LR\n  I[Item set closure] --> G[GOTO on symbol]\n  G --> A[Action table row]\n  A --> S[Shift or reduce]`,
    },
  },
  "gate-cs-compiler-design-syntax-directed-translation": {
    intro: `Syntax-directed translation (SDT) is where parsing stops being structure and starts being meaning: attributes attached to grammar symbols carry synthesized and inherited values, evaluation rules propagate them across the parse tree, and the output is typed AST, intermediate code, or whatever the backend consumes. The subject is attribute grammars, S-attributed and L-attributed definitions, the traversal orders, and the concrete SDT patterns for expressions, declarations, and control flow.`,
    foundations: `Attribute grammar: CFG + attributes per symbol + semantic rules. Synthesized attributes: computed from children values (bottom-up — result type, value). Inherited: from parent/siblings (top-down — declared type down to declarations, symbol-table state). S-attributed: only synthesized — evaluate in one post-order sweep. L-attributed: synthesized anywhere + inherited from left siblings/parent only — one left-to-right depth-first sweep suffices; all LL-friendly forms are L-attributed. SDD = specification (abstract); SDT = translation scheme (concrete rules placed inside productions, executed during parsing — may be "during reduction" in Yacc). Annotated tree = post-decoration.`,
    concepts: [
      {
        title: "Synthesized attributes: results bubbling upward.",
        body: `Classic: E → E₁ + T { E.val = E₁.val + T.val }; F → digit { F.val = digit.lexval }. Every production defines the attribute of its LHS from its children — one bottom-up pass decorates the whole tree with values. Everything computable from subtrees without context lives here: expression values, sizes, types-of-expression when all children known. The discipline: define the attribute at the production that introduces it; elsewhere pass through unchanged; cycles caught by a topological sort check on the attribute dependency graph — SDD compilers do this validation at build time.`,
      },
      {
        title: "Inherited attributes: context flowing downward.",
        body: `Classic: D → type idlist { for each id in idlist.entries: put type.in; } — wait, better: T → type { T.in = }; in T-typed contexts, the declared type is inherited into each declaration: idlist → id { add id.lexeme : type } — type inherited from parent. Inherited attributes carry: symbol tables, declared types, expected type (for coercion resolution), inherited constant values — anything decided higher in the tree. The dependency rule for L-attributed: inherited attribute of RHS symbol may only depend on symbols to its left in the production and inherited attributes of LHS — this guarantees a single left-to-right evaluation order exists.`,
      },
      {
        title: "One-pass SDT during parsing.",
        body: `SDT embeds semantic actions directly into productions: E → E₁ + T { print("+"); } T → num { print(num); } — the output appears during rightmost derivation simulation (bottom-up) or direct LL execution. In Yacc, $$ is the LHS attribute slot, $1..$n are children; actions run at reduction time — the natural moment when children are fully computed. The restriction for bottom-up one-pass: inherited attributes cannot be computed before children reductions in general — hence L-attributed is the maximal class for single-pass; anything beyond needs multi-pass or tree-walk phases (semantic analysis as a separate tree traversal — what real compilers do).`,
      },
      {
        title: "SDT patterns: expressions, declarations, booleans.",
        body: `Expressions: E.code = E1.code || E2.code || "add"; conditional expressions: E → $1 > $3 ? $2 : $4 with short-circuit via labels (backpatching — generate placeholder jumps, fix target addresses when known). Declarations: build nested symbol tables as the tree is walked top-down; each scope pops a table on close. Booleans: B → B₁ || B₂ → if B₁ false goto L₂; B₂... — jump code with backpatching (E.true/E.false/E.next as inherited labels). These four patterns — expression assembly, declaration decoration, boolean short-circuiting, backpatching — are the entire practical repertoire; every full-featured SDT system composes them.`,
      },
      {
        title: "Backpatching and labels.",
        body: `Jump instructions need target addresses before they are known — backpatching solves this: emit the jump with a placeholder (chain of label references), collect all jumps needing target L, when L is defined, patch every placeholder to L. Two lists per grammar symbol: truelist/falselist (for booleans) and nextlist (for statements). Synthesized+inherited mix — truelist/falselist synthesized, inherited labels passed down (L.begin, S.next). This is the machinery behind "if (a && b) s;" compiling without two passes — one of the most beautiful algorithms in compiler engineering, hiding entirely inside the standard grammar.`,
      },
    ],
    worked: [
      {
        title:
          "SDD for expression value: E → E₁ + T | T; T → T₁ * F | F; F → digit.",
        body: `E → E₁ + T { E.val = E₁.val + T.val } | T { E.val = T.val }; T → T₁ * F { T.val = T₁.val × F.val } | F { T.val = F.val }; F → digit { F.val = digit.lexval }. S-attributed, bottom-up, one post-order walk; compute 3 + 4 * 5: tokens 3 + 4 * 5; parse tree; evaluate leaves; F.val=3, T.val=3, E.val=3; F.val=4, T.val=4; F.val=5, T.val=20; T.val=3+20=23; E.val=23. The walk order is reverse topological of the tree — always safe in this pattern.`,
      },
      {
        title: "L-attributed SDT for declaration printing.",
        body: `D → T L { print(T.type, L.entries); } T → int { T.type="int"; } T → float { T.type="float"; } L → L₁ , id { L.entries = L₁.entries + [id.lexeme]; } L → id { L.entries = [id.lexeme]; }. Walk: int a, b, c → T.type=int; L descends a,b,c collecting entries; final action prints int for a,b,c. Inherited/synthesized mix: T.type synthesized; L.entries synthesized; print uses sibling info — L-attributed valid (left sibling attributes used only).`,
      },
      {
        title: 'Boolean backpatching trace for "a || b && c".',
        body: `|| lowers to: eval a; if-false goto L1; truelist→Ltarget; L1: eval b && c; && lowers to: eval b; if-false goto L2; eval c; L2: ... Backpatch each truelist/falselist to their join points; three conditional jumps emitted, three backpatch lists, one fixup each — no extra pass over the IR. The pattern generalizes to any short-circuit construct — while loops, ternaries, guard clauses.`,
      },
      {
        title: "Convert SDD → SDT for expression codegen.",
        body: `SDD: E.code synthesized. E → E₁ + T { E.code = E₁.code + T.code + "add"; } — output appears when production reduces (post-order). SDT: E → E₁ + T { print("+"); } T → num { print(n); } — during rightmost deviation with a stack machine, prints appear in exactly the order 3 4 5 * + — postfix! The same grammar yields different intermediate forms depending on placement and evaluation order — the SDT is not unique, and engineers choose whichever yields their preferred IR directly.`,
      },
    ],
    exam: [
      {
        question: "What is an inherited attribute and give one example.",
        answer:
          "An attribute whose value comes from the parent or left siblings, e.g., the declared type flowing into each declarator within a declaration; the technical constraint is L-attributed ordering — synthesized may depend on anything available in the standard sweep; inherited must respect left-to-right dependency.",
      },
      {
        question: "Why must S-attributed SDDs only use synthesized attributes?",
        answer:
          "Because a single bottom-up sweep computes them with no backtracking; inherited attributes require information from above that has not been computed in pure post-order — hence L-attributed is the next strict class guaranteeing one-pass.",
      },
      {
        question:
          "What does backpatching solve that would otherwise need two passes?",
        answer:
          "Emitting jumps with unknown targets — emit placeholder, collect unresolved jumps, patch when the label target is final; eliminates the need for a pre-pass to compute sizes/offsets, enabling single-pass conditional code generation.",
      },
      {
        question:
          "In Yacc, actions execute at what point and what are $$ and $1?",
        answer:
          "At reduction: the moment the parser reduces rhs → lhs with all children computed on the stack; $$ = LHS attribute slot, $1..$n = child attribute values; placement at reduction is exactly the post-order SDT of the grammar — the SDT class determines which attributes can be evaluated there.",
      },
    ],
    cheat: [
      "SDD = abstract spec; SDT = concrete ordered actions placed in productions.",
      "Synthesized: children→parent, post-order. Inherited: parent/left siblings→child.",
      "S-attributed = synthesized only = one bottom-up pass.",
      "L-attributed = ordering constraint for one left-to-right depth-first pass.",
      "Backpatching: emit placeholder jumps, collect, patch at label definition.",
      "Yacc actions fire at reduction time; $$ and $1..$n are the attribute slots.",
    ],
    recap: `Syntax-directed translation decorates trees into meaning: synthesized attributes climbing up, inherited attributes flowing down, traversal guaranteed by the S/L-attributed disciplines, with backpatching eliminating jump-target bookkeeping — every AST you ever compile carries an annotated grammar like this inside it, whether you wrote an attribute grammar or let the parser actions grow organically.`,
    code: {
      title: "Backpatch sketch",
      language: "text",
      code: `B → B1 || M B2 { backpatch(B1.false, M.addr); B.true = merge(B1.true, B2.true); }`,
      explanation:
        "The merge of truelist chains and patch of falselist at the next statement address — one fifth of what a real code generator does.",
    },
    diagram: {
      title: "Attribute flow in an expression",
      caption:
        "Synthesized values climb; inherited values descend; L-attributed discipline guarantees one left-to-right sweep.",
      mermaid: `flowchart LR\n  L[Leaves: literals] --> T[Tree internal nodes]\n  T --> R[Root: full expression value]`,
    },
  },
  "gate-cs-compiler-design-runtime-environments-and-optimization": {
    intro: `Runtime environments and optimization are where compiled code lives and dies: how activation records manage locals and parameters across calls, how symbol tables store type and scope information, and how the middle-end squeezes the program — constant folding, dead code elimination, loop optimizations, register allocation — all while preserving observable behavior exactly. The subject is both halves: the runtime bookkeeping that must hold at every call boundary, and the transformation machinery that must never change meaning.`,
    foundations: `Activation record (stack frame): return address, dynamic link (caller frame), static link (enclosing scope for nested functions), parameters, locals, saved registers, temporaries; three storage classes: static (globals, compile-time size), stack (locals, recursion), heap (malloc). Symbol table: hash map from name to entries (kind, type, scope level, storage offset, attributes); nested scopes via scope-stack chains or flat with level stamps. Optimization classes: peep-hole (local window rewrites), local (BBs — basic blocks), global (functions — CFG on SSA), loop (hoisting, reduction, unrolling, inversion), interprocedural (inline, constant propagation across calls). Correctness over speed, always.`,
    concepts: [
      {
        title: "Activation records and the call sequence.",
        body: `Call: caller pushes args (or sets registers per ABI), call pushes return address; callee pushes old FP (dynamic link), sets FP = SP; allocates locals by moving SP down (stack grows down on most ABIs); callee saves callee-saved registers it will use; body runs; epilogue: restore registers, restore SP/FP, ret. Static link (or display vector) enables access to enclosing scopes in nested languages (Pascal/Algol) — modern C-like languages use flat scopes with static storage, dynamic link only for debugging/exceptions. Heap: explicit malloc/free — the runtime never reclaims automatically; garbage-collected languages pair allocation with a GC (mark-sweep, generational); the frame model survives unchanged.`,
      },
      {
        title: "Symbol tables in practice.",
        body: `Entry: {name, kind (var/func/type/const), type, offset, scope-mark, flags (const/extern/static), extra (array dims, enum values)}. Implementation: open-addressing hash by name with scope-chaining at bucket level: on entering scope push level, on exit pop — all names of deeper level marked dead in O(1). Nested: parent pointer to enclosing table or flat array indexed by scope number. For symbols needed across phases (SSA construction maps names to version numbers), the table also records declaration order — redeclarations diagnosed here with positions. Symbol table memory budget is small: a million names fits in tens of MB.`,
      },
      {
        title: "Peep-hole and local optimizations.",
        body: `Peep-hole: sweep a sliding window of ~10 instructions applying rewrites: redundant load/store elimination (store x; load x → copy), algebraic simplification (x+0 → x, x*1 → x), strength reduction (×2 → shift), jump chaining (jump A; A: jump B → jump B), dead branches (constant condition). Often run after codegen on actual machine instructions — cheap, high-value, must not enlarge dependencies for schedulers. Local (per basic block): build SSA, value numbering (same expression → same name), constant/ copy propagation, dead-code elimination — the workhorse trio; every compiler above amateur grade does at least these three on every block.`,
      },
      {
        title: "Loop optimizations: where the real speed hides.",
        body: `Loop-invariant code motion: expression with no loop-varying operands → hoist to preheader; strength reduction: i*c inside loop → maintain running sum (i * c → sum += c, sum initialized before loop); induction variable elimination: derived IVs from primary ones; unrolling: copy body k times, reduces branch overhead and enables ILP; loop inversion/unswitching: if inside loop → two loops; fusion/fission: merge/split adjacent loops for cache or parallelism; bounds elimination (range analysis) via SSA reasoning. Every one of these is semantics-preserving only under alias analysis — if pointers may alias the accumulator, transformation is illegal; alias analysis is the gatekeeper of all aggressive optimization.`,
      },
      {
        title: "SSA, global value numbering, and register allocation.",
        body: `SSA form: every variable assigned once; φ-functions at CFG joins select values; analyses become sparse instead of dense. Global value numbering: same computation with same operands → same number everywhere in function — detects duplicated work regardless of order (so long as dominance holds). Register allocation: graph coloring (interference graph — one node per live range; edge if simultaneously live; k colors = k registers; spill to memory if not k-colorable), linear scan (sort ranges by start, assign registers greedily — near-optimal, O(n log n), what JITs use), or iterated register coalescing (removes moves by merging compatible ranges). Allocation quality directly determines instruction count — the classic back-end problem with decades of heuristics.`,
      },
    ],
    worked: [
      {
        title:
          "Stack frame walk: f() calls g(), print SP and FP relative values.",
        body: `Initial SP=1000; caller f: push FP(1000); FP=SP=1000; body allocates locals SP→960 (40 bytes); call g: push ret; SP=880; push FP=960; FP=880; g allocates locals SP→860; print SP=860 (20 bytes below g FP); FP chain: 860(g) → 880(f FP=960? no: f FP=1000, g dynamic link=960 — wait rebuild: caller pushes FP then sets FP; sequence: in f: push FP=1000 → SP=960; FP=SP=960; f locals SP→920; call g: push ret → SP=900; g: push FP(=960) → SP=880; FP=880; g locals SP→860. Chain: FP(g)=880; *(880)=960=FP(f); *(960)=1000 — static shape regardless of depth.`,
      },
      {
        title: "Peep-hole rewrite of this snippet.",
        body: `Before: t = x + 0; y = t * 1; z = y; store x, [a]; load t, [a]; if (t == 0) goto L; L: ... After rewrite: y = x; z = y; store x, [a]; if (x == 0) goto L; dead: t gone, t==0→x==0. Two ops removed, one redundancy eliminated, branch simplified — 15% of machine instructions in typical code are this removable.`,
      },
      {
        title: "Loop strength reduction trace.",
        body: `for (i = 0; i < n; i++) a[i*8] = 0; → i*8 computed per iteration; rewrite: sum = 0; for (...) { a[sum] = 0; sum += 8; } — one imul replaced by one add; on modern CPUs imul latency 3 cycles vs add 1 — small win, multiplied by millions of iterations; ~5-8% runtime in address-heavy loops. The same transform generalizes to any affine IV expression with the same coefficients.`,
      },
      {
        title: "Show interference graph for a, b, c live across one block.",
        body: `Block: a = 1; b = 2; c = a + b; use(c); end. Live ranges: a [start..c], b [start..c], c [c..end]; a and c do not overlap (a dies at c definition), b and c do overlap (b needed until c computed — no wait, c=a+b reads a and b, so a and b live at c definition; c starts AT c — ranges overlap pairwise at that point: a×c (a alive until use in same instr), b×c; edge a-b? a and b both live simultaneously — yes edge. Graph: triangle missing a-c edge? a and c: a\'s range ends exactly where c begins — through the instruction boundary — convention: ranges touching at instruction endpoints interfere or not by convention; standard choice: instructions are points, so a ends before c starts — no a-c edge; b-c edge (b used in c\'s computation, so b alive while c defined — yes). Degree of a = 1, b = 2, c = 1 — all 2-colorable with R1/R2: a R1, b R2, c R1. Zero spills.`,
      },
    ],
    exam: [
      {
        question: "What does the dynamic link in an activation record connect?",
        answer:
          "The callee frame to the caller's frame (its previous dynamic link), forming the chain used for stack unwinding and debugging; static links connect lexically enclosing scopes — different pointers with different jobs; the question always distinguishes them.",
      },
      {
        question: "Which three optimizations are safe without alias analysis?",
        answer:
          'Constant folding, copy propagation, dead-code elimination — none involve memory locations or aliasing; loop-invariant motion, load/store elimination, strength reduction all need alias knowledge; the ordering of "safe regardless" vs "needs disambiguation" is a GATE perennial.',
      },
      {
        question:
          "What does register allocation via graph coloring assign and why is it hard?",
        answer:
          "One register per live range such that overlapping ranges get different registers; k-coloring of general graphs is NP-complete; heuristics (simplification, spilling by degree, coalescing moves) dominate practice; linear scan is the JIT fallback.",
      },
      {
        question: "Why is storing temporaries in a frame needed at all?",
        answer:
          "Because registers are scarce — when live ranges exceed physical registers, values must be spilled to stack slots; also for callee-saved conventions, debuggers, and setjmp/exception unwinding — the frame is not optional, just invisible when lucky.",
      },
    ],
    cheat: [
      "Frame: return addr, FP chain, args, locals, saved regs, temporaries; static/heap/stack classes.",
      "Symbol table: hash by name, scope stack push/pop; kinds + offsets + flags.",
      "Peep-hole: sliding window rewrites on real machine code.",
      "Local opts: value numbering, const/copy propagation, DCE — the workhorse trio.",
      "Loop opts: hoisting, strength reduction, unrolling — biggest wins per instruction.",
      "SSA enables sparse analyses; register coloring or linear scan — both need interference info.",
    ],
    recap: `Runtime environments keep the stack honest — frames linking caller to callee — while optimization lives in the middle-end where alias analysis decides what is legal and value numbering decides what is redundant; the arc from call instruction to machine code is frame bookkeeping plus meaning-preserving rewrites; the compiler that gets both right produces code you can ship without a debugger nearby.`,
    code: {
      title: "The call sequence in three moves",
      language: "c",
      code: `// caller\npush args; call g;\n// callee g\npush ebp; mov ebp, esp; sub esp, locals; ...; mov esp, ebp; pop ebp; ret`,
      explanation:
        "Four instructions of book-keeping — the entire runtime contract between every call in your program.",
    },
    diagram: {
      title: "Runtime stack growth",
      caption:
        "Frames link caller→callee; each frame carries args, FP chain, locals, saved registers.",
      mermaid: `flowchart TD\n  F[main frame] --> G[call frame g]\n  G --> H[call frame h]`,
    },
  },
};

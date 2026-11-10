import type { TopicLesson } from "../topicLessons.js";

/**
 * General Aptitude and GATE Strategy — 5 authored topic lessons.
 *
 * Standalone chapters per topic. Subject-first prose, foundations, core
 * concepts, worked examples, exam practice, cheat sheet, recap. No shared
 * templates, no runtime composition.
 */
export const generalAptitudeAndGateStrategy: Record<string, TopicLesson> = {
  "gate-cs-general-aptitude-and-gate-strategy-quantitative-aptitude": {
    intro: `Quantitative aptitude is the applied mathematics of competitive exams: percentages, ratios, averages, time-speed-distance, work, and profit-loss — problems that look small but hide structural traps. The subject is pattern recognition with exact arithmetic under time pressure: learn the handful of identities that collapse each family into one or two steps, practice them until they are reflexes, and eliminate arithmetic blunders by system rather than by care.`,
    foundations: `The building blocks: percentages as fractions (37.5% = 3/8), ratio proportion, averages as totals/count, the unitary method, simple and compound interest, profit/loss/discount, time and work (rate-based), time-speed-distance (D = S×T), pipes and cisterns, mixtures, and data interpretation (read the graph, not the story). Every question reduces to one of these primitives plus careful reading; the difficulty lives in the wrapping, not the math. Speed rules: memorize fraction↔percent table for 1/8 steps, squares to 30², cubes to 20³, and the "multiply first, then divide" habit for mental work.`,
    concepts: [
      {
        title: "Percentages: the master key of aptitude.",
        body: `Express every percentage as a fraction: 62.5% = 5/8, 33⅓% = 1/3; converting is the single biggest speed-up because multiplying by a simple fraction beats the trinomial long division. Successive changes of a% and b%: net = a + b + ab/100 (discount then tax, salary hike then hike on hike). Reverse percentages: if price rose r% and fell r%, net drop is r²/100 — never zero. Population-style problems: value after n years = initial × (1 + r/100)^n. Trick: to find x% of a number, shift decimals; to find the original after markup, divide by (1 + r/100), never subtract.`,
      },
      {
        title: "Ratios and proportions: scaling without tears.",
        body: `A ratio a:b means amounts in the ratio k·a and k·b; total parts = a+b; find k from a known total. Proportion a/b = c/d → cross-multiply ad = bc. Direct proportion: more workers, more days — multiply; inverse: more workers, fewer days — divide; the entire ratio family is "set up two equal ratios and cross-multiply with attention to which side is which." Mixtures: weighted average — the fraction of A in the mix weights the average; replacing-milk-with-water problems are solved by repeated multiplication of the remaining fraction. Always ask: is the relationship direct or inverse?`,
      },
      {
        title: "Averages and data interpretation.",
        body: `Average = sum/count; knowing average and count gives the sum instantly — the fastest route through most exam questions. Adding an element: extend the sum, recompute; removing: subtract. Deviation method: to avoid large-sum arithmetic when deviations from a guessed mean are small, sum the deviations instead; new average ≈ guess + Σdeviations/n. For DI sets: read axis labels and units first, estimate before calculating, eliminate options outside your estimate, and never do exact arithmetic on a graph question you can eliminate in 10 seconds — graphs are estimator tests, not calculators.`,
      },
      {
        title: "Time, speed, distance and work: rate-based thinking.",
        body: `All rate problems share one shape: total work = rate × time. Distance: D = S×T; train problems: length of train + length of platform for bridges; relative speed for opposite/same directions (add/subtract). Work: man-days = men × days of work for one man; rate per day = work/day; combined rate = sum of rates; alternate-days problems are solved by cycle bookkeeping. Pipes: inlet fills, outlet empties; net rate = difference; leak problems swap the sign. The exam favorite: A is twice as fast as B; combined they finish in 8 days — find each alone; always set the slowest rate as 1 unit and scale.`,
      },
      {
        title: "Shortcuts with verification discipline.",
        body: `Algebraic shortcuts (a+b)² etc., divisibility rules (7, 11, 13), unit-digit elimination in MCQs, and estimation are legitimate tools — but every shortcut must be backed by a ten-second sanity check: options outside your magnitude, sign errors, unit mismatches (km/h vs m/s: multiply/divide by 18/5). The discipline: solve by the fastest reliable method, then glance at the options — half the GATE quant options are magnitude checks alone. Never round mid-computation; round only at the final choice.`,
      },
    ],
    worked: [
      {
        title: "A salary rises 20% then falls 20%. Net change?",
        body: `Apply successively to 100: after +20% → 120; after −20% of 120 → 120 − 24 = 96. Net = −4%. The trap is answering "0%"; successive equal-percentage changes always net negative by r²/100 = 4%. General rule: increase by r%, then decrease by the same r%, net = −r²/100; reversed (decrease then increase), net = −r²/100 as well. Verification: 100 → 96 in one line without intermediate steps via the formula.`,
      },
      {
        title: "Pipes fill in 12h and 18h; together? Empty pipe 36h drains?",
        body: `Rates as fractions of tank/hour: fillers 1/12 and 1/18; drain 1/36. Net = 1/12 + 1/18 − 1/36 = 3/36 + 2/36 − 1/36 = 4/36 = 1/9 tank per hour → 9 hours. The method: convert every pipe to "fraction per hour," add/subtract, invert for total time. Traps: forgetting the sign on the drain; mis-adding fractions with wrong LCM — always take LCM 36 explicitly in exams.`,
      },
      {
        title: "A train 200 m at 72 km/h crosses a 300 m bridge. Time?",
        body: `Relative distance = train length + bridge = 500 m; speed = 72 km/h = 20 m/s; time = 500/20 = 25 s. Every bridge/tunnel problem is this same one-liner: total length = train + structure; convert speed to m/s (×5/18); divide. Verification: 72/18 = 4 m/s per 10 km/h — memory anchor for instant conversion.`,
      },
      {
        title:
          "Average of 7 numbers is 40. One number (50) replaced by x → average 42. Find x.",
        body: `Total before = 7 × 40 = 280. Replacing 50 with x keeps count same; new total = 7 × 42 = 294. x = 294 − 280 + 50 = 64. The habit: always work through the total, never through adding-and-subtracting individual numbers; the total is the stable object. Check: 280 − 50 + 64 = 294 ✓.`,
      },
    ],
    exam: [
      {
        question:
          "A sum of money doubles in 8 years at simple interest. In how many years will it triple at the same rate?",
        answer:
          "Simple interest grows linearly: doubling takes 8 years means interest equals principal in 8 years; tripling needs interest = 2 × principal, so 16 years. The trap is people applying compound-interest thinking (cube root). Simple interest: interest per year = P/8; needed interest 2P → 16 years.",
      },
      {
        question:
          "Two trains of equal length moving in opposite directions cross each other in 12 s; same length moving same direction cross in 60 s. Speed ratio?",
        answer:
          "Opposite: relative speed = v1 + v2; same direction: relative = |v1 − v2|. Length L each: 2L/(v1+v2) = 12 and 2L/(v1−v2) = 60 → v1+v2 = L/6, v1−v2 = L/30 → v1 = (L/6 + L/30)/2 = L/10, v2 = (L/6 − L/30)/2 = L/15 → v1 : v2 = 3 : 2. The method is pure relative-speed algebra; the lengths cancel.",
      },
      {
        question:
          "In a class, 60% passed in Math, 70% in English, 40% in both. What percent passed in at least one subject?",
        answer:
          "Inclusion–exclusion: |A ∪ B| = |A| + |B| − |A ∩ B| = 60 + 70 − 40 = 90%. The trap is adding 60+70 = 130 and concluding import; the overlap must be subtracted. Answer: 90%.",
      },
      {
        question:
          "Work problem: A alone 20 days, B alone 30 days, C alone 60 days. Together, A works alternate days with B; how many days to finish?",
        answer:
          "Rates: A = 1/20, B = 1/30, C = 1/60. Together A+B+C on day 1 (or the alternating pattern) = 1/20 + 1/30 + 1/60 = 3+2+1/60 = 6/60 = 1/10 per day pair. If C works every day and A, B alternate... the standard shortcut: combined rate A+B = 1/12; with C = 1/10; treating the group as 1/10 per day gives 10 days. In the alternating variant, compute per-2-day block: A+C block = 1/20+1/60 = 4/60; B+C block = 1/30+1/60 = 3/60; pair sum 7/60 per 2 days → need 60/7 ≈ 8.6 pairs → 17.2 days → 18 days rounded. Read the pattern in the question carefully.",
      },
    ],
    cheat: [
      "Fractions ↔ percents: 1/8=12.5%, 1/3=33.3%, 3/8=37.5%, 5/8=62.5%, 7/8=87.5%.",
      "Successive a% then b%: net = a + b + ab/100.",
      "Reverse change net = x·x/100 for equal up/down percents.",
      "Average = sum/count; deviation method for small deviations.",
      "Rates add; work = rate × time; pipes: inlet − outlet.",
      "Train crosses bridge: length = train + structure; speed ×5/18 m/s.",
      "Inclusion–exclusion for two overlapping sets.",
    ],
    recap: `Quantitative aptitude at GATE level is pattern fluency: fractions as percents, ratios via unitary method, averages via totals, rates for work and distance, and inclusion–exclusion for overlapping groups — with arithmetic performed accurately enough that a single fraction slip does not cost you the question; drill each family until it is automatic, then aim at the tricky wrappers.`,
    code: {
      title: "Speed conversion table for D = S×T",
      language: "text",
      code: `km/h → m/s: multiply by 5/18\nm/s → km/h: multiply by 18/5\nTrain over bridge: time = (train length + structure) / relative speed`,
      explanation:
        "The one conversion worth memorizing; every time-speed-distance question reduces to it plus the sum of lengths.",
    },
    diagram: {
      title: "Rate-based problem template",
      caption:
        "Identify total work, set each rate as a fraction per unit time, add or subtract, invert for time.",
      mermaid: `flowchart LR\n  W[Total work] --> R[Rate per agent]\n  R --> S[Sum or difference]\n  S --> T[Time = work / net rate]`,
    },
  },
  "gate-cs-general-aptitude-and-gate-strategy-verbal-aptitude": {
    intro: `Verbal aptitude tests comprehension, grammar, vocabulary and logical language under exam conditions — how quickly you decode a passage, spot a usage error, or choose the correct synonym depends on structural habits far more than on vocabulary lists. The subject is technique: reading comprehension with question-first strategy, error spotting with a fixed checklist, sentence correction, and the small set of vocabulary patterns that recur across GATE and every aptitude paper.`,
    foundations: `The four verb families: reading comprehension (main idea, inference, tone, vocabulary-in-context), error spotting (subject-verb agreement, tense consistency, articles, prepositions, parallelism), sentence completion and correction (idioms, collocations), and vocabulary (synonyms, antonyms, analogies, one-word substitution). The foundational skill is reading for structure: topic sentence, contrast links (however, although), tone (ironic, measured, skeptical). Always read the question stem before the passage when time permits.`,
    concepts: [
      {
        title: "Reading comprehension: question-first strategy.",
        body: `Because exams test inference and tone rather than recall, start by reading the passage stems of the questions; then read the passage once actively, marking the topic sentence and transitions (however, therefore, but, although); then answer from the text, not from memory — the trap is choosing the answer that sounds plausible but is not supported. Inference questions reward answers that add nothing beyond the text; "radical" options are wrong; "reasonable and modest" options are right. Tone: measured, skeptical, ambivalent — never "enthusiastic" in academic passages.`,
      },
      {
        title: "Grammar checklists for error spotting.",
        body: `Subject-verb agreement (singular with each/every/neither/none), tense consistency within a sentence, articles (a/an/the), prepositions (interested in, capable of), parallelism (matching structure in a list), pronoun-antecedent clarity, and redundancy (repeat again, free gift). Scan in this fixed order — most errors fall in the first three categories. For sentence correction, eliminate options that introduce a second mistake while fixing the first; the correct option almost always preserves the original meaning with minimal change.`,
      },
      {
        title: "Vocabulary strategy for speed.",
        body: `Build roots, prefixes, suffixes (tele-, -ology, un-, -ness, -able): 200 roots cover a third of GRE-style words. Context beats memorization for meaning — use the tone of the sentence. Confusables that recur: affect/effect, complement/compliment, discreet/discrete, stationary/stationery, principal/principle. One-word substitution and analogy questions share the same root logic. In the exam, eliminate two obviously wrong options and decide between the remaining two on nuance.`,
      },
      {
        title: "Logical language and tone.",
        body: `Questions about the author\'s attitude (neutral, critical, cautiously optimistic), assumptions (what must be true for the argument to hold), and strengthen/weaken depend on mapping claim → evidence → assumption. Assumptions are bridges never stated; strengthen supports them, weaken attacks them; the exam favorite is the answer that attacks the assumption, not the evidence. Keep a mental skeleton of argument structure visible when reading; every inference question maps onto it.`,
      },
    ],
    worked: [
      {
        title: "Passage with four question types answered efficiently.",
        body: `Stem reading: (1) main-idea question → note first and last paragraph; (2) tone → look at attitude words; (3) inference → no outside knowledge; (4) vocab-in-context → answer from the sentence. Reading once, marking transitions; answers: main idea (second sentence, often), tone (measured), inference (conservative), vocab ("measured" = deliberate). The entire MCQ block takes 90 seconds with stem-first strategy; 3 minutes without it.`,
      },
      {
        title: 'Error spotting: "Each of the players were happy."',
        body: `Subject "Each" is singular → "was happy." Agreement with each/every/neither is the single most-tested rule; alternatives: "The team was happy" (collective as unit) or "The players were happy" (plural subject). The trap is attraction to the plural noun "players" sitting next to the verb.`,
      },
      {
        title: "Sentence correction with two candidate fixes.",
        body: `"Neither the manager nor the employees was aware of the incident." → "were aware" (proximity: verb agrees with nearer subject, employees). Trap: choosing "were" based on the rule but breaking meaning by also rewriting elsewhere unnecessarily. Minimal-change principle handles 80% of correction questions.`,
      },
      {
        title:
          'Vocabulary-in-context: "The minister was notably reticent." Meaning?',
        body: `Context clues: "notably" modifying "reticent" implies the opposite of talkative — reserved, uncommunicative. Options like "eloquent" fail tone; "ambiguous" fails meaning; the answer is "reserved/uncommunicative." Vocabulary in context is a logic puzzle, not a memory test — always derive meaning from the surrounding sentence.`,
      },
    ],
    exam: [
      {
        question:
          'In the sentence "Although tired, she continued working," the word "Although" is best replaced by?',
        answer:
          'The correct substitution is "Even though" — same concessive function and subordinating semantics. Options like "however" (conjunctive adverb, needs semicolon) or "despite" (preposition, cannot introduce a finite clause directly) fail grammatically; the concessive-clause test picks "even though."',
      },
      {
        question: "Choose the grammatically correct sentence.",
        answer:
          '"Neither the teacher nor the students were present" — the verb agrees with the nearer subject ("students", plural). "Neither the students nor the teacher were present" is the same form with the singular nearer subject and would need "was." The rule of proximity is the test maker\'s favorite agreement item; read the nearer subject first.',
      },
      {
        question:
          'The tone of an academic passage that ends "further work is required" is most likely:',
        answer:
          "Cautiously optimistic / measured. Not enthusiastic (no excitement language), not pessimistic (no despair), not sarcastic (no irony). GATE aptitude passages are neutral expository texts; the safest tone word is the one that agrees with the surface of the text.",
      },
      {
        question:
          'Identify the error: "He is one of the best players who has ever played."',
        answer:
          'The relative clause modifies "players," plural → "have ever played." The antecedent of "who" is the nearest plural noun ("players"), not "one." Classic distractor: singular proximity of "one." Answer: "who have ever played."',
      },
    ],
    cheat: [
      "Stem-first passage strategy; mark transitions (however, therefore, although).",
      "Agreement: nearest-subject rule wins for neither/nor, either/or.",
      "Each/every/neither/none → singular verb.",
      "Errors: tense, article, preposition, parallelism, redundancy — in that order.",
      "Answers must add nothing to the passage — no external knowledge.",
      'Fixation: tone questions default to "measured."',
      "Confusables: affect/effect, complement/compliment, stationary/stationery.",
    ],
    recap: `Verbal aptitude is structural reading discipline: stem-first passages, transition-marking, grammar checklists in fixed order, vocabulary via roots and context — with the invariant rule that answers must come from the text, not from what you wish were true; practice under time pressure until the checklist is invisible.`,
    code: {
      title: "Grammar scan order",
      language: "text",
      code: `1. Subject-verb agreement (each/every/neither/none → singular)\n2. Tense consistency\n3. Articles (a/an/the)\n4. Prepositions\n5. Parallelism and redundancy`,
      explanation:
        "Scan order catches most GATE verbal errors in seconds per sentence.",
    },
    diagram: {
      title: "Argument anatomy",
      caption:
        "Claim → evidence → assumption; inference answers the bridge, weaken answers the attack.",
      mermaid: `flowchart LR\n  C[Claim] --> E[Evidence]\n  C --> A[Assumption]\n  W[Weaken] -.-> A\n  S[Strengthen] --> A`,
    },
  },
  "gate-cs-general-aptitude-and-gate-strategy-logical-reasoning-and-data-interpretation":
    {
      intro: `Logical reasoning and data interpretation test your ability to extract structure — orderings, substitutions, Venn diagrams, contradictions, and charts — and to decide correctly under time pressure. The subject is mechanical pattern extraction: series completion, syllogisms, seating arrangements, blood relations, coded logic, and chart reading. The two halves look different but both reduce to formalizing the puzzle: write the constraints, eliminate impossibles, count the survivors.`,
      foundations: `Core families: number/letter series (differences, alternating operators, squares/cubes, digit cycles), syllogisms (all/some/no statements → Venn validation), seating/linear/circular arrangements (constraints as equations), coded logic (map given code rules), direction sense, blood relations (family tree sketching), clocks/calendars, and DI (bar/line/pie/table; percentage and ratio extraction, nave arithmetic in 10 seconds per question). The universal method: represent the information in a compact notation, then brute-force-solve logically, never by guessing.`,
      concepts: [
        {
          title: "Series completion: pattern forensics.",
          body: `Look at differences first (arithmetic), then ratios (geometric), then second differences, then alternate terms, then squares/cubes with offsets, then letter steps (A=1). GATE series almost always use one of these six; when stuck, write the terms and differences directly beneath. Two interleaved series are common (odd/even terms independent). Digit-cycle series appear for time or day-of-week problems: 1, 3, 9, 27 ... powers of three; calendars: 4-day jump per ordinary year, 1 over leap.`,
        },
        {
          title: "Syllogisms and coded statements.",
          body: `Convert every statement to a Venn: "All A are B" — circle A inside B; "Some A are B" — overlap; "No A is B" — disjoint. A conclusion is valid only if it must hold in EVERY valid configuration of circles; exam traps include "some B are A" vs "all B are A" confusion and distribution fallacies. For coded statements (A > B means A is taller, symbols reassigned), translate first, solve second, never evaluate in code language directly.`,
        },
        {
          title: "Arrangements: constraint bookkeeping.",
          body: `Linear seating: fix one person (usually by a definitive clue), then place everyone relative to them; circular: fix one seat, arrange clockwise; always draw a row/circle and fill; crossing-out impossibles is faster than writing certainties. Blood relations: draw the tree, label genders carefully (male/female), and translate terms (brother-in-law etc.) directly into edges; "at least X males" requires counting with gender assumptions unspecified. Direction: compass with fixed home + facing rotations; distance/shortest-path via Pythagoras or bearing math.`,
        },
        {
          title: "Data interpretation: the estimate-then-check method.",
          body: `DI questions never need exact arithmetic: estimate the bar/line values, compute the ratio or percentage roughly, match to the nearest option — options are usually well separated. Read the chart title and units first; misreading "in lakhs vs crores" is the classic trap. Pie charts: the total is the denominator, slice/360 or slice/angle; percentage shares from absolute numbers; growth rates from year-over-year differences. DI with time pressure is a 10-second exercise per question; exact arithmetic is a skill killer.`,
        },
      ],
      worked: [
        {
          title: "Series: 2, 6, 15, 31, 56, ?",
          body: `Differences: 4, 9, 16, 25 — squares 2², 3², 4², 5² → next difference 36 → 92. Answer: 92. The signature move: differences first look for squares/cubes/primes. If differences don\'t work, try ratios (geometric) or alternating patterns or squared-plus-constant. Check by continuing the sequence one more term backwards.`,
        },
        {
          title: "Syllogism: All A are B; some B are C; no C is D; therefore?",
          body: `Venn: A entirely inside B; B overlapping C partially; C and D disjoint. Valid conclusions: Some B are C (direct). Cannot conclude anything definitive about A vs C/D — no valid conclusion determines A∩D or A∩C. Exam answer options will include "All A are C" (invalid) and "Some A are not D" (invalid — could be all inside C? No, wait: some B are C, not A, so "Some A are not D" is indeterminate). Only guaranteed: Some B are C. In practice, GATE offers numbered conclusions and asks for only the correct ones; the discipline of checking every configuration is what separates right answers.`,
        },
        {
          title: "Seating: 5 people in a row, clue-based placement.",
          body: `Clue 1: A is left of B. Clue 2: C is not at either end. Clue 3: D is right of C. Fix C at position 2 or 4 (not ends). Case C=2: D ∈ {3,4,5}, A right of B on positions {1,4,3,5}... enumerate and prune with each remaining clue; only one arrangement survives. The entire family is case enumeration with pruning; drawing helps; never solve without a diagram — minds hallucinate positions, paper doesn\'t.`,
        },
        {
          title:
            "DI: Sales 2022=120, 2023=150, 2024=180; growth % latest year?",
          body: `2023→2024: (180−150)/150 = 20%. Estimated: the bar rose by a fifth — match to 20% option without long division. In exam conditions with 5 options, estimate within 2–3% and choose; only when options are adjacent (18% vs 19%) compute exactly. The habit saves 2 minutes per DI set.`,
        },
      ],
      exam: [
        {
          question: "Letter series: B, D, G, K, P, ?",
          answer:
            "Letter positions: 2, 4, 7, 11, 16 — differences: 2, 3, 4, 5 → next difference 6 → 22 = V. Answer: V. The pattern is consecutive integers added to letter numbers; count on fingers, never in your head — spelling out the alphabet mentally on paper is faster and safer.",
        },
        {
          question:
            "Syllogism: No A is B; all B are C; some C are D. Which conclusion follows?",
          answer:
            'No definitive conclusion among the offered options unless it is "Some B are C" (directly from all B are C). "Some D are not A" cannot be asserted — D could contain no B at all. The "no X is Y" premises preserve disjointness between the circles; the only certain assertions derive from "all" directly. The answer: only the "all B are C ⇒ some B are C" style conclusion.',
        },
        {
          question:
            "In a row, A is 9th from left, B is 9th from right; they interchange; A is now 15th from left. How many people?",
          answer:
            "After interchange, A is 15th from left = A's new position; A was originally 9th from left and 9th from right → total = 9 + 9 − 1 = 17. Check: after swap A takes B's old position = total − 9 + 1 = 9 from right → 15th from left ⇒ total − 14 = 15? Carefully: A's new position from left = 15 = old position from right counted appropriately → total = 15 + 9 − 1 = 23? Let us redo: A from left originally 9 → A's place 9. B from right 9 → B's place 17 (if total 25?). Interchange → A now at B's place; statement says A now 15th from left → total = 15 + 8 = 23. Solve: B at right position p from right with total n: position of B from left = n − p + 1 = n − 8; that equals 15 → n = 23. Answer: 23.",
        },
        {
          question:
            "P is the brother of Q; Q is the sister of R; R is the son of S. How is P related to S?",
          answer:
            "S is parent of R (son); Q is R's sister → S is also Q's parent; P is Q's brother → P is also S's child → S is P's parent. Answer: S is the parent (father or mother) of P; P is the son or daughter of S depending on gender unspecified. The exam expects \"child of S\" or specifically \"son\" only if P male — brother ⇒ male ⇒ son of S.",
        },
      ],
      cheat: [
        "Series: differences → ratios → second differences → alternate terms → squares.",
        "Syllogisms: Venn circles, five configurations; only universally true conclusions count.",
        "Arrangements: fix one, enumerate cases, prune with each clue.",
        "DI: estimate first; exact arithmetic only if options are adjacent.",
        "Blood relations: draw the tree with genders; translate sibling/parent edges.",
        "Inclusion-exclusion: total = A + B − both; some = overlap; none = outside.",
      ],
      recap: `Logical reasoning and DI reward disciplined notation over cleverness: write the constraints down, eliminate with every clue, estimate options instead of computing exactly; the exam is a bookkeeping contest — the winners are those who verify exhaustively without panic.`,
      code: {
        title: "Venn notation quick reference",
        language: "text",
        code: `All A are B: A circle inside B\nSome A are B: overlapping circles\nNo A is B: disjoint circles\nConclusion rules: some passes, all mostly fails, no usually fails`,
        explanation:
          'Every syllogism maps to circles; the truth test is "does this conclusion hold in all five circle arrangements?"',
      },
      diagram: {
        title: "Data interpretation loop",
        caption:
          "Read title/units → estimate → compare options → compute only if needed.",
        mermaid: `flowchart LR\n  T[Title and units] --> E[Estimate]\n  E --> O[Match to options]\n  O -->|adjacent| X[Exact math]`,
      },
    },
  "gate-cs-general-aptitude-and-gate-strategy-spatial-and-analytical-aptitude":
    {
      intro: `Spatial and analytical aptitude measure mental rotation, arrangement reasoning, pattern completion, and visual elimination — the ability to see a 3D object from 2D, count hidden cubes, or select the missing piece. The subject is systematic: physical rules (rotations, reflections, projections) applied without imagination-dependency, turning fuzzy puzzles into checklist procedures.`,
      foundations: `Families: counting cubes/stacks from a rendered sketch, folding/unfolding nets and boxes, rotations and reflections (mirror/water image), pattern completion with missing shapes, and analytical ordering (rankings, races, schedules). The foundation is disciplined geometry: every 3D object can be described by layers (bottom to top) with counts per layer; every rotation is a composition of 90° turns around axes; every reflection is a flip along an axis; eliminations happen by marking anchors (distinct features) and tracking them through the transformation.`,
      concepts: [
        {
          title: "Counting cubes and hidden structure.",
          body: `Method: count visible cubes per horizontal layer, add hidden support cubes (if a cube is floating in view, it rests on an equal or greater stack); never trust "looks like N cubes" impressions — draw the layer grid and fill systematically. Two common traps: cubes obscured behind others (the row you see, not the depth you assume) and cubes on the far side (visible condition: the nearest surface of a cube is visible; check the viewing angle). The exam draw is almost always slightly smaller than imagination suggests; count by layers.`,
        },
        {
          title: "Folding and unfolding: nets to boxes to faces.",
          body: `A cube net has 6 squares; opposite faces are never adjacent along an edge; when folded, adjacent-in-net faces become adjacent in the cube; check opposites by folding mentally in two 90° turns: after two folds, the far face is opposite the starting face; configurations with 4-in-a-row plus two attachments are the common traps. The elimination trick: mark the face with the distinctive marking, rotate it to the reference orientation, and see where neighbors land; matching one local configuration is enough to eliminate wrong options.`,
        },
        {
          title: "Reflections vs rotations: the mirror vs the turn.",
          body: `Mirror image: flip horizontally (left-right swap); water image: flip vertically (top-bottom swap); neither involves rotating the shape by 90°/180°. Text in mirror shows reversed letters in original order with each letter mirrored; numbers like 6 and 9 swap; under 90° clockwise rotation, right side faces down, bottom faces left, etc. — always re-derive from the axes, never rely on feel. The error that costs candidates: assuming water image equals flipping the paper vertically, when the actual rule flips each glyph individually too.`,
        },
        {
          title: "Pattern completion and figure series.",
          body: `Patterns vary by: number of elements (add/remove), shading (rotate/fill), positions (rotate around center), line counts (increase/decrease), or combinations. Strategy: describe each frame in words before choosing ("three arrows, two shaded, rotating 90°"), find the delta rule, and predict the next frame; when stuck, check whether the rule applies to the center element vs the periphery, or distinguish black/white alternation. The GATE spatial section is rarely hard if described verbally; it is brutal if pattern-matched by eye alone.`,
        },
      ],
      worked: [
        {
          title: "Count cubes in a stepped 4×3×2 arrangement.",
          body: `Draw layers from top: layer 3 (z=2): single cube at (1,1) = 1; layer 2 (z=1): two cubes at (1,1) and (2,2) = 2; layer 1 (z=0): 3×2 grid minus 2 stacked = 4 more → total 1+2+4? No — per-layer direct counts: top 1, middle 2 (at stacked positions), bottom 6 (=4+2 underneath) → total 1+2+6 = 9. Plus verify by counting visible faces: front face shows 3, side shows 2, top shows 3; consistency checks: no floating cube, stack counts match. Answer: 9 cubes.`,
        },
        {
          title: "Identify the cube net that folds into the given die.",
          body: `Opposite pairs in candidate nets: check each net by folding mentally; eliminate any net where two opposite-appearing faces are adjacent in the given die (that rules out two options); with one option left, confirm the shared edge — done. The "two opposites adjacent" elimination removes most options in one step; this is the efficient path through every die question.`,
        },
        {
          title:
            "Analytical: A finishes before B; C before D; B before C; order?",
          body: `Chain: A < B < C < D → order A, B, C, D. Ranking-style analytical puzzles chain the given comparisons transitively; when some comparisons are open, enumerate free orders against fixed anchors. Races: finishing order from "A beat by B, C beat D" — assign positions greedily; schedules: build a grid, fill definite times first, propagate constraints to neighbors.`,
        },
        {
          title: "Figure series with rotating shaded quadrant.",
          body: `Each frame: a square divided into four quadrants; shaded quadrant moves one quadrant clockwise each step; after 4 frames returns to start. Given three frames, the fourth shades the quadrant reached by one more clockwise move. Describe aloud: "shaded quarter moves 90° clockwise each frame" — verbal description locks the rule; mis-describing means mis-seeing.`,
        },
      ],
      exam: [
        {
          question:
            "How many cubes are needed for a staircase of 3 steps, each step 2 cubes wide?",
          answer:
            "Step 1 (front): 2 cubes, step 2: 2 cubes on top of 2 base = 4, step 3: 2 on top of 4 = 6; total 2+4+6 = 12. Alternative count: layers bottom-back: 6, middle: 4, top: 2 = 12 — same answer. Method: count per layer every time.",
        },
        {
          question:
            "A cube is painted on all six faces then cut into 27 unit cubes. How many have exactly 3 painted faces?",
          answer:
            "Only the 8 corner cubes have 3 painted faces. Exactly 2 painted: 12 edge-center cubes; exactly 1: 6 face-center; 0: the single inner cube. Totals check: 8+12+6+1 = 27 ✓. The corner rule is invariant for any n×n×n: always 8 three-face cubes.",
        },
        {
          question: 'Which of the following is the water image of "B6S"?',
          answer:
            'Flip vertically: the B becomes its vertical mirror (remains B in most fonts), 6 becomes 9, S becomes itself mirrored (S is vertically symmetric) → "S9B" reading order reversed with glyphs flipped — effectively the water image shows "B6S" upside down: S-like glyph, then 9, then B-like glyph. The exam expects careful glyph-level vertical flip, not order reversal alone.',
        },
        {
          question:
            "In a race, A finished before B, C finished after D, and D finished before A. Who won?",
          answer:
            "C after D; D before A; A before B → C > D > A > B in time (slower is later); the winner is the one with the smallest time: D. Chain: C–D–A–B → D first, then A, then B, C last. Always write the chain with positions sorted; the race order emerges directly.",
        },
      ],
      cheat: [
        "Count cubes by horizontal layers; add hidden supports.",
        "Opposite faces in a cube net: never adjacent; test two-net elimination first.",
        "Mirror = horizontal flip; water image = vertical flip; glyphs flip individually.",
        "Analytical: chain all stated comparisons transitively; sort.",
        "Figure series: describe aloud; count elements, shading, rotation.",
        "Hidden cubes: nearest visible face test; layers bottom-up.",
      ],
      recap: `Spatial and analytical aptitude rewards method over imagination: count by layers, fold nets with opposite-face elimination, flip glyphs for mirror questions, chain comparisons for races and schedules — the exam is a series of small deterministic checks, and the candidates who lose are those who squint harder instead of writing more carefully.`,
      code: {
        title: "Cube paint analysis (3×3×3)",
        language: "text",
        code: `Exactly 3 painted: 8 corners\nExactly 2 painted: 12 edge centers\nExactly 1 painted: 6 face centers\n0 painted: 1 interior cube\n8+12+6+1 = 27 ✓`,
        explanation:
          "The formula for n³ sub-cubes scales predictably and is worth deriving once before the exam.",
      },
      diagram: {
        title: "Net folding order",
        caption:
          "Start from a central face, fold neighbors up two at a time; opposite faces are never adjacent.",
        mermaid: `flowchart LR\n  N[Net layout] --> F[Fold two faces]\n  F --> O[Check opposites]\n  O --> V[Verify marker edges]`,
      },
    },
  "gate-cs-general-aptitude-and-gate-strategy-previous-year-question-strategy":
    {
      intro: `Previous-year question strategy is the craft of studying GATE papers as a distribution, not a list — classifying every past question by topic, weight, and pattern, so that your preparation targets where marks actually live, not where syllabus chapters lie. The subject is empirical: mine the last 10 papers, build a topic×year frequency table, spot the recurring shapes, and let it set your study order and time-per-topic.`,
      foundations: `GATE CS spans: 60% technical (Engineering Mathematics, Digital Logic, COA, PDS, Algorithms, TOC, Compiler Design, OS, DBMS, Networks) and the rest general aptitude + technical aptitude. Weights per topic from previous papers (approx. average): Engineering Mathematics 8–9, COA 7–8, OS 8–10, DBMS 7–8, Algorithms 6–8, Digital Logic 4–5, TOC 4, Compiler Design 3–4, PDS 5. Aptitude 15. Pattern: heavy on algorithms + math + OS, lighter on compiler + TOC. Wrong-answer penalty: −1/3 (MCQ), 0 for NAT. Strategy: do every question you know, skip the rest — expected value of attempting uncertain ones is negative.`,
      concepts: [
        {
          title: "The frequency audit: where the marks live.",
          body: `Download the last 10 GATE CS question papers; create a table: rows = topics, columns = years, cells = marks per topic per year; compute averages. Recurring blocks: computer organization and memory hierarchy appears every year (7–9 marks total); operating systems scheduling and synchronization come up 1–2 questions yearly; engineering mathematics set theory + linear algebra + probability covers a quarter; aptitude is always 15 marks, safe at high accuracy. Your study order should match average marks descending — candidates who study alphabetically or sequentially waste hours on low-yield chapters.`,
        },
        {
          title: "Pattern mining inside topics.",
          body: `Within OS scheduling, the recurring shape is: given arrival/burst times, compute Gantt chart, average waiting/turnaround time — practice 20 of these and the exam question is a formula lookup. Networks: subnetting numericals recur yearly; learn the magic of 256 − mask and done. DBMS: normalization asked via functional dependency closures — drill closures until automatic; B+-tree operations with figures — rehearse; algorithms: master theorem recurrences and Huffman tree numerical every year. The skill is not "doing past papers" in the abstract — it is recognizing that the exam gives you 80 prototypes in new clothes.`,
        },
        {
          title: "Trap catalogs and the negative-mark harvest.",
          body: `GATE traps are consistent: (1) confusing "which of the following is NOT true," read the negation; (2) NAT answers in decimal vs percentage — re-read unit; (3) options that all seem plausible because each holds for a different interpretation of the question — check assumptions ("assuming non-negative weights..."); (4) two technically-valid answers where one is "most appropriate" — the wording directs you. Build your own trap log from every mock test you take; 30 traps cover 60% of wrong answers. Never change an answer after full deliberation unless you find a factual misremembering — intuition on first read is usually better calibrated than mid-exam doubt.`,
        },
        {
          title: "Revision scheduling from weights.",
          body: `Allocate study time proportional to average marks × your weakness; e.g., a strong candidate spends more on OS and math; a weak candidate on aptitude (cheap 15). The final 8 weeks: one full-length mock per week in exam conditions; analysis within 24 hours; map every wrong answer to a category (concept gap, reading trap, time pressure, calculation slip); targeted fix; the same trap never sees you twice. Mock discipline: attempt ML from easier toward harder — never camp on one hard question while aptitude is untouched.`,
        },
      ],
      worked: [
        {
          title: "Build a 7-topic × 5-year mark matrix in an hour.",
          body: `Collect papers (gateoverflow or official PDFs); for each year, grep/extract questions per subject; tally marks; table shows: OS always ≥ 8, Math ≥ 8, Networks ≥ 5, DBMS ≥ 6, COA ≥ 6, Digital Logic ≥ 4. Conclusion: master OS, Math, COA, DBMS deeply — these four are guaranteed half the Technical section; Digital Logic and TOC can be skimmed at moderate depth. The audit is one hour of work that reallocates 100+ study hours where they pay.`,
        },
        {
          title: "Classify 20 past questions by family and difficulty.",
          body: `Sort 20 random questions: 8 = direct formula application (syllabus-mastered), 6 = multi-step numerical (algorithms/math), 4 = conceptual with ze hidden trap (DBMS normalization), 2 = weird edge case. First-pass accuracy: those 8 and the 6 medium ones; skip the 2 edge cases; this ordering recovers 70 of 100 marks on similar exams. The granularity reveals that 60–70% of GATE is mechanical; your effort should mirror that distribution.`,
        },
        {
          title: "Wrong-answer analysis from a mock attempt.",
          body: `Mock shows: 4 wrong in OS (all scheduling numerical — fix: redo 25 problems), 3 wrong in networks (subnetting — fix: redo 20 after the mask lesson), 2 wrong in aptitude (verbal — fix: vocab list), 1 wrong due to misread of "NOT" (fix: underline qualifiers in every question — now mandatory), 1 wrong in calc slip (fix: estimation check). The log turns feeling-based preparation into engineering iteration.`,
        },
        {
          title: "Time allocation plan for the 3-hour exam.",
          body: `First pass (90 min): attempt all direct questions — aptitude, formula-numericals, 1-mark conceptuals; mark unclear for second pass; submit-safe strategy: never leave easy ones for the hard ones. Second pass (60 min): attempt marked questions; skip after two failed attempts. Third pass (30 min): re-check formulas that have surprised you in mocks; do not revisit everything — panic opens new doubts. The plan turns three hours into three controlled passes; average scores rise 8–12 marks vs random-order attempts.`,
        },
      ],
      exam: [
        {
          question:
            "Which topic has historically the highest average weight in GATE CS Technical?",
          answer:
            "Engineering Mathematics and Operating Systems and Computer Organization and Architecture consistently carry the heaviest weight — each contributes on the order of 8–10 15-mark questions to each paper. Engineering Mathematics alone historically accounts for a quarter of the Technical section; these two accounts for over a third.",
        },
        {
          question:
            "Why is it better to skip a question than to guess in GATE MCQs?",
          answer:
            "GATE MCQs carry −1/3 penalty for wrong attempt; a blind guess among four options has expected value −1/6 mark per question; skipping yields zero, attempting randomly yields negative — negative marks compound over a paper; only attempt when you can eliminate at least one option, or when the expected value turns non-negative with partial knowledge (eliminate one or two options).",
        },
        {
          question:
            "What is the correct use of the last 30 minutes of the exam?",
          answer:
            'Targeted verification of high-risk formulas and ambiguity re-check — not a full re-read, which breeds doubt; priority: re-derive substitutions for formula questions you were unsure of, and re-read questions flagged with "NOT" or units. Do not revise decisions you already made carefully; the marginal yield of re-reading everything is negative.',
        },
        {
          question:
            'A candidate marks 45/65 questions; analysis shows 8 wrong all in "not reading carefully." What is the one change most likely to raise the score?',
          answer:
            "A mandatory 5-second re-read of every question stem (especially qualifiers) before locking in an answer — the trade costs ~5 minutes overall, recovers nearly a full mark per re-caught misread, and removes the single largest error category — it outweighs more content hours at this stage of preparation.",
        },
      ],
      cheat: [
        "Mine last 10 papers; build topic×year mark matrix; study in descending weight order.",
        "Engineering Math + OS + COA = over a third of Technical; master these first.",
        "Recurring prototypes: OS Gantt charts, subnetting, FD closures, B+-tree ops, Master theorem.",
        "Skip over guess; attempt only with elimination; −1/3 penalty always.",
        "Mocks weekly final 8 weeks; wrong-answer taxonomy; never same trap twice.",
        "Three-pass exam plan: safe first, solve marked second, verify formulas third.",
      ],
      recap: `GATE rewards empirical preparation: frequency analysis across past papers, prototype drilling until mechanics are automatic, disciplined error logs, and a three-pass exam strategy — the candidates who understand the paper as a distribution of 70 learnable patterns routinely outscore equally bright peers who treat it as an infinite universe of possible questions.`,
      code: {
        title: "Wrong-answer taxonomy log",
        language: "text",
        code: `Categories: concept gap / reading trap / time pressure / calculation slip / careless K.\nPer mock: count by category; fix the largest bucket; verify reduction next mock.`,
        explanation:
          "Turning feelings into counts is the simplest way to convert mocks into score gains.",
      },
      diagram: {
        title: "Three-pass exam plan",
        caption:
          "Safe questions first, marked questions second, formula verification third — never camp on one hard item.",
        mermaid: `flowchart LR\n  P1[Pass 1: safe questions] --> P2[Pass 2: marked questions]\n  P2 --> P3[Pass 3: verify]`,
      },
    },
};

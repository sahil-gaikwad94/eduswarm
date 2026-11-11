import type { TopicLesson } from "../topicLessons.js";

/**
 * Database Management Systems — 5 authored topic lessons.
 *
 * Standalone chapters per topic. Subject-first prose, foundations, core
 * concepts, worked examples, exam practice, cheat sheet, recap. No shared
 * templates, no runtime composition.
 */
export const databaseManagementSystems: Record<string, TopicLesson> = {
  "gate-cs-database-management-systems-er-modeling-and-relational-algebra": {
    intro: `ER modeling and relational algebra are the twin pillars of schema design: the entity-relationship diagram captures what the business sees, and relational algebra proves what the database can compute with it. The subject covers entities, attributes, relationships, keys, cardinality, weak entities, and the six classical operations (selection, projection, join, Cartesian product, union, rename) with their evaluation rules.`,
    foundations: `ER model: entity (rectangle) with attributes (ellipse), key attributes (underlined), multi-valued (double ellipse), derived (dashed); relationship (diamond) with cardinality (1, N, M); total participation (double line) vs partial; weak entities depend on owner key (double rectangle, identifying relationship). Relational model: relations = tables, tuples = rows, attributes = columns, domain = allowed values; superkey → candidate key → primary key; foreign key references; relational algebra: σ (select rows), π (project columns), ⋈ (natural join), × (cross product), ∪ (union), − (set difference), ρ (rename), ∩, ÷ (division — all-of queries); operations produce relations; closure property.`,
    concepts: [
      {
        title:
          "Entities, attributes, keys, and cardinality — the modeling grammar.",
        body: `Entities are things with independent existence (Student, Course); attributes describe them; key = minimal attribute set uniquely identifying a tuple (superkey ⊇ candidate key ⊇ primary key — pick one candidate to be PK); composite attributes split naturally (name → first, last); multi-valued (phone numbers) force new tables; derived (age from DOB) computed not stored; cardinality 1:1 (one-to-one, FK either side), 1:N (one-to-many, FK on many side), M:N (many-to-many, junction/associative table with composite PK); participation: total means every entity must participate (employee must belong to department) — double line; partial single line. The exam asks to draw the ER diagram for a given mini-world every time — know the shapes cold.`,
      },
      {
        title: "Weak entities and identifying relationships.",
        body: `Weak entity has no key of its own — identity derived from owner (Room in Building: Building(building_id) → Room(building_id, room_no)); partial key (discriminator) + owner PK forms complete key; identifying (double) relationship ties them; participation total on weak side; when to use: entity whose meaning depends wholly on another — classical exam example: dependent of employee (SSN shared? dependents key = (emp_SSN, dep_name)) — no independent existence without the employee; weak entities dissolve when owner dissolves (cascade delete); the ER technique prevents orphan rows by construction.`,
      },
      {
        title: "Relational algebra: the six primitive operations.",
        body: `σ_selection: rows qualifying a predicate (σ_salary>50000(EMP)); π_projection: columns, eliminate duplicates (π_name(EMP)); ρ_rename: rename relation/attributes (ρ_S(B)(EMP)); ×_cross: all pairs of tuples (R×S — |R||S| rows — the combinatorial engine behind joins); ⋈_natural join: R×S followed by σ on equality of common attributes, projecting away duplicates — the workhorse; ∪_union: set union of compatible relations; −_difference: tuples in R not in S; ÷_division: tuples whose pairings cover all of the divisor — the "for all" operator (students who take ALL courses in some set) — the least understood and most examined operation; every RA expression composes these — closure: output of every op is a relation.`,
      },
      {
        title: "Extended algebra and evaluation strategies.",
        body: `∩_intersection: tuples in both; θ-join: σ_θ(R×S) generalized with any condition; left/right/full outer join (pads unmatched with NULLs — SQL); aggregate Γ: γ_sum(salary) group by department; division expressed: A ÷ B = π_A(A) − π_A((π_A(A)×B) − A) — the formula every exam wants derived or applied; evaluation: query planners choose join orders — pushing selections before joins shrinks intermediate sizes (the golden rule of RA optimization since 1974); exams ask "which algebra expression is cheapest" or "reduce intermediate tuples" — selection-push-down answers every time.`,
      },
      {
        title: "ER to relational mapping: the translation rules.",
        body: `Strong entity → table with PK; weak entity → table with owner PK + discriminator as composite PK; 1:1 relationship → merge tables or FK either side (FK unique constraint); 1:N → FK on N side; M:N → junction table with FKs; multi-valued attribute → separate table (owner PK + value, both PK); derived → compute, don\'t store (or store + trigger); n-ary relationships → table with FKs to all participants; generalization/specialization: EER → table-per-type with shared PK, or single-table-with-discriminator; every mapping rule exists to kill NULLs and preserve integrity — GATE asks to convert given ER to schema and identify keys; the six mapping rules above are the whole syllabus.`,
      },
    ],
    worked: [
      {
        title: "Draw ER for university: students, courses, enrollment.",
        body: `Entities: Student(sid PK, name, dob), Course(cid PK, title, credits), Instructor(iid PK, name); relationships: teaches (Instructor–Course, 1:N), enrolls (Student–Course, M:N), prerequisite (Course–Course, M:N); attributes: dob multi-valued? give address as multi-valued? derived age from dob (dashed); cardinalities: instructor teaches ≥1 course (total on instructor side optional?); seats per course → participation constraints; keys: enrolls becomes junction (sid,cid); the diagram yields tables directly — practice the full flow; every university-variant exam is isomorphic.`,
      },
      {
        title: "Evaluate π_name(σ_dept='CS'(EMP ⋈ DEPT)).",
        body: `Join EMP⋈DEPT on deptno: combined tuples (emp fields + dept fields) filtered dept=\'CS\' → project name; intermediate sizes: |EMP|×|DEPT| worst before filter if planner is stupid — with selection pushed: filter DEPT first → tiny intermediate → join — good plan; bad plan scans everything; the planner\'s ranking via cardinality estimation dominates real cost — GATE asks intermediate-size counting for tiny instances — never actually materialize crosses by hand carelessly.`,
      },
      {
        title:
          'Write RA for "students who took every course offered by dept CS".',
        body: `T = π_sid(Student) ÷ π_cid(σ_dept=\'CS\'(Course)) — division; the formula: A ÷ B where B = CS course IDs; A = enrollment pairs (sid,cid); answer students whose enrollment pairs cover all CS courses; every division question rewrites to the difference-of-projections formula when they ask derivation — memorized once, usable forever; the concept is "for all" — relational algebra\'s quantifier escape hatch to ∀.`,
      },
      {
        title: "Map M:N employee-project assignment to tables.",
        body: `Employee(eid PK, name), Project(pid PK, title), WorksOn(eid, pid, hours) — WorksOn PK = (eid,pid); hours is the relationship attribute; FKs: eid→Employee, pid→Project; total participation on both sides? assume yes; WorkOn must match existing entity rows — ON DELETE CASCADE if entity deleted; all three tables together = normalized junction pattern; every M:N relationship in production databases lives like this; the ER diagram maps to exactly these three tables, mechanically.`,
      },
    ],
    exam: [
      {
        question:
          "What is the difference between a weak and a strong entity set?",
        answer:
          "Weak entity has no candidate key of its own — identified only via owner entity's key plus its discriminator; strong entity has one; weak entity participation must be total in identifying relationship; weak entity deletion cascades from owner; classic example: dependents of employees.",
      },
      {
        question:
          "Which relational algebra operation is analogous to SQL's SELECT clause?",
        answer:
          "π (projection) — selects columns, eliminates duplicates as a set operation; the exam question distinguishes σ (rows, WHERE) from π (columns, SELECT); every student who confuses them loses one free mark per paper — distinguish σ=horizontal filter, π=vertical filter.",
      },
      {
        question: "State the closure property of relational algebra.",
        answer:
          "Every operation takes relations and returns a relation — outputs can feed further operations; SQL analogously closed; closure enables expression composition without conversion — the algebra is self-contained; the exam answer wants the phrase and one sentence of implications.",
      },
      {
        question:
          "What is the cartesian product's role in RA and why is it dangerous?",
        answer:
          "It pairs every tuple with every other — the engine of join; size multiplies instantly (1M × 1M = 10^12) — bad plans explode intermediates; every optimizer's job is to avoid materializing it, pushing selections first; GATE asks cost and size — never honestly materialized by hand at scale.",
      },
    ],
    cheat: [
      "ER: entity, attr, key, rel; 1:1, 1:N, M:N; total/partial participation double/single line.",
      "Weak entity: owner PK + discriminator = composite key; identifying relationship.",
      "RA ops: σ rows, π cols, ⋈ join, × cross, ∪/−/∩/÷, ρ rename; outputs always relations.",
      "Selection pushdown: σ before ⋈ shrinks intermediates — the golden optimization rule.",
      'A ÷ B = π(A) − π((π(A)×B) − A) — the formula for "for all".',
      "ER→SQL: 1:N FK many side; M:N junction; multi-valued new table.",
    ],
    recap: `ER and relational algebra are the dual formalisms of databases: pictures for business, algebra for machines — entities with keys and cardinalities map mechanically to tables, and every query reduces to algebra you can reason about; because the model is closed under its operations, every SQL you write is one expression tree deep — learn to read it, and debugging stops being guessing.`,
    code: {
      title: "RA to SQL mapping",
      language: "text",
      code: `σ_cond(R ⋈ S)  ==  SELECT * FROM R JOIN S ON cond\nπ_cols(R)      ==  SELECT DISTINCT cols FROM R`,
      explanation:
        "The correspondence making RA the mental compiler behind every query you write.",
    },
    diagram: {
      title: "From diagram to tables",
      caption:
        "ER constructs map one-to-one to tables — mechanical, lossless, reversible.",
      mermaid: `flowchart LR\n  E[Entities and relationships] --> M[Mapping rules]\n  M --> T[Tables with keys and FKs]`,
    },
  },
  "gate-cs-database-management-systems-er-to-relational-mapping": {
    intro: `ER to relational mapping is the translation layer from diagrams to tables — the seven mechanical rules every schema generation follows, and the point where most ER diagrams turn into broken SQL. The subject covers mapping of strong/weak entities, all three relationship cardinalities, multi-valued attributes, ternary relationships, and generalization hierarchies; every rule exists to eliminate redundancy and enforce integrity structurally.`,
    foundations: `Rules: (1) strong entity → table, PK = key attribute; (2) weak entity → table with owner PK + discriminator as composite PK, FK to owner with ON DELETE CASCADE; (3) 1:1 → single table merge or FK either side with unique constraint; (4) 1:N → FK on N side referencing parent PK; (5) M:N → junction table with composite PK (FKs), attributes travel; (6) multi-valued attribute → separate table (owner FK + attribute, both PK); (7) n-ary relationship → table with n FKs; (8) derived attribute → computed, never stored (unless maintained deliberately); (9) generalization: single table with type flag, or class tables per level with shared PK, or table per leaf with full attribute copy (highest redundancy trade); (10) primary key promotion: partial keys become full keys via owner.`,
    concepts: [
      {
        title: "Strong and weak entities: the two starting moves.",
        body: `Strong: one table per entity, key attributes become PK, non-key attributes as columns; weak: owner PK inherited + discriminator forms composite PK; FK with CASCADE ON DELETE — removing owner removes dependents; removing owner SET NULL if weak entity semantics allow; example: Building(bid) → Room(bid, room_no, capacity) — Room.bid, room_no composite; losing Building row destroys Room rows — exactly the semantic you want for "room cannot exist without building"; the rule never changes regardless of how exotic the domain — GATE exams restate it verbatim every year.`,
      },
      {
        title: "Relationship mapping by cardinality: 1:1, 1:N, M:N.",
        body: `1:1 — merge or separate tables with FK + UNIQUE both sides optional; merge preferred when both sides share full participation, separate when optional or distinct lifecycles; 1:N — FK on N side references 1-side PK — the most common pattern on Earth; M:N — new junction table, composite PK of the two FKs, attributes of the relationship as columns there; hours worked on WorksOn example — the junction is where the data actually lives; every 1:N violation (repeating groups) creates update anomalies — mapping rules exist precisely to forbid them at the schema level.`,
      },
      {
        title: "Multi-valued attributes and derived data.",
        body: `phone_numbers(Person) multiple → Person_Phone(person_id, phone) — both PK-ish (person_id, phone) — else duplicates; colors(Product) → Product_Color; every multi-valued set flattened to its own table — the alternative (comma-delimited lists) is the single worst practice in relational design, failing 1NF flagrantly; derived (age, tenure, full_name) — store raw, compute at query time (or trigger-maintained snapshot for hot paths) — stale derived values are worse than none; derivable always from stored base truth — the rule is the rule.`,
      },
      {
        title: "n-ary relationships and complex structures.",
        body: `Ternary (Doctor–Patient–Drug with dose): new table (doctor_id, patient_id, drug_id, dose) — composite PK; binary split loses the ternary fact (which doctor gave which drug to which patient as one event) — never decompose unless semantics genuinely allow; higher-arity same; reification of relationships as entities — the "relationship becomes a table" move; connecting chains of entities through junction after junction is how real enterprise schemas look; the mapping rule generalizes: relationships are tables with FKs and possibly their own attributes; arity never changes the rule, only the number of FKs.`,
      },
      {
        title: "Generalization and specialization hierarchies.",
        body: `EER inheritance: Vehicle → Car, Truck, Motorcycle; options: (a) single table + discriminator (type column) — simplest, NULLs galore, ugly; (b) table per subclass with shared PK (Vehicle.vid PK; Car(vid PK, ...); Truck(vid PK, ...)) — clean, requires UNION for full query or joins; (c) table per leaf full copy (vid, name, common_fields, car_fields) — maximum denormalization, no joins; (d) table-per-class with attribute table per class (PurchaseOrder separate tables and view) — purest OO→relational impedance match. GATE asks which strategy avoids NULLs or avoids redundancy — the classic trade-off question; know all four with one line each.`,
      },
    ],
    worked: [
      {
        title: "Map weak entity: Employee and Dependent.",
        body: `Employee(eid PK, ...); Dependent(eid, dep_name, relation, age) — PK (eid, dep_name); FK eid → Employee ON DELETE CASCADE; no dependent without employee; cascade removal guaranteed; every dependent row carries owner identity — the discriminator + owner key form the complete unique identifier — the textbook definition of weak entity realization; GATE asks to name the composite key and the cascade behavior — both immediate.`,
      },
      {
        title: "Convert M:N relationship with attribute to tables.",
        body: `WorksOn(eid, pid, hours): eid FK, pid FK, hours attribute on relationship; PK = (eid, pid); hours stored there not in either entity — relationship attributes live in the junction; composite PK forbids duplicate (eid,pid) pairs; both FKs refer to Employee and Project; cascade delete of employee removes their WorksOn rows — integrity enforced declaratively; the pattern scales to timesheets, enrollments, orders — every multi-entity fact lives this way.`,
      },
      {
        title: "Handle multi-valued attribute: student phone numbers.",
        body: `Student(sid PK, name); Student_Phone(sid, phone) — sid FK → Student; PK (sid, phone); multiple phones per student — separate rows; regression: storing phone list in CSV in Student.phone violates 1NF, blocks indexing per phone, breaks update atomicity — never; GATE asks to identify the violating schema from a list — every CSV-in-column candidate is the trap.`,
      },
      {
        title: "Model Vehicle hierarchy with the three strategies.",
        body: `Option A: Vehicle(vid, make, model, fuelType?, payload?, axles?) — sparse columns with type discriminator — many NULLs; Option B: Vehicle(vid, make, model); Car(vid, doors, fuel_type); Truck(vid, payload, axles); Motorcycle(vid, cc, type) — PK vid everywhere, joins to reconstruct; Option C: VehicleCar(...full copy...), VehicleTruck(...) — no sharing, duplicates common attributes statically; GATE: "which minimizes NULLs?" → B; "which avoids JOINs?" → C; "simplest?" → A; every inheritance question is one of these three trade-offs; answer in one line and move on.`,
      },
    ],
    exam: [
      {
        question: "How do you map a weak entity to relations?",
        answer:
          "Composite primary key from owner PK + discriminator; FK to owner with cascade; no independent identity; table cannot exist without owner; the standard answer verbatim in every exam; repeat until recited.",
      },
      {
        question: "Why must multi-valued attributes get their own tables?",
        answer:
          "First normal form requires atomic attribute values; repeating groups in a column violate 1NF; separate tables with (owner_key, value) PK restores atomicity, indexability, integrity — the rule is enforced by schema structure, not application discipline.",
      },
      {
        question: "Where do M:N relationship attributes live?",
        answer:
          "In the junction table, as ordinary columns; not in either participating entity — they belong to the pairing, not to either endpoint; every exam M:N with attribute question tests exactly this.",
      },
      {
        question: "Which generalization strategy eliminates NULLs?",
        answer:
          "Table-per-subclass with shared PK — no NULL columns because none are forced; single-table wins on simplicity but pays with sparse columns; GATE answer: table-per-subclass avoids NULLs; union of subclasses reconstructs the parent.",
      },
    ],
    cheat: [
      "Strong → table+PK; weak → owner PK + discriminator + cascade FK.",
      "1:1 → merge or FK+unique; 1:N → FK many side; M:N → junction + composite PK.",
      "Multi-valued → separate table (owner, value); never CSV-in-column.",
      "Derived attributes: compute, don't store.",
      "Relationship = table with FKs + its own attributes; n-ary = n FKs.",
      "Generalization: single-table sparse / subclass-table shared-PK / leaf-table copy.",
    ],
    recap: `Mapping is the mechanical bridge between circles-and-lines and rows-and-keys: weak entities gain identity from owners, relationships gain tables with foreign keys, multi-values gain columns of their own, and generalizations gain three competing cheap designs — every rule exists to make redundancy structurally impossible rather than merely unlikely.`,
    code: {
      title: "Weak entity DDL",
      language: "sql",
      code: `CREATE TABLE room ( building_id INT, room_no INT, capacity INT,\n  PRIMARY KEY (building_id, room_no),\n  FOREIGN KEY (building_id) REFERENCES building(building_id) ON DELETE CASCADE );`,
      explanation:
        "Every weak-entity mapping in SQL is these five lines rearranged.",
    },
    diagram: {
      title: "Mapping decision tree",
      caption:
        "Entity strength → relationship cardinality → attribute multiplicity — one pass yields the schema.",
      mermaid: `flowchart TD\n  A[Entity type] --> B{Weak?}\n  B -->|yes| W[Owner PK + discriminator]\n  B -->|no| S[Own PK]`,
    },
  },
  "gate-cs-database-management-systems-sql-and-query-processing": {
    intro: `SQL and query processing are the interface between human intent and storage bytes — declarative statements compiled into join orders, access paths, and execution plans. The subject covers SQL breadth (DDL, DML, joins, aggregation, subqueries, views, windows), how the optimizer picks plans, and the mechanics of reading one when it goes wrong.`,
    foundations: `SQL: DDL (CREATE/ALTER/DROP), DML (SELECT/INSERT/UPDATE/DELETE), DCL (GRANT/REVOKE), TCL (COMMIT/ROLLBACK); joins: inner, left/right/full outer, cross, self, natural; aggregation: COUNT/SUM/AVG/MIN/MAX with GROUP BY and HAVING (HAVING filters groups — WHERE filters rows); subqueries: correlated/uncorrelated, IN/EXISTS, scalar; CTEs (WITH); window functions (ROW_NUMBER, RANK, DENSE_RANK, LAG/LEAD, PARTITION BY); set operations (UNION ALL / UNION / INTERSECT / EXCEPT); views (virtual tables), materialized views; indexes (B+trees); query optimizer: logical plan (relational algebra) → physical plan (access paths, join order) via cost model (cardinality estimation, statistics, histograms); EXPLAIN/EXPLAIN ANALYZE to see chosen plan.`,
    concepts: [
      {
        title: "Joins: the grammar of multi-table answers.",
        body: `INNER JOIN: rows matching ON predicate; LEFT OUTER: all left rows + matched right (NULL fill); RIGHT mirror; FULL: all rows both sides; CROSS: cartesian (|L||R| rows); self join: same table aliased twice (employees and their managers); NATURAL JOIN on same-named columns (avoid — implicit, fragile); join order affects intermediates size — put selective joins first; three algorithms in engines: nested loop (small outer), hash join (equal keys, big tables — build smaller side), sort-merge join (both pre-sorted or index order); GATE asks join type selection by data size and index availability; the plan chosen decides whether your query runs in ms or minutes.`,
      },
      {
        title: "Aggregation and grouping discipline.",
        body: `GROUP BY partitions rows into sets per key tuples; aggregates per set; WHERE filters rows before grouping; HAVING filters after grouping; SELECT list must be group-keys or aggregates — mixing raw columns with aggregates is illegal (in most dialects); COUNT(*) counts rows (NULLs included), COUNT(col) counts non-null; DISTINCT inside aggregate; ROLLUP/CUBE for super-aggregates; ordered-set aggregates; the trap: WHERE can\'t reference aggregate aliases — HAVING can; the exam asks placement of predicates and alias rules — every SQL error you\'ve ever seen lives here.`,
      },
      {
        title: "Subqueries vs joins, correlated vs not.",
        body: `Uncorrelated: evaluated once, independent of outer row — IN-list, EXISTS with no outer reference; correlated: re-executed per outer row — EXISTS semi-join (stops at first match — fast), scalar correlated (returns one value — slow per row); EXISTS ≧ IN for NULLs safety (IN returns UNKNOWN on NULL — three-valued logic bite); rewriting correlated EXISTS → JOIN with DISTINCT is the universal optimizer trick; GATE asks equivalent rewrites and which is index-friendly; every "improve this query" task at work is this exercise with real tables.`,
      },
      {
        title: "CTEs, window functions, and analytic power.",
        body: `WITH cte AS (...) SELECT ... — readable pipelines, named subqueries, recursive CTEs for hierarchies (org charts, graphs); window functions: OVER (PARTITION BY ... ORDER BY ...) — compute per-row analytics without collapsing rows: ROW_NUMBER() for dedup, RANK()/DENSE_RANK() with gaps/no gaps, LAG/LEAD for time-travel comparisons, running totals SUM() OVER (ORDER BY date), moving averages AVG ... ROWS BETWEEN n PRECEDING AND CURRENT ROW; every analytics SQL you\'llever write is windows once you learn them; the exam tests evaluate-on-small-tables — know the semantics column by column.`,
      },
      {
        title: "Query optimizer: plans, statistics, and EXPLAIN.",
        body: `Parser → binder → logical plan (RA) → optimizer (predicate pushdown, join reorder via dynamic programming — optimizer searches plans by cost) → physical plan (nested loop vs hash vs sort-merge, index scans vs seq scans); cost = cardinality estimation × weight constants — statistics (row counts, distinct values, histograms) feed estimates; EXPLAIN: shows plan with cost and rows; EXPLAIN ANALYZE: executes and reports real times + loops; misprediction signs: huge row estimates off by orders of magnitude — stale statistics (ANALYZE) or missing stats → bad plans — the diagnostic skill that separates SQL writers from SQL debuggers.`,
      },
    ],
    worked: [
      {
        title: "Find top-3 salaries per department.",
        body: `SELECT dept, salary FROM ( SELECT dept, salary, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) r FROM emp ) t WHERE r <= 3; — window ranks per department without collapsing; alternative with GROUP BY gets messier; the analytics version is the textbook answer; GATE asks write + count of output rows — the count per dept = 3.`,
      },
      {
        title: "Rewrite correlated IN to EXISTS for NULLs safety.",
        body: `SELECT * FROM emp WHERE dept_id IN (SELECT dept_id FROM dept WHERE region=\'EU\'); — if dept.dept_id can be NULL, semantics vary (UNKNOWN filters); rewrite: WHERE EXISTS (SELECT 1 FROM dept d WHERE d.region=\'EU\' AND d.dept_id=emp.dept_id); — EXISTS is NULL-safe (EXISTS is true iff matched rows exist, NULL never makes it false-true confusion); the optimizer often does this itself — but writing it explicitly shows you understand; the exam asks "safer with NULLs?" → EXISTS.`,
      },
      {
        title: "Diagnose this plan: Seq Scan on 10M-row orders + Filter.",
        body: `EXPLAIN shows Seq Scan + filter on (order_date > today()−30); no index on order_date → full table scan each query; fix: CREATE INDEX idx_orders_date ON orders(order_date); — plan flips to Index Scan; latency drops orders of magnitude; the whole diagnosis was reading one EXPLAIN output — that is what "query processing" means in practice: the engine does what you let it, statistics permitting.`,
      },
      {
        title:
          "Compute department headcounts and average salary with GROUP BY.",
        body: `SELECT dept, COUNT(*), AVG(salary::numeric) FROM emp GROUP BY dept; — add HAVING AVG(salary) > 60000; then compare totals via ROLLUP: GROUP BY ROLLUP(dept) yields subtotals + grand total row; ROLLUP expands to multiple grouping sets in one pass — the analytics-at-scale feature; every ops dashboard you\'ll ever build runs on these; the exam asks which mechanism yields the grand total — ROLLUP vs CUBE (CUBE yields all combinations incl. cross-dims).`,
      },
    ],
    exam: [
      {
        question: "What does HAVING filter that WHERE does not?",
        answer:
          "Groups after aggregation — predicates on aggregate results (count > 5, avg salary > X); WHERE filters individual rows before grouping; they are not interchangeable; every single SQL exam asks this exact contrast.",
      },
      {
        question:
          "Which join algorithm suits joining two huge unsorted tables on equality?",
        answer:
          "Hash join — build hash table on smaller relation, probe with larger; O(N+M); sort-merge when both already sorted or indexes align; nested loop only for tiny outers; GATE asks this selection logic verbatim.",
      },
      {
        question:
          "When does the optimizer choose a seq scan over an index scan?",
        answer:
          "When selectivity is high — query returns large fraction (e.g., > 5-20%) of the table — index becomes more expensive due to random I/O; or stale/missing statistics mis-estimate — the fix: ANALYZE; every performance ticket you'll ever take lives in this gap.",
      },
      {
        question:
          "What is a window function and how is it different from GROUP BY?",
        answer:
          "Computes per-row analytics over related rows without collapsing the result — rows survive; GROUP BY collapses to one row per group; windows keep detail; all analytics solve trivially with windows that GROUP BY makes painful.",
      },
    ],
    cheat: [
      "Joins: inner, outer(left/right/full), cross, self; pick by null handling needs.",
      "WHERE pre-groups, HAVING post-groups; aggregates in SELECT need GROUP BY.",
      "Correlated subqueries re-run per row; EXISTS semi-join NULL-safe.",
      "Windows: ROW_NUMBER/RANK/DENSE_RANK/LAG/LEAD/running sums — detail preserved.",
      "EXPLAIN reads plans; seq scan + filter ⇒ add index; ANALYZE refreshes stats.",
      "Join order: selective first; hash join for big equality joins.",
    ],
    recap: `SQL is declarative precisely because the optimizer does the heavy lifting: join orders via dynamic programming, access paths via statistics, costs via estimated cardinality — your job is read the plan and shrink the intermediates; because the engine only knows what your statistics tell it, keeping them fresh is the difference between a query in milliseconds and one that holds the database hostage.`,
    code: {
      title: "EXPLAIN reading pattern",
      language: "text",
      code: `EXPLAIN ANALYZE SELECT ... -> Seq Scan -> cost 18000 rows 10000 -> Index Scan cost 8 rows 1`,
      explanation:
        "Millions of DBAs squint at exactly this once a week; learn to read cost/rows before learning anything else.",
    },
    diagram: {
      title: "Query pipeline",
      caption:
        "Parse → bind → logical plan → optimize (pushdown, reorder) → physical plan → execute.",
      mermaid: `flowchart LR\n  P[Parse] --> L[Logical plan]\n  L --> O[Optimizer]\n  O --> E[Execute]`,
    },
  },
  "gate-cs-database-management-systems-functional-dependencies-and-normalization":
    {
      intro: `Functional dependencies and normalization are the formal hygiene of schema design — axioms defining redundancy, normal forms eliminating anomalies, decomposition rules preserving information. The subject covers FD Armstrong axioms, closures, attribute sets, candidate keys, 2NF/3NF/BCNF decomposition, lossless join decomposition, and dependency preservation — the most exam-dense topic in any DBMS paper.`,
      foundations: `FD X → Y: for tuples t1,t2 with t1[X]=t2[X] ⇒ t1[Y]=t2[Y]; trivial X→Y if Y⊆X. Armstrong axioms: reflexivity (Y⊆X ⇒ X→Y), augmentation (X→Y ⇒ XZ→YZ), transitivity (X→Y, Y→Z ⇒ X→Z); derived rules: union, decomposition, pseudotransitivity. Closure X⁺: maximal attributes functionally determined by X (compute via repeated transitivity); superkey: X⁺=all attributes; candidate key: minimal superkey; prime attribute: in some candidate; non-prime otherwise. 1NF (atomic), 2NF (no partial dependency of non-prime on proper subset of candidate key), 3NF (no transitive dependency: non-prime → non-prime not through candidate), BCNF (every determinant is a superkey — strongest common form); lossless decomposition via FD spanning join; dependency preservation: F⁺ decomposes into projections covering original FDs.`,
      concepts: [
        {
          title: "Functional dependencies and Armstrong's axioms.",
          body: `An FD says "these attributes uniquely determine those" — sid → name, cid → title; valid in the relation instance; Armstrong\'s three axioms generate every FD derivable from a given set — completeness proven; the seven inference rules commonly derived: reflexivity, augmentation, transitivity, union (X→Y,X→Z ⇒ X→YZ), decomposition (X→YZ ⇒ X→Y,X→Z), pseudotransitivity (X→Y,YW→Z ⇒ XW→Z); closure X⁺ computed by iterating: start X; repeatedly add attributes Y where some FD Z→Y holds with Z ⊆ current closure; terminates when stable; size bounded; the GATE exam asks to compute closures for 4-8 attribute sets — mechanical with practice; every key and normal-form check flows through closures.`,
        },
        {
          title: "Finding candidate keys by closure.",
          body: `Algorithm: for each attribute, compute closure; minimal sets reaching all attributes are candidate keys; practical shortcut: attributes appearing only on left sides of all FDs must be in every key (they\'re guaranteed determinants); attributes never appearing on either side, or only on the right, can never be in any key; start with the left-unique set, test each subset for minimality; example: F={A→B, B→C, C→D} → A⁺={A,B,C,D} — key {A} unique; example: F={AB→C, C→D, D→A} → candidates {AB}, {BC}, {BD}? verify A⁺={A}, B⁺={B}, C⁺={C,D,A} — combinations needed; complexity of exhaustive check is 2^n worst — class exam sets stay tiny (4-6 attrs); write closure steps explicitly on exam paper — full marks live there.`,
        },
        {
          title: "2NF, 3NF, BCNF: the normal form ladder.",
          body: `1NF: atomic values — assumed everywhere (multivalued entries out); 2NF: no partial dependency — every non-prime attribute depends on the whole candidate key, not a part — only meaningful when candidate keys are composite (single-key tables are automatically 2NF); violation → split into per-key-part tables; 3NF: no transitive dependency — non-prime attribute must not determine another non-prime attribute (A→B, B→C transitive violation); BCNF: every determinant must be a (super)key — strictly stronger; 3NF allows non-superkey determinants for prime attributes (kept for dependency preservation); BCNF decomposition is always lossless but may lose preserving FDs; the ladder: BCNF ⊂ 3NF ⊂ 2NF ⊂ 1NF; every exam asks which form a schema is in or violates.`,
        },
        {
          title: "Decomposition: lossless and dependency-preserving.",
          body: `Decompose R(A,B,C) into R1(A,B) and R2(B,C); lossless if R = R1 ⋈ R2 — test via shared attribute being a superkey of one piece: B is key of R2 → lossless; failure: Cartesian products with dangling tuples — never recoverable; dependency preservation: F⁺ must be covered by F1⁺ ∪ F2⁺ — every original FD still inferable in the parts, else checking integrity needs joins; BCNF decomposition lossless (chase algorithm proves it) but may break preservation; 3NF decomposition (synthesis algorithm) preserves both; exam question: "is this decomposition lossless?" — apply the key test or chase table; every DBMS course nails this once per student.`,
        },
        {
          title: "Chase algorithm and multi-valued dependencies.",
          body: `Chase: represent decomposition in table form, rows = hypothetical tuples with symbols; apply FDs — equal symbols forced together where FD demands; if any row becomes all-original (no symbols), decomposition is lossless; symbol table with three or more rows often needed; MVD (multivalued dependency X →→ Y): independent multivalued facts — no other FD; 4NF kills those; decomposition of independent multivalued attributes into separate tables — Data/Employee with multiple phones AND multiple skills: two tables or cross-product explosion; GATE rarely asks MVD — but the lossless-chase table appears regularly; every decomposition question in the exam reduces to either key test or chase.`,
        },
      ],
      worked: [
        {
          title: "Compute (AB)+ with F = {A→C, B→D, C→E, DE→F}.",
          body: `Start AB; A→C add C (ABC); B→D add D (ABCD); C→E add E (ABCDE); DE→F add F (ABCDEF) — closure = all attributes → AB is a superkey; minimal? A⁺={A,C,E}, B⁺={B,D} — neither reaches all → AB is the (only) candidate key; every closure exercise mirrors this exact sweep — write the sequence of additions explicitly, mark which FD fired each step, verify termination — full credit requires showing the work.`,
        },
        {
          title: "Decompose R(A,B,C,D) with F={A→B, B→C, C→D} to 3NF.",
          body: `Candidate keys: A (A⁺=ABCD); transitive chain A→B→C→D — violates 3NF (B→C non-prime-to-non-prime through B which isn\'t a key); decompose: R1(A,B), R2(B,C), R3(C,D) — lossless (shared B is key of R2; shared C key of R3); dependency coverage: A→B in R1, B→C in R2, C→D in R3 — all preserved; every 3NF synthesis walks the minimal cover and emits one table per FD; the mechanical algorithm guarantees both properties; exam expects the table list and both verifications.`,
        },
        {
          title: "Test losslessness: R1(A,B), R2(B,C,D), shared B.",
          body: `B must be superkey of R1 or R2 — in R1, B alone doesn\'t determine A (unless B→A in F); in R2, B determines C and D (B→C, C→D) → B is key of R2 (B⁺={B,C,D} = R2) → lossless; the one-line test wins the mark; if neither piece makes shared attributes a superkey → lossy — R1⋈R2 produces spurious rows; every decomposing exam question has this answer shape; the chase method agrees always.`,
        },
        {
          title: "Show BCNF violation and fix it.",
          body: `R(A,B,C,D), F={AB→C, C→D, D→A}; candidate keys: AB (A⁺={A}, B⁺={B}, AB⁺=all), BC (BC→ABC→ABCD ✓), BD (BD→ABD→ABD+ C? B,D→A ✓ then AB→C ✓ all ✓); BCNF violated at C→D and D→A (neither determinant is a superkey of R); decompose R1(C,D), R2(A,C)... check R1: C→D ✓ key C; R2 needs keys of original covering F remaining: R2(A,B,C) with F A→B,B→C→A — A key; lossless test: shared C — is C key of R1? yes → lossless; result two BCNF relations; dependency preservation: D→A lost (D ends in different tables... D→A spans R1,R2 — not preserved — known BCNF trade-off); the exam shows this dance every year; the answer is the decomposition + note on D→A.`,
        },
      ],
      exam: [
        {
          question: "What is Armstrong's augmentation rule stated formally?",
          answer:
            "If X → Y then XZ → YZ for any attribute set Z — pad both sides; combined with reflexivity and transitivity it generates everything; exam asks the three axioms by name and statement — learn them verbatim.",
        },
        {
          question: "Which normal form BCNF implies?",
          answer:
            "3NF — BCNF ⊂ 3NF ⊂ 2NF — every BCNF schema is 3NF but not conversely; the chain question asks precisely; BCNF strictly stronger — kills every determinant non-key.",
        },
        {
          question: "What does lossless decomposition guarantee?",
          answer:
            "R1 ⋈ R2 = R — no spurious tuples, original relation perfectly reconstructible; the key-test or chase verifies it; without losslessness, information is unrecoverable — the unforgivable design crime; GATE grades strictly on this.",
        },
        {
          question: "What is the minimal cover of a set of FDs?",
          answer:
            "Smallest set of FDs equivalent to the original with: single RHS attributes, no extraneous attributes, no redundant FDs — the seed every normalization walks; GATE asks to compute it; the steps: decompose RHS → remove extraneous LHS attrs → remove redundant rules.",
        },
      ],
      cheat: [
        "Armstrong: reflexivity, augmentation, transitivity — complete and sound.",
        "Closure X⁺ iterative; superkey if all attrs; candidate key = minimal superkey.",
        "2NF: no partial non-prime dependency; 3NF: no transitive; BCNF: every determinant a superkey.",
        "Lossless: shared attributes form superkey of at least one piece.",
        "Dependency preservation: split FDs still inferable from parts.",
        "Chase table for hard cases; 3NF synthesis guarantees both properties.",
      ],
      recap: `Functional dependencies are the grammar of redundancy, and normal forms the enforcement grades: closures find keys, Armstrong\'s axioms derive everything derivable, BCNF and 3NF define the ceiling beyond which joins reconstruct the world without spurious or missing reality — the whole syllabus in one breath; the exam is the rehearsal, production is the practice.`,
      code: {
        title: "Closure algorithm sketch",
        language: "python",
        code: `def closure(X, F):\n    X = set(X); changed = True\n    while changed:\n        changed = False\n        for A, B in F:\n            if A <= X and not (B <= X): X |= B; changed = True\n    return X`,
        explanation:
          "The textbook procedure; every GATE closure question is this loop with data.",
      },
      diagram: {
        title: "Normal form ladder",
        caption:
          "BCNF ⊂ 3NF ⊂ 2NF ⊂ 1NF — each level exterminates one redundancy class.",
        mermaid: `flowchart LR\n  BCNF --> NF3[3NF]\n  NF3 --> NF2[2NF]\n  NF2 --> NF1[1NF]`,
      },
    },
  "gate-cs-database-management-systems-indexing-and-b-plus-trees": {
    intro: `Indexing and B+ trees are the technology that makes databases answer in milliseconds instead of scanning disks forever — ordered structures living between queries and bytes. The subject covers primary/secondary indexes, B+ tree structure and operations (insert/delete/search), cost math with tree height and key comparisons, clustered vs unclustered, and hash indexes; every index debate in every DBA meeting since 1980 starts here.`,
    foundations: `Index: sorted structure over key + pointer to data pages or rows; search O(log_B n) vs sequential O(n/B); B+ tree: all data pointers in leaves; leaves linked (range scans sequential); internal nodes guide search (separator keys + child pointers); node = page (4-16 KB); fanout from key size (~100-200 typical); height = log_fanout(rows); 1B rows × 100-fanout → height 4-5 — 5 disk seeks worst case; insert/delete split/merge nodes keeping all leaves at equal depth; clustered: data pages physically ordered by key (one per table); unclustered: secondary, any attribute set — order not matching storage; hash index: O(1) equality; no ranges; LSM trees for write-heavy (log-structured merge — RocksDB); composite indexes serve left-prefix queries.`,
    concepts: [
      {
        title: "Primary vs secondary indexes and clustering.",
        body: `Primary/clustered index: table data physically sorted by the key; one per table (only one physical order possible); fastest for range queries and sort outputs using key; secondary/non-clustered: separate structure, pointers back to rows (RID or PK lookup — table lookup penalty for wide queries → covered indexes include all needed columns to avoid hitting table); heap table: no clusters; every table scan is unavoidable there; GATE asks: which index type gives sequential reads for range — clustered; which allows multiple per table — secondary; every production DBA question maps here.`,
      },
      {
        title: "B+ tree mechanics: structure and fanout.",
        body: `B+ tree order m: each internal node ≤ m children, ≥ ⌈m/2⌉ (root exception); keys ≤ m−1; leaves hold records or pointers, linked left-to-right; internal separator key = first key of right child; all leaves at same depth (perfectly balanced); search: start root, binary search keys, descend, reach leaf — cost = height × (log₂(node-size)) internal compares + one leaf read; fanout from page size: 4 KB page, 16-byte key → ~250 pointers/keys per node → height for 10^9 rows: ⌈log_250(10^9)⌉ = 4 — five disk IOs worst, two if root/level cached; GATE asks height computations — plug into log formula, ceiling it.`,
      },
      {
        title: "Insert and delete: splits, merges, and redistribution.",
        body: `Insert: descend to leaf; if room, insert sorted position; else split into two halves, push median (or first of upper half) separator up; parent may overflow → split cascades to root → new root with two children — height grows by one; delete: remove key; if node underflows below ⌈m/2⌉, either borrow from sibling or merge with sibling, propagating separator fixes upward; underflow cascade stops at root — tree shrinks; every node ≥ half full after every operation — 50% minimum occupancy guarantee; the discipline keeps height minimal and lookups uniform; GATE asks to trace an insert that splits cascading two levels — practice three traces.`,
      },
      {
        title: "Cost model: page reads vs comparisons.",
        body: `Estimate: height = ⌈log_fanout(N)⌉; internal nodes mostly cached in memory (root always); every query: one leaf IO + rarely internal IOs; seek on spinning disk ~5 ms — 4 IOs = 20 ms vs full scan of 10^9 rows × 8 KB = 8 TB — hours; the math motivates indexes for existence checks when selectivity < ~1%; for high selectivity full scan wins (sequential IO beats random); planner chooses based on statistics; GATE asks "estimated IO for lookup on table with N rows and fanout f" — answer: ⌈log_f(N)⌉ IOs worst; the comparison cost formula (log₂ keys per node internal, binary search) also examined.`,
      },
      {
        title: "Composite indexes, left-prefix, and covers.",
        body: `Composite (a,b,c): B+ tree sorted by a, then b, then c; queries on a alone, a+b, a+b+c use it fully; b alone cannot (no seek path — would need scan); every composite serves its prefixes — left-prefix rule; selectivity order: put most selective (highest cardinality) first for seeks; covering index: includes all columns the query needs → engine never touches table — fastest read path possible; index-only scans in EXPLAIN; every "why is my query so slow mimo index?" ticket diagnoses to missing cover or wrong column order; GATE asks prefix rule examples — (a,b) helps b alone? No.`,
      },
    ],
    worked: [
      {
        title:
          "Compute height of B+ tree with 4KB pages, 20-byte keys, 10M rows.",
        body: `Key+pointer ≈ 24 bytes → ~170 entries per node; fanout ~170; height = ⌈log_170(10^7)⌉ = ⌈7/log₁₇₀(10)⌉? log_170(1e7) = ln(1e7)/ln(170) = 16.1/5.13 ≈ 3.14 → 4 levels counting leaf; GATE answer: height 3–4 — three disk seeks + leaf ≈ 4 IOs; every GATE "how many IO?" problem is exactly this arithmetic; practice with key sizes 8,16,32 bytes and page sizes 2,4,8,16 KB.`,
      },
      {
        title: "Trace insert 15 into B+ tree order-3 (max 3 children).",
        body: `Assume tree where target leaf [10,20]; insert 15 → leaf: [10,15,20] — full; split into [10] [15,20] wait order 3 max 3 children per internal, max 2 keys per internal? Order m=3: internal ≤ 3 children ≤ 2 keys; leaf ≤ 3 elements; insert 15 → leaf [10,15,20] — 3 elements OK (≤3); full at 4; leaf full case for order 3 is 3 entries max — split on 3rd insert: [10,15,20] splits into [10] and [15,20], push 15 up; parent gets a new key, may overflow → new parent [15] with two children; tree grows; the exam trace asks for the exact split point and which key ascends — median of odd leaves goes up, left-heavy right otherwise; policy variants tested, core same.`,
      },
      {
        title: "Determine if query uses index (composite (a,b)).",
        body: `Q1 WHERE a=5 → yes (prefix); Q2 WHERE a=5 AND b=7 → yes (full); Q3 WHERE b=7 → no (not prefix); Q4 WHERE a=5 ORDER BY b → yes + sort-free; Q5 WHERE a>3 → yes (range on prefix); every one of these is a GATE stand-alone question; the rule: seeks OK on left-most prefix sequences, equality before inequality; boolean X OR Y breaks it entirely; memorize the five canonical cases.`,
      },
      {
        title: "Compare clustered vs unclustered IO for wide row query.",
        body: `Table 10M rows, clustered PK (id); query WHERE name=\'x\' via secondary index on name → find index entries (must hit table per match via PK lookup — 100 extra random IOs); same query on clustered name would read sequentially only matching pages; the gap is why clustered on hot filter columns sometimes wins, but you only get ONE clustered order — choose the workload that pays; GATE asks: "which index is better for range scan?" → clustered; every question of this shape expects that one line.`,
      },
    ],
    exam: [
      {
        question:
          "What is the height of a B+ tree storing N keys with fanout f?",
        answer:
          "⌈log_f(N+1)⌉ or ⌈log_f(N)⌉ — conventions vary; exam uses log formula with ceiling; the answer never exceeds 6 for realistic N; GATE also asks IO cost = height seeks.",
      },
      {
        question: "Why do all B+ tree leaves sit at the same depth?",
        answer:
          "The structure maintains balance by construction: inserts split upward only, deletes merge/share at the deficient level only, no other mechanism — guaranteed balance without rotations; the property every B+ tree exam demands stated verbatim.",
      },
      {
        question: "What does the left-prefix rule govern?",
        answer:
          "Composite index (a,b,c) serves queries constrained on a, a+b, a+b+c — not b alone, not c alone — seek requires left-to-right prefix equality ordering; the rule kills the index for every non-prefix query; the exam lists five queries and asks which can scan.",
      },
      {
        question: "What is a covering index?",
        answer:
          "Index whose entries include every column the query references — a/b/c keys + pkey payload — engine answers from the index alone without touching the table; every performance-sensitive query should cover; GATE asks name only.",
      },
    ],
    cheat: [
      "Clustered = data ordered by key, one per table; secondary = pointer-based, many.",
      "B+ tree: keys internal, records leaves, leaves linked; fanout high, height tiny.",
      "Height = ⌈log_fanout(N)⌉; IO cost ≈ height (+1 leaf walk).",
      "Insert split median up; underflow borrow or merge; root split grows height.",
      "Composite left-prefix: (a,b,c) serves a, a+b, a+b+c; covers need all columns.",
      "Covered query = index-only scan — no table access at all.",
    ],
    recap: `Indexes are the compiler between queries and bytes: B+ trees give logarithmic seek with perfectly balanced pages and linked leaves for ranges, clustering gives one lucky sort order, left-prefix and covers decide which queries fly — because indexes trade writes and space for reads, knowing exactly which is which is the difference between a DBA and a lucky guesser.`,
    code: {
      title: "Height formula",
      language: "python",
      code: `import math\nheight = math.ceil(math.log(rows, fanout))`,
      explanation: "The one-liner behind 90% of index interview questions.",
    },
    diagram: {
      title: "B+ tree shape",
      caption:
        "Separators internal, records in linked leaves — range scans pay once, sequential thereafter.",
      mermaid: `flowchart TD\n  R[Root: separator keys] --> I[Internal: more separators]\n  I --> L[Leaves: data, linked]`,
    },
  },
  "gate-cs-database-management-systems-transactions-and-concurrency": {
    intro: `Transactions and concurrency are the discipline that lets thousands of users touch one database without ever seeing a lie: all-or-nothing execution, isolated visibility of partial work, and schedulers that keep the interleaving honest. The subject covers ACID, serializable schedules, conflict-serializability, locking protocols, two-phase locking, deadlocks, isolation levels, and the anomalies each level permits — the machinery between every "UPDATE" keyword and what actually lands on disk.`,
    foundations: `Transaction: unit of work with ACID — atomicity (all or nothing, via undo/redo logs), consistency (moves between valid states via constraints), isolation (concurrent transactions appear serializable), durability (committed survives crashes — WAL/fsync). Schedule: interleaved operations of multiple transactions; serial schedules run one-at-a-time (trivially correct, no concurrency); conflict-serializable = equivalent to some serial order (tested by precedence graph acyclicity). Conflict: r-w, w-r, w-w on same item from different transactions. Locking: shared (S, read) vs exclusive (X, write); 2PL — growing phase acquires, shrinking phase releases; strict 2PL holds X locks to commit (enables recoverability); deadlock — cycle in wait-for graph; detection by cycle or timeout; prevention by ordering resources. Isolation levels: READ UNCOMMITTED (dirty reads), READ COMMITTED, REPEATABLE READ (phantoms possible), SERIALIZABLE (all anomalies gone).`,
    concepts: [
      {
        title: "ACID, logs and the commit contract.",
        body: `Atomicity: the transaction either completes entirely or has no effect — enforced by the write-ahead log (WAL): every change recorded in the log before the data page is written; on crash, redo committed transactions, undo uncommitted. Durability: commit forces the log to stable storage (fsync) — once commit returns, survival is guaranteed; pages flush lazily. Consistency: the app moves the DB from valid state to valid state via constraints (FKs, checks) enforced at statement boundaries. Isolation: concurrent transactions cannot see each other's intermediate states — the hard part, detailed below. Every production incident with "money appeared twice" or "balance went negative" reduces to one of these four properties being violated — usually isolation, sometimes atomicity after a crash mid-transaction.
`,
      },
      {
        title: "Schedules, conflicts and serializability.",
        body: `A schedule interleaves operations r₁(A) w₂(A) w₁(A) etc. — the execution trace order. Two operations conflict if they touch the same item AND at least one is a write AND they come from different transactions. Conflict types: r-w (reader can see uncommitted writer), w-r (writer overwrites then reader sees torn state), w-w (lost update). A schedule is conflict-serializable iff swapping non-conflicting operations yields a serial schedule — tested by building the precedence graph: edge Ti→Tj if any conflict demands Ti before Tj; acyclic ⟹ conflict-serializable. Cyclic ⟹ some anomaly — the cycle is the evidence your transaction interleaving can never produce the same result as any serial run. Every exam question reduces to: list conflicts, order them, draw the graph, look for a cycle.
`,
      },
      {
        title: "Two-phase locking and deadlocks.",
        body: `2PL: a transaction may only acquire locks during a growing phase (before its first release) and only release during a shrinking phase (after its last acquire) — this single shape guarantees conflict-serializability (the 2PL theorem). Strict 2PL: hold all exclusive locks until commit/abort — guarantees recoverability (no dirty reads can cascade into aborts of innocent readers) and makes undo simple (nothing committed on top of uncommitted data). Deadlock: Ti waits for Tj which waits for Ti — the wait-for graph has a cycle; detection: find cycles periodically or abort on timeout; prevention: resource ordering (always acquire in global order — kills cycles by construction) or wait-die/wound-wait timestamp schemes (non-preemptive patience vs preemptive elders). GATE loves the wait-for table; production loves lock_timeout settings and pg_locks monitoring.`,
      },
      {
        title: "Isolation levels and the anomalies they permit.",
        body: `READ UNCOMMITTED: dirty reads (see uncommitted data that a rollback erases), non-repeatable reads, phantoms. READ COMMITTED: no dirty reads; but same row re-read can change (non-repeatable read) and new rows can appear in ranges (phantoms). REPEATABLE READ: pinned snapshot per transaction (in MVCC engines) — no dirty or non-repeatable reads; phantoms: a range re-read can still return new rows (in lock-based engines) — MVCC snapshots usually eliminate phantoms too; SERIALIZABLE: full serial-equivalence — implemented via SSI (serializable snapshot isolation — detect dangerous r/w-antidependency cycles and abort the pivot) or predicate locks; slowest, most correct. The four phenomena, five levels (including snapshot isolation variants) — every exam asks "which anomaly survives level X?" — memorize the matrix.`,
      },
      {
        title: "MVCC: the concurrency model beneath modern engines.",
        body: `MVCC (multiversion concurrency control): every write creates a NEW version of a row tagged with the writer transaction's ID; readers see the latest version committed before their snapshot began — readers never block writers, writers never block readers; only writers conflict with writers. Postgres implements via tuple versions + transaction ID visibility checks + VACUUM for garbage collection; MySQL InnoDB via undo logs building old versions on demand; SQL Server via row versioning (RCSI). The model kills most read-write locking entirely — remaining costs: write-write conflicts, index maintenance, bloat from dead versions, and the subtle SSI anomalies (index-range phantom inconsistencies) that only SERIALIZABLE fixes. Understanding MVCC is understanding every modern OLTP database's soul — and every "why doesn't my UPDATE see my own earlier change from another session" mystery's answer.
`,
      },
    ],
    worked: [
      {
        title: "Precedence graph: does this schedule conflict-serialize?",
        body: `Operations: r1(A) r2(A) w1(A) w2(B) r1(B). Conflicts: r1(A) vs w1(A) same tx — skip; r2(A) vs w1(A): T2 reads A before T1 writes A — wait, w1(A) occurs before? Order: r1, r2, w1, w2, r1. r2(A) then w1(A): T2 must precede T1 → edge T2→T1. w1(A) vs ... A interactions done. w2(B) vs r1(B): w2 before r1 → T2→T1 again. Graph: single edge T2→T1 — acyclic → conflict-serializable as T2 then T1. Visualizing this on a 3-transaction schedule with two objects is the exam's bread and butter; when a cycle appears (e.g., T1 writes A, T2 reads A, T2 writes B, T1 reads B), that schedule never serializes — flag it and say why.`,
      },
      {
        title: "Two transactions deadlocked over A and B — trace and fix.",
        body: `T1: w(A) … w(B); T2: w(B) … w(A). Both hold one lock, want the other — neither yields — deadlock. Fix options: (1) global order: always lock A before B — one waits, no cycle; (2) timeouts: each aborts on lock_timeout, retry the loser — standard; (3) deadlock detector picks victim by cost (row count, log volume) — every major engine has one; (4) application restructure: merge the two updates into one statement so the engine orders locks. The exam wants the wait-for cycle drawn and the abort-restart resolution; production wants you to monitor pg_locks and lock_timeout and design for retry.`,
      },
      {
        title: "Anomaly hunt: which isolation level permits this interleaving?",
        body: `Interleaving: T1 reads balance=100; T2 transfers 60 → balance 40, commits; T1 re-reads balance=40. T1 saw two different values in one transaction — non-repeatable read — permitted under READ COMMITTED, not under REPEATABLE READ. Another: T1 counts WHERE dept='CS' → 5; T2 inserts a CS employee, commits; T1 recounts → 6 — phantom — permitted under REPEATABLE READ (lock-based engines) but not SERIALIZABLE; MVCC READ COMMITTED/SERIALIZABLE hold one snapshot — recounts give 5. The exam gives you the interleaving and the question "which phenomenon just happened / which level allows it?" — the answer key is the four-phenomena matrix memorized cold.`,
      },
      {
        title: "Why strict 2PL guarantees recoverability.",
        body: `Recoverable schedule: no transaction commits until every transaction it read from has committed. Strict 2PL holds X locks until commit → nobody reads uncommitted data → nobody depends on doomed transactions → cascading aborts impossible. Non-strict 2PL releases write locks early → T1 writes A (unlock), T2 reads A, T1 aborts — T2's read is void, T2 must abort too (cascade), potentially aborting T3… the cascade of doomed readers — what strict 2PL makes impossible by construction. The exam asks "which protocol guarantees recoverability" — answer: strict 2PL, or equivalently commit-order-preserving schedules; cascadeless schedules are the formal criterion — every read sees only committed writes.`,
      },
    ],
    exam: [
      {
        question: "What are the four ACID properties?",
        answer:
          "Atomicity (all-or-nothing via undo/redo logs), consistency (valid states only), isolation (serializable appearances), durability (committed data survives crashes, via WAL/fsync). Every definition question expects exactly these four words plus one line each.",
      },
      {
        question: "How do you test a schedule for conflict-serializability?",
        answer:
          "Build the precedence graph: one node per transaction, edge Ti→Tj iff some operation of Ti must precede a conflicting operation of Tj on the same item (at least one write); the schedule is conflict-serializable iff the graph is acyclic — topological order then gives the equivalent serial schedule. This is the single most examinable question in the concurrency syllabus.",
      },
      {
        question:
          "Which phenomenon does REPEATABLE READ still permit (in lock-based engines)?",
        answer:
          "Phantom reads — new rows matching a range predicate appearing between re-reads of the range (locks pin existing rows, not gaps). MVCC snapshot isolation usually prevents phantoms by freezing the view; lock-based REPEATABLE READ does not. SERIALIZABLE (SSI) is the only level that eliminates both.",
      },
      {
        question: "What does 2PL guarantee, and what does strict 2PL add?",
        answer:
          "2PL guarantees conflict-serializability (the 2PL theorem — growing/shrinking phases make cycles impossible). Strict 2PL additionally holds all exclusive locks to commit, guaranteeing recoverability and cascadeless execution, and simplifying crash recovery (nothing committed on top of uncommitted data).",
      },
    ],
    cheat: [
      "ACID: atomicity (undo/redo), consistency, isolation, durability (WAL).",
      "Conflict = same item + ≥1 write + different transactions: r-w, w-r, w-w.",
      "Precedence graph acyclic ⟺ conflict-serializable; cycle ⟺ no serial equivalence.",
      "2PL: growing then shrinking — serializable; strict 2PL: X locks to commit — recoverable.",
      "Levels: RU dirty, RC non-repeatable, RR phantoms, SERIALIZABLE none.",
      "MVCC: versions tagged by xact ID; readers never block writers; snapshot per xact.",
    ],
    recap: `Transactions are contracts between ambition and physics: all-or-nothing execution, provably serializable interleavings, locks and versions enforcing the contracts, isolation levels trading anomalies for throughput — because the database is the one place where giving everyone exactly what they read, no more and no less, is the entire job.`,
    code: {
      title: "Isolation levels by anomaly",
      language: "text",
      code: "RU: dirty+nonrepeatable+phantom | RC: nonrepeatable+phantom | RR: phantom | SER: clean",
      explanation:
        "One line that decides half the exam questions on this topic.",
    },
    diagram: {
      title: "Transaction lifecycle",
      caption:
        "Begin → work → WAL flush → commit (or unwind on abort) — the durability arc.",
      mermaid:
        "flowchart LR\n  B[BEGIN] --> W[Work with locks]\n  W --> L[WAL to disk]\n  L --> C[COMMIT]\n  W --> A[ABORT and undo]",
    },
  },
  "gate-cs-database-management-systems-query-optimization-and-execution-plans":
    {
      intro: `Query optimization is the compiler inside the database: SQL says what you want, the planner decides how to get it — join order, access path, join algorithm — and the difference between a plan that flies and one that holds the server hostage is the difference between reading EXPLAIN output fluently and not. The subject covers logical rewriting, cost models with cardinality estimation, access path selection, join algorithms and physical plan reading.`,
      foundations: `Pipeline: parse → bind/analyze → logical plan (relational algebra) → rewrite (predicate pushdown, projection pruning, subquery unnesting, decorrelation, constant folding, transitive predicates) → physical enumeration (join order via dynamic programming over size-2,3,... subsets; System R style) → cost estimation (cardinality × page-fetch and CPU weights) → plan selection. Statistics: pg_statistic — histograms, most-common-values, ndistinct, correlation (index vs table order); false estimates flip hash/nested-loop choices. Access paths: sequential scan, index scan (B+tree range), index-only scan (covering), bitmap index scan (multi-key unions), TID scan. Join algorithms: nested loop (small outer), hash join (equality, large — build smaller side), sort-merge join (pre-sorted inputs, inequality-friendly), unique join (inner key unique). EXPLAIN vs EXPLAIN ANALYZE: estimated vs actual rows, loops, timing. Red flags: row estimates off by 10x+, Seq Scan on huge filtered tables, filter removed but recheck expensive, sorts spilling to disk (work_mem).`,
      concepts: [
        {
          title: "The logical rewrite layer before any costing.",
          body: `Before the optimizer compares prices, it simplifies the expression: predicate pushdown moves filters as close to the leaves as possible (a filter on a joined table becomes a scan-time filter — the difference between 10M rows flowing through a join vs 10K); projection pruning drops unreferenced columns early (less data through every operator); decorrelation rewrites correlated subqueries into joins/semijoins; constant folding evaluates 1+1 at plan time; transitive predicate inference (a = b AND b = 5 ⟹ a = 5) multiplies possibilities; view merging inlines view definitions into the outer query. Every one of these is semantics-preserving and almost always beneficial — yet they all have failure modes (pushdown breaking an index-only scan, unnesting plan explosion) that the planner gates on heuristics and cost feedback. Reading an optimizer's rewrite output is the first skill of plan reading.`,
        },
        {
          title: "Cardinality estimation: the statistic everything rests on.",
          body: `Every cost decision flows from row-count estimates: |R ⋈ S| ≈ |R||S| / max(V(R,a), V(S,a)) for equality on a (the containment assumption with histogram correction); sel(predicate) × input rows — selectivity from histograms (equi-height/equi-depth), MCV lists, ndistinct for GROUP BY and join fanout. Estimate wrong by 10x and the planner picks a nested loop over a hash join — thousands of loops × random I/O instead of one sequential pass; wrong by 100x and it picks the wrong join order entirely, with intermediates ballooning. The knobs: ANALYZE (refresh stats), default_statistics_target (more buckets = better estimates at plan cost), extended statistics (dependencies across columns — the classic “country ⟹ city” correlation blowup solved by ndistinct dependencies). Every real-world optimizer problem begins and ends here.`,
        },
        {
          title: "Access path selection: scan vs index.",
          body: `Sequential scan reads every page — fastest when touching > ~5-15% of the table (sequential I/O + prefetch beats random). Index scan: B+tree seek + heap fetch per match — great for <1-2% selectivity; heap fetch kills it at scale because of random I/O per row (unless correlation ~1, where index order = table order, making heap fetches nearly sequential). Index-only scan: covers the query — never touches the heap (needs the visibility map fresh — vacuum aggressively). Bitmap heap + bitmap index scan: scan index, build sorted page bitmap, fetch heap pages in order — best for multi-column OR'd predicates; kills selectivity in the 1-20% band. The planner's decision boundary moves with table size, cache hit rate, and correlation — which is why the same query flips plans between dev (tiny table, everything cached, seq scan wins) and prod (billions of rows, index wins). Test your mental model with EXPLAIN ANALYZE on production-scale data, never dev.`,
        },
        {
          title: "Join algorithms and when each wins.",
          body: `Nested loop: for each outer row, probe inner — optimal when outer side is tiny (<100 rows) and inner has an index on the join key (index nested loop); catastrophic otherwise. Hash join: build hash table on smaller relation, probe with larger — O(N+M) expected; needs memory ≥ build side or graceful hash (partition, batch to disk); equality only; the default for big unsorted equality joins. Sort-merge: sort both, advance pointers — handles <, >, BETWEEN (not just equality) and produces sorted output free for ORDER BY; used when inputs are already sorted (index order or prior sort) or inequality joins demand it. The exam asks "which join algorithm for this data?" — answer from sizes, indexes, operators, and sortedness — in that order; production asks the same four questions from EXPLAIN.`,
        },
        {
          title: "Reading EXPLAIN ANALYZE like a professional.",
          body: `Every plan is a tree of nodes with (cost, rows, width) estimates vs (actual time, rows, loops) reality. Red flags: estimated rows off by >10x (stats stale or correlation misread — run ANALYZE, check estimates), "Rows Removed by Filter: 900000" (pushdown missed — index missing or function on the column), nested loop with loops=100000 and inner time dominating (build index or reorder), sort with "Sort Method: external merge" (spill to disk — raise work_mem), "Buffers: shared read" huge (cold cache — first-run skew). Technique: read the plan bottom-up — leaf nodes feed parents; the node with the biggest (actual time × loops) is where the money went; fix leaf-first (index, stats, rewrite), re-check, repeat. The whole profession of database performance is this loop run ten thousand times.`,
        },
      ],
      worked: [
        {
          title: "Estimate join cardinality: orders ⨝ lineitems on order_id.",
          body: `|orders| = 10^6, |lineitems| = 6×10^6, order_id unique in orders (V = 10^6), ndistinct order_id in lineitems = 10^6 (each order has ~6 lines). Equality join estimate = |L| × |O| / max(V(O,order_id), V(L,order_id)) = 6×10^6 × 10^6 / 10^6 = 6×10^6 rows — correct (6 lines per order). If stats were stale and V(L,order_id) read as 100 (correlation ignored), estimate = 6×10^10 — astronomical — planner would never pick hash join; the fix is ANALYZE + extended statistics on the dependency. Every cardinality question in exams and tickets follows this formula; the containment assumption behind it is the optimizer's quiet lie you must learn to see.`,
        },
        {
          title: "Plan flip trace: 4 rows estimated, 400000 actual.",
          body: `Query: SELECT * FROM orders WHERE status='SHIPPED' AND total > 1000. EXPLAIN ANALYZE shows "cost=... rows=4" then "actual time=4200 loops=1 rows=400000" — estimate off 100,000x. Diagnosis: status has high correlation with total (shipped orders are big); histograms treat predicates independently (independence assumption) — joint selectivity overestimated. Fixes: compound index on (status, total) — index selectivity combines both in one B+tree; extended statistics (dependencies) for the planner to learn the correlation; recheck rows estimates drop toward actual. The exercise is universal: independent-columns assumption is the optimizer's first blind spot, and composite indexes are the standard cure.`,
        },
        {
          title:
            "Why does this index not help: SELECT * FROM t WHERE lower(email) = 'x@y.z'?",
          body: `Function on the column — index on email stores values, not lower(email)s — seek impossible without a functional index (CREATE INDEX ON t(lower(email))) or expression-matching predicate. The recheck story: seq scan with filter "rows removed by filter" — exactly what EXPLAIN shows pre-fix. Rule: the indexed expression must match the WHERE expression byte-for-byte — parentheses, casts, function names included. The exam version: "which index makes this query seek?" — answer is the expression index on lower(email), never the plain email index.`,
        },
        {
          title: "Rewrite correlated subquery into semijoin and compare.",
          body: `SELECT * FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.cust_id = c.id AND o.total > 1000); — correlated: semijoin form is what the planner usually derives; if not, force: SELECT DISTINCT c.* FROM customers c JOIN orders o ON o.cust_id = c.id AND o.total > 1000; — identical rows, explicit join, planner picks hash join vs nested loop by stats. EXISTS remains NULL-safe and stops at first match per outer row — either wins with adequate stats; the rewrite only guarantees planner freedom. The exam asks to decorrelate; production asks the same when EXISTS flattens badly.`,
        },
      ],
      exam: [
        {
          question: "What does predicate pushdown accomplish in the optimizer?",
          answer:
            "Moves selection operators toward the leaves of the plan tree — filtering early reduces rows flowing through joins and sorts; semantically valid because σ commutes with most operators under standard RA equivalences. It is the single highest-impact logical rewrite; without it, every join would process unfiltered inputs.",
        },
        {
          question:
            "When will the optimizer prefer a sequential scan over an index scan?",
          answer:
            "When the estimated selectivity is high — roughly when > ~5-15% of the table must be read, sequential I/O plus prefetching is cheaper than random heap fetches per matched row; also when statistics are stale and estimates are wildly wrong. The exact threshold depends on table size, cache hit rate, and correlation between index and heap order.",
        },
        {
          question:
            "Which join algorithm handles inequality predicates directly?",
          answer:
            "Sort-merge join — after sorting both inputs, inequality ranges are matched by pointer advancement; hash joins only support equality (hashed keys must match exactly), nested loop supports any predicate but at O(N×M) worst cost. Inequality + big tables = sort-merge, assuming sorted inputs or acceptable sort cost.",
        },
        {
          question:
            "What is the difference between EXPLAIN and EXPLAIN ANALYZE?",
          answer:
            "EXPLAIN prints the planner's chosen plan with estimated rows and costs — no execution, zero side effects; EXPLAIN ANALYZE actually executes the statement (writes and all — it rolls back DML in postgres) and reports real per-node time, rows, loops, and buffer hits. Use EXPLAIN for plan shape, ANALYZE for plan truth; never run ANALYZE on a write statement in production without wrapping it.",
        },
      ],
      cheat: [
        "Rewrites first (pushdown, unnest, prune, fold), then cost, then physical choice.",
        "Cardinality = |R||S| / max(V(R), V(S)) for equality; histogram-corrected.",
        "Stale stats flip plans — ANALYZE and extended stats are the fixes.",
        "Seq scan wins > ~5-15% selectivity; index for < ~1-2%; bitmap in between.",
        "Nested loop (tiny outer), hash (big equality), sort-merge (inequality/sorted).",
        "EXPLAIN ANALYZE: find node with max time×loops; estimate rows off >10x = stats bug.",
      ],
      recap: `Query optimization is compiler engineering for the slowest compiler you'll ever debug by hand: rewrite the logic free of charge, then cost the alternatives from statistics you can refresh, then execute and verify with ANALYZE — because the plan you see is the plan you paid for, and every millisecond between your SQL and the truth is somebody's cost model decision awaiting your inspection.`,
      code: {
        title: "Reading EXPLAIN red flags",
        language: "text",
        code: "rows estimated 4 vs actual 400000 -> ANALYZE; rows removed by filter huge -> missing index/expression",
        explanation:
          "Two numbers and one phrase detect ninety percent of slow plans.",
      },
      diagram: {
        title: "Optimizer pipeline",
        caption:
          "Logical rewrite → cardinality estimation → join order via DP over subsets → cost → plan.",
        mermaid:
          "flowchart LR\n  S[SQL] --> R[Rewrite: pushdown, unnest]\n  R --> E[Estimate rows]\n  E --> J[Join order search]\n  J --> P[Physical plan]",
      },
    },
  "gate-cs-database-management-systems-distributed-databases": {
    intro: `Distributed databases spread one logical database across many machines — replication and sharding for availability, scale, and geography — and pay for it with consensus, consistency trade-offs and the two generals problem in every wire. The subject covers replication (sync/async, primary/replica, quorum), sharding strategies, two-phase commit, distributed transactions, CAP/PACELC, and the consistency spectrum from linearizable to eventual — the architecture behind every "the database is fine but does it survive?" architecture review.`,
    foundations: `Replication: copy data to N nodes; synchronous (commit waits for replicas — strong consistency, write latency = slowest replica), asynchronous (commit now, replicate later — fast writes, data loss window on failover), semi-sync (at least one replica acks). Topologies: primary-replica (single writer, read scale-out — failover needs fencing), multi-primary (write anywhere — conflict resolution mandatory: LWW, CRDT, app-level merge), quorum (R+W > N ⟹ read-your-writes possible; W=majority for linearizable writes). Sharding: horizontal partitioning by key — hash (even distribution, no range scans) vs range (range scans work, hot spots on sequential keys) vs directory-based (flexible, extra lookup); cross-shard transactions are the hard problem. 2PC: prepare (all participants vote yes) → commit/abort — atomic but blocking (coordinator failure stalls participants holding locks); 3PC/Paxos-commit reduce blocking; consensus (Raft/Paxos) makes replication fault-tolerant with majority quorums; CAP: under partition, choose consistency or availability; PACELC: else, choose latency or consistency.`,
    concepts: [
      {
        title: "Replication: synchronous, asynchronous, and the loss window.",
        body: `Async replication ships WAL to replicas after the primary commits — replica lag in milliseconds to seconds; on primary failure with unreplicated committed writes, those writes vanish — RPO (recovery point objective) > 0 equal to the lag. Sync replication blocks commit on replica ack — zero data loss, but commit latency = slowest synchronous quorum member, and a dead replica stalls all writes unless the quorum shrinks. Semi-sync (MySQL): primary commits after at least one replica acks — balances the two. Every replication design decision is a dial between durability and latency, and the correct setting is a business decision about how much write latency users tolerate vs how much data loss the business survives. The exam asks for the trade; production asks you to pick per table.`,
      },
      {
        title: "Quorums and the R+W>N arithmetic.",
        body: `N replicas, W acks required to commit, R replica reads per query. R + W > N guarantees reading at least one node holding the latest acknowledged write — the foundation of Cassandra/Dynamo-style consistency; W > N/2 prevents conflicting acknowledged writes (write quorum overlap with itself) — together they yield regular-register semantics; for full linearizability you also need read-modify-write consensus or single-leader plus lease discipline. Choosing N=3,W=2,R=2: any single node loss tolerated, both reads and writes survive; N=5,W=3,R=3: two-node tolerance; W=1: fast, fragile; R=1: fast reads, stale often — tuning R/W around your workload (write-heavy → low W, read-heavy → low R with lagging reads from replicas) is the operational core of quorum systems. Consistent hashing distributes keys across the ring — adding/removing a node reshuffles only its arc; virtual nodes even the load.`,
      },
      {
        title: "Sharding strategies and their failure modes.",
        body: `Hash sharding: key → hash % N — uniform distribution, zero range query support (scatter-gather), rebalancing painful without consistent hashing and virtual nodes. Range sharding: key ranges per shard (A–C, D–G...) — range scans local, sequential-key inserts hammer the last shard (hot shard — fix by salt prefix or hash-with-range hybrid). Directory sharding: lookup table maps keys to shards — arbitrary placement, single point of failure unless replicated, extra RTT per query. Cross-shard transactions: the unsolved pain — atomicity across shards requires 2PC or its modern successors (Spanner's TrueTime + commit-wait achieving external consistency); every cross-shard query is a distributed join with network hops, timeouts, and partial-failure semantics — design data models to keep co-accessed rows on one shard (entity groups, tenant scoping) whenever possible.`,
      },
      {
        title: "Two-phase commit and its blocking pathology.",
        body: `2PC: Phase 1 PREPARE — coordinator asks each participant to promise commit or abort; participants vote yes (and force their log). Phase 2 COMMIT — on all-yes, coordinator tells everyone commit; any no or timeout → abort everywhere. Atomic, and the participants' promises make crashes recoverable via redo. The killer: the window between vote and decision — if the coordinator dies after participants voted yes, participants block holding locks indefinitely waiting for the decision — this is the blocking failure 3PC and Paxos Commit attack by adding a pre-commit phase / consensus on the decision. Heuristic decisions (operator forces commit/abort) resolve it at the cost of possible divergence — logged as heuristic warnings in every engine. Modern answer: replicate the coordinator itself (Paxos/Raft) so 2PC never strands participants on a dead single coordinator — the Spanner/CockroachDB/Yugabyte design.`,
      },
      {
        title: "CAP, PACELC and the consistency spectrum.",
        body: `CAP: in a partition, you cannot have both linearizable consistency and availability — the network between nodes partitions (G network) or you don't scale/distribute (CA , single node effectively). PACELC completes the picture: if Partition — choose A or C; Else (normal operation) — choose Latency or Consistency. The spectrum: linearizable (every read sees the latest acknowledged write, real-time order — Spanner, etcd/ZooKeeper, single-leader strict) → sequential/causal → read-your-writes → monotonic reads → eventual (replicas converge, no guarantees between reads) — each step down buys availability/latency, loses invariants. Systems map: Cockroach/Spanner = CP + strong clocks; Cassandra = AP + tunable quorums (can approach CL per-query with ALL); DynamoDB = AP eventual by default with strongly-consistent reads option; Mongo = tunable with write concern / read concern. The exam asks to classify; architects ask which guarantee the invariant actually needs — most business invariants need only read-your-writes per user, almost never global linearizability.`,
      },
    ],
    worked: [
      {
        title: "Quorum design: N=3, pick R and W for a social feed.",
        body: `Workload: read-heavy timeline (100:1 reads), staleness acceptable for others’ posts, my own writes should appear immediately. R+W>3 with W=1,R=3: write fast, read slow-ish and strong when reading all three — overkill; choose W=2,R=2 (balanced, tolerate 1 node loss, R+W=4>3 ✓); for the user’s own posts route reads to the leader or read with quorum — everyone else reads stale-tolerable replicas W=1 path. The arithmetic is the design; the fallback is tuning CL on the client per query class. Every quorum question in the exam wants R+W>N derived and the single-node-loss argument shown; production wants the same two numbers on a sticky note near the Cassandra cluster.`,
      },
      {
        title: "Hot shard: sequential IDs on hash vs range sharding.",
        body: `Range sharding by auto-increment ID: every insert lands on the newest range — one shard eats 100% traffic, others idle; range queries fast but write scale zero. Hash sharding: IDs spread evenly — uniform load, but "SELECT * WHERE id BETWEEN …" fans out to all shards (scatter-gather latency and merge cost). Hybrid: hash prefix + salt on the leading key (e.g., shard by user_id hash, keep ID range inside shard for ordering), or write to a sharded outbox then async-merge; or use UUIDs with time-ordered prefixes shaded (ULID + bucket). The fix is always the same shape: break the correlation between insertion order and shard placement while preserving any locality you actually need.`,
      },
      {
        title: "2PC window: coordinator dies after YES votes — what happens?",
        body: `Participants hold prepared (locked) transactions indefinitely — they cannot commit (coordinator might decide abort on restart) nor abort (it might decide commit) — blocking. Resolution in real systems: coordinator's decision log is itself replicated (Paxos/Raft) → a surviving majority finalizes the decision and notifies participants — no human in the loop, no indefinite locks. Fallback for legacy 2PC: operator inspects the coordinator log, forces a heuristic decision, marks divergence; clients detect via heuristic mismatch errors and reconcile. The exam answer: wait for coordinator recovery or lose the transaction — blocking is the defining pathology of 2PC; every variant that removes it (3PC, Paxos Commit, replicated coordinator) is the content of the next question.`,
      },
      {
        title: "Classify the consistency need: bank transfer vs social likes.",
        body: `Bank transfer A→B: invariant (sum constant, never negative without authorization) — needs atomic visibility across both accounts — serializable/linearizable per transfer; async replication risks a crash between primary commit and replica receipt where one account shows debited and other not yet credited — acceptable only if failover replays committed log (it does — that's durability, not consistency of concurrent reads) but never acceptable to read B before A committed: enforce with read-your-writes routing to leader post-transfer, or SERIALIZABLE. Social likes: count ±1, no invariant beyond monotonicity — eventual consistency perfect, counter caches everywhere, last-write-wins for the counter object or CRDT counter. Same database, different consistency budgets — the architecture review answer is always per-invariant, never per-system.`,
      },
    ],
    exam: [
      {
        question: "What does R + W > N guarantee in quorum systems?",
        answer:
          "Every read touches at least one node that participated in the last acknowledged write — because the read set and write set must overlap by pigeonhole (R+W>N). Combined with W > N/2 (write-write overlap), you get read-your-writes and no lost updates; without either condition, stale reads or conflicting acks are possible. This is the single most quotable formula in distributed storage.",
      },
      {
        question: "Why is 2PC called a blocking protocol?",
        answer:
          "Participants that voted YES hold locks and cannot unilaterally decide the outcome — the decision belongs to the coordinator; if it dies before broadcasting, they wait indefinitely. Non-blocking alternatives require consensus on the decision itself (Paxos Commit/3PC) or a replicated coordinator. Blocking cost is paid exactly during failures — the worst possible time.",
      },
      {
        question:
          "Which anomaly does asynchronous replication permit on failover?",
        answer:
          "Loss of committed transactions — the replica elected new primary never received the tail of the WAL, so transactions the old primary reported committed vanish (RPO > 0). Synchronous replication eliminates this at the price of commit latency; semi-sync narrows it to only the last-second window. Every failover runbook must state its RPO explicitly.",
      },
      {
        question: "What does PACELC add to CAP?",
        answer:
          "The else branch: absent a partition, latency vs consistency remains a trade — synchronous replication and linearizable reads cost RTTs even on healthy networks. PACELC prevents engineers from treating CAP as a checkbox: the normal-case design (quorum sizing, read from replica vs leader) matters more than the rare partition story.",
      },
    ],
    cheat: [
      "Sync replication: zero loss, slowest-replica latency; async: lag = loss window on failover.",
      "R + W > N ⟹ read freshness; W > N/2 ⟹ no conflicting acks; both = quorum storage.",
      "Hash sharding: uniform, no ranges; range sharding: ranges local, hot spots on sequential keys.",
      "2PC blocks on coordinator death after YES — replicate the coordinator or inherit the stall.",
      "CAP: under partition C vs A; PACELC adds latency vs consistency in normal operation.",
      "Consistency is per-invariant: transfers need linearizable, likes need eventual.",
    ],
    recap: `Distributed databases are agreement machines with data attached: replication buys availability and latency, sharding buys scale, quorums buy tunable truth, 2PC/consensus buys cross-machine atomicity — and every guarantee you claim is only as strong as the weakest link between the client, the coordinator, and the clock; because in distributed systems the network is always the third participant.`,
    code: {
      title: "Quorum knobs",
      language: "text",
      code: "N=3 W=2 R=2 -> tolerate 1 loss, R+W=4>N; W=1 -> fast/fragile; R=1 -> stale/fast",
      explanation:
        "The three numbers every storage engineer recites before tuning anything.",
    },
    diagram: {
      title: "CAP decision under partition",
      caption:
        "Network partitions force a binary choice; normal operation still trades latency for consistency.",
      mermaid:
        "flowchart TD\n  P[Partition?] -->|yes| CA[Choose C or A]\n  P -->|no| EL[Choose L or C]\n  CA --> C[CP: refuse stale, stall]\n  CA --> A[AP: serve possibly stale]",
    },
  },
};

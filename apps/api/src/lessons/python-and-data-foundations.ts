import type { TopicLesson } from "../topicLessons.js"; /** * Python and Data Foundations — 7 authored topic lessons. * * Standalone chapters per topic. Subject-first prose, foundations, core * concepts, worked examples, exam practice, cheat sheet, recap. No shared * templates, no runtime composition. */
export const pythonAndDataFoundations: Record<string, TopicLesson> = {
  "ai-ml-python-and-data-foundations-python-for-ai": {
    intro: `Python is the lingua franca of machine learning — from raw notebooks to production training systems — and fluency in it is table stakes for every AI role. The subject is the working layer: syntax, data types, functions and classes, type hints, virtual environments, packaging, and notebooks — engineered for iterative data work rather than for apps. Python for AI is writing legible, reproducible code that survives contact with real datasets.`,
    foundations: `Core: variables rebinding names (no declaration), truthiness, comprehension syntax, f-strings, *args/**kwargs, decorators, generators, context managers. Typing: gradual — annotations checked by mypy/pyright, zero runtime cost, huge editor payoff. Environments: venv or uv for isolation; requirements via pyproject.toml; pinning for reproducibility; lockfiles for apps. Packaging: modules/packages, import system, src layout, console scripts. Notebooks (Jupyter): cell execution order lies — note the out-of-order trap; convert winning notebooks to packages/scripts. Data stack handoff: python -m venv, pip install, git, tests with pytest.`,
    concepts: [
      {
        title: "Python idioms that dominate AI code.",
        body: `List/dict/set comprehensions over loops; enumerate/zip instead of indices; pathlib over os.path; dataclasses/pydantic for configs and records; generators (yield) for streaming large files; itertools for combinations; collections (Counter, defaultdict, deque); f-strings for logging; type hints on public functions; truthiness over == True/False; context managers (with) for files, locks, graphs modes. Reading PyTorch/transformers code is easier with these patterns in your fingers than by memorizing APIs.`,
      },
      {
        title: "Type hints and static checking.",
        body: `def train(model: nn.Module, loader: DataLoader, epochs: int = 10) -> dict[str, float]: ... — hints document shapes of dataflow, enable mypy/pyright to catch mismatches before runtime, and give IDEs precise completions. Use typing for intent (Sequence, Iterable, Optional, Union/|, Literal, Protocol for structural typing); pydantic for runtime-validated configs (LLM app settings, pipeline params); strictness is a dial — annotate boundaries, not every variable; benefits compound in teams and long pipelines.`,
      },
      {
        title: "Environments and packaging discipline.",
        body: `One project, one virtual environment (uv venv / python -m venv); never install globally; pyproject.toml [project] with dependencies, entry points; lockfiles (uv.lock/poetry.lock) for apps; rebuild from lockfile reproduces runs exactly; notebooks must name their env (%pip install cell or documented setup script) — the #1 reproducibility failure is "works on my notebook"; structure experiments as src layout + scripts; make imports unambiguous; CI installs from scratch and runs smoke tests — the only proof.`,
      },
      {
        title: "Notebooks done honestly.",
        body: `Jupyter strengths: exploration, visualization, narration. Weaknesses: hidden state (cells run out of order), no version-friendly diffs, no tests. Rules: restart-and-run-all before committing; no long-running training in notebooks — hand to scripts; variables defined in one cell used in another belongs in a module; notebooks are for thinking, packages are for decisions; nbstripout for diffs; if results matter, promote the cell to src/. Checkpointed notebook hygiene is the difference between exploratory science and cargo culting.`,
      },
      {
        title: "Functional vs OOP style in data code.",
        body: `Data code is mostly data + small transforms — prefer pure functions (dataframe in, dataframe out) over class hierarchies: composable, testable, memoizable. OOP earns for stateful services: Trainer classes, Dataset subclasses (PyTorch), Agents, clients with connections. Dataclasses for config passing; Protocol for duck-typing across libraries without inheritance; avoid deep hierarchies — the ecosystem composes functions (pipeline(map, filter, fit)) better than it extends base classes.`,
      },
    ],
    worked: [
      {
        title: "From a messy notebook to a reproducible experiment.",
        body: `Prototype trained in cells with 14 hidden-state dependencies. Extraction: pure functions load_data(path) → clean(df) → train(model, X, y) into src/pipeline.py; params in config.yaml via pydantic (Seed 42, Lr 3e-4, Epochs); run via python -m pipeline.train --config config.yaml; mypy clean; pytest covers clean() invariants (no nulls, dtypes correct); CI runs smoke train on 1% data; result bit-identical across machines; the notebook stays for plots only — reproducibility without ceremony.`,
      },
      {
        title: "Stream a 50 GB file without loading it.",
        body: `def rows(): with open(path) as f: for line in f: yield json.loads(line) — generator pipeline: filter → map → batch into DataFrame chunks of 100k → write parquet partitions; memory flat at ~200 MB regardless of file size; naive read_json dies at 18 GB RAM; this pattern is how real data pipelines breathe — write generators first, optimize later only if profiling says so.`,
      },
      {
        title: "Fix the hidden notebook state divergence.",
        body: `Colleague reran cell 12 after editing cell 7 — numbers shifted magically. Diagnosis: cell 12 used a variable from an old cell 7 output path. Fix: notebook CI via nbmake/nbconvert executing top-to-bottom on push; failing notebook blocks merge; team rule: "restart, run all, verify outputs match committed ones" before pushing; the three hours reclaimed next sprint: priceless.`,
      },
    ],
    exam: [
      {
        question:
          "Why do experienced Python engineers annotate boundaries first rather than every variable?",
        answer:
          "Boundaries (function signatures, module APIs, config schemas) are where contracts matter and checking is cheapest — internal variables are usually obvious from usage; heavy annotation inside wastes time and fights inference; pydantic covers runtime validation at the edges for free.",
      },
      {
        question:
          'What is the single most common cause of "works on my machine" in ML projects, and the cure?',
        answer:
          'Implicit notebook state and undocumented environment drift — cures: lockfiles, restart-and-run-all CI, scripts/packages instead of notebooks as executables, and pinned containers; if CI cannot reproduce the numbers from a cold start, nobody can, and "reproducible" is an aspiration, not a fact.',
      },
      {
        question: "What makes generators essential for data-scale work?",
        answer:
          "They produce items lazily one at a time, so arbitrarily large or infinite streams process in constant memory — files, API pages, training batches; dataloaders, tar extractors, and line readers all ride on this; loading everything then looping is the amateur cliff at 10 GB.",
      },
      {
        question:
          "When is a class preferable to a function pipeline in AI code?",
        answer:
          "When state must persist and mutate across calls with invariants attached — Trainer with optimizer/grad state, a Dataset holding a manifest, an Agent holding memory; functions for pure transforms; classes for stateful services; mixing casually yields god objects and untestable cell spaghetti.",
      },
    ],
    cheat: [
      "Comprehensions, enumerate/zip, pathlib, pydantic for configs.",
      "Type hints at boundaries; mypy in CI; runtime validation via pydantic.",
      "One env per project; pyproject + lockfile; never pip install --user.",
      "Generators stream; context managers protect files and locks.",
      "Notebooks: restart-run-all; promote discoveries to src/; nbstripout.",
      "Functions for transforms; classes for stateful trainers/agents.",
      "CI runs from cold clone on every push — reproducibility or it did not happen.",
    ],
    recap: `Python for AI is disciplined data-scale engineering: comprehensions and generators as the daily syntax, type hints and pydantic for trustworthy boundaries, virtual environments and lockfiles for reproducibility, notebooks for thinking and packages for reality, functions for transforms and classes for stateful services — all verified by a cold-clone CI that proves the work is repeatable.`,
    code: {
      title: "Generator batches",
      language: "python",
      code: `def batches(it, n):\n    batch = []\n    for item in it:\n        batch.append(item)\n        if len(batch) == n:\n            yield batch\n            batch = []\n    if batch:\n        yield batch`,
      explanation:
        "Constant-memory batching for streaming ETL and inference — the spine of every large-data loop in the stack.",
    },
    diagram: {
      title: "Notebook to production flow",
      caption: "Explore, extract, verify.",
      mermaid: `flowchart LR\n N[Notebook] --> S[Script or package]\n S --> T[Pytest]\n T --> C[CI]`,
    },
  },
  "ai-ml-python-and-data-foundations-numpy-and-vectorized-computing": {
    intro: `NumPy is the bedrock of the entire Python scientific stack — every tensor library stands on its array model. The subject is computing without loops: shapes, dtypes, broadcasting, views vs copies, vectorized linear algebra, and memory layout — the knowledge that turns a naive loop into millisecond vector math. if you write an explicit Python loop over array elements, you have written slow code with extra steps.`,
    foundations: `ndarray: homogeneous n-D container with dtype, shape, strides. Vectorization: operations run in C over whole arrays — no per-element Python. Views vs copies: slicing shares memory (fast, aliasing surprises); fancy indexing/copy-ops duplicate. Broadcasting: align trailing shapes; 1 expands; missing dims padded — learn the rules by heart or debug shape mismatches forever. Memory layout: C-order (row-major) vs Fortran-order; contiguous arrays for vectorized math; striding explains transpose-as-view (free) vs copy. dtypes: float32/float16 for speed+VRAM, int64 indices, bool masks.`,
    concepts: [
      {
        title: "Shape literacy: the debugging superpower.",
        body: `Every error message ends in "operands could not be broadcast together with shapes (a,b) and (c,d)" — reading shapes cold is the skill. Conventions: batch first (B, C, H, W) for images; (tokens, features) for sequences; keep dim order consistent across a codebase and assert shapes in tests (assert x.shape == (batch, seq, dim)) — silent shape bugs are the worst kind because they run and produce garbage confidently. np.newaxis/None for adding dims; squeeze/expand_dims explicitly; check dtype too (float64 stealthily doubling memory is a classic).`,
      },
      {
        title: "Broadcasting rules, once and for all.",
        body: `Align shapes from the right; dimensions must be equal or one of them 1 (broadcast) or missing; scalars broadcast against everything; result shape = elementwise max. Patterns: matrix + vector (bias add), outer product via (n,1) vs (1,m), mean over axis with keepdims=True for residual subtraction (x - x.mean(axis=-1, keepdims=True)). If it surprises you, verify with np.broadcast_to explicitly; never "fix" broadcasts by reshaping blindly — print shapes until the rule is obvious; then broadcasting becomes a performance tool instead of a trap.`,
      },
      {
        title: "Views vs copies and aliasing footguns.",
        body: `Slicing (a[::2], a[2:5]) returns views — mutating the slice mutates the original (great for zero-copy windows, catastrophic when unneeded). Fancy indexing (a[[0,2,4]]) and boolean masks return copies. a.T is a view (strides swap) — np.ascontiguousarray when passing non-contiguous buffers to kernels/Cython/Torch. np.shares_memory checks aliasing when debugging surprises. Rule: know which one you have at every assignment; write tests that would catch unintended coupling; this is where half of NumPy mysteries live.`,
      },
      {
        title: "Vectorized operations over loops.",
        body: `Replace loops with: array ops (+ - * / **), reductions (sum mean max argmin), cumulative (cumsum), sorting (argsort), set ops, np.where for branchless selection, fancy indexing for gather, matmul (@ / einsum for clarity of complex contractions), np.apply_along_axis only when no primitive fits (rare) — benchmark everything: the vectorized version is typically 50-1000x faster and shorter. Random seeds: np.random.default_rng(seed) for reproducible streams; structured rng passing for experiments.`,
      },
      {
        title: "Memory layout and performance.",
        body: `Contiguous C-order arrays vectorize fastest; non-contiguous (transposed, sliced) still works but slower paths; prefer letting libraries allocate output (out= params) to avoid temporaries; dtypes: float32 halves memory and is the deep-learning default — everywhere possible; large arrays: np.memmap for disk-backed loading; float16 only where range/precision allows; np.einsum expresses contractions in one line (with opt_einsum for big ones); profile with np.testing + timeit or line_profiler — measure, then optimize the line that matters, not the one that looks guilty.`,
      },
    ],
    worked: [
      {
        title: "Vectorize a pairwise distance computation.",
        body: `Naive double loop over 5k×5k points dies. Broadcast: diff = X[:, None, :] - X[None, :, :] is 25B floats — too big; instead identity ||a-b||² = |a|² + |b|² - 2a·b; norms = (X**2).sum(1, keepdims=True); D = norms + norms.T - 2 * X @ X.T; sqrt/clip zeros; 0.8 s total; memory 200 MB — the algebraic route instead of the geometric one; this exact trick powers kNN, RBF kernels and dedup pipelines everywhere.`,
      },
      {
        title: "Refactor a data cleaning loop into vector ops.",
        body: `Column-by-column Python iterrows cleaning 3M rows: 4 minutes. Vectorized: mask = df['age'].notna() & (df['age'] >= 0); df['age'] = df['age'].clip(0, 120); outliers via percentile masks; missing via np.where; result 0.2 s; the iterrows-to-vector migration is the single highest-ROI rewrite in most pipelines; rule: if the loop body is elementwise, it is vector material by definition.`,
      },
      {
        title: "einsum for attention-like contractions.",
        body: `Scores = np.einsum('btd,bsd->bts', Q, K) — one readable line replacing three matmuls and a transpose dance with named axes; einsum documents intent better than chained @, checks axes statically, and compiles via BLAS; for huge contractions at scale, opt_einsum picks the optimal path automatically; readability here is a feature — future-you debugging a 12-term einsum without names will weep.`,
      },
    ],
    exam: [
      {
        question:
          "What makes broadcasting different from implicit expansion, and why does it exist?",
        answer:
          "Broadcasting virtually stretches size-1 or missing dimensions without copying data — memory stays flat while semantics stay math; it exists because explicit expansion would explode memory and code; mastering it separates people who write vectorized numpy from people who fight shape errors weekly.",
      },
      {
        question:
          "When does a NumPy slice return a view, and why does it matter?",
        answer:
          "Basic slicing (ranges, steps) returns views sharing memory — writes propagate to the original; fancy indexing and boolean masks copy; it matters for aliasing bugs, surprising mutations, and for zero-copy passes into kernels that expect contiguous buffers.",
      },
      {
        question: "Why float32 instead of float64 in deep learning pipelines?",
        answer:
          "Half the memory, double the throughput on modern hardware (tensor cores), precision sufficient for gradient descent; float64 wins only when accumulation/cancellation truly demand it (scientific solvers); defaulting float64 doubles VRAM and halves batch size for zero modeling benefit.",
      },
      {
        question:
          "What is the practical rule for replacing a Python loop over array elements?",
        answer:
          "If the operation is elementwise or a reduction, there is a NumPy primitive — reach for it; loops remain for inherently sequential logic or irregular graph traversal; measure first, but expect 10-1000x gains and reach for vector ops reflexively.",
      },
    ],
    cheat: [
      "Shapes: batch-first everywhere; assert them in tests; print when unsure.",
      "Broadcasting: right-aligned, 1-expands, trailing alignment decides.",
      "Slices view; fancy indexes copy; know which you hold.",
      "Vectorize: clip, where, reductions, matmul, einsum with named axes.",
      "float32 for speed; float64 only for true need; memmap for big files.",
      "ascontiguousarray at library boundaries.",
      "Measure with timeit; optimize the line that dominates.",
    ],
    recap: `NumPy fluency is thinking in arrays: shapes as first-class contracts, broadcasting as free memory-flat algebra, views vs copies understood cold, elementwise work vectorized by reflex, dtypes and strides as performance knobs, and einsum as the readable notation for contractions — the difference between Python-that-scripts-math and pipelines that actually scale.`,
    code: {
      title: "Centering with broadcasting",
      language: "python",
      code: `mu = X.mean(axis=0, keepdims=True)\nX_std = (X - mu) / X.std(axis=0, keepdims=True)`,
      explanation:
        "keepdims keeps rank for subtraction; one line, no loop, full dataset standardized in C speed.",
    },
    diagram: {
      title: "Vectorized vs looped",
      caption: "C over arrays versus Python per element.",
      mermaid: `flowchart LR\n L[Python loop: slow] --> V[Vector op: fast]`,
    },
  },
  "ai-ml-python-and-data-foundations-pandas-and-data-preparation": {
    intro: `Pandas is the spreadsheet-on-steroids for wrangling data — DataFrames you can join, reshape, aggregate, and clean with code instead of clicks. The subject is real preparation work: selection, joins, missing values, groupby transformations, time series, and reproducible cleaning pipelines that survive the third dataset from the same vendor. data preparation is where 80% of ML project time goes, and pandas is its primary instrument.`,
    foundations: `Series (1D labeled), DataFrame (2D labeled tables with heterogeneous dtypes). Index is the join/alignment axis — align on labels, not positions; reset_index discipline. Selection: [] for columns, .loc for label, .iloc for position; boolean masks; .query() for readable chains. dtypes matter: category for low-cardinality strings, datetime with explicit tz, nullable Int64/boolean for missing. I/O: read_csv/parquet/sql; parquet beats CSV universally beyond toy size (types preserved, 10x smaller, 50x faster). Method chaining for legible pipelines; assign()/pipe() for composability; avoid inplace mutation confusion; copy semantics.`,
    concepts: [
      {
        title: "The index decides; alignment is the law.",
        body: `Operations align on labels: a + b pairs matching indices, introducing NaN where absent — surprises galore the first time. Reset to positional via .reset_index(drop=True) after filtering; set meaningful indexes deliberately (DatetimeIndex for time series, id columns for merges); verify alignment with df.index before arithmetic; merge/join with validate='one_to_one'|'one_to_many' — it fails loudly on cardinality violations instead of silently duplicating rows (the #1 silent pandas disaster); .merge(..., suffixes=...) and indicator=True to audit source of rows.`,
      },
      {
        title: "Missing data, dtype conversion, and parsing.",
        body: `NaN (float), NaT, None — unify via .isna(); strategies: drop (only when justified and documented), fill with median/mode/model, flag with _was_missing indicator for tree models; coerce errors: pd.to_numeric(errors='coerce'), pd.to_datetime(., errors='coerce', format= explicit — never let pandas guess mixed formats); category dtypes cut memory 90% on repeated strings and enable fast groupbys; sparse data → SparseArray; validate round-trip: dtypes in == dtypes out (assert in cleaning functions) — detecting silent string→object corruption saves days.`,
      },
      {
        title: "GroupBy: split-apply-combine done right.",
        body: `df.groupby('segment').agg({'revenue': 'sum', 'orders': 'count', 'margin': 'mean'}) — named aggregation (agg(revenue=('revenue','sum'))) for clean column names; transform for broadcasting group stats back (z-scores per group); apply for irregular logic (slow — prefer transform/aggregate/filtration); filter groups by aggregate condition (filter(lambda g: len(g) > 30)); rolling/expanding for time windows; .pipe(lambda d: ...) chains for readable multi-step group logic; validate row counts in tests — groupby is where duplication hides.`,
      },
      {
        title: "Reshaping: melt, pivot, crosstab, stack.",
        body: `Tidy data: one row per observation, columns as variables. Wide→long: melt (value_vars param); long→wide: pivot pivot_table (aggfunc, fill_value); crosstabs for frequency tables; stack/unstack move axes between columns and index; exploding list-columns (.explode) for unnesting JSON-ish structures; missing cells after pivot → fill or reindex explicitly; check shape after every reshape (assert no unexpected NaN introduction) — reshaping errors compound downstream as phantom joins.`,
      },
      {
        title: "Reproducible cleaning pipelines.",
        body: `Chains: df.pipe(load).pipe(clean_types).pipe(fix_missing).pipe(validate) — small pure functions each tested; validate step asserts invariants: expected columns, dtypes, null rates below thresholds, uniqueness of keys, range checks; fail the pipeline loudly rather than feed garbage downstream; log shape at each stage; version the exact transformation code with the data; snapshot raw, immutable; cleaning is infrastructure — code review it like any service.`,
      },
    ],
    worked: [
      {
        title: "Diagnose a merge that doubled rows.",
        body: `Orders joined to customers: row count went 1.2M → 2.9M. culprit: many-to-many on duplicated customer_id in the customer table (legacy duplicates). Fix: dedupe with drop_duplicates(subset=['customer_id'], keep='last') then validate='one_to_many' in merge — the merge now fails loudly if duplicates return; totals were inflated 2.4x before the fix — every KPI dashboard was wrong for six weeks; the validate flag cost one line and redeemed the quarter.`,
      },
      {
        title: "Time-series feature extraction for forecasting.",
        body: `Sales dataframe → set DatetimeIndex → sort → .resample('D').sum() fill missing days with 0 (reindex) → rolling 7d/28d means, rolling std, day-of-week dummies, lag 1/7 — all via .shift and .rolling; no loops; 3 years of daily data → full feature matrix in 40 lines; leakage avoided by only using past windows (shift before rolling when predicting forward) — the entire forecasting feature engineering stage compressed into one legible, testable script.`,
      },
      {
        title: "Memory diet for a 9 GB CSV.",
        body: `read_csv with usecols, dtype mapping (string→category, ints to smallest fitting), parse_dates with format, chunksize 500k for the aggregation stage; 9 GB → 1.4 GB and 40% faster; then persist to parquet; subsequent reads 8x faster still; the rule: never load what you will not use — pandas is generous, physics is not; dtype-first thinking is the personality of performant data work.`,
      },
    ],
    exam: [
      {
        question: "Why must merges specify validate= and suffixes= explicitly?",
        answer:
          "Because pandas silently performs many-to-many joins that duplicate rows exponentially — the silent corruption that ships wrong KPIs; validate turns cardinality violations into loud errors at the boundary where they can still be fixed, which is always cheaper than six weeks downstream.",
      },
      {
        question: "What does the index actually control in pandas?",
        answer:
          "Alignment and join semantics — operations pair on labels, not positions; sorting, slicing and reindexing all ride on it; treat it as the key of every table; reset carelessly and arithmetic crosses rows silently; set it deliberately, check it always.",
      },
      {
        question:
          "When should you choose parquet over CSV for intermediate data?",
        answer:
          "Always beyond toy scale — preserves dtypes and nullability exactly, compresses 5-10x, reads 10-100x faster, and columnar layout skips unread columns and row groups; CSV is an interchange format for humans, parquet is the format for machines and patience.",
      },
      {
        question:
          "What separates a reproducible cleaning pipeline from a one-off script?",
        answer:
          "Small tested pure-function stages chained with pipe(), explicit invariants asserted at each step (columns, dtypes, null budgets), deterministic code versioned with the data, and loud failure — one responsible transformation or a quiet generator of wrong answers; there is no third option.",
      },
    ],
    cheat: [
      "loc for labels, iloc for positions; never mix; reset index after filtering.",
      "validate= on every merge; drop_duplicates first; indicator=True to audit.",
      "category dtypes for repetition; to_numeric/to_datetime coerce explicitly.",
      "GroupBy: agg with named tuples; transform broadcasts; filter for group masks.",
      "Tidy: melt/pivot/explode; assert shape post-reshape.",
      "Pipelines via .pipe(fn) with invariant checks; parquet everywhere.",
      "Log shapes and null budgets per stage; version code with data.",
    ],
    recap: `Pandas mastery is label-aware table surgery: the index as the law of alignment, validated merges that fail loudly, coerced dtypes, groupby transforms over apply, tidy reshapes with asserted shapes, and pipelines of small tested functions that either produce trusted data or stop loudly — because ML models train on whatever you feed them, silently.`,
    code: {
      title: "Validated merge",
      language: "python",
      code: `merged = orders.merge(customers, on='customer_id', how='left', validate='many_to_one', indicator=True)`,
      explanation:
        "Cardinality asserted at merge time; indicator reveals unmatched rows; corrupt inputs become exceptions, not dashboards of lies.",
    },
    diagram: {
      title: "Cleaning pipeline",
      caption: "Load, type, fill, validate.",
      mermaid: `flowchart LR\n R[Raw] --> T[Type coercion]\n T --> M[Missing strategy]\n M --> V[Validation gate]`,
    },
  },
  "ai-ml-python-and-data-foundations-sql-for-data-science": {
    intro: `SQL is where most organizational data actually lives, so the data scientist who queries it directly — rather than waiting for extracts — moves ten times faster and ten times truer. The subject is analytical SQL: joins beyond CRUD, window functions, CTEs, cohort logic, feature extraction straight from tables, and the discipline of writing queries that run on 100 million rows without heroics. the database answered your question already — your job is learning to ask it precisely.`,
    foundations: `Relational model recap: tables, keys, joins (inner/left/full), group/aggregate, HAVING vs WHERE. CTEs (WITH name AS (...)) for legible staged logic — read top-down like a story; subqueries equivalent but nest-noisy. Window functions: OVER (PARTITION BY ... ORDER BY ...) with row_number, rank, dense_rank, lag/lead, running sums with SUM() OVER (), percent_rank, NTILE; they compute across related rows without collapsing the result like GROUP BY. Data types and indexes; EXPLAIN for plans; partitioning by date; OLAP databases (BigQuery, Snowflake, Redshift, DuckDB for local) with columnar storage.`,
    concepts: [
      {
        title: "CTEs: queries that read like paragraphs.",
        body: `WITH base AS (SELECT ... WHERE ...), enriched AS (SELECT base.*, ... FROM base LEFT JOIN ...), final AS (SELECT ... FROM enriched) SELECT * FROM final; — each CTE is a named transformation; refactor by renaming one block; debug by selecting individual CTEs; the whole query becomes a narrative: raw → filtered → enriched → reported; nested subqueries buried three levels deep are the same logic written to be inscrutable; the performance equals (planner flattens), the readability is the prize; CTEs also enable recursion (recursive WITH for hierarchies: org charts, category trees).`,
      },
      {
        title: "Window functions: the analyst superpower.",
        body: `row_number() OVER (PARTITION BY user_id ORDER BY ts) — per-user sequence; lag(amount) OVER (ORDER BY day) — yesterday for today (deltas, growth); SUM(revenue) OVER (ORDER BY month) — running totals; NTILE(4) — quartiles; first/last_value for window edges; percent_rank() for relative standing; perfect for: sessionization (gaps > 30 min separate sessions via lag), dedupe (keep newest row_number()=1), funnel steps (prev action per user), streaks (count consecutive days); all computed in one pass — no self-join explosions.`,
      },
      {
        title: "Cohort and retention analysis patterns.",
        body: `Cohort = users sharing start event month; retention = fraction active in week N after first event. Pattern: assign cohort month via MIN(ts) OVER (PARTITION BY user); bucket weeks via DATEDIFF; aggregate active users per cohort×week; pivot wide for the classic triangle table; sliding windows for rolling retention; this five-minute query replaces the spreadsheet ritual of "how many March users came back in May"; the same shape drives A/B readouts (treated vs control per cohort week) and LTV curves.`,
      },
      {
        title: "Feature extraction from tables.",
        body: `Before modeling: derive per-entity aggregates — total purchases, avg basket, days since first/last, purchase frequency, recency deciles, weekday mix — via GROUP BY + windows; NTILE for bucketized familiarity; join back for point-in-time correctness (feature computed strictly before prediction timestamp — leakage is the silent killer; snapshot features as of a cutoff: WHERE ts < cutoff grouped per user); store as feature tables versioned by run — the same discipline as any ETL; warehouses with dbt make this repeatable; SQL is stricter and faster than pandas for joins on billions of rows.`,
      },
      {
        title: "Performance on big tables.",
        body: `Select only needed columns; filter early (partition pruning by date!); avoid functions on filtered columns (kills indexes); join on indexed keys; EXPLAIN before assuming — scan types and join order tell the truth; approximate: COUNT(*) exact on huge tables is expensive — use TABLESAMPLE or approximate functions where approximate is fine; materialize expensive repeated CTEs as temp tables or materialized views for BI reuse; OLAP engines differ (DuckDB for local 100M-row sanity checks — install it, it changes your life); benchmark variants, then commit the fastest readable one.`,
      },
    ],
    worked: [
      {
        title: "Sessionize clickstream in one query.",
        body: `WITH tagged AS (SELECT *, CASE WHEN ts - LAG(ts) OVER (PARTITION BY user_id ORDER BY ts) > INTERVAL '30 minutes' THEN 1 ELSE 0 END AS new_session FROM events), sessions AS (SELECT *, SUM(new_session) OVER (PARTITION BY user_id ORDER BY ts) AS session_id FROM tagged) SELECT session_id, MIN(ts) start, MAX(ts) end, COUNT(*) FROM sessions GROUP BY session_id; — no procedural code, no joins, one pass, correct for 100M rows; BI team adopted it verbatim.`,
      },
      {
        title: "Build a churn-risk feature set without leakage.",
        body: `Features per customer as of 2026-10-01: orders_last_90d (COUNT(*) FILTER WHERE ts >= cutoff - 90d), days_since_last, avg_order_value, distinct_categories, support_tickets_last_90d; all computed with the same WHERE ts < cutoff guard — nothing from after the prediction date can leak in; joined to labels (churned in next 30 days) from a later snapshot; the model that ate this feature set reached 0.84 AUC; the one that accidentally included post-cutoff orders: 0.99 AUC and a ruined demo to the board.`,
      },
      {
        title: "Refactor the 400-line monolith query.",
        body: `One-line-wider-than-screen monster with nine nested subqueries → seven CTEs in reading order: raw → clean → aggregate → rank → select; every name explains itself; runtime identical (planner flattened both); review time from hours to 20 minutes; the diff was rejected twice and merged after structure alone changed — the query had no logic bug, it had a comprehensibility bug, which is the worse bug for production analytics.`,
      },
    ],
    exam: [
      {
        question: "What do window functions compute that GROUP BY cannot?",
        answer:
          "Per-row values derived from related rows — ranks, deltas, running totals — all while preserving row granularity instead of collapsing it; GROUP BY summarizes; OVER () augments; the difference is the difference between a report and a dataset.",
      },
      {
        question:
          "Why do CTEs improve both reviewability and often performance?",
        answer:
          "They segment logic into named readable stages (review one block at a time), and planners inline them — same plan as nested subqueries typically; recursive CTEs add power; the real win is that the next engineer can change the query without fear, which is worth more than microseconds.",
      },
      {
        question:
          "What is point-in-time correctness and why does it dominate feature SQL?",
        answer:
          "Every feature for prediction time T must use only data available before T — future information leaked in makes models unbeatable offline and useless online; enforce with a ts < cutoff predicate in every window and group, then snapshot outputs per run — the entire discipline of leakage prevention lives in these two lines.",
      },
      {
        question:
          "Why must heavy WHERE filters always hit partitioned or indexed columns?",
        answer:
          "Partition pruning and index seeks skip 90-99% of data before reading it — full scans on unpartitioned keys read everything, turning seconds into hours and burning slots; never wrap filtered columns in functions and never filter on computed columns without an index.",
      },
    ],
    cheat: [
      "WITH for staged narrative queries; one CTE per transformation.",
      "Window fns: row_number, lag/lead, running SUM OVER, NTILE, percent_rank.",
      "Sessionization: lag(ts) gap > threshold → new session flag → SUM flag = session_id.",
      "Cohorts: MIN(ts) OVER PARTITION BY user for birth month; week buckets; pivot triangle.",
      "Filter early, select narrow, partition-pruned predicates on indexed keys.",
      "EXPLAIN before optimizing; DuckDB for local scale checks; MV for reuse.",
      "Point-in-time guard: ts < cutoff everywhere in feature SQL.",
    ],
    recap: `SQL for data science is precise questions at scale: CTE pipelines that read like prose, window functions that augment rows instead of collapsing them, cohort queries that replace spreadsheet archaeology, feature extraction with point-in-time discipline baked in, and partition-aware predicates that make billions of rows tractable — everything you need to ask the warehouse what it already knows.`,
    code: {
      title: "Running total and delta",
      language: "sql",
      code: `SELECT day, revenue, revenue - LAG(revenue, 1) OVER w AS daily_change, SUM(revenue) OVER w AS mtd FROM t WINDOW w AS (ORDER BY day);`,
      explanation:
        "One pass computes delta and month-to-date totals via a named window frame — zero self-joins, one scan, full insight.",
    },
    diagram: {
      title: "Query as pipeline",
      caption: "Stages you can read top to bottom.",
      mermaid: `flowchart LR\n R[Raw table] --> C[Clean CTE]\n C --> A[Aggregate CTE]\n A --> O[Output]`,
    },
  },
  "ai-ml-python-and-data-foundations-data-visualization": {
    intro: `Data visualization is where analysis becomes decisions — the honest picture of data is the cheapest, most persuasive instrument in the room. The subject is choosing encodings (position > length > angle > color), building charts that do not lie (axes, baselines, distributions), the toolchain (Matplotlib/Seaborn for exploration, Plotly for interactive, dashboards for delivery), and the ethics of visual honesty. every chart is an argument — make it a true one.`,
    foundations: `Marks and channels: position (x,y) most precise, then length, angle/area (worst for comparison), color (hue for categories, sequential for magnitude, diverging for deviation). Grammar of Graphics (ggplot/Matplotlib): data → aesthetics → geometries → facets. Chart selection by message: distribution → histogram/box/violin/ECDF (never just mean+-std alone); comparison → bar (sorted!) vs line (time); relationship → scatter with alpha, hexbin for density; ranking → sorted bar/lollipop; composition → stacked bar sparingly (100% bars only when parts sum meaningfully). Avoid: 3D, dual axes, truncated y-axis, pie > 5 slices.`,
    concepts: [
      {
        title: "Encoding selection: position beats color every time.",
        body: `Humans decode position on a common scale best — all quantitative comparisons want a shared axis; bars beat pie charts for exactly this reason (angles and areas lie to the eye by 20-40%); scatter with opacity for density; small multiples (facets) for group comparison — nine small axes beat one tangled legend; direct labeling > legends whenever feasible; color redundant encoding (length + hue) for accessibility (8% colorblind men — viridis/cividis palettes); text annotations with numbers at the extremes tell the story without a caption paragraph.`,
      },
      {
        title: "Distributions: stop plotting only the mean.",
        body: `Means hide bimodality, skew, outliers and confidence. Show histograms (bins honest: sqrt(n) or Freedman-Diaconis), box/violin (quartiles + density), ECDF (full distribution, no binning decisions — preferred at scale); overlay raw points with jitter for small n; report spread (std/IQR) with every average; dual-axis mean vs median as skew detector; overlapping density plots for before/after interventions (with alpha or filled curves); the chart that changed the business was almost always "the average lied, here is the distribution".`,
      },
      {
        title: "Time series: trends, seasonality, and annotations.",
        body: `Line charts for time; rolling averages to reveal signal under noise; mark events structurally (launches, outages, policy changes) with vlines + labels — unexplained jumps are interpretation traps; seasonality visible via same-period overlays or facets; log scale when orders of magnitude span; avoid smoothing that invents features — annotate smoothing windows; bar charts for discrete periods; secondary axis only with extreme justification (label both!); interactive hover tooltips (Plotly) for dense daily series; sparklines inline in dashboards for at-a-glance trends.`,
      },
      {
        title: "Toolchain: Matplotlib, Seaborn, Plotly, dashboards.",
        body: `Matplotlib: full control, verbose; Seaborn: statistical defaults on Matplotlib (paired, despine, pastel style) — 80% of notebooks; Plotly: interactive HTML/Dash — hover, zoom, facets, export; Vega-Lite for declarative JSON specs; dashboards: Streamlit (Python-native, fastest to value), Dash (Plotly callbacks), Evidence/Preset (SQL-first BI); Marimo notebooks for reactive reproducibility; D3 when you truly need custom interactivity in production; never hand-roll SVG charts before exhausting the hierarchy.`,
      },
      {
        title: "The honesty contract: axes, baselines, and context.",
        body: `Every chart: labeled axes with units, honest zero baseline for bars (non-zero start must be justified visibly), appropriate y-axis, title stating the finding (not "Chart of revenue"), source footnote, date range visible; comparisons confounding-free — normalize when populations differ (per-capita, % not absolute for growth comparisons); missing data shown as gaps not interpolated fiction; colorblind-checked palettes; dark mode contrast verified; the first question to ask of any chart: "what would make this chart deceptive?" — then disarm it.`,
      },
    ],
    worked: [
      {
        title: "Fix the deceptive exec dashboard.",
        body: `Marketing "hockey stick growth" chart: y from 80 to 100, dual axis, 3D bars — growth appeared 10x, actual 1.25x YoY. Rebuild: zero-baseline bars sorted by period, single axis, growth % annotated at end, source note; exec trusts the new chart; the marketing VP argued for the old one; the CFO signed the redesign; the company policy now: every external chart reviewed by one skeptic before publication — the cheapest risk control ever invented.`,
      },
      {
        title: "Diagnose a bimodal wait-time distribution.",
        body: `Mean response latency "4.2 s" triggered a false outage review — histogram revealed two clusters: cache hits 0.1 s and DB fallback 9 s with 70/30 mix; the mean described neither; fix targeted the 30% (index build) — latency mean 1.4 s; the correct chart turned a fake crisis into a 2-hour fix; rule learned: report medians + p95 + histogram always for latency.`,
      },
      {
        title: "Ship a Streamlit cohort dashboard in a day.",
        body: `SQL cohort query → pandas → pivot → Seaborn heatmap of retention % by week with annotations → Streamlit: selectors (product, channel, date range) + download CSV button + auto-refresh from warehouse every morning; stakeholders self-serve retention answers; the analyst regained 15 hours/week; the dashboard had two bugs in four months, both caught by eyeballing since nobody scripted screenshot review — add pixel tests for critical tiles.`,
      },
    ],
    exam: [
      {
        question:
          "Why are bars preferred over pie charts for comparing quantities?",
        answer:
          "Position and length on a common scale encode magnitude linearly and accurately; angles and areas are decoded non-linearly by the visual cortex with systematic error; beyond ~4 slices pies are unreadable; bars also sort, making rank explicit — pies cannot.",
      },
      {
        question: "When does truncating a bar chart axis ever acceptable?",
        answer:
          "Essentially never without loud annotation, and even then rarely for bars (they must start at zero by definition of visual area); line charts may zoom to data range with labeled axis breaks; bars with broken axes are the single most effective visual lie in business history.",
      },
      {
        question: "What does an ECDF show that a histogram obscures?",
        answer:
          "Every quantile — exact fraction of observations below any threshold, no binning artifacts, stable across outliers — the ideal distribution view for SLAs, tail risk and sample sizes > 1000; pair with a rug or percentile table for speech-ready summaries.",
      },
      {
        question: "What three elements prove a chart honest at a glance?",
        answer:
          "Zero-based bars or clearly labeled axis bounds, units on every axis, and a source/date footnote — with these, most deception is impossible by construction; add one skeptical reviewer for public-facing charts and your visual integrity is unassailable.",
      },
    ],
    cheat: [
      "Position > length > angle > area > color: choose encodings in that order.",
      "Distributions first: histogram/ECDF/box; means with spread always.",
      "Sorted bars; small multiples; direct labels; viridis for color.",
      "Zero baselines for bars; y-zoom labeled for lines; one axis.",
      "Seaborn for explore, Plotly for interactive, Streamlit for delivery.",
      "Annotate events on timelines; rolling means with window named.",
      "Title states the finding; source line always; skeptic review for public.",
    ],
    recap: `Visualization is persuasion engineering: honest encodings (position over color), full distributions over lonely means, zero baselines and labeled axes as non-negotiable ethics, the right tool at each stage (Seaborn → Plotly → Streamlit), and annotations that carry the story — because the most powerful data tool is the one nobody can misread, and only honest charts earn trust over time.`,
    code: {
      title: "Minimal honest chart",
      language: "python",
      code: `sns.ecdfplot(data=df, x='latency_ms', hue='region'); plt.xlabel('latency (ms)'); plt.title('Cache-hit rate improved 12% after March index deploy'); plt.show()`,
      explanation:
        "ECDF avoids binning debates, hue splits regions, title states the finding, units on the axis — honesty by construction in four lines.",
    },
    diagram: {
      title: "Chart selection by message",
      caption: "Message first, mark second.",
      mermaid: `flowchart TD\n M[What is the message?] --> D[Distribution]\n M --> C[Compare]\n M --> T[Trend over time]`,
    },
  },
  "ai-ml-python-and-data-foundations-web-apis-and-scraping-for-data": {
    intro: `Building datasets often means collecting them yourself — from APIs and web pages — and doing it legally, politely, and resiliently. The subject is REST client craft (auth, pagination, retries, rate limits), respectful scraping (robots.txt, terms, politeness), HTML parsing, and turning raw pulls into reproducible pipelines. collecting data from the web is taking on responsibility — for reliability, for legality, and for the servers you touch.`,
    foundations: `REST: HTTP methods, status codes, headers (authorization Bearer tokens, API keys in headers or query), JSON bodies; pagination: offset/limit, page+per_page, cursor-based (best), link headers; rate limits: Retry-After, 429, X-RateLimit-Remaining — respect them or get banned; retries: exponential backoff with jitter on 5xx/429; idempotency for writes. Scraping: robots.txt is advisory-but-respected, ToS legally binding in many jurisdictions; HTML parsing via BeautifulSoup/lxml/selectolax; CSS selectors; be a good citizen: identify via User-Agent, throttle, cache, honor crawl-delay, stop when told. Legal: public ≠ free to use; GDPR/CCPA apply to personal data.`,
    concepts: [
      {
        title: "Client engineering: auth, retries, and pagination.",
        body: `Session objects (requests.Session/httpx.Client) pool connections and persist headers; auth via env vars (never commit keys); retry wrapper (urllib3 Retry or tenacity) with exponential backoff + jitter, retry on 429/5xx only, respect Retry-After verbatim; timeouts always (connect/read split); pagination iterator generator: yields rows, tracks cursor, stops on short page or empty; checkpointing: persist last cursor to disk for resumable pulls; measured throughput obeys the limit whether advertised or not; log per-request status/latency/scope for forensics; tests against recorded fixtures (vcrpy) to avoid CI hammering live APIs.`,
      },
      {
        title: "Scraping with respect and skill.",
        body: `Start: read robots.txt and ToS; check for official API or dataset first (80% of needs covered); if no alternative: selective crawling, 1-2 rps max, honor crawl-delay, cache aggressively, off-peak hours; parse with selectolax (fast) or lxml; CSS selectors stable (data-* attrs beat class soup); handle dynamic pages: requests + parsel for static, Playwright for JS-heavy (heavy cost — prefer APIs); detect structural changes (selector returns empty at 10x normal rate → alert, stop); store raw + parsed for reprocessing; dedupe by content hash.`,
      },
      {
        title: "Rate limiting and cost control.",
        body: `Budget: requests per second per host (token bucket); parallelism via asyncio/httpx async or ThreadPool with host-keyed semaphores; global daily caps to avoid surprise bills (cloud APIs metered); exponential backoff on throttle; queue-based pulls with resumability beats ad-hoc loops; track cost metrics ($/1k calls); batch endpoints when available (100 records/call vs 1); per-host politeness windows (respect their infra); 429 handling: sleep Retry-After, do not blast; circuit-breaker after N consecutive failures — stop the job, page the owner.`,
      },
      {
        title: "Reliability: resumable, idempotent pipelines.",
        body: `Pull → raw store (S3/lake with run_id partition) — immutable raw layer; parse → staging; load → warehouse; each stage checkpointed; failures resume from last cursor/offset, never restart from zero; idempotent loads via MERGE/upsert by natural key; backfill vs incremental strategies; monitoring: rows/s, failure rate, freshness lag, schema drift detectors (column presence/types); alert on zero rows (the silent extractor death); re-run-ability: delete partition, re-pull — the whole pipeline repeatable from raw.`,
      },
      {
        title: "Legal and ethical guardrails.",
        body: `Personal data → GDPR/CCPA obligations (lawful basis, deletion rights, DPO contact); copyrighted content scraping for model training is legally contested (check jurisdiction, license, opt-outs like ai.txt/robots); ToS violations can be breach of contract (hiQ v. LinkedIn evolving); public APIs with free tiers still demand auth etiquette; never scrape behind logins you do not own; commercial at-scale scraping often needs a license; when in doubt, ask — many platforms offer research datasets or cheap access; the reputational cost outruns the legal one usually.`,
      },
    ],
    worked: [
      {
        title: "Ingest a rate-limited market-data API daily.",
        body: `API: 300 req/min, cursor pagination, auth token in header. Build: httpx client with Retry (429/5xx → backoff); generator pages with cursor persisted to state.json; transformer to parquet partitioned by date; upsert into the warehouse by (symbol, trade_date); nightly job with alerts on zero-row days; backfill script replays any gap by cursor range; the pull cost $0 under the free tier; six months no incident; the CLIs are idempotent — safe reruns always.`,
      },
      {
        title: "Scrape a public archive respectfully overnight.",
        body: `Evaluated: no API; robots.txt allows /archive with crawl-delay 2; ToS permits non-commercial use (validated with the org"s counsel); implementation: 0.5 rps, identifying UA, selection of 3 collection indexes only, cache raw pages to disk (never re-fetch), selectolax parsing, selector-drift alarm (empty match rate > 5% halts job), 40k docs in 22 h, zero complaints, raw preserved for re-parses when layout changed once — the right way to take without taking.`,
      },
      {
        title: "Fix an extractor that silently delivered empty data.",
        body: `Nightly job green for two weeks, warehouse empty. Root cause: upstream added required query param; requests got 403 JSON; parser found zero .product nodes; loop "succeeded" with zero rows. Fix: assert expected row counts > 0; validate status codes; schema check on first record; alert on empty pulls; postmortem added "zero rows" as a first-class alert; the failure mode recurred in six sister pipelines — all patched by the same three assertions.`,
      },
    ],
    exam: [
      {
        question:
          "Why must you never retry on 4xx errors (except 429), and what do you do instead?",
        answer:
          "4xx means the request itself is wrong or unauthorized — retrying the identical request produces identical failures forever; fix the parameter/auth/payload, not the retry count; 429 is different: it says slow down, obey Retry-After verbatim and back off.",
      },
      {
        question:
          "What is the first thing to check before scraping anything, and the second?",
        answer:
          "First: does an official API/dataset exist (usually yes, cheaper and legal)? Second: robots.txt and ToS — if they prohibit, stop or get permission; respecting both eliminates most legal exposure and most technical pain before a line of code.",
      },
      {
        question:
          "What three properties make a collection pipeline production-grade?",
        answer:
          "Resumability (checkpointed cursors), idempotency (upserts, merge keys), and observability (row counts, freshness, drift alarms) — the pipeline must survive failures mid-run, reruns must not duplicate, and silent breakage must wake someone immediately.",
      },
      {
        question: "When does scraping cross from unwise into unlawful?",
        answer:
          "When it violates ToS in binding jurisdictions, breaches technical access controls, harvests personal data without lawful basis, or republishes copyrighted works beyond license — and when the ignored opt-out expresses clear rights; the ethics scale with volume and harm; ask counsel at commercial scale.",
      },
    ],
    cheat: [
      "Prefer APIs over scraping; when scraping: robots.txt + ToS first.",
      "Sessions persist pools/headers; env-var secrets; always timeouts.",
      "Retry only 429/5xx with backoff+jitter; obey Retry-After.",
      "Cursor checkpointing; resumable; idempotent upserts; raw layer immutable.",
      "Throttle per host; identify via UA; crawl-delay; off-peak.",
      "Validate status + schema + non-zero rows; alert on empties.",
      "Personal data → DP law; copyrighted → license; ask when unsure.",
    ],
    recap: `Data collection is engineering with manners: REST craft with sessions, timeouts, bounded retries and cursor checkpoints; scraping only after robots.txt and ToS clear, with identification, throttling, caching and drift alarms; pipelines that resume, dedupe and alert on zero-row silence; and legal judgment applied before volume — because the dataset is only as valuable as it is trustworthy and defensible.`,
    code: {
      title: "Resumable pagination sketch",
      language: "python",
      code: `while (cursor := state.get('cursor')) is not None:\n r = sess.get(url, params={'cursor': cursor}, timeout=30)\n r.raise_for_status()\n yield from r.json()['items']; state['cursor'] = r.json().get('next')`,
      explanation:
        "Persisted cursor after every page; crash anywhere, resume exactly; zero-duplicate, zero-gap incremental pulls with one loop.",
    },
    diagram: {
      title: "Collection pipeline stages",
      caption: "Pull, store raw, parse, load.",
      mermaid: `flowchart LR\n S[Source] --> R[Raw store]\n R --> P[Parse]\n P --> W[Warehouse]`,
    },
  },
  "ai-ml-python-and-data-foundations-polars-and-modern-dataframes": {
    intro: `Polars is the modern DataFrame engine — multi-threaded, memory-efficient, expression-based — that runs 10-100x faster than pandas on serious workloads and is increasingly the default for new pipelines. The subject is thinking in expressions and lazy evaluation: method chains that the optimizer rewrites into streaming physical plans executing on all cores without loading entire datasets. Polars is pandas rebuilt for speed and honesty — columnar, lazy, parallel by default.`,
    foundations: `Two APIs: eager (pl.DataFrame, immediate) and lazy (pl.scan_parquet / LazyFrame + collect()) — lazy builds a query plan optimized before execution: predicate pushdown (filter at storage level), projection pushdown (read only needed columns), join reordering, streaming execution for out-of-core work. Expressions (pl.col, pl.when/then/otherwise, .over(...) window expressions, .cast(), .fill_null()) compose and are the whole mental model — labeled pipe chains, no method soup. Memory: Arrow-backed, no index baggage, string interning; streaming for >RAM datasets.`,
    concepts: [
      {
        title: "Lazy evaluation: plan first, execute once.",
        body: `LazyFrame chains encode what you want; the optimizer rewrites: filters evaluated during scan (never read excluded row groups), only required columns read from parquet, joins reordered for selectivity, common subexpressions cached; collect() runs the optimized plan; explain() shows the physical plan — read it to verify pushdown worked; hand-written "helpful" restructuring often defeats the optimizer; write declarative chains and let it work; sudden 5x speedups from removing one stray .collect() mid-chain surprise everyone the first time.`,
      },
      {
        title: "Expressions over methods: the one true style.",
        body: `df.select(pl.col('price') * pl.col('qty').alias('revenue'), pl.col('user').n_unique().alias('users')).group_by('region').agg(...) — expressions nest, reuse, and translate across contexts (select/filter/with_columns/group_by); pl.when(cond).then(val).otherwise(default) replaces nested np.where/np.select and vectorizes cleanly; .over('group') performs window operations in the same plan; method calls are conveniences; expressions are the bytecode — learn them, because every senior Polars review reads expressions not methods.`,
      },
      {
        title: "Streaming and out-of-core workloads.",
        body: `scan_parquet(...).filter(...).group_by(...).agg(...).sink_parquet('out') / sink_delta — the pipeline never materializes the intermediate full relation; memory stays near constant regardless of dataset size; 200 GB files process on a laptop; performance scales with cores (joins parallelize); this one feature moves serious ETL off cluster infrastructure; mental shift: you design graphs over streams, not objects over tables.`,
      },
      {
        title: "Type safety and strict schemas.",
        body: `Polars is typed end-to-end: every expression knows its dtype at plan time — errors surface before execution; explicit schemas on scan (schema_overrides) freeze contracts; null handling typed (Int64 vs UInt vs Boolean all explicit); cast() with strict=True fails loudly; datetimes timezone-aware; no silent object dtype — no pickle-of-horrors; validation is structural, and the error messages name the column and the mismatch; this is the sanity pandas never had and does not want back.`,
      },
      {
        title: "Interoperability and migration strategy.",
        body: `Bridges: polars ↔ pandas (to_pandas/from_pandas, zero-copy for Arrow-backed dtypes), Arrow ↔ everything (pyarrow seamless), numpy via .to_numpy(); migrate hot pandas paths first (profiles will name them); test-equivalence harnesses: same input → compare key aggregates with tolerance; keep notebooks on pandas if the team is happy, move batch/production to Polars; watch for pandas-isms that do not map (index semantics, .loc/.iloc habits — Polars drops the index entirely, embrace columns); reading code > writing; the port usually shrinks the code 30%.`,
      },
    ],
    worked: [
      {
        title: "Port a pandas aggregation, measure 40x.",
        body: `Nightly pandas job: read 60 GB CSV, groupby customer sum revenue/ orders, filter top 10k, write parquet — 52 minutes on 32 cores. Polars: scan_csv → filter → group_by.agg both metrics → sort desc → head(10000) → sink_parquet; streaming mode; 74 seconds; memory peak 1.1 GB vs 34 GB; same outputs verified to 1e-9; the migration was an afternoon; the on-call waking for this job: zero times since.`,
      },
      {
        title: "Sessionize a clickstream at 300M rows.",
        body: `lazy chain: scan_parquet events → sort by user, ts → with_columns(ts.sort within groups via .over('user')) → new_session = (ts - ts.shift().over('user') > 30 minutes) → session_id = cum_sum(new_session).over('user') → group_by(session_id).agg(start/end/count) → sink; zero full materialization; runtime 9 minutes vs 90+; identical logic to the SQL version, one language end-to-end; the analyst who wrote it got promoted to staff in six months partly on this file.`,
      },
      {
        title: "Fix a silent dtype corruption in a legacy CSV.",
        body: `Amount column mixed "1200.50" and "$1,200.50 " with blanks — pandas made object soup, downstream sums wrong by currency formatting. Polars scan with schema_overrides rejecting malformed rows via strict cast → parse errors surfaced immediately with row context; bad rows isolated, cleaned with explicit regex strip then cast; output validated vs source counts; the corruption fixed at the boundary, never downstream again — the $400k reconciliation gap closed that quarter.`,
      },
    ],
    exam: [
      {
        question: "What does lazy evaluation buy beyond raw speed?",
        answer:
          "A global optimization pass over your intent — predicates and projections pushed to the storage layer, joins reordered by stats, dead code eliminated — work you never wrote collapses before execution; it also enables streaming so datasets bigger than RAM process in bounded memory; eager APIs cannot reorder what they never saw.",
      },
      {
        question:
          "Why are expressions the center of Polars, not method chains like pandas?",
        answer:
          "Expressions are composable, typed, optimizable units — the same expression works in filter, select, with_columns and aggregations, and the planner can rewrite them; method chains bind to one calling context and defeat the optimizer; writing expressions is writing the plan itself.",
      },
      {
        question: "What does projection pushdown prevent, concretely?",
        answer:
          "Reading columns you never reference — from parquet, the engine reads only required column chunks, skipping gigabytes of irrelevant data; on wide tables with hundreds of columns this alone is often a 10x win; it happens automatically in lazy mode and essentially never in naive eager reads.",
      },
      {
        question: "What must you unlearn from pandas when migrating?",
        answer:
          "The index (gone — embrace columns and .over expressions), in-place mutation, .loc/.iloc positional habits, and object dtypes as defaults — Polars wants explicit schemas, expressions, and immutable lazy pipelines; the discipline it demands is already best practice, just enforced instead of optional.",
      },
    ],
    cheat: [
      "Lazy by default: scan → filter/select/with_columns/group_by → sink.",
      "Expressions compose everywhere; pl.when/otherwise; .over for windows.",
      "Predicate + projection pushdown from parquet — read less, not faster.",
      "sink_parquet for out-of-core; memory stays flat at any scale.",
      "Strict schemas; cast(strict=True); no object soup.",
      "explain() your plan; verify pushdown before tuning threads.",
      "Migrate hottest pandas paths first; verify aggregates to 1e-9.",
    ],
    recap: `Polars is the expression-typed, lazy, multi-threaded DataFrame built for speed and bounded memory: declare intent as composable expressions over LazyFrames, let the optimizer push work to the storage layer and stream the rest, and enforce strict schemas at the boundary — the code shrinks, the speed multiplies, and the class of silent pandas failures simply stops existing.`,
    code: {
      title: "Lazy aggregation",
      language: "python",
      code: `pl.scan_parquet('sales.parquet').filter(pl.col('year') == 2026).group_by('region').agg(pl.sum('revenue'), pl.len().alias('orders')).collect()`,
      explanation:
        "Predicate pushdown skips row groups; only two columns read; parallel aggregation; one collect at the end — the entire job in bounded memory.",
    },
    diagram: {
      title: "Lazy pipeline",
      caption: "Declare, optimize, execute, stream.",
      mermaid: `flowchart LR\n S[scan] --> P[Optimize plan]\n P --> E[Execute streaming]\n E --> O[Output]`,
    },
  },
};

import type { TopicLesson } from "../topicLessons.js"; /** * Data Engineering Essentials — 4 authored topic lessons. * * Standalone chapters per topic. Subject-first prose, foundations, core * concepts, worked examples, exam practice, cheat sheet, recap. No shared * templates, no runtime composition. */
export const dataEngineeringEssentials: Record<string, TopicLesson> = {
  "ai-ml-data-engineering-essentials-data-pipelines-and-orchestration": {
    intro: `Data pipelines are the plumbing between raw sources and models — scheduled, retried, observable workflows that move bytes from A to B consistently. The subject is building them to survive reality: batch vs streaming trade-offs, DAG orchestration, idempotency, retries with backoff, and observability that catches silent corruption before training does. a pipeline is a contract — every run either produces correct data or fails loudly.`,
    foundations: `Batch (Airflow, Dagster, Prefect) vs streaming (Kafka/Flink): batch for bounded windows with complex dependencies; streaming for continuous low-latency. DAG: directed acyclic graph of tasks (nodes: extract, validate, transform, load, train); edges express dependencies; schedulers trigger on time/events; sensors and triggers; SLAs. Idempotency: safe reruns — upserts, delete-then-insert partitions, versioned outputs; retries: exponential backoff + jitter, max attempts, dead-letter for poison tasks; alerting: lag, failure rate, freshness vs SLA; lineage: tracking source→output for audits and debugging.`,
    concepts: [
      {
        title: "Batch vs streaming: decide by latency and complexity.",
        body: `Need correctness within hours and multi-step transforms? Batch with a DAG — simpler to reason about, test, and backfill. Need sub-minute reactions (fraud, features for live models)? Streaming (Kafka → Flink/Spark Structured Streaming) with exactly-once semantics where the framework gives it. Many shops run lambda-style both: batch correctness + streaming approximations. Avoid streaming for what batch does fine — operational cost 10x; avoid batch for freshness-critical cases — lossy UX. Decide from the business latency budget backward, never from tool fashion.`,
      },
      {
        title: "Orchestration: Airflow, Dagster, Prefect compared.",
        body: `Airflow: ubiquitous, DAG-as-Python, massive ecosystem; semantics: tasks idempotent, executors scale horizontally, XCom passes small metadata (not bulk data!); strong backfill story. Dagster: asset-centric — you declare tables/files to produce and it schedules eagerly, lineage is first-class, types on IO. Prefect: Pythonic dynamic flows, easy incremental adoption, hosted option. Principles regardless of tool: tasks small and idempotent; heavy data in object storage between tasks (never in XCom/memory); config in code, secrets in env; dependencies explicit; every DAG has an owner and SLA.`,
      },
      {
        title: "Idempotency and backfills: the trust properties.",
        body: `A pipeline that cannot rerun safely will corrupt quietly. Design: write to new partition then atomic rename/swap (Hive-style), or upsert by primary key, or truncate+insert within the partition transaction; deterministic task outputs given inputs (same config → same data); stable cursors for incremental extraction; backfills: parameterize dates, run ranges bounded, parallelize by partition, throttle to protect prod; verify counts/checksums post-backfill; never patch forward with mystery scripts — rerun the real code path. Idempotency is what makes retries safe instead of duplicating promotions.`,
      },
      {
        title: "Retries, failures, and poison tasks.",
        body: `Failure classes: transient (network, 5xx, OOM — retry with exponential backoff + jitter), permanent (bad data, schema violation — fail fast, alert, quarantine the bad partition), systemic (dependency down — circuit-breaker, retry across the fleet carefully to avoid stampeding recovery). Poison task detection: consecutive failure count, not just one; dead-letter with context + replay tooling; timeouts everywhere (tasks without timeouts are the ones that hang forever); graceful degradation: serve stale features rather than crash predictions when the pipeline breaks — with explicit freshness alerts.`,
      },
      {
        title: "Observability: lag, freshness, and quality gates.",
        body: `Metrics per DAG/task: run duration p50/p95, success/failure rate, queue depth, schedule lag vs SLA; watermark tracking for streaming; silent corruption detectors: row count deltas > ±30%, null rate spikes, distinct-count anomalies, schema drift checks (column added/removed/type changed); quality gates: expectation suites (Great Expectations / Soda) fail the task or quarantine; SLOs per pipeline ("99.5% runs complete by 06:00, data fresh within 30 min"); alerts page humans, metrics dashboards for daily health; lineage graphs for impact analysis during incidents.`,
      },
    ],
    worked: [
      {
        title: "Design the nightly training-data DAG.",
        body: `Nodes: extract_events (partition by ds, cursor) → validate_raw (null budgets, dedup — fail/quarantine) → build_features (idempotent writes to features/ds={ds}) → feature_stats (drift check vs baseline — alert) → train_eval (trains candidate, gates on AUC/recall floors vs champion) → register_model (if better) → notify (Slack summary). SLA 06:30; backfill via ds param; two retries with 5-min backoff on IO tasks only; quarantine table for bad partitions; the DAG failed loudly twice in 90 days (both upstream schema changes), zero silent bad models shipped.`,
      },
      {
        title: "Upgrade a polling cron to a real orchestrator.",
        body: `Symptoms: three cron scripts on a shared box, cat-and-pray dependencies, silent 3-day outage once. Migration: wrap each script as idempotent tasks in Dagster; assets declared (raw_events → clean_events → features); backfill 30 days in parallel; IO managers handle parquet paths; alerts to PagerDuty on failure, Slack on SLA miss; lineage answered "what feeds model v12 features?" in 10 seconds; the monolith cron retired; on-call happiness restored.`,
      },
      {
        title: "Recover from a poisoned historical partition.",
        body: `Backfill of March 2026 revealed 12 days of duplicated events corrupted by a re-run bug. Fix without panic: downstream feature tables for March rebuilt from raw via partition delete+reinsert; checksum match on row counts verified; model retrained on corrected window; March decisions (campaign targeting) re-issued with corrected audience; postmortem → the bug class (non-idempotent extract) eliminated with a UNIQUE constraint + upsert; the DAG was green; the incident had a receipt narrower than a day.`,
      },
    ],
    exam: [
      {
        question:
          "Why must pipeline tasks be idempotent, and name two patterns achieving it.",
        answer:
          "Because retries and backfills are inevitable and must never double-apply — delete/insert partition atomically, or upsert by natural key/primary key; a rerun either converges to the same state or does nothing; without it every retry multiplies corruption and trust in automation dies.",
      },
      {
        question:
          "Why is streaming usually wrong for a nightly training dataset build?",
        answer:
          "Latency budget is hours — batch is simpler, testable, backfillable, transactional per partition; streaming pays a continuous-operations tax (exactly-once gymnastics, state stores, hot fix discipline) to buy latency nobody asked for; choose streaming for minute-fresh needs only.",
      },
      {
        question: "What does XCom carry and what must never ride it?",
        answer:
          "Small metadata: ids, row counts, paths, statuses — control-plane chatter between tasks; bulk data never belongs there (serialize paths to object storage instead) — pushing dataframes through XCom melts metadata DBs and is the classic Airflow performance horror story.",
      },
      {
        question:
          "What does a quality gate at the pipeline boundary buy you over monitoring afterwards?",
        answer:
          "It stops wrong data from ever reaching training/serving — prevention replaces detection-and-panic; the gate fails the run, quarantines the partition, and pages humans while the blast radius stops at the boundary instead of metastasizing into a garbage model release.",
      },
    ],
    cheat: [
      "Batch for hours-of-latency work; streaming for minutes-or-less.",
      "DAGs: extract → validate → transform → load; every task idempotent.",
      "XCom carries paths and counts — never payloads.",
      "Retries: backoff + jitter on transient; fail fast on bad data; DLQ for poison.",
      "Quality gates fail loudly at the boundary; quarantine, don't patch.",
      "SLA per pipeline; alerts on lag/freshness; lineage answers blast radius.",
      "Backfills parameterized by partition; checksum-verify after.",
    ],
    recap: `Data pipelines are operational contracts: batch DAGs for hourly semantics with idempotent tasks, streaming only when latency justifies it, retries that are safe by construction, quality gates at the boundary that quarantine rather than poison downstream, and observability of freshness and lag — because the pipeline that fails loudly preserves models, and the one that fails silently eventually ships one.`,
    code: {
      title: "Idempotent partition write",
      language: "python",
      code: `tmp = out / '.tmp-ds=2026-11-01'\n(tmp.mkdir(parents=True))\nwrite_parquet(tmp, df)\ntmp.rename(out / 'ds=2026-11-01')`,
      explanation:
        "Write to a hidden temp dir then atomic rename — readers never see partial data; a rerun replaces the partition wholly; the oldest trick in reliable ETL.",
    },
    diagram: {
      title: "Pipeline lifecycle",
      caption: "Extract, validate, transform, gate, serve.",
      mermaid: `flowchart LR\n E[Extract] --> V[Validate]\n V --> T[Transform and load]\n T --> G[Quality gate]`,
    },
  },
  "ai-ml-data-engineering-essentials-data-quality-and-validation": {
    intro: `Data quality is the discipline of trusting your inputs — schema contracts, drift and anomaly detection, and testing for data the way you test code. The subject is the full apparatus: expectation suites, statistical fingerprinting, validation gates in pipelines, human review loops for edge cases, and the culture of treating silent corruption as a sev-1. models inherit the trustworthiness of their data, and no architecture compensates for lies upstream.`,
    foundations: `Quality dimensions: completeness (nulls), validity (ranges, formats, enums), uniqueness (dupes), consistency (cross-field invariants), timeliness (freshness), accuracy (vs source of truth). Expectations as code: Great Expectations / SodaCL checks — column not null, between, in set, regex match, row_count bounds, uniqueness; profiles: distribution stats (mean/std/quantiles, distinct counts) fingerprinted per run; drift: PSI (population stability index) on features, KL divergence for categorical; anomalies: z-score/IQR method or seasonal decomposition for time series.`,
    concepts: [
      {
        title: "Schema contracts as the first wall.",
        body: `Define the expected shape before data flows: columns, types, nullability, enum domains, key uniqueness — enforce at ingest (Avro/Protobuf/JSON Schema on the wire, or validation at the first pipeline task). Contracts fail the run the moment upstream changes shape — instead of models training on shifted silently. Consumer/producer agreement is documented and versioned; adding nullable fields is fine, removing or retyping breaks loudly; the contract is the border control between teams pretending to be decoupled.`,
      },
      {
        title: "Statistical fingerprinting and drift.",
        body: `Every run saves a fingerprint: per-column basics — count, null%, mean, std, min/max, quantiles, top-k values for categoricals. Compare against the rolling baseline (last N accepted runs): alert when null% doubles, mean shifts beyond k×stddev, distinct count changes > 50%, or new category appears; PSI: bucket expected vs actual distributions, warn at 0.1, fail at 0.25 for features; KS test for continuous; chi-square for categorical; drift reports attach to model cards — when the model degrades, you see it here first half the time.`,
      },
      {
        title: "Anomaly detection on metrics that matter.",
        body: `Freshness (max ts within SLA), volume (rows/day within band — 3σ around trailing average for stable series, control charts), revenue/outcome metrics (if you have a target, watch it), and distributional shape for key features; robust stats (median/IQR) resist spikes; seasonal decomposition (STL) for weekly cycles; alert tiers: warning (ticket, investigate next standup) vs critical (halt pipeline, page); every anomaly rule tuned to a false-positive budget — too many alerts = ignored alerts = no alerts.`,
      },
      {
        title: "Testing data like code.",
        body: `Unit tests for transformations (input fixture → expected output); property-based tests for invariants (sortedness, no negatives, join preserves row count); snapshot tests for critical aggregates; contract tests between producer/consumer (Pact-ish for data); CI runs the expectation suite on a sampled partition — unless it passes, merge blocked; canary pipelines in prod: run new transform logic on 1% of traffic, compare fingerprints, promote; regression diffing vs golden datasets from before incidents — every incident becomes a test case forever; the suite grows with scar tissue.`,
      },
      {
        title: "Human review loops for the unautomatable.",
        body: `Some checks need judgment: sampled labeling for drift suspicion, outlier adjudication (fraud-looking legit transaction vs legit-looking fraud), schema evolution decisions (is that new column intentional?), and ambiguous anomaly verdicts. Route via annotation queues with context (values, distribution, history), one-click verdicts feeding forward: approved → accepted baseline; rejected → quarantine + ticket; verdicts become training data for future automated classifiers; humans handle the 1% the machines flag, not the 100% they shouldn't need to.`,
      },
    ],
    worked: [
      {
        title: "Stop a silent unit-of-measure flip.",
        body: `Upstream supplier switched price column from cents to dollars overnight; pipeline stayed green; models priced everything 100x. Detection: expectation — price within p99 historical band 100x exceeded max; gate quarantined partition; page sent; fix in 40 minutes with the supplier; without the gate: invoice generator chaos, churn of enterprise clients. The expectation suite earned a year of salaries in one night.`,
      },
      {
        title: "PSI drift report catches label shift.",
        body: `PSI on engagement_score: baseline 0.03 → 0.31 after a logging SDK change skewed population mix; model CV held while prod AUC slid; drift report linked to canary fingerprint; decision: recalibrate thresholds on the new distribution, retrain with mixture correction (importance weighting by SDK version); the report was the only early signal — without it, the drift stayed invisible until conversion tanked.`,
      },
      {
        title: "Build the golden dataset from an incident.",
        body: `Duplicate-join bug shipped wrong segments for a week. Post-incident: curated 500-row golden file covering the exact failure (duplicates + null keys); test added asserting uniqueness and row-count preservation through the transform; CI runs it on every PR; the bug can never return silently; the exercise of building the golden set also surfaced two adjacent latent bugs nobody knew existed — the highest-ROI QA hours of the quarter.`,
      },
    ],
    exam: [
      {
        question:
          "Why enforce schema contracts at ingest instead of discovery later?",
        answer:
          "Discovery downstream means the damage already propagated — training, dashboards, invoices, models — cleanup across every consumer is ten times the cost of failing the producer at the door; contracts localize the failure to the boundary where the producer can still fix it before blast radius exists.",
      },
      {
        question: "What does PSI warn at 0.25 vs 0.1, practically?",
        answer:
          "0.1-0.25 means meaningful population shift worth investigating — investigate before retraining; above 0.25 the model's learned distribution is stale — retrain or recalibrate with importance weighting; silence below 0.1; both are tripwires monitored per feature, not verdicts on their own.",
      },
      {
        question:
          "Why should canary pipelines fingerprint new logic before promotion?",
        answer:
          "Because code review cannot see data-dependent failures — running new transforms on 1% of real traffic and comparing fingerprints catches the exact classes of bugs (joins inflating, casting truncations) that only appear with production data, at 1% blast radius instead of 100%.",
      },
      {
        question: "What makes an alert trustworthy enough to keep?",
        answer:
          "High precision with known actionability — every firing page leads to either a fix or a tuned-down rule; ignored alerts train teams to silence pipelines; every gate has a false-positive budget and a named owner who owns the tuning; precision is the price of paging humans.",
      },
    ],
    cheat: [
      "Contracts at ingest: types, nulls, enums, uniqueness — fail loud or don't ship.",
      "Fingerprint per run: nulls, mean, quantiles, cardinality; diff vs baseline.",
      "PSI 0.1 watch / 0.25 retrain; KS/chi-square for the same job.",
      "Expectations as CI gates; canary on 1% traffic before promotion.",
      "Golden datasets from incidents; every bug leaves a test.",
      "Human queue for the weird 1%; verdicts feed automation.",
      "Zero-row and freshness alerts — silent death is the enemy.",
    ],
    recap: `Data quality is cumulative engineering: schema contracts enforce shape at the border, fingerprints and PSI track drift continuously, expectation suites gate pipelines like unit tests, canaries validate behavior on real traffic, golden datasets encode incident scar tissue, and human review handles the tail — all monitored with precision-calibrated alerts, because upstream trust is the only substrate models have.`,
    code: {
      title: "PSI computation",
      language: "python",
      code: `psi = sum((a - b) * np.log(a / b) for a, b in zip(buckets_expected, buckets_actual))`,
      explanation:
        "Divergence between expected and live distributions; 0.1 investigation, 0.25 retrain trigger — one formula guarding every deployed model.",
    },
    diagram: {
      title: "Quality gates in the pipeline",
      caption: "Boundary checks, not forensics.",
      mermaid: `flowchart LR\n I[Ingest] --> C[Contract check]\n C --> F[Fingerprint diff]\n F --> G[Gate: pass or quarantine]`,
    },
  },
  "ai-ml-data-engineering-essentials-labeling-and-human-feedback-loops": {
    intro: `Labeling and human feedback loops are how data gets its meaning — supervised signal, evaluation data, RLHF preference pairs — and they fail quietly: a sloppy annotation spec poisons everything downstream more thoroughly than any neural bug. The subject is the craft: task design, guidelines, inter-rater agreement, active learning, quality control loops, and closing the loop from user feedback into training data. labels are the model's reality — annotate like your model's competence depends on it, because it does.`,
    foundations: `Task design: precise instructions with edge-case examples, binary/multi-class/grading rubrics; UI fit-for-task; pilot rounds to calibrate. Agreement metrics: Cohen's kappa (2 raters, chance-corrected), Fleiss' kappa (multi-rater), Krippendorff's alpha (any scales); targets ≥ 0.75 for training data, lower ok for exploratory. Active learning: model picks maximally informative unlabeled samples (uncertainty, margin, entropy) to label next — 10-100x label efficiency. QC: gold seeds (known answers), 5-10% overlap for agreement tracking, blind spot audits, adjudication by seniors. Feedback loops: user signals (thumbs, edits, escalations) → curated → training sets; RLHF: ranked pairs → reward model → PPO/DPO.`,
    concepts: [
      {
        title: "Task design: the instructions decide the dataset.",
        body: `Write guidelines before hiring annotators: one canonical definition per class, positive/negative/borderline examples, decision tree for ambiguities; keep taxonomy shallow (< 8 classes) unless hierarchy justifies it; pilot with 5 annotators on 100 items, measure agreement, revise the doc where they split; measure time per item (annotation UX pain = quality drift); version the guidelines like code; annotators trained to the doc, not to improvisation; the spec is the dataset — everything else is labor.`,
      },
      {
        title: "Inter-rater agreement: the honesty metric.",
        body: `Percent agreement is flattered by class imbalance (95% "yes" labels agree 95% by chance); kappa/alpha correct for chance. Measure pairwise and overall; report per class — some classes always disagree (document why); disagreement is data: high disagreement examples either ambiguous (fix spec), genuinely hard (stratify deliberately, keep labels with uncertainty), or need senior adjudication; track agreement over time per annotator — drift detects fatigue and gaming; low agreement = expensive labels = worse models downstream — always worth the up-front measurement.`,
      },
      {
        title: "Active learning: label what the model does not know.",
        body: `Uncertainty sampling: label lowest-confidence predictions (or highest entropy); margin sampling (smallest top-2 gap); diversity/batch-mode variants (coreset) to avoid redundant near-duplicates; expected model change for theoretical purists. Workflow: initial small random label set → train → score unlabeled pool → hand the 500 hardest to annotators → retrain → repeat; typical gains: match random-sampling accuracy with 10-30% of the labels; beware: uncertainty sampling concentrates on outliers/noise if not deduplicated — mix with random diversity quotas; works best mid-project, not from zero data.`,
      },
      {
        title: "Quality control machinery.",
        body: `Gold standard items: 5-10% of queue seeded with known answers — annotators falling below 85% gold accuracy get retrained; overlap 2-3x on 10% of tasks to compute live kappa; blind adjudication of disagreements by seniors; audit trails (who, when, seed) for compliance; response-time anomaly detection (too fast = rubber stamping); third-pass random audits — every batch, every week, forever; feedback economics: pay per quality-weighted unit, not raw count; vendor SLAs on agreement thresholds; QC is not a phase, it is the process.`,
      },
      {
        title: "Closing the loop: feedback into training.",
        body: `User thumbs up/down on LLM answers → flagged conversations → reviewer queue (is this genuinely bad?) → corrections pair (bad answer, ideal answer) into DPO/SFT set; thumbs-only without review trains on noise (users rate polish, not correctness); edit-based signals (user rewrote answer) are stronger than clicks; escalation → human resolution → gold pair; measure loop health: flag rate, reviewer agreement, precision of automated filter, conversion rate of feedback→improved metric in A/B; the flywheel compounds only when feedback is reviewed, curated, and retrained on schedule — not when it is hoarded.`,
      },
    ],
    worked: [
      {
        title: "Cut an annotation program's cost 60% with active learning.",
        body: `Budget: 100k intent labels for support bot, quoted $40k. Pipeline: 5k random seed → train → uncertainty + diversity selection of next 15k → annotate → retrain twice; final accuracy within 1% of the full 100k; total 20k labels, $8k; senior annotators only for the hard 5k ADJUDICATION set; result shipped in 9 weeks vs 6 months; the model launch team could afford GPU instead of vendor overrun — the economics of active learning hide in plain sight.`,
      },
      {
        title: "Diagnose a kappa of 0.41 and fix the spec.",
        body: `Sentiment task, two annotators, agreement 61%, kappa 0.41 — useless for training. Root cause: "neutral vs negative" boundary undefined for sarcasm and mixed reviews; fix: added sarcasm examples, three-pass decision tree (factual tone → face-value; clearly hostile-ironic → negative; balanced both-ways → neutral), pilot again: kappa 0.78; borderline disagreements kept as uncertainty-weighted labels; the model\'s F1 on neutral jumped 14 points from the spec rewrite alone.`,
      },
      {
        title: "Build the RLHF preference loop from support chats.",
        body: `Source: thumbs-down threads from chat UX + senior-resolved escalations. Curation: reviewer confirms wrongness + writes ideal answer (both pairs saved); volume 1.2k pairs/month; monthly DPO on top of SFT model; A/B: resolution rate +9%, CSAT +6 points; guard rails: 5% random audits of "ideal" answers (10% were themselves wrong — caught and corrected); the loop required one reviewer-day per week; the model quietly beats competitors\' on the company\'s real traffic now.`,
      },
    ],
    exam: [
      {
        question:
          "Why is raw inter-annotator percentage agreement a misleading metric?",
        answer:
          "It ignores chance agreement — with 95% one class, agreeing annotators hit 90%+ by random guessing; kappa/alpha correct for chance given marginals, exposing real overlap; always report chance-corrected scores, per class, with both pairwise and aggregate views.",
      },
      {
        question:
          "What does active learning change about the annotation budget?",
        answer:
          "It spends label budget where the model is currently weakest (uncertainty/margin/entropy with diversity), typically matching random-sampling quality at 10-30% of the cost; the trade is pipeline complexity and bias toward outliers — mix in random quotas and only start after the seed model exists.",
      },
      {
        question: "Why do gold-seed items exist in every annotation queue?",
        answer:
          "They are the tripwire for annotator collapse — accuracy-vs-gold per annotator per batch detects rubber-stamping and misunderstanding in near-real-time; without them quality drift is invisible until the model ships and fails in the field, where it bills you for the lesson.",
      },
      {
        question:
          "What is wrong with training directly on raw thumbs-down feedback?",
        answer:
          "Users reward polish and agreement, not truth — confidently wrong but fluent answers get thumbs-up; raw signals encode style preference as correctness; reviewed correction pairs (or edit deltas) are the only feedback with a truth anchor; everything else needs a curation gate.",
      },
    ],
    cheat: [
      "Guidelines with examples + decision tree; pilot and fix before hiring.",
      "Kappa ≥ 0.75 for training labels; per-class; over time per annotator.",
      "Active learning: uncertainty + diversity; 10-30% of the labeling cost.",
      "Gold seeds 5-10% of queue; 85% floor; 3x overlap for live kappa.",
      "Pay quality-weighted; audit every batch weekly; adjudicate disagreement.",
      "Edit/rewrite signals > thumbs; reviewer gates feedback into training.",
      "DPO from reviewed pairs against SFT baseline; measure in A/B.",
    ],
    recap: `Labels are authored infrastructure: sharp guidelines with worked edge cases, agreement measured chance-corrected per class, active learning to spend budget where ignorance lives, gold-seeded QC catching drift in the act, and a reviewed feedback loop turning real usage into correction pairs — the models downstream are only as trustworthy as the humans who wrote their reality.`,
    code: {
      title: "Simple uncertainty sampler",
      language: "python",
      code: `order = logits.softmax(-1).sort(-1, descending=True).values\nscore = order[:, 0] - order[:, 1]\ncandidates = score.argsort()[:k]`,
      explanation:
        "Smallest top-2 margin = most uncertain — the highest-information items for the annotator; batch-mode with diversity filters for production.",
    },
    diagram: {
      title: "Feedback loop",
      caption: "User signal to curated pair to trained model.",
      mermaid: `flowchart LR\n F[User feedback] --> R[Reviewer curation]\n R --> T[Training pairs]\n T --> M[Model update]`,
    },
  },
  "ai-ml-data-engineering-essentials-data-lakes-warehouses-and-lakehouses": {
    intro: `Data lakes, warehouses, and lakehouses are the three architectures storing organizational data — and choosing wrong costs millions or leaks years. The subject is the honest comparison: schema-on-read lakes vs schema-on-write warehouses vs table-format lakehouses (Delta/Iceberg) delivering ACID on files, partitioning and catalogs, and the decision framework for your workload's shape. storage architecture is destiny — every query, model, and compliance request walks through it.`,
    foundations: `Data lake: object storage (S3/ADLS) + open formats (Parquet) + schema-on-read; cheap, flexible, governance is your problem; warehouse (Snowflake/BigQuery/Redshift): managed MPP, schema-on-write, SQL-first, superb BI, expensive at scale, proprietary; lakehouse: Delta Lake / Apache Iceberg / Hudi — table formats with transactions, time travel, schema evolution, on top of lake storage + engines (Spark, Trino, DuckDB); catalog: Glue/Unity/Nessie/Polaris — metadata layer, table discovery, ACLs; partitioning: hive-style ds/hr=... + z-ordering/liquid clustering.`,
    concepts: [
      {
        title: "Warehouse, lake, lakehouse: pick by workload.",
        body: `Warehouse when: BI/reporting core, regulated schemas, serverless SQL, team small enough that ops burden matters — Snowflake/BigQuery are boring and correct for analytics-first orgs. Lake when: ML-first company with raw blobs everywhere, schema flux monthly, cost ceiling hard — but then you sign up for building data quality + catalog discipline yourself. Lakehouse when: you need both — BI joins and ML training on the same tables, ACID for streaming upserts (CDC), time travel for reproducible training sets — the open-format bet on avoiding a proprietary silo. Most new builds converge to lakehouse; most legacy reality is hybrid — warehouse for BI, lake for ML sharing via tables.`,
      },
      {
        title: "Table formats: Delta, Iceberg, Hudi compared.",
        body: `Delta Lake: Databricks-native, best Spark integration, ACID via transaction log, OPTIMIZE/z-order compaction, mature streaming/upserts (MERGE). Apache Iceberg: open spec, engine-agnostic (Spark/Trino/Flink/DuckDB/Snowflake now reads), hidden partitioning (no partition columns in queries — huge correctness win), metadata-driven planning, REST catalogs; Hudi: CDC-upsert-centric, incremental pulls, strong for near-real-time sync. Choose Iceberg for openness and multi-engine futures, Delta for Spark-everything stacks; both solve small-files and ACID on object storage; the choice is ecosystem politics — standardize early.`,
      },
      {
        title: "Partitioning, compaction, and file layout.",
        body: `Partition coarse (date ds=YYYY-MM-DD typically) — over-partitioning explodes small files (tragedy of the commons); target file sizes 128-512 MB; compaction jobs (OPTIMIZE / rewrite_data_files) merge small files; z-order or liquid clustering by high-cardinality filter columns (user_id, ds) co-locates data for skipping; sorted tables read 10-100x faster for point/range filters; avoid partitions on high cardinality (never user_id alone); Iceberg hidden partitioning decouples layout from query — users filter normally, planner does the mapping; measure scan bytes before/after; layout is a first-class design decision, not a default.`,
      },
      {
        title: "Catalogs and governance: the missing layer.",
        body: `A catalog is the metadata source of truth: table names → schema, location, owner, freshness, lineage, ACLs; without one, teams copy data into silos and lose meaning; Unity/Glue/Nessie/Polaris implement it; enforce: table naming standards (db.table_suffix), column contracts, PII tags for policy (row/column masking), lineage capture (query logs or OpenLineage) for GDPR erasure flows; root user count zero; service principals only; column-level security for analyst access tiers; the catalog is what makes "find the table" and "who reads PII" answerable in minutes instead of a week.`,
      },
      {
        title: "Access patterns and cost discipline.",
        body: `Optimize for the queries you actually run: BI dashboards (aggregations by day/segment — warehouse materialized results), ML features (full scans over years — lake columnar), exploratory ad-hoc (Trino with table formats); cache hot paths; incremental materialization over recompute; cost guards: scan limits, per-query budgets, warehouse auto-suspend, query tagging by team for chargebacks; storage tiering (hot/infrequent/archive by access age — 70% of lake data is cold rarely touched); deletion: lifecycle policies for GDPR-erasure windows; storage is cheap, compute and trust are not — architect to spend both well.`,
      },
    ],
    worked: [
      {
        title: "Migrate a 40 TB warehouse to a lakehouse.",
        body: `Strategy: shadow tables — new pipelines write Iceberg format partitions alongside legacy warehouse load; dual-read verification in BI for 6 weeks (query diff on golden dashboards < 0.1% variance); cutover Tableau/Looker to Trino on Iceberg; warehouse frozen to archive; storage cost −55%, query perf +40% for full-scan ML jobs, time travel enabled snapshot training runs (reproducible datasets by table version — auditors loved it); risks rehearsed: small-file storms (compaction tuned), schema drift (contract tests upstream); total timeline: two quarters, zero downtime, politics managed via the dual-read proof period.`,
      },
      {
        title: "Unpartitioned table → 30x faster with z-order.",
        body: `Query profile showed 4-minute scans on events for user-level filters — full table reads. Fix: hive partition by ds (prunes 98% of data for date-bounded queries) + ZORDER BY user_id (co-locates user data within files) on hot columns; compaction weekly; scan bytes per query 40 GB → 1.2 GB; SLA dashboards refresh in 20 s; the index-free answer to "why is this table slow" that changes everything at lake scale; lesson: layout decisions are cheap, retroactive ones cost quarters.`,
      },
      {
        title: "GDPR erasure across lake and warehouse.",
        body: `Erasure request for 12 users: catalog PII tags located 240 tables/files; lake: rewrite partitions excluding those ids (hidden partitioning made finding rows easy; 30 min job); warehouse: DELETE + VACUUM with snapshot inaccessible; derived aggregates audited — recomputed, no PII; lineage report attached to the ticket; 30-day window met with 28 to spare; the catalog turned compliance from excavation into procedure.`,
      },
    ],
    exam: [
      {
        question:
          "Why do lakehouses add table formats on object storage instead of plain parquet?",
        answer:
          "Object stores are not transactional — concurrent writers can corrupt files; table formats (Delta/Iceberg) add an atomic commit log, giving ACID, schema evolution, time travel, and compaction — turning file dumps into trustworthy tables shared by BI and ML engines alike.",
      },
      {
        question:
          "What does Iceberg's hidden partitioning eliminate as a bug class?",
        answer:
          "User error in remembering partition columns in every WHERE — the table advertises ds partitioning internally but queries write ts filters freely; the planner rewrites predicates against hidden partition transforms, giving pruning without discipline tax or silent full scans from forgotten predicates.",
      },
      {
        question: "When is a warehouse still the right primary choice?",
        answer:
          "When analytics/BI dominates AI/ML in the workload mix, small teams need zero-ops, regulated schemas are fixed, and per-seat cost at moderate scale beats lake complexity; the moment ML training needs raw semi-structured data at scale and open formats, the calculus shifts lakeward.",
      },
      {
        question: "Why is over-partitioning the lake's silent killer?",
        answer:
          "Fine partitions (hour, user_id) explode small files — metadata overhead dominates, thousands of objects per query, listing latency strangles planning, compaction never catches up; partition only high-value coarse keys (date), target 128-512 MB files, and let z-order/clustering handle the fine-grained skipping.",
      },
    ],
    cheat: [
      "Warehouse: BI-first zero-ops boring correctness; lake: ML raw flexibility; lakehouse: both.",
      "Formats: Iceberg open/multi-engine; Delta Spark-leaning; both fix ACID.",
      "Partition coarse (date); files 128-512 MB; z-order/liquid cluster hot filters.",
      "Catalog or chaos: Unity/Glue/Nessie; PII tags; lineage for GDPR.",
      "Time travel pins training data exactly — reproducibility by table version.",
      "Scan bytes measured; lifecycle tiering for cold 70%.",
      "Compaction weekly; over-partitioning is the small-file death.",
    ],
    recap: `Storage architecture is strategy with a bill: warehouses for SQL/BI discipline, lakes for raw ML flexibility, lakehouses (Iceberg/Delta) for both with ACID on files; partitioning and layout are explicit design work, catalogs are what make data findable and erasure possible, and time travel turns "which data trained v7?" into a table version — pick per workload, avoid format silos early, and spend the savings on the catalog you always needed.`,
    code: {
      title: "Time travel by version",
      language: "sql",
      code: `SELECT * FROM events VERSION AS OF 4821 LIMIT 100;`,
      explanation:
        "Iceberg/Delta snapshot reference — audit exact training input, diff versions, restore accidental deletes; time travel is the audit trail money cannot buy elsewhere.",
    },
    diagram: {
      title: "Lakehouse anatomy",
      caption: "Object store + table format + catalog + engines.",
      mermaid: `flowchart TD\n S[Object storage] --> T[Table format Delta or Iceberg]\n T --> C[Catalog]\n C --> E[Engines: Spark Trino DuckDB]`,
    },
  },
};

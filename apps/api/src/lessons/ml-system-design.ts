import type { TopicLesson } from "../topicLessons.js"; /** * ML System Design — 6 authored topic lessons. * * Standalone chapters per topic. Subject-first prose, foundations, core * concepts, worked examples, exam practice, cheat sheet, recap. No shared * templates, no runtime composition. */
export const mlSystemDesign: Record<string, TopicLesson> = {
  "ai-ml-ml-system-design-designing-ml-systems": {
    intro: `Designing ML systems is the discipline of turning business objectives into reliable prediction pipelines — the right problem, the right data, the right model, served fast enough to matter. The subject is the full architecture: problem framing, feasibility, data flywheels, model-store checks, and the systems thinking that makes ML ship instead of stall. an ML system is a software system whose heart beats probabilities — and everything else in engineering still applies.`,
    foundations: `Framework (Sculley/Guru): (1) frame as ML problem — predict what? input/output/latency; (2) feasibility — is data there? is signal above noise? baseline first (heuristic rules win surprisingly often); (3) design — data model, feature store, training pipeline, serving topology (real-time vs batch), feedback loop; (4) metrics — offline (AUC, NDCG) + online (A/B lift) + business ($, churn Δ); (5) iteration cadence — data drift → retrain schedule; every step de-risks before the next; skip framing → build the wrong thing perfectly.`,
    concepts: [
      {
        title: "Framing: the question that decides everything.",
        body: `"Reduce churn" → from what data, predicted when, by whom, with what action afterward? Map to: labels (90d no order), features (sessions/week, last support ticket sentiment, discount dependency), latency (batch nightly, CSV to CRM), eval split by cohort; sanity: do we have >50k labeled rows? is the signal real (correlation ≥ some bar) or noise? baseline: "accounts with 50%+ usage drop in 30d churn at 18% vs 6% base" — ML must beat THAT; if the baseline is unbeatable or the data is garbage, say so — the first deliverable is often "don\'t build this." Interviewees and PMs both fail here: they reach for transformers before asking if a SQL filter would do.`,
      },
      {
        title: "Data flywheel and feedback loops by design.",
        body: `Every prediction the system makes is a labeling opportunity: clicked/ignored recommendations, accepted/rejected loans, resolved/escalated tickets — log everything with model version + features + outcome; weekly joiner builds training sets from production; online eval: A/B or interleaved testing for ranking; cohort splitting prevents memorization leakage; feedback loop closes: model v1 → collect → retrain v2 → measure → repeat; flywheel is the compound interest of ML systems — the 2% per month that beats any one-time accuracy jump; architecture must make logging free (feature → prediction → action → outcome chain) or the loop never closes.`,
      },
      {
        title: "Serving topology: batch vs streaming vs real-time.",
        body: `Batch (nightly scoring → table → lookup at serve time): cheapest, best for churn/recommendations where features are stable; streaming (feature compute on the fly from event stream): medium cost, fresh signals (last-click intent); real-time (model on request path, GPU/CPU inference): expensive, reserved for latency-justified (fraud, search, moderation); the 70% of systems that pretend to need real-time actually need better batch; decision matrix: latency target vs feature freshness vs cost; batch + cache = 90% of legit "real-time" cases with 5% of the complexity.`,
      },
      {
        title: "Model complexity vs maintenance burden curve.",
        body: `Logistic regression < GBM < small NN < fine-tuned transformer — each step: +features/pipeline cost, +debuggability loss, +incident response difficulty, +$; wins: 1%/5%/15% offline lift in typical cases; the maintenance tax is monthly retraining + drift monitoring + on-call pages at 3 AM; default: the simplest model beating the baseline wins; complexity admitted only with production A/B proof; the postmortem genre "transformer saved us 0.4%" always omits the six months of pager duty — total cost of ownership is the only honest metric for model selection.`,
      },
      {
        title: "Org and process: ML needs a different SDLC.",
        body: `Data scientists prototype in notebooks, production is locked down by platform; contract between them: feature store interface, model registry with promotion gates, CI on data validation; roles: ML engineer (pipelines), DS (experiments), platform (infra), PM (metrics owner); sprint rhythm: experiments → reviewed RFCs → shadow deployment → canary → full; cross-functional sign-off: privacy (data usage), SRE (serving risk), legal (decision impact); the org that tries to run ML through standard web SDLC ships nothing - or ships a model that fails silently in production for a quarter.`,
      },
    ],
    worked: [
      {
        title: 'Reframe "predict inventory stockouts" before any code.',
        body: `Stakeholder ask: "AI flagging stockouts." Framed session: unit of prediction = SKU-week; label = stockout in next 14 days; features = trailing sales velocity, supplier lead time, promo flags, local holidays; horizon = 14 days; serving = weekly batch into buyers\' inbox + SAP writeback; baseline: naive last-4-week demand mean — 72% precision; the simple rule won; project descoped to improving the rule with 3 features (79%); saved the company $900k of GPU spend and one quarter; the PM was promoted for killing the project politely.`,
      },
      {
        title: 'Launch with GBM knowing transformer "should" be better.',
        body: `Ticket-classification agent; BERT-lite promised +2%; GBM on TF-IDF + flimsy 80-feature text stats shipped in 3 weeks; shadow accuracy 86.4% vs transformer\'s 87.1% on paper; GBM in prod; six months later BERT re-ran post-corpus-doubling: 89.3% and SWEEP admitted; the migration took one sprint; the lesson archived: ship the 90% solution with clean interfaces and swap the engine underneath when the data justifies it — never block value on optimal modeling.`,
      },
      {
        title: "A/B reveals offline metrics lied by 6 points.",
        body: `Recommendation CTR model: offline AUC +3.2%; canary 5% traffic: conversion −0.4% (no significant lift, slight negative trend); analysis: AUC rewarded predicting obvious repeats; fix: label smoothing on head items + exploration term ε=0.05; re-A/B: +1.1% conversion; the offline metric had been rewarding memorization, not discovery; the org stopped shipping on offline wins alone; the budget now requires canary evidence for every model promotion in ranking surfaces.`,
      },
    ],
    exam: [
      {
        question:
          'Why does the first deliverable of an ML feasibility study sometimes need to be "no"?',
        answer:
          "Because building on weak signal costs months of engineering while presenting failure as success — proving absence of signal cheaply (baseline tests, label audits, correlation floors) before commitment is the cheapest risk reduction available; the best ML engineers are often the ones who say don't build it.",
      },
      {
        question:
          "What distinguishes batch from streaming features, and which does 80% of applied ML use?",
        answer:
          "Batch features are stable aggregates computed offline (nightly, hourly) — cheap, correct for most predictions; streaming features reflect the freshest events — costly, justified only when minutes matter (fraud bursts) — 80% of systems serve great value from batch + cache with zero streaming infrastructure.",
      },
      {
        question:
          "Why must offline metrics be treated as proxies, never as ground truth?",
        answer:
          "They reward correlation the model memorizes, not the causal levers the business pulls — only live traffic interrogates that gap; every offline win must survive canary A/B before promotion; the industry graveyard is full of +4% AUC models that subtracted from revenue.",
      },
      {
        question: "What is the flywheel and why is it the moat?",
        answer:
          "Every production prediction is implicit labeling; curves improve monotonically with usage; competitors with identical models but no deployed traffic can never catch up — data network effects compound; architecture decisions must keep the loop closed or the moat never forms.",
      },
    ],
    cheat: [
      "Frame: unit, horizon, action-after, baseline to beat - before any modeling.",
      "Data audit → baseline → ML only if it beats the rule.",
      "Batch + cache first; streaming when minutes matter; real-time last.",
      "Offline metrics nominate; A/B decides; business metric is the tie-breaker.",
      "Simplest winning model wins; complexity admitted only by canary evidence.",
      "Close the feedback loop: log everything, retrain on production outcomes.",
    ],
    recap: `Designing ML systems is product engineering with mathematical cores: ruthless framing, baseline-first humility, batch-cheap serving until minutes matter, feedback loops as moats, canary evidence over offline dreams — because the systems that ship are the ones designed by people who know when not to add gravity.`,
    code: {
      title: "Feasibility gate script",
      language: "python",
      code: `if baseline_auc >= 0.78 and lift_threshold < 0.05: print('Do not ship ML; improve the rule')`,
      explanation:
        "The three-line gate that saves quarters — refusal is the first machine-learning feature worth coding.",
    },
    diagram: {
      title: "ML system lifecycle",
      caption: "Frame, data, model, serve, learn.",
      mermaid: `flowchart LR\n F[Frame] --> D[Data]\n D --> M[Model]\n M --> S[Serve]\n S --> L[Log and retrain]\n L --> D`,
    },
  },
  "ai-ml-ml-system-design-training-pipelines-at-scale": {
    intro: `Training pipelines at scale are the compute factories of ML — orchestrated DAGs turning raw data into reproducible model artifacts across hundreds of GPU-hours. The subject is engineering for volume: distributed data loading, checkpointing, spot preemption handling, hyperparameter search, resource scheduling, and the cost discipline that keeps training from consuming the roadmap. data in, models out — at scale, the pipeline is the product.`,
    foundations: `Stack: orchestration (Kubeflow/Airflow/Argo/Metaflow), data versioning (DVC/LakeFS), distributed training (DDP, FSDP, DeepSpeed), hyperparameter search (Optuna, W&B Sweeps, Ray Tune), storage (object stores with checkpointing), spot instances (70-90% cheaper, interruptible with checkpoint-restore). Pipeline stages: ingest → validate → preprocess → train → evaluate → register → deploy; each stage idempotent, cacheable, observable (metrics, logs, artifacts). Reproducibility: seeded runs, config-captured, code-hashed. Lineage: dataset → run → model → promotion.`,
    concepts: [
      {
        title: "Data loading: the bottleneck everyone ignores.",
        body: `GPU waits on dataloader → utilization 40%; fixes: prefetch workers, pinned memory, sharded WebDataset/Parquet for streaming-from-storage without full download, num_workers tuning, persistent_workers; measure: disk → CPU → GPU throughput chain; a single slow CPU transform throttles 8 H100s - profiling is where scale dies; mmap'd arrays for CMU-Bench sizes; caching decoded tensors to local NVMe; the training cluster is a logistics operation - if the kitchen is slow, the ovens are decoration.`,
      },
      {
        title: "Distributed training strategies and when each wins.",
        body: `Data parallelism (DDP): each GPU full model, shard batch - default for models that fit; FSDP: shard params+optimizer state across GPUs - models that don\'t fit (13B+); pipeline parallelism: layers across GPUs - huge models with inter-node links (rarely needed below 70B); tensor parallelism: within-layer cuts - inference territory; ZeRO stages 1-3: optimizer → gradients → params sharding - memory math drives choice; gradient accumulation for effective batch without memory blow-up; mixed precision bf16 everywhere; the trap: distributed before profiling - 80% of "we need FSDP" problems were dataloader and batch-size problems wearing distributed costumes.`,
      },
      {
        title: "Checkpointing and preemption-proof training.",
        body: `Spot instances ~70% cheaper; interruptions are a certainty at scale; checkpoint protocol: every N steps or T seconds, save model+optimizer+scheduler+RNG+dataloader state to object storage atomically; resume skips completed steps exactly; verification: test resume in CI weekly; async checkpointing (overlap save with compute on CPU thread) removes the 40s stall per save; cost delta 70% vs reliability delta near-zero; decisions teams regret: no checkpointing for runs > 6 hours on spot - one preempt and a week of budget evaporates; checkpointing is the cheapest insurance in ML infrastructure, and everyone discovers this the first time they lose an 8-hour run.`,
      },
      {
        title: "Hyperparameter search strategy and budget reality.",
        body: `Grid search dead past 3 dims; random search surprisingly strong default; Bayesian (Optuna/TPE) for expensive evals; ASHA/Hyperband early-stops losers fast - the single biggest money saver; search budget = 20-50% of total training compute; parallelism: 8-16 workers sweeping independently beats sequential cleverness; warm-starting from prior runs (transfer hyperparams from related tasks); learning-rate range test first always; record every trial - failed trials are data, not waste - "LR 3e-4 diverges always" is institutional knowledge hidden in sweep logs; the discipline: budget the search like a feature, not like an afterthought.`,
      },
      {
        title: "Cost discipline and GPU real estate.",
        body: `H100s draw ~$2k/month on reserved pricing - a 64-GPU cluster costs more than most engineering salaries; rules: right-size (does this need 8×A100 or 4? - profile), spot for everything interruptible, shared queues with fair scheduling, idle detection with auto-release (kill forgotten 8-GPU runs stuck at 0% util), per-team budgets with alerts, cost-per-accuracy dashboards; the discipline: every training job carries a business tag - "experiment: churn-v3" - finance asks questions, and the answers better exist; the org that doesn\'t track GPU $/model trains 3x more and ships 3x less.`,
      },
    ],
    worked: [
      {
        title: "Pipeline halves training wall-clock via data-loader fix.",
        body: `70B LoRA fine-tune on 8×A100s; step time 1.9s, GPU 45% util; profile: CPU decode of 4MP JPEGs in the main process; fix: WebDataset streaming + 8 workers + pin_memory + decode on GPU (DALI); step time 0.9s, util 91%; wall-clock 72h→36h; cost $18k→$9k; the change touched zero model code; the team\'s dashboard now shows dataloader-vs-GPU wait per job; the fix was 40 lines of config and a new on-call metric.`,
      },
      {
        title: "Spot preemption saves $400k of annual training spend.",
        body: `Vision team ran 3-week sweeps at 60-70% GPU idle-equivalent losses from early experiments on-demand; migrated to spot with 10-min checkpointing + auto-resume; interruption rate 1 per 40 GPU-hours absorbed transparently; annual savings $410k; the resume drill in CI caught two state-restore bugs pre-production; the finance VP called the migration "the ML project with the best ROI this year" — it was purely infrastructure; the on-call rotation relaxed accordingly.`,
      },
      {
        title: "ASHA kills 60% of hopeless trials by hour 2.",
        body: `Hyperparameter sweep budget 200 GPU-hours; random search baseline; switch to Optuna+ASHA (rungs at 10%, 30%, 60% of max steps, aggressive pruning); 124 trials pruned early, best model found in 70 hours with 18 finals; quality equal to exhaustive grid; savings $3400 and 6 weeks of wall-clock; the sweep report showed the pruning distribution curve — the artifact that convinced skeptics to adopt ASHA everywhere.`,
      },
    ],
    exam: [
      {
        question:
          "Why is the dataloader almost always the first suspect when GPU utilization sags?",
        answer:
          'GPUs process batches in microseconds-to-milliseconds; host CPUs decoding images/CSV/JSON at single-digit MB/s are orders slower; even one blocking call in the hot loop starves the accelerator; measure tokens/images per second end-to-end, never trust "the GPU is busy" from nvidia-smi snapshots alone.',
      },
      {
        question: "Why does checkpointing unlock spot instances for training?",
        answer:
          "Spot preemption is certain at scale; without full state (model+optimizer+scheduler+RNG+loader position), resumed runs diverge or restart from zero — losing days; atomic checkpoint-restore converts 70-90% savings into pure upside with near-zero reliability cost.",
      },
      {
        question: "Why does random search outperform grid in high dimensions?",
        answer:
          "Most hyperparameters matter little; grid wastes budget on equal-spacing irrelevant dims while random samples the important directions densely by chance; with pruning (ASHA), random+early-stop explores orders of magnitude more of the volume per dollar; Bayesian layers on top for smooth objectives.",
      },
      {
        question: "What belongs in a lineage record for every promoted model?",
        answer:
          "Dataset version/hash, code commit, full config, random seeds, parent checkpoints, evaluation metrics with split identity, timestamp, approver — anything short of that makes audits unreproducible and postmortems metaphysical; lineage is the difference between science and folklore.",
      },
    ],
    cheat: [
      "Pipeline stages: ingest → validate → preprocess → train → eval → register.",
      "dataloader/GPU wait metric first — it explains half of all slowdowns.",
      "DDP fits-model, FSDP doesn't; zero-redundancy stages per memory math.",
      "Checkpoint model+optim+sched+RNG+loader to object storage; test resume weekly.",
      "Spot with checkpoints; ASHA pruning slashes sweep waste 60%+.",
      "GPU $/model tracked; idle auto-release; team budgets with alerts.",
    ],
    recap: `Scaled training pipelines are industrial logistics with GPUs inside: stage-wise DAGs, dataloader-first profiling, distributed strategies chosen by memory math, checkpoint-restore for preemption-proofing, aggressive hyperparameter pruning under budget — because at scale the difference between science and incinerated budgets is whether the pipeline is engineered or merely executed.`,
    code: {
      title: "Checkpoint-save sketch",
      language: "python",
      code: `torch.save({'model': m.state_dict(), 'opt': opt.state_dict(), 'sched': sched.state_dict(), 'rng': torch.get_rng_state()}, path)`,
      explanation:
        "The dict that makes preemption boring — skip any key and resume becomes archaeology.",
    },
    diagram: {
      title: "Scaled training DAG",
      caption: "Data through GPUs to registry.",
      mermaid: `flowchart LR\n I[Ingest] --> V[Validate]\n V --> P[Preprocess]\n P --> T[Train]\n T --> E[Evaluate]\n E --> R[Register]`,
    },
  },
  "ai-ml-ml-system-design-candidate-generation-and-ranking": {
    intro: `Candidate generation and ranking are the two-stage architecture powering every modern recommendation and search system — retrieval of plausible items then ordering by predicted value. The subject is the full cascade: two-tower retrieval models, approximate nearest neighbors, feature crosses, learning-to-rank (pointwise, pairwise, listwise), and the feedback engineering that keeps the funnel honest at scale. nobody ranks a million items - you retrieve hundreds then rank them like you mean it.`,
    foundations: `Stage 1 - candidate generation: two-tower (user tower + item tower, dot-product match) or collaborative filtering (ALS, matrix factorization) or content-based (TF-IDF → neural); retrieval via ANN (FAISS, ScaNN, HNSW) over millions of items in milliseconds; output: ~100-1000 candidates. Stage 2 - ranking: richer features (user × item crosses, context), model: GBDT (LightGBM) for tabular signals or lightweight neural/cross-encoder for deep matching; trained on implicit feedback (clicks) with pairwise/listwise loss; evaluation: NDCG@K, Recall@K, MAP, A/B lift on conversion.`,
    concepts: [
      {
        title: "Two-tower retrieval: why the split works.",
        body: `Separate encoders for user context and item content; item tower computed offline → precomputed embeddings for the whole catalog (100M items = 100M vectors = FAISS index); user tower computed per request (or user-session-cached); dot product ranking = ANN search in milliseconds; training signal: (user, clicked item) positive pairs + sampled negatives (in-batch negatives, hard negatives from prior model); loss: InfoNCE/contrastive; the architecture decouples catalog scale from serving latency — the only viable pattern at web scale; if you see full-catalog scoring per request, the system is a toy.`,
      },
      {
        title: "Negative sampling: the silent quality lever.",
        body: `Positive pairs alone learn "everything is good"; negatives teach discrimination; uniform random negatives: mostly easy (popular model ignores them); in-batch negatives: free, effective, watch batch size; hard negatives: items shown but not clicked — gold; mixing: 90% in-batch + 10% hard; false negative problem: popular unclicked items might be unseen, not disliked — position bias correction (IPS weighting, position-aware losses); training-serving skew: same features at inference — never compute retrieval features differently than you trained; the single most common retrieval failure: negatives from the wrong pipeline.`,
      },
      {
        title: "Ranking model architecture: GBDTs and neural tradeoffs.",
        body: `LightGBM/XGBoost on feature crosses: user age-band × item popularity-bin, price-sensitivity × discount-depth, session-depth × category-recency — GBDTs exploit crosses natively, train in minutes, beat deep nets on tabular; cross-encoders (BERT-pair) score (query, item) jointly — best accuracy, 100x cost — reserve for top-10 final re-ranking or high-value surfaces (ads, search); wide & deep / DCN for feature interactions at scale; serving budget: ranking 1000 items × 0.5ms = 500ms — too slow; distill or prescore + cache; the architecture that ships: retrieval → GBDT rank top-200 → cross-encoder top-20 (only on surfaces with budget).`,
      },
      {
        title: "Learning-to-rank losses: pointwise, pairwise, listwise.",
        body: `Pointwise: predict click probability per item independently — simple, misses relative ordering; pairwise (RankNet, LambdaRank): model pairs — preferred A over B — aligns with ranking objective, robust to click noise; listwise (softmax over list, LambdaLoss): optimizes NDCG directly — best for head positions, noisier gradients; practical: LambdaRank default, listwise when ranking metric dominates offline eval; label engineering: clicks with position bias, long-dwell = positive, quick-bounce = negative, purchase >> click >> impression; multi-task: click + dwell + convert heads share trunk — transfers better than single-objective.`,
      },
      {
        title: "Cold start and the new-item problem.",
        body: `Two-tower handles cold users (context features) better than CF; cold items: content embeddings (title/image via pretrained CLIP/BERT) seed the item tower before any interaction data exists; exploration: ε-greedy injection, Thompson sampling, UCB bonus on under-exposed items (otherwise the tower only recommends what it already knows — a self-fulfilling feedback loop); diversity re-ranking (MMR) as post-filter; guaranteed exposure slots for strategic items with shadow-eval measuring actual lift; new-item evaluator: force-rank experiment with holdout weeks to measure discoverability — the platform metric most teams forget until the catalog stagnates.`,
      },
    ],
    worked: [
      {
        title: "Discovery rebuild: candidate recall 22%→58%.",
        body: `E-commerce homepage; legacy CF produced 22% Recall@100 on held-out sessions; two-tower with CLIP image+text towers + content tower blend; ANN via FAISS IVF-PQ; retrieval recall 58%; ranker: LambdaMART on 140 crosses; NDCG@10 +12%; revenue-per-session +3.4% A/B verified; cold-start (new SKUs) click-through jumped 3x; the rebuild took one quarter with a 3-person team because the two-stage split localized failures; the postmortem framed candidate recall as the KPI everyone forgot.`,
      },
      {
        title: "Hard-negative mining doubles conversion in ads.",
        body: `Ad retrieval model with in-batch negatives only; CTR plateaued; mined hard negatives from top-200 shown-but-ignored impressions of the previous week; retrained; CTR +18% relative; the negative miner ran nightly; lesson permanently encoded: the quality ceiling of your retrieval is the quality of your negatives, not your positive volume.`,
      },
      {
        title: "LightGBM ranker beats neural by shipping in 2 weeks.",
        body: `Ranking candidate items for content feed; deep DCN v2 promised +1.5% NDCG offline; GBDT baseline built in 3 days; week 2 saw GBDT live at +1.1%; neural ran 6 weeks later at +1.8% — incremental, not transformative; the gap paid for the infrastructure of the next project; the org stopped running "deep before deployed" races; shipping cadence became the actual architecture decision framework.`,
      },
    ],
    exam: [
      {
        question:
          "Why can't two-tower compute item embeddings per request in production?",
        answer:
          "The item tower touches every catalog item per user per second - CPU/GPU melting; precompute catalog embeddings offline, store in ANN-friendly index, query user vector only online; the entire two-stage split exists to make the impossible subtraction; violate it and physics wins.",
      },
      {
        question: "Why are in-batch negatives necessary but not sufficient?",
        answer:
          "They supply scale (thousands of free negatives per batch) but almost all are too easy; hard negatives — items plausibly relevant but ignored — teach the boundary that actually matters; without them, models over-rank popular items and choke on the long tail.",
      },
      {
        question:
          "Why do GBDTs often beat neural rankers on crosses of tabular features?",
        answer:
          "Trees partition on raw thresholds — no need to learn feature scaling, interactions via split sequences, fast training, strong with small data; neural rankers win when dense content signals (text/image pairs) matter more than crosses; measure on your data — tabular wins are the rule, not the exception.",
      },
      {
        question:
          "Why must position bias be modeled in implicit-feedback ranking?",
        answer:
          "Users click top results regardless of relevance — the click is confounded by exposure; uncorrected models learn position→click, resurfacing themselves in a self-licking ice-cream cone; position-as-feature, IPS reweighting, or randomized buckets break the loop.",
      },
    ],
    cheat: [
      "Retrieval: two-tower + ANN over catalog offline-embeddings.",
      "Negatives: in-batch 90% + hard 10%; correct for position bias.",
      "Ranking: LambdaMART default; cross-encoder only with budget.",
      "Multi-task heads: click + dwell + convert on shared trunk.",
      "Cold items: content embeddings + exploration slot + MMR diversity.",
      "Measure candidate recall first — ranking can't fix what retrieval misses.",
    ],
    recap: `Candidate generation and ranking split the search problem into conquerable halves: contrastive two-tower retrieval with ANN serving hundreds from millions, feedback-labeled ranking with cross features and listwise objectives, cold-start content bridging, exploration guards — because no ranking model can rank items it never saw, and no retrieval system can rank items it never learned.`,
    code: {
      title: "ANN lookup sketch",
      language: "python",
      code: `D, I = index.search(user_vec.reshape(1, -1), k=200)`,
      explanation:
        "One line of FAISS — the millisecond that retrieves the universe before ranking it.",
    },
    diagram: {
      title: "Two-stage funnel",
      caption: "Retrieve, then rank.",
      mermaid: `flowchart LR\n C[Candidates 1M] --> R[Retrieval ANN]\n R --> K[1000 items]\n K --> RK[Ranker]\n RK --> OUT[Top 20]`,
    },
  },
  "ai-ml-ml-system-design-common-ml-system-design-cases": {
    intro: `Common ML system design cases are the interview crucible and the daily reality — recommendation, search, fraud, moderation, pricing, and churn, framed end to end. The subject is how to attack each canonical problem: data signals, model shapes, serving topology, evaluation, and the tradeoffs interviewers probe. every ML system design question is a negotiation between what\'s possible with data and what\'s needed by the business.`,
    foundations: `Framework recap: (1) clarify the objective — engagement/revenue/safety; (2) constraints — latency, budget, privacy; (3) data audit — labels, bias, coverage; (4) baseline; (5) architecture sketch — ingest → features → model → serve → monitor; (6) metrics — offline + online + guardrails; every case applies the same skeleton with domain twists. The twists are the content: what labels exist for fraud (chargebacks weeks later), for moderation (policy versioned by humans), for pricing (elasticity at the edge of demand).`,
    concepts: [
      {
        title: "Case: recommendation feed ranking.",
        body: `Signals: clicks, dwell, shares, follows, hides; candidate gen via two-tower over content embeddings; ranker LambdaMART on user×item crosses + freshness/recency + session context; fairness: author-dedup, exploration epsilon; metrics: CTR, dwell-time, negative-feedback rate, A/B on daily-actives; pitfalls: position bias, feedback loops (only recommend what\'s already clicked), clickbait amplification (penalize high-CTR-low-satisfaction items — use long-dwell reward); serving: nightly batch candidate scoring + realtime re-rank on session features.`,
      },
      {
        title: "Case: fraud detection at payment scale.",
        body: `Signals: device fingerprint, velocity (txn/hour), merchant history, geo, graph links; labels: chargebacks (delayed, weeks) — train with delayed-label-aware validation (time-split!), class imbalance 1000:1 — PR-AUC over ROC-AUC, cost-weighted loss; model: GBDT on crosses + graph embedding features for ring detection; serving: <50ms on request path, rules pre-filter, model async scoring with hold-and-review queue for marginal band; online learning for drift — fraudsters adapt weekly; guardrails: false-positive rate SLO per cohort (never decline an entire country).`,
      },
      {
        title: "Case: search ranking for marketplace.",
        body: `Signals: query text (BM25 + dense dual encoder), item text/title/brand embeddings, popularity, price-competitiveness, seller quality, freshness; two-tower retrieval → LambdaMART rank with business boosts (strategic brands policy-flagged); fairness: demote counterfeits, inject sponsored slots transparently; metrics: NDCG@10, purchase conversion, null-result rate (zero-hit queries — the biggest leak), reformulation rate; iteration: query understanding (intent classification → category routing), spelling correction, synonyms; cache head queries; the long tail kills naive caches.`,
      },
      {
        title: "Case: content moderation at scale.",
        body: `Multimodal: text (LLM classifiers), image (ViT classifiers), video (frame sampling + aggregation), audio (ASR + text path); policy-versioned — decision must cite policy section, not just "bad"; serving: fast path pre-screen → borderline to human review with model-prioritized queue (p50 review < 2min); active learning: humans label borderline → retrain weekly; metrics: precision ≥ 99% on auto-action class, recall on queue, reviewer agreement, appeal-overturn rate; the hard part is not the model, it is the policy governance and the human-in-loop ops.`,
      },
      {
        title: "Case: dynamic pricing and demand modeling.",
        body: `Objective: maximize revenue subject to acceptance-rate floor; signals: historical price elasticity per segment, inventory, competitor prices, seasonality, weather; models: gradient-boosted elasticity per SKU×region, or hierarchical Bayesian for sparse SKUs; serving: recompute prices nightly + intraday adjustment on demand shocks; guardrails: price floor/ceiling per segment, fairness (no personalized pricing beyond legal bounds), audit log; evaluation: backtest with synthetic counterfactuals (inverse propensity weighting), then careful partial-traffic A/B because pricing experiments move real revenue — never 100% flips.`,
      },
    ],
    worked: [
      {
        title: "Fraud ring takedown via graph embeddings.",
        body: `Payment processor; fraud losses rising despite tabular GBDT; built entity graph (device↔card↔merchant), node2vec embeddings, fed as 32 features + GBDT; ring detection precision +24%; $11M recovered in quarter; the graph layer was two weeks of work with PyG; the lesson: when features plateau, the shape of the data (graph, sequence, hierarchy) is often the next axis — structure before model size.`,
      },
      {
        title: "Search zero-hit rate halved by intent routing.",
        body: `Marketplace search; 24% of queries returned zero results; intent classifier (150 classes: category + brand + attribute) routes to structured filters + query expansion via synonym graph; zero-hit → 11%; conversion +2.2%; the win was 80% information retrieval, 20% ML — the model was a routing table wearing a neural costume; the org stopped treating "search" as one monolith and split retrieval/ranking/rewriting accordingly.`,
      },
      {
        title: "Moderation queue triage cuts reviewer load 40%.",
        body: `Content platform; 3M items/day; human reviewers overwhelmed; multi-modal ensemble flagged policy violations; borderline band routed to prioritized queue with model score; auto-action only above 99% precision threshold; reviewer throughput +67%, overturn rate 3.1%→2.4%; the staffing ask dropped from 12 to 7 hires; trust-and-safety headcount is where ML ROI hides in plain sight.`,
      },
    ],
    exam: [
      {
        question: "Why must fraud labels be validated with time-aware splits?",
        answer:
          'Chargebacks arrive weeks/months late; random splits leak future chargebacks into training as "known good" — model learns hindsight; time-split on (txn_time, chargeback_time+window) mirrors deployment reality and exposes the true performance gap everyone underestimates.',
      },
      {
        question: "Why is zero-hit rate the highest-leverage search metric?",
        answer:
          "A zero result is a guaranteed lost sale and a guaranteed customer grievance — no ranking model recovers it; routing, expansion, and taxonomy quality eliminate most zero-hits; fix the plumbing before the ML garnish.",
      },
      {
        question:
          "Why does moderation require precision > 99% for auto-action but not for review-queue?",
        answer:
          "False positives in auto-action are irreversible (deleted content, banned users, legal exposure) — unrecoverable trust damage; review-queue false positives cost human minutes — acceptable; asymmetric error cost dictates asymmetric thresholds; the queue is the safety valve, not the classifier.",
      },
      {
        question:
          "Why do pricing experiments require partial rollouts and never full flips?",
        answer:
          "Price moves real money immediately — a bad model at 100% deployment is an instant P&L incident; 1-5% holdout with counterfactual evaluation (IPS) bounds the blast radius; pricing is a blast-radius-limited domain, unlike feed ranking.",
      },
    ],
    cheat: [
      "Every case: objective → constraints → data → baseline → metrics.",
      "Fraud: PR-AUC, time-splits, cost matrix, graph features for rings.",
      "Search: intent routing kills zero-hits; cache heads, invest in long tail.",
      "Moderation: policy-anchored decisions, human queue as safety valve.",
      "Pricing: elasticity models, IPS counterfactuals, tiny A/B buckets always.",
      "Recommendation: CTR is vanity; long-dwell + hide-rate are truth.",
    ],
    recap: `Common ML system design cases yield to a common discipline: name the business objective, audit the data honestly, start from the baseline, architect the two-stage skeleton, and guard every blast radius — because the difference between an ML hero and an ML incident is usually whether someone asked what the model was allowed to break.`,
    code: {
      title: "Two-stage skeleton",
      language: "python",
      code: `cands = retriever.topk(user_ctx, 200); scored = ranker.predict(cands)`,
      explanation:
        "The two lines every recsys/search system on earth ultimately executes.",
    },
    diagram: {
      title: "Case framework",
      caption: "Objective to model to measurement.",
      mermaid: `flowchart TD\n O[Business objective] --> D[Data audit]\n D --> B[Baseline]\n B --> M[Model]\n M --> E[A/B proof]`,
    },
  },
  "ai-ml-ml-system-design-inference-at-scale": {
    intro: `Inference at scale is where models meet traffic — GPU economics, batching, caching, autoscaling, and tail-latency warfare. The subject is serving engineering under load: request routing, dynamic batching, model compilation, KV-cache management, multi-model serving, and the SLO discipline that keeps p99 honest. a model nobody can reach in 100ms is a museum exhibit — inference is the last mile that fattens or starves.`,
    foundations: `Stack: model format (ONNX/TensorRT/TorchScript/vLLM), runtime (Triton Inference Server, TorchServe, vLLM), batching (dynamic batching — accumulate requests for ms windows), hardware (T4/A10/L4/A100/H100 pricing tiers), autoscaling (KEDA on queue depth), caching (exact-match + semantic caches), observability (per-model latency, GPU util, cost/token). p50 fast means nothing; p99 rules. Multi-LoRA serving for hundreds of fine-tunes on shared GPUs. Request coalescing. Cold start mitigation for serverless.`,
    concepts: [
      {
        title: "Dynamic batching: the GPU utilization multiplier.",
        body: `One request per GPU forward = 2% utilization; batch windows (2-25ms) collect concurrent requests → 60-85% util with 10-40x throughput; latency cost: +3-20ms wait (amortized); configurable per model SLO; Triton/vLLM/TorchServe all support; tuning: max_queue_delay vs max_batch_size tradeoff — measure TTFB (time to first byte) and throughput curves jointly; the knee of the curve is your operating point; small models batch aggressively, huge models batch reluctantly (memory-bound weight reload per batch — vLLM solves via paging).`,
      },
      {
        title: "KV-cache and continuous batching in LLMs.",
        body: `Autoregressive decode generates one token per step; KV cache stores attention keys/values to avoid recomputing history — memory grows linearly with sequence length per request; vLLM PagedAttention pages KV blocks like OS memory — eliminates fragmentation, enables 10-20x throughput vs naive serving; continuous batching admits/evicts requests per token step instead of per batch boundary — stragglers don\'t block the whole batch; TTFB decoupled from TPOT (time-per-output-token); prefill vs decode phases have different compute profiles — splitting clusters (prefill GPUs, decode GPUs) wins at extreme scale.`,
      },
      {
        title: "Speculative decoding and quantization for free speed.",
        body: `Small draft model proposes k tokens, big model verifies in one forward — accepted prefixes skip steps: 2-3x speedup when acceptance rate is decent; self-speculative (early exits) or distilled drafters; orthogonal: quantization INT8/INT4 (GPTQ/AWQ) — 2-4x memory reduction, marginal quality loss; KV-cache quantization halves decode memory; FP8 on H100 native; combining speculative + quantization compounds 5x+; measure not vibes: acceptance rate, tokens/joule, quality per benchmark — some drafts hurt quality; always A/B against the unoptimized baseline on real traffic.`,
      },
      {
        title: "Caching layers: exact, semantic, prefix.",
        body: `Exact-match cache: identical prompt → canned response (common support questions, 5-30% hit rate); semantic cache: embedding similarity > threshold → reuse (careful — staleness and false hits; short TTLs, freshness tags); prefix/prompt-prefix caching (Anthropic/OpenAI/Gemini-style): shared system prompt KV blocks reused — huge wins for agentic loops with long static prefixes; CDN-style invalidation for retrieval-augmented content (doc version tag in cache key); caching is the highest-ROI optimization available everywhere it applies; instrument hit rate before adding anything else.`,
      },
      {
        title: "Multi-model serving and autoscaling economics.",
        body: `Hundreds of fine-tuned LoRA adapters served on shared base model via vLLM/S-LoRA — adapter swap < ms, one GPU serves 50+ models; cold start avoided because base stays hot; autoscaling on queue depth + GPU util, scale-to-zero for dev endpoints; cost accounting per model: GPU-seconds per 1k queries per model — kill zombies; fallback chains (primary → distilled → heuristic) degrade gracefully under overload; load shedding with priority classes (paid → free → batch); capacity plan with Little\'s Law: concurrency = arrival rate × latency — when p99 goes slippery, the fix is either fewer arrivals or shorter service, not more hope.`,
      },
    ],
    worked: [
      {
        title: "Batching bumps GPU util 8%→74%, cuts cost 65%.",
        body: `Internal classifier API; 400 RPS at 8% util on 8×A10s; dynamic batching window 6ms, max_batch 64; util 74%; RPS capacity same on 3 GPUs; retired 5 nodes; monthly $14k saved; TTFB +4.1ms p50 — users noticed nothing; the exercise moved into the platform template; the finance team received the invoice delta with a one-line email — "infrastructure found the money."`,
      },
      {
        title: "Prefix cache halves RAG agent cost overnight.",
        body: `Legal research agent; system prompt 12k tokens (statutes + tools); every turn re-sent it; prefix caching enabled at provider layer: input cost per turn −62%; total agent cost −41%; latency improved as a bonus; the architecture change was one header; the lesson — the cheapest optimizations are often at the protocol level, never inside the model.`,
      },
      {
        title: "LoRA fleet of 40 adapters on one H100.",
        body: `Multi-tenant SaaS; 40 customer-specific fine-tuned adapters; one H100 with S-LoRA multi-LoRA serving; 12k queries/day total; cost per customer $0.40/month inference (vs dedicated GPU $1.2k); cold adapter loads in 180ms amortized over base being hot; the economics unlock the entire customization-as-a-feature roadmap; the board framing: "personalization at the price of a coffee."`,
      },
    ],
    exam: [
      {
        question:
          "Why does dynamic batching improve throughput while mildly hurting per-request latency?",
        answer:
          "Waiting 2-20ms to fill a batch amortizes fixed kernel launch and weight-fetch costs across many sequences - utilization and tokens/sec soar; the wait is the deliberate price; sizing the window per SLO converts a serving bottleneck into a schedulable resource.",
      },
      {
        question:
          "Why does PagedAttention eliminate the KV-cache memory cliff?",
        answer:
          "Contiguous KV allocation wastes 60-80% to fragmentation as sequences grow unevenly; paging fixed blocks with an OS-like table removes the waste and the recomputation cascade; batch sizes unlock orders of magnitude, and vLLM became the default because of it.",
      },
      {
        question:
          "Why does speculative decoding speed up only when the draft is good?",
        answer:
          "Verification accepts prefixes the big model would have produced - bad drafts propose wrong tokens, acceptance collapses, and the verify pass becomes pure overhead; acceptance rate must be measured and tuned (draft distillation) before claiming the 2-3x.",
      },
      {
        question:
          "Why do priority classes and load shedding beat autoscaling alone?",
        answer:
          'Autoscaling reacts in minutes; overload strikes in seconds; shedding low-priority traffic preserves SLOs for revenue traffic now — autoscaling catches up after; the two compose, never substitute; nightmares come from "we\'ll just scale" without shedding policy.',
      },
    ],
    cheat: [
      "Batch windows 2-25ms; tune knee of throughput/latency curve.",
      "vLLM/PagedAttention for LLMs; continuous batching or nothing.",
      "Speculative decode + INT4 quantization; measure acceptance rates.",
      "Cache: exact first, semantic second, prefix always for agents.",
      "Multi-LoRA fleets on shared hot base models — customization cheap.",
      "p99 discipline: shed low-priority, autoscale after, never hope.",
    ],
    recap: `Inference at scale is queueing theory wearing GPUs: dynamic batching for utilization, paged KV-caches for memory honesty, speculative decoding and quantization for free velocity, caching at every layer, shedding with dignity under overload — because the user never sees your model, only your latency, your uptime, and your bill.`,
    code: {
      title: "Triton config sketch",
      language: "text",
      code: `dynamic_batching { preferred_batch_size: [32] max_queue_delay_microseconds: 6000 }`,
      explanation:
        "Six microseconds-to-milliseconds of patience, converted into 8x utilization — serving magic in three lines.",
    },
    diagram: {
      title: "Inference path",
      caption: "Request through cache to GPU.",
      mermaid: `flowchart LR\n R[Request] --> C[Cache]\n C --> B[Dynamic batch]\n B --> G[GPU continuous]\n G --> O[Response]`,
    },
  },
  "ai-ml-ml-system-design-monitoring-and-feedback-loops": {
    intro: `Monitoring and feedback loops are the immune system of ML systems — detecting decay, bias, and drift before users or regulators do. The subject is the full observability stack: data drift, model drift, performance proxies, human-in-the-loop review, automated retraining triggers, and the runbooks that decide who pages whom. a model you don\'t watch is a model that fails silently — and silent failures are the ones that compound.`,
    foundations: `Layers: input monitoring (feature distributions, missingness, schema), prediction monitoring (output distribution vs training, confidence), performance monitoring (delayed ground truth: clicks, conversions, RMAs), business monitoring (the metric that pays for the model), stability (concept drift between train and serve distributions). Tools: Evidently, WhyLabs, Arize; alerts: PSI, KL divergence, KS tests; review queues for low-confidence; feedback incorporation loops; rollback triggers; model registry gates.`,
    concepts: [
      {
        title: "Three drifts, three detectors, three timelines.",
        body: `Data drift: input distribution shifts (P(X) changes) — PSI > 0.25 or KS p < 0.01 vs 30-day baseline; detect daily; label drift: P(Y|X) changes — model\'s world changed under it — detect when ground truth arrives (click/conversion/return); detected weekly; concept drift: P(Y|X) itself rewrites — hardest, needs outcome monitoring with stratified cuts; detection latency: hours (input) to weeks (ground-truth-gated); design: measure all three separately — one merged metric hides which one broke; alerts carry suspected cause, not just "metric red".`,
      },
      {
        title: "Proxy metrics and the long feedback delay.",
        body: `Fraud models see ground truth after weeks (chargebacks); churn models after months — you cannot wait for truth; proxies: score-vs-downtime consistency, prediction entropy drift, calibration curves on partial-feedback slices (labeled 1%), business telemetry correlation (refund rate rising with approval-rate rising = model drifting blind); shadow-compare new-vs-old on shared traffic continuously; every proxy must be validated against eventual truth at least quarterly — proxies lie confidently; the dashboard of proxies is the radar, the quarterly audit is the strike fighter check.`,
      },
      {
        title: "Human-in-the-loop: the review queue economics.",
        body: `Route low-confidence and high-impact predictions to humans; queue stratified by risk × uncertainty; each review is training data (active learning — label where the model is weakest); throughput planning: 2k reviews/day/annotator-team, 30-second median; ROI: model improves where it matters most; compliance: humans must override with audit trail; staffing model: 1 reviewer per 50k daily predictions at 0.1% review rate; the loop pays for itself twice — quality and future labels; never remove the humans to save cost before the model beats them on their own turf.`,
      },
      {
        title: "Automated retraining triggers and guardrails.",
        body: `Triggers: drift threshold crossed, performance proxy degradation > X%, scheduled (weekly regardless — weekly keeps training fresh), new-data milestone (every 100k new labeled rows); guardrails on auto-retrain: candidate must beat champion offline by margin, must not regress any slice more than 2%, canary pass required before full promotion; auto-rollback on online-alert spike; never auto-deploy to 100% from training pipeline without the canary gate; the failure mode everyone hits: pipeline auto-promotes a broken candidate at 3 AM and the on-call learns about it via customer Slack — guardrails exist precisely so 3 AM stays boring.`,
      },
      {
        title: "Incident runbooks and blameless review culture.",
        body: `Every ML incident gets a runbook: symptoms → likely cause ladder (data pipeline → feature store → model → infra) → diagnostics → mitigation (fallback/rollback) → escalation; on-call pages with the runbook attached, not "check the model"; postmortems blameless, blame concentrated on processes: missing monitor X, missing test Y; action items are engineering tickets with owners; metrics tracked: MTTD (time to detect) and MTTR — review both monthly; the culture test: does the junior engineer feel safe declaring "the model is wrong" in the incident channel at 2 AM? If not, the org is blind.`,
      },
    ],
    worked: [
      {
        title: "Drift detector catches upstream schema change in 4 hours.",
        body: `Churn model; feature "sessions_30d" silently changed unit (minutes→seconds) after a partner integration migration; PSI alert fired within 4 hours of the schema flip; downstream predictions frozen via auto-gate; replay validation on sampled traffic confirmed scale error; fix shipped in 6 hours; zero churn interventions dispatched on garbage scores; the alternative timeline — silent failure for weeks then a quarterly review meeting discovering the charred remains.`,
      },
      {
        title: "Human review queue feeds the model that replaced it.",
        body: `Product-tagging model; 8% low-confidence routed to human queue; 6 months later queue reached 90k labels; retrained with active learning; confidence distribution shifted; auto-coverage 8%→2%; reviewer load halved at constant quality; the queue was not overhead — it was the R&D department wearing a headset.`,
      },
      {
        title: "Auto-retrain blocked by guardrail saves the quarter.",
        body: `Nightly pipeline promoted candidate with +1.2% offline AUC; slice-check flagged regression on SMB cohort (−4.1% precision) — smaller companies systematically mis-scored; guardrail halted promotion, paged owner; investigation revealed feature store truncation bug affecting <10k rows; fixed, retrained, promoted safely 3 days later; without the slice gate: every SMB churn-rescue call for two weeks would have been noise; the guardrail paid one line of config to save a quarter.`,
      },
    ],
    exam: [
      {
        question: "Why do input-drift monitors alone fail to catch model rot?",
        answer:
          "Distributions can stay constant while the mapping P(Y|X) silently rewrites itself (policy changes, user behavior shifts, seasonality); only outcome-linked monitoring surfaces concept drift — both layers are mandatory, because rot hides under calm inputs.",
      },
      {
        question:
          "Why must proxy metrics be audited against ground truth periodically?",
        answer:
          "Proxies correlate imperfectly — a proxy can hold steady while revenue quietly bleeds; the quarterly audit recalibrates the proxy against reality, corrects false confidence, and tells you whether the radar still deserves the word; unaudited proxies are superstition with graphs.",
      },
      {
        question:
          "Why is active learning the highest-ROI use of human review time?",
        answer:
          "Labeling where the model is already correct or hopelessly wrong wastes effort equally; selecting by uncertainty × impact targets the decision boundary — every human minute converts directly into the model's growth direction; nothing else compounds this cheaply.",
      },
      {
        question:
          "Why is auto-promotion without a canary gate an organizational defect?",
        answer:
          "Training pipelines validate offline metrics against yesterday's world; today's traffic is the only unbiased judge; the gate is cheap, the incident is expensive; absence of the gate is not agility, it is unmanaged tail risk with a CI/CD logo on it.",
      },
    ],
    cheat: [
      "Monitors: input PSI/KS, prediction entropy/calibration, outcome-linked slices.",
      "Proxies audited against truth quarterly — recalibrate or retire them.",
      "Route low-confidence × high-impact to humans; label them; retrain.",
      "Triggers + guardrails: slice regression halts promotion, canary always.",
      "Runbooks on the page; blameless postmortems; MTTD/MTTR tracked monthly.",
      "Silent failure is the enemy — every monitor names its suspected cause.",
    ],
    recap: `Monitoring and feedback are an immune system you engineer on purpose: drift detectors per layer, proxies audited against delayed truth, reviewer payrolls feeding the flywheel, guardrailed auto-retraining with slice gates — because the difference between a model that rots in silence and one that self-corrects is whether anyone was watching the right vital signs.`,
    code: {
      title: "Drift gate skeleton",
      language: "python",
      code: `if psi(train_dist, live_dist) > 0.25: freeze_promotions(); page('drift', feature='sessions_30d')`,
      explanation:
        "One PSI comparison that prevents weeks of silent model decay.",
    },
    diagram: {
      title: "Monitoring loop",
      caption: "Watch, alert, label, retrain.",
      mermaid: `flowchart LR\n M[Monitors] --> A[Alert]\n A --> H[Human review]\n H --> T[Retrain]\n T --> M`,
    },
  },
};

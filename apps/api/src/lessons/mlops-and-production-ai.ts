import type { TopicLesson } from "../topicLessons.js"; /** * MLOps and Production AI — 9 authored topic lessons. * * Standalone chapters per topic. Subject-first prose, foundations, core * concepts, worked examples, exam practice, cheat sheet, recap. No shared * templates, no runtime composition. */
export const mlopsAndProductionAi: Record<string, TopicLesson> = {
  "ai-ml-mlops-and-production-ai-experiment-tracking": {
    intro: `Experiment tracking is the audit trail of machine learning — every parameter, metric, artifact, and dataset snapshot recorded so any result can be reproduced and every lesson retained. The subject is the practice: tools (MLflow, Weights & Biases), what to log, comparison workflows, and the discipline that separates a team shipping AI from a team hoarding notebooks. if it isn't logged, it didn't happen — and if it isn't reproducible, it isn't knowledge.`,
    foundations: `Track per run: params (lr, batch, architecture hash), metrics (loss curves, eval scores), artifacts (model weights, config, plots, data fingerprint), environment (git SHA, docker image, library versions), lineage (dataset versions). Tools: MLflow (open source, self-host or managed: tracking server + model registry + serving), W&B (hosted, richer UI: sweeps, hyperparameter search, system metrics, reports), Neptune, Comet. Workflows: tag runs (baseline/ablation/candidate), comparison tables, best-model selection via registry stage transitions (Staging → Production). Rule: every training run is a first-class record, not a scrollback.`,
    concepts: [
      {
        title: "What to log, and how much is enough.",
        body: `Params: model config (hidden dims, layers, activation), optimizer state (lr, weight decay, schedule), data split IDs, seed — the seed saves you at 3 AM when "it worked yesterday" arrives; metrics: train/val/test per epoch + final test one-time touch; log histograms (weight distributions detect vanishing/exploding), gradient norms, data stats drift per epoch; artifacts: final model, training curves PNG, confusion matrix, error analysis samples; environment: git commit, image digest, pip freeze hash; lineage: dataset version (DVC hash/lakehouse table version), upstream model versions; cap: log what you compare — 500 metrics × 200 runs = swamp; ruthlessly prune what nobody opens.`,
      },
      {
        title: "MLflow vs Weights & Biases in practice.",
        body: `MLflow: runs locally, logs to file:// for solo, server for teams; model registry with aliases (champion/challenger), stage transitions gated by CI; deployments via mlflow models serve or export to your stack; UI utilitarian; zero license drama; best for teams wanting ownership and simple infrastructure. W&B: hosted, generous free tier, sweeps (Bayesian hyperparameter search as config), Table features (visual diff of predictions vs ground truth per run), reports (shareable narratives embed runs), collaborative dashboards — best for velocity and polish; tradeoff: cloud dependency; both answer "which run produced this model?" — the question that must never require archaeology.`,
      },
      {
        title: "Comparison workflows that actually decide.",
        body: `Standard moves: overlay runs on identical metric axes (loss vs steps, eval A/B); table sort by primary metric with variance columns (seeds×3 minimum); parallel coordinates for high-dim sweeps (Spot the flat regions of hyperparameter space); W&B sweeps automate the grid — 40 trials brackets most budgets; decision memo per experiment wave: hypothesis → result → ship/kill; the artifact discipline: attach the analysis notebook to the winning run — the next team member retracing steps in five minutes, not five days; review cadence: weekly 30-min triage of experiment queue — dead ends pruned, winners promoted; tracking without review is a library no one reads.`,
      },
      {
        title: "Model registry: from artifact to asset.",
        body: `Raw runs are noise until promoted; registry assigns identity: name, version, stage (None/Staging/Production/Archived), aliases; promotion workflow: candidate → eval harness (automated golden suite green) → Staging 48h soak with live shadow traffic → Production with rollback plan (previous version tagged); every consumer references aliases, not absolute versions — swapping Production alias deploys without client changes; provenance card auto-generated: dataset, params, evals, approver, timestamp; the registry is the contract between training and serving — treat it like prod config: audited, gated, reverted trivially.`,
      },
      {
        title: "Reproducibility as engineering, not prayer.",
        body: `Seed everything (torch.manual_seed, numpy, random, dataloader workers — nondeterminism from CUDA kernels noted honestly); containerize training (Dockerfile with pinned base + lockfile); record dataset fingerprint; run twice from cold checkout in CI on a small slice — if metrics diverge beyond tolerance, the pipeline is broken; hardware variance documented (GPU model, driver); deterministic ops flags where correctness > speed for critical reruns; the 10-minute test: "can a teammate re-run last month\'s best result?" — if the answer is a shrug, your tracking is decorative.`,
      },
    ],
    worked: [
      {
        title: "Adopt tracking in one week without blocking science.",
        body: `Policy: MLflow autolog in the shared trainer template; 15 lines of ceremony max; existing scripts wrapped not rewritten; legacy runs imported with best-effort backfill (params from configs, metrics from CSVs); week one: 42 runs logged, three comparisons surfaced the obvious winner everyone suspected but couldn\'t prove; the org adopted "no run logged, no PR merged" — friction evaporated in a fortnight; the archaeologist on the team finally slept through callbacks.`,
      },
      {
        title: "W&B sweep finds the LR sweet spot in 18 hours.",
        body: `Hypothesis: LR too low on new backbone; grid 1e-5…3e-4; sweep 40 trials, early termination on val plateau; winner 8e-5 — 2.1 point gain on the previously unreachable metric; team decision: adopted sweep discipline for every new architecture spike; cost: $60 of GPU; value: months of manual hunches retired; the experiment log shows the contour of the learning-rate landscape for anyone who asks later.`,
      },
      {
        title: "Registry-gated rollback saves a Friday deploy.",
        body: `Production model degraded subtly Monday: AUC −3.2% vs Staging shadow; root cause: silent schema drift upstream; rollback: Staging alias flipped to previous Production in 4 minutes; users unaffected; registry history made the incident a 20-minute detour instead of a weekend; the postmortem added a data-drift check into the promotion gate — every gate edit came from scar tissue, every scar tissue documented.`,
      },
    ],
    exam: [
      {
        question:
          "Why must dataset fingerprints be logged with every run, not just code SHAs?",
        answer:
          "Data drift is the most common silent failure in ML systems — same code, new data, new model behavior; hashes of the exact training tables/images make runs reproducible bit-wise and drift diagnosable in minutes instead of quarter-long forensic audits.",
      },
      {
        question:
          "What does promotion through a model registry guarantee that a folder of checkpoints cannot?",
        answer:
          "Identity, approval lineage and reversibility: aliases decouple consumers from versions, stage transitions are gated and audited, and rollback is an alias swap — turning deploy/revert from archaeology into operations.",
      },
      {
        question:
          "Why do seeds and Docker digests belong in tracking metadata?",
        answer:
          'Nondeterminism hides in CUDA libs and environment drift — pinning every input (code, data, deps, seed, GPU) collapses "it worked on my machine" classes of failure to zero; anything less makes your beautiful metrics anecdotes.',
      },
      {
        question:
          "What is the correct threshold for stopping a sweep, and how is it enforced?",
        answer:
          "Marginal-gain < 0.3 points on the primary metric over the last 10% of trials or budget exhausted, whichever first — enforced by early-termination rules on val plateau, so compute flows to live hypotheses, not dead ones.",
      },
    ],
    cheat: [
      "Log params, metrics, artifacts, env, data lineage — every run.",
      "MLflow for ownership; W&B for velocity; both non-negotiable.",
      "Compare on identical axes with variance; sweep, don't grid-guess.",
      "Registry: aliases > versions; gates > hopes; rollback = alias flip.",
      "Cold-clone CI rerun as reproducibility proof.",
      "Weekly triage or the tracking UI becomes a landfill.",
    ],
    recap: `Experiment tracking converts trial into knowledge: logged runs with lineage, comparison discipline, registry-gated promotion with trivial rollback, and cold-clone reproducibility — the difference between a lab with a memory and a lab with a scrapbook.`,
    code: {
      title: "Minimal MLflow wrapper",
      language: "python",
      code: `with mlflow.start_run(run_name=name):\n    mlflow.log_params(cfg)\n    mlflow.log_metric('val_auc', auc)\n    mlflow.pytorch.log_model(model, 'model')`,
      explanation:
        "Twenty lines make every run immortal — loss curves, configs, artifacts, one URI away.",
    },
    diagram: {
      title: "Tracking to production",
      caption: "Runs to registry to serving.",
      mermaid: `flowchart LR\n R[Run] --> T[Tracking server]\n T --> REG[Model registry]\n REG --> S[Served model]`,
    },
  },
  "ai-ml-mlops-and-production-ai-data-and-model-versioning": {
    intro: `Data and model versioning is how you reproduce last month\'s miracle — naming every byte that fed and formed the model so history is queryable, not mythical. The subject is the toolkit: DVC for data, dataset registries, model registries with lineage, feature stores, and the policies that make "which data trained v7?" a two-minute answer. untracked data is a rumor — versioned data is an experiment you can replay.`,
    foundations: `Three layers to version: data (DVC over git repos, lakehouse table versions in Iceberg/Delta, immutable snapshot IDs), code (git SHA stamped into runs), models (registry versions + aliases). DVC: git tracks metadata .dvc files; s3/gcs/azure stores payloads; pipelines reproducible end-to-end; checkout of any commit restores exact data. Feature stores: central definition + offline/online consistency (Feast, Tecton, Redis-backed). Model registry lineage: dataset version → run → model version → deployment — full chain traversable. Principle: every artifact immutable; every pointer (alias) mutable.`,
    concepts: [
      {
        title: "DVC essentials: data as code citizens.",
        body: `git add model.dvc — the repo holds a 100-byte pointer; payload lives in remote (s3); dvc pull restores on any machine; pipelines (dvc.yaml): stage deps/outs hashes — skip unchanged stages, cache hits reproducible for free; branches/tags name data versions; dvc import reuses across repos; CI checks dvc status for drift; no giant blobs in git ever; workflow: data → preprocess → train, all stages hashed; when the lakehouse replaces git+DVC for big teams: table snapshots + query-as-of-version — same idea, different substrate; either way: the commit hash is the answer to "which data?"`,
      },
      {
        title: "Feature stores: consistency between train and serve.",
        body: `The training-serving skew fix: features defined once, computed offline for training (parquet/lakehouse), online for inference (Redis/Dynamo with <5ms p99 access); point-in-time joins for training correctness (no future leakage!); Feast open-source: registry (YAML) + offline (Parquet) + online (Redis); monitoring: freshness alerts, drift on feature distributions (PSI), missing-rate per feature per hour; cost: another system to run — adopt when features are shared across 3+ models or skew bugs keep recurring; not before; the skew is the silent killer — features identical in name, different in computation at training vs serving — the feature store makes the duplication structurally impossible.`,
      },
      {
        title: "Model registries with full lineage chains.",
        body: `Lineage chain: dataset version → feature pipeline SHA → training run ID → model version → deploy manifest — each link stored, traversable in seconds; MLflow registry ties run → model; extended with W&B artifact graphs (run produces artifacts, artifacts consumed by downstream runs — DAG visible); enterprise: Unity Catalog/SageMaker Lineage for cross-team chains; audit questions answered instantly: which customers\' absence of consent data in v12 training, which PII filters applied, which base model; lineage is not documentation, it is the evidence machine — compliance stops being a week-long dig.`,
      },
      {
        title: "Snapshot discipline and retention economics.",
        body: `Storage math: 10TB dataset, daily snapshots, 90 days = 900TB-weeks — impossible; instead: immutable snap IDs + incremental deltas (CDC) or columnar lakehouse with time-travel retention windows; keep: training-relevant full snaps for current models (3-5 versions), sampled windows after, deletion policies enforced by job; regulatory: cannot delete data of actively-serving models\' training sets — legal holds documented per model registry entry; storage lifecycle: hot (current training data) warm (30-90d) cold (archive, Glacier) — with restore drills quarterly; versioning that can\'t be restored is mythology.`,
      },
      {
        title: "Aliasing and interface stability for consumers.",
        body: `Consumers reference models/datasets by alias (champion, latest, production-training) not version numbers — aliases are mutable pointers; versions are immutable artifacts; moving alias in registry = atomic fleet-wide model swap; rollback instant; contract per alias: input schema, output schema, expected latency, eval floors — checked at load time (schema validation) — if v9 violates the contract, v8 stays champion; contracts make versioning operational instead of ceremonial.`,
      },
    ],
    worked: [
      {
        title: "Reproduce April's best model in 11 minutes.",
        body: `Request: reproduce the exact checkpoint beating baseline on March 28 experiment wave. Without versioning: impossible. With DVC + MLflow: checkout repo tag v3.2-data → dvc pull → load run 8812 from registry → retrain smoke test 200 steps → metrics within tolerance of original; elapsed 11 minutes; the request went from "next sprint" to before-the-coffee-was-done; the org adopted tags for every release candidate — muscle memory by Q3.`,
      },
      {
        title: "Feature-store rescue of a skewed model.",
        body: `Churn model predicting beautifully offline, flat in prod. Investigation: training feature "sessions_last_7d" computed from warehouse batch at T+1; serving computing staleness-tolerant lookup missing refunds — silent mismatch; fix: Feast feature "sessions_l7d" computed once, dual-written offline/online with point-in-time correctness; shadow eval: skew eliminated; AUC prod +4.1 points; the store paid for its setup in the first incident avoided — the case study in the all-hands.`,
      },
      {
        title: "Compliance audit answered by lineage query.",
        body: `EU audit: prove model v9 trained without user X\'s data (erasure request). W&B artifact graph + DVC manifest: dataset hash excludes user X\'s shard (post-erasure snapshot); run 8812 lineage prints full chain with timestamps and approver; audit closed in 4 hours, no erasure of the model needed; the auditor called it "the cleanest response I\'ve seen"; lineage infrastructure stopped being a cost center and became legal armor.`,
      },
    ],
    exam: [
      {
        question:
          "Why are immutable artifact versions and mutable aliases both required, not either/or?",
        answer:
          "Versions guarantee forever-stable reference points for reproduction and audit; aliases let fleets move atomically without client redeploys — mixing them up either breaks rollback or forces version threading through every config file like it's 2009.",
      },
      {
        question:
          "What is training-serving skew and why does a feature store prevent it structurally?",
        answer:
          "Same-named features computed differently at train vs serve — divided by one code path and one definition, skew becomes unrepresentable, not just unlikely; prevention beats detection orders of magnitude in cost.",
      },
      {
        question: "Why must retention policies accompany data versioning?",
        answer:
          "Storage costs scale with versions × size — without pruning you get a warehouse of unfindable bankruptcy; with it, capacity focuses on live lineages and legal holds; versioning without retention is debt, not discipline.",
      },
      {
        question:
          "What does point-in-time join correctness actually guarantee?",
        answer:
          "Features for prediction at time T contain only data available at T — no future leakage contaminating training; it is the line between a predictive model and an accidentally clairvoyant regurgitator of the answer key.",
      },
    ],
    cheat: [
      "DVC: git tracks pointers, s3 tracks payloads; pipelines hash everything.",
      "Feature stores: define once, offline+online, point-in-time joins.",
      "Lineage chain: dataset → run → model → deploy — traversable or useless.",
      "Alias contracts: schema + eval floors enforced at load; rollback = alias flip.",
      "Retention policy with legal holds; quarterly restore drills.",
      "Audit answer target: under one hour, every time.",
    ],
    recap: `Versioning is ML reproducibility\'s skeleton: DVC-style data pointers and snapshots, feature stores eliminating skew by construction, registry lineage making audits SQL queries, aliases as atomic deploy levers — because "which data trained this?" should be a question with a two-minute answer, not an epitaph for institutional memory.`,
    code: {
      title: "DVC pipeline stage",
      language: "yaml",
      code: `stages:\n  train:\n    cmd: python train.py\n    deps: [data, prep.dvc]\n    outs: [model.pkl]`,
      explanation:
        "Hashed deps → hashed outputs: cached reruns are bit-identical, pipelines resumable, history traversable.",
    },
    diagram: {
      title: "Lineage chain",
      caption: "Data to model to serving.",
      mermaid: `flowchart LR\n D[Dataset version] --> R[Training run]\n R --> M[Model version]\n M --> P[Deployment]`,
    },
  },
  "ai-ml-mlops-and-production-ai-serving-models": {
    intro: `Serving models is where ML becomes a user-facing product — API design, batching, latency budgets, and scaling from one GPU to thousands of requests per second. The subject is the production stack: FastAPI wrappers, TorchServe/Triton/vLLM, batching strategies, autoscaling, A/B testing, and latency SLO discipline — every millisecond priced against correctness and cost. the best model in the world is worthless if it times out at p95.`,
    foundations: `Serving topologies: embedded (library call in-process — lowest latency, scaling couples app), sidecar/microservice REST/gRPC (decoupled scaling, network hop ~1ms), managed platforms (SageMaker, Vertex, Azure ML), GPU-optimized servers (Triton, vLLM for LLMs with paged KV cache, continuous batching). Latency budgets: TTFB (time to first byte) vs total; throughput vs latency trade via batch size; GPU utilization the key metric (>70% target before adding hardware). APIs: REST for simplicity, gRPC for high-throughput streaming; pagination/batch endpoints for bulk. Health: liveness (process) vs readiness (GPU warm, model loaded).`,
    concepts: [
      {
        title: "API design: the model as a service.",
        body: `POST /predict {instances: [...], params: {...}} — batch instances array, never one request per inference (round trips kill throughput); response envelope includes model_version — always, for debuggability; idempotency keys for retry safety; schemas via Pydantic — validation errors before GPU compute; versioning: /v1 stable contract, /v2 breaking changes, aliases in config for zero-downtime swaps; auth: service tokens + rate limits per client; errors typed (model_loaded_error vs validation vs busy/queue-full); docs via OpenAPI — the model API consumers read before they integrate; the best serving API is boring — boring APIs never page.`,
      },
      {
        title: "Batching: the GPU utilization lever.",
        body: `GPUs idle between tiny requests; dynamic batching: collect requests over window (5-50ms) or batch size cap (32), single forward pass — throughput 10-40x for moderate latency cost; Triton Inference Server does this natively per model; latency vs throughput tuning: max_queue_delay, preferred_batch_size; continuous batching for LLMs (vLLM): new tokens join in-flight sequences per step — no waiting for longest request — 10x LLM throughput; caution: batching trades p99 latency up; size windows to your SLO; under 2ms budgets, disable batching for the hot path (pay GPUs); the dashboard: queue depth + batch fill rate + utilization % per replica — the three dials.`,
      },
      {
        title: "LLM serving specifics: vLLM and KV cache.",
        body: `Autoregressive decode = memory-bandwidth bound; KV cache = attention keys/values stored per token — reused each step; PagedAttention: KV pages in non-contiguous GPU memory like OS virtual memory — eliminates fragmentation waste (vLLM key); continuous batching + preempt-by-priority; tensor parallelism for >40B models across GPUs; quantization INT8/INT4 cuts memory and bandwidth; TTFB vs TPOT (time per output token) — the two SLOs that matter; speculative decoding cuts perceived latency; the order of vanity: vLLM > TGI > naive HF pipeline — always; measure tokens/s and $ per 1k tokens per model-GPU pair before launch and after every bump.`,
      },
      {
        title: "Autoscaling and deployment strategies.",
        body: `HPA/Karpenter on GPU pods: scale on queue depth + GPU util (not CPU — GPUs don\'t idle loudly); scale-to-zero for dev, min-warm replicas for prod (cold starts kill SLOs); GPU node pools per model size; deployment: rolling (pods replaced gradually with readiness gates), blue/green (full parallel stack + router flip), canary (1% → 10% → 50% by error rate); rollback = flip router back; load balancer drains old pods; health checks: liveness cheap (process), readiness expensive (actual inference probe or warmup handshake); deploys run at low-traffic windows; the metric that vetoes a deploy is the one users feel, not the one dashboards admire.`,
      },
      {
        title: "A/B testing and shadow evaluation in production.",
        body: `Shadow mode: new model receives 100% of traffic, outputs logged not served — zero-risk data collection for 7-14 days; compare: agreement rate, calibrated quality; deviations flagged; then canary by user hash: stable assignment (same user→same model always) — fixes flickering; measure business metric (conversion, retention, revenue-per-session) not just model metrics — models optimize proxies, businesses survive reality; stop once CI tightens (significance 95%, min sample); rollback on guardrail breach (error rate, latency, thumbs-down spike); the pattern: trust the offline numbers to nominate, trust online experiments to decide.`,
      },
    ],
    worked: [
      {
        title: "Cut p95 latency 60% with dynamic batching.",
        body: `Service: 40ms per request at 30 rps, GPU 18% util, 4 replicas burning $2k/mo. Dynamic batching window 8ms, cap 16: p95 40ms→24ms, throughput 4x, replicas 4→2; the batch window invisible to clients; the same GPU serving 2x users; lesson logged: measure batch fill before buying hardware — idle GPUs lie about their cost.`,
      },
      {
        title: "vLLM deployment lifts LLM throughput 9x.",
        body: `HF pipeline serving 70B at 3 tok/s/GPU; latency failures on >512-token outputs during bursts. Swap to vLLM with PagedAttention + INT8 KV: 28 tok/s/GPU, continuous batching absorbs bursts gracefully, TTFB p50 90ms; same hardware, 9x goodput, capacity freed for two more models; the rewrite was a config, not a rewrite; the debrief ritual: every model above 7B ships via vLLM by default, exceptions require sign-off.`,
      },
      {
        title: "Canary catches a silent 12% quality collapse.",
        body: `Candidate model: +1.5% AUC offline, lovely. Shadow week: error consistency fine, then canary 5%: thumbs-down +40% on support category, response truncation discovered in long outputs; pipeline bug in the new serving wrapper trimming at 512 tokens; rollback in 9 minutes; the offline gap: AUC didn\'t capture truncation cost; online guardrails did; the registry alias flipped back; the model never failed in the conference room, and the users never saw it fail in the wild either.`,
      },
    ],
    exam: [
      {
        question:
          "Why does request-per-inference kill GPU economics, and what is the fix?",
        answer:
          "Kernel launch overhead dominates when micro-batches hit the GPU — utilization craters, dollars per inference balloon; dynamic batching (Triton) or continuous batching (vLLM) amortizes kernels over many instances — 10-40x throughput with single-digit ms latency cost.",
      },
      {
        question: "What does PagedAttention actually solve in LLM serving?",
        answer:
          "KV cache fragmentation — variable sequence lengths leave unusable memory holes; paging allocates fixed blocks on demand like OS virtual memory, reclaiming the 30-60% waste that naive contiguous allocation burns; longer contexts and bigger batches emerge from the same GPUs.",
      },
      {
        question: "Why is readiness a deep check, not a process heartbeat?",
        answer:
          'A "healthy" pod with an unloaded model or cold GPU serves nothing but errors with a green dot — readiness probes must execute a real inference against a probe tensor or require a warmup handshake — otherwise your load balancer faithfully routes users into a void.',
      },
      {
        question:
          "Why do business metrics outrank model metrics in promotion decisions?",
        answer:
          "AUC improves while users suffer — calibration, truncation, latency, format regressions never show in offline curves; promotion gates on the metric the org actually answers to (conversion, retention, escalation rate) or you optimize the dashboard and lose the customers.",
      },
    ],
    cheat: [
      "REST predict API: batch instances array; model_version in envelope; typed errors.",
      "Dynamic batching for throughput; continuous batching (vLLM) for LLMs.",
      "Scale on GPU util + queue depth; warm minimums; readiness = real inference.",
      "Canary by user hash with guardrails; shadow first, ship second.",
      "TTFB/TPOT for LLMs; p95 + utilization for everything.",
      "Never promote on model metrics alone — business metric decides.",
    ],
    recap: `Serving is the final ML mile: boring idempotent APIs with versioned envelopes, batching disciplines that squeeze GPUs, LLM-specific engines (vLLM, paged KV) for decode-bound workloads, autoscaling on real GPU signals, and canary-plus-shadow gates where business metrics hold veto power — because users never experience your AUC, only your p95 and your reliability.`,
    code: {
      title: "Batched predict endpoint",
      language: "python",
      code: `@app.post('/predict')\ndef predict(req: BatchReq):\n    out = model(req.instances)\n    return {'predictions': out, 'model_version': VERSION}`,
      explanation:
        "One request, many inferences, one version stamp — the minimal honest serving contract.",
    },
    diagram: {
      title: "Serving path",
      caption: "Queue to batch to GPU to response.",
      mermaid: `flowchart LR\n C[Client] --> LB[Load balancer]\n LB --> R[Replica]\n R --> Q[Dynamic batch queue]\n Q --> GPU[GPU inference]`,
    },
  },
  "ai-ml-mlops-and-production-ai-docker-and-cloud-gpus": {
    intro: `Docker and cloud GPUs are how models escape laptops — containerized, reproducible inference on elastic GPU capacity. The subject is the working stack: writing production images (dependencies, CUDA bases, model weights injection), choosing GPU instances (A10/A100/H100, spot vs on-demand), autoscaling pools, cost planning, and operational gotchas — driver mismatches, OOM tuning, cold start mitigation. compute is the cloud\'s most expensive line item — use containers to stop renting GPUs that model can\'t even see.`,
    foundations: `Images: base nvidia/cuda:12.x-runtime vs devel; model weights mounted at runtime (PVC/s3-sync at boot) or baked in (huge images — avoid); multi-stage builds; non-root user; health checks; pinned digests. GPUs: A10G (24GB, inference sweet spot), A100 (40/80GB, training), H100 (80GB, LLM training/serving with FP8), L4 (inference efficiency), T4 (budget). Providers: AWS (p4/p5, g5), GCP (a2/a3), Azure (NC/ND), Lambda Labs/CoreWeave (cheap H100s). Spot for interruptible jobs (−60-70%); on-demand for serving. Orchestration: K8s GPU Operator, node pools with taints; cluster autoscaler.`,
    concepts: [
      {
        title: "Writing production GPU images that don't lie.",
        body: `Base: nvidia/cuda:12.1-runtime-ubuntu22.04 (runtime) vs devel (compiles apex/flash-attn — needed only if building); python slim where CPU-only paths exist; install torch wheels matching CUDA (cu121 wheels on cu118 driver = segfault roulette — match wheels to driver!); weights: mount via initContainer s3 sync at pod start, or pre-baked into image only for <5GB and when pull latency acceptable; non-root USER app; EXPOSE + HEALTHCHECK curl 127.0.0.1:8080/health; .dockerignore ruthless (tests, .venv, data samples); image size targets: < 5GB; dive/hadolint in CI; the image is immutable infrastructure — no ssh-in-and-apt-install-ever; every rebuild reproducible from Dockerfile + lockfile alone.`,
      },
      {
        title: "GPU instance selection: a buyer's field guide.",
        body: `Match model to VRAM: inference 7B INT8 ≈ 8GB (A10/L4), 13B ≈ 14GB, 70B INT4 ≈ 38GB (A100 40GB or 2×A10), training 7B full FT ≈ 56GB+optim states (A100 80GB barely); T4 16GB for small embeddings/rerankers only; L4 wins price/perf for BERT-class; A10G 22-24GB for 70B INT4 or 13B fp16; H100 for pretrain/RLHF or extreme throughput serving; avoid 8×GPU nodes you can\'t fill — totter unused capacity; memory bandwidth matters for LLMs (A100 1.6TB/s > L40S); start L4/A10G, upgrade only when profiling proves necessity; instance lifecycle: spot for training with checkpointing, on-demand for serving — never serve prod traffic from preemptible nodes with no fallback.`,
      },
      {
        title: "K8s GPU scheduling without tears.",
        body: `GPU nodes tainted gpu=true; pods request nvidia.com/gpu: 1 + tolerance; nodeSelector per GPU type for heterogeneous clusters; GPU Operator manages drivers/toolkit/DCGM exporter — install it, stop hand-managing kernels; MIG (Multi-Instance GPU) on A100/H100 partitions into 7 isolated instances — pack small models, dedicated QoS, billing per slice; time-slicing for dev clusters only (no isolation guarantees); autoscaler scales GPU pools by pending-pod demand with min 1 warm node; priorities: inference pods preempt training pods (or vice versa per org policy); requests = limits (GPUs are not overcommittable) — no CPU-style burst lies; the YAML is boring; the economics are not.`,
      },
      {
        title: "Cold starts, loading latency, and warm pools.",
        body: `Container start → driver init → weights load from object storage → CUDA graph capture → ready: 15-90s for big models — unacceptable for bursty traffic; mitigations: warm pools (min 2-3 replicas always hot), weights on local NVMe via node-local cache (s3 sync 2-10GB/s), readiness gate that actually probes inference, preheat CUDA graphs/torch.compile at boot, image pull policies: imagePullPolicy Always kills you (pre-pull to nodes); scale-to-zero only for dev; latency budget: cold-start events page nobody but cost 1% of users their patience — warm your pools and your conscience; measure p99 including first-request-after-scale-event separately — it lies about your real SLO.`,
      },
      {
        title: "Cost control: the discipline that keeps finance calm.",
        body: `Tag every GPU resource (team, model, env); billing export to BigQuery/AWS CUR → per-model $/hour dashboards; utilization floor: any GPU <40% util for 7 days flagged; scheduled shutdowns for dev/staging GPU nodes nights+weekends (−55%); spot for batch inference/training with checkpoint-resume logic; reserved instances for steady serving traffic (−40-60%); right-sizing: downsize flagging monthly; model consolidation: 3 small models → one GPU with MIG slices; cost-per-1k-predictions as the universal KPI; the org where ML cost reviews happen monthly doesn\'t get surprise board slides; the one where they don\'t, does.`,
      },
    ],
    worked: [
      {
        title: "Slash GPU spend 58% with scheduling and spot.",
        body: `Fleet: 14 A100 nodes mostly idle; audit: 60% avg util, no tagging, dev nodes always-on. Fixes: MIG slices for BERT workloads (2 models/A100), spot nodes for training with checkpoints, staging auto-shutdown 19:00-08:00 weekdays, tagged everything, weekly util report; monthly GPU bill $84k→$35k with zero SLO breaches; the CFO sent a thank-you; the ML platform team added a "cost budget" field per model to the registry — accountability from next release.`,
      },
      {
        title: "Cold-start elimination for a bursty reranker.",
        body: `Nightly batch reranker: 40s first inference of the night — downstream pipeline stalled, SLA squeaked. Root cause: weights from S3 per pod, driver init serialized. Fix: initContainer sync to node-local NVMe cache (s3fs), weights pre-loaded, readiness probes inference; cold start 40s→3s; pipeline retired the buffer stage; the fix cost one day, saved the weekly "reranker slow again" meeting.`,
      },
      {
        title: "Driver mismatch bricks a flash-attn build — forever.",
        body: `Fine-tuning job crashed: flash_attn wheel built for cu121, node driver 535 supporting cu118 — illegal instruction. Fix: pin wheels to driver-supported CUDA, add build-time nvidia-smi assertion in Dockerfile, CI lint rejects mismatched pairs; the runbook entry: "it\'s always the driver" appears in bold; every future image validated against the lowest-common-denominator driver before merge; the 2 AM debug session paid for a permanent CI check.`,
      },
    ],
    exam: [
      {
        question:
          "Why must PyTorch wheels match the host driver's CUDA version, and how do you enforce it?",
        answer:
          "Wheels compiled for newer CUDA than the driver supports call kernels the driver cannot marshal — segfaults in opaque kernels, no graceful error; enforce with nvidia-smi assertions in the Dockerfile and CI, and always build for the lowest-common CUDA in the fleet.",
      },
      {
        question: "What does MIG grant you that time-slicing cannot?",
        answer:
          "True hardware isolation: dedicated SM partitions, HBM banks and L2 cache per instance — latency QoS guarantees and per-slice failure containment; time-slicing shares everything and isolates nothing — dev only, never customer traffic.",
      },
      {
        question: "Why are warm pools non-negotiable for serving GPU models?",
        answer:
          "Weight load + CUDA graph + driver init = tens of seconds of zero-throughput pod time; without baseline hot replicas, bursts meet a cold wall every time or you over-provision everything all the time — the pool is the compromise that makes elasticity affordable.",
      },
      {
        question: "Which metric stops a GPU judge blind to cost?",
        answer:
          "Utilization-weighted spend per 1k predictions per model per week — GPUs at 20% util billing full price is the silent budget fire; without the per-model attribution, optimization is guesswork and politics.",
      },
    ],
    cheat: [
      "CUDA runtime base; torch wheels match driver; weights via mount not bake.",
      "A10G/L4 for inference, A100 for training/70B INT4, H100 for pretrain/FP8.",
      "K8s GPU Operator + taints + MIG for consolidation; requests=limits.",
      "Warm pools ≥2; weights on NVMe; readiness = real inference probe; pre-pull images.",
      "Tag all GPU resources; weekly util; spot for training; shutdown non-prod nights.",
      "$/1k predictions per model — the only GPU KPI that pays rent.",
    ],
    recap: `GPU operations are fleet economics with CUDA installed: images pinned to driver-wheel law, instances mapped honestly to model size, K8s scheduling with real isolation (MIG), warm pools absorbing cold starts, and tagged utilization reported weekly — because the cheapest GPU is the one you didn\'t provision for nobody, and the fastest model is the one already warm.`,
    code: {
      title: "GPU pod skeleton",
      language: "yaml",
      code: `resources: { requests: { nvidia.com/gpu: 1 } }\nnodeSelector: { cloud.google.com/gke-accelerator: nvidia-l4 }`,
      explanation:
        "One GPU, right node, no burst fiction — the two lines every GPU pod actually needs.",
    },
    diagram: {
      title: "GPU request path",
      caption: "Pod to GPU to model.",
      mermaid: `flowchart LR\n P[Pod] --> SCHED[GPU scheduler]\n SCHED --> G[GPU slice]\n G --> M[Model loaded]`,
    },
  },
  "ai-ml-mlops-and-production-ai-monitoring-and-responsible-ai": {
    intro: `Monitoring and responsible AI keep models honest after deployment — drift detection, bias audits, explainability, and incident response when the model social-harms. The subject is the full stack: data/model/performance monitoring, drift statistics (PSI, KS), fairness slices, SHAP/LIME/attention inspection, privacy guards, and rollback protocols — because models rot in silence and fail in public. shipping a model is the beginning of its supervision, not the end of its risk.`,
    foundations: `Monitoring layers: (1) system — uptime, latency, errors, GPU; (2) data — schema drift, null rates, PSI/KL/KS vs training baseline, freshness; (3) model — output distribution drift, confidence shifts, prediction class balance; (4) business — conversion, escalation, thumbs-down, revenue correlation; (5) safety/fairness — demographic slices, toxicity, jailbreak rate, PII leak rate. Drift detection cadence: batch daily/hourly. Alerting: warning thresholds vs rollback triggers. Responsible AI toolkit: fairness (EO, DP across groups), explainability (SHAP for tabular, attention/vit inspection for transformer), redaction, consent lineage, model cards with limitations.`,
    concepts: [
      {
        title: "Drift detection that pages humans, not noise.",
        body: `Per-feature PSI vs reference window (last 7 days vs last 90): PSI < 0.1 ok, 0.1-0.25 watch, > 0.25 act; KS test for continuous, chi-square for categorical; multivariate: train autoencoder on baseline, reconstruction error spikes flag drift nobody sees univariately; prediction drift: mean predicted prob moving > 0.05, class ratio flipping; alerts must name the feature and the delta — "drift detected" without attribution gets muted; tune thresholds on historical incident retros — every false positive teaches, every missed alert owes its victims; dashboards per model with traffic-light states; drift is a fire alarm, not a smoke museum.`,
      },
      {
        title: "Fairness slices and demographic audits.",
        body: `Partition eval and live metrics by protected slices (gender, age band, ethnicity proxies where legal): accuracy, FPR/FNR, calibration per slice; the model must clear per-slice floors, not just global averages — a credit model that is 94% globally accurate and 71% for protected group X is a lawsuit wearing a lab coat; alerts on slice drift weekly; mitigation: reweighting training data, threshold-per-slice (legal review needed), feature exclusion, escalating human review for low-confidence protected cases; document every decision in the model card; consult counsel before deploying scores affecting humans materially — the tooling is technical, the liability is legal.`,
      },
      {
        title: "Explainability: useful triage vs numerology.",
        body: `SHAP: Shapley values per prediction — top contributing features shown to reviewers; excellent for regulatory justification ("why was this loan declined?"); global plots show feature importance honestly; LIME for local linear approximations — fast, fragile; attention maps — tempting but not causal; counterfactuals ("change income to 55k → approved") — the most actionable for users; limits: correlated features confound attribution — never let SHAP justify a discriminatory proxy silently; explainability for debugging drift beats explainability for ethics theater; one page per model: "how we audit it, what it cannot see" — the section legal will read first.`,
      },
      {
        title: "Privacy and PII at the boundary.",
        body: `Ingress: PII scrubbing before training/serving logs (regex + NER models); retention windows per data class; egress: output filters detecting PII leakage (credit cards, emails, SSNs) from generative models — block + alert; inference privacy: on-prem or VPC endpoints for regulated data; differential privacy for aggregate stats releases; right-to-erasure retraining procedure (identify influence of user via lineage, retrain minus their shard, or use unlearning approximations honestly disclosed); consent boundaries enforced at feature level; logs: hash user IDs, never raw prompts with PII; the audit asks: "show me the last PII we served and forgot to scrub" — the answer better be zero and provable.`,
      },
      {
        title: "Incident response and rollback drills.",
        body: `Triggers: thumbs-down spike > 25% over baseline for 15 min, PII leak detected, toxicity above threshold, latency breach, drift beyond 0.25; response runbook: (1) alias flip to previous champion (2 min), (2) post-flip validation suite, (3) comms to stakeholders within 30 min, (4) root cause within 24h, (5) regression test added before re-promotion; game days quarterly: inject drift in staging, time the response; blameless postmortems; the uncomfortable truth: every mature ML org reaches "rollback first, understand later" — because minutes of wrong predictions cost more than hours of investigation; rehearse it or improvise it, choose.`,
      },
    ],
    worked: [
      {
        title: "PSI alarm catches a silent upstream schema drift.",
        body: `Fraud model precision slid 4 points over two weeks, no obvious bug. PSI dashboard: feature "transaction_hour_z" jumped to 0.31 — upstream had silently switched from UTC to local time; model retrained on baseline... no — fix was normalize back at feature pipeline; replay shadow traffic confirmed recovery; incident 3 hours end-to-end; without PSI, the drift discovered three weeks later at the chargeback audit; the monitor paid for itself in one catch; the upstream vendor got a new SLA clause.`,
      },
      {
        title: "Slice audit reveals loan model unfairness.",
        body: `Approval-rate gap: female applicants 11% lower approval at identical income; investigation: feature "commute_time" proxying for zip (gender-correlated); mitigation: drop commute_time, add direct income verification tier, retrain, gap closes to 2% (noise floor); external audit passes; the feature nobody questioned was a gender proxy wearing a commute; the slice-audit step in the promotion gate found what global accuracy never could.`,
      },
      {
        title: "PII leak filter catches a frontier model verbatim echo.",
        body: `Support assistant occasionally parroted customer emails including card numbers from context. Output filter (regex + validator): blocks response, logs incident, swaps to safe fallback answer; 23 occurrences in first month — all contained; root cause: context included full emails without redaction; fix: ingress scrubber + output tripwire dual layer; zero since; the finding drove company-wide PII handling review; the near-miss made anyone deploying LLMs think twice about context hygiene.`,
      },
    ],
    exam: [
      {
        question:
          "Why is univariate PSI insufficient as the only drift signal?",
        answer:
          "Feature interactions can drift while marginals stay tame — a joint shift visible only in conditional distributions slips past per-feature monitors; multivariate autoencoder reconstruction error or MMD closed the gap on every serious incident review we have run.",
      },
      {
        question:
          "Why do global accuracy scores mislead responsible deployment?",
        answer:
          "They average away failure — a model can be 90% overall while failing a minority slice catastrophically; per-slice FPR/FNR and calibration floors are the minimum honest report; anything else is compliance theater with a certificate.",
      },
      {
        question:
          "Why roll back before root-causing on critical model incidents?",
        answer:
          "Every minute of degraded serving compounds user harm and legal exposure linearly — alias flip is 2 minutes, investigation is hours; revert first, dissect second, re-promote only with regression proof; the model can wait, the users cannot.",
      },
      {
        question:
          "What is the strongest argument for exit filter layers on generative egress?",
        answer:
          "Ingress scrubbers fail (encode in base64, split across tokens, obfuscate) — an egress tripwire is the last net for PII and toxicity regardless of how it slipped in; dual-layer is how you sleep before launch day.",
      },
    ],
    cheat: [
      "PSI/KS per feature vs 90d baseline; multivariate MMD for stealth drift.",
      "Per-slice FPR/FNR/calibration floors in every promotion gate.",
      "Egress scan: PII, toxicity, jailbreak echoes; block + alert + fallback.",
      "SHAP for adjudication; counterfactuals for appeals; never proxy secrets.",
      "Triggers → alias flip → validate → comms 30 min → RCA 24h → regression test.",
      "Quarterly game days; drift drills; the runbook must exist on paper.",
    ],
    recap: `Responsible monitoring is permanent vigilance with rollsback muscles: PSI and multivariate drift tripwires, fairness slices with floors, egress PII nets, explainability grounded in SHAP and counterfactuals, and rehearsed rollback-first incident response — because the model in production is not finished, it is adopted, and the only acceptable failure is the one you rehearsed.`,
    code: {
      title: "Egress tripwire sketch",
      language: "python",
      code: `if pii_detector.has_card(response) or pii_detector.has_email(response):\n    log_incident()\n    return safe_fallback`,
      explanation:
        "The last line of defense between your LLM and a headline — one regex-and-NER heartbeat, every request.",
    },
    diagram: {
      title: "Monitoring layers",
      caption: "System, data, model, business, safety.",
      mermaid: `flowchart TD\n S[System health] --> D[Data drift]\n D --> M[Model drift]\n M --> B[Business KPIs]\n B --> F[Fairness and safety]`,
    },
  },
  "ai-ml-mlops-and-production-ai-interpretability-and-explainability": {
    intro: `Interpretability is understanding what models actually compute — features, attention, decisions — versus what we hope they compute. The subject is the practitioner\'s toolkit: linear probes, feature attribution, attention analysis, concept bottlenecks, and honest limits — because in regulated domains "it works, don\'t ask how" is not an acceptable answer, and in science "we don\'t know" is unacceptable too. a model you cannot read is a black box with opinions — interpretability is how we audit its opinions.`,
    foundations: `Technique classes: (1) intrinsic — inherently interpretable models (GAMs, decision trees, concept bottleneck); (2) post-hoc local — SHAP/LIME/counterfactuals per prediction; (3) post-hoc global — feature importance, partial dependence, Friedman H-statistic interactions; (4) mechanistic — circuits, probing internal representations, activation patching (covered in Deep Learning); (5) causal methods — do-operators, instrumental variables. For LLMs: probe classifiers on hidden states (linear probes detect stored knowledge), sparse autoencoders decompose superposition, attention rollouts (with caution). Regulatory contexts (credit, hiring, diagnosis) demand compliant explainability, not slide decks.`,
    concepts: [
      {
        title: "SHAP in practice: reading the per-prediction verdict.",
        body: `KernelSHAP (model-agnostic) or TreeSHAP (exact for trees — fast, use always for GBMs); output: per-feature contribution pushing prediction toward/away from outcome; local plots for individual decisions (loan officer view); global bar chart for feature importance honestly — beware correlated features splitting credit unfairly (use perm-importance cross-check); interaction values reveal pairs (income × debt); waterfall plots for appeals — "income added +18%, zip −31%"; limits: SHAP explains the model, not reality — a wrong model explained perfectly is still wrong; use for triage and audit, never as causal proof.`,
      },
      {
        title: "Linear probes on LLM hidden states.",
        body: `Train a logistic regression on frozen activations at layer L to predict concept C (honesty, toxicity, syntax role): if probe accuracy high, model "represents" the concept somewhere in that layer; sweep layers to find where; causal check: patch probed direction into new examples — does behavior flip?; applications: detecting deception cues, measuring representation quality across fine-tunes; caveats: probes find what they seek (correlated signal); superpositions mean many concepts per neuron — linear probe sees the dominant one; combine with SAE decomposition for cleaner reads; best used as measurement instruments across training, not as verdict machines.`,
      },
      {
        title: "Concept bottleneck models for regulated domains.",
        body: `Architecture: inputs → human-interpretable concepts (has_hollow_log? trunk_diameter_cm?) → prediction — concepts are auditable by domain experts, and intervention possible ("set hollow_log=true" → watch prediction change); training: when supervision available, joint loss; when not, unsupervised concept labels with human naming post-hoc; costs: slightly lower accuracy (2-5% typical), concept labeling labor; wins: regulatory pass (EU AI Act high-risk credit/medical), debugging trust, intervention-based what-ifs without retraining; the strongest evergreen pattern for "the model must explain itself to a regulator" — explain before it ships, not after the lawsuit.`,
      },
      {
        title: "Partial dependence and interaction landscapes.",
        body: `PDP: marginal effect of feature on prediction, averaging others — global shape (monotone? threshold? U-shape?); ALE (accumulate local effects) for correlated features — prefer ALE when features interact strongly (PDP lies there); H-stat: interaction strength per pair — find which pairs drive deltas (income×education vs income×age); ICE curves: per-instance lines — reveals heterogeneous subpopulations masked by averages; use for fairness forensics (does age curve differ by gender?), monotonicity constraints for physics-true models, and sanity checks (negative prediction for positive income is absurd — investigate); plot before you deploy; plot when you drift; plot when you doubt.`,
      },
      {
        title: "Honest limits: what interpretability cannot deliver.",
        body: `Attribution ≠ causation (correlated #1 features are frequent); explanations can be post-rationalized by the model itself (LLM narratives unreliable); faithfulness vs plausibility distinction — an explanation can sound right and be wrong; high-dimensional entanglement defeats unitary attribution; compute cost of exact methods (Shapley exponential) forces approximations; the discipline: never market explanations as ground truth; measure explanation stability (same input, small perturbation → same explanation?); track explanation consistency across model versions; document what was validated and what was asserted — in the model card, with links; the alternative — unverifiable opacity — is not discipline, it is hope with a GPU.`,
      },
    ],
    worked: [
      {
        title: "SHAP wins the regulator meeting in one chart.",
        body: `Credit-denial appeal: applicant demands reasons. SHAP waterfall: top detractors — short credit history (−22%), high revolving utilization (−18%), recent hard inquiry (−9%) — exported as PDF in plain language; appeal resolved in 15 minutes with full audit trail; regulator inspector visited, saw the SHAP pipeline + ALE monotonicity on income; approved the lender's fairness program on the spot; the chart was the product; the lender's compliance budget survived the decade.`,
      },
      {
        title: "Probe reveals the model memorized the answer key.",
        body: `Triage LLM testing: probe accuracy for "label=approve" at layer 5: 94% before any task structure — the model was latching onto spurious dataset-artifact markers; intervention: retrain with artifact-disjoint splits; probe drops to 71% (still above chance — deeper signal exists); deployed version generalized 6 points better on real traffic; the same probe ran nightly on fine-tune candidates — contamination detector as unit test; the quarterly model review now includes probe tables.`,
      },
      {
        title: "Concept bottleneck ships for radiology triage.",
        body: `FDA-adjacent deployment: model suggests study priority; bottleneck concepts: nodule_size, opacity_density, margin_irregularity — radiologist-verified labels; model trained concept→priority; accuracy 91% (vs 94% black-box — acceptable); clinicians trust it because they can audit each concept; disagreements resolved by concept review, not model dismissal; the hospital adopted for three modalities; the black-box alternative never got past ethics board twice.`,
      },
    ],
    exam: [
      {
        question:
          "Why are SHAP values misinterpreted as causal contributions, and what is the correct reading?",
        answer:
          'Shapley distributes joint prediction change over correlated features — it answers "how would removing knowledge of this feature change this prediction", not "what happened in the world" — read as model accounting within a covariance matrix, not as physics, and causal claims require separate machinery.',
      },
      {
        question:
          "Why prefer concept bottleneck models when auditors demand explanations?",
        answer:
          "They make explanation structural — every prediction decomposes into human-checkable intermediate claims — turning post-hoc rationalization into inspectable machinery; regulators sign off on claims they can verify, not narratives they must trust.",
      },
      {
        question:
          "What failure mode do probes detect that validation accuracy cannot?",
        answer:
          "Shortcut learning — spuriously easy signal the model exploits (watermarks, file-order, formatting artifacts) — invisible to held-out accuracy but instantly visible as inflated probe separability at early layers; it is the silent killer of ML boasting.",
      },
      {
        question: "Why do ALE plots complement PDP for correlated features?",
        answer:
          "PDP averages over feature ranges that never co-occur with correlated partners, inventing nonsense rows; ALE accumulates local gradients within actual data support — honest even under strong correlation; when features correlate, ALE is the chart, PDP is fiction.",
      },
    ],
    cheat: [
      "TreeSHAP for trees; counterfactuals for appeals; ALE for correlated.",
      "Probes sweep layers; causal patch to confirm; use as drift alarms.",
      "Concept bottleneck for regulated predictions; pay 2-5% accuracy for audit.",
      "PDPs + ALE + H-stat before every deploy; monotonicity constraints when physics demands.",
      "Stability-check explanations on perturbations; document limits in model card.",
      "Plausible ≠ faithful; never sell story as mechanism.",
    ],
    recap: `Explainability is the bridge between model competence and human accountability: SHAP and counterfactuals for per-case adjudication, ALE/PDP landscapes for global sanity, probes and activation logic for mechanistic visibility, concept bottlenecks when regulation demands audit-ready anatomy — all bounded by the discipline of knowing where explanation ends and evidence begins, because the worst harm an overconfident explanation causes is the harm you believed was understood.`,
    code: {
      title: "TreeSHAP explanation",
      language: "python",
      code: `ex = shap.TreeExplainer(model); sv = ex(X)[0]`,
      explanation:
        "Per-feature contribution for one prediction — the artifact legal actually files.",
    },
    diagram: {
      title: "Interpretability stack",
      caption: "Model in, plate in, reasons out.",
      mermaid: `flowchart TD\n M[Model] --> S[SHAP or probes]\n S --> A[Audit or appeal]`,
    },
  },
  "ai-ml-mlops-and-production-ai-feature-stores-in-production": {
    intro: `Feature stores are the missing middle between data engineering and model serving — one definition, two consumption paths, zero skew. The subject is hands-on deployment: offline stores for training data, online stores for millisecond inference, point-in-time correctness, monitoring freshness and drift, and the decision framework for when a feature store is overkill. the same feature must mean the same thing at training and at inference — or your model is learning lies.`,
    foundations: `Architecture: offline store (lakehouse/parquet, full history, point-in-time joins for training), online store (Redis/Dynamo/BigTable, latest value per entity, <10ms reads), registry (schema, owner, freshness SLA, lineage), transformation layer (stream processors or batch — Flink/Spark/dbt). Tools: Feast (open source, battle-tested), Tecton (managed), Databricks Feature Store, SageMaker Feature Store. Guarantees: training-serving symmetry, backfills, time-travel features. Adoption signals: 3+ models share features, skew bugs recurring, or regulatory lineage demanded — fewer than that, it is astronautics.`,
    concepts: [
      {
        title: "Point-in-time correctness: the silent bug killer.",
        body: `Training set built from features must use values known at prediction time — join keys with as_of timestamps; leakage otherwise (feature includes outcome!); every serious store implements it; typical trap: computing "avg_basket_30d" at end of month for label period earlier — the answer leaks; Feast: joins request rows with entity keys + timestamps against offline tables with event_timestamps, correct as-of semantics enforced; validation: sample predictions with replay vs fresh query — must match bit-wise or the store is decorative; this one guarantee justifies the whole enterprise.`,
      },
      {
        title: "Feast vs managed: the build/buy fork.",
        body: `Feast: YAML feature repos (registry), offline parquet/S3, online Redis; free, upgradable, K8s-native; costs: self-ops (Redis HA, backfill jobs, monitoring); Tecton: stream/batch unify, auto materialization, SOC2/HIPAA, support SLAs — expensive, enterprise; Databricks FS: native to Unity Catalog + Delta — natural if you live there; SageMaker FS: AWS lock-in convenience; decision matrix: team size <5 → Feast or Databricks; compliance-heavy finance → Tecton; hyperscaler house → native store; don\'t adopt before the pain is measured — adoption for fashion is the classic two-year detour with zero payoff.`,
      },
      {
        title: "Freshness, backfills, and materialization.",
        body: `Feature pipelines materialize: batch hourly/daily (scheduled), stream sub-second (Flink on Kinesis/Kafka); freshness SLA per feature (seconds to 24h); monitoring: last-updated timestamp vs SLA → page on breach; backfills: recompute history when definitions change — requires offline replayability, idempotent jobs, and checksum verification per partition; point: feature change = model retraining, not just redeploy — version features like schemas (fleet migration plans); test materialization in CI with tiny fixtures; stale features kill models faster than bugs — the graph of "freshness violations per week" belongs in every MLOps review.`,
      },
      {
        title: "Online serving performance and HA.",
        body: `Entity-keyed lookup <5ms p99: Redis cluster with replica reads for scale; key design: tenant:entity:feature_name (hash tags for slot discipline); TTLs by freshness; pipeline multiple features in one call (multi-get); warm-up on deploy (preload hot entities); degraded mode: serve last-known-good with staleness header when store hiccups (fail-open vs fail-closed per feature — revenue features fail-open, safety features fail-closed); chaos-test the store kill quarterly; the store is on the hot path of every prediction — treat its SLA like the database\'s.`,
      },
      {
        title: "Governance and feature economics.",
        body: `Registry hygiene: every feature has owner, SLA, description, source-of-truth table; unused features decommissioned quarterly; PII-tagged features excluded from insecure stores; feature sharing across teams reduces duplicate pipelines (count: 400 features, 60 shared, saved 12 pipeline-years estimate); cost accounting: $ per feature query (online) → chargebacks; feature quality scores (missing rate, drift PSI, freshness SLA attainment) curated; the org-level win: new model onboarding drops from 3 months to 3 weeks when 70% of features arrive pre-validated — the store is compound interest on engineering time.`,
      },
    ],
    worked: [
      {
        title: "Skew measured and eliminated with Feast in 3 sprints.",
        body: `Churn model: offline AUC 0.87, prod 0.74. Diagnosis: three features subtly different (rounding, timezone for session_start, UTC vs local); Feast rollout: definitions in repo → offline materialization nightly → online Redis → train-serve identical path; shadow deploy; prod AUC 0.86 — recovered 12 points; the incident report was two pages, the fix permanent; the store now gates every new feature with a skew unit test.`,
      },
      {
        title: "Backfill of 26 months after a fraud-feature fix.",
        body: `Feature "chargeback_rate_90d" bug (window off by one day) discovered post-launch; fix deployed; backfill: recompute 26 months history over 4.8B rows via Spark on the lakehouse; replay validation: sample 10k historical predictions, all match retrained models; online store hot-swapped at 02:00 UTC with zero traffic impact; the entire operation scripted, rehearsed on a 1% sample twice; the team called it "the backfill that should never happen again" — and documented it for the next team.`,
      },
      {
        title: "New pricing model ships in 3 weeks thanks to shared features.",
        body: `New team; model concept: price-elasticity predictor; 60% of its features already in the store from churn/upsell work; onboarding = define 11 new features + point-in-time join + train; no new pipelines; timeline 3 weeks vs the 3-month norm; the retro said it plainly: the store was the product; the models were guests.`,
      },
    ],
    exam: [
      {
        question:
          "Why is point-in-time correctness non-negotiable in feature stores?",
        answer:
          "Without it, features see the future during training — models learn from their own answer key; accuracy looks spectacular, reality disagrees; as-of joins with event timestamps enforce that every training row carries only knowledge available at prediction time — the line between prediction and leakage.",
      },
      {
        question:
          "Why must feature definitions be versioned like database schemas?",
        answer:
          "A feature's meaning (window size, aggregation, timezone, normalization) changes with business logic — silent evolution breaks every consumer; semantic versioning + migration plans treat feature change as fleet-wide coordinated deploy, not Slack announcements.",
      },
      {
        question:
          "When do managed feature stores beat open-source ones, honestly?",
        answer:
          "When compliance (HIPAA/SOC2/data residency), multi-cloud consistency or guaranteed SLAs are contractual requirements and your team is small — Tecton's premium buys audit and ops you'd otherwise build for a year; below that size and risk, Feast suffices and teaches you what you actually need.",
      },
      {
        question:
          "What does fail-open vs fail-closed mean on the online store hot path?",
        answer:
          "Revenue/tolerant features: serve last-known-good cached value (fail-open) to keep predictions flowing; safety/PII features: block prediction entirely (fail-closed) rather than leak or misfire — the choice is per-feature, documented, and tested under store-kill chaos drills.",
      },
    ],
    cheat: [
      "Point-in-time joins or it didn't happen; bit-wise replay validation.",
      "Feast: repo + parquet offline + Redis online; start here.",
      "Freshness SLA per feature; page on breach; kill stale features.",
      "Backfills scripted + rehearsed at 1% before full replay.",
      "Feature registry: owner, SLA, PII tags; quarterly decommission.",
      "3+ models sharing features before building — or borrow a neighbor team's.",
    ],
    recap: `Feature stores are write-once-serve-everywhere infrastructure with teeth: point-in-time offline truth, millisecond online truth, one definition eliminating skew forever, freshness monitoring and versioned migrations as operating discipline — the leverage point where a company stops paying for the same feature four times in four pipelines, and starts shipping models at product speed.`,
    code: {
      title: "Feast retrieval",
      language: "python",
      code: `features = store.get_online_features(features=['user_stats:sessions_l7d'], entity_rows=[{'user_id': uid}]).to_dict()`,
      explanation:
        "Milliseconds, one definition, every model — the entire value proposition in one call.",
    },
    diagram: {
      title: "Feature store anatomy",
      caption: "Offline history, online truth.",
      mermaid: `flowchart TD\n OFF[Offline store] --> REG[Registry]\n ON[Online store] --> REG\n REG --> TR[Training]\n REG --> SRV[Serving]`,
    },
  },
  "ai-ml-mlops-and-production-ai-end-to-end-ml-projects": {
    intro: `End-to-end ML projects are where all the pieces meet — problem framing, data, model, evaluation, deployment, monitoring, iteration — as one shippable product rather than a parade of isolated tools. The subject is the full life cycle with real decisions: scoping, success metrics, build order, stakeholder negotiation, staged rollout, and the retrospective discipline that makes the second project cheaper. a model nobody can use is an expensive souvenir — projects ship when the whole loop works, not when the notebook looks good.`,
    foundations: `Lifecycle: (1) frame — business problem to ML problem, success metric (business, not AUC alone); (2) data — audit, label, baseline; (3) baseline model — logistic/GBM, measure honestly; (4) iterate — features, architecture, only where baseline shows headroom; (5) shadow — live traffic, zero exposure; (6) canary — 1-10% with guardrails; (7) full rollout + monitoring; (8) iterate or retire. Kill criteria defined up front ("if lift < 2% at 99% confidence, we stop") — most ML projects should die young and cheaply. Stakeholder management: PMs want timelines, engineers want certainty, legal wants answers — deliver all three or deliver none.`,
    concepts: [
      {
        title: "Framing: the make-or-break first two weeks.",
        body: `Wrong: "build a churn model." Right: "identify at-risk enterprise accounts 45 days before contract expiry with ≥70% precision so the CS team can intervene — success = 8% rescue rate on flagged cohort, kill if < 3%." Now everything has targets: data horizon (events T-45..T-0), features (usage drop, support tickets, NPS), labels (did contract renew?), baseline (simple rules: usage < 30% of prior → flag; beat it by ≥15% precision), serving (weekly batch scoring, CRM push), owners. Every end-to-end success in my career traced to a framing session like this; every disaster traced to skipping it.`,
      },
      {
        title: "The build order that de-risks reality.",
        body: `First: label audit — are the labels even sane? (30-40% of enterprise ML dies here: outcome definitions inconsistent). Second: pipeline from raw → features → training set reproducible end-to-end on one command. Third: baseline within days — if rules beat model, stop, improve features, not algorithms. Fourth: proper eval — time-split validation, bootstrap CIs, slice metrics. Only then: model iteration; each loop measured against the baseline, each accepted change committed with its number. Any step skipped = discovery moved into production, where it is 1000x more expensive. The order is a discipline, not a preference.`,
      },
      {
        title: "From notebook to service without the cliff.",
        body: `Stage the migration: (1) training script parameterized + config file, (2) DVC-tracked data snapshot, (3) MLflow run registry, (4) inference wrapped in FastAPI with canary flags, (5) shadow mode in prod (no answers served), (6) compare shadow vs champion on live traffic with logged outcomes, (7) promote via alias with 5% canary, (8) ramp by error/thumbs guardrails; each stage one week; nothing skipped; the team that rushes step 6 ships a model that works in the lab and hallucinates in the wild; the artifact of step 8 is a model card with live numbers, not a slide deck.`,
      },
      {
        title: "Guardrails, canaries, and the kill switch.",
        body: `Define rollback triggers before launch: p95 latency +20%, error rate 1%, thumbs-down +30% relative, business KPI dips > X% for 2 windows, PII leak (immediate global rollback); canary by consistent user hash (no mid-session flips); shadow logs replayed nightly for regression; kill switch wired to registry alias — 2-minute revert; alert routing: page on guardrail breach during business hours, autorollback overnight; comms template ready; the deploy that goes well is the one where everyone knew what "bad" looked like before the first request landed.`,
      },
      {
        title: "Retrospectives and institutional memory.",
        body: `48h after full rollout: retro with business + eng + data — what surprised us (data freshness lag nobody flagged), what we\'d skip (premature Transformer), what deserves a playbook (champion-challenger promotion); outputs: updated model card, runbook deltas, monitoring additions, wiki page; measured outcomes vs pre-registered targets — report honestly to the sponsor, even when flat; projects that plateau educate the org more than wins do; every retro\'s most valuable sentence is "we will never XYZ again" — collect them; the org that accumulates them runs its third project at triple speed.`,
      },
    ],
    worked: [
      {
        title: "Churn rescue program: framed, shipped, measured in 9 weeks.",
        body: `Framing 3 sessions: target 2,800 enterprise accounts at risk; labels from CRM loss reasons (86% clean); baseline rule score 63% precision — ML target 78%; features 14 (usage decay, ticket sentiments, QBR staleness); LightGBM week 2: 79.4% shadow; 3 weeks soak: recall stable; canary 10%: save rate 9.1% (target 8%); full rollout; at-risk ARR saved Q1: $4.2M attributed; kill criteria never approached; the postmortem made this the template for all CS-ML projects; the VP who sponsored it got promoted; the team framed the next two projects that afternoon.`,
      },
      {
        title: "The project that died right — and saved $300k.",
        body: `Fraud-submodel proposal; framing revealed: labels 61% noisy upstream and the vendor already blocks 94% — incremental value capped at 1.8% of losses; baseline test + shadow: 0.6% realized; kill criteria tripped at week 3; project closed, team redirected; saved roughly $300k of compute+headcount vs the 6-month grind everyone else would have completed; the lesson canonized: "kill early is a feature"; the ROI slide of this org now counts stopped projects next to shipped ones.`,
      },
      {
        title: "Shadow mode caught a 40% slice failure before canary.",
        body: `Support-bot intent router; offline metrics superb; shadow week: on Spanish-language tickets, confidence collapse, escalations tripled — training corpus 3% Spanish; fix: 6k examples + slice re-eval; canary cleared at 92% per-slice accuracy; without shadow, first real Latino customers discovered it in production; the shadow period cost nothing and saved face, churn and two escalations to legal; the checklist now says: new language slices always shadow-validated first.`,
      },
    ],
    exam: [
      {
        question:
          "Why do end-to-end ML projects succeed or fail in the framing, not the model?",
        answer:
          "Framing sets the metric, the success bar, the kill criteria, the audience and the adoption path — a gorgeous model optimizing the wrong proxy or facing unmeasurable success ships nothing, regardless of AUC; the work is deciding what to build, not how.",
      },
      {
        question: "Why is a shadow phase mandatory before any canary?",
        answer:
          "Offline metrics live in the past; production reveals case distributions offline never modeled — Spanish slices, consent-missing users, holiday surges; shadow collects ground truth without user exposure — the one cheapest way to learn without bleeding.",
      },
      {
        question: "What belongs in kill criteria and why pre-register them?",
        answer:
          "Pre-committed thresholds (lift vs baseline with confidence bounds, latency budgets, slice floors) written before results exist — removing the sunk-cost gravitational pull and granting permission to stop while stopping is cheap; surprises are not criteria.",
      },
      {
        question: "Why is shadow-to-canary promoted via consistent user hash?",
        answer:
          "Same user always sees the same model — no mid-session incoherence, clean comparison cohorts, and honest guardrail metrics; random per-request assignment destroys both UX and statistical attribution.",
      },
    ],
    cheat: [
      "Frame: outcome, window, labels, baseline to beat, kill criteria — before data.",
      "Build order: label audit → pipeline → baseline → eval → iterate.",
      "Migrate: param → DVC → MLflow → FastAPI → shadow → canary → ramp.",
      "Guardrails pre-defined; alias flip rollback; hash-consistent canaries.",
      "Retros with numbers vs targets; honest sponsor reports; wiki the scar tissue.",
      "Kill early and cheaply — celebrated like launches.",
    ],
    recap: `End-to-end ML is a product discipline with gradient descent inside: framing as contract, baselines as honesty serum, shadowing as risk containment, canaries with pre-written guardrails and a kill switch wired to the registry, retros that encode the cost of lessons — because the ML lifecycle that matters is not epochs, it is evidence accumulating toward decisions people trust.`,
    code: {
      title: "Promotion guardrail check",
      language: "python",
      code: `if thumbs_down_rate > 1.3 * champion_rate: flip_alias('champion'); page_oncall()`,
      explanation:
        "The rollback you hope to run never runs — the readiness is the point.",
    },
    diagram: {
      title: "End-to-end pipeline",
      caption: "Frame, build, shadow, canary, monitor.",
      mermaid: `flowchart LR\n F[Frame] --> B[Build]\n B --> S[Shadow mode]\n S --> C[Canary]\n C --> M[Monitor]`,
    },
  },
  "ai-ml-mlops-and-production-ai-inference-optimization": {
    intro: `Inference optimization is the craft of making models fast and cheap to serve without butchering quality — quantization, distillation, compilation, KV-cache mastery, and millimeter-level latency engineering. The subject is the systematic playbook: profile first, optimize the bottleneck in order (batch → precision → kernels → architecture), and measure what your users actually feel. an unserved model is a science project — latency budgets decide which models become products.`,
    foundations: `Optimization layers: (1) batching (static/dynamic/continuous), (2) precision (fp32 → bf16/fp16 → INT8 → INT4/NF4/FP8), (3) kernels (fused attention/flash-attn, CUDA graphs via torch.compile/TensorRT), (4) architecture (MoE sparsity, smaller distilled students, pruning), (5) systems (KV-cache management, prefix caching, speculative decoding, pager engines like vLLM/SGLang). Budgets: TTFB (time to first token), TPOT, p50/p95; targets per product class. Rule: measure tokens/sec and $/1k tokens before and after every change; optimizations that don't move the product metric don't ship.`,
    concepts: [
      {
        title: "The optimization order: never start with quantization.",
        body: `Step 1: profile — where does time actually go? (attention? MLP? memory bandwidth? Python overhead?); Step 2: raise batch/concurrency — free throughput until latency budget strains; Step 3: precision downgrade with eval gate (fp32→bf16 always; INT8 next; INT4 with AWQ/GPTQ when eval clears); Step 4: kernel replacement (naive PyTorch → flash_attn-2/3, torch.compile, TensorRT-LLM); Step 5: architectural — distill, prune heads, MoE; reversing this order wastes weeks — quantization of a Python-overhead-bound model gains nothing; profile flamegraphs decide everything; no optimization without a before/after benchmark artifact attached to the PR.`,
      },
      {
        title: "TensorRT-LLM and torch.compile: the compiler wars.",
        body: `torch.compile(model): fuses elementwise ops, picks matmul kernels, CUDA graphs — 1.3-2x typical, zero architecture change, PyTorch-native debugging; friction: graph breaks on control flow, rare silent numerical drift (validate!). TensorRT-LLM: NVIDIA\'s engine builder — converts to explicit engine graph with kernel selection per layer (fused MHA, in-flight batching, FP8 on Hopper); gains: 2-4x on LLMs + FP8 support; costs: build step (minutes to hours), engine portability (per-GPU-arch rebuild), and pain with dynamic shapes — mitigate via bucketing. SGLang/vLLM sit on the same class of tricks with Python-level APIs and continuous batching baked in; for serving, vLLM/SGLang > raw TensorRT-LLM in velocity, TensorRT > both in raw max if you can afford the build.`,
      },
      {
        title: "Paged KV cache, prefix reuse, and prefix caching economics.",
        body: `KV cache = the dominant dynamic memory at long context; PagedAttention treats it as virtual pages (512 tokens/page, non-contiguous) — near-zero fragmentation waste; continuous reuse across requests: prompt-cache identical system prefixes (hit rate 70-90% in agentic products) — vLLM/SGLang automate; shared prefixes (RAG templates, tool schemas) cost almost nothing after first compute; per-tenant isolation respected via cache salts; economics: 10x prefix hit rate = 10x effective capacity for RAG-heavy traffic; monitor hit rates weekly; the cache is invisible infrastructure users pay for whether you enable it or not.`,
      },
      {
        title: "Speculative decoding and the latency illusion.",
        body: `Draft model (small, fast) proposes k tokens; target verifies in one pass in parallel — accepted prefix joins output; acceptance rate 60-80% typical on code/structured text; speedup 1.5-2.5x on memory-bound decode; selection of draft: same tokenizer, distilled, aligned by SFT; self-speculative (early-exit layers of the same model) avoids second model entirely; failures: low acceptance on creative/open-ended diversity — measure, don\'t guess; big win on long generations (code, JSON), tiny on 10-token answers; the free lunch exists exactly where decode dominates; TTFB unchanged (prefill is separate).`,
      },
      {
        title: "Distillation to smaller students: the permanent fix.",
        body: `When serving cost must drop 5-10x rather than 1.5x: train a student (0.5B-4B) on teacher outputs (responses + rationales); usually 70-90% of teacher quality on narrow domains; students skip KV-cache machinery complexity by being small; distill-then-quantize stacks multiplicatively (student 2B + INT4 ≈ 1.1GB — CPU-servable!); the catch: narrowing — general chat quality collapses, narrow tasks thrive (triage, extraction, structured Q&A); the shipping decision: 70B teacher for reference + 2B student for the hot path; regenerate student against fresh teacher every quarter — the flywheel compounds.`,
      },
    ],
    worked: [
      {
        title: "Cut RAG chatbot p95 from 4.2s to 900ms in two weeks.",
        body: `Baseline: vLLM fp16, 8 concurrent users, 3.8s p95. Fixes in order: prefix cache on system+RAG template (hit 84%, prefill −60%); dynamic batch window 10ms; bf16 → INT8 KV cache (eval delta 0.0); speculative decode with 1.3B draft (acceptance 71%, TPOT −35%); total: p95 4.2s → 880ms; $/1k requests −57%; quality parity on 300-item golden suite; the two-week sprint made the product usable on free tier; the playbook got written back into the serving template.`,
      },
      {
        title: "TensorRT engine vs vLLM for a fixed workload.",
        body: `Structured extraction service, 40 QPS constant, Llama-3-8B. vLLM: 2100 tok/s/A10, p95 620ms. TensorRT-LLM engine (INT8, fused MHA, in-flight batching): same A10, 3400 tok/s, p95 380ms; build time 4 hours; daily rebuild on driver upgrades — accepted; the call: TensorRT wins for frozen high-volume workloads, vLLM for fluid multi-model estates; both ran in prod; the choice is operational, not theological.`,
      },
      {
        title: "Distill 70B → 1.5B for nightly batch classification.",
        body: `Backlog: 2M docs to classify weekly, 70B too slow for the window. Teacher-labels 5k gold + 200k silver, student 1.5B fine-tune: 96% teacher agreement on test; INT4 deploy on 3 CPU nodes, nightly completion 9h → 3.5h; GPU freed entirely; humans review only 2% disagreement bins; the cost: two weeks of engineering; the payoff: the workload literally never needed a GPU again; the off-peak inference era had arrived quietly.`,
      },
    ],
    exam: [
      {
        question:
          "Why must profiling precede quantization in any optimization sequence?",
        answer:
          "Quantization accelerates math, not overhead — if Python dispatch or launch latency dominates, int4 merely produces wrong answers faster; the profiler reveals the true bottleneck; working on the measured 80% of time, in order, compounds 5-10x real gains that randomized optimizations never reach.",
      },
      {
        question:
          "What does paged KV cache eliminate that contiguous allocation suffers?",
        answer:
          "Internal and external fragmentation — variable sequence lengths strand unusable gaps; paging allocates fixed blocks on demand, eliminating the 30-60% memory waste that caps batch sizes; bigger batches emerge from the same VRAM with zero model changes.",
      },
      {
        question:
          "Why does speculative decoding help decode-bound work more than prefill-bound?",
        answer:
          "Decode generates one token per memory-bound pass; verifying k draft tokens in one pass amortizes that pass k-fold; prefill is compute-bound parallel work already — no draft can shorten it; target the serial phase or don't bother.",
      },
      {
        question:
          "Why is distillation the only lever giving 5-10x rather than 1.5-2x?",
        answer:
          "All other techniques optimize the same computation graph — they shave constants; replacing the model with a smaller student replaces the graph itself; quality trade is domain-limited, and the savings multiply with every downstream layer of the stack.",
      },
    ],
    cheat: [
      "Profile → batch → precision → kernels → architecture; in that order.",
      "torch.compile free-ish; TensorRT for frozen workloads; vLLM for estates.",
      "Prefix cache RAG templates; paged KV eliminates fragmentation.",
      "Speculative decoding for long outputs; distill for the 10x lever.",
      "Eval gate on every precision drop; attach benchmark artifact to PR.",
      "Measure $/1k requests — the only score that makes CFOs nod.",
    ],
    recap: `Inference optimization is budgeted ruthlessness: profile before touching anything, exploit batching and prefix caching first, descend the precision ladder with eval gates, then reach for kernel compilers and distillation for the order-of-magnitude wins — shipping exactly the speed the product needs at the price users tolerate, never more, never less.`,
    code: {
      title: "torch.compile one-liner",
      language: "python",
      code: `model = torch.compile(model)`,
      explanation:
        "One line for 1.3-2x on most stacks — the cheapest optimization in existence, so run it before anything heroic.",
    },
    diagram: {
      title: "Optimization pipeline",
      caption: "Profile to batch to precision to kernels to ship.",
      mermaid: `flowchart LR\n P[Profile] --> B[Batching]\n B --> Q[Precision]\n Q --> K[Kernels]\n K --> D[Deploy]`,
    },
  },
};

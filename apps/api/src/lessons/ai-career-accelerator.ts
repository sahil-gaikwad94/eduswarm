import type { TopicLesson } from "../topicLessons.js"; /** * AI Career Accelerator — 4 authored topic lessons. * * Standalone chapters per topic. Subject-first prose, foundations, core * concepts, worked examples, exam practice, cheat sheet, recap. No shared * templates, no runtime composition. */
export const aiCareerAccelerator: Record<string, TopicLesson> = {
  "ai-ml-ai-career-accelerator-ml-interview-playbook": {
    intro: `ML interviewing is a distinct discipline from ML engineering — you must think out loud, defend assumptions, and demonstrate structured problem-solving under pressure, in 45 minutes, at a whiteboard. The subject is the playbook: ML coding questions, theory rounds, system design, research taste, and the difference between correct answers and hireable answers. interviewers don't just assess whether you can build models — they assess whether they'd trust you with their model at 3 AM.`,
    foundations: `Loop anatomy: (1) ML coding — implement logistic regression/k-means/attention from scratch in Python, no libraries; (2) ML breadth — rapid-fire: bias-variance, gradient boosting vs random forest, dropout, L1 vs L2, why ReLU; (3) ML system design — full pipeline scoping with constraints and tradeoffs; (4) ML research taste — "how would you approach paper X replication", "what would you improve in Y"; (5) behavioral/bar-raiser — conflict, failure, ambiguity. Depth vs breadth calibration per company level; L4 wants fundamentals nailed cleanly; L6 wants system intuition and taste.`,
    concepts: [
      {
        title: "ML coding: what they actually test.",
        body: `Common prompts: implement k-means clustering loop; logistic regression with gradient descent (matrix ops, no sklearn); attention mechanism forward pass; AUC/silhouette computation; batch normalization statistics; binning a continuous variable; writing tests for your own code; pandas merge bug hunt. What they grade: NumPy fluency, shape discipline, convergence sanity (loss going down?), edge cases (empty clusters, all-same-class folds), cleanup (not just "it works on my example"). Practice: whiteboard NumPy until indexing is reflexive; never iterate in Python when broadcasting exists; narrate your debugging.`,
      },
      {
        title: "ML breadth rounds: the rapid-fire minefield.",
        body: `50 questions in 30 minutes; hits everything: regularization (drop in train loss but val loss rises = overfitting, add dropout/L2), feature leakage (preprocessing fitted before split is the classic), class imbalance (PR-AUC, not ROC-AUC; weighted loss), gradient boosting vs RF (sequential vs parallel, bias vs variance, overfitting control), embeddings (cosine similarity, why normalized), transformers (self-attention O(n²), positional encoding, why pre-LN), evaluation (calibration, Brier score, slices); wrong answers matter less than confident wrongness with shallow understanding; the winning move: answer crisply, offer the tradeoff, stop talking; volunteering nuance = senior signal.`,
      },
      {
        title: "System design rounds: scope like a staff engineer.",
        body: `Prompt archetypes: "design a recommendation system for a marketplace"; "design spam detection for 10M messages/day"; "design a fraud model you could ship next quarter"; their rubric: clarification discipline (latency? budget? team? data availability?), baseline proposal (SQL rules), ML justification, pipeline sketch (features, training cadence, serving, feedback), metrics (offline + online + guardrails), failure modes (drift, label delay, adversarial adaptation); the amateur dives into model architecture; the professional spends the first 10 minutes refusing to rush; draw the data flow before any boxes labeled "transformer".`,
      },
      {
        title: "Research taste and paper discussion.",
        body: `Reading papers at scale separates senior from senior-plus; taste questions: "would you adopt this technique for our use case and why"; "what\'s missing in this evaluation"; "how would you reproduce this cheaply"; demonstrate: skim three sections in 5 minutes mentally (abstract, method figure, table), extract the actual delta, compare to known baselines honestly; admitting uncertainty about a detail is credibility-positive; fabricating confidence is screen-out; practice with 2 papers/week from NeurIPS/ICLR/KDD — annotate, build the mental index of what works and what doesn\'t.`,
      },
      {
        title: "Behavioral and ambiguity: the bar-raiser.",
        body: `Stories with structure: context → action → result with quantified outcome; ML-specific favorites: "tell me about a model that failed" (demonstrate diagnostic rigor), "disagreement with a stakeholder on metric choice" (demonstrate backbone + diplomacy), "deadline vs quality tradeoff" (demonstrate judgment); bar-raisers probe: do you understand business impact, or are you a loss-function enthusiast?; prepare 6 STAR stories covering: failure, conflict, ambiguity, mentorship, scope-creep, customer-escalation; deliver with numbers: "precision@10 improved from 0.41 to 0.58, revenue per session +2.1%, latency unchanged".`,
      },
    ],
    worked: [
      {
        title: "Whiteboard session: k-means from scratch at a FAANG loop.",
        body: `Candidate wrote clean init + assign + update loop; hit empty-cluster edge case; surfaced it unprompted ("if a cluster empties, reinitialize to farthest point — I\'ve seen this bug in prod"); discussed k selection via elbow + inertia; the interviewer later reported: "showed production scars, not just textbook recall"; pass signal came from the failure-mode conversation, not the happy path; the lesson: narrate failure modes before asked.`,
      },
      {
        title: "Design a content moderation system in 45 minutes.",
        body: `Candidate spent 10 minutes on: volume (3M posts/day), latency (pre-publish block vs post-publish review?), policy categories, multilingual coverage, human review capacity; proposed: multi-modal classifiers + rules pre-screen + human queue for borderline; metrics: precision on auto-action (99%+), reviewer throughput, appeal rate; flagged the hardest problem (policy drift with new viral content) and the mitigation (weekly active-learning retrains); the panel chose them over a candidate with deeper modeling but weaker scoping; system design rounds grade judgment, not recall.`,
      },
      {
        title: 'When the candidate said "I don\'t know" — and got the offer.',
        body: `Asked about a specific NeurIPS 2024 result the candidate hadn\'t read; response: "I haven\'t read that paper; here\'s how I\'d evaluate it from the abstract — baseline comparison, ablation rigor, whether the eval leaks"; the panel rated "intellectual honesty + transferable evaluation framework" higher than fake fluency; the hiring manager later asked the team: would you trust this person to gate a launch — yes; the playbook is written: calm, structured, honest, never bluffs.`,
      },
    ],
    exam: [
      {
        question:
          "Why does interviewing reward thinking out loud over silent correctness?",
        answer:
          "The interviewer hires for future collaboration, not one-shot answers — hearing your decomposition, your uncertainty calibration, and your self-correction is the evidence; silence forfeits the evidence even when the final answer is right.",
      },
      {
        question:
          "Why do ML depth rounds pivot to breadth questions after one deep dive?",
        answer:
          "They must estimate coverage across the whole field in 45 minutes — one missed pillar (bias-variance, leakage, imbalance) reveals more risk than one deep specialty reveals strength; breadth is the insurance layer of the evaluation.",
      },
      {
        question:
          "What does a strong system design answer include that model-first answers miss?",
        answer:
          "Framing, constraints, baseline, pipeline, metrics and failure modes — the full ML lifecycle — model-first answers are just a modeling choice floating in a vacuum; the rubric sees the craft, not the trivia.",
      },
      {
        question:
          "Why is admitting ignorance preferable to improvising an answer?",
        answer:
          "Calibrated uncertainty predicts safe decision-making in production — an engineer who fabricates confidence at a whiteboard will fabricate it at a deploy gate; interviewers read honesty as institutional reliability.",
      },
    ],
    cheat: [
      "Coding: NumPy shapes reflexive; edge cases narrated before asked.",
      "Breadth: crisp answer + tradeoff + stop; volunteer depth only when probed.",
      "Design: 10 min clarification; baseline; pipeline; metrics; failure modes.",
      "Papers: skim abstract/figure/table; name the delta; never bluff.",
      "Behavioral: STAR + numbers; six stories rehearsed, not memorized.",
      "Every answer: outcome, tradeoff, when-it-breaks.",
    ],
    recap: `ML interviewing rewards the visible craft of engineering judgment: coding fluency with failure-mode foresight, breadth with tradeoff literacy, design with framing discipline, research taste with honesty, behavioral stories with receipts — because they are hiring the person who will still be thinking clearly at 3 AM when the model drifts and the pager fires.`,
    code: {
      title: "Interview-ready gradient descent",
      language: "python",
      code: `for epoch in range(epochs): w -= lr * X.T @ (sigmoid(X @ w) - y) / len(y)`,
      explanation:
        "One line that reveals broadcasting mastery — interviewers count the beats.",
    },
    diagram: {
      title: "Interview loop map",
      caption: "Coding, breadth, design, taste, behavioral.",
      mermaid: `flowchart LR\n C[ML coding] --> B[ML breadth]\n B --> D[System design]\n D --> R[Research taste]\n R --> H[Behavioral]`,
    },
  },
  "ai-ml-ai-career-accelerator-kaggle-grandmaster-workflows": {
    intro: `Kaggle Grandmaster workflows are the laboratory of applied ML discipline — where validation design, ensembling craft, and leakage hunting are forged under leaderboard pressure. The subject is the GM playbook: validation strategy before any model, systematic experiment logging, feature engineering as the first lever, ensembling as the last, and the meta-skill of reading competitions like puzzles with known solution shapes. Kaggle rewards the process, not the luck — validation first, always, forever.`,
    foundations: `Golden rules: (1) Validation first — a local CV split that correlates with LB > 0.9 is the entire game; (2) Log every experiment — notebook, params, score, diff; (3) Baseline early — simple model, get on the board; (4) EDA before modeling — target distribution, missingness, leakage hunt; (5) Engineer features of the domain, not generic ones; (6) Ensemble late — stack diverse models (GBDT variations + NN + linear blend); (7) Team if allowed — diversity of approach beats depth; GM cadence: 2 competitions/month, 8h/week serious focus.`,
    concepts: [
      {
        title: "Validation design: the only thing that matters early.",
        body: `Split types: random k-fold (iid tabular), stratified (classification imbalance), GroupKFold (same entity in train/test), TimeSeriesSplit (temporal leakage kills you), adversarial validation (train a classifier to distinguish train vs test — if AUC > 0.7, your distributions differ and random CV lies); target-encoding the CV: out-of-fold only; measure LB correlation on one probe submission; once CV > LB aligned, iterate freely; misaligned? Stop modeling — fix the split first; this single skill separates GM from plateaued competitors.`,
      },
      {
        title: "Leakage hunting: the hidden leaderboard killer.",
        body: `Leakage = information unavailable at inference time; sources: target-derived features fitted pre-split, timestamps revealing outcome, duplicates across folds, mislabeled IDs (test file row order), public data unknowingly containing test rows; ritual: train model, inspect feature importances — top feature that "can\'t possibly work" is the tell; drop, recheck CV; adversarial validation again; audit timestamps; the failure is always the same: beautiful public score, gold-medal private, shattered at reshuffle; paranoia is the price of promotion.`,
      },
      {
        title: "Feature engineering: where competitions are actually won.",
        body: `Domain crosses: user×item interactions, temporal recency counts, aggregations per group (mean target per past event — out-of-fold), text length/entropy stats, interaction ratios; categorical: frequency (safe), target (OOF only), hashing for huge cardinality; numeric: log transforms for skew, binning for trees; missingness indicators (often predictive alone); encoding via embeddings for high cardinality; create 50-200 features, prune aggressively; the GM instinct: look at the top features of a baseline and ask "what else lives in that corner of the data".`,
      },
      {
        title: "Ensembling craft: last 2-4 points, harvested cheaply.",
        body: `Seeds: same model, different seeds, average — free 0.1-0.3%; diverse models: different families (LightGBM + XGBoost + CatBoost + NN) — complementary error profiles; stacking: meta-model on OOF predictions; hill climbing blend weights greedy; pseudo-labeling: confident test predictions as training data (careful, iterate); blend at the logit level for classification; guard rails: ensemble in CV must also improve OOF, never LB-tune alone; a typical GM blend: 3 GBDTs (different seeds) + 2 NNs + 1 linear = +1.5-3% from base best single model.`,
      },
      {
        title: "Competition meta: reading the room.",
        body: `Dataset reveals the task shape; problem statement reveals evaluation metric — optimize exactly that (not accuracy on a log-loss task); prize structure hints at difficulty; untold public discussion details solution directions; first-week LB noise teaches what works; identify whether this is feature engineering race, validation race, or architecture race — adapt cadence accordingly; dedicate the last 48 hours to shakeout: CV stability, submission format, re-verify pipeline end-to-end on a clean kernel; the difference between silver and gold is often Friday-afternoon hygiene, not better modeling.`,
      },
    ],
    worked: [
      {
        title: "Misaligned CV fixed: 0.71 CV vs 0.83 LB catastrophe.",
        body: `Tabular customer-churn competition; random k-fold gave CV 0.78, LB 0.61; investigation: train set gathered over Q1, test from Q2 — concept shift; switch to forward-chaining validation matching the test window; CV 0.74, LB 0.73; aligned; retraining on all data with the corrected split; final silver medal; the interviewer later asked at the candidate\'s panel: "tell me about a validation failure" — story ready, scar tissue intact, offer extended.`,
      },
      {
        title: "Leakage via OOF target encoding, caught at 2 AM.",
        body: `Best single model 0.91 AUC CV; merged features target-encoded in-place instead of OOF; private score 0.68 — destruction; unmerged, OOF-encoded: CV 0.84, private 0.85 — gold medal; the fix was a 4-line change; the rule is permanent: every target-derived feature passes through cross_val_predict or it doesn\'t ship; the notebook template enforces it automatically now.`,
      },
      {
        title: "The 48-hour endgame discipline converted bronze to gold.",
        body: `Two-week competition; team led on public LB by 0.002; final 48 hours: froze features, ran 30-seed GBDT bag, stacked with 2-layer NN, dropped the lucky-but-unstable model; submitted at deadline with clean kernel on fresh account to avoid any runtime roulette; private LB revealed: gold medal, top 0.1%; the lead was partly luck; the endgame convert was all craft; the retrospective quote: "gold is won on the last Friday, not the first Monday."`,
      },
    ],
    exam: [
      {
        question: "Why is CV-to-LB correlation the first thing a GM validates?",
        answer:
          "Every downstream iteration optimizes the CV proxy; if it doesn't track the leaderboard, you're polishing the wrong thing in high fidelity - aligning the proxy is cheaper than recovering from a lost month.",
      },
      {
        question: "Why does adversarial validation expose distribution shift?",
        answer:
          "Training a classifier to distinguish train vs test rows turns the shift into a measurable number - AUC > 0.7 means your random split is leaking time/entity differences; the fix is restructuring validation, not tuning harder.",
      },
      {
        question: "Why must target encoding be out-of-fold?",
        answer:
          "In-place encoding leaks the label into the feature for the same row - the model memorizes rather than generalizes; OOF estimates the feature from other rows only, preserving honesty at the modest cost of noisier estimates; fold-aware or nothing.",
      },
      {
        question:
          "Why do ensembling gains shrink each round while effort compounds?",
        answer:
          "Variance reduction has diminishing returns once diversity saturates - each added model contributes less while costing inference and maintenance; the craft is knowing when to stop blending and start submitting.",
      },
    ],
    cheat: [
      "Validation first: match the test-window distribution; adversarial check.",
      "OOF everything target-derived; forbid in-place encodings.",
      "Features of the domain; prune ruthlessly; importance as compass.",
      "Ensemble late: seeds, GBDT diversity, stacks, logit blending.",
      "Adversarial-validation every split; if AUC > 0.7, restructure.",
      "Endgame hygiene: seeds, fresh kernel, deadline discipline.",
    ],
    recap: `Kaggle mastery is engineered skepticism: splits that mirror the scoreboard, encodings that never see their own label, features carved from domain structure, blends tuned only on honest cross-validation — because medals are won the moment your local experiments stop lying to you, and nothing else compounds so reliably.`,
    code: {
      title: "OOF target encoding sketch",
      language: "python",
      code: `oof = cross_val_predict(enc, X[cat], y, cv=kfold, method='predict_proba')[:, 1]`,
      explanation:
        "The four-line fence between honest and catastrophic feature engineering.",
    },
    diagram: {
      title: "GM workflow",
      caption: "Validate, explore, engineer, ensemble, submit.",
      mermaid: `flowchart LR\n V[Validation] --> E[EDA]\n E --> F[Features]\n F --> M[Models]\n M --> S[Ensemble]`,
    },
  },
  "ai-ml-ai-career-accelerator-reading-papers-effectively": {
    intro: `Reading papers effectively is the one skill that separates ML consumers from ML practitioners — the ability to extract the essential delta from 20 pages of dense prose in under an hour. The subject is the three-pass method, reproduction economics, literature mapping, and the reading discipline that makes you the person who knows what just shipped before the blog post does. every paper is a claim — your job is to find the evidence, the holes, and the transferable idea, fast.`,
    foundations: `Three-pass method (Keshav): (1) five-minute skim — title, abstract, figures, section heads, conclusion — decide whether to read on; (2) one-hour read — grab the core contribution, the experimental setup, the key table, skim proofs/appendix; (3) deep reimplementation only if the paper will shape your work. Per week: 2-3 focused papers, annotated in a personal knowledge base (Zotero + notes or Obsidian). Papers aren\'t sacred; they are hypotheses with experiments attached — judge them like code.`,
    concepts: [
      {
        title: "Pass 1: the five-minute triage.",
        body: `Read: title (what changes?), abstract (delta + claim + headline number), figures (effect visible without reading?), section headers (map of arguments), first and last paragraph of intro (problem framing + contribution), conclusion (what they admit didn\'t work); rejection signals: no strong baseline, evaluation on one dataset, delta < noise floor, "we leave to future work" for the obvious question; keep-reading signals: 3+ baselines, ablations, release of code, honest limitations section; pass 1 kills 70% of the reading queue — protect your attention like compute budget.`,
      },
      {
        title: "Pass 2: extracting the delta without drowning.",
        body: `Identify: the actual novel component (architecture? loss? data? training trick?); the comparison table — what did they beat, by how much, on what, is it significant?; the ablation — what matters?; the failure cases they confess; the compute footprint — can you reproduce?; annotate: one-paragraph summary in your own words, one figure redrawn from memory, three questions you\'d ask the authors; store contradictions you\'ve noticed vs older results; timebox pass 2 to 45 minutes — if it needs more, schedule pass 3 deliberately instead of drifting.`,
      },
      {
        title: "Pass 3: the reproduction decision.",
        body: `Full reimplementation only when: the paper will change your architecture, its claim contradicts yours, or you need to extend it — otherwise replicating for fun is a tax; reproduction report template: claim → setup → delta found → interpretation; cheap reproduction: use authors\' code if released (check repo, check issues — stale repos lie), second cheapest: adapt a popular open implementation; record wall-time, GPU, and your variance; if your number differs, check bulletproofing first (seed, data split, eval protocol) before claiming the paper wrong.`,
      },
      {
        title: "Building a literature map, not a reading list.",
        body: `Organize by problem lineage, not chronology: (transformers → scaling laws → MoE → efficient inference; RLHF → DPO → KTO → Constitutional); for each lineage: the canonical paper, the one that changed practice, the one with the biggest open question; your map is a graph you traverse when designing — "what does the field know about long-context attention" answered in 30 seconds from memory + 3 jumps; maintain a one-line verdict per paper: "solid", "incremental", "oversold", "load-bearing"; the map is also a hiring asset — in interviews, referencing the map signals genuine depth over resume padding.`,
      },
      {
        title: "The craft of questioning: papers as negotiations.",
        body: `Every paper argues with the field; your job: find the strongest counter-argument — "they didn\'t compare against the obvious baseline", "the eval set leaks", "the improvement vanishes at scale"; discuss: Reading Groups monthly, Discord/Slack communities, comment threads — peer review in the wild; formulate one question per paper; if you can\'t form one, you didn\'t understand it; the question sharpens the concept; papers read actively compound, papers read passively evaporate by morning.`,
      },
    ],
    worked: [
      {
        title: "The paper that rewrote the team's roadmap in 40 minutes.",
        body: `Backlog: quantization exploration for mobile; weekly RSS surfaced a QAT-matched-to-INT4 paper; pass 1: interesting delta vs GPTQ; pass 2: 40 minutes — table showed +1.2% over GPTQ on MMLU at INT4 with authors\' code released; reproduction on one GPU: matched within 0.3%; architect the mobile quant plan around QAT next sprint; the decision process: one afternoon, three people, zero meetings — the paper paid a quarter of memo-writing instantly.`,
      },
      {
        title: "Pass 1 saves the team from a fool's errand.",
        body: `Paper claiming SOTA on long-context retrieval with "novel positional encoding"; pass 1 reveals: single dataset, no matched baseline against ALiBi, no length-extrapolation beyond 2× training length; team reads two counter-papers instead; conclusion: skip; saved a 3-week reproduction that the authors\' own later erratum confirmed; the triage note "single-dataset, no extrapolation eval — pass" went into the shared log; the next researcher asking about positional encodings hit the note and saved their own week.`,
      },
      {
        title: "A literature map turns a weekend into a design doc.",
        body: `Task: design a document-embedding strategy; engineer traverses their map: sentence-transformers lineage → E5 → BGE → Nomic; check MTEB scores + licensing; the answer (BGE-large + fine-tune on 20k in-domain pairs) arrived before the design doc meeting; the doc was one page with four citations; the EM approved it in the meeting, not after the meeting; that speed is what a map buys you — decisions made with the field\'s memory loaded.`,
      },
    ],
    exam: [
      {
        question:
          "Why is pass 1 the highest-leverage pass and how much should it filter?",
        answer:
          "Attention is the binding constraint; pass 1 eliminates 60-80% of papers at minutes each, concentrating deep reading where the marginal value lives — a filter that bankrupts the reading queue in exchange for depth elsewhere.",
      },
      {
        question: "Why does a paper need ablations before you trust its delta?",
        answer:
          'Ablations reveal which component actually carries the gain — removing the "trick" and seeing the metric collapse is the difference between mechanism and decoration; without ablations, you\'re adopting superstition with math.',
      },
      {
        question:
          "When is skipping reproduction the correct scientific decision?",
        answer:
          "When the paper's claim won't alter your design or you need it as orientation rather than as load-bearing proof — reproduction is expensive science and should be reserved for decisions with consequences; pass 2 extracts most value at 5% of the cost.",
      },
      {
        question:
          "What does maintaining a per-paper verdict do to your thinking over years?",
        answer:
          "It converts reading into a calibrated prior — you start to recognize the authors' and labs' hit rates, the genres of overclaim, and the journals-of-practice whose papers survive contact with reality; judgment compounds like data.",
      },
    ],
    cheat: [
      "Pass 1: 5 min skim; pass 2: 45 min extract; pass 3: reproduce only if load-bearing.",
      "Ask one question per paper; no question = not understood.",
      "Annotate in your KB with a one-line verdict.",
      "Organize by problem lineage; map the terrain.",
      "Check repo health before reproducing; stale code = stale results.",
      "Reading groups monthly; papers as negotiations.",
    ],
    recap: `Reading ML papers is engineered skepticism as a habit: pass 1 triage, pass 2 extraction, pass 3 only for stakes, literature maps over lists, questions over nods — because the practitioner who understands what shipped this month will design what ships next quarter, and everyone else will read about it in the launch post.`,
    code: {
      title: "Paper triage checklist",
      language: "text",
      code: `delta | baselines >= 3 | ablations | code released | honest limitations | in-domain?`,
      explanation: "Six ticks decide whether a paper earns your afternoon.",
    },
    diagram: {
      title: "Three-pass method",
      caption: "Triage, extract, reproduce selectively.",
      mermaid: `flowchart LR\n P1[Pass 1 triage] --> P2[Pass 2 extract]\n P2 --> P3[Pass 3 reproduce]`,
    },
  },
  "ai-ml-ai-career-accelerator-building-an-ai-portfolio": {
    intro: `Building an AI portfolio is the craft of demonstrating applied skill with public artifacts — projects, demos, write-ups, and proof that you can ship models that work for real users. The subject is what to build, how to present it, and where to host it so hiring managers stop scrolling and start scheduling — because the resume says you studied ML, the portfolio proves you practice it. nobody hires ML engineers on potential — they hire on evidence, and the portfolio is the evidence.`,
    foundations: `Portfolio anatomy: (1) Flagship project — end-to-end: data → model → deployed demo → metrics; (2) Depth artifact — one deep technical deep-dive (blog, repo with docs, video walkthrough) per specialty area you claim; (3) Reproduction — one paper reproduced with written delta analysis; (4) Public writing — 3-5 posts on what you actually built and broke; (5) Presence — GitHub hygiene (READMEs, tests, CI badges), LinkedIn with project links, optional Kaggle/Hugging Face contributions. Each artifact answers: what did YOU do, how hard was it, what did you learn.`,
    concepts: [
      {
        title: "What belongs in a flagship project (and what doesn't).",
        body: `Flagship: one problem, real data (public but messy — Kaggle-tier, UCI, scraped lawfully), real deployment (Hugging Face Space, Railway, Fly.io — free tier is fine), real metrics (accuracy + latency + cost per request), honest write-up (what failed, what you\'d do differently); NOT a tutorial clone (digit classifier with 99% accuracy impresses no one); scope: two weekends of real work beats two months of polishing nothing; the hiring signal: can this person frame, build, deploy, measure, iterate?; pick a domain you care about — enthusiasm is legible in the README.`,
      },
      {
        title: "The deep-dive artifact: one vertical at a time.",
        body: `Choose one niche: RAG pipelines, LoRA fine-tuning, evaluation harnesses, embedding search, small-model deployment, agent tool-use; build something non-trivial (not "hello world" — a working eval comparing 3 chunking strategies with real numbers, or a quantized model served at 40 tokens/sec on a $5 VPS); write the deep-dive: architecture sketch, benchmarks, failure cases, cost table; host: blog on own domain, or dev.to/Medium/Substack if faster; this artifact is what turns "ML enthusiast" on the resume into "the person who ships RAG systems" in the interview.`,
      },
      {
        title: "GitHub as a hiring surface, not a dumping ground.",
        body: `README that works: problem statement in one sentence, live demo link, architecture diagram, results table with baseline comparison, setup instructions that actually work on a fresh machine (test them!), license, topic tags; hygiene: tests passing, CI green, no secrets committed (git-secrets precommit), sensible commit history (squash WIP), issues for known limitations (shows taste); pinned repos: flagship + 2 deep-dives max — a wall of 30 unfinished repos is noise; star-worthy details: docker-compose for one-command run, Makefile, pre-commit config.`,
      },
      {
        title: "Writing: the compounding asset nobody starts early enough.",
        body: `Posts that get noticed: "I reproduced paper X and got Y — here\'s the gap"; "Three chunking strategies benchmarked on our retrieval corpus"; "Serving a 1.5B model in 40 tokens/sec for $3/month"; structure: problem → setup → result → surprise → what next; numbers or it didn\'t happen; publish where your audience lives (LinkedIn + X + dev.to cross-post); cadence: one post/month beats zero posts/quarter; writing crystallizes your learning — you will understand your own project better after writing it up; employers search for your name + topic — make that search find something.`,
      },
      {
        title: "Anti-patterns: what kills portfolios silently.",
        body: `Tutorial clones (no differentiation); abandoned repos with "coming soon" READMEs; accuracy claims without baseline or dataset detail; private repos you can\'t show (build something public instead); Jupyter notebooks without narrative; projects with no deployment (local demo = they don\'t trust it works); no metrics anywhere; formatting sloppiness (spelling errors in README — they screenshot); the tell: would YOU hire from this portfolio?; audit it from a stranger\'s chair quarterly — your enthusiasm is invisible to them; the fix list writes itself.`,
      },
    ],
    worked: [
      {
        title: "The portfolio that landed three interviews in two weeks.",
        body: `Candidate: mid-level backend engineer pivoting to ML; built: (1) flagship — document Q&A over local PDFs with RAG, deployed on HF Space, latency 1.2s, honest write-up on hallucination mitigations; (2) deep-dive — benchmark of 4 embedding models on 500-question domain set with recall@10 table; (3) reproduction — LoRA paper, 3 training configs, loss curves; (4) two posts — the second hit Hacker News front page; (5) GitHub: 3 pinned repos, CI green, one-page README each; three interviews from warm outbound citing the artifacts; offer accepted at 30% raise; the hiring manager said: "the RAG post showed us how they think."`,
      },
      {
        title: "From zero to credibility in 90 days with one strong project.",
        body: `New grad, no ML experience; plan: pick a problem from their day job (support ticket triage), scrape public similar data, build classifier + LLM fallback, deploy as internal tool with usage logs, write up failure analysis with real examples; artifact set: repo + demo video + post; interviews: 5/6 companies advanced to onsite; the common feedback: "the project showed production instincts you don\'t usually see in juniors"; the differentiator wasn\'t the model — it was deployed with users and measured.`,
      },
      {
        title: "The portfolio audit that found 11 credibility leaks.",
        body: `Engineer with 8 ML repos applied to 50 companies, zero responses; hired friend to audit cold: (1) no live demos, (2) READMEs all said "accuracy 95%" with no dataset/baseline, (3) three repos had failing CI, (4) one leaked an API key, (5) no blog, no metrics, no diagrams; 3-week sprint: deleted 5, polished 3, added Space deploys, wrote 2 posts with numbers; re-applied to 12: 4 interviews, 1 offer; the lesson: portfolio is a product — ship, measure, iterate; it reads like a deploy checklist because it is one.`,
      },
    ],
    exam: [
      {
        question:
          "Why does a deployed demo out-signal any number of notebook results?",
        answer:
          "Deployment proves you can bridge research and production — environment wrangling, latency, error handling, user contact — the exact gap that separates ML-capable from ML-deployed; hiring managers pattern-match on this signal instinctively.",
      },
      {
        question: "Why do hiring managers read your GitHub before your resume?",
        answer:
          'Resumes claim; repos demonstrate; a README with a working demo, honest numbers and clean setup answers "can they actually do this?" in 30 seconds — the fastest trust decision in the process, and the cheapest one you control.',
      },
      {
        question:
          "What separates a project that reads as a tutorial clone from one that reads as competence?",
        answer:
          "Evidence of ownership: custom data, non-trivial decisions, measured results with baseline, documented failures and tradeoffs, and a deployment someone else can reach — clones copy steps; competence leaves fingerprints.",
      },
      {
        question:
          "Why is writing about what broke more valuable than writing about what worked?",
        answer:
          "Failure analysis reveals diagnostic process and humility — the traits interviewers can't extract from polished success stories — and it's rarer, so the signal cuts through the portfolio noise like a lighthouse in a hall of mirrors.",
      },
    ],
    cheat: [
      "Flagship: real problem, real data, real deployment, real metrics.",
      "One deep-dive per claimed specialty; numbers or it didn't happen.",
      "Pin 2-3 repos: flagship + deep-dives; CI green; no leaks.",
      "3-5 posts with artifacts; cross-post where audience lives.",
      "Audit your portfolio cold quarterly; delete the weak; ship the rest.",
      "Deploy on free tiers — HF Spaces, Railway, Fly.io; links > claims.",
    ],
    recap: `An AI portfolio is proof-of-work as a strategy: one deployed flagship, deep-dives per specialty, public writing with numbers, relentless GitHub hygiene and cold audits — because employers don\'t buy promises, they buy receipts, and the receipts live in your build pipeline, your demo link, and your willingness to publish the failures too.`,
    code: {
      title: "README front matter that works",
      language: "markdown",
      code: `Problem | Demo link | Results table | Quickstart | Architecture | Limitations`,
      explanation:
        "Six lines that turn a repo into an interview — compress the trust path.",
    },
    diagram: {
      title: "Portfolio stack",
      caption: "One deployed project, two deep-dives, public writing.",
      mermaid: `flowchart TD\n F[Flagship deployed] --> DD[Deep-dives]\n DD --> W[Writing]\n W --> GH[GitHub hygiene]`,
    },
  },
};

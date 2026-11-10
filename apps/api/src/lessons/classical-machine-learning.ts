import type { TopicLesson } from "../topicLessons.js"; /** * Classical Machine Learning — 8 authored topic lessons. * * Standalone chapters per topic. Subject-first prose, foundations, core * concepts, worked examples, exam practice, cheat sheet, recap. No shared * templates, no runtime composition. */
export const classicalMachineLearning: Record<string, TopicLesson> = {
  "ai-ml-classical-machine-learning-ml-problem-framing": {
    intro: `ML problem framing is the phase where business pain becomes a learnable objective — targets, features, labels, metrics, baselines, and splits — and the difference between a 95%-accurate useless model and a mediocre precise one. The subject is the craft conversations before code: supervised vs unsupervised, metric selection, leakage hunting, and honest baselines. most ML failures are specification failures discovered after the model is done.`,
    foundations: `Task types: supervised (predict from labeled pairs; classification/regression; ranking/recommendation), unsupervised (structure without labels; clustering, dimensionality reduction), semi-supervised, self-supervised, RL. Formulate: inputs (features X) and outputs (label y or reward); what gets predicted at inference time and by when (latency, freshness); what "good" means quantitatively. Data audit before modeling: volume, class balance, label quality, missingness, leakage sources. Splits: train/validation/test; time-based for temporal data; group splits for users/sessions; leakage = any signal unavailable at prediction time sneaks in — the cardinal sin.`,
    concepts: [
      {
        title: "From business question to ML task.",
        body: `Business: "churn is hurting us." Bad task: "predict churn." Better: "for each active customer, weekly P(churn in 30 days) with action = retention offer when p > 0.6." Now you see: label = no activity for 30d after snapshot; features = tenure, usage trend, support tickets; latency = batch weekly; metric = lift@offer, not AUC; action = human-reviewed offer; budget = retention spend cap. Every ambiguity surfaced in framing vanishes as a future bug report. The questions: what exactly is the unit of prediction, at what time is the prediction available, what action follows, what does success cost?`,
      },
      {
        title: "Choosing the right metric (and the right level of cynicism).",
        body: `Accuracy lies on imbalanced problems (99% negatives → 99% accuracy by predicting nobody); precision/recall tradeoff dial — precision when false alarms cost (fraud review team burnout), recall when misses cost (cancer); F1 balances; AUC-ROC for ranking quality generally; PR-AUC for rare positives; log-loss for probabilistic honesty (calibration matters when p feeds decisions); MAP/NDCG for ranking; MAE/RMSE for regression with different outlier sensitivities; business metric beats every statistical one: revenue saved, tickets avoided, fraud $ blocked — define it before any AUC conversation; if you cannot state the metric, you do not have a problem, you have a vibe.`,
      },
      {
        title: "Baselines: the models everyone skips.",
        body: `Rules first: predict majority class / global mean / last-value-carried-forward for time series — half of "ML breakthroughs" lose to these baselines; simple linear/logistic regression second — interpretable, fast, and embarrassingly strong often; then gradient-boosted trees; only then neural anything; beat the baseline by a margin that justifies the complexity budget — deployment, maintenance, retraining burden all scale with exotica; a 2% AUC gain that doubles infra cost is negative value; document baseline vs fancy in every proposal — executives and reviewers both respond to "logistic beats neural on this data."`,
      },
      {
        title: "Leakage: the infinite supply of fake success.",
        body: `Sources: future information in features (post-outcome fields), duplicates across splits (same user in train and test), imputation/scaling fit on full data before splitting, random splits on time-series crossing the boundary, target encoding without out-of-fold care; miraculous metrics (0.98 AUC) are the smell — investigate assumptions first; kill switch: time-based split for anything temporal, group split by user/device for behavioral data, fit all preprocessing inside CV folds only (use sklearn Pipelines or manual fold hygiene); leakage is never a bug you find later — it is the bug that was always there; paranoia is the job description.`,
      },
      {
        title: "Splits and validation design.",
        body: `Train/val/test: test touched once, ever; validation drives model selection and early stopping; stratify classification splits for class balance; for time series: train past, validate future, never shuffle; grouped CV for user-level data (leave-one-group-out); nested CV when using validation for both selection and unbiased estimate — honest protocols cost discipline and save careers; k-fold for small data; repeated CV for stability; report mean ± std across folds, not the best fold; the split scheme is part of the method — publish it with the results; different splits, different truths.`,
      },
    ],
    worked: [
      {
        title: 'Frame "customer support is overwhelmed" as an ML project.',
        body: `Stakeholder pain: 40k tickets/month, first-response 18h, agents drowning. Framing session: outputs two predictions — (a) auto-triage routing (10 classes) from subject+body, latency real-time, action = route to queue, metric = routing accuracy + SLA delta; (b) priority prediction (p1-p4) for ordering, metric = SLA breach rate by predicted class vs actual. Baseline: keyword rules (60% accuracy) → logistic regression on TF-IDF (78%) → fine-tuned small transformer (89%); triage accepted at 87% shadow, rolled out gradually; result: first response 7h, deflection up; the framing took 2 meetings, the model a week; framing was 90% of the value.`,
      },
      {
        title: "Kill a leaking feature before it killed the launch.",
        body: `Churn model AUC 0.97 — suspicious. Audit: feature "days_since_cancellation" — the label! Removed; next candidate: "last_agent_note_contains_ticket_closed" — post-cancellation closure field; removed both; honest AUC 0.81 with only pre-churn signals; shipped model achieved 0.79 in production with 22% lift over the rule baseline; the 0.97 version would have been rejected by any thoughtful reviewer — the launch was saved by mandatory leakage review, now a checklist item in every design doc.`,
      },
      {
        title: "Choose precision over recall and watch support load halve.",
        body: `Auto-close suggestion feature: suggest closing tickets predicted resolved. Recall-first design flagged 90% of resolved tickets but 18% false positives — agents re-opened and cursed. Switching to precision ≥ 0.95 threshold: suggestions accepted 94% of the time, re-open rate 1.2%, agent hours saved 2,100/month; metric discipline (precision first because the cost asymmetry favors it) turned an irritating feature into a beloved one; the confusion matrix chart went on the wall.`,
      },
    ],
    exam: [
      {
        question:
          "What is the definition of target leakage and its canonical signal?",
        answer:
          'Any information in features unavailable at prediction time — future timestamps, post-outcome fields, full-data preprocessing; canonical signal: suspiciously high offline metrics collapsing in production; always ask "would this value exist the moment we predict?" for every feature.',
      },
      {
        question:
          "Why is predicting the majority class a legitimate baseline that must be reported?",
        answer:
          "It defines the floor every model must clear — with imbalanced classes it is embarrassingly strong, and beating it is the entry ticket; if your fancy model loses to it, your pipeline is broken, not your model; always report lift over this trivial baseline.",
      },
      {
        question:
          "When does accuracy misrepresent model quality catastrophically?",
        answer:
          "Any class imbalance — 99% negative problem: predicting all-negative scores 99%; accuracy is blind to the minority class, which is usually where all business value lives; use precision/recall/F1/PR-AUC on the positive class, or cost-weighted utility aligned to economics.",
      },
      {
        question:
          "What does nested cross-validation protect against, and when is it worth it?",
        answer:
          "It separates model selection (inner CV) from unbiased performance estimation (outer CV) — using the same CV for both overfits the validation score; worth it when reporting one honest number matters (papers, high-stakes deployment); overkill for iterative product work where holdout discipline suffices.",
      },
    ],
    cheat: [
      "Unit of prediction, time of prediction, action, metric — four questions, start there.",
      "Baselines first: majority/mean/persistence; then linear; then trees.",
      "Leakage checklist: time boundaries, group splits, fold-internal preprocessing.",
      "Metric from cost asymmetry: precision for false-alarm cost, recall for miss cost, PR-AUC for rare positives.",
      "Test set touched once; validation drives selection; nested CV for unbiased claims.",
      "Stratify splits; group splits for user data; time splits for temporal data.",
    ],
    recap: `Framing is the ML project before the ML: define the unit, moment, action and metric first; audit labels and leakage before features; beat cheap baselines honestly; select with stratified/temporal/grouped splits and spend the test set once — the model is the easy part once the problem is truly specified.`,
    code: {
      title: "Time-based split",
      language: "python",
      code: `train = df[df.ts < '2026-09-01']\nval = df[(df.ts >= '2026-09-01') & (df.ts < '2026-10-15')]\ntest = df[df.ts >= '2026-10-15']`,
      explanation:
        "The split that prevents the most dangerous self-deception in applied ML — past predicts future, always, and never shuffle time.",
    },
    diagram: {
      title: "Framing flow",
      caption: "Pain to prediction to action.",
      mermaid: `flowchart LR\n P[Pain point] --> T[Task definition]\n T --> D[Data audit]\n D --> M[Metric and baseline]`,
    },
  },
  "ai-ml-classical-machine-learning-regression-and-classification": {
    intro: `Regression and classification are the twin pillars of supervised learning — predicting continuous values and discrete classes — and knowing them cold means knowing how most production ML actually works. The subject is the model families worth mastering: linear/logistic regression, regularized variants, calibration, loss functions, and where each breaks. regression tells you how much, classification tells you which — everything else is refinement.`,
    foundations: `Linear regression: ŷ = w·x + b; OLS loss (residuals²); closed-form via normal equations (XᵀX)⁻¹Xᵀy or gradient descent at scale; assumptions: linearity, independence, homoscedasticity, normality of residuals for inference; R² = 1 - SS_res/SS_tot; multicollinearity inflates variance (VIF) — regularize or drop; polynomial features expand basis (beware overfitting blowup). Logistic regression: P(y=1) = σ(w·x+b); log loss; decision boundary linear; interpret coefficients as log-odds; regularization L1 (sparse) / L2 (ridge shrinkage) / ElasticNet; calibration: Platt scaling, isotonic regression, temperature scaling; thresholds tuned on cost, not default 0.5.`,
    concepts: [
      {
        title: "OLS, closed forms, and why we almost always descend.",
        body: `The normal equations give the exact minimizer — but they invert a d×d matrix (O(d³)) and die on ill-conditioning; gradient descent/SGD scales to billions of rows; standard practice: standardize features, add regularization, iterate; residuals analysis: plot against fitted values — fan shapes say heteroscedastic (log-transform y or WLS), trends say nonlinearity (add terms or switch model), clustering says missing structure; R² is a relative fit, not absolute truth — always pair with residual plots; extrapolation is untrusted by definition.`,
      },
      {
        title: "Regularization: the shrinkage spectrum.",
        body: `L2 ridge: shrinks all coefficients smoothly toward zero, beautiful when many small-effect features — stable, differentiable, fast; L1 lasso: zeros some coefficients outright — automatic feature selection, ideal when you suspect sparsity; ElasticNet mixes both (α balance + λ overall) for correlated groups; λ tuned by cross-validation (path of λ values, pick by val metric + 1σ-SE rule for parsimony); coefficient paths tell you the effect order; multicollinearity: ridge handles correlated twins cooperatively, lasso picks one arbitrarily (fine for selection, annoying for explanation — use elastic net and grouping penalties for stability).`,
      },
      {
        title: "Logistic regression: the workhorse classifier.",
        body: `σ(z) = 1/(1+e⁻ᶻ) squashes any real number into (0,1); P(y=1) ∈ (0,1) directly = probability estimate; coefficients multiply log-odds: e^w = odds ratio — the model is interpretable end-to-end; decision boundary linear in feature space; add interaction/polynomial terms or basis expansions for curvature; class weights or threshold adjustment for imbalance; multinomial softmax for k classes (one-vs-rest alternative, less elegant, same family); regularization mandatory for n < p; feature scaling helps conditioning of the sigmoid landscape.`,
      },
      {
        title: "Calibration: do the probabilities mean anything?",
        body: `Logistic outputs are probabilities only if the model is well-specified — misspecified models give confident lies; calibration curve: plot predicted p vs empirical fraction positive (reliability diagram); perfect diagonal = calibrated; below diagonal: overconfident; above: under; fixes: Platt (logistic on scores), isotonic regression (piecewise monotone — better with more data), temperature scaling for neural nets; after calibration, threshold by business cost — expected cost of false positive × P(FP) vs false negative × P(FN) — the 0.5 default is almost always wrong in production; log-loss punishes confident wrongness, check it if calibration matters.`,
      },
      {
        title: "Loss functions and robustness.",
        body: `Squared loss: Gaussian noise MLE — efficient but outlier-sensitive (one 100x error explodes gradients); Huber/quantile loss: robust to outliers; MAE for median prediction; log-cosh smooth alternative; classification: log-loss (cross-entropy) proper scoring rule — calibrated optima; hinge (SVM flavor — max margin, sparse solutions, no probabilities); focal loss for extreme imbalance (downweights easy negatives); asymmetric costs: weight classes or use custom loss; the loss IS the definition of the task — when in doubt, write the business loss explicitly, you will discover what you actually wanted.`,
      },
    ],
    worked: [
      {
        title: "Ridge regression rescues a 4,800-feature genome model.",
        body: `Regression demand: predict cholesterol from 4,800 SNPs, n=900 samples. OLS: coefficients explode, test R² −0.3. Ridge λ from CV: coefficients shrink smoothly; test R² = 0.51, stable across seeds; coefficient magnitudes meaningful for top genes (3 hit replication); the insight: shrinkage turned noise into a signal detector; without regularization, the task was mathematically impossible — overfitting guaranteed; the CV curve showed the elbow at λ=2.3, textbook ridge efficacy.`,
      },
      {
        title:
          "De-bias a churn model's probabilities with isotonic calibration.",
        body: `Internal churn model AUC 0.84 but p=0.8 cohort churned only 35% — overconfident. Calibration plot: s-shaped under-confident at low end, over at top. Isotonic regression on 3k held-out: calibration curve flattened to near-diagonal; retention offers now targeted at p_true > 0.55 (was > 0.8 — barely anyone qualified; actual risk lives in the middle band); campaign ROI tripled in the re-targeted cohort; calibration was invisible until someone drew the curve — always draw the curve.`,
      },
      {
        title: "Beat an outlier-polluted revenue regression with Huber loss.",
        body: `Predict ARR from growth metrics; gaudy outlier (one 8x revenue account) wrecked OLS: coefficients flipped sign. Huber loss (δ=1.35 in standardized units): linear near zero gradients, clipped linear beyond — the outlier contributes bounded influence; in-sample MSE worse, out-of-sample MAE 22% better; the model generalized; when stakeholders ask "why did the model get worse with Huber?", show them the Cook\'s distance plot — one point was driving everything.`,
      },
    ],
    exam: [
      {
        question:
          "What does e^(coefficient) mean in logistic regression and why is it prized?",
        answer:
          "The odds ratio per unit change in that feature, holding others constant — interpretable like a risk multiplier (OR=1.5 → 50% higher odds); the model's transparency survives even with thousands of features, unlike neural nets; stakeholders can actually audit the logic.",
      },
      {
        question: "Why is R² misleading when residuals fan out?",
        answer:
          'R² is a single variance-share number; fan-shaped residuals mean variance depends on fitted values — violating homoscedasticity — so the significance and intervals of coefficients are wrong, and "variance explained" varies across the range; inspect plots, transform y (log) or weight, or model with GLM with right variance function.',
      },
      {
        question: "Why does calibration matter even with great AUC?",
        answer:
          "AUC orders predictions but is scale-free — it cannot see whether p=0.8 means 80% or 35%; ranking for triage vs thresholding for action demand different knowledge; threshold decisions, expected cost calculations, and multi-model stacking all consume probabilities, not ranks.",
      },
      {
        question:
          "What does L1 with correlated predictors do badly that ElasticNet fixes?",
        answer:
          "Lasso arbitrarily picks one of the correlated features and zeroes the rest — refits swing between them across seeds, destroying stability of selection and coefficient signs; elastic net spreads weights across the group with correlated contributions, giving consistent selection and saner interpretation at small sparsity cost.",
      },
    ],
    cheat: [
      "Standardize before regularizing; λ from CV with 1σ parsimony rule.",
      "Ridge shrinks smoothly, Lasso zeros sparsely, ElasticNet for correlated groups.",
      "Logistic = OLS for probability; coefficients = log-odds; odds ratios for humans.",
      "Calibrate: reliability curve first; Platt (small val) or isotonic (more data); threshold by cost.",
      "R² + residual plots always; Huber when outliers inflate; log when fans out.",
      "Log-loss for probabilistic honesty; class-weighted for imbalance.",
    ],
    recap: `Regression and classification are linear honesty at scale: OLS discipline with diagnostics, regularized shrinkage for high dimensions, logistic coefficients as log-odds you can read aloud, calibration to make probabilities real, and losses matched to cost — the boring, inspectable bedrock on which every fancier architecture stands or falls.`,
    code: {
      title: "Platt calibration",
      language: "python",
      code: `cal = LogisticRegression().fit(val_scores.reshape(-1, 1), val_y)\np_cal = cal.predict_proba(test_scores.reshape(-1, 1))[:, 1]`,
      explanation:
        "A logistic on top of your classifier scores — ten lines turning a ranking into a probability you can bet money on.",
    },
    diagram: {
      title: "Model menu",
      caption: "Start simple; add complexity on purpose.",
      mermaid: `flowchart LR\n L[Linear] --> M[Logistic]\n M --> T[Trees and ensembles]`,
    },
  },
  "ai-ml-classical-machine-learning-trees-and-ensembles": {
    intro: `Trees and ensembles — decision trees, random forests, gradient boosting — are the most deployed model family in industry because they are fast, robust, and swallow messy tabular data without preprocessing rituals. The subject is how they work, why ensembles beat singles, and how to tune them: depth, features per split, learning rates, and the bias-variance trade each knob encodes. a single tree is a flowchart that overfits loudly; a forest is that idea disciplined by averages and randomness.`,
    foundations: `Decision tree: recursive binary splits maximizing impurity reduction (Gini for classification, variance for regression); stopping: depth, min_samples_split, min_samples_leaf — without limits, trees memorize (100% train, garbage test). Random forest: bagging (bootstrap samples) + feature randomness (sqrt(p) per split) → decorrelated trees, averaged → variance collapses; OOB error from held-out samples per tree — free validation. Gradient boosting: sequential trees fit residuals of the current ensemble; each tree corrects the last; step size (learning rate) shrinks each correction; modern variants: XGBoost (histogram split finding, L1/L2 on leaves, missing-value direction), LightGBM (leaf-wise growth, histograms — fast on tall data), CatBoost (ordered boosting, native categorical handling).`,
    concepts: [
      {
        title: "Trees: impurity and the overfitting knife edge.",
        body: `Gini = 1 - Σpᵢ² — weighted impurity of children; choose split maximizing reduction; trees are nonparametric, capture interactions natively (no manual cross terms!), invariant to monotonic transforms (splits on rank), need no scaling — but unstable (data wobble → structure wobble) and greedy (locally optimal splits, not globally); without regularization parameters, every leaf ends pure noise; always set max_depth and leaf minimums, prune post-hoc with cost-complexity pruning (α>0 prunes weakest subtree links).`,
      },
      {
        title: "Random forests: the variance-crushing machine.",
        body: `Two sources of randomness: bootstrap rows per tree (~63% unique per tree — rest are OOB, used for validation) and random feature subsets per split node; average predictions/votes; decorrelation makes averaging actually work (fully correlated trees gain nothing); hyperparameters: n_estimators (more = better until plateau, ~500 safe), max_features (sqrt default classification, /3 regression — the key knob), depth (deeper = more individual overfit but averages fine), min_leaf; OOB score ≈ test score; feature importances (MDI biased to high-cardinality features — prefer permutation importance on held-out); trees never need scaling.`,
      },
      {
        title: "Gradient boosting: sequential bias reduction.",
        body: `Ensemble starts with the mean (or base score); each iteration fits a tree to negative gradient (residuals for squared loss) of current loss; predictions += learning_rate × tree_output; hundreds-thousands of shallow trees (depth 4-8 typical) with small steps (0.01-0.1); early stopping on validation (stop when val loss plateaus — n rounds without improvement); subsample rows/cols per iteration (stochastic GBM) for variance reduction; histogram algorithm (bin features to 256 buckets) makes split-finding cheap; regularization: max_depth, min_child_weight, gamma (min loss reduction per split), L1/L2 leaf weights; missing values: learned default direction per split.`,
      },
      {
        title: "XGBoost vs LightGBM vs CatBoost — choose your weapon.",
        body: `XGBoost: battle-tested default, GPU support, monotone constraints, the most tutorials on Earth; LightGBM: fastest on millions of rows tall data, leaf-wise can overfit small data (set min_data_in_leaf carefully), EFB for sparse high-dim; CatBoost: ordered target statistics for categorical features — no manual encoding, best default for messy categorical real-world data, slower CPU-wise but excellent on GPU; all three win tabular competitions routinely; the practical move: try all three with default-ish configs, keep the winner, tune lightly (n_estimators + lr + depth first); ensemble across them if competition stakes justify.`,
      },
      {
        title: "Training discipline and interpretation.",
        body: `Split by time/group BEFORE any tree modeling — leakage kills silently here too; early stopping on a validation set is mandatory for boosting (trees=10000 with early stop usually beats trees=500 blind); class weights or scale_pos_weight for imbalance; SHAP values for explanation (TreeSHAP exact and fast for trees — per-prediction feature attribution); permutation importance for global honesty; never trust MDI importance on high-cardinality; partial dependence plots for direction of effects; monotone constraints to encode domain laws (price ↑ ⇒ bounce ↓); these controls make boosting defensible to regulated audits, not just leaderboard models.`,
      },
    ],
    worked: [
      {
        title: "Forest overtakes logistic regression on click-through by 14%.",
        body: `Baseline logistic on standardized features: AUC 0.71; feature engineering thorough (interactions manual). Random forest default: 0.74; tuned max_features=0.3, depth=18, n=800: 0.79; gradient boosting LightGBM 2000 trees lr 0.03 early-stopped at 400: AUC 0.83, +17% relative over logistic — same features, zero preprocessing changes; the moral: when features are nonlinear interactions everywhere, trees discover them for free; the logistic model team celebrated learning what interactions existed by reading SHAP — both camps won.`,
      },
      {
        title: "Early stopping halts 2,400-tree overfit in a fraud model.",
        body: `Fraud detection, 3% positive class. LGBM 5,000 rounds planned, eval_metric auc; early stopping patience 150: stopped at 640 — val AUC peaked then degraded; without it, deploy-monitoring would reflect overfitting of rare fraud patterns; the saved trees never needed to exist; class weight 30× balanced training; threshold at cost-optimal 0.62 precision anyway; the whole config is now a paste-ready template for the team.`,
      },
      {
        title: "CatBoost eats 400 categorical columns raw.",
        body: `Retail demand forecasting: 380 categorical columns (store, SKU, promo, weather code), high cardinality, genuine interactions. Manual target encoding: leak-prone, hours of pipeline; CatBoost native: training days → hours, accuracy +6% over the encoded LightGBM, implementation −60% code; ordered boosting defeated target leakage by construction; the category handling alone justified migration; from now on in this team, categorical-heavy tabular data goes CatBoost-first.`,
      },
    ],
    exam: [
      {
        question:
          "Why do random forests decorrelate trees, and why does that matter?",
        answer:
          "Bagging shares the same signal — trees vote similarly, variance falls little; random feature subsets per split force different split candidates, breaking correlation; uncorrelated errors cancel like averaging independent measurements — the statistical engine of forest superiority over bagging.",
      },
      {
        question:
          "What does learning rate do to boosting, and what does early stopping enforce?",
        answer:
          "Each tree corrects a shrunken fraction of residuals — small steps (0.01-0.1) mean more, shallower, better-generalizing trees; early stopping freezes when val loss stops improving, capping effective complexity at the data's tolerance — without it, boosting is a noise memorizer with thousands of rounds.",
      },
      {
        question:
          "Why prefer permutation importance over MDI for feature selection?",
        answer:
          "MDI credits features that split well on training data — high-cardinality junk wins inflated scores; permutation importance measures actual val/test degradation when shuffling that feature — honest, model-agnostic, leakage-resistant; whenever features select, permute-and-observe, never trust the built-in score alone.",
      },
      {
        question: "When do trees fail catastrophically, and what then?",
        answer:
          "Linear-looking data: trees approximate diagonals with staircases — wasted capacity, poor extrapolation; tiny n: forests overfit anyway; extrapolation needs: outside training range, trees output flat junk — if you must predict in unseen regimes, add linear structure; neural/tabular hybrids or generalized additive models help when smoothness matters.",
      },
    ],
    cheat: [
      "Trees: scale-free, monotonic-invariant, interaction-catchers; no transform needed.",
      "Forest: bootstrap + feature subsets; OOB = free val; ~500 trees.",
      "Boosting: shallow trees + small lr + early stop on val — mandatory trio.",
      "LightGBM speed, XGBoost reliability, CatBoost categoricals.",
      "SHAP TreeSHAP for explanations; permutation importance for truth; MDI only for gossip.",
      "scale_pos_weight / class_weight for imbalance; monotone constraints for physics.",
    ],
    recap: `Trees and ensembles are tabular ML\'s default answer because they are adaptive, interaction-hungry, and calibration-free: forests kill variance with decorrelation, boosting kills bias sequentially, XGBoost/LightGBM/CatBoost iterate on scalability and categoricals, honest validation with early stopping or OOB keeps them civilized, and SHAP makes them auditable — usually the model to beat before any neural story begins.`,
    code: {
      title: "Boosting with early stopping",
      language: "python",
      code: `model = lgb.LGBMClassifier(n_estimators=5000, learning_rate=0.03, num_leaves=63)\nmodel.fit(Xtr, ytr, eval_set=[(Xval, yval)], callbacks=[lgb.early_stopping(200)])`,
      explanation:
        "The canonical three-line boosting recipe — thousands of rounds capped where validation says stop; depth and rate left to taste, discipline not.",
    },
    diagram: {
      title: "Ensemble family tree",
      caption: "Variance down, bias down, both win.",
      mermaid: `flowchart LR\n T[Tree] --> B[Bagging: forest]\n T --> G[Boosting: sequential]`,
    },
  },
  "ai-ml-classical-machine-learning-unsupervised-learning": {
    intro: `Unsupervised learning finds structure without labels — clusters, low-dimensional embeddings, anomalies — the techniques that turn unlabeled data floods into organized insight. The subject is the core toolkit: k-means and hierarchical clustering, PCA and embeddings, anomaly detection, and the discipline of validating unsupervised results. unsupervised learning is hypothesis generation — it proposes patterns your domain knowledge then confirms or discards.`,
    foundations: `Clustering: k-means (iterate assign-update; sensitive to init — k-means++; scale features first), hierarchical (agglomerative, dendrogram cut), DBSCAN (density — noise points, arbitrary shapes, ε and min_samples tricky), GMM (soft assignments, p(component) — probabilistic latent structure). Dimensionality reduction: PCA (linear, orthogonal directions of variance), kernel PCA (nonlinear), t-SNE/UMAP (visualization — preserve local structure; not for inference). Anomaly: isolation forests (random splits isolate outliers fast), LOF (local density ratio), robust z-scores. Validation: silhouette score, inertia elbow, stability under resampling, domain review — never trust a cluster your stakeholders cannot name.`,
    concepts: [
      {
        title: "k-means: the workhorse, with its known diseases.",
        body: `Algorithm: initialize k centroids (k-means++ — spread apart, much better than random); assign each point to nearest centroid; recompute centroids as means; repeat until stable; minimize within-cluster sum of squares; assumptions: spherical clusters of similar size, no noise sensitivity — outliers drag centroids (trim or use k-medoids for robustness); feature scaling mandatory (EUR vs age-in-years decision would be made by centimeters); choose k: elbow of inertia (diminishing returns), silhouette peak, or business constraints; k-means fails spectacularly on elongated/ring shapes — switch to DBSCAN or spectral methods when geometry demands.`,
      },
      {
        title: "Hierarchical clustering and dendrograms.",
        body: `Agglomerative: start with n singletons, merge closest pair iteratively; linkage criteria: single (min dist — chaining), complete (max — compact clusters), average, Ward (minimize within-cluster variance — best default Euclidean); dendrogram visualizes merge distances — cut where big jumps in height appear; pros: no k needed, nested structure emerges (customers within segments within enterprise), deterministic; cons: O(n²)-O(n³) — thousands of points max, or use Birch/mini-batch variants; visualize cut quality; interpret dendrograms with dendrogram-cutting tools; the method for understanding structure, slower for big data.`,
      },
      {
        title: "DBSCAN: density finds odd-shaped clusters.",
        body: `ε (neighborhood radius) and min_samples (density threshold): core points (≥min_samples in ε), border, noise; points connected through core chains form clusters — arbitrary shapes, automatic outlier flagging (the noise points are free anomaly detection); no k needed; sensitive to ε/min_samples — tune via k-distance plot (knee); scale features first; fails when densities vary wildly across clusters (HDBSCAN handles — hierarchical density, plots cluster tree); great for: geographic patterns, behavioral event data, curating training sets by removing junk clusters; the go-to when clusters are non-ellipsoidal or noise is the enemy.`,
      },
      {
        title: "PCA: the universal first pass.",
        body: `Center → covariance → eigendecompose → project onto top-k directions; explained_variance_ratio_ shows each PC\'s share; cumulative ratio plots → pick k; applications: visualization (2-3 PCs), noise reduction, collinearity removal, feature compression; interpret loadings (each PC = weighted feature combo — name them: PC1 = "budget-vs-luxury"); caveat: orthogonal constraints can merge unrelated correlated signals; PCA is linear — for manifold-structured data, kernel PCA or UMAP; always PCA before linear models with correlated features, huge sanity win; scale before PCA, always — variance is scale-absolute, so unscaled features bully direction selection.`,
      },
      {
        title: "Anomaly detection without labels.",
        body: `Isolation forest: random splits isolate anomalies in fewer partitions — score = average path length; contamination parameter sets expected anomaly rate (tune on known anomalies or business tolerance); LOF: compare local density to neighbors — catches local but not global outliers (and vice versa); statistical: 3.5-4σ univariate thresholds, Mahalanobis distance (multivariate — covariates correlation-aware), robust covariance (MCD); temporal anomalies in time series: STL residuals, EWMA control charts; always validate with injected anomalies (synthetic spikes) and human review samples — unsupervised alarms drown teams in false positives otherwise; route top-k to review queues, never auto-block.`,
      },
    ],
    worked: [
      {
        title: "Segment 2M customers into actionable cohorts.",
        body: `Features standardized: RFM (recency, frequency, monetary) + tenure + category diversity + return rate; k-means k chosen by silhouette + business parsimony (k=5 outperformed k=8 with negligible metric gain — elbow rule); segments named by stakeholders: "Loyal bulk-buyers", "Churn risks", "Bargain hunters", "New explorers", "Occasionals"; targeted campaigns per segment: uplift +18% vs untargeted baseline; clustering went from curiosity to quarterly marketing calendar — names made it usable.`,
      },
      {
        title: "PCA-compressed 1,200 survey features to 40 for regression.",
        body: `Employee engagement survey: 1,200 item features, multicollinearity everywhere, n=1,800. PCA → 41 components explaining 85% variance; ridge regression on PCs: R² 0.42 vs 0.71 raw-but-overfit (and uninterpretable); PC loadings gave readable themes (PC3 = "recognition deficit"); the reduction was both regularization and narrative; the 1,200 items were never load-bearing — they were 40 questions wearing a costume; the survey itself got redesigned next cycle.`,
      },
      {
        title: "DBSCAN prunes a poisoned training set.",
        body: `Image embedding space: 40k candidate product photos; k-means labels were junk on the long tail; DBSCAN ε from k-distance knee, min_samples 20: 38,100 in-cluster, 1,900 noise; manual review of 200 noise points: 85% junk (watermarked/corrupted/mislabeled); removing noise recovered 7 points of classifier accuracy; unsupervised pruning became a standard stage in every data intake — unsupervised earning its keep as janitor.`,
      },
    ],
    exam: [
      {
        question:
          "Why does k-means require feature scaling and k-means++ initialization?",
        answer:
          "Distance-based clusters inherit scale bias (a feature in units of 0-1000000 dominates); random inits land in worse optima (inertia stuck higher); k-means++ picks spread-out starts matching the objective geometry — converge faster, better clusters, reproducible-ish; scaling is non-optional, ++ is near-free.",
      },
      {
        question:
          "What does DBSCAN give you that k-means cannot, and at what cost?",
        answer:
          "Clusters of arbitrary shape and automatic noise labeling — no k, no ellipsoidal assumption; the cost: ε/min_samples are finicky to tune, varying density breaks single-ε in BOTH directions, and it does not scale beyond ~100k points without approximation — HDBSCAN relaxes the density stricture.",
      },
      {
        question:
          "Why should PCA be applied before linear regression on wide survey data?",
        answer:
          "Hundreds of correlated items inflate coefficient variance and unstable interpretations; PC directions are orthogonal — the design matrix becomes well-conditioned; noise absorbs into low-variance components; prediction stabilizes and effects become narrations — the survey interprets itself.",
      },
      {
        question: "Why is unsupervised output never deployable on face value?",
        answer:
          "There is no ground truth in the loop to fail visibly — clusters may be artifacts (scaling, outliers, seed variance); validate by stability across seeds/bootstrap, silhouette, domain naming, and downstream utility; a cluster nobody can name is a bug, not a discovery.",
      },
    ],
    cheat: [
      "Scale before distance; k-means++ always; elbow + silhouette for k.",
      "Ward linkage hierarchical for nested views; DBSCAN for shapes/noise.",
      "PCA: center, covariance, eigen; cumulative variance picks k; name PCs.",
      "t-SNE/UMAP for pictures, never for inference features.",
      "Isolation forest for anomalies; Mahalanobis for correlation-aware outliers.",
      "Validate: bootstrap stability, silhouette, domain names, downstream stakes.",
    ],
    recap: `Unsupervised learning surfaces structure from silence: k-means for compact spheres with elbow/silhouette tuning, hierarchical and density methods for shape and outliers, PCA as the universal linear compressor and denoiser, isolation forests for anomalies — all guarded by bootstrap stability and human-nameable clusters, because without labels the only truth available is the one stakeholders can say out loud.`,
    code: {
      title: "PCA with variance elbow",
      language: "python",
      code: `pca = PCA(n_components=0.9).fit(X_scaled)\nprint(pca.n_components_, pca.explained_variance_ratio_.sum())`,
      explanation:
        "Keep components explaining 90% variance — the orthogonal, orthogonal compressed representation; name the first few loadings before publishing them.",
    },
    diagram: {
      title: "Unsupervised discovery flow",
      caption: "Data in, hypotheses out, humans verify.",
      mermaid: `flowchart LR\n D[Unlabeled data] --> C[Cluster or reduce]\n C --> H[Hypotheses]\n H --> V[Domain validation]`,
    },
  },
  "ai-ml-classical-machine-learning-model-selection-and-evaluation": {
    intro: `Model selection and evaluation is the scientific method of ML — choosing between models, estimating honest performance, and knowing whether your new model is genuinely better or just luckier. The subject is validation protocols, cross-validation, the metric zoo, statistical comparison of models, error analysis, and avoiding the silent optimism of the leaderboard. the test set is a one-time referendum — spend it wisely or live with guesses.`,
    foundations: `Evaluation protocols: hold-out (train/val/test), k-fold CV, stratified folds, repeated CV, nested CV for unbiased selection-estimate. Metrics: classification — accuracy (only if balanced), precision/recall/F1, AUC-ROC, PR-AUC, log-loss, calibration curves; regression — MAE, RMSE, MAPE (never with zeros), R², quantile losses; ranking — NDCG, MAP, MRR; business — lift, revenue impact. Comparing models: paired tests (same splits!), bootstrap confidence intervals, McNemar (classification disagreement), corrected repeated CV tests; significance ≠ importance; report effect sizes. Error analysis: confusion matrix slices, subgroup metrics, worst-decile inspection, label noise audits.`,
    concepts: [
      {
        title: "Cross-validation: honest estimation machinery.",
        body: `k-fold splits data k ways; each fold serves once as test, rest train; average ± std of the metric — the estimate\'s uncertainty is the honesty; stratify classification folds for class balance; for time series: rolling-origin/blocked CV (never random folds across time!); repeated CV (5×10-fold) for stability on small data; nested CV: outer loop for unbiased estimate, inner for hyperparameters — the only defensible protocol when reporting a single number in a high-stakes context; compute cost k× training — pick fold counts to fit budget, but never trade folds for fold discipline.`,
      },
      {
        title: "The metric zoo: pick from cost, not comfort.",
        body: `Accuracy: fine when classes balance and errors equal-cost — rarely; precision vs recall per error economics (FP costs the review team vs FN costs the patient); F1 harmonic mean for symmetry; AUC-ROC: threshold-free quality, but flatters with huge negatives; PR-AUC: baseline = prevalence, no such flattery — use for rare positives; log-loss: calibration-respecting proper score — required when probabilities feed decisions; regression: MAE (robust, interpretable), RMSE (penalizes big misses), MAPE (ratio hell with zeros), quantile loss (predict intervals); ranking: NDCG@k, MAP, Recall@k for retrieval; every metric decision should cite the business event it prices.`,
      },
      {
        title: "Comparing models without fooling yourself.",
        body: `Same splits for both models (paired design!) — difference in fold metrics, then: paired t-test (quick, assumes normality), Wilcoxon signed-rank (nonparametric), bootstrap CI of mean difference, McNemar for classification contingency tables; corrected resampled t-test (Nadeau-Bengio) adjusts for CV dependence; standalone p<0.05 without effect size is malpractice — report ΔAUC, Δ$ lift, and CI; multiple comparisons: if 20 metrics, one will pass by luck — Bonferroni or FDR; pre-register the metric before looking; the reviewer\'s first question: "on how many splits, and with what variance?"`,
      },
      {
        title: "Error analysis: where the model actually fails.",
        body: `Beyond scalar metrics: confusion matrix by slices — which classes confuse, which subgroups (region, device, tenure) tank performance, which input distributions fail; worst-decile inspection: read 50 worst predictions by hand (the bug report generator!); label noise: many "model errors" are mislabeled rows (fix labels, retrain, instant gain); calibration per slice; subgroup parity audits for fairness basics; error clustering: embed errors, cluster, find the systematic causes; every production incident started as a known slice nobody measured; the model card should enumerate failure modes by slice, not just report one global F1.`,
      },
      {
        title: "Learning and validation curves: the diagnostic pair.",
        body: `Validation curve: metric vs hyperparameter (depth, λ) — finds the sweet spot; learning curve: metric vs training set size — high bias plateau (more data won\'t help — change model/features) vs high variance gap (more data or regularize helps); these two plots answer "should I collect more data?" — the most expensive question in ML, answered for free; always run learning curves before approving a data-acquisition request; plateau at 0.75 AUC with 800 examples: collect 5k more — or don\'t (variance vs bias tells which).`,
      },
    ],
    worked: [
      {
        title: "Model bakeoff with bootstrap CI decides the rollout.",
        body: `Boosting AUC 0.84 vs neural 0.845 — difference 0.005. 10 bootstrap resamples of test predictions: paired difference CI [−0.002, +0.013] — not distinguishable; deploy boosting (simpler, faster inference, team familiarity); the neural gain couldn\'t survive a CI; the decision memo took 30 minutes and saved a quarter of infra; bootstrap on prediction pairs is the cheapest credible comparison in applied ML.`,
      },
      {
        title: "Slice analysis finds the 12% accuracy cliff.",
        body: `Overall AUC looked healthy 0.83; sliced by user tenure: new users 0.61, all others 0.88. Root cause: new users lack behavioral history (feature sparsity) — cold-start problem; fix: population priors + onboarding survey features for <7-day users → 0.61→0.74; overall +2 points; the slice would have stayed invisible against the global number forever; every dashboard now slices by tenure by default — the model\'s blind spot became the roadmap.`,
      },
      {
        title: "Learning curves kill an unnecessary data buy.",
        body: `Proposed $60k data-labeling expansion for a support-ticket classifier. Learning curve: val metric plateaus at 80% with current 12k labels — gap train/val 0.5% (low variance), plateau = capacity/feature limit; recommendation: better text features and ensemble, no labeling; six weeks later 84% reached with the existing data; the curve paid for the meeting; always run this before signing data contracts.`,
      },
    ],
    exam: [
      {
        question:
          "Why must model comparisons use paired splits, and what breaks without it?",
        answer:
          'Different splits inject split variance into the comparison — model A may win by luck of easier test folds; paired designs eliminate that noise, isolating model difference; without pairing, you are comparing luck plus skill and calling it skill — the eternal source of illusory 2% "improvements".',
      },
      {
        question: "What is PR-AUC and when does it beat ROC-AUC conceptually?",
        answer:
          "PR-AUC averages precision across recall levels — its baseline is the positive prevalence, so it cannot be flattered by a flood of easy negatives; for rare-event problems (fraud 0.1%, disease 1%), PR-AUC is the honest signal while ROC-AUC claims heroic-looking 0.95 that hides poor retrieval.",
      },
      {
        question: 'Why do learning curves answer "should we buy more data?"',
        answer:
          "They reveal the asymptote and the gap: high bias plateau = data irrelevant until model/features change; large train-val gap = more data shrinks variance; the shape dictates whether labeling budget moves the metric — no other artifact answers this cheaper.",
      },
      {
        question: "What does repeated k-fold CV add over single k-fold?",
        answer:
          "Variance of the fold estimate shrinks — single 5-fold can differ by 2-3% across seeds; 5×10 repeated gives a CI worth quoting; the cost is a 5-10x compute bill for honest standard deviation — the price of statistical credibility.",
      },
    ],
    cheat: [
      "Splits define truth: time/grouped/stratified; test once; repeated CV for stability.",
      "Metric from cost asymmetry; PR-AUC for rare positives; log-loss for calibration.",
      "Paired comparisons + bootstrap CI; effect size + stats, always together.",
      "Slice everything: tenure, region, class; worst-decile read by hand.",
      "Learning curve before data buy; validation curve for λ/depth tuning.",
      "McNemar/paired t/Wilcoxon for classifiers; FDR for many metrics.",
    ],
    recap: `Evaluation is the scientific core of ML: paired splits for honest comparison, validation protocols matching the data\'s topology (temporal, grouped), metrics priced from error economics, significance paired with effect sizes, slices diagnose where models lie, and learning curves tell you whether to buy data or change models — the difference between ML practice and ML theater is having an honest testing protocol and the discipline to honor it.`,
    code: {
      title: "Bootstrap CI of paired difference",
      language: "python",
      code: `diffs = [(pred_a[idx].mean(), pred_b[idx].mean()) for idx in np.random.choice(len(idx_all), (500, len(idx_all)), replace=True)]`,
      explanation:
        "Resample prediction pairs together, keep the joint structure — the honest delta distribution between two models in a fifth of the time of CV reruns.",
    },
    diagram: {
      title: "Evaluation pipeline",
      caption: "Split, select, compare, audit.",
      mermaid: `flowchart LR\n S[Splits] --> M[Metric]\n M --> C[Paired comparison]\n C --> E[Error slices]`,
    },
  },
  "ai-ml-classical-machine-learning-feature-engineering": {
    intro: `Feature engineering is the craft of turning raw columns into model-consumable signal — encodings, scaling, text tokens, time features, leakage traps, and reproducible pipelines — usually the highest-leverage lever in applied ML before any algorithm choice. The subject is systematic transformation: what to build for which data, how to prevent leakage, and how to ship it without pipeline rot. the model only sees what you hand it — better features beat fancier algorithms with monotonous reliability.`,
    foundations: `Numerical: scaling (standardize/minmax/robust) — distance-based and gradient algorithms need it, trees don\'t; transforms: log/sqrt/Box-Cox for skew; clipping outliers; binning; polynomial/interactions (explosion risk — select few). Categorical: one-hot (low cardinality), ordinal encoding only when order real, target/mean encoding (high cardinality — cross-fit with out-of-fold to prevent leakage), hashing trick; embeddings for text-like high cardinality. Text: TF-IDF, n-grams, char grams. Time: year/month/day/weekday/is_weekend/quarter, holidays, cyclic encoding (sin/cos for periodic), lag features (careful! window must be past-only). Pipelines: sklearn ColumnTransformer/Pipeline — fit on train only, apply to all; no snooping.`,
    concepts: [
      {
        title: "Numerical preprocessing done right.",
        body: `Standardize (zero mean, unit var) default for gradient/linear/distance; min-max to [0,1] when bounded ranges known; robust scaling (median/IQR) for outlier-heavy; skewed positives → log1p first (adds interpretability: "per decade of usage"); cap at p99/p01 for crazy tails; binning when relationship nonlinear and algorithm linear-ish; interactions: only guided by EDA (multiply correlated pairs) or domain logic — never blanket polynomial at degree 3 for 100 features; imputation inside pipeline, median for skew, mode for categorical, indicators for informative missingness; fit on train only — the cardinal rule codified by Pipeline.`,
      },
      {
        title: "Categorical encodings without self-deception.",
        body: `One-hot for < 20 categories; high-cardinality: target encoding — mean(y) per category, but leak via train target → fit out-of-fold, smooth with global mean; hashing to fixed width (misses collisions but bounded memory, streaming safe); embedding tables for texts/ids at NN scale; unseen categories at inference → unknown bucket + override defaults; ordinal only if business order is real (S<M<L<XL yes, colors no); rare categories group as "OTHER"; frequency encoding as side feature; each encoding choice must be reproducible — serialize encoders with the model (the artefact is pipeline + weights).`,
      },
      {
        title: "Text features: from tokens to vectors.",
        body: `Simple text: TF-IDF with 1-2 grams, min_df 3, sublinear TF, stop words as domain-appropriate (keep for sentiment!); vocabulary cap 50k; for semantic needs: pretrained embeddings (sentence-transformers) as features into GBM/LogReg — small text + structured model often beats fine-tuned transformer on 10k rows; char n-grams capture typos/morphs; hashing vectorizer for streaming; cosine-similarity features (to key phrases) for rule-ish signals; length/readability counts as features too — metadata wins often over vocabulary; spell out text pipeline for audits; NLP expectations from data, not fashion.`,
      },
      {
        title: "Time features and lag discipline.",
        body: `Decompose ts into: calendar (weekday, month, quarter, is_holiday), trends (days_since_signup), cycles via sin/cos pairs (hour, day_of_week — cyclic distance preserved), lag/rolling features with strict causality — window must not include current label period; lag-7, lag-30, rolling mean 7/30 with shift matching prediction horizon; expanding means for cumulative signal; encode seasonality so shift-invariance breaks deliberately; never shuffle ts splits; alignment of events vs features — point-in-time join discipline (as-of joins in pandas/lakehouse SQL) is where time-series leaks hide.`,
      },
      {
        title: "Prevention of leakage in features — by construction.",
        body: `The three fatal sins: imputation/scaling fit on full data (moments from test bleed in!), target encoding without OOF honesty, rolling windows overlapping the label period; construction rules: every transform fit inside training folds only (sklearn Pipeline enforces beautifully); window features always end strictly before prediction time; IDs/timestamps in features usually = guilty; document per-feature availability time; group-aware split with user/account; adversarial validation: train a model to distinguish train-vs-test rows — if it can, distribution shift or leakage exists — fix or you are fooling yourself expensively.`,
      },
    ],
    worked: [
      {
        title: "Compression of 340 features to 40 without signal loss.",
        body: `Initial raw model weak; EDA revealed: 12 near-collinear pairs (VIF > 10), 60 features missing >40% informatively, 8 target leaks (fields captured post-event timestamp); dropped leaks (measured +4 points of honesty); merged collinear pairs into PCA components per group; missingness indicators retained where predictive (return_reason_was_missing +18% precision); final 42 features; CV stable; the "feature engineering" sprint was really a forensic audit — the most valuable kind.`,
      },
      {
        title: "Cyclic time encoding exposes a midnight dip.",
        body: `Raw hour-of-day (0-23 linear) found: model learned linear decay across days, missing cyclic continuity (23:59 close to 00:00). Re-encode hour sin/cos; residual pattern vanished; midnight surge correctly learned; model accuracy +3.5% in off-peak segment; the sin/cos trick is ten characters for a discovery the raw integer spent six months hiding.`,
      },
      {
        title: "Target encoding kills a high-cardinality model.",
        body: `Promo codes: 18k unique values, 1-hot a disaster. OOF target encoding with prior smoothing (α=20): train fold means computed out-of-fold, test set gets pure prior-shrunk estimates; no leakage; AUC +6 vs one-hot; encodings pickled with the model; monitoring for unseen codes at inference (distinct count alerts); the team now uses target encoding as default for any categorical > 50 uniques — leakage-aware or not at all.`,
      },
    ],
    exam: [
      {
        question:
          "Why must every preprocessing step be fit on training folds only, not the whole dataset?",
        answer:
          "Because any statistic computed from test data (means, categories, imputation values) leaks information backward into the features — your validation ceases to measure generalization and instead measures memorization of test artifacts; fold-internal fitting via sklearn Pipeline is the mechanical guarantee against it.",
      },
      {
        question:
          "What does out-of-fold target encoding solve, and what does it demand?",
        answer:
          "Using train labels means the encoded value knows the row's own outcome — memorization; OOF computes each train row's encoding from folds excluding itself; test encodings use full train statistics with prior smoothing; it demands honest fold isolation — one line of care, entire leak avoided, and it beats one-hot decisively on high cardinality.",
      },
      {
        question:
          "Why do cyclic sin/cos encodings beat raw hour-of-day integers?",
        answer:
          "Integers encode 23:59 and 00:00 as maximally distant when they are adjacent — periodic structure is destroyed; sin/cos place all 24 hours on a circle preserving adjacency in both directions — the linear model suddenly perceives the midnight boundary that was invisible in the raw scalar.",
      },
      {
        question:
          'What do a model\'s "unseen category" bucket and an "unknown" rule share?',
        answer:
          "Graceful degradation — production data always drifts: new codes, new countries, new SKUs; routes them to a learned default instead of crash or silent zero; both keep the pipeline deterministic at inference; robustness is a feature of the encoder, not luck of the input distribution.",
      },
    ],
    cheat: [
      "Scale numerics for distance/gradient; trees don't care; log-skew first.",
      "Target encode high-cardinality with OOF + prior smoothing; hash for streaming.",
      "TF-IDF for keyword-ish text; sentence-BERT features for semantic; metadata wins often.",
      "Cyclic sin/cos for hour/weekday; lag/roll windows end BEFORE prediction time.",
      "Pipeline fits on train only; encoders pickled with model; unseen → unknown.",
      "Missingness is signal — indicator columns may beat imputation.",
    ],
    recap: `Feature engineering is applied forensic rigor: numerical scaling matched to algorithm, leakage-proof categorical handling (OOF target encoding, hashing), text vectorized by task, time features cyclic and causal, and every transform fit inside validation folds — the discipline converts raw noise into honest signal, and the model finally learns what the business actually knows.`,
    code: {
      title: "OOF target encoding sketch",
      language: "python",
      code: `for tr_idx, val_idx in kf.split(X):\n enc = X[tr_idx].groupby(cat)['y'].mean(0)\n X[cat][val_idx] = X[cat][val_idx].map(enc)`,
      explanation:
        "Each row is encoded using only out-of-fold information — the single most important pattern for high-cardinality categorical leakage immunity.",
    },
    diagram: {
      title: "Feature pipeline",
      caption: "Raw to model-ready with no peeking.",
      mermaid: `flowchart LR\n R[Raw columns] --> T[Typed transforms]\n T --> L[Leakage guard: train-only fit]\n L --> F[Feature matrix]`,
    },
  },
  "ai-ml-classical-machine-learning-recommender-systems-basics": {
    intro: `Recommender systems predict what a user will engage with next — the engine behind every feed, storefront, and playlist. The subject is the two families — collaborative filtering and content-based methods — plus evaluation with ranking metrics, cold-start strategies, and the feedback loops that quietly concentrate everything on popular items. recommendation is structured prediction under constant drift, not a static lookup.`,
    foundations: `Collaborative filtering: users-like-you (user-user) or items-like-this (item-item) via similarity of interaction vectors (cosine, adjusted cosine); matrix factorization: R ≈ U Vᵀ — latent factors (dot products reconstruct preference); ALS (alternating least squares) for implicit feedback; SVD++ adds implicit signals. Content-based: item features (TF-IDF, embeddings) → predict from item similarity to user\'s history; hybrids combine both. Implicit feedback (clicks/views/purchases as 1/0) dominates industry — one-class problems needing weighted objectives; negatives are unobserved not dislikes. Evaluation: temporal splits only; metrics MAP@k, NDCG@k, Recall@k, coverage, novelty, serendipity. Feedback loops: popularity bias amplification — monitor diversity/coverage explicitly.`,
    concepts: [
      {
        title: "Collaborative filtering: memory vs model-based.",
        body: `User-user CF: find similar users by overlapping ratings/interactions, predict from neighbors' choices; item-item CF: precompute item-item similarity — stable, scalable for catalogs (one similarity matrix, fast lookups at inference); adjusted cosine handles user rating bias; both are O(mn) horror at scale — sparse matrices + approximate nearest neighbors (Annoy/FAISS) mandatory; model-based: matrix factorization R ≈ QPᵀ with regularization (λ(||q||²+||p||²)) — latent dimensions discover genre/taste axes no human labeled; implicit feedback: confidence weighting c = 1 + α·count (Hu-Koren-Volinsky); ALS for parallel alternation; factorization machines extend with features; the pattern: ALS for >10M users, SVD for moderate scale, item-item for simplicity.`,
      },
      {
        title: "Content-based recommenders: when CF starves.",
        body: `Item features → similarity → profile = aggregate of liked items (weighted centroid); recommendation = nearest items not yet seen; features: TF-IDF of text, category hierarchies, brand, price band, embeddings from content models (images/audio); strengths: works with 1 interaction, cold items fine, explainable ("because you watched...") — weaknesses: over-specialization (same-genre echo), limited serendipity; hybrids: CF score + content score weighted sum, or CF re-ranking of content top-N (diversity rescoring), or content features inside the factorizer (PolyFM, deepfm); content-based is also the bridge to solve cold starts entirely.`,
      },
      {
        title: "Cold start: the three droughts.",
        body: `New user: no history → popularity-weighted onboarding, onboarding quiz (topics), use signup metadata (locale, plan), demographics clustering, fall back to non-personalized trending for first sessions, rapidly adapt after 5-10 interactions (explore-exploit balance — bandits optimal); new item: no interactions → content-based similarity to known items, item cold boost (exploration slot in ranker), ensure every new item gets impressions to gather data; new system: bootstrap with content-based + popularity, collect data, switch hybrid when dense enough; every recommender\'s first week is content+popularity; plan it explicitly in the rollout.`,
      },
      {
        title: "Evaluation with ranking metrics and temporal splits.",
        body: `Time-aware splits only (train on past, test on future) — random splits leak future interactions into training catastrophically; metrics: Recall@k (did they interact with any of top-k?), NDCG@k (position-weighted quality), MAP, coverage (% catalog shown — diversity), novelty (self-informativeness), ILD (intra-list diversity); business: click-through, conversion, session length; offline≠online — shadow A/B to validate before user exposure; guard against popularity gaming: measure lift over popularity baseline on identical impressions; feedback loops: measure catalog coverage drift weekly — narrow → inject exploration; human eval of random slices; recommender quality is plural metrics, never one number.`,
      },
      {
        title: "Feedback loops and popularity collapse.",
        body: `Model promotes popular items → they get clicked → more data → more promotion — rich-get-richer loop strangles the long tail and variety; mitigations: exploration (ε-greedy/Thompson sampling allocation of some impressions), inverse propensity weighting in training (correct selection bias), diversity re-ranking (MMR), coverage quotas per slate, novelty bonuses for underexposed items; monitor: Gini coefficient of impressions over items, catalog coverage per week, % clicks on top-1% items — collapse indicators; exploration is the insurance premium for a healthy ecosystem; budget 5-10% of impressions deliberately.`,
      },
    ],
    worked: [
      {
        title: "ALS implementation for a 40M-event store.",
        body: `Data: implicit 1/0 from clicks + purchase weights ×3; confidence c=1+10×events; alpha cut at 50; user latents 64-dim, item latents same, λ=0.01, 15 iterations, alternating solver on Spark; validation: temporal last-30-days; Recall@20 0.31 vs 0.18 global popularity baseline; deployed top-50 per user refreshed nightly; CTR +38% over popularity-only prod; training 35 minutes; the simplest scalable thing beat the fancy pipeline that never shipped.`,
      },
      {
        title: "Fix a recommender doing nothing but Echo-Chamber pop.",
        body: `Top-20 lists were 70% the same item across all users; engagement "up" but catalog sales flat. Diagnostics: popularity concentration Gini 0.91; diversity intervention: MMR re-rank (λ=0.6 relevance/novelty) + 8% exploration impressions from mid-tail with success gate (≥1.2x baseline CTR) — mid-tail CTR stabilized, catalog coverage 14%→31%, 90-day revenue per user +11%; the fix was exploration budget, not model complexity.`,
      },
      {
        title: "Cold-start onboarding for a music service.",
        body: `New users churned at 46% in week one. New flow: 60-second genre/artist picker (5 taps) + default popular-in-locale playlist; hybrid init: content vector from picker genres as item priors, CF after 10 plays; week-1 churn 46%→31%; the lesson: onboarding is a recommender problem wearing UX clothes; two taps earlier, personalization never had the chance to exist.`,
      },
    ],
    exam: [
      {
        question:
          "Why are temporal splits non-negotiable in recommender evaluation?",
        answer:
          "User taste drifts and items die; random splits train on the future to predict the past — offline metrics inflate 20-50%, then crash in production; only past→future mirrors deployment; same rule as all sequential problems, no exceptions for recommendations.",
      },
      {
        question:
          "Why does implicit feedback need confidence weighting instead of raw 0/1?",
        answer:
          "Absence of interaction is ambiguous — not seeing an item is not hating it; treating non-actions as negatives teaches the model to suppress the unknown; confidence c=1+α×count turns frequency into strength of preference while absence stays weak; this one modeling decision separates workable implicit CF from noise averaging.",
      },
      {
        question:
          "What does the feedback loop do to catalog coverage, and how is it measured?",
        answer:
          "Amplifies popular items recursively — exposure→clicks→more exposure; catalog coverage and Gini of impressions quantify it; collapse means revenue over-relies on head SKUs and tail inventory dies; exploration budget and re-ranking arrest the spiral — managed systems measure this weekly like uptime.",
      },
      {
        question:
          "When is item-item CF superior to matrix factorization operationally?",
        answer:
          'When explainability and zero training cost matter, catalogs are moderate, and freshness of "similar items" lists is required without retraining latency — item similarity is computable incrementally and justifiable to merchants; MF wins on scale, personalization depth, and when latent structure beats hand-similarity.',
      },
    ],
    cheat: [
      "Time-split only; popularity baseline is the bar to beat.",
      "ALS for implicit at scale: c = 1 + α·count; λ small; 50-500 latents rarely needed.",
      "Content features for cold items + hybrids; item-item for instant neighbors.",
      "Recall@k, NDCG@k, coverage, novelty — plural metrics, always.",
      "ε-exploration 5-10% or diversity re-rank — popularity collapse or else.",
      "Cold starts: onboarding picks + priors → personalize fast.",
    ],
    recap: `Recommenders rank predicted engagement under drift: item-item for cheap stable neighborhoods, matrix factorization/ALS for latent taste at scale, content hybrids for cold starts and explanations, temporal evaluation with Recall/NDCG/coverage, and deliberate exploration to break popularity feedback loops — every architecture is honest only when measured against popularity with time-aware splits and watched for collapse.`,
    code: {
      title: "Confidence-weighted implicit ALS target",
      language: "python",
      code: `C = 1 + alpha * interactions # alpha ~ 40\nloss = np.sum(C * (P - U @ V.T) ** 2) + lam * (np.sum(U**2) + np.sum(V**2))`,
      explanation:
        "The Hu-Koren-Volinsky trick — frequency becomes confidence; absence becomes weak zero; the whole implicit-feedback field runs on this one weighting.",
    },
    diagram: {
      title: "Recommender architecture",
      caption: "Recall from CF/content, then rank, then explore.",
      mermaid: `flowchart LR\n U[User] --> R[Recall candidates]\n R --> K[Ranker]\n K --> E[Exploration slot]`,
    },
  },
  "ai-ml-classical-machine-learning-time-series-forecasting": {
    intro: `Time series forecasting predicts future values from ordered past observations — the domain of demand planning, capacity sizing, and anomaly detection — where every assumption of randomness breaks because order is the signal and yesterday explains tomorrow. The subject is the full craft: stationarity, ARIMA-family intuition, exponential smoothing, seasonal decomposition, and modern backtesting discipline with ML on lagged features. time never shuffles — every methodological rule follows from that single fact.`,
    foundations: `Components: trend (long-run direction), seasonality (periodic — week/year), cycles, residual noise. Stationarity: constant mean/variance/autocovariance — required by most classical models; check via ADF/KPSS tests; difference to achieve it (Δyₜ = yₜ - yₜ₋₁); transformations (log for multiplicative growth). ARIMA(p,d,q): p AR lags, d differencing order, q MA residuals — ACF/PACF for orders; SARIMA adds seasonal (P,D,Q,m). Exponential smoothing: weighted decay of history (α level, β trend, γ season); ETS state space models. Prophet: additive decomposition, holidays, changepoints — robust business tool. ML approach: lag features → GBM/linear models; careful with tsCV — rolling-origin evaluation only.`,
    concepts: [
      {
        title: "Stationarity first, or garbage in.",
        body: `Mean-reverting transform: plot raw — trend present? trending variance? (fan shape → multiplicative). Test: ADF (H₀ = unit root, want p < 0.05 to reject → stationary), KPSS reverse (H₀ = stationary). Transformations ladder: log for growth, difference for level drift (d=1 usually; d=2 rare), seasonal difference for cycles; re-test until stationary-ish; detrend via regression on time when trend is smooth; non-stationarity in raw scale doesn\'t block ML on lags (it learns), but classical models fail catastrophically — always diagnose first; differencing cost: loses absolute level — forecast drift long-horizon; document transforms.`,
      },
      {
        title: "ARIMA intuition without fear.",
        body: `AR(p): yₜ = c + φ₁yₜ₋₁ + ... + φₚyₜ₋ₚ + εₜ — autoregression on own lags; MA(q): yₜ = μ + εₜ + θ₁εₜ₋₁ + ... + θ_qεₜ₋q — correction from recent forecast errors; I(d): difference d times to stationarize; reading ACF/PACF: decaying ACF + cutoff PACF → AR; reverse → MA; both decay → mixed; software (pmdarima auto_arima, R forecast::auto.arima) selects by AIC/BIC — use it, don\'t hand-wave; SARIMA(P,D,Q,m) captures seasonal period (m=12 months, 7 days); residuals must be white noise — Ljung-Box test; if residuals have structure, model is underfit; horizon degrades with uncertainty widening — report prediction intervals, never point estimates alone for business.`,
      },
      {
        title: "Exponential smoothing and Prophet for business series.",
        body: `Simple ES: level via α-weighted average; Holt: + trend β; damped trend (φ<1) for realistic flattening; Holt-Winters: + seasonality (additive if amplitude constant, multiplicative otherwise — choose by fan check); ETS matrix framework (innovations state space) — statistical rigor via AIC selection; strength: zero training data needed, handles gaps/holidays gracefully; Prophet: y = trend + yearly/weekly seasonality + holidays + regressors; robust to missing data and outliers by design; changepoints auto-detected; ideal for messy daily business series with known holidays; performance: strong on typical retail/energy/web traffic — benchmark against naive seasonal baselines before celebrating.`,
      },
      {
        title: "ML on lagged features: the modern workhorse.",
        body: `Frame: predict yₜ from yₜ₋₁..yₜ₋ₙ, calendar features (weekday, month, holiday), rolling stats (mean/std 7/28), expanding stats, event flags; model: usually GBM (LightGBM) — captures nonlinear lag interactions; linear models fine with regularization; feature causality strict: all features computed from strictly past data; recursive vs direct multi-step: direct trains one model per horizon step (stable), recursive feeds predictions back (drift risk); backtesting: rolling-origin (origin slides forward) with fixed horizon; metrics per horizon: MAE/MAPE/RMSSE (RMSSE normalizes vs naive seasonal — the honest competitive metric); cross-validation blocked, never shuffled.`,
      },
      {
        title: "Seasonality and holidays: the business truth layer.",
        body: `Every real business series breathes periodically — detect via ACF peaks, periodograms, or plain plotting; model as Fourier terms (sin/cos pairs at k harmonics), seasonal dummies, or Holt-Winters/Prophet components; holidays and events dominate retail: build a holiday calendar per region (Black Friday, Ramadan, school breaks) as regressors/dummies — often ±30% of weekly variance; promotions/launches/price changes: include as step indicators; anomalies (COVID-like shocks) — model-break events; interventions via intervention analysis or dummy spikes; capacity planning loves damped-trend ETS + holiday table; the best forecast is the boring one properly season-adjusted.`,
      },
    ],
    worked: [
      {
        title: "Baseline check: seasonal naive beats four ML models.",
        body: `Weekly revenue forecast, horizon 13. Models: LGBM on lags (MAPE 8.1%), Prophet (7.4%), ETS seasonality (6.9%), seasonal naive (last-year-same-week) (6.2%) — the winner was free. The lesson: exotic models must beat seasonal naive before shipping; the seasonal model won because strong year-over-year growth was trend-dominated — ETS with multiplicative seasonality tracked it perfectly; adding a YoY trend regressor to LGBM closed gap to 6.0%; shipping policy changed: every new series gets seasonal naive first; pooled, it wins 35% of the time.`,
      },
      {
        title: "Rolling-origin backtest vs one lucky split.",
        body: `Single split test: model "wins" by 3% MAPE. Rolling-origin (8 folds, 4-week horizon each): model loses 2.1% mean, variance across folds ±4.5% — single split was luck. Redesigned: rolling-origin CV mandatory in CI for all forecasting PRs; decision: run pooled model (hierarchy: product → store) — variance halved; the retrain cadence moved to weekly with 8-week refit windows; the backtest infrastructure took 2 days, prevented a wrong $2M inventory bet.`,
      },
      {
        title: "DST gap nearly broke the pipeline.",
        body: `Hourly energy series: spring forward → 02:00 missing, fall back → duplicate hour. First pipeline: silent misalignment accumulating drift, forecasts shifted an hour by November. Fix: tz-aware timestamps end-to-end; gap → forward-fill flag weekend hours; duplicate → keep first max energy (or average) with anomaly flag; STL after fix: seasonal peak on the right hour again; the edge case that ships undetected for months — now a unit test on the ingestion stage asserts monotonic hourly continuity or quarantine.`,
      },
    ],
    exam: [
      {
        question: "Why does random k-fold CV destroy time series evaluation?",
        answer:
          "Random folds train on the future to predict the past — leakage masquerading as skill; temporal ordering is the data-generating process; only past-training/future-testing (rolling origin) measures true predictive power; the score becomes honest only under causal splits.",
      },
      {
        question:
          "What does the ADF test null hypothesis say, and which result do you want?",
        answer:
          "H₀: unit root present = non-stationary; you want p < 0.05 to reject and proceed with levels (or after differencing, re-test until stationary); KPSS is the complement check; both together are stronger evidence than either alone — assume nothing, test twice.",
      },
      {
        question:
          "Why do prediction intervals matter more than point forecasts for business?",
        answer:
          "Decisions under uncertainty (inventory, staffing, budget) depend on the tails — a single number gives false confidence; 80-95% intervals define stock cover, overflow costs, and alert thresholds; RMSSE alongside interval calibration (empirical coverage within ±5%) is the full evaluation conversation.",
      },
      {
        question: "What does damped trend fix in double exponential smoothing?",
        answer:
          "Linear trend extrapolated forever yields absurd long-horizon values — damping φ<1 bends the trend flat asymptotically, matching reality of saturation; it consistently improves medium-horizon forecasts — one parameter, large honesty gain.",
      },
    ],
    cheat: [
      "Test stationarity: ADF + KPSS; difference until sane; log for growth.",
      "Seasonal naive is the baseline to beat; RMSSE normalizes against it.",
      "auto.arima or ETS for classical; Prophet for business/holidays; GBM on lags for ML.",
      "Rolling-origin backtests only; never shuffle ts; report interval coverage.",
      "sin/cos for cycles; holiday dummies; lag < horizon leakage forbidden.",
      "Damped trend for long horizons; STL for visual diagnostics.",
    ],
    recap: `Time series forecasting is causal ML with a calendar: stationarity before models, seasonal naive as the bar, ARIMA/ETS/Prophet for classical elegance, lag-feature ML with strict causal windows for raw power — evaluated by rolling-origin backtests and honest intervals, never shuffled — because the only honest splin is tomorrow\'s accuracy measured against yesterday\'s fit.`,
    code: {
      title: "Rolling-origin splitter",
      language: "python",
      code: `for origin in pd.date_range('2025-01-01', '2026-06-01', freq='28D'):\n tr = df[df.ts <= origin]; te = df[(df.ts > origin) & (df.ts <= origin + pd.Timedelta(days=28))]`,
      explanation:
        "Origin slides forward; each fold trains only on its past; metrics averaged across folds — the evaluation shape that never flatters lies.",
    },
    diagram: {
      title: "Forecasting pipeline",
      caption: "Series in, calibrated forecast out.",
      mermaid: `flowchart LR\n S[Raw series] --> D[Decompose and stationarize]\n D --> M[Model choice]\n M --> B[Backtest rolling]`,
    },
  },
};

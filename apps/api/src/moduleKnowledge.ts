/**
 * Module Knowledge Packs
 * ----------------------
 * Original, hand-authored teaching material for every module in the three
 * learning universes. A lesson composer selects the concept cards that match
 * the requested topic and expands them into a long-form chapter together with
 * foundations, worked examples, exam practice and a cheat sheet.
 *
 * This is what makes the offline/local lesson genuinely useful: every topic in
 * the syllabus inherits a deep, subject-specific chapter instead of generic
 * study advice. Content is written from first principles, not copied.
 */

export type ConceptCard = { title: string; body: string; keywords: string[] };

export type ModulePack = {
  /** 2 short paragraphs introducing the subject area. */
  overview: string;
  /** Core theory paragraphs that every topic in the module stands on. */
  foundations: string[];
  /** Concept cards; the composer selects the ones closest to the topic. */
  concepts: ConceptCard[];
  /** Two fully worked examples. */
  worked: { title: string; body: string }[];
  /** Exam-style questions with complete answers. */
  exam: { question: string; answer: string }[];
  /** Dense revision bullets. */
  cheat: string[];
  code?: { title: string; language: string; code: string; explanation: string };
};

export const MODULE_KNOWLEDGE: Record<string, ModulePack> = {};

// ===================================================================== AI / ML

MODULE_KNOWLEDGE['Python and Data Foundations'] = {
  overview: `Almost every AI system starts as a Python program that moves, cleans, and reshapes data before a model ever sees it. The language itself is simple; the skill is learning to think in arrays, tables, and reproducible transformations instead of hand-written loops.

This module builds that foundation: Python semantics that prevent subtle bugs, NumPy's vectorized arithmetic, Pandas' table model, SQL for querying data at the source, and the visualization and ingestion skills that turn raw files into trustworthy datasets.`,
  foundations: [
    `Python uses names that point at objects, not boxes that contain values. Assignment binds a name to an object; passing an argument binds a new name inside the function. Mutable objects (lists, dicts, arrays, DataFrames) can therefore be changed by a function unless you copy them deliberately. Understanding this single model explains aliasing bugs, surprising defaults, and why in-place operations matter in data pipelines.`,
    `Vectorization replaces Python-level loops with whole-array operations implemented in C. The performance gap is not cosmetic: a loop over a million rows may take seconds while the equivalent NumPy expression takes milliseconds. More importantly, vectorized code expresses the mathematical operation directly, which makes shape errors and broadcasting mistakes easier to see and reason about.`,
    `Pandas and SQL share one mental model: a table is a collection of typed columns, and an operation either filters rows, derives columns, groups rows, or joins tables. Once you can translate a question into those four moves, both tools become interchangeable. The hard parts are index alignment, missing values, and join cardinality — not syntax.`,
  ],
  concepts: [
    { title: 'Names, references and mutability', keywords: ['python', 'syntax', 'functions', 'classes', 'typing', 'environment', 'packaging'], body: `A Python variable is a name bound to an object. \`a = b\` makes both names point at the same list, so appending through one is visible through the other. Use \`copy()\`, slices, or immutable tuples when a function must not mutate its input. Default arguments are evaluated once at function definition, so a mutable default such as \`items=[]\` is shared across every call — use \`None\` and create the list inside.` },
    { title: 'NumPy arrays, shapes and broadcasting', keywords: ['numpy', 'array', 'vectorized', 'broadcasting', 'operations'], body: `An ndarray is a typed, contiguous block of memory described by a shape and strides. Operations run elementwise after broadcasting aligns shapes from the right: (3,1) with (1,4) becomes (3,4). Broadcasting never copies data unless it must, so it is both fast and memory-efficient. Always check \`.shape\` before debugging a numerical result; most "wrong numbers" in ML code are shape or axis mistakes.` },
    { title: 'Pandas: index alignment and selection', keywords: ['pandas', 'dataframe', 'indexing', 'preparation', 'cleaning'], body: `A DataFrame is a set of columns sharing an index. \`.loc\` selects by label, \`.iloc\` by position; mixing them is a classic source of off-by-one errors. Operations align on the index, so two tables with different row order can produce unexpected NaNs. Reset or set the index deliberately before joins, and prefer explicit column selection over chained indexing.` },
    { title: 'Grouping, joins and aggregation', keywords: ['groupby', 'join', 'merge', 'aggregation', 'sql'], body: `Split-apply-combine is the core analytical pattern: group rows by a key, compute an aggregate per group, then join the result back. SQL's GROUP BY and Pandas' \`groupby\` express the same idea. Watch cardinality: a many-to-many join multiplies rows and silently inflates averages. Validate row counts before and after every join.` },
    { title: 'SQL as a data-access contract', keywords: ['sql', 'data science', 'query', 'select', 'postgres'], body: `SQL describes the result you want, not the loop that produces it. SELECT chooses columns, WHERE filters rows before grouping, GROUP BY collapses rows, HAVING filters groups, and ORDER BY is applied last. NULL is unknown rather than zero: \`NULL = NULL\` is not true, and aggregates ignore NULLs. Parameterized queries keep data separate from code and prevent injection.` },
    { title: 'Visualization as comparison', keywords: ['visualization', 'chart', 'matplotlib', 'plot', 'eda'], body: `A chart exists to make one comparison obvious. Choose the mark from the question: distribution → histogram or box plot; relationship → scatter; change over time → line; composition → stacked bar. Label axes with units, start bar charts at zero, and avoid dual axes. A plot that needs a paragraph of explanation is usually the wrong plot.` },
    { title: 'Ingestion: APIs, JSON and scraping', keywords: ['api', 'scraping', 'json', 'requests', 'web'], body: `API ingestion is a contract: authenticate, paginate, respect rate limits, validate the response schema, and persist the raw payload before transforming it. JSON nests, so normalize it into tables explicitly. Scraping is a last resort: prefer official APIs and respect robots.txt, terms, and copyright. Always make ingestion idempotent so a retry does not duplicate rows.` },
    { title: 'Polars and lazy dataframes', keywords: ['polars', 'dataframe', 'lazy', 'modern'], body: `Polars separates a lazy query plan from execution: you describe transformations, then \`.collect()\` lets the engine optimize and run them in parallel. It is columnar and multi-threaded, which helps on large tables. The mental model is the same as Pandas — filter, derive, group, join — so invest in the concepts, not the API names.` },
  ],
  worked: [
    { title: 'From a Python loop to vectorized feature engineering', body: `Suppose a dataset stores temperature in Celsius and you need Fahrenheit plus a flag for freezing. A loop appends one value at a time and is O(n) Python calls. Instead: \`f = c * 9 / 5 + 32\` computes the whole array at once, and \`(c <= 0)\` produces a boolean mask. The vectorized version is shorter, faster, and directly mirrors the formula. Check shapes before and after: if \`c\` is (n,1) and you intended (n,), reshape deliberately.` },
    { title: 'Answering a business question with SQL and Pandas', body: `Question: average order value per city for the last 30 days, only cities with at least 20 orders. SQL: filter with WHERE on the date, GROUP BY city, compute AVG(total), then HAVING COUNT(*) >= 20. Pandas: filter the frame, groupby('city'), agg(avg=('total','mean'), n=('id','count')), then filter n >= 20. The order matters: filtering rows before grouping is cheaper and semantically different from filtering groups after aggregation. Validate with a manual count for one city.` },
  ],
  exam: [
    { question: 'Why is a mutable default argument dangerous?', answer: 'It is created once when the function is defined and reused across calls, so mutations leak from one call to the next. Use None and create a fresh object inside the function.' },
    { question: 'What does broadcasting do for arrays of shape (4,1) and (1,5)?', answer: 'It aligns dimensions from the right and expands each to the other size, producing (4,5) without copying the original data.' },
    { question: 'Why can a join inflate an average?', answer: 'A one-to-many or many-to-many join duplicates rows. If the duplicated side has different weights, the aggregate is computed over a different population, not just the original rows.' },
  ],
  cheat: [
    'Names bind objects; mutable objects are shared unless copied. Mutable default args are shared across calls.',
    'Broadcasting aligns shapes from the right; check .shape before debugging any numeric result.',
    '.loc = labels, .iloc = positions. Reset the index before joins when alignment is unclear.',
    'SQL order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.',
    'NULL is unknown, not zero; COUNT(*) counts rows, COUNT(col) skips NULLs.',
    'Prefer vectorized expressions over Python loops; prefer explicit schemas over inference.',
  ],
  code: {
    title: 'Vectorized standardization with NumPy', language: 'python',
    code: `import numpy as np

def standardize(X: np.ndarray) -> np.ndarray:
    # X shape: (n_samples, n_features)
    mu = X.mean(axis=0, keepdims=True)      # (1, d)
    sigma = X.std(axis=0, keepdims=True)    # (1, d)
    sigma = np.where(sigma == 0, 1.0, sigma)
    return (X - mu) / sigma                 # broadcast to (n, d)

X = np.array([[1.0, 10.0], [2.0, 20.0], [3.0, 30.0]])
print(standardize(X).mean(axis=0))  # ~[0, 0]`,
    explanation: 'keepdims preserves the feature axis so the (1,d) statistics broadcast over (n,d). The zero-variance guard prevents division by zero for constant columns.',
  },
};

MODULE_KNOWLEDGE['Data Engineering Essentials'] = {
  overview: `Models are only as good as the data that reaches them, and most production failures are data failures: a late file, a duplicated batch, a renamed column, a label set that drifted. Data engineering is the discipline of making data arrive on time, complete, and traceable.

This module covers pipelines and orchestration, validation and contracts, human labeling loops, and the storage architectures — lakes, warehouses, and lakehouses — that determine what questions you can answer cheaply.`,
  foundations: [
    `A pipeline is a directed acyclic graph of tasks. Each node reads inputs, performs one transformation, and writes outputs; edges encode dependencies. The DAG is the contract: if task B depends on A, the orchestrator must not start B until A's output is complete and valid. Hidden dependencies — a task reading a table another team writes without declaring it — are how pipelines become fragile.`,
    `Idempotency is the difference between a pipeline you can rerun and one you are afraid to touch. A task is idempotent when running it twice with the same input produces the same state, usually by writing to a partition keyed by run date and replacing it atomically rather than appending blindly. Retries, backfills, and exactly-once claims all reduce to this property.`,
    `Storage architecture answers two questions: how cheaply can I retain raw data, and how quickly can I query modeled tables? A data lake stores raw files cheaply; a warehouse stores structured, indexed tables for fast SQL; a lakehouse adds table formats and metadata so the lake behaves like a warehouse. Choose based on query patterns and governance, not fashion.`,
  ],
  concepts: [
    { title: 'DAGs and orchestration', keywords: ['pipeline', 'orchestration', 'airflow', 'dag', 'schedule'], body: `Orchestration schedules tasks, enforces dependencies, retries failures, and records run history. Model each task as a pure function of its declared inputs. Avoid passing large data through the orchestrator; pass references (paths, table names). A good DAG makes backfills and partial reruns routine rather than heroic.` },
    { title: 'Idempotency and incremental loads', keywords: ['idempotent', 'incremental', 'watermark', 'batch'], body: `Incremental loading reads only new or changed rows using a watermark (timestamp, offset, or version). Store the watermark transactionally with the data, or recompute it from the destination. Write to a staging partition, validate, then swap atomically. Never assume an upstream timestamp is monotonic without proving it.` },
    { title: 'Schema validation and data contracts', keywords: ['quality', 'validation', 'schema', 'contract'], body: `A data contract states column names, types, nullability, ranges, and ownership. Validate at ingestion, not after the model trains. Fail loudly on missing required columns; quarantine suspicious rows instead of silently coercing them. Emit metrics for null rate, row count, and distribution drift so quality is observable.` },
    { title: 'Labeling and human feedback', keywords: ['labeling', 'feedback', 'annotation', 'human'], body: `Labels are a product with a specification, reviewers, and quality metrics. Write a labeling guide with positive and negative examples, measure inter-annotator agreement, and audit a sample continuously. Active learning prioritizes uncertain examples, which improves the model per label spent. Keep provenance: who labeled what, when, and with which guideline version.` },
    { title: 'Data lakes, warehouses and lakehouses', keywords: ['lake', 'warehouse', 'lakehouse', 'storage'], body: `A lake stores files (Parquet, JSON, images) cheaply but offers weak guarantees; a warehouse stores modeled tables with transactions and optimizers; a lakehouse adds open table formats (Iceberg, Delta, Hudi) for ACID, time travel, and schema evolution on lake storage. Small files and missing partitioning are the classic lake performance traps.` },
    { title: 'Partitioning, file formats and compaction', keywords: ['partition', 'parquet', 'compaction', 'storage'], body: `Partition by the columns you filter on most (usually date), keep files in the 100–500 MB range, and use columnar formats such as Parquet. Too many small files overwhelms metadata and slows scans; compact them periodically. Column pruning and predicate pushdown only help when the layout matches the query.` },
    { title: 'Lineage, observability and backfills', keywords: ['lineage', 'observability', 'backfill', 'monitoring'], body: `Lineage answers "which upstream change broke this table?" and "which dashboards depend on this column?". Record dataset versions and run IDs with every write. Monitor freshness, volume, schema, and distribution; alert on user-visible impact rather than every failed task. Backfills must be idempotent and rate-limited.` },
  ],
  worked: [
    { title: 'Designing a daily orders pipeline', body: `Extract yesterday's orders from the source API into a raw partition keyed by extract date; validate row count and schema; deduplicate by order_id keeping the latest status; join currency rates as of the order timestamp; write a modeled orders table partitioned by order_date; publish freshness and null metrics. Each step is idempotent, so a failed run can be replayed for the same date without duplicating revenue.` },
    { title: 'Diagnosing a duplicate-revenue report', body: `Revenue doubles on some days. Check the join: if orders are joined to payments many-to-one, each order repeats per payment attempt. Verify by counting raw rows before and after the join and comparing distinct order IDs. The fix is to aggregate payments to one row per order before joining, or move the join after the deduplication step. Add a uniqueness test on order_id in the modeled table.` },
  ],
  exam: [
    { question: 'What makes a pipeline task idempotent?', answer: 'Running it repeatedly with the same input produces the same destination state — typically by writing to a deterministic partition and replacing it atomically, not appending.' },
    { question: 'Why is a lakehouse attractive compared with a plain data lake?', answer: 'Open table formats add ACID transactions, schema evolution, and time travel on cheap object storage, so the lake supports reliable SQL modeling and incremental reads.' },
    { question: 'What is the risk of too many small Parquet files?', answer: 'Metadata and per-file overhead dominate scan time; compaction into larger files improves throughput and reduces planning cost.' },
  ],
  cheat: [
    'A DAG declares dependencies; hidden reads make it fragile. Pass references, not payloads.',
    'Idempotent = deterministic partition + atomic replace. Retries and backfills depend on it.',
    'Validate schema, nullability, ranges and row counts at ingestion; quarantine bad rows.',
    'Partition by common filters (date); target 100–500 MB files; compact small files.',
    'Labeling needs a guide, agreement metrics, continuous audit and provenance.',
    'Monitor freshness, volume, schema and drift — alert on user-visible impact.',
  ],
};

MODULE_KNOWLEDGE['Math and Statistics for ML'] = {
  overview: `Machine learning is applied mathematics with a feedback loop. Linear algebra gives you the language for data and parameters; calculus tells you how to change parameters to reduce error; probability models uncertainty; statistics tells you whether a result is real or noise.

This module rebuilds those tools with an ML lens: matrix shapes as data contracts, gradients as directions of improvement, distributions as assumptions, and estimators as decisions under uncertainty.`,
  foundations: [
    `A vector is a point or a direction; a matrix is a linear transformation. Matrix multiplication composes transformations, and its shape rule — (m,k)·(k,n) → (m,n) — is a data contract: the inner dimensions must match. Nearly every bug in a first neural network is a shape mismatch, so write shapes next to every step.`,
    `A derivative measures sensitivity: how much does the output change when one input moves? A gradient stacks those partial derivatives into the direction of steepest increase. Gradient descent steps opposite the gradient to reduce a loss. The chain rule lets us compose these sensitivities through layers, which is exactly backpropagation.`,
    `Probability turns uncertainty into arithmetic: a distribution assigns likelihoods to outcomes, expectation summarizes the centre, variance summarizes spread, and conditional probability updates beliefs given evidence. Statistics works in the other direction — from a sample back to a claim about the population, with an explicit error bar.`,
  ],
  concepts: [
    { title: 'Matrix shapes and multiplication', keywords: ['linear algebra', 'matrix', 'vector', 'multiplication'], body: `Track shapes as types: (n,d) data times (d,k) weights gives (n,k) predictions. Transposes swap axes; broadcasting adds implicit dimensions but does not change the math. If a result looks wrong, print shapes first, then values.` },
    { title: 'Eigenvalues, eigenvectors and SVD', keywords: ['eigenvalue', 'diagonalization', 'svd', 'matrix'], body: `An eigenvector of A is a direction A only stretches, with the eigenvalue as the stretch factor. SVD generalizes this to any matrix: A = UΣVᵀ, exposing dominant directions. PCA keeps the top singular directions of centered data; low-rank approximation keeps the largest singular values.` },
    { title: 'Conditional probability and Bayes', keywords: ['probability', 'bayes', 'conditional', 'statistics'], body: `P(A|B) = P(A∩B)/P(B) restricts the sample space to B. Bayes inverts the conditioning: P(A|B) ∝ P(B|A)P(A). Base rates dominate when events are rare, which is why a 99%-accurate test can still yield a 50% posterior at 1% prevalence.` },
    { title: 'Expectation, variance and covariance', keywords: ['expectation', 'variance', 'distribution', 'random variables'], body: `Expectation is linear even when variables are dependent; variance is not. Var(X+Y) = Var(X)+Var(Y)+2Cov(X,Y). Covariance captures linear co-movement, correlation normalizes it to [−1,1]. Independence implies zero covariance, but zero covariance does not imply independence.` },
    { title: 'Derivatives, gradients and the chain rule', keywords: ['calculus', 'gradient', 'derivative', 'optimization'], body: `For a scalar loss L and parameters θ, the gradient ∇θL points uphill. Update θ ← θ − η∇θL with learning rate η. The chain rule multiplies local derivatives along the computation graph; backpropagation is a reverse sweep that reuses intermediate results.` },
    { title: 'Convexity and optimization landscapes', keywords: ['optimization', 'convex', 'gradient descent', 'learning rate'], body: `A convex loss has one global minimum, so gradient descent converges with a suitable step size. Neural losses are non-convex: local minima, plateaus, and saddle points are normal. Momentum, adaptive step sizes, and good initialization change the trajectory, not the underlying landscape.` },
    { title: 'Entropy, cross-entropy and KL divergence', keywords: ['information theory', 'entropy', 'cross-entropy', 'kl'], body: `Entropy H(p) measures the bits needed to encode samples from p. Cross-entropy H(p,q) is the cost of coding p with a model q; it is minimized when q = p. KL divergence D(p‖q) = H(p,q) − H(p) is the extra cost, is non-negative, and is asymmetric.` },
    { title: 'Estimation, bias and variance', keywords: ['statistics', 'estimation', 'bias', 'variance'], body: `An estimator is a rule for guessing a population quantity from a sample. Bias is systematic error; variance is sensitivity to the particular sample. Mean squared error decomposes into bias² + variance + irreducible noise, which is the trade-off model complexity controls.` },
  ],
  worked: [
    { title: 'Deriving and applying a linear-regression gradient', body: `Model ŷ = Xw, loss L = (1/n)‖Xw − y‖². The gradient is ∇wL = (2/n)Xᵀ(Xw − y). Compute the residual r = Xw − y, then Xᵀr, and update w ← w − η∇. For X of shape (n,d), Xᵀr has shape (d,), matching w. A too-large η makes the loss oscillate or explode; a too-small η crawls.` },
    { title: 'Why accuracy misleads on rare events', body: `Suppose 1% of transactions are fraud. A model that predicts "not fraud" always scores 99% accuracy while catching zero fraud. Build the confusion matrix: TP, FP, FN, TN. Precision = TP/(TP+FP), recall = TP/(TP+FN). Choose the operating threshold from the cost of each error type, not from accuracy alone.` },
  ],
  exam: [
    { question: 'What shape does Xᵀ(Xw − y) have for X (n,d), w (d,)?', answer: '(d,). Xw − y is (n,), Xᵀ maps (n,) back to (d,), matching the parameter vector.' },
    { question: 'Why is KL divergence not a distance metric?', answer: 'It is asymmetric: D(p‖q) ≠ D(q‖p), and it does not satisfy the triangle inequality.' },
    { question: 'What does a learning rate that is too large do?', answer: 'It overshoots the minimum, causing oscillation or divergence of the loss.' },
  ],
  cheat: [
    'Shapes are contracts: (n,d)·(d,k) → (n,k). Print shapes before debugging values.',
    'Eigenvector: direction only stretched. SVD: A = UΣVᵀ; PCA keeps top singular directions.',
    'P(A|B) = P(A∩B)/P(B); Bayes: P(A|B) ∝ P(B|A)P(A). Rare events are dominated by base rates.',
    'E[X+Y] = E[X]+E[Y] always; Var(X+Y) needs covariance.',
    'Gradient points uphill; update θ ← θ − η∇L. Backprop = reverse chain rule.',
    'MSE = bias² + variance + noise. KL ≥ 0 and is asymmetric; cross-entropy = KL + entropy.',
  ],
};

MODULE_KNOWLEDGE['Classical Machine Learning'] = {
  overview: `Classical ML is the study of learning a mapping from features to targets with explicit assumptions and measurable generalization. It remains the right first tool for tabular data, small datasets, and problems where interpretability matters.

This module covers framing the problem, regression and classification, trees and ensembles, unsupervised structure, honest evaluation, feature engineering, recommendation, and forecasting. The unifying question is always: will this model work on data it has never seen?`,
  foundations: [
    `Supervised learning minimizes empirical risk: the average loss on training examples. But the goal is low loss on the population, so every design choice must protect against overfitting. Split data before you look at it, fit preprocessing on the training fold only, and keep a final test set untouched until the end.`,
    `The bias-variance trade-off explains the shape of learning curves. A model too simple underfits (high bias); a model too flexible memorizes noise (high variance). More data, regularization, and ensembling reduce variance; better features and a richer model reduce bias. Diagnose which one you have before changing anything.`,
    `Evaluation is a decision, not a number. Choose a metric that matches the cost of errors, a split that matches deployment (random, temporal, or grouped), and a baseline that a trivial model would achieve. If the metric can be gamed by predicting the majority class, it is the wrong metric.`,
  ],
  concepts: [
    { title: 'Problem framing and baselines', keywords: ['framing', 'problem', 'baseline', 'ml'], body: `Start from the decision the model will support, then choose the target and metric. A churn model that triggers discounts needs calibrated risk, not just ranking. Establish a majority-class and a simple linear baseline before training anything complex; if a forest cannot beat them, the features or framing are wrong.` },
    { title: 'Linear and logistic regression', keywords: ['regression', 'classification', 'linear', 'logistic'], body: `Linear regression predicts a weighted sum of features and is fit by least squares. Logistic regression maps that sum through a sigmoid to a probability and is fit by minimizing log loss. Coefficients are interpretable only with scaled features and no strong collinearity; regularization (L1/L2) stabilizes them.` },
    { title: 'Decision trees and impurity', keywords: ['tree', 'decision tree', 'impurity', 'gini'], body: `A tree recursively splits on the feature and threshold that most reduce impurity (Gini or entropy for classification, variance for regression). Deep trees memorize; limit depth, minimum samples per leaf, or prune. Trees handle mixed types and interactions without scaling, but are unstable to small data changes.` },
    { title: 'Bagging, random forests and boosting', keywords: ['ensemble', 'random forest', 'boosting', 'trees'], body: `Bagging trains many high-variance models on bootstrap samples and averages them, reducing variance. Random forests add feature subsampling to decorrelate trees. Boosting fits weak learners sequentially to the residual error, reducing bias but risking overfitting if the learning rate or number of rounds is too high.` },
    { title: 'Unsupervised learning: clustering and PCA', keywords: ['unsupervised', 'clustering', 'kmeans', 'pca'], body: `K-means alternates assignment and centroid updates to minimize within-cluster distance; it assumes roughly spherical, similarly sized clusters and needs k. PCA projects onto orthogonal directions of maximum variance. Both are exploratory: validate clusters with domain meaning and stability, not only silhouette scores.` },
    { title: 'Model selection and cross-validation', keywords: ['model selection', 'evaluation', 'cross-validation', 'kfold'], body: `K-fold cross-validation trains on k−1 folds and validates on the held-out fold, averaging the score. Stratify classification folds, group by entity when rows are not independent, and use time-ordered splits for forecasting. Nested CV separates hyperparameter selection from performance estimation.` },
    { title: 'Metrics: precision, recall, F1 and AUC', keywords: ['metrics', 'precision', 'recall', 'auc', 'evaluation'], body: `Precision = TP/(TP+FP) answers "when I say positive, how often am I right?" Recall = TP/(TP+FN) answers "how many positives did I catch?" F1 is their harmonic mean. ROC-AUC measures ranking across thresholds but can look optimistic under severe imbalance; PR-AUC is often more informative.` },
    { title: 'Feature engineering and leakage', keywords: ['feature engineering', 'leakage', 'encoding', 'scaling'], body: `Features should encode information available at prediction time. Fit scalers, encoders, and imputers inside cross-validation folds to avoid leakage. Target encoding needs out-of-fold statistics. Time-derived features must respect the prediction horizon — using tomorrow's value today is the most common silent leak.` },
    { title: 'Recommenders and collaborative filtering', keywords: ['recommender', 'collaborative filtering', 'recommendation'], body: `Collaborative filtering uses user–item interactions: user-based methods find similar users, item-based methods find similar items, and matrix factorization learns latent factors. The cold-start problem requires content features or popularity priors. Evaluate with ranking metrics (precision@k, NDCG), not accuracy.` },
    { title: 'Time-series forecasting', keywords: ['time series', 'forecasting', 'seasonality', 'trend'], body: `Forecasting must respect temporal order: no random shuffling. Decompose trend, seasonality, and noise; use lag features and rolling statistics; evaluate on a rolling-origin backtest. Baselines (last value, seasonal naive) are strong and must be beaten to justify a complex model.` },
  ],
  worked: [
    { title: 'Choosing a model for tabular churn prediction', body: `Start with logistic regression on scaled, imputed features to establish an interpretable baseline. Evaluate with stratified 5-fold CV using PR-AUC and recall at a fixed precision. If a gradient-boosted tree improves PR-AUC meaningfully, inspect feature importance and partial dependence for sanity. Keep the simpler model if the gain is within noise; the deployment cost of a complex model is real.` },
    { title: 'Diagnosing an overfit random forest', body: `Training accuracy is 0.99, validation accuracy 0.72. The gap indicates high variance. Reduce tree depth, raise minimum samples per leaf, and use fewer features per split. Add more data if possible. Re-check that preprocessing was fit only on training folds — a scaler fit on the full dataset can inflate validation scores and mask the real problem.` },
  ],
  exam: [
    { question: 'Why is accuracy a poor metric for 1% fraud detection?', answer: 'Predicting all-negative achieves 99% accuracy while catching no fraud. Precision, recall, PR-AUC, and cost-weighted metrics reflect the actual task.' },
    { question: 'What is data leakage in cross-validation?', answer: 'Information from outside the training fold (or from the future) influences training, inflating validation performance and producing a model that fails in deployment.' },
    { question: 'Bagging vs boosting?', answer: 'Bagging trains independent models on bootstrap samples and averages to reduce variance. Boosting fits models sequentially to residuals to reduce bias.' },
  ],
  cheat: [
    'Frame the decision → choose metric → baseline → simple model → only then complexity.',
    'Fit preprocessing inside folds; never touch the test set until the end.',
    'Trees: impurity reduction; limit depth/leaf size. Forests reduce variance; boosting reduces bias.',
    'K-means assumes spherical clusters; choose k with domain meaning + stability.',
    'Precision = TP/(TP+FP); Recall = TP/(TP+FN); F1 harmonic mean; PR-AUC for imbalance.',
    'Time series: temporal splits, lag features, rolling-origin backtest, seasonal-naive baseline.',
  ],
};

MODULE_KNOWLEDGE['Deep Learning'] = {
  overview: `Deep learning replaces hand-designed features with learned representations. A neural network is a stack of differentiable transformations trained end-to-end by gradient descent; depth lets early layers learn simple patterns that later layers compose into abstract concepts.

This module covers the mechanics that make training work: layers and activations, backpropagation, optimization, normalization and regularization, convolutional and sequence architectures, generative models, mixed precision, distributed training, and the emerging study of what individual circuits inside a network compute.`,
  foundations: [
    `A dense layer computes y = σ(Wx + b): a linear map followed by a nonlinearity. Without the nonlinearity, stacked layers collapse into one linear map no matter how deep the stack. Common activations trade saturation for smoothness — ReLU is cheap and sparse, GELU is smoother, sigmoid/tanh saturate and slow deep gradients.`,
    `Training alternates a forward pass that computes predictions and loss with a backward pass that applies the chain rule to compute gradients. The optimizer updates every parameter. Batch size, learning rate, initialization, and normalization interact: changing one often requires retuning another. Loss curves are the primary diagnostic — train loss alone is never enough.`,
    `Generalization is controlled by capacity and regularization. Weight decay, dropout, early stopping, data augmentation, and label smoothing all restrict the model's ability to memorize. Normalization layers stabilize optimization, not just scale; where they sit inside a block materially changes training dynamics.`,
  ],
  concepts: [
    { title: 'Backpropagation and computation graphs', keywords: ['neural network', 'fundamentals', 'backprop', 'gradient'], body: `Every operation in the forward pass becomes a node in a computation graph. Backprop walks that graph in reverse, multiplying local Jacobians to accumulate ∂L/∂θ. Frameworks build the graph automatically, but knowing it explains vanishing gradients, in-place operation errors, and why detaching a tensor stops gradients.` },
    { title: 'PyTorch training loop', keywords: ['pytorch', 'training', 'optimizer', 'dataloader'], body: `A PyTorch loop: zero gradients, forward pass, compute loss, backward pass, optimizer step. The DataLoader handles batching and shuffling; the model moves to the device once and every input must follow. Call model.train() for training and model.eval() for validation so dropout and batch-norm behave correctly.` },
    { title: 'Optimizers, learning rate and schedules', keywords: ['optimization', 'adam', 'sgd', 'learning rate'], body: `SGD with momentum follows a smoothed gradient; Adam adapts a per-parameter step using first and second moment estimates. Adam is a strong default, but well-tuned SGD can generalize better on vision tasks. Warmup plus cosine decay is a robust schedule for transformers; a bad learning rate dominates every other choice.` },
    { title: 'Normalization and regularization', keywords: ['normalization', 'regularization', 'batchnorm', 'dropout', 'layer norm'], body: `BatchNorm normalizes across the batch, accelerates training, and depends on batch statistics; LayerNorm normalizes per example and is standard in transformers. Dropout randomly zeroes activations during training only and is disabled at inference. Weight decay shrinks parameters; early stopping chooses the checkpoint with the best validation loss.` },
    { title: 'CNNs and computer vision', keywords: ['cnn', 'vision', 'convolution', 'conv'], body: `Convolutions exploit locality and weight sharing: the same filter slides across the image, so translation patterns are learned with far fewer parameters than a dense layer. Padding controls spatial size, stride downsamples, and pooling aggregates. Receptive field grows with depth; modern vision models increasingly use attention instead.` },
    { title: 'Sequence models and attention', keywords: ['sequence', 'rnn', 'lstm', 'attention'], body: `RNNs process tokens one at a time and carry a hidden state, but suffer from vanishing gradients over long sequences. LSTMs add gates to preserve information longer. Attention lets every position look at every other position directly, removes the sequential bottleneck, and is the basis of transformers.` },
    { title: 'Generative models', keywords: ['generative', 'vae', 'gan', 'diffusion'], body: `Autoencoders learn compressed representations; VAEs add a probabilistic latent space; GANs pit a generator against a discriminator; diffusion models learn to reverse a gradual noising process. Each makes a different trade-off between sample quality, training stability, likelihood estimation, and controllability.` },
    { title: 'Mixed precision and distributed training', keywords: ['mixed precision', 'distributed', 'gpu', 'training'], body: `FP16/BF16 arithmetic speeds up matmuls and reduces memory; loss scaling prevents underflow with FP16. Data parallelism replicates the model and averages gradients; tensor and pipeline parallelism split the model across devices. Communication becomes the bottleneck as scale grows.` },
    { title: 'Mechanistic interpretability', keywords: ['interpretability', 'mechanistic', 'circuits', 'features'], body: `Mechanistic interpretability reverse-engineers circuits: attention heads, MLP neurons, and the features they write to the residual stream. Techniques include activation patching, probing, sparse autoencoders, and ablations. The goal is causal understanding, not plausible-looking attention maps.` },
  ],
  worked: [
    { title: 'Why a deep network with no activations is linear', body: `Let h₁ = W₁x and h₂ = W₂h₁. Then h₂ = W₂W₁x = Wx — one linear map. Adding σ between layers prevents this collapse: h₂ = W₂σ(W₁x) is no longer reducible. This is the entire reason nonlinearities exist; depth without them buys nothing but parameters.` },
    { title: 'Reading training curves', body: `Train and validation loss both high: underfitting — increase capacity, train longer, improve features. Train low, validation high and diverging: overfitting — regularize, augment, reduce capacity, get more data. Loss spikes after a learning-rate change: lower the rate or add warmup. Validation flat while train falls: the model is memorizing; stop and inspect the data pipeline for leakage.` },
  ],
  exam: [
    { question: 'Why are nonlinear activations necessary in a deep network?', answer: 'Without them, the composition of layers is still a single linear transformation, so depth adds no expressive power.' },
    { question: 'What does BatchNorm do at inference time?', answer: 'It uses running statistics collected during training rather than the current batch statistics.' },
    { question: 'Why can attention handle long-range dependencies better than an RNN?', answer: 'Every position attends directly to every other position in one step, avoiding the sequential hidden-state bottleneck that causes vanishing gradients.' },
  ],
  cheat: [
    'Layer = linear map + nonlinearity. Stacking linear maps collapses to one linear map.',
    'Training loop: zero_grad → forward → loss → backward → step. train()/eval() matters.',
    'Adam adapts per-parameter steps; warmup + cosine decay is a strong default.',
    'BatchNorm uses batch statistics; LayerNorm per example; dropout only during training.',
    'CNNs: locality + weight sharing. Attention: all-to-all, no sequential bottleneck.',
    'Low train + high validation = overfit; both high = underfit. Diagnose before tuning.',
  ],
  code: {
    title: 'A minimal PyTorch training step', language: 'python',
    code: `import torch
from torch import nn

model = nn.Sequential(nn.Linear(10, 32), nn.ReLU(), nn.Linear(32, 1))
opt = torch.optim.AdamW(model.parameters(), lr=3e-4)
loss_fn = nn.BCEWithLogitsLoss()

for xb, yb in loader:              # xb: (batch, 10), yb: (batch, 1)
    model.train()
    opt.zero_grad()
    logits = model(xb)
    loss = loss_fn(logits, yb)
    loss.backward()
    opt.step()

model.eval()
with torch.no_grad():
    probs = torch.sigmoid(model(x_val))`,
    explanation: 'BCEWithLogitsLoss combines sigmoid and binary cross-entropy for numerical stability. eval() plus no_grad() disables dropout and graph construction during validation.',
  },
};

MODULE_KNOWLEDGE['NLP and Language Models'] = {
  overview: `Natural language processing turns text into representations a model can compute with, then uses those representations to classify, retrieve, generate, and reason. The field moved from hand-built features to embeddings, then to pretrained transformers, and now to instruction-tuned and reasoning models.

This module covers the full stack: tokenization and embeddings, the transformer architecture, the Hugging Face ecosystem, fine-tuning and alignment, prompting, evaluation, multilingual and speech systems, reasoning models, context engineering, and parameter-efficient fine-tuning.`,
  foundations: [
    `Text is discrete; models need vectors. Tokenization splits text into subword units, and an embedding table maps each token id to a dense vector. Subword tokenization balances vocabulary size against sequence length and handles unseen words by composition. Token counts, not word counts, determine cost and context limits.`,
    `The transformer block alternates self-attention, which mixes information across positions, with a position-wise feed-forward network, which transforms each position. Residual connections and normalization keep deep stacks trainable. Causal masking makes a decoder unable to see future tokens, which is what allows next-token prediction to be a valid training objective.`,
    `Pretraining learns general language structure from massive text; fine-tuning adapts the model to a task or preference distribution. Alignment adds instruction following and safety behavior. Every stage changes the model's behavior, so evaluation must match the deployment task rather than a generic benchmark.`,
  ],
  concepts: [
    { title: 'Tokenization and embeddings', keywords: ['nlp', 'foundations', 'tokenizer', 'embedding'], body: `Byte-pair encoding learns frequent subword merges, giving a compact vocabulary that can represent any string. The embedding matrix is learned; similar tokens end up in nearby directions. Special tokens mark sequence boundaries and padding. Always use the tokenizer that matches the checkpoint — mismatches silently degrade quality.` },
    { title: 'Self-attention and the transformer block', keywords: ['transformer', 'attention', 'self-attention', 'architecture'], body: `Q, K, V projections turn each token into a query, key, and value. Scores QKᵀ/√d measure relevance, softmax turns them into weights, and the weighted sum of values mixes context. Multi-head attention runs several subspaces in parallel. The FFN then transforms each position independently.` },
    { title: 'Hugging Face ecosystem', keywords: ['hugging face', 'ecosystem', 'transformers', 'datasets'], body: `The Hugging Face Hub hosts checkpoints, tokenizers, datasets, and adapters. \`AutoTokenizer\` and \`AutoModel\` load the matching classes from a checkpoint id. \`Trainer\` wraps the training loop, evaluation, and checkpointing. Pin revisions in production so an upstream update cannot change your model silently.` },
    { title: 'Fine-tuning and instruction tuning', keywords: ['fine tuning', 'alignment', 'sft', 'instruction'], body: `Supervised fine-tuning trains on input→output demonstrations, usually with a lower learning rate than pretraining. Instruction tuning is SFT on diverse task descriptions so the model generalizes to new instructions. Data quality dominates: a small, clean, diverse set beats a large noisy one.` },
    { title: 'Prompt engineering as specification', keywords: ['prompt engineering', 'prompt', 'context'], body: `A prompt is a specification: role, task, constraints, input, and output format. Put instructions before long context, use delimiters, and give one or two examples when format matters. Ask for structured output and validate it. Prompt changes are experiments — version them and measure.` },
    { title: 'Evaluation and benchmarks', keywords: ['evaluation', 'benchmarks', 'llm evaluation'], body: `Benchmarks measure capability; your evaluation set measures fitness for your task. Build a golden set with expected answers and edge cases, score with task-specific metrics, and include human review for generation quality. Watch for contamination: public benchmark questions may already be in pretraining data.` },
    { title: 'Alignment: RLHF and preference learning', keywords: ['alignment', 'rlhf', 'preference', 'dpo'], body: `RLHF trains a reward model from human comparisons, then optimizes the policy against it with a KL penalty to stay near the reference model. DPO skips the explicit reward model and optimizes preference pairs directly. Both risk reward hacking: the proxy improves while the true objective does not.` },
    { title: 'Context engineering and long context', keywords: ['context engineering', 'long context', 'lost in the middle'], body: `Context is a budget. Put the most important instructions and evidence at the start and end; models attend least reliably to the middle. Retrieve only relevant chunks, deduplicate, and cite sources. Summarize conversation history instead of appending forever. Measure performance as context grows.` },
    { title: 'Reasoning models and test-time compute', keywords: ['reasoning', 'test-time compute', 'chain of thought'], body: `Reasoning models spend additional tokens at inference time exploring intermediate steps. More test-time compute can improve hard tasks but costs latency and money. Not every task benefits: simple extraction may get slower and no more accurate. Route tasks by difficulty.` },
    { title: 'LoRA and QLoRA', keywords: ['lora', 'qlora', 'fine-tuning llm', 'peft'], body: `LoRA freezes the base weights and trains low-rank adapters on selected projections, cutting trainable parameters by orders of magnitude. QLoRA additionally quantizes the frozen base to 4-bit. Both make fine-tuning feasible on a single GPU; merge adapters for deployment or serve them separately.` },
    { title: 'Speech and audio', keywords: ['speech', 'audio', 'asr', 'whisper'], body: `Speech pipelines convert audio to features (mel spectrograms), then to text with an acoustic model and decoder. Whisper-style models are trained on large weakly supervised corpora. Evaluate with word error rate; domain vocabulary, accents, and noise dominate real-world quality.` },
    { title: 'Multilingual and low-resource NLP', keywords: ['multilingual', 'low-resource', 'language'], body: `Multilingual models share a subword vocabulary and representations across languages, enabling zero-shot transfer. Low-resource languages benefit from transfer learning, data augmentation, and community-produced data. Evaluate per language; a strong average can hide a failing language.` },
  ],
  worked: [
    { title: 'Why scaling by √dₖ keeps attention stable', body: `If q and k have independent entries with unit variance, their dot product has variance dₖ. Without scaling, logits grow with dimension and softmax saturates: one weight ≈ 1 and the rest ≈ 0, so gradients vanish. Dividing by √dₖ normalizes the variance to about 1, keeping attention weights and gradients healthy.` },
    { title: 'Choosing between prompting, RAG and fine-tuning', body: `Prompting is fastest and cheapest; use it when the task is well described and the model already knows the domain. RAG adds external, fresh, or private knowledge without changing weights; use it when answers must be grounded and citable. Fine-tuning changes behavior and style; use it when prompting cannot reliably produce the format or reasoning you need. They compose: fine-tune the behavior, retrieve the facts.` },
  ],
  exam: [
    { question: 'Why divide attention scores by √dₖ?', answer: 'Dot products grow with dimension; scaling keeps their variance near 1 so the softmax does not saturate and gradients remain useful.' },
    { question: 'What is the difference between fine-tuning and RAG?', answer: 'Fine-tuning changes model weights to learn behavior or style; RAG supplies external knowledge at inference time without changing weights.' },
    { question: 'Why can public benchmarks overstate real ability?', answer: 'Contamination: benchmark examples may appear in pretraining data, so the model has effectively seen the test set.' },
  ],
  cheat: [
    'Token counts set context cost, not word counts. Match the tokenizer to the checkpoint.',
    'Attention: QKᵀ/√d → softmax → V. Multi-head = parallel subspaces. FFN per position.',
    'Prompt = role + task + constraints + input + output format. Version and evaluate prompts.',
    'Golden-set evaluation with task metrics beats generic benchmark scores.',
    'RLHF uses a reward model + KL penalty; DPO optimizes preference pairs directly.',
    'LoRA trains low-rank adapters; QLoRA adds 4-bit base quantization.',
  ],
};

MODULE_KNOWLEDGE['Generative AI Applications'] = {
  overview: `A generative AI application is a system, not a model. It retrieves evidence, prompts a model, validates output, calls tools, and handles failure. The engineering discipline is making that system grounded, observable, and safe.

This module covers embeddings and semantic search, retrieval-augmented generation, agents and tool use, multimodal inputs, application architecture, structured extraction, red teaming, quantization, and synthetic data.`,
  foundations: [
    `Embeddings map text, images, or audio into vectors where semantic similarity becomes geometric proximity. Retrieval works because a query vector can be compared against a precomputed index efficiently. The quality of an application depends more on chunking, indexing, and reranking than on the elegance of the prompt.`,
    `Generation is probabilistic and ungrounded by default: the model produces plausible text, not verified facts. A production system adds evidence, citations, schema validation, and refusal paths. Every generated claim that matters must be traceable to a source or checked by a tool.`,
    `Agents add control flow: the model chooses actions, observes results, and iterates. That flexibility multiplies failure modes — loops, unsafe tool calls, prompt injection, runaway cost. Bound the loop, validate every tool argument, and log the full trajectory so failures are diagnosable.`,
  ],
  concepts: [
    { title: 'Embeddings and semantic search', keywords: ['embeddings', 'semantic search', 'vector'], body: `An embedding model maps input to a fixed-size vector; cosine similarity ranks semantic closeness. Normalize vectors and use the same model for queries and documents. Approximate nearest-neighbour indexes trade recall for speed. Evaluate retrieval with recall@k before blaming the generator.` },
    { title: 'RAG: chunking, retrieval, reranking, generation', keywords: ['rag', 'retrieval', 'chunking', 'reranker'], body: `Split documents into coherent chunks with overlap, embed them, and store metadata for filtering. Retrieve top-k candidates, rerank with a cross-encoder for precision, then generate with explicit instructions to answer only from the evidence and cite it. Measure retrieval recall separately from answer faithfulness.` },
    { title: 'Agents and tool use', keywords: ['agents', 'tool use', 'function calling'], body: `Define tools with narrow, validated schemas. The model proposes a call; the runtime validates arguments, executes, and returns an observation. Bound iterations, require confirmation for side effects, and treat tool output as untrusted text. A deterministic workflow is often safer than an open-ended agent.` },
    { title: 'Multimodal AI', keywords: ['multimodal', 'vision', 'image'], body: `Multimodal models align images and text in a shared representation or fuse them inside the transformer. For documents, OCR quality dominates. For images, resolution and preprocessing matter. Evaluate each modality separately and test combinations, because a model can be strong in one and weak in another.` },
    { title: 'LLM application architecture', keywords: ['llm application', 'engineering', 'architecture'], body: `Separate concerns: retrieval, prompt construction, model call, validation, and telemetry. Use queues for long jobs, timeouts and retries for providers, and a fallback model. Cache deterministic results. Log prompt version, model version, latency, tokens, and outcome for every call.` },
    { title: 'Structured data extraction', keywords: ['structured', 'extraction', 'json', 'schema'], body: `Ask for a JSON schema and validate it. Use function calling or constrained decoding where available. Handle missing fields explicitly, reject extra fields, and retry with the validation error. For high-stakes extraction, require span-level evidence for each field.` },
    { title: 'AI red teaming', keywords: ['red teaming', 'safety', 'security'], body: `Red teaming probes prompt injection, data exfiltration, unsafe tool use, bias, and hallucination. Treat retrieved content and user uploads as hostile. Test indirect injection through documents, not just direct chat. Record failures as regression tests and re-run them after every model or prompt change.` },
    { title: 'Quantization and compression', keywords: ['quantization', 'compression', 'int4'], body: `Quantization stores weights and sometimes activations in lower precision. Post-training methods (GPTQ, AWQ) use calibration data to minimize error; GGUF formats support CPU inference. Measure quality on your task, not just perplexity. INT8 is usually safe; INT4 needs evaluation.` },
    { title: 'Synthetic data and self-improvement', keywords: ['synthetic data', 'self-improvement', 'distillation'], body: `Strong models can generate training data for smaller ones, but naive self-training amplifies errors and collapses diversity. Filter by quality, deduplicate, keep a human-reviewed slice, and never train only on model outputs. Synthetic data is most useful for format, edge cases, and coverage.` },
  ],
  worked: [
    { title: 'Debugging a RAG answer that cites the wrong policy', body: `First check retrieval: was the correct chunk in the top-k? If not, fix chunking or the query embedding. If it was retrieved but ignored, inspect the prompt ordering and reranker. If the answer blends two policies, require per-claim citations and reject unsupported statements. Measure recall@k and faithfulness separately so you fix the right stage.` },
    { title: 'Designing a document extraction pipeline', body: `Parse the PDF, preserve page numbers, run OCR if needed, and chunk by section. For each requested field, prompt with the schema and require the supporting quote and page. Validate types and ranges; send failures back with the error message for one retry. Store the raw model output alongside the parsed result for audit.` },
  ],
  exam: [
    { question: 'Why can a RAG system hallucinate even when the answer is in the corpus?', answer: 'Retrieval may miss the chunk, the prompt may not force grounding, or the generator may blend evidence. Diagnose retrieval recall before blaming generation.' },
    { question: 'What is indirect prompt injection?', answer: 'Malicious instructions embedded in retrieved documents or tool outputs that the model treats as commands, hijacking the task.' },
    { question: 'When is INT4 quantization risky?', answer: 'When the task is sensitive to small weight perturbations — reasoning, code, or structured extraction. Evaluate task quality, not just perplexity.' },
  ],
  cheat: [
    'Embeddings: same model for query and docs, normalize vectors, evaluate recall@k.',
    'RAG stages: chunk → retrieve → rerank → grounded generation with citations.',
    'Agents: narrow tool schemas, validate arguments, bound loops, log trajectories.',
    'Treat retrieved text and uploads as untrusted; test indirect prompt injection.',
    'Validate structured output against a schema; retry with the validation error.',
    'INT8 usually safe; INT4 needs task-level evaluation. Calibrate quantization.',
  ],
};

MODULE_KNOWLEDGE['MLOps and Production AI'] = {
  overview: `A model in a notebook is a hypothesis; a model in production is a system with users, data drift, latency budgets, and on-call pages. MLOps is the engineering discipline that makes the transition repeatable and observable.

This module covers experiment tracking, data and model versioning, serving, containers and GPUs, monitoring and responsible AI, explainability, inference optimization, feature stores, and end-to-end project delivery.`,
  foundations: [
    `Reproducibility requires versioning three things together: code, data, and environment. A model artifact without the exact preprocessing and data snapshot is not reproducible. Track parameters, metrics, artifacts, and the git commit for every run; treat model promotion as a deployable release with a review.`,
    `Serving has three latency budgets: preprocessing, inference, and postprocessing. Batch requests where possible, cache expensive features, and choose hardware that matches the workload. A model that is accurate but exceeds the latency budget is not deployable. Measure p50 and p95, not just the mean.`,
    `Production data changes. Monitor input distributions, prediction distributions, and outcome quality where labels arrive. Drift is not automatically bad; it is a signal to investigate. Close the loop with feedback, retraining cadence, and a rollback path.`,
  ],
  concepts: [
    { title: 'Experiment tracking', keywords: ['experiment tracking', 'mlflow', 'tracking'], body: `Log every run: parameters, metrics per epoch, artifacts, data version, and environment. Compare runs in one place so decisions are based on evidence. Name experiments meaningfully; a run you cannot reproduce is a story, not a result.` },
    { title: 'Data and model versioning', keywords: ['versioning', 'model versioning', 'data versioning'], body: `Version datasets with immutable snapshots or content hashes, and version models with the training data and code that produced them. A model registry stores stage transitions (staging, production, archived) and metadata. Rollback must be one action.` },
    { title: 'Serving patterns', keywords: ['serving', 'inference', 'api', 'batch'], body: `Real-time APIs serve one request at a time with strict latency; batch jobs score large datasets cheaply; streaming pipelines score events continuously. Choose by freshness requirement and cost. Separate model server from business API so each scales independently.` },
    { title: 'Containers and cloud GPUs', keywords: ['docker', 'gpu', 'cloud', 'containers'], body: `Containerize the inference environment with pinned CUDA and library versions. GPU nodes are expensive: scale to zero when idle, batch requests, and use the smallest GPU that meets latency. Ensure health checks and graceful shutdown so deploys do not drop requests.` },
    { title: 'Monitoring and responsible AI', keywords: ['monitoring', 'responsible ai', 'drift'], body: `Monitor availability, latency, error rate, input drift, prediction drift, and business outcomes. Add fairness slices and safety filters where relevant. Log enough to debug without storing unnecessary personal data. Define alerts by user impact.` },
    { title: 'Interpretability and explainability', keywords: ['interpretability', 'explainability', 'shap'], body: `Global explanations describe overall model behavior; local explanations justify one prediction. SHAP attributes feature contributions but assumes a reference distribution and can mislead under correlated features. Use explanations to debug and communicate, never as proof of causation.` },
    { title: 'Inference optimization', keywords: ['inference optimization', 'latency', 'quantization'], body: `Optimize the measured bottleneck: batching improves throughput but adds latency; caching avoids recomputation; distillation and quantization reduce compute; compiled kernels and mixed precision speed up math. Always benchmark on production-like hardware and batch sizes.` },
    { title: 'Feature stores', keywords: ['feature store', 'features', 'production'], body: `A feature store centralizes feature definitions and computes train/serve-consistent values. It prevents training-serving skew, which is one of the most common silent production failures. Online stores serve low-latency lookups; offline stores serve batch training.` },
    { title: 'End-to-end ML projects', keywords: ['end-to-end', 'project', 'deployment'], body: `Start from the decision and the metric, then build the smallest pipeline that can be measured end to end: data → features → model → evaluation → deployment → monitoring. Ship a baseline first. Iterate only after the loop is observable and reversible.` },
  ],
  worked: [
    { title: 'Diagnosing a production accuracy drop', body: `Compare training-serving features for the same requests: a renamed column or changed unit is the first suspect. Then check input drift and label delay. If the model is fine but the threshold moved, recalibrate. Roll back the last deployment if the drop aligns with it, then investigate with the artifact and data snapshot from the registry.` },
    { title: 'Choosing serving architecture for a recommendation model', body: `The feed needs sub-200 ms ranking but can precompute candidate embeddings offline. Use a feature store for user features, cache candidate sets, and run only the ranking model online. Batch-refresh item embeddings hourly. This splits the workload so GPU cost and latency stay predictable.` },
  ],
  exam: [
    { question: 'What is training-serving skew?', answer: 'A difference between how features are computed during training and at inference, such as different aggregations, units, or missing-value handling, which silently degrades predictions.' },
    { question: 'Why monitor p95 latency instead of the mean?', answer: 'The mean hides tail latency; a small fraction of slow requests often determines user experience and timeout rates.' },
    { question: 'What belongs in a model registry entry?', answer: 'Artifact, code commit, data snapshot, environment, metrics, stage, and approval — enough to reproduce and roll back.' },
  ],
  cheat: [
    'Reproducibility = code + data + environment versioned together.',
    'Track params, metrics, artifacts, data version and commit for every run.',
    'Latency budget = preprocessing + inference + postprocessing; measure p50/p95.',
    'Monitor drift, errors, latency and outcomes; alert on user impact.',
    'Feature store prevents training-serving skew; online + offline stores must agree.',
    'Ship a baseline end-to-end before optimizing any single stage.',
  ],
};

MODULE_KNOWLEDGE['Computer Vision in Depth'] = {
  overview: `Computer vision teaches machines to extract structure from pixels: where objects are, what they are, which pixels belong to them, and how scenes change over time. Modern systems are dominated by deep networks, but the classical ideas — convolution, scale, matching, geometry — still explain why they work.

This module covers object detection, semantic segmentation, vision transformers, diffusion models in practice, and video understanding.`,
  foundations: [
    `An image is a grid of intensities; convolution applies a learned filter at every location, sharing weights across space. Stacking convolutions grows the receptive field, so deep features see larger context. Stride and pooling downsample; upsampling restores resolution.`,
    `Detection answers "what is where": models predict boxes plus class scores, then remove duplicates with non-maximum suppression. Segmentation answers "which pixels": models predict a mask per class or per object. Both depend on anchors or proposals, loss balancing, and careful augmentation.`,
    `Vision transformers split an image into patches, embed them as tokens, and apply self-attention. They trade convolutional inductive bias for global context and scale well with data. Hybrid models keep some convolutional stem for efficiency.`,
  ],
  concepts: [
    { title: 'Detection: boxes, anchors and NMS', keywords: ['detection', 'yolo', 'object detection'], body: `A detector predicts box offsets and class probabilities at many spatial locations. Anchors or center points define candidate boxes. Non-maximum suppression keeps the highest-scoring box and removes overlapping boxes of the same class above an IoU threshold. Evaluate with mAP at several IoU thresholds.` },
    { title: 'Semantic and instance segmentation', keywords: ['segmentation', 'semantic', 'mask', 'unet'], body: `Semantic segmentation labels every pixel by class; instance segmentation separates individual objects. U-Net-style encoder–decoder architectures combine deep semantics with high-resolution skip connections. Losses balance cross-entropy with Dice or IoU to handle class imbalance.` },
    { title: 'Vision transformers', keywords: ['vision transformer', 'vit', 'patch'], body: `A ViT cuts the image into fixed-size patches, projects each to a token, adds positional embeddings, and runs a standard transformer encoder. It lacks convolutional locality priors, so it usually needs more data or strong augmentation. Hybrid stems and hierarchical attention improve efficiency.` },
    { title: 'Diffusion models in practice', keywords: ['diffusion', 'image generation', 'stable diffusion'], body: `Diffusion learns to denoise a gradually noised image. Sampling starts from noise and iteratively applies the learned denoiser, optionally guided by text or class conditioning. Latent diffusion runs the process in a compressed latent space to cut cost. Classifier-free guidance trades diversity for prompt adherence.` },
    { title: 'Video understanding', keywords: ['video', 'temporal', 'video understanding'], body: `Video adds time: models must aggregate frames while respecting motion. Approaches include 3D convolutions, frame sampling plus temporal attention, and two-stream RGB/optical-flow models. Evaluation must handle temporal localization, not just per-frame accuracy.` },
  ],
  worked: [
    { title: 'Why NMS is necessary', body: `A detector produces many overlapping boxes around the same object, each with a high score. Without NMS, the output contains duplicates. Sort by score, keep the best box, suppress every remaining box whose IoU with it exceeds a threshold, and repeat. The threshold controls the precision–recall trade-off.` },
    { title: 'Choosing a segmentation loss', body: `Pixel-wise cross-entropy treats every pixel equally and fails when a tiny class dominates the image. Dice loss directly optimizes overlap and is scale-invariant but unstable early. A combined cross-entropy + Dice loss usually trains stably and handles imbalance. Always report per-class IoU.` },
  ],
  exam: [
    { question: 'What does non-maximum suppression do?', answer: 'It removes duplicate detections by keeping the highest-scoring box and suppressing overlapping boxes of the same class above an IoU threshold.' },
    { question: 'Why does a ViT need more data than a CNN?', answer: 'It lacks convolutional locality and translation priors, so it must learn those invariances from data or augmentation.' },
    { question: 'Why use latent diffusion?', answer: 'It performs denoising in a compressed latent space, reducing compute and memory while preserving perceptual quality.' },
  ],
  cheat: [
    'Convolution: locality + weight sharing; depth grows the receptive field.',
    'Detection: boxes + scores + NMS; evaluate with mAP at multiple IoU thresholds.',
    'Segmentation: encoder–decoder + skips; CE + Dice for class imbalance; report per-class IoU.',
    'ViT: patches as tokens + positional embeddings; data-hungry without conv priors.',
    'Diffusion: learn to denoise; guidance trades diversity for prompt adherence.',
    'Video: sample frames + temporal attention; evaluate temporal localization.',
  ],
};

MODULE_KNOWLEDGE['Reinforcement Learning'] = {
  overview: `Reinforcement learning studies agents that learn by interacting with an environment to maximize cumulative reward. Instead of labeled examples, the agent receives delayed, often noisy feedback and must balance exploration with exploitation.

This module covers Markov decision processes, dynamic programming, value-based methods, policy gradients, and preference learning used to align language models.`,
  foundations: [
    `An MDP is (S, A, P, R, γ): states, actions, transition probabilities, rewards, and a discount factor. The Markov property says the future depends only on the current state, not the full history. A policy maps states to actions; the value function Vπ(s) is the expected discounted return from s under π.`,
    `The Bellman equations relate a state's value to the value of its successors. Dynamic programming computes values exactly when the model is known; temporal-difference learning samples transitions when it is not. The discount factor γ controls how far the agent looks ahead.`,
    `Exploration is the central difficulty: the agent must try actions whose value is uncertain to discover better policies. ε-greedy and optimistic initialization are simple; UCB and Thompson sampling are principled. Reward design is equally central — agents optimize exactly what you measure, including its flaws.`,
  ],
  concepts: [
    { title: 'Value iteration and policy iteration', keywords: ['mdp', 'dynamic programming', 'value iteration'], body: `Value iteration repeatedly applies the Bellman optimality operator until values converge. Policy iteration alternates policy evaluation with greedy improvement. Both require the transition model and a finite state space; both converge for discounted MDPs.` },
    { title: 'Q-learning and DQN', keywords: ['q-learning', 'dqn', 'value-based'], body: `Q-learning updates Q(s,a) toward r + γ maxₐ' Q(s',a') using sampled transitions, learning off-policy. DQN approximates Q with a neural network and stabilizes training with a replay buffer and a target network. Overestimation bias motivates double Q-learning.` },
    { title: 'Policy gradients', keywords: ['policy gradient', 'reinforce', 'actor critic'], body: `Policy-gradient methods parameterize the policy and estimate the gradient of expected return from sampled trajectories. REINFORCE uses the return as a weight; subtracting a baseline reduces variance. Actor–critic methods learn a value function to form a lower-variance advantage estimate.` },
    { title: 'RLHF and preference learning', keywords: ['rlhf', 'preference', 'alignment'], body: `RLHF trains a reward model on human comparisons, then optimizes a policy with PPO and a KL penalty to the reference model. DPO removes the explicit reward model and optimizes preferences directly. Reward hacking — optimizing the proxy while degrading the true goal — is the main risk.` },
  ],
  worked: [
    { title: 'A one-step Q-learning update', body: `From transition (s, a, r, s'), read the current Q(s,a) and maxₐ' Q(s',a'). Target = r + γ·max. Update Q(s,a) ← Q(s,a) + α(target − Q(s,a)). With γ = 0.9, r = 1, max next = 2, α = 0.1, current = 0: target = 2.8, new value = 0.28. Repeat over many samples and the values propagate backward through the chain.` },
    { title: 'Why reward shaping can break learning', body: `Adding a bonus for "moving right" helps the agent find the goal faster, but if the bonus is available forever, the optimal policy may oscillate and farm it. Prefer sparse, task-aligned rewards with potential-based shaping, which provably preserves the optimal policy.` },
  ],
  exam: [
    { question: 'What is the Markov property?', answer: 'The next state depends only on the current state and action, not on the earlier history.' },
    { question: 'What does the discount factor γ control?', answer: 'How much future rewards count relative to immediate rewards; smaller γ makes the agent short-sighted.' },
    { question: 'Why does DQN use a target network?', answer: 'It stabilizes bootstrapped targets that would otherwise move with every update of the online network.' },
  ],
  cheat: [
    'MDP = (S, A, P, R, γ); policy π: S→A; value Vπ(s) = E[discounted return].',
    'Bellman: V(s) = maxₐ Σ P(s′|s,a)[R + γV(s′)]. DP needs the model.',
    'Q-learning: off-policy, target r + γ max Q(s′,a′). DQN adds replay + target net.',
    'Policy gradient: ↑ log π(a|s) · advantage; baseline reduces variance.',
    'Exploration: ε-greedy / UCB / Thompson. Reward design is part of the algorithm.',
    'RLHF: reward model → PPO + KL penalty. DPO: direct preference optimization.',
  ],
};

MODULE_KNOWLEDGE['ML System Design'] = {
  overview: `ML system design is the discipline of turning a model into a reliable product: defining the objective, designing the data and serving path, choosing candidate generation and ranking stages, and closing the feedback loop.

Interview-style system design rewards structure: clarify requirements, state assumptions, sketch the pipeline end to end, then go deep on the stage that matters most.`,
  foundations: [
    `Every ML system starts with a decision and a metric. Separate business metrics (revenue, retention) from model metrics (AUC, NDCG) and explain how one is expected to move the other. A model with a great offline metric that does not affect the product is a research artifact.`,
    `Large systems are usually multi-stage: candidate generation retrieves a manageable set cheaply, ranking scores it precisely, and re-ranking applies business constraints. Each stage has its own latency and recall targets. Optimize the whole funnel, not one model in isolation.`,
    `Feedback loops are unavoidable: predictions influence the data the next model trains on. Logging exposes, using propensity scores or randomization, and holding out traffic protects against self-reinforcing bias. Offline evaluation must mirror online distribution.`,
  ],
  concepts: [
    { title: 'Requirements and metrics', keywords: ['designing ml systems', 'requirements', 'metrics'], body: `Clarify users, scale, latency, freshness, and failure cost. Translate the product goal into an online metric and a proxy offline metric. State what a trivial baseline achieves. Design the smallest system that can measure the outcome.` },
    { title: 'Training pipelines at scale', keywords: ['training pipeline', 'scale', 'pipeline'], body: `Training needs reproducible data snapshots, distributed compute, and checkpoint management. Feature computation must match serving. Schedule retraining by drift and label delay, not arbitrary calendar cadence. Keep the ability to roll back to a previous artifact.` },
    { title: 'Candidate generation and ranking', keywords: ['candidate', 'ranking', 'retrieval'], body: `Candidate generation favors recall at low cost: ANN over embeddings, popularity priors, or co-visitation graphs. Ranking uses richer features and a heavier model for precision. Evaluate each stage with recall@k and NDCG respectively.` },
    { title: 'Common system design cases', keywords: ['system design', 'cases', 'url shortener', 'feed', 'chat'], body: `Recognition: feed ranking (candidates → ranker → re-ranker), search (query understanding → retrieval → ranking), recommendation (collaborative + content features), fraud (real-time features + rules + model), ride pricing (forecasting + optimization). For each, name the data flow, freshness, and failure mode.` },
    { title: 'Inference at scale', keywords: ['inference', 'scale', 'serving'], body: `Serve models behind a service that handles batching, caching, timeouts, and fallbacks. Separate online features from offline features and keep them consistent. Capacity planning uses p95 latency and peak QPS, not averages. Degrade gracefully when the model or a dependency fails.` },
    { title: 'Monitoring and feedback loops', keywords: ['monitoring', 'feedback', 'loop'], body: `Log inputs, predictions, and (delayed) outcomes. Monitor drift, calibration, and business impact. Randomize a small slice of traffic to measure counterfactuals. Close the loop with retraining, but guard against training on the model's own biased exposure.` },
  ],
  worked: [
    { title: 'Designing a news-feed ranker', body: `Requirements: 100M users, sub-200 ms, freshness minutes. Candidate generation: follow graph + ANN embeddings + trending. Ranking: gradient-boosted trees or a two-tower model with user, item, context, and interaction features. Re-ranking applies diversity and policy constraints. Logging records position and propensity. Offline NDCG plus online A/B on engagement and retention.` },
    { title: 'Designing fraud detection', body: `Score transactions in real time with a rules layer for known patterns plus a model on velocity, device, geography, and merchant features. Feature freshness is critical: a 5-minute-stale velocity feature misses attacks. Use a feature store, a strict latency budget, and a human review queue. Optimize precision at a fixed recall to control customer friction.` },
  ],
  exam: [
    { question: 'Why split candidate generation and ranking?', answer: 'Retrieval must score millions of items cheaply for recall; ranking can afford expensive features on a small candidate set for precision.' },
    { question: 'What is a feedback loop risk in recommendation?', answer: 'The model only sees outcomes for items it chose to show, so it can reinforce its own biases and miss better items unless exploration or propensity logging is used.' },
    { question: 'Which latency metric drives capacity planning?', answer: 'p95 (or p99) tail latency at peak QPS, because averages hide the slow requests that time out.' },
  ],
  cheat: [
    'Start with the decision, metric, scale, latency and failure cost.',
    'Funnel: candidate generation (recall) → ranking (precision) → re-ranking (policy).',
    'Train/serve feature consistency prevents silent skew; feature store helps.',
    'Log exposures and propensities; randomize a slice to measure counterfactuals.',
    'Plan capacity with p95 at peak QPS; add timeouts, caching and graceful fallback.',
    'Offline metric ≠ online impact; validate with an A/B test.',
  ],
};

MODULE_KNOWLEDGE['AI Career Accelerator'] = {
  overview: `Technical skill is necessary but not sufficient. Careers in AI are built on evidence: projects that work, explanations that are clear, and a habit of reading and reproducing research. This module turns study into a portfolio and preparation into a repeatable process.

It covers the ML interview loop, Kaggle-style workflows, reading papers effectively, and building a portfolio that demonstrates judgment rather than tutorial completion.`,
  foundations: [
    `Interviews test three layers: fundamentals (math, ML, systems), applied judgment (how you frame and debug a problem), and communication (can you explain a trade-off clearly?). Prepare all three. Memorized answers fail at the first follow-up that changes an assumption.`,
    `A portfolio project is evidence of ownership. The strongest projects state the problem, the baseline, the metric, what you tried, what failed, and what you would do next. A clean README and a reproducible notebook beat a long list of unfinished ideas.`,
    `Reading a paper is an active skill: identify the claim, the evidence, the assumptions, and the limitations. Reproduce one figure or experiment. Keep a short written summary so future-you can retrieve the idea.`,
  ],
  concepts: [
    { title: 'The ML interview playbook', keywords: ['interview', 'playbook', 'career'], body: `Expect ML fundamentals (bias-variance, regularization, metrics), coding (arrays, graphs, DP), ML system design (requirements → data → model → serving → monitoring), and behavioral questions. Practice explaining one project deeply: problem, alternatives, metric, failure, impact.` },
    { title: 'Kaggle and competition workflows', keywords: ['kaggle', 'competition', 'workflow'], body: `Start with a strong validation split and a simple baseline. Build a fast iteration loop, engineer features from EDA, then ensemble diverse models. Track experiments and avoid leaderboard overfitting. The transferable skill is disciplined iteration under a metric.` },
    { title: 'Reading papers effectively', keywords: ['papers', 'research', 'reading'], body: `Read the abstract, figures, and conclusion first; then the method; then the experiments. Ask: what is the claim, what is the baseline, what would falsify it? Reproduce one result. Write three sentences: problem, method, result.` },
    { title: 'Building an AI portfolio', keywords: ['portfolio', 'projects', 'career'], body: `Ship 3–5 projects with clear problems, baselines, metrics, and demos. Include one end-to-end deployed system, one careful evaluation or failure analysis, and one reproduction of a paper. Document decisions and limitations. Quality and depth beat quantity.` },
  ],
  worked: [
    { title: 'Turning a notebook into a portfolio case study', body: `State the decision the model supports and the metric. Report the baseline and your model's lift with confidence intervals. Show one failed approach and why it failed. Add a small demo and a README that runs end to end. Finish with limitations and next steps. This demonstrates judgment, which is what interviews probe.` },
    { title: 'A 30-minute paper-reading routine', body: `5 min: abstract + figures + conclusion. 10 min: method and assumptions. 10 min: experiments, baselines, ablations. 5 min: write problem/method/result/limitation in four sentences. If the paper matters to your work, schedule a reproduction of one figure.` },
  ],
  exam: [
    { question: 'What makes a portfolio project credible?', answer: 'A clear problem, a baseline, a measured improvement, reproducible code, and an honest discussion of limitations and next steps.' },
    { question: 'How should you answer an ML system design question?', answer: 'Clarify requirements and metrics, sketch the end-to-end data and serving path, then go deep on the highest-risk stage with latency and failure analysis.' },
    { question: 'Why read the figures before the method?', answer: 'Figures and tables reveal the claim and evidence quickly; the method only matters if the claim is relevant to your problem.' },
  ],
  cheat: [
    'Interview layers: fundamentals, applied judgment, communication. Practice follow-ups.',
    'Portfolio: problem → baseline → metric → attempts → failure → next steps.',
    'Competitions: validation split first, baseline, fast loop, ensembling, avoid LB overfit.',
    'Paper routine: abstract/figures → method → experiments → 4-sentence summary.',
    'Ship 3–5 deep projects; one deployed, one evaluation-focused, one reproduction.',
    'Explain trade-offs out loud; clarity under pressure is the signal.',
  ],
};

// =================================================================== GATE CS

MODULE_KNOWLEDGE['Engineering Mathematics'] = {
  overview: `Engineering mathematics is the language GATE uses to describe computation: sets and relations define structures, logic defines proof, combinatorics counts possibilities, linear algebra describes transformations, probability quantifies uncertainty, and calculus explains change.

This module builds those tools with an exam-first lens. Every concept is paired with the standard question shape GATE uses, because the paper rewards recognizing a structure quickly and applying the right theorem cleanly.`,
  foundations: [
    `Discrete mathematics studies countable structures. A set is a collection; a relation is a subset of a Cartesian product; a function is a relation with exactly one output per input. Properties such as reflexivity, symmetry, and transitivity classify relations, and equivalence relations partition a set into disjoint classes — a pattern that reappears in automata, databases, and graphs.`,
    `Linear algebra represents data as vectors and operations as matrices. Solving Ax = b, finding eigenvalues, and determining rank are the same handful of ideas viewed from different angles. GATE tests whether you can compute and interpret, not whether you can recite definitions.`,
    `Probability and statistics model uncertainty. A random variable maps outcomes to numbers, a distribution assigns probabilities, and expectation summarizes the centre. The exam repeatedly tests conditional probability, Bayes' theorem, standard distributions, and the difference between independent and mutually exclusive events.`,
  ],
  concepts: [
    { title: 'Sets, relations and functions', keywords: ['sets', 'relations', 'functions'], body: `A relation on A is reflexive if (a,a) ∈ R for all a, symmetric if (a,b) implies (b,a), and transitive if (a,b),(b,c) implies (a,c). An equivalence relation has all three and partitions A. A function is injective if distinct inputs map to distinct outputs, surjective if every codomain element is hit, bijective if both. Count functions: |B|^|A| total, injections P(|B|,|A|).` },
    { title: 'Propositional and predicate logic', keywords: ['logic', 'propositional', 'predicate'], body: `Connectives: ¬, ∧, ∨, →, ↔. An implication p→q is false only when p is true and q is false; its contrapositive ¬q→¬p is equivalent. Predicate logic adds ∀ and ∃; ¬∀x P(x) ≡ ∃x ¬P(x). Validity means true under every interpretation; satisfiability means true under some.` },
    { title: 'Combinatorics and counting', keywords: ['combinatorics', 'counting', 'permutation', 'combination'], body: `Permutations count ordered arrangements: P(n,r) = n!/(n−r)!. Combinations count unordered selections: C(n,r) = n!/(r!(n−r)!). The product rule multiplies independent choices; the sum rule adds disjoint cases. Stars and bars counts solutions to x₁+…+x_k = n as C(n+k−1, k−1). Inclusion–exclusion corrects double counting.` },
    { title: 'Graph theory', keywords: ['graph theory', 'graph', 'tree', 'coloring'], body: `A graph G = (V,E). A tree on n vertices has n−1 edges and is connected and acyclic. Handshaking: Σdeg(v) = 2|E|. Euler circuits need every vertex even degree; Hamiltonian cycles visit every vertex once. Planar graphs satisfy |E| ≤ 3|V|−6. Chromatic number is the minimum colors for a proper coloring; bipartite graphs are exactly 2-colorable.` },
    { title: 'Linear algebra', keywords: ['linear algebra', 'matrix', 'rank', 'determinant'], body: `Matrix multiplication composes linear maps. Rank is the dimension of the column space; a system Ax = b has a solution iff rank(A) = rank([A|b]). Determinant is zero iff columns are dependent. Eigenvalues solve det(A−λI)=0. A matrix is diagonalizable iff it has a full set of independent eigenvectors.` },
    { title: 'Eigenvalues and diagonalization', keywords: ['eigenvalues', 'eigenvectors', 'diagonalization'], body: `Av = λv means A stretches v without rotating it. Eigenvalues of a triangular matrix are its diagonal entries. The trace equals the sum of eigenvalues and the determinant equals their product — a fast check. Symmetric real matrices have real eigenvalues and orthogonal eigenvectors, so they are orthogonally diagonalizable.` },
    { title: 'Calculus and optimization', keywords: ['calculus', 'limits', 'derivatives', 'optimization'], body: `A derivative is a local rate of change; a critical point has f′=0. The second derivative classifies it: f″>0 is a minimum, f″<0 a maximum. For multivariable functions, the gradient vanishes at a critical point and the Hessian determines the type. Lagrange multipliers optimize under equality constraints.` },
    { title: 'Probability', keywords: ['probability', 'conditional', 'bayes'], body: `P(A|B) = P(A∩B)/P(B). Bayes: P(A|B) = P(B|A)P(A)/P(B). Independent events satisfy P(A∩B)=P(A)P(B); mutually exclusive events satisfy A∩B=∅. E[X+Y] = E[X]+E[Y] always; Var(X+Y) = Var(X)+Var(Y) only when independent.` },
    { title: 'Random variables and distributions', keywords: ['random variables', 'distributions', 'binomial', 'poisson'], body: `A random variable maps outcomes to numbers. Binomial(n,p): mean np, variance np(1−p). Poisson(λ): mean and variance λ. Geometric(p): mean 1/p. Uniform(a,b): mean (a+b)/2, variance (b−a)²/12. Normal: symmetric, characterized by mean and variance.` },
    { title: 'Statistics and estimation', keywords: ['statistics', 'estimation', 'confidence', 'hypothesis'], body: `A sample statistic estimates a population parameter. The sample mean is unbiased for the population mean; the sample variance uses n−1 to be unbiased. The standard error of the mean is σ/√n. A confidence interval quantifies uncertainty. Hypothesis tests compare a statistic to a null distribution and report a p-value.` },
    { title: 'Numerical methods', keywords: ['numerical', 'newton', 'bisection', 'interpolation'], body: `Bisection halves a bracketing interval and converges linearly; Newton uses the derivative and converges quadratically near a root but can diverge. Trapezoidal and Simpson rules approximate integrals; Simpson is exact for cubics. Floating-point arithmetic has finite precision, so stability and conditioning matter.` },
    { title: 'Recurrences and generating functions', keywords: ['recurrence', 'generating functions', 'master theorem'], body: `Solve recurrences by substitution, the Master theorem, or generating functions. For T(n)=aT(n/b)+f(n), compare f(n) with n^(log_b a). A generating function encodes a sequence as coefficients of a power series; operations on the series mirror operations on the sequence.` },
  ],
  worked: [
    { title: 'Counting equivalence relations', body: `The number of equivalence relations on a set of n elements equals the number of partitions (Bell number). For n=3: partitions are {123}, {1}{23}, {2}{13}, {3}{12}, {1}{2}{3} — five. Count by cases on block sizes rather than trying to list relations directly.` },
    { title: 'Eigenvalues of a 2×2 matrix', body: `For A = [[2,1],[1,2]], solve det(A−λI) = (2−λ)²−1 = 0 → λ²−4λ+3 = 0 → λ = 1, 3. Check: trace = 4 = 1+3, determinant = 3 = 1×3. Eigenvector for λ=3: (A−3I)v=0 → [−1,1;1,−1]v=0 → v=(1,1). For λ=1: v=(1,−1).` },
  ],
  exam: [
    { question: 'How many functions from a 3-element set to a 2-element set?', answer: '2³ = 8: each of the 3 domain elements independently chooses one of 2 codomain elements.' },
    { question: 'If A is 3×3 with eigenvalues 1, 2, 3, what are det(A) and trace(A)?', answer: 'det = 1·2·3 = 6; trace = 1+2+3 = 6.' },
    { question: 'P(A)=0.5, P(B)=0.4, P(A∩B)=0.2. Are A and B independent?', answer: 'P(A)P(B)=0.2 = P(A∩B), so yes.' },
  ],
  cheat: [
    'Equivalence relation = reflexive + symmetric + transitive = partition.',
    'Functions |B|^|A|; injections P(|B|,|A|); subsets 2^n; stars and bars C(n+k−1,k−1).',
    'Tree: n−1 edges. Handshake: Σdeg = 2E. Planar: E ≤ 3V−6.',
    'Rank(A)=rank([A|b]) for consistency; det=0 ⇔ dependent columns; trace=Σλ, det=Πλ.',
    'P(A|B)=P(A∩B)/P(B); independent ⇔ P(A∩B)=P(A)P(B); exclusive ⇔ A∩B=∅.',
    'Binomial mean np, var npq; Poisson mean=var=λ; Geometric mean 1/p.',
  ],
};

MODULE_KNOWLEDGE['Digital Logic'] = {
  overview: `Digital logic is the bridge from Boolean mathematics to real hardware. Gates compute Boolean functions; combinational circuits compute without memory; sequential circuits add state and clocks; arithmetic circuits and FSMs turn those primitives into processors.

GATE tests minimization, timing, number representation, and the ability to trace a circuit or state machine precisely.`,
  foundations: [
    `Boolean algebra manipulates true/false values with AND, OR, and NOT. Any Boolean function can be written as a sum of minterms or a product of maxterms. Karnaugh maps and algebraic identities minimize the gate count; don't-care conditions let you choose the most convenient value.`,
    `Combinational circuits have no memory: outputs depend only on current inputs. Adders, multiplexers, decoders, and comparators are the building blocks. Timing hazards occur when different paths have different delays, producing a temporary wrong output.`,
    `Sequential circuits store state in flip-flops and update it on a clock edge. A finite state machine is (states, inputs, outputs, transition function, output function). Mealy outputs depend on input and state; Moore outputs depend only on state. Setup and hold times constrain when inputs may change.`,
  ],
  concepts: [
    { title: 'Number systems and codes', keywords: ['number systems', 'codes', 'binary', 'two complement'], body: `Binary, octal, and hexadecimal are positional; each hex digit is four bits. Two's complement represents negatives by inverting bits and adding one; an n-bit signed range is −2^(n−1) to 2^(n−1)−1. BCD uses four bits per decimal digit. Gray code changes one bit between adjacent values, reducing transition errors.` },
    { title: 'Boolean algebra and gates', keywords: ['boolean', 'logic gates', 'algebra'], body: `Identities: X+0=X, X·1=X, X+X′=1, X·X′=0, De Morgan (X+Y)′=X′·Y′. NAND and NOR are universal. SOP is an OR of AND terms; POS is an AND of OR terms. XOR is 1 when inputs differ.` },
    { title: 'Karnaugh maps and minimization', keywords: ['karnaugh', 'minimization', 'kmap'], body: `Plot 1s on a Gray-coded grid and group adjacent 1s in powers of two (1,2,4,8). Larger groups remove more variables. Groups may wrap around edges and may overlap; include don't-cares only if they enlarge a group. The result is a minimal SOP.` },
    { title: 'Combinational circuits', keywords: ['combinational', 'adder', 'multiplexer', 'decoder'], body: `A half adder computes sum = A⊕B, carry = AB; a full adder adds carry-in. A multiplexer selects one of 2^n inputs using n select lines and can implement any Boolean function. A decoder asserts one of 2^n outputs; an encoder reverses it. Ripple-carry adders are simple but slow; carry-lookahead trades area for speed.` },
    { title: 'Sequential circuits and flip-flops', keywords: ['sequential', 'flip-flop', 'latch', 'state'], body: `SR latches are level-sensitive; D flip-flops sample on a clock edge. Setup time is how long data must be stable before the edge; hold time is how long after. A register is a bank of flip-flops; a counter cycles through states. Asynchronous inputs (reset) bypass the clock and need care.` },
    { title: 'Registers, counters and FSM design', keywords: ['registers', 'counters', 'fsm'], body: `Design an FSM by listing states, drawing transitions, encoding states, deriving next-state and output logic, then implementing with flip-flops. Moore outputs are glitch-free; Mealy responds faster but can glitch. Synchronous counters chain toggle flip-flops with enables.` },
    { title: 'Computer arithmetic', keywords: ['computer arithmetic', 'floating point', 'ieee 754'], body: `IEEE 754 single precision: 1 sign, 8 exponent (bias 127), 23 fraction bits. Normalized value = (−1)^s × 1.f × 2^(e−127). Overflow, underflow, NaN, and signed zero are special cases. Floating-point addition is not associative because of rounding.` },
  ],
  worked: [
    { title: 'Minimize f(A,B,C) = Σm(1,3,5,7)', body: `Minterms 1(001),3(011),5(101),7(111). Group 1&3 (A=0,B=1,C varies) and 5&7 (A=1,B=1,C varies), then combine to the single group where B=1 and C varies regardless of A: f = B. Check: whenever B=1 the output is 1; whenever B=0 it is 0.` },
    { title: "Two's complement subtraction", body: `To compute 5 − 7 in 4 bits: 5=0101, 7=0111. Two's complement of 7 = 1001. Add: 0101+1001 = 1110. Interpret 1110 as signed: −2. Correct, and no separate subtractor is needed — the same adder works for both operations.` },
  ],
  exam: [
    { question: "What is the signed range of an 8-bit two's-complement integer?", answer: '−128 to +127 (−2^7 to 2^7−1).' },
    { question: 'Why is NAND called universal?', answer: 'Any Boolean function can be built using only NAND gates, including NOT, AND, and OR.' },
    { question: 'Moore vs Mealy FSM?', answer: 'Moore output depends only on state; Mealy output depends on state and input. Mealy can respond in the same cycle but may glitch; Moore is safer.' },
  ],
  cheat: [
    "Two's complement: invert + 1; n-bit range −2^(n−1) … 2^(n−1)−1.",
    'De Morgan: (X+Y)′=X′Y′, (XY)′=X′+Y′. NAND/NOR are universal.',
    "K-map groups: powers of two, wrap edges, don't-cares only to enlarge groups.",
    'MUX with n selects implements any n-variable function; decoder asserts one output.',
    'Setup = stable before edge; hold = stable after. Registers vs latches.',
    'IEEE 754 single: 1+8+23 bits, bias 127; normalization and rounding matter.',
  ],
};

MODULE_KNOWLEDGE['Computer Organization and Architecture'] = {
  overview: `Computer organization connects software to hardware: how instructions are encoded, how a datapath executes them, how pipelines overlap work, how caches hide memory latency, and how virtual memory creates the illusion of a large private address space.

GATE questions are quantitative: CPI, speedup, cache hit rates, address splits, and pipeline hazards. The method is always the same — draw the pipeline or hierarchy, then count cycles and bits.`,
  foundations: [
    `The instruction set architecture is the contract between compiler and hardware. RISC favors simple fixed-length instructions and registers; CISC favors expressive instructions. Whatever the ISA, execution follows a cycle: fetch, decode, execute, memory, write-back.`,
    `Pipelining overlaps stages so that at steady state one instruction completes per cycle, ignoring hazards. Speedup is limited by the slowest stage and by dependencies. Structural, data, and control hazards introduce stalls or require forwarding and branch prediction.`,
    `The memory hierarchy exploits locality: registers, L1/L2/L3 caches, DRAM, and disk trade size for latency. Cache performance depends on the address split (tag/index/offset), replacement policy, and associativity. Virtual memory adds a page table and TLB between the CPU and physical memory.`,
  ],
  concepts: [
    { title: 'Instruction set architecture', keywords: ['instruction set', 'isa', 'addressing'], body: `An ISA defines instructions, registers, data types, addressing modes, and the memory model. Addressing modes include immediate, direct, indirect, indexed, and PC-relative. The number of addressable registers affects instruction encoding width. RISC-V is a clean modern example.` },
    { title: 'CPU datapath and control', keywords: ['datapath', 'control', 'cpu'], body: `The datapath contains the ALU, register file, PC, and memory interfaces. Control signals route operands and select operations. Hardwired control is fast but rigid; microprogrammed control is flexible but slower. Every instruction is a sequence of register transfers.` },
    { title: 'Pipelining and hazards', keywords: ['pipelining', 'hazards', 'pipeline'], body: `A k-stage pipeline has a theoretical speedup of k, reduced by stalls and fill/drain. Data hazards (RAW) are resolved by forwarding or stalls; control hazards by prediction, delayed slots, or flushing; structural hazards by duplicating resources. A branch penalty is the number of cycles lost on a misprediction.` },
    { title: 'Memory hierarchy and cache', keywords: ['cache', 'memory hierarchy', 'associativity'], body: `For an address, offset bits select the block word, index bits select the set, and tag bits identify the block. Direct-mapped has one line per set; n-way set-associative has n. AMAT = hit time + miss rate × miss penalty. Write-through vs write-back and write-allocate vs no-write-allocate change traffic.` },
    { title: 'Virtual memory and address translation', keywords: ['virtual memory', 'page table', 'tlb'], body: `Virtual addresses are split into a virtual page number and offset. The page table maps VPN to PFN; the TLB caches recent translations. A TLB miss walks the page table; a page fault loads from disk. Larger pages reduce TLB pressure but increase internal fragmentation.` },
    { title: 'Input/output and DMA', keywords: ['io', 'dma', 'interrupt'], body: `Programmed I/O wastes CPU cycles; interrupt-driven I/O frees the CPU but costs context switches; DMA lets a controller transfer blocks directly to memory. The CPU is interrupted once per block. Memory-mapped I/O maps device registers into the address space.` },
    { title: 'Performance analysis', keywords: ['performance', 'cpi', 'speedup'], body: `CPU time = instruction count × CPI × clock period. Average CPI weights each instruction class by its frequency. Amdahl's law: speedup is limited by the fraction that cannot be improved. Always state the baseline and the workload when quoting a speedup.` },
  ],
  worked: [
    { title: 'Average CPI from an instruction mix', body: `40% ALU at CPI 1, 30% memory at CPI 3, 30% branch at CPI 2. Average CPI = 0.4·1 + 0.3·3 + 0.3·2 = 0.4 + 0.9 + 0.6 = 1.9. If the clock is 2 GHz, time per instruction = 1.9/2e9 = 0.95 ns. Doubling the clock halves the time only if CPI stays constant.` },
    { title: 'Cache address split', body: `A 32-bit address, 64-byte blocks (6 offset bits), 4-way set-associative, 32 KB cache. Number of sets = 32KB / (64B × 4) = 128 → 7 index bits. Tag = 32 − 7 − 6 = 19 bits. Getting these three widths right answers most cache questions.` },
  ],
  exam: [
    { question: 'What is the speedup limit of a 5-stage pipeline?', answer: 'At most 5× at steady state, ignoring hazards and fill/drain; stalls and unbalanced stages reduce it.' },
    { question: 'How do you compute AMAT?', answer: 'AMAT = hit time + miss rate × miss penalty. For multi-level caches, apply the formula recursively.' },
    { question: 'Why does a TLB miss not always mean a page fault?', answer: 'A TLB miss only means the translation is not cached; the page may still be present in the page table and memory.' },
  ],
  cheat: [
    'CPU time = IC × CPI × clock period. Average CPI = Σ(fraction × CPI).',
    'Pipeline speedup ≤ stages; hazards: structural, data (RAW), control. Forwarding avoids many stalls.',
    'Cache: offset → block, index → set, tag → identity. AMAT = hit + missRate × missPenalty.',
    'Set-associative sets = size / (block × ways). Tag = address − index − offset.',
    'Virtual memory: VPN + offset → PFN + offset; TLB caches translations; page fault loads from disk.',
    'Amdahl: speedup limited by the unimproved fraction.',
  ],
};

MODULE_KNOWLEDGE['Programming and Data Structures'] = {
  overview: `Programming is the craft of turning a specification into correct, efficient code; data structures are the shapes we impose on memory to make operations cheap. GATE tests C semantics, pointer reasoning, recursion, and the complexity of core structures.

This module covers C fundamentals, pointers and memory, structs and dynamic allocation, recursion, linear structures, trees, heaps, and hashing.`,
  foundations: [
    `C exposes memory. A variable has an address, a type, and a value; a pointer stores an address. Arrays decay to pointers to their first element, pointer arithmetic scales by the element size, and strings are null-terminated char arrays. Undefined behaviour — out-of-bounds access, use-after-free, signed overflow — is not a theoretical concern; it is the source of most C bugs.`,
    `Recursion solves a problem by reducing it to smaller instances of itself. A correct recursive function needs a base case, progress toward it, and a combination step. The call stack stores frames; deep recursion can overflow it. Tail recursion can sometimes be optimized into a loop, but C does not guarantee it.`,
    `Every data structure is a trade-off between operation costs. Arrays give O(1) indexing but O(n) insertion; linked lists give O(1) insertion at a known node but O(n) search; hash tables give expected O(1) lookup at the cost of memory and worst-case O(n); balanced trees guarantee O(log n) but with more overhead.`,
  ],
  concepts: [
    { title: 'C programming fundamentals', keywords: ['c programming', 'fundamentals', 'syntax'], body: `C is statically typed and compiled. Declarations specify type and storage class; expressions have types and side effects. Integer promotions and implicit conversions can surprise: comparing signed and unsigned promotes the signed value. Always compile with warnings enabled.` },
    { title: 'Pointers, arrays and memory', keywords: ['pointers', 'arrays', 'memory'], body: `p + i advances by i × sizeof(*p). \`a[i]\` is \`*(a+i)\`. A pointer to a local variable becomes invalid when the function returns. \`malloc\` returns uninitialized memory; \`calloc\` zeroes it. Every allocation needs a matching \`free\`, and every pointer dereference must be valid.` },
    { title: 'Structs, unions and dynamic allocation', keywords: ['structs', 'unions', 'dynamic allocation'], body: `A struct lays fields out in order with padding for alignment; a union overlays fields in the same storage. \`sizeof(struct)\` may exceed the sum of members due to padding. Dynamic arrays grow by reallocating and copying; amortized O(1) append requires geometric growth.` },
    { title: 'Recursion and the call stack', keywords: ['recursion', 'call stack', 'backtracking'], body: `Each call pushes a frame with parameters, locals, and a return address. The recursion tree's size determines time; its depth determines stack space. Memoization collapses overlapping subproblems. Backtracking explores choices and undoes them; pruning is what makes it practical.` },
    { title: 'Stacks, queues and linked lists', keywords: ['stacks', 'queues', 'linked lists'], body: `A stack is LIFO; a queue is FIFO. Both can be array-backed or linked. A linked list supports O(1) insertion/deletion at a known node but loses random access and locality. Fast/slow pointers detect cycles and find the middle in one pass.` },
    { title: 'Trees and binary search trees', keywords: ['trees', 'bst', 'traversal'], body: `A binary tree has at most two children per node. Inorder traversal of a BST yields sorted order; search, insert, and delete are O(h), where h can degrade to n. AVL and red-black trees bound h to O(log n). Traversals: preorder, inorder, postorder, level-order.` },
    { title: 'Heaps and priority queues', keywords: ['heaps', 'priority queue', 'heapify'], body: `A binary heap is a complete tree stored in an array: children of i are 2i+1 and 2i+2. Insert and extract-min are O(log n); building a heap is O(n). Heapsort is O(n log n) in place but not stable. A priority queue is the abstract data type.` },
    { title: 'Hashing', keywords: ['hashing', 'hash table', 'collision'], body: `A hash function maps keys to buckets. Collisions are resolved by chaining or open addressing. Load factor α drives performance; chaining averages O(1+α), open addressing degrades as α→1. Universal hashing randomizes the function to avoid adversarial collisions.` },
  ],
  worked: [
    { title: 'Reversing a linked list iteratively', body: `Keep three pointers: prev=null, curr=head, next. In each step, save next=curr.next, point curr.next=prev, advance prev=curr, curr=next. When curr is null, prev is the new head. Time O(n), space O(1). Drawing the three pointers on paper prevents the classic lost-node bug.` },
    { title: 'Why build-heap is O(n)', body: `Building a heap bottom-up sifts down each internal node. The number of nodes at height h is at most n/2^(h+1), and each sifts O(h), so the total is Σ h·n/2^(h+1) = O(n). Inserting n elements one by one would cost O(n log n); the bottom-up construction is faster because most nodes are near the leaves.` },
  ],
  exam: [
    { question: 'What is the complexity of searching a skewed BST?', answer: 'O(n) in the worst case, because the tree degenerates into a linked list; balanced trees guarantee O(log n).' },
    { question: 'Why is a linked list not cache-friendly?', answer: 'Nodes are scattered in memory, so traversal causes many cache misses; arrays store elements contiguously.' },
    { question: 'What is the average complexity of a hash lookup?', answer: 'O(1+α) expected, where α is the load factor; worst case O(n) with adversarial collisions.' },
  ],
  cheat: [
    'Pointers: p+i advances sizeof(*p)·i; a[i] ≡ *(a+i). Free every malloc.',
    'Struct padding can make sizeof larger than the sum of fields.',
    'Recursion needs base case + progress + combination; depth costs stack.',
    'Stack LIFO, queue FIFO. Fast/slow pointers find cycles and middles.',
    'BST O(h); balanced O(log n); inorder = sorted. Heap children 2i+1, 2i+2.',
    'Hash expected O(1+α); chaining vs open addressing; load factor matters.',
  ],
  code: {
    title: 'Reverse a singly linked list in C', language: 'c',
    code: `struct Node { int value; struct Node *next; };

struct Node *reverse(struct Node *head) {
    struct Node *prev = NULL;
    while (head) {
        struct Node *next = head->next;
        head->next = prev;
        prev = head;
        head = next;
    }
    return prev;
}`,
    explanation: 'Save next before rewiring, then advance both pointers. The loop ends when head is NULL and prev points at the new head.',
  },
};

MODULE_KNOWLEDGE['Algorithms'] = {
  overview: `Algorithms is the study of solving problems with guaranteed resource bounds. The core skills are choosing the right paradigm, proving correctness, and analyzing time and space precisely enough to compare alternatives.

GATE tests asymptotic reasoning, recurrences, graph algorithms, dynamic programming, and the ability to trace an algorithm on a small input.` ,
  foundations: [
    `Asymptotic notation describes growth, not runtime. O is an upper bound, Ω a lower bound, Θ a tight bound; constants and lower-order terms are discarded. An O(n²) algorithm can beat an O(n log n) algorithm on small inputs because notation hides constants — but for large n, the growth rate dominates.` ,
    `Correctness arguments follow the algorithm's structure. For loops, state a loop invariant that holds before and after each iteration. For recursion, use induction: prove the base case, assume correctness for smaller inputs, and show the combine step preserves it.` ,
    `The major paradigms encode different exchange rates between work and memory. Divide and conquer splits, solves, and combines. Greedy commits to a locally optimal choice and must be proved with an exchange argument. Dynamic programming trades redundant recomputation for a table, and requires optimal substructure and overlapping subproblems.` ,
  ],
  concepts: [
    { title: 'Asymptotic analysis', keywords: ['complexity', 'asymptotic', 'big o', 'analysis'], body: `Analyze the number of dominant operations as a function of input size. Nested loops multiply; sequential loops add; halving the input each step gives log n. Space counts auxiliary memory, not the input. Amortized analysis averages a sequence of operations, as in dynamic-array doubling.` },
    { title: 'Recurrences and the Master theorem', keywords: ['recurrence', 'master theorem', 'divide and conquer'], body: `For T(n) = aT(n/b) + f(n), compare f(n) with n^(log_b a). If f is polynomially smaller, T = Θ(n^(log_b a)); if equal up to log factors, multiply by log n; if polynomially larger and regular, T = Θ(f(n)). Merge sort: a=2,b=2,f=n → Θ(n log n).` },
    { title: 'Sorting', keywords: ['sorting', 'quicksort', 'mergesort', 'heapsort'], body: `Comparison sorting has a lower bound of Ω(n log n). Merge sort is stable and Θ(n log n) but uses O(n) space. Quicksort is in-place and fast in practice but O(n²) worst case; randomization avoids adversarial inputs. Heapsort is O(n log n) in place but unstable. Counting and radix sort beat the bound for restricted keys.` },
    { title: 'Greedy algorithms', keywords: ['greedy', 'interval', 'huffman'], body: `A greedy algorithm builds a solution by repeatedly taking the locally best choice. It is correct only when the greedy-choice property and optimal substructure hold. Interval scheduling sorts by finish time; Huffman coding repeatedly merges the two least frequent symbols. Always test a counterexample before trusting greed.` },
    { title: 'Dynamic programming', keywords: ['dynamic programming', 'dp', 'memoization'], body: `DP defines a state, a recurrence, and a base case, then computes states in dependency order or memoizes. Classic problems: knapsack, longest common subsequence, edit distance, matrix-chain multiplication, shortest paths. The state must capture everything the future needs; missing a dimension is the usual bug.` },
    { title: 'Graph traversal and shortest paths', keywords: ['graphs', 'bfs', 'dfs', 'dijkstra'], body: `BFS explores by layers and finds shortest paths in unweighted graphs. DFS explores deeply and classifies edges; it detects cycles and produces topological order. Dijkstra is O((V+E) log V) with a heap and fails on negative edges. Bellman-Ford handles negative edges in O(VE); Floyd-Warshall computes all-pairs in O(V³).` },
    { title: 'Minimum spanning trees', keywords: ['mst', 'kruskal', 'prim'], body: `An MST connects all vertices with minimum total edge weight. Kruskal sorts edges and adds them with a union-find cycle check: O(E log E). Prim grows a tree from one vertex with a priority queue: O(E log V). Both are greedy and correct by the cut property.` },
    { title: 'NP-completeness', keywords: ['np', 'np-complete', 'reduction'], body: `P is the class of problems solvable in polynomial time; NP is the class whose solutions can be verified in polynomial time. A problem is NP-complete if it is in NP and every NP problem reduces to it in polynomial time. Showing X is NP-complete requires a known NP-complete problem reducing to X, not the other way around.` },
  ],
  worked: [
    { title: 'Solving T(n) = 2T(n/2) + n', body: `a=2, b=2, so n^(log_b a) = n. f(n)=n matches, so T(n)=Θ(n log n). Intuition: at each of log n levels, the total work is n. Merge sort is exactly this recurrence.` },
    { title: '0/1 knapsack by DP', body: `State dp[i][w] = best value using the first i items with capacity w. Recurrence: skip item i → dp[i−1][w]; take it if weight_i ≤ w → value_i + dp[i−1][w−weight_i]. Base dp[0][*]=0. Fill row by row, answer dp[n][W]. Time O(nW), space O(nW) or O(W) with a reverse loop.` },
  ],
  exam: [
    { question: 'Which shortest-path algorithm handles negative edge weights?', answer: 'Bellman-Ford, in O(VE); Dijkstra requires non-negative weights.' },
    { question: 'What is the lower bound for comparison-based sorting?', answer: 'Ω(n log n), from the decision-tree argument over n! possible orderings.' },
    { question: 'What two properties must a problem have for DP?', answer: 'Optimal substructure and overlapping subproblems.' },
  ],
  cheat: [
    'Master theorem: compare f(n) with n^log_b(a); three cases.',
    'Merge sort stable O(n log n) space O(n); quicksort in-place average O(n log n), worst O(n²).',
    'BFS shortest unweighted; DFS cycles/topological; Dijkstra non-negative; Bellman-Ford negatives.',
    'MST: Kruskal sort + union-find; Prim grow + heap.',
    'DP = state + recurrence + base + order. Knapsack O(nW), LCS O(nm), Floyd O(V³).',
    'NP-complete: in NP + known NP-hard problem reduces to it.',
  ],
};

MODULE_KNOWLEDGE['Theory of Computation'] = {
  overview: `Theory of computation classifies problems by the machine needed to solve them. Finite automata recognize regular languages, pushdown automata recognize context-free languages, and Turing machines define what is computable at all.

GATE tests closure properties, conversions between models, pumping lemmas, decidability, and reductions. Precision with definitions is everything.` ,
  foundations: [
    `A language is a set of strings over an alphabet. A DFA is a finite set of states with deterministic transitions; an NFA may have multiple transitions and ε-moves. They recognize exactly the regular languages, and every NFA can be converted to a DFA by subset construction.` ,
    `A context-free grammar generates strings by rewriting nonterminals; a pushdown automaton recognizes the same class with a stack. CFGs capture nesting — balanced parentheses, arithmetic expressions — that finite automata cannot.` ,
    `A Turing machine has an infinite tape and can read, write, and move; it defines computability. Some problems are undecidable: no algorithm can solve them for all inputs. The halting problem is the canonical example, proved by diagonalization.` ,
  ],
  concepts: [
    { title: 'DFA, NFA and regular languages', keywords: ['dfa', 'nfa', 'regular', 'automata'], body: `A DFA has exactly one transition per state-symbol pair; an NFA may have several or none. Subset construction converts an NFA with n states into a DFA with at most 2^n states. Regular languages are closed under union, intersection, complement, concatenation, and star.` },
    { title: 'Regular expressions and pumping lemma', keywords: ['regular expression', 'pumping lemma', 'regex'], body: `Regular expressions describe regular languages using union, concatenation, and Kleene star. The pumping lemma is a necessary condition: if L is regular, long strings can be split xyz with y pumped. Use it to prove a language is not regular — for example {a^n b^n}.` },
    { title: 'Context-free grammars and PDA', keywords: ['cfg', 'context-free', 'pda'], body: `A CFG has productions A → α. Derivation trees show structure; ambiguity means a string has two parse trees. A PDA adds a stack to a finite automaton and recognizes exactly the context-free languages. Deterministic PDAs are weaker than nondeterministic ones.` },
    { title: 'Closure and decision properties', keywords: ['closure', 'decidable', 'properties'], body: `Regular languages are closed under all Boolean operations. CFLs are closed under union, concatenation, and star but not intersection or complement. Emptiness, finiteness, and membership are decidable for both; equivalence is decidable for DFA but not for CFG.` },
    { title: 'Turing machines and decidability', keywords: ['turing machine', 'decidable', 'halting'], body: `A Turing machine is finite control plus an unbounded tape. A language is decidable if some TM halts on every input with the right answer; recognizable if it halts on strings in the language. The halting problem is recognizable but undecidable.` },
    { title: 'Reductions and undecidability', keywords: ['reduction', 'undecidable', 'rice theorem'], body: `A reduction transforms instances of problem A into instances of problem B so a solver for B solves A. If A is undecidable and A ≤ B, then B is undecidable. Rice's theorem: every non-trivial semantic property of programs is undecidable.` },
    { title: 'Complexity classes', keywords: ['p', 'np', 'complexity classes'], body: `P is deterministic polynomial time; NP is nondeterministic polynomial time, equivalently polynomial-time verifiable. NP-complete problems are the hardest in NP. Whether P = NP is open. PSPACE contains problems solvable with polynomial space and includes NP.` },
  ],
  worked: [
    { title: 'Proving {0^n 1^n} is not regular', body: `Assume it is regular with pumping length p. Choose s = 0^p 1^p. Any split s = xyz with |xy| ≤ p means y consists only of 0s. Pumping y changes the number of 0s but not 1s, so xy²z ∉ L. Contradiction — the language is not regular. A PDA recognizes it by pushing 0s and popping on 1s.` },
    { title: 'Converting an NFA to a DFA', body: `Start with the ε-closure of the start state as the initial DFA state. For each DFA state and symbol, take the union of ε-closures of all NFA transitions, and repeat until no new sets appear. Accepting DFA states are those containing an NFA accept state. The worst case is exponential.` },
  ],
  exam: [
    { question: 'Are context-free languages closed under intersection?', answer: 'No. Intersection of two CFLs can be non-context-free, e.g. {a^n b^n c^m} ∩ {a^m b^n c^n}.' },
    { question: 'What does the pumping lemma prove?', answer: 'It proves a language is not regular (or not context-free); passing it does not prove regularity.' },
    { question: 'Is the halting problem decidable?', answer: 'No; it is recognizable but undecidable.' },
  ],
  cheat: [
    'DFA deterministic; NFA nondeterministic; subset construction up to 2^n states.',
    'Regular languages closed under union/intersection/complement/star; CFLs not closed under intersection/complement.',
    'Pumping lemma: necessary, not sufficient. Use it to disprove regularity.',
    'PDA = NFA + stack ⇔ context-free grammar. Ambiguity is undecidable for CFG.',
    'TM = finite control + infinite tape; halting is undecidable; Rice: non-trivial semantic properties undecidable.',
    'P ⊆ NP ⊆ PSPACE; NP-complete = hardest in NP under poly reductions.',
  ],
};

MODULE_KNOWLEDGE['Compiler Design'] = {
  overview: `A compiler translates source code into another language through a pipeline of phases: lexical analysis, syntax analysis, semantic analysis, intermediate code generation, optimization, and code generation. Each phase has a formal model and a practical implementation.

GATE tests grammar classification, parsing tables, FIRST/FOLLOW sets, syntax-directed translation, and intermediate representations.` ,
  foundations: [
    `The front end checks that the program is well-formed. Lexical analysis groups characters into tokens with regular expressions and finite automata. Syntax analysis checks the token stream against a grammar with a pushdown automaton. Semantic analysis resolves names and types.` ,
    `The middle end lowers the program to an intermediate representation and optimizes it. Three-address code makes operations explicit; control-flow graphs expose branches and loops; data-flow analysis propagates facts such as liveness and reaching definitions.` ,
    `The back end maps the IR to machine instructions, allocating registers and scheduling operations. Peephole optimization cleans up local patterns. The entire pipeline must preserve semantics while improving a measurable cost such as time or space.` ,
  ],
  concepts: [
    { title: 'Lexical analysis and finite automata', keywords: ['lexical', 'tokens', 'scanner', 'automata'], body: `The scanner matches the longest token and applies priority rules for ties. Regular expressions define token patterns; a DFA built from them recognizes tokens in linear time. Keywords, identifiers, literals, and operators are separated before parsing.` },
    { title: 'Grammars and ambiguity', keywords: ['grammar', 'ambiguity', 'derivation'], body: `A CFG has terminals, nonterminals, productions, and a start symbol. Leftmost and rightmost derivations produce parse trees. An ambiguous grammar has two parse trees for one string. Operator precedence and left recursion must be encoded carefully for parsing.` },
    { title: 'Top-down parsing: LL(1)', keywords: ['parsing', 'll', 'recursive descent', 'first follow'], body: `LL(1) parsers read left-to-right, produce a leftmost derivation, and use one lookahead token. FIRST(α) is the set of terminals that can begin α; FOLLOW(A) is the set that can follow A. A grammar is LL(1) if no two productions for a nonterminal have overlapping prediction sets.` },
    { title: 'Bottom-up parsing: LR and precedence', keywords: ['lr parsing', 'shift reduce', 'precedence'], body: `LR parsers maintain a stack and shift or reduce productions. SLR uses FOLLOW to resolve reductions; CLR uses item sets with lookahead; LALR merges CLR states with the same core. Shift/reduce and reduce/reduce conflicts indicate grammar problems. Operator-precedence parsing handles expressions with precedence relations.` },
    { title: 'Syntax-directed translation', keywords: ['syntax directed', 'sdt', 'attributes'], body: `An SDD attaches attributes to grammar symbols and equations to productions. Synthesized attributes flow up the tree; inherited attributes flow down. An SDT embeds semantic actions in productions. Type checking and intermediate code generation are naturally syntax-directed.` },
    { title: 'Intermediate code and three-address code', keywords: ['intermediate code', 'three address code', 'ir'], body: `Three-address code uses at most one operator per instruction: t1 = a + b. Control flow uses labels and conditional jumps. SSA form gives every value a single definition, simplifying optimization. Quadruples and triples are common representations.` },
    { title: 'Optimization and data-flow analysis', keywords: ['optimization', 'data flow', 'liveness'], body: `Local optimizations include constant folding, copy propagation, and dead-code elimination. Global analysis propagates facts over the CFG: reaching definitions (may), available expressions (must), live variables (may), and very busy expressions (must). Liveness enables register allocation by graph coloring.` },
    { title: 'Code generation and register allocation', keywords: ['code generation', 'register allocation', 'peephole'], body: `Code generation selects instructions and assigns registers. Graph coloring allocates registers by building an interference graph; spills go to memory. Instruction scheduling hides latency; peephole optimization replaces local patterns with cheaper equivalents.` },
  ],
  worked: [
    { title: 'FIRST and FOLLOW for a small grammar', body: `Grammar: S → AB, A → a | ε, B → b. FIRST(A) = {a, ε}; FIRST(B) = {b}; FIRST(S) = FIRST(A) minus ε plus FIRST(B) = {a, b}. FOLLOW(S) = {$}; FOLLOW(A) = FIRST(B) = {b}; FOLLOW(B) = FOLLOW(S) = {$}. These sets drive the LL(1) table.` },
    { title: 'Why left recursion breaks top-down parsing', body: `Grammar E → E + T | T. A recursive-descent parser for E immediately calls E without consuming input, causing infinite recursion. Eliminate left recursion: E → T E′, E′ → + T E′ | ε. The transformed grammar recognizes the same language and is LL(1)-parseable.` },
  ],
  exam: [
    { question: 'What is the difference between SLR and CLR?', answer: 'SLR uses FOLLOW sets for reductions and is weaker; CLR uses exact lookahead sets per item and accepts more grammars.' },
    { question: 'Why are regular expressions not enough for parsing?', answer: 'They cannot count nesting (e.g., balanced parentheses), which requires a stack/context-free grammar.' },
    { question: 'What does liveness analysis compute?', answer: 'The set of variables that may be read before being overwritten; it drives dead-code elimination and register allocation.' },
  ],
  cheat: [
    'Phases: lex → parse → semantic → IR → optimize → codegen.',
    'Lexer: regex → DFA, longest match, priority on ties.',
    'LL(1): FIRST/FOLLOW, no overlapping prediction sets, no left recursion.',
    'LR: shift/reduce with item sets; SLR uses FOLLOW, CLR exact, LALR merged cores.',
    'Three-address code: one operator per instruction; SSA single definition.',
    'Data flow: reaching defs (may), available exprs (must), live vars (may). Graph coloring for registers.',
  ],
};

MODULE_KNOWLEDGE['Operating Systems'] = {
  overview: `An operating system multiplexes hardware among processes and provides abstractions: processes, threads, virtual memory, files, and synchronization. It must be correct under concurrency, fair under contention, and safe under failure.

GATE tests scheduling, synchronization, deadlock, memory management, page replacement, and file-system allocation with quantitative problems.` ,
  foundations: [
    `A process is a program in execution with its own address space; a thread is a unit of execution sharing that space. The OS switches contexts, saving and restoring registers. Scheduling chooses which ready process runs, trading throughput against response time and fairness.` ,
    `Concurrency requires synchronization. A race condition occurs when the result depends on interleaving; a critical section must be protected by mutual exclusion. Semaphores and monitors provide that protection; deadlock and starvation are the failure modes.` ,
    `Virtual memory gives each process the illusion of a large contiguous address space. Pages map to frames through a page table; the TLB caches translations; page replacement decides what to evict. The working set and locality determine whether the system thrashes.` ,
  ],
  concepts: [
    { title: 'Processes, threads and context switching', keywords: ['process', 'threads', 'context switch'], body: `A process has code, data, heap, and stack plus OS metadata (PCB). Threads share code, data, and heap but have private stacks and registers. Context switching saves the current execution state and restores another; it is pure overhead, so too-frequent switching hurts throughput.` },
    { title: 'CPU scheduling', keywords: ['scheduling', 'fcfs', 'sjf', 'round robin'], body: `FCFS is simple but suffers convoy effect. SJF minimizes average waiting time but needs burst prediction and can starve long jobs. Round robin bounds response time with a quantum. Priority scheduling can starve; aging fixes it. Multilevel feedback queues adapt to observed behavior.` },
    { title: 'Synchronization and semaphores', keywords: ['synchronization', 'semaphore', 'mutex', 'critical section'], body: `A semaphore is an integer with atomic wait (P) and signal (V). A binary semaphore is a mutex; a counting semaphore controls access to n resources. The producer–consumer pattern uses empty/full semaphores plus a mutex. Monitors bundle state and condition variables.` },
    { title: 'Deadlock', keywords: ['deadlock', 'banker', 'resource allocation'], body: `Deadlock needs four conditions simultaneously: mutual exclusion, hold and wait, no preemption, and circular wait. Prevention breaks one condition; avoidance uses the Banker's algorithm to keep the system in a safe state; detection builds a wait-for graph and looks for cycles.` },
    { title: 'Memory management and paging', keywords: ['paging', 'virtual memory', 'page table'], body: `Paging divides memory into fixed frames and the address space into pages. The virtual address splits into page number and offset. A page table maps pages to frames; multi-level tables save space for sparse address spaces. Segmentation uses variable-size logical units.` },
    { title: 'Page replacement', keywords: ['page replacement', 'lru', 'belady'], body: `FIFO evicts the oldest page and can suffer Belady's anomaly. LRU evicts the least recently used page and is stack-algorithms-safe but expensive to implement exactly. Optimal evicts the page used farthest in the future and is a benchmark, not an implementation. Clock approximates LRU with a reference bit.` },
    { title: 'File systems', keywords: ['file system', 'inode', 'allocation'], body: `A file system maps names to blocks and metadata. Contiguous allocation is fast but fragments; linked allocation is flexible but slow for random access; indexed allocation uses an index block (inode) and supports direct, indirect, and doubly indirect blocks. Journaling preserves consistency across crashes.` },
    { title: 'Disk scheduling and I/O', keywords: ['disk scheduling', 'io', 'elevator'], body: `FCFS is fair but slow. SSTF minimizes seek time but can starve. SCAN (elevator) sweeps back and forth; C-SCAN returns without servicing. SSDs remove seek time but introduce wear leveling and garbage collection.` },
  ],
  worked: [
    { title: "Banker's algorithm safety check", body: `Given Available, Max, Allocation, compute Need = Max − Allocation. Find a process whose Need ≤ Available, pretend it finishes, and add its Allocation back to Available. Repeat. If all processes can finish, the state is safe. If no process fits, the state is unsafe — not necessarily deadlocked, but a deadlock is possible.` },
    { title: 'LRU page faults on a reference string', body: `Frames = 3, string = 7,0,1,2,0,3,0,4. Track the stack of recent pages. 7,0,1 fill; 2 evicts 7; 0 hits; 3 evicts 1; 0 hits; 4 evicts 2. Count the misses. Draw the frames after each reference — most errors come from losing the recency order.` },
  ],
  exam: [
    { question: 'What are the four necessary conditions for deadlock?', answer: 'Mutual exclusion, hold and wait, no preemption, and circular wait.' },
    { question: "Why can FIFO page replacement exhibit Belady's anomaly?", answer: 'It is not a stack algorithm, so adding frames can change the eviction pattern and increase faults.' },
    { question: 'What is the difference between a process and a thread?', answer: 'A process has its own address space; threads share the process address space and have private stacks and registers.' },
  ],
  cheat: [
    'Process = address space; thread = execution sharing it. Context switch = save/restore state.',
    'SJF optimal average wait but starvation; RR bounds response; aging prevents starvation.',
    'Semaphore P waits, V signals; binary = mutex; producer–consumer uses empty/full + mutex.',
    'Deadlock: mutual exclusion + hold&wait + no preemption + circular wait. Banker = safe state.',
    'Paging: VPN + offset → PFN + offset; TLB caches; multi-level tables for sparsity.',
    'FIFO anomaly; LRU stack-safe; optimal benchmark; Clock approximates LRU.',
  ],
};

MODULE_KNOWLEDGE['Database Management Systems'] = {
  overview: `A database management system stores data so that many users can query and modify it concurrently without losing correctness. The theory rests on the relational model, SQL, normalization, transactions, and indexing.

GATE tests relational algebra, SQL semantics, functional dependencies and normalization, transaction schedules, concurrency control, and index structures.` ,
  foundations: [
    `The relational model represents data as relations (tables) of tuples (rows) over attributes (columns). Keys identify tuples; foreign keys reference other relations. Relational algebra provides selection, projection, join, union, difference, and renaming — the formal core beneath SQL.` ,
    `Normalization removes redundancy and update anomalies by decomposing relations based on functional dependencies. Each normal form tightens the constraint: 1NF atomic values, 2NF no partial dependency, 3NF no transitive dependency, BCNF every determinant is a superkey.` ,
    `Transactions must be atomic, consistent, isolated, and durable (ACID). Concurrency control schedules conflicting operations to preserve equivalence to a serial order. Locking, timestamps, and multiversion schemes implement isolation at different costs.` ,
  ],
  concepts: [
    { title: 'ER model and relational mapping', keywords: ['er model', 'entities', 'relationships'], body: `Entities have attributes and participate in relationships with cardinality (1:1, 1:N, M:N) and participation constraints (total/partial). Map strong entities to tables, weak entities with the owner key, M:N relationships to junction tables, and multivalued attributes to separate tables.` },
    { title: 'Relational algebra', keywords: ['relational algebra', 'selection', 'projection', 'join'], body: `σ selects rows, π selects columns, × is Cartesian product, ⋈ is join, ∪/∩/− are set operations, ρ renames. Natural join matches equal attributes. Division answers \"for all\" queries. Relational algebra is procedural but declarative-equivalent to SQL's core.` },
    { title: 'SQL: queries, aggregates and nested queries', keywords: ['sql', 'aggregate', 'nested query'], body: `SELECT … FROM … WHERE … GROUP BY … HAVING … ORDER BY. WHERE filters rows before grouping; HAVING filters groups. NULL propagates: comparisons yield UNKNOWN, and aggregates ignore NULLs. EXISTS and IN differ on NULL semantics. Correlated subqueries re-evaluate per outer row.` },
    { title: 'Functional dependencies and normalization', keywords: ['functional dependency', 'normalization', 'bcnf', '3nf'], body: `X → Y means X determines Y. Armstrong's axioms: reflexivity, augmentation, transitivity. Closure of attributes finds all implied dependencies. A candidate key's closure is all attributes. 3NF allows determinants that are superkeys or prime attributes; BCNF requires every determinant to be a superkey.` },
    { title: 'Transactions and ACID', keywords: ['transaction', 'acid', 'serializability'], body: `A transaction is a unit of work that either commits or aborts. A schedule is serializable if it is equivalent to some serial order. Conflict serializability uses precedence graphs: a cycle means no serial order. Recoverable schedules avoid reading uncommitted data; cascadeless schedules restrict dirty reads.` },
    { title: 'Concurrency control', keywords: ['concurrency control', 'locking', '2pl', 'timestamp'], body: `Two-phase locking (2PL) has a growing and shrinking phase; strict 2PL holds exclusive locks until commit. It guarantees conflict serializability but can deadlock. Timestamp ordering aborts outdated operations. MVCC keeps versions so readers do not block writers.` },
    { title: 'Indexing and B+ trees', keywords: ['indexing', 'b tree', 'b+ tree', 'hashing'], body: `A B+ tree stores keys in internal nodes and data pointers in leaves, with all leaves linked for range scans. Height is O(log_f n), so lookups are a few disk I/Os. Hashing supports equality but not ranges. Clustered indexes order the data; secondary indexes point to rows.` },
    { title: 'Storage, file organization and recovery', keywords: ['storage', 'recovery', 'file organization'], body: `Heap files are unordered; sorted files speed range scans but slow inserts; hashed files speed equality. Write-ahead logging records before-images/after-images; undo removes uncommitted changes, redo reapplies committed ones. Checkpoints bound recovery time.` },
  ],
  worked: [
    { title: 'Finding candidate keys from functional dependencies', body: `R(A,B,C,D), FDs: AB→C, C→D, D→A. Compute closures. AB+ = ABCD, so AB is a candidate key. C+ = CDA, not all; add B: BC+ = BCDA, so BC is a key. D+ = DA; add B: BD+ = BDAC, so BD is a key. Check minimality by removing attributes: no smaller set closes. Candidate keys: AB, BC, BD.` },
    { title: 'Checking conflict serializability', body: `Schedule: T1: R(A), W(A); T2: R(A), W(A). Conflicts are pairs on the same data item with at least one write. T1's W(A) precedes T2's R(A), and T2's W(A) follows T1's R(A) — the precedence graph has both directions, a cycle, so the schedule is not conflict serializable.` },
  ],
  exam: [
    { question: 'What is the difference between 3NF and BCNF?', answer: '3NF permits a non-superkey determinant if the determined attribute is prime; BCNF requires every determinant to be a superkey.' },
    { question: 'Why are B+ trees preferred over B trees for databases?', answer: 'All data pointers are in leaves and leaves are linked, giving efficient range scans and stable lookup cost.' },
    { question: 'When is a schedule conflict serializable?', answer: 'When its precedence (conflict) graph is acyclic.' },
  ],
  cheat: [
    'Keys: closure X+ = all attributes. Candidate key minimal; superkey not necessarily minimal.',
    '3NF: determinant superkey or prime; BCNF: every determinant superkey.',
    'SQL order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY. NULL ≠ NULL.',
    'Serializable ⇔ acyclic precedence graph. Strict 2PL avoids cascading aborts.',
    'B+ tree: keys internal, data leaves, linked leaves; O(log_f n) I/Os.',
    'WAL: undo uncommitted, redo committed; checkpoint bounds recovery.',
  ],
};

MODULE_KNOWLEDGE['Computer Networks'] = {
  overview: `Computer networks move data between machines through layered protocols. Each layer solves one problem: framing and error detection at the link layer, routing and addressing at the network layer, reliable delivery at the transport layer, and application semantics at the top.

GATE tests the TCP/IP stack, addressing and subnetting, routing algorithms, flow and congestion control, and application protocols.` ,
  foundations: [
    `Layering isolates concerns. The application layer speaks HTTP, DNS, SMTP; the transport layer provides process-to-process delivery with TCP or UDP; the network layer routes packets with IP; the link layer frames bits on a medium; the physical layer transmits signals.` ,
    `IP addresses identify interfaces; subnets group them. A CIDR prefix /n means the first n bits are the network, leaving 2^(32−n) addresses. Routers forward based on the longest matching prefix. NAT rewrites addresses to share a public IP.` ,
    `TCP provides a reliable, ordered byte stream over unreliable IP. It uses sequence numbers, acknowledgements, retransmission, flow control (receiver window), and congestion control (slow start, congestion avoidance, fast recovery). UDP provides datagrams without guarantees and is preferred for latency-sensitive traffic.` ,
  ],
  concepts: [
    { title: 'OSI and TCP/IP models', keywords: ['osi', 'tcp ip', 'layers'], body: `OSI has seven layers: physical, data link, network, transport, session, presentation, application. TCP/IP collapses the top three into application and the bottom two into network access. Encapsulation adds headers as data moves down; decapsulation removes them on receipt.` },
    { title: 'Physical and data-link layer', keywords: ['data link', 'ethernet', 'framing', 'crc'], body: `Framing delimits packets; byte stuffing escapes delimiters. Error detection uses parity, checksums, or CRC. Ethernet uses MAC addresses and CSMA/CD historically; switches learn MAC addresses and forward frames. ARP resolves IP to MAC within a subnet.` },
    { title: 'IPv4 addressing and subnetting', keywords: ['ipv4', 'subnetting', 'cidr', 'addressing'], body: `An IPv4 address is 32 bits. A /n prefix leaves 32−n host bits; usable hosts = 2^(32−n) − 2 (network and broadcast). Subnetting borrows host bits. Longest-prefix match chooses the most specific route. Private ranges: 10/8, 172.16/12, 192.168/16.` },
    { title: 'Routing algorithms', keywords: ['routing', 'dijkstra', 'distance vector', 'bgp'], body: `Link-state routing floods topology and runs Dijkstra (OSPF). Distance-vector routing exchanges neighbour tables (RIP) and suffers count-to-infinity; split horizon and poison reverse mitigate it. BGP is path-vector between autonomous systems.` },
    { title: 'TCP: connection, flow and congestion control', keywords: ['tcp', 'congestion control', 'flow control', 'handshake'], body: `Three-way handshake: SYN, SYN-ACK, ACK. Sequence numbers track bytes; cumulative ACKs confirm. Flow control uses the receiver's advertised window. Congestion control grows cwnd slowly (slow start), then linearly (congestion avoidance), halves on loss (fast recovery).` },
    { title: 'UDP and application protocols', keywords: ['udp', 'http', 'dns', 'application'], body: `UDP is connectionless with a checksum and no retransmission; DNS, DHCP, and streaming use it. HTTP is request/response over TCP; HTTP/2 multiplexes streams; HTTP/3 runs over QUIC/UDP. DNS resolves names hierarchically with caching and TTLs.` },
    { title: 'Network security basics', keywords: ['security', 'tls', 'firewall', 'encryption'], body: `TLS authenticates the server with certificates and negotiates symmetric keys. Firewalls filter by address/port/state; IDS/IPS inspect traffic. Encryption in transit protects confidentiality; hashing and signatures protect integrity and authenticity.` },
  ],
  worked: [
    { title: 'Subnetting a /24 into four subnets', body: `Borrow 2 host bits: /26. Subnet mask 255.255.255.192. Ranges: .0–.63, .64–.127, .128–.191, .192–.255. Each has 64 addresses, 62 usable. Broadcast is the last address in each range; the network is the first.` },
    { title: 'TCP slow start to congestion avoidance', body: `Initial cwnd = 1 MSS. Each RTT doubles: 1,2,4,8,16 until ssthresh. Then cwnd grows by 1 MSS per RTT. On timeout, ssthresh = cwnd/2, cwnd = 1, and slow start restarts. Plot cwnd over time to see the sawtooth.` },
  ],
  exam: [
    { question: 'How many usable hosts in a /27 subnet?', answer: '2^(32−27) − 2 = 32 − 2 = 30.' },
    { question: 'Why does TCP use a three-way handshake?', answer: 'To synchronize sequence numbers and confirm both directions are reachable before data flows.' },
    { question: 'What is the difference between flow control and congestion control?', answer: 'Flow control protects the receiver from overflow using its advertised window; congestion control protects the network by adapting to loss and delay.' },
  ],
  cheat: [
    'Encapsulation down, decapsulation up. OSI 7 layers; TCP/IP 4.',
    'IPv4 /n: hosts = 2^(32−n) − 2. Longest-prefix match. Private ranges 10/8, 172.16/12, 192.168/16.',
    'CRC detects errors; ARP resolves IP→MAC; switch forwards by MAC; router by IP.',
    'Routing: OSPF link-state/Dijkstra; RIP distance-vector; BGP path-vector.',
    'TCP handshake SYN/SYN-ACK/ACK; slow start doubles, then linear; loss halves cwnd.',
    'UDP no guarantees; DNS uses UDP; HTTP/3 uses QUIC over UDP; TLS = certificates + symmetric keys.',
  ],
};

MODULE_KNOWLEDGE['General Aptitude and GATE Strategy'] = {
  overview: `General Aptitude is 15 marks of the GATE paper and the most reliable place to gain them: quantitative reasoning, verbal ability, and analytical logic with bounded syllabus and predictable question types.

Strategy is the other half. A 3-hour paper with 65 questions rewards accuracy, question selection, and calm execution as much as knowledge.` ,
  foundations: [
    `Quantitative aptitude tests ratios, percentages, averages, time–speed–distance, time–work, profit–loss, interest, permutations, probability, and mensuration. Most questions reduce to setting up one equation carefully; estimation and option elimination often beat full computation.` ,
    `Verbal ability tests grammar, vocabulary in context, sentence completion, and reading comprehension. Read the passage once for structure, then answer with evidence from the text. Do not import outside assumptions.` ,
    `Analytical reasoning tests sequences, blood relations, directions, syllogisms, and arrangements. Draw the situation. For syllogisms, use Venn diagrams with the minimum overlap consistent with the premises.` ,
  ],
  concepts: [
    { title: 'Percentages, ratios and averages', keywords: ['percentage', 'ratio', 'average'], body: `A percentage change is (new−old)/old. Successive changes multiply: +20% then −20% gives 0.96, not 1. Ratios scale; averages are weighted by counts. The average of averages is not the overall average unless group sizes are equal.` },
    { title: 'Time, speed, distance and work', keywords: ['time speed distance', 'time and work', 'trains'], body: `Distance = speed × time. Relative speed adds when moving opposite, subtracts when same direction. Work problems: rate = 1/time; combined rate adds. Pipes and cisterns are work problems with negative rates for outlets.` },
    { title: 'Profit, loss and interest', keywords: ['profit', 'loss', 'interest'], body: `Profit% is on cost price unless stated. Selling price = CP(1 + p/100). Simple interest = PRT/100; compound = P(1+r/100)^t − P. Successive discounts multiply, not add.` },
    { title: 'Permutations, combinations and probability', keywords: ['permutation', 'combination', 'probability'], body: `Arrange n distinct objects: n!. Choose r of n: C(n,r). Probability = favourable/total when outcomes are equally likely. At least one = 1 − none. Independent events multiply; mutually exclusive events add.` },
    { title: 'Reading comprehension and verbal ability', keywords: ['verbal', 'reading comprehension', 'grammar'], body: `Find the main idea, the author's tone, and the supporting evidence. Eliminate options that are too broad, too narrow, or contradicted. For grammar, check subject–verb agreement, parallelism, modifiers, and pronoun reference.` },
    { title: 'Logical reasoning', keywords: ['logical reasoning', 'syllogism', 'arrangement'], body: `Syllogisms: draw premises as sets; a conclusion is valid only if it holds in every model. Arrangements: fix the most constrained item first. Blood relations: draw a family tree. Directions: sketch axes and track turns.` },
    { title: 'Exam-day strategy', keywords: ['strategy', 'exam', 'time management'], body: `Three passes: first the easy and certain, then the moderate, then the hard. Never let one question consume more than 2–3 minutes. GATE has negative marking for MCQs; guess only when you can eliminate at least two options. NAT questions have no negative marking.` },
  ],
  worked: [
    { title: 'Successive percentage change', body: `A price rises 25% then falls 20%. Multiply factors: 1.25 × 0.80 = 1.00. The net change is 0%. Adding percentages would wrongly give +5%. Always convert to multipliers for successive changes.` },
    { title: 'Two pipes filling a tank', body: `Pipe A fills in 6 h (rate 1/6), pipe B in 4 h (rate 1/4). Combined rate = 1/6 + 1/4 = 5/12. Time = 12/5 = 2.4 h. With a drain at 1/12, rate = 5/12 − 1/12 = 4/12, time = 3 h.` },
  ],
  exam: [
    { question: 'A shirt costs ₹800 after a 20% discount. What was the marked price?', answer: '800 = 0.8 × MP → MP = ₹1000.' },
    { question: 'In how many ways can 3 people be chosen from 8?', answer: 'C(8,3) = 56.' },
    { question: 'What is the probability of at least one head in two coin tosses?', answer: '1 − P(no heads) = 1 − 1/4 = 3/4.' },
  ],
  cheat: [
    'Successive % changes multiply: 1.25 × 0.8 = 1.0. Average of averages needs weights.',
    'Relative speed: opposite add, same subtract. Work rate = 1/time, add rates.',
    'Profit% on CP. Discounts multiply. SI = PRT/100; CI = P(1+r)^t − P.',
    'C(n,r) = n!/(r!(n−r)!); at least one = 1 − none; independent multiply.',
    'RC: main idea + evidence; eliminate too broad/narrow/contradicted.',
    'Three passes; MCQ negative marking, NAT none; guess only with elimination.',
  ],
};

MODULE_KNOWLEDGE['PYQ Marathons and Test Strategy'] = {
  overview: `Previous-year questions are the most honest guide to what GATE actually asks. A PYQ marathon is not memorizing answers; it is pattern extraction: which concepts recur, how they are phrased, and where the traps sit.

This module turns practice into a system: topic-wise PYQs, full-length mocks, error logs, and a revision cadence that compounds.` ,
  foundations: [
    `Solve PYQs topic-wise immediately after studying a topic, then again in mixed sets after a month. The first pass builds recognition; the second builds retrieval under uncertainty. Tag every question by concept, difficulty, and error type.` ,
    `A mock exam is a diagnostic, not a score. Analyze time per section, unattempted questions, silly mistakes, and conceptual gaps separately. The goal of the next week is to fix the largest bucket, not to take more mocks.` ,
    `Revision must be active. Re-derive formulas, re-solve missed questions from scratch, and explain a concept aloud. Passive rereading creates familiarity, not recall. Space repetitions: 1 day, 3 days, 1 week, 1 month.` ,
  ],
  concepts: [
    { title: 'Building a PYQ bank', keywords: ['pyq', 'previous year', 'practice'], body: `Collect at least 10 years of questions. Tag by subject, topic, and question type (conceptual, numerical, derivation, application). Note repeated patterns — the same concept often returns with different numbers. Solve before looking at solutions.` },
    { title: 'Mock exam protocol', keywords: ['mock', 'test series', 'strategy'], body: `Simulate the real paper: same time, no pauses, one screen. Use the three-pass strategy. Record start/end time per question. Afterward, classify every wrong answer as concept, calculation, misread, or guess.` },
    { title: 'Error log and spaced revision', keywords: ['error log', 'revision', 'mistakes'], body: `An error log entry: question, concept, what I did, why it was wrong, the correct method, and a re-test date. Review the log weekly. Re-solve only the missed questions; do not reread the whole chapter.` },
    { title: 'Topic prioritization by weight', keywords: ['weightage', 'prioritization', 'syllabus'], body: `Use PYQ frequency to allocate time. High-weight, high-accuracy topics are your scoring base; high-weight, low-accuracy topics are the biggest upside; low-weight topics get minimum viable coverage. Do not polish a strength while a large weakness stays untouched.` },
    { title: 'Final-month plan', keywords: ['final month', 'plan', 'revision'], body: `Weeks 1–2: full syllabus revision + 2 mocks/week. Week 3: weak-topic repair + 3 mocks. Week 4: formula sheets, error log, light mocks, sleep schedule. Reduce new material; protect energy and confidence.` },
  ],
  worked: [
    { title: 'Turning a mock into an action plan', body: `Score 52/100. Breakdown: 18 lost to concepts (Algorithms, OS), 12 to calculation errors, 8 to misreads, 10 unattempted. Next week: re-study the two weak topics, do 30 timed calculation drills, and practice marking keywords before solving. Retake a mock at the end of the week and compare buckets, not just the score.` },
    { title: 'Spaced revision schedule', body: `Study topic on day 0; re-solve key examples on day 1; mixed practice on day 3; full test on day 7; quick formula recall on day 30. Each repetition is active recall, not rereading. This schedule is more effective than four hours of passive review in one sitting.` },
  ],
  exam: [
    { question: 'What is the most useful way to review a mock?', answer: 'Classify errors by cause (concept, calculation, misread, guess), then fix the largest bucket before taking another mock.' },
    { question: 'Why solve PYQs topic-wise and then mixed?', answer: 'Topic-wise builds recognition; mixed sets build retrieval and switching under exam conditions.' },
    { question: 'How should the final month be spent?', answer: 'Revision and weak-topic repair, formula sheets, error-log review, and timed mocks — not new material.' },
  ],
  cheat: [
    'PYQ tagging: subject, topic, type, difficulty. Solve before reading solutions.',
    'Mock analysis: time per question, unattempted, silly vs conceptual errors.',
    'Error log: question, concept, mistake, correct method, re-test date.',
    'Prioritize: high-weight/low-accuracy first; low-weight gets minimum coverage.',
    'Active recall > rereading. Space: 1d, 3d, 7d, 30d.',
    'Final month: revision + mocks + error log; protect sleep and energy.',
  ],
};

// ================================================================= WEB / DEV

MODULE_KNOWLEDGE['Engineering Foundations'] = {
  overview: `Every software team runs on a small set of shared tools: version control, a terminal, and a package ecosystem. Fluency here is not clerical work — it determines whether you can reproduce a bug, review a change safely, and recover when something breaks.

This module builds the operating habits behind professional engineering: deliberate Git history, a shell you can reason about, and dependency management that keeps a project buildable a year from now.` ,
  foundations: [
    `Version control is a history of snapshots, not a folder of files. A commit records a tree, a parent, an author, and a message. Branches are movable labels on commits, which is why creating one is instant and why merging is a graph operation rather than a file copy.` ,
    `The terminal is a text interface to the same operating system calls your program uses. A command reads stdin, writes stdout, reports errors on stderr, and returns an exit code. Pipes connect these streams, which makes small tools composable. Environment variables carry configuration without hard-coding it.` ,
    `A package manager resolves a dependency graph, writes the exact resolution to a lockfile, and installs it. Semantic versioning communicates intent, but only the lockfile guarantees reproducibility. Every dependency is code you did not write running with your privileges, so supply-chain hygiene is part of engineering, not an afterthought.` ,
  ],
  concepts: [
    { title: 'Git objects, commits and branches', keywords: ['git', 'github', 'commit', 'branch'], body: `Git stores blobs (file contents), trees (directory listings), and commits (snapshots with parents). A branch is a ref pointing at a commit; HEAD points at your current branch. Detached HEAD means HEAD points directly at a commit, so new commits are not attached to a branch.` },
    { title: 'Merge, rebase and conflict resolution', keywords: ['merge', 'rebase', 'conflict', 'workflow'], body: `Merge preserves history and creates a merge commit; rebase replays commits onto a new base for a linear history. Never rebase a shared branch: rewriting published commits forces everyone else to reconcile divergent history. Resolve conflicts by understanding both intents, then run the tests before continuing.` },
    { title: 'Pull requests and code review', keywords: ['pull request', 'code review', 'collaboration'], body: `A good pull request is small, has one purpose, explains why, and includes evidence (tests, screenshots). Reviewers check correctness, edge cases, security, and maintainability — not style that a formatter can enforce. Keep review latency low; large stale PRs rot.` },
    { title: 'Shell fundamentals', keywords: ['terminal', 'shell', 'bash', 'commands'], body: `Everything is a file or a process: permissions, redirection, and signals follow from that. \`cmd > out 2> err\` separates streams; \`|\` pipes stdout; \`&&\` and \`||\` branch on exit status. Quote variables, prefer \`set -euo pipefail\` in scripts, and never paste untrusted commands into a privileged shell.` },
    { title: 'SSH, keys and remote access', keywords: ['ssh', 'keys', 'remote'], body: `SSH authenticates with a key pair: the public key sits on the server, the private key never leaves your machine. Use a passphrase and an agent. Host keys identify servers; fingerprint verification prevents man-in-the-middle attacks. Config files make hosts and identities repeatable.` },
    { title: 'Package managers and lockfiles', keywords: ['npm', 'package manager', 'lockfile', 'dependencies'], body: `npm resolves versions, installs a tree, and writes package-lock.json. CI must use \`npm ci\`, which installs exactly the lockfile rather than updating it. Workspaces let one repository host multiple packages with shared dependencies. Pin your runtime version in engines and CI.` },
    { title: 'Semantic versioning and upgrades', keywords: ['semver', 'versioning', 'upgrade', 'dependency'], body: `MAJOR.MINOR.PATCH: breaking / backward-compatible feature / backward-compatible fix. Caret allows minor and patch; tilde allows patch only. Automated upgrade PRs are useful only with a test suite that can catch breakage. Read changelogs before major upgrades.` },
    { title: 'Supply-chain hygiene', keywords: ['security', 'audit', 'supply chain', 'vulnerability'], body: `Audit dependencies, remove unused ones, and prefer packages with active maintenance and few transitive dependencies. Lockfiles, provenance, and signed releases reduce risk. Be careful with postinstall scripts, which execute arbitrary code during install.` },
  ],
  worked: [
    { title: 'Recovering a lost commit after a bad reset', body: `A hard reset moved the branch, but the commits still exist in the object database. Run \`git reflog\` to find the previous tip, then \`git branch rescue <sha>\` or \`git reset --hard <sha>\`. This works because branches are just pointers; nothing was deleted until garbage collection.` },
    { title: 'Resolving a lockfile conflict', body: `Two branches changed dependencies. Do not hand-merge package-lock.json. Resolve package.json to the intended dependency set, delete the lockfile, run a clean install, and commit the regenerated lockfile. Then run the full test suite and inspect the diff for unexpected version jumps.` },
  ],
  exam: [
    { question: 'Why is rebasing a shared branch dangerous?', answer: 'It rewrites commit hashes, so everyone who based work on the old commits must recover and reapply; merge is safer for shared history.' },
    { question: 'What does npm ci guarantee that npm install does not?', answer: 'It installs exactly the lockfile resolution without modifying it, giving reproducible CI builds.' },
    { question: 'What is a detached HEAD?', answer: 'HEAD points directly at a commit instead of a branch; new commits are not attached to any branch unless you create one.' },
  ],
  cheat: [
    'Branch = pointer to a commit. Commit = snapshot + parent + metadata.',
    'Merge preserves history; rebase rewrites it. Never rebase shared branches.',
    'PRs: small, one purpose, explain why, include evidence. Review correctness and security.',
    'Shell: stdout/stderr separate; pipes compose; exit codes drive && and ||.',
    'SSH: public key on server, private key local, verify host fingerprints.',
    'npm ci for reproducible installs; lockfile is the source of truth; audit dependencies.',
  ],
};

MODULE_KNOWLEDGE['Web Foundations'] = {
  overview: `The web is a request-response system built on open standards. A browser resolves a name, opens a connection, asks for a resource, parses it, fetches what it depends on, and paints pixels. Understanding that pipeline explains performance, accessibility, caching, and most production bugs.

This module covers the lifecycle end to end: how the web works, semantic HTML, CSS layout, CSS architecture and motion, forms, SEO, DevTools, performance, HTTP caching, security headers, and responsive media.` ,
  foundations: [
    `A URL names a resource: scheme, host, port, path, query, and fragment. DNS maps the host to an IP; TCP (or QUIC) opens a connection; TLS authenticates and encrypts; HTTP sends a method, headers, and optionally a body. The server responds with a status, headers, and a representation. The browser then parses HTML into the DOM, CSS into the CSSOM, and combines them into a render tree.` ,
    `HTML is the document's meaning; CSS is its presentation; JavaScript is its behavior. Browsers are forgiving, which is convenient for authors and dangerous for correctness: invalid markup still renders, but may produce an accessibility tree that differs from what you intended. Semantics are the contract with assistive technology and search engines.` ,
    `Performance is a budget, not a checklist. The critical rendering path includes HTML, render-blocking CSS, and the resources needed for the first screen. Layout shifts come from media without dimensions; slow interactions come from long JavaScript tasks. Measure field data first, then optimize the largest contributor.` ,
  ],
  concepts: [
    { title: 'DNS, TCP, TLS and HTTP', keywords: ['how the web works', 'dns', 'http', 'tls'], body: `DNS resolves names through a hierarchy of caches. TCP provides a reliable stream; QUIC provides reliability over UDP with less handshake latency. TLS negotiates keys and verifies the certificate chain. HTTP/1.1 serializes requests per connection; HTTP/2 multiplexes streams; HTTP/3 runs over QUIC.` },
    { title: 'Semantic HTML and landmarks', keywords: ['html', 'semantics', 'accessibility', 'landmarks'], body: `Use header, nav, main, section, article, aside, and footer for structure; headings for hierarchy; button for actions; a for navigation; label for every input. Landmarks let screen-reader users jump between regions. One main per page, and do not skip heading levels.` },
    { title: 'ARIA and keyboard accessibility', keywords: ['aria', 'keyboard', 'accessibility'], body: `The first rule of ARIA is not to use it when native HTML already provides the semantics. When you must, the accessible name, role, state, and keyboard interaction must all be correct. Every interactive element needs a visible focus style and must work without a mouse.` },
    { title: 'The cascade, specificity and inheritance', keywords: ['css', 'cascade', 'specificity', 'layout'], body: `Styles resolve by origin and importance, then specificity, then source order. Inline styles beat selectors; !important flips the cascade. Inheritance applies to some properties (color, font) and not others (margin, border). Prefer low-specificity, single-class selectors and layers to keep overrides predictable.` },
    { title: 'Flexbox, Grid and responsive layout', keywords: ['flexbox', 'grid', 'responsive', 'breakpoints'], body: `Flexbox distributes items along one axis; Grid defines rows and columns in two dimensions. Use minmax, auto-fit, and clamp for layouts that respond without breakpoints. Breakpoints are repairs for when the content breaks, not device targets. Container queries let a component respond to its own width.` },
    { title: 'Design tokens and maintainable CSS', keywords: ['css architecture', 'tokens', 'motion', 'theming'], body: `Tokens name decisions (color, spacing, radius, type) and expose them as CSS custom properties. Components consume semantic tokens, not raw values, which makes theming and dark mode a variable swap. Animate transform and opacity for compositor-friendly motion; respect prefers-reduced-motion.` },
    { title: 'Forms and validation states', keywords: ['forms', 'validation', 'ux states', 'errors'], body: `Use a form element, labels, correct input types, and autocomplete. Native validation handles required and format checks; add inline messages only where they help. Every field needs default, focus, filled, error, disabled, and loading states. Never rely on color alone to communicate an error.` },
    { title: 'SEO, metadata and structured data', keywords: ['seo', 'metadata', 'open graph', 'structured data'], body: `Crawlability requires links and server-rendered content; indexability requires canonical URLs and no accidental noindex. Titles and descriptions should describe the page honestly. Open Graph controls sharing previews. JSON-LD describes entities for rich results; it does not replace visible content.` },
    { title: 'DevTools and performance measurement', keywords: ['devtools', 'performance', 'lighthouse', 'debugging'], body: `Elements inspects the live DOM and computed styles; Network shows waterfall, headers, and payloads; Performance records main-thread tasks; Lighthouse audits lab performance and accessibility. Field data (CrUX/RUM) reflects real users; lab data is for debugging. Always measure before optimizing.` },
    { title: 'HTTP caching and conditional requests', keywords: ['caching', 'etag', 'cache-control', 'cdn'], body: `Cache-Control sets freshness and revalidation; ETag and Last-Modified enable 304 responses. immutable is for hashed assets; no-store is for sensitive responses. CDNs cache at the edge but respect origin headers. Stale-while-revalidate hides revalidation latency.` },
    { title: 'Security headers and CSP', keywords: ['security', 'csp', 'headers', 'xss'], body: `CSP restricts sources for scripts, styles, and connections; nonces or hashes allow specific inline scripts. HSTS forces HTTPS. X-Content-Type-Options stops MIME sniffing; Referrer-Policy limits leakage; frame-ancestors prevents clickjacking. Start in report-only mode and tighten after observing violations.` },
    { title: 'Responsive images and media', keywords: ['images', 'srcset', 'responsive', 'media'], body: `srcset and sizes let the browser choose an appropriate resolution; picture enables art direction and modern formats. Always set width and height or aspect-ratio to reserve space. Lazy-load below-the-fold images, but never the LCP image. Compress and serve AVIF/WebP through a pipeline.` },
  ],
  worked: [
    { title: 'Why a page has a 1.2 s render delay', body: `The HTML references a synchronous script in the head. The browser must download and execute it before parsing the body, so nothing below it renders. Move it to type="module" with defer, or inline only the critical bootstrapping. Then measure again: the render delay should drop to network latency plus CSS.` },
    { title: 'Fixing layout shift on a hero image', body: `The image has no dimensions, so the browser reserves zero height until it loads, then pushes the text down (CLS). Add width and height attributes or an aspect-ratio box with a matching fallback color. The shift disappears because space is reserved before the bytes arrive.` },
  ],
  exam: [
    { question: 'Why does semantic HTML matter if the page looks the same?', answer: 'It provides structure and behavior to assistive technology, search engines, and browser features; a div with a click handler is not a button.' },
    { question: 'What is the difference between 304 and 200?', answer: '304 Not Modified tells the client to reuse its cached copy; 200 returns a fresh representation.' },
    { question: 'When should a script be deferred?', answer: 'When it does not need to run before the document is parsed; defer downloads in parallel and executes after parsing, without blocking render.' },
  ],
  cheat: [
    'URL → DNS → TCP/QUIC → TLS → HTTP → parse → render → paint.',
    'Native HTML first; ARIA only to fill genuine gaps. Keyboard and focus are part of the UI.',
    'Cascade: origin/importance → specificity → order. Prefer layers and single-class selectors.',
    'Flexbox one axis; Grid two axes; minmax/auto-fit/clamp reduce breakpoints.',
    'Reserve media space (width/height or aspect-ratio) to prevent CLS.',
    'Cache-Control + ETag; hashed assets immutable; CDN respects origin headers.',
  ],
};

MODULE_KNOWLEDGE['JavaScript and TypeScript'] = {
  overview: `JavaScript is the language of the browser and increasingly of the server. Its flexibility comes from a small set of powerful ideas — functions as values, prototypal inheritance, closures, and an event loop — and its footguns come from the same places.

This module builds a precise mental model: how scope and closures work, how async scheduling actually behaves, how the DOM and browser APIs fit together, how modules and bundlers shape a build, how TypeScript makes large programs tractable, and how to test, structure, and profile real applications.` ,
  foundations: [
    `JavaScript is dynamically typed and garbage-collected. Values are primitives (undefined, null, boolean, number, bigint, string, symbol) or objects. Variables declared with let/const are block-scoped; var is function-scoped and hoisted. Functions are objects, so they can be passed, returned, and given properties.` ,
    `Execution happens on a call stack. Asynchronous work is scheduled through the event loop: promise callbacks run as microtasks after the current task, while timers and I/O run as macrotasks. This ordering explains why a resolved promise runs before setTimeout(0), and why a long synchronous task blocks every callback and paint.` ,
    `TypeScript adds a static type layer that is erased at runtime. Types describe the shape of values and narrow through control flow. Generics preserve relationships between inputs and outputs. The compiler checks, but it does not validate untrusted runtime data — schema validation is still required at boundaries.` ,
  ],
  concepts: [
    { title: 'Scope, closures and hoisting', keywords: ['javascript', 'scope', 'closures', 'hoisting'], body: `A closure is a function plus the lexical environment where it was created. It keeps referenced variables alive after the outer function returns — the basis of modules, memoization, and the classic loop-variable bug. let creates a fresh binding per iteration; var shares one.` },
    { title: 'Objects, prototypes and this', keywords: ['objects', 'prototypes', 'this', 'inheritance'], body: `Property access walks the prototype chain. Classes are syntax over prototypes. \`this\` depends on the call site, not the definition: method calls bind the receiver, plain calls are undefined in strict mode, and arrow functions capture the enclosing this.` },
    { title: 'The event loop and async scheduling', keywords: ['async', 'event loop', 'promises', 'await'], body: `A task runs to completion; microtasks (promise continuations) drain before the next task and before rendering. await suspends the function, not the thread. CPU-bound work must move to a worker or be chunked, or it freezes the UI and delays every pending callback.` },
    { title: 'Promises, cancellation and retries', keywords: ['promises', 'cancellation', 'retries', 'concurrency'], body: `A promise represents a future value and settles once. AbortController propagates cancellation to fetch and other APIs. Retries need jitter, a cap, and idempotency; blindly retrying a non-idempotent write duplicates side effects. Promise.all fails fast; allSettled reports every outcome.` },
    { title: 'DOM, events and browser APIs', keywords: ['dom', 'events', 'browser apis', 'storage'], body: `The DOM is a live tree; reading layout properties forces reflow, so batch reads and writes. Events bubble and can be delegated at a container. localStorage is synchronous and string-only; IndexedDB is async and structured. Web Workers run JavaScript off the main thread; they communicate by messages.` },
    { title: 'Modules, bundlers and code splitting', keywords: ['modules', 'bundlers', 'vite', 'code splitting'], body: `ES modules are static and tree-shakeable; CommonJS is dynamic and harder to analyze. Vite serves native ESM in development and bundles with Rollup for production. Dynamic import creates a split point so a route or heavy feature loads on demand.` },
    { title: 'TypeScript: types, generics and narrowing', keywords: ['typescript', 'types', 'generics', 'narrowing'], body: `Type annotations are checked and erased. Unions plus control-flow narrowing model optional states safely. Generics express relationships: \`function first<T>(xs: T[]): T | undefined\`. Utility types (Partial, Pick, Omit, Record, ReturnType) derive types instead of duplicating them.` },
    { title: 'Runtime validation at boundaries', keywords: ['validation', 'zod', 'schema', 'typescript'], body: `A TypeScript type is a compile-time claim; JSON from an API is unknown until validated. Parse at the boundary with a schema (Zod, Valibot, io-ts), then use the inferred type internally. Never cast untrusted data to a domain type.` },
    { title: 'Testing strategy', keywords: ['testing', 'unit', 'integration', 'e2e'], body: `Test behavior, not implementation. Unit tests cover pure logic and edge cases; integration tests cover contracts between modules; end-to-end tests cover critical user journeys. A few reliable E2E tests beat hundreds of brittle ones. Mocks should isolate slow or nondeterministic dependencies, not hide the code under test.` },
    { title: 'Functional patterns', keywords: ['functional', 'immutability', 'map', 'reduce'], body: `Pure functions make code predictable and testable. map/filter/reduce express transformations without index bookkeeping. Immutability makes change detection and undo simple, at a copying cost. Composition of small functions is easier to reason about than deep inheritance.` },
    { title: 'Memory and garbage collection', keywords: ['memory', 'garbage collection', 'leaks', 'performance'], body: `Reachability determines collection. Leaks usually come from retained references: forgotten timers, listeners, caches, and closures over large objects. WeakMap and WeakRef allow collection when the key is otherwise unreachable. Profile with heap snapshots and compare retained sizes.` },
  ],
  worked: [
    { title: 'Why the loop prints the same number', body: `With var, all closures share one function-scoped i, so by the time the timers run, i is 3: 3,3,3. With let, each iteration gets a fresh binding, so the closures capture 0,1,2. The fix is the declaration, not the timeout.` },
    { title: 'Ordering of a promise and a timer', body: `\`console.log('A'); setTimeout(() => console.log('D'), 0); Promise.resolve().then(() => console.log('C')); console.log('B');\` prints A, B, C, D. Synchronous code runs first, then microtasks, then the timer macrotask.` },
  ],
  exam: [
    { question: 'What is a closure?', answer: 'A function together with the lexical environment it captured, allowing it to access variables after the outer scope returns.' },
    { question: 'Why can await not block other requests?', answer: 'await suspends the async function and returns control to the event loop; other tasks and continuations can run while the promise is pending.' },
    { question: 'Why validate data even with TypeScript?', answer: 'Types are erased at runtime; external data can violate them, so a runtime schema check is required at the boundary.' },
  ],
  cheat: [
    'let/const block-scoped; var function-scoped. Closures capture bindings, not values.',
    'Microtasks (promises) before macrotasks (timers); long sync tasks block everything.',
    'this = call site; arrow functions capture lexical this.',
    'AbortController cancels fetch; retries need jitter + idempotency.',
    'ESM tree-shakes; dynamic import splits; Vite dev = native ESM.',
    'TypeScript erases; validate unknown data with a runtime schema.',
  ],
  code: {
    title: 'A typed fetch with cancellation', language: 'typescript',
    code: `type User = { id: string; name: string };

async function getUser(id: string, signal?: AbortSignal): Promise<User> {
  const res = await fetch(\`/api/users/\${id}\`, { signal });
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  const data: unknown = await res.json();
  if (!isUser(data)) throw new Error('Invalid user payload');
  return data;
}

function isUser(v: unknown): v is User {
  return typeof v === 'object' && v !== null
    && typeof (v as User).id === 'string'
    && typeof (v as User).name === 'string';
}`,
    explanation: 'The unknown type forces a runtime check before the value enters the typed domain. The signal lets the caller cancel the request when a component unmounts.',
  },
};

MODULE_KNOWLEDGE['Design for Engineers'] = {
  overview: `Design is decision-making under constraints: what to emphasize, what to group, what to hide, and how it should feel. Engineers who understand the underlying rules build interfaces that look intentional rather than accidental.

This module covers hierarchy, spacing, typography, color, design tokens, Figma-to-code translation, and interaction design. The goal is not to become a visual designer; it is to make defensible visual decisions and implement them faithfully.` ,
  foundations: [
    `Visual hierarchy tells the eye where to go first, second, and third. Size, weight, contrast, color, and whitespace create it. If everything is emphasized, nothing is. A screen should have one primary action and a clear reading order even in grayscale.` ,
    `Spacing is the fastest way to make an interface feel professional. Use a small scale (4 or 8 px base) and apply it consistently. Proximity communicates grouping: related things sit closer together than unrelated things. Alignment creates an invisible grid the eye can trust.` ,
    `Typography and color carry most of the personality and most of the accessibility risk. Body text needs comfortable size and line height; contrast must meet WCAG; color should never be the only signal. A limited palette with semantic roles beats a large palette of one-off values.` ,
  ],
  concepts: [
    { title: 'Hierarchy and reading order', keywords: ['hierarchy', 'layout', 'visual'], body: `Establish one focal point per view, then secondary and tertiary levels. Use scale contrast (at least 1.25× between levels), weight, and space. Test by squinting: the intended order should survive blur.` },
    { title: 'Spacing, alignment and grouping', keywords: ['spacing', 'alignment', 'grouping'], body: `Use a 4/8 px scale: 4, 8, 12, 16, 24, 32, 48, 64. Space within a group must be smaller than space between groups. Align edges rather than centers when scanning matters. Avoid arbitrary pixel values; they accumulate into visual noise.` },
    { title: 'Type scales and readability', keywords: ['typography', 'type scale', 'readability'], body: `Choose a modular scale (1.125, 1.25, or 1.333) and stick to it. Body text at 16–18 px with line height 1.5–1.7; headings tighter (1.1–1.3). Limit line length to 45–75 characters. Use weight and color for hierarchy before adding more sizes.` },
    { title: 'Color systems and contrast', keywords: ['color', 'contrast', 'dark mode', 'palette'], body: `Build a role-based palette: background, surface, border, text, muted text, primary, success, warning, danger. Check contrast (4.5:1 for body, 3:1 for large text and UI). Dark mode is not an inversion; surfaces elevate with lightness, and saturated colors need desaturation.` },
    { title: 'Design tokens and theming', keywords: ['design tokens', 'theming', 'css variables'], body: `Separate primitive tokens (blue-500) from semantic tokens (color-action). Components consume semantic tokens, so a theme change is a mapping change. Export tokens from one source of truth into CSS, Tailwind, and native platforms.` },
    { title: 'Figma to code', keywords: ['figma', 'handoff', 'specs'], body: `Read the design as constraints: auto-layout direction, gaps, padding, min/max widths, and component variants. Ask what should happen at narrow widths and with long text. Implement with layout primitives rather than absolute positioning; verify against the design at real content extremes.` },
    { title: 'Interaction and motion', keywords: ['interaction', 'motion', 'animation', 'gestures'], body: `Motion should explain a change, not decorate it: where something came from, what it became, or that work is in progress. Keep durations short (150–300 ms), use springs for direct manipulation, and respect prefers-reduced-motion. Never animate layout properties when transform/opacity will do.` },
    { title: 'States, feedback and empty screens', keywords: ['states', 'feedback', 'empty', 'loading'], body: `Every screen needs default, loading, empty, error, and success states. Skeletons preserve layout; spinners do not. Empty states should explain what goes here and offer the next action. Feedback must be immediate, specific, and reversible where possible.` },
  ],
  worked: [
    { title: 'Fixing a cramped settings row', body: `The label and value touch, and the toggle feels unrelated. Increase the horizontal gap between label and control, reduce the vertical gap between label and helper text, and add a divider between rows. Grouping changes without changing any content: proximity now communicates which text belongs to which control.` },
    { title: 'Building a dark theme that still reads', body: `Do not invert. Set background at a dark neutral, surfaces slightly lighter, text at high but not pure-white contrast, and keep semantic colors recognizable. Re-check contrast and test charts and disabled states, which often fail first.` },
  ],
  exam: [
    { question: 'Why is a spacing scale better than arbitrary values?', answer: 'It creates consistent rhythm and grouping, speeds decisions, and prevents the visual noise of many near-identical gaps.' },
    { question: 'What contrast ratio should body text meet?', answer: 'At least 4.5:1 for normal text; 3:1 for large text and essential UI boundaries.' },
    { question: 'When does animation hurt?', answer: 'When it delays the task, distracts, ignores reduced-motion preferences, or animates layout instead of transform/opacity.' },
  ],
  cheat: [
    'One focal point per view; hierarchy through size, weight, contrast, space.',
    '4/8 px spacing scale; within-group < between-group; align edges.',
    'Type scale 1.125–1.333; body 16–18 px; line height 1.5–1.7; 45–75 chars.',
    'Role-based color tokens; 4.5:1 body contrast; dark mode = elevated surfaces, not inversion.',
    'Semantic tokens over primitives; one source of truth.',
    'Design all states: default, loading, empty, error, success.',
  ],
};

MODULE_KNOWLEDGE['React Ecosystem'] = {
  overview: `React is a library for describing UI as a function of state. Its model is small — components, props, state, and rendering — but its ecosystem is large, and most production bugs come from misunderstanding when React re-renders, where state should live, and how server and client responsibilities divide.

This module covers fundamentals, architecture, forms, Next.js, data libraries, UI systems, advanced patterns, and performance.` ,
  foundations: [
    `A component is a function that returns elements. React calls it during render and compares the returned tree with the previous one (reconciliation). State changes schedule a re-render; props changes in a parent re-render the child unless memoization intervenes. Rendering must be pure: no side effects in the component body.` ,
    `State is a snapshot per render. Setting state schedules the next render with the new value; reading it immediately after returns the old value. Effects run after paint and synchronize with external systems. Derived values should be computed during render, not stored in redundant state.` ,
    `Server state is not client state. Caching, refetching, invalidation, and optimistic updates belong to a data library, while local UI state belongs to the component. Mixing them produces duplicated truth and stale screens.` ,
  ],
  concepts: [
    { title: 'Components, props and state', keywords: ['react', 'fundamentals', 'props', 'state'], body: `Props flow down; events flow up. State is owned by the closest common ancestor that needs it. Lifting state too high causes broad re-renders; keeping it too low duplicates truth. Use keys to preserve identity across list updates.` },
    { title: 'Effects and refs', keywords: ['effects', 'useeffect', 'refs'], body: `Effects synchronize with external systems: subscriptions, DOM APIs, network requests. The dependency array must list every reactive value used. Cleanup runs before the next effect and on unmount. Refs hold mutable values that do not trigger renders.` },
    { title: 'Composition and custom hooks', keywords: ['composition', 'hooks', 'architecture'], body: `Prefer composition over inheritance. A custom hook extracts reusable stateful logic but does not share state by itself. Return narrow APIs; avoid a god-hook that couples unrelated concerns. Context is for low-frequency, widely needed values, not a general store.` },
    { title: 'Forms and validation', keywords: ['forms', 'validation', 'react hook form', 'zod'], body: `Controlled inputs store value in state; uncontrolled inputs use refs and are often faster for large forms. Schema validation at submit and on blur gives consistent messages. Show errors next to fields, move focus to the first error, and never clear user input on failure.` },
    { title: 'Next.js App Router', keywords: ['nextjs', 'server components', 'routing', 'server actions'], body: `Layouts persist across navigation; server components render on the server and send serialized UI; client components opt into interactivity. Server actions handle mutations with progressive enhancement. Caching is explicit and route-segment based — understand revalidatePath and revalidateTag before relying on freshness.` },
    { title: 'Server state and caching', keywords: ['tanstack query', 'state', 'cache', 'optimistic'], body: `A query cache keys data by parameters, deduplicates requests, and manages stale/fresh states. Mutations invalidate related keys or update the cache optimistically with rollback. Do not copy server data into client state unless you also own its invalidation.` },
    { title: 'UI systems and headless components', keywords: ['ui system', 'tailwind', 'radix', 'shadcn'], body: `Headless primitives provide behavior and accessibility; your design system provides appearance. Tailwind speeds composition but needs tokens and restraint. shadcn/ui copies components into your repo, which gives control and responsibility for upgrades and accessibility.` },
    { title: 'Advanced patterns', keywords: ['compound components', 'render props', 'portals', 'polymorphic'], body: `Compound components share implicit state through context (Tabs, Tabs.List, Tabs.Panel). Render props pass behavior to a caller-supplied renderer. Portals escape overflow and stacking contexts for dialogs and toasts. Polymorphic as props need careful TypeScript.` },
    { title: 'Performance', keywords: ['performance', 'memoization', 'virtualization', 'suspense'], body: `Measure first with the Profiler. memo prevents re-renders when props are referentially stable; useMemo/useCallback are for expensive work or stable identities, not decoration. Virtualize long lists. Split routes and heavy components. Suspense coordinates loading without waterfalls.` },
  ],
  worked: [
    { title: 'Why a child re-renders when nothing changed', body: `The parent re-renders and creates a new object or function prop each time, so the child's props are referentially different. Wrap the child in memo and stabilize the prop with useCallback/useMemo, or move the state down so the parent does not re-render. Measure before optimizing.` },
    { title: 'Fixing a stale closure in an interval', body: `An effect creates an interval that closes over the initial count. Either include count in the dependency array and recreate the interval, or use a ref that always holds the latest value, or use the functional state updater. The correct choice depends on whether the interval should reset on each change.` },
  ],
  exam: [
    { question: 'Why does setting state not update the variable immediately?', answer: 'State is a snapshot per render; the setter schedules the next render, where the new value is available.' },
    { question: 'When should state be lifted?', answer: 'When two siblings need the same data or must stay in sync; otherwise keep it local to avoid broad re-renders.' },
    { question: 'What is the difference between server state and client state?', answer: 'Server state is remote, shared, and cacheable with invalidation; client state is local UI truth such as open panels and drafts.' },
  ],
  cheat: [
    'Render must be pure. State is a snapshot; setters schedule the next render.',
    'Effects synchronize with external systems; list all reactive dependencies; clean up.',
    'Lift state only to the closest common ancestor; derive instead of duplicating.',
    'Server state → query cache; client state → local/context; do not mix.',
    'Next.js: server components by default, client components at interactive leaves.',
    'Measure before memoizing; stabilize props; virtualize long lists.',
  ],
};

MODULE_KNOWLEDGE['Backend with Node.js'] = {
  overview: `A backend is a trust boundary. It authenticates callers, validates input, enforces authorization, performs one well-defined operation, and returns an intentional response. Node.js makes the I/O-heavy version of this cheap, but it also makes it easy to block the event loop or leak errors.

This module covers the runtime, API frameworks, REST and GraphQL, authentication and authorization, OAuth/OIDC, realtime jobs, webhooks, uploads, API security, and caching.` ,
  foundations: [
    `Node runs JavaScript on one main thread with an event loop. I/O is delegated to the operating system or a thread pool; continuations are queued when work completes. This is excellent for many concurrent I/O-bound requests and terrible for CPU-bound work on the main thread, which must move to a worker or a separate service.` ,
    `An HTTP API is a contract. The method, path, headers, body schema, status codes, and error shape are all part of it. Versioning, idempotency, pagination, and rate limits are design decisions, not afterthoughts. Clients retry, so every mutating endpoint must tolerate duplicates.` ,
    `Security is layered: authenticate identity, authorize the specific action on the specific resource, validate input, encode output, limit rate, and log without leaking secrets. No single control is sufficient; the goal is to make each class of mistake non-catastrophic.` ,
  ],
  concepts: [
    { title: 'Node runtime and the event loop', keywords: ['node.js runtime', 'event loop', 'streams', 'workers'], body: `The event loop phases process timers, I/O callbacks, polling, and close events; microtasks drain between phases. Streams process data in chunks with backpressure. Worker threads run CPU-heavy JavaScript without blocking the main loop. Graceful shutdown stops accepting connections and drains in-flight work.` },
    { title: 'Express, Fastify and middleware', keywords: ['express', 'fastify', 'middleware', 'routing'], body: `Middleware composes request handling: parse, authenticate, validate, authorize, then the route handler. Error middleware must be last and must not leak stack traces. Fastify's schema-based validation and serialization reduce boilerplate and improve throughput.` },
    { title: 'REST resource design', keywords: ['rest', 'api design', 'pagination', 'versioning'], body: `Model resources, not actions: /orders/:id/items. Use nouns and HTTP methods consistently. Paginate with cursors for stable large sets; document filters and sorting. Return 201 with Location on create, 204 on delete, 409 on conflict, 422 on validation failure, and 429 with Retry-After on rate limits.` },
    { title: 'GraphQL schemas and resolvers', keywords: ['graphql', 'schema', 'resolver', 'federation'], body: `GraphQL lets clients request exactly the fields they need. The schema is the contract; resolvers fetch data per field, which risks N+1 queries without a batching layer (DataLoader). Depth and complexity limits prevent abusive queries. Federation splits a graph across services.` },
    { title: 'Sessions, JWT and cookies', keywords: ['authentication', 'jwt', 'sessions', 'cookies'], body: `Server sessions store state and send an opaque cookie; JWTs carry signed claims but cannot be revoked without a denylist. Use HttpOnly, Secure, SameSite cookies for browser sessions. Never store secrets in localStorage. Rotate signing keys and validate issuer, audience, and expiry.` },
    { title: 'OAuth 2.0 and OIDC', keywords: ['oauth', 'openid', 'pkce', 'authorization code'], body: `Authorization Code + PKCE is the default for web and native apps. The client redirects to the provider, receives a short-lived code, and exchanges it with the verifier. OIDC adds an ID token describing the user. Validate state to prevent CSRF, and never put access tokens in URLs.` },
    { title: 'Realtime: WebSockets and SSE', keywords: ['websockets', 'sse', 'realtime', 'jobs'], body: `WebSockets are bidirectional and stateful; SSE is server-to-client over HTTP and reconnects automatically. Both need authentication, heartbeats, backpressure, and horizontal scaling (sticky sessions or a pub/sub fan-out). Background jobs belong in a queue with retries and idempotency.` },
    { title: 'Webhooks and event delivery', keywords: ['webhooks', 'signature', 'retries', 'idempotency'], body: `Sign the raw payload with a shared secret and verify with a constant-time comparison. Include a timestamp to prevent replay. Retry with exponential backoff and jitter; consumers must deduplicate by event ID. Offer a dead-letter queue and a replay endpoint.` },
    { title: 'Uploads and object storage', keywords: ['uploads', 's3', 'streams', 'signed url'], body: `Avoid proxying large files through the API. Issue a short-lived signed URL so the client uploads directly to object storage, then confirm metadata server-side. Validate content type and size, scan if needed, and generate derivatives asynchronously. Multipart upload supports resumability.` },
    { title: 'API security and input validation', keywords: ['api security', 'validation', 'rate limit', 'ssrf'], body: `Validate schemas and reject unknown fields; parameterize queries; encode output by context. Rate-limit by identity and IP. Guard SSRF by allow-listing outbound hosts and blocking private ranges. Set CORS deliberately, not with a wildcard plus credentials.` },
    { title: 'Caching layers', keywords: ['caching', 'redis', 'etag', 'cdn'], body: `Cache at the client, CDN, application, and database layers. Cache-aside is simple but needs invalidation on writes. Use ETags for conditional GETs and Cache-Control for shared responses. Avoid caching authenticated or personalized data at shared edges.` },
  ],
  worked: [
    { title: 'Making a payment endpoint retry-safe', body: `The client sends an Idempotency-Key header. The server stores the key with the resulting payment ID in a unique index before charging. On retry, it returns the stored result instead of charging again. If the first request is still in flight, return 409 or wait. This turns an at-least-once client into an exactly-once effect.` },
    { title: 'Diagnosing a Node API that stalls under load', body: `CPU is pegged on one core and latency rises while throughput stays flat. The cause is CPU-bound work on the event loop, such as synchronous hashing or JSON processing of large payloads. Move it to a worker thread or a queue, reduce payload size, and add a load test to confirm the loop is free.` },
  ],
  exam: [
    { question: 'Why does a CPU-heavy route block other requests?', answer: 'JavaScript runs on one main thread; a long synchronous task prevents the event loop from processing other callbacks and I/O completions.' },
    { question: 'Why use Authorization Code + PKCE instead of implicit flow?', answer: 'It avoids exposing tokens in the URL/fragment and protects the code exchange with a per-request verifier.' },
    { question: 'What makes a webhook consumer idempotent?', answer: 'Deduplicating by a stable event ID and storing the processed result so a replay does not repeat the side effect.' },
  ],
  cheat: [
    'Event loop: microtasks before macrotasks; CPU work → worker/queue; graceful shutdown.',
    'Middleware order: parse → authenticate → validate → authorize → handler → error handler.',
    'REST: resources, correct methods/status, cursor pagination, idempotency for writes.',
    'Sessions = opaque cookie + server state; JWT = signed claims, revocation is harder.',
    'OAuth: Authorization Code + PKCE; validate state; never token in URL.',
    'Webhooks: sign raw body, timestamp, dedupe by event ID, backoff + DLQ.',
  ],
};

MODULE_KNOWLEDGE['Data and Persistence'] = {
  overview: `Persistence is where correctness survives restarts. Choosing a data store is choosing a consistency model, a query shape, and an operational burden. The hard parts are rarely the first insert; they are concurrency, migrations, and knowing when a query will stop scaling.

This module covers SQL and PostgreSQL, document databases, ORMs, Redis, search and vectors, transactions and isolation, and zero-downtime migrations.` ,
  foundations: [
    `A relational database stores tuples in relations and enforces constraints: primary keys, foreign keys, uniqueness, and check conditions. SQL is declarative; the planner chooses joins and indexes. Correctness comes from transactions, which group operations into an atomic, isolated unit.` ,
    `Indexes trade write cost and storage for read speed. A B-tree supports equality and ranges in O(log n); a hash index supports equality only. Composite index column order matters: the leftmost prefix rule decides which queries can use it.` ,
    `NoSQL is not a single model. Document stores favor aggregate reads and flexible schemas; key-value stores favor simple lookups; search engines favor inverted indexes; vector databases favor similarity. Choose by access pattern, consistency requirement, and operational maturity — not by aversion to schemas.` ,
  ],
  concepts: [
    { title: 'Relational modeling and constraints', keywords: ['sql', 'postgresql', 'modeling', 'constraints'], body: `Normalize to remove redundancy, then denormalize deliberately for read patterns. Enforce invariants in the database: NOT NULL, UNIQUE, FOREIGN KEY, CHECK. Application validation is for UX; database constraints are the last line of defense against concurrent writers.` },
    { title: 'Joins, indexes and query plans', keywords: ['joins', 'indexes', 'query plan', 'performance'], body: `Read EXPLAIN ANALYZE: look for sequential scans on large tables, nested loops over many rows, and sort spills. Index the columns used in filters, joins, and orderings. Composite indexes follow leftmost-prefix. Too many indexes slow writes and bloat storage.` },
    { title: 'Transactions and isolation levels', keywords: ['transactions', 'isolation', 'acid', 'deadlock'], body: `Read Committed sees only committed rows per statement; Repeatable Read fixes the snapshot per transaction; Serializable detects conflicts and may abort. Longer transactions hold locks and increase contention. Keep them short and retry serialization failures with backoff.` },
    { title: 'Document modeling and indexes', keywords: ['mongodb', 'document', 'aggregation', 'indexing'], body: `Model documents around how they are read together, but avoid unbounded arrays. Embed small, bounded subdocuments; reference large or independently updated entities. Index query and sort fields; use aggregation pipelines for grouping and shaping.` },
    { title: 'ORMs, query builders and N+1', keywords: ['orm', 'prisma', 'drizzle', 'n+1'], body: `ORMs speed CRUD but hide query count. Eager-load relations or batch with a join/DataLoader; detect N+1 in logs and tests. Migrations must be versioned and reviewed. Prefer the query builder for complex reporting where the ORM's generated SQL is opaque.` },
    { title: 'Redis and cache patterns', keywords: ['redis', 'cache', 'invalidation', 'rate limit'], body: `Cache-aside reads the cache, falls back to the database, and populates with a TTL. Write-through updates both; write-behind queues writes. Invalidate on mutation, version keys, and add jitter to TTLs to avoid synchronized expiry. Redis is also used for rate limits, sessions, and locks — each with different failure semantics.` },
    { title: 'Search and vector retrieval', keywords: ['search', 'vector database', 'qdrant', 'pgvector'], body: `Full-text search uses inverted indexes, stemming, and ranking (BM25). Vector search compares embeddings with cosine similarity using HNSW/IVF indexes. Hybrid search combines lexical and semantic scores. Evaluate retrieval with recall@k and nDCG on a labelled set.` },
    { title: 'Zero-downtime migrations', keywords: ['migration', 'backfill', 'expand contract'], body: `Use expand-contract: add the new column/table, dual-write or backfill, switch reads, then remove the old one. Never drop or rename in the same deploy that changes code. Backfill in batches, make migrations idempotent, and keep a rollback path.` },
  ],
  worked: [
    { title: 'Diagnosing a slow orders query', body: `EXPLAIN ANALYZE shows a sequential scan over 5 million orders and a sort spill. Add a composite index on (customer_id, created_at DESC), which matches the filter and ordering. The plan becomes an index range scan, rows examined drop from millions to dozens, and the sort disappears.` },
    { title: 'Adding a non-null column without downtime', body: `Deploy 1: add the column as nullable with a default; deploy 2: dual-write and backfill in batches; deploy 3: add the NOT NULL constraint after verifying no nulls; deploy 4: remove old code. Each step is reversible and safe under live traffic.` },
  ],
  exam: [
    { question: 'When does a composite index help a query?', answer: 'When the query filters or sorts on a leftmost prefix of the index columns; skipping the leading column usually prevents its use.' },
    { question: 'Why are long transactions dangerous?', answer: 'They hold locks and snapshots, increase contention and bloat, and delay vacuum; they also make retries more expensive.' },
    { question: 'What is the N+1 query problem?', answer: 'Fetching a list then issuing one query per item, turning one query into N+1 round trips; fix with joins, eager loading, or batching.' },
  ],
  cheat: [
    'Constraints in the database; validation in the app for UX. Both are needed.',
    'EXPLAIN ANALYZE before indexing. Leftmost-prefix rule for composite indexes.',
    'Keep transactions short; retry serialization failures with backoff.',
    'Documents: bounded arrays, embed what is read together, reference the rest.',
    'Cache-aside + TTL + invalidation on write; jitter prevents stampedes.',
    'Expand-contract migrations; never drop/rename in the same deploy.',
  ],
};

MODULE_KNOWLEDGE['Production Engineering'] = {
  overview: `Production is a different program from development: real traffic, partial failures, noisy neighbors, and users who notice every minute of downtime. Production engineering is the practice of making deployment boring and failure recoverable.

This module covers containers, cloud deployment, CI/CD, observability, security, scaling, Core Web Vitals, incident response, and cost.` ,
  foundations: [
    `A container packages an application with its user-space dependencies into an immutable image. The kernel shares the host; namespaces isolate processes, mounts, and networking; cgroups limit resources. Containers make environments reproducible, not inherently secure.` ,
    `Deployment is a sequence of states, not an event. Build once, test the artifact, promote it through environments, and keep the ability to roll back. Immutable artifacts plus versioned configuration make "what is running?" answerable.` ,
    `Reliability is measured from the user's perspective. Availability, latency, error rate, and correctness matter more than CPU graphs. SLOs set a target; error budgets decide whether to ship features or fix reliability. Alerts should fire on symptoms that affect users, not on every internal threshold.` ,
  ],
  concepts: [
    { title: 'Docker images and layers', keywords: ['docker', 'containers', 'layers', 'multi-stage'], body: `Each Dockerfile instruction creates a layer; unchanged layers are cached. Order instructions from least to most frequently changing. Multi-stage builds compile in a builder image and copy only the artifact into a slim runtime, reducing size and attack surface. Run as a non-root user.` },
    { title: 'Cloud deployment models', keywords: ['cloud', 'deployment', 'serverless', 'managed'], body: `VMs give control and operational burden; containers give portability; serverless gives scale-to-zero and cold starts; managed databases trade control for backups and failover. Choose by team capacity and traffic shape, not by trend. Keep secrets in a managed store, never in the image.` },
    { title: 'CI/CD and release safety', keywords: ['ci cd', 'github actions', 'release', 'rollback'], body: `CI runs lint, typecheck, tests, and build on every change. CD promotes a tested artifact through staging to production. Prefer small, frequent releases. Canary or blue-green reduces blast radius; feature flags decouple deploy from release. Every deploy needs a rollback plan.` },
    { title: 'Observability', keywords: ['observability', 'logs', 'metrics', 'traces'], body: `Logs explain individual events; metrics reveal trends; traces show a request across services. Use structured logs with request IDs and propagate context. Track the four golden signals: latency, traffic, errors, saturation. Sample high-volume traces deliberately.` },
    { title: 'Security and threat modeling', keywords: ['security', 'owasp', 'threat model', 'injection'], body: `Model assets, entry points, trust boundaries, and attackers. Validate input, parameterize queries, encode output, enforce least privilege, and rotate secrets. Dependencies are part of the attack surface. Assume a control will fail and design a second layer.` },
    { title: 'Scaling and bottleneck analysis', keywords: ['scaling', 'performance', 'cdn', 'queue'], body: `Find the bottleneck before adding capacity: CPU, memory, database connections, lock contention, or a downstream dependency. Scale stateless tiers horizontally; scale state with replicas, sharding, or caching. Queues absorb bursts but add latency and complexity.` },
    { title: 'Core Web Vitals and RUM', keywords: ['core web vitals', 'lcp', 'inp', 'cls', 'rum'], body: `LCP measures loading of the largest visible element; INP measures interaction responsiveness; CLS measures layout stability. Field data from real users is authoritative. Fix the largest contributor: server response, render-blocking resources, image size, long tasks, or unreserved space.` },
    { title: 'Incident response', keywords: ['incident', 'on-call', 'postmortem', 'runbook'], body: `Declare severity, assign an incident commander, communicate a status page, mitigate first, and investigate second. Runbooks make common failures routine. Blameless postmortems identify systemic causes and assign owners and deadlines; without follow-through, the same incident returns.` },
    { title: 'Cost awareness', keywords: ['cost', 'optimization', 'autoscaling', 'storage'], body: `Cost is an architectural metric. Right-size instances, scale to zero where possible, use storage tiers, cache aggressively, and set budget alerts. The cheapest request is one you never serve; the second cheapest is one served from cache.` },
  ],
  worked: [
    { title: 'A deploy that passes CI but fails in production', body: `The container runs as a different user and cannot write to a mounted directory. CI used a writable temp path. Fix by creating the directory with the correct ownership in the image and testing the runtime user in CI. The lesson: test the artifact and the runtime environment, not just the source tree.` },
    { title: 'Reducing LCP from 4.2 s to 1.8 s', body: `RUM shows the hero image is the LCP element. It is a 2.4 MB PNG served without dimensions. Convert to AVIF, serve responsive sizes, preload the selected source, and set fetchpriority="high". Reserve space with aspect-ratio. The result improves LCP and CLS together.` },
  ],
  exam: [
    { question: 'Why do multi-stage Docker builds improve security?', answer: 'They keep compilers and build dependencies out of the runtime image, reducing size and attack surface.' },
    { question: 'What is an error budget?', answer: 'The allowed amount of unreliability implied by an SLO; it guides the trade-off between shipping features and investing in reliability.' },
    { question: 'Why is field data preferred over Lighthouse for Core Web Vitals?', answer: 'Field data reflects real devices, networks, and user interactions; lab data is synthetic and may not represent users.' },
  ],
  cheat: [
    'Container = namespaces + cgroups + image. Multi-stage builds; run non-root.',
    'Build once, promote the artifact, keep rollback. Flags decouple deploy from release.',
    'Logs events, metrics trends, traces requests. Golden signals: latency, traffic, errors, saturation.',
    'Find the bottleneck before scaling; stateless tiers scale horizontally.',
    'LCP = loading, INP = responsiveness, CLS = stability; field data wins.',
    'Incident: mitigate first, communicate, then blameless postmortem with owners.',
  ],
};

MODULE_KNOWLEDGE['System Design'] = {
  overview: `System design is structured trade-off reasoning at scale. The interviewer is not looking for a perfect architecture; they are checking whether you can clarify requirements, estimate capacity, choose components with reasons, and identify failure modes.

This module covers the framework, load balancing, caching, SQL vs NoSQL, queues, and five classic designs: URL shortener, social feed, chat, notifications, and rate limiting.` ,
  foundations: [
    `Start with requirements: functional (what the system does), non-functional (latency, availability, consistency, scale), and out of scope. Estimate users, requests per second, storage, and bandwidth. These numbers determine whether one database or a sharded cluster is appropriate.` ,
    `Every distributed system chooses among consistency, availability, and partition tolerance, and among latency, throughput, and cost. Name the trade-off explicitly. A design that claims all properties is not a design; it is a slogan.` ,
    `Draw the request path end to end: client, edge, load balancer, service, cache, database, queue, workers. Then go deep on the stage with the highest risk. Identify bottlenecks, single points of failure, and what happens when each dependency degrades.` ,
  ],
  concepts: [
    { title: 'Requirements and capacity estimation', keywords: ['requirements', 'capacity', 'estimation'], body: `Clarify scale: daily active users, peak QPS, read/write ratio, payload size, retention. Compute storage per day and per year; compute cache size from hot-set assumptions. State latency targets and availability. Write assumptions on the board so the interviewer can correct them.` },
    { title: 'Load balancing and consistent hashing', keywords: ['load balancing', 'consistent hashing', 'cdn'], body: `L4 balances connections; L7 routes by path, header, or cookie. Health checks remove bad instances. Consistent hashing places keys on a ring so adding a node moves only a fraction of keys. CDNs terminate TLS and cache at the edge.` },
    { title: 'Caching at scale', keywords: ['cache', 'eviction', 'thundering herd', 'cdn'], body: `Layer caches: browser, CDN, service, database. Choose eviction (LRU/LFU/TTL) by access pattern. Protect against stampedes with request coalescing, locks, or stale-while-revalidate. Invalidate by versioned keys or explicit purge; never cache personalized data at a shared edge.` },
    { title: 'SQL vs NoSQL and sharding', keywords: ['sql', 'nosql', 'sharding', 'replication'], body: `Relational stores give joins, constraints, and transactions; NoSQL gives flexible schemas and horizontal scale for specific access patterns. Replication scales reads; sharding scales writes but complicates joins and transactions. Choose a shard key with high cardinality and even access.` },
    { title: 'Queues and streaming', keywords: ['queue', 'kafka', 'streaming', 'backpressure'], body: `Queues decouple producers from consumers and absorb bursts. At-least-once delivery requires idempotent consumers. Kafka retains an ordered log for replay; SQS is a managed work queue. Monitor lag and apply backpressure instead of unbounded buffering.` },
    { title: 'URL shortener', keywords: ['url shortener', 'hashing', 'redirect'], body: `Generate a short key with a counter encoded in base62 or a hash with collision handling. Store key → URL with a TTL or forever. Redirect with 301 (cacheable) or 302 (analytics). Cache hot keys; shard by key prefix. Rate-limit creation.` },
    { title: 'Social feed', keywords: ['feed', 'fan-out', 'timeline', 'ranking'], body: `Fan-out on write precomputes each follower's timeline and is fast to read but expensive for celebrities. Fan-out on read merges follows at request time and is cheaper to write. Hybrid: precompute for normal users, merge celebrity posts at read. Rank with engagement features; cache the first page.` },
    { title: 'Chat system', keywords: ['chat', 'websocket', 'presence', 'ordering'], body: `Persistent WebSocket connections with a presence service. Assign a monotonically increasing sequence per conversation for ordering. Store messages in a log partitioned by conversation. Deliver to online devices via pub/sub; offline devices sync on reconnect. Acknowledge delivery separately from read.` },
    { title: 'Notification system', keywords: ['notification', 'fan-out', 'delivery', 'preferences'], body: `Accept events, resolve recipients and preferences, render templates per channel, then enqueue delivery. Deduplicate by event/recipient/channel. Retry with backoff and a DLQ. Rate-shape per user to avoid fatigue. Track delivered, opened, and failed separately.` },
    { title: 'Rate limiter', keywords: ['rate limiter', 'token bucket', 'sliding window'], body: `Token bucket allows bursts up to capacity and refills at a steady rate. Sliding-window counters approximate better than fixed windows. In a distributed system, use Redis with atomic scripts or a local token bucket per node with a global budget. Return 429 with Retry-After and clear headers.` },
  ],
  worked: [
    { title: 'Estimating a URL shortener', body: `Assume 100M new URLs/day and 10:1 reads. Writes ≈ 1,160/s, reads ≈ 11,600/s. At 500 bytes per record, storage ≈ 50 GB/day, ≈ 18 TB/year. Cache the top 20% of keys; shard by key prefix. A single relational primary may handle writes; read replicas and a cache handle reads.` },
    { title: 'Choosing feed fan-out', body: `For 200M users and a celebrity with 50M followers, fan-out on write for every post is untenable. Use a hybrid: push posts to timelines for users with < 10k followers, and merge celebrity posts at read time. Cache the merged first page for seconds. This bounds write amplification while keeping reads fast.` },
  ],
  exam: [
    { question: 'When would you choose fan-out on read?', answer: 'When write amplification is too high, such as celebrities with millions of followers, or when feeds are highly personalized and computed at request time.' },
    { question: 'Why is at-least-once delivery the default?', answer: 'Exactly-once delivery across unreliable networks is impractical; idempotent consumers make at-least-once safe.' },
    { question: 'What does a shard key need?', answer: 'High cardinality, even distribution, and alignment with the most common query pattern to avoid cross-shard operations.' },
  ],
  cheat: [
    'Clarify functional + non-functional requirements; estimate QPS, storage, latency.',
    'Name trade-offs: consistency vs availability, latency vs cost.',
    'Cache layers: browser → CDN → service → DB; protect against stampedes.',
    'Replication scales reads; sharding scales writes; choose the shard key by access pattern.',
    'Queues decouple and absorb bursts; at-least-once + idempotent consumers.',
    'Draw the full request path, then go deep on the riskiest stage.',
  ],
};

MODULE_KNOWLEDGE['Advanced Frontend'] = {
  overview: `Advanced frontend is the set of techniques that keep large interfaces fast, accessible, and maintainable as teams and features grow: offline capability, component boundaries across teams, realtime collaboration, WebAssembly, accessibility auditing, and disciplined client state.

This module covers PWAs, micro-frontends and web components, realtime UI, WebAssembly, accessibility auditing, and client state at scale.` ,
  foundations: [
    `The browser is a runtime with powerful primitives: service workers for offline and caching, WebSockets for live data, Web Components for encapsulation, WebAssembly for near-native compute, and the Accessibility Object Model for assistive technology. Using them well means understanding their lifecycle and constraints.` ,
    `Architecture at scale is about boundaries. A boundary should have an owner, a contract, and an independent deploy path. Micro-frontends and web components are ways to draw those boundaries in the UI; they add coordination cost, so use them only when team autonomy justifies it.` ,
    `Accessibility is a property of the whole flow, not a checklist at the end. Keyboard order, focus management, announcements, contrast, and reduced motion must be designed alongside the visual layer. Automated tools catch a minority of issues; manual testing catches the rest.` ,
  ],
  concepts: [
    { title: 'Service workers and offline', keywords: ['pwa', 'service worker', 'offline', 'cache'], body: `A service worker is a background script that intercepts network requests. Cache-first suits static assets; network-first suits fresh data; stale-while-revalidate balances both. Version caches and clean up old ones. Offline writes need a queue and conflict resolution, not just a cache.` },
    { title: 'Web app manifest and installability', keywords: ['pwa', 'manifest', 'install'], body: `The manifest supplies name, icons, start_url, display mode, and theme colors. Installability requires HTTPS, a manifest, and a service worker with a fetch handler (browser rules vary). Installed apps still need deep links and back behavior.` },
    { title: 'Micro-frontends', keywords: ['micro-frontend', 'module federation', 'composition'], body: `Compose independently deployed apps at build time (module federation), run time (iframes/script loading), or edge (server-side includes). Shared dependencies need version contracts. Avoid shared global state across boundaries; communicate through events or URLs.` },
    { title: 'Web Components', keywords: ['web components', 'custom elements', 'shadow dom'], body: `Custom elements define new tags; shadow DOM encapsulates styles and markup; templates clone inert content. Attributes reflect to properties, and events cross the shadow boundary only if composed. Framework interop is possible but needs care.` },
    { title: 'Realtime UI', keywords: ['realtime', 'websocket', 'presence', 'optimistic'], body: `Reconnect with exponential backoff and resubscribe. Render optimistic updates immediately, then reconcile with the server version. Presence is eventually consistent; show "last seen" rather than a hard online claim. Throttle high-frequency events and batch renders.` },
    { title: 'WebAssembly', keywords: ['wasm', 'webassembly', 'rust', 'performance'], body: `WASM runs compiled code at near-native speed in a sandbox. It excels at compute-heavy tasks: codecs, image processing, parsing, simulation. It does not replace the DOM; JS still handles UI and I/O. Startup, memory copies, and toolchain complexity are the costs.` },
    { title: 'Accessibility auditing', keywords: ['accessibility', 'audit', 'screen reader', 'focus'], body: `Test keyboard-only, zoom 200%, high contrast, and a screen reader. Check names, roles, states, focus order, error announcements, and motion preferences. Automated tools find missing labels and contrast; they cannot judge whether the flow makes sense.` },
    { title: 'Client state at scale', keywords: ['state', 'normalization', 'state machine', 'url state'], body: `Separate server cache, global UI state, local component state, and URL state. Normalize entities by ID to avoid duplication. State machines make impossible states unrepresentable. Put shareable state in the URL. Delete state you can derive.` },
  ],
  worked: [
    { title: 'An offline-first todo list', body: `The service worker caches the shell. Mutations are written to IndexedDB with a client-generated ID and a pending flag, then synced when online. The server upserts by ID, making retries idempotent. Conflicts resolve by last-write-wins with a visible timestamp, or by prompting the user.` },
    { title: 'Auditing a modal', body: `Open the modal: focus moves inside, background is inert, Escape closes, focus returns to the trigger, and the accessible name comes from the heading. Screen-reader testing reveals whether the dialog role and description are announced. Automated tests catch none of the focus flow.` },
  ],
  exam: [
    { question: 'When is a service worker cache-first strategy wrong?', answer: 'For personalized or frequently changing data, where it serves stale content; use network-first or stale-while-revalidate instead.' },
    { question: 'What does shadow DOM encapsulate?', answer: 'Styles and markup inside a component, preventing outside CSS from leaking in and inside styles from leaking out.' },
    { question: 'When does WebAssembly beat JavaScript?', answer: 'For CPU-heavy, predictable computation such as codecs or parsing, not for DOM manipulation or I/O.' },
  ],
  cheat: [
    'Service worker strategies: cache-first, network-first, stale-while-revalidate; version caches.',
    'PWA: HTTPS + manifest + service worker; deep links still required.',
    'Micro-frontends trade autonomy for coordination; define contracts and shared dependency versions.',
    'Web Components: custom elements + shadow DOM + templates; composed events cross boundaries.',
    'WASM for compute; JS for DOM/I/O; watch startup and memory copies.',
    'State: server cache / global UI / local / URL; normalize and derive.',
  ],
};

MODULE_KNOWLEDGE['Testing and Delivery'] = {
  overview: `Tests are an executable specification and a safety net for change. Delivery is the process that turns a tested change into a safe release. Together they determine how fast a team can move without breaking users.

This module covers end-to-end testing with Playwright, component testing with Storybook, contract testing, load testing with k6, and progressive delivery with feature flags.` ,
  foundations: [
    `The test pyramid is a budget: many fast unit tests, fewer integration tests, and a small number of end-to-end tests for critical journeys. Inverting the pyramid produces slow, flaky suites that teams stop trusting. Test behavior and contracts, not private implementation details.` ,
    `A flaky test is worse than no test: it trains the team to ignore failures. Flakes come from time, randomness, network, shared state, and animation. Control the clock, seed randomness, isolate data, and wait on conditions rather than fixed delays.` ,
    `Delivery risk is proportional to batch size and blast radius. Small changes, progressive rollout, and fast rollback reduce risk. Feature flags separate deploy from release, but every flag is technical debt with an owner and an expiry date.` ,
  ],
  concepts: [
    { title: 'Playwright fundamentals', keywords: ['playwright', 'e2e', 'selectors', 'fixtures'], body: `Prefer role and label selectors, which reflect what users perceive. Use fixtures for auth and data, and isolate each test's state. Auto-waiting handles most timing; never use arbitrary sleeps. Run shards in CI and upload traces on failure.` },
    { title: 'Visual and component testing', keywords: ['storybook', 'component testing', 'visual regression'], body: `Storybook renders components in isolation with explicit states. Interaction tests exercise behavior; visual regression compares screenshots across changes. Keep stories close to real usage and review diffs instead of blindly accepting them.` },
    { title: 'Contract testing', keywords: ['contract testing', 'pact', 'schema'], body: `A consumer contract records the requests and responses a client expects; the provider verifies it. This catches breaking changes without running the full system. Schema validation catches shape drift; semantic changes still need review.` },
    { title: 'Load testing with k6', keywords: ['load testing', 'k6', 'performance', 'thresholds'], body: `Model realistic virtual users and ramp stages. Assert thresholds on p95 latency and error rate, not just average. A soak test reveals leaks; a spike test reveals saturation. Test the whole path, including the database and third parties.` },
    { title: 'Feature flags and canaries', keywords: ['feature flags', 'canary', 'rollout', 'kill switch'], body: `Flags gate code paths per user, cohort, or percentage. A kill switch disables a feature instantly. Canary routing sends a small slice of traffic to the new version and watches error and latency metrics. Remove stale flags; they accumulate into unreadable conditionals.` },
    { title: 'CI quality gates', keywords: ['ci', 'quality gates', 'lint', 'typecheck'], body: `Run lint, typecheck, unit tests, build, and a smoke E2E on every PR. Keep the pipeline fast with caching and parallelism. Block merges on failures, but make failures actionable; a red pipeline with no owner is a cultural problem.` },
  ],
  worked: [
    { title: 'Turning a flaky checkout test into a reliable one', body: `The test clicked "Pay" then waited 2 seconds. Under load, the confirmation arrived later. Replace the sleep with an expectation on the confirmation heading, mock the payment provider with a deterministic fixture, and reset the cart in a beforeEach hook. The test now waits on the actual condition and never races.` },
    { title: 'Safely releasing a new search ranking', body: `Put the new ranker behind a flag, enable it for 1% of traffic, and compare click-through and latency against the control. If error rates rise, flip the kill switch. After a week of stable metrics, increase to 10%, 50%, then 100%, removing the flag at the end.` },
  ],
  exam: [
    { question: 'Why is the test pyramid shaped that way?', answer: 'Unit tests are fast and pinpoint failures; integration tests catch contract issues; E2E tests are slow and flaky, so use them sparingly for critical journeys.' },
    { question: 'What makes a test flaky?', answer: 'Dependence on time, randomness, network, shared state, or animation; fix by controlling inputs and waiting on conditions.' },
    { question: 'What is the difference between deploy and release?', answer: 'Deploy ships code to production; release exposes it to users. Feature flags separate the two.' },
  ],
  cheat: [
    'Pyramid: many unit, fewer integration, few E2E. Test behavior and contracts.',
    'Playwright: role/label selectors, fixtures, auto-wait, traces on failure.',
    'Storybook: explicit states + interaction tests + visual diffs.',
    'Contracts catch breaking API changes without full-system tests.',
    'k6: ramp stages, p95 thresholds, soak and spike tests.',
    'Flags + canary + kill switch; remove stale flags.',
  ],
};

/** Every module in the three universes should have a pack. */
export const MODULE_KNOWLEDGE_COUNT = Object.keys(MODULE_KNOWLEDGE).length;

import type { TopicLesson } from "../topicLessons.js"; /** * Math and Statistics for ML — 5 authored topic lessons. * * Standalone chapters per topic. Subject-first prose, foundations, core * concepts, worked examples, exam practice, cheat sheet, recap. No shared * templates, no runtime composition. */
export const mathAndStatisticsForMl: Record<string, TopicLesson> = {
  "ai-ml-math-and-statistics-for-ml-linear-algebra-for-ml": {
    intro: `Linear algebra is the grammar of machine learning — data is matrices, models are matrix transformations, and optimization walks down gradients in matrix-shaped space. The subject is the working core: vectors and matrices, dot products, projections, decompositions (EVD, SVD), rank, norms, and the geometric intuition that makes shape mismatch errors instantly readable. if you move data, you are multiplying a matrix; everything else is annotation.`,
    foundations: `Vectors: ordered lists with dot product measuring alignment (cosine similarity); norms L1/L2/L∞ measure size; distance = norm of difference. Matrices: linear maps — transform space (rotate, scale, project, shear); multiplication = composition; associativity matters for order; dimensions: (m×n)(n×p)→m×p — incompatible inner dims = no product (shape errors forever). Rank: dimension of column space; full rank = no redundancy; determinant 0 → singular (no inverse). Inverse exists only for square full-rank — ML solves systems via decompositions, not explicit inverses. Transpose, trace; eigen: Av = λv — directions preserved under the map; SVD A = UΣVᵀ for any matrix.`,
    concepts: [
      {
        title: "Matrix multiplication as transformation composition.",
        body: `A matrix A maps x → Ax: columns tell where basis vectors land. Compose: A(Bx) — right-most applies first; order flips when multiplying matrices into one: (AB)x = A(Bx). Properties: not commutative (AB ≠ BA), distributes, associates. Column convention: each column of B is its image in A\'s output space. Stability: products can explode (norms multiply) or vanish (tiny norms kill signal) — the reason initialization and normalization schemes exist; reading code? Track (batch × features) shapes obsessively; every shape error is a violated contract the types cannot see.`,
      },
      {
        title: "Dot products, cosine similarity, and projections.",
        body: `x·y = Σ xᵢyᵢ = |x||y|cos θ — the engine of similarity: word embeddings, recommendation scoring, attention logits are pairwise dot products. Project y onto x: (x·y)/|x|² * x — residual space is everything else; QR and Gram-Schmidt iterate this; cosine similarity ignores magnitude — ideal for direction-as-meaning; linear regression is projection onto the column space; residuals are the orthogonal complement; this one picture explains the entire least-squares edifice — and PCA (project onto top-variance eigendirections).`,
      },
      {
        title: "Eigendecomposition and SVD: the decomposition power duo.",
        body: `Eigen: Av = λv — v survives A unbent, only scaled; square matrices with distinct eigenvalues have a full basis of them; A = QΛQ⁻¹ (or QΛQᵀ if symmetric) — symmetric PSD matrices (covariance, kernels, Hessians) always diagonalizable → PCA eigenvectors = directions of variance; EVD fails for non-symmetric/rectangular. SVD: A = UΣVᵀ for any matrix — singular values (σ ≥ 0 sorted) = energy per direction; rank = # σ > 0; truncation → best low-rank approximation (Eckart–Young — recommender matrices, compression); pseudoinverse A⁺ = VΣ⁺Uᵀ solves least squares explicitly; condition number σ_max/σ_min — big ratio = unstable solutions → regularization territory.`,
      },
      {
        title: "Rank, determinants, and why singularity terrifies ML.",
        body: `Rank deficiency → infinitely many solutions or none; features collinear → XᵀX singular → no unique least-squares solution → adding λI (ridge!) makes it invertible — regularization is inverting the singular; determinant near 0 → transformation crushes volume (information loss, unstable inversion); Gaussian densities need |Σ| — near-singular covariances break likelihood; condition number guides numerical honesty (float32 dies where float64 limps); checking rank of design matrices before regression is a 30-second sanity ritual worth a lifetime of NaNs.`,
      },
      {
        title: "Norms and geometry of optimization.",
        body: `L2: smooth, rotation-invariant, gradients bounded by Cauchy–Schwarz; L1: sparsity via non-differentiability at 0 (subgradient trickery); L∞: worst-case; Frobenius norm for matrices; nuclear norm for low-rank. Gradients live in the dual — with L2 geometry, gradient ascent direction is the normalized steepest ascent; the Hessian (4D: vector-Jacobian-vector compactly) encodes curvature — eigenvalues of Hessian at a point = principal curvature radii; deep landscapes have huge condition numbers → adaptive optimizers (Adam helps by rescaling per-coordinate); geometry determines which optimizer works, not folklore.`,
      },
    ],
    worked: [
      {
        title: "Derive PCA in five lines.",
        body: `Center X (subtract column means). Compute covariance C = XᵀX / (n - 1). EVD: C = QΛQᵀ. Sort eigenvalues desc; take top k eigenvectors W (columns). Project: Z = XW. That is it — variance of each PC = its eigenvalue; total variance captured = top-k sum / total; almost every "black box" PCA run was these five steps in disguise; reproducible, required, demystified.`,
      },
      {
        title: "Debug a singular training matrix.",
        body: `Model: linear regression on 40 features; LinAlgError: Singular matrix. Diagnose: np.linalg.matrix_rank(X) = 38 — two features duplicated (height_cm and height_m identical!) and one constant zero-variance. Fix: drop duplicates (domain check first — identical columns can hide encoding bugs); constant dropped; X full rank; model trains; lesson institutionalized: dedupe near-identical columns + check rank pre-fit in the training script; the one-time fix took 4 minutes; the automated check saved 20 hours since.`,
      },
      {
        title: "SVD for recommender compression.",
        body: `Ratings matrix 2M users × 50k items, 99.9% missing — treat missing as 0 for simplicity test; SVD on the subsampled normalized matrix: keep σ₁₋₁₀₀ (1% energy loss by scree); reconstruct = k-latent-factor collaborative filtering; AUC@10 competitive with fancier models; the same SVD, truncated, powers latent semantic indexing for search; the mathematics of low-rank approximation is half of applied ML wearing a suit.`,
      },
    ],
    exam: [
      {
        question:
          "Why does PCA use eigendecomposition of the covariance rather than of the raw data matrix?",
        answer:
          "The covariance is symmetric PSD → guaranteed real eigenvalues and orthogonal eigenvectors — the variance-maximizing directions; raw data EVD may not exist usefully for rectangular matrices; covariance centers around means, so eigenvectors point along maximal spread axes — the math only delivers with symmetry.",
      },
      {
        question:
          "What does a large condition number in XᵀX mean for your model?",
        answer:
          "Near-singular normal equations — tiny data changes swing coefficient estimates wildly; solutions are numerically unstable (float32 collapses first); regularize (ridge), drop collinear features, or standardize — the number is the smoke alarm you are supposed to read before the fire.",
      },
      {
        question:
          "What do singular values say that eigenvalues of a general matrix cannot?",
        answer:
          "SVD exists for every matrix, rectangular or not, symmetric or not — singular values measure per-direction stretching energy regardless of diagonalizability; they power pseudoinverse, rank deficiency diagnosis, and optimal low-rank compression; eigenvalues demand square, and often symmetry.",
      },
      {
        question:
          "Why is matrix multiplication not commutative, geometrically?",
        answer:
          "You are composing transformations — rotate then reflect differs from reflect then rotate; order encodes meaning; commuting matrices exist (they share eigenvectors) but generic ones do not; treating AB as swappable is the classic matrix bug — dimension compatibility is checked, semantic order is not.",
      },
    ],
    cheat: [
      "Shapes compose like functions: (B,D)@(D,E)→(B,E); no inner match, no product.",
      "Dot product similarity; cosine for direction; projection for residuals.",
      "EVD: symmetric PSD → PCA; SVD: everything else → pseudoinverse/compression.",
      "Rank deficiency → regularize (ride λI to invertibility) or dedupe features.",
      "Condition number = σ_max/σ_min; huge → unstable → ridge.",
      "L2 smooth; L1 sparse; Hessian = curvature; geometry picks optimizers.",
    ],
    recap: `Linear algebra for ML is geometric fluency with matrices: composition of maps, dot products as similarity engines, projections as regression, EVD for variance-maximizing directions (PCA), SVD for universal decomposition and compression, rank and conditioning as health checks — every tensor bug and unstable model you will ever meet traces back here, and every elegant ML result is linear algebra wearing a neural costume.`,
    code: {
      title: "SVD low-rank approximation",
      language: "python",
      code: `U, s, Vt = np.linalg.svd(A, full_matrices=False)\nA_k = U[:, :k] @ np.diag(s[:k]) @ Vt[:k]`,
      explanation:
        "Best rank-k approximation by Eckart-Young; the backbone of latent factors, denoising, and compression wherever matrices appear.",
    },
    diagram: {
      title: "Matrix as transformation",
      caption: "A maps basis vectors to their images.",
      mermaid: `flowchart LR\n X[x vector] --> A[Matrix A]\n A --> Y[Ax]`,
    },
  },
  "ai-ml-math-and-statistics-for-ml-probability-and-statistics": {
    intro: `Probability and statistics are the epistemology of learning from finite data — everything ML knows about the world arrives through Bayes and the law of large numbers. The subject is the working toolkit: distributions, expectation, conditional probability, Bayes\' theorem, sampling, estimators, and confidence intervals — enough to reason honestly about uncertainty instead of trusting vibes. every model is a claim about probability, and every metric is an estimator with error bars.`,
    foundations: `Sample space, events, probability axioms; conditional P(A|B) = P(A∩B)/P(B); independence; joint/marginal/conditional distributions; Bayes: P(θ|D) ∝ P(D|θ)P(θ) — prior × likelihood. Random variables: discrete (PMF) vs continuous (PDF); expectation E[X] = ΣxP(x) or ∫xf(x)dx; variance Var = E[X²] - E[X]²; covariance, correlation (uncorrelated ≠ independent, except Gaussians); common distributions: Bernoulli, Binomial, Poisson, Geometric, Gaussian, Exponential, Gamma, Beta; moments. Estimators: sample mean/variance — unbiased, consistent; CLT: sample means → Normal regardless of parent distribution.`,
    concepts: [
      {
        title: "Conditional probability and Bayes in the wild.",
        body: `P(A|B) vs P(B|A) — the prosecutor\'s fallacy lives here: P(DNA|innocent) tiny doesn\'t mean P(innocent|DNA match) tiny unless priors counted; base rates dominate rare events — a 99%-accurate detector on a 0.1%-incidence event is wrong 90% of the time (false positive math); Bayes updates beliefs: posterior = prior × likelihood normalized; sequential updating accumulates evidence; Naive Bayes multiplies likelihoods assuming conditional independence (works absurdly well for text spam); calibration of model probabilities matters exactly because of this machinery — miscalibrated conf ≠ trust.`,
      },
      {
        title: "Expectation, variance, and the Gaussian obsession.",
        body: `E[X+Y] = E[X] + E[Y] always; E[XY] = E[X]E[Y] only if independent; Var linear combinations carefully; Var(X+Y) = Var X + Var Y + 2Cov. Gaussian: maximizes entropy for fixed mean/variance; appears everywhere via CLT summing; sample mean → N(μ, σ²/n) regardless of shape (n ≥ 30-ish) — every t-test and CI rides on this; σ/√n shrinks uncertainty with samples — sqrt(n) law of data hunger; outliers dominate sample variance — robust alternatives (median, IQR-scaled MAD) when tails matter.`,
      },
      {
        title: "Distributions worth memorizing.",
        body: `Bernoulli → Binomial (n coins), Poisson (count of rare events per interval — support tickets per hour), Geometric (trials until first success — number of attempts), Exponential (time between events — memoryless), Gaussian (everything averaged), Beta (conjugate prior for proportions — A/B posteriors), Gamma (waiting times for Poisson processes), Dirichlet (distribution over distributions — topic models). Each is a story; knowing the story beats memorizing PDFs: "calls per 10 minutes" has a Poisson shape by construction, not by luck.`,
      },
      {
        title: "Sampling, estimation, and confidence intervals.",
        body: `Sample ≠ population — sampling error ~ σ/√n with random sampling; stratified sampling reduces variance; sampling bias destroys everything downstream (the deadliest unforced error in applied stats); estimators: unbiased + consistency + efficiency (Cramer–Rao floor — achievable? asymptotically yes for MLE); MLE: θ̂ = argmax log P(D|θ) — consistent, asym normal, efficient — the workhorse (logistic/softmax = MLE); confidence interval: range covering parameter for 95% of repeated worlds (interpretation discipline!), not "95% chance θ inside" — common misinterpretation, same crime as misreading p-values.`,
      },
      {
        title: "Hypothesis testing without cargo cult.",
        body: `Null hypothesis testing: assume boring world → compute probability of observed (or more extreme) → reject if p < α. p-value ≠ P(H₀ true); α=5% is a convention, adjust for multiplicity (Bonferroni, FDR); effect sizes matter — n=10M finds epsilon differences; always pair significance with magnitude and practical relevance; pre-register primary metrics; A/A tests validate the harness; power analysis before the experiment (n needed for effect δ at 80% power); the modern complement: report CIs of effects and let magnitude speak; sequential peeking breaks fixed-horizon math — use sequential methods or fix the horizon.`,
      },
    ],
    worked: [
      {
        title: "False-positive math for a disease screen.",
        body: `Incidence 0.5%; test 97% sensitive, 93% specific. 10,000 people: 50 sick (48 true positives, 2 missed); 9950 healthy → 697 false positives; PPV = 48/(48+697) = 6.4% — a positive means 6% chance of disease. Devastating until Bayesian reasoning is applied: the healthy flood the alarm. This exact arithmetic underpins ML security alerts, fraud flags, and monitoring — base rates are not optional in any alarm conversation.`,
      },
      {
        title: "CLT for rolling user-level metrics.",
        body: `Each user contributes revenue per session — wildly skewed (power users). Team wants CI for mean per-user revenue. Single distribution: useless. By CLT, mean of n=30k users is ≈ Normal(μ=8.20, σ/√n≈0.09) → 95% CI [8.02, 8.38] — valid despite the parent chaos; bootstrap check confirmed; the CLT is why A/B platforms can reason with averages honestly even when distributions are grotesque.`,
      },
      {
        title: "MLE for logistic coefficients by hand.",
        body: `Loss −Σ [y log σ(w·x) + (1−y) log(1−σ(w·x))] — this IS the negative log-likelihood of Bernoullis with logit probabilities; minimizing cross-entropy = maximizing likelihood; every logistic fit is an MLE hunt; same for softmax cross-entropy = categorical MLE; the unification of "loss functions" and "probability models" under MLE is the quiet skeleton of classical ML.`,
      },
    ],
    exam: [
      {
        question:
          "Why does a 99% accurate test on a rare event produce mostly false alarms?",
        answer:
          "The base rate — true cases are rare, so false positives from the healthy majority swamp the few true positives; specificity and sensitivity alone are meaningless without prevalence; always compute PPV with the base rate for deployment-grade alert design.",
      },
      {
        question: "What do we actually know when a 95% CI excludes the null?",
        answer:
          "Across repeated identical experiments, such procedures cover the true parameter 95% of the time; this observation is one of them — the interval is the procedure evidence, not a probability statement about θ; interpretation errors of CIs mirror p-value errors and deserve equal suspicion.",
      },
      {
        question: "Why is correlation not causation, in probability language?",
        answer:
          "Correlation measures joint linear variation; latent confounders, reverse causation, or selection effects produce the same covariance — P(Y|X) ≠ P(Y|do(X)); experiments (randomization) break confounders by construction; observational inference needs assumptions stated, not vibes asserted.",
      },
      {
        question:
          "What does the CLT let you claim regardless of the parent distribution?",
        answer:
          "That sample means (sums, actually) converge to a Gaussian as n grows, with σ/√n shrinkage — justifying t-intervals, z-tests, and normal machinery on everything from click counts to latency; it is why massive A/B experiments can use simple tests without knowing the parent shape.",
      },
    ],
    cheat: [
      "P(A|B) ≠ P(B|A); base rates decide rare-event tests.",
      "Bayes: posterior ∝ prior × likelihood; sequential updates compound.",
      "CLT: means → Normal; σ/√n; n ≥ 30-ish magic.",
      "MLE = cross-entropy minimization; logistic/softmax are MLE.",
      'CIs cover the parameter in repeated worlds; never "95% chance θ".',
      "p ≠ P(H₀ true); power first; effect size + CI, always.",
      "Sampling bias is unfixable post-hoc — design randomization.",
    ],
    recap: `Probability and statistics train the ML mind to doubt honestly: conditional reasoning over base rates, Bayes as the update rule, CLT as the reason averages behave, MLE as the origin of standard losses, and confidence intervals as the true communication of uncertainty — the entire craft of learning from finite samples without self-deception, which is what modeling actually is.`,
    code: {
      title: "Bootstrap CI in three lines",
      language: "python",
      code: `stats = [np.mean(np.random.choice(x, len(x), replace=True)) for _ in range(10000)]\nlo, hi = np.percentile(stats, [2.5, 97.5])`,
      explanation:
        "Resample-and-recompute: distribution-free uncertainty on any statistic — the pragmatic complement to closed-form intervals.",
    },
    diagram: {
      title: "Bayesian update loop",
      caption: "Prior × likelihood → posterior.",
      mermaid: `flowchart LR\n P[Prior] --> B[Posterior]\n L[Likelihood] --> B`,
    },
  },
  "ai-ml-math-and-statistics-for-ml-calculus-and-gradients": {
    intro: `Calculus is how learning happens — every neural weight moves because a derivative told it which way is downhill. The subject is the working toolkit: derivatives and partials, the chain rule (why backprop works), gradients as direction vectors, Taylor expansions (why gradient descent converges), and optimization landscapes — the math that demystifies understanding training curves. if you see a loss curve bend, you are watching calculus negotiate with geometry.`,
    foundations: `Derivative f'(x) = limit of secant slopes — instantaneous rate of change; rules: sum, product, quotient, chain. Partial derivatives: vary one variable, hold others; gradient ∇f = vector of partials — steepest ascent direction, magnitude = steepness; directional derivative: ∇f·u. Chain rule: df/dx = df/dg · dg/dx — the entire backpropagation algorithm is this one sentence applied recursively. Higher-order: Hessian H = ∂²f — matrix of curvature; symmetric (Clairaut) under smoothness. Taylor: f(x+h) ≈ f + ∇f·h + ½hᵀHh — locally linear approximation; gradients win locally because second-order terms are small for tiny steps.`,
    concepts: [
      {
        title: "Gradients: vector fields of steepest ascent.",
        body: `At a point, ∇f points directly uphill — magnitude |∇f| is the steepness; descent step: x ← x - η∇f (learning rate η). Norm gradient → near-flat → small steps stall; norm gradient high → steep walls → step size critical; gradient zero at critical points: min, max, saddle (deep nets are saddle-dominated — most critical points are saddles, not minima!); normalized gradients (per-layer adaptation) stop one layer dominating updates; gradient clipping caps explosion (norm > c → scale down) — essential for RNNs and transformers.`,
      },
      {
        title: "The chain rule and backpropagation.",
        body: `Layer y = φ(Wx + b): ∂L/∂b = ∂L/∂y·φ'(Wx+b); ∂L/∂W = ∂L/∂y·φ'·xᵀ; ∂L/∂x = Wᵀ·∂L/∂y — backward pass propagates adjoints gradient-of-loss from output to input through every layer in reverse with matrix multiplies; memory: cache activations for backward; compute: ~2-3x forward cost; autodiff (PyTorch grad/jax.grad) implements this generically over your graph — understanding the mechanics means reading why exploding/vanishing gradients happen (repeated products of φ'·W shrink or amplify exponentially) and why residual connections, good initialization, and normalization exist.`,
      },
      {
        title: "Taylor expansion and learning-rate choice.",
        body: `Second-order Taylor: f(x+h) ≈ f + ∇fᵀh + ½hᵀHh — gradient descent is the linear term; the quadratic term decides safe step size: if η > 2/λ_max(H), divergence (η*L < 2 with L = Lipschitz constant of gradient = λ_max(H) for quadratics); optimal η for quadratic bowl: 2/(λ_min + λ_max) — condition number decides convergence rate; Adam normalizes per-coordinate second moments to loosely approximate diagonal preconditioning — faster for ill-conditioned problems; when your loss curve zigzags, you are above the stability edge — η too big by definition.`,
      },
      {
        title: "Hessians, curvature, and optimization landscapes.",
        body: `H at a point: eigenvalues = principal curvatures; λ_min > 0 → local minimum (bowl up); λ_max > λ_min ≫ 0 → narrow canyon (slow convergence for vanilla GD); negative mixed signs → saddle. Cheap probes: loss landscape visualizations; second-order methods (Newton: x ← x - H⁻¹∇f) exact for quadratics but H huge (d² memory); quasi-Newton (L-BFGS) approximates from gradient history — shines for batch full-data problems (physics, small nets); stochastic first-order dominates deep learning for scale; noise in SGD itself helps escape saddles (implicit exploration) — a feature, not a bug.`,
      },
      {
        title: "Calculus of specific function families.",
        body: `Sigmoid σ: σ\' = σ(1-σ) — saturates at extremes, vanishing gradients; tanh: 1 - tanh² — same disease milder; ReLU: max(0, x) — 0 grad for negative (dead ReLUs from big negative bias); GELU/Swish smooth approximations; softmax: probabilities sum to 1 — Jacobian diag(p) - ppᵀ; cross-entropy derivative cancels logits elegantly (gradient = p - y) — the cleanest derivative in deep learning; log-sum-exp trick to avoid overflow; KL divergence gradient similar elegance; knowing these makes debugging exploding/dead units deterministic instead of superstitious.`,
      },
    ],
    worked: [
      {
        title: "Derive cross-entropy loss gradient by hand.",
        body: `L = -Σ yᵢ log(pᵢ), p = softmax(z). dL/dzₖ = -Σ yᵢ (∂log pᵢ/∂zₖ) = -(yₖ/pₖ·pₖ - Σ yᵢ pᵢ) = pₖ - yₖ. One line: gradient is prediction minus truth — that is why cross-entropy trains stably: large errors get proportionally large corrections, self-scaling; the same derivation for sigmoid gives p - y as well; every deep net in the world rides on "gradient = prediction error" — the most elegant cancellation in applied math.`,
      },
      {
        title: "Diagnose an exploding-gradient RNN from the chain rule.",
        body: `Sequence 200 steps; recurrent weight spectral norm 1.3; repeated multiplication → 1.3^200 ≈ 10^23 — gradients explode. Fix options by the math: gradient clipping (norm bound — direct symptom treatment), spectral normalization of recurrent weights (keep norm ≤ 1), LSTM/GRU gating (additive residual paths break the product chain), better init (orthogonal, norm exactly 1), layer norm per step. Choose LSTM + clip — standard practice born straight from the derivative product; the chain rule is not theory, it is the bug report.`,
      },
      {
        title: "Pick learning rate from the Hessian quadratic bound.",
        body: `Quadratic approximation of the loss around a good point: empirical Hessian λ range [0.4, 8.0] → stable η < 2/8 = 0.25; optimal ≈ 2/(0.4+8) ≈ 0.24 with momentum or ≈ 1.8/λ_max ≈ 0.22; chosen η = 0.2 — 2 epochs to convergence; the cautious 0.05 would take 8x longer; the floored 0.5 diverges with NaN by step 300; the bound is the difference between craft and superstition in LR tuning.`,
      },
    ],
    exam: [
      {
        question:
          "What does gradient descent do with the quadratic term it ignores?",
        answer:
          "It ignores it — taking steps dictated by the linear term only — which is why each step must be small enough that the linearization stays valid; the quadratic term is the error bound deciding max safe step; ignoring it above the stability edge means moving uphill unknowingly, i.e., diverging.",
      },
      {
        question:
          "Why does ReLU produce dead units and how does initialization/LR prevent it?",
        answer:
          "Negative pre-activations give zero gradient — a unit that sees always-negative input never updates and stays dead; proper init keeps pre-activations centered near zero, moderate LR prevents early catastrophic shifts into the negative region, and variants (LeakyReLU/GELU) supply a small slope restoring gradient flow.",
      },
      {
        question:
          "What happens to the gradient product in a 100-layer vanilla network?",
        answer:
          "Multiplicative decay — per-layer factors like σ'(z)·w stack exponentially; products of numbers ≲1 vanish exponentially in depth (or explode if w>1) — vanishing gradients block early-layer learning; residual connections, normalization, and careful init are cures prescribed directly by this analysis.",
      },
      {
        question:
          "Why do adaptive optimizers (Adam) outperform SGD on ill-conditioned problems?",
        answer:
          "They rescale per-coordinate by running RMS of past gradients — components with historically larger gradients get smaller effective steps (and vice versa), approximating diagonal preconditioning; ill-conditioned Hessians (huge eigenvalue spreads) converge faster because curvature imbalance is compensated automatically.",
      },
    ],
    cheat: [
      "∇f = steepest ascent; descent: x ← x − η∇f; |∇f| = steepness.",
      "Chain rule = backprop: adjoints flow output→input through matrix ops.",
      "η > 2/λ_max diverges; optimal η ≈ 2/(λ_min+λ_max); condition number rules.",
      "Hessian eigenvalues = principal curvatures; saddles dominate deep nets.",
      "σ' = σ(1−σ); softmax+xent ⇒ gradient = p − y.",
      "Clip exploding norms; normalize for stable depth; residual paths beat vanishing.",
      "Taylor: f(x+h) ≈ f + ∇f·h + ½hᵀHh — linearization safety decides steps.",
    ],
    recap: `Calculus under ML is local geometry exploited deliberately: gradients as direction fields, the chain rule as the engine of backprop, Taylor expansions as the honesty constraint on step size, Hessian curvature as the arbiter of conditioning — fluency here converts training from incantation into engineering: you know why it descends, why it zigzags, why it diverges, and exactly which knob fixes which symptom.`,
    code: {
      title: "Gradient of softmax cross-entropy",
      language: "python",
      code: `p = softmax(z)\ngrad = p - y_one_hot`,
      explanation:
        "The celebrated result: prediction minus truth; no manual chain rule ever needed in practice — but once understood, training losses are never mysterious again.",
    },
    diagram: {
      title: "Backpropagation flow",
      caption: "Adjoints from loss back through layers.",
      mermaid: `flowchart LR\n L[Loss] --> D[Layer n gradient]\n D --> M[Layer n-1]\n M --> E[Layer 1]`,
    },
  },
  "ai-ml-math-and-statistics-for-ml-optimization": {
    intro: `Optimization is the engine of every learning algorithm — the theory of turning "make the loss smaller" into a convergent, stable, scalable procedure. The subject is practical optimization: gradient descent variants (GD/SGD/momentum/Adam/WAdam), convexity and its limits in deep learning, learning-rate schedules, regularization (L1/L2/dropout), and constrained problems — the toolkit that decides whether training converges to something useful or something embarrassing. optimization is applied patience with a learning-rate knob — know your landscape before you turn it.`,
    foundations: `Problem: minimize f(x) — unconstrained (loss surfaces) vs constrained (LSM/LMI). Convexity: f(θx+(1-θ)y) ≤ θf(x)+(1-θ)f(y) — every local min is global; neural nets are non-convex but behave near-convex along many directions; conditioning (Hessian eigen ratio) decides iteration count. Gradient descent family: GD (full-batch, smooth, slow), SGD (minibatch noise — regularizing!), momentum (velocity accumulates: v = βv + ηg; x -= v), Nesterov (lookahead gradient), AdaGrad (per-coord accumulated squared grad — sparse data), RMSProp (exponential moving average fixes AdaGrad decay), Adam (RMSProp + bias correction + momentum — default), AdamW (decoupled weight decay — the correct regularizer placement), LAMB/LARS (layerwise adaptive for large-batch training).`,
    concepts: [
      {
        title: "SGD noise is a feature, and momentum is the sail.",
        body: `Minibatch gradients are unbiased estimates with variance ∝ 1/batch — the noise jostles parameters out of sharp local minima toward flat ones (generalization correlation: flatter minima generalize better); too much noise (tiny batches) destroys convergence or random-walks; noise scale η/batch ratio governs it; momentum accumulates consistent direction, cancels oscillations perpendicular to the valley — heavy β (0.9) accelerates 2-3x in ravines; combining: high LR with momentum + warm restarts revisits good basins; Nesterov corrects by evaluating gradient at the predicted lookahead point — the current practical king of plain momentum.`,
      },
      {
        title: "Adam: default with fine print.",
        body: `Adam: m = β₁m + (1-β₁)g (momentum 0.9), v = β₂v + (1-β₂)g² (second moment 0.999), bias-corrected m̂/(√v̂+ε); per-parameter adaptive LR — rescues sparse gradients, robust default for transformers. Pitfalls: can generalize worse than SGD+momentum on vision (flat-min search benefits); AdamW: weight decay decoupled from gradient (w ← w - ηλw) — repairs Adam\'s broken L2 regularization (L2-through-Adam-scales-by-√v — uneven and wrong); ε too big kills adaptivity; β₂=0.95 sometimes for fast-changing large models; warm β₂ down for final phases; cyclical/warm-retry LRs + Adam variants for the last mile.`,
      },
      {
        title: "Learning-rate schedules: the single highest-leverage trick.",
        body: `Constant LR: plateau city. Step decay: drop 10x at milestones (ResNet style); exponential: smooth decay; cosine annealing: LR from max to min smoothly — strong default with warm restarts option; warmup: critical for Adam + transformers — linear ramp over first 1-5% of steps prevents early blowup when second-moment estimates are noisy; one-cycle policy: warmup → high LR → cosine decay — super-convergence in half the epochs; final low LR settles into the floor — never stop decaying before validation plateaus; always plot LR vs metrics; schedule choice routinely differs by 2-3% final accuracy.`,
      },
      {
        title: "Regularization: L1/L2/dropout/early-stopping as constraints.",
        body: `L2 (weight decay): shrinks weights, smooths, Gaussian prior; L1: sparse selection (zero out irrelevant features), Laplace prior; dropout: multiplicative noise — approximate ensemble of nets, prevents co-adaptation; early stopping: free lunch regularizer (validation curve is the prior on iterations); label smoothing: soften one-hots — less overconfident, better calibrated; data augmentation: the strongest regularizer by far in vision; mixup/cutmix; noise injection; the principle unifying all: constrain effective capacity toward simpler functions that happen to fit — regularization strength grows when data shrinks or noise grows relative to signal.`,
      },
      {
        title: "Constrained and second-order problems.",
        body: `KKT conditions generalize Lagrange multipliers to inequalities — the backbone of SVM margins and trust regions; penalty/interior-point methods for inequality constraints (projected gradient for simplex/ball constraints); augmented Lagrangian for hard constraints; second-order: Newton\'s method exact on quadratics, memory d² — L-BFGS approximates inverse Hessian from gradient history (ideal for batch, full-data); natural gradient: scale by inverse Fisher — theoretically perfect step, Kronecker-factored approximations (K-FAC) at scale; trust-region/Lanczos for very-high-d curvature; mostly academic for deep nets — but the local quadratic view explains why Adam behaves quasi-naturally.`,
      },
    ],
    worked: [
      {
        title: "Why AdamW beat your Adam on fine-tuning.",
        body: `Vanilla Adam + weight decay (as L2 in loss): λ applied gradient g_wd = λw scaled by 1/(√v+ε) — parameters with tiny gradients got relatively huge decay, biasing them to zero unfairly; switch to AdamW (decay directly on w, LR scale ηλ): uniform proportional shrinkage, better generalization on 70% of transformer fine-tunes by paper, confirmed on 3 internal benchmarks; the change was one flag — the subtlety: Adam\'s adaptivity distorts the regularizer, and decoupling repairs it.`,
      },
      {
        title: "Diagnose loss oscillation and apply warmup + clipping.",
        body: `First 200 steps: loss spiked to NaN twice. Root cause: Adam\'s second-moment estimates initialized at 0 → first steps enormous (bias-correction takes many steps to stabilize) + transformer layer gradients heavy. Fix: 400-step linear warmup to peak 3e-4; grad norm clip 1.0; loss smooth from step 50; final eval +1.4%; playbook institutionalized for every transformer run since — warmup is not optional hyperparameter soup, it is bootstrap safety for the estimator.`,
      },
      {
        title: "Cosine schedule rescues a plateauing fine-tune.",
        body: `BERT fine-tune on 8k examples: constant 2e-5 — validation plateaued at 0.81; switch to cosine with warmup 500 steps from 2e-5 down to 1e-6, then evaluate every 200 steps: reached 0.84 at epoch 4 vs 6, better calibration (ECE 0.09→0.06); LR plot told the whole story; the marginal 3% from schedule matched what another 40k labels would have bought — schedules are bought signal, not decoration.`,
      },
    ],
    exam: [
      {
        question:
          "Why is SGD noise scientifically valuable rather than merely tolerated?",
        answer:
          "The noise biases iterates toward flat minima — wider basins generalize better (small data perturbations barely move the loss); sharp minima overfit coordinate detail; noise scale η/batch tunes this bias; larger batches with same η lose the implicit regularization — beyond a point you must scale η or find another source of exploration.",
      },
      {
        question:
          "Why is plain Adam not the same as AdamW, and when does it matter?",
        answer:
          "Adam scales the L2 term by the adaptive per-coordinate factor, making weight decay uneven and generally weaker on high-variance coordinates; AdamW applies w ← w − ηλw directly — uniform, correct, and consistently better on dense layers — the canonical fix with one changed line of code.",
      },
      {
        question: "What does warmup actually protect in Adam training?",
        answer:
          "The second-moment estimator v from being trusted before it has data — initially v̂ underestimates squared gradients (all zeros), making the first steps oversized; linear warmup caps steps until v stabilizes; transformers especially diverge without it — the canonical catastrophic-failure prevention in modern training.",
      },
      {
        question: "What is the KL/dual view of regularization as a constraint?",
        answer:
          "Every penalty is a Lagrangian encoding an implicit constraint — L2 ≈ ||w|| ≤ budget (Gaussian prior), L1 ≈ sparse ball, dropout ≈ noise-constrained ensemble; stronger penalty ≠ stronger model, it is a smaller hypothesis class — the bias-variance dial, set by evidence not aesthetics.",
      },
    ],
    cheat: [
      "SGD+momentum default strong; Adam adaptive default flexible; AdamW for transformers.",
      "Cosine + warmup beats constant; one-cycle super-converges on small data.",
      "η too big → zigzag/diverge; too small → plateau; condition number is the map.",
      "L2=smooth, L1=sparse, dropout=ensemble, augmentation=king.",
      "AdamW decouples decay from gradient; use it over Adam+L2.",
      "Warmup 1-5% steps — non-negotiable for Adam on transformers.",
      "Clip grads; measure the landscape; trust curves, not defaults.",
    ],
    recap: `Optimization is engineered descent: SGD for implicit flat-min bias, momentum for canyon walls, Adam/AdamW as adaptive defaults with honest caveats, schedules (warmup + cosine) as the cheapest large accuracy lever, regularization as explicit capacity control with L2/L1/dropout/augmentation, and constraints via penalties and KKT — fluency turns "training ran" into "training converged on purpose, on schedule, for a reason".`,
    code: {
      title: "AdamW step",
      language: "python",
      code: `v = b2 * v + (1 - b2) * g * g\np -= lr * m_hat / (sqrt(v_hat) + eps)\np -= lr * wd * p`,
      explanation:
        "Adaptive moment math plus decoupled weight decay — three lines capturing what separates stabilizers from NaNs in every transformer run you will ever babysit.",
    },
    diagram: {
      title: "Optimization landscape",
      caption: "Canyons, saddles, and how to descend.",
      mermaid: `flowchart TD\n H[High curvature canyon] --> M[Momentum accelerates]\n S[Saddle] --> N[Noise escapes]`,
    },
  },
  "ai-ml-math-and-statistics-for-ml-information-theory": {
    intro: `Information theory quantifies surprise — how much a message means, how uncertain a source is, how different two distributions are — and those quantities are the hidden objective functions of machine learning. The subject is the toolkit: entropy, cross-entropy, KL divergence, mutual information, and log-loss, read as the exact quantities every training run minimizes. when your model trains, it is compressing reality — the code length of the data under your model is the loss.`,
    foundations: `Shannon entropy H(X) = -Σ p(x) log₂ p(x) — expected surprise in bits; conditional entropy H(Y|X); joint H(X,Y); mutual information I(X;Y) = H(Y) - H(Y|X) — explanatory power of X for Y; chain rule H(X,Y) = H(X) + H(Y|X). Cross-entropy H(p,q) = -Σ p log q — expected codelength under q when reality is p; KL divergence D_KL(p||q) = Σ p log (p/q) — asymmetry: p||q ≠ q||p; H(p,q) = H(p) + D_KL(p||q). Log loss = cross-entropy with empirical distribution; MLE = minimizing cross-entropy; mutual information ≥ 0, zero iff independent.`,
    concepts: [
      {
        title: "Entropy: uncertainty, quantified.",
        body: `H is maximized by uniform distribution (all outcomes equally surprising); zero for deterministic outcomes; measured in bits (log₂) or nats (ln); 1 bit = one yes/no question worth of information on average; conditional entropy after knowing X shrinks proportionally to I(X;Y); entropy rate for sequences: each new symbol cost — the compression limit; language models quote perplexity = exp(cross-entropy) — a perplexity of 20 means the model is as uncertain as choosing uniformly among 20 words per position; entropy is the native unit of prediction quality.`,
      },
      {
        title: "Cross-entropy: the loss hiding in plain sight.",
        body: `Classification with softmax: L = -Σ yᵢ log pᵢ where y is one-hot — this IS cross-entropy between empirical distribution (the label) and predicted distribution; minimizing CE = maximizing likelihood (MLE) — they are identical operations; add regularization = MAP; asymmetry: model punishes confident errors savagely (log 0.001 ≈ -6.9) — incentive to be honest; binary CE for BCE; label smoothing softens the empirical distribution (0.9/0.05/0.05) — reduces overconfidence, improves calibration; every "loss curve" you have ever read is this quantity averaged per batch, trending down toward H(p) + D_KL(p||q).`,
      },
      {
        title: "KL divergence: the distance that is not quite a distance.",
        body: `D_KL(p||q) ≥ 0 by Jensen/Gibbs inequality, = 0 iff p = q — but violates symmetry and triangle inequality; D_KL is a directed measure: p||q charges q for failing to cover p\'s mass (q must spread where p lives), q||p does the opposite (q may not cover everything) — the choice selects mode-seeking vs mean-seeking behavior in generative models: forward KL (data→model) = cover everything (safe, blurry), reverse KL (model→data) = mode lock, sharp drops — VAE ELBO uses forward; RLHF KL penalty keeps policy near reference model for exactly the reverse reason; understanding direction = understanding which failure you traded.`,
      },
      {
        title: "Mutual information: feature selection weaponized.",
        body: `I(X;Y) = E log [p(x,y)/(p(x)p(y))] — information one variable carries about another; zero iff independent; captures any dependence (not just linear like correlation); classification feature scoring (scikit's mutual_info_classif), decision-tree splits (ID3/C4.5 use information gain = H(parent) - Σ w H(child)); information bottleneck: compress X into Z minimizing I(X;Z) while preserving I(Z;Y) — the theoretical ancestor of representation learning and autoencoders; conditional MI for synergy vs redundancy (partial information decomposition) — when two features jointly see what neither sees alone.`,
      },
      {
        title: "Coding theory and the minimum description principle.",
        body: `Source coding: optimal prefix code length = entropy — no lossless compression beats H; arithmetic coding approaches it; cross-entropy difference = wasted codelength = extra bits the model costs you every prediction; perplexity/branch factor economically interpretable; MDL principle: best model = shortest program that outputs data (+ residual) — Occam quantified; generalization bounds (PAC-Bayes) literally involve KL(posterior||prior) as complexity penalty — the regularizer is information; VIB (variational information bottleneck) operationalizes this; deep learning compresses via SGD — critics call it fitting, theorists call it compression with mercy.`,
      },
    ],
    worked: [
      {
        title: "Derive perplexity from CE in one line.",
        body: `Loss = CE = avg -log₂ p(true). Perplexity = 2^CE — if CE = 4.32 bits/token, PPL = 2^4.32 ≈ 20 — the model is as torn as a 20-way choice each token; GPT-scale models quote PPL because it is human-interpretable; halving CE quarters the uncertainty; when a paper reports "5.2 nats on LAMBADA", quietly convert: exp(5.2) ≈ 181 — mediocre; the only reason anyone prints raw losses is unconverted convenience; always translate for humans.`,
      },
      {
        title: "Compute MI to rank fraud features.",
        body: `Features: amount (0.31 bits), hour (0.18), country (0.42), merchant_category (0.05 — useless, drop). MI with label ≫ 0 indicates signal with any functional form (not correlation); country wins despite weird joint distribution — MI caught it where Pearson = 0.02; combine with conditional MI: MI(merchant|country) ≈ 0.01 — redundant; drop merchant entirely; final 3-feature model matches 6-feature logistic AUC; 40% fewer features, same fraud recall — the metric did the selection.`,
      },
      {
        title: "Decompose validation loss into entropy + KL.",
        body: `Empirical H(p) on 10k labels ≈ 1.03 bits (irreducible noise — humans disagree on ~18% of these labels); model CE 1.58 bits → D_KL(p||q) = 0.55 bits of pure model inadequacy; gap analysis: per-class — class 3 contributes 1.9 bits, others 1.1-1.4 — fix class 3 with more data or hierarchy; this decomposition tells you whether errors are annotation noise (irreducible) or model failure (actionable) — the single most actionable diagnostic under-used in applied ML.`,
      },
    ],
    exam: [
      {
        question:
          "Why do we minimize cross-entropy instead of KL divergence directly in classification?",
        answer:
          'They differ by H(p) — the entropy of the empirical distribution, a constant w.r.t. θ; argmin CE = argmin KL; we use CE because it is computable from samples without knowing p\'s true density — the equivalence is what makes training simply "minimize negative log-likelihood" with no extra machinery.',
      },
      {
        question: "What does perplexity of a language model actually measure?",
        answer:
          "exp(cross-entropy) — the effective branching factor per token; ppl=20 ⇒ as uncertain as uniform choice among 20 continuations; it is CE in human terms; decreasing ppl tracks better language modeling — multiplicative uncertainty, not additive error.",
      },
      {
        question:
          "Why is KL asymmetry a modeling decision rather than a technicality?",
        answer:
          "Direction chooses which errors are punished: forward KL forces q to place mass everywhere p does (no missing regions — blurrier outputs); reverse KL lets q ignore regions it cannot match (mode collapse, sharper outputs); generative families are literally selected by which KL you tolerate — GANs ≈ reverse, VAEs ≈ forward-ish; picking knowingly is the craft.",
      },
      {
        question:
          "What does mutual information add over Pearson correlation for feature selection?",
        answer:
          "It detects any functional dependence — quadratic, periodic, XOR — where correlation sits at zero; MI ranks features by explanatory content regardless of form; coupling with conditional MI removes redundants; correlation remains for linear sanity, MI for truth.",
      },
    ],
    cheat: [
      "H(X) = −Σ p log p; max at uniform; 0 at deterministic.",
      "CE = −Σ p log q = H(p) + D_KL(p||q); MLE = argmin CE.",
      "Perplexity = exp(CE); bits → nats divide by ln 2.",
      "KL ≥ 0; asymmetric; direction selects failure mode in generative models.",
      "I(X;Y) = H(Y) − H(Y|X); 0 ⇔ independent; beats correlation.",
      "CE − H = model gap; compare to label noise floor.",
      "MDL: model = shortest description + residual; KL is the complexity toll.",
    ],
    recap: `Information theory is the metrology of surprise: entropy for uncertainty, cross-entropy as the loss we already minimize (a.k.a. MLE), KL as the directed gap between truth and prediction, mutual information as label-relevant content blind to linearity, and perplexity as CE wearing human units — deep learning is compression under KL, and knowing the units turns every training curve into an instrument reading.`,
    code: {
      title: "Binary cross-entropy by hand",
      language: "python",
      code: `loss = -(y * np.log(p + 1e-12) + (1 - y) * np.log(1 - p + 1e-12)).mean()`,
      explanation:
        "Fifteen characters of entropy doing what every neural framework calls BCELoss — the most consequential formula in the repo is this one.",
    },
    diagram: {
      title: "Loss decomposition",
      caption: "Empirical entropy + model KL.",
      mermaid: `flowchart LR\n H[H of labels] --> L[CE loss]\n K[KL gap] --> L`,
    },
  },
};

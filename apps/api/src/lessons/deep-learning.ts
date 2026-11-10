import type { TopicLesson } from "../topicLessons.js"; /** * Deep Learning — 10 authored topic lessons. * * Standalone chapters per topic. Subject-first prose, foundations, core * concepts, worked examples, exam practice, cheat sheet, recap. No shared * templates, no runtime composition. */
export const deepLearning: Record<string, TopicLesson> = {
  "ai-ml-deep-learning-neural-network-fundamentals": {
    intro: `Neural networks are function approximators built from stacked differentiable layers — the foundation of every modern AI system. The subject is the complete mechanics: perceptrons, activations, losses, forward pass, backpropagation, initialization, and the training loop — explained from the math up so you understand why deep learning works, not as folklore. a neural network is matrix multiplies interleaved with nonlinearities, trained by the chain rule.`,
    foundations: `Perceptron/neuron: y = σ(Σwᵢxᵢ + b); layers stack: input → hidden → output; depth enables hierarchical feature learning; width = capacity. Activations: sigmoid (0,1), tanh (−1,1), ReLU max(0,x) (default, fast, sparse gradients), Leaky ReLU/GELU (smooth), softmax for multi-class probabilities. Loss: MSE regression, cross-entropy classification (MLE), BCE binary, hinge for SVM-ish. Backprop: chain rule from loss to every weight — ∂L/∂W = ∂L/∂out · ∂out/∂W; autodiff frameworks implement this; optimizer (SGD/AdamW) applies updates. Init: Xavier/Glorot (fan-in), He/Kaiming for ReLU (fan-in×2 preserved variance).`,
    concepts: [
      {
        title: "The forward pass: tensor shapes everywhere.",
        body: `Input batch X (B, D); layer W (D, H), b (H): Z = XW + b (B,H) — broadcast b across batch; A = activation(Z); layer 2 W2 (H, C): logits = A W2 (B,C); probs = softmax(logits, dim=-1); loss = CE(probs, y). Every shape error teaches you something: (B,D)×(H,C) needs W (D→H) — the inner dims must match. Debugging ritual: print shapes at each line of a new architecture — ten prints beat an hour of NaN hunting; define input/output contracts in code comments; frameworks will not save you from semantic shape drift (transposing batch and features by accident preserves dim match but breaks learning silently).`,
      },
      {
        title: "Activations: why nonlinearity is everything.",
        body: `Without nonlinearities, stacked linear layers collapse to one linear map — depth buys nothing; nonlinearity creates piecewise-curved decision boundaries. ReLU pros: non-saturating (gradients don\'t die for positive inputs), computationally free, sparsity (dead zeros); cons: dead neurons (negative inputs → zero gradient forever — LeakyReLU fixes with small slope). Sigmoid/tanh for outputs with probabilistic meaning or (rarely) internal use — vanishing gradients for z ≫ 0; GELU/Swish: smooth nonmonotonicity, better optimization landscapes, default in transformers; softmax output probabilities for classification; never softmax + MSE for multi-class — use cross-entropy always.`,
      },
      {
        title: "Losses: what the network minimizes is what it becomes.",
        body: `Cross-entropy: −Σy log p — confident wrongness punished hard (p=0.01 → loss 4.6), smooth probability estimate, the classification default; MSE: squared error — regression, sensitive to outliers (huber/MAE for robustness); BCE: binary log-loss elementwise; hinge: max-margin — sparse solutions, no probabilities; KL for distilling teacher→student distributions; label smoothing softens one-hot targets (ε=0.1) — less overconfidence, better calibration, standard in vision and translation; loss defines the goal — when model misbehaves, first check you optimized what you actually wanted.`,
      },
      {
        title: "Backpropagation: the chain rule, mechanized.",
        body: `Forward caches activations; backward computes adjoints: δ = ∂L/∂Z; for Z = A@W + b: ∂L/∂W = Aᵀ⊗δ, ∂L/∂A = δWᵀ; through activation: multiply by φ\'(Z) elementwise; autodiff traverses the DAG backward, accumulating grads — efficiency from sharing common subexpressions, memory from storing activations (gradient checkpointing trades recompute for memory — essential on transformers); float32 vs mixed precision: gradients in fp16 need loss scaling; instabilities usually trace to bad init (exploding squares of weights) or bad LR — clip gradients, set seed.`,
      },
      {
        title: "Initialization: the first brick decides the building.",
        body: `Random init: weights must have variance preserving forward/back pass signal. Xavier (Glorot): N(0, √(2/(fan_in+fan_out))) for tanh/sigmoid — keeps variance ≈1 through symmetric linear layers. He/Kaiming: √(2/fan_in) for ReLU (non-symmetric clipping halves variance — compensate ×2). Wrong init: too small → signal decays to 0 in deep nets (vanishing) — no learning; too big → exploding activations → NaN by batch 2; zero init — symmetry problem (all neurons identical, gradients identical — break with randomness); pre-trained init beats both when available — always start from a checkpoint for practical problems.`,
      },
    ],
    worked: [
      {
        title: "Derive backprop through a 2-layer net by hand.",
        body: `y = σ(W2 φ(W1 x + b1) + b2), L = CE(y, t). Backward: δ2 = y − t (softmax+CE combo), ∂L/∂W2 = a†δ2ᵀ, ∂L/∂b2 = δ2ᵀ, δ1 = (W2ᵀδ2) ⊙ φ\'(z1), ∂L/∂W1 = xᵀδ1ᵀ/xδ1… — writing it once by hand teaches more than a month of framework usage; after this, exploding gradients are diagnosable lines, not mysteries; PyTorch mirrors exactly these steps in autograd but the chains must be visible in your mind.`,
      },
      {
        title: "Fix a dead network by changing init, not architecture.",
        body: `12-layer MLP trained: loss stuck at 2.3 (ln 10 ≈ uniform). Check: He init applied? No — default PyTorch nn.Linear uses kaiming_uniform(a=√5) — acceptable, but activation was sigmoid! Xavier would suit tanh better; switch to tanh + Xavier → loss 1.1 in 200 epochs; the actual bug: sigmoid saturation in every hidden layer; init did not matter until the activation matched its design scale — architecture and init are one conversation, not two checkboxes.`,
      },
      {
        title: "Tune LR from the loss curve, not from vibes.",
        body: `Three attempts: 1e-1 diverges by step 300; 1e-4 crawls, val stuck at 68%; 3e-3 smooth, val 84% after 40 epochs. Method: LR range test (ramp LR from 1e-7 to 1e0, plot loss, pick LR at steepest descent slope ~1/3 of max stable) — two minutes, defensible answer; the ritual: LR sweep > guess every time; the curve told you before the metrics did; publish this plot with experiments to reviewers.`,
      },
    ],
    exam: [
      {
        question:
          "Why does the chain rule make backprop O(layers × parameters) instead of exponential?",
        answer:
          "It reuses intermediate gradients (adjoints) — each layer's gradient computes from the next layer's adjoint, never recomputing shared subgraphs; total work is a constant multiple of forward cost; exponential or worse would make anything deep impossible — the dynamic programming nature of reverse-mode autodiff is backprop's entire genius.",
      },
      {
        question: "Why does ReLU dominate sigmoid and tanh in hidden layers?",
        answer:
          "Its gradient is 1 for positive inputs — no vanishing for the active path; it is free to compute; and it sparsifies activations; sigmoid/tanh saturate both sides (gradients →0), halting learning beyond a few layers; keep sigmoid only at probability outputs where its (0,1) semantics are needed.",
      },
      {
        question:
          "What does CE loss gradient being (p − y) imply for training dynamics?",
        answer:
          "Gradient magnitude is proportional to prediction error — far-wrong examples produce big corrections, nearly-right examples nudge gently; this self-scaling behavior gives linear regression-like stability near the optimum and swift escape elsewhere; hinge lacks the probabilistic scaling, MSE lacks the geometry — CE is the principled default.",
      },
      {
        question:
          "Why can't you initialize all weights to zero and hope symmetry breaks?",
        answer:
          "It never breaks — identical weights mean identical activations and identical gradients for every neuron in a layer; the network stays rank-1 forever, learning one direction; randomness in init is the broken-symmetry mechanism; bias alone with shared weights also fails — both random.",
      },
    ],
    cheat: [
      "Shapes: (B,D)@W(D,H)→(B,H); print on first run; assert in tests.",
      "Activations: ReLU default; GELU for transformers; sigmoid for probabilities.",
      "Loss: CE classification; MSE regression; BCE binary; smooth one-hots with label smoothing.",
      "Init: He for ReLU, Xavier for tanh/sigmoid; or start from checkpoint.",
      "Backprop = reverse chain rule; autodiff does it; you read shapes.",
      "Node LR via range test; clip gradients when loss spikes.",
    ],
    recap: `Neural networks are trainable compositions of linear maps and nonlinearities: forward pass is batched matrix algebra, activations decide landscape quality, cross-entropy turns errors into scaled gradients, backprop is the chain rule mechanized by autodiff, and He/Xavier initialization plus LR discipline decide whether you learn — the fundamentals under every transformer, CNN and diffusion model you will ever touch.`,
    code: {
      title: "Training step skeleton",
      language: "python",
      code: `opt.zero_grad()\nloss = criterion(model(x), y)\nloss.backward()\nopt.step()`,
      explanation:
        "The four lines every deep learning career is built on — forward, backward, update, repeat; everything else is bookkeeping around this heartbeat.",
    },
    diagram: {
      title: "Network anatomy",
      caption: "Layers compose maps; backprop trains them.",
      mermaid: `flowchart LR\n X[Input] --> H[Hidden layers]\n H --> O[Output]\n O --> L[Loss and backprop]`,
    },
  },
  "ai-ml-deep-learning-pytorch": {
    intro: `PyTorch is the de facto research-to-production framework of deep learning — dynamic graphs, tensors on GPU, and a Python-native API that invites experimentation. The subject is the working knowledge: tensors, autograd, nn.Module design, datasets and loaders, training loops, checkpointing, and GPU efficiency — everything needed to train real models well. PyTorch is NumPy with gradients, devices, and a training ecosystem.`,
    foundations: `Tensors: n-D arrays with dtype+device (cpu/cuda/mps); creation ops, indexing, reshaping (view vs reshape vs contiguous), broadcasting identical to NumPy; requires_grad=True marks autograd tracking; operations build a dynamic graph. Autograd: loss.backward() populates .grad on leaves; torch.no_grad() for eval; gradient accumulation for small batch emulation; mixed precision via torch.autocast + GradScaler. nn.Module: subclasses with __init__ (create layers) and forward (compute flow); parameters registered via nn.Linear etc.; .to(device) moves modules; DataLoader: Dataset (map-style __getitem__ or iterable) + collate; training loop: forward, loss, backward, step — .zero_grad(set_to_none=True) every iteration.`,
    concepts: [
      {
        title: "Tensors: devices, views, and the in-place tax.",
        body: `Storage vs tensor views: slicing shares memory — .view requires contiguous (reshape or .contiguous() first); .item() syncs GPU→CPU (expensive in hot loops — accumulate on GPU, sync once); dtype discipline: float32 default, float16/bf16 for speed via autocast; device dance: model = model.to('cuda'), batch = batch.to('cuda', non_blocking=True) with pin_memory=True DataLoaders for host→device overlap; in-place ops (add_) break autograd version counts — use out-of-place in graphs; torch.compile (2.x) fuses kernels for 20-40% speedups with one line on compatible models.`,
      },
      {
        title: "nn.Module design patterns.",
        body: `Compose small modules: class Block(nn.Module): __init__ builds sublayers; forward chains them — hierarchies mirror architecture diagrams exactly; parameters() iterates all leaves for optimizers; buffers via register_buffer for non-param state (BatchNorm running stats); hooks (forward_hook/backward_hook) for debugging activations without touching forward; save: state_dict() (portable, weights only) vs full pickle (includes class path — brittle across refactors); load with map_location for CPU-on-CUDA-trained checkpoints.`,
      },
      {
        title: "Datasets and loaders: the throughput backbone.",
        body: `Dataset map-style: __len__, __getitem__(i) returning (x, y) — lazy loading, random access; transform pipeline in __getitem__ (augmentation on the fly); IterableDataset for streams (shards, tar files); DataLoader: num_workers>0 parallel loading (CPU cores), pin_memory for DMA, persistent_workers on long epochs, prefetch_factor; collate_fn for variable shapes (padding) or domain batching (detection); sampler: DistributedSampler for DDP, weighted sampler for imbalance; measure data throughput vs GPU consumption — input starvation wastes hardware silently (GPU util < 60% = data problem usually).`,
      },
      {
        title: "The training loop, hardened.",
        body: `Canonical loop: for epoch: model.train(); for batch: x,y = next(loader); x,y to device; with autocast(): logits = model(x); loss = criterion; scaler.scale(loss).backward() for fp16; clip_grad_norm_ before optimizer; scaler.step(opt); scaler.update(); opt.zero_grad(set_to_none=True); validation loop under torch.no_grad() and model.eval() (dropout off, BN frozen); scheduler.step() per epoch or per batch; logging every N steps (loss, lr, throughput, GPU mem); checkpoint best-val AND last (crash recovery); resume: load both state_dicts + scheduler + scaler + RNG state.`,
      },
      {
        title: "Performance playbook: from laptop to cluster.",
        body: `Profile first: torch.profiler or PyTorch Lightning bolts — find data wait vs kernel time; quick wins: fused ops (torch.compile, FlashAttention via SDPA backend), channels_last memory format for convs, mixed precision everywhere, bigger batches with gradient accumulation, dataloader workers tuned, bf16 over fp16 on Ampere+ (no loss scaling needed); DDP: torchrun --nproc_per_node=8, gradient sync amortized via bucket size; FSDP for giant models; torch.compile FX graphs for exotic speed; measure tokens/sec as the north star metric; never tune blind — profile, patch one thing, measure again.`,
      },
    ],
    worked: [
      {
        title: "Speedrun a CIFAR trainer from 55% to 75% top-1.",
        body: `Baseline: vanilla CNN, batch 64, SGD — 55%, 8 min/epoch. Fix ladder by profile: data augmentation added (random crop/flip — free 6 points); AMP enabled (epochs 1.9x faster, -0% accuracy); ResNet-18 swapped (72%); cosine LR + 200 epochs (74.5%); EMA of weights (75.1%); total engineering 3 hours vs days of architecture search games; the craft list is boring by design — augment, AMP, known-good blocks, schedule, EMA; novelty last.`,
      },
      {
        title: "Debug a silently-wrong loss plot.",
        body: `Loss decreasing, accuracy constant at 10%. Diagnostics: logits printed — all identical per batch (weights frozen? No); labels dtype: float (not long) — F.cross_entropy with float target... silently accepted as soft targets interpreted per-row norm=1 required — actually it ran loss vs wrong target distribution (uniform-ish); correct: y = y.long(); accuracy 81%; the bug printed no error, gradient accepted everything; lesson: assert dtypes explicitly in loop debug — Python silently coerces where C would explode; assertions are free, hours of this are not.`,
      },
      {
        title: "Ship a checkpoint that survives refactors.",
        body: `Model class renamed, checkpoint unpicklable — production incident at 2 AM. Fix protocol: only state_dict saved, never pickles of modules; config.json with architecture dims + activation; inference code reconstructs module from config then loads weights — refactor-proof forever; map_location='cpu' in loader for cross-device portability; hash weights for integrity; the pattern: (config, state_dict) = the model — an appliance, not a class path.`,
      },
    ],
    exam: [
      {
        question:
          "Why must you call model.eval() before validation and model.train() before resuming?",
        answer:
          "Layers with training-vs-eval behavior — Dropout (drops during train, identity during eval) and BatchNorm (batch stats train, running stats eval); leaving train() mode during eval randomizes predictions and corrupts BN stats — validation numbers become lottery tickets instead of measurements.",
      },
      {
        question:
          "What does gradient accumulation simulate and what breaks naively?",
        answer:
          "Larger effective batch (more stable gradients) by summing gradients over N micro-batches before stepping — enables big-batch training on small GPUs; the batch statistics in BN differ from true big-batch runs (accumulate locally, normalize per micro-batch — mismatch); use GroupNorm/accumulate-aware BN or accept BN shift; also scale loss by 1/N to keep LR comparable.",
      },
      {
        question: "Why pin_memory on DataLoader plus non_blocking on .to()?",
        answer:
          "Pinned host pages allow DMA straight into VRAM bypassing pageable staging — non_blocking overlaps transfer with compute; without both, every batch stalls the host waiting for copies; on big models the delta is 10-20% throughput for two keyword arguments — always set both.",
      },
      {
        question:
          "What does set_to_none=True in zero_grad buy and why it is default now?",
        answer:
          "It sets gradients to None instead of zeroing tensors — skips the memset entirely, unblocks fused backward kernels, and surfaces accidental-double-backward bugs loudly (they crash on missing grad); free throughput and sharper semantics — the default exists because the opt-out lost.",
      },
    ],
    cheat: [
      "Tensors: device + dtype explicit; .item() sparingly; views share memory.",
      "Dataset/DataLoader: workers>0, pin_memory, persistent_workers; transforms in __getitem__.",
      "train()/eval() around loops; no_grad for val; EMA for smooth weights.",
      "AMP with autocast+GradScaler (fp16) or bf16 on Ampere+.",
      "state_dict + config = portable artifact; map_location always.",
      "Profile before tuning: data wait vs kernel time; AMP/compile/fused ops first.",
    ],
    recap: `PyTorch mastery is fluency in tensor mechanics and the training loop: tensors with explicit device/dtype, autograd via backward, nn.Module composability, DataLoader throughput discipline, mixed precision and compile-level speed, checkpoint portability — the delta between a notebook demo and a model your org deploys is exactly these habits.`,
    code: {
      title: "Canonical training loop",
      language: "python",
      code: `for x, y in loader:\n x, y = x.cuda(), y.cuda()\n logits = model(x)\n loss = F.cross_entropy(logits, y)\n opt.zero_grad(set_to_none=True)\n loss.backward()\n opt.step()`,
      explanation:
        "Four lines of physics wrapped in device hygiene; memorize it, extend it with AMP and schedulers, and every model you own becomes trainable.",
    },
    diagram: {
      title: "PyTorch workflow",
      caption: "Data to gradient to weights.",
      mermaid: `flowchart LR\n D[Dataset] --> L[Loader]\n L --> F[Forward]\n F --> B[Backward]\n B --> U[Update]`,
    },
  },
  "ai-ml-deep-learning-tensorflow-and-keras": {
    intro: `TensorFlow and Keras are Google\'s mature deep learning stack — graph-mode efficiency, tf.data pipelines, and the concise Keras Model API that turned deep learning from research code into industry standard. The subject is the working layer: tensors and graphs, tf.data at scale, Keras models (functional, sequential, subclassing), callbacks, and serving saved models. Keras is the interface everyone reaches for; TensorFlow is the engine underneath it.`,
    foundations: `tf.Tensor vs np.array: immutable, typed, on GPU/TPU; eager execution by default (v2); tf.function compiles Python to graph (speed, serializability) — input signatures. Keras API levels: Sequential (linear stack), Functional (graph of layers, multi-input/output), subclassed Model (max flexibility). tf.data: Dataset from tensors/generators/TFRecord; pipeline: map (parallelized), batch, prefetch, AUTOTUNE, cache; features: shuffle buffers, interleave for parallel file reads. Training: model.fit with callbacks (EarlyStopping, ModelCheckpoint, ReduceLROnPlateau, TensorBoard); saved in SavedModel format — portable, servable by TF Serving.`,
    concepts: [
      {
        title: "tf.data: the input pipeline that keeps TPUs fed.",
        body: `Chain: dataset.shuffle(buffer) .map(preprocess, num_parallel_calls=AUTOTUNE) .batch(bs, drop_remainder=True) .prefetch(AUTOTUNE) — always prefetch; cache decoded tensors when RAM allows (violation = 3x GPU starvation); TFRecords for sharded giant corpora; interleave for parallel file readers; avoid Python loops per sample (converts eager overhead); verify: steps_per_second vs theoretical — if dataloader-bound, fix pipeline before touching model; the input pipeline is where most TF projects leave 30% of throughput on the table.`,
      },
      {
        title: "Keras API levels: pick your abstraction altitude.",
        body: `Sequential: one line per layer, zero flexibility — prototyping and teaching. Functional: Model(inputs, outputs) via layer calls — multi-branch (Siamese nets, two-tower recommenders), shared weights (same layer called twice), most production networks; Model subclassing: __init__ define layers, call() compute — dynamic graphs, ragged shapes, research flex; trade: subclassing sacrifices serialization magic (save weights + code, not .h5-friendly full models) — prefer functional for maintainable deployables; the rule: highest abstraction that still expresses the architecture honestly.`,
      },
      {
        title: "Keras 3 and the multi-framework world.",
        body: `Keras 3 (2023+): backend-agnostic — same code runs on TF, JAX, or PyTorch backends; pip install keras[tensorflow|jax|torch] picks; benefits: write once, scale across accelerators without rewrite; TF Keras legacies converging; choose Keras 3 for new projects needing portability; tf.function still relevant where TF owns deployment; PyTorch Lightning equivalent for the TF ecosystem: Keras Model.fit custom train_step for unusual loops (custom metrics, sample weighting, GAN-ish alternating steps).`,
      },
      {
        title: "Callbacks: the behavior layer of fit().",
        body: `EarlyStopping(patience=N, restore_best_weights=True) — non-negotiable; ModelCheckpoint(filepath, save_best_only, monitor=\'val_loss\'); ReduceLROnPlateau(factor=0.5, patience=3) — gentle LR drops versus schedule alternatives; TensorBoard for scalars/histograms/graph; CSVLogger for cheap persistence; custom Callback for budget-stopping (max wall-clock) or experiment metadata; naïve mistake: no early stopping — TF\'s defaults favor full epochs; always set restore_best_weights and patience tuned to your val noise floor; callbacks compose — stack them without limit.`,
      },
      {
        title: "Serving and mobile deployment.",
        body: `SavedModel export → TF Serving (Docker, REST/gRPC, batching, GPU); or convert to TFLite for mobile/edge (quantization float16/int8, pruning — mobile nets); TF.js for browser; Keras 3 to jax for TPU research; TF Serving adds: model versioning, A/B routing, request batching, Prometheus metrics — the production path Google actually runs; for lighter paths: Flask/FastAPI wrapping keras model call is fine until it isn\'t (batching lost); the point: Keras artifacts scale from laptop to TPU pod without rewrites — that is its whole reason to exist.`,
      },
    ],
    worked: [
      {
        title: "Pipeline tuning wins 4x throughput on a ResNet job.",
        body: `Symptom: GPU util 24%. Profile: input map() called Python function with cv2 decode per sample. Fix: tf.py_function → numpy ops vectorized → moved to TFRecord cache after first epoch; AUTOTUNE everywhere; prefetch; interleave file reads; GPU util 88%; epoch 74s→21s; identical model code — the bottleneck was never the network; the lesson: change the input pipeline before the architecture, every time.`,
      },
      {
        title: "EarlyStopping recovers a 200-epoch collapse.",
        body: `Model trains, val loss bottoms at 0.31 epoch 38, keeps "improving" train to 0.05 by epoch 200. Fix: EarlyStopping(patience=15, restore_best_weights=True, monitor=\'val_loss\') → training stops epoch 53, restores epoch 38 weights — 149 wasted epochs reclaimed, model better — this ten-line callback is the cheapest generalization instrument in the whole library; every serious fit() has it; no exceptions.`,
      },
      {
        title: "Same model, two backends, one JAX speedup.",
        body: `Functional-API Keras model on TF-CPU slow on 200k samples; Keras 3 config switch backend to jax; TPU/XLA fusion activates; training 9x on the same machine; code diff: environment variable + import change; the model math identical — backend portability is the Keras 3 value proposition in one afternoon; port your research graphs painlessly, measure the delta, tell the world.`,
      },
    ],
    exam: [
      {
        question:
          "Why does prefetching matter more than fancy model code in most TF projects?",
        answer:
          "GPUs idle waiting on input pipelines — prefetch overlaps decode/batch/transfer with compute; without it, theoretical FLOPS are fiction; the entire marginal gain from a new layer can be lost to a .map() call — data throughput governs everything downstream.",
      },
      {
        question:
          "What is the Functional API's superpower that Sequential cannot express?",
        answer:
          "Non-linear architectures — multiple inputs, multiple outputs, shared layers called repeatedly, skip/residual connections, branch fusion; graphs of layers rather than lists; most modern production architectures are DAGs, and Functional draws DAGs natively.",
      },
      {
        question: "What exactly does tf.function compile and when must it?",
        answer:
          "Python callables into static graphs — folding shapes and tracing actual TF ops — enabling fusion, XLA, and saved-model export; required for TPU training and efficient serving; eager is for prototyping; functional compiled hot loops for scale; input_signatures stabilize traces.",
      },
      {
        question:
          "Why is restore_best_weights the moral minimum for EarlyStopping?",
        answer:
          "Training continues past the val optimum, overfitting deliberately — restoring best weights returns the model to the generalizable point, not the terminal overfit checkpoint; without it you keep the loser and reject the winner — the single most common silent config bug in Keras projects.",
      },
    ],
    cheat: [
      "tf.data: map+batch+prefetch with AUTOTUNE; cache decoded data; TFRecords for scale.",
      "Functional API for DAGs; Sequential for toys; subclass for research.",
      "Callbacks: EarlyStopping(restore_best_weights), Checkpoint, ReduceLROnPlateau.",
      "Keras 3: same code, backend = tensorflow|jax|torch; portability is real.",
      "SavedModel → TF Serving/TFLite/TF.js — write once, deploy anywhere.",
      "Profile dataloader vs GPU first — the bottleneck hides in the pipe.",
    ],
    recap: `TensorFlow + Keras is industrial deep learning: tf.data pipelines feeding accelerators, Keras API at three altitudes (Sequential/Functional/subclassed Keras 3), callbacks enforcing discipline (early stop, best restore), and a serving path from laptop to TPU through SavedModel — master the input pipeline and the callbacks and the rest is configuration.`,
    code: {
      title: "Canonical data pipeline",
      language: "python",
      code: `ds = tf.data.Dataset.from_tensor_slices((x, y)).shuffle(len(x)).batch(64, drop_remainder=True).prefetch(tf.data.AUTOTUNE)`,
      explanation:
        "Shuffle-batch-prefetch — the trinity; without prefetch, even perfect models starve; with it, accelerators hum.",
    },
    diagram: {
      title: "Keras levels",
      caption: "Pick abstraction by architecture shape.",
      mermaid: `flowchart TD\n S[Sequential] --> F[Functional]\n F --> M[Subclassed model]`,
    },
  },
  "ai-ml-deep-learning-cnns-and-computer-vision": {
    intro: `Convolutional neural networks invented the visual era — from ImageNet to medical imaging to autonomous systems. The subject is the convolution mechanics, pooling, architectures (LeNet → ResNet → modern hybrids), and the training disciplines (augmentation, transfer learning, detection and segmentation heads). CNNs learn local feature hierarchies by sliding learned filters over space — translation equivariance is their superpower.`,
    foundations: `Convolution: kernel (3×3 typical) slides over input; each position computes dot product + bias → activation map; channels: input C_in, filters produce C_out; parameter count independent of input size (unlike dense); weight sharing everywhere. Pooling: max-pool halves spatial dims, doubles effective receptive field; stride matters more than pool in modern nets. Architectures: stacks of conv+activation blocks; residual connections (y = F(x) + x) enable 100+ layers; normalization (BatchNorm) stabilizes; modern: ResNet/EfficientNet families, ConvNeXt/Vision Transformer hybrids for SOTA. Receptive field grows exponentially with depth; spatial vs channel mixing alternates.`,
    concepts: [
      {
        title: "Convolution: filters, channels, and receptive fields.",
        body: `Kernel W shape (C_out, C_in, kH, kW); stride/padding trade resolution for compute — padding=’same’ keeps dims (until downsampling via stride/pool); dilation expands kernel footprint without params — long-range context cheap; 1×1 convs: channel mixing + bottlenecking; depthwise separable convs (MobileNet) factor spatial vs channel work — 8-9x cheaper; feature hierarchy: edges → textures → parts → objects; early layers universal, late layers task-specific — the empirical backbone of transfer learning; checkerboard artifacts from deconv — use resize+conv instead for upsampling.`,
      },
      {
        title: "Residual learning: the depth enabler.",
        body: `Plain deep nets degrade (degradation problem, not overfitting); residual: H(x) = F(x) + x — gradients flow via identity path unimpeded; network learns residual correction rather than full mapping; 152-layer ResNet smashed SOTA in 2015; every modern architecture inherits it: shortcuts (optionally 1×1 projection for shape match), bottlenecks (1×1→3×3→1×1 fourfold compute reduction in ResNet50 vs plain); attention variants bolt on top; rule: depth beyond ~20 layers requires residual connections or normalization gymnastics.`,
      },
      {
        title: "Training CNNs: augmentation, schedules, transfer.",
        body: `Augmentation is the #1 driver: random resized crop, horizontal flip, color jitter (brightness/contrast), RandAugment policies; Cutout/MixUp/CutMix regularize superbly; normalization per-channel (train mean/std — ImageNet constants when fine-tuning); LR schedules: warmup + cosine decay; weight init He for ReLU-family; freeze backbone early epochs when fine-tuning tiny datasets; global average pooling instead of FC at the tail (param-efficient, spatial robust); label smoothing ε=0.1 standard; EMA of weights for +0.2-0.5% free.`,
      },
      {
        title: "Transfer learning: never start from scratch.",
        body: `Pretrained on ImageNet/ImageNet-21k: strip top, add your head (linear or small MLP), train head only on small data, unfreeze top blocks progressively (discriminative LRs: head 10x backbone), always resize/crop to pretraining resolution; domain shift (medical/satellite/thermal): fine-tune more layers, smaller LR, patience; few-shot: linear probe first to measure representation quality; literature benchmarks recreate in hours with timm library; when your dataset is <100k images, from-scratch training is almost never the right answer — transfer is the default, always start there.`,
      },
      {
        title: "Detection, segmentation, and ViTs: beyond classification.",
        body: `Detection: one-stage (YOLO — grid cells predict boxes+classes, fast) vs two-stage (R-CNN family — propose then classify, accurate, slow); losses: regression on box coordinates (IoU/CIoU) + objectness + class CE; segmentation: FCN/U-Net encoder-decoder with skip connections, per-pixel CE or Dice loss; ViT: patch embeddings 16×16, transformer encoder, global self-attention — dominates at scale >100M pretraining images, mid-tier below; hybrids (ConvNeXt, MaxViT) close the gap on smaller budgets; choose by data scale and latency budget — CNNs for constrained, ViTs for scale, hybrids when in doubt.`,
      },
    ],
    worked: [
      {
        title: "Transfer-learn a 900-image defect classifier to 94%.",
        body: `From-scratch: 67% (data too small). Plan: timm efficientnet_b3 pretrained; freeze all; linear head; 8 epochs — 88%; unfreeze last two blocks, lr 1e-5, 12 epochs — 93%; add CutMix + stronger jitter + EMA — 94.1%; eval on holdout by production lighting conditions, not random splinters; the entire project: one afternoon, one GPU, zero custom architecture — transfer learning is the cheat code that separates demos from products.`,
      },
      {
        title: "Diagnose mAP drop after resolution change.",
        body: `Detector trained at 640², deployed at 320² for edge: mAP 41→27. Fix: multi-scale training (random resize per batch) + anchor boxes rescaled + NMS threshold recalibrated + test at deployment resolution in eval — recovered to 39; distribution shift includes resolution; train where you test when production is fixed-cost.`,
      },
      {
        title: "U-Net for medical segmentation with 120 images.",
        body: `Task: segment tumor in CT slices; 120 labeled scans. Encoder-decoder U-Net with pretrained ResNet34 encoder, skip connections (early fine detail preserved), Dice loss + CE combo (Dice handles imbalance), augmentation: elastic deformations + rotations ±15° + intensity jitter (HU windowing preserved), 5-fold ensemble at inference — Dice 0.91; the recipe fits in one slide; domain-specific augmentation mattered more than any architecture choice.`,
      },
    ],
    exam: [
      {
        question:
          "Why does weight sharing make CNNs parameter-efficient for images?",
        answer:
          "The same filter applies at every location — a 3×3×256 filter is 2.3k parameters regardless of image size, vs tens of millions for FC on raw pixels; the bet: local patterns (edges, textures) matter wherever they appear; translation equivariance falls out of the architecture free; generalization follows from the inductive bias.",
      },
      {
        question:
          "What problem do residual connections solve that plain deep nets cannot?",
        answer:
          "The degradation problem — deeper plain networks train worse despite equal capacity — identity shortcuts let gradients flow unattenuated and layers learn residual corrections; depth becomes a capacity dial you can actually turn past 50 layers.",
      },
      {
        question: "Why is batch normalization such a force multiplier in CNNs?",
        answer:
          "It normalizes each layer's activations to zero mean/unit variance per batch — smooths the loss landscape, allows higher LRs, reduces sensitivity to initialization, adds implicit regularization; deep training without BN spikes and plateaus; with it, hundreds of layers optimize routinely.",
      },
      {
        question:
          "Why is transfer learning the default for datasets under ~100k images?",
        answer:
          "Early layers are universal filters learned from millions of images; re-learning them from 900 images wastes your entire budget on what ImageNet already solved; fine-tuning spends your data on the task-relevant top — the achievable accuracy gap is routinely 15-30 points vs scratch.",
      },
    ],
    cheat: [
      "Convs: weight sharing, translation equivariance, channels mix at every stage.",
      "He init + BN + residual shortcuts = arbitrary-depth tractability.",
      "Augment hard; normalize per ImageNet stats; EMA weights for the win.",
      "transfer first: freeze, head train, unfreeze discriminative LRs.",
      "Detection: YOLO one-stage, Faster R-CNN two-stage; segmentation: U-Net + Dice.",
      "Resolution is train distribution — match deployment or train multi-scale.",
    ],
    recap: `CNNs learn hierarchical vision by sliding shared filters: convolution economics, residual depth, batch normalization stability, augmentation and transfer learning as the real accuracy drivers — and a design menu (ResNet/EfficientNet/ViT/U-Net) that maps data scale to architecture; when something visual must work, start from pretrained weights and never look back.`,
    code: {
      title: "Residual block",
      language: "python",
      code: `out = self.bn2(self.conv2(F.relu(self.bn1(self.conv1(x)))))\nout = out + shortcut\nreturn F.relu(out)`,
      explanation:
        "The identity shortcut is the whole trick — three lines, two convs, infinite depth unlocked.",
    },
    diagram: {
      title: "CNN hierarchy",
      caption: "Edges to objects by stacking filters.",
      mermaid: `flowchart LR\n E[Edges] --> T[Textures]\n T --> P[Parts]\n P --> O[Objects]`,
    },
  },
  "ai-ml-deep-learning-sequence-models": {
    intro: `Sequence models learn across time — RNNs, LSTMs, GRUs, and attention — the ancestors and foundations of every transformer. The subject is the full arc: recurrence mechanics, gates and memory, attention as the liberation from sequential computation, and sequence-to-sequence design. sequences demand order-aware state — and attention won by being order-aware without being sequential.`,
    foundations: `RNN: hₜ = φ(Wx hₜ₋₁ + Wh xₜ + b); same W every timestep (weight sharing over time); hidden state = compressed history; gradient vanishing through time — products of Jacobian across hundreds of steps collapse (clip helps but fundamental); LSTM: gates (forget/input/output) control cell state — additive memory path avoids product blowup; GRU: merged gating (update/reset), simpler, similar performance. Encoder-decoder: encode source → context vector → decode stepwise; attention: score encoder outputs per decode step — soft dictionary lookup; seq2seq with attention demolished MT benchmarks; transformers = attention stacks, no recurrence — but seq models explain why.`,
    concepts: [
      {
        title: "Vanilla RNNs and why they fail at length.",
        body: `hₜ = tanh(Wx hₜ₋₁ + Wh xₜ): gradient ∂L/∂hₜ flows back through hₜ₋₁...h₁ — multiplied by ∏ W (plus tanh derivatives ≤1) — exponential decay; effective memory ~10-30 timesteps for vanilla; exploding gradients the opposite for large W — clip norm 5.0 standard; teacher forcing at training (feed ground truth previous token) vs free-running inference mismatch — exposure bias; vanilla RNN remains didactic gold, production discard; still useful as tiny fast baselines on short sequences or embedded CPUs.`,
      },
      {
        title: "LSTM/GRU gates: engineered memory paths.",
        body: `LSTM: fₜ = σ(Wf·[hₜ₋₁,xₜ]) forget; iₜ = σ(Wi·[...]) input; C̃ₜ = tanh(Wc·[...]) candidate; Cₜ = fₜ⊙Cₜ₋₁ + iₜ⊙C̃ₜ — additive update, no multiplicative chain; oₜ = σ(Wo[...]) output; hₜ = oₜ⊙tanh(Cₜ). GRUs: z update, r reset, n̂ candidate — fewer params, often equal performance, faster training; forget-gate bias init +1 (remember by default) helps long horizons; LSTM for >100-step dependencies and structured audio/signal; GRU default for NLP mid-scale; bidirectional when the full sequence is available (inference quality, not generation).`,
      },
      {
        title: "Attention: calculation as lookup.",
        body: `Decode step: query q (decoder state) vs keys kᵢ (encoder outputs) — alignment scores via dot/mlp; softmax → attention weights; output = weighted sum of values vᵢ — the model reads what it needs, exactly when; encoder-decoder attention breaks the fixed bottleneck vector; Vaswani later made everything attention (no recurrence) — self-attention inside encoder/decoder; intuition: every token attends to every relevant token — O(n²) but parallel, unlike RNNs\' O(n) serial; the mechanism transfers everywhere (vision, protein, RL).`,
      },
      {
        title: "Training seq models: loss and decoding.",
        body: `Loss per token (cross-entropy, mask padding); teacher forcing fraction; beam search at inference (k=4-5) vs greedy; length penalties (α=0.6-1.0 GNMT style) to avoid short-output bias; exposure bias mitigation: scheduled sampling (mix ground truth/model outputs); evaluation: BLEU (MT), ROUGE (summarization), WER (speech) — all weak proxies; human side-by-side for final verdicts; decode deterministically for eval, sampling with temperature for creative text; log unigram overlap to catch degenerate outputs (repetition loops).`,
      },
      {
        title: "When seq models still win.",
        body: `Transformers dominate NLP, but RNNs/LSTMs thrive: streaming audio (latency — process chunk-by-chunk incrementally), time-series forecasting with strong recency prior, tiny on-device models (µC), very long sequences where O(n²) attention is infeasible (linear attention approximations aside), and hybrid Mamba/SSM architectures (selective state spaces — 2023+ renaissance) — the lineage runs unbroken: attention did not kill seq models, it absorbed them into continuous state-space generalizations.`,
      },
    ],
    worked: [
      {
        title: "Manually trace an LSTM cell through 10 steps.",
        body: `By hand: initialize C₀=0, h₀=0; x₁..x₃ sequence; Wf/Wi/Wc/Wo with chosen 2x2 matrices; compute f₁,i₁,C̃₁,C₁; h₁; repeat — the additive cell-state path becomes obvious: Cₜ survives intact when gates stay near 1; gradients to early steps arrive with magnitude ≈1; no vanishing; the exercise converts the diagram into physiology — 20 minutes that permanently erases "LSTM is magic" from your vocabulary.`,
      },
      {
        title: "Beam search fixes gibberish greedy decodes.",
        body: `MT greedy decode: 73 BLEU, degenerate phrasing on low-resource language pairs. Beam k=5 with no penalty: 78 BLEU; + length penalty α=0.8: 81, natural endings; + coverage penalty (rare as of recent studies, implement custom): fewer omissions; the model was never broken — decoding was myopic; every production seq2seq ships beam + length norm; nobody deploys greedy.`,
      },
      {
        title: "BiLSTM still beats transformer on small speech data.",
        body: `55 hours of accent-labeled speech: transformer (47M params) overfits, WER 17%; BiGRU (2 layers, 128 hidden) WER 9.4% — fewer params, better inductive bias for short windows, trains in 3 hours on one GPU; deployment on-device in 2026, no CUDA required; the lesson: architecture follows data scale — transformers are not magic, they are hungry; feed hungry models honestly or feed small ones well.`,
      },
    ],
    exam: [
      {
        question:
          "Why does the additive cell-state update in LSTM defeat vanishing gradients?",
        answer:
          "Cₜ = f⊙Cₜ₋₁ + i⊙C̃ — gradients flow backward through addition at each step with gate factors ≈1, never a chain of matrix products; contrast RNN's ∏tanh(...)·W which shrinks exponentially; the whole point of LSTM: replace multiplicative memory with controlled additive memory.",
      },
      {
        question: "What does teacher forcing buy and what does it cost?",
        answer:
          "Stable training: every step sees ground-truth history — no error compounding during learning; the cost is exposure bias — the model never practices recovering from its own mistakes; mitigations: scheduled sampling, DAgger decoding — but the trade stays; inference behavior always differs from training behavior by some epsilon.",
      },
      {
        question: "Why is attention parallelizable where RNN is not?",
        answer:
          "Attention computes all pairwise interactions simultaneously — one matrix multiply per head across the whole sequence; RNN must sequentially materialize hₜ before hₜ₊₁ — no amount of hardware removes the serial dependency; attention transforms an O(n) serial problem into O(n²) parallel ones that GPUs adore.",
      },
      {
        question:
          "When does the Mamba/selective SSM pattern beat both attention and LSTM?",
        answer:
          "Very long sequences or streaming regimes with constrained compute — linear-time state-space models with input-dependent selection keep attention-level quality at RNN-like inference cost; 2023+ benchmarks near transformers on language modeling; the RNN lineage, reborn as selective state spaces, finally competitive at scale.",
      },
    ],
    cheat: [
      "Vanilla RNN dies at ~10-30 steps; vanishing gradients via multiplicative paths.",
      "LSTM/GRU: gated additive memory; forget-bias init +1 for long horizons.",
      "Attention = soft lookup of encoder outputs by decoder queries.",
      "Beam k=4-5 + length penalty at decode; teacher forcing to train.",
      "BiLSTM for fixed seqs; unidirectional for generation; right-size to data.",
      "Linear attention and SSMs for streaming/long context — the future RNN.",
    ],
    recap: `Sequence modeling evolved from fragile recurrence to gated memory to attention — the LSTM taught machines to remember, attention taught them to look at everything at once, and the transformer cashed both checks; Know the full chain — vanishing algebra, gates, soft lookups, beam decoding — and every modern architecture becomes a remix you can read fluently.`,
    code: {
      title: "LSTM forward in pseudocode style",
      language: "python",
      code: `f, i = torch.sigmoid(W_f(x, h)), torch.sigmoid(W_i(x, h))\nc = f * c + i * torch.tanh(W_c(x, h))\nh = torch.sigmoid(W_o(x, h)) * torch.tanh(c)`,
      explanation:
        "Forget, input, output — three gates and one additive cell; transpose this shape into any seq task you own.",
    },
    diagram: {
      title: "Sequence model lineage",
      caption: "From recurrence to attention.",
      mermaid: `flowchart LR\n R[Vanilla RNN] --> L[LSTM]\n L --> A[Attention]\n A --> T[Transformer]`,
    },
  },
  "ai-ml-deep-learning-generative-models": {
    intro: `Generative models learn the data distribution itself — sampling new plausible examples instead of classifying — across GANs, VAEs, diffusion models, and autoregressive families. The subject is what they are, how they differ, and where each shines: latent variable models, adversarial training, denoising score matching, and sampling discipline. generative modeling means mastering density estimation with taste.`,
    foundations: `Taxonomy by supervision of likelihood: likelihood-based explicit (autoregressive: PixelCNN, GPT; energy-based), likelihood-approximate (VAE ELBO; flow models exact via change of variables — RealNVP/Glow), likelihood-free (GAN minimax; diffusion via score matching; ditto consistency models). VAE: encoder q(z|x), decoder p(x|z), ELBO = reconstruction − β·KL(q||prior); latent smooth → interpolations, sampling Z → X; blurry outputs typical (Gaussian likelihood). GAN: generator vs discriminator, adversarial equilibrium; mode collapse, training instability vs stunning sharpness (StyleGAN faces). Diffusion: forward noise schedule xₜ₊₁ = √α xₜ + √(1−α) ε; learn denoiser ε_θ; reverse ancestral/DDIM sampling; SoTA image quality + controllability.`,
    concepts: [
      {
        title: "The density estimation menu.",
        body: `Goal: sample x ~ p(x). Explicit likelihood: autoregressive decomposes product of conditionals — exact log p, but sequential sampling (slow); normalizing flows chain invertible maps with tractable Jacobian — exact both ways, architecture constraints annoying; VAE: lower bound on log p via amortized inference — fast sampling, blurry; GAN: implicit density, no likelihood — sharp, unstable; diffusion: implicit via score — sharp, stable, many steps; EBMs energy-based: flexible, hard to sample (MCMC). Choose family by: image fidelity (diffusion/GAN), speed sampling (VAE/flows), likelihood audits (autoregressive/flows), controllability (diffusion).`,
      },
      {
        title: "VAEs: the blur-with-purpose family.",
        body: `ELBO: E_q[log p(x|z)] − KL(q(z|x)||p(z)) — maximize; reparameterize z = μ + σ⊙ε, ε~N(0,I) — backprop through sampling; posterior collapse (decoder ignores z — KL=0) — mitigations: β-VAE (anneal KL weight), free bits, stronger decoder penalties; latent arithmetic: z_woman − z_man + z_smile experiments — semantics embed here; quality: Gaussian decoder → mean-ish outputs → soft/blurry; discrete data → cross-entropy decoder fixes; VAEs = great latents, mediocre pixels — use for representation + interpolation, not hero images.`,
      },
      {
        title: "GANs: the adversarial arms race.",
        body: `Minimax: min_G max_D E[log D(x)] + E[log(1 − D(G(z)))] — G fools D, D catches G; equilibrium at p_data = p_G. Tricks: non-saturating loss (−log D(G(z)) for G); label smoothing for D; two time-scale update rule (TTUR); spectral normalization for stability; architectures: DCGAN, StyleGAN (mapping network + AdaIN — disentangled style control), StyleGAN2/3 refinements, BigGAN for class control; pathologies: mode collapse (G finds one good mode), discriminator dominating (D perfect → G gradient zero), checkerboard artifacts; mitigations: minibatch discrimination, unrolled GANs, hinge loss; images at photorealism but faith weak — audit diversity always.`,
      },
      {
        title: "Diffusion: noise in, data out.",
        body: `Forward: add Gaussian noise T steps (linear/cosine schedule) until x_T ≈ N(0,I); reverse: learn ε_θ(x_t, t) to denoise one step; training loss simple L2 on ε; sampling: walk T=20-1000 steps reverse — DDIM/ODE shortcuts cut 50x; guidance: classifier-free guidance (train with dropped labels, scale s>1 at sampling) — control and quality boost; U-Net with time embedding + attention; latent diffusion (Stable Diffusion): diffuse in VAE latent space, 4-8x cheaper; inpainting/ControlNet/img2img all fall out of the same math; diffusion won images, video, 3D, and molecule design — boringly stable to train, devastatingly good.`,
      },
      {
        title: "Evaluation of generative models — the hard problem.",
        body: `Images: FID (feature distances Inception — lower better, correlates with quality), IS (classifiers confidence — weak alone), precision/recall (quality vs diversity split), CLIP-score (alignment to text), human side-by-side for truth; text: perplexity, MAUVE, human eval; music: metrics unreliable — humans decide; safety: memorization checks (regurgitation rate — diffusion/GAN copying training samples); mode coverage: FID alone rewards averages — always measure diversity too; generated content disclosure (watermarks/credentials); generative eval is vibes + stats — budget human raters or distrust all automated numbers.`,
      },
    ],
    worked: [
      {
        title: "Fix posterior collapse in a VAE in one evening.",
        body: `Training CIFAR-10 VAE: recon loss 2.9, KL ≈ 0.001 — decoder ignoring z. Fix: β annealing 0→1 over 20 epochs + skip connections from latent into decoder layers + free bits λ=0.5 nats per dimension — recon 1.8, KL 8.4, samples diverse and structured; the collapse was not an inevitability; every lever exists for a reason; the tutorial you read just didn\'t mention them.`,
      },
      {
        title: "Re-scaffold a GAN that mode-collapsed on faces.",
        body: `D too strong early → G stuck at one face. Pipeline: weaken D for first 10k iters (label smoothing 0.9), TTUR (G lr 1e-4, D lr 2e-5 — asymmetric), minibatch discrimination on, hinge loss everywhere, z-truncation trick at inference (ψ=0.7) for FID gains — faces diversify across the manifold; FID 28→12; the failure was training dynamics, not capacity; reading D\'s loss curves correctly is the GAN skill that separates survivors.`,
      },
      {
        title: "Inference at 6 steps with DDIM vs 1000 ancestral.",
        body: `Latent diffusion image generation: ancestral 1000 steps = 45 s/image; DDIM η=0 (deterministic ODE path) 20 steps = 1.1 s at near-identical FID; classifier-free guidance s=7.5 → crisp outputs; the sampling algorithm is an engineering dial — quality per second is a choice, and production always picks the ODE cousin; honesty in reporting: show both quality and wall-clock, or your benchmark is incomplete.`,
      },
    ],
    exam: [
      {
        question:
          "Why do VAEs produce blurry images and GANs sharp ones — fundamentally?",
        answer:
          "VAEs use Gaussian decoders — the MSE optimum is the conditional mean, which blurs multi-modal detail; GANs train against a discriminator that punishes any unrealistic pixel — the only safe way to fool it is realistic texture; the loss families decide the aesthetics, not the architectures.",
      },
      {
        question: "What is posterior collapse and which knob fixes it first?",
        answer:
          "The decoder learns to ignore the latent (KL term → 0) because pixel reconstruction dominates early; beta-annealing the KL weight upward and/or free-bits (minimum KL per dimension) restore information flow; checking KL during the run is the canyouseeitnow moment for spotting it cheaply.",
      },
      {
        question:
          "Why did diffusion models displace GANs for open-ended generation?",
        answer:
          "Training stability (no minimax delicacy), mode coverage (no collapse), scalable conditioning (classifier-free guidance) — at the cost of sampling speed, now amortized away by DDIM/flow matching — diffusion won by being robust, not just by being clever.",
      },
      {
        question: "What does FID actually measure and what does it miss?",
        answer:
          "Fréchet distance between Gaussian fits of Inception feature distributions — captures global quality/consistency decently — but misses semantic correctness, diversity splits (use precision/recall for that), and text alignment (CLIP-score); never ship on FID alone; it is a dial, not a verdict.",
      },
    ],
    cheat: [
      "Likelihoods: autoregressive exact slow; VAE ELBO blurry fast; flows constrained; GAN sharp unstable; diffusion sharp stable.",
      "VAE: reparameterize, anneal β, watch KL — posterior collapse is the default failure.",
      "GAN: TTUR, smoothing, spectral norm, hinge loss, z-truncation at sample time.",
      "Diffusion: cosine schedule, DDIM steps, CFG scale 3-12, latent space.",
      "Eval: FID + precision/recall + human side-by-sides; diversity always.",
      "VAE latents for structure; diffusion for pixels — mix deliberately.",
    ],
    recap: `Generative modeling is density estimation as product: autoregressive exactness, VAE algebraic tractability, GAN adversarial realism, diffusion iterative refinement — each family trades speed, diversity, and likelihood knowingly; choose by what you need (pixels, latents, speed, control), evaluate with plurality (FID + diversity + humans), and always audit for memorization — because what a model can imagine sometimes turns out to be what it memorized.`,
    code: {
      title: "VAE ELBO terms in numpy",
      language: "python",
      code: `recon = -np.sum(np.square(x - x_hat), axis=(1, 2, 3))\nkl = 0.5 * np.sum(np.exp(logvar) + mu**2 - 1 - logvar, axis=1)\nloss = -(recon - beta * kl).mean()`,
      explanation:
        "Reconstruction minus regularized divergence — two terms, one model, all the symbolism of variational inference in three lines.",
    },
    diagram: {
      title: "Generative family tree",
      caption: "Likelihoods, bounds and adversarial games.",
      mermaid: `flowchart TD\n G[Generative models] --> V[VAE]\n G --> N[GAN]\n G --> D[Diffusion]`,
    },
  },
  "ai-ml-deep-learning-optimization-for-deep-learning": {
    intro: `Optimization for deep learning is the craft of turning gradient descent into reliable convergence — learning rate schedules, warmup, decay, Adam variants, gradient clipping, and weight decay done correctly. The subject is the applied playbook: what to tune, in what order, and how to read the loss/validation curves to know which knob matters right now. training a neural network is control theory with a learning rate — every schedule is a feedback policy on the loss gradient.`,
    foundations: `Goals: reach low training loss, generalize to val, avoid divergence. Core knobs: learning rate (largest effect), schedule (constant, step decay, cosine annealing + warmup, one-cycle), optimizer (SGD+momentum, Adam, AdamW — decoupled weight decay), batch size (scale ≤ 32-512; larger needs warmup or LAMB), gradient clipping (global norm 1.0). Weight decay: L2 shrinkage via optimizer, not the loss, when using AdamW — Adam\'s adaptive scaling otherwise distorts it. Warmup: linear ramp first ~100-2000 steps stabilizes early training; cosine decay tail polishes. Diagnostics: train/val curves, gradient norm histograms, update/weight ratio.`,
    concepts: [
      {
        title: "Schedules: warmup → high LR → cosine decay.",
        body: `Constant LR plateaus; stepped drops jerk the loss; cosine annealing: LR(t) = lr_min + ½(lr_max−lr_min)(1+cos(πt/T)) — smooth, strong default; add linear warmup over first 2-10% of steps (frozen-ish start → ramp → decay); one-cycle policy (Smith): warmup → lr spike above base → cosine to ~0 — fastest convergence per epoch on small data; WSD (warmup-stable-decay): hold at peak then decay — LLM-scale favorite; monitor: val loss plateau while train drops = overfit or LR too high late; cosine end at ~1e-6 for polish; when in doubt: warmup + cosine beats everything it competes with.`,
      },
      {
        title: "Adam vs AdamW vs SGD+M: choose the fighter.",
        body: `SGD+momentum (0.9): strongest final generalization on vision with proper scaling, needs warmup + long schedules; Adam (β1 .9, β2 .999, ε 1e-8): fast early progress, great for sparse gradients (NLP, embeddings), needs weight decay handled right; AdamW: decoupled WD — correct pairing with adaptivity, SOTA default for transformers; LAMB/LARS: layer-wise trust ratios → batch 8k-32k scaling (BERT recipe); NAdam/RAdam for niceties; discipline: start AdamW, try SGD+M only when chasing last 0.5% with regime known to favor it; never pair raw Adam with L2-in-loss — AdamW exists for a reason.`,
      },
      {
        title: "Gradient clipping and stability forensics.",
        body: `Clip by global norm: if ||g|| > c (1.0 typical), scale g *= c/||g|| — prevents spikes destroying weights (RNN/transformer lore); per-layer clipping alternative for extreme layers; signs of trouble: loss NaN (exploded LR or bad init), frozen loss (LR tiny or zero grads — check), oscillating (LR high — halve), diverging slowly (accumulate grad wrong or loss scale off in fp16); monitor update RMS / param RMS — healthy ≈ 1e-3; spikes > 10 = clip required or LR cut; log grad norm every step — it is the early-warning siren months before val degrades.`,
      },
      {
        title: "Batch size scaling and effective batch.",
        body: `Effective batch = batch × accum steps; >512 needs warmup or LR scaling (linear rule with caveats, sqrt rule safer empirically); noise scale view: gradients get cleaner as batch grows — LR must compensate or overfit slow boundary; large batches: fewer steps, faster epochs but sharp minima risk — remedy: warmup, cosine, LAMB; small batches: implicit regularization, noisy-but-robust directions — slow; sweet spot 32-128 most vision, 8-64 NLP fine-tuning; accumulate when memory-bound; BN behaves weirdly at tiny batch — GroupNorm instead; determinism flags for debugging (CUDA_LAUNCH_BLOCKING, torch.use_deterministic_algorithms).`,
      },
      {
        title: "Reading curves like an SRE.",
        body: `Train down + val down = healthy; train down + val flat = capacity+data limit or shift; train flat + val flat = LR too low / bug / broken data; val drops then explodes = overfitting or LR too high late — early stop with restore_best_weights; noisy val = batch noise or tiny val set — batch average; gap narrowing after augmentation on = regularization working; plot both log-scale; never tune blind — every run has a named hypothesis ("cosine vs step will shorten schedule"); every change isolated; metrics logged to W&B/MLflow with config snapshot; forget tuned, remember tested.`,
      },
    ],
    worked: [
      {
        title: "Rescue a stuck transformer fine-tune with warmup+cosine.",
        body: `BERT-base on 20k samples: original constant 2e-5 — val 77% and flat. Change: warmup 10% steps to 3e-5, cosine decay to 1e-6: val 82.4% in 3 epochs; warm restarts absent risk; the insight: early gradients too large crippled attention layers already near a good basin — warmup protected them; the "schedule problem" masqueraded as a "data problem" for two weeks — plot LR on every run, always.`,
      },
      {
        title: "Find the NaN at step 6,000 from grad-norm telemetry.",
        body: `Run dies at ~epoch 4 every seed. Grad norms: steps 5900-5990 show 0.9→3.2→9.7→NaN — rare huge batch triggers explosion (bad label triplet). Fix: global clip 1.0 enforced; loss-spike detection skips pathological batches (or logs for label audit); training completes; the bug: 14 corrupted labels the clip neutralized silently — the audit found them; clipping bought stability AND surfaced a data bug via the log line.`,
      },
      {
        title: "LARS scales batch 256→8192 without val collapse.",
        body: `Strong single-GPU recipe batch 256 SGD+M; target 32-node run, want batch 8192. Linear LR scaling → val −3%. Switch LAMB (trust ratio per layer) + warmup: val within 0.1% of 256-batch baseline; throughput 24x; the batch scaling problem solved at the optimizer level, no architecture changes; the 0.1% cost bought 24x wall-clock — math over aesthetics, always.`,
      },
    ],
    exam: [
      {
        question:
          "Why does warmup specifically rescue transformer training but matters less for CNNs?",
        answer:
          "Early gradients in attention/FFN layers are enormous and structured wildly from random init — large early steps scatter the pre-trained/neutral ordering irreversibly; CNNs with BN smooth the path and tolerate aggressive starts; warmup is transformer insurance, and on BERT-class models it is not optional.",
      },
      {
        question:
          "What does weight decay placed inside Adam's adaptive scaling actually do wrong?",
        answer:
          "L2-in-loss gradients get divided by Adam's per-coordinate second moment — parameters with historically small gradients (embeddings, rare features) receive disproportionately huge decay; shrinkage becomes arbitrary by history rather than uniform by design; decoupled WD (AdamW) fixes it with one line — which is why AdamW exists.",
      },
      {
        question: "What is the signal for raising vs lowering learning rate?",
        answer:
          "Flat plateaus with both curves stuck and LR feeling exhausted, or oscillations with high gradient noise near the end — raise (with warmup) when progress is zero and loss is smooth; lower when noisy/val jagged near convergence; the curves, not instinct, arbitrate.",
      },
      {
        question: "Why is grad-norm logging the earliest health indicator?",
        answer:
          "Loss curves lag — val drift shows weeks after the underlying pathology starts in gradient magnitudes; a rising norm trend precedes blowups by thousands of steps; every production trainer samples norms per step — it is the vital sign nobody skips twice.",
      },
    ],
    cheat: [
      "Warmup + cosine decay = the schedule default; one-cycle for small data.",
      "AdamW for transformers; SGD+M for vision nostalgia-0.5% at best.",
      "Clip global norm 1.0; log grad norms every step.",
      "Effective batch = batch × accum; >512 needs warmup or LAMB.",
      "Diagnose from curves: LR low→flat, high→jagged; early stop with restore.",
      "lr max via LR-range test; final LR ~1e-6 for polish.",
    ],
    recap: `Deep learning optimization is controlled descent: warmup to protect fragile early steps, cosine to polish the tail, AdamW for transformers (decoupled weight decay done right), gradient clipping as the fire extinguisher, batch-size scaling via LAMB or accumulation — read the curves like an operator, change one knob per run, and remember training stability is engineered, not inherited.`,
    code: {
      title: "Cosine schedule with warmup",
      language: "python",
      code: `lr_lambda = lambda s: s / warmup if s < warmup else 0.5 * (1 + np.cos(np.pi * (s - warmup) / (total - warmup)))\nsched = LambdaLR(opt, lr_lambda)`,
      explanation:
        "Linear ramp then cosine decay — the two-segment schedule that stabilizes every fragile fine-tune you will ever run.",
    },
    diagram: {
      title: "Loss curve diagnosis",
      caption: "Healthy descent versus pathologies.",
      mermaid: `flowchart TD\n A[Both down] --> H[Healthy]\n B[Train down val flat] --> O[Overfit]`,
    },
  },
  "ai-ml-deep-learning-normalization-and-regularization": {
    intro: `Normalization and regularization are the two disciplines that make deep networks trainable and generalizable — techniques controlling signal magnitude and controlling effective capacity. The subject is the toolkit: BatchNorm/LayerNorm/GroupNorm/RMSNorm, dropout, stochastic depth, augmentation, mixup, and early stopping — what each solves and where it fails. normalization fixes optimization geometry; regularization fixes hypothesis-space greed.`,
    foundations: `Normalization: BatchNorm (per-channel mean/var across batch — needs batch>1, breaks with small batch/eval drift), LayerNorm (per-sample across features — transformer default, batch-size independent), GroupNorm (groups of channels — small-batch vision), RMSNorm (LayerNorm minus mean centering — cheaper, same idea). Regularization: dropout p (drop activations, scale at train/eval swap), stochastic depth (drop whole residual blocks during training), weight decay (L2 via optimizer), label smoothing, mixup/cutmix (blend samples and labels), early stopping with best restore; augmentation is the strongest of all in vision.`,
    concepts: [
      {
        title: "BatchNorm: the optimizer's shock absorber.",
        body: `BN normalizes each channel across the mini-batch: ẑ = (z − μ_batch)/√(σ_batch²+ε), then γẑ + β — learnable re-scale/shift; effect: activations stay centered/unit — deeper nets trainable, higher LRs tolerated, initialization less critical; train vs eval discrepancy (batch stats vs running EMA) — running stats are the eval truth; small batches (<8) destroy quality — switch to GroupNorm; caveats: BN breaks with recurrent nets (LayerNorm instead), with distributed uneven batches (sync_bn exists), and in production inference with batch drift; still the vision default at scale, ImageNet recipe backbone.`,
      },
      {
        title: "LayerNorm and friends: transformer anatomy.",
        body: `LN: per token position, across feature dim — independent of batch entirely; gradient highway for residuals (post-LN original vs pre-LN modern — pre-LN trains deeper, more stable — the architecture default since GPT-2); RMSNorm: drop the mean subtraction — ~10% cheaper, negligible difference, LLaMA-family standard; GroupNorm: split channels into groups (typically 32) — batch-independent CNN norm; activation statistics stay sane; placement: Pre-LN before each sublayer vs Post-LN after — pre-LN wins, post-LN slightly better final accuracy at the edge of stability; pick Pre-LN unless reproducing old papers exactly.`,
      },
      {
        title: "Dropout and stochastic depth: noise as teaching.",
        body: `Dropout: per-element Bernoulli mask scaled at train (p=0.1-0.5, task-dependent), identity at eval — prevents co-adaptation, implicates an implicit ensemble of exponentially many subnetworks; modern large models use modest dropout (0.1) or none (augmentations + scale do the work); never drop on conv layers early (replaced by other tricks); stochastic depth: randomly skip entire residual blocks per sample per step (p grows with depth) — a ResNet-only superpower, 22% training speedup rarely reported honestly; both are structured random ablations — the model cannot rely on one pathway; ensemble averaging emerges for free.`,
      },
      {
        title: "Label smoothing, mixup, and the modern stack.",
        body: `Label smoothing ε=0.1: targets 0.9/0.05/0.05 instead of 1.0/0/0 — tames overconfidence, improves calibration measurably on classification; mixup: x̃ = λxᵢ+(1−λ)xⱼ, ỹ similarly — linear-in-between examples stitch the input space with physically plausible interpolations; cutmix: paste region of image into another — fixes localization features; both catastrophic for regression/ranking — apply contextually; modern vision stack: normalize inputs + RandAugment + random erasing + mixup/cutmix + label smoothing + EMA — the +1.5% that turns mediocre into SOTA; each is five minutes to add — negligence has no excuse.`,
      },
      {
        title: "Early stopping and capacity control as policy.",
        body: `Early stop: monitor val metric, patience P epochs, restore best weights — never keep the overfit terminal state; budgets: max wall-clock, max epochs, early exit if val plateaus; regularization strength curriculum: increase dropout only after augmentation saturates; capacity dials: width/depth/params — prefer smaller honest model with strong augmentation; weight decay tuning: AdamW λ=0.01 typical transformer, 5e-4 vision; our de facto final-judge stack for classification: cosine + warmup + RandAugment + mixup + label smoothing + EMA + early stop — reproducible, boring, effective.`,
      },
    ],
    worked: [
      {
        title: "Small-batch collapse fixed by GroupNorm.",
        body: `3D medical segmentation, batch=2 slices/GPU, 4 GPUs: BN catastrophically noisy — val Dice 0.61 vs paper 0.78. Swap all BN→GroupNorm(16 groups): val 0.74; add sync-free stability; 3% residual gap to paper due to data volume, not architecture; GroupNorm is the drop-in when batch is tiny — no running stats, no batch dependence, deterministic inference; memorize the swap rule for edge hardware.`,
      },
      {
        title: "RandAugment plus mixup rescues 4% on CIFAR-100.",
        body: `Baseline ResNet-18: 75.3%. Add: randaugment n=2 m=9, mixup α=0.2, label smoothing 0.1, EMA decay 0.999: 79.4% — zero architecture change; the honest cost: one training run became two days instead of one; the win: no hyperparameter soup beyond three items — resist the urge to add everything, measure each addition.`,
      },
      {
        title: "LayerNorm placement audit beats retraining three models.",
        body: `Team debated Pre-LN vs Post-LN by folklore; ran 3 architectures; Pre-LN trained 1.4x faster to same val BLEU with zero divergence events; adopted Pre-LN universally; the decision that was a config one-liner got 3 models wasted — checklist now: Pre-LN, RMSNorm, cosine, warmup — the four defaults every reviewer asks about first.`,
      },
    ],
    exam: [
      {
        question: "Why does BatchNorm fail with batch size 2?",
        answer:
          "Statistics across two samples estimate population variance horribly — noisy normalization, erratic gradients, violent eval drift; Group/LayerNorm need no batch — use them whenever batch < 8 or inference batch is uncontrolled; the exception proves the distribution rule.",
      },
      {
        question:
          "Why is Pre-LN the default in modern transformers over Post-LN?",
        answer:
          "Pre-LN gives the residual identity path an unblocked gradient stream — deep stacks train stably without the delicate Post-LN warmup gymnastics; slightly lower peak accuracy in exotic cases, massively better reliability — reliability wins at GPT scale.",
      },
      {
        question:
          "What does dropout actually construct mathematically at test time?",
        answer:
          "An average over the exponentially many thinned subnetworks — at inference the deterministic scaled-weight net approximates the ensemble mean; that's why eval-time dropout absence with training-time scaling works — and why dropping too much robs the capacity you just built.",
      },
      {
        question: "Why is augmentation king over dropout for CNNs?",
        answer:
          "Augmentation teaches invariance directly to the data distribution — the skill the model must master — while dropout regularizes representation co-adaptation; augmented data is infinite novel training signal, dropout merely decorrelates; when in doubt, spend GPU hours on augmentation pipelines, not drop rates.",
      },
    ],
    cheat: [
      "BatchNorm big batches vision; LayerNorm/RMSNorm transformers; GroupNorm tiny batches.",
      "Pre-LN + RMSNorm + cosine + warmup = modern defaults.",
      "Dropout 0.1 for transformers; rare for convs; stochastic depth for deep nets.",
      "Augment + mixup + cutmix + label smoothing = +free accuracy; EMA smooths.",
      "Early stop on val with restore_best_weights — always.",
      "Weight decay in optimizer, not loss with AdamW.",
    ],
    recap: `Normalization and regularization are the discipline pillars: BatchNorm/LayerNorm/RMSNorm/GroupNorm keep signals sane by geometry, dropout and stochastic depth inject the right noise, augmentation and mixup manufacture invariance, early stopping catches greed — stacked boringly on every serious run, they decide generalization more than any architectural novelty ever will.`,
    code: {
      title: "Mixup batch recipe",
      language: "python",
      code: `lam = np.random.beta(0.2, 0.2)\nidx = torch.randperm(x.size(0), device=x.device)\nx_mix = lam * x + (1 - lam) * x[idx]`,
      explanation:
        "One beta draw, one permutation — half the regularization benefit of an ensemble, five lines of code.",
    },
    diagram: {
      title: "Norm families",
      caption: "Per-channel, per-token, per-sample, per-group.",
      mermaid: `flowchart TD\n BN[BatchNorm] --> LN[LayerNorm]\n LN --> GN[GroupNorm]`,
    },
  },
  "ai-ml-deep-learning-mixed-precision-and-distributed-training": {
    intro: `Mixed precision and distributed training are how deep learning scales from a laptop to thousands of GPUs without losing its mind — half-precision arithmetic and data-parallel synchronization. The subject is the working craft: fp16/bf16/loss-scaling, autocast and GradScaler, DDP with torchrun, gradient accumulation, FSDP for giant models, and the bottleneck analysis that actually finds where the time goes. speed at scale is engineering — precision, communication, and memory, all three obeyed together or not at all.`,
    foundations: `Precision: fp32 (default, stable, slow), fp16 (half range — overflow risk, needs loss scaling), bf16 (bfloat16: fp32 range, less mantissa — no scaling, Ampere+ default), int8 (inference quantization). Mixed: compute in low precision, master weights in fp32, gradients in fp32, loss scale for fp16; GradScaler dynamic scaling or bf16-none. DDP: process-per-GPU, each holds full model, all-reduce gradients each step (bucketed overlap with backward); torchrun distributed launcher; NCCL backend on Linux+NVIDIA. FSDP: shard params/grads/optimizer states — train >100B params on realistic clusters. Horovod/DeepSpeed: alternative ecosystems; torch.compile for fusion.`,
    concepts: [
      {
        title: "Mixed precision, correctly: bf16 vs fp16.",
        body: `fp16: 5-bit exponent (small range ~6e-5 to 65k) — gradients vanish/overflow → dynamic loss scaling: multiply loss by 2^k, unscale before step, skip step on inf/nan, adjust k adaptively. bf16: 8-bit exponent (fp32 range), 7-bit mantissa — no scaling needed, slightly less precision (fine for training, rough for master weights — keep fp32 accumulations); gradient reduce in fp32; weights update fp32 master copy; rule: Ampere+ GPUs → bf16 always, pre-Ampere → fp16 + GradScaler; watch val loss parity, falls out of the same seeds; memory halves, tensor cores engage, 2-4x throughput typical on large matmuls.`,
      },
      {
        title: "DDP: the data-parallel contract.",
        body: `torchrun --nproc_per_node=8 train.py: launches 8 processes, each full model + shard of data (DistributedSampler), loss computed locally, backward computes grads, all-reduce sums grads across ranks (bucketed by ~25MB, overlapping backward — communication hidden), each rank applies identical update (identical weights forever); deterministic seeding of sampler per epoch — shuffle must differ per rank; set_device per rank; barriers avoided (deadlocks lurk); logs aggregated (rank0 only or distributed reduce); throughput scales ~linearly to 16-64 GPUs for large batches; checkpoint from rank0 only; resume broadcasts to all.`,
      },
      {
        title: "Gradient accumulation: big batch on small iron.",
        body: `Accumulate k steps of grads before stepping — effective batch = local_batch × accum × world_size; two catches: loss must be scaled by 1/accum to keep LR semantics (or lr auto-scaled), and BatchNorm computes per-microbatch stats — mismatch with true big-batch behavior (GroupNorm/LayerNorm sidestep entirely); accumulate inside no_sync for DDP to defer all-reduce until the step (pytorch context) — otherwise gradients sync every micro-step, negating the point; MFU (model FLOPs utilization) target > 35% on healthy runs — below that, profile communication vs compute ratio.`,
      },
      {
        title: "FSDP: shard everything for giant models.",
        body: `Parameters, gradients, optimizer states each sharded across N ranks — each rank holds 1/N; forward: all-gather params per layer (then release), backward: all-gather again + reduce-scatter grads — peak memory ≈ ref/N + buffers — enables billion-scale on commodity clusters; trade: 1.5-2x communication traffic vs DDP; mixed precision for comm in fp16/bf16 halves it; sharding strategies: full_shard (max savings), hybrid (shard intra-node only — comm local), rank0_only_states for optimizer; CPU offload option for extreme scale; FSDP2/torch.distributed.fsdp modern API — prefer over DDP always when memory-bound, complexity accepted for the capability.`,
      },
      {
        title: "Profiling distributed: find your actual bottleneck.",
        body: `Sequence: py-spy/nsight for Python gaps; torch.profiler trace per rank for kernel + comm timeline; metrics: MFU, tokens/s/GPU, all-reduce %, data stall %; common pathologies: dataloader starvation (GPU idle → fix workers), small per-GPU batch (kernel launch overhead → raise local batch), uneven sharding load (straggler ranks → rebalance), checkpoint stalls (async save to overlap — distributedcheckpoint), optimizer state in fp32 eating memory (8-bit optimizers bitsandbytes — 75% save); NCCL timeouts waiting for a dead rank — health checks before scale-out; every one is observable in the profiler; never guess; instrument, then fix the top item; repeat until MFU 😐.`,
      },
    ],
    worked: [
      {
        title: "bf16 conversion triples throughput with zero migration.",
        body: `A100-80GB nodes, ViT-L fine-tune in fp32: 6 h/epoch, OOM risk at bs=32. Switch: autocast(bf16), GradScaler removed (bf16 unscaled), optimizer master fp32 weights unchanged: bs=96 fits, epoch 1.7 h, val parity within 0.05%; the "migration" was one line + deletion of scaler logic; most fp32 training in 2026 is legacy cargo — bf16 by default everywhere modern.`,
      },
      {
        title: "DDP launch to 8 GPUs loses 30% — the dataloader ghost.",
        body: `Scaling 1→8 GPUs yields 5.4x not 7.8x; profiler: rank 0 idles 34% of the step waiting on data; fix: dataloader workers 4→16, prefetch 4, pin_memory already on, drop sampler stragglers by sorting batches by length (less padding waste): 7.6x scaling efficiency recovers; the model code never changed — the pipe was the bug; the profiler always knows first.`,
      },
      {
        title: "FSDP trains a 13B model on eight 80GB GPUs.",
        body: `DDP impossible: 13B params × (4+4+4+2×4bytes opt) ≈ 130 GB — no node fits it whole. FSDP full_shard, bf16 comm, optimizer AdamW 8-bit: 96 GB total, headroom comfortable; hybrid sharding intra-node only; throughput 60% of DDP ceiling — the price is acceptable existence; MFU appt 31% — respectable on H100s for this size; the model previously untrainable now trains before lunch; the migration notes went internal-wiki'd.`,
      },
    ],
    exam: [
      {
        question:
          "Why is bf16 preferred over fp16 on Ampere and later, and what did fp16 force you to do?",
        answer:
          "bf16 carries fp32's exponent range — no vanishing/overflow, so no loss scaling gymnastics, no skipped-step bookkeeping; fp16's narrow range demanded dynamic GradScaler logic with skip-on-inf logic scattered everywhere; bf16 trades mantissa (rarely decisive) for merciful simplicity.",
      },
      {
        question:
          "What actually happens to gradients in DDP between backward and step?",
        answer:
          "Bucketed all-reduce across ranks — sums of gradients synchronized so every rank applies the identical update; buckets overlap backward to hide latency; each rank is mathematically indistinguishable by the end of the step — the collective is the whole ballgame, and its speed is your scaling law.",
      },
      {
        question:
          "Why does no_sync context exist for gradient accumulation in DDP?",
        answer:
          "It defers all-reduce for micro-batches inside the accumulation window — syncing per micro-step multiplies communication by k (accum factor) for no correctness gain; no_sync restores the intended semantics: one collective per optimizer step, exactly as if the big batch existed natively.",
      },
      {
        question:
          "What does FSDP sacrifice beyond DDP to fit giant models, and why pay it?",
        answer:
          "Extra communication — parameters and gradients are all-gathered/reduce-scattered per layer, roughly 1.5-2x more traffic than gradient-only DDP; you pay it because training a 13B model on 8 commodity GPUs is otherwise physically impossible — capability, not convenience, is the purchase.",
      },
    ],
    cheat: [
      "bf16 default on Ampere+; fp16 needs GradScaler; AMP one line.",
      "torchrun + DistributedSampler + rank0-only logging/checkpointing.",
      "Accumulate: scale loss by 1/k; no_sync for DDP; BN stats caveats.",
      "FSDP full_shard for >DDP memory; 8-bit optimizer for headroom.",
      "Profile: MFU, tokens/s, data stalls, all-reduce %; fix the top item first.",
      "bfloat16 halves memory; dtype discipline is bandwidth discipline.",
    ],
    recap: `Scaling deep learning is shipping precision and bandwidth together: bf16 everywhere modern, DDP data-parallel with overlapped collectives as the default recipe, accumulation for batch illusion on small hardware, FSDP for the models that outrun memory, and profiler-driven bottleneck hunting as the only honest methodology — the cluster is a machine, not a crowd, and it obeys physics.`,
    code: {
      title: "AMP + accumulation skeleton",
      language: "python",
      code: `with autocast('cuda', dtype=torch.bfloat16):\n out = model(x); loss = crit(out, y) / accum\nloss.backward()`,
      explanation:
        "Half-precision compute, quarter-memory master copy, zero ceremony — the three-line upgrade that buys 2-4x speed on every modern GPU.",
    },
    diagram: {
      title: "Data parallel scaling",
      caption: "Shard data, sync gradients.",
      mermaid: `flowchart LR\n G0[GPU 0: half batch] --> AR[All-reduce grads]\n G1[GPU 1: half batch] --> AR\n AR --> U[Identical update]`,
    },
  },
  "ai-ml-deep-learning-mechanistic-interpretability": {
    intro: `Mechanistic interpretability reverse-engineers what neural networks compute internally — circuits, features, and algorithms — instead of treating them as black boxes. The subject is the emerging toolkit: activation patching, probing, dictionary learning / sparse autoencoders (SAEs), and circuit discovery — with the honest epistemics of what "understanding" means when the object is a billion parameters. interpretability is debugging at the representation level — reading the actual learned algorithm instead of the wrapper.`,
    foundations: `Levels of analysis (Olah): weights (least interpretable), activations (units/features), circuits (paths), algorithms (complete computation). Tools: activation patching (write activations from a clean run into a corrupted run — find causal components), probing classifiers (linear probes on activations for known concepts), SAEs (sparse decomposition of activations into interpretable directions — 2023-2026 breakthrough), attribution (ACDC, path patching). Primitives: residual stream as communication bus, attention heads as copy/match, MLP layers as key-value memories; features = directions in representation space (often superimposed — SAEs untangle); circuits = minimal subgraphs doing the behavior.`,
    concepts: [
      {
        title: "Activation patching: causal localization.",
        body: `Setup: clean prompt (e.g., "Paris is in France") vs corrupted ("Rome is in Italy" — same local syntax, wrong answer held fixed); run both, cache activations; patch: run corrupted-forward, overwrite component X with clean-run activation, measure logit recovery of "France"; sweep X over layers × positions → heatmap of causal components; findings typically: late-middle layers carry factual recall, attention head X moves entity info; path patching generalizes to edges between components; this is the gold-standard intervention — correlation vs causation answered with a scalpel, not a scatter plot.`,
      },
      {
        title: "Sparse autoencoders: untangling superposition.",
        body: `Problem: models represent far more features than neurons — features are directions, superimposed (non-orthogonal). SAE: encoder maps activation → sparse overcomplete latent (16-128x features, k active ~50), decoder reconstructs — if faithful, each latent = monosemantic feature ("Eiffel Tower", "syntax error", "French adjective"); train on billions of tokens of activations; find latent indices with max activations on curated probes; Anthropic/OpenAI 2023-24 runs found thousands of human-legible features including safety-relevant ones; adversarial-hard but transformative; SAEs cover an activation site at a time — apply to residual stream, MLP outs, attention outs separately.`,
      },
      {
        title: "Probing and representation engineering.",
        body: `Linear probes: train logistic regression on frozen activations to classify known concepts (syntax, sentiment, truthfulness proxies, POS) — if linearly decodable, the model represents it; beware: probes find what you ask, may find correlates not causes — combine with patching for causal tests; representation steering: find direction d for a concept (e.g., honesty), add coefficient × d to residual at inference — modulates behavior (representation engineering paper, contrast vectors); power: knob without retraining; hazards: directions entangle multiple concepts; never trust one vector blindly — validate behavioral shifts broadly.`,
      },
      {
        title: "Circuit discovery: end-to-end reverse engineering.",
        body: `ACDC (automated circuit discovery): start full graph, ablate edges greedily while maintaining behavior — circuit = minimal necessary subgraph; case studies: indirect object identification (IOI, 26 attention heads across 6 classes: previous-token heads, S-inhibition, name-mover heads — Anthropic classic), docstring→parameter mapping in GPT-2 (induction heads: copy previous occurrence patterns — the meta-learning circuit behind in-context learning); modular addition circuits in small transformers (Fourier components); findings are astonishing and fragile — every circuit is model-specific, prompt-specific, partially approximate — wield as evidence, not dogma.`,
      },
      {
        title: "Epistemics: what counts as understanding.",
        body: `A circuit explanation is a compressed lossy account — it predicts ablations on tested distributions, not universal laws; overfitting risk is real: clean circuits may shatter on adversarial prompts; honesty demands: report coverage, failure cases, uncertainty; mechanistic claims should predict, not merely narrate — if patching can\'t falsify your story, it isn\'t an explanation; safety relevance: deception detection, honesty steering, distillation audits — interpretability is the audit trail that scale-transformed models desperately need; the field is pre-scientific in the good sense — everything is still up for grabs, and you can make real discoveries.`,
      },
    ],
    worked: [
      {
        title: "Patch the IOI circuit live in PyTorch.",
        body: `Prompt: "When John and Mary went to the store, Mary gave a bottle to ..." — correct: John. Corrupted: swap John→Alice same template. Patch each layer\'s attention head output on name positions: heads 6.9, 7.3, 8.2 recover >80% correctness — the S-inhibition class; patch MLP layers at those heads\' outputs: 9.4 and 10.7 — name-mover class; the 26-head circuit forms; exercise took Colab 2 hours; the moment: realizing the model is assembly code — your job is reading it aloud.`,
      },
      {
        title: "Train a tiny SAE on a GPT-2 mid-layer.",
        body: `Hook layer 8 residual stream activations during 1M tokens of open web text; SAE 4x expansion (2048 latents), L1=3e-4, 2 epochs; top-activating latents curated: latent 1123 = "Python docstring conventions", latent 0341 = "French plural nouns", latent 1702 = "potential security vulnerability phrasing"; steering latent 1702: wrapped code completion with safe-coding prompts — anecdotal but striking; the $40 of compute bought more insight into the model than any dashboard metric ever had.`,
      },
      {
        title: "Steer honesty with a contrast vector.",
        body: `Collect 64 true/false factual statements; compute mean-activation difference d at layer 12; add 3.5×d to the residual stream during a QA session; on a 200-question factual benchmark, hallucination rate 31%→14%; subtract same: 41%; the direction is robust-ish, entanglement-checked with 30 random concepts (null drift); the demo wowed the room and the safety team both — the caveat speech followed immediately: one vector, one benchmark, not a guarantee.`,
      },
    ],
    exam: [
      {
        question:
          "Why is activation patching stronger evidence than probing alone?",
        answer:
          'Probes show what\'s linearly decodable — correlation with a direction; patching shows that writing that information into a corrupted run causally restores the answer — intervention-level evidence distinguishing "carried the concept" from "correlates with it"; both are needed; patching is the causal gold standard.',
      },
      {
        question:
          "What problem does superposition create, and how do SAEs solve it?",
        answer:
          "Features are directions packed into fewer neurons than the feature count — non-orthogonal overlapping directions entangle everything; SAEs re-embed activations into a sparse overcomplete basis where each latent is monosemantic — decomposing the inseparable into legible atoms by construction.",
      },
      {
        question:
          "What is an induction head and why does it matter for in-context learning?",
        answer:
          'A two-layer attention pattern: a previous-token head caches shifted context; a later head attends to positions where that token previously followed the current token and copies what came after — literally implementing "find the last occurrence and repeat" — most few-shot learning rides on this surprisingly simple circuit motif.',
      },
      {
        question:
          "What honest caveats attach to every mechanistic interpretability claim?",
        answer:
          'Circuits are model-, prompt-, and distribution-specific; ablations may miss compensatory redundancy; SAN counts of features found are not guarantees of coverage; steering vectors entangle concepts — state scope, failure modes, and falsifiability conditions or your "understanding" is narrative, not knowledge.',
      },
    ],
    cheat: [
      "Patching finds causal components; probes find decodable concepts; combine both.",
      "SAE: sparse overcomplete dictionary; latents = monosemantic features.",
      "IOI = previous-token + S-inhibition + name-mover heads; circuits are real.",
      "Steering: contrast vector ± layers; verify broad behavior, not one eval.",
      "Claims need coverage stats and failure cases — always.",
      "Residual stream is the bus; heads read, MLPs write.",
    ],
    recap: `Mechanistic interpretability opens the hood with intervention-grade rigor: activation patching for causal attribution, SAEs for untangling superposition, probing and steering for controlled modulation, circuit discovery for the algorithms underneath — always scoped, always falsifiable, always honest about fragility — the difference between believing a model and understanding what it computes.`,
    code: {
      title: "Activation patch template",
      language: "python",
      code: `with torch.no_grad():\n corrupt = run(x_corrupt, cache=clean.cache, patch={'blocks.10.attn.o_proj': clean.blocks[10].attn.o_proj})`,
      explanation:
        "Swap one component output from the clean run into the corrupted run; measure logit recovery — the atomic experiment of the entire field.",
    },
    diagram: {
      title: "Interpretability stack",
      caption: "From directions to algorithms.",
      mermaid: `flowchart TD\n F[Features] --> P[Probes]\n P --> C[Circuits]\n C --> A[Algorithms]`,
    },
  },
};

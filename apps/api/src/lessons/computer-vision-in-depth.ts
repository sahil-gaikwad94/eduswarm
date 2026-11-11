import type { TopicLesson } from "../topicLessons.js"; /** * Computer Vision in Depth — 5 authored topic lessons. * * Standalone chapters per topic. Subject-first prose, foundations, core * concepts, worked examples, exam practice, cheat sheet, recap. No shared * templates, no runtime composition. */
export const computerVisionInDepth: Record<string, TopicLesson> = {
  "ai-ml-computer-vision-in-depth-object-detection-with-yolo": {
    intro: `Object detection with YOLO finds and localizes every object in an image in one forward pass — bounding boxes plus class labels at real-time speed. The subject is the complete pipeline: anchor-free detectors (YOLOv8+), the detection loss, NMS, training with augmentations and mixed precision, deployment at the edge, and the mAP calculus by which every stakeholder judges you. detection is classification plus geometry — and speed is a feature, not a luxury.`,
    foundations: `YOLO (You Only Look Once): split image into grid, each cell predicts boxes + class probabilities + objectness in one shot; modern versions (v8/v10/v11) anchor-free — predict center offsets + distances to edges directly; loss: CIoU/DIoU box regression + focal/BCE class loss + objectness; decoding: sigmoid → denormalize → gather boxes → confidence filter → NMS (suppress overlapping same-class boxes, IoU threshold ~0.45/0.7). Metrics: mAP@50, mAP@50-95 (COCO standard); per-class AP. Speed: FPS on target hardware; preprocessing letterbox (preserve aspect). Popular stack: Ultralytics ultralytics pip package or YOLOv5 legacy codebases.`,
    concepts: [
      {
        title: "Architecture skeleton: backbone, neck, head.",
        body: `Backbone (CSPDarknet/torchvision timm pretrained): hierarchical features from edges to semantics, ImageNet-pretrained or self-supervised; Neck (PAN/FPN — bidirectional feature pyramid): fuses shallow (location) and deep (semantics) — small objects need high-res features; Head: decoupled classification and regression branches (v8+), no anchors; anchor-free removes anchor tuning hell — one of the biggest practical wins vs v3-v5; SPPF for multi-scale pooling; MPDIoU etc. refinements; understand the three blocks and every YOLO variant is just scheduling of familiar pieces.`,
      },
      {
        title: "Reading detection metrics like an auditor.",
        body: `Precision-recall per class → AP50; mAP50: lenient IoU=0.5 threshold — good for boxes that "basically found it"; mAP50-95: average over IoU 0.5:0.95 step 0.05 — the strict COCO standard; per-class AP reveals what the model misunderstands (hard classes: small/occluded/ambiguous); speed: end-to-end latency including pre/post-processing on target device — not just GPU forward; fps vs mAP trade curve — always report both; validation: held-out images per deployment scene (night, rain, camera angle!); the report card: mAP + per-class AP + latency + size — never mAP alone.`,
      },
      {
        title: "Training: augmentations are the optimizer.",
        body: `Mosaic (4 images tiled — kills boundary artifacts), copy-paste (paste objects into random scenes — huge for rare classes), mixup, HSV jitter, random erasing, flipping; essential when data scarce (<5k images); transfer learning: start from COCO weights — 80 classes learned are 80 classes of prior knowledge; losses/weights tuned by config; epochs 100-300, patience via early-stopping callback; mixed precision bf16; batch by max-batches memory safe; label quality: one mislabeled box per 10 poisons more than 100 weak augmentations — audit labels first; the order: labels → augments → epochs → optimizer — always in that order.`,
      },
      {
        title: "Edge deployment: from 64MB weights to 30ms on a Jetson.",
        body: `Export: ONNX → TensorRT engine for NVIDIA (FP16/INT8 with calibration — INT8 needs 1k-image calibration set); TFLite for mobile CPUs; CoreML for Apple; quantization INT8 halves size, ~1-2% mAP drop; pruning repetitive filters; NMS on GPU (batched) vs CPU — often the bottleneck post-optimization; pipelines: camera → V4L2/GStreamer → preprocess (letterbox) → inference → decode → overlay → encode; power modes, thermal — sustained FPS not burst; measure on the actual device in the actual housing; the paper benchmark is fiction; the device in your hand is the truth.`,
      },
      {
        title: "Data strategy for custom classes with 200 images.",
        body: `Start COCO-pretrained; aggressive copy-paste + mosaic; synthetic data (Unity/Blender-rendered variants with domain randomization: lighting, textures, camera) to multiply rare classes; hard negative mining (scenes without object everywhere wrong-but-tempting); active learning loop: deploy → collect uncertain frames → human labels top-5% by entropy → retrain; classes collapsing into each other? Check inter-annotator agreement — bad labels again; when all else fails: more data, always the cheapest lever; 200→2000 images beats any architecture change you will attempt.`,
      },
    ],
    worked: [
      {
        title: "Warehouse forklift detector: 94% mAP at the edge.",
        body: `Requirement: detect forklifts in 12 camera feeds, alert on pedestrian proximity. Prototype: YOLOv8m COCO-pretrained on 600 annotated frames per camera angle; augmentation copy-paste for rare poses; TensorRT INT8 on Jetson Orin: 31ms/frame; mAP50 0.94, mAP50-95 0.71; deployed shadow 2 weeks — caught 3 near-misses in week one, zero false alarms after NMS/threshold tune; the safety officer approved production; the project that could have saved a life cost a quarter of an engineer; the board approved camera expansion nationwide.`,
      },
      {
        title: "Rip out a custom architecture for YOLO and save 6 months.",
        body: `Research team built bespoke two-stage detector, mAP50 0.81, 140ms/frame. Migrated to YOLOv8l pretrained: same data, 2 weeks tuning — mAP50 0.89, 9ms/frame on RTX; the architecture nobody needed vs the one the field settled on; the lesson relayed org-wide: baseline the SOTA open model before inventing; the custom work was salvaged as ablation knowledge; the cycle time dropped 6 months to 6 days; the principal engineer quoted the decision in every roadmap afterward.`,
      },
      {
        title: "Annotation audit recovers 12 AP points on traffic signs.",
        body: `Model mAP stuck 0.62 on small signs; audit found 18% boxes loose (double-clicked default boxes) and 4% class confusion (stop vs yield); relabel 1,400 boxes; retrain: mAP 0.74; the bottleneck was never the model — it was the humans clicking; the discipline: audit 5% of labels per batch before any training run, every run; the labeling vendor contract changed; the quality floor clause was born that day.`,
      },
    ],
    exam: [
      {
        question:
          "Why do anchor-free detectors dominate current YOLO versions?",
        answer:
          "Anchors were hand-crafted priors tuned per dataset — brittle, laborious, and frequently mismatched; predicting center/edge distances directly removes anchor configuration, simplifies loss design, and empirically matches or beats anchor-based accuracy with less tuning — deleted complexity beats clever geometry.",
      },
      {
        question: "What does mAP@50-95 punish that mAP@50 hides?",
        answer:
          "Loose box placement — @50 forgives a box half a sign away; the strict metric averages IoU 0.5→0.95 and exposes sloppy localization everywhere, differentiating good models from lucky ones under generous thresholds.",
      },
      {
        question:
          "Why is NMS often the latency bottleneck on optimized deployments?",
        answer:
          "Forward pass is tensor-parallel; NMS is sequential pairwise comparison — on edge GPUs the CPU/GPU round trips for NMS can exceed the detection head itself; batched NMS kernels or end-to-end NMS-free designs (DETR-style) exist precisely because this serial tail refuses to shrink quietly.",
      },
      {
        question: "Why must augmentations copy-paste exist for rare classes?",
        answer:
          "Rare classes have few real examples; copy-paste synthesizes realistic novel compositions with correct labels for free — multiplying effective data 10x for exactly the classes that need it; when budgets deny collection, paste is the cheapest honest label generator available.",
      },
    ],
    cheat: [
      "Ultralytics YOLOv8+: train CLI, export engine, done.",
      "Report mAP50 + mAP50-95 + per-class AP + latency on device.",
      "Labels → augment (mosaic, copy-paste) → pretrained → measure.",
      "Letterbox preprocessing; NMS IoU 0.45-0.7 by scene density.",
      "TensorRT FP16/INT8 with calibration; benchmark on-device only.",
      "Active learning: label the uncertain 5% forever.",
    ],
    recap: `YOLO detection is disciplined engineering: pretrained backbones, dense supervision via CIoU/focal losses, NMS for disambiguation, augmentations multiplying scarce labels, TensorRT for the edge — measured in mAP, latency and on-device honesty, because a detector that ships to the warehouse floor must work on the dirtiest frame of the shift, not the cleanest of the paper.`,
    code: {
      title: "Ultralytics training in one line",
      language: "bash",
      code: `yolo detect train data=custom.yaml model=yolov8m.pt epochs=100 imgsz=640`,
      explanation:
        "The entire pipeline in one command — the barrier between idea and trained detector, demolished.",
    },
    diagram: {
      title: "YOLO pipeline",
      caption: "Image to grid to boxes to NMS.",
      mermaid: `flowchart LR\n IMG[Image] --> B[Backbone]\n B --> N[Neck]\n N --> H[Head]\n H --> NMS[NMS and output]`,
    },
  },
  "ai-ml-computer-vision-in-depth-semantic-segmentation": {
    intro: `Semantic segmentation assigns a class to every pixel — dense prediction for scene parsing, medical imaging and autonomous driving. The subject is the architecture zoo (FCN, U-Net, DeepLab), losses for class imbalance (Dice, Focal), training recipes, and evaluation (mIoU, boundary metrics) — the discipline where one wrong pixel can be the whole diagnosis. detection draws boxes, segmentation paints understanding — and biology does not care about your IoU.`,
    foundations: `Task: assign label per pixel; encoder-decoder with skip connections (U-Net) restores spatial detail lost in downsampling; atrous/dilated convolutions (DeepLab) expand receptive field without pooling; FCN pioneered end-to-end segmentation; losses: cross-entropy (balanced), Dice loss (1 − 2|X∩Y|/(|X|+|Y|)) for severe imbalance, Focal loss down-weights easy pixels; metrics: mIoU (union/intersection per class averaged), pixel accuracy (inflated by majority classes — avoid standalone), boundary F-score. Annotation: polygon tool (LabelMe, CVAT), cost 10-100x box annotation — budget accordingly.`,
    concepts: [
      {
        title: "Architecture: encoder-decoder with skips explained.",
        body: `Encoder shrinks H×W×C → H/32×W/32×2048 capturing semantics; decoder upsamples back with transposed convs or a combine of upsample+conv (avoid deconv checkerboard artifacts); skip connections from each encoder level sum element-wise with decoder — fine spatial detail flows around the bottleneck; U-Net (2015, biomedicine) still baseline; UNet++/Attention U-Net refine skips; DeepLabV3+: Xception backbone + ASPP (multi-dilation parallel branches) + decoder — strong on Cityscapes/PASCAL VOC; modern: SegFormer (no positional enc, transformer blocks, b0-b5 sizes), Mask2Former (mask classification paradigm). Choose by dataset size + latency budget.`,
      },
      {
        title: "Loss functions for a 1:1000 foreground.",
        body: `Plain CE drowns in background pixels — 99.9% weight misalignment; Dice loss optimizes overlap directly — immune to imbalance; combine: CE + Dice (dominant recipe); Focal: (1−pt)^γ log(pt) — focuses hard pixels; boundary-aware losses (hausdorff-ish) for thin structures (vessels, road edges); Tversky weighting α>β to bias toward recall in medicine (false negatives costlier); log-cosh/soft-label smoothing when annotators disagree on boundaries (humans can\'t localize consistently either); never ship a segmentation model trained on raw CE alone for elongated rare structures — the literature says this plainly and silently bankrupts projects.`,
      },
      {
        title: "Training and evaluation: from scratch to pretrained.",
        body: `Pretrain backbone on ImageNet/ADE20K (Cityscapes macro) always — never from scratch below 50k images; augmentations: flips (not vertical in some domains!), crops 512×512 with overlap blending at inference (test-time augmentation), color jitter with care for calibrated imagery (microscopy intensity!), elastic deformation (biomedical); validation: per-class IoU table mandatory — mean hides a dead class; early stop on val mIoU; checkerboard review of your predictions on 20 random val images — the eye catches what curves hide.`,
      },
      {
        title: "Inference-time strategy: sliding window and TTA.",
        body: `Input bigger than 512? Or higher detail needed? Sliding window with 25% overlap + Gaussian weighting at seams — no visible stitching; test-time augmentation (flips, scales 0.75/1.0/1.25) averages predictions — +1-3 mIoU essentially free (3-4x compute); TTA when evaluation permits; production latency permitting? measure; post-processing: small-object removal (< N px), morphological closing, largest-component constraint when semantics allow — the 0.5 point that closes a demo; always visualize full-image output vs thumbnails of error cases in reviews.`,
      },
      {
        title: "Annotation economics and synthetic data.",
        body: `Pixels cost: professional annotator ~$8-15/hour, 2-10 min per complex image → $1000-3000 per 1k images medical — plan for it or die; interactive tools (Scribble mode in CVAT with model-in-the-loop) cut 50-70%; synthetic: render domain-realistic scenes (Unreal/Unity for driving/robotics; Blender microscopy), pretrain on synthetic, fine-tune on real — works astonishingly well; domain gap management: domain randomization on textures/lighting; budget simulation-to-real 10:1 pretraining ratio; with synthetic, a few hundred real annotated images can suffice where thousands were feared necessary.`,
      },
    ],
    worked: [
      {
        title: "Satellite rooftop detection: 0.78 IoU on 900 images.",
        body: `Task: segment rooftop solar panels from aerial RGB. 900 images, heavily imbalanced (panels 3% of pixels). Model: DeepLabV3+ ResNet-50 ADE20K-pretrained; loss BCE+Dice 1:1; augment: flip/rotate 90°; TTA at inference; IoU 0.78 on the panel class (vs 0.41 with naive CE); deployed to screen 400k images nightly — 40k candidates surfaced to inspectors; the program found 2,100 unpermitted arrays; ROI enormous; annotation pilot cost <$4k thanks to scribble-assisted tooling.`,
      },
      {
        title: "Medical segmentation refuses to converge — until Dice.",
        body: `Over weeks, dice stuck ~0.4 on small lesions; CE loss fine, mIoU trending up, lesion IoU flat. Switch loss to Dice-only alpha 0.9 + boundary-aware component: Dice 0.71 in 2 epochs, 0.83 final; the imbalance was eating the signal; stopping CE preserved majority background, sacrificed the minority class — exactly the clinical catastrophe the model was built to prevent; literature says this, we learned it the hard way, and the playbook now starts with Dice every time.`,
      },
      {
        title: "LabelMe-marks-done project halved after tool switch.",
        body: `2,000-image dataset estimated 9 weeks manual. Introduce CVAT + SAM-assisted pre-annotation (click→mask): human refines 2 min/image vs 15; delivery 4.5 weeks; budget halved; QA audit showed 96% acceptance rate vs 88% before — fewer interactions, fewer compounding mistakes; tooling is not a nicety; it is the unit economics of data; every annotation project budget starts with tool selection, never ends without it.`,
      },
    ],
    exam: [
      {
        question:
          "Why does U-Net include skip connections from encoder to decoder?",
        answer:
          "The bottleneck discards spatial resolution that segmentation desperately needs — skips pipe high-resolution edge/texture features around the deep pathway to the upsampling stages; without them, boundaries blur into voxel soup; with them, pixel-level precision survives the journey.",
      },
      {
        question: "Why is Dice loss the standard for severe class imbalance?",
        answer:
          "It optimizes overlap directly, not per-pixel correct votes — when 99% of pixels are background, CE gets top grades by ignoring the foreground; Dice cannot plateau without caring; pairing CE+Dice gets stable gradients and imbalance immunity simultaneously.",
      },
      {
        question:
          "Why do atrous/dilated convolutions exist instead of simply not downsampling?",
        answer:
          "Receptive field grows without spatial resolution loss — pooling decimates detail irrecoverably; dilation inserts holes with exponentially growing coverage at constant parameters and FLOPs — seeing wider while keeping every pixel's vote.",
      },
      {
        question: "Why is test-time augmentation underused for segmentation?",
        answer:
          "Cost is 3-4x inference — real latency price — yet segmentation is usually batch/offline evaluation where minutes are free and +1-3 mIoU decides rankings; in offline pipelines TTA is the free lunch almost nobody refuses by accident.",
      },
    ],
    cheat: [
      "SegFormer/U-Net/DeepLabV3+ as starting points; pretrained always.",
      "CE+Dice for imbalance; focal when hard pixels dominate.",
      "Per-class IoU tables; visualize 20 worst predictions; early stop on mIoU.",
      "Sliding window + overlap blend at inference; TTA when free.",
      "Scribble/SAM annotation tooling — 5-10x throughput.",
      "Synthetic pretraining when labels are expensive.",
    ],
    recap: `Segmentation is dense prediction under discipline: encoders with skips to rescue detail, Dice-obsessed losses for imbalance, pretraining and augmentation humming in the background, sliding-window inference with Gaussian seams, and label economics solved by better tools — because the model that finds the tumor is only as good as the pixels nobody mislabeled.`,
    code: {
      title: "Combined CE-Dice loss",
      language: "python",
      code: `loss = 0.5 * ce(pred, y) + 0.5 * (1 - dice_coeff(pred, y))`,
      explanation:
        "Stable gradients from CE, overlap optimization from Dice — the pair survives the rarest classes on earth.",
    },
    diagram: {
      title: "U-Net architecture",
      caption: "Down for semantics, up for detail, skips to remember.",
      mermaid: `flowchart LR\n E[Encoder downsampling] --> B[Bottleneck]\n B --> D[Decoder upsampling]\n E -.skip.-> D`,
    },
  },
  "ai-ml-computer-vision-in-depth-vision-transformers": {
    intro: `Vision transformers (ViTs) treat images as sequences of patches processed by transformer encoders — no convolution inductive bias, pure attention, scale-hungry and spectacular. The subject is the ViT family (ViT, DeiT, Swin, DINOv2), contrastive self-supervision, training requirements, and the crossover moment where attention eats pixels. vision got its ChatGPT moment — patch embeddings plus attention plus scale, and convolutions stepped aside.`,
    foundations: `ViT process: image split into fixed patches (16×16 typical) → linear projection to embedding dim → prepend [CLS] token → add positional embeddings → transformer encoder (multi-head attention + MLP blocks, pre-LN) → classification head on [CLS]. No translation equivariance built in — learns it from data; data-hungry: needs hundreds of millions of images (JFT-300M, LAION) or self-supervision to shine; Swin shifts windows for linear complexity + hierarchy; DINOv2: self-supervised ViT backbones via self-distillation — universal features, no labels needed, dominate downstream tasks frozen.`,
    concepts: [
      {
        title: "ViT anatomy: patches, tokens and attention.",
        body: `Patch 16×16×3 flattened → linear → 768/1024/etc dims; e.g., 224² image → 14²=196 tokens + 1 CLS = 197 sequence length; attention mixes all-to-all (unlike conv\'s local window) → global context from layer 1; positional embeddings learned (absolute) or RoPE/relative position bias (Swin); classifier on CLS token (or mean-pool — often better); variants sized: ViT-Small 22M, Base 86M, Large 307M, Huge 632M; pre-norm (LayerNorm before attention/MLP) stabilizes deep stacks — the critical detail everyone forgets; init truncated normal — sensitive; train with warmup + cosine + moderate weight decay.`,
      },
      {
        title: "The data appetite problem and the self-supervised escape.",
        body: `ViT needs ~10-100x the data of ResNet for parity on ImageNet from scratch — absurd for most orgs; escapes: (1) transfer from JFT/LAION/IN-21k pretrained backbones — the default, always; (2) DeiT: distillation from CNN teacher with hard distillation token — ViT trains well on ImageNet-1k alone; (3) self-supervised pretraining: MAE (mask 75% patches, reconstruct pixels — huge efficiency gains), DINO/DINOv2 (self-distillation with momentum teacher — no labels); DINOv2 features frozen backbone win most transfer benchmarks; practical recipe 2026: DINOv2-Large frozen + linear head — minutes to 90%+ on most small vision tasks.`,
      },
      {
        title: "Swin and hierarchical designs: ViT meets downsampling.",
        body: `Vanilla ViT: fixed 16×16 patch, quadratic attention, flat resolution — bad for dense tasks (detection/segmentation needs multi-scale); Swin: shifted-window attention — local windows then shifted alternate layers capture cross-window context; linear complexity in image size; hierarchy: patch merging stages (4×4→2×2→1×1 resolutions), transformer blocks per stage — a true CNN replacement for pixel tasks; accuracy matches/beats CNNs with fewer FLOPs on detection/segmentation benchmarks (Mask R-CNN + Swin backbone, Cascade + swin-large, etc.); choose Swin/ConvNeXt for dense tasks; vanilla ViT for classification/retrieval embeddings.`,
      },
      {
        title: "Fine-tuning recipes that actually converge.",
        body: `Starting from pretrained: freeze backbone, train head only (linear probe) → unfreeze gradually; LR tiny (5e-6 to 1e-5); weight decay ~0.05; exclude norm/bias/CLS from decay; warmup 5-10% steps; label smoothing 0.1; MixUp/CutMix; stochastic depth (DropPath 0.1-0.3) for large models — crucial against overfitting; batch 256-4096 with grad accumulation; Mixed precision bf16; eval every epoch; patience generous; if diverging: halve LR, check LayerNorm placement — the prenorm demons haunt those who skip docs; fine-tune on 10k+ images, linear-probe below that.`,
      },
      {
        title: "Compute economics: ViT vs CNN pragmatically.",
        body: `ViT-Base ~80 GMACs vs ResNet-50 ~4 GMACs — 20x compute; training from scratch: infeasible for 99% of teams; inference: fine with batch on GPU, edge? No — CNN wins on edge always; deployment via ONNX/TensorRT INT8 works (Winograd-free attention kernels); for classification at scale where data is abundant: ViT; else CNN/pretrained ViT-head hybrids (CaiT, DeiT-III); the honest framing: ViT is what you transfer FROM, not what you train; the org that pretrains ViT internally every quarter needs therapy; the one that fine-tunes DINOv2 weekly ships products.`,
      },
    ],
    worked: [
      {
        title: "DINOv2 frozen features replace a bespoke ResNet stack.",
        body: `Visual search: 40M product images, find similar by vibe. Old: ResNet-50 finetuned per-category, cross-category fails; DINOv2-ViT-L/14 frozen + cosine NN + FAISS: recall@10 0.93 vs 0.71, no labels for new categories, delete 18 retraining jobs per month; the feature team shipped in 10 days; the architecture review banned custom backbones for search henceforth; the year savings funded two more engineers.`,
      },
      {
        title: "DeiT saves a ViT project starved of data.",
        body: `Medical images 12k train images, ViT-from-scratch val 58%. Switch DeiT strategy: distill from ResNet-50-teacher trained on same data; 12 weeks → 71% val; the CNN teacher carried the ViT; the student beat the teacher by 2%; the lesson archived in onboarding docs: ViT never trains alone here; distillation pads are mandatory; the compute saved funded the next annotation batch; both won; the doctorate student graduated on this insight.`,
      },
      {
        title: "Swin backbone lifts detection mAP 3.1 with zero other changes.",
        body: `Existing YOLOv8 pipeline, replacing head backbone CNN with Swin-T features fused via PANet: mAP50 0.84→0.87, mAP50-95 0.61→0.65; training epochs unchanged; inference 12→15ms — acceptable; the discovery: the neck was starving for semantic depth CNN pyramids can\'t provide; Swin delivered; the team debated abandoning CNNs; compromise adopted: backbone Swin, head Ultralytics — best of both under deadlines.`,
      },
    ],
    exam: [
      {
        question:
          "Why does a vanilla ViT need dramatically more data than a CNN?",
        answer:
          "CNNs hard-code locality via convolution — the pattern language of images is the architecture; ViTs learn patterns from scratch — edges, textures, shapes all must be discovered in-weights from examples; without scale or self-supervision, the learning is lottery tickets — hence JFT/LAION or MAE/DINO pretraining as non-optional infrastructure.",
      },
      {
        question: "What problem does Swin's shifted window attention solve?",
        answer:
          "Quadratic global attention cost and flat resolution — local windows keep compute linear, shifts let information cross windows layerwise, and hierarchical merging restores the multi-scale pyramid dense vision needs; it is ViT admitting that localness was never entirely wrong.",
      },
      {
        question:
          "Why is DINOv2 the default starting point for frozen visual features today?",
        answer:
          "Self-supervised self-distillation on LVD-142M yields universal representations — no labels, no task bias, transfer to nearly any downstream task better than supervised predecessors; frozen inference, linear probe, done — the fastest path from images to working intelligence that exists.",
      },
      {
        question: "Why do ViTs fine-tune with tinier learning rates than CNNs?",
        answer:
          "Attention parameters and LayerNorms overfit explosively — large steps scramble the pretrained geometry; transformers are LR-sensitive everywhere (ViT more so); 1e-5 to 5e-6 for full model; higher for head-only — the same gradient that teaches CNNs destroys ViTs.",
      },
    ],
    cheat: [
      "Patchify → linear → transformer → CLS head; pre-norm mandatory.",
      "Pretrain or die: JFT/LAION/DeiT/DINOv2 — never from scratch solo.",
      "Frozen DINOv2 + linear probe: default for transfer tasks.",
      "Swin for dense; vanilla ViT for embeddings/classification.",
      "Warmup, cosine, tiny LR, DropPath, CutMix, grad accumulation.",
      "Edge deployment: CNN; cloud/throughput: ViT.",
    ],
    recap: `Vision transformers are scale-powered attention applied to patched pixels: vanilla ViT for embeddings when pretrained data is enormous, Swin for dense tasks with linear-cost locality, DINOv2 as the universal frozen backbone — fine-tuned with humility (tiny LRs), shipped with honesty (CNN where edge demands), because attention won vision by rewriting the rules, not by abandoning them.`,
    code: {
      title: "DINOv2 feature extraction",
      language: "python",
      code: `feats = dinov2(img_tensor) # no grad\nsim = F.cosine_similarity(feats_q, feats_gallery)`,
      explanation:
        "Two lines from image to universal embedding — the money line of modern transfer vision.",
    },
    diagram: {
      title: "ViT forward pass",
      caption: "Patches to tokens to attention to logits.",
      mermaid: `flowchart LR\n IMG[Image] --> P[Patch embed]\n P --> T[Transformer encoder]\n T --> H[CLS head]`,
    },
  },
  "ai-ml-computer-vision-in-depth-diffusion-models-in-practice": {
    intro: `Diffusion models generate images by learning to reverse a noising process — the architecture behind Stable Diffusion, Midjourney and every text-to-image system you admire. The subject is practitioner-level depth: forward/reverse processes, U-Net denoisers, conditioning (text, ControlNet, IP-Adapter), sampling (DDPM vs DDIM), latent diffusion, and the fine-tuning path (DreamBooth, LoRA) that turns generalists into your brand. diffusion is turning Gaussian noise into art, one denoising step at a time, with a neural net that learned the shape of beauty.`,
    foundations: `Forward: q(xₜ|x₀) adds noise stepwise to pure Gaussian over T steps (e.g., 1000); network predicts ε (or x₀, v) added at t; training: random (x₀, t, ε) → predict ε → MSE; reverse: p(xₜ₋₁|xₜ) learned — iterate T steps (DDPM ancestral) or accelerated (DDIM 20-50 steps, deterministic ODE paths; DPM-Solver even faster). Latent diffusion: run in VAE latent space (4x-8x smaller) — practical on consumer GPUs; U-Net backbone with cross-attention for text conditioning; text encoder: CLIP/T5 embeddings of prompt; guidance: classifier-free guidance scale 1-20 (7 typical) boosts prompt adherence vs diversity trade-off.`,
    concepts: [
      {
        title: "The math in one page: from noise to image.",
        body: `xₜ = √ᾱₜ x₀ + √(1−ᾱₜ) ε, ε~N(0,I); schedule ᾱₜ over T steps; U-Net ε_θ(xₜ, t, c) conditioned on text c; loss ||ε − ε_θ||² — it is that simple and that profound; sampling: ŷₜ₋₁ = 1/√αₜ (xₜ − (1−αₜ)/√(1−ᾱₜ) ε_θ) + σₜ z for ancestral DDPM; DDIM: same ε_θ, deterministic non-Markovian update — 20-50 steps instead of 1000; guidance: ε̃ = ε_uncond + s(ε_cond − ε_uncond) — s=1 neutral, s>1 amplifies prompted direction (s=7 good default; s>12 crunchy oversaturated); understanding these four equations makes every extension readable.`,
      },
      {
        title: "Text conditioning and cross-attention mechanics.",
        body: `Prompt → tokenizer → CLIP-ViT-L or T5-XXL encoder → token embeddings (77 tokens SD1.5, 225+ SDXL); cross-attention layers in U-Net at each downsample/upsample level: queries from image features, keys/values from text embeddings — every spatial position queries text; this is where visual tokens "read" the prompt; negative prompt adds a second condition treated as suppression direction; empty negative + high CFG = more diversity, less control — tune per use case; token emphasis syntax (word:1.3) scales logits at inference — legitimate knob, document it; attention maps visualize which tokens influenced which pixels — the debugging tool nobody uses.`,
      },
      {
        title: "ControlNet and the geometry of control.",
        body: `ControlNet: copy of U-Net encoder branch trained on paired (conditioning image, x₀) — Canny edges, pose skeletons, depth maps, normals, segmentation masks; zero-convolutions inject residuals into frozen base U-Net — base stays intact, control layered; parameters: control weight 0.5-1.0; combinations: OpenPose + depth for exact scene layout, Canny for faithfulness of line art, seg mask for composition; IP-Adapter: image prompts without training — CLIP image features projected into the same cross-attention slot; FaceID preservation for portraits; the "control problem" in generative vision is now mostly an engineering problem with solved knobs.`,
      },
      {
        title: "Sampling strategies: speed vs quality math.",
        body: `Ancestral DDPM 1000 steps: reference quality; DDIM 50: near-equal, 20x faster; DPM++ 2M Karras 20-30 steps: current gold for speed/quality; LCM (latent consistency models) 4-8 steps with slight fidelity cost — real-time; sampler choice shifts aesthetic (Euler = smooth, DPM Karras = crisp); scheduler noise seed + steps interplay; for consistent characters/styles across generations: fixed seed + IP-Adapter; batch generation with same seed but different prompt suffixes for A/B variants; measure human preference, not aesthetics you half-remember; write the winning sampler config into the team template forever.`,
      },
      {
        title: "Fine-tuning: DreamBooth and LoRA for your concept.",
        body: `DreamBooth: 3-30 curated images of subject (+ class images with [concept-token] [class noun] pairs), 800-1500 steps, lr 1e-6-5e-6, prior preservation loss to stop class drift ("dog" → "my dog" only); LoRA: inject low-rank adapters into cross-attention layers — 8-64 rank, train on 10-100 images, merge or dynamic load — cheaper 100x; both on SDXL work brilliantly; trigger word discipline: rare token not in vocabulary already; evaluate: generate 50 images per checkpoint, eyeball consistency; if faces morph: more diverse angle data; if style drifts: reduce steps/lr; fine-tuning is the difference between toy and tool.`,
      },
    ],
    worked: [
      {
        title:
          "Furniture catalog synthetic imagery: 40k renders from 200 real photos.",
        body: `Home-furnishings brand needed lifestyle images; catalog shoot $18k per round. DreamBooth LoRA per 12 hero sofas (20 images each), SDXL + ControlNet depth layouts from 3D scene planners; output: 3,400 approved lifestyle renders/month; usage rights clean (owned concept); cost/image $0.02; the art director signed off on style consistency across the line; the catalog refreshed quarterly now instead of never; the print campaign ran two variants A/B'd — the Winning one nobody could tell from photography; the CG-vs-photo debate ended in the boardroom, not the forum.`,
      },
      {
        title: "ControlNet rescue after vanilla txt2img failed a room layout.",
        body: `Task: photorealistic bedroom with exact furniture positions; 40 prompt attempts, zero match. Fix: 3D scene blockout → depth map → ControlNet depth + seg-mask hybrid, strength 0.9; Canny for wall trim lines; IP-Adapter style reference for hotel-lobby mood; 6 renders selected from 200 seeds; the client approved within days; lesson archived: specify geometry with ControlNet, mood with style adapters, content with prompts — each control has its native granularity; the prompt can never say "couch exactly here".`,
      },
      {
        title:
          "LCM sampler cuts generation cost 80% for the chatbot avatar service.",
        body: `Avatar generator serving 30k users/day; DPM++ 25 steps at peak cost 4 GPUs; swap to LCM-LoRA 6 steps + LCM scheduler: quality visually identical on blind test (52/48 split), latency 4.2s→0.9s, GPU fleet 4→1.2 machines; the saving funded the moderation panel reviewing NSFW flags — the safety spend the CFO kept refusing; the win: better product, better safety, same budget.`,
      },
    ],
    exam: [
      {
        question:
          "Why does classifier-free guidance trade diversity for prompt adherence?",
        answer:
          "It extrapolates the score difference between conditional and unconditional predictions — pushing harder toward what the text says and away from generic data; as scale rises past ~7-10, outputs stiffen, artifacts multiply, diversity collapses — the dial is a trade, not a free lunch, and it never stops being one.",
      },
      {
        question:
          "What does ControlNet copy from the frozen base model, and why copy at all?",
        answer:
          "The encoder hierarchy carries learned spatial-semantic features; a parallel copy initialized to that knowledge and fine-tuned on (depth/pose/edge → image) pairs injects the conditioning residual through zero-convolutions — leveraging everything already learned instead of relearning vision from scratch in a new branch.",
      },
      {
        question:
          "Why is latent diffusion the practical breakthrough vs pixel diffusion?",
        answer:
          "Pixel-space diffusion at 512²+ is ruinously expensive; the VAE latent (4-8x compression) preserves semantics while slashing compute 50x — the same math, a smaller arena, consumer-GPU-class trainability and inference — without compression, no open diffusion ecosystem exists.",
      },
      {
        question:
          "Why does DreamBooth need prior preservation on class images?",
        answer:
          'Without it, the model collapses the class concept onto your subject — every "dog" becomes your dog, every "chair" becomes yours — destroying generative diversity; alternating subject and class-image training retains the class manifold while binding your token to your concept.',
      },
    ],
    cheat: [
      "DDIM/DPM++ 2M Karras; steps 20-30; CFG 5-7; negative prompt always.",
      "Latent diffusion only — SDXL/SD3 class.",
      "ControlNet for geometry; IP-Adapter for style/identity; prompts for content.",
      "LoRA 8-64 rank for concepts; DreamBooth-class training for hero assets.",
      "Seed control + batch A/B; evaluate humans, not aesthetics.",
      "Safety: NSFW filters + watermarking + disclosure in every pipeline.",
    ],
    recap: `Diffusion imaging is denoising choreography: latent-space efficiency, cross-attention conditioning to text, guidance as the adherence dial, ControlNet for geometry, adapters for style, samplers for speed — fine-tuned with LoRA for custom concepts, shipped responsibly with filters and disclosure — because the image model that cannot sit still in your pipeline is a demo; the one that ships is an engineering artifact with a license, a budget and a conscience.`,
    code: {
      title: "Diffusers pipeline skeleton",
      language: "python",
      code: `pipe = StableDiffusionXLPipeline.from_pretrained('model', torch_dtype=torch.float16).to('cuda')\nimg = pipe('prompt', num_inference_steps=25, guidance_scale=6.5).images[0]`,
      explanation:
        "Four lines from import to image — the entire public surface between you and a working diffusion system.",
    },
    diagram: {
      title: "Diffusion loop",
      caption: "Noise to image by learned denoising.",
      mermaid: `flowchart LR\n N[Gaussian noise] --> D[Denoiser steps]\n D --> X[Image]`,
    },
  },
  "ai-ml-computer-vision-in-depth-video-understanding": {
    intro: `Video understanding extends computer vision across time — action recognition, temporal detection, tracking, and video-language models. The subject is the full spectrum: frame sampling strategies, 3D CNNs and two-stream networks, temporal transformers, tracking pipelines (ByteTrack, DeepSORT), and multimodal video-language understanding for search, moderation and highlight generation. video is not images with timestamps — it is motion, intention and consequence captured in pixels.`,
    foundations: `Tasks: action recognition (clip → class), temporal action detection (find when action occurs), multi-object tracking (who is who across frames), video QA/captioning, anomaly detection. Architectures: 3D CNN (C3D, I3D — inflate 2D kernels with time), two-stream (RGB + optical flow), SlowFast (fast pathway for motion, slow for semantics), Video Transformers (TimeSformer, ViViT — space-time attention), VideoMAE (masked autoencoding for video pretraining), video-language (VideoLLaMA, Qwen-VL). Tracking: detection + motion model (Kalman) + appearance embedding (OSNet) → associate (Hungarian/ByteTrack). Metrics: mAP for detection, IDF1 for tracking, top-1 for actions.`,
    concepts: [
      {
        title: "Frame sampling: the decision that dominates compute.",
        body: `Dense 30fps: infeasible — 300 frames for 10s; uniform 8-16 frames per clip standard; faster sampling loses short actions (<1s) — trade by task; keyframe extraction for long-form (scene cuts) reduces hours to minutes; sliding window for detection with overlap; test-time multi-view (center, left, right crops) for robustness; resolution trade: 224² standard, 448² informed for small objects (traffic, sports) — compute scales quadratically; the profiling first principle: measure temporal receptive field needs — many actions need only 32 frames, streaming them thin beats frame-dense models nobody can serve.`,
      },
      {
        title: "3D CNNs and two-stream: classic mechanics.",
        body: `C3D: 3×3×3 convolutions learned spatiotemporal filters from scratch — expensive but foundational; I3D: inflate ImageNet-pretrained 2D CNN weights into 3D — transfer learning works; two-stream: spatial stream sees RGB, temporal stream sees optical flow (precomputed TV-L1 or PWC-Net) — motion as explicit input — fusion at FC layers; SOTA-ish accuracy at high compute; optical flow estimation cost dominates — skip if model power available; SlowFast: two pathways, fast one with high frame rate + low channels (motion), slow with few frames + high channels (semantics) — elegant parameter economy; each pattern still lives in specific niches (flow for small-object motion).`,
      },
      {
        title: "Video transformers and video-language models.",
        body: `TimeSformer: ViT with space-time attention divided (divided space-time — attend space then time separately: linear-ish complexity) — simpler to train, long clips feasible; ViViT similar with tubelet embeddings (3D non-overlapping cubes); VideoMAE: mask 90% of cubes, reconstruct — self-supervised, outstanding transfer with little data; Video-language: VideoLLaMA/VideoLLaMA2, Qwen2-VL video mode, Gemini long context — video in, language out: "count the red cars; when does the vendor open the freezer?" — watch token economics: 1 fps long video = huge token counts; sampling + scene detection + transcript alignment is the practical pattern; video embeddings for search (VideoCLIP): clip↔text common space for retrieval.`,
      },
      {
        title: "Multi-object tracking: detection + association.",
        body: `Pipeline per frame: detector (YOLO/RT-DETR) → boxes → motion model (Kalman predicts next positions) → appearance embedder (ReIDNet per track) → association (ByteTrack: match high-score boxes first, then low — recovers occluded tracks; DeepSORT adds cosine on features) → track ID assignment + continuity rules; metrics: MOTA, IDF1, HOTA — IDF1 weights identity over box quality; challenges: occlusion, re-identification after exit, similar uniforms in sports, ID switches; production tip: never expose raw tracks to UX — smooth trajectories, hysteresis on state changes (in/out), grace windows before declaring lost-and-reacquire.`,
      },
      {
        title: "Applications: moderation, retail, manufacturing.",
        body: `Moderation: detect NSFW/violences/weapons across streams — frame-level detection + clip-level temporal head + attention over time — precision must exceed 99.9% for auto-takedown, else human-in-loop; Retail: people counting, dwell time heatmaps, queue length, shelf gap detection — privacy-preserving (face-blurred, no identity storage) — edge boxes, no cloud video egress; Manufacturing: PPE compliance, distracted forklift, quality defects on moving line — frame-rate 10-15fps, alert <2s from violation; Sports: highlight generation via event detection + tracking → auto-clip from multi-hour feeds; each domain sizes models differently — the antennae of the industry.`,
      },
    ],
    worked: [
      {
        title: "Forklift-basket detection in a 24/7 warehouse stream.",
        body: `Customer: detect pedestrian-in-forklift-basket violations across 30 feeds. Pipeline: YOLOv8m finetuned (person + basket class, 3k annotated frames) at 10fps → ByteTrack IDs → rule engine: person unstayably inside basket polygon for >2s → alert; precision 97%, recall 92% after hard-negative rounds (shadows, reflections); latency end-to-end 180ms; 8 installations; incident rate dropped 70% attributable; the vendor pivoted from demo to product line; the safety officer presented at the industry expo with the before/after charts.`,
      },
      {
        title: "Retail dwell-time engine lifts conversion 11%.",
        body: `Luxury cosmetics chain: track anonymous shoppers through zone dwell times with no identity storage (blurring at ingest); zone polygons per fixture; dwell heatmaps per hour; merchandising re-arranged high-margin SKUs to high-dwell zones; 90-day before/after: conversion +11%, attach-rate +8%; privacy review passed because nothing leaves the store boxes (edge-only inference); the data WAS the product — nobody watched anyone, yet everyone saw everything; the architecture pattern exported to 40 stores.`,
      },
      {
        title: "Video-language QA automates compliance audits.",
        body: `Task: quarterly audit of 300 retail-floor videos for "employees wearing badges correctly." Manual: 2 weeks/associate. VLM pipeline (Qwen2-VL): transcribe floor speech + scene captioning + frame sampling 2fps + rule checks via prompt rubric with citations of timestamps; draft report per video; human reviewer verifies flagged clips only (18%); audit time 2 weeks→2 days; accuracy on badge detection 94% vs human 91% (humans drift too); the auditor no longer watches — she arbitrates; the department retrained auditors as rubric authors.`,
      },
    ],
    exam: [
      {
        question:
          "Why does ByteTrack beat DeepSORT on many benchmarks with no appearance model?",
        answer:
          "Treating low-confidence detections as first-class association citizens instead of discarding them preserves trajectories through occlusion — where most ID switches happen; motion alone, done correctly with two-stage matching, outperforms fancy embeddings misused; the 80/20 of tracking is matching discipline, not ReID.",
      },
      {
        question: "Why does VideoMAE mask 90% of inputs when images mask 75%?",
        answer:
          "Temporal redundancy: consecutive frames share enormous visual overlap — masking 75% in video leaks the answer through neighbors; 90% forces genuine spatiotemporal inference about motion and causality, not interpolation; the ratio is calibrated to how much redundancy time provides.",
      },
      {
        question: "Why is uniform frame sampling a hidden cost center?",
        answer:
          "It ignores information density — most frames are redundant, some are everything; adaptive sampling by scene change/motion cuts compute 4-10x with no accuracy loss; every frame processed that teaches the model nothing is money burned twice: once in compute, once in latency.",
      },
      {
        question:
          "What is the real privacy advantage of edge-only video inference?",
        answer:
          "No footage crosses a network — the ultimate data boundary; subpoenas and breaches hit empty archives; aggregate counts cross freely because there is nothing to reconstruct; privacy by absence, not policy — the only guarantee that scales.",
      },
    ],
    cheat: [
      "8-16 frames/clip; scene-detect for long form; resolution per object size.",
      "Start: pretrained 3D CNN or ViViT; VideoMAE when labels scarce.",
      "Tracking: detector + Kalman + ByteTrack; smooth UX; hysteresis.",
      "Moderation needs >99.9% precision or humans; PPE/retail: edge-only.",
      "VLM for QA with timestamp citations; never raw 10-min context.",
      "Report IDF1/HOTA for tracking, mAP for detection, always latency.",
    ],
    recap: `Video understanding is temporal vision, not timestamped stills: efficient frame sampling, 3D convolutions and divided space-time attention for perception, ByteTrack-class association for identity, video-language models for reasoning over motion — deployed at the edge under privacy constraints, measured in IDF1 and uptime, because what happens in the frame before last is where the future is decided.`,
    code: {
      title: "Video sampling scaffold",
      language: "python",
      code: `idxs = np.linspace(0, len(frames) - 1, 16).astype(int); clip = video[idxs]`,
      explanation:
        "Sixteen frames spread evenly — the cheapest 90% of a video model, before a single FLOP is purchased.",
    },
    diagram: {
      title: "Video pipeline",
      caption: "Sample, detect, track, reason.",
      mermaid: `flowchart LR\n V[Video] --> S[Sample frames]\n S --> D[Detect and track]\n D --> Q[Video-language reasoning]`,
    },
  },
};

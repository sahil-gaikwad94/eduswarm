import React, { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion,
  useScroll, useSpring, useTransform,
} from 'framer-motion';
import confetti from 'canvas-confetti';
import { Brand } from '../components/ui';
import { Mascot, Sparkles, type MascotMood } from '../components/Mascot';
import { apiGet } from '../lib/api';

/**
 * The EduSwarm landing page — a small film, not a brochure.
 *
 * Doddly fronts a scroll-driven story: hero with parallax + cursor-tracking
 * eyes, a subject marquee, a feature bento, a three-act "how it works" with
 * mascot moods, tilt-reactive universe cards, the Reading Room shelf, and a
 * final invitation. All motion respects prefers-reduced-motion.
 */

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// ---------------------------------------------------------------- helpers

function Reveal({ children, delay = 0, y = 28, className = '' }: {
  children: React.ReactNode; delay?: number; y?: number; className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.7, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-30px' });
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, { duration: 1.5, ease: 'easeOut', onUpdate: (v) => setValue(Math.round(v)) });
    return () => controls.stop();
  }, [inView, to]);
  return <span ref={ref}>{value}{suffix}</span>;
}

const HERO_WORDS = ['crack GATE.', 'ship real apps.', 'master AI.', 'make it stick.'];

function RotatingWord() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIndex((n) => (n + 1) % HERO_WORDS.length), 2400);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="l2-word-mask">
      <AnimatePresence mode="wait">
        <motion.em
          key={index}
          initial={{ y: '0.75em', opacity: 0, rotate: 3 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: '-0.75em', opacity: 0, rotate: -3 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        >
          {HERO_WORDS[index]}
        </motion.em>
      </AnimatePresence>
    </span>
  );
}

const EMBERS = [
  { left: '6%', size: 5, dur: 12, delay: 0, color: '#f04e2c' },
  { left: '14%', size: 3, dur: 10, delay: 3, color: '#ffe285' },
  { left: '26%', size: 4, dur: 14, delay: 6, color: '#7557f5' },
  { left: '38%', size: 3, dur: 9, delay: 1.5, color: '#f04e2c' },
  { left: '52%', size: 5, dur: 13, delay: 4.5, color: '#bdf47c' },
  { left: '63%', size: 3, dur: 10, delay: 7, color: '#f04e2c' },
  { left: '74%', size: 4, dur: 12, delay: 2, color: '#ffe285' },
  { left: '84%', size: 3, dur: 9.5, delay: 5.5, color: '#f04e2c' },
  { left: '92%', size: 4, dur: 14, delay: 8.5, color: '#7557f5' },
  { left: '31%', size: 2.5, dur: 11, delay: 9, color: '#bdf47c' },
  { left: '58%', size: 3, dur: 12.5, delay: 1.2, color: '#ff9d76' },
  { left: '88%', size: 2.5, dur: 10.5, delay: 6.8, color: '#ff9d76' },
];

/** Tiny embers drifting up through the hero — the flame's warmth, in motion. */
function Embers() {
  return (
    <div className="l2-embers" aria-hidden>
      {EMBERS.map((e, i) => (
        <span
          key={i}
          className="l2-ember"
          style={{
            left: e.left, width: e.size, height: e.size, background: e.color,
            animationDuration: `${e.dur}s`, animationDelay: `-${e.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 170, damping: 16 });
  const sry = useSpring(ry, { stiffness: 170, damping: 16 });
  return (
    <motion.div
      className={className}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 900 }}
      onMouseMove={(e) => {
        const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        ry.set(((e.clientX - r.left) / r.width - 0.5) * 9);
        rx.set(-((e.clientY - r.top) / r.height - 0.5) * 9);
      }}
      onMouseLeave={() => { rx.set(0); ry.set(0); }}
    >
      {children}
    </motion.div>
  );
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const DODDLY_CHEERS = [
  'Let’s learn! ✦',
  'You + me = momentum.',
  'Catch the spark — let’s go!',
  'One topic at a time!',
  'I believe in you. Obviously.',
  'That’s the spirit! Again!',
];

/** A button that leans toward the cursor, like it wants to be clicked. */
function Magnetic({ children, strength = 12 }: { children: React.ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 240, damping: 16 });
  const sy = useSpring(y, { stiffness: 240, damping: 16 });
  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy, display: 'inline-block' }}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        x.set(((e.clientX - r.left) / r.width - 0.5) * strength);
        y.set(((e.clientY - r.top) / r.height - 0.5) * strength);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
    >
      {children}
    </motion.div>
  );
}

// ------------------------------------------------------------------- data

const MARQUEE = [
  'Discrete Math', 'React & Next.js', 'Transformers', 'SQL & Joins', 'Dynamic Programming',
  'Karnaugh Maps', 'RAG Systems', 'Operating Systems', 'PyTorch', 'B+ Trees', 'System Design',
  'Pumping Lemmas', 'TypeScript', 'Diffusion Models', 'TCP / IP', 'Flexbox & Grid', 'RLHF',
  'Compiler Design', 'Docker & CI/CD', 'Graph Algorithms',
];

const FEATURES: Array<{ icon: string; span: string; tint: string; title: string; copy: string; chips: string[] }> = [
  {
    icon: '✦', span: 'wide', tint: 'violet', title: 'Meet your learning swarm',
    copy: 'A Dean-led team of AI agents — Researcher, Notes Author, Practice Team, Fact-Checker and Publisher — builds every study kit before you see it.',
    chips: ['Dean', 'Researcher', 'Notes', 'Practice', 'Fact-check', 'Publisher'],
  },
  {
    icon: '✓', span: '', tint: 'lime', title: 'Evidence-gated lessons',
    copy: 'Nothing ships without cited claims. Every kit carries its sources and a verification stamp you can actually check.',
    chips: [],
  },
  {
    icon: '▤', span: '', tint: 'gold', title: 'Spaced repetition',
    copy: 'Flashcards scheduled by SM-2 — grade Again, Hard, Good or Easy and the scheduler remembers so you don’t have to.',
    chips: [],
  },
  {
    icon: '◷', span: '', tint: 'peach', title: 'Mocks with real marking',
    copy: 'Timed papers with GATE negative marking, a question palette, flags, and a mistake notebook that files every error for you.',
    chips: [],
  },
  {
    icon: '</>', span: '', tint: 'sky', title: 'A sandboxed code lab',
    copy: 'Run JavaScript against hidden tests with an AI code reviewer looking over your shoulder. Break things safely.',
    chips: [],
  },
  {
    icon: '❖', span: 'wide', tint: 'violet', title: 'The Reading Room',
    copy: 'The internet’s most insightful free blogs — Lil’ Log, Josh Comeau, OSTEP and friends — curated per universe and matched to your syllabus.',
    chips: ['Lil’ Log', 'Josh Comeau', 'OSTEP', 'GATE Overflow'],
  },
];

const STEPS: Array<{ n: string; title: string; copy: string; mood: MascotMood; accent: string }> = [
  { n: '01', title: 'Pick your universe', copy: 'GATE CSE, Full-stack Engineering or AI/ML — each with a complete, module-by-module syllabus.', mood: 'think', accent: 'violet' },
  { n: '02', title: 'Follow today’s mission', copy: 'The Dean ranks your highest-impact next action. Do the top item and the day counts.', mood: 'wave', accent: 'gold' },
  { n: '03', title: 'Watch momentum compound', copy: 'XP, streaks, mastery maps and spaced reviews turn small sessions into an unshakeable score.', mood: 'cheer', accent: 'lime' },
];

const UNIVERSE_CARDS = [
  { id: 'gate-cs', title: 'GATE CSE', tag: 'PYQ-first', glyph: '∑', blurb: 'Every official syllabus subject — math to networks — with PYQ marathons and full mocks.', tone: 'violet' },
  { id: 'web-dev', title: 'Full-stack Engineering', tag: 'Build-ready', glyph: '</>', blurb: 'HTML to system design: TypeScript, React, Node, databases, testing and production.', tone: 'lime' },
  { id: 'ai-ml', title: 'AI / ML Engineering', tag: 'Model-native', glyph: 'λ', blurb: 'Python, classical ML, deep learning, LLM apps, RAG, and MLOps that survives contact with users.', tone: 'peach' },
];

const SHELF_TEASERS = [
  { title: 'Lil’ Log', publisher: 'Lilian Weng', universe: 'AI / ML', blurb: 'The most cited ML blog on the internet — exhaustive surveys of agents, RLHF and diffusion.' },
  { title: 'Josh W Comeau', publisher: 'Josh W Comeau', universe: 'Full-stack', blurb: 'Interactive deep dives on CSS layout and React rendering that make frontend click.' },
  { title: 'OSTEP', publisher: 'Arpaci-Dusseau', universe: 'GATE CSE', blurb: 'The beloved free operating-systems book — virtualization, concurrency and persistence.' },
];

const FALLBACK_COUNTS: Record<string, { topics: number; modules: number }> = {
  'gate-cs': { topics: 87, modules: 12 }, 'web-dev': { topics: 75, modules: 11 }, 'ai-ml': { topics: 75, modules: 12 },
};

// ------------------------------------------------------------------- page

export function Landing({ onSignIn, error }: { onSignIn: () => void; error?: string }) {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progressScale = useSpring(scrollYProgress, { stiffness: 140, damping: 22 });
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 620], [0, reduced ? 0 : 80]);
  const chipsY = useTransform(scrollY, [0, 620], [0, reduced ? 0 : -90]);
  const glowOpacity = useTransform(scrollY, [0, 400], [1, 0.25]);

  const [counts, setCounts] = useState(FALLBACK_COUNTS);
  useEffect(() => {
    apiGet('/api/universes')
      .then((d) => setCounts(Object.fromEntries((d.universes || []).map((u: any) => [u.goal, { topics: u.topics, modules: u.modules }]))))
      .catch(() => {});
  }, []);

  // Doddly is alive: poke him and he dances, cheers, and rains confetti.
  const [doddlyMood, setDoddlyMood] = useState<'watching' | 'dance' | 'cheer'>('watching');
  const [bubble, setBubble] = useState<string | null>(null);
  const doddlyRef = useRef<HTMLDivElement>(null);
  const moodTimer = useRef<number>(0);
  const bubbleTimer = useRef<number>(0);
  const pokeDoddly = () => {
    setDoddlyMood((m) => (m === 'dance' ? 'cheer' : 'dance'));
    setBubble(DODDLY_CHEERS[Math.floor(Math.random() * DODDLY_CHEERS.length)]);
    const rect = doddlyRef.current?.getBoundingClientRect();
    if (rect) {
      confetti({
        particleCount: 80, spread: 64, startVelocity: 26, gravity: 0.9, ticks: 160,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height * 0.35) / window.innerHeight,
        },
        colors: ['#f04e2c', '#7557f5', '#bdf47c', '#ffd8c2', '#ffe285', '#a78dff'],
      });
    }
    window.clearTimeout(moodTimer.current);
    window.clearTimeout(bubbleTimer.current);
    moodTimer.current = window.setTimeout(() => setDoddlyMood('watching'), 2400);
    bubbleTimer.current = window.setTimeout(() => setBubble(null), 2600);
  };
  useEffect(() => () => { window.clearTimeout(moodTimer.current); window.clearTimeout(bubbleTimer.current); }, []);

  const totalTutorials = Object.values(counts).reduce((sum, c) => sum + c.topics, 0);
  const totalModules = Object.values(counts).reduce((sum, c) => sum + c.modules, 0);

  return (
    <main className="l2">
      <motion.div className="l2-progress" style={{ scaleX: progressScale }} aria-hidden />

      {/* ------------------------------------------------------------- nav */}
      <nav className="l2-nav">
        <Brand />
        <div className="l2-nav-links">
          <button onClick={() => scrollToId('l2-why')}>Why EduSwarm</button>
          <button onClick={() => scrollToId('l2-how')}>How it works</button>
          <button onClick={() => scrollToId('l2-universes')}>Universes</button>
          <button onClick={() => scrollToId('l2-reading')}>Reading Room</button>
        </div>
        <button className="l2-signin" onClick={onSignIn}>Sign in <span>→</span></button>
      </nav>

      {/* ------------------------------------------------------------ hero */}
      <section className="l2-hero">
        <div className="l2-hero-bg" aria-hidden>
          <Embers />
          <motion.span className="l2-glow l2-glow-a" style={{ opacity: glowOpacity }} />
          <motion.span className="l2-glow l2-glow-b" style={{ opacity: glowOpacity }} />
        </div>

        <div className="l2-hero-copy">
          <motion.p
            className="l2-eyebrow"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE_OUT }}
          >
            <span className="l2-eyebrow-dot" aria-hidden /> DEAN-LED AI LEARNING PLATFORM
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.08, ease: EASE_OUT }}
          >
            One calm swarm.<br />Infinite ways to <RotatingWord />
          </motion.h1>
          <motion.p
            className="l2-lead"
            initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.16, ease: EASE_OUT }}
          >
            EduSwarm turns giant syllabi into one clear mission a day. An AI team teaches, quizzes,
            fact-checks and cheers you on — while spaced repetition makes every hour stick.
          </motion.p>
          <motion.div
            className="l2-cta-row"
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.24, ease: EASE_OUT }}
          >
            <Magnetic>
              <button className="l2-cta primary" onClick={onSignIn}>Start learning free <span>↗</span></button>
            </Magnetic>
            <button className="l2-cta ghost" onClick={() => scrollToId('l2-how')}>Meet the swarm <span>↓</span></button>
          </motion.div>
          {error && <p className="error-copy l2-error">{error}</p>}
          <motion.div
            className="l2-stats"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.42 }}
          >
            <div><b><CountUp to={totalTutorials} /></b><small>tutorials</small></div>
            <div><b><CountUp to={totalModules} /></b><small>modules</small></div>
            <div><b><CountUp to={7} /></b><small>specialist agents</small></div>
            <div><b><CountUp to={54} /></b><small>free blogs curated</small></div>
          </motion.div>
        </div>

        <motion.div className="l2-hero-stage" style={{ y: heroY }}>
          <div className="l2-orbit l2-orbit-a" aria-hidden />
          <div className="l2-orbit l2-orbit-b" aria-hidden />
          <Sparkles radius={190} count={6} />
          <motion.div className="l2-chips" style={{ y: chipsY }} aria-hidden>
            <motion.span className="l2-chip chip-a" animate={{ y: [0, -10, 0] }} transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}>🔥 7-day streak</motion.span>
            <motion.span className="l2-chip chip-b" animate={{ y: [0, -12, 0] }} transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}>✓ Mock +12 marks</motion.span>
            <motion.span className="l2-chip chip-c" animate={{ y: [0, -9, 0] }} transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}>DP mastered</motion.span>
            <motion.span className="l2-chip chip-d" animate={{ y: [0, -11, 0] }} transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}>Transformers ✦</motion.span>
          </motion.div>
          <motion.div
            className="l2-miniflame"
            aria-hidden
            animate={{ x: [0, 130, 50, -100, -30, 0], y: [0, -70, -130, -60, -20, 0], rotate: [0, 12, -8, 10, -6, 0] }}
            transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Mascot size={52} mood="wave" />
          </motion.div>
          <motion.div
            className="l2-doddly"
            initial={{ opacity: 0, scale: 0.86, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 130, damping: 16, delay: 0.15 }}
          >
            <AnimatePresence>
              {bubble && (
                <motion.div
                  className="l2-bubble"
                  initial={{ opacity: 0, y: 12, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                >
                  {bubble}
                </motion.div>
              )}
            </AnimatePresence>
            <div
              ref={doddlyRef}
              className="l2-doddly-hit"
              role="button"
              tabIndex={0}
              title="Click Doddly!"
              onClick={pokeDoddly}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pokeDoddly(); } }}
            >
              <Mascot size={360} mood={doddlyMood} eyesFollow />
            </div>
          </motion.div>
          <div className="l2-peek-note" aria-hidden>
            <b>Psst… click Doddly. Move your cursor.</b><small>He’s watching you learn — and he loves a good spark.</small>
          </div>
        </motion.div>

        <motion.button
          className="l2-scroll-cue"
          onClick={() => scrollToId('l2-marquee')}
          animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          aria-label="Scroll down"
        >
          ↓
        </motion.button>
      </section>

      {/* --------------------------------------------------------- marquee */}
      <div className="l2-marquee" id="l2-marquee" aria-hidden>
        <div className="l2-marquee-track">
          {[...MARQUEE, ...MARQUEE].map((item, i) => (
            <span key={i}><i>✦</i>{item}</span>
          ))}
        </div>
      </div>

      {/* ----------------------------------------------------- feature bento */}
      <section className="l2-section" id="l2-why">
        <Reveal>
          <div className="l2-head">
            <p className="l2-eyebrow">WHY LEARNERS STAY</p>
            <h2 className="l2-h2">Everything a serious learner needs.<br /><em>Nothing that wastes a minute.</em></h2>
          </div>
        </Reveal>
        <div className="l2-bento">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={Math.min(i * 0.07, 0.35)} className={f.span}>
              <div className={`l2-card ${f.span} tint-${f.tint}`}>
                <span className="l2-card-icon" aria-hidden>{f.icon}</span>
                <div>
                  <h3>{f.title}</h3>
                  <p>{f.copy}</p>
                  {f.chips.length > 0 && (
                    <div className="l2-pipeline">
                      {f.chips.map((c, j) => (
                        <React.Fragment key={c}>
                          <span className="l2-pipe-chip">{c}</span>
                          {j < f.chips.length - 1 && <i className="l2-pipe-arrow" aria-hidden>→</i>}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------ how it works */}
      <div className="l2-band l2-band-how">
        <section className="l2-section l2-how" id="l2-how">
          <Reveal>
            <div className="l2-head">
              <p className="l2-eyebrow">HOW IT WORKS</p>
              <h2 className="l2-h2">Three moves. <em>Compounding momentum.</em></h2>
            </div>
          </Reveal>
          <div className="l2-steps">
            {STEPS.map((step, i) => (
              <Reveal key={step.n} delay={i * 0.12}>
                <div className={`l2-step accent-${step.accent}`}>
                  <div className="l2-step-mascot">
                    <Mascot size={104} mood={step.mood} />
                  </div>
                  <span className="l2-step-n" aria-hidden>{step.n}</span>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </div>

      {/* -------------------------------------------------------- universes */}
      <section className="l2-section" id="l2-universes">
        <Reveal>
          <div className="l2-head">
            <p className="l2-eyebrow">CHOOSE YOUR UNIVERSE</p>
            <h2 className="l2-h2">Complete syllabi. <em>Zero guesswork.</em></h2>
          </div>
        </Reveal>
        <div className="l2-universes">
          {UNIVERSE_CARDS.map((u, i) => (
            <Reveal key={u.id} delay={i * 0.12}>
              <TiltCard className={`l2-universe tone-${u.tone}`}>
                <div className="l2-universe-top">
                  <span className="l2-universe-tag">{u.tag}</span>
                  <span className="l2-universe-glyph" aria-hidden>{u.glyph}</span>
                </div>
                <h3>{u.title}</h3>
                <p>{u.blurb}</p>
                <div className="l2-universe-meta">
                  <span><b>{counts[u.id]?.topics ?? '—'}</b> tutorials</span>
                  <span><b>{counts[u.id]?.modules ?? '—'}</b> modules</span>
                </div>
                <button className="l2-universe-cta" onClick={onSignIn}>Enter universe →</button>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------- reading room */}
      <div className="l2-band l2-band-reading">
        <section className="l2-section l2-reading" id="l2-reading">
          <Reveal>
            <div className="l2-head">
              <p className="l2-eyebrow">THE READING ROOM</p>
              <h2 className="l2-h2">The internet’s best free blogs,<br /><em>already sorted onto your shelf.</em></h2>
              <p className="l2-reading-lead">
                54 genuinely insightful, completely free reads — curated per universe and matched to your
                syllabus modules. The shelf restocks itself when you switch universes.
              </p>
            </div>
          </Reveal>
          <div className="l2-shelf">
            {SHELF_TEASERS.map((r, i) => (
              <Reveal key={r.title} delay={i * 0.1}>
                <div className="l2-book">
                  <span className="l2-book-universe">{r.universe}</span>
                  <h3>{r.title}</h3>
                  <p className="l2-book-pub">{r.publisher}</p>
                  <p>{r.blurb}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </div>

      {/* ---------------------------------------------------------- finale */}
      <section className="l2-finale">
        <div className="l2-finale-glow" aria-hidden />
        <Reveal y={34}>
          <div className="l2-finale-card">
            <div className="l2-finale-doddly">
              <Sparkles radius={110} count={5} />
              <Mascot size={200} mood="cheer" />
            </div>
            <div>
              <h2>Your swarm is ready.</h2>
              <p>One goal. One calm mission a day. A team of agents that never gets tired of teaching you.</p>
              <button className="l2-cta primary big" onClick={onSignIn}>Start learning free <span>↗</span></button>
              <small>Free to start · Sign in with Google · Your universe awaits</small>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="l2-footer">
        <Brand />
        <p>Made with <span aria-hidden>✦</span> by EduSwarm — learn in layers, practice that remembers, momentum you can see.</p>
      </footer>
    </main>
  );
}

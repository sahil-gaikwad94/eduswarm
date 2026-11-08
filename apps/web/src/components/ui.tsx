import React, { useEffect, useRef, useState } from 'react';
import { API, apiGet, apiPost, type Page, type Topic } from '../lib/api';
import { Mascot, MascotFace, Sparkles, type MascotMood } from './Mascot';

export function Brand() {
  return <span className="brand"><span className="brand-mark">✦</span> EduSwarm</span>;
}

const LOADING_QUIPS = [
  'Waking up your study buddy…',
  'Doddly is lighting the syllabus on fire…',
  'Doing a little victory dance…',
  'Untangling the syllabus…',
  'Sharpening the flashcards…',
  'Gathering sparks from the best blogs…',
  'Warming up the learning swarm…',
];

const LOADER_MOODS: MascotMood[] = ['watching', 'walk', 'wave', 'dance', 'cheer', 'gusto'];

export function LoadingScreen({ label = 'Loading your learning universe…' }: { label?: string }) {
  const [quip, setQuip] = useState(0);
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const q = setInterval(() => setQuip((n) => (n + 1) % LOADING_QUIPS.length), 2000);
    const p = setInterval(() => setPhase((n) => (n + 1) % LOADER_MOODS.length), 2600);
    return () => { clearInterval(q); clearInterval(p); };
  }, []);
  return (
    <main className="loader-screen">
      <div className="loader-bg" aria-hidden>
        <span className="blob blob-a" /><span className="blob blob-b" /><span className="blob blob-c" />
      </div>
      <div className="loader-inner">
        <div className="loader-brand"><Brand /></div>
        <div className="loader-stage">
          <span className="loader-shadow" aria-hidden />
          <Sparkles radius={120} count={5} />
          <div className="loader-mascot">
            <Mascot size={215} mood={LOADER_MOODS[phase]} />
          </div>
        </div>
        <h1 className="loader-title">{label}</h1>
        <p className="loader-quip" key={quip}>{LOADING_QUIPS[quip]}</p>
        <div className="loader-track" aria-hidden><span className="loader-fill" /></div>
        <div className="loader-dots" aria-hidden><i /><i /><i /></div>
      </div>
    </main>
  );
}

export function Nav({ active, label, icon, onClick }: { active: boolean; label: string; icon: string; onClick: () => void }) {
  return (
    <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
      <span>{icon}</span>{label}
    </button>
  );
}

export function Avatar({ size = 'small' }: { kind?: string; size?: string }) {
  return (
    <span className={`agent-avatar doddly-avatar ${size}`}>
      <MascotFace />
    </span>
  );
}

export function Empty({ title, text, actionLabel, onClick }: { title: string; text: string; actionLabel?: string; onClick: () => void }) {
  return (
    <section className="empty-feature card">
      <div className="empty-icon">✦</div>
      <h2>{title}</h2>
      <p>{text}</p>
      <button onClick={onClick}>{actionLabel || 'Go to current lesson →'}</button>
    </section>
  );
}

export function JobCard({ job }: { job: any }) {
  return (
    <section className="job-progress card">
      <p className="label">THE TEAM IS WORKING</p>
      <h2>{job.stage || 'Dean'} is on it</h2>
      <p>{job.message}</p>
      <div className="progress-track"><i style={{ width: '68%' }} /></div>
      <p>Researching · writing · checking · publishing</p>
    </section>
  );
}

// ------------------------------------------------------------ search palette

export function SearchPalette({ goal, onClose, onNavigate }: { goal: string; onClose: () => void; onNavigate: (page: Page, topicId?: string) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>({ topics: [], questions: [], lessons: [] });
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (query.trim().length < 2) { setResults({ topics: [], questions: [], lessons: [] }); return; }
    setBusy(true);
    const timer = window.setTimeout(() => {
      apiGet(`/api/search?q=${encodeURIComponent(query)}&goal=${encodeURIComponent(goal)}`)
        .then(setResults)
        .catch(() => {})
        .finally(() => setBusy(false));
    }, 220);
    return () => window.clearTimeout(timer);
  }, [query, goal]);

  const go = (page: Page, topicId?: string) => { onClose(); onNavigate(page, topicId); };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="search-palette card" onClick={(e) => e.stopPropagation()}>
        <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search topics, questions, saved lessons… (Esc to close)" />
        {busy && <p className="muted">Searching…</p>}
        {!busy && query.trim().length >= 2 && !results.topics.length && !results.questions.length && !results.lessons.length && (
          <p className="muted">No matches — try “scheduling”, “joins”, or “attention”.</p>
        )}
        {results.topics.length > 0 && (
          <div className="search-group">
            <p className="label">TOPICS</p>
            {results.topics.map((t: Topic) => (
              <button key={t.id} onClick={() => go('lesson', t.id)}><b>{t.title}</b><small>{t.module}</small></button>
            ))}
          </div>
        )}
        {results.questions.length > 0 && (
          <div className="search-group">
            <p className="label">QUESTIONS</p>
            {results.questions.map((q: any) => (
              <button key={q.id} onClick={() => go('practice')}><b>{q.question.slice(0, 90)}{q.question.length > 90 ? '…' : ''}</b><small>{q.subject} · {q.topic} · {q.difficulty}</small></button>
            ))}
          </div>
        )}
        {results.lessons.length > 0 && (
          <div className="search-group">
            <p className="label">SAVED LESSONS</p>
            {results.lessons.map((lesson: any) => (
              <button key={lesson.topicId} onClick={() => go('lesson', lesson.topicId)}><b>{lesson.title}</b><small>Saved {new Date(lesson.savedAt).toLocaleDateString()}</small></button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// -------------------------------------------------------- rich text + diagrams

function Inline({ text }: { text: string }) {
  const parts = String(text).split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
        if (part.startsWith('`') && part.endsWith('`')) return <code key={i} className="inline-code">{part.slice(1, -1)}</code>;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

/** Minimal renderer for lesson bodies: paragraphs, bullets, tables, fences. */
export function RichText({ text }: { text: string }) {
  const blocks = String(text || '').split('\n\n');
  return (
    <>
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (/^```/.test(trimmed)) {
          const code = trimmed.replace(/^```\w*\n?/, '').replace(/```$/, '');
          return <pre key={i} className="rich-code"><code>{code}</code></pre>;
        }
        if (trimmed.split('\n').every((line) => /^\s*\|.*\|\s*$/.test(line))) {
          const rows = trimmed.split('\n').map((line) => line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));
          const body = rows.filter((r) => !r.every((c) => /^:?-{2,}:?$/.test(c)));
          return (
            <div key={i} className="rich-table-wrap">
              <table className="rich-table">
                <thead><tr>{body[0].map((c, j) => <th key={j}><Inline text={c} /></th>)}</tr></thead>
                <tbody>{body.slice(1).map((r, ri) => <tr key={ri}>{r.map((c, j) => <td key={j}><Inline text={c} /></td>)}</tr>)}</tbody>
              </table>
            </div>
          );
        }
        if (trimmed.split('\n').every((line) => /^\s*[•\-*]\s+/.test(line))) {
          return (
            <ul key={i} className="rich-list">
              {trimmed.split('\n').map((line, j) => <li key={j}><Inline text={line.replace(/^\s*[•\-*]\s+/, '')} /></li>)}
            </ul>
          );
        }
        return <p key={i}><Inline text={trimmed} /></p>;
      })}
    </>
  );
}

export function Mermaid({ chart, chartId }: { chart: string; chartId: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    import('mermaid')
      .then(({ default: mermaid }) => {
        if (cancelled) return;
        mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'strict' });
        return mermaid.render(`mmd-${chartId}`, chart).then(({ svg }) => {
          if (!cancelled && ref.current) ref.current.innerHTML = svg;
        });
      })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [chart, chartId]);

  if (failed) return <pre className="rich-code"><code>{chart}</code></pre>;
  return <div className="mermaid-chart" ref={ref} role="img" aria-label="Concept diagram" />;
}

/** Top-right account menu: utilities live here, not in primary navigation. */
export function AvatarMenu({ name, onNavigate, onSignOut }: { name: string; onNavigate: (page: Page) => void; onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (event: MouseEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false); };
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);
  const initial = (name?.trim()?.[0] || 'S').toUpperCase();
  const item = (page: Page, icon: string, label: string) => (
    <button role="menuitem" onClick={() => { setOpen(false); onNavigate(page); }}><span aria-hidden>{icon}</span>{label}</button>
  );
  return (
    <div className="avatar-menu" ref={ref}>
      <button className="profile-chip" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span className="initial-avatar">{initial}</span>
        <span className="profile-chip-name">{name}</span>
        <span className="profile-chip-caret" aria-hidden>{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div className="avatar-menu-panel" role="menu" aria-label="Account">
          <p className="avatar-menu-label">YOUR CORNER</p>
          {item('profile', '◉', 'Profile & goals')}
          {item('progress', '↗', 'Progress & achievements')}
          {item('mistakes', '!', 'Mistake notebook')}
          {item('plan', '◈', "Today's mission")}
          <div className="avatar-menu-divider" />
          <button role="menuitem" className="avatar-menu-danger" onClick={() => { setOpen(false); onSignOut(); }}><span aria-hidden>↪</span>Log out</button>
        </div>
      )}
    </div>
  );
}

/** Guest-mode gate shown whenever a read-only visitor tries a write action. */
export function SignInSheet({ onClose, onSignIn }: { onClose: () => void; onSignIn: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Sign in to continue" onClick={onClose}>
      <section className="signin-sheet card" onClick={(event) => event.stopPropagation()}>
        <button className="close-button" onClick={onClose} aria-label="Close">×</button>
        <Avatar />
        <h2>Sign in to make it yours.</h2>
        <p>Everything is readable for free — full lessons, PYQ labs, the Reading Room, and the community feed. Create a free account to save your streak, mistakes, notes, and badges.</p>
        <button onClick={onSignIn}>Continue with Google →</button>
        <small className="signin-sheet-note">The GATE universe stays free forever · no card, no trial clock</small>
      </section>
    </div>
  );
}

// --------------------------------------------------------------- onboarding

const GOAL_OPTIONS = [
  { id: 'gate-cs', title: 'GATE CSE · Complete', desc: 'Aptitude to advanced CS with PYQs and mocks.' },
  { id: 'web-dev', title: 'Full-stack · Everything', desc: 'Frontend to production engineering with code labs.' },
  { id: 'ai-ml', title: 'AI / ML · Everything', desc: 'Python to RAG systems and LLM engineering.' },
];

export function Onboarding({ user, onDone }: { user: any; onDone: (user: any) => void }) {
  const [name, setName] = useState(user?.name && user.name !== 'Demo Learner' ? user.name : '');
  const [goal, setGoal] = useState('gate-cs');
  const [dailyMinutes, setDailyMinutes] = useState(60);
  const [targetDate, setTargetDate] = useState('');
  const [level, setLevel] = useState('beginner');
  const [leveledBy, setLeveledBy] = useState('self');
  const [view, setView] = useState<'form' | 'diagnostic'>('form');
  const [questions, setQuestions] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const startDiagnostic = async () => {
    setBusy(true); setError('');
    try {
      const data = await apiGet('/api/diagnostic');
      setQuestions(data.questions || []);
      setAnswers([]);
      setIndex(0);
      setView('diagnostic');
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  };

  const answerDiagnostic = async (selected: number) => {
    const next = [...answers, { questionId: questions[index].id, selected }];
    if (index + 1 < questions.length) { setAnswers(next); setIndex(index + 1); return; }
    setBusy(true);
    try {
      const result = await apiPost('/api/diagnostic', { answers: next });
      setLevel(result.recommendedLevel);
      setLeveledBy(`diagnostic (${result.score}/${result.total})`);
      setView('form');
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      const titles: Record<string, string> = { 'gate-cs': 'Clear GATE CS', 'web-dev': 'Become job-ready full-stack', 'ai-ml': 'Ship real AI systems' };
      const updated = await apiPost('/api/onboarding', {
        name: name.trim() || 'Learner', goal, goalTitle: titles[goal],
        dailyMinutes, targetDate: targetDate || null, skillLevel: level,
      });
      try { localStorage.setItem('eduswarm.goal', goal); } catch { /* private mode */ }
      onDone(updated);
    } catch (e: any) { setError(e.message); setBusy(false); }
  };

  if (view === 'diagnostic' && questions.length > 0) {
    const q = questions[index];
    return (
      <main className="center">
        <section className="onboard card">
          <Brand />
          <p className="eyebrow" style={{ marginTop: 28 }}>60-SECOND DIAGNOSTIC · {index + 1} OF {questions.length}</p>
          <h2>{q.question}</h2>
          <div className="options">
            {q.options.map((o: string, j: number) => (
              <button className="option" key={o} disabled={busy} onClick={() => void answerDiagnostic(j)}>
                <span>{String.fromCharCode(65 + j)}</span>{o}
              </button>
            ))}
          </div>
          <p className="muted">No pressure — this only calibrates your starting level.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="center">
      <section className="onboard card">
        <Brand />
        <h1>Design your learning universe.</h1>
        <p>One goal, one daily budget, one adaptive plan. The agent team handles the rest.</p>
        <form onSubmit={submit}>
          <label>Your name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Aarav Sharma" /></label>
          <label>Learning universe
            <select value={goal} onChange={(e) => setGoal(e.target.value)}>
              {GOAL_OPTIONS.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
            </select>
          </label>
          <p className="muted">{GOAL_OPTIONS.find((g) => g.id === goal)?.desc}</p>
          <div className="form-row">
            <label>Minutes per day<input type="number" min={15} max={240} value={dailyMinutes} onChange={(e) => setDailyMinutes(Number(e.target.value))} /></label>
            <label>Target date (optional)<input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} /></label>
          </div>
          <div className="form-row">
            <label>Starting level
              <select value={level} onChange={(e) => { setLevel(e.target.value); setLeveledBy('self'); }}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </label>
            <label>&nbsp;<button type="button" className="secondary-button" disabled={busy} onClick={() => void startDiagnostic()}>✦ Calibrate with diagnostic</button></label>
          </div>
          {leveledBy !== 'self' && <p className="muted">Level set by {leveledBy} — you can still change it.</p>}
          {error && <p className="error-copy">{error}</p>}
          <button disabled={busy}>{busy ? 'Setting up…' : 'Start learning →'}</button>
        </form>
        <p className="muted" style={{ marginTop: 14 }}>API: {API}</p>
      </section>
    </main>
  );
}

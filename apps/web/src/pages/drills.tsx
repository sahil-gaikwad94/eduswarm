import React, { useEffect, useRef, useState } from 'react';
import { Icon, Diamond } from '../components/Icon';
import { API, apiGet, apiPost } from '../lib/api';
import { Empty } from '../components/ui';
import { Mistakes } from './insight';

const opts = { credentials: 'include' as const };

// -------------------------------------------------------------------- quiz

export function Quiz({ course, topicId, readOnly }: { course: string; topicId?: string; readOnly?: boolean }) {
  const [qs, setQs] = useState<any[]>([]);
  const [filters, setFilters] = useState<any>({ subjects: [], topics: [], years: [] });
  const [subject, setSubject] = useState('all');
  const [topic, setTopic] = useState('all');
  const [year, setYear] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [adaptive, setAdaptive] = useState(false);
  const [strategy, setStrategy] = useState('');
  const [error, setError] = useState('');
  const source = course === 'gate-cs' ? 'gate-pyq' : 'practice';

  const load = async (nextSubject = subject, nextTopic = topic, nextYear = year, nextDifficulty = difficulty) => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ course, source, subject: nextSubject, topic: nextTopic, year: nextYear, difficulty: nextDifficulty });
      const r = await fetch(`${API}/api/quiz/catalog?${params}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Unable to load questions');
      setQs(d.questions || []); setFilters(d.filters || { subjects: [], topics: [], years: [] });
      setAdaptive(false); setStrategy(''); setI(0); setAnswer(null);
    } catch (e: any) { setError(e.message || 'Unable to load questions'); } finally { setLoading(false); }
  };

  useEffect(() => { setSubject('all'); setTopic('all'); setYear('all'); setDifficulty('all'); void load('all', 'all', 'all', 'all'); }, [course]);

  const select = (kind: string, value: string) => {
    if (kind === 'subject') { setSubject(value); setTopic('all'); void load(value, 'all', year, difficulty); }
    else if (kind === 'topic') { setTopic(value); void load(subject, value, year, difficulty); }
    else if (kind === 'year') { setYear(value); void load(subject, topic, value, difficulty); }
    else { setDifficulty(value); void load(subject, topic, year, value); }
  };

  const loadAdaptive = async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ course, subject, topic });
      const d = await apiGet(`/api/practice/adaptive?${params}`);
      if (!d.question) { setError(d.reason || 'No adaptive question is available for these filters.'); return; }
      setQs([d.question]); setAdaptive(true); setStrategy(d.strategy || 'build-recall'); setI(0); setAnswer(null);
    } catch (e: any) { setError(e.message || 'Unable to find a next question'); } finally { setLoading(false); }
  };

  const q = qs[i];
  const save = async (j: number, o: string) => {
    setAnswer(j);
    if (readOnly || !topicId || !q) return;
    await apiPost('/api/practice/attempts', {
      topicId, questionId: q.id || `quiz:${i}`, subject: q.subject, topic: q.topic, question: q.question,
      selectedAnswer: o, correctAnswer: q.options[q.answer], correct: j === q.answer, explanation: q.explanation,
      solution: {
        approach: 'Identify the governing concept, then test every option against its definition and one edge case.',
        stepByStep: ['Restate the question and identify the exact concept being tested.', 'State the definition, invariant, or constraint that governs the answer.', 'Test each option and explain why the distractors fail.', 'Verify the surviving answer with a small concrete example.'],
        whyItWorks: q.explanation, commonMistake: 'Choosing a familiar option without checking its assumptions.',
      },
    }).catch(() => {});
  };

  return (
    <>
      <div className="compact-heading">
        <div>
          <p className="eyebrow">PRACTICE · {course === 'gate-cs' ? 'GATE CSE PYQ' : 'CURRICULUM PRACTICE'}</p>
          <h1>{course === 'gate-cs' ? 'GATE CSE PYQ lab' : 'Practice lab'}</h1>
          <p className="lead">Filter by subject, topic, year, and difficulty. Every answer includes a worked explanation and is saved for revision.</p>
          <div className="practice-actions">
            <button onClick={() => void loadAdaptive()}>Give me my next best question</button>
            {adaptive && <span className="muted">{strategy === 'repair-repeated-mistake' ? 'Repairing a repeated weak area' : 'Building recall in this filter'}</span>}
          </div>
        </div>
      </div>
      <section className="quiz-filters card">
        <label>Subject<select value={subject} onChange={(e) => select('subject', e.target.value)}><option value="all">All subjects</option>{filters.subjects.map((v: string) => <option key={v}>{v}</option>)}</select></label>
        <label>Topic<select value={topic} onChange={(e) => select('topic', e.target.value)}><option value="all">All topics</option>{filters.topics.map((v: string) => <option key={v}>{v}</option>)}</select></label>
        <label>Year<select value={year} onChange={(e) => select('year', e.target.value)}><option value="all">All years</option>{filters.years.map((v: number) => <option key={v}>{v}</option>)}</select></label>
        <label>Difficulty<select value={difficulty} onChange={(e) => select('difficulty', e.target.value)}><option value="all">All levels</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label>
      </section>
      {error ? (
        <section className="empty-feature card"><h2>Questions could not load</h2><p>{error}</p><button onClick={() => void load()}>Try again</button></section>
      ) : loading ? (
        <Empty title="Loading the question bank" text="Preparing filtered questions." onClick={() => void load()} />
      ) : q ? (
        <section className="practice-card card">
          <div className="practice-meta"><span>{q.year} · {q.subject} · {q.topic} · {q.marks || 1} mark{q.marks > 1 ? 's' : ''}</span><span>QUESTION {i + 1} / {qs.length}</span></div>
          <h2>{q.question}</h2>
          <div className="options">
            {q.options.map((o: string, j: number) => (
              <button key={o} className={`option ${answer !== null && j === q.answer ? 'correct' : ''} ${answer === j && j !== q.answer ? 'incorrect' : ''}`} onClick={() => void save(j, o)}>
                <span>{String.fromCharCode(65 + j)}</span>{o}
              </button>
            ))}
          </div>
          {answer !== null && <div className={`feedback ${answer === q.answer ? 'good' : 'needs-work'}`}><b>{answer === q.answer ? 'Correct pattern.' : 'Review the invariant.'}</b><p>{q.explanation}</p></div>}
          <div className="practice-actions">
            <button className="secondary-button" onClick={() => { setI((i - 1 + qs.length) % qs.length); setAnswer(null); }}>← Previous</button>
            <button onClick={() => { setI((i + 1) % qs.length); setAnswer(null); }}>Next question →</button>
          </div>
        </section>
      ) : (
        <Empty title="No questions match these filters" text="Try another subject or topic." onClick={() => { setSubject('all'); setTopic('all'); setYear('all'); setDifficulty('all'); void load('all', 'all', 'all', 'all'); }} />
      )}
    </>
  );
}

// -------------------------------------------------------------- mock exams

function formatTime(totalSeconds: number): string {
  const m = Math.floor(Math.max(0, totalSeconds) / 60);
  const s = Math.max(0, totalSeconds) % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function Mocks({ course }: { course: string }) {
  const [list, setList] = useState<any[]>([]);
  const [active, setActive] = useState<any | null>(null);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [index, setIndex] = useState(0);
  const [flagged, setFlagged] = useState<string[]>([]);
  const [deadline, setDeadline] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [result, setResult] = useState<any | null>(null);
  const [review, setReview] = useState<any[]>([]);
  const [count, setCount] = useState(10);
  const [subject, setSubject] = useState('all');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const autoSubmitted = useRef(false);

  const refresh = () => {
    apiGet('/api/mock-exams').then((d) => setList(d.mocks || [])).catch(() => {});
    fetch(`${API}/api/quiz/catalog?course=${course}&source=all`, opts).then((r) => r.json()).then((d) => setSubjects(d.filters?.subjects || [])).catch(() => {});
  };
  useEffect(refresh, [course]);

  useEffect(() => {
    if (!active || result) return;
    const timer = window.setInterval(() => {
      const left = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left <= 0 && !autoSubmitted.current) { autoSubmitted.current = true; void submit(); }
    }, 500);
    return () => window.clearInterval(timer);
  });

  const create = async () => {
    setBusy(true);
    try {
      const mock = await apiPost('/api/mock-exams', { course, subject, count });
      autoSubmitted.current = false;
      setActive(mock);
      setAnswers({});
      setIndex(0);
      setFlagged([]);
      setResult(null);
      setReview([]);
      const total = (mock.config?.minutes || 20) * 60;
      setDeadline(Date.now() + total * 1000);
      setSecondsLeft(total);
    } catch { /* error toast below via list state */ } finally { setBusy(false); }
  };

  const submit = async () => {
    if (!active || result) return;
    setBusy(true);
    try {
      const total = (active.config?.minutes || 20) * 60;
      const data = await apiPost(`/api/mock-exams/${active.id}/submit`, { answers, timeUsedSec: total - secondsLeft });
      setResult(data.result);
      setReview(data.review || []);
      refresh();
    } finally { setBusy(false); }
  };

  const openPast = async (id: string) => {
    const data = await apiGet(`/api/mock-exams/${id}`).catch(() => null);
    if (!data) return;
    if (data.status === 'submitted') {
      setActive({ ...data, questions: data.review || [] });
      setResult(data.result);
      setReview(data.review || []);
      setAnswers(data.answers || {});
      setIndex(0);
    } else {
      setActive(data);
      setResult(null);
      setReview([]);
      setAnswers({});
      setIndex(0);
      const total = (data.config?.minutes || 20) * 60;
      autoSubmitted.current = false;
      setDeadline(Date.now() + total * 1000);
      setSecondsLeft(total);
    }
  };

  const back = () => { setActive(null); setResult(null); setReview([]); refresh(); };
  const questions: any[] = active?.questions || [];
  const current = questions[index];

  if (active && current && !result) {
    const total = (active.config?.minutes || 20) * 60;
    return (
      <>
        <button className="back-link" onClick={back}>← Abandon mock (not submitted)</button>
        <div className="mock-top card">
          <div><p className="label">TIMED MOCK · {active.course.toUpperCase()}</p><h2>Question {index + 1} of {questions.length}</h2></div>
          <div className={`mock-timer ${secondsLeft < 60 ? 'danger' : ''}`}>{formatTime(secondsLeft)}</div>
        </div>
        <div className="mock-layout">
          <section className="practice-card card">
            <div className="practice-meta"><span>{current.subject} · {current.topic} · {current.marks || 1} mark{(current.marks || 1) > 1 ? 's' : ''}</span><span>−⅓ on wrong</span></div>
            <h2>{current.question}</h2>
            <div className="options">
              {current.options.map((o: string, j: number) => (
                <button key={o} className={`option ${answers[current.id] === j ? 'correct' : ''}`} onClick={() => setAnswers({ ...answers, [current.id]: j })}>
                  <span>{String.fromCharCode(65 + j)}</span>{o}
                </button>
              ))}
            </div>
            <div className="practice-actions">
              <button className="secondary-button" onClick={() => setAnswers({ ...answers, [current.id]: null })}>Clear response</button>
              <button className="secondary-button" onClick={() => setFlagged(flagged.includes(current.id) ? flagged.filter((f) => f !== current.id) : [...flagged, current.id])}>
                {flagged.includes(current.id) ? <><Icon.Star size={16} /> Flagged</> : <><Icon.StarOutline size={16} /> Flag for review</>}
              </button>
            </div>
            <div className="practice-actions">
              <button className="secondary-button" disabled={!index} onClick={() => setIndex(index - 1)}>← Previous</button>
              {index + 1 < questions.length
                ? <button onClick={() => setIndex(index + 1)}>Save & next →</button>
                : <button onClick={() => void submit()} disabled={busy}>{busy ? 'Submitting…' : 'Submit mock →'}</button>}
            </div>
          </section>
          <aside className="mock-palette card">
            <p className="label">PALETTE · {Math.round(((total - secondsLeft) / total) * 100)}% TIME USED</p>
            <div className="palette-grid">
              {questions.map((q: any, qi: number) => (
                <button
                  key={q.id}
                  className={`${qi === index ? 'current' : ''} ${answers[q.id] !== undefined && answers[q.id] !== null ? 'answered' : ''} ${flagged.includes(q.id) ? 'flagged' : ''}`}
                  onClick={() => setIndex(qi)}
                >{qi + 1}</button>
              ))}
            </div>
            <button onClick={() => void submit()} disabled={busy}>{busy ? 'Submitting…' : 'Submit mock'}</button>
          </aside>
        </div>
      </>
    );
  }

  if (active && result) {
    return (
      <>
        <button className="back-link" onClick={back}>← Back to mocks</button>
        <div className="compact-heading"><div>
          <p className="eyebrow">MOCK RESULT · {result.pct}%</p>
          <h1>Score {result.score} / {result.maxMarks}</h1>
          <p className="lead">{result.correct} correct · {result.wrong} wrong · {result.skipped} skipped · {result.accuracy}% accuracy{result.timeUsedSec ? ` · ${formatTime(result.timeUsedSec)} used` : ''}. Wrong answers joined your mistake notebook.</p>
        </div></div>
        <div className="review-history">
          {review.map((q: any, qi: number) => (
            <article className="review-group card" key={q.id}>
              <button className="review-toggle" onClick={() => setOpen(open === q.id ? null : q.id)}>
                <span className={q.isCorrect ? 'result-dot correct-dot' : 'result-dot'}>{q.isCorrect ? <Icon.Check size={16} /> : <Icon.Mistakes size={16} />}</span>
                <span><b>Q{qi + 1}. {q.question}</b><small>{q.isCorrect ? `+${q.marks || 1}` : q.selected === null || q.selected === undefined ? 'Skipped · 0' : `${q.delta} (negative marking)`} · {q.subject} · {q.topic}</small></span>
                <span>{open === q.id ? '−' : '+'}</span>
              </button>
              {open === q.id && (
                <div className="solution-card">
                  <div className="options">
                    {q.options.map((o: string, j: number) => (
                      <div key={o} className={`option ${j === q.answer ? 'correct' : ''} ${j === q.selected && j !== q.answer ? 'incorrect' : ''}`}><span>{String.fromCharCode(65 + j)}</span>{o}</div>
                    ))}
                  </div>
                  <p style={{ marginTop: 12 }}><b>Why:</b> {q.explanation}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="compact-heading"><div>
        <p className="eyebrow">EXAM TEMPERAMENT</p>
        <h1>Mock exams</h1>
        <p className="lead">Timed papers with GATE negative marking. Every wrong answer is auto-filed into your mistake notebook.</p>
      </div></div>
      <section className="mock-setup card">
        <label>Subject<select value={subject} onChange={(e) => setSubject(e.target.value)}><option value="all">All subjects (mixed)</option>{subjects.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label>Questions<select value={count} onChange={(e) => setCount(Number(e.target.value))}><option value={5}>5 · sprint</option><option value={10}>10 · standard</option><option value={15}>15 · deep</option><option value={25}>25 · full stretch</option></select></label>
        <button onClick={() => void create()} disabled={busy}>{busy ? 'Building paper…' : 'Start timed mock →'}</button>
      </section>
      <div className="section-title"><div><p className="eyebrow">HISTORY</p><h2>Past attempts</h2></div></div>
      {list.length === 0 && <p className="muted">No mocks yet — your first paper is one click away.</p>}
      <div className="mock-list">
        {list.map((m: any) => (
          <button className="mock-row card" key={m.id} onClick={() => void openPast(m.id)}>
            <span><b>{m.course.toUpperCase()} · {m.totalQuestions} questions</b><small>{new Date(m.createdAt).toLocaleString()} · {m.status}</small></span>
            <span className="mock-score">{m.score === null || m.score === undefined ? '→' : `${m.score}/${m.maxMarks}`}</span>
          </button>
        ))}
      </div>
    </>
  );
}

// ----------------------------------------------------------- practice hub

export type PracticeMode = 'quiz' | 'mocks' | 'mistakes';

const MODES: Array<{ id: PracticeMode; label: string; hint: string }> = [
  { id: 'quiz', label: 'Sprint', hint: '5–15 min daily drills' },
  { id: 'mocks', label: 'Mocks', hint: 'Timed full-length papers' },
  { id: 'mistakes', label: 'Mistakes', hint: 'Spaced repair queue' },
];

/**
 * One Practice destination, three zoom levels of the same mastery graph.
 * Guests get the full question bank read-only; mocks and the repair queue
 * are account features (they write attempts, XP and mistakes).
 * (Sprint 3 turns this into the fully segmented Practice Hub with hints,
 * PYQ filters, and the spaced mistake-repair banner.)
 */
export function PracticeHub({ course, topicId, isGuest, onRequestSignIn }: {
  course: string;
  topicId?: string;
  isGuest?: boolean;
  onRequestSignIn?: () => void;
}) {
  const [mode, setMode] = useState<PracticeMode>('quiz');
  const locked = Boolean(isGuest);
  const guard = (target: PracticeMode) => {
    if (locked && target !== 'quiz') { onRequestSignIn?.(); return; }
    setMode(target);
  };
  return (
    <>
      {locked && (
        <section className="guest-banner card" role="status">
          <Diamond size={20} className="banner-diamond" />
          <div><b>Guest preview of the Practice lab.</b><small>Questions are open to all. Sign in to save attempts, run full mocks, and repair mistakes.</small></div>
          <button onClick={onRequestSignIn}>Sign in free →</button>
        </section>
      )}
      <div className="hub-tabs" role="tablist" aria-label="Practice mode">
        {MODES.map((m) => (
          <button
            key={m.id}
            role="tab"
            aria-selected={mode === m.id}
            className={`${mode === m.id ? 'active' : ''} ${locked && m.id !== 'quiz' ? 'locked' : ''}`}
            onClick={() => guard(m.id)}
            title={locked && m.id !== 'quiz' ? 'Sign in to unlock' : undefined}
          >
            <b>{m.label}{locked && m.id !== 'quiz' ? ' 🔒' : ''}</b><small>{m.hint}</small>
          </button>
        ))}
      </div>
      {mode === 'quiz' && <Quiz course={course} topicId={topicId} readOnly={locked} />}
      {mode === 'mocks' && !locked && <Mocks course={course} />}
      {mode === 'mistakes' && !locked && <Mistakes />}
    </>
  );
}

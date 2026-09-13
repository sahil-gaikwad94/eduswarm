import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { API, apiGet, apiPost, apiPut, type Pack, type Page, type Topic } from '../lib/api';
import { Avatar, Empty, JobCard, Mermaid, RichText } from '../components/ui';

const opts = { credentials: 'include' as const };

const DEPTHS = [
  { id: 'eli5', label: 'ELI5', hint: 'Story-first, zero jargon' },
  { id: 'standard', label: 'Standard', hint: 'Full exam-grade kit' },
  { id: 'deep', label: 'Deep', hint: '+ proofs, systems, drills' },
];

// ------------------------------------------------------------------ lesson

export function Lesson({ topic, pack, job, jobError, topics, isComplete, onStart, onBack, onCards, onPractice, onOpen, onComplete, onNavigate }: {
  topic: Topic; pack: Pack | null; job: any; jobError: string; topics: Topic[]; isComplete: boolean;
  onStart: (t: Topic, depth: string, regenerate?: boolean) => void; onBack: () => void; onCards: () => void; onPractice: () => void;
  onOpen: (t: Topic) => void; onComplete: (t: Topic) => void; onNavigate: (page: Page, topicId?: string) => void;
}) {
  const [videos, setVideos] = useState<any[]>(pack?.videos || []);
  const [doubt, setDoubt] = useState('');
  const [doubtAnswer, setDoubtAnswer] = useState<any>(null);
  const [doubtBusy, setDoubtBusy] = useState(false);
  const [depth, setDepth] = useState(pack?.depth || 'standard');
  const [notes, setNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => { setDepth(pack?.depth || 'standard'); }, [pack?.topicId]);
  useEffect(() => {
    if (!pack) return;
    fetch(`${API}/api/recommendations/videos?topicId=${encodeURIComponent(topic.id)}`, opts)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.recommendations && setVideos(d.recommendations))
      .catch(() => {});
  }, [pack?.topicId, topic.id]);

  useEffect(() => {
    setNotes(''); setNotesSaved(false); setCelebrate(false);
    apiGet(`/api/notes/${encodeURIComponent(topic.id)}`).then((d) => setNotes(d.text || '')).catch(() => {});
  }, [topic.id]);

  const askDoubt = async (event: React.FormEvent) => {
    event.preventDefault();
    if (doubt.trim().length < 3 || doubtBusy) return;
    setDoubtBusy(true);
    try {
      setDoubtAnswer(await apiPost('/api/doubt', { topicId: topic.id, question: doubt.trim() }));
    } catch (e: any) {
      setDoubtAnswer({ answer: e.message || 'The doubt solver is unavailable right now.', related: [] });
    } finally {
      setDoubtBusy(false);
    }
  };

  const saveNotes = async () => {
    try {
      await apiPut(`/api/notes/${encodeURIComponent(topic.id)}`, { text: notes });
      setNotesSaved(true);
      window.setTimeout(() => setNotesSaved(false), 2000);
    } catch { /* notes are best-effort */ }
  };

  const complete = () => {
    setCelebrate(true);
    onComplete(topic);
    confetti({
      particleCount: 110, spread: 75, origin: { y: 0.65 },
      colors: ['#7557f5', '#bdf47c', '#ffd8c2', '#ffe285', '#a78dff'],
    });
    window.setTimeout(() => setCelebrate(false), 4000);
  };

  const isFallbackPack = pack?.verification?.status === 'fallback';

  const order = topics.length ? topics : [topic];
  const position = Math.max(0, order.findIndex((t) => t.id === topic.id));
  const prev = position > 0 ? order[position - 1] : null;
  const next = position < order.length - 1 ? order[position + 1] : null;

  const sections = pack?.notes?.sections || [{
    heading: 'Ready to generate your complete study kit?',
    body: 'Pick an explanation depth and start the learning team to receive a detailed, evidence-backed kit with intuition, formal definitions, worked examples, code, diagrams, edge cases, exam connections, flashcards, practice questions, and recommended videos.',
  }];

  const depthLabel = pack?.depth === 'eli5' ? 'ELI5' : pack?.depth === 'deep' ? 'Deep dive' : 'Standard';
  const codeExamples = pack?.codeExamples || [];
  const diagrams = pack?.diagrams || [];
  const cheatSheet = pack?.cheatSheet || [];
  const pyqs = pack?.pyqs || [];

  return (
    <>
      <button className="back-link" onClick={onBack}>← Back to study plan</button>
      <div className="lesson-header">
        <div>
          <p className="eyebrow">{topic.module.toUpperCase()} · TUTORIAL {position + 1} OF {order.length}</p>
          <h1>{pack?.title || topic.title}</h1>
          <p className="lesson-subtitle">{topic.description}</p>
          <div className="lesson-tags">
            <span>◷ {pack?.readingMinutes || topic.minutes} minutes</span>
            <span>◈ {pack ? depthLabel : 'Not generated'}</span>
            <span>⌘ Examples + code + diagrams</span>
            {isComplete && <span className="complete-tag">✓ Completed</span>}
          </div>
        </div>
        <Avatar size="large" />
      </div>

      {celebrate && (
        <section className="celebrate-banner" role="status">
          <span className="confetti"><i /><i /><i /><i /><i /><i /><i /><i /></span>
          <div><b>Topic complete — superb work. +40 XP banked.</b><small>Keep the streak alive: review flashcards or take the next tutorial.</small></div>
        </section>
      )}

      {job && <JobCard job={job} />}

      {!job && jobError && (
        <section className="job-error card" role="alert">
          <span className="job-error-icon">⚠</span>
          <div><b>The team couldn’t finish this run.</b><small>{jobError}</small></div>
          <button onClick={() => onStart(topic, depth, true)}>↻ Try again</button>
        </section>
      )}

      {!job && isFallbackPack && (
        <section className="fallback-banner card" role="status">
          <span className="fallback-icon">◌</span>
          <div>
            <b>Offline placeholder kit — you can upgrade it.</b>
            <small>
              The AI team was unreachable, so this kit was assembled locally. Your progress is saved and
              nothing is lost — regenerate any time to get the full, evidence-backed version.
            </small>
          </div>
          <button onClick={() => onStart(topic, pack?.depth || 'standard', true)}>✦ Regenerate with AI team</button>
        </section>
      )}

      {!job && !pack && (
        <section className="start-learning card">
          <div>
            <p className="label">LEARNING TEAM</p>
            <h2>Generate the complete study kit.</h2>
            <p>Detailed notes, worked examples, code, diagrams, videos, flashcards, and practice — generated and saved automatically.</p>
            <div className="depth-picker" role="radiogroup" aria-label="Explanation depth">
              {DEPTHS.map((d) => (
                <button key={d.id} type="button" className={`depth-option ${depth === d.id ? 'active' : ''}`} onClick={() => setDepth(d.id)}>
                  <b>{d.label}</b><small>{d.hint}</small>
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => onStart(topic, depth)}>Start learning →</button>
        </section>
      )}

      {!job && (
        <div className="lesson-layout">
          <article className="lesson-article">
            <div className="verified-line">
              <span className="verified-chip">
                {pack?.verification?.status === 'fallback' ? '◌ LOCAL STUDY KIT' : pack ? '✓ SAVED VERIFIED LESSON' : 'READY TO GENERATE'}
              </span>
              <span>
                {pack?.verification?.status === 'fallback'
                  ? `Generated locally with bank questions + worked examples · ${sections.length} sections · verify before relying on it.`
                  : pack ? `${pack.verification.claimsChecked} claims · ${pack.verification.sources.length} sources`
                    : 'Start to unlock the full explanation'}
              </span>
            </div>
            {sections.map((s: any, i: number) => (
              <section className="lesson-section" key={s.heading} id={`section-${i}`}>
                <span className="section-number">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h2>{s.heading}</h2>
                  <RichText text={String(s.body)} />
                </div>
              </section>
            ))}
            {pack && (
              <>
                {codeExamples.length > 0 && (
                  <section className="code-collection">
                    <p className="label">WORKED CODE · READ THE INVARIANT BEFORE THE SYNTAX</p>
                    {codeExamples.map((c: any, i: number) => (
                      <div className="code-section" key={c.title || i}>
                        <div className="code-heading"><b>{c.title || `example.${c.language || 'js'}`}</b><small>{c.language || ''}</small></div>
                        <pre><code>{c.code}</code></pre>
                        {c.explanation && <p className="muted">{c.explanation}</p>}
                      </div>
                    ))}
                  </section>
                )}
                {diagrams.length > 0 && (
                  <section className="diagram-collection">
                    <p className="label">VISUAL MAPS · REDRAW THESE FROM MEMORY</p>
                    {diagrams.map((d: any, i: number) => (
                      <figure className="diagram-card card" key={d.title || i}>
                        <figcaption><b>{d.title}</b>{d.caption && <small>{d.caption}</small>}</figcaption>
                        <Mermaid chart={d.mermaid} chartId={`${topic.id}-${i}`} />
                      </figure>
                    ))}
                  </section>
                )}
                {cheatSheet.length > 0 && (
                  <section className="cheatsheet card">
                    <p className="label">CHEAT SHEET · MEMORIZE THIS</p>
                    <ul>{cheatSheet.map((line: string, i: number) => <li key={i}>{line}</li>)}</ul>
                  </section>
                )}
                {pyqs.length > 0 && (
                  <section className="pyq-strip">
                    <p className="label">EXAM PATTERNS IN THIS KIT</p>
                    {pyqs.slice(0, 4).map((q: any, i: number) => (
                      <p key={i}><b>{q.year ? `${q.year} · ` : ''}</b>{q.question}</p>
                    ))}
                  </section>
                )}
                <section className="notes-box card">
                  <p className="label">YOUR NOTES · SAVED TO THIS TOPIC</p>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Summarize the core idea in your own words — retrieval beats re-reading." />
                  <div className="notes-actions">
                    <small>{notesSaved ? '✓ Saved' : 'Private to you'}</small>
                    <button className="secondary-button" onClick={() => void saveNotes()}>Save notes</button>
                  </div>
                </section>
                <section className="doubt-box card">
                  <p className="label">STUCK ON THIS LESSON? ASK NOW</p>
                  <form onSubmit={askDoubt}>
                    <input value={doubt} onChange={(e) => setDoubt(e.target.value)} placeholder="e.g. Why does this fail on empty input?" />
                    <button disabled={doubtBusy}>{doubtBusy ? 'Solving…' : 'Solve my doubt'}</button>
                  </form>
                  {doubtAnswer && (
                    <div className="doubt-answer">
                      <p>{doubtAnswer.answer}</p>
                      {(doubtAnswer.related || []).map((r: any) => (
                        <p className="muted" key={r.id}><b>Related:</b> {r.question} — {r.explanation}</p>
                      ))}
                    </div>
                  )}
                </section>
                <div className="sources">
                  <p className="label">RECOMMENDED SOURCES</p>
                  {pack.verification.sources.map((s: string) => <span key={s}>↗ {s}</span>)}
                </div>
                <div className="sources">
                  <p className="label">WATCH NEXT ON YOUTUBE</p>
                  {videos.map((v) => <a href={v.url} target="_blank" rel="noreferrer" key={v.title}>▶ {v.title}</a>)}
                </div>
              </>
            )}
          </article>
          <aside className="lesson-rail">
            <div className="rail-card">
              <p className="label">IN THIS TUTORIAL</p>
              {sections.map((s: any, i: number) => <a href={`#section-${i}`} key={s.heading}>{String(i + 1).padStart(2, '0')} {s.heading}</a>)}
            </div>
            {pack && (
              <div className="rail-card">
                <p className="label">REGENERATE</p>
                <div className="depth-picker vertical" role="radiogroup" aria-label="Explanation depth">
                  {DEPTHS.map((d) => (
                    <button key={d.id} type="button" className={`depth-option ${depth === d.id ? 'active' : ''}`} onClick={() => setDepth(d.id)}>
                      <b>{d.label}</b><small>{d.hint}</small>
                    </button>
                  ))}
                </div>
                <button className="secondary-button regen-button" onClick={() => onStart(topic, depth, true)}>↻ Regenerate this kit</button>
                <small className="regen-note">Re-runs the full Dean pipeline and replaces this kit. Your saved kit is kept if the AI team is offline.</small>
              </div>
            )}
          </aside>
        </div>
      )}

      {!job && pack && (
        <>
          <div className="lesson-footer-actions">
            <button className="secondary-button" onClick={onCards}>Review saved flashcards →</button>
            <button className="secondary-button" onClick={() => onNavigate('library')}>Explore free blogs on this →</button>
            <button onClick={onPractice}>Take saved practice quiz →</button>
          </div>
          <nav className="lesson-pager" aria-label="Tutorial navigation">
            {prev ? (
              <button className="pager-button" onClick={() => onOpen(prev)}><small>← PREVIOUS</small><b>{prev.title}</b></button>
            ) : <span />}
            {!isComplete ? (
              <button className="complete-button" onClick={complete}>✓ Mark complete · +40 XP</button>
            ) : (
              <span className="complete-done">✓ Completed</span>
            )}
            {next ? (
              <button className="pager-button next" onClick={() => onOpen(next)}><small>NEXT →</small><b>{next.title}</b></button>
            ) : <span />}
          </nav>
        </>
      )}
    </>
  );
}


// ------------------------------------------------------- SRS flashcards

const GRADES = [
  { quality: 1, label: 'Again', hint: 'Forgot it' },
  { quality: 3, label: 'Hard', hint: 'Struggled' },
  { quality: 4, label: 'Good', hint: 'Recalled' },
  { quality: 5, label: 'Easy', hint: 'Instant' },
];

export function Flashcards({ onLesson, onProgress }: { onLesson: () => void; onProgress: () => void }) {
  const [queue, setQueue] = useState<any[]>([]);
  const [flip, setFlip] = useState(false);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(0);
  const [freshTotal, setFreshTotal] = useState(0);

  const load = () => {
    setLoading(true);
    fetch(`${API}/api/flashcards/due?limit=30`, opts)
      .then((r) => r.json())
      .then((d) => { setQueue(d.due || []); setFreshTotal((d.dueCount || 0) + (d.freshCount || 0)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const grade = async (quality: number) => {
    const card = queue[0];
    if (!card) return;
    await apiPost('/api/flashcards/review', {
      cardKey: card.cardKey, topicId: card.topicId, question: card.question, answer: card.answer, quality,
    }).catch(() => {});
    onProgress();
    setDone(done + 1);
    setQueue(queue.slice(1));
    setFlip(false);
  };

  if (loading) return <Empty title="Loading your review queue" text="Scheduling due cards across all topics." onClick={onLesson} />;
  const card = queue[0];
  if (!card) {
    return (
      <Empty
        title={done ? 'All caught up — superb recall.' : 'Your review queue is empty'}
        text={done ? `You graded ${done} card${done === 1 ? '' : 's'} this session. The scheduler will bring them back right before you forget.` : 'Generate a study kit first — its flashcards will appear here on a spaced schedule.'}
        actionLabel={done ? 'Back to overview →' : 'Go to current lesson →'}
        onClick={onLesson}
      />
    );
  }
  return (
    <>
      <div className="compact-heading">
        <div>
          <p className="eyebrow">SPACED REPETITION · {card.fresh ? 'NEW CARD' : 'DUE REVIEW'}</p>
          <h1>Recall, then grade honestly.</h1>
          <p className="lead">{queue.length} remaining · {done} done{` · ${freshTotal} in today's queue`}</p>
        </div>
      </div>
      <section className="flashcard-workspace">
        <div className="flashcard-progress">
          <span>{card.fresh ? 'New' : 'Due'} · {card.topicId}</span>
          <div><i style={{ width: `${freshTotal ? Math.round((done / freshTotal) * 100) : 0}%` }} /></div>
        </div>
        <button className={`flashcard ${flip ? 'flipped' : ''}`} onClick={() => setFlip(!flip)}>
          <span className="card-face"><small>QUESTION</small><strong>{card.question}</strong><em>Tap to reveal answer</em></span>
          <span className="card-face answer"><small>ANSWER</small><strong>{card.answer}</strong><em>Tap to return</em></span>
        </button>
        <div className="srs-grades">
          {GRADES.map((g) => (
            <button key={g.label} className="secondary-button" onClick={() => void grade(g.quality)}>
              <b>{g.label}</b><small>{g.hint}</small>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

// ---------------------------------------------------------------- practice

export function Practice({ pack, topic, onLesson, onProgress }: { pack: Pack | null; topic: Topic; onLesson: () => void; onProgress: () => void }) {
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  if (!pack) return <Empty title="Practice unlocks after learning" text="Generate the topic kit first so questions are grounded in the explanation." onClick={onLesson} />;
  const q = pack.quiz[i];
  return (
    <>
      <div className="compact-heading">
        <div>
          <p className="eyebrow">RETRIEVAL PRACTICE · {topic.title.toUpperCase()}</p>
          <h1>Practice lab</h1>
          <p className="lead">Immediate feedback with a clear explanation of why the answer is correct.</p>
        </div>
      </div>
      <section className="practice-card card">
        <div className="practice-meta">
          <span>QUESTION {i + 1} / {pack.quiz.length}</span>
          <span>{answer === null ? 'Not answered' : answer === q.answer ? 'Correct' : 'Review this'}</span>
        </div>
        <h2>{q.question}</h2>
        <div className="options">
          {q.options.map((o: string, j: number) => (
            <button
              className={`option ${answer !== null && j === q.answer ? 'correct' : ''} ${answer === j && j !== q.answer ? 'incorrect' : ''}`}
              key={o}
              onClick={() => {
                setAnswer(j);
                void apiPost('/api/practice/attempts', {
                  topicId: topic.id, questionId: `${topic.id}:${i}`, subject: topic.module, topic: topic.title,
                  question: q.question, selectedAnswer: o, correctAnswer: q.options[q.answer], correct: j === q.answer,
                  explanation: q.explanation,
                  solution: {
                    approach: 'Read the question, identify the governing definition or invariant, then eliminate choices that violate it.',
                    stepByStep: ['Restate what the question is asking in your own words.', 'List the definition, invariant, or constraint that determines the answer.', 'Test each option against that rule and a small edge case.', 'Choose the surviving option and explain why the distractors fail.'],
                    whyItWorks: q.explanation, commonMistake: 'Skipping the precondition or selecting an option because it sounds familiar.',
                  },
                  completed: true,
                }).then(() => onProgress()).catch(() => {});
              }}
            >
              <span>{String.fromCharCode(65 + j)}</span>{o}
            </button>
          ))}
        </div>
        {answer !== null && (
          <div className={`feedback ${answer === q.answer ? 'good' : 'needs-work'}`}>
            <b>{answer === q.answer ? 'Nice work.' : 'Not quite yet.'}</b>
            <p>{q.explanation}</p>
          </div>
        )}
        <div className="practice-actions">
          <button className="secondary-button" onClick={() => { setI((i - 1 + pack.quiz.length) % pack.quiz.length); setAnswer(null); }}>← Previous</button>
          <button onClick={() => { setI((i + 1) % pack.quiz.length); setAnswer(null); }}>Next question →</button>
        </div>
      </section>
    </>
  );
}

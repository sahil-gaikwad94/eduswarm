import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { API, apiGet, apiPost, apiPut, type Pack, type Page, type Topic } from '../lib/api';
import { Avatar, Empty, JobCard, Mermaid, RichText } from '../components/ui';
import { ArticleReader } from '../components/Reader';

const opts = { credentials: 'include' as const };

const DEPTHS = [
  { id: 'eli5', label: 'ELI5', hint: 'Story-first, zero jargon' },
  { id: 'standard', label: 'Standard', hint: 'Full exam-grade kit' },
  { id: 'deep', label: 'Deep', hint: '+ proofs, systems, drills' },
];

// ------------------------------------------------------------------ lesson

export function Lesson({ topic, pack, job, jobError, topics, isComplete, onStart, onBack, onCards, onPractice, onOpen, onComplete, onNavigate, guest, onRequireSignIn }: {
  topic: Topic; pack: Pack | null; job: any; jobError: string; topics: Topic[]; isComplete: boolean;
  onStart: (t: Topic, depth: string, regenerate?: boolean) => void; onBack: () => void; onCards: () => void; onPractice: () => void;
  onOpen: (t: Topic) => void; onComplete: (t: Topic) => void; onNavigate: (page: Page, topicId?: string) => void;
  guest?: boolean; onRequireSignIn?: () => void;
}) {
  const [doubt, setDoubt] = useState('');
  const [doubtAnswer, setDoubtAnswer] = useState<any>(null);
  const [doubtBusy, setDoubtBusy] = useState(false);
  const [depth, setDepth] = useState(pack?.depth || 'standard');
  const [videos, setVideos] = useState<any[]>([]);
  const [notes, setNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [localDismissed, setLocalDismissed] = useState(false);
  const [sourceOpen, setSourceOpen] = useState<any>(null);

  useEffect(() => { setDepth(pack?.depth || 'standard'); }, [pack?.topicId]);

  useEffect(() => {
    setNotes(''); setNotesSaved(false); setCelebrate(false); setLocalDismissed(false); setSourceOpen(null);
    if (guest) return;
    apiGet(`/api/notes/${encodeURIComponent(topic.id)}`).then((d) => setNotes(d.text || '')).catch(() => {});
  }, [topic.id, guest]);

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

  const isLocalPack = Boolean(pack && (pack.local || pack.guest || pack.baseline || pack.verification?.status === 'local' || pack.verification?.status === 'fallback'));

  const order = topics.length ? topics : [topic];
  const position = Math.max(0, order.findIndex((t) => t.id === topic.id));
  const prev = position > 0 ? order[position - 1] : null;
  const next = position < order.length - 1 ? order[position + 1] : null;

  const sections = pack?.notes?.sections || [];

  useEffect(() => {
    if (!pack) return;
    fetch(`${API}/api/recommendations/videos?topicId=${encodeURIComponent(topic.id)}`, opts)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.recommendations && setVideos(d.recommendations))
      .catch(() => {});
  }, [pack?.topicId, topic.id]);

  const depthLabel = pack?.depth === 'eli5' ? 'ELI5' : pack?.depth === 'deep' ? 'Deep dive' : 'Standard';
  const codeExamples = pack?.codeExamples || [];
  const diagrams = pack?.diagrams || [];
  const cheatSheet = pack?.cheatSheet || [];
  const localCompanion = pack?.localCompanion;
  const sourceRefs = (pack?.verification?.sourceRefs || []).filter((ref: any) => /^https?:/i.test(String(ref.url || '')));

  return (
    <>
      <button className="back-link" onClick={onBack}>← Back to study plan</button>
      {job && <JobCard job={job} />}
      {isLocalPack && !localDismissed && (
        <section className="local-banner card" role="status">
          <span className="local-banner-icon" aria-hidden>◈</span>
          <div className="local-banner-copy">
            <b>{guest ? 'Free EduSwarm chapter — read instantly, no account needed.' : 'EduSwarm local chapter — ready instantly.'}</b>
            <small>
              {guest
                ? 'Written and reviewed by our curriculum team. Sign in to save progress, flashcards, notes, and your streak — or keep reading right now.'
                : `Authored and reviewed by our curriculum team: ${sections.length} sections, worked examples, code walkthroughs, a cheat sheet, and practice with full solutions. No model call is needed.`}
            </small>
          </div>
          <div className="local-banner-actions">
            {guest && onRequireSignIn && <button onClick={onRequireSignIn}>Sign in free →</button>}
            {!guest && <button onClick={() => onStart(topic, depth, true)}>✦ Generate AI expansion</button>}
            <button className="secondary-button" onClick={() => setLocalDismissed(true)}>Keep reading</button>
          </div>
        </section>
      )}

      {!job && jobError && (
        <section className="job-error card" role="alert">
          <span className="job-error-icon">⚠</span>
          <div><b>We couldn’t open this chapter.</b><small>{jobError}</small></div>
          <button onClick={() => onOpen(topic)}>↻ Reload chapter</button>
        </section>
      )}

      {!pack && !job && !jobError && (
        <section className="lesson-skeleton card" aria-busy="true" aria-label="Opening your local chapter">
          <div className="reader-skeleton">
            <span className="sk sk-label" /><span className="sk sk-title" /><span className="sk sk-title short" />
            <span className="sk sk-line" /><span className="sk sk-line" /><span className="sk sk-line short" />
          </div>
          <p className="muted">Opening your local chapter — no model call, no waiting.</p>
        </section>
      )}

      {pack && (
        <div className="lesson-layout">
          <article className="lesson-article">
            <div className="verified-line">
              <span className={`verified-chip ${isLocalPack ? 'local-chip' : ''}`}>
                {isLocalPack ? '✓ EDUSWARM LOCAL CHAPTER' : '✓ SAVED AI-ENHANCED CHAPTER'}
              </span>
              <span>
                {isLocalPack
                  ? `${sections.length} sections · ${pack.readingMinutes || topic.minutes} min read · authored and reviewed by EduSwarm`
                  : `${pack.verification?.claimsChecked || 0} claims · ${(pack.verification?.sources || []).length} sources`}
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
            {localCompanion && (
              <section className="local-companion card">
                <p className="label">LOCAL REFERENCE COMPANION</p>
                <h2>{localCompanion.title}</h2>
                <p>{localCompanion.summary}</p>
                {(localCompanion.sections || []).map((section: any) => (
                  <details key={section.heading}>
                    <summary>{section.heading}</summary>
                    <RichText text={String(section.body)} />
                  </details>
                ))}
              </section>
            )}
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
                {videos.length > 0 && (
                  <section className="sources">
                    <p className="label">RECOMMENDED VIDEOS · WATCH AFTER THE CHAPTER</p>
                    {videos.map((v) => (
                      <a href={v.url} target="_blank" rel="noreferrer" key={v.title}>▶ {v.title}{v.publisher ? ` · ${v.publisher}` : ''}</a>
                    ))}
                  </section>
                )}
                {sourceRefs.length > 0 && (
                  <section className="sources source-reading">
                    <p className="label">FREE SOURCE READING · OPEN INSIDE EDUSWARM</p>
                    <div className="source-list">
                      {sourceRefs.slice(0, 8).map((ref: any) => (
                        <button className="source-link" key={ref.url} onClick={() => setSourceOpen(ref)}>
                          <span className="source-icon" aria-hidden>❖</span>
                          <span className="source-copy"><b>{ref.title}</b><small>{ref.publisher}{ref.kind ? ` · ${ref.kind}` : ''}</small></span>
                          <span className="source-open">Read →</span>
                        </button>
                      ))}
                    </div>
                  </section>
                )}
                {guest ? (
                  <section className="notes-box card">
                    <p className="label">YOUR NOTES · SYNCED TO THIS TOPIC</p>
                    <p className="muted">Sign in (free) to write notes, save them to this tutorial, and never lose a revision again.</p>
                    <div className="notes-actions">
                      <small>Private to you</small>
                      <button className="secondary-button" onClick={onRequireSignIn}>Sign in free →</button>
                    </div>
                  </section>
                ) : (
                <section className="notes-box card">
                  <p className="label">YOUR NOTES · SAVED TO THIS TOPIC</p>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Summarize the core idea in your own words — retrieval beats re-reading." />
                  <div className="notes-actions">
                    <small>{notesSaved ? '✓ Saved' : 'Private to you'}</small>
                    <button className="secondary-button" onClick={() => void saveNotes()}>Save notes</button>
                  </div>
                </section>
                )}
                {guest ? (
                  <section className="doubt-box card">
                    <p className="label">STUCK ON THIS LESSON?</p>
                    <p className="muted">The Dean answers doubts anchored to this exact lesson for signed-in learners — free, forever for GATE.</p>
                    <div className="notes-actions">
                      <small>Hints first, then full solutions</small>
                      <button className="secondary-button" onClick={onRequireSignIn}>Sign in free →</button>
                    </div>
                  </section>
                ) : (
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
                )}
              </>
            )}
          </article>
          <aside className="lesson-rail">
            <div className="rail-card">
              <p className="label">IN THIS TUTORIAL</p>
              {sections.map((s: any, i: number) => <a href={`#section-${i}`} key={s.heading}>{String(i + 1).padStart(2, '0')} {s.heading}</a>)}
            </div>
            {pack && (
              <div className="rail-card rail-ai">
                <p className="label">{isLocalPack ? 'OPTIONAL · AI SWARM EXPANSION' : 'REGENERATE WITH AI SWARM'}</p>
                <p className="rail-help">
                  {isLocalPack
                    ? 'The chapter above is complete on its own. Generate a second pass with live citation checks only if you want another angle.'
                    : 'Run the full learning team again for a fresh, cited version. Your current chapter stays saved.'}
                </p>
                <div className="depth-picker vertical" role="radiogroup" aria-label="Explanation depth">
                  {DEPTHS.map((d) => (
                    <button key={d.id} type="button" className={`depth-option ${depth === d.id ? 'active' : ''}`} onClick={() => setDepth(d.id)}>
                      <b>{d.label}</b><small>{d.hint}</small>
                    </button>
                  ))}
                </div>
                <button className="secondary-button regen-button" onClick={() => onStart(topic, depth, true)}>
                  {isLocalPack ? '✦ Generate AI expansion' : '↻ Regenerate this chapter'}
                </button>
                <small className="regen-note">Optional. If the AI team is offline, the chapter you are reading stays available.</small>
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

      {sourceOpen && (
        <ArticleReader
          url={sourceOpen.url}
          fallbackTitle={sourceOpen.title}
          fallbackPublisher={sourceOpen.publisher}
          onClose={() => setSourceOpen(null)}
        />
      )}
    </>
  );
}


// ------------------------------------------------------- SRS flashcards

const GRADES = [
  { quality: 1, label: 'Again', hint: 'Forgot it', key: '1' },
  { quality: 3, label: 'Hard', hint: 'Struggled', key: '2' },
  { quality: 4, label: 'Good', hint: 'Recalled', key: '3' },
  { quality: 5, label: 'Easy', hint: 'Instant', key: '4' },
];

export function Flashcards({ onLesson, onProgress }: { onLesson: () => void; onProgress: () => void }) {
  const [queue, setQueue] = useState<any[]>([]);
  const [flip, setFlip] = useState(false);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(0);
  const [freshTotal, setFreshTotal] = useState(0);
  const [lastGrade, setLastGrade] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch(`${API}/api/flashcards/due?limit=30`, opts)
      .then((r) => r.json())
      .then((d) => { setQueue(d.due || []); setFreshTotal((d.dueCount || 0) + (d.freshCount || 0)); setDone(0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const grade = async (quality: number) => {
    const card = queue[0];
    if (!card) return;
    const graded = GRADES.find((g) => g.quality === quality);
    if (graded) setLastGrade(graded.label);
    await apiPost('/api/flashcards/review', {
      cardKey: card.cardKey, topicId: card.topicId, question: card.question, answer: card.answer, quality,
    }).catch(() => {});
    onProgress();
    setDone(done + 1);
    setQueue(queue.slice(1));
    setFlip(false);
  };

  // Keyboard: Space toggles the card, 1–4 grade it. Only when a card is on screen.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (!queue.length) return;
      if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); setFlip((v) => !v); }
      const g = GRADES.find((g) => g.key === event.key);
      if (g) void grade(g.quality);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (loading) return <Empty title="Loading your review queue" text="Scheduling due cards across all topics." onClick={onLesson} />;
  const card = queue[0];
  if (!card) {
    return (
      <section className="flashcard-done card">
        <div className="empty-icon">✦</div>
        <p className="eyebrow">SESSION COMPLETE</p>
        <h1>{done ? 'All caught up — superb recall.' : 'Your review queue is empty'}</h1>
        <p className="lead">{done
          ? `You graded ${done} card${done === 1 ? '' : 's'} this session. The scheduler will bring them back right before you forget — spaced repetition only works because you showed up.`
          : 'Generate a study kit first — its flashcards will appear here on a spaced schedule.'}
        </p>
        <div className="flashcard-done-stats">
          <span><b>{done}</b>graded</span>
          <span><b>{freshTotal}</b>in today's queue</span>
          <span><b>+{done * 4} XP</b>banked</span>
        </div>
        <div className="practice-actions" style={{ justifyContent: 'center' }}>
          <button onClick={load}>Review again →</button>
          <button className="secondary-button" onClick={onLesson}>Back to lesson →</button>
        </div>
      </section>
    );
  }
  const progressPct = freshTotal ? Math.round((done / freshTotal) * 100) : 0;
  return (
    <>
      <div className="compact-heading">
        <div>
          <p className="eyebrow">SPACED REPETITION · {card.fresh ? 'NEW CARD' : 'DUE REVIEW'}</p>
          <h1>Recall, then grade honestly.</h1>
          <p className="lead">{queue.length} remaining · {done} done{lastGrade ? ` · last: ${lastGrade}` : ''}</p>
        </div>
        <span className="fc-count"><b>{done}</b>/{freshTotal}</span>
      </div>
      <section className="flashcard-workspace">
        <div className="flashcard-progress">
          <span>{card.fresh ? 'New' : 'Due'} · {card.topicId.replaceAll('-', ' ')}</span>
          <div role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${progressPct}%` }} /></div>
        </div>
        <div className="flashcard-stage">
          <button className={`flashcard ${flip ? 'flipped' : ''}`} onClick={() => setFlip(!flip)} aria-pressed={flip} aria-label={flip ? 'Show question' : 'Show answer'}>
            <span className="card-face">
              <small>QUESTION</small>
              <strong>{card.question}</strong>
              <em>Tap to reveal · Space</em>
            </span>
            <span className="card-face answer">
              <small>ANSWER</small>
              <strong>{card.answer}</strong>
              <em>Tap to return · Space</em>
            </span>
          </button>
        </div>
        <div className="srs-grades" role="group" aria-label="Grade your recall">
          {GRADES.map((g) => (
            <button key={g.label} className="srs-grade" onClick={() => void grade(g.quality)}>
              <span className="srs-key" aria-hidden>{g.key}</span>
              <b>{g.label}</b>
              <small>{g.hint}</small>
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

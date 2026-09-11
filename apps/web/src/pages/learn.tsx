import React, { useEffect, useState } from 'react';
import { API, apiPost, type Pack, type Topic } from '../lib/api';
import { Avatar, Empty, JobCard } from '../components/ui';

const opts = { credentials: 'include' as const };

// ------------------------------------------------------------------ lesson

export function Lesson({ topic, pack, job, onStart, onBack, onCards, onPractice }: {
  topic: Topic; pack: Pack | null; job: any;
  onStart: (t: Topic) => void; onBack: () => void; onCards: () => void; onPractice: () => void;
}) {
  const [videos, setVideos] = useState<any[]>(pack?.videos || []);
  const [doubt, setDoubt] = useState('');
  const [doubtAnswer, setDoubtAnswer] = useState<any>(null);
  const [doubtBusy, setDoubtBusy] = useState(false);

  useEffect(() => {
    if (!pack) return;
    fetch(`${API}/api/recommendations/videos?topicId=${encodeURIComponent(topic.id)}`, opts)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.recommendations && setVideos(d.recommendations))
      .catch(() => {});
  }, [pack?.topicId, topic.id]);

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

  const sections = pack?.notes?.sections || [{
    heading: 'Ready to generate your complete study kit?',
    body: 'Start the learning team to receive a detailed, evidence-backed explanation with intuition, formal definitions, worked examples, edge cases, exam connections, flashcards, practice questions, and recommended videos.',
  }];

  return (
    <>
      <button className="back-link" onClick={onBack}>← Back to study plan</button>
      <div className="lesson-header">
        <div>
          <p className="eyebrow">{topic.module.toUpperCase()} · TUTORIAL</p>
          <h1>{pack?.title || topic.title}</h1>
          <p className="lesson-subtitle">{topic.description}</p>
          <div className="lesson-tags"><span>◷ {topic.minutes} minutes</span><span>◈ Evidence-backed</span><span>⌘ Examples + code</span></div>
        </div>
        <Avatar size="large" />
      </div>

      {job && <JobCard job={job} />}

      {!job && !pack && (
        <section className="start-learning card">
          <div>
            <p className="label">LEARNING TEAM</p>
            <h2>Generate the complete study kit.</h2>
            <p>Detailed notes, worked examples, video recommendations, flashcards, and practice will be generated and saved automatically.</p>
          </div>
          <button onClick={() => onStart(topic)}>Start learning →</button>
        </section>
      )}

      {!job && (
        <div className="lesson-layout">
          <article className="lesson-article">
            <div className="verified-line">
              <span className="verified-chip">
                {pack?.verification?.status === 'fallback' ? '◌ PREVIEW / FALLBACK' : pack ? '✓ SAVED VERIFIED LESSON' : 'READY TO GENERATE'}
              </span>
              <span>
                {pack?.verification?.status === 'fallback'
                  ? 'Generated locally while the AI team was unavailable; verify before relying on it.'
                  : pack ? `${pack.verification.claimsChecked} claims · ${pack.verification.sources.length} sources`
                    : 'Start to unlock the full explanation'}
              </span>
            </div>
            {sections.map((s: any, i: number) => (
              <section className="lesson-section" key={s.heading} id={`section-${i}`}>
                <span className="section-number">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h2>{s.heading}</h2>
                  {String(s.body).split('\n\n').map((p, j) => <p key={j}>{p}</p>)}
                </div>
              </section>
            ))}
            {pack && (
              <>
                <section className="code-section">
                  <div className="code-heading"><b>worked-example.js</b><small>Study the invariant before the syntax</small></div>
                  <pre><code>{'// Translate the definition into a checkable invariant\nfunction solve(input) {\n  // 1. Validate preconditions\n  // 2. Preserve the invariant after each step\n  // 3. Return the result with complexity stated\n  return input;\n}'}</code></pre>
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
          </aside>
        </div>
      )}

      {!job && pack && (
        <div className="lesson-footer-actions">
          <button className="secondary-button" onClick={onCards}>Review saved flashcards →</button>
          <button onClick={onPractice}>Take saved practice quiz →</button>
        </div>
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

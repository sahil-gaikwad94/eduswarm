import React, { useEffect, useState } from 'react';
import { apiGet, apiPost, greeting, type Page, type Topic } from '../lib/api';
import { Avatar } from '../components/ui';

export function DailyChallenge({ goal, onCode }: { goal: string; onCode: () => void }) {
  const [daily, setDaily] = useState<any>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    setDaily(null); setSelected(null); setResult(null);
    apiGet(`/api/challenge/daily?goal=${encodeURIComponent(goal)}`).then(setDaily).catch(() => {});
  }, [goal]);

  if (!daily) return null;
  const q = daily.question;
  const answer = async (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    try {
      const saved = await apiPost('/api/practice/attempts', {
        topicId: daily.topicId, questionId: q.id, selectedAnswer: q.options[i],
      });
      setResult(saved.attempt);
    } catch {
      setResult({ correct: null });
    }
  };

  return (
    <section className="card dash-card daily-card">
      <p className="label">⚡ DAILY CHALLENGE · {daily.date}</p>
      <b className="daily-question">{q.question}</b>
      <small className="muted">{q.subject} · {q.topic} · {q.difficulty}</small>
      <div className="daily-options">
        {q.options.map((o: string, i: number) => (
          <button
            key={o}
            disabled={selected !== null}
            onClick={() => void answer(i)}
            className={`daily-option ${selected === i ? (result?.correct ? 'correct' : result?.correct === false ? 'incorrect' : '') : ''}`}
          >
            <span>{String.fromCharCode(65 + i)}</span>{o}
          </button>
        ))}
      </div>
      {result && result.correct !== null && (
        <p className={`daily-feedback ${result.correct ? 'good' : 'needs-work'}`}>
          <b>{result.correct ? 'Correct — XP banked, streak fed.' : 'Not quite — logged to your mistake notebook.'}</b>
          {result.solution?.whyItWorks && <span>{result.solution.whyItWorks}</span>}
        </p>
      )}
      {daily.code && (
        <button className="daily-code-teaser" onClick={onCode}>
          <span>⌨</span><span><b>+ {daily.code.title}</b><small>{daily.code.difficulty} · solve in Code Lab for +20 XP</small></span><span>→</span>
        </button>
      )}
    </section>
  );
}

const GOAL_LABELS: Record<string, string> = {
  'gate-cs': 'GATE CSE', 'web-dev': 'Full-stack', 'ai-ml': 'AI / ML',
};

export function Dashboard({ user, goal, data, plan, onNavigate }: {
  user: any; goal: string; data: any | null; plan: any | null;
  onNavigate: (page: Page, topicId?: string) => void;
}) {
  if (!data) {
    return (
      <section className="card dash-skeleton">
        <h1>Loading your command center…</h1>
        <p>Computing mastery, streaks, and today's mission.</p>
      </section>
    );
  }
  const maxWeek = Math.max(1, ...data.week.map((d: any) => d.xp));
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">{GOAL_LABELS[goal] || goal} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <h1>{greeting()}, {user.name?.split(' ')[0] || 'Learner'}.</h1>
          <p className="lead">Here is exactly what to do next — ranked by impact on your goal.</p>
        </div>
        <Avatar size="large" />
      </div>

      <div className="dash-stats">
        <div className="dash-stat">
          <span>LEVEL {data.level.level}</span>
          <b>{data.xp} XP</b>
          <div className="xp-bar"><i style={{ width: `${Math.round(data.level.progress * 100)}%` }} /></div>
          <small>{data.level.needed - data.level.into} XP to level {data.level.level + 1}</small>
        </div>
        <div className="dash-stat">
          <span>STREAK</span>
          <b>{data.streak.current} day{data.streak.current === 1 ? '' : 's'}</b>
          <small>{data.streak.activeToday ? 'Active today — keep going.' : 'A 15-minute session protects it.'}</small>
        </div>
        <div className="dash-stat">
          <span>ACCURACY</span>
          <b>{data.totalAttempts ? `${data.accuracy}%` : '—'}</b>
          <small>{data.totalAttempts} attempts · {data.completedTopics}/{data.totalTopics} kits</small>
        </div>
        <div className="dash-stat">
          <span>DUE REVIEWS</span>
          <b>{data.dueReviews}</b>
          <small>{data.mistakes} mistake{data.mistakes === 1 ? '' : 's'} in notebook</small>
        </div>
      </div>

      <div className="dash-grid">
        <div className="dash-main">
          <section className="card dash-card">
            <p className="label">DO NEXT · RANKED BY IMPACT</p>
            {data.nextActions.map((action: any, i: number) => (
              <button key={i} className="action-row" onClick={() => onNavigate(action.page, action.topicId)}>
                <span className="action-icon">{action.icon}</span>
                <span className="action-text"><b>{action.title}</b><small>{action.detail}</small></span>
                <span className="topic-arrow">→</span>
              </button>
            ))}
          </section>

          {plan && plan.blocks?.length > 0 && (
            <section className="card dash-card">
              <p className="label">TODAY'S MISSION · {plan.totalMinutes} MIN · {String(plan.intensity).toUpperCase()} MODE</p>
              {plan.blocks.map((block: any, i: number) => (
                <button key={i} className="mission-block" onClick={() => block.page && onNavigate(block.page, block.topicId)}>
                  <span className="mission-kind">{block.kind}</span>
                  <span className="action-text"><b>{block.title}</b><small>{block.detail}</small></span>
                  <span className="mission-min">{block.minutes}m</span>
                </button>
              ))}
            </section>
          )}
        </div>

                <div className="dash-side">
          <DailyChallenge goal={goal} onCode={() => onNavigate('codelab')} />
          <section className="card dash-card">
            <p className="label">MASTERY MAP</p>
            {data.mastery.slice(0, 8).map((m: any) => (
              <div className="mastery-row" key={m.module}>
                <div><b>{m.module}</b><small>{m.completed}/{m.topics} kits</small></div>
                <div className="mastery-bar"><i style={{ width: `${m.score}%` }} className={m.score >= 80 ? 'hot' : m.score >= 55 ? 'warm' : ''} /></div>
                <span>{m.score}</span>
              </div>
            ))}
          </section>

          <section className="card dash-card">
            <p className="label">INSIGHTS</p>
            {data.insights.map((line: string, i: number) => <p className="insight" key={i}>✦ {line}</p>)}
          </section>

          <section className="card dash-card">
            <p className="label">THIS WEEK · XP</p>
            <div className="week-chart">
              {data.week.map((d: any) => (
                <div key={d.date} title={`${d.date}: ${d.xp} XP`}>
                  <i style={{ height: `${Math.max(4, Math.round((d.xp / maxWeek) * 64))}px` }} />
                  <small>{new Date(`${d.date}T00:00:00Z`).toLocaleDateString('en-US', { weekday: 'narrow', timeZone: 'UTC' })}</small>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export function Plan({ topics, onOpen }: { topics: Topic[]; onOpen: (t: Topic) => void }) {
  const next = topics.find((t) => t.status !== 'complete') || topics[0];
  const groups = [...new Set(topics.map((t) => t.module))];
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">THE DEAN'S BRIEFING</p>
          <h1>Make progress that compounds.</h1>
          <p className="lead">A complete learning path. Every topic is open, every explanation is detailed, and every study kit is saved to your account.</p>
        </div>
        <Avatar size="large" />
      </div>
      <section className="hero-banner">
        <div>
          <p className="label">NEXT BEST TUTORIAL · {next.module.toUpperCase()}</p>
          <h2>{next.title}</h2>
          <p>{next.description}</p>
          <div className="hero-meta"><span>◷ {next.minutes} min</span><span>◈ Detailed notes</span><span>✓ Practice included</span></div>
          <button onClick={() => onOpen(next)}>Open tutorial →</button>
        </div>
      </section>
      <div className="section-title"><div><p className="eyebrow">YOUR ROADMAP</p><h2>Everything unlocked</h2></div></div>
      <div className="roadmap-grid">
        {groups.map((g) => (
          <section className="module-card" key={g}>
            <div className="module-header">
              <span className="module-icon">✦</span>
              <div><p className="label">MODULE</p><h3>{g}</h3></div>
            </div>
            {topics.filter((t) => t.module === g).slice(0, 5).map((t, i) => (
              <button className="topic-row" key={t.id} onClick={() => onOpen(t)}>
                <span className="topic-number">{String(i + 1).padStart(2, '0')}</span>
                <span className="topic-row-text"><b>{t.title}</b><small>{t.minutes} min · tutorial + practice · open</small></span>
                <span className="topic-arrow">→</span>
              </button>
            ))}
          </section>
        ))}
      </div>
    </>
  );
}

export function Syllabus({ topics, mastery, onOpen }: { topics: Topic[]; mastery: Map<string, number>; onOpen: (t: Topic) => void }) {
  return (
    <>
      <div className="compact-heading">
        <div>
          <p className="eyebrow">THE FULL PATH</p>
          <h1>Complete syllabus</h1>
          <p className="lead">Explore every lesson without artificial locks. Dots show mastery: green is strong, amber is growing.</p>
        </div>
      </div>
      <div className="syllabus-list">
        {[...new Set(topics.map((t) => t.module))].map((g, i) => (
          <section className="syllabus-module" key={g}>
            <div className="module-marker"><span>0{i + 1}</span><i /></div>
            <div className="syllabus-module-body">
              <p className="eyebrow">MODULE {i + 1}</p>
              <h2>{g}</h2>
              {topics.filter((t) => t.module === g).map((t) => {
                const score = mastery.get(t.id) ?? 0;
                return (
                  <button className="syllabus-row" key={t.id} onClick={() => onOpen(t)}>
                    <span className={`mastery-dot ${score >= 80 ? 'hot' : score >= 25 ? 'warm' : ''}`} title={`Mastery ${score}`}>•</span>
                    <span><b>{t.title}</b><small>{t.description}</small></span>
                    <span className="syllabus-duration">{t.minutes} min →</span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

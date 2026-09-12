import React, { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost, greeting, type Page, type Topic } from '../lib/api';
import { Avatar } from '../components/ui';

/**
 * Home = the current learning universe.
 * ------------------------------------
 * A learner's job on this screen is: see the universe they are in, switch it in
 * one tap, and pick the next tutorial. Everything else (today's mission,
 * daily challenge, insights, weekly XP) lives on the Today's mission page.
 */

type Universe = { id: string; title: string; short: string; blurb: string };

export function Home({ user, goal, universe, universes, topics, mastery, progress, dashboard, switching, onSwitch, onOpen, onNavigate }: {
  user: any; goal: string; universe: Universe; universes: Universe[]; topics: Topic[];
  mastery: Map<string, number>; progress: any[]; dashboard: any; switching: boolean;
  onSwitch: (goal: string) => void; onOpen: (t: Topic) => void; onNavigate: (page: Page, topicId?: string) => void;
}) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState('');
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});
  const [moduleCap, setModuleCap] = useState<Record<string, number>>({});

  useEffect(() => {
    apiGet('/api/universes')
      .then((d) => setCounts(Object.fromEntries((d.universes || []).map((u: any) => [u.goal, u.topics]))))
      .catch(() => {});
  }, []);

  const completedIds = useMemo(() => new Set(progress.filter((p) => p.completed).map((p) => p.topicId)), [progress]);
  const query = filter.trim().toLowerCase();
  const visible = useMemo(
    () => (query
      ? topics.filter((t) => `${t.title} ${t.module} ${t.description}`.toLowerCase().includes(query))
      : topics),
    [topics, query],
  );
  const modules = useMemo(() => [...new Set(visible.map((t) => t.module))], [visible]);
  const completedCount = topics.filter((t) => completedIds.has(t.id)).length;
  const nextUp = topics.find((t) => !completedIds.has(t.id)) || topics[0];
  const lastSaved = useMemo(() => {
    const saved = progress.filter((p) => p.topicId);
    return saved.length ? topics.find((t) => t.id === saved[saved.length - 1].topicId) || null : null;
  }, [progress, topics]);
  const level = dashboard?.level;
  const streak = dashboard?.streak?.current || 0;
  const week = dashboard?.week || [];
  const maxWeek = Math.max(1, ...week.map((d: any) => d.xp));

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">{greeting()}, {user.name?.split(' ')[0] || 'Learner'} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <h1>{universe.title}</h1>
          <p className="lead">{universe.blurb}</p>
        </div>
        <Avatar size="large" />
      </div>

      <section className="universe-switch">
        <div className="universe-switch-head">
          <p className="label">SWITCH LEARNING UNIVERSE</p>
          {switching && <small className="muted">Loading syllabus…</small>}
        </div>
        <div className="universe-cards">
          {universes.map((u) => {
            const active = u.id === goal;
            return (
              <button
                key={u.id}
                className={`universe-card ${active ? 'active' : ''}`}
                onClick={() => void onSwitch(u.id)}
                aria-pressed={active}
              >
                <span className="universe-flag">{active ? '● Active' : '○ Switch'}</span>
                <b>{u.title}</b>
                <small>{u.blurb}</small>
                <span className="universe-meta">{counts[u.id] ?? (active ? topics.length : '—')} tutorials</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="syllabus-head card">
        <div className="syllabus-head-text">
          <p className="label">COMPLETE SYLLABUS · {universe.title.toUpperCase()}</p>
          <h2>{topics.length} tutorials across {new Set(topics.map((t) => t.module)).size} modules</h2>
          <p className="muted">{completedCount} completed · every tutorial is open, no locks.</p>
        </div>
        <div className="syllabus-head-actions">
          <input
            className="syllabus-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={`Filter ${universe.short} topics…`}
          />
          {(lastSaved || nextUp) && (
            <button className="continue-button" onClick={() => onOpen(lastSaved || nextUp)}>
              {lastSaved ? '↺ Continue where you left off' : '▶ Start the first tutorial'}
            </button>
          )}
        </div>
      </section>

      <div className="syllabus-list">
        {modules.map((module, i) => {
          const group = visible.filter((t) => t.module === module);
          const expanded = openModules[module] !== false;
          const cap = moduleCap[module] ?? 6;
          const shown = expanded ? group.slice(0, cap) : [];
          const done = group.filter((t) => completedIds.has(t.id)).length;
          const moduleScore = group.length
            ? Math.round(group.reduce((sum, t) => sum + (mastery.get(t.id) || 0), 0) / group.length)
            : 0;
          return (
            <section className="syllabus-module" key={module}>
              <div className="module-marker"><span>{String(i + 1).padStart(2, '0')}</span><i /></div>
              <div className="syllabus-module-body">
                <div className="syllabus-module-head">
                  <div>
                    <p className="eyebrow">MODULE {i + 1}</p>
                    <h2>{module}</h2>
                  </div>
                  <div className="syllabus-module-meta">
                    <span>{done}/{group.length} done</span>
                    <button className="ghost-button" onClick={() => setOpenModules((prev) => ({ ...prev, [module]: !expanded }))}>
                      {expanded ? 'Collapse' : 'Expand'}
                    </button>
                  </div>
                </div>
                <div className="mastery-bar wide"><i style={{ width: `${moduleScore}%` }} className={moduleScore >= 80 ? 'hot' : moduleScore >= 55 ? 'warm' : ''} /></div>
                {shown.map((t) => {
                  const score = mastery.get(t.id) ?? 0;
                  const isDone = completedIds.has(t.id);
                  return (
                    <button className="syllabus-row" key={t.id} onClick={() => onOpen(t)}>
                      <span className={`mastery-dot ${isDone ? 'done' : score >= 80 ? 'hot' : score >= 25 ? 'warm' : ''}`} title={isDone ? 'Completed' : `Mastery ${score}`}>•</span>
                      <span><b>{t.title}</b><small>{t.description}</small></span>
                      <span className="syllabus-duration">{isDone ? '✓ done' : `${t.minutes} min →`}</span>
                    </button>
                  );
                })}
                {expanded && group.length > cap && (
                  <button className="module-more" onClick={() => setModuleCap((prev) => ({ ...prev, [module]: cap + 12 }))}>
                    Show {Math.min(12, group.length - cap)} more of {group.length} →
                  </button>
                )}
                {!expanded && <p className="muted module-collapsed">{group.length} tutorials hidden</p>}
              </div>
            </section>
          );
        })}
        {!modules.length && (
          <section className="empty-feature card">
            <div className="empty-icon">⌕</div>
            <h2>No tutorial matches “{filter}”.</h2>
            <p>Try a broader word, or clear the filter to see the whole {universe.title} syllabus.</p>
            <button onClick={() => setFilter('')}>Clear filter</button>
          </section>
        )}
      </div>

      <section className="xp-strip">
        <div className="xp-strip-card">
          <span>LEVEL {level?.level ?? 1}</span>
          <b>{dashboard?.xp ?? 0} XP</b>
          <div className="xp-bar"><i style={{ width: `${Math.round((level?.progress ?? 0) * 100)}%` }} /></div>
          <small>{level ? `${level.needed - level.into} XP to level ${level.level + 1}` : 'Finish a tutorial to earn XP'}</small>
        </div>
        <div className="xp-strip-card">
          <span>STREAK</span>
          <b>{streak} day{streak === 1 ? '' : 's'}</b>
          <small>{dashboard?.streak?.activeToday ? 'Active today — keep going.' : 'A 15-minute session protects it.'}</small>
        </div>
        <div className="xp-strip-card">
          <span>ACCURACY</span>
          <b>{dashboard?.totalAttempts ? `${dashboard.accuracy}%` : '—'}</b>
          <small>{dashboard?.totalAttempts ?? 0} attempts · {completedCount}/{topics.length} kits</small>
        </div>
        <div className="xp-strip-card">
          <span>DUE REVIEWS</span>
          <b>{dashboard?.dueReviews ?? 0}</b>
          <small>{dashboard?.mistakes ?? 0} mistake{(dashboard?.mistakes ?? 0) === 1 ? '' : 's'} in notebook</small>
        </div>
        {week.length > 0 && (
          <div className="xp-strip-card week">
            <span>THIS WEEK · XP</span>
            <div className="week-chart">
              {week.map((d: any) => (
                <div key={d.date} title={`${d.date}: ${d.xp} XP`}>
                  <i style={{ height: `${Math.max(4, Math.round((d.xp / maxWeek) * 48))}px` }} />
                  <small>{new Date(`${d.date}T00:00:00Z`).toLocaleDateString('en-US', { weekday: 'narrow', timeZone: 'UTC' })}</small>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="home-shortcuts">
        <button onClick={() => onNavigate('quiz')}><b>✓ PYQ quiz</b><small>Timed questions with solutions</small></button>
        <button onClick={() => onNavigate('mocks')}><b>◷ Mock exams</b><small>Full papers, GATE marking</small></button>
        <button onClick={() => onNavigate('agents')}><b>✦ Agent team</b><small>Ask a specialist anything</small></button>
        <button onClick={() => onNavigate('plan')}><b>◈ Today's mission</b><small>Your ranked next actions</small></button>
      </section>
    </>
  );
}

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
      const saved = await apiPost('/api/practice/attempts', { topicId: daily.topicId, questionId: q.id, selectedAnswer: q.options[i] });
      setResult(saved.attempt);
    } catch { setResult({ correct: null }); }
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

/** Everything that used to crowd the home screen, on one focused page. */
export function Plan({ user, goal, topics, data, plan, onOpen, onNavigate }: {
  user: any; goal: string; topics: Topic[]; data: any | null; plan: any | null;
  onOpen: (t: Topic) => void; onNavigate: (page: Page, topicId?: string) => void;
}) {
  const next = topics.find((t) => t.status !== 'complete') || topics[0];
  if (!data) {
    return (
      <section className="card dash-skeleton">
        <h1>Building today's mission…</h1>
        <p>Ranking your next actions by impact.</p>
      </section>
    );
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">THE DEAN'S BRIEFING</p>
          <h1>Today's mission.</h1>
          <p className="lead">Ranked by impact on your goal — do the top item and the day counts.</p>
        </div>
        <Avatar size="large" />
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
              <p className="label">TIME-BOXED PLAN · {plan.totalMinutes} MIN · {String(plan.intensity).toUpperCase()} MODE</p>
              {plan.blocks.map((block: any, i: number) => (
                <button key={i} className="mission-block" onClick={() => block.page && onNavigate(block.page, block.topicId)}>
                  <span className="mission-kind">{block.kind}</span>
                  <span className="action-text"><b>{block.title}</b><small>{block.detail}</small></span>
                  <span className="mission-min">{block.minutes}m</span>
                </button>
              ))}
            </section>
          )}

          {next && (
            <section className="hero-banner">
              <div>
                <p className="label">NEXT BEST TUTORIAL · {next.module.toUpperCase()}</p>
                <h2>{next.title}</h2>
                <p>{next.description}</p>
                <div className="hero-meta"><span>◷ {next.minutes} min</span><span>◈ Detailed notes</span><span>✓ Practice included</span></div>
                <button onClick={() => onOpen(next)}>Open tutorial →</button>
              </div>
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
            <p className="label">YOUR UNIVERSE</p>
            <p className="muted">{user.name} is studying the {goal === 'gate-cs' ? 'GATE CSE' : goal === 'web-dev' ? 'Full-stack Engineering' : 'AI / ML Engineering'} universe. Switch it any time from Home.</p>
            <button className="secondary-button" onClick={() => onNavigate('dashboard')}>Change universe →</button>
          </section>
        </div>
      </div>
    </>
  );
}

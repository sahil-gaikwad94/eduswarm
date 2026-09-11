import React, { useEffect, useState } from 'react';
import { API, apiDelete, apiGet, apiPatch, apiPost, type Agent, type Topic } from '../lib/api';

const opts = { credentials: 'include' as const };

// ------------------------------------------------------------------ agents

export function Agents({ agents, onOpen }: { agents: Agent[]; onOpen: (a: Agent) => void }) {
  return (
    <>
      <div className="compact-heading"><div>
        <p className="eyebrow">YOUR SPECIALIST TEAM</p>
        <h1>Guidance that actually starts.</h1>
        <p className="lead">Each specialist opens a saved session with context, a first prompt, and a working conversation.</p>
      </div></div>
      <div className="agent-directory">
        {agents.map((a) => (
          <article className="agent-card card" key={a.id}>
            <span className="agent-card-icon">{a.icon}</span>
            <p className="eyebrow">{a.role}</p>
            <h2>{a.name}</h2>
            <p>{a.description}</p>
            <div className="agent-best"><span>BEST FOR</span><b>{a.bestFor}</b></div>
            <button onClick={() => onOpen(a)}>Start a guided session →</button>
          </article>
        ))}
      </div>
    </>
  );
}

// ----------------------------------------------------------------- progress

export function Progress({ topics, progress }: { topics: Topic[]; progress: any[] }) {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [week, setWeek] = useState<any[]>([]);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/api/practice/attempts`, opts).then((r) => r.json()).then((d) => setAttempts(d.attempts || [])).catch(() => {});
    apiGet('/api/achievements').then((d) => setAchievements(d.achievements || [])).catch(() => {});
    apiGet('/api/analytics/weekly').then((d) => setWeek(d.days || [])).catch(() => {});
  }, [progress.length]);

  const done = progress.filter((p) => p.completed).length;
  const grouped = Object.entries(attempts.reduce((acc: any, a: any) => {
    const key = `${a.subject || 'General'} · ${a.topic || 'Topic'}`;
    (acc[key] ??= []).push(a);
    return acc;
  }, {}));
  const maxWeek = Math.max(1, ...week.map((d) => d.attempts));

  return (
    <>
      <div className="compact-heading"><div>
        <p className="eyebrow">YOUR LEARNING RHYTHM</p>
        <h1>Progress that you can see.</h1>
        <p className="lead">Saved topics, attempts, achievements, and step-by-step solutions organized for revision.</p>
      </div></div>
      <div className="stats-grid">
        <div className="stat-card"><span>TOPICS COMPLETE</span><b>{done}</b><small>of {topics.length}</small></div>
        <div className="stat-card violet"><span>QUESTIONS ATTEMPTED</span><b>{attempts.length}</b><small>saved attempts</small></div>
        <div className="stat-card yellow"><span>CARDS REVIEWED</span><b>{progress.reduce((n, p) => n + (p.reviewedFlashcards || 0), 0)}</b><small>active recall</small></div>
      </div>

      {week.length > 0 && (
        <section className="card dash-card" style={{ marginTop: 18 }}>
          <p className="label">ACTIVITY · LAST 7 DAYS</p>
          <div className="week-chart tall">
            {week.map((d: any) => (
              <div key={d.date} title={`${d.date}: ${d.attempts} attempts, ${d.xp} XP`}>
                <i style={{ height: `${Math.max(4, Math.round((d.attempts / maxWeek) * 72))}px` }} />
                <small>{d.label}</small>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="section-title" style={{ marginTop: 26 }}><div><p className="eyebrow">PROOF OF WORK</p><h2>Achievements</h2></div></div>
      <div className="badge-grid">
        {achievements.map((a: any) => (
          <div key={a.id} className={`badge card ${a.unlocked ? 'unlocked' : ''}`}>
            <span className="badge-icon">{a.unlocked ? '★' : '☆'}</span>
            <b>{a.title}</b>
            <small>{a.desc}</small>
            <div className="xp-bar small"><i style={{ width: `${Math.round((a.current / a.target) * 100)}%` }} /></div>
            <small>{a.current}/{a.target}</small>
          </div>
        ))}
      </div>

      <section className="review-history" style={{ marginTop: 26 }}>
        <div className="section-title"><div><p className="eyebrow">REVISIT YOUR THINKING</p><h2>Solved questions & solutions</h2></div></div>
        {grouped.length ? grouped.map(([group, items]: any) => (
          <article className="review-group card" key={group}>
            <h3>{group}</h3>
            {items.map((a: any) => (
              <div className="review-item" key={a.id}>
                <button onClick={() => setOpen(open === a.id ? null : a.id)}>
                  <span className={a.correct ? 'result-dot correct-dot' : 'result-dot'}>{a.correct ? '✓' : '!'}</span>
                  <span><b>{a.question}</b><small>{a.correct ? 'Correct' : 'Needs review'} · {new Date(a.answeredAt).toLocaleDateString()}</small></span>
                  <span>{open === a.id ? '−' : '+'}</span>
                </button>
                {open === a.id && (
                  <div className="solution-card">
                    <p className="label">STEP-BY-STEP SOLUTION</p>
                    <p><b>Approach:</b> {a.solution?.approach}</p>
                    <ol>{(a.solution?.stepByStep || []).map((step: string, si: number) => <li key={si}>{step}</li>)}</ol>
                    <p><b>Why it works:</b> {a.solution?.whyItWorks}</p>
                    <p><b>Common mistake:</b> {a.solution?.commonMistake}</p>
                  </div>
                )}
              </div>
            ))}
          </article>
        )) : (
          <section className="empty-feature card">
            <div className="empty-icon">⌁</div>
            <h2>Your solved questions will appear here.</h2>
            <p>Answer generated practice or PYQs and EduSwarm will save the question, result, reasoning path, and solution for revision.</p>
          </section>
        )}
      </section>
    </>
  );
}

// ----------------------------------------------------------------- mistakes

export function Mistakes() {
  const [mistakes, setMistakes] = useState<any[]>([]);
  const [repair, setRepair] = useState<any>(null);

  const load = () => fetch(`${API}/api/mistakes`, opts).then((r) => r.json()).then((d) => setMistakes(d.mistakes || [])).catch(() => {});
  useEffect(() => { void load(); }, []);

  const remove = async (id: string) => {
    await apiDelete(`/api/mistakes/${id}`).catch(() => {});
    setMistakes((items) => items.filter((item) => item.id !== id));
  };
  const makeRepair = async (id: string) => {
    const data = await apiPost(`/api/mistakes/${id}/repair`).catch(() => null);
    if (data) setRepair(data);
  };

  return (
    <>
      <div className="compact-heading"><div>
        <p className="eyebrow">REPAIR, NOT REGRET</p>
        <h1>Mistake notebook</h1>
        <p className="lead">Every wrong answer becomes a targeted next step: understand the failed assumption, practise a smaller example, and retry the pattern.</p>
      </div></div>
      {repair && (
        <section className="repair-card card">
          <button className="close-button" onClick={() => setRepair(null)}>×</button>
          <p className="label">THREE-MINUTE REPAIR LESSON</p>
          <h2>{repair.title}</h2>
          <ol>{repair.steps.map((step: string, i: number) => <li key={i}>{step}</li>)}</ol>
        </section>
      )}
      {mistakes.length ? (
        <section className="review-history">
          <div className="section-title"><div><p className="eyebrow">YOUR WEAK SIGNALS</p><h2>{mistakes.length} misconception{mistakes.length === 1 ? '' : 's'} worth repairing</h2></div></div>
          {mistakes.map((item) => (
            <article className="review-group card mistake-item" key={item.id}>
              <div>
                <p className="label">{item.subject} · {item.topic}</p>
                <h3>{item.question}</h3>
                <p><b>Your answer:</b> {item.learnerAnswer}</p>
                <p><b>Correct answer:</b> {item.correctAnswer}</p>
                <p className="muted"><b>Likely trap:</b> {item.misconception}</p>
              </div>
              <div className="practice-actions">
                <button onClick={() => void makeRepair(item.id)}>Build repair lesson</button>
                <button className="secondary-button" onClick={() => void remove(item.id)}>Mark repaired</button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="empty-feature card">
          <div className="empty-icon">✓</div>
          <h2>Your notebook is clear.</h2>
          <p>When a practice answer is incorrect, EduSwarm will save the concept, your answer, and the likely misconception here.</p>
        </section>
      )}
    </>
  );
}

// ------------------------------------------------------------------ profile

const LEVELS = ['beginner', 'intermediate', 'advanced'];
const GOAL_TYPES = [
  { id: 'gate-cs', label: 'GATE CSE' }, { id: 'web-dev', label: 'Full-stack' },
  { id: 'ai-ml', label: 'AI / ML' }, { id: 'other', label: 'Custom' },
];

export function Profile({ user, onSave }: { user: any; onSave: (u: any) => void }) {
  const [dailyMinutes, setDailyMinutes] = useState(user.dailyMinutes || 60);
  const [skillLevel, setSkillLevel] = useState(user.skillLevel || 'beginner');
  const [targetDate, setTargetDate] = useState(user.targetDate || '');
  const [newGoal, setNewGoal] = useState('web-dev');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try { onSave(await apiPatch('/api/me', { dailyMinutes, skillLevel, targetDate: targetDate || null })); }
    finally { setBusy(false); }
  };
  const addGoal = async () => {
    setBusy(true);
    try {
      await apiPost('/api/goals', { type: newGoal });
      onSave(await apiGet('/api/me'));
    } finally { setBusy(false); }
  };
  const toggleGoal = async (g: any) => {
    await apiPatch(`/api/goals/${g.id}`, { paused: !g.paused }).catch(() => {});
    onSave(await apiGet('/api/me'));
  };
  const removeGoal = async (id: string) => {
    await apiDelete(`/api/goals/${id}`).catch(() => {});
    onSave(await apiGet('/api/me'));
  };

  return (
    <>
      <div className="compact-heading"><div>
        <p className="eyebrow">YOUR LEARNING IDENTITY</p>
        <h1>Profile</h1>
      </div></div>
      <section className="profile-card card">
        <div className="profile-hero">
          <span className="profile-avatar">{user.name?.[0] || 'S'}</span>
          <div>
            <p className="label">LEARNER</p>
            <h2>{user.name}</h2>
            <p>{user.skillLevel || 'Beginner'} · {user.dailyMinutes || 60} minutes per day{user.targetDate ? ` · target ${user.targetDate}` : ''}</p>
          </div>
        </div>
        <div className="form-row" style={{ marginTop: 18 }}>
          <label>Minutes per day<input type="number" min={15} max={240} value={dailyMinutes} onChange={(e) => setDailyMinutes(Number(e.target.value))} /></label>
          <label>Level<select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)}>{LEVELS.map((l) => <option key={l}>{l}</option>)}</select></label>
          <label>Target date<input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} /></label>
        </div>
        <div className="practice-actions"><button onClick={() => void save()} disabled={busy}>{busy ? 'Saving…' : 'Save preferences'}</button></div>
        <div className="profile-fields">
          <div><span>GOALS</span><b>{user.goals?.length || 0} active learning universes</b></div>
          <div><span>TEAM STYLE</span><b>Evidence-first tutorials</b></div>
          <div><span>SAVED DATA</span><b>Topics, cards, quizzes, sessions</b></div>
        </div>
      </section>

      <div className="section-title" style={{ marginTop: 26 }}><div><p className="eyebrow">MULTI-GOAL LEARNER</p><h2>Your goals</h2></div></div>
      <div className="goal-list">
        {(user.goals || []).map((g: any) => (
          <div className="goal-row card" key={g.id}>
            <span><b>{g.title}</b><small>{g.type}{g.paused ? ' · paused' : ''}</small></span>
            <span className="goal-actions">
              <button className="secondary-button" onClick={() => void toggleGoal(g)}>{g.paused ? 'Resume' : 'Pause'}</button>
              <button className="secondary-button" onClick={() => void removeGoal(g.id)}>Remove</button>
            </span>
          </div>
        ))}
      </div>
      <div className="goal-add">
        <select value={newGoal} onChange={(e) => setNewGoal(e.target.value)}>
          {GOAL_TYPES.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
        </select>
        <button onClick={() => void addGoal()} disabled={busy}>Add goal →</button>
      </div>
    </>
  );
}

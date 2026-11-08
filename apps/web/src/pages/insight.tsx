import React, { useEffect, useState } from 'react';
import { API, apiDelete, apiGet, apiPatch, apiPost, setToken, type Topic } from '../lib/api';
import { AvatarFace, AVATAR_COLORS } from '../components/Mascot';

const opts = { credentials: 'include' as const };

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
const AVATAR_COLOR_SWATCHES = AVATAR_COLORS.map((c) => ({ id: c.id, name: c.name, fill: c.fill }));
const ACCESSORY_LABELS: Record<string, string> = {
  none: 'Bare Doddly', glasses: 'Scholar glasses', cap: 'Topper cap', headband: 'Grinder headband', star: 'Star pin', antenna: 'Spark antenna',
};

export function Profile({ user, goal, onSave, onSwitch, onSignOut }: {
  user: any; goal: string; onSave: (u: any) => void; onSwitch?: (goal: string) => void; onSignOut?: () => void;
}) {
  const [dailyMinutes, setDailyMinutes] = useState(user.dailyMinutes || 60);
  const [skillLevel, setSkillLevel] = useState(user.skillLevel || 'beginner');
  const [targetDate, setTargetDate] = useState(user.targetDate || '');
  const [name, setName] = useState(user.name || '');
  const [newGoal, setNewGoal] = useState('web-dev');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [avatarColor, setAvatarColor] = useState<string>(user.avatar?.color || 'ember');
  const [avatarAccessory, setAvatarAccessory] = useState<string>(user.avatar?.accessory || 'none');
  const [avatarSaved, setAvatarSaved] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      const patch: any = { dailyMinutes, skillLevel, targetDate: targetDate || null };
      if (name.trim() && name.trim() !== user.name) patch.name = name.trim();
      onSave(await apiPatch('/api/me', patch));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } finally { setBusy(false); }
  };
  const saveAvatar = async (color: string, accessory: string) => {
    setAvatarColor(color); setAvatarAccessory(accessory);
    try {
      onSave(await apiPatch('/api/me', { avatar: { base: 'flame', color, accessory } }));
      setAvatarSaved(true);
      window.setTimeout(() => setAvatarSaved(false), 1500);
    } catch { /* best-effort; customizer UI stays in sync locally */ }
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

  const universe = goal === 'gate-cs' ? 'GATE CSE' : goal === 'web-dev' ? 'Full-stack Engineering' : goal === 'ai-ml' ? 'AI / ML Engineering' : goal;
  const activeGoals = (user.goals || []).filter((g: any) => !g.paused);
  const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'this year';

  return (
    <>
      <div className="compact-heading"><div>
        <p className="eyebrow">YOUR LEARNING IDENTITY</p>
        <h1>Make it <em>yours.</em></h1>
        <p className="lead">Your universe, your pace, your Doddly. Change anything — saves go straight to your account.</p>
      </div></div>

      {/* ---------------- hero identity card ---------------- */}
      <section className="profile-hero card">
        <div className="profile-hero-main">
          <div className="profile-avatar-lg" aria-hidden>
            <AvatarFace color={avatarColor} accessory={avatarAccessory} size={150} />
          </div>
          <div className="profile-hero-copy">
            <p className="label">DASHBOARD</p>
            <h2>{user.name}</h2>
            <p className="profile-hero-sub">Studying <b>{universe}</b> · joined {joinDate}</p>
            <div className="profile-chip-row">
              <span className="profile-chip">◈ {user.skillLevel || 'beginner'}</span>
              <span className="profile-chip">◷ {user.dailyMinutes || 60} min / day</span>
              {user.targetDate && <span className="profile-chip">⚑ target {user.targetDate}</span>}
              <span className="profile-chip">✦ {activeGoals.length} active {activeGoals.length === 1 ? 'universe' : 'universes'}</span>
            </div>
            <div className="profile-meta-line">
              <span><b>{user.goals?.length || 0}</b> {user.goals?.length === 1 ? 'goal' : 'goals'}</span>
              <span className="dot">·</span>
              <span>Evidence-first tutorials</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- customize Doddly ---------------- */}
      <section className="avatar-customizer card">
        <div className="avatar-customizer-head">
          <div>
            <p className="label">MAKE DODDLY YOURS</p>
            <h2>Pick a flame. Pick an accessory.</h2>
          </div>
          <span className="avatar-saved">{avatarSaved ? '✓ Saved' : 'Tap to apply instantly'}</span>
        </div>
        <div className="avatar-colorway">
          {AVATAR_COLOR_SWATCHES.map((swatch) => (
            <button
              key={swatch.id}
              className={`avatar-swatch ${avatarColor === swatch.id ? 'active' : ''}`}
              style={{ background: swatch.fill }}
              onClick={() => saveAvatar(swatch.id, avatarAccessory)}
              aria-pressed={avatarColor === swatch.id}
              aria-label={`Flame colorway ${swatch.name}`}
              title={swatch.name}
            />
          ))}
        </div>
        <div className="avatar-accessory" role="radiogroup" aria-label="Avatar accessory">
          {Object.entries(ACCESSORY_LABELS).map(([id, label]) => (
            <button
              key={id}
              role="radio"
              aria-checked={avatarAccessory === id}
              className={`avatar-accessory-option ${avatarAccessory === id ? 'active' : ''}`}
              onClick={() => saveAvatar(avatarColor, id)}
              title={label}
            >
              <AvatarFace color={avatarColor} accessory={id} size={54} />
              <small>{label}</small>
            </button>
          ))}
        </div>
      </section>

      {/* ---------------- preferences ---------------- */}
      <section className="profile-card card">
        <p className="label">YOUR STUDY PREFERENCES</p>
        <div className="profile-form">
          <label>Display name<input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="Aarav Sharma" /></label>
          <label>Minutes per day<input type="number" min={15} max={240} value={dailyMinutes} onChange={(e) => setDailyMinutes(Number(e.target.value))} /></label>
          <label>Level<select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)}>{LEVELS.map((l) => <option key={l}>{l}</option>)}</select></label>
          <label>Target date<input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} /></label>
        </div>
        <div className="practice-actions">
          <button onClick={() => void save()} disabled={busy}>{saved ? '✓ Saved' : busy ? 'Saving…' : 'Save preferences'}</button>
          <button className="secondary-button" onClick={() => { setToken(null); onSignOut?.(); }}>Log out</button>
        </div>
      </section>

      {/* ---------------- universes ---------------- */}
      <div className="section-title" style={{ marginTop: 26 }}><div><p className="eyebrow">MULTI-GOAL LEARNER</p><h2>Your learning universes</h2></div></div>
      <div className="goal-list">
        {(user.goals || []).map((g: any) => (
          <div className="goal-row card" key={g.id}>
            <span><b>{g.title}</b><small>{g.type}{g.paused ? ' · paused' : ''}{g.type === goal ? ' · active' : ''}</small></span>
            <span className="goal-actions">
              {g.type !== goal && g.type !== 'other' && onSwitch && (
                <button onClick={() => void onSwitch(g.type)}>Make active →</button>
              )}
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

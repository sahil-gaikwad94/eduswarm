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
const AVATAR_COLOR_SWATCHES = AVATAR_COLORS.map((c) => ({ id: c.id, name: c.name, fill: c.fill }));
const ACCESSORY_LABELS: Record<string, string> = {
  none: 'Bare Doddly', glasses: 'Scholar glasses', cap: 'Topper cap', headband: 'Grinder headband', star: 'Star pin', antenna: 'Spark antenna',
};
const PROFILE_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'activity', label: 'Activity' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'saved', label: 'Saved' },
] as const;
const READING_KEY = 'eduswarm.readingList';
const PRIVATE_KEY = 'eduswarm.privateProfile';

function readingIds(): string[] {
  try { return JSON.parse(localStorage.getItem(READING_KEY) || '[]'); } catch { return []; }
}
function suggestedHandle(user: any): string {
  if (user?.handle) return String(user.handle).replace(/^@/, '');
  const base = String(user?.name || 'learner').toLowerCase().normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 18) || 'learner';
  const suffix = String(user?.id || '').replace(/[^a-z0-9]/gi, '').slice(-4).toLowerCase() || 'edu';
  return `${base}_${suffix}`;
}

type ProfileTab = typeof PROFILE_TABS[number]['id'];

export function Profile({ user, goal, onSave, onSignOut }: {
  user: any; goal: string; onSave: (u: any) => void; onSignOut?: () => void;
}) {
  const [tab, setTab] = useState<ProfileTab>('overview');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dashboard, setDashboard] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [weekly, setWeekly] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>(readingIds);
  const [busy, setBusy] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [settingsError, setSettingsError] = useState('');

  const [name, setName] = useState(user.name || '');
  const [handle, setHandle] = useState(suggestedHandle(user));
  const [bio, setBio] = useState(user.bio || '');
  const [dailyMinutes, setDailyMinutes] = useState(user.dailyMinutes || 60);
  const [skillLevel, setSkillLevel] = useState(user.skillLevel || 'beginner');
  const [targetDate, setTargetDate] = useState(user.targetDate || '');
  const [avatarColor, setAvatarColor] = useState<string>(user.avatar?.color || 'ember');
  const [avatarAccessory, setAvatarAccessory] = useState<string>(user.avatar?.accessory || 'none');
  const [privateAccount, setPrivateAccount] = useState<boolean>(() => {
    if (typeof user.private === 'boolean') return user.private;
    try { return localStorage.getItem(PRIVATE_KEY) === 'true'; } catch { return false; }
  });

  useEffect(() => {
    let alive = true;
    apiGet(`/api/dashboard?goal=${encodeURIComponent(goal)}`).then((d) => { if (alive) setDashboard(d); }).catch(() => {});
    apiGet('/api/achievements').then((d) => { if (alive) setAchievements(d.achievements || []); }).catch(() => {});
    apiGet('/api/analytics/weekly').then((d) => { if (alive) setWeekly(d.days || []); }).catch(() => {});
    apiGet('/api/practice/attempts').then((d) => { if (alive) setAttempts(d.attempts || []); }).catch(() => {});
    apiGet(`/api/resources?goal=${encodeURIComponent(goal)}`).then((d) => { if (alive) setResources(d.resources || []); }).catch(() => {});
    return () => { alive = false; };
  }, [goal]);

  useEffect(() => {
    if (!settingsOpen) return undefined;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setSettingsOpen(false); };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [settingsOpen]);

  const openSettings = () => {
    setName(user.name || '');
    setHandle(suggestedHandle(user));
    setBio(user.bio || '');
    setDailyMinutes(user.dailyMinutes || 60);
    setSkillLevel(user.skillLevel || 'beginner');
    setTargetDate(user.targetDate || '');
    setAvatarColor(user.avatar?.color || 'ember');
    setAvatarAccessory(user.avatar?.accessory || 'none');
    setSettingsError('');
    setSettingsOpen(true);
  };

  const saveAvatar = async (color: string, accessory: string) => {
    setAvatarColor(color);
    setAvatarAccessory(accessory);
    try {
      onSave(await apiPatch('/api/me', { avatar: { base: 'flame', color, accessory } }));
    } catch { /* the local customizer stays in sync until the next save */ }
  };

  const saveSettings = async () => {
    setBusy(true);
    setSettingsError('');
    try {
      const updated = await apiPatch('/api/me', {
        name: name.trim() || user.name,
        handle: handle.trim().replace(/^@/, ''),
        bio: bio.trim(),
        dailyMinutes,
        skillLevel,
        targetDate: targetDate || null,
        avatar: { base: 'flame', color: avatarColor, accessory: avatarAccessory },
        private: privateAccount,
      });
      onSave(updated);
      try { localStorage.setItem(PRIVATE_KEY, String(privateAccount)); } catch { /* private mode */ }
      setSavedFlash(true);
      setSettingsOpen(false);
      window.setTimeout(() => setSavedFlash(false), 2200);
    } catch (error: any) {
      setSettingsError(error?.message || 'Those settings could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  const toggleSaved = (id: string) => {
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try { localStorage.setItem(READING_KEY, JSON.stringify(next)); } catch { /* private mode */ }
      return next;
    });
  };

  const universe = goal === 'gate-cs' ? 'GATE CSE' : goal === 'web-dev' ? 'Full-stack Engineering' : goal === 'ai-ml' ? 'AI / ML Engineering' : goal;
  const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'this year';
  const unlocked = achievements.filter((item) => item.unlocked);
  const week = weekly.length ? weekly : (dashboard?.week || []);
  const maxWeek = Math.max(1, ...week.map((day: any) => Number(day.attempts || 0)));
  const savedResources = resources.filter((resource) => savedIds.includes(resource.id));
  const publicHandle = user.handle ? String(user.handle).replace(/^@/, '') : suggestedHandle(user);
  const privateNow = typeof user.private === 'boolean' ? user.private : privateAccount;

  const stat = (label: string, value: React.ReactNode, hint: string, tone = '') => (
    <div className={`social-stat ${tone}`}>
      <b>{value}</b>
      <span>{label}</span>
      <small>{hint}</small>
    </div>
  );

  const weekChart = week.length > 0 && (
    <section className="social-card card">
      <div className="social-card-head">
        <div><p className="label">LAST 7 DAYS</p><h2>This week's rhythm</h2></div>
        <span className="social-card-note">{week.reduce((n: number, day: any) => n + Number(day.attempts || 0), 0)} answers</span>
      </div>
      <div className="week-chart tall" aria-label="Attempts over the last seven days">
        {week.map((day: any, index: number) => (
          <div key={day.date || index} title={`${day.label || day.date}: ${day.attempts || 0} attempts, ${day.xp || 0} XP`}>
            <i style={{ height: `${Math.max(4, Math.round((Number(day.attempts || 0) / maxWeek) * 82))}px` }} />
            <small>{day.label || (day.date ? new Date(`${day.date}T00:00:00`).toLocaleDateString('en', { weekday: 'short' }) : '')}</small>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <>
      <section className="social-profile" aria-label="Your profile">
        <div className="social-cover">
          <span className="social-cover-orb orb-a" aria-hidden />
          <span className="social-cover-orb orb-b" aria-hidden />
          <span className="social-cover-orb orb-c" aria-hidden />
          <div className="social-cover-top">
            <span className="social-cover-badge">◈ {universe}</span>
            <button className="social-settings-button" onClick={openSettings} aria-label="Open profile settings">
              <span aria-hidden>⚙</span> Settings
            </button>
          </div>
          <div className="social-cover-caption">
            <p className="label">LEARNING IDENTITY</p>
            <b>Keep showing up.</b>
          </div>
        </div>

        <div className="social-identity card">
          <div className="social-avatar-wrap">
            <AvatarFace color={avatarColor} accessory={avatarAccessory} size={132} />
            <span className="social-avatar-ring" aria-hidden />
          </div>
          <div className="social-id-copy">
            <div className="social-name-row">
              <h1>{user.name}</h1>
              {privateNow && <span className="social-private-chip" title="Private account">🔒 Private</span>}
              {savedFlash && <span className="social-saved-flash">✓ Saved</span>}
            </div>
            <p className="social-handle">@{publicHandle}</p>
            <p className="social-bio">{user.bio || 'Learning in public, one chapter at a time. Add a bio from Settings.'}</p>
            <p className="social-meta">
              <span>Joined {joinDate}</span><span className="dot">·</span>
              <span>{user.skillLevel || 'beginner'}</span><span className="dot">·</span>
              <span>{user.dailyMinutes || 60} min / day</span>
              {user.targetDate && <><span className="dot">·</span><span>Target {user.targetDate}</span></>}
            </p>
          </div>
          <button className="social-edit-button" onClick={openSettings}>Edit profile</button>
        </div>

        <div className="social-stat-grid">
          {stat('Total XP', dashboard?.xp ?? 0, 'earned across practice', 'violet')}
          {stat('Day streak', dashboard?.streak?.current ?? 0, 'keep it alive today', 'yellow')}
          {stat('Chapters', `${dashboard?.completedTopics ?? 0}`, `of ${dashboard?.totalTopics ?? '—'} in ${universe}`, 'green')}
          {stat('Badges', unlocked.length, `${achievements.length || '—'} available`, 'peach')}
        </div>

        <nav className="profile-tabs" role="tablist" aria-label="Profile sections">
          {PROFILE_TABS.map((item) => (
            <button
              key={item.id}
              role="tab"
              aria-selected={tab === item.id}
              className={tab === item.id ? 'active' : ''}
              onClick={() => setTab(item.id)}
            >
              {item.label}
              {item.id === 'saved' && savedIds.length > 0 && <span className="profile-tab-count">{savedIds.length}</span>}
              {item.id === 'achievements' && unlocked.length > 0 && <span className="profile-tab-count">{unlocked.length}</span>}
            </button>
          ))}
        </nav>

        {tab === 'overview' && (
          <div className="social-panel social-overview">
            <div className="social-overview-main">
              {weekChart || (
                <section className="social-card card">
                  <div className="social-card-head"><div><p className="label">ACTIVITY</p><h2>Your week starts here</h2></div></div>
                  <p className="muted">Answer a few practice questions and this chart will show your rhythm.</p>
                </section>
              )}
              <section className="social-card card">
                <div className="social-card-head">
                  <div><p className="label">RECENT PROOF OF WORK</p><h2>Latest badges</h2></div>
                  <button className="ghost-button" onClick={() => setTab('achievements')}>See all →</button>
                </div>
                {unlocked.length ? (
                  <div className="social-badge-row">
                    {unlocked.slice(0, 4).map((badge) => (
                      <div className="social-badge" key={badge.id}>
                        <span>★</span><b>{badge.title}</b><small>{badge.desc}</small>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="muted">Your first badge is one focused session away. Complete a chapter or keep a streak going.</p>
                )}
              </section>
            </div>
            <aside className="social-overview-side">
              <section className="social-card card">
                <div className="social-card-head"><div><p className="label">STUDY SETUP</p><h2>How you learn</h2></div></div>
                <dl className="social-facts">
                  <div><dt>Universe</dt><dd>{universe}</dd></div>
                  <div><dt>Level</dt><dd>{user.skillLevel || 'beginner'}</dd></div>
                  <div><dt>Daily time</dt><dd>{user.dailyMinutes || 60} minutes</dd></div>
                  <div><dt>Target</dt><dd>{user.targetDate || 'Not set'}</dd></div>
                  <div><dt>Privacy</dt><dd>{privateNow ? 'Private account' : 'Open profile'}</dd></div>
                </dl>
                <button className="secondary-button social-wide-button" onClick={openSettings}>Adjust study setup</button>
              </section>
              <section className="social-card card social-quote-card">
                <p className="label">TODAY'S REMINDER</p>
                <p>“The learner who explains the idea out loud owns it. Close the chapter, then teach it back from memory.”</p>
              </section>
            </aside>
          </div>
        )}

        {tab === 'activity' && (
          <div className="social-panel">
            {weekChart}
            <section className="social-card card">
              <div className="social-card-head">
                <div><p className="label">RECENT WORK</p><h2>Answers & solutions</h2></div>
                <span className="social-card-note">{attempts.length} saved</span>
              </div>
              {attempts.length ? (
                <div className="social-activity-list">
                  {attempts.slice(0, 12).map((attempt) => (
                    <article className="social-activity-row" key={attempt.id}>
                      <span className={`social-result ${attempt.correct ? 'correct' : 'wrong'}`} aria-hidden>{attempt.correct ? '✓' : '!'}</span>
                      <div>
                        <b>{attempt.question || 'Practice question'}</b>
                        <small>{attempt.subject || 'General'} · {attempt.topic || 'Practice'} · {attempt.answeredAt ? new Date(attempt.answeredAt).toLocaleDateString() : ''}</small>
                      </div>
                      <span className={`social-result-label ${attempt.correct ? 'correct' : 'wrong'}`}>{attempt.correct ? 'Correct' : 'Review'}</span>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="social-empty">
                  <span aria-hidden>⌁</span>
                  <b>No answers saved yet.</b>
                  <p>Practice a chapter and every attempt will appear here with its solution.</p>
                </div>
              )}
            </section>
          </div>
        )}

        {tab === 'achievements' && (
          <div className="social-panel">
            <section className="social-card card">
              <div className="social-card-head">
                <div><p className="label">PROOF OF WORK</p><h2>{unlocked.length} of {achievements.length} badges unlocked</h2></div>
              </div>
              <div className="badge-grid">
                {achievements.map((badge) => (
                  <div key={badge.id} className={`badge card ${badge.unlocked ? 'unlocked' : ''}`}>
                    <span className="badge-icon">{badge.unlocked ? '★' : '☆'}</span>
                    <b>{badge.title}</b>
                    <small>{badge.desc}</small>
                    <div className="xp-bar small"><i style={{ width: `${Math.min(100, Math.round((Number(badge.current || 0) / Math.max(1, Number(badge.target || 1))) * 100))}%` }} /></div>
                    <small>{badge.current}/{badge.target}</small>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {tab === 'saved' && (
          <div className="social-panel">
            <section className="social-card card">
              <div className="social-card-head">
                <div><p className="label">YOUR READING LIST</p><h2>{savedResources.length} saved read{savedResources.length === 1 ? '' : 's'}</h2></div>
                <span className="social-card-note">From the Reading Room</span>
              </div>
              {savedResources.length ? (
                <div className="social-saved-list">
                  {savedResources.map((resource: any) => (
                    <article className="social-saved-row" key={resource.id}>
                      <span className="social-saved-kind">{resource.kind || 'read'}</span>
                      <div><b>{resource.title}</b><small>{resource.publisher}</small></div>
                      <button className="ghost-button" onClick={() => toggleSaved(resource.id)} aria-label={`Remove ${resource.title} from saved`}>Remove</button>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="social-empty">
                  <span aria-hidden>❖</span>
                  <b>Your reading list is empty.</b>
                  <p>Open the Reading Room and tap the star on any free article to keep it here.</p>
                </div>
              )}
            </section>
          </div>
        )}
      </section>

      {settingsOpen && (
        <div className="sheet-backdrop" role="presentation" onClick={() => setSettingsOpen(false)}>
          <section
            className="bottom-sheet profile-settings"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-settings-title"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="sheet-grabber" aria-hidden />
            <header className="sheet-head">
              <div><p className="label">PROFILE SETTINGS</p><h2 id="profile-settings-title">Make it yours.</h2></div>
              <button className="sheet-close" onClick={() => setSettingsOpen(false)} aria-label="Close settings">×</button>
            </header>
            <div className="sheet-scroll">
              <div className="settings-grid">
                <label>Display name<input value={name} onChange={(event) => setName(event.target.value)} maxLength={80} placeholder="Aarav Sharma" /></label>
                <label>Handle<div className="handle-input"><span>@</span><input value={handle} onChange={(event) => setHandle(event.target.value)} maxLength={24} placeholder="aarav_learner" autoCapitalize="none" spellCheck={false} /></div></label>
                <label className="settings-wide">Bio<textarea value={bio} onChange={(event) => setBio(event.target.value)} maxLength={160} rows={3} placeholder="What are you learning right now?" /></label>
                <label>Minutes per day<input type="number" min={15} max={240} value={dailyMinutes} onChange={(event) => setDailyMinutes(Number(event.target.value))} /></label>
                <label>Level<select value={skillLevel} onChange={(event) => setSkillLevel(event.target.value)}>{LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}</select></label>
                <label>Target date<input type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} /></label>
              </div>

              <div className="settings-section">
                <div className="settings-section-head"><b>Your avatar</b><small>Tap a colorway, then an accessory.</small></div>
                <div className="avatar-colorway">
                  {AVATAR_COLOR_SWATCHES.map((swatch) => (
                    <button
                      key={swatch.id}
                      className={`avatar-swatch ${avatarColor === swatch.id ? 'active' : ''}`}
                      style={{ background: swatch.fill }}
                      onClick={() => void saveAvatar(swatch.id, avatarAccessory)}
                      aria-pressed={avatarColor === swatch.id}
                      aria-label={`Avatar colorway ${swatch.name}`}
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
                      onClick={() => void saveAvatar(avatarColor, id)}
                      title={label}
                    >
                      <AvatarFace color={avatarColor} accessory={id} size={48} />
                      <small>{label}</small>
                    </button>
                  ))}
                </div>
              </div>

              <div className="settings-toggle-row">
                <div><b>Private account</b><small>Hide your activity from shared community surfaces. Your learning data is always visible to you.</small></div>
                <button
                  className={`settings-toggle ${privateAccount ? 'on' : ''}`}
                  role="switch"
                  aria-checked={privateAccount}
                  onClick={() => setPrivateAccount((value) => !value)}
                ><span /></button>
              </div>

              {settingsError && <p className="error-copy" role="alert">{settingsError}</p>}

              <div className="settings-actions">
                <button className="secondary-button" onClick={() => { setToken(null); onSignOut?.(); }}>Log out</button>
                <button onClick={() => void saveSettings()} disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</button>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

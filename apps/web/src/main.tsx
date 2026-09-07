import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const avatar = { base: 'owl', color: 'yellow', accessory: 'glasses' };
const requestOptions = { credentials: 'include' as const };

function App() {
  const [user, setUser] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [job, setJob] = useState<any>(null);
  const [pkg, setPkg] = useState<any>(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [authRequired, setAuthRequired] = useState(false);

  useEffect(() => {
    Promise.all([fetch(`${API}/api/session`, requestOptions), fetch(`${API}/api/curriculum/gate-cs`)]).then(async ([sessionResponse, curriculumResponse]) => {
      if (sessionResponse.status === 401) { setAuthRequired(true); return; }
      if (!sessionResponse.ok || !curriculumResponse.ok) throw new Error('Unable to load your study plan.');
      setUser((await sessionResponse.json()).user);
      setTopics((await curriculumResponse.json()).topics);
    }).catch((reason: Error) => setError(reason.message));
  }, []);

  async function onboard(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const response = await fetch(`${API}/api/onboarding`, { ...requestOptions, method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, goal: 'gate-cs', avatar }) });
      if (response.status === 401) return setAuthRequired(true);
      if (!response.ok) throw new Error('Unable to create your learning plan.');
      setUser(await response.json());
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to create your learning plan.'); } finally { setBusy(false); }
  }

  async function start(topicId: string) {
    setError('');
    try {
      const response = await fetch(`${API}/api/jobs`, { ...requestOptions, method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ topicId }) });
      if (response.status === 401) return setAuthRequired(true);
      if (!response.ok) throw new Error('Unable to start this topic.');
      const initial = await response.json(); setJob(initial);
      const events = new EventSource(`${API}/api/jobs/${initial.id}/events`, { withCredentials: true });
      events.onmessage = (event) => { const next = JSON.parse(event.data); setJob(next); if (next.status === 'completed') { events.close(); fetch(`${API}/api/content/${next.id}`, requestOptions).then((result) => { if (!result.ok) throw new Error('The verified package could not be loaded.'); return result.json(); }).then(setPkg).catch((reason: Error) => setError(reason.message)); } if (next.status === 'failed') { events.close(); setError(next.message); } };
      events.onerror = () => { events.close(); setError('Live progress disconnected. Please retry this topic.'); };
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to start this topic.'); }
  }

  if (authRequired) return <main className="center"><section className="onboard card"><div className="logo">✦ EduSwarm</div><h1>Build your learning team.</h1><p>Sign in securely to save your goals, jobs, and verified study packages.</p><a className="button" href={`${API}/auth/google`}>Continue with Google</a></section></main>;
  if (error) return <main className="center"><section className="onboard card"><div className="logo">✦ EduSwarm</div><h1>Something went wrong.</h1><p>{error}</p><button onClick={() => window.location.reload()}>Reload study plan</button></section></main>;
  if (!user) return <main className="center"><section className="onboard card"><div className="logo">✦ EduSwarm</div><h1>Loading your learning team…</h1></section></main>;
  if (!user.goals?.length) return <main className="center"><section className="onboard card"><div className="logo">✦ EduSwarm</div><h1>Build your learning team.</h1><p>Tell the Dean your goal. Specialist agents will research, verify, and help you study every day.</p><form onSubmit={onboard}><label>Your name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ada Lovelace" required /></label><label>Choose your first goal<select defaultValue="gate-cs"><option value="gate-cs">Clear GATE CS</option><option value="web-dev">Master Web Development</option><option value="ai-ml">Learn AI/ML</option></select></label><button disabled={busy}>{busy ? 'Setting up…' : 'Start my journey →'}</button></form></section></main>;
  return <main><header><div className="logo">✦ EduSwarm</div><div className="user-chip"><span className="avatar">🦉</span> {user.name}<button className="text-button" onClick={async () => { await fetch(`${API}/auth/logout`, { ...requestOptions, method: 'POST' }); window.location.reload(); }}>Sign out</button></div></header><div className="layout"><aside><p className="eyebrow">MY GOAL</p><div className="goal-card yellow"><b>GATE CS</b><span>Algorithms · {user.goals[0].progress}% complete</span></div><nav><a className="active">◈ Study plan</a><a>▣ Flashcards</a><a>✎ Practice</a><a>♢ Progress</a></nav><div className="streak">🔥 <b>3 day streak</b><small>Keep the rhythm going!</small></div></aside><section className="content"><div className="hero"><div><p className="eyebrow">THE DEAN'S BRIEFING</p><h1>Good morning, {user.name}.</h1><p>Your team picked the next best topic based on prerequisites and your 60-minute daily plan.</p></div><div className="dean">🧠<span>Dean</span></div></div>{job ? <JobCard job={job} pkg={pkg} /> : <><div className="section-head"><h2>Algorithms roadmap</h2><span className="badge">3 TOPICS</span></div><div className="topics">{topics.map((topic, index) => <article className={`topic card ${topic.status}`} key={topic.id}><div className="topic-icon">{index === 0 ? '∿' : index === 1 ? '▦' : '◌'}</div><div><h3>{topic.title}</h3><p>{topic.description}</p><small>{topic.status === 'locked' ? '🔒 Complete the previous topic first' : 'Ready to learn · 25 min'}</small></div><button disabled={topic.status === 'locked'} onClick={() => start(topic.id)}>{topic.status === 'locked' ? 'Locked' : 'Study topic →'}</button></article>)}</div><div className="daily card"><div><p className="eyebrow">PROBLEM OF THE DAY</p><h2>Can you spot the complexity?</h2><p>Warm up with a 5-minute concept challenge.</p></div><span className="new-badge">NEW</span></div></>}</section></div></main>;
}

function JobCard({ job, pkg }: any) { return <section className="job card"><div className="job-head"><div><p className="eyebrow">YOUR LEARNING TEAM</p><h2>{job.status === 'completed' ? 'Your verified package is ready.' : 'The team is working on it…'}</h2><p>{job.message}</p></div><div className="spinner">{job.status === 'completed' ? '✓' : '✦'}</div></div>{job.status !== 'completed' && <div className="progress-track"><div style={{ width: `${Math.min(92, Math.max(8, job.stage === 'Fact-Checker' ? 80 : 40))}%` }} /></div>}{pkg && <div className="package"><div className="verified">✓ FACT-CHECKED · {pkg.verification.claimsChecked} CLAIMS · {pkg.verification.sources.length} SOURCES</div><h2>{pkg.title}</h2>{pkg.notes.sections.map((section: any) => <div className="note" key={section.heading}><h3>{section.heading}</h3><p>{section.body}</p></div>)}<div className="columns"><div><h3>Flashcards ({pkg.flashcards.length})</h3>{pkg.flashcards.map((flashcard: any) => <div className="mini-card" key={flashcard.question}><b>{flashcard.question}</b><span>{flashcard.answer}</span></div>)}</div><div><h3>Practice quiz</h3><div className="quiz"><b>{pkg.quiz[0].question}</b>{pkg.quiz[0].options.map((option: string) => <label key={option}><input type="radio" name="q" /> {option}</label>)}</div></div></div></div>}</section>; }

createRoot(document.getElementById('root')!).render(<App />);

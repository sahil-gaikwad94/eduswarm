import React, { useCallback, useEffect, useState } from 'react';
import { API, apiGet, apiPost, setToken, type Agent, type Page, type Pack, type Topic } from './lib/api';
import { AgentChat, Avatar, Brand, Nav, Onboarding, SearchPalette } from './components/ui';
import { Dashboard, Plan, Syllabus } from './pages/home';
import { Flashcards, Lesson, Practice } from './pages/learn';
import { CodeLab, Mocks, Quiz } from './pages/drills';
import { Agents, Mistakes, Profile, Progress } from './pages/insight';
import { Rooms } from './pages/connect';
import { Interview } from './pages/interview';

function stored(key: string, fallback: string): string {
  try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
}

export function App() {
  const [user, setUser] = useState<any>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [goal, setGoal] = useState(stored('eduswarm.goal', 'gate-cs'));
  const [page, setPageState] = useState<Page>((stored('eduswarm.page', 'dashboard') as Page) || 'dashboard');
  const [selected, setSelected] = useState<Topic | null>(null);
  const [pack, setPack] = useState<Pack | null>(null);
  const [job, setJob] = useState<any>(null);
  const [error, setError] = useState('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentSession, setAgentSession] = useState<any>(null);
  const [progress, setProgress] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [palette, setPalette] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);

  const setPage = (next: Page) => {
    try { localStorage.setItem('eduswarm.page', next); } catch { /* private mode */ }
    setPageState(next);
  };

  const load = useCallback(async () => {
    // Exchange a one-time login code (OAuth redirect) for a Bearer token first.
    const params = new URLSearchParams(window.location.search);
    const loginCode = params.get('loginCode');
    if (loginCode) {
      params.delete('loginCode');
      const clean = `${window.location.pathname}${params.toString() ? `?${params}` : ''}${window.location.hash}`;
      window.history.replaceState(null, '', clean);
      try {
        const data = await apiPost('/api/auth/exchange', { code: loginCode });
        setToken(data.token);
      } catch {
        setNeedsLogin(true);
        return;
      }
    }
    let session: any;
    try {
      session = await apiGet('/api/session');
    } catch (e: any) {
      if (e?.status === 401 || String(e.message || '').includes('401')) {
        // Never loop: redirect to Google at most once per tab session, then
        // show a login screen with an explicit button.
        try {
          if (!sessionStorage.getItem('eduswarm.auth.redirected')) {
            sessionStorage.setItem('eduswarm.auth.redirected', '1');
            window.location.assign(`${API}/auth/google`);
            return;
          }
        } catch { /* private mode */ }
        setToken(null);
        setNeedsLogin(true);
        return;
      }
      throw new Error('EduSwarm services are waking up or unavailable. Please wait a few seconds and try again.');
    }
    try { sessionStorage.removeItem('eduswarm.auth.redirected'); } catch { /* private mode */ }
    setNeedsLogin(false);
    setUser(session.user);
    const results = await Promise.allSettled([
      apiGet(`/api/curriculum/${goal}`),
      apiGet('/api/learning/content'),
      apiGet('/api/agents'),
      apiGet(`/api/dashboard?goal=${encodeURIComponent(goal)}`),
      apiGet(`/api/study-plan?goal=${encodeURIComponent(goal)}`),
    ]);
    const curriculum = results[0].status === 'fulfilled' ? results[0].value : null;
    const learning = results[1].status === 'fulfilled' ? results[1].value : {};
    const agentData = results[2].status === 'fulfilled' ? results[2].value : null;
    if (!curriculum?.topics?.length) throw new Error('The syllabus service is still waking up. Please try again in a few seconds.');
    const savedProgress = learning.progress || [];
    setProgress(savedProgress);
    setTopics(curriculum.topics.map((t: any) => ({
      ...t, status: savedProgress.some((p: any) => p.topicId === t.id && p.completed) ? 'complete' : 'available',
    })));
    setAgents(agentData?.agents || []);
    if (results[3].status === 'fulfilled') setDashboard(results[3].value);
    if (results[4].status === 'fulfilled') setPlan(results[4].value);
    const savedTopic = stored('eduswarm.topic', '');
    if (savedTopic) {
      const restored = curriculum.topics.find((t: any) => t.id === savedTopic);
      if (restored) {
        setSelected((prev) => prev || restored);
        const saved = learning.content?.find((x: any) => x.topicId === savedTopic);
        if (saved) setPack((prev) => prev || saved.package);
      }
    }
  }, [goal]);

  useEffect(() => {
    try { localStorage.setItem('eduswarm.goal', goal); } catch { /* private mode */ }
    load().catch((e) => setError(e.message));
  }, [goal, load]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setPalette(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const choose = (t: Topic) => {
    try { localStorage.setItem('eduswarm.topic', t.id); } catch { /* private mode */ }
    setSelected(t); setPack(null); setJob(null); setError(''); setPage('lesson');
    apiGet(`/api/learning/content/${t.id}`).then((p) => setPack(p)).catch(() => {});
  };

  const navigate = (next: Page, topicId?: string) => {
    if (topicId) {
      const found = topics.find((t) => t.id === topicId);
      if (found && next === 'lesson') { choose(found); return; }
      if (found) setSelected(found);
    }
    setPage(next);
  };

  async function start(t: Topic, depth = 'standard') {
    setSelected(t); setPage('lesson'); setError(''); setPack(null);
    setJob({ status: 'queued', stage: 'Dean', message: 'The learning team is starting…' });
    let j: any;
    try {
      j = await apiPost('/api/jobs', { topicId: t.id, depth });
    } catch (e: any) { setJob(null); setError(e?.message || 'Unable to start this tutorial.'); return; }
    setJob(j);
    const es = new EventSource(`${API}/api/jobs/${j.id}/events`, { withCredentials: true } as any);
    es.onmessage = async (e) => {
      const nextState = JSON.parse(e.data);
      setJob(nextState);
      if (nextState.status === 'completed') {
        es.close();
        try {
          setPack(await apiGet(`/api/content/${j.id}`));
        } catch { /* job view keeps polling state */ }
        setJob(null);
        await load().catch(() => {});
      }
      if (nextState.status === 'failed') { es.close(); setJob(null); setError(nextState.message || 'The learning team could not complete this topic.'); }
    };
    es.onerror = () => {
      es.close();
      let checks = 0;
      const recover = async () => {
        checks += 1;
        const nextState = await apiGet(`/api/jobs/${j.id}`).catch(() => null);
        if (nextState?.status === 'completed' && nextState.package) {
          setPack(await apiGet(`/api/content/${j.id}`).catch(() => null));
          setJob(null);
          await load().catch(() => {});
          return;
        }
        if (nextState?.status === 'failed') { setJob(null); setError(nextState.message || 'The learning team could not complete this topic.'); return; }
        if (checks < 900) { setJob(nextState || j); window.setTimeout(recover, 1000); }
        else { setJob(nextState || j); setError('This study kit is taking longer than usual. Keep this lesson open or return later — the job is still saved and will continue safely.'); }
      };
      void recover();
    };
  }

  const openAgent = async (a: Agent) => {
    try {
      setError('');
      setAgentSession(await apiPost(`/api/agents/${a.id}/sessions`, { topicId: selected?.id }));
    } catch (e: any) { setError(e?.message || 'Unable to start this specialist session.'); }
  };

  const completeTopic = async (t: Topic) => {
    try {
      await apiPost('/api/learning/progress', { topicId: t.id, completed: true });
      setProgress((prev) => {
        const rest = prev.filter((p: any) => p.topicId !== t.id);
        return [...rest, { topicId: t.id, completed: true }];
      });
      setTopics((prev) => prev.map((x) => (x.id === t.id ? { ...x, status: 'complete' } : x)));
      const data = await apiGet(`/api/dashboard?goal=${encodeURIComponent(goal)}`).catch(() => null);
      if (data) setDashboard(data);
    } catch (e: any) { setError(e?.message || 'Could not mark this topic complete.'); }
  };

  const signIn = () => {
    try { sessionStorage.removeItem('eduswarm.auth.redirected'); } catch { /* private mode */ }
    window.location.assign(`${API}/auth/google`);
  };

  if (needsLogin) {
    return (
      <main className="center">
        <section className="onboard card">
          <Brand />
          <h1>Sign in to EduSwarm.</h1>
          <p>Your progress, rooms, and interviews live in your account. Sign in once — this browser will remember you for 30 days.</p>
          <button onClick={signIn}>Continue with Google →</button>
          <p className="muted">Seeing this repeatedly? Your browser may be blocking third-party cookies — signing in here issues a direct token instead, no cookies required.</p>
        </section>
      </main>
    );
  }
  if (error) {
    return (
      <main className="center">
        <section className="onboard card">
          <Brand />
          <h1>Let's get you back on track.</h1>
          <p className="error-copy">{error}</p>
          <button onClick={() => { setError(''); load(); }}>Try again</button>
        </section>
      </main>
    );
  }
  if (!user || !topics.length) {
    return (
      <main className="center">
        <section className="onboard card">
          <Brand />
          <h1>Loading your learning universe…</h1>
          <p>Preparing your syllabus and agent workspace.</p>
        </section>
      </main>
    );
  }
  if (!user.goals?.length) return <Onboarding user={user} onDone={(updated) => { setUser(updated); void load(); }} />;

  const completed = progress.filter((p) => p.completed).length;
  const streak = dashboard?.streak?.current || 0;
  const masteryMap = new Map<string, number>((dashboard?.topicMastery || []).map((m: any) => [m.topicId, m.score]));

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand-button" onClick={() => setPage('dashboard')}><Brand /></button>
        <div className="header-actions">
          <button className="search-trigger" onClick={() => setPalette(true)} title="Search (Ctrl+K)">⌕ Search</button>
          <span className="streak-pill">✦ {streak ? `${streak} day streak` : 'Start your streak'}</span>
          <button className="profile-chip" onClick={() => setPage('profile')}>
            <span className="initial-avatar">{user.name?.[0] || 'S'}</span>
            <span>{user.name}</span>
          </button>
        </div>
      </header>
      <div className="workspace">
        <aside className="sidebar">
          <div className="goal-summary">
            <p className="label">ACTIVE LEARNING UNIVERSE</p>
            <select
              className="track-select"
              value={goal}
              onChange={(e) => {
                const next = e.target.value;
                try { localStorage.removeItem('eduswarm.topic'); } catch { /* private mode */ }
                setGoal(next); setSelected(null); setPack(null); setJob(null); setDashboard(null); setPlan(null); setPage('dashboard');
              }}
            >
              <option value="gate-cs">GATE CSE · Complete</option>
              <option value="web-dev">Full-stack · Everything</option>
              <option value="ai-ml">AI / ML · Everything</option>
            </select>
            <span>{topics.length} tutorials · {completed} completed</span>
            <div className="goal-progress"><i style={{ width: `${Math.round((completed / topics.length) * 100)}%` }} /></div>
          </div>
          <nav className="side-nav">
            <Nav active={page === 'dashboard'} icon="⌂" label="Overview" onClick={() => setPage('dashboard')} />
            <Nav active={page === 'plan'} icon="◈" label="Study plan" onClick={() => setPage('plan')} />
            <Nav active={page === 'syllabus'} icon="▦" label="Full syllabus" onClick={() => setPage('syllabus')} />
            <Nav active={page === 'lesson'} icon="◉" label="Current lesson" onClick={() => setPage('lesson')} />
            <Nav active={page === 'quiz'} icon="✓" label="PYQ quiz" onClick={() => setPage('quiz')} />
            <Nav active={page === 'mocks'} icon="◷" label="Mock exams" onClick={() => setPage('mocks')} />
            <Nav active={page === 'codelab'} icon="</>" label="Code lab" onClick={() => setPage('codelab')} />
            <Nav active={page === 'flashcards'} icon="▤" label="Flashcards" onClick={() => setPage('flashcards')} />
            <Nav active={page === 'agents'} icon="✦" label="Agent team" onClick={() => setPage('agents')} />
            <Nav active={page === 'rooms'} icon="◍" label="Study rooms" onClick={() => setPage('rooms')} />
            <Nav active={page === 'interview'} icon="◐" label="Interviews" onClick={() => setPage('interview')} />
            <Nav active={page === 'progress'} icon="↗" label="Progress" onClick={() => setPage('progress')} />
            <Nav active={page === 'mistakes'} icon="!" label="Mistake notebook" onClick={() => setPage('mistakes')} />
          </nav>
          <div className="team-mini">
            <p className="label">YOUR TEAM</p>
            <div><Avatar /><span><b>The Dean</b><small>Curriculum guide</small></span></div>
            <div><Avatar /><span><b>Fact-checker</b><small>Evidence guard</small></span></div>
          </div>
        </aside>
        <main className="main-content">
          {page === 'dashboard' && <Dashboard user={user} goal={goal} data={dashboard} plan={plan} onNavigate={navigate} />}
          {page === 'plan' && <Plan topics={topics} onOpen={choose} />}
          {page === 'syllabus' && <Syllabus topics={topics} mastery={masteryMap} onOpen={choose} />}
          {page === 'lesson' && (
            <Lesson topic={selected || topics[0]} pack={pack} job={job} topics={topics}
              isComplete={progress.some((p: any) => p.topicId === (selected || topics[0]).id && p.completed)}
              onStart={start} onBack={() => setPage('plan')} onCards={() => setPage('flashcards')} onPractice={() => setPage('practice')}
              onOpen={choose} onComplete={completeTopic} onNavigate={navigate} />
          )}
          {page === 'flashcards' && <Flashcards onLesson={() => setPage('lesson')} onProgress={() => void load()} />}
          {page === 'practice' && <Practice pack={pack} topic={selected || topics[0]} onLesson={() => setPage('lesson')} onProgress={() => void load()} />}
          {page === 'quiz' && <Quiz course={goal} topicId={selected?.id || topics[0]?.id} />}
          {page === 'mocks' && <Mocks course={goal} />}
          {page === 'codelab' && <CodeLab />}
          {page === 'agents' && <Agents agents={agents} onOpen={openAgent} />}
          {page === 'rooms' && <Rooms user={user} goal={goal} topic={selected || topics[0] || null} onNavigate={navigate} />}
          {page === 'interview' && <Interview onNavigate={navigate} />}
          {page === 'progress' && <Progress topics={topics} progress={progress} />}
          {page === 'mistakes' && <Mistakes />}
          {page === 'profile' && <Profile user={user} onSave={setUser} />}
        </main>
      </div>
      {agentSession && <AgentChat session={agentSession} onClose={() => setAgentSession(null)} onUpdate={setAgentSession} />}
      {palette && <SearchPalette goal={goal} onClose={() => setPalette(false)} onNavigate={navigate} />}
      <nav className="mobile-nav">
        <Nav active={page === 'dashboard'} icon="⌂" label="Home" onClick={() => setPage('dashboard')} />
        <Nav active={page === 'quiz'} icon="✓" label="Quiz" onClick={() => setPage('quiz')} />
        <Nav active={page === 'mocks'} icon="◷" label="Mocks" onClick={() => setPage('mocks')} />
        <Nav active={page === 'codelab'} icon="</>" label="Code" onClick={() => setPage('codelab')} />
        <Nav active={page === 'agents'} icon="✦" label="Agents" onClick={() => setPage('agents')} />
        <Nav active={page === 'rooms'} icon="◍" label="Rooms" onClick={() => setPage('rooms')} />
        <Nav active={page === 'interview'} icon="◐" label="Mock HR" onClick={() => setPage('interview')} />
      </nav>
    </div>
  );
}

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { API, apiGet, apiPatch, apiPost, getToken, setToken, type Agent, type Page, type Pack, type Topic } from './lib/api';
import { AgentChat, Avatar, Brand, LoadingScreen, Nav, Onboarding, SearchPalette } from './components/ui';
import { Landing } from './pages/landing';
import { Home, Plan } from './pages/home';
import { Flashcards, Lesson, Practice } from './pages/learn';
import { CodeLab, Mocks, Quiz } from './pages/drills';
import { Agents, Mistakes, Profile, Progress } from './pages/insight';
import { Library } from './pages/library';
import { Interview } from './pages/interview';

export const UNIVERSES = [
  { id: 'gate-cs', title: 'GATE CSE', short: 'GATE CSE', blurb: 'PYQ-first exam preparation across all 12 GATE CS subjects.' },
  { id: 'web-dev', title: 'Full-stack Engineering', short: 'Full-stack', blurb: 'From HTML and TypeScript to system design and production.' },
  { id: 'ai-ml', title: 'AI / ML Engineering', short: 'AI / ML', blurb: 'Math, classical ML, deep learning, LLM apps, and MLOps.' },
];

function stored(key: string, fallback: string): string {
  try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
}
function remember(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch { /* private mode */ }
}

const REDIRECT_KEY = 'eduswarm.auth.attemptedAt';

/** Design-review flag: /?previewLanding shows the landing page in demo mode. */
const previewLanding = typeof window !== 'undefined'
  && new URLSearchParams(window.location.search).has('previewLanding');

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
  const [agentStatus, setAgentStatus] = useState<any>(null);
  const [agentSession, setAgentSession] = useState<any>(null);
  const [progress, setProgress] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [palette, setPalette] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [jobError, setJobError] = useState('');
  const loadedFor = useRef<string>('');
  const loadingRef = useRef(false);

  const setPage = (next: Page) => { remember('eduswarm.page', next); setPageState(next); };

  /** Phase 2 — hydrate everything that isn't needed to render the universe. */
  const hydrate = useCallback(async (serverGoal: string, topicsList: any[]) => {
    const results = await Promise.allSettled([
      apiGet('/api/learning/content'),
      apiGet('/api/agents'),
      apiGet(`/api/dashboard?goal=${encodeURIComponent(serverGoal)}`),
      apiGet(`/api/study-plan?goal=${encodeURIComponent(serverGoal)}`),
      apiGet('/api/agents/status'),
    ]);
    const learning = results[0].status === 'fulfilled' ? results[0].value : { content: [], progress: [] };
    const savedProgress = learning.progress || [];
    setProgress(savedProgress);
    setTopics(topicsList.map((t: any) => ({
      ...t, status: savedProgress.some((p: any) => p.topicId === t.id && p.completed) ? 'complete' : 'available',
    })));
    if (results[1].status === 'fulfilled') setAgents(results[1].value?.agents || []);
    if (results[2].status === 'fulfilled') setDashboard(results[2].value);
    if (results[3].status === 'fulfilled') setPlan(results[3].value);
    if (results[4].status === 'fulfilled') setAgentStatus(results[4].value);

    const savedTopic = stored('eduswarm.topic', '');
    if (savedTopic) {
      const restored = topicsList.find((t: any) => t.id === savedTopic);
      if (restored) {
        setSelected((prev) => prev || restored);
        const saved = (learning.content || []).find((x: any) => x.topicId === savedTopic);
        if (saved) setPack((prev) => prev || saved.package);
      }
    }
  }, []);

  /** Light refresh after a lesson completes — no full reload, no loader flash. */
  const softRefresh = useCallback(async (activeGoal: string) => {
    const [learning, dash] = await Promise.allSettled([
      apiGet('/api/learning/content'),
      apiGet(`/api/dashboard?goal=${encodeURIComponent(activeGoal)}`),
    ]);
    if (learning.status === 'fulfilled') {
      const savedProgress = learning.value.progress || [];
      setProgress(savedProgress);
      setTopics((prev) => prev.map((t) => ({
        ...t, status: savedProgress.some((p: any) => p.topicId === t.id && p.completed) ? 'complete' : 'available',
      })));
    }
    if (dash.status === 'fulfilled') setDashboard(dash.value);
  }, []);

  const load = useCallback(async (activeGoal: string) => {
    // 1. A Google sign-in lands here with a single-use code. Exchange it for a
    //    Bearer token — cookies are blocked as third-party on Safari/Firefox,
    //    which is what used to bounce new phones back to Google forever.
    const params = new URLSearchParams(window.location.search);
    const loginCode = params.get('loginCode');
    if (loginCode) {
      params.delete('loginCode');
      const clean = `${window.location.pathname}${params.toString() ? `?${params}` : ''}${window.location.hash}`;
      window.history.replaceState(null, '', clean);
      try {
        const data = await apiPost('/api/auth/exchange', { code: loginCode });
        setToken(data.token);
      } catch (e: any) {
        setToken(null);
        setNeedsLogin(true);
        setError(e?.message || 'That sign-in link expired. Please sign in again.');
        return;
      }
    }

    let session: any;
    try {
      session = await apiGet('/api/session');
    } catch (e: any) {
      const unauthorized = e?.status === 401 || String(e.message || '').includes('401');
      if (unauthorized) {
        setToken(null);
        // Let the public landing page be the first touchpoint. The explicit
        // CTA starts OAuth, avoiding an unexpected redirect for new visitors.
        setNeedsLogin(true);
        return;
      }
      throw new Error('EduSwarm services are waking up or unavailable. Please wait a few seconds and try again.');
    }
    remember(REDIRECT_KEY, null);
    setNeedsLogin(false);
    setUser(session.user);

    const serverGoal = String(session.user?.activeGoal || activeGoal || 'gate-cs');
    loadedFor.current = serverGoal;
    if (serverGoal !== activeGoal) {
      setGoal(serverGoal);
      remember('eduswarm.goal', serverGoal);
    }

    // 2. Two-phase load. Phase 1 fetches only the syllabus so the universe
    //    renders in under two seconds; everything else streams in behind it.
    const curriculum = await apiGet(`/api/curriculum/${serverGoal}`).catch(() => null);
    if (!curriculum?.topics?.length) throw new Error('The syllabus service is still waking up. Please try again in a few seconds.');
    setTopics(curriculum.topics);

    void hydrate(serverGoal, curriculum.topics);
  }, [hydrate]);

  useEffect(() => {
    remember('eduswarm.goal', goal);
    if (loadedFor.current === goal || loadingRef.current) return;
    loadingRef.current = true;
    load(goal)
      .catch((e) => setError(e.message))
      .finally(() => { loadingRef.current = false; });
  }, [goal, load]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setPalette(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /** Switch learning universe: instant locally, persisted on the account. */
  const switchUniverse = async (next: string) => {
    if (next === goal || switching) return;
    setSwitching(true);
    remember('eduswarm.topic', null);
    remember('eduswarm.goal', next);
    setGoal(next);
    setSelected(null); setPack(null); setJob(null); setDashboard(null); setPlan(null);
    setPage('dashboard');
    try {
      setUser(await apiPatch('/api/me', { activeGoal: next }));
    } catch { /* the local switch still works; it just will not persist */ }
    setSwitching(false);
  };

  const choose = (t: Topic) => {
    remember('eduswarm.topic', t.id);
    setSelected(t); setPack(null); setJob(null); setError(''); setJobError(''); setPage('lesson');
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

  async function start(t: Topic, depth = 'standard', regenerate = false) {
    setSelected(t); setPage('lesson'); setError(''); setJobError(''); setPack(null);
    setJob({
      status: 'queued', stage: 'Dean',
      message: regenerate ? 'The team is re-researching this topic…' : 'The learning team is starting…',
    });
    let j: any;
    try {
      j = await apiPost('/api/jobs', { topicId: t.id, depth, regenerate });
    } catch (e: any) { setJob(null); setJobError(e?.message || 'Unable to start this tutorial.'); return; }
    setJob(j);
    // EventSource cannot send headers, so the token rides along as a parameter.
    const token = getToken();
    const streamUrl = `${API}/api/jobs/${j.id}/events${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    const es = new EventSource(streamUrl, { withCredentials: true } as any);
    es.onmessage = async (e) => {
      const nextState = JSON.parse(e.data);
      setJob(nextState);
      if (nextState.status === 'completed') {
        es.close();
        try { setPack(await apiGet(`/api/content/${j.id}`)); } catch { /* job view keeps polling state */ }
        setJob(null);
        await softRefresh(goal).catch(() => {});
      }
      if (nextState.status === 'failed') {
        es.close(); setJob(null);
        setJobError(nextState.message || 'The learning team could not complete this topic.');
        void softRefresh(goal).catch(() => {});
      }
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
          await softRefresh(goal).catch(() => {});
          return;
        }
        if (nextState?.status === 'failed') {
          setJob(null);
          setJobError(nextState.message || 'The learning team could not complete this topic.');
          void softRefresh(goal).catch(() => {});
          return;
        }
        if (checks < 900) { setJob(nextState || j); window.setTimeout(recover, 1000); }
        else { setJob(nextState || j); setJobError('This study kit is taking longer than usual. Keep this lesson open or return later — the job is still saved and will continue safely.'); }
      };
      void recover();
    };
  }

  const openAgent = async (a: Agent) => {
    try {
      setError('');
      setAgentSession(await apiPost(`/api/agents/${a.id}/sessions`, { topicId: selected?.id, goal }));
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
    remember(REDIRECT_KEY, String(Date.now()));
    window.location.assign(`${API}/auth/google`);
  };

  if (needsLogin || previewLanding) {
    return <Landing error={error} onSignIn={() => {
      if (previewLanding) {
        const url = new URL(window.location.href);
        url.searchParams.delete('previewLanding');
        window.location.replace(url.toString());
        return;
      }
      signIn();
    }} />;
  }
  if (error) {
    return (
      <main className="center">
        <section className="onboard card">
          <Brand />
          <h1>Let's get you back on track.</h1>
          <p className="error-copy">{error}</p>
          <button onClick={() => { setError(''); void load(goal); }}>Try again</button>
        </section>
      </main>
    );
  }
  if (!user || !topics.length) {
    return <LoadingScreen />;
  }
  if (!user.goals?.length) return <Onboarding user={user} onDone={(updated) => { setUser(updated); void load(goal); }} />;

  const completed = progress.filter((p) => p.completed).length;
  const streak = dashboard?.streak?.current || 0;
  const masteryMap = new Map<string, number>((dashboard?.topicMastery || []).map((m: any) => [m.topicId, m.score]));
  const activeUniverse = UNIVERSES.find((u) => u.id === goal) || UNIVERSES[0];

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
              onChange={(e) => void switchUniverse(e.target.value)}
            >
              {UNIVERSES.map((u) => <option key={u.id} value={u.id}>{u.title}</option>)}
            </select>
            <span>{topics.length} tutorials · {completed} completed</span>
            <div className="goal-progress"><i style={{ width: `${topics.length ? Math.round((completed / topics.length) * 100) : 0}%` }} /></div>
          </div>
          <nav className="side-nav">
            <Nav active={page === 'dashboard'} icon="⌂" label="Home" onClick={() => setPage('dashboard')} />
            <Nav active={page === 'lesson'} icon="◉" label="Current lesson" onClick={() => setPage('lesson')} />
            <Nav active={page === 'plan'} icon="◈" label="Today's mission" onClick={() => setPage('plan')} />
            <Nav active={page === 'quiz'} icon="✓" label="PYQ quiz" onClick={() => setPage('quiz')} />
            <Nav active={page === 'mocks'} icon="◷" label="Mock exams" onClick={() => setPage('mocks')} />
            <Nav active={page === 'codelab'} icon="</>" label="Code lab" onClick={() => setPage('codelab')} />
            <Nav active={page === 'flashcards'} icon="▤" label="Flashcards" onClick={() => setPage('flashcards')} />
            <Nav active={page === 'agents'} icon="✦" label="Agent team" onClick={() => setPage('agents')} />
            <Nav active={page === 'library'} icon="❖" label="Reading Room" onClick={() => setPage('library')} />
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
          {page === 'dashboard' && (
            <Home
              user={user} goal={goal} universe={activeUniverse} universes={UNIVERSES} topics={topics}
              mastery={masteryMap} progress={progress} dashboard={dashboard} switching={switching}
              onSwitch={switchUniverse} onOpen={choose} onNavigate={navigate}
            />
          )}
          {page === 'plan' && <Plan user={user} goal={goal} topics={topics} data={dashboard} plan={plan} onOpen={choose} onNavigate={navigate} />}
          {page === 'lesson' && (
            <Lesson topic={selected || topics[0]} pack={pack} job={job} jobError={jobError} topics={topics}
              isComplete={progress.some((p: any) => p.topicId === (selected || topics[0]).id && p.completed)}
              onStart={start} onBack={() => setPage('plan')} onCards={() => setPage('flashcards')} onPractice={() => setPage('practice')}
              onOpen={choose} onComplete={completeTopic} onNavigate={navigate} />
          )}
          {page === 'flashcards' && <Flashcards onLesson={() => setPage('lesson')} onProgress={() => void softRefresh(goal)} />}
          {page === 'practice' && <Practice pack={pack} topic={selected || topics[0]} onLesson={() => setPage('lesson')} onProgress={() => void softRefresh(goal)} />}
          {page === 'quiz' && <Quiz course={goal} topicId={selected?.id || topics[0]?.id} />}
          {page === 'mocks' && <Mocks course={goal} />}
          {page === 'codelab' && <CodeLab />}
          {page === 'agents' && <Agents agents={agents} status={agentStatus} onOpen={openAgent} />}
          {page === 'library' && <Library goal={goal} universeTitle={activeUniverse.title} onNavigate={navigate} />}
          {page === 'interview' && <Interview onNavigate={navigate} />}
          {page === 'progress' && <Progress topics={topics} progress={progress} />}
          {page === 'mistakes' && <Mistakes />}
          {page === 'profile' && <Profile user={user} goal={goal} onSave={setUser} onSwitch={switchUniverse} />}
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
        <Nav active={page === 'library'} icon="❖" label="Reading" onClick={() => setPage('library')} />
        <Nav active={page === 'interview'} icon="◐" label="Mock HR" onClick={() => setPage('interview')} />
      </nav>
    </div>
  );
}

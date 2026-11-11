import React, { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost, type Topic } from '../lib/api';
import { Empty } from '../components/ui';
import { Diamond } from '../components/Icon';
import { Icon } from '../components/Icon';

type Comment = { id: string; authorId: string; authorName: string; body: string; createdAt: string };
type Post = {
  id: string; kind: 'doubt' | 'thought' | 'shared-kit';
  authorId: string; authorName: string; authorStreak?: number;
  title: string; body: string; topicId?: string; topicTitle?: string; questionId?: string;
  upvotes: number; upvotedByMe?: boolean; commentCount: number; comments: Comment[];
  isResolved: boolean; seeded?: boolean; createdAt: string;
};

const KIND_TABS = [
  { id: 'all', label: 'All' },
  { id: 'doubt', label: 'Doubts' },
  { id: 'thought', label: 'Thoughts' },
  { id: 'shared-kit', label: 'Shared kits' },
] as const;

const AVATAR_HUES = [262, 16, 90, 200, 330, 48, 150, 285];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function avatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return `hsl(${AVATAR_HUES[hash % AVATAR_HUES.length]} 62% 52%)`;
}

function AvatarDot({ name, seed }: { name: string; seed: string }) {
  return <span className="disc-avatar" style={{ background: avatarColor(seed) }} aria-hidden>{(name?.trim()?.[0] || '?').toUpperCase()}</span>;
}

export function Discussions({ topics, isGuest, onRequestSignIn, userId }: {
  topics: Topic[];
  isGuest: boolean;
  userId?: string | null;
  onRequestSignIn: () => void;
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [kind, setKind] = useState<typeof KIND_TABS[number]['id']>('all');
  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [composer, setComposer] = useState({ kind: 'doubt' as Post['kind'], title: '', body: '', topicId: '' });
  const [posting, setPosting] = useState(false);
  const [notice, setNotice] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams();
      if (kind !== 'all') params.set('kind', kind);
      if (topicFilter) params.set('topicId', topicFilter);
      if (search.trim()) params.set('search', search.trim());
      params.set('limit', '40');
      const data = await apiGet(`/api/discussions?${params}`);
      setPosts(data.discussions || []);
    } catch (e: any) {
      setError(e?.message || 'The community feed could not load. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [kind, topicFilter]);
  useEffect(() => { const t = window.setTimeout(() => void load(), 350); return () => window.clearTimeout(t); }, [search]);

  const topicOptions = useMemo(() => [...topics].sort((a, b) => a.module.localeCompare(b.module) || a.title.localeCompare(b.title)), [topics]);
  const topTopics = useMemo(() => {
    const counts = new Map<string, { title: string; count: number; id: string }>();
    for (const post of posts) {
      const id = post.topicId || 'general';
      const title = post.topicTitle || post.topicId || 'General';
      const entry = counts.get(id) || { title, count: 0, id };
      entry.count += 1;
      counts.set(id, entry);
    }
    return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 8);
  }, [posts]);

  const upvote = async (post: Post) => {
    if (isGuest) { onRequestSignIn(); return; }
    const delta = post.upvotedByMe ? -1 : 1;
    setPosts((items) => items.map((item) => item.id === post.id ? { ...item, upvotedByMe: !item.upvotedByMe, upvotes: item.upvotes + delta } : item));
    try {
      const result = await apiPost(`/api/discussions/${post.id}/upvote`, {});
      setPosts((items) => items.map((item) => item.id === post.id ? { ...item, upvotedByMe: result.upvoted, upvotes: result.upvotes } : item));
    } catch { /* optimistic state stands; next load reconciles */ }
  };

  const addComment = async (post: Post) => {
    if (isGuest) { onRequestSignIn(); return; }
    const body = commentDraft.trim();
    if (body.length < 2) return;
    try {
      const updated: Post = await apiPost(`/api/discussions/${post.id}/comments`, { body });
      setPosts((items) => items.map((item) => item.id === post.id ? updated : item));
      setCommentDraft('');
    } catch (e: any) { setNotice(e?.message || 'Could not post your reply.'); }
  };

  const toggleResolve = async (post: Post) => {
    if (isGuest) { onRequestSignIn(); return; }
    try {
      const updated: Post = await apiPost(`/api/discussions/${post.id}/resolve`, {});
      setPosts((items) => items.map((item) => item.id === post.id ? updated : item));
    } catch (e: any) { setNotice(e?.message || 'Only the author can resolve a doubt.'); }
  };

  const submitPost = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isGuest) { onRequestSignIn(); return; }
    const title = composer.title.trim();
    const body = composer.body.trim();
    if (title.length < 3 || body.length < 3) { setNotice('Give it a title and a little more detail.'); return; }
    setPosting(true); setNotice('');
    try {
      const created: Post = await apiPost('/api/discussions', {
        kind: composer.kind, title, body,
        topicId: composer.topicId || undefined,
      });
      setPosts((items) => [created, ...items]);
      setComposer({ kind: 'doubt', title: '', body: '', topicId: '' });
    } catch (e: any) {
      setNotice(e?.message || 'Could not publish — please retry.');
    } finally { setPosting(false); }
  };

  return (
    <>
      <div className="compact-heading">
        <div>
          <p className="eyebrow">COMMUNITY · HIGH-SIGNAL ONLY</p>
          <h1>Discuss together.</h1>
          <p className="lead">Doubts anchored to the exact tutorial or question — answered by learners who just mastered it and by the Dean. No noise, no 5,000-member scroll.</p>
        </div>
      </div>

      {isGuest ? (
        <section className="guest-banner card" role="status">
          <Diamond size={20} className="banner-diamond" />
          <div><b>You are browsing as a guest.</b><small>Reading is free forever — sign in to ask, answer, upvote, and build your streak.</small></div>
          <button onClick={onRequestSignIn}>Sign in →</button>
        </section>
      ) : (
        <form className="disc-composer card" onSubmit={submitPost}>
          <div className="disc-composer-top">
            <div className="disc-kind-picker" role="radiogroup" aria-label="Post type">
              {(['doubt', 'thought'] as const).map((k) => (
                <button key={k} type="button" role="radio" aria-checked={composer.kind === k} className={composer.kind === k ? 'active' : ''} onClick={() => setComposer({ ...composer, kind: k })}>
                  {k === 'doubt' ? 'Help — I’m stuck' : 'Thinking out loud'}
                </button>
              ))}
            </div>
            <select value={composer.topicId} onChange={(e) => setComposer({ ...composer, topicId: e.target.value })} aria-label="Anchor to a topic (optional)">
              <option value="">Anchor to a topic (optional)</option>
              {topicOptions.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
          <input value={composer.title} onChange={(e) => setComposer({ ...composer, title: e.target.value })} maxLength={160} placeholder="One-line summary of your doubt or thought…" aria-label="Post title" />
          <textarea value={composer.body} onChange={(e) => setComposer({ ...composer, body: e.target.value })} rows={2} maxLength={4000} placeholder="What have you tried? Paste the question, your reasoning, and where it broke…" aria-label="Post body" />
          <div className="disc-composer-actions">
            {notice && <small className="disc-notice" role="alert">{notice}</small>}
            <button type="submit" disabled={posting}>{posting ? 'Posting…' : 'Post to the community →'}</button>
          </div>
        </form>
      )}

      <section className="disc-filters card">
        <div className="disc-kind-tabs" role="tablist" aria-label="Filter discussions">
          {KIND_TABS.map((tab) => (
            <button key={tab.id} role="tab" aria-selected={kind === tab.id} className={kind === tab.id ? 'active' : ''} onClick={() => setKind(tab.id)}>{tab.label}</button>
          ))}
        </div>
        <input className="disc-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search doubts, topics, people…" aria-label="Search discussions" />
        {topicFilter && (
          <button className="disc-topic-chip" onClick={() => setTopicFilter('')} title="Clear topic filter">
            #{topicOptions.find((t) => t.id === topicFilter)?.title || topicFilter} ×
          </button>
        )}
      </section>

      {error ? (
        <section className="empty-feature card"><h2>The feed couldn’t load</h2><p>{error}</p><button onClick={() => void load()}>Try again</button></section>
      ) : loading ? (
        <Empty title="Opening the discussion hall…" text="Gathering the latest doubts and breakdowns." onClick={() => void load()} />
      ) : posts.length === 0 ? (
        <section className="empty-feature card">
          <Diamond size={30} className="empty-icon-diamond" />
          <h2>{search ? 'Nothing matches — yet.' : 'The floor is yours.'}</h2>
          <p>{search ? 'Try a broader phrase, or clear the topic filter.' : 'Be the first to post a doubt — the Dean answers within minutes when the community is awake.'}</p>
        </section>
      ) : (
        <div className="discussions-layout">
        <div className="disc-feed">
          {posts.map((post) => (
            <article className="disc-post card" key={post.id}>
              <header>
                <AvatarDot name={post.authorName} seed={post.authorId} />
                <div className="disc-meta">
                  <b>{post.authorName}{post.seeded && <span className="disc-seeded">Curated</span>}</b>
                  <small>
                    {post.authorStreak ? <span className="disc-streak"><Icon.Flame size={14} /> {post.authorStreak} day streak</span> : null}
                    {post.authorStreak ? ' · ' : ''}{timeAgo(post.createdAt)}
                    {post.topicId && (
                      <> · <button className="disc-topic-link" onClick={() => setTopicFilter(post.topicId || '')}>#{post.topicTitle || post.topicId}</button></>
                    )}
                  </small>
                </div>
                {post.kind === 'doubt' && (
                  <span className={`disc-kind-badge ${post.isResolved ? 'resolved' : ''}`}>{post.isResolved ? <><Icon.Check size={12} /> Resolved</> : 'Open'}</span>
                )}
              </header>
              <h2>{post.title}</h2>
              <p className="disc-body">{post.body}</p>
              <footer>
                <button className={`disc-upvote ${post.upvotedByMe ? 'active' : ''}`} onClick={() => void upvote(post)} aria-pressed={Boolean(post.upvotedByMe)} aria-label="Upvote">
                  <Icon.ChevronUp size={16} /> <b>{post.upvotes}</b>
                </button>
                <button className="disc-comment-toggle" onClick={() => setExpanded(expanded === post.id ? null : post.id)} aria-expanded={expanded === post.id}>
                  <Icon.Discussions size={14} /> {post.commentCount || post.comments.length} {post.commentCount === 1 ? 'reply' : 'replies'}
                </button>
                {post.kind === 'doubt' && userId && post.authorId === userId && (
                  <button className="disc-resolve" onClick={() => void toggleResolve(post)}>{post.isResolved ? 'Reopen' : 'Mark resolved'}</button>
                )}
              </footer>
              {expanded === post.id && (
                <div className="disc-comments">
                  {post.comments.length === 0 && <p className="muted">No replies yet — the Dean is lurking. Say it first.</p>}
                  {post.comments.map((comment) => (
                    <div className="disc-comment" key={comment.id}>
                      <AvatarDot name={comment.authorName} seed={comment.authorId} />
                      <div>
                        <small><b>{comment.authorName}</b> · {timeAgo(comment.createdAt)}</small>
                        <p>{comment.body}</p>
                      </div>
                    </div>
                  ))}
                  <div className="disc-comment-box">
                    <input
                      value={commentDraft}
                      onChange={(e) => setCommentDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') void addComment(post); }}
                      placeholder={isGuest ? 'Sign in to reply…' : 'Write a helpful reply…'}
                      aria-label="Write a reply"
                      maxLength={2000}
                    />
                    <button onClick={() => void addComment(post)} disabled={commentDraft.trim().length < 2}>Reply →</button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>

        <aside className="discussions-rail">
          <section className="disc-rail-card">
            <p className="label">COMMUNITY RULES</p>
            <ol>
              <li><b>Tag the exact topic.</b> Doubts anchored to a syllabus topic get answered first.</li>
              <li><b>Show your attempt.</b> State what you tried and where it broke — “I don't get it” gets ignored.</li>
              <li><b>One doubt per post.</b> Split big questions; merge small ones.</li>
              <li><b>No links-for-answers.</b> Explain the reasoning, then cite.</li>
            </ol>
          </section>
          <section className="disc-rail-card">
            <p className="label">TRENDING TOPICS</p>
            {topTopics.length ? (
              <div className="disc-rail-topics">
                {topTopics.map((t) => (
                  <button key={t.id} className="disc-rail-topic" onClick={() => setTopicFilter(t.id === 'general' ? '' : t.id)}>
                    <span>{t.title}</span><small>{t.count} post{t.count === 1 ? '' : 's'}</small>
                  </button>
                ))}
              </div>
            ) : <p className="muted">Post the first doubt — the feed learns what you're stuck on.</p>}
          </section>
          <section className="disc-rail-card disc-xp-card">
            <p className="label">EARN +20 XP</p>
            <p>Answer a doubt in your strong subject, share a question challenge in chat, or help a PYQ thread. The community notices all three.</p>
          </section>
        </aside>
        </div>
      )}
    </>
  );
}

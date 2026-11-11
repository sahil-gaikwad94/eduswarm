import React, { useEffect, useMemo, useState } from 'react';
import { Icon, Diamond } from '../components/Icon';
import { apiGet, type Page } from '../lib/api';
import { ArticleReader } from '../components/Reader';

/**
 * The Reading Room — popular, genuinely insightful *free* blogs and reading
 * lists, curated per learning universe and tagged against the live syllabus.
 *
 * Nothing redirects the learner away: every resource opens an in-app reader
 * view with the original author prominently credited. The publisher link is
 * always offered, but leaving the app is a deliberate choice, never the
 * default path.
 */

type Resource = {
  id: string; title: string; publisher: string; url: string;
  blurb: string; kind: string; modules: string[];
};

const KIND_LABEL: Record<string, string> = {
  blog: 'Blog', course: 'Free course', book: 'Free book', docs: 'Docs',
  community: 'Community', practice: 'Practice', reference: 'Reference',
};
const READLIST_KEY = 'eduswarm.readingList';
const readList = (): string[] => { try { return JSON.parse(localStorage.getItem(READLIST_KEY) || '[]'); } catch { return []; } };

export function Library({ goal, universeTitle, onNavigate }: {
  goal: string; universeTitle: string; onNavigate: (page: Page, topicId?: string) => void;
}) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [module, setModule] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<Resource | null>(null);
  const [listOnly, setListOnly] = useState(false);
  const [saved, setSaved] = useState<string[]>(readList);

  useEffect(() => { setModule(''); setQuery(''); setOpen(null); }, [goal]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ goal });
    const t = window.setTimeout(() => {
      apiGet(`/api/resources?${params.toString()}`)
        .then((d) => { setResources(d.resources || []); setModules(d.modules || []); })
        .catch(() => { setResources([]); setModules([]); })
        .finally(() => setLoading(false));
    }, 60);
    return () => window.clearTimeout(t);
  }, [goal]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toggleSave = (id: string) => {
    setSaved((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try { localStorage.setItem(READLIST_KEY, JSON.stringify(next)); } catch { /* private mode */ }
      return next;
    });
  };

  const visible = useMemo(() => {
    let list = resources;
    if (module) list = list.filter((r) => r.modules.includes(module));
    if (listOnly) list = list.filter((r) => saved.includes(r.id));
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((r) => `${r.title} ${r.publisher} ${r.blurb} ${r.modules.join(' ')}`.toLowerCase().includes(q));
    return list;
  }, [resources, module, query, listOnly, saved]);

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">THE READING ROOM · {universeTitle.toUpperCase()}</p>
          <h1>Read it inside.</h1>
          <p className="lead">
            Popular, genuinely insightful free reads matched to this syllabus — hand-picked,
            original authors credited, and readable without leaving EduSwarm.
          </p>
        </div>
      </div>

      <section className="library-toolbar card">
        <input
          className="library-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${resources.length} free resources…`}
          aria-label="Search resources"
        />
        <div className="library-chips" role="tablist" aria-label="Filter by module">
          <button className={`library-chip ${module === '' && !listOnly ? 'active' : ''}`} onClick={() => { setModule(''); setListOnly(false); }}>All</button>
          <button className={`library-chip ${listOnly ? 'active' : ''}`} onClick={() => setListOnly((v) => !v)}>My list{saved.length ? ` · ${saved.length}` : ''}</button>
          {modules.map((m) => (
            <button key={m} className={`library-chip ${module === m ? 'active' : ''}`} onClick={() => setModule(module === m ? '' : m)}>
              {m}
            </button>
          ))}
        </div>
      </section>

      {loading && (
        <section className="empty-feature card">
          <Diamond size={30} className="empty-icon-diamond" />
          <h2>Stocking the shelves…</h2>
          <p>Finding the best free reading for this universe.</p>
        </section>
      )}

      {!loading && visible.length === 0 && (
        <section className="empty-feature card">
          <div className="empty-icon">⌕</div>
          <h2>{listOnly ? 'Your reading list is empty.' : 'Nothing on this shelf.'}</h2>
          <p>{listOnly ? 'Tap the bookmark on any resource to save it here.' : 'Try a different module or clear the search.'}</p>
          {!listOnly && <button onClick={() => { setModule(''); setQuery(''); }}>Show everything</button>}
        </section>
      )}

      <div className="library-grid">
        {visible.map((r) => (
          <button className="library-card card" key={r.id} onClick={() => setOpen(r)} aria-label={`Read ${r.title} in-app`}>
            <div className="library-card-head">
              <span className={`library-kind kind-${r.kind}`}>{KIND_LABEL[r.kind] || r.kind}</span>
              <span className="library-free">FREE</span>
              <span className={`library-save ${saved.includes(r.id) ? 'active' : ''}`} role="checkbox" aria-checked={saved.includes(r.id)}
                onClick={(e) => { e.stopPropagation(); toggleSave(r.id); }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); e.preventDefault(); toggleSave(r.id); } }}
                tabIndex={0}
                aria-label={saved.includes(r.id) ? 'Remove from reading list' : 'Save to reading list'}
                title={saved.includes(r.id) ? 'Saved to your list' : 'Save to your list'}
              >{saved.includes(r.id) ? <Icon.Star size={16} /> : <Icon.StarOutline size={16} />}</span>
            </div>
            <h2>{r.title}</h2>
            <p className="library-publisher">{r.publisher}</p>
            <p className="library-blurb">{r.blurb}</p>
            <div className="library-tags">
              {r.modules.slice(0, 3).map((m) => <span key={m}>{m}</span>)}
              {r.modules.length > 3 && <span>+{r.modules.length - 3} more</span>}
            </div>
            <span className="library-open">Read inside →</span>
          </button>
        ))}
      </div>

      {open && (
        <ArticleReader
          url={open.url}
          fallbackTitle={open.title}
          fallbackPublisher={open.publisher}
          saved={saved.includes(open.id)}
          onToggleSave={() => toggleSave(open.id)}
          onClose={() => setOpen(null)}
        />
      )}

      <section className="library-note">
        <p>
          <Icon.Check size={14} /> Every link is free to read and hand-picked for this syllabus.
          Nothing here redirects you out of EduSwarm unless you choose to leave.
        </p>
        <button className="secondary-button" onClick={() => onNavigate('dashboard')}>← Back to the syllabus</button>
      </section>
    </>
  );
}

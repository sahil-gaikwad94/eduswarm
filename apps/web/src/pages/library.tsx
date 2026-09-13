import React, { useEffect, useMemo, useState } from 'react';
import { apiGet, type Page } from '../lib/api';

/**
 * The Reading Room — popular, genuinely insightful *free* blogs and reading
 * lists, curated per learning universe and tagged against that universe's live
 * syllabus modules. Switch universe → the whole library changes.
 */

type Resource = {
  id: string; title: string; publisher: string; url: string;
  blurb: string; kind: string; modules: string[];
};

const KIND_LABEL: Record<string, string> = {
  blog: 'Blog', course: 'Free course', book: 'Free book', docs: 'Docs',
  community: 'Community', practice: 'Practice', reference: 'Reference',
};

function hostOf(url: string): string {
  try { return new URL(url).hostname; } catch { return ''; }
}

export function Library({ goal, universeTitle, onNavigate }: {
  goal: string; universeTitle: string; onNavigate: (page: Page, topicId?: string) => void;
}) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [module, setModule] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { setModule(''); setQuery(''); }, [goal]);

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

  const visible = useMemo(() => {
    let list = resources;
    if (module) list = list.filter((r) => r.modules.includes(module));
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((r) => `${r.title} ${r.publisher} ${r.blurb} ${r.modules.join(' ')}`.toLowerCase().includes(q));
    return list;
  }, [resources, module, query]);

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">THE READING ROOM · {universeTitle.toUpperCase()}</p>
          <h1>Free blogs worth your time.</h1>
          <p className="lead">
            Popular, genuinely insightful blogs and free reading for the {universeTitle} universe —
            hand-picked to match this syllabus. Switch universe and the shelf restocks itself.
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
          <button className={`library-chip ${module === '' ? 'active' : ''}`} onClick={() => setModule('')}>All modules</button>
          {modules.map((m) => (
            <button key={m} className={`library-chip ${module === m ? 'active' : ''}`} onClick={() => setModule(module === m ? '' : m)}>
              {m}
            </button>
          ))}
        </div>
      </section>

      {loading && (
        <section className="empty-feature card">
          <div className="empty-icon">❖</div>
          <h2>Stocking the shelves…</h2>
          <p>Finding the best free reading for this universe.</p>
        </section>
      )}

      {!loading && visible.length === 0 && (
        <section className="empty-feature card">
          <div className="empty-icon">⌕</div>
          <h2>Nothing on this shelf yet.</h2>
          <p>Try a different module or clear the search.</p>
          <button onClick={() => { setModule(''); setQuery(''); }}>Show everything</button>
        </section>
      )}

      <div className="library-grid">
        {visible.map((r) => (
          <a className="library-card card" key={r.id} href={r.url} target="_blank" rel="noreferrer noopener">
            <div className="library-card-head">
              <img
                className="library-favicon"
                src={`https://www.google.com/s2/favicons?domain=${hostOf(r.url)}&sz=64`}
                alt="" loading="lazy" width={30} height={30}
              />
              <span className={`library-kind kind-${r.kind}`}>{KIND_LABEL[r.kind] || r.kind}</span>
              <span className="library-free">FREE</span>
            </div>
            <h2>{r.title}</h2>
            <p className="library-publisher">{r.publisher}</p>
            <p className="library-blurb">{r.blurb}</p>
            <div className="library-tags">
              {r.modules.slice(0, 3).map((m) => <span key={m}>{m}</span>)}
              {r.modules.length > 3 && <span>+{r.modules.length - 3} more</span>}
            </div>
            <span className="library-open">Read free ↗</span>
          </a>
        ))}
      </div>

      <section className="library-note">
        <p>
          ✦ Every link is free to read and picked because practitioners actually recommend it.
          Want to go deeper on a topic? Open its tutorial — the Dean’s team weaves these sources in.
        </p>
        <button className="secondary-button" onClick={() => onNavigate('dashboard')}>← Back to the syllabus</button>
      </section>
    </>
  );
}

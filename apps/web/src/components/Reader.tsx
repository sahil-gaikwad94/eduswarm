import React, { useEffect, useState } from 'react';
import { apiGet } from '../lib/api';
import { RichText } from './ui';

type Article = {
  url: string; finalUrl: string; title: string; byline: string; publisher: string;
  excerpt: string; markdown: string; wordCount: number; readingMinutes: number;
  extracted: boolean; fetchedAt: string;
};

/**
 * Full-article reader used by the Reading Room and by lesson source links.
 * The article is fetched and extracted by the API, then rendered inside the
 * app with the original publisher and author credited. The original link is
 * always available, but leaving is a deliberate choice.
 */
export function ArticleReader({ url, fallbackTitle, fallbackPublisher, saved, onToggleSave, onClose }: {
  url: string;
  fallbackTitle?: string;
  fallbackPublisher?: string;
  saved?: boolean;
  onToggleSave?: () => void;
  onClose: () => void;
}) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    setArticle(null);
    apiGet(`/api/reader?url=${encodeURIComponent(url)}`)
      .then((data) => { if (alive) setArticle(data); })
      .catch((e: any) => { if (alive) setError(e?.message || 'The in-app reader could not open that page.'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [url]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const title = article?.title || fallbackTitle || 'Reading';
  return (
    <div className="reader-backdrop" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <article className="reader-sheet reader-sheet-full" onClick={(event) => event.stopPropagation()}>
        <header className="reader-top">
          <span className="reader-tag">IN-APP READER</span>
          <span className="reader-source">
            {article ? <>Originally published by <b>{article.publisher}</b>{article.byline ? ` · ${article.byline}` : ''}</> : 'Fetching the original article…'}
          </span>
          <button className="reader-close" onClick={onClose} aria-label="Close reader">×</button>
        </header>

        {loading && (
          <div className="reader-body">
            <div className="reader-skeleton" aria-label="Loading article">
              <span className="sk sk-label" /><span className="sk sk-title" /><span className="sk sk-title short" />
              <span className="sk sk-line" /><span className="sk sk-line" /><span className="sk sk-line" />
              <span className="sk sk-line" /><span className="sk sk-line short" />
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="reader-body">
            <div className="reader-fallback card">
              <p className="label">THIS PAGE WON'T OPEN IN-APP</p>
              <h1>{fallbackTitle || 'Read the original'}</h1>
              <p>{error} You can still open the publisher's page — the author keeps their layout, citations, and media there.</p>
              <div className="reader-actions">
                <a className="reader-original" href={url} target="_blank" rel="noreferrer noopener">Open original at {fallbackPublisher || 'publisher'} ↗</a>
              </div>
            </div>
          </div>
        )}

        {!loading && article && (
          <div className="reader-body">
            <div className="reader-headline">
              <p className="label">{article.publisher.toUpperCase()} · {article.readingMinutes} MIN READ</p>
              <h1>{article.title}</h1>
              {article.byline && <p className="reader-byline">By {article.byline}</p>}
            </div>
            {!article.extracted && (
              <div className="reader-fallback-note">
                <b>Partial extraction.</b> The publisher did not expose the full article text to the reader, so this is the summary they provide. Open the original for the complete piece.
              </div>
            )}
            <div className="reader-article">
              <RichText text={article.markdown} />
            </div>
            <div className="reader-actions">
              {onToggleSave && (
                <button className="reader-save" onClick={onToggleSave}>
                  {saved ? '★ Saved to your reading list' : '☆ Save to my list'}
                </button>
              )}
              <a className="reader-original" href={article.finalUrl || url} target="_blank" rel="noreferrer noopener">
                Read original at {article.publisher} ↗
              </a>
            </div>
            <p className="reader-copyright">
              This page remains the property of {article.publisher}. EduSwarm presents an extracted reading view for study, with the original author and publisher credited. All rights belong to the original creator.
            </p>
          </div>
        )}
      </article>
    </div>
  );
}

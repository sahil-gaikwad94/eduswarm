import React, { useEffect, useState } from 'react';
import { apiGet, apiPost, type Page } from '../lib/api';
import { Empty } from '../components/ui';

function useCountdown(seconds: number, resetKey: string | number, paused: boolean) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => { setLeft(seconds); }, [seconds, resetKey]);
  useEffect(() => {
    if (paused) return;
    if (left <= 0) return;
    const timer = window.setTimeout(() => setLeft(left - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [left, paused]);
  return left;
}

function fmt(sec: number): string {
  const m = Math.floor(Math.max(0, sec) / 60);
  const s = Math.max(0, sec) % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function Evaluation({ evaluation }: { evaluation: any }) {
  return (
    <div className="eval-card">
      <div className="eval-score"><b>{evaluation.score}</b><small>/ 10</small></div>
      <div>
        <p>{evaluation.feedback}</p>
        {(evaluation.strengths || []).length > 0 && (
          <p className="eval-line good"><b>Strengths:</b> {evaluation.strengths.join(' · ')}</p>
        )}
        {(evaluation.gaps || []).length > 0 && (
          <p className="eval-line needs-work"><b>Gaps:</b> {evaluation.gaps.join(' · ')}</p>
        )}
        <p className="eval-followup">❯ {evaluation.followUp}</p>
      </div>
    </div>
  );
}

export function Interview({ onNavigate }: { onNavigate: (page: Page, topicId?: string) => void }) {
  const [tracks, setTracks] = useState<any[]>([]);
  const [flow, setFlow] = useState<any>(null);
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [code, setCode] = useState('');
  const [evaluation, setEvaluation] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [starting, setStarting] = useState('');

  useEffect(() => {
    apiGet('/api/interviews/meta').then((d) => setTracks(d.tracks || [])).catch(() => {});
  }, []);

  const item = flow?.items?.[index];
  const left = useCountdown(item?.timeLimitSec || 0, item?.id || 'none', Boolean(evaluation || report));

  const start = async (track: string) => {
    setStarting(track); setReport(null); setEvaluation(null); setIndex(0);
    try {
      const data = await apiPost('/api/interviews', { track });
      setFlow(data);
      const firstCode = data.items.find((i: any) => i.kind === 'code');
      if (firstCode) setCode(firstCode.payload.starter || '');
    } catch { /* meta stays visible */ } finally { setStarting(''); }
  };

  const beginItem = (i: number) => {
    setIndex(i); setEvaluation(null); setSelected(null); setText('');
    const next = flow.items[i];
    if (next?.kind === 'code') setCode(next.payload.starter || '');
  };

  const submit = async () => {
    if (!item || busy || evaluation) return;
    setBusy(true);
    try {
      const body: any = { itemId: item.id };
      if (item.kind === 'concept') { body.selected = selected; body.explanation = text; }
      if (item.kind === 'code') body.code = code;
      else body.answerText = text;
      const data = await apiPost(`/api/interviews/${flow.interviewId}/answer`, body);
      setEvaluation(data.evaluation);
    } catch (e: any) {
      setEvaluation({ score: 0, feedback: e.message || 'Evaluation failed — try again.', strengths: [], gaps: [], followUp: 'Resubmit when ready.' });
    } finally { setBusy(false); }
  };

  const finish = async () => {
    setBusy(true);
    try {
      setReport(await apiPost(`/api/interviews/${flow.interviewId}/complete`));
    } finally { setBusy(false); }
  };

  if (report) {
    return (
      <>
        <div className="compact-heading">
          <div>
            <p className="eyebrow">INTERVIEW REPORT · {report.track.toUpperCase()}</p>
            <h1>{report.overall} / 10 — {report.verdict}</h1>
            <p className="lead">Concept answers already fed your XP, mastery, and mistake notebook.</p>
          </div>
        </div>
        <div className="report-grid">
          {report.dimensions.map((d: any) => (
            <div className="card dash-stat" key={d.label}>
              <span>{d.label.toUpperCase()}</span>
              <b>{d.score} / 10</b>
              <div className="xp-bar"><i style={{ width: `${d.score * 10}%` }} /></div>
              <small>{d.note}</small>
            </div>
          ))}
        </div>
        <div className="report-cols">
          <section className="card dash-card">
            <p className="label">STRENGTHS TO KEEP</p>
            {report.strengths.map((s: string, i: number) => <p className="eval-line good" key={i}>✓ {s}</p>)}
          </section>
          <section className="card dash-card">
            <p className="label">GAPS TO REPAIR</p>
            {report.gaps.map((g: string, i: number) => <p className="eval-line needs-work" key={i}>! {g}</p>)}
          </section>
        </div>
        {(report.studyLinks || []).length > 0 && (
          <section className="card dash-card">
            <p className="label">REPAIR WITH THESE TUTORIALS</p>
            <div className="study-links">
              {report.studyLinks.map((l: any) => (
                <button key={l.topicId} className="secondary-button" onClick={() => onNavigate('lesson', l.topicId)}>{l.label} →</button>
              ))}
            </div>
          </section>
        )}
        <div className="lesson-footer-actions">
          <button className="secondary-button" onClick={() => { setFlow(null); setReport(null); }}>← All tracks</button>
          <button onClick={() => void start(flow.track)}>Retry this interview →</button>
        </div>
      </>
    );
  }

  if (!flow) {
    return (
      <>
        <div className="compact-heading">
          <div>
            <p className="eyebrow">REAL PRESSURE · REAL FEEDBACK</p>
            <h1>Interview simulator</h1>
            <p className="lead">Five timed rounds — warm-up, live coding, deep concepts, system design, behavioral — with coaching on every answer and a hire-lean report at the end.</p>
          </div>
        </div>
        {!tracks.length && <Empty title="Loading tracks" text="Preparing the interview panel." onClick={() => onNavigate('dashboard')} />}
        <div className="track-grid">
          {tracks.map((t: any) => (
            <section className="card track-card" key={t.track}>
              <p className="label">{t.track.toUpperCase()} INTERVIEW</p>
              <h2>{t.title}</h2>
              <ol>{t.rounds.map((r: string) => <li key={r}>{r}</li>)}</ol>
              <button disabled={Boolean(starting)} onClick={() => void start(t.track)}>
                {starting === t.track ? 'Assembling panel…' : 'Start interview →'}
              </button>
            </section>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="compact-heading">
        <div>
          <p className="eyebrow">{flow.title.toUpperCase()} · ROUND {index + 1} OF {flow.items.length} · {item.round.toUpperCase()}</p>
          <h1>{item.title}</h1>
        </div>
        <div className={`timer-pill ${left <= 30 ? 'urgent' : ''}`} title="Suggested time for this round">◷ {fmt(left)}</div>
      </div>
      <div className="interview-progress"><i style={{ width: `${Math.round((index / flow.items.length) * 100)}%` }} /></div>

      <section className="card interview-card">
        {item.kind === 'concept' && (
          <>
            <p className="interview-prompt">{item.payload.question}</p>
            <small className="muted">{item.payload.subject} · {item.payload.topic}</small>
            <div className="options">
              {item.payload.options.map((o: string, i: number) => (
                <button key={o} disabled={Boolean(evaluation)} className={`option ${selected === i ? 'selected' : ''}`} onClick={() => setSelected(i)}>
                  <span>{String.fromCharCode(65 + i)}</span>{o}
                </button>
              ))}
            </div>
            <label className="explain-label">Explain your reasoning (interviewers score this)
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} disabled={Boolean(evaluation)} placeholder="State the governing rule, eliminate options, give one example…" />
            </label>
          </>
        )}
        {item.kind === 'code' && (
          <>
            <p className="interview-prompt">{item.payload.prompt}</p>
            <small className="muted">Signature: <code className="inline-code">{item.payload.signature}</code> · {item.payload.testCount} hidden tests</small>
            <div className="code-examples">
              {(item.payload.examples || []).map((ex: any, i: number) => (
                <p key={i}><b>{ex.label || `Example ${i + 1}`}:</b> <code className="inline-code">{JSON.stringify(ex.args)}</code> → <code className="inline-code">{JSON.stringify(ex.expected)}</code></p>
              ))}
            </div>
            <textarea className="code-editor" value={code} onChange={(e) => setCode(e.target.value)} rows={12} disabled={Boolean(evaluation)} spellCheck={false} />
            {(item.payload.hints || []).length > 0 && (
              <details className="hints"><summary>Hints ({item.payload.hints.length})</summary>
                <ul>{item.payload.hints.map((h: string, i: number) => <li key={i}>{h}</li>)}</ul>
              </details>
            )}
          </>
        )}
        {(item.kind === 'design' || item.kind === 'behavioral') && (
          <>
            <p className="interview-prompt">{item.payload.prompt}</p>
            <label className="explain-label">{item.kind === 'design' ? 'Your design (cover trade-offs + capacity numbers)' : 'Your story (use STAR: situation, task, action, result)'}
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} disabled={Boolean(evaluation)} placeholder={item.kind === 'design' ? 'Start with requirements, then API, storage, scale, failure modes…' : 'Two minutes, specific actions, measurable outcome…'} />
            </label>
            <small className="muted">{text.trim().split(/\s+/).filter(Boolean).length} words</small>
          </>
        )}

        {evaluation && <Evaluation evaluation={evaluation} />}

        <div className="practice-actions">
          {!evaluation ? (
            <button onClick={() => void submit()} disabled={busy || (item.kind === 'concept' && selected === null)}>
              {busy ? 'Evaluating…' : 'Submit answer →'}
            </button>
          ) : index + 1 < flow.items.length ? (
            <button onClick={() => beginItem(index + 1)}>Next round →</button>
          ) : (
            <button onClick={() => void finish()} disabled={busy}>{busy ? 'Scoring…' : 'Finish & get report →'}</button>
          )}
        </div>
      </section>
    </>
  );
}

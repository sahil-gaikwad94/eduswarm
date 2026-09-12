import React, { useEffect, useRef, useState } from 'react';
import { apiGet, apiPost, type Page, type Topic } from '../lib/api';
import { Empty } from '../components/ui';

function ShareCard({ share, onNavigate }: { share: any; onNavigate: (page: Page, topicId?: string) => void }) {
  if (!share) return null;
  const actions: Record<string, { label: string; page: Page }> = {
    topic: { label: 'Open tutorial →', page: 'lesson' },
    question: { label: 'Practice this →', page: 'quiz' },
    code: { label: 'Solve in Code Lab →', page: 'codelab' },
    interview: { label: 'Try interviews →', page: 'interview' },
  };
  const action = actions[share.kind] || actions.topic;
  return (
    <button className="share-card" onClick={() => onNavigate(action.page, share.kind === 'topic' ? share.refId : undefined)}>
      <small>{share.kind.toUpperCase()} · SHARED</small>
      <b>{share.title}</b>
      {share.snippet && <code>{share.snippet.slice(0, 140)}</code>}
      <span>{action.label}</span>
    </button>
  );
}

function inviteLinkFor(code: string): string {
  return `${window.location.origin}${window.location.pathname}?invite=${encodeURIComponent(code)}`;
}

export function Rooms({ user, goal, topic, inviteCode, onInviteUsed, onNavigate }: {
  user: any; goal: string; topic: Topic | null;
  inviteCode?: string | null; onInviteUsed?: () => void;
  onNavigate: (page: Page, topicId?: string) => void;
}) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [thread, setThread] = useState<any>(null);
  const [text, setText] = useState('');
  const [roomName, setRoomName] = useState('');
  const [roomFocus, setRoomFocus] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [attachTopic, setAttachTopic] = useState(false);
  const [notice, setNotice] = useState('');
  const [copied, setCopied] = useState('');
  const [manualCode, setManualCode] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadRooms = () => apiGet('/api/rooms').then((d) => setRooms(d.rooms || [])).catch(() => {});
  useEffect(() => { void loadRooms(); }, []);

  const openRoom = async (id: string) => {
    setActive(id);
    setNotice('');
    const joined = await apiPost(`/api/rooms/${id}/join`).catch((e: any) => e);
    if (joined?.status === 403) {
      setThread(null);
      setNotice(joined.message || 'This club is private — open its invite link to join.');
      return;
    }
    const data = await apiGet(`/api/rooms/${id}/messages?since=0`).catch(() => null);
    if (data) setThread(data);
  };

  // Arriving from an invite link: redeem it and drop the learner straight in.
  useEffect(() => {
    if (!inviteCode) return;
    (async () => {
      const room = await apiPost('/api/rooms/join-by-invite', { code: inviteCode }).catch((e: any) => e);
      if (room?.id) {
        await loadRooms();
        await openRoom(room.id);
        setNotice(`You joined ${room.name} with an invite link.`);
      } else {
        setNotice(room?.message || 'That invite link is no longer valid.');
      }
      onInviteUsed?.();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inviteCode]);

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => {
      apiGet(`/api/rooms/${active}/messages?since=0`).then(setThread).catch(() => {});
    }, 3000);
    return () => window.clearInterval(timer);
  }, [active]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [thread?.messages?.length]);

  const copyInvite = async (code: string) => {
    const link = inviteLinkFor(code);
    try {
      await navigator.clipboard.writeText(link);
      setCopied(code);
      window.setTimeout(() => setCopied(''), 2500);
    } catch {
      window.prompt('Copy this invite link:', link);
    }
  };

  const rotate = async (room: any) => {
    const updated = await apiPost(`/api/rooms/${room.id}/invite`).catch(() => null);
    if (updated?.inviteCode) {
      await loadRooms();
      setNotice('New invite link created — the old one no longer works.');
    }
  };

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!active || (!text.trim() && !attachTopic)) return;
    const share = attachTopic && topic ? { kind: 'topic', refId: topic.id, title: topic.title, snippet: topic.description } : null;
    const outgoing = text.trim() || (share ? `Shared a tutorial: ${topic!.title}` : '');
    setText(''); setAttachTopic(false);
    try {
      await apiPost(`/api/rooms/${active}/messages`, { text: outgoing, share });
      const data = await apiGet(`/api/rooms/${active}/messages?since=0`);
      setThread(data);
    } catch (e: any) { setNotice(e?.message || 'Could not send — are you a member of this club?'); }
  };

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!roomName.trim()) return;
    try {
      const room = await apiPost('/api/rooms', { name: roomName.trim(), goal, topic: roomFocus.trim(), isPrivate });
      setRoomName(''); setRoomFocus(''); setShowCreate(false);
      await loadRooms();
      await openRoom(room.id);
      if (room.isPrivate && room.inviteCode) {
        setNotice('Private club created. Share the invite link below — nobody else can see or join it without it.');
        void copyInvite(room.inviteCode);
      }
    } catch (e: any) { setNotice(e?.message || 'Could not create the club.'); }
  };

  const joinWithCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!manualCode.trim()) return;
    const room = await apiPost('/api/rooms/join-by-invite', { code: manualCode.trim() }).catch((e: any) => e);
    if (room?.id) {
      setManualCode('');
      await loadRooms();
      await openRoom(room.id);
      setNotice(`You joined ${room.name}.`);
    } else {
      setNotice(room?.message || 'That invite link is not valid.');
    }
  };

  if (!rooms.length) return <Empty title="Loading clubs" text="Finding your study crew." onClick={() => onNavigate('dashboard')} />;

  const myClubs = rooms.filter((r) => r.isPrivate);
  const halls = rooms.filter((r) => !r.isPrivate);

  return (
    <>
      <div className="compact-heading">
        <div>
          <p className="eyebrow">LEARN TOGETHER · LIVE</p>
          <h1>Clubs</h1>
          <p className="lead">Three public halls are open to everyone. Any club you create is private — it stays invisible until you share its invite link.</p>
        </div>
        <button className="secondary-button" onClick={() => setShowCreate(!showCreate)}>{showCreate ? 'Close' : '+ New club'}</button>
      </div>

      {notice && <p className="notice-banner">{notice}</p>}

      {showCreate && (
        <form className="card create-room" onSubmit={create}>
          <label>Club name<input value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="e.g. OS revision squad" maxLength={60} /></label>
          <label>Focus (optional)<input value={roomFocus} onChange={(e) => setRoomFocus(e.target.value)} placeholder="e.g. Solving PYQs nightly at 9pm" maxLength={120} /></label>
          <label className="privacy-toggle">
            <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
            <span><b>Private club</b><small>Hidden from the public list. Friends join only with your invite link.</small></span>
          </label>
          <button>Create {isPrivate ? 'private ' : ''}club →</button>
        </form>
      )}

      <form className="invite-redeem" onSubmit={joinWithCode}>
        <input value={manualCode} onChange={(e) => setManualCode(e.target.value)} placeholder="Have an invite link? Paste its code" />
        <button className="secondary-button">Join club</button>
      </form>

      <div className="rooms-layout">
        <aside className="rooms-list">
          {myClubs.length > 0 && <p className="label">YOUR PRIVATE CLUBS</p>}
          {myClubs.map((r: any) => (
            <div className="room-block" key={r.id}>
              <button className={`room-row ${active === r.id ? 'active' : ''}`} onClick={() => void openRoom(r.id)}>
                <b>🔒 {r.name}</b>
                <small>{r.topic} · {r.memberCount} online · {r.messageCount} messages</small>
              </button>
              {r.isOwner && r.inviteCode && (
                <div className="invite-actions">
                  <button className="secondary-button" onClick={() => void copyInvite(r.inviteCode)}>{copied === r.inviteCode ? '✓ Copied' : 'Copy invite link'}</button>
                  <button className="secondary-button" onClick={() => void rotate(r)}>New link</button>
                </div>
              )}
            </div>
          ))}
          <p className="label" style={{ marginTop: 14 }}>PUBLIC HALLS</p>
          {halls.map((r: any) => (
            <button key={r.id} className={`room-row ${active === r.id ? 'active' : ''}`} onClick={() => void openRoom(r.id)}>
              <b>{r.name}</b>
              <small>{r.topic} · {r.memberCount} online · {r.messageCount} messages</small>
            </button>
          ))}
        </aside>

        <section className="card room-thread">
          {!thread && <p className="muted">{notice || 'Select a club to join the conversation.'}</p>}
          {thread && (
            <>
              <div className="room-thread-head">
                <div><b>{thread.room.isPrivate ? '🔒 ' : ''}{thread.room.name}</b><small>{thread.room.topic}</small></div>
                <small className="muted">{thread.members.length} online{thread.members.length ? `: ${thread.members.slice(0, 4).map((m: any) => m.name).join(', ')}${thread.members.length > 4 ? '…' : ''}` : ''}</small>
              </div>
              <div className="room-messages">
                {thread.messages.map((m: any) => (
                  <div key={m.id} className={`room-message ${m.userId === user.id ? 'mine' : ''}`}>
                    <small>{m.userName} · {new Date(m.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</small>
                    {m.text && <p>{m.text}</p>}
                    <ShareCard share={m.share} onNavigate={onNavigate} />
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <form className="room-composer" onSubmit={send}>
                {topic && (
                  <button type="button" className={`secondary-button attach-toggle ${attachTopic ? 'active' : ''}`} onClick={() => setAttachTopic(!attachTopic)} title="Attach your current tutorial">
                    {attachTopic ? `✓ ${topic.title}` : '+ Attach current tutorial'}
                  </button>
                )}
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder={`Message as ${user.name || 'Learner'}…`} maxLength={2000} />
                <button>Send</button>
              </form>
            </>
          )}
        </section>
      </div>
    </>
  );
}

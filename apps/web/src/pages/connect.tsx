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

export function Rooms({ user, goal, topic, onNavigate }: {
  user: any; goal: string; topic: Topic | null; onNavigate: (page: Page, topicId?: string) => void;
}) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [thread, setThread] = useState<any>(null);
  const [text, setText] = useState('');
  const [roomName, setRoomName] = useState('');
  const [roomFocus, setRoomFocus] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [attachTopic, setAttachTopic] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadRooms = () => apiGet('/api/rooms').then((d) => setRooms(d.rooms || [])).catch(() => {});
  useEffect(() => { void loadRooms(); }, []);

  const openRoom = async (id: string) => {
    setActive(id);
    await apiPost(`/api/rooms/${id}/join`).catch(() => {});
    const data = await apiGet(`/api/rooms/${id}/messages?since=0`).catch(() => null);
    if (data) setThread(data);
  };

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => {
      apiGet(`/api/rooms/${active}/messages?since=0`).then(setThread).catch(() => {});
    }, 3000);
    return () => window.clearInterval(timer);
  }, [active]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [thread?.messages?.length]);

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
    } catch { /* retry on next poll */ }
  };

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!roomName.trim()) return;
    try {
      const room = await apiPost('/api/rooms', { name: roomName.trim(), goal, topic: roomFocus.trim() });
      setRoomName(''); setRoomFocus(''); setShowCreate(false);
      await loadRooms();
      await openRoom(room.id);
    } catch { /* validation message stays */ }
  };

  if (!rooms.length) return <Empty title="Loading study rooms" text="Finding your study crew." onClick={() => onNavigate('dashboard')} />;

  return (
    <>
      <div className="compact-heading">
        <div>
          <p className="eyebrow">LEARN TOGETHER · LIVE</p>
          <h1>Study rooms</h1>
          <p className="lead">Chat, share tutorials and code, and debug together. Pick a hall or open your own room.</p>
        </div>
        <button className="secondary-button" onClick={() => setShowCreate(!showCreate)}>{showCreate ? 'Close' : '+ New room'}</button>
      </div>

      {showCreate && (
        <form className="card create-room" onSubmit={create}>
          <label>Room name<input value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="e.g. OS revision squad" maxLength={60} /></label>
          <label>Focus (optional)<input value={roomFocus} onChange={(e) => setRoomFocus(e.target.value)} placeholder="e.g. Solving PYQs nightly at 9pm" maxLength={120} /></label>
          <button>Create room →</button>
        </form>
      )}

      <div className="rooms-layout">
        <aside className="rooms-list">
          {rooms.map((r: any) => (
            <button key={r.id} className={`room-row ${active === r.id ? 'active' : ''}`} onClick={() => void openRoom(r.id)}>
              <b>{r.name}</b>
              <small>{r.topic} · {r.memberCount} online · {r.messageCount} messages</small>
            </button>
          ))}
        </aside>

        <section className="card room-thread">
          {!thread && <p className="muted">Select a room to join the conversation.</p>}
          {thread && (
            <>
              <div className="room-thread-head">
                <div><b>{thread.room.name}</b><small>{thread.room.topic}</small></div>
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

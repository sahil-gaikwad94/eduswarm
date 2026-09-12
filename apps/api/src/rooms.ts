/**
 * EduSwarm Group Study Rooms
 * --------------------------
 * Lightweight in-memory rooms: learners gather per goal, chat, and share
 * topics / questions / code with one click. Clients poll for new messages
 * (no websocket dependency), which is robust on free-tier hosts.
 *
 * NOTE: state lives in process memory. On multi-instance deployments, pin
 * sessions to one instance or back this with Redis pub/sub later.
 */

import { randomUUID } from 'node:crypto';

export type RoomShare = { kind: 'topic' | 'question' | 'code' | 'interview'; refId: string; title: string; snippet?: string };
export type RoomMessage = {
  id: string; roomId: string; userId: string; userName: string;
  text: string; share: RoomShare | null; createdAt: string;
};
export type RoomMember = { userId: string; name: string; lastSeen: string };
export type Room = {
  id: string; name: string; goal: string; topic: string;
  ownerId: string; createdAt: string;
  members: Map<string, RoomMember>; messages: RoomMessage[];
};

const rooms = new Map<string, Room>();
const MAX_MESSAGES = 200;
const MAX_ROOMS = 60;

function now(): string {
  return new Date().toISOString();
}

function seedRoom(id: string, name: string, goal: string, topic: string, opener: string): Room {
  const room: Room = {
    id, name, goal, topic, ownerId: 'eduswarm', createdAt: now(),
    members: new Map(), messages: [],
  };
  room.messages.push({
    id: randomUUID(), roomId: id, userId: 'eduswarm', userName: 'EduSwarm Guide',
    text: opener, share: null, createdAt: now(),
  });
  rooms.set(id, room);
  return room;
}

function ensureSeeded(): void {
  if (rooms.size) return;
  seedRoom('hall-gate', 'GATE Study Hall', 'gate-cs', 'PYQs, mocks & revision', 'Welcome to the GATE Study Hall! Share the question you are stuck on, or ask for a 90-second concept recap.');
  seedRoom('hall-web', 'Full-stack Build Club', 'web-dev', 'Projects & code review', 'Welcome to the Build Club! Share code you want reviewed or a bug you are debugging together.');
  seedRoom('hall-aiml', 'AI/ML Paper Club', 'ai-ml', 'ML systems & interview prep', 'Welcome to the Paper Club! Share one idea from what you studied today and quiz each other on it.');
}

export function listRooms(): Array<Omit<Room, 'members' | 'messages'> & { memberCount: number; messageCount: number; lastActive: string }> {
  ensureSeeded();
  return [...rooms.values()].map((r) => ({
    id: r.id, name: r.name, goal: r.goal, topic: r.topic, ownerId: r.ownerId, createdAt: r.createdAt,
    memberCount: r.members.size, messageCount: r.messages.length,
    lastActive: r.messages[r.messages.length - 1]?.createdAt || r.createdAt,
  }));
}

export function createRoom(name: string, goal: string, topic: string, ownerId: string, ownerName: string): Room {
  ensureSeeded();
  if (rooms.size >= MAX_ROOMS) throw new Error('Too many rooms right now — join an existing hall.');
  const room: Room = {
    id: randomUUID(), name: name.slice(0, 60), goal, topic: topic.slice(0, 120) || 'Open study',
    ownerId, createdAt: now(), members: new Map(), messages: [],
  };
  room.messages.push({
    id: randomUUID(), roomId: room.id, userId: ownerId, userName: ownerName,
    text: `${ownerName} opened this room. Say hello and share what you are working on!`, share: null, createdAt: now(),
  });
  rooms.set(room.id, room);
  return room;
}

export function getRoom(id: string): Room | undefined {
  ensureSeeded();
  return rooms.get(id);
}

export function joinRoom(id: string, userId: string, name: string): RoomMember[] {
  const room = getRoom(id);
  if (!room) throw new Error('Room not found');
  room.members.set(userId, { userId, name: name.slice(0, 40) || 'Learner', lastSeen: now() });
  pruneMembers(room);
  return [...room.members.values()];
}

function pruneMembers(room: Room): void {
  const cutoff = Date.now() - 1000 * 60 * 30;
  for (const [id, member] of room.members) {
    if (new Date(member.lastSeen).getTime() < cutoff) room.members.delete(id);
  }
}

export function postMessage(id: string, userId: string, userName: string, text: string, share: RoomShare | null = null): RoomMessage {
  const room = getRoom(id);
  if (!room) throw new Error('Room not found');
  const clean = String(text || '').trim().slice(0, 2000);
  if (!clean && !share) throw new Error('Message text or shared content is required');
  if (share && !['topic', 'question', 'code', 'interview'].includes(share.kind)) throw new Error('Invalid share kind');
  room.members.set(userId, { userId, name: userName.slice(0, 40) || 'Learner', lastSeen: now() });
  const message: RoomMessage = { id: randomUUID(), roomId: id, userId, userName: userName.slice(0, 40) || 'Learner', text: clean, share, createdAt: now() };
  room.messages.push(message);
  while (room.messages.length > MAX_MESSAGES) room.messages.shift();
  return message;
}

export function roomMessages(id: string, since = 0, limit = 50): { room: { id: string; name: string; goal: string; topic: string }; members: RoomMember[]; messages: RoomMessage[] } {
  const room = getRoom(id);
  if (!room) throw new Error('Room not found');
  pruneMembers(room);
  const filtered = room.messages.filter((m) => new Date(m.createdAt).getTime() > since).slice(-limit);
  return {
    room: { id: room.id, name: room.name, goal: room.goal, topic: room.topic },
    members: [...room.members.values()], messages: filtered,
  };
}

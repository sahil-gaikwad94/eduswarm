/**
 * EduSwarm Clubs (study rooms)
 * ----------------------------
 * Three public halls ship with the product. Anything a learner creates is a
 * **private club**: it never appears in the public list and can only be entered
 * with its invite link. Membership is checked on read and write, so a private
 * club's messages are not reachable by guessing its id.
 *
 * NOTE: state lives in process memory. On multi-instance deployments, pin
 * sessions to one instance or back this with the store later.
 */

import { randomBytes, randomUUID } from 'node:crypto';

export type RoomShare = { kind: 'topic' | 'question' | 'code' | 'interview'; refId: string; title: string; snippet?: string };
export type RoomMessage = {
  id: string; roomId: string; userId: string; userName: string;
  text: string; share: RoomShare | null; createdAt: string;
};
export type RoomMember = { userId: string; name: string; lastSeen: string };
export type Room = {
  id: string; name: string; goal: string; topic: string;
  ownerId: string; ownerName: string;
  isPrivate: boolean; inviteCode: string;
  createdAt: string;
  members: Map<string, RoomMember>; messages: RoomMessage[];
};

export type RoomSummary = {
  id: string; name: string; goal: string; topic: string; ownerId: string; ownerName: string;
  isPrivate: boolean; createdAt: string; memberCount: number; messageCount: number; lastActive: string;
  isOwner: boolean; isMember: boolean; inviteCode?: string;
};

const rooms = new Map<string, Room>();
const MAX_MESSAGES = 200;
const MAX_ROOMS = 60;

function now(): string {
  return new Date().toISOString();
}

/** Invite codes are url-safe and not guessable. */
function newInviteCode(): string {
  return randomBytes(9).toString('base64url').replace(/[-_]/g, (c) => (c === '-' ? 'x' : 'z'));
}

function seedRoom(id: string, name: string, goal: string, topic: string, opener: string): Room {
  const room: Room = {
    id, name, goal, topic, ownerId: 'eduswarm', ownerName: 'EduSwarm',
    isPrivate: false, inviteCode: '', createdAt: now(),
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

function canSee(room: Room, userId: string | null): boolean {
  if (!room.isPrivate) return true;
  if (!userId) return false;
  return room.ownerId === userId || room.members.has(userId);
}

function summary(room: Room, viewerId: string | null): RoomSummary {
  const isOwner = Boolean(viewerId) && room.ownerId === viewerId;
  return {
    id: room.id, name: room.name, goal: room.goal, topic: room.topic,
    ownerId: room.ownerId, ownerName: room.ownerName, isPrivate: room.isPrivate, createdAt: room.createdAt,
    memberCount: room.members.size, messageCount: room.messages.length,
    lastActive: room.messages[room.messages.length - 1]?.createdAt || room.createdAt,
    isOwner, isMember: isOwner || (Boolean(viewerId) && room.members.has(viewerId as string)),
    // Only the owner may see (and therefore share) the invite code.
    ...(isOwner ? { inviteCode: room.inviteCode } : {}),
  };
}

/** Public halls, plus the viewer's own private clubs. */
export function listRooms(viewerId: string | null = null): RoomSummary[] {
  ensureSeeded();
  return [...rooms.values()]
    .filter((room) => canSee(room, viewerId))
    .map((room) => summary(room, viewerId))
    .sort((a, b) => (a.isPrivate === b.isPrivate ? 0 : a.isPrivate ? 1 : -1));
}

export function createRoom(
  name: string, goal: string, topic: string, ownerId: string, ownerName: string,
  options: { isPrivate?: boolean } = {},
): Room {
  ensureSeeded();
  if (rooms.size >= MAX_ROOMS) throw new Error('Too many clubs right now — join an existing hall.');
  const isPrivate = options.isPrivate !== false; // private by default
  const room: Room = {
    id: randomUUID(), name: name.slice(0, 60), goal, topic: topic.slice(0, 120) || 'Open study',
    ownerId, ownerName: ownerName.slice(0, 40) || 'Learner',
    isPrivate, inviteCode: isPrivate ? newInviteCode() : '',
    createdAt: now(), members: new Map(), messages: [],
  };
  room.members.set(ownerId, { userId: ownerId, name: room.ownerName, lastSeen: now() });
  room.messages.push({
    id: randomUUID(), roomId: room.id, userId: ownerId, userName: room.ownerName,
    text: isPrivate
      ? `${room.ownerName} opened this private club. Share the invite link to let friends in.`
      : `${room.ownerName} opened this club. Say hello and share what you are working on!`,
    share: null, createdAt: now(),
  });
  rooms.set(room.id, room);
  return room;
}

export function getRoom(id: string): Room | undefined {
  ensureSeeded();
  return rooms.get(id);
}

export function roomByInvite(code: string): Room | undefined {
  ensureSeeded();
  const clean = String(code || '').trim();
  if (!clean) return undefined;
  return [...rooms.values()].find((room) => room.inviteCode === clean);
}

export class RoomAccessError extends Error {}

/** Join a club. Private clubs require ownership, existing membership, or the invite code. */
export function joinRoom(id: string, userId: string, name: string, inviteCode?: string): RoomMember[] {
  const room = getRoom(id);
  if (!room) throw new Error('Room not found');
  if (room.isPrivate && room.ownerId !== userId && !room.members.has(userId)) {
    if (!inviteCode || inviteCode !== room.inviteCode) {
      throw new RoomAccessError('This is a private club — you need its invite link.');
    }
  }
  room.members.set(userId, { userId, name: name.slice(0, 40) || 'Learner', lastSeen: now() });
  pruneMembers(room, userId);
  return [...room.members.values()];
}

/** Redeem an invite link: finds the club and joins it in one step. */
export function joinByInvite(code: string, userId: string, name: string): Room {
  const room = roomByInvite(code);
  if (!room) throw new RoomAccessError('That invite link is not valid (the club may have been removed).');
  joinRoom(room.id, userId, name, code);
  return room;
}

/** Owner-only: rotate the invite code, invalidating the old link. */
export function rotateInvite(id: string, userId: string): string {
  const room = getRoom(id);
  if (!room) throw new Error('Room not found');
  if (room.ownerId !== userId) throw new RoomAccessError('Only the club owner can change the invite link.');
  room.inviteCode = newInviteCode();
  return room.inviteCode;
}

function pruneMembers(room: Room, keep?: string): void {
  const cutoff = Date.now() - 1000 * 60 * 30;
  for (const [id, member] of room.members) {
    if (id === keep || id === room.ownerId) continue; // owners never age out
    if (new Date(member.lastSeen).getTime() < cutoff) room.members.delete(id);
  }
}

function requireAccess(room: Room, userId: string, action: string): void {
  if (!room.isPrivate) return;
  if (room.ownerId === userId || room.members.has(userId)) return;
  throw new RoomAccessError(`This club is private — join with its invite link before you ${action}.`);
}

export function postMessage(id: string, userId: string, userName: string, text: string, share: RoomShare | null = null): RoomMessage {
  const room = getRoom(id);
  if (!room) throw new Error('Room not found');
  requireAccess(room, userId, 'you can post');
  const clean = String(text || '').trim().slice(0, 2000);
  if (!clean && !share) throw new Error('Message text or shared content is required');
  if (share && !['topic', 'question', 'code', 'interview'].includes(share.kind)) throw new Error('Invalid share kind');
  room.members.set(userId, { userId, name: userName.slice(0, 40) || 'Learner', lastSeen: now() });
  const message: RoomMessage = { id: randomUUID(), roomId: id, userId, userName: userName.slice(0, 40) || 'Learner', text: clean, share, createdAt: now() };
  room.messages.push(message);
  while (room.messages.length > MAX_MESSAGES) room.messages.shift();
  return message;
}

export function roomMessages(id: string, userId: string, since = 0, limit = 50): { room: RoomSummary; members: RoomMember[]; messages: RoomMessage[] } {
  const room = getRoom(id);
  if (!room) throw new Error('Room not found');
  requireAccess(room, userId, 'you can read it');
  pruneMembers(room, userId);
  const filtered = room.messages.filter((m) => new Date(m.createdAt).getTime() > since).slice(-limit);
  return { room: summary(room, userId), members: [...room.members.values()], messages: filtered };
}

export function roomSummaryFor(id: string, userId: string): RoomSummary {
  const room = getRoom(id);
  if (!room) throw new Error('Room not found');
  return summary(room, userId);
}

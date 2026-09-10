import { MongoClient } from 'mongodb';
import { createClient, RedisClientType } from 'redis';

export type StoredUser = {
  id: string; provider?: string; providerSubject?: string; email?: string; name: string;
  skillLevel: string; dailyMinutes: number; targetDate?: string | null; avatar: Record<string, string>;
  goals: Array<Record<string, unknown>>; createdAt: string; updatedAt: string;
};
export type StoredJob = Record<string, any> & { id: string };
export type StoredContent = Record<string, any> & { id: string; ownerId: string; topicId: string };
export type StoredProgress = Record<string, any> & { id: string; ownerId: string; topicId: string };
export type StoredAgentSession = Record<string, any> & { id: string; ownerId: string; agentId: string };
export type StoredMistake = Record<string, any> & { id: string; ownerId: string; questionId: string };
type Session = { id: string; userId: string; expiresAt: Date };

export interface Store {
  connect(): Promise<void>; close(): Promise<void>; getUser(id: string): Promise<StoredUser | null>; upsertUser(user: StoredUser): Promise<StoredUser>;
  getUserByProvider(provider: string, subject: string): Promise<StoredUser | null>; getJob(id: string): Promise<StoredJob | null>; saveJob(job: StoredJob): Promise<StoredJob>;
  updateJob(id: string, patch: Partial<StoredJob>): Promise<StoredJob | null>; createSession(session: Session): Promise<void>; getSession(id: string): Promise<Session | null>; deleteSession(id: string): Promise<void>;
  saveContent(content: StoredContent): Promise<StoredContent>; getContent(ownerId: string, topicId: string): Promise<StoredContent | null>; listContent(ownerId: string): Promise<StoredContent[]>;
  saveProgress(progress: StoredProgress): Promise<StoredProgress>; getProgress(ownerId: string, topicId: string): Promise<StoredProgress | null>; listProgress(ownerId: string): Promise<StoredProgress[]>;
  saveAgentSession(session: StoredAgentSession): Promise<StoredAgentSession>; getAgentSession(ownerId: string, id: string): Promise<StoredAgentSession | null>; listAgentSessions(ownerId: string): Promise<StoredAgentSession[]>;
  saveMistake(mistake: StoredMistake): Promise<StoredMistake>; deleteMistake(ownerId: string, id: string): Promise<void>; listMistakes(ownerId: string): Promise<StoredMistake[]>;
  publish(jobId: string, event: unknown): Promise<void>; subscribe(jobId: string, handler: (event: any) => void): Promise<() => Promise<void>>;
}
function channel(jobId: string) { return `eduswarm:job:${jobId}`; }
class MemoryStore implements Store {
  private users = new Map<string, StoredUser>(); private jobs = new Map<string, StoredJob>(); private sessions = new Map<string, Session>();
  private contents = new Map<string, StoredContent>(); private progress = new Map<string, StoredProgress>(); private agentSessions = new Map<string, StoredAgentSession>(); private mistakes = new Map<string, StoredMistake>(); private listeners = new Map<string, Set<(event: any) => void>>();
  async connect() {} async close() {} async getUser(id: string) { return this.users.get(id) || null; } async upsertUser(user: StoredUser) { this.users.set(user.id, user); return user; }
  async getUserByProvider(provider: string, subject: string) { return [...this.users.values()].find((u) => u.provider === provider && u.providerSubject === subject) || null; }
  async getJob(id: string) { return this.jobs.get(id) || null; } async saveJob(job: StoredJob) { this.jobs.set(job.id, job); return job; }
  async updateJob(id: string, patch: Partial<StoredJob>) { const current = this.jobs.get(id); if (!current) return null; const next = { ...current, ...patch }; this.jobs.set(id, next); return next; }
  async createSession(s: Session) { this.sessions.set(s.id, s); } async getSession(id: string) { const s = this.sessions.get(id); if (!s || s.expiresAt <= new Date()) { this.sessions.delete(id); return null; } return s; } async deleteSession(id: string) { this.sessions.delete(id); }
  async saveContent(c: StoredContent) { this.contents.set(`${c.ownerId}:${c.topicId}`, c); return c; } async getContent(o: string, t: string) { return this.contents.get(`${o}:${t}`) || null; } async listContent(o: string) { return [...this.contents.values()].filter((c) => c.ownerId === o); }
  async saveProgress(p: StoredProgress) { this.progress.set(`${p.ownerId}:${p.topicId}`, p); return p; } async getProgress(o: string, t: string) { return this.progress.get(`${o}:${t}`) || null; } async listProgress(o: string) { return [...this.progress.values()].filter((p) => p.ownerId === o); }
  async saveAgentSession(s: StoredAgentSession) { this.agentSessions.set(s.id, s); return s; } async getAgentSession(o: string, id: string) { const s = this.agentSessions.get(id); return s?.ownerId === o ? s : null; } async listAgentSessions(o: string) { return [...this.agentSessions.values()].filter((s) => s.ownerId === o); }
  async saveMistake(m: StoredMistake) { this.mistakes.set(`${m.ownerId}:${m.id}`, m); return m; } async deleteMistake(o: string, id: string) { this.mistakes.delete(`${o}:${id}`); } async listMistakes(o: string) { return [...this.mistakes.values()].filter((m) => m.ownerId === o); }
  async publish(id: string, event: unknown) { this.listeners.get(id)?.forEach((h) => h(event)); } async subscribe(id: string, h: (event: any) => void) { const set = this.listeners.get(id) || new Set(); set.add(h); this.listeners.set(id, set); return async () => { set.delete(h); }; }
}
class MongoRedisStore implements Store {
  private mongo: MongoClient; private database!: ReturnType<MongoClient['db']>; private publisher!: RedisClientType; constructor(private mongoUrl: string, private redisUrl: string) { this.mongo = new MongoClient(mongoUrl); }
  async connect() { await this.mongo.connect(); this.database = this.mongo.db(); await this.database.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }); await this.database.collection('users').createIndex({ provider: 1, providerSubject: 1 }, { unique: true, sparse: true }); await this.database.collection('contents').createIndex({ ownerId: 1, topicId: 1 }, { unique: true }); await this.database.collection('progress').createIndex({ ownerId: 1, topicId: 1 }, { unique: true }); await this.database.collection('mistakes').createIndex({ ownerId: 1, createdAt: -1 }); this.publisher = createClient({ url: this.redisUrl }); await this.publisher.connect(); }
  async close() { await this.publisher?.quit(); await this.mongo.close(); }
  async getUser(id: string) { return await this.database.collection<StoredUser>('users').findOne({ id }, { projection: { _id: 0 } }); } async upsertUser(u: StoredUser) { await this.database.collection<StoredUser>('users').replaceOne({ id: u.id }, u, { upsert: true }); return u; }
  async getUserByProvider(provider: string, providerSubject: string) { return await this.database.collection<StoredUser>('users').findOne({ provider, providerSubject }, { projection: { _id: 0 } }); }
  async getJob(id: string) { return await this.database.collection<StoredJob>('jobs').findOne({ id }, { projection: { _id: 0 } }); } async saveJob(j: StoredJob) { await this.database.collection<StoredJob>('jobs').replaceOne({ id: j.id }, j, { upsert: true }); return j; }
  async updateJob(id: string, patch: Partial<StoredJob>) { return await this.database.collection<StoredJob>('jobs').findOneAndUpdate({ id }, { $set: patch }, { returnDocument: 'after', projection: { _id: 0 } }) || null; }
  async createSession(s: Session) { await this.database.collection<Session>('sessions').insertOne(s); } async getSession(id: string) { return await this.database.collection<Session>('sessions').findOne({ id }, { projection: { _id: 0 } }); } async deleteSession(id: string) { await this.database.collection<Session>('sessions').deleteOne({ id }); }
  async saveContent(c: StoredContent) { await this.database.collection<StoredContent>('contents').replaceOne({ ownerId: c.ownerId, topicId: c.topicId }, c, { upsert: true }); return c; } async getContent(o: string, t: string) { return await this.database.collection<StoredContent>('contents').findOne({ ownerId: o, topicId: t }, { projection: { _id: 0 } }); } async listContent(o: string) { return await this.database.collection<StoredContent>('contents').find({ ownerId: o }, { projection: { _id: 0 } }).toArray(); }
  async saveProgress(p: StoredProgress) { await this.database.collection<StoredProgress>('progress').replaceOne({ ownerId: p.ownerId, topicId: p.topicId }, p, { upsert: true }); return p; } async getProgress(o: string, t: string) { return await this.database.collection<StoredProgress>('progress').findOne({ ownerId: o, topicId: t }, { projection: { _id: 0 } }); } async listProgress(o: string) { return await this.database.collection<StoredProgress>('progress').find({ ownerId: o }, { projection: { _id: 0 } }).toArray(); }
  async saveAgentSession(s: StoredAgentSession) { await this.database.collection<StoredAgentSession>('agentSessions').replaceOne({ id: s.id }, s, { upsert: true }); return s; } async getAgentSession(o: string, id: string) { return await this.database.collection<StoredAgentSession>('agentSessions').findOne({ ownerId: o, id }, { projection: { _id: 0 } }); } async listAgentSessions(o: string) { return await this.database.collection<StoredAgentSession>('agentSessions').find({ ownerId: o }, { projection: { _id: 0 } }).toArray(); }
  async saveMistake(m: StoredMistake) { await this.database.collection<StoredMistake>('mistakes').replaceOne({ ownerId: m.ownerId, id: m.id }, m, { upsert: true }); return m; } async deleteMistake(o: string, id: string) { await this.database.collection<StoredMistake>('mistakes').deleteOne({ ownerId: o, id }); } async listMistakes(o: string) { return await this.database.collection<StoredMistake>('mistakes').find({ ownerId: o }, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray(); }
  async publish(id: string, event: unknown) { await this.publisher.publish(channel(id), JSON.stringify(event)); } async subscribe(id: string, h: (event: any) => void) { const sub = this.publisher.duplicate(); await sub.connect(); await sub.subscribe(channel(id), (p) => h(JSON.parse(p))); return async () => { await sub.unsubscribe(channel(id)); await sub.quit(); }; }
}
export function createStore() { const mongoUrl = process.env.MONGODB_URI; const redisUrl = process.env.REDIS_URL; if (mongoUrl && redisUrl) return new MongoRedisStore(mongoUrl, redisUrl); if (process.env.NODE_ENV === 'production') throw new Error('MONGODB_URI and REDIS_URL are required in production'); return new MemoryStore(); }

import { MongoClient } from 'mongodb';
import { createClient, RedisClientType } from 'redis';

export type StoredUser = {
  id: string;
  provider?: string;
  providerSubject?: string;
  email?: string;
  name: string;
  skillLevel: string;
  dailyMinutes: number;
  targetDate?: string | null;
  avatar: Record<string, string>;
  goals: Array<Record<string, unknown>>;
  createdAt: string;
  updatedAt: string;
};

export type StoredJob = Record<string, any> & { id: string };

type Session = { id: string; userId: string; expiresAt: Date };

export interface Store {
  connect(): Promise<void>;
  close(): Promise<void>;
  getUser(id: string): Promise<StoredUser | null>;
  upsertUser(user: StoredUser): Promise<StoredUser>;
  getUserByProvider(provider: string, subject: string): Promise<StoredUser | null>;
  getJob(id: string): Promise<StoredJob | null>;
  saveJob(job: StoredJob): Promise<StoredJob>;
  updateJob(id: string, patch: Partial<StoredJob>): Promise<StoredJob | null>;
  createSession(session: Session): Promise<void>;
  getSession(id: string): Promise<Session | null>;
  deleteSession(id: string): Promise<void>;
  publish(jobId: string, event: unknown): Promise<void>;
  subscribe(jobId: string, handler: (event: any) => void): Promise<() => Promise<void>>;
}

function channel(jobId: string) { return `eduswarm:job:${jobId}`; }

class MemoryStore implements Store {
  private users = new Map<string, StoredUser>();
  private jobs = new Map<string, StoredJob>();
  private sessions = new Map<string, Session>();
  private listeners = new Map<string, Set<(event: any) => void>>();

  async connect() {}
  async close() {}
  async getUser(id: string) { return this.users.get(id) || null; }
  async upsertUser(user: StoredUser) { this.users.set(user.id, user); return user; }
  async getUserByProvider(provider: string, subject: string) { return [...this.users.values()].find((user) => user.provider === provider && user.providerSubject === subject) || null; }
  async getJob(id: string) { return this.jobs.get(id) || null; }
  async saveJob(job: StoredJob) { this.jobs.set(job.id, job); return job; }
  async updateJob(id: string, patch: Partial<StoredJob>) { const current = this.jobs.get(id); if (!current) return null; const next = { ...current, ...patch }; this.jobs.set(id, next); return next; }
  async createSession(session: Session) { this.sessions.set(session.id, session); }
  async getSession(id: string) { const session = this.sessions.get(id); if (!session || session.expiresAt <= new Date()) { this.sessions.delete(id); return null; } return session; }
  async deleteSession(id: string) { this.sessions.delete(id); }
  async publish(jobId: string, event: unknown) { this.listeners.get(jobId)?.forEach((handler) => handler(event)); }
  async subscribe(jobId: string, handler: (event: any) => void) { const listeners = this.listeners.get(jobId) || new Set(); listeners.add(handler); this.listeners.set(jobId, listeners); return async () => { listeners.delete(handler); }; }
}

class MongoRedisStore implements Store {
  private mongo: MongoClient;
  private database!: ReturnType<MongoClient['db']>;
  private publisher!: RedisClientType;
  private redisUrl: string;

  constructor(private mongoUrl: string, redisUrl: string) { this.mongo = new MongoClient(mongoUrl); this.redisUrl = redisUrl; }
  async connect() {
    await this.mongo.connect();
    this.database = this.mongo.db();
    await this.database.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    await this.database.collection('users').createIndex({ provider: 1, providerSubject: 1 }, { unique: true, sparse: true });
    this.publisher = createClient({ url: this.redisUrl });
    await this.publisher.connect();
  }
  async close() { await this.publisher?.quit(); await this.mongo.close(); }
  async getUser(id: string) { return await this.database.collection<StoredUser>('users').findOne({ id }, { projection: { _id: 0 } }); }
  async upsertUser(user: StoredUser) { await this.database.collection<StoredUser>('users').replaceOne({ id: user.id }, user, { upsert: true }); return user; }
  async getUserByProvider(provider: string, subject: string) { return await this.database.collection<StoredUser>('users').findOne({ provider, providerSubject: subject }, { projection: { _id: 0 } }); }
  async getJob(id: string) { return await this.database.collection<StoredJob>('jobs').findOne({ id }, { projection: { _id: 0 } }); }
  async saveJob(job: StoredJob) { await this.database.collection<StoredJob>('jobs').replaceOne({ id: job.id }, job, { upsert: true }); return job; }
  async updateJob(id: string, patch: Partial<StoredJob>) { const result = await this.database.collection<StoredJob>('jobs').findOneAndUpdate({ id }, { $set: patch }, { returnDocument: 'after', projection: { _id: 0 } }); return result || null; }
  async createSession(session: Session) { await this.database.collection<Session>('sessions').insertOne(session); }
  async getSession(id: string) { return await this.database.collection<Session>('sessions').findOne({ id }, { projection: { _id: 0 } }); }
  async deleteSession(id: string) { await this.database.collection<Session>('sessions').deleteOne({ id }); }
  async publish(jobId: string, event: unknown) { await this.publisher.publish(channel(jobId), JSON.stringify(event)); }
  async subscribe(jobId: string, handler: (event: any) => void) {
    const subscriber = this.publisher.duplicate();
    await subscriber.connect();
    await subscriber.subscribe(channel(jobId), (payload) => handler(JSON.parse(payload)));
    return async () => { await subscriber.unsubscribe(channel(jobId)); await subscriber.quit(); };
  }
}

export function createStore() {
  const mongoUrl = process.env.MONGODB_URI;
  const redisUrl = process.env.REDIS_URL;
  if (mongoUrl && redisUrl) return new MongoRedisStore(mongoUrl, redisUrl);
  if (process.env.NODE_ENV === 'production') throw new Error('MONGODB_URI and REDIS_URL are required in production');
  return new MemoryStore();
}

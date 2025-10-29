import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  private client: Redis;
  private ttlSeconds: number;

  constructor() {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);
    this.ttlSeconds = parseInt(process.env.CACHE_TTL_SECONDS || '120', 10);
    this.client = new Redis({ host, port });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.client.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds || this.ttlSeconds);
    } catch {}
  }

  async del(key: string | string[]): Promise<void> {
    try {
      if (Array.isArray(key)) await this.client.del(...key);
      else await this.client.del(key);
    } catch {}
  }

  async keys(pattern: string): Promise<string[]> {
    try { return await this.client.keys(pattern); } catch { return []; }
  }

  // Helpers
  propertyKey(id: string) { return `prop:${id}`; }
  dashboardKey(landlordId: string) { return `dash:${landlordId}`; }
  userKey(id: string) { return `user:${id}`; }
}



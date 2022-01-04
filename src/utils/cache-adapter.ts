import { Redis } from '../redis';

export class CacheAdapter {
  constructor(private redis: Redis) { }

  get = async (key: string): Promise<string | undefined> => this.redis.GET(key);

  set = async (key: string, value: string, global?: boolean): Promise<void> => this.redis.SET(key, value, global);

  delete = async (key: string, global?: boolean): Promise<number> => this.redis.DELETE(key, global);

  expireAt = async (key: string, timestamp: number, global?: boolean): Promise<number> => this.redis.EXPIREAT(key, timestamp, global);
}

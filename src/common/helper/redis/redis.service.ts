import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';

import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async set(key, value, time) {
    await this.cacheManager.set(key, value, time);
  }

  async get(key) {
    return this.cacheManager.get(key);
  }

  async del(key) {
    return this.cacheManager.del(key);
  }
}

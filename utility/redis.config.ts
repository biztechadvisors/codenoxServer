// src/redis.config.ts
import { CacheModuleOptions, CacheOptionsFactory, CacheStore } from '@nestjs/cache-manager';
import { Logger } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';

export class RedisConfigService implements CacheOptionsFactory {
    createCacheOptions(): CacheModuleOptions {
        return {
            store: redisStore as unknown as CacheStore,
            host: 'localhost',
            port: 6379,
            ttl: 300,
            // isCacheableValue: (value) => {
            //     const logger = new Logger('CacheModule');
            //     logger.debug(`Cacheable value: ${JSON.stringify(value)}`);
            //     return value !== null && value !== undefined;
            // },
            max: 100, // Maximum number of items in cache
        };
    }
}
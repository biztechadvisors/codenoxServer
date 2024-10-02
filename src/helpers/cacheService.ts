import { Injectable, Logger, OnModuleDestroy, OnModuleInit, Global } from '@nestjs/common';
import { RedisClientType, createClient } from 'redis';

@Global() // Ensure the service is globally available as a singleton
@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
    private static redisClient: RedisClientType; // Static to ensure single instance
    private readonly logger = new Logger(CacheService.name);

    constructor() {
        if (!CacheService.redisClient) {
            // Initialize Redis client if it hasn't been initialized yet
            CacheService.redisClient = createClient({
                url: 'redis://13.201.120.89:17505',
                password: '9JpiQLbOfi7xXq9dPdpSbD0iOW4bgT5g',
            });

            CacheService.redisClient.on('error', (err) => this.logger.error('Redis Client Error', err));
        }
    }

    async onModuleInit(): Promise<void> {
        if (!CacheService.redisClient.isOpen) {
            try {
                await CacheService.redisClient.connect();
                this.logger.log('Redis connected successfully');
            } catch (err) {
                this.logger.error('Redis Connection Error', err);
            }
        }
    }

    async onModuleDestroy(): Promise<void> {
        // Gracefully close the Redis connection when the module is destroyed
        if (CacheService.redisClient.isOpen) {
            await CacheService.redisClient.quit();
            this.logger.log('Redis connection closed');
        }
    }

    async invalidateCacheBySubstring(substring: string): Promise<void> {
        this.logger.log(`Searching for cache keys containing: ${substring}`);

        try {
            const keys = await this.getMatchingKeys(substring);
            this.logger.log(`Cache keys found: ${JSON.stringify(keys)}`);

            if (keys.length > 0) {
                await Promise.all(keys.map((key) => CacheService.redisClient.del(key)));
                this.logger.log(`Deleted cache keys: ${JSON.stringify(keys)}`);
            } else {
                this.logger.log(`No cache keys found containing the substring: ${substring}`);
            }
        } catch (error) {
            this.logger.error(`Error while invalidating cache: ${error.message}`);
            throw new Error(`Cache invalidation failed: ${error.message}`);
        }
    }

    async getMatchingKeys(substring: string): Promise<string[]> {
        try {
            const pattern = `*${substring}*`;
            let cursor = 0;
            const keys: string[] = [];

            do {
                const result = await CacheService.redisClient.scan(cursor, {
                    MATCH: pattern,
                    COUNT: 100,
                });
                cursor = Number(result.cursor);
                keys.push(...result.keys);
            } while (cursor !== 0);

            return keys;
        } catch (error) {
            this.logger.error(`Error while fetching keys: ${error.message}`);
            throw new Error(`Failed to retrieve matching keys: ${error.message}`);
        }
    }
}

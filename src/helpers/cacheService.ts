import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
    private readonly logger = new Logger(CacheService.name);

    constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) { }

    async invalidateCacheBySubstring(substring: string): Promise<void> {
        this.logger.log(`Searching for cache keys containing: ${substring}`);

        try {
            const keys = await this.getMatchingKeys(substring);
            this.logger.log(`Cache keys found: ${JSON.stringify(keys)}`);

            if (keys.length > 0) {
                await Promise.all(keys.map((key) => this.cacheManager.del(key)));
                this.logger.log(`Deleted cache keys: ${JSON.stringify(keys)}`);
            } else {
                this.logger.log(`No cache keys found containing the substring: ${substring}`);
            }
        } catch (error) {
            this.logger.error(`Error while invalidating cache: ${error.message}`);
            throw new Error(`Cache invalidation failed: ${error.message}`);
        }
    }

    private async getMatchingKeys(substring: string): Promise<string[]> {
        try {
            const pattern = `*${substring}*`;
            const keys = await this.cacheManager.store.keys(pattern);
            return keys;
        } catch (error) {
            this.logger.error(`Error while fetching keys: ${error.message}`);
            throw new Error(`Failed to retrieve matching keys: ${error.message}`);
        }
    }
}

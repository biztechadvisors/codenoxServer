import { Injectable, Logger } from '@nestjs/common';
import { RedisClientType, createClient } from 'redis';

@Injectable()
export class CacheService {
    private redisClient: RedisClientType;
    private readonly logger = new Logger(CacheService.name);

    constructor() {
        // Initialize Redis client with the correct protocol
        this.redisClient = createClient({
            url: 'redis://redis-17505.c301.ap-south-1-1.ec2.redns.redis-cloud.com:17505', // Ensure the URL starts with 'redis://'
            password: '9JpiQLbOfi7xXq9dPdpSbD0iOW4bgT5g', // Include password if required
        });

        this.redisClient.on('error', (err) => this.logger.error('Redis Client Error', err));
        this.redisClient.connect().catch((err) => this.logger.error('Redis Connection Error', err));
    }

    // Function to invalidate cache by substring
    async invalidateCacheBySubstring(substring: string): Promise<void> {
        this.logger.log(`Searching for cache keys containing: ${substring}`);

        try {
            // Fetch keys that match the given substring pattern
            const keys = await this.getMatchingKeys(substring);
            this.logger.log(`Cache keys found: ${JSON.stringify(keys)}`);

            // If matching keys are found, delete them
            if (keys.length > 0) {
                await Promise.all(keys.map((key) => this.redisClient.del(key)));
                this.logger.log(`Deleted cache keys: ${JSON.stringify(keys)}`);
            } else {
                this.logger.log(`No cache keys found containing the substring: ${substring}`);
            }
        } catch (error) {
            this.logger.error(`Error while invalidating cache: ${error.message}`);
            throw new Error(`Cache invalidation failed: ${error.message}`);
        }
    }

    // Function to get matching keys using Redis 'scan' method
    async getMatchingKeys(substring: string): Promise<string[]> {
        try {
            // Ensure the pattern doesn't include special characters that can break pattern matching
            const pattern = `*${substring}*`;

            let cursor = 0; // Initialize cursor as a number
            const keys: string[] = [];

            // Use Redis SCAN to find keys in batches
            do {
                const result = await this.redisClient.scan(cursor, {
                    MATCH: pattern,
                    COUNT: 100, // Scan 100 keys per iteration
                });
                cursor = Number(result.cursor); // Update the cursor as a number
                keys.push(...result.keys); // Collect matching keys
            } while (cursor !== 0); // Stop when cursor is 0, indicating the scan is complete

            return keys;
        } catch (error) {
            this.logger.error(`Error while fetching keys: ${error.message}`);
            throw new Error(`Failed to retrieve matching keys: ${error.message}`);
        }
    }
}

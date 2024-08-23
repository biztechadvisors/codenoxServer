import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class SessionService {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private jwtService: JwtService,
    ) { }

    async storeSession(userId: number, sessionToken: string) {
        const payload = this.jwtService.decode(sessionToken) as any;
        if (payload && payload.exp) {
            const ttl = payload.exp - Math.floor(Date.now() / 1000);

            await this.cacheManager.set(`session:${userId}`, sessionToken, ttl);
            console.log(`Stored session for user ${userId} with token ${sessionToken}`);
        } else {
            throw new Error('Invalid session token payload');
        }
    }

    async validateSession(userId: number, sessionToken: string): Promise<boolean> {
        const storedToken = await this.cacheManager.get<string>(`session:${userId}`);
        console.log(`Validating session for user ${userId}. Stored token: ${storedToken}, Provided token: ${sessionToken}`);
        return storedToken === sessionToken;
    }

    async invalidateSession(userId: number) {
        await this.cacheManager.del(`session:${userId}`);
        console.log(`Invalidated session for user ${userId}`);
    }
}

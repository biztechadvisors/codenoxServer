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
        const expiration = payload.exp - Math.floor(Date.now() / 1000);

        await this.cacheManager.set(`session:${userId}`, sessionToken, expiration);
    }

    async validateSession(userId: number, sessionToken: string): Promise<boolean> {
        const storedToken = await this.cacheManager.get(`session:${userId}`);
        return storedToken === sessionToken;
    }

    async invalidateSession(userId: number) {
        await this.cacheManager.del(`session:${userId}`);
    }
}

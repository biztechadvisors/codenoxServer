import { Cache } from 'cache-manager';
import { JwtService } from '@nestjs/jwt';
export declare class SessionService {
    private cacheManager;
    private jwtService;
    constructor(cacheManager: Cache, jwtService: JwtService);
    storeSession(userId: number, sessionToken: string): Promise<void>;
    validateSession(userId: number, sessionToken: string): Promise<boolean>;
    invalidateSession(userId: number): Promise<void>;
}

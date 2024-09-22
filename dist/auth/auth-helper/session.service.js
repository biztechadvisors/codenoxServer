"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const jwt_1 = require("@nestjs/jwt");
let SessionService = class SessionService {
    constructor(cacheManager, jwtService) {
        this.cacheManager = cacheManager;
        this.jwtService = jwtService;
    }
    async storeSession(userId, sessionToken) {
        const payload = this.jwtService.decode(sessionToken);
        if (payload && payload.exp) {
            const ttl = payload.exp - Math.floor(Date.now() / 1000);
            await this.cacheManager.set(`session:${userId}`, sessionToken, ttl);
            console.log(`Stored session for user ${userId} with token ${sessionToken}`);
        }
        else {
            throw new Error('Invalid session token payload');
        }
    }
    async validateSession(userId, sessionToken) {
        const storedToken = await this.cacheManager.get(`session:${userId}`);
        console.log(`Validating session for user ${userId}. Stored token: ${storedToken}, Provided token: ${sessionToken}`);
        return storedToken === sessionToken;
    }
    async invalidateSession(userId) {
        await this.cacheManager.del(`session:${userId}`);
        console.log(`Invalidated session for user ${userId}`);
    }
};
SessionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object, jwt_1.JwtService])
], SessionService);
exports.SessionService = SessionService;
//# sourceMappingURL=session.service.js.map
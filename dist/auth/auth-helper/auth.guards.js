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
exports.AuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const core_1 = require("@nestjs/core");
const auth_meta_1 = require("./auth.meta");
const users_service_1 = require("../../users/users.service");
const auth_service_1 = require("../auth.service");
const session_service_1 = require("./session.service");
let AuthGuard = class AuthGuard {
    constructor(jwtService, reflector, userService, authService, sessionService) {
        this.jwtService = jwtService;
        this.reflector = reflector;
        this.userService = userService;
        this.authService = authService;
        this.sessionService = sessionService;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(auth_meta_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const accessToken = this.extractTokenFromHeader(request);
        if (!accessToken) {
            throw new common_1.UnauthorizedException('Access token not provided');
        }
        try {
            const payload = await this.jwtService.verifyAsync(accessToken, {
                secret: process.env.JWT_ACCESS_SECRET,
            });
            request['user'] = payload;
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp - now < 60) {
                const newAccessToken = await this.refreshAccessToken(request);
                request.res.setHeader('x-access-token', newAccessToken);
            }
        }
        catch (error) {
            if (error.name === 'TokenExpiredError') {
                const newAccessToken = await this.refreshAccessToken(request);
                request.res.setHeader('x-access-token', newAccessToken);
            }
            else {
                console.error('Token verification error:', error.message);
                throw new common_1.UnauthorizedException('Invalid token');
            }
        }
        return true;
    }
    extractTokenFromHeader(request) {
        var _a, _b;
        const [type, token] = (_b = (_a = request.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')) !== null && _b !== void 0 ? _b : [];
        return type === 'Bearer' ? token : undefined;
    }
    async refreshAccessToken(request) {
        const sessionToken = request.headers['x-session-token'];
        if (!sessionToken) {
            throw new common_1.UnauthorizedException('Session token not provided');
        }
        try {
            const sessionPayload = await this.jwtService.verifyAsync(sessionToken, {
                secret: process.env.COOKIES_SECRET,
            });
            const isValidSession = await this.sessionService.validateSession(sessionPayload.sub, sessionToken);
            if (!isValidSession) {
                throw new common_1.UnauthorizedException('Invalid session token');
            }
            const newAccessToken = await this.jwtService.signAsync({
                username: sessionPayload.username,
                sub: sessionPayload.sub,
            }, {
                secret: process.env.JWT_ACCESS_SECRET,
                expiresIn: '4m',
            });
            return newAccessToken;
        }
        catch (error) {
            console.error('Session token error:', error.message);
            throw new common_1.UnauthorizedException('Invalid session token');
        }
    }
};
AuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(users_service_1.UsersService)),
    __param(3, (0, common_1.Inject)(auth_service_1.AuthService)),
    __param(4, (0, common_1.Inject)(session_service_1.SessionService)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        core_1.Reflector,
        users_service_1.UsersService,
        auth_service_1.AuthService,
        session_service_1.SessionService])
], AuthGuard);
exports.AuthGuard = AuthGuard;
//# sourceMappingURL=auth.guards.js.map
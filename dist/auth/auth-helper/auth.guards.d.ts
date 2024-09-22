import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../../users/users.service';
import { AuthService } from '../auth.service';
import { SessionService } from './session.service';
export declare class AuthGuard implements CanActivate {
    private jwtService;
    private reflector;
    private userService;
    private authService;
    private sessionService;
    constructor(jwtService: JwtService, reflector: Reflector, userService: UsersService, authService: AuthService, sessionService: SessionService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractTokenFromHeader;
    private refreshAccessToken;
}

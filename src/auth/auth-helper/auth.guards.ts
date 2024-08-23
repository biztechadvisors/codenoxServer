import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './auth.meta';
import { UsersService } from '../../users/users.service';
import { AuthService } from '../auth.service';
import { SessionService } from './session.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    @Inject(UsersService) private userService: UsersService,
    @Inject(AuthService) private authService: AuthService,
    @Inject(SessionService) private sessionService: SessionService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const accessToken = this.extractTokenFromHeader(request);
    if (!accessToken) {
      throw new UnauthorizedException('Access token not provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(accessToken, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      request['user'] = payload;

      // Optionally handle token refresh if close to expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp - now < 60) { // If access token is expiring soon
        const newAccessToken = await this.refreshAccessToken(request);
        request.res.setHeader('x-access-token', newAccessToken);
      }
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        const newAccessToken = await this.refreshAccessToken(request);
        request.res.setHeader('x-access-token', newAccessToken);
      } else {
        console.error('Token verification error:', error.message);
        throw new UnauthorizedException('Invalid token');
      }
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private async refreshAccessToken(request: Request): Promise<string> {
    const sessionToken = request.headers['x-session-token'] as string;
    if (!sessionToken) {
      throw new UnauthorizedException('Session token not provided');
    }

    try {
      const sessionPayload = await this.jwtService.verifyAsync(sessionToken, {
        secret: process.env.COOKIES_SECRET,
      });

      const isValidSession = await this.sessionService.validateSession(sessionPayload.sub, sessionToken);
      if (!isValidSession) {
        throw new UnauthorizedException('Invalid session token');
      }

      // Issue a new access token only
      const newAccessToken = await this.jwtService.signAsync({
        username: sessionPayload.username,
        sub: sessionPayload.sub,
      }, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '4m',
      });

      return newAccessToken;
    } catch (error) {
      console.error('Session token error:', error.message);
      throw new UnauthorizedException('Invalid session token');
    }
  }
}

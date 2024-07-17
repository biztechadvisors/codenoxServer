import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class NotificationsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(400).send('User ID header missing');
    }
    req['userId'] = userId;
    next();
  }
}

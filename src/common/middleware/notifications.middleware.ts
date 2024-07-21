import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class NotificationsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      console.log('User ID header missing');
      return res.status(400).send('User ID header missing');
    }
    console.log(`User ID from header: ${userId}`);
    req['userId'] = userId;
    next();
  }
}

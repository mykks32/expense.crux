import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Ensures every request carries an `x-request-id` header: reuses the
 * caller's value if present, otherwise generates a UUID. Sets it on both
 * the request (for downstream handlers/{@link RequestId}) and the response
 * (so the caller can correlate their own logs).
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  /**
   * @param req - Incoming request; mutated to guarantee `x-request-id`.
   * @param res - Outgoing response; echoes the same id back.
   * @param next - Continues the middleware chain.
   */
  use(req: Request, res: Response, next: NextFunction): void {
    const requestId = (req.headers['x-request-id'] as string) || uuidv4();

    req.headers['x-request-id'] = requestId;
    res.setHeader('x-request-id', requestId);
    next();
  }
}

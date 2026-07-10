import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

/**
 * Logs one line per request once it finishes: method, URL, status code,
 * duration, and the request's correlation id (set upstream by
 * {@link RequestIdMiddleware}). Must run *after* that middleware in the
 * chain to see the id.
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  /**
   * @param req - Incoming request.
   * @param res - Outgoing response; logging is deferred to its `finish` event.
   * @param next - Continues the middleware chain.
   */
  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;
    const requestId = req.headers['x-request-id'] as string;
    const start = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - start;
      this.logger.log(`[${method}] ${originalUrl} ${statusCode} - ${duration}ms - requestId ${requestId}`);
    });

    next();
  }
}

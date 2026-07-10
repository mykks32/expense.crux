import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Param decorator that reads the per-request correlation id set by
 * {@link RequestIdMiddleware} (`x-request-id` header), for threading into
 * {@link ApiResponseSerializer} responses.
 *
 * @example
 * ```ts
 * login(@RequestId() requestId?: string) { ... }
 * ```
 */
export const RequestId = createParamDecorator(
  /**
   * @param _data - Unused; required by `createParamDecorator`'s signature.
   * @param ctx - The current execution context.
   * @returns The request's correlation id, if one was set.
   */
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.headers['x-request-id'] as string | undefined;
  },
);

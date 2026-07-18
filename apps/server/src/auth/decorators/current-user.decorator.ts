import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { RequestUser } from '../../common/interfaces/request-user.interface';

/**
 * Param decorator that pulls the authenticated user (set by
 * {@link JwtStrategy} via Passport) off the request.
 *
 * @example
 * ```ts
 * findAll(@CurrentUser() user: RequestUser) { ... }
 * ```
 */
export const CurrentUser = createParamDecorator(
  /**
   * @param _data - Unused; required by `createParamDecorator`'s signature.
   * @param ctx - The current execution context.
   * @returns The authenticated user, or `undefined` if no guard ran.
   */
  (_data: unknown, ctx: ExecutionContext): RequestUser | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user;
  },
);

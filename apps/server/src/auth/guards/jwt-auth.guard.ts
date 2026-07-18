import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Route guard that requires a valid `Bearer` access token, delegating to
 * {@link JwtStrategy} (registered under the `'jwt'` Passport strategy name).
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

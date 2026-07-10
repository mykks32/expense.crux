import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RequestUser } from '../../common/interfaces/request-user.interface';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { jwtConfig } from '../../config/jwt.config';

/**
 * Passport strategy that authenticates requests via a `Bearer` access
 * token in the `Authorization` header, verified against the access-token
 * secret (distinct from the refresh-token secret).
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(jwtConfig.KEY) configuration: ConfigType<typeof jwtConfig>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configuration.accessTokenSecret,
    });
  }

  /**
   * Called by Passport once the token's signature and expiry check out.
   * Maps the JWT payload to the shape attached to `request.user`.
   *
   * @param payload - The decoded, verified JWT payload.
   * @returns The authenticated user info exposed via `@CurrentUser()`.
   */
  async validate(payload: JwtPayload): Promise<RequestUser> {
    return { userId: payload.sub, email: payload.email };
  }
}

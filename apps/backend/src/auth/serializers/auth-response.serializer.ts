import { AuthResponse as AuthResponseContract } from '@mykks32/expense-crux-contracts';
import { Expose, Type, plainToInstance } from 'class-transformer';
import { User } from '../entities/user.entity';
import { UserSerializer } from './user.serializer';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Wire shape returned from register/login/refresh: a fresh token pair plus
 * the caller's public profile. Satisfies the shared `AuthResponse` contract.
 */
export class AuthResponseSerializer implements AuthResponseContract {
  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;

  @Expose()
  @Type(() => UserSerializer)
  user: UserSerializer;

  /**
   * Builds an {@link AuthResponseSerializer} from a raw token pair and the
   * user they belong to.
   *
   * @param tokens - The freshly signed access/refresh token pair.
   * @param user - The user the tokens were issued for.
   * @returns The combined, wire-safe auth response.
   */
  static fromEntity(tokens: AuthTokens, user: User): AuthResponseSerializer {
    return plainToInstance(
      AuthResponseSerializer,
      { ...tokens, user: UserSerializer.fromEntity(user) },
      { excludeExtraneousValues: true },
    );
  }
}

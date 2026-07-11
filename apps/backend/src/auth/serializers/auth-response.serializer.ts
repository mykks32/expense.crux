import { AuthResponse as AuthResponseContract } from '@mykks32/expense-crux-contracts';
import { Expose, Type } from 'class-transformer';
import { UserSerializer } from './user.serializer';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/** Wire shape for register/login/refresh: a fresh token pair plus the caller's profile. Build via {@link serialize}, passing `{ ...tokens, user }` with the raw Mongoose `User` doc as `user` — `@Type()` below handles the nested transform. */
export class AuthResponseSerializer implements AuthResponseContract {
  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;

  @Expose()
  @Type(() => UserSerializer)
  user: UserSerializer;
}

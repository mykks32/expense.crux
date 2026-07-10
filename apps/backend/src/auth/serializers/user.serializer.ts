import { User as UserContract } from '@mykks32/expense-crux-contracts';
import { Expose, plainToInstance } from 'class-transformer';
import { User } from '../entities/user.entity';

/**
 * Public, wire-safe view of a {@link User} — never includes `passwordHash`
 * or `refreshTokenHash`. Satisfies the shared `User` contract so mobile can
 * rely on the same shape.
 */
export class UserSerializer implements UserContract {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  name?: string;

  /**
   * Builds a {@link UserSerializer} from a Mongoose `User` document,
   * dropping every field not explicitly `@Expose()`d.
   *
   * @param user - The source user document.
   * @returns The public user view.
   */
  static fromEntity(user: User): UserSerializer {
    return plainToInstance(
      UserSerializer,
      { id: user.id, email: user.email, name: user.name },
      { excludeExtraneousValues: true },
    );
  }
}

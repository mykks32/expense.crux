import { User as UserContract } from '@mykks32/expense-crux-contracts';
import { Expose, Transform } from 'class-transformer';
import { resolveId } from '../../common/utils/serialize.util';

/** Public, wire-safe view of a {@link User} — never includes `passwordHash`/`refreshTokenHash`. Build via {@link serialize} (`common/utils/serialize.util.ts`), passing the Mongoose document straight through. */
export class UserSerializer implements UserContract {
  @Expose()
  @Transform(({ obj }) => resolveId(obj as { _id?: unknown; id?: unknown }))
  id: string;

  @Expose()
  email: string;

  @Expose()
  name?: string;
}

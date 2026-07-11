import { Expense as ExpenseContract } from '@mykks32/expense-crux-contracts';
import { Expose, Transform } from 'class-transformer';
import { resolveId } from '../../common/utils/serialize.util';

/** Public, wire-safe view of an {@link Expense} — never includes the internal `userId` field. Build via {@link serialize} (`common/utils/serialize.util.ts`), passing the Mongoose document straight through. */
export class ExpenseSerializer implements ExpenseContract {
  @Expose()
  @Transform(({ obj }) => resolveId(obj as { _id?: unknown; id?: unknown }))
  id: string;

  @Expose()
  title: string;

  @Expose()
  amount: number;

  @Expose()
  currency: string;

  @Expose()
  category?: string;

  @Expose()
  @Transform(({ value }) => (value as Date).toISOString())
  date: string;

  @Expose()
  notes?: string;
}

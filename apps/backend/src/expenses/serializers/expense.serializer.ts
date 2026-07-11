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

  // Idempotent on purpose: the global ClassSerializerInterceptor (main.ts)
  // re-processes every controller return value, running this @Transform a
  // second time on the already-stringified result — must handle both a real
  // Date (first pass) and an already-ISO string (second pass) without throwing.
  @Expose()
  @Transform(({ value }) => (value instanceof Date ? value.toISOString() : (value as string)))
  date: string;

  @Expose()
  notes?: string;
}

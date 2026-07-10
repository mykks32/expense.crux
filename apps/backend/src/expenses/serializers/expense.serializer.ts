import { Expense as ExpenseContract } from '@mykks32/expense-crux-contracts';
import { Expose, plainToInstance } from 'class-transformer';
import { Expense } from '../entities/expense.entity';

/**
 * Public, wire-safe view of an {@link Expense} — never includes the
 * internal `userId` field. Satisfies the shared `Expense` contract so
 * mobile can rely on the same shape. `date` is serialized as an ISO 8601
 * string, matching the contract's wire format.
 */
export class ExpenseSerializer implements ExpenseContract {
  @Expose()
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
  date: string;

  @Expose()
  notes?: string;

  /**
   * Builds an {@link ExpenseSerializer} from a Mongoose `Expense` document,
   * dropping every field not explicitly `@Expose()`d.
   *
   * @param expense - The source expense document.
   * @returns The public expense view.
   */
  static fromEntity(expense: Expense): ExpenseSerializer {
    return plainToInstance(
      ExpenseSerializer,
      {
        id: expense.id,
        title: expense.title,
        amount: expense.amount,
        currency: expense.currency,
        category: expense.category,
        date: expense.date.toISOString(),
        notes: expense.notes,
      },
      { excludeExtraneousValues: true },
    );
  }
}

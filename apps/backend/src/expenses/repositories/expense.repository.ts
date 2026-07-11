import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Expense } from '../entities/expense.entity';

export interface CreateExpenseData {
  userId: Types.ObjectId;
  title: string;
  amount: number;
  currency?: string;
  category?: string;
  date?: Date;
  notes?: string;
}

export interface PaginatedExpenses {
  items: Expense[];
  total: number;
}

/**
 * Data-access layer for the `Expense` collection. Keeps Mongoose query
 * details out of {@link ExpensesService}.
 */
@Injectable()
export class ExpenseRepository {
  constructor(@InjectModel(Expense.name) private readonly expenseModel: Model<Expense>) {}

  /**
   * Inserts a new expense document.
   *
   * @param data - Expense fields, including the owning `userId`.
   * @returns The created expense document.
   */
  create(data: CreateExpenseData): Promise<Expense> {
    return this.expenseModel.create(data);
  }

  /**
   * Fetches one page of a user's expenses (newest first) alongside the
   * total count across all pages, for building pagination metadata.
   *
   * @param userId - The owning user's id.
   * @param skip - Number of documents to skip.
   * @param limit - Max documents to return.
   * @returns The page of expenses and the total matching count.
   */
  async findAllByUserPaginated(userId: Types.ObjectId, skip: number, limit: number): Promise<PaginatedExpenses> {
    const [items, total] = await Promise.all([
      this.expenseModel.find({ userId }).sort({ date: -1 }).skip(skip).limit(limit),
      this.expenseModel.countDocuments({ userId }),
    ]);

    return { items, total };
  }

  /**
   * Looks up an expense by its Mongo document id, regardless of owner —
   * callers are responsible for verifying ownership (see
   * {@link ExpensesService.getOwnedExpense}).
   *
   * @param id - The expense's `_id` as a string.
   * @returns The matching expense, or `null` if none exists.
   */
  findById(id: string): Promise<Expense | null> {
    return this.expenseModel.findById(id);
  }
}

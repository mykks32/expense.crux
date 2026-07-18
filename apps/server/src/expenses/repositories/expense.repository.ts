import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Expense } from '../entities/expense.entity';
import { escapeRegex } from '../../common/utils/regex.util';
import { parseSortBy } from '../../common/utils/sort.util';

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

export interface ListExpensesFilters {
  category?: string;
  currency?: string;
  search?: string;
  minAmount?: number;
  maxAmount?: number;
  dateFrom?: string;
  dateTo?: string;
  /** Comma-separated "field:order" pairs, e.g. "date:desc,amount:asc". Already validated upstream by the DTO. */
  sortBy?: string;
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
   * Fetches one page of a user's expenses alongside the total count across
   * all pages, for building pagination metadata.
   *
   * @param userId - The owning user's id.
   * @param skip - Number of documents to skip.
   * @param limit - Max documents to return.
   * @param filters - Category/currency/search/amount-range/date-range/sort options.
   * @returns The page of expenses and the total matching count.
   */
  async findAllByUserPaginated(
    userId: Types.ObjectId,
    skip: number,
    limit: number,
    filters: ListExpensesFilters = {},
  ): Promise<PaginatedExpenses> {
    const { category, currency, search, minAmount, maxAmount, dateFrom, dateTo, sortBy } = filters;

    const filter: FilterQuery<Expense> = { userId };
    if (category) filter.category = category;
    if (currency) filter.currency = currency;
    if (search) filter.title = { $regex: escapeRegex(search), $options: 'i' };
    if (minAmount !== undefined || maxAmount !== undefined) {
      filter.amount = {
        ...(minAmount !== undefined && { $gte: minAmount }),
        ...(maxAmount !== undefined && { $lte: maxAmount }),
      };
    }
    if (dateFrom || dateTo) {
      filter.date = {
        ...(dateFrom && { $gte: new Date(dateFrom) }),
        ...(dateTo && { $lte: new Date(dateTo) }),
      };
    }

    const sort = parseSortBy(sortBy, 'date');

    const [items, total] = await Promise.all([
      this.expenseModel.find(filter).sort(sort).skip(skip).limit(limit),
      this.expenseModel.countDocuments(filter),
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

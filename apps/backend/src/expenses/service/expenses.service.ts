import { HttpStatus, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { ExpenseRepository, PaginatedExpenses } from '../repositories/expense.repository';
import { Expense } from '../entities/expense.entity';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { UpdateExpenseDto } from '../dto/update-expense.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { GlobalHttpException } from '../../common/exceptions/global-http.exception';

/**
 * Expense CRUD business logic. Every read/write is scoped to a `userId`,
 * enforced via {@link getOwnedExpense} for anything that targets a single
 * expense by id.
 */
@Injectable()
export class ExpensesService {
  constructor(private readonly expenseRepository: ExpenseRepository) {}

  /**
   * Creates an expense owned by the given user.
   *
   * @param userId - The owning user's id.
   * @param dto - Expense fields to create.
   * @returns The created expense document.
   */
  create(userId: string, dto: CreateExpenseDto): Promise<Expense> {
    return this.expenseRepository.create({
      ...dto,
      userId: new Types.ObjectId(userId),
      date: dto.date ? new Date(dto.date) : undefined,
    });
  }

  /**
   * Lists a page of the user's expenses, most recent first.
   *
   * @param userId - The owning user's id.
   * @param query - Pagination params (`skip`/`limit`).
   * @returns The page of expenses plus the total count across all pages.
   */
  findAll(userId: string, query: PaginationQueryDto): Promise<PaginatedExpenses> {
    return this.expenseRepository.findAllByUserPaginated(
      new Types.ObjectId(userId),
      query.skip,
      query.limit,
    );
  }

  /**
   * Fetches a single expense, verifying it belongs to the user.
   *
   * @param userId - The requesting user's id.
   * @param id - The expense's Mongo id.
   * @returns The matching expense document.
   * @throws {GlobalHttpException} `expenseNotFound` / `expenseForbidden`.
   */
  findOne(userId: string, id: string): Promise<Expense> {
    return this.getOwnedExpense(userId, id);
  }

  /**
   * Partially updates an expense, verifying it belongs to the user first.
   *
   * @param userId - The requesting user's id.
   * @param id - The expense's Mongo id.
   * @param dto - Fields to update (all optional).
   * @returns The updated expense document.
   * @throws {GlobalHttpException} `expenseNotFound` / `expenseForbidden`.
   */
  async update(userId: string, id: string, dto: UpdateExpenseDto): Promise<Expense> {
    const expense = await this.getOwnedExpense(userId, id);
    Object.assign(expense, {
      ...dto,
      date: dto.date ? new Date(dto.date) : expense.date,
    });
    return expense.save();
  }

  /**
   * Deletes an expense, verifying it belongs to the user first.
   *
   * @param userId - The requesting user's id.
   * @param id - The expense's Mongo id.
   * @throws {GlobalHttpException} `expenseNotFound` / `expenseForbidden`.
   */
  async remove(userId: string, id: string): Promise<void> {
    const expense = await this.getOwnedExpense(userId, id);
    await expense.deleteOne();
  }

  /**
   * Loads an expense by id and enforces that it belongs to the given user,
   * so no user can read/modify/delete another user's expense by guessing
   * its id.
   *
   * @param userId - The requesting user's id.
   * @param id - The expense's Mongo id.
   * @returns The owned expense document.
   * @throws {GlobalHttpException} `expenseNotFound` if no such expense
   * exists; `expenseForbidden` if it exists but belongs to another user.
   */
  private async getOwnedExpense(userId: string, id: string): Promise<Expense> {
    const expense = await this.expenseRepository.findById(id);
    if (!expense) {
      throw new GlobalHttpException('expenseNotFound', HttpStatus.NOT_FOUND);
    }
    if (expense.userId.toString() !== userId) {
      throw new GlobalHttpException('expenseForbidden', HttpStatus.FORBIDDEN);
    }
    return expense;
  }
}

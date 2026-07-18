import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RequestUser } from '../../common/interfaces/request-user.interface';
import { RequestId } from '../../common/decorators/request-id.decorator';
import { ApiResponseSerializer } from '../../common/serializers/api-response.serializer';
import { buildPagination } from '../../common/utils/pagination.util';
import { serialize } from '../../common/utils/serialize.util';
import { ExpensesService } from '../service/expenses.service';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { UpdateExpenseDto } from '../dto/update-expense.dto';
import { ListExpensesQueryDto } from '../dto/list-expenses-query.dto';
import { ExpenseSerializer } from '../serializers/expense.serializer';

/**
 * CRUD endpoints for a user's expenses. Every route is JWT-guarded and
 * scoped to the authenticated caller — no expense is visible or mutable
 * across users.
 */
@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  /**
   * Creates a new expense owned by the authenticated user.
   *
   * @param user - The authenticated user.
   * @param dto - Expense fields to create.
   * @param requestId - Correlation id read from the `x-request-id` header.
   * @returns `201 Created` envelope wrapping the new expense.
   */
  @Post()
  async create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateExpenseDto,
    @RequestId() requestId?: string,
  ): Promise<ApiResponseSerializer<ExpenseSerializer>> {
    const expense = await this.expensesService.create(user.userId, dto);
    return ApiResponseSerializer.created(serialize(ExpenseSerializer, expense), { requestId });
  }

  /**
   * Lists the authenticated user's expenses, paginated, with optional
   * category/currency/search/amount-range/date-range filters and sorting.
   *
   * @param user - The authenticated user.
   * @param query - Pagination, filter, and sort params.
   * @param req - The current request, for building absolute links.
   * @param requestId - Correlation id read from the `x-request-id` header.
   * @returns `200 OK` envelope with the page of expenses plus `meta`/`links`.
   */
  @Get()
  async findAll(
    @CurrentUser() user: RequestUser,
    @Query() query: ListExpensesQueryDto,
    @Req() req: Request,
    @RequestId() requestId?: string,
  ): Promise<ApiResponseSerializer<ExpenseSerializer[]>> {
    const { items, total } = await this.expensesService.findAll(user.userId, query);
    const { meta, links } = buildPagination(total, query, req);
    return ApiResponseSerializer.paginated(
      items.map((expense) => serialize(ExpenseSerializer, expense)),
      meta,
      links,
      { requestId },
    );
  }

  /**
   * Fetches a single expense owned by the authenticated user.
   *
   * @param user - The authenticated user.
   * @param id - The expense's Mongo id.
   * @param requestId - Correlation id read from the `x-request-id` header.
   * @returns `200 OK` envelope wrapping the expense.
   * @throws {GlobalHttpException} `expenseNotFound` / `expenseForbidden`.
   */
  @Get(':id')
  async findOne(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @RequestId() requestId?: string,
  ): Promise<ApiResponseSerializer<ExpenseSerializer>> {
    const expense = await this.expensesService.findOne(user.userId, id);
    return ApiResponseSerializer.ok(serialize(ExpenseSerializer, expense), { requestId });
  }

  /**
   * Partially updates an expense owned by the authenticated user.
   *
   * @param user - The authenticated user.
   * @param id - The expense's Mongo id.
   * @param dto - Fields to update (all optional).
   * @param requestId - Correlation id read from the `x-request-id` header.
   * @returns `200 OK` envelope wrapping the updated expense.
   * @throws {GlobalHttpException} `expenseNotFound` / `expenseForbidden`.
   */
  @Patch(':id')
  async update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
    @RequestId() requestId?: string,
  ): Promise<ApiResponseSerializer<ExpenseSerializer>> {
    const expense = await this.expensesService.update(user.userId, id, dto);
    return ApiResponseSerializer.ok(serialize(ExpenseSerializer, expense), { requestId });
  }

  /**
   * Deletes an expense owned by the authenticated user.
   *
   * @param user - The authenticated user.
   * @param id - The expense's Mongo id.
   * @returns Resolves with no body (`204 No Content`).
   * @throws {GlobalHttpException} `expenseNotFound` / `expenseForbidden`.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string): Promise<void> {
    return this.expensesService.remove(user.userId, id);
  }
}

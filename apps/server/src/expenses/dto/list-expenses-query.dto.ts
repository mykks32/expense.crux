import { EXPENSE_SORT_FIELDS, ListExpensesQuery, SORT_ORDERS } from '@mykks32/expense-crux-contracts';
import { Transform } from 'class-transformer';
import { IsISO8601, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

/** Regex for the `sortBy` query param: comma-separated "field:order" pairs, e.g. "date:desc,amount:asc". Built from the shared field/order lists so it can't drift from what the mobile filter UI offers. */
const fields = EXPENSE_SORT_FIELDS.join('|');
const orders = SORT_ORDERS.join('|');
export const SORT_BY_PATTERN = new RegExp(`^(${fields}):(${orders})(,(${fields}):(${orders}))*$`, 'i');

/** Pagination params plus filtering/search/sort options for `GET /expenses`. */
export class ListExpensesQueryDto extends PaginationQueryDto implements ListExpensesQuery {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  /** Case-insensitive partial match against `title`. */
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value))
  minAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value))
  maxAmount?: number;

  @IsOptional()
  @IsISO8601()
  dateFrom?: string;

  @IsOptional()
  @IsISO8601()
  dateTo?: string;

  @IsOptional()
  @IsString()
  @Matches(SORT_BY_PATTERN, {
    message: `sortBy must be comma-separated "field:order" pairs, e.g. "date:desc,amount:asc" (fields: ${EXPENSE_SORT_FIELDS.join(', ')}; orders: ${SORT_ORDERS.join(', ')})`,
  })
  sortBy?: string;
}

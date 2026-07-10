import { PaginationMeta } from '@mykks32/expense-crux-contracts';
import { Expose } from 'class-transformer';

/**
 * Pagination metadata attached to `ApiResponseSerializer.meta` for list
 * endpoints. Built by {@link buildPagination}.
 */
export class PaginationMetaSerializer implements PaginationMeta {
  @Expose()
  totalItems: number;

  @Expose()
  itemsPerPage: number;

  @Expose()
  totalPages: number;

  @Expose()
  page: number;
}

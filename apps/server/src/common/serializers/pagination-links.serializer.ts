import { PaginationLinks } from '@mykks32/expense-crux-contracts';
import { Expose } from 'class-transformer';

/**
 * Navigation links attached to `ApiResponseSerializer.links` for list
 * endpoints. Built by {@link buildPagination}.
 */
export class PaginationLinksSerializer implements PaginationLinks {
  @Expose()
  current: string;

  @Expose()
  next: string | null;

  @Expose()
  previous: string | null;
}

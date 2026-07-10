import type { Request } from 'express';
import { PaginationLinksSerializer } from '../serializers/pagination-links.serializer';
import { PaginationMetaSerializer } from '../serializers/pagination-meta.serializer';
import { PaginationQueryDto } from '../dto/pagination-query.dto';

export interface PaginationResult {
  meta: PaginationMetaSerializer;
  links: PaginationLinksSerializer;
}

/**
 * Builds an absolute URL for the given request, preserving its existing
 * query params and overriding only `page`/`limit`.
 *
 * @param req - The current request, used for scheme, host, path, and query.
 * @param page - The page number to link to.
 * @param limit - The page size to link to.
 * @returns The fully qualified URL for that page.
 */
function linkFor(req: Request, page: number, limit: number): string {
  const origin = `${req.protocol}://${req.get('host')}`;
  const url = new URL(req.originalUrl, origin);
  url.searchParams.set('page', String(page));
  url.searchParams.set('limit', String(limit));
  return url.toString();
}

/**
 * Derives pagination `meta` (counts) and `links` (navigation URLs) for a
 * list endpoint's response, for use with `ApiResponseSerializer.paginated()`.
 *
 * @param totalItems - Total matching rows across all pages, not just the
 * current slice.
 * @param query - The pagination query params captured from the request.
 * @param req - The current request, used to build fully qualified links.
 * @returns The computed `meta` and `links`.
 */
export function buildPagination(
  totalItems: number,
  query: PaginationQueryDto,
  req: Request,
): PaginationResult {
  const { page, limit } = query;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  const meta = new PaginationMetaSerializer();
  meta.totalItems = totalItems;
  meta.itemsPerPage = limit;
  meta.totalPages = totalPages;
  meta.page = page;

  const links = new PaginationLinksSerializer();
  links.current = linkFor(req, page, limit);
  links.next = page < totalPages ? linkFor(req, page + 1, limit) : null;
  links.previous = page > 1 ? linkFor(req, page - 1, limit) : null;

  return { meta, links };
}

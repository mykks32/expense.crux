import { ApiResponse as ApiResponseContract } from '@mykks32/expense-crux-contracts';
import { Expose, Type } from 'class-transformer';
import { serialize } from '../utils/serialize.util';
import { PaginationLinksSerializer } from './pagination-links.serializer';
import { PaginationMetaSerializer } from './pagination-meta.serializer';

/**
 * Standard envelope every controller response is wrapped in — `success`,
 * `message`, `statusCode`, `data`, plus optional pagination `meta`/`links`
 * and error info. Satisfies the shared `ApiResponse<T>` contract. Build
 * instances via the static factories ({@link ok}, {@link created},
 * {@link error}, {@link paginated}) rather than the constructor.
 */
export class ApiResponseSerializer<T> implements ApiResponseContract<T> {
  @Expose()
  success: boolean;

  @Expose()
  message: string;

  @Expose()
  statusCode: number;

  @Expose()
  data?: T;

  @Expose()
  @Type(() => PaginationMetaSerializer)
  meta?: PaginationMetaSerializer;

  @Expose()
  @Type(() => PaginationLinksSerializer)
  links?: PaginationLinksSerializer;

  @Expose()
  errorName?: string;

  @Expose()
  timestamp: string;

  @Expose()
  requestId?: string;

  /**
   * Wraps a successful single-item or list result.
   *
   * @param data - The payload to return.
   * @param options.message - Defaults to `'Success'`.
   * @param options.statusCode - Defaults to `200`.
   * @param options.requestId - Correlation id to echo back.
   * @returns The envelope with `success: true`.
   */
  static ok<R>(
    data: R,
    options: { message?: string; statusCode?: number; requestId?: string } = {},
  ): ApiResponseSerializer<R> {
    const { message = 'Success', statusCode = 200, requestId } = options;
    return serialize(ApiResponseSerializer, {
      success: true,
      message,
      statusCode,
      data,
      timestamp: new Date().toISOString(),
      requestId,
    }) as ApiResponseSerializer<R>;
  }

  /**
   * Convenience wrapper for `201 Created` responses.
   * Equivalent to {@link ok} with `statusCode: 201`.
   *
   * @param data - The newly created resource.
   * @param options.message - Defaults to `'Created'`.
   * @param options.requestId - Correlation id to echo back.
   * @returns The envelope with `success: true`, `statusCode: 201`.
   */
  static created<R>(data: R, options: { message?: string; requestId?: string } = {}): ApiResponseSerializer<R> {
    return ApiResponseSerializer.ok(data, {
      ...options,
      message: options.message ?? 'Created',
      statusCode: 201,
    });
  }

  /**
   * Wraps an error outcome. Normally you should throw a
   * {@link GlobalHttpException} and let {@link HttpExceptionFilter} call
   * this for you — call directly only when you need an error body without
   * throwing.
   *
   * @param options.errorName - Machine-readable error code for client branching.
   * @param options.message - Human-readable error description.
   * @param options.statusCode - Defaults to `500`.
   * @param options.requestId - Correlation id to echo back.
   * @returns The envelope with `success: false`, `data: null`.
   */
  static error(options: {
    errorName?: string;
    message: string;
    statusCode?: number;
    requestId?: string;
  }): ApiResponseSerializer<null> {
    const { errorName, message, statusCode = 500, requestId } = options;
    return serialize(ApiResponseSerializer, {
      success: false,
      errorName,
      message,
      statusCode,
      data: null,
      timestamp: new Date().toISOString(),
      requestId,
    }) as ApiResponseSerializer<null>;
  }

  /**
   * Wraps a paginated list result with `meta` and `links`.
   *
   * @param items - The current page of items.
   * @param meta - Pagination metadata (see {@link buildPagination}).
   * @param links - Pagination links (see {@link buildPagination}).
   * @param options.message - Defaults to `'Success'`.
   * @param options.statusCode - Defaults to `200`.
   * @param options.requestId - Correlation id to echo back.
   * @returns The envelope with `success: true` and `meta`/`links` populated.
   */
  static paginated<R>(
    items: R[],
    meta: PaginationMetaSerializer,
    links: PaginationLinksSerializer,
    options: { message?: string; statusCode?: number; requestId?: string } = {},
  ): ApiResponseSerializer<R[]> {
    const { message = 'Success', statusCode = 200, requestId } = options;
    return serialize(ApiResponseSerializer, {
      success: true,
      message,
      statusCode,
      data: items,
      meta,
      links,
      timestamp: new Date().toISOString(),
      requestId,
    }) as ApiResponseSerializer<R[]>;
  }
}

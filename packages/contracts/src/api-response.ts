export interface PaginationMeta {
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationLinks {
  current: string;
  next: string | null;
  previous: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  data?: T;
  meta?: PaginationMeta;
  links?: PaginationLinks;
  errorName?: string;
  timestamp: string;
  requestId?: string;
}

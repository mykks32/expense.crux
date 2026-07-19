import { useCallback, useState } from 'react';

interface UsePaginationResult {
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

/** Page/page-size state for a paginated list. Changing the page size jumps back to page 1. */
export function usePagination(initialPageSize: number): UsePaginationResult {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPage(1);
  }, []);

  return { page, pageSize, setPage, setPageSize };
}

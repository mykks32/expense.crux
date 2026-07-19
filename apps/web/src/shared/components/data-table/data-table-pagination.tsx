import type { PaginationMeta } from '@mykks32/expense-crux-contracts';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50];

interface DataTablePaginationProps {
  meta?: PaginationMeta;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function DataTablePagination({
  meta,
  pageSize,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) {
  if (!meta || meta.totalItems === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-4 border-t pt-3">
      <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
        <SelectTrigger size="sm" className="w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {pageSizeOptions.map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size} / page
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="ghost" size="icon" disabled={!meta.hasPreviousPage} onClick={() => onPageChange(meta.page - 1)}>
        <ChevronLeftIcon />
      </Button>
      <span className="text-muted-foreground text-sm">
        Page {meta.page} of {meta.totalPages}
      </span>
      <Button variant="ghost" size="icon" disabled={!meta.hasNextPage} onClick={() => onPageChange(meta.page + 1)}>
        <ChevronRightIcon />
      </Button>
    </div>
  );
}

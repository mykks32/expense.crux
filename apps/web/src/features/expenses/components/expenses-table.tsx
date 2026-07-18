import { useMemo } from 'react';
import type { Expense, PaginationMeta } from '@mykks32/expense-crux-contracts';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

interface ExpensesTableProps {
  items: Expense[];
  meta?: PaginationMeta;
  isLoading: boolean;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSelect: (id: string) => void;
}

const columnHelper = createColumnHelper<Expense>();

const columns = [
  columnHelper.accessor('title', {
    header: 'Title',
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  columnHelper.accessor('category', {
    header: 'Category',
    cell: (info) => <span className="text-muted-foreground">{info.getValue() ?? '—'}</span>,
  }),
  columnHelper.accessor('date', {
    header: 'Date',
    cell: (info) => <span className="text-muted-foreground">{new Date(info.getValue()).toLocaleDateString()}</span>,
  }),
  columnHelper.display({
    id: 'amount',
    header: 'Amount',
    cell: ({ row }) => (
      <span>
        {row.original.amount.toFixed(2)} {row.original.currency}
      </span>
    ),
  }),
];

export function ExpensesTable({ items, meta, isLoading, pageSize, onPageChange, onPageSizeChange, onSelect }: ExpensesTableProps) {
  const isPaginationVisible = !!meta && meta.totalItems > 0;

  const data = useMemo(() => items, [items]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: meta?.totalPages ?? -1,
  });

  return (
    <div className="flex flex-col gap-3">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className={header.column.id === 'amount' ? 'text-right' : undefined}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 && !isLoading && (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-muted-foreground h-24 text-center">
                No expenses match — add one to get started.
              </TableCell>
            </TableRow>
          )}
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="cursor-pointer" onClick={() => onSelect(row.original.id)}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className={cell.column.id === 'amount' ? 'text-right' : undefined}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {isPaginationVisible && meta && (
        <div className="flex items-center justify-center gap-4 border-t pt-3">
          <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
            <SelectTrigger size="sm" className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
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
      )}
    </div>
  );
}

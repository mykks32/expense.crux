import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { DataTableEmpty } from './data-table-empty';
import { DataTableLoading } from './data-table-loading';

interface DataTableProps<TData> {
  // Declare a module's column array as ColumnDef<TData>[] (not via createColumnHelper —
  // its per-column TValue inference doesn't unify across a heterogeneous array). Alignment/
  // width/etc. are the column def's own concern — bake them into its header/cell JSX rather
  // than threading per-column style hooks through this component.
  columns: ColumnDef<TData>[];
  data: TData[];
  isLoading?: boolean;
  pageCount?: number;
  emptyMessage?: string;
  onRowClick?: (row: TData) => void;
}

/** Headless, column-def-driven table — manual pagination only, no built-in sorting/filtering. Pair with DataTableToolbar/DataTablePagination for a full list view. */
export function DataTable<TData>({ columns, data, isLoading, pageCount, emptyMessage, onRowClick }: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: pageCount ?? -1,
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <DataTableLoading columnCount={columns.length} />
        ) : table.getRowModel().rows.length === 0 ? (
          <DataTableEmpty columnCount={columns.length} message={emptyMessage} />
        ) : (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className={onRowClick ? 'cursor-pointer' : undefined} onClick={() => onRowClick?.(row.original)}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

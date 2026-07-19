import type { Expense, PaginationMeta } from '@mykks32/expense-crux-contracts';

import { DataTable, DataTablePagination } from '@/shared/components/data-table';
import { expenseColumns } from '../tables/expense-columns';

interface ExpensesTableProps {
  items: Expense[];
  meta?: PaginationMeta;
  isLoading: boolean;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSelect: (id: string) => void;
}

export function ExpensesTable({ items, meta, isLoading, pageSize, onPageChange, onPageSizeChange, onSelect }: ExpensesTableProps) {
  return (
    <div className="flex flex-col gap-3">
      <DataTable
        columns={expenseColumns}
        data={items}
        isLoading={isLoading}
        pageCount={meta?.totalPages}
        emptyMessage="No expenses match — add one to get started."
        onRowClick={(expense) => onSelect(expense.id)}
      />
      <DataTablePagination meta={meta} pageSize={pageSize} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />
    </div>
  );
}

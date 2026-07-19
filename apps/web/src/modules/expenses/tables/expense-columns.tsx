import type { Expense } from '@mykks32/expense-crux-contracts';
import type { ColumnDef } from '@tanstack/react-table';

// Typed directly as ColumnDef<Expense>[] (rather than via createColumnHelper, whose
// per-column TValue inference doesn't unify across a heterogeneous array) — cell renderers
// recover the concrete value type with getValue<T>() instead.
export const expenseColumns: ColumnDef<Expense>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    cell: (info) => <span className="font-medium">{info.getValue<string>()}</span>,
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: (info) => <span className="text-muted-foreground">{info.getValue<string | null>() ?? '—'}</span>,
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: (info) => <span className="text-muted-foreground">{new Date(info.getValue<string>()).toLocaleDateString()}</span>,
  },
  {
    id: 'amount',
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => (
      <div className="text-right">
        {row.original.amount.toFixed(2)} {row.original.currency}
      </div>
    ),
  },
];

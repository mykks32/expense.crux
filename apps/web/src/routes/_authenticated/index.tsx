import { createFileRoute } from '@tanstack/react-router';

import { ExpensesListPage } from '@/features/expenses';

export const Route = createFileRoute('/_authenticated/')({
  component: ExpensesListPage,
});

import { createFileRoute } from '@tanstack/react-router';

import { ExpensesListPage } from '@/modules/expenses';

export const Route = createFileRoute('/_authenticated/')({
  component: ExpensesListPage,
});

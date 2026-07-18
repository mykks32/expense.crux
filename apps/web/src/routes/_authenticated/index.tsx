import { createFileRoute } from '@tanstack/react-router';

import { ExpensesListPage } from '@/features/expenses/pages/expenses-list-page';

export const Route = createFileRoute('/_authenticated/')({
  component: ExpensesListPage,
});

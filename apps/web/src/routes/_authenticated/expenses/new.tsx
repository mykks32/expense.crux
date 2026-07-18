import { createFileRoute } from '@tanstack/react-router';

import { NewExpensePage } from '@/features/expenses/pages/new-expense-page';

export const Route = createFileRoute('/_authenticated/expenses/new')({
  component: NewExpensePage,
});

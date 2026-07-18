import { createFileRoute } from '@tanstack/react-router';

import { NewExpensePage } from '@/features/expenses';

export const Route = createFileRoute('/_authenticated/expenses/new')({
  component: NewExpensePage,
});

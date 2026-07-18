import { createFileRoute } from '@tanstack/react-router';

import { EditExpensePage } from '@/features/expenses/pages/edit-expense-page';

export const Route = createFileRoute('/_authenticated/expenses/$expenseId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { expenseId } = Route.useParams();
  return <EditExpensePage expenseId={expenseId} />;
}

import { createFileRoute } from '@tanstack/react-router';

import { EditExpensePage } from '@/modules/expenses';

export const Route = createFileRoute('/_authenticated/expenses/$expenseId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { expenseId } = Route.useParams();
  return <EditExpensePage expenseId={expenseId} />;
}

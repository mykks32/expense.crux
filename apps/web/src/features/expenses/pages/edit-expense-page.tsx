import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { FullPageSpinner } from '@/components/shared/full-page-spinner';
import { getApiErrorMessage } from '@/lib/api';
import * as expensesApi from '@/features/expenses/api';
import { ExpenseForm } from '@/features/expenses/components/expense-form';
import type { ExpenseFormValues } from '@/features/expenses/schema';

interface EditExpensePageProps {
  expenseId: string;
}

export function EditExpensePage({ expenseId }: EditExpensePageProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: expense, isLoading } = useQuery({
    queryKey: ['expenses', expenseId],
    queryFn: () => expensesApi.getExpense(expenseId),
  });

  const updateMutation = useMutation({
    mutationFn: (values: ExpenseFormValues) =>
      expensesApi.updateExpense(expenseId, {
        title: values.title,
        amount: Number(values.amount),
        currency: values.currency || undefined,
        category: values.category || undefined,
        date: values.date || undefined,
        notes: values.notes || undefined,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['expenses'] });
      await navigate({ to: '/' });
      toast.success('Changes saved');
    },
  });

  const handleDelete = async () => {
    if (!window.confirm('Delete this expense? This cannot be undone.')) {
      return;
    }
    setIsDeleting(true);
    try {
      await expensesApi.deleteExpense(expenseId);
      await queryClient.invalidateQueries({ queryKey: ['expenses'] });
      await navigate({ to: '/' });
      toast.success('Expense deleted');
    } catch (err) {
      setIsDeleting(false);
      toast.error(getApiErrorMessage(err));
    }
  };

  if (isLoading || !expense) {
    return <FullPageSpinner />;
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-xl font-semibold">Edit expense</h1>
      <ExpenseForm
        submitLabel="Save changes"
        isSubmitting={updateMutation.isPending}
        submitError={updateMutation.isError ? getApiErrorMessage(updateMutation.error) : null}
        defaultValues={{
          title: expense.title,
          amount: String(expense.amount),
          currency: expense.currency,
          category: expense.category ?? '',
          date: expense.date.slice(0, 10),
          notes: expense.notes ?? '',
        }}
        onSubmit={(values) => updateMutation.mutate(values)}
      />

      <Button
        variant="outline"
        className="text-destructive mt-4 w-full"
        disabled={isDeleting}
        onClick={() => void handleDelete()}
      >
        {isDeleting ? 'Deleting…' : 'Delete expense'}
      </Button>
    </div>
  );
}

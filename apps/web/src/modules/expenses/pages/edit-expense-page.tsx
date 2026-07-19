import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { ConfirmDialog, FullPageSpinner } from '@/shared/components/common';
import { useConfirmDialog } from '@/shared/hooks';
import { getApiErrorMessage } from '@/shared/lib/api';
import * as expensesApi from '../api';
import { expenseKeys } from '../api/query-keys';
import { ExpenseForm } from '../components/expense-form';
import type { ExpenseFormValues } from '../schema';

interface EditExpensePageProps {
  expenseId: string;
}

export function EditExpensePage({ expenseId }: EditExpensePageProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const { isOpen, options: confirmOptions, confirm, handleConfirm, handleCancel } = useConfirmDialog();

  const { data: expense, isLoading } = useQuery({
    queryKey: expenseKeys.detail(expenseId),
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
      await queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      await navigate({ to: '/' });
      toast.success('Changes saved');
    },
  });

  const handleDeleteClick = async () => {
    const confirmed = await confirm({
      title: 'Delete this expense?',
      description: 'This cannot be undone.',
    });
    if (!confirmed) {
      return;
    }
    setIsDeleting(true);
    try {
      await expensesApi.deleteExpense(expenseId);
      await queryClient.invalidateQueries({ queryKey: expenseKeys.all });
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
        onClick={() => void handleDeleteClick()}
      >
        {isDeleting ? 'Deleting…' : 'Delete expense'}
      </Button>

      <ConfirmDialog
        isOpen={isOpen}
        title={confirmOptions.title}
        description={confirmOptions.description}
        confirmLabel="Delete"
        pendingLabel="Deleting…"
        isConfirming={isDeleting}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}

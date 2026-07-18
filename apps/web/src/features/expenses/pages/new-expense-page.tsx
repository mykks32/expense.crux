import { useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getApiErrorMessage } from '@/lib/api';
import * as expensesApi from '../api';
import { ExpenseForm } from '../components/expense-form';
import type { ExpenseFormValues } from '../schema';

export function NewExpensePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (values: ExpenseFormValues) =>
      expensesApi.createExpense({
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
      toast.success('Expense added');
    },
  });

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-xl font-semibold">Add expense</h1>
      <ExpenseForm
        submitLabel="Add expense"
        isSubmitting={mutation.isPending}
        submitError={mutation.isError ? getApiErrorMessage(mutation.error) : null}
        onSubmit={(values) => mutation.mutate(values)}
      />
    </div>
  );
}

import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KeyboardAwareScreen } from '@/components/keyboard-aware-screen';
import { ApiError } from '@/lib/api';
import { ExpenseForm } from '@/features/expenses/components/expense-form';
import type { ExpenseFormValues } from '@/features/expenses/schema';
import * as expensesApi from '@/features/expenses/api';
import useToastStore from '@/features/toast/store';

export default function NewExpenseScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.show);

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
      router.back();
      showToast('Expense added');
    },
  });

  return (
    <KeyboardAwareScreen>
      <ExpenseForm
        submitLabel="Add expense"
        isSubmitting={mutation.isPending}
        submitError={mutation.isError ? (mutation.error instanceof ApiError ? mutation.error.message : 'Something went wrong. Try again.') : null}
        onSubmit={(values) => mutation.mutate(values)}
      />
    </KeyboardAwareScreen>
  );
}

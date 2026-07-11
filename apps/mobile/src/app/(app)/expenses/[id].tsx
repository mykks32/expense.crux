import { useState } from 'react';
import { Alert, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ActivityIndicator, Button, useTheme } from 'react-native-paper';

import { KeyboardAwareScreen } from '@/components/keyboard-aware-screen';
import { ApiError } from '@/lib/api';
import { ExpenseForm } from '@/features/expenses/components/expense-form';
import type { ExpenseFormValues } from '@/features/expenses/schema';
import * as expensesApi from '@/features/expenses/api';
import useToastStore from '@/features/toast/store';

export default function EditExpenseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const showToast = useToastStore((state) => state.show);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: expense, isLoading } = useQuery({
    queryKey: ['expenses', id],
    queryFn: () => expensesApi.getExpense(id),
  });

  const updateMutation = useMutation({
    mutationFn: (values: ExpenseFormValues) =>
      expensesApi.updateExpense(id, {
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
      showToast('Changes saved');
    },
  });

  const handleDelete = () => {
    Alert.alert('Delete expense?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setIsDeleting(true);
          try {
            await expensesApi.deleteExpense(id);
            await queryClient.invalidateQueries({ queryKey: ['expenses'] });
            router.back();
            showToast('Expense deleted');
          } catch (err) {
            setIsDeleting(false);
            showToast(err instanceof ApiError ? err.message : 'Failed to delete. Try again.');
          }
        },
      },
    ]);
  };

  if (isLoading || !expense) {
    return (
      <KeyboardAwareScreen>
        <ActivityIndicator />
      </KeyboardAwareScreen>
    );
  }

  return (
    <KeyboardAwareScreen>
      <ExpenseForm
        submitLabel="Save changes"
        isSubmitting={updateMutation.isPending}
        submitError={
          updateMutation.isError
            ? updateMutation.error instanceof ApiError
              ? updateMutation.error.message
              : 'Something went wrong. Try again.'
            : null
        }
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

      <View className="mt-4">
        <Button mode="outlined" textColor={theme.colors.error} loading={isDeleting} onPress={handleDelete}>
          Delete expense
        </Button>
      </View>
    </KeyboardAwareScreen>
  );
}

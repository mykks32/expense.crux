import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { View } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';

import { expenseFormSchema, type ExpenseFormValues } from '@/features/expenses/schema';

interface ExpenseFormProps {
  defaultValues?: Partial<ExpenseFormValues>;
  submitLabel: string;
  isSubmitting: boolean;
  submitError?: string | null;
  onSubmit: (values: ExpenseFormValues) => void;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

export function ExpenseForm({ defaultValues, submitLabel, isSubmitting, submitError, onSubmit }: ExpenseFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      title: '',
      amount: '',
      currency: 'USD',
      category: '',
      date: todayIso(),
      notes: '',
      ...defaultValues,
    },
  });

  return (
    <View className="gap-1">
      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput mode="outlined" label="Title" onBlur={onBlur} onChangeText={onChange} value={value} error={!!errors.title} />
        )}
      />
      <HelperText type="error" visible={!!errors.title}>
        {errors.title?.message}
      </HelperText>

      <Controller
        control={control}
        name="amount"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            mode="outlined"
            label="Amount"
            keyboardType="decimal-pad"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={!!errors.amount}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.amount}>
        {errors.amount?.message}
      </HelperText>

      <Controller
        control={control}
        name="currency"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            mode="outlined"
            label="Currency"
            autoCapitalize="characters"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />

      <Controller
        control={control}
        name="category"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput mode="outlined" label="Category" onBlur={onBlur} onChangeText={onChange} value={value} />
        )}
      />

      <Controller
        control={control}
        name="date"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput mode="outlined" label="Date (YYYY-MM-DD)" onBlur={onBlur} onChangeText={onChange} value={value} />
        )}
      />

      <Controller
        control={control}
        name="notes"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput mode="outlined" label="Notes" multiline onBlur={onBlur} onChangeText={onChange} value={value} />
        )}
      />

      {submitError && (
        <HelperText type="error" visible>
          {submitError}
        </HelperText>
      )}

      <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={isSubmitting} className="mt-2">
        {submitLabel}
      </Button>
    </View>
  );
}

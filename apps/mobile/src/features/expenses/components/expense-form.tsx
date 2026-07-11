import { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dimensions, Platform, View } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';

import { useKeyboardAwareScroll } from '@/components/keyboard-aware-screen';
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
  const scrollCtx = useKeyboardAwareScroll();
  const notesContainerRef = useRef<View>(null);
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
            error={!!errors.currency}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.currency}>
        {errors.currency?.message}
      </HelperText>

      <Controller
        control={control}
        name="category"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            mode="outlined"
            label="Category"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={!!errors.category}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.category}>
        {errors.category?.message}
      </HelperText>

      <Controller
        control={control}
        name="date"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            mode="outlined"
            label="Date"
            placeholder="YYYY-MM-DD"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={!!errors.date}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.date}>
        {errors.date?.message}
      </HelperText>

      <View ref={notesContainerRef}>
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              mode="outlined"
              label="Notes"
              multiline
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!errors.notes}
              // `automaticallyAdjustKeyboardInsets` (on the enclosing KeyboardAwareScreen)
              // only computes the scroll offset once, from this field's height at the
              // moment it's focused — as it wraps to new lines afterward its bottom can end
              // up hidden under the keyboard again. Re-measure and scroll it back into view
              // on every height change too. Native only: there's no on-screen keyboard to
              // avoid on web, and `getKeyboardHeight()` is always 0 there.
              onContentSizeChange={() => {
                if (Platform.OS === 'web' || !scrollCtx) return;
                requestAnimationFrame(() => {
                  const keyboardHeight = scrollCtx.getKeyboardHeight();
                  if (keyboardHeight === 0) return;
                  notesContainerRef.current?.measureInWindow((x, y, width, height) => {
                    const windowHeight = Dimensions.get('window').height;
                    const overflow = y + height - (windowHeight - keyboardHeight);
                    if (overflow > 0) {
                      scrollCtx.scrollViewRef.current?.scrollTo({ y: scrollCtx.getScrollY() + overflow + 16, animated: true });
                    }
                  });
                });
              }}
            />
          )}
        />
        <HelperText type="error" visible={!!errors.notes}>
          {errors.notes?.message}
        </HelperText>
      </View>

      <HelperText type="error" visible={!!submitError}>
        {submitError}
      </HelperText>

      <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={isSubmitting} className="mt-2">
        {submitLabel}
      </Button>
    </View>
  );
}

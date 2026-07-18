import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    register,
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
    <form className="flex flex-col gap-4" onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" aria-invalid={!!errors.title} {...register('title')} />
        {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="amount">Amount</Label>
          <Input id="amount" inputMode="decimal" aria-invalid={!!errors.amount} {...register('amount')} />
          {errors.amount && <p className="text-destructive text-sm">{errors.amount.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="currency">Currency</Label>
          <Input id="currency" className="uppercase" aria-invalid={!!errors.currency} {...register('currency')} />
          {errors.currency && <p className="text-destructive text-sm">{errors.currency.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="category">Category</Label>
          <Input id="category" aria-invalid={!!errors.category} {...register('category')} />
          {errors.category && <p className="text-destructive text-sm">{errors.category.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" aria-invalid={!!errors.date} {...register('date')} />
          {errors.date && <p className="text-destructive text-sm">{errors.date.message}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          rows={3}
          aria-invalid={!!errors.notes}
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
          {...register('notes')}
        />
        {errors.notes && <p className="text-destructive text-sm">{errors.notes.message}</p>}
      </div>

      {submitError && <p className="text-destructive text-sm">{submitError}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : submitLabel}
      </Button>
    </form>
  );
}

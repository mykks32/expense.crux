import { useForm } from '@tanstack/react-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { expenseFormSchema, type ExpenseFormValues } from '../schema';

interface ExpenseFormProps {
  defaultValues?: Partial<ExpenseFormValues>;
  submitLabel: string;
  isSubmitting: boolean;
  submitError?: string | null;
  onSubmit: (values: ExpenseFormValues) => void;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

export function ExpenseForm({ defaultValues, submitLabel, isSubmitting, submitError, onSubmit }: ExpenseFormProps) {
  const form = useForm({
    defaultValues: {
      title: '',
      amount: '',
      currency: 'USD',
      category: '',
      date: todayIso(),
      notes: '',
      ...defaultValues,
    } satisfies ExpenseFormValues,
    validators: { onChange: expenseFormSchema },
    onSubmit: ({ value }) => onSubmit(value),
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <form.Field name="title">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={field.name}>Title</Label>
            <Input
              id={field.name}
              aria-invalid={!field.state.meta.isValid}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {!field.state.meta.isValid && (
              <p className="text-destructive text-sm">{field.state.meta.errors[0]?.message}</p>
            )}
          </div>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-4">
        <form.Field name="amount">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name}>Amount</Label>
              <Input
                id={field.name}
                inputMode="decimal"
                aria-invalid={!field.state.meta.isValid}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {!field.state.meta.isValid && (
                <p className="text-destructive text-sm">{field.state.meta.errors[0]?.message}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="currency">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name}>Currency</Label>
              <Input
                id={field.name}
                className="uppercase"
                aria-invalid={!field.state.meta.isValid}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {!field.state.meta.isValid && (
                <p className="text-destructive text-sm">{field.state.meta.errors[0]?.message}</p>
              )}
            </div>
          )}
        </form.Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <form.Field name="category">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name}>Category</Label>
              <Input
                id={field.name}
                aria-invalid={!field.state.meta.isValid}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {!field.state.meta.isValid && (
                <p className="text-destructive text-sm">{field.state.meta.errors[0]?.message}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="date">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name}>Date</Label>
              <Input
                id={field.name}
                type="date"
                aria-invalid={!field.state.meta.isValid}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {!field.state.meta.isValid && (
                <p className="text-destructive text-sm">{field.state.meta.errors[0]?.message}</p>
              )}
            </div>
          )}
        </form.Field>
      </div>

      <form.Field name="notes">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={field.name}>Notes</Label>
            <textarea
              id={field.name}
              rows={3}
              aria-invalid={!field.state.meta.isValid}
              className="border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {!field.state.meta.isValid && (
              <p className="text-destructive text-sm">{field.state.meta.errors[0]?.message}</p>
            )}
          </div>
        )}
      </form.Field>

      {submitError && <p className="text-destructive text-sm">{submitError}</p>}

      <form.Subscribe selector={(state) => state.canSubmit}>
        {(canSubmit) => (
          <Button type="submit" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? 'Saving…' : submitLabel}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}

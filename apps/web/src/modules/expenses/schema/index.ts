import { z } from 'zod';

export const expenseFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, 'Enter a valid amount'),
  currency: z.string(),
  category: z.string(),
  date: z.string(),
  notes: z.string(),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

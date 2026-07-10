export interface Expense {
  id: string;
  title: string;
  amount: number;
  currency: string;
  category?: string;
  date: string;
  notes?: string;
}

export interface CreateExpenseInput {
  title: string;
  amount: number;
  currency?: string;
  category?: string;
  date?: string;
  notes?: string;
}

export type UpdateExpenseInput = Partial<CreateExpenseInput>;

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

/** Fields `ListExpensesQuery.sortBy` can sort on. Single source of truth for both the backend's validation regex and the mobile filter UI's sort options. */
export const EXPENSE_SORT_FIELDS = ['date', 'amount', 'title'] as const;
export type ExpenseSortField = (typeof EXPENSE_SORT_FIELDS)[number];

export const SORT_ORDERS = ['asc', 'desc'] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];

export interface ListExpensesQuery {
  page?: number;
  limit?: number;
  category?: string;
  currency?: string;
  /** Case-insensitive partial match against `title`. */
  search?: string;
  minAmount?: number;
  maxAmount?: number;
  dateFrom?: string;
  dateTo?: string;
  /** Comma-separated "field:order" pairs, e.g. "date:desc" or "date:desc,amount:asc". Sortable fields: see {@link EXPENSE_SORT_FIELDS}. */
  sortBy?: string;
}

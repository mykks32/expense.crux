import type {
  ApiResponse,
  CreateExpenseInput,
  Expense,
  ListExpensesQuery,
  PaginationMeta,
  UpdateExpenseInput,
} from '@mykks32/expense-crux-contracts';

import { apiClient } from '@/shared/lib/api';

function requireData<T>(body: ApiResponse<T>): T {
  if (!body.data) {
    throw new Error('Malformed API response: missing data');
  }
  return body.data;
}

export interface ExpensesPage {
  items: Expense[];
  meta: PaginationMeta;
}

/**
 * Lists the current user's expenses, paginated, with optional filters/search/sort.
 * @param query pagination, filter, search, and sort params — see {@link ListExpensesQuery}
 * @returns the page of expenses plus pagination metadata
 */
export async function listExpenses(query: ListExpensesQuery = {}): Promise<ExpensesPage> {
  const response = await apiClient.get<ApiResponse<Expense[]>>('/expenses', { params: query });
  const { data, meta } = response.data;
  if (!data || !meta) {
    throw new Error('Malformed API response: missing data or meta');
  }
  return { items: data, meta };
}

/** Fetches a single expense by id. */
export async function getExpense(id: string): Promise<Expense> {
  const response = await apiClient.get<ApiResponse<Expense>>(`/expenses/${id}`);
  return requireData(response.data);
}

/** Creates a new expense. */
export async function createExpense(input: CreateExpenseInput): Promise<Expense> {
  const response = await apiClient.post<ApiResponse<Expense>>('/expenses', input);
  return requireData(response.data);
}

/** Partially updates an expense. */
export async function updateExpense(id: string, input: UpdateExpenseInput): Promise<Expense> {
  const response = await apiClient.patch<ApiResponse<Expense>>(`/expenses/${id}`, input);
  return requireData(response.data);
}

/** Deletes an expense. */
export async function deleteExpense(id: string): Promise<void> {
  await apiClient.delete(`/expenses/${id}`);
}

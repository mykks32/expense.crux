import type { ListExpensesQuery } from '@mykks32/expense-crux-contracts';

interface ListExpensesParams {
  query: Omit<ListExpensesQuery, 'page' | 'limit'>;
  page: number;
  pageSize: number;
}

/** Centralized TanStack Query keys for the expenses module — see https://tkdodo.eu/blog/effective-react-query-keys. */
export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  list: (params: ListExpensesParams) => [...expenseKeys.lists(), params] as const,
  details: () => [...expenseKeys.all, 'detail'] as const,
  detail: (id: string) => [...expenseKeys.details(), id] as const,
};

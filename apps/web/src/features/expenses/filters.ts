import { type ExpenseSortField, type ListExpensesQuery, type SortOrder } from '@mykks32/expense-crux-contracts';

export interface ExpenseFiltersState {
  category: string;
  currency: string;
  minAmount: string;
  maxAmount: string;
  dateFrom: string;
  dateTo: string;
  sortField: ExpenseSortField;
  sortOrder: SortOrder;
}

export const DEFAULT_FILTERS: ExpenseFiltersState = {
  category: '',
  currency: '',
  minAmount: '',
  maxAmount: '',
  dateFrom: '',
  dateTo: '',
  sortField: 'date',
  sortOrder: 'desc',
};

/** True if any filter differs from its default (search is tracked separately, not included). */
export function hasActiveFilters(filters: ExpenseFiltersState): boolean {
  return (
    filters.category !== '' ||
    filters.currency !== '' ||
    filters.minAmount !== '' ||
    filters.maxAmount !== '' ||
    filters.dateFrom !== '' ||
    filters.dateTo !== '' ||
    filters.sortField !== DEFAULT_FILTERS.sortField ||
    filters.sortOrder !== DEFAULT_FILTERS.sortOrder
  );
}

/** Converts local filter/search UI state into the query params GET /expenses expects. */
export function toListExpensesQuery(filters: ExpenseFiltersState, search: string): Omit<ListExpensesQuery, 'page' | 'limit'> {
  return {
    category: filters.category || undefined,
    currency: filters.currency || undefined,
    search: search || undefined,
    minAmount: filters.minAmount ? Number(filters.minAmount) : undefined,
    maxAmount: filters.maxAmount ? Number(filters.maxAmount) : undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    sortBy: `${filters.sortField}:${filters.sortOrder}`,
  };
}

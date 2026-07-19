import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';

import { DataTableToolbar } from '@/shared/components/data-table';
import { useDataTableSearch, useFilters, usePagination } from '@/shared/hooks';
import * as expensesApi from '../api';
import { expenseKeys } from '../api/query-keys';
import { ExpenseFiltersPanel } from '../components/expense-filters';
import { ExpensesTable } from '../components/expenses-table';
import { DEFAULT_FILTERS, toListExpensesQuery } from '../utils/filters';

const DEFAULT_PAGE_LIMIT = 20;

export function ExpensesListPage() {
  const navigate = useNavigate();

  // search
  const { searchInput, setSearchInput, debouncedSearch } = useDataTableSearch();

  // filters
  const { filters, setFilters } = useFilters(DEFAULT_FILTERS);

  // pagination
  const { page, pageSize, setPage, setPageSize } = usePagination(DEFAULT_PAGE_LIMIT);

  // query
  const query = toListExpensesQuery(filters, debouncedSearch);
  const querySignature = JSON.stringify(query);

  // A new filter/search combination should always start back at page 1.
  useEffect(() => {
    setPage(1);
  }, [querySignature, setPage]);

  // fetch
  const { data, isLoading } = useQuery({
    queryKey: expenseKeys.list({ query, page, pageSize }),
    queryFn: () => expensesApi.listExpenses({ ...query, page, limit: pageSize }),
  });

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <DataTableToolbar
        searchValue={searchInput}
        searchPlaceholder="Search by title"
        onSearchChange={setSearchInput}
        actions={<ExpenseFiltersPanel filters={filters} onChange={setFilters} />}
      />

      <ExpensesTable
        items={data?.items ?? []}
        meta={data?.meta}
        isLoading={isLoading}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onSelect={(id) => void navigate({ to: '/expenses/$expenseId', params: { expenseId: id } })}
      />
    </div>
  );
}

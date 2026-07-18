import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';

import { Input } from '@/components/ui/input';
import * as expensesApi from '../api';
import { ExpenseFiltersPanel } from '../components/expense-filters';
import { ExpensesTable } from '../components/expenses-table';
import { DEFAULT_FILTERS, toListExpensesQuery, type ExpenseFiltersState } from '../utils/filters';

const DEFAULT_PAGE_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 400;

export function ExpensesListPage() {
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState<ExpenseFiltersState>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_LIMIT);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const query = toListExpensesQuery(filters, debouncedSearch);
  const querySignature = JSON.stringify(query);

  // A new filter/search combination should always start back at page 1.
  useEffect(() => {
    setPage(1);
  }, [querySignature]);

  const { data, isLoading } = useQuery({
    queryKey: ['expenses', query, page, pageSize],
    queryFn: () => expensesApi.listExpenses({ ...query, page, limit: pageSize }),
  });

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div className="flex items-center gap-3">
        <Input placeholder="Search by title" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        <ExpenseFiltersPanel filters={filters} onChange={setFilters} />
      </div>

      <ExpensesTable
        items={data?.items ?? []}
        meta={data?.meta}
        isLoading={isLoading}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onSelect={(id) => void navigate({ to: '/expenses/$expenseId', params: { expenseId: id } })}
      />
    </div>
  );
}

import { useState } from 'react';

interface UseFiltersResult<T> {
  filters: T;
  setFilters: (filters: T) => void;
  resetFilters: () => void;
}

/** Applied filter state for a list view, with a one-line reset back to the given defaults. */
export function useFilters<T>(defaultFilters: T): UseFiltersResult<T> {
  const [filters, setFilters] = useState(defaultFilters);

  return { filters, setFilters, resetFilters: () => setFilters(defaultFilters) };
}

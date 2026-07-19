import { useState } from 'react';

import { useDebounce } from './use-debounce';

interface UseDataTableSearchResult {
  searchInput: string;
  setSearchInput: (value: string) => void;
  debouncedSearch: string;
}

/** Raw search-box input plus its debounced value, for wiring a DataTableToolbar search box to a query. */
export function useDataTableSearch(debounceMs = 400): UseDataTableSearchResult {
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, debounceMs);

  return { searchInput, setSearchInput, debouncedSearch };
}

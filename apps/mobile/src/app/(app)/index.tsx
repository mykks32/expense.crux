import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { FlatList, RefreshControl, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Appbar, Badge, Divider, FAB, IconButton, List, Searchbar, Text, useTheme } from 'react-native-paper';

import useAuthStore from '@/features/auth/store';
import useThemeStore from '@/features/theme/store';
import * as expensesApi from '@/features/expenses/api';
import { DEFAULT_FILTERS, hasActiveFilters, toListExpensesQuery, type ExpenseFiltersState } from '@/features/expenses/filters';
import { ExpenseFiltersModal } from '@/features/expenses/components/expense-filters-modal';

const PAGE_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 400;

export default function ExpensesListScreen() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const paperTheme = useTheme();

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState<ExpenseFiltersState>(DEFAULT_FILTERS);
  const [isFiltersModalVisible, setIsFiltersModalVisible] = useState(false);
  const [page, setPage] = useState(1);

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

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['expenses', query, page],
    queryFn: () => expensesApi.listExpenses({ ...query, page, limit: PAGE_LIMIT }),
  });

  const expenses = data?.items ?? [];
  const meta = data?.meta;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: paperTheme.colors.background }}>
      <Appbar.Header>
        <Appbar.Content title="Expenses" />
        <View>
          <Appbar.Action icon="filter-variant" onPress={() => setIsFiltersModalVisible(true)} />
          {hasActiveFilters(filters) && <Badge size={8} style={{ position: 'absolute', top: 8, right: 8 }} />}
        </View>
        <Appbar.Action icon={theme === 'light' ? 'weather-night' : 'weather-sunny'} onPress={toggleTheme} />
        <Appbar.Action icon="logout" onPress={() => logout()} />
      </Appbar.Header>

      <View className="px-4 pt-3">
        <Searchbar placeholder="Search by title" value={searchInput} onChangeText={setSearchInput} />
      </View>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        contentContainerClassName="pb-4"
        refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} />}
        ItemSeparatorComponent={Divider}
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center p-8">
              <Text variant="bodyMedium">No expenses match — tap + to add one.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <List.Item
            title={item.title}
            description={[item.category, new Date(item.date).toLocaleDateString()].filter(Boolean).join(' · ')}
            right={() => (
              <Text variant="titleMedium" style={{ alignSelf: 'center' }}>
                {item.amount.toFixed(2)} {item.currency}
              </Text>
            )}
            onPress={() => router.push({ pathname: '/expenses/[id]', params: { id: item.id } })}
          />
        )}
      />

      {meta && meta.totalItems > 0 && (
        <View
          className="flex-row items-center justify-center gap-4 py-2"
          style={{ borderTopWidth: 1, borderTopColor: paperTheme.colors.outlineVariant }}
        >
          <IconButton icon="chevron-left" disabled={!meta.hasPreviousPage} onPress={() => setPage((p) => p - 1)} />
          <Text variant="bodyMedium">
            Page {meta.page} of {meta.totalPages}
          </Text>
          <IconButton icon="chevron-right" disabled={!meta.hasNextPage} onPress={() => setPage((p) => p + 1)} />
        </View>
      )}

      <FAB icon="plus" style={{ position: 'absolute', bottom: 24, right: 24 }} onPress={() => router.push('/expenses/new')} />

      <ExpenseFiltersModal
        visible={isFiltersModalVisible}
        filters={filters}
        onChange={setFilters}
        onDismiss={() => setIsFiltersModalVisible(false)}
      />
    </SafeAreaView>
  );
}

import { EXPENSE_SORT_FIELDS, SORT_ORDERS } from '@mykks32/expense-crux-contracts';
import { ScrollView, View } from 'react-native';
import { Button, Modal, Portal, SegmentedButtons, Text, TextInput, useTheme } from 'react-native-paper';

import { DEFAULT_FILTERS, type ExpenseFiltersState } from '@/features/expenses/filters';

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
const SORT_FIELD_BUTTONS = EXPENSE_SORT_FIELDS.map((field) => ({ value: field, label: capitalize(field) }));
const SORT_ORDER_BUTTONS = SORT_ORDERS.map((order) => ({
  value: order,
  label: order === 'asc' ? 'Ascending' : 'Descending',
}));

interface ExpenseFiltersModalProps {
  visible: boolean;
  filters: ExpenseFiltersState;
  onChange: (filters: ExpenseFiltersState) => void;
  onDismiss: () => void;
}

export function ExpenseFiltersModal({ visible, filters, onChange, onDismiss }: ExpenseFiltersModalProps) {
  const theme = useTheme();

  const set = <K extends keyof ExpenseFiltersState>(key: K, value: ExpenseFiltersState[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={{
          marginHorizontal: 24,
          borderRadius: 12,
          padding: 24,
          backgroundColor: theme.colors.background,
          maxHeight: '80%',
        }}
      >
        <ScrollView>
          <Text variant="titleLarge" style={{ marginBottom: 16 }}>
            Filter & sort
          </Text>

          <TextInput
            mode="outlined"
            label="Category"
            value={filters.category}
            onChangeText={(value) => set('category', value)}
            style={{ marginBottom: 12 }}
          />

          <TextInput
            mode="outlined"
            label="Currency"
            autoCapitalize="characters"
            value={filters.currency}
            onChangeText={(value) => set('currency', value)}
            style={{ marginBottom: 12 }}
          />

          <View className="mb-3 flex-row gap-3">
            <TextInput
              mode="outlined"
              label="Min amount"
              keyboardType="decimal-pad"
              value={filters.minAmount}
              onChangeText={(value) => set('minAmount', value)}
              style={{ flex: 1 }}
            />
            <TextInput
              mode="outlined"
              label="Max amount"
              keyboardType="decimal-pad"
              value={filters.maxAmount}
              onChangeText={(value) => set('maxAmount', value)}
              style={{ flex: 1 }}
            />
          </View>

          <View className="mb-3 flex-row gap-3">
            <TextInput
              mode="outlined"
              label="Date from"
              placeholder="YYYY-MM-DD"
              value={filters.dateFrom}
              onChangeText={(value) => set('dateFrom', value)}
              style={{ flex: 1 }}
            />
            <TextInput
              mode="outlined"
              label="Date to"
              placeholder="YYYY-MM-DD"
              value={filters.dateTo}
              onChangeText={(value) => set('dateTo', value)}
              style={{ flex: 1 }}
            />
          </View>

          <Text variant="labelLarge" style={{ marginBottom: 8 }}>
            Sort by
          </Text>
          <SegmentedButtons
            value={filters.sortField}
            onValueChange={(value) => set('sortField', value as ExpenseFiltersState['sortField'])}
            buttons={SORT_FIELD_BUTTONS}
            style={{ marginBottom: 12 }}
          />

          <SegmentedButtons
            value={filters.sortOrder}
            onValueChange={(value) => set('sortOrder', value as ExpenseFiltersState['sortOrder'])}
            buttons={SORT_ORDER_BUTTONS}
            style={{ marginBottom: 20 }}
          />

          <View className="flex-row gap-3">
            <Button mode="outlined" style={{ flex: 1 }} onPress={() => onChange(DEFAULT_FILTERS)}>
              Reset
            </Button>
            <Button mode="contained" style={{ flex: 1 }} onPress={onDismiss}>
              Apply
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
}

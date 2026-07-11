import { useEffect, useState } from 'react';
import { EXPENSE_SORT_FIELDS, SORT_ORDERS } from '@mykks32/expense-crux-contracts';
import { Keyboard, Platform, ScrollView, View, useWindowDimensions } from 'react-native';
import { Button, Modal, Portal, SegmentedButtons, Text, TextInput, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [draft, setDraft] = useState(filters);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Re-seed the draft from the applied filters each time the modal opens, so edits
  // made then cancelled don't leak into the next time it's opened.
  useEffect(() => {
    if (visible) setDraft(filters);
  }, [visible, filters]);

  // The card is centered at a fixed 80% of screen height regardless of the keyboard, so
  // once the keyboard opens (covering ~35-40% of the screen from the bottom) its lower
  // portion — including Apply/Cancel — can end up rendered behind the keyboard, where no
  // amount of scrolling inside the card helps, since the card's own visible bounds overlap
  // it. Tracking keyboard height and shrinking + shifting the card up by that amount keeps
  // the whole card, buttons included, above the keyboard whenever it's open.
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, (e) => setKeyboardHeight(e.endCoordinates.height));
    const hideSubscription = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const set = <K extends keyof ExpenseFiltersState>(key: K, value: ExpenseFiltersState[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const handleApply = () => {
    onChange(draft);
    onDismiss();
  };

  const availableHeight = windowHeight - insets.top - insets.bottom - keyboardHeight - 24;
  const modalMaxHeight = Math.min(windowHeight * 0.8, availableHeight);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        style={keyboardHeight > 0 ? { marginBottom: keyboardHeight } : undefined}
        contentContainerStyle={{
          marginHorizontal: 24,
          borderRadius: 12,
          padding: 24,
          backgroundColor: theme.colors.background,
          maxHeight: modalMaxHeight,
        }}
      >
        {/*
          Without flexShrink, the ScrollView sizes to its full content height and ignores
          the Modal's maxHeight — on native that overflow isn't clipped or scrollable, it's
          just rendered past the card's visible bounds, which is why Apply/Reset were
          unreachable on a phone screen. flexShrink lets it get bounded by maxHeight instead
          and become properly scrollable.
        */}
        <ScrollView style={{ flexGrow: 0, flexShrink: 1 }} keyboardShouldPersistTaps="handled">
          <Text variant="titleLarge" className="mb-4">
            Filter & sort
          </Text>

          <TextInput
            mode="outlined"
            label="Category"
            value={draft.category}
            onChangeText={(value) => set('category', value)}
            className="mb-3"
          />

          <TextInput
            mode="outlined"
            label="Currency"
            autoCapitalize="characters"
            value={draft.currency}
            onChangeText={(value) => set('currency', value)}
            className="mb-3"
          />

          <View className="mb-3 flex-row gap-3">
            <TextInput
              mode="outlined"
              label="Min amount"
              keyboardType="decimal-pad"
              value={draft.minAmount}
              onChangeText={(value) => set('minAmount', value)}
              className="flex-1"
            />
            <TextInput
              mode="outlined"
              label="Max amount"
              keyboardType="decimal-pad"
              value={draft.maxAmount}
              onChangeText={(value) => set('maxAmount', value)}
              className="flex-1"
            />
          </View>

          <View className="mb-3 flex-row gap-3">
            <TextInput
              mode="outlined"
              label="Date from"
              placeholder="YYYY-MM-DD"
              value={draft.dateFrom}
              onChangeText={(value) => set('dateFrom', value)}
              className="flex-1"
            />
            <TextInput
              mode="outlined"
              label="Date to"
              placeholder="YYYY-MM-DD"
              value={draft.dateTo}
              onChangeText={(value) => set('dateTo', value)}
              className="flex-1"
            />
          </View>

          <Text variant="labelLarge" className="mb-2">
            Sort by
          </Text>
          <SegmentedButtons
            value={draft.sortField}
            onValueChange={(value) => set('sortField', value as ExpenseFiltersState['sortField'])}
            buttons={SORT_FIELD_BUTTONS}
            style={{ marginBottom: 12 }}
          />

          <SegmentedButtons
            value={draft.sortOrder}
            onValueChange={(value) => set('sortOrder', value as ExpenseFiltersState['sortOrder'])}
            buttons={SORT_ORDER_BUTTONS}
            style={{ marginBottom: 20 }}
          />

          <View className="flex-row items-center justify-between gap-3">
            <Button mode="text" compact onPress={() => setDraft(DEFAULT_FILTERS)}>
              Reset
            </Button>
            <View className="flex-row gap-3">
              <Button mode="outlined" onPress={onDismiss}>
                Cancel
              </Button>
              <Button mode="contained" onPress={handleApply}>
                Apply
              </Button>
            </View>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
}

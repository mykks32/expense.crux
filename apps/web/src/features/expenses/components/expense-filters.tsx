import { useEffect, useState } from 'react';
import { EXPENSE_SORT_FIELDS, SORT_ORDERS } from '@mykks32/expense-crux-contracts';
import { FilterIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { DEFAULT_FILTERS, hasActiveFilters, type ExpenseFiltersState } from '@/features/expenses/filters';

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

interface ExpenseFiltersPanelProps {
  filters: ExpenseFiltersState;
  onChange: (filters: ExpenseFiltersState) => void;
}

export function ExpenseFiltersPanel({ filters, onChange }: ExpenseFiltersPanelProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);

  // Re-seed the draft from the applied filters each time the sheet opens, so edits
  // made then cancelled don't leak into the next time it's opened.
  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  const set = <K extends keyof ExpenseFiltersState>(key: K, value: ExpenseFiltersState[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const handleApply = () => {
    onChange(draft);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <FilterIcon />
          Filter &amp; sort
          {hasActiveFilters(filters) && <span className="bg-primary absolute -top-1 -right-1 size-2.5 rounded-full" />}
        </Button>
      </SheetTrigger>

      <SheetContent className="gap-0 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filter &amp; sort</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="filter-category">Category</Label>
            <Input id="filter-category" value={draft.category} onChange={(e) => set('category', e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="filter-currency">Currency</Label>
            <Input
              id="filter-currency"
              className="uppercase"
              value={draft.currency}
              onChange={(e) => set('currency', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="filter-min-amount">Min amount</Label>
              <Input
                id="filter-min-amount"
                inputMode="decimal"
                value={draft.minAmount}
                onChange={(e) => set('minAmount', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="filter-max-amount">Max amount</Label>
              <Input
                id="filter-max-amount"
                inputMode="decimal"
                value={draft.maxAmount}
                onChange={(e) => set('maxAmount', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="filter-date-from">Date from</Label>
              <Input id="filter-date-from" type="date" value={draft.dateFrom} onChange={(e) => set('dateFrom', e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="filter-date-to">Date to</Label>
              <Input id="filter-date-to" type="date" value={draft.dateTo} onChange={(e) => set('dateTo', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Sort by</Label>
              <Select value={draft.sortField} onValueChange={(value) => set('sortField', value as ExpenseFiltersState['sortField'])}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_SORT_FIELDS.map((field) => (
                    <SelectItem key={field} value={field}>
                      {capitalize(field)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Order</Label>
              <Select value={draft.sortOrder} onValueChange={(value) => set('sortOrder', value as ExpenseFiltersState['sortOrder'])}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_ORDERS.map((order) => (
                    <SelectItem key={order} value={order}>
                      {order === 'asc' ? 'Ascending' : 'Descending'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <SheetFooter>
          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={() => setDraft(DEFAULT_FILTERS)}>
              Reset
            </Button>
            <div className="flex gap-3">
              <SheetClose asChild>
                <Button variant="outline">Cancel</Button>
              </SheetClose>
              <Button onClick={handleApply}>Apply</Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

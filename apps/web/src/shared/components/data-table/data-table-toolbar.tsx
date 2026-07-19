import type { ReactNode } from 'react';

import { Input } from '@/shared/components/ui/input';

interface DataTableToolbarProps {
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  actions?: ReactNode;
}

export function DataTableToolbar({ searchValue, searchPlaceholder, onSearchChange, actions }: DataTableToolbarProps) {
  return (
    <div className="flex items-center gap-3">
      {onSearchChange && (
        <Input placeholder={searchPlaceholder} value={searchValue ?? ''} onChange={(e) => onSearchChange(e.target.value)} />
      )}
      {actions}
    </div>
  );
}

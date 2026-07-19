import { TableCell, TableRow } from '@/shared/components/ui/table';

interface DataTableEmptyProps {
  columnCount: number;
  message?: string;
}

export function DataTableEmpty({ columnCount, message = 'No results.' }: DataTableEmptyProps) {
  return (
    <TableRow>
      <TableCell colSpan={columnCount} className="text-muted-foreground h-24 text-center">
        {message}
      </TableCell>
    </TableRow>
  );
}

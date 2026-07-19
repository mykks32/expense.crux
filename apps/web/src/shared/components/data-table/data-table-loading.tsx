import { TableCell, TableRow } from '@/shared/components/ui/table';

interface DataTableLoadingProps {
  columnCount: number;
  rowCount?: number;
}

export function DataTableLoading({ columnCount, rowCount = 5 }: DataTableLoadingProps) {
  return (
    <>
      {Array.from({ length: rowCount }, (_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columnCount }, (_, cellIndex) => (
            <TableCell key={cellIndex}>
              <div className="bg-muted h-4 w-full animate-pulse rounded" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

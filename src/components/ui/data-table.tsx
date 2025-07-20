import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';

interface Column<T = any> {
  key: string;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

interface DataTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  rtl?: boolean;
  className?: string;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  rtl = true,
  className,
  loading = false,
  emptyMessage = 'אין נתונים להצגה',
  onRowClick,
}: DataTableProps<T>) => {
  if (loading) {
    return (
      <div className={cn('w-full p-8 text-center', rtl && 'text-right')}>
        <div className="inline-flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span>טוען נתונים...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full', rtl && 'text-right dir-rtl', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(
                  'font-hebrew font-semibold',
                  rtl && 'text-right',
                  column.className
                )}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className={cn(
                  'h-24 text-center text-muted-foreground',
                  rtl && 'text-right'
                )}
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow
                key={index}
                className={cn(
                  onRowClick && 'cursor-pointer hover:bg-muted/50',
                  'font-hebrew'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={cn(rtl && 'text-right', column.className)}
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key] || '-'}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

DataTable.displayName = 'DataTable';

export { DataTable, type DataTableProps, type Column };

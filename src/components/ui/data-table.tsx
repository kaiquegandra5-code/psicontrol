import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  emptyMessage = "Nenhum registro encontrado.",
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-outline-variant/40 bg-paper", className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface-container-lowest">
            <tr>
              {columns.map((c) => (
                <th
                  key={String(c.key)}
                  className={cn(
                    "px-6 py-3 text-left text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold",
                    c.className
                  )}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-divider">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-body-md text-on-surface-variant"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "min-h-[56px] transition-colors",
                    onRowClick && "cursor-pointer hover:bg-surface-container-lowest/50"
                  )}
                >
                  {columns.map((c) => (
                    <td
                      key={String(c.key)}
                      className={cn("px-6 py-4 text-body-md text-on-surface align-middle", c.className)}
                    >
                      {c.render ? c.render(row) : (row as Record<string, unknown>)[c.key as string] as React.ReactNode}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

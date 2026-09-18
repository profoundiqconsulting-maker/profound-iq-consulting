import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  keyExtractor: (row: T, index: number) => string | number;
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
  emptyMessage?: string;
  isLoading?: boolean;
}

export function DataTable<T>({
  columns,
  rows,
  keyExtractor,
  page,
  pageSize,
  totalItems,
  onPageChange,
  itemLabel = "items",
  emptyMessage = "No data available.",
  isLoading = false,
}: DataTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12" role="status" aria-live="polite">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#c9a34e] border-t-transparent" />
        <p className="text-xs font-semibold text-[#657084]">Loading...</p>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f7f3e8]">
          <span className="text-lg font-bold text-[#657084]" aria-hidden="true">!</span>
        </div>
        <p className="text-sm text-[#16243d]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-[#16243d]/10 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm" aria-label="Data table">
            <thead>
              <tr className="border-b border-[#16243d]/10 bg-[#f7f3e8]">
                {columns.map(column => (
                  <th
                    key={column.key}
                    scope="col"
                    style={{ width: column.width }}
                    className={`px-5 py-4 text-[10px] font-black uppercase tracking-[.14em] text-[#657084] ${
                      column.align === "center"
                        ? "text-center"
                        : column.align === "right"
                          ? "text-right"
                          : "text-left"
                    }`}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#16243d]/5" aria-live="polite">
              {rows.map((row, rowIndex) => (
                <tr
                  key={keyExtractor(row, rowIndex)}
                  className="transition-colors hover:bg-[#f7f3e8]/50"
                >
                  {columns.map(column => (
                    <td
                      key={column.key}
                      className={`px-5 py-4 ${
                        column.align === "center"
                          ? "text-center"
                          : column.align === "right"
                            ? "text-right"
                            : "text-left"
                      }`}
                    >
                      {column.render
                        ? column.render(row, rowIndex)
                        : (row as Record<string, unknown>)[column.key]?.toString() ?? ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-[#657084]">
            Showing {start}–{end} of {totalItems} {itemLabel}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="h-8 gap-1 border-[#16243d]/15 px-3 text-[10px] font-black uppercase tracking-[.08em] disabled:opacity-40"
            >
              <ChevronLeft size={13} /> Previous
            </Button>
            <span className="text-xs font-semibold text-[#16243d]">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="h-8 gap-1 border-[#16243d]/15 px-3 text-[10px] font-black uppercase tracking-[.08em] disabled:opacity-40"
            >
              Next <ChevronRight size={13} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

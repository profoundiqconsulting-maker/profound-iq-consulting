import type { ReactNode } from "react";

interface SectionProps {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
  stats?: ReactNode;
  filters?: ReactNode;
  children: ReactNode;
  pagination?: ReactNode;
  className?: string;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
}

export function Section({
  id,
  eyebrow,
  title,
  description,
  actions,
  stats,
  filters,
  children,
  pagination,
  className = "",
  isLoading = false,
  isEmpty = false,
  emptyMessage = "No data available.",
}: SectionProps) {
  return (
    <section
      id={id}
      className={`reveal mb-8 border border-[#16243d]/15 bg-white/60 dark:bg-[#16243d]/95 backdrop-blur-sm rounded-xl overflow-hidden ${className}`}
    >
      {(eyebrow || title || description || actions) && (
        <div className="border-b border-[#16243d]/10 dark:border-[#657084]/15 bg-gradient-to-r from-[#f7f3e8]/80 to-white/60 dark:from-[#16243d]/80 dark:to-[#101d35]/80 px-5 py-4 sm:px-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="min-w-0">
              {eyebrow && (
                <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#7d5e1e] dark:text-[#7d5e1e]">
                  {eyebrow}
                </p>
              )}
              {title && (
                <h2 className="display mt-2 text-2xl sm:text-3xl text-[#16243d] dark:text-[#f7f3e8]">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#16243d] dark:text-[#f7f3e8]">
                  {description}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex shrink-0 gap-2 flex-wrap">{actions}</div>
            )}
          </div>
        </div>
      )}
      {stats && <div className="border-b border-[#16243d]/10 dark:border-[#657084]/15 bg-[#f7f3e8]/40 dark:bg-[#0d1a2f]/60 px-5 py-4 sm:px-7">{stats}</div>}
      {filters && <div className="border-b border-[#16243d]/10 dark:border-[#657084]/15 bg-white/40 dark:bg-[#16243d]/60 px-5 py-3 sm:px-7">{filters}</div>}
      <div className="p-5 sm:p-7">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#c9a34e] border-t-transparent" />
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-[#16243d] dark:text-[#f7f3e8]">{emptyMessage}</p>
          </div>
        ) : (
          children
        )}
        {pagination && <div className="mt-6">{pagination}</div>}
      </div>
    </section>
  );
}



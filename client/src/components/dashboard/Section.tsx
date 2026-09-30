import type { ReactNode } from "react";

interface SectionProps {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: ReactNode;
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
      className={`reveal mb-8 border border-border bg-card backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md focus-within:shadow-md ${className}`}
    >
      {(eyebrow || title || description || actions) && (
        <div className="border-b border-border bg-gradient-to-r from-card to-card/70 px-5 py-4 sm:px-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="min-w-0">
              {eyebrow && (
                <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#7d5e1e] dark:text-accent-on-dark">
                  {eyebrow}
                </p>
              )}
              {title && (
                <h2 className="display mt-2 text-2xl sm:text-3xl text-foreground">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
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
      {stats && (
        <div className="border-b border-border bg-muted/30 px-5 py-4 sm:px-7">
          {stats}
        </div>
      )}
      {filters && (
        <div className="border-b border-border bg-card/70 px-5 py-3 sm:px-7">
          {filters}
        </div>
      )}
      <div className="p-5 sm:p-7">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-xs font-semibold text-muted-foreground">
              Loading...
            </p>
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <span className="text-lg font-bold text-muted-foreground">!</span>
            </div>
            <p className="text-sm text-foreground">{emptyMessage}</p>
          </div>
        ) : (
          children
        )}
        {pagination && <div className="mt-6">{pagination}</div>}
      </div>
    </section>
  );
}

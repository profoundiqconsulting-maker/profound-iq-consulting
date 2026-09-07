import type { ReactNode } from "react";

export function DashboardSectionHeader({
  eyebrow,
  title,
  description,
  actions,
  className = "",
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  if (!eyebrow && !title && !description && !actions) return null;
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          {eyebrow && (
            <p className="eyebrow text-[#a27e2e] dark:text-[#c9a34e]">
              {eyebrow}
            </p>
          )}
          {title && (
            <h2 className="display mt-2 text-3xl text-[#16243d] dark:text-[#f7f3e8]">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#657084] dark:text-[#c1cad7]">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex shrink-0 gap-3">{actions}</div>}
      </div>
    </div>
  );
}

export function DashboardSectionStats({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${className}`}
    >
      {children}
    </div>
  );
}

export function DashboardSectionFilters({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`mb-6 ${className}`}>{children}</div>;
}

export function DashboardSectionContent({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function DashboardSectionPagination({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`mt-6 ${className}`}>{children}</div>;
}

export function DashboardSection({
  header,
  stats,
  filters,
  children,
  pagination,
  className = "",
}: {
  header?: ReactNode;
  stats?: ReactNode;
  filters?: ReactNode;
  children: ReactNode;
  pagination?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`reveal mb-8 border border-[#16243d]/15 bg-[#fffaf0] p-5 sm:p-7 dark:border-[#c9a34e]/20 dark:bg-[#16243d] ${className}`}
    >
      {header}
      {stats}
      {filters}
      <DashboardSectionContent>{children}</DashboardSectionContent>
      {pagination}
    </section>
  );
}

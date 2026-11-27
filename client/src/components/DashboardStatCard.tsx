import type { LucideIcon } from "lucide-react";

interface DashboardStatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: { value: number; label: string };
  className?: string;
}

export function DashboardStatCard({
  label,
  value,
  icon: Icon,
  trend,
  className = "",
}: DashboardStatCardProps) {
  return (
    <div className={`border border-[var(--border)] bg-[var(--bg-card)] p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[.1em] text-[var(--fg-muted)]">
          {label}
        </p>
        {Icon && <Icon className="h-4 w-4 text-[var(--fg-muted)]" aria-hidden="true" />}
      </div>
      <p className="mt-2 text-3xl font-bold text-[var(--fg)]">{value}</p>
      {trend && (
        <p
          className={`mt-1 text-xs font-medium ${trend.value >= 0 ? "text-emerald-800" : "text-red-800"}`}
        >
          {trend.value >= 0 ? "+" : ""}
          {trend.value} {trend.label}
        </p>
      )}
    </div>
  );
}

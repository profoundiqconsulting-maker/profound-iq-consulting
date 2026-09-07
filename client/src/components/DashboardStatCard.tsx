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
    <div
      className={`border border-[#16243d]/10 bg-white/50 p-4 dark:border-[#657084]/20 dark:bg-[#16243d]/80 ${className}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[.1em] text-[#657084] dark:text-[#c1cad7]">
          {label}
        </p>
        {Icon && (
          <Icon
            className="h-4 w-4 text-[#657084] dark:text-[#c1cad7]"
            aria-hidden="true"
          />
        )}
      </div>
      <p className="mt-2 text-3xl font-bold text-[#16243d] dark:text-[#f7f3e8]">
        {value}
      </p>
      {trend && (
        <p
          className={`mt-1 text-xs font-medium ${trend.value >= 0 ? "text-emerald-800 dark:text-emerald-400" : "text-red-800 dark:text-red-400"}`}
        >
          {trend.value >= 0 ? "+" : ""}
          {trend.value} {trend.label}
        </p>
      )}
    </div>
  );
}

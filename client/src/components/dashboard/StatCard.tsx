import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: number; label: string };
  href?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  href,
  className = "",
}: StatCardProps) {
  const TrendIcon = trend
    ? trend.value > 0
      ? TrendingUp
      : trend.value < 0
        ? TrendingDown
        : Minus
    : null;

  const content = (
    <Card
      className={`border border-[#16243d]/15 dark:border-[#657084]/25 bg-white/90 dark:bg-[#16243d]/70 backdrop-blur-sm p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 focus-within:shadow-md ${className}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#16243d] dark:text-[#f7f3e8]">
          {label}
        </p>
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c9a34e]/10 dark:bg-[#c9a34e]/20 text-accent dark:text-accent-on-dark">
            {icon}
          </div>
        )}
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-[#16243d] dark:text-[#f7f3e8]">
        {value}
      </p>
      {trend && TrendIcon && (
        <div className="mt-2 flex items-center gap-1 text-xs">
          <TrendIcon
            className={`h-3.5 w-3.5 ${
              trend.value > 0
                ? "text-emerald-700 dark:text-emerald-400"
                : trend.value < 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-foreground"
            }`}
          />
          <span
            className={
              trend.value > 0
                ? "text-emerald-700 dark:text-emerald-400"
                : trend.value < 0
                  ? "text-red-700 dark:text-red-400"
                  : "text-foreground"
            }
          >
            {trend.value > 0 ? "+" : ""}
            {trend.value} {trend.label}
          </span>
        </div>
      )}
    </Card>
  );

  if (href) {
    return (
      <a
        href={href}
        className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a34e] focus-visible:ring-offset-2 rounded-xl"
      >
        {content}
      </a>
    );
  }

  return content;
}



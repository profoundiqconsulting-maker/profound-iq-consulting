import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Link } from "wouter";

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
      className={`border border-[var(--border)] bg-[var(--bg-elevated)] p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--brand)]/35 hover:shadow-md focus-within:shadow-md ${className}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[var(--fg-muted)]">
          {label}
        </p>
        {icon && (
          <div
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-muted)] text-[var(--fg)]"
          >
            {icon}
          </div>
        )}
      </div>
      <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight text-[var(--fg)]">
        {value}
      </p>
      {trend && TrendIcon && (
        <div className="mt-2 flex items-center gap-1 text-xs">
          <TrendIcon
            className={`h-3.5 w-3.5 ${
              trend.value > 0
                ? "text-[var(--success)]"
                : trend.value < 0
                  ? "text-[var(--danger)]"
                  : "text-[var(--fg-muted)]"
            }`}
          />
          <span
            className={
              trend.value > 0
                ? "text-[var(--success)]"
                : trend.value < 0
                  ? "text-[var(--danger)]"
                  : "text-[var(--fg-muted)]"
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
      <Link
        href={href}
        className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
      >
        {content}
      </Link>
    );
  }

  return content;
}

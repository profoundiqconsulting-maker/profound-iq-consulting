import { useAuth } from "@/_core/hooks/useAuth";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface DashboardHeroProps {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  badge?: {
    label: string;
    variant?: "default" | "secondary" | "outline" | "destructive";
  };
  stats?: Array<{
    label: string;
    value: string | number;
    trend?: { value: number; label: string };
    icon?: React.ReactNode;
  }>;
}

export function DashboardHero({
  eyebrow,
  title,
  description,
  actions,
  badge,
  stats,
}: DashboardHeroProps) {
  const { user } = useAuth();
  
  const displayName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="mb-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#7d5e1e] dark:text-accent-on-dark">
              {eyebrow}
            </p>
            {badge && (
              <Badge
                variant={badge.variant || "secondary"}
                className="text-[9px] font-black uppercase tracking-[.08em]"
              >
                {badge.label}
              </Badge>
            )}
          </div>
          <h1 className="display text-3xl sm:text-4xl lg:text-5xl text-foreground">
            {title}
          </h1>
          {description && (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground">
              {description}
            </p>
          )}
          {user && (
            <p className="mt-2 text-xs text-foreground">
              Welcome back,{" "}
              <span className="font-semibold text-foreground">
                {displayName}
              </span>
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 gap-2 flex-wrap">{actions}</div>
        )}
      </div>
      {stats && stats.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="border border-border bg-card backdrop-blur-sm p-4 transition-all duration-200 hover:shadow-md"
            >
              <p className="text-[10px] font-black uppercase tracking-[.12em] text-foreground">
                {stat.label}
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                {stat.value}
              </p>
              {stat.trend && (
                <p
                  className={`mt-1 text-xs font-medium ${stat.trend.value >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}
                >
                  {stat.trend.value >= 0 ? "+" : ""}
                  {stat.trend.value} {stat.trend.label}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

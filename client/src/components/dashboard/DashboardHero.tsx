import { useAuth } from "@/_core/hooks/useAuth";
import { useLocale } from "@/contexts/LocaleContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface DashboardHeroProps {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  badge?: { label: string; variant?: "default" | "secondary" | "outline" | "destructive" };
  stats?: Array<{ label: string; value: string | number; trend?: { value: number; label: string } }>;
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
  const { t } = useLocale();
  const displayName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="mb-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <p className="text-[10px] font-black uppercase tracking-[.14em] text-accent dark:text-accent-on-dark">
              {eyebrow}
            </p>
            {badge && (
              <Badge variant={badge.variant || "secondary"} className="text-[9px] font-black uppercase tracking-[.08em]">
                {badge.label}
              </Badge>
            )}
          </div>
          <h1 className="display text-3xl sm:text-4xl lg:text-5xl text-[#16243d] dark:text-[#f7f3e8]">
            {title}
          </h1>
          {description && (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#16243d] dark:text-[#f7f3e8]">
              {description}
            </p>
          )}
          {user && (
            <p className="mt-2 text-xs text-[#16243d] dark:text-[#f7f3e8]">
              Welcome back, <span className="font-semibold text-[#16243d] dark:text-[#f7f3e8]">{displayName}</span>
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
              <Card key={index} className="border border-[#16243d]/15 dark:border-[#657084]/25 bg-white/90 dark:bg-[#16243d]/70 backdrop-blur-sm p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#16243d] dark:text-[#f7f3e8]">
                  {stat.label}
                </p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-[#16243d] dark:text-[#f7f3e8]">
                {stat.value}
              </p>
              {stat.trend && (
                <p className={`mt-1 text-xs font-medium ${stat.trend.value >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>
                  {stat.trend.value >= 0 ? "+" : ""}{stat.trend.value} {stat.trend.label}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}



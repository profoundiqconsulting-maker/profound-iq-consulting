import { ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { useLocation } from "wouter";
import { useLocale } from "@/contexts/LocaleContext";
import { dashboardNavGroups, visibleDashboardNavItems } from "./dashboardNavigation";

export function DashboardQuickNav({ role, className = "" }: { role?: string; className?: string }) {
  const [location] = useLocation();
  const { t } = useLocale();
  const items = visibleDashboardNavItems(role);

  return (
    <nav aria-label="Dashboard quick access" className={`overflow-x-auto border border-[#16243d]/10 bg-white/60 p-2 ${className}`}>
      <div className="flex min-w-max items-center gap-1">
        {dashboardNavGroups.flatMap((group) => items.filter((item) => item.group === group.id)).map((item) => {
          const active = location === item.path || location.startsWith(`${item.path}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.path}
              aria-current={active ? "page" : undefined}
              className={`inline-flex min-h-10 items-center gap-2 whitespace-nowrap px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a34e] ${active ? "bg-[#16243d] text-[#f7f3e8]" : "text-[#4a566a] hover:bg-[#fffaf0] hover:text-[#16243d]"}`}
            >
              <Icon size={14} aria-hidden="true" />
              {t(item.labelKey)}
              {active && <ChevronRight size={12} aria-hidden="true" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

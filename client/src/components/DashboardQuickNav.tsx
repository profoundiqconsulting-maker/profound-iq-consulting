import { ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { useLocation } from "wouter";

import {
  dashboardNavGroups,
  visibleDashboardNavItems,
} from "./dashboardNavigation";

export function DashboardQuickNav({
  role,
  className = "",
}: {
  role?: string;
  className?: string;
}) {
  const [location] = useLocation();
  
  const items = visibleDashboardNavItems(role);

  return (
    <nav
      aria-label="Dashboard quick access"
      className={`overflow-x-auto border border-[#16243d]/10 bg-white/70 p-2 shadow-[0_12px_32px_rgba(16,29,53,.06)] ${className}`}
    >
      <div className="flex min-w-max gap-2 lg:grid lg:min-w-0 lg:grid-cols-3">
        {dashboardNavGroups.map(group => {
          const groupItems = items.filter(item => item.group === group.id);
          if (!groupItems.length) return null;
          return (
            <section
              key={group.id}
              className="min-w-[178px] border border-[#16243d]/10 bg-[#f7f3e8]/70 p-2 lg:min-w-0"
              aria-labelledby={`quick-nav-${group.id}`}
            >
              <p
                id={`quick-nav-${group.id}`}
                className="px-2 pb-1 pt-1 text-[9px] font-black uppercase tracking-[.16em] text-[#7d5e1e]"
              >
                {group.fallbackLabel}
              </p>
              <div className="space-y-1">
                {groupItems.map(item => {
                  const active =
                    location === item.path ||
                    location.startsWith(`${item.path}/`);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      href={item.path}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-10 items-center justify-between gap-2 px-2 py-2 text-[10px] font-black uppercase tracking-[.08em] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a34e] ${active ? "bg-[#16243d] text-[#f7f3e8] shadow-sm" : "text-[#4a566a] hover:bg-white hover:text-[#16243d]"}`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <Icon size={14} aria-hidden="true" />
                        {item.fallbackLabel}
                      </span>
                      {active && <ChevronRight size={12} aria-hidden="true" />}
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </nav>
  );
}

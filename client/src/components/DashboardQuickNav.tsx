import { visibleDashboardNavGroups, visibleDashboardNavItems } from "./dashboardNavigation";

export function DashboardQuickNav({ role }: { role?: string }) {
  const groups = visibleDashboardNavGroups(role);
  const items = visibleDashboardNavItems(role);
  return (
    <nav aria-label="Quick navigation" className="grid lg:grid-cols-3 gap-4">
      {groups.map(group => (
        <section key={group.id}>
          <h3>{group.fallbackLabel}</h3>
          <ul>
            {items.filter(item => item.group === group.id).map(item => (
              <li key={item.id}>{item.fallbackLabel}</li>
            ))}
          </ul>
        </section>
      ))}
    </nav>
  );
}

export type LoginTrendRow = { week: string; success: number; blocked: number };
export type DeviceTrendRow = { week: string; desktop: number; mobile: number; tablet: number; unknown: number };

export type LoginEventAggregateRow = { week: string; success: boolean; count: number };
export type DeviceAggregateRow = { week: string; deviceType: string | null; count: number };

export function aggregateLoginTrends(rows: LoginEventAggregateRow[]): LoginTrendRow[] {
  const byWeek = new Map<string, LoginTrendRow>();
  for (const row of rows) {
    const current = byWeek.get(row.week) ?? { week: row.week, success: 0, blocked: 0 };
    if (row.success) current.success += Number(row.count);
    else current.blocked += Number(row.count);
    byWeek.set(row.week, current);
  }
  return Array.from(byWeek.values()).sort((a, b) => a.week.localeCompare(b.week));
}

export function aggregateDeviceTrends(rows: DeviceAggregateRow[]): DeviceTrendRow[] {
  const byWeek = new Map<string, DeviceTrendRow>();
  for (const row of rows) {
    const current = byWeek.get(row.week) ?? { week: row.week, desktop: 0, mobile: 0, tablet: 0, unknown: 0 };
    const device = row.deviceType === "desktop" || row.deviceType === "mobile" || row.deviceType === "tablet" ? row.deviceType : "unknown";
    current[device] += Number(row.count);
    byWeek.set(row.week, current);
  }
  return Array.from(byWeek.values()).sort((a, b) => a.week.localeCompare(b.week));
}

export function normalizeLoginAnalyticsRows(loginRows: LoginEventAggregateRow[], deviceRows: DeviceAggregateRow[]) {
  return { loginTrend: aggregateLoginTrends(loginRows), deviceTrend: aggregateDeviceTrends(deviceRows) };
}

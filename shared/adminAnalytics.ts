export type AnalyticsCountRow = { eventName: string; count: number };
export function summarizeAnalyticsEvents(rows: AnalyticsCountRow[]): Record<string, number> {
  return rows.reduce<Record<string, number>>((result, row) => { result[row.eventName] = (result[row.eventName] ?? 0) + Number(row.count); return result; }, {});
}

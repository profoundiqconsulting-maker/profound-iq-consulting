export type AnalyticsCountRow = { eventName: string; count: number };
export function summarizeAnalyticsEvents(
  rows: AnalyticsCountRow[]
): Record<string, number> {
  return rows.reduce<Record<string, number>>((result, row) => {
    result[row.eventName] = (result[row.eventName] ?? 0) + Number(row.count);
    return result;
  }, {});
}
export function aggregateWeeklyAnalytics(
  rows: Array<AnalyticsCountRow & { week: string }>
) {
  const weekly = rows.reduce<Record<string, Record<string, number>>>(
    (result, row) => {
      result[row.week] ??= {};
      result[row.week][row.eventName] =
        (result[row.week][row.eventName] ?? 0) + Number(row.count);
      return result;
    },
    {}
  );
  return Object.entries(weekly)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, events]) => ({ week, ...events }));
}
export function buildFunnelComparison(
  current: Record<string, number>,
  previous: Record<string, number>,
  benchmarks = { paid: 35, downloaded: 60 }
) {
  const currentFunnel = buildAssessmentFunnel(current);
  const previousFunnel = buildAssessmentFunnel(previous);
  return currentFunnel.map((stage, index) => ({
    ...stage,
    previousValue: previousFunnel[index]?.value ?? 0,
    delta: stage.rate - (previousFunnel[index]?.rate ?? 0),
    benchmark:
      index === 1 ? benchmarks.paid : index === 2 ? benchmarks.downloaded : 100,
  }));
}
export function buildAssessmentFunnel(summary: Record<string, number>) {
  const starts = summary.assessment_started ?? 0;
  const payments = summary.payment_completed ?? 0;
  const downloads = summary.report_downloaded ?? 0;
  return [
    { label: "Started", value: starts, rate: 100 },
    {
      label: "Paid",
      value: payments,
      rate: starts ? Math.round((payments / starts) * 100) : 0,
    },
    {
      label: "Report downloaded",
      value: downloads,
      rate: payments ? Math.round((downloads / payments) * 100) : 0,
    },
  ];
}

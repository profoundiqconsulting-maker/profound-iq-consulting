export type PsychometricAnalyticsExportInput = {
  totals: { started: number; paid: number; pending: number; sent: number; sending: number; failed: number; conversionRate: number; emailRate: number };
  byProfile: Array<{ testSlug: string; started: number; paid: number; sent: number; pending: number; conversionRate: number; emailRate: number }>;
  trend: Array<{ date: string; started: number; paid: number; sent: number }>;
};

const csvCell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export function buildPsychometricAnalyticsCsv(input: PsychometricAnalyticsExportInput): string {
  const rows: unknown[][] = [
    ["section", "profile_or_date", "started", "paid", "pending", "sent", "sending", "failed", "conversion_rate_percent", "email_rate_percent"],
    ["totals", "all", input.totals.started, input.totals.paid, input.totals.pending, input.totals.sent, input.totals.sending, input.totals.failed, input.totals.conversionRate, input.totals.emailRate],
    ...input.byProfile.map((row) => ["profile", row.testSlug, row.started, row.paid, row.pending, row.sent, "", "", row.conversionRate, row.emailRate]),
    ...input.trend.map((row) => ["trend", row.date, row.started, row.paid, "", row.sent, "", "", "", ""]),
  ];
  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

function xmlCell(value: unknown) {
  return `<Cell><Data ss:Type="String">${String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;")}</Data></Cell>`;
}

export function buildPsychometricAnalyticsExcel(input: PsychometricAnalyticsExportInput): string {
  const rows = buildPsychometricAnalyticsCsv(input).split("\n").map((line) => line.split(",").map((cell) => cell.replace(/^"|"$/g, "").replaceAll('""', '"')));
  return `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Psychometric Analytics"><Table>${rows.map((row) => `<Row>${row.map(xmlCell).join("")}</Row>`).join("")}</Table></Worksheet></Workbook>`;
}

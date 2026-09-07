export type ReflectionStatus = "planned" | "active" | "reviewed";

export type ReflectionExportRow = {
  dimensionLabel: string;
  promptText: string;
  note: string;
  status: ReflectionStatus;
};

export function buildReflectionExportCsv(rows: ReflectionExportRow[]): string {
  const escapeCsv = (value: string) =>
    `"${value.replaceAll('"', '""').replace(/\r?\n/g, " ")}"`;
  return [
    ["Dimension", "Reflection prompt", "Respondent response", "Action status"],
    ...rows.map(row => [
      row.dimensionLabel,
      row.promptText,
      row.note || "No response recorded",
      row.status,
    ]),
  ]
    .map(row => row.map(escapeCsv).join(","))
    .join("\n");
}

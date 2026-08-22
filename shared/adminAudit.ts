import type { VerificationRevocationAudit } from "../drizzle/schema";

export type AuditHistoryFilters = {
  adminSearch?: string;
  fromDate?: Date;
  toDate?: Date;
};

export type AuditHistoryQuery = AuditHistoryFilters & {
  page: number;
  pageSize: number;
};

export type AuditHistoryPage = {
  rows: VerificationRevocationAudit[];
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
};

export function filterAuditHistoryRows(rows: VerificationRevocationAudit[], filters: AuditHistoryFilters = {}) {
  const search = filters.adminSearch?.trim().toLowerCase();
  return rows.filter((row) => {
    const adminMatches = !search || [row.actorName, row.actorEmail, row.actorOpenId].some((value) => value?.toLowerCase().includes(search));
    const fromMatches = !filters.fromDate || row.createdAt >= filters.fromDate;
    const toMatches = !filters.toDate || row.createdAt <= filters.toDate;
    return adminMatches && fromMatches && toMatches;
  });
}

export function clampAuditPagination(page: number, pageSize: number) {
  const safePageSize = Math.min(100, Math.max(1, Math.floor(pageSize || 25)));
  return { page: Math.max(1, Math.floor(page || 1)), pageSize: safePageSize };
}

function csvCell(value: unknown) {
  const text = value instanceof Date ? value.toISOString() : String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function buildVerificationAuditCsv(rows: VerificationRevocationAudit[]) {
  const headers = ["Audit ID", "Target Open ID", "Target Email", "Admin Open ID", "Admin Name", "Admin Email", "Reason", "Revoked At UTC"];
  const lines = [headers.join(",")];
  for (const row of rows) lines.push([row.id, row.targetOpenId, row.targetEmail, row.actorOpenId, row.actorName, row.actorEmail, row.reason, row.createdAt].map(csvCell).join(","));
  return `${lines.join("\n")}\n`;
}

export type CourseEnrollmentExportRow = { id: number; courseTitle: string; name: string; email: string; status: string; createdAt: Date; consentedAt: Date };
export type CourseEnrollmentExportFilters = { fromDate?: Date; toDate?: Date; status?: string };
export function filterCourseEnrollmentRows(rows: CourseEnrollmentExportRow[], filters: CourseEnrollmentExportFilters = {}) {
  return rows.filter((row) => (!filters.fromDate || row.createdAt >= filters.fromDate) && (!filters.toDate || row.createdAt <= filters.toDate) && (!filters.status || filters.status === "all" || row.status === filters.status));
}
export function csvCell(value: unknown) { return `"${String(value ?? "").replace(/"/g, '""')}"`; }
export function buildCourseEnrollmentCsv(rows: CourseEnrollmentExportRow[]) {
  const header = ["ID", "Course", "Name", "Email", "Status", "Submitted at", "Consent recorded at"].map(csvCell).join(",");
  const lines = rows.map((row) => [row.id, row.courseTitle, row.name, row.email, row.status, row.createdAt.toISOString(), row.consentedAt.toISOString()].map(csvCell).join(","));
  return [header, ...lines].join("\n");
}

export type ContactInquiryExportAudit = { action: string; previousValue: string | null; nextValue: string | null; actorName: string | null; actorEmail: string | null; createdAt: Date };
export type ContactInquiryExportRow = { id: number; name: string; email: string; category: string; message: string; status: string; assignedToName?: string | null; createdAt: Date; auditHistory?: ContactInquiryExportAudit[] };
export function buildContactInquiryCsv(rows: ContactInquiryExportRow[]) {
  const header = ["ID", "Name", "Email", "Category", "Message", "Status", "Assigned to", "Received at", "Audit history"].map(csvCell).join(",");
  const lines = rows.map((row) => {
    const audit = (row.auditHistory ?? []).map(entry => `${entry.createdAt.toISOString()} | ${entry.action} | ${entry.previousValue ?? "—"} -> ${entry.nextValue ?? "—"} | ${entry.actorName ?? entry.actorEmail ?? "Unknown admin"}`).join("\n");
    return [row.id, row.name, row.email, row.category, row.message, row.status, row.assignedToName, row.createdAt.toISOString(), audit].map(csvCell).join(",");
  });
  return [header, ...lines].join("\n");
}

export type StaffPerformanceExportRow = { openId: string; name: string | null; email: string | null; role: string; assignedCount: number; completedCount: number; openCount: number; averageResolutionDays: number | null };
export function buildStaffPerformanceCsv(rows: StaffPerformanceExportRow[]) {
  const header = ["Open ID", "Name", "Email", "Role", "Assigned", "Completed", "Open", "Average resolution days"].map(csvCell).join(",");
  const lines = rows.map(row => [row.openId, row.name, row.email, row.role, row.assignedCount, row.completedCount, row.openCount, row.averageResolutionDays].map(csvCell).join(","));
  return [header, ...lines].join("\n");
}

export type CourseShareAnalyticsExportRow = { courseSlug: string; platform: string; shares: number };
export function buildCourseShareAnalyticsCsv(rows: CourseShareAnalyticsExportRow[]) {
  const header = ["Course slug", "Platform", "Shares"].map(csvCell).join(",");
  return [header, ...rows.map((row) => [row.courseSlug, row.platform, row.shares].map(csvCell).join(","))].join("\n");
}

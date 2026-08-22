export type CourseEnrollmentExportRow = { id: number; courseTitle: string; name: string; email: string; status: string; createdAt: Date; consentedAt: Date };
export function csvCell(value: unknown) { return `"${String(value ?? "").replace(/"/g, '""')}"`; }
export function buildCourseEnrollmentCsv(rows: CourseEnrollmentExportRow[]) {
  const header = ["ID", "Course", "Name", "Email", "Status", "Submitted at", "Consent recorded at"].map(csvCell).join(",");
  const lines = rows.map((row) => [row.id, row.courseTitle, row.name, row.email, row.status, row.createdAt.toISOString(), row.consentedAt.toISOString()].map(csvCell).join(","));
  return [header, ...lines].join("\n");
}

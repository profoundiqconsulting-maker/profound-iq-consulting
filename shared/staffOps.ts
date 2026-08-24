export type StaffWorkloadRow = { priority: string | null; dueDate: Date | string | null; status: string; createdAt: Date | string };

export const priorityWeight: Record<string, number> = { urgent: 4, high: 3, normal: 2, low: 1 };

export function isInquiryOverdue(row: StaffWorkloadRow, now = Date.now()) {
  return Boolean(row.dueDate && row.status !== "closed" && new Date(row.dueDate).getTime() < now);
}

export function sortAssignedInquiries<T extends StaffWorkloadRow>(rows: T[], mode: "priority" | "dueDate" | "newest") {
  return [...rows].sort((a, b) => mode === "priority" ? (priorityWeight[b.priority ?? "normal"] - priorityWeight[a.priority ?? "normal"]) || (new Date(a.dueDate ?? "2999-12-31").getTime() - new Date(b.dueDate ?? "2999-12-31").getTime()) : mode === "dueDate" ? (new Date(a.dueDate ?? "2999-12-31").getTime() - new Date(b.dueDate ?? "2999-12-31").getTime()) : (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
}

export type AdminRecipientRow = { role: string; email: string | null; emailVerifiedAt: Date | string | null };

export function selectAdminNotificationRecipients(rows: AdminRecipientRow[]): string[] {
  return rows
    .filter((row) => row.role === "admin" && Boolean(row.email?.trim()) && Boolean(row.emailVerifiedAt))
    .map((row) => row.email!.trim())
    .filter((email, index, all) => all.indexOf(email) === index);
}

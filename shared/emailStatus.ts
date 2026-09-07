export function formatReportEmailSentAt(
  value: Date | string | null | undefined
): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function getReportEmailStatusLabel(
  status: string | null | undefined
): string {
  if (status === "sent") return "Email sent";
  if (status === "sending") return "Email in progress";
  return "Email pending";
}

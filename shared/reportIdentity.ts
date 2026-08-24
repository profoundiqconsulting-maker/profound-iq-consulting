export type ReportIdentity = { fullName: string; email: string };

export function resolveReportIdentity(input: { fullName?: string | null; email?: string | null; fallbackName?: string }): ReportIdentity {
  const fullName = input.fullName?.trim() || input.fallbackName?.trim() || "Profound IQ learner";
  const email = input.email?.trim() || "Email not provided";
  return { fullName, email };
}

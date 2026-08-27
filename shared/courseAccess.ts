export const QUALITY_CONTROL_ADMIN_EMAIL = "profoundiqconsulting@gmail.com";

export function isQualityControlAdmin(user: { email?: string | null } | null | undefined) {
  return user?.email?.trim().toLowerCase() === QUALITY_CONTROL_ADMIN_EMAIL;
}

export function canBypassCoursePayment(input: { isQualityControlAdmin: boolean; hasAccessGrant: boolean }) {
  return input.isQualityControlAdmin || input.hasAccessGrant;
}

export function qualityControlQuizScore(input: { rawScore: number; isQualityControlAdmin: boolean }) {
  return input.isQualityControlAdmin ? 100 : input.rawScore;
}

export type CourseAccessInput = { isAuthenticated: boolean; paidStages: number; isQualityControlAdmin: boolean };

/** Returns the installment required before a module's lessons may be opened. Modules are 1-indexed in the learner-facing copy. */
export function requiredPaymentStageForModule(moduleIndex: number) {
  return moduleIndex >= 6 ? 3 : moduleIndex >= 3 ? 2 : 1;
}

export function canAccessModuleLessons({ moduleIndex, paidStages, isQualityControlAdmin }: { moduleIndex: number; paidStages: number; isQualityControlAdmin: boolean }) {
  return isQualityControlAdmin || paidStages >= requiredPaymentStageForModule(moduleIndex);
}

export function canAccessCourseLessons({ isAuthenticated, paidStages, isQualityControlAdmin }: CourseAccessInput) {
  return isAuthenticated && (isQualityControlAdmin || paidStages >= 1);
}

export function courseAccessReason({ isAuthenticated, paidStages, isQualityControlAdmin }: CourseAccessInput) {
  if (!isAuthenticated) return "Sign in or register first. After the first 25% enrollment payment is verified, the full lesson player becomes available.";
  if (!isQualityControlAdmin && paidStages < 1) return "Complete the first 25% enrollment payment to unlock the full lesson player, simulations, notes, and module progression.";
  return "Detailed lessons are available.";
}

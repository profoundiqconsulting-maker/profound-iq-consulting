export function canBypassCoursePayment(input: {
  hasAccessGrant: boolean;
}) {
  return input.hasAccessGrant;
}

export function qualityControlQuizScore(input: {
  rawScore: number;
}) {
  return input.rawScore;
}

/**
 * Certificate output is available only for the owning account with a computed
 * report. Payment must be completed.
 */
export function canAccessAssessmentCertificate(input: {
  identityMatches: boolean;
  paymentStatus: string | null | undefined;
  hasReport: boolean;
}) {
  return input.identityMatches && input.hasReport && input.paymentStatus === "paid";
}

export type CourseAccessInput = {
  isAuthenticated: boolean;
  paidStages: number;
};

/** Returns the installment required before a module's lessons may be opened. Modules are 1-indexed in the learner-facing copy. */
export function requiredPaymentStageForModule(moduleIndex: number) {
  return moduleIndex >= 6 ? 3 : moduleIndex >= 3 ? 2 : 1;
}

export function canAccessModuleLessons({
  moduleIndex,
  paidStages,
}: {
  moduleIndex: number;
  paidStages: number;
}) {
  return paidStages >= requiredPaymentStageForModule(moduleIndex);
}

export function canAccessCourseLessons({
  isAuthenticated,
  paidStages,
}: CourseAccessInput) {
  return isAuthenticated && paidStages >= 1;
}

export function courseAccessReason({
  isAuthenticated,
  paidStages,
}: CourseAccessInput) {
  if (!isAuthenticated)
    return "Sign in or register first. After the first 25% enrollment payment is verified, the full lesson player becomes available.";
  if (paidStages < 1)
    return "Complete the first 25% enrollment payment to unlock the full lesson player, simulations, notes, and module progression.";
  return "Detailed lessons are available.";
}

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

/** Returns the installment required before a module's lessons may be opened. Module 1 is free (stage 0). Modules are 1-indexed in the learner-facing copy. */
export function requiredPaymentStageForModule(moduleIndex: number) {
  return moduleIndex >= 7 ? 4 : moduleIndex >= 4 ? 3 : moduleIndex >= 1 ? 2 : 0;
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
  return isAuthenticated;
}

export function courseAccessReason({
  isAuthenticated,
  paidStages,
}: CourseAccessInput) {
  if (!isAuthenticated)
    return "Sign in or register first. Module 1 is free; stages 2–4 require payment.";
  if (paidStages < 1)
    return "Module 1 is free. Complete Stage 2 to unlock Modules 2–4, Stage 3 for Modules 5–7, and Stage 4 for Modules 8–10.";
  return "Detailed lessons are available.";
}

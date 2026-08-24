/* Profound IQ Consulting — shared payment rollup contract for the navy/gold learner workspace. */

export const COURSE_PAYMENT_TOTAL_KES = 4_999;
export const COURSE_PAYMENT_STAGE_KES = 1_250;
export const COURSE_PAYMENT_STAGE_COUNT = 4;

export type CoursePaymentStageLike = {
  stage: number;
  paymentStatus: string;
  paidAt?: Date | string | null;
  paystackReference?: string | null;
};

export type CourseLearningProgressLike = {
  lessonsCompleted: number;
  moduleCount: number;
};

export function summarizeCourseEnrollment(input: { stages: CoursePaymentStageLike[]; lessonsCompleted?: number; moduleCount?: number }) {
  const paidStages = input.stages.filter((stage) => stage.paymentStatus === "paid").length;
  const lessonsCompleted = Math.max(0, input.lessonsCompleted ?? 0);
  const moduleCount = Math.max(1, input.moduleCount ?? 10);
  const lessonsPerModule = 7;
  const totalLessons = moduleCount * lessonsPerModule;
  const completedModules = Math.min(moduleCount, Math.floor(lessonsCompleted / lessonsPerModule));
  const learningPercent = Math.min(100, Math.round((lessonsCompleted / totalLessons) * 100));
  return {
    paidStages,
    totalStages: COURSE_PAYMENT_STAGE_COUNT,
    paidAmountKes: paidStages * COURSE_PAYMENT_STAGE_KES,
    remainingAmountKes: Math.max(0, COURSE_PAYMENT_TOTAL_KES - paidStages * COURSE_PAYMENT_STAGE_KES),
    paymentPercent: Math.min(100, Math.round((paidStages / COURSE_PAYMENT_STAGE_COUNT) * 100)),
    nextStage: paidStages < COURSE_PAYMENT_STAGE_COUNT ? paidStages + 1 : null,
    completedModules,
    learningPercent,
  };
}

export function paymentRollupLabel(status: string) {
  return status === "paid" ? "Verified" : "Pending";
}

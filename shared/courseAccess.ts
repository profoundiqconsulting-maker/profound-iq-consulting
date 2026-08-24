export type CourseAccessInput = { isAuthenticated: boolean; paidStages: number; isQualityControlAdmin: boolean };

export function canAccessCourseLessons({ isAuthenticated, paidStages, isQualityControlAdmin }: CourseAccessInput) {
  return isAuthenticated && (isQualityControlAdmin || paidStages >= 1);
}

export function courseAccessReason({ isAuthenticated, paidStages, isQualityControlAdmin }: CourseAccessInput) {
  if (!isAuthenticated) return "Sign in or register first. After the first 25% enrollment payment is verified, the full lesson player becomes available.";
  if (!isQualityControlAdmin && paidStages < 1) return "Complete the first 25% enrollment payment to unlock the full lesson player, simulations, notes, and module progression.";
  return "Detailed lessons are available.";
}

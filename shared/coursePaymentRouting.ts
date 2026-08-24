/* Profound IQ Consulting — shared route contract for verified course payment handoff. */

export function buildCoursePaymentSuccessPath(courseSlug: string, reference: string) {
  return `/courses/payment-success?course=${encodeURIComponent(courseSlug)}&reference=${encodeURIComponent(reference)}`;
}

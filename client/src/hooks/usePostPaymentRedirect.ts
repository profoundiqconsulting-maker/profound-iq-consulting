/* Profound IQ Consulting — client-side hook for post-payment redirect.
 *
 * Wraps the shared `resolvePostPaymentRedirect` logic and integrates with
 * tRPC queries to determine the user's current course state, completion
 * status, and module availability before redirecting.
 */

import { useCallback } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  resolvePostPaymentRedirect,
  type PaymentContext,
  type ProductType,
} from "@shared/postPaymentRedirect";

export interface UsePostPaymentRedirectOptions {
  productType: ProductType;
  courseSlug?: string;
  reference?: string;
  stage?: number;
  enabled?: boolean;
  /** Called after the redirect decision is made but before navigation. */
  onRedirect?: (
    decision: ReturnType<typeof resolvePostPaymentRedirect>
  ) => void;
}

export function usePostPaymentRedirect({
  productType,
  courseSlug,
  reference,
  stage,
  enabled = true,
  onRedirect,
}: UsePostPaymentRedirectOptions) {
  const [, setLocation] = useLocation();
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  // Fetch course enrollment state for course-related products.
  const courseStateQuery = trpc.course.state.useQuery(
    { courseSlug: courseSlug ?? "" },
    {
      enabled: enabled && Boolean(courseSlug) && isAuthenticated,
      retry: false,
    }
  );

  const redirect = useCallback(() => {
    if (!enabled) return null;

    const paidStages =
      courseSlug && courseStateQuery.data
        ? (courseStateQuery.data
            .find(record => record.enrollment.courseSlug === courseSlug)
            ?.stages.filter(s => s.paymentStatus === "paid").length ?? 0)
        : undefined;

    // Determine completion status for courses.
    let isComplete: boolean | undefined;
    if (productType === "course" || productType === "course_stage") {
      const enrollment = courseStateQuery.data?.find(
        record => record.enrollment.courseSlug === courseSlug
      );
      const hasCertificate = (enrollment?.certificates?.length ?? 0) > 0;
      const allStagesPaid =
        (enrollment?.stages?.length ?? 0) >= 4 &&
        enrollment?.stages.every(s => s.paymentStatus === "paid");
      isComplete = hasCertificate && allStagesPaid;
    }

    const ctx: PaymentContext = {
      productType,
      courseSlug,
      reference,
      stage,
      isAuthenticated,
      paidStages,
      isComplete,
      hasAvailableModule: true, // If we got here, payment was successful.
    };

    const decision = resolvePostPaymentRedirect(ctx);
    onRedirect?.(decision);
    return decision;
  }, [
    enabled,
    productType,
    courseSlug,
    reference,
    stage,
    isAuthenticated,
    courseStateQuery.data,
    onRedirect,
  ]);

  const navigate = useCallback(() => {
    const decision = redirect();
    if (!decision) return;
    if (decision.replace) {
      setLocation(decision.path, { replace: true });
    } else {
      setLocation(decision.path);
    }
  }, [redirect, setLocation]);

  return {
    redirect,
    navigate,
    loading: authLoading || courseStateQuery.isLoading,
    isAuthenticated,
    user,
  };
}

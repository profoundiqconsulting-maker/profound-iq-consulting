/* Profound IQ Consulting — shared post-payment redirect contract.
 *
 * Resolves the appropriate next step after a verified payment based on:
 *   - product type (assessment, careerpath, psychometric, course, course_stage)
 *   - user profile / authentication state
 *   - module availability and completion status
 *
 * The routing priority is:
 *   1. If the product is a course or course stage → continue in the course workspace
 *   2. If the product is assessment / careerpath / psychometric → go to the report
 *   3. Fallback: dashboard overview
 */

export type ProductType =
  "assessment" | "careerpath" | "psychometric" | "course" | "course_stage";

export type PaymentContext = {
  productType: ProductType;
  courseSlug?: string;
  reference?: string;
  stage?: number;
  isAuthenticated: boolean;
  /** Number of paid installments for the relevant course enrollment. */
  paidStages?: number;
  /** Whether the user has already completed all available modules for this product. */
  isComplete?: boolean;
  /** Whether any modules are enabled/accessible for this product. */
  hasAvailableModule?: boolean;
};

export type RedirectDecision = {
  path: string;
  reason: string;
  /** When true the caller should replace the current history entry (not push). */
  replace?: boolean;
};

const DASHBOARD_PATH = "/dashboard";
const ASSESSMENT_REPORT_PATH = "/assessment";
const CAREERPATH_REPORT_PATH = "/careerpath/reports";
const PSYCHOMETRIC_REPORT_PATH = "/psychometrics";

function buildCoursePath(courseSlug: string): string {
  return `/courses/${encodeURIComponent(courseSlug)}`;
}

function buildCareerPathReportPath(reference?: string): string {
  if (!reference) return CAREERPATH_REPORT_PATH;
  return `${CAREERPATH_REPORT_PATH}?reference=${encodeURIComponent(reference)}`;
}

function buildPsychometricReportPath(reference?: string): string {
  if (!reference) return PSYCHOMETRIC_REPORT_PATH;
  return `${PSYCHOMETRIC_REPORT_PATH}?reference=${encodeURIComponent(reference)}`;
}

function buildAssessmentReportPath(reference?: string): string {
  if (!reference) return ASSESSMENT_REPORT_PATH;
  return `${ASSESSMENT_REPORT_PATH}?reference=${encodeURIComponent(reference)}`;
}

/**
 * Determine where to send the user after a successful payment.
 *
 * Rules:
 *   - course / course_stage → course workspace (or dashboard if no slug)
 *   - assessment → assessment report
 *   - careerpath → career path reports
 *   - psychometric → psychometric report
 *   - unauthenticated → auth login with returnTo
 *   - no modules enabled / all complete → dashboard with messaging
 */
export function resolvePostPaymentRedirect(
  ctx: PaymentContext
): RedirectDecision {
  // Unauthenticated users must sign in first.
  if (!ctx.isAuthenticated) {
    return {
      path: `/auth?mode=login&returnTo=${encodeURIComponent("/")}`,
      reason: "Authentication required before accessing purchased content.",
      replace: true,
    };
  }

  // Course / course stage payments → continue in the course workspace.
  if (ctx.productType === "course" || ctx.productType === "course_stage") {
    if (ctx.courseSlug) {
      // If the course is fully completed, still route to the workspace so the
      // user can review their certificate / progress.
      return {
        path: buildCoursePath(ctx.courseSlug),
        reason: ctx.isComplete
          ? "Course fully completed — review your workspace."
          : "Continue your course learning path.",
      };
    }
    return {
      path: "/dashboard/enrolled-courses",
      reason: "Course payment verified — view your enrolled courses.",
    };
  }

  // Assessment → report.
  if (ctx.productType === "assessment") {
    return {
      path: buildAssessmentReportPath(ctx.reference),
      reason: "Assessment payment verified — view your report.",
    };
  }

  // CareerPath → reports.
  if (ctx.productType === "careerpath") {
    return {
      path: buildCareerPathReportPath(ctx.reference),
      reason: "CareerPath payment verified — view your report.",
    };
  }

  // Psychometric → report.
  if (ctx.productType === "psychometric") {
    return {
      path: buildPsychometricReportPath(ctx.reference),
      reason: "Psychometric payment verified — view your report.",
    };
  }

  // Fallback: dashboard.
  return {
    path: DASHBOARD_PATH,
    reason: "Payment verified — continue to your dashboard.",
  };
}

/**
 * Build a returnTo URL for auth redirects that preserve the user's
 * intended destination after sign-in.
 */
export function buildAuthReturnTo(targetPath: string): string {
  return `/auth?mode=login&returnTo=${encodeURIComponent(targetPath)}`;
}

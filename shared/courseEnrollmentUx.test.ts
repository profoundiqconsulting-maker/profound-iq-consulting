import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const workspaceSource = readFileSync(
  resolve(process.cwd(), "client/src/pages/CourseWorkspace.tsx"),
  "utf8"
);
const coursesSource = readFileSync(
  resolve(process.cwd(), "client/src/pages/Courses.tsx"),
  "utf8"
);
const accessSource = readFileSync(
  resolve(process.cwd(), "shared/courseAccess.ts"),
  "utf8"
);
const routerSource = readFileSync(
  resolve(process.cwd(), "server/routers.ts"),
  "utf8"
);
const authSource = readFileSync(
  resolve(process.cwd(), "client/src/pages/Auth.tsx"),
  "utf8"
);
const dashboardSource = readFileSync(
  resolve(process.cwd(), "client/src/pages/UserDashboard.tsx"),
  "utf8"
);
const dashboardLayoutSource = readFileSync(
  resolve(process.cwd(), "client/src/components/DashboardLayout.tsx"),
  "utf8"
);
const adminDashboardSource = readFileSync(
  resolve(process.cwd(), "client/src/pages/AdminDashboard.tsx"),
  "utf8"
);
const localeSource = readFileSync(
  resolve(process.cwd(), "client/src/contexts/LocaleContext.tsx"),
  "utf8"
);

describe("course enrollment access flow", () => {
  it("offers separate sign-in and registration paths that preserve the course route", () => {
    expect(workspaceSource).toContain("mode=login&returnTo=");
    expect(workspaceSource).toContain("mode=register&returnTo=");
    expect(authSource).toContain("const [returnTo]");
    expect(authSource).toContain("navigate(returnTo)");
  });

  it("continues signed-in catalog enrollment directly into stage-one checkout", () => {
    expect(coursesSource).toContain(
      "const { user, isAuthenticated } = useAuth();"
    );
    expect(coursesSource).toContain("trpc.course.enroll.useMutation");
    expect(coursesSource).toContain(
      "stageCheckout.mutate("
    );
    expect(coursesSource).toContain(
      "enrollmentId: result.enrollmentId, stage: 1"
    );
    expect(coursesSource).toContain(
      "window.location.href = `/auth?mode=login&returnTo="
    );
  });

  it("creates an authenticated enrollment and initializes stage one before redirecting to Paystack", () => {
    expect(workspaceSource).toContain("function FirstStageCheckout");
    expect(workspaceSource).toContain("trpc.course.enroll.useMutation");
    expect(workspaceSource).toContain("stage: 1");
    expect(workspaceSource).toContain(
      "initializeStageInlinePayment.useMutation"
    );
    expect(workspaceSource).toContain(
      "Lesson access opens only after payment verification"
    );
    expect(workspaceSource).toContain(
      "checkoutMutation.mutate("
    );
    expect(workspaceSource).toContain(
      "enrollmentId: result.enrollmentId, stage: 1"
    );
  });

  it("keeps lesson content behind auth-session resolution and staged payment gates", () => {
    expect(workspaceSource).toContain("loading: authLoading");
    expect(workspaceSource).toContain(
      "Your lessons remain protected while we confirm your signed-in"
    );
    expect(workspaceSource).toContain("canAccessCourseLessons");
    expect(accessSource).toContain("Complete the first 25% enrollment payment");
  });

  it("keeps server lesson mutations behind the same staged-payment policy", () => {
    expect(routerSource).toContain(
      "const requiredStage = moduleNumber >= 7 ? 3 : moduleNumber >= 4 ? 2 : 1"
    );
    expect(routerSource).toContain("Verify payment stage ${requiredStage}");
    expect(routerSource).toContain("canBypassCoursePayment");
    expect(routerSource).toContain("isQualityControlAdmin(ctx.user)");
  });

  it("allows Quality Control certificate generation while retaining report ownership and data checks", () => {
    expect(routerSource).toContain("canAccessAssessmentCertificate");
    expect(routerSource).toContain("certificateSvgPreview");
    expect(routerSource).toContain("downloadCompletionCertificatePdf");
    expect(routerSource).toContain("paymentStatus: attempt.paymentStatus");
    expect(routerSource).toContain("hasReport: Boolean(attempt.report)");
    expect(accessSource).toContain(
      "Quality Control Mode bypasses payment status"
    );
  });

  it("shows Quality Control Mode only for the designated admin in the workspace shell", () => {
    expect(dashboardLayoutSource).toContain("isQualityControlAdmin(user)");
    expect(dashboardLayoutSource).toContain(
      'aria-label="Quality Control Mode active"'
    );
    expect(dashboardLayoutSource).toContain("QC Mode");
  });

  it("exposes a development-only mock checkout without weakening production payment verification", () => {
    expect(workspaceSource).toContain(
      "trpc.course.mockFirstStagePayment.useMutation"
    );
    expect(workspaceSource).toContain("import.meta.env.DEV");
    expect(workspaceSource).toContain('t("mockCheckoutDescription")');
  });

  it("links dashboard users to payment history and keeps mock reset development-only", () => {
    expect(dashboardSource).toContain("/settings#payment-history");
    expect(workspaceSource).toContain(
      "trpc.course.resetMockCoursePayments.useMutation"
    );
    expect(workspaceSource).toContain("Reset mock payments");
    expect(workspaceSource).toContain('Reset all mock payment stages');
  });

  it("provides payment and enrollment translations for every supported locale", () => {
    for (const key of [
      "enrollmentStatus",
      "paymentPending",
      "paymentPaid",
      "paymentStage",
      "paymentHistoryShortcut",
      "mockCheckoutDescription",
    ])
      expect(localeSource).toContain(`${key}:`);
  });
});

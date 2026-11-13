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
    expect(workspaceSource).toContain("function EnrollButton");
    expect(workspaceSource).toContain("trpc.course.enroll.useMutation");
    expect(workspaceSource).toContain("stage: 1");
    expect(workspaceSource).toContain(
      "initializeStageInlinePayment.useMutation"
    );
    expect(workspaceSource).toContain(
      "The first stage is free and unlocks"
    );
    expect(workspaceSource).toContain(
      "checkout.mutate("
    );
    expect(workspaceSource).toContain(
      "enrollmentId: result.enrollmentId, stage: 1"
    );
  });

  it("keeps lesson content behind auth-session resolution and staged payment gates", () => {
    expect(workspaceSource).toContain("loading: authLoading");
    expect(workspaceSource).toContain(
      "Checking your workspace"
    );
    expect(workspaceSource).toContain("canAccessCourseLessons");
    expect(accessSource).toContain("Detailed lessons are available");
  });

  it("keeps server lesson mutations behind the same staged-payment policy", () => {
    expect(routerSource).toContain(
      "const requiredStage = moduleNumber >= 8 ? 4 : moduleNumber >= 5 ? 3 : moduleNumber >= 2 ? 2 : 0"
    );
    expect(routerSource).toContain("Verify payment stage ${requiredStage}");
    expect(routerSource).toContain("canBypassCoursePayment");
    expect(routerSource).toContain("hasAccessGrant");
  });

  it("requires payment and ownership for certificate access", () => {
    expect(routerSource).toContain("canAccessAssessmentCertificate");
    expect(routerSource).toContain("certificateSvgPreview");
    expect(routerSource).toContain("downloadCompletionCertificatePdf");
    expect(routerSource).toContain("paymentStatus: attempt.paymentStatus");
    expect(routerSource).toContain("hasReport: Boolean(attempt.report)");
    expect(routerSource).not.toContain("isQualityControlAdmin");
  });

  it("removes Quality Control Mode indicators from the dashboard layout", () => {
    expect(dashboardLayoutSource).not.toContain("isQualityControlAdmin(user)");
    expect(dashboardLayoutSource).not.toContain(
      'aria-label="Quality Control Mode active"'
    );
    expect(dashboardLayoutSource).not.toContain("QC Mode");
    expect(dashboardLayoutSource).not.toContain("QC");
  });

  it("does not expose mock checkout in production code", () => {
    expect(workspaceSource).not.toContain(
      "trpc.course.mockFirstStagePayment.useMutation"
    );
    expect(workspaceSource).not.toContain(
      "trpc.course.resetMockCoursePayments.useMutation"
    );
    expect(routerSource).not.toContain("mockFirstStagePayment");
    expect(routerSource).not.toContain("resetMockCoursePayments");
  });

  it("links dashboard users to payment history", () => {
    expect(dashboardSource).toContain("/settings#payment-history");
  });
});

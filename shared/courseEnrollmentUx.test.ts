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
const enrollmentFormSource = readFileSync(
  resolve(process.cwd(), "client/src/components/CourseEnrollmentForm.tsx"),
  "utf8"
);
const appSource = readFileSync(
  resolve(process.cwd(), "client/src/App.tsx"),
  "utf8"
);
const navigationSource = readFileSync(
  resolve(process.cwd(), "client/src/components/SiteNavigation.tsx"),
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
  it("redirects guest enrollment to signup and preserves a course return route", () => {
    expect(workspaceSource).toContain("<CourseEnrollmentForm");
    expect(workspaceSource).toContain("mode=login&returnTo=");
    expect(workspaceSource).not.toContain("mode=register&returnTo=");
    expect(authSource).toContain("const [returnTo]");
    expect(authSource).toContain("navigate(returnTo)");
    expect(enrollmentFormSource).toContain("const signupHref =");
    expect(enrollmentFormSource).toContain(
      "`/signup?returnTo=${encodeURIComponent("
    );
    expect(enrollmentFormSource).toContain(
      "`/courses/${courseSlug}?workspace=1`"
    );
    expect(appSource).toContain("function AuthAliasRedirect()");
    expect(appSource).toContain(
      'window.location.pathname === "/signup" ? "register" : "login"'
    );
    expect(appSource).toContain(
      '<Route path="/signup" component={AuthAliasRedirect} />'
    );
    const signupRedirect = enrollmentFormSource.indexOf("navigate(signupHref)");
    const openEnrollmentForm = enrollmentFormSource.indexOf("setIsOpen(true)");
    expect(signupRedirect).toBeGreaterThan(-1);
    expect(openEnrollmentForm).toBeGreaterThan(signupRedirect);
  });

  it("connects sitewide signup links to the signup route and preserves the current page", () => {
    expect(navigationSource).toContain(
      "`/signup?returnTo=${encodeURIComponent(signupReturnTo)}`"
    );
  });

  it("shares required account details between signup and course enrollment", () => {
    expect(authSource).toContain(
      "courseEnrollmentAccountDetailsSchema.safeParse"
    );
    expect(authSource).toMatch(/id="register-email"[\s\S]{0,100}required/);
    expect(authSource).toMatch(/id="register-phone"[\s\S]{0,800}required/);
    expect(authSource).toContain("Email, phone, or username");
    expect(enrollmentFormSource).toContain(
      "email: user.email || current.email"
    );
    expect(enrollmentFormSource).toContain(
      "phone: current.phone || user.phone ||"
    );
  });

  it("routes catalog and course detail enrollment through shared checkout", () => {
    expect(coursesSource).toContain("<CourseEnrollmentForm");
    expect(enrollmentFormSource).toContain("trpc.course.enroll.useMutation");
    expect(enrollmentFormSource).toContain(
      "trpc.course.initializeStageInlinePayment.useMutation"
    );
    expect(enrollmentFormSource).toContain(
      "enrollmentId: result.enrollmentId,\n        stage: 1"
    );
    expect(enrollmentFormSource).toContain("setInlineModalOpen(true)");
    expect(enrollmentFormSource).toContain("<PaystackInlineModal");
  });

  it("uses a responsive, accessible dialog for course enrollment", () => {
    expect(enrollmentFormSource).toContain(
      "<Dialog open={isOpen} onOpenChange={setIsOpen}>"
    );
    expect(enrollmentFormSource).toContain("<DialogTitle");
    expect(enrollmentFormSource).toContain(
      'aria-label="Close enrollment form"'
    );
    expect(enrollmentFormSource).toContain("max-h-[92dvh]");
  });

  it("keeps lesson content behind auth-session resolution and staged payment gates", () => {
    expect(workspaceSource).toContain("loading: authLoading");
    expect(workspaceSource).toContain("Checking your workspace");
    expect(workspaceSource).toContain("canAccessCourseLessons");
    expect(accessSource).toContain("Detailed lessons are available");
  });

  it("keeps server lesson mutations behind the same staged-payment policy", () => {
    expect(routerSource).toMatch(
      /const requiredStage\s*=\s*moduleNumber >= 8\s*\? 4\s*:\s*moduleNumber >= 5\s*\? 3\s*:\s*moduleNumber >= 2\s*\? 2\s*:\s*0/
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

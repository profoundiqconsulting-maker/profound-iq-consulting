import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const workspaceSource = readFileSync(resolve(process.cwd(), "client/src/pages/CourseWorkspace.tsx"), "utf8");
const authSource = readFileSync(resolve(process.cwd(), "client/src/pages/Auth.tsx"), "utf8");
const dashboardSource = readFileSync(resolve(process.cwd(), "client/src/pages/UserDashboard.tsx"), "utf8");
const localeSource = readFileSync(resolve(process.cwd(), "client/src/contexts/LocaleContext.tsx"), "utf8");

describe("course enrollment access flow", () => {
  it("offers separate sign-in and registration paths that preserve the course route", () => {
    expect(workspaceSource).toContain("mode=login&returnTo=");
    expect(workspaceSource).toContain("mode=register&returnTo=");
    expect(authSource).toContain("const [returnTo]");
    expect(authSource).toContain("navigate(returnTo)");
  });

  it("creates an authenticated enrollment and initializes stage one before redirecting to Paystack", () => {
    expect(workspaceSource).toContain("function FirstStageCheckout");
    expect(workspaceSource).toContain("trpc.course.enroll.useMutation");
    expect(workspaceSource).toContain("stage: 1");
    expect(workspaceSource).toContain("payment.authorizationUrl");
    expect(workspaceSource).toContain("Lesson access opens only after payment verification");
  });

  it("exposes a development-only mock checkout without weakening production payment verification", () => {
    expect(workspaceSource).toContain("trpc.course.mockFirstStagePayment.useMutation");
    expect(workspaceSource).toContain("import.meta.env.DEV");
    expect(workspaceSource).toContain("t(\"mockCheckoutDescription\")");
  });

  it("links dashboard users to payment history and keeps mock reset development-only", () => {
    expect(dashboardSource).toContain("/settings#payment-history");
    expect(workspaceSource).toContain("trpc.course.resetMockCoursePayments.useMutation");
    expect(workspaceSource).toContain("Reset mock payments");
    expect(workspaceSource).toContain("window.confirm(\"Reset all mock payment stages");
  });

  it("provides payment and enrollment translations for every supported locale", () => {
    for (const key of ["enrollmentStatus", "paymentPending", "paymentPaid", "paymentStage", "paymentHistoryShortcut", "mockCheckoutDescription"]) expect(localeSource).toContain(`${key}:`);
    expect(localeSource).toContain("const paymentOverrides");
    expect(localeSource).toContain("paymentOverrides[code]");
  });
});

import { describe, expect, it, vi } from "vitest";

const { getAssessmentAdminOverview } = vi.hoisted(() => ({
  getAssessmentAdminOverview: vi.fn(),
}));

vi.mock("./db", () => ({
  getAssessmentAdminOverview,
  getAssessmentAttempt: vi.fn(),
  createAssessmentAttempt: vi.fn(),
  getAssessmentAttemptByReference: vi.fn(),
  markAssessmentPaid: vi.fn(),
  setPaystackReference: vi.fn(),
}));

const { appRouter } = await import("./routers");

describe("assessment.adminOverview data boundary", () => {
  it("returns score and payment fields without raw answers or report payloads", async () => {
    getAssessmentAdminOverview.mockResolvedValue({
      summary: { total: 1, paid: 1, pending: 0 },
      attempts: [
        {
          id: 1,
          name: "Example Participant",
          email: "example@example.com",
          paymentStatus: "paid",
          paystackReference: "piq-reference",
          createdAt: new Date(),
          paidAt: new Date(),
          overallScore: 82,
          overallBand: "Strong foundation",
        },
      ],
    });
    const now = new Date();
    const caller = appRouter.createCaller({
      user: {
        id: 1,
        openId: "admin-test",
        name: "Admin",
        email: "admin@example.com",
        loginMethod: "test",
        role: "admin",
        createdAt: now,
        updatedAt: now,
        lastSignedIn: now,
      },
      req: { protocol: "https", headers: {} } as never,
      res: {} as never,
    });

    const result = await caller.assessment.adminOverview();
    expect(result.summary.paid).toBe(1);
    expect(result.attempts[0]).toMatchObject({
      paymentStatus: "paid",
      overallScore: 82,
    });
    expect(result.attempts[0]).not.toHaveProperty("answers");
    expect(result.attempts[0]).not.toHaveProperty("report");
  });
});

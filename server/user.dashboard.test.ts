import { describe, expect, it, vi } from "vitest";

const { getUserAssessmentHistory, getAssessmentAttempt } = vi.hoisted(() => ({ getUserAssessmentHistory: vi.fn(), getAssessmentAttempt: vi.fn() }));
const { renderAssessmentReportPdf } = vi.hoisted(() => ({ renderAssessmentReportPdf: vi.fn() }));
const { emailAssessmentReportIfNeeded } = vi.hoisted(() => ({ emailAssessmentReportIfNeeded: vi.fn() }));

vi.mock("./db", () => ({
  recordAnalyticsEvent: vi.fn(),
  getUserAssessmentHistory,
  getAssessmentAdminOverview: vi.fn(),
  getAssessmentAttempt,
  createAssessmentAttempt: vi.fn(),
  getAssessmentAttemptByReference: vi.fn(),
  markAssessmentPaid: vi.fn(),
  setPaystackReference: vi.fn(),
}));

vi.mock("./reportPdf", () => ({ renderAssessmentReportPdf }));
vi.mock("./email", () => ({ emailAssessmentReportIfNeeded }));

const { appRouter } = await import("./routers");

function context(user: { email?: string } | null) {
  const now = new Date();
  return {
    user: user ? { id: 1, openId: "user-dashboard-test", name: "Participant", email: user.email ?? null, loginMethod: "test", role: "user", createdAt: now, updatedAt: now, lastSignedIn: now } : null,
    req: { protocol: "https", headers: {} } as never,
    res: {} as never,
  };
}

const paidReport = { overallScore: 78, overallBand: "Building momentum", dimensions: [], strengths: ["Clarity of direction"], focusAreas: ["Growth orientation"], disclaimer: "Educational development tool." };

describe("dashboard.mine", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(context(null));
    await expect(caller.dashboard.mine()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("scopes the query to the authenticated account email", async () => {
    getUserAssessmentHistory.mockResolvedValue([]);
    const caller = appRouter.createCaller(context({ email: "owner@example.com" }));
    await caller.dashboard.mine();
    expect(getUserAssessmentHistory).toHaveBeenCalledWith("owner@example.com");
  });

  it("returns the report email delivery status without exposing report internals", async () => {
    getUserAssessmentHistory.mockResolvedValue([{ id: 12, paymentStatus: "paid", reportEmailStatus: "sent", reportEmailSentAt: new Date("2026-08-22T06:08:16Z"), overallScore: 79, overallBand: "Building momentum", paystackReference: "reference", createdAt: new Date(), paidAt: new Date(), report: paidReport }]);
    const caller = appRouter.createCaller(context({ email: "owner@example.com" }));
    const result = await caller.dashboard.mine();
    expect(result[0]).toMatchObject({ reportEmailStatus: "sent", overallScore: 79 });
    expect(result[0]).not.toHaveProperty("answers");
  });
});

describe("dashboard.resendReportEmail", () => {
  it("rejects unauthenticated users", async () => {
    const caller = appRouter.createCaller(context(null));
    await expect(caller.dashboard.resendReportEmail({ attemptId: 12 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("does not reveal another account's report for resend", async () => {
    getAssessmentAttempt.mockResolvedValue({ id: 12, email: "other@example.com", paymentStatus: "paid", report: paidReport, reportEmailStatus: "pending", name: "Other", createdAt: new Date() });
    const caller = appRouter.createCaller(context({ email: "owner@example.com" }));
    await expect(caller.dashboard.resendReportEmail({ attemptId: 12 })).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(emailAssessmentReportIfNeeded).not.toHaveBeenCalled();
  });

  it("does not resend an already-sent report", async () => {
    getAssessmentAttempt.mockResolvedValue({ id: 12, email: "owner@example.com", paymentStatus: "paid", report: paidReport, reportEmailStatus: "sent", reportEmailSentAt: new Date(), name: "Participant", createdAt: new Date() });
    const caller = appRouter.createCaller(context({ email: "owner@example.com" }));
    await expect(caller.dashboard.resendReportEmail({ attemptId: 12 })).rejects.toMatchObject({ code: "CONFLICT" });
    expect(emailAssessmentReportIfNeeded).not.toHaveBeenCalled();
  });

  it("triggers a resend for the authenticated owner's paid pending report", async () => {
    getAssessmentAttempt.mockResolvedValue({ id: 12, email: "owner@example.com", paymentStatus: "paid", report: paidReport, reportEmailStatus: "pending", name: "Participant", createdAt: new Date() });
    emailAssessmentReportIfNeeded.mockResolvedValue(true);
    const caller = appRouter.createCaller(context({ email: "owner@example.com" }));
    await expect(caller.dashboard.resendReportEmail({ attemptId: 12 })).resolves.toEqual({ sent: true });
    expect(emailAssessmentReportIfNeeded).toHaveBeenCalledWith(expect.objectContaining({ attemptId: 12, email: "owner@example.com", report: paidReport, reportEmailStatus: "pending" }));
  });

  it("returns a conflict when another resend is already in progress", async () => {
    getAssessmentAttempt.mockResolvedValue({ id: 12, email: "owner@example.com", paymentStatus: "paid", report: paidReport, reportEmailStatus: "pending", name: "Participant", createdAt: new Date() });
    emailAssessmentReportIfNeeded.mockResolvedValue(false);
    const caller = appRouter.createCaller(context({ email: "owner@example.com" }));
    await expect(caller.dashboard.resendReportEmail({ attemptId: 12 })).rejects.toMatchObject({ code: "CONFLICT" });
  });
});

describe("dashboard.downloadReport", () => {
  it("rejects unauthenticated users", async () => {
    const caller = appRouter.createCaller(context(null));
    await expect(caller.dashboard.downloadReport({ attemptId: 12 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("does not reveal another account's paid report", async () => {
    getAssessmentAttempt.mockResolvedValue({ id: 12, email: "other@example.com", paymentStatus: "paid", report: paidReport, name: "Other", createdAt: new Date() });
    const caller = appRouter.createCaller(context({ email: "owner@example.com" }));
    await expect(caller.dashboard.downloadReport({ attemptId: 12 })).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(renderAssessmentReportPdf).not.toHaveBeenCalled();
  });

  it("blocks unpaid reports", async () => {
    getAssessmentAttempt.mockResolvedValue({ id: 12, email: "owner@example.com", paymentStatus: "pending", report: null, name: "Participant", createdAt: new Date() });
    const caller = appRouter.createCaller(context({ email: "owner@example.com" }));
    await expect(caller.dashboard.downloadReport({ attemptId: 12 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("returns a PDF payload for the authenticated owner's paid report", async () => {
    getAssessmentAttempt.mockResolvedValue({ id: 12, email: "owner@example.com", paymentStatus: "paid", report: paidReport, name: "Participant", createdAt: new Date() });
    renderAssessmentReportPdf.mockResolvedValue(Buffer.from("%PDF-test"));
    const caller = appRouter.createCaller(context({ email: "owner@example.com" }));
    const result = await caller.dashboard.downloadReport({ attemptId: 12 });
    expect(result).toMatchObject({ filename: "profound-iq-assessment-12.pdf", contentType: "application/pdf", data: Buffer.from("%PDF-test").toString("base64") });
    expect(renderAssessmentReportPdf).toHaveBeenCalledWith(expect.objectContaining({ attemptId: 12, participantName: "Participant", report: paidReport }));
  });
});

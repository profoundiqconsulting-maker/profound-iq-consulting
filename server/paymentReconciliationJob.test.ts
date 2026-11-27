import { describe, it, expect, vi, beforeEach } from "vitest";

const listStalePendingPaymentStages = vi.fn();
const updateCoursePaymentStageStatus = vi.fn();
const logPaymentReconciliation = vi.fn();
const paystackRequest = vi.fn();

vi.mock("./db", () => ({
  listStalePendingPaymentStages,
  updateCoursePaymentStageStatus,
  logPaymentReconciliation,
}));
vi.mock("./_core/paystack", () => ({ paystackRequest }));

const { reconcileStalePendingPayments } =
  await import("./paymentReconciliationJob");

describe("reconcileStalePendingPayments", () => {
  beforeEach(() => {
    listStalePendingPaymentStages.mockReset();
    updateCoursePaymentStageStatus.mockReset();
    logPaymentReconciliation.mockReset();
    paystackRequest.mockReset();
  });

  it("marks a verified stage paid and returns a summary", async () => {
    listStalePendingPaymentStages.mockResolvedValue([
      {
        id: 1,
        paystackReference: "piq-course-a",
        amountKes: 1250,
        paymentStatus: "pending",
        initializedAt: new Date(),
      },
    ]);
    paystackRequest.mockResolvedValue({
      data: {
        reference: "piq-course-a",
        status: "success",
        amount: 125000,
        currency: "KES",
      },
    });
    updateCoursePaymentStageStatus.mockResolvedValue({});
    logPaymentReconciliation.mockResolvedValue({});

    const result = await reconcileStalePendingPayments({ maxAgeMinutes: 30 });

    expect(result).toEqual({ checked: 1, paid: 1, failed: 0, errors: [] });
    expect(updateCoursePaymentStageStatus).toHaveBeenCalledWith(1, {
      status: "paid",
      paid: true,
      errorMessage: null,
    });
    expect(logPaymentReconciliation).toHaveBeenCalledWith(
      expect.objectContaining({ action: "nightly_reconcile", outcome: "paid" })
    );
  });

  it("marks a failed stage without revoking a success and logs exception", async () => {
    listStalePendingPaymentStages.mockResolvedValue([
      {
        id: 2,
        paystackReference: "piq-course-b",
        amountKes: 1250,
        paymentStatus: "pending",
        initializedAt: new Date(),
      },
    ]);
    paystackRequest.mockResolvedValue({
      data: {
        reference: "piq-course-b",
        status: "failed",
        amount: 125000,
        currency: "KES",
      },
    });
    updateCoursePaymentStageStatus.mockResolvedValue({});
    logPaymentReconciliation.mockResolvedValue({});

    const result = await reconcileStalePendingPayments();

    expect(result.failed).toBe(1);
    expect(updateCoursePaymentStageStatus).toHaveBeenCalledWith(2, {
      status: "failed",
      errorMessage: expect.stringContaining("Nightly reconcile"),
    });
    expect(logPaymentReconciliation).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "nightly_reconcile",
        outcome: "failed",
      })
    );
  });

  it("records a Paystack error as exception without throwing", async () => {
    listStalePendingPaymentStages.mockResolvedValue([
      {
        id: 3,
        paystackReference: "piq-course-c",
        amountKes: 1250,
        paymentStatus: "pending",
        initializedAt: new Date(),
      },
    ]);
    paystackRequest.mockRejectedValue(new Error("Paystack is down"));
    updateCoursePaymentStageStatus.mockResolvedValue({});
    logPaymentReconciliation.mockResolvedValue({});

    const result = await reconcileStalePendingPayments();

    expect(result).toEqual({
      checked: 1,
      paid: 0,
      failed: 0,
      errors: [{ reference: "piq-course-c", error: "Paystack is down" }],
    });
    expect(updateCoursePaymentStageStatus).toHaveBeenCalledWith(3, {
      status: "exception",
      errorMessage: "Paystack is down",
    });
  });
});

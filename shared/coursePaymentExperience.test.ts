import { describe, expect, it } from "vitest";
import { summarizeCourseEnrollment } from "./coursePaymentRollup";
import { buildCoursePaymentSuccessPath } from "./coursePaymentRouting";

describe("course payment experience contracts", () => {
  it("calculates paid amount, balance, next stage, and learning progress", () => {
    const result = summarizeCourseEnrollment({
      stages: [
        { stage: 1, paymentStatus: "paid" },
        { stage: 2, paymentStatus: "pending" },
        { stage: 3, paymentStatus: "pending" },
        { stage: 4, paymentStatus: "pending" },
      ],
      lessonsCompleted: 9,
      moduleCount: 10,
    });

    expect(result).toMatchObject({
      paidStages: 1,
      totalStages: 4,
      paidAmountKes: 1_250,
      remainingAmountKes: 3_749,
      paymentPercent: 25,
      nextStage: 2,
      completedModules: 1,
      learningPercent: 13,
    });
  });

  it("caps completed payment and learning progress at the configured maximum", () => {
    const result = summarizeCourseEnrollment({
      stages: [1, 2, 3, 4].map((stage) => ({ stage, paymentStatus: "paid" })),
      lessonsCompleted: 100,
      moduleCount: 10,
    });

    expect(result.paidAmountKes).toBe(5_000);
    expect(result.remainingAmountKes).toBe(0);
    expect(result.paymentPercent).toBe(100);
    expect(result.nextStage).toBeNull();
    expect(result.completedModules).toBe(10);
    expect(result.learningPercent).toBe(100);
  });

  it("calculates the ICPC custom installment plan exactly", () => {
    const result = summarizeCourseEnrollment({
      stages: [
        { stage: 1, paymentStatus: "paid" },
        { stage: 2, paymentStatus: "pending" },
        { stage: 3, paymentStatus: "pending" },
        { stage: 4, paymentStatus: "pending" },
      ],
      stageAmountsKes: [3750, 3750, 3750, 3749],
      totalAmountKes: 14999,
    });

    expect(result.stageAmountsKes).toEqual([3750, 3750, 3750, 3749]);
    expect(result.paidAmountKes).toBe(3750);
    expect(result.remainingAmountKes).toBe(11249);
  });

  it("encodes the course and reference in the dedicated success path", () => {
    expect(buildCoursePaymentSuccessPath("leadership & clarity", "piq-course/ref"))
      .toBe("/courses/payment-success?course=leadership%20%26%20clarity&reference=piq-course%2Fref");
  });
});

import { describe, expect, it } from "vitest";
import {
  canAccessAssessmentCertificate,
  canAccessCourseLessons,
  canAccessModuleLessons,
  canBypassCoursePayment,
  courseAccessReason,
  qualityControlQuizScore,
  requiredPaymentStageForModule,
} from "./courseAccess";

describe("course lesson access", () => {
  it("blocks unregistered visitors while keeping a sign-in reason", () => {
    const input = {
      isAuthenticated: false,
      paidStages: 0,
    };
    expect(canAccessCourseLessons(input)).toBe(false);
    expect(courseAccessReason(input)).toContain("Sign in or register");
  });

  it("allows authenticated learners to start module 1 for free", () => {
    expect(
      canAccessCourseLessons({
        isAuthenticated: true,
        paidStages: 0,
      })
    ).toBe(true);
    expect(
      courseAccessReason({
        isAuthenticated: true,
        paidStages: 0,
      })
    ).toContain("Module 1 is free");
  });
});

describe("module payment boundaries", () => {
  it("maps module ranges to the correct installment", () => {
    expect(requiredPaymentStageForModule(0)).toBe(0);
    expect(requiredPaymentStageForModule(1)).toBe(2);
    expect(requiredPaymentStageForModule(3)).toBe(2);
    expect(requiredPaymentStageForModule(4)).toBe(3);
    expect(requiredPaymentStageForModule(6)).toBe(3);
    expect(requiredPaymentStageForModule(7)).toBe(4);
    expect(requiredPaymentStageForModule(9)).toBe(4);
  });

  it("keeps staged modules locked until their matching installment is paid", () => {
    expect(
      canAccessModuleLessons({
        moduleIndex: 3,
        paidStages: 1,
      })
    ).toBe(false);
    expect(
      canAccessModuleLessons({
        moduleIndex: 3,
        paidStages: 2,
      })
    ).toBe(true);
    expect(
      canAccessModuleLessons({
        moduleIndex: 6,
        paidStages: 2,
      })
    ).toBe(false);
    expect(
      canAccessModuleLessons({
        moduleIndex: 6,
        paidStages: 3,
      })
    ).toBe(true);
  });
});

describe("assessment certificate access policy", () => {
  it("requires payment and ownership for certificate access", () => {
    expect(
      canAccessAssessmentCertificate({
        identityMatches: true,
        paymentStatus: "pending",
        hasReport: true,
      })
    ).toBe(false);
    expect(
      canAccessAssessmentCertificate({
        identityMatches: true,
        paymentStatus: "paid",
        hasReport: true,
      })
    ).toBe(true);
    expect(
      canAccessAssessmentCertificate({
        identityMatches: false,
        paymentStatus: "paid",
        hasReport: true,
      })
    ).toBe(false);
    expect(
      canAccessAssessmentCertificate({
        identityMatches: true,
        paymentStatus: "paid",
        hasReport: false,
      })
    ).toBe(false);
  });
});

describe("course access bypass policy", () => {
  it("allows only active learner grants to bypass payment", () => {
    expect(
      canBypassCoursePayment({
        hasAccessGrant: true,
      })
    ).toBe(true);
    expect(
      canBypassCoursePayment({
        hasAccessGrant: false,
      })
    ).toBe(false);
  });

  it("returns raw quiz scores without normalization", () => {
    expect(qualityControlQuizScore({ rawScore: 40 })).toBe(40);
    expect(qualityControlQuizScore({ rawScore: 85 })).toBe(85);
  });
});

import { describe, expect, it } from "vitest";
import { canAccessCourseLessons, canAccessModuleLessons, courseAccessReason, requiredPaymentStageForModule } from "./courseAccess";

describe("course lesson access", () => {
  it("blocks unregistered visitors while keeping a sign-in reason", () => {
    const input = { isAuthenticated: false, paidStages: 0, isQualityControlAdmin: false };
    expect(canAccessCourseLessons(input)).toBe(false);
    expect(courseAccessReason(input)).toContain("Sign in or register");
  });

  it("blocks authenticated learners until the first 25% stage is paid", () => {
    expect(canAccessCourseLessons({ isAuthenticated: true, paidStages: 0, isQualityControlAdmin: false })).toBe(false);
    expect(canAccessCourseLessons({ isAuthenticated: true, paidStages: 1, isQualityControlAdmin: false })).toBe(true);
    expect(courseAccessReason({ isAuthenticated: true, paidStages: 0, isQualityControlAdmin: false })).toContain("first 25%");
  });

  it("allows the configured quality-control admin to inspect content without checkout", () => {
    expect(canAccessCourseLessons({ isAuthenticated: true, paidStages: 0, isQualityControlAdmin: true })).toBe(true);
  });
});


describe("module payment boundaries", () => {
  it("maps module ranges to the correct installment", () => {
    expect(requiredPaymentStageForModule(0)).toBe(1);
    expect(requiredPaymentStageForModule(3)).toBe(2);
    expect(requiredPaymentStageForModule(6)).toBe(3);
    expect(requiredPaymentStageForModule(9)).toBe(3);
  });

  it("keeps staged modules locked until their matching installment is paid", () => {
    expect(canAccessModuleLessons({ moduleIndex: 3, paidStages: 1, isQualityControlAdmin: false })).toBe(false);
    expect(canAccessModuleLessons({ moduleIndex: 3, paidStages: 2, isQualityControlAdmin: false })).toBe(true);
    expect(canAccessModuleLessons({ moduleIndex: 6, paidStages: 2, isQualityControlAdmin: false })).toBe(false);
    expect(canAccessModuleLessons({ moduleIndex: 6, paidStages: 3, isQualityControlAdmin: false })).toBe(true);
  });

  it("allows quality-control admins to inspect all modules without payment", () => {
    expect(canAccessModuleLessons({ moduleIndex: 9, paidStages: 0, isQualityControlAdmin: true })).toBe(true);
  });
});

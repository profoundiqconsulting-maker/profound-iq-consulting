import { describe, expect, it } from "vitest";
import { canAccessCourseLessons, courseAccessReason } from "./courseAccess";

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

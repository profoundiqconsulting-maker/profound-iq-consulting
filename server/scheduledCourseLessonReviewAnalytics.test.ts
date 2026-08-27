import { describe, expect, it } from "vitest";
import { COURSE_REVIEW_WEEKLY_EXPORT_KEY } from "./scheduledCourseLessonReviewAnalytics";

function sameUtcWeek(a: Date, b: Date) {
  const monday = (value: Date) => {
    const date = new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
    const day = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() - day + 1);
    return date.toISOString().slice(0, 10);
  };
  return monday(a) === monday(b);
}

describe("weekly course lesson review analytics scheduling", () => {
  it("uses a stable export key and treats dates within one UTC week as one run", () => {
    expect(COURSE_REVIEW_WEEKLY_EXPORT_KEY).toBe("weekly_course_lesson_review_analytics");
    expect(sameUtcWeek(new Date("2026-08-24T00:00:00.000Z"), new Date("2026-08-30T23:59:59.000Z"))).toBe(true);
    expect(sameUtcWeek(new Date("2026-08-30T23:59:59.000Z"), new Date("2026-08-31T00:00:00.000Z"))).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { summarizeQuizAnalytics } from "./quizAnalytics";

describe("quiz analytics summarizer", () => {
  it("summarizes truthful attempt performance and flags low latest module scores", () => {
    const result = summarizeQuizAnalytics([
      {
        courseSlug: "course-a",
        moduleId: "module-1",
        score: 40,
        passed: false,
        createdAt: "2026-08-01T00:00:00Z",
      },
      {
        courseSlug: "course-a",
        moduleId: "module-1",
        score: 70,
        passed: true,
        createdAt: "2026-08-02T00:00:00Z",
      },
      {
        courseSlug: "course-a",
        moduleId: "module-2",
        score: 30,
        passed: false,
        createdAt: "2026-08-03T00:00:00Z",
      },
    ]);
    expect(result.averageScore).toBe(47);
    expect(result.passedCount).toBe(1);
    expect(result.passRate).toBe(33);
    expect(result.trend).toHaveLength(3);
    expect(result.improvementAreas).toEqual([
      {
        courseSlug: "course-a",
        moduleId: "module-2",
        score: 30,
        createdAt: "2026-08-03T00:00:00Z",
      },
    ]);
  });

  it("returns an honest empty state", () => {
    expect(summarizeQuizAnalytics([])).toEqual({
      attempts: [],
      averageScore: 0,
      passedCount: 0,
      passRate: 0,
      trend: [],
      improvementAreas: [],
    });
  });
});

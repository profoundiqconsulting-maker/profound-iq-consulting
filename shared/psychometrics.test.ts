import { describe, expect, it } from "vitest";
import { PSYCHOMETRIC_PRICE_KES, psychometricTests, scorePsychometricTest } from "./psychometrics";
import { getPsychometricCourseRecommendations } from "./psychometricRecommendations";
import { courseCatalog } from "./courseCatalog";

describe("psychometric assessment suite", () => {
  it("defines six document-grounded assessments with 120 questions each", () => {
    expect(psychometricTests).toHaveLength(6);
    for (const test of psychometricTests) {
      expect(test.questions).toHaveLength(120);
      expect(test.domains.reduce((sum, domain) => sum + domain.itemCount, 0)).toBe(120);
      expect(test.disclaimer).toMatch(/not a clinical diagnosis/i);
    }
  });

  it("uses KES 699 as the canonical suite price", () => {
    expect(PSYCHOMETRIC_PRICE_KES).toBe(699);
  });

  it("scores Likert responses into domain and overall results", () => {
    const test = psychometricTests[0];
    const report = scorePsychometricTest(test, test.questions.map((question) => ({ questionId: question.id, value: 5 })));
    expect(report.overallScore).toBe(100);
    expect(report.domains).toHaveLength(10);
    expect(report.strengths).toHaveLength(3);
    expect(report.strengths.every((label) => test.domains.some((domain) => domain.label === label))).toBe(true);
  });

  it("maps every psychometric profile to real actionable courses", () => {
    for (const test of psychometricTests) {
      const recommendations = getPsychometricCourseRecommendations({ testSlug: test.slug });
      expect(recommendations.length).toBeGreaterThanOrEqual(2);
      expect(recommendations.every((item) => courseCatalog.some((course) => course.slug === item.slug))).toBe(true);
      expect(recommendations.every((item) => item.reason.length > 20 && item.action.length > 20)).toBe(true);
    }
  });

  it("retains keyed cognitive items for performance scoring", () => {
    const test = psychometricTests.find((item) => item.slug === "cognitive-reasoning-assessment")!;
    expect(test.questions.every((question) => question.correctOptionIndex !== undefined)).toBe(true);
    const answers = test.questions.map((question) => ({ questionId: question.id, value: (question.correctOptionIndex ?? 0) + 1 }));
    const report = scorePsychometricTest(test, answers);
    expect(report.overallScore).toBe(100);
  });
});

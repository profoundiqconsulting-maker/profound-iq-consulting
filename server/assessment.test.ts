import { describe, expect, it } from "vitest";
import { assessmentQuestions, buildReport, buildRoleLens, compareReports } from "../shared/assessment";

describe("assessment scoring", () => {
  it("exposes 100 questions across ten capability dimensions", () => {
    expect(assessmentQuestions).toHaveLength(100);
    expect(new Set(assessmentQuestions.map((question) => question.dimension)).size).toBe(10);
  });

  it("builds a report from submitted five-point answers", () => {
    const report = buildReport(assessmentQuestions.map((question) => ({ questionId: question.id, value: 5 })));
    expect(report.overallScore).toBe(100);
    expect(report.overallBand).toBe("Strong foundation");
    expect(report.dimensions.every((dimension) => dimension.score === 100)).toBe(true);
    expect(report.dimensions.every((dimension) => dimension.readout.length > 120 && Array.isArray(dimension.reflectionPoints))).toBe(true);
    expect(report.dimensions.filter((dimension) => dimension.reflectionPoints.length === 3)).toHaveLength(10);
    expect(report.reflectionPoints).toHaveLength(4);
    expect(report.importantContext).toHaveLength(4);
    expect(report.importantContext.join(" ")).toMatch(/point-in-time|professional decisions/i);
    expect(report.disclaimer).toMatch(/not a clinical/i);
  });

  it("provides adaptable role lenses and longitudinal comparison deltas", () => {
    const current = buildReport(assessmentQuestions.map((question) => ({ questionId: question.id, value: 5 })));
    const previous = buildReport(assessmentQuestions.map((question) => ({ questionId: question.id, value: 4 })));
    expect(buildRoleLens(current, "leadership").priorities).toHaveLength(3);
    expect(buildRoleLens(current, "careerTransition").reflectionPoints[0]).toMatch(/achievement/i);
    expect(compareReports(current, previous).scoreDelta).toBe(20);
    expect(compareReports(current, previous).dimensions).toHaveLength(10);
  });
});

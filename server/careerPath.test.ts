import { describe, expect, it } from "vitest";
import {
  buildCareerPathReport,
  CAREER_PATH_PRICE_KES,
  careerPathQuestions,
} from "../shared/careerPath";

describe("CareerPath assessment", () => {
  it("uses the requested KES 399 price", () => {
    expect(CAREER_PATH_PRICE_KES).toBe(399);
  });

  it("exposes the documented 180-item architecture", () => {
    expect(careerPathQuestions).toHaveLength(180);
    expect(
      new Set(careerPathQuestions.map(question => question.module)).size
    ).toBe(9);
  });

  it("builds bounded pathway results from a complete response set", () => {
    const report = buildCareerPathReport(
      careerPathQuestions.map((question, index) => ({
        questionId: question.id,
        value: (index % 5) + 1,
      }))
    );
    expect(report.pathways).toHaveLength(3);
    expect(
      report.pathways.every(
        pathway => pathway.score >= 0 && pathway.score <= 100
      )
    ).toBe(true);
    expect(report.subPathways).toHaveLength(7);
    expect(report.subPathways.map(pathway => pathway.label)).toEqual(
      expect.arrayContaining([
        "Pure Sciences",
        "Applied Sciences",
        "Technical Studies",
        "Languages",
        "Humanities",
        "Arts",
        "Sports",
      ])
    );
    expect(
      report.subPathways.every(
        pathway =>
          pathway.score >= 0 &&
          pathway.score <= 100 &&
          pathway.rationale.length > 20
      )
    ).toBe(true);
    expect(report.primary.score).toBeGreaterThanOrEqual(report.secondary.score);
    expect(report.secondary.score).toBeGreaterThanOrEqual(
      report.alternative.score
    );
    expect(report.importantContext.length).toBeGreaterThanOrEqual(4);
    expect(report.disclaimer).toContain("does not determine");
  });

  it("clamps out-of-range answers and keeps missing answers safe", () => {
    const report = buildCareerPathReport([
      { questionId: careerPathQuestions[0].id, value: 99 },
      { questionId: careerPathQuestions[1].id, value: -20 },
    ]);
    expect(
      report.pathways.every(
        pathway => pathway.score >= 0 && pathway.score <= 100
      )
    ).toBe(true);
    expect(report.primary.evidence.length).toBeGreaterThan(0);
    expect(report.explorationPlan.length).toBeGreaterThan(0);
  });
});

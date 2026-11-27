import { describe, expect, it } from "vitest";
import {
  getCareerPathEducationRecommendations,
  getCareerPathTrendData,
} from "./careerPathRecommendations";

const report = {
  subPathways: [
    {
      key: "arts",
      label: "Arts",
      score: 62,
      band: "Possible Fit",
      rationale: "",
    },
    {
      key: "pureSciences",
      label: "Pure Sciences",
      score: 88,
      band: "Very Strong Fit",
      rationale: "",
    },
    {
      key: "languages",
      label: "Languages",
      score: 81,
      band: "Strong Fit",
      rationale: "",
    },
    {
      key: "sports",
      label: "Sports",
      score: 74,
      band: "Good Potential Fit",
      rationale: "",
    },
  ],
} as const;

describe("CareerPath education recommendations", () => {
  it("orders subject and career ideas by the learner's strongest sub-pathways", () => {
    const recommendations = getCareerPathEducationRecommendations(report);

    expect(recommendations.map(item => item.key)).toEqual([
      "pureSciences",
      "languages",
      "sports",
    ]);
    expect(recommendations[0]?.combinations[0]).toMatchObject({
      subjects: ["Advanced Mathematics", "Biology", "Chemistry"],
      page: 6,
      row: 308,
    });
    expect(recommendations[0]?.careerDirections).toContain(
      "Biological and health sciences"
    );
    expect(getCareerPathEducationRecommendations(report, 1)).toHaveLength(1);
  });

  it("returns no combinations when the requested limit is zero", () => {
    expect(getCareerPathEducationRecommendations(report, 0)).toEqual([]);
  });

  it("provides sourced combinations for every senior-school sub-pathway", () => {
    const completeReport = {
      subPathways: [
        ...report.subPathways,
        {
          key: "appliedSciences",
          label: "Applied Sciences",
          score: 60,
          band: "Possible Fit",
          rationale: "",
        },
        {
          key: "technicalStudies",
          label: "Technical Studies",
          score: 59,
          band: "Possible Fit",
          rationale: "",
        },
        {
          key: "humanities",
          label: "Humanities",
          score: 58,
          band: "Possible Fit",
          rationale: "",
        },
      ],
    };
    const recommendations = getCareerPathEducationRecommendations(
      completeReport,
      7
    );

    expect(recommendations).toHaveLength(7);
    for (const recommendation of recommendations) {
      expect(recommendation.combinations).toHaveLength(2);
      for (const combination of recommendation.combinations) {
        expect(combination.subjects).toHaveLength(3);
        expect(combination.page).toBeGreaterThanOrEqual(1);
        expect(combination.page).toBeLessThanOrEqual(11);
        expect(combination.row).toBeGreaterThan(0);
      }
    }
  });
});

describe("CareerPath score history", () => {
  const pathways = (stem: number, socialSciences: number, artsSports: number) =>
    [
      { key: "stem", score: stem },
      { key: "socialSciences", score: socialSciences },
      { key: "artsSports", score: artsSports },
    ] as const;

  it("includes only paid, valid reports and orders them by payment date", () => {
    const trend = getCareerPathTrendData([
      {
        id: 2,
        paymentStatus: "paid",
        createdAt: "2026-03-01T00:00:00.000Z",
        paidAt: "2026-03-03T00:00:00.000Z",
        report: { pathways: pathways(74, 81, 60) },
      },
      {
        id: 1,
        paymentStatus: "paid",
        createdAt: "2026-02-01T00:00:00.000Z",
        paidAt: "2026-02-02T00:00:00.000Z",
        report: { pathways: pathways(68, 72, 64) },
      },
      {
        id: 3,
        paymentStatus: "pending",
        createdAt: "2026-04-01T00:00:00.000Z",
        report: { pathways: pathways(90, 90, 90) },
      },
      {
        id: 4,
        paymentStatus: "paid",
        createdAt: "2026-04-02T00:00:00.000Z",
        report: { pathways: [{ key: "stem", score: 140 }] },
      },
    ]);

    expect(trend).toHaveLength(2);
    expect(trend.map(item => item.attemptId)).toEqual([1, 2]);
    expect(trend.map(item => item.stem)).toEqual([68, 74]);
  });
});

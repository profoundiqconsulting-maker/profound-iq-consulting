import { describe, expect, it } from "vitest";
import { getTopCareerPathStrengths } from "./careerPath";

describe("CareerPath top strengths summary", () => {
  it("returns the highest signals first and remains bounded", () => {
    const report = { subPathways: [
      { key: "arts", label: "Arts", score: 62, band: "Good Potential Fit", rationale: "" },
      { key: "pureSciences", label: "Pure Sciences", score: 88, band: "Very Strong Fit", rationale: "" },
      { key: "languages", label: "Languages", score: 81, band: "Strong Fit", rationale: "" },
      { key: "sports", label: "Sports", score: 74, band: "Good Potential Fit", rationale: "" },
    ] } as never;
    expect(getTopCareerPathStrengths(report).map((item) => item.label)).toEqual(["Pure Sciences", "Languages", "Sports"]);
    expect(getTopCareerPathStrengths(report, 2)).toHaveLength(2);
  });

  it("uses a stable alphabetical tie-break", () => {
    const report = { subPathways: [
      { key: "sports", label: "Sports", score: 80, band: "Strong Fit", rationale: "" },
      { key: "arts", label: "Arts", score: 80, band: "Strong Fit", rationale: "" },
    ] } as never;
    expect(getTopCareerPathStrengths(report).map((item) => item.label)).toEqual(["Arts", "Sports"]);
  });
});

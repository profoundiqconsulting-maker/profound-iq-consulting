import { describe, expect, it } from "vitest";
import { buildCourseRecommendations } from "./courseRecommendations";

describe("buildCourseRecommendations", () => {
  it("ranks a course from the strongest matching assessment signals", () => {
    const result = buildCourseRecommendations([
      { key: "clarity", label: "Clarity of direction", score: 92 },
      { key: "leadership", label: "Leadership agency", score: 88 },
      { key: "influence", label: "Ethical influence", score: 84 },
      { key: "execution", label: "Execution discipline", score: 40 },
    ]);
    expect(result[0]?.course.slug).toBe("lead-with-clarity");
    expect(result[0]?.fitScore).toBeGreaterThan(80);
    expect(result[0]?.matchedSignals.map((signal) => signal.key)).toEqual(["clarity", "leadership", "influence"]);
    expect(result[0]?.rationale).toContain("direction-setting");
  });

  it("returns no recommendations when the user has no report dimensions", () => {
    expect(buildCourseRecommendations([])).toEqual([]);
  });

  it("keeps deterministic ordering when multiple courses share the same score", () => {
    const result = buildCourseRecommendations([{ key: "unmapped", label: "Unmapped", score: 70 }]);
    expect(result.map((item) => item.course.index)).toEqual(["01", "02", "03"]);
  });
});

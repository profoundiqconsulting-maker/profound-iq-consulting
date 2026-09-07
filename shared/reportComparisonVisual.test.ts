import { describe, expect, it } from "vitest";
import { buildSubPathwayComparisonSvg } from "./reportComparisonVisual";
import {
  reportComparisonPreview,
  reportComparisonPreviewHistory,
} from "./reportComparisonFixture";

describe("sub-pathway coaching visual", () => {
  it("renders all seven sub-pathways with safe XML escaping and bounded scores", () => {
    const svg = buildSubPathwayComparisonSvg({
      rows: [
        { label: "Pure Sciences", score: 86 },
        { label: "Arts & Sports", score: 112 },
        { label: "<unsafe>", score: -4 },
      ],
    });
    expect(svg.startsWith("<svg ")).toBe(true);
    expect(svg).toContain("Pure Sciences");
    expect(svg).toContain("Arts &amp; Sports");
    expect(svg).toContain("&lt;unsafe&gt;");
    expect(svg).toContain(">100</text>");
    expect(svg).toContain(">0</text>");
  });

  it("provides three paid versions and stable comparison deltas for mobile legend testing", () => {
    expect(reportComparisonPreviewHistory).toHaveLength(3);
    expect(
      reportComparisonPreviewHistory.every(
        item => item.paymentStatus === "paid"
      )
    ).toBe(true);
    expect(reportComparisonPreview.comparison.scoreDelta).toBe(17);
    expect(reportComparisonPreview.comparison.dimensions).toHaveLength(4);
  });
});

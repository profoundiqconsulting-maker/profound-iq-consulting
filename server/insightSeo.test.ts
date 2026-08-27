import { describe, expect, it } from "vitest";
import { insightArticles } from "../shared/insightsArticles";
import { renderInsightArticlePage, renderInsightSocialImage } from "./seoRoutes";

describe("Insights social previews", () => {
  it("renders a branded PNG social card from an approved article", async () => {
    const png = await renderInsightSocialImage({ ...insightArticles[0], status: "Published" });
    expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  });

  it("uses an article-specific social image when one is provided and a generated fallback otherwise", () => {
    const custom = renderInsightArticlePage({ ...insightArticles[0], status: "Published", socialImageUrl: "https://cdn.example.com/insight.png" }, null);
    const fallback = renderInsightArticlePage({ ...insightArticles[1], status: "Published" }, null);
    expect(custom).toContain("https://cdn.example.com/insight.png");
    expect(fallback).toContain("/og/insight/curriculum-intent-reaches-classroom.png");
  });
});

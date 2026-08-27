import { describe, expect, it } from "vitest";
import { articlePreviews, filterInsightsPreviews, getVisibleInsightsPreviews } from "./Blog";

 describe("Insights editorial workflow helpers", () => {
  it("filters previews by keyword and category without mutating the source catalog", () => {
    const source = [...articlePreviews];
    const result = filterInsightsPreviews(articlePreviews, "curriculum", "Learning design");
    expect(result).toHaveLength(1);
    expect(result[0]?.title).toContain("curriculum");
    expect(articlePreviews).toEqual(source);
  });

  it("keeps Load More bounded and always returns at least one item for a positive catalog", () => {
    expect(getVisibleInsightsPreviews(articlePreviews, 2)).toHaveLength(2);
    expect(getVisibleInsightsPreviews(articlePreviews, 0)).toHaveLength(1);
    expect(getVisibleInsightsPreviews(articlePreviews, 999)).toHaveLength(articlePreviews.length);
  });

  it("keeps every editorial preview addressable by a stable slug", async () => {
    const { insightArticles } = await import("@shared/insightsArticles");
    expect(insightArticles.every((article) => article.slug.length > 0 && !article.slug.includes(" "))).toBe(true);
    expect(new Set(insightArticles.map((article) => article.slug)).size).toBe(insightArticles.length);
  });
});

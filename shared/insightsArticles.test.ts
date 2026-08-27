import { describe, expect, it } from "vitest";
import { getInsightArticle, insightArticles } from "./insightsArticles";

describe("Insights article catalog", () => {
  it("keeps stable unique slugs and explicit draft status", () => {
    const slugs = insightArticles.map((article) => article.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(insightArticles).toHaveLength(3);
    expect(insightArticles.every((article) => article.status === "Draft preview")).toBe(true);
    expect(insightArticles.every((article) => article.sections.length >= 3)).toBe(true);
  });

  it("resolves detail articles by slug and safely misses unknown slugs", () => {
    expect(getInsightArticle(insightArticles[0].slug)?.title).toContain("school-improvement");
    expect(getInsightArticle("not-an-insight")).toBeUndefined();
  });
});

import { describe, expect, it } from "vitest";
import { articlePreviews, contributors, filterInsightsPreviews, getVisibleInsightsPreviews } from "@/pages/Blog";

describe("Insights preview content", () => {
  it("provides a useful preview grid without presenting drafts as published articles", () => {
    expect(articlePreviews).toHaveLength(3);
    expect(articlePreviews.every((article) => article.excerpt.includes("preview") || article.excerpt.includes("planned"))).toBe(true);
    expect(articlePreviews.every((article) => article.readTime.endsWith("min read"))).toBe(true);
  });

  it("filters preview cards by keyword and category without mutating the source list", () => {
    expect(filterInsightsPreviews(articlePreviews, "CURRICULUM", "All topics")).toHaveLength(1);
    expect(filterInsightsPreviews(articlePreviews, "", "Education leadership")).toHaveLength(1);
    expect(filterInsightsPreviews(articlePreviews, "unmatched", "All topics")).toHaveLength(0);
    expect(articlePreviews).toHaveLength(3);
    expect(getVisibleInsightsPreviews([1, 2, 3, 4, 5], 3)).toEqual([1, 2, 3]);
    expect(getVisibleInsightsPreviews([1, 2], 0)).toEqual([1]);
  });

  it("keeps contributor cards explicitly placeholder-only until profiles are approved", () => {
    expect(contributors).toHaveLength(2);
    expect(contributors.every((contributor) => contributor.role.includes("Placeholder profile"))).toBe(true);
    expect(contributors.every((contributor) => contributor.bio.includes("Reserved for"))).toBe(true);
  });
});

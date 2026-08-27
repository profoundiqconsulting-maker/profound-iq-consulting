import { describe, expect, it } from "vitest";
import { articlePreviews, contributors } from "@/pages/Blog";

describe("Insights preview content", () => {
  it("provides a useful preview grid without presenting drafts as published articles", () => {
    expect(articlePreviews).toHaveLength(3);
    expect(articlePreviews.every((article) => article.excerpt.includes("preview") || article.excerpt.includes("planned"))).toBe(true);
    expect(articlePreviews.every((article) => article.readTime.endsWith("min read"))).toBe(true);
  });

  it("keeps contributor cards explicitly placeholder-only until profiles are approved", () => {
    expect(contributors).toHaveLength(2);
    expect(contributors.every((contributor) => contributor.role.includes("Placeholder profile"))).toBe(true);
    expect(contributors.every((contributor) => contributor.bio.includes("Reserved for"))).toBe(true);
  });
});

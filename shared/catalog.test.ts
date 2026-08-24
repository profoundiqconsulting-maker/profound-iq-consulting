import { describe, expect, it } from "vitest";
import { normalizeCatalogItem } from "./catalog";

describe("catalog contract", () => {
  it("normalizes persisted outcomes and supported item types", () => {
    const item = normalizeCatalogItem({ id: 1, slug: "leadership-lab", itemType: "course", title: "Leadership Lab", strapline: "Practice the next move", description: "A practical leadership program.", audience: "Leaders", duration: "6 weeks", outcomes: ["Frame decisions", 42, "  Build trust  "], priceKes: 4999, published: true, createdByOpenId: "admin", createdAt: new Date(), updatedAt: new Date() });
    expect(item.itemType).toBe("course");
    expect(item.outcomes).toEqual(["Frame decisions", "  Build trust  "]);
  });

  it("falls back to course for unknown item types and empty outcome payloads", () => {
    const item = normalizeCatalogItem({ id: 2, slug: "new-service", itemType: "unknown", title: "New service", strapline: "A useful next step", description: "A newly published catalog item.", audience: "Teams", duration: "Online", outcomes: null, priceKes: 0, published: true, createdByOpenId: "admin", createdAt: new Date(), updatedAt: new Date() });
    expect(item.itemType).toBe("course");
    expect(item.outcomes).toEqual([]);
  });
});

export type CatalogItemType = "course" | "service" | "program";

export type CatalogItem = {
  id: number;
  slug: string;
  itemType: CatalogItemType;
  title: string;
  strapline: string;
  description: string;
  audience: string;
  duration: string;
  outcomes: string[];
  priceKes: number;
  published: boolean;
  createdByOpenId: string;
  createdAt: Date;
  updatedAt: Date;
};

export function normalizeCatalogItem(input: Omit<CatalogItem, "outcomes" | "itemType"> & { itemType: string; outcomes: unknown }): CatalogItem {
  const itemType: CatalogItemType = input.itemType === "service" || input.itemType === "program" ? input.itemType : "course";
  const outcomes = Array.isArray(input.outcomes) ? input.outcomes.filter((outcome): outcome is string => typeof outcome === "string" && outcome.trim().length > 0) : [];
  return { ...input, itemType, outcomes };
}

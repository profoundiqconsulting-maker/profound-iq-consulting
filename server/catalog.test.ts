import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  listPublishedCatalogItems: vi.fn(),
  listCatalogItemsForAdmin: vi.fn(),
  createCatalogItem: vi.fn(),
}));

vi.mock("./db", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./db")>()),
  listPublishedCatalogItems: mocks.listPublishedCatalogItems,
  listCatalogItemsForAdmin: mocks.listCatalogItemsForAdmin,
  createCatalogItem: mocks.createCatalogItem,
}));

const { appRouter } = await import("./routers");

function context(role: "admin" | "user" | null): TrpcContext {
  const now = new Date();
  return {
    user: role ? { id: 1, openId: `${role}-catalog-test`, name: "Catalog Tester", email: "catalog@example.com", loginMethod: "test", role, createdAt: now, updatedAt: now, lastSignedIn: now } : null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const item = { id: 7, slug: "decision-lab", itemType: "program", title: "Decision Lab", strapline: "Practice better decisions", description: "A focused program for teams making important choices.", audience: "Leaders and teams", duration: "4 weeks · online", outcomes: ["Frame options", "Commit with clarity"], priceKes: 4999, published: true, createdByOpenId: "admin", createdAt: new Date(), updatedAt: new Date() };

describe("catalog workflow", () => {
  beforeEach(() => vi.clearAllMocks());
  it("returns only the published database overlays to the public frontend", async () => {
    mocks.listPublishedCatalogItems.mockResolvedValueOnce([item]);
    const result = await appRouter.createCaller(context(null)).catalog.listPublished();
    expect(result).toEqual([expect.objectContaining({ slug: "decision-lab", published: true, outcomes: ["Frame options", "Commit with clarity"] })]);
  });

  it("keeps catalog creation admin-only", async () => {
    await expect(appRouter.createCaller(context("user")).catalog.create({ slug: "decision-lab", itemType: "course", title: "Decision Lab", strapline: "Practice better decisions", description: "A focused program for teams making important choices.", audience: "Leaders", duration: "4 weeks", outcomes: ["Frame options"], priceKes: 4999, published: false })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("creates a validated item with the admin actor attached", async () => {
    mocks.createCatalogItem.mockResolvedValueOnce(item);
    const result = await appRouter.createCaller(context("admin")).catalog.create({ slug: "decision-lab", itemType: "program", title: "Decision Lab", strapline: "Practice better decisions", description: "A focused program for teams making important choices.", audience: "Leaders and teams", duration: "4 weeks · online", outcomes: ["Frame options", "Commit with clarity"], priceKes: 4999, published: true });
    expect(mocks.createCatalogItem).toHaveBeenCalledWith(expect.objectContaining({ slug: "decision-lab", createdByOpenId: "admin-catalog-test" }));
    expect(result).toEqual(expect.objectContaining({ slug: "decision-lab", published: true }));
  });

  it("rejects unsafe slugs before reaching the database", async () => {
    await expect(appRouter.createCaller(context("admin")).catalog.create({ slug: "Not Safe", itemType: "course", title: "Decision Lab", strapline: "Practice better decisions", description: "A focused program for teams making important choices.", audience: "Leaders", duration: "4 weeks", outcomes: ["Frame options"], priceKes: 4999, published: false })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mocks.createCatalogItem).not.toHaveBeenCalled();
  });
});

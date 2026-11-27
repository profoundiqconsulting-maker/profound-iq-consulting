import { expect, test } from "@playwright/test";

test.describe("frontend API integration", () => {
  test("loads the public course catalog from the tRPC API", async ({
    page,
  }) => {
    const catalogResponsePromise = page.waitForResponse(response => {
      const url = response.url();
      return (
        url.includes("/api/trpc/") &&
        (url.includes("catalogList") || url.includes("listPublished"))
      );
    });

    await page.goto("/courses", { waitUntil: "domcontentloaded" });
    const catalogResponse = await catalogResponsePromise;

    expect(catalogResponse.ok()).toBe(true);
    await expect(
      page.getByRole("region", { name: "Course catalog" })
    ).toBeVisible();
  });

  test("rejects malformed checkout requests before database access", async ({
    request,
  }) => {
    const response = await request.post("/api/checkout/initialize", {
      data: { productType: "unknown" },
    });

    expect(response.status()).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      message: "Invalid checkout request.",
    });
  });
});

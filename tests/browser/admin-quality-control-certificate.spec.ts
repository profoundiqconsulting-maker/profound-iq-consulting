import { test, expect } from "@playwright/test";

const adminStorageState = process.env.PLAYWRIGHT_STORAGE_STATE;

test.describe("admin Quality Control certificate workflow", () => {
  test("shows QC mode and exposes certificate preview controls", async ({ page }) => {
    test.skip(!adminStorageState, "Set PLAYWRIGHT_STORAGE_STATE to an authenticated admin storage state to run this smoke test.");

    await page.goto("/admin", { waitUntil: "domcontentloaded" });
    await expect(page.getByLabel("Quality Control Mode active")).toBeVisible();
    await expect(page.getByRole("heading", { name: /certificate preview & settings/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "Download SVG" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Download PNG" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Print" })).toBeVisible();

    const certificateImage = page.locator('img[alt="Certificate preview"]');
    await expect(certificateImage).toBeVisible();
    await expect(certificateImage).toHaveAttribute("src", /data:image\/svg\+xml/);
  });
});

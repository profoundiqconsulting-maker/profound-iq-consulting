import { expect, test } from "@playwright/test";

test.describe("global language navigation", () => {
  test("exposes all ten locales and switches the document to Arabic RTL", async ({ page }) => {
    await page.goto("/");
    const selector = page.locator('select[aria-label="Select language"]').first();
    await expect(selector.locator("option")).toHaveCount(10);

    await selector.selectOption("ar");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator('select[aria-label="اختر اللغة"]').first()).toHaveValue("ar");
    await expect(page.locator("body")).toContainText("العربية");
  });

  test("keeps locale metadata coherent on representative public learning routes", async ({ page }) => {
    for (const route of ["/assessment", "/careerpath", "/psychometrics", "/verify-certificate"]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
      await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    }
  });

  test("persists a non-English locale after a reload", async ({ page }) => {
    await page.goto("/");
    await page.locator('select[aria-label="Select language"]').first().selectOption("sw");
    await expect(page.locator("html")).toHaveAttribute("lang", "sw");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(page.locator('select[aria-label="Chagua lugha"]').first()).toHaveValue("sw");

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", "sw");
    await expect(page.locator('select[aria-label="Chagua lugha"]').first()).toHaveValue("sw");
  });
});

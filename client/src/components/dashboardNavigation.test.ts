import { describe, expect, it } from "vitest";
import {
  dashboardNavItems,
  getDashboardPageCount,
  paginateDashboardItems,
  visibleDashboardNavItems,
} from "./dashboardNavigation";

describe("dashboard navigation registry", () => {
  it("keeps admin and staff visibility distinct", () => {
    expect(visibleDashboardNavItems("user").some((item) => item.adminOnly)).toBe(false);
    expect(visibleDashboardNavItems("user").some((item) => item.staffOnly)).toBe(false);
    expect(visibleDashboardNavItems("staff").some((item) => item.staffOnly)).toBe(true);
    expect(visibleDashboardNavItems("staff").some((item) => item.adminOnly)).toBe(false);
    expect(visibleDashboardNavItems("admin").some((item) => item.adminOnly)).toBe(true);
    expect(visibleDashboardNavItems("admin").some((item) => item.staffOnly)).toBe(true);
  });

  it("provides one registry entry per dashboard route", () => {
    expect(new Set(dashboardNavItems.map((item) => item.id)).size).toBe(dashboardNavItems.length);
    expect(new Set(dashboardNavItems.map((item) => item.path)).size).toBe(dashboardNavItems.length);
  });
});

describe("dashboard pagination helpers", () => {
  it("calculates page counts safely", () => {
    expect(getDashboardPageCount(0, 6)).toBe(1);
    expect(getDashboardPageCount(12, 6)).toBe(2);
    expect(getDashboardPageCount(13, 6)).toBe(3);
    expect(getDashboardPageCount(13, 0)).toBe(1);
  });

  it("clamps page numbers and returns the correct slice metadata", () => {
    const result = paginateDashboardItems(["a", "b", "c", "d", "e"], 99, 2);
    expect(result.items).toEqual(["e"]);
    expect(result.page).toBe(3);
    expect(result.pageCount).toBe(3);
    expect(result.totalItems).toBe(5);
    expect(paginateDashboardItems([1, 2, 3], 0, 2).items).toEqual([1, 2]);
  });
});

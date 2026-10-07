import { describe, expect, it } from "vitest";
import {
  adminNavItems,
  getDashboardPageCount,
  learnerNavItems,
  paginateDashboardItems,
  staffNavItems,
  visibleDashboardNavGroups,
  visibleDashboardNavItems,
} from "../client/src/components/dashboardNavigation";

describe("dashboard navigation registry", () => {
  it("keeps admin, staff, and learner visibility distinct", () => {
    expect(visibleDashboardNavItems("user").some(item => item.group === "platform")).toBe(false);
    expect(visibleDashboardNavItems("user").some(item => item.group === "workspace")).toBe(false);
    expect(visibleDashboardNavItems("staff").some(item => item.group === "platform")).toBe(false);
    expect(visibleDashboardNavItems("staff").some(item => item.group === "workspace")).toBe(true);
    expect(visibleDashboardNavItems("admin").some(item => item.group === "platform")).toBe(true);
    expect(visibleDashboardNavItems("admin").some(item => item.group === "mySpace")).toBe(false);
  });

  it("provides one registry entry per dashboard route within each role", () => {
    expect(new Set(adminNavItems.map(item => item.id)).size).toBe(
      adminNavItems.length
    );
    expect(new Set(adminNavItems.map(item => item.path)).size).toBe(
      adminNavItems.length
    );
    expect(new Set(staffNavItems.map(item => item.id)).size).toBe(
      staffNavItems.length
    );
    expect(new Set(learnerNavItems.map(item => item.id)).size).toBe(
      learnerNavItems.length
    );
  });

  it("surfaces role-specific nav groups", () => {
    expect(visibleDashboardNavGroups("admin").map(group => group.id)).toEqual([
      "platform",
      "learning",
      "operations",
      "system",
    ]);
    expect(visibleDashboardNavGroups("staff").map(group => group.id)).toEqual([
      "workspace",
      "operations",
      "account",
    ]);
    expect(visibleDashboardNavGroups("user").map(group => group.id)).toEqual([
      "mySpace",
      "growth",
      "account",
    ]);
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

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  dashboardNavGroups,
  paginateDashboardItems,
  visibleDashboardNavItems,
} from "../client/src/components/dashboardNavigation";

describe("My Space workspace navigation", () => {
  it("keeps role-aware destinations ordered into workspace, growth, and operations groups", () => {
    expect(dashboardNavGroups.map(group => group.id)).toEqual([
      "workspace",
      "growth",
      "operations",
    ]);
    expect(
      visibleDashboardNavItems("user").some(item => item.id === "admin")
    ).toBe(false);
    expect(
      visibleDashboardNavItems("staff").some(item => item.id === "staff")
    ).toBe(true);
    expect(
      visibleDashboardNavItems("admin").some(item => item.id === "admin")
    ).toBe(true);
  });

  it("paginates dashboard collections with bounded page metadata", () => {
    const result = paginateDashboardItems([1, 2, 3, 4, 5], 2, 2);
    expect(result.items).toEqual([3, 4]);
    expect(result.page).toBe(2);
    expect(result.pageCount).toBe(3);
    expect(paginateDashboardItems([1], 99, 6).page).toBe(1);
  });

  it("uses the grouped quick menu in every authenticated workspace surface", () => {
    const quickNav = readFileSync(
      "client/src/components/DashboardQuickNav.tsx",
      "utf8"
    );
    const staff = readFileSync("client/src/pages/StaffDashboard.tsx", "utf8");
    const user = readFileSync("client/src/pages/UserDashboard.tsx", "utf8");
    expect(quickNav).toContain("dashboardNavGroups.map");
    expect(quickNav).toContain("lg:grid-cols-3");
    expect(staff).toContain('<DashboardQuickNav role="staff"');
    expect(user).toContain("<DashboardQuickNav");
    expect(user).toContain("report-history-title");
    expect(user).toContain("reportHistoryFrom");
    expect(user).toContain("reportHistoryTo");
    expect(user).toContain("pagedReportHistory");
    expect(user).toContain('aria-label="Report history pagination"');
  });
});

it("keeps the reusable dashboard pagination component available", () => {
  const pagination = readFileSync(
    "client/src/components/DashboardPagination.tsx",
    "utf8"
  );
  expect(pagination).toContain("pageCount");
  expect(pagination).toContain("onPageChange");
});

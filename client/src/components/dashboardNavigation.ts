import {
  Award,
  BarChart3,
  BookOpen,
  Bookmark,
  BrainCircuit,
  ClipboardCheck,
  ClipboardList,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type DashboardNavItem = {
  id: string;
  labelKey:
    | "overview"
    | "settings"
    | "certificates"
    | "selfAssessment"
    | "selfAssessmentReports"
    | "psychometrics"
    | "psychometricReports"
    | "careerPath"
    | "careerPathReports"
    | "courses"
    | "myWorkspace"
    | "enrolledCourses"
    | "myIllustrations"
    | "adminObservatory"
    | "staffWorkspace";
  fallbackLabel: string;
  path: string;
  icon: LucideIcon;
  group: "workspace" | "growth" | "operations";
  adminOnly?: boolean;
  staffOnly?: boolean;
};

export const dashboardNavItems: DashboardNavItem[] = [
  {
    id: "overview",
    labelKey: "overview",
    fallbackLabel: "Overview",
    path: "/dashboard",
    icon: LayoutDashboard,
    group: "workspace",
  },
  {
    id: "dashboard-assessment",
    labelKey: "selfAssessmentReports",
    fallbackLabel: "Assessment Reports",
    path: "/dashboard/assessment",
    icon: ClipboardCheck,
    group: "growth",
  },
  {
    id: "dashboard-careerpath",
    labelKey: "careerPathReports",
    fallbackLabel: "CareerPath Reports",
    path: "/dashboard/careerpath",
    icon: Users,
    group: "growth",
  },
  {
    id: "dashboard-psychometrics",
    labelKey: "psychometricReports",
    fallbackLabel: "Psychometric Reports",
    path: "/dashboard/psychometrics",
    icon: BrainCircuit,
    group: "growth",
  },
  {
    id: "my-certificates",
    labelKey: "certificates",
    fallbackLabel: "My Certificates",
    path: "/dashboard/certificates",
    icon: Award,
    group: "workspace",
  },
  {
    id: "settings",
    labelKey: "settings",
    fallbackLabel: "Settings",
    path: "/dashboard/settings",
    icon: Settings,
    group: "workspace",
  },
  {
    id: "self-assessment",
    labelKey: "selfAssessment",
    fallbackLabel: "Self Assessment",
    path: "/assessment",
    icon: ClipboardCheck,
    group: "growth",
  },
  {
    id: "psychometrics",
    labelKey: "psychometrics",
    fallbackLabel: "Psychometrics",
    path: "/psychometrics",
    icon: BrainCircuit,
    group: "growth",
  },
  {
    id: "careerpath",
    labelKey: "careerPath",
    fallbackLabel: "CareerPath",
    path: "/careerpath",
    icon: Users,
    group: "growth",
  },
  {
    id: "courses",
    labelKey: "courses",
    fallbackLabel: "Courses",
    path: "/courses",
    icon: BookOpen,
    group: "growth",
  },
  {
    id: "my-workspaces",
    labelKey: "myWorkspace",
    fallbackLabel: "My Workspaces",
    path: "/dashboard/my-workspaces",
    icon: BookOpen,
    group: "workspace",
  },
  {
    id: "dashboard-enrolled-courses",
    labelKey: "enrolledCourses",
    fallbackLabel: "Enrolled Courses",
    path: "/dashboard/enrolled-courses",
    icon: BookOpen,
    group: "workspace",
  },
  {
    id: "my-illustrations",
    labelKey: "myIllustrations",
    fallbackLabel: "My Illustrations",
    path: "/my-illustrations",
    icon: Bookmark,
    group: "growth",
  },
  {
    id: "admin",
    labelKey: "adminObservatory",
    fallbackLabel: "Admin observatory",
    path: "/admin",
    icon: BarChart3,
    group: "operations",
    adminOnly: true,
  },
  {
    id: "staff",
    labelKey: "staffWorkspace",
    fallbackLabel: "Staff workspace",
    path: "/staff",
    icon: ClipboardList,
    group: "operations",
    staffOnly: true,
  },
];

export const dashboardNavGroups = [
  { id: "workspace", labelKey: "workspace", fallbackLabel: "Workspace" },
  { id: "growth", labelKey: "growth", fallbackLabel: "Transformation" },
  { id: "operations", labelKey: "operations", fallbackLabel: "Operations" },
] as const;

export function visibleDashboardNavItems(role: string | undefined) {
  return dashboardNavItems.filter(
    item =>
      (!item.adminOnly || role === "admin") &&
      (!item.staffOnly || role === "admin" || role === "staff")
  );
}

export function getDashboardPageCount(totalItems: number, pageSize: number) {
  if (!Number.isFinite(totalItems) || totalItems <= 0) return 1;
  if (!Number.isFinite(pageSize) || pageSize <= 0) return 1;
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

export function paginateDashboardItems<T>(
  items: T[],
  page: number,
  pageSize: number
) {
  const safePageSize =
    Number.isFinite(pageSize) && pageSize > 0
      ? Math.floor(pageSize)
      : items.length || 1;
  const pageCount = getDashboardPageCount(items.length, safePageSize);
  const safePage = Math.min(Math.max(1, Math.floor(page)), pageCount);
  return {
    items: items.slice((safePage - 1) * safePageSize, safePage * safePageSize),
    page: safePage,
    pageCount,
    pageSize: safePageSize,
    totalItems: items.length,
  };
}

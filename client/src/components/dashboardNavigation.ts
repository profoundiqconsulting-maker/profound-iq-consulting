import {
  Activity,
  Award,
  BarChart3,
  BookOpen,
  Bookmark,
  BrainCircuit,
  ClipboardCheck,
  ClipboardList,
  LayoutDashboard,
  Mail,
  Settings,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type RoleNavItem = {
  id: string;
  labelKey:
    | "overview"
    | "settings"
    | "messages"
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
    | "staffWorkspace"
    | "userManagement"
    | "cohortManagement"
    | "contactInquiries"
    | "assignedInquiries"
    | "lessonReviews"
    | "reviewAnalytics";
  fallbackLabel: string;
  path: string;
  icon: LucideIcon;
  group: string;
};

export const adminNavItems: RoleNavItem[] = [
  {
    id: "admin-observatory",
    labelKey: "adminObservatory",
    fallbackLabel: "Overview",
    path: "/admin/overview",
    icon: BarChart3,
    group: "platform",
  },
  {
    id: "admin-users",
    labelKey: "userManagement",
    fallbackLabel: "Users",
    path: "/admin/users",
    icon: Users,
    group: "platform",
  },
  {
    id: "admin-cohorts",
    labelKey: "cohortManagement",
    fallbackLabel: "Cohorts",
    path: "/admin/cohorts",
    icon: Users,
    group: "platform",
  },
  {
    id: "admin-operations",
    labelKey: "operations",
    fallbackLabel: "Operations",
    path: "/admin/operations",
    icon: Activity,
    group: "operations",
  },
  {
    id: "admin-revenue",
    labelKey: "revenue",
    fallbackLabel: "Revenue",
    path: "/admin/revenue",
    icon: Database,
    group: "operations",
  },
  {
    id: "admin-inbox",
    labelKey: "contactInquiries",
    fallbackLabel: "Inquiries",
    path: "/admin/inquiries",
    icon: Mail,
    group: "operations",
  },
  {
    id: "admin-certificates",
    labelKey: "certificates",
    fallbackLabel: "Certificates",
    path: "/admin/certificates",
    icon: Award,
    group: "operations",
  },
  {
    id: "admin-staff",
    labelKey: "staffWorkspace",
    fallbackLabel: "Staff",
    path: "/admin/staff",
    icon: Users,
    group: "operations",
  },
  {
    id: "admin-reports",
    labelKey: "adminObservatory",
    fallbackLabel: "Reports",
    path: "/admin/overview",
    icon: BarChart3,
    group: "system",
  },
  {
    id: "admin-system",
    labelKey: "settings",
    fallbackLabel: "System",
    path: "/admin/system",
    icon: Settings,
    group: "system",
  },
];

export const staffNavItems: RoleNavItem[] = [
  {
    id: "staff-workspace",
    labelKey: "staffWorkspace",
    fallbackLabel: "Staff Workspace",
    path: "/staff",
    icon: ClipboardList,
    group: "workspace",
  },
  {
    id: "staff-inquiries",
    labelKey: "assignedInquiries",
    fallbackLabel: "Assigned Inquiries",
    path: "/staff/inquiries",
    icon: Mail,
    group: "operations",
  },
  {
    id: "staff-reviews",
    labelKey: "lessonReviews",
    fallbackLabel: "Lesson Reviews",
    path: "/staff/reviews",
    icon: ClipboardCheck,
    group: "operations",
  },
  {
    id: "staff-analytics",
    labelKey: "reviewAnalytics",
    fallbackLabel: "Review Analytics",
    path: "/staff/analytics",
    icon: BarChart3,
    group: "operations",
  },
  {
    id: "staff-settings",
    labelKey: "settings",
    fallbackLabel: "Workspace Settings",
    path: "/staff/settings",
    icon: Settings,
    group: "account",
  },
];

export const learnerNavItems: RoleNavItem[] = [
  {
    id: "learner-space",
    labelKey: "overview",
    fallbackLabel: "My Space",
    path: "/dashboard",
    icon: LayoutDashboard,
    group: "mySpace",
  },
  {
    id: "learner-certificates",
    labelKey: "certificates",
    fallbackLabel: "My Certificates",
    path: "/dashboard/certificates",
    icon: Award,
    group: "mySpace",
  },
  {
    id: "learner-illustrations",
    labelKey: "myIllustrations",
    fallbackLabel: "My Illustrations",
    path: "/my-illustrations",
    icon: Bookmark,
    group: "mySpace",
  },
  {
    id: "learner-workspaces",
    labelKey: "myWorkspace",
    fallbackLabel: "My Workspaces",
    path: "/dashboard/my-workspaces",
    icon: BookOpen,
    group: "mySpace",
  },
  {
    id: "learner-enrolled",
    labelKey: "enrolledCourses",
    fallbackLabel: "Enrolled Courses",
    path: "/dashboard/enrolled-courses",
    icon: BookOpen,
    group: "mySpace",
  },
  {
    id: "learner-assessment",
    labelKey: "selfAssessmentReports",
    fallbackLabel: "Assessment Reports",
    path: "/dashboard/assessment",
    icon: ClipboardCheck,
    group: "growth",
  },
  {
    id: "learner-psychometrics",
    labelKey: "psychometricReports",
    fallbackLabel: "Psychometric Reports",
    path: "/dashboard/psychometrics",
    icon: BrainCircuit,
    group: "growth",
  },
  {
    id: "learner-careerpath",
    labelKey: "careerPathReports",
    fallbackLabel: "CareerPath Reports",
    path: "/dashboard/careerpath",
    icon: Users,
    group: "growth",
  },
  {
    id: "learner-courses",
    labelKey: "courses",
    fallbackLabel: "Courses",
    path: "/courses",
    icon: BookOpen,
    group: "growth",
  },
  {
    id: "learner-self-assessment",
    labelKey: "selfAssessment",
    fallbackLabel: "Self Assessment",
    path: "/assessment",
    icon: ClipboardCheck,
    group: "growth",
  },
  {
    id: "learner-psychometrics-standalone",
    labelKey: "psychometrics",
    fallbackLabel: "Psychometrics",
    path: "/psychometrics",
    icon: BrainCircuit,
    group: "growth",
  },
  {
    id: "learner-careerpath-standalone",
    labelKey: "careerPath",
    fallbackLabel: "CareerPath",
    path: "/careerpath",
    icon: Users,
    group: "growth",
  },
  {
    id: "learner-messages",
    labelKey: "messages",
    fallbackLabel: "Messages",
    path: "/dashboard/communication",
    icon: Mail,
    group: "account",
  },
  {
    id: "learner-settings",
    labelKey: "settings",
    fallbackLabel: "Settings",
    path: "/dashboard/settings",
    icon: Settings,
    group: "account",
  },
];

export const adminGroups = [
  { id: "platform", fallbackLabel: "Platform" },
  { id: "operations", fallbackLabel: "Operations" },
  { id: "system", fallbackLabel: "System" },
] as const;

export const staffGroups = [
  { id: "workspace", fallbackLabel: "Workspace" },
  { id: "operations", fallbackLabel: "Operations" },
  { id: "account", fallbackLabel: "Account" },
] as const;

export const learnerGroups = [
  { id: "mySpace", fallbackLabel: "My Space" },
  { id: "growth", fallbackLabel: "Growth" },
  { id: "account", fallbackLabel: "Account" },
] as const;

export function visibleDashboardNavItems(role: string | undefined) {
  if (role === "admin") return adminNavItems;
  if (role === "staff") return staffNavItems;
  return learnerNavItems;
}

export function visibleDashboardNavGroups(role: string | undefined) {
  if (role === "admin") return adminGroups;
  if (role === "staff") return staffGroups;
  return learnerGroups;
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

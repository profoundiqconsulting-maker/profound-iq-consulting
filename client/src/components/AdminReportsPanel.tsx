import {
  BarChart3,
  Download,
  FileSpreadsheet,
  GraduationCap,
  Users,
  LineChart,
  ShieldCheck,
  Activity,
  TrendingUp,
  TrendingDown,
  Eye,
  UserPlus,
  CreditCard,
  Award,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

type ReportCategory = {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  reports: {
    id: string;
    label: string;
    description: string;
    formats: ("csv" | "excel" | "pdf")[];
    useQuery: () => {
      data?: unknown;
      isLoading: boolean;
      error?: { message?: string };
    };
  }[];
};

export default function AdminReportsPanel() {
  const [selectedCategory, setSelectedCategory] = useState<string>("overview");
  const [dateRange, setDateRange] = useState<{
    fromDate?: string;
    toDate?: string;
  }>({});

  const analytics = trpc.admin.analyticsSummary.useQuery(dateRange);
  const revenue = trpc.admin.revenueReport.useQuery(dateRange);
  const usersQuery = trpc.admin.listAllUsers.useQuery();

  const totalUsers = usersQuery.data?.length ?? 0;
  const adminUsers =
    usersQuery.data?.filter(u => u.role === "admin").length ?? 0;
  const staffUsers =
    usersQuery.data?.filter(u => u.role === "staff").length ?? 0;

  const reportCategories: ReportCategory[] = [
    {
      id: "overview",
      label: "Overview",
      description: "Sitewide analytics and performance metrics",
      icon: <Activity size={18} />,
      reports: [
        {
          id: "analytics-summary",
          label: "Analytics Summary",
          description: "Overall site performance and engagement metrics",
          formats: ["csv", "excel", "pdf"],
          useQuery: () =>
            analytics as {
              data?: unknown;
              isLoading: boolean;
              error?: { message?: string };
            },
        },
        {
          id: "revenue-report",
          label: "Revenue Report",
          description: "Payment transactions and revenue breakdown",
          formats: ["csv", "excel", "pdf"],
          useQuery: () =>
            revenue as {
              data?: unknown;
              isLoading: boolean;
              error?: { message?: string };
            },
        },
        {
          id: "user-verification",
          label: "User Verification Review",
          description: "User verification status and review queue",
          formats: ["csv", "excel"],
          useQuery: () =>
            trpc.admin.userVerificationReview.useQuery({
              page: 1,
              pageSize: 100,
            }) as {
              data?: unknown;
              isLoading: boolean;
              error?: { message?: string };
            },
        },
      ],
    },
    {
      id: "courses",
      label: "Courses & Learning",
      description: "Course enrollment, completion, and access analytics",
      icon: <GraduationCap size={18} />,
      reports: [
        {
          id: "course-access",
          label: "Course Access Analytics",
          description: "Access denied events and conversion tracking",
          formats: ["csv", "pdf"],
          useQuery: () =>
            trpc.admin.courseAccessDeniedAnalytics.useQuery(dateRange) as {
              data?: unknown;
              isLoading: boolean;
              error?: { message?: string };
            },
        },
        {
          id: "psychometric",
          label: "Psychometric Analytics",
          description: "Assessment performance and scoring analytics",
          formats: ["csv", "excel", "pdf"],
          useQuery: () =>
            trpc.admin.psychometricAttempts.useQuery({
              ...dateRange,
              paymentStatus: "all",
              limit: 100,
            }) as {
              data?: unknown;
              isLoading: boolean;
              error?: { message?: string };
            },
        },
        {
          id: "certificate-usage",
          label: "Certificate Usage",
          description: "Certificate downloads and social shares",
          formats: ["csv"],
          useQuery: () =>
            trpc.admin.certificateUsageAnalytics.useQuery(dateRange) as {
              data?: unknown;
              isLoading: boolean;
              error?: { message?: string };
            },
        },
      ],
    },
    {
      id: "users",
      label: "Users & Communication",
      description: "User management and communication analytics",
      icon: <Users size={18} />,
      reports: [
        {
          id: "contact-inquiries",
          label: "Contact Inquiries",
          description: "Inquiry submissions and follow-up status",
          formats: ["csv", "excel"],
          useQuery: () =>
            trpc.admin.contactInquiries.useQuery({
              page: 1,
              pageSize: 100,
            }) as {
              data?: unknown;
              isLoading: boolean;
              error?: { message?: string };
            },
        },
        {
          id: "newsletter",
          label: "Newsletter Subscribers",
          description: "Subscription analytics and engagement",
          formats: ["csv"],
          useQuery: () =>
            trpc.newsletter.subscribers.useQuery({
              page: 1,
              pageSize: 100,
            }) as {
              data?: unknown;
              isLoading: boolean;
              error?: { message?: string };
            },
        },
        {
          id: "delivery-log",
          label: "Email Delivery Log",
          description: "Email template delivery status and failures",
          formats: ["csv"],
          useQuery: () =>
            trpc.admin.emailPreviewHistory.useQuery({
              page: 1,
              pageSize: 100,
            }) as {
              data?: unknown;
              isLoading: boolean;
              error?: { message?: string };
            },
        },
      ],
    },
    {
      id: "security",
      label: "Security",
      description: "Manual reset",
      icon: <ShieldCheck size={18} />,
      reports: [
        {
          id: "manual-reset",
          label: "Manual reset",
          description: "Manual reset",
          formats: ["csv"],
          useQuery: () =>
            trpc.admin.courseAccessGrants.useQuery({ activeOnly: false }) as {
              data?: unknown;
              isLoading: boolean;
              error?: { message?: string };
            },
        },
      ],
    },
    {
      id: "surveys",
      label: "Surveys & Feedback",
      description: "Survey responses and feedback analytics",
      icon: <BarChart3 size={18} />,
      reports: [
        {
          id: "survey-responses",
          label: "Survey Responses",
          description: "Survey participation and response analytics",
          formats: ["csv", "excel"],
          useQuery: () =>
            trpc.admin.listSurveys.useQuery() as {
              data?: unknown;
              isLoading: boolean;
              error?: { message?: string };
            },
        },
        {
          id: "course-shares",
          label: "Course Share Analytics",
          description: "Social sharing activity and platform breakdown",
          formats: ["csv", "pdf"],
          useQuery: () =>
            trpc.admin.courseShareAnalytics.useQuery(dateRange) as {
              data?: unknown;
              isLoading: boolean;
              error?: { message?: string };
            },
        },
      ],
    },
  ];

  const selectedCategoryData = reportCategories.find(
    cat => cat.id === selectedCategory
  );

  const analyticsSummary = analytics.data as
    | {
        summary: Record<string, number>;
        previousSummary: Record<string, number>;
        weekly: Record<string, Record<string, number>>;
      }
    | null
    | undefined;

  const statCards = [
    {
      label: "Total Users",
      value: totalUsers,
      icon: <Users size={18} />,
      trend: null,
      color: "bg-[#16243d]",
    },
    {
      label: "Admin Users",
      value: adminUsers,
      icon: <ShieldCheck size={18} />,
      trend: null,
      color: "bg-[var(--brand)]",
    },
    {
      label: "Staff Users",
      value: staffUsers,
      icon: <UserPlus size={18} />,
      trend: null,
      color: "bg-[var(--brand)]",
    },
    {
      label: "Site Visits",
      value: analyticsSummary?.summary?.["page_view"] ?? 0,
      icon: <Eye size={18} />,
      trend: null,
      color: "bg-[#16243d]",
    },
  ];

  return (
    <section className="mt-10 border border-[#16243d]/15 bg-white/55 p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow flex items-center gap-2 text-[var(--brand)]">
            <LineChart size={13} /> Reports & exports
          </p>
          <h2 className="display mt-3 text-3xl">Executive Dashboard</h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--fg-muted)]">
            Platform overview, key metrics, and downloadable reports. Filter by
            date range and choose your preferred format.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`rounded-xl border border-[#16243d]/10 ${stat.color} p-5 text-white shadow-sm transition-shadow hover:shadow-md`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.12em] text-white/70">
                  {stat.label}
                </p>
                <p className="display mt-2 text-3xl text-white">
                  {stat.value.toLocaleString()}
                </p>
              </div>
              <div className="text-white/80">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <nav className="space-y-1" aria-label="Report categories">
            {reportCategories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm transition-all ${
                  selectedCategory === category.id
                    ? "border-[var(--brand)] bg-[var(--brand)]/10 shadow-sm"
                    : "border-[#16243d]/10 hover:border-[var(--brand)]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[var(--brand)]">{category.icon}</span>
                  <span className="font-semibold">{category.label}</span>
                </div>
                <p className="mt-1 text-xs text-[var(--fg-muted)]">
                  {category.description}
                </p>
              </button>
            ))}
          </nav>
        </div>

        <div className="lg:col-span-3">
          {selectedCategoryData && (
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="text-[var(--brand)]">
                  {selectedCategoryData.icon}
                </span>
                <h3 className="text-lg font-bold">
                  {selectedCategoryData.label}
                </h3>
              </div>
              <p className="mb-4 text-sm text-[var(--fg-muted)]">
                {selectedCategoryData.description}
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                {selectedCategoryData.reports.map(report => {
                  const result = report.useQuery();
                  const data = result.data;
                  const isLoading = result.isLoading;
                  const error = result.error;

                  return (
                    <div
                      key={report.id}
                      className="rounded-xl border border-[#16243d]/10 bg-white p-5 shadow-sm transition-all hover:border-[var(--brand)] hover:shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{report.label}</p>
                          <p className="mt-1 text-xs text-[var(--fg-muted)]">
                            {report.description}
                          </p>
                        </div>
                        <FileSpreadsheet size={18} className="text-[var(--brand)]" />
                      </div>

                      {error && (
                        <p className="mt-2 text-xs text-red-700">
                          Failed to load report data
                        </p>
                      )}

                      {Boolean(data) && !error && (
                        <p className="mt-2 text-xs text-emerald-800 font-semibold">
                          {Array.isArray(data)
                            ? `${(data as unknown[]).length} records`
                            : "Data available"}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">
                        {report.formats.map(format => (
                          <button
                            key={format}
                            disabled={isLoading || !!error}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#16243d] px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] text-white transition hover:bg-[#16243d]/90 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Download size={10} />
                            {format.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

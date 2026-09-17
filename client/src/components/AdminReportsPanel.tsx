import {
  BarChart3,
  Download,
  FileSpreadsheet,
  GraduationCap,
  Users,
  LineChart,
  ShieldCheck,
  Activity,
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
  const [dateRange, setDateRange] = useState<{ fromDate?: string; toDate?: string }>({});

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
          useQuery: () => trpc.admin.analyticsSummary.useQuery(dateRange) as { data?: unknown; isLoading: boolean; error?: { message?: string } },
        },
        {
          id: "revenue-report",
          label: "Revenue Report",
          description: "Payment transactions and revenue breakdown",
          formats: ["csv", "excel", "pdf"],
          useQuery: () => trpc.admin.revenueReport.useQuery(dateRange) as { data?: unknown; isLoading: boolean; error?: { message?: string } },
        },
        {
          id: "user-verification",
          label: "User Verification Review",
          description: "User verification status and review queue",
          formats: ["csv", "excel"],
          useQuery: () => trpc.admin.userVerificationReview.useQuery({ page: 1, pageSize: 100 }) as { data?: unknown; isLoading: boolean; error?: { message?: string } },
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
          useQuery: () => trpc.admin.courseAccessDeniedAnalytics.useQuery(dateRange) as { data?: unknown; isLoading: boolean; error?: { message?: string } },
        },
        {
          id: "psychometric",
          label: "Psychometric Analytics",
          description: "Assessment performance and scoring analytics",
          formats: ["csv", "excel", "pdf"],
          useQuery: () => trpc.admin.psychometricAttempts.useQuery({ ...dateRange, paymentStatus: "all", limit: 100 }) as { data?: unknown; isLoading: boolean; error?: { message?: string } },
        },
        {
          id: "certificate-usage",
          label: "Certificate Usage",
          description: "Certificate downloads and social shares",
          formats: ["csv"],
          useQuery: () => trpc.admin.certificateUsageAnalytics.useQuery(dateRange) as { data?: unknown; isLoading: boolean; error?: { message?: string } },
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
          useQuery: () => trpc.admin.contactInquiries.useQuery({ page: 1, pageSize: 100 }) as { data?: unknown; isLoading: boolean; error?: { message?: string } },
        },
        {
          id: "newsletter",
          label: "Newsletter Subscribers",
          description: "Subscription analytics and engagement",
          formats: ["csv"],
            useQuery: () => trpc.newsletter.subscribers.useQuery({ page: 1, pageSize: 100 }) as { data?: unknown; isLoading: boolean; error?: { message?: string } },
        },
        {
          id: "delivery-log",
          label: "Email Delivery Log",
          description: "Email template delivery status and failures",
          formats: ["csv"],
          useQuery: () => trpc.admin.emailPreviewHistory.useQuery({ page: 1, pageSize: 100 }) as { data?: unknown; isLoading: boolean; error?: { message?: string } },
        },
      ],
    },
    {
      id: "security",
      label: "Security & Compliance",
      description: "Access controls, audits, and compliance reports",
      icon: <ShieldCheck size={18} />,
      reports: [
        {
          id: "access-grants",
          label: "Course Access Grants",
          description: "Manual course access grants and audits",
          formats: ["csv"],
          useQuery: () => trpc.admin.courseAccessGrants.useQuery({ activeOnly: false }) as { data?: unknown; isLoading: boolean; error?: { message?: string } },
        },
        {
          id: "verification-audits",
          label: "Verification & Revocation Audits",
          description: "Email verification and revocation audit trail",
          formats: ["csv"],
          useQuery: () => trpc.admin.verificationRevocationAudits.useQuery({ page: 1, pageSize: 100 }) as { data?: unknown; isLoading: boolean; error?: { message?: string } },
        },
        {
          id: "payment-reconciliation",
          label: "Payment Reconciliation Log",
          description: "Payment verification and reconciliation history",
          formats: ["csv"],
          useQuery: () => trpc.admin.paymentReconciliationLog.useQuery({ limit: 100 }) as { data?: unknown; isLoading: boolean; error?: { message?: string } },
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
          useQuery: () => trpc.admin.listSurveys.useQuery() as { data?: unknown; isLoading: boolean; error?: { message?: string } },
        },
        {
          id: "course-shares",
          label: "Course Share Analytics",
          description: "Social sharing activity and platform breakdown",
          formats: ["csv", "pdf"],
          useQuery: () => trpc.admin.courseShareAnalytics.useQuery(dateRange) as { data?: unknown; isLoading: boolean; error?: { message?: string } },
        },
      ],
    },
  ];

  const selectedCategoryData = reportCategories.find(cat => cat.id === selectedCategory);

  return (
    <section className="mt-10 border border-[#16243d]/15 bg-white/55 p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow flex items-center gap-2 text-[#7d5e1e]">
            <LineChart size={13} /> Reports & exports
          </p>
          <h2 className="display mt-3 text-3xl">
            Sitewide reports
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[#657084]">
            Download branded reports for any area of the platform. Filter by date range and choose your preferred format.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <nav className="space-y-1" aria-label="Report categories">
            {reportCategories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-all ${
                  selectedCategory === category.id
                    ? "border-[#c9a34e] bg-[#c9a34e]/10"
                    : "border-[#16243d]/10 hover:border-[#c9a34e]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[#7d5e1e]">{category.icon}</span>
                  <span className="font-semibold">{category.label}</span>
                </div>
                <p className="mt-1 text-xs text-[#657084]">{category.description}</p>
              </button>
            ))}
          </nav>
        </div>

        <div className="lg:col-span-3">
          {selectedCategoryData && (
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="text-[#7d5e1e]">{selectedCategoryData.icon}</span>
                <h3 className="text-lg font-bold">{selectedCategoryData.label}</h3>
              </div>
              <p className="mb-4 text-sm text-[#657084]">{selectedCategoryData.description}</p>

              <div className="grid gap-4 sm:grid-cols-2">
                {selectedCategoryData.reports.map(report => {
                  const result = report.useQuery();
                  const data = result.data;
                  const isLoading = result.isLoading;
                  const error = result.error;

                  return (
                    <div
                      key={report.id}
                      className="border border-[#16243d]/10 bg-white p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{report.label}</p>
                          <p className="mt-1 text-xs text-[#657084]">{report.description}</p>
                        </div>
                        <FileSpreadsheet size={16} className="text-[#7d5e1e]" />
                      </div>

                      {error && (
                        <p className="mt-2 text-xs text-red-700">Failed to load report data</p>
                      )}

                      {Boolean(data) && !error && (
                        <p className="mt-2 text-xs text-emerald-700">
                          {Array.isArray(data) ? `${(data as unknown[]).length} records` : "Data available"}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2">
                        {report.formats.map(format => (
                          <button
                            key={format}
                            disabled={isLoading || !!error}
                            className="inline-flex items-center gap-1 border border-[#16243d]/20 px-2 py-1 text-[10px] font-black uppercase tracking-[.1em] disabled:opacity-40"
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

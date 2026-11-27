import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Users,
  UserCheck,
  BookOpen,
  CreditCard,
  Download,
  Mail,
  ArrowUpRight,
  Activity,
} from "lucide-react";
import { Link } from "wouter";

type Stat = {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  href?: string;
};

export default function AdminOverview() {
  const overview = trpc.assessment.adminOverview.useQuery(undefined, {
    retry: false,
    refetchInterval: 30000,
  });
  const analytics = trpc.admin.analyticsSummary.useQuery(undefined, {
    retry: false,
    refetchInterval: 30000,
  });
  const users = trpc.admin.listAllUsers.useQuery(undefined, {
    retry: false,
    refetchInterval: 30000,
  });
  const inquiries = trpc.admin.contactInquiries.useQuery(
    { page: 1, pageSize: 5 },
    { retry: false, refetchInterval: 30000 }
  );

  const stats = useMemo<Stat[]>(() => {
    const summary = analytics.data?.summary;

    return [
      {
        label: "Assessments started",
        value:
          analytics.isError && overview.isError
            ? "Unavailable"
            : (summary?.assessment_started ??
              overview.data?.summary?.total ??
              0),
        sub: "All time",
        icon: <Activity className="h-4 w-4" />,
        href: "/admin/psychometrics",
      },
      {
        label: "Payments completed",
        value:
          analytics.isError && overview.isError
            ? "Unavailable"
            : (summary?.payment_completed ?? overview.data?.summary?.paid ?? 0),
        sub: "Verified conversions",
        icon: <CreditCard className="h-4 w-4" />,
        href: "/admin/revenue",
      },
      {
        label: "Reports downloaded",
        value: analytics.isError
          ? "Unavailable"
          : (summary?.report_downloaded ?? 0),
        sub: "Branded PDFs",
        icon: <Download className="h-4 w-4" />,
        href: "/admin/reports",
      },
      {
        label: "Total users",
        value: users.isError ? "Unavailable" : (users.data?.length ?? 0),
        sub: "Platform accounts",
        icon: <Users className="h-4 w-4" />,
        href: "/admin/users",
      },
      {
        label: "Enrollment submissions",
        value: analytics.isError
          ? "Unavailable"
          : (summary?.course_enrollment_submitted ?? 0),
        sub: "Course interest records",
        icon: <BookOpen className="h-4 w-4" />,
        href: "/admin/operations",
      },
      {
        label: "Contact inquiries",
        value: inquiries.isError ? "Unavailable" : (inquiries.data?.total ?? 0),
        sub: "All statuses",
        icon: <Mail className="h-4 w-4" />,
        href: "/admin/inbox",
      },
    ];
  }, [
    analytics.data,
    analytics.isError,
    overview.data,
    overview.isError,
    users.data,
    users.isError,
    inquiries.data,
    inquiries.isError,
  ]);

  const isSummaryLoading =
    overview.isLoading || analytics.isLoading || users.isLoading;
  const failedSources = [
    overview.isError && "assessment totals",
    analytics.isError && "platform analytics",
    users.isError && "user accounts",
    inquiries.isError && "contact inquiries",
  ].filter((source): source is string => Boolean(source));

  return (
    <DashboardLayout role="admin" title="Overview">
      <div className="admin-observatory w-full space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Overview</p>
            <h1 className="display mt-2 text-3xl">Platform overview</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[#64748b]">
              Monitor learning activity, verified payments, report usage, and
              incoming inquiries from one place.
            </p>
          </div>
        </div>

        {failedSources.length > 0 && (
          <Card
            role="alert"
            className="flex flex-col gap-3 border border-red-200 bg-red-50 p-5 text-red-950 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                className="mt-0.5 h-5 w-5 shrink-0 text-red-700"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-semibold">
                  Some overview data could not be loaded.
                </p>
                <p className="mt-1 text-sm">
                  Check {failedSources.join(", ")} and try again.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void Promise.all([
                  overview.refetch(),
                  analytics.refetch(),
                  users.refetch(),
                  inquiries.refetch(),
                ]);
              }}
              className="shrink-0 border-red-300 bg-white text-red-900 hover:bg-red-100"
            >
              Retry
            </Button>
          </Card>
        )}

        {isSummaryLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card
                key={index}
                className="h-32 animate-pulse bg-[#f7f3e8] p-5"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map(stat => {
              const card = (
                <Card className="exec-card h-full p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#16243d]/5 text-[#16243d]">
                        {stat.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="exec-label-muted">{stat.label}</p>
                        <p className="mt-1 text-2xl font-bold tabular-nums text-[#0f172a]">
                          {typeof stat.value === "number"
                            ? stat.value.toLocaleString()
                            : stat.value}
                        </p>
                        {stat.sub && (
                          <p className="text-xs text-[#64748b]">{stat.sub}</p>
                        )}
                      </div>
                    </div>
                    {stat.href && (
                      <ArrowUpRight
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 text-[#64748b] transition-colors group-hover:text-[#16243d]"
                      />
                    )}
                  </div>
                </Card>
              );
              return stat.href ? (
                <Link
                  key={stat.label}
                  href={stat.href}
                  aria-label={`${stat.label} details`}
                  className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
                >
                  {card}
                </Link>
              ) : (
                <div key={stat.label}>{card}</div>
              );
            })}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="exec-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="exec-label-gold">Latest contact inquiries</p>
                <p className="mt-1 text-xs text-[#64748b]">
                  Recently submitted requests and their current status.
                </p>
              </div>
              <Link href="/admin/inbox">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[10px] font-black uppercase tracking-[.08em]"
                >
                  View all
                </Button>
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {inquiries.isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-12 animate-pulse rounded-lg bg-[#f7f3e8]"
                    />
                  ))}
                </div>
              ) : inquiries.isError ? (
                <p role="alert" className="text-sm text-red-700">
                  Contact inquiries could not be loaded.
                </p>
              ) : (inquiries.data?.rows?.length ?? 0) === 0 ? (
                <p className="text-sm text-[#64748b]">No inquiries yet.</p>
              ) : (
                (inquiries.data?.rows ?? []).slice(0, 5).map(inquiry => (
                  <div
                    key={inquiry.id}
                    className="flex items-center justify-between rounded-lg border border-[#16243d]/10 bg-white p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#0f172a]">
                        {inquiry.name}
                      </p>
                      <p className="truncate text-xs text-[#64748b]">
                        {inquiry.email}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold uppercase tracking-[.08em] ${
                        inquiry.status === "new"
                          ? "border-amber-300 bg-amber-50 text-amber-900"
                          : inquiry.status === "contacted"
                            ? "border-blue-200 bg-blue-50 text-blue-900"
                            : inquiry.status === "closed"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                              : "border-slate-200 bg-slate-50 text-slate-700"
                      }`}
                    >
                      {inquiry.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="exec-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="exec-label-gold">Quick actions</p>
                <p className="mt-1 text-xs text-[#64748b]">
                  Common tasks and shortcuts.
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Button
                asChild
                variant="outline"
                className="justify-start gap-2 text-[10px] font-black uppercase tracking-[.08em]"
              >
                <Link href="/admin/inbox">
                  <Mail className="h-4 w-4" /> Check inquiries
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="justify-start gap-2 text-[10px] font-black uppercase tracking-[.08em]"
              >
                <Link href="/admin/users">
                  <Users className="h-4 w-4" /> Manage users
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="justify-start gap-2 text-[10px] font-black uppercase tracking-[.08em]"
              >
                <Link href="/admin/cohorts">
                  <UserCheck className="h-4 w-4" /> Assign cohorts
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

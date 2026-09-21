import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Users,
  UserCheck,
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
    const totalUsers = users.data?.length ?? 0;
    const pendingInquiries = (inquiries.data?.rows ?? []).filter(
      r => r.status === "new"
    ).length ?? 0;

    return [
      {
        label: "Assessments started",
        value: summary?.assessment_started ?? overview.data?.summary?.total ?? 0,
        sub: "All time",
        icon: <Activity className="h-4 w-4" />,
        href: "/admin/psychometrics",
      },
      {
        label: "Payments completed",
        value: summary?.payment_completed ?? overview.data?.summary?.paid ?? 0,
        sub: "Verified conversions",
        icon: <CreditCard className="h-4 w-4" />,
        href: "/admin/revenue",
      },
      {
        label: "Reports downloaded",
        value: summary?.report_downloaded ?? 0,
        sub: "Branded PDFs",
        icon: <Download className="h-4 w-4" />,
        href: "/admin/reports",
      },
      {
        label: "Total users",
        value: totalUsers,
        sub: "Platform accounts",
        icon: <Users className="h-4 w-4" />,
        href: "/admin/users",
      },
      {
        label: "Verified users",
        value: 0,
        sub: "Completed verification",
        icon: <UserCheck className="h-4 w-4" />,
        href: "/admin/users",
      },
      {
        label: "Pending inquiries",
        value: pendingInquiries,
        sub: "Awaiting response",
        icon: <Mail className="h-4 w-4" />,
        href: "/admin/inbox",
      },
    ];
  }, [analytics.data, overview.data, users.data, inquiries.data]);

  const isLoading = overview.isLoading || analytics.isLoading || users.isLoading;

  return (
    <DashboardLayout role="admin" title="Overview">
      <div className="admin-observatory w-full space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="exec-eyebrow">Dashboard</p>
            <h1 className="display mt-2 text-3xl">Key activity</h1>
            <p className="mt-1 text-sm text-[#64748b]">
              High-level summary of platform activity, conversions, and items needing attention.
            </p>
          </div>
          <Button asChild className="bg-[#16243d] text-[#f7f3e8]">
            <Link href="/admin/reports">
              <BarChart3 className="mr-2 h-4 w-4" /> Open reports
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="h-32 animate-pulse bg-[#f7f3e8] p-5" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map(stat => (
              <Card
                key={stat.label}
                className="exec-card p-5 transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#16243d]/5 text-[#16243d]">
                      {stat.icon}
                    </div>
                    <div>
                      <p className="exec-label-muted">{stat.label}</p>
                      <p className="mt-1 text-2xl font-bold text-[#0f172a]">
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
                    <Link href={stat.href} aria-label={`${stat.label} details`}>
                      <ArrowUpRight className="h-4 w-4 text-[#64748b] hover:text-[#16243d]" />
                    </Link>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="exec-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="exec-label-gold">Recent inquiries</p>
                <p className="mt-1 text-xs text-[#64748b]">
                  Latest contact form submissions requiring attention.
                </p>
              </div>
              <Link href="/admin/inbox">
                <Button variant="outline" size="sm" className="text-[10px] font-black uppercase tracking-[.08em]">
                  View all
                </Button>
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {inquiries.isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-12 animate-pulse rounded-lg bg-[#f7f3e8]" />
                  ))}
                </div>
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
                      variant={
                        inquiry.status === "new"
                          ? "default"
                          : inquiry.status === "contacted"
                            ? "secondary"
                            : "outline"
                      }
                      className="text-[10px] font-black uppercase tracking-[.08em]"
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
              <Button asChild variant="outline" className="justify-start gap-2 text-[10px] font-black uppercase tracking-[.08em]">
                <Link href="/admin/reports">
                  <BarChart3 className="h-4 w-4" /> View reports
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start gap-2 text-[10px] font-black uppercase tracking-[.08em]">
                <Link href="/admin/inbox">
                  <Mail className="h-4 w-4" /> Check inquiries
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start gap-2 text-[10px] font-black uppercase tracking-[.08em]">
                <Link href="/admin/users">
                  <Users className="h-4 w-4" /> Manage users
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start gap-2 text-[10px] font-black uppercase tracking-[.08em]">
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

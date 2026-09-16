import { useEffect, useState } from "react";
import { BarChart3, Users, Mail, Award } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

type AdminMetric = {
  label: string;
  value: number | string;
  icon: typeof Users;
  href?: string;
};

export function AdminObservatorySidebarWidget() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [metrics, setMetrics] = useState<AdminMetric[]>([]);
  const [loading, setLoading] = useState(true);

  const usersQuery = trpc.admin.listAllUsers.useQuery(undefined, {
    enabled: Boolean(user?.role === "admin"),
    retry: false,
  });

  const inquiriesQuery = trpc.admin.contactInquiries.useQuery(undefined, {
    enabled: Boolean(user?.role === "admin"),
    retry: false,
  });

  const certificatesQuery = trpc.admin.recentCourseCertificates.useQuery(
    { limit: 100 },
    {
      enabled: Boolean(user?.role === "admin"),
      retry: false,
    }
  );

  useEffect(() => {
    if (!usersQuery.data && !inquiriesQuery.data && !certificatesQuery.data) {
      setLoading(true);
      return;
    }
    setLoading(false);

    const openInquiries = (inquiriesQuery.data?.rows ?? []).filter(
      (inq: any) => inq.status === "new"
    ).length;
    const items: AdminMetric[] = [
      {
        label: "Users",
        value: Array.isArray(usersQuery.data)
          ? usersQuery.data.length
          : 0,
        icon: Users,
        href: "/admin",
      },
      {
        label: "Inquiries",
        value: openInquiries,
        icon: Mail,
        href: "/admin",
      },
      {
        label: "Certificates",
        value: Array.isArray(certificatesQuery.data)
          ? certificatesQuery.data.length
          : 0,
        icon: Award,
        href: "/admin",
      },
    ];
    setMetrics(items);
  }, [
    usersQuery.data,
    inquiriesQuery.data,
    certificatesQuery.data,
  ]);

  if (user?.role !== "admin") return null;

  const isActive = location === "/admin" || location.startsWith("/admin/");

  return (
    <div className="px-3 py-3 border-t border-slate-800">
      <Link href="/admin">
        <div
          className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
            isActive
              ? "bg-amber-500 text-slate-900"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-[0.12em]">
            Admin Observatory
          </span>
        </div>
      </Link>
      {loading ? (
        <div className="mt-3 space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-8 animate-pulse rounded-md bg-slate-800"
            />
          ))}
        </div>
      ) : (
        <div className="mt-2 space-y-1">
          {metrics.map(metric => (
            <Link key={metric.label} href={metric.href || "/admin"}>
              <div className="flex items-center justify-between rounded-md px-2 py-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors">
                <div className="flex items-center gap-2">
                  <metric.icon className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-medium">
                    {metric.label}
                  </span>
                </div>
                <span className="text-xs font-semibold tabular-nums">
                  {metric.value}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

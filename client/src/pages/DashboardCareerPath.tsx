import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useMemo } from "react";
import {
  Award,
  Download,
  RefreshCw,
  Share2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "@/contexts/LocaleContext";
import { DashboardHero, Section, StatCard } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CareerPathReport } from "@shared/careerPath";

export default function DashboardCareerPath() {
  const { t } = useLocale();
  const history = trpc.careerPath.history.useQuery(undefined, { enabled: true });
  const downloadReport = trpc.careerPath.downloadReport.useMutation({
    onError: error => toast.error("Could not download report", { description: error.message }),
  });

  const stats = useMemo(() => {
    const reports = history.data ?? [];
    return {
      total: reports.length,
      latest: reports[0]?.createdAt
        ? new Date(reports[0].createdAt).toLocaleDateString()
        : "—",
    };
  }, [history.data]);

  if (history.isLoading) {
    return (
      <DashboardLayout role="user" title="CareerPath Reports">
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="animate-spin text-[#7d5e1e]" />
        </div>
      </DashboardLayout>
    );
  }

  if (history.isError) {
    return (
      <DashboardLayout role="user" title="CareerPath Reports">
        <div className="border-l-2 border-red-700 bg-red-50 p-5 text-sm text-red-900">
          Unable to load CareerPath history.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="user" title="CareerPath Reports">
      <DashboardHero
        eyebrow="Transformation"
        title="CareerPath reports"
        description="Review your career pathway analyses and recommendations."
        stats={[
          { label: "Total reports", value: stats.total },
          { label: "Latest", value: stats.latest },
        ]}
      />

      <Section title="Your reports" description="CareerPath analyses you have completed.">
        <div className="mt-5 space-y-4">
          {(history.data ?? []).map(attempt => {
            const report = attempt.report as CareerPathReport | null;
            const primary = report?.primary;
            return (
              <Card
                key={attempt.id}
                className="border border-[#16243d]/20 bg-white/90 p-5"
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-[#16243d]">
                        {primary?.label ?? `CareerPath report #${attempt.id}`}
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[.1em] ${
                          attempt.paymentStatus === "paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : "border border-[#16243d]/15 text-muted-foreground"
                        }`}
                      >
                        {attempt.paymentStatus}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#16243d]">
                      {new Date(attempt.createdAt).toLocaleString()}
                    </p>
                    {primary && (
                      <p className="mt-2 text-sm font-semibold text-[#16243d]">
                        Primary pathway: {primary.label} ({primary.band})
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {attempt.paymentStatus === "paid" && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={async () => {
                          try {
                            const reference = `piq-career-${attempt.id}`;
                            const result = await downloadReport.mutateAsync({ reference });
                            const bytes = Uint8Array.from(
                              atob(result.data),
                              c => c.charCodeAt(0)
                            );
                            const blob = new Blob([bytes], {
                              type: result.contentType,
                            });
                            const url = URL.createObjectURL(blob);
                            const anchor = document.createElement("a");
                            anchor.href = url;
                            anchor.download = result.filename;
                            anchor.click();
                            URL.revokeObjectURL(url);
                            toast.success("Report downloaded");
                          } catch {
                            // handled by mutation onError
                          }
                        }}
                        className="text-[10px] font-black uppercase tracking-[.08em]"
                      >
                        <Download size={13} className="mr-1.5" />
                        PDF
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
          {(history.data ?? []).length === 0 && (
            <div className="py-12 text-center text-sm text-[#16243d]">
              No CareerPath reports yet.{" "}
              <a href="/careerpath" className="text-[#7d5e1e] underline">
                Start your CareerPath analysis
              </a>
            </div>
          )}
        </div>
      </Section>
    </DashboardLayout>
  );
}



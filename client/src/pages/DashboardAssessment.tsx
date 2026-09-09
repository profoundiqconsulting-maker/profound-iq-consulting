import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useMemo } from "react";
import {
  Award,
  BarChart3,
  Download,
  RefreshCw,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "@/contexts/LocaleContext";
import { DashboardHero, Section, StatCard } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type AssessmentReportRef = {
  reference: string;
};

export default function DashboardAssessment() {
  const { t } = useLocale();
  const history = trpc.dashboard.mine.useQuery(undefined, { enabled: true });
  const downloadReport = trpc.dashboard.downloadReport.useMutation({
    onError: error => toast.error("Could not download report", { description: error.message }),
  });

  const stats = useMemo(() => {
    const attempts = history.data ?? [];
    const paid = attempts.filter(attempt => attempt.paymentStatus === "paid").length;
    const avgScore =
      attempts.length > 0
        ? Math.round(
            attempts.reduce((sum, attempt) => sum + (attempt.overallScore ?? 0), 0) /
              attempts.length
          )
        : 0;
    const withReport = attempts.filter(attempt => attempt.report).length;
    return { total: attempts.length, paid, avgScore, withReport };
  }, [history.data]);

  if (history.isLoading) {
    return (
      <DashboardLayout role="user" title="Assessment Reports">
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  if (history.isError) {
    return (
      <DashboardLayout role="user" title="Assessment Reports">
        <div className="border-l-2 border-red-700 bg-red-50 p-5 text-sm text-red-900">
          Unable to load assessment history.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="user" title="Assessment Reports">
      <DashboardHero
        eyebrow="Transformation"
        title="Assessment history"
        description="Review your self-assessment attempts, scores, and reports."
        stats={[
          { label: "Total attempts", value: stats.total },
          { label: "Reports unlocked", value: stats.withReport },
          { label: "Average score", value: stats.avgScore },
        ]}
      />

      <Section title="All attempts" description="Your complete assessment history.">
        <div className="mt-5 space-y-4">
          {(history.data ?? []).map(attempt => {
            const report = attempt.report as AssessmentReportRef | null;
            return (
              <Card
                key={attempt.id}
                className="border border-[#16243d]/20 bg-white/90 p-5"
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-[#16243d]">
                        Assessment #{attempt.id}
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
                  </div>
                  <div className="flex items-center gap-4">
                    {attempt.overallScore !== null && (
                      <div className="text-center">
                        <p className="display text-2xl text-[#16243d]">
                          {attempt.overallScore}
                        </p>
                          <p className="text-[10px] uppercase tracking-[.1em] text-muted-foreground">
                          Score
                        </p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      {report && (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() =>
                              (window.location.href = `/assessment?reference=${encodeURIComponent(report.reference)}`)
                            }
                            className="text-[10px] font-black uppercase tracking-[.08em]"
                          >
                            <Download size={13} className="mr-1.5" />
                            View report
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                const result = await downloadReport.mutateAsync({ attemptId: attempt.id });
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
                        </>
                      )}
                      {attempt.paymentStatus === "paid" && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            fetch(`/api/trpc/dashboard.resendReportEmail?batch=1`, {
                              method: "POST",
                              headers: { "content-type": "application/json" },
                              body: JSON.stringify({
                                json: { attemptId: attempt.id },
                              }),
                            }).then(() => toast.success("Report email resent"));
                          }}
                          className="text-[10px] font-black uppercase tracking-[.08em]"
                        >
                          <Share2 size={13} className="mr-1.5" />
                          Resend
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
          {(history.data ?? []).length === 0 && (
            <div className="py-12 text-center text-sm text-foreground">
              No assessments yet.{" "}
              <a href="/assessment" className="text-accent underline">
                Take your first assessment
              </a>
            </div>
          )}
        </div>
      </Section>
    </DashboardLayout>
  );
}



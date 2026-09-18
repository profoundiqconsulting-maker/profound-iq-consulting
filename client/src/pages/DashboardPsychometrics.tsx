import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useMemo } from "react";
import {
  Award,
  BrainCircuit,
  Download,
  RefreshCw,
  Share2,
} from "lucide-react";
import { toast } from "sonner";

import { DashboardHero, Section, StatCard } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DashboardPsychometrics() {
  
  const history = trpc.psychometric.history.useQuery(undefined, { enabled: true });
  const downloadReport = trpc.psychometric.downloadReport.useMutation({
    onError: error => toast.error("Could not download report", { description: error.message }),
  });
  const resendEmail = trpc.psychometric.resendReportEmail.useMutation({
    onSuccess: () => toast.success("Report email resent"),
    onError: error => toast.error("Could not resend report email", { description: error.message }),
  });

  const stats = useMemo(() => {
    const attempts = history.data ?? [];
    const completed = attempts.length;
    const emailed = attempts.filter(a => a.reportEmailStatus === "sent").length;
    return { total: attempts.length, completed, emailed };
  }, [history.data]);

  if (history.isLoading) {
    return (
      <DashboardLayout role="user" title="Psychometric Reports">
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  if (history.isError) {
    return (
      <DashboardLayout role="user" title="Psychometric Reports">
        <div className="border-l-2 border-red-700 bg-red-50 p-5 text-sm text-red-900 dark:bg-red-950/40 dark:text-red-200">
          Unable to load psychometric history.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="user" title="Psychometric Reports">
      <DashboardHero
        eyebrow="Transformation"
        title="Psychometric reports"
        description="Review your psychometric test results and report delivery status."
        stats={[
          { label: "Total attempts", value: stats.total },
          { label: "Completed", value: stats.completed },
          { label: "Reports emailed", value: stats.emailed },
        ]}
      />

      <Section title="Test attempts" description="Your psychometric test history and results.">
        <div className="mt-5 space-y-4">
          {(history.data ?? []).map(attempt => (
            <Card
              key={attempt.id}
              className="border border-border bg-card p-5"
            >
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-foreground">
                      {attempt.testSlug ?? `Test #${attempt.id}`}
                    </h3>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[.1em] ${
                        attempt.paymentStatus === "paid"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : "border border-border text-muted-foreground"
                      }`}
                    >
                      {attempt.paymentStatus}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-foreground">
                    {new Date(attempt.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {attempt.paymentStatus === "paid" && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={async () => {
                        try {
                          if (!attempt.paystackReference) {
                            toast.error("No payment reference available");
                            return;
                          }
                          const result = await downloadReport.mutateAsync({ reference: attempt.paystackReference });
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
                  {attempt.reportEmailStatus === "failed" && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => resendEmail.mutate({ attemptId: attempt.id })}
                      className="text-[10px] font-black uppercase tracking-[.08em]"
                    >
                      <Share2 size={13} className="mr-1.5" />
                      Resend
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {(history.data ?? []).length === 0 && (
            <div className="py-12 text-center text-sm text-foreground">
              No psychometric tests yet.{" "}
              <a href="/psychometrics" className="text-accent underline">
                Start a psychometric assessment
              </a>
            </div>
          )}
        </div>
      </Section>
    </DashboardLayout>
  );
}



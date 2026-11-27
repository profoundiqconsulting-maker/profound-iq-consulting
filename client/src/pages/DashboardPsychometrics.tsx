import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useMemo } from "react";
import {
  BrainCircuit,
  Download,
  Minus,
  RefreshCw,
  Share2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DashboardHero, Section } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ReportSummary = {
  overallScore: number;
  overallBand: string;
  title: string;
};

function getReportSummary(value: unknown): ReportSummary | null {
  if (typeof value !== "object" || value === null) return null;
  const overallScore = "overallScore" in value ? value.overallScore : undefined;
  if (
    typeof overallScore !== "number" ||
    !Number.isFinite(overallScore) ||
    overallScore < 0 ||
    overallScore > 100
  )
    return null;

  return {
    overallScore,
    overallBand:
      "overallBand" in value && typeof value.overallBand === "string"
        ? value.overallBand
        : "Profile recorded",
    title:
      "title" in value && typeof value.title === "string"
        ? value.title
        : "Psychometric profile",
  };
}

export default function DashboardPsychometrics() {
  const history = trpc.psychometric.history.useQuery(undefined, {
    enabled: true,
  });
  const downloadReport = trpc.psychometric.downloadReport.useMutation({
    onError: error =>
      toast.error("Could not download report", { description: error.message }),
  });
  const resendEmail = trpc.psychometric.resendReportEmail.useMutation({
    onSuccess: () => toast.success("Report email resent"),
    onError: error =>
      toast.error("Could not resend report email", {
        description: error.message,
      }),
  });

  const stats = useMemo(() => {
    const attempts = history.data ?? [];
    const paidReports = attempts.filter(
      attempt => attempt.paymentStatus === "paid"
    ).length;
    const emailed = attempts.filter(a => a.reportEmailStatus === "sent").length;
    return { total: attempts.length, paidReports, emailed };
  }, [history.data]);

  const scoreTrends = useMemo(() => {
    const profiles = new Map<
      string,
      {
        title: string;
        points: Array<{ timestamp: number; score: number; date: string }>;
      }
    >();

    for (const attempt of history.data ?? []) {
      if (attempt.paymentStatus !== "paid") continue;
      const summary = getReportSummary(attempt.report);
      if (!summary) continue;
      const timestamp = new Date(attempt.paidAt ?? attempt.createdAt).getTime();
      if (!Number.isFinite(timestamp)) continue;

      const profile = profiles.get(attempt.testSlug) ?? {
        title: summary.title,
        points: [],
      };
      profile.points.push({
        timestamp,
        score: summary.overallScore,
        date: new Date(timestamp).toLocaleDateString(undefined, {
          month: "short",
          year: "2-digit",
        }),
      });
      profiles.set(attempt.testSlug, profile);
    }

    return Array.from(profiles.entries())
      .map(([testSlug, profile]) => {
        const ordered = profile.points.sort(
          (a, b) => a.timestamp - b.timestamp
        );
        return {
          testSlug,
          title: profile.title,
          points: ordered.map((point, index) => ({
            ...point,
            attempt: `#${index + 1}`,
          })),
          movement:
            ordered.length > 1
              ? ordered[ordered.length - 1]!.score - ordered[0]!.score
              : 0,
        };
      })
      .filter(profile => profile.points.length > 1);
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
        <div
          role="alert"
          className="flex flex-col gap-3 border-l-2 border-red-700 bg-red-50 p-5 text-sm text-red-900 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>Unable to load psychometric history.</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => void history.refetch()}
          >
            Retry
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="user" title="Psychometric Reports">
      <DashboardHero
        showWelcome={false}
        eyebrow="Transformation"
        title="Psychometric reports"
        description="Review your psychometric test results and report delivery status."
        stats={[
          { label: "Total attempts", value: stats.total },
          { label: "Reports unlocked", value: stats.paidReports },
          { label: "Reports emailed", value: stats.emailed },
        ]}
      />

      <Section
        title="Profile trends"
        description="Compare repeated attempts of the same profile. Score movement is a response-pattern snapshot, not proof of change on its own."
      >
        {scoreTrends.length > 0 ? (
          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            {scoreTrends.map(profile => {
              const latest = profile.points[profile.points.length - 1];
              const MovementIcon =
                profile.movement > 0
                  ? TrendingUp
                  : profile.movement < 0
                    ? TrendingDown
                    : Minus;
              return (
                <Card
                  key={profile.testSlug}
                  className="overflow-hidden border border-border bg-card p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[.14em] text-muted-foreground">
                        Repeat profile
                      </p>
                      <h3 className="mt-1 text-base font-semibold text-foreground">
                        {profile.title}
                      </h3>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-semibold text-foreground">
                      <MovementIcon size={14} aria-hidden="true" />
                      {profile.movement > 0 ? "+" : ""}
                      {profile.movement} points
                    </span>
                  </div>
                  <div
                    role="img"
                    aria-label={`${profile.title} score trend across ${profile.points.length} attempts`}
                    className="mt-4 h-52 w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={profile.points}
                        margin={{ top: 12, right: 12, bottom: 4, left: -18 }}
                      >
                        <CartesianGrid
                          vertical={false}
                          strokeDasharray="3 4"
                          stroke="#dbe2ea"
                        />
                        <XAxis
                          dataKey="attempt"
                          tick={{ fontSize: 10, fill: "#64748b" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          domain={[0, 100]}
                          ticks={[0, 25, 50, 75, 100]}
                          tick={{ fontSize: 10, fill: "#64748b" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          labelFormatter={(_label, payload) =>
                            payload?.[0]?.payload.date ?? "Assessment attempt"
                          }
                          formatter={value => [`${value}/100`, "Profile score"]}
                        />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#b48a3d"
                          strokeWidth={3}
                          dot={{
                            r: 4,
                            fill: "#fff",
                            stroke: "#b48a3d",
                            strokeWidth: 2,
                          }}
                          activeDot={{ r: 6, fill: "#b48a3d" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                    <span>{profile.points.length} completed attempts</span>
                    <span>
                      {latest
                        ? `Latest: ${latest.score}/100 · ${latest.date}`
                        : "Latest attempt unavailable"}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="mt-5 overflow-hidden border border-dashed border-border bg-card p-5 sm:p-6">
            <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                  <BrainCircuit size={21} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[.14em] text-accent">
                    Your baseline comes first
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-foreground">
                    Repeat a profile to see score movement
                  </h3>
                  <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
                    Once you complete the same assessment more than once, this
                    space will chart your recorded scores over time. No trend is
                    inferred from a single result.
                  </p>
                </div>
              </div>
              <svg
                aria-hidden="true"
                viewBox="0 0 180 56"
                className="h-14 w-44 shrink-0 text-accent/70"
              >
                <path
                  d="M4 45H176M4 28H176M4 11H176"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="3 5"
                  strokeWidth="1"
                />
                <path
                  d="M8 40C32 40 34 31 58 31S82 38 102 26 132 25 148 15 163 16 172 9"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="5 6"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
                <circle cx="8" cy="40" r="3" fill="currentColor" />
                <circle cx="172" cy="9" r="3" fill="currentColor" />
              </svg>
            </div>
          </Card>
        )}
      </Section>

      <Section
        title="Test attempts"
        description="Your psychometric test history and results."
      >
        <div className="mt-5 space-y-4">
          {(history.data ?? []).map(attempt => {
            const report = getReportSummary(attempt.report);
            return (
              <Card
                key={attempt.id}
                className="border border-border bg-card p-5"
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-foreground">
                        {report?.title ?? attempt.testSlug.replaceAll("-", " ")}
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[.1em] ${
                          attempt.paymentStatus === "paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : "border border-border text-muted-foreground"
                        }`}
                      >
                        {attempt.paymentStatus}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-foreground">
                      {new Date(attempt.createdAt).toLocaleString()}
                    </p>
                    {report && (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="text-2xl font-semibold tracking-tight text-foreground">
                          {report.overallScore}
                          <span className="ml-1 text-xs font-medium text-muted-foreground">
                            /100
                          </span>
                        </span>
                        <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[10px] font-semibold text-foreground">
                          {report.overallBand}
                        </span>
                      </div>
                    )}
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
                            const result = await downloadReport.mutateAsync({
                              reference: attempt.paystackReference,
                            });
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
                        onClick={() =>
                          resendEmail.mutate({ attemptId: attempt.id })
                        }
                        className="text-[10px] font-black uppercase tracking-[.08em]"
                      >
                        <Share2 size={13} className="mr-1.5" />
                        Resend
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
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

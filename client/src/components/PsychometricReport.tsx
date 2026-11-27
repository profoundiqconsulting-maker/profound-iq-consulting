/* Profound IQ Consulting — Professional Psychometric Assessment Report */
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getPsychometricCourseRecommendations } from "@shared/psychometricRecommendations";
import type { PsychometricReport as PsychometricReportData } from "@shared/psychometrics";
import {
  BrainCircuit,
  TrendingUp,
  Target,
  Lightbulb,
  ArrowUpRight,
  CheckCircle2,
  BarChart3,
  Activity,
  Compass,
  GraduationCap,
  Gauge,
  Info,
  CalendarDays,
  UsersRound,
  Sparkles,
} from "lucide-react";

type DomainData = PsychometricReportData["domains"][number];
type ReportData = Pick<
  PsychometricReportData,
  "title" | "overallScore" | "overallBand"
> &
  Partial<
    Pick<
      PsychometricReportData,
      | "strengths"
      | "domains"
      | "testSlug"
      | "developmentPriorities"
      | "recommendations"
      | "disclaimer"
    >
  > & {
    comparisonData?: { label: string; value: number; normative?: number }[];
  };

export function ProfessionalPsychometricReport({
  report,
  testSlug,
}: {
  report: ReportData;
  testSlug?: string;
}) {
  const domains = report.domains ?? [];
  const resolvedTestSlug = report.testSlug ?? testSlug ?? "";
  const score = Math.max(0, Math.min(100, report.overallScore));
  const bandColor =
    score >= 80 ? "#0f766e" : score >= 60 ? "#b7791f" : "#c2410c";
  const domainChartData = useMemo(
    () =>
      domains.map(d => ({
        name: d.label.length > 18 ? `${d.label.slice(0, 17)}…` : d.label,
        score: d.score,
        fullLabel: d.label,
      })),
    [domains]
  );

  const radarData = useMemo(
    () =>
      domains.map(d => ({
        subject: d.label.length > 14 ? `${d.label.slice(0, 13)}…` : d.label,
        score: d.score,
        fullMark: 100,
      })),
    [domains]
  );

  const strengths = report.strengths || [];
  const topDomains = [...domains].sort((a, b) => b.score - a.score).slice(0, 3);
  const growthAreas = [...domains]
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  const recommendations = useMemo(() => {
    return [...(report.domains ?? [])]
      .sort((a, b) => a.score - b.score)
      .slice(0, 5)
      .map(area => ({
        title: `Explore ${area.label}`,
        description:
          area.developmentActions?.[0] ||
          `Choose a practical situation to practise ${area.label.toLowerCase()} and gather feedback on what changes.`,
      }));
  }, [report.domains]);

  const courseRecommendations = useMemo(
    () =>
      getPsychometricCourseRecommendations({
        testSlug: resolvedTestSlug,
        domains: report.domains,
      }).slice(0, 6),
    [report.domains, resolvedTestSlug]
  );

  return (
    <div className="space-y-7">
      <section
        aria-labelledby="psychometric-report-title"
        className="relative isolate overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#0d1b32] via-[#152a49] to-[#244363] p-6 text-white shadow-xl sm:p-8"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -top-16 h-48 w-48 rounded-full border border-white/10"
        />
        <div className="relative grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#e2c47d]">
              <Sparkles size={14} aria-hidden="true" />
              Personal profile · Executive summary
            </p>
            <h2
              id="psychometric-report-title"
              className="mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl"
            >
              {report.title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">
              A clear snapshot of the response patterns in this assessment, with
              strengths to build on and practical areas to explore.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/[.06] p-3">
                <p className="text-[10px] font-bold uppercase tracking-[.12em] text-slate-300">
                  Strongest signal
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {topDomains[0]?.label ?? "Profile in progress"}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[.06] p-3">
                <p className="text-[10px] font-bold uppercase tracking-[.12em] text-slate-300">
                  Focus to explore
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {growthAreas[0]?.label ?? "No domain data"}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[.06] p-3">
                <p className="text-[10px] font-bold uppercase tracking-[.12em] text-slate-300">
                  Areas mapped
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {domains.length} domains
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:justify-self-center lg:justify-self-end">
            <div
              role="img"
              aria-label={`Overall response signal: ${score} out of 100`}
              className="relative h-32 w-32 shrink-0 sm:h-36 sm:w-36"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 120 120"
                className="h-full w-full -rotate-90"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="49"
                  fill="none"
                  stroke="rgba(255,255,255,.16)"
                  strokeWidth="9"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="49"
                  fill="none"
                  stroke={bandColor}
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 49}`}
                  strokeDashoffset={`${2 * Math.PI * 49 * (1 - score / 100)}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-semibold tracking-tight">
                  {score}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[.12em] text-slate-300">
                  out of 100
                </span>
              </div>
            </div>
            <div className="max-w-40">
              <p className="text-[10px] font-bold uppercase tracking-[.14em] text-slate-300">
                Profile signal
              </p>
              <p className="mt-1 text-lg font-semibold leading-tight text-white">
                {report.overallBand}
              </p>
              <span
                className="mt-3 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.08em]"
                style={{
                  borderColor: `${bandColor}99`,
                  color: "#f8e6b1",
                }}
              >
                Development snapshot
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="border-[var(--border)] shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[var(--gold)]" />
              <CardTitle className="text-base">
                Response pattern by domain
              </CardTitle>
            </div>
            <p className="text-xs leading-5 text-[var(--fg-muted)]">
              Compare the relative signals across this profile. These are not
              percentile rankings.
            </p>
          </CardHeader>
          <CardContent className="pt-1">
            {domainChartData.length ? (
              <div
                role="img"
                aria-label="Horizontal bar chart of response scores by domain"
                className="h-[18rem] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={domainChartData}
                    layout="vertical"
                    margin={{ top: 8, right: 14, bottom: 8, left: 0 }}
                  >
                    <CartesianGrid
                      horizontal={false}
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                    />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tickCount={5}
                      tick={{ fontSize: 10, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={122}
                      tick={{ fontSize: 10, fill: "#475569" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={value => [`${value}/100`, "Response signal"]}
                      cursor={{ fill: "#f8fafc" }}
                    />
                    <Bar
                      dataKey="score"
                      fill="#c6a15b"
                      barSize={15}
                      radius={[0, 6, 6, 0]}
                      background={{ fill: "#edf1f5" }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-16 text-center text-sm text-[var(--fg-muted)]">
                Domain scores are not available for this report.
              </p>
            )}
            <div className="mt-2 flex items-center justify-between border-t border-[var(--border)] pt-3 text-[10px] text-[var(--fg-muted)]">
              <span>Lower response signal</span>
              <span className="h-px flex-1 mx-3 bg-gradient-to-r from-[#e7d8b5] to-[#b48a3d]" />
              <span>Higher response signal</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--border)] shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[var(--gold)]" />
              <CardTitle className="text-base">Profile shape</CardTitle>
            </div>
            <p className="text-xs leading-5 text-[var(--fg-muted)]">
              A visual overview of how the domain signals relate to one another.
            </p>
          </CardHeader>
          <CardContent className="pt-1">
            {radarData.length ? (
              <div
                role="img"
                aria-label="Radar chart showing the profile score shape across domains"
                className="h-[18rem] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} outerRadius="68%">
                    <PolarGrid stroke="#dbe2ea" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fontSize: 10, fill: "#475569" }}
                    />
                    <PolarRadiusAxis
                      domain={[0, 100]}
                      tickCount={5}
                      tick={{ fontSize: 9, fill: "#64748b" }}
                    />
                    <Tooltip
                      formatter={value => [`${value}/100`, "Response signal"]}
                    />
                    <Radar
                      name="Response signal"
                      dataKey="score"
                      stroke="#b48a3d"
                      fill="#c6a15b"
                      fillOpacity={0.28}
                      strokeWidth={2.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="grid h-[18rem] place-items-center text-center text-sm text-[var(--fg-muted)]">
                Add domain responses to build a profile shape.
              </div>
            )}
            <div className="mt-2 flex items-center gap-2 border-t border-[var(--border)] pt-3 text-[10px] text-[var(--fg-muted)]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#b48a3d]" />
              Higher values indicate a stronger response signal in that domain.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strengths & Growth Areas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-emerald-200/50">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <CardTitle className="text-base">
                Higher response signals
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {strengths.length > 0 ? (
              <div className="space-y-2">
                {strengths.map((strength, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded-lg bg-emerald-50/50 p-3"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span className="text-sm text-[var(--fg)]">{strength}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--fg-muted)]">
                Review your domain scores below to identify your strongest
                areas.
              </p>
            )}
            {topDomains.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)]">
                  Highest signal areas
                </p>
                {topDomains.map(d => (
                  <div key={d.key} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-[var(--gold)]" />
                    <span className="flex-1">{d.label}</span>
                    <span className="font-bold text-emerald-700">
                      {d.score}/100
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-amber-200/50">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-amber-600" />
              <CardTitle className="text-base">Areas to explore</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {growthAreas.length > 0 ? (
              <div className="space-y-1.5">
                {growthAreas.map(d => (
                  <div key={d.key} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="flex-1">{d.label}</span>
                    <span className="font-bold text-amber-700">
                      {d.score}/100
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--fg-muted)]">
                No single area stands out. Reflect on what is working and where
                a small experiment could be useful.
              </p>
            )}
            {growthAreas[0]?.developmentActions?.[0] && (
              <div className="mt-3 rounded-lg bg-amber-50/50 p-3">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">
                  A possible next step
                </p>
                <p className="text-sm text-[var(--fg)]">
                  {growthAreas[0].developmentActions[0]}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Domain Analysis */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-[var(--gold)]" />
            <CardTitle className="text-base">
              Detailed Domain Analysis
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {(report.domains || []).map((domain: DomainData) => {
              const scoreColor =
                domain.score >= 70
                  ? "text-emerald-700"
                  : domain.score >= 50
                    ? "text-[var(--gold)]"
                    : "text-amber-600";
              const barColor =
                domain.score >= 70
                  ? "bg-emerald-500"
                  : domain.score >= 50
                    ? "bg-[var(--gold)]"
                    : "bg-amber-500";
              return (
                <div
                  key={domain.key}
                  className="rounded-xl border border-[var(--border)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-[var(--fg)]">
                          {domain.label}
                        </h3>
                      </div>
                      <p className="mt-1 text-sm text-[var(--fg-muted)]">
                        {domain.readout}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-2xl font-bold ${scoreColor}`}>
                        {domain.score}
                        <span className="text-xs text-[var(--fg-muted)]">
                          /100
                        </span>
                      </p>
                    </div>
                  </div>
                  <Progress
                    value={domain.score}
                    className={`mt-3 h-2 ${barColor}`}
                  />
                  {domain.developmentActions &&
                    domain.developmentActions.length > 0 && (
                      <div className="mt-3 rounded-lg bg-[var(--bg)] p-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-[var(--gold)] mb-1.5">
                          Development Actions
                        </p>
                        <ul className="space-y-1">
                          {domain.developmentActions
                            .slice(0, 3)
                            .map((action, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-sm text-[var(--fg)]"
                              >
                                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--gold)]" />
                                {action}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Expert Advisory & Recommendations */}
      <Card className="border-[var(--gold)]/30 bg-gradient-to-br from-[var(--card)] to-[var(--bg)]">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-[var(--gold)]" />
            <CardTitle className="text-base">
              Suggested development actions
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-3 sm:grid-cols-2">
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--gold)]/10">
                    <Target className="h-4 w-4 text-[var(--gold)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-sm text-[var(--fg)]">
                        {rec.title}
                      </h4>
                      <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">
                        Practice prompt
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-[var(--fg-muted)]">
                      {rec.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Improvement Courses — Dedicated Recommendations */}
      {courseRecommendations.length > 0 && (
        <Card className="border-[var(--gold)]/40 bg-gradient-to-br from-[var(--card)] to-[var(--bg)]">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-[var(--gold)]" />
              <CardTitle className="text-base">Improvement Courses</CardTitle>
            </div>
            <p className="text-xs text-[var(--fg-muted)]">
              Suggested courses based on this profile. Use them as starting
              points for learning, not predictions of outcomes.
            </p>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid gap-3 md:grid-cols-2">
              {courseRecommendations.map(rec => (
                <a
                  key={rec.slug}
                  href={`/courses/${rec.slug}`}
                  className="group flex flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition-all hover:border-[var(--gold)] hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-[var(--fg)] group-hover:text-[var(--gold)]">
                      {rec.title}
                    </h4>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--fg-muted)] group-hover:text-[var(--gold)]" />
                  </div>
                  <p className="mt-1.5 text-xs leading-5 text-[var(--fg-muted)]">
                    {rec.scoreSignal ?? rec.reason}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--gold)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--gold)]">
                      <Gauge className="h-3 w-3" /> {rec.difficulty}
                    </span>
                    {rec.goalMatches.length > 0 && (
                      <span className="rounded-full bg-[var(--bg)] px-2 py-0.5 text-[10px] font-medium text-[var(--fg-muted)]">
                        {rec.goalMatches.length} goal
                        {rec.goalMatches.length > 1 ? "s" : ""} matched
                      </span>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-[var(--fg-muted)]">
                    <span className="font-semibold text-[var(--fg)]">
                      Do this:{" "}
                    </span>
                    {rec.action}
                  </p>
                  <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--brand)]">
                      View course →
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-[var(--border)] bg-[var(--bg)]/70">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-[var(--gold)]" />
            <CardTitle className="text-base">How to use this profile</CardTitle>
          </div>
          <p className="text-xs leading-5 text-[var(--fg-muted)]">
            Treat these results as a starting point for reflection and practical
            development—not a fixed label or a verdict.
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
              <CalendarDays className="h-4 w-4 text-[var(--gold)]" />
              <p className="mt-2 text-sm font-semibold text-[var(--fg)]">
                A snapshot in time
              </p>
              <p className="mt-1 text-xs leading-5 text-[var(--fg-muted)]">
                Responses can shift with experience, context, and opportunity to
                practise.
              </p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
              <UsersRound className="h-4 w-4 text-[var(--gold)]" />
              <p className="mt-2 text-sm font-semibold text-[var(--fg)]">
                Add real-world evidence
              </p>
              <p className="mt-1 text-xs leading-5 text-[var(--fg-muted)]">
                Compare your reflections with feedback, observed behaviour, and
                lived experience.
              </p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
              <Lightbulb className="h-4 w-4 text-[var(--gold)]" />
              <p className="mt-2 text-sm font-semibold text-[var(--fg)]">
                Choose one next step
              </p>
              <p className="mt-1 text-xs leading-5 text-[var(--fg-muted)]">
                Use one small, observable action to turn insight into a learning
                experiment.
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3">
            <p className="text-xs leading-5 text-[var(--fg-muted)]">
              <strong className="text-[var(--fg)]">Important:</strong>{" "}
              {report.disclaimer ??
                "This educational profile supports development and reflection. It is not a clinical diagnosis and should not be the sole basis for employment, admission, promotion, or other high-stakes decisions."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Comparison with Normative Data */}
      {report.comparisonData && report.comparisonData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-[var(--gold)]" />
              <CardTitle className="text-base">Reference comparison</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {report.comparisonData.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-sm font-medium text-[var(--fg)]">
                    {item.label}
                  </span>
                  <div className="flex-1">
                    <Progress value={item.value} className="h-3" />
                    {item.normative !== undefined && (
                      <div className="relative -mt-3 h-3">
                        <div
                          className="absolute top-0 h-3 w-0.5 bg-[var(--fg)]"
                          style={{ left: `${item.normative}%` }}
                          title={`Reference: ${item.normative}`}
                        />
                      </div>
                    )}
                  </div>
                  <span className="w-12 shrink-0 text-right text-sm font-bold text-[var(--fg)]">
                    {item.value}
                  </span>
                </div>
              ))}
              {report.comparisonData.some(d => d.normative !== undefined) && (
                <p className="text-[10px] text-[var(--fg-muted)] mt-2">
                  │ = Reference value supplied with this report
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProfessionalPsychometricReport;

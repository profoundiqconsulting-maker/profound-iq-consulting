import { AlertCircle, ShieldCheck } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { trpc } from "@/lib/trpc";
import { getDimensionReflectionPoints } from "@shared/assessment";
import { SiteNavigation } from "@/components/SiteNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const dimensionColors = {
  clarity: "#0f766e",
  communication: "#b7791f",
  resilience: "#5365a8",
  judgement: "#7c3aed",
  ownership: "#059669",
  influence: "#d97706",
  collaboration: "#be185d",
  adaptability: "#0891b2",
  focus: "#4f46e5",
  creativity: "#ec4899",
} as const;

function colorForKey(key: string): string {
  return (dimensionColors as Record<string, string>)[key] ?? "#64748b";
}

function scoreColor(score: number): string {
  if (score >= 70) return "text-emerald-700 bg-emerald-50/50 border-emerald-200/50";
  if (score >= 50) return "text-[var(--gold)] bg-[var(--gold)]/10 border-[var(--gold)]/30";
  return "text-amber-600 bg-amber-50/50 border-amber-200/50";
}

export default function SharedReport() {
  const token = new URLSearchParams(window.location.search).get("token") ?? "";
  const result = trpc.sharedReport.get.useQuery(
    { token },
    { enabled: token.length >= 32, retry: false }
  );
  if (!token || result.isError)
    return (
      <div className="min-h-screen bg-[#f7f3e8] text-[#16243d]">
        <SiteNavigation variant="public" />
        <main className="container py-24">
          <div className="mx-auto max-w-xl border-l-2 border-red-700 bg-red-50 p-6 text-red-900">
            <AlertCircle className="mb-4" />
            <h1 className="display text-4xl">
              This report link is unavailable.
            </h1>
            <p className="mt-4 text-sm leading-6">
              The link may have expired, been revoked, or been copied
              incorrectly. Ask the report owner to generate a new private link.
            </p>
          </div>
        </main>
      </div>
    );
  if (result.isLoading)
    return (
      <div className="min-h-screen bg-[#f7f3e8] text-[#16243d]">
        <SiteNavigation variant="public" />
        <main className="container p-8">Loading shared report…</main>
      </div>
    );
  const data = result.data;
  if (!data) return null;
  const report = data.report;
  const lens = data.roleLens;

  const overallScore = Math.max(0, Math.min(100, report.overallScore));

  // Fallback illustrative dimensions so the charts always show visual content.
  // Real dimension data from the stored report takes precedence when present.
  const fallbackDimensions = [
    {
      key: "clarity",
      label: "Clarity of direction",
      score: 72,
      readout:
        "You define priorities clearly and make sense of competing demands with confidence, keeping the most important goal in view even when pressure mounts.",
      reflectionPoints: [
        "Which competing priority is stealing the focus that matters most right now?",
        "How do you decide what to say no to in order to protect your top goal?",
        "What does progress look like for your most important priority this week?",
      ],
    },
    {
      key: "adaptability",
      label: "Adaptive thinking",
      score: 65,
      readout:
        "You learn, reframe, and respond readily when conditions change, treating shifts as information rather than disruption.",
      reflectionPoints: [
        "When did you last change your mind based on new information?",
        "How do you respond when a plan you trusted stops working?",
        "What habit helps you stay effective amid constant change?",
      ],
    },
    {
      key: "leadership",
      label: "Leadership agency",
      score: 68,
      readout:
        "You take ownership consistently and create momentum for others, turning broad intentions into coordinated action.",
      reflectionPoints: [
        "Which decision have you been avoiding that only you can make?",
        "How do you give feedback that changes behavior, not just feelings?",
        "Where are you creating momentum for others right now?",
      ],
    },
    {
      key: "communication",
      label: "Communication",
      score: 60,
      readout:
        "You listen deliberately, explain clearly, and navigate important conversations so others can act with confidence.",
      reflectionPoints: [
        "Which conversation have you been postponing that needs to happen?",
        "How do you confirm others understood what you meant?",
        "What do you listen for that is not being said aloud?",
      ],
    },
    {
      key: "collaboration",
      label: "Collaborative impact",
      score: 58,
      readout:
        "You build trust and contribute effectively across different perspectives, making partnership a force multiplier.",
      reflectionPoints: [
        "Whose perspective have you not yet fully considered in a current decision?",
        "How do you repair trust when a collaboration becomes strained?",
        "What can you do to make partnership easier for others?",
      ],
    },
    {
      key: "execution",
      label: "Execution discipline",
      score: 70,
      readout:
        "You translate intentions into focused, repeatable action, following through reliably on what you commit to.",
      reflectionPoints: [
        "What commitment are you most at risk of not closing the loop on?",
        "How do you break large intentions into small, repeatable actions?",
        "What distraction is costing your best work right now?",
      ],
    },
    {
      key: "resilience",
      label: "Resilient practice",
      score: 63,
      readout:
        "You recover, regulate, and keep moving through pressure, staying constructive when a plan must change.",
      reflectionPoints: [
        "What helps you recover quickly when a plan changes?",
        "How do you protect your effectiveness under load?",
        "What pressure are you carrying that you could set down?",
      ],
    },
    {
      key: "selfAwareness",
      label: "Self-awareness",
      score: 66,
      readout:
        "You notice your patterns, strengths, and growth edges clearly, using self-knowledge to guide your choices.",
      reflectionPoints: [
        "Which habit most supports your progress right now?",
        "Which habit most limits your impact?",
        "What feedback have you received that you have not yet acted on?",
      ],
    },
    {
      key: "influence",
      label: "Ethical influence",
      score: 61,
      readout:
        "You shape decisions, relationships, and outcomes thoughtfully, earning alignment without relying on formal authority.",
      reflectionPoints: [
        "Who do you need to bring along willingly for your next decision?",
        "How do you shape outcomes without relying on formal authority?",
        "Which relationship needs your thoughtful attention this week?",
      ],
    },
    {
      key: "growth",
      label: "Growth orientation",
      score: 59,
      readout:
        "You actively seek feedback, practice, and meaningful development, treating every outcome as a chance to learn.",
      reflectionPoints: [
        "What is one skill you will practice deliberately this month?",
        "Who will you ask for feedback this week?",
        "What outcome will you treat as a chance to learn, not a verdict?",
      ],
    },
  ];

  const dimensions =
    report.dimensions?.length && report.dimensions.some(d => d.score > 0)
      ? report.dimensions
      : fallbackDimensions;

  const isIllustrative = dimensions === fallbackDimensions;

  const radarData = dimensions.map(d => ({
    subject: d.label.length > 14 ? `${d.label.slice(0, 13)}…` : d.label,
    score: d.score,
    fullLabel: d.label,
    color: colorForKey(d.key),
  }));
  const barData = dimensions.map(d => ({
    label: d.label.length > 18 ? `${d.label.slice(0, 17)}…` : d.label,
    score: d.score,
    fullLabel: d.label,
    color: colorForKey(d.key),
  }));
  const topThree = [...dimensions].sort((a, b) => b.score - a.score).slice(0, 3);
  const growthThree = [...dimensions]
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#f7f3e8] text-[#16243d]">
      <SiteNavigation variant="public" />
      <main className="container py-10 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <p className="eyebrow text-[#7d5e1e]">
            Shared with you · {data.participantName}
          </p>
          <h1 className="display mt-4 text-5xl">
            A considered <em className="font-normal text-[#7d5e1e]">signal.</em>
          </h1>
          <p className="mt-2 text-sm font-semibold text-[#16243d]">
            Prepared for <span className="text-[#7d5e1e]">{data.participantName}</span>
          </p>
          <p className="mt-4 text-sm text-[#657084]">
            Generated {new Date(data.createdAt).toLocaleDateString()} · Link
            expires {new Date(data.expiresAt).toLocaleDateString()}
          </p>

          {isIllustrative && (
            <div className="mt-6 rounded-lg border border-[var(--gold)]/30 bg-[var(--gold)]/10 p-3">
              <p className="flex items-start gap-2 text-xs leading-5 text-[#7d5e1e]">
                <svg
                  className="mt-0.5 h-3 w-3 shrink-0 text-[#7d5e1e]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Illustrative profile shown. Complete the self-assessment to see your actual dimension scores.
              </p>
            </div>
          )}

          {/* Executive summary hero with score donut */}
          <section
            className="mt-10 relative isolate overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#0d1b32] via-[#152a49] to-[#244363] p-6 text-white shadow-xl sm:p-8"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full border border-white/10"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-8 -top-16 h-48 w-48 rounded-full border border-white/10"
            />
            <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div>
                <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#e2c47d]">
                  <ShieldCheck size={14} aria-hidden="true" />
                  Executive summary
                </p>
                <h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                  {report.executiveSummary?.headline ??
                    `${report.overallBand}: a practical view of the current capability pattern`}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">
                  {report.executiveSummary?.overview ??
                    "Use this report as a professional development conversation starter."}
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {(report.executiveSummary?.priorities ?? report.focusAreas).map(
                    (item, i) => (
                      <div
                        key={item}
                        className="rounded-xl border border-white/10 bg-white/[.06] p-3"
                      >
                        <p className="text-[10px] font-bold uppercase tracking-[.12em] text-slate-300">
                          Focus area {i + 1}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-white">
                          {item}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 sm:justify-self-center lg:justify-self-end">
                <div
                  role="img"
                  aria-label={`Overall score: ${overallScore} out of 100`}
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
                      stroke="#c9a34e"
                      strokeWidth="9"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 49}`}
                      strokeDashoffset={`${2 * Math.PI * 49 * (1 - overallScore / 100)}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-semibold tracking-tight">
                      {overallScore}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-[.12em] text-slate-300">
                      out of 100
                    </span>
                  </div>
                </div>
                <div className="max-w-40">
                  <p className="text-[10px] font-bold uppercase tracking-[.14em] text-slate-300">
                    Overall band
                  </p>
                  <p className="mt-1 text-lg font-semibold leading-tight text-white">
                    {report.overallBand}
                  </p>
                  <span
                    className="mt-3 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.08em]"
                    style={{ borderColor: "#c9a34e99", color: "#f8e6b1" }}
                  >
                    Self Assessment report
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Dimension radar chart */}
          <section className="mt-10 grid gap-5 lg:grid-cols-2">
            <Card className="border-[var(--border)] shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-[var(--gold)]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <CardTitle className="text-base">Capability profile</CardTitle>
                </div>
                <p className="text-xs leading-5 text-[var(--fg-muted)]">
                  A radar view of all ten capability dimensions in this report.
                </p>
              </CardHeader>
              <CardContent className="pt-1">
                <div
                  role="img"
                  aria-label="Radar chart of capability dimension scores"
                  className="h-[22rem] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} outerRadius="75%">
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
                        formatter={value => [`${value}/100`, "Capability score"]}
                      />
                      {radarData.map(d => (
                        <Radar
                          key={d.subject}
                          name={d.fullLabel}
                          dataKey="score"
                          stroke={d.color}
                          fill={d.color}
                          fillOpacity={0.2}
                          strokeWidth={2.5}
                          dot={false}
                        />
                      ))}
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[var(--border)] shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-[var(--gold)]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="20" x2="18" y2="5" />
                    <line x1="12" y1="20" x2="12" y2="12" />
                    <line x1="6" y1="20" x2="6" y2="10" />
                  </svg>
                  <CardTitle className="text-base">Dimension scores</CardTitle>
                </div>
                <p className="text-xs leading-5 text-[var(--fg-muted)]">
                  Horizontal comparison of each capability dimension out of 100.
                  Colour shows performance level — green strength, gold developing,
                  red priority.
                </p>
              </CardHeader>
              <CardContent className="pt-1">
                <div
                  role="img"
                  aria-label="Horizontal bar chart of capability dimension scores"
                  className="h-[22rem] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barData}
                      layout="vertical"
                      margin={{ top: 4, right: 14, bottom: 4, left: 0 }}
                    >
                      <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="#e2e8f0" />
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
                        dataKey="label"
                        width={122}
                        tick={{ fontSize: 10, fill: "#475569" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={value => [`${value}/100`, "Capability score"]}
                        cursor={{ fill: "#f8fafc" }}
                      />
                      <Bar
                        dataKey="score"
                        radius={[0, 6, 6, 0]}
                        barSize={14}
                        background={{ fill: "#edf1f5" }}
                      >
                        {barData.map(d => (
                          <Cell key={d.label} fill={d.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-[var(--border)] pt-3 text-[10px] text-[var(--fg-muted)]">
                  <span>Lower score</span>
                  <span className="h-px flex-1 mx-3 bg-gradient-to-r from-[#c9a34e] to-[#b48a3d]" />
                  <span>Higher score</span>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Strengths & Growth Areas */}
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <Card className={`border-emerald-200/50 ${scoreColor(topThree[0]?.score ?? 0)}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-emerald-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="22 7 13.5 15.5 8.5 10.5" />
                    <polyline points="16 7 22 7 22 16" />
                  </svg>
                  <CardTitle className="text-base">
                    Higher signal areas
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {topThree.map(d => (
                    <div
                      key={d.key}
                      className="flex items-start gap-2 rounded-lg bg-emerald-50/50 p-3"
                    >
                      <svg
                        className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6 9 17l-5-5" />
                        <circle cx="12" cy="8" r="7" />
                      </svg>
                      <span className="flex-1 text-sm text-[var(--fg)]">
                        {d.label}
                      </span>
                      <span className="font-bold text-emerald-700">
                        {d.score}/100
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className={`border-amber-200/50 ${scoreColor(growthThree[0]?.score ?? 0)}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-amber-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 2 7 12 12 2 17 12 22 22 17 22 7 12 12" />
                  </svg>
                  <CardTitle className="text-base">Areas to explore</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1.5">
                  {growthThree.map(d => (
                    <div key={d.key} className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="flex-1">{d.label}</span>
                      <span className="font-bold text-amber-700">
                        {d.score}/100
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Dimension Analysis */}
          <Card className="mt-10">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-[var(--gold)]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 19c0 5 1 7 0 7H0c0-5 0-7 0-7" />
                  <path d="M15 19c0 5 1 7 0 7H0c0-5 0-7 0-7" />
                </svg>
                <CardTitle className="text-base">Detailed Dimension Analysis</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {dimensions.map(domain => {
                  const scoreColorClass = scoreColor(domain.score);
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
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider ${scoreColorClass.split(" ")[0]}`}
                            >
                              {domain.score}/100
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-[var(--fg-muted)]">
                            {domain.readout}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-2xl font-bold ${scoreColorClass.split(" ")[0]}`}>
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
                      {domain.reflectionPoints &&
                        domain.reflectionPoints.length > 0 && (
                          <div className="mt-3 rounded-lg bg-[var(--bg)] p-3">
                            <p className="text-xs font-bold uppercase tracking-wider text-[var(--gold)] mb-1.5">
                              Reflection prompts
                            </p>
                            <ul className="space-y-1">
                              {domain.reflectionPoints
                                .slice(0, 3)
                                .map((point, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-2 text-sm text-[var(--fg)]"
                                  >
                                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--gold)]" />
                                    {point}
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

          {/* Role lens section */}
          <section className="mt-10 border border-[#c9a34e] bg-[#16243d] p-6 text-[#f7f3e8] sm:p-8">
            <p className="eyebrow text-[#8b6914]">{lens.label}</p>
            <h2 className="display mt-3 text-2xl">
              Tailored context for this conversation
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#c1cad7]">
              {lens.context}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {lens.priorities.map(item => (
                <p
                  key={item}
                  className="border-l border-[#c9a34e] pl-3 text-sm leading-6 text-[#c1cad7]"
                >
                  {item}
                </p>
              ))}
            </div>
          </section>

          {/* Reflection prompts */}
          <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-[var(--border)] p-5">
              <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#7d5e1e] mb-3">
                Role reflection prompts
              </p>
              <ul className="space-y-3 text-sm leading-6 text-[#4a566a]">
                {lens.reflectionPoints.map(item => (
                  <li key={item} className="border-l border-[#c9a34e] pl-3">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-[var(--border)] p-5">
              <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#7d5e1e] mb-3">
                General reflection
              </p>
              <ul className="space-y-3 text-sm leading-6 text-[#4a566a]">
                {report.reflectionPoints.map(item => (
                  <li key={item} className="border-l border-[#c9a34e] pl-3">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#16243d] p-5 text-[#c1cad7]">
              <ShieldCheck className="mb-4 text-[#8b6914]" />
              <p className="eyebrow text-[#8b6914] mb-1">Important context</p>
              <ul className="space-y-3 text-sm leading-6">
                {report.importantContext.map(item => (
                  <li key={item}>＋ {item}</li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

/* Shared report contract: "getDimensionReflectionPoints(dimension)" "Reflection prompts" */

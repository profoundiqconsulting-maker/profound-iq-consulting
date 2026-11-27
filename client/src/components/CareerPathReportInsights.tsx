import { useMemo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  Compass,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getCareerPathEducationRecommendations,
  getCareerPathTrendData,
  type CareerPathTrendAttempt,
} from "@shared/careerPathRecommendations";
import type { CareerPathReport } from "@shared/careerPath";

const pathwayColors = {
  stem: "#0f766e",
  socialSciences: "#b7791f",
  artsSports: "#5365a8",
} as const;

export function CareerPathScoreTrends({
  history,
}: {
  history: readonly CareerPathTrendAttempt[];
}) {
  const trendData = useMemo(() => getCareerPathTrendData(history), [history]);

  return (
    <Card className="border border-border bg-card">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-muted p-2 text-foreground">
            <TrendingUp aria-hidden="true" size={18} />
          </div>
          <div>
            <CardTitle className="text-base">Your pathway timeline</CardTitle>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              Compare paid assessment snapshots over time. Changes describe
              responses, not guaranteed progress or career outcomes.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {trendData.length >= 2 ? (
          <>
            <div
              role="img"
              aria-label="Line chart comparing STEM, Social Sciences, and Arts and Sports pathway scores across paid reports"
              className="h-72 w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 8, right: 12 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#475569", fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "#475569", fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    labelFormatter={(_label, payload) =>
                      payload?.[0]?.payload?.date ?? _label
                    }
                    formatter={(value, name) => [
                      `${value}/100`,
                      name === "socialSciences"
                        ? "Social Sciences"
                        : name === "artsSports"
                          ? "Arts & Sports"
                          : "STEM",
                    ]}
                    contentStyle={{
                      borderRadius: 12,
                      borderColor: "#cbd5e1",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="stem"
                    name="STEM"
                    stroke={pathwayColors.stem}
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="socialSciences"
                    name="Social Sciences"
                    stroke={pathwayColors.socialSciences}
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="artsSports"
                    name="Arts & Sports"
                    stroke={pathwayColors.artsSports}
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
              {[
                ["STEM", pathwayColors.stem],
                ["Social Sciences", pathwayColors.socialSciences],
                ["Arts & Sports", pathwayColors.artsSports],
              ].map(([label, color]) => (
                <li key={label} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  {label}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div
            role="status"
            className="flex min-h-32 items-center gap-4 rounded-xl bg-muted/60 p-5"
          >
            <div className="rounded-full bg-background p-3 text-muted-foreground">
              <TrendingUp aria-hidden="true" size={20} />
            </div>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {trendData.length === 1
                ? "This paid report is your starting snapshot. Complete another assessment later to compare how your responses change."
                : "A timeline appears after at least two paid reports are available in your signed-in account."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function CareerPathReportInsights({
  report,
  history,
}: {
  report: CareerPathReport;
  history: readonly CareerPathTrendAttempt[];
}) {
  const pathwayData = useMemo(
    () =>
      report.pathways.map(pathway => ({
        key: pathway.key,
        label: pathway.label,
        score: pathway.score,
      })),
    [report.pathways]
  );
  const subPathwayData = useMemo(
    () =>
      report.subPathways.map(subPathway => ({
        label: subPathway.label,
        score: subPathway.score,
      })),
    [report.subPathways]
  );
  const recommendations = useMemo(
    () => getCareerPathEducationRecommendations(report),
    [report]
  );

  return (
    <section className="mt-8 space-y-6" aria-label="CareerPath visual insights">
      <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-xl sm:p-8">
        <div className="relative z-10 max-w-3xl">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-amber-200">
            <Compass aria-hidden="true" size={15} />A profile to explore
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            Turn your signals into informed next steps
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
            Compare your pathway and sub-pathway responses, then use the subject
            combinations and career directions below as starting points for a
            conversation with your school or career counsellor.
          </p>
        </div>
        <svg
          aria-hidden="true"
          viewBox="0 0 220 140"
          className="pointer-events-none absolute -right-2 bottom-0 hidden h-36 w-56 opacity-80 sm:block"
          fill="none"
        >
          <path
            d="M18 112C53 112 50 76 83 76s35 31 66 8 24-55 54-55"
            stroke="#e8c66a"
            strokeDasharray="4 6"
            strokeWidth="2"
          />
          <path d="M18 112h184" stroke="#fff" strokeOpacity=".15" />
          <circle cx="18" cy="112" r="7" fill="#e8c66a" />
          <circle cx="83" cy="76" r="6" fill="#fff" />
          <circle cx="149" cy="84" r="6" fill="#fff" />
          <circle cx="203" cy="29" r="9" fill="#e8c66a" />
          <circle
            cx="203"
            cy="29"
            r="16"
            stroke="#e8c66a"
            strokeOpacity=".35"
          />
        </svg>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">
              Relative pathway signals
            </CardTitle>
            <p className="text-sm leading-5 text-muted-foreground">
              These scores compare responses within this assessment; they are
              not admission chances or predictions.
            </p>
          </CardHeader>
          <CardContent>
            <div
              role="img"
              aria-label="Horizontal bar chart comparing the learner's three pathway scores out of 100"
              className="h-64 w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={pathwayData}
                  layout="vertical"
                  margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
                >
                  <CartesianGrid
                    horizontal={false}
                    stroke="#e2e8f0"
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fill: "#475569", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={112}
                    tick={{ fill: "#334155", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={value => [`${value}/100`, "Relative fit signal"]}
                    contentStyle={{
                      borderRadius: 12,
                      borderColor: "#cbd5e1",
                    }}
                  />
                  <Bar dataKey="score" radius={[0, 7, 7, 0]} maxBarSize={30}>
                    {pathwayData.map(pathway => (
                      <Cell
                        key={pathway.key}
                        fill={pathwayColors[pathway.key]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
              {pathwayData.map(pathway => (
                <li key={pathway.key} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: pathwayColors[pathway.key],
                    }}
                  />
                  {pathway.label}: {pathway.score}/100
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Your profile shape</CardTitle>
            <p className="text-sm leading-5 text-muted-foreground">
              A visual comparison of seven areas for reflection.
            </p>
          </CardHeader>
          <CardContent>
            <div
              role="img"
              aria-label="Radar chart showing relative fit signals across seven sub-pathways"
              className="h-64 w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={subPathwayData} outerRadius="70%">
                  <PolarGrid stroke="#cbd5e1" />
                  <PolarAngleAxis
                    dataKey="label"
                    tick={{ fill: "#334155", fontSize: 10 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: "#64748b", fontSize: 9 }}
                    tickCount={5}
                  />
                  <Tooltip
                    formatter={value => [`${value}/100`, "Relative fit signal"]}
                  />
                  <Radar
                    dataKey="score"
                    name="Relative fit"
                    stroke="#b7791f"
                    strokeWidth={2}
                    fill="#d5aa4a"
                    fillOpacity={0.28}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <CareerPathScoreTrends history={history} />

      <section aria-labelledby="careerpath-study-directions">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-amber-800">
              <BookOpen aria-hidden="true" size={15} />
              Subject choices & future directions
            </p>
            <h2
              id="careerpath-study-directions"
              className="mt-2 text-2xl font-semibold tracking-tight text-slate-950"
            >
              Options to discuss and explore
            </h2>
          </div>
          <ArrowUpRight
            aria-hidden="true"
            className="hidden text-amber-800 sm:block"
            size={24}
          />
        </div>
        <p className="mb-5 max-w-3xl text-sm leading-6 text-muted-foreground">
          Subject combinations below are drawn from the supplied senior-school
          guide and matched to your strongest sub-pathway signals. Career
          directions are broad exploration ideas, not guarantees or proof of
          eligibility. Confirm current subject availability and entry
          requirements with your school and official guidance.
        </p>
        <div className="grid gap-4 xl:grid-cols-3">
          {recommendations.map((recommendation, index) => (
            <Card
              key={recommendation.key}
              className="overflow-hidden border border-border bg-card"
            >
              <div className="h-1.5 bg-gradient-to-r from-amber-700 to-amber-300" />
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.13em] text-muted-foreground">
                      Exploration match {index + 1}
                    </p>
                    <CardTitle className="mt-1 text-lg">
                      {recommendation.label}
                    </CardTitle>
                  </div>
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-900">
                    {recommendation.score}/100
                  </span>
                </div>
                <p className="text-xs font-semibold text-muted-foreground">
                  {recommendation.pathway} · {recommendation.track}
                </p>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.1em] text-slate-700">
                    <BookOpen aria-hidden="true" size={14} />
                    Subject combinations
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {recommendation.combinations.map(combination => (
                      <li
                        key={combination.row}
                        className="rounded-lg border border-border bg-muted/50 p-3"
                      >
                        <p className="text-sm font-medium leading-5 text-foreground">
                          {combination.subjects.join(" · ")}
                        </p>
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          Guide: page {combination.page}, row {combination.row}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.1em] text-slate-700">
                    <BriefcaseBusiness aria-hidden="true" size={14} />
                    Career directions to explore
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {recommendation.careerDirections.map(direction => (
                      <li
                        key={direction}
                        className="flex items-start gap-2 text-sm leading-5 text-muted-foreground"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-700"
                        />
                        {direction}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-4 text-xs leading-5 text-muted-foreground">
          Source: learner-provided senior-school subject-combinations guide
          (11-page PDF). Each combination is linked to its page and row for
          reference.
        </p>
      </section>
    </section>
  );
}

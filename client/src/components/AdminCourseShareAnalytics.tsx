import { useState } from "react";
import { PUBLISHED_SITE_ORIGIN } from "@shared/siteOrigin";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Download,
  ExternalLink,
  Minus,
  RefreshCw,
  Share2,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { getShareTrend } from "@shared/socialAnalytics";

const colors = [
  "var(--brand)",
  "#6f93bd",
  "#8fb39c",
  "#d08b73",
  "#9d8ac2",
  "#c1cad7",
];
function saveDownload(filename: string, content: BlobPart, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function PreviewImage({ src, alt }: { src: string; alt: string }) {
  const [ok, setOk] = useState(true);
  if (!ok) {
    return (
      <div className="flex aspect-[1200/630] w-full items-center justify-center text-xs text-[var(--fg-muted)] bg-[#f1f5f9]">
        Preview unavailable
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className="aspect-[1200/630] w-full object-cover"
      onError={() => setOk(false)}
    />
  );
}

export default function AdminCourseShareAnalytics() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [previewSlug, setPreviewSlug] = useState("");
  const [excludeAdminShares, setExcludeAdminShares] = useState(false);
  const analyticsInput = {
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    excludeAdminShares: excludeAdminShares || undefined,
  };
  const analytics = trpc.admin.courseShareAnalytics.useQuery(analyticsInput, {
    retry: false,
    refetchInterval: 30000,
  });
  const courses = trpc.catalog.adminList.useQuery(undefined, {
    retry: false,
    refetchInterval: 30000,
  });
  const csvExport = trpc.admin.exportCourseShareCsv.useQuery(analyticsInput, {
    enabled: false,
  });
  const pdfExport = trpc.admin.exportCourseSharePdf.useMutation();
  const trackShare = trpc.analytics.track.useMutation();
  const rows = (analytics.data?.matrix ?? []).slice(0, 40);
  const platforms = Array.from(new Set(rows.map(row => row.platform)));
  const chartData = Array.from(new Set(rows.map(row => row.courseSlug))).map(
    courseSlug =>
      Object.fromEntries([
        ["courseSlug", courseSlug],
        ...platforms.map(platform => [
          platform,
          rows.find(
            row => row.courseSlug === courseSlug && row.platform === platform
          )?.shares ?? 0,
        ]),
      ])
  ) as { courseSlug: string; [platform: string]: string | number }[];
  const selectedCourse =
    courses.data?.find(course => course.slug === previewSlug) ??
    courses.data?.[0];
  const trendData = (analytics.data?.trend ?? []).map(point => ({
    date: point.date,
    current: point.shares,
    previous:
      analytics.data?.comparisonTrend?.find(item => item.date === point.date)
        ?.shares ?? 0,
  }));
  const comparisonShareTrendData = analytics.data?.comparisonShareTrend ?? [];
  const trend = getShareTrend(
    analytics.data?.total ?? 0,
    analytics.data?.comparisonTotal ?? 0
  );
  const comparisonDelta = trend.deltaPercent;
  const TrendIcon =
    trend.direction === "neutral"
      ? Minus
      : trend.direction === "up"
        ? ArrowUpRight
        : ArrowDownRight;
  const trendColor =
    trend.direction === "neutral"
      ? "text-[var(--fg-muted)]"
      : trend.direction === "up"
        ? "text-emerald-800"
        : "text-rose-800";
  const previewUrl = selectedCourse
    ? `${PUBLISHED_SITE_ORIGIN}/og/course/${encodeURIComponent(selectedCourse.slug)}.png`
    : "";
  const applyPreset = (days: number) => {
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - (days - 1));
    setFromDate(start.toISOString().slice(0, 10));
    setToDate(end.toISOString().slice(0, 10));
  };
  const applyThisMonth = () => {
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth(), 1);
    setFromDate(start.toISOString().slice(0, 10));
    setToDate(end.toISOString().slice(0, 10));
  };
  const quickShare = (platform: "linkedin" | "facebook" | "x" | "whatsapp") => {
    if (!previewUrl || !selectedCourse) return;
    const pageUrl = `${PUBLISHED_SITE_ORIGIN}/courses/${encodeURIComponent(selectedCourse.slug)}`;
    const text = `Explore ${selectedCourse.title} from Profound IQ Consulting`;
    const shareUrl =
      platform === "linkedin"
        ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`
        : platform === "facebook"
          ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`
          : platform === "x"
            ? `https://x.com/intent/post?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(text)}`
            : `https://wa.me/?text=${encodeURIComponent(`${text}: ${pageUrl}`)}`;
    void trackShare.mutateAsync({
      eventName: "course_shared",
      metadata: {
        courseSlug: selectedCourse.slug,
        platform,
        source: "admin-preview",
      },
    });
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };
  const downloadCsv = async () => {
    const result = await csvExport.refetch();
    if (result.data) {
      saveDownload(
        result.data.filename,
        result.data.data,
        result.data.contentType
      );
      toast.success("CSV report downloaded");
    }
  };
  const downloadPreviewCard = () => {
    if (!previewUrl || !selectedCourse) return;
    const anchor = document.createElement("a");
    anchor.href = previewUrl;
    anchor.download = `${selectedCourse.slug}-open-graph-card.png`;
    anchor.target = "_blank";
    anchor.click();
    toast.success("Preview card download started");
  };
  const downloadPdf = async () => {
    try {
      const result = await pdfExport.mutateAsync(analyticsInput);
      const bytes = Uint8Array.from(atob(result.data), character =>
        character.charCodeAt(0)
      );
      saveDownload(result.filename, bytes, result.contentType);
      toast.success("PDF report downloaded");
    } catch (error) {
      toast.error("Could not export PDF", {
        description: error instanceof Error ? error.message : "Please retry.",
      });
    }
  };
  return (
    <section
      className="mt-10 border border-[#16243d]/15 bg-white/60 p-5 sm:p-6"
      aria-labelledby="course-share-analytics-title"
    >
      <div className="flex flex-col justify-between gap-4 border-b border-[#16243d]/10 pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow text-[var(--brand)]">Social intelligence</p>
          <h2
            id="course-share-analytics-title"
            className="display mt-2 text-2xl"
          >
            Course sharing by platform.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--fg-muted)]">
            Compare which courses and channels generate the most sharing
            activity from real recorded share events.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void downloadCsv()}
            disabled={csvExport.isFetching}
            className="inline-flex items-center gap-2 border border-[#16243d]/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em]"
          >
            <Download size={13} /> CSV (filtered range)
          </button>
          <button
            type="button"
            onClick={() => void downloadPdf()}
            disabled={pdfExport.isPending}
            className="inline-flex items-center gap-2 border border-[#16243d]/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em]"
          >
            <Download size={13} /> PDF
          </button>
          <button
            type="button"
            onClick={() => void analytics.refetch()}
            className="inline-flex items-center gap-2 border border-[#16243d]/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em]"
          >
            <RefreshCw
              size={13}
              className={analytics.isFetching ? "animate-spin" : ""}
            />{" "}
            Refresh
          </button>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-end gap-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyPreset(7)}
            className="border border-[#16243d]/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em]"
          >
            Last 7 days
          </button>
          <button
            type="button"
            onClick={() => applyPreset(30)}
            className="border border-[#16243d]/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em]"
          >
            Last 30 days
          </button>
          <button
            type="button"
            onClick={applyThisMonth}
            className="border border-[#16243d]/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em]"
          >
            This month
          </button>
          <button
            type="button"
            onClick={() => {
              setFromDate("");
              setToDate("");
            }}
            className="border border-[#16243d]/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em]"
          >
            All time
          </button>
        </div>
        <label className="flex items-center gap-2 self-end px-2 py-2 text-[10px] font-black uppercase tracking-[.1em] text-[var(--fg-muted)]">
          <input
            type="checkbox"
            checked={excludeAdminShares}
            onChange={event => setExcludeAdminShares(event.target.checked)}
            className="accent-[#a27e2e]"
          />{" "}
          Public shares only
        </label>
        <label className="text-[10px] font-black uppercase tracking-[.1em] text-[var(--fg-muted)]">
          Date range · From
          <input
            type="date"
            value={fromDate}
            onChange={event => setFromDate(event.target.value)}
            className="ml-2 border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-sm font-normal tracking-normal text-[var(--fg)]"
          />
        </label>
        <label className="text-[10px] font-black uppercase tracking-[.1em] text-[var(--fg-muted)]">
          To
          <input
            type="date"
            value={toDate}
            onChange={event => setToDate(event.target.value)}
            className="ml-2 border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-sm font-normal tracking-normal text-[var(--fg)]"
          />
        </label>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="border border-[#16243d]/10 bg-[#fffaf0] p-4">
          <p className="text-[10px] font-black uppercase tracking-[.1em] text-[var(--brand)]">
            Total shares
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {analytics.data?.total ?? 0}
          </p>
          {comparisonDelta !== null && (
            <p
              className={`mt-2 inline-flex items-center gap-1 text-xs font-bold ${trendColor}`}
            >
              <TrendIcon size={15} /> {Math.abs(comparisonDelta).toFixed(0)}% vs
              previous period
            </p>
          )}
        </div>
        <div className="border border-[#16243d]/10 bg-[#fffaf0] p-4">
          <p className="text-[10px] font-black uppercase tracking-[.1em] text-[var(--brand)]">
            Top course
          </p>
          <p className="mt-2 truncate text-sm font-bold">
            {analytics.data?.byCourse?.[0]?.courseSlug ?? "No data yet"}
          </p>
        </div>
        <div className="border border-[#16243d]/10 bg-[#fffaf0] p-4">
          <p className="text-[10px] font-black uppercase tracking-[.1em] text-[var(--brand)]">
            Top platform
          </p>
          <p className="mt-2 text-sm font-bold">
            {analytics.data?.byPlatform?.[0]?.platform ?? "No data yet"}
          </p>
        </div>
      </div>
      <div className="mt-6 border-t border-[#16243d]/10 pt-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.1em] text-[var(--brand)]">
              Comparison momentum
            </p>
            <h3 className="mt-1 text-xl font-semibold">
              Most shared comparisons.
            </h3>
            <p className="mt-1 text-sm text-[var(--fg-muted)]">
              Ranked from recorded comparison share events in the selected date
              range.
            </p>
          </div>
          <span className="text-xs text-[var(--fg-muted)]">
            {analytics.data?.byComparison?.length ?? 0} comparison
            {(analytics.data?.byComparison?.length ?? 0) === 1 ? "" : "s"}
          </span>
        </div>
        {analytics.data?.byComparison?.length ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {analytics.data.byComparison.slice(0, 6).map((item, index) => (
              <article
                key={item.comparison}
                className="border border-[#16243d]/10 bg-[#fffaf0] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-black uppercase tracking-[.12em] text-[var(--brand)]">
                    #{index + 1}
                  </span>
                  <span className="text-xs font-bold text-[var(--brand)]">
                    {item.shares} share{item.shares === 1 ? "" : "s"}
                  </span>
                </div>
                <p className="mt-3 text-sm font-bold leading-5">
                  {item.comparison.split(" vs ").join(" × ")}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-4 border border-dashed border-[#16243d]/20 p-4 text-sm text-[var(--fg-muted)]">
            Comparison rankings will appear after visitors share a multi-course
            shortlist.
          </div>
        )}
      </div>
      <div className="mt-8 border-t border-[#16243d]/10 pt-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.1em] text-[var(--brand)]">
              Preview lab
            </p>
            <h3 className="mt-1 text-xl font-semibold">
              See the card before it is shared.
            </h3>
            <p className="mt-1 text-sm text-[var(--fg-muted)]">
              Preview the generated 1200 × 630 image in the proportions used by
              major social platforms.
            </p>
          </div>
          <label className="text-[10px] font-black uppercase tracking-[.1em] text-[var(--fg-muted)]">
            Course
            <select
              value={previewSlug || selectedCourse?.slug || ""}
              onChange={event => setPreviewSlug(event.target.value)}
              className="ml-2 border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-sm font-normal normal-case tracking-normal text-[var(--fg)]"
            >
              <option value="">Select a course</option>
              {courses.data?.map(course => (
                <option key={course.slug} value={course.slug}>
                  {course.title}
                </option>
              ))}
            </select>
          </label>
        </div>
        {previewUrl && selectedCourse ? (
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <article className="overflow-hidden border border-[#16243d]/15 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-[#16243d]/10 px-4 py-3 text-xs font-bold">
                <span className="grid size-6 place-items-center rounded-full bg-[#16243d] text-[9px] text-[var(--brand-light)]">
                  X
                </span>{" "}
                Twitter / X · summary_large_image
              </div>
              <PreviewImage
                src={previewUrl}
                alt={`Twitter preview for ${selectedCourse.title}`}
              />
              <div className="p-4">
                <p className="text-[10px] uppercase tracking-[.12em] text-[var(--fg-muted)]">
                  {PUBLISHED_SITE_ORIGIN.replace(/^https?:\/\//, "")}
                </p>
                <p className="mt-1 font-bold">{selectedCourse.title}</p>
                <p className="mt-1 text-sm text-[var(--fg-muted)]">
                  {selectedCourse.strapline}
                </p>
              </div>
            </article>
            <article className="overflow-hidden border border-[#16243d]/15 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-[#16243d]/10 px-4 py-3 text-xs font-bold">
                <span className="grid size-6 place-items-center rounded-full bg-[#1877f2] text-[10px] font-black text-white">
                  f
                </span>{" "}
                Facebook · link preview
              </div>
              <PreviewImage
                src={previewUrl}
                alt={`Facebook preview for ${selectedCourse.title}`}
              />
              <div className="p-4">
                <p className="text-[10px] uppercase tracking-[.12em] text-[var(--fg-muted)]">
                  PROFOUND IQ CONSULTING
                </p>
                <p className="mt-1 font-bold">{selectedCourse.title}</p>
                <p className="mt-1 text-sm text-[var(--fg-muted)]">
                  {selectedCourse.description.slice(0, 120)}…
                </p>
              </div>
            </article>
          </div>
        ) : (
          <div className="mt-5 grid min-h-32 place-items-center border border-dashed border-[#16243d]/20 text-sm text-[var(--fg-muted)]">
            Create or select a database course to preview its generated social
            card.
          </div>
        )}
      </div>
      {previewUrl && selectedCourse && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={downloadPreviewCard}
            className="inline-flex items-center gap-2 border border-[#16243d]/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em]"
          >
            <Download size={13} /> Download generated card
          </button>
          <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.1em] text-[var(--fg-muted)]">
            <Share2 size={13} /> Quick share
          </span>
          <button
            type="button"
            onClick={() => quickShare("linkedin")}
            className="border border-[#16243d]/20 px-3 py-2 text-xs font-bold"
          >
            LinkedIn
          </button>
          <button
            type="button"
            onClick={() => quickShare("facebook")}
            className="border border-[#16243d]/20 px-3 py-2 text-xs font-bold"
          >
            Facebook
          </button>
          <button
            type="button"
            onClick={() => quickShare("x")}
            className="border border-[#16243d]/20 px-3 py-2 text-xs font-bold"
          >
            X
          </button>
          <button
            type="button"
            onClick={() => quickShare("whatsapp")}
            className="border border-[#16243d]/20 px-3 py-2 text-xs font-bold"
          >
            WhatsApp
          </button>
        </div>
      )}
      <div className="mt-8 border-t border-[#16243d]/10 pt-6">
        <p className="text-[10px] font-black uppercase tracking-[.1em] text-[var(--brand)]">
          Comparison shares over time
        </p>
        <h3 className="mt-1 text-xl font-semibold">Shortlist sharing trend</h3>
        <p className="mt-1 text-sm text-[var(--fg-muted)]">
          Daily volume of shares generated from multi-course comparisons.
        </p>
        {comparisonShareTrendData.length > 1 ? (
          <div className="mt-4 h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={comparisonShareTrendData}>
                <CartesianGrid
                  stroke="#16243d"
                  strokeOpacity={0.12}
                  vertical={false}
                />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--popover-foreground)",
                    color: "var(--popover-foreground)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="shares"
                  stroke="var(--brand)"
                  strokeWidth={3}
                  dot={{ r: 3, fill: "var(--brand)" }}
                  name="Comparison shares"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="mt-4 grid min-h-32 place-items-center border border-dashed border-[#16243d]/20 text-sm text-[var(--fg-muted)]">
            Comparison trend data will appear after multiple dates of shortlist
            sharing.
          </div>
        )}
      </div>
      {trendData.length > 1 && (
        <div className="mt-8 border-t border-[#16243d]/10 pt-6">
          <p className="text-[10px] font-black uppercase tracking-[.1em] text-[var(--brand)]">
            Performance over time
          </p>
          <h3 className="mt-1 text-xl font-semibold">
            Current period vs previous period
          </h3>
          <div className="mt-4 h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid
                  stroke="#16243d"
                  strokeOpacity={0.12}
                  vertical={false}
                />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--popover-foreground)",
                    color: "var(--popover-foreground)",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="current"
                  stroke="#a27e2e"
                  strokeWidth={2}
                  dot={false}
                  name="Current period"
                />
                <Line
                  type="monotone"
                  dataKey="previous"
                  stroke="#6f93bd"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Previous period"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {chartData.length ? (
        <div className="mt-6 h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 8, left: -18, bottom: 54 }}
            >
              <CartesianGrid
                stroke="#16243d"
                strokeOpacity={0.12}
                vertical={false}
              />
              <XAxis
                dataKey="courseSlug"
                angle={-35}
                textAnchor="end"
                height={76}
                tick={{ fontSize: 10 }}
                interval={0}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--popover-foreground)",
                  color: "var(--popover-foreground)",
                }}
              />
              {platforms.map((platform, index) => (
                <Bar
                  key={platform}
                  dataKey={platform}
                  stackId="shares"
                  fill={colors[index % colors.length]}
                  name={platform}
                  radius={
                    index === platforms.length - 1 ? [3, 3, 0, 0] : undefined
                  }
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-6 grid min-h-40 place-items-center border border-dashed border-[#16243d]/20 text-sm text-[var(--fg-muted)]">
          <div className="text-center">
            <BarChart3 className="mx-auto mb-2 text-[var(--brand)]" size={24} />
            <p>
              Share data will appear after visitors use the course share
              controls.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

/* Admin share analytics contract: "eventName: \"course_shared\"" "byComparison" "Most shared comparisons." "comparisonShareTrendData" "Comparison shares over time" "applyThisMonth" "This month" */

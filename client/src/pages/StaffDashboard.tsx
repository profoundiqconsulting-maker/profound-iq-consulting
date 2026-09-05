import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useMemo, useState } from "react";
import { BarChart3, CheckCircle2, ClipboardList, Download, Mail, RefreshCw, Search, CalendarClock, Pause, Play } from "lucide-react";
import { toast } from "sonner";
import { isInquiryOverdue, sortAssignedInquiries } from "@shared/staffOps";
import { useLocale } from "@/contexts/LocaleContext";
import { DashboardPagination } from "@/components/DashboardPagination";
import { courseCatalog } from "@shared/courseCatalog";
import { DashboardQuickNav } from "@/components/DashboardQuickNav";
import { DashboardSection, DashboardSectionHeader, DashboardSectionStats, DashboardSectionFilters, DashboardSectionContent, DashboardSectionPagination, DashboardStatCard } from "@/components/DashboardSection";

type Status = "all" | "new" | "contacted" | "closed";
type SortMode = "priority" | "dueDate" | "newest";
type StaffTab = "inquiries" | "review";

export default function StaffDashboard() {
  const { t } = useLocale();
  const [tab, setTab] = useState<StaffTab>("inquiries");

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-[#f7f3e8] px-4 py-8 text-[#16243d] sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <DashboardQuickNav role="staff" className="mb-8" />
          <div className="flex flex-col justify-between gap-5 border-b border-[#16243d]/15 pb-8 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow text-[#a27e2e]">Assigned work</p>
              <h1 className="display mt-3 text-4xl sm:text-5xl">Your inquiry desk.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#657084]">
                Review inquiries assigned to you, keep internal context current, and move each conversation forward.
              </p>
            </div>
            <span className="border border-[#c9a34e]/60 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[#7d5e1e]">Assigned work only</span>
          </div>

          <div className="mt-8 flex gap-2" role="tablist" aria-label="Staff workspace">
            {([
              { id: "inquiries", label: "Assigned inquiries" },
              { id: "review", label: "Instructor review" },
            ] as { id: StaffTab; label: string }[]).map(item => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={tab === item.id}
                onClick={() => setTab(item.id)}
                className={`border px-4 py-2 text-[10px] font-black uppercase tracking-[.12em] transition-all ${
                  tab === item.id
                    ? "border-[#16243d] bg-[#16243d] text-[#f7f3e8]"
                    : "border-[#16243d]/15 bg-white/50 text-[#657084] hover:border-[#c9a34e] hover:text-[#16243d]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {tab === "inquiries" && <InquiryDesk />}
          {tab === "review" && <InstructorReviewPanel />}
        </div>
      </main>
    </DashboardLayout>
  );
}

function InquiryDesk() {
  const { t } = useLocale();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<Status>("all");
  const [sortMode, setSortMode] = useState<SortMode>("priority");
  const [page, setPage] = useState(1);
  const input = useMemo(() => ({ page, pageSize: 10, search: search || undefined, status }), [page, search, status]);
  const inquiries = trpc.staff.assignedInquiries.useQuery(input, { retry: false, refetchInterval: 30000 });
  const updateStatus = trpc.staff.updateStatus.useMutation({ onSuccess: () => { inquiries.refetch(); toast.success("Inquiry status updated."); }, onError: error => toast.error(error.message) });
  const updateNotes = trpc.staff.updateNotes.useMutation({ onSuccess: () => { inquiries.refetch(); toast.success("Internal note saved."); }, onError: error => toast.error(error.message) });
  const rows = inquiries.data?.rows ?? [];
  const sortedRows = useMemo(() => sortAssignedInquiries(rows, sortMode), [rows, sortMode]);
  const stats = { total: inquiries.data?.total ?? 0, new: rows.filter(row => row.status === "new").length, contacted: rows.filter(row => row.status === "contacted").length, closed: rows.filter(row => row.status === "closed").length };
  const setFilter = (setter: (value: any) => void, value: any) => { setter(value); setPage(1); };

  return (
    <DashboardSection className="mt-8">
      <DashboardSectionHeader
        eyebrow={t("myWorkspace")}
        title="Assigned inquiries"
        description="Review inquiries assigned to you, keep internal context current, and move each conversation forward."
        actions={
          <span className="border border-[#c9a34e]/60 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[#7d5e1e]">Assigned work only</span>
        }
      />
      <DashboardSectionStats>
        <DashboardStatCard label="Assigned" value={stats.total} icon={<ClipboardList size={16} />} />
        <DashboardStatCard label="New" value={stats.new} />
        <DashboardStatCard label="Contacted" value={stats.contacted} />
        <DashboardStatCard label="Closed" value={stats.closed} icon={<CheckCircle2 size={16} />} />
      </DashboardSectionStats>
      <DashboardSectionFilters>
        <div className="flex flex-col gap-3 md:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search assigned inquiries</span>
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#657084]" />
            <input
              value={search}
              onChange={event => setFilter(setSearch, event.target.value)}
              placeholder="Search name, email, or message"
              className="w-full border border-[#16243d]/20 bg-[#f7f3e8] py-3 pl-9 pr-3 text-sm outline-none focus:border-[#c9a34e]"
            />
          </label>
          <select
            value={status}
            onChange={event => setFilter(setStatus, event.target.value)}
            aria-label="Filter assigned inquiries by status"
            className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-3 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={sortMode}
            onChange={event => setFilter(setSortMode, event.target.value)}
            aria-label="Sort assigned inquiries"
            className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-3 text-sm"
          >
            <option value="priority">Sort: priority</option>
            <option value="dueDate">Sort: due date</option>
            <option value="newest">Sort: newest</option>
          </select>
        </div>
      </DashboardSectionFilters>
      <DashboardSectionContent>
        {inquiries.isLoading ? (
          <div className="flex items-center gap-2 py-12 text-sm text-[#657084]">
            <RefreshCw size={15} className="animate-spin" /> Loading your assigned inquiries…
          </div>
        ) : inquiries.isError ? (
          <div className="border-l-2 border-red-700 bg-red-50 p-4 text-sm text-red-900">Unable to load your assigned inquiries. Please refresh and try again.</div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#657084]">No inquiries match your current view.</div>
        ) : (
          <div className="mt-5 divide-y divide-[#16243d]/10 border-y border-[#16243d]/10">
            {sortedRows.map(inquiry => (
              <article key={inquiry.id} className="py-6">
                <div className="flex flex-col justify-between gap-4 lg:flex-row">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold">{inquiry.name}</h2>
                      <span className="border border-[#c9a34e]/60 px-2 py-1 text-[10px] font-black uppercase tracking-[.1em] text-[#7d5e1e]">{inquiry.category.replaceAll("-", " ")}</span>
                      <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-[.1em] ${inquiry.priority === "urgent" ? "bg-red-700 text-white" : inquiry.priority === "high" ? "bg-[#c9a34e] text-[#16243d]" : "border border-[#16243d]/15 text-[#657084]"}`}>{inquiry.priority ?? "normal"}</span>
                      {isInquiryOverdue(inquiry) && <span className="bg-red-50 px-2 py-1 text-[10px] font-black uppercase tracking-[.1em] text-red-800">Overdue</span>}
                    </div>
                    <a href={`mailto:${inquiry.email}`} className="mt-1 inline-flex items-center gap-1 text-sm text-[#a27e2e] hover:underline"><Mail size={13} />{inquiry.email}</a>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#4a566a]">{inquiry.message}</p>
                    <p className="mt-2 text-[11px] uppercase tracking-[.1em] text-[#8a94a4]">
                      Received {new Date(inquiry.createdAt).toLocaleString()}
                      {inquiry.dueDate && <span className={`ml-2 ${isInquiryOverdue(inquiry) ? "font-bold text-red-800" : ""}`}>· Due {new Date(inquiry.dueDate).toLocaleDateString()}</span>}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2">
                    <select
                      value={inquiry.status}
                      onChange={event => updateStatus.mutate({ id: inquiry.id, status: event.target.value as Status })}
                      aria-label="Update inquiry status"
                      className="border border-[#16243d]/20 bg-[#f7f3e8] px-2 py-2 text-xs"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                    <textarea
                      value={noteDrafts[inquiry.id] ?? inquiry.internalNotes ?? ""}
                      onChange={event => setNoteDrafts(prev => ({ ...prev, [inquiry.id]: event.target.value }))}
                      onBlur={() => { if (noteDrafts[inquiry.id] !== inquiry.internalNotes) updateNotes.mutate({ id: inquiry.id, notes: noteDrafts[inquiry.id] }); }}
                      placeholder="Internal notes"
                      className="border border-[#16243d]/20 bg-[#f7f3e8] px-2 py-2 text-xs"
                      rows={3}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </DashboardSectionContent>
      <DashboardSectionPagination>
        <DashboardPagination page={inquiries.data?.page ?? page} pageCount={inquiries.data?.totalPages ?? 1} totalItems={inquiries.data?.total ?? 0} pageSize={10} onPageChange={setPage} itemLabel="assigned inquiries" />
      </DashboardSectionPagination>
    </DashboardSection>
  );
}

function InstructorReviewPanel() {
  const [search, setSearch] = useState("");
  const [reviewStatus, setReviewStatus] = useState<"all" | "reviewed" | "needs-review">("needs-review");
  const [courseSlug, setCourseSlug] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<number, string>>({});
  const filterInput = useMemo(() => ({ courseSlug: courseSlug === "all" ? undefined : courseSlug, fromDate: fromDate || undefined, toDate: toDate || undefined }), [courseSlug, fromDate, toDate]);
  const input = useMemo(() => ({ page, pageSize: 8, search: search || undefined, reviewStatus, ...filterInput }), [page, search, reviewStatus, filterInput]);
  const responses = trpc.staff.lessonResponses.useQuery(input, { retry: false, refetchInterval: 30000 });
  const analytics = trpc.staff.reviewAnalytics.useQuery(filterInput, { retry: false, refetchInterval: 30000 });
  const csvExport = trpc.staff.exportReviewAnalyticsCsv.useQuery(filterInput, { enabled: false, retry: false, refetchInterval: 30000 });
  const pdfExport = trpc.staff.exportReviewAnalyticsPdf.useQuery(filterInput, { enabled: false, retry: false, refetchInterval: 30000 });
  const schedule = trpc.staff.reviewAnalyticsSchedule.useQuery(undefined, { retry: false, refetchInterval: 30000 });
  const enableSchedule = trpc.staff.enableReviewAnalyticsSchedule.useMutation({ onSuccess: () => { schedule.refetch(); toast.success("Weekly review analytics delivery enabled."); }, onError: (error) => toast.error(error.message) });
  const pauseSchedule = trpc.staff.pauseReviewAnalyticsSchedule.useMutation({ onSuccess: () => { schedule.refetch(); toast.success("Review analytics delivery paused."); }, onError: (error) => toast.error(error.message) });
  const reviewMutation = trpc.staff.reviewLessonResponse.useMutation({ onSuccess: () => { responses.refetch(); toast.success("Instructor feedback saved."); }, onError: (error) => toast.error(error.message) });
  const setFilter = (value: string) => { setSearch(value); setPage(1); };
  const resetFilters = () => { setSearch(""); setReviewStatus("needs-review"); setCourseSlug("all"); setFromDate(""); setToDate(""); setPage(1); };
  const downloadResult = (result: { data?: { filename: string; contentType: string; data: string } }) => { if (!result.data) return; const binary = result.data.contentType === "application/pdf" ? Uint8Array.from(atob(result.data.data), (character) => character.charCodeAt(0)) : new TextEncoder().encode(result.data.data); const blob = new Blob([binary], { type: result.data.contentType }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = result.data.filename; anchor.click(); URL.revokeObjectURL(url); };
  const exportCsv = async () => { const result = await csvExport.refetch(); downloadResult(result); toast.success("Review analytics CSV downloaded."); };
  const exportPdf = async () => { const result = await pdfExport.refetch(); downloadResult(result); toast.success("Review analytics PDF downloaded."); };
  const responseRows = responses.data?.rows ?? [];
  const stats = useMemo(() => ({
    pending: responseRows.filter(row => row.status === "needs-review").length,
    reviewed: responseRows.filter(row => row.status === "reviewed").length,
    total: responseRows.length,
  }), [responseRows]);

  return (
    <DashboardSection className="mt-8">
      <DashboardSectionHeader
        eyebrow="Learning quality control"
        title="Learner response desk."
        description="Review required lesson responses, leave actionable feedback, and move work from needs review to reviewed."
        actions={
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={exportCsv} className="border border-[#16243d]/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.08em]">CSV</button>
            <button type="button" onClick={exportPdf} className="border border-[#16243d]/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.08em]">PDF</button>
            <button type="button" onClick={() => void enableSchedule.mutate()} disabled={enableSchedule.isPending || Boolean(schedule.data?.config?.scheduleTaskUid)} className="inline-flex items-center gap-2 border border-[#16243d]/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.08em] disabled:opacity-50">
              <CalendarClock size={13} />{schedule.data?.config?.scheduleTaskUid ? "Delivery enabled" : "Enable weekly delivery"}
            </button>
            {schedule.data?.config?.scheduleTaskUid && (
              <button type="button" onClick={() => void pauseSchedule.mutate({ paused: !schedule.data?.config?.pausedAt })} disabled={pauseSchedule.isPending} className="inline-flex items-center gap-2 border border-[#16243d]/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.08em] disabled:opacity-50">
                {schedule.data?.config?.pausedAt ? <Play size={13} /> : <Pause size={13} />}{schedule.data?.config?.pausedAt ? "Resume" : "Pause"}
              </button>
            )}
          </div>
        }
      />
      <DashboardSectionStats>
        <DashboardStatCard label="Pending review" value={stats.pending} />
        <DashboardStatCard label="Reviewed" value={stats.reviewed} icon={<CheckCircle2 size={16} />} />
        <DashboardStatCard label="Total responses" value={stats.total} icon={<BarChart3 size={16} />} />
      </DashboardSectionStats>
      <DashboardSectionFilters>
        <div className="flex flex-col gap-3 md:flex-row">
          <label className="relative lg:col-span-2">
            <span className="sr-only">Search learner responses</span>
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#657084]" />
            <input
              value={search}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Search learner, lesson, or response"
              className="w-full border border-[#16243d]/20 bg-[#f7f3e8] py-3 pl-9 pr-3 text-sm outline-none focus:border-[#c9a34e]"
            />
          </label>
          <select value={courseSlug} onChange={(event) => { setCourseSlug(event.target.value); setPage(1); }} aria-label="Filter response review by course" className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-3 text-sm">
            <option value="all">All courses</option>
            {courseCatalog.map((course) => <option key={course.slug} value={course.slug}>{course.title}</option>)}
          </select>
          <select value={reviewStatus} onChange={(event) => { setReviewStatus(event.target.value as typeof reviewStatus); setPage(1); }} aria-label="Filter response review status" className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-3 text-sm">
            <option value="needs-review">Needs review</option>
            <option value="reviewed">Reviewed</option>
            <option value="all">All responses</option>
          </select>
          <input type="date" value={fromDate} onChange={(event) => { setFromDate(event.target.value); setPage(1); }} aria-label="From date" className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-3 text-sm" />
          <input type="date" value={toDate} onChange={(event) => { setToDate(event.target.value); setPage(1); }} aria-label="To date" className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-3 text-sm" />
          <button type="button" onClick={resetFilters} className="border border-[#16243d]/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.08em]">Reset</button>
        </div>
      </DashboardSectionFilters>
      <DashboardSectionContent>
        {responses.isLoading ? (
          <div className="flex items-center gap-2 py-12 text-sm text-[#657084]"><RefreshCw size={15} className="animate-spin" /> Loading responses…</div>
        ) : responses.isError ? (
          <div className="border-l-2 border-red-700 bg-red-50 p-4 text-sm text-red-900">Unable to load responses.</div>
        ) : responseRows.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#657084]">No responses match your current view.</div>
        ) : (
          <div className="mt-5 space-y-4">
            {responseRows.map(row => (
              <div key={row.id} className="border border-[#16243d]/10 bg-white/50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-[#16243d]">{row.learnerName}</span>
                  <span className="border border-[#c9a34e]/60 px-2 py-1 text-[10px] font-black uppercase tracking-[.1em] text-[#7d5e1e]">{row.courseTitle}</span>
                  <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-[.1em] ${row.status === "reviewed" ? "border border-emerald-700/30 text-emerald-800" : "border border-[#7d5e1e]/30 text-[#7d5e1e]"}`}>{row.status}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#4a566a]">{stripResponseHtml(row.response)}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <textarea
                    value={feedbackDrafts[row.id] ?? row.feedback ?? ""}
                    onChange={event => setFeedbackDrafts(prev => ({ ...prev, [row.id]: event.target.value }))}
                    onBlur={() => { if (feedbackDrafts[row.id] !== row.feedback) reviewMutation.mutate({ responseId: row.id, feedback: feedbackDrafts[row.id] }); }}
                    placeholder="Feedback"
                    className="w-full border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-xs sm:w-96"
                    rows={2}
                  />
                  <button type="button" onClick={() => reviewMutation.mutate({ responseId: row.id, feedback: feedbackDrafts[row.id] ?? row.feedback ?? "" })} disabled={reviewMutation.isPending} className="border border-[#16243d] bg-[#16243d] px-3 py-2 text-[10px] font-black uppercase tracking-[.08em] text-[#f7f3e8] disabled:opacity-50">Save feedback</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardSectionContent>
      <DashboardSectionPagination>
        <DashboardPagination page={responses.data?.page ?? page} pageCount={responses.data?.totalPages ?? 1} totalItems={responses.data?.total ?? 0} pageSize={8} onPageChange={setPage} itemLabel="responses" />
      </DashboardSectionPagination>
    </DashboardSection>
  );
}

function stripResponseHtml(value: string) { return value.replace(/<br\s*\/?\s*>/gi, "\n").replace(/<\/p>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").trim(); }

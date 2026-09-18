import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Download,
  Mail,
  RefreshCw,
  Search,
  CalendarClock,
  Pause,
  Play,
} from "lucide-react";
import { toast } from "sonner";
import { isInquiryOverdue, sortAssignedInquiries } from "@shared/staffOps";

import { DashboardPagination } from "@/components/DashboardPagination";
import { courseCatalog } from "@shared/courseCatalog";
import {
  DashboardSection,
  DashboardSectionHeader,
  DashboardSectionStats,
  DashboardSectionFilters,
  DashboardSectionContent,
  DashboardSectionPagination,
} from "@/components/DashboardSection";
import { DashboardStatCard } from "@/components/DashboardStatCard";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Status = "all" | "new" | "contacted" | "closed";
type SortMode = "priority" | "dueDate" | "newest";
type StaffTab = "inquiries" | "review";

export default function StaffDashboard() {
  
  const [tab, setTab] = useState<StaffTab>("inquiries");

  return (
    <DashboardLayout role="staff" title="Staff Workspace">
      <main className="min-h-screen bg-gradient-to-br from-[#f7f3e8] via-[#f7f3e8] to-[#ead9ae] dark:from-[#0d1a2f] dark:via-[#101d35] dark:to-[#16243d] px-4 py-8 text-[#16243d] dark:text-[#f7f3e8] sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <DashboardHero
            eyebrow="Staff workspace"
            title="Your inquiry desk"
            description="Review assigned inquiries, provide feedback on learner responses, and keep operations moving."
            badge={{ label: "Assigned work only", variant: "secondary" }}
            stats={[
              { label: "Assigned", value: "—", trend: { value: 0, label: "live" } },
              { label: "New", value: "—", trend: { value: 0, label: "live" } },
              { label: "Contacted", value: "—", trend: { value: 0, label: "live" } },
              { label: "Closed", value: "—", trend: { value: 0, label: "live" } },
            ]}
            actions={
              <div className="flex gap-2" role="tablist" aria-label="Staff workspace">
              {([
                { id: "inquiries", label: "Assigned inquiries" },
                { id: "review", label: "Instructor review" },
              ] as { id: StaffTab; label: string }[]).map(item => (
                <Button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.id}
                  onClick={() => setTab(item.id)}
                  variant={tab === item.id ? "default" : "outline"}
                  size="sm"
                  className="text-[10px] font-black uppercase tracking-[.12em]"
                >
                  {item.label}
                </Button>
              ))}
              </div>
            }
          />

          {tab === "inquiries" && <InquiryDesk />}
          {tab === "review" && <InstructorReviewPanel />}
        </div>
      </main>
    </DashboardLayout>
  );
}

function InquiryDesk() {
  
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<Status>("all");
  const [sortMode, setSortMode] = useState<SortMode>("priority");
  const [page, setPage] = useState(1);
  const [noteDrafts, setNoteDrafts] = useState<Record<number, string>>({});
  const input = useMemo(
    () => ({ page, pageSize: 10, search: search || undefined, status }),
    [page, search, status]
  );
  const inquiries = trpc.staff.assignedInquiries.useQuery(input, {
    retry: false,
    refetchInterval: 30000,
  });
  const updateStatus = trpc.staff.updateStatus.useMutation({
    onSuccess: () => {
      inquiries.refetch();
      toast.success("Inquiry status updated.");
    },
    onError: error => toast.error(error.message),
  });
  const updateNotes = trpc.staff.updateNotes.useMutation({
    onSuccess: () => {
      inquiries.refetch();
      toast.success("Internal note saved.");
    },
    onError: error => toast.error(error.message),
  });
  const rows = inquiries.data?.rows ?? [];
  const sortedRows = useMemo(
    () => sortAssignedInquiries(rows, sortMode),
    [rows, sortMode]
  );
  const stats = {
    total: inquiries.data?.total ?? 0,
    new: rows.filter(row => row.status === "new").length,
    contacted: rows.filter(row => row.status === "contacted").length,
    closed: rows.filter(row => row.status === "closed").length,
  };
  const setFilter = (setter: (value: any) => void, value: any) => {
    setter(value);
    setPage(1);
  };

  return (
    <DashboardSection className="mt-8">
      <DashboardSectionHeader
        eyebrow={"My workspace"}
        title="Assigned inquiries"
        description="Review inquiries assigned to you, keep internal context current, and move each conversation forward."
      />
      <DashboardSectionStats>
        <DashboardStatCard label="Assigned" value={stats.total} icon={ClipboardList} />
        <DashboardStatCard label="New" value={stats.new} />
        <DashboardStatCard label="Contacted" value={stats.contacted} />
        <DashboardStatCard label="Closed" value={stats.closed} icon={CheckCircle2} />
      </DashboardSectionStats>
      <DashboardSectionFilters>
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#16243d]" />
            <input
              value={search}
              onChange={event => setFilter(setSearch, event.target.value)}
              placeholder="Search name, email, ticket number, or message"
              className="w-full border border-[#16243d]/20 bg-white/80 dark:bg-[#16243d] py-3 pl-9 pr-3 text-sm outline-none focus:border-[#c9a34e] transition-colors"
            />
          </div>
          <Select value={status} onValueChange={value => setFilter(setStatus, value)}>
            <SelectTrigger className="w-full md:w-[180px] bg-white/80 dark:bg-[#16243d]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortMode} onValueChange={value => setFilter(setSortMode, value)}>
            <SelectTrigger className="w-full md:w-[180px] bg-white/80 dark:bg-[#16243d]">
              <SelectValue placeholder="Sort by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">Sort: priority</SelectItem>
              <SelectItem value="dueDate">Sort: due date</SelectItem>
              <SelectItem value="newest">Sort: newest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </DashboardSectionFilters>
      <DashboardSectionContent>
        {inquiries.isLoading ? (
          <div className="flex items-center gap-2 py-12 text-sm text-[#16243d]">
            <RefreshCw size={15} className="animate-spin" /> Loading your assigned inquiries…
          </div>
        ) : inquiries.isError ? (
          <div className="border-l-2 border-red-700 bg-red-50 p-4 text-sm text-red-900">
            Unable to load your assigned inquiries. Please refresh and try again.
          </div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#16243d]">
            No inquiries match your current view.
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {sortedRows.map(inquiry => (
              <article key={inquiry.id} className="group rounded-xl border border-[#16243d]/10 bg-white/80 dark:bg-[#16243d]/60 p-5 transition-all hover:border-[#c9a34e]/40 hover:shadow-lg">
                <div className="flex flex-col justify-between gap-4 lg:flex-row">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold text-[#16243d] dark:text-[#f7f3e8]">{inquiry.name}</h2>
                      {inquiry.ticketNumber && (
                        <span className="font-mono text-[10px] font-black uppercase tracking-[.1em] text-[#7d5e1e]">
                          #{inquiry.ticketNumber}
                        </span>
                      )}
                      <span className="rounded-full border border-[#c9a34e]/60 px-2.5 py-1 text-[10px] font-black uppercase tracking-[.1em] text-[#7d5e1e] dark:text-[#7d5e1e]">
                        {inquiry.category.replaceAll("-", " ")}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[.1em] ${inquiry.priority === "urgent" ? "bg-red-700 text-white" : inquiry.priority === "high" ? "bg-[#c9a34e] text-[#16243d]" : "border border-[#16243d]/15 text-[#16243d]"}`}>
                        {inquiry.priority ?? "normal"}
                      </span>
                      {isInquiryOverdue(inquiry) && (
                        <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[.1em] text-red-800 dark:bg-red-900/20 dark:text-red-400">
                          Overdue
                        </span>
                      )}
                    </div>
                    <a href={`mailto:${inquiry.email}`} className="mt-2 inline-flex items-center gap-1.5 text-sm text-[#7d5e1e] hover:text-[#7d5e1e] transition-colors">
                      <Mail size={13} />
                      {inquiry.email}
                    </a>
                    <p className="mt-3 text-sm leading-6 text-[#16243d]/80 dark:text-[#f7f3e8]/80">
                      {inquiry.message}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[.1em] text-[#16243d]">
                      <span>Received {new Date(inquiry.createdAt).toLocaleString()}</span>
                      {inquiry.dueDate && (
                        <span className={isInquiryOverdue(inquiry) ? "font-bold text-red-800 dark:text-red-400" : ""}>
                          · Due {new Date(inquiry.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2 lg:w-64">
                    <Select value={inquiry.status} onValueChange={value => updateStatus.mutate({ id: inquiry.id, status: value as "new" | "contacted" | "closed" })}>
                      <SelectTrigger className="bg-white/80 dark:bg-[#16243d]">
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <textarea
                      value={noteDrafts[inquiry.id] ?? inquiry.internalNotes ?? ""}
                      onChange={event => setNoteDrafts(prev => ({ ...prev, [inquiry.id]: event.target.value }))}
                      onBlur={() => {
                        if (noteDrafts[inquiry.id] !== inquiry.internalNotes)
                          updateNotes.mutate({ id: inquiry.id, internalNotes: noteDrafts[inquiry.id] });
                      }}
                      placeholder="Internal notes"
                      className="w-full rounded-lg border border-[#16243d]/20 bg-white/80 dark:bg-[#16243d] px-3 py-2 text-xs transition-colors focus:border-[#c9a34e]"
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
        <DashboardPagination
          page={inquiries.data?.page ?? page}
          pageCount={inquiries.data?.totalPages ?? 1}
          totalItems={inquiries.data?.total ?? 0}
          pageSize={10}
          onPageChange={setPage}
          itemLabel="assigned inquiries"
        />
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
  const filterInput = useMemo(() => ({
    courseSlug: courseSlug === "all" ? undefined : courseSlug,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  }), [courseSlug, fromDate, toDate]);
  const input = useMemo(() => ({
    page,
    pageSize: 8,
    search: search || undefined,
    reviewStatus,
    ...filterInput,
  }), [page, search, reviewStatus, filterInput]);
  const responses = trpc.staff.lessonResponses.useQuery(input, { retry: false, refetchInterval: 30000 });
  const analytics = trpc.staff.reviewAnalytics.useQuery(filterInput, { retry: false, refetchInterval: 30000 });
  const csvExport = trpc.staff.exportReviewAnalyticsCsv.useQuery(filterInput, { enabled: false, retry: false, refetchInterval: 30000 });
  const pdfExport = trpc.staff.exportReviewAnalyticsPdf.useQuery(filterInput, { enabled: false, retry: false, refetchInterval: 30000 });
  const schedule = trpc.staff.reviewAnalyticsSchedule.useQuery(undefined, { retry: false, refetchInterval: 30000 });
  const enableSchedule = trpc.staff.enableReviewAnalyticsSchedule.useMutation({
    onSuccess: () => { schedule.refetch(); toast.success("Weekly review analytics delivery enabled."); },
    onError: error => toast.error(error.message),
  });
  const pauseSchedule = trpc.staff.pauseReviewAnalyticsSchedule.useMutation({
    onSuccess: () => { schedule.refetch(); toast.success("Review analytics delivery paused."); },
    onError: error => toast.error(error.message),
  });
  const reviewMutation = trpc.staff.reviewLessonResponse.useMutation({
    onSuccess: () => { responses.refetch(); toast.success("Instructor feedback saved."); },
    onError: error => toast.error(error.message),
  });
  const setFilter = (value: string) => { setSearch(value); setPage(1); };
  const resetFilters = () => { setSearch(""); setReviewStatus("needs-review"); setCourseSlug("all"); setFromDate(""); setToDate(""); setPage(1); };
  const downloadResult = async (result: { data?: { filename: string; contentType: string; data: string } }) => {
    if (!result.data) return;
    const binary = result.data.contentType === "application/pdf" ? Uint8Array.from(atob(result.data.data), character => character.charCodeAt(0)) : new TextEncoder().encode(result.data.data);
    const blob = new Blob([binary], { type: result.data.contentType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = result.data.filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const exportCsv = async () => { const result = await csvExport.refetch(); downloadResult(result); toast.success("Review analytics CSV downloaded."); };
  const exportPdf = async () => { const result = await pdfExport.refetch(); downloadResult(result); toast.success("Review analytics PDF downloaded."); };
  const responseRows = responses.data?.rows ?? [];
  const stats = useMemo(() => ({
    pending: responseRows.filter(row => (row.review?.status ?? "needs-review") === "needs-review").length,
    reviewed: responseRows.filter(row => (row.review?.status ?? "") === "reviewed").length,
    total: responseRows.length,
  }), [responseRows]);

  return (
    <DashboardSection className="mt-8">
      <DashboardSectionHeader
        eyebrow="Learning quality control"
        title="Learner response desk"
        description="Review required lesson responses, leave actionable feedback, and move work from needs review to reviewed."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={exportCsv} variant="outline" size="sm" className="text-[10px] font-black uppercase tracking-[.08em]">
              <Download size={13} className="mr-1.5" /> CSV
            </Button>
            <Button type="button" onClick={exportPdf} variant="outline" size="sm" className="text-[10px] font-black uppercase tracking-[.08em]">
              <Download size={13} className="mr-1.5" /> PDF
            </Button>
            <Button type="button" onClick={() => void enableSchedule.mutate()} disabled={enableSchedule.isPending || Boolean(schedule.data?.taskUid)} variant="outline" size="sm" className="text-[10px] font-black uppercase tracking-[.08em]">
              <CalendarClock size={13} className="mr-1.5" />
              {schedule.data?.taskUid ? "Delivery enabled" : "Enable weekly delivery"}
            </Button>
            {schedule.data?.taskUid && (
              <Button type="button" onClick={() => void pauseSchedule.mutate()} disabled={pauseSchedule.isPending} variant="outline" size="sm" className="text-[10px] font-black uppercase tracking-[.08em]">
                {schedule.data?.pausedAt ? <Play size={13} className="mr-1.5" /> : <Pause size={13} className="mr-1.5" />}
                {schedule.data?.pausedAt ? "Resume" : "Pause"}
              </Button>
            )}
          </div>
        }
      />
      <DashboardSectionStats>
        <DashboardStatCard label="Pending review" value={stats.pending} />
        <DashboardStatCard label="Reviewed" value={stats.reviewed} icon={CheckCircle2} />
        <DashboardStatCard label="Total responses" value={stats.total} icon={BarChart3} />
      </DashboardSectionStats>
      <DashboardSectionFilters>
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#16243d]" />
            <input
              value={search}
              onChange={event => setFilter(event.target.value)}
              placeholder="Search learner, lesson, or response"
              className="w-full border border-[#16243d]/20 bg-white/80 dark:bg-[#16243d] py-3 pl-9 pr-3 text-sm outline-none focus:border-[#c9a34e] transition-colors"
            />
          </div>
          <Select value={courseSlug} onValueChange={value => { setCourseSlug(value); setPage(1); }}>
            <SelectTrigger className="w-full md:w-[220px] bg-white/80 dark:bg-[#16243d]">
              <SelectValue placeholder="All courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All courses</SelectItem>
              {courseCatalog.map(course => (
                <SelectItem key={course.slug} value={course.slug}>{course.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={reviewStatus} onValueChange={value => { setReviewStatus(value as typeof reviewStatus); setPage(1); }}>
            <SelectTrigger className="w-full md:w-[180px] bg-white/80 dark:bg-[#16243d]">
              <SelectValue placeholder="Needs review" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="needs-review">Needs review</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="all">All responses</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <input type="date" value={fromDate} onChange={event => { setFromDate(event.target.value); setPage(1); }} aria-label="From date" className="w-full border border-[#16243d]/20 bg-white/80 dark:bg-[#16243d] px-3 py-3 text-sm" />
            <input type="date" value={toDate} onChange={event => { setToDate(event.target.value); setPage(1); }} aria-label="To date" className="w-full border border-[#16243d]/20 bg-white/80 dark:bg-[#16243d] px-3 py-3 text-sm" />
          </div>
          <Button type="button" onClick={resetFilters} variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-[.08em]">
            Reset
          </Button>
        </div>
      </DashboardSectionFilters>
      <DashboardSectionContent>
        {responses.isLoading ? (
          <div className="flex items-center gap-2 py-12 text-sm text-[#16243d]">
            <RefreshCw size={15} className="animate-spin" /> Loading responses…
          </div>
        ) : responses.isError ? (
          <div className="border-l-2 border-red-700 bg-red-50 p-4 text-sm text-red-900">
            Unable to load responses.
          </div>
        ) : responseRows.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#16243d]">
            No responses match your current view.
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {responseRows.map(row => {
              const learnerName = row.enrollment?.userOpenId ?? "Learner";
              const courseTitle = row.enrollment?.courseSlug ?? "Course";
              const reviewStatus = row.review?.status ?? "needs-review";
              const responseText = typeof row.response === "string" ? row.response : (row.response?.responseHtml ?? "");
              return (
                <div key={row.response.id} className="rounded-xl border border-[#16243d]/10 bg-white/80 dark:bg-[#16243d]/60 p-5 transition-all hover:border-[#c9a34e]/40 hover:shadow-lg">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-[#16243d] dark:text-[#f7f3e8]">{learnerName}</span>
                    <span className="rounded-full border border-[#c9a34e]/60 px-2.5 py-1 text-[10px] font-black uppercase tracking-[.1em] text-[#7d5e1e] dark:text-[#7d5e1e]">
                      {courseTitle}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[.1em] ${reviewStatus === "reviewed" ? "border border-emerald-700/30 text-emerald-800 dark:text-emerald-400" : "border border-[#7d5e1e]/30 text-[#7d5e1e]"}`}>
                      {reviewStatus}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#16243d]/80 dark:text-[#f7f3e8]/80">
                    {stripResponseHtml(responseText)}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <textarea
                      value={feedbackDrafts[row.response.id] ?? row.review?.feedback ?? ""}
                      onChange={event => setFeedbackDrafts(prev => ({ ...prev, [row.response.id]: event.target.value }))}
                      onBlur={() => {
                        const draft = feedbackDrafts[row.response.id];
                        if (draft !== row.review?.feedback)
                          reviewMutation.mutate({ responseId: row.response.id, enrollmentId: row.response.enrollmentId, lessonId: row.response.lessonId, taskId: row.response.taskId, feedback: draft ?? "", status: (row.review?.status ?? "needs-review") as "reviewed" | "needs-review" });
                      }}
                      placeholder="Feedback"
                      className="w-full rounded-lg border border-[#16243d]/20 bg-white/80 dark:bg-[#16243d] px-3 py-2 text-xs transition-colors focus:border-[#c9a34e] sm:w-96"
                      rows={2}
                    />
                    <Button type="button" onClick={() => reviewMutation.mutate({ responseId: row.response.id, enrollmentId: row.response.enrollmentId, lessonId: row.response.lessonId, taskId: row.response.taskId, feedback: feedbackDrafts[row.response.id] ?? row.review?.feedback ?? "", status: (row.review?.status ?? "needs-review") as "reviewed" | "needs-review" })} disabled={reviewMutation.isPending} size="sm" className="text-[10px] font-black uppercase tracking-[.08em]">
                      Save feedback
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DashboardSectionContent>
      <DashboardSectionPagination>
        <DashboardPagination
          page={responses.data?.page ?? page}
          pageCount={responses.data?.totalPages ?? 1}
          totalItems={responses.data?.total ?? 0}
          pageSize={8}
          onPageChange={setPage}
          itemLabel="responses"
        />
      </DashboardSectionPagination>
    </DashboardSection>
  );
}

function stripResponseHtml(value: string) {
  return value.replace(/<br\s*\/?\s*>/gi, "\n").replace(/<\/p>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").trim();
}




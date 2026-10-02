import { trpc } from "@/lib/trpc";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  Mail,
  RefreshCw,
  Search,
  Square,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAdminTableState } from "@/hooks/useAdminTableState";

const categories = [
  ["all", "All subjects"],
  ["professional-courses", "Professional courses"],
  ["educational-consulting", "Educational consulting"],
  ["psychometric-testing", "Psychometric testing"],
  ["research-surveys", "Research surveys"],
  ["organizational-development", "Organizational development"],
  ["general", "General question"],
] as const;
type Category = (typeof categories)[number][0];
type Status = "all" | "new" | "contacted" | "closed";
type ActiveStatus = Exclude<Status, "all">;

function csvDownload(data: {
  data: string;
  filename: string;
  contentType: string;
}) {
  const url = URL.createObjectURL(
    new Blob([data.data], { type: data.contentType })
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = data.filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function InquiryAuditHistory({
  inquiryId,
  open,
}: {
  inquiryId: number;
  open: boolean;
}) {
  const audit = trpc.admin.contactInquiryAuditHistory.useQuery(
    { inquiryId },
    { enabled: open, refetchInterval: 30000 }
  );
  if (!open) return null;
  return (
    <div className="mt-3 border-t border-[#16243d]/10 pt-3">
      <p className="text-[10px] font-black uppercase tracking-[.1em] text-[#475569]">
        Change history
      </p>
      {audit.isLoading ? (
        <p className="mt-2 text-xs text-[#475569]">Loading history…</p>
      ) : audit.data?.length ? (
        <div className="mt-2 space-y-2">
          {audit.data.map(entry => (
            <div
              key={entry.id}
              className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-[#475569]"
            >
              <span className="font-bold text-[#16243d]">{entry.action}</span>
              <span>
                {entry.previousValue ?? "—"} → {entry.nextValue ?? "—"}
              </span>
              <span>
                · {entry.actorName ?? entry.actorEmail ?? entry.actorOpenId}
              </span>
              <span>· {new Date(entry.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-xs text-[#475569]">No changes recorded yet.</p>
      )}
    </div>
  );
}

export default function AdminInquiryPanel() {
  const table = useAdminTableState(
    "admin-inquiries",
    {
      search: "",
      category: "all" as Category,
      status: "all" as Status,
      assignedToOpenId: "all",
      fromDate: "",
      toDate: "",
      page: 1,
      selected: [] as number[],
    },
    {
      persistedKeys: [
        "search",
        "category",
        "status",
        "assignedToOpenId",
        "fromDate",
        "toDate",
        "page",
        "selected",
      ],
    }
  );
  const { state, setValue } = table;
  const [noteDrafts, setNoteDrafts] = useState<Record<number, string>>({});
  const [bulkStatus, setBulkStatus] = useState<ActiveStatus>("contacted");
  const [auditOpen, setAuditOpen] = useState<number | null>(null);

  const setSearch = (value: string) => setValue("search", value);
  const setCategory = (value: Category) => setValue("category", value);
  const setStatus = (value: Status) => setValue("status", value);
  const setAssignedToOpenId = (value: string) => setValue("assignedToOpenId", value);
  const setFromDate = (value: string) => setValue("fromDate", value);
  const setToDate = (value: string) => setValue("toDate", value);
  const setPage = (value: number | ((prev: number) => number)) =>
    setValue("page", value);
  const setSelected = (value: number[] | ((prev: number[]) => number[])) =>
    setValue("selected", value);

  const filters = useMemo(
    () => ({
      search: state.search || undefined,
      category: state.category,
      status: state.status,
      assignedToOpenId: state.assignedToOpenId,
      fromDate: state.fromDate || undefined,
      toDate: state.toDate || undefined,
    }),
    [
      state.assignedToOpenId,
      state.category,
      state.fromDate,
      state.search,
      state.status,
      state.toDate,
    ]
  );
  const input = useMemo(
    () => ({ ...filters, page: state.page, pageSize: 8 }),
    [filters, state.page]
  );
  const inquiries = trpc.admin.contactInquiries.useQuery(input, {
    retry: false,
    refetchInterval: 30000,
  });
  const chart = trpc.admin.contactInquiryCategoryCounts.useQuery(undefined, {
    retry: false,
    refetchInterval: 30000,
  });
  const exportInquiries = trpc.admin.exportContactInquiries.useQuery(filters, {
    enabled: false,
    refetchInterval: 30000,
  });
  const teamMembers = trpc.admin.teamMembers.useQuery(undefined, {
    retry: false,
    refetchInterval: 30000,
  });
  const updateAssignment =
    trpc.admin.updateContactInquiryAssignment.useMutation({
      onSuccess: () => inquiries.refetch(),
    });
  const updateWorkload = trpc.admin.updateContactInquiryWorkload.useMutation({
    onSuccess: () => inquiries.refetch(),
  });
  const updateStatus = trpc.admin.updateContactInquiryStatus.useMutation({
    onSuccess: () => inquiries.refetch(),
  });
  const updateNotes = trpc.admin.updateContactInquiryNotes.useMutation({
    onSuccess: () => inquiries.refetch(),
  });
  const bulkUpdate = trpc.admin.bulkUpdateContactInquiryStatus.useMutation({
    onSuccess: () => {
      setSelected([]);
      inquiries.refetch();
    },
  });
  const rows = useMemo(
    () => inquiries.data?.rows ?? [],
    [inquiries.data?.rows]
  );
  const allVisibleSelected =
    rows.length > 0 && rows.every(row => state.selected.includes(row.id));
  const subjectLabel = (value: string) =>
    categories.find(([key]) => key === value)?.[1] ?? value;
  const resetPage = () => {
    setPage(1);
    setSelected([]);
  };
  const toggleSelected = (id: number) =>
    setSelected(current =>
      current.includes(id)
        ? current.filter(value => value !== id)
        : [...current, id]
    );
  const toggleAll = () =>
    setSelected(allVisibleSelected ? [] : rows.map(row => row.id));
  const handleExport = async () => {
    const result = await exportInquiries.refetch();
    if (result.data) csvDownload(result.data);
  };
  const handleBulkUpdate = () => {
    if (state.selected.length)
      bulkUpdate.mutate({ ids: state.selected, status: bulkStatus });
  };
  const setFilter = (setter: (value: string) => void, value: string) => {
    setter(value);
    resetPage();
  };
  const setPreset = (preset: "today" | "7d" | "30d") => {
    const end = new Date();
    const start = new Date();
    if (preset === "today") start.setHours(0, 0, 0, 0);
    else start.setDate(start.getDate() - (preset === "7d" ? 6 : 29));
    setFromDate(start.toISOString().slice(0, 10));
    setToDate(end.toISOString().slice(0, 10));
    resetPage();
  };
  const clearDates = () => {
    setFromDate("");
    setToDate("");
    resetPage();
  };

  useEffect(() => {
    setNoteDrafts(current => {
      const next = { ...current };
      rows.forEach(row => {
        if (!(row.id in next)) next[row.id] = row.internalNotes ?? "";
      });
      return next;
    });
  }, [rows]);

  return (
    <section
      className="mt-10 border border-[#16243d]/15 bg-white/45 p-5 sm:p-6"
      aria-labelledby="inquiries-title"
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow flex items-center gap-2 text-[#b8860b]">
            <Mail size={13} /> Contact desk
          </p>
          <h2 id="inquiries-title" className="display mt-3 text-3xl">
            Submitted inquiries.
          </h2>
          <p className="mt-2 text-sm text-[#475569]">
            Review, triage, and close questions submitted through the public
            website.
          </p>
        </div>
        <span className="text-xs font-bold uppercase tracking-[.12em] text-[#475569]">
          {inquiries.data?.total ?? 0} total
        </span>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr_1fr_auto]">
        <label className="relative lg:col-span-2">
          <span className="sr-only">Search inquiries</span>
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]"
            size={15}
          />
          <input
            value={state.search}
            onChange={event => setFilter(setSearch, event.target.value)}
            placeholder="Search name, email, ticket number, or message"
            className="w-full border border-[#16243d]/20 bg-[#f7f3e8] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#c9a34e]"
          />
        </label>
        <select
          value={state.category}
          onChange={event => {
            setCategory(event.target.value as Category);
            resetPage();
          }}
          aria-label="Filter inquiries by subject"
          className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-sm"
        >
          <option value="all">All subjects</option>
          {categories
            .filter(([key]) => key !== "all")
            .map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
        </select>
        <select
          value={state.status}
          onChange={event => {
            setStatus(event.target.value as Status);
            resetPage();
          }}
          aria-label="Filter inquiries by status"
          className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={state.assignedToOpenId}
          onChange={event => {
            setAssignedToOpenId(event.target.value);
            resetPage();
          }}
          aria-label="Filter inquiries by assigned team member"
          className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-sm"
        >
          <option value="all">All assignees</option>
          <option value="unassigned">Unassigned</option>
          {teamMembers.data?.map(member => (
            <option key={member.openId} value={member.openId}>
              {member.name ?? member.email ?? member.openId}
            </option>
          ))}
        </select>
        <label className="text-[10px] font-black uppercase tracking-[.1em] text-[#475569]">
          From
          <input
            type="date"
            value={state.fromDate}
            onChange={event => setFilter(setFromDate, event.target.value)}
            aria-label="Filter inquiries from date"
            className="mt-1 w-full border border-[#16243d]/20 bg-[#f7f3e8] px-2 py-2 text-xs font-normal tracking-normal text-[#16243d]"
          />
        </label>
        <label className="text-[10px] font-black uppercase tracking-[.1em] text-[#475569]">
          To
          <input
            type="date"
            value={state.toDate}
            onChange={event => setFilter(setToDate, event.target.value)}
            aria-label="Filter inquiries to date"
            className="mt-1 w-full border border-[#16243d]/20 bg-[#f7f3e8] px-2 py-2 text-xs font-normal tracking-normal text-[#16243d]"
          />
        </label>
        <div className="flex flex-wrap gap-1 lg:col-span-4">
          <button
            type="button"
            onClick={() => setPreset("today")}
            className="border border-[#16243d]/20 px-2 py-2 text-[9px] font-black uppercase tracking-[.08em]"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setPreset("7d")}
            className="border border-[#16243d]/20 px-2 py-2 text-[9px] font-black uppercase tracking-[.08em]"
          >
            Last 7 days
          </button>
          <button
            type="button"
            onClick={() => setPreset("30d")}
            className="border border-[#16243d]/20 px-2 py-2 text-[9px] font-black uppercase tracking-[.08em]"
          >
            Last 30 days
          </button>
          <button
            type="button"
            onClick={clearDates}
            className="px-2 py-2 text-[9px] font-black uppercase tracking-[.08em] text-[#475569]"
          >
            Clear dates
          </button>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={exportInquiries.isFetching}
          className="inline-flex items-center justify-center gap-2 border border-[#16243d]/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] disabled:opacity-50"
        >
          {exportInquiries.isFetching ? (
            <RefreshCw size={13} className="animate-spin" />
          ) : (
            <Download size={13} />
          )}{" "}
          Export CSV
        </button>
      </div>
      <div className="mt-4 flex flex-col gap-3 border-y border-[#16243d]/10 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleAll}
            disabled={!rows.length}
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.1em] disabled:opacity-40"
          >
            {allVisibleSelected ? (
              <CheckSquare size={15} />
            ) : (
              <Square size={15} />
            )}{" "}
            Select visible
          </button>
          <span className="text-xs text-[#475569]">
            {state.selected.length} selected
          </span>
        </div>
        <div className="flex gap-2">
          <select
            value={bulkStatus}
            onChange={event =>
              setBulkStatus(event.target.value as ActiveStatus)
            }
            aria-label="Bulk inquiry status"
            className="border border-[#16243d]/20 bg-[#f7f3e8] px-2 py-2 text-xs"
          >
            <option value="new">Set New</option>
            <option value="contacted">Set Contacted</option>
            <option value="closed">Set Closed</option>
          </select>
          <button
            type="button"
            onClick={handleBulkUpdate}
            disabled={!state.selected.length || bulkUpdate.isPending}
            className="inline-flex items-center gap-2 bg-[#16243d] px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] text-[#f7f3e8] disabled:opacity-40"
          >
            {bulkUpdate.isPending && (
              <RefreshCw size={13} className="animate-spin" />
            )}{" "}
            Update selected
          </button>
        </div>
      </div>
      {inquiries.isLoading ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-[#475569]">
          <RefreshCw size={15} className="animate-spin" /> Loading inquiries…
        </div>
      ) : inquiries.isError ? (
        <div className="mt-6 border-l-2 border-red-700 bg-red-50 p-4 text-sm text-red-900">
          Unable to load inquiries. Please refresh and try again.
        </div>
      ) : rows.length ? (
        <div className="mt-6 divide-y divide-[#16243d]/10 border-y border-[#16243d]/10">
          {rows.map(inquiry => (
            <article key={inquiry.id} className="flex gap-3 py-5">
              <button
                type="button"
                onClick={() => toggleSelected(inquiry.id)}
                aria-label={`${state.selected.includes(inquiry.id) ? "Deselect" : "Select"} inquiry from ${inquiry.name}`}
                className="mt-1 shrink-0 text-[#b8860b]"
              >
                {state.selected.includes(inquiry.id) ? (
                  <CheckSquare size={17} />
                ) : (
                  <Square size={17} />
                )}
              </button>
              <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold">{inquiry.name}</h3>
                      {inquiry.ticketNumber && (
                        <span className="font-mono text-[10px] font-black uppercase tracking-[.1em] text-[#b8860b]">
                          #{inquiry.ticketNumber}
                        </span>
                      )}
                      <span className="border border-[#c9a34e]/60 px-2 py-1 text-[10px] font-black uppercase tracking-[.1em] text-[#b8860b]">
                        {subjectLabel(inquiry.category)}
                      </span>
                      <span className="border border-[#16243d]/15 px-2 py-1 text-[10px] font-black uppercase tracking-[.1em] text-[#475569]">
                        {inquiry.status}
                      </span>
                    </div>
                    <a
                      href={`mailto:${inquiry.email}`}
                      className="mt-1 inline-block text-sm text-[#b8860b] hover:underline"
                    >
                      {inquiry.email}
                    </a>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#4a566a]">
                      {inquiry.message}
                    </p>
                    <p className="mt-3 text-[11px] uppercase tracking-[.1em] text-[#8a94a4]">
                      Received {new Date(inquiry.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={inquiry.status}
                      onChange={event =>
                        updateStatus.mutate({
                          id: inquiry.id,
                          status: event.target.value as ActiveStatus,
                        })
                      }
                      disabled={updateStatus.isPending}
                      aria-label={`Update status for inquiry from ${inquiry.name}`}
                      className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-xs font-bold uppercase tracking-[.1em]"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                    <select
                      value={inquiry.assignedToOpenId ?? "unassigned"}
                      onChange={event => {
                        const member = teamMembers.data?.find(
                          item => item.openId === event.target.value
                        );
                        updateAssignment.mutate({
                          id: inquiry.id,
                          assignedToOpenId: member?.openId ?? null,
                          assignedToName: member?.name ?? member?.email ?? null,
                        });
                      }}
                      disabled={
                        updateAssignment.isPending || teamMembers.isLoading
                      }
                      aria-label={`Assign inquiry from ${inquiry.name}`}
                      className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-xs font-bold uppercase tracking-[.1em]"
                    >
                      <option value="unassigned">Unassigned</option>
                      {teamMembers.data?.map(member => (
                        <option key={member.openId} value={member.openId}>
                          {member.name ?? member.email ?? member.openId}
                        </option>
                      ))}
                    </select>
                    <select
                      defaultValue={inquiry.priority ?? "normal"}
                      onChange={event =>
                        updateWorkload.mutate({
                          id: inquiry.id,
                          priority: event.target.value as
                            | "low"
                            | "normal"
                            | "high"
                            | "urgent",
                          dueDate: inquiry.dueDate
                            ? new Date(inquiry.dueDate)
                                .toISOString()
                                .slice(0, 10)
                            : null,
                        })
                      }
                      aria-label={`Set priority for inquiry from ${inquiry.name}`}
                      className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-xs font-bold uppercase tracking-[.1em]"
                    >
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="normal">Normal</option>
                      <option value="low">Low</option>
                    </select>
                    <input
                      type="date"
                      defaultValue={
                        inquiry.dueDate
                          ? new Date(inquiry.dueDate).toISOString().slice(0, 10)
                          : ""
                      }
                      onChange={event =>
                        updateWorkload.mutate({
                          id: inquiry.id,
                          priority: (inquiry.priority ?? "normal") as
                            | "low"
                            | "normal"
                            | "high"
                            | "urgent",
                          dueDate: event.target.value || null,
                        })
                      }
                      aria-label={`Set due date for inquiry from ${inquiry.name}`}
                      className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-xs"
                    />
                  </div>
                </div>
                <div className="border-l-2 border-[#c9a34e]/60 bg-[#f7f3e8] p-3">
                  <label className="text-[10px] font-black uppercase tracking-[.1em] text-[#475569]">
                    Internal team notes
                    <textarea
                      rows={2}
                      value={noteDrafts[inquiry.id] ?? ""}
                      onChange={event =>
                        setNoteDrafts(current => ({
                          ...current,
                          [inquiry.id]: event.target.value,
                        }))
                      }
                      placeholder="Add a follow-up note for the team…"
                      aria-label={`Internal notes for inquiry from ${inquiry.name}`}
                      className="mt-2 w-full resize-y border border-[#16243d]/15 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#16243d] outline-none focus:border-[#c9a34e]"
                    />
                  </label>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        updateNotes.mutate({
                          id: inquiry.id,
                          internalNotes: noteDrafts[inquiry.id] ?? "",
                        })
                      }
                      disabled={updateNotes.isPending}
                      className="inline-flex items-center gap-2 border border-[#16243d]/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] disabled:opacity-50"
                    >
                      {updateNotes.isPending && (
                        <RefreshCw size={12} className="animate-spin" />
                      )}{" "}
                      Save note
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setAuditOpen(current =>
                        current === inquiry.id ? null : inquiry.id
                      )
                    }
                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.1em] text-[#475569]"
                  >
                    <ClipboardList size={13} />{" "}
                    {auditOpen === inquiry.id ? "Hide history" : "View history"}
                  </button>
                </div>
                <InquiryAuditHistory
                  inquiryId={inquiry.id}
                  open={auditOpen === inquiry.id}
                />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 border border-dashed border-[#16243d]/20 p-6 text-sm text-[#475569]">
          No inquiries match the current filters.
        </div>
      )}
      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setPage(value => Math.max(1, value - 1))}
          disabled={state.page <= 1 || inquiries.isLoading}
          className="inline-flex items-center gap-1 border border-[#16243d]/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] disabled:opacity-40"
        >
          <ChevronLeft size={13} /> Previous
        </button>
        <span className="text-xs text-[#475569]">
          Page {inquiries.data?.page ?? state.page} of{" "}
          {inquiries.data?.totalPages ?? 1}
        </span>
        <button
          type="button"
          onClick={() =>
            setPage(value =>
              Math.min(inquiries.data?.totalPages ?? value, value + 1)
            )
          }
          disabled={
            state.page >= (inquiries.data?.totalPages ?? 1) || inquiries.isLoading
          }
          className="inline-flex items-center gap-1 border border-[#16243d]/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] disabled:opacity-40"
        >
          Next <ChevronRight size={13} />
        </button>
      </div>
      <div className="mt-10 border-t border-[#16243d]/10 pt-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow text-[#b8860b]">Last 30 days</p>
            <h3 className="display mt-2 text-2xl">Inquiry mix by subject.</h3>
          </div>
          <span className="text-xs text-[#475569]">Category volume</span>
        </div>
        <div className="mt-4 h-64">
          {chart.isLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-[#475569]">
              Loading chart…
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chart.data ?? []}
                margin={{ top: 8, right: 8, bottom: 35, left: -20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#16243d20" />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 9 }}
                  angle={-18}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--popover-foreground)",
                    color: "var(--popover-foreground)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill="#c9a34e" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </section>
  );
}


import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { Clock3, Download } from "lucide-react";
import { Section } from "@/components/dashboard/Section";
import { DashboardPagination } from "@/components/DashboardPagination";

export function OrganizationApprovalQueue() {
  const [status, setStatus] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");

  const [search, setSearch] = useState("");

  const [fromDate, setFromDate] = useState("");

  const [toDate, setToDate] = useState("");

  const [now, setNow] = useState(() => Date.now());

  const [historyPage, setHistoryPage] = useState(1);

  const query = trpc.admin.organizationInvitations.useQuery({
    status,
    search: search || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });

  const history = trpc.admin.organizationApprovalHistory.useQuery({
    page: historyPage,
    pageSize: 10,
    search: search || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });

  const exportHistory = trpc.admin.exportOrganizationApprovalHistory.useQuery(
    {
      search: search || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    },
    { enabled: false }
  );

  const review = trpc.admin.reviewOrganizationInvitation.useMutation({
    onSuccess: () => {
      query.refetch();
      history.refetch();
    },
  });

  const remind = trpc.admin.remindOrganizationInvitation.useMutation({
    onSuccess: () => {
      query.refetch();
    },
  });

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const downloadCsv = async () => {
    const result = await exportHistory.refetch();
    if (!result.data) return;
    const anchor = document.createElement("a");
    anchor.href = `data:${result.data.contentType};charset=utf-8,${encodeURIComponent(result.data.data)}`;
    anchor.download = result.data.filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const countdown = (value: Date | string) => {
    const remaining = new Date(value).getTime() - now;
    if (remaining <= 0) return "Expired";
    const totalMinutes = Math.floor(remaining / 60000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;
    return days ? `${days}d ${hours}h left` : `${hours}h ${minutes}m left`;
  };

  const trendCounts = (history.data?.trends ?? []).reduce(
    (acc, item) => {
      acc[item.eventType] = (acc[item.eventType] ?? 0) + item.count;
      return acc;
    },
    {} as Record<string, number>
  );

  const trendByDay = Object.entries(
    (history.data?.trends ?? []).reduce(
      (acc, item) => {
        acc[item.bucket] = (acc[item.bucket] ?? 0) + item.count;
        return acc;
      },
      {} as Record<string, number>
    )
  ).slice(-30);

  const maxTrend = Math.max(1, ...trendByDay.map(([, count]) => count));

  const chartPoints = trendByDay
    .map(
      ([, count], index) =>
        `${trendByDay.length === 1 ? 50 : (index / (trendByDay.length - 1)) * 100},${100 - (count / maxTrend) * 82}`
    )
    .join(" ");

  return (
    <Section
      eyebrow="Organization review queue"
      title="Approve with confidence."
      description="Monitor forwarded report requests, respond before invitations expire, and export a filtered compliance history."
      actions={
        <button
          type="button"
          onClick={downloadCsv}
          disabled={exportHistory.isFetching}
          className="inline-flex items-center justify-center gap-2 border border-[#16243d]/25 px-4 py-3 text-[10px] font-black uppercase tracking-[.12em]"
        >
          <Download size={14} />{" "}
          {exportHistory.isFetching ? "Preparing…" : "Export history"}
        </button>
      }
      className="mt-14"
    >
      <div className="grid gap-3 md:grid-cols-4">
        <input
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="Search organization or email"
          aria-label="Search organization approvals"
          className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-3 text-sm outline-none focus:border-[#c9a34e]"
        />
        <select
          value={status}
          onChange={event => setStatus(event.target.value as typeof status)}
          aria-label="Filter organization approvals by status"
          className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-3 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <input
          type="date"
          value={fromDate}
          onChange={event => setFromDate(event.target.value)}
          aria-label="Approval history start date"
          className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-3 text-sm"
        />
        <input
          type="date"
          value={toDate}
          onChange={event => setToDate(event.target.value)}
          aria-label="Approval history end date"
          className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-3 text-sm"
        />
      </div>
      <div className="mt-6 border border-[#16243d]/10 bg-[#f7f3e8] p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#16243d]">
            Approval trend · last 30 days
          </p>
          <span className="text-[10px] text-[#16243d]">
            {trendByDay.length} active days
          </span>
        </div>
        <div className="mt-4 h-28 w-full">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="h-full w-full overflow-visible"
            role="img"
            aria-label="Organization approval events over the selected period"
          >
            <path
              d="M0 100 H100"
              stroke="currentColor"
              strokeOpacity=".15"
              vectorEffect="non-scaling-stroke"
            />
            <polyline
              points={chartPoints || "0,100 100,100"}
              fill="none"
              stroke="#a27e2e"
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-[#16243d]">
          <span>{trendByDay[0]?.[0] ?? "No events yet"}</span>
          <span>{trendByDay.at(-1)?.[0] ?? ""}</span>
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="border-t-2 border-[#c9a34e] bg-white p-4">
          <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#16243d]">
            Approval events
          </p>
          <p className="mt-2 text-2xl font-bold">{history.data?.total ?? 0}</p>
        </div>
        <div className="border-t-2 border-emerald-700 bg-white p-4">
          <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#16243d]">
            Approved
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-800">
            {trendCounts.approved ?? 0}
          </p>
        </div>
        <div className="border-t-2 border-red-700 bg-white p-4">
          <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#16243d]">
            Rejected
          </p>
          <p className="mt-2 text-2xl font-bold text-red-800">
            {trendCounts.rejected ?? 0}
          </p>
        </div>
      </div>
      <div className="mt-6 grid gap-3">
        {query.data?.map(invitation => {
          const remaining = new Date(invitation.expiresAt).getTime() - now;
          const urgent =
            invitation.status === "pending" &&
            remaining > 0 &&
            remaining < 48 * 60 * 60 * 1000;
          return (
            <article
              key={invitation.id}
              className="border border-[#16243d]/12 bg-[#f7f3e8] p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-bold">
                    {invitation.organizationName}
                  </p>
                  <p className="mt-1 text-xs text-[#16243d]">
                    {invitation.organizationEmail} · {invitation.reportType} #
                    {invitation.reportId}
                  </p>
                </div>
                <span
                  className={`inline-flex w-fit items-center gap-2 text-[10px] font-black uppercase tracking-[.12em] ${invitation.status === "approved" ? "text-emerald-800" : invitation.status === "rejected" ? "text-red-800" : urgent ? "text-red-800" : "text-[#7d5e1e]"}`}
                >
                  <Clock3 size={13} />{" "}
                  {invitation.status === "pending"
                    ? countdown(invitation.expiresAt)
                    : invitation.status}
                </span>
              </div>
              {urgent && (
                <div className="mt-3 border-l-2 border-red-700 bg-red-50 px-3 py-2 text-xs text-red-900">
                  Reminder recommended: this invitation expires soon.
                </div>
              )}
              {invitation.status === "pending" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      review.mutate({ id: invitation.id, status: "approved" })
                    }
                    className="bg-[#16243d] px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] text-[#f7f3e8]"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      review.mutate({ id: invitation.id, status: "rejected" })
                    }
                    className="border border-red-800 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] text-red-800"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => remind.mutate({ id: invitation.id })}
                    disabled={
                      remind.isPending || Boolean(invitation.reminderSentAt)
                    }
                    className="border border-[#16243d]/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] disabled:opacity-40"
                  >
                    {invitation.reminderSentAt
                      ? "Reminder sent"
                      : "Send reminder"}
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>
      {(history.data?.rows.length ?? 0) === 0 && (
        <p className="mt-5 text-sm text-[#16243d]">
          No approval events match the current filters.
        </p>
      )}
      <DashboardPagination
        page={history.data?.page ?? historyPage}
        pageCount={history.data?.totalPages ?? 1}
        totalItems={history.data?.total ?? 0}
        pageSize={10}
        onPageChange={setHistoryPage}
        itemLabel="organization approval records"
      />
    </Section>
  );
}

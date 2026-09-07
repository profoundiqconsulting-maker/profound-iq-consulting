import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Download,
  Mail,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { DashboardPagination } from "@/components/DashboardPagination";

const PAGE_SIZE = 10;

type SubscriberStatus = "pending" | "confirmed" | "subscribed" | "unsubscribed";
type SubscriberFilters = {
  search: string;
  status: "all" | SubscriberStatus;
  fromDate: string;
  toDate: string;
};

export default function AdminNewsletterPanel() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<SubscriberFilters>({
    search: "",
    status: "all",
    fromDate: "",
    toDate: "",
  });
  const queryInput = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      search: filters.search || undefined,
      status: filters.status,
      fromDate: filters.fromDate || undefined,
      toDate: filters.toDate || undefined,
    }),
    [filters, page]
  );
  const subscribers = trpc.newsletter.subscribers.useQuery(queryInput, {
    retry: false,
    refetchInterval: 30000,
  });
  const exportInput = useMemo(
    () => ({
      search: filters.search || undefined,
      status: filters.status,
      fromDate: filters.fromDate || undefined,
      toDate: filters.toDate || undefined,
    }),
    [filters]
  );
  const exportCsv = trpc.newsletter.exportCsv.useQuery(exportInput, {
    enabled: false,
    retry: false,
  });
  const setStatus = trpc.newsletter.setStatus.useMutation({
    onSuccess: () => subscribers.refetch(),
    onError: error =>
      toast.error(error.message || "Unable to update subscriber status."),
  });
  const schedule = trpc.admin.biweeklyNewsletterSchedule.useQuery(undefined, {
    retry: false,
    refetchInterval: 30000,
  });
  const enableSchedule =
    trpc.admin.enableBiweeklyNewsletterSchedule.useMutation({
      onSuccess: result => {
        toast.success(
          result.alreadyEnabled
            ? "Bi-weekly newsletter schedule is already enabled."
            : "Bi-weekly newsletter schedule enabled."
        );
        schedule.refetch();
      },
      onError: error =>
        toast.error(error.message || "Unable to enable newsletter scheduling."),
    });

  useEffect(() => {
    setPage(1);
  }, [filters.search, filters.status, filters.fromDate, filters.toDate]);

  const updateFilter = <K extends keyof SubscriberFilters>(
    key: K,
    value: SubscriberFilters[K]
  ) => setFilters(current => ({ ...current, [key]: value }));
  const clearFilters = () =>
    setFilters({ search: "", status: "all", fromDate: "", toDate: "" });
  const hasFilters = Boolean(
    filters.search ||
      filters.fromDate ||
      filters.toDate ||
      filters.status !== "all"
  );

  const downloadCsv = async () => {
    const result = await exportCsv.refetch();
    if (!result.data) {
      toast.error(
        result.error?.message || "Unable to prepare the subscriber export."
      );
      return;
    }
    const blob = new Blob([result.data.csv], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = result.data.filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast.success("Filtered newsletter subscriber CSV downloaded.");
  };

  return (
    <section
      id="newsletter-subscribers"
      className="mt-10 scroll-mt-8 border border-[#c9a34e]/45 bg-[#fffaf0] p-5 sm:p-6"
    >
      <div className="flex flex-col justify-between gap-4 border-b border-[#16243d]/10 pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow text-[#a27e2e]">Audience / newsletter</p>
          <h2 className="display mt-2 text-2xl">
            Keep the conversation permission-based.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#657084]">
            Review consented Insights subscribers, narrow the list by email,
            status, or consent date, and export only the records needed for an
            approved communication workflow.
          </p>
        </div>
        <button
          type="button"
          onClick={downloadCsv}
          disabled={exportCsv.isFetching}
          className="inline-flex min-h-10 items-center justify-center gap-2 border border-[#16243d]/25 px-4 py-3 text-[10px] font-black uppercase tracking-[.1em] text-[#16243d] transition-colors hover:border-[#c9a34e] hover:bg-white disabled:cursor-wait disabled:opacity-50"
        >
          {exportCsv.isFetching ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : (
            <Download size={14} />
          )}{" "}
          {exportCsv.isFetching ? "Preparing…" : "Export filtered CSV"}
        </button>
      </div>
      <div className="mt-5 flex flex-col gap-3 border border-[#c9a34e]/35 bg-[#16243d] p-4 text-[#f7f3e8] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#c9a34e]">
            Delivery / bi-weekly newsletter
          </p>
          <p className="mt-1 text-sm text-[#d8deea]">
            Sends the latest published Insights to confirmed subscribers every
            other Monday at 09:00 UTC.
          </p>
          {schedule.data?.config?.lastRunAt && (
            <p className="mt-1 text-xs text-[#aeb9c9]">
              Last run:{" "}
              {new Date(schedule.data.config.lastRunAt).toLocaleString()}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => enableSchedule.mutate()}
          disabled={
            Boolean(schedule.data?.config?.scheduleTaskUid) ||
            enableSchedule.isPending
          }
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 border border-[#c9a34e] px-4 py-3 text-[10px] font-black uppercase tracking-[.1em] text-[#f7f3e8] hover:bg-[#c9a34e] hover:text-[#16243d] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={enableSchedule.isPending ? "animate-spin" : ""}
          />{" "}
          {schedule.data?.config?.scheduleTaskUid
            ? "Schedule enabled"
            : enableSchedule.isPending
              ? "Enabling…"
              : "Enable schedule"}
        </button>
      </div>
      <div className="mt-5 grid gap-3 border border-[#16243d]/10 bg-white/55 p-4 md:grid-cols-[1.4fr_.8fr_.8fr_.8fr_auto] md:items-end">
        <label className="grid gap-2 text-xs font-bold uppercase tracking-[.08em] text-[#657084]">
          Search email or source
          <span className="flex min-h-11 items-center gap-2 border border-[#16243d]/15 bg-[#fffaf0] px-3">
            <Search size={15} className="text-[#a27e2e]" />
            <input
              value={filters.search}
              onChange={event => updateFilter("search", event.target.value)}
              placeholder="e.g. learner@example.com"
              aria-label="Search newsletter subscribers"
              className="w-full bg-transparent text-sm font-normal normal-case tracking-normal text-[#16243d] outline-none"
            />
          </span>
        </label>
        <label className="grid gap-2 text-xs font-bold uppercase tracking-[.08em] text-[#657084]">
          Status
          <select
            value={filters.status}
            onChange={event =>
              updateFilter(
                "status",
                event.target.value as SubscriberFilters["status"]
              )
            }
            aria-label="Filter newsletter subscribers by status"
            className="min-h-11 border border-[#16243d]/15 bg-[#fffaf0] px-3 text-sm font-normal normal-case tracking-normal text-[#16243d] outline-none"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending confirmation</option>
            <option value="confirmed">Confirmed</option>
            <option value="subscribed">Legacy subscribed</option>
            <option value="unsubscribed">Unsubscribed</option>
          </select>
        </label>
        <label className="grid gap-2 text-xs font-bold uppercase tracking-[.08em] text-[#657084]">
          From date
          <input
            type="date"
            value={filters.fromDate}
            onChange={event => updateFilter("fromDate", event.target.value)}
            aria-label="Newsletter subscriber start date"
            className="min-h-11 border border-[#16243d]/15 bg-[#fffaf0] px-3 text-sm font-normal normal-case tracking-normal text-[#16243d] outline-none"
          />
        </label>
        <label className="grid gap-2 text-xs font-bold uppercase tracking-[.08em] text-[#657084]">
          To date
          <input
            type="date"
            value={filters.toDate}
            min={filters.fromDate || undefined}
            onChange={event => updateFilter("toDate", event.target.value)}
            aria-label="Newsletter subscriber end date"
            className="min-h-11 border border-[#16243d]/15 bg-[#fffaf0] px-3 text-sm font-normal normal-case tracking-normal text-[#16243d] outline-none"
          />
        </label>
        <button
          type="button"
          onClick={clearFilters}
          disabled={!hasFilters}
          className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#16243d]/20 px-3 text-[10px] font-black uppercase tracking-[.08em] text-[#657084] hover:border-[#c9a34e] hover:text-[#16243d] disabled:opacity-40"
        >
          <SlidersHorizontal size={14} /> Clear
        </button>
      </div>
      {subscribers.isLoading ? (
        <div className="mt-6 flex items-center gap-3 text-sm text-[#657084]">
          <RefreshCw size={16} className="animate-spin text-[#a27e2e]" />{" "}
          Loading subscribers…
        </div>
      ) : subscribers.isError ? (
        <div
          className="mt-6 flex items-start gap-3 border-l-2 border-red-700 bg-red-50 p-4 text-sm text-red-900"
          role="alert"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>
            Unable to load newsletter subscribers. Please refresh and try again.
          </span>
        </div>
      ) : (
        <>
          <div className="mt-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[.1em] text-[#657084]">
            <Mail size={15} className="text-[#a27e2e]" />{" "}
            {subscribers.data?.total ?? 0} matching address
            {(subscribers.data?.total ?? 0) === 1 ? "" : "es"}
          </div>
          {(subscribers.data?.rows.length ?? 0) === 0 ? (
            <div className="mt-5 border border-dashed border-[#16243d]/20 bg-white/60 p-5 text-sm text-[#657084]">
              No newsletter subscribers match the current filters.
            </div>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="border-b border-[#16243d]/15 text-[10px] uppercase tracking-[.12em] text-[#657084]">
                  <tr>
                    <th className="py-3 pr-4">Email</th>
                    <th className="py-3 pr-4">Source</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3">Consented</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.data?.rows.map(subscriber => (
                    <tr
                      key={subscriber.id}
                      className="border-b border-[#16243d]/10"
                    >
                      <td className="py-3 pr-4 font-semibold">
                        {subscriber.email}
                      </td>
                      <td className="py-3 pr-4 text-xs text-[#657084]">
                        {subscriber.source}
                      </td>
                      <td className="py-3 pr-4">
                        <select
                          value={subscriber.status as SubscriberStatus}
                          onChange={event =>
                            setStatus.mutate({
                              id: subscriber.id,
                              status: event.target.value as SubscriberStatus,
                            })
                          }
                          aria-label={`Update status for ${subscriber.email}`}
                          className={`border-0 bg-transparent p-0 text-xs font-bold outline-none focus:ring-2 focus:ring-[#c9a34e]/40 ${subscriber.status === "confirmed" || subscriber.status === "subscribed" ? "text-emerald-800" : subscriber.status === "unsubscribed" ? "text-[#8b4f63]" : "text-[#7d5e1e]"}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="subscribed">Subscribed</option>
                          <option value="unsubscribed">Unsubscribed</option>
                        </select>
                      </td>
                      <td className="py-3 text-xs text-[#657084]">
                        {new Date(subscriber.consentedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <DashboardPagination
            page={subscribers.data?.page ?? page}
            pageCount={subscribers.data?.pageCount ?? 1}
            totalItems={subscribers.data?.total ?? 0}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            itemLabel="newsletter subscribers"
          />
        </>
      )}
    </section>
  );
}

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Languages,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const statusLabels = {
  all: "All suggestions",
  new: "Pending review",
  contacted: "Approved",
  closed: "Rejected",
} as const;
type SuggestionStatus = keyof typeof statusLabels;

export default function AdminTranslationSuggestionsPanel() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SuggestionStatus>("new");
  const [page, setPage] = useState(1);
  const input = useMemo(
    () => ({
      search: search || undefined,
      category: "translation-feedback" as const,
      status,
      page,
      pageSize: 6,
    }),
    [page, search, status]
  );
  const suggestions = trpc.admin.contactInquiries.useQuery(input, {
    retry: false,
    refetchInterval: 30000,
  });
  const updateStatus = trpc.admin.updateContactInquiryStatus.useMutation({
    onSuccess: () => {
      toast.success("Translation suggestion updated.");
      suggestions.refetch();
    },
    onError: error =>
      toast.error(error.message || "Could not update this suggestion."),
  });
  const rows = suggestions.data?.rows ?? [];
  const totalPages = Math.max(1, Math.ceil((suggestions.data?.total ?? 0) / 6));

  return (
    <section
      className="mt-10 border border-[#16243d]/15 bg-white/55 p-5 sm:p-6"
      aria-labelledby="translation-suggestions-title"
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow flex items-center gap-2 text-[#a27e2e]">
            <Languages size={13} /> Translation operations
          </p>
          <h2
            id="translation-suggestions-title"
            className="display mt-3 text-3xl"
          >
            Suggested improvements.
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[#657084]">
            Review visitor corrections before they are incorporated into
            localized course and assessment content.
          </p>
        </div>
        <span className="text-xs font-bold uppercase tracking-[.12em] text-[#657084]">
          {suggestions.data?.total ?? 0} matching
        </span>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <label className="relative">
          <span className="sr-only">Search suggestions</span>
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#657084]"
            size={15}
          />
          <input
            value={search}
            onChange={event => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search wording or page"
            className="w-full border border-[#16243d]/20 bg-[#f7f3e8] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#c9a34e]"
          />
        </label>
        <select
          value={status}
          onChange={event => {
            setStatus(event.target.value as SuggestionStatus);
            setPage(1);
          }}
          aria-label="Filter translation suggestions by status"
          className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-sm"
        >
          {Object.entries(statusLabels).map(([key, label]) => (
            <option value={key} key={key}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => suggestions.refetch()}
          className="inline-flex items-center justify-center gap-2 border border-[#16243d]/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em]"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>
      {suggestions.isLoading ? (
        <p className="mt-6 flex items-center gap-2 text-sm text-[#657084]">
          <RefreshCw size={15} className="animate-spin" /> Loading suggestions…
        </p>
      ) : suggestions.isError ? (
        <p className="mt-6 border-l-2 border-red-700 bg-red-50 p-4 text-sm text-red-900">
          Unable to load translation suggestions.
        </p>
      ) : rows.length ? (
        <div className="mt-6 divide-y divide-[#16243d]/10 border-y border-[#16243d]/10">
          {rows.map(row => (
            <article key={row.id} className="py-5">
              <div className="flex flex-col justify-between gap-4 lg:flex-row">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold">{row.email}</h3>
                    <span className="border border-[#c9a34e]/60 px-2 py-1 text-[10px] font-black uppercase tracking-[.1em] text-[#7d5e1e]">
                      {row.status === "new"
                        ? "Pending review"
                        : row.status === "contacted"
                          ? "Approved"
                          : "Rejected"}
                    </span>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#4a566a]">
                    {row.message}
                  </p>
                  <p className="mt-3 text-[11px] uppercase tracking-[.1em] text-[#8a94a4]">
                    Submitted {new Date(row.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {row.status !== "contacted" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus.mutate({ id: row.id, status: "contacted" })
                      }
                      disabled={updateStatus.isPending}
                      className="inline-flex items-center gap-2 bg-[#16243d] px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] text-[#f7f3e8] disabled:opacity-50"
                    >
                      <Check size={13} /> Approve
                    </button>
                  )}
                  {row.status !== "closed" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus.mutate({ id: row.id, status: "closed" })
                      }
                      disabled={updateStatus.isPending}
                      className="inline-flex items-center gap-2 border border-red-700/40 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] text-red-800 disabled:opacity-50"
                    >
                      <X size={13} /> Reject
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 border border-dashed border-[#16243d]/20 p-8 text-center text-sm text-[#657084]">
          No translation suggestions match the current filter.
        </div>
      )}
      <div className="mt-5 flex items-center justify-between text-xs text-[#657084]">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage(value => Math.max(1, value - 1))}
            disabled={page === 1}
            aria-label="Previous suggestions page"
            className="border border-[#16243d]/20 p-2 disabled:opacity-40"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            type="button"
            onClick={() => setPage(value => Math.min(totalPages, value + 1))}
            disabled={page >= totalPages}
            aria-label="Next suggestions page"
            className="border border-[#16243d]/20 p-2 disabled:opacity-40"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}

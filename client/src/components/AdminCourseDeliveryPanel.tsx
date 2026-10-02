import { useMemo, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAdminTableState } from "@/hooks/useAdminTableState";

export default function AdminCourseDeliveryPanel() {
  const table = useAdminTableState("course-delivery", {
    search: "",
    status: "all",
    page: 1,
  });
  const { state, setValue } = table;
  const [step, setStep] = useState("all");
  const setSearch = (value: string) => setValue("search", value);
  const setStatus = (value: string) => setValue("status", value);
  const setPage = (value: number | ((prev: number) => number)) =>
    setValue("page", value);
  const input = useMemo(
    () => ({
      search: state.search.trim() || undefined,
      status: state.status,
      step,
      limit: 100,
      offset: 0,
    }),
    [state.search, state.status, step]
  );
  const outcomes = trpc.admin.courseDeliveryOutcomes.useQuery(input, {
    retry: false,
    refetchInterval: 15000,
  });
  const rows = outcomes.data ?? [];
  return (
    <section className="mt-8 border border-[#16243d]/15 bg-white/55 p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow text-[#b8860b]">Delivery observatory</p>
          <h2 className="display mt-2 text-2xl">Course result handoffs.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#475569]">
            Monitor learner email, organization-review requests, and
            social-image outcomes without exposing report contents.
          </p>
        </div>
        <RefreshCw
          size={17}
          className={
            outcomes.isFetching
              ? "animate-spin text-[#b8860b]"
              : "text-[#b8860b]"
          }
          aria-label="Delivery outcomes refresh automatically"
        />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <label className="relative text-[10px] font-black uppercase tracking-[.12em] text-[#475569]">
          <Search
            size={14}
            className="absolute bottom-3 left-3 text-[#b8860b]"
          />
          <span className="sr-only">Search recipients</span>
          <input
            value={state.search}
            onChange={event => setSearch(event.target.value)}
            className="w-full border border-[#16243d]/20 bg-[#f7f3e8] py-3 pl-9 pr-3 text-sm font-normal normal-case tracking-normal"
            placeholder="Search email or organization"
          />
        </label>
        <label className="text-[10px] font-black uppercase tracking-[.12em] text-[#475569]">
          Step
          <select
            value={step}
            onChange={event => setStep(event.target.value)}
            className="mt-2 w-full border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-3 text-sm font-normal normal-case tracking-normal"
          >
            <option value="all">All steps</option>
            <option value="email">Email</option>
            <option value="organization">Organization</option>
            <option value="social">Social image</option>
          </select>
        </label>
        <label className="text-[10px] font-black uppercase tracking-[.12em] text-[#475569]">
          Status
          <select
            value={state.status}
            onChange={event => setStatus(event.target.value)}
            className="mt-2 w-full border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-3 text-sm font-normal normal-case tracking-normal"
          >
            <option value="all">All statuses</option>
            <option value="sent">Sent</option>
            <option value="delivered">Delivered</option>
            <option value="shared">Shared</option>
            <option value="downloaded">Downloaded</option>
            <option value="failed">Failed</option>
          </select>
        </label>
      </div>
      {outcomes.isLoading ? (
        <p className="mt-5 text-sm text-[#475569]">
          Loading delivery outcomes…
        </p>
      ) : rows.length === 0 ? (
        <p className="mt-5 border border-dashed border-[#16243d]/15 p-4 text-sm text-[#475569]">
          No delivery outcomes match the selected filters.
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead>
              <tr className="border-b border-[#16243d]/15 text-[10px] font-black uppercase tracking-[.12em] text-[#475569]">
                <th className="px-3 py-3">Step</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Recipient</th>
                <th className="px-3 py-3">Recorded</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} className="border-b border-[#16243d]/10">
                  <td className="px-3 py-3 font-semibold text-[#b8860b]">
                    {row.step}
                  </td>
                  <td className="px-3 py-3">{row.status}</td>
                  <td className="px-3 py-3">
                    {row.organizationName || row.recipientEmail || "Personal"}
                  </td>
                  <td className="px-3 py-3 text-[#475569]">
                    {new Date(row.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}


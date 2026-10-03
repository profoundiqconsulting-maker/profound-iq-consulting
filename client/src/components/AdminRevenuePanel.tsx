import { trpc } from "@/lib/trpc";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";

function kes(value: number) {
  return `KES ${value.toLocaleString("en-KE")}`;
}

export default function AdminRevenuePanel() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const input = useMemo(
    () => ({ fromDate: fromDate || undefined, toDate: toDate || undefined }),
    [fromDate, toDate]
  );
  const report = trpc.admin.revenueReport.useQuery(input, {
    retry: false,
    refetchInterval: 30000,
  });
  const setPreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    setFromDate(start.toISOString().slice(0, 10));
    setToDate(end.toISOString().slice(0, 10));
  };
  const clearDates = () => {
    setFromDate("");
    setToDate("");
  };
  const data = report.data;
  return (
    <section
      className="mt-10 border border-[#16243d]/15 bg-white/45 p-5 sm:p-6"
      aria-labelledby="revenue-title"
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow flex items-center gap-2 text-[#b8860b]">
            <BarChart3 size={13} /> Revenue observatory
          </p>
          <h2 id="revenue-title" className="display mt-3 text-3xl">
            Collected revenue.
          </h2>
          <p className="mt-2 text-sm text-[#475569]">
            Successful Paystack payments across assessments, CareerPath, and
            professional courses.
          </p>
        </div>
        <span className="text-xs font-bold uppercase tracking-[.12em] text-[#475569]">
          Admin only
        </span>
      </div>
      <div className="mt-6 flex flex-wrap items-end gap-2">
        <label className="text-[10px] font-black uppercase tracking-[.1em] text-[#475569]">
          From
          <input
            id="revenue-from-date"
            name="revenueFromDate"
            type="date"
            value={fromDate}
            onChange={event => setFromDate(event.target.value)}
            className="mt-1 border border-[#16243d]/20 bg-[#f7f3e8] px-2 py-2 text-xs font-normal tracking-normal text-[#16243d]"
            aria-label="Revenue from date"
          />
        </label>
        <label className="text-[10px] font-black uppercase tracking-[.1em] text-[#475569]">
          To
          <input
            id="revenue-to-date"
            name="revenueToDate"
            type="date"
            value={toDate}
            onChange={event => setToDate(event.target.value)}
            className="mt-1 border border-[#16243d]/20 bg-[#f7f3e8] px-2 py-2 text-xs font-normal tracking-normal text-[#16243d]"
            aria-label="Revenue to date"
          />
        </label>
        <button
          type="button"
          onClick={() => setPreset(7)}
          className="border border-[#16243d]/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em]"
        >
          Last 7 days
        </button>
        <button
          type="button"
          onClick={() => setPreset(30)}
          className="border border-[#16243d]/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em]"
        >
          Last 30 days
        </button>
        <button
          type="button"
          onClick={clearDates}
          className="px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] text-[#475569]"
        >
          Clear
        </button>
      </div>
      {report.isLoading ? (
        <div className="mt-8 flex items-center gap-2 text-sm text-[#475569]">
          <RefreshCw size={15} className="animate-spin" /> Loading revenue
          report…
        </div>
      ) : report.isError ? (
        <div className="mt-8 border-l-2 border-red-700 bg-red-50 p-4 text-sm text-red-900">
          Unable to load revenue data. Please refresh and try again.
        </div>
      ) : data ? (
        <>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="border border-[#16243d]/10 bg-[#f7f3e8] p-4">
              <p className="text-[10px] font-black uppercase tracking-[.1em] text-[#475569]">
                Total collected
              </p>
              <p className="mt-2 text-2xl font-bold text-[#16243d]">
                {kes(data.totalRevenueKes)}
              </p>
            </div>
            <div className="border border-[#16243d]/10 bg-[#f7f3e8] p-4">
              <p className="text-[10px] font-black uppercase tracking-[.1em] text-[#475569]">
                Successful payments
              </p>
              <p className="mt-2 text-2xl font-bold text-[#16243d]">
                {data.transactionCount}
              </p>
            </div>
            <div className="border border-[#16243d]/10 bg-[#f7f3e8] p-4">
              <p className="text-[10px] font-black uppercase tracking-[.1em] text-[#475569]">
                Average payment
              </p>
              <p className="mt-2 text-2xl font-bold text-[#16243d]">
                {kes(data.averageTransactionKes)}
              </p>
            </div>
          </div>
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <div>
              <h3 className="display text-2xl">By service.</h3>
              <div className="mt-4 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.bySource}
                    margin={{ top: 8, right: 8, bottom: 8, left: -20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#16243d20" />
                    <XAxis dataKey="source" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(value) => kes(Number(value ?? 0))}
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--popover-foreground)",
                        color: "var(--popover-foreground)",
                        fontSize: 12,
                      }}
                    />
                    <Bar
                      dataKey="revenueKes"
                      fill="#c9a34e"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <h3 className="display text-2xl">Daily trend.</h3>
              <div className="mt-4 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data.trend}
                    margin={{ top: 8, right: 8, bottom: 8, left: -20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#16243d20" />
                    <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(value) => kes(Number(value ?? 0))}
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--popover-foreground)",
                        color: "var(--popover-foreground)",
                        fontSize: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenueKes"
                      stroke="#16243d"
                      strokeWidth={2}
                      dot={{ r: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}



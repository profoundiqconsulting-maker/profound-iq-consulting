import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const statusOptions = [
  "all",
  "pending",
  "failed",
  "exception",
  "refunded",
  "paid",
] as const;
type Status = (typeof statusOptions)[number];

export default function AdminPaymentExceptionsPanel() {
  const [status, setStatus] = useState<Status>("pending");
  const [search, setSearch] = useState("");
  const input = { status, search: search.trim() || undefined, limit: 100 };
  const payments = trpc.admin.coursePaymentExceptions.useQuery(input, {
    retry: false,
    refetchInterval: 30000,
  });
  const utils = trpc.useUtils();
  const reconcile = trpc.admin.reconcileCoursePayment.useMutation({
    onSuccess: result => {
      void utils.admin.coursePaymentExceptions.invalidate();
      toast.success(
        result.reconciled ? "Payment record updated" : "Payment needs review",
        {
          description:
            result.stage.lastError ??
            "The reconciliation status has been refreshed.",
        }
      );
    },
    onError: error =>
      toast.error("Reconciliation failed", { description: error.message }),
  });
  const recentLog = trpc.admin.paymentReconciliationLog.useQuery(
    { limit: 50 },
    { refetchInterval: 30000 }
  );
  const reconcileStale = trpc.admin.reconcileStalePayments.useMutation({
    onSuccess: result => {
      void utils.admin.coursePaymentExceptions.invalidate();
      void recentLog.refetch();
      toast.success(
        `Reconciliation run — ${result.paid} paid, ${result.failed} failed, ${result.errors.length} errors, ${result.checked} checked`
      );
    },
    onError: error =>
      toast.error("Reconciliation failed", { description: error.message }),
  });

  return (
    <section className="mt-10 border border-[#c9a34e]/60 bg-[#fffaf0] p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-4 border-b border-[#16243d]/10 pb-5 lg:flex-row lg:items-end">
        <div>
          <p className="eyebrow flex items-center gap-2 text-[#a27e2e]">
            <ShieldCheck size={13} /> Payments / exception control
          </p>
          <h2 className="display mt-3 text-3xl">Reconcile the edges.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#657084]">
            Review pending or mismatched staged transactions, verify them
            against Paystack, and keep course access aligned with confirmed
            payment evidence.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void payments.refetch()}
          className="inline-flex items-center gap-2 border border-[#16243d]/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] hover:border-[#c9a34e]"
        >
          <RefreshCw
            size={13}
            className={payments.isFetching ? "animate-spin" : ""}
          />{" "}
          Refresh
        </button>
        <button
          type="button"
          onClick={() => void reconcileStale.mutate({})}
          disabled={reconcileStale.isPending}
          className="inline-flex items-center gap-2 border border-[#16243d]/25 bg-[#16243d] px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] text-[#f7f3e8] disabled:opacity-60"
        >
          <ShieldCheck size={13} /> Run reconciliation
        </button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {(["total", "pending", "failed", "exception", "paid"] as const).map(
          key => (
            <button
              type="button"
              key={key}
              onClick={() =>
                setStatus(key === "total" ? "all" : (key as Status))
              }
              className={`border p-3 text-left ${status === (key === "total" ? "all" : key) ? "border-[#c9a34e] bg-[#ead9ae]/40" : "border-[#16243d]/10 bg-white/60"}`}
            >
              <p className="text-[9px] font-black uppercase tracking-[.12em] text-[#657084]">
                {key}
              </p>
              <p className="mt-1 display text-2xl">
                {payments.data?.summary[key === "total" ? "total" : key] ?? 0}
              </p>
            </button>
          )
        )}
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <Search size={15} className="absolute left-3 top-3 text-[#657084]" />
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search learner, course, or Paystack reference"
            className="w-full border border-[#16243d]/15 bg-white/70 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#c9a34e]"
          />
        </label>
        <select
          value={status}
          onChange={event => setStatus(event.target.value as Status)}
          className="border border-[#16243d]/15 bg-white/70 px-3 py-2.5 text-sm outline-none focus:border-[#c9a34e]"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="exception">Exception</option>
          <option value="refunded">Refunded</option>
          <option value="paid">Paid</option>
        </select>
      </div>
      {payments.isLoading ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-[#657084]">
          <RefreshCw size={15} className="animate-spin text-[#a27e2e]" />{" "}
          Loading payment records…
        </div>
      ) : payments.isError ? (
        <div className="mt-6 border-l-2 border-red-700 bg-red-50 p-4 text-sm text-red-900">
          Unable to load payment exceptions. Refresh and try again.
        </div>
      ) : payments.data?.rows.length ? (
        <div className="mt-6 space-y-3">
          {payments.data.rows.map(({ stage, enrollment }) => (
            <article
              key={stage.id}
              className="border border-[#16243d]/10 bg-white/70 p-4"
            >
              <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 text-[9px] font-black uppercase tracking-[.1em] ${stage.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-800" : stage.paymentStatus === "failed" ? "bg-red-100 text-red-800" : "bg-[#ead9ae] text-[#7d5e1e]"}`}
                    >
                      {stage.paymentStatus === "paid" ? (
                        <CheckCircle2 size={12} />
                      ) : stage.paymentStatus === "failed" ? (
                        <XCircle size={12} />
                      ) : (
                        <AlertTriangle size={12} />
                      )}
                      {stage.paymentStatus}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[.12em] text-[#a27e2e]">
                      Stage {stage.stage} / 4
                    </span>
                  </div>
                  <h3 className="display mt-2 text-2xl">{enrollment.name}</h3>
                  <p className="mt-1 text-sm text-[#657084]">
                    {enrollment.email} · {enrollment.courseSlug}
                  </p>
                </div>
                <div className="text-left lg:text-right">
                  <p className="display text-2xl">
                    KES {stage.amountKes.toLocaleString()}
                  </p>
                  <p className="mt-1 break-all text-[10px] text-[#657084]">
                    {stage.paystackReference ?? "No reference yet"}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 border-t border-[#16243d]/10 pt-4 text-xs text-[#657084] sm:grid-cols-3">
                <span>
                  Initialized:{" "}
                  {stage.initializedAt
                    ? new Date(stage.initializedAt).toLocaleString()
                    : "Not initialized"}
                </span>
                <span>
                  Checked:{" "}
                  {stage.lastCheckedAt
                    ? new Date(stage.lastCheckedAt).toLocaleString()
                    : "Not checked"}
                </span>
                <span>
                  {stage.lastError ?? "No exception message recorded."}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={
                    reconcile.isPending ||
                    !stage.paystackReference ||
                    stage.paymentStatus === "paid"
                  }
                  onClick={() =>
                    reconcile.mutate({ stageId: stage.id, action: "verify" })
                  }
                  className="inline-flex items-center gap-2 bg-[#16243d] px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] text-[#f7f3e8] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ShieldCheck size={13} /> Verify with Paystack
                </button>
                <button
                  type="button"
                  disabled={
                    reconcile.isPending || stage.paymentStatus === "exception"
                  }
                  onClick={() =>
                    reconcile.mutate({
                      stageId: stage.id,
                      action: "mark_exception",
                      note: "Flagged for manual admin review.",
                    })
                  }
                  className="border border-[#16243d]/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] hover:border-[#c9a34e] disabled:opacity-50"
                >
                  Flag exception
                </button>
                <button
                  type="button"
                  disabled={
                    reconcile.isPending || stage.paymentStatus === "pending"
                  }
                  onClick={() =>
                    reconcile.mutate({
                      stageId: stage.id,
                      action: "reset_pending",
                      note: "Returned to pending for follow-up.",
                    })
                  }
                  className="border border-[#16243d]/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] hover:border-[#c9a34e] disabled:opacity-50"
                >
                  Return to pending
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 border border-dashed border-[#16243d]/20 bg-white/55 p-5 text-sm text-[#657084]">
          No payment records match this view.
        </div>
      )}
      {recentLog.isError ? (
        <p className="mt-8 text-xs text-red-600">
          Could not load reconciliation history.
        </p>
      ) : (
        <div className="mt-8 border-t border-[#16243d]/10 pt-6">
          <p className="eyebrow flex items-center gap-2 text-[#a27e2d]">
            <Clock size={13} /> Reconciliation activity
          </p>
          {recentLog.data?.length === 0 && !recentLog.isLoading ? (
            <p className="mt-2 text-xs text-[#657084]">
              No reconciliation actions recorded yet.
            </p>
          ) : (
            <div className="mt-3 -mx-2 overflow-x-auto">
              <table className="exec-table min-w-[380px] text-left text-xs">
                <thead>
                  <tr>
                    <th className="px-2 py-1 text-[10px] uppercase text-[#657084]">
                      When
                    </th>
                    <th className="px-2 py-1 text-[10px] uppercase text-[#657084]">
                      Operator
                    </th>
                    <th className="px-2 py-1 text-[10px] uppercase text-[#657084]">
                      Action
                    </th>
                    <th className="px-2 py-1 text-[10px] uppercase text-[#657084]">
                      Outcome
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(recentLog.data ?? []).map(entry => (
                    <tr key={entry.id}>
                      <td className="px-2 py-1 align-top">
                        {new Date(entry.createdAt).toLocaleString()}
                      </td>
                      <td className="px-2 py-1 align-top">
                        {entry.operatorEmail ??
                          entry.operatorName ??
                          entry.operatorOpenId ??
                          "—"}
                      </td>
                      <td className="px-2 py-1 align-top">{entry.action}</td>
                      <td className="px-2 py-1 align-top">
                        {entry.outcome}
                        {entry.note ? ` — ${entry.note}` : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {recentLog.isLoading && (
            <p className="mt-3 flex items-center gap-2 text-xs text-[#657084]">
              <RefreshCw size={12} className="animate-spin" /> Loading…
            </p>
          )}
        </div>
      )}
    </section>
  );
}

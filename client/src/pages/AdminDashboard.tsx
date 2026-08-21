import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { AlertCircle, ArrowLeft, CheckCircle2, Clock3, Filter, LockKeyhole, RefreshCw, ShieldCheck, Users, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";

function statusLabel(status: string) { return status === "paid" ? "Paid" : "Pending"; }

export function toLocalDateKey(value: Date | string | number) {
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

type PaymentFilter = "all" | "paid" | "pending";
type ScoreFilter = "all" | "high" | "mid" | "developing" | "locked";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const overview = trpc.assessment.adminOverview.useQuery(undefined, { enabled: Boolean(user?.role === "admin"), retry: false });
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filteredAttempts = useMemo(() => {
    if (!overview.data) return [];
    return overview.data.attempts.filter((attempt) => {
      const createdAtKey = toLocalDateKey(attempt.createdAt);
      const matchesPayment = paymentFilter === "all" || (paymentFilter === "paid" ? attempt.paymentStatus === "paid" : attempt.paymentStatus !== "paid");
      const matchesFrom = !fromDate || createdAtKey >= fromDate;
      const matchesTo = !toDate || createdAtKey <= toDate;
      const score = attempt.overallScore;
      const matchesScore = scoreFilter === "all" || (scoreFilter === "locked" ? score === null : score !== null && (scoreFilter === "high" ? score >= 80 : scoreFilter === "mid" ? score >= 60 && score < 80 : score < 60));
      return matchesPayment && matchesFrom && matchesTo && matchesScore;
    });
  }, [fromDate, overview.data, paymentFilter, scoreFilter, toDate]);

  const filteredSummary = useMemo(() => ({ total: filteredAttempts.length, paid: filteredAttempts.filter((attempt) => attempt.paymentStatus === "paid").length, pending: filteredAttempts.filter((attempt) => attempt.paymentStatus !== "paid").length }), [filteredAttempts]);
  const hasFilters = paymentFilter !== "all" || scoreFilter !== "all" || Boolean(fromDate) || Boolean(toDate);
  const resetFilters = () => { setPaymentFilter("all"); setScoreFilter("all"); setFromDate(""); setToDate(""); };

  if (authLoading) return <div className="grid min-h-screen place-items-center bg-[#f7f3e8] text-[#16243d]"><RefreshCw className="animate-spin text-[#a27e2e]" /></div>;
  if (!user) return <AccessState title="Sign in required" message="This workspace is reserved for Profound IQ administrators." />;
  if (user.role !== "admin") return <AccessState title="Admin access only" message="Your account is authenticated, but it does not have permission to view assessment records." />;

  return <div className="min-h-screen bg-[#f7f3e8] text-[#16243d]">
    <header className="border-b border-[#16243d]/15 bg-[#101d35] text-[#f7f3e8]"><div className="container flex items-center justify-between py-5"><Link href="/" className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center border border-[#c9a34e]/70"><span className="text-sm font-black text-[#c9a34e]">PIQ</span></span><span className="text-[11px] font-extrabold tracking-[.18em]">PROFOUND IQ <span className="text-[#c9a34e]">/ ADMIN</span></span></Link><Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-[#c1cad7] hover:text-[#c9a34e]"><ArrowLeft size={14} /> Back to site</Link></div></header>
    <main className="container py-10 sm:py-14 lg:py-20">
      <div className="flex flex-col justify-between gap-6 border-b border-[#16243d]/20 pb-8 sm:flex-row sm:items-end"><div><p className="eyebrow text-[#a27e2e]">Private workspace / assessment intelligence</p><h1 className="display mt-4 text-5xl leading-none tracking-[-.04em] sm:text-6xl">The <em className="font-normal text-[#a27e2e]">signal</em> room.</h1><p className="mt-5 max-w-xl text-base leading-7 text-[#4a566a]">A restricted view of assessment attempts, payment status, and the score signals unlocked after verified Paystack payment.</p></div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-[#657084]"><LockKeyhole size={15} className="text-[#a27e2e]" /> Admin only</div></div>
      {overview.isLoading && <div className="mt-10 flex items-center gap-3 border-l-2 border-[#c9a34e] bg-white/50 px-5 py-4 text-sm"><RefreshCw size={16} className="animate-spin text-[#a27e2e]" /> Loading assessment records…</div>}
      {overview.isError && <div className="mt-10 flex items-start gap-3 border-l-2 border-red-700 bg-red-50 px-5 py-4 text-sm text-red-900"><AlertCircle size={18} className="mt-0.5 shrink-0" /><div><p className="font-bold">Unable to load assessment records.</p><p className="mt-1">Check the database connection and try again.</p></div></div>}
      {overview.data && <>
        <section className="mt-10 grid gap-4 sm:grid-cols-3"><Metric icon={Users} label="Matching attempts" value={filteredSummary.total} /><Metric icon={CheckCircle2} label="Verified payments" value={filteredSummary.paid} accent /><Metric icon={Clock3} label="Awaiting payment" value={filteredSummary.pending} /></section>
        <section className="mt-10 border-y border-[#16243d]/15 bg-white/35 p-5 sm:p-6"><div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><p className="eyebrow flex items-center gap-2 text-[#a27e2e]"><Filter size={13} /> Refine the register</p><p className="mt-2 text-sm text-[#657084]">Filters apply to the attempt date, payment state, and verified overall score.</p></div>{hasFilters && <button onClick={resetFilters} className="inline-flex items-center gap-2 self-start text-[10px] font-black uppercase tracking-[.14em] text-[#a27e2e] hover:text-[#16243d]"><X size={14} /> Clear filters</button>}</div><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><label className="text-[10px] font-black uppercase tracking-[.14em] text-[#657084]">Payment status<select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value as PaymentFilter)} className="mt-2 w-full border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-3 text-sm font-semibold text-[#16243d] outline-none focus:border-[#c9a34e]"><option value="all">All statuses</option><option value="paid">Paid only</option><option value="pending">Pending only</option></select></label><label className="text-[10px] font-black uppercase tracking-[.14em] text-[#657084]">Score band<select value={scoreFilter} onChange={(event) => setScoreFilter(event.target.value as ScoreFilter)} className="mt-2 w-full border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-3 text-sm font-semibold text-[#16243d] outline-none focus:border-[#c9a34e]"><option value="all">All scores</option><option value="high">80–100 · Strong</option><option value="mid">60–79 · Building</option><option value="developing">0–59 · Developing</option><option value="locked">Locked / unpaid</option></select></label><label className="text-[10px] font-black uppercase tracking-[.14em] text-[#657084]">From date<input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="mt-2 w-full border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-[11px] text-sm font-semibold text-[#16243d] outline-none focus:border-[#c9a34e]" /></label><label className="text-[10px] font-black uppercase tracking-[.14em] text-[#657084]">To date<input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="mt-2 w-full border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-[11px] text-sm font-semibold text-[#16243d] outline-none focus:border-[#c9a34e]" /></label></div></section>
        <section className="mt-12"><div className="flex items-center justify-between gap-4"><div><p className="eyebrow text-[#a27e2e]">Attempt register</p><h2 className="display mt-3 text-3xl">Recent participants</h2></div><span className="text-xs font-bold uppercase tracking-[.12em] text-[#657084]">Showing {filteredAttempts.length} of {overview.data.attempts.length}</span></div>
          {filteredAttempts.length === 0 ? <div className="mt-6 border border-dashed border-[#16243d]/25 p-8 text-sm text-[#657084]">No attempts match the current filters. Try broadening the date range or clearing a filter.</div> : <div className="mt-6 overflow-hidden border border-[#16243d]/15 bg-white/45"><div className="overflow-x-auto"><table className="w-full min-w-[760px] border-collapse text-left"><thead className="bg-[#16243d] text-[#f7f3e8]"><tr><th className="px-5 py-4 text-[10px] font-black uppercase tracking-[.14em]">Participant</th><th className="px-5 py-4 text-[10px] font-black uppercase tracking-[.14em]">Attempt date</th><th className="px-5 py-4 text-[10px] font-black uppercase tracking-[.14em]">Payment</th><th className="px-5 py-4 text-[10px] font-black uppercase tracking-[.14em]">Score</th><th className="px-5 py-4 text-[10px] font-black uppercase tracking-[.14em]">Paystack reference</th></tr></thead><tbody>{filteredAttempts.map((attempt) => <tr key={attempt.id} className="border-t border-[#16243d]/10"><td className="px-5 py-5"><p className="font-bold">{attempt.name}</p><p className="mt-1 text-xs text-[#657084]">{attempt.email}</p></td><td className="px-5 py-5 text-sm text-[#4a566a]">{new Date(attempt.createdAt).toLocaleString()}</td><td className="px-5 py-5"><span className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.1em] ${attempt.paymentStatus === "paid" ? "text-emerald-800" : "text-[#a27e2e]"}`}><span className={`h-2 w-2 rounded-full ${attempt.paymentStatus === "paid" ? "bg-emerald-600" : "bg-[#c9a34e]"}`} />{statusLabel(attempt.paymentStatus)}</span></td><td className="px-5 py-5">{attempt.overallScore === null ? <span className="text-sm text-[#657084]">Locked</span> : <div><span className="display text-2xl text-[#a27e2e]">{attempt.overallScore}</span><span className="ml-2 text-xs text-[#657084]">{attempt.overallBand}</span></div>}</td><td className="max-w-[180px] truncate px-5 py-5 font-mono text-xs text-[#657084]">{attempt.paystackReference ?? "—"}</td></tr>)}</tbody></table></div></div>}
        </section>
        <div className="mt-10 flex items-start gap-3 border-l-2 border-[#c9a34e] bg-[#16243d] p-5 text-sm leading-6 text-[#c1cad7]"><ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#c9a34e]" /><p><strong className="text-[#f7f3e8]">Privacy boundary.</strong> This view intentionally excludes raw answers and full reports. Use participant contact details only for legitimate follow-up connected to the assessment.</p></div>
      </>}
    </main>
  </div>;
}

function Metric({ icon: Icon, label, value, accent = false }: { icon: typeof Users; label: string; value: number; accent?: boolean }) { return <div className={`border-t-2 ${accent ? "border-[#c9a34e]" : "border-[#16243d]/30"} bg-white/45 p-5`}><Icon size={18} className={accent ? "text-[#a27e2e]" : "text-[#657084]"} /><p className="mt-6 text-xs font-black uppercase tracking-[.14em] text-[#657084]">{label}</p><p className="display mt-2 text-4xl">{value}</p></div>; }

function AccessState({ title, message }: { title: string; message: string }) { return <div className="grid min-h-screen place-items-center bg-[#f7f3e8] px-6 text-[#16243d]"><div className="max-w-md border-t-2 border-[#c9a34e] bg-white/50 p-8 text-center"><LockKeyhole className="mx-auto text-[#a27e2e]" /><h1 className="display mt-5 text-4xl">{title}</h1><p className="mt-4 text-sm leading-6 text-[#657084]">{message}</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><button onClick={() => startLogin()} className="inline-flex items-center justify-center gap-2 bg-[#16243d] px-5 py-4 text-[11px] font-black uppercase tracking-[.15em] text-[#f7f3e8]">Sign in <span aria-hidden="true">→</span></button><Link href="/" className="inline-flex items-center justify-center gap-2 border border-[#16243d]/25 px-5 py-4 text-[11px] font-black uppercase tracking-[.15em]">Return to site <ArrowLeft size={15} /></Link></div></div></div>; }

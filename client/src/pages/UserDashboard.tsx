import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { formatReportEmailSentAt } from "@shared/emailStatus";
import { AlertCircle, ArrowLeft, CheckCircle2, Clock3, Download, FileText, LockKeyhole, Loader2, Mail, MailCheck, MailWarning, RefreshCw, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function UserDashboard() {
  const { user, loading: authLoading } = useAuth();
  const history = trpc.dashboard.mine.useQuery(undefined, { enabled: Boolean(user), retry: false });
  const utils = trpc.useUtils();
  const resendReportEmail = trpc.dashboard.resendReportEmail.useMutation({
    onSuccess: () => { toast.success("Report email resent", { description: "A fresh PDF copy is on its way to your inbox." }); void utils.dashboard.mine.invalidate(); },
    onError: (error) => toast.error("Could not resend report email", { description: error.message }),
  });
  const downloadReport = trpc.dashboard.downloadReport.useMutation({
    onError: (error) => toast.error("Report download failed", { description: error.message }),
  });

  const handleResend = async (attemptId: number) => {
    try { await resendReportEmail.mutateAsync({ attemptId }); } catch { /* The mutation callback provides the user-facing error toast. */ }
  };

  const handleDownload = async (attemptId: number) => {
    try {
      const result = await downloadReport.mutateAsync({ attemptId });
      const bytes = Uint8Array.from(atob(result.data), (character) => character.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: result.contentType }));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = result.filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast.success("Report downloaded", { description: "Your PDF is ready to review or share." });
    } catch {
      // The mutation callback provides the user-facing error toast.
    }
  };

  if (authLoading) return <LoadingState />;
  if (!user) return <AccessState />;

  return <div className="min-h-screen bg-[#f7f3e8] text-[#16243d]"><header className="border-b border-[#16243d]/15 bg-[#101d35] text-[#f7f3e8]"><div className="container flex items-center justify-between py-5"><Link href="/" className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center border border-[#c9a34e]/70"><span className="text-sm font-black text-[#c9a34e]">PIQ</span></span><span className="text-[11px] font-extrabold tracking-[.18em]">PROFOUND IQ <span className="text-[#c9a34e]">/ MY SPACE</span></span></Link><div className="flex items-center gap-4"><Link href="/settings" className="text-[10px] font-black uppercase tracking-[.16em] text-[#c1cad7] hover:text-[#c9a34e]">Settings</Link><Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-[#c1cad7] hover:text-[#c9a34e]"><ArrowLeft size={14} /> Back to site</Link></div></div></header><main className="container py-10 sm:py-14 lg:py-20"><div className="border-b border-[#16243d]/20 pb-8"><p className="eyebrow text-[#a27e2e]">Private workspace / personal development</p><h1 className="display mt-4 text-5xl leading-none tracking-[-.04em] sm:text-6xl">Your <em className="font-normal text-[#a27e2e]">pathway</em>.</h1><p className="mt-5 max-w-xl text-base leading-7 text-[#4a566a]">Review your Profound IQ assessment activity and return to any report unlocked through verified payment.</p></div>{history.isLoading && <div className="mt-10 flex items-center gap-3 border-l-2 border-[#c9a34e] bg-white/50 px-5 py-4 text-sm"><RefreshCw size={16} className="animate-spin text-[#a27e2e]" /> Loading your assessment history…</div>}{history.isError && <div className="mt-10 flex items-start gap-3 border-l-2 border-red-700 bg-red-50 px-5 py-4 text-sm text-red-900"><AlertCircle size={18} className="mt-0.5 shrink-0" /><div><p className="font-bold">Unable to load your history.</p><p className="mt-1">Please try again shortly.</p></div></div>}{history.data && <><section className="mt-10 grid gap-4 sm:grid-cols-3"><Metric icon={FileText} label="Assessments" value={history.data.length} /><Metric icon={CheckCircle2} label="Reports unlocked" value={history.data.filter((item) => item.paymentStatus === "paid").length} accent /><Metric icon={Clock3} label="Pending payment" value={history.data.filter((item) => item.paymentStatus !== "paid").length} /></section><section className="mt-12"><p className="eyebrow text-[#a27e2e]">Your assessment history</p><h2 className="display mt-3 text-3xl">Keep the signal moving.</h2>{history.data.length === 0 ? <div className="mt-6 border border-dashed border-[#16243d]/25 p-8 text-sm leading-6 text-[#657084]">No assessment is linked to {user.email}. Start the KES 200 self-assessment to create your first development signal.</div> : <div className="mt-6 space-y-4">{history.data.map((item) => <article key={item.id} className="border border-[#16243d]/15 bg-white/45 p-5 sm:p-6"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><p className="text-xs font-black uppercase tracking-[.14em] text-[#657084]">Assessment #{item.id} · {new Date(item.createdAt).toLocaleDateString()}</p>{item.paymentStatus === "paid" ? <div className="mt-3 flex items-baseline gap-3"><span className="display text-4xl text-[#a27e2e]">{item.overallScore}</span><span className="text-sm text-[#657084]">{item.overallBand}</span></div> : <p className="mt-3 text-sm font-semibold text-[#657084]">Report locked until payment is verified.</p>}</div><div className="flex flex-wrap items-center gap-3">{item.paymentStatus === "paid" ? <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.1em] text-emerald-800"><span className="h-2 w-2 rounded-full bg-emerald-600" /> Paid</span> : <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.1em] text-[#a27e2e]"><span className="h-2 w-2 rounded-full bg-[#c9a34e]" /> Pending</span>}{item.paymentStatus === "paid" && <><ReportEmailStatus status={item.reportEmailStatus} sentAt={item.reportEmailSentAt} />{item.reportEmailStatus !== "sent" && item.reportEmailStatus !== "sending" && <button type="button" onClick={() => handleResend(item.id)} disabled={resendReportEmail.isPending} className="inline-flex items-center gap-2 border border-[#a27e2e]/40 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[#7d5e1e] disabled:cursor-wait disabled:opacity-60" aria-label={`Resend PDF report email for assessment ${item.id}`}>{resendReportEmail.isPending ? <MailWarning size={13} className="animate-[spin_1.4s_linear_infinite] motion-reduce:animate-none" aria-hidden="true" /> : <MailWarning size={13} aria-hidden="true" />} {resendReportEmail.isPending ? "Resending…" : "Resend email"}</button>}</>}{item.paymentStatus === "paid" && item.paystackReference && <><Link href={`/assessment?reference=${item.paystackReference}`} className="inline-flex items-center gap-2 bg-[#16243d] px-4 py-3 text-[10px] font-black uppercase tracking-[.14em] text-[#f7f3e8]">View report <ArrowLeft className="rotate-180" size={14} /></Link><button type="button" onClick={() => handleDownload(item.id)} disabled={downloadReport.isPending} className="inline-flex items-center gap-2 border border-[#16243d]/25 px-4 py-3 text-[10px] font-black uppercase tracking-[.14em] disabled:cursor-wait disabled:opacity-60" aria-label={`Download PDF report for assessment ${item.id}`}>{downloadReport.isPending ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} {downloadReport.isPending ? "Preparing…" : "Download PDF"}</button></>}</div></div></article>)}</div>}</section><div className="mt-10 flex items-start gap-3 border-l-2 border-[#c9a34e] bg-[#16243d] p-5 text-sm leading-6 text-[#c1cad7]"><ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#c9a34e]" /><p><strong className="text-[#f7f3e8]">Your privacy.</strong> This dashboard is scoped to your authenticated account email. It does not display raw answers to other users or expose your data publicly.</p></div></>}</main></div>;
}

function ReportEmailStatus({ status, sentAt }: { status?: string | null; sentAt?: Date | string | null }) {
  const formattedSentAt = formatReportEmailSentAt(sentAt);
  if (status === "sent") return <span className="inline-flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[.1em] text-emerald-800" title={formattedSentAt ? `Report email sent ${formattedSentAt}` : "Report email sent"}><MailCheck size={14} aria-hidden="true" /> Email sent{formattedSentAt && <span className="inline-flex items-center gap-1 font-medium normal-case tracking-normal text-[#657084]"><Mail size={12} aria-hidden="true" /> Last emailed {formattedSentAt}</span>}<span className="sr-only">{formattedSentAt ? `, last emailed ${formattedSentAt}` : ""}</span></span>;
  if (status === "sending") return <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.1em] text-[#a27e2e]" title="Report email is being prepared"><Clock3 size={14} aria-hidden="true" /> Email in progress</span>;
  return <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.1em] text-[#a27e2e]" title="Report email is pending and will be retried"><MailWarning size={14} aria-hidden="true" /> Email pending</span>;
}
function Metric({ icon: Icon, label, value, accent = false }: { icon: typeof FileText; label: string; value: number; accent?: boolean }) { return <div className={`border-t-2 ${accent ? "border-[#c9a34e]" : "border-[#16243d]/30"} bg-white/45 p-5`}><Icon size={18} className={accent ? "text-[#a27e2e]" : "text-[#657084]"} /><p className="mt-6 text-xs font-black uppercase tracking-[.14em] text-[#657084]">{label}</p><p className="display mt-2 text-4xl">{value}</p></div>; }
function LoadingState() { return <div className="grid min-h-screen place-items-center bg-[#f7f3e8] text-[#16243d]"><RefreshCw className="animate-spin text-[#a27e2e]" /></div>; }
function AccessState() { return <div className="grid min-h-screen place-items-center bg-[#f7f3e8] px-6 text-[#16243d]"><div className="max-w-md border-t-2 border-[#c9a34e] bg-white/50 p-8 text-center"><LockKeyhole className="mx-auto text-[#a27e2e]" /><h1 className="display mt-5 text-4xl">Sign in to continue</h1><p className="mt-4 text-sm leading-6 text-[#657084]">Your personal assessment history is private to your authenticated account.</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><button onClick={() => startLogin()} className="bg-[#16243d] px-5 py-4 text-[11px] font-black uppercase tracking-[.15em] text-[#f7f3e8]">Sign in →</button><Link href="/" className="border border-[#16243d]/25 px-5 py-4 text-[11px] font-black uppercase tracking-[.15em]">Return to site</Link></div></div></div>; }

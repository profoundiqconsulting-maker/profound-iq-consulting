import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { TransformationNav } from "@/components/TransformationNav";

export default function CoursePaymentSuccess() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const params = new URLSearchParams(window.location.search);
  const reference = params.get("reference");
  const courseSlug = params.get("course") || "";
  const verify = trpc.course.verifyStagePayment.useMutation();
  const state = trpc.course.state.useQuery(undefined, { enabled: Boolean(user), retry: false });
  const [status, setStatus] = useState<"verifying" | "success" | "error">(reference ? "verifying" : "error");

  useEffect(() => {
    if (!user || !reference || verify.isPending || status !== "verifying") return;
    verify.mutate({ reference }, { onSuccess: () => { setStatus("success"); void state.refetch(); }, onError: () => setStatus("error") });
  }, [user, reference, status]);

  const enrollment = state.data?.find((record) => record.enrollment.courseSlug === courseSlug);
  const paidStages = enrollment?.stages.filter((stage) => stage.paymentStatus === "paid").length ?? 0;

  if (loading || (user && status === "verifying")) return <div className="min-h-screen bg-[#f7f3e8] text-[#16243d]"><TransformationNav active="assessment" /><main className="container grid min-h-[70vh] place-items-center py-16"><div className="text-center"><Loader2 className="mx-auto animate-spin text-[#a27e2e]" size={34} /><p className="eyebrow mt-5 text-[#a27e2e]">Secure verification</p><h1 className="display mt-3 text-4xl">Confirming your payment.</h1><p className="mt-4 text-sm text-[#657084]">We are checking the Paystack transaction before unlocking your next course step.</p></div></main></div>;

  if (!user) return <div className="min-h-screen bg-[#f7f3e8] text-[#16243d]"><TransformationNav active="assessment" /><main className="container grid min-h-[70vh] place-items-center py-16"><div className="max-w-md text-center"><AlertCircle className="mx-auto text-[#a27e2e]" size={34} /><h1 className="display mt-4 text-4xl">Sign in to confirm payment.</h1><p className="mt-4 text-sm leading-6 text-[#657084]">Return to your authenticated workspace so we can securely match this payment to your course enrollment.</p><Link href={`/auth?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`} className="mt-6 inline-flex items-center gap-2 bg-[#16243d] px-5 py-3 text-xs font-black uppercase tracking-[.12em] text-[#f7f3e8]">Sign in <ArrowRight size={14} /></Link></div></main></div>;

  if (status === "error") return <div className="min-h-screen bg-[#f7f3e8] text-[#16243d]"><TransformationNav active="assessment" /><main className="container grid min-h-[70vh] place-items-center py-16"><div className="max-w-md text-center"><AlertCircle className="mx-auto text-red-700" size={34} /><h1 className="display mt-4 text-4xl">Payment needs another check.</h1><p className="mt-4 text-sm leading-6 text-[#657084]">We could not verify this transaction yet. Your course access has not changed. Return to the course and use the retry payment action.</p><Link href={courseSlug ? `/courses/${courseSlug}` : "/courses"} className="mt-6 inline-flex items-center gap-2 border border-[#16243d]/25 px-5 py-3 text-xs font-black uppercase tracking-[.12em]">Return to course <ArrowRight size={14} /></Link></div></main></div>;

  return <div className="min-h-screen bg-[#f7f3e8] text-[#16243d]"><TransformationNav active="assessment" /><main className="container grid min-h-[70vh] place-items-center py-16"><div className="w-full max-w-2xl border border-[#c9a34e]/60 bg-white/60 p-7 text-center shadow-sm sm:p-12"><CheckCircle2 className="mx-auto text-emerald-700" size={42} /><p className="eyebrow mt-6 text-[#a27e2e]">Payment successful</p><h1 className="display mt-3 text-5xl">Your learning path is ready.</h1><p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-[#4a566a]">Stage {Math.max(1, paidStages)} is verified. Your course dashboard is updated, and the next available learning step is now unlocked.</p><div className="mt-8 grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => setLocation(courseSlug ? `/courses/${courseSlug}` : "/dashboard")} className="inline-flex items-center justify-center gap-2 bg-[#16243d] px-5 py-3 text-xs font-black uppercase tracking-[.12em] text-[#f7f3e8]">Continue to course <ArrowRight size={14} /></button><Link href="/dashboard" className="inline-flex items-center justify-center gap-2 border border-[#16243d]/25 px-5 py-3 text-xs font-black uppercase tracking-[.12em]">Open dashboard</Link></div><p className="mt-7 text-[11px] text-[#657084]">Keep this page for your records. Your receipt and payment history are available in your dashboard.</p></div></main></div>;
}

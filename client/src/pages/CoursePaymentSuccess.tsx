import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

import { TransformationNav } from "@/components/TransformationNav";
import { startLogin } from "@/const";

export default function CoursePaymentSuccess() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  
  const params = new URLSearchParams(window.location.search);
  const reference = params.get("reference");
  const courseSlug = params.get("course") || "";
  const verify = trpc.course.verifyStagePayment.useMutation();
  const state = trpc.course.state.useQuery(undefined, {
    enabled: Boolean(user),
    retry: false,
  });
  const [attempt, setAttempt] = useState(0);
  const MAX_ATTEMPTS = 3;
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    reference ? "verifying" : "error"
  );

  const signInHref = `/auth?mode=login&returnTo=${encodeURIComponent(window.location.pathname + window.location.search + window.location.hash)}`;

  const handleSignIn = (event: React.MouseEvent) => {
    event.preventDefault();
    startLogin(
      window.location.pathname + window.location.search + window.location.hash
    );
  };

  useEffect(() => {
    if (!user || !reference || status !== "verifying" || verify.isPending)
      return;
    let cancelled = false;
    void verify.mutate(
      { reference },
      {
        onSuccess: () => {
          if (!cancelled) {
            setStatus("success");
            void state.refetch();
          }
        },
        onError: () => {
          if (cancelled) return;
          if (attempt + 1 >= MAX_ATTEMPTS) {
            setStatus("error");
          } else {
            const delay = 200 * 2 ** attempt;
            const timer = setTimeout(
              () => setAttempt(current => current + 1),
              delay
            );
            return () => clearTimeout(timer);
          }
        },
      }
    );
    return () => {
      cancelled = true;
    };
  }, [user, reference, status, attempt, verify, state]);

  const enrollment = state.data?.find(
    record => record.enrollment.courseSlug === courseSlug
  );
  const paidStages =
    enrollment?.stages.filter(stage => stage.paymentStatus === "paid").length ??
    0;

  if (loading || (user && status === "verifying"))
    return (
      <div className="min-h-screen bg-[#f7f3e8] text-[#16243d]">
        <TransformationNav active="assessment" />
        <main className="container grid min-h-[70vh] place-items-center py-16">
          <div className="text-center">
            <Loader2
              className="mx-auto animate-spin text-[#7d5e1e]"
              size={34}
            />
            <p className="eyebrow mt-5 text-[#7d5e1e]">Secure verification</p>
            <h1 className="display mt-3 text-4xl">Confirming your payment.</h1>
            <p className="mt-4 text-sm text-[#4a566a]">
              We are checking the Paystack transaction before unlocking your
              next course step.
            </p>
            <p className="mt-2 text-xs text-[#4a566a]">
              Retrying automatically… attempt {attempt + 1} of {MAX_ATTEMPTS}
            </p>
          </div>
        </main>
      </div>
    );

  if (!user)
    return (
      <div className="min-h-screen bg-[#f7f3e8] text-[#16243d]">
        <TransformationNav active="assessment" />
        <main className="container grid min-h-[70vh] place-items-center py-16">
          <div className="max-w-md text-center">
            <AlertCircle className="mx-auto text-[#7d5e1e]" size={34} />
            <h1 className="display mt-4 text-4xl">
              Sign in to confirm payment.
            </h1>
            <p className="mt-4 text-sm leading-6 text-[#4a566a]">
              Return to your authenticated workspace so we can securely match
              this payment to your course enrollment.
            </p>
            <button
              onClick={handleSignIn}
              className="mt-6 inline-flex items-center gap-2 bg-[#16243d] px-5 py-3 text-xs font-black uppercase tracking-[.12em] text-[#f7f3e8]"
            >
              {"Sign in"} <ArrowRight size={14} />
            </button>
          </div>
        </main>
      </div>
    );

  if (status === "error")
    return (
      <div className="min-h-screen bg-[#f7f3e8] text-[#16243d]">
        <TransformationNav active="assessment" />
        <main className="container grid min-h-[70vh] place-items-center py-16">
          <div className="max-w-md text-center">
            <AlertCircle className="mx-auto text-red-700" size={34} />
            <h1 className="display mt-4 text-4xl">
              Payment needs another check.
            </h1>
            <p className="mt-4 text-sm leading-6 text-[#4a566a]">
              We could not verify this transaction yet. We are retrying in the
              background, or you can try again. If this still fails, your
              payment record is on file and an administrator can verify it
              manually.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setAttempt(0);
                  setStatus("verifying");
                }}
                className="inline-flex items-center justify-center gap-2 bg-[#16243d] px-5 py-3 text-xs font-black uppercase tracking-[.12em] text-[#f7f3e8]"
              >
                Retry verification
              </button>
              <Link
                href={courseSlug ? `/courses/${courseSlug}` : "/dashboard"}
                className="inline-flex items-center justify-center gap-2 border border-[#16243d]/25 px-5 py-3 text-xs font-black uppercase tracking-[.12em]"
              >
                Return to course <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </main>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f7f3e8] text-[#16243d]">
      <TransformationNav active="assessment" />
      <main className="container grid min-h-[70vh] place-items-center py-16">
        <div className="w-full max-w-2xl border border-[#c9a34e]/60 bg-white/60 p-7 text-center shadow-sm sm:p-12">
          <CheckCircle2 className="mx-auto text-emerald-800" size={42} />
          <p className="eyebrow mt-6 text-[#7d5e1e]">Payment successful</p>
          <h1 className="display mt-3 text-5xl">
            Your learning path is ready.
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-[#4a566a]">
            Stage {Math.max(1, paidStages)} is verified. Your course dashboard
            is updated, and the next available learning step is now unlocked.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() =>
                setLocation(
                  courseSlug ? `/courses/${courseSlug}` : "/dashboard"
                )
              }
              className="inline-flex items-center justify-center gap-2 bg-[#16243d] px-5 py-3 text-xs font-black uppercase tracking-[.12em] text-[#f7f3e8]"
            >
              Continue to course <ArrowRight size={14} />
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 border border-[#16243d]/25 px-5 py-3 text-xs font-black uppercase tracking-[.12em]"
            >
              Open dashboard
            </Link>
          </div>
          <p className="mt-7 text-[11px] text-[#4a566a]">
            Keep this page for your records. Your receipt and payment history
            are available in your dashboard.
          </p>
        </div>
      </main>
    </div>
  );
}

/* Profound IQ Consulting — CareerPath 4-page sequential flow
   1. Introduction: purpose, prerequisites, time commitment
   2. Assessment: strict linear module player with independent Likert responses
   3. Checkout: clean Paystack payment flow
   4. Reports: post-purchase report generation with motivational prompts
*/
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, CreditCard, Download, Loader2, Mail, MessageCircle, Share2, ShieldCheck, Sparkles, Sun } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { TransformationNav } from "@/components/TransformationNav";
import { ReportSectionTabs } from "@/components/ReportSectionTabs";
import { toast } from "sonner";
import {
  buildCareerPathReport,
  getTopCareerPathStrengths,
  type CareerPathReport,
  type CareerPathwayResult,
} from "@shared/careerPath";
import {
  paystackStateAfter,
  type PaystackCheckoutState,
} from "@shared/paystackFeedback";
import { useLocale } from "@/contexts/LocaleContext";
import PaystackInlineModal, { type PaystackInlineProduct } from "@/components/PaystackInlineModal";

type Page = "introduction" | "assessment" | "checkout" | "reports";

const scale = ["1", "2", "3", "4", "5"];

function CareerPathStepIndicator({ current }: { current: Page }) {
  const steps: Array<{ id: Page; label: string }> = [
    { id: "introduction", label: "Introduction" },
    { id: "assessment", label: "Assessment" },
    { id: "checkout", label: "Checkout" },
    { id: "reports", label: "Reports" },
  ];
  const currentIndex = steps.findIndex(step => step.id === current);
  return (
    <nav aria-label="CareerPath steps" className="border-b border-[#16243d]/10 bg-[#f7f3e8] px-5 py-3 sm:px-8">
      <ol className="mx-auto flex max-w-6xl items-center justify-between gap-2">
        {steps.map((step, index) => (
          <li key={step.id} className="flex min-w-0 flex-1 items-center gap-2">
            <span className={`flex min-w-0 items-center gap-2 text-[10px] font-black uppercase tracking-[.1em] ${current === step.id ? "text-[#16243d]" : index < currentIndex ? "text-[#a27e2e]" : "text-[#657084]"}`}>
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[10px] ${current === step.id ? "border-[#c9a34e] bg-[#c9a34e] text-[#16243d]" : index < currentIndex ? "border-[#a27e2e] text-[#a27e2e]" : "border-[#16243d]/20"}`}>
                {index + 1}
              </span>
              <span className="truncate">{step.label}</span>
            </span>
            {index < steps.length - 1 && <span className="h-px flex-1 bg-[#16243d]/10" aria-hidden="true" />}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function IntroPage({ onStart }: { onStart: () => void }) {
  const { data, isLoading } = trpc.careerPath.questions.useQuery();
  const price = data?.priceKes ?? 399;

  if (isLoading) {
    return (
      <div className="container py-16">
        <div className="flex items-center gap-3 text-sm" role="status" aria-live="polite">
          <Loader2 className="animate-spin text-[#a27e2e]" size={18} /> Preparing your CareerPath Assessment…
        </div>
      </div>
    );
  }

  return (
    <main className="container py-10 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow text-[#a27e2e]">Discover / explore / choose / grow</p>
          <h1 className="display mt-4 text-5xl leading-[.95] tracking-[-.04em] sm:text-7xl">
            Career pathway & <em className="font-normal text-[#a27e2e]">talent fit</em>.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[#4a566a]">
            A developmental assessment for Competency Based Education learners. Understand your interests, abilities, learning preferences, values, talents, and aspirations before choosing your next direction.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="border-l-2 border-[#c9a34e] px-4">
              <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#7d5e1e]">180 items</p>
              <p className="mt-1 text-sm text-[#657084]">Across nine evidence areas</p>
            </div>
            <div className="border-l-2 border-[#c9a34e] px-4">
              <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#7d5e1e]">35–45 minutes</p>
              <p className="mt-1 text-sm text-[#657084]">Complete in a quiet setting</p>
            </div>
            <div className="border-l-2 border-[#c9a34e] px-4">
              <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#7d5e1e]">KES {price}</p>
              <p className="mt-1 text-sm text-[#657084]">Secure Paystack checkout</p>
            </div>
          </div>
          <div className="mt-10 border-l-2 border-[#c9a34e] bg-[#16243d] p-5 text-[#c1cad7] sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#c9a34e]">Ready to discover your pathway?</p>
                <p className="mt-1 text-sm">This assessment is sequential. Complete all modules in order to unlock your report.</p>
              </div>
              <Button type="button" onClick={onStart} className="shrink-0 bg-[#c9a34e] text-[#16243d] hover:bg-[#e1bd5b]">
                Begin assessment <ArrowRight size={15} />
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

function AssessmentPage({ onComplete }: { onComplete: (data: { name: string; email: string; answers: Array<{ questionId: string; value: number }> }) => void }) {
  const { data, isLoading } = trpc.careerPath.questions.useQuery();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentModule, setCurrentModule] = useState(0);

  const grouped = useMemo(() => {
    if (!data?.questions) return [];
    return data.questions.reduce<Array<{ name: string; questions: typeof data.questions }>>((groups, question) => {
      const group = groups.find(item => item.name === question.module);
      if (group) group.questions.push(question);
      else groups.push({ name: question.module, questions: [question] });
      return groups;
    }, []);
  }, [data?.questions]);

  const answeredCount = data?.questions.filter(q => answers[q.id]).length ?? 0;
  const overallCompletion = data?.questions.length ? Math.round((answeredCount / data.questions.length) * 100) : 0;
  const currentGroup = grouped[currentModule];
  const currentGroupAnswered = currentGroup?.questions.filter(q => answers[q.id]).length ?? 0;
  const currentGroupComplete = currentGroup?.questions.length ? currentGroupAnswered === currentGroup.questions.length : false;
  const isLastModule = currentModule === grouped.length - 1;
  const allComplete = data?.questions.length ? answeredCount === data.questions.length : false;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentModule]);

  const canProceed = name.trim().length >= 2 && email.trim().length > 0 && email.includes("@") && consent;

  const handleNext = () => {
    if (!canProceed) {
      toast.info("Complete your details", { description: "Please enter your name, email, and consent to continue." });
      return;
    }
    if (!currentGroupComplete && !isLastModule) {
      toast.info("Complete this module", { description: "Answer all visible questions before moving forward." });
      return;
    }
    if (isLastModule) {
      if (!allComplete) {
        toast.info("Complete all questions", { description: "Please answer every question before checkout." });
        return;
      }
      onComplete({
        name: name.trim(),
        email: email.trim(),
        answers: data!.questions.map(q => ({ questionId: q.id, value: answers[q.id] })),
      });
      return;
    }
    setCurrentModule(m => m + 1);
  };

  if (isLoading) {
    return (
      <main className="container py-16">
        <div className="flex items-center gap-3 text-sm" role="status" aria-live="polite">
          <Loader2 className="animate-spin text-[#a27e2e]" size={18} /> Preparing your CareerPath Assessment...
        </div>
      </main>
    );
  }

  if (!canProceed) {
    return (
      <main className="container py-10 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow text-[#a27e2e]">Assessment workspace</p>
          <h1 className="display mt-4 text-5xl leading-[.95] tracking-[-.04em] sm:text-7xl">
            Guided pathway <em className="font-normal text-[#a27e2e]">assessment</em>.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[#4a566a]">
            Work through each module in order. There are no right or wrong answers�choose the response that best reflects you today.
          </p>
        </div>

        <section className="mx-auto mt-10 max-w-3xl border border-[#16243d]/15 bg-white/55 p-5 sm:p-8">
          <p className="eyebrow text-[#a27e2e]">Participant details</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-bold">
              Full name
              <input value={name} onChange={e => setName(e.target.value)} required minLength={2} className="mt-2 block w-full border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-3 text-sm font-normal outline-none focus:border-[#a27e2e]" placeholder="Your name" />
            </label>
            <label className="text-xs font-bold">
              Email for your report
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-2 block w-full border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-3 text-sm font-normal outline-none focus:border-[#a27e2e]" placeholder="you@example.com" />
            </label>
          </div>
          <label className="mt-5 flex items-start gap-3 text-xs leading-5 text-[#657084]">
            <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} required className="mt-1 accent-[#a27e2e]" />
            I consent to Profound IQ processing my responses to generate this educational pathway report and sending the report to the email above.
          </label>
          <div className="mt-6">
            <Button type="button" onClick={handleNext} disabled={!canProceed} className="bg-[#16243d] text-[#f7f3e8]">
              Begin assessment <ArrowRight size={15} />
            </Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <AssessmentPlayer
      data={data}
      grouped={grouped}
      currentModule={currentModule}
      setCurrentModule={setCurrentModule}
      answers={answers}
      setAnswers={setAnswers}
      currentGroup={currentGroup}
      currentGroupAnswered={currentGroupAnswered}
      currentGroupComplete={currentGroupComplete}
      isLastModule={isLastModule}
      allComplete={allComplete}
      answeredCount={answeredCount}
      overallCompletion={overallCompletion}
      onNext={handleNext}
    />
  );
}

function LikertQuestion({ question, value, onChange }: { question: { id: string; prompt: string }; value: number | undefined; onChange: (value: number) => void }) {
  return (
    <div className="border border-[#16243d]/12 bg-white/55 p-5 transition-colors hover:border-[#a27e2e]/50">
      <p className="text-sm leading-6">
        <span className="mr-2 text-xs font-black text-[#a27e2e]">{question.id.split("-").pop()}</span>
        {question.prompt}
      </p>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {scale.map(option => (
          <label key={option} className={`flex cursor-pointer flex-col items-center gap-1 border px-2 py-2 text-xs transition ${value === Number(option) ? "border-[#a27e2e] bg-[#f4e5bd] text-[#16243d]" : "border-[#16243d]/15 text-[#657084] hover:border-[#a27e2e]/60"}`}>
            <input type="radio" name={question.id} value={option} checked={value === Number(option)} onChange={() => onChange(Number(option))} className="sr-only" />
            {option}
            <span className="text-[9px]">{option === "1" ? "Low" : option === "5" ? "High" : ""}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function AssessmentPlayer({
  data,
  grouped,
  currentModule,
  setCurrentModule,
  answers,
  setAnswers,
  currentGroup,
  currentGroupAnswered,
  currentGroupComplete,
  isLastModule,
  allComplete,
  answeredCount,
  overallCompletion,
  onNext,
}: {
  data: { questions: Array<{ id: string; module: string }> } | undefined;
  grouped: Array<{ name: string; questions: Array<{ id: string; module: string }> }>;
  currentModule: number;
  setCurrentModule: (value: number | ((prev: number) => number)) => void;
  answers: Record<string, number>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  currentGroup: { name: string; questions: Array<{ id: string; module: string }> } | undefined;
  currentGroupAnswered: number;
  currentGroupComplete: boolean;
  isLastModule: boolean;
  allComplete: boolean;
  answeredCount: number;
  overallCompletion: number;
  onNext: () => void;
}) {
  return (
    <main className="container py-10 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow text-[#a27e2e]">Assessment in progress</p>
        <h1 className="display mt-4 text-5xl leading-[.95] tracking-[-.04em] sm:text-7xl">
          Guided pathway <em className="font-normal text-[#a27e2e]">assessment</em>.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-[#4a566a]">
          Work through each module in order. There are no right or wrong answers�choose the response that best reflects you today.
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-3xl">
        <div className="border-b border-[#16243d]/10 pb-4">
          <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#7d5e1e]">Assessment modules</p>
          <p className="mt-1 text-sm text-[#657084]">Work through each module in order. Answer all items in a module before moving to the next.</p>
        </div>
        <div className="sticky top-2 z-20 -mx-2 mb-5 border-y border-[#c9a34e]/40 bg-[#f7f3e8]/95 p-3 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[.12em] text-[#657084]">
            <span>Module {currentModule + 1} of {grouped.length}</span>
            <span>{overallCompletion}% complete</span>
            <span>{answeredCount}/{data?.questions.length ?? 0}</span>
          </div>
          <div className="mt-2 h-2 bg-[#16243d]/10" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={overallCompletion} aria-label={`${answeredCount} of {data?.questions.length ?? 0} CareerPath questions answered`}>
            <div className="h-2 bg-[#c9a34e] transition-all" style={{ width: `${overallCompletion}%` }} />
          </div>
        </div>

        {currentGroup && (
          <section className="border border-[#16243d]/15 bg-white/55 p-5 sm:p-8">
            <div className="flex items-end justify-between gap-4 border-b border-[#16243d]/15 pb-4">
              <div>
                <p className="eyebrow text-[#a27e2e]">Module {currentModule + 1}</p>
                <h2 className="display mt-2 text-3xl">{currentGroup.name}</h2>
              </div>
              <span className="text-xs text-[#657084]">{currentGroup.questions.length} items � {currentGroupAnswered} answered</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#657084]">Choose the response that best reflects you today.</p>
            <div className="mt-6 space-y-4">
              {currentGroup.questions.map(question => (
                <LikertQuestion key={question.id} question={question} value={answers[question.id]} onChange={value => setAnswers(prev => ({ ...prev, [question.id]: value }))} />
              ))}
            </div>
          </section>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button type="button" variant="outline" onClick={() => setCurrentModule(m => Math.max(0, m - 1))} disabled={currentModule === 0} className="border-[#16243d]/25">
            <ArrowRight size={15} className="rotate-180" /> Previous
          </Button>
          <span className="text-xs text-[#657084]">
            {currentGroupComplete ? "Module complete" : `${currentGroupAnswered} of {currentGroup.questions.length} answered`}
          </span>
          <Button type="button" onClick={onNext} disabled={!currentGroupComplete || (!isLastModule && !allComplete)} className="bg-[#16243d] text-[#f7f3e8]">
            {isLastModule ? "Complete & Checkout" : "Next module"} <ArrowRight size={15} />
          </Button>
        </div>
      </div>
    </main>
  );
}

function CheckoutPage({ reference, onVerified }: { reference: string; onVerified: (report: CareerPathReport) => void }) {
function CheckoutPage({ reference, onVerified }: { reference: string; onVerified: (report: CareerPathReport) => void }) {
  const [paymentState, setPaymentState] = useState<PaystackCheckoutState>("idle");
  const [inlineModalOpen, setInlineModalOpen] = useState(false);
  const [inlineProduct, setInlineProduct] = useState<PaystackInlineProduct | null>(null);
  const [verificationError, setVerificationError] = useState("");
  const initializePayment = trpc.careerPath.initializeInlinePayment.useMutation();
  const verifyPayment = trpc.careerPath.verifyPayment.useMutation({
    onSuccess: result => {
      setPaymentState(paystackStateAfter("success"));
      onVerified(result.report);
      toast.success("Payment verified", { description: "Your CareerPath report is now unlocked." });
    },
    onError: error => {
      setPaymentState(paystackStateAfter("failure"));
      setVerificationError(error.message);
      toast.error("Payment verification needs attention", { description: error.message });
    },
  });

  useEffect(() => {
    if (!reference) return;
    if (paymentState === "idle") {
      setPaymentState(paystackStateAfter("verify"));
      verifyPayment.mutate({ reference });
    }
  }, [reference]);

  const beginPayment = async () => {
    try {
      setPaymentState(paystackStateAfter("begin"));
      const result = await initializePayment.mutateAsync({
        name: "",
        email: "",
        answers: [],
        consent: true,
      });
      setPaymentState(paystackStateAfter("ready"));
      setInlineProduct({
        accessCode: result.accessCode,
        reference: result.reference,
        amountKes: result.amountKes,
        productName: result.productName,
        productType: "careerpath",
      });
      setInlineModalOpen(true);
    } catch (error) {
      setPaymentState(paystackStateAfter("failure"));
      toast.error(error instanceof Error ? error.message : "Unable to start Paystack checkout.");
    }
  };

  return (
    <>
      <main className="container py-10 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <p className="eyebrow text-[#a27e2e]">Secure checkout</p>
          <h1 className="display mt-4 text-5xl leading-[.95] tracking-[-.04em] sm:text-7xl">Complete your <em className="font-normal text-[#a27e2e]">CareerPath</em>.</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[#4a566a]">
            Finalize your payment to unlock your tailored CareerPath report, certificate, and coaching visual.
          </p>

          {paymentState === "verifying" && (
            <div className="mt-8 flex items-center gap-3 border-l-2 border-[#c9a34e] bg-[#16243d] px-5 py-4 text-sm text-[#f7f3e8]">
              <Loader2 className="animate-spin text-[#c9a34e]" size={18} />
              <span><strong>Payment received.</strong> We are confirming the Paystack transaction before unlocking your report.</span>
            </div>
          )}
          {paymentState === "paid" && (
            <div className="mt-8 flex items-center gap-3 border-l-2 border-emerald-700 bg-emerald-50 px-5 py-4 text-sm text-emerald-900">
              <CheckCircle2 size={18} />
              <span><strong>Payment verified.</strong> Your CareerPath report is unlocked.</span>
            </div>
          )}
          {paymentState === "error" && verificationError && (
            <div className="mt-8 border-l-2 border-red-700 bg-red-50 px-5 py-4 text-sm text-red-900">{verificationError}</div>
          )}

          {paymentState !== "paid" && (
            <div className="mt-8 border border-[#16243d]/15 bg-[#16243d] p-5 text-[#f7f3e8] sm:p-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="eyebrow text-[#c9a34e]">CareerPath Talent Fit</p>
                  <p className="mt-2 text-sm text-[#c1cad7]">KES 399 · Secure Paystack checkout · Report delivered by email</p>
                </div>
                <Button type="button" onClick={beginPayment} disabled={initializePayment.isPending} className="shrink-0 bg-[#c9a34e] text-[#16243d] hover:bg-[#e1bd5b]">
                  <CreditCard size={15} className="mr-2" /> Pay KES 399
                </Button>
              </div>
            </div>
          )}

          {paymentState === "paid" && (
            <div className="mt-8">
              <Link href={`/careerpath/reports?reference=${encodeURIComponent(reference)}`} className="inline-flex items-center gap-3 bg-[#c9a34e] px-5 py-4 text-sm font-bold text-[#16243d] hover:bg-[#e1bd5b]">
                Open your report <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>
      </main>
      <PaystackInlineModal
        open={inlineModalOpen}
        product={inlineProduct}
        customerEmail=""
        onClose={() => { setInlineModalOpen(false); setInlineProduct(null); }}
        onSuccess={(reference) => {
          setInlineModalOpen(false);
          setInlineProduct(null);
          setPaymentState("verifying");
          verifyPayment.mutate({ reference }, {
            onSuccess: (result) => {
              onVerified(result.report);
              setPaymentState("paid");
              toast.success("Payment verified");
            },
            onError: (error) => {
              setPaymentState("error");
              setVerificationError(error.message);
              toast.error(error.message);
            },
          });
        }}
        onError={(message) => {
          setInlineModalOpen(false);
          setInlineProduct(null);
          setPaymentState("error");
          setVerificationError(message);
          toast.error("Payment failed", { description: message });
        }}
      />
    </>
  );
}

function ReportsPage({ reference }: { reference?: string | null }) {
  const { data: currentUser } = trpc.auth.me.useQuery();
  const { data: careerHistory = [] } = trpc.careerPath.history.useQuery(undefined, { enabled: Boolean(currentUser), retry: false });
  const { data: shareCounts = {} } = trpc.careerPath.shareCounts.useQuery(undefined, { enabled: Boolean(currentUser), retry: false });
  const [report, setReport] = useState<CareerPathReport | null>(null);
  const [reportReference, setReportReference] = useState<string | null>(reference ?? null);
  const [pngDownloading, setPngDownloading] = useState(false);
  const recordShare = trpc.careerPath.recordShare.useMutation();

  const { data: reportData, isLoading: reportLoading } = trpc.careerPath.getReport.useQuery({ reference: reportReference ?? "" }, { enabled: Boolean(reportReference), retry: false });

  useEffect(() => {
    if (reportData?.report && !report) {
      setReport(reportData.report as CareerPathReport);
    }
  }, [reportData]);

  const buildVisual = () => {
    if (!report) return "";
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600"><rect width="900" height="600" fill="#101d35"/><rect x="26" y="26" width="848" height="548" fill="none" stroke="#c9a34e" stroke-width="3"/><text x="450" y="135" fill="#c9a34e" text-anchor="middle" font-family="Arial" font-size="18" letter-spacing="4">PROFOUND IQ CONSULTING</text><text x="450" y="245" fill="#f7f3e8" text-anchor="middle" font-family="Georgia" font-size="46">Completion certificate</text><text x="450" y="320" fill="#c1cad7" text-anchor="middle" font-family="Arial" font-size="18">CareerPath Assessment completed</text><text x="450" y="415" fill="#c9a34e" text-anchor="middle" font-family="Georgia" font-size="30">${report.primary.label}</text><text x="450" y="485" fill="#c1cad7" text-anchor="middle" font-family="Arial" font-size="14">Issued ${new Date().toLocaleDateString()}</text></svg>`)}`;
  };

  const downloadCertificate = () => {
    const escapedName = report?.primary.label.replace(/[<&>\"]/g, "") ?? "CareerPath";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="#101d35"/><rect x="36" y="36" width="1128" height="728" fill="none" stroke="#c9a34e" stroke-width="3"/><text x="600" y="180" fill="#c9a34e" text-anchor="middle" font-family="Arial" font-size="24" letter-spacing="6">PROFOUND IQ CONSULTING</text><text x="600" y="300" fill="#f7f3e8" text-anchor="middle" font-family="Georgia" font-size="62">Completion certificate</text><text x="600" y="390" fill="#c1cad7" text-anchor="middle" font-family="Arial" font-size="24">CareerPath Assessment completed</text><text x="600" y="500" fill="#c9a34e" text-anchor="middle" font-family="Georgia" font-size="42">Primary pathway: ${escapedName}</text><text x="600" y="620" fill="#c1cad7" text-anchor="middle" font-family="Arial" font-size="18">Issued ${new Date().toLocaleDateString()}</text></svg>`;
    const anchor = document.createElement("a");
    anchor.href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    anchor.download = "profound-iq-careerpath-completion-certificate.svg";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    toast.success("Completion certificate downloaded");
  };

  const shareResult = (channel: "whatsapp" | "email" | "linkedin" | "facebook" | "x") => {
    if (!report) return;
    const message = `I completed my Profound IQ CareerPath Assessment. My primary pathway is ${report.primary.label}.`;
    const shareUrl = `${window.location.origin}/careerpath/reports?reference=${encodeURIComponent(reportReference ?? "")}`;
    if (channel === "whatsapp") {
      recordShare.mutate({ platform: "whatsapp", asset: "report" });
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    } else if (channel === "linkedin") {
      recordShare.mutate({ platform: "linkedin", asset: "report" });
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank", "noopener,noreferrer");
    } else if (channel === "facebook") {
      recordShare.mutate({ platform: "facebook", asset: "report" });
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank", "noopener,noreferrer");
    } else if (channel === "x") {
      recordShare.mutate({ platform: "x", asset: "report" });
      window.open(`https://x.com/intent/post?text=${encodeURIComponent(message)}&url=${encodeURIComponent(shareUrl)}`, "_blank", "noopener,noreferrer");
    } else {
      recordShare.mutate({ platform: "email", asset: "report" });
      window.location.href = `mailto:?subject=${encodeURIComponent("My Profound IQ CareerPath result")}&body=${encodeURIComponent(message)}`;
    }
  };

  if (!report) {
    return (
      <main className="container py-16">
        <div className="mx-auto max-w-2xl border border-[#16243d]/15 bg-white/60 p-8 text-center">
          <p className="eyebrow text-[#a27e2e]">Reports workspace</p>
          <h1 className="display mt-3 text-4xl">Your results are created after verification.</h1>
          <p className="mt-4 text-sm leading-6 text-[#657084]">Complete the assessment and payment verification to unlock your tailored CareerPath report.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/careerpath/assessment" className="bg-[#c9a34e] px-5 py-3 text-sm font-bold text-[#16243d]">Open assessment</Link>
            <Link href="/dashboard" className="border border-[#16243d]/25 px-5 py-3 text-sm font-bold">Open workspace</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-10 sm:py-16">
        <div className="max-w-3xl">
          <p className="eyebrow text-[#a27e2e]">Your CareerPath profile</p>
          <h1 className="display mt-4 text-5xl leading-none sm:text-7xl">
            Discover. <em className="font-normal text-[#a27e2e]">Explore.</em> Choose.
          </h1>
          <p className="mt-5 text-base leading-7 text-[#4a566a]">{report.overallReadout}</p>
        </div>

        <div className="mt-10 border-l-2 border-[#c9a34e] bg-[#16243d] p-5 text-[#f7f3e8] sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow text-[#c9a34e]">Keep the momentum visible.</p>
              <h2 className="display mt-2 text-3xl">Retake periodically to track your progress.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#c1cad7]">
                Interests and strengths evolve. Revisit this assessment each term to see how your pathway signal changes.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={downloadCertificate} className="bg-[#c9a34e] text-[#16243d]">
                <Download size={15} /> Certificate
              </Button>
              <Button type="button" variant="outline" onClick={() => shareResult("whatsapp")} className="border-[#c1cad7]/30 bg-transparent text-[#f7f3e8]">
                <MessageCircle size={15} /> WhatsApp
              </Button>
              <Button type="button" variant="outline" onClick={() => shareResult("linkedin")} className="border-[#c1cad7]/30 bg-transparent text-[#f7f3e8]">
                LinkedIn
              </Button>
            </div>
          </div>
        </div>

        <ReportSectionTabs
          sections={[
            ...(careerHistory.length > 0
              ? [
                  {
                    id: "history",
                    label: "Your History",
                    content: (
                      <section className="mt-8 border border-[#16243d]/15 bg-white/55 p-5 sm:p-7" aria-label="Past CareerPath reports and certificates">
                        <p className="eyebrow text-[#a27e2e]">Your history</p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {careerHistory.slice(0, 4).map((item: { id: number; receiptTitle: string | null; createdAt: Date; paymentStatus: string; report: unknown; paystackReference: string | null }) => (
                            <article key={item.id} className="border border-[#16243d]/12 bg-[#f7f3e8] p-4">
                              <div className="mb-3 overflow-hidden border border-[#c9a34e]/60 bg-[#16243d] p-3 text-[#f7f3e8]">
                                <p className="text-[9px] font-black uppercase tracking-[.16em] text-[#c9a34e]">Profound IQ Consulting</p>
                                <p className="display mt-2 text-xl">Certificate</p>
                                <p className="mt-2 text-[9px] uppercase tracking-[.1em] text-[#c1cad7]">CareerPath achievement</p>
                              </div>
                              <p className="text-sm font-bold">{item.receiptTitle || "CareerPath Assessment"}</p>
                              <p className="mt-1 text-xs text-[#657084]">{new Date(item.createdAt).toLocaleDateString()} · {item.paymentStatus}</p>
                              {Boolean(item.report) && (
                                <Link href={`/careerpath/reports?reference=${encodeURIComponent(item.paystackReference ?? "")}`} className="mt-3 inline-block text-xs font-black uppercase tracking-[.1em] text-[#7d5e1e]">
                                  View report
                                </Link>
                              )}
                            </article>
                          ))}
                        </div>
                      </section>
                    ),
                  },
                ]
              : []),
            {
              id: "pathways",
              label: "Pathways",
              content: (
                <section className="mt-10 grid gap-6 md:grid-cols-3">
                  {report.pathways.map((pathway: CareerPathwayResult, index: number) => (
                    <article key={pathway.key} className={`border p-5 transition-transform sm:p-7 hover:-translate-y-1 ${index === 0 ? "border-[#a27e2e] bg-[#16243d] text-[#f7f3e8] shadow-sm" : "border-[#16243d]/15 bg-white/55"}`}>
                      <p className="text-[10px] font-black uppercase tracking-[.16em] opacity-70">
                        {index === 0 ? "Primary pathway" : index === 1 ? "Secondary pathway" : "Alternative pathway"}
                      </p>
                      <h2 className="display mt-4 text-3xl">{pathway.label}</h2>
                      <p className={`mt-4 text-5xl ${index === 0 ? "text-[#c9a34e]" : "text-[#a27e2e]"}`}>
                        {pathway.score}<span className="text-base"> / 100</span>
                      </p>
                      <p className="mt-3 text-xs font-bold uppercase tracking-[.12em]">{pathway.band}</p>
                    </article>
                  ))}
                </section>
              ),
            },
            {
              id: "subpathways",
              label: "Sub-Pathways",
              content: (
                <section className="mt-10 border border-[#16243d]/15 bg-white/55 p-5 sm:p-8">
                  <p className="eyebrow text-[#a27e2e]">Sub-pathway readout</p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {report.subPathways.map(subPathway => (
                      <article key={subPathway.key} className="border border-[#16243d]/12 bg-[#f7f3e8] p-5 transition-transform hover:-translate-y-0.5">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-sm font-bold">{subPathway.label}</h3>
                          <span className="text-lg font-semibold text-[#a27e2e]">{subPathway.score}</span>
                        </div>
                        <p className="mt-2 text-[10px] font-black uppercase tracking-[.1em] text-[#7d5e1e]">{subPathway.band}</p>
                        <p className="mt-3 text-xs leading-5 text-[#657084]">{subPathway.rationale}</p>
                      </article>
                    ))}
                  </div>
                </section>
              ),
            },
            {
              id: "certificate",
              label: "Certificate & Share",
              content: (
                <section className="mt-10 border-l-2 border-[#c9a34e] bg-[#16243d] p-5 text-[#f7f3e8] sm:p-7">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="eyebrow text-[#c9a34e]">A completed development signal</p>
                      <h2 className="display mt-2 text-3xl">Keep the momentum visible.</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#c1cad7]">
                        Download a coaching-ready certificate or share a concise achievement note through WhatsApp or email.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" onClick={downloadCertificate} className="bg-[#c9a34e] text-[#16243d]">
                        <Download size={15} /> Certificate
                      </Button>
                      <Button type="button" variant="outline" onClick={() => shareResult("whatsapp")} className="border-[#c1cad7]/30 bg-transparent text-[#f7f3e8]">
                        <MessageCircle size={15} /> WhatsApp
                      </Button>
                      <Button type="button" variant="outline" onClick={() => shareResult("linkedin")} className="border-[#c1cad7]/30 bg-transparent text-[#f7f3e8]">
                        LinkedIn
                      </Button>
                    </div>
                  </div>
                </section>
              ),
            },
            {
              id: "evidence",
              label: "Evidence & Context",
              content: (
                <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
                  <article className="border border-[#16243d]/15 bg-white/55 p-5 sm:p-8">
                    <p className="eyebrow text-[#a27e2e]">Why this signal matters</p>
                    <h2 className="display mt-3 text-3xl">Evidence to explore.</h2>
                    {report.primary.evidence.map((item: string) => (
                      <div key={item} className="mt-5 flex gap-3 text-sm leading-6">
                        <CheckCircle2 size={17} className="mt-1 shrink-0 text-[#a27e2e]" />
                        <span>{item}</span>
                      </div>
                    ))}
                    <h3 className="mt-8 text-[10px] font-black uppercase tracking-[.14em] text-[#7d5e1e]">Recommended next steps</h3>
                    {report.explorationPlan.map((item: string) => (
                      <p key={item} className="mt-3 border-l border-[#c9a34e] pl-3 text-sm leading-6 text-[#657084]">
                        {item}
                      </p>
                    ))}
                  </article>
                  <article className="border-l-2 border-[#c9a34e] bg-[#16243d] p-5 text-[#c1cad7] sm:p-8">
                    <Sparkles size={19} className="text-[#c9a34e]" />
                    <h2 className="display mt-3 text-3xl text-[#f7f3e8]">Important context.</h2>
                    {report.importantContext.map((item: string) => (
                      <p key={item} className="mt-4 text-sm leading-6">{item}</p>
                    ))}
                    <p className="mt-7 border-t border-[#c1cad7]/20 pt-5 text-xs leading-5 text-[#c1cad7]">{report.disclaimer}</p>
                  </article>
                </section>
              ),
            },
          ]}
        />
      </main>
    );
  }

export default function CareerPath() {
  const [location, setLocation] = useLocation();
  const [page, setPage] = useState<Page>("introduction");
  const [completedAssessment, setCompletedAssessment] = useState<{ name: string; email: string; answers: Array<{ questionId: string; value: number }> } | null>(null);
  const [checkoutReference, setCheckoutReference] = useState<string | null>(null);
  const [unlockedReport, setUnlockedReport] = useState<CareerPathReport | null>(null);
  const { data: currentUser } = trpc.auth.me.useQuery();

  const qualityControlMode = currentUser?.email?.trim().toLowerCase() === "profoundiqconsulting@gmail.com";

  const urlParams = useMemo(() => new URLSearchParams(window.location.search), [location]);
  const urlReference = urlParams.get("reference");
  const paymentSuccess = urlParams.get("payment") === "success";

  useEffect(() => {
    const pathname = window.location.pathname;
    if (pathname === "/careerpath/assessment" || (pathname === "/careerpath" && page === "introduction")) {
      setPage("assessment");
    } else if (pathname === "/careerpath/checkout") {
      setPage("checkout");
    } else if (pathname === "/careerpath/reports") {
      setPage("reports");
    } else if (paymentSuccess && urlReference) {
      setPage("reports");
      setReportReference(urlReference);
    }
  }, []);

  const initializeInlinePayment = trpc.careerPath.initializeInlinePayment.useMutation();

  const handleAssessmentComplete = async (data: { name: string; email: string; answers: Array<{ questionId: string; value: number }> }) => {
    setCompletedAssessment(data);
    try {
      const result = await initializeInlinePayment.mutateAsync({
        name: data.name,
        email: data.email,
        answers: data.answers,
        consent: true,
      });
      setCheckoutReference(result.reference);
      setLocation(`/careerpath/checkout?reference=${encodeURIComponent(result.reference)}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to initialize payment.");
    }
  };

  const handleCheckoutSuccess = (report: CareerPathReport) => {
    setUnlockedReport(report);
    setPage("reports");
  };

  const [reportReference, setReportReference] = useState<string | null>(urlReference);

  if (page === "reports" && (unlockedReport || urlReference)) {
    return <ReportsPage reference={urlReference ?? checkoutReference ?? reportReference} />;
  }

  return (
    <div className="min-h-screen bg-[#f7f3e8] text-[#16243d]">
      {qualityControlMode && (
        <div className="border-b border-[#c9a34e]/40 bg-[#fff4c9] px-5 py-2 text-center text-[10px] font-black uppercase tracking-[.14em] text-[#7d5e1e]" role="status">
          Quality Control Mode · Payment bypass active
        </div>
      )}
      <TransformationNav active="careerpath" />
      <CareerPathStepIndicator current={page} />
      {page === "introduction" && <IntroPage onStart={() => { setPage("assessment"); setLocation("/careerpath/assessment"); }} />}
      {page === "assessment" && <AssessmentPage onComplete={handleAssessmentComplete} />}
      {page === "checkout" && checkoutReference && <CheckoutPage reference={checkoutReference} onVerified={handleCheckoutSuccess} />}
    </div>
  );
}

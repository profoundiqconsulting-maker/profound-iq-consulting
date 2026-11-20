/* Profound IQ Consulting — Assessment flow redesigned for executive conversion */
import { useEffect, useMemo, useRef, useState } from "react";
import { PUBLISHED_SITE_ORIGIN } from "@shared/siteOrigin";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clipboard,
  Download,
  Loader2,
  LockKeyhole,
  Mail,
  Menu,
  MessageCircle,
  RotateCcw,
  Save,
  Settings2,
  Share2,
  Shield,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import {
  assessmentQuestions,
  ASSESSMENT_PRICE_KES,
  buildRoleLens,
  dimensions,
  getDimensionReflectionPoints,
  roleLensOptions,
  type AssessmentAnswer,
  type AssessmentReport,
  type AssessmentDimensionReport,
  type RoleLens,
} from "@shared/assessment";
import { trpc } from "@/lib/trpc";
import { TransformationNav } from "@/components/TransformationNav";
import { SocialSharing, type SocialPlatform } from "@/components/SocialSharing";

import { useAuth } from "@/_core/hooks/useAuth";
import { LOGO_URL } from "@/components/BrandLogo";
import { assessmentCopy } from "@shared/assessmentLocalization";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ReflectionPromptCard } from "@/components/ReflectionPromptCard";
import { ReportSectionTabs } from "@/components/ReportSectionTabs";
import { LikertScale } from "@/components/LikertScale";
import { ProgressRing } from "@/components/ui/progress-ring";
import { cn } from "@/lib/utils";
import {
  buildReflectionExportCsv,
  type ReflectionStatus,
} from "@shared/reflectionWorkflow";
import PaystackInlineModal, {
  type PaystackInlineProduct,
} from "@/components/PaystackInlineModal";
import { CheckoutForm } from "@/components/CheckoutForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ReflectionDraft = {
  note: string;
  status: ReflectionStatus;
  selected: boolean;
};
type AssessmentStage = "intro" | "questions" | "waiting" | "report";

/* Reads a saved/returned report reference before first render so a direct report link skips the intro flash. */
function getPendingReportReference() {
  return (
    new URLSearchParams(window.location.search).get("reference") ??
    window.sessionStorage.getItem("piq-assessment-reference") ??
    window.localStorage.getItem("piq-assessment-paid-reference") ??
    ""
  );
}

const QUESTIONS_PER_CONTENT_PAGE = 5;

function AssessmentFlowPagination({
  stage,
  modulePage,
  totalModules,
  answeredCount,
  totalQuestions,
  assessmentComplete,
  onModuleChange,
  questionsInCurrentModule,
  answeredInCurrentModule,
}: {
  stage: AssessmentStage;
  modulePage: number;
  totalModules: number;
  answeredCount: number;
  totalQuestions: number;
  assessmentComplete: boolean;
  onModuleChange: (index: number) => void;
  questionsInCurrentModule: number;
  answeredInCurrentModule: number;
}) {
  const progress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  const moduleProgress = questionsInCurrentModule > 0
    ? Math.round((answeredInCurrentModule / questionsInCurrentModule) * 100)
    : 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        onModuleChange(Math.max(0, modulePage - 1));
        break;
      case "ArrowRight":
        e.preventDefault();
        onModuleChange(Math.min(totalModules - 1, modulePage + 1));
        break;
      default:
        break;
    }
  };

  return (
    <div
      onKeyDown={handleKeyDown}
      className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      role="navigation"
      aria-label="Assessment module navigation"
    >
      <div className="flex items-center gap-4">
        <ProgressRing
          value={progress}
          size={48}
          strokeWidth={4}
          className="text-[var(--gold)]"
          aria-label={`${progress}% of assessment completed`}
        >
          <span className="text-xs font-bold text-[var(--foreground)]">{progress}%</span>
        </ProgressRing>
        <div>
          <p className="text-display text-xl font-semibold text-[var(--foreground)]">
            Module {modulePage + 1} of {totalModules}
          </p>
          <div className="mt-2 flex items-center gap-3 text-sm">
            <span className="text-[var(--muted-foreground)]">
              {answeredCount} / {totalQuestions} questions answered
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[var(--muted-foreground)]">Module:</span>
              <div className="h-2 w-24 bg-[var(--border)] rounded-full overflow-hidden" role="progressbar" aria-valuenow={moduleProgress} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full bg-[var(--gold)] rounded-full transition-all duration-300" style={{ width: `${moduleProgress}%` }} />
              </div>
              <span className="text-xs font-bold text-[var(--gold)]">{moduleProgress}%</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Module quick navigation">
        {Array.from({ length: totalModules }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onModuleChange(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onModuleChange(i);
              }
            }}
            className={cn(
              "px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all",
              i === modulePage
                ? "bg-[var(--gold)] text-[var(--navy-deep)] shadow"
                : assessmentComplete || (i < modulePage && answeredCount > 0)
                ? "bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]"
                : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--gold)]/10 hover:text-[var(--gold)] border border-[var(--border)]"
            )}
            disabled={assessmentComplete && i !== modulePage}
            aria-current={i === modulePage ? "step" : undefined}
            aria-label={`Go to module ${i + 1}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Assessment() {
  const [stage, setStage] = useState<AssessmentStage>("intro");
  const [page, setPage] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AssessmentAnswer>>({});
  const [reflectionDrafts, setReflectionDrafts] = useState<Record<string, ReflectionDraft>>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [roleLens, setRoleLens] = useState<RoleLens>("leadership");
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState<AssessmentReport | null>(null);
  const [reportReference, setReportReference] = useState<string | null>(null);
  const [paymentState, setPaymentState] = useState<"idle" | "verifying" | "paid" | "failed">("idle");
  const [error, setError] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPreferences] = useState(false);
  const [localDraft, setLocalDraft] = useState<{ savedAt: number; currentModule: number; responses: Record<string, AssessmentAnswer> } | null>(null);
  const [skipResumePrompt, setSkipResumePrompt] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [savedPulse, setSavedPulse] = useState(false);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [moduleCelebration, setModuleCelebration] = useState(false);
  const [certificatePreviewOpen, setCertificatePreviewOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [resumeToken] = useState<string | null>(() => new URLSearchParams(window.location.search).get("resume"));
  const [resumeCopyFallback, setResumeCopyFallback] = useState(false);
  const [pendingImport, setPendingImport] = useState<{ responseCount: number; draft: { currentModule: number; savedAt: number } } | null>(null);
  const [isDraggingImport, setIsDraggingImport] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  const { user, isAuthenticated } = useAuth();

  const assessmentModules = useMemo(() => {
    const modules: { key: string; label: string; questions: typeof assessmentQuestions }[] = [];
    for (let i = 0; i < assessmentQuestions.length; i += QUESTIONS_PER_CONTENT_PAGE) {
      modules.push({
        key: `module-${i / QUESTIONS_PER_CONTENT_PAGE}`,
        label: `Module ${i / QUESTIONS_PER_CONTENT_PAGE + 1}`,
        questions: assessmentQuestions.slice(i, i + QUESTIONS_PER_CONTENT_PAGE),
      });
    }
    return modules;
  }, []);

  const totalPages = assessmentModules.length;
  const currentModule = assessmentModules[page];
  const questionsInCurrentModule = currentModule?.questions.length ?? 0;
  const answeredInCurrentModule = currentModule?.questions.filter(q => Boolean(answers[q.id])).length ?? 0;
  const moduleProgress = questionsInCurrentModule > 0
    ? Math.round((answeredInCurrentModule / questionsInCurrentModule) * 100)
    : 0;
  const answeredCount = Object.keys(answers).length;
  const completedModuleCount = assessmentModules.filter(m =>
    m.questions.every(q => Boolean(answers[q.id]))
  ).length;
  const assessmentComplete = completedModuleCount === totalPages;
  const localDraftAnsweredCount = localDraft ? Object.keys(localDraft.responses).length : 0;
  const localDraftCompletion = localDraft ? Math.round((localDraftAnsweredCount / assessmentQuestions.length) * 100) : 0;
  const localDraftCompletedModules = localDraft
    ? assessmentModules.filter(m => m.questions.every(q => Boolean(localDraft.responses[q.id]))).length
    : 0;

  const shareUrl = `${PUBLISHED_SITE_ORIGIN}/assessment?reference=${reportReference ?? ""}`;
  const shareTitle = "My Profound IQ Self-Assessment Report";
  const shareMessage = "I've completed my Profound IQ Self-Assessment. Here's my capability snapshot.";

  const handleShare = (platform: SocialPlatform) => {
    console.log(`Shared on ${platform}`);
  };

  // Load local draft on mount
  useEffect(() => {
    const saved = window.localStorage.getItem("piq-assessment-draft");
    if (saved) {
      try {
        setLocalDraft(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
    const skip = window.localStorage.getItem("piq-assessment-skip-resume-prompt");
    if (skip === "true") setSkipResumePrompt(true);
  }, []);

  // Auto-save draft
  useEffect(() => {
    if (stage !== "questions") return;
    const timer = setTimeout(() => {
      const draft = {
        savedAt: Date.now(),
        currentModule: page,
        responses: answers,
      };
      window.localStorage.setItem("piq-assessment-draft", JSON.stringify(draft));
      setLocalDraft(draft);
      setLastSavedAt(Date.now());
      setSavedPulse(true);
      setTimeout(() => setSavedPulse(false), 1000);
    }, 2000);
    return () => clearTimeout(timer);
  }, [stage, page, answers]);

  const beginAssessment = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name || !email || !consent) return;
    setStage("questions");
    setPage(0);
    setQuestionIndex(0);
    window.localStorage.removeItem("piq-assessment-skip-resume-prompt");
  };

  const resumeLocalDraft = () => {
    if (!localDraft) return;
    setAnswers(localDraft.responses);
    setPage(localDraft.currentModule);
    setQuestionIndex(0);
    setStage("questions");
    window.localStorage.removeItem("piq-assessment-skip-resume-prompt");
  };

  const discardLocalDraft = () => {
    window.localStorage.removeItem("piq-assessment-draft");
    setLocalDraft(null);
  };

  const saveNow = () => {
    const draft = {
      savedAt: Date.now(),
      currentModule: page,
      responses: answers,
    };
    window.localStorage.setItem("piq-assessment-draft", JSON.stringify(draft));
    setLocalDraft(draft);
    setLastSavedAt(Date.now());
    setSavedPulse(true);
    setTimeout(() => setSavedPulse(false), 1000);
    toast.success("Progress saved");
  };

  // Global keyboard shortcuts for assessment navigation
  useEffect(() => {
    if (stage !== "questions") return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }

      switch (e.key) {
        case "ArrowLeft":
          if (e.altKey || e.metaKey) {
            e.preventDefault();
            setPage(p => Math.max(0, p - 1));
            setQuestionIndex(0);
          }
          break;
        case "ArrowRight":
          if (e.altKey || e.metaKey) {
            e.preventDefault();
            setPage(p => Math.min(totalPages - 1, p + 1));
            setQuestionIndex(0);
          }
          break;
        case "s":
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            saveNow();
          }
          break;
        case "o":
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            setOverviewOpen(true);
          }
          break;
        case "p":
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            setPreferencesOpen(true);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [stage, page, totalPages, saveNow]);

  const navigateToModule = (index: number) => {
    if (index >= 0 && index < totalPages) {
      setPage(index);
      setQuestionIndex(0);
      setOverviewOpen(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: number) => {
    const question = assessmentQuestions.find(q => q.id === questionId);
    if (!question) return;
    setAnswers(prev => ({ ...prev, [questionId]: { questionId, value, dimension: question.dimension } }));

    // Auto-advance to next question in current module
    const moduleQuestions = assessmentModules[page].questions;
    const currentQuestionIdx = moduleQuestions.findIndex(q => q.id === questionId);

    if (currentQuestionIdx >= 0 && currentQuestionIdx < moduleQuestions.length - 1) {
      // Move to next question in same module
      setQuestionIndex(currentQuestionIdx + 1);
    } else if (currentQuestionIdx === moduleQuestions.length - 1) {
      // Last question in module - check if all answered
      const moduleQuestionIds = moduleQuestions.map(q => q.id);
      const allAnswered = moduleQuestionIds.every(id => answers[id] || id === questionId);

      if (allAnswered) {
        setModuleCelebration(true);
        setTimeout(() => {
          setModuleCelebration(false);
          if (page < totalPages - 1) {
            setPage(page + 1);
            setQuestionIndex(0);
          }
        }, 1500);
      }
    }
  };

  const verifyPayment = trpc.assessment.verifyPayment.useMutation();

  const completeAssessment = () => {
    if (!assessmentComplete) return;
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = async (reference: string) => {
    setShowCheckout(false);
    setPaymentState("verifying");
    try {
      const result = await verifyPayment.mutateAsync({ reference });
      setReport(result.report as AssessmentReport);
      setReportReference(reference);
      setPaymentState("paid");
      setStage("report");
      window.sessionStorage.setItem("piq-assessment-reference", reference);
      window.localStorage.setItem("piq-assessment-paid-reference", reference);
    } catch (err) {
      setPaymentState("failed");
      setError(err instanceof Error ? err.message : "Failed to load report");
    }
  };

  const openPreviousReport = async () => {
    if (!localDraft || localDraftCompletion !== 100) return;
    setPaymentState("verifying");
    try {
      const ref = window.localStorage.getItem("piq-assessment-paid-reference");
      if (!ref) throw new Error("No paid reference found");
      const result = await verifyPayment.mutateAsync({ reference: ref });
      setReport(result.report as AssessmentReport);
      setReportReference(ref);
      setPaymentState("paid");
      setStage("report");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load report");
    }
  };

  const downloadCompletionCertificate = () => {
    if (!report) return;
    // This would use the certificateSvgPreview query
  };

  const downloadCompletionCertificatePdf = () => {
    if (!report) return;
    // This would use the downloadCompletionCertificatePdf mutation
  };

  const copyResumeLink = async () => {
    if (!resumeUrl) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(resumeUrl);
      toast.success("Resume link copied", { description: "Keep it private until you are ready to continue." });
    } catch {
      setResumeCopyFallback(true);
      toast.error("Copy is unavailable in this browser", { description: "Use the selectable link below to copy it manually." });
    }
  };

  const importProgress = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void importProgressFile(file);
  };

  const importProgressFile = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.responses && typeof data.currentModule === "number") {
        setPendingImport({
          responseCount: Object.keys(data.responses).length,
          draft: { currentModule: data.currentModule, savedAt: data.savedAt ?? Date.now() },
        });
      }
    } catch {
      toast.error("Invalid progress file");
    }
  };

  const applyPendingImport = () => {
    if (!pendingImport) return;
    setPendingImport(null);
  };

  // Generate report when all questions answered
  useEffect(() => {
    if (assessmentComplete && stage === "questions") {
      setShowCheckout(true);
    }
  }, [assessmentComplete, stage]);

  const progress = assessmentQuestions.length > 0 ? Math.round((answeredCount / assessmentQuestions.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-body">
      <TransformationNav active="assessment" />

      {/* Intro Stage */}
      {stage === "intro" && (
        <main className="container py-12 sm:py-16 lg:py-24">
          <div className="mx-auto max-w-4xl">
            {error && (
              <div className="mb-6 bg-[var(--destructive)]/10 p-4 text-sm text-[var(--destructive)] rounded-xl border border-[var(--destructive)]/30" role="alert">
                {error}
              </div>
            )}

            {pendingImport && (
              <section className="mb-6 bg-[var(--gold)]/10 p-5 text-[var(--foreground)] rounded-xl border border-[var(--gold)]/30" role="dialog" aria-label="Review imported progress">
                <p className="eyebrow text-[var(--gold)]">Review imported progress</p>
                <p className="mt-2 text-sm leading-6">
                  This file contains <strong>{pendingImport.responseCount} responses</strong> and was last saved on
                  <strong>{new Date(pendingImport.draft.savedAt).toLocaleString()}</strong>.
                </p>
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">Confirming will replace the assessment progress currently saved on this device.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button type="button" onClick={applyPendingImport} variant="gold">Use this progress</Button>
                  <Button type="button" variant="outline" onClick={() => setPendingImport(null)}>Cancel</Button>
                </div>
              </section>
            )}

            {/* Trust Bar */}
            <div className="mb-10 flex flex-wrap items-center gap-4 p-4 bg-[var(--gold)]/5 rounded-xl border border-[var(--gold)]/20">
              <div className="flex items-center gap-2 text-xs font-medium text-[var(--gold)]">
                <Shield size={14} />
                <span>Secure Paystack checkout</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-[var(--gold)]">
                <LockKeyhole size={14} />
                <span>Data encrypted & private</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-[var(--gold)]">
                <Award size={14} />
                <span>Certificate on completion</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-[var(--gold)]">
                <RotateCcw size={14} />
                <span>Satisfaction guarantee — contact us</span>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
              <div>
                <p className="eyebrow text-[var(--gold)]">Evidence-based self-reflection</p>
                <h1 className="text-display text-4xl font-semibold leading-[1.05] tracking-tight mt-3 sm:text-5xl lg:text-6xl text-[var(--navy-deep)]">
                  See the patterns behind your <em className="font-normal text-[var(--gold)]">potential.</em>
                </h1>
                <p className="mt-7 max-w-2xl text-lg leading-relaxed text-[var(--muted-foreground)]">
                  This 100-question Self Assessment helps you reflect on the capabilities that shape how you learn, lead, communicate, and move from insight to action.
                </p>

                {/* Key Benefits */}
                <div className="mt-8 space-y-3">
                  {[
                    { icon: CheckCircle2, text: "Clarity on 10 capability dimensions" },
                    { icon: CheckCircle2, text: "Personalized 15+ page development report" },
                    { icon: CheckCircle2, text: "Instant certificate on completion" },
                    { icon: CheckCircle2, text: "6-month access to your results & resources" },
                    { icon: CheckCircle2, text: "Auto-save & resume anytime" },
                    { icon: CheckCircle2, text: "Secure, private, no subscriptions" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl bg-[var(--navy-deep)]/5 p-3 border border-[var(--gold)]/10">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--gold)]/15">
                        <item.icon className="h-4 w-4 text-[var(--gold)]" />
                      </div>
                      <span className="text-sm font-medium text-[var(--foreground)]">{item.text}</span>
                    </div>
                  ))}
                </div>

                {/* Social Proof */}
                <div className="mt-8 p-4 rounded-xl bg-[var(--navy-deep)]/5 border border-[var(--gold)]/10">
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--gold)] mb-3">Trusted by professionals across Kenya & beyond</p>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted-foreground)]">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-8 w-8 rounded-full border-2 border-[var(--navy-deep)] bg-gradient-to-br from-[var(--navy-deep)] to-[var(--ivory)]" />
                      ))}
                    </div>
                    <span>500+ organizations & 10,000+ assessments completed</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-10 grid grid-cols-2 gap-6 border-t border-[var(--border)] pt-6 sm:grid-cols-4">
                  <div className="text-center">
                    <p className="text-display text-3xl font-bold text-[var(--gold)]">100</p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">Reflective prompts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-display text-3xl font-bold text-[var(--gold)]">10</p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">Capability dimensions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-display text-3xl font-bold text-[var(--gold)]">25 min</p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">Average completion</p>
                  </div>
                  <div className="text-center">
                    <p className="text-display text-3xl font-bold text-[var(--gold)]">KES {ASSESSMENT_PRICE_KES.toLocaleString()}</p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">One-time fee</p>
                  </div>
                </div>
              </div>

              <aside className="bg-[var(--navy-deep)] p-7 text-[var(--background)] rounded-xl relative overflow-hidden">
                <Sparkles className="text-[var(--gold)] relative z-10" size={20} />
                <p className="eyebrow mt-7 text-[var(--gold)] relative z-10">What you'll discover</p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted-foreground)] relative z-10">
                  {[
                    "Your natural strengths across 10 capability dimensions",
                    "Growth areas with specific development suggestions",
                    "Learning style & communication preferences",
                    "Leadership potential & decision-making patterns",
                    "Stress response & resilience indicators",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--gold)]/15">
                        <Check className="h-3 w-3 text-[var(--gold)]" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex items-center gap-2 text-xs text-[var(--muted-foreground)] relative z-10">
                  <LockKeyhole size={14} className="text-[var(--gold)]" />
                  <span>Secure Paystack checkout</span>
                </div>

                <div className="mt-6 rounded-xl bg-[var(--gold)]/10 p-4 border border-[var(--gold)]/20 relative z-10">
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--gold)] mb-2">Satisfaction guarantee</p>
                  <p className="text-sm leading-5">
                    If the assessment doesn't meet your expectations, reach out —
                    we'll review your case and discuss options.
                  </p>
                </div>
              </aside>
            </div>

            {/* Resume Previous Session */}
            {localDraft && !skipResumePrompt && (
              <section className="mt-10 p-5 bg-[var(--muted)]/30 rounded-xl border border-[var(--gold)]/30">
                <p className="eyebrow text-[var(--gold)]">Previous session found</p>
                <p className="mt-2 text-sm leading-6">
                  Saved {new Date(localDraft.savedAt).toLocaleString()} with {localDraftAnsweredCount} responses in
                  <strong>{assessmentModules[localDraft.currentModule]?.label ?? "your last module"}</strong>
                  — {localDraftCompletion}% complete.
                </p>
                <div className="mt-4" aria-label={`${localDraftCompletion}% of assessment completed`}>
                  <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-[.12em] text-[var(--muted-foreground)]">
                    <span>Saved progress</span>
                    <span>{localDraftCompletion}%</span>
                  </div>
                  <div className="h-2 bg-[var(--border)] rounded-full" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={localDraftCompletion} aria-label={`${localDraftCompletedModules} of ${totalPages} modules completed`}>
                    <div className="h-full bg-[var(--gold)] rounded-full" style={{ width: `${localDraftCompletion}%` }} />
                  </div>
                  <p className="mt-2 text-[10px] text-[var(--muted-foreground)]">
                    {localDraftCompletedModules} of {totalPages} modules completed
                  </p>
                  {localDraftCompletion === 100 && (
                    <div className="mt-4 flex flex-wrap items-center gap-2" aria-live="polite">
                      <span className="text-[10px] font-black uppercase tracking-[.14em] text-[var(--gold)]">{assessmentCopy.moduleCompleted}</span>
                      <Button type="button" onClick={openPreviousReport} variant="outline" size="sm" className="text-[10px]">
                        <Clipboard size={13} /> {assessmentCopy.accessReport}
                      </Button>
                      <Button type="button" onClick={() => setCertificatePreviewOpen(true)} variant="outline" size="sm" className="text-[10px] border-[var(--gold)] text-[var(--gold)]">
                        <Clipboard size={13} /> {assessmentCopy.previewCertificate}
                      </Button>
                      <Button type="button" onClick={downloadCompletionCertificatePdf} disabled={false} variant="gold" size="sm" className="text-[10px]">
                        <Download size={13} /> {assessmentCopy.certificatePdf}
                      </Button>
                      <Button type="button" onClick={downloadCompletionCertificate} variant="outline" size="sm" className="text-[10px] border-[var(--gold)] text-[var(--gold)]">
                        <Download size={13} /> {assessmentCopy.certificateSvg}
                      </Button>
                      <SocialSharing
                        url={shareUrl}
                        title={shareTitle}
                        text={shareMessage}
                        platforms={["linkedin", "x", "facebook", "instagram", "tiktok", "whatsapp", "copy", "native"]}
                        onShare={handleShare}
                        className="bg-transparent border-transparent shadow-none"
                      />
                    </div>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button type="button" onClick={resumeLocalDraft} variant="gold">Resume previous session</Button>
                  <Button type="button" variant="outline" onClick={discardLocalDraft}>Start fresh</Button>
                </div>
                <label className="mt-4 flex items-start gap-3 text-xs leading-5 text-[var(--muted-foreground)]">
                  <input
                    type="checkbox"
                    checked={skipResumePrompt}
                    onChange={event => { const checked = event.target.checked; setSkipResumePrompt(checked); if (checked) window.localStorage.setItem("piq-assessment-skip-resume-prompt", "true"); else window.localStorage.removeItem("piq-assessment-skip-resume-prompt"); }}
                    className="mt-0.5 h-4 w-4 accent-[var(--gold)]"
                  />
                  Don't show this again; always start fresh.
                </label>
              </section>
            )}

            {/* Overall Progress Bar */}
            <div className="mt-10 bg-[var(--muted)]/30 p-5 rounded-xl" aria-label="Self Assessment progress">
              <div className="flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[.12em] text-[var(--muted-foreground)]">
                <span>Evaluation progress</span>
                <span>{progress}%</span>
              </div>
              <div className="mt-3 h-2 bg-[var(--border)] rounded-full" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label={`${answeredCount} of ${assessmentQuestions.length} questions answered`}>
                <div className="h-full bg-[var(--gold)] rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">You can save your progress and return whenever you need a pause.</p>
            </div>

            {/* Start Form */}
            <form onSubmit={beginAssessment} className="mt-8 border-t border-[var(--border)] pt-8">
              <div className="grid gap-8 sm:grid-cols-2">
                <label className="text-xs font-black uppercase tracking-[.14em]">
                  Your name
                  <input
                    id="assessment-name"
                    name="name"
                    required
                    value={name}
                    onChange={event => setName(event.target.value)}
                    autoComplete="name"
                    placeholder="Name"
                    className="mt-3 w-full border-b border-[var(--border)] bg-transparent px-0 py-3 text-lg outline-none placeholder:text-[var(--muted-foreground)] focus:border-[var(--gold)]"
                  />
                </label>
                <label className="text-xs font-black uppercase tracking-[.14em]">
                  Email for your report
                  <input
                    id="assessment-email"
                    name="email"
                    required
                    type="email"
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="mt-3 w-full border-b border-[var(--border)] bg-transparent px-0 py-3 text-lg outline-none placeholder:text-[var(--muted-foreground)] focus:border-[var(--gold)]"
                  />
                </label>
              </div>
              <label className="mt-8 flex max-w-3xl items-start gap-3 text-sm leading-6 text-[var(--muted-foreground)]">
                <input required type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[var(--gold)]" />
                I consent to Profound IQ Consulting using my name and email to deliver and follow up on this assessment report. This is an educational self-reflection tool, not a clinical, medical, psychological, or employment diagnosis.
              </label>
              <Button type="submit" size="lg" variant="gold" className="mt-9 w-full sm:w-auto gap-3">
                Begin assessment <ArrowRight size={16} />
              </Button>
            </form>
          </div>
        </main>
      )}

      {/* Questions Stage */}
      {stage === "questions" && (
        <main className="container py-8 lg:py-12">
          <AssessmentFlowPagination
            stage={stage}
            modulePage={page}
            totalModules={totalPages}
            answeredCount={answeredCount}
            totalQuestions={assessmentQuestions.length}
            assessmentComplete={assessmentComplete}
            onModuleChange={navigateToModule}
            questionsInCurrentModule={questionsInCurrentModule}
            answeredInCurrentModule={answeredInCurrentModule}
          />

          <div className="mx-auto max-w-3xl">
            {/* Module Header */}
            <div className="mb-8">
              <p className="eyebrow text-[var(--gold)]">Assessment / module {page + 1} of {totalPages}</p>
              <h1 className="text-display text-3xl font-semibold leading-[1.1] tracking-tight mt-2 text-[var(--navy-deep)]">{currentModule?.label ?? "Your assessment"}</h1>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">One module at a time, with space to reflect before moving forward.</p>
              {moduleCelebration && (
                <div className="mt-4 inline-flex items-center gap-2 border border-[var(--gold)]/60 bg-[var(--gold)]/10 px-3 py-2 text-xs font-bold text-[var(--gold)]" role="status">
                  <CheckCircle2 size={15} />
                  <span>{assessmentCopy.moduleCompleted}</span>
                  <span className="font-normal">{assessmentCopy.moduleCompletedDescription}</span>
                </div>
              )}
            </div>

            {/* Progress & Actions */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <ProgressRing
                  value={progress}
                  size={48}
                  strokeWidth={4}
                  className="text-[var(--gold)]"
                  aria-label={`${progress}% of assessment completed`}
                >
                  <span className="text-xs font-bold text-[var(--foreground)]">{progress}%</span>
                </ProgressRing>
                <div>
                  <p className="text-display text-xl font-semibold text-[var(--foreground)]">{completedModuleCount} of {totalPages} modules complete</p>
                  <p className="text-xs font-bold uppercase tracking-[.12em] text-[var(--muted-foreground)]">Evaluation progress</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <p className={cn("text-xs text-[var(--muted-foreground)]", savedPulse && "animate-pulse text-[var(--gold)]")}>
                  {lastSavedAt ? `Saved ${new Date(lastSavedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Not saved yet"}
                </p>
                <Button type="button" variant="ghost" size="sm" onClick={saveNow} className="text-xs font-black uppercase tracking-[.1em] text-[var(--gold)] hover:text-[var(--navy-deep)]">{assessmentCopy.saveNow}</Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => setPreferencesOpen(true)} aria-label="Open assessment preferences"><Settings2 size={13} /></Button>
              </div>
            </div>

            {/* Module Overview Sheet */}
            <Sheet open={overviewOpen} onOpenChange={setOverviewOpen}>
              <Button type="button" variant="outline" size="sm" onClick={() => setOverviewOpen(true)} className="gap-2 border-[var(--border)] text-xs font-black uppercase tracking-[.12em]">
                <Menu size={15} /> Module overview <span className="text-[var(--gold)]">{completedModuleCount}/{totalPages}</span>
              </Button>
              <SheetContent side="right" className="w-full border-l border-[var(--gold)] bg-[var(--card)] sm:max-w-md">
                <SheetHeader>
                  <SheetTitle className="text-display text-2xl">Your assessment map</SheetTitle>
                  <SheetDescription className="text-[var(--muted-foreground)]">Completed modules are marked so you can see your progress at a glance.</SheetDescription>
                </SheetHeader>
                <div className="mt-8 space-y-2">
                  {assessmentModules.map((module, moduleIndex) => {
                    const complete = module.questions.every(question => Boolean(answers[question.id]));
                    const answeredInModule = module.questions.filter(question => Boolean(answers[question.id])).length;
                    return (
                      <Button
                        key={module.key}
                        type="button"
                        variant={moduleIndex === page ? "gold" : complete ? "gold" : "outline"}
                        className="w-full justify-between gap-4 text-left"
                        onClick={() => { navigateToModule(moduleIndex); if (moduleIndex === page || !complete) setOverviewOpen(false); }}
                      >
                        <span>
                          <span className="block text-[10px] font-black uppercase tracking-[.14em] text-[var(--gold)]">Module {moduleIndex + 1}</span>
                          <span className="mt-1 block text-sm font-semibold">{module.label}</span>
                          <span className="mt-1 block text-xs text-[var(--muted-foreground)]">{answeredInModule}/{module.questions.length} answered</span>
                        </span>
                        {complete ? <CheckCircle2 className="shrink-0 text-[var(--success)]" size={19} /> : <span className="text-[10px] font-black uppercase tracking-[.12em] text-[var(--muted-foreground)]">Open</span>}
                      </Button>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>

            {/* Questions */}
            <div className="space-y-6">
              {currentModule && (
                <>
                  {currentModule.questions[questionIndex] && (() => {
                    const question = currentModule.questions[questionIndex];
                    const globalIndex = (page * QUESTIONS_PER_CONTENT_PAGE) + questionIndex;
                    const isAnswered = Boolean(answers[question.id]);
                    const isLastInModule = questionIndex === (currentModule?.questions.length ?? 0) - 1;

                    return (
                      <article
                        key={question.id}
                        className={cn(
                          "relative overflow-hidden rounded-2xl p-6 transition-all duration-300",
                          "border bg-[var(--card)]",
                          isAnswered
                            ? "border-[var(--success)]/30 bg-[var(--success)]/5"
                            : "border-[var(--border)] hover:border-[var(--gold)]/30"
                        )}
                        aria-label={`Question ${globalIndex + 1} of ${assessmentQuestions.length}`}
                      >
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <span className="text-[10px] font-black uppercase tracking-[.14em] text-[var(--gold)]">
                            Q{globalIndex + 1} of {assessmentQuestions.length}
                          </span>
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-[.12em] px-2 py-0.5 rounded-full",
                            isAnswered
                              ? "bg-[var(--success)]/15 text-[var(--success)]"
                              : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                          )}>
                            {isAnswered ? "Answered" : "Pending"}
                          </span>
                        </div>

                        {/* Module progress mini-bar */}
                        <div className="mb-4 h-1.5 bg-[var(--border)] rounded-full overflow-hidden" role="progressbar" aria-valuenow={answeredInCurrentModule} aria-valuemin={0} aria-valuemax={questionsInCurrentModule} aria-label={`Module progress: ${answeredInCurrentModule} of ${questionsInCurrentModule} answered`}>
                          <div className="h-full bg-[var(--gold)] rounded-full transition-all duration-300" style={{ width: `${moduleProgress}%` }} />
                        </div>

                        <LikertScale
                          id={question.id}
                          question={question.prompt}
                          index={globalIndex}
                          value={answers[question.id]?.value}
                          onChange={value => handleAnswerChange(question.id, value)}
                          lowLabel="Not like me"
                          highLabel="Very like me"
                        />

                        {isAnswered && isLastInModule && (
                          <div className="mt-5 flex items-center gap-2 text-xs text-[var(--success)]" role="status">
                            <CheckCircle2 size={13} />
                            <span>Module complete. Ready for next module.</span>
                          </div>
                        )}
                      </article>
                    );
                  })()}
                </>
              )}
            </div>

            {/* Navigation */}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="gap-2"
              >
                <ArrowLeft size={16} /> Previous module
                <kbd className="hidden sm:inline-flex ml-2 px-1.5 py-0.5 text-[9px] font-mono bg-[var(--muted)] rounded">Alt+←</kbd>
              </Button>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <p className="text-[10px] font-mono text-[var(--muted-foreground)] hidden sm:block">
                  Shortcuts: <kbd className="px-1 py-0.5 bg-[var(--muted)] rounded">Alt+←</kbd> Prev · <kbd className="px-1 py-0.5 bg-[var(--muted)] rounded">Alt+→</kbd> Next · <kbd className="px-1 py-0.5 bg-[var(--muted)] rounded">⌘+S</kbd> Save · <kbd className="px-1 py-0.5 bg-[var(--muted)] rounded">⌘+O</kbd> Overview
                </p>
                <div className="flex gap-3">
                  {page < totalPages - 1 ? (
                    <Button
                      type="button"
                      variant="gold"
                      size="lg"
                      onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                      className="gap-2"
                    >
                      Next module <ArrowRight size={16} />
                      <kbd className="hidden sm:inline-flex ml-2 px-1.5 py-0.5 text-[9px] font-mono bg-[var(--muted)] rounded">Alt+→</kbd>
                    </Button>
                  ) : (
                    <Button
                    type="button"
                    variant="gold"
                    size="lg"
                    onClick={completeAssessment}
                    disabled={!assessmentComplete}
                    className="gap-2"
                  >
                    <CheckCircle2 size={16} /> Complete assessment
                  </Button>
                )}
              </div>
        </div>
        </div>
        </div>
        </main>
      )}

      {/* Waiting Stage */}
      {stage === "waiting" && (
        <main className="container py-20">
          <div className="mx-auto max-w-xl text-center" role="status" aria-live="polite">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--gold)]/20">
              {paymentState === "idle" || paymentState === "verifying" ? (
                <Loader2 className="animate-spin text-[var(--gold)]" />
              ) : (
                <LockKeyhole className="text-[var(--gold)]" />
              )}
            </div>
            <h1 className="text-display text-3xl font-semibold mt-8 text-[var(--foreground)]">
              {paymentState === "idle" ? "Loading your report." : "Verifying your payment."}
            </h1>
            <p className="mt-5 text-base leading-7 text-[var(--muted-foreground)]">
              {paymentState === "idle"
                ? "We are retrieving your saved assessment report. Please keep this window open."
                : "We are confirming the Paystack transaction before unlocking your report. Please keep this window open."}
            </p>
            {paymentState === "paid" && <p className="mt-5 font-bold text-[var(--success)]">Payment verified. Your report is unlocked.</p>}
            {error && <p className="mt-7 border-l-2 border-[var(--destructive)] bg-[var(--destructive)]/10 px-4 py-3 text-left text-sm text-[var(--destructive)]">{error}</p>}
          </div>
        </main>
      )}

      {/* Report Stage */}
      {stage === "report" && report && (
        <main className="container py-8 lg:py-12">
          <div className="mx-auto max-w-5xl">
            {paymentState === "paid" && (
              <div className="mb-8 flex items-center gap-3 border-l-2 border-[var(--success)] bg-[var(--success)]/10 px-5 py-4 text-sm text-[var(--success)]">
                <CheckCircle2 size={18} />
                <span><strong>Payment verified.</strong> Your report is unlocked and ready to review.</span>
              </div>
            )}
            <ReportSectionTabs
              sections={[
                {
                  id: "summary",
                  label: "Executive Summary",
                  content: (
                    <section className="border border-[var(--gold)] bg-[var(--navy-deep)] p-6 text-[var(--background)] sm:p-8">
                      <div className="flex items-start justify-between gap-5">
                        <div>
                          <p className="eyebrow text-[var(--gold)]">Executive summary · managers & coaching</p>
                          <h2 className="text-display text-2xl font-semibold mt-3">
                            {report.executiveSummary?.headline ?? `${report.overallBand}: a practical view of your current capability pattern`}
                          </h2>
                        </div>
                        <span className="hidden border border-[var(--gold)]/60 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[var(--gold)] sm:block">One-page brief</span>
                      </div>
                      <p className="mt-5 max-w-3xl text-sm leading-7 text-[var(--muted-foreground)]">
                        {report.executiveSummary?.overview ?? "Use this report as a professional development conversation starter, pairing the signal with observed behavior, context, feedback, and outcomes."}
                      </p>
                      <div className="mt-7 grid gap-6 border-t border-[var(--gold)]/30 pt-6 lg:grid-cols-2">
                        <div>
                          <p className="eyebrow text-[var(--gold)]">Recommended priorities</p>
                          <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted-foreground)]">
                            {(report.executiveSummary?.priorities ?? report.focusAreas).map(priority => (
                              <li key={priority} className="border-l border-[var(--gold)] pl-3">{priority}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="eyebrow text-[var(--gold)]">Discussion prompts</p>
                          <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted-foreground)]">
                            {(report.executiveSummary?.discussionPrompts ?? report.reflectionPoints).slice(0, 3).map(prompt => (
                              <li key={prompt} className="flex gap-2">→ {prompt}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </section>
                  ),
                },
                {
                  id: "score",
                  label: "Score & Dimensions",
                  content: (
                    <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
                      <div>
                        <p className="eyebrow text-[var(--gold)]">Assessment report / verified payment</p>
                        <h1 className="text-display text-4xl font-semibold leading-[1.05] tracking-tight mt-5 text-[var(--navy-deep)]">
                          Your current <br /><em className="font-normal text-[var(--gold)]">signal.</em>
                        </h1>
                        <p className="mt-7 text-lg leading-8 text-[var(--muted-foreground)]">Use this snapshot as a starting point for a more intentional development conversation.</p>
                        <div className="mt-7 border-l-2 border-[var(--gold)] bg-[var(--muted)]/30 px-5 py-4">
                          <p className="eyebrow text-[var(--gold)]">Prepared for</p>
                          <p className="mt-2 text-base font-bold text-[var(--foreground)]">{name}</p>
                          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{email}</p>
                        </div>
                        <div className="mt-10 border-t border-[var(--border)] pt-5">
                          <p className="eyebrow text-[var(--gold)]">Overall foundation</p>
                          <p className="text-display text-5xl font-semibold mt-3 text-[var(--foreground)]">{report.overallScore}<span className="text-2xl text-[var(--muted-foreground)]"> / 100</span></p>
                          <p className="mt-3 text-sm font-bold uppercase tracking-[.14em] text-[var(--muted-foreground)]">{report.overallBand}</p>
                        </div>
                      </div>
                      <div>
                        <div className="grid gap-5 sm:grid-cols-2">
                          {report.dimensions.map((dimension: AssessmentDimensionReport) => (
                            <div key={dimension.key} className="border border-[var(--border)] bg-[var(--card)] p-5">
                              <div className="flex items-start justify-between gap-3">
                                <h2 className="text-sm font-extrabold text-[var(--foreground)]">{dimension.label}</h2>
                                <span className="text-display text-2xl text-[var(--gold)]">{dimension.score}</span>
                              </div>
                              <ProgressRing value={dimension.score} size={6} strokeWidth={1} className="w-full h-1 bg-[var(--border)] rounded-full mt-3" showLabel={false}>
                                <div className="h-full bg-[var(--gold)] rounded-full" style={{ width: `${dimension.score}%` }} />
                              </ProgressRing>
                              <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">{dimension.description}</p>
                              <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">{dimension.readout}</p>
                              <div className="mt-5 border-t border-[var(--border)] pt-4">
                                <p className="text-[10px] font-black uppercase tracking-[.12em] text-[var(--gold)]">Reflection workspace</p>
                                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">Capture your own evidence, then mark the action as planned, active, or reviewed.</p>
                                {dimension.reflectionPoints.map((point, idx) => (
                                  <ReflectionPromptCard
                                    key={`${dimension.key}-${idx}`}
                                    prompt={point}
                                    note={reflectionDrafts[`${dimension.key}-${idx}`]?.note ?? ""}
                                    status={reflectionDrafts[`${dimension.key}-${idx}`]?.status ?? "planned"}
                                    selected={reflectionDrafts[`${dimension.key}-${idx}`]?.selected ?? false}
                                    saving={false}
                                    onNoteChange={note => setReflectionDrafts(prev => ({ ...prev, [`${dimension.key}-${idx}`]: { ...prev[`${dimension.key}-${idx}`], note } }))}
                                    onStatusChange={status => setReflectionDrafts(prev => ({ ...prev, [`${dimension.key}-${idx}`]: { ...prev[`${dimension.key}-${idx}`], status } }))}
                                    onSelectedChange={selected => setReflectionDrafts(prev => ({ ...prev, [`${dimension.key}-${idx}`]: { ...prev[`${dimension.key}-${idx}`], selected } }))}
                                    onSave={() => {}}
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  id: "insights",
                  label: "Insights & Actions",
                  content: (
                    <div className="space-y-8">
                      <div>
                        <p className="eyebrow text-[var(--gold)]">Development insights</p>
                        <h2 className="text-display text-2xl font-semibold mt-3 text-[var(--navy-deep)]">Your personalized development roadmap</h2>
                        <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">Based on your assessment pattern, these are the capabilities that will move the needle most.</p>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        {report.focusAreas.map((area, index) => (
                          <Card key={index} className="border-[var(--border)] bg-[var(--card)]">
                            <CardHeader>
                              <CardTitle className="text-lg text-[var(--navy-deep)]">{area}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-[var(--muted-foreground)]">Focus on building this capability through deliberate practice and feedback.</p>
                              <div className="mt-4 flex gap-2">
                                <Button variant="outline" size="sm">Add to plan</Button>
                                <Button variant="ghost" size="sm">Learn more</Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </main>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--navy-deep)]/80 backdrop-blur-sm" role="dialog" aria-modal="true">
          <CheckoutForm
            product={{
              name: "Self-Assessment Report",
              priceKes: ASSESSMENT_PRICE_KES,
              type: "assessment",
              slug: "self-assessment",
            }}
            prefilled={user ? { email: user.email || undefined, name: user.name || undefined } : undefined}
            upsells={[
              { id: "coaching", name: "1-on-1 Coaching Session", priceKes: 5000, description: "60-minute personalized debrief with a certified coach" },
              { id: "careerpath", name: "CareerPath Bundle", priceKes: 15000, description: "Assessment + CareerPath report + development plan" },
            ]}
            onSuccess={handleCheckoutSuccess}
            onClose={() => setShowCheckout(false)}
          />
        </div>
      )}

      {/* Preferences Sheet */}
      <Sheet open={preferencesOpen} onOpenChange={setPreferencesOpen}>
        <SheetContent side="right" className="w-full border-l border-[var(--gold)] bg-[var(--card)] sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-display text-2xl">Assessment preferences</SheetTitle>
            <SheetDescription className="text-[var(--muted-foreground)]">Manage how your progress is saved and restored.</SheetDescription>
          </SheetHeader>
          <div className="mt-8 space-y-6">
            <div>
              <p className="eyebrow text-[var(--gold)]">Auto-save</p>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">Your progress is automatically saved every 30 seconds while answering questions.</p>
            </div>
            <div>
              <p className="eyebrow text-[var(--gold)]">Resume link</p>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">Generate a private link to continue on another device.</p>
              <Button variant="outline" size="sm" onClick={copyResumeLink} className="mt-3 w-full" disabled={!resumeUrl}>
                {resumeUrl ? <><Clipboard size={14} className="mr-2" /> Copy resume link</> : <><Loader2 size={14} className="mr-2 animate-spin" /> Generating...</>}
              </Button>
              {resumeCopyFallback && resumeUrl && (
                <input className="mt-2 w-full border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-xs" readOnly value={resumeUrl} />
              )}
            </div>
            <div>
              <p className="eyebrow text-[var(--gold)]">Export progress</p>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">Download your current answers as a JSON file for backup.</p>
              <Button variant="outline" size="sm" onClick={() => { const blob = new Blob([JSON.stringify({ savedAt: Date.now(), currentModule: page, responses: answers }, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `assessment-progress-${Date.now()}.json`; a.click(); URL.revokeObjectURL(url); }} className="mt-3 w-full">
                <Download size={14} className="mr-2" /> Export progress
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Certificate Preview Dialog */}
      <Dialog open={certificatePreviewOpen} onOpenChange={setCertificatePreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-display text-xl">Completion certificate preview</DialogTitle>
            <DialogDescription>Preview your personalized certificate before downloading.</DialogDescription>
          </DialogHeader>
          <div className="aspect-[4/3] border border-[var(--border)] bg-[var(--card)] rounded-xl overflow-hidden">
            <div className="flex h-full items-center justify-center text-[var(--muted-foreground)]">Certificate preview would render here</div>
          </div>
          <DialogFooter className="flex gap-3">
            <Button variant="outline" onClick={downloadCompletionCertificate}><Download size={14} className="mr-2" /> SVG</Button>
            <Button variant="gold" onClick={downloadCompletionCertificatePdf} disabled={false}><Download size={14} className="mr-2" /> PDF</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
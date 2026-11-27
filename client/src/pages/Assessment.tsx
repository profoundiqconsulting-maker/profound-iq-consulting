/* Profound IQ Consulting — Assessment flow redesigned for executive conversion */
import { useEffect, useMemo, useRef, useState } from "react";
import { PUBLISHED_SITE_ORIGIN } from "@shared/siteOrigin";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clipboard,
  Compass,
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
  buildReport,
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

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
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
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ReflectionPromptCard } from "@/components/ReflectionPromptCard";
import { ReportSectionTabs } from "@/components/ReportSectionTabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AssessmentResults from "@/pages/AssessmentResults";
import { LikertScale } from "@/components/LikertScale";
import { ProgressRing } from "@/components/ui/progress-ring";
import { motion, useReducedMotion } from "framer-motion";
import {
  ProgressMotionBar,
  ProgressCelebration,
  EncouragementMessage,
} from "@/components/ProgressMotion";
import { cn } from "@/lib/utils";
import {
  buildReflectionExportCsv,
  type ReflectionStatus,
} from "@shared/reflectionWorkflow";

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

function progressColor(value: number): string {
  if (value >= 67) return "var(--success)";
  if (value >= 34) return "var(--warning)";
  return "var(--danger)";
}

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
          className="text-[var(--brand)]"
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
                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${moduleProgress}%`, backgroundColor: progressColor(moduleProgress) }} />
              </div>
              <span className="text-xs font-bold text-[var(--brand)]">{moduleProgress}%</span>
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
                ? "bg-[var(--brand)] text-[var(--navy-deep)] shadow"
                : assessmentComplete || (i < modulePage && answeredCount > 0)
                ? "bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]"
                : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--brand)]/10 hover:text-[var(--brand)] border border-[var(--border)]"
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
  const reduceMotion = useReducedMotion();
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
  const [showPreferences] = useState(false);
  const [localDraft, setLocalDraft] = useState<{ savedAt: number; currentModule: number; responses: Record<string, AssessmentAnswer> } | null>(null);
  const [skipResumePrompt, setSkipResumePrompt] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [savedPulse, setSavedPulse] = useState(false);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [moduleCelebration, setModuleCelebration] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string | null>(() => new URLSearchParams(window.location.search).get("resume"));
  const [resumeCopyFallback, setResumeCopyFallback] = useState(false);
  const [pendingImport, setPendingImport] = useState<{ responseCount: number; draft: { currentModule: number; savedAt: number } } | null>(null);
  const [isDraggingImport, setIsDraggingImport] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

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

  const completeAssessment = () => {
    if (!assessmentComplete) return;
    setReport(buildReport(Object.values(answers)));
    setStage("report");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openPreviousReport = async () => {
    if (!localDraft || localDraftCompletion !== 100) return;
    setStage("report");
    window.sessionStorage.setItem("piq-assessment-reference", "");
    window.localStorage.setItem("piq-assessment-paid-reference", "");
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

  const progress = assessmentQuestions.length > 0 ? Math.round((answeredCount / assessmentQuestions.length) * 100) : 0;

  if (stage === "report" && report) {
    return (
      <AssessmentResults
        report={report}
        reference={reportReference}
        name={name}
        email={email}
        answers={Object.values(answers)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-body">
      <TransformationNav active="assessment" />

      {/* Intro Stage */}
      {stage === "intro" && (
        <main className="container py-12 sm:py-16 lg:py-24">
          <div className="mx-auto max-w-5xl">
              {pendingImport && (
              <section className="mb-6 bg-[var(--brand)]/10 p-5 text-[var(--foreground)] rounded-xl border border-[var(--brand)]/30" role="dialog" aria-label="Review imported progress">
                <p className="eyebrow text-[var(--brand)]">Review imported progress</p>
                <p className="mt-2 text-sm leading-6">
                  This file contains <strong>{pendingImport.responseCount} responses</strong> and was last saved on
                  <strong>{new Date(pendingImport.draft.savedAt).toLocaleString()}</strong>.
                </p>
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">Confirming will replace the assessment progress currently saved on this device.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button type="button" onClick={applyPendingImport} variant="brand">Use this progress</Button>
                  <Button type="button" variant="outline" onClick={() => setPendingImport(null)}>Cancel</Button>
                </div>
              </section>
              )}

            {/* Trust Bar */}
            <div className="mb-10 flex flex-wrap items-center gap-4 p-4 bg-[var(--brand)]/5 rounded-xl border border-[var(--brand)]/20">
              <div className="flex items-center gap-2 text-xs font-medium text-[var(--brand)]">
                <Shield size={14} />
                <span>Secure assessment</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-[var(--brand)]">
                <LockKeyhole size={14} />
                <span>Data encrypted & private</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-[var(--brand)]">
                <Award size={14} />
                <span>Certificate on completion</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-[var(--brand)]">
                <RotateCcw size={14} />
                <span>Satisfaction guarantee — contact us</span>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
              <div>
                <p className="eyebrow text-[var(--brand)]">Evidence-based self-reflection</p>
                <h1 className="text-display text-4xl font-semibold leading-[1.05] tracking-tight mt-3 sm:text-5xl text-[var(--navy-deep)]">
                  See the patterns behind your <em className="font-normal text-[var(--brand)]">potential.</em>
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--muted-foreground)]">
                  This 40-question Self Assessment helps you reflect on the capabilities that shape how you learn, lead, communicate, and move from insight to action.
                </p>

                {/* Key Benefits */}
                <div className="mt-7 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  {[
                    { icon: CheckCircle2, text: "Clarity on 10 capability dimensions" },
                    { icon: CheckCircle2, text: "Personalized 15+ page development report" },
                    { icon: CheckCircle2, text: "Instant certificate on completion" },
                    { icon: CheckCircle2, text: "6-month access to your results & resources" },
                    { icon: CheckCircle2, text: "Auto-save & resume anytime" },
                    { icon: CheckCircle2, text: "Secure, private, no subscriptions" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--brand)]/15">
                        <item.icon className="h-4 w-4 text-[var(--brand)]" />
                      </div>
                      <span className="text-sm font-medium text-[var(--foreground)]">{item.text}</span>
                    </div>
                  ))}
                </div>

                {/* Social Proof */}
                <div className="mt-6 p-4 rounded-xl bg-[var(--navy-deep)]/5 border border-[var(--brand)]/10">
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--brand)] mb-3">Trusted by professionals across Kenya & beyond</p>
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
                <div className="mt-8 grid grid-cols-2 gap-6 border-t border-[var(--border)] pt-6 sm:grid-cols-4">
                  <div className="text-center">
                    <p className="text-display text-3xl font-bold text-[var(--brand)]">40</p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">Reflective prompts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-display text-3xl font-bold text-[var(--brand)]">10</p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">Capability dimensions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-display text-3xl font-bold text-[var(--brand)]">25 min</p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">Average completion</p>
                  </div>
                  <div className="text-center">
                    <p className="text-display text-3xl font-bold text-[var(--brand)]">Free</p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">No payment required</p>
                  </div>
                </div>
              </div>

              <aside className="bg-[var(--navy-deep)] p-7 text-[var(--background)] rounded-xl relative overflow-hidden">
                <div className="relative z-10 mb-6 rounded-xl border border-[var(--brand)]/25 bg-[var(--background)]/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[.14em] text-[var(--brand)]">Sample report</p>
                      <p className="mt-1 text-3xl font-bold leading-none">78<span className="text-base font-medium text-[var(--muted-foreground)]">/100</span></p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--brand)]">Proficient</p>
                    </div>
                    <ProgressRing value={78} size={60} strokeWidth={5} className="text-[var(--brand)]">
                      <span className="text-[9px] font-bold text-[var(--background)]">78%</span>
                    </ProgressRing>
                  </div>
                  <div className="mt-4 space-y-2">
                    {[
                      { label: "Leadership", score: 82 },
                      { label: "Communication", score: 74 },
                      { label: "Resilience", score: 61 },
                    ].map(dim => (
                      <div key={dim.label}>
                        <div className="flex items-center justify-between text-[10px] text-[var(--muted-foreground)]">
                          <span>{dim.label}</span>
                          <span className="font-bold text-[var(--background)]">{dim.score}</span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
                          <div className="h-full rounded-full bg-[var(--brand)]" style={{ width: `${dim.score}%`, backgroundColor: progressColor(dim.score) }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Sparkles className="text-[var(--brand)] relative z-10" size={20} />
                <p className="eyebrow mt-7 text-[var(--brand)] relative z-10">What you'll discover</p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted-foreground)] relative z-10">
                  {[
                    "Your natural strengths across 10 capability dimensions",
                    "Growth areas with specific development suggestions",
                    "Learning style & communication preferences",
                    "Leadership potential & decision-making patterns",
                    "Stress response & resilience indicators",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--brand)]/15">
                        <Check className="h-3 w-3 text-[var(--brand)]" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </aside>
            </div>

            {/* Resume Previous Session */}
            {localDraft && !skipResumePrompt && (
              <section className="mt-10 p-5 bg-[var(--muted)]/30 rounded-xl border border-[var(--brand)]/30">
                <p className="eyebrow text-[var(--brand)]">Previous session found</p>
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
                    <div className="h-full rounded-full" style={{ width: `${localDraftCompletion}%`, backgroundColor: progressColor(localDraftCompletion) }} />
                  </div>
                  <p className="mt-2 text-[10px] text-[var(--muted-foreground)]">
                    {localDraftCompletedModules} of {totalPages} modules completed
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button type="button" onClick={resumeLocalDraft} variant="brand">Resume previous session</Button>
                  <SocialSharing
                    url={shareUrl}
                    title={shareTitle}
                    text={shareMessage}
                    platforms={["linkedin", "x", "facebook", "instagram", "tiktok", "whatsapp", "copy", "native"]}
                    onShare={handleShare}
                    className="bg-transparent border-transparent shadow-none"
                  />
                </div>
              </section>
            )}

            {/* Overall Progress Bar */}
            <div className="mt-10 bg-[var(--muted)]/30 p-5 rounded-xl" aria-label="Self Assessment progress">
              <div className="flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[.12em] text-[var(--muted-foreground)]">
                <span>Evaluation progress</span>
                <span>{progress}%</span>
              </div>
              <div className="mt-3 h-2 bg-[var(--border)] rounded-full" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label={`${answeredCount} of ${assessmentQuestions.length} questions answered`}>
                <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: progressColor(progress) }} />
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
                    className="mt-3 w-full border-b border-[var(--border)] bg-transparent px-0 py-3 text-lg outline-none placeholder:text-[var(--muted-foreground)] focus:border-[var(--brand)]"
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
                    className="mt-3 w-full border-b border-[var(--border)] bg-transparent px-0 py-3 text-lg outline-none placeholder:text-[var(--muted-foreground)] focus:border-[var(--brand)]"
                  />
                </label>
              </div>
              <label className="mt-8 flex max-w-3xl items-start gap-3 text-sm leading-6 text-[var(--muted-foreground)]">
                <input required type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[var(--brand)]" />
                I consent to Profound IQ Consulting using my name and email to deliver and follow up on this assessment report. This is an educational self-reflection tool, not a clinical, medical, psychological, or employment diagnosis.
              </label>
              <Button type="submit" size="lg" variant="brand" className="mt-9 gap-3">
                Begin assessment <ArrowRight size={16} />
              </Button>
              <p className="mt-4 max-w-3xl text-xs leading-5 text-[var(--muted-foreground)]">
                <span className="font-bold uppercase tracking-wider text-[var(--brand)]">Satisfaction guarantee.</span>{" "}
                If the assessment doesn't meet your expectations, reach out — we'll review your case and discuss options.
              </p>
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

          <div className="mx-auto mb-6 max-w-3xl">
            <ProgressMotionBar value={progress} height={6} />
            <EncouragementMessage value={progress} className="mt-2" />
          </div>

          <div className="mx-auto max-w-3xl">
            {/* Module Header */}
            <div className="mb-8">
              <p className="eyebrow text-[var(--brand)]">Assessment / module {page + 1} of {totalPages}</p>
              <h1 className="text-display text-3xl font-semibold leading-[1.1] tracking-tight mt-2 text-[var(--navy-deep)]">{currentModule?.label ?? "Your assessment"}</h1>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">One module at a time, with space to reflect before moving forward.</p>
              <ProgressCelebration
                show={moduleCelebration}
                message={`${assessmentCopy.moduleCompleted} ${assessmentCopy.moduleCompletedDescription}`}
                className="mt-4"
              />
            </div>

            {/* Progress & Actions */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <ProgressRing
                  value={progress}
                  size={48}
                  strokeWidth={4}
                  className="text-[var(--brand)]"
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
                <p className={cn("text-xs text-[var(--muted-foreground)]", savedPulse && "animate-pulse text-[var(--brand)]")}>
                  {lastSavedAt ? `Saved ${new Date(lastSavedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Not saved yet"}
                </p>
                <Button type="button" variant="ghost" size="sm" onClick={saveNow} className="text-xs font-black uppercase tracking-[.1em] text-[var(--brand)] hover:text-[var(--navy-deep)]">{assessmentCopy.saveNow}</Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => setPreferencesOpen(true)} aria-label="Open assessment preferences"><Settings2 size={13} /></Button>
              </div>
            </div>

            {/* Module Overview Sheet */}
            <Sheet open={overviewOpen} onOpenChange={setOverviewOpen}>
              <Button type="button" variant="outline" size="sm" onClick={() => setOverviewOpen(true)} className="gap-2 border-[var(--border)] text-xs font-black uppercase tracking-[.12em]">
                <Menu size={15} /> Module overview <span className="text-[var(--brand)]">{completedModuleCount}/{totalPages}</span>
              </Button>
              <SheetContent side="right" className="w-full border-l border-[var(--brand)] bg-[var(--card)] sm:max-w-md">
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
                        variant={moduleIndex === page ? "brand" : complete ? "brand" : "outline"}
                        className="w-full justify-between gap-4 text-left"
                        onClick={() => { navigateToModule(moduleIndex); if (moduleIndex === page || !complete) setOverviewOpen(false); }}
                      >
                        <span>
                          <span className="block text-[10px] font-black uppercase tracking-[.14em] text-[var(--brand)]">Module {moduleIndex + 1}</span>
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
                      <motion.article
                        key={question.id}
                        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: reduceMotion ? 0 : 0.28, ease: "easeOut" }}
                        className={cn(
                          "relative overflow-hidden rounded-2xl p-6 transition-all duration-300",
                          "border bg-[var(--card)]",
                          isAnswered
                            ? "border-[var(--success)]/30 bg-[var(--success)]/5"
                            : "border-[var(--border)] hover:border-[var(--brand)]/30"
                        )}
                        aria-label={`Question ${globalIndex + 1} of ${assessmentQuestions.length}`}
                      >
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <span className="text-[10px] font-black uppercase tracking-[.14em] text-[var(--brand)]">
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
                          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${moduleProgress}%`, backgroundColor: progressColor(moduleProgress) }} />
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
                      </motion.article>
                    );
                  })()}
                </>
              )}
            </div>

            {/* Navigation */}
            <div className="sticky bottom-0 z-20 mt-10 flex flex-col gap-4 border-t border-[var(--border)] bg-[var(--bg-elevated)] py-4 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => navigateToModule(page - 1)}
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
                      variant="brand"
                      size="lg"
                      onClick={() => navigateToModule(page + 1)}
                      className="gap-2"
                    >
                      Next module <ArrowRight size={16} />
                      <kbd className="hidden sm:inline-flex ml-2 px-1.5 py-0.5 text-[9px] font-mono bg-[var(--muted)] rounded">Alt+→</kbd>
                    </Button>
                  ) : (
                    <Button
                    type="button"
                    variant="brand"
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
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--brand)]/20">
              <Loader2 className="animate-spin text-[var(--brand)]" />
            </div>
            <h1 className="text-display text-3xl font-semibold mt-8 text-[var(--foreground)]">
              Loading your report.
            </h1>
            <p className="mt-5 text-base leading-7 text-[var(--muted-foreground)]">
              We are retrieving your saved assessment report. Please keep this window open.
            </p>
          </div>
        </main>
      )}

      {/* Report Stage */}
      {stage === "report" && report && (
        <main className="container py-8 lg:py-12">
          <div className="mx-auto max-w-5xl">
            <ReportSectionTabs
              sections={[
                {
                  id: "summary",
                  label: "Executive Summary",
                  content: (
                    <section className="border border-[var(--brand)] bg-[var(--navy-deep)] p-6 text-[var(--background)] sm:p-8 relative overflow-hidden">
                      <div className="absolute top-0 right-0 -mx-6 -my-6 opacity-10 pointer-events-none">
                        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="100" cy="100" r="90" stroke="var(--brand)" strokeOpacity="0.15" strokeWidth="2" />
                          <path d="M100 10 L108 60 L100 110 L92 60 Z" fill="var(--brand)" opacity="0.1" />
                          <circle cx="100" cy="60" r="3" fill="var(--brand)" opacity="0.3" />
                        </svg>
                      </div>
                      <div className="relative z-10 flex items-start justify-between gap-5">
                        <div>
                          <p className="eyebrow text-[var(--brand)]">Executive summary · managers & coaching</p>
                          <h2 className="text-display text-2xl font-semibold mt-3">
                            {report.executiveSummary?.headline ?? `${report.overallBand}: a practical view of your current capability pattern`}
                          </h2>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <div className="relative w-16 h-16">
                            <ProgressRing value={report.overallScore} size={64} strokeWidth={5} className="text-[var(--brand)]">
                              <span className="text-[10px] font-bold text-[var(--background)]">{report.overallScore}%</span>
                            </ProgressRing>
                          </div>
                          <span className="hidden border border-[var(--brand)]/60 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[var(--brand)] sm:block">
                            One-page brief
                          </span>
                        </div>
                      </div>
                      <p className="mt-5 max-w-3xl text-sm leading-7 text-[var(--muted-foreground)]">
                        {report.executiveSummary?.overview ?? "Use this report as a professional development conversation starter, pairing the signal with observed behavior, context, feedback, and outcomes."}
                      </p>
                      <div className="mt-7 grid gap-6 border-t border-[var(--brand)]/30 pt-6 lg:grid-cols-2">
                        <div>
                          <p className="eyebrow text-[var(--brand)]">Recommended priorities</p>
                          <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted-foreground)]">
                            {(report.executiveSummary?.priorities ?? report.focusAreas).map((priority, idx) => (
                              <li key={priority} className="border-l border-[var(--brand)] pl-3 relative">
                                <span className="absolute -left-3 top-0 h-5 w-5 rounded-full bg-[var(--brand)] text-[var(--navy-deep)] text-[10px] font-bold flex items-center justify-center">
                                  {idx + 1}
                                </span>
                                {priority}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="eyebrow text-[var(--brand)]">Coaching conversation starters</p>
                          <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted-foreground)]">
                            {(report.executiveSummary?.discussionPrompts ?? report.reflectionPoints).slice(0, 3).map((prompt, idx) => (
                              <li key={prompt} className="flex gap-2">
                                <span className="text-[var(--brand)]">→</span>{" "}
                                {prompt}
                              </li>
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
                    <div className="space-y-8">
                      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-6 border-b border-[var(--border)]">
                        <div>
                          <p className="eyebrow text-[var(--brand)">Capability profile</p>
                          <h2 className="text-display text-3xl font-semibold mt-2 text-[var(--navy-deep)]">
                            Your dimension scores at a glance
                          </h2>
                          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                            {report.overallScore}/100 overall · {report.overallBand} ·{" "}
                            {report.dimensions.length} dimensions assessed
                          </p>
                        </div>
                        <div className="flex items-center gap-4 lg:ml-auto">
                          <div className="relative w-24 h-24">
                            <ProgressRing value={report.overallScore} size={96} strokeWidth={6} className="text-[var(--brand)]">
                              <span className="text-2xl font-bold text-[var(--foreground)]">
                                {report.overallScore}%
                              </span>
                            </ProgressRing>
                          </div>
                          <div>
                            <p className="text-display text-3xl font-bold text-[var(--foreground)]">
                              {report.overallScore}
                              <span className="text-xl text-[var(--muted-foreground)]">
                                /100
                              </span>
                            </p>
                            <p className="text-sm font-bold uppercase tracking-[.14em] text-[var(--brand)]">
                              {report.overallBand}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Radar + Bar charts side by side */}
                      <div className="grid gap-6 lg:grid-cols-2">
                        <Card className="border-[var(--border)] bg-[var(--card)]">
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                              <Compass className="h-4 w-4 text-[var(--brand)]" />
                              <CardTitle className="text-base text-[var(--navy-deep)]">
                                Capability radar
                              </CardTitle>
                            </div>
                            <p className="text-xs text-[var(--muted-foreground)]">
                              Shape shows where your signal is strongest and where to focus.
                            </p>
                          </CardHeader>
                          <CardContent className="pt-0 h-[380px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart
                                data={report.dimensions.map((d: AssessmentDimensionReport) => ({
                                  subject: d.label,
                                  score: d.score,
                                }))}
                              >
                                <PolarGrid stroke="var(--border)" />
                                <PolarAngleAxis
                                  dataKey="subject"
                                  tick={{
                                    fontSize: 10,
                                    fill: "var(--muted-foreground)",
                                  }}
                                />
                                <PolarRadiusAxis domain={[0, 100]} />
                                <Radar
                                  name="Your score"
                                  dataKey="score"
                                  stroke="var(--brand)"
                                  fill="var(--brand)"
                                  fillOpacity={0.2}
                                  strokeWidth={2}
                                />
                                <Tooltip
                                  content={({ active, payload }: any) => {
                                    if (active && payload && payload.length) {
                                      const dataPoint = payload[0].payload;
                                      return (
                                        <div className="bg-[var(--card)] border border-[var(--border)] p-2 text-xs">
                                          <div className="font-bold text-[var(--foreground)]">{dataPoint.subject}</div>
                                          <div className="text-[var(--brand)]">{dataPoint.score}/100</div>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                              </RadarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>

                        <Card className="border-[var(--border)] bg-[var(--card)]">
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                              <BarChart3 className="h-4 w-4 text-[var(--brand)]" />
                              <CardTitle className="text-base text-[var(--navy-deep)]">
                                Dimension scores
                              </CardTitle>
                            </div>
                            <p className="text-xs text-[var(--muted-foreground)]">
                              Colour shows performance level — green strength, gold
                              developing, red priority.
                            </p>
                          </CardHeader>
                          <CardContent className="pt-0 h-[380px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={report.dimensions.map((d: AssessmentDimensionReport) => ({
                                  name: d.label,
                                  score: d.score,
                                }))}
                                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis
                                  dataKey="name"
                                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                                  interval={0}
                                  angle={-15}
                                  textAnchor="end"
                                  height={50}
                                />
                                <YAxis domain={[0, 100]} />
                                <Tooltip
                                  formatter={(value: any) => [`${value}/100`, "Score"]}
                                />
                                <Bar dataKey="score" radius={[4, 4, 0, 0]} background={{ fill: "var(--muted)" }}>
                                  {report.dimensions.map((d: AssessmentDimensionReport, i: number) => (
                                    <Cell
                                      key={i}
                                      fill={
                                        d.score >= 70
                                          ? "var(--success)"
                                          : d.score >= 50
                                            ? "var(--brand)"
                                            : "var(--danger)"
                                      }
                                    />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Dimension cards grid */}
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {report.dimensions.map((dimension: AssessmentDimensionReport) => (
                          <Card
                            key={dimension.key}
                            className={cn(
                              "border-[var(--border)] bg-[var(--card)] transition-all hover:shadow-lg hover:border-[var(--brand)]/30",
                              dimension.score >= 70 &&
                                "border-l-4 border-l-[var(--success)]",
                              dimension.score >= 50 &&
                                dimension.score < 70 &&
                                "border-l-4 border-l-[var(--warning)]",
                              dimension.score < 50 &&
                                "border-l-4 border-l-[var(--danger)]"
                            )}
                          >
                            <CardContent className="p-5">
                              <div className="flex items-center justify-between mb-3">
                                <span
                                  className={cn(
                                    "inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-[.12em]",
                                    dimension.score >= 70
                                      ? "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]"
                                      : dimension.score >= 50
                                        ? "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]"
                                        : "bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]"
                                  )}
                                >
                                  {dimension.score >= 70
                                    ? "Strength"
                                    : dimension.score >= 50
                                      ? "Developing"
                                      : "Priority"}
                                </span>
                              </div>

                              <div className="flex items-baseline justify-between gap-3 mb-3">
                                <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                                  {dimension.label}
                                </h3>
                                <span className="text-display text-2xl text-[var(--brand)]">
                                  {dimension.score}
                                </span>
                              </div>

                              <div className="w-full h-1 bg-[var(--border)] rounded-full mb-3 overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all duration-700",
                                    dimension.score >= 70 && "bg-[var(--success)]",
                                    dimension.score >= 50 &&
                                      dimension.score < 70 &&
                                      "bg-[var(--warning)]",
                                    dimension.score < 50 && "bg-[var(--danger)]"
                                  )}
                                  style={{ width: `${dimension.score}%` }}
                                />
                              </div>

                              <div className="mb-3 flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-[.12em] text-[var(--muted-foreground)]">
                                <span>Response consistency</span>
                                <span
                                  className={cn(
                                    dimension.reliability >= 70
                                      ? "text-[var(--success)]"
                                      : dimension.reliability >= 40
                                        ? "text-[var(--warning)]"
                                        : "text-[var(--danger)]"
                                  )}
                                >
                                  {dimension.reliability}%
                                </span>
                              </div>

                              <p className="text-xs leading-5 text-[var(--muted-foreground)] mb-3">
                                {dimension.description}
                              </p>
                              <p className="text-sm leading-6 text-[var(--muted-foreground)]">
                                {dimension.readout}
                              </p>

                              <div className="mt-5 border-t border-[var(--border)] pt-4">
                                <p className="text-[10px] font-black uppercase tracking-[.12em] text-[var(--brand)]">Reflection workspace</p>
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
                                    cardId={`${dimension.key}-${idx}`}
                                  />
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ),
                },
                {
                  id: "insights",
                  label: "Insights & Actions",
                  content: (
                    <div className="space-y-8">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                          <p className="eyebrow text-[var(--brand)">Development insights</p>
                          <h2 className="text-display text-2xl font-semibold mt-3 text-[var(--navy-deep)]">Your personalized development roadmap</h2>
                          <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">Based on your assessment pattern, these are the capabilities that will move the needle most.</p>
                        </div>
                        <div className="flex h-24 w-24 shrink-0">
                          <svg viewBox="0 0 120 120" className="h-full w-full" role="img" aria-label="Development compass illustration">
                            <defs>
                              <linearGradient id="compassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="var(--brand)" />
                                <stop offset="100%" stopColor="var(--navy-deep)" />
                              </linearGradient>
                            </defs>
                            <circle cx="60" cy="60" r="52" fill="var(--bg-elevated)" stroke="var(--border)" strokeWidth="1" />
                            <circle cx="60" cy="60" r="40" fill="none" stroke="var(--brand)" strokeWidth="1.5" strokeDasharray="4 4" />
                            <path d="M60 18 L68 60 L60 102 L52 60 Z" fill="url(#compassGrad)" />
                            <path d="M18 60 L60 52 L102 60 L60 68 Z" fill="var(--navy-deep)" opacity="0.7" />
                            <circle cx="60" cy="60" r="6" fill="var(--navy-deep)" stroke="var(--brand)" strokeWidth="2" />
                          </svg>
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        {report.focusAreas.map((area: string, index: number) => (
                          <Card key={index} className="border-[var(--border)] bg-[var(--card)]">
                            <CardHeader>
                              <CardTitle className="text-lg text-[var(--navy-deep)]">{area}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-[var(--muted-foreground)]">Focus on building this capability through deliberate practice and feedback.</p>
                              <div className="mt-4 flex gap-2">
                                <Link href="/dashboard">
                                  <Button variant="outline" size="sm">Add to plan</Button>
                                </Link>
                                <Link href="/courses">
                                  <Button variant="ghost" size="sm">Learn more</Button>
                                </Link>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {/* Strengths vs focus areas comparison */}
                      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
                        <div className="flex flex-col lg:flex-row gap-8">
                          <div className="flex-1">
                            <p className="eyebrow text-[var(--success)]">Your strengths</p>
                            <h3 className="text-lg font-bold text-[var(--foreground)] mb-3">Leading capabilities</h3>
                            <ul className="space-y-3">
                              {report.strengths.map((strength: string, idx: number) => (
                                <li key={strength} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--success)]/5 border border-[var(--success)]/20">
                                  <span className="flex shrink-0 items-center justify-center w-6 h-6 rounded-full bg-[var(--success)] text-[var(--navy-deep)] text-[10px] font-bold">
                                    {idx + 1}
                                  </span>
                                  <span className="text-sm font-semibold text-[var(--foreground)]">{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="flex-1">
                            <p className="eyebrow text-[var(--brand)]">Development priorities</p>
                            <h3 className="text-lg font-bold text-[var(--foreground)] mb-3">Focus areas</h3>
                            <ul className="space-y-3">
                              {report.focusAreas.map((area: string, idx: number) => (
                                <li key={area} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--brand)]/5 border border-[var(--brand)]/20">
                                  <span className="flex shrink-0 items-center justify-center w-6 h-6 rounded-full bg-[var(--brand)] text-[var(--navy-deep)] text-[10px] font-bold">
                                    {idx + 1}
                                  </span>
                                  <span className="text-sm font-semibold text-[var(--foreground)]">{area}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </main>
      )}

      {/* Preferences Sheet */}
      <Sheet open={preferencesOpen} onOpenChange={setPreferencesOpen}>
        <SheetContent side="right" className="w-full border-l border-[var(--brand)] bg-[var(--card)] sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-display text-2xl">Assessment preferences</SheetTitle>
            <SheetDescription className="text-[var(--muted-foreground)]">Manage how your progress is saved and restored.</SheetDescription>
          </SheetHeader>
          <div className="mt-8 space-y-6">
            <div>
              <p className="eyebrow text-[var(--brand)]">Auto-save</p>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">Your progress is automatically saved every 30 seconds while answering questions.</p>
            </div>
            <div>
              <p className="eyebrow text-[var(--brand)]">Resume link</p>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">Generate a private link to continue on another device.</p>
              <Button variant="outline" size="sm" onClick={copyResumeLink} className="mt-3" disabled={!resumeUrl}>
                {resumeUrl ? <><Clipboard size={14} className="mr-2" /> Copy resume link</> : <><Loader2 size={14} className="mr-2 animate-spin" /> Generating...</>}
              </Button>
              {resumeCopyFallback && resumeUrl && (
                <input className="mt-2 w-full border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-xs" readOnly value={resumeUrl} />
              )}
            </div>
            <div>
              <p className="eyebrow text-[var(--brand)]">Export progress</p>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">Download your current answers as a JSON file for backup.</p>
              <Button variant="outline" size="sm" onClick={() => { const blob = new Blob([JSON.stringify({ savedAt: Date.now(), currentModule: page, responses: answers }, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `assessment-progress-${Date.now()}.json`; a.click(); URL.revokeObjectURL(url); }} className="mt-3 w-full">
                <Download size={14} className="mr-2" /> Export progress
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
/* Profound IQ Consulting — assessment experience. Keep the paid self-assessment reflective and non-diagnostic, with clear progress, visible KES pricing, and payment-gated reporting. */
import { useEffect, useMemo, useRef, useState } from "react";
import { PUBLISHED_SITE_ORIGIN } from "@shared/siteOrigin";
import {
  ArrowLeft,
  ArrowRight,
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
  Save,
  Settings2,
  Share2,
  ShieldCheck,
  Sparkles,
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
  type RoleLens,
} from "@shared/assessment";
import { trpc } from "@/lib/trpc";
import { TransformationNav } from "@/components/TransformationNav";

import { useAuth } from "@/_core/hooks/useAuth";
import { LOGO_URL } from "@/components/BrandLogo";
import { getAssessmentCopy } from "@shared/assessmentLocalization";
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
import {
  buildReflectionExportCsv,
  type ReflectionStatus,
} from "@shared/reflectionWorkflow";
import PaystackInlineModal, {
  type PaystackInlineProduct,
} from "@/components/PaystackInlineModal";

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
}: {
  stage: AssessmentStage;
  modulePage: number;
  totalModules: number;
}) {
  const steps = [
    { id: "intro", label: "Introduction" },
    {
      id: "questions",
      label: totalModules
        ? `Modules ${modulePage + 1} of ${totalModules}`
        : "Modules",
    },
    { id: "waiting", label: "Checkout" },
    { id: "report", label: "Report" },
  ] as const;
  const currentIndex = steps.findIndex(step => step.id === stage);

  return (
    <nav
      aria-label="Assessment progress"
      className="sticky top-0 z-40 border-b border-[#16243d]/10 bg-[#f7f3e8]/95 py-3 backdrop-blur sm:py-4"
    >
      <ol className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
        {steps.map((step, index) => (
          <li key={step.id} className="flex min-w-0 items-center gap-3">
            <span
              className={`grid h-7 w-7 shrink-0 place-items-center border text-[10px] font-black transition-all duration-300 ${index === currentIndex ? "border-[#c9a34e] bg-[#c9a34e] text-[#16243d] scale-110" : index < currentIndex ? "border-[#a27e2e] text-[#7d5e1e]" : "border-[#16243d]/20 text-[#657084]"}`}
            >
              {index < currentIndex ? "✓" : index + 1}
            </span>
            <span
              className={`truncate text-[10px] font-black uppercase tracking-[.1em] transition-colors duration-300 ${index === currentIndex ? "text-[#16243d]" : index < currentIndex ? "text-[#7d5e1e]" : "text-[#657084]"}`}
            >
              {step.label}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function AssessmentContentPagination({
  currentPage,
  pageCount,
  questionCount,
  hasNextModule,
  onPageChange,
}: {
  currentPage: number;
  pageCount: number;
  questionCount: number;
  hasNextModule: boolean;
  onPageChange: (page: number) => void;
}) {
  if (pageCount <= 1) return null;
  const firstQuestion = currentPage * QUESTIONS_PER_CONTENT_PAGE + 1;
  const lastQuestion = Math.min(
    questionCount,
    (currentPage + 1) * QUESTIONS_PER_CONTENT_PAGE
  );
  const isFinalContentPage = currentPage === pageCount - 1;
  return (
    <nav
      aria-label="Questions in this module"
      className="mb-6 flex flex-wrap items-center justify-between gap-4 border border-[#16243d]/10 bg-white/55 px-4 py-3"
    >
      <p className="text-xs font-semibold text-[#657084]">
        Questions {firstQuestion}-{lastQuestion} of {questionCount}
      </p>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="border-[#16243d]/25"
        >
          Previous
        </Button>
        <span className="text-[10px] font-black uppercase tracking-[.1em] text-[#7d5e1e]">
          Page {currentPage + 1} of {pageCount}
        </span>
        <Button
          type="button"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isFinalContentPage && !hasNextModule}
          className="bg-[#16243d] text-[#f7f3e8]"
        >
          {isFinalContentPage ? "Next module" : "Next"}
        </Button>
      </div>
    </nav>
  );
}

export default function Assessment() {
  const utils = trpc.useUtils();
  const [, navigate] = useLocation();
  const locale = "en";

  const { user, isAuthenticated } = useAuth();
  const assessmentCopy = getAssessmentCopy(locale);
  const [stage, setStage] = useState<AssessmentStage>(() =>
    getPendingReportReference() ? "waiting" : "intro"
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [page, setPage] = useState(0);
  const [contentPage, setContentPage] = useState(0);
  const [contentAdvanceNotice, setContentAdvanceNotice] = useState("");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [report, setReport] = useState<AssessmentReport | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(() => {
    const stored = Number(sessionStorage.getItem("piq-assessment-attempt-id"));
    return Number.isInteger(stored) && stored > 0 ? stored : null;
  });
  const [reflectionDrafts, setReflectionDrafts] = useState<
    Record<string, ReflectionDraft>
  >({});
  const [savingReflectionKey, setSavingReflectionKey] = useState<string | null>(
    null
  );
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [paymentState, setPaymentState] = useState<
    "idle" | "verifying" | "paid"
  >("idle");
  const [inlineModalOpen, setInlineModalOpen] = useState(false);
  const [inlineProduct, setInlineProduct] =
    useState<PaystackInlineProduct | null>(null);
  const [roleLens, setRoleLens] = useState<RoleLens>("leadership");
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [introModalOpen, setIntroModalOpen] = useState(
    () => !getPendingReportReference()
  );
  const [saveSuccessOpen, setSaveSuccessOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeCopyFallback, setResumeCopyFallback] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(
    () => window.localStorage.getItem("piq-assessment-last-saved") ?? ""
  );
  const [dontShowModulePrompt, setDontShowModulePrompt] = useState(
    () =>
      window.localStorage.getItem("piq-assessment-skip-module-prompt") ===
      "true"
  );
  const [modulePromptDontShowAgain, setModulePromptDontShowAgain] =
    useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [clearDataOpen, setClearDataOpen] = useState(false);
  const [savedPulse, setSavedPulse] = useState(false);
  const [assessmentTheme, setAssessmentTheme] = useState<
    "system" | "light" | "dark"
  >(() => {
    const stored = window.localStorage.getItem("piq-assessment-theme");
    return stored === "light" || stored === "dark" ? stored : "system";
  });
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false
  );
  const assessmentDark =
    assessmentTheme === "dark" || (assessmentTheme === "system" && systemDark);
  const [localDraft, setLocalDraft] = useState<{
    name: string;
    email: string;
    answers: Record<string, number>;
    currentModule: number;
    savedAt: string;
  } | null>(() => {
    try {
      const raw = window.localStorage.getItem("piq-assessment-local-draft");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [skipResumePrompt, setSkipResumePrompt] = useState(
    () =>
      window.localStorage.getItem("piq-assessment-skip-resume-prompt") ===
      "true"
  );
  const [isDraggingImport, setIsDraggingImport] = useState(false);
  const [pendingImport, setPendingImport] = useState<{
    draft: {
      name: string;
      email: string;
      answers: Record<string, number>;
      currentModule: number;
      savedAt: string;
    };
    responseCount: number;
  } | null>(null);
  const [pendingModuleIndex, setPendingModuleIndex] = useState<number | null>(
    null
  );
  const [moduleRailCollapsed, setModuleRailCollapsed] = useState(
    () => window.localStorage.getItem("piq-module-rail-collapsed") === "true"
  );
  const [moduleSearchQuery, setModuleSearchQuery] = useState("");
  const [mobileReviewMode, setMobileReviewMode] = useState(false);
  const [highPotentialOnly, setHighPotentialOnly] = useState(
    () =>
      window.localStorage.getItem("piq-module-rail-high-potential") === "true"
  );
  const [highPotentialSort, setHighPotentialSort] = useState<
    "default" | "improvement"
  >(() =>
    window.localStorage.getItem("piq-module-rail-high-potential-sort") ===
    "improvement"
      ? "improvement"
      : "default"
  );
  const [moduleNavigationConfirmOpen, setModuleNavigationConfirmOpen] =
    useState(false);
  const [moduleCelebration, setModuleCelebration] = useState(false);
  const [certificatePreviewOpen, setCertificatePreviewOpen] = useState(false);
  const resumeToken = useMemo(
    () => new URLSearchParams(window.location.search).get("resume"),
    []
  );
  const reportReference = useMemo(() => getPendingReportReference(), []);
  const importInputRef = useRef<HTMLInputElement>(null);
  const firstQuestionRef = useRef<HTMLDivElement>(null);

  const initializePayment = trpc.assessment.initializePayment.useMutation();
  const initializeInlinePayment =
    trpc.assessment.initializeInlinePayment.useMutation();
  const saveDraft = trpc.assessment.saveDraft.useMutation();
  const resendDraft = trpc.assessment.resendDraft.useMutation();
  const resumeDraft = trpc.assessment.resumeDraft.useQuery(
    { token: resumeToken ?? "" },
    { enabled: Boolean(resumeToken), retry: false }
  );
  const verifyPayment = trpc.assessment.verifyPayment.useMutation();
  const downloadCertificatePdf =
    trpc.assessment.downloadCompletionCertificatePdf.useMutation();
  const certificatePreview = trpc.assessment.certificateSvgPreview.useQuery(
    { reference: reportReference },
    {
      enabled:
        isAuthenticated && certificatePreviewOpen && Boolean(reportReference),
      retry: false,
    }
  );
  const paidReport = trpc.assessment.getReport.useQuery(
    { reference: reportReference },
    { enabled: Boolean(reportReference) && !report, retry: false }
  );
  const reflectionResponses = trpc.assessment.reflectionResponses.useQuery(
    { attemptId: attemptId ?? 0 },
    {
      enabled: isAuthenticated && stage === "report" && Boolean(attemptId),
      retry: false,
    }
  );
  const saveReflection = trpc.assessment.saveReflectionResponse.useMutation();
  const exportReflection =
    trpc.assessment.exportReflectionResponses.useMutation();
  const trackEvent = trpc.analytics.track.useMutation();
  const assessmentModules = useMemo(
    () =>
      dimensions.map(dimension => ({
        key: dimension.key,
        label: dimension.label,
        questions: assessmentQuestions.filter(
          question => question.dimension === dimension.key
        ),
      })),
    []
  );
  const currentModule = assessmentModules[page] ?? assessmentModules[0];
  const moduleQuestions = currentModule?.questions ?? [];
  const contentPageCount = Math.max(
    1,
    Math.ceil(moduleQuestions.length / QUESTIONS_PER_CONTENT_PAGE)
  );
  const currentQuestions = moduleQuestions.slice(
    contentPage * QUESTIONS_PER_CONTENT_PAGE,
    (contentPage + 1) * QUESTIONS_PER_CONTENT_PAGE
  );
  const answeredCount = Object.keys(answers).length;
  const lensReadout = report ? buildRoleLens(report, roleLens) : null;
  const reflectionPrompts = useMemo(
    () =>
      report?.dimensions.flatMap(dimension =>
        getDimensionReflectionPoints(dimension).map((prompt, promptIndex) => ({
          key: `${dimension.key}:${promptIndex}`,
          dimensionKey: dimension.key,
          dimensionLabel: dimension.label,
          promptIndex,
          prompt,
        }))
      ) ?? [],
    [report]
  );
  const totalPages = assessmentModules.length;
  const pageComplete =
    moduleQuestions.length > 0 &&
    moduleQuestions.every(question => answers[question.id]);
  const contentPageComplete =
    currentQuestions.length > 0 &&
    currentQuestions.every(question => Boolean(answers[question.id]));
  const currentModuleStart = assessmentModules
    .slice(0, page)
    .reduce((sum, module) => sum + module.questions.length, 0);
  const completedModuleCount = assessmentModules.filter(module =>
    module.questions.every(question => Boolean(answers[question.id]))
  ).length;
  const assessmentComplete = answeredCount === assessmentQuestions.length;
  const incompleteModuleLabels = assessmentModules
    .filter(
      module =>
        !module.questions.every(question => Boolean(answers[question.id]))
    )
    .map(module => module.label);
  const localDraftAnsweredCount = localDraft
    ? Object.keys(localDraft.answers).length
    : 0;
  const localDraftCompletion = localDraft
    ? Math.round((localDraftAnsweredCount / assessmentQuestions.length) * 100)
    : 0;
  const localDraftCompletedModules = localDraft
    ? assessmentModules.filter(module =>
        module.questions.every(question =>
          Boolean(localDraft.answers[question.id])
        )
      ).length
    : 0;

  useEffect(() => {
    if (!isAuthenticated || stage !== "intro" || !user) return;
    if (!name.trim() && user.name?.trim()) setName(user.name.trim());
    if (!email.trim() && user.email?.trim()) setEmail(user.email.trim());
  }, [email, isAuthenticated, name, stage, user]);
  useEffect(() => {
    setContentPage(0);
  }, [page]);
  useEffect(() => {
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!media) return;
    const onChange = (event: MediaQueryListEvent) =>
      setSystemDark(event.matches);
    media.addEventListener?.("change", onChange);
    return () => media.removeEventListener?.("change", onChange);
  }, []);
  useEffect(() => {
    document.title = "Self Assessment | Profound IQ Consulting";
    const description =
      "Complete the Profound IQ Self Assessment to understand your strengths, development patterns, and next steps for purposeful growth.";
    const ensureMeta = (
      selector: string,
      attributes: Record<string, string>,
      content: string
    ) => {
      let node = document.head.querySelector(
        selector
      ) as HTMLMetaElement | null;
      if (!node) {
        node = document.createElement("meta");
        Object.entries(attributes).forEach(([key, value]) =>
          node?.setAttribute(key, value)
        );
        document.head.appendChild(node);
      }
      node.setAttribute("content", content);
    };
    ensureMeta(
      'meta[name="description"]',
      { name: "description" },
      description
    );
    ensureMeta(
      'meta[property="og:title"]',
      { property: "og:title" },
      "Self Assessment | Profound IQ Consulting"
    );
    ensureMeta(
      'meta[property="og:description"]',
      { property: "og:description" },
      description
    );
    ensureMeta('meta[property="og:type"]', { property: "og:type" }, "website");
    ensureMeta(
      'meta[property="og:url"]',
      { property: "og:url" },
      `${PUBLISHED_SITE_ORIGIN}/assessment`
    );
  }, []);

  useEffect(() => {
    const onSearch = (event: Event) =>
      setModuleSearchQuery((event as CustomEvent<string>).detail || "");
    window.addEventListener("piq-search-query", onSearch);
    return () => window.removeEventListener("piq-search-query", onSearch);
  }, []);
  const highlightModuleLabel = (label: string) => {
    const query = moduleSearchQuery.trim();
    if (!query) return label;
    const index = label.toLowerCase().indexOf(query.toLowerCase());
    if (index < 0) return label;
    return (
      <>
        {label.slice(0, index)}
        <mark className="bg-[#c9a34e]/45 px-0.5 text-inherit">
          {label.slice(index, index + query.length)}
        </mark>
        {label.slice(index + query.length)}
      </>
    );
  };
  const toggleModuleRail = () =>
    setModuleRailCollapsed(collapsed => {
      const next = !collapsed;
      window.localStorage.setItem("piq-module-rail-collapsed", String(next));
      return next;
    });
  const toggleHighPotentialFilter = () =>
    setHighPotentialOnly(enabled => {
      const next = !enabled;
      window.localStorage.setItem(
        "piq-module-rail-high-potential",
        String(next)
      );
      return next;
    });
  const moduleRailItems = useMemo(
    () =>
      assessmentModules
        .map((module, moduleIndex) => {
          const complete = module.questions.every(question =>
            Boolean(answers[question.id])
          );
          const moduleScore = complete
            ? Math.round(
                (module.questions.reduce(
                  (sum, question) => sum + (answers[question.id] ?? 0),
                  0
                ) /
                  module.questions.length) *
                  20
              )
            : null;
          return {
            module,
            moduleIndex,
            moduleScore,
            improvement: moduleScore === null ? 0 : 100 - moduleScore,
          };
        })
        .filter(item => !highPotentialOnly || item.improvement >= 20)
        .sort((a, b) =>
          highPotentialSort === "improvement"
            ? b.improvement - a.improvement || a.moduleIndex - b.moduleIndex
            : a.moduleIndex - b.moduleIndex
        ),
    [assessmentModules, answers, highPotentialOnly, highPotentialSort]
  );
  const selectHighPotentialSort = (value: "default" | "improvement") => {
    setHighPotentialSort(value);
    window.localStorage.setItem("piq-module-rail-high-potential-sort", value);
  };
  const reviewSection = (moduleIndex: number) => {
    navigateToModule(moduleIndex);
    if (window.matchMedia?.("(max-width: 639px)").matches)
      setMobileReviewMode(true);
  };

  useEffect(() => {
    if (stage !== "questions") return;
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, [contenteditable=true]"))
        return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "m") {
        event.preventDefault();
        toggleModuleRail();
        return;
      }
      if (event.key === "ArrowLeft" && page > 0) {
        event.preventDefault();
        setPage(current => Math.max(0, current - 1));
        toast.success(
          `Moved to ${assessmentModules[page - 1]?.label ?? "previous module"}`,
          { description: "Previous module opened." }
        );
      }
      if (event.key === "ArrowRight" && page < totalPages - 1 && pageComplete) {
        event.preventDefault();
        goToModule(Math.min(totalPages - 1, page + 1));
        toast.success(
          `Moved to ${assessmentModules[page + 1]?.label ?? "next module"}`,
          { description: "Next module opened." }
        );
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [stage, page, totalPages, pageComplete]);

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") toast.dismiss();
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, []);

  useEffect(() => {
    if (!reflectionPrompts.length) return;
    setReflectionDrafts(current => {
      const next = { ...current };
      reflectionPrompts.forEach(item => {
        if (!next[item.key])
          next[item.key] = { note: "", status: "planned", selected: false };
      });
      (reflectionResponses.data?.rows ?? []).forEach(row => {
        const key = `${row.dimensionKey}:${row.promptIndex}`;
        next[key] = {
          note: row.note ?? "",
          status: row.status as ReflectionStatus,
          selected: next[key]?.selected ?? Boolean(row.note),
        };
      });
      return next;
    });
  }, [reflectionPrompts, reflectionResponses.data]);

  useEffect(() => {
    if (!paidReport.data || report) return;
    setReport(paidReport.data.report as AssessmentReport);
    setAttemptId(
      Number(sessionStorage.getItem("piq-assessment-attempt-id") ?? 0) || null
    );
    setStage("report");
  }, [paidReport.data, report]);
  useEffect(() => {
    if (!paidReport.isError || report) return;
    setStage("intro");
    setIntroModalOpen(false);
    setError(
      "This report link is no longer available. Open it again from your dashboard."
    );
  }, [paidReport.isError, report]);
  useEffect(() => {
    if (!resumeDraft.data) return;
    const savedAnswers = resumeDraft.data.answers as Array<{
      questionId: string;
      value: number;
    }>;
    setName(resumeDraft.data.name);
    setEmail(resumeDraft.data.email);
    setAnswers(
      Object.fromEntries(
        savedAnswers.map(answer => [answer.questionId, answer.value])
      )
    );
    setPage(
      Math.min(
        Math.max(0, resumeDraft.data.currentModule),
        Math.max(0, totalPages - 1)
      )
    );
    setConsent(true);
    setStage("questions");
    toast.success(assessmentCopy.progressRestored, {
      description: assessmentCopy.progressRestoredDescription,
    });
  }, [resumeDraft.data, totalPages]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const returnedReference =
      params.get("reference") ||
      sessionStorage.getItem("piq-assessment-reference");
    if (params.get("payment") !== "success" || !returnedReference) return;
    setReference(returnedReference);
    setPaymentState("verifying");
    setStage("waiting");
    verifyPayment.mutate(
      { reference: returnedReference },
      {
        onSuccess: result => {
          setPaymentState("paid");
          setReport(result.report as AssessmentReport);
          setEmailSent(result.emailSent);
          setStage("report");
          window.localStorage.setItem(
            "piq-assessment-paid-reference",
            returnedReference
          );
          sessionStorage.removeItem("piq-assessment-reference");
          void utils.dashboard.mine.refetch();
          toast.success("Payment verified", {
            description: "Your assessment report is now unlocked.",
          });
        },
        onError: verificationError => {
          setPaymentState("idle");
          setError(verificationError.message);
          toast.error("Payment verification needs attention", {
            description: verificationError.message,
          });
        },
      }
    );
  }, []);

  useEffect(() => {
    if (!inlineModalOpen || !inlineProduct?.reference) return;
    let cancelled = false;
    const tick = async () => {
      if (cancelled) return;
      try {
        await new Promise<void>(resolve => {
          verifyPayment.mutate(
            { reference: inlineProduct.reference },
            {
              onSuccess: result => {
                if (!cancelled) {
                  setPaymentState("paid");
                  setReport(result.report as AssessmentReport);
                  setEmailSent(result.emailSent);
                  setStage("report");
                  setInlineModalOpen(false);
                  setInlineProduct(null);
                  window.localStorage.setItem(
                    "piq-assessment-paid-reference",
                    inlineProduct.reference
                  );
                  sessionStorage.removeItem("piq-assessment-reference");
                  toast.success("Payment verified", {
                    description: "Your assessment report is now unlocked.",
                  });
                }
                resolve();
              },
              onError: () => resolve(),
            }
          );
        });
      } catch {
        // keep polling
      } finally {
        if (!cancelled) setTimeout(tick, 3000);
      }
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, [inlineModalOpen, inlineProduct?.reference, verifyPayment]);

  const saveReflectionPrompt = async (
    item: (typeof reflectionPrompts)[number]
  ) => {
    if (!attemptId) return;
    const draft = reflectionDrafts[item.key] ?? {
      note: "",
      status: "planned",
      selected: false,
    };
    setSavingReflectionKey(item.key);
    try {
      await saveReflection.mutateAsync({
        attemptId,
        dimensionKey: item.dimensionKey,
        promptIndex: item.promptIndex,
        promptText: item.prompt,
        note: draft.note,
        status: draft.status,
      });
      toast.success("Reflection saved", {
        description: `${item.dimensionLabel} is ready for your next review.`,
      });
    } catch (saveError) {
      toast.error("Could not save reflection", {
        description:
          saveError instanceof Error ? saveError.message : "Please try again.",
      });
    } finally {
      setSavingReflectionKey(null);
    }
  };

  const exportSelectedReflections = async () => {
    if (!attemptId) return;
    const selected = reflectionPrompts.filter(
      item => reflectionDrafts[item.key]?.selected
    );
    if (!selected.length) {
      toast.error("Select at least one prompt", {
        description:
          "Choose the prompts you want to share with a coach or manager.",
      });
      return;
    }
    try {
      const payload = await exportReflection.mutateAsync({
        attemptId,
        selections: selected.map(item => ({
          dimensionKey: item.dimensionKey,
          promptIndex: item.promptIndex,
          note: reflectionDrafts[item.key]?.note ?? "",
          status: reflectionDrafts[item.key]?.status ?? "planned",
        })),
      });
      const csv = buildReflectionExportCsv(
        payload.rows.map(row => ({
          dimensionLabel: row.dimensionLabel,
          promptText: row.promptText,
          note: row.note,
          status: row.status as ReflectionStatus,
        }))
      );
      const url = URL.createObjectURL(
        new Blob([csv], { type: "text/csv;charset=utf-8" })
      );
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `profound-iq-reflection-export-${payload.attemptId}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast.success("Coach export downloaded", {
        description: `${payload.rows.length} selected prompt${payload.rows.length === 1 ? "" : "s"} included.`,
      });
    } catch (exportError) {
      toast.error("Could not create export", {
        description:
          exportError instanceof Error
            ? exportError.message
            : "Please try again.",
      });
    }
  };

  const persistLocalDraft = (
    nextAnswers: Record<string, number>,
    nextPage = page
  ) => {
    const savedAt = new Date().toISOString();
    const draft = {
      name,
      email,
      answers: nextAnswers,
      currentModule: nextPage,
      savedAt,
    };
    window.localStorage.setItem(
      "piq-assessment-local-draft",
      JSON.stringify(draft)
    );
    window.localStorage.setItem("piq-assessment-last-saved", savedAt);
    setLocalDraft(draft);
    setLastSavedAt(savedAt);
    setSavedPulse(true);
    window.setTimeout(() => setSavedPulse(false), 1200);
  };

  const autoSaveTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (stage !== "questions" || !name.trim() || !email.trim()) return;
    if (autoSaveTimer.current) window.clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = window.setTimeout(() => {
      const answersArray = Object.entries(answers).map(
        ([questionId, value]) => ({ questionId, value })
      );
      saveDraft.mutate({
        name: name.trim(),
        email: email.trim(),
        answers: answersArray,
        currentModule: page,
        origin: window.location.origin,
      });
    }, 2000);
    return () => {
      if (autoSaveTimer.current) window.clearTimeout(autoSaveTimer.current);
    };
  }, [stage, name, email, answers, page, saveDraft]);

  const resumeLocalDraft = () => {
    if (!localDraft) return;
    setName(localDraft.name);
    setEmail(localDraft.email);
    setAnswers(localDraft.answers);
    setPage(
      Math.min(
        Math.max(0, localDraft.currentModule),
        Math.max(0, totalPages - 1)
      )
    );
    setConsent(true);
    setStage("questions");
    toast.success(assessmentCopy.progressRestored, {
      description: assessmentCopy.progressRestoredDescription,
    });
  };

  const discardLocalDraft = () => {
    window.localStorage.removeItem("piq-assessment-local-draft");
    window.localStorage.removeItem("piq-assessment-last-saved");
    setLocalDraft(null);
    setLastSavedAt("");
    toast.success("Previous session cleared");
  };

  const exportLocalDraft = () => {
    const draft = {
      name,
      email,
      answers,
      currentModule: page,
      savedAt: lastSavedAt || new Date().toISOString(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(draft, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `profound-iq-assessment-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast.success("Progress export downloaded", {
      description:
        "Your current assessment answers are saved as a private JSON file.",
    });
  };

  const importProgressFile = async (file: File) => {
    try {
      if (
        file.type &&
        file.type !== "application/json" &&
        !file.name.toLowerCase().endsWith(".json")
      )
        throw new Error("Choose a JSON progress export file.");
      const parsed = JSON.parse(await file.text()) as {
        name?: unknown;
        email?: unknown;
        answers?: unknown;
        currentModule?: unknown;
        savedAt?: unknown;
      };
      const answerEntries =
        parsed.answers &&
        typeof parsed.answers === "object" &&
        !Array.isArray(parsed.answers)
          ? Object.entries(parsed.answers)
          : [];
      const validQuestionIds = new Set(
        assessmentQuestions.map(question => question.id)
      );
      const importedAnswers = Object.fromEntries(
        answerEntries.filter(
          ([questionId, value]) =>
            validQuestionIds.has(questionId) &&
            typeof value === "number" &&
            value >= 1 &&
            value <= 5 &&
            Number.isInteger(value)
        )
      );
      if (
        typeof parsed.name !== "string" ||
        typeof parsed.email !== "string" ||
        answerEntries.length !== Object.keys(importedAnswers).length ||
        typeof parsed.currentModule !== "number" ||
        !Number.isInteger(parsed.currentModule) ||
        parsed.currentModule < 0 ||
        parsed.currentModule >= totalPages
      )
        throw new Error(
          "This file is not a valid Profound IQ assessment progress export."
        );
      const savedAt =
        typeof parsed.savedAt === "string" &&
        !Number.isNaN(Date.parse(parsed.savedAt))
          ? parsed.savedAt
          : new Date().toISOString();
      const draft = {
        name: parsed.name,
        email: parsed.email,
        answers: importedAnswers,
        currentModule: parsed.currentModule,
        savedAt,
      };
      setPendingImport({
        draft,
        responseCount: Object.keys(importedAnswers).length,
      });
      toast.info("Review imported progress", {
        description:
          "Confirm the saved module and response count before replacing local progress.",
      });
    } catch (importError) {
      toast.error("Could not import progress", {
        description:
          importError instanceof Error
            ? importError.message
            : "Choose a valid JSON progress export.",
      });
    }
  };

  const importProgress = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) await importProgressFile(file);
  };

  const downloadCompletionCertificatePdf = () => {
    if (!reportReference) {
      toast.error(assessmentCopy.certificatePdfUnavailable, {
        description: assessmentCopy.accessReport,
      });
      return;
    }
    downloadCertificatePdf.mutate(
      { reference: reportReference },
      {
        onSuccess: result => {
          const anchor = document.createElement("a");
          anchor.href = `data:${result.contentType};base64,${result.data}`;
          anchor.download = result.filename;
          document.body.appendChild(anchor);
          anchor.click();
          anchor.remove();
          toast.success(assessmentCopy.certificatePdfDownloaded);
        },
        onError: downloadError =>
          toast.error("Could not download certificate PDF", {
            description: downloadError.message,
          }),
      }
    );
  };
  const downloadCompletionCertificate = () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="800" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="#101d35"/><rect x="36" y="36" width="1128" height="728" fill="none" stroke="#c9a34e" stroke-width="3"/><image href="${PUBLISHED_SITE_ORIGIN}${LOGO_URL}" x="520" y="72" width="160" height="74" preserveAspectRatio="xMidYMid meet"/><text x="600" y="180" fill="#c9a34e" text-anchor="middle" font-family="Arial" font-size="24" letter-spacing="6">PROFOUND IQ CONSULTING</text><text x="600" y="300" fill="#f7f3e8" text-anchor="middle" font-family="Georgia" font-size="62">Completion certificate</text><text x="600" y="390" fill="#c1cad7" text-anchor="middle" font-family="Arial" font-size="24">Self Assessment completed</text><text x="600" y="520" fill="#c9a34e" text-anchor="middle" font-family="Georgia" font-size="42">Clarity is a capability.</text><text x="600" y="620" fill="#c1cad7" text-anchor="middle" font-family="Arial" font-size="18">Issued ${new Date().toLocaleDateString()}</text></svg>`;
    const anchor = document.createElement("a");
    anchor.href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    anchor.download = "profound-iq-self-assessment-completion-certificate.svg";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    toast.success("Completion certificate downloaded");
  };
  const openPreviousReport = () => {
    if (!reportReference) {
      navigate("/dashboard");
      toast.info(assessmentCopy.accessReport, {
        description: assessmentCopy.certificatePdfUnavailable,
      });
      return;
    }
    window.location.href = `/assessment?reference=${encodeURIComponent(reportReference)}`;
  };
  const shareAchievement = async () => {
    const shareData = {
      title: "Profound IQ assessment complete",
      text: "I completed my Profound IQ Consulting assessment.",
      url: `${PUBLISHED_SITE_ORIGIN}/assessment`,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(
          `${shareData.text} ${shareData.url}`
        );
        toast.success("Achievement link copied", {
          description: "Share it with someone who supports your development.",
        });
      } else throw new Error("Sharing is unavailable in this browser.");
    } catch (shareError) {
      if ((shareError as DOMException).name !== "AbortError")
        toast.error("Could not share achievement", {
          description:
            shareError instanceof Error
              ? shareError.message
              : "Try copying the assessment link manually.",
        });
    }
  };
  const shareAchievementVia = (channel: "whatsapp" | "email") => {
    const text =
      "I completed my Profound IQ Consulting Self Assessment. Clarity is a capability.";
    if (channel === "whatsapp")
      window.open(
        `https://wa.me/?text=${encodeURIComponent(`${text} ${PUBLISHED_SITE_ORIGIN}/assessment`)}`,
        "_blank",
        "noopener,noreferrer"
      );
    else
      window.location.href = `mailto:?subject=${encodeURIComponent("My Profound IQ Self Assessment")}&body=${encodeURIComponent(`${text}\n${PUBLISHED_SITE_ORIGIN}/assessment`)}`;
  };

  const applyPendingImport = () => {
    if (!pendingImport) return;
    window.localStorage.setItem(
      "piq-assessment-local-draft",
      JSON.stringify(pendingImport.draft)
    );
    window.localStorage.setItem(
      "piq-assessment-last-saved",
      pendingImport.draft.savedAt
    );
    setLocalDraft(pendingImport.draft);
    setLastSavedAt(pendingImport.draft.savedAt);
    setSkipResumePrompt(false);
    window.localStorage.removeItem("piq-assessment-skip-resume-prompt");
    setPendingImport(null);
    toast.success("Progress imported", {
      description: `${pendingImport.responseCount} responses are ready to resume.`,
    });
  };

  const setAnswer = (questionId: string, value: number) => {
    const nextAnswers = { ...answers, [questionId]: value };
    setAnswers(nextAnswers);
    persistLocalDraft(nextAnswers);
  };

  const beginAssessment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    trackEvent.mutate({
      eventName: "assessment_started",
      metadata: { source: "assessment" },
    });
    setStage("questions");
  };

  const finishAndPay = () => {
    setError("");
    if (!assessmentComplete) {
      setError(
        `Answer every question before checkout. ${incompleteModuleLabels.length} module${incompleteModuleLabels.length === 1 ? "" : "s"} still ${incompleteModuleLabels.length === 1 ? "needs" : "need"} responses: ${incompleteModuleLabels.join(", ")}.`
      );
      return;
    }
    const payload: AssessmentAnswer[] = assessmentQuestions.map(question => ({
      questionId: question.id,
      value: answers[question.id],
    }));
    initializeInlinePayment.mutate(
      { name, email, answers: payload, consent: true },
      {
        onSuccess: result => {
          setAttemptId(result.attemptId);
          sessionStorage.setItem(
            "piq-assessment-attempt-id",
            String(result.attemptId)
          );
          sessionStorage.setItem("piq-assessment-reference", result.reference);
          setInlineProduct({
            accessCode: result.accessCode,
            reference: result.reference,
            amountKes: result.amountKes,
            productName: result.productName,
            productType: result.productType as "assessment",
          });
          setInlineModalOpen(true);
        },
        onError: paymentError => setError(paymentError.message),
      }
    );
  };

  const saveNow = () => {
    const savedAt = new Date().toISOString();
    const draft = { name, email, answers, currentModule: page, savedAt };
    window.localStorage.setItem(
      "piq-assessment-local-draft",
      JSON.stringify(draft)
    );
    setLocalDraft(draft);
    window.localStorage.setItem("piq-assessment-last-saved", savedAt);
    setLastSavedAt(savedAt);
    setSavedPulse(true);
    window.setTimeout(() => setSavedPulse(false), 1200);
    toast.success("Progress saved on this device", {
      description:
        "No email was sent. You can continue whenever you are ready.",
    });
  };

  const saveAndContinueLater = () => {
    setError("");
    if (!name.trim() || !email.trim()) {
      setError("Add your name and email before saving your progress.");
      return;
    }
    saveDraft.mutate(
      {
        name: name.trim(),
        email: email.trim(),
        answers: Object.entries(answers).map(([questionId, value]) => ({
          questionId,
          value,
        })),
        currentModule: page,
        origin: PUBLISHED_SITE_ORIGIN,
      },
      {
        onSuccess: result => {
          const savedAt = new Date().toISOString();
          setLastSavedAt(savedAt);
          window.localStorage.setItem("piq-assessment-last-saved", savedAt);
          setSavedPulse(true);
          window.setTimeout(() => setSavedPulse(false), 1200);
          setResumeUrl(result.resumeUrl);
          setResumeCopyFallback(false);
          setSaveSuccessOpen(true);
          toast.success("Resume link sent", {
            description: `Check your inbox. The link expires ${new Date(result.expiresAt).toLocaleDateString()}.`,
          });
        },
        onError: saveError => setError(saveError.message),
      }
    );
  };

  const goToModule = (moduleIndex: number) => {
    const movingForward = moduleIndex > page;
    setPage(moduleIndex);
    if (movingForward) {
      setModuleCelebration(true);
      window.setTimeout(() => setModuleCelebration(false), 1800);
      toast.success(assessmentCopy.moduleCompleted, {
        description: `${assessmentCopy.nextQuestionReady}: ${assessmentModules[moduleIndex]?.label ?? "your next capability"}.`,
      });
    }
    window.requestAnimationFrame(() => firstQuestionRef.current?.focus());
  };
  const advanceAssessmentContent = (nextPage: number) => {
    if (nextPage < contentPage) {
      setContentPage(nextPage);
      return;
    }
    if (!contentPageComplete) {
      toast.info("Complete this page to continue", {
        description: "Answer each visible question before moving forward.",
      });
      return;
    }
    if (nextPage < contentPageCount) {
      setContentPage(nextPage);
      setContentAdvanceNotice("Page complete. Keep going.");
      window.setTimeout(() => setContentAdvanceNotice(""), 1800);
      return;
    }
    if (page < totalPages - 1) goToModule(page + 1);
  };
  const navigateToModule = (moduleIndex: number) => {
    if (moduleIndex === page) return;
    const targetComplete = assessmentModules[moduleIndex]?.questions.every(
      question => Boolean(answers[question.id])
    );
    if (targetComplete && !dontShowModulePrompt) {
      setPendingModuleIndex(moduleIndex);
      setModulePromptDontShowAgain(false);
      setModuleNavigationConfirmOpen(true);
      return;
    }
    goToModule(moduleIndex);
  };

  const confirmModuleNavigation = () => {
    if (modulePromptDontShowAgain) {
      setDontShowModulePrompt(true);
      window.localStorage.setItem("piq-assessment-skip-module-prompt", "true");
    }
    if (pendingModuleIndex !== null) goToModule(pendingModuleIndex);
    setPendingModuleIndex(null);
    setModuleNavigationConfirmOpen(false);
  };

  const copyResumeLink = async () => {
    if (!resumeUrl) return;
    try {
      if (!navigator.clipboard?.writeText)
        throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(resumeUrl);
      toast.success("Resume link copied", {
        description: "Keep it private until you are ready to continue.",
      });
    } catch {
      setResumeCopyFallback(true);
      toast.error("Copy is unavailable in this browser", {
        description: "Use the selectable link below to copy it manually.",
      });
    }
  };

  if (resumeToken && resumeDraft.isError && stage === "intro")
    return (
      <div className="min-h-screen bg-[#f7f3e8] text-[#16243d]">
        <TransformationNav active="assessment" />
        <main className="container grid min-h-[70vh] place-items-center py-16">
          <section className="max-w-xl border-t-2 border-[#c9a34e] bg-white/60 p-8 text-center shadow-sm">
            <p className="eyebrow text-[#7d5e1e]">Resume link unavailable</p>
            <h1 className="display mt-4 text-5xl leading-none">
              This saved session has expired.
            </h1>
            <p className="mt-5 text-base leading-7 text-[#657084]">
              For your privacy, saved assessment links expire after seven days.
              Start a new assessment to create a fresh session.
            </p>
            <Link
              href="/assessment"
              className="mt-8 inline-flex items-center gap-2 bg-[#c9a34e] px-5 py-4 text-[11px] font-black uppercase tracking-[.15em] text-[#101d35]"
            >
              {assessmentCopy.startOver} <ArrowRight size={15} />
            </Link>
          </section>
        </main>
      </div>
    );

  return (
    <div
      className={`min-h-screen ${assessmentDark ? "bg-[#101d35] text-[#f7f3e8]" : "bg-[#f7f3e8] text-[#16243d]"}`}
    >
      <TransformationNav active="assessment" />
      <main className="container py-12 sm:py-16 lg:py-24">
        <AssessmentFlowPagination
          stage={stage}
          modulePage={page}
          totalModules={totalPages}
        />
        {stage === "intro" && (
          <div className="mx-auto max-w-4xl">
            {error && (
              <p
                className="mb-6 border-l-2 border-red-700 bg-red-50 px-4 py-3 text-sm text-red-900"
                role="alert"
              >
                {error}
              </p>
            )}
            <div className="mb-6 flex flex-wrap justify-end gap-2">
              <input
                ref={importInputRef}
                type="file"
                accept="application/json,.json"
                onChange={importProgress}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setPreferencesOpen(true)}
                aria-label="Open assessment settings"
                title="Manage resume preferences"
                className="border-[#16243d]/25"
              >
                <Settings2 size={15} />
                <span className="hidden sm:inline">Settings</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => importInputRef.current?.click()}
                className="border-[#16243d]/25"
              >
                Import Progress
              </Button>
            </div>
            <div
              onDragOver={event => {
                event.preventDefault();
                setIsDraggingImport(true);
              }}
              onDragLeave={() => setIsDraggingImport(false)}
              onDrop={event => {
                event.preventDefault();
                setIsDraggingImport(false);
                const file = event.dataTransfer.files[0];
                if (file) void importProgressFile(file);
              }}
              className={`mb-6 border border-dashed p-4 text-center text-xs text-[#657084] transition ${isDraggingImport ? "border-[#c9a34e] bg-[#c9a34e]/10" : "border-[#16243d]/20 bg-white/30"}`}
            >
              <strong className="text-[#16243d]">
                Drop a JSON progress file here
              </strong>
              <span className="ml-1">or use Import Progress above.</span>
            </div>
            {pendingImport && (
              <section
                className="mb-6 border-l-2 border-[#c9a34e] bg-[#fffaf0] p-5 text-[#16243d]"
                role="dialog"
                aria-label="Review imported progress"
              >
                <p className="eyebrow text-[#7d5e1e]">
                  Review imported progress
                </p>
                <p className="mt-2 text-sm leading-6">
                  This file contains{" "}
                  <strong>{pendingImport.responseCount} responses</strong> and
                  was last saved in{" "}
                  <strong>
                    {assessmentModules[pendingImport.draft.currentModule]
                      ?.label ?? "your last module"}
                  </strong>{" "}
                  on {new Date(pendingImport.draft.savedAt).toLocaleString()}.
                </p>
                <p className="mt-2 text-xs text-[#657084]">
                  Confirming will replace the assessment progress currently
                  saved on this device.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    onClick={applyPendingImport}
                    className="bg-[#16243d] text-[#f7f3e8]"
                  >
                    Use this progress
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPendingImport(null)}
                    className="border-[#16243d]/25"
                  >
                    Cancel
                  </Button>
                </div>
              </section>
            )}
            <div className="grid gap-12 lg:grid-cols-[1fr_300px]">
              <div>
                <p className="eyebrow text-[#7d5e1e]">
                  A reflective development tool
                </p>
                <h1 className="display mt-5 max-w-2xl text-6xl leading-[.92] tracking-[-.05em] sm:text-7xl">
                  See the patterns behind your{" "}
                  <em className="font-normal text-[#7d5e1e]">potential.</em>
                </h1>
                <p className="mt-7 max-w-2xl text-lg leading-8 text-[#4a566a]">
                  This 100-question Self Assessment helps you reflect on the
                  capabilities that shape how you learn, lead, communicate, and
                  move from insight to action.
                </p>
                <div className="mt-10 grid gap-4 border-t border-[#16243d]/20 pt-6 sm:grid-cols-3">
                  <div>
                    <p className="display text-3xl">100</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[.12em] text-[#657084]">
                      Reflective prompts
                    </p>
                  </div>
                  <div>
                    <p className="display text-3xl">
                      KES {ASSESSMENT_PRICE_KES}
                    </p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[.12em] text-[#657084]">
                      One-time report fee
                    </p>
                  </div>
                  <div>
                    <p className="display text-3xl">10</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[.12em] text-[#657084]">
                      Capability dimensions
                    </p>
                  </div>
                </div>
              </div>
              <aside className="border-t border-[#c9a34e] bg-[#16243d] p-7 text-[#f7f3e8] lg:border-t-0 lg:border-l-0">
                <Sparkles className="text-[#c9a34e]" size={20} />
                <p className="eyebrow mt-7 text-[#c9a34e]">Before you begin</p>
                <p className="mt-4 text-sm leading-6 text-[#c1cad7]">
                  Answer honestly and quickly. There are no right answers; the
                  value is in noticing your current patterns.
                </p>
                <div className="mt-8 flex items-center gap-2 text-xs text-[#c1cad7]">
                  <LockKeyhole size={15} className="text-[#c9a34e]" /> Secure
                  Paystack checkout
                </div>
              </aside>
            </div>
            {localDraft && !skipResumePrompt && (
              <section
                className={`mt-10 border-l-2 border-[#c9a34e] p-5 ${assessmentDark ? "bg-[#16243d] text-[#f7f3e8]" : "bg-white/65 text-[#16243d]"}`}
              >
                <p className="eyebrow text-[#7d5e1e]">Previous session found</p>
                <p className="mt-2 text-sm leading-6">
                  Saved {new Date(localDraft.savedAt).toLocaleString()} with{" "}
                  {localDraftAnsweredCount} responses in{" "}
                  <strong>
                    {assessmentModules[localDraft.currentModule]?.label ??
                      "your last module"}
                  </strong>{" "}
                  — {localDraftCompletion}% complete.
                </p>
                <div
                  className="mt-4"
                  aria-label={`${localDraftCompletion}% of assessment completed`}
                  title={`${localDraftCompletedModules} of ${totalPages} modules completed`}
                >
                  <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-[.12em] text-[#657084]">
                    <span>Saved progress</span>
                    <span>{localDraftCompletion}%</span>
                  </div>
                  <div className="h-2 bg-[#16243d]/10">
                    <div
                      className="resume-progress-fill h-2 bg-[#c9a34e]"
                      style={{ width: `${localDraftCompletion}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[10px] text-[#657084]">
                    {localDraftCompletedModules} of {totalPages} modules
                    completed
                  </p>
                  {localDraftCompletion === 100 && (
                    <div
                      className="resume-celebration flex flex-wrap items-center gap-2"
                      aria-live="polite"
                      aria-label="All assessment modules completed"
                    >
                      {Array.from({ length: 12 }, (_, index) => (
                        <span
                          key={index}
                          style={
                            { "--confetti-index": index } as React.CSSProperties
                          }
                        />
                      ))}
                      <span className="relative z-10 text-[10px] font-black uppercase tracking-[.14em] text-[#7d5e1e]">
                        {assessmentCopy.moduleCompleted}
                      </span>
                      <Button
                        type="button"
                        onClick={openPreviousReport}
                        className="relative z-10 bg-transparent px-3 py-1 text-[10px] font-black uppercase tracking-[.1em] text-[#8a681f]"
                        variant="outline"
                      >
                        <Clipboard size={13} /> {assessmentCopy.accessReport}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setCertificatePreviewOpen(true)}
                        className="relative z-10 border-[#a27e2e] px-3 py-1 text-[10px] font-black uppercase tracking-[.1em] text-[#8a681f]"
                        variant="outline"
                      >
                        <Clipboard size={13} />{" "}
                        {assessmentCopy.previewCertificate}
                      </Button>
                      <Button
                        type="button"
                        onClick={downloadCompletionCertificatePdf}
                        disabled={downloadCertificatePdf.isPending}
                        className="relative z-10 bg-[#c9a34e] px-3 py-1 text-[10px] font-black uppercase tracking-[.1em] text-[#16243d]"
                      >
                        <Download size={13} />{" "}
                        {downloadCertificatePdf.isPending
                          ? assessmentCopy.certificatePdfPreparing
                          : assessmentCopy.certificatePdf}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={downloadCompletionCertificate}
                        className="relative z-10 border-[#a27e2e] px-3 py-1 text-[10px] font-black uppercase tracking-[.1em] text-[#8a681f]"
                      >
                        <Download size={13} /> {assessmentCopy.certificateSvg}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={shareAchievement}
                        className="relative z-10 border-[#a27e2e] px-3 py-1 text-[10px] font-black uppercase tracking-[.1em] text-[#8a681f]"
                      >
                        <Share2 size={13} /> Share Results
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => shareAchievementVia("whatsapp")}
                        aria-label="Share on WhatsApp"
                        className="relative z-10 border-[#a27e2e] px-3 py-1 text-[10px] text-[#8a681f]"
                      >
                        <MessageCircle size={13} />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => shareAchievementVia("email")}
                        aria-label="Share by email"
                        className="relative z-10 border-[#a27e2e] px-3 py-1 text-[10px] text-[#8a681f]"
                      >
                        <Mail size={13} />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    onClick={resumeLocalDraft}
                    className="bg-[#c9a34e] text-[#16243d]"
                  >
                    Resume previous session
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={discardLocalDraft}
                    className={
                      assessmentDark
                        ? "border-[#c1cad7]/30 bg-transparent text-[#f7f3e8]"
                        : "border-[#16243d]/25"
                    }
                  >
                    Start fresh
                  </Button>
                </div>
                <label className="mt-4 flex items-start gap-3 text-xs leading-5 text-[#657084]">
                  <input
                    type="checkbox"
                    checked={skipResumePrompt}
                    onChange={event => {
                      const checked = event.target.checked;
                      setSkipResumePrompt(checked);
                      if (checked)
                        window.localStorage.setItem(
                          "piq-assessment-skip-resume-prompt",
                          "true"
                        );
                      else
                        window.localStorage.removeItem(
                          "piq-assessment-skip-resume-prompt"
                        );
                    }}
                    className="mt-0.5 h-4 w-4 accent-[#c9a34e]"
                  />
                  Don’t show this again; always start fresh.
                </label>
              </section>
            )}
            <div
              className="mt-10 border border-[#c9a34e]/45 bg-white/55 p-5"
              aria-label="Self Assessment progress"
            >
              <div className="flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[.12em] text-[#657084]">
                <span>Evaluation progress</span>
                <span>
                  {Math.round(
                    (answeredCount / assessmentQuestions.length) * 100
                  )}
                  %
                </span>
              </div>
              <div
                className="mt-3 h-2 bg-[#16243d]/10"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(
                  (answeredCount / assessmentQuestions.length) * 100
                )}
                aria-label={`${answeredCount} of ${assessmentQuestions.length} questions answered`}
              >
                <div
                  className="h-full bg-[#c9a34e] transition-all"
                  style={{
                    width: `${(answeredCount / assessmentQuestions.length) * 100}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-[#657084]">
                You can save your progress and return whenever you need a pause.
              </p>
            </div>
            <form
              onSubmit={beginAssessment}
              className="mt-8 border-t border-[#16243d]/20 pt-8"
            >
              <div className="grid gap-8 sm:grid-cols-2">
                <label className="text-xs font-black uppercase tracking-[.14em]">
                  Your name
                  <input
                    required
                    value={name}
                    onChange={event => setName(event.target.value)}
                    autoComplete="name"
                    placeholder="Name"
                    className="mt-3 w-full border-b border-[#16243d]/35 bg-transparent px-0 py-3 text-lg outline-none placeholder:text-[#657084] focus:border-[#c9a34e]"
                  />
                </label>
                <label className="text-xs font-black uppercase tracking-[.14em]">
                  Email for your report
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="mt-3 w-full border-b border-[#16243d]/35 bg-transparent px-0 py-3 text-lg outline-none placeholder:text-[#657084] focus:border-[#c9a34e]"
                  />
                </label>
              </div>
              <label className="mt-8 flex max-w-3xl items-start gap-3 text-sm leading-6 text-[#4f5b6e]">
                <input
                  required
                  type="checkbox"
                  checked={consent}
                  onChange={event => setConsent(event.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[#c9a34e]"
                />
                I consent to Profound IQ Consulting using my name and email to
                deliver and follow up on this assessment report. This is an
                educational self-reflection tool, not a clinical, medical,
                psychological, or employment diagnosis.
              </label>
              <button
                type="submit"
                className="mt-9 inline-flex items-center gap-3 bg-[#c9a34e] px-5 py-4 text-[11px] font-black uppercase tracking-[.15em] text-[#101d35] transition-all hover:-translate-y-1"
              >
                Begin assessment <ArrowRight size={16} />
              </button>
            </form>
          </div>
        )}

        {stage === "questions" && (
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-col justify-between gap-5 border-b border-[#16243d]/20 pb-7 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow text-[#7d5e1e]">
                  Assessment / module {page + 1} of {totalPages}
                </p>
                <h1 className="display mt-4 text-5xl leading-none tracking-[-.04em]">
                  {currentModule?.label ?? "Your assessment"}
                </h1>
                <p className="mt-2 text-sm leading-6 text-[#657084]">
                  One module at a time, with space to reflect before moving
                  forward.
                </p>
                {moduleCelebration && (
                  <div
                    className="module-celebration mt-4 inline-flex items-center gap-2 border border-[#c9a34e]/60 bg-[#c9a34e]/15 px-3 py-2 text-xs font-bold text-[#8a681f]"
                    role="status"
                  >
                    <CheckCircle2 size={15} />
                    <span>{assessmentCopy.moduleCompleted}</span>
                    <span className="font-normal">
                      {assessmentCopy.moduleCompletedDescription}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-left sm:text-right">
                <p className="display text-3xl">
                  {answeredCount}
                  <span className="text-xl text-[#657084]"> / 100</span>
                </p>
                <p className="text-xs font-bold uppercase tracking-[.12em] text-[#657084]">
                  Answered
                </p>
                <p className="mt-2 text-[10px] font-black uppercase tracking-[.12em] text-[#7d5e1e]">
                  {completedModuleCount} of {totalPages} modules complete
                </p>
                <div className="mt-1 flex flex-wrap items-center justify-start gap-2 sm:justify-end">
                  <p
                    className={`text-[10px] text-[#657084] ${savedPulse ? "animate-pulse text-[#7d5e1e]" : ""}`}
                  >
                    {lastSavedAt
                      ? `Saved ${new Date(lastSavedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                      : "Not saved yet"}
                  </p>
                  <button
                    type="button"
                    onClick={saveNow}
                    className="text-[10px] font-black uppercase tracking-[.1em] text-[#7d5e1e] hover:text-[#16243d]"
                  >
                    {assessmentCopy.saveNow}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferencesOpen(true)}
                    aria-label="Open assessment preferences"
                    className="text-[#657084] hover:text-[#7d5e1e]"
                  >
                    <Settings2 size={13} />
                  </button>
                </div>
              </div>
            </div>
            <div className="sticky top-2 z-20 -mx-2 mb-4 flex items-center justify-between gap-3 border border-[#c9a34e]/50 bg-[#f7f3e8]/95 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] shadow-sm backdrop-blur sm:hidden">
              <span>
                {Math.round((answeredCount / assessmentQuestions.length) * 100)}
                % complete
              </span>
              <span>
                {completedModuleCount}/{totalPages} modules
              </span>
              {lastSavedAt && (
                <span className="text-[#657084]">
                  Saved{" "}
                  {new Date(lastSavedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <Sheet open={overviewOpen} onOpenChange={setOverviewOpen}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOverviewOpen(true)}
                  className="inline-flex items-center gap-2 border-[#16243d]/25 text-xs font-black uppercase tracking-[.12em]"
                >
                  <Menu size={15} /> Module overview{" "}
                  <span className="text-[#7d5e1e]">
                    {completedModuleCount}/{totalPages}
                  </span>
                </Button>
                <SheetContent
                  side="right"
                  className="w-full border-l border-[#c9a34e] bg-[#f7f3e8] text-[#16243d] sm:max-w-md"
                >
                  <SheetHeader>
                    <SheetTitle className="display text-3xl">
                      Your assessment map
                    </SheetTitle>
                    <SheetDescription className="text-[#657084]">
                      Completed modules are marked so you can see your progress
                      at a glance.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-8 space-y-2">
                    {assessmentModules.map((module, moduleIndex) => {
                      const complete = module.questions.every(question =>
                        Boolean(answers[question.id])
                      );
                      return (
                        <button
                          key={module.key}
                          type="button"
                          onClick={() => {
                            navigateToModule(moduleIndex);
                            if (
                              moduleIndex === page ||
                              !assessmentModules[moduleIndex]?.questions.every(
                                question => Boolean(answers[question.id])
                              )
                            )
                              setOverviewOpen(false);
                          }}
                          className={`flex w-full items-center justify-between gap-4 border px-4 py-4 text-left transition ${moduleIndex === page ? "border-[#c9a34e] bg-white" : "border-[#16243d]/15 bg-white/50 hover:border-[#c9a34e]"}`}
                        >
                          <span>
                            <span className="block text-[10px] font-black uppercase tracking-[.14em] text-[#7d5e1e]">
                              Module {moduleIndex + 1}
                            </span>
                            <span className="mt-1 block text-sm font-semibold">
                              {module.label}
                            </span>
                            <span className="mt-1 block text-xs text-[#657084]">
                              {
                                module.questions.filter(question =>
                                  Boolean(answers[question.id])
                                ).length
                              }
                              /{module.questions.length} answered
                            </span>
                          </span>
                          {complete ? (
                            <CheckCircle2
                              className="shrink-0 text-emerald-700"
                              size={19}
                            />
                          ) : (
                            <span className="text-[10px] font-black uppercase tracking-[.12em] text-[#657084]">
                              Open
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <div className="mt-8" aria-label="Assessment progress">
              <div className="mb-2 flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[.12em] text-[#657084]">
                <span>
                  Step {page + 1} of {totalPages} · Overall progress
                </span>
                <span>
                  {Math.round(
                    (answeredCount / assessmentQuestions.length) * 100
                  )}
                  % complete
                </span>
              </div>
              <div
                className="h-2 bg-[#16243d]/10"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(
                  (answeredCount / assessmentQuestions.length) * 100
                )}
                aria-label={`${answeredCount} of ${assessmentQuestions.length} questions answered`}
              >
                <div
                  className="h-2 bg-[#c9a34e] transition-all"
                  style={{
                    width: `${(answeredCount / assessmentQuestions.length) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div
              className="sticky top-14 z-10 -mx-2 mt-5 border-y border-[#c9a34e]/40 bg-[#f7f3e8]/95 p-4 shadow-sm backdrop-blur"
              aria-label="Module navigation"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-[10px] font-black uppercase tracking-[.14em] text-[#7d5e1e]">
                  Module map
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleHighPotentialFilter}
                    aria-pressed={highPotentialOnly}
                    title={
                      highPotentialOnly
                        ? "Show all sections"
                        : "Show sections with at least 20 points of potential improvement"
                    }
                    className={`text-[9px] font-black uppercase tracking-[.1em] ${highPotentialOnly ? "text-[#7d5e1e]" : "text-[#657084]"}`}
                  >
                    {highPotentialOnly ? "All sections" : "High potential"}
                  </button>
                  <select
                    aria-label="Sort high-potential sections"
                    value={highPotentialSort}
                    onChange={event =>
                      selectHighPotentialSort(
                        event.target.value as "default" | "improvement"
                      )
                    }
                    className="border border-[#16243d]/20 bg-transparent px-1 py-1 text-[9px] font-black uppercase tracking-[.08em] text-[#657084]"
                  >
                    <option value="default">Module order</option>
                    <option value="improvement">Largest opportunity</option>
                  </select>
                  <span
                    className="hidden text-[9px] font-black uppercase tracking-[.1em] text-[#657084] sm:inline"
                    title="Press Ctrl+M to toggle the module rail"
                  >
                    Ctrl+M
                  </span>
                  <button
                    type="button"
                    onClick={toggleModuleRail}
                    aria-expanded={!moduleRailCollapsed}
                    aria-controls="assessment-module-rail"
                    className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[.1em] text-[#657084] hover:text-[#7d5e1e]"
                  >
                    {moduleRailCollapsed ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronUp size={14} />
                    )}{" "}
                    {moduleRailCollapsed ? "Expand" : "Collapse"}
                  </button>
                </div>
              </div>
              {!moduleRailCollapsed && (
                <div
                  id="assessment-module-rail"
                  className="flex flex-wrap gap-2.5"
                >
                  <span className="sr-only">Jump to a module</span>
                  {moduleRailItems.map(
                    ({ module, moduleIndex, moduleScore }) => {
                      const complete = moduleScore !== null;
                      return (
                        <span
                          key={module.key}
                          className="group relative inline-flex"
                        >
                          <button
                            key={module.key}
                            type="button"
                            onClick={() => navigateToModule(moduleIndex)}
                            aria-current={
                              moduleIndex === page ? "step" : undefined
                            }
                            title={
                              moduleScore === null
                                ? `${module.label} — incomplete`
                                : `${module.label} — ${moduleScore} / 100`
                            }
                            aria-label={`${module.label}${complete ? ` completed with a score of ${moduleScore} out of 100` : ""}`}
                            className={`${highPotentialOnly && (moduleScore === null || 100 - moduleScore < 20) ? "hidden" : ""} inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[10px] font-black uppercase tracking-[.1em] transition-all ${moduleIndex === page ? "border-[#c9a34e] bg-[#16243d] text-[#f7f3e8] shadow-sm" : "border-[#16243d]/20 bg-white/50 text-[#657084] hover:-translate-y-0.5 hover:border-[#c9a34e] hover:shadow-sm"}`}
                          >
                            {complete ? (
                              <Check size={13} className="text-[#c9a34e]" />
                            ) : (
                              <span className="grid h-4 w-4 place-items-center border border-current text-[9px]">
                                {moduleIndex + 1}
                              </span>
                            )}
                            <span className="max-w-[12rem] truncate">
                              {highlightModuleLabel(module.label)}
                            </span>
                          </button>
                          {complete && (
                            <span
                              role="tooltip"
                              className="pointer-events-none invisible absolute left-1/2 top-full z-30 mt-3 w-44 -translate-x-1/2 border border-[#c9a34e] bg-[#16243d] p-3.5 text-left text-[#f7f3e8] opacity-0 shadow-lg transition group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100"
                            >
                              <span className="block text-[10px] font-black uppercase tracking-[.12em] text-[#c9a34e]">
                                Section score
                              </span>
                              <span className="mt-1 block text-sm">
                                {moduleScore} / 100
                              </span>
                              <span
                                className="mt-1 block text-[10px] text-[#c9a34e]"
                                aria-label={`Potential improvement ${100 - (moduleScore ?? 0)} points`}
                              >
                                Potential +{100 - (moduleScore ?? 0)} pts
                              </span>
                              <button
                                type="button"
                                onClick={() => reviewSection(moduleIndex)}
                                className="mt-2 text-[10px] font-black uppercase tracking-[.1em] text-[#f7f3e8] underline decoration-[#c9a34e] underline-offset-2"
                              >
                                {assessmentCopy.reviewSection}
                              </button>
                            </span>
                          )}
                        </span>
                      );
                    }
                  )}
                </div>
              )}
              {moduleRailCollapsed && (
                <div
                  className="flex items-center gap-3"
                  aria-label={`${Math.round((answeredCount / assessmentQuestions.length) * 100)} percent overall progress`}
                >
                  <div
                    className="relative h-12 w-12 shrink-0"
                    title={`${answeredCount} of ${assessmentQuestions.length} questions answered`}
                  >
                    <svg
                      viewBox="0 0 40 40"
                      className="h-12 w-12 -rotate-90"
                      aria-hidden="true"
                    >
                      <circle
                        cx="20"
                        cy="20"
                        r="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="text-[#16243d]/10"
                      />
                      <circle
                        cx="20"
                        cy="20"
                        r="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        className="text-[#c9a34e]"
                        strokeDasharray={`${Math.round((answeredCount / assessmentQuestions.length) * 100)} 100`}
                        pathLength="100"
                      />
                    </svg>
                    <span className="absolute inset-0 grid place-items-center text-[10px] font-black text-[#16243d]">
                      {Math.round(
                        (answeredCount / assessmentQuestions.length) * 100
                      )}
                      %
                    </span>
                  </div>
                  <p className="text-xs text-[#657084]">
                    Navigation collapsed. Current module:{" "}
                    <strong className="text-[#16243d]">
                      {currentModule?.label}
                    </strong>
                  </p>
                </div>
              )}
            </div>
            {stage === "questions" && (
              <>
                <AssessmentContentPagination
                  currentPage={contentPage}
                  pageCount={contentPageCount}
                  questionCount={moduleQuestions.length}
                  hasNextModule={page < totalPages - 1}
                  onPageChange={nextPage =>
                    advanceAssessmentContent(
                      Math.max(0, Math.min(contentPageCount, nextPage))
                    )
                  }
                />
                {contentAdvanceNotice && (
                  <p
                    role="status"
                    className="mb-6 animate-pulse border-l-2 border-[#c9a34e] bg-[#fffaf0] px-4 py-3 text-sm font-semibold text-[#7d5e1e]"
                  >
                    {contentAdvanceNotice}
                  </p>
                )}
              </>
            )}
            {mobileReviewMode && (
              <div className="mb-4 flex items-center justify-between border-l-2 border-[#c9a34e] bg-[#16243d] p-4 text-[#f7f3e8] sm:hidden">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#c9a34e]">
                    Focused review mode
                  </p>
                  <p className="mt-1 text-xs text-[#c1cad7]">
                    Review this section without the full module rail.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileReviewMode(false)}
                  className="text-[10px] font-black uppercase tracking-[.1em] text-[#f7f3e8] underline underline-offset-2"
                >
                  Exit review
                </button>
              </div>
            )}
            <div
              ref={firstQuestionRef}
              tabIndex={-1}
              aria-label={`First question in ${currentModule?.label ?? "this module"}`}
              className={`mt-10 space-y-4 outline-none ${mobileReviewMode ? "mobile-review-mode sm:rounded-none sm:border-0" : ""}`}
            >
              {currentQuestions.map((question, index) => (
                <LikertScale
                  key={question.id}
                  id={question.id}
                  question={question.prompt}
                  index={currentModuleStart + index}
                  value={answers[question.id]}
                  onChange={value => setAnswer(question.id, value)}
                />
              ))}
            </div>
            {error && (
              <p className="mt-6 border-l-2 border-red-700 bg-red-50 px-4 py-3 text-sm text-red-900">
                {error}
              </p>
            )}
            <div className="mt-10 flex flex-wrap items-center justify-end gap-3 border-t border-[#16243d]/20 pt-6">
              <div className="text-xs leading-5 text-[#657084]">
                <strong className="block text-[10px] font-black uppercase tracking-[.14em] text-[#7d5e1e]">
                  Module {page + 1} of {totalPages}
                </strong>
                <span>
                  {!pageComplete
                    ? `${currentQuestions.filter(question => Boolean(answers[question.id])).length} of ${currentQuestions.length} responses saved`
                    : page === totalPages - 1 && !assessmentComplete
                      ? `Still needed: ${incompleteModuleLabels.join(", ")}`
                      : "Ready for the next module"}
                </span>
              </div>
              <button
                type="button"
                onClick={saveAndContinueLater}
                disabled={saveDraft.isPending}
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.12em] text-[#657084] hover:text-[#7d5e1e] disabled:opacity-50"
              >
                {saveDraft.isPending ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Save size={15} />
                )}{" "}
                {saveDraft.isPending
                  ? "Sending resume link…"
                  : "Save and continue later"}
              </button>
              <button
                type="button"
                onClick={() => setPage(current => Math.max(0, current - 1))}
                disabled={page === 0}
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.15em] disabled:opacity-30"
              >
                <ArrowLeft size={15} /> {assessmentCopy.previousModule}
              </button>
              {page < totalPages - 1 ? (
                <button
                  type="button"
                  disabled={!pageComplete}
                  onClick={() => goToModule(Math.min(totalPages - 1, page + 1))}
                  className="inline-flex items-center justify-center gap-2 bg-[#16243d] px-5 py-4 text-[11px] font-black uppercase tracking-[.15em] text-[#f7f3e8] transition-all hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {assessmentCopy.nextModule} <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={
                    !pageComplete ||
                    !assessmentComplete ||
                    initializeInlinePayment.isPending
                  }
                  title={
                    !assessmentComplete
                      ? `Answer every question to unlock checkout: ${incompleteModuleLabels.join(", ")}`
                      : undefined
                  }
                  onClick={finishAndPay}
                  className="inline-flex items-center justify-center gap-2 bg-[#c9a34e] px-5 py-4 text-[11px] font-black uppercase tracking-[.15em] text-[#101d35] transition-all hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {initializeInlinePayment.isPending ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Preparing
                      secure checkout…
                    </>
                  ) : (
                    <>Pay KES {ASSESSMENT_PRICE_KES} & view report</>
                  )}{" "}
                  <ArrowRight size={15} />
                </button>
              )}
            </div>
            <p className="mt-8 text-xs leading-5 text-[#657084]">
              Your report is generated only after Paystack confirms a successful
              payment. This assessment is for professional development and
              self-reflection; it is not a diagnostic instrument.
            </p>
          </div>
        )}

        {stage === "waiting" && (
          <div
            className="mx-auto max-w-xl py-20 text-center"
            role="status"
            aria-live="polite"
          >
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#c9a34e]/20">
              {paymentState === "idle" ? (
                <Loader2 className="animate-spin text-[#7d5e1e]" />
              ) : paymentState === "verifying" ? (
                <Loader2 className="animate-spin text-[#7d5e1e]" />
              ) : (
                <LockKeyhole className="text-[#7d5e1e]" />
              )}
            </div>
            <h1 className="display mt-8 text-5xl">
              {paymentState === "idle"
                ? "Loading your report."
                : "Verifying your payment."}
            </h1>
            <p className="mt-5 text-base leading-7 text-[#4a566a]">
              {paymentState === "idle"
                ? "We are retrieving your saved assessment report. Please keep this window open."
                : "We are confirming the Paystack transaction before unlocking your report. Please keep this window open."}
            </p>
            {paymentState === "paid" && (
              <p className="mt-5 font-bold text-emerald-800">
                Payment verified. Your report is unlocked.
              </p>
            )}
            {error && (
              <p className="mt-7 border-l-2 border-red-700 bg-red-50 px-4 py-3 text-left text-sm text-red-900">
                {error}
              </p>
            )}
          </div>
        )}

        {stage === "report" && report && (
          <div className="mx-auto max-w-5xl">
            {paymentState === "paid" && (
              <div className="mb-8 flex items-center gap-3 border-l-2 border-emerald-700 bg-emerald-50 px-5 py-4 text-sm text-emerald-900">
                <CheckCircle2 size={18} />
                <span>
                  <strong>Payment verified.</strong> Your report is unlocked and
                  ready to review.
                </span>
              </div>
            )}
            <ReportSectionTabs
              sections={[
                {
                  id: "summary",
                  label: "Executive Summary",
                  content: (
                    <section className="border border-[#c9a34e] bg-[#16243d] p-6 text-[#f7f3e8] sm:p-8">
                      <div className="flex items-start justify-between gap-5">
                        <div>
                          <p className="eyebrow text-[#c9a34e]">
                            Executive summary · managers & coaching
                          </p>
                          <h2 className="display mt-3 text-3xl">
                            {report.executiveSummary?.headline ??
                              `${report.overallBand}: a practical view of your current capability pattern`}
                          </h2>
                        </div>
                        <span className="hidden border border-[#c9a34e]/60 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[#c9a34e] sm:block">
                          One-page brief
                        </span>
                      </div>
                      <p className="mt-5 max-w-3xl text-sm leading-7 text-[#c1cad7]">
                        {report.executiveSummary?.overview ??
                          "Use this report as a professional development conversation starter, pairing the signal with observed behavior, context, feedback, and outcomes."}
                      </p>
                      <div className="mt-7 grid gap-6 border-t border-[#c9a34e]/30 pt-6 lg:grid-cols-2">
                        <div>
                          <p className="eyebrow text-[#c9a34e]">
                            Recommended priorities
                          </p>
                          <ul className="mt-4 space-y-3 text-sm leading-6 text-[#c1cad7]">
                            {(
                              report.executiveSummary?.priorities ??
                              report.focusAreas
                            ).map(priority => (
                              <li
                                key={priority}
                                className="border-l border-[#c9a34e] pl-3"
                              >
                                {priority}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="eyebrow text-[#c9a34e]">
                            Discussion prompts
                          </p>
                          <ul className="mt-4 space-y-3 text-sm leading-6 text-[#c1cad7]">
                            {(
                              report.executiveSummary?.discussionPrompts ??
                              report.reflectionPoints
                            )
                              .slice(0, 3)
                              .map(prompt => (
                                <li key={prompt}>→ {prompt}</li>
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
                        <p className="eyebrow text-[#7d5e1e]">
                          Assessment report / verified payment
                        </p>
                        <h1 className="display mt-5 text-6xl leading-[.9] tracking-[-.05em]">
                          Your current
                          <br />
                          <em className="font-normal text-[#7d5e1e]">
                            signal.
                          </em>
                        </h1>
                        <p className="mt-7 text-lg leading-8 text-[#4a566a]">
                          Use this snapshot as a starting point for a more
                          intentional development conversation.
                        </p>
                        <div className="mt-7 border-l-2 border-[#c9a34e] bg-white/55 px-5 py-4">
                          <p className="eyebrow text-[#7d5e1e]">Prepared for</p>
                          <p className="mt-2 text-base font-bold text-[#16243d]">
                            {name}
                          </p>
                          <p className="mt-1 text-sm text-[#657084]">{email}</p>
                        </div>
                        <div className="mt-10 border-t border-[#16243d]/20 pt-5">
                          <p className="eyebrow text-[#7d5e1e]">
                            Overall foundation
                          </p>
                          <p className="display mt-3 text-7xl">
                            {report.overallScore}
                            <span className="text-3xl text-[#657084]">
                              {" "}
                              / 100
                            </span>
                          </p>
                          <p className="mt-3 text-sm font-bold uppercase tracking-[.14em] text-[#657084]">
                            {report.overallBand}
                          </p>
                        </div>
                      </div>
                      <div>
                        <div className="grid gap-5 sm:grid-cols-2">
                          {report.dimensions.map(dimension => (
                            <div
                              key={dimension.key}
                              className="border border-[#16243d]/15 bg-white/40 p-5"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <h2 className="text-sm font-extrabold">
                                  {dimension.label}
                                </h2>
                                <span className="display text-2xl text-[#7d5e1e]">
                                  {dimension.score}
                                </span>
                              </div>
                              <div className="mt-3 h-1 bg-[#16243d]/10">
                                <div
                                  className="h-1 bg-[#c9a34e]"
                                  style={{ width: `${dimension.score}%` }}
                                />
                              </div>
                              <p className="mt-3 text-xs leading-5 text-[#657084]">
                                {dimension.description}
                              </p>
                              <p className="mt-4 text-sm leading-6 text-[#4a566a]">
                                {dimension.readout}
                              </p>
                              <div className="mt-5 border-t border-[#16243d]/10 pt-4">
                                <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#7d5e1e]">
                                  Reflection workspace
                                </p>
                                <p className="mt-1 text-xs leading-5 text-[#657084]">
                                  Capture your own evidence, then mark the
                                  action as planned, active, or reviewed.
                                </p>
                                <div className="mt-3 space-y-3">
                                  {getDimensionReflectionPoints(dimension).map(
                                    (prompt, promptIndex) => {
                                      const key = `${dimension.key}:${promptIndex}`;
                                      const item = reflectionPrompts.find(
                                        candidate => candidate.key === key
                                      ) ?? {
                                        key,
                                        dimensionKey: dimension.key,
                                        dimensionLabel: dimension.label,
                                        promptIndex,
                                        prompt,
                                      };
                                      const draft = reflectionDrafts[key] ?? {
                                        note: "",
                                        status: "planned" as ReflectionStatus,
                                        selected: false,
                                      };
                                      return (
                                        <ReflectionPromptCard
                                          key={key}
                                          prompt={prompt}
                                          note={draft.note}
                                          status={draft.status}
                                          selected={draft.selected}
                                          saving={savingReflectionKey === key}
                                          onNoteChange={note =>
                                            setReflectionDrafts(current => ({
                                              ...current,
                                              [key]: { ...draft, note },
                                            }))
                                          }
                                          onStatusChange={status =>
                                            setReflectionDrafts(current => ({
                                              ...current,
                                              [key]: { ...draft, status },
                                            }))
                                          }
                                          onSelectedChange={selected =>
                                            setReflectionDrafts(current => ({
                                              ...current,
                                              [key]: { ...draft, selected },
                                            }))
                                          }
                                          onSave={() =>
                                            void saveReflectionPrompt(item)
                                          }
                                        />
                                      );
                                    }
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-8 grid gap-5 border-t border-[#16243d]/20 pt-6 sm:grid-cols-2">
                          <div>
                            <p className="eyebrow text-[#7d5e1e]">
                              Strength signals
                            </p>
                            <ul className="mt-4 space-y-2 text-sm font-semibold">
                              {report.strengths.map(strength => (
                                <li key={strength} className="flex gap-2">
                                  <Check
                                    size={15}
                                    className="mt-0.5 text-[#7d5e1e]"
                                  />
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="eyebrow text-[#7d5e1e]">
                              Focus signals
                            </p>
                            <ul className="mt-4 space-y-2 text-sm font-semibold">
                              {report.focusAreas.map(focus => (
                                <li key={focus} className="flex gap-2">
                                  <ArrowRight
                                    size={15}
                                    className="mt-0.5 text-[#7d5e1e]"
                                  />
                                  {focus}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  id: "lens",
                  label: "Role Lens",
                  content: (
                    <section className="mt-10 border border-[#16243d]/15 bg-white/45 p-5 sm:p-6">
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div>
                          <p className="eyebrow text-[#7d5e1e]">
                            Adapt the lens
                          </p>
                          <h2 className="display mt-2 text-2xl">
                            Read the signal for your context.
                          </h2>
                          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#657084]">
                            Choose the professional setting you want to bring
                            into focus. Your underlying scores stay unchanged.
                          </p>
                        </div>
                        <label className="text-[10px] font-black uppercase tracking-[.12em] text-[#657084]">
                          Report lens
                          <select
                            value={roleLens}
                            onChange={event =>
                              setRoleLens(event.target.value as RoleLens)
                            }
                            className="mt-2 block w-full border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#a27e2e]"
                          >
                            {roleLensOptions.map(option => (
                              <option key={option.key} value={option.key}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                      {lensReadout && (
                        <div className="mt-6 grid gap-6 border-t border-[#16243d]/15 pt-5 lg:grid-cols-[1fr_1fr]">
                          <div>
                            <p className="text-sm leading-7 text-[#4a566a]">
                              {lensReadout.context}
                            </p>
                            <ul className="mt-4 space-y-3 text-sm leading-6 text-[#4a566a]">
                              {lensReadout.priorities.map(priority => (
                                <li
                                  key={priority}
                                  className="border-l border-[#c9a34e] pl-3"
                                >
                                  {priority}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-[#16243d] p-5 text-[#f7f3e8]">
                            <p className="eyebrow text-[#c9a34e]">
                              {lensReadout.label} prompts
                            </p>
                            <ul className="mt-4 space-y-3 text-sm leading-6 text-[#c1cad7]">
                              {lensReadout.reflectionPoints.map(point => (
                                <li key={point}>→ {point}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </section>
                  ),
                },
                {
                  id: "reflection",
                  label: "Reflection & Coaching",
                  content: (
                    <>
                      <section className="mt-10 flex flex-col justify-between gap-4 border border-[#c9a34e]/60 bg-[#fffaf0] p-5 sm:flex-row sm:items-center sm:p-6">
                        <div>
                          <p className="eyebrow text-[#7d5e1e]">
                            Coach / manager export
                          </p>
                          <h2 className="display mt-2 text-2xl text-[#16243d]">
                            Share the work behind the signal.
                          </h2>
                          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#657084]">
                            Select the prompts you want to discuss, save your
                            notes, and download a focused CSV with the prompt,
                            your response, and action status.
                          </p>
                        </div>
                        <Button
                          type="button"
                          onClick={() => void exportSelectedReflections()}
                          disabled={!attemptId || exportReflection.isPending}
                          className="shrink-0 bg-[#16243d] text-[#f7f3e8]"
                        >
                          {exportReflection.isPending ? (
                            <>
                              <Loader2 size={15} className="animate-spin" />{" "}
                              Preparing…
                            </>
                          ) : (
                            <>
                              <Download size={15} /> Export selected (
                              {
                                Object.values(reflectionDrafts).filter(
                                  draft => draft.selected
                                ).length
                              }
                              )
                            </>
                          )}
                        </Button>
                      </section>
                      <div className="mt-12 grid gap-8 border-t border-[#16243d]/20 pt-8 lg:grid-cols-[1.1fr_.9fr]">
                        <section>
                          <p className="eyebrow text-[#7d5e1e]">
                            Reflection points
                          </p>
                          <h2 className="display mt-3 text-3xl">
                            Turn insight into practice.
                          </h2>
                          <ul className="mt-5 space-y-4 text-sm leading-6 text-[#4a566a]">
                            {report.reflectionPoints.map(point => (
                              <li
                                key={point}
                                className="border-l border-[#c9a34e] pl-4"
                              >
                                {point}
                              </li>
                            ))}
                          </ul>
                        </section>
                        <section className="bg-[#16243d] p-6 text-[#f7f3e8]">
                          <p className="eyebrow text-[#c9a34e]">
                            Important context
                          </p>
                          <ul className="mt-5 space-y-4 text-sm leading-6 text-[#c1cad7]">
                            {report.importantContext.map(point => (
                              <li key={point} className="flex gap-3">
                                <span className="text-[#c9a34e]">＋</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </section>
                      </div>
                    </>
                  ),
                },
                {
                  id: "next",
                  label: "Next Steps",
                  content: (
                    <>
                      <div className="mt-14 border-l-2 border-[#c9a34e] bg-[#16243d] p-6 text-sm leading-6 text-[#c1cad7]">
                        <ShieldCheck
                          className="mb-4 text-[#c9a34e]"
                          size={19}
                        />
                        <strong className="text-[#f7f3e8]">
                          Important note.
                        </strong>{" "}
                        {report.disclaimer}
                      </div>
                      <div className="mt-8 border border-[#16243d]/15 bg-white/45 p-4 text-sm leading-6 text-[#4a566a]">
                        {emailSent
                          ? "A PDF copy of your report has also been sent to the email address you provided."
                          : "Your report is available here. If email delivery was delayed, you can download a PDF copy from your dashboard."}
                      </div>
                      <div className="mt-8 flex flex-wrap gap-4">
                        <Link
                          href="/#contact"
                          className="inline-flex items-center gap-2 bg-[#c9a34e] px-5 py-4 text-[11px] font-black uppercase tracking-[.15em] text-[#101d35]"
                        >
                          Discuss your report <ArrowRight size={15} />
                        </Link>
                        <Link
                          href="/"
                          className="inline-flex items-center gap-2 border border-[#16243d]/25 px-5 py-4 text-[11px] font-black uppercase tracking-[.15em]"
                        >
                          Return to Profound IQ <ArrowRight size={15} />
                        </Link>
                      </div>
                    </>
                  ),
                },
              ]}
            />
          </div>
        )}
      </main>
      <Dialog
        open={stage === "intro" && introModalOpen}
        onOpenChange={setIntroModalOpen}
      >
        <DialogContent className="border-[#c9a34e] bg-[#f7f3e8] text-[#16243d]">
          <DialogHeader>
            <DialogTitle className="display text-3xl">
              Begin your Self Assessment.
            </DialogTitle>
            <DialogDescription className="text-[#657084]">
              A short orientation before you start the 100 reflective questions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm leading-6 text-[#4a566e]">
            {" "}
            <p>
              Move through one capability at a time and answer from your current
              experience rather than an ideal version of yourself.
            </p>
            <p>
              Your progress saves locally, and you can pause, resume, or save a
              continuation link before completing the evaluation.
            </p>
            <p className="border-l-2 border-[#c9a34e] bg-white/60 p-3 text-xs">
              This is an educational self-reflection tool, not a clinical,
              medical, psychological, or employment diagnosis.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => setIntroModalOpen(false)}
              className="bg-[#16243d] text-[#f7f3e8]"
            >
              View assessment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={moduleNavigationConfirmOpen}
        onOpenChange={setModuleNavigationConfirmOpen}
      >
        <DialogContent className="border-[#c9a34e] bg-[#f7f3e8] text-[#16243d]">
          <DialogHeader>
            <DialogTitle className="display text-3xl">
              Review another completed module?
            </DialogTitle>
            <DialogDescription className="text-[#657084]">
              You are about to leave the current module. Your answers are saved
              in this session, and you can return here from the module
              navigation.
            </DialogDescription>
          </DialogHeader>
          <label className="flex items-start gap-3 text-sm leading-6 text-[#4a566a]">
            <input
              type="checkbox"
              checked={modulePromptDontShowAgain}
              onChange={event =>
                setModulePromptDontShowAgain(event.target.checked)
              }
              className="mt-1 h-4 w-4 accent-[#c9a34e]"
            />
            Don’t show this again on this device.
          </label>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPendingModuleIndex(null);
                setModuleNavigationConfirmOpen(false);
              }}
              className="border-[#16243d]/25"
            >
              Stay here
            </Button>
            <Button
              type="button"
              onClick={confirmModuleNavigation}
              className="bg-[#16243d] text-[#f7f3e8]"
            >
              Review module
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={saveSuccessOpen} onOpenChange={setSaveSuccessOpen}>
        <DialogContent className="border-[#c9a34e] bg-[#f7f3e8] text-[#16243d]">
          <DialogHeader>
            <DialogTitle className="display text-3xl">
              Your progress is saved.
            </DialogTitle>
            <DialogDescription className="text-[#657084]">
              We sent a private resume link to {email}. It is valid for seven
              days and can reopen your current module.
            </DialogDescription>
          </DialogHeader>
          <div className="border-l-2 border-[#c9a34e] bg-white/60 p-4 text-sm leading-6">
            Keep the email private. Anyone with the link can access this saved
            progress until it expires.
          </div>
          {resumeUrl && (
            <div className="space-y-2">
              <label
                className="block text-[10px] font-black uppercase tracking-[.12em] text-[#657084]"
                htmlFor="resume-link"
              >
                Resume link
              </label>
              <div className="flex gap-2">
                <input
                  id="resume-link"
                  readOnly
                  value={resumeUrl}
                  onFocus={event => event.currentTarget.select()}
                  className="min-w-0 flex-1 border border-[#16243d]/20 bg-white px-3 py-3 text-xs text-[#4a566a] outline-none transition-colors focus:border-[#c9a34e] focus:ring-2 focus:ring-[#c9a34e]/30"
                />
                <Button
                  type="button"
                  onClick={copyResumeLink}
                  variant="outline"
                  className="shrink-0 border-[#16243d]/25"
                >
                  <Clipboard size={15} />
                  <span className="sr-only">Copy resume link</span>
                </Button>
              </div>
              {resumeCopyFallback && (
                <p className="text-xs text-[#657084]">
                  Select the link above and use your browser’s Copy command.
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSaveSuccessOpen(false)}
              className="border-[#16243d]/25"
            >
              Continue here
            </Button>
            <Button
              type="button"
              onClick={() =>
                resendDraft.mutate(
                  {
                    name: name.trim(),
                    email: email.trim(),
                    answers: Object.entries(answers).map(
                      ([questionId, value]) => ({ questionId, value })
                    ),
                    currentModule: page,
                    origin: PUBLISHED_SITE_ORIGIN,
                  },
                  {
                    onSuccess: result => {
                      setResumeUrl(result.resumeUrl);
                      setResumeCopyFallback(false);
                      toast.success("Resume link resent", {
                        description: `A fresh link expires ${new Date(result.expiresAt).toLocaleDateString()}.`,
                      });
                    },
                    onError: resendError =>
                      toast.error("Could not resend link", {
                        description: resendError.message,
                      }),
                  }
                )
              }
              disabled={resendDraft.isPending}
              className="bg-[#16243d] text-[#f7f3e8]"
            >
              {resendDraft.isPending ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={15} /> Resending…
                </>
              ) : (
                "Resend resume email"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={clearDataOpen} onOpenChange={setClearDataOpen}>
        <DialogContent className="border-red-200 bg-[#f7f3e8] text-[#16243d]">
          <DialogHeader>
            <DialogTitle className="display text-3xl">
              Clear saved data?
            </DialogTitle>
            <DialogDescription className="text-[#657084]">
              This removes the local draft and saved timestamp from this device.
              Your submitted reports and account data are not affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={exportLocalDraft}
              className="border-[#a27e2e] text-[#8a681f]"
            >
              Download current progress
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setClearDataOpen(false)}
              className="border-[#16243d]/25"
            >
              Keep data
            </Button>
            <Button
              type="button"
              onClick={() => {
                discardLocalDraft();
                setClearDataOpen(false);
              }}
              className="bg-red-800 text-white"
            >
              Clear saved data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={preferencesOpen} onOpenChange={setPreferencesOpen}>
        <DialogContent className="border-[#c9a34e] bg-[#f7f3e8] text-[#16243d]">
          <DialogHeader>
            <DialogTitle className="display text-3xl">
              {assessmentCopy.preferences}
            </DialogTitle>
            <DialogDescription className="text-[#657084]">
              Manage local choices for this device. These settings do not change
              your answers or report.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-start justify-between gap-4 border-t border-[#16243d]/15 pt-4">
            <div>
              <p className="text-sm font-semibold">Assessment theme</p>
              <p className="mt-1 text-xs leading-5 text-[#657084]">
                Use a darker reading surface while completing long modules.
              </p>
            </div>
            <Switch
              checked={assessmentDark}
              onCheckedChange={checked => {
                const nextTheme = checked ? "dark" : "light";
                setAssessmentTheme(nextTheme);
                window.localStorage.setItem("piq-assessment-theme", nextTheme);
              }}
              aria-label="Toggle dark assessment theme"
            />
            <button
              type="button"
              onClick={() => {
                setAssessmentTheme("system");
                window.localStorage.removeItem("piq-assessment-theme");
              }}
              className="text-[10px] font-black uppercase tracking-[.1em] text-[#7d5e1e]"
            >
              Use system default
            </button>
          </div>
          <div className="flex items-start justify-between gap-4 border-t border-[#16243d]/15 pt-4">
            <div>
              <p className="text-sm font-semibold">Saved assessment data</p>
              <p className="mt-1 text-xs leading-5 text-[#657084]">
                Delete this device’s local draft and saved timestamp before
                sharing the device.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setClearDataOpen(true)}
              className="shrink-0 border-red-200 text-red-800"
            >
              Clear saved data
            </Button>
          </div>
          <div className="flex items-start justify-between gap-4 border-t border-[#16243d]/15 pt-4">
            <div>
              <p className="text-sm font-semibold">
                Resume previous session prompt
              </p>
              <p className="mt-1 text-xs leading-5 text-[#657084]">
                {skipResumePrompt
                  ? "The prompt is hidden and saved drafts will not be surfaced here."
                  : "Saved drafts appear on the assessment landing page."}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSkipResumePrompt(false);
                window.localStorage.removeItem(
                  "piq-assessment-skip-resume-prompt"
                );
                toast.success("Resume prompt restored");
              }}
              disabled={!skipResumePrompt}
              className="shrink-0 border-[#16243d]/25"
            >
              Restore
            </Button>
          </div>
          <div className="flex items-start justify-between gap-4 border-t border-[#16243d]/15 pt-4">
            <div>
              <p className="text-sm font-semibold">
                Completed-module navigation warning
              </p>
              <p className="mt-1 text-xs leading-5 text-[#657084]">
                {dontShowModulePrompt
                  ? "The confirmation is currently hidden."
                  : "The confirmation appears before reviewing completed modules."}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDontShowModulePrompt(false);
                setModulePromptDontShowAgain(false);
                window.localStorage.removeItem(
                  "piq-assessment-skip-module-prompt"
                );
                toast.success("Navigation warning reset");
              }}
              className="shrink-0 border-[#16243d]/25"
            >
              Reset
            </Button>
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => setPreferencesOpen(false)}
              className="bg-[#16243d] text-[#f7f3e8]"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={certificatePreviewOpen}
        onOpenChange={setCertificatePreviewOpen}
      >
        <DialogContent className="max-w-3xl border-[#c9a34e] bg-[#f7f3e8] text-[#16243d]">
          <DialogHeader>
            <DialogTitle className="display text-3xl">
              {assessmentCopy.certificatePreview}
            </DialogTitle>
            <DialogDescription className="text-[#657084]">
              {assessmentCopy.certificatePreviewDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="relative overflow-hidden border-8 border-[#c9a34e] bg-[#16243d] p-6 text-center text-[#f7f3e8] shadow-xl sm:p-12">
            <div className="absolute inset-3 border border-[#c9a34e]/50" />
            <img
              src={LOGO_URL}
              alt="Profound IQ Consulting"
              className="relative mx-auto h-14 w-auto object-contain"
            />
            <p className="relative mt-6 text-[10px] font-black uppercase tracking-[.35em] text-[#c9a34e]">
              Profound IQ Consulting
            </p>
            <p className="relative mt-10 font-serif text-3xl sm:text-5xl">
              Completion certificate
            </p>
            <p className="relative mt-8 text-xs uppercase tracking-[.2em] text-[#c1cad7]">
              Proudly awarded to
            </p>
            <p className="relative mt-3 text-2xl font-semibold sm:text-4xl">
              {name || "Participant name"}
            </p>
            <p className="relative mt-6 text-sm text-[#c1cad7]">
              For successfully completing the Profound IQ Self Assessment
            </p>
            <p className="relative mt-10 text-xs text-[#c1cad7]">
              Issued {new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="mt-5 border border-[#16243d]/15 bg-white p-3">
            <p className="mb-3 text-[10px] font-black uppercase tracking-[.14em] text-[#657084]">
              Canonical server-rendered artifact
            </p>
            {certificatePreview.isLoading ? (
              <div className="grid min-h-40 place-items-center text-sm text-[#657084]">
                <Loader2 className="animate-spin text-[#7d5e1e]" />
              </div>
            ) : certificatePreview.error ? (
              <p className="p-4 text-sm text-red-800">
                {certificatePreview.error.message}
              </p>
            ) : certificatePreview.data ? (
              <img
                src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(certificatePreview.data.data)}`}
                alt={`${assessmentCopy.certificatePreview} — ${name || "participant"}`}
                className="mx-auto w-full"
              />
            ) : (
              <p className="p-4 text-sm text-[#657084]">
                {assessmentCopy.certificatePdfUnavailable}
              </p>
            )}
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCertificatePreviewOpen(false)}
              className="border-[#16243d]/25"
            >
              {assessmentCopy.closePreview}
            </Button>
            <Button
              type="button"
              onClick={downloadCompletionCertificate}
              className="bg-[#16243d] text-[#f7f3e8]"
            >
              <Download size={15} /> {assessmentCopy.certificateSvg}
            </Button>
            <Button
              type="button"
              onClick={downloadCompletionCertificatePdf}
              disabled={downloadCertificatePdf.isPending}
              className="bg-[#c9a34e] text-[#16243d]"
            >
              <Download size={15} />{" "}
              {downloadCertificatePdf.isPending
                ? assessmentCopy.certificatePdfPreparing
                : assessmentCopy.certificatePdf}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <footer className="border-t border-[#16243d]/15 py-8">
        <div className="container flex flex-col justify-between gap-3 text-xs text-[#657084] sm:flex-row">
          <span>© 2026 Profound IQ Consulting</span>
          <span>
            {"Self Assessment"} · KES {ASSESSMENT_PRICE_KES}
          </span>
        </div>
      </footer>
      <PaystackInlineModal
        open={inlineModalOpen}
        product={inlineProduct}
        customerEmail={email}
        onClose={() => {
          setInlineModalOpen(false);
          setInlineProduct(null);
        }}
        onSuccess={reference => {
          setInlineModalOpen(false);
          setInlineProduct(null);
          setPaymentState("verifying");
          setStage("waiting");
          verifyPayment.mutate(
            { reference },
            {
              onSuccess: result => {
                setPaymentState("paid");
                setReport(result.report as AssessmentReport);
                setEmailSent(result.emailSent);
                setStage("report");
                window.localStorage.setItem(
                  "piq-assessment-paid-reference",
                  reference
                );
                sessionStorage.removeItem("piq-assessment-reference");
                toast.success("Payment verified", {
                  description: "Your assessment report is now unlocked.",
                });
              },
              onError: verificationError => {
                setPaymentState("idle");
                setError(verificationError.message);
                toast.error("Payment verification needs attention", {
                  description: verificationError.message,
                });
              },
            }
          );
        }}
        onError={message => {
          setInlineModalOpen(false);
          setInlineProduct(null);
          setError(message);
          toast.error("Payment failed", { description: message });
        }}
      />
    </div>
  );
}

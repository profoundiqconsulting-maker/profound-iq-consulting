/* Profound IQ Consulting — CareerPath redesigned for executive conversion */
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  CreditCard,
  Download,
  GraduationCap,
  Loader2,
  LockKeyhole,
  Mail,
  MessageCircle,
  Save,
  Shield,
  Sparkles,
  Star,
  Target,
  Users,
  Vote,
  Zap,
} from "lucide-react";
import { SocialIcon } from "@/components/SocialMediaIcons";
import { SocialSharing, type SocialPlatform } from "@/components/SocialSharing";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ProgressMotionBar,
  ProgressMotionRing,
  EncouragementMessage,
  ProgressMilestone,
} from "@/components/ProgressMotion";
import { CheckoutForm } from "@/components/CheckoutForm";
import { TransformationNav } from "@/components/TransformationNav";
import { ReportSectionTabs } from "@/components/ReportSectionTabs";
import { CareerPathReportInsights } from "@/components/CareerPathReportInsights";
import { LikertScale } from "@/components/LikertScale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { usePostPaymentRedirect } from "@/hooks/usePostPaymentRedirect";
import {
  buildCareerPathReport,
  CAREER_PATH_PRICE_KES,
  getTopCareerPathStrengths,
  type CareerPathReport,
  type CareerPathwayResult,
} from "@shared/careerPath";

type Page = "preview" | "assessment" | "checkout" | "reports";

const pathwayColors = {
  primary: {
    border: "border-[#a27e2e]",
    bg: "bg-[#16243d]",
    text: "text-[var(--fg)]",
    accent: "text-[var(--brand)]",
    scoreColor: "text-[var(--brand)]",
  },
  secondary: {
    border: "border-[#16243d]/15",
    bg: "bg-white/55",
    text: "text-[var(--fg)]",
    accent: "text-[var(--brand)]",
    scoreColor: "text-[var(--brand)]",
  },
  alternative: {
    border: "border-[#16243d]/15",
    bg: "bg-white/55",
    text: "text-[var(--fg)]",
    accent: "text-[var(--brand)]",
    scoreColor: "text-[var(--brand)]",
  },
};

function CareerPathProgressRing({
  stage,
  modulePage,
  totalModules,
  answeredCount,
  totalQuestions,
}: {
  stage: Page;
  modulePage: number;
  totalModules: number;
  answeredCount: number;
  totalQuestions: number;
}) {
  const getProgress = () => {
    if (stage === "preview") return 0;
    if (stage === "assessment") {
      const moduleProgress = (modulePage / totalModules) * 0.7;
      const questionProgress = (answeredCount / totalQuestions) * 0.7;
      return Math.round(Math.max(moduleProgress * 100, questionProgress * 100));
    }
    if (stage === "checkout") return 85;
    if (stage === "reports") return 100;
    return 0;
  };

  const progress = getProgress();
  const stageLabels = {
    preview: "Getting started",
    assessment: `Module ${modulePage + 1} of ${totalModules}`,
    checkout: "Secure checkout",
    reports: "Report ready",
  };
  const stageDetails = {
    preview: "Explore your CareerPath preview",
    assessment: `${answeredCount} of ${totalQuestions} questions answered`,
    checkout: "Complete payment to unlock your report",
    reports: "Assessment complete",
  };

  return (
    <nav
      aria-label="CareerPath progress"
      className="sticky top-16 z-40 border-b border-[var(--border)] bg-[var(--bg-elevated)] py-4 px-4 sm:px-6"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <ProgressMotionRing
            value={progress}
            size={56}
            strokeWidth={5}
            label={`${progress}%`}
            className="flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--foreground)]">
              {stageLabels[stage]}
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">
              {stageDetails[stage]}
            </p>
          </div>
        </div>
        <ol className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {[
            { id: "preview", label: "Preview", icon: "📋" },
            { id: "assessment", label: "Assessment", icon: "📝" },
            { id: "checkout", label: "Checkout", icon: "💳" },
            { id: "reports", label: "Report", icon: "📊" },
          ].map((step, index) => (
            <li
              key={step.id}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap transition-all duration-300",
                stage === step.id
                  ? "text-[var(--brand)]"
                  : ["preview", "assessment", "checkout", "reports"].indexOf(
                        stage
                      ) > index
                    ? "text-[var(--success)]"
                    : "text-[var(--muted-foreground)]"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-black transition-all duration-300",
                  stage === step.id
                    ? "border-[var(--brand)] bg-[var(--brand)] text-[var(--navy-deep)]"
                    : ["preview", "assessment", "checkout", "reports"].indexOf(
                          stage
                        ) > index
                      ? "border-[var(--success)] bg-[var(--success)] text-white"
                      : "border-[var(--border)] text-[var(--muted-foreground)]"
                )}
              >
                {["preview", "assessment", "checkout", "reports"].indexOf(
                  stage
                ) > index ? (
                  <CheckCircle2 size={12} />
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={cn(
                  "hidden sm:inline-block text-xs font-semibold uppercase tracking-[.1em]",
                  stage === step.id ? "text-[var(--foreground)]" : ""
                )}
              >
                {step.label}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}

function ValuePreviewPage({
  onStart,
  prefilledName,
  prefilledEmail,
}: {
  onStart: (data: { name: string; email: string }) => void;
  prefilledName?: string;
  prefilledEmail?: string;
}) {
  const [name, setName] = useState(prefilledName || "");
  const [email, setEmail] = useState(prefilledEmail || "");
  const [consent, setConsent] = useState(false);
  const { data: questionsData } = trpc.careerPath.questions.useQuery();
  const totalQuestions = questionsData?.questions?.length || 180;
  const totalModules =
    questionsData?.questions?.reduce((acc, q) => {
      if (!acc.includes(q.module)) acc.push(q.module);
      return acc;
    }, [] as string[]).length || 3;

  const canStart = name.trim().length >= 2 && email.includes("@") && consent;

  return (
    <main className="container py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-4xl">
        <p className="eyebrow text-[var(--brand)]">
          Step 1 of 3 — Discover Your Path
        </p>
        <h1 className="text-display text-4xl font-semibold leading-[1.05] tracking-tight mt-3 sm:text-5xl lg:text-6xl text-[var(--navy-deep)]">
          Discover your optimal{" "}
          <span className="text-[var(--brand)]">career pathway</span> in 20
          minutes
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--muted-on-dark)]">
          The CareerPath Assessment maps your interests, abilities, learning
          preferences, values, talents, and aspirations to three evidence-based
          pathways — so you can choose your next direction with confidence.
        </p>

        {/* Trust Bar */}
        <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-[var(--muted-on-dark)]">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br from-[var(--navy-deep)] to-[var(--ivory)]"
              />
            ))}
          </div>
          <div>
            <p className="font-semibold text-[var(--navy-deep)]">
              Used by 500+ organizations
            </p>
            <p className="text-xs text-[var(--muted-on-dark)]">
              Across Kenya and beyond
            </p>
          </div>
        </div>

        {/* Sample Report Preview */}
        <div className="mt-10 rounded-2xl border border-[var(--brand)]/30 bg-[var(--card)] p-6 sm:p-8 shadow-2xl shadow-[var(--brand)]/10">
          <div className="flex items-center justify-between mb-6">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-[var(--brand)]/40 text-[10px] font-bold uppercase tracking-wider text-[var(--brand)]">
              Sample Report
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-on-dark)]">
              Interactive preview
            </span>
          </div>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: Target,
                  title: "Primary Pathway",
                  value: "Strategic Leadership",
                  color: "text-[var(--brand)]",
                },
                {
                  icon: BarChart3,
                  title: "Fit Score",
                  value: "92 / 100",
                  color: "text-[var(--brand)]",
                },
                {
                  icon: Award,
                  title: "Certificate",
                  value: "Included",
                  color: "text-[var(--brand)]",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-[var(--brand)]/20 bg-[var(--navy-deep)]/40 p-4 hover:border-[var(--brand)]/40 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand)]/15">
                    <item.icon
                      className="h-5 w-5"
                      style={{ color: "var(--brand)" }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-on-dark)]">
                      {item.title}
                    </p>
                    <p className="text-xs" style={{ color: item.color }}>
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-[var(--brand)]/20">
              <p className="text-sm font-medium text-[var(--text-on-dark)]">
                Your report includes:
              </p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2 text-sm opacity-90">
                {[
                  "Three pathway scores with fit bands",
                  "Sub-pathway breakdown (9 areas)",
                  "Evidence & exploration plan",
                  "Coaching-ready certificate (SVG)",
                  "Shareable achievement badge",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2
                      className="w-4 h-4 shrink-0"
                      style={{ color: "var(--brand)" }}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* What You Get */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: BookOpen,
              title: "180 Likert items",
              desc: "Across 9 evidence areas",
            },
            {
              icon: Clock3,
              title: "35–45 minutes",
              desc: "Complete in a quiet setting",
            },
            {
              icon: Shield,
              title: "KES {CAREER_PATH_PRICE_KES}",
              desc: "Secure Paystack checkout",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm transition-all hover:border-[var(--brand)]/30 hover:shadow-xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand)] text-[var(--navy-deep)] shadow-lg shadow-[var(--brand)]/25">
                <item.icon size={22} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-[var(--navy-deep)]">
                {item.title.replace(
                  "{CAREER_PATH_PRICE_KES}",
                  String(CAREER_PATH_PRICE_KES)
                )}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted-on-dark)]">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Form */}
        <div className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 shadow-sm">
          <p className="eyebrow text-[var(--brand)]">Begin Your Assessment</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="cp-name"
                className="text-sm font-semibold text-[var(--foreground)]"
              >
                Full Name
              </Label>
              <Input
                id="cp-name"
                name="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                minLength={2}
                autoComplete="name"
                className="h-12 text-base focus-gold-ring"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="cp-email"
                className="text-sm font-semibold text-[var(--foreground)]"
              >
                Email for Report
              </Label>
              <Input
                id="cp-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-12 text-base focus-gold-ring"
              />
            </div>
          </div>
          <div className="mt-5 flex items-start gap-3">
            <input
              type="checkbox"
              id="cp-consent"
              name="consent"
              checked={consent}
              onChange={e => setConsent(e.target.checked)}
              required
              className="mt-1 shrink-0 accent-[var(--brand)]"
            />
            <Label
              htmlFor="cp-consent"
              className="text-sm text-[var(--muted-foreground)] leading-6 cursor-pointer"
            >
              I consent to Profound IQ processing my responses to generate this
              educational pathway report and sending the report to the email
              above.
            </Label>
          </div>
          <div className="mt-6 flex items-center justify-between gap-3">
            <Button
              asChild
              variant="outline"
              size="lg"
              onClick={() => (window.location.href = "/")}
              className=""
            >
              <a href="/">
                <ArrowLeft size={16} className="mr-2" /> Back to Home
              </a>
            </Button>
            <Button
              variant="brand"
              size="lg"
              onClick={() =>
                onStart({ name: name.trim(), email: email.trim() })
              }
              disabled={!canStart}
              className="w-full sm:w-auto"
            >
              <ArrowRight size={18} className="mr-2" />
              Start Assessment
              <span className="ml-2 text-xs opacity-80">
                KES {CAREER_PATH_PRICE_KES} • 35–45 min
              </span>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

function AssessmentPage({
  onComplete,
  onBack,
  defaultName,
  defaultEmail,
}: {
  onComplete: (data: {
    name: string;
    email: string;
    answers: Array<{ questionId: string; value: number }>;
  }) => void;
  onBack?: () => void;
  defaultName?: string;
  defaultEmail?: string;
}) {
  const { data: questionsData, isLoading, isError, error } =
    trpc.careerPath.questions.useQuery();
  const [name, setName] = useState(defaultName || "");
  const [email, setEmail] = useState(defaultEmail || "");
  const [consent, setConsent] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedPulse, setSavedPulse] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const allQuestions = questionsData?.questions || [];
  const answeredCount = allQuestions.filter(q => answers[q.id]).length;
  const overallCompletion = allQuestions.length
    ? Math.round((answeredCount / allQuestions.length) * 100)
    : 0;
  const currentQuestion = allQuestions[currentIndex];
  const selected = currentQuestion ? answers[currentQuestion.id] : undefined;
  const isLastQuestion = currentIndex === allQuestions.length - 1;

  if (isError) {
    console.error("CareerPath questions query failed:", error);
    return (
      <main className="container py-16">
        <div className="mx-auto max-w-xl border border-[var(--danger)] bg-[var(--danger-muted)] p-6 rounded-xl">
          <h2 className="text-lg font-bold text-[var(--danger)]">Failed to load questions</h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <Button
            variant="brand"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </div>
      </main>
    );
  }

  // Restore from localStorage on mount (before auto-save)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("careerpath-assessment");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name) setName(parsed.name);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.consent) setConsent(parsed.consent);
        if (parsed.answers) setAnswers(parsed.answers);
        if (typeof parsed.currentIndex === "number")
          setCurrentIndex(parsed.currentIndex);
      } catch {
        localStorage.removeItem("careerpath-assessment");
      }
    }
    setHydrated(true);
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    if (typeof window === "undefined" || !hydrated) return;
    const payload = {
      name,
      email,
      consent,
      answers,
      currentIndex,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem("careerpath-assessment", JSON.stringify(payload));
  }, [hydrated, name, email, consent, answers, currentIndex]);

  const savePulseEffect = () => {
    setSavedPulse(true);
    setTimeout(() => setSavedPulse(false), 1200);
  };

  const handleAnswer = (questionId: string, value: number) => {
    const next = { ...answers, [questionId]: value };
    setAnswers(next);
  };

  const goNext = () => {
    if (isLastQuestion) {
      // All questions complete - go to checkout
      const payload: Array<{ questionId: string; value: number }> =
        allQuestions.map(q => ({
          questionId: q.id,
          value: answers[q.id],
        }));
      onComplete({ name: name.trim(), email: email.trim(), answers: payload });
      return;
    }
    setCurrentIndex(i => Math.min(i + 1, allQuestions.length - 1));
  };

  const goPrev = () => setCurrentIndex(i => Math.max(0, i - 1));

  if (isLoading) {
    return (
      <main className="container py-16">
        <div
          className="flex items-center gap-3 text-sm"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="animate-spin text-[var(--brand)]" size={18} />{" "}
          Preparing your CareerPath Assessment…
        </div>
      </main>
    );
  }

  if (!allQuestions.length) {
    return (
      <main className="container py-16">
        <p className="text-sm text-[var(--muted-foreground)]">
          No questions available.
        </p>
      </main>
    );
  }

  return (
    <main className="container py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
          {/* Progress bar */}
          <div className="mb-8">
            <ProgressMotionBar value={overallCompletion} height={8} showLabel />
            <EncouragementMessage
              value={overallCompletion}
              messages={[
                {
                  min: 100,
                  text: "You're one step closer to discovering your career direction!",
                },
                {
                  min: 67,
                  text: "Excellent progress! Your career profile is taking shape.",
                },
                {
                  min: 34,
                  text: "You're uncovering your strengths. Keep going!",
                },
                { min: 0, text: "Every step forward matters. Let's begin." },
              ]}
              className="mt-2"
            />
            <div className="mt-3 flex items-center gap-2">
              {[0, 1, 2, 3].map(step => (
                <ProgressMilestone
                  key={step}
                  achieved={overallCompletion >= (step + 1) * 25}
                />
              ))}
            </div>
          </div>

          {/* Question card */}
          <Card className="border-[var(--border)] bg-[var(--card)] overflow-hidden">
            {/* Question header */}
            <div className="px-6 pt-6 pb-4 border-b border-[var(--border)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--brand)] sm:text-sm">
                  Q{currentIndex + 1} of {allQuestions.length}
                </span>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {currentQuestion?.module}
                </span>
              </div>
            </div>

            {/* Question content */}
            <CardContent className="p-6 sm:p-8">
              <h2 className="mb-6 text-xl sm:text-2xl font-semibold leading-8 text-[var(--foreground)]">
                {currentQuestion?.prompt}
              </h2>

              {currentQuestion && (
                <LikertScale
                  id={currentQuestion.id}
                  question={currentQuestion.prompt}
                  value={selected}
                  onChange={value => handleAnswer(currentQuestion.id, value)}
                  options={[
                    { value: 1, label: "1", description: "Strongly disagree" },
                    { value: 2, label: "2", description: "Disagree" },
                    { value: 3, label: "3", description: "Neutral" },
                    { value: 4, label: "4", description: "Agree" },
                    { value: 5, label: "5", description: "Strongly agree" },
                  ]}
                />
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between gap-3 mt-8 pt-6 border-t border-[var(--border)]">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={goPrev}
                  disabled={currentIndex === 0}
                  className="gap-2"
                >
                  <ArrowLeft size={16} /> Previous
                </Button>
                <Button
                  variant={isLastQuestion ? "brand" : "primary"}
                  size="lg"
                  onClick={goNext}
                  disabled={selected === undefined}
                  className={cn(
                    "gap-2",
                    isLastQuestion
                      ? ""
                      : "bg-[var(--navy-deep)] hover:bg-[var(--navy-deep)]/90"
                  )}
                >
                  {isLastQuestion ? (
                    <>
                      Complete & Proceed to Checkout
                      <ArrowRight size={16} />
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight size={16} />
                    </>
                  )}
                </Button>
              </div>

              <p className="mt-4 text-center text-xs text-[var(--muted-foreground)]">
                Progress auto-saves locally. Resume anytime from this page.
              </p>
            </CardContent>
          </Card>
      </div>
    </main>
  );
}

function CheckoutPage({
  answers,
  participant,
  onVerified,
  onBack,
}: {
  answers: Array<{ questionId: string; value: number }>;
  participant: { name: string; email: string };
  onVerified: (report: CareerPathReport, reference: string) => void;
  onBack?: () => void;
}) {
  const verifyPayment = trpc.careerPath.verifyPayment.useMutation({
    onError: error => {
      toast.error(
        error instanceof Error ? error.message : "Verification failed"
      );
    },
  });

  const handleSuccess = (reference: string) => {
    verifyPayment.mutate(
      { reference },
      { onSuccess: result => onVerified(result.report, reference) }
    );
  };

  return (
    <main className="container py-12 sm:py-16">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex items-center gap-3">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              aria-label="Back to assessment"
            >
              <ArrowLeft size={20} />
            </Button>
          )}
          <span className="eyebrow text-[var(--brand)]">
            Step 3 of 3 — Secure Checkout
          </span>
        </div>

        <CheckoutForm
          product={{
            name: "CareerPath Talent Fit Assessment",
            priceKes: CAREER_PATH_PRICE_KES,
            type: "careerpath",
            slug: "careerpath",
            answers,
          }}
          prefilled={participant}
          upsells={[
            {
              id: "coaching",
              name: "1-on-1 Coaching Debrief",
              priceKes: 5000,
              description:
                "60-minute personalized debrief with a certified coach",
            },
            {
              id: "team",
              name: "Team Comparison Report",
              priceKes: 3000,
              description:
                "Side-by-side comparison with team members (5+ people)",
            },
          ]}
          onSuccess={handleSuccess}
          onClose={onBack ? () => onBack!() : undefined}
        />
      </div>
    </main>
  );
}

function ReportsPage({
  reference,
  onBack,
}: {
  reference?: string | null;
  onBack?: () => void;
}) {
  const { data: currentUser } = trpc.auth.me.useQuery();
  const { data: careerHistory = [] } = trpc.careerPath.history.useQuery(
    undefined,
    { enabled: Boolean(currentUser), retry: false }
  );
  const { data: shareCounts = {} } = trpc.careerPath.shareCounts.useQuery(
    undefined,
    { enabled: Boolean(currentUser), retry: false }
  );
  const [report, setReport] = useState<CareerPathReport | null>(null);
  const [reportReference, setReportReference] = useState<string | null>(
    reference ?? null
  );
  const recordShare = trpc.careerPath.recordShare.useMutation();
  const downloadReportPdf = trpc.careerPath.downloadReport.useMutation();

  const shareUrl = reportReference
    ? `${window.location.origin}/careerpath/reports?reference=${encodeURIComponent(reportReference)}`
    : window.location.origin;
  const shareTitle = "My CareerPath Assessment Result";
  const shareMessage = report
    ? `I completed my Profound IQ CareerPath Assessment. My primary pathway is ${report.primary.label}.`
    : "I completed my Profound IQ CareerPath Assessment.";
  const handleShare = (platform: SocialPlatform) => {
    const supportedPlatforms = [
      "linkedin",
      "whatsapp",
      "facebook",
      "x",
      "email",
    ] as const;
    if (supportedPlatforms.includes(platform as any)) {
      recordShare.mutate({
        platform: platform as
          "linkedin" | "whatsapp" | "facebook" | "x" | "email",
        asset: "report",
      });
    }
  };

  const { data: reportData, isLoading: reportLoading } =
    trpc.careerPath.getReport.useQuery(
      { reference: reportReference ?? "" },
      { enabled: Boolean(reportReference), retry: false }
    );

  useEffect(() => {
    if (reportData?.report && !report)
      setReport(reportData.report as CareerPathReport);
  }, [reportData]);

  const downloadCertificate = () => {
    if (!report) return;
    const escapedName =
      report.primary.label.replace(/[<&>\"]/g, "") ?? "CareerPath";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="#101d35"/><rect x="36" y="36" width="1128" height="728" fill="none" stroke="#c9a34e" stroke-width="3"/><text x="600" y="180" fill="#c9a34e" text-anchor="middle" font-family="var(--font-display)" font-size="24" letter-spacing="6">PROFOUND IQ CONSULTING</text><text x="600" y="300" fill="#f7f3e8" text-anchor="middle" font-family="var(--font-display)" font-size="62">Completion certificate</text><text x="600" y="390" fill="#c1cad7" text-anchor="middle" font-family="var(--font-body)" font-size="24">CareerPath Assessment completed</text><text x="600" y="500" fill="#c9a34e" text-anchor="middle" font-family="var(--font-display)" font-size="42">Primary pathway: ${escapedName}</text><text x="600" y="620" fill="#c1cad7" text-anchor="middle" font-family="var(--font-body)" font-size="18">Issued ${new Date().toLocaleDateString()}</text></svg>`;
    const anchor = document.createElement("a");
    anchor.href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    anchor.download = "profound-iq-careerpath-completion-certificate.svg";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    toast.success("Completion certificate downloaded");
  };

  const downloadReport = () => {
    if (!reportReference) return;
    downloadReportPdf.mutate(
      { reference: reportReference },
      {
        onSuccess: data => {
          const blob = new Blob([Buffer.from(data.data, "base64")], {
            type: data.contentType,
          });
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement("a");
          anchor.href = url;
          anchor.download = data.filename;
          document.body.appendChild(anchor);
          anchor.click();
          anchor.remove();
          URL.revokeObjectURL(url);
          toast.success("Comprehensive report downloaded");
        },
        onError: () =>
          toast.error("Unable to download report. Please try again."),
      }
    );
  };

  if (reportLoading) {
    return (
      <main className="container py-16">
        <div
          className="flex items-center gap-3 text-sm"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="animate-spin text-[var(--brand)]" size={18} />{" "}
          Loading your CareerPath report...
        </div>
      </main>
    );
  }

  if (!report) {
    return (
      <main className="container py-16">
        <div className="mx-auto max-w-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
          <p className="eyebrow text-[var(--brand)]">
            Step 4 of 4 — Reports workspace
          </p>
          <h1 className="text-display mt-3 text-4xl">
            Your results are created after verification.
          </h1>
          <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
            Complete the assessment and payment verification to unlock your
            tailored CareerPath report.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/careerpath"
              className="bg-[var(--brand)] px-5 py-3 text-sm font-bold text-[var(--navy-deep)]"
            >
              Start Assessment
            </Link>
            <Link
              href="/dashboard"
              className="border border-[var(--border)] px-5 py-3 text-sm font-bold"
            >
              Open workspace
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-10 sm:py-16">
      <div className="max-w-6xl">
        <div className="mb-6 flex items-center gap-3">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              aria-label="Back"
            >
              <ArrowLeft size={20} />
            </Button>
          )}
          <span className="eyebrow text-[var(--brand)]">
            Step 4 of 4 — Your CareerPath Profile
          </span>
        </div>
        <h1 className="text-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl text-[var(--navy-deep)]">
          Discover.{" "}
          <em className="font-normal text-[var(--brand)]">Explore.</em> Choose.
        </h1>
        <p className="mt-5 text-base leading-7 text-[var(--muted-foreground)]">
          {report.overallReadout}
        </p>

        {/* Primary Pathway Hero */}
        <div className="mt-10 rounded-2xl border border-[var(--brand)]/30 bg-[var(--card)] p-6 sm:p-8 shadow-2xl shadow-[var(--brand)]/10">
          <p className="text-xs font-bold uppercase tracking-[.1em] text-[var(--brand)]">
            Primary Pathway
          </p>
          <h2 className="text-display mt-2 text-3xl font-semibold text-[var(--text-on-dark)]">
            {report.primary.label}
          </h2>
          <p className="mt-2 text-5xl font-bold text-[var(--brand)]">
            {report.primary.score}{" "}
            <span className="text-base font-normal">/ 100</span>
          </p>
          <p className="mt-2 text-xs font-bold uppercase tracking-[.1em] text-[var(--brand)]">
            {report.primary.band}
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted-on-dark)]">
            {report.primary.evidence[0] ||
              "Your primary pathway reflects your strongest interests and abilities."}
          </p>
        </div>

        <CareerPathReportInsights report={report} history={careerHistory} />

        {/* Actions */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Button variant="brand" size="lg" onClick={downloadCertificate}>
            <Download size={15} className="mr-2" /> Certificate
          </Button>
          <Button variant="brand" size="lg" onClick={downloadReport}>
            <Download size={15} className="mr-2" /> Report
          </Button>
          <SocialSharing
            url={shareUrl}
            title={shareTitle}
            text={shareMessage}
            platforms={[
              "linkedin",
              "x",
              "facebook",
              "instagram",
              "tiktok",
              "whatsapp",
              "copy",
              "native",
            ]}
            onShare={handleShare}
            className="bg-transparent border-transparent shadow-none"
          />
        </div>

        {/* Cross-sell: Recommended Psychometric */}
        <div className="mt-10 rounded-2xl border-l-4 border-[var(--success)] bg-[var(--success-muted)] p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[var(--success)] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[var(--foreground)]">
                Deep dive: Your profile suggests{" "}
                <strong>Leadership Psychometric</strong>
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Explore cognitive reasoning, emotional intelligence, and
                leadership style in 15 minutes.
              </p>
            </div>
            <Button
              variant="brand"
              size="sm"
              onClick={() =>
                (window.location.href =
                  "/psychometrics/leadership-psychometric")
              }
            >
              <ArrowRight size={14} className="mr-1" />
              Explore
            </Button>
          </div>
        </div>

        {/* Full Report Tabs */}
        <ReportSectionTabs
          sections={[
            {
              id: "pathways",
              label: "All Pathways",
              content: (
                <section className="mt-8 grid gap-6 md:grid-cols-3">
                  {report.pathways.map(
                    (pathway: CareerPathwayResult, index: number) => {
                      const colors =
                        index === 0
                          ? pathwayColors.primary
                          : index === 1
                            ? pathwayColors.secondary
                            : pathwayColors.alternative;
                      return (
                        <article
                          key={pathway.key}
                          className={cn(
                            "border p-5 transition-transform sm:p-7 hover:shadow-lg",
                            colors.border,
                            colors.bg,
                            colors.text,
                            colors.accent,
                            colors.scoreColor
                          )}
                        >
                          <p className="text-[10px] font-black uppercase tracking-[.16em] opacity-70">
                            {index === 0
                              ? "Primary pathway"
                              : index === 1
                                ? "Secondary pathway"
                                : "Alternative pathway"}
                          </p>
                          <h2 className="text-display mt-4 text-3xl">
                            {pathway.label}
                          </h2>
                          <p className="mt-4 text-5xl font-bold">
                            {pathway.score}{" "}
                            <span className="text-base">/ 100</span>
                          </p>
                          <p className="mt-3 text-xs font-bold uppercase tracking-[.12em]">
                            {pathway.band}
                          </p>
                          <p className="mt-4 text-sm leading-6 opacity-80">
                            {pathway.evidence[0] ||
                              "Your pathway reflects your interests and abilities."}
                          </p>
                        </article>
                      );
                    }
                  )}
                </section>
              ),
            },
            {
              id: "subpathways",
              label: "Sub-Pathways",
              content: (
                <section className="mt-8 border border-[var(--border)] bg-[var(--card)] p-5 sm:p-8">
                  <p className="eyebrow text-[var(--brand)]">
                    Sub-pathway readout
                  </p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {report.subPathways.map(subPathway => (
                      <article
                        key={subPathway.key}
                        className="border border-[var(--border)] bg-[var(--card)] p-5 transition-transform hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-sm font-bold">
                            {subPathway.label}
                          </h3>
                          <span className="text-lg font-semibold text-[var(--brand)]">
                            {subPathway.score}
                          </span>
                        </div>
                        <p className="mt-2 text-[10px] font-black uppercase tracking-[.1em] text-[var(--brand)]">
                          {subPathway.band}
                        </p>
                        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                          {subPathway.rationale}
                        </p>
                      </article>
                    ))}
                  </div>
                </section>
              ),
            },
            {
              id: "evidence",
              label: "Evidence & Plan",
              content: (
                <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
                  <article className="border border-[var(--border)] bg-[var(--card)] p-5 sm:p-8">
                    <p className="eyebrow text-[var(--brand)]">
                      Why this signal matters
                    </p>
                    <h2 className="text-display mt-3 text-3xl">
                      Evidence to explore.
                    </h2>
                    {report.primary.evidence.map((item: string) => (
                      <div
                        key={item}
                        className="mt-5 flex gap-3 text-sm leading-6"
                      >
                        <CheckCircle2
                          size={17}
                          className="mt-1 shrink-0 text-[var(--brand)]"
                        />
                        <span>{item}</span>
                      </div>
                    ))}
                    <h3 className="mt-8 text-[10px] font-black uppercase tracking-[.14em] text-[var(--brand)]">
                      Recommended next steps
                    </h3>
                    {report.explorationPlan.map((item: string) => (
                      <p
                        key={item}
                        className="mt-3 border-l border-[var(--brand)] pl-3 text-sm leading-6 text-[var(--muted-foreground)]"
                      >
                        {item}
                      </p>
                    ))}
                  </article>
                  <article className="border-l-4 border-[var(--brand)] bg-[var(--gold-muted)] p-5 text-[var(--navy-deep)] sm:p-8">
                    <Sparkles size={19} className="text-[var(--brand)]" />
                    <h2 className="text-display mt-3 text-3xl text-[var(--navy-deep)]">
                      Important context.
                    </h2>
                    {report.importantContext.map((item: string) => (
                      <p key={item} className="mt-4 text-sm leading-6">
                        {item}
                      </p>
                    ))}
                    <p className="mt-7 border-t border-[var(--brand)]/20 pt-5 text-xs leading-5 text-[var(--muted-foreground)]">
                      {report.disclaimer}
                    </p>
                  </article>
                </section>
              ),
            },
            {
              id: "history",
              label: "History",
              content: (
                <section
                  className="mt-8 border border-[var(--border)] bg-[var(--card)] p-5 sm:p-7"
                  aria-label="Past CareerPath reports and certificates"
                >
                  <p className="eyebrow text-[var(--brand)]">Your history</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {careerHistory.slice(0, 4).map((item: any) => (
                      <article
                        key={item.id}
                        className="border border-[var(--border)] bg-[var(--card)] p-4"
                      >
                        <div className="mb-3 overflow-hidden border border-[var(--brand)]/60 bg-[var(--navy-deep)] p-3 text-[var(--text-on-dark)]">
                          <p className="text-[9px] font-black uppercase tracking-[.16em] text-[var(--brand)]">
                            Profound IQ Consulting
                          </p>
                          <p className="text-display mt-2 text-xl">
                            Certificate
                          </p>
                          <p className="mt-2 text-[9px] uppercase tracking-[.1em] text-[var(--muted-on-dark)]">
                            CareerPath achievement
                          </p>
                        </div>
                        <p className="text-sm font-bold">
                          {item.receiptTitle || "CareerPath Assessment"}
                        </p>
                        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                          {new Date(item.createdAt).toLocaleDateString()} ·{" "}
                          {item.paymentStatus}
                        </p>
                        {Boolean(item.report) && item.paystackReference && (
                          <Link
                            href={`/careerpath/reports?reference=${encodeURIComponent(item.paystackReference)}`}
                            className="mt-3 inline-block text-xs font-black uppercase tracking-[.1em] text-[var(--brand)]"
                          >
                            View report
                          </Link>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              ),
            },
          ]}
        />
      </div>
    </main>
  );
}

export default function CareerPath() {
  const [page, setPage] = useState<Page>("preview");
  const [completedAssessment, setCompletedAssessment] = useState<{
    name: string;
    email: string;
    answers: Array<{ questionId: string; value: number }>;
  } | null>(null);
  const [checkoutReference, setCheckoutReference] = useState<string | null>(
    null
  );
  const [unlockedReport, setUnlockedReport] = useState<CareerPathReport | null>(
    null
  );
  const { data: currentUser } = trpc.auth.me.useQuery();
  const [location, setLocation] = useLocation();
  const verifyPaymentFromRedirect = trpc.careerPath.verifyPayment.useMutation();

  const qualityControlMode =
    currentUser?.email?.trim().toLowerCase() ===
    "profoundiqconsulting@gmail.com";

  const { redirect, navigate } = usePostPaymentRedirect({
    productType: "careerpath",
    reference: checkoutReference || undefined,
    enabled: false, // We'll manually call redirect when needed
  });

  useEffect(() => {
    const pathname = window.location.pathname;
    if (pathname === "/careerpath/assessment") setPage("assessment");
    else if (pathname === "/careerpath/checkout") setPage("checkout");
    else if (pathname === "/careerpath/reports") setPage("reports");

    const query = new URLSearchParams(window.location.search);
    const reference = query.get("reference");
    if (query.get("payment") === "success" && reference) {
      verifyPaymentFromRedirect.mutate(
        { reference },
        {
          onSuccess: result => {
            setCheckoutReference(reference);
            setUnlockedReport(result.report);
            setPage("reports");
          },
          onError: error => {
            toast.error(error.message || "Payment could not be verified.");
          },
        }
      );
    }
  }, [location]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("careerpath-assessment");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.answers && Object.keys(parsed.answers).length > 0) {
          setPage("assessment");
        }
      } catch {
        localStorage.removeItem("careerpath-assessment");
      }
    }
  }, []);

  const handleAssessmentComplete = (data: {
    name: string;
    email: string;
    answers: Array<{ questionId: string; value: number }>;
  }) => {
    setCompletedAssessment(data);
    setCheckoutReference(null);
    setPage("checkout");
    setLocation("/careerpath/checkout");
  };

  const handleCheckoutSuccess = (
    report: CareerPathReport,
    reference: string
  ) => {
    setCheckoutReference(reference);
    setUnlockedReport(report);
    localStorage.removeItem("careerpath-assessment");
    // Use redirect hook to navigate to report page
    const decision = redirect();
    if (decision) {
      navigate();
    } else {
      setPage("reports");
    }
  };

  const navigateTo = (next: Page, path: string) => {
    setPage(next);
    setLocation(path);
  };

  if (page === "reports" && (unlockedReport || checkoutReference)) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        {qualityControlMode && (
          <div
            className="border-b border-[var(--brand)]/40 bg-[var(--gold-muted)] px-5 py-2 text-center text-[10px] font-black uppercase tracking-[.14em] text-[var(--brand)]"
            role="status"
          >
            Quality Control Mode · Payment bypass active
          </div>
        )}
        <TransformationNav active="careerpath" />
        <CareerPathProgressRing
          stage="reports"
          modulePage={0}
          totalModules={1}
          answeredCount={0}
          totalQuestions={0}
        />
        <ReportsPage
          reference={checkoutReference}
          onBack={() => navigateTo("checkout", "/careerpath/checkout")}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {qualityControlMode && (
        <div
          className="border-b border-[var(--brand)]/40 bg-[var(--gold-muted)] px-5 py-2 text-center text-[10px] font-black uppercase tracking-[.14em] text-[var(--brand)]"
          role="status"
        >
          Quality Control Mode · Payment bypass active
        </div>
      )}
      <TransformationNav active="careerpath" />
      <div className="animate-in fade-in duration-300">
        {page === "preview" && (
          <ValuePreviewPage
            onStart={data => {
              // Store name/email for assessment page
              localStorage.setItem(
                "careerpath-participant",
                JSON.stringify(data)
              );
              navigateTo("assessment", "/careerpath/assessment");
            }}
            prefilledName={completedAssessment?.name}
            prefilledEmail={completedAssessment?.email}
          />
        )}
        {page === "assessment" && (
          <AssessmentPage
            onComplete={handleAssessmentComplete}
            onBack={() => navigateTo("preview", "/careerpath")}
            defaultName={completedAssessment?.name}
            defaultEmail={completedAssessment?.email}
          />
        )}
        {page === "checkout" && completedAssessment && (
          <CheckoutPage
            answers={completedAssessment.answers}
            participant={{
              name: completedAssessment.name,
              email: completedAssessment.email,
            }}
            onVerified={handleCheckoutSuccess}
            onBack={() => navigateTo("assessment", "/careerpath/assessment")}
          />
        )}
      </div>
    </div>
  );
}

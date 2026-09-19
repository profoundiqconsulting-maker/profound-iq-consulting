/* Profound IQ Consulting — Executive Observatory course workspace: editorial navy/ivory surfaces, gold progress signals, and calm motion for globally relevant professional learning. */
import { useEffect, useMemo, useRef, useState } from "react";
import { PUBLISHED_SITE_ORIGIN } from "@shared/siteOrigin";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  Download,
  Expand,
  Loader2,
  LockKeyhole,
  PanelLeftClose,
  PanelLeftOpen,
  Printer,
  RotateCcw,
  Share2,
  Sparkles,
} from "lucide-react";
import { Link, useRoute } from "wouter";
import {
  courseCatalog,
  COURSE_PASS_MARK,
  type CourseDefinition,
  type CourseQuizQuestion,
} from "@shared/courseCatalog";
import {
  canAccessCourseLessons,
  canAccessModuleLessons,
  courseAccessReason,
  requiredPaymentStageForModule,
} from "@shared/courseAccess";
import {
  buildCertificateLinkedInPost,
  buildCertificateShareUrl,
  buildLinkedInShareUrl,
  CERTIFICATE_DOWNLOAD_PLATFORMS,
  type CertificateSharePlatform,
} from "@shared/certificateSharing";
import { hasIssuedCertificate } from "@shared/certificateAnalytics";
import { getCanonicalCertificateArtifact } from "@shared/canonicalCertificate";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TransformationNav } from "@/components/TransformationNav";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { buildCourseModuleBadges } from "@shared/courseBadges";
import { ModuleCompletionBadge } from "@/components/ModuleCompletionBadge";
import { AdminCourseQAChecklist } from "@/components/AdminCourseQAChecklist";
import { CourseShareActions } from "@/components/CourseShareActions";

import {
  getLessonInteractiveCopy,
  getLessonIllustrationCopy,
  localizeCourseDefinition,
} from "@shared/contentLocalization";
import { getAuthCopy } from "@shared/authLocalization";
import { getCourseEnrollmentCopy } from "@shared/courseEnrollmentLocalization";
import { getAssessmentCopy } from "@shared/assessmentLocalization";
import {
  downloadIllustrationStudySheet,
  downloadIllustrationStudySheetPng,
} from "@/lib/illustrationStudySheet";
import {
  certificatePngBlob,
  downloadCertificatePng,
} from "@/lib/certificatePng";
import { downloadCertificatePdf } from "@/lib/certificatePdf";
import { CourseMapSidebar } from "@/components/CourseMapSidebar";
import PaystackInlineModal, {
  type PaystackInlineProduct,
} from "@/components/PaystackInlineModal";

const storageKey = (slug: string) => `piq-course-progress-${slug}`;
type LessonTimerState = { startedAt: number; completedAt?: number };
type SavedProgress = {
  lessons: string[];
  quizScores: Record<string, number>;
  stageCount: number;
  lessonTimers: Record<string, LessonTimerState>;
  responses: Record<string, Record<string, string>>;
};
type LessonResponseSaveStatus = "idle" | "saving" | "saved" | "error";

function LessonPlayerSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading lesson"
      className="mt-6 space-y-6"
    >
      <span className="sr-only">Loading lesson content…</span>
      <div className="border border-[#c9a34e]/45 bg-[#16243d] p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="h-4 w-48 animate-pulse bg-white/15" />
          <div className="h-8 w-20 animate-pulse bg-[#c9a34e]/35" />
        </div>
        <div className="mt-4 h-2 w-full animate-pulse bg-white/15" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            {[1, 2, 3].map(item => (
              <div
                key={item}
                className="h-16 w-full animate-pulse bg-[#16243d]/10"
              />
            ))}
          </div>
          <div className="h-28 w-full animate-pulse bg-[#16243d]/10" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map(item => (
              <div
                key={item}
                className="space-y-3 border-t border-[#16243d]/10 pt-5"
              >
                <div className="h-3 w-32 animate-pulse bg-[#c9a34e]/35" />
                <div className="h-4 w-full animate-pulse bg-[#16243d]/10" />
                <div className="h-4 w-11/12 animate-pulse bg-[#16243d]/10" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-36 w-full animate-pulse bg-[#16243d]/10" />
          <div className="h-48 w-full animate-pulse bg-[#16243d]/10" />
        </div>
      </div>
    </div>
  );
}

const shuffle = <T,>(items: T[]) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};
const shuffleQuizForAttempt = (questions: CourseQuizQuestion[]) =>
  shuffle(questions).map(question => {
    const optionEntries = shuffle(
      question.options.map((option, index) => ({ option, index }))
    );
    return {
      ...question,
      options: optionEntries.map(entry => entry.option),
      correctOption: optionEntries.findIndex(
        entry => entry.index === question.correctOption
      ),
    };
  });

function IllustrationCard({
  label,
  text,
  tone,
  visualUrl,
  visualAlt,
  bookmarked,
  onToggleBookmark,
  onZoom,
  onDownloadStudySheet,
}: {
  label: string;
  text: string;
  tone: "gold" | "teal" | "plum";
  visualUrl?: string;
  visualAlt?: string;
  bookmarked?: boolean;
  onToggleBookmark?: () => void;
  onZoom?: () => void;
  onDownloadStudySheet?: () => void;
}) {
  const toneClasses = {
    gold: "border-[#c9a34e]/45 bg-[#c9a34e]/10",
    teal: "border-[#2f6f78]/45 bg-[#2f6f78]/10",
    plum: "border-[#8b4f63]/45 bg-[#8b4f63]/10",
  };
  return (
    <article className={`border-l-2 p-3 ${toneClasses[tone]}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[9px] font-black uppercase tracking-[.14em] text-muted-on-dark">
          {label}
        </p>
        <div className="flex flex-wrap items-center justify-end gap-1">
          {onZoom && (
            <button
              type="button"
              onClick={onZoom}
              aria-label={`Zoom ${label}`}
              title="Zoom artwork"
              className="inline-flex h-6 min-w-[3.2rem] items-center justify-center gap-0.5 rounded-sm px-1 text-center text-[7px] font-black uppercase tracking-[.05em] text-accent-on-dark transition-colors hover:bg-white/10 hover:text-white"
            >
              <Expand size={11} /> Zoom
            </button>
          )}
          {onDownloadStudySheet && (
            <button
              type="button"
              onClick={onDownloadStudySheet}
              aria-label={`Download ${label} study sheet`}
              title="Download study sheet"
              className="inline-flex h-6 min-w-[3.2rem] items-center justify-center gap-0.5 rounded-sm px-1 text-center text-[7px] font-black uppercase tracking-[.05em] text-accent-on-dark transition-colors hover:bg-white/10 hover:text-white"
            >
              <Download size={11} /> Sheet
            </button>
          )}
          {onToggleBookmark && (
            <button
              type="button"
              onClick={onToggleBookmark}
              aria-label={
                bookmarked ? `Remove ${label} bookmark` : `Bookmark ${label}`
              }
              title={bookmarked ? "Remove bookmark" : "Save illustration"}
              className="inline-flex h-6 min-w-[3.2rem] items-center justify-center gap-0.5 rounded-sm px-1 text-center text-[7px] font-black uppercase tracking-[.05em] text-accent-on-dark transition-colors hover:bg-white/10 hover:text-white"
            >
              <Bookmark size={11} fill={bookmarked ? "currentColor" : "none"} />{" "}
              {bookmarked ? "Saved" : "Save"}
            </button>
          )}
        </div>
      </div>
      {visualUrl && (
        <button
          type="button"
          onClick={onZoom}
          className="mt-3 block w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a34e]"
          aria-label={`Zoom ${label}`}
        >
          <img
            src={visualUrl}
            alt={visualAlt ?? "Conceptual lesson illustration"}
            width={1600}
            height={900}
            loading="lazy"
            className="aspect-[16/9] w-full object-cover opacity-95 transition-transform hover:scale-[1.01]"
          />
        </button>
      )}
      {text && <p className="mt-3 text-xs leading-5 text-[#f0f3f5]">{text}</p>}
    </article>
  );
}

const readProgress = (course: CourseDefinition): SavedProgress => {
  try {
    const saved = JSON.parse(
      window.localStorage.getItem(storageKey(course.slug)) || "{}"
    );
    return {
      lessons: Array.isArray(saved.lessons) ? saved.lessons : [],
      quizScores:
        saved.quizScores && typeof saved.quizScores === "object"
          ? saved.quizScores
          : {},
      stageCount: typeof saved.stageCount === "number" ? saved.stageCount : 0,
      lessonTimers:
        saved.lessonTimers && typeof saved.lessonTimers === "object"
          ? saved.lessonTimers
          : {},
      responses:
        saved.responses && typeof saved.responses === "object"
          ? saved.responses
          : {},
    };
  } catch {
    return {
      lessons: [],
      quizScores: {},
      stageCount: 0,
      lessonTimers: {},
      responses: {},
    };
  }
};

export default function CourseWorkspace() {
  const utils = trpc.useUtils();
  const [, params] = useRoute("/courses/:slug");
  const locale = "en";
  const baseCourse = courseCatalog.find(item => item.slug === params?.slug);
  const course = useMemo(
    () =>
      baseCourse ? localizeCourseDefinition(locale, baseCourse) : undefined,
    [baseCourse, locale]
  );
  if (!course)
    return (
      <div className="min-h-screen bg-[#f7f3e8] p-8 text-[#16243d]">
        <p className="eyebrow text-[#5d4613]">Course not found</p>
        <Link
          href="/#courses"
          className="mt-5 inline-flex border-b border-[#16243d] pb-1 text-sm"
        >
          Return to course catalog
        </Link>
      </div>
    );
  return <CourseWorkspaceContent course={course} />;
}

function CourseWorkspaceContent({ course }: { course: CourseDefinition }) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const courseState = trpc.course.state.useQuery(
    { courseSlug: course.slug },
    { enabled: isAuthenticated }
  );
  if (authLoading)
    return (
      <div className="min-h-screen bg-[#f7f3e8] text-[#16243d]">
        <TransformationNav active="courses" />
        <main className="container grid min-h-[70vh] place-items-center py-16">
          <div className="text-center">
            <Loader2
              className="mx-auto animate-spin text-[#5d4613]"
              size={32}
            />
            <p className="eyebrow mt-5 text-[#5d4613]">Secure course access</p>
            <h1 className="display mt-3 text-4xl">Checking your workspace.</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Your lessons remain protected while we confirm your signed-in
              session.
            </p>
          </div>
        </main>
      </div>
    );
  const paidStages =
    courseState.data
      ?.find(item => item.enrollment.courseSlug === course.slug)
      ?.stages.filter(stage => stage.paymentStatus === "paid").length ?? 0;
  const qaFixture = import.meta.env.DEV
    ? new URLSearchParams(window.location.search).get("qaEnrollment")
    : null;
  const fixturePaidStages =
    qaFixture === "pending"
      ? 0
      : qaFixture === "stage1"
        ? 1
        : qaFixture === "stage2"
          ? 2
          : qaFixture === "stage3"
            ? 3
            : qaFixture === "completed"
              ? 4
              : null;
  const effectivePaidStages = fixturePaidStages ?? paidStages;
  const qualityControl =
    user?.email?.trim().toLowerCase() === "profoundiqconsulting@gmail.com";
  const accessGrant = Boolean(
    courseState.data?.find(item => item.enrollment.courseSlug === course.slug)
      ?.accessGrant
  );
  const accessOverride = qualityControl || accessGrant;
  if (
    !canAccessCourseLessons({
      isAuthenticated,
      paidStages: effectivePaidStages,
    })
  )
    return (
      <CourseAccessGate
        course={course}
        isAuthenticated={isAuthenticated}
        paidStages={effectivePaidStages}
      />
    );
  return (
    <CourseWorkspaceUnlocked
      course={course}
      qualityControl={qualityControl && !fixturePaidStages}
      accessOverride={accessOverride && !fixturePaidStages}
    />
  );
}

function FirstStageCheckout({ course }: { course: CourseDefinition }) {
  const utils = trpc.useUtils();
  const { user } = useAuth();
  const locale = "en";

  const enrollmentCopy = getCourseEnrollmentCopy(locale);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [consent, setConsent] = useState(false);
  const [inlineModalOpen, setInlineModalOpen] = useState(false);
  const [inlineProduct, setInlineProduct] =
    useState<PaystackInlineProduct | null>(null);
  const enroll = trpc.course.enroll.useMutation({
    onError: error =>
      toast.error("Could not create enrollment", {
        description: error.message,
      }),
  });
  const checkout = trpc.course.initializeStageInlinePayment.useMutation({
    onError: error =>
      toast.error("Checkout could not be prepared", {
        description: "Your course access is unchanged. Please try again.",
      }),
  });
  const verify = trpc.course.verifyStagePayment.useMutation();
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !consent) return;
    enroll.mutate(
      {
        courseSlug: course.slug,
        name: name.trim(),
        email: email.trim(),
        consent: true,
      },
      {
        onSuccess: result => {
          if (!result.enrollmentId) {
            toast.error("Enrollment could not be created");
            return;
          }
          checkout.mutate(
            { enrollmentId: result.enrollmentId, stage: 1 },
            {
              onSuccess: payment => {
                if ("paid" in payment && payment.paid) {
                  window.location.reload();
                  return;
                }
                setInlineProduct({
                  accessCode: payment.accessCode,
                  reference: payment.reference,
                  amountKes: payment.amountKes,
                  productName: payment.productName,
                  productType: payment.productType as "course_stage",
                  enrollmentId: result.enrollmentId,
                  courseSlug: course.slug,
                  stage: payment.stage,
                });
                setInlineModalOpen(true);
              },
            }
          );
        },
      }
    );
  };
  const pending =
    enroll.isPending ||
    checkout.isPending ||
    verify.isPending;
  return (
    <form
      onSubmit={submit}
      className="mt-6 max-w-xl border border-white/15 bg-white/5 p-5 sm:p-6"
    >
      <p className="text-xs font-black uppercase tracking-[.14em] text-accent-on-dark">
        First step · unlock Module 1
      </p>
      <p className="mt-2 text-sm leading-6 text-muted-on-dark">
        Create or refresh your enrollment, then pay the first staged installment
        of{" "}
        <strong className="text-[#f7f3e8]">
          KES {(course.stageAmountsKes[0] ?? 0).toLocaleString()}
        </strong>{" "}
        through Paystack. Lesson access opens only after payment verification.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-[10px] font-black uppercase tracking-[.12em] text-muted-on-dark">
          {enrollmentCopy.yourName}
          <input
            id="workspace-enrollment-name"
            name="name"
            required
            minLength={2}
            value={name}
            onChange={event => setName(event.target.value)}
            autoComplete="name"
            className="border border-white/20 bg-[#f7f3e8] px-3 py-3 text-sm font-normal normal-case tracking-normal text-[#16243d] outline-none focus:border-[#c9a34e] focus:ring-2 focus:ring-[#c9a34e]/30"
          />
        </label>
        <label className="grid gap-2 text-[10px] font-black uppercase tracking-[.12em] text-muted-on-dark">
          {enrollmentCopy.emailAddress}
          <input
            id="workspace-enrollment-email"
            name="email"
            required
            type="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            autoComplete="email"
            className="border border-white/20 bg-[#f7f3e8] px-3 py-3 text-sm font-normal normal-case tracking-normal text-[#16243d] outline-none focus:border-[#c9a34e] focus:ring-2 focus:ring-[#c9a34e]/30"
          />
        </label>
      </div>
      <label className="mt-4 flex items-start gap-3 text-xs leading-5 text-muted-on-dark">
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={event => setConsent(event.target.checked)}
          className="mt-1 accent-[#c9a34e]"
        />{" "}
        <span>
          I confirm these details may be used for enrollment, payment receipts,
          course access, certificates, and completion communications.
        </span>
      </label>
      <button
        type="submit"
        disabled={pending || !name.trim() || !email.trim() || !consent}
        className="mt-5 inline-flex items-center gap-2 bg-[#c9a34e] px-5 py-4 text-[10px] font-black uppercase tracking-[.15em] text-[#16243d] disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? (
          <Loader2 size={14} className="animate-spin" aria-hidden="true" />
        ) : (
          <ArrowRight size={14} />
        )}
        {pending
          ? enrollmentCopy.recording
          : `${enrollmentCopy.payment} · KES ${(course.stageAmountsKes[0] ?? 0).toLocaleString()}`}
      </button>
      <PaystackInlineModal
        open={inlineModalOpen}
        product={inlineProduct}
        customerEmail={email.trim()}
        onClose={() => {
          setInlineModalOpen(false);
          setInlineProduct(null);
        }}
        onSuccess={reference => {
          setInlineModalOpen(false);
          setInlineProduct(null);
          verify.mutate(
            { reference },
            {
              onSuccess: () => {
                toast.success("Payment verified", {
                  description: "Your course access is updated.",
                });
                void utils.dashboard.mine.refetch();
                window.location.reload();
              },
              onError: error => {
                toast.error("Payment verification failed", {
                  description: error.message,
                  action: {
                    label: "Retry",
                    onClick: () => window.location.reload(),
                  },
                });
              },
            }
          );
        }}
        onError={message => {
          setInlineModalOpen(false);
          setInlineProduct(null);
          toast.error("Payment failed", {
            description: message,
            action: { label: "Retry", onClick: () => setInlineModalOpen(true) },
          });
        }}
      />
    </form>
  );
}

function CourseAccessGate({
  course,
  isAuthenticated,
  paidStages,
}: {
  course: CourseDefinition;
  isAuthenticated: boolean;
  paidStages: number;
}) {
  const locale = "en";

  const authCopy = getAuthCopy(locale);
  return (
    <div className="min-h-screen bg-[#f7f3e8] text-[#16243d]">
      <TransformationNav active="assessment" />
      <main className="container py-10 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.14em] text-[#5d4613]"
          >
            <ArrowLeft size={14} /> {"Courses"}
          </Link>
          <p className="eyebrow mt-10 text-[#5d4613]">
            Course highlights · {course.duration}
          </p>
          <h1 className="display mt-4 max-w-3xl text-5xl leading-[.95] tracking-[-.045em] sm:text-7xl">
            {course.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#16243d]">
            {course.description}
          </p>
          <CourseShareActions
            courseSlug={course.slug}
            courseTitle={course.title}
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <div className="border border-[#16243d]/15 bg-white/55 p-5">
              <p className="eyebrow text-[#5d4613]">For</p>
              <p className="mt-3 text-sm leading-6">{course.audience}</p>
            </div>
            <div className="border border-[#16243d]/15 bg-white/55 p-5">
              <p className="eyebrow text-[#5d4613]">Outcomes</p>
              <p className="mt-3 text-sm leading-6">
                {course.outcomes.join(" · ")}
              </p>
            </div>
            <div className="border border-[#16243d]/15 bg-white/55 p-5">
              <p className="eyebrow text-[#5d4613]">Investment</p>
              <p className="mt-3 display text-2xl">
                KES {course.priceKes.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                4 staged payments · KES{" "}
                {course.stageAmountsKes
                  .map(amount => amount.toLocaleString())
                  .join(" / ")}
              </p>
            </div>
          </div>
          <div className="mt-8 border-l-2 border-[#c9a34e] bg-[#16243d] p-6 text-[#f7f3e8] sm:p-8">
            <p className="eyebrow text-accent-on-dark">
              Detailed lessons are protected
            </p>
            <h2 className="display mt-3 text-3xl text-[#f7f3e8]">
              {isAuthenticated
                ? "Unlock the learning workspace."
                : "Create your learner account to begin."}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#d7deea]">
              {courseAccessReason({
                isAuthenticated,
                paidStages,
              })}
            </p>
            {isAuthenticated ? (
              <FirstStageCheckout course={course} />
            ) : (
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/auth?mode=login&returnTo=${encodeURIComponent(`/courses/${course.slug}?workspace=1`)}`}
                  className="inline-flex items-center gap-2 bg-[#c9a34e] px-5 py-4 text-[10px] font-black uppercase tracking-[.15em] text-[#16243d]"
                >
                  {"Sign in to continue"} <ArrowRight size={14} />
                </Link>
                <Link
                  href={`/auth?mode=register&returnTo=${encodeURIComponent(`/courses/${course.slug}?workspace=1`)}`}
                  className="inline-flex items-center gap-2 border border-[#c9a34e]/70 px-5 py-4 text-[10px] font-black uppercase tracking-[.15em] text-[#f7f3e8]"
                >
                  {authCopy.createAccount} <ArrowRight size={14} />
                </Link>
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              {isAuthenticated && (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.15em] text-[#c1cad7] underline underline-offset-4 hover:text-[#f7f3e8]"
                >
                  {"My workspace"} <ArrowUpRight size={14} />
                </Link>
              )}
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.15em] text-[#c1cad7] underline underline-offset-4 hover:text-[#f7f3e8]"
              >
                {"Courses"} <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function CourseWorkspaceUnlocked({
  course,
  qualityControl = false,
  accessOverride = qualityControl,
}: {
  course: CourseDefinition;
  qualityControl?: boolean;
  accessOverride?: boolean;
}) {
  const locale = "en";

  const enrollmentCopy = getCourseEnrollmentCopy(locale);
  const assessmentCopy = getAssessmentCopy(locale);
  const lessonCopy = getLessonInteractiveCopy(locale);
  const illustrationCopy = getLessonIllustrationCopy(locale);
  const [progress, setProgress] = useState<SavedProgress>(() =>
    readProgress(course)
  );
  const { user, isAuthenticated } = useAuth();
  const [paymentPending, setPaymentPending] = useState(() =>
    Boolean(new URLSearchParams(window.location.search).get("reference"))
  );
  const courseState = trpc.course.state.useQuery(
    { courseSlug: course.slug },
    { enabled: isAuthenticated, refetchInterval: paymentPending ? 2000 : false }
  );
  const enrollMutation = trpc.course.enroll.useMutation({
    onError: error =>
      toast.error("Could not start enrollment", { description: error.message }),
  });
  const checkoutMutation = trpc.course.initializeStageInlinePayment.useMutation(
    {
      onError: error =>
        toast.error("Checkout could not be prepared", {
          description: "Your course access is unchanged. Please try again.",
        }),
    }
  );
  const updateIdentityMutation =
    trpc.course.updateEnrollmentIdentity.useMutation({
      onSuccess: () => {
        setIdentityOpen(false);
        toast.success("Checkout details saved");
        startCheckout();
      },
      onError: error =>
        toast.error("Could not save checkout details", {
          description: error.message,
        }),
    });
  const verifyMutation = trpc.course.verifyStagePayment.useMutation();
  const completeLessonMutation = trpc.course.completeLesson.useMutation();
  const saveLessonResponseMutation = trpc.course.saveLessonResponse.useMutation(
    {
      onSuccess: () => setResponseSaveStatus("saved"),
      onError: error => {
        setResponseSaveStatus("error");
        toast.error("Response could not be saved", {
          description: error.message,
        });
      },
    }
  );
  const illustrationBookmarksQuery = trpc.course.illustrationBookmarks.useQuery(
    { courseSlug: course.slug },
    { enabled: isAuthenticated }
  );
  const saveIllustrationBookmarkMutation =
    trpc.course.saveIllustrationBookmark.useMutation({
      onSuccess: () => {
        void illustrationBookmarksQuery.refetch();
        toast.success("Illustration saved", {
          description: "You can revisit it from your workspace bookmarks.",
        });
      },
      onError: error =>
        toast.error("Could not save illustration", {
          description: error.message,
        }),
    });
  const deleteIllustrationBookmarkMutation =
    trpc.course.deleteIllustrationBookmark.useMutation({
      onSuccess: () => {
        void illustrationBookmarksQuery.refetch();
        toast.success("Bookmark removed");
      },
      onError: error =>
        toast.error("Could not remove bookmark", {
          description: error.message,
        }),
    });
  const recordAccessDeniedMutation =
    trpc.course.recordLessonAccessDenied.useMutation();
  const submitQuizMutation = trpc.course.submitQuiz.useMutation();
  const requestCertificateMutation =
    trpc.course.requestCertificate.useMutation();
  const downloadCertificatePdfMutation =
    trpc.course.downloadCertificatePdf.useMutation({
      onError: error =>
        toast.error("Could not prepare the PDF certificate", {
          description: error.message,
        }),
    });
  const recordCertificateUsageMutation =
    trpc.course.recordCertificateUsage.useMutation();
  const [certificatePrintOpen, setCertificatePrintOpen] = useState(false);
  const [certificatePrintPageSize, setCertificatePrintPageSize] = useState<
    "a4" | "letter"
  >("a4");
  const [certificatePngDownloading, setCertificatePngDownloading] =
    useState(false);
  const [certificateShareMessage, setCertificateShareMessage] = useState("");
  const summarizeNotesMutation = trpc.dashboard.summarizeNotes.useMutation();
  const studyAidMutation = trpc.dashboard.generateStudyAid.useMutation();
  const currentEnrollment = courseState.data?.find(
    item => item.enrollment.courseSlug === course.slug
  );
  const certificateRecord = currentEnrollment?.certificates?.[0];
  const learnerReviewMap = useMemo(
    () =>
      new Map(
        (currentEnrollment?.reviews ?? []).map(review => [
          `${review.lessonId}:${review.taskId}`,
          review,
        ])
      ),
    [currentEnrollment?.reviews]
  );
  const activePositionInput = useMemo(
    () => ({ enrollmentId: currentEnrollment?.enrollment.id ?? 0 }),
    [currentEnrollment?.enrollment.id]
  );
  const activePosition = trpc.course.activePosition.useQuery(
    activePositionInput,
    { enabled: Boolean(currentEnrollment?.enrollment.id) }
  );
  const saveActivePositionMutation =
    trpc.course.saveActivePosition.useMutation();
  const markFeedbackNotificationReadMutation =
    trpc.course.markFeedbackNotificationRead.useMutation({
      onSuccess: () => void courseState.refetch(),
    });
  const [moduleIndex, setModuleIndex] = useState(0);
  const [courseNavOpen, setCourseNavOpen] = useState(true);
  const [expandedModuleIndex, setExpandedModuleIndex] = useState(0);
  const [lessonTransitioning, setLessonTransitioning] = useState(false);
  const lessonTransitionTimer = useRef<number | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizOrder, setQuizOrder] = useState<CourseQuizQuestion[]>([]);
  const [quizAttemptNumber, setQuizAttemptNumber] = useState(0);
  const [quizResult, setQuizResult] = useState<{
    score: number;
    correct: number;
    answers: Record<string, number>;
  } | null>(null);
  const autoCertificateRequested = useRef(false);
  const serverPositionApplied = useRef(false);
  const serverProgressHydrated = useRef<number | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [simulationChoice, setSimulationChoice] = useState<number | null>(null);
  const [experientialChoice, setExperientialChoice] = useState<number | null>(
    null
  );
  const [reflection, setReflection] = useState("");
  const [experientialReflection, setExperientialReflection] = useState("");
  const [responseSaveStatus, setResponseSaveStatus] =
    useState<LessonResponseSaveStatus>("idle");
  const responseSaveTimers = useRef<Record<string, number>>({});
  const [lessonStage, setLessonStage] = useState(0);
  const [timerNow, setTimerNow] = useState(() => Date.now());
  const [studyAid, setStudyAid] = useState<{
    mode: "quiz" | "flashcards";
    content: string;
  } | null>(null);
  const [zoomedIllustration, setZoomedIllustration] = useState<{
    label: string;
    text: string;
    visualUrl: string;
    visualAlt?: string;
  } | null>(null);
  const [identityOpen, setIdentityOpen] = useState(false);
  const [identityConsent, setIdentityConsent] = useState(false);
  const [identityName, setIdentityName] = useState(user?.name ?? "");
  const [identityEmail, setIdentityEmail] = useState(user?.email ?? "");
  const [paymentRequiredStage, setPaymentRequiredStage] = useState<
    number | null
  >(null);
  const [inlineModalOpen, setInlineModalOpen] = useState(false);
  const [inlineProduct, setInlineProduct] =
    useState<PaystackInlineProduct | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = JSON.parse(
        window.localStorage.getItem(`piq-course-bookmarks-${course.slug}`) ||
          "[]"
      );
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });
  const serverBookmarkKeys = useMemo(
    () =>
      new Set(
        (illustrationBookmarksQuery.data ?? []).map(
          bookmark => `${bookmark.lessonId}:${bookmark.illustrationMode}`
        )
      ),
    [illustrationBookmarksQuery.data]
  );
  const [lessonNotes, setLessonNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = JSON.parse(
        window.localStorage.getItem(`piq-course-notes-${course.slug}`) || "{}"
      );
      return saved && typeof saved === "object" ? saved : {};
    } catch {
      return {};
    }
  });
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, number>
  >({});
  const currentModule = course.modules[moduleIndex];
  const illustrationBookmarkKey = (lessonId: string, mode: string) =>
    `${lessonId}:${mode}`;
  const moduleBadges = useMemo(
    () =>
      buildCourseModuleBadges({
        modules: course.modules,
        completedLessonIds: progress.lessons,
        passedQuizModuleIds: Object.entries(progress.quizScores)
          .filter(([, score]) => score >= COURSE_PASS_MARK)
          .map(([moduleId]) => moduleId),
      }),
    [course.modules, progress.lessons, progress.quizScores]
  );
  const activeLesson =
    currentModule.lessons.find(lesson => lesson.id === activeLessonId) ?? null;
  const lessonSecondsRemaining = (lessonId: string) => {
    if (progress.lessons.includes(lessonId)) return 0;
    const startedAt = progress.lessonTimers[lessonId]?.startedAt;
    return startedAt
      ? Math.max(0, 1500 - Math.floor((timerNow - startedAt) / 1000))
      : 1500;
  };
  const activeLessonSecondsRemaining = activeLesson
    ? lessonSecondsRemaining(activeLesson.id)
    : 0;
  const activeLessonTimerComplete = Boolean(
    activeLesson && activeLessonSecondsRemaining <= 0
  );
  const activeLessonIndex = activeLesson
    ? currentModule.lessons.findIndex(lesson => lesson.id === activeLesson.id)
    : -1;
  const nextLesson =
    activeLessonIndex >= 0
      ? (currentModule.lessons[activeLessonIndex + 1] ?? null)
      : null;
  const continueToNextLesson = () => {
    if (!activeLessonTimerComplete && !accessOverride) {
      toast.info("Keep studying before continuing", {
        description: `The next lesson unlocks when the 25-minute timer reaches zero. ${formatCountdown(activeLessonSecondsRemaining)} remaining.`,
      });
      return;
    }
    if (activeLesson && !progress.lessons.includes(activeLesson.id))
      toggleLesson(activeLesson.id);
    if (nextLesson) openLesson(nextLesson.id);
    else setActiveLessonId(null);
  };
  const formatCountdown = (seconds: number) =>
    `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const completedLessons = progress.lessons.length;
  const passedQuizzes = Object.values(progress.quizScores).filter(
    score => score >= COURSE_PASS_MARK
  ).length;
  const courseProgress = Math.round(
    (completedLessons / (course.modules.length * 7)) * 70 +
      (passedQuizzes / course.modules.length) * 30
  );
  const isModuleReady = currentModule.lessons.every(lesson =>
    progress.lessons.includes(lesson.id)
  );
  const isCourseComplete =
    qualityControl ||
    (passedQuizzes === course.modules.length &&
      completedLessons === course.modules.length * 7);
  const badgeCelebrated = useRef(
    new Set(
      moduleBadges
        .filter(badge => badge.status === "earned")
        .map(badge => badge.moduleId)
    )
  );
  const persist = (next: SavedProgress) => {
    setProgress(next);
    window.localStorage.setItem(storageKey(course.slug), JSON.stringify(next));
  };
  useEffect(() => {
    const enrollmentId = currentEnrollment?.enrollment.id;
    if (
      !enrollmentId ||
      serverProgressHydrated.current === enrollmentId ||
      !currentEnrollment
    )
      return;
    const responseMap = { ...progress.responses };
    for (const response of currentEnrollment.responses ?? [])
      responseMap[response.lessonId] = {
        ...(responseMap[response.lessonId] ?? {}),
        [response.taskId]: response.responseHtml,
      };
    const serverQuizScores = currentEnrollment.quizAttempts.reduce(
      (map, attempt) => {
        if (!(attempt.moduleId in map)) map[attempt.moduleId] = attempt.score;
        return map;
      },
      {} as Record<string, number>
    );
    const merged = {
      ...progress,
      lessons: Array.from(
        new Set([
          ...progress.lessons,
          ...currentEnrollment.lessons.map(lesson => lesson.lessonId),
        ])
      ),
      quizScores: { ...progress.quizScores, ...serverQuizScores },
      responses: responseMap,
    };
    serverProgressHydrated.current = enrollmentId;
    persist(merged);
  }, [currentEnrollment?.enrollment.id]);
  useEffect(() => {
    if (!activeLessonId || activeLessonTimerComplete) return;
    const interval = window.setInterval(() => setTimerNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [activeLessonId, activeLessonTimerComplete]);
  useEffect(
    () => () => {
      Object.values(responseSaveTimers.current).forEach(timer =>
        window.clearTimeout(timer)
      );
      if (lessonTransitionTimer.current !== null)
        window.clearTimeout(lessonTransitionTimer.current);
    },
    []
  );
  useEffect(() => {
    if (
      !activeLesson ||
      progress.lessons.includes(activeLesson.id) ||
      progress.lessonTimers[activeLesson.id]
    )
      return;
    persist({
      ...progress,
      lessonTimers: {
        ...progress.lessonTimers,
        [activeLesson.id]: { startedAt: Date.now() },
      },
    });
  }, [activeLesson?.id, progress.lessons, progress.lessonTimers]);
  const requestPaymentForModule = (
    stage: number,
    requestedModuleIndex = moduleIndex
  ) => {
    setPaymentRequiredStage(stage);
    recordAccessDeniedMutation.mutate({
      courseSlug: course.slug,
      moduleIndex: requestedModuleIndex,
      requiredStage: stage,
    });
  };
  const openLesson = (lessonId: string, targetModuleIndex = moduleIndex) => {
    if (quizOpen) {
      toast.info("Lesson navigation is paused", {
        description: "Finish or close the quiz before opening another lesson.",
      });
      return;
    }
    const targetModule = course.modules[targetModuleIndex];
    if (!targetModule) return;
    const targetModuleLocked = !canAccessModuleLessons({
      moduleIndex: targetModuleIndex,
      paidStages: effectiveStageCount,
    });
    if (targetModuleLocked) {
      requestPaymentForModule(
        requiredStageForModule(targetModuleIndex),
        targetModuleIndex
      );
      return;
    }
    const lessonIndex = targetModule.lessons.findIndex(
      lesson => lesson.id === lessonId
    );
    if (lessonIndex < 0) return;
    const previousLesson =
      lessonIndex > 0 ? targetModule.lessons[lessonIndex - 1] : null;
    if (previousLesson && !progress.lessons.includes(previousLesson.id)) {
      toast.info("Finish the previous lesson first", {
        description:
          "Lessons unlock in sequence after the previous 25-minute study block is complete.",
      });
      return;
    }
    if (targetModuleIndex !== moduleIndex) setModuleIndex(targetModuleIndex);
    setExpandedModuleIndex(targetModuleIndex);
    setLessonTransitioning(true);
    if (lessonTransitionTimer.current !== null)
      window.clearTimeout(lessonTransitionTimer.current);
    lessonTransitionTimer.current = window.setTimeout(() => {
      setLessonTransitioning(false);
      lessonTransitionTimer.current = null;
    }, 220);
    setActiveLessonId(lessonId);
    setSimulationChoice(null);
    setReflection("");
    setResponseSaveStatus("idle");
    setLessonStage(0);
    setTimerNow(Date.now());
  };
  useEffect(() => {
    if (!activePosition.isSuccess || serverPositionApplied.current) return;
    if (activePosition.data) {
      setModuleIndex(
        Math.min(
          course.modules.length - 1,
          Math.max(0, activePosition.data.moduleIndex)
        )
      );
      setActiveLessonId(activePosition.data.lessonId ?? null);
    }
    serverPositionApplied.current = true;
  }, [activePosition.data, activePosition.isSuccess, course.modules.length]);
  useEffect(() => {
    const enrollmentId = currentEnrollment?.enrollment.id;
    if (!enrollmentId || !serverPositionApplied.current) return;
    saveActivePositionMutation.mutate({
      enrollmentId,
      moduleIndex,
      lessonId: activeLessonId,
    });
  }, [activeLessonId, currentEnrollment?.enrollment.id, moduleIndex]);
  const openQuiz = () => {
    if (activeLessonId) setActiveLessonId(null);
    if (moduleLocked) {
      requestPaymentForModule(moduleRequiredStage);
      return;
    }
    setQuizOrder(shuffleQuizForAttempt(currentModule.quiz));
    setQuizAttemptNumber(attempt => attempt + 1);
    setQuizResult(null);
    setSelectedAnswers({});
    setQuizOpen(true);
  };
  const toggleLesson = (lessonId: string) => {
    if (quizOpen) {
      toast.info("Lesson completion is paused", {
        description: "Finish or close the quiz before changing lessons.",
      });
      return;
    }
    if (moduleLocked) {
      requestPaymentForModule(moduleRequiredStage);
      return;
    }
    const lesson = currentModule.lessons.find(item => item.id === lessonId);
    const isCompleting = !progress.lessons.includes(lessonId);
    if (
      isCompleting &&
      lesson &&
      !lesson.responseTasks.every(task =>
        (progress.responses[lessonId]?.[task.id] ?? "")
          .replace(/<[^>]*>/g, "")
          .replace(/&nbsp;/gi, " ")
          .trim()
      )
    ) {
      toast.error("Complete every lesson response first", {
        description:
          "Write and save each required response before marking this lesson complete.",
      });
      return;
    }
    if (
      isCompleting &&
      !accessOverride &&
      lessonSecondsRemaining(lessonId) > 0
    ) {
      toast.info("Lesson timer still running", {
        description: `Keep studying for ${formatCountdown(lessonSecondsRemaining(lessonId))} more.`,
      });
      return;
    }
    const lessons = isCompleting
      ? [...progress.lessons, lessonId]
      : progress.lessons.filter(id => id !== lessonId);
    persist({ ...progress, lessons });
    if (isCompleting)
      toast.success(lessonCopy.lessonComplete, {
        description: lessonCopy.lessonCompleteDescription,
      });
    if (isCompleting && currentEnrollment?.enrollment.id)
      completeLessonMutation.mutate({
        enrollmentId: currentEnrollment.enrollment.id,
        lessonId,
        requiredTaskIds: lesson?.responseTasks.map(task => task.id) ?? [],
      });
  };
  const submitQuiz = () => {
    const canonicalAnswers = Object.fromEntries(
      quizOrder.map(question => {
        const selectedIndex = selectedAnswers[question.id];
        const selectedOption =
          typeof selectedIndex === "number"
            ? question.options[selectedIndex]
            : undefined;
        const canonicalQuestion = currentModule.quiz.find(
          item => item.id === question.id
        );
        return [
          question.id,
          canonicalQuestion?.options.indexOf(selectedOption ?? "") ?? -1,
        ];
      })
    );
    const correct = currentModule.quiz.filter(
      question => canonicalAnswers[question.id] === question.correctOption
    ).length;
    const score = Math.round((correct / currentModule.quiz.length) * 100);
    persist({
      ...progress,
      quizScores: { ...progress.quizScores, [currentModule.id]: score },
    });
    if (currentEnrollment?.enrollment.id)
      submitQuizMutation.mutate({
        enrollmentId: currentEnrollment.enrollment.id,
        moduleId: currentModule.id,
        answers: canonicalAnswers,
      });
    setQuizResult({ score, correct, answers: selectedAnswers });
    toast.success(
      score >= COURSE_PASS_MARK ? "Quiz passed" : "Quiz submitted",
      {
        description:
          score >= COURSE_PASS_MARK
            ? "Review the explanations before continuing."
            : "Review the explanations and try again.",
      }
    );
  };
  const requiredStageForModule = requiredPaymentStageForModule;
  const moduleRequiredStage = requiredStageForModule(moduleIndex);
  const unreadFeedbackNotifications = (
    currentEnrollment?.notifications ?? []
  ).filter(notification => !notification.readAt);
  useEffect(() => {
    if (!unreadFeedbackNotifications.length) return;
    toast.info(
      `${unreadFeedbackNotifications.length} new instructor feedback ${unreadFeedbackNotifications.length === 1 ? "note" : "notes"}`,
      { description: "Review the feedback in your course workspace." }
    );
  }, [unreadFeedbackNotifications.length]);
  useEffect(() => {
    const newlyEarned = moduleBadges.filter(
      badge =>
        badge.status === "earned" &&
        !badgeCelebrated.current.has(badge.moduleId)
    );
    if (!newlyEarned.length) return;
    newlyEarned.forEach(badge => {
      badgeCelebrated.current.add(badge.moduleId);
      toast.success(`Module ${badge.moduleIndex + 1} badge earned`, {
        description:
          "Seven lessons and the module quiz are complete. Keep building your learning streak.",
      });
    });
  }, [moduleBadges]);
  useEffect(() => {
    const reference = new URLSearchParams(window.location.search).get(
      "reference"
    );
    if (!paymentPending || !reference || !isAuthenticated) return;
    verifyMutation.mutate(
      { reference },
      {
        onSuccess: () => {
          void courseState.refetch();
          setPaymentPending(false);
          window.history.replaceState({}, "", window.location.pathname);
        },
      }
    );
  }, [courseState, isAuthenticated, paymentPending]);
  useEffect(() => {
    if (!inlineModalOpen || !inlineProduct?.reference) return;
    let cancelled = false;
    const tick = async () => {
      if (cancelled) return;
      try {
        await new Promise<void>(resolve => {
          verifyMutation.mutate(
            { reference: inlineProduct.reference },
            {
              onSuccess: () => {
                if (!cancelled) {
                  void courseState.refetch();
                  setInlineModalOpen(false);
                  setInlineProduct(null);
                  toast.success("Payment verified", {
                    description: "Your course access is updated.",
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
  }, [inlineModalOpen, inlineProduct?.reference, verifyMutation, courseState]);
  const startCheckout = (requestedStage?: number) => {
    if (!isAuthenticated) {
      window.location.href =
        "/auth?returnTo=" +
        encodeURIComponent(window.location.pathname + window.location.search);
      return;
    }
    if (!currentEnrollment?.enrollment.id) {
      setIdentityName(user?.name ?? "");
      setIdentityEmail(user?.email ?? "");
      setIdentityConsent(false);
      setIdentityOpen(true);
      return;
    }
    const stage =
      requestedStage ??
      currentEnrollment.stages.find(item => item.paymentStatus !== "paid")
        ?.stage ??
      1;
    checkoutMutation.mutate(
      { enrollmentId: currentEnrollment.enrollment.id, stage },
      {
        onSuccess: result => {
          if ("paid" in result && result.paid) {
            void courseState.refetch();
            toast.success("Payment verified", {
              description: "Your course access is updated.",
            });
            return;
          }
          setInlineProduct({
            accessCode: result.accessCode,
            reference: result.reference,
            amountKes: result.amountKes,
            productName: result.productName,
            productType: result.productType as "course_stage",
            enrollmentId: result.enrollmentId,
            courseSlug: result.courseSlug,
            stage: result.stage,
          });
          setInlineModalOpen(true);
        },
      }
    );
  };
  const stageLabels = [
    "Enrollment / Module 1",
    "Module 4 access",
    "Module 7 access",
    "Certificate request",
  ];
  const lessonsUnlockedAfterStage = [21, 42, 70, 70];
  const serverStageCount =
    currentEnrollment?.stages.filter(stage => stage.paymentStatus === "paid")
      .length ?? 0;
  // Payment authorization is server-backed; local progress can never unlock a staged module.
  const effectiveStageCount = accessOverride ? 4 : serverStageCount;
  const moduleLocked = !canAccessModuleLessons({
    moduleIndex,
    paidStages: effectiveStageCount,
  });
  const selectModule = (nextIndex: number) => {
    const requiredStage = requiredStageForModule(nextIndex);
    const locked = !canAccessModuleLessons({
      moduleIndex: nextIndex,
      paidStages: effectiveStageCount,
    });
    if (locked) {
      requestPaymentForModule(requiredStage, nextIndex);
      return;
    }
    setModuleIndex(nextIndex);
    setExpandedModuleIndex(nextIndex);
    setActiveLessonId(null);
    setLessonTransitioning(false);
  };
  const toggleModule = (nextIndex: number) => {
    if (
      !canAccessModuleLessons({
        moduleIndex: nextIndex,
        paidStages: effectiveStageCount,
      })
    ) {
      selectModule(nextIndex);
      return;
    }
    if (moduleIndex !== nextIndex) selectModule(nextIndex);
    else
      setExpandedModuleIndex(current =>
        current === nextIndex ? -1 : nextIndex
      );
    setActiveLessonId(null);
  };
  useEffect(() => {
    if (moduleLocked && activeLessonId) setActiveLessonId(null);
  }, [moduleLocked, activeLessonId]);
  useEffect(() => {
    setExpandedModuleIndex(moduleIndex);
  }, [moduleIndex]);
  const stageAmounts = useMemo(
    () =>
      stageLabels.map((label, index) => ({
        label,
        amount: course.stageAmountsKes[index] ?? course.stageAmountsKes[0] ?? 0,
        complete: effectiveStageCount > index,
      })),
    [course.stageAmountsKes, effectiveStageCount]
  );
  const toggleBookmark = (key: string) => {
    const next = bookmarks.includes(key)
      ? bookmarks.filter(item => item !== key)
      : [...bookmarks, key];
    setBookmarks(next);
    window.localStorage.setItem(
      `piq-course-bookmarks-${course.slug}`,
      JSON.stringify(next)
    );
  };
  const toggleIllustrationBookmark = (
    mode: "explanatory" | "applicational" | "experiential",
    label: string,
    title: string,
    content: string
  ) => {
    if (!activeLesson || !isAuthenticated) {
      toast.info("Sign in to save lesson illustrations");
      return;
    }
    const key = illustrationBookmarkKey(activeLesson.id, mode);
    const isSaved = serverBookmarkKeys.has(key) || bookmarks.includes(key);
    setBookmarks(current =>
      isSaved ? current.filter(item => item !== key) : [...current, key]
    );
    if (isSaved)
      deleteIllustrationBookmarkMutation.mutate({
        courseSlug: course.slug,
        lessonId: activeLesson.id,
        illustrationMode: mode,
      });
    else
      saveIllustrationBookmarkMutation.mutate({
        courseSlug: course.slug,
        lessonId: activeLesson.id,
        illustrationMode: mode,
        label,
        title,
        content,
      });
  };
  const updateLessonNote = (value: string) => {
    const next = { ...lessonNotes, [activeLessonId ?? ""]: value };
    setLessonNotes(next);
    window.localStorage.setItem(
      `piq-course-notes-${course.slug}`,
      JSON.stringify(next)
    );
  };
  const responseFor = (taskId: string) =>
    progress.responses[activeLessonId ?? ""]?.[taskId] ?? "";
  useEffect(() => {
    if (!activeLessonId) return;
    const savedChoice = responseFor("experience-choice");
    const savedReflection = responseFor("experience-reflection");
    setExperientialChoice(savedChoice === "" ? null : Number(savedChoice));
    setExperientialReflection(savedReflection);
  }, [activeLessonId, progress.responses]);
  const updateLessonResponse = (taskId: string, responseHtml: string) => {
    const lessonId = activeLessonId ?? "";
    const nextResponses = {
      ...progress.responses,
      [lessonId]: {
        ...(progress.responses[lessonId] ?? {}),
        [taskId]: responseHtml,
      },
    };
    persist({ ...progress, responses: nextResponses });
    if (!lessonId) return;
    setResponseSaveStatus("saving");
    const timerKey = `${lessonId}:${taskId}`;
    const existingTimer = responseSaveTimers.current[timerKey];
    if (existingTimer) window.clearTimeout(existingTimer);
    responseSaveTimers.current[timerKey] = window.setTimeout(() => {
      delete responseSaveTimers.current[timerKey];
      if (!currentEnrollment?.enrollment.id) {
        setResponseSaveStatus("saved");
        return;
      }
      saveLessonResponseMutation.mutate({
        enrollmentId: currentEnrollment.enrollment.id,
        lessonId,
        taskId,
        responseHtml,
      });
    }, 700);
  };
  const lessonResponsesComplete = Boolean(
    activeLesson &&
      activeLesson.responseTasks.length > 0 &&
      activeLesson.responseTasks.every(
        task =>
          responseFor(task.id)
            .replace(/<[^>]*>/g, "")
            .replace(/&nbsp;/gi, " ")
            .trim().length > 0
      )
  );
  const summarizeNotes = async () => {
    const raw = (lessonNotes[activeLessonId ?? ""] ?? "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!raw) {
      toast.error("Add a few notes first", {
        description: "The summary tool needs some lesson notes to work from.",
      });
      return;
    }
    try {
      const result = await summarizeNotesMutation.mutateAsync({ notes: raw });
      toast.success("Notes summarized");
      window.localStorage.setItem(
        `piq-course-summary-${course.slug}-${activeLessonId}`,
        result.summary
      );
    } catch (error) {
      toast.error("Could not summarize notes", {
        description:
          error instanceof Error ? error.message : "Please try again shortly.",
      });
    }
  };
  const generateStudyAid = async (mode: "quiz" | "flashcards") => {
    const raw = (lessonNotes[activeLessonId ?? ""] ?? "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!raw) {
      toast.error("Add a few notes first");
      return;
    }
    try {
      const result = await studyAidMutation.mutateAsync({ notes: raw, mode });
      toast.success(
        mode === "quiz" ? "Practice quiz ready" : "Flashcards ready"
      );
      setStudyAid(result);
      window.localStorage.setItem(
        `piq-course-study-aid-${course.slug}-${activeLessonId}`,
        JSON.stringify(result)
      );
    } catch (error) {
      toast.error("Could not create study aid", {
        description:
          error instanceof Error ? error.message : "Please try again shortly.",
      });
    }
  };
  const exportLessonNotes = () => {
    if (!activeLesson) return;
    const content = `Profound IQ Consulting\n${course.title} · ${activeLesson.title}\n\n${(lessonNotes[activeLesson.id] || "No notes recorded.").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ")}\n\nReflection\n${reflection || "No reflection recorded."}`;
    const url = URL.createObjectURL(
      new Blob([content], { type: "text/plain;charset=utf-8" })
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${activeLesson.id}-notes.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const requestCertificate = () => {
    if (!currentEnrollment?.enrollment.id) return;
    requestCertificateMutation.mutate(
      { enrollmentId: currentEnrollment.enrollment.id },
      {
        onSuccess: result => {
          toast.success("Certificate ready", {
            description:
              "Your completion certificate was added to your dashboard and sent by email.",
            action: result.certificateSvg
              ? {
                  label: "Download PNG",
                  onClick: () => {
                    void downloadCertificatePng(
                      result.certificateSvg,
                      `${course.slug}-certificate.png`,
                      2
                    )
                      .then(() => {
                        if (currentEnrollment?.enrollment.id)
                          void recordCertificateUsageMutation.mutateAsync({
                            enrollmentId: currentEnrollment.enrollment.id,
                            eventType: "download",
                            platform: CERTIFICATE_DOWNLOAD_PLATFORMS.png,
                          });
                        toast.success("PNG certificate downloaded");
                      })
                      .catch(() =>
                        toast.error("Could not create the PNG certificate")
                      );
                  },
                }
              : undefined,
          });
          if (result.fileUrl) setCertificatePrintOpen(true);
        },
      }
    );
  };
  const shareCompletion = async () => {
    const url =
      currentEnrollment?.certificates?.[0]?.fileUrl ||
      `${PUBLISHED_SITE_ORIGIN}/verify/certificate`;
    const text = `I completed ${course.title} with Profound IQ Consulting.`;
    try {
      if (navigator.share)
        await navigator.share({
          title: `${course.title} completion`,
          text,
          url,
        });
      else {
        const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        window.open(shareUrl, "_blank", "noopener,noreferrer");
      }
      if (currentEnrollment?.enrollment.id)
        void recordCertificateUsageMutation.mutateAsync({
          enrollmentId: currentEnrollment.enrollment.id,
          eventType: "share",
          platform: "share",
        });
    } catch (error) {
      if ((error as DOMException).name !== "AbortError")
        toast.error("Could not share completion");
    }
  };
  const canonicalCertificate =
    getCanonicalCertificateArtifact(certificateRecord);
  const downloadPdfCertificate = () => {
    if (!currentEnrollment?.enrollment.id) return;
    downloadCertificatePdfMutation.mutate(
      { enrollmentId: currentEnrollment.enrollment.id },
      {
        onSuccess: result => {
          downloadCertificatePdf(result.data, result.filename);
          void recordCertificateUsageMutation.mutateAsync({
            enrollmentId: currentEnrollment.enrollment.id,
            eventType: "download",
            platform: CERTIFICATE_DOWNLOAD_PLATFORMS.pdf,
          });
          toast.success("PDF certificate downloaded", {
            description: "Your branded certificate is ready to save or share.",
          });
        },
      }
    );
  };
  const downloadPngCertificate = async () => {
    if (!certificateRecord?.fileUrl || !currentEnrollment?.enrollment.id)
      return;
    setCertificatePngDownloading(true);
    try {
      const response = await fetch(certificateRecord.fileUrl);
      if (!response.ok)
        throw new Error("Certificate artwork could not be loaded");
      const svg = await response.text();
      await downloadCertificatePng(svg, `${course.slug}-certificate.png`, 2);
      void recordCertificateUsageMutation.mutateAsync({
        enrollmentId: currentEnrollment.enrollment.id,
        eventType: "download",
        platform: CERTIFICATE_DOWNLOAD_PLATFORMS.png,
      });
      toast.success("PNG certificate downloaded");
    } catch (error) {
      toast.error("Could not create the PNG certificate", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setCertificatePngDownloading(false);
    }
  };
  const copyCertificateLink = async () => {
    const url = canonicalCertificate?.fileUrl;
    if (!url) {
      toast.error("Certificate link is unavailable", {
        description: "Generate your certificate before copying its link.",
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Certificate link copied");
    } catch {
      toast.error("Could not copy the certificate link");
    }
  };
  const printCertificate = () => {
    if (!certificateRecord?.fileUrl) return;
    const popup = window.open("", "_blank", "noopener,noreferrer");
    if (!popup) {
      toast.error("Allow pop-ups to print your certificate");
      return;
    }
    popup.document.write(
      `<html><head><title>${course.title} certificate</title><style>@page{size:${certificatePrintPageSize === "letter" ? "Letter" : "A4"} landscape;margin:0}html,body{margin:0;background:#fff}img{display:block;width:100vw;height:100vh;object-fit:contain;print-color-adjust:exact;-webkit-print-color-adjust:exact}</style></head><body><img alt="${course.title} certificate" src="${certificateRecord.fileUrl}" /></body></html>`
    );
    popup.document.close();
    popup.focus();
    popup.print();
  };
  const shareCertificate = async (platform: CertificateSharePlatform) => {
    const url = canonicalCertificate?.fileUrl;
    if (!hasIssuedCertificate(url) || !certificateRecord) {
      toast.error("Certificate sharing is unavailable", {
        description:
          "Complete the certificate request first so the verified certificate is ready.",
      });
      return;
    }
    const postText =
      certificateShareMessage.trim() ||
      buildCertificateLinkedInPost(course.title, url);
    const shareUrl = buildCertificateShareUrl(
      platform,
      url,
      course.title,
      postText
    );
    try {
      const pngResponse = await fetch(url);
      const svg = await pngResponse.text();
      const png = await certificatePngBlob(svg, 2);
      const file = new File([png], `${course.slug}-certificate.png`, {
        type: "image/png",
      });
      if (
        typeof navigator.share === "function" &&
        (!navigator.canShare || navigator.canShare({ files: [file] }))
      ) {
        await navigator.share({
          title: `${course.title} certificate`,
          text: postText,
          url,
          files: [file],
        });
      } else {
        await downloadCertificatePng(svg, `${course.slug}-certificate.png`, 2);
        if (platform === "linkedin")
          await navigator.clipboard?.writeText(postText);
        window.open(shareUrl, "_blank", "noopener,noreferrer");
      }
      if (currentEnrollment?.enrollment.id)
        void recordCertificateUsageMutation.mutateAsync({
          enrollmentId: currentEnrollment.enrollment.id,
          eventType: "share",
          platform,
        });
      toast.success(
        platform === "linkedin"
          ? "LinkedIn post draft copied"
          : `${platform === "twitter" ? "X/Twitter" : platform} share opened`,
        {
          description:
            platform === "linkedin"
              ? "Paste the copied draft into the LinkedIn composer."
              : "Your verified certificate link is ready to share.",
        }
      );
    } catch (error) {
      if ((error as DOMException)?.name !== "AbortError")
        toast.error(`Could not open ${platform} sharing`);
    }
  };
  useEffect(() => {
    if (
      isCourseComplete &&
      effectiveStageCount >= 4 &&
      currentEnrollment?.enrollment.id &&
      !autoCertificateRequested.current &&
      !currentEnrollment.certificates?.length
    ) {
      autoCertificateRequested.current = true;
      requestCertificate();
    }
  }, [currentEnrollment, effectiveStageCount, isCourseComplete]);

  return (
    <div className="min-h-screen bg-[#f7f3e8] text-[#16243d]">
      <TransformationNav active="assessment" />
      <main className="container py-10 sm:py-16">
        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)_300px] lg:gap-8">
          <CourseMapSidebar
            course={course}
            progress={progress}
            moduleIndex={moduleIndex}
            expandedModuleIndex={expandedModuleIndex}
            courseNavOpen={courseNavOpen}
            effectiveStageCount={effectiveStageCount}
            accessOverride={accessOverride}
            activeLessonId={activeLessonId}
            onToggleCourseNav={() => setCourseNavOpen(open => !open)}
            onToggleModule={toggleModule}
            onSelectLesson={openLesson}
          />
          <section>
            <Link
              href="/#courses"
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.14em] text-[#5d4613]"
            >
              <ArrowLeft size={14} /> {"Courses"}
            </Link>
            <p className="eyebrow mt-10 text-[#5d4613]">
              {"My workspace"} · {course.duration}
            </p>
            <h1 className="display mt-4 max-w-3xl text-5xl leading-[.95] tracking-[-.045em] sm:text-7xl">
              {course.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#16243d]">
              {course.description}
            </p>
            {qualityControl && (
              <div
                role="status"
                className="mt-5 border-l-2 border-[#c9a34e] bg-[#fff5cf] px-4 py-3 text-sm text-[#5d4613]"
              >
                <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#5d4613]">
                  Quality Control Mode
                </p>
                <p className="mt-1 leading-6">
                  Payments and 25-minute lesson timers are bypassed. Quiz
                  submissions are recorded at 100% so the complete course and
                  certificate flow can be reviewed.
                </p>
              </div>
            )}
            {qualityControl && <AdminCourseQAChecklist course={course} />}
            <CourseShareActions
              courseSlug={course.slug}
              courseTitle={course.title}
            />
            <section
              aria-labelledby="course-progress-title"
              className="mt-8 border-l-2 border-[#c9a34e] bg-white/60 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[.14em] text-[#5d4613]">
                    Course progress
                  </p>
                  <h2
                    id="course-progress-title"
                    className="display mt-1 text-xl"
                  >
                    Your learning signal
                  </h2>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[.12em] text-muted-foreground">
                  Lessons + quizzes
                </span>
              </div>
              <div className="mt-3 flex items-end justify-between gap-4">
                <p className="display text-4xl">{courseProgress}%</p>
                <p className="text-right text-xs leading-5 text-muted-foreground">
                  {completedLessons} of 70 lessons
                  <br />
                  {passedQuizzes} of 10 quizzes passed
                </p>
              </div>
              <div
                role="progressbar"
                aria-label="Overall course progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={courseProgress}
                className="mt-3 h-2 overflow-hidden bg-[#16243d]/10"
              >
                <div
                  className="h-full bg-[#c9a34e] transition-[width] duration-500"
                  style={{ width: `${courseProgress}%` }}
                />
              </div>
              <p className="mt-2 text-[10px] font-black uppercase tracking-[.12em] text-muted-foreground">
                {courseProgress}% complete · progress saves automatically
              </p>
            </section>
            {unreadFeedbackNotifications.length > 0 && (
              <section className="mt-6 border-l-2 border-[#2f6f78] bg-[#edf4ee] p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#2f6f78]">
                      New instructor feedback
                    </p>
                    <h2 className="display mt-2 text-2xl text-[#244b4a]">
                      Your learning has a response.
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[#315c4b]">
                      A reviewer has added guidance to one or more of your saved
                      lesson responses.
                    </p>
                  </div>
                  <span className="grid h-10 min-w-10 place-items-center rounded-full bg-[#2f6f78] px-3 text-sm font-black text-white">
                    {unreadFeedbackNotifications.length}
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {unreadFeedbackNotifications.slice(0, 3).map(notification => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => {
                        markFeedbackNotificationReadMutation.mutate({
                          notificationId: notification.id,
                        });
                        openLesson(notification.lessonId);
                      }}
                      className="block w-full border border-[#2f6f78]/25 bg-white/70 p-3 text-left transition hover:border-[#2f6f78]"
                    >
                      <p className="text-xs font-bold text-[#244b4a]">
                        {notification.title}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[#315c4b]">
                        {notification.body}
                      </p>
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        Open lesson response ·{" "}
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
              </section>
            )}
            {unreadFeedbackNotifications.length > 3 && (
              <p className="mt-3 text-xs text-muted-foreground">
                {unreadFeedbackNotifications.length - 3} more feedback notes are
                available across your lessons.
              </p>
            )}
            <section className="mt-10 border border-[#c9a34e]/45 bg-[#fffaf0] p-5 sm:p-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="eyebrow text-[#5d4613]">
                    Your module milestones
                  </p>
                  <h2 className="display mt-2 text-2xl">
                    Earn a badge for each complete module.
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground">
                  Finish 7 lessons and pass the 15-question quiz.
                </p>
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {moduleBadges.map(badge => (
                  <ModuleCompletionBadge
                    key={badge.moduleId}
                    badge={badge}
                    compact
                    onSelect={() => {
                      const requiredStage = requiredStageForModule(
                        badge.moduleIndex
                      );
                      if (
                        !accessOverride &&
                        effectiveStageCount < requiredStage
                      ) {
                        requestPaymentForModule(requiredStage);
                        return;
                      }
                      selectModule(badge.moduleIndex);
                    }}
                  />
                ))}
              </div>
            </section>
            <div className="mt-10 border border-[#16243d]/15 bg-white/55 p-5 sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#16243d]/15 pb-5">
                <div>
                  <p className="eyebrow text-[#5d4613]">
                    Module {moduleIndex + 1} of {course.modules.length}
                  </p>
                  <h2 className="display mt-2 text-3xl">
                    {currentModule.title}
                  </h2>
                </div>
                <span className="text-xs text-muted-foreground">
                  {currentModule.promise}
                </span>
              </div>
              <div className="mt-6 space-y-3">
                {currentModule.lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openLesson(lesson.id)}
                    onKeyDown={event => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openLesson(lesson.id);
                      }
                    }}
                    aria-disabled={quizOpen}
                    className={`cursor-pointer border p-4 transition hover:border-[#c9a34e] hover:shadow-md ${quizOpen ? "cursor-not-allowed opacity-60" : ""} ${progress.lessons.includes(lesson.id) ? "border-[#c9a34e] bg-[#fffaf0]" : "border-[#16243d]/10 bg-[#f7f3e8]"}`}
                  >
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={progress.lessons.includes(lesson.id)}
                        onChange={() => toggleLesson(lesson.id)}
                        disabled={
                          !progress.lessons.includes(lesson.id) &&
                          !accessOverride &&
                          lessonSecondsRemaining(lesson.id) > 0
                        }
                        aria-label={`${lesson.title} ${progress.lessons.includes(lesson.id) ? "completed" : "completion"}`}
                        className="mt-1 accent-[#a27e2e] disabled:cursor-not-allowed disabled:opacity-40"
                      />
                      <span>
                        <span className="block text-[10px] font-black uppercase tracking-[.12em] text-[#5d4613]">
                          Lesson {index + 1}
                        </span>
                        <span className="mt-1 block text-sm font-bold">
                          {lesson.title}
                        </span>
                        {!moduleLocked && (
                          <span className="mt-2 block text-xs leading-5 text-muted-foreground">
                            {lesson.summary} {lesson.outcome}
                          </span>
                        )}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
              {isModuleReady && !moduleLocked && (
                <div className="mt-6 border-l-2 border-[#c9a34e] bg-[#16243d] p-5 text-[#f7f3e8]">
                  <div className="flex items-start gap-3">
                    <Sparkles
                      size={18}
                      className="mt-0.5 text-accent-on-dark"
                    />
                    <div>
                      <p className="font-bold">{lessonCopy.quizReady}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-on-dark">
                        {lessonCopy.quizReadyDescription} {COURSE_PASS_MARK}%
                        pass mark; unlimited retries are available.
                      </p>
                      <Button
                        type="button"
                        onClick={openQuiz}
                        className="mt-4 bg-[#c9a34e] text-[#16243d]"
                      >
                        {progress.quizScores[currentModule.id] !== undefined
                          ? "Retake quiz"
                          : "Start quiz"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              {progress.quizScores[currentModule.id] !== undefined && (
                <p
                  className={`mt-4 text-sm font-bold ${progress.quizScores[currentModule.id] >= COURSE_PASS_MARK ? "text-emerald-800" : "text-red-800"}`}
                >
                  Latest quiz result: {progress.quizScores[currentModule.id]}% ·{" "}
                  {progress.quizScores[currentModule.id] >= COURSE_PASS_MARK
                    ? "Passed"
                    : "Retry available"}
                </p>
              )}
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => selectModule(Math.max(0, moduleIndex - 1))}
                disabled={moduleIndex === 0 || quizOpen}
              >
                <ArrowLeft size={15} /> {assessmentCopy.previousModule}
              </Button>
              <span className="text-xs text-muted-foreground">
                Progress saves automatically on this device.
              </span>
              <Button
                type="button"
                onClick={() =>
                  selectModule(
                    Math.min(course.modules.length - 1, moduleIndex + 1)
                  )
                }
                disabled={
                  !isModuleReady ||
                  progress.quizScores[currentModule.id] < COURSE_PASS_MARK ||
                  moduleIndex === course.modules.length - 1 ||
                  quizOpen
                }
                className="bg-[#16243d] text-[#f7f3e8]"
              >
                {assessmentCopy.nextModule} <ArrowRight size={15} />
              </Button>
            </div>
          </section>
          <aside className="space-y-5">
            <div className="border border-[#16243d]/15 bg-[#16243d] p-5 text-[#f7f3e8]">
              <p className="eyebrow text-accent-on-dark">
                {enrollmentCopy.payment}
              </p>
              <p className="display mt-3 text-3xl text-[#f7f3e8]">
                KES {course.priceKes.toLocaleString()}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#d7deea]">
                Four staged payments of KES{" "}
                {course.stageAmountsKes
                  .map(amount => amount.toLocaleString())
                  .join(" / ")}{" "}
                keep access aligned to your learning journey.
              </p>
              <div className="mt-5 space-y-3">
                {stageAmounts.map((stage, index) => (
                  <div
                    key={stage.label}
                    className="flex items-center gap-3 text-xs"
                  >
                    <span
                      className={`grid h-6 w-6 place-items-center rounded-full border ${stage.complete ? "border-[#c9a34e] bg-[#c9a34e] text-[#16243d]" : "border-[#c1cad7]/60 text-[#c1cad7]"}`}
                    >
                      {stage.complete ? <CheckCircle2 size={14} /> : index + 1}
                    </span>
                    <span className="flex-1 text-[#d7deea]">{stage.label}</span>
                    <span className="font-bold text-accent-on-dark">
                      {stage.complete
                        ? accessOverride
                          ? "Bypassed"
                          : "Paid"
                        : "25%"}
                    </span>
                  </div>
                ))}
              </div>
              {accessOverride ? (
                <div className="mt-6 border border-[#c9a34e]/60 bg-[#fff5cf] p-3 text-xs leading-5 text-[#5d4613]">
                  <strong>Payment bypass active.</strong> This workspace is open
                  for quality review without checkout.
                </div>
              ) : (
                <Button
                  type="button"
                  onClick={() => startCheckout()}
                  disabled={
                    enrollMutation.isPending || checkoutMutation.isPending
                  }
                  className="mt-6 w-full bg-[#c9a34e] text-[#16243d]"
                >
                  {checkoutMutation.isPending || enrollMutation.isPending
                    ? "Preparing secure checkout…"
                    : `Pay KES ${(course.stageAmountsKes[Math.min(3, progress.stageCount)] ?? course.stageAmountsKes[0] ?? 0).toLocaleString()} · stage ${Math.min(4, progress.stageCount + 1)} of 4`}
                </Button>
              )}
              <p className="mt-3 text-[10px] leading-4 text-[#c1cad7]">
                Payment verification and stage unlocking are handled securely
                before access is granted.
              </p>
            </div>
            <div className="border-l-2 border-[#c9a34e] bg-white/60 p-5">
              <p className="eyebrow text-[#5d4613]">
                {enrollmentCopy.certificate}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                After all modules and quizzes are passed, request your branded
                certificate. Quality Control Mode can generate a review
                certificate without payment or completion blockers. It will be
                emailed and remain available in your dashboard.
              </p>
              <Button
                type="button"
                onClick={requestCertificate}
                disabled={
                  !currentEnrollment ||
                  requestCertificateMutation.isPending ||
                  (!qualityControl && !isCourseComplete)
                }
                className="mt-4 w-full bg-[#16243d] text-[#f7f3e8]"
              >
                <LockKeyhole size={15} />{" "}
                {requestCertificateMutation.isPending
                  ? "Preparing certificate…"
                  : qualityControl
                    ? "Generate QC certificate"
                    : "Request certificate"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={shareCompletion}
                disabled={!isCourseComplete}
                className="mt-3 w-full"
              >
                Share completion
              </Button>
              <label className="mt-3 block text-[10px] font-black uppercase tracking-[.12em] text-muted-foreground">
                Share message
                <textarea
                  value={certificateShareMessage}
                  onChange={event =>
                    setCertificateShareMessage(event.target.value)
                  }
                  placeholder={buildCertificateLinkedInPost(
                    course.title,
                    canonicalCertificate?.fileUrl ?? ""
                  )}
                  maxLength={500}
                  rows={3}
                  className="mt-2 block w-full border border-[#16243d]/20 bg-white p-2 text-sm font-normal normal-case tracking-normal"
                />
              </label>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <a
                  href={buildCertificateShareUrl(
                    "linkedin",
                    canonicalCertificate?.fileUrl ?? "",
                    course.title,
                    certificateShareMessage.trim() ||
                      buildCertificateLinkedInPost(
                        course.title,
                        canonicalCertificate?.fileUrl ?? ""
                      )
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => void shareCertificate("linkedin")}
                  aria-disabled={!canonicalCertificate}
                  className={`inline-flex items-center justify-center gap-2 border border-[#16243d]/25 bg-white px-4 py-3 text-[10px] font-black uppercase tracking-[.12em] text-[#16243d] transition hover:border-[#16243d]/60 hover:bg-[#16243d]/5 disabled:opacity-50 ${
                    !canonicalCertificate
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }`}
                >
                  <Share2 size={15} /> LinkedIn
                </a>
                <a
                  href={buildCertificateShareUrl(
                    "facebook",
                    canonicalCertificate?.fileUrl ?? "",
                    course.title,
                    certificateShareMessage.trim() ||
                      buildCertificateLinkedInPost(
                        course.title,
                        canonicalCertificate?.fileUrl ?? ""
                      )
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => void shareCertificate("facebook")}
                  aria-disabled={!canonicalCertificate}
                  className={`inline-flex items-center justify-center gap-2 border border-[#16243d]/25 bg-white px-4 py-3 text-[10px] font-black uppercase tracking-[.12em] text-[#16243d] transition hover:border-[#16243d]/60 hover:bg-[#16243d]/5 disabled:opacity-50 ${
                    !canonicalCertificate
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }`}
                >
                  Facebook
                </a>
                <a
                  href={buildCertificateShareUrl(
                    "whatsapp",
                    canonicalCertificate?.fileUrl ?? "",
                    course.title,
                    certificateShareMessage.trim() ||
                      buildCertificateLinkedInPost(
                        course.title,
                        canonicalCertificate?.fileUrl ?? ""
                      )
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => void shareCertificate("whatsapp")}
                  aria-disabled={!canonicalCertificate}
                  className={`inline-flex items-center justify-center gap-2 border border-[#16243d]/25 bg-white px-4 py-3 text-[10px] font-black uppercase tracking-[.12em] text-[#16243d] transition hover:border-[#16243d]/60 hover:bg-[#16243d]/5 disabled:opacity-50 ${
                    !canonicalCertificate
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }`}
                >
                  WhatsApp
                </a>
                <a
                  href={buildCertificateShareUrl(
                    "twitter",
                    canonicalCertificate?.fileUrl ?? "",
                    course.title,
                    certificateShareMessage.trim() ||
                      buildCertificateLinkedInPost(
                        course.title,
                        canonicalCertificate?.fileUrl ?? ""
                      )
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => void shareCertificate("twitter")}
                  aria-disabled={!canonicalCertificate}
                  className={`inline-flex items-center justify-center gap-2 border border-[#16243d]/25 bg-white px-4 py-3 text-[10px] font-black uppercase tracking-[.12em] text-[#16243d] transition hover:border-[#16243d]/60 hover:bg-[#16243d]/5 disabled:opacity-50 ${
                    !canonicalCertificate
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }`}
                >
                  X/Twitter
                </a>
              </div>
              {certificateRecord && (
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={downloadPdfCertificate}
                    disabled={downloadCertificatePdfMutation.isPending}
                    className="w-full border-[#16243d]/25 bg-white text-[10px] font-black uppercase tracking-[.12em] text-[#16243d] transition hover:border-[#16243d]/60 hover:bg-[#16243d]/5 disabled:opacity-50"
                  >
                    {downloadCertificatePdfMutation.isPending ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Preparing
                        PDF…
                      </>
                    ) : (
                      "Download PDF"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void downloadPngCertificate()}
                    disabled={certificatePngDownloading}
                    className="w-full border-[#16243d]/25 bg-white text-[10px] font-black uppercase tracking-[.12em] text-[#16243d] transition hover:border-[#16243d]/60 hover:bg-[#16243d]/5 disabled:opacity-50"
                  >
                    {certificatePngDownloading
                      ? "Preparing PNG…"
                      : "Download PNG"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={copyCertificateLink}
                    className="w-full border-[#16243d]/25 bg-white text-[10px] font-black uppercase tracking-[.12em] text-[#16243d] transition hover:border-[#16243d]/60 hover:bg-[#16243d]/5"
                  >
                    Copy certificate link
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCertificatePrintOpen(true)}
                    className="w-full border-[#16243d]/25 bg-white text-[10px] font-black uppercase tracking-[.12em] text-[#16243d] transition hover:border-[#16243d]/60 hover:bg-[#16243d]/5"
                  >
                    Print preview
                  </Button>
                </div>
              )}
            </div>
            <div className="border border-[#2f6f78]/25 bg-[#edf4ee] p-5">
              <p className="eyebrow text-[#2f6f78]">Saved illustrations</p>
              <p className="mt-2 text-sm leading-6 text-[#315c4b]">
                Return to the visual explanations you want to revisit.
              </p>
              {(illustrationBookmarksQuery.data ?? []).length > 0 ? (
                <div className="mt-3 space-y-2">
                  {(illustrationBookmarksQuery.data ?? [])
                    .slice(0, 5)
                    .map(bookmark => (
                      <button
                        key={bookmark.id}
                        type="button"
                        onClick={() => openLesson(bookmark.lessonId)}
                        className="block w-full border border-[#2f6f78]/20 bg-white/70 p-3 text-left hover:border-[#2f6f78]"
                      >
                        <span className="block text-[10px] font-black uppercase tracking-[.1em] text-[#2f6f78]">
                          {bookmark.label}
                        </span>
                        <span className="mt-1 block text-xs font-bold text-[#244b4a]">
                          {bookmark.title}
                        </span>
                      </button>
                    ))}
                </div>
              ) : (
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  Use Save on any lesson illustration to build your collection.
                </p>
              )}
            </div>
            <div className="border border-[#16243d]/10 bg-white/40 p-5">
              <p className="text-xs font-bold">Course outcomes</p>
              {course.outcomes.map(outcome => (
                <p
                  key={outcome}
                  className="mt-3 border-l border-[#c9a34e] pl-3 text-xs leading-5 text-muted-foreground"
                >
                  {outcome}
                </p>
              ))}
            </div>
          </aside>
        </div>
      </main>
      {paymentRequiredStage !== null && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#071225]/80 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-required-title"
            className="w-full max-w-lg border border-[#c9a34e]/70 bg-[#f7f3e8] p-6 text-[#16243d] shadow-2xl sm:p-8"
          >
            <p className="eyebrow text-[#5d4613]">Payment required</p>
            <h2 id="payment-required-title" className="display mt-3 text-3xl">
              Unlock the next learning stage.
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#16243d]">
              This lesson is protected until the matching installment is
              verified. Your existing progress remains safe.
            </p>
            <div className="mt-6 border-l-2 border-[#c9a34e] bg-white/60 p-4">
              <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#5d4613]">
                Required installment
              </p>
              <p className="mt-2 text-lg font-bold">
                Stage {paymentRequiredStage} ·{" "}
                {stageLabels[paymentRequiredStage - 1] ?? "Course access"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                KES{" "}
                {(
                  course.stageAmountsKes[paymentRequiredStage - 1] ??
                  course.stageAmountsKes[0] ??
                  0
                ).toLocaleString()}
              </p>
              <div className="mt-5">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-bold">
                    Lessons unlocked after payment
                  </span>
                  <span>
                    {lessonsUnlockedAfterStage[paymentRequiredStage - 1] ?? 0}{" "}
                    of 70
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden bg-[#16243d]/10">
                  <div
                    className="h-full bg-[#c9a34e] transition-[width]"
                    style={{
                      width: `${((lessonsUnlockedAfterStage[paymentRequiredStage - 1] ?? 0) / 70) * 100}%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
                  This payment unlocks access through the corresponding learning
                  stage.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPaymentRequiredStage(null)}
              >
                Not now
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setPaymentRequiredStage(null);
                  startCheckout(paymentRequiredStage);
                }}
                disabled={checkoutMutation.isPending}
                className="bg-[#16243d] text-[#f7f3e8]"
              >
                {checkoutMutation.isPending
                  ? "Preparing checkout…"
                  : "Continue to secure payment"}
              </Button>
            </div>
          </div>
        </div>
      )}
      {activeLesson && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#071225]/80 p-4 sm:p-8">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="lesson-player-title"
            className="relative mx-auto max-w-4xl overflow-hidden border border-[#c9a34e]/70 bg-[#f7f3e8] p-6 text-[#16243d] shadow-2xl sm:p-10"
          >
            <div className="flex items-start justify-between gap-5 border-b border-[#16243d]/15 pb-6">
              <div>
                <p className="eyebrow text-[#5d4613]">
                  Interactive lesson · {activeLesson.durationMinutes} minutes
                </p>
                <h2 id="lesson-player-title" className="display mt-3 text-4xl">
                  {activeLesson.title}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {activeLesson.summary}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveLessonId(null)}
                aria-label={enrollmentCopy.close + " lesson"}
              >
                {enrollmentCopy.close}
              </Button>
            </div>
            <div className="relative">
              <div
                className={`absolute inset-x-0 bottom-0 top-0 z-10 bg-[#f7f3e8] p-1 transition-opacity duration-200 ${lessonTransitioning ? "opacity-100" : "pointer-events-none opacity-0"}`}
                aria-hidden={!lessonTransitioning}
              >
                <LessonPlayerSkeleton />
              </div>
              <div key={activeLesson.id} className="lesson-panel-enter mt-6">
                <div className="border border-[#c9a34e]/60 bg-[#16243d] p-4 text-[#f7f3e8]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[.14em] text-accent-on-dark">
                        {enrollmentCopy.details} · 25-minute study timer
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-on-dark">
                        {activeLessonTimerComplete
                          ? "Time complete — the next lesson is unlocked."
                          : "Stay in this lesson until the timer reaches zero."}
                      </p>
                    </div>
                    <span
                      role="timer"
                      aria-live="polite"
                      aria-label={
                        activeLessonTimerComplete
                          ? "Lesson timer complete"
                          : `${formatCountdown(activeLessonSecondsRemaining)} remaining`
                      }
                      className="font-mono text-2xl font-bold text-accent-on-dark"
                    >
                      {activeLessonTimerComplete
                        ? "00:00"
                        : formatCountdown(activeLessonSecondsRemaining)}
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden bg-white/15">
                    <div
                      className="h-full bg-[#c9a34e] transition-[width] duration-1000"
                      style={{
                        width: `${Math.min(100, Math.round(((1500 - activeLessonSecondsRemaining) / 1500) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#5d4613]">
                        {assessmentCopy.lessonProgress}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {lessonStage < 1
                          ? "Orienting"
                          : lessonStage < 2
                            ? "Practising"
                            : lessonStage < 3
                              ? "Reflecting"
                              : "Ready to complete"}{" "}
                        · approximately{" "}
                        {Math.min(30, Math.round((lessonStage / 3) * 30))} of 30
                        minutes
                      </p>
                    </div>
                    <span className="text-sm font-bold text-[#5d4613]">
                      {Math.round((lessonStage / 3) * 100)}%
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden bg-[#16243d]/10">
                    <div
                      className="h-full bg-[#c9a34e] transition-all"
                      style={{
                        width: `${Math.round((lessonStage / 3) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_240px]">
                  <div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {activeLesson.objectives.map(objective => (
                        <div
                          key={objective}
                          className="border-l-2 border-[#c9a34e] bg-white/60 p-3 text-xs leading-5 text-[#16243d]"
                        >
                          {objective}
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 border-l-2 border-[#2f6f78] bg-white/60 p-4 text-sm leading-7 text-[#16243d]">
                      <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#2f6f78]">
                        Deep-dive practice
                      </p>
                      <p className="mt-2">{activeLesson.deepDive}</p>
                    </div>
                    <div className="mt-7 space-y-5">
                      {activeLesson.sections.map((section, sectionIndex) => (
                        <article
                          key={section.heading}
                          className="border-t border-[#16243d]/15 pt-5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#5d4613]">
                              {section.heading}
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                toggleBookmark(
                                  `${activeLesson.id}:section:${sectionIndex}`
                                )
                              }
                              className="text-[10px] font-black uppercase tracking-[.1em] text-accent-on-dark"
                            >
                              {bookmarks.includes(
                                `${activeLesson.id}:section:${sectionIndex}`
                              )
                                ? assessmentCopy.saved
                                : assessmentCopy.saveForLater}
                            </button>
                          </div>
                          <p className="mt-2 text-sm leading-7 text-[#16243d]">
                            {section.body}
                          </p>
                          {section.callout && (
                            <p className="mt-3 border-l-2 border-[#c9a34e] bg-[#fffaf0] p-3 text-xs font-semibold leading-5 text-[#5d4613]">
                              {section.callout}
                            </p>
                          )}
                        </article>
                      ))}
                    </div>
                    <div className="mt-7 border border-[#c9a34e]/60 bg-[#16243d] p-5 text-[#f7f3e8]">
                      <div className="flex items-start justify-between gap-3">
                        <p className="eyebrow text-accent-on-dark">
                          Decision simulation
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            toggleBookmark(`${activeLesson.id}:simulation`)
                          }
                          className="text-[10px] font-black uppercase tracking-[.1em] text-accent-on-dark"
                        >
                          {bookmarks.includes(`${activeLesson.id}:simulation`)
                            ? assessmentCopy.saved
                            : assessmentCopy.saveForLater}
                        </button>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-on-dark">
                        {activeLesson.simulation.prompt}
                      </p>
                      <div className="mt-4 grid gap-2">
                        {activeLesson.simulation.options.map(
                          (option, index) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                setSimulationChoice(index);
                                setLessonStage(2);
                              }}
                              className={`border p-3 text-left text-xs leading-5 ${simulationChoice === index ? "border-[#c9a34e] bg-[#c9a34e]/20" : "border-white/20 hover:border-[#c9a34e] hover:shadow-md"}`}
                            >
                              {option}
                            </button>
                          )
                        )}
                      </div>
                      {simulationChoice !== null && (
                        <p className="mt-4 text-xs leading-5 text-accent-on-dark">
                          {activeLesson.simulation.feedback[simulationChoice]}
                        </p>
                      )}
                    </div>
                    <div className="mt-6 border border-[#16243d]/15 bg-white/60 p-5">
                      <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#5d4613]">
                        Reflection prompt
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#16243d]">
                        {activeLesson.reflectionPrompt}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2 border border-[#16243d]/15 bg-[#f7f3e8] p-2">
                        <button
                          type="button"
                          onClick={() => document.execCommand("bold")}
                          className="border border-[#16243d]/20 px-3 py-1 text-xs font-bold"
                        >
                          Bold
                        </button>
                        <button
                          type="button"
                          onClick={() => document.execCommand("italic")}
                          className="border border-[#16243d]/20 px-3 py-1 text-xs italic"
                        >
                          Italic
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            document.execCommand("insertUnorderedList")
                          }
                          className="border border-[#16243d]/20 px-3 py-1 text-xs"
                        >
                          • Bullets
                        </button>
                        <button
                          type="button"
                          onClick={() => void summarizeNotes()}
                          disabled={summarizeNotesMutation.isPending}
                          className="border border-[#a27e2e] px-3 py-1 text-xs font-bold text-[#5d4613]"
                        >
                          {summarizeNotesMutation.isPending
                            ? "Summarizing…"
                            : "Summarize notes"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void generateStudyAid("quiz")}
                          disabled={studyAidMutation.isPending}
                          className="border border-[#16243d]/20 px-3 py-1 text-xs"
                        >
                          {studyAidMutation.isPending
                            ? "Creating…"
                            : "Practice quiz"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void generateStudyAid("flashcards")}
                          disabled={studyAidMutation.isPending}
                          className="border border-[#16243d]/20 px-3 py-1 text-xs"
                        >
                          Flashcards
                        </button>
                      </div>
                      <div
                        className={`mb-7 border-l-2 border-[#c9a34e] bg-[#fffaf0] p-5 ${lessonResponsesComplete ? "animate-pulse" : ""}`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="eyebrow text-[#5d4613]">
                              Required learning responses
                            </p>
                            <p className="mt-2 text-sm leading-6 text-[#16243d]">
                              Respond to every prompt before completing this
                              lesson. Your work saves as you type and can be
                              formatted for clearer thinking.
                            </p>
                          </div>
                          <span
                            className={`text-xs font-bold ${lessonResponsesComplete ? "text-emerald-800" : "text-[#5d4613]"}`}
                          >
                            {lessonResponsesComplete
                              ? "All responses saved"
                              : `${
                                  activeLesson.responseTasks.filter(task =>
                                    responseFor(task.id)
                                      .replace(/<[^>]*>/g, "")
                                      .replace(/&nbsp;/gi, " ")
                                      .trim()
                                  ).length
                                } of ${activeLesson.responseTasks.length} complete`}
                          </span>
                          <span
                            aria-live="polite"
                            className={`text-xs font-bold ${responseSaveStatus === "error" ? "text-red-800" : responseSaveStatus === "saved" ? "text-emerald-800" : "text-[#5d4613]"}`}
                          >
                            {responseSaveStatus === "saving"
                              ? assessmentCopy.saving
                              : responseSaveStatus === "saved"
                                ? assessmentCopy.allChangesSaved
                                : responseSaveStatus === "error"
                                  ? assessmentCopy.saveFailed
                                  : assessmentCopy.autoSaveHint}
                          </span>
                        </div>
                        <div className="mt-5 space-y-5">
                          {activeLesson.responseTasks.map(task => {
                            const review = learnerReviewMap.get(
                              `${activeLesson.id}:${task.id}`
                            );
                            return (
                              <div key={task.id}>
                                <label
                                  className="block text-xs font-bold leading-5"
                                  htmlFor={`response-${task.id}`}
                                >
                                  {task.prompt}
                                  <span className="ml-1 text-[#5d4613]">*</span>
                                </label>
                                <div className="mt-2 flex flex-wrap gap-2 border border-b-0 border-[#16243d]/20 bg-white/70 p-2">
                                  <button
                                    type="button"
                                    onClick={() => document.execCommand("bold")}
                                    className="border border-[#16243d]/20 px-3 py-1 text-xs font-bold"
                                  >
                                    Bold
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      document.execCommand("italic")
                                    }
                                    className="border border-[#16243d]/20 px-3 py-1 text-xs italic"
                                  >
                                    Italic
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      document.execCommand(
                                        "insertUnorderedList"
                                      )
                                    }
                                    className="border border-[#16243d]/20 px-3 py-1 text-xs"
                                  >
                                    • Bullets
                                  </button>
                                </div>
                                <div
                                  id={`response-${task.id}`}
                                  contentEditable
                                  suppressContentEditableWarning
                                  dangerouslySetInnerHTML={{
                                    __html: responseFor(task.id),
                                  }}
                                  onInput={event => {
                                    updateLessonResponse(
                                      task.id,
                                      event.currentTarget.innerHTML
                                    );
                                    setLessonStage(3);
                                  }}
                                  data-placeholder={task.placeholder}
                                  className="min-h-24 w-full border border-[#16243d]/20 bg-[#f7f3e8] p-3 text-sm leading-6 outline-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)] focus:border-[#c9a34e] focus:ring-2 focus:ring-[#c9a34e]/30"
                                ></div>
                                {review?.status === "reviewed" && (
                                  <div className="mt-3 border-l-2 border-[#2f6f78] bg-[#edf4ee] p-3 text-sm leading-6 text-[#315c4b]">
                                    <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#2f6f78]">
                                      Instructor feedback
                                    </p>
                                    <p className="mt-1 whitespace-pre-wrap">
                                      {review.feedback}
                                    </p>
                                    <p className="mt-2 text-[11px] text-muted-foreground">
                                      Reviewed{" "}
                                      {new Date(
                                        review.updatedAt
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        dangerouslySetInnerHTML={{
                          __html: lessonNotes[activeLesson.id] ?? "",
                        }}
                        onInput={event => {
                          const value = event.currentTarget.innerHTML;
                          updateLessonNote(value);
                          setReflection(event.currentTarget.innerText);
                          setLessonStage(3);
                        }}
                        data-placeholder="Write a brief field note for yourself…"
                        className="mt-0 min-h-28 w-full border border-t-0 border-[#16243d]/20 bg-[#f7f3e8] p-3 text-sm outline-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)] focus:border-[#c9a34e] focus:ring-2 focus:ring-[#c9a34e]/30"
                      />
                      {studyAid && (
                        <div className="mt-5 border-l-2 border-[#c9a34e] bg-[#fffaf0] p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#5d4613]">
                              AI{" "}
                              {studyAid.mode === "quiz"
                                ? "practice quiz"
                                : "flashcards"}
                            </p>
                            <button
                              type="button"
                              onClick={() => setStudyAid(null)}
                              className="text-[10px] font-black uppercase tracking-[.1em] text-muted-foreground"
                            >
                              Close
                            </button>
                          </div>
                          <p className="mt-3 whitespace-pre-wrap text-xs leading-6 text-[#16243d]">
                            {studyAid.content}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <aside className="h-fit border border-[#c9a34e]/60 bg-[#101d35] p-5 text-[#f7f3e8]">
                    <div className="grid h-40 place-items-center border border-[#c9a34e]/40 bg-gradient-to-br from-[#c9a34e]/30 via-[#2f6f78]/20 to-[#8b4f63]/30">
                      <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-[.16em] text-accent-on-dark">
                          {activeLesson.illustration.label}
                        </p>
                        <div className="mx-auto mt-4 h-14 w-14 rotate-45 border border-[#c9a34e]" />
                        <p className="mt-4 text-xs text-muted-on-dark">
                          {activeLesson.illustration.caption}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      <IllustrationCard
                        label={illustrationCopy.explanatory}
                        text={activeLesson.illustration.explanatory}
                        tone="gold"
                        visualUrl={activeLesson.illustration.visualUrl}
                        visualAlt={activeLesson.illustration.visualAlt}
                        bookmarked={
                          serverBookmarkKeys.has(
                            illustrationBookmarkKey(
                              activeLesson.id,
                              "explanatory"
                            )
                          ) ||
                          bookmarks.includes(
                            illustrationBookmarkKey(
                              activeLesson.id,
                              "explanatory"
                            )
                          )
                        }
                        onToggleBookmark={() =>
                          toggleIllustrationBookmark(
                            "explanatory",
                            illustrationCopy.explanatory,
                            activeLesson.title,
                            activeLesson.illustration.explanatory
                          )
                        }
                        onZoom={() =>
                          setZoomedIllustration({
                            label: illustrationCopy.explanatory,
                            text: activeLesson.illustration.explanatory,
                            visualUrl:
                              activeLesson.illustration.visualUrl ?? "",
                            visualAlt: activeLesson.illustration.visualAlt,
                          })
                        }
                        onDownloadStudySheet={() =>
                          activeLesson.illustration.visualUrl &&
                          downloadIllustrationStudySheet({
                            imageUrl: activeLesson.illustration.visualUrl,
                            courseTitle: course.title,
                            lessonTitle: activeLesson.title,
                            modeLabel: illustrationCopy.explanatory,
                            content: activeLesson.illustration.explanatory,
                            filename: `${course.slug}-${activeLesson.id}-study-sheet.svg`,
                          })
                        }
                      />
                      <IllustrationCard
                        label={illustrationCopy.applicational}
                        text={activeLesson.illustration.applicational}
                        tone="teal"
                        bookmarked={
                          serverBookmarkKeys.has(
                            illustrationBookmarkKey(
                              activeLesson.id,
                              "applicational"
                            )
                          ) ||
                          bookmarks.includes(
                            illustrationBookmarkKey(
                              activeLesson.id,
                              "applicational"
                            )
                          )
                        }
                        onToggleBookmark={() =>
                          toggleIllustrationBookmark(
                            "applicational",
                            illustrationCopy.applicational,
                            activeLesson.title,
                            activeLesson.illustration.applicational
                          )
                        }
                      />
                      <IllustrationCard
                        label={illustrationCopy.experiential}
                        text={activeLesson.illustration.experiential}
                        tone="plum"
                        bookmarked={
                          serverBookmarkKeys.has(
                            illustrationBookmarkKey(
                              activeLesson.id,
                              "experiential"
                            )
                          ) ||
                          bookmarks.includes(
                            illustrationBookmarkKey(
                              activeLesson.id,
                              "experiential"
                            )
                          )
                        }
                        onToggleBookmark={() =>
                          toggleIllustrationBookmark(
                            "experiential",
                            illustrationCopy.experiential,
                            activeLesson.title,
                            activeLesson.illustration.experiential
                          )
                        }
                      />
                    </div>
                    <section className="mt-5 border border-[#8b4f63]/35 bg-[#fff7f9] p-5">
                      <p className="eyebrow text-[#8b4f63]">
                        Experiential story lab
                      </p>
                      <h3 className="display mt-2 text-2xl text-[#16243d]">
                        Turn the story into a lived response.
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[#16243d]">
                        {activeLesson.illustration.experientialQuestion}
                      </p>
                      <div className="mt-4 grid gap-2">
                        {activeLesson.illustration.experientialOptions.map(
                          (option, index) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                setExperientialChoice(index);
                                updateLessonResponse(
                                  "experience-choice",
                                  String(index)
                                );
                                setLessonStage(2);
                              }}
                              className={`border p-3 text-left text-xs leading-5 transition ${experientialChoice === index ? "border-[#8b4f63] bg-[#fff0f3] text-[#8b4f63]" : "border-[#16243d]/15 bg-white/70 hover:border-[#8b4f63] hover:bg-[#8b4f63]/5"}`}
                            >
                              <span className="mr-2 font-black text-[#8b4f63]">
                                {String.fromCharCode(65 + index)}.
                              </span>
                              {option}
                            </button>
                          )
                        )}
                      </div>
                      {experientialChoice !== null && (
                        <p className="mt-3 border-l-2 border-[#8b4f63] pl-3 text-xs leading-5 text-[#16243d]">
                          {
                            activeLesson.illustration.experientialFeedback[
                              experientialChoice
                            ]
                          }
                        </p>
                      )}
                      <p className="mt-5 text-sm leading-6 text-[#16243d]">
                        {activeLesson.illustration.experientialReflectionPrompt}
                      </p>
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        role="textbox"
                        aria-label="Experiential story reflection"
                        onInput={event => {
                          const value = event.currentTarget.innerHTML;
                          setExperientialReflection(value);
                          updateLessonResponse("experience-reflection", value);
                        }}
                        dangerouslySetInnerHTML={{
                          __html: experientialReflection,
                        }}
                        className="mt-3 min-h-24 border border-[#16243d]/15 bg-white px-3 py-3 text-sm leading-6 outline-none focus:border-[#8b4f63]"
                      />
                    </section>
                    <p className="mt-4 text-xs leading-5 text-muted-on-dark">
                      Work in one uninterrupted 25-minute block: orient,
                      practise, respond, reflect, and record your next action.
                    </p>
                  </aside>
                </div>
                <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#16243d]/15 pt-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      Complete the lesson after reviewing the example,
                      simulation, and all required responses.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={exportLessonNotes}
                    >
                      <Download size={14} /> Export notes
                    </Button>
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      if (!activeLessonTimerComplete && !accessOverride) {
                        toast.info("Lesson timer still running", {
                          description: `The lesson must remain open for 25 minutes and every response must be saved. ${formatCountdown(activeLessonSecondsRemaining)} remaining.`,
                        });
                        return;
                      }
                      toggleLesson(activeLesson.id);
                    }}
                    disabled={
                      (!activeLessonTimerComplete && !accessOverride) ||
                      !lessonResponsesComplete ||
                      progress.lessons.includes(activeLesson.id)
                    }
                    className="bg-[#16243d] text-[#f7f3e8]"
                  >
                    {progress.lessons.includes(activeLesson.id)
                      ? "Lesson complete"
                      : activeLessonTimerComplete || accessOverride
                        ? "Mark lesson complete"
                        : `Complete in ${formatCountdown(activeLessonSecondsRemaining)}`}
                  </Button>
                  <Button
                    type="button"
                    onClick={continueToNextLesson}
                    disabled={!activeLessonTimerComplete && !accessOverride}
                    className="bg-[#c9a34e] text-[#16243d]"
                  >
                    {nextLesson ? "Next lesson" : "Close lesson"}{" "}
                    <ArrowRight size={15} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {quizOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#071225]/80 p-4 sm:p-8">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="course-quiz-title"
            className="mx-auto max-w-3xl border border-[#c9a34e]/70 bg-[#f7f3e8] p-6 text-[#16243d] shadow-2xl sm:p-10"
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="eyebrow text-[#5d4613]">
                  Module quiz · 15 questions
                </p>
                <h2 id="course-quiz-title" className="display mt-3 text-4xl">
                  Show your understanding.
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  50% is the pass mark. You can repeat this quiz as many times
                  as needed.
                </p>
                <div
                  role="status"
                  className="mt-4 flex items-center gap-2 border border-[#c9a34e]/60 bg-[#ead9ae]/40 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] text-[#5d4613]"
                >
                  <Sparkles size={14} /> New randomized attempt · #
                  {quizAttemptNumber}
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setQuizOpen(false)}
                aria-label="Close quiz"
              >
                <RotateCcw size={15} />
              </Button>
            </div>
            <div className="mt-8 space-y-6">
              {quizOrder.map((question, index) => (
                <fieldset
                  key={question.id}
                  className="border-t border-[#16243d]/15 pt-5"
                >
                  <legend className="text-sm font-bold">
                    {index + 1}. {question.prompt}
                  </legend>
                  <p className="mt-1 text-[10px] uppercase tracking-[.12em] text-[#5d4613]">
                    Aligned lesson: {question.sourceLessonTitle}
                  </p>
                  <div className="mt-3 grid gap-2">
                    {question.options.map((option, optionIndex) => (
                      <label
                        key={option}
                        className={`flex cursor-pointer gap-3 border p-3 text-xs ${selectedAnswers[question.id] === optionIndex ? "border-[#c9a34e] bg-[#ead9ae]" : "border-[#16243d]/10"}`}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          checked={selectedAnswers[question.id] === optionIndex}
                          onChange={() =>
                            setSelectedAnswers({
                              ...selectedAnswers,
                              [question.id]: optionIndex,
                            })
                          }
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
            {quizResult && (
              <section
                aria-live="polite"
                className="mt-8 border-t border-[#16243d]/15 pt-6"
              >
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="eyebrow text-[#5d4613]">Learning review</p>
                    <h3 className="display mt-2 text-2xl">
                      {quizResult.score}% · {quizResult.correct}/
                      {currentModule.quiz.length} correct
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Read each explanation, then try another randomized attempt
                      whenever you are ready.
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={openQuiz}
                    className="bg-[#c9a34e] text-[#16243d]"
                  >
                    New randomized attempt <RotateCcw size={14} />
                  </Button>
                </div>
                <div className="mt-5 space-y-3">
                  {quizOrder.map((question, index) => {
                    const selectedIndex = quizResult.answers[question.id];
                    const selectedOption =
                      typeof selectedIndex === "number"
                        ? question.options[selectedIndex]
                        : null;
                    const isCorrect = selectedIndex === question.correctOption;
                    const explanation =
                      typeof selectedIndex === "number"
                        ? question.optionExplanations[selectedIndex]
                        : "No answer was selected; review the correct approach below.";
                    return (
                      <article
                        key={`feedback-${question.id}`}
                        className={`border p-4 ${isCorrect ? "border-[#55705a]/45 bg-[#edf4ee]" : "border-[#8b4f63]/35 bg-[#fbf0f2]"}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 text-xs font-black">
                            {isCorrect ? "✓" : "!"}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold">
                              {index + 1}. {question.prompt}
                            </p>
                            <p className="mt-2 text-xs leading-5">
                              <strong>
                                {isCorrect
                                  ? "Correct response"
                                  : "Your response"}
                                :
                              </strong>{" "}
                              {selectedOption ?? "Not answered"}
                            </p>
                            {!isCorrect && (
                              <p className="mt-1 text-xs leading-5">
                                <strong>Correct answer:</strong>{" "}
                                {question.options[question.correctOption]}
                              </p>
                            )}
                            <p className="mt-2 text-xs leading-5 text-[#16243d]">
                              {explanation}
                            </p>
                            <p className="mt-2 border-t border-current/10 pt-2 text-xs leading-5 text-muted-foreground">
                              Lesson connection: {question.explanation}
                            </p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}
            <Button
              type="button"
              onClick={submitQuiz}
              disabled={
                Boolean(quizResult) ||
                Object.keys(selectedAnswers).length !==
                  currentModule.quiz.length
              }
              className="mt-8 bg-[#16243d] text-[#f7f3e8]"
            >
              {assessmentCopy.submitQuiz}
            </Button>
          </div>
        </div>
      )}
      {identityOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#071225]/80 p-4"
          role="presentation"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setIdentityOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-identity-title"
            className="w-full max-w-md border border-[#c9a34e]/70 bg-[#f7f3e8] p-6 text-[#16243d] shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow text-[#5d4613]">
                  {enrollmentCopy.payment} · {enrollmentCopy.details} 01
                </p>
                <h2
                  id="checkout-identity-title"
                  className="display mt-2 text-3xl"
                >
                  {enrollmentCopy.selectedCourse}
                </h2>
              </div>
              <button
                type="button"
                aria-label={enrollmentCopy.close + " checkout details"}
                onClick={() => setIdentityOpen(false)}
                className="text-xs font-black uppercase tracking-[.12em] text-muted-foreground"
              >
                Close
              </button>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#16243d]">
              These details will personalize your payment receipt, course
              certificate, and completion emails.
            </p>
            <form
              onSubmit={event => {
                event.preventDefault();
                if (
                  !identityName.trim() ||
                  !identityEmail.trim() ||
                  !identityConsent
                )
                  return;
                enrollMutation.mutate(
                  {
                    courseSlug: course.slug,
                    name: identityName,
                    email: identityEmail,
                    consent: true,
                  },
                  {
                    onSuccess: result => {
                      setIdentityOpen(false);
                      if (result.enrollmentId)
                        checkoutMutation.mutate(
                          { enrollmentId: result.enrollmentId, stage: 1 },
                          {
                            onSuccess: checkoutResult => {
                              if (
                                "paid" in checkoutResult &&
                                checkoutResult.paid
                              ) {
                                void courseState.refetch();
                                toast.success("Payment verified", {
                                  description: "Your course access is updated.",
                                });
                                return;
                              }
                              setInlineProduct({
                                accessCode: checkoutResult.accessCode,
                                reference: checkoutResult.reference,
                                amountKes: checkoutResult.amountKes,
                                productName: checkoutResult.productName,
                                productType:
                                  checkoutResult.productType as "course_stage",
                                enrollmentId: checkoutResult.enrollmentId,
                                courseSlug: checkoutResult.courseSlug,
                                stage: checkoutResult.stage,
                              });
                              setInlineModalOpen(true);
                            },
                          }
                        );
                      void courseState.refetch();
                    },
                  }
                );
              }}
              className="mt-6 space-y-5"
            >
              <label className="block text-xs font-black uppercase tracking-[.14em]">
                {enrollmentCopy.yourName}
                <input
                  required
                  minLength={2}
                  value={identityName}
                  onChange={event => setIdentityName(event.target.value)}
                  autoComplete="name"
                  className="mt-2 w-full border-b border-[#16243d]/30 bg-transparent py-3 text-base outline-none focus:border-[#c9a34e] focus:ring-2 focus:ring-[#c9a34e]/30"
                />
              </label>
              <label className="block text-xs font-black uppercase tracking-[.14em]">
                {enrollmentCopy.emailAddress}
                <input
                  required
                  type="email"
                  value={identityEmail}
                  onChange={event => setIdentityEmail(event.target.value)}
                  autoComplete="email"
                  className="mt-2 w-full border-b border-[#16243d]/30 bg-transparent py-3 text-base outline-none focus:border-[#c9a34e] focus:ring-2 focus:ring-[#c9a34e]/30"
                />
              </label>
              <p className="text-[11px] leading-5 text-muted-foreground">
                Your email must be the address associated with this
                authenticated account so payment and course records stay
                together.
              </p>
              <label className="flex items-start gap-3 text-[11px] leading-5 text-[#16243d]">
                <input
                  type="checkbox"
                  checked={identityConsent}
                  onChange={event => setIdentityConsent(event.target.checked)}
                  className="mt-1 accent-[#a27e2e]"
                  required
                />{" "}
                <span>
                  I consent to Profound IQ Consulting using these details to
                  process this enrollment, payment receipt, course certificate,
                  and completion emails.
                </span>
              </label>
              <Button
                type="submit"
                disabled={
                  enrollMutation.isPending ||
                  checkoutMutation.isPending ||
                  !identityName.trim() ||
                  !identityEmail.trim() ||
                  !identityConsent
                }
                className="w-full bg-[#16243d] text-[#f7f3e8]"
              >
                {enrollMutation.isPending || checkoutMutation.isPending
                  ? enrollmentCopy.recording
                  : enrollmentCopy.continueCheckout}
                <ArrowUpRight size={14} />
              </Button>
            </form>
          </div>
        </div>
      )}
      {certificatePrintOpen && certificateRecord?.fileUrl && (
        <div
          className="fixed inset-0 z-[70] grid place-items-center bg-[#071225]/85 p-4"
          role="presentation"
          onMouseDown={event => {
            if (event.target === event.currentTarget)
              setCertificatePrintOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="certificate-print-preview-title"
            className="w-full max-w-5xl border border-[#c9a34e]/70 bg-[#16243d] p-4 text-[#f7f3e8] shadow-2xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow text-accent-on-dark">
                  Certificate preview
                </p>
                <h2
                  id="certificate-print-preview-title"
                  className="display mt-2 text-2xl sm:text-3xl"
                >
                  Check your print layout
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Review the branded certificate before printing. Choose the
                  paper size that matches your printer.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCertificatePrintOpen(false)}
                className="border border-white/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[#f7f3e8]"
              >
                Close
              </button>
            </div>
            <div className="mt-5 overflow-auto bg-[#d7dbe2] p-3">
              <img
                src={certificateRecord.fileUrl}
                alt={`${course.title} certificate preview`}
                className="mx-auto block w-full min-w-[720px] max-w-[1000px] bg-white shadow-lg"
              />
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <label className="text-[10px] font-black uppercase tracking-[.12em] text-accent-on-dark">
                Paper size
                <select
                  value={certificatePrintPageSize}
                  onChange={event =>
                    setCertificatePrintPageSize(
                      event.target.value as "a4" | "letter"
                    )
                  }
                  className="ml-3 border border-white/20 bg-[#16243d] px-3 py-2 text-xs font-bold tracking-normal text-[#f7f3e8]"
                >
                  <option value="a4">A4 landscape</option>
                  <option value="letter">Letter landscape</option>
                </select>
              </label>
              <button
                type="button"
                onClick={printCertificate}
                className="bg-[#c9a34e] px-4 py-3 text-[10px] font-black uppercase tracking-[.12em] text-[#16243d]"
              >
                <Printer size={15} className="mr-2 inline" /> Print certificate
              </button>
            </div>
          </div>
        </div>
      )}
      {zoomedIllustration && (
        <div
          className="fixed inset-0 z-[70] grid place-items-center bg-[#071225]/85 p-4"
          role="presentation"
          onMouseDown={event => {
            if (event.target === event.currentTarget)
              setZoomedIllustration(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="lesson-artwork-title"
            className="w-full max-w-5xl border border-[#c9a34e]/70 bg-[#16243d] p-4 text-[#f7f3e8] shadow-2xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow text-accent-on-dark">
                  {zoomedIllustration.label}
                </p>
                <h2
                  id="lesson-artwork-title"
                  className="display mt-2 text-2xl sm:text-3xl"
                >
                  {activeLesson?.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setZoomedIllustration(null)}
                className="border border-white/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[#f7f3e8]"
              >
                Close
              </button>
            </div>
            <img
              src={zoomedIllustration.visualUrl}
              alt={zoomedIllustration.visualAlt ?? zoomedIllustration.label}
              className="mt-5 max-h-[65vh] w-full object-contain"
            />
            <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
              {zoomedIllustration.text}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  downloadIllustrationStudySheet({
                    imageUrl: zoomedIllustration.visualUrl,
                    courseTitle: course.title,
                    lessonTitle: activeLesson?.title ?? "Lesson illustration",
                    modeLabel: zoomedIllustration.label,
                    content: zoomedIllustration.text,
                    filename: `${course.slug}-${activeLesson?.id ?? "lesson"}-study-sheet.svg`,
                  })
                }
                className="inline-flex items-center gap-2 bg-[#c9a34e] px-4 py-3 text-[10px] font-black uppercase tracking-[.12em] text-[#16243d]"
              >
                <Download size={14} /> Download SVG study sheet
              </button>
              <button
                type="button"
                onClick={() =>
                  void downloadIllustrationStudySheetPng({
                    imageUrl: zoomedIllustration.visualUrl,
                    courseTitle: course.title,
                    lessonTitle: activeLesson?.title ?? "Lesson illustration",
                    modeLabel: zoomedIllustration.label,
                    content: zoomedIllustration.text,
                    filename: `${course.slug}-${activeLesson?.id ?? "lesson"}-study-sheet.svg`,
                  })
                }
                className="inline-flex items-center gap-2 border border-[#c9a34e] px-4 py-3 text-[10px] font-black uppercase tracking-[.12em] text-[#f7f3e8]"
              >
                <Download size={14} /> Download PNG
              </button>
              <button
                type="button"
                onClick={() => setZoomedIllustration(null)}
                className="border border-white/25 px-4 py-3 text-[10px] font-black uppercase tracking-[.12em] text-[#f7f3e8]"
              >
                Return to lesson
              </button>
            </div>
          </div>
        </div>
      )}
      <PaystackInlineModal
        open={inlineModalOpen}
        product={inlineProduct}
        customerEmail={user?.email ?? identityEmail ?? ""}
        onClose={() => {
          setInlineModalOpen(false);
          setInlineProduct(null);
        }}
        onSuccess={reference => {
          setInlineModalOpen(false);
          setInlineProduct(null);
          verifyMutation.mutate(
            { reference },
            {
              onSuccess: () => {
                void courseState.refetch();
                toast.success("Payment verified", {
                  description: "Your course access is updated.",
                });
              },
              onError: error => toast.error(error.message),
            }
          );
        }}
        onError={message => {
          setInlineModalOpen(false);
          setInlineProduct(null);
          toast.error("Payment failed", { description: message });
        }}
      />
    </div>
  );
}

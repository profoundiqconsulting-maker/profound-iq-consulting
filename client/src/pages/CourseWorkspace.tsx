/* Profound IQ Consulting — Simple themed course page for all 51 courses. */
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  Download,
  Loader2,
  Share2,
  Sparkles,
} from "lucide-react";
import { Link, useRoute } from "wouter";
import {
  courseCatalog,
  type CourseDefinition,
  type CourseModule,
} from "@shared/courseCatalog";
import {
  canAccessCourseLessons,
  courseAccessReason,
} from "@shared/courseAccess";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TransformationNav } from "@/components/TransformationNav";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { CourseShareActions } from "@/components/CourseShareActions";
import { courseEnrollmentCopy } from "@shared/courseEnrollmentLocalization";

type LessonTimerState = { startedAt: number; completedAt?: number };
type SavedProgress = {
  lessons: string[];
  quizScores: Record<string, number>;
  stageCount: number;
  lessonTimers: Record<string, LessonTimerState>;
  responses: Record<string, Record<string, string>>;
};

const storageKey = (slug: string) => `piq-course-progress-${slug}`;

function readProgress(course: CourseDefinition): SavedProgress {
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
}

export default function CourseWorkspace() {
  const [, params] = useRoute("/courses/:slug");
  const baseCourse = courseCatalog.find(item => item.slug === params?.slug);
  const [progress] = useState<SavedProgress>(() =>
    baseCourse ? readProgress(baseCourse) : { lessons: [], quizScores: {}, stageCount: 0, lessonTimers: {}, responses: {} }
  );
  
  if (!baseCourse) {
    return (
      <div className="min-h-screen bg-[#f7f3e8] text-[#16243d]">
        <TransformationNav active="courses" />
        <main className="container py-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow text-[#5d4613]">Course not found</p>
            <h1 className="display mt-4 text-4xl">
              The course you are looking for does not exist.
            </h1>
            <Link
              href="/courses"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#16243d] px-6 py-4 text-[10px] font-black uppercase tracking-[.15em] text-[#f7f3e8] transition-all hover:shadow-md"
            >
              <ArrowLeft size={14} /> Browse all courses
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const course = baseCourse;
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const courseState = trpc.course.state.useQuery(
    { courseSlug: course.slug },
    { enabled: isAuthenticated }
  );
  
  const paidStages =
    courseState.data?.find(item => item.enrollment.courseSlug === course.slug)
      ?.stages.filter(stage => stage.paymentStatus === "paid").length ?? 0;
  
  const completedLessons = progress.lessons.length;
  const passedQuizzes = Object.values(progress.quizScores).filter(
    score => score >= 70
  ).length;
  const courseProgress = Math.round(
    (completedLessons / (course.modules.length * 7)) * 70 +
      (passedQuizzes / course.modules.length) * 30
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f7f3e8] text-[#16243d]">
        <TransformationNav active="courses" />
        <main className="container flex min-h-[70vh] items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="mx-auto animate-spin text-[#c9a34e]" size={32} />
            <p className="eyebrow mt-5 text-[#5d4613]">Secure course access</p>
            <h1 className="display mt-3 text-3xl">Checking your workspace.</h1>
          </div>
        </main>
      </div>
    );
  }

  if (!canAccessCourseLessons({ isAuthenticated, paidStages })) {
    return (
      <div className="min-h-screen bg-[#f7f3e8] text-[#16243d]">
        <TransformationNav active="courses" />
        <main className="container py-10 sm:py-16">
          <div className="mx-auto max-w-4xl">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.14em] text-[#5d4613] transition-colors hover:text-[#16243d]"
            >
              <ArrowLeft size={14} /> All courses
            </Link>
            
            <div className="mt-10 grid gap-8 lg:grid-cols-2">
              <div>
                <p className="eyebrow text-[#5d4613]">
                  {course.duration} · {course.skillLevel}
                </p>
                <h1 className="display mt-4 max-w-3xl text-5xl leading-[.95] tracking-[-.045em] sm:text-7xl">
                  {course.title}
                </h1>
                <p className="mt-6 text-lg leading-8 text-[#16243d]">
                  {course.description}
                </p>
                
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-[#16243d]/15 bg-white/55 p-5">
                    <p className="eyebrow text-[#5d4613]">For</p>
                    <p className="mt-3 text-sm leading-6">{course.audience}</p>
                  </div>
                  <div className="rounded-xl border border-[#16243d]/15 bg-white/55 p-5">
                    <p className="eyebrow text-[#5d4613]">Investment</p>
                    <p className="display mt-3 text-2xl">
                      KES {course.priceKes.toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-[#5d4613]">
                      4 staged payments · KES{" "}
                      {course.stageAmountsKes
                        .map(amount => amount.toLocaleString())
                        .join(" / ")}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-2xl border border-[#c9a34e]/40 bg-[#16243d] p-6 text-[#f7f3e8] sm:p-8">
                <p className="eyebrow text-accent-on-dark">
                  Detailed lessons are protected
                </p>
                <h2 className="display mt-3 text-2xl text-[#f7f3e8]">
                  {isAuthenticated
                    ? "Unlock the learning workspace."
                    : "Create your learner account to begin."}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#d7deea]">
                  {courseAccessReason({ isAuthenticated, paidStages })}
                </p>
                
                {isAuthenticated ? (
                  <EnrollButton course={course} />
                ) : (
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href={`/auth?mode=login&returnTo=${encodeURIComponent(`/courses/${course.slug}?workspace=1`)}`}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#c9a34e] px-5 py-4 text-[10px] font-black uppercase tracking-[.15em] text-[#16243d] shadow-sm transition-all hover:shadow-md"
                    >
                      Sign in to continue <ArrowRight size={14} />
                    </Link>
                    <Link
                      href={`/auth?mode=register&returnTo=${encodeURIComponent(`/courses/${course.slug}?workspace=1`)}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-[#c9a34e]/70 px-5 py-4 text-[10px] font-black uppercase tracking-[.15em] text-[#f7f3e8] transition-all hover:shadow-md"
                    >
                      Create account <ArrowRight size={14} />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f3e8] text-[#16243d]">
      <TransformationNav active="courses" />
      <main className="container py-10 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.14em] text-[#5d4613] transition-colors hover:text-[#16243d]"
          >
            <ArrowLeft size={14} /> All courses
          </Link>
          
          <div className="mt-10">
            <p className="eyebrow text-[#5d4613]">
              {course.duration} · {course.skillLevel}
            </p>
            <h1 className="display mt-4 max-w-4xl text-5xl leading-[.95] tracking-[-.045em] sm:text-7xl">
              {course.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#16243d]">
              {course.description}
            </p>
            
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-[#16243d]/15 bg-white/55 p-5">
                <p className="eyebrow text-[#5d4613]">Audience</p>
                <p className="mt-3 text-sm leading-6">{course.audience}</p>
              </div>
              <div className="rounded-xl border border-[#16243d]/15 bg-white/55 p-5">
                <p className="eyebrow text-[#5d4613]">Outcomes</p>
                <p className="mt-3 text-sm leading-6">
                  {course.outcomes.slice(0, 3).join(" · ")}
                </p>
              </div>
              <div className="rounded-xl border border-[#16243d]/15 bg-white/55 p-5">
                <p className="eyebrow text-[#5d4613]">Investment</p>
                <p className="display mt-3 text-2xl">
                  KES {course.priceKes.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-[#5d4613]">
                  4 staged payments
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-10 rounded-xl border-l-2 border-[#c9a34e] bg-white/60 p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[.14em] text-[#5d4613]">
                  Your progress
                </p>
                <h2 className="display mt-1 text-xl">Learning signal</h2>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[.12em] text-[#5d4613]">
                Lessons + quizzes
              </span>
            </div>
            <div className="mt-3 flex items-end justify-between gap-4">
              <p className="display text-4xl">{courseProgress}%</p>
              <p className="text-right text-xs leading-5 text-[#5d4613]">
                {completedLessons} of {course.modules.length * 7} lessons
                <br />
                {passedQuizzes} of {course.modules.length} quizzes passed
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
          </div>
          
          <div className="mt-10">
            <p className="eyebrow text-[#5d4613]">Modules</p>
            <h2 className="display mt-2 text-2xl">
              {course.modules.length} modules · {course.modules.length * 7} lessons
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {course.modules.map((module, index) => (
                <div
                  key={module.id}
                  className="rounded-xl border border-[#16243d]/15 bg-white/55 p-5 shadow-sm transition-all hover:shadow-md"
                >
                  <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#5d4613]">
                    Module {index + 1}
                  </p>
                  <h3 className="display mt-2 text-lg">{module.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-[#5d4613]">
                    {module.lessons.length} lessons
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <CourseShareActions
              courseSlug={course.slug}
              courseTitle={course.title}
              shareLabel="Share this course"
              platforms={["facebook", "linkedin", "whatsapp", "email", "copy", "native"]}
            />
            <Link href="/dashboard">
              <Button variant="outline" className="border-[#16243d]/25">
                My dashboard <ArrowUpRight size={14} />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function EnrollButton({ course }: { course: CourseDefinition }) {
  const utils = trpc.useUtils();
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [consent, setConsent] = useState(false);
  const [inlineModalOpen, setInlineModalOpen] = useState(false);
  const [inlineProduct, setInlineProduct] = useState<{
    accessCode: string;
    reference: string;
    amountKes: number;
    productName: string;
    productType: string;
    enrollmentId: number;
    courseSlug: string;
    stage: number;
  } | null>(null);

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
                  void utils.course.state.invalidate();
                  toast.success("Payment verified", {
                    description: "Your course access is updated.",
                  });
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
    enroll.isPending || checkout.isPending || verify.isPending;

  return (
    <form
      onSubmit={submit}
      className="mt-6 max-w-xl rounded-xl border border-white/15 bg-white/5 p-5 shadow-sm sm:p-6"
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
          {courseEnrollmentCopy.yourName}
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
          {courseEnrollmentCopy.emailAddress}
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
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#c9a34e] px-5 py-4 text-[10px] font-black uppercase tracking-[.15em] text-[#16243d] shadow-sm transition-all hover:shadow-md disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? (
          <Loader2 size={14} className="animate-spin" aria-hidden="true" />
        ) : (
          <ArrowRight size={14} />
        )}
        {pending
          ? "Processing..."
          : `${courseEnrollmentCopy.payment} · KES ${(course.stageAmountsKes[0] ?? 0).toLocaleString()}`}
      </button>
    </form>
  );
}

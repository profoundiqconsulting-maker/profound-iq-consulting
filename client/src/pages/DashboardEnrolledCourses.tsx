import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useMemo } from "react";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock3,
  Download,
  LockKeyhole,
  RefreshCw,
  Share2,
  Trophy,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

import {
  DashboardHero,
  Section,
  StatCard,
  FilterBar,
} from "@/components/dashboard";
import { CourseCoverImage } from "@/components/CourseCoverImage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  courseCatalog,
  type CourseDefinition,
  type CourseModule,
} from "@shared/courseCatalog";
import { buildCourseModuleBadges } from "@shared/courseBadges";
import { summarizeCourseEnrollment } from "@shared/coursePaymentRollup";
import { buildCourseCompletionShareSvg } from "@shared/courseCompletionVisual";
import { ModuleCompletionBadge } from "@/components/ModuleCompletionBadge";

export type CourseRecord = {
  enrollment: {
    id: number;
    courseSlug: string;
    name: string;
    email: string;
    createdAt: Date | string;
    updatedAt: Date | string | null;
  };
  lessons: Array<{ lessonId: string }>;
  responses: any[];
  reviews: any[];
  notifications: any[];
  quizAttempts: Array<{
    id?: number;
    moduleId: string;
    score: number;
    passed: boolean;
    createdAt?: Date | string | null;
  }>;
  stages: Array<{
    id: number;
    stage: number;
    amountKes: number;
    paymentStatus: string;
    paidAt?: Date | string | null;
    paystackReference?: string | null;
  }>;
  certificates: Array<{
    id?: number;
    certificateNumber: string;
    courseTitle: string;
    fileUrl?: string | null;
    emailStatus?: string | null;
    emailedAt?: Date | string | null;
  }>;
  accessGrant: boolean;
};

type CourseStatus = "not-started" | "in-progress" | "completed" | "expired";

function getCourseStatus(
  record: CourseRecord,
  courseModules:
    { id: string; title: string; lessons: Array<{ id: string }> }[] | undefined
): CourseStatus {
  const hasLessons = (record.lessons?.length ?? 0) > 0;
  const hasPassedQuiz = (record.quizAttempts ?? []).some(
    attempt => attempt.passed
  );
  const hasCertificate = (record.certificates?.length ?? 0) > 0;
  const hasFailedPayment = (record.stages ?? []).some(
    stage =>
      stage.paymentStatus === "failed" || stage.paymentStatus === "cancelled"
  );
  const allStagesPaid =
    (record.stages ?? []).length >= 4 &&
    record.stages.every(stage => stage.paymentStatus === "paid");

  if (hasFailedPayment && !allStagesPaid) return "expired";
  if (!hasLessons && !hasPassedQuiz) return "not-started";

  const modules = courseModules ?? [];
  const badges = buildCourseModuleBadges({
    modules: modules.map(m => ({
      id: m.id,
      title: m.title,
      lessons: m.lessons,
    })),
    completedLessonIds: (record.lessons ?? []).map(l => l.lessonId),
    passedQuizModuleIds: (record.quizAttempts ?? [])
      .filter(attempt => attempt.passed)
      .map(attempt => attempt.moduleId),
  });

  const allModulesEarned =
    badges.length > 0 && badges.every(badge => badge.status === "earned");
  if (allModulesEarned && hasCertificate) return "completed";

  return "in-progress";
}

/** Estimated minutes remaining for a course, based on lessons not yet opened. */
function estimateMinutesRemaining(
  course: CourseDefinition,
  completedLessonCount: number
): number {
  const totalMinutes = course.modules.reduce(
    (sum, m) => sum + m.lessons.reduce((lsum, l) => lsum + l.durationMinutes, 0),
    0
  );
  const totalLessons = course.modules.reduce(
    (sum, m) => sum + m.lessons.length,
    0
  );
  if (totalLessons === 0) return 0;
  const minutesPerLesson = totalMinutes / totalLessons;
  const remainingLessons = Math.max(0, totalLessons - completedLessonCount);
  return Math.round(remainingLessons * minutesPerLesson);
}

/** Formats minutes as "Xh Ym" or "Xm". */
function formatMinutes(minutes: number): string {
  if (minutes <= 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/** Formats a Date-ish value as "DD MMM YYYY". */
function formatEnrollmentDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusConfig(status: CourseStatus) {
  switch (status) {
    case "not-started":
      return {
        label: "Not Started",
        eyebrow: "Ready to begin",
        description:
          "Courses you have enrolled in but have not yet started learning.",
        actionLabel: "Start course",
        actionIcon: BookOpen,
        colorClass: "text-muted-foreground",
        badgeVariant: "secondary" as const,
      };
    case "in-progress":
      return {
        label: "In Progress",
        eyebrow: "Keep going",
        description:
          "Courses you are actively working through. Pick up where you left off.",
        actionLabel: "Continue",
        actionIcon: ChevronRight,
        colorClass: "text-[var(--brand)]",
        badgeVariant: "default" as const,
      };
    case "completed":
      return {
        label: "Completed",
        eyebrow: "Well done",
        description:
          "Courses you have finished. Review your achievements or download your certificate.",
        actionLabel: "Review",
        actionIcon: Trophy,
        colorClass: "text-emerald-700",
        badgeVariant: "default" as const,
      };
    case "expired":
      return {
        label: "Expired",
        eyebrow: "Access lapsed",
        description:
          "These enrollments need payment attention to restore access.",
        actionLabel: "Re-enroll",
        actionIcon: RefreshCw,
        colorClass: "text-red-700",
        badgeVariant: "destructive" as const,
      };
  }
}

export default function DashboardEnrolledCourses() {
  const courseHistory = trpc.course.state.useQuery(undefined, {
    enabled: true,
  });

  const categorized = useMemo(() => {
    const records = (courseHistory.data ?? []) as CourseRecord[];
    const groups: Record<CourseStatus, CourseRecord[]> = {
      "not-started": [],
      "in-progress": [],
      completed: [],
      expired: [],
    };

    for (const record of records) {
      const course = courseCatalog.find(
        item => item.slug === record.enrollment.courseSlug
      );
      const status = getCourseStatus(record, course?.modules);
      groups[status].push(record);
    }

    return groups;
  }, [courseHistory.data]);

  const stats = useMemo(() => {
    const records = (courseHistory.data ?? []) as CourseRecord[];
    return {
      total: records.length,
      notStarted: categorized["not-started"].length,
      inProgress: categorized["in-progress"].length,
      completed: categorized["completed"].length,
      expired: categorized["expired"].length,
    };
  }, [courseHistory.data, categorized]);

  const downloadCertificate = async (record: CourseRecord) => {
    const cert = record.certificates[0];
    if (!cert?.fileUrl) {
      toast.error("Certificate unavailable", {
        description: "Please contact support if this persists.",
      });
      return;
    }
    try {
      const response = await fetch(cert.fileUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `certificate-${cert.certificateNumber}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast.success("Certificate downloaded");
    } catch {
      toast.error("Could not download certificate", {
        description: "Please try again or contact support.",
      });
    }
  };

  const shareCertificate = async (record: CourseRecord) => {
    const cert = record.certificates[0];
    if (!cert) return;
    const course = courseCatalog.find(
      item => item.slug === record.enrollment.courseSlug
    );
    const shareData = {
      title: `Profound IQ Consulting - ${course?.title ?? "Course"} completed`,
      text: `I completed ${course?.title ?? "a professional course"} with Profound IQ Consulting.`,
      url: `${window.location.origin}/verify/certificate?certificate=${encodeURIComponent(cert.certificateNumber)}`,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(
          `${shareData.text} ${shareData.url}`
        );
        toast.success("Certificate link copied", {
          description: "Share it with your network or coach.",
        });
      }
    } catch {
      // user cancelled share
    }
  };

  if (courseHistory.isLoading) {
    return (
      <DashboardLayout role="user" title="Enrolled Courses">
        <div className="flex flex-col items-center justify-center gap-3 py-20">
          <RefreshCw className="animate-spin text-accent" size={24} />
          <p className="text-sm font-semibold text-muted-foreground">
            Loading your enrolled courses...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (courseHistory.isError) {
    return (
      <DashboardLayout role="user" title="Enrolled Courses">
        <div
          role="alert"
          className="flex flex-col gap-3 border-l-2 border-red-700 bg-red-50 p-5 text-sm text-red-900 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>Unable to load your enrolled courses.</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => void courseHistory.refetch()}
          >
            Retry
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="user" title="Enrolled Courses">
      <DashboardHero
        showWelcome={false}
        eyebrow="Growth"
        title="Enrolled Courses"
        description="Track your learning progress, access your active courses, and review completed achievements."
        stats={[
          { label: "Not started", value: stats.notStarted },
          { label: "In progress", value: stats.inProgress },
          { label: "Completed", value: stats.completed },
          { label: "Expired", value: stats.expired },
        ]}
      />

      {(
        ["not-started", "in-progress", "completed", "expired"] as CourseStatus[]
      ).map(status => {
        const records = categorized[status];
        const config = getStatusConfig(status);
        const ActionIcon = config.actionIcon;

        if (records.length === 0) return null;

        return (
          <Section
            key={status}
            eyebrow={config.eyebrow}
            title={`${config.label} (${records.length})`}
            description={config.description}
            className="mb-8"
          >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {records.map(record => {
                const course = courseCatalog.find(
                  item => item.slug === record.enrollment.courseSlug
                );
                if (!course) return null;

                const rollup = summarizeCourseEnrollment({
                  stages: record.stages,
                  lessonsCompleted: record.lessons?.length,
                  moduleCount: course.modules.length,
                  stageAmountsKes: course.stageAmountsKes,
                  totalAmountKes: course.priceKes,
                });

                const badges = buildCourseModuleBadges({
                  modules: course.modules,
                  completedLessonIds: (record.lessons ?? []).map(
                    l => l.lessonId
                  ),
                  passedQuizModuleIds: (record.quizAttempts ?? [])
                    .filter(attempt => attempt.passed)
                    .map(attempt => attempt.moduleId),
                });

                const earnedBadges = badges.filter(
                  b => b.status === "earned"
                ).length;
                const latestQuiz = (record.quizAttempts ?? [])
                  .filter(a => a.passed)
                  .sort((a, b) => {
                    const dateA = a.createdAt
                      ? new Date(a.createdAt).getTime()
                      : 0;
                    const dateB = b.createdAt
                      ? new Date(b.createdAt).getTime()
                      : 0;
                    return dateB - dateA;
                  })[0];

                const isExpired = status === "expired";
                const isCompleted = status === "completed";
                const isNotStarted = status === "not-started";

                const minutesRemaining = estimateMinutesRemaining(
                  course,
                  record.lessons?.length ?? 0
                );
                const enrollmentDate = formatEnrollmentDate(
                  record.enrollment.createdAt
                );
                const lastUpdated = formatEnrollmentDate(
                  record.enrollment.updatedAt
                );

                return (
                  <Card
                    key={record.enrollment.id}
                    className={`overflow-hidden border transition-all duration-200 hover:shadow-lg focus-within:shadow-lg ${
                      status === "completed"
                        ? "border-emerald-200 bg-emerald-50/50"
                        : status === "expired"
                          ? "border-red-200 bg-red-50/50"
                          : "border-[#16243d]/15 bg-white"
                    }`}
                  >
                    <div className="relative h-36 overflow-hidden bg-gradient-to-br from-[#16243d] to-[#101d35]">
                      <CourseCoverImage
                        src={course.coverImage}
                        slug={course.slug}
                        alt={course.title}
                        title={course.title}
                        className="h-full w-full object-cover opacity-80"
                        width={480}
                        height={216}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4">
                        <p className="text-[9px] font-black uppercase tracking-[.14em] text-accent-on-dark">
                          {course.category}
                        </p>
                        <h3 className="display mt-1 text-lg leading-tight text-white">
                          {course.title}
                        </h3>
                      </div>
                      {status === "completed" && (
                        <Badge
                          variant="success"
                          className="absolute top-3 right-3 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                        >
                          <Trophy size={12} className="mr-1" />
                          Completed
                        </Badge>
                      )}
                      {status === "expired" && (
                        <Badge
                          variant="destructive"
                          className="absolute top-3 right-3"
                        >
                          Expired
                        </Badge>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-foreground">
                            {rollup.learningPercent}% complete
                          </span>
                          <span className="text-muted-foreground">
                            {rollup.completedModules}/{course.modules.length}{" "}
                            modules
                          </span>
                        </div>
                        <Progress
                          value={rollup.learningPercent}
                          className="h-1.5 transition-all duration-300"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="text-center p-2 bg-[#f7f3e8] rounded-lg transition-colors hover:bg-[#f0e8d0]">
                          <p className="text-[10px] font-black uppercase tracking-[.08em] text-[var(--brand)]">
                            Lessons
                          </p>
                          <p className="mt-1 text-sm font-bold text-foreground">
                            {record.lessons?.length ?? 0}
                          </p>
                        </div>
                        <div className="text-center p-2 bg-[#f7f3e8] rounded-lg transition-colors hover:bg-[#f0e8d0]">
                          <p className="text-[10px] font-black uppercase tracking-[.08em] text-[var(--brand)]">
                            Badges
                          </p>
                          <p className="mt-1 text-sm font-bold text-foreground">
                            {earnedBadges}/{badges.length}
                          </p>
                        </div>
                        <div className="text-center p-2 bg-[#f7f3e8] rounded-lg transition-colors hover:bg-[#f0e8d0]">
                          <p className="text-[10px] font-black uppercase tracking-[.08em] text-[var(--brand)]">
                            Payment
                          </p>
                          <p className="mt-1 text-sm font-bold text-foreground">
                            {rollup.paidStages}/{rollup.totalStages}
                          </p>
                        </div>
                        <div className="text-center p-2 bg-[#f7f3e8] rounded-lg transition-colors hover:bg-[#f0e8d0]">
                          <p className="text-[10px] font-black uppercase tracking-[.08em] text-[var(--brand)]">
                            Est. remaining
                          </p>
                          <p className="mt-1 text-sm font-bold text-foreground">
                            {formatMinutes(minutesRemaining)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 text-[10px] mb-4">
                        <div className="flex items-center gap-1.5 text-[var(--fg-muted)]">
                          <Calendar size={10} />
                          <span>Enrolled {enrollmentDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[var(--fg-muted)]">
                          <Clock3 size={10} />
                          <span>Updated {lastUpdated}</span>
                        </div>
                      </div>
                      {status === "not-started" && (
                        <p className="text-xs text-muted-foreground mb-4">
                          You have not started this course yet. Begin your
                          learning journey today.
                        </p>
                      )}
                      {status === "in-progress" && latestQuiz && (
                        <div className="flex items-center gap-2 mb-3 text-xs">
                          <span className="text-muted-foreground">
                            Latest quiz:
                          </span>
                          <span
                            className={`font-bold ${
                              latestQuiz.passed
                                ? "text-emerald-700"
                                : "text-[var(--brand)]"
                            }`}
                          >
                            {latestQuiz.score}%
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2">
                        <Link href={`/courses/${record.enrollment.courseSlug}`}>
                          <Button
                            variant={
                              status === "completed" || status === "in-progress"
                                ? "primary"
                                : "outline"
                            }
                            size="sm"
                            className={
                              status === "completed" || status === "in-progress"
                                ? "bg-[#16243d] text-[#f7f3e8] hover:bg-[#0f1a2e] transition-colors"
                                : "border-[#16243d]/25 transition-colors hover:border-[var(--brand)]"
                            }
                          >
                            <ActionIcon size={14} className="mr-1.5" />
                            {status === "completed" && record.certificates[0]
                              ? "Review"
                              : config.actionLabel}
                          </Button>
                        </Link>

                        {status === "completed" && record.certificates[0] && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadCertificate(record)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground transition-colors"
                              aria-label="Download certificate"
                            >
                              <Download size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => shareCertificate(record)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground transition-colors"
                              aria-label="Share certificate"
                            >
                              <Share2 size={14} />
                            </Button>
                          </div>
                        )}

                        {status === "expired" && (
                          <Link
                            href={`/courses/${record.enrollment.courseSlug}`}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-300 text-red-700 hover:bg-red-50 transition-colors"
                            >
                              <RefreshCw size={14} className="mr-1.5" />
                              Resume payment
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </Section>
        );
      })}

      {stats.total === 0 && (
        <Section
          eyebrow="Growth"
          title="No enrolled courses"
          description="Start your first professional course to see it here."
        >
          <div className="flex flex-col gap-6 py-12">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f7f3e8] transition-shadow hover:shadow-md">
                <BookOpen size={28} className="text-muted-foreground" />
              </div>
              <p className="text-sm text-foreground max-w-sm">
                You have not enrolled in any courses yet. Explore our professional
                courses to begin your learning journey.
              </p>
              <Link href="/courses">
                <Button variant="brand">Explore courses</Button>
              </Link>
            </div>

            <div className="border-t border-[var(--border)] pt-6">
              <p className="mb-4 text-[10px] font-black uppercase tracking-[.1em] text-[var(--fg-muted)]">
                Popular courses
              </p>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {courseCatalog.slice(0, 3).map(course => (
                  <Card
                    key={course.slug}
                    className="border border-[var(--border)] bg-[var(--bg-card)] p-4 transition-all hover:border-[var(--brand)]/40 hover:shadow-md"
                  >
                    <div className="h-24 rounded-lg border border-[var(--border)] overflow-hidden mb-3">
                      <CourseCoverImage
                        src={course.coverImage}
                        slug={course.slug}
                        alt={course.title}
                        className="h-full w-full object-cover"
                        width={320}
                        height={144}
                      />
                    </div>
                    <h3 className="mb-1 text-sm font-semibold text-[var(--fg)]">
                      {course.title}
                    </h3>
                    <p className="mb-3 text-xs text-[var(--fg-muted)] leading-5">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase tracking-[.1em] text-[var(--fg-muted)]">
                        KES {course.priceKes.toLocaleString()}
                      </span>
                      <Link
                        href={`/courses/${course.slug}`}
                        className="inline-flex items-center gap-1 rounded border border-[var(--brand)]/20 px-2 py-1 text-[10px] font-black uppercase tracking-[.1em] text-[var(--brand)] transition-colors hover:bg-[var(--brand)]/10"
                      >
                        View
                        <ChevronRight size={10} />
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </Section>
      )}
    </DashboardLayout>
  );
}

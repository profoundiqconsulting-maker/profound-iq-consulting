import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useMemo } from "react";
import {
  ArrowLeft,
  BookOpen,
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
import { useLocale } from "@/contexts/LocaleContext";
import {
  DashboardHero,
  Section,
  StatCard,
  FilterBar,
} from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { courseCatalog } from "@shared/courseCatalog";
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

function getCourseStatus(record: CourseRecord, courseModules: { id: string; title: string; lessons: Array<{ id: string }> }[] | undefined): CourseStatus {
  const hasLessons = (record.lessons?.length ?? 0) > 0;
  const hasPassedQuiz = (record.quizAttempts ?? []).some(attempt => attempt.passed);
  const hasCertificate = (record.certificates?.length ?? 0) > 0;
  const hasFailedPayment = (record.stages ?? []).some(
    stage => stage.paymentStatus === "failed" || stage.paymentStatus === "cancelled"
  );
  const allStagesPaid = (record.stages ?? []).length >= 4 &&
    record.stages.every(stage => stage.paymentStatus === "paid");

  if (hasFailedPayment && !allStagesPaid) return "expired";
  if (!hasLessons && !hasPassedQuiz) return "not-started";

  const modules = courseModules ?? [];
  const badges = buildCourseModuleBadges({
    modules: modules.map(m => ({ id: m.id, title: m.title, lessons: m.lessons })),
    completedLessonIds: (record.lessons ?? []).map(l => l.lessonId),
    passedQuizModuleIds: (record.quizAttempts ?? [])
      .filter(attempt => attempt.passed)
      .map(attempt => attempt.moduleId),
  });

  const allModulesEarned = badges.length > 0 && badges.every(badge => badge.status === "earned");
  if (allModulesEarned && hasCertificate) return "completed";

  return "in-progress";
}

function getStatusConfig(status: CourseStatus) {
  switch (status) {
    case "not-started":
      return {
        label: "Not Started",
        eyebrow: "Ready to begin",
        description: "Courses you have enrolled in but have not yet started learning.",
        actionLabel: "Start course",
        actionIcon: BookOpen,
        colorClass: "text-muted-foreground",
        badgeVariant: "secondary" as const,
      };
    case "in-progress":
      return {
        label: "In Progress",
        eyebrow: "Keep going",
        description: "Courses you are actively working through. Pick up where you left off.",
        actionLabel: "Continue",
        actionIcon: ChevronRight,
        colorClass: "text-[#7d5e1e]",
        badgeVariant: "default" as const,
      };
    case "completed":
      return {
        label: "Completed",
        eyebrow: "Well done",
        description: "Courses you have finished. Review your achievements or download your certificate.",
        actionLabel: "Review",
        actionIcon: Trophy,
        colorClass: "text-emerald-700",
        badgeVariant: "default" as const,
      };
    case "expired":
      return {
        label: "Expired",
        eyebrow: "Access lapsed",
        description: "These enrollments need payment attention to restore access.",
        actionLabel: "Re-enroll",
        actionIcon: RefreshCw,
        colorClass: "text-red-700",
        badgeVariant: "destructive" as const,
      };
  }
}

export default function DashboardEnrolledCourses() {
  const { t } = useLocale();
  const courseHistory = trpc.course.state.useQuery(undefined, { enabled: true });

  const categorized = useMemo(() => {
    const records = (courseHistory.data ?? []) as CourseRecord[];
    const groups: Record<CourseStatus, CourseRecord[]> = {
      "not-started": [],
      "in-progress": [],
      "completed": [],
      "expired": [],
    };

    for (const record of records) {
      const course = courseCatalog.find(item => item.slug === record.enrollment.courseSlug);
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
    const course = courseCatalog.find(item => item.slug === record.enrollment.courseSlug);
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
          <p className="text-sm font-semibold text-muted-foreground">Loading your enrolled courses...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (courseHistory.isError) {
    return (
      <DashboardLayout role="user" title="Enrolled Courses">
        <div className="border-l-2 border-red-700 bg-red-50 p-5 text-sm text-red-900 dark:bg-red-950/40 dark:text-red-200">
          Unable to load your enrolled courses. Please try again.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="user" title="Enrolled Courses">
      <DashboardHero
        eyebrow="Growth"
        title="Enrolled Courses"
        description="Track your learning progress, access your active courses, and review completed achievements."
        stats={[
          { label: "Total enrolled", value: stats.total },
          { label: "In progress", value: stats.inProgress },
          { label: "Completed", value: stats.completed },
          { label: "Expired", value: stats.expired },
        ]}
      />

      {(["not-started", "in-progress", "completed", "expired"] as CourseStatus[]).map(status => {
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
                  completedLessonIds: (record.lessons ?? []).map(l => l.lessonId),
                  passedQuizModuleIds: (record.quizAttempts ?? [])
                    .filter(attempt => attempt.passed)
                    .map(attempt => attempt.moduleId),
                });

                const earnedBadges = badges.filter(b => b.status === "earned").length;
                const latestQuiz = (record.quizAttempts ?? [])
                  .filter(a => a.passed)
                  .sort((a, b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return dateB - dateA;
                  })[0];

                const isExpired = status === "expired";
                const isCompleted = status === "completed";
                const isNotStarted = status === "not-started";

                return (
                  <Card
                    key={record.enrollment.id}
                    className={`overflow-hidden border transition-all duration-200 hover:shadow-lg hover:-translate-y-1 focus-within:shadow-lg ${
                      status === "completed"
                        ? "border-emerald-200 bg-emerald-50/50"
                        : status === "expired"
                          ? "border-red-200 bg-red-50/50"
                          : "border-[#16243d]/15 bg-white"
                    }`}
                  >
                    <div className="relative h-36 overflow-hidden bg-gradient-to-br from-[#16243d] to-[#101d35]">
                      {course.coverImage && (
                        <img
                          src={course.coverImage}
                          alt={course.title}
                          className="h-full w-full object-cover opacity-80 transition-transform duration-300 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4">
                         <p className="text-[9px] font-black uppercase tracking-[.14em] text-accent-on-dark dark:text-gold-on-light">
                          {course.category}
                        </p>
                        <h3 className="display mt-1 text-lg leading-tight text-white">
                          {course.title}
                        </h3>
                      </div>
                      {status === "completed" && (
                        <Badge
                          variant="default"
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
                            {rollup.completedModules}/{course.modules.length} modules
                          </span>
                        </div>
                        <Progress value={rollup.learningPercent} className="h-1.5 transition-all duration-300" />
                      </div>

                        <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="text-center p-2 bg-[#f7f3e8] rounded-lg transition-colors hover:bg-[#f0e8d0]">
                          <p className="text-[10px] font-black uppercase tracking-[.08em] text-accent dark:text-accent-on-dark">
                            Lessons
                          </p>
                          <p className="mt-1 text-sm font-bold text-foreground">
                            {record.lessons?.length ?? 0}
                          </p>
                        </div>
                        <div className="text-center p-2 bg-[#f7f3e8] rounded-lg transition-colors hover:bg-[#f0e8d0]">
                          <p className="text-[10px] font-black uppercase tracking-[.08em] text-accent dark:text-accent-on-dark">
                            Badges
                          </p>
                          <p className="mt-1 text-sm font-bold text-foreground">
                            {earnedBadges}/{badges.length}
                          </p>
                        </div>
                        <div className="text-center p-2 bg-[#f7f3e8] rounded-lg transition-colors hover:bg-[#f0e8d0]">
                          <p className="text-[10px] font-black uppercase tracking-[.08em] text-accent dark:text-accent-on-dark">
                            Payment
                          </p>
                          <p className="mt-1 text-sm font-bold text-foreground">
                            {rollup.paidStages}/{rollup.totalStages}
                          </p>
                        </div>
                      </div>

                      {status === "not-started" && (
                        <p className="text-xs text-muted-foreground mb-4">
                          You have not started this course yet. Begin your learning journey today.
                        </p>
                      )}
                      {status === "in-progress" && latestQuiz && (
                        <div className="flex items-center gap-2 mb-3 text-xs">
                          <span className="text-muted-foreground">Latest quiz:</span>
                          <span className={`font-bold ${latestQuiz.passed ? "text-emerald-700" : "text-[#7d5e1e]"}`}>
                            {latestQuiz.score}%
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2">
                        <Link href={`/courses/${record.enrollment.courseSlug}`}>
                          <Button
                            variant={status === "completed" || status === "in-progress" ? "default" : "outline"}
                            size="sm"
                            className={
                              status === "completed" || status === "in-progress"
                                ? "bg-[#16243d] text-[#f7f3e8] hover:bg-[#0f1a2e] transition-colors"
                                : "border-[#16243d]/25 transition-colors hover:border-[#c9a34e]"
                            }
                          >
                            <ActionIcon size={14} className="mr-1.5" />
                            {status === "completed" && record.certificates[0] ? "Review" : config.actionLabel}
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
                          <Link href={`/courses/${record.enrollment.courseSlug}`}>
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
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f7f3e8] dark:bg-[#16243d] transition-transform hover:scale-110">
              <BookOpen size={28} className="text-muted-foreground" />
            </div>
            <p className="text-sm text-foreground max-w-sm">
              You have not enrolled in any courses yet. Explore our professional courses to begin your learning journey.
            </p>
            <Link href="/courses">
              <Button className="bg-[#16243d] text-[#f7f3e8] hover:bg-[#0f1a2e] transition-colors">
                Explore courses
              </Button>
            </Link>
          </div>
        </Section>
      )}
    </DashboardLayout>
  );
}

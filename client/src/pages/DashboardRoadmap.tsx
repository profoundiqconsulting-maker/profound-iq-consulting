import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { toast } from "sonner";
import { BookOpen, CheckCircle2, Trash2, TrendingUp } from "lucide-react";
import { DashboardHero, Section, StatCard } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressMotionBar } from "@/components/ProgressMotion";
import { CourseEnrollmentForm } from "@/components/CourseEnrollmentForm";
import { useState } from "react";

type RoadmapItem = {
  courseSlug: string;
  title: string;
  category: string;
  skillLevel: string;
  duration: string;
  priceKes: number;
  discountedPriceKes: number;
  discountApplied: boolean;
  enrolled: boolean;
  completedLessons: number;
  totalLessons: number;
  progress: number;
};

export default function DashboardRoadmap() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const query = trpc.roadmap.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const remove = trpc.roadmap.remove.useMutation({
    onMutate: async ({ courseSlug }) => {
      await utils.roadmap.list.cancel();
      const previous = utils.roadmap.list.getData();
      utils.roadmap.list.setData(undefined, current =>
        current
          ? {
              ...current,
              items: current.items.filter(
                item => item.courseSlug !== courseSlug
              ),
            }
          : current
      );
      return { previous };
    },
    onError: (error, _input, context) => {
      if (context?.previous) {
        utils.roadmap.list.setData(undefined, context.previous);
      }
      toast.error("Could not update your roadmap", {
        description: error.message,
      });
    },
    onSuccess: () => {
      toast.success("Removed from your roadmap");
    },
    onSettled: () => {
      void utils.roadmap.list.invalidate();
    },
  });

  const items = (query.data?.items ?? []) as RoadmapItem[];
  const discountActive = Boolean(query.data?.discountActive);
  const enrolledCount = items.filter(item => item.enrolled).length;
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [enrollCourseSlug, setEnrollCourseSlug] = useState("");
  const avgProgress = items.length
    ? Math.round(
        items.reduce((sum, item) => sum + item.progress, 0) / items.length
      )
    : 0;

  return (
    <DashboardLayout role="user" title="My Roadmap">
      <DashboardHero
        showWelcome={false}
        eyebrow="Personalized development"
        title="Your improvement roadmap"
        description="Courses picked from your assessment, tracked in one place. Enroll in two or more to unlock 10% off each course."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Courses in plan"
          value={
            query.isError
              ? "Unavailable"
              : query.isLoading
                ? "—"
                : String(items.length)
          }
          icon={<BookOpen size={16} />}
        />
        <StatCard
          label="Enrolled"
          value={
            query.isError
              ? "Unavailable"
              : query.isLoading
                ? "—"
                : String(enrolledCount)
          }
          icon={<CheckCircle2 size={16} />}
        />
        <StatCard
          label="Avg progress"
          value={
            query.isError
              ? "Unavailable"
              : query.isLoading || !items.length
                ? "—"
                : `${avgProgress}%`
          }
          icon={<TrendingUp size={16} />}
        />
      </div>

      {discountActive && (
        <div className="mt-6 rounded-xl border border-[var(--success)]/40 bg-[var(--success)]/10 px-4 py-3 text-sm font-semibold text-[var(--success)]">
          10% multi-course discount unlocked — applied to each course at
          checkout.
        </div>
      )}

      <Section
        className="mt-8"
        title="Your courses"
        description="Progress updates as you complete lessons."
      >
        {query.isLoading ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            Loading your roadmap…
          </p>
        ) : query.isError ? (
          <div
            role="alert"
            className="flex flex-col gap-3 border-l-2 border-red-700 bg-red-50 p-5 text-sm text-red-900 sm:flex-row sm:items-center sm:justify-between"
          >
            <p>Your roadmap could not be loaded.</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => void query.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : items.length === 0 ? (
          <Card className="border-[var(--border)] bg-[var(--card)]">
            <CardContent className="p-8 text-center">
              <BookOpen
                size={40}
                className="mx-auto text-[var(--muted-foreground)]"
              />
              <h3 className="text-display text-xl font-semibold mt-4 text-[var(--navy-deep)]">
                Your roadmap is empty
              </h3>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                Add recommended courses from your assessment report to start
                tracking progress.
              </p>
              <Link href="/assessment" className="mt-4 inline-block">
                <Button variant="brand" size="sm">
                  Go to assessment
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map(item => (
              <Card
                key={item.courseSlug}
                className="border-[var(--border)] bg-[var(--card)]"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge
                        variant="subtle"
                        className="text-[10px] uppercase tracking-[.1em]"
                      >
                        {item.category}
                      </Badge>
                      <h3 className="mt-2 text-lg font-bold text-[var(--navy-deep)]">
                        {item.title}
                      </h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={remove.isPending}
                      aria-label={`Remove ${item.title} from roadmap`}
                      onClick={() =>
                        remove.mutate({ courseSlug: item.courseSlug })
                      }
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>

                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-[.12em] text-[var(--muted-foreground)]">
                      <span>
                        {item.completedLessons} of {item.totalLessons} lessons
                      </span>
                      <span>{item.progress}%</span>
                    </div>
                    <ProgressMotionBar value={item.progress} height={8} />
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="text-sm">
                      {item.discountApplied ? (
                        <span className="font-bold text-[var(--success)]">
                          KES {item.discountedPriceKes.toLocaleString()}{" "}
                          <span className="text-[10px] uppercase line-through text-[var(--muted-foreground)] ml-1">
                            {item.priceKes.toLocaleString()}
                          </span>
                        </span>
                      ) : (
                        <span className="font-bold text-[var(--brand)]">
                          KES {item.priceKes.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {item.enrolled ? (
                      <Link
                        href={`/courses/${item.courseSlug}?workspace=1`}
                      >
                        <Button variant="brand" size="sm">
                          Continue
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEnrollCourseSlug(item.courseSlug);
                          setEnrollOpen(true);
                        }}
                      >
                        Enroll
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Section>

      <CourseEnrollmentForm
        courseSlug={enrollCourseSlug}
        open={enrollOpen}
        onOpenChange={setEnrollOpen}
        className="mt-0 !whitespace-nowrap !text-xs !leading-none !tracking-normal"
      />

    </DashboardLayout>
  );
}

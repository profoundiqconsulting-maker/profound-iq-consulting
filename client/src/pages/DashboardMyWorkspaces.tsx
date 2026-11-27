import { useMemo } from "react";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { DashboardHero, Section, StatCard } from "@/components/dashboard";
import { DashboardSectionContent } from "@/components/DashboardSection";
import { courseCatalog } from "@shared/courseCatalog";

import { BookOpen, ChevronRight, Layers3, ListChecks } from "lucide-react";

export default function DashboardMyWorkspaces() {
  const courses = useMemo(() => courseCatalog, []);
  const moduleCount = courses.reduce(
    (total, course) => total + course.modules.length,
    0
  );
  const lessonCount = courses.reduce(
    (total, course) =>
      total +
      course.modules.reduce(
        (moduleTotal, module) => moduleTotal + module.lessons.length,
        0
      ),
    0
  );

  return (
    <DashboardLayout role="user" title="Course Workspaces">
      <DashboardHero
        showWelcome={false}
        eyebrow="Learning"
        title="Course workspaces"
        description="Browse available learning spaces. Your enrolled courses page focuses on courses you have already joined."
        stats={[
          {
            label: "Available courses",
            value: courses.length,
            icon: <BookOpen size={18} />,
          },
          {
            label: "Modules",
            value: moduleCount,
            icon: <Layers3 size={18} />,
          },
          {
            label: "Lessons",
            value: lessonCount,
            icon: <ListChecks size={18} />,
          },
        ]}
      />

      <Section
        eyebrow="Course catalog"
        title="Choose a workspace"
        description="Open a course to review its learning materials and saved progress."
        className="mb-8"
      >
        <DashboardSectionContent>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {courses.map(course => (
              <Link
                key={course.slug}
                href={`/courses/${course.slug}?workspace=1`}
                className="group border border-[var(--border)] bg-[var(--bg-card)] p-5 transition-all hover:border-[var(--brand)]/40 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black uppercase tracking-[.1em] text-[var(--fg-muted)]">
                      {course.duration}
                    </p>
                    <h3 className="mt-1 display text-xl leading-tight text-[var(--fg)]">
                      {course.title}
                    </h3>
                    <p className="mt-2 text-xs leading-5 text-[var(--fg-muted)]">
                      {course.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 gap-y-1 text-[10px] font-black uppercase tracking-[.1em] text-[var(--fg-muted)]">
                      <span>{course.modules.length} modules</span>
                      <span>
                        {course.modules.reduce(
                          (sum, m) => sum + m.lessons.length,
                          0
                        )}{" "}
                        lessons
                      </span>
                      <span>KES {course.priceKes.toLocaleString()}</span>
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    className="mt-1 shrink-0 text-[var(--fg-muted)] transition-transform group-hover:translate-x-1"
                  />
                </div>
              </Link>
            ))}
          </div>
        </DashboardSectionContent>
      </Section>
    </DashboardLayout>
  );
}

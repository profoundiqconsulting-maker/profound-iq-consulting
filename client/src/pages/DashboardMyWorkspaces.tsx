import { useMemo } from "react";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { DashboardHero, Section, StatCard } from "@/components/dashboard";
import { courseCatalog } from "@shared/courseCatalog";

import { BookOpen, ChevronRight, Clock3, PlayCircle } from "lucide-react";

export default function DashboardMyWorkspaces() {
  const courses = useMemo(() => courseCatalog, []);

  return (
    <DashboardLayout role="user" title="My Workspaces">
      <DashboardHero
        eyebrow="Workspace"
        title="My Workspaces"
        description="Open any course workspace to continue learning, review illustrations, and track your progress."
        stats={[
          { label: "Available", value: courses.length, icon: <BookOpen size={18} /> },
          { label: "Flexible access", value: "Self-paced", icon: <Clock3 size={18} /> },
          { label: "Support", value: "Online", icon: <PlayCircle size={18} /> },
        ]}
      />

      <Section
        eyebrow="Courses"
        title="All workspaces"
        description="Choose a course to open its dedicated workspace. Your progress is saved per course."
        className="mb-8"
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map(course => (
            <Link
              key={course.slug}
              href={`/courses/${course.slug}?workspace=1`}
              className="group border border-[#16243d]/10 bg-white/80 p-5 transition-all hover:border-[#c9a34e]/40 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[.1em] text-[#7d5e1e]">
                    {course.duration}
                  </p>
                  <h3 className="mt-1 display text-xl leading-tight">
                    {course.title}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-[#4a566a]">
                    {course.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-black uppercase tracking-[.1em] text-[#7d5e1e]">
                    <span>{course.modules.length} modules</span>
                    <span>{course.modules.reduce((sum, m) => sum + m.lessons.length, 0)} lessons</span>
                    <span>KES {course.priceKes.toLocaleString()}</span>
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  className="mt-1 shrink-0 text-[#7d5e1e] transition-transform group-hover:translate-x-1"
                />
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </DashboardLayout>
  );
}

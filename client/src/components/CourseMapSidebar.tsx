import {
  CheckCircle2,
  ChevronDown,
  LockKeyhole,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { canAccessModuleLessons } from "@shared/courseAccess";
import type { CourseDefinition } from "@shared/courseCatalog";

type CourseProgress = {
  lessons: string[];
};

type CourseMapSidebarProps = {
  course: CourseDefinition;
  progress: CourseProgress;
  moduleIndex: number;
  expandedModuleIndex: number;
  courseNavOpen: boolean;
  effectiveStageCount: number;
  accessOverride: boolean;
  activeLessonId: string | null;
  onToggleCourseNav: () => void;
  onToggleModule: (index: number) => void;
  onSelectLesson: (lessonId: string, moduleIndex: number) => void;
};

export function CourseMapSidebar({
  course,
  progress,
  moduleIndex,
  expandedModuleIndex,
  courseNavOpen,
  effectiveStageCount,
  accessOverride,
  activeLessonId,
  onToggleCourseNav,
  onToggleModule,
  onSelectLesson,
}: CourseMapSidebarProps) {
  return (
    <aside
      aria-label="Course modules and lessons"
      className={`order-first lg:sticky lg:top-24 lg:self-start ${courseNavOpen ? "" : "lg:w-14"}`}
    >
      <div className="border border-[#16243d]/15 bg-white/70 shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-[#16243d]/10 p-4">
          {courseNavOpen && (
            <div>
              <p className="eyebrow text-[#7d5e1e]">Course map</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Jump to a module or lesson
              </p>
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onToggleCourseNav}
            aria-expanded={courseNavOpen}
            aria-controls="course-map-navigation"
            aria-label={
              courseNavOpen
                ? "Collapse course navigation"
                : "Expand course navigation"
            }
            className="ml-auto shrink-0"
          >
            {courseNavOpen ? (
              <PanelLeftClose size={16} />
            ) : (
              <PanelLeftOpen size={16} />
            )}
          </Button>
        </div>
        {courseNavOpen ? (
          <nav
            id="course-map-navigation"
            className="max-h-[calc(100vh-10rem)] overflow-y-auto p-2"
          >
            {course.modules.map((module, index) => {
              const locked = !canAccessModuleLessons({
                moduleIndex: index,
                paidStages: effectiveStageCount,
                isQualityControlAdmin: accessOverride,
              });
              const expanded = expandedModuleIndex === index;
              const moduleComplete = module.lessons.every(lesson =>
                progress.lessons.includes(lesson.id)
              );
              return (
                <div
                  key={module.id}
                  className="border-b border-[#16243d]/10 last:border-b-0"
                >
                  <button
                    type="button"
                    onClick={() => onToggleModule(index)}
                    aria-expanded={expanded}
                    aria-controls={`course-module-${module.id}`}
                    className={`flex w-full items-center gap-2 px-2 py-3 text-left text-xs transition-colors hover:bg-[#fffaf0] ${moduleIndex === index ? "bg-[#fffaf0] text-[#7d5e1e]" : "text-[#4a566a]"}`}
                  >
                    <span className="grid h-6 w-6 shrink-0 place-items-center border border-[#c9a34e]/60 text-[10px] font-black text-[#7d5e1e]">
                      {moduleComplete ? (
                        <CheckCircle2 size={13} />
                      ) : (
                        String(index + 1).padStart(2, "0")
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold">
                        {module.title}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-muted-foreground">
                        {module.lessons.length} lessons
                        {locked ? " · Payment required" : ""}
                      </span>
                    </span>
                    {locked ? (
                      <LockKeyhole
                        size={13}
                        className="shrink-0 text-muted-foreground"
                      />
                    ) : (
                      <ChevronDown
                        size={14}
                        className={`shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
                      />
                    )}
                  </button>
                  {expanded && (
                    <ol
                      id={`course-module-${module.id}`}
                      className="mb-2 space-y-1 pl-4 pr-2"
                    >
                      {module.lessons.map((lesson, lessonIndex) => {
                        const completed = progress.lessons.includes(lesson.id);
                        const active = activeLessonId === lesson.id;
                        return (
                          <li key={lesson.id}>
                            <button
                              type="button"
                              onClick={() => onSelectLesson(lesson.id, index)}
                              aria-current={active ? "step" : undefined}
                              className={`flex w-full items-start gap-2 border-l-2 px-2 py-2 text-left text-[11px] leading-4 transition-colors hover:border-[#c9a34e] hover:bg-[#fffaf0] ${active ? "border-[#c9a34e] bg-[#fffaf0] font-bold text-[#7d5e1e]" : completed ? "border-[#c9a34e]/60 text-[#4a566a]" : "border-[#16243d]/10 text-muted-foreground"}`}
                            >
                              <span className="mt-0.5 w-5 shrink-0 font-black text-[#7d5e1e]">
                                {completed ? "✓" : `${lessonIndex + 1}.`}
                              </span>
                              <span className="min-w-0 flex-1">
                                {lesson.title}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </div>
              );
            })}
          </nav>
        ) : (
          <div className="hidden p-2 text-center text-[9px] font-black uppercase tracking-[.12em] text-muted-foreground lg:block">
            <span className="[writing-mode:vertical-rl]">Course map</span>
          </div>
        )}
      </div>
    </aside>
  );
}

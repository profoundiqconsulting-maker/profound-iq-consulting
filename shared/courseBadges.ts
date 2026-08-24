export type ModuleBadgeStatus = "earned" | "in-progress" | "locked";

export type CourseBadgeModule = {
  id: string;
  title: string;
  lessons: Array<{ id: string }>;
};

export type CourseModuleBadge = {
  moduleId: string;
  moduleIndex: number;
  title: string;
  completedLessons: number;
  totalLessons: number;
  quizPassed: boolean;
  status: ModuleBadgeStatus;
  label: string;
};

export function buildCourseModuleBadges(input: { modules: CourseBadgeModule[]; completedLessonIds: readonly string[]; passedQuizModuleIds: readonly string[] }): CourseModuleBadge[] {
  const completed = new Set(input.completedLessonIds);
  const passed = new Set(input.passedQuizModuleIds);
  return input.modules.map((module, moduleIndex) => {
    const completedLessons = module.lessons.filter((lesson) => completed.has(lesson.id)).length;
    const quizPassed = passed.has(module.id);
    const earned = completedLessons === module.lessons.length && quizPassed;
    return {
      moduleId: module.id,
      moduleIndex,
      title: module.title,
      completedLessons,
      totalLessons: module.lessons.length,
      quizPassed,
      status: earned ? "earned" : completedLessons > 0 || quizPassed ? "in-progress" : "locked",
      label: earned ? "Badge earned" : completedLessons > 0 || quizPassed ? "In progress" : "Not started",
    };
  });
}

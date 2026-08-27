import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { assessmentQuestions, ASSESSMENT_PRICE_KES, buildReport, buildRoleLens, compareReports } from "../shared/assessment";
import { courseCatalog, COURSE_PASS_MARK, COURSE_PRICE_KES, COURSE_STAGE_AMOUNT_KES } from "../shared/courseCatalog";

const assessmentPageSource = readFileSync(resolve(process.cwd(), "client/src/pages/Assessment.tsx"), "utf8");
const coursesPageSource = readFileSync(resolve(process.cwd(), "client/src/pages/Courses.tsx"), "utf8");
const userDashboardSource = readFileSync(resolve(process.cwd(), "client/src/pages/UserDashboard.tsx"), "utf8");
const courseWorkspaceSource = readFileSync(resolve(process.cwd(), "client/src/pages/CourseWorkspace.tsx"), "utf8");

describe("professional course curriculum", () => {
  it("provides ten modules, seven lessons, required response tasks, and fifteen quiz questions per course module", () => {
    expect(courseCatalog).toHaveLength(33);
    expect(COURSE_PRICE_KES).toBe(4999);
    expect(COURSE_STAGE_AMOUNT_KES).toBe(1250);
    expect(COURSE_PASS_MARK).toBe(50);
    for (const course of courseCatalog) {
      expect(course.modules).toHaveLength(10);
      expect(course.modules.every((module) => Array.isArray(module.lessons))).toBe(true);
      expect(course.modules.every((module) => module.lessons.length === 7)).toBe(true);
      expect(course.modules.every((module) => Array.isArray(module.quiz))).toBe(true);
      expect(course.modules.every((module) => module.quiz.length === 15)).toBe(true);
      expect(course.modules.every((module) => module.lessons.every((lesson) => lesson.summary.length > 30 && lesson.durationMinutes === 30 && lesson.deepDive.length > 120 && lesson.responseTasks.length >= 3 && lesson.responseTasks.every((task) => task.required)))).toBe(true);
    }
    const icpc = courseCatalog.find((course) => course.slug === "professional-certificate-international-curriculum-pedagogy");
    expect(icpc).toBeDefined();
    expect(icpc?.priceKes).toBe(14999);
    expect(icpc?.stageAmountsKes).toEqual([3750, 3750, 3750, 3749]);
    expect(icpc?.modules.map((module) => module.title)).toEqual(["1. Modern Pedagogy And Learner-Centred Practice", "2. British National Curriculum", "3. International Baccalaureate", "4. American Curriculum", "5. Cambridge And IGCSE", "6. Christian Education And Homeschooling", "7. Pearson Edexcel And Comparative Curriculum Design", "8. Early Years And Integrated Approaches", "9. Counselling, Law, Professionalism And Entrepreneurship", "10. Research, Technology And Assessment"]);
    expect(icpc?.modules.every((module) => module.quiz.every((question) => question.explanation.length > 30))).toBe(true);
  });
});

describe("course discovery and student dashboard", () => {
  it("exposes catalog search and category filtering with a no-match reset", () => {
    expect(coursesPageSource).toMatch(/searchCourses|Search courses, topics, or outcomes/);
    expect(coursesPageSource).toMatch(/allCategories|All categories/);
    expect(coursesPageSource).toMatch(/filteredCourses/);
    expect(coursesPageSource).toMatch(/noCourseMatch|No courses match that search/);
    expect(coursesPageSource).toMatch(/clearFilters|Clear filters/);
  });

  it("exposes progress, quiz performance, and upcoming installment schedule cards", () => {
    expect(userDashboardSource).toMatch(/Student course dashboard/);
    expect(userDashboardSource).toMatch(/Quiz performance/);
    expect(userDashboardSource).toMatch(/Upcoming installment/);
    expect(userDashboardSource).toMatch(/learningPercent/);
    expect(userDashboardSource).toMatch(/amountKes/);
    expect(userDashboardSource).toMatch(/Before Module 1/);
  });
});

describe("timed course lessons", () => {
  it("exposes a 30-minute countdown, required responses, quiz locking, and sequential next-lesson gate", () => {
    expect(courseWorkspaceSource).toMatch(/1800/);
    expect(courseWorkspaceSource).toMatch(/30-minute study timer/);
    expect(courseWorkspaceSource).toMatch(/role="timer"/);
    expect(courseWorkspaceSource).toMatch(/lessonTimers/);
    expect(courseWorkspaceSource).toMatch(/Finish the previous lesson first/);
    expect(courseWorkspaceSource).toMatch(/disabled=\{!activeLessonTimerComplete/);
    expect(courseWorkspaceSource).toMatch(/The next lesson unlocks when the 30-minute timer reaches zero/);
    expect(courseWorkspaceSource).toMatch(/lessonResponsesComplete/);
    expect(courseWorkspaceSource).toMatch(/quizOpen/);
    expect(courseWorkspaceSource).toMatch(/disabled=\{!progress\.lessons\.includes/);
    expect(courseWorkspaceSource).toMatch(/learnerReviewMap/);
    expect(courseWorkspaceSource).toMatch(/Instructor feedback/);
    expect(courseWorkspaceSource).toMatch(/review\?\.status === "reviewed"/);
  });

  it("exposes staff review analytics and intuitive course/date filters", () => {
    const staffDashboardSource = readFileSync(resolve(process.cwd(), "client/src/pages/StaffDashboard.tsx"), "utf8");
    expect(staffDashboardSource).toMatch(/reviewAnalytics/);
    expect(staffDashboardSource).toMatch(/Filter response review by course/);
    expect(staffDashboardSource).toMatch(/type="date"/);
    expect(staffDashboardSource).toMatch(/By course/);
    expect(staffDashboardSource).toMatch(/By module/);
  });
});

describe("assessment scoring", () => {
  it("exposes 100 questions across ten capability dimensions", () => {
    expect(ASSESSMENT_PRICE_KES).toBe(399);
    expect(assessmentQuestions).toHaveLength(100);
    expect(new Set(assessmentQuestions.map((question) => question.dimension)).size).toBe(10);
    expect(Math.ceil(assessmentQuestions.length / 10)).toBe(10);
  });

  it("builds a report from submitted five-point answers", () => {
    const report = buildReport(assessmentQuestions.map((question) => ({ questionId: question.id, value: 5 })));
    expect(report.overallScore).toBe(100);
    expect(report.overallBand).toBe("Strong foundation");
    expect(report.dimensions.every((dimension) => dimension.score === 100)).toBe(true);
    expect(report.dimensions.every((dimension) => dimension.readout.length > 120 && Array.isArray(dimension.reflectionPoints))).toBe(true);
    expect(report.dimensions.filter((dimension) => dimension.reflectionPoints.length === 3)).toHaveLength(10);
    expect(report.dimensions.every((dimension) => dimension.reflectionPoints.every((point) => point.trim().length > 50))).toBe(true);
    expect(report.dimensions.find((dimension) => dimension.key === "clarity")?.reflectionPoints[0]).toMatch(/competing priority|focus/i);
    expect(report.dimensions.find((dimension) => dimension.key === "resilience")?.reflectionPoints[0]).toMatch(/pressure|judgment/i);
    expect(report.reflectionPoints).toHaveLength(4);
    expect(report.importantContext).toHaveLength(4);
    expect(report.importantContext.join(" ")).toMatch(/point-in-time|professional decisions/i);
    expect(report.disclaimer).toMatch(/not a clinical/i);
  });

  it("protects local draft actions and supports accessible module navigation", () => {
    expect(assessmentPageSource).toMatch(/Clear saved data\?/);
    expect(assessmentPageSource).toMatch(/event\.key === "ArrowLeft"/);
    expect(assessmentPageSource).toMatch(/event\.key === "ArrowRight"/);
    expect(assessmentPageSource).toMatch(/assessmentModules\[localDraft\.currentModule\]/);
    expect(assessmentPageSource).toMatch(/% complete/);
    expect(assessmentPageSource).toMatch(/Saved progress/);
    expect(assessmentPageSource).toMatch(/Moved to/);
    expect(assessmentPageSource).toMatch(/Download current progress/);
    expect(assessmentPageSource).toMatch(/application\/json/);
    expect(assessmentPageSource).toMatch(/resume-progress-fill/);
    expect(assessmentPageSource).toMatch(/event\.key === "Escape"/);
    expect(assessmentPageSource).toMatch(/toast\.dismiss\(\)/);
    expect(assessmentPageSource).toMatch(/piq-assessment-skip-resume-prompt/);
    expect(assessmentPageSource).toMatch(/Don’t show this again; always start fresh/);
    expect(assessmentPageSource).toMatch(/modules completed/);
    expect(assessmentPageSource).toMatch(/resume-celebration/);
    expect(assessmentPageSource).toMatch(/All modules complete/);
    expect(assessmentPageSource).toMatch(/const importProgress/);
    expect(assessmentPageSource).toMatch(/Import Progress/);
    expect(assessmentPageSource).toMatch(/Open assessment settings/);
    expect(assessmentPageSource).toMatch(/Share Results/);
    expect(assessmentPageSource).toMatch(/onDrop=/);
    expect(assessmentPageSource).toMatch(/Drop a JSON progress file here/);
    expect(assessmentPageSource).toMatch(/Manage resume preferences/);
    expect(assessmentPageSource).toMatch(/Review imported progress/);
    expect(assessmentPageSource).toMatch(/Use this progress/);
    expect(assessmentPageSource).toMatch(/completion-certificate/);
    expect(assessmentPageSource).toMatch(/wa\.me/);
    expect(assessmentPageSource).toMatch(/mailto:/);

  });

  it("exposes the Transformation Services grouping and CareerPath completion actions", () => {
    const homePageSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
    const careerPathSource = readFileSync(resolve(process.cwd(), "client/src/pages/CareerPath.tsx"), "utf8");
    expect(homePageSource).toMatch(/const transformationServices/);
    expect(homePageSource).toMatch(/Transformation services/);
    expect(homePageSource).toMatch(/Self Assessment/);
    expect(homePageSource).toMatch(/CareerPath/);
    expect(careerPathSource).toMatch(/downloadCompletionCertificate/);
    expect(careerPathSource).toMatch(/shareResult/);
    expect(careerPathSource).toMatch(/WhatsApp/);
    expect(careerPathSource).toMatch(/Email/);
  });

  it("uses one shared navigation across Transformation Services", () => {
    const navSource = readFileSync(resolve(process.cwd(), "client/src/components/TransformationNav.tsx"), "utf8");
    const assessmentSource = readFileSync(resolve(process.cwd(), "client/src/pages/Assessment.tsx"), "utf8");
    const careerPathSource = readFileSync(resolve(process.cwd(), "client/src/pages/CareerPath.tsx"), "utf8");
    expect(navSource).toMatch(/Self Assessment/);
    expect(navSource).toMatch(/CareerPath/);
    expect(navSource).toMatch(/Profile/);
    expect(navSource).toMatch(/Mobile transformation services navigation/);
    expect(assessmentSource).toMatch(/<TransformationNav active="assessment" \/>/);
    expect(careerPathSource).toMatch(/<TransformationNav active="careerpath" \/>/);
    expect(navSource).toMatch(/aria-label="Breadcrumb"/);
    expect(navSource).toMatch(/startViewTransition/);
    expect(assessmentSource).toMatch(/sticky top-14 z-10/);
    expect(assessmentSource).toMatch(/aria-current=\{moduleIndex === page \? "step" : undefined\}/);
    expect(assessmentSource).toMatch(/onClick=\{\(\) => navigateToModule\(moduleIndex\)\}/);
    expect(assessmentSource).toMatch(/Module \{page \+ 1\} of \{totalPages\}/);
    expect(assessmentSource).toMatch(/moduleRailCollapsed/);
    expect(assessmentSource).toMatch(/toggleModuleRail/);
    expect(assessmentSource).toMatch(/piq-search-query/);
    expect(assessmentSource).toMatch(/moduleScore/);
    expect(assessmentSource).toMatch(/out of 100/);
    expect(assessmentSource).toMatch(/percent overall progress/);
    expect(assessmentSource).toMatch(/<svg viewBox="0 0 40 40"/);
    expect(navSource).toMatch(/ArrowDown/);
    expect(navSource).toMatch(/ArrowUp/);
    expect(navSource).toMatch(/aria-activedescendant/);
    expect(assessmentSource).toMatch(/assessmentCopy\.reviewSection|Review Section/);
    expect(assessmentSource).toMatch(/event.key.toLowerCase\(\) === "m"/);
    expect(assessmentSource).toMatch(/highPotentialOnly/);
    expect(assessmentSource).toMatch(/High potential/);
    expect(assessmentSource).toMatch(/Press Ctrl\+M/);
    expect(assessmentSource).toMatch(/mobile-review-mode/);
    expect(careerPathSource).toMatch(/TransformationNav active="careerpath"/);
    expect(assessmentSource).toMatch(/mobileReviewMode/);
    expect(assessmentSource).toMatch(/Focused review mode/);
    expect(assessmentSource).toMatch(/Potential improvement/);
    expect(navSource).toMatch(/Saved progress/);
    expect(navSource).toMatch(/My Certificates/);
    expect(navSource).toMatch(/Settings/);
    expect(navSource).toMatch(/setTheme\("auto"\)/);
    expect(navSource).toMatch(/Auto/);
    expect(navSource).toMatch(/piq-new-certificate-available/);
    expect(navSource).toMatch(/Search modules or topics/);
    expect(navSource).toMatch(/transformation-search/);
    const appSource = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
    expect(appSource).toMatch(/ThemeProvider defaultTheme="light" switchable/);
  });

  it("renders non-empty reflection prompts in shared report views", () => {
    const sharedReportSource = readFileSync(resolve(process.cwd(), "client/src/pages/SharedReport.tsx"), "utf8");
    expect(sharedReportSource).toMatch(/getDimensionReflectionPoints\(dimension\)/);
    expect(sharedReportSource).toMatch(/Reflection prompts/);
  });

  it("exposes learner reflection notes, action statuses, and selected coach exports behind paid ownership", () => {
    const routerSource = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
    const reflectionCardSource = readFileSync(resolve(process.cwd(), "client/src/components/ReflectionPromptCard.tsx"), "utf8");
    expect(assessmentPageSource).toMatch(/ReflectionPromptCard/);
    expect(reflectionCardSource).toMatch(/Your reflection note/);
    expect(reflectionCardSource).toMatch(/Action status/);
    expect(reflectionCardSource).toMatch(/Include in export/);
    expect(assessmentPageSource).toMatch(/Export selected/);
    expect(routerSource).toMatch(/reflectionResponses:/);
    expect(routerSource).toMatch(/saveReflectionResponse:/);
    expect(routerSource).toMatch(/exportReflectionResponses:/);
    expect(routerSource).toMatch(/attempt\.email\.trim\(\)\.toLowerCase\(\)/);
    expect(routerSource).toMatch(/selections: z\.array/);
  });

  it("provides adaptable role lenses and longitudinal comparison deltas", () => {
    const current = buildReport(assessmentQuestions.map((question) => ({ questionId: question.id, value: 5 })));
    const previous = buildReport(assessmentQuestions.map((question) => ({ questionId: question.id, value: 4 })));
    expect(buildRoleLens(current, "leadership").priorities).toHaveLength(3);
    expect(buildRoleLens(current, "careerTransition").reflectionPoints[0]).toMatch(/achievement/i);
    expect(compareReports(current, previous).scoreDelta).toBe(20);
    expect(compareReports(current, previous).dimensions).toHaveLength(10);
  });
});


describe("CareerPath learner navigation", () => {
  it("supports resumable local progress and responsive module navigation", () => {
    const careerPathSource = readFileSync(resolve(process.cwd(), "client/src/pages/CareerPath.tsx"), "utf8");
    expect(careerPathSource).toMatch(/piq-careerpath-local-draft/);
    expect(careerPathSource).toMatch(/Save & continue later/);
    expect(careerPathSource).toMatch(/Resume previous session/);
    expect(careerPathSource).toMatch(/CheckCircle2/);
    expect(careerPathSource).toMatch(/SheetContent/);
    expect(careerPathSource).toMatch(/Browse modules/);
    expect(careerPathSource).toMatch(/currentGroupComplete/);
    expect(careerPathSource).toMatch(/event\.key === "ArrowLeft"/);
    expect(careerPathSource).toMatch(/event\.key === "ArrowRight"/);
  });
});


describe("CareerPath completion celebration", () => {
  it("exposes the final-completion certificate and drawer swipe affordance", () => {
    const careerPathSource = readFileSync(resolve(process.cwd(), "client/src/pages/CareerPath.tsx"), "utf8");
    const stylesSource = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");
    expect(careerPathSource).toMatch(/CareerPath complete/);
    expect(careerPathSource).toMatch(/Download Certificate/);
    expect(careerPathSource).toMatch(/certificatePreviewUrl/);
    expect(careerPathSource).toMatch(/Preview of the CareerPath completion certificate/);
    expect(careerPathSource).toMatch(/shareCareerPathToLinkedIn/);
    expect(careerPathSource).toMatch(/Share to LinkedIn/);
    expect(careerPathSource).toMatch(/linkedin\.com\/sharing\/share-offsite/);
    expect(careerPathSource).toMatch(/downloadCareerPathCertificate/);
    expect(careerPathSource).toMatch(/careerpath-drawer-handle/);
    expect(stylesSource).toMatch(/piqDrawerHandleBounce/);
    expect(stylesSource).toMatch(/prefers-reduced-motion: reduce/);
  });
});


describe("CareerPath bookmarkable steps", () => {
  it("exposes introduction, assessment, and results routes with a progress summary", () => {
    const appSource = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
    const careerPathSource = readFileSync(resolve(process.cwd(), "client/src/pages/CareerPath.tsx"), "utf8");
    expect(appSource).toMatch(/path="\/careerpath\/assessment"/);
    expect(appSource).toMatch(/path="\/careerpath\/results"/);
    expect(appSource).toMatch(/path="\/careerpath"/);
    expect(careerPathSource).toMatch(/CareerPathStepIndicator/);
    expect(careerPathSource).toMatch(/href: "\/careerpath\/assessment"/);
    expect(careerPathSource).toMatch(/href: "\/careerpath\/results"/);
    expect(careerPathSource).toMatch(/aria-label="CareerPath progress summary"/);
    expect(careerPathSource).toMatch(/Payment/);
    expect(careerPathSource).toMatch(/overallCompletion/);
  });
});

describe("course quiz variation and completion delivery", () => {
  it("uses varied answer sets while preserving one valid correct option per question", () => {
    const questions = courseCatalog[0].modules.flatMap((module) => module.quiz);
    expect(new Set(questions.map((question) => question.options.join("|"))).size).toBeGreaterThan(4);
    expect(questions.every((question) => question.options.length === 4 && question.correctOption >= 0 && question.correctOption < 4)).toBe(true);
    expect(new Set(questions.map((question) => question.correctOption)).size).toBeGreaterThan(1);
  });

  it("exposes per-attempt shuffling, celebration feedback, and paid certificate delivery actions", () => {
    const workspaceSource = readFileSync(resolve(process.cwd(), "client/src/pages/CourseWorkspace.tsx"), "utf8");
    expect(workspaceSource).toMatch(/const shuffle =/);
    expect(workspaceSource).toMatch(/const shuffleQuizForAttempt =/);
    expect(workspaceSource).toMatch(/setQuizOrder\(shuffleQuizForAttempt\(currentModule\.quiz\)\)/);
    expect(workspaceSource).toMatch(/correctOption: optionEntries\.findIndex/);
    expect(workspaceSource).toMatch(/const canonicalAnswers =/);
    expect(workspaceSource).toMatch(/Lesson complete/);
    expect(workspaceSource).toMatch(/Quiz passed/);
    expect(workspaceSource).toMatch(/autoCertificateRequested/);
    expect(workspaceSource).toMatch(/Certificate ready/);
    expect(workspaceSource).toMatch(/Share completion/);
    expect(workspaceSource).toMatch(/linkedin\.com\/sharing\/share-offsite/);
  });
});

import fs from "node:fs";

const projectRoot = "/home/ubuntu/profound-iq-consulting";
const workspacePath = `${projectRoot}/client/src/pages/CourseWorkspace.tsx`;
const seoPath = `${projectRoot}/server/seoRoutes.ts`;
const testPath = `${projectRoot}/shared/courseCatalogExpansion.test.ts`;

function replaceOnce(source, from, to, label) {
  const count = source.split(from).length - 1;
  if (count !== 1) {
    throw new Error(`${label}: expected one match, found ${count}`);
  }
  return source.replace(from, to);
}

let workspace = fs.readFileSync(workspacePath, "utf8");
workspace = replaceOnce(
  workspace,
  'import { ArrowLeft, ArrowRight, ArrowUpRight, Bookmark, CheckCircle2, Download, Expand, Loader2, LockKeyhole, Printer, RotateCcw, Share2, Sparkles } from "lucide-react";',
  'import { ArrowLeft, ArrowRight, ArrowUpRight, Bookmark, CheckCircle2, ChevronDown, Download, Expand, Loader2, LockKeyhole, PanelLeftClose, PanelLeftOpen, Printer, RotateCcw, Share2, Sparkles } from "lucide-react";',
  "workspace icon import"
);
workspace = replaceOnce(
  workspace,
  'import { downloadCertificatePdf } from "@/lib/certificatePdf";',
  'import { downloadCertificatePdf } from "@/lib/certificatePdf";\nimport { CourseMapSidebar } from "@/components/CourseMapSidebar";',
  "workspace component import"
);
workspace = replaceOnce(
  workspace,
  'type LessonResponseSaveStatus = "idle" | "saving" | "saved" | "error";\n\nconst shuffle',
  `type LessonResponseSaveStatus = "idle" | "saving" | "saved" | "error";

function LessonPlayerSkeleton() {
  return <div role="status" aria-live="polite" aria-label="Loading lesson" className="mt-6 space-y-6">
    <span className="sr-only">Loading lesson content…</span>
    <div className="border border-[#c9a34e]/45 bg-[#16243d] p-4">
      <div className="flex items-center justify-between gap-4"><div className="h-4 w-48 animate-pulse bg-white/15" /><div className="h-8 w-20 animate-pulse bg-[#c9a34e]/35" /></div>
      <div className="mt-4 h-2 w-full animate-pulse bg-white/15" />
    </div>
    <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
      <div className="space-y-5"><div className="grid gap-3 sm:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-16 w-full animate-pulse bg-[#16243d]/10" />)}</div><div className="h-28 w-full animate-pulse bg-[#16243d]/10" /><div className="space-y-4">{[1, 2, 3, 4].map((item) => <div key={item} className="space-y-3 border-t border-[#16243d]/10 pt-5"><div className="h-3 w-32 animate-pulse bg-[#c9a34e]/35" /><div className="h-4 w-full animate-pulse bg-[#16243d]/10" /><div className="h-4 w-11/12 animate-pulse bg-[#16243d]/10" /></div>)}</div></div>
      <div className="space-y-4"><div className="h-36 w-full animate-pulse bg-[#16243d]/10" /><div className="h-48 w-full animate-pulse bg-[#16243d]/10" /></div>
    </div>
  </div>;
}

const shuffle`,
  "lesson skeleton"
);
workspace = replaceOnce(
  workspace,
  "  const [moduleIndex, setModuleIndex] = useState(0);\n  const [quizOpen, setQuizOpen] = useState(false);",
  "  const [moduleIndex, setModuleIndex] = useState(0);\n  const [courseNavOpen, setCourseNavOpen] = useState(true);\n  const [expandedModuleIndex, setExpandedModuleIndex] = useState(0);\n  const [lessonTransitioning, setLessonTransitioning] = useState(false);\n  const lessonTransitionTimer = useRef<number | null>(null);\n  const [quizOpen, setQuizOpen] = useState(false);",
  "workspace navigation state"
);
workspace = replaceOnce(
  workspace,
  "  useEffect(() => () => { Object.values(responseSaveTimers.current).forEach((timer) => window.clearTimeout(timer)); }, []);",
  "  useEffect(() => () => { Object.values(responseSaveTimers.current).forEach((timer) => window.clearTimeout(timer)); if (lessonTransitionTimer.current !== null) window.clearTimeout(lessonTransitionTimer.current); }, []);",
  "workspace transition cleanup"
);
workspace = replaceOnce(
  workspace,
  "  const requestPaymentForModule = (stage: number) => { setPaymentRequiredStage(stage); recordAccessDeniedMutation.mutate({ courseSlug: course.slug, moduleIndex, requiredStage: stage }); };",
  "  const requestPaymentForModule = (stage: number, requestedModuleIndex = moduleIndex) => { setPaymentRequiredStage(stage); recordAccessDeniedMutation.mutate({ courseSlug: course.slug, moduleIndex: requestedModuleIndex, requiredStage: stage }); };",
  "workspace payment audit context"
);
workspace = replaceOnce(
  workspace,
  '  const openLesson = (lessonId: string) => { if (quizOpen) { toast.info("Lesson navigation is paused", { description: "Finish or close the quiz before opening another lesson." }); return; } if (moduleLocked) { requestPaymentForModule(moduleRequiredStage); return; } const lessonIndex = currentModule.lessons.findIndex((lesson) => lesson.id === lessonId); const previousLesson = lessonIndex > 0 ? currentModule.lessons[lessonIndex - 1] : null; if (previousLesson && !progress.lessons.includes(previousLesson.id)) { toast.info("Finish the previous lesson first", { description: "Lessons unlock in sequence after the previous 30-minute study block is complete." }); return; } setActiveLessonId(lessonId); setSimulationChoice(null); setReflection(""); setResponseSaveStatus("idle"); setLessonStage(0); setTimerNow(Date.now()); };',
  `  const openLesson = (lessonId: string, targetModuleIndex = moduleIndex) => { if (quizOpen) { toast.info("Lesson navigation is paused", { description: "Finish or close the quiz before opening another lesson." }); return; } const targetModule = course.modules[targetModuleIndex]; if (!targetModule) return; const targetModuleLocked = !canAccessModuleLessons({ moduleIndex: targetModuleIndex, paidStages: effectiveStageCount, isQualityControlAdmin: accessOverride }); if (targetModuleLocked) { requestPaymentForModule(requiredStageForModule(targetModuleIndex), targetModuleIndex); return; } const lessonIndex = targetModule.lessons.findIndex((lesson) => lesson.id === lessonId); if (lessonIndex < 0) return; const previousLesson = lessonIndex > 0 ? targetModule.lessons[lessonIndex - 1] : null; if (previousLesson && !progress.lessons.includes(previousLesson.id)) { toast.info("Finish the previous lesson first", { description: "Lessons unlock in sequence after the previous 30-minute study block is complete." }); return; } if (targetModuleIndex !== moduleIndex) setModuleIndex(targetModuleIndex); setExpandedModuleIndex(targetModuleIndex); setLessonTransitioning(true); if (lessonTransitionTimer.current !== null) window.clearTimeout(lessonTransitionTimer.current); lessonTransitionTimer.current = window.setTimeout(() => { setLessonTransitioning(false); lessonTransitionTimer.current = null; }, 220); setActiveLessonId(lessonId); setSimulationChoice(null); setReflection(""); setResponseSaveStatus("idle"); setLessonStage(0); setTimerNow(Date.now()); };`,
  "workspace lesson selection"
);
workspace = replaceOnce(
  workspace,
  "  const moduleLocked = !canAccessModuleLessons({ moduleIndex, paidStages: effectiveStageCount, isQualityControlAdmin: accessOverride });\n  useEffect(() => { if (moduleLocked && activeLessonId) setActiveLessonId(null); }, [moduleLocked, activeLessonId]);",
  "  const moduleLocked = !canAccessModuleLessons({ moduleIndex, paidStages: effectiveStageCount, isQualityControlAdmin: accessOverride });\n  const selectModule = (nextIndex: number) => { const requiredStage = requiredStageForModule(nextIndex); const locked = !canAccessModuleLessons({ moduleIndex: nextIndex, paidStages: effectiveStageCount, isQualityControlAdmin: accessOverride }); if (locked) { requestPaymentForModule(requiredStage, nextIndex); return; } setModuleIndex(nextIndex); setExpandedModuleIndex(nextIndex); setActiveLessonId(null); setLessonTransitioning(false); };\n  const toggleModule = (nextIndex: number) => { if (!canAccessModuleLessons({ moduleIndex: nextIndex, paidStages: effectiveStageCount, isQualityControlAdmin: accessOverride })) { selectModule(nextIndex); return; } if (moduleIndex !== nextIndex) selectModule(nextIndex); else setExpandedModuleIndex((current) => current === nextIndex ? -1 : nextIndex); setActiveLessonId(null); };\n  useEffect(() => { if (moduleLocked && activeLessonId) setActiveLessonId(null); }, [moduleLocked, activeLessonId]);\n  useEffect(() => { setExpandedModuleIndex(moduleIndex); }, [moduleIndex]);",
  "workspace module selection"
);
workspace = replaceOnce(
  workspace,
  "setModuleIndex(badge.moduleIndex);",
  "selectModule(badge.moduleIndex);",
  "workspace badge navigation"
);
workspace = replaceOnce(
  workspace,
  '<div className="grid gap-10 lg:grid-cols-[1fr_300px]"><section>',
  '<div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)_300px] lg:gap-8"><CourseMapSidebar course={course} progress={progress} moduleIndex={moduleIndex} expandedModuleIndex={expandedModuleIndex} courseNavOpen={courseNavOpen} effectiveStageCount={effectiveStageCount} accessOverride={accessOverride} activeLessonId={activeLessonId} onToggleCourseNav={() => setCourseNavOpen((open) => !open)} onToggleModule={toggleModule} onSelectLesson={openLesson} /><section>',
  "workspace course map"
);
workspace = replaceOnce(
  workspace,
  '<div className="mt-8 border-l-2 border-[#c9a34e] bg-white/60 p-5"><p className="text-xs font-black uppercase tracking-[.14em] text-[#7d5e1e]">Your learning signal</p>',
  '<section aria-labelledby="course-progress-title" className="mt-8 border-l-2 border-[#c9a34e] bg-white/60 p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.14em] text-[#7d5e1e]">Course progress</p><h2 id="course-progress-title" className="display mt-1 text-xl">Your learning signal</h2></div><span className="text-[10px] font-black uppercase tracking-[.12em] text-[#657084]">Lessons + quizzes</span></div>',
  "workspace progress heading"
);
workspace = replaceOnce(
  workspace,
  '<div className="mt-3 h-2 bg-[#16243d]/10"><div className="h-2 bg-[#c9a34e] transition-all" style={{ width: `${courseProgress}%` }} /></div></div>',
  '<div role="progressbar" aria-label="Overall course progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={courseProgress} className="mt-3 h-2 overflow-hidden bg-[#16243d]/10"><div className="h-full bg-[#c9a34e] transition-[width] duration-500" style={{ width: `${courseProgress}%` }} /></div><p className="mt-2 text-[10px] font-black uppercase tracking-[.12em] text-[#657084]">{courseProgress}% complete · progress saves automatically</p></section>',
  "workspace progress bar"
);
workspace = replaceOnce(
  workspace,
  "onClick={() => setModuleIndex((index) => Math.max(0, index - 1))}",
  "onClick={() => selectModule(Math.max(0, moduleIndex - 1))}",
  "workspace previous module"
);
workspace = replaceOnce(
  workspace,
  "onClick={() => setModuleIndex((index) => Math.min(course.modules.length - 1, index + 1))}",
  "onClick={() => selectModule(Math.min(course.modules.length - 1, moduleIndex + 1))}",
  "workspace next module"
);
workspace = replaceOnce(
  workspace,
  'className="mx-auto max-w-4xl border border-[#c9a34e]/70 bg-[#f7f3e8] p-6 text-[#16243d] shadow-2xl sm:p-10"',
  'className="relative mx-auto max-w-4xl overflow-hidden border border-[#c9a34e]/70 bg-[#f7f3e8] p-6 text-[#16243d] shadow-2xl sm:p-10"',
  "workspace lesson dialog"
);
workspace = replaceOnce(
  workspace,
  '<div className="mt-6"><div className="border border-[#c9a34e]/60 bg-[#16243d] p-4 text-[#f7f3e8]">',
  '<div className="relative"><div className={`absolute inset-x-0 bottom-0 top-0 z-10 bg-[#f7f3e8] p-1 transition-opacity duration-200 ${lessonTransitioning ? "opacity-100" : "pointer-events-none opacity-0"}`} aria-hidden={!lessonTransitioning}><LessonPlayerSkeleton /></div><div key={activeLesson.id} className="lesson-panel-enter mt-6"><div className="border border-[#c9a34e]/60 bg-[#16243d] p-4 text-[#f7f3e8]">',
  "workspace lesson skeleton wrapper"
);
workspace = replaceOnce(
  workspace,
  "</Button></div></div></div></div>}{quizOpen &&",
  "</Button></div></div></div></div></div>}{quizOpen &&",
  "workspace lesson skeleton closing"
);
fs.writeFileSync(workspacePath, workspace);

let seo = fs.readFileSync(seoPath, "utf8");
seo = replaceOnce(
  seo,
  'href="${url}?workspace=1">Open course details</a>',
  'href="${SITE_ORIGIN}/courses?enroll=${encodeURIComponent(course.slug)}">Start course registration</a>',
  "SEO course registration CTA"
);
fs.writeFileSync(seoPath, seo);

let test = fs.readFileSync(testPath, "utf8");
const oldCtaAssertion =
  "expect(seoRoutes).toContain('href=\\\"/courses/${encodeURIComponent(course.slug)}?workspace=1\\\"');";
if (test.includes(oldCtaAssertion)) {
  test = replaceOnce(
    test,
    oldCtaAssertion,
    'expect(seoRoutes).toContain("Start course registration");\n    expect(seoRoutes).toContain("${SITE_ORIGIN}/courses?enroll=${encodeURIComponent(course.slug)}");',
    "course navigation CTA assertion"
  );
}
if (
  !test.includes(
    'it("exposes the progress-aware lesson map and transition loading contract"'
  )
) {
  test = replaceOnce(
    test,
    '  it("exposes the randomized-attempt and feedback contract in the workspace", async () => {',
    `  it("exposes the progress-aware lesson map and transition loading contract", () => {
    const workspace = readFileSync("client/src/pages/CourseWorkspace.tsx", "utf8");
    expect(workspace).toContain('aria-label="Overall course progress"');
    expect(workspace).toContain('aria-label="Course modules and lessons"');
    expect(workspace).toContain("course-map-navigation");
    expect(workspace).toContain("lessonTransitioning");
    expect(workspace).toContain("LessonPlayerSkeleton");
    expect(workspace).toContain("openLesson(lesson.id, index)");
    expect(workspace).toContain("const selectModule = (nextIndex: number)");
  });

  it("exposes the randomized-attempt and feedback contract in the workspace", async () => {`,
    "workspace UX regression assertions"
  );
}
fs.writeFileSync(testPath, test);

console.log(
  "Applied focused course workspace UX patch without broad reformatting."
);

/* Profound IQ Consulting — Executive-grade LMS course workspace. */
import { useEffect, useState, useCallback, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  Star,
  Zap,
  ChevronRight,
  Check,
  Clock,
  Copy,
  Download,
  Flame,
  Loader2,
  Lock,
  RefreshCw,
  Share2,
  Sparkles,
  Trophy,
  Target,
  Mail,
  Phone,
  MapPin,
  FileText,
  X,
  User,
  Building,
  Landmark,
  Calendar,
  ShieldAlert,
  GraduationCap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ProgressMotionBar,
  EncouragementMessage,
  ProgressCelebration,
  AchievementBadge,
} from "@/components/ProgressMotion";
import { Link, useRoute } from "wouter";
import {
  courseCatalog,
  type CourseDefinition,
  type CourseLesson,
  type CourseModule,
} from "@shared/courseCatalog";
import {
  canAccessCourseLessons,
  courseAccessReason,
  requiredPaymentStageForModule,
} from "@shared/courseAccess";
import {
  generateLessonVisuals,
  type GeneratedVisualAsset,
} from "@shared/courseVisuals";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TransformationNav } from "@/components/TransformationNav";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { CourseEnrollmentForm } from "@/components/CourseEnrollmentForm";
import { CourseShareActions } from "@/components/CourseShareActions";
import PaystackInlineModal from "@/components/PaystackInlineModal";
import { courseEnrollmentCopy } from "@shared/courseEnrollmentLocalization";

type LessonTimerState = { startedAt: number; completedAt?: number };
type SavedProgress = {
  lessons: string[];
  quizScores: Record<string, number>;
  stageCount: number;
  lessonTimers: Record<string, LessonTimerState>;
  responses: Record<string, Record<string, string>>;
  reflections: Record<string, string>;
  xp: number;
  streak: number;
  lastActive: string;
  lastLessonId: string | null;
  badges: string[];
};

const storageKey = (slug: string) => `piq-course-progress-${slug}`;
const XP_PER_LESSON = 100;
const XP_PER_MODULE = 500;
const COURSE_COMPLETION_XP = 2000;

function emptyProgress(): SavedProgress {
  return {
    lessons: [],
    quizScores: {},
    stageCount: 0,
    lessonTimers: {},
    responses: {},
    reflections: {},
    xp: 0,
    streak: 0,
    lastActive: new Date().toDateString(),
    lastLessonId: null,
    badges: [],
  };
}

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
      reflections:
        saved.reflections && typeof saved.reflections === "object"
          ? saved.reflections
          : {},
      xp: typeof saved.xp === "number" ? saved.xp : 0,
      streak: typeof saved.streak === "number" ? saved.streak : 0,
      lastActive: typeof saved.lastActive === "string" ? saved.lastActive : "",
      lastLessonId:
        typeof saved.lastLessonId === "string" ? saved.lastLessonId : null,
      badges: Array.isArray(saved.badges) ? saved.badges : [],
    };
  } catch {
    return emptyProgress();
  }
}

function writeProgress(course: CourseDefinition, progress: SavedProgress) {
  try {
    window.localStorage.setItem(
      storageKey(course.slug),
      JSON.stringify({ ...progress, lastActive: new Date().toDateString() })
    );
  } catch {
    // localStorage may be unavailable in private mode
  }
}

function lessonComplete(progress: SavedProgress, lessonId: string) {
  return progress.lessons.includes(lessonId);
}

function moduleComplete(progress: SavedProgress, module: CourseModule) {
  return module.lessons.every(lesson => lessonComplete(progress, lesson.id));
}

function modulePaidStatus(moduleIndex: number, paidStages: number) {
  const requiredStage = requiredPaymentStageForModule(moduleIndex);
  return {
    requiredStage,
    isFree: requiredStage === 0,
    isPaid: paidStages >= requiredStage,
  };
}

function previousModuleComplete(
  progress: SavedProgress,
  modules: CourseModule[],
  index: number
) {
  if (index === 0) return true;
  return moduleComplete(progress, modules[index - 1]);
}

function previousLessonComplete(
  progress: SavedProgress,
  lessons: CourseLesson[],
  lessonIndex: number
) {
  if (lessonIndex === 0) return true;
  return lessonComplete(progress, lessons[lessonIndex - 1].id);
}

function reflectionSaved(progress: SavedProgress, lessonId: string) {
  return Boolean(progress.reflections?.[lessonId]?.trim());
}

function lessonFullyComplete(progress: SavedProgress, lesson: CourseLesson) {
  if (!lessonComplete(progress, lesson.id)) return false;
  if (lesson.reflectionPrompt && !reflectionSaved(progress, lesson.id))
    return false;
  return true;
}

function gamificationLevel(xp: number) {
  if (xp >= 5000) return "Grandmaster";
  if (xp >= 3000) return "Expert";
  if (xp >= 1500) return "Practitioner";
  if (xp >= 500) return "Learner";
  return "Beginner";
}

type LessonNav = {
  lesson: CourseLesson;
  moduleIndex: number;
  lessonIndex: number;
  totalModules: number;
  totalLessons: number;
};

function findLessonPosition(
  course: CourseDefinition,
  lessonId: string
): LessonNav | null {
  for (let mi = 0; mi < course.modules.length; mi++) {
    const mod = course.modules[mi];
    const idx = mod.lessons.findIndex(l => l.id === lessonId);
    if (idx >= 0) {
      return {
        lesson: mod.lessons[idx],
        moduleIndex: mi,
        lessonIndex: idx,
        totalModules: course.modules.length,
        totalLessons: course.modules.reduce(
          (acc, m) => acc + m.lessons.length,
          0
        ),
      };
    }
  }
  return null;
}

function moduleClassName(
  open: boolean,
  canAccess: boolean,
  isComplete: boolean
) {
  if (open) return "border-[var(--brand)]/50 bg-white/80 shadow-lg";
  if (canAccess)
    return "border-[#16243d]/15 bg-white/70 hover:border-[var(--brand)]/50 hover:shadow-md";
  return "border-[#16243d]/10 bg-[#16243d]/5 opacity-50 cursor-not-allowed";
}

function lessonCardClassName(canAccess: boolean, isComplete: boolean) {
  if (canAccess && isComplete)
    return "border-[var(--brand)]/40 bg-[#ead9ae]/40 shadow-sm";
  if (canAccess)
    return "border-[#16243d]/10 bg-white/70 hover:bg-[#fffaf0] hover:border-[var(--brand)]/50 shadow-sm";
  return "border-[#16243d]/10 bg-[#16243d]/5 opacity-50 cursor-not-allowed";
}

function lessonBadgeClassName(isComplete: boolean, canAccess: boolean) {
  if (isComplete) return "border-[var(--brand)] bg-[#ead9ae]/40";
  if (canAccess) return "border-[#16243d]/20 bg-white/60";
  return "border-[#16243d]/10 bg-[#16243d]/5";
}

function lessonNumberClassName(isComplete: boolean, canAccess: boolean) {
  if (isComplete) return "text-[#8b5e14]";
  if (canAccess) return "text-[#16243d]";
  return "text-[#4a566a]";
}

function lessonTitleClassName(canAccess: boolean) {
  if (canAccess) return "text-[#16243d] group-hover:text-[var(--brand-light)]";
  return "text-[#4a566a]";
}

function lessonTagClassName(isFree: boolean, isPaid: boolean) {
  if (isFree || isPaid) return "text-[var(--brand)]";
  return "text-[#4a566a]";
}

function statusText(
  isComplete: boolean,
  isFree: boolean,
  isPaid: boolean,
  requiredStage: number
) {
  if (isComplete) return "Complete";
  if (isFree) return "Free";
  return `Stage ${requiredStage}`;
}

function moduleStatusColor(
  isComplete: boolean,
  isFree: boolean,
  isPaid: boolean
) {
  if (isComplete) return "text-[#8b5e14]";
  if (isFree || isPaid) return "text-[var(--brand)]";
  return "text-[#4a566a]";
}

function moduleStatusText(
  isComplete: boolean,
  isFree: boolean,
  isPaid: boolean,
  requiredStage: number,
  index: number
) {
  if (isComplete) return "Complete";
  if (isFree) return "Free";
  if (!isPaid) return `Stage ${requiredStage}`;
  return `Stage ${requiredStage}`;
}

type LessonContentProps = {
  lesson: CourseLesson;
  courseSlug: string;
  moduleIndex: number;
  lessonIndex: number;
  totalModules: number;
  totalLessons: number;
  onComplete: () => void;
  isComplete: boolean;
  reflectionText: string;
  setReflectionText: (v: string) => void;
  xp: number;
  streak: number;
  visualAssets: GeneratedVisualAsset[];
};

function LessonContent({
  lesson,
  courseSlug,
  moduleIndex,
  lessonIndex,
  totalModules,
  totalLessons,
  onComplete,
  isComplete,
  reflectionText,
  setReflectionText,
  xp,
  streak,
  visualAssets,
}: LessonContentProps) {
  const [timerStarted, setTimerStarted] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [celebration, setCelebration] = useState(false);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const reflectionRef = useRef<HTMLDivElement>(null);
  const lastLessonIdRef = useRef<string | null>(null);
  const [editorInitialized, setEditorInitialized] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const saveSelection = (): Range | null => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    return sel.getRangeAt(0);
  };

  const restoreSelection = (range: Range | null) => {
    if (!range) return;
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  };

  const MAX_REFLECTION_WORDS = 100;

  const reflectionWordCount = reflectionText
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const reflectionOverLimit = reflectionWordCount > MAX_REFLECTION_WORDS;

  const saveReflectionToNotes = (html: string) => {
    try {
      const existing = window.localStorage.getItem(
        `piq-course-notes-${courseSlug}`
      );
      const notes = existing ? JSON.parse(existing) : {};
      notes[lesson.id] = html;
      window.localStorage.setItem(
        `piq-course-notes-${courseSlug}`,
        JSON.stringify(notes)
      );
    } catch {
      // Silently ignore storage failures
    }
  };

  const formatText = (command: string, value?: string) => {
    if (!reflectionRef.current) return;
    reflectionRef.current.focus();
    const range = saveSelection();
    document.execCommand(command, false, value ?? undefined);
    restoreSelection(range);
    if (reflectionRef.current) {
      setReflectionText(reflectionRef.current.innerHTML);
    }
  };

  useEffect(() => {
    if (lastLessonIdRef.current !== lesson.id) {
      lastLessonIdRef.current = lesson.id;
      if (reflectionRef.current) {
        reflectionRef.current.innerHTML = reflectionText || "";
      }
      setEditorInitialized(true);
    }
  }, [lesson.id, reflectionText]);

  useEffect(() => {
    if (!timerStarted) {
      setTimerStarted(true);
      const start = Date.now();
      const id = setInterval(() => {
        setTimerSeconds(Math.floor((Date.now() - start) / 1000));
      }, 1000);
      return () => clearInterval(id);
    }
  }, [timerStarted]);

  const handleComplete = () => {
    onComplete();
    saveReflectionToNotes(reflectionText);
    setCelebration(true);
    setTimeout(() => setCelebration(false), 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      id={lesson.id}
      className="mt-10 rounded-3xl border border-[#16243d]/15 bg-[var(--card)] p-8 shadow-xl"
    >
      <AnimatePresence>
        {celebration && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full border-[var(--brand)]/60 bg-[#ead9ae]/90 px-6 py-2 shadow-2xl"
          >
            <Sparkles size={16} className="text-[var(--brand-light)] animate-bounce" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#8b5e14]">
              +{XP_PER_LESSON} XP earned
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-[var(--brand)]/40 bg-[#fffaf0] text-[10px] font-black uppercase tracking-[.1em] text-[var(--brand)]">
              {lesson.durationMinutes} min
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black ${isComplete ? "border-[var(--brand)] bg-[#ead9ae]/40 text-[#8b5e14]" : "border-[#16243d]/20 text-[#4a566a]"}`}
            >
              {isComplete ? <Check size={10} /> : <Clock size={10} />}
              {isComplete ? " Complete" : " In progress"}
            </span>
          </div>
          <h1 className="display mt-2 text-4xl tracking-[-.04em] text-[#16243d]">
            {lesson.title}
          </h1>
          <p className="mt-4 text-base leading-8 text-[#4a566a]">
            {lesson.summary}
          </p>
          <div className="mt-6 flex items-center gap-4 text-[10px] font-black uppercase tracking-[.12em] text-[#5d4613]">
            <span className="flex items-center gap-1">
              <Target size={12} className="text-[var(--brand-light)]" />
              Outcome: {lesson.outcome}
            </span>
            <span className="flex items-center gap-1 opacity-50">
              <GraduationCap size={12} className="text-[var(--brand-light)]" />
              Lesson {lessonIndex + 1} of {totalLessons}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[var(--brand)]/40 bg-[#fffaf0] text-[10px] font-black uppercase tracking-[.1em] text-[var(--brand)]">
              <Trophy size={10} className="text-[var(--brand-light)]" />
              {gamificationLevel(xp)}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[var(--brand)]/40 bg-[#fffaf0] text-[10px] font-black uppercase tracking-[.1em] text-[var(--brand)]">
              <Flame size={10} className="text-[var(--brand-light)]" />
              {streak} day streak
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[var(--brand)]/40 bg-[#fffaf0] text-[10px] font-black uppercase tracking-[.1em] text-[var(--brand)]">
              <Target size={10} className="text-[var(--brand-light)]" />
              {xp} XP
            </span>
          </div>
        </div>
        <div className="flex items-end gap-3">
          {!isComplete && !reflectionText.trim() && (
            <button
              disabled={true}
              className="inline-flex items-center gap-2 rounded-xl border border-[#16243d]/20 px-5 py-3 text-[10px] font-black uppercase tracking-[.12em] text-[#4a566a] cursor-not-allowed opacity-60"
            >
              <Lock size={14} className="text-[#4a566a]" />
              Reflection required
            </button>
          )}
          {!isComplete && reflectionText.trim() && (
            <button
              onClick={handleComplete}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--brand)] bg-[var(--brand)] px-5 py-3 text-[10px] font-black uppercase tracking-[.12em] text-[#16243d] shadow-lg transition-all hover:shadow-xl hover:bg-[#b38e3f] active:scale-95"
            >
              <Check size={14} /> Mark complete
            </button>
          )}
          {isComplete && (
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--brand)]/40 bg-[#ead9ae]/40 px-4 py-2 text-[10px] font-black uppercase tracking-[.10em] text-[#8b5e14]">
              <CheckCircle2 size={14} className="text-[var(--brand-light)]" />
              Complete
            </span>
          )}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="display mt-8 text-3xl tracking-[-.03em] text-[#16243d]">
          Lesson content
        </h2>

        {/* Visual assets row */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visualAssets.map(asset => (
            <motion.div
              key={asset.type}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: range(4).indexOf(visualAssets.indexOf(asset)) * 0.08,
                duration: 0.4,
              }}
              className="rounded-2xl border border-[#16243d]/15 bg-white/50 p-6 shadow-sm flex flex-col"
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`text-[10px] font-black uppercase tracking-[.14em] ${asset.type === "flowchart" ? "text-[var(--brand-light)]" : asset.type === "diagram" ? "text-[var(--brand)]" : asset.type === "illustration" ? "text-[#5d4613]" : "text-[#4a566a]"}`}
                >
                  {asset.label}
                </span>
              </div>
              <div className="flex-1 min-h-[200px] flex items-center justify-center border border-[#16243d]/10 rounded-xl bg-[#f7f3e8]/40 overflow-hidden relative">
                <div
                  className="absolute inset-0"
                  dangerouslySetInnerHTML={{ __html: asset.svg }}
                />
              </div>
              <p className="mt-3 text-[10px] leading-5 text-[#4a566a] text-center">
                {asset.caption}
              </p>
            </motion.div>
          ))}
        </div>

        {lesson.sections.length > 0 && (
          <>
            <motion.div
              key={activeSectionIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border border-[#16243d]/15 bg-white/50 p-8 shadow-sm mb-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[.16em] text-[var(--brand)]">
                    Section {activeSectionIndex + 1}:{" "}
                    {lesson.sections[activeSectionIndex].heading}
                  </h3>
                  {isSpecialSection(
                    lesson.sections[activeSectionIndex].heading
                  ) ? null : (
                    <p className="mt-3 text-sm leading-7 text-[#16243d]">
                      {lesson.sections[activeSectionIndex].body}
                    </p>
                  )}
                </div>
              </div>
              {lesson.sections[activeSectionIndex].callout && (
                <div className="mt-5 rounded-2xl border border-[var(--brand)]/30 bg-[#fffaf0] p-6">
                  <div className="flex items-start gap-3">
                    <Bookmark size={18} className="text-[var(--brand-light)] shrink-0" />
                    <p className="text-sm leading-7 text-[var(--brand)]">
                      {lesson.sections[activeSectionIndex].callout}
                    </p>
                  </div>
                </div>
              )}

              {/* Special section rendering based on heading */}
              {lesson.sections[activeSectionIndex].heading === "Deep Dive" &&
                lesson.deepDive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="mt-6 rounded-3xl border border-[#16243d]/15 bg-white/60 p-8 shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Zap size={18} className="text-[var(--brand-light)] shrink-0" />
                      <h4 className="text-sm font-black uppercase tracking-[.14em] text-[#5d4613]">
                        Deep dive
                      </h4>
                    </div>
                    <p className="text-sm leading-7 text-[#16243d]">
                      {lesson.deepDive}
                    </p>
                  </motion.div>
                )}

              {lesson.sections[activeSectionIndex].heading ===
                "Worked Example" &&
                lesson.example && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="mt-6 rounded-3xl border border-[var(--brand)]/30 bg-white/50 p-8 shadow-sm"
                  >
                    <h4 className="display mb-4 text-2xl text-[var(--brand)]">
                      Worked example
                    </h4>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="rounded-2xl border border-[var(--brand)]/30 bg-[#fffaf0] p-5">
                        <p className="text-[10px] font-black uppercase tracking-[.14em] text-[var(--brand-light)]">
                          Context
                        </p>
                        <p className="mt-2 text-sm leading-7 text-[#16243d]">
                          {lesson.example.context}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-[var(--brand)]/30 bg-[#fffaf0] p-5">
                        <p className="text-[10px] font-black uppercase tracking-[.14em] text-[var(--brand-light)]">
                          Move
                        </p>
                        <p className="mt-2 text-sm leading-7 text-[#16243d]">
                          {lesson.example.move}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-[var(--brand)]/30 bg-[#fffaf0] p-5">
                        <p className="text-[10px] font-black uppercase tracking-[.14em] text-[var(--brand-light)]">
                          Result
                        </p>
                        <p className="mt-2 text-sm leading-7 text-[#16243d]">
                          {lesson.example.result}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

              {lesson.sections[activeSectionIndex].heading === "Key Takeaway" &&
                lesson.keyTakeaway && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="mt-6 rounded-3xl border-l-4 border-[var(--brand)] bg-[#ead9ae]/20 p-7 shadow-sm"
                  >
                    <h4 className="display mb-3 text-xl text-[var(--brand)]">
                      Key takeaway
                    </h4>
                    <p className="text-sm leading-7 text-[#16243d] italic">
                      {lesson.keyTakeaway}
                    </p>
                  </motion.div>
                )}

              {lesson.sections[activeSectionIndex].heading ===
                "Reflection Prompt" &&
                lesson.reflectionPrompt && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="mt-6 rounded-3xl border border-[var(--brand)]/30 bg-[#fffaf0] p-8 shadow-lg"
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <Star size={20} className="text-[var(--brand-light)] shrink-0" />
                      <div>
                        <h4 className="display text-xl text-[var(--brand)]">
                          Reflection — required to complete
                        </h4>
                        <p className="mt-1 text-sm leading-6 text-[#4a566a]">
                          {lesson.reflectionPrompt}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 rounded-2xl border border-[var(--brand)]/30 bg-white p-6 relative">
                      <div className="flex flex-wrap gap-1 mb-3">
                        <button
                          onMouseDown={event => {
                            event.preventDefault();
                            formatText("bold");
                          }}
                          className="rounded-lg border border-[#16243d]/20 px-2.5 py-1.5 text-xs font-black text-[#4a566a] hover:bg-[#16243d]/5 active:bg-[#16243d]/10 transition-colors"
                          title="Bold"
                          aria-label="Bold"
                        >
                          <b>B</b>
                        </button>
                        <button
                          onMouseDown={event => {
                            event.preventDefault();
                            formatText("italic");
                          }}
                          className="rounded-lg border border-[#16243d]/20 px-2.5 py-1.5 text-xs font-black text-[#4a566a] hover:bg-[#16243d]/5 active:bg-[#16243d]/10 transition-colors"
                          title="Italic"
                          aria-label="Italic"
                        >
                          <i>I</i>
                        </button>
                        <button
                          onMouseDown={event => {
                            event.preventDefault();
                            formatText("underline");
                          }}
                          className="rounded-lg border border-[#16243d]/20 px-2.5 py-1.5 text-xs font-black text-[#4a566a] hover:bg-[#16243d]/5 active:bg-[#16243d]/10 transition-colors"
                          title="Underline"
                          aria-label="Underline"
                        >
                          <u>U</u>
                        </button>
                        <button
                          onMouseDown={event => {
                            event.preventDefault();
                            formatText("insertUnorderedList");
                          }}
                          className="rounded-lg border border-[#16243d]/20 px-2.5 py-1.5 text-xs font-black text-[#4a566a] hover:bg-[#16243d]/5 active:bg-[#16243d]/10 transition-colors"
                          title="Bullet list"
                          aria-label="Bullet list"
                        >
                          <span className="font-mono">⚫</span>
                        </button>
                        <button
                          onMouseDown={event => {
                            event.preventDefault();
                            formatText("insertOrderedList");
                          }}
                          className="rounded-lg border border-[#16243d]/20 px-2.5 py-1.5 text-xs font-black text-[#4a566a] hover:bg-[#16243d]/5 active:bg-[#16243d]/10 transition-colors"
                          title="Numbered list"
                          aria-label="Numbered list"
                        >
                          <span className="font-mono">1.</span>
                        </button>
                        <button
                          onMouseDown={event => {
                            event.preventDefault();
                            formatText("removeFormat");
                          }}
                          className="rounded-lg border border-[#16243d]/20 px-2.5 py-1.5 text-xs font-black text-[#4a566a] hover:bg-[#16243d]/5 active:bg-[#16243d]/10 transition-colors"
                          title="Clear formatting"
                          aria-label="Clear formatting"
                        >
                          <span className="text-[10px]">T̶</span>
                        </button>
                      </div>
                      <div
                        ref={reflectionRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={event => {
                          // Intentionally no-op: sync happens on blur to avoid
                          // React fighting the contenteditable DOM on every keystroke.
                        }}
                        onBlur={() => {
                          if (reflectionRef.current) {
                            const html = reflectionRef.current.innerHTML;
                            const words = html
                              .replace(/<[^>]+>/g, " ")
                              .replace(/\s+/g, " ")
                              .trim()
                              .split(/\s+/)
                              .filter(Boolean);
                            const capped =
                              words.length > MAX_REFLECTION_WORDS
                                ? words.slice(0, MAX_REFLECTION_WORDS).join(" ")
                                : words.join(" ");
                            const finalHtml = capped || "";
                            setReflectionText(finalHtml);
                            setLastSavedAt(
                              new Date().toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            );
                            saveReflectionToNotes(finalHtml);
                          }
                        }}
                        className="w-full min-h-[120px] rounded-xl border border-[var(--brand)]/30 bg-[#fffaf0]/50 p-5 text-sm leading-7 text-[#16243d] outline-none focus:outline-none break-words"
                      />
                      {(!reflectionText || reflectionText.trim() === "") && (
                        <p className="absolute inset-0 flex items-center pt-8 pl-6 text-[#9aa3b4] text-sm pointer-events-none">
                          Write your reflection here…
                        </p>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-black uppercase tracking-[.12em] ${reflectionOverLimit ? "text-[#b80000]" : "text-[#4a566a]"}`}
                        >
                          {Math.min(reflectionWordCount, MAX_REFLECTION_WORDS)}{" "}
                          / {MAX_REFLECTION_WORDS} words
                        </span>
                        {lastSavedAt && (
                          <span className="text-[10px] font-black uppercase tracking-[.12em] text-[#8b5e14]">
                            · Saved {lastSavedAt}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-black uppercase tracking-[.12em] ${reflectionText.trim() && !reflectionOverLimit ? "text-[#16243d]" : "text-[var(--brand-light)]"}`}
                      >
                        {reflectionText.trim() && !reflectionOverLimit
                          ? "Ready to complete"
                          : "Reflection required"}
                      </span>
                    </div>
                    <p className="mt-3 text-[10px] font-black uppercase tracking-[.12em] text-[#4a566a]">
                      Your reflection is saved automatically and counts toward
                      module completion.
                    </p>
                  </motion.div>
                )}

              {lesson.sections[activeSectionIndex].heading === "Illustration" &&
                lesson.illustration && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="mt-6 flex flex-col items-center gap-4 rounded-3xl border border-[var(--brand)]/30 bg-white/50 p-8 shadow-sm"
                  >
                    <img
                      src={lesson.illustration.visualUrl}
                      alt={lesson.illustration.visualAlt}
                      className="max-w-lg h-auto rounded-2xl shadow-lg"
                    />
                    <p className="text-[10px] font-black uppercase tracking-[.12em] text-[var(--brand)]">
                      {lesson.illustration.caption}
                    </p>
                  </motion.div>
                )}
            </motion.div>
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                size="sm"
                disabled={activeSectionIndex === 0}
                onClick={() =>
                  setActiveSectionIndex(prev => Math.max(0, prev - 1))
                }
                className="border-[#16243d]/20 text-[#5d4613] hover:border-[var(--brand)]"
              >
                <ArrowLeft size={12} /> Previous section
              </Button>
              <span className="text-[10px] font-black uppercase tracking-[.12em] text-[#5d4613]">
                Section {activeSectionIndex + 1} of {lesson.sections.length}
              </span>
              <Button
                variant="primary"
                size="sm"
                disabled={activeSectionIndex >= lesson.sections.length - 1}
                onClick={() =>
                  setActiveSectionIndex(prev =>
                    Math.min(lesson.sections.length - 1, prev + 1)
                  )
                }
                className="border-[var(--brand)] bg-[var(--brand)] text-[#16243d] hover:bg-[#b38e3f]"
              >
                Next section <ArrowRight size={12} />
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="mt-12 border-t border-[#16243d]/10 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs font-black uppercase tracking-[.12em] text-[#5d4613]">
            <span className="flex items-center gap-1">
              <Flame size={12} className="text-[var(--brand-light)]" />
              {streak} day streak
            </span>
            <span className="flex items-center gap-1">
              <Trophy size={12} className="text-[var(--brand-light)]" />
              {xp} XP
            </span>
            <span className="flex items-center gap-1">
              <svg
                width={12}
                height={12}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {Math.floor(timerSeconds / 60)}:
              {String(timerSeconds % 60).padStart(2, "0")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={breadcrumbsUrl(courseSlug, moduleIndex, lessonIndex, true)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#16243d]/20 px-4 py-3 text-[10px] font-black uppercase tracking-[.12em] text-[#5d4613] transition-colors hover:border-[var(--brand)]"
            >
              <ArrowLeft size={12} /> Previous
            </Link>
            <Link
              href={breadcrumbsUrl(courseSlug, moduleIndex, lessonIndex, false)}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--brand)] bg-[var(--brand)] px-5 py-3 text-[10px] font-black uppercase tracking-[.12em] text-[#16243d] shadow-lg transition-all hover:shadow-xl hover:bg-[#b38e3f] active:scale-95"
            >
              Next <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function moduleUrl(courseSlug: string, moduleId: string) {
  const url = new URL(window.location.href);
  url.searchParams.set("module", moduleId);
  url.searchParams.delete("lesson");
  return url.toString();
}

function breadcrumbsUrl(
  courseSlug: string,
  moduleIndex: number,
  lessonIndex: number,
  previous: boolean
) {
  const url = new URL(window.location.href);
  const targetLessonIndex = previous ? lessonIndex - 1 : lessonIndex + 1;
  url.searchParams.set("module", `module-${moduleIndex + 1}`);
  if (targetLessonIndex >= 0) {
    url.searchParams.set(
      "lesson",
      `module-${moduleIndex + 1}-lesson-${targetLessonIndex + 1}`
    );
  } else {
    url.searchParams.delete("lesson");
  }
  return url.toString();
}

export default function CourseWorkspace() {
  const [, routeParams] = useRoute("/courses/:slug");
  const baseCourse = courseCatalog.find(
    item => item.slug === routeParams?.slug
  );
  const [progress, setProgress] = useState<SavedProgress>(() =>
    baseCourse ? readProgress(baseCourse) : emptyProgress()
  );

  const [openModuleId, setOpenModuleId] = useState<string | null>(null);
  const [viewKey, setViewKey] = useState(0);
  const [reflectionDraft, setReflectionDraft] = useState("");
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const hasAutoNavigated = useRef(false);

  const course = baseCourse;
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const courseState = trpc.course.state.useQuery(
    { courseSlug: course?.slug ?? "" },
    { enabled: isAuthenticated && !!course }
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const target = params.get("lesson") || params.get("module");
    if (target) {
      const el = document.getElementById(target);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-[var(--brand)]", "ring-offset-2");
        setTimeout(
          () =>
            el.classList.remove("ring-2", "ring-[var(--brand)]", "ring-offset-2"),
          2500
        );
      }
      if (params.get("module")) {
        setOpenModuleId(params.get("module"));
      } else if (params.get("lesson")) {
        const module = course?.modules.find(m =>
          m.lessons.some(l => l.id === target)
        );
        if (module) setOpenModuleId(module.id);
      }
      const lesson = course?.modules
        .flatMap(m => m.lessons)
        .find(l => l.id === target);
      if (lesson) setReflectionDraft(progress.reflections?.[lesson.id] ?? "");
    } else if (!hasAutoNavigated.current && progress.lastLessonId) {
      hasAutoNavigated.current = true;
      const lesson = course?.modules
        .flatMap(m => m.lessons)
        .find(l => l.id === progress.lastLessonId);
      if (lesson) {
        const module = course?.modules.find(m =>
          m.lessons.some(l => l.id === progress.lastLessonId)
        );
        if (module) {
          const url = new URL(window.location.href);
          url.searchParams.set("module", module.id);
          url.searchParams.set("lesson", progress.lastLessonId);
          window.history.pushState({}, "", url.toString());
          setOpenModuleId(module.id);
          setReflectionDraft(
            progress.reflections?.[progress.lastLessonId] ?? ""
          );
        }
      }
    }
  }, [course, progress, viewKey]);

  if (!course) {
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

  const paidStages =
    courseState.data
      ?.find(item => item.enrollment.courseSlug === course.slug)
      ?.stages.filter(stage => stage.paymentStatus === "paid").length ?? 0;

  const completedLessons = progress.lessons.length;
  const passedQuizzes = Object.values(progress.quizScores).filter(
    score => score >= 70
  ).length;
  const courseProgress = Math.round(
    (completedLessons / (course.modules.length * 7)) * 70 +
      (passedQuizzes / course.modules.length) * 30
  );

  const urlParams = new URLSearchParams(window.location.search);
  const selectedLessonId = urlParams.get("lesson");
  const selectedLesson = selectedLessonId
    ? course.modules
        .flatMap(m => m.lessons)
        .find(l => l.id === selectedLessonId)
    : null;
  const selectedModule = selectedLesson
    ? course.modules.find(m => m.lessons.some(l => l.id === selectedLessonId))
    : null;
  const position =
    selectedLesson && selectedLessonId
      ? findLessonPosition(course, selectedLessonId)
      : null;

  const modulePageId = urlParams.get("module") || openModuleId;

  const handleMarkComplete = useCallback(() => {
    if (!selectedLessonId || !selectedModule) return;
    const nextLessons = [...progress.lessons];
    if (!nextLessons.includes(selectedLessonId)) {
      nextLessons.push(selectedLessonId);
    }
    const nextReflections = {
      ...progress.reflections,
      [selectedLessonId]: reflectionDraft,
    };
    let xpGain = 0;
    let newBadges = [...progress.badges];

    const wasComplete = lessonComplete(progress, selectedLessonId);
    if (!wasComplete) {
      xpGain = XP_PER_LESSON;
      if (
        moduleComplete({ ...progress, lessons: nextLessons }, selectedModule)
      ) {
        xpGain += XP_PER_MODULE;
        newBadges.push(
          `Module ${course.modules.findIndex(m => m.id === selectedModule.id) + 1} mastered`
        );
      }
      if (
        nextLessons.length ===
        course.modules.reduce((acc, m) => acc + m.lessons.length, 0)
      ) {
        xpGain += COURSE_COMPLETION_XP;
        newBadges.push("Course complete");
      }
    }

    const today = new Date().toDateString();
    let streak = progress.streak;
    if (progress.lastActive !== today) {
      streak = progress.lastActive
        ? new Date(today).getTime() - new Date(progress.lastActive).getTime() <=
          86400000
          ? progress.streak + 1
          : 1
        : 1;
    }

    setProgress(prev => ({
      ...prev,
      lessons: nextLessons,
      reflections: nextReflections,
      xp: prev.xp + xpGain,
      streak,
      badges: [...new Set(newBadges)],
    }));
    writeProgress(course, {
      ...progress,
      lessons: nextLessons,
      reflections: nextReflections,
      xp: progress.xp + xpGain,
      streak,
      lastLessonId: selectedLessonId,
      lastActive: new Date().toDateString(),
      badges: [...new Set(newBadges)],
    });
    setCelebrationVisible(true);
    setReflectionDraft("");
    setTimeout(() => setCelebrationVisible(false), 1500);

    const url = new URL(window.location.href);
    url.searchParams.delete("lesson");
    window.history.pushState({}, "", url.toString());
    toast.success("Lesson complete", {
      description: `+${xpGain} XP earned. Keep going!`,
    });
  }, [progress, selectedLessonId, selectedModule, course, reflectionDraft]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f7f3e8] text-[#16243d]">
        <TransformationNav active="courses" />
        <main className="container flex min-h-[70vh] items-center justify-center py-16">
          <div className="text-center">
            <Loader2
              className="mx-auto animate-spin text-[var(--brand-light)]"
              size={32}
            />
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
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.14em] text-[#5d4613] transition-colors hover:text-[var(--brand-light)]"
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
                      Stage 1: Free · Stages 2–4:{" "}
                      {course.stageAmountsKes
                        .slice(1)
                        .map(amount => `KES ${amount.toLocaleString()}`)
                        .join(" / ")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--brand)]/40 bg-[#16243d] p-6 text-[#f7f3e8] sm:p-8">
                <p className="eyebrow text-[var(--brand-light)]">
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
                  <CourseEnrollmentForm courseSlug={course.slug} />
                ) : (
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <CourseEnrollmentForm
                      courseSlug={course.slug}
                      className="mt-0"
                    />
                    <Link
                      href={`/auth?mode=login&returnTo=${encodeURIComponent(`/courses/${course.slug}?workspace=1`)}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-[var(--brand)]/70 px-5 py-4 text-[10px] font-black uppercase tracking-[.15em] text-[#f7f3e8] transition-all hover:shadow-md"
                    >
                      Already have an account? Sign in <ArrowRight size={14} />
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

  if (selectedLesson && selectedModule && position && selectedLessonId) {
    const modIndex = course.modules.findIndex(m => m.id === selectedModule.id);
    const modStatus = modulePaidStatus(modIndex, paidStages);
    const prevModComplete = previousModuleComplete(
      progress,
      course.modules,
      modIndex
    );
    const prevLessonDone = previousLessonComplete(
      progress,
      selectedModule.lessons,
      position.lessonIndex
    );
    const canAccess = modStatus.isPaid && prevModComplete && prevLessonDone;
    const isComplete = lessonFullyComplete(progress, selectedLesson);
    const reflectionText = progress.reflections?.[selectedLesson.id] ?? "";

    return (
      <div className="min-h-screen bg-[#f7f3e8] text-[#16243d]">
        <TransformationNav active="courses" />
        <main className="container py-8 sm:py-12">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 flex items-center justify-between">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.12em] text-[#5d4613] transition-colors hover:text-[var(--brand-light)]"
              >
                <ArrowLeft size={12} /> All courses
              </Link>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--brand)]/40 bg-[#fffaf0] px-3 py-1 text-[10px] font-black uppercase tracking-[.10em] text-[var(--brand)]">
                  Module {modIndex + 1}
                </span>
                <span className="text-[10px] font-black uppercase tracking-[.10em] text-[#4a566a]">
                  &gt;
                </span>
                <span className="text-[10px] font-black uppercase tracking-[.10em] text-[var(--brand)]">
                  Lesson {position.lessonIndex + 1}
                </span>
              </div>
            </div>

            {!canAccess && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-[#16243d]/15 bg-white/60 p-10 shadow-sm text-center"
              >
                <Lock size={32} className="mx-auto mb-4 text-[var(--brand-light)]" />
                <h2 className="display mt-2 text-2xl text-[#16243d]">
                  Lesson locked
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#4a566a]">
                  {!modStatus.isPaid
                    ? `Pay Stage ${modStatus.requiredStage} to unlock Modules ${modIndex * 2 + 2}–${Math.min(modIndex * 2 + 4, 10)}.`
                    : !prevModComplete
                      ? "Complete the previous module first."
                      : "Complete the previous lesson first."}
                </p>
              </motion.div>
            )}

            {canAccess && (
              <LessonContent
                lesson={selectedLesson}
                courseSlug={course.slug}
                moduleIndex={modIndex}
                lessonIndex={position.lessonIndex}
                totalModules={course.modules.length}
                totalLessons={course.modules.reduce(
                  (acc, m) => acc + m.lessons.length,
                  0
                )}
                onComplete={handleMarkComplete}
                isComplete={isComplete}
                reflectionText={reflectionText}
                setReflectionText={setReflectionDraft}
                xp={progress.xp}
                streak={progress.streak}
                visualAssets={selectedLesson.visualAssets}
              />
            )}
          </div>
        </main>
      </div>
    );
  }

  // Module page view — dedicated page for each module
  if (modulePageId && !selectedLessonId) {
    const modIdx = course.modules.findIndex(m => m.id === modulePageId);
    const module = course.modules[modIdx];
    if (module) {
      const modStatus = modulePaidStatus(modIdx, paidStages);
      const isModComplete = moduleComplete(progress, module);
      const prevModComplete = previousModuleComplete(
        progress,
        course.modules,
        modIdx
      );
      const canAccess = modStatus.isPaid && prevModComplete;
      const prevModule = modIdx > 0 ? course.modules[modIdx - 1] : null;
      const nextModule =
        modIdx < course.modules.length - 1 ? course.modules[modIdx + 1] : null;
      const completedCount = module.lessons.filter(l =>
        lessonComplete(progress, l.id)
      ).length;

      return (
        <div className="min-h-screen bg-[#f7f3e8] text-[#16243d]">
          <TransformationNav active="courses" />
          <main className="container py-8 sm:py-12">
            <div className="mx-auto max-w-5xl">
              <div className="mb-8 flex items-center justify-between">
                <Link
                  href={`/courses/${course.slug}`}
                  className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.12em] text-[#5d4613] transition-colors hover:text-[var(--brand-light)]"
                >
                  <ArrowLeft size={12} /> Back to modules
                </Link>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--brand)]/40 bg-[#fffaf0] px-3 py-1 text-[10px] font-black uppercase tracking-[.10em] text-[var(--brand)]">
                    Module {modIdx + 1} of {course.modules.length}
                  </span>
                </div>
              </div>

              {!canAccess && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl border border-[#16243d]/15 bg-white/60 p-10 shadow-sm text-center"
                >
                  <Lock size={32} className="mx-auto mb-4 text-[var(--brand-light)]" />
                  <h2 className="display mt-2 text-2xl text-[#16243d]">
                    Module locked
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[#4a566a]">
                    {!modStatus.isPaid
                      ? `Pay Stage ${modStatus.requiredStage} to unlock this module.`
                      : !prevModComplete
                        ? "Complete the previous module first."
                        : ""}
                  </p>
                </motion.div>
              )}

              {canAccess && (
                <>
                  <div className="rounded-3xl border border-[#16243d]/15 bg-[var(--card)] p-8 shadow-xl mb-10">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#5d4613]">
                          Module {modIdx + 1} of {course.modules.length}
                        </p>
                        <h1 className="display mt-2 text-3xl tracking-tight text-[#16243d]">
                          {module.title}
                        </h1>
                        <p className="mt-4 text-sm leading-7 text-[#4a566a]">
                          {module.promise}
                        </p>
                        <div className="mt-6 flex items-center gap-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[.10em] ${modStatus.isFree || modStatus.isPaid ? "border-[var(--brand)]/40 bg-[#ead9ae]/40 text-[#8b5e14]" : "border-[#16243d]/20 text-[#4a566a]"}`}
                          >
                            {modStatus.isFree
                              ? "Free"
                              : `Stage ${modStatus.requiredStage}`}
                          </span>
                          {isModComplete && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--brand)]/40 bg-[#ead9ae]/40 px-3 py-1 text-[10px] font-black uppercase tracking-[.10em] text-[#8b5e14]">
                              <Check size={10} /> Complete
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--brand)]/30 bg-[#fffaf0]">
                        <span className="text-[10px] font-black text-[var(--brand)]">
                          {modIdx + 1}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {module.lessons.map((lesson, lessonIndex) => {
                      const isLessonComplete = lessonComplete(
                        progress,
                        lesson.id
                      );
                      const prevLessonDone = previousLessonComplete(
                        progress,
                        module.lessons,
                        lessonIndex
                      );
                      const canAccessLesson =
                        modStatus.isPaid && prevModComplete && prevLessonDone;

                      return (
                        <motion.div
                          key={lesson.id}
                          id={lesson.id}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            if (!canAccessLesson) return;
                            setViewKey(k => k + 1);
                            const url = new URL(window.location.href);
                            url.searchParams.set("module", modulePageId!);
                            url.searchParams.set("lesson", lesson.id);
                            window.history.pushState({}, "", url.toString());
                            writeProgress(course, {
                              ...progress,
                              lastLessonId: lesson.id,
                              lastActive: new Date().toDateString(),
                            });
                          }}
                          className={`rounded-2xl p-5 border transition-all duration-200 group cursor-pointer ${lessonCardClassName(canAccessLesson, isLessonComplete)}`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-full border flex-shrink-0 ${lessonBadgeClassName(isLessonComplete, canAccessLesson)}`}
                            >
                              <span
                                className={`text-[9px] font-black ${lessonNumberClassName(isLessonComplete, canAccessLesson)}`}
                              >
                                {lessonIndex + 1}
                              </span>
                            </div>
                            {isLessonComplete && (
                              <Check size={12} className="text-[#8b5e14]" />
                            )}
                            {!canAccessLesson && (
                              <Lock size={12} className="text-[#4a566a]" />
                            )}
                          </div>
                          <p
                            className={`text-sm leading-6 transition-colors ${lessonTitleClassName(canAccessLesson)}`}
                          >
                            {lesson.title}
                          </p>
                          <div className="mt-3 flex items-center gap-1">
                            <span
                              className={`text-[9px] uppercase tracking-[.08em] ${lessonTagClassName(modStatus.isFree, modStatus.isPaid)}`}
                            >
                              {modStatus.isFree
                                ? "Free"
                                : `Stage ${modStatus.requiredStage}`}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-[.08em] text-[var(--brand-light)]">
                              +{XP_PER_LESSON} XP
                            </span>
                            {!prevLessonDone && lessonIndex > 0 && (
                              <span className="text-[9px] text-[var(--brand-light)]">
                                · Previous lesson required
                              </span>
                            )}
                          </div>
                          {!canAccessLesson &&
                            modStatus.isPaid &&
                            prevLessonDone && (
                              <p className="mt-2 text-[10px] text-[var(--brand-light)]">
                                Previous lesson required
                              </p>
                            )}
                          {!canAccessLesson && !modStatus.isPaid && (
                            <p className="mt-2 text-[10px] text-[var(--brand-light)]">
                              Pay Stage {modStatus.requiredStage} to unlock
                            </p>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
                    {prevModule && (
                      <Link
                        href={moduleUrl(course.slug, prevModule.id)}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#16243d]/20 px-5 py-3 text-[10px] font-black uppercase tracking-[.12em] text-[#5d4613] transition-colors hover:border-[var(--brand)] hover:bg-[#fffaf0]"
                      >
                        <ArrowLeft size={12} />
                        Previous module
                      </Link>
                    )}
                    {nextModule && (
                      <Link
                        href={moduleUrl(course.slug, nextModule.id)}
                        className="inline-flex items-center gap-2 rounded-xl border border-[var(--brand)] bg-[var(--brand)] px-5 py-3 text-[10px] font-black uppercase tracking-[.12em] text-[#16243d] shadow-lg transition-all hover:shadow-xl hover:bg-[#b38e3f] active:scale-95"
                      >
                        Next module <ArrowRight size={12} />
                      </Link>
                    )}
                    {!prevModule && !nextModule && (
                      <span className="text-[10px] font-black uppercase tracking-[.12em] text-[#4a566a]">
                        This is the only module
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f3e8] text-[#16243d]">
      <TransformationNav active="courses" />
      <main className="container py-10 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.14em] text-[#5d4613] transition-colors hover:text-[var(--brand-light)]"
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
                  Stage 1: Free · Stages 2–4:{" "}
                  {course.stageAmountsKes
                    .slice(1)
                    .map(amount => `KES ${amount.toLocaleString()}`)
                    .join(" / ")}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-3xl border border-[#16243d]/15 bg-[var(--card)] p-8 shadow-xl">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[.14em] text-[#5d4613]">
                  Your progress
                </p>
                <h2 className="display mt-1 text-2xl">Learning signal</h2>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[.12em] text-[#5d4613]">
                Lessons + quizzes
              </span>
            </div>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div className="flex items-center gap-3">
                <p className="display text-5xl tracking-[-.05em] text-[#16243d]">
                  {courseProgress}%
                </p>
                <span className="text-[10px] font-black uppercase tracking-[.12em] text-[var(--brand-light)]">
                  {gamificationLevel(progress.xp)}
                </span>
              </div>
              <p className="text-right text-xs leading-5 text-[#5d4613]">
                {completedLessons} of {course.modules.length * 7} lessons
                <br />
                {passedQuizzes} of {course.modules.length} quizzes passed
              </p>
            </div>
            <div className="mt-6">
              <ProgressMotionBar value={Math.min(courseProgress, 100)} height={12} />
              <EncouragementMessage value={courseProgress} className="mt-2" />
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] font-black uppercase tracking-[.12em] text-[#4a566a]">
              <span>
                {progress.xp} XP · {progress.streak} day streak ·{" "}
                {progress.badges.length} badges
              </span>
              <span>{gamificationLevel(progress.xp)}</span>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <AchievementBadge show={progress.streak > 1}>
                {progress.streak} day streak
              </AchievementBadge>
              <ProgressCelebration
                show={courseProgress >= 100}
                message="Certificate unlocked — course complete!"
              />
            </div>
          </div>

          <div className="mt-10">
            <p className="eyebrow text-[#5d4613]">Modules</p>
            <h2 className="display mt-2 text-3xl tracking-[-.03em] text-[#16243d]">
              {course.modules.length} modules · {course.modules.length * 7}{" "}
              lessons
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {course.modules.map((module, index) => {
                const modStatus = modulePaidStatus(index, paidStages);
                const isModComplete = moduleComplete(progress, module);
                const prevModComplete = previousModuleComplete(
                  progress,
                  course.modules,
                  index
                );
                const canAccess = modStatus.isPaid && prevModComplete;
                const completedCount = module.lessons.filter(l =>
                  lessonComplete(progress, l.id)
                ).length;

                return (
                  <motion.div
                    key={module.id}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    id={module.id}
                    onClick={() => {
                      if (!canAccess) return;
                      setOpenModuleId(module.id);
                      const url = new URL(window.location.href);
                      url.searchParams.set("module", module.id);
                      url.searchParams.delete("lesson");
                      window.history.pushState({}, "", url.toString());
                    }}
                    className={`rounded-3xl border p-7 shadow-sm transition-all duration-300 group cursor-pointer ${moduleClassName(openModuleId === module.id, canAccess, isModComplete)}`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--brand)]/30 bg-[#fffaf0]">
                          <span className="text-[10px] font-black text-[var(--brand)]">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#5d4613]">
                            Module
                          </p>
                          <ChevronRight
                            size={12}
                            className={`text-[var(--brand-light)] transition-all duration-200 ${
                              openModuleId === module.id ? "rotate-90" : ""
                            }`}
                          />
                        </div>
                      </div>
                      <span
                        className={`text-[9px] font-black uppercase tracking-[.10em] ${moduleStatusColor(isModComplete, modStatus.isFree, modStatus.isPaid)}`}
                      >
                        {statusText(
                          isModComplete,
                          modStatus.isFree,
                          modStatus.isPaid,
                          modStatus.requiredStage
                        )}
                      </span>
                    </div>
                    <h3
                      className={`mt-2 text-xl font-black tracking-tight transition-colors ${canAccess ? "text-[#16243d] group-hover:text-[var(--brand-light)]" : "text-[#4a566a]"}`}
                    >
                      {module.title}
                    </h3>
                    {!canAccess && (
                      <p className="mt-2 text-[10px] text-[var(--brand-light)]">
                        {modStatus.isFree
                          ? ""
                          : `Complete Module ${index} and pay Stage ${modStatus.requiredStage} to unlock`}
                      </p>
                    )}
                    {canAccess && (
                      <>
                        <p className="mt-2 text-[11px] leading-6 text-[#4a566a]">
                          {module.promise}
                        </p>
                        <div className="mt-4 flex items-center gap-1">
                          {Array.from({ length: module.lessons.length }).map(
                            (_, i) => (
                              <div
                                key={i}
                                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                                  i < completedCount
                                    ? "bg-[var(--brand)]"
                                    : i === completedCount && !isModComplete
                                      ? "bg-[var(--brand)]/30"
                                      : "bg-[#16243d]/10"
                                }`}
                              />
                            )
                          )}
                        </div>
                        {isModComplete && (
                          <div className="mt-3 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[.10em] text-[#8b5e14]">
                            <Check size={12} /> Complete &nbsp;
                            <span className="text-[var(--brand-light)]">
                              +{XP_PER_MODULE} XP
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <CourseShareActions
              courseSlug={course.slug}
              courseTitle={course.title}
              shareLabel="Share this course"
              platforms={[
                "facebook",
                "linkedin",
                "whatsapp",
                "email",
                "copy",
                "native",
              ]}
            />
            <Link href="/dashboard">
              <Button variant="outline">
                My dashboard <ArrowUpRight size={14} />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

function isSpecialSection(heading: string): boolean {
  return [
    "Deep Dive",
    "Worked Example",
    "Key Takeaway",
    "Reflection Prompt",
    "Illustration",
  ].includes(heading);
}

function moduleLessons(moduleId: string | null, modules: CourseModule[]) {
  return modules.find(m => m.id === moduleId)?.lessons ?? [];
}

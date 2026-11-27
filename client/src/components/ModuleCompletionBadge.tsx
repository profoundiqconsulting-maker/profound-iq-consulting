import { Award, Check, Lock, Sparkles } from "lucide-react";
import type { CourseModuleBadge } from "@shared/courseBadges";

export function ModuleCompletionBadge({
  badge,
  compact = false,
  onSelect,
}: {
  badge: CourseModuleBadge;
  compact?: boolean;
  onSelect?: () => void;
}) {
  const isEarned = badge.status === "earned";
  const isInProgress = badge.status === "in-progress";
  const content = (
    <div
      className={`flex items-center gap-3 border p-3 transition ${isEarned ? "border-[var(--brand)] bg-[#fff7dc]" : isInProgress ? "border-[#a27e2e]/35 bg-white/65" : "border-[#16243d]/10 bg-[#f7f3e8]"}`}
    >
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${isEarned ? "bg-[var(--brand)] text-[#16243d]" : isInProgress ? "border border-[#a27e2e] text-[var(--brand)]" : "border border-[#16243d]/20 text-[#657084]"}`}
      >
        {isEarned ? (
          <Check size={16} strokeWidth={3} />
        ) : isInProgress ? (
          <Award size={16} />
        ) : (
          <Lock size={15} />
        )}
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-black uppercase tracking-[.11em] text-[var(--brand)]">
          Module {badge.moduleIndex + 1} · {badge.label}
        </span>
        {!compact && (
          <span className="mt-1 block truncate text-xs font-semibold text-[#16243d]">
            {badge.title}
          </span>
        )}
        <span className="mt-1 block text-[10px] text-[#657084]">
          {badge.completedLessons}/{badge.totalLessons} lessons ·{" "}
          {badge.quizPassed ? "Quiz passed" : "Quiz pending"}
        </span>
      </span>
      {isEarned && (
        <Sparkles
          className="ml-auto shrink-0 text-[var(--brand)]"
          size={15}
          aria-label="Completion badge earned"
        />
      )}
    </div>
  );
  return onSelect ? (
    <button
      type="button"
      onClick={onSelect}
      className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
    >
      {content}
    </button>
  ) : (
    content
  );
}

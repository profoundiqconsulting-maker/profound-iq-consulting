/* Profound IQ Consulting — ProgressMotion
 * Reusable, brand-aligned motion graphics tied to real progress.
 * Respects prefers-reduced-motion. Animations run in the browser only.
 */
import { type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function progressColor(value: number): string {
  if (value >= 67) return "var(--success)";
  if (value >= 34) return "var(--warning)";
  return "var(--danger)";
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function ProgressMotionBar({
  value,
  className,
  height = 8,
  showLabel = false,
}: {
  value: number;
  className?: string;
  height?: number;
  showLabel?: boolean;
}) {
  const reduce = useReducedMotion();
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={cn("w-full", className)}>
      <div
        className="w-full overflow-hidden rounded-full bg-[var(--border)]"
        style={{ height }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: progressColor(clamped) }}
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: reduce ? 0 : 0.7, ease: EASE }}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-right text-[10px] font-bold uppercase tracking-[.12em] text-[var(--muted-foreground)]">
          {clamped}%
        </p>
      )}
    </div>
  );
}

export function ProgressMotionRing({
  value,
  size = 56,
  strokeWidth = 5,
  label,
  className,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  return (
    <div
      className={cn("relative inline-grid place-items-center", className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={progressColor(clamped)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={reduce ? false : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: reduce ? 0 : 0.8, ease: EASE }}
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-[var(--foreground)]">
        {label ?? `${clamped}%`}
      </span>
    </div>
  );
}

export function ProgressMilestone({
  achieved,
  className,
}: {
  achieved: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      className={cn(
        "grid h-6 w-6 place-items-center rounded-full border",
        achieved
          ? "border-[var(--success)] bg-[var(--success)] text-[var(--brand-fg)]"
          : "border-[var(--border)] bg-[var(--bg)] text-[var(--muted-foreground)]",
        className
      )}
      animate={
        achieved && !reduce
          ? { scale: [1, 1.25, 1], boxShadow: ["0 0 0 0 rgba(46,139,87,0)", "0 0 0 6px rgba(46,139,87,0.15)", "0 0 0 0 rgba(46,139,87,0)"] }
          : { scale: 1 }
      }
      transition={{ duration: reduce ? 0 : 0.6 }}
    >
      {achieved ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
    </motion.span>
  );
}

export function ProgressCelebration({
  show,
  message = "Great work! You're making excellent progress.",
  className,
}: {
  show: boolean;
  message?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="celebration"
          initial={reduce ? false : { opacity: 0, scale: 0.9, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: reduce ? 0 : 0.35, ease: EASE }}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border border-[var(--success)]/40 bg-[var(--success)]/10 px-3 py-1.5 text-xs font-bold text-[var(--success)]",
            className
          )}
          role="status"
        >
          <motion.span
            animate={reduce ? {} : { rotate: [0, 18, -12, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: reduce ? 0 : 0.6 }}
          >
            <Check className="h-4 w-4" />
          </motion.span>
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const DEFAULT_MESSAGES: Array<{ min: number; text: string }> = [
  { min: 100, text: "Great work! You've completed this step." },
  { min: 67, text: "Excellent progress! You're nearly there." },
  { min: 34, text: "You're making steady progress. Keep it up!" },
  { min: 0, text: "Every step forward matters. Let's begin." },
];

export function EncouragementMessage({
  value,
  messages = DEFAULT_MESSAGES,
  className,
}: {
  value: number;
  messages?: Array<{ min: number; text: string }>;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const sorted = [...messages].sort((a, b) => b.min - a.min);
  const text = sorted.find(m => clamped >= m.min)?.text ?? messages[0]?.text ?? "";
  return (
    <div className={cn("overflow-hidden", className)} aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.p
          key={text}
          initial={reduce ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: reduce ? 0 : 0.25 }}
          className="text-xs font-semibold text-[var(--gold)]"
        >
          {text}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

export function ProgressPageTransition({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedCard({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: reduce ? 0 : 0.45, ease: EASE, delay: reduce ? 0 : delay }}
      whileHover={reduce ? undefined : { y: -3 }}
    >
      {children}
    </motion.div>
  );
}

export function AchievementBadge({
  show,
  children,
  className,
}: {
  show: boolean;
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full bg-[var(--gold)]/15 px-3 py-1 text-[10px] font-black uppercase tracking-[.12em] text-[var(--gold)]",
            className
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
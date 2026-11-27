import { useDialogComposition } from "@/components/ui/dialog";
import { useComposition } from "@/hooks/useComposition";
import { cn } from "@/lib/utils";
import * as React from "react";

function Input({
  className,
  type,
  onKeyDown,
  onCompositionStart,
  onCompositionEnd,
  ...props
}: React.ComponentProps<"input">) {
  const dialogComposition = useDialogComposition();

  const {
    onCompositionStart: handleCompositionStart,
    onCompositionEnd: handleCompositionEnd,
    onKeyDown: handleKeyDown,
  } = useComposition<HTMLInputElement>({
    onKeyDown: e => {
      const isComposing =
        (e.nativeEvent as any).isComposing ||
        dialogComposition.justEndedComposing();

      if (e.key === "Enter" && isComposing) {
        return;
      }

      onKeyDown?.(e);
    },
    onCompositionStart: e => {
      dialogComposition.setComposing(true);
      onCompositionStart?.(e);
    },
    onCompositionEnd: e => {
      dialogComposition.markCompositionEnd();
      setTimeout(() => {
        dialogComposition.setComposing(false);
      }, 100);
      onCompositionEnd?.(e);
    },
  });

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-md border bg-[var(--input-bg)] px-3 py-2 text-base text-[var(--fg)] placeholder:text-[var(--fg-muted)] shadow-xs transition-[color,box-shadow,border-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-[var(--border-focus)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ring-offset)]",
        "aria-invalid:border-[var(--danger)] aria-invalid:ring-[var(--danger)]/20",
        className
      )}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
}

export { Input };

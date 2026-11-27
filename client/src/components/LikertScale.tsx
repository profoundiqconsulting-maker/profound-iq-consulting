/* Shared Likert scale component for executive assessment experiences. */

import { useRef, useEffect, useState } from "react";

type LikertScaleOption = {
  value: number;
  label: string;
  description?: string;
};

type LikertScaleProps = {
  id: string;
  question: string;
  index?: number;
  options?: LikertScaleOption[];
  value?: number;
  onChange: (value: number) => void;
  lowLabel?: string;
  highLabel?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
};

const defaultOptions: LikertScaleOption[] = [
  { value: 1, label: "1", description: "Not like me" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5", description: "Very like me" },
];

export function LikertScale({
  id,
  question,
  index,
  options = defaultOptions,
  value,
  onChange,
  lowLabel = "Not like me",
  highLabel = "Very like me",
  onKeyDown,
}: LikertScaleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const handleClick = (optionIndex: number, optionValue: number) => {
    onChange(optionValue);
    setFocusedIndex(optionIndex);
  };

  const handleKeyDown = (e: React.KeyboardEvent, optionIndex: number) => {
    const lastIndex = options.length - 1;
    let newIndex =
      focusedIndex ?? (value ? options.findIndex(o => o.value === value) : 0);

    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        newIndex = Math.min(newIndex + 1, lastIndex);
        break;
      case "ArrowLeft":
        e.preventDefault();
        newIndex = Math.max(newIndex - 1, 0);
        break;
      case "Home":
        e.preventDefault();
        newIndex = 0;
        break;
      case "End":
        e.preventDefault();
        newIndex = lastIndex;
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        onChange(options[newIndex]?.value ?? 1);
        return;
      default:
        return;
    }
    setFocusedIndex(newIndex);
  };

  useEffect(() => {
    if (focusedIndex !== null && containerRef.current) {
      const optionElements =
        containerRef.current.querySelectorAll<HTMLLabelElement>(
          "[data-option-index]"
        );
      optionElements[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  return (
    <div
      ref={containerRef}
      className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] transition-all duration-300 hover:border-[var(--brand)]/40 hover:shadow-lg hover:shadow-[var(--brand)]/10"
      onKeyDown={onKeyDown}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[var(--brand)] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="p-5 sm:p-7">
        <div className="flex gap-4">
          {typeof index === "number" && (
            <span className="hidden text-xs font-black text-[var(--brand)] sm:block shrink-0">
              {String(index + 1).padStart(2, "0")}
            </span>
          )}
<div className="w-full">
          <p className="text-base font-semibold text-[var(--foreground)] leading-6">{question}</p>
          <div
            className={`mt-5 grid gap-2 sm:max-w-xl ${options.length <= 2 ? "grid-cols-2" : options.length <= 3 ? "grid-cols-3" : options.length <= 4 ? "grid-cols-4" : "grid-cols-5"}`}
            role="radiogroup"
            aria-label={question}
          >
              {options.map((option, optionIndex) => {
                const isSelected = value === option.value;
                const isFocused = focusedIndex === optionIndex;
                return (
<label
                      key={option.value}
                      data-option-index={optionIndex}
                      tabIndex={isFocused || isSelected ? 0 : -1}
                      onClick={() => handleClick(optionIndex, option.value)}
                      onKeyDown={e => handleKeyDown(e, optionIndex)}
                      onFocus={() => setFocusedIndex(optionIndex)}
                      onBlur={() => setFocusedIndex(null)}
                      className={`relative flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border px-3 py-3.5 text-center transition-all duration-200 min-w-0 ${
                        isSelected
                          ? "border-[var(--brand)] bg-[var(--navy-deep)] text-[var(--text-on-dark)] shadow-[0_0_0_2px_var(--brand)]"
                          : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--brand)]/40 hover:text-[var(--foreground)] hover:bg-[var(--brand)]/5"
                      } ${isFocused && !isSelected ? "ring-2 ring-[var(--brand)] ring-offset-2 ring-offset-[var(--card)]" : ""}`}
                    >
                      <input
                        type="radio"
                        name={id}
                        value={option.value}
                        checked={isSelected}
                        onChange={() => handleClick(optionIndex, option.value)}
                        className="sr-only"
                        aria-label={`${option.label}${option.description ? `, ${option.description}` : ""}`}
                      />
                    <span
                      className={`text-lg font-extrabold ${isSelected ? "text-[var(--gold-on-dark)]" : "text-[var(--foreground)]"}`}
                    >
                      {option.label}
                    </span>
                    {option.description && (
                      <span
                        className={`text-[9px] font-semibold uppercase tracking-[.1em] ${isSelected ? "text-[var(--gold-on-dark)]/70" : "text-[var(--muted-foreground)]"}`}
                      >
                        {option.description}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
            {(lowLabel || highLabel) && (
              <div className="mt-4 flex max-w-xl items-center justify-between text-[10px] font-bold uppercase tracking-[.12em] text-[var(--muted-foreground)]">
                <span>{lowLabel}</span>
                <span>{highLabel}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

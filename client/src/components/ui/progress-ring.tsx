import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressRingProps extends React.SVGAttributes<SVGSVGElement> {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function ProgressRing({
  value,
  max = 100,
  size = 64,
  strokeWidth = 6,
  showLabel = true,
  label,
  className,
  ...props
}: ProgressRingProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage / 100);

  return (
    <svg
      width={size}
      height={size}
      className={cn("transform -rotate-90", className)}
      role="progressbar"
      aria-valuenow={Math.round(percentage)}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label || `Progress: ${Math.round(percentage)}%`}
      {...props}
    >
      <circle
        className="text-[var(--muted)]"
        strokeWidth={strokeWidth}
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        className="text-[var(--gold)] transition-all duration-500 ease-out"
        strokeWidth={strokeWidth}
        stroke="currentColor"
        strokeLinecap="round"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transformOrigin: "center" }}
      />
      {showLabel && (
        <text
          x={size / 2}
          y={size / 2 + 4}
          textAnchor="middle"
          dominantBaseline="central"
          className="text-[var(--foreground)] font-bold tabular-nums"
          style={{ fontSize: size * 0.18 }}
        >
          {label ?? `${Math.round(percentage)}%`}
        </text>
      )}
    </svg>
  );
}
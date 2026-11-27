import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Profound IQ — Standardized Button Component
 *
 * Design System v3.1
 * - Base radius: 0.5rem (8px) matching --radius token
 * - Base unit: 8px spacing rhythm
 * - Color palette: semantic design tokens (--brand, --fg, --bg-sunken, etc.)
 * - Typography: Manrope, font-medium default, font-extrabold for brand/success/danger
 * - States: hover, active (scale 0.98), disabled (opacity 0.5), focus-visible (ring)
 * - Sizing system: sm / default / lg / xl / icon / icon-sm / icon-lg
 * - No width utilities baked in — consumers control width via className
 */

const buttonVariants = cva(
  // Base: consistent across all variants and sizes
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-180 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-[var(--border-focus)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ring-offset)] aria-invalid:ring-[var(--danger)]/20 dark:aria-invalid:ring-[var(--danger)]/40 aria-invalid:border-[var(--danger)] active:scale-[0.98] max-w-full overflow-hidden overflow-ellipsis",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--brand)] text-[var(--brand-fg)] hover:bg-[var(--brand-hover)] hover:shadow-lg hover:shadow-[var(--brand)]/20",
        secondary:
          "bg-[var(--bg-sunken)] text-[var(--fg)] border border-[var(--border)] hover:bg-[var(--bg-sunken)]/80",
        outline:
          "border-2 border-[var(--border)] bg-transparent text-[var(--fg)] hover:bg-[var(--bg-sunken)] hover:border-[var(--brand)]",
        ghost:
          "bg-transparent text-[var(--fg-muted)] hover:bg-[var(--bg-sunken)] hover:text-[var(--fg)]",
        link:
          "bg-transparent text-[var(--brand)] underline underline-offset-4 hover:underline",
        brand:
          "bg-[var(--brand)] text-[var(--brand-fg)] hover:bg-[var(--brand-hover)] hover:shadow-lg hover:shadow-[var(--brand)]/20 font-extrabold uppercase tracking-[.12em]",
        brandOutline:
          "border-2 border-[var(--brand)] text-[var(--brand)] bg-transparent font-extrabold uppercase tracking-[.12em] hover:bg-[var(--brand)] hover:text-[var(--brand-fg)]",
        subtle:
          "bg-[var(--bg-sunken)] text-[var(--fg-muted)] hover:bg-[var(--bg-sunken)]/80",
        success:
          "bg-[var(--success)] text-white hover:bg-[var(--success-hover)] hover:shadow-lg hover:shadow-[var(--success)]/20 font-extrabold uppercase tracking-[.12em]",
        danger:
          "bg-[var(--danger)] text-white hover:bg-[var(--danger-hover)] hover:shadow-lg hover:shadow-[var(--danger)]/20 font-extrabold uppercase tracking-[.12em]",
      },
      size: {
        sm: "h-9 rounded-md gap-1.5 px-3.5 text-xs has-[>svg]:px-3",
        default: "h-10 px-5 text-sm has-[>svg]:px-4",
        lg: "h-11 rounded-lg px-7 text-base has-[>svg]:px-5",
        xl: "h-12 rounded-xl px-8 text-lg has-[>svg]:px-6",
        icon: "size-10 gap-0",
        "icon-sm": "size-9 gap-0",
        "icon-lg": "size-11 gap-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

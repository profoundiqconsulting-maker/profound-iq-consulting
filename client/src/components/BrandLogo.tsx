import { useState } from "react";

const LOGO_URL = "/ProfoundIQLogo.png";

function LogoFallback({ context }: { context?: string }) {
  return <span aria-hidden="true" className="display text-xl font-semibold tracking-[-.08em] text-[#16243d]">PIQ<span className="text-[#a27e2e]">.</span></span>;
}

type BrandLogoProps = {
  context?: string;
  className?: string;
  compact?: boolean;
  compactOnMobile?: boolean;
};

export function BrandLogo({ context, className = "", compact = false, compactOnMobile = false }: BrandLogoProps) {
  const [failed, setFailed] = useState(false);
  const sizeClasses = compactOnMobile ? "h-11 w-11 sm:h-14 sm:w-[4.5rem]" : compact ? "h-11 w-11" : "h-16 w-20 sm:h-[4.5rem] sm:w-[5.75rem]";
  return (
    <span data-brand-logo className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-sm bg-white shadow-[0_8px_24px_rgba(16,29,53,.12)] ${sizeClasses} ${className}`}>
      {failed ? <LogoFallback context={context} /> : <img src={LOGO_URL} alt={context ? `Profound IQ Consulting — ${context}` : "Profound IQ Consulting"} className="h-full w-full object-contain p-1" loading="eager" decoding="async" onError={() => setFailed(true)} />}
    </span>
  );
}

export { LOGO_URL };

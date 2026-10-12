import { useState } from "react";

const LOGO_URL = "/ProfoundIQLogo.png";
const LOGO_192_PNG = "/ProfoundIQLogo-192.png";
const LOGO_192_WEBP = "/ProfoundIQLogo-192.webp";

function LogoFallback({ context }: { context?: string }) {
  return (
    <span
      aria-hidden="true"
      className="display text-xl font-semibold tracking-[-.08em] text-[#16243d]"
    >
      PIQ<span className="text-[#7d5e1e]">.</span>
    </span>
  );
}

type BrandLogoProps = {
  context?: string;
  className?: string;
  compact?: boolean;
  compactOnMobile?: boolean;
};

export function BrandLogo({
  context,
  className = "",
  compact = false,
  compactOnMobile = false,
}: BrandLogoProps) {
  const [failed, setFailed] = useState(false);
  const isCompact = compact || compactOnMobile;
  const sizeClasses = compactOnMobile
    ? "h-11 w-11 sm:h-14 sm:w-[4.5rem]"
    : compact
      ? "h-11 w-11"
      : "h-16 w-20 sm:h-[4.5rem] sm:w-[5.75rem]";
  const logoWidth = 160;
  const logoHeight = 74;
  return (
    <span
      data-brand-logo
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-sm bg-transparent shadow-[0_8px_24px_rgba(16,29,53,.12)] ${sizeClasses} ${className}`}
    >
      {failed ? (
        <LogoFallback context={context} />
      ) : (
        <picture>
          <source type="image/webp" srcSet={LOGO_192_WEBP} />
          <img
            src={LOGO_192_PNG}
            alt={
              context
                ? `Profound IQ Consulting — ${context}`
                : "Profound IQ Consulting"
            }
            className="h-full w-full object-contain p-1"
            loading="eager"
            decoding="async"
            width={logoWidth}
            height={logoHeight}
            onError={() => setFailed(true)}
          />
        </picture>
      )}
    </span>
  );
}

export { LOGO_URL };

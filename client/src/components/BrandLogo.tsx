const LOGO_URL = "/manus-storage/ProfoundIQLogo-header_aad21220.jpg";

type BrandLogoProps = {
  context?: string;
  className?: string;
  compact?: boolean;
  compactOnMobile?: boolean;
};

export function BrandLogo({ context, className = "", compact = false, compactOnMobile = false }: BrandLogoProps) {
  const sizeClasses = compactOnMobile ? "h-10 w-10 sm:h-11 sm:w-[8.5rem]" : compact ? "h-10 w-10" : "h-11 w-[8.5rem]";
  return (
    <span className={`inline-flex shrink-0 items-center overflow-hidden bg-white ${sizeClasses} ${className}`}>
      <img src={LOGO_URL} alt={context ? `Profound IQ Consulting — ${context}` : "Profound IQ Consulting"} className="h-full w-full object-contain" />
    </span>
  );
}

export { LOGO_URL };

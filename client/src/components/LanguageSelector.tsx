import { ChevronDown, Globe2 } from "lucide-react";
import {
  SUPPORTED_LOCALES,
  useLocale,
  type LocaleCode,
} from "@/contexts/LocaleContext";

type LanguageSelectorProps = {
  compact?: boolean;
  className?: string;
  onSelect?: () => void;
};

export function LanguageSelector({
  compact = false,
  className = "",
  onSelect,
}: LanguageSelectorProps) {
  const { locale, localeInfo, setLocale, t } = useLocale();
  return (
    <label
      className={`relative inline-flex items-center gap-2 border border-[#c9a34e]/60 bg-[#101d35] text-[#f7f3e8] transition-colors hover:border-[#f0cf73] ${compact ? "px-2.5 py-2" : "px-3 py-2.5"} ${className}`}
    >
      <Globe2
        size={compact ? 14 : 15}
        aria-hidden="true"
        className="shrink-0 text-[#c9a34e]"
      />
      <span className="sr-only">{t("selectLanguage")}</span>
      <span
        aria-hidden="true"
        className="max-w-[5.5rem] truncate text-[10px] font-black uppercase tracking-[.11em]"
      >
        {localeInfo.nativeLabel}
      </span>
      <ChevronDown
        size={13}
        aria-hidden="true"
        className="shrink-0 text-[#c9a34e]"
      />
      <select
        value={locale}
        onChange={event => {
          setLocale(event.target.value as LocaleCode);
          onSelect?.();
        }}
        aria-label={t("selectLanguage")}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0cf73]"
      >
        {SUPPORTED_LOCALES.map(item => (
          <option key={item.code} value={item.code}>
            {item.nativeLabel} · {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}

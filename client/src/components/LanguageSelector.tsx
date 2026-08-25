import { Globe2 } from "lucide-react";
import { SUPPORTED_LOCALES, useLocale, type LocaleCode } from "@/contexts/LocaleContext";

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useLocale();
  return <label className={`inline-flex items-center gap-2 border border-[#c9a34e]/60 bg-[#101d35] text-[#f7f3e8] ${compact ? "px-2 py-1.5" : "px-3 py-2"}`}>
    <Globe2 size={compact ? 14 : 15} aria-hidden="true" />
    <span className="sr-only">{t("selectLanguage")}</span>
    <select value={locale} onChange={(event) => setLocale(event.target.value as LocaleCode)} aria-label={t("selectLanguage")} className="max-w-[8rem] cursor-pointer bg-transparent text-[10px] font-black uppercase tracking-[.12em] outline-none">
      {SUPPORTED_LOCALES.map((item) => <option key={item.code} value={item.code} className="bg-[#101d35] text-[#f7f3e8]">{item.nativeLabel}</option>)}
    </select>
  </label>;
}

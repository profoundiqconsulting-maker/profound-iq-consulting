import { useCallback } from "react";

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
  { code: "de", label: "DE" },
];

type LanguageSelectorProps = {
  compact?: boolean;
  onSelect?: () => void;
};

export function LanguageSelector({ compact = false, onSelect }: LanguageSelectorProps) {
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      onSelect?.();
    },
    [onSelect]
  );

  return (
    <select
      aria-label="Select language"
      onChange={handleChange}
      className={
        compact
          ? "h-9 rounded-md border border-[#16243d]/20 bg-white px-2 text-xs text-[#16243d]"
          : "h-10 rounded-md border border-[#16243d]/20 bg-white px-3 text-sm text-[#16243d]"
      }
    >
      {LANGUAGES.map(language => (
        <option key={language.code} value={language.code}>
          {language.label}
        </option>
      ))}
    </select>
  );
}

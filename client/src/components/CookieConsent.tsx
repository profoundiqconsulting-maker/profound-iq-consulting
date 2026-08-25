import { useEffect, useState } from "react";
import { Check, Cookie, Settings2, X } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

const CONSENT_KEY = "profound-iq-cookie-consent";
type ConsentState = { essential: true; analytics: boolean };

export function CookieConsent() {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const { t } = useLocale();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONSENT_KEY);
      if (saved) setConsent(JSON.parse(saved) as ConsentState);
    } catch {
      setConsent(null);
    }
  }, []);

  const save = (next: ConsentState) => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(next));
    setConsent(next);
    setCustomizing(false);
  };

  if (consent) return null;

  return (
    <aside className="fixed inset-x-3 bottom-3 z-[70] border border-[#c9a34e]/60 bg-[#101d35] p-4 text-[#f7f3e8] shadow-2xl sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[430px]" aria-label={t("yourPrivacyChoices")}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center bg-[#c9a34e] text-[#101d35]"><Cookie size={17} /></div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div><p className="text-[10px] font-black uppercase tracking-[.15em] text-[#c9a34e]">{t("yourPrivacyChoices")}</p><h2 className="mt-1 text-base font-semibold">{t("clearerWay")}</h2></div>
            {customizing && <button type="button" onClick={() => setCustomizing(false)} className="text-[#aab5c6] transition-colors hover:text-[#f7f3e8]" aria-label={t("close")}><X size={16} /></button>}
          </div>
          {!customizing ? <>
            <p className="mt-2 text-xs leading-5 text-[#c1cad7]">{t("cookieDescription")}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => save({ essential: true, analytics: true })} className="inline-flex items-center gap-2 bg-[#c9a34e] px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[#101d35] transition-transform active:scale-95"><Check size={13} /> {t("acceptAll")}</button>
              <button type="button" onClick={() => setCustomizing(true)} className="inline-flex items-center gap-2 border border-[#aab5c6]/40 px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[#f7f3e8] transition-colors hover:border-[#c9a34e] hover:text-[#c9a34e]"><Settings2 size={13} /> {t("customize")}</button>
              <a href="/privacy-policy" className="inline-flex items-center px-2 py-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#c9a34e] underline underline-offset-4">{t("privacyPolicy")}</a>
            </div>
          </> : <div className="mt-4 space-y-3">
            <div className="flex items-start justify-between gap-4 border border-white/10 p-3"><div><p className="text-sm font-semibold">{t("essentialCookies")}</p><p className="mt-1 text-xs leading-5 text-[#aab5c6]">Required for sessions, security, and saved progress.</p></div><span className="text-[10px] font-black uppercase tracking-[.12em] text-[#c9a34e]">{t("alwaysActive")}</span></div>
            <label className="flex cursor-pointer items-start justify-between gap-4 border border-white/10 p-3"><span><span className="block text-sm font-semibold">{t("analyticsCookies")}</span><span className="mt-1 block text-xs leading-5 text-[#aab5c6]">Helps us measure platform journeys and improve learning experiences.</span></span><input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} className="mt-1 h-4 w-4 accent-[#c9a34e]" /></label>
            <button type="button" onClick={() => save({ essential: true, analytics })} className="inline-flex items-center gap-2 bg-[#c9a34e] px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[#101d35] transition-transform active:scale-95">{t("savePreferences")}</button>
          </div>}
        </div>
      </div>
    </aside>
  );
}

export { CONSENT_KEY };

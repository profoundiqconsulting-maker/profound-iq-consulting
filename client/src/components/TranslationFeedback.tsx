import { useEffect, useState } from "react";
import { PUBLISHED_SITE_ORIGIN } from "@shared/siteOrigin";
import { Check, Languages, Send, X } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useLocale } from "@/contexts/LocaleContext";
import { trpc } from "@/lib/trpc";

function makeVerification() {
  const a = Math.floor(Math.random() * 8) + 2;
  const b = Math.floor(Math.random() * 8) + 2;
  return { a, b };
}

export function TranslationFeedback() {
  const { locale, localeInfo, t } = useLocale();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [sourceText, setSourceText] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [email, setEmail] = useState("");
  const [verification, setVerification] = useState(makeVerification);
  const [answer, setAnswer] = useState("");
  const submission = trpc.inquiry.create.useMutation({
    onSuccess: () => {
      toast.success(t("translationFeedbackThanks"));
      setSourceText("");
      setSuggestion("");
      setEmail("");
      setAnswer("");
      setVerification(makeVerification());
      setOpen(false);
    },
    onError: (error) => toast.error(error.message || t("translationFeedbackError")),
  });
  const [currentPage, setCurrentPage] = useState(location);
  useEffect(() => {
    setCurrentPage(`${PUBLISHED_SITE_ORIGIN}${location}`);
  }, [location]);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numericAnswer = Number(answer);
    if (numericAnswer !== verification.a + verification.b) {
      toast.error(t("translationFeedbackCheckError"));
      setVerification(makeVerification());
      setAnswer("");
      return;
    }
    submission.mutate({
      name: "Translation feedback",
      email: email.trim(),
      category: "translation-feedback",
      message: [
        `Translation feedback for ${localeInfo.label} (${locale})`,
        `Page: ${currentPage}`,
        `Source text: ${sourceText.trim()}`,
        `Suggested correction: ${suggestion.trim()}`,
      ].join("\n\n"),
      mathA: verification.a,
      mathB: verification.b,
      mathAnswer: numericAnswer,
    });
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="fixed bottom-5 left-5 z-40 inline-flex items-center gap-2 rounded-full border border-[#c9a34e]/60 bg-[#f7f3e8] px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[#16243d] shadow-[0_10px_24px_rgba(0,0,0,.16)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#c9a34e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a34e] active:scale-95">
        <Languages size={14} />
        <span className="hidden sm:inline">{t("suggestTranslation")}</span>
        <span className="sm:hidden">{t("suggestTranslationShort")}</span>
      </button>
      {open && <div className="fixed inset-0 z-[80] grid place-items-center bg-[#071225]/75 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
        <div role="dialog" aria-modal="true" aria-labelledby="translation-feedback-title" className="max-h-[92vh] w-full max-w-xl overflow-y-auto border border-[#c9a34e]/70 bg-[#f7f3e8] p-6 text-[#16243d] shadow-2xl sm:p-8">
          <div className="flex items-start justify-between gap-5">
            <div><p className="eyebrow text-[#a27e2e]">{t("translationFeedbackEyebrow")}</p><h2 id="translation-feedback-title" className="display mt-3 text-3xl leading-none">{t("translationFeedbackTitle")}</h2><p className="mt-3 text-sm leading-6 text-[#657084]">{t("translationFeedbackDescription")}</p></div>
            <button type="button" onClick={() => setOpen(false)} aria-label={t("close")} className="grid h-9 w-9 shrink-0 place-items-center border border-[#16243d]/25 transition-colors hover:border-[#c9a34e] hover:text-[#a27e2e]"><X size={17} /></button>
          </div>
          <form onSubmit={submit} className="mt-7 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2"><label className="block text-xs font-black uppercase tracking-[.13em]">{t("currentLanguage")}<input value={localeInfo.label} readOnly className="mt-2 w-full border-b border-[#16243d]/25 bg-transparent py-2 text-sm font-semibold outline-none" /></label><label className="block text-xs font-black uppercase tracking-[.13em]">{t("pageContext")}<input value={location} readOnly className="mt-2 w-full border-b border-[#16243d]/25 bg-transparent py-2 text-sm font-semibold outline-none" /></label></div>
            <label className="block text-xs font-black uppercase tracking-[.13em]">{t("sourceText")}<textarea required minLength={2} maxLength={1000} value={sourceText} onChange={(event) => setSourceText(event.target.value)} rows={2} placeholder={t("sourceTextPlaceholder")} className="mt-2 w-full resize-none border border-[#16243d]/20 bg-white/45 px-3 py-2 text-sm outline-none focus:border-[#c9a34e]" /></label>
            <label className="block text-xs font-black uppercase tracking-[.13em]">{t("suggestedCorrection")}<textarea required minLength={2} maxLength={1000} value={suggestion} onChange={(event) => setSuggestion(event.target.value)} rows={3} placeholder={t("suggestedCorrectionPlaceholder")} className="mt-2 w-full resize-none border border-[#16243d]/20 bg-white/45 px-3 py-2 text-sm outline-none focus:border-[#c9a34e]" /></label>
            <label className="block text-xs font-black uppercase tracking-[.13em]">{t("emailAddress")}<span className="ml-2 font-normal normal-case tracking-normal text-[#657084]">{t("optional")}</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="mt-2 w-full border-b border-[#16243d]/25 bg-transparent py-2 text-sm outline-none focus:border-[#c9a34e]" /></label>
            <label className="block text-xs font-black uppercase tracking-[.13em]">{t("quickCheck")} {verification.a} + {verification.b} = ?<input required type="number" min={2} max={40} value={answer} onChange={(event) => setAnswer(event.target.value)} className="mt-2 w-full border-b border-[#16243d]/25 bg-transparent py-2 text-sm outline-none focus:border-[#c9a34e]" /></label>
            <p className="text-[11px] leading-5 text-[#657084]">{t("translationFeedbackPrivacy")}</p>
            <button type="submit" disabled={submission.isPending} className="inline-flex items-center gap-2 bg-[#c9a34e] px-4 py-3 text-[10px] font-black uppercase tracking-[.14em] text-[#16243d] transition hover:bg-[#e4c36b] disabled:cursor-wait disabled:opacity-60">{submission.isPending ? t("sending") : t("sendSuggestion")} {submission.isPending ? <Check size={14} /> : <Send size={14} />}</button>
          </form>
        </div>
      </div>}
    </>
  );
}

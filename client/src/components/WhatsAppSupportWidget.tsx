import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { MessageCircle, Minus, Plus, Send, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";

const phoneNumber = "254727374055";
const officeHours = "Monday to Saturday, 9 AM to 5 PM";
const quickReplies = ["I need help choosing a course.", "I have a payment question.", "I need help with an assessment.", "I need help with my certificate."];

function isOfficeOpen(date: Date) {
  const day = date.getDay();
  const hour = date.getHours();
  return day >= 1 && day <= 6 && hour >= 9 && hour < 17;
}

function pageGreeting(pathname: string) {
  if (pathname.includes("course")) return "Hello Profound IQ Consulting, I’m exploring your professional courses and would like guidance.";
  if (pathname.includes("assessment") || pathname.includes("psychometric")) return "Hello Profound IQ Consulting, I’m interested in an assessment and would like to understand the next step.";
  if (pathname.includes("career")) return "Hello Profound IQ Consulting, I’d like guidance choosing the right CareerPath for me.";
  if (pathname.includes("workspace") || pathname.includes("dashboard")) return "Hello Profound IQ Consulting, I need support with my learning workspace.";
  if (pathname.includes("contact")) return "Hello Profound IQ Consulting, I’d like to start a conversation with your team.";
  return "Hello Profound IQ Consulting, I need quick support with my learning journey.";
}

function makeVerification() {
  const a = Math.floor(Math.random() * 9) + 2;
  const b = Math.floor(Math.random() * 9) + 2;
  return { a, b };
}

export function WhatsAppSupportWidget() {
  const [location] = useLocation();
  const [minimized, setMinimized] = useState(() => {
    try { return window.localStorage.getItem("profound-whatsapp-minimized") === "true"; } catch { return false; }
  });
  const [online, setOnline] = useState(() => isOfficeOpen(new Date()));
  const [fallbackOpen, setFallbackOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [verification, setVerification] = useState(makeVerification);
  const [bounceAttention, setBounceAttention] = useState(false);
  const { t } = useLocale();
  const submitInquiry = trpc.inquiry.create.useMutation({
    onSuccess: () => {
      toast.success("Thanks — we’ll follow up by email during office hours.");
      setEmail(""); setMessage(""); setFallbackOpen(false); setVerification(makeVerification());
    },
    onError: (error) => toast.error(error.message || "We could not save your request. Please try again.")
  });

  const greeting = useMemo(() => pageGreeting(location), [location]);
  const whatsappUrl = useMemo(() => `https://wa.me/${phoneNumber}?text=${encodeURIComponent(greeting)}`, [greeting]);
  const isCoursePage = location.toLowerCase().includes("course");

  useEffect(() => {
    const updateStatus = () => setOnline(isOfficeOpen(new Date()));
    updateStatus();
    const timer = window.setInterval(updateStatus, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setBounceAttention(false);
    if (!isCoursePage) return;
    const timer = window.setTimeout(() => {
      setBounceAttention(true);
      window.setTimeout(() => setBounceAttention(false), 2_000);
    }, 30_000);
    return () => window.clearTimeout(timer);
  }, [isCoursePage, location]);

  const setMinimizedState = (value: boolean) => {
    setMinimized(value);
    try { window.localStorage.setItem("profound-whatsapp-minimized", String(value)); } catch { /* Storage can be unavailable in private browsing. */ }
  };

  const submitFallback = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const currentUrl = window.location.href;
    const answer = Number((event.currentTarget.elements.namedItem("whatsapp-math") as HTMLInputElement)?.value || 0);
    const requestMessage = message.trim() || "Please contact me when WhatsApp support is available.";
    submitInquiry.mutate({ name: "WhatsApp follow-up", email: email.trim(), category: "general", message: `${requestMessage}\n\nPage viewed: ${currentUrl}`, mathA: verification.a, mathB: verification.b, mathAnswer: answer });
  };

  if (minimized) {
    return <button type="button" onClick={() => setMinimizedState(false)} aria-label={t("whatsappSupport")} title={t("whatsappSupport")} className="fixed bottom-5 right-5 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#f7f3e8] bg-[#25D366] text-[#062411] shadow-[0_10px_24px_rgba(0,0,0,.25)] transition-all duration-200 hover:-translate-y-1 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101d35] active:scale-95"><MessageCircle size={20} /><span className={`absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-[#f7f3e8] ${online ? "bg-[#0b8f43]" : "bg-[#697386]"}`} /><Plus className="absolute -bottom-1 -right-1 rounded-full bg-[#101d35] p-0.5 text-[#f7f3e8]" size={15} /></button>;
  }

  return <div className={`fixed bottom-5 right-5 z-40 w-[min(21rem,calc(100vw-2rem))] ${bounceAttention ? "motion-safe:animate-[bounce_1s_ease-in-out_2]" : ""}`}>
    {fallbackOpen && !online && <div className="mb-3 rounded-2xl border border-[#d7b45a]/40 bg-[#101d35] p-4 text-[#f7f3e8] shadow-[0_18px_40px_rgba(0,0,0,.3)]" role="dialog" aria-label="Leave an offline WhatsApp support request">
      <div className="mb-3 flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#d7b45a]">Leave a message</p><p className="mt-1 text-xs leading-5 text-[#d9e0eb]">WhatsApp is offline. Leave your email and we’ll reply during {officeHours.toLowerCase()}.</p></div><button type="button" onClick={() => setFallbackOpen(false)} aria-label={t("close")} className="rounded-full p-1 text-[#b6c1d2] hover:bg-white/10 hover:text-white"><X size={15} /></button></div>
      <div className="mb-3"><p className="mb-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-[#b6c1d2]">Quick replies</p><div className="flex flex-wrap gap-1.5">{quickReplies.map((reply) => <button type="button" key={reply} onClick={() => setMessage(reply)} className="rounded-full border border-[#d7b45a]/45 px-2.5 py-1.5 text-[10px] leading-3 text-[#f7f3e8] transition hover:border-[#d7b45a] hover:bg-[#d7b45a]/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#d7b45a]">{reply}</button>)}</div></div>
      <form onSubmit={submitFallback} className="space-y-2.5"><label className="block text-[10px] font-bold uppercase tracking-[.12em] text-[#b6c1d2]" htmlFor="whatsapp-email">{t("emailAddress")}</label><input id="whatsapp-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-[#9ca8b9] focus:border-[#d7b45a]" /><label className="block text-[10px] font-bold uppercase tracking-[.12em] text-[#b6c1d2]" htmlFor="whatsapp-message">What can we help with? <span className="font-normal normal-case tracking-normal">(optional)</span></label><textarea id="whatsapp-message" value={message} onChange={(event) => setMessage(event.target.value)} rows={2} placeholder="Briefly describe your request" className="w-full resize-none rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-[#9ca8b9] focus:border-[#d7b45a]" /><label className="block text-[10px] font-bold uppercase tracking-[.12em] text-[#b6c1d2]" htmlFor="whatsapp-math">Quick check: {verification.a} + {verification.b} = ?</label><input id="whatsapp-math" name="whatsapp-math" type="number" required min={2} max={40} inputMode="numeric" className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-[#d7b45a]" /><button type="submit" disabled={submitInquiry.isPending} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#d7b45a] px-3 py-2.5 text-xs font-black uppercase tracking-[.12em] text-[#101d35] transition hover:bg-[#efcf7a] disabled:cursor-not-allowed disabled:opacity-60">{submitInquiry.isPending ? "Sending…" : t("talkToUs")}<Send size={14} /></button></form>
    </div>}
    <div className="relative"><div className="group">
      {online ? <a href={whatsappUrl} target="_blank" rel="noreferrer" aria-label={`Chat with Profound IQ Consulting on WhatsApp. Online now. ${greeting}`} title="Expected response time: usually within 15 minutes during office hours" className="motion-safe:animate-pulse inline-flex min-h-14 w-full items-center gap-3 rounded-full bg-[#25D366] px-4 py-3 text-[#062411] shadow-[0_12px_28px_rgba(0,0,0,.28)] transition-all duration-200 hover:animate-none hover:-translate-y-1 hover:scale-[1.02] hover:bg-[#1ebe5d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7f3e8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101d35] active:scale-95"><MessageCircle size={25} strokeWidth={2.25} /><span className="pr-1 text-left"><strong className="block text-[11px] font-black uppercase tracking-[.12em]">Quick support</strong><span className="mt-0.5 flex items-center gap-1.5 text-[10px] font-semibold"><span className="h-2 w-2 rounded-full bg-[#0b8f43]" />Online now · reply within 15 min</span></span></a> : <button type="button" onClick={() => setFallbackOpen((open) => !open)} aria-expanded={fallbackOpen} aria-label="Open offline contact form for WhatsApp support" title="WhatsApp is offline. Leave your email for a reply during office hours" className="inline-flex min-h-14 w-full items-center gap-3 rounded-full bg-[#25D366] px-4 py-3 text-left text-[#062411] shadow-[0_12px_28px_rgba(0,0,0,.28)] transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] hover:bg-[#1ebe5d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7f3e8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101d35] active:scale-95"><MessageCircle size={25} strokeWidth={2.25} /><span><strong className="block text-[11px] font-black uppercase tracking-[.12em]">Leave a message</strong><span className="mt-0.5 flex items-center gap-1.5 text-[10px] font-semibold"><span className="h-2 w-2 rounded-full bg-[#697386]" />Offline · reply next office day</span></span></button>}
      <span className="pointer-events-none absolute bottom-full right-0 mb-2 hidden max-w-[18rem] rounded-lg bg-[#101d35] px-3 py-2 text-[11px] leading-4 text-[#f7f3e8] shadow-lg group-hover:block">{online ? "Expected response time: usually within 15 minutes during active office hours." : `Leave your email and we’ll reply during ${officeHours.toLowerCase()}.`}</span>
    </div><button type="button" onClick={() => setMinimizedState(true)} aria-label={t("close")} title={t("close")} className="absolute -right-1 -top-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#f7f3e8] bg-[#101d35] text-[#f7f3e8] shadow-sm transition-colors hover:bg-[#243653] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"><Minus size={13} /></button></div>
  </div>;
}

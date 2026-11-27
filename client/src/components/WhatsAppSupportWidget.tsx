import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { MessageCircle, Minus, Plus, Send, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const phoneNumber = "254727374055";
const quickReplies = [
  "I need help choosing a course.",
  "I have a payment question.",
  "I need help with an assessment.",
  "I need help with my certificate.",
];

function pageGreeting(pathname: string) {
  if (pathname.includes("course"))
    return "Hello Profound IQ Consulting, I’m exploring your professional courses and would like guidance.";
  if (pathname.includes("assessment") || pathname.includes("psychometric"))
    return "Hello Profound IQ Consulting, I’m interested in an assessment and would like to understand the next step.";
  if (pathname.includes("career"))
    return "Hello Profound IQ Consulting, I’d like guidance choosing the right CareerPath for me.";
  if (pathname.includes("workspace") || pathname.includes("dashboard"))
    return "Hello Profound IQ Consulting, I need support with my learning workspace.";
  if (pathname.includes("contact"))
    return "Hello Profound IQ Consulting, I’d like to start a conversation with your team.";
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
    try {
      return (
        window.localStorage.getItem("profound-whatsapp-minimized") === "true"
      );
    } catch {
      return false;
    }
  });
  const [fallbackOpen, setFallbackOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [verification, setVerification] = useState(makeVerification);
  const [bounceAttention, setBounceAttention] = useState(false);

  const submitInquiry = trpc.inquiry.create.useMutation({
    onSuccess: () => {
      toast.success("Thanks — we'll follow up by email.");
      setEmail("");
      setMessage("");
      setFallbackOpen(false);
      setVerification(makeVerification());
    },
    onError: error =>
      toast.error(
        error.message || "We could not save your request. Please try again."
      ),
  });

  const greeting = useMemo(() => pageGreeting(location), [location]);
  const whatsappUrl = useMemo(
    () => `https://wa.me/${phoneNumber}?text=${encodeURIComponent(greeting)}`,
    [greeting]
  );
  const isCoursePage = location.toLowerCase().includes("course");

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
    try {
      window.localStorage.setItem("profound-whatsapp-minimized", String(value));
    } catch {
      /* Storage can be unavailable in private browsing. */
    }
  };

  const submitFallback = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const currentUrl = window.location.href;
    const answer = Number(
      (
        event.currentTarget.elements.namedItem(
          "whatsapp-math"
        ) as HTMLInputElement
      )?.value || 0
    );
    const requestMessage = message.trim() || "Please contact me via WhatsApp.";
    submitInquiry.mutate({
      name: "WhatsApp follow-up",
      email: email.trim(),
      category: "general",
      message: `${requestMessage}\n\nPage viewed: ${currentUrl}`,
      mathA: verification.a,
      mathB: verification.b,
      mathAnswer: answer,
    });
  };

  // Reserve space for widget to prevent CLS (max 336px = 21rem)
  const widgetReservedSpace = (
    <div
      className="fixed bottom-4 right-4 z-0 w-[calc(100vw-2rem)] sm:bottom-6 sm:right-6 sm:w-[min(21rem,calc(100vw-2rem))] h-14 pointer-events-none"
      aria-hidden="true"
    />
  );

  if (minimized) {
    return (
      <>
        {widgetReservedSpace}
        <button
          type="button"
          onClick={() => setMinimizedState(false)}
          aria-label={"WhatsApp support"}
          title={"WhatsApp support"}
          className="fixed bottom-4 right-4 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#f7f3e8] bg-[#25D366] text-[#062411] shadow-[0_10px_24px_rgba(0,0,0,.25)] transition-all duration-200 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101d35] active:scale-95 sm:bottom-6 sm:right-6"
        >
          <MessageCircle size={22} />
          <span
            className={`absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-[#f7f3e8] bg-[#0b8f43]`}
          />
          <Plus
            className="absolute -bottom-1 -right-1 rounded-full bg-[#101d35] p-0.5 text-[#f7f3e8]"
            size={15}
          />
        </button>
      </>
    );
  }

  return (
    <>
      {widgetReservedSpace}
      <div
        className={`fixed bottom-4 right-4 z-40 w-[calc(100vw-2rem)] sm:bottom-6 sm:right-6 sm:w-[min(21rem,calc(100vw-2rem))] ${bounceAttention ? "motion-safe:animate-[bounce_1s_ease-in-out_2]" : ""}`}
      >
        {fallbackOpen && (
          <div
            className="mb-3 rounded-2xl border border-[#d7b45a]/40 bg-[#101d35] p-4 text-[#f7f3e8] shadow-[0_18px_40px_rgba(0,0,0,.3)]"
            role="dialog"
            aria-label="Leave a WhatsApp support request"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#d7b45a]">
                  Leave a message
                </p>
                <p className="mt-1 text-xs leading-5 text-[#d9e0eb]">
                  We’ll reply as soon as possible.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFallbackOpen(false)}
                aria-label={"Close"}
                className="rounded-full p-1 text-[#b6c1d2] hover:bg-white/10 hover:text-white"
              >
                <X size={15} />
              </button>
            </div>
            <form onSubmit={submitFallback} className="space-y-2.5">
              <label
                className="block text-[10px] font-bold uppercase tracking-[.12em] text-[#b6c1d2]"
                htmlFor="whatsapp-email"
              >
                {"Email address"}
              </label>
              <input
                id="whatsapp-email"
                type="email"
                required
                value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-[#9ca8b9] focus:border-[#d7b45a]"
              />
              <label
                className="block text-[10px] font-bold uppercase tracking-[.12em] text-[#b6c1d2]"
                htmlFor="whatsapp-message"
              >
                What can we help with?{" "}
                <span className="font-normal normal-case tracking-normal">
                  (optional)
                </span>
              </label>
              <textarea
                id="whatsapp-message"
                value={message}
                onChange={event => setMessage(event.target.value)}
                rows={2}
                placeholder="Briefly describe your request"
                className="w-full resize-none rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-[#9ca8b9] focus:border-[#d7b45a]"
              />
              <label
                className="block text-[10px] font-bold uppercase tracking-[.12em] text-[#b6c1d2]"
                htmlFor="whatsapp-math"
              >
                Quick check: {verification.a} + {verification.b} = ?
              </label>
              <input
                id="whatsapp-math"
                name="whatsapp-math"
                type="number"
                required
                min={2}
                max={40}
                inputMode="numeric"
                className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-[#d7b45a]"
              />
              <button
                type="submit"
                disabled={submitInquiry.isPending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#d7b45a] px-3 py-2.5 text-xs font-black uppercase tracking-[.12em] text-[#101d35] transition hover:bg-[#efcf7a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitInquiry.isPending ? "Sending…" : "Talk to us"}
                <Send size={14} />
              </button>
            </form>
          </div>
        )}
        <div className="relative">
          <div className="group">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`Chat with Profound IQ Consulting on WhatsApp. Online now. ${greeting}`}
              title="Expected response time: usually within 15 minutes"
              className="inline-flex min-h-14 w-full items-center gap-3 rounded-full bg-[#25D366] px-4 py-3 text-[#062411] shadow-[0_12px_28px_rgba(0,0,0,.28)] transition-all duration-200 hover:shadow-lg hover:bg-[#1ebe5d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7f3e8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101d35] active:scale-95"
            >
              <MessageCircle
                size={22}
                strokeWidth={2.25}
                className="shrink-0"
              />
              <span className="pr-1 text-left">
                <strong className="block text-[11px] font-black uppercase tracking-[.12em]">
                  Quick support
                </strong>
                <span className="mt-0.5 flex items-center gap-1.5 text-[10px] font-semibold">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#0b8f43]" />
                  <span className="hidden sm:inline">
                    Online now · reply within 15 min
                  </span>
                  <span className="sm:hidden">Online now</span>
                </span>
              </span>
            </a>
            <span className="pointer-events-none absolute bottom-full right-0 mb-2 hidden max-w-[18rem] rounded-lg bg-[#101d35] px-3 py-2 text-[11px] leading-4 text-[#f7f3e8] shadow-lg group-hover:block">
              Expected response time: usually within 15 minutes.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setMinimizedState(true)}
            aria-label={"Close"}
            title={"Close"}
            className="absolute -right-1 -top-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#f7f3e8] bg-[#101d35] text-[#f7f3e8] shadow-sm transition-colors hover:bg-[#243653] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
          >
            <Minus size={13} />
          </button>
        </div>
      </div>
    </>
  );
}

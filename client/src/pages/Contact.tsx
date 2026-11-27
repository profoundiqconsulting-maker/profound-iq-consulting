/* Profound IQ Consulting — Executive Observatory Contact page: low-friction inquiry capture with clear privacy, response expectations, and support routes. */
import { useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  Send,
} from "lucide-react";
import { PublicPageShell } from "@/components/PublicPageShell";
import { trpc } from "@/lib/trpc";

const categories = [
  ["professional-courses", "Professional courses"],
  ["educational-consulting", "Educational consulting"],
  ["psychometric-testing", "Psychometric testing"],
  ["research-surveys", "Research surveys"],
  ["organizational-development", "Organizational development"],
  ["general", "General question"],
] as const;

function newNumber() {
  return Math.floor(Math.random() * 9) + 2;
}

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mathA, setMathA] = useState(newNumber);
  const [mathB, setMathB] = useState(newNumber);
  const inquiry = trpc.inquiry.create.useMutation();

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(false);
    setError(null);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    inquiry.mutate(
      {
        name: String(form.get("name")),
        email: String(form.get("email")),
        category: String(form.get("category")) as
          | "professional-courses"
          | "educational-consulting"
          | "psychometric-testing"
          | "research-surveys"
          | "organizational-development"
          | "general",
        message: String(form.get("message")),
        mathA,
        mathB,
        mathAnswer: Number(form.get("mathAnswer")),
      },
      {
        onSuccess: () => {
          setSent(true);
          formElement.reset();
          setMathA(newNumber());
          setMathB(newNumber());
        },
        onError: requestError =>
          setError(
            requestError.message ||
              "We could not send your inquiry. Please try again."
          ),
      }
    );
  };

  return (
    <PublicPageShell
      eyebrow="06 / Contact"
      title={
        <>
          Bring us the question{" "}
          <em className="font-normal text-[var(--brand)]">behind the question.</em>
        </>
      }
      intro="Tell us what you are trying to improve, understand, or build. We will use your context to guide the next conversation."
      breadcrumbs={[{ label: "Contact" }]}
    >
      <section className="section-py bg-[#f7f3e8]">
        <div className="container grid gap-12 lg:grid-cols-[.6fr_1.4fr] lg:gap-16 lg:items-start">
          <div>
            <p className="eyebrow text-[var(--brand)]">Start here</p>
            <h2 className="display mt-5 heading-clamp">
              A useful first message is enough.
            </h2>
            <p className="mt-6 max-w-md text-fluid-base leading-8 text-[var(--fg-muted)]">
              You do not need to have the full brief ready. Share the situation,
              audience, and desired direction, and the team can help shape the
              right pathway.
            </p>
            <div className="mt-10 space-y-6 border-t border-[#16243d]/10 pt-8 sm:mt-12">
              <a
                href="mailto:admin@profoundiqconsulting.com"
                className="group flex items-start gap-5 transition-all"
              >
                <Mail size={20} className="mt-1 shrink-0 text-[var(--brand)]" />
                <span>
                  <strong className="block text-sm text-[var(--fg)]">
                    admin@profoundiqconsulting.com
                  </strong>
                  <span className="mt-1 block text-xs text-[var(--fg-muted)]">
                    Email the consulting team
                  </span>
                </span>
              </a>
              <a
                href="tel:+254727374055"
                className="group flex items-start gap-5 transition-all"
              >
                <Phone size={20} className="mt-1 shrink-0 text-[var(--brand)]" />
                <span>
                  <strong className="block text-sm text-[var(--fg)]">
                    +254 727 374 055
                  </strong>
                  <span className="mt-1 block text-xs text-[var(--fg-muted)]">
                    Call during office hours
                  </span>
                </span>
              </a>
              <a
                href="https://wa.me/254727374055"
                target="_blank"
                rel="noreferrer"
                className="group flex items-start gap-5 transition-all"
              >
                <MessageCircle
                  size={20}
                  className="mt-1 shrink-0 text-[var(--brand)]"
                />
                <span>
                  <strong className="block text-sm text-[var(--fg)]">
                    WhatsApp quick support
                  </strong>
                  <span className="mt-1 block text-xs text-[var(--fg-muted)]">
                    Direct route for practical questions
                  </span>
                </span>
              </a>
              <div className="flex items-start gap-5">
                <Clock3 size={20} className="mt-1 shrink-0 text-[var(--brand)]" />
                <span>
                  <strong className="block text-sm text-[var(--fg)]">
                    Monday to Saturday
                  </strong>
                  <span className="mt-1 block text-xs text-[var(--fg-muted)]">
                    Office hours · Online / global reach
                  </span>
                </span>
              </div>
            </div>
          </div>
          <div className="border border-[#16243d]/10 bg-[var(--bg-elevated)] p-8 shadow-[0_20px_60px_rgba(16,29,53,.06)] sm:p-10">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="eyebrow text-[var(--brand)]">Inquiry form</p>
                <h2 className="mt-4 text-2xl font-semibold text-[var(--fg)]">
                  What would you like to move forward?
                </h2>
              </div>
              <Send
                size={24}
                className="mt-1 shrink-0 text-[var(--brand)]"
                aria-hidden="true"
              />
            </div>
            {sent ? (
              <div
                className="mt-8 border-l-2 border-[#6c8b62] bg-[#eef5ea] p-5 text-[#29452c]"
                role="status"
              >
                <CheckCircle2 size={22} />
                <p className="mt-3 font-semibold">
                  Your inquiry has been received.
                </p>
                <p className="mt-2 text-sm leading-6">
                  Thank you. The team will review the context and follow up
                  through the email address you provided.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setMathA(newNumber());
                    setMathB(newNumber());
                  }}
                  className="mt-5 text-[10px] font-black uppercase tracking-[.14em] underline underline-offset-4"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form
                {...({
                  toolname: "submit_contact_inquiry",
                  tooldescription:
                    "Send a message to Profound IQ Consulting about services, courses, or school solutions. A human reviews it before anything is sent.",
                } as Record<string, string>)}
                className="mt-8 space-y-5"
                onSubmit={submit}
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-semibold text-[var(--fg)]">
                    Name
                    <input
                      name="name"
                      required
                      autoComplete="name"
                      className="min-h-12 border border-[#16243d]/20 bg-[#fffaf0] px-4 text-base font-normal outline-none transition-colors focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/25"
                      placeholder="Your name"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-[var(--fg)]">
                    Email
                    <input
                      name="email"
                      required
                      type="email"
                      autoComplete="email"
                      className="min-h-12 border border-[#16243d]/20 bg-[#fffaf0] px-4 text-base font-normal outline-none transition-colors focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/25"
                      placeholder="you@example.com"
                    />
                  </label>
                </div>
                <label className="grid gap-2 text-sm font-semibold text-[var(--fg)]">
                  Inquiry category
                  <select
                    name="category"
                    defaultValue="general"
                    required
                    className="min-h-12 border border-[#16243d]/20 bg-[#fffaf0] px-4 text-base font-normal outline-none transition-colors focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/25"
                  >
                    {categories.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-semibold text-[var(--fg)]">
                  Message
                  <textarea
                    name="message"
                    required
                    rows={6}
                    className="resize-y border border-[#16243d]/20 bg-[#fffaf0] px-4 py-3 text-base font-normal outline-none transition-colors focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/25"
                    placeholder="Tell us about the context, audience, and outcome you have in mind."
                  />
                </label>
                <div className="border border-[#16243d]/15 bg-[#f7f3e8] p-4">
                  <label className="grid gap-2 text-sm font-semibold text-[var(--fg)]">
                    Quick verification{" "}
                    <span className="text-xs font-normal text-[var(--fg-muted)]">
                      What is {mathA} + {mathB}?
                    </span>
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        name="mathAnswer"
                        required
                        inputMode="numeric"
                        pattern="[0-9]+"
                        className="min-h-11 w-28 border border-[#16243d]/20 bg-white px-3 text-base outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/25"
                        aria-label={`Answer to ${mathA} plus ${mathB}`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setMathA(newNumber());
                          setMathB(newNumber());
                        }}
                        className="inline-flex min-h-11 items-center gap-2 border border-[#16243d]/20 px-3 text-[10px] font-black uppercase tracking-[.12em] text-[var(--fg)] hover:border-[var(--brand)]"
                        aria-label="Get a new verification question"
                      >
                        <RefreshCw size={14} /> New question
                      </button>
                    </div>
                  </label>
                </div>
                <label className="flex items-start gap-3 text-sm leading-6 text-[var(--fg-muted)]">
                  <input
                    type="checkbox"
                    name="consent"
                    required
                    className="mt-1 h-4 w-4 accent-[#16243d]"
                  />
                  I agree that Profound IQ Consulting may use my submitted
                  details to respond to this inquiry. Read the{" "}
                  <a
                    href="/privacy-policy"
                    className="font-semibold text-[var(--fg)] underline decoration-[var(--brand)] underline-offset-4"
                  >
                    Privacy Policy
                  </a>
                  .
                </label>
                {error && (
                  <p
                    className="border-l-2 border-[#8b4f63] bg-[#fbf0f3] p-4 text-sm leading-6 text-[var(--fg-muted)]"
                    role="alert"
                  >
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={inquiry.isPending}
                  className="inline-flex min-h-12 items-center justify-center gap-3 bg-[#16243d] px-6 text-[10px] font-black uppercase tracking-[.14em] text-[#f7f3e8] transition-all hover:bg-[var(--brand)] hover:text-[var(--brand-fg)] disabled:cursor-wait disabled:opacity-70"
                >
                  {inquiry.isPending ? "Sending inquiry…" : "Send inquiry"}{" "}
                  <Send size={15} />
                </button>
                <p className="text-xs leading-5 text-[var(--fg-muted)]">
                  Submitting this form records an inquiry for follow-up. It does
                  not confirm a booking or engagement.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, MailCheck, ShieldCheck, XCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { PublicPageShell } from "@/components/PublicPageShell";
import { trpc } from "@/lib/trpc";

type Action = "confirm" | "unsubscribe";

export default function NewsletterAction({ action }: { action: Action }) {
  const [, navigate] = useLocation();
  const token = useMemo(
    () => new URLSearchParams(window.location.search).get("token") ?? "",
    []
  );
  const [state, setState] = useState<"working" | "success" | "error">(
    "working"
  );
  const [message, setMessage] = useState("Securing your request…");
  const mutation =
    action === "confirm"
      ? trpc.newsletter.confirm.useMutation()
      : trpc.newsletter.unsubscribe.useMutation();

  useEffect(() => {
    if (!/^[a-f0-9]{64}$/.test(token)) {
      setState("error");
      setMessage("This link is invalid or incomplete.");
      return;
    }
    mutation.mutate(
      { token },
      {
        onSuccess: () => {
          setState("success");
          setMessage(
            action === "confirm"
              ? "Your email is confirmed. You will receive future Profound IQ Insights updates."
              : "You have been unsubscribed from Profound IQ Insights."
          );
        },
        onError: error => {
          setState("error");
          setMessage(error.message);
        },
      }
    );
  }, [action, mutation, token]);

  return (
    <PublicPageShell
      eyebrow={
        action === "confirm"
          ? "Newsletter / confirmation"
          : "Newsletter / preferences"
      }
      title={
        action === "confirm" ? (
          <>
            Your inbox is now{" "}
            <em className="font-normal text-[#c9a34e]">in the loop.</em>
          </>
        ) : (
          <>
            Your preferences are{" "}
            <em className="font-normal text-[#c9a34e]">updated.</em>
          </>
        )
      }
      intro="A clear, permission-based way to stay close to useful ideas about education, leadership, learning design, and professional growth."
      breadcrumbs={[
        { label: "Insights", href: "/blog" },
        { label: action === "confirm" ? "Confirmation" : "Unsubscribe" },
      ]}
      cta={{ label: "Return to Insights", href: "/blog" }}
    >
      <section className="bg-[#f7f3e8] py-20 lg:py-28">
        <div className="container max-w-3xl">
          <div
            className={`border p-8 sm:p-12 ${state === "success" ? "border-[#6c8b62]/40 bg-[#eef5ea] text-[#29452c]" : state === "error" ? "border-[#8b4f63]/30 bg-[#fbf0f3] text-[#6b3045]" : "border-[#c9a34e]/50 bg-white/70 text-[#16243d]"}`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-4">
              {state === "success" ? (
                <CheckCircle2 className="mt-1 shrink-0" size={28} />
              ) : state === "error" ? (
                <XCircle className="mt-1 shrink-0" size={28} />
              ) : (
                <MailCheck className="mt-1 shrink-0 animate-pulse" size={28} />
              )}
              <div>
                <h2 className="display text-3xl sm:text-4xl">
                  {state === "working"
                    ? "Checking your secure link…"
                    : state === "success"
                      ? "All set."
                      : "We could not complete that request."}
                </h2>
                <p className="mt-4 text-base leading-7 opacity-80">{message}</p>
              </div>
            </div>
            {state === "error" && (
              <p className="mt-7 flex items-start gap-3 border-t border-current/15 pt-5 text-sm leading-6 opacity-80">
                <ShieldCheck size={17} className="mt-0.5 shrink-0" />
                For your privacy, confirmation links expire and cannot be
                reused. Request a new subscription email from the Insights page
                if needed.
              </p>
            )}
            <Link
              href="/blog"
              onClick={() => navigate("/blog")}
              className="mt-8 inline-flex min-h-12 items-center justify-center bg-[#16243d] px-5 text-[10px] font-black uppercase tracking-[.14em] text-[#f7f3e8] transition hover:-translate-y-0.5 hover:bg-[#c9a34e] hover:text-[#101d35]"
            >
              Return to Insights
            </Link>
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}

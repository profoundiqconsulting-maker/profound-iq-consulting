/* Profound IQ Consulting — Psychometrics redesigned for executive conversion */
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  Sparkles,
  Star,
  Target,
  BrainCircuit,
  HeartPulse,
  Briefcase,
  Users,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { LikertScale } from "@/components/LikertScale";
import { TransformationNav } from "@/components/TransformationNav";
import { SocialSharing, type SocialPlatform } from "@/components/SocialSharing";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { getPsychometricCourseRecommendations } from "@shared/psychometricRecommendations";
import { CheckoutForm } from "@/components/CheckoutForm";
import { ProgressRing } from "@/components/ui/progress-ring";
import { cn } from "@/lib/utils";
import { useAuth } from "@/_core/hooks/useAuth";

import { psychometricWorkflowCopy as workflowCopy } from "@shared/psychometricWorkflowLocalization";
import PaystackInlineModal, {
  type PaystackInlineProduct,
} from "@/components/PaystackInlineModal";

const PSYCHOMETRIC_PRICE_KES = 699;

type Answer = { questionId: string; value: number };
type PsychometricStage = "catalog" | "questions" | "checkout" | "report";

export default function Psychometrics() {
  const utils = trpc.useUtils();
  const [, params] = useRoute("/psychometrics/:slug");
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const slug = params?.slug;
  const catalog = trpc.psychometric.catalog.useQuery(undefined, {
    enabled: !slug,
  });
  const detail = trpc.psychometric.questions.useQuery(
    { testSlug: slug ?? "" },
    { enabled: Boolean(slug) }
  );
  const verify = trpc.psychometric.verifyPayment.useMutation();
  const downloadReport = trpc.psychometric.downloadReport.useMutation();
  const initialize = trpc.psychometric.initializePayment.useMutation();
  const initializeInline =
    trpc.psychometric.initializeInlinePayment.useMutation();

  const [stage, setStage] = useState<PsychometricStage>(slug ? "questions" : "catalog");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [paidReference, setPaidReference] = useState<string | null>(null);
  const [feedbackScores, setFeedbackScores] = useState<Record<string, number>>({});
  const [paymentMessage, setPaymentMessage] = useState("");
  const [inlineModalOpen, setInlineModalOpen] = useState(false);
  const [inlineProduct, setInlineProduct] = useState<PaystackInlineProduct | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [tasterCompleted, setTasterCompleted] = useState(false);

  const recommendationFeedback =
    trpc.psychometric.recommendationFeedback.useMutation({
      onSuccess: () =>
        toast.success("Thanks — your recommendation feedback was saved."),
      onError: error =>
        toast.error("Could not save feedback", { description: error.message }),
    });

  const questions = detail.data?.questions ?? [];
  const current = questions[index];
  const completion = questions.length
    ? Math.round((Object.keys(answers).length / questions.length) * 100)
    : 0;
  const isTasterQuestion = index < 3; // First 3 questions are free taster

  // Handle payment verification from URL
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const reference = query.get("reference");
    if (!reference) return;
    if (query.get("payment") !== "success") return;
    verify.mutate(
      { reference },
      {
        onSuccess: result => {
          setReport(result.report);
          setPaidReference(reference);
          setPaymentMessage(
            "Payment verified. Your personalized profile is ready."
          );
          void utils.dashboard.mine.refetch();
          toast.success("Assessment complete");
          setStage("report");
        },
        onError: error => {
          setPaymentMessage(error.message);
          toast.error(error.message);
        },
      }
    );
  }, []);

  // Handle inline modal payment polling
  useEffect(() => {
    if (!inlineModalOpen || !inlineProduct?.reference) return;
    let cancelled = false;
    const tick = async () => {
      if (cancelled) return;
      try {
        await new Promise<void>((resolve, reject) => {
          verify.mutate(
            { reference: inlineProduct.reference },
            {
              onSuccess: result => {
                if (!cancelled && result?.report) {
                  setReport(result.report);
                  setPaidReference(inlineProduct.reference);
                  setPaymentMessage(
                    "Payment verified. Your personalized profile is ready."
                  );
                  toast.success("Assessment complete");
                  setInlineModalOpen(false);
                  setInlineProduct(null);
                  setStage("report");
                }
                resolve();
              },
              onError: () => resolve(),
            }
          );
        });
      } catch {
        // keep polling
      } finally {
        if (!cancelled) setTimeout(tick, 3000);
      }
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, [inlineModalOpen, inlineProduct?.reference, verify]);

  // Reset answers when test changes
  useEffect(() => {
    setAnswers({});
    setIndex(0);
    setStage(slug ? "questions" : "catalog");
    window.localStorage.removeItem("piq-psychometric-answers");
  }, [slug]);

  // Load saved answers
  useEffect(() => {
    if (!slug || !detail.data?.questions?.length) return;
    try {
      const saved = window.localStorage.getItem("piq-psychometric-answers");
      if (saved) {
        const parsed = JSON.parse(saved) as Record<string, number>;
        if (Object.keys(parsed).length) setAnswers(parsed);
      }
    } catch {
      window.localStorage.removeItem("piq-psychometric-answers");
    }
  }, [slug, detail.data?.questions]);

  // Save answers before unload
  useEffect(() => {
    if (!slug) return;
    const handler = () => {
      window.localStorage.setItem(
        "piq-psychometric-answers",
        JSON.stringify(answers)
      );
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [answers, slug]);

  // Update document title
  useEffect(() => {
    if (slug && detail.data) {
      document.title = `${detail.data.title} | Profound IQ Consulting`;
      const description = document.querySelector('meta[name="description"]');
      description?.setAttribute(
        "content",
        `${detail.data.purpose} Complete the ${detail.data.shortTitle} online for KES ${PSYCHOMETRIC_PRICE_KES}.`
      );
    } else if (!slug)
      document.title =
        "Professional Psychometric Assessments | Profound IQ Consulting";
  }, [slug, detail.data]);

  const selected = useMemo(
    () => (current ? answers[current.id] : undefined),
    [answers, current]
  );

  const choose = (value: number) => {
    if (!current) return;
    const next = { ...answers, [current.id]: value };
    setAnswers(next);
    if (slug) {
      window.localStorage.setItem(
        "piq-psychometric-answers",
        JSON.stringify(next)
      );
    }
    // Auto-advance after answering
    if (index < questions.length - 1) {
      setIndex(i => i + 1);
    }
  };

  const downloadPaidReport = async () => {
    const reference =
      paidReference ||
      new URLSearchParams(window.location.search).get("reference");
    if (!reference) {
      toast.error("A verified payment reference is required.");
      return;
    }
    try {
      const result = await downloadReport.mutateAsync({ reference });
      const bytes = Uint8Array.from(atob(result.data), character =>
        character.charCodeAt(0)
      );
      const url = URL.createObjectURL(
        new Blob([bytes], { type: result.contentType })
      );
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = result.filename;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("Profile PDF downloaded");
    } catch (error) {
      toast.error("Profile PDF unavailable", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  const rateRecommendation = (courseSlug: string, rating: number) => {
    setFeedbackScores(current => ({ ...current, [courseSlug]: rating }));
    recommendationFeedback.mutate({
      testSlug: report?.testSlug ?? slug ?? "",
      courseSlug,
      rating,
    });
  };

  const submit = () => {
    if (
      !detail.data ||
      !name.trim() ||
      !email.trim() ||
      !consent ||
      Object.keys(answers).length !== questions.length
    ) {
      toast.error(
        "Complete every response, your details, and consent before checkout."
      );
      return;
    }
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = async (reference: string) => {
    setShowCheckout(false);
    setPaymentState("verifying");
    try {
      const result = await verify.mutateAsync({ reference });
      setReport(result.report);
      setPaidReference(reference);
      setPaymentMessage(
        "Payment verified. Your personalized profile is ready."
      );
      toast.success("Assessment complete");
      setStage("report");
    } catch (err) {
      setPaymentState("failed");
      setError(err instanceof Error ? err.message : "Failed to load report");
    }
  };

  const [paymentState, setPaymentState] = useState<"idle" | "verifying" | "paid" | "failed">("idle");
  const [error, setError] = useState<string | null>(null);

  const shareUrl = `${window.location.origin}/psychometrics/${slug}?reference=${paidReference ?? ""}`;
  const shareTitle = `My ${detail.data?.title ?? "Psychometric"} Profile`;
  const shareMessage = `I've completed my ${detail.data?.shortTitle ?? "psychometric assessment"}. Here's my profile.`;

  const handleShare = (platform: SocialPlatform) => {
    console.log(`Shared on ${platform}`);
  };

  // Catalog view (no slug)
  if (!slug) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-body">
        <TransformationNav active="psychometrics" />
        <section className="bg-[var(--navy-deep)] px-6 py-20 text-[var(--background)]">
          <div className="container">
            <p className="eyebrow text-[var(--gold)]">PROFOUND IQ / TRANSFORMATION SERVICES</p>
            <h1 className="text-display text-4xl font-semibold leading-[1.05] tracking-tight mt-3 sm:text-5xl lg:text-6xl text-[var(--background)]">
              Professional psychometric profiles for <em className="font-normal text-[var(--gold)]">better decisions.</em>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-[var(--muted-foreground)]">
              Six complementary assessments for career exploration, cognitive reasoning, emotional intelligence, employability, leadership, and occupational fit. Each profile turns structured responses into practical development conversations.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/">
                <Button variant="outline" className="border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--navy-deep)]">
                  Back to home
                </Button>
              </Link>
              <span className="inline-flex items-center gap-2 px-4 py-2 text-sm text-[var(--muted-foreground)]">
                <LockKeyhole size={16} className="text-[var(--gold)]" /> Secure Paystack checkout · KES {PSYCHOMETRIC_PRICE_KES}
              </span>
            </div>
          </div>
        </section>
        <section className="container py-12">
          {catalog.isLoading ? (
            <div className="flex items-center gap-3 text-sm" role="status" aria-live="polite">
              <Loader2 size={16} className="animate-spin text-[var(--gold)]" /> Loading profiles…
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {catalog.data?.map(test => (
                <article
                  key={test.slug}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm transition-all hover:shadow-xl hover:border-[var(--gold)]/30"
                >
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="eyebrow text-[var(--gold)]">{test.questionCount} items</span>
                    <span className="text-sm font-semibold text-[var(--gold)]">KES {PSYCHOMETRIC_PRICE_KES}</span>
                  </div>
                  <h3 className="text-display text-2xl font-semibold text-[var(--foreground)] mb-3">{test.title}</h3>
                  <p className="text-sm leading-7 text-[var(--muted-foreground)] mb-2">{test.strapline}</p>
                  <p className="text-sm leading-6 text-[var(--muted-foreground)] mb-4">{test.purpose}</p>
                  <div className="mt-auto flex items-center justify-between text-xs font-bold uppercase tracking-[.12em] text-[var(--muted-foreground)]">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 size={14} /> {test.estimatedMinutes} min
                    </span>
                    <Link href={`/psychometrics/${test.slug}`}>
                      <Button variant="gold" size="sm" className="gap-2">
                        Start profile <ChevronRight size={14} />
                      </Button>
                    </Link>
                  </div>
                  {/* Free taster badge */}
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-black uppercase tracking-[.1em] bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)] rounded-full">
                      <Sparkles size={10} /> Free taster
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    );
  }

  const test = detail.data;
  if (!test)
    return <main className="container py-20">Loading assessment…</main>;

  // Report view
  if (report)
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-body">
        <TransformationNav active="psychometrics" />
        <div className="container max-w-5xl py-8 lg:py-12">
          <Link href="/psychometrics">
            <Button variant="ghost" size="sm" className="mb-6 gap-2">
              <ArrowLeft size={16} /> All profiles
            </Button>
          </Link>
          <Card className="border-[var(--gold)]/50 bg-[var(--card)]">
            <CardHeader>
              <p className="eyebrow text-[var(--gold)]">PERSONALIZED PROFILE</p>
              <CardTitle className="text-display text-3xl font-semibold text-[var(--foreground)]">{report.title}</CardTitle>
              <p className="text-[var(--muted-foreground)]">{paymentMessage}</p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
                <div className="rounded-2xl bg-[var(--navy-deep)] p-7 text-[var(--background)]">
                  <p className="eyebrow text-[var(--gold)]">Overall signal</p>
                  <p className="text-display text-5xl font-semibold mt-4 text-[var(--gold)]">
                    {report.overallScore}
                    <span className="text-2xl text-[var(--muted-foreground)]">/100</span>
                  </p>
                  <p className="mt-3 text-lg text-[var(--muted-foreground)]">{report.overallBand}</p>
                </div>
                <div>
                  <h2 className="text-display text-2xl font-semibold text-[var(--foreground)]">Your strongest signals</h2>
                  <div className="mt-4 grid gap-3">
                    {report.strengths?.map((strength: string) => (
                      <div
                        key={strength}
                        className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
                      >
                        <CheckCircle2 className="text-[var(--gold)]" size={18} />
                        <span className="text-sm font-semibold text-[var(--foreground)]">{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {report.domains?.map((domain: any) => (
                  <Card key={domain.key} className="border-[var(--border)] bg-[var(--card)]">
                    <CardContent className="p-5">
                      <div className="flex justify-between gap-3">
                        <strong className="text-[var(--foreground)]">{domain.label}</strong>
                        <span className="font-bold text-[var(--gold)]">{domain.score}/100</span>
                      </div>
                      <Progress value={domain.score} className="mt-3" />
                      <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{domain.readout}</p>
                      <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">Next: {domain.developmentActions?.[0]}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  onClick={downloadPaidReport}
                  disabled={downloadReport.isPending}
                  variant="gold"
                  className="gap-2"
                >
                  {downloadReport.isPending ? "Preparing PDF…" : "Download branded PDF"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    window.localStorage.setItem(
                      `piq-psychometric-saved-${paidReference || new URLSearchParams(window.location.search).get("reference")}`,
                      JSON.stringify({ ...report, savedAt: new Date().toISOString() })
                    );
                    toast.success("Profile saved to dashboard");
                  }}
                  className="border-[var(--border)] text-[var(--foreground)]"
                >
                  Save to dashboard
                </Button>
                <Link href="/dashboard" className="inline-flex items-center border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--foreground)]">
                  My workspace
                </Link>
                <SocialSharing
                  url={shareUrl}
                  title={shareTitle}
                  text={shareMessage}
                  platforms={["linkedin", "x", "facebook", "instagram", "tiktok", "whatsapp", "copy", "native"]}
                  onShare={handleShare}
                  className="bg-transparent border-transparent shadow-none"
                />
              </div>
              <section className="mt-8 border-t border-[var(--border)] pt-7">
                <p className="eyebrow text-[var(--gold)]">Recommended next steps</p>
                <h2 className="text-display text-2xl font-semibold mt-2 text-[var(--foreground)]">Turn insight into practice.</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
                  These Profound IQ courses are matched to this profile to help you move from reflection to observable action.
                </p>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {getPsychometricCourseRecommendations({
                    testSlug: report.testSlug,
                    domains: report.domains,
                  }).map(course => (
                    <article key={course.slug} className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 p-4 transition hover:border-[var(--gold)]">
                      <Link href={`/courses/${course.slug}`}>
                        <span className="block text-sm font-bold text-[var(--foreground)]">{course.title}</span>
                        <span className="mt-2 block text-xs leading-5 text-[var(--muted-foreground)]">{course.reason}</span>
                        <span className="mt-3 block text-xs font-bold text-[var(--gold)]">{course.action}</span>
                      </Link>
                      <div className="mt-4 border-t border-[var(--border)] pt-3">
                        <p className="text-[10px] font-black uppercase tracking-[.1em] text-[var(--muted-foreground)]">Was this useful?</p>
                        <div className="mt-2 flex gap-1" role="radiogroup" aria-label={`Rate ${course.title} recommendation`}>
                          {[1, 2, 3, 4, 5].map(rating => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => rateRecommendation(course.slug, rating)}
                              aria-label={`${rating} out of 5`}
                              aria-pressed={feedbackScores[course.slug] === rating}
                              className={cn(
                                feedbackScores[course.slug] && feedbackScores[course.slug] >= rating
                                  ? "text-[var(--gold)]"
                                  : "text-[var(--muted-foreground)]"
                              )}
                            >
                              <Star size={15} fill="currentColor" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                {/* CareerPath Cross-sell */}
                <div className="mt-8 p-6 rounded-2xl border-2 border-[var(--gold)] bg-[var(--gold)]/10">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="eyebrow text-[var(--gold)]">Complete your development picture</p>
                      <h3 className="text-display text-xl font-semibold mt-2 text-[var(--navy-deep)]">Add CareerPath for strategic career alignment</h3>
                      <p className="mt-2 text-sm text-[var(--muted-foreground)]">Combine this psychometric profile with CareerPath's values-fit analysis and role-matching for a complete talent development roadmap.</p>
                    </div>
                    <Link href="/careerpath">
                      <Button variant="gold" size="lg" className="gap-2">
                        Explore CareerPath <ChevronRight size={16} />
                      </Button>
                    </Link>
                  </div>
                </div>
              </section>
              <div className="mt-8 rounded-xl bg-[var(--muted)]/30 p-5 text-sm leading-7 text-[var(--foreground)]">
                <strong className="text-[var(--foreground)]">Important context. </strong>
                {report.disclaimer}
              </div>
            </CardContent>
          </Card>
          <PaystackInlineModal
            open={inlineModalOpen}
            product={inlineProduct}
            customerEmail={email}
            onClose={() => {
              setInlineModalOpen(false);
              setInlineProduct(null);
            }}
            onSuccess={reference => {
              setInlineModalOpen(false);
              setInlineProduct(null);
              verify.mutate(
                { reference },
                {
                  onSuccess: result => {
                    setReport(result.report);
                    setPaidReference(reference);
                    setPaymentMessage("Payment verified. Your personalized profile is ready.");
                    toast.success("Assessment complete");
                    setStage("report");
                  },
                  onError: error => {
                    setPaymentMessage(error.message);
                    toast.error("Payment failed", { description: error.message });
                  },
                }
              );
            }}
            onError={message => {
              setInlineModalOpen(false);
              setInlineProduct(null);
              setPaymentMessage(message);
              toast.error("Payment failed", { description: message });
            }}
          />
        </div>
      </main>
    );

  // Assessment view (questions stage)
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-body">
      <TransformationNav active="psychometrics" />
      <div className="container max-w-5xl py-8 lg:py-12">
        {/* Progress Steps */}
        <nav aria-label="Psychometrics progress" className="sticky top-16 z-40 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-sm px-4 py-4 sm:px-6">
          <ol className="flex items-center gap-2">
            <li className={cn("flex items-center gap-2 text-[10px] font-black uppercase tracking-[.1em]", stage !== "catalog" ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]")}>
              <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full border text-[10px]", stage !== "catalog" ? "border-[var(--gold)] bg-[var(--gold)] text-[var(--navy-deep)]" : "border-[var(--border)]")}>1</span>
              <span className="hidden sm:inline">Profiles</span>
            </li>
            <span className="h-px flex-1 bg-[var(--border)]" aria-hidden="true" />
            <li className={cn("flex items-center gap-2 text-[10px] font-black uppercase tracking-[.1em]", stage === "questions" || stage === "checkout" ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]")}>
              <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full border text-[10px]", stage === "questions" || stage === "checkout" ? "border-[var(--gold)] bg-[var(--gold)] text-[var(--navy-deep)]" : "border-[var(--border)]")}>2</span>
              <span className="hidden sm:inline">Assessment</span>
            </li>
            <span className="h-px flex-1 bg-[var(--border)]" aria-hidden="true" />
            <li className={cn("flex items-center gap-2 text-[10px] font-black uppercase tracking-[.1em]", stage === "checkout" ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]")}>
              <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full border text-[10px]", stage === "checkout" ? "border-[var(--gold)] bg-[var(--gold)] text-[var(--navy-deep)]" : "border-[var(--border)]")}>3</span>
              <span className="hidden sm:inline">Checkout</span>
            </li>
            <span className="h-px flex-1 bg-[var(--border)]" aria-hidden="true" />
            <li className={cn("flex items-center gap-2 text-[10px] font-black uppercase tracking-[.1em]", stage === "report" ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]")}>
              <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full border text-[10px]", stage === "report" ? "border-[var(--gold)] bg-[var(--gold)] text-[var(--navy-deep)]" : "border-[var(--border)]")}>4</span>
              <span className="hidden sm:inline">Profile</span>
            </li>
          </ol>
        </nav>

        <div className="flex items-center justify-between gap-4 mb-6">
          <Link href="/psychometrics">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft size={16} /> All profiles
            </Button>
          </Link>
          <span className="eyebrow text-[var(--gold)]">KES {PSYCHOMETRIC_PRICE_KES} · Paystack</span>
        </div>

        <section className="grid gap-8 lg:grid-cols-[1fr_350px]">
          <div>
            <p className="eyebrow text-[var(--gold)]">{test.shortTitle}</p>
            <h1 className="text-display text-4xl font-semibold leading-[1.05] tracking-tight mt-3 text-[var(--navy-deep)]">{test.strapline}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--muted-foreground)]">{test.purpose}</p>

            {/* Progress & Question */}
            <Card className="mt-8 border-[var(--border)] bg-[var(--card)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4 text-sm font-semibold mb-4">
                  <span>{workflowCopy.progress}</span>
                  <span>{completion}% · {index + 1} of {questions.length}</span>
                </div>
                <Progress value={completion} className="mb-6" />

                {/* Free taster indicator */}
                {isTasterQuestion && (
                  <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.1em] bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)] rounded-full">
                    <Sparkles size={12} /> Free taster question {index + 1} of 3
                  </div>
                )}

                <div className="mb-6">
                  <p className="eyebrow text-[var(--gold)]">{current?.domainLabel}</p>
                  <h2 className="mt-3 text-xl font-semibold leading-8 text-[var(--foreground)]">{current?.prompt}</h2>
                  {current && (
                    <LikertScale
                      id={current.id}
                      question={current.prompt}
                      value={selected}
                      onChange={choose}
                      options={current.options.map((option, optionIndex) => ({
                        value: optionIndex + 1,
                        label: option,
                      }))}
                    />
                  )}
                </div>

                {/* Navigation */}
                <div className="flex flex-wrap justify-between gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setIndex(value => Math.max(0, value - 1))}
                    disabled={index === 0}
                    className="gap-2"
                  >
                    <ArrowLeft size={16} /> {workflowCopy.previous}
                  </Button>
                  <div className="flex gap-3">
                    {index < questions.length - 1 ? (
                      <Button
                        variant="gold"
                        size="lg"
                        onClick={() => setIndex(value => Math.min(questions.length - 1, value + 1))}
                        disabled={selected === undefined}
                        className="gap-2"
                      >
                        {workflowCopy.next} <ArrowRight size={16} />
                      </Button>
                    ) : (
                      <Button
                        variant="gold"
                        size="lg"
                        onClick={() => { setIndex(questions.length); setStage("checkout"); }}
                        disabled={selected === undefined}
                        className="gap-2"
                      >
                        {workflowCopy.reviewAndPay} <Sparkles size={16} />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Taster completion prompt */}
                {index === 2 && questions.length > 3 && !tasterCompleted && (
                  <div className="mt-6 p-4 rounded-xl bg-[var(--gold)]/10 border border-[var(--gold)]/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[var(--navy-deep)]">Free taster complete!</p>
                        <p className="text-xs text-[var(--muted-foreground)]">You've completed 3 of {questions.length} questions. Continue to unlock your full profile.</p>
                      </div>
                      <Button variant="gold" size="sm" onClick={() => { setTasterCompleted(true); setIndex(3); }}>
                        Continue <ArrowRight size={14} />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <aside className="h-fit rounded-2xl bg-[var(--navy-deep)] p-6 text-[var(--background)] lg:sticky lg:top-24">
            <p className="eyebrow text-[var(--gold)]">{workflowCopy.beforeYouBegin}</p>
            <h2 className="text-display text-2xl font-semibold mt-3 text-[var(--background)]">A useful signal, not a label.</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">Your responses create a development profile for reflection, learning, and career conversations. They do not diagnose you or determine your future.</p>
            <div className="mt-6 flex items-center gap-2 text-sm">
              <Clock3 size={16} className="text-[var(--gold)]" /> {test.estimatedMinutes} minutes
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <LockKeyhole size={16} className="text-[var(--gold)]" /> KES {PSYCHOMETRIC_PRICE_KES} after completion
            </div>
            {/* Free taster highlight */}
            <div className="mt-4 p-3 rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/30">
              <p className="text-xs font-bold text-[var(--success)] flex items-center gap-1">
                <Sparkles size={12} /> First 3 questions free
              </p>
            </div>
          </aside>
        </section>

        {/* Checkout Section */}
        {stage === "checkout" && (
          <section className="mt-8 rounded-2xl border border-[var(--gold)]/50 bg-[var(--card)] p-6">
            <p className="eyebrow text-[var(--gold)]">{workflowCopy.secureCheckout}</p>
            <h2 className="text-display text-2xl font-semibold mt-3 text-[var(--navy-deep)]">Send your profile to yourself</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Input
                id="psychometrics-name"
                name="name"
                placeholder={workflowCopy.fullName}
                value={name}
                onChange={event => setName(event.target.value)}
                autoComplete="name"
              />
              <Input
                id="psychometrics-email"
                name="email"
                type="email"
                placeholder={workflowCopy.emailAddress}
                value={email}
                onChange={event => setEmail(event.target.value)}
                autoComplete="email"
              />
            </div>
            <label className="mt-5 flex items-start gap-3 text-sm leading-6 text-[var(--foreground)]">
              <Checkbox
                checked={consent}
                onCheckedChange={value => setConsent(Boolean(value))}
              />{" "}
              {workflowCopy.consent}
            </label>
            <Button
              onClick={submit}
              disabled={initializeInline.isPending}
              variant="gold"
              size="lg"
              className="mt-5 w-full gap-2"
            >
              {initializeInline.isPending ? "Preparing secure checkout…" : `Pay KES ${PSYCHOMETRIC_PRICE_KES} ${workflowCopy.generateProfile}`}
            </Button>
          </section>
        )}

        {/* Checkout Modal */}
        {showCheckout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--navy-deep)]/80 backdrop-blur-sm" role="dialog" aria-modal="true">
            <CheckoutForm
              product={{
                name: `${test.title} Profile`,
                priceKes: PSYCHOMETRIC_PRICE_KES,
                type: "psychometric",
                slug: test.slug,
              }}
              prefilled={user ? { email: user.email || undefined, name: user.name || undefined } : undefined}
              upsells={[
                { id: "careerpath", name: "CareerPath Bundle", priceKes: 15000, description: "Psychometric + CareerPath report + development plan" },
                { id: "coaching", name: "1-on-1 Debrief Session", priceKes: 5000, description: "60-minute personalized profile review with a certified coach" },
              ]}
              onSuccess={handleCheckoutSuccess}
              onClose={() => setShowCheckout(false)}
            />
          </div>
        )}

        <PaystackInlineModal
          open={inlineModalOpen}
          product={inlineProduct}
          customerEmail={email}
          onClose={() => {
            setInlineModalOpen(false);
            setInlineProduct(null);
          }}
          onSuccess={reference => {
            setInlineModalOpen(false);
            setInlineProduct(null);
            verify.mutate(
              { reference },
              {
                onSuccess: result => {
                  setReport(result.report);
                  setPaidReference(reference);
                  setPaymentMessage("Payment verified. Your personalized profile is ready.");
                  toast.success("Assessment complete");
                  setStage("report");
                },
                onError: error => {
                  setPaymentMessage(error.message);
                  toast.error("Payment failed", { description: error.message });
                },
              }
            );
          }}
          onError={message => {
            setInlineModalOpen(false);
            setInlineProduct(null);
            setPaymentMessage(message);
            toast.error("Payment failed", { description: message });
          }}
        />
      </div>
    </main>
  );
}
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, LockKeyhole, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { LikertScale } from "@/components/LikertScale";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { getPsychometricCourseRecommendations } from "@shared/psychometricRecommendations";
import { useLocale } from "@/contexts/LocaleContext";
import { getPsychometricWorkflowCopy } from "@shared/psychometricWorkflowLocalization";
import PaystackInlineModal, { type PaystackInlineProduct } from "@/components/PaystackInlineModal";

const displayPrice = "KES 699";

type Answer = { questionId: string; value: number };

export default function Psychometrics() {
  const [, params] = useRoute("/psychometrics/:slug");
  const [, navigate] = useLocation();
  const { t, locale } = useLocale();
  const workflowCopy = getPsychometricWorkflowCopy(locale);
  const slug = params?.slug;
  const catalog = trpc.psychometric.catalog.useQuery(undefined, { enabled: !slug });
  const detail = trpc.psychometric.questions.useQuery({ testSlug: slug ?? "" }, { enabled: Boolean(slug) });
  const verify = trpc.psychometric.verifyPayment.useMutation();
  const downloadReport = trpc.psychometric.downloadReport.useMutation();
  const initialize = trpc.psychometric.initializePayment.useMutation();
  const initializeInline = trpc.psychometric.initializeInlinePayment.useMutation();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [paidReference, setPaidReference] = useState<string | null>(null);
  const [feedbackScores, setFeedbackScores] = useState<Record<string, number>>({});
  const recommendationFeedback = trpc.psychometric.recommendationFeedback.useMutation({ onSuccess: () => toast.success("Thanks — your recommendation feedback was saved."), onError: (error) => toast.error("Could not save feedback", { description: error.message }) });
  const [paymentMessage, setPaymentMessage] = useState("");
  const [inlineModalOpen, setInlineModalOpen] = useState(false);
  const [inlineProduct, setInlineProduct] = useState<PaystackInlineProduct | null>(null);
  const questions = detail.data?.questions ?? [];
  const current = questions[index];
  const completion = questions.length ? Math.round((Object.keys(answers).length / questions.length) * 100) : 0;

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const reference = query.get("reference");
    if (!reference) return;
    if (query.get("payment") !== "success") return;
    verify.mutate({ reference }, { onSuccess: (result) => { setReport(result.report); setPaidReference(reference); setPaymentMessage("Payment verified. Your personalized profile is ready."); toast.success("Assessment complete"); }, onError: (error) => { setPaymentMessage(error.message); toast.error(error.message); } });
  }, []);

  useEffect(() => {
    if (!inlineModalOpen || !inlineProduct?.reference) return;
    let cancelled = false;
    const tick = async () => {
      if (cancelled) return;
      try {
        await new Promise<void>((resolve, reject) => {
          verify.mutate({ reference: inlineProduct.reference }, {
            onSuccess: (result) => {
              if (!cancelled && result?.report) {
                setReport(result.report);
                setPaidReference(inlineProduct.reference);
                setPaymentMessage("Payment verified. Your personalized profile is ready.");
                toast.success("Assessment complete");
                setInlineModalOpen(false);
                setInlineProduct(null);
              }
              resolve();
            },
            onError: () => resolve(),
          });
        });
      } catch {
        // keep polling
      } finally {
        if (!cancelled) setTimeout(tick, 3000);
      }
    };
    tick();
    return () => { cancelled = true; };
  }, [inlineModalOpen, inlineProduct?.reference, verify]);

  useEffect(() => {
    const saved = window.localStorage.getItem("piq-psychometric-answers");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAnswers(parsed);
      } catch {
        // ignore corrupt storage
      }
    }
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    const handler = () => {
      window.localStorage.setItem("piq-psychometric-answers", JSON.stringify(answers));
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [answers, slug]);

  useEffect(() => {
    if (slug && detail.data) {
      document.title = `${detail.data.title} | Profound IQ Consulting`;
      const description = document.querySelector('meta[name="description"]');
      description?.setAttribute("content", `${detail.data.purpose} Complete the ${detail.data.shortTitle} online for ${displayPrice}.`);
    } else if (!slug) document.title = "Professional Psychometric Assessments | Profound IQ Consulting";
  }, [slug, detail.data]);

  const selected = useMemo(() => current ? answers[current.id] : undefined, [answers, current]);
  const choose = (value: number) => { if (!current) return; setAnswers((previous) => ({ ...previous, [current.id]: value })); };
  const downloadPaidReport = async () => { const reference = paidReference || new URLSearchParams(window.location.search).get("reference"); if (!reference) { toast.error("A verified payment reference is required."); return; } try { const result = await downloadReport.mutateAsync({ reference }); const bytes = Uint8Array.from(atob(result.data), (character) => character.charCodeAt(0)); const url = URL.createObjectURL(new Blob([bytes], { type: result.contentType })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = result.filename; anchor.click(); URL.revokeObjectURL(url); toast.success("Profile PDF downloaded"); } catch (error) { toast.error("Profile PDF unavailable", { description: error instanceof Error ? error.message : "Please try again." }); } };
  const rateRecommendation = (courseSlug: string, rating: number) => { setFeedbackScores((current) => ({ ...current, [courseSlug]: rating })); recommendationFeedback.mutate({ testSlug: report?.testSlug ?? slug ?? "", courseSlug, rating }); };
  const submit = () => {
    if (!detail.data || !name.trim() || !email.trim() || !consent || Object.keys(answers).length !== questions.length) { toast.error("Complete every response, your details, and consent before checkout."); return; }
    initializeInline.mutate({ testSlug: detail.data.slug, name: name.trim(), email: email.trim(), answers: questions.map((question) => ({ questionId: question.id, value: answers[question.id] })), consent: true }, { onSuccess: (result) => { setInlineProduct({ accessCode: result.accessCode, reference: result.reference, amountKes: result.amountKes, productName: result.productName, productType: result.productType as "psychometric", testSlug: result.testSlug }); setInlineModalOpen(true); }, onError: (error) => toast.error(error.message) });
  };

  if (!slug) return <main className="min-h-screen bg-[#f7f3e8] text-[#16243d]"><section className="bg-[#16243d] px-6 py-20 text-[#f7f3e8]"><div className="container"><p className="eyebrow text-[#c9a34e]">PROFOUND IQ / TRANSFORMATION SERVICES</p><h1 className="display mt-5 max-w-4xl text-6xl leading-[.95]">Professional psychometric profiles for <em className="text-[#c9a34e]">better decisions.</em></h1><p className="mt-7 max-w-2xl text-lg leading-8 text-[#d7deea]">Six complementary assessments for career exploration, cognitive reasoning, emotional intelligence, employability, leadership, and occupational fit. Each profile turns structured responses into practical development conversations.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/"><Button variant="outline" className="border-[#c9a34e] text-[#f7f3e8]">Back to home</Button></Link><span className="inline-flex items-center gap-2 px-4 py-2 text-sm text-[#d7deea]"><LockKeyhole size={16} /> Secure Paystack checkout · {displayPrice}</span></div></div></section><section className="container grid gap-5 py-12 md:grid-cols-2 xl:grid-cols-3">{catalog.isLoading ? <p>Loading profiles…</p> : catalog.data?.map((test) => <Card key={test.slug} className="border-[#16243d]/15 bg-[#fffdf7]"><CardHeader><div className="flex items-center justify-between gap-3"><span className="eyebrow text-[#a27e2e]">{test.questionCount} items</span><span className="text-sm font-semibold text-[#a27e2e]">{displayPrice}</span></div><CardTitle className="display text-3xl text-[#16243d]">{test.title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-7 text-[#16243d]">{test.strapline}</p><p className="mt-3 text-sm leading-6 text-[#16243d]">{test.purpose}</p><div className="mt-5 flex items-center justify-between text-xs font-bold uppercase tracking-[.12em] text-[#16243d]"><span className="inline-flex items-center gap-1"><Clock3 size={14} /> {test.estimatedMinutes} min</span><Link href={`/psychometrics/${test.slug}`}><Button className="bg-[#c9a34e] text-[#16243d] hover:bg-[#b18d3d]">Start profile <ArrowRight size={16} /></Button></Link></div></CardContent></Card>)}</section></main>;;

  const test = detail.data;
  if (!test) return <main className="container py-20">Loading assessment…</main>;

  if (report) return (
    <main className="min-h-screen bg-[#f7f3e8] px-6 py-12 text-[#16243d]">
      <div className="container max-w-5xl">
        <Link href="/psychometrics">
          <Button variant="ghost">
            <ArrowLeft size={16} /> All profiles
          </Button>
        </Link>
        <Card className="mt-6 border-[#c9a34e]/50 bg-[#fffdf7]">
          <CardHeader>
            <p className="eyebrow text-[#a27e2e]">PERSONALIZED PROFILE</p>
            <CardTitle className="display text-5xl">{report.title}</CardTitle>
            <p className="text-[#16243d]">{paymentMessage}</p>
          </CardHeader>
            <CardContent>
              <div className="grid gap-5 md:grid-cols-[1fr_1.5fr]">
                <div className="rounded-2xl bg-[#16243d] p-7 text-[#f7f3e8]">
                  <p className="eyebrow text-[#c9a34e]">Overall signal</p>
                  <p className="display mt-4 text-7xl text-[#c9a34e]">{report.overallScore}<span className="text-2xl text-[#f7f3e8]">/100</span></p>
                  <p className="mt-3 text-lg">{report.overallBand}</p>
                </div>
                <div>
                  <h2 className="display text-3xl">Your strongest signals</h2>
                  <div className="mt-4 grid gap-3">
                    {report.strengths?.map((strength: string) => (
                      <div key={strength} className="flex items-center gap-3 rounded-xl border border-[#16243d]/10 p-4">
                        <CheckCircle2 className="text-[#a27e2e]" size={18} />
                        <span className="text-sm font-semibold text-[#16243d]">{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {report.domains?.map((domain: any) => (
                  <div key={domain.key} className="rounded-xl border border-[#16243d]/10 bg-white p-5">
                    <div className="flex justify-between gap-3">
                      <strong className="text-[#16243d]">{domain.label}</strong>
                      <span className="font-bold text-[#a27e2e]">{domain.score}/100</span>
                    </div>
                    <Progress value={domain.score} className="mt-3" />
                    <p className="mt-3 text-sm leading-6 text-[#16243d]">{domain.readout}</p>
                    <p className="mt-3 text-sm font-semibold text-[#16243d]">Next: {domain.developmentActions?.[0]}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button onClick={downloadPaidReport} disabled={downloadReport.isPending} className="bg-[#16243d] text-[#f7f3e8]">
                  {downloadReport.isPending ? "Preparing PDF…" : "Download branded PDF"}
                </Button>
                <Button variant="outline" onClick={() => { window.localStorage.setItem(`piq-psychometric-saved-${paidReference || new URLSearchParams(window.location.search).get("reference")}`, JSON.stringify({ ...report, savedAt: new Date().toISOString() })); toast.success("Profile saved to dashboard"); }} className="border-[#16243d]/25 text-[#16243d]">
                  Save to dashboard
                </Button>
                <Link href="/dashboard" className="inline-flex items-center border border-[#16243d]/25 px-4 py-2 text-sm font-semibold text-[#16243d]">{t("myWorkspace")}</Link>
              </div>
              <section className="mt-8 border-t border-[#16243d]/10 pt-7">
                <p className="eyebrow text-[#a27e2e]">Recommended next steps</p>
                <h2 className="display mt-2 text-3xl">Turn insight into practice.</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#16243d]">These Profound IQ courses are matched to this profile to help you move from reflection to observable action.</p>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {getPsychometricCourseRecommendations({ testSlug: report.testSlug, domains: report.domains }).map((course) => (
                    <div key={course.slug} className="rounded-xl border border-[#16243d]/10 bg-[#f7f3e8] p-4 transition hover:-translate-y-0.5 hover:border-[#c9a34e]">
                      <Link href={`/courses/${course.slug}`}>
                        <span className="block text-sm font-bold text-[#16243d]">{course.title}</span>
                        <span className="mt-2 block text-xs leading-5 text-[#16243d]">{course.reason}</span>
                        <span className="mt-3 block text-xs font-bold text-[#7d5e1e]">{course.action}</span>
                      </Link>
                      <div className="mt-4 border-t border-[#16243d]/10 pt-3">
                        <p className="text-[10px] font-black uppercase tracking-[.1em] text-[#16243d]">Was this useful?</p>
                        <div className="mt-2 flex gap-1" role="radiogroup" aria-label={`Rate ${course.title} recommendation`}>
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button key={rating} type="button" onClick={() => rateRecommendation(course.slug, rating)} aria-label={`${rating} out of 5`} aria-pressed={feedbackScores[course.slug] === rating} className={feedbackScores[course.slug] && feedbackScores[course.slug] >= rating ? "text-[#a27e2e]" : "text-[#9aa2ad]"}>
                              <Star size={15} fill="currentColor" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            <div className="mt-8 rounded-xl bg-[#ece5d6] p-5 text-sm leading-7 text-[#16243d]">
              <strong className="text-[#16243d]">Important context. </strong>
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
          onSuccess={(reference) => {
            setInlineModalOpen(false);
            setInlineProduct(null);
            verify.mutate({ reference }, {
              onSuccess: (result) => {
                setReport(result.report);
                setPaidReference(reference);
                setPaymentMessage("Payment verified. Your personalized profile is ready.");
                toast.success("Assessment complete");
              },
              onError: (error) => {
                setPaymentMessage(error.message);
                toast.error(error.message);
              },
            });
          }}
          onError={(message) => {
            setInlineModalOpen(false);
            setInlineProduct(null);
            setPaymentMessage(message);
            toast.error("Payment failed", { description: message });
          }}
        />
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#f7f3e8] px-4 py-8 text-[#16243d] sm:px-6">
      <div className="container max-w-5xl">
        <nav aria-label="Psychometrics progress" className="sticky top-0 z-40 border-b border-[#16243d]/10 bg-[#f7f3e8]/95 py-3 backdrop-blur sm:py-4">
          <ol className="flex items-center gap-2">
            <li className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[.1em] ${!slug ? "text-[#16243d]" : "text-[#a27e2e]"}`}>
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[10px] ${!slug ? "border-[#c9a34e] bg-[#c9a34e] text-[#16243d]" : "border-[#a27e2e] text-[#a27e2e]"}`}>1</span>
              <span className="hidden sm:inline">Profiles</span>
            </li>
            <span className="h-px flex-1 bg-[#16243d]/10" aria-hidden="true" />
            <li className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[.1em] ${slug && !report ? "text-[#16243d]" : "text-[#657084]"}`}>
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[10px] ${slug && !report ? "border-[#c9a34e] bg-[#c9a34e] text-[#16243d]" : "border-[#16243d]/20"}`}>2</span>
              <span className="hidden sm:inline">Assessment</span>
            </li>
            <span className="h-px flex-1 bg-[#16243d]/10" aria-hidden="true" />
            <li className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[.1em] ${index === questions.length && !report ? "text-[#16243d]" : "text-[#657084]"}`}>
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[10px] ${index === questions.length && !report ? "border-[#c9a34e] bg-[#c9a34e] text-[#16243d]" : "border-[#16243d]/20"}`}>3</span>
              <span className="hidden sm:inline">Checkout</span>
            </li>
            <span className="h-px flex-1 bg-[#16243d]/10" aria-hidden="true" />
            <li className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[.1em] ${report ? "text-[#16243d]" : "text-[#657084]"}`}>
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[10px] ${report ? "border-[#c9a34e] bg-[#c9a34e] text-[#16243d]" : "border-[#16243d]/20"}`}>4</span>
              <span className="hidden sm:inline">Profile</span>
            </li>
          </ol>
        </nav>
        <div className="flex items-center justify-between gap-4">
          <Link href="/psychometrics">
            <Button variant="ghost">
              <ArrowLeft size={16} /> All profiles
            </Button>
          </Link>
          <span className="eyebrow text-[#a27e2e]">{displayPrice} · Paystack</span>
        </div>
        <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <p className="eyebrow text-[#a27e2e]">{test.shortTitle}</p>
            <h1 className="display mt-4 text-5xl leading-none">{test.strapline}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#16243d]">{test.purpose}</p>
            <div className="mt-8 rounded-2xl border border-[#16243d]/15 bg-[#fffdf7] p-5">
              <div className="flex items-center justify-between gap-4 text-sm font-semibold">
                <span>{workflowCopy.progress}</span>
                <span>{completion}% · {index + 1} of {questions.length}</span>
              </div>
              <Progress value={completion} className="mt-3" />
              <div className="mt-7">
                <p className="eyebrow text-[#a27e2e]">{current?.domainLabel}</p>
                <h2 className="mt-3 text-xl font-semibold leading-8">{current?.prompt}</h2>
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
              <div className="mt-6 flex flex-wrap justify-between gap-3">
                <Button variant="outline" onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0}>
                  <ArrowLeft size={16} /> {workflowCopy.previous}
                </Button>
                {index < questions.length - 1 ? (
                  <Button onClick={() => setIndex((value) => Math.min(questions.length - 1, value + 1))} disabled={selected === undefined} className="bg-[#16243d] text-[#f7f3e8]">
                    {workflowCopy.next} <ArrowRight size={16} />
                  </Button>
                ) : (
                  <Button onClick={() => setIndex(questions.length)} disabled={selected === undefined} className="bg-[#c9a34e] text-[#16243d]">
                    {workflowCopy.reviewAndPay} <Sparkles size={16} />
                  </Button>
                )}
              </div>
            </div>
          </div>
          <aside className="h-fit rounded-2xl bg-[#16243d] p-6 text-[#f7f3e8] lg:sticky lg:top-6">
            <p className="eyebrow text-[#c9a34e]">{workflowCopy.beforeYouBegin}</p>
            <h2 className="display mt-3 text-3xl">A useful signal, not a label.</h2>
            <p className="mt-4 text-sm leading-7 text-[#d7deea]">Your responses create a development profile for reflection, learning, and career conversations. They do not diagnose you or determine your future.</p>
            <div className="mt-6 flex items-center gap-2 text-sm">
              <Clock3 size={16} className="text-[#c9a34e]" /> {test.estimatedMinutes} minutes
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <LockKeyhole size={16} className="text-[#c9a34e]" /> {displayPrice} after completion
            </div>
          </aside>
        </section>
        {index === questions.length && (
          <section className="mt-8 rounded-2xl border border-[#c9a34e]/50 bg-[#fffdf7] p-6">
            <p className="eyebrow text-[#a27e2e]">{workflowCopy.secureCheckout}</p>
            <h2 className="display mt-3 text-3xl">Send your profile to yourself</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Input placeholder={workflowCopy.fullName} value={name} onChange={(event) => setName(event.target.value)} />
              <Input type="email" placeholder={workflowCopy.emailAddress} value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            <label className="mt-5 flex items-start gap-3 text-sm leading-6 text-[#16243d]">
              <Checkbox checked={consent} onCheckedChange={(value) => setConsent(Boolean(value))} /> {workflowCopy.consent}
            </label>
            <Button onClick={submit} disabled={initializeInline.isPending} className="mt-5 bg-[#16243d] text-[#f7f3e8]">
              {initializeInline.isPending ? "Preparing secure checkout…" : `Pay ${displayPrice} ${workflowCopy.generateProfile}`}
            </Button>
          </section>
        )}
      </div>
      <PaystackInlineModal
        open={inlineModalOpen}
        product={inlineProduct}
        customerEmail={email}
        onClose={() => {
          setInlineModalOpen(false);
          setInlineProduct(null);
        }}
        onSuccess={(reference) => {
          setInlineModalOpen(false);
          setInlineProduct(null);
          verify.mutate({ reference }, {
            onSuccess: (result) => {
              setReport(result.report);
              setPaidReference(reference);
              setPaymentMessage("Payment verified. Your personalized profile is ready.");
              toast.success("Assessment complete");
            },
            onError: (error) => {
              setPaymentMessage(error.message);
              toast.error(error.message);
            },
          });
        }}
        onError={(message) => {
          setInlineModalOpen(false);
          setInlineProduct(null);
          setPaymentMessage(message);
          toast.error("Payment failed", { description: message });
        }}
      />
    </main>
  );
}
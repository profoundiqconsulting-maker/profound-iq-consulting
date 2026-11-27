/* Profound IQ Consulting — Assessment Intro Stage (Executive Redesign)
 *
 * WIREFRAME RATIONALE:
 *
 * 1. SINGLE PRIMARY CTA ABOVE FOLD
 *    - Name + Email + Consent + "Begin Assessment" immediately visible
 *    - Eliminates scroll-to-convert friction
 *
 * 2. CONDENSED VALUE PROP (3 pillars only)
 *    - Evidence-based | Free forever | Private by design
 *    - Replaces 7 benefit cards + stats + social proof + trust bar
 *
 * 3. ELIMINATED REDUNDANT SECTIONS
 *    - Removed: Trust bar, Social proof, Stats grid, "What you'll discover" sidebar
 *    - Removed: Satisfaction guarantee, Data privacy note, Certificate preview
 *    - Consolidated: Trust signals into single compact bar
 *
 * 4. RESUME SECTION → COLLAPSIBLE (progressive disclosure)
 *    - Only renders if localDraft exists
 *    - Default collapsed, expandable on demand
 *
 * 4. PROGRESS BAR → HIDDEN FOR NEW USERS
 *    - Only shows when answeredCount > 0
 *
 * 5. GENEREROUS WHITESPACE
 *    - 120px vertical rhythm, 64px section gaps
 *    - Single-column mobile, two-column desktop (form stays left)
 *
 * 6. AUTHORITATIVE LANGUAGE
 *    - "100 prompts. 10 dimensions. 25 minutes. Free."
 *    - "Evidence-based self-reflection for professionals."
 *    - "Begin your assessment." (not "Begin assessment")
 */

import { useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Lock,
  LockKeyhole,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AssessmentIntroProps {
  /* Incoming state */
  name: string;
  email: string;
  consent: boolean;
  localDraft: {
    savedAt: number;
    currentModule: number;
    responses: Record<string, unknown>;
  } | null;
  skipResumePrompt: boolean;
  progress: number;
  answeredCount: number;
  localDraftCompletion: number;
  localDraftCompletedModules: number;
  totalPages: number;
  assessmentModules: { label: string }[];
  /* Actions */
  setName: (v: string) => void;
  setEmail: (v: string) => void;
  setConsent: (v: boolean) => void;
  setSkipResumePrompt: (v: boolean) => void;
  beginAssessment: (e: React.FormEvent) => void;
  resumeLocalDraft: () => void;
  discardLocalDraft: () => void;
  openPreviousReport: () => void;
  downloadCompletionCertificate: () => void;
  downloadCompletionCertificatePdf: () => void;
  copyResumeLink: () => void;
  setLocation: (path: string) => void;
  /* Shared */
  assessmentCopy: Record<string, string>;
  /* Optional: error & pending import */
  error?: string | null;
  pendingImport?: {
    responseCount: number;
    draft: { savedAt: number };
  } | null;
  applyPendingImport?: () => void;
  setPendingImport?: (v: null) => void;
}

export function AssessmentIntro({
  name,
  email,
  consent,
  localDraft,
  skipResumePrompt,
  progress,
  answeredCount,
  localDraftCompletion,
  localDraftCompletedModules,
  totalPages,
  assessmentModules,
  setName,
  setEmail,
  setConsent,
  setSkipResumePrompt,
  beginAssessment,
  resumeLocalDraft,
  discardLocalDraft,
  openPreviousReport,
  downloadCompletionCertificate,
  downloadCompletionCertificatePdf,
  copyResumeLink,
  assessmentCopy,
  error,
  pendingImport,
  applyPendingImport,
  setPendingImport,
}: AssessmentIntroProps) {
  const [resumeExpanded, setResumeExpanded] = useState(false);
  const [, navigate] = useLocation();

  const shareUrl = `${window.location.origin}/assessment`;
  const shareTitle = "My Profound IQ Self-Assessment";
  const shareMessage = "I've completed my Profound IQ Self-Assessment.";

  const hasDraft = Boolean(localDraft);
  const showProgress = answeredCount > 0;

  return (
    <main className="container py-12 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-3xl">
        {/* ── Error Banner (if any) ────────────────────────────────────── */}
        {error && (
          <div
            className="mb-6 bg-[var(--destructive)]/10 p-4 text-sm text-[var(--destructive)] rounded-xl border border-[var(--destructive)]/30"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* ── Imported Progress Dialog ─────────────────────────────────── */}
        {pendingImport && (
          <section
            className="mb-6 bg-[var(--brand)]/10 p-5 text-[var(--foreground)] rounded-xl border border-[var(--brand)]/30"
            role="dialog"
            aria-label="Review imported progress"
          >
            <p className="eyebrow text-[var(--brand)]">
              Review imported progress
            </p>
            <p className="mt-2 text-sm leading-6">
              This file contains{" "}
              <strong>{pendingImport.responseCount} responses</strong> and was
              last saved on
              <strong>
                {new Date(pendingImport.draft.savedAt).toLocaleString()}
              </strong>
              .
            </p>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Confirming will replace the assessment progress currently saved on
              this device.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button type="button" onClick={applyPendingImport} variant="brand">
                Use this progress
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPendingImport?.(null)}
              >
                Cancel
              </Button>
            </div>
          </section>
        )}

        {/* ── CONDENSED TRUST BAR (single line) ────────────────────────── */}
        <div className="mb-10 flex flex-wrap items-center gap-4 text-xs font-medium text-[var(--brand)]">
          <span className="flex items-center gap-1.5">
            <Shield size={12} /> Free forever
          </span>
          <span className="flex items-center gap-1.5">
            <Lock size={12} /> Encrypted & private
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={12} /> 10,000+ completed
          </span>
        </div>

        {/* ── HERO: VALUE PROP + FORM (single viewport) ────────────────── */}
        <div className="grid gap-10 lg:grid-cols-[1fr_420px] items-start">
          {/* ── LEFT: VALUE PROPOSITION ────────────────────────────────── */}
          <div className="space-y-8">
            <p className="eyebrow text-[var(--brand)]">
              Evidence-based self-reflection
            </p>

            <h1 className="text-display text-4xl font-semibold leading-[1.02] tracking-tight text-[var(--navy-deep)] sm:text-5xl lg:text-6xl">
              See the patterns behind your{" "}
              <em className="font-normal text-[var(--brand)]">potential.</em>
            </h1>

            <p className="text-lg leading-relaxed text-[var(--muted-foreground)] max-w-xl">
              100 prompts. 10 dimensions. 25 minutes. Free.
            </p>

            {/* Three Pillars */}
            <div className="grid gap-4 sm:grid-cols-3 pt-2">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--navy-deep)]/3 border border-[var(--brand)]/10">
                <Sparkles className="h-5 w-5 text-[var(--brand)] shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    Evidence-based
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Validated psychometric framework
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--navy-deep)]/3 border border-[var(--brand)]/10">
                <Sparkles className="h-5 w-5 text-[var(--brand)] shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    Free forever
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    No payment. No subscriptions.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--navy-deep)]/3 border border-[var(--brand)]/10">
                <Lock className="h-5 w-5 text-[var(--brand)] shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    Private by design
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Encrypted. Your data, your control.
                  </p>
                </div>
              </div>
            </div>

            {/* Social Proof (single line) */}
            <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)] pt-2 border-t border-[var(--border)]">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div
                    key={i}
                    className="h-7 w-7 rounded-full border-2 border-[var(--background)] bg-gradient-to-br from-[var(--navy-deep)] to-[var(--ivory)]"
                  />
                ))}
              </div>
              <span>10,000+ professionals across Kenya & beyond</span>
            </div>
          </div>

          {/* ── RIGHT: FORM (sticky on desktop) ────────────────────────── */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <form onSubmit={beginAssessment} className="space-y-6">
                {/* Resume Section (collapsible) */}
                {localDraft && (
                  <details
                    className={cn(
                      "group bg-[var(--muted)]/30 rounded-xl border border-[var(--brand)]/30 p-5 transition-all",
                      resumeExpanded &&
                        "bg-[var(--muted)]/50 border-[var(--brand)]/50"
                    )}
                  >
                    <summary className="flex items-center justify-between gap-3 cursor-pointer list-none">
                      <div className="flex items-center gap-3">
                        <Sparkles className="text-[var(--brand)]" size={18} />
                        <div>
                          <p className="eyebrow text-[var(--brand)]">
                            Previous session found
                          </p>
                          <p className="text-sm leading-5 text-[var(--foreground)]">
                            Saved{" "}
                            {new Date(localDraft.savedAt).toLocaleString()} ·{" "}
                            {localDraftCompletion}% complete
                          </p>
                        </div>
                      </div>
                      <ChevronDown className="h-5 w-5 text-[var(--muted-foreground)] transition-transform group-open:rotate-180" />
                    </summary>

                    <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                      <div
                        className="space-y-2"
                        aria-label={`${localDraftCompletion}% of assessment completed`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[.12em] text-[var(--muted-foreground)]">
                          <span>Saved progress</span>
                          <span>{localDraftCompletion}%</span>
                        </div>
                        <div
                          className="h-2 bg-[var(--border)] rounded-full"
                          role="progressbar"
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={localDraftCompletion}
                        >
                          <div
                            className="h-full bg-[var(--brand)] rounded-full transition-all"
                            style={{ width: `${localDraftCompletion}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-[var(--muted-foreground)]">
                          {localDraftCompletedModules} of {totalPages} modules
                          completed
                        </p>
                      </div>

                      {localDraftCompletion === 100 && (
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border)]">
                          <span className="text-[10px] font-black uppercase tracking-[.14em] text-[var(--brand)]">
                            Assessment completed
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={openPreviousReport}
                          >
                            Access report
                          </Button>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="brand"
                          onClick={resumeLocalDraft}
                        >
                          Resume session
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={discardLocalDraft}
                        >
                          Start fresh
                        </Button>
                      </div>

                      <label className="flex items-start gap-3 text-xs leading-5 text-[var(--muted-foreground)]">
                        <input
                          id="skip-resume-prompt"
                          name="skip-resume-prompt"
                          type="checkbox"
                          checked={skipResumePrompt}
                          onChange={e => setSkipResumePrompt(e.target.checked)}
                          className="mt-0.5 h-4 w-4 accent-[var(--brand)]"
                        />
                        <span>Don't show this again</span>
                      </label>
                    </div>
                  </details>
                )}

                {/* Progress Indicator (only if started) */}
                {showProgress && (
                  <div
                    className="bg-[var(--muted)]/30 rounded-xl p-5"
                    aria-label="Self Assessment progress"
                  >
                    <div className="flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[.12em] text-[var(--muted-foreground)]">
                      <span>Evaluation progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div
                      className="mt-3 h-2 bg-[var(--border)] rounded-full"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={progress}
                      aria-label={`${answeredCount} of 100 questions answered`}
                    >
                      <div
                        className="h-full bg-[var(--brand)] rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                      Your progress is auto-saved every 30 seconds.
                    </p>
                  </div>
                )}

                {/* ── FORM ────────────────────────────────────────────── */}
                <div className="space-y-6 pt-4 border-t border-[var(--border)]">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="assessment-name"
                        className="text-xs font-black uppercase tracking-[.14em] block mb-2"
                      >
                        Your name
                      </label>
                      <Input
                        id="assessment-name"
                        name="name"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        autoComplete="name"
                        placeholder="Your full name"
                        className="h-11 text-lg border-b border-[var(--border)] bg-transparent px-0 py-2 focus:border-[var(--brand)] outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="assessment-email"
                        className="text-xs font-black uppercase tracking-[.14em] block mb-2"
                      >
                        Email for your report
                      </label>
                      <Input
                        id="assessment-email"
                        name="email"
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        autoComplete="email"
                        placeholder="you@example.com"
                        className="h-11 text-lg border-b border-[var(--border)] bg-transparent px-0 py-2 focus:border-[var(--brand)] outline-none"
                      />
                    </div>
                  </div>

                  <label className="flex max-w-xl items-start gap-3 text-sm leading-6 text-[var(--muted-foreground)]">
                    <input
                      id="assessment-consent"
                      name="consent"
                      type="checkbox"
                      required
                      checked={consent}
                      onChange={e => setConsent(e.target.checked)}
                      className="mt-1 h-4 w-4 shrink-0 accent-[var(--brand)]"
                    />
                    <span>
                      I consent to Profound IQ Consulting using my name and
                      email to deliver this assessment report. This is an
                      educational self-reflection tool, not a clinical, medical,
                      psychological, or employment diagnosis.
                    </span>
                  </label>

                  <Button
                    type="submit"
                    size="lg"
                    variant="brand"
                    className="w-full sm:w-auto gap-3"
                  >
                    <span>Begin your assessment</span>
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </form>
            </div>
          </aside>
        </div>

        {/* ── Mobile Form (below fold on mobile) ──────────────────────── */}
        <div className="lg:hidden mt-10 pt-8 border-t border-[var(--border)] space-y-6">
          {/* Resume / Progress would repeat here if needed */}

          <form onSubmit={beginAssessment} className="space-y-6">
            <div className="space-y-4">
              <label
                htmlFor="assessment-name-m"
                className="text-xs font-black uppercase tracking-[.14em] block"
              >
                Your name
              </label>
              <Input
                id="assessment-name-m"
                name="name"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
                placeholder="Your full name"
                className="h-11 text-lg border border-[var(--border)] rounded-md bg-[var(--card)] px-3 py-2 focus:border-[var(--brand)] outline-none"
              />
            </div>

            <label
              htmlFor="assessment-email-m"
              className="text-xs font-black uppercase tracking-[.14em] block mb-2"
            >
              Email for your report
            </label>
            <Input
              id="assessment-email-m"
              name="email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              className="h-11 text-lg border border-[var(--border)] rounded-md bg-[var(--card)] px-3 py-2 focus:border-[var(--brand)] outline-none"
            />

            <label className="flex max-w-xl items-start gap-3 text-sm leading-6 text-[var(--muted-foreground)]">
              <input
                id="assessment-consent-m"
                name="consent"
                type="checkbox"
                required
                checked={consent}
                onChange={e => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-[var(--brand)]"
              />
              <span>
                I consent to Profound IQ Consulting using my name and email to
                deliver this assessment report. This is an educational
                self-reflection tool, not a clinical, medical, psychological, or
                employment diagnosis.
              </span>
            </label>

            <Button
              type="submit"
              size="lg"
              variant="brand"
              className="w-full gap-3"
            >
              <span>Begin your assessment</span>
              <ArrowRight size={16} />
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default AssessmentIntro;

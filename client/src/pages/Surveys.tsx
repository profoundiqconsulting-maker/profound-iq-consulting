/* Profound IQ Consulting — Surveys page: public polls, surveys, and product reviews. */
import { useState } from "react";
import { CheckCircle2, Star, Vote } from "lucide-react";
import { PublicPageShell } from "@/components/PublicPageShell";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SocialSharing } from "@/components/SocialSharing";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Question = {
  id: string;
  type: "single_choice" | "multiple_choice" | "text" | "rating" | "yes_no";
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
  minRating?: number;
  maxRating?: number;
};

type Survey = {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  options: string[] | unknown;
  responses: Record<string, number>;
  totalResponses: number;
  startsAt?: Date | null;
  endsAt?: Date | null;
  questions?: Question[] | null | unknown;
};

export default function Surveys() {
  const surveys = trpc.resources.activeSurveys.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: true,
  });
  const submitVoteMutation = trpc.resources.submitSurveyResponse.useMutation({
    onSuccess: () => {
      toast.success("Response recorded");
      surveys.refetch();
    },
    onError: error => toast.error(error.message),
  });
  const submitResearchMutation =
    trpc.resources.submitResearchResponse.useMutation({
      onSuccess: () => {
        toast.success("Response recorded");
        surveys.refetch();
      },
      onError: error => toast.error(error.message),
    });

  const [legacyVotes, setLegacyVotes] = useState<Record<number, number>>({});
  const [structuredAnswers, setStructuredAnswers] = useState<
    Record<number, Record<string, unknown>>
  >({});
  const [submittedSurveys, setSubmittedSurveys] = useState<
    Record<number, boolean>
  >({});

  const activeSurveys = (surveys.data ?? []).filter(
    s => s.status === "published"
  );

  const hasStructuredQuestions = (survey: Survey) => {
    return Array.isArray(survey.questions) && survey.questions.length > 0;
  };

  const handleLegacyVote = (surveyId: number, optionIndex: number) => {
    if (submittedSurveys[surveyId]) return;
    setSubmittedSurveys(prev => ({ ...prev, [surveyId]: true }));
    setLegacyVotes(prev => ({ ...prev, [surveyId]: optionIndex }));
    submitVoteMutation.mutate({ id: surveyId, optionIndex });
  };

  const handleStructuredSubmit = (
    surveyId: number,
    surveyAnswers: Record<string, unknown>
  ) => {
    if (submittedSurveys[surveyId]) return;
    setSubmittedSurveys(prev => ({ ...prev, [surveyId]: true }));
    setStructuredAnswers(prev => ({ ...prev, [surveyId]: surveyAnswers }));
    submitResearchMutation.mutate({ id: surveyId, answers: surveyAnswers });
  };

  const renderQuestion = (
    survey: Survey,
    question: Question,
    questionIndex: number
  ) => {
    const surveyAnswers = structuredAnswers[survey.id] || {};
    const isSubmitted = submittedSurveys[survey.id];

    switch (question.type) {
      case "single_choice":
        return (
          <div key={question.id} className="space-y-2">
            <p className="text-sm font-semibold">
              {questionIndex + 1}. {question.title}
              {question.required && (
                <span className="ml-1 text-[var(--danger)]">*</span>
              )}
            </p>
              {question.description && (
                <p className="text-xs text-[var(--fg-muted)]">{question.description}</p>
              )}
            <div className="space-y-2">
              {(question.options || []).map((option, optIndex) => {
                const isSelected = surveyAnswers[question.id] === optIndex;
                return (
                  <button
                    key={optIndex}
                    type="button"
                    onClick={() =>
                      !isSubmitted &&
                      handleStructuredSubmit(survey.id, {
                        ...surveyAnswers,
                        [question.id]: optIndex,
                      })
                    }
                    disabled={isSubmitted}
                    aria-pressed={isSelected}
                    className={`w-full rounded-lg border px-4 py-3 text-left transition-all disabled:cursor-default ${
                      isSelected
                        ? "border-[var(--brand)] bg-[var(--brand-muted)]"
                        : "border-[var(--border)]/15 hover:border-[var(--brand)]"
                    }`}
                  >
                    <span className="text-sm font-medium">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case "multiple_choice":
        const selectedOptions = Array.isArray(surveyAnswers[question.id])
          ? (surveyAnswers[question.id] as number[])
          : [];
        return (
          <div key={question.id} className="space-y-2">
            <p className="text-sm font-semibold">
              {questionIndex + 1}. {question.title}
              {question.required && (
                <span className="ml-1 text-[var(--danger)]">*</span>
              )}
            </p>
              {question.description && (
                <p className="text-xs text-[var(--fg-muted)]">{question.description}</p>
              )}
            <div className="space-y-2">
              {(question.options || []).map((option, optIndex) => {
                const isSelected = selectedOptions.includes(optIndex);
                return (
                  <button
                    key={optIndex}
                    type="button"
                    onClick={() => {
                      if (isSubmitted) return;
                      const newSelected = isSelected
                        ? selectedOptions.filter(i => i !== optIndex)
                        : [...selectedOptions, optIndex];
                      handleStructuredSubmit(survey.id, {
                        ...surveyAnswers,
                        [question.id]: newSelected,
                      });
                    }}
                    disabled={isSubmitted}
                    aria-pressed={isSelected}
                    className={`w-full rounded-lg border px-4 py-3 text-left transition-all disabled:cursor-default ${
                      isSelected
                        ? "border-[var(--brand)] bg-[var(--brand-muted)]"
                        : "border-[var(--border)]/15 hover:border-[var(--brand)]"
                    }`}
                  >
                    <span className="text-sm font-medium">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case "text":
        return (
          <div key={question.id} className="space-y-2">
            <p className="text-sm font-semibold">
              {questionIndex + 1}. {question.title}
              {question.required && (
                <span className="ml-1 text-[var(--danger)]">*</span>
              )}
            </p>
              {question.description && (
                <p className="text-xs text-[var(--fg-muted)]">{question.description}</p>
              )}
            <textarea
              value={(surveyAnswers[question.id] as string) || ""}
              onChange={event => {
                if (isSubmitted) return;
                setStructuredAnswers(prev => ({
                  ...prev,
                  [survey.id]: {
                    ...prev[survey.id],
                    [question.id]: event.target.value,
                  },
                }));
              }}
              onBlur={() => {
                if (!isSubmitted && surveyAnswers[question.id]) {
                  handleStructuredSubmit(survey.id, surveyAnswers);
                }
              }}
              disabled={isSubmitted}
              placeholder="Your answer..."
              rows={3}
              className="w-full border border-[var(--border)]/20 bg-[var(--bg-elevated)] px-3 py-2 text-sm disabled:cursor-default"
            />
          </div>
        );

      case "rating":
        const currentRating = surveyAnswers[question.id] as number | undefined;
        const min = question.minRating ?? 1;
        const max = question.maxRating ?? 5;
        return (
          <div key={question.id} className="space-y-2">
            <p className="text-sm font-semibold">
              {questionIndex + 1}. {question.title}
              {question.required && (
                <span className="ml-1 text-[var(--danger)]">*</span>
              )}
            </p>
              {question.description && (
                <p className="text-xs text-[var(--fg-muted)]">{question.description}</p>
              )}
            <div className="flex items-center gap-2">
              {Array.from({ length: max - min + 1 }, (_, i) => min + i).map(
                value => (
                    <button
                    key={value}
                    type="button"
                    onClick={() =>
                      !isSubmitted &&
                      handleStructuredSubmit(survey.id, {
                        ...surveyAnswers,
                        [question.id]: value,
                      })
                    }
                    disabled={isSubmitted}
                    aria-pressed={currentRating === value}
                    className={`flex size-10 items-center justify-center rounded-full border transition-all disabled:cursor-default ${
                      currentRating === value
                        ? "border-[var(--brand)] bg-[var(--brand-muted)]"
                        : "border-[var(--border)]/15 hover:border-[var(--brand)]"
                    }`}
                  >
                    <span className="text-sm font-bold">{value}</span>
                  </button>
                )
              )}
            </div>
              {currentRating !== undefined && (
                <p className="text-xs text-[var(--fg-muted)]">
                  You selected: {currentRating}
              </p>
            )}
          </div>
        );

      case "yes_no":
        const yesNoValue = surveyAnswers[question.id];
        return (
          <div key={question.id} className="space-y-2">
            <p className="text-sm font-semibold">
              {questionIndex + 1}. {question.title}
              {question.required && (
                <span className="ml-1 text-[var(--danger)]">*</span>
              )}
            </p>
              {question.description && (
                <p className="text-xs text-[var(--fg-muted)]">{question.description}</p>
              )}
            <div className="flex gap-3">
                {["Yes", "No"].map(option => {
                const isSelected = yesNoValue === option.toLowerCase();
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      !isSubmitted &&
                      handleStructuredSubmit(survey.id, {
                        ...surveyAnswers,
                        [question.id]: option.toLowerCase(),
                      })
                    }
                    disabled={isSubmitted}
                    aria-pressed={isSelected}
                    className={`flex-1 rounded-lg border px-4 py-3 text-sm font-semibold transition-all disabled:cursor-default ${
                      isSelected
                        ? "border-[var(--brand)] bg-[var(--brand-muted)]"
                        : "border-[var(--border)]/15 hover:border-[var(--brand)]"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <PublicPageShell
      eyebrow="05 / Surveys"
      title={
        <>
          Have your say. <br />
          <em className="font-normal text-[var(--brand)]">Shape what comes next.</em>
        </>
      }
      intro="Participate in our polls, surveys, and product reviews. Your feedback directly influences our programs and services."
      breadcrumbs={[{ label: "Surveys" }]}
      cta={{ label: "Explore courses", href: "/courses" }}
    >
      <section className="bg-[var(--bg-sunken)] py-24 lg:py-32">
        <div className="container">
          {surveys.isLoading ? (
            <p
              className="text-center text-sm text-[var(--fg-muted)]"
              role="status"
              aria-live="polite"
            >
              Loading surveys…
            </p>
          ) : activeSurveys.length === 0 ? (
            <div className="mx-auto max-w-2xl text-center">
              <Vote
                size={48}
                className="mx-auto text-[var(--brand)]"
                aria-hidden="true"
              />
              <h2 className="display mt-6 text-3xl">
                No active surveys right now
              </h2>
              <p className="mt-4 text-base text-[var(--fg-muted)]">
                Check back soon. We regularly run polls, surveys, and product
                reviews to help us improve our services.
              </p>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-2">
              {activeSurveys.map((survey, index) => {
                const isStructured = hasStructuredQuestions(survey);
                const shareUrl = `${window.location.origin}/surveys`;
                const shareText = `Participate in this ${survey.type}: ${survey.title}`;

                return (
                  <ScrollReveal key={survey.id} delay={index * 70}>
                    <article className="border border-[var(--border)]/10 bg-[var(--bg-elevated)] p-8 shadow-sm transition-all hover:shadow-lg">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="rounded-full bg-[var(--brand-muted)] px-3 py-1 text-[10px] font-black uppercase tracking-[.12em] text-[var(--brand)]">
                            {survey.type}
                          </span>
                          <h3 className="display mt-3 text-2xl">
                            {survey.title}
                          </h3>
                          <p className="mt-2 text-sm text-[var(--fg-muted)]">
                            {survey.description}
                          </p>
                        </div>
                      </div>

                      {isStructured ? (
                        <div className="mt-6 space-y-6">
                          {(survey.questions as Question[]).map((q, qIndex) =>
                            renderQuestion(survey, q, qIndex)
                          )}
                          {submittedSurveys[survey.id] && (
                            <div className="mt-4 flex items-center gap-2 text-[var(--success)]">
                              <CheckCircle2 size={16} aria-hidden="true" />
                              <span className="text-sm font-semibold">
                                Thank you for your response
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          className="mt-6 space-y-3"
                          role="radiogroup"
                          aria-label={`Options for ${survey.title}`}
                        >
                          {(survey.options as string[]).map(
                            (option, optIndex) => {
                              const votes =
                                survey.responses[String(optIndex)] ?? 0;
                              const totalVotes = survey.totalResponses;
                              const percentage =
                                totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                              const isSelected =
                                legacyVotes[survey.id] === optIndex;
                              return (
                                <button
                                  key={optIndex}
                                  type="button"
                                  onClick={() =>
                                    handleLegacyVote(survey.id, optIndex)
                                  }
                                  disabled={submittedSurveys[survey.id]}
                                  aria-pressed={isSelected}
                                  aria-checked={isSelected}
                                  className={`relative w-full overflow-hidden rounded-lg border px-4 py-3 text-left transition-all disabled:cursor-default ${
                                    isSelected
                                      ? "border-[var(--brand)] bg-[var(--brand-muted)]"
                                      : "border-[var(--border)]/15 hover:border-[var(--brand)]"
                                  }`}
                                >
                                  <div
                                    className="absolute inset-y-0 left-0 bg-[var(--brand-muted)] transition-all"
                                    style={{ width: `${percentage}%` }}
                                    aria-hidden="true"
                                  />
                                  <div className="relative flex items-center justify-between">
                                    <span className="text-sm font-medium">
                                      {option}
                                    </span>
                                    <span className="text-xs text-[var(--fg-muted)]">
                                      {percentage.toFixed(1)}%
                                    </span>
                                  </div>
                                </button>
                              );
                            }
                          )}
                          <p
                            className="mt-4 text-xs text-[var(--fg-muted)]"
                            aria-live="polite"
                            aria-atomic="true"
                          >
                            {survey.totalResponses} response
                            {survey.totalResponses === 1 ? "" : "s"}
                            {submittedSurveys[survey.id] && (
                              <span className="ml-2 inline-flex items-center gap-1 text-[var(--success)]">
                                <CheckCircle2 size={12} aria-hidden="true" />{" "}
                                You voted
                              </span>
                            )}
                          </p>
                        </div>
                      )}

                      <SocialSharing
                        url={shareUrl}
                        title={survey.title}
                        text={shareText}
                        platforms={[
                          "linkedin",
                          "x",
                          "facebook",
                          "whatsapp",
                          "copy",
                        ]}
                        className="mt-4"
                      />
                    </article>
                  </ScrollReveal>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </PublicPageShell>
  );
}

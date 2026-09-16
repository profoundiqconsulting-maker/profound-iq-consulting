/* Profound IQ Consulting — Surveys page: public polls, surveys, and product reviews. */
import { useState } from "react";
import { CheckCircle2, Vote } from "lucide-react";
import { PublicPageShell } from "@/components/PublicPageShell";
import { ScrollReveal } from "@/components/ScrollReveal";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Surveys() {
  const surveys = trpc.resources.activeSurveys.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: true,
  });
  const submitMutation = trpc.resources.submitSurveyResponse.useMutation({
    onSuccess: () => {
      toast.success("Response recorded");
      surveys.refetch();
    },
    onError: error => toast.error(error.message),
  });

  const [responses, setResponses] = useState<Record<number, number>>({});

  const activeSurveys = (surveys.data ?? []).filter(
    s => s.status === "published"
  );

  const handleVote = (surveyId: number, optionIndex: number) => {
    if (responses[surveyId] !== undefined) return;
    setResponses(prev => ({ ...prev, [surveyId]: optionIndex }));
    submitMutation.mutate({ id: surveyId, optionIndex });
  };

  return (
    <PublicPageShell
      eyebrow="05 / Surveys"
      title={
        <>
          Have your say. <br />
          <em className="font-normal text-[#c9a34e]">Shape what comes next.</em>
        </>
      }
      intro="Participate in our polls, surveys, and product reviews. Your feedback directly influences our programs and services."
      breadcrumbs={[{ label: "Surveys" }]}
      cta={{ label: "Explore courses", href: "/courses" }}
    >
      <section className="bg-[#f7f3e8] py-24 lg:py-32">
        <div className="container">
          {surveys.isLoading ? (
            <p className="text-center text-sm text-[#657084]" role="status" aria-live="polite">Loading surveys…</p>
          ) : activeSurveys.length === 0 ? (
            <div className="mx-auto max-w-2xl text-center">
              <Vote size={48} className="mx-auto text-[#c9a34e]" aria-hidden="true" />
              <h2 className="display mt-6 text-3xl">
                No active surveys right now
              </h2>
              <p className="mt-4 text-base text-[#4a566a]">
                Check back soon. We regularly run polls, surveys, and product
                reviews to help us improve our services.
              </p>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-2">
              {activeSurveys.map((survey, index) => {
                const totalVotes = survey.totalResponses;
                const userChoice = responses[survey.id];
                return (
                  <ScrollReveal key={survey.id} delay={index * 70}>
                    <article className="border border-[#16243d]/10 bg-white p-8 shadow-sm transition-all hover:shadow-lg">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="rounded-full bg-[#c9a34e]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[.12em] text-[#7d5e1e]">
                            {survey.type}
                          </span>
                          <h3 className="display mt-3 text-2xl">
                            {survey.title}
                          </h3>
                          <p className="mt-2 text-sm text-[#657084]">
                            {survey.description}
                          </p>
                        </div>
                      </div>
                      <div className="mt-6 space-y-3" role="radiogroup" aria-label={`Options for ${survey.title}`}>
                        {(survey.options as string[]).map((option, optIndex) => {
                          const votes =
                            (survey.responses as Record<string, number>)[
                              String(optIndex)
                            ] ?? 0;
                          const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                          const isSelected = userChoice === optIndex;
                          return (
                            <button
                              key={optIndex}
                              type="button"
                              onClick={() => handleVote(survey.id, optIndex)}
                              disabled={userChoice !== undefined}
                              aria-pressed={isSelected}
                              aria-checked={isSelected}
                              className={`relative w-full overflow-hidden rounded-lg border px-4 py-3 text-left transition-all disabled:cursor-default ${
                                isSelected
                                  ? "border-[#c9a34e] bg-[#c9a34e]/10"
                                  : "border-[#16243d]/15 hover:border-[#c9a34e]"
                              }`}
                            >
                              <div
                                className="absolute inset-y-0 left-0 bg-[#c9a34e]/10 transition-all"
                                style={{ width: `${percentage}%` }}
                                aria-hidden="true"
                              />
                              <div className="relative flex items-center justify-between">
                                <span className="text-sm font-medium">
                                  {option}
                                </span>
                                <span className="text-xs text-[#657084]">
                                  {percentage.toFixed(1)}%
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <p className="mt-4 text-xs text-[#657084]" aria-live="polite" aria-atomic="true">
                        {totalVotes} response{totalVotes === 1 ? "" : "s"}
                        {userChoice !== undefined && (
                          <span className="ml-2 inline-flex items-center gap-1 text-emerald-700">
                            <CheckCircle2 size={12} aria-hidden="true" /> You voted
                          </span>
                        )}
                      </p>
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

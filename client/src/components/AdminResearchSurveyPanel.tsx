/* Profound IQ Consulting — Admin research survey analysis panel. */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  BrainCircuit,
  FileText,
  Lightbulb,
  Send,
} from "lucide-react";

export default function AdminResearchSurveyPanel() {
  const [selectedSurveyId, setSelectedSurveyId] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState("");
  const [insights, setInsights] = useState("");
  const [advisory, setAdvisory] = useState("");

  const surveys = trpc.admin.listSurveys.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: true,
  });
  const responses = trpc.admin.surveyResponses.useQuery(
    { surveyId: selectedSurveyId ?? 0 },
    { enabled: Boolean(selectedSurveyId), retry: false }
  );
  const existingAnalysis = trpc.admin.getSurveyAnalysis.useQuery(
    { surveyId: selectedSurveyId ?? 0 },
    { enabled: Boolean(selectedSurveyId), retry: false }
  );
  const analyze = trpc.admin.analyzeSurvey.useMutation({
    onSuccess: () => {
      toast.success("Analysis saved.");
      existingAnalysis.refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const selectedSurvey = surveys.data?.find((s) => s.id === selectedSurveyId);

  const handleAnalyze = () => {
    if (!selectedSurveyId) return;
    setAnalysis("");
    setInsights("");
    setAdvisory("");
    const responseRows = responses.data ?? [];
    const total = responseRows.length;
    const options = (selectedSurvey?.options as string[]) ?? [];
    const counts: Record<string, number> = {};
    options.forEach((_, idx) => {
      counts[idx] = 0;
    });
    responseRows.forEach((row) => {
      const answers = row.answers as Record<string, number>;
      Object.values(answers).forEach((val) => {
        const key = String(val);
        if (key in counts) counts[key] = (counts[key] ?? 0) + 1;
      });
    });
    const analysisJson: Record<string, unknown> = {
      totalResponses: total,
      optionCounts: counts,
      participationRate: total > 0 ? "100%" : "0%",
    };
    const insightsJson: Record<string, unknown> = {
      summary: total === 0
        ? "No responses yet."
        : `Survey received ${total} response${total === 1 ? "" : "s"}.`,
      topChoice: Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
    };
    const advisoryJson: Record<string, unknown> = {
      recommendation: total === 0
        ? "Wait for more responses before drawing conclusions."
        : "Consider follow-up questions based on the top choice.",
    };
    setAnalysis(JSON.stringify(analysisJson, null, 2));
    setInsights(JSON.stringify(insightsJson, null, 2));
    setAdvisory(JSON.stringify(advisoryJson, null, 2));
    analyze.mutate({
      surveyId: selectedSurveyId,
      analysisJson,
      insightsJson,
      advisoryJson,
    });
  };

  return (
    <div className="mt-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Research Survey Analysis</CardTitle>
          <CardDescription>
            Select a survey, generate analysis, and publish insights.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(surveys.data ?? []).map((survey) => (
              <button
                key={survey.id}
                type="button"
                onClick={() => setSelectedSurveyId(survey.id)}
                className={`rounded-lg border p-4 text-left transition-all hover:shadow-md ${
                  selectedSurveyId === survey.id
                    ? "border-[#c9a34e] bg-[#c9a34e]/5"
                    : "border-slate-200"
                }`}
              >
                <p className="font-semibold text-slate-900">{survey.title}</p>
                <p className="text-xs text-slate-600 line-clamp-1">
                  {survey.description}
                </p>
                <div className="mt-2 flex gap-2">
                  <Badge variant="outline" className="capitalize">
                    {survey.type}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {survey.status}
                  </Badge>
                  <span className="text-xs text-slate-600">
                    {survey.totalResponses} responses
                  </span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedSurveyId && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 size={18} /> Responses
              </CardTitle>
              <CardDescription>
                {responses.data?.length ?? 0} total responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {responses.isLoading ? (
                <p className="py-8 text-center text-sm text-slate-600">
                  Loading responses…
                </p>
              ) : (responses.data ?? []).length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-600">
                  No responses yet.
                </p>
              ) : (
                <div className="max-h-80 space-y-2 overflow-y-auto">
                  {(responses.data ?? []).map((row) => (
                    <div
                      key={row.id}
                      className="rounded-lg border border-slate-200 p-3"
                    >
                      <p className="text-xs text-slate-600">
                        {row.respondentEmail || "Anonymous"} —{" "}
                        {new Date(row.submittedAt).toLocaleString()}
                      </p>
                      <pre className="mt-1 overflow-x-auto text-xs text-slate-900">
                        {JSON.stringify(row.answers, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BrainCircuit size={18} /> Analysis & Insights
              </CardTitle>
              <CardDescription>
                {existingAnalysis.data
                  ? "Last generated: " +
                    new Date(existingAnalysis.data.generatedAt).toLocaleString()
                  : "No analysis generated yet."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase tracking-[.1em]">
                  Analysis
                </label>
                <Textarea
                  value={analysis}
                  onChange={(event) => setAnalysis(event.target.value)}
                  rows={4}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase tracking-[.1em]">
                  Insights
                </label>
                <Textarea
                  value={insights}
                  onChange={(event) => setInsights(event.target.value)}
                  rows={4}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase tracking-[.1em]">
                  Advisory
                </label>
                <Textarea
                  value={advisory}
                  onChange={(event) => setAdvisory(event.target.value)}
                  rows={4}
                />
              </div>
              <Button
                type="button"
                onClick={handleAnalyze}
                disabled={analyze.isPending}
                className="w-full bg-[#16243d] text-white"
              >
                <Send size={14} className="mr-2" />
                {analyze.isPending ? "Analyzing…" : "Generate Analysis"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

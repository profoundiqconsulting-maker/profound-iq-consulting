export const ASSESSMENT_PRICE_KES = 399;

export const dimensions = [
  { key: "clarity", label: "Clarity of direction", description: "How confidently you define priorities and make sense of competing demands." },
  { key: "adaptability", label: "Adaptive thinking", description: "How readily you learn, reframe, and respond when conditions change." },
  { key: "leadership", label: "Leadership agency", description: "How consistently you take ownership and create momentum for others." },
  { key: "communication", label: "Communication", description: "How deliberately you listen, explain, and navigate important conversations." },
  { key: "collaboration", label: "Collaborative impact", description: "How effectively you build trust and contribute across different perspectives." },
  { key: "execution", label: "Execution discipline", description: "How reliably you translate intentions into focused, repeatable action." },
  { key: "resilience", label: "Resilient practice", description: "How constructively you recover, regulate, and keep moving through pressure." },
  { key: "selfAwareness", label: "Self-awareness", description: "How clearly you notice your patterns, strengths, and growth edges." },
  { key: "influence", label: "Ethical influence", description: "How thoughtfully you shape decisions, relationships, and outcomes." },
  { key: "growth", label: "Growth orientation", description: "How actively you seek feedback, practice, and meaningful development." },
] as const;

const stems = [
  "I can explain the priority that matters most in my current work.",
  "I pause to understand the situation before choosing a response.",
  "I turn broad goals into a next action I can complete.",
  "I ask for useful feedback before a small issue becomes a larger one.",
  "I make space for perspectives that differ from my own.",
  "I stay constructive when a plan needs to change.",
  "I communicate expectations clearly enough for others to act.",
  "I notice the habits that either support or limit my progress.",
  "I protect time for work that has long-term value.",
  "I can identify what I need to learn next to improve my impact.",
] as const;

export const assessmentQuestions = dimensions.flatMap((dimension, dimensionIndex) =>
  stems.map((stem, stemIndex) => ({
    id: `q-${dimensionIndex * stems.length + stemIndex + 1}`,
    dimension: dimension.key,
    prompt: `${stem} (${dimension.label.toLowerCase()})`,
  })),
);

export type AssessmentAnswer = { questionId: string; value: number };
export type AssessmentReport = {
  overallScore: number;
  overallBand: string;
  dimensions: Array<{ key: string; label: string; score: number; description: string }>;
  strengths: string[];
  focusAreas: string[];
  disclaimer: string;
};

export function buildReport(answers: AssessmentAnswer[]): AssessmentReport {
  const scoreByDimension = new Map<string, number[]>();
  for (const question of assessmentQuestions) {
    const answer = answers.find((item) => item.questionId === question.id);
    if (!answer) continue;
    const scores = scoreByDimension.get(question.dimension) ?? [];
    scores.push(Math.max(1, Math.min(5, answer.value)));
    scoreByDimension.set(question.dimension, scores);
  }

  const scoredDimensions = dimensions.map((dimension) => {
    const values = scoreByDimension.get(dimension.key) ?? [];
    const score = values.length ? Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 20) : 0;
    return { key: dimension.key, label: dimension.label, score, description: dimension.description };
  });
  const overallScore = scoredDimensions.length ? Math.round(scoredDimensions.reduce((sum, item) => sum + item.score, 0) / scoredDimensions.length) : 0;
  const overallBand = overallScore >= 80 ? "Strong foundation" : overallScore >= 60 ? "Building momentum" : "Opportunity to grow";
  const ordered = [...scoredDimensions].sort((a, b) => b.score - a.score);
  return {
    overallScore,
    overallBand,
    dimensions: scoredDimensions,
    strengths: ordered.slice(0, 3).map((item) => item.label),
    focusAreas: ordered.slice(-3).reverse().map((item) => item.label),
    disclaimer: "This educational self-assessment is a reflective development tool, not a clinical, psychological, employment, or medical diagnosis. Use the report as a starting point for conversation and action.",
  };
}

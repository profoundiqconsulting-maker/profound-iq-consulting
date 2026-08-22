export const ASSESSMENT_PRICE_KES = 200;

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

export const assessmentQuestions = dimensions.flatMap((dimension, dimensionIndex) => stems.map((stem, stemIndex) => ({ id: `q-${dimensionIndex * stems.length + stemIndex + 1}`, dimension: dimension.key, prompt: `${stem} (${dimension.label.toLowerCase()})` })));

export type AssessmentAnswer = { questionId: string; value: number };
export type AssessmentDimensionReport = { key: string; label: string; score: number; description: string; readout: string; reflectionPoints: string[] };
export type AssessmentReport = { overallScore: number; overallBand: string; dimensions: AssessmentDimensionReport[]; strengths: string[]; focusAreas: string[]; reflectionPoints: string[]; importantContext: string[]; disclaimer: string };

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
    return buildDimensionReport(dimension, score);
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
    reflectionPoints: buildReflectionPoints(ordered),
    importantContext: [
      "This is a point-in-time self-report, shaped by your current role, environment, workload, confidence, and recent experiences.",
      "A lower signal is not a deficiency and a higher signal is not a permanent trait. Both are invitations to examine conditions, habits, and choices.",
      "Use the readout across contexts rather than as a label: compare how the capability appears when you are leading, learning, collaborating, and working under pressure.",
      "For professional decisions, pair this reflection with observed behavior, stakeholder feedback, role expectations, and evidence of outcomes.",
    ],
    disclaimer: "This educational self-assessment is a reflective development tool, not a clinical, psychological, employment, or medical diagnosis. Use the report as a starting point for conversation and action.",
  };
}

function buildDimensionReport(dimension: (typeof dimensions)[number], score: number): AssessmentDimensionReport {
  const band = score >= 80 ? "a reliable current strength" : score >= 60 ? "a capability with a workable foundation" : "a capability worth developing deliberately";
  return { ...dimension, score, readout: `${dimension.label} appears as ${band}. In practice, this signal describes how your current patterns may show up when priorities are ambiguous, expectations are changing, or other people depend on your judgment. Treat it as a useful hypothesis to test against real examples rather than a fixed description of who you are.`, reflectionPoints: [`Where does ${dimension.label.toLowerCase()} already help you create a better outcome?`, `What situation, relationship, or pressure condition makes this capability easier or harder to access?`, `What small behavior could you practice over the next two weeks and review with someone you trust?`] };
}

function buildReflectionPoints(ordered: AssessmentDimensionReport[]): string[] {
  const strongest = ordered[0];
  const development = ordered[ordered.length - 1];
  return [
    `Compound ${strongest.label.toLowerCase()} by making the underlying behavior visible and transferable to a new professional context.`,
    `Explore ${development.label.toLowerCase()} through one specific, observable practice rather than a broad intention.`,
    "Ask a trusted colleague, mentor, or manager what they notice when you are operating at your best and where your impact becomes less consistent.",
    "Revisit this report after a meaningful project, role transition, or period of deliberate practice and compare the evidence with the original signal.",
  ];
}

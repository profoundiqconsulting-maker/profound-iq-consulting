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

const dimensionReadouts: Record<string, string> = {
  clarity: "You define priorities clearly and make sense of competing demands with confidence, keeping the most important goal in view even when pressure mounts and priorities collide.",
  adaptability: "You learn, reframe, and respond readily when conditions change, treating shifts as information rather than disruption and adjusting your course without losing momentum.",
  leadership: "You take ownership consistently and create momentum for others, turning broad intentions into coordinated action that moves people and work forward together.",
  communication: "You listen deliberately, explain clearly, and navigate important conversations so others can act with confidence and without needing repeated clarification.",
  collaboration: "You build trust and contribute effectively across different perspectives, making partnership a force multiplier rather than a source of friction.",
  execution: "You translate intentions into focused, repeatable action, following through reliably on what you commit to and closing the loop on every commitment.",
  resilience: "You recover, regulate, and keep moving through pressure, staying constructive when a plan must change and protecting your effectiveness under load.",
  selfAwareness: "You notice your patterns, strengths, and growth edges clearly, using self-knowledge to guide your choices and correct course before issues compound.",
  influence: "You shape decisions, relationships, and outcomes thoughtfully, earning alignment without relying on formal authority and bringing others along willingly.",
  growth: "You actively seek feedback, practice, and meaningful development, treating every outcome as a chance to learn and every stretch as an investment.",
};

const dimensionReflectionPoints: Record<string, string[]> = {
  clarity: [
    "Which competing priority is stealing the focus that matters most right now?",
    "How do you decide what to say no to in order to protect your top goal?",
    "What does progress look like for your most important priority this week?",
  ],
  adaptability: [
    "When did you last change your mind based on new information?",
    "How do you respond when a plan you trusted stops working?",
    "What habit helps you stay effective amid constant change?",
  ],
  leadership: [
    "Which decision have you been avoiding that only you can make?",
    "How do you give feedback that changes behavior, not just feelings?",
    "Where are you creating momentum for others right now?",
  ],
  communication: [
    "Which conversation have you been postponing that needs to happen?",
    "How do you confirm others understood what you meant?",
    "What do you listen for that is not being said aloud?",
  ],
  collaboration: [
    "Whose success did you actively enable this month, and how?",
    "How do you repair trust when a partnership frays or stalls?",
    "What perspective do you seek out before making a call?",
  ],
  execution: [
    "What is the very next action you can take on your most important goal?",
    "Where do good intentions stall into inaction for you?",
    "How do you keep repeated actions aligned with long-term value?",
  ],
  resilience: [
    "How do you keep sound judgment when you are under pressure?",
    "Which setback taught you the most about recovering well?",
    "What helps you stay constructive when a plan must change?",
  ],
  selfAwareness: [
    "Which pattern of yours is supporting your progress right now?",
    "What feedback have you received that surprised you, and why?",
    "When do your strengths become liabilities, and how do you notice?",
  ],
  influence: [
    "Which decision did you shape without having formal authority?",
    "How do you align people with different interests toward one outcome?",
    "What standard do you hold yourself to when others are watching?",
  ],
  growth: [
    "What are you deliberately practicing to improve your impact?",
    "Whose feedback have you acted on recently, and what changed?",
    "How do you make time for development when delivery is urgent?",
  ],
};

const reliabilityFor = (score: number, index: number): number => {
  const spread = [0, 5, -3, 8, -6, 2, -4, 7, -2, 4][index % 10] ?? 0;
  return Math.max(0, Math.min(100, score + spread));
};

const roleLensContent: Record<RoleLens, RoleLensReadout> = {
  leadership: {
    label: "Leadership lens",
    context: "How you take ownership and create momentum for others.",
    priorities: [
      "Clarify decisions before directing effort.",
      "Give specific, behavior-based feedback weekly.",
      "Protect time for team development and coaching.",
    ],
    reflectionPoints: [
      "Describe a recent achievement where your direction changed the outcome.",
      "Which decision did you avoid that you should own?",
      "How do you develop the people who report to you?",
    ],
  },
  careerTransition: {
    label: "Career transition lens",
    context: "How your capability pattern maps to your next role.",
    priorities: [
      "Translate current strengths into the target role's language.",
      "Close the one capability gap that blocks your move.",
      "Build evidence through a small pilot project.",
    ],
    reflectionPoints: [
      "Which achievement best proves you can operate at the next level?",
      "What do you need to learn before the transition?",
      "Who can sponsor your move into the new role?",
    ],
  },
  teamDevelopment: {
    label: "Team development lens",
    context: "How you lift the capability of the people around you.",
    priorities: [
      "Set one clear growth goal per team member this quarter.",
      "Run a feedback-rich retrospective after each project.",
      "Delegate work that stretches someone's current scope.",
    ],
    reflectionPoints: [
      "Which team member grew most because of your input?",
      "What are you holding onto that someone else could own?",
      "How do you make feedback normal, not rare?",
    ],
  },
};

export function buildRoleLens(report: AssessmentReport, role: RoleLens): RoleLensReadout {
  const base = roleLensContent[role];
  return {
    label: base.label,
    context: base.context,
    priorities: report.executiveSummary?.priorities ?? base.priorities,
    reflectionPoints: base.reflectionPoints,
  };
}

export function compareReports(
  current: AssessmentReport,
  previous: AssessmentReport,
): {
  scoreDelta: number;
  dimensions: Array<{
    key: string;
    label: string;
    currentScore: number;
    previousScore: number;
    delta: number;
  }>;
} {
  const scoreDelta = current.overallScore - previous.overallScore;
  const dimensions = current.dimensions.map((dimension) => {
    const previousDimension = previous.dimensions.find(
      (item) => item.key === dimension.key,
    );
    const previousScore = previousDimension?.score ?? 0;
    return {
      key: dimension.key,
      label: dimension.label,
      currentScore: dimension.score,
      previousScore,
      delta: dimension.score - previousScore,
    };
  });
  return { scoreDelta, dimensions };
}

export function getDimensionReflectionPoints(
  dimension: AssessmentDimensionReport,
): string[] {
  return (
    dimensionReflectionPoints[dimension.key] ??
    dimension.reflectionPoints ??
    []
  );
}

export type AssessmentAnswer = { questionId: string; value: number };

export type AssessmentDimensionReport = {
  key: string;
  label: string;
  score: number;
  description: string;
  readout: string;
  reliability: number;
  reflectionPoints: string[];
};

export type AssessmentReport = {
  overallScore: number;
  overallBand: string;
  dimensions: AssessmentDimensionReport[];
  strengths: string[];
  focusAreas: string[];
  disclaimer: string;
  executiveSummary: {
    headline: string;
    overview: string;
    priorities: string[];
    discussionPrompts: string[];
  };
  reflectionPoints: string[];
  importantContext: string[];
};

export type RoleLens = "leadership" | "careerTransition" | "teamDevelopment";

export type RoleLensReadout = {
  label: string;
  context: string;
  priorities: string[];
  reflectionPoints: string[];
};

export const roleLensOptions: Array<{ value: RoleLens; label: string }> = [
  { value: "leadership", label: "Leadership" },
  { value: "careerTransition", label: "Career transition" },
  { value: "teamDevelopment", label: "Team development" },
];

export function buildReport(answers: AssessmentAnswer[]): AssessmentReport {
  const scoreByDimension = new Map<string, number[]>();
  for (const question of assessmentQuestions) {
    const answer = answers.find((item) => item.questionId === question.id);
    if (!answer) continue;
    const scores = scoreByDimension.get(question.dimension) ?? [];
    scores.push(Math.max(1, Math.min(5, answer.value)));
    scoreByDimension.set(question.dimension, scores);
  }

  const scoredDimensions = dimensions.map((dimension, index) => {
    const values = scoreByDimension.get(dimension.key) ?? [];
    const score = values.length ? Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 20) : 0;
    return {
      key: dimension.key,
      label: dimension.label,
      score,
      description: dimension.description,
      readout: dimensionReadouts[dimension.key],
      reliability: reliabilityFor(score, index),
      reflectionPoints: dimensionReflectionPoints[dimension.key],
    };
  });
  const overallScore = scoredDimensions.length ? Math.round(scoredDimensions.reduce((sum, item) => sum + item.score, 0) / scoredDimensions.length) : 0;
  const overallBand = overallScore >= 80 ? "Strong foundation" : overallScore >= 60 ? "Building momentum" : "Opportunity to grow";
  const ordered = [...scoredDimensions].sort((a, b) => b.score - a.score);
  const strengths = ordered.slice(0, 3).map((item) => item.label);
  const focusAreas = ordered.slice(-3).reverse().map((item) => item.label);
  const reportReflectionPoints = [
    "Which of your current habits most supports the capability you want to lead with?",
    "What is one decision you will make differently after reading this report?",
    "Which dimension matters most to your role right now, and why?",
    "Who will you share this report with to turn insight into action?",
  ];
  const importantContext = [
    "This is a point-in-time self-reflection, not a validated psychometric instrument.",
    "Scores reflect your own answers on the day you completed the assessment.",
    "Use results to inform professional decisions, not to replace clinical or formal evaluation.",
    "Share this report with a coach or manager to turn insight into action.",
  ];
  const executiveSummary = {
    headline: `${overallScore}/100 · ${overallBand}`,
    overview: "Use this report as a professional development conversation starter, pairing the signal with observed behavior, context, feedback, and outcomes.",
    priorities: focusAreas.slice(0, 3),
    discussionPrompts: reportReflectionPoints,
  };
  return {
    overallScore,
    overallBand,
    dimensions: scoredDimensions,
    strengths,
    focusAreas,
    disclaimer: "This educational self-assessment is a reflective development tool, not a clinical, psychological, employment, or medical diagnosis. Use the report as a starting point for conversation and action.",
    executiveSummary,
    reflectionPoints: reportReflectionPoints,
    importantContext,
  };
}

export function getDimensionReflectionPoints(dimension: string): string[] { return []; }
export function buildRoleLens(...args: any[]): any { return {}; }
export function compareReports(...args: any[]): any { return {}; }

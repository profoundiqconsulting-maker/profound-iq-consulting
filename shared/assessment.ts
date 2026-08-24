export const ASSESSMENT_PRICE_KES = 20;

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
export type ExecutiveSummary = { headline: string; overview: string; priorities: string[]; discussionPrompts: string[] };
export type AssessmentReport = { overallScore: number; overallBand: string; dimensions: AssessmentDimensionReport[]; strengths: string[]; focusAreas: string[]; reflectionPoints: string[]; importantContext: string[]; disclaimer: string; executiveSummary: ExecutiveSummary };
export type RoleLens = "leadership" | "careerTransition" | "teamDevelopment";
export type RoleLensReadout = { key: RoleLens; label: string; context: string; priorities: string[]; reflectionPoints: string[] };
export type AssessmentComparison = { currentScore: number; previousScore: number; scoreDelta: number; dimensions: Array<{ key: string; label: string; currentScore: number; previousScore: number; delta: number }> };
export const roleLensOptions: Array<{ key: RoleLens; label: string; description: string }> = [
  { key: "leadership", label: "Leadership", description: "Translate capability signals into decisions, direction, and influence." },
  { key: "careerTransition", label: "Career transition", description: "Navigate a new role, industry, or level of responsibility." },
  { key: "teamDevelopment", label: "Team development", description: "Turn individual patterns into healthier collaboration and shared performance." },
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
    executiveSummary: buildExecutiveSummary(overallScore, overallBand, ordered),
    importantContext: [
      "This is a point-in-time self-report, shaped by your current role, environment, workload, confidence, and recent experiences.",
      "A lower signal is not a deficiency and a higher signal is not a permanent trait. Both are invitations to examine conditions, habits, and choices.",
      "Use the readout across contexts rather than as a label: compare how the capability appears when you are leading, learning, collaborating, and working under pressure.",
      "For professional decisions, pair this reflection with observed behavior, stakeholder feedback, role expectations, and evidence of outcomes.",
    ],
    disclaimer: "This educational self-assessment is a reflective development tool, not a clinical, psychological, employment, or medical diagnosis. Use the report as a starting point for conversation and action.",
  };
}

function buildExecutiveSummary(score: number, band: string, ordered: AssessmentDimensionReport[]): ExecutiveSummary {
  const strongest = ordered[0]?.label ?? "your strongest capability";
  const focus = ordered[ordered.length - 1]?.label ?? "your next development priority";
  return { headline: `${band}: a practical view of your current capability pattern`, overview: `Your overall signal is ${score} out of 100. The clearest current strength is ${strongest}, while ${focus} offers a useful place to focus attention. For managers and coaches, this report is most valuable when paired with examples of behavior, context, and outcomes.`, priorities: [`Name the behavior behind ${strongest} and identify where it creates measurable value.`, `Choose one observable practice related to ${focus} for the next review or coaching cycle.`, "Agree on the conditions, support, and feedback that will make progress more likely."], discussionPrompts: ["What should we keep doing because it is already creating value?", "Where does the current environment make this capability easier or harder to use?", "What evidence will we review next time to understand progress?"] };
}

export function buildRoleLens(report: AssessmentReport, key: RoleLens): RoleLensReadout {
  const focus = report.focusAreas.slice(0, 2).map((item) => item.toLowerCase());
  const strongest = report.strengths[0]?.toLowerCase() ?? "your strongest capability";
  const lenses: Record<RoleLens, Omit<RoleLensReadout, "key">> = {
    leadership: { label: "Leadership lens", context: `Use this lens to examine how ${strongest} can create clarity and momentum for others, while deliberately developing ${focus.join(" and ")}.`, priorities: ["Set a visible direction and explain the decision logic behind it.", "Invite dissent and feedback before converting influence into commitment.", "Match accountability with the support, context, and authority people need to act."], reflectionPoints: ["Where do people experience your leadership most clearly today?", "What decision or conversation would benefit from more deliberate clarity?", "What evidence would show that your leadership is improving outcomes for others?"] },
    careerTransition: { label: "Career transition lens", context: `Use this lens to translate ${strongest} into a credible professional story while treating ${focus.join(" and ")} as development priorities for the next role.`, priorities: ["Identify the transferable behaviors behind your strongest signals.", "Choose a stretch assignment that creates evidence for the capability your next context requires.", "Ask for specific feedback from someone who understands the destination role or environment."], reflectionPoints: ["Which current achievement demonstrates your strongest capability in observable terms?", "What will be different about how you need to work in the next context?", "What experiment could reduce uncertainty before a larger career decision?"] },
    teamDevelopment: { label: "Team development lens", context: `Use this lens to consider how your individual patterns affect trust, coordination, and shared execution, especially around ${focus.join(" and ")}.`, priorities: ["Make working agreements explicit so different strengths can contribute without guesswork.", "Create regular moments for feedback, repair, and learning after delivery.", "Separate a person’s value from a behavior that the team can practice and improve."], reflectionPoints: ["What does your team reliably receive from you at your best?", "Which pattern might others experience differently from your intention?", "What shared practice would make collaboration easier over the next month?"] },
  };
  return { key, ...lenses[key] };
}

export function compareReports(current: AssessmentReport, previous: AssessmentReport): AssessmentComparison {
  return { currentScore: current.overallScore, previousScore: previous.overallScore, scoreDelta: current.overallScore - previous.overallScore, dimensions: current.dimensions.map((dimension) => { const prior = previous.dimensions.find((item) => item.key === dimension.key); const previousScore = prior?.score ?? 0; return { key: dimension.key, label: dimension.label, currentScore: dimension.score, previousScore, delta: dimension.score - previousScore }; }) };
}

const reflectionPromptLibrary: Record<string, string[]> = {
  clarity: [
    "Which competing priority is currently consuming attention, and what decision would create the most useful focus?",
    "Where could you make your decision logic more visible so colleagues understand what matters, what can wait, and why?",
    "What one outcome will you protect over the next two weeks, and what will you deliberately stop, defer, or delegate to support it?",
  ],
  adaptability: [
    "What assumption about your current situation may no longer be reliable, and what evidence would help you update it?",
    "When plans change, which part of your response is most useful to preserve and which habit would you like to interrupt?",
    "What small experiment could help you learn faster before committing to a larger change in direction?",
  ],
  leadership: [
    "Where do people need more direction, context, or permission from you in order to move with confidence?",
    "Which recent decision shows how you balance ownership with the involvement and development of others?",
    "What leadership behavior will you make observable in your next meeting, project, or difficult conversation?",
  ],
  communication: [
    "Which message or conversation would benefit from a clearer purpose, audience, or request?",
    "What might another person be hearing differently from what you intend, and how could you check before assuming alignment?",
    "What listening behavior will you practice in one important conversation, and what evidence will tell you it helped?",
  ],
  collaboration: [
    "Which perspective is least represented in a current decision, and how could you invite it without slowing useful progress?",
    "What does your team reliably receive from you when collaboration is working well, and where is that contribution most valuable?",
    "What working agreement, feedback ritual, or handoff could make shared execution easier over the next month?",
  ],
  execution: [
    "Which intention has remained broad or unfinished, and what is the smallest observable next action that would move it forward?",
    "Where does your current workflow create avoidable friction, rework, or delay?",
    "What repeatable planning or review habit will you use to protect progress when demands compete?",
  ],
  resilience: [
    "Which pressure condition most affects the quality of your judgment, and what early signal tells you it is building?",
    "What helps you recover constructively after a setback, and where could you ask for support sooner?",
    "What boundary, reset practice, or recovery rhythm would help you sustain performance without relying on urgency?",
  ],
  selfAwareness: [
    "Which pattern in your behavior becomes clearer when you compare your intention with the impact others experience?",
    "What feedback have you been explaining away, and what might become possible if you treated it as useful data?",
    "Which strength can become a liability under pressure, and what cue will help you use it more deliberately?",
  ],
  influence: [
    "Where are you trying to shape an outcome, and have you understood what matters to the people whose support is required?",
    "How could you strengthen your case with clearer evidence, timing, or connection to shared priorities rather than more force?",
    "What influence move will you test next: a better question, an earlier conversation, a clearer trade-off, or a more credible example?",
  ],
  growth: [
    "What capability would create the greatest increase in your impact if you practiced it consistently this quarter?",
    "Which feedback, stretch assignment, or learning resource would give you the most useful evidence about your next development edge?",
    "How will you turn learning into behavior, and when will you review whether the change is visible in your work?",
  ],
};

export function getDimensionReflectionPoints(dimension: Pick<AssessmentDimensionReport, "key" | "label" | "reflectionPoints">): string[] {
  const existing = Array.isArray(dimension.reflectionPoints) ? dimension.reflectionPoints.filter((point) => typeof point === "string" && point.trim().length > 0) : [];
  if (existing.length > 0) return existing;
  const prompts = reflectionPromptLibrary[dimension.key];
  if (prompts?.length) return prompts;
  const label = dimension.label.toLowerCase();
  return [`Where does ${label} already help you create a better outcome, and what observable evidence supports that view?`, `Which situation, relationship, or pressure condition makes ${label} easier or harder for you to access?`, `What small behavior related to ${label} will you practice over the next two weeks and review with someone you trust?`];
}

function buildDimensionReport(dimension: (typeof dimensions)[number], score: number): AssessmentDimensionReport {
  const band = score >= 80 ? "a reliable current strength" : score >= 60 ? "a capability with a workable foundation" : "a capability worth developing deliberately";
  return { ...dimension, score, readout: `${dimension.label} appears as ${band}. In practice, this signal describes how your current patterns may show up when priorities are ambiguous, expectations are changing, or other people depend on your judgment. Treat it as a useful hypothesis to test against real examples rather than a fixed description of who you are.`, reflectionPoints: getDimensionReflectionPoints({ key: dimension.key, label: dimension.label, reflectionPoints: [] }) };
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

export type GeneratedCopy = {
  report: string;
  assessmentReport: string;
  careerPathReport: string;
  scoreSummary: string;
  executiveSummary: string;
  dimensionReadout: string;
  reflectionPrompts: string;
  reflectionStartingPoints: string;
  strengthsToCompound: string;
  focusAreasToExplore: string;
  practicalReflection: string;
  importantContext: string;
  pathwaySignal: string;
  primaryRelativeFit: string;
  subPathwayScores: string;
  pathwayComparison: string;
  explorationPlan: string;
  overallScore: string;
  generated: string;
  issued: string;
  certificateOfCompletion: string;
  credential: string;
  verifyCredential: string;
  paymentReceipt: string;
  transactionReference: string;
  amountPaid: string;
  paidOn: string;
  learner: string;
  course: string;
  congratulations: string;
  certificateAttached: string;
  availableInDashboard: string;
  hello: string;
  regards: string;
  onlineGlobalReach: string;
};

const english: GeneratedCopy = {
  report: "Report",
  assessmentReport: "Assessment report",
  careerPathReport: "CareerPath report",
  scoreSummary: "Assessment score summary",
  executiveSummary: "Executive summary",
  dimensionReadout: "Dimension readout",
  reflectionPrompts: "Reflection prompts",
  reflectionStartingPoints: "Reflection starting points",
  strengthsToCompound: "Strengths to compound",
  focusAreasToExplore: "Focus areas to explore",
  practicalReflection: "Practical reflection",
  importantContext: "Important context",
  pathwaySignal: "Pathway signal",
  primaryRelativeFit: "primary relative fit / 100",
  subPathwayScores: "Sub-pathway scores",
  pathwayComparison: "Pathway comparison",
  explorationPlan: "Exploration plan",
  overallScore: "overall score / 100",
  generated: "Generated",
  issued: "Issued",
  certificateOfCompletion: "Certificate of completion",
  credential: "Credential",
  verifyCredential: "Verify this credential",
  paymentReceipt: "Payment receipt",
  transactionReference: "Transaction reference",
  amountPaid: "Amount paid",
  paidOn: "Paid on",
  learner: "Respondent",
  course: "Course",
  congratulations: "Congratulations",
  certificateAttached: "Your professional certificate is attached.",
  availableInDashboard: "It will remain available in your learner dashboard.",
  hello: "Hello",
  regards: "With regards",
  onlineGlobalReach: "Online · global reach",
};

export function getGeneratedCopy(): GeneratedCopy {
  return english;
}

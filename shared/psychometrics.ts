export const PSYCHOMETRIC_PRICE_KES = 699;

export type PsychometricResponseScale = "likert5" | "multipleChoice";
export type PsychometricQuestion = {
  id: string;
  testSlug: string;
  domainKey: string;
  domainLabel: string;
  prompt: string;
  options: string[];
  correctOptionIndex?: number;
  responseScale: PsychometricResponseScale;
  difficulty?: "easy" | "moderate" | "challenging";
  application: string;
};
export type PsychometricDomain = {
  key: string;
  label: string;
  description: string;
  itemCount: number;
};
export type PsychometricTest = {
  slug: string;
  title: string;
  shortTitle: string;
  strapline: string;
  purpose: string;
  coreQuestion: string;
  audience: string;
  estimatedMinutes: string;
  responseScale: PsychometricResponseScale;
  domains: PsychometricDomain[];
  reportSections: string[];
  disclaimer: string;
  questions: PsychometricQuestion[];
};
export type PsychometricAnswer = { questionId: string; value: number };
export type PsychometricDomainResult = PsychometricDomain & {
  score: number;
  reliability: number;
  band: string;
  readout: string;
  developmentActions: string[];
};
export type PsychometricReport = {
  testSlug: string;
  title: string;
  overallScore: number;
  overallBand: string;
  domains: PsychometricDomainResult[];
  strengths: string[];
  developmentPriorities: string[];
  recommendations: string[];
  disclaimer: string;
};

const disclaimer =
  "This educational psychometric profile is intended for development, career exploration, coaching, and learning conversations. It is not a clinical diagnosis, a fixed personality label, or a standalone basis for employment, admission, promotion, or other high-stakes decisions. Interpretation should be combined with observed behaviour, context, relevant evidence, and qualified professional guidance.";
const likertOptions = [
  "Strongly disagree",
  "Disagree",
  "Neither agree nor disagree",
  "Agree",
  "Strongly agree",
];
const templates = [
  "I can use {label} when priorities compete and circumstances change.",
  "I notice how {label} affects the quality of my everyday decisions.",
  "I am willing to practise {label} even when the first attempt is uncomfortable.",
  "People who work with me would recognise {label} in my actions.",
  "I ask for feedback that helps me improve {label}.",
  "I can explain an example of {label} from study, work, family, or community life.",
  "When pressure increases, I use a deliberate strategy to maintain {label}.",
  "I can adapt my approach to use {label} with different people and situations.",
  "I understand the conditions that make {label} easier or harder for me.",
  "I turn an intention related to {label} into a small, observable action.",
  "I reflect on the consequences of using or neglecting {label}.",
  "I can identify one practical next step to strengthen {label}.",
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
function buildLikertQuestions(
  testSlug: string,
  domains: PsychometricDomain[]
): PsychometricQuestion[] {
  return domains.flatMap(domain =>
    Array.from({ length: domain.itemCount }, (_, index) => {
      const template = templates[index % templates.length];
      const context =
        index >= templates.length ? ` in a new situation or relationship` : "";
      return {
        id: `psy-${testSlug}-${domain.key}-${index + 1}`,
        testSlug,
        domainKey: domain.key,
        domainLabel: domain.label,
        prompt: template.replace(
          "{label}",
          `${domain.label.toLowerCase()}${context}`
        ),
        options: likertOptions,
        responseScale: "likert5" as const,
        application: `Apply ${domain.label.toLowerCase()} in one decision, conversation, routine, or project this week.`,
      };
    })
  );
}
function buildCognitiveQuestions(
  testSlug: string,
  domains: PsychometricDomain[]
): PsychometricQuestion[] {
  type Stem = [string, string[], number];
  const numericalStems: Stem[] = [
    [
      "A project budget is KES 80,000 and 15% is reserved for training. How much is reserved?",
      ["KES 8,000", "KES 12,000", "KES 15,000", "KES 68,000"],
      1,
    ],
    [
      "A report states that attendance rose from 40 to 50 participants. What is the percentage increase?",
      ["10%", "20%", "25%", "40%"],
      2,
    ],
    [
      "If a team completes 60% of a task in 3 hours, how many more hours to finish at the same rate?",
      ["1.5", "2.0", "2.5", "3.0"],
      1,
    ],
    [
      "Revenue grew from KES 2.4M to KES 3.0M. What is the growth rate?",
      ["15%", "20%", "25%", "30%"],
      2,
    ],
    [
      "A dataset has 120 entries. After removing 25% as outliers, how many remain?",
      ["80", "90", "95", "100"],
      1,
    ],
    [
      "Production costs are KES 450/unit at 1,000 units. At 1,500 units, cost drops 12%. New cost?",
      ["KES 396", "KES 380", "KES 375", "KES 360"],
      0,
    ],
    [
      "A survey of 400 people shows 62% preference. What is the margin of error (approx, 95% CI)?",
      ["±3%", "±5%", "±7%", "±10%"],
      1,
    ],
    [
      "Investment of KES 500,000 earns 8% compound annually. Value after 3 years?",
      ["KES 629,856", "KES 620,000", "KES 640,000", "KES 600,000"],
      0,
    ],
    [
      "A process has 4% defect rate. In a batch of 2,500, how many defects expected?",
      ["80", "100", "120", "150"],
      1,
    ],
    [
      "Quarterly sales: Q1=120, Q2=150, Q3=180, Q4=210. Average quarterly growth?",
      ["20%", "25%", "30%", "15%"],
      0,
    ],
    [
      "If 3 workers take 8 hours to complete a task, how long for 6 workers (assuming linear)?",
      ["2 hours", "4 hours", "5 hours", "6 hours"],
      1,
    ],
    [
      "A price increased by 20% then decreased by 20%. Net change?",
      ["-4%", "0%", "+4%", "-2%"],
      0,
    ],
    [
      "Break-even: fixed costs KES 200K, variable cost KES 50/unit, price KES 120/unit. Units needed?",
      ["2,500", "2,857", "3,000", "4,000"],
      1,
    ],
    [
      "Customer lifetime value: avg purchase KES 5,000, frequency 4/year, retention 3 years. CLV?",
      ["KES 40,000", "KES 50,000", "KES 60,000", "KES 75,000"],
      2,
    ],
    [
      "Net promoter score: 60% promoters, 25% passives, 15% detractors. NPS?",
      ["35", "40", "45", "50"],
      2,
    ],
    [
      "A/B test: variant A 12% conversion (n=500), variant B 15% (n=500). Significant difference?",
      ["Yes, p<0.05", "No, p>0.05", "Need more data", "Cannot determine"],
      0,
    ],
    [
      "Correlation between training hours and performance is r=0.7. What % variance explained?",
      ["49%", "70%", "30%", "51%"],
      0,
    ],
    [
      "Inventory turnover: COGS KES 1.2M, avg inventory KES 200K. Turns per year?",
      ["4", "5", "6", "8"],
      2,
    ],
    [
      "Project ROI: cost KES 300K, benefit KES 420K over 2 years. Annual ROI?",
      ["15%", "20%", "25%", "30%"],
      1,
    ],
    [
      "Standard deviation of [10, 12, 14, 16, 18]?",
      ["2.0", "2.8", "3.2", "4.0"],
      1,
    ],
    [
      "If probability of A is 0.3, B is 0.5, and A&B independent, P(A or B)?",
      ["0.65", "0.75", "0.80", "0.85"],
      0,
    ],
    [
      "Weighted average: 40% weight score 85, 60% weight score 92. Result?",
      ["88.2", "89.0", "89.8", "90.5"],
      0,
    ],
    [
      "A loan of KES 1M at 12% for 5 years, annual payment?",
      ["KES 277,410", "KES 250,000", "KES 300,000", "KES 225,000"],
      0,
    ],
    [
      "Price elasticity: 10% price increase causes 15% demand drop. Elasticity?",
      ["-0.67", "-1.0", "-1.5", "-2.0"],
      2,
    ],
    [
      "Sample size needed for 95% CI ±3% with 50% proportion estimate?",
      ["~1,067", "~600", "~385", "~1,500"],
      0,
    ],
    [
      "Two assets: A returns 8% (σ=12%), B returns 12% (σ=20%), ρ=0.3. Portfolio 50/50 return?",
      ["10%", "9%", "11%", "8%"],
      0,
    ],
    [
      "Present value: KES 100K/year for 5 years at 10% discount. PV?",
      ["KES 379,079", "KES 400,000", "KES 350,000", "KES 420,000"],
      0,
    ],
    [
      "A process produces 2% defects. Sample of 50, probability of 0 defects?",
      ["0.36", "0.45", "0.55", "0.28"],
      0,
    ],
    [
      "Regression: y = 50 + 3x. Predict y when x = 15.",
      ["95", "90", "85", "100"],
      0,
    ],
    [
      "Annuity: KES 10K/month for 10 years at 6% annual. Future value?",
      ["KES 1.64M", "KES 1.58M", "KES 1.72M", "KES 1.48M"],
      0,
    ],
    [
      "Coefficient of variation: mean=80, sd=12. CV?",
      ["15%", "12%", "18%", "10%"],
      0,
    ],
  ];
  const verbalStems: Stem[] = [
    [
      "Passage: A team tested two approaches, measured both outcomes, and selected the approach with stronger evidence. Which principle is shown?",
      [
        "Evidence-based comparison",
        "Personal preference",
        "Avoidance of measurement",
        "Immediate agreement",
      ],
      0,
    ],
    [
      "The manager's directive was clear, yet the team interpreted it differently. What communication principle explains this?",
      [
        "Encoding/decoding variance",
        "Information overload",
        "Semantic noise",
        "Feedback delay",
      ],
      0,
    ],
    [
      "Choose the word that best completes: 'The proposal was ____; it addressed every concern raised.'",
      ["comprehensive", "comprehensible", "compressing", "compromising"],
      0,
    ],
    [
      "Which sentence uses 'affect' correctly?",
      [
        "The change will affect outcomes.",
        "The affect of the change was large.",
        "He showed little affect.",
        "Affect the results positively.",
      ],
      0,
    ],
    [
      "Passage: 'Despite initial resistance, the policy gained acceptance after stakeholders saw measurable benefits.' Inference?",
      [
        "Evidence overcame skepticism.",
        "Resistance was irrational.",
        "Policy was poorly designed.",
        "Stakeholders were misled.",
      ],
      0,
    ],
    [
      "Analogous pair: STRATEGY : TACTICS :: ?",
      [
        "ARCHITECTURE : CONSTRUCTION",
        "PLANNING : EXECUTION",
        "THEORY : PRACTICE",
        "GOAL : ACTION",
      ],
      0,
    ],
    [
      "Which phrase is grammatically correct?",
      [
        "Between you and me",
        "Between you and I",
        "Between me and you",
        "Between I and you",
      ],
      0,
    ],
    [
      "Passage: 'The report concludes that remote work increases productivity for knowledge workers but decreases it for collaborative tasks.' Best summary?",
      [
        "Remote work has mixed effects on productivity.",
        "Remote work always increases productivity.",
        "Collaborative tasks suffer in remote settings.",
        "Knowledge workers prefer remote work.",
      ],
      0,
    ],
    [
      "Choose the correct word: 'The committee will ____ the proposal next week.'",
      ["review", "reveiw", "revue", "revuew"],
      0,
    ],
    [
      "What is the antecedent of 'they' in: 'When managers listen to employees, they feel valued.'?",
      ["Ambiguous (managers or employees)", "Managers", "Employees", "Both"],
      0,
    ],
    [
      "Passage: 'Critical thinking requires evaluating evidence, identifying assumptions, and drawing reasoned conclusions.' Which is NOT a component?",
      [
        "Memorizing facts",
        "Evaluating evidence",
        "Identifying assumptions",
        "Drawing conclusions",
      ],
      0,
    ],
    [
      "Which sentence is written in active voice?",
      [
        "The team completed the project.",
        "The project was completed by the team.",
        "The project had been completed.",
        "The project is being completed.",
      ],
      0,
    ],
    [
      "Select the word meaning 'to make worse':",
      ["Exacerbate", "Exonerate", "Exemplify", "Exonerate"],
      0,
    ],
    [
      "Passage: 'Policy X reduced errors by 30% but increased processing time by 15%. Management accepted the trade-off.' Implication?",
      [
        "Quality prioritized over speed",
        "Speed prioritized over quality",
        "Neither improved",
        "Both improved",
      ],
      0,
    ],
    [
      "Which correctly uses 'who' vs 'whom'?",
      [
        "Who did you give the report to?",
        "To whom did you give the report?",
        "Whom gave you the report?",
        "Who gave the report to whom?",
      ],
      1,
    ],
    [
      "Passage: 'The metaphor of 'organizational DNA' suggests culture is inherited and stable.' Counter-argument?",
      [
        "Culture evolves through interaction.",
        "DNA never changes.",
        "Metaphors are literal.",
        "Organizations don't have DNA.",
      ],
      0,
    ],
    [
      "Choose the correctly punctuated sentence:",
      [
        "However, the results were inconclusive.",
        "However the results were inconclusive.",
        "However; the results were inconclusive.",
        "However. The results were inconclusive.",
      ],
      0,
    ],
    [
      "Passage: 'Stakeholders demanded transparency; leadership provided summaries, not raw data.' Issue?",
      [
        "Partial disclosure",
        "Full transparency",
        "Excessive detail",
        "No communication",
      ],
      0,
    ],
    [
      "What is the main clause in: 'Although the budget was tight, the project launched on schedule.'?",
      [
        "the project launched on schedule",
        "Although the budget was tight",
        "the budget was tight",
        "on schedule",
      ],
      0,
    ],
    [
      "Which word is a synonym for 'ubiquitous'?",
      ["Omnipresent", "Rare", "Unique", "Temporary"],
      0,
    ],
    [
      "Passage: 'Decision fatigue degrades choice quality after prolonged deliberation.' Practical implication?",
      [
        "Schedule important decisions earlier.",
        "Avoid making decisions.",
        "Deliberate longer.",
        "Delegate all decisions.",
      ],
      0,
    ],
    [
      "Select the correct plural:",
      ["Criteria", "Criterias", "Criterium", "Criteriums"],
      0,
    ],
    [
      "Passage: 'The executive summary must synthesize, not merely summarize.' Difference?",
      [
        "Synthesis integrates insights; summary lists points.",
        "They are identical.",
        "Summary is shorter.",
        "Synthesis is longer.",
      ],
      0,
    ],
    [
      "Which sentence avoids a dangling modifier?",
      [
        "After reviewing the data, the team drew conclusions.",
        "After reviewing the data, conclusions were drawn.",
        "Reviewing the data, conclusions emerged.",
        "The data was reviewed, conclusions drawn.",
      ],
      0,
    ],
    [
      "Passage: 'Correlation does not imply causation, but it guides hypothesis generation.' Logical status?",
      [
        "Necessary but insufficient for causation",
        "Sufficient for causation",
        "Irrelevant to causation",
        "Proof of causation",
      ],
      0,
    ],
    [
      "Choose the word: 'The ____ of the argument was compelling.'",
      ["thrust", "thirst", "thresh", "thrash"],
      0,
    ],
    [
      "Passage: 'Ambiguity in requirements leads to scope creep and rework.' Prevention?",
      [
        "Precise specification",
        "Frequent changes",
        "Minimal documentation",
        "Assumption-based planning",
      ],
      0,
    ],
  ];
  const abstractStems: Stem[] = [
    [
      "Sequence: 3, 6, 12, 24, ... What comes next?",
      ["27", "36", "48", "60"],
      2,
    ],
    ["Pattern: △ ○ □ △ ○ □ △ ○ ?", ["△", "○", "□", "◇"], 1],
    ["Sequence: 2, 5, 11, 23, 47, ... Next?", ["95", "94", "96", "93"], 0],
    [
      "Which figure completes the matrix? [2×2 grid: top row has circle, square; bottom row has triangle, ?]",
      ["Circle", "Square", "Triangle", "Hexagon"],
      2,
    ],
    ["Sequence: 1, 4, 9, 16, 25, ... Next?", ["36", "30", "40", "35"], 0],
    [
      "Analogy: NOISE : SILENCE :: LIGHT : ?",
      ["BRIGHTNESS", "DARKNESS", "COLOR", "SHADOW"],
      1,
    ],
    [
      "Which shape does not belong? [Circle, Sphere, Cube, Cylinder]",
      ["Circle", "Sphere", "Cube", "Cylinder"],
      0,
    ],
    ["Sequence: A, C, F, J, O, ... Next?", ["U", "T", "V", "S"], 0],
    [
      "Pattern: 1, 1, 2, 3, 5, 8, 13, ... Next? (Fibonacci)",
      ["21", "19", "20", "22"],
      0,
    ],
    ["Matrix: [▲ ● ■; ■ ▲ ●; ● ■ ?] What completes?", ["▲", "●", "■", "◆"], 0],
    [
      "Sequence: 100, 50, 25, 12.5, ... Next?",
      ["6.25", "7.5", "5", "3.125"],
      0,
    ],
    ["Odd one out: 16, 25, 36, 48, 64", ["16", "25", "36", "48", "64"], 3],
    ["Pattern: Z, X, V, T, R, ... Next?", ["P", "Q", "O", "S"], 0],
    ["Sequence: 2, 6, 18, 54, ... Next?", ["162", "108", "126", "144"], 0],
    [
      "Visual analogy: [□→■] [○→?] Options: [●, ◇, ◆, ■]",
      ["●", "◇", "◆", "■"],
      0,
    ],
    ["Sequence: 5, 10, 17, 26, 37, ... Next?", ["50", "48", "52", "49"], 0],
    [
      "Which completes the series: 1/2, 2/3, 3/4, 4/5, ?",
      ["5/6", "6/7", "4/6", "5/7"],
      0,
    ],
    ["Pattern: 3, 8, 15, 24, 35, ... Next?", ["48", "47", "46", "49"], 0],
    ["Matrix rotation: [← ↑ →; ↓ ← ↑; → ↓ ?] Next?", ["←", "→", "↑", "↓"], 0],
    [
      "Sequence: 1, 8, 27, 64, 125, ... Next? (Cubes)",
      ["216", "196", "225", "243"],
      0,
    ],
    [
      "Odd one out: 121, 144, 169, 190, 225",
      ["121", "144", "169", "190", "225"],
      3,
    ],
    ["Pattern: A1, B3, C5, D7, E9, ... Next?", ["F11", "G11", "F10", "G10"], 0],
    [
      "Sequence: 2, 3, 5, 7, 11, 13, 17, ... Next? (Primes)",
      ["19", "21", "23", "20"],
      0,
    ],
    ["Visual pattern: [◐ ◑ ◒ ◓] Next?", ["◐", "◑", "◒", "◓"], 0],
    [
      "Sequence: 1, 3, 7, 15, 31, ... Next? (2^n - 1)",
      ["63", "61", "65", "59"],
      0,
    ],
    [
      "Which figure has rotational symmetry of order 4? [Square, Equilateral triangle, Rectangle, Pentagon]",
      ["Square", "Equilateral triangle", "Rectangle", "Pentagon"],
      0,
    ],
    [
      "Sequence: 10, 11, 13, 16, 20, 25, ... Next?",
      ["31", "30", "32", "29"],
      0,
    ],
    [
      "Pattern: 2, 4, 8, 16, 32, ... Next power of 2?",
      ["64", "48", "56", "72"],
      0,
    ],
    [
      "Complete: 1, 4, 27, 256, 3125, ... (n^n) Next?",
      ["46656", "36000", "42000", "50000"],
      0,
    ],
    ["Matrix: [★ ☆ ♢; ♢ ★ ☆; ☆ ♢ ?] Next?", ["★", "☆", "♢", "♥"], 0],
    [
      "Sequence: 1, 2, 6, 24, 120, ... Next? (Factorials)",
      ["720", "600", "840", "504"],
      0,
    ],
    [
      "Which number is not a perfect square? [144, 169, 196, 220, 225]",
      ["144", "169", "196", "220", "225"],
      3,
    ],
  ];
  const logicalStems: Stem[] = [
    [
      "If every A is B and no B is C, which conclusion must follow?",
      ["Some A are C", "No A is C", "Every C is A", "Some B are not A"],
      1,
    ],
    [
      "A plan fails because its key assumption is false. What is the most useful next step?",
      [
        "Hide the result",
        "Test and revise the assumption",
        "Repeat without changes",
        "Blame the last person involved",
      ],
      1,
    ],
    [
      "Premise: All managers are leaders. Some leaders are innovators. Conclusion: Some managers are innovators. Valid?",
      ["Yes", "No", "Cannot determine", "Only if all leaders are managers"],
      2,
    ],
    [
      "If P implies Q, and Q is false, what follows about P?",
      ["P is true", "P is false", "P could be either", "No conclusion"],
      1,
    ],
    [
      "Either the system is secure or the data is compromised. The system is not secure. Therefore?",
      [
        "The data is compromised",
        "The data is safe",
        "Cannot conclude",
        "Both are true",
      ],
      0,
    ],
    [
      "All effective teams communicate well. Team X does not communicate well. Therefore?",
      [
        "Team X is not effective",
        "Team X is effective",
        "Team X might be effective",
        "Communication is irrelevant",
      ],
      0,
    ],
    [
      "No successful project lacks clear goals. Project Y has clear goals. Therefore?",
      [
        "Project Y is successful",
        "Project Y might fail",
        "Project Y lacks goals",
        "No conclusion about success",
      ],
      1,
    ],
    [
      "If we invest in training, productivity increases. Productivity did not increase. Therefore?",
      [
        "We did not invest in training",
        "We invested in training",
        "Training is ineffective",
        "Cannot conclude",
      ],
      0,
    ],
    [
      "Some risks are worth taking. All innovations involve risk. Therefore?",
      [
        "Some innovations are worth pursuing",
        "All innovations are worth pursuing",
        "No innovations are worth pursuing",
        "Cannot conclude",
      ],
      0,
    ],
    [
      "Every decision has a cost. Doing nothing is a decision. Therefore?",
      [
        "Doing nothing has a cost",
        "Doing nothing is free",
        "Costs can be avoided",
        "Decisions should be avoided",
      ],
      0,
    ],
    [
      "Premise: If it rains, the ground is wet. The ground is wet. Does it follow that it rained?",
      ["Yes", "No", "Maybe", "Only if no other cause"],
      1,
    ],
    [
      "All A are B. Some B are C. No C are D. What follows?",
      ["Some A are not D", "Some A are D", "No A are D", "Cannot determine"],
      0,
    ],
    [
      "If the strategy works, we meet targets. We met targets. Does the strategy work?",
      ["Yes", "No", "Not necessarily", "Only if no other factor"],
      2,
    ],
    [
      "No ethical action harms innocents. Action X harms innocents. Therefore?",
      [
        "Action X is not ethical",
        "Action X is ethical",
        "Ethics are subjective",
        "Cannot judge",
      ],
      0,
    ],
    [
      "Some data is incomplete. All incomplete data is unreliable. Therefore?",
      [
        "Some data is unreliable",
        "All data is unreliable",
        "No data is unreliable",
        "Incomplete data is reliable",
      ],
      0,
    ],
    [
      "If we hire, we must train. We cannot train now. Therefore?",
      [
        "We cannot hire now",
        "We must hire anyway",
        "Training is optional",
        "Hiring is optional",
      ],
      0,
    ],
    [
      "Either we cut costs or we increase revenue. We will not cut costs. Therefore?",
      [
        "We must increase revenue",
        "We can do neither",
        "We can do both",
        "Revenue will increase automatically",
      ],
      0,
    ],
    [
      "All experts have experience. Some experienced people are not experts. Therefore?",
      [
        "Experience is necessary but not sufficient for expertise",
        "Experience is sufficient",
        "Experience is irrelevant",
        "All experienced are experts",
      ],
      0,
    ],
    [
      "If the report is accurate, the forecast holds. The forecast failed. Therefore?",
      [
        "The report was inaccurate",
        "The report was accurate",
        "The forecast was wrong",
        "Cannot conclude",
      ],
      0,
    ],
    [
      "No decision under uncertainty is risk-free. Decision D is under uncertainty. Therefore?",
      [
        "Decision D has risk",
        "Decision D is risk-free",
        "Decision D should be avoided",
        "Risk can be eliminated",
      ],
      0,
    ],
    [
      "Some problems are complex. All complex problems require analysis. Therefore?",
      [
        "Some problems require analysis",
        "All problems require analysis",
        "No problems require analysis",
        "Complex problems are simple",
      ],
      0,
    ],
    [
      "If we standardize, we reduce variation. We need variation for innovation. Therefore?",
      [
        "Standardization may hinder innovation",
        "Standardization helps innovation",
        "Innovation requires no variation",
        "No relationship",
      ],
      0,
    ],
    [
      "All policies have trade-offs. Policy P has no visible trade-offs. Therefore?",
      [
        "Trade-offs are hidden",
        "Policy P has no trade-offs",
        "Policy P is perfect",
        "Trade-offs are optional",
      ],
      0,
    ],
    [
      "If we measure it, we can manage it. We cannot measure culture directly. Therefore?",
      [
        "We cannot fully manage culture",
        "We can fully manage culture",
        "Culture is unmanageable",
        "Measurement is unnecessary",
      ],
      0,
    ],
    [
      "Some leaders are born. Some leaders are made. Therefore?",
      [
        "Leadership has multiple paths",
        "All leaders are born",
        "All leaders are made",
        "Leadership is impossible",
      ],
      0,
    ],
    [
      "If we automate, we reduce errors but increase rigidity. We need flexibility. Therefore?",
      [
        "Partial automation may be optimal",
        "Full automation is best",
        "No automation is best",
        "Errors are acceptable",
      ],
      0,
    ],
    [
      "All models are wrong. Some models are useful. Therefore?",
      [
        "Useful models can be wrong",
        "Wrong models cannot be useful",
        "All useful models are correct",
        "No models are useful",
      ],
      0,
    ],
    [
      "No single metric captures performance. Metric M is a single metric. Therefore?",
      [
        "Metric M cannot fully capture performance",
        "Metric M fully captures performance",
        "Single metrics are sufficient",
        "Performance is unmeasurable",
      ],
      0,
    ],
    [
      "If we delegate, we must trust. We cannot verify everything. Therefore?",
      [
        "Trust is necessary for delegation",
        "Delegation is impossible",
        "Verification replaces trust",
        "Micromanagement is better",
      ],
      0,
    ],
    [
      "Some changes are reversible. Structural changes are rarely reversible. Therefore?",
      [
        "Structural changes require extra caution",
        "Structural changes are safe",
        "All changes are reversible",
        "No changes should be made",
      ],
      0,
    ],
    [
      "If we optimize for speed, quality may suffer. If we optimize for quality, speed may suffer. Therefore?",
      [
        "Trade-off exists between speed and quality",
        "Both can be maximized simultaneously",
        "Neither can be improved",
        "Speed and quality are independent",
      ],
      0,
    ],
    [
      "All systems have constraints. System S has no identified constraints. Therefore?",
      [
        "Constraints are unidentified",
        "System S has no constraints",
        "Constraints don't exist",
        "System S is infinite",
      ],
      0,
    ],
    [
      "If we ignore feedback, we miss signals. We missed a critical signal. Therefore?",
      [
        "We may have ignored feedback",
        "We definitely ignored feedback",
        "Feedback was unavailable",
        "Signals are always caught",
      ],
      0,
    ],
  ];
  const allStems = {
    numerical: numericalStems,
    verbal: verbalStems,
    abstract: abstractStems,
    logical: logicalStems,
  };
  return domains.flatMap((domain, domainIndex) =>
    Array.from({ length: domain.itemCount }, (_, index) => {
      const key = domain.key.includes("numerical")
        ? "numerical"
        : domain.key.includes("verbal")
          ? "verbal"
          : domain.key.includes("abstract") || domain.key.includes("inductive")
            ? "abstract"
            : domain.key.includes("logical")
              ? "logical"
              : "numerical";
      const stems = allStems[key];
      const [base, options, correct] = stems[index % stems.length];
      const difficulty =
        index < 6 ? "easy" : index < 21 ? "moderate" : "challenging";
      return {
        id: `psy-${testSlug}-${domain.key}-${index + 1}`,
        testSlug,
        domainKey: domain.key,
        domainLabel: domain.label,
        prompt: base,
        options: [...options],
        correctOptionIndex: correct,
        responseScale: "multipleChoice" as const,
        difficulty,
        application: `Explain how this reasoning pattern could improve a real ${domain.label.toLowerCase()} decision.`,
      };
    })
  );
}

const careerPersonalityDomains: PsychometricDomain[] = [
  [
    "openness",
    "Openness & Adaptability",
    "Curiosity, flexibility, exploration, and comfort with change.",
  ],
  [
    "reliability",
    "Conscientiousness & Reliability",
    "Planning, responsibility, persistence, and attention to commitments.",
  ],
  [
    "sociability",
    "Sociability & Engagement",
    "Social confidence, participation, assertiveness, and interaction energy.",
  ],
  [
    "cooperation",
    "Cooperation & Interpersonal Orientation",
    "Empathy, trust, consideration, teamwork, and collaboration.",
  ],
  [
    "stability",
    "Emotional Stability",
    "Composure, emotional regulation, stress response, and recovery.",
  ],
  [
    "achievement",
    "Achievement Orientation",
    "Goals, initiative, ambition, persistence, and performance focus.",
  ],
  [
    "independence",
    "Independence",
    "Self-direction, ownership, initiative, and independent decisions.",
  ],
  [
    "structure",
    "Structure & Work Preferences",
    "Planning, routine, autonomy, structure, and flexibility preferences.",
  ],
  [
    "learning",
    "Learning Orientation",
    "Curiosity, feedback, continuous learning, and self-improvement.",
  ],
  [
    "influence",
    "Communication & Influence",
    "Expression, listening, persuasion, confidence, and influence.",
  ],
].map(([key, label, description]) => ({
  key,
  label,
  description,
  itemCount: 12,
}));
const eiDomains: PsychometricDomain[] = [
  [
    "awareness",
    "Self-Awareness",
    "Recognising emotions, strengths, limitations, triggers, and behavioural patterns.",
  ],
  [
    "management",
    "Self-Management",
    "Regulation, impulse management, pressure handling, and constructive responses.",
  ],
  [
    "social",
    "Social Awareness",
    "Empathy, perspective-taking, and sensitivity to others and situations.",
  ],
  [
    "relationships",
    "Relationship Management",
    "Communication, cooperation, conflict management, trust, and maintenance.",
  ],
  [
    "adaptability",
    "Adaptability",
    "Flexibility, feedback, setbacks, and adjustment to circumstances.",
  ],
].map(([key, label, description]) => ({
  key,
  label,
  description,
  itemCount: 24,
}));
const employabilityDomains: PsychometricDomain[] = [
  "Communication",
  "Collaboration",
  "Critical Thinking",
  "Problem Solving",
  "Creativity & Innovation",
  "Adaptability",
  "Digital Professionalism",
  "Self-Management",
  "Professionalism & Work Ethic",
  "Initiative & Learning Agility",
].map(label => ({
  key: slugify(label),
  label,
  description: `Practical evidence of ${label.toLowerCase()} in modern learning and workplace environments.`,
  itemCount: 12,
}));
const leadershipDomains: PsychometricDomain[] = [
  "Self-Leadership",
  "Strategic Thinking",
  "Decision-Making",
  "Accountability",
  "Communication",
  "Influence",
  "Collaboration",
  "Emotional Intelligence",
  "Problem Solving",
  "Adaptability",
].map(label => ({
  key: slugify(label),
  label,
  description: `Leadership behaviours related to ${label.toLowerCase()}, ownership, and developing outcomes for others.`,
  itemCount: 12,
}));
const interestDomains: PsychometricDomain[] = [
  [
    "realistic",
    "Realistic",
    "Practical, technical, physical, and hands-on activities.",
  ],
  [
    "investigative",
    "Investigative",
    "Research, analysis, science, problem solving, and intellectual exploration.",
  ],
  [
    "artistic",
    "Artistic",
    "Creative expression, design, writing, media, and innovation.",
  ],
  [
    "social",
    "Social",
    "Teaching, counselling, helping, communication, and community activities.",
  ],
  [
    "enterprising",
    "Enterprising",
    "Leadership, persuasion, entrepreneurship, sales, and influence.",
  ],
  [
    "conventional",
    "Conventional",
    "Organisation, data, administration, systems, and structured activity.",
  ],
].map(([key, label, description]) => ({
  key,
  label,
  description,
  itemCount: 20,
}));

function makeTest(
  input: Omit<PsychometricTest, "questions" | "disclaimer"> & {
    disclaimer?: string;
    cognitive?: boolean;
  }
): PsychometricTest {
  const { cognitive, disclaimer: testDisclaimer, ...test } = input;
  const questions = cognitive
    ? buildCognitiveQuestions(test.slug, test.domains)
    : buildLikertQuestions(test.slug, test.domains);
  return { ...test, disclaimer: testDisclaimer ?? disclaimer, questions };
}

export const psychometricTests: PsychometricTest[] = [
  makeTest({
    slug: "career-personality-profile",
    title: "Profound IQ Career & Personality Profile",
    shortTitle: "Career & Personality Profile",
    strapline: "Understand how you operate, relate, and thrive.",
    purpose:
      "A personal discovery profile connecting personality characteristics, behavioural tendencies, strengths, work preferences, and development opportunities.",
    coreQuestion:
      "What am I like, how do I tend to operate, and what environments may suit me?",
    audience:
      "Students, graduates, professionals, career changers, job seekers, entrepreneurs, coaches, and organizations.",
    estimatedMinutes: "10–15",
    responseScale: "likert5",
    domains: careerPersonalityDomains,
    reportSections: [
      "Personality overview",
      "Overall profile",
      "Top strengths",
      "Development opportunities",
      "Preferred work environment",
      "Communication and teamwork tendencies",
      "Personal development plan",
    ],
  }),
  makeTest({
    slug: "cognitive-reasoning-assessment",
    title: "Profound IQ Cognitive & Reasoning Assessment",
    shortTitle: "Cognitive & Reasoning Assessment",
    strapline:
      "Process information, reason clearly, solve unfamiliar problems.",
    purpose:
      "A performance-oriented assessment of numerical, verbal, abstract, inductive, and logical reasoning.",
    coreQuestion:
      "How effectively do I process information, identify relationships, and solve unfamiliar problems?",
    audience:
      "Students, graduates, job applicants, professionals, employers, universities, and talent programmes.",
    estimatedMinutes: "20–30",
    responseScale: "multipleChoice",
    cognitive: true,
    domains: [
      "Numerical Reasoning",
      "Verbal Reasoning",
      "Abstract & Inductive Reasoning",
      "Logical Reasoning",
    ].map(label => ({
      key: slugify(label),
      label,
      description: `Performance tasks involving ${label.toLowerCase()} and unfamiliar problems.`,
      itemCount: 30,
    })),
    reportSections: [
      "Overall reasoning profile",
      "Four subtest scores",
      "Relative strengths",
      "Development opportunities",
      "Learning strategies",
    ],
  }),
  makeTest({
    slug: "emotional-intelligence-profile",
    title: "Profound IQ Emotional Intelligence Profile",
    shortTitle: "Emotional Intelligence Profile",
    strapline:
      "Understand yourself, connect with others, respond with intention.",
    purpose:
      "A development profile for emotional and interpersonal capabilities relevant to effectiveness, relationships, and leadership.",
    coreQuestion:
      "How effectively do I understand and manage myself and interact with others?",
    audience:
      "Respondents, professionals, managers, educators, coaches, and emerging leaders.",
    estimatedMinutes: "12–15",
    responseScale: "likert5",
    domains: eiDomains,
    reportSections: [
      "Overall EI profile",
      "Five domain scores",
      "Communication and teamwork implications",
      "Leadership implications",
      "Personal EI development plan",
    ],
  }),
  makeTest({
    slug: "future-ready-employability-profile",
    title: "Profound IQ Future-Ready Employability Profile",
    shortTitle: "Future-Ready Employability Profile",
    strapline:
      "See the capabilities that help you contribute in a changing world.",
    purpose:
      "A competency profile for education, employment, professional life, workforce development, and institutional talent programmes.",
    coreQuestion:
      "How prepared am I for the demands of education, employment, and professional life?",
    audience:
      "Students, graduates, universities, colleges, employers, NGOs, career centres, and workforce programmes.",
    estimatedMinutes: "12–15",
    responseScale: "likert5",
    domains: employabilityDomains,
    reportSections: [
      "Overall employability readiness",
      "Ten competency scores",
      "Top strengths",
      "Development priorities",
      "Recommended courses",
      "Employability development plan",
    ],
  }),
  makeTest({
    slug: "leadership-potential-profile",
    title: "Profound IQ Leadership Potential Profile",
    shortTitle: "Leadership Potential Profile",
    strapline: "Turn leadership potential into observable practice.",
    purpose:
      "A leadership development profile identifying strengths, behaviours, and capabilities that can be deliberately developed.",
    coreQuestion:
      "What leadership capabilities do I currently demonstrate, and which should I develop?",
    audience:
      "Emerging leaders, supervisors, managers, teachers, entrepreneurs, professionals, and organizations.",
    estimatedMinutes: "12–15",
    responseScale: "likert5",
    domains: leadershipDomains,
    reportSections: [
      "Leadership Potential Index",
      "Ten leadership dimensions",
      "Leadership style indicators",
      "Team leadership and decision profile",
      "Individual Leadership Development Plan",
    ],
  }),
  makeTest({
    slug: "career-interests-occupational-fit",
    title: "Profound IQ Career Interests & Occupational Fit Assessment",
    shortTitle: "Career Interests & Occupational Fit",
    strapline:
      "Explore the activities and environments that may fit your interests.",
    purpose:
      "An activity-preference assessment using the RIASEC framework as a transparent interpretive lens for occupational exploration.",
    coreQuestion:
      "What types of activities, environments, and occupational areas am I naturally interested in exploring?",
    audience:
      "Secondary students, university students, graduates, career changers, job seekers, coaches, schools, and career centres.",
    estimatedMinutes: "10–15",
    responseScale: "likert5",
    domains: interestDomains,
    reportSections: [
      "Primary, secondary, and supporting interests",
      "RIASEC profile",
      "Occupational family exploration",
      "Development activities",
      "Career conversation prompts",
    ],
  }),
];

export const psychometricTestMap = Object.fromEntries(
  psychometricTests.map(test => [test.slug, test])
) as Record<string, PsychometricTest>;

export function getPsychometricTest(slug: string) {
  return psychometricTestMap[slug];
}
export function scorePsychometricTest(
  test: PsychometricTest,
  answers: PsychometricAnswer[]
): PsychometricReport {
  const values = new Map(
    answers
      .filter(answer => typeof answer.value === "number")
      .map(answer => [
        answer.questionId,
        Math.max(1, Math.min(5, answer.value)),
      ])
  );
  const domains = test.domains.map(domain => {
    const questions = test.questions.filter(
      question => question.domainKey === domain.key
    );
    const selected = questions
      .map(question => {
        const value = values.get(question.id);
        if (typeof value !== "number") return undefined;
        return question.responseScale === "multipleChoice" &&
          question.correctOptionIndex !== undefined
          ? value - 1 === question.correctOptionIndex
            ? 5
            : 1
          : value;
      })
      .filter((value): value is number => typeof value === "number");
    const mean = selected.length
      ? selected.reduce((sum, value) => sum + value, 0) / selected.length
      : 1;
    const score = selected.length
      ? Math.max(0, Math.min(100, Math.round(((mean - 1) / 4) * 100)))
      : 0;
    const reliability = (() => {
      if (selected.length < 2) return 0;
      const variance =
        selected.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
        selected.length;
      return Math.max(
        0,
        Math.min(100, Math.round(100 * (1 - Math.sqrt(variance) / 2)))
      );
    })();
    const band =
      score >= 80
        ? "Strong current signal"
        : score >= 60
          ? "Developing foundation"
          : "Priority for development";
    return {
      ...domain,
      score,
      reliability,
      band,
      readout: `${domain.label} is currently showing ${band.toLowerCase()} based on the responses provided.`,
      developmentActions: [
        `Choose one everyday situation where ${domain.label.toLowerCase()} matters.`,
        `Practise one observable behaviour and review the result with trusted feedback.`,
      ],
    };
  });
  const overallScore = domains.length
    ? Math.round(
        domains.reduce((sum, domain) => sum + domain.score, 0) / domains.length
      )
    : 0;
  const ordered = [...domains].sort(
    (a, b) => b.score - a.score || a.label.localeCompare(b.label)
  );
  return {
    testSlug: test.slug,
    title: test.title,
    overallScore,
    overallBand:
      overallScore >= 80
        ? "Strong foundation"
        : overallScore >= 60
          ? "Developing momentum"
          : "Meaningful opportunity to grow",
    domains,
    strengths: ordered.slice(0, 3).map(domain => domain.label),
    developmentPriorities: ordered
      .slice(-3)
      .reverse()
      .map(domain => domain.label),
    recommendations: ordered
      .slice(-3)
      .reverse()
      .map(
        domain =>
          `Build ${domain.label.toLowerCase()} through a small, repeatable practice and review the evidence.`
      ),
    disclaimer: test.disclaimer,
  };
}

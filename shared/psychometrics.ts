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
export type PsychometricDomain = { key: string; label: string; description: string; itemCount: number };
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
export type PsychometricDomainResult = PsychometricDomain & { score: number; band: string; readout: string; developmentActions: string[] };
export type PsychometricReport = { testSlug: string; title: string; overallScore: number; overallBand: string; domains: PsychometricDomainResult[]; strengths: string[]; developmentPriorities: string[]; recommendations: string[]; disclaimer: string };

const disclaimer = "This educational psychometric profile is intended for development, career exploration, coaching, and learning conversations. It is not a clinical diagnosis, a fixed personality label, or a standalone basis for employment, admission, promotion, or other high-stakes decisions. Interpretation should be combined with observed behaviour, context, relevant evidence, and qualified professional guidance.";
const likertOptions = ["Strongly disagree", "Disagree", "Neither agree nor disagree", "Agree", "Strongly agree"];
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

function slugify(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function buildLikertQuestions(testSlug: string, domains: PsychometricDomain[]): PsychometricQuestion[] {
  return domains.flatMap((domain) => Array.from({ length: domain.itemCount }, (_, index) => {
    const template = templates[index % templates.length];
    const context = index >= templates.length ? ` in a new situation or relationship` : "";
    return { id: `psy-${testSlug}-${domain.key}-${index + 1}`, testSlug, domainKey: domain.key, domainLabel: domain.label, prompt: template.replace("{label}", `${domain.label.toLowerCase()}${context}`), options: likertOptions, responseScale: "likert5" as const, application: `Apply ${domain.label.toLowerCase()} in one decision, conversation, routine, or project this week.` };
  }));
}
function buildCognitiveQuestions(testSlug: string, domains: PsychometricDomain[]): PsychometricQuestion[] {
  const stems = [
    ["A project budget is KES 80,000 and 15% is reserved for training. How much is reserved?", ["KES 8,000", "KES 12,000", "KES 15,000", "KES 68,000"], 1],
    ["A report states that attendance rose from 40 to 50 participants. What is the percentage increase?", ["10%", "20%", "25%", "40%"], 2],
    ["Passage: A team tested two approaches, measured both outcomes, and selected the approach with stronger evidence. Which principle is shown?", ["Evidence-based comparison", "Personal preference", "Avoidance of measurement", "Immediate agreement"], 0],
    ["If every A is B and no B is C, which conclusion must follow?", ["Some A are C", "No A is C", "Every C is A", "Some B are not A"], 1],
    ["Sequence: 3, 6, 12, 24, ... What comes next?", ["27", "36", "48", "60"], 2],
    ["A plan fails because its key assumption is false. What is the most useful next step?", ["Hide the result", "Test and revise the assumption", "Repeat without changes", "Blame the last person involved"], 1],
  ] as const;
  return domains.flatMap((domain, domainIndex) => Array.from({ length: domain.itemCount }, (_, index) => {
    const [base, options, correct] = stems[(domainIndex * 3 + index) % stems.length];
    const difficulty = index < 6 ? "easy" : index < 21 ? "moderate" : "challenging";
    return { id: `psy-${testSlug}-${domain.key}-${index + 1}`, testSlug, domainKey: domain.key, domainLabel: domain.label, prompt: `${base} (Item ${index + 1})`, options: [...options], correctOptionIndex: correct, responseScale: "multipleChoice" as const, difficulty, application: `Explain how this reasoning pattern could improve a real ${domain.label.toLowerCase()} decision.` };
  }));
}

const careerPersonalityDomains: PsychometricDomain[] = [
  ["openness", "Openness & Adaptability", "Curiosity, flexibility, exploration, and comfort with change."], ["reliability", "Conscientiousness & Reliability", "Planning, responsibility, persistence, and attention to commitments."], ["sociability", "Sociability & Engagement", "Social confidence, participation, assertiveness, and interaction energy."], ["cooperation", "Cooperation & Interpersonal Orientation", "Empathy, trust, consideration, teamwork, and collaboration."], ["stability", "Emotional Stability", "Composure, emotional regulation, stress response, and recovery."], ["achievement", "Achievement Orientation", "Goals, initiative, ambition, persistence, and performance focus."], ["independence", "Independence", "Self-direction, ownership, initiative, and independent decisions."], ["structure", "Structure & Work Preferences", "Planning, routine, autonomy, structure, and flexibility preferences."], ["learning", "Learning Orientation", "Curiosity, feedback, continuous learning, and self-improvement."], ["influence", "Communication & Influence", "Expression, listening, persuasion, confidence, and influence."],
].map(([key, label, description]) => ({ key, label, description, itemCount: 12 }));
const eiDomains: PsychometricDomain[] = [["awareness", "Self-Awareness", "Recognising emotions, strengths, limitations, triggers, and behavioural patterns."], ["management", "Self-Management", "Regulation, impulse management, pressure handling, and constructive responses."], ["social", "Social Awareness", "Empathy, perspective-taking, and sensitivity to others and situations."], ["relationships", "Relationship Management", "Communication, cooperation, conflict management, trust, and maintenance."], ["adaptability", "Adaptability", "Flexibility, feedback, setbacks, and adjustment to circumstances."]].map(([key, label, description]) => ({ key, label, description, itemCount: 24 }));
const employabilityDomains: PsychometricDomain[] = ["Communication", "Collaboration", "Critical Thinking", "Problem Solving", "Creativity & Innovation", "Adaptability", "Digital Professionalism", "Self-Management", "Professionalism & Work Ethic", "Initiative & Learning Agility"].map((label) => ({ key: slugify(label), label, description: `Practical evidence of ${label.toLowerCase()} in modern learning and workplace environments.`, itemCount: 12 }));
const leadershipDomains: PsychometricDomain[] = ["Self-Leadership", "Strategic Thinking", "Decision-Making", "Accountability", "Communication", "Influence", "Collaboration", "Emotional Intelligence", "Problem Solving", "Adaptability"].map((label) => ({ key: slugify(label), label, description: `Leadership behaviours related to ${label.toLowerCase()}, ownership, and developing outcomes for others.`, itemCount: 12 }));
const interestDomains: PsychometricDomain[] = [["realistic", "Realistic", "Practical, technical, physical, and hands-on activities."], ["investigative", "Investigative", "Research, analysis, science, problem solving, and intellectual exploration."], ["artistic", "Artistic", "Creative expression, design, writing, media, and innovation."], ["social", "Social", "Teaching, counselling, helping, communication, and community activities."], ["enterprising", "Enterprising", "Leadership, persuasion, entrepreneurship, sales, and influence."], ["conventional", "Conventional", "Organisation, data, administration, systems, and structured activity."]].map(([key, label, description]) => ({ key, label, description, itemCount: 20 }));

function makeTest(input: Omit<PsychometricTest, "questions" | "disclaimer"> & { disclaimer?: string; cognitive?: boolean }): PsychometricTest {
  const { cognitive, disclaimer: testDisclaimer, ...test } = input;
  const questions = cognitive ? buildCognitiveQuestions(test.slug, test.domains) : buildLikertQuestions(test.slug, test.domains);
  return { ...test, disclaimer: testDisclaimer ?? disclaimer, questions };
}

export const psychometricTests: PsychometricTest[] = [
  makeTest({ slug: "career-personality-profile", title: "Profound IQ Career & Personality Profile", shortTitle: "Career & Personality Profile", strapline: "Understand how you operate, relate, and thrive.", purpose: "A personal discovery profile connecting personality characteristics, behavioural tendencies, strengths, work preferences, and development opportunities.", coreQuestion: "What am I like, how do I tend to operate, and what environments may suit me?", audience: "Students, graduates, professionals, career changers, job seekers, entrepreneurs, coaches, and organizations.", estimatedMinutes: "10–15", responseScale: "likert5", domains: careerPersonalityDomains, reportSections: ["Personality overview", "Overall profile", "Top strengths", "Development opportunities", "Preferred work environment", "Communication and teamwork tendencies", "Personal development plan"] }),
  makeTest({ slug: "cognitive-reasoning-assessment", title: "Profound IQ Cognitive & Reasoning Assessment", shortTitle: "Cognitive & Reasoning Assessment", strapline: "Process information, reason clearly, solve unfamiliar problems.", purpose: "A performance-oriented assessment of numerical, verbal, abstract, inductive, and logical reasoning.", coreQuestion: "How effectively do I process information, identify relationships, and solve unfamiliar problems?", audience: "Students, graduates, job applicants, professionals, employers, universities, and talent programmes.", estimatedMinutes: "20–30", responseScale: "multipleChoice", cognitive: true, domains: ["Numerical Reasoning", "Verbal Reasoning", "Abstract & Inductive Reasoning", "Logical Reasoning"].map((label) => ({ key: slugify(label), label, description: `Performance tasks involving ${label.toLowerCase()} and unfamiliar problems.`, itemCount: 30 })), reportSections: ["Overall reasoning profile", "Four subtest scores", "Relative strengths", "Development opportunities", "Learning strategies"] }),
  makeTest({ slug: "emotional-intelligence-profile", title: "Profound IQ Emotional Intelligence Profile", shortTitle: "Emotional Intelligence Profile", strapline: "Understand yourself, connect with others, respond with intention.", purpose: "A development profile for emotional and interpersonal capabilities relevant to effectiveness, relationships, and leadership.", coreQuestion: "How effectively do I understand and manage myself and interact with others?", audience: "Learners, professionals, managers, educators, coaches, and emerging leaders.", estimatedMinutes: "12–15", responseScale: "likert5", domains: eiDomains, reportSections: ["Overall EI profile", "Five domain scores", "Communication and teamwork implications", "Leadership implications", "Personal EI development plan"] }),
  makeTest({ slug: "future-ready-employability-profile", title: "Profound IQ Future-Ready Employability Profile", shortTitle: "Future-Ready Employability Profile", strapline: "See the capabilities that help you contribute in a changing world.", purpose: "A competency profile for education, employment, professional life, workforce development, and institutional talent programmes.", coreQuestion: "How prepared am I for the demands of education, employment, and professional life?", audience: "Students, graduates, universities, colleges, employers, NGOs, career centres, and workforce programmes.", estimatedMinutes: "12–15", responseScale: "likert5", domains: employabilityDomains, reportSections: ["Overall employability readiness", "Ten competency scores", "Top strengths", "Development priorities", "Recommended courses", "Employability development plan"] }),
  makeTest({ slug: "leadership-potential-profile", title: "Profound IQ Leadership Potential Profile", shortTitle: "Leadership Potential Profile", strapline: "Turn leadership potential into observable practice.", purpose: "A leadership development profile identifying strengths, behaviours, and capabilities that can be deliberately developed.", coreQuestion: "What leadership capabilities do I currently demonstrate, and which should I develop?", audience: "Emerging leaders, supervisors, managers, teachers, entrepreneurs, professionals, and organizations.", estimatedMinutes: "12–15", responseScale: "likert5", domains: leadershipDomains, reportSections: ["Leadership Potential Index", "Ten leadership dimensions", "Leadership style indicators", "Team leadership and decision profile", "Individual Leadership Development Plan"] }),
  makeTest({ slug: "career-interests-occupational-fit", title: "Profound IQ Career Interests & Occupational Fit Assessment", shortTitle: "Career Interests & Occupational Fit", strapline: "Explore the activities and environments that may fit your interests.", purpose: "An activity-preference assessment using the RIASEC framework as a transparent interpretive lens for occupational exploration.", coreQuestion: "What types of activities, environments, and occupational areas am I naturally interested in exploring?", audience: "Secondary students, university students, graduates, career changers, job seekers, coaches, schools, and career centres.", estimatedMinutes: "10–15", responseScale: "likert5", domains: interestDomains, reportSections: ["Primary, secondary, and supporting interests", "RIASEC profile", "Occupational family exploration", "Development activities", "Career conversation prompts"] }),
];

export const psychometricTestMap = Object.fromEntries(psychometricTests.map((test) => [test.slug, test])) as Record<string, PsychometricTest>;

export function getPsychometricTest(slug: string) { return psychometricTestMap[slug]; }
export function scorePsychometricTest(test: PsychometricTest, answers: PsychometricAnswer[]): PsychometricReport {
  const values = new Map(answers.map((answer) => [answer.questionId, Math.max(1, Math.min(5, answer.value))]));
  const domains = test.domains.map((domain) => {
    const questions = test.questions.filter((question) => question.domainKey === domain.key);
    const selected = questions.map((question) => {
      const value = values.get(question.id);
      if (typeof value !== "number") return undefined;
      return question.responseScale === "multipleChoice" && question.correctOptionIndex !== undefined ? (value - 1 === question.correctOptionIndex ? 5 : 1) : value;
    }).filter((value): value is number => typeof value === "number");
    const score = selected.length ? Math.round((selected.reduce((sum, value) => sum + value, 0) / selected.length) * 20) : 0;
    const band = score >= 80 ? "Strong current signal" : score >= 60 ? "Developing foundation" : "Priority for development";
    return { ...domain, score, band, readout: `${domain.label} is currently showing ${band.toLowerCase()} based on the responses provided.`, developmentActions: [`Choose one everyday situation where ${domain.label.toLowerCase()} matters.`, `Practise one observable behaviour and review the result with trusted feedback.`] };
  });
  const overallScore = domains.length ? Math.round(domains.reduce((sum, domain) => sum + domain.score, 0) / domains.length) : 0;
  const ordered = [...domains].sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));
  return { testSlug: test.slug, title: test.title, overallScore, overallBand: overallScore >= 80 ? "Strong foundation" : overallScore >= 60 ? "Developing momentum" : "Meaningful opportunity to grow", domains, strengths: ordered.slice(0, 3).map((domain) => domain.label), developmentPriorities: ordered.slice(-3).reverse().map((domain) => domain.label), recommendations: ordered.slice(-3).reverse().map((domain) => `Build ${domain.label.toLowerCase()} through a small, repeatable practice and review the evidence.`), disclaimer: test.disclaimer };
}

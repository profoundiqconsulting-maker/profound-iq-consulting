export const CAREER_PATH_PRICE_KES = 399;

export type CareerPathwayKey = "stem" | "socialSciences" | "artsSports";
export type CareerSubPathwayKey =
  | "pureSciences"
  | "appliedSciences"
  | "technicalStudies"
  | "languages"
  | "humanities"
  | "arts"
  | "sports";
export type CareerPathAnswer = { questionId: string; value: number };
export type CareerPathQuestion = {
  id: string;
  module: string;
  prompt: string;
  options?: string[];
};
export type CareerPathwayResult = {
  key: CareerPathwayKey;
  label: string;
  score: number;
  band: string;
  evidence: string[];
  nextSteps: string[];
};
export type CareerSubPathwayResult = {
  key: CareerSubPathwayKey;
  label: string;
  score: number;
  band: string;
  rationale: string;
};
export type CareerPathReport = {
  overallReadout: string;
  primary: CareerPathwayResult;
  secondary: CareerPathwayResult;
  alternative: CareerPathwayResult;
  pathways: CareerPathwayResult[];
  subPathways: CareerSubPathwayResult[];
  learnerProfile: string[];
  explorationPlan: string[];
  importantContext: string[];
  disclaimer: string;
};

export function getTopCareerPathStrengths(
  report: Pick<CareerPathReport, "subPathways">,
  limit = 3
): CareerSubPathwayResult[] {
  return [...report.subPathways]
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
    .slice(0, Math.max(0, limit));
}

const module = (name: string, prompts: string[]): CareerPathQuestion[] =>
  prompts.map((prompt, index) => ({
    id: `cp-${name.toLowerCase().replace(/[^a-z]+/g, "-")}-${index + 1}`,
    module: name,
    prompt,
  }));

const interests = module("Career interests", [
  "Solving mathematical problems.",
  "Conducting science experiments.",
  "Understanding how machines work.",
  "Designing or building things.",
  "Working with computers and technology.",
  "Investigating why something happens.",
  "Working with numbers and data.",
  "Learning about medicine, health or the human body.",
  "Designing technical solutions to practical problems.",
  "Learning how digital technologies work.",
  "Understanding why people behave differently.",
  "Discussing social issues.",
  "Reading and analyzing historical events.",
  "Learning about different cultures and communities.",
  "Understanding how businesses operate.",
  "Organizing activities involving people.",
  "Speaking or writing about ideas.",
  "Learning about economics and money.",
  "Helping people solve personal or social problems.",
  "Understanding how governments and societies work.",
  "Drawing, painting or visual design.",
  "Performing music.",
  "Dancing or movement-based performance.",
  "Acting or storytelling.",
  "Creating videos, films or digital media.",
  "Designing creative projects.",
  "Participating in sports.",
  "Learning about physical fitness.",
  "Performing before an audience.",
  "Creating original artistic ideas.",
  "Developing sporting skills.",
  "Expressing ideas through creative work.",
]);
const aptitude = module("Aptitude and cognitive preferences", [
  "I enjoy discovering numerical patterns.",
  "I can work patiently through mathematical problems.",
  "I enjoy comparing quantities, measurements and numerical information.",
  "I like using calculations to solve practical problems.",
  "I naturally ask questions about why things happen.",
  "I enjoy testing an idea to see whether evidence supports it.",
  "I like making observations and drawing conclusions.",
  "I enjoy learning how natural systems work.",
  "I can imagine how objects fit together.",
  "I enjoy assembling, constructing or repairing things.",
  "Diagrams and visual instructions are easy for me to understand.",
  "I enjoy understanding how physical systems operate.",
  "I enjoy explaining ideas using words.",
  "I notice differences in how words are used.",
  "I enjoy reading and interpreting written information.",
  "I can usually explain a complicated idea in a simple way.",
  "I enjoy comparing different explanations for a problem.",
  "I naturally look for evidence before making conclusions.",
  "I enjoy identifying relationships between different pieces of information.",
  "I can recognize when an argument does not make logical sense.",
  "I can usually understand why people respond differently to the same situation.",
  "People often come to me when they need someone to listen.",
  "I enjoy discussing different viewpoints.",
  "I notice changes in people’s moods or behaviour.",
  "I often think of unusual ways to solve problems.",
  "I enjoy creating things that are different from what others have made.",
  "I can imagine several possible outcomes from one idea.",
  "I enjoy experimenting with new approaches.",
]);
const learning = module("Learning and work style", [
  "I learn best by experimenting.",
  "I learn best when I can see demonstrations.",
  "I enjoy learning through discussion.",
  "I prefer learning by reading.",
  "I enjoy practical projects.",
  "I prefer tasks with clear instructions.",
  "I enjoy discovering solutions independently.",
  "I work well with deadlines.",
  "I prefer working with other people.",
  "I can work effectively alone.",
  "I enjoy taking responsibility for projects.",
  "I like having freedom to decide how to complete a task.",
  "I prefer structured environments.",
  "I enjoy competitive activities.",
  "I prefer cooperative activities.",
  "I enjoy working on one problem for a long time.",
  "I like changing between different types of activities.",
  "I enjoy learning skills that have immediate practical application.",
  "I enjoy theoretical or conceptual learning.",
  "I learn from mistakes and try again.",
]);
const personality = module("Personality and behavioural tendencies", [
  "I am curious about how things work.",
  "I enjoy meeting and interacting with new people.",
  "I prefer thinking carefully before acting.",
  "I am comfortable taking responsibility.",
  "I remain calm when facing difficult tasks.",
  "I enjoy expressing my opinions.",
  "I am willing to try unfamiliar activities.",
  "I prefer completing tasks carefully rather than rushing.",
  "I enjoy persuading others when I believe strongly in an idea.",
  "I notice details that others sometimes miss.",
  "I enjoy exploring new ideas.",
  "I am comfortable performing in front of others.",
  "I enjoy helping people.",
  "I can continue working even when a task becomes difficult.",
  "I enjoy organizing people or activities.",
  "I prefer practical solutions to abstract discussions.",
  "I enjoy imagining possibilities that do not yet exist.",
  "I am comfortable making decisions.",
  "I enjoy investigating questions that do not have obvious answers.",
  "I am patient when learning a difficult skill.",
  "I enjoy working toward measurable goals.",
  "I can adapt when plans change.",
  "I enjoy expressing myself creatively.",
  "I take feedback seriously and use it to improve.",
]);
const skills = module("Skills and competencies", [
  "Mathematics and numerical reasoning.",
  "Scientific investigation.",
  "Computer and digital skills.",
  "Writing.",
  "Public speaking.",
  "Reading comprehension.",
  "Research.",
  "Problem solving.",
  "Critical thinking.",
  "Teamwork.",
  "Leadership.",
  "Organization.",
  "Creativity.",
  "Artistic expression.",
  "Music.",
  "Physical coordination.",
  "Sports performance.",
  "Entrepreneurship.",
  "Communication.",
  "Decision-making.",
  "Working with people.",
  "Practical or technical work.",
  "Learning new technology.",
  "Managing projects.",
]);
const values = module("Values and motivators", [
  "Having a career that helps people.",
  "Earning a good income.",
  "Having job security.",
  "Being intellectually challenged.",
  "Being creative.",
  "Having independence.",
  "Leading others.",
  "Working with technology.",
  "Working outdoors.",
  "Working with people.",
  "Working with information and data.",
  "Making a visible contribution to society.",
  "Becoming recognized for excellence.",
  "Having opportunities for innovation.",
  "Having opportunities to travel or work internationally.",
  "Building or creating things.",
  "Working in a competitive environment.",
  "Maintaining work-life balance.",
  "Owning or starting a business.",
  "Having opportunities for continuous learning.",
]);
const creativity = module("Creativity, talent and innovation", [
  "I frequently generate ideas for improving things.",
  "I enjoy creating original work.",
  "I can see possibilities that others may overlook.",
  "I enjoy experimenting with different ways of doing things.",
  "I am comfortable showing others my creative work.",
  "I can turn an idea into a practical project.",
  "I enjoy designing visual materials.",
  "I enjoy creating stories, performances or media.",
  "I enjoy creating digital content.",
  "I enjoy finding better ways to solve practical problems.",
  "I can combine ideas from different subjects.",
  "I enjoy improving something that already exists.",
  "I am willing to test an idea even when success is uncertain.",
  "I enjoy learning from creative people.",
  "I can explain the reasoning behind my creative choices.",
  "I enjoy developing an idea through several stages.",
]);
const aspirations = module("Career aspirations and exposure", [
  "I already have one or more careers that interest me.",
  "I understand the type of work involved in the careers I am considering.",
  "I have spoken with someone working in a career that interests me.",
  "I have researched the subjects or qualifications required for my preferred career.",
  "I understand that a single career can have several different educational pathways.",
  "I am willing to explore careers I have not previously considered.",
  "I understand that my interests and abilities may develop as I grow.",
  "I am prepared to seek guidance before making major educational decisions.",
]);
const judgement = module("Situational career judgement", [
  "For a project with several possible approaches, I would research the problem and compare the options.",
  "For a school community event, I would coordinate people and activities.",
  "When I discover unfamiliar technology, I would explore how it works.",
  "For a difficult team problem, I would break it into components and examine the evidence.",
  "I would willingly spend a Saturday on a science or technology project, debate or business activity, creative project, or sports programme.",
  "I would choose a competition that genuinely attracts me, whether academic, social, creative, or physical.",
  "To create something useful for school, I would develop a technology, community, creative, or sports solution.",
  "For a three-month project, I would investigate a technical problem, research a social issue, produce creative work, or develop a sports programme.",
]);

export const careerPathQuestions = [
  ...interests,
  ...aptitude,
  ...learning,
  ...personality,
  ...skills,
  ...values,
  ...creativity,
  ...aspirations,
  ...judgement,
];
export const careerPathModules = [
  { name: "Career interests", items: 32 },
  { name: "Aptitude and cognitive preferences", items: 28 },
  { name: "Learning and work style", items: 20 },
  { name: "Personality and behavioural tendencies", items: 24 },
  { name: "Skills and competencies", items: 24 },
  { name: "Values and motivators", items: 20 },
  { name: "Creativity, talent and innovation", items: 16 },
  { name: "Career aspirations and exposure", items: 8 },
  { name: "Situational career judgement", items: 8 },
] as const;

const pathwayMeta: Record<
  CareerPathwayKey,
  { label: string; evidence: string[]; nextSteps: string[] }
> = {
  stem: {
    label: "STEM",
    evidence: [
      "Mathematics, science, technology, engineering and technical problem solving",
      "Evidence-based inquiry and applied solutions",
      "Computing, technical studies and applied sciences",
    ],
    nextSteps: [
      "Try a project that combines measurement, investigation, coding, design or making.",
      "Compare the subjects and qualifications required for two STEM pathways.",
    ],
  },
  socialSciences: {
    label: "Social Sciences",
    evidence: [
      "Languages, communication, history, geography, business and society",
      "Understanding people, institutions and community needs",
      "Leadership, entrepreneurship and public-facing problem solving",
    ],
    nextSteps: [
      "Interview someone in a people-, business-, policy- or communication-oriented role.",
      "Build evidence through debate, writing, organizing or community research.",
    ],
  },
  artsSports: {
    label: "Arts and Sports Science",
    evidence: [
      "Creative arts, media, design, music, performance and sport",
      "Original expression, practical creation and movement",
      "Performance, recreation, wellbeing and creative enterprise",
    ],
    nextSteps: [
      "Create a portfolio, performance record or documented sports-development plan.",
      "Test how creative or physical strengths can solve a real community need.",
    ],
  },
};
const fitBand = (score: number) =>
  score >= 85
    ? "Very Strong Fit"
    : score >= 75
      ? "Strong Fit"
      : score >= 65
        ? "Good Potential Fit"
        : score >= 55
          ? "Possible Fit"
          : "Lower Relative Fit";
const subPathwayMeta: Record<
  CareerSubPathwayKey,
  { label: string; rationale: string }
> = {
  pureSciences: {
    label: "Pure Sciences",
    rationale:
      "Evidence of curiosity, quantitative reasoning, scientific inquiry and comfort testing ideas against evidence.",
  },
  appliedSciences: {
    label: "Applied Sciences",
    rationale:
      "Evidence of connecting scientific understanding to health, technology, design, systems or practical solutions.",
  },
  technicalStudies: {
    label: "Technical Studies",
    rationale:
      "Evidence of making, repairing, computing, engineering, digital problem solving and hands-on application.",
  },
  languages: {
    label: "Languages",
    rationale:
      "Evidence of communication, reading, writing, interpretation, explanation and sensitivity to how meaning is expressed.",
  },
  humanities: {
    label: "Humanities",
    rationale:
      "Evidence of interest in people, culture, history, society, institutions, values and community-facing questions.",
  },
  arts: {
    label: "Arts",
    rationale:
      "Evidence of creative expression, original production, performance, design, media and artistic experimentation.",
  },
  sports: {
    label: "Sports",
    rationale:
      "Evidence of physical coordination, movement, fitness, performance, competition and disciplined practice.",
  },
};

export function buildCareerPathReport(
  answers: CareerPathAnswer[]
): CareerPathReport {
  const answerValues = new Map(
    answers.map(answer => [
      answer.questionId,
      Math.max(1, Math.min(5, answer.value)),
    ])
  );
  const average = (items: CareerPathQuestion[]) => {
    const selected = items
      .map(item => answerValues.get(item.id))
      .filter((value): value is number => typeof value === "number");
    return selected.length
      ? Math.round(
          (selected.reduce((sum, value) => sum + value, 0) / selected.length) *
            20
        )
      : 0;
  };
  const scores: Record<CareerPathwayKey, number> = {
    stem: Math.round(
      average(interests.slice(0, 10)) * 0.25 +
        average(aptitude.slice(0, 12)) * 0.2 +
        average(learning.slice(0, 7)) * 0.1 +
        average(skills.slice(0, 9)) * 0.1 +
        average(aspirations) * 0.05 +
        average(judgement) * 0.3
    ),
    socialSciences: Math.round(
      average(interests.slice(10, 20)) * 0.25 +
        average(aptitude.slice(12, 24)) * 0.2 +
        average(learning.slice(7, 15)) * 0.1 +
        average(skills.slice(3, 11)) * 0.1 +
        average(values.slice(0, 10)) * 0.05 +
        average(judgement) * 0.3
    ),
    artsSports: Math.round(
      average(interests.slice(20)) * 0.25 +
        average(aptitude.slice(24)) * 0.2 +
        average(learning.slice(14)) * 0.1 +
        average(skills.slice(12)) * 0.1 +
        average(creativity) * 0.05 +
        average(judgement) * 0.3
    ),
  };
  const pathways = (Object.keys(scores) as CareerPathwayKey[])
    .map(key => ({
      key,
      label: pathwayMeta[key].label,
      score: scores[key],
      band: fitBand(scores[key]),
      evidence: pathwayMeta[key].evidence,
      nextSteps: pathwayMeta[key].nextSteps,
    }))
    .sort((a, b) => b.score - a.score);
  const subScores: Record<CareerSubPathwayKey, number> = {
    pureSciences: Math.round(
      average([
        ...interests.slice(0, 10),
        ...aptitude.slice(4, 8),
        ...skills.slice(0, 2),
        ...judgement.slice(0, 2),
      ])
    ),
    appliedSciences: Math.round(
      average([
        ...interests.slice(0, 10),
        ...aptitude.slice(8, 12),
        ...skills.slice(0, 3),
        ...skills.slice(7, 9),
        ...skills.slice(21, 24),
        ...judgement.slice(0, 1),
      ])
    ),
    technicalStudies: Math.round(
      average([
        ...interests.slice(2, 10),
        ...aptitude.slice(8, 12),
        ...skills.slice(2, 3),
        ...skills.slice(7, 9),
        ...skills.slice(11, 12),
        ...skills.slice(21, 24),
      ])
    ),
    languages: Math.round(
      average([
        ...interests.slice(16, 18),
        ...aptitude.slice(12, 16),
        ...skills.slice(3, 6),
        ...skills.slice(18, 19),
      ])
    ),
    humanities: Math.round(
      average([
        ...interests.slice(11, 20),
        ...aptitude.slice(16, 24),
        ...skills.slice(6, 7),
        ...skills.slice(8, 11),
        ...skills.slice(20, 21),
        ...values.slice(0, 2),
      ])
    ),
    arts: Math.round(
      average([
        ...interests.slice(20, 27),
        ...creativity,
        ...skills.slice(12, 16),
      ])
    ),
    sports: Math.round(
      average([
        ...interests.slice(26, 32),
        ...learning.slice(13, 15),
        ...skills.slice(15, 17),
        ...judgement.slice(4, 8),
      ])
    ),
  };
  const subPathways = (Object.keys(subScores) as CareerSubPathwayKey[])
    .map(key => ({
      key,
      label: subPathwayMeta[key].label,
      score: subScores[key],
      band: fitBand(subScores[key]),
      rationale: subPathwayMeta[key].rationale,
    }))
    .sort((a, b) => b.score - a.score);
  const primary = pathways[0];
  const secondary = pathways[1];
  const alternative = pathways[2];
  return {
    overallReadout: `${primary.label} is your strongest relative pathway signal at ${primary.score}/100, with ${secondary.label} as a meaningful adjacent possibility. Use both signals to explore subjects, projects and conversations before choosing a direction.`,
    primary,
    secondary,
    alternative,
    pathways,
    subPathways,
    learnerProfile: [
      "Your profile combines interests, aptitude preferences, learning style, behavioural tendencies, competencies, values, creativity, aspirations and situational judgement.",
      `Your strongest current evidence points toward ${primary.label}, but the result is a relative fit signal rather than a fixed label.`,
      "Your next decision should be informed by real projects, subject performance, exposure and conversations with qualified adults.",
    ],
    explorationPlan: [
      "Choose one low-risk project in your primary pathway and document what you enjoyed, learned and produced.",
      "Compare the subject combinations, learning demands and real work environments of your primary and secondary pathways.",
      "Review this profile with a parent, teacher or career counsellor before making a major subject or pathway decision.",
    ],
    importantContext: [
      "This is a developmental self-report for Competency Based Education learners, not a diagnosis or a prediction of career success.",
      "Scores indicate relative fit within this assessment and can change as interests, competencies, exposure and confidence develop.",
      "Do not choose a pathway from one score alone; combine this profile with school evidence, practical experience and qualified guidance.",
      "Subject combinations and progression requirements should be confirmed with the learner’s school and current official education guidance.",
    ],
    disclaimer:
      "The Profound IQ CareerPath Assessment is an educational guidance tool. It does not determine a learner’s career, replace a parent, teacher or counsellor, or guarantee future performance or employment.",
  };
}

export const COURSE_PRICE_KES = 4999;
export const COURSE_STAGE_AMOUNT_KES = 1250;
export const COURSE_PASS_MARK = 50;

export type CourseLesson = { id: string; title: string; summary: string; outcome: string };
export type CourseQuizQuestion = { id: string; prompt: string; options: string[]; correctOption: number };
export type CourseModule = { id: string; title: string; promise: string; lessons: CourseLesson[]; quiz: CourseQuizQuestion[] };
export type CourseDefinition = { slug: string; index: string; title: string; strapline: string; description: string; audience: string; duration: string; outcomes: readonly string[]; modules: CourseModule[] };

const lessonBlueprints = [
  ["Orientation and baseline", "Language of the discipline", "Signals in everyday work", "A practical diagnostic", "Case study: from friction to focus", "Guided reflection", "Applied field note"],
  ["The operating context", "Stakeholder perspectives", "The cost of drift", "Decision principles", "Case study: competing priorities", "Guided reflection", "Applied field note"],
  ["Patterns and behaviours", "Strengths under pressure", "Blind spots and defaults", "Trust-building habits", "Case study: the moment that matters", "Guided reflection", "Applied field note"],
  ["Designing the intervention", "From insight to intention", "Tools for structured practice", "Communicating the change", "Case study: a change in motion", "Guided reflection", "Applied field note"],
  ["Execution rhythms", "Planning for momentum", "Focus and sequencing", "Feedback loops", "Case study: making progress visible", "Guided reflection", "Applied field note"],
  ["Working through complexity", "Ambiguity and judgment", "Trade-offs and constraints", "Calm under pressure", "Case study: navigating uncertainty", "Guided reflection", "Applied field note"],
  ["Influence and alignment", "The architecture of a useful conversation", "Listening for what is unsaid", "Alignment without overreach", "Case study: the coalition", "Guided reflection", "Applied field note"],
  ["Measurement and learning", "Choosing meaningful evidence", "Leading indicators", "Reviewing outcomes", "Case study: learning from the data", "Guided reflection", "Applied field note"],
  ["Integration lab", "A personal operating model", "Transfer across contexts", "Responsible experimentation", "Case study: the 30-day shift", "Guided reflection", "Applied field note"],
  ["Capstone and continuation", "Synthesising the journey", "Presenting your point of view", "A sustainable practice", "Case study: from course to capability", "Guided reflection", "Applied field note"],
] as const;

const moduleThemes: Record<string, string[]> = {
  "Lead with Clarity": ["leadership identity", "strategic clarity", "self-awareness", "decision quality", "execution", "complexity", "influence", "measurement", "integration", "capstone leadership practice"],
  "Strategic Growth Mindset": ["growth orientation", "context and opportunity", "learning agility", "experimentation", "execution rhythm", "resilience", "collaboration", "evidence of growth", "integration", "capstone growth plan"],
  "Professional Presence & Influence": ["professional identity", "context and reputation", "authentic presence", "message design", "visibility", "difficult moments", "influence", "credibility", "integration", "capstone presence plan"],
  "From Insight to Action": ["insight baseline", "context and priorities", "behaviour change", "action design", "execution rhythm", "obstacles", "accountability", "measurement", "integration", "capstone action system"],
};

const quizQuestions = (courseSlug: string, moduleId: string, theme: string): CourseQuizQuestion[] => Array.from({ length: 15 }, (_, index) => ({
  id: `${courseSlug}-${moduleId}-q${index + 1}`,
  prompt: `Which practice best demonstrates ${theme} in a professional context?`,
  options: [
    `Apply a deliberate ${theme} practice, observe its effect, and adjust using evidence.`,
    "Wait for perfect certainty before taking any action.",
    "Treat the issue as fixed and avoid revisiting the decision.",
    "Delegate the responsibility without agreeing on an outcome.",
  ],
  correctOption: 0,
}));

const buildModules = (course: { slug: string; title: string }): CourseModule[] => lessonBlueprints.map((lessonTitles, moduleIndex) => {
  const moduleId = `module-${moduleIndex + 1}`;
  const theme = moduleThemes[course.title][moduleIndex];
  return {
    id: moduleId,
    title: `${moduleIndex + 1}. ${theme.replace(/\b\w/g, (letter) => letter.toUpperCase())}`,
    promise: `Build a repeatable professional practice for ${theme}, moving from informed reflection to visible application.`,
    lessons: lessonTitles.map((lessonTitle, lessonIndex) => ({
      id: `${course.slug}-${moduleId}-lesson-${lessonIndex + 1}`,
      title: lessonTitle,
      summary: `${lessonTitle} gives you a focused lens for applying ${theme} to real professional situations.`,
      outcome: `By the end of this lesson, you can explain, practise, and review one aspect of ${theme} with greater precision.`,
    })),
    quiz: quizQuestions(course.slug, moduleId, theme),
  };
});

const courseSeeds = [
  { slug: "lead-with-clarity", index: "01", title: "Lead with Clarity", strapline: "Decide with conviction. Align people around meaningful work.", description: "A rigorous leadership pathway for professionals who need to translate ambiguity into direction, trust, and coordinated action.", audience: "Emerging leaders, managers, founders, and professionals preparing for broader responsibility.", duration: "10 modules · 70 lessons · 10 applied quizzes", outcomes: ["Frame priorities when demands compete.", "Communicate decisions with context and conviction.", "Build a practical leadership operating model."] },
  { slug: "strategic-growth-mindset", index: "02", title: "Strategic Growth Mindset", strapline: "Turn change into a disciplined advantage.", description: "A globally relevant development course connecting learning agility, reflective practice, experimentation, and focused execution.", audience: "Professionals navigating change, transitions, new markets, or evolving responsibilities.", duration: "10 modules · 70 lessons · 10 applied quizzes", outcomes: ["Replace fixed assumptions with useful experiments.", "Create a sustainable rhythm for learning and execution.", "Use evidence to turn progress into repeatable capability."] },
  { slug: "professional-presence-influence", index: "03", title: "Professional Presence & Influence", strapline: "Make your contribution clear, credible, and useful.", description: "A practical course for professionals who want to communicate value, build trust, and influence outcomes with integrity.", audience: "Consultants, specialists, team leads, client-facing professionals, and career transitioners.", duration: "10 modules · 70 lessons · 10 applied quizzes", outcomes: ["Clarify the value you bring to a conversation.", "Strengthen executive communication and professional visibility.", "Influence without compromising authenticity or trust."] },
  { slug: "from-insight-to-action", index: "04", title: "From Insight to Action", strapline: "Make learning visible in the way you work.", description: "An applied intensive that helps you convert reflection into accountable action, useful measures, and sustained professional progress.", audience: "Modern achievers, coaches, project owners, and professionals with a development goal to execute.", duration: "10 modules · 70 lessons · 10 applied quizzes", outcomes: ["Translate personal insight into a practical action system.", "Sequence work around priorities and evidence.", "Build accountability that survives busy periods and setbacks."] },
] as const;

export const courseCatalog: CourseDefinition[] = courseSeeds.map((course) => ({ ...course, modules: buildModules(course) }));
export const getCourseBySlug = (slug: string) => courseCatalog.find((course) => course.slug === slug);

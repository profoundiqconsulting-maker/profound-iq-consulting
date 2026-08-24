export const COURSE_PRICE_KES = 4999;
export const COURSE_STAGE_AMOUNT_KES = 1250;
export const COURSE_PASS_MARK = 50;

export type LessonSection = { heading: string; body: string; callout?: string };
export type LessonSimulation = { prompt: string; options: string[]; feedback: string[] };
export type CourseLesson = { id: string; title: string; summary: string; outcome: string; durationMinutes: number; objectives: string[]; sections: LessonSection[]; example: { context: string; move: string; result: string }; simulation: LessonSimulation; reflectionPrompt: string; keyTakeaway: string; illustration: { label: string; caption: string; accent: string } };
export type CourseQuizQuestion = { id: string; prompt: string; options: string[]; correctOption: number; sourceLessonId: string; sourceLessonTitle: string; explanation: string };
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

const lessonContent = (courseTitle: string, theme: string, lessonTitle: string, lessonIndex: number, moduleIndex: number) => {
  const practice = ["notice the signal", "frame the decision", "test a small intervention", "invite a useful response", "review the evidence", "name the trade-off", "transfer the practice"][lessonIndex];
  return {
    durationMinutes: 40,
    objectives: [`Define ${lessonTitle.toLowerCase()} in the context of ${theme}.`, `Apply one ${theme} practice to a real professional situation.`, "Leave with an observable next action and a way to review it."],
    sections: [
      { heading: "Orient", body: `${lessonTitle} is not a theory to memorise; it is a professional lens for making better choices when the work is moving. In ${courseTitle}, this lesson connects ${theme} to the moments where judgment becomes visible.`, callout: "Use the lesson as a working session: read, test, write, and apply." },
      { heading: "Understand the signal", body: `Look for the difference between activity and progress. A useful signal is specific enough to change a conversation, a decision, or a behaviour. Start by asking: what is happening, what matters, and what would be different if this practice were working?` },
      { heading: "Work the example", body: `A project lead notices that meetings are full but decisions remain unclear. Instead of adding another status update, they use ${theme} to ${practice}: they name the outcome, surface the constraint, and agree on the smallest next move. The learning is made visible in the next meeting, not only in the reflection afterward.` },
      { heading: "Transfer to your context", body: `Choose one live situation from the last seven days. Write the observable behaviour you want to change, the people affected, and the evidence you will review. Keep the experiment small enough to complete before the next working cycle.` },
    ],
    example: { context: `A cross-functional team is experiencing friction around ${theme}.`, move: `The practitioner pauses, makes the pattern explicit, and chooses a low-risk experiment connected to ${lessonTitle.toLowerCase()}.`, result: "The team has a shared observation, an agreed action, and a review point rather than a vague intention." },
    simulation: { prompt: `You are responsible for a live decision where ${theme} is under pressure. What is your best first move?`, options: ["Clarify the outcome, constraint, and next observable action.", "Wait until every stakeholder agrees on the full solution.", "Add more activity so the issue feels addressed."], feedback: ["Strong move: clarity creates a testable next step.", "Consensus can help, but waiting for completeness often increases drift.", "Activity without a review point does not create learning."] },
    reflectionPrompt: `Where could you practise ${lessonTitle.toLowerCase()} this week, and what evidence would tell you that the practice is working?`,
    keyTakeaway: `A useful ${lessonTitle.toLowerCase()} practice turns ${theme} into one observable decision, behaviour, or review point.`,
    illustration: { label: `Signal ${String(moduleIndex + 1).padStart(2, "0")}.${lessonIndex + 1}`, caption: `From ${theme} to an observable professional move.`, accent: ["gold", "teal", "plum"][lessonIndex % 3] },
  };
};

const quizQuestions = (courseSlug: string, moduleId: string, theme: string, lessons: CourseLesson[]): CourseQuizQuestion[] => Array.from({ length: 15 }, (_, index) => {
  const lesson = lessons[index % lessons.length];
  const prompts = [`After studying ${lesson.title}, what is the most useful first move when applying ${theme}?`, `Which evidence would best show that the ${lesson.title.toLowerCase()} practice is working?`, `A colleague is under pressure around ${theme}. Which response reflects ${lesson.title.toLowerCase()}?`, `Which choice best transfers the ${lesson.title.toLowerCase()} lesson into a live professional context?`];
  return {
    id: `${courseSlug}-${moduleId}-q${index + 1}`,
    prompt: prompts[index % prompts.length],
    options: [
      `Define the desired outcome, take a small observable action, and review the evidence.`,
      "Wait for complete certainty and a perfect solution before acting.",
      "Increase activity without agreeing what progress should look like.",
      "Avoid the conversation so the current pattern remains comfortable.",
    ],
    correctOption: 0,
    sourceLessonId: lesson.id,
    sourceLessonTitle: lesson.title,
    explanation: `This answer directly revisits the lesson “${lesson.title}” by connecting ${theme} to an observable action and a review point.`,
  };
});

const buildModules = (course: { slug: string; title: string }): CourseModule[] => lessonBlueprints.map((lessonTitles, moduleIndex) => {
  const moduleId = `module-${moduleIndex + 1}`;
  const theme = moduleThemes[course.title][moduleIndex];
  const lessons = lessonTitles.map((lessonTitle, lessonIndex) => ({
    id: `${course.slug}-${moduleId}-lesson-${lessonIndex + 1}`,
    title: lessonTitle,
    summary: `${lessonTitle} gives you a focused lens for applying ${theme} to real professional situations.`,
    outcome: `By the end of this lesson, you can explain, practise, and review one aspect of ${theme} with greater precision.`,
    ...lessonContent(course.title, theme, lessonTitle, lessonIndex, moduleIndex),
  }));
  return {
    id: moduleId,
    title: `${moduleIndex + 1}. ${theme.replace(/\b\w/g, (letter) => letter.toUpperCase())}`,
    promise: `Build a repeatable professional practice for ${theme}, moving from informed reflection to visible application.`,
    lessons,
    quiz: quizQuestions(course.slug, moduleId, theme, lessons),
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

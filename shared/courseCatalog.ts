export const COURSE_PRICE_KES = 4999;
export const COURSE_STAGE_AMOUNT_KES = 1250;
export const COURSE_PASS_MARK = 50;

export type LessonSection = { heading: string; body: string; callout?: string };
export type LessonSimulation = { prompt: string; options: string[]; feedback: string[] };
export type CourseLesson = { id: string; title: string; summary: string; outcome: string; durationMinutes: number; objectives: string[]; sections: LessonSection[]; example: { context: string; move: string; result: string }; simulation: LessonSimulation; reflectionPrompt: string; keyTakeaway: string; illustration: { label: string; caption: string; accent: string } };
export type CourseQuizQuestion = { id: string; prompt: string; options: string[]; correctOption: number; sourceLessonId: string; sourceLessonTitle: string; explanation: string };
export type CourseModule = { id: string; title: string; promise: string; lessons: CourseLesson[]; quiz: CourseQuizQuestion[] };
export type CourseDefinition = { slug: string; index: string; title: string; strapline: string; description: string; audience: string; duration: string; outcomes: readonly string[]; priceKes: number; stageAmountsKes: readonly number[]; modules: CourseModule[] };

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
  "Professional Certificate in International Curriculum Pedagogy": ["modern pedagogy and learner-centred practice", "British National Curriculum", "International Baccalaureate", "American Curriculum", "Cambridge and IGCSE", "Christian education and homeschooling", "Pearson Edexcel and comparative curriculum design", "early years and integrated approaches", "counselling, law, professionalism and entrepreneurship", "research, technology and assessment"],
};

const lessonContent = (courseTitle: string, theme: string, lessonTitle: string, lessonIndex: number, moduleIndex: number) => {
  const practice = ["notice the signal", "frame the decision", "test a small intervention", "invite a useful response", "review the evidence", "name the trade-off", "transfer the practice"][lessonIndex];
  return {
    durationMinutes: 40,
    objectives: [`Define ${lessonTitle.toLowerCase()} in the context of ${theme}.`, `Apply one ${theme} practice to a real professional situation.`, "Leave with an observable next action and a way to review it."],
    sections: [
      { heading: lessonIndex % 2 === 0 ? "Orient the lens" : "Start with the moment", body: `${lessonTitle} is not a theory to memorise; it is a professional lens for making better choices when the work is moving. In ${courseTitle}, this lesson connects ${theme} to the moments where judgment becomes visible.`, callout: lessonIndex % 2 === 0 ? "Use the lesson as a working session: read, test, write, and apply." : "Begin with one real moment from your week; specificity makes the practice useful." },
      { heading: lessonIndex % 3 === 0 ? "Notice the pattern" : "Read the signal", body: lessonIndex % 3 === 0 ? `Map what is happening before deciding what to fix. Notice the trigger, the default response, and the consequence; then ask which part of the pattern is within your influence.` : `Separate activity from progress. A useful signal is specific enough to change a conversation, decision, or behaviour. Ask what matters and what would be different if ${theme} were working.` },
      { heading: lessonIndex % 2 === 0 ? "Study the case" : "Test the move", body: `A project lead notices that meetings are full but decisions remain unclear. Instead of adding another status update, they use ${theme} to ${practice}: they name the outcome, surface the constraint, and agree on the smallest next move. The learning is made visible in the next working cycle.` },
      { heading: lessonIndex % 3 === 1 ? "Run a small experiment" : "Transfer to your context", body: `Choose one live situation from the last seven days. Write the observable behaviour you want to change, the people affected, and the evidence you will review. Keep the experiment small enough to complete before the next working cycle, then record what you learned.` },
    ],
    example: { context: `A cross-functional team is experiencing friction around ${theme}.`, move: `The practitioner pauses, makes the pattern explicit, and chooses a low-risk experiment connected to ${lessonTitle.toLowerCase()}.`, result: "The team has a shared observation, an agreed action, and a review point rather than a vague intention." },
    simulation: { prompt: [`You are responsible for a live decision where ${theme} is under pressure. What is your best first move?`, `A working pattern around ${theme} is slowing the team. Which intervention creates learning without overcorrecting?`, `You have one conversation to make ${lessonTitle.toLowerCase()} visible. What should you do?`][lessonIndex % 3], options: [
      ["Clarify the outcome, constraint, and next observable action.", "Wait until every stakeholder agrees on the full solution.", "Add more activity so the issue feels addressed."],
      ["Name the pattern, choose a low-risk experiment, and agree how to review it.", "Redesign the entire process before testing one assumption.", "Ignore the pattern until the next formal review."],
      ["Describe the evidence, invite the relevant perspective, and confirm one next move.", "Give a long explanation without asking for a response.", "Avoid the difficult point and hope the context improves."],
    ][lessonIndex % 3], feedback: [
      ["Strong move: clarity creates a testable next step.", "Consensus can help, but waiting for completeness often increases drift.", "Activity without a review point does not create learning."],
      ["Strong move: a small experiment creates evidence without pretending certainty.", "Large redesigns can hide which assumption was actually tested.", "Avoidance preserves the pattern rather than helping the team learn."],
      ["Strong move: evidence and a confirmed next move turn insight into action.", "Explanation without exchange does not create alignment.", "Avoidance leaves the underlying pattern unexamined."],
    ][lessonIndex % 3] },
    reflectionPrompt: `Where could you practise ${lessonTitle.toLowerCase()} this week, and what evidence would tell you that the practice is working?`,
    keyTakeaway: `A useful ${lessonTitle.toLowerCase()} practice turns ${theme} into one observable decision, behaviour, or review point.`,
    illustration: { label: `Signal ${String(moduleIndex + 1).padStart(2, "0")}.${lessonIndex + 1}`, caption: `From ${theme} to an observable professional move.`, accent: ["gold", "teal", "plum"][lessonIndex % 3] },
  };
};

const quizQuestions = (courseSlug: string, moduleId: string, theme: string, lessons: CourseLesson[]): CourseQuizQuestion[] => Array.from({ length: 15 }, (_, index) => {
  const lesson = lessons[index % lessons.length];
  const prompts = [`After studying ${lesson.title}, what is the most useful first move when applying ${theme}?`, `Which evidence would best show that the ${lesson.title.toLowerCase()} practice is working?`, `A colleague is under pressure around ${theme}. Which response reflects ${lesson.title.toLowerCase()}?`, `Which choice best transfers the ${lesson.title.toLowerCase()} lesson into a live professional context?`];
  const answerSets = [
    [`Name the intended outcome, choose one observable move, and set a review point.`, "Collect more information until the decision feels completely risk-free.", "Add more meetings without changing the underlying working pattern.", "Leave the current approach untouched so no one has to adapt."],
    ["A broad sense that the team is busy and committed.", `A visible change connected to ${lesson.title.toLowerCase()} that can be reviewed in the next work cycle.`, "A polished document that no one uses to make a decision.", "A promise to revisit the issue when the pressure has passed."],
    ["Offer a generic motivational message and move on quickly.", "Take ownership of the entire situation so others do not need to contribute.", `Make the ${lesson.title.toLowerCase()} pattern explicit, then agree on a small next experiment.`, "Delay the conversation until every possible objection has been resolved."],
    ["Memorise the terminology and repeat it in a presentation.", "Wait for a formal programme before applying the lesson.", "Copy another professional's solution without checking the local context.", `Apply ${lesson.title.toLowerCase()} to one live decision, behaviour, or review conversation and inspect the result.`],
  ];
  const correctPosition = (index * 3 + moduleId.length) % 4;
  const base = answerSets[index % answerSets.length];
  const options = [...base];
  const [correctAnswer] = options.splice(index % 4, 1);
  options.splice(correctPosition, 0, correctAnswer);
  return {
    id: `${courseSlug}-${moduleId}-q${index + 1}`,
    prompt: prompts[index % prompts.length],
    options,
    correctOption: correctPosition,
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

const icpcLessonBlueprints = [
  ["Modern pedagogy: the changing classroom", "Learner-centred design", "Questioning and dialogue", "Differentiation in practice", "Inclusive classroom routines", "Micro-teaching simulation", "Reflective teaching journal"],
  ["British National Curriculum: structure and intent", "Key stages and progression", "Planning from attainment targets", "Subject knowledge and sequencing", "Adaptive teaching in a British classroom", "Assessment for learning", "British curriculum case clinic"],
  ["International Baccalaureate: learner profile", "Inquiry-based learning", "Concept-driven planning", "Approaches to teaching", "Interdisciplinary connections", "The extended learning journey", "IB unit design studio"],
  ["American Curriculum: standards and pathways", "Standards-aligned planning", "Credit, grade and progression logic", "Differentiated instruction", "Project-based learning", "College and career readiness", "American classroom case clinic"],
  ["Cambridge and IGCSE: rigour with context", "Cambridge learner attributes", "Syllabus interpretation", "Command words and exam literacy", "Practical and coursework assessment", "Global perspectives in delivery", "IGCSE scheme-of-work studio"],
  ["Alternative Christian education: values and formation", "Education through a Christian worldview", "Character and service learning", "Curriculum integration", "Homeschooling models and routines", "Family partnership and safeguarding", "Designing a home learning pathway"],
  ["Pearson Edexcel: specifications to outcomes", "Reading a Pearson specification", "Assessment objectives", "Coursework and evidence", "Progression and feedback", "Comparing international pathways", "Comparative curriculum advisory simulation"],
  ["Early years: Montessori and Reggio Emilia", "HighScope and active learning", "Play-based curriculum design", "Waldorf education", "Integrated approaches", "Observation and learning stories", "Early years environment studio"],
  ["Counselling dynamics in curriculum delivery", "Types and boundaries of counselling", "Principles of helping conversations", "The counselling process", "Legal aspects of education", "Professional development and aptitudes", "Entrepreneurship for educators"],
  ["Research and technology in education", "Emerging technologies and data science", "Artificial intelligence and ethics", "IoT, cloud and cybersecurity", "Learning management systems", "AR, VR, 3D printing and gamification", "Research design, assessment and presentation"],
] as const;

const icpcModuleThemes = [
  "modern pedagogy and learner-centred practice", "British National Curriculum", "International Baccalaureate", "American Curriculum", "Cambridge and IGCSE", "Christian education and homeschooling", "Pearson Edexcel and comparative curriculum design", "early years and integrated approaches", "counselling, law, professionalism and entrepreneurship", "research, technology and assessment",
] as const;

const icpcQuizQuestions = (courseSlug: string, moduleId: string, theme: string, lessons: CourseLesson[]): CourseQuizQuestion[] => Array.from({ length: 15 }, (_, index) => {
  const lesson = lessons[index % lessons.length];
  const stems = [
    `Which practice best demonstrates ${lesson.title.toLowerCase()} within ${theme}?`,
    `A teacher is planning around ${theme}. What evidence would best show that ${lesson.title.toLowerCase()} is working?`,
    `Which decision most responsibly applies ${lesson.title.toLowerCase()} in an international curriculum context?`,
    `What is the strongest next move when a learner needs support with ${lesson.title.toLowerCase()}?`,
  ];
  const correctAnswers = [
    "Make the learning intention visible, adapt to learner evidence, and review the impact.",
    "A documented change in learner participation or understanding that can be reviewed against the intended outcome.",
    "Interpret the curriculum requirement in context, then align teaching, learning evidence, and learner needs.",
    "Use a purposeful intervention, invite learner voice, and gather evidence before deciding what to adjust.",
  ];
  const distractors = [
    ["Deliver the same activity to everyone and judge effort at the end.", "Choose a fashionable method without checking the intended learning.", "Wait for a formal inspection before responding to learner evidence."],
    ["A full timetable with every minute occupied.", "A polished scheme of work that is never revisited.", "A high-stakes result without diagnostic evidence."],
    ["Copy a different system without checking its assumptions.", "Treat the syllabus as a script that cannot be adapted.", "Separate assessment from the learning experience entirely."],
    ["Give the learner more worksheets without diagnosing the barrier.", "Remove challenge so the learner cannot experience productive struggle.", "Delay the conversation until the term has ended."],
  ];
  const correctPosition = (index * 5 + moduleId.length) % 4;
  const options = [...distractors[index % distractors.length], correctAnswers[index % correctAnswers.length]];
  const correct = options.pop()!;
  options.splice(correctPosition, 0, correct);
  return { id: `${courseSlug}-${moduleId}-q${index + 1}`, prompt: stems[index % stems.length], options, correctOption: correctPosition, sourceLessonId: lesson.id, sourceLessonTitle: lesson.title, explanation: `This question is aligned to ${lesson.title} and tests whether the learner can connect ${theme} to an observable teaching, learning, or assessment decision.` };
});

const buildIcpcModules = (course: { slug: string; title: string }): CourseModule[] => icpcLessonBlueprints.map((lessonTitles, moduleIndex) => {
  const theme = icpcModuleThemes[moduleIndex];
  const lessons = lessonTitles.map((lessonTitle, lessonIndex) => ({
    id: `${course.slug}-module-${moduleIndex + 1}-lesson-${lessonIndex + 1}`,
    title: lessonTitle,
    summary: `${lessonTitle} turns ${theme} into a practical international-school teaching decision.`,
    outcome: `By the end of this 40-minute studio, you can apply ${lessonTitle.toLowerCase()} to a learner, lesson, curriculum, or assessment context.`,
    ...lessonContent(course.title, theme, lessonTitle, lessonIndex, moduleIndex),
    sections: [
      { heading: "Orient the practice", body: `This studio positions ${lessonTitle.toLowerCase()} within ${theme}. Start with the intended learner experience, then identify what the teacher must make visible, what evidence matters, and where professional judgment is required.`, callout: "Work like a curriculum designer: frame, test, observe, adjust." },
      { heading: "Compare the systems", body: `International curricula are not interchangeable labels. Compare the assumptions, progression logic, teaching choices, and assessment expectations that shape ${theme}; then name which parts can transfer and which must remain context-specific.` },
      { heading: "Try the classroom move", body: `Use the case of a mixed-readiness class preparing for a demanding learning outcome. Choose one adaptation, explain why it fits the curriculum context, and decide what learner evidence you will review before the next lesson.` },
      { heading: "Studio challenge", body: `Draft a compact teaching artefact: a lesson intention, learner activity, formative check, and feedback move. Use the simulation to test the design, then revise one assumption based on the feedback.` },
      { heading: "Transfer and review", body: `Apply the practice to one real class, tutoring session, home-learning routine, or curriculum consultation. Record the learner response, the evidence gathered, and the next adjustment so the practice becomes a repeatable professional skill.` },
    ],
    simulation: { prompt: `You are designing a learning experience for ${theme}. Which move best protects learner agency while keeping the intended outcome clear?`, options: ["Make the outcome explicit, offer meaningful choices, and use evidence to adjust the next step.", "Give learners unlimited choice without a shared outcome or review point.", "Follow a fixed script even when learner evidence shows the design is not working."], feedback: ["Strong move: agency and intentional design can coexist when evidence guides adaptation.", "Choice without direction can create activity without learning.", "Consistency matters, but a fixed script is not the same as responsive teaching."] },
    reflectionPrompt: `Which learner, curriculum, or assessment decision could you improve using ${lessonTitle.toLowerCase()}, and what evidence will you review?`,
    keyTakeaway: `${lessonTitle} becomes valuable when it changes one observable teaching decision and creates evidence for the next adjustment.`,
    illustration: { label: `ICPC ${String(moduleIndex + 1).padStart(2, "0")}.${lessonIndex + 1}`, caption: `A practical signal for ${theme}.`, accent: ["gold", "teal", "plum"][lessonIndex % 3] },
  }));
  return { id: `module-${moduleIndex + 1}`, title: `${moduleIndex + 1}. ${theme.replace(/\b\w/g, (letter) => letter.toUpperCase())}`, promise: `Translate ${theme} into a globally aware, learner-centred professional practice.`, lessons, quiz: icpcQuizQuestions(course.slug, `module-${moduleIndex + 1}`, theme, lessons) };
});

const courseSeeds = [
  { slug: "lead-with-clarity", index: "01", title: "Lead with Clarity", strapline: "Decide with conviction. Align people around meaningful work.", description: "A rigorous leadership pathway for professionals who need to translate ambiguity into direction, trust, and coordinated action.", audience: "Emerging leaders, managers, founders, and professionals preparing for broader responsibility.", duration: "10 modules · 70 lessons · 10 applied quizzes", outcomes: ["Frame priorities when demands compete.", "Communicate decisions with context and conviction.", "Build a practical leadership operating model."], priceKes: COURSE_PRICE_KES, stageAmountsKes: [COURSE_STAGE_AMOUNT_KES, COURSE_STAGE_AMOUNT_KES, COURSE_STAGE_AMOUNT_KES, COURSE_STAGE_AMOUNT_KES] },
  { slug: "strategic-growth-mindset", index: "02", title: "Strategic Growth Mindset", strapline: "Turn change into a disciplined advantage.", description: "A globally relevant development course connecting learning agility, reflective practice, experimentation, and focused execution.", audience: "Professionals navigating change, transitions, new markets, or evolving responsibilities.", duration: "10 modules · 70 lessons · 10 applied quizzes", outcomes: ["Replace fixed assumptions with useful experiments.", "Create a sustainable rhythm for learning and execution.", "Use evidence to turn progress into repeatable capability."], priceKes: COURSE_PRICE_KES, stageAmountsKes: [COURSE_STAGE_AMOUNT_KES, COURSE_STAGE_AMOUNT_KES, COURSE_STAGE_AMOUNT_KES, COURSE_STAGE_AMOUNT_KES] },
  { slug: "professional-presence-influence", index: "03", title: "Professional Presence & Influence", strapline: "Make your contribution clear, credible, and useful.", description: "A practical course for professionals who want to communicate value, build trust, and influence outcomes with integrity.", audience: "Consultants, specialists, team leads, client-facing professionals, and career transitioners.", duration: "10 modules · 70 lessons · 10 applied quizzes", outcomes: ["Clarify the value you bring to a conversation.", "Strengthen executive communication and professional visibility.", "Influence without compromising authenticity or trust."], priceKes: COURSE_PRICE_KES, stageAmountsKes: [COURSE_STAGE_AMOUNT_KES, COURSE_STAGE_AMOUNT_KES, COURSE_STAGE_AMOUNT_KES, COURSE_STAGE_AMOUNT_KES] },
  { slug: "from-insight-to-action", index: "04", title: "From Insight to Action", strapline: "Make learning visible in the way you work.", description: "An applied intensive that helps you convert reflection into accountable action, useful measures, and sustained professional progress.", audience: "Modern achievers, coaches, project owners, and professionals with a development goal to execute.", duration: "10 modules · 70 lessons · 10 applied quizzes", outcomes: ["Translate personal insight into a practical action system.", "Sequence work around priorities and evidence.", "Build accountability that survives busy periods and setbacks."], priceKes: COURSE_PRICE_KES, stageAmountsKes: [COURSE_STAGE_AMOUNT_KES, COURSE_STAGE_AMOUNT_KES, COURSE_STAGE_AMOUNT_KES, COURSE_STAGE_AMOUNT_KES] },
  { slug: "professional-certificate-international-curriculum-pedagogy", index: "05", title: "Professional Certificate in International Curriculum Pedagogy", strapline: "Design learning that travels across systems, cultures, and classrooms.", description: "A document-grounded professional certificate connecting modern pedagogy with British, IB, American, Cambridge/IGCSE, Christian, homeschooling, Pearson Edexcel, early-years, counselling, research, technology, and assessment practice.", audience: "Teachers, curriculum leaders, school founders, tutors, education consultants, counsellors, and professionals working across international learning contexts.", duration: "10 modules · 70 lessons · 10 applied quizzes · 400 guided minutes", outcomes: ["Identify the structure and intent of major international curricula.", "Select learner-centred teaching and assessment methods for different curriculum contexts.", "Use counselling, professionalism, research, and educational technology to improve curriculum delivery."], priceKes: 14999, stageAmountsKes: [3750, 3750, 3750, 3749] },
] as const;

export const courseCatalog: CourseDefinition[] = courseSeeds.map((course) => ({ ...course, modules: course.slug === "professional-certificate-international-curriculum-pedagogy" ? buildIcpcModules(course) : buildModules(course) }));
export const getCourseBySlug = (slug: string) => courseCatalog.find((course) => course.slug === slug);

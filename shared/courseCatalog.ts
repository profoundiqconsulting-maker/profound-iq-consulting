export const COURSE_PRICE_KES = 4999;
export const COURSE_STAGE_AMOUNT_KES = 1250;
export const STANDARD_COURSE_PRICE_KES = 4999;
export const STANDARD_COURSE_STAGE_AMOUNTS_KES = [1250, 1250, 1250, 1249] as const;
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
  const theme = moduleThemes[course.title]?.[moduleIndex] ?? extendedModuleThemes[course.slug]?.[moduleIndex] ?? `${course.title.toLowerCase()} practice ${moduleIndex + 1}`;
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


const extendedModuleThemes: Record<string, readonly string[]> = {
  "personal-growth-self-discovery": ["self-awareness foundations", "values and identity", "strengths and patterns", "purpose and direction", "emotional signals", "reflective practice", "healthy boundaries", "growth experiments", "integration habits", "personal growth capstone"],
  "building-a-growth-mindset": ["growth assumptions", "learning from feedback", "productive challenge", "experimentation", "progress language", "resilience in practice", "curiosity and inquiry", "collaborative learning", "evidence of growth", "growth mindset capstone"],
  "continuous-self-improvement": ["improvement principles", "baseline and priorities", "habit architecture", "deliberate practice", "feedback loops", "energy and focus", "learning systems", "review and adjustment", "transfer into work", "continuous improvement capstone"],
  "mastering-self-discipline": ["discipline foundations", "commitment and intention", "attention management", "friction and environment", "execution routines", "delayed gratification", "recovery after lapses", "accountability systems", "consistency under pressure", "self-discipline capstone"],
  "mastering-time-management": ["time awareness", "priority architecture", "planning horizons", "focus blocks", "workflow design", "delegation and boundaries", "meeting and communication time", "reviewing capacity", "sustainable productivity", "time mastery capstone"],
  "personal-finance-management-essentials": ["financial foundations", "cash-flow awareness", "budget design", "saving systems", "debt decisions", "risk and protection", "responsible investing", "financial goals", "review and resilience", "personal finance capstone"],
  "self-confidence-and-self-esteem": ["confidence foundations", "self-talk and evidence", "strengths in action", "courageous practice", "visibility and voice", "boundaries and assertiveness", "setbacks and recovery", "trusting decisions", "confidence rituals", "confidence capstone"],
  "emotional-intelligence-mastery": ["emotional intelligence foundations", "self-awareness", "emotional regulation", "empathy and perspective", "active listening", "social awareness", "relationship management", "difficult conversations", "emotional culture", "emotional intelligence capstone"],
  "personal-brand-strategy": ["brand foundations", "positioning and value", "audience insight", "credible storytelling", "digital presence", "thought leadership", "networking and visibility", "reputation management", "brand consistency", "personal brand capstone"],
  "personal-excellence-mastery": ["excellence principles", "standards and values", "quality of execution", "ownership and initiative", "focus and follow-through", "feedback and refinement", "professional judgement", "service and impact", "sustained excellence", "personal excellence capstone"],
  "effective-communication-essentials": ["communication foundations", "message architecture", "listening for meaning", "clarity and brevity", "written communication", "difficult messages", "influence with integrity", "feedback conversations", "cross-cultural communication", "communication capstone"],
  "lasting-interpersonal-relationships": ["relationship foundations", "trust and reliability", "presence and listening", "boundaries and respect", "reciprocity and support", "repair after tension", "diverse perspectives", "relationship habits", "long-term connection", "relationships capstone"],
  "building-thriving-business-empires": ["entrepreneurial foundations", "problem and opportunity", "customer discovery", "value proposition", "business model design", "operations and systems", "people and culture", "finance and growth", "responsible scale", "enterprise-building capstone"],
  "negotiation-mastery": ["negotiation foundations", "interests and alternatives", "preparation and leverage", "questions and listening", "value creation", "offers and concessions", "difficult dynamics", "ethical influence", "closing and implementation", "negotiation capstone"],
  "critical-thinking-problem-solving": ["thinking foundations", "framing the problem", "evidence and assumptions", "root-cause analysis", "creative options", "decision criteria", "testing solutions", "bias and judgement", "implementation learning", "problem-solving capstone"],
  "creativity-and-innovation": ["creative confidence", "observation and insight", "idea generation", "divergent thinking", "convergent selection", "prototyping", "experimentation", "innovation collaboration", "adoption and scale", "innovation capstone"],
  "teamwork-and-collaboration": ["team foundations", "shared purpose", "roles and contribution", "collaborative routines", "psychological safety", "disagreement as data", "distributed ownership", "team learning", "high-performance habits", "collaboration capstone"],
  "leadership-and-self-leadership": ["leadership identity", "self-leadership", "direction and priorities", "responsibility and trust", "decision courage", "leading conversations", "developing others", "change leadership", "leadership presence", "leadership capstone"],
  "adaptability-and-resilience": ["adaptability foundations", "reading change", "flexible thinking", "resilience resources", "responding under pressure", "learning from disruption", "uncertainty and action", "support networks", "renewal and recovery", "resilience capstone"],
  "time-management-personal-productivity": ["productivity foundations", "outcome-based planning", "attention and energy", "workflow systems", "prioritisation under pressure", "digital organisation", "collaboration capacity", "review and optimisation", "sustainable output", "productivity capstone"],
  "decision-making-skills": ["decision foundations", "clarifying choices", "evidence and uncertainty", "criteria and trade-offs", "bias-aware judgement", "inclusive decisions", "speed and reversibility", "communicating decisions", "learning from outcomes", "decision capstone"],
  "conflict-resolution-negotiation": ["conflict foundations", "diagnosing tension", "interests and needs", "de-escalation", "dialogue and listening", "options for resolution", "fair agreements", "repair and trust", "prevention systems", "conflict resolution capstone"],
  "interpersonal-and-relationship-skills": ["relational foundations", "presence and rapport", "listening and questions", "empathy in action", "clear boundaries", "feedback and care", "influence and respect", "repair and accountability", "relationship maintenance", "relationship skills capstone"],
  "digital-literacy-and-etiquette": ["digital foundations", "information quality", "online safety", "professional platforms", "clear digital writing", "virtual meeting practice", "privacy and consent", "digital identity", "responsible technology", "digital literacy capstone"],
  "presentation-and-public-speaking": ["speaker foundations", "audience and purpose", "story architecture", "visual explanation", "voice and presence", "handling questions", "facilitation and engagement", "virtual presentation", "rehearsal and feedback", "presentation capstone"],
  "professionalism-and-workplace-ethics": ["professional foundations", "values and conduct", "reliability and ownership", "ethical judgement", "confidentiality and trust", "respect and inclusion", "professional boundaries", "speaking up responsibly", "reputation and accountability", "workplace ethics capstone"],
  "career-development-employability": ["career direction", "skills and evidence", "opportunity research", "career narratives", "CV and portfolio", "interviews and selection", "networking and sponsorship", "career transitions", "ongoing employability", "career development capstone"],
  "entrepreneurial-mindset": ["entrepreneurial orientation", "opportunity recognition", "customer empathy", "testing assumptions", "resourcefulness", "risk and learning", "resilient execution", "value creation", "entrepreneurial collaboration", "entrepreneurial mindset capstone"],
};

const courseSeeds = [
  { slug: "lead-with-clarity", index: "01", title: "Lead with Clarity", strapline: "Decide with conviction. Align people around meaningful work.", description: "A rigorous leadership pathway for professionals who need to translate ambiguity into direction, trust, and coordinated action.", audience: "Emerging leaders, managers, founders, and professionals preparing for broader responsibility.", duration: "10 modules · 70 lessons · 10 applied quizzes", outcomes: ["Frame priorities when demands compete.", "Communicate decisions with context and conviction.", "Build a practical leadership operating model."], priceKes: COURSE_PRICE_KES, stageAmountsKes: [COURSE_STAGE_AMOUNT_KES, COURSE_STAGE_AMOUNT_KES, COURSE_STAGE_AMOUNT_KES, COURSE_STAGE_AMOUNT_KES] },
  { slug: "strategic-growth-mindset", index: "02", title: "Strategic Growth Mindset", strapline: "Turn change into a disciplined advantage.", description: "A globally relevant development course connecting learning agility, reflective practice, experimentation, and focused execution.", audience: "Professionals navigating change, transitions, new markets, or evolving responsibilities.", duration: "10 modules · 70 lessons · 10 applied quizzes", outcomes: ["Replace fixed assumptions with useful experiments.", "Create a sustainable rhythm for learning and execution.", "Use evidence to turn progress into repeatable capability."], priceKes: COURSE_PRICE_KES, stageAmountsKes: [COURSE_STAGE_AMOUNT_KES, COURSE_STAGE_AMOUNT_KES, COURSE_STAGE_AMOUNT_KES, COURSE_STAGE_AMOUNT_KES] },
  { slug: "professional-presence-influence", index: "03", title: "Professional Presence & Influence", strapline: "Make your contribution clear, credible, and useful.", description: "A practical course for professionals who want to communicate value, build trust, and influence outcomes with integrity.", audience: "Consultants, specialists, team leads, client-facing professionals, and career transitioners.", duration: "10 modules · 70 lessons · 10 applied quizzes", outcomes: ["Clarify the value you bring to a conversation.", "Strengthen executive communication and professional visibility.", "Influence without compromising authenticity or trust."], priceKes: COURSE_PRICE_KES, stageAmountsKes: [COURSE_STAGE_AMOUNT_KES, COURSE_STAGE_AMOUNT_KES, COURSE_STAGE_AMOUNT_KES, COURSE_STAGE_AMOUNT_KES] },
  { slug: "from-insight-to-action", index: "04", title: "From Insight to Action", strapline: "Make learning visible in the way you work.", description: "An applied intensive that helps you convert reflection into accountable action, useful measures, and sustained professional progress.", audience: "Modern achievers, coaches, project owners, and professionals with a development goal to execute.", duration: "10 modules · 70 lessons · 10 applied quizzes", outcomes: ["Translate personal insight into a practical action system.", "Sequence work around priorities and evidence.", "Build accountability that survives busy periods and setbacks."], priceKes: COURSE_PRICE_KES, stageAmountsKes: [COURSE_STAGE_AMOUNT_KES, COURSE_STAGE_AMOUNT_KES, COURSE_STAGE_AMOUNT_KES, COURSE_STAGE_AMOUNT_KES] },
  { slug: "professional-certificate-international-curriculum-pedagogy", index: "05", title: "Professional Certificate in International Curriculum Pedagogy", strapline: "Design learning that travels across systems, cultures, and classrooms.", description: "A document-grounded professional certificate connecting modern pedagogy with British, IB, American, Cambridge/IGCSE, Christian, homeschooling, Pearson Edexcel, early-years, counselling, research, technology, and assessment practice.", audience: "Teachers, curriculum leaders, school founders, tutors, education consultants, counsellors, and professionals working across international learning contexts.", duration: "10 modules · 70 lessons · 10 applied quizzes · 400 guided minutes", outcomes: ["Identify the structure and intent of major international curricula.", "Select learner-centred teaching and assessment methods for different curriculum contexts.", "Use counselling, professionalism, research, and educational technology to improve curriculum delivery."], priceKes: 14999, stageAmountsKes: [3750, 3750, 3750, 3749] },
] as const;


const additionalCourseSeeds = [
  { slug: "personal-growth-self-discovery", index: "06", title: "Personal Growth & Self-Discovery", strapline: "Understand your inner operating system and choose your next chapter with intention.", description: "A guided development journey for turning self-awareness into practical direction, healthier patterns, and purposeful action.", audience: "Learners, emerging professionals, coaches, and anyone ready to make personal development more deliberate.", outcomes: ["Clarify personal values, strengths, and direction.", "Recognise patterns that shape choices and relationships.", "Build a practical personal growth rhythm."],
  },
  { slug: "building-a-growth-mindset", index: "07", title: "Building a Growth Mindset", strapline: "Turn challenge, feedback, and change into a disciplined learning advantage.", description: "A practical course for replacing limiting assumptions with curiosity, experimentation, resilience, and evidence-led progress.", audience: "Students, professionals, managers, and teams navigating change or new responsibilities.", outcomes: ["Use feedback and challenge as inputs for improvement.", "Design small experiments that build capability.", "Create language and routines that support growth."],
  },
  { slug: "continuous-self-improvement", index: "08", title: "The Practice of Continuous Self-Improvement", strapline: "Build the habits, reviews, and feedback loops that keep progress moving.", description: "A structured improvement system for converting intentions into deliberate practice and sustainable personal capability.", audience: "Professionals, learners, founders, and development-minded leaders.", outcomes: ["Create a realistic improvement baseline.", "Use deliberate practice and feedback loops.", "Review progress and adjust without losing momentum."],
  },
  { slug: "mastering-self-discipline", index: "09", title: "Mastering Self-Discipline", strapline: "Make important actions easier to start, repeat, and finish.", description: "An applied course on commitment, attention, environment design, recovery, and accountable execution.", audience: "Professionals, students, entrepreneurs, and anyone managing competing priorities.", outcomes: ["Design routines that reduce friction.", "Recover constructively after lapses.", "Sustain execution under pressure."],
  },
  { slug: "mastering-time-management", index: "10", title: "Mastering Time Management", strapline: "Protect attention, sequence priorities, and create capacity for meaningful work.", description: "A modern time-management system linking planning, focus, boundaries, collaboration, and sustainable productivity.", audience: "Busy professionals, managers, students, and independent practitioners.", outcomes: ["Translate priorities into realistic plans.", "Protect focus and manage interruptions.", "Review capacity and improve the way time is used."],
  },
  { slug: "personal-finance-management-essentials", index: "11", title: "Personal Finance Management Essentials", strapline: "Build clear, responsible habits for managing money and future choices.", description: "A foundational financial capability course covering cash flow, budgets, saving, debt, risk, goals, and responsible decision-making.", audience: "Young professionals, families, students, entrepreneurs, and learners building financial confidence.", outcomes: ["Read and manage personal cash flow.", "Build practical saving and debt strategies.", "Connect financial decisions to values and goals."],
  },
  { slug: "self-confidence-and-self-esteem", index: "12", title: "Building Self-Confidence & Self-Esteem", strapline: "Trust your contribution, use your voice, and act with grounded confidence.", description: "A practical confidence-building programme based on evidence, courageous practice, boundaries, visibility, and recovery.", audience: "Learners, professionals, leaders, and career transitioners.", outcomes: ["Separate confidence from perfection.", "Practise assertive, visible contribution.", "Build evidence-based self-trust."],
  },
  { slug: "emotional-intelligence-mastery", index: "13", title: "Mastering Emotional Intelligence", strapline: "Read emotion well, regulate with intention, and strengthen human connection.", description: "An applied emotional-intelligence course for improving self-awareness, empathy, communication, and relationship management.", audience: "Leaders, educators, client-facing professionals, teams, and aspiring managers.", outcomes: ["Recognise emotional signals and triggers.", "Regulate responses under pressure.", "Use empathy and dialogue to improve relationships."],
  },
  { slug: "personal-brand-strategy", index: "14", title: "Building a Distinctive Personal Brand", strapline: "Make your value clear, credible, and memorable across the moments that matter.", description: "A strategic personal-brand course covering positioning, narrative, visibility, digital presence, reputation, and authentic influence.", audience: "Professionals, consultants, founders, creatives, and career transitioners.", outcomes: ["Clarify positioning and value.", "Build a coherent professional narrative.", "Increase visibility without compromising integrity."],
  },
  { slug: "personal-excellence-mastery", index: "15", title: "Mastering Personal Excellence", strapline: "Raise the quality of your choices, execution, and contribution.", description: "A rigorous personal-excellence pathway focused on standards, ownership, judgement, feedback, service, and sustained impact.", audience: "High-potential professionals, leaders, specialists, and ambitious learners.", outcomes: ["Set meaningful standards for quality.", "Strengthen ownership and follow-through.", "Turn excellence into a repeatable operating practice."],
  },
  { slug: "effective-communication-essentials", index: "16", title: "Essentials of Effective Communication", strapline: "Say what matters with clarity, listening, and practical influence.", description: "A professional communication course covering message design, listening, written communication, feedback, difficult messages, and cultural context.", audience: "All professionals, students, team leads, and client-facing practitioners.", outcomes: ["Structure clear verbal and written messages.", "Listen for meaning and response.", "Handle important conversations with integrity."],
  },
  { slug: "lasting-interpersonal-relationships", index: "17", title: "Building Lasting Interpersonal Relationships", strapline: "Create trust, respect, and connection that can withstand pressure.", description: "A practical relationship-skills programme focused on presence, reciprocity, boundaries, repair, and durable connection.", audience: "Professionals, leaders, educators, families, and community builders.", outcomes: ["Build trust through reliable behaviour.", "Set healthy boundaries without damaging connection.", "Repair tension and sustain relationships over time."],
  },
  { slug: "building-thriving-business-empires", index: "18", title: "Building Thriving Business Enterprises", strapline: "Move from opportunity to value, operating discipline, and responsible growth.", description: "An entrepreneurial business-building course connecting customer insight, value propositions, operating systems, people, finance, and scale.", audience: "Founders, aspiring entrepreneurs, business leaders, and enterprise teams.", outcomes: ["Test opportunities against real customer needs.", "Design a coherent business model.", "Build foundations for responsible growth."],
  },
  { slug: "negotiation-mastery", index: "19", title: "Mastering the Art of Negotiation", strapline: "Create value, protect relationships, and reach durable agreements.", description: "An applied negotiation programme covering preparation, interests, leverage, listening, offers, concessions, ethics, and implementation.", audience: "Leaders, sales professionals, consultants, procurement teams, and entrepreneurs.", outcomes: ["Prepare negotiations with clarity and alternatives.", "Separate positions from interests.", "Reach agreements that can work in practice."],
  },
  { slug: "critical-thinking-problem-solving", index: "20", title: "Critical Thinking & Problem Solving", strapline: "Frame complex problems, test assumptions, and choose better solutions.", description: "A disciplined thinking course connecting evidence, root-cause analysis, creativity, decision criteria, bias awareness, and implementation learning.", audience: "Professionals, analysts, leaders, students, and project teams.", outcomes: ["Define the real problem before solving it.", "Evaluate evidence and assumptions.", "Test solutions and learn from outcomes."],
  },
  { slug: "creativity-and-innovation", index: "21", title: "Creativity & Innovation in Practice", strapline: "Generate useful possibilities and turn them into tested value.", description: "A practical innovation course covering observation, ideation, prototyping, experimentation, collaboration, adoption, and responsible scale.", audience: "Innovators, educators, founders, product teams, and professionals seeking fresh approaches.", outcomes: ["Generate and select useful ideas.", "Prototype and test with evidence.", "Build conditions where innovation can be adopted."],
  },
  { slug: "teamwork-and-collaboration", index: "22", title: "Teamwork & Collaboration", strapline: "Build shared purpose, psychological safety, and dependable collective performance.", description: "A modern teamwork course on roles, routines, trust, disagreement, distributed ownership, team learning, and performance habits.", audience: "Teams, project leads, managers, students, and cross-functional professionals.", outcomes: ["Create clarity around purpose and contribution.", "Use disagreement productively.", "Build routines that improve collective delivery."],
  },
  { slug: "leadership-and-self-leadership", index: "23", title: "Leadership & Self-Leadership", strapline: "Lead yourself well, then create the conditions for others to do their best work.", description: "A foundational leadership programme connecting identity, self-leadership, decision courage, communication, development, change, and presence.", audience: "Emerging leaders, managers, founders, educators, and professionals preparing for greater responsibility.", outcomes: ["Lead from clear values and direction.", "Make accountable decisions under pressure.", "Develop people through useful leadership practices."],
  },
  { slug: "adaptability-and-resilience", index: "24", title: "Adaptability & Resilience", strapline: "Respond intelligently to change without losing purpose or wellbeing.", description: "An applied resilience course focused on flexible thinking, pressure responses, disruption, support networks, renewal, and sustainable adaptation.", audience: "Professionals, leaders, students, teams, and people navigating transition.", outcomes: ["Read change and choose a constructive response.", "Build personal and social resilience resources.", "Recover, learn, and adapt after disruption."],
  },
  { slug: "time-management-personal-productivity", index: "25", title: "Time Management & Personal Productivity", strapline: "Turn priorities into focused, sustainable output.", description: "A practical productivity system for planning, attention, workflow, digital organisation, collaboration capacity, and review.", audience: "Professionals, students, managers, freelancers, and project owners.", outcomes: ["Plan from outcomes rather than activity.", "Manage attention, energy, and workflow.", "Improve output without sacrificing sustainability."],
  },
  { slug: "decision-making-skills", index: "26", title: "Decision-Making Skills", strapline: "Make clearer choices when information is incomplete and trade-offs are real.", description: "A decision-quality course covering framing, evidence, uncertainty, criteria, bias, inclusion, communication, and learning from outcomes.", audience: "Leaders, analysts, professionals, founders, and project teams.", outcomes: ["Frame decisions and options precisely.", "Make trade-offs visible.", "Improve decision quality through review and learning."],
  },
  { slug: "conflict-resolution-negotiation", index: "27", title: "Conflict Resolution & Negotiation", strapline: "Turn tension into dialogue, fair agreements, and restored trust.", description: "A practical conflict-resolution pathway covering diagnosis, de-escalation, interests, dialogue, resolution options, repair, and prevention.", audience: "Managers, team leads, educators, HR professionals, and community practitioners.", outcomes: ["Diagnose the sources of conflict.", "Lead constructive resolution conversations.", "Build agreements and systems that reduce repeated tension."],
  },
  { slug: "interpersonal-and-relationship-skills", index: "28", title: "Interpersonal & Relationship Skills", strapline: "Strengthen the everyday behaviours that make working relationships effective.", description: "A practical course on rapport, listening, empathy, boundaries, feedback, influence, accountability, and relationship maintenance.", audience: "Professionals, students, managers, client-facing teams, and community builders.", outcomes: ["Use presence and listening to build rapport.", "Communicate care and clarity together.", "Maintain trust through repair and accountability."],
  },
  { slug: "digital-literacy-and-etiquette", index: "29", title: "Digital Literacy & Digital Etiquette", strapline: "Work safely, clearly, and respectfully in digital environments.", description: "A modern digital-capability course covering information quality, online safety, platforms, virtual work, privacy, digital identity, and responsible technology.", audience: "Students, professionals, educators, teams, and anyone working across digital channels.", outcomes: ["Evaluate digital information responsibly.", "Communicate effectively online and in virtual meetings.", "Protect privacy, reputation, and consent."],
  },
  { slug: "presentation-and-public-speaking", index: "30", title: "Presentation & Public Speaking", strapline: "Turn ideas into clear, compelling experiences for an audience.", description: "A presentation-skills course covering audience insight, story architecture, visuals, voice, questions, facilitation, rehearsal, and virtual delivery.", audience: "Professionals, students, educators, leaders, and speakers.", outcomes: ["Structure presentations around audience needs.", "Use voice, visuals, and presence with intention.", "Respond confidently to questions and feedback."],
  },
  { slug: "professionalism-and-workplace-ethics", index: "31", title: "Professionalism & Workplace Ethics", strapline: "Build credibility through responsible conduct, judgement, and respect.", description: "A workplace-readiness course connecting values, reliability, confidentiality, inclusion, boundaries, accountability, and ethical action.", audience: "Students, early-career professionals, managers, teams, and workplace leaders.", outcomes: ["Translate values into observable conduct.", "Navigate ethical choices responsibly.", "Build trust through reliable professional practice."],
  },
  { slug: "career-development-employability", index: "32", title: "Career Development & Employability", strapline: "Build the evidence, narrative, and relationships that keep opportunity moving.", description: "A practical career course covering direction, skills evidence, opportunity research, CVs, portfolios, interviews, networking, transitions, and lifelong employability.", audience: "Students, graduates, professionals, career changers, and returning professionals.", outcomes: ["Clarify career direction and transferable strengths.", "Present credible evidence of capability.", "Build a sustainable career development rhythm."],
  },
  { slug: "entrepreneurial-mindset", index: "33", title: "The Entrepreneurial Mindset", strapline: "See opportunity, test assumptions, and create value with resourcefulness.", description: "A practical entrepreneurial-thinking course on opportunity recognition, customer empathy, experimentation, risk, resilience, collaboration, and value creation.", audience: "Students, professionals, founders, intrapreneurs, and enterprise-minded teams.", outcomes: ["Recognise opportunities worth testing.", "Learn through disciplined experiments.", "Create value while managing risk responsibly."],
  },
].map((course) => ({ ...course, duration: "10 modules · 70 lessons · 10 applied quizzes · 400 guided minutes", priceKes: STANDARD_COURSE_PRICE_KES, stageAmountsKes: STANDARD_COURSE_STAGE_AMOUNTS_KES }));

export const courseCatalog: CourseDefinition[] = [...courseSeeds, ...additionalCourseSeeds].map((course) => ({ ...course, modules: course.slug === "professional-certificate-international-curriculum-pedagogy" ? buildIcpcModules(course) : buildModules(course) }));
export const getCourseBySlug = (slug: string) => courseCatalog.find((course) => course.slug === slug);

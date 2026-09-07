export const COURSE_PRICE_KES = 4999;
export const COURSE_STAGE_AMOUNT_KES = 1250;
export const STANDARD_COURSE_PRICE_KES = 4999;
export const STANDARD_COURSE_STAGE_AMOUNTS_KES = [
  1250, 1250, 1250, 1249,
] as const;
export const COURSE_PASS_MARK = 50;

export type LessonSection = { heading: string; body: string; callout?: string };
export type LessonSimulation = {
  prompt: string;
  options: string[];
  feedback: string[];
};
export type LessonResponseTask = {
  id: string;
  prompt: string;
  placeholder: string;
  required: boolean;
};
export type LessonIllustration = {
  label: string;
  caption: string;
  accent: string;
  explanatory: string;
  applicational: string;
  experiential: string;
  visualUrl: string;
  visualAlt: string;
  experientialQuestion: string;
  experientialOptions: string[];
  experientialFeedback: string[];
  experientialReflectionPrompt: string;
};
export type CourseLesson = {
  id: string;
  title: string;
  summary: string;
  outcome: string;
  durationMinutes: number;
  objectives: string[];
  sections: LessonSection[];
  example: { context: string; move: string; result: string };
  simulation: LessonSimulation;
  responseTasks: LessonResponseTask[];
  deepDive: string;
  reflectionPrompt: string;
  keyTakeaway: string;
  illustration: LessonIllustration;
};
export type CourseQuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctOption: number;
  sourceLessonId: string;
  sourceLessonTitle: string;
  explanation: string;
  optionExplanations: string[];
};
export type CourseModule = {
  id: string;
  title: string;
  promise: string;
  lessons: CourseLesson[];
  quiz: CourseQuizQuestion[];
};
export type CourseCategory =
  | "AI & Digital"
  | "Business & Analytics"
  | "Education & Research"
  | "Communication & Career"
  | "Leadership & Workplace"
  | "Personal Development";
export type CourseSkillLevel = "Foundation" | "Practitioner" | "Advanced";
export const COURSE_CATEGORIES: readonly CourseCategory[] = [
  "AI & Digital",
  "Business & Analytics",
  "Education & Research",
  "Communication & Career",
  "Leadership & Workplace",
  "Personal Development",
] as const;
export const COURSE_SKILL_LEVELS: readonly CourseSkillLevel[] = [
  "Foundation",
  "Practitioner",
  "Advanced",
] as const;
export type CourseDefinition = {
  slug: string;
  index: string;
  title: string;
  strapline: string;
  description: string;
  audience: string;
  duration: string;
  outcomes: readonly string[];
  priceKes: number;
  stageAmountsKes: readonly number[];
  modules: CourseModule[];
  category: CourseCategory;
  skillLevel: CourseSkillLevel;
  coverImage: string;
};

const explanatoryVisuals = [
  {
    url: "/piq-explainer-journey_6b36511b.svg",
    alt: "A rising pathway connecting insight to purposeful action.",
  },
  {
    url: "/piq-explainer-feedback-loop_8245cc4d.svg",
    alt: "A circular feedback loop connecting observation, interpretation, action, and learning.",
  },
  {
    url: "/piq-explainer-decision-matrix_22a2f148.svg",
    alt: "A decision matrix with a marker moving toward a high-value quadrant.",
  },
  {
    url: "/piq-explainer-iceberg_dcd03685.svg",
    alt: "An iceberg showing visible behaviour above deeper assumptions and systems.",
  },
  {
    url: "/piq-explainer-bridge_916cd9ec.svg",
    alt: "A bridge connecting theory to everyday practice.",
  },
] as const;

const lessonBlueprints = [
  [
    "Orientation and baseline",
    "Language of the discipline",
    "Signals in everyday work",
    "A practical diagnostic",
    "Case study: from friction to focus",
    "Guided reflection",
    "Applied field note",
  ],
  [
    "The operating context",
    "Stakeholder perspectives",
    "The cost of drift",
    "Decision principles",
    "Case study: competing priorities",
    "Guided reflection",
    "Applied field note",
  ],
  [
    "Patterns and behaviours",
    "Strengths under pressure",
    "Blind spots and defaults",
    "Trust-building habits",
    "Case study: the moment that matters",
    "Guided reflection",
    "Applied field note",
  ],
  [
    "Designing the intervention",
    "From insight to intention",
    "Tools for structured practice",
    "Communicating the change",
    "Case study: a change in motion",
    "Guided reflection",
    "Applied field note",
  ],
  [
    "Execution rhythms",
    "Planning for momentum",
    "Focus and sequencing",
    "Feedback loops",
    "Case study: making progress visible",
    "Guided reflection",
    "Applied field note",
  ],
  [
    "Working through complexity",
    "Ambiguity and judgment",
    "Trade-offs and constraints",
    "Calm under pressure",
    "Case study: navigating uncertainty",
    "Guided reflection",
    "Applied field note",
  ],
  [
    "Influence and alignment",
    "The architecture of a useful conversation",
    "Listening for what is unsaid",
    "Alignment without overreach",
    "Case study: the coalition",
    "Guided reflection",
    "Applied field note",
  ],
  [
    "Measurement and learning",
    "Choosing meaningful evidence",
    "Leading indicators",
    "Reviewing outcomes",
    "Case study: learning from the data",
    "Guided reflection",
    "Applied field note",
  ],
  [
    "Integration lab",
    "A personal operating model",
    "Transfer across contexts",
    "Responsible experimentation",
    "Case study: the 30-day shift",
    "Guided reflection",
    "Applied field note",
  ],
  [
    "Capstone and continuation",
    "Synthesising the journey",
    "Presenting your point of view",
    "A sustainable practice",
    "Case study: from course to capability",
    "Guided reflection",
    "Applied field note",
  ],
] as const;

const moduleThemes: Record<string, string[]> = {
  "Lead with Clarity": [
    "leadership identity",
    "strategic clarity",
    "self-awareness",
    "decision quality",
    "execution",
    "complexity",
    "influence",
    "measurement",
    "integration",
    "capstone leadership practice",
  ],
  "Strategic Growth Mindset": [
    "growth orientation",
    "context and opportunity",
    "learning agility",
    "experimentation",
    "execution rhythm",
    "resilience",
    "collaboration",
    "evidence of growth",
    "integration",
    "capstone growth plan",
  ],
  "Professional Presence & Influence": [
    "professional identity",
    "context and reputation",
    "authentic presence",
    "message design",
    "visibility",
    "difficult moments",
    "influence",
    "credibility",
    "integration",
    "capstone presence plan",
  ],
  "From Insight to Action": [
    "insight baseline",
    "context and priorities",
    "behaviour change",
    "action design",
    "execution rhythm",
    "obstacles",
    "accountability",
    "measurement",
    "integration",
    "capstone action system",
  ],
  "Professional Certificate in International Curriculum Pedagogy": [
    "modern pedagogy and learner-centred practice",
    "British National Curriculum",
    "International Baccalaureate",
    "American Curriculum",
    "Cambridge and IGCSE",
    "Christian education and homeschooling",
    "Pearson Edexcel and comparative curriculum design",
    "early years and integrated approaches",
    "counselling, law, professionalism and entrepreneurship",
    "research, technology and assessment",
  ],
};

const lessonContent = (
  courseTitle: string,
  theme: string,
  lessonTitle: string,
  lessonIndex: number,
  moduleIndex: number
) => {
  const practice = [
    "notice the signal",
    "frame the decision",
    "test a small intervention",
    "invite a useful response",
    "review the evidence",
    "name the trade-off",
    "transfer the practice",
  ][lessonIndex];
  const dailyContexts = [
    "choosing which task deserves attention before the day becomes reactive",
    "responding to a difficult message without escalating the situation",
    "planning a household, study, or work commitment with limited time and energy",
    "giving or receiving feedback when the relationship matters",
    "making a purchase, project, or career decision with incomplete information",
    "recovering constructively after a missed commitment or unexpected change",
    "turning an intention into a small habit that can survive a busy week",
  ];
  const dailyContext = dailyContexts[lessonIndex];
  return {
    durationMinutes: 30,
    objectives: [
      `Explain the core idea of ${lessonTitle.toLowerCase()} and how it connects to ${theme}.`,
      `Apply the concept to a professional situation and an everyday decision such as ${dailyContext}.`,
      "Practise one observable behaviour, examine the result, and define a next experiment.",
    ],
    sections: [
      {
        heading: "Build the mental model",
        body: `${lessonTitle} is a practical way of seeing and responding, not a definition to memorise. In ${courseTitle}, it helps you interpret ${theme} with more precision: first identify the situation, then separate facts from assumptions, choose a response that fits the purpose, and review what happened. The concept becomes useful when it changes what you notice, what you say, or what you do next.`,
        callout:
          "Read slowly, pause at the examples, and connect each idea to one real moment from your week.",
      },
      {
        heading: "Understand the mechanism",
        body: `Most people move through ${theme} using familiar defaults. A trigger creates a first interpretation; that interpretation shapes emotion and attention; attention influences behaviour; and behaviour produces consequences that can reinforce the original pattern. ${lessonTitle} creates a deliberate pause in that chain. Ask: What is happening? What matters here? What response would serve the intended outcome? What evidence would show that the response helped?`,
      },
      {
        heading: "Apply it in daily life",
        body: `Imagine that you are ${dailyContext}. A reactive approach might follow the loudest demand, send the first emotional reply, or abandon the plan when conditions change. A more skilful approach is to ${practice}: name the outcome, identify the constraint, choose the smallest useful move, and set a time to review it. The same pattern transfers between work, study, family conversations, personal finances, health routines, and community responsibilities because each setting rewards clear observation and intentional action.`,
        callout:
          "Application test: if the idea cannot improve an ordinary Tuesday, it has not yet become a usable capability.",
      },
      {
        heading: "Study the worked example",
        body: `A project lead notices that meetings are full but decisions remain unclear. They write the desired decision at the top of the agenda, ask each person to name one relevant constraint, and close by recording the owner and review date. At home, the same learner uses the method to plan a shared errand: agree on the outcome, check the available time, choose the simplest route, and confirm what will happen if the plan changes. In both cases, ${theme} moves from an abstract aspiration to a visible practice with a consequence that can be reviewed.`,
      },
      {
        heading: "Practise through a small experiment",
        body: `Choose one live situation from the last seven days. Write the trigger, your usual response, the result it creates, and the alternative response you want to test. Keep the experiment small enough to complete before the next working cycle. For example, replace a vague intention with one sentence you will use, one calendar block you will protect, one question you will ask, or one decision rule you will follow. Afterward, record what changed, what surprised you, and what you would adjust rather than judging the attempt as simply good or bad.`,
      },
      {
        heading: "Use the simulation and transfer",
        body: `The simulation presents a realistic choice because capability develops through decisions, not passive agreement. Select the response that creates learning, protects the relationship, and keeps the next step observable. Then adapt the same move to a personal context: a difficult conversation, a study plan, a spending choice, a health commitment, or a household responsibility. Transfer is complete when you can explain what you changed, why it fit the situation, and what evidence you will review.`,
      },
    ],
    example: {
      context: `A learner is experiencing friction around ${theme} while balancing work, personal responsibilities, and limited attention.`,
      move: `They pause before reacting, make the pattern explicit, and use ${lessonTitle.toLowerCase()} to ${practice}. They choose one low-risk experiment and tell the relevant person what they are testing.`,
      result:
        "The situation becomes easier to discuss, the next action is visible, and the learner has evidence to use in the next review rather than relying on a vague intention.",
    },
    simulation: {
      prompt: [
        `You are responsible for a live decision where ${theme} is under pressure. What is your best first move?`,
        `A working pattern around ${theme} is slowing progress. Which intervention creates learning without overcorrecting?`,
        `You have one conversation to make ${lessonTitle.toLowerCase()} visible. What should you do?`,
      ][lessonIndex % 3],
      options: [
        [
          "Clarify the outcome, constraint, and next observable action.",
          "Wait until every stakeholder agrees on the full solution.",
          "Add more activity so the issue feels addressed.",
        ],
        [
          "Name the pattern, choose a low-risk experiment, and agree how to review it.",
          "Redesign the entire process before testing one assumption.",
          "Ignore the pattern until the next formal review.",
        ],
        [
          "Describe the evidence, invite the relevant perspective, and confirm one next move.",
          "Give a long explanation without asking for a response.",
          "Avoid the difficult point and hope the context improves.",
        ],
      ][lessonIndex % 3],
      feedback: [
        [
          "Strong move: clarity creates a testable next step.",
          "Consensus can help, but waiting for completeness often increases drift.",
          "Activity without a review point does not create learning.",
        ],
        [
          "Strong move: a small experiment creates evidence without pretending certainty.",
          "Large redesigns can hide which assumption was actually tested.",
          "Avoidance preserves the pattern rather than helping the team learn.",
        ],
        [
          "Strong move: evidence and a confirmed next move turn insight into action.",
          "Explanation without exchange does not create alignment.",
          "Avoidance leaves the underlying pattern unexamined.",
        ],
      ][lessonIndex % 3],
    },
    responseTasks: [
      {
        id: "notice",
        prompt: `Name one real situation where ${lessonTitle.toLowerCase()} matters for you. What happened, and what did you notice?`,
        placeholder: "Describe the situation and the signal you noticed…",
        required: true,
      },
      {
        id: "apply",
        prompt: `Write the specific action you will take to apply ${lessonTitle.toLowerCase()} within the next seven days.`,
        placeholder:
          "Write one observable action, including when or where you will do it…",
        required: true,
      },
      {
        id: "evidence",
        prompt:
          "Define the evidence you will review and the question you will ask yourself after the experiment.",
        placeholder:
          "Describe the result you will look for and how you will review it…",
        required: true,
      },
      {
        id: "experience-choice",
        prompt:
          "Choose the response that best honours the experiential story and creates a useful next move.",
        placeholder: "Select the response that best fits the story…",
        required: true,
      },
      {
        id: "experience-reflection",
        prompt:
          "Write what the experiential story brings to mind and how you will carry its lesson into one real situation.",
        placeholder:
          "Describe the moment, feeling, or insight you want to carry forward…",
        required: true,
      },
    ],
    deepDive: `Deep-dive practice: connect ${lessonTitle.toLowerCase()} to ${dailyContext}. First describe the current pattern without judging it. Then identify the smallest decision you can make, the support or constraint that may affect it, and the moment you will review the result. Strong application is not about producing a perfect answer; it is about making your reasoning visible, testing it responsibly, and improving the next attempt with evidence.`,
    reflectionPrompt: `Where could you practise ${lessonTitle.toLowerCase()} this week—in your work, study, relationships, finances, health, or household routines—and what specific evidence would tell you that the practice is working?`,
    keyTakeaway: `A useful ${lessonTitle.toLowerCase()} practice turns ${theme} into one observable decision, behaviour, or review point that improves an ordinary situation.`,
    illustration: {
      label: `Signal ${String(moduleIndex + 1).padStart(2, "0")}.${lessonIndex + 1}`,
      caption: `From ${theme} to an observable professional and everyday move.`,
      accent: ["gold", "teal", "plum"][lessonIndex % 3],
      explanatory: `Think of ${lessonTitle.toLowerCase()} as a route map: the situation is the starting point, ${practice} is the next turn, and the review point tells you whether the route is taking you toward the intended outcome.`,
      applicational: `In an ordinary week, use this lens when you are ${dailyContext}. Pause long enough to name the outcome, the constraint, and one small move you can observe before the day ends.`,
      experiential: `Recall a moment when ${theme} carried real weight for you. Notice the tone of the room, the pressure in your body, and the first story your mind told. Now imagine choosing ${practice} with enough calm to leave the situation clearer than you found it.`,
      visualUrl:
        explanatoryVisuals[
          (moduleIndex * 7 + lessonIndex) % explanatoryVisuals.length
        ].url,
      visualAlt:
        explanatoryVisuals[
          (moduleIndex * 7 + lessonIndex) % explanatoryVisuals.length
        ].alt,
      experientialQuestion: `The story asks you to pause inside the pressure of ${theme}. Which response best turns that felt insight into a responsible next move?`,
      experientialOptions: [
        `Name what you noticed, choose one small action, and return later to review what changed.`,
        `Wait until the situation feels completely comfortable before deciding what it means.`,
        `Keep the feeling private and move on without testing a different response.`,
      ],
      experientialFeedback: [
        `That response respects the experience and converts it into observable learning.`,
        `Comfort may come later; waiting can leave the original pattern unchanged.`,
        `Private insight becomes useful when it informs a responsible action or conversation.`,
      ],
      experientialReflectionPrompt: `What detail from this story—its atmosphere, pressure, or moment of possibility—connects with your own life, and what will you do differently because of it?`,
    },
  };
};

const quizQuestions = (
  courseSlug: string,
  moduleId: string,
  theme: string,
  lessons: CourseLesson[]
): CourseQuizQuestion[] =>
  Array.from({ length: 15 }, (_, index) => {
    const lesson = lessons[index % lessons.length];
    const prompts = [
      `After studying ${lesson.title}, what is the most useful first move when applying ${theme}?`,
      `Which evidence would best show that the ${lesson.title.toLowerCase()} practice is working?`,
      `A colleague is under pressure around ${theme}. Which response reflects ${lesson.title.toLowerCase()}?`,
      `Which choice best transfers the ${lesson.title.toLowerCase()} lesson into a live professional context?`,
    ];
    const answerSets = [
      [
        `Name the intended outcome, choose one observable move, and set a review point.`,
        "Collect more information until the decision feels completely risk-free.",
        "Add more meetings without changing the underlying working pattern.",
        "Leave the current approach untouched so no one has to adapt.",
      ],
      [
        "A broad sense that the team is busy and committed.",
        `A visible change connected to ${lesson.title.toLowerCase()} that can be reviewed in the next work cycle.`,
        "A polished document that no one uses to make a decision.",
        "A promise to revisit the issue when the pressure has passed.",
      ],
      [
        "Offer a generic motivational message and move on quickly.",
        "Take ownership of the entire situation so others do not need to contribute.",
        `Make the ${lesson.title.toLowerCase()} pattern explicit, then agree on a small next experiment.`,
        "Delay the conversation until every possible objection has been resolved.",
      ],
      [
        "Memorise the terminology and repeat it in a presentation.",
        "Wait for a formal programme before applying the lesson.",
        "Copy another professional's solution without checking the local context.",
        `Apply ${lesson.title.toLowerCase()} to one live decision, behaviour, or review conversation and inspect the result.`,
      ],
    ];
    const correctPosition = (index * 3 + moduleId.length) % 4;
    const base = answerSets[index % answerSets.length];
    const explanationSets = [
      [
        `Correct: this response identifies the intended outcome, makes the next move observable, and creates a review point.`,
        `Not quite: more information can help, but waiting for complete certainty delays a useful decision and test.`,
        `Not quite: additional meetings do not change the underlying pattern unless they produce a clear decision or behaviour.`,
        `Not quite: leaving the pattern untouched provides no evidence that the situation is improving.`,
      ],
      [
        `Not quite: activity and goodwill are useful context, but they do not show whether the target behaviour changed.`,
        `Correct: visible evidence connected to the lesson can be reviewed and improved in the next work cycle.`,
        `Not quite: a polished document matters only if it changes a decision, behaviour, or result.`,
        `Not quite: postponing review removes the feedback needed to learn.`,
      ],
      [
        `Not quite: encouragement without a specific practice does not address the working pattern.`,
        `Not quite: taking over removes ownership and limits learning for the people involved.`,
        `Correct: naming the pattern and agreeing a small experiment turns the lesson into shared action.`,
        `Not quite: delaying until every objection is resolved can prevent a timely, constructive conversation.`,
      ],
      [
        `Not quite: terminology supports understanding, but application requires a visible change in context.`,
        `Not quite: waiting for a formal programme postpones practice that could begin safely now.`,
        `Not quite: another person’s solution may not fit the local constraints or intended outcome.`,
        `Correct: transferring the lesson to a live decision or review conversation creates evidence of learning.`,
      ],
    ];
    const options = [...base];
    const explanations = [...explanationSets[index % explanationSets.length]];
    const [correctAnswer] = options.splice(index % 4, 1);
    const [correctExplanation] = explanations.splice(index % 4, 1);
    options.splice(correctPosition, 0, correctAnswer);
    explanations.splice(correctPosition, 0, correctExplanation);
    return {
      id: `${courseSlug}-${moduleId}-q${index + 1}`,
      prompt: prompts[index % prompts.length],
      options,
      correctOption: correctPosition,
      sourceLessonId: lesson.id,
      sourceLessonTitle: lesson.title,
      explanation: `This question revisits the lesson “${lesson.title}” by connecting ${theme} to an observable action and a review point.`,
      optionExplanations: explanations,
    };
  });

const buildModules = (course: {
  slug: string;
  title: string;
}): CourseModule[] =>
  lessonBlueprints.map((lessonTitles, moduleIndex) => {
    const moduleId = `module-${moduleIndex + 1}`;
    const theme =
      moduleThemes[course.title]?.[moduleIndex] ??
      extendedModuleThemes[course.slug]?.[moduleIndex] ??
      `${course.title.toLowerCase()} practice ${moduleIndex + 1}`;
    const lessons = lessonTitles.map((lessonTitle, lessonIndex) => ({
      id: `${course.slug}-${moduleId}-lesson-${lessonIndex + 1}`,
      title: lessonTitle,
      summary: `${lessonTitle} gives you a focused lens for applying ${theme} to real professional situations.`,
      outcome: `By the end of this lesson, you can explain, practise, and review one aspect of ${theme} with greater precision.`,
      ...lessonContent(
        course.title,
        theme,
        lessonTitle,
        lessonIndex,
        moduleIndex
      ),
    }));
    return {
      id: moduleId,
      title: `${moduleIndex + 1}. ${theme.replace(/\b\w/g, letter => letter.toUpperCase())}`,
      promise: `Build a repeatable professional practice for ${theme}, moving from informed reflection to visible application.`,
      lessons,
      quiz: quizQuestions(course.slug, moduleId, theme, lessons),
    };
  });

const icpcLessonBlueprints = [
  [
    "Modern pedagogy: the changing classroom",
    "Learner-centred design",
    "Questioning and dialogue",
    "Differentiation in practice",
    "Inclusive classroom routines",
    "Micro-teaching simulation",
    "Reflective teaching journal",
  ],
  [
    "British National Curriculum: structure and intent",
    "Key stages and progression",
    "Planning from attainment targets",
    "Subject knowledge and sequencing",
    "Adaptive teaching in a British classroom",
    "Assessment for learning",
    "British curriculum case clinic",
  ],
  [
    "International Baccalaureate: learner profile",
    "Inquiry-based learning",
    "Concept-driven planning",
    "Approaches to teaching",
    "Interdisciplinary connections",
    "The extended learning journey",
    "IB unit design studio",
  ],
  [
    "American Curriculum: standards and pathways",
    "Standards-aligned planning",
    "Credit, grade and progression logic",
    "Differentiated instruction",
    "Project-based learning",
    "College and career readiness",
    "American classroom case clinic",
  ],
  [
    "Cambridge and IGCSE: rigour with context",
    "Cambridge learner attributes",
    "Syllabus interpretation",
    "Command words and exam literacy",
    "Practical and coursework assessment",
    "Global perspectives in delivery",
    "IGCSE scheme-of-work studio",
  ],
  [
    "Alternative Christian education: values and formation",
    "Education through a Christian worldview",
    "Character and service learning",
    "Curriculum integration",
    "Homeschooling models and routines",
    "Family partnership and safeguarding",
    "Designing a home learning pathway",
  ],
  [
    "Pearson Edexcel: specifications to outcomes",
    "Reading a Pearson specification",
    "Assessment objectives",
    "Coursework and evidence",
    "Progression and feedback",
    "Comparing international pathways",
    "Comparative curriculum advisory simulation",
  ],
  [
    "Early years: Montessori and Reggio Emilia",
    "HighScope and active learning",
    "Play-based curriculum design",
    "Waldorf education",
    "Integrated approaches",
    "Observation and learning stories",
    "Early years environment studio",
  ],
  [
    "Counselling dynamics in curriculum delivery",
    "Types and boundaries of counselling",
    "Principles of helping conversations",
    "The counselling process",
    "Legal aspects of education",
    "Professional development and aptitudes",
    "Entrepreneurship for educators",
  ],
  [
    "Research and technology in education",
    "Emerging technologies and data science",
    "Artificial intelligence and ethics",
    "IoT, cloud and cybersecurity",
    "Learning management systems",
    "AR, VR, 3D printing and gamification",
    "Research design, assessment and presentation",
  ],
] as const;

const icpcModuleThemes = [
  "modern pedagogy and learner-centred practice",
  "British National Curriculum",
  "International Baccalaureate",
  "American Curriculum",
  "Cambridge and IGCSE",
  "Christian education and homeschooling",
  "Pearson Edexcel and comparative curriculum design",
  "early years and integrated approaches",
  "counselling, law, professionalism and entrepreneurship",
  "research, technology and assessment",
] as const;

const icpcQuizQuestions = (
  courseSlug: string,
  moduleId: string,
  theme: string,
  lessons: CourseLesson[]
): CourseQuizQuestion[] =>
  Array.from({ length: 15 }, (_, index) => {
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
      [
        "Deliver the same activity to everyone and judge effort at the end.",
        "Choose a fashionable method without checking the intended learning.",
        "Wait for a formal inspection before responding to learner evidence.",
      ],
      [
        "A full timetable with every minute occupied.",
        "A polished scheme of work that is never revisited.",
        "A high-stakes result without diagnostic evidence.",
      ],
      [
        "Copy a different system without checking its assumptions.",
        "Treat the syllabus as a script that cannot be adapted.",
        "Separate assessment from the learning experience entirely.",
      ],
      [
        "Give the learner more worksheets without diagnosing the barrier.",
        "Remove challenge so the learner cannot experience productive struggle.",
        "Delay the conversation until the term has ended.",
      ],
    ];
    const correctPosition = (index * 5 + moduleId.length) % 4;
    const options = [
      ...distractors[index % distractors.length],
      correctAnswers[index % correctAnswers.length],
    ];
    const optionExplanations = [
      `Not quite: this approach focuses on activity or compliance without checking whether the intended learning is happening.`,
      `Not quite: a method or document is only useful when it fits the learner, curriculum purpose, and evidence available.`,
      `Not quite: postponing adjustment removes the timely evidence needed to support learner progress.`,
      `Correct: this response connects learner evidence, context, professional judgment, and a purposeful next action.`,
    ];
    const correct = options.pop()!;
    const correctExplanation = optionExplanations.pop()!;
    options.splice(correctPosition, 0, correct);
    optionExplanations.splice(correctPosition, 0, correctExplanation);
    return {
      id: `${courseSlug}-${moduleId}-q${index + 1}`,
      prompt: stems[index % stems.length],
      options,
      correctOption: correctPosition,
      sourceLessonId: lesson.id,
      sourceLessonTitle: lesson.title,
      explanation: `This question is aligned to ${lesson.title} and tests whether the learner can connect ${theme} to an observable teaching, learning, or assessment decision.`,
      optionExplanations,
    };
  });

const buildIcpcModules = (course: {
  slug: string;
  title: string;
}): CourseModule[] =>
  icpcLessonBlueprints.map((lessonTitles, moduleIndex) => {
    const theme = icpcModuleThemes[moduleIndex];
    const lessons = lessonTitles.map((lessonTitle, lessonIndex) => ({
      id: `${course.slug}-module-${moduleIndex + 1}-lesson-${lessonIndex + 1}`,
      title: lessonTitle,
      summary: `${lessonTitle} turns ${theme} into a practical international-school teaching decision.`,
      outcome: `By the end of this 40-minute studio, you can apply ${lessonTitle.toLowerCase()} to a learner, lesson, curriculum, or assessment context.`,
      ...lessonContent(
        course.title,
        theme,
        lessonTitle,
        lessonIndex,
        moduleIndex
      ),
      sections: [
        {
          heading: "Orient the practice",
          body: `This studio positions ${lessonTitle.toLowerCase()} within ${theme}. Start with the intended learner experience, then identify what the teacher must make visible, what evidence matters, and where professional judgment is required.`,
          callout:
            "Work like a curriculum designer: frame, test, observe, adjust.",
        },
        {
          heading: "Compare the systems",
          body: `International curricula are not interchangeable labels. Compare the assumptions, progression logic, teaching choices, and assessment expectations that shape ${theme}; then name which parts can transfer and which must remain context-specific.`,
        },
        {
          heading: "Try the classroom move",
          body: `Use the case of a mixed-readiness class preparing for a demanding learning outcome. Choose one adaptation, explain why it fits the curriculum context, and decide what learner evidence you will review before the next lesson.`,
        },
        {
          heading: "Studio challenge",
          body: `Draft a compact teaching artefact: a lesson intention, learner activity, formative check, and feedback move. Use the simulation to test the design, then revise one assumption based on the feedback.`,
        },
        {
          heading: "Transfer and review",
          body: `Apply the practice to one real class, tutoring session, home-learning routine, or curriculum consultation. Record the learner response, the evidence gathered, and the next adjustment so the practice becomes a repeatable professional skill.`,
        },
      ],
      simulation: {
        prompt: `You are designing a learning experience for ${theme}. Which move best protects learner agency while keeping the intended outcome clear?`,
        options: [
          "Make the outcome explicit, offer meaningful choices, and use evidence to adjust the next step.",
          "Give learners unlimited choice without a shared outcome or review point.",
          "Follow a fixed script even when learner evidence shows the design is not working.",
        ],
        feedback: [
          "Strong move: agency and intentional design can coexist when evidence guides adaptation.",
          "Choice without direction can create activity without learning.",
          "Consistency matters, but a fixed script is not the same as responsive teaching.",
        ],
      },
      reflectionPrompt: `Which learner, curriculum, or assessment decision could you improve using ${lessonTitle.toLowerCase()}, and what evidence will you review?`,
      keyTakeaway: `${lessonTitle} becomes valuable when it changes one observable teaching decision and creates evidence for the next adjustment.`,
      illustration: {
        label: `ICPC ${String(moduleIndex + 1).padStart(2, "0")}.${lessonIndex + 1}`,
        caption: `A practical signal for ${theme}.`,
        accent: ["gold", "teal", "plum"][lessonIndex % 3],
        explanatory: `Use a curriculum map: the intended learner outcome is the destination, ${lessonTitle.toLowerCase()} is the design choice, and the evidence check shows whether the route is working.`,
        applicational: `In a class, tutoring session, or home-learning routine, apply this practice by making one learner decision visible and reviewing the response before the next teaching move.`,
        experiential: `Picture the room after a learner finally sees the connection: attention settles, questions become more precise, and the teacher can feel the difference between activity and meaningful learning.`,
        visualUrl:
          explanatoryVisuals[
            (moduleIndex * 7 + lessonIndex) % explanatoryVisuals.length
          ].url,
        visualAlt:
          explanatoryVisuals[
            (moduleIndex * 7 + lessonIndex) % explanatoryVisuals.length
          ].alt,
        experientialQuestion: `The story asks you to pause inside the pressure of ${theme}. Which response best turns that felt insight into a responsible next move?`,
        experientialOptions: [
          `Name what you noticed, choose one small action, and return later to review what changed.`,
          `Wait until the situation feels completely comfortable before deciding what it means.`,
          `Keep the feeling private and move on without testing a different response.`,
        ],
        experientialFeedback: [
          `That response respects the experience and converts it into observable learning.`,
          `Comfort may come later; waiting can leave the original pattern unchanged.`,
          `Private insight becomes useful when it informs a responsible action or conversation.`,
        ],
        experientialReflectionPrompt: `What detail from this story—its atmosphere, pressure, or moment of possibility—connects with your own life, and what will you do differently because of it?`,
      },
    }));
    return {
      id: `module-${moduleIndex + 1}`,
      title: `${moduleIndex + 1}. ${theme.replace(/\b\w/g, letter => letter.toUpperCase())}`,
      promise: `Translate ${theme} into a globally aware, learner-centred professional practice.`,
      lessons,
      quiz: icpcQuizQuestions(
        course.slug,
        `module-${moduleIndex + 1}`,
        theme,
        lessons
      ),
    };
  });

const extendedModuleThemes: Record<string, readonly string[]> = {
  "personal-growth-self-discovery": [
    "self-awareness foundations",
    "values and identity",
    "strengths and patterns",
    "purpose and direction",
    "emotional signals",
    "reflective practice",
    "healthy boundaries",
    "growth experiments",
    "integration habits",
    "personal growth capstone",
  ],
  "building-a-growth-mindset": [
    "growth assumptions",
    "learning from feedback",
    "productive challenge",
    "experimentation",
    "progress language",
    "resilience in practice",
    "curiosity and inquiry",
    "collaborative learning",
    "evidence of growth",
    "growth mindset capstone",
  ],
  "continuous-self-improvement": [
    "improvement principles",
    "baseline and priorities",
    "habit architecture",
    "deliberate practice",
    "feedback loops",
    "energy and focus",
    "learning systems",
    "review and adjustment",
    "transfer into work",
    "continuous improvement capstone",
  ],
  "mastering-self-discipline": [
    "discipline foundations",
    "commitment and intention",
    "attention management",
    "friction and environment",
    "execution routines",
    "delayed gratification",
    "recovery after lapses",
    "accountability systems",
    "consistency under pressure",
    "self-discipline capstone",
  ],
  "mastering-time-management": [
    "time awareness",
    "priority architecture",
    "planning horizons",
    "focus blocks",
    "workflow design",
    "delegation and boundaries",
    "meeting and communication time",
    "reviewing capacity",
    "sustainable productivity",
    "time mastery capstone",
  ],
  "personal-finance-management-essentials": [
    "financial foundations",
    "cash-flow awareness",
    "budget design",
    "saving systems",
    "debt decisions",
    "risk and protection",
    "responsible investing",
    "financial goals",
    "review and resilience",
    "personal finance capstone",
  ],
  "self-confidence-and-self-esteem": [
    "confidence foundations",
    "self-talk and evidence",
    "strengths in action",
    "courageous practice",
    "visibility and voice",
    "boundaries and assertiveness",
    "setbacks and recovery",
    "trusting decisions",
    "confidence rituals",
    "confidence capstone",
  ],
  "emotional-intelligence-mastery": [
    "emotional intelligence foundations",
    "self-awareness",
    "emotional regulation",
    "empathy and perspective",
    "active listening",
    "social awareness",
    "relationship management",
    "difficult conversations",
    "emotional culture",
    "emotional intelligence capstone",
  ],
  "personal-brand-strategy": [
    "brand foundations",
    "positioning and value",
    "audience insight",
    "credible storytelling",
    "digital presence",
    "thought leadership",
    "networking and visibility",
    "reputation management",
    "brand consistency",
    "personal brand capstone",
  ],
  "personal-excellence-mastery": [
    "excellence principles",
    "standards and values",
    "quality of execution",
    "ownership and initiative",
    "focus and follow-through",
    "feedback and refinement",
    "professional judgement",
    "service and impact",
    "sustained excellence",
    "personal excellence capstone",
  ],
  "effective-communication-essentials": [
    "communication foundations",
    "message architecture",
    "listening for meaning",
    "clarity and brevity",
    "written communication",
    "difficult messages",
    "influence with integrity",
    "feedback conversations",
    "cross-cultural communication",
    "communication capstone",
  ],
  "lasting-interpersonal-relationships": [
    "relationship foundations",
    "trust and reliability",
    "presence and listening",
    "boundaries and respect",
    "reciprocity and support",
    "repair after tension",
    "diverse perspectives",
    "relationship habits",
    "long-term connection",
    "relationships capstone",
  ],
  "building-thriving-business-empires": [
    "entrepreneurial foundations",
    "problem and opportunity",
    "customer discovery",
    "value proposition",
    "business model design",
    "operations and systems",
    "people and culture",
    "finance and growth",
    "responsible scale",
    "enterprise-building capstone",
  ],
  "negotiation-mastery": [
    "negotiation foundations",
    "interests and alternatives",
    "preparation and leverage",
    "questions and listening",
    "value creation",
    "offers and concessions",
    "difficult dynamics",
    "ethical influence",
    "closing and implementation",
    "negotiation capstone",
  ],
  "critical-thinking-problem-solving": [
    "thinking foundations",
    "framing the problem",
    "evidence and assumptions",
    "root-cause analysis",
    "creative options",
    "decision criteria",
    "testing solutions",
    "bias and judgement",
    "implementation learning",
    "problem-solving capstone",
  ],
  "creativity-and-innovation": [
    "creative confidence",
    "observation and insight",
    "idea generation",
    "divergent thinking",
    "convergent selection",
    "prototyping",
    "experimentation",
    "innovation collaboration",
    "adoption and scale",
    "innovation capstone",
  ],
  "teamwork-and-collaboration": [
    "team foundations",
    "shared purpose",
    "roles and contribution",
    "collaborative routines",
    "psychological safety",
    "disagreement as data",
    "distributed ownership",
    "team learning",
    "high-performance habits",
    "collaboration capstone",
  ],
  "leadership-and-self-leadership": [
    "leadership identity",
    "self-leadership",
    "direction and priorities",
    "responsibility and trust",
    "decision courage",
    "leading conversations",
    "developing others",
    "change leadership",
    "leadership presence",
    "leadership capstone",
  ],
  "adaptability-and-resilience": [
    "adaptability foundations",
    "reading change",
    "flexible thinking",
    "resilience resources",
    "responding under pressure",
    "learning from disruption",
    "uncertainty and action",
    "support networks",
    "renewal and recovery",
    "resilience capstone",
  ],
  "time-management-personal-productivity": [
    "productivity foundations",
    "outcome-based planning",
    "attention and energy",
    "workflow systems",
    "prioritisation under pressure",
    "digital organisation",
    "collaboration capacity",
    "review and optimisation",
    "sustainable output",
    "productivity capstone",
  ],
  "decision-making-skills": [
    "decision foundations",
    "clarifying choices",
    "evidence and uncertainty",
    "criteria and trade-offs",
    "bias-aware judgement",
    "inclusive decisions",
    "speed and reversibility",
    "communicating decisions",
    "learning from outcomes",
    "decision capstone",
  ],
  "conflict-resolution-negotiation": [
    "conflict foundations",
    "diagnosing tension",
    "interests and needs",
    "de-escalation",
    "dialogue and listening",
    "options for resolution",
    "fair agreements",
    "repair and trust",
    "prevention systems",
    "conflict resolution capstone",
  ],
  "interpersonal-and-relationship-skills": [
    "relational foundations",
    "presence and rapport",
    "listening and questions",
    "empathy in action",
    "clear boundaries",
    "feedback and care",
    "influence and respect",
    "repair and accountability",
    "relationship maintenance",
    "relationship skills capstone",
  ],
  "digital-literacy-and-etiquette": [
    "digital foundations",
    "information quality",
    "online safety",
    "professional platforms",
    "clear digital writing",
    "virtual meeting practice",
    "privacy and consent",
    "digital identity",
    "responsible technology",
    "digital literacy capstone",
  ],
  "presentation-and-public-speaking": [
    "speaker foundations",
    "audience and purpose",
    "story architecture",
    "visual explanation",
    "voice and presence",
    "handling questions",
    "facilitation and engagement",
    "virtual presentation",
    "rehearsal and feedback",
    "presentation capstone",
  ],
  "professionalism-and-workplace-ethics": [
    "professional foundations",
    "values and conduct",
    "reliability and ownership",
    "ethical judgement",
    "confidentiality and trust",
    "respect and inclusion",
    "professional boundaries",
    "speaking up responsibly",
    "reputation and accountability",
    "workplace ethics capstone",
  ],
  "career-development-employability": [
    "career direction",
    "skills and evidence",
    "opportunity research",
    "career narratives",
    "CV and portfolio",
    "interviews and selection",
    "networking and sponsorship",
    "career transitions",
    "ongoing employability",
    "career development capstone",
  ],
  "entrepreneurial-mindset": [
    "entrepreneurial orientation",
    "opportunity recognition",
    "customer empathy",
    "testing assumptions",
    "resourcefulness",
    "risk and learning",
    "resilient execution",
    "value creation",
    "entrepreneurial collaboration",
    "entrepreneurial mindset capstone",
  ],
  "artificial-intelligence-for-educators": [
    "AI foundations for learning",
    "teacher workflow opportunities",
    "prompting for lesson design",
    "personalised learning support",
    "AI-assisted assessment",
    "inclusive and accessible practice",
    "classroom implementation",
    "evidence and improvement",
    "school adoption",
    "educator AI capstone",
  ],
  "artificial-intelligence-generative-ai": [
    "AI and generative AI foundations",
    "models and data",
    "prompting and interaction",
    "text and knowledge work",
    "image audio and multimodal work",
    "workflow integration",
    "evaluation and reliability",
    "security and privacy",
    "responsible adoption",
    "generative AI capstone",
  ],
  "generative-ai-prompt-engineering": [
    "prompt engineering foundations",
    "context and task framing",
    "instruction patterns",
    "examples and constraints",
    "structured outputs",
    "reasoning and verification",
    "multi-step workflows",
    "tool-aware prompting",
    "prompt evaluation",
    "prompt portfolio capstone",
  ],
  "ai-business-organization-transformation": [
    "AI transformation foundations",
    "opportunity and readiness",
    "process discovery",
    "use-case prioritisation",
    "operating model design",
    "people and change",
    "risk and governance",
    "value measurement",
    "scaling adoption",
    "AI transformation capstone",
  ],
  "ai-powered-productivity-automation": [
    "AI productivity foundations",
    "workload and workflow mapping",
    "high-value use cases",
    "AI-assisted writing",
    "research and synthesis",
    "no-code automation",
    "quality control",
    "personal data safeguards",
    "team adoption",
    "automation capstone",
  ],
  "responsible-ai-ethics-governance": [
    "responsible AI foundations",
    "fairness and bias",
    "privacy and data stewardship",
    "transparency and explainability",
    "human oversight",
    "safety and security",
    "procurement and vendor review",
    "policy and controls",
    "incident response",
    "AI governance capstone",
  ],
  "social-media-management": [
    "social strategy foundations",
    "audience and platform fit",
    "content pillars",
    "editorial calendars",
    "community management",
    "campaign execution",
    "social listening",
    "crisis and reputation",
    "measurement and reporting",
    "social media capstone",
  ],
  "digital-marketing": [
    "digital marketing foundations",
    "customer and market insight",
    "positioning and messaging",
    "content strategy",
    "email and lifecycle journeys",
    "paid media fundamentals",
    "conversion experience",
    "measurement and attribution",
    "optimisation and experimentation",
    "digital marketing capstone",
  ],
  "research-methods": [
    "research foundations",
    "questions and objectives",
    "literature and evidence",
    "qualitative design",
    "quantitative design",
    "sampling and instruments",
    "data collection ethics",
    "analysis and interpretation",
    "research communication",
    "research methods capstone",
  ],
  "business-analytics": [
    "analytics foundations",
    "business questions and metrics",
    "data quality and preparation",
    "descriptive analysis",
    "diagnostic analysis",
    "forecasting fundamentals",
    "communicating insight",
    "decision support",
    "analytics implementation",
    "business analytics capstone",
  ],
  "business-intelligence": [
    "BI foundations",
    "decision architecture",
    "data sources and models",
    "dimensional thinking",
    "dashboard design",
    "self-service governance",
    "KPIs and scorecards",
    "insight storytelling",
    "BI operating rhythms",
    "business intelligence capstone",
  ],
  "competency-based-education-assessments": [
    "competency-based foundations",
    "competency and standards",
    "learning outcomes",
    "authentic task design",
    "rubrics and evidence",
    "formative assessment",
    "moderation and quality",
    "inclusive progression",
    "data-informed support",
    "CBE assessment capstone",
  ],
  "communication-presentation-skills": [
    "communication foundations",
    "audience and purpose",
    "message architecture",
    "story and structure",
    "visual communication",
    "voice and presence",
    "facilitation and engagement",
    "questions and difficult moments",
    "rehearsal and feedback",
    "communication capstone",
  ],
  "report-writing-presentation-skills": [
    "report purpose and audience",
    "evidence and source discipline",
    "structure and argument",
    "analysis and synthesis",
    "clear professional language",
    "visualising findings",
    "recommendations and decisions",
    "editing and quality assurance",
    "executive presentation",
    "reporting capstone",
  ],
  "career-guidance-coaching": [
    "career guidance foundations",
    "identity and strengths",
    "interest and fit exploration",
    "goal setting",
    "skills and evidence",
    "career conversations",
    "action planning",
    "transitions and resilience",
    "ethical coaching practice",
    "career coaching capstone",
  ],
  "customer-experience-management": [
    "customer experience foundations",
    "customer insight",
    "journey mapping",
    "service standards",
    "frontline interactions",
    "omnichannel consistency",
    "complaints and recovery",
    "experience measurement",
    "culture and improvement",
    "CX management capstone",
  ],
  "search-engine-optimization": [
    "SEO foundations",
    "search intent and audiences",
    "keyword and topic research",
    "technical discoverability",
    "on-page content",
    "internal linking and information architecture",
    "authority and digital PR",
    "local and international SEO",
    "measurement and optimisation",
    "SEO capstone",
  ],
  "data-analytics": [
    "data analytics foundations",
    "data questions and scope",
    "data preparation",
    "exploratory analysis",
    "statistical thinking",
    "visualisation and storytelling",
    "spreadsheets and SQL",
    "dashboards and decision support",
    "ethical data practice",
    "data analytics capstone",
  ],
};

const courseSeeds = [
  {
    slug: "lead-with-clarity",
    index: "01",
    title: "Lead with Clarity",
    strapline: "Decide with conviction. Align people around meaningful work.",
    description:
      "A rigorous leadership pathway for professionals who need to translate ambiguity into direction, trust, and coordinated action.",
    audience:
      "Emerging leaders, managers, founders, and professionals preparing for broader responsibility.",
    duration: "10 modules · 70 lessons · 10 applied quizzes",
    outcomes: [
      "Frame priorities when demands compete.",
      "Communicate decisions with context and conviction.",
      "Build a practical leadership operating model.",
    ],
    priceKes: COURSE_PRICE_KES,
    stageAmountsKes: [
      COURSE_STAGE_AMOUNT_KES,
      COURSE_STAGE_AMOUNT_KES,
      COURSE_STAGE_AMOUNT_KES,
      COURSE_STAGE_AMOUNT_KES,
    ],
  },
  {
    slug: "strategic-growth-mindset",
    index: "02",
    title: "Strategic Growth Mindset",
    strapline: "Turn change into a disciplined advantage.",
    description:
      "A globally relevant development course connecting learning agility, reflective practice, experimentation, and focused execution.",
    audience:
      "Professionals navigating change, transitions, new markets, or evolving responsibilities.",
    duration: "10 modules · 70 lessons · 10 applied quizzes",
    outcomes: [
      "Replace fixed assumptions with useful experiments.",
      "Create a sustainable rhythm for learning and execution.",
      "Use evidence to turn progress into repeatable capability.",
    ],
    priceKes: COURSE_PRICE_KES,
    stageAmountsKes: [
      COURSE_STAGE_AMOUNT_KES,
      COURSE_STAGE_AMOUNT_KES,
      COURSE_STAGE_AMOUNT_KES,
      COURSE_STAGE_AMOUNT_KES,
    ],
  },
  {
    slug: "professional-presence-influence",
    index: "03",
    title: "Professional Presence & Influence",
    strapline: "Make your contribution clear, credible, and useful.",
    description:
      "A practical course for professionals who want to communicate value, build trust, and influence outcomes with integrity.",
    audience:
      "Consultants, specialists, team leads, client-facing professionals, and career transitioners.",
    duration: "10 modules · 70 lessons · 10 applied quizzes",
    outcomes: [
      "Clarify the value you bring to a conversation.",
      "Strengthen executive communication and professional visibility.",
      "Influence without compromising authenticity or trust.",
    ],
    priceKes: COURSE_PRICE_KES,
    stageAmountsKes: [
      COURSE_STAGE_AMOUNT_KES,
      COURSE_STAGE_AMOUNT_KES,
      COURSE_STAGE_AMOUNT_KES,
      COURSE_STAGE_AMOUNT_KES,
    ],
  },
  {
    slug: "from-insight-to-action",
    index: "04",
    title: "From Insight to Action",
    strapline: "Make learning visible in the way you work.",
    description:
      "An applied intensive that helps you convert reflection into accountable action, useful measures, and sustained professional progress.",
    audience:
      "Modern achievers, coaches, project owners, and professionals with a development goal to execute.",
    duration: "10 modules · 70 lessons · 10 applied quizzes",
    outcomes: [
      "Translate personal insight into a practical action system.",
      "Sequence work around priorities and evidence.",
      "Build accountability that survives busy periods and setbacks.",
    ],
    priceKes: COURSE_PRICE_KES,
    stageAmountsKes: [
      COURSE_STAGE_AMOUNT_KES,
      COURSE_STAGE_AMOUNT_KES,
      COURSE_STAGE_AMOUNT_KES,
      COURSE_STAGE_AMOUNT_KES,
    ],
  },
  {
    slug: "professional-certificate-international-curriculum-pedagogy",
    index: "05",
    title: "Professional Certificate in International Curriculum Pedagogy",
    strapline:
      "Design learning that travels across systems, cultures, and classrooms.",
    description:
      "A document-grounded professional certificate connecting modern pedagogy with British, IB, American, Cambridge/IGCSE, Christian, homeschooling, Pearson Edexcel, early-years, counselling, research, technology, and assessment practice.",
    audience:
      "Teachers, curriculum leaders, school founders, tutors, education consultants, counsellors, and professionals working across international learning contexts.",
    duration:
      "10 modules · 70 lessons · 10 applied quizzes · 400 guided minutes",
    outcomes: [
      "Identify the structure and intent of major international curricula.",
      "Select learner-centred teaching and assessment methods for different curriculum contexts.",
      "Use counselling, professionalism, research, and educational technology to improve curriculum delivery.",
    ],
    priceKes: 14999,
    stageAmountsKes: [3750, 3750, 3750, 3749],
  },
] as const;

const additionalCourseSeeds = [
  {
    slug: "personal-growth-self-discovery",
    index: "06",
    title: "Personal Growth & Self-Discovery",
    strapline:
      "Understand your inner operating system and choose your next chapter with intention.",
    description:
      "A guided development journey for turning self-awareness into practical direction, healthier patterns, and purposeful action.",
    audience:
      "Learners, emerging professionals, coaches, and anyone ready to make personal development more deliberate.",
    outcomes: [
      "Clarify personal values, strengths, and direction.",
      "Recognise patterns that shape choices and relationships.",
      "Build a practical personal growth rhythm.",
    ],
  },
  {
    slug: "building-a-growth-mindset",
    index: "07",
    title: "Building a Growth Mindset",
    strapline:
      "Turn challenge, feedback, and change into a disciplined learning advantage.",
    description:
      "A practical course for replacing limiting assumptions with curiosity, experimentation, resilience, and evidence-led progress.",
    audience:
      "Students, professionals, managers, and teams navigating change or new responsibilities.",
    outcomes: [
      "Use feedback and challenge as inputs for improvement.",
      "Design small experiments that build capability.",
      "Create language and routines that support growth.",
    ],
  },
  {
    slug: "continuous-self-improvement",
    index: "08",
    title: "The Practice of Continuous Self-Improvement",
    strapline:
      "Build the habits, reviews, and feedback loops that keep progress moving.",
    description:
      "A structured improvement system for converting intentions into deliberate practice and sustainable personal capability.",
    audience:
      "Professionals, learners, founders, and development-minded leaders.",
    outcomes: [
      "Create a realistic improvement baseline.",
      "Use deliberate practice and feedback loops.",
      "Review progress and adjust without losing momentum.",
    ],
  },
  {
    slug: "mastering-self-discipline",
    index: "09",
    title: "Mastering Self-Discipline",
    strapline: "Make important actions easier to start, repeat, and finish.",
    description:
      "An applied course on commitment, attention, environment design, recovery, and accountable execution.",
    audience:
      "Professionals, students, entrepreneurs, and anyone managing competing priorities.",
    outcomes: [
      "Design routines that reduce friction.",
      "Recover constructively after lapses.",
      "Sustain execution under pressure.",
    ],
  },
  {
    slug: "mastering-time-management",
    index: "10",
    title: "Mastering Time Management",
    strapline:
      "Protect attention, sequence priorities, and create capacity for meaningful work.",
    description:
      "A modern time-management system linking planning, focus, boundaries, collaboration, and sustainable productivity.",
    audience:
      "Busy professionals, managers, students, and independent practitioners.",
    outcomes: [
      "Translate priorities into realistic plans.",
      "Protect focus and manage interruptions.",
      "Review capacity and improve the way time is used.",
    ],
  },
  {
    slug: "personal-finance-management-essentials",
    index: "11",
    title: "Personal Finance Management Essentials",
    strapline:
      "Build clear, responsible habits for managing money and future choices.",
    description:
      "A foundational financial capability course covering cash flow, budgets, saving, debt, risk, goals, and responsible decision-making.",
    audience:
      "Young professionals, families, students, entrepreneurs, and learners building financial confidence.",
    outcomes: [
      "Read and manage personal cash flow.",
      "Build practical saving and debt strategies.",
      "Connect financial decisions to values and goals.",
    ],
  },
  {
    slug: "self-confidence-and-self-esteem",
    index: "12",
    title: "Building Self-Confidence & Self-Esteem",
    strapline:
      "Trust your contribution, use your voice, and act with grounded confidence.",
    description:
      "A practical confidence-building programme based on evidence, courageous practice, boundaries, visibility, and recovery.",
    audience: "Learners, professionals, leaders, and career transitioners.",
    outcomes: [
      "Separate confidence from perfection.",
      "Practise assertive, visible contribution.",
      "Build evidence-based self-trust.",
    ],
  },
  {
    slug: "emotional-intelligence-mastery",
    index: "13",
    title: "Mastering Emotional Intelligence",
    strapline:
      "Read emotion well, regulate with intention, and strengthen human connection.",
    description:
      "An applied emotional-intelligence course for improving self-awareness, empathy, communication, and relationship management.",
    audience:
      "Leaders, educators, client-facing professionals, teams, and aspiring managers.",
    outcomes: [
      "Recognise emotional signals and triggers.",
      "Regulate responses under pressure.",
      "Use empathy and dialogue to improve relationships.",
    ],
  },
  {
    slug: "personal-brand-strategy",
    index: "14",
    title: "Building a Distinctive Personal Brand",
    strapline:
      "Make your value clear, credible, and memorable across the moments that matter.",
    description:
      "A strategic personal-brand course covering positioning, narrative, visibility, digital presence, reputation, and authentic influence.",
    audience:
      "Professionals, consultants, founders, creatives, and career transitioners.",
    outcomes: [
      "Clarify positioning and value.",
      "Build a coherent professional narrative.",
      "Increase visibility without compromising integrity.",
    ],
  },
  {
    slug: "personal-excellence-mastery",
    index: "15",
    title: "Mastering Personal Excellence",
    strapline:
      "Raise the quality of your choices, execution, and contribution.",
    description:
      "A rigorous personal-excellence pathway focused on standards, ownership, judgement, feedback, service, and sustained impact.",
    audience:
      "High-potential professionals, leaders, specialists, and ambitious learners.",
    outcomes: [
      "Set meaningful standards for quality.",
      "Strengthen ownership and follow-through.",
      "Turn excellence into a repeatable operating practice.",
    ],
  },
  {
    slug: "effective-communication-essentials",
    index: "16",
    title: "Essentials of Effective Communication",
    strapline:
      "Say what matters with clarity, listening, and practical influence.",
    description:
      "A professional communication course covering message design, listening, written communication, feedback, difficult messages, and cultural context.",
    audience:
      "All professionals, students, team leads, and client-facing practitioners.",
    outcomes: [
      "Structure clear verbal and written messages.",
      "Listen for meaning and response.",
      "Handle important conversations with integrity.",
    ],
  },
  {
    slug: "lasting-interpersonal-relationships",
    index: "17",
    title: "Building Lasting Interpersonal Relationships",
    strapline:
      "Create trust, respect, and connection that can withstand pressure.",
    description:
      "A practical relationship-skills programme focused on presence, reciprocity, boundaries, repair, and durable connection.",
    audience:
      "Professionals, leaders, educators, families, and community builders.",
    outcomes: [
      "Build trust through reliable behaviour.",
      "Set healthy boundaries without damaging connection.",
      "Repair tension and sustain relationships over time.",
    ],
  },
  {
    slug: "building-thriving-business-empires",
    index: "18",
    title: "Building Thriving Business Enterprises",
    strapline:
      "Move from opportunity to value, operating discipline, and responsible growth.",
    description:
      "An entrepreneurial business-building course connecting customer insight, value propositions, operating systems, people, finance, and scale.",
    audience:
      "Founders, aspiring entrepreneurs, business leaders, and enterprise teams.",
    outcomes: [
      "Test opportunities against real customer needs.",
      "Design a coherent business model.",
      "Build foundations for responsible growth.",
    ],
  },
  {
    slug: "negotiation-mastery",
    index: "19",
    title: "Mastering the Art of Negotiation",
    strapline:
      "Create value, protect relationships, and reach durable agreements.",
    description:
      "An applied negotiation programme covering preparation, interests, leverage, listening, offers, concessions, ethics, and implementation.",
    audience:
      "Leaders, sales professionals, consultants, procurement teams, and entrepreneurs.",
    outcomes: [
      "Prepare negotiations with clarity and alternatives.",
      "Separate positions from interests.",
      "Reach agreements that can work in practice.",
    ],
  },
  {
    slug: "critical-thinking-problem-solving",
    index: "20",
    title: "Critical Thinking & Problem Solving",
    strapline:
      "Frame complex problems, test assumptions, and choose better solutions.",
    description:
      "A disciplined thinking course connecting evidence, root-cause analysis, creativity, decision criteria, bias awareness, and implementation learning.",
    audience: "Professionals, analysts, leaders, students, and project teams.",
    outcomes: [
      "Define the real problem before solving it.",
      "Evaluate evidence and assumptions.",
      "Test solutions and learn from outcomes.",
    ],
  },
  {
    slug: "creativity-and-innovation",
    index: "21",
    title: "Creativity & Innovation in Practice",
    strapline: "Generate useful possibilities and turn them into tested value.",
    description:
      "A practical innovation course covering observation, ideation, prototyping, experimentation, collaboration, adoption, and responsible scale.",
    audience:
      "Innovators, educators, founders, product teams, and professionals seeking fresh approaches.",
    outcomes: [
      "Generate and select useful ideas.",
      "Prototype and test with evidence.",
      "Build conditions where innovation can be adopted.",
    ],
  },
  {
    slug: "teamwork-and-collaboration",
    index: "22",
    title: "Teamwork & Collaboration",
    strapline:
      "Build shared purpose, psychological safety, and dependable collective performance.",
    description:
      "A modern teamwork course on roles, routines, trust, disagreement, distributed ownership, team learning, and performance habits.",
    audience:
      "Teams, project leads, managers, students, and cross-functional professionals.",
    outcomes: [
      "Create clarity around purpose and contribution.",
      "Use disagreement productively.",
      "Build routines that improve collective delivery.",
    ],
  },
  {
    slug: "leadership-and-self-leadership",
    index: "23",
    title: "Leadership & Self-Leadership",
    strapline:
      "Lead yourself well, then create the conditions for others to do their best work.",
    description:
      "A foundational leadership programme connecting identity, self-leadership, decision courage, communication, development, change, and presence.",
    audience:
      "Emerging leaders, managers, founders, educators, and professionals preparing for greater responsibility.",
    outcomes: [
      "Lead from clear values and direction.",
      "Make accountable decisions under pressure.",
      "Develop people through useful leadership practices.",
    ],
  },
  {
    slug: "adaptability-and-resilience",
    index: "24",
    title: "Adaptability & Resilience",
    strapline:
      "Respond intelligently to change without losing purpose or wellbeing.",
    description:
      "An applied resilience course focused on flexible thinking, pressure responses, disruption, support networks, renewal, and sustainable adaptation.",
    audience:
      "Professionals, leaders, students, teams, and people navigating transition.",
    outcomes: [
      "Read change and choose a constructive response.",
      "Build personal and social resilience resources.",
      "Recover, learn, and adapt after disruption.",
    ],
  },
  {
    slug: "time-management-personal-productivity",
    index: "25",
    title: "Time Management & Personal Productivity",
    strapline: "Turn priorities into focused, sustainable output.",
    description:
      "A practical productivity system for planning, attention, workflow, digital organisation, collaboration capacity, and review.",
    audience:
      "Professionals, students, managers, freelancers, and project owners.",
    outcomes: [
      "Plan from outcomes rather than activity.",
      "Manage attention, energy, and workflow.",
      "Improve output without sacrificing sustainability.",
    ],
  },
  {
    slug: "decision-making-skills",
    index: "26",
    title: "Decision-Making Skills",
    strapline:
      "Make clearer choices when information is incomplete and trade-offs are real.",
    description:
      "A decision-quality course covering framing, evidence, uncertainty, criteria, bias, inclusion, communication, and learning from outcomes.",
    audience: "Leaders, analysts, professionals, founders, and project teams.",
    outcomes: [
      "Frame decisions and options precisely.",
      "Make trade-offs visible.",
      "Improve decision quality through review and learning.",
    ],
  },
  {
    slug: "conflict-resolution-negotiation",
    index: "27",
    title: "Conflict Resolution & Negotiation",
    strapline:
      "Turn tension into dialogue, fair agreements, and restored trust.",
    description:
      "A practical conflict-resolution pathway covering diagnosis, de-escalation, interests, dialogue, resolution options, repair, and prevention.",
    audience:
      "Managers, team leads, educators, HR professionals, and community practitioners.",
    outcomes: [
      "Diagnose the sources of conflict.",
      "Lead constructive resolution conversations.",
      "Build agreements and systems that reduce repeated tension.",
    ],
  },
  {
    slug: "interpersonal-and-relationship-skills",
    index: "28",
    title: "Interpersonal & Relationship Skills",
    strapline:
      "Strengthen the everyday behaviours that make working relationships effective.",
    description:
      "A practical course on rapport, listening, empathy, boundaries, feedback, influence, accountability, and relationship maintenance.",
    audience:
      "Professionals, students, managers, client-facing teams, and community builders.",
    outcomes: [
      "Use presence and listening to build rapport.",
      "Communicate care and clarity together.",
      "Maintain trust through repair and accountability.",
    ],
  },
  {
    slug: "digital-literacy-and-etiquette",
    index: "29",
    title: "Digital Literacy & Digital Etiquette",
    strapline:
      "Work safely, clearly, and respectfully in digital environments.",
    description:
      "A modern digital-capability course covering information quality, online safety, platforms, virtual work, privacy, digital identity, and responsible technology.",
    audience:
      "Students, professionals, educators, teams, and anyone working across digital channels.",
    outcomes: [
      "Evaluate digital information responsibly.",
      "Communicate effectively online and in virtual meetings.",
      "Protect privacy, reputation, and consent.",
    ],
  },
  {
    slug: "presentation-and-public-speaking",
    index: "30",
    title: "Presentation & Public Speaking",
    strapline: "Turn ideas into clear, compelling experiences for an audience.",
    description:
      "A presentation-skills course covering audience insight, story architecture, visuals, voice, questions, facilitation, rehearsal, and virtual delivery.",
    audience: "Professionals, students, educators, leaders, and speakers.",
    outcomes: [
      "Structure presentations around audience needs.",
      "Use voice, visuals, and presence with intention.",
      "Respond confidently to questions and feedback.",
    ],
  },
  {
    slug: "professionalism-and-workplace-ethics",
    index: "31",
    title: "Professionalism & Workplace Ethics",
    strapline:
      "Build credibility through responsible conduct, judgement, and respect.",
    description:
      "A workplace-readiness course connecting values, reliability, confidentiality, inclusion, boundaries, accountability, and ethical action.",
    audience:
      "Students, early-career professionals, managers, teams, and workplace leaders.",
    outcomes: [
      "Translate values into observable conduct.",
      "Navigate ethical choices responsibly.",
      "Build trust through reliable professional practice.",
    ],
  },
  {
    slug: "career-development-employability",
    index: "32",
    title: "Career Development & Employability",
    strapline:
      "Build the evidence, narrative, and relationships that keep opportunity moving.",
    description:
      "A practical career course covering direction, skills evidence, opportunity research, CVs, portfolios, interviews, networking, transitions, and lifelong employability.",
    audience:
      "Students, graduates, professionals, career changers, and returning professionals.",
    outcomes: [
      "Clarify career direction and transferable strengths.",
      "Present credible evidence of capability.",
      "Build a sustainable career development rhythm.",
    ],
  },
  {
    slug: "entrepreneurial-mindset",
    index: "33",
    title: "The Entrepreneurial Mindset",
    strapline:
      "See opportunity, test assumptions, and create value with resourcefulness.",
    description:
      "A practical entrepreneurial-thinking course on opportunity recognition, customer empathy, experimentation, risk, resilience, collaboration, and value creation.",
    audience:
      "Students, professionals, founders, intrapreneurs, and enterprise-minded teams.",
    outcomes: [
      "Recognise opportunities worth testing.",
      "Learn through disciplined experiments.",
      "Create value while managing risk responsibly.",
    ],
  },
  {
    slug: "artificial-intelligence-for-educators",
    index: "34",
    title: "Artificial Intelligence for Educators",
    strapline:
      "Use AI to design richer learning while protecting human judgement and learner dignity.",
    description:
      "A practical, competency-based course for educators who want to apply generative AI to planning, differentiation, feedback, assessment, accessibility, and responsible classroom innovation.",
    audience:
      "Teachers, lecturers, tutors, curriculum leaders, school founders, and education consultants.",
    outcomes: [
      "Design AI-assisted learning experiences aligned to clear outcomes.",
      "Evaluate AI outputs for accuracy, inclusion, and learner value.",
      "Create a responsible implementation plan for a real teaching context.",
    ],
  },
  {
    slug: "artificial-intelligence-generative-ai",
    index: "35",
    title: "Artificial Intelligence & Generative AI",
    strapline:
      "Understand the systems shaping modern work and use them with informed confidence.",
    description:
      "A grounded introduction to AI and generative AI, connecting core concepts with practical text, image, multimodal, workflow, evaluation, privacy, and adoption decisions.",
    audience:
      "Professionals, educators, managers, founders, students, and teams building AI fluency.",
    outcomes: [
      "Explain major AI and generative AI concepts in plain language.",
      "Select appropriate tools for real work tasks.",
      "Apply evaluation, security, and responsible-use checks before adoption.",
    ],
  },
  {
    slug: "generative-ai-prompt-engineering",
    index: "36",
    title: "Generative AI & Prompt Engineering",
    strapline:
      "Turn intent into reliable, reusable instructions for better AI collaboration.",
    description:
      "An applied prompt-engineering studio covering task framing, context, examples, constraints, structured outputs, verification, multi-step workflows, and prompt evaluation.",
    audience:
      "Knowledge workers, educators, analysts, marketers, developers, consultants, and AI-curious professionals.",
    outcomes: [
      "Frame prompts around purpose, context, constraints, and quality criteria.",
      "Build reusable prompt patterns for recurring work.",
      "Test and improve outputs using evidence rather than intuition alone.",
    ],
  },
  {
    slug: "ai-business-organization-transformation",
    index: "37",
    title: "AI for Business & Organizational Transformation",
    strapline:
      "Move from AI enthusiasm to measurable, people-centred transformation.",
    description:
      "A strategic and practical course for identifying high-value AI opportunities, redesigning processes, preparing people, governing risk, and measuring transformation outcomes.",
    audience:
      "Business leaders, transformation managers, operations teams, consultants, and founders.",
    outcomes: [
      "Assess organisational readiness and prioritise valuable use cases.",
      "Design an AI-enabled operating change with clear ownership.",
      "Define adoption, risk, and value measures for an implementation roadmap.",
    ],
  },
  {
    slug: "ai-powered-productivity-automation",
    index: "38",
    title: "AI-Powered Productivity & Automation",
    strapline:
      "Reduce avoidable effort and create more capacity for high-value work.",
    description:
      "A hands-on productivity course connecting AI-assisted writing, research, synthesis, workflow mapping, no-code automation, quality control, and privacy safeguards.",
    audience:
      "Professionals, administrators, project teams, entrepreneurs, and managers improving everyday workflows.",
    outcomes: [
      "Map work to find safe, high-value automation opportunities.",
      "Design repeatable AI-assisted workflows with human checkpoints.",
      "Measure time saved, quality maintained, and risks controlled.",
    ],
  },
  {
    slug: "responsible-ai-ethics-governance",
    index: "39",
    title: "Responsible AI, Ethics & Governance",
    strapline:
      "Build AI practices that are trustworthy, accountable, and fit for purpose.",
    description:
      "A practical governance course on fairness, privacy, transparency, human oversight, safety, procurement, policy controls, and incident response.",
    audience:
      "Leaders, compliance teams, educators, technology professionals, procurement teams, and policy practitioners.",
    outcomes: [
      "Identify ethical and operational risks across an AI lifecycle.",
      "Create proportionate governance controls and accountability roles.",
      "Respond responsibly to incidents, uncertainty, and stakeholder concerns.",
    ],
  },
  {
    slug: "social-media-management",
    index: "40",
    title: "Social Media Management",
    strapline:
      "Build purposeful communities through strategy, consistency, and responsive care.",
    description:
      "A practical social-media management course covering audience insight, platform fit, editorial planning, community care, campaigns, listening, crisis response, and reporting.",
    audience:
      "Marketing teams, entrepreneurs, communications officers, community managers, and creators.",
    outcomes: [
      "Build a channel strategy linked to audience and organisational goals.",
      "Plan and manage useful, consistent content and conversations.",
      "Use social evidence to improve campaigns and protect reputation.",
    ],
  },
  {
    slug: "digital-marketing",
    index: "41",
    title: "Digital Marketing",
    strapline:
      "Connect the right message to the right audience across the digital journey.",
    description:
      "An applied digital-marketing course on customer insight, positioning, content, email journeys, paid media, conversion experience, attribution, and experimentation.",
    audience:
      "Marketing professionals, founders, sales teams, consultants, and growing organisations.",
    outcomes: [
      "Map digital activity to customer needs and business objectives.",
      "Design coherent content and lifecycle journeys.",
      "Use measurement and experiments to improve conversion responsibly.",
    ],
  },
  {
    slug: "research-methods",
    index: "42",
    title: "Research Methods",
    strapline:
      "Ask better questions, gather credible evidence, and communicate what it means.",
    description:
      "A competency-based research course covering question design, literature, qualitative and quantitative methods, sampling, instruments, ethics, analysis, and dissemination.",
    audience:
      "Students, educators, consultants, policy teams, NGO professionals, and workplace researchers.",
    outcomes: [
      "Convert a real problem into a feasible research design.",
      "Select appropriate evidence and collection methods.",
      "Interpret and communicate findings with integrity and practical relevance.",
    ],
  },
  {
    slug: "business-analytics",
    index: "43",
    title: "Business Analytics",
    strapline: "Turn business questions into evidence that improves decisions.",
    description:
      "A practical analytics course covering metrics, data quality, descriptive and diagnostic analysis, forecasting, insight communication, and decision support.",
    audience:
      "Managers, analysts, entrepreneurs, operations teams, and professionals developing data fluency.",
    outcomes: [
      "Translate business priorities into useful analytical questions.",
      "Prepare and interpret evidence for operational decisions.",
      "Present insights with clear actions, limitations, and review measures.",
    ],
  },
  {
    slug: "business-intelligence",
    index: "44",
    title: "Business Intelligence",
    strapline:
      "Design trusted information systems for better organisational decisions.",
    description:
      "A professional BI course covering decision architecture, data sources, modelling, dashboards, KPIs, self-service governance, storytelling, and operating rhythms.",
    audience:
      "Business analysts, data teams, managers, executives, consultants, and reporting owners.",
    outcomes: [
      "Connect organisational decisions to reliable information requirements.",
      "Design useful dashboards, KPIs, and reporting workflows.",
      "Establish governance that balances access, trust, and action.",
    ],
  },
  {
    slug: "competency-based-education-assessments",
    index: "45",
    title: "Competency-Based Education & Assessment",
    strapline:
      "Design learning and assessment around what learners can demonstrate.",
    description:
      "A practical course for translating standards into observable competencies, authentic tasks, evidence-rich rubrics, formative support, moderation, and inclusive progression.",
    audience:
      "Teachers, trainers, curriculum leaders, assessors, school administrators, and education consultants.",
    outcomes: [
      "Write assessable competency statements and learning outcomes.",
      "Design authentic tasks, rubrics, and evidence pathways.",
      "Use assessment data to support progression and improve programme quality.",
    ],
  },
  {
    slug: "communication-presentation-skills",
    index: "46",
    title: "Communication & Presentation Skills",
    strapline:
      "Make important ideas clear, memorable, and useful to an audience.",
    description:
      "An applied communication course covering audience analysis, message architecture, storytelling, visual explanation, voice, facilitation, questions, and feedback.",
    audience:
      "Professionals, educators, students, team leaders, consultants, and public-facing practitioners.",
    outcomes: [
      "Structure messages around audience needs and decisions.",
      "Deliver presentations with confident voice, visuals, and presence.",
      "Adapt communication in response to questions, context, and feedback.",
    ],
  },
  {
    slug: "report-writing-presentation-skills",
    index: "47",
    title: "Report Writing & Presentation Skills",
    strapline:
      "Move from evidence to a report that decision-makers can trust and use.",
    description:
      "A professional reporting course on evidence discipline, argument, synthesis, clear language, data visualisation, recommendations, quality assurance, and executive presentation.",
    audience:
      "Analysts, researchers, consultants, administrators, managers, students, and reporting professionals.",
    outcomes: [
      "Build a clear argument from credible evidence.",
      "Present findings through readable reports and purposeful visuals.",
      "Turn analysis into recommendations with ownership and next steps.",
    ],
  },
  {
    slug: "career-guidance-coaching",
    index: "48",
    title: "Career Guidance & Coaching",
    strapline:
      "Help people connect strengths, possibility, and action with care.",
    description:
      "A practical career-development course covering identity, interests, fit, goals, evidence, coaching conversations, transitions, resilience, and ethical practice.",
    audience:
      "Career advisers, coaches, educators, HR professionals, mentors, and people supporting learner transitions.",
    outcomes: [
      "Use structured conversations to clarify career direction.",
      "Connect strengths and interests to realistic opportunities.",
      "Create ethical, actionable career plans that the learner owns.",
    ],
  },
  {
    slug: "customer-experience-management",
    index: "49",
    title: "Customer Experience Management",
    strapline:
      "Design dependable experiences that earn trust before, during, and after service.",
    description:
      "An applied CX course covering customer insight, journey mapping, service standards, frontline interactions, omnichannel consistency, recovery, measurement, and culture.",
    audience:
      "Customer-service leaders, operations teams, marketers, founders, sales professionals, and experience designers.",
    outcomes: [
      "Map customer journeys and identify moments that shape trust.",
      "Design practical standards and recovery responses.",
      "Use experience evidence to improve service systems and team behaviour.",
    ],
  },
  {
    slug: "search-engine-optimization",
    index: "50",
    title: "Search Engine Optimization",
    strapline: "Make useful content easier for the right people to discover.",
    description:
      "A practical SEO course covering search intent, topic research, technical discoverability, content, information architecture, authority, local and international search, and measurement.",
    audience:
      "Marketers, content teams, entrepreneurs, communications professionals, and web owners.",
    outcomes: [
      "Connect search intent to useful content and page experience.",
      "Identify technical and structural barriers to discoverability.",
      "Build an ethical optimisation plan using evidence and ongoing review.",
    ],
  },
  {
    slug: "data-analytics",
    index: "51",
    title: "Data Analytics",
    strapline:
      "Work confidently from raw data to responsible insight and action.",
    description:
      "A hands-on data-analytics course covering data questions, preparation, exploration, statistical thinking, visualisation, spreadsheets, SQL, dashboards, and ethical practice.",
    audience:
      "Analysts, professionals, students, researchers, managers, and teams building practical data capability.",
    outcomes: [
      "Prepare and explore data with disciplined reasoning.",
      "Choose appropriate analyses and visualisations for the question.",
      "Communicate limitations, insights, and decisions responsibly.",
    ],
  },
].map(course => ({
  ...course,
  duration: "10 modules · 70 lessons · 10 applied quizzes · 400 guided minutes",
  priceKes: STANDARD_COURSE_PRICE_KES,
  stageAmountsKes: STANDARD_COURSE_STAGE_AMOUNTS_KES,
}));

const courseCoverByCategory: Record<CourseCategory, string> = {
  "AI & Digital": "/cover-ai-learning_e7060957.svg",
  "Business & Analytics": "/cover-insight-analytics_3177ed26.svg",
  "Education & Research": "/cover-people-practice_342ff6e3.svg",
  "Communication & Career": "/cover-digital-growth_c45a2cd5.svg",
  "Leadership & Workplace": "/cover-customer-value_969a689e.svg",
  "Personal Development": "/cover-people-practice_342ff6e3.svg",
};

const skillLevelOverrides: Record<string, CourseSkillLevel> = {
  "artificial-intelligence-for-educators": "Practitioner",
  "artificial-intelligence-generative-ai": "Foundation",
  "generative-ai-prompt-engineering": "Practitioner",
  "ai-business-organization-transformation": "Advanced",
  "ai-powered-productivity-automation": "Foundation",
  "responsible-ai-ethics-governance": "Advanced",
  "social-media-management": "Practitioner",
  "digital-marketing": "Practitioner",
  "research-methods": "Practitioner",
  "business-analytics": "Practitioner",
  "business-intelligence": "Advanced",
  "competency-based-education-assessments": "Advanced",
  "communication-presentation-skills": "Foundation",
  "report-writing-presentation-skills": "Practitioner",
  "career-guidance-coaching": "Foundation",
  "customer-experience-management": "Practitioner",
  "search-engine-optimization": "Practitioner",
  "data-analytics": "Practitioner",
};

const courseCategoryFor = (course: {
  slug: string;
  title: string;
}): CourseCategory => {
  const value = `${course.slug} ${course.title}`.toLowerCase();
  if (
    /artificial-intelligence|generative-ai|prompt-engineering|social-media|digital-marketing|search-engine-optimization|digital-literacy/.test(
      value
    )
  )
    return "AI & Digital";
  if (
    /research-methods|curriculum|pedagogy|competency-based-education/.test(
      value
    )
  )
    return "Education & Research";
  if (
    /business-analytics|business-intelligence|data-analytics|personal-finance|business-empires|entrepreneurial/.test(
      value
    )
  )
    return "Business & Analytics";
  if (
    /communication|presentation|report-writing|career-|customer-experience/.test(
      value
    )
  )
    return "Communication & Career";
  if (
    /leadership|teamwork|conflict|professionalism|emotional-intelligence|negotiation/.test(
      value
    )
  )
    return "Leadership & Workplace";
  if (
    /decision|creativity|adaptability|time-management|self-discipline/.test(
      value
    )
  )
    return "Personal Development";
  return "Personal Development";
};

const courseSkillLevelFor = (course: {
  slug: string;
  title: string;
}): CourseSkillLevel => {
  if (skillLevelOverrides[course.slug]) return skillLevelOverrides[course.slug];
  const value = `${course.slug} ${course.title}`.toLowerCase();
  if (
    /professional-certificate|mastering|lead|strategic|advanced|emotional-intelligence|negotiation/.test(
      value
    )
  )
    return "Advanced";
  if (
    /essentials|personal-growth|self-discovery|growth-mindset|communication|confidence/.test(
      value
    )
  )
    return "Foundation";
  return "Practitioner";
};

export const courseCatalog: CourseDefinition[] = [
  ...courseSeeds,
  ...additionalCourseSeeds,
].map(course => {
  const category = courseCategoryFor(course);
  return {
    ...course,
    modules:
      course.slug ===
      "professional-certificate-international-curriculum-pedagogy"
        ? buildIcpcModules(course)
        : buildModules(course),
    category,
    skillLevel: courseSkillLevelFor(course),
    coverImage: courseCoverByCategory[category],
  };
});
export const getCourseBySlug = (slug: string) =>
  courseCatalog.find(course => course.slug === slug);

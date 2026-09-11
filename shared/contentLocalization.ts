import type {
  CourseDefinition,
  CourseLesson,
  CourseQuizQuestion,
} from "@shared/courseCatalog";
import { localizeCourseMetadata } from "@shared/courseMetadataLocalization";

export type ContentLocale = "en";

type LongFormCopy = {
  headings: [string, string, string, string, string, string];
  summary: string;
  outcome: string;
  objectives: [string, string, string];
  sections: [string, string, string, string, string, string];
  callouts: [string, string];
  example: [string, string, string];
  simulation: {
    prompt: string;
    options: [string, string, string];
    feedback: [string, string, string];
  };
  reflection: string;
  takeaway: string;
  signal: string;
  caption: string;
  quizPrompts: [string, string, string, string];
  quizOptions: [string, string, string, string];
  quizFeedback: [string, string, string, string];
  quizExplanation: string;
};

export type LessonInteractiveCopy = {
  responsePrompts: [string, string, string];
  responsePlaceholders: [string, string, string];
  lessonComplete: string;
  lessonCompleteDescription: string;
  quizReady: string;
  quizReadyDescription: string;
};

const interactiveCopy: LessonInteractiveCopy = {
  responsePrompts: [
    "Name one real situation where this lesson matters for you. What happened, and what did you notice?",
    "Write the specific action you will take within the next seven days.",
    "Define the evidence you will review and the question you will ask after the experiment.",
  ],
  responsePlaceholders: [
    "Describe the situation and the signal you noticed…",
    "Write one observable action, including when or where you will do it…",
    "Describe the result you will look for and how you will review it…",
  ],
  lessonComplete: "Lesson complete",
  lessonCompleteDescription:
    "Your learning response and progress have been saved.",
  quizReady: "Module quiz unlocked",
  quizReadyDescription:
    "Your required lesson work is complete. You can now test your understanding.",
};

export function getLessonInteractiveCopy(
  _locale?: ContentLocale
): LessonInteractiveCopy {
  return interactiveCopy;
}

export type LessonIllustrationCopy = {
  explanatory: string;
  applicational: string;
  experiential: string;
};

const illustrationCopy: LessonIllustrationCopy = {
  explanatory: "Explanatory lens",
  applicational: "Everyday application",
  experiential: "Experiential moment",
};

export function getLessonIllustrationCopy(
  _locale?: ContentLocale
): LessonIllustrationCopy {
  return illustrationCopy;
}

export type ExperientialActivityCopy = {
  title: string;
  instruction: string;
  reflectionPrompt: string;
  completionMessage: string;
};

const experientialActivityCopy: ExperientialActivityCopy = {
  title: "Experiential activity",
  instruction:
    "Apply what you learned in a real situation within the next 48 hours. Then reflect on the outcome.",
  reflectionPrompt: "What happened? What did you notice? What will you adjust?",
  completionMessage: "Activity complete — reflection saved.",
};

export function getExperientialActivityCopy(
  _locale?: ContentLocale
): ExperientialActivityCopy {
  return experientialActivityCopy;
}

export type LessonCopy = LongFormCopy & {
  interactive: LessonInteractiveCopy;
  illustration: LessonIllustrationCopy;
  experientialActivity: ExperientialActivityCopy;
};

const longFormCopy: LongFormCopy = {
  headings: [
    "Context",
    "Core concept",
    "How it works",
    "Why it matters",
    "Applying it",
    "Reflection",
  ],
  summary:
    "This lesson gives you a practical frame you can use immediately. Each section builds toward a concrete action you can test in your context.",
  outcome:
    "By the end of this lesson, you will be able to recognize the pattern, apply the frame, and evaluate the result.",
  objectives: [
    "Identify the core signal in your environment.",
    "Apply the framework to a live situation.",
    "Evaluate the outcome and decide the next step.",
  ],
  sections: [
    "The situation",
    "The framework",
    "The practice",
    "The evidence",
    "The adjustment",
    "The signal",
  ],
  callouts: [
    "Notice what changes when you use this frame.",
    "Share your observation with a peer for perspective.",
  ],
  example: [
    "A manager notices team energy drop after a policy change.",
    "They apply the frame: signal → context → response.",
    "They adjust communication and measure engagement.",
  ],
  simulation: {
    prompt: "You notice a pattern. What is your first move?",
    options: [
      "Gather more data before acting.",
      "Apply the frame and test a small response.",
      "Escalate to leadership immediately.",
    ],
    feedback: [
      "Data helps, but the frame works with what you have now.",
      "Correct — a small test reveals the signal quickly.",
      "Escalation is for blockers, not first moves.",
    ],
  },
  reflection: "What signal did you notice? What did you try? What changed?",
  takeaway: "The frame turns noise into a signal you can act on.",
  signal: "Signal over noise. Action over analysis.",
  caption: "Signal over noise. Action over analysis.",
  quizPrompts: [
    "What is the first step when you notice a pattern?",
    "How do you test a response without overcommitting?",
    "What indicates the frame is working?",
    "When do you escalate instead of test?",
  ],
  quizOptions: [
    "Apply the frame and test a small response",
    "Wait for perfect data",
    "Delegate the decision",
    "Escalate immediately",
  ],
  quizFeedback: [
    "The frame is designed for immediate, low-risk testing.",
    "Waiting delays the signal. Test with what you have.",
    "The frame is personal — you apply it, then share.",
    "Escalation is for when testing hits a blocker.",
  ],
  quizExplanation:
    "The lesson teaches a repeatable pattern: notice → frame → test → evaluate. Each cycle builds confidence and clarity.",
};

export function getLessonCopy(
  _locale?: ContentLocale,
  _lesson?: CourseLesson
): LessonCopy {
  return {
    ...longFormCopy,
    interactive: interactiveCopy,
    illustration: illustrationCopy,
    experientialActivity: experientialActivityCopy,
  };
}

export type QuizQuestionCopy = {
  questionPrefix: string;
  optionLabels: [string, string, string, string];
  feedbackCorrect: string;
  feedbackIncorrect: string;
};

const quizQuestionCopy: QuizQuestionCopy = {
  questionPrefix: "Question",
  optionLabels: ["Option A", "Option B", "Option C", "Option D"],
  feedbackCorrect: "Correct. This aligns with the lesson framework.",
  feedbackIncorrect:
    "Not quite. Review the lesson framework and try again.",
};

export function getQuizQuestionCopy(
  _locale?: ContentLocale,
  _question?: CourseQuizQuestion
): QuizQuestionCopy {
  return quizQuestionCopy;
}

export type CourseCopy = {
  title: string;
  description: string;
  outcomes: string[];
};

export function getCourseCopy(
  _locale?: ContentLocale,
  course?: CourseDefinition
): CourseCopy {
  const localized = localizeCourseMetadata(
    "en",
    course?.slug ?? "",
    course?.title ?? "",
    course?.description ?? ""
  );
  return {
    title: localized.title,
    description: localized.description,
    outcomes: [...(course?.outcomes ?? [])],
  };
}

export function localizeCourseDefinition(
  _locale: string,
  course: CourseDefinition
): CourseDefinition {
  const localized = localizeCourseMetadata("en", course.slug, course.title, course.description);
  return {
    ...course,
    title: localized.title,
    description: localized.description,
  };
}
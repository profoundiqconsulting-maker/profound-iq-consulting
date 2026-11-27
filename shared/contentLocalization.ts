export type LessonInteractiveCopy = {
  responsePrompts: [string, string, string];
  responsePlaceholders: [string, string, string];
  lessonComplete: string;
  lessonCompleteDescription: string;
  quizReady: string;
  quizReadyDescription: string;
};

export const lessonInteractiveCopy: LessonInteractiveCopy = {
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

export type LessonIllustrationCopy = {
  explanatory: string;
  applicational: string;
  experiential: string;
};

export const lessonIllustrationCopy: LessonIllustrationCopy = {
  explanatory: "Explanatory lens",
  applicational: "Everyday application",
  experiential: "Experiential moment",
};

import { describe, expect, it } from "vitest";
import { localizeAssessmentPrompt, localizeContentText, localizeCourseDefinition } from "./contentLocalization";
import { courseCatalog } from "./courseCatalog";

describe("content localization", () => {
  it("localizes recurring course material labels", () => {
    expect(localizeContentText("fr", "Build the mental model")).toBe("Construire le modèle mental");
    expect(localizeContentText("en", "Build the mental model")).toBe("Build the mental model");
  });

  it("localizes assessment dimension prompt suffixes without changing prompt identity", () => {
    expect(localizeAssessmentPrompt("ar", "I can explain the priority that matters most (clarity)", "clarity")).toContain("(الوضوح)");
    expect(localizeAssessmentPrompt("de", "A prompt without a suffix", "clarity")).toBe("A prompt without a suffix");
  });

  it("projects substantial lesson and quiz copy for every supported locale", () => {
    const source = courseCatalog[0];
    const sourceLesson = source.modules[0].lessons[0];
    const sourceQuiz = source.modules[0].quiz[0];
    const locales = ["sw", "fr", "es", "pt", "ar", "zh", "hi", "de", "ja"] as const;
    for (const locale of locales) {
      const localized = localizeCourseDefinition(locale, source);
      const lesson = localized.modules[0].lessons[0];
      const quiz = localized.modules[0].quiz[0];
      expect(lesson.sections).toHaveLength(sourceLesson.sections.length);
      expect(lesson.sections.reduce((total, section) => total + section.body.length, 0)).toBeGreaterThan(400);
      expect(lesson.sections[0].body).not.toBe(sourceLesson.sections[0].body);
      expect(lesson.simulation?.options).toHaveLength(3);
      expect(quiz.prompt).not.toBe(sourceQuiz.prompt);
      expect(quiz.optionExplanations).toHaveLength(4);
      expect(quiz.correctOption).toBeGreaterThanOrEqual(0);
      expect(quiz.correctOption).toBeLessThan(quiz.options.length);
    }
  });
});

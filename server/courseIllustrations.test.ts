import { describe, expect, it } from "vitest";
import { courseCatalog } from "@shared/courseCatalog";
import { localizeCourseDefinition, type ContentLocale } from "@shared/contentLocalization";

const locales: ContentLocale[] = ["en", "sw", "fr", "es", "pt", "ar", "zh", "hi", "de", "ja"];

describe("course lesson illustration enrichment", () => {
  it("provides explanatory, applicational, and experiential content for every catalog lesson", () => {
    const lessons = courseCatalog.flatMap((course) => course.modules.flatMap((module) => module.lessons));
    expect(lessons.length).toBeGreaterThan(0);
    for (const lesson of lessons) {
      expect(lesson.illustration.explanatory.trim()).not.toBe("");
      expect(lesson.illustration.applicational.trim()).not.toBe("");
      expect(lesson.illustration.experiential.trim()).not.toBe("");
    }
  });

  it("keeps illustration labels available in all supported lesson locales", () => {
    const representative = courseCatalog[0];
    for (const locale of locales) {
      const localized = localizeCourseDefinition(locale, representative);
      const illustration = localized.modules[0]?.lessons[0]?.illustration;
      expect(illustration?.label).toMatch(/\S/);
      expect(illustration?.caption).toMatch(/\S/);
      expect(illustration?.explanatory).toMatch(/\S/);
      expect(illustration?.applicational).toMatch(/\S/);
      expect(illustration?.experiential).toMatch(/\S/);
    }
  });
});

describe("experiential activity localization", () => {
  it("projects localized questions, options, feedback, and reflection prompts for all supported locales", () => {
    const representative = courseCatalog[0];
    const baseline = localizeCourseDefinition("en", representative).modules[0]?.lessons[0]?.illustration;
    expect(baseline).toBeDefined();
    for (const locale of locales) {
      const illustration = localizeCourseDefinition(locale, representative).modules[0]?.lessons[0]?.illustration;
      expect(illustration?.experientialQuestion).toMatch(/\S/);
      expect(illustration?.experientialOptions).toHaveLength(3);
      expect(illustration?.experientialFeedback).toHaveLength(3);
      expect(illustration?.experientialReflectionPrompt).toMatch(/\S/);
      for (const value of [...(illustration?.experientialOptions ?? []), ...(illustration?.experientialFeedback ?? [])]) expect(value).toMatch(/\S/);
    }
  });
});

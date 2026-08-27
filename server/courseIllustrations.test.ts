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

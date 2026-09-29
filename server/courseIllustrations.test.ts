import { describe, expect, it } from "vitest";
import { courseCatalog } from "@shared/courseCatalog";

describe("course lesson illustration enrichment", () => {
  it("provides explanatory, applicational, and experiential content for every catalog lesson", () => {
    const lessons = courseCatalog.flatMap(course =>
      course.modules.flatMap(module => module.lessons)
    );
    expect(lessons.length).toBeGreaterThan(0);
    for (const lesson of lessons) {
      expect(lesson.illustration.explanatory.trim()).not.toBe("");
      expect(lesson.illustration.applicational.trim()).not.toBe("");
      expect(lesson.illustration.experiential.trim()).not.toBe("");
    }
  });

  it("keeps illustration labels populated for a representative lesson", () => {
    const illustration = courseCatalog[0].modules[0]?.lessons[0]?.illustration;
    expect(illustration?.label).toMatch(/\S/);
    expect(illustration?.caption).toMatch(/\S/);
    expect(illustration?.explanatory).toMatch(/\S/);
    expect(illustration?.applicational).toMatch(/\S/);
    expect(illustration?.experiential).toMatch(/\S/);
  });
});

describe("experiential activity content", () => {
  it("projects questions, options, feedback, and reflection prompts", () => {
    const illustration = courseCatalog[0].modules[0]?.lessons[0]?.illustration;
    expect(illustration).toBeDefined();
    expect(illustration?.experientialQuestion).toMatch(/\S/);
    expect(illustration?.experientialOptions).toHaveLength(3);
    expect(illustration?.experientialFeedback).toHaveLength(3);
    expect(illustration?.experientialReflectionPrompt).toMatch(/\S/);
    for (const value of [
      ...(illustration?.experientialOptions ?? []),
      ...(illustration?.experientialFeedback ?? []),
    ]) {
      expect(value).toMatch(/\S/);
    }
  });
});

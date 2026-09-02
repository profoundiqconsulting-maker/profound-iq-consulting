import { describe, expect, it } from "vitest";
import { courseCatalog } from "../shared/courseCatalog";

const supportedModes = ["explanatory", "applicational", "experiential"] as const;

describe("course illustration interactions", () => {
  it("provides a generated explanatory visual and story activity for every lesson", () => {
    const lessons = courseCatalog.flatMap((course) => course.modules.flatMap((module) => module.lessons));
    expect(lessons.length).toBeGreaterThan(0);
    for (const lesson of lessons) {
      expect(lesson.illustration.visualUrl).toMatch(/^\/piq-explainer-.+\.svg$/);
      expect(lesson.illustration.visualAlt.length).toBeGreaterThan(10);
      expect(lesson.illustration.experientialOptions).toHaveLength(3);
      expect(lesson.illustration.experientialFeedback).toHaveLength(3);
      expect(lesson.illustration.experientialQuestion.length).toBeGreaterThan(20);
      expect(lesson.illustration.experientialReflectionPrompt.length).toBeGreaterThan(20);
      expect(lesson.responseTasks.map((task) => task.id)).toEqual(expect.arrayContaining(["experience-choice", "experience-reflection"]));
    }
  });

  it("keeps the three illustration modes distinct across the catalog", () => {
    const lessons = courseCatalog.flatMap((course) => course.modules.flatMap((module) => module.lessons));
    for (const lesson of lessons) {
      expect(supportedModes).toEqual(["explanatory", "applicational", "experiential"]);
      expect(new Set([lesson.illustration.explanatory, lesson.illustration.applicational, lesson.illustration.experiential]).size).toBe(3);
    }
  });
});

import { describe, expect, it } from "vitest";
import {
  localizeCourseDefinition,
  getLessonInteractiveCopy,
  getLessonIllustrationCopy,
} from "./contentLocalization";
import { courseCatalog } from "./courseCatalog";

describe("content localization", () => {
  it("returns English course definitions", () => {
    const leadership = courseCatalog.find(
      (course) => course.slug === "lead-with-clarity"
    )!;
    const localized = localizeCourseDefinition("en", leadership);
    expect(localized.title).toBe(leadership.title);
    expect(localized.description).toBe(leadership.description);
    expect(localized.modules).toEqual(leadership.modules);
  });

  it("returns English interactive copy", () => {
    const copy = getLessonInteractiveCopy("en");
    expect(copy.lessonComplete).toBe("Lesson complete");
    expect(copy.responsePrompts).toHaveLength(3);
    expect(copy.responsePlaceholders).toHaveLength(3);
  });

  it("returns English illustration copy", () => {
    const copy = getLessonIllustrationCopy("en");
    expect(copy.explanatory).toBe("Explanatory lens");
    expect(copy.applicational).toBe("Everyday application");
    expect(copy.experiential).toBe("Experiential moment");
  });

  it("returns consistent English copy regardless of locale parameter", () => {
    const copy1 = getLessonInteractiveCopy("en");
    const copy2 = getLessonInteractiveCopy("fr");
    const copy3 = getLessonInteractiveCopy("sw");
    expect(copy1).toEqual(copy2);
    expect(copy2).toEqual(copy3);
  });
});
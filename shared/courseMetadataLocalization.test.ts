import { describe, expect, it } from "vitest";
import { courseCatalog } from "./courseCatalog";
import {
  courseTitleTranslationsComplete,
  localizeCourseMetadata,
} from "./courseMetadataLocalization";

describe("course metadata localization", () => {
  it("covers every catalog course title", () => {
    expect(courseTitleTranslationsComplete()).toBe(courseCatalog.length);
  });

  it("returns localized title and description for every supported locale", () => {
    const locales = [
      "en",
      "sw",
      "fr",
      "es",
      "pt",
      "ar",
      "zh",
      "hi",
      "de",
      "ja",
    ] as const;
    for (const course of courseCatalog) {
      for (const locale of locales) {
        const metadata = localizeCourseMetadata(
          locale,
          course.slug,
          course.title,
          course.description
        );
        expect(metadata.title.length).toBeGreaterThan(0);
        expect(metadata.description.length).toBeGreaterThan(0);
      }
    }
  });

  it("preserves English canonical metadata and safely falls back for unknown slugs", () => {
    const course = courseCatalog[0];
    expect(
      localizeCourseMetadata(
        "en",
        course.slug,
        course.title,
        course.description
      )
    ).toEqual({ title: course.title, description: course.description });
    expect(
      localizeCourseMetadata(
        "fr",
        "unknown-course",
        course.title,
        course.description
      ).title
    ).toBe(course.title);
  });
});

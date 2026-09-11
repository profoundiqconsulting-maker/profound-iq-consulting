import { describe, expect, it } from "vitest";
import { courseCatalog } from "./courseCatalog";
import { localizeCourseMetadata } from "./courseMetadataLocalization";

describe("course metadata localization", () => {
  it("returns English title and description for every course", () => {
    for (const course of courseCatalog) {
      const metadata = localizeCourseMetadata(
        "en",
        course.slug,
        course.title,
        course.description
      );
      expect(metadata.title).toBe(course.title);
      expect(metadata.description).toBe(course.description);
      expect(metadata.title.length).toBeGreaterThan(0);
      expect(metadata.description.length).toBeGreaterThan(0);
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
        "en",
        "unknown-course",
        course.title,
        course.description
      ).title
    ).toBe(course.title);
  });
});
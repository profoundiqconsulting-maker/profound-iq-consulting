import { describe, expect, it } from "vitest";
import { courseCategoryLocales, localizeCourseCategory } from "./courseCategoryLocalization";

describe("course category localization", () => {
  it("supports all ten configured locales", () => {
    expect(courseCategoryLocales).toEqual(["en", "sw", "fr", "es", "pt", "ar", "zh", "hi", "de", "ja"]);
    for (const locale of courseCategoryLocales) {
      const label = localizeCourseCategory(locale, "Business & Enterprise");
      if (locale === "en") expect(label).toBe("Business & Enterprise");
      else expect(label).not.toBe("Business & Enterprise");
    }
  });

  it("falls back safely for unknown locales and categories", () => {
    expect(localizeCourseCategory("xx", "Business & Enterprise")).toBe("Business & Enterprise");
    expect(localizeCourseCategory("en", "Unknown")).toBe("Unknown");
  });
});

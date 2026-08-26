import { describe, expect, it } from "vitest";
import { getAssessmentCopy, supportedAssessmentCopyLocales } from "./assessmentLocalization";

describe("assessment localization copy", () => {
  it("covers all supported locales with non-empty workflow labels", () => {
    expect(supportedAssessmentCopyLocales).toEqual(["en", "sw", "fr", "es", "pt", "ar", "zh", "hi", "de", "ja"]);
    for (const locale of supportedAssessmentCopyLocales) {
      const copy = getAssessmentCopy(locale);
      expect(copy.startOver).toBeTruthy();
      expect(copy.saveNow).toBeTruthy();
      expect(copy.nextModule).toBeTruthy();
      expect(copy.progressRestoredDescription).toBeTruthy();
    }
  });

  it("falls back safely for unknown locale values", () => {
    expect(getAssessmentCopy("unknown")).toEqual(getAssessmentCopy("en"));
  });
});

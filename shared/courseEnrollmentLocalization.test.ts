import { describe, expect, it } from "vitest";
import { getCourseEnrollmentCopy } from "./courseEnrollmentLocalization";

describe("course enrollment localization", () => {
  it("returns complete checkout copy in each supported locale", () => {
    for (const locale of ["en", "sw", "fr", "es", "pt", "ar", "zh", "hi", "de", "ja"]) {
      const copy = getCourseEnrollmentCopy(locale);
      expect(copy.reserveYourPlace).toBeTruthy();
      expect(copy.continueCheckout).toBeTruthy();
      expect(copy.submitInterest).toBeTruthy();
      expect(copy.payment).toBeTruthy();
    }
  });

  it("falls back to English for an unknown locale", () => {
    expect(getCourseEnrollmentCopy("xx").reserveYourPlace).toBe("Reserve your place.");
    expect(getCourseEnrollmentCopy("xx").submitInterest).toBe("Submit enrollment interest");
  });
});

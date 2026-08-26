import { describe, expect, it } from "vitest";
import { getGeneratedCopy } from "./generatedLocalization";
import { getLocalizedTranslation, SUPPORTED_LOCALES } from "../client/src/contexts/LocaleContext";

describe("sitewide localization coverage", () => {
  it("provides non-empty core navigation labels for every supported locale", () => {
    for (const { code } of SUPPORTED_LOCALES) {
      expect(getLocalizedTranslation(code, "selfAssessment")).toBeTruthy();
      expect(getLocalizedTranslation(code, "courses")).toBeTruthy();
      expect(getLocalizedTranslation(code, "myWorkspace")).toBeTruthy();
      expect(getLocalizedTranslation(code, "backToSite")).toBeTruthy();
    }
  });

  it("provides non-empty generated labels for every supported locale", () => {
    for (const locale of ["en", "sw", "fr", "es", "pt", "ar", "zh", "hi", "de", "ja"] as const) {
      const copy = getGeneratedCopy(locale);
      expect(copy.assessmentReport.length).toBeGreaterThan(0);
      expect(copy.certificateOfCompletion.length).toBeGreaterThan(0);
      expect(copy.paymentReceipt.length).toBeGreaterThan(0);
      expect(copy.verifyCredential.length).toBeGreaterThan(0);
    }
  });
});

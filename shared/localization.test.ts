import { describe, expect, it } from "vitest";
import { detectLocaleFromPreferences, getLocaleDirection, getLocalizedTranslation, isSupportedLocale, SUPPORTED_LOCALES } from "../client/src/contexts/LocaleContext";

describe("sitewide localization", () => {
  it("supports a broad major-language locale set", () => {
    expect(SUPPORTED_LOCALES.map(({ code }) => code)).toEqual(["en", "sw", "fr", "es", "pt", "ar", "zh", "hi", "de", "ja"]);
    expect(isSupportedLocale("sw")).toBe(true);
    expect(isSupportedLocale("xx")).toBe(false);
  });

  it("marks Arabic as right-to-left and keeps other supported locales left-to-right", () => {
    expect(getLocaleDirection("ar")).toBe("rtl");
    expect(getLocaleDirection("fr")).toBe("ltr");
  });

  it("detects the first supported browser preference, including regional variants", () => {
    expect(detectLocaleFromPreferences(["pt-BR", "fr-FR"])).toBe("pt");
    expect(detectLocaleFromPreferences(["xx-ZZ", "ar-EG"])).toBe("ar");
    expect(detectLocaleFromPreferences(["xx-ZZ"])).toBe("en");
  });

  it("returns translated copy with English fallback for shared keys", () => {
    expect(getLocalizedTranslation("sw", "selfAssessment")).toBe("Tathmini binafsi");
    expect(getLocalizedTranslation("fr", "privacyPolicy")).toBe("Politique de confidentialité");
    expect(getLocalizedTranslation("ja", "courses")).toBe("コース");
    expect(getLocalizedTranslation("sw", "emailAddress")).toBe("Email address");
  });
});

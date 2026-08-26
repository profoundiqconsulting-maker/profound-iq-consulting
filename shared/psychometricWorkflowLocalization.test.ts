import { describe, expect, it } from "vitest";
import { getPsychometricWorkflowCopy, psychometricWorkflowLocales } from "./psychometricWorkflowLocalization";

describe("psychometric workflow localization", () => {
  it("provides the full workflow copy contract in all ten supported locales", () => {
    expect(psychometricWorkflowLocales).toEqual(["en", "sw", "fr", "es", "pt", "ar", "zh", "hi", "de", "ja"]);
    for (const locale of psychometricWorkflowLocales) {
      const copy = getPsychometricWorkflowCopy(locale);
      for (const value of Object.values(copy)) expect(value.trim().length).toBeGreaterThan(0);
    }
  });

  it("falls back safely for an unknown locale", () => {
    expect(getPsychometricWorkflowCopy("xx")).toEqual(getPsychometricWorkflowCopy("en"));
  });
});


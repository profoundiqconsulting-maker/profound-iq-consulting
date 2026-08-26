import { describe, expect, it } from "vitest";
import { localizeAssessmentPrompt, localizeContentText } from "./contentLocalization";

describe("content localization", () => {
  it("localizes recurring course material labels", () => {
    expect(localizeContentText("fr", "Build the mental model")).toBe("Construire le modèle mental");
    expect(localizeContentText("en", "Build the mental model")).toBe("Build the mental model");
  });

  it("localizes assessment dimension prompt suffixes without changing prompt identity", () => {
    expect(localizeAssessmentPrompt("ar", "I can explain the priority that matters most (clarity)", "clarity")).toContain("(الوضوح)");
    expect(localizeAssessmentPrompt("de", "A prompt without a suffix", "clarity")).toBe("A prompt without a suffix");
  });
});

import { describe, expect, it } from "vitest";
import { getGeneratedCopy, normalizeGeneratedLocale } from "./generatedLocalization";

describe("generated localization", () => {
  it("returns native labels for supported locales", () => {
    expect(getGeneratedCopy("fr").assessmentReport).toBe("Rapport d’évaluation");
    expect(getGeneratedCopy("ar").certificateOfCompletion).toBe("شهادة إتمام");
    expect(getGeneratedCopy("sw").paymentReceipt).toBe("Risiti ya malipo");
  });

  it("falls back safely for unknown locale values", () => {
    expect(normalizeGeneratedLocale("xx")).toBe("en");
    expect(getGeneratedCopy("xx").paymentReceipt).toBe("Payment receipt");
  });
});

import { describe, expect, it } from "vitest";
import { getAuthCopy } from "./authLocalization";

describe("authentication localization", () => {
  it("provides primary authentication labels for every supported locale", () => {
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
    for (const locale of locales) {
      const copy = getAuthCopy(locale);
      expect(copy.privateAccess).toBeTruthy();
      expect(copy.workspace).toBeTruthy();
      expect(copy.signIn).toBeTruthy();
      expect(copy.createAccount).toBeTruthy();
      expect(copy.sendReset).toBeTruthy();
    }
  });

  it("keeps Arabic authentication copy available for RTL rendering", () => {
    const copy = getAuthCopy("ar");
    expect(copy.secureAccess).toBe("دخول آمن إلى الحساب");
    expect(copy.optionalSocial).toContain("اختياري");
  });
});

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const authSource = readFileSync(resolve(process.cwd(), "client/src/pages/Auth.tsx"), "utf8");
const settingsSource = readFileSync(resolve(process.cwd(), "client/src/pages/Settings.tsx"), "utf8");

 describe("profile and Google sign-in UX contracts", () => {
  it("shows an explicit Google redirect status and disables the action while processing", () => {
    expect(authSource).toContain("googleSignInPending");
    expect(authSource).toContain("Redirecting securely to Google");
    expect(authSource).toContain("disabled={googleSignInPending}");
    expect(authSource).toContain("window.location.origin");
  });

  it("exposes connected account and preferred language controls in settings", () => {
    expect(settingsSource).toContain("user.loginMethod === \"google\"");
    expect(settingsSource).toContain("t(\"connectedAccount\")");
    expect(settingsSource).toContain("SUPPORTED_LOCALES.map");
    expect(settingsSource).toContain("handleLocaleChange(event.target.value as LocaleCode)");
    expect(settingsSource).toContain("toast.success(t(\"languageUpdated\")");
    expect(settingsSource).toContain("trpc.course.state.useQuery");
    expect(settingsSource).toContain("paymentHistoryDescription");
    expect(settingsSource).toContain("preferredLanguageDescription");
  });
});

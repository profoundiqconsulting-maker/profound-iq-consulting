import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/pages/Assessment.tsx"), "utf8");

describe("assessment learner experience", () => {
  it("autofills authenticated participant details without replacing manual edits", () => {
    expect(source).toContain("const { user, isAuthenticated } = useAuth();");
    expect(source).toContain("if (!isAuthenticated || stage !== \"intro\" || !user) return");
    expect(source).toContain("if (!name.trim() && user.name?.trim()) setName(user.name.trim())");
    expect(source).toContain("if (!email.trim() && user.email?.trim()) setEmail(user.email.trim())");
  });

  it("brands the completion certificate with the managed site logo", () => {
    expect(source).toContain('import { LOGO_URL } from "@/components/BrandLogo";');
    expect(source).toContain('xmlns:xlink="http://www.w3.org/1999/xlink"');
    expect(source).toContain('href="${window.location.origin}${LOGO_URL}"');
  });

  it("moves the learner to the first question when opening a module", () => {
    expect(source).toContain("const firstQuestionRef = useRef<HTMLDivElement>(null);");
    expect(source).toContain("firstQuestionRef.current?.focus()");
    expect(source).toContain("onClick={() => goToModule(Math.min(totalPages - 1, page + 1))}");
    expect(source).toContain("tabIndex={-1}");
  });

  it("keeps previous-session completion actions visible", () => {
    expect(source).toContain("Previous session found");
    expect(source).toContain("openPreviousReport");
    expect(source).toContain("Access report");
    expect(source).toContain("Certificate");
    expect(source).toContain("Share Results");
  });

  it("shows positive completion feedback when advancing to a new module", () => {
    expect(source).toContain("setModuleCelebration(true)");
    expect(source).toContain("Module complete — keep building");
    expect(source).toContain("Module complete — your next question is ready.");
  });

  it("uses a compact flexible action row for completion controls", () => {
    expect(source).toContain("resume-celebration flex flex-wrap items-center gap-2");
    expect(source).toContain("mt-4 flex flex-wrap items-center gap-2");
  });
});


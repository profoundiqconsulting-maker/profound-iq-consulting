import { describe, expect, it } from "vitest";
import { resolveReportIdentity } from "./reportIdentity";
import { renderCourseCertificateSvg } from "../server/courseCertificate";

describe("report identity personalization", () => {
  it("prefers the authenticated full name and email", () => {
    expect(resolveReportIdentity({ fullName: "  Amina Njeri ", email: "  amina@example.com  " })).toEqual({ fullName: "Amina Njeri", email: "amina@example.com" });
  });

  it("uses a safe fallback name when a profile name is unavailable", () => {
    expect(resolveReportIdentity({ email: "learner@example.com" })).toEqual({ fullName: "Profound IQ learner", email: "learner@example.com" });
  });

  it("escapes and renders the learner email on a course certificate", () => {
    const svg = renderCourseCertificateSvg({ recipientName: "Amina Njeri", recipientEmail: "amina&team@example.com", courseTitle: "Lead with Clarity", certificateNumber: "PIQ-2026-ABC123", issuedOn: new Date("2026-08-24T00:00:00Z") });
    expect(svg).toContain("Amina Njeri");
    expect(svg).toContain("amina&amp;team@example.com");
    expect(svg).not.toContain("amina&team@example.com");
  });
});

import { describe, expect, it } from "vitest";
import { resolveReportIdentity } from "./reportIdentity";
import { renderCourseCertificateSvg } from "../server/courseCertificate";

describe("report identity personalization", () => {
  it("prefers the authenticated full name and email", () => {
    expect(
      resolveReportIdentity({
        fullName: "  Amina Njeri ",
        email: "  amina@example.com  ",
      })
    ).toEqual({ fullName: "Amina Njeri", email: "amina@example.com" });
  });

  it("uses a safe fallback name when a profile name is unavailable", () => {
    expect(resolveReportIdentity({ email: "learner@example.com" })).toEqual({
      fullName: "Profound IQ learner",
      email: "learner@example.com",
    });
  });

  it("omits learner email and renders the requested course certificate identity", () => {
    const svg = renderCourseCertificateSvg({
      recipientName: "Amina Njeri",
      recipientEmail: "amina&team@example.com",
      courseTitle:
        "Professional Certificate in International Curriculum Pedagogy",
      certificateNumber: "PIQ-2026-ABC123",
      issuedOn: new Date("2026-08-24T00:00:00Z"),
      verificationUrl:
        "https://example.com/verify/certificate?certificate=PIQ-2026-ABC123",
    });
    expect(svg).toContain("Amina Njeri");
    expect(svg).not.toContain("amina&amp;team@example.com");
    expect(svg).not.toContain("amina&team@example.com");
    expect(svg).toContain("proudly awarded to");
    expect(svg).toContain("for successfully completing the course");
    expect(svg).toContain(
      "Professional Certificate in International Curriculum Pedagogy"
    );
    expect(svg).toContain("PIQ-2026-ABC123");
    expect(svg).toContain("SCAN TO VERIFY");
    expect(svg).toContain("verify/certificate?certificate=PIQ-2026-ABC123");
  });
});

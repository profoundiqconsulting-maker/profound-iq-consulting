import { describe, expect, it, vi } from "vitest";

process.env.RESEND_API_KEY = "test-resend-api-key";
process.env.EMAIL_FROM = "noreply@profoundiq.com";

const sendMailMock = vi.fn(() =>
  Promise.resolve({ data: { id: "test-message-id" } })
);

vi.mock("resend", () => {
  const EmailsClass = () => ({
    send: sendMailMock,
  });
  const ResendClass = class Resend {
    emails = EmailsClass();
    constructor() {}
  };
  return {
    Resend: ResendClass,
  };
});

const {
  renderAssessmentReportPdf,
  renderCareerPathReportPdf,
} = await import("./reportPdf");
const {
  claimAssessmentReportEmail,
  markAssessmentReportEmailSent,
  releaseAssessmentReportEmailClaim,
  claimCareerPathReportEmail,
  markCareerPathReportEmailSent,
  releaseCareerPathReportEmailClaim,
} = await import("./db");

vi.mock("./reportPdf", () => ({
  renderAssessmentReportPdf: vi
    .fn()
    .mockResolvedValue(Buffer.from("%PDF-test")),
  renderCareerPathReportPdf: vi
    .fn()
    .mockResolvedValue(Buffer.from("%PDF-careerpath-test")),
}));
vi.mock("./db", () => ({
  claimAssessmentReportEmail: vi.fn().mockResolvedValue(true),
  markAssessmentReportEmailSent: vi.fn().mockResolvedValue(undefined),
  releaseAssessmentReportEmailClaim: vi.fn().mockResolvedValue(undefined),
  claimCareerPathReportEmail: vi.fn().mockResolvedValue(true),
  markCareerPathReportEmailSent: vi.fn().mockResolvedValue(undefined),
  releaseCareerPathReportEmailClaim: vi.fn().mockResolvedValue(undefined),
}));

const {
  sendAssessmentReportEmail,
  sendAssessmentResumeEmail,
  emailCareerPathReportIfNeeded,
} = await import("./email");

describe("report email delivery", () => {
  it("sends the report as a PDF attachment to the assessment email", async () => {
    await sendAssessmentReportEmail({
      attemptId: 44,
      participantName: "Amina <Njeri>",
      email: "amina@example.com",
      createdAt: new Date(),
      report: {
        overallScore: 82,
        overallBand: "Strong foundation",
        dimensions: [],
        strengths: [],
        focusAreas: [],
        disclaimer: "Educational tool.",
      },
    });
    expect(renderAssessmentReportPdf).toHaveBeenCalledOnce();
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ["amina@example.com"],
        subject: "Your Profound IQ assessment report",
        attachments: expect.arrayContaining([
          expect.objectContaining({
            filename: "profound-iq-assessment-44.pdf",
            content: Buffer.from("%PDF-test").toString("base64"),
            contentType: "application/pdf",
          }),
        ]),
        html: expect.stringContaining("Amina &lt;Njeri&gt;"),
      })
    );
  });

  it("sends a branded expiring resume link without embedding answer data", async () => {
    const expiresAt = new Date("2026-09-01T10:00:00.000Z");
    await sendAssessmentResumeEmail({
      to: "learner@example.com",
      name: "Learner Example",
      resumeUrl: "https://example.com/assessment?resume=opaque-token",
      expiresAt,
    });
    const message = sendMailMock.mock.calls.at(-1)?.[0] as {
      subject?: string;
      text?: string;
      html?: string;
    };
    expect(message.subject).toBe("Continue your Profound IQ assessment");
    expect(message.text).toContain(
      "https://example.com/assessment?resume=opaque-token"
    );
    expect(message.text).toContain("This link expires");
    expect(message.html).toContain("ASSESSMENT / CONTINUE LATER");
    expect(message.html).toContain("Transformational learning");
    expect(message.html).not.toContain("answers");
  });

  it("persists CareerPath email delivery state around the branded PDF send", async () => {
    const delivered = await emailCareerPathReportIfNeeded({
      attemptId: 99,
      participantName: "Brian Otieno",
      email: "brian@example.com",
      createdAt: new Date(),
      personalNotes: "Discuss subject choices with my mentor.",
      report: {
        subPathways: [
          { label: "Pure Sciences", score: 82 },
          { label: "Languages", score: 64 },
        ],
      } as never,
    });
    expect(delivered).toBe(true);
    expect(claimCareerPathReportEmail).toHaveBeenCalledWith(99);
    expect(markCareerPathReportEmailSent).toHaveBeenCalledWith(99);
    expect(releaseCareerPathReportEmailClaim).not.toHaveBeenCalled();
    expect(renderCareerPathReportPdf).toHaveBeenCalledOnce();
    expect(sendMailMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        to: ["brian@example.com"],
        subject: "Your Profound IQ CareerPath report",
        text: expect.stringContaining(
          "Your top strengths signals are Pure Sciences (82/100), Languages (64/100)."
        ),
        html: expect.stringContaining(
          "Your top strengths signals are Pure Sciences (82/100), Languages (64/100)."
        ),
        attachments: expect.arrayContaining([
          expect.objectContaining({
            filename: "profound-iq-careerpath-99.pdf",
            content: Buffer.from("%PDF-careerpath-test").toString("base64"),
            contentType: "application/pdf",
          }),
          expect.objectContaining({
            filename: "profound-iq-careerpath-99-coaching-visual.svg",
            contentType: "image/svg+xml",
          }),
        ]),
      })
    );
    const message = sendMailMock.mock.calls.at(-1)?.[0] as {
      text?: string;
      html?: string;
    };
    expect(message.text).toContain("Discuss subject choices with my mentor.");
    expect(message.html).toContain("PROFOUND IQ CONSULTING");
    expect(message.html).toContain("Discuss subject choices with my mentor.");
  });
});

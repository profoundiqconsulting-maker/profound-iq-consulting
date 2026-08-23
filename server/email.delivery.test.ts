import { describe, expect, it, vi } from "vitest";

const {
  sendMail,
  renderAssessmentReportPdf,
  renderCareerPathReportPdf,
  claimAssessmentReportEmail,
  markAssessmentReportEmailSent,
  releaseAssessmentReportEmailClaim,
  claimCareerPathReportEmail,
  markCareerPathReportEmailSent,
  releaseCareerPathReportEmailClaim,
} = vi.hoisted(() => ({
  sendMail: vi.fn().mockResolvedValue({ messageId: "test-message" }),
  renderAssessmentReportPdf: vi.fn().mockResolvedValue(Buffer.from("%PDF-test")),
  renderCareerPathReportPdf: vi.fn().mockResolvedValue(Buffer.from("%PDF-careerpath-test")),
  claimAssessmentReportEmail: vi.fn().mockResolvedValue(true),
  markAssessmentReportEmailSent: vi.fn().mockResolvedValue(undefined),
  releaseAssessmentReportEmailClaim: vi.fn().mockResolvedValue(undefined),
  claimCareerPathReportEmail: vi.fn().mockResolvedValue(true),
  markCareerPathReportEmailSent: vi.fn().mockResolvedValue(undefined),
  releaseCareerPathReportEmailClaim: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("nodemailer", () => ({ default: { createTransport: vi.fn(() => ({ sendMail, verify: vi.fn() })) } }));
vi.mock("./reportPdf", () => ({ renderAssessmentReportPdf, renderCareerPathReportPdf }));
vi.mock("./db", () => ({ claimAssessmentReportEmail, markAssessmentReportEmailSent, releaseAssessmentReportEmailClaim, claimCareerPathReportEmail, markCareerPathReportEmailSent, releaseCareerPathReportEmailClaim }));

const { sendAssessmentReportEmail, emailCareerPathReportIfNeeded } = await import("./email");

describe("report email delivery", () => {
  it("sends the report as a PDF attachment to the assessment email", async () => {
    await sendAssessmentReportEmail({ attemptId: 44, participantName: "Amina <Njeri>", email: "amina@example.com", createdAt: new Date(), report: { overallScore: 82, overallBand: "Strong foundation", dimensions: [], strengths: [], focusAreas: [], disclaimer: "Educational tool." } });
    expect(renderAssessmentReportPdf).toHaveBeenCalledOnce();
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ to: "amina@example.com", subject: "Your Profound IQ assessment report", attachments: [{ filename: "profound-iq-assessment-44.pdf", content: Buffer.from("%PDF-test"), contentType: "application/pdf" }], html: expect.stringContaining("Amina &lt;Njeri&gt;") }));
  });

  it("persists CareerPath email delivery state around the branded PDF send", async () => {
    const delivered = await emailCareerPathReportIfNeeded({ attemptId: 99, participantName: "Brian Otieno", email: "brian@example.com", createdAt: new Date(), report: { subPathways: [{ label: "Pure Sciences", score: 82 }, { label: "Languages", score: 64 }] } as never });
    expect(delivered).toBe(true);
    expect(claimCareerPathReportEmail).toHaveBeenCalledWith(99);
    expect(markCareerPathReportEmailSent).toHaveBeenCalledWith(99);
    expect(releaseCareerPathReportEmailClaim).not.toHaveBeenCalled();
    expect(renderCareerPathReportPdf).toHaveBeenCalledOnce();
    expect(sendMail).toHaveBeenLastCalledWith(expect.objectContaining({ to: "brian@example.com", subject: "Your Profound IQ CareerPath report", attachments: expect.arrayContaining([expect.objectContaining({ filename: "profound-iq-careerpath-99.pdf", content: Buffer.from("%PDF-careerpath-test"), contentType: "application/pdf" }), expect.objectContaining({ filename: "profound-iq-careerpath-99-coaching-visual.svg", contentType: "image/svg+xml" })] ) }));
  });
});


import { describe, expect, it, vi } from "vitest";

const { sendMail, renderAssessmentReportPdf } = vi.hoisted(() => ({ sendMail: vi.fn().mockResolvedValue({ messageId: "test-message" }), renderAssessmentReportPdf: vi.fn().mockResolvedValue(Buffer.from("%PDF-test")) }));

vi.mock("nodemailer", () => ({ default: { createTransport: vi.fn(() => ({ sendMail, verify: vi.fn() })) } }));
vi.mock("./reportPdf", () => ({ renderAssessmentReportPdf }));

const { sendAssessmentReportEmail } = await import("./email");

describe("sendAssessmentReportEmail", () => {
  it("sends the report as a PDF attachment to the assessment email", async () => {
    await sendAssessmentReportEmail({ attemptId: 44, participantName: "Amina <Njeri>", email: "amina@example.com", createdAt: new Date(), report: { overallScore: 82, overallBand: "Strong foundation", dimensions: [], strengths: [], focusAreas: [], disclaimer: "Educational tool." } });
    expect(renderAssessmentReportPdf).toHaveBeenCalledOnce();
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ to: "amina@example.com", subject: "Your Profound IQ assessment report", attachments: [{ filename: "profound-iq-assessment-44.pdf", content: Buffer.from("%PDF-test"), contentType: "application/pdf" }], html: expect.stringContaining("Amina &lt;Njeri&gt;") }));
  });
});

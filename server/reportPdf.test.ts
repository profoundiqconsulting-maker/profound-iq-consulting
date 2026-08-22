import { describe, expect, it } from "vitest";
import { renderAssessmentReportPdf } from "./reportPdf";

const report = {
  overallScore: 78,
  overallBand: "Building momentum",
  dimensions: [{ key: "clarity", label: "Clarity of direction", score: 78, description: "Priority setting." }],
  strengths: ["Clarity of direction"],
  focusAreas: ["Growth orientation"],
  disclaimer: "This educational self-assessment is a reflective development tool.",
};

describe("renderAssessmentReportPdf", () => {
  it("renders a readable PDF with the participant and report signal", async () => {
    const pdf = await renderAssessmentReportPdf({ attemptId: 42, participantName: "Amina Njeri", createdAt: new Date("2026-08-22T00:00:00Z"), report });
    const text = pdf.toString("latin1");
    const decodedText = text.replace(/<([0-9a-f]+)>/g, (_match, hex: string) => Buffer.from(hex, "hex").toString("latin1"));
    expect(text.startsWith("%PDF-")).toBe(true);
    expect(pdf.length).toBeGreaterThan(2_000);
    expect(text).toContain("/Title");
    expect(text).toContain("Profound IQ Assessment Report");
    expect(decodedText).toContain("Amina Njeri");
    expect(decodedText).toContain("Building momentum");
    expect(decodedText).toContain("Clarity of direction");
    expect(text).toContain("%%EOF");
  });
});

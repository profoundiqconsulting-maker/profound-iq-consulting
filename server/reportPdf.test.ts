import { describe, expect, it } from "vitest";
import { renderAssessmentReportPdf, renderCareerPathReportPdf } from "./reportPdf";
import { buildRoleLens } from "../shared/assessment";

const report = {
  overallScore: 78,
  overallBand: "Building momentum",
  dimensions: [{ key: "clarity", label: "Clarity of direction", score: 78, description: "Priority setting." }],
  strengths: ["Clarity of direction"],
  focusAreas: ["Growth orientation"],
  disclaimer: "This educational self-assessment is a reflective development tool.",
};

const careerPathReport = {
  overallReadout: "STEM is the strongest relative pathway signal.",
  primary: { key: "stem", label: "STEM", score: 82, band: "Strong Fit", evidence: ["Applied problem solving"], nextSteps: ["Try a technical project"] },
  secondary: { key: "socialSciences", label: "Social Sciences", score: 68, band: "Good Potential Fit", evidence: ["Communication"], nextSteps: ["Interview a professional"] },
  alternative: { key: "artsSports", label: "Arts and Sports Science", score: 61, band: "Possible Fit", evidence: ["Creative expression"], nextSteps: ["Build a portfolio"] },
  pathways: [],
  subPathways: ["Pure Sciences", "Applied Sciences", "Technical Studies", "Languages", "Humanities", "Arts", "Sports"].map((label, index) => ({ key: label.toLowerCase().replaceAll(" ", "") as never, label, score: 60 + index, band: "Good Potential Fit", rationale: `Evidence relevant to ${label} exploration and development.` })),
  learnerProfile: ["A multidimensional developmental profile."],
  explorationPlan: ["Choose a low-risk project and record what you learn."],
  importantContext: ["This is educational guidance, not a diagnosis."],
  disclaimer: "This report does not determine a career.",
};

describe("renderAssessmentReportPdf", () => {
  it("renders a readable PDF with the participant and report signal", async () => {
    const pdf = await renderAssessmentReportPdf({ attemptId: 42, participantName: "Amina Njeri", createdAt: new Date("2026-08-22T00:00:00Z"), report, lens: buildRoleLens(report, "leadership") });
    const text = pdf.toString("latin1");
    const decodedText = text.replace(/<([0-9a-f]+)>/g, (_match, hex: string) => Buffer.from(hex, "hex").toString("latin1"));
    expect(text.startsWith("%PDF-")).toBe(true);
    expect(pdf.length).toBeGreaterThan(2_000);
    expect(text).toContain("/Title");
    expect(text).toContain("Profound IQ Assessment Report");
    expect(decodedText).toContain("Amina Njeri");
    expect(decodedText).toContain("Building momentum");
    expect(decodedText).toContain("Clarity of direction");
    expect(text).toContain(Buffer.from("Reflection pr").toString("hex"));
    expect(text).toContain(Buffer.from("Which competing pr").toString("hex"));
    expect(decodedText).toContain("LEADERSHIP LENS");
    expect(text).toContain("%%EOF");
  });
});

describe("renderCareerPathReportPdf", () => {
  it("renders a branded PDF with sub-pathway content", async () => {
    const pdf = await renderCareerPathReportPdf({ attemptId: 77, participantName: "Amina Njeri", createdAt: new Date("2026-08-22T00:00:00Z"), report: careerPathReport });
    const text = pdf.toString("latin1");
    const decodedText = text.replace(/<([0-9a-f]+)>/g, (_match, hex: string) => Buffer.from(hex, "hex").toString("latin1"));
    expect(text.startsWith("%PDF-")).toBe(true);
    expect(text).toContain("/Title");
    expect(decodedText).toContain("Profound IQ CareerPath Report");
    expect(pdf.length).toBeGreaterThan(4_000);
    expect(text).toContain("%%EOF");
  });
});


describe("renderSavedCoursePathwaysPdf", () => {
  it("renders a personalized PDF with saved pathway details", async () => {
    const { renderSavedCoursePathwaysPdf } = await import("./reportPdf");
    const pdf = await renderSavedCoursePathwaysPdf({ participantName: "Amina Njeri", email: "amina@example.com", courses: [{ title: "Artificial Intelligence for Educators", category: "AI & Digital", skillLevel: "Practitioner", duration: "10 modules · 70 lessons", priceKes: 4999, outcomes: ["Design responsible AI-supported learning experiences", "Evaluate practical classroom use cases"] }] });
    const text = pdf.toString("latin1");
    const decodedText = text.replace(/<([0-9a-f]+)>/g, (_match, hex: string) => Buffer.from(hex, "hex").toString("latin1"));
    expect(text.startsWith("%PDF-")).toBe(true);
    expect(text).toContain("Profound IQ Saved Learning Pathways");
    expect(text).toContain("Saved course pathways");
    expect(text).toContain(Buffer.from("OUTCOMES").toString("hex"));
    expect(text).toContain("%%EOF");
  });
});

import PDFDocument from "pdfkit";
import type { AssessmentReport } from "../shared/assessment";

type ReportPdfInput = {
  attemptId: number;
  participantName: string;
  createdAt: Date | string;
  report: AssessmentReport;
};

const NAVY = "#16243d";
const GOLD = "#a27e2e";
const MUTED = "#5f6a7b";

export async function renderAssessmentReportPdf(input: ReportPdfInput): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", compress: false, margins: { top: 52, right: 52, bottom: 52, left: 52 }, info: { Title: "Profound IQ Assessment Report", Author: "Profound IQ Consulting" } });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  doc.fillColor(NAVY).rect(0, 0, doc.page.width, 92).fill();
  doc.fillColor("#f7f3e8").font("Helvetica-Bold").fontSize(10).text("PROFOUND IQ / CONSULTING", 52, 32, { characterSpacing: 1.4 });
  doc.fillColor(GOLD).font("Helvetica").fontSize(9).text("EXECUTIVE OBSERVATORY", 52, 52, { characterSpacing: 1.1 });
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(25).text("Assessment report", 52, 128);
  doc.fillColor(GOLD).font("Helvetica").fontSize(10).text(`REPORT #${input.attemptId}  ·  ${formatDate(input.createdAt)}`, 52, 163, { characterSpacing: 0.7 });
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(13).text(input.participantName, 52, 198);

  doc.strokeColor(GOLD).lineWidth(2).moveTo(52, 230).lineTo(543, 230).stroke();
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text("THE SIGNAL", 52, 258, { characterSpacing: 1.5 });
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(44).text(`${input.report.overallScore}`, 52, 278);
  doc.fillColor(MUTED).font("Helvetica").fontSize(12).text("overall score / 100", 122, 302);
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(18).text(input.report.overallBand, 52, 342);

  let y = 395;
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text("DIMENSION READOUT", 52, y, { characterSpacing: 1.2 });
  y += 24;
  for (const dimension of input.report.dimensions) {
    if (y > 705) { doc.addPage(); y = 56; }
    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(10).text(dimension.label, 52, y);
    doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text(`${dimension.score}`, 490, y, { width: 45, align: "right" });
    doc.strokeColor("#d8d1c1").lineWidth(1).moveTo(52, y + 16).lineTo(543, y + 16).stroke();
    y += 31;
  }

  doc.addPage();
  y = 58;
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text("REFLECTION STARTING POINTS", 52, y, { characterSpacing: 1.2 });
  y += 32;
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(16).text("Strengths to compound", 52, y);
  y += 25;
  y = writeList(doc, input.report.strengths, y);
  y += 22;
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(16).text("Focus areas to explore", 52, y);
  y += 25;
  y = writeList(doc, input.report.focusAreas, y);
  y += 36;
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text("IMPORTANT CONTEXT", 52, y, { characterSpacing: 1.2 });
  y += 22;
  doc.fillColor(MUTED).font("Helvetica").fontSize(10).text(input.report.disclaimer, 52, y, { width: 491, lineGap: 4 });
  y += 74;
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(10).text("A considered next step", 52, y);
  doc.fillColor(MUTED).font("Helvetica").fontSize(10).text("Use this report as a conversation starter. Select one focus area, define a small action, and revisit the signal after deliberate practice.", 52, y + 20, { width: 491, lineGap: 4 });
  doc.fillColor(GOLD).font("Helvetica").fontSize(9).text("profoundiqconsulting.com", 52, 746, { characterSpacing: 0.8 });

  doc.end();
  return finished;
}

function writeList(doc: PDFKit.PDFDocument, items: string[], y: number): number {
  for (const item of items) {
    doc.fillColor(GOLD).circle(59, y + 6, 3).fill();
    doc.fillColor(NAVY).font("Helvetica").fontSize(11).text(item, 74, y, { width: 465 });
    y += 27;
  }
  return y;
}

function formatDate(value: Date | string): string {
  return new Date(value).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" });
}

import PDFDocument from "pdfkit";
import type { AssessmentReport, RoleLensReadout } from "../shared/assessment";
import type { CareerPathReport } from "../shared/careerPath";
import { storageGetSignedUrl } from "./storage";

type ReportPdfInput = { attemptId: number; participantName: string; createdAt: Date | string; report: AssessmentReport; lens?: RoleLensReadout };
const NAVY = "#16243d";
const GOLD = "#a27e2e";
const MUTED = "#5f6a7b";
const LOGO_KEY = "ProfoundIQLogo3-cropped_15edcfe0.png";
let logoBufferPromise: Promise<Buffer | null> | null = null;

async function loadBrandLogo(): Promise<Buffer | null> {
  if (process.env.NODE_ENV === "test") return null;
  if (!logoBufferPromise) logoBufferPromise = (async () => { try { const signedUrl = await storageGetSignedUrl(LOGO_KEY); const response = await fetch(signedUrl); return response.ok ? Buffer.from(await response.arrayBuffer()) : null; } catch { return null; } })();
  return logoBufferPromise;
}

type CareerPathPdfInput = { attemptId: number; participantName: string; createdAt: Date | string; report: CareerPathReport };

export async function renderCareerPathReportPdf(input: CareerPathPdfInput): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", compress: false, margins: { top: 52, right: 52, bottom: 52, left: 52 }, info: { Title: "Profound IQ CareerPath Report", Author: "Profound IQ Consulting" } });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve, reject) => { doc.on("end", () => resolve(Buffer.concat(chunks))); doc.on("error", reject); });
  const brandLogo = await loadBrandLogo();
  doc.fillColor(NAVY).rect(0, 0, doc.page.width, 92).fill();
  if (brandLogo) { try { doc.image(brandLogo, 52, 10, { fit: [116, 72], valign: "center" }); } catch { /* Fallback to text lockup. */ } }
  const headerX = brandLogo ? 190 : 52;
  doc.fillColor("#f7f3e8").font("Helvetica-Bold").fontSize(10).text("PROFOUND IQ / CONSULTING", headerX, 32, { characterSpacing: 1.4 });
  doc.fillColor(GOLD).font("Helvetica").fontSize(9).text("CAREERPATH / TALENT FIT", headerX, 52, { characterSpacing: 1.1 });
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(24).text("CareerPath report", 52, 128);
  doc.fillColor(GOLD).font("Helvetica").fontSize(10).text(`REPORT #${input.attemptId}  ·  ${formatDate(input.createdAt)}`, 52, 163, { characterSpacing: 0.7 });
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(13).text(input.participantName, 52, 198);
  doc.strokeColor(GOLD).lineWidth(2).moveTo(52, 230).lineTo(543, 230).stroke();
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text("PATHWAY SIGNAL", 52, 258, { characterSpacing: 1.5 });
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(23).text(input.report.primary.label, 52, 280);
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(34).text(`${input.report.primary.score}`, 52, 316);
  doc.fillColor(MUTED).font("Helvetica").fontSize(11).text("primary relative fit / 100", 124, 335);
  let y = 380;
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text("EXECUTIVE READOUT", 52, y, { characterSpacing: 1.2 });
  y += 20;
  y = writeText(doc, input.report.overallReadout, 52, y, 491, 10.5, NAVY, 4) + 10;
  y = writeBullets(doc, input.report.learnerProfile, y, 9.5, MUTED) + 8;
  doc.strokeColor("#d8d1c1").lineWidth(1).moveTo(52, y).lineTo(543, y).stroke();
  y += 18;
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text("SUB-PATHWAY SCORES", 52, y, { characterSpacing: 1.2 });
  y += 23;
  for (const subPathway of input.report.subPathways) {
    if (y > 680) { addFooter(doc); doc.addPage(); y = 58; }
    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(10).text(subPathway.label, 52, y);
    doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text(`${subPathway.score} / 100`, 450, y, { width: 93, align: "right" });
    y += 16;
    y = writeText(doc, `${subPathway.band}. ${subPathway.rationale}`, 52, y, 491, 9.2, MUTED, 3) + 7;
  }
  addFooter(doc);
  doc.addPage();
  y = 58;
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text("PATHWAY COMPARISON", 52, y, { characterSpacing: 1.2 });
  y += 25;
  for (const pathway of input.report.pathways) {
    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(14).text(pathway.label, 52, y);
    doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(14).text(`${pathway.score} / 100`, 450, y, { width: 93, align: "right" });
    y += 19;
    y = writeBullets(doc, pathway.evidence, y, 9.5, MUTED) + 12;
  }
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text("EXPLORATION PLAN", 52, y, { characterSpacing: 1.2 });
  y += 21;
  y = writeBullets(doc, input.report.explorationPlan, y, 9.8, NAVY) + 18;
  if (y > 650) { addFooter(doc); doc.addPage(); y = 58; }
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text("IMPORTANT CONTEXT", 52, y, { characterSpacing: 1.2 });
  y += 20;
  writeBullets(doc, input.report.importantContext, y, 9.7, MUTED);
  addFooter(doc);
  doc.end();
  return finished;
}

export async function renderAssessmentReportPdf(input: ReportPdfInput): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", compress: false, margins: { top: 52, right: 52, bottom: 52, left: 52 }, info: { Title: "Profound IQ Assessment Report", Author: "Profound IQ Consulting" } });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve, reject) => { doc.on("end", () => resolve(Buffer.concat(chunks))); doc.on("error", reject); });

  const brandLogo = await loadBrandLogo();
  doc.fillColor(NAVY).rect(0, 0, doc.page.width, 92).fill();
  if (brandLogo) { try { doc.image(brandLogo, 52, 10, { fit: [116, 72], valign: "center" }); } catch { /* Fallback to the text lockup. */ } }
  const headerX = brandLogo ? 190 : 52;
  doc.fillColor("#f7f3e8").font("Helvetica-Bold").fontSize(10).text("PROFOUND IQ / CONSULTING", headerX, 32, { characterSpacing: 1.4 });
  doc.fillColor(GOLD).font("Helvetica").fontSize(9).text("EXECUTIVE OBSERVATORY", headerX, 52, { characterSpacing: 1.1 });
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(25).text("Assessment report", 52, 128);
  doc.fillColor(GOLD).font("Helvetica").fontSize(10).text(`REPORT #${input.attemptId}  ·  ${formatDate(input.createdAt)}`, 52, 163, { characterSpacing: 0.7 });
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(13).text(input.participantName, 52, 198);
  doc.strokeColor(GOLD).lineWidth(2).moveTo(52, 230).lineTo(543, 230).stroke();
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text("THE SIGNAL", 52, 258, { characterSpacing: 1.5 });
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(44).text(`${input.report.overallScore}`, 52, 278);
  doc.fillColor(MUTED).font("Helvetica").fontSize(12).text("overall score / 100", 122, 302);
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(18).text(input.report.overallBand, 52, 342);

  let y = 395;
  const summary = input.report.executiveSummary;
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text("EXECUTIVE SUMMARY", 52, y, { characterSpacing: 1.2 });
  y += 22;
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(15).text(summary?.headline ?? `${input.report.overallBand}: a practical view of your current capability pattern`, 52, y, { width: 491 });
  y += doc.heightOfString(summary?.headline ?? `${input.report.overallBand}: a practical view of your current capability pattern`, { width: 491 }) + 7;
  y = writeText(doc, summary?.overview ?? "Use this report as a professional development conversation starter, pairing the signal with observed behavior, context, feedback, and outcomes.", 52, y, 491, 9.8, MUTED, 3) + 7;
  y = writeBullets(doc, summary?.priorities ?? input.report.focusAreas, y, 9.5, NAVY) + 7;
  if (input.lens) {
    doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(9).text(input.lens.label.toUpperCase(), 52, y + 4, { characterSpacing: 1.1 });
    y += 19;
    y = writeText(doc, input.lens.context, 52, y, 491, 9.3, MUTED, 3) + 6;
    y = writeBullets(doc, input.lens.priorities, y, 9.2, NAVY) + 4;
  }
  doc.strokeColor("#d8d1c1").lineWidth(1).moveTo(52, y).lineTo(543, y).stroke();
  y += 18;
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text("DIMENSION READOUT", 52, y, { characterSpacing: 1.2 });
  y += 24;
  for (const dimension of input.report.dimensions) {
    if (y > 680) { addFooter(doc); doc.addPage(); y = 58; }
    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(10).text(dimension.label, 52, y);
    doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text(`${dimension.score} / 100`, 450, y, { width: 93, align: "right" });
    y += 17;
    y = writeText(doc, dimension.readout ?? dimension.description, 52, y, 491, 9.5, MUTED, 3) + 5;
    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(9).text("Reflection prompts", 52, y);
    y += 14;
    y = writeBullets(doc, dimension.reflectionPoints ?? [], y, 9, NAVY);
    doc.strokeColor("#d8d1c1").lineWidth(1).moveTo(52, y + 4).lineTo(543, y + 4).stroke();
    y += 18;
  }
  addFooter(doc);

  doc.addPage();
  y = 58;
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text("REFLECTION STARTING POINTS", 52, y, { characterSpacing: 1.2 });
  y += 31;
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(16).text("Strengths to compound", 52, y);
  y += 24;
  y = writeBullets(doc, input.report.strengths.map((item) => `${item} — make the behavior behind this signal visible, repeatable, and transferable.`), y, 10.5, NAVY) + 22;
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(16).text("Focus areas to explore", 52, y);
  y += 24;
  y = writeBullets(doc, input.report.focusAreas.map((item) => `${item} — choose one specific behavior to practice rather than treating the result as a fixed label.`), y, 10.5, NAVY) + 23;
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text("PRACTICAL REFLECTION", 52, y, { characterSpacing: 1.2 });
  y += 20;
  y = writeBullets(doc, input.report.reflectionPoints ?? [], y, 10, MUTED) + 26;
  if (y > 640) { addFooter(doc); doc.addPage(); y = 58; }
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text("IMPORTANT CONTEXT", 52, y, { characterSpacing: 1.2 });
  y += 20;
  y = writeBullets(doc, input.report.importantContext ?? [input.report.disclaimer], y, 9.8, MUTED) + 18;
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(10).text("A considered next step", 52, y);
  y += 18;
  writeText(doc, "Use this report as a conversation starter. Select one focus area, define a small action, and revisit the signal after deliberate practice. In a team or organizational setting, combine this reflection with role expectations, observed behavior, stakeholder feedback, and evidence of outcomes.", 52, y, 491, 10, MUTED, 4);
  addFooter(doc);
  doc.end();
  return finished;
}

function writeBullets(doc: PDFKit.PDFDocument, items: string[], y: number, fontSize: number, color: string): number {
  for (const item of items) {
    doc.fillColor(GOLD).circle(59, y + 5, 2.5).fill();
    y = writeText(doc, item, 74, y, 465, fontSize, color, 3) + 6;
  }
  return y;
}

function writeText(doc: PDFKit.PDFDocument, value: string, x: number, y: number, width: number, fontSize: number, color: string, lineGap: number): number {
  doc.fillColor(color).font("Helvetica").fontSize(fontSize);
  doc.text(value, x, y, { width, lineGap });
  return y + doc.heightOfString(value, { width, lineGap });
}

function addFooter(doc: PDFKit.PDFDocument): void {
  doc.fillColor(GOLD).font("Helvetica").fontSize(8.5).text("profoundiqconsulting.com", 52, 746, { characterSpacing: 0.8 });
}

function formatDate(value: Date | string): string { return new Date(value).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" }); }

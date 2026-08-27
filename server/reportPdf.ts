import PDFDocument from "pdfkit";
import { getDimensionReflectionPoints, type AssessmentReport, type RoleLensReadout } from "../shared/assessment";
import type { CareerPathReport } from "../shared/careerPath";
import { storageGetSignedUrl } from "./storage";
import { getGeneratedCopy, type GeneratedLocale } from "../shared/generatedLocalization";

type ReportPdfInput = { attemptId: number; participantName: string; email?: string; createdAt: Date | string; report: AssessmentReport; lens?: RoleLensReadout; locale?: GeneratedLocale };
const NAVY = "#16243d";
const GOLD = "#a27e2e";
const MUTED = "#5f6a7b";
const LOGO_KEY = "ProfoundIQLogo-header_aad21220.jpg";
let logoBufferPromise: Promise<Buffer | null> | null = null;

async function loadBrandLogo(): Promise<Buffer | null> {
  if (process.env.NODE_ENV === "test") return null;
  if (!logoBufferPromise) logoBufferPromise = (async () => { try { const signedUrl = await storageGetSignedUrl(LOGO_KEY); const response = await fetch(signedUrl); return response.ok ? Buffer.from(await response.arrayBuffer()) : null; } catch { return null; } })();
  return logoBufferPromise;
}

type CareerPathPdfInput = { attemptId: number; participantName: string; email?: string; createdAt: Date | string; report: CareerPathReport; locale?: GeneratedLocale };

export async function renderCareerPathReportPdf(input: CareerPathPdfInput): Promise<Buffer> {
  const copy = getGeneratedCopy(input.locale);
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
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(24).text(copy.careerPathReport, 52, 128);
  doc.fillColor(GOLD).font("Helvetica").fontSize(10).text(`REPORT #${input.attemptId}  ·  ${formatDate(input.createdAt)}`, 52, 163, { characterSpacing: 0.7 });
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(13).text(input.participantName, 52, 198);
  if (input.email) doc.fillColor(MUTED).font("Helvetica").fontSize(9.5).text(input.email, 52, 217);
  doc.strokeColor(GOLD).lineWidth(2).moveTo(52, 244).lineTo(543, 244).stroke();
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text(copy.pathwaySignal.toUpperCase(), 52, 258, { characterSpacing: 1.5 });
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(23).text(input.report.primary.label, 52, 280);
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(34).text(`${input.report.primary.score}`, 52, 316);
  doc.fillColor(MUTED).font("Helvetica").fontSize(11).text(copy.primaryRelativeFit, 124, 335);
  let y = 380;
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text(copy.executiveSummary.toUpperCase(), 52, y, { characterSpacing: 1.2 });
  y += 20;
  y = writeText(doc, input.report.overallReadout, 52, y, 491, 10.5, NAVY, 4) + 10;
  y = writeBullets(doc, input.report.learnerProfile, y, 9.5, MUTED) + 8;
  doc.strokeColor("#d8d1c1").lineWidth(1).moveTo(52, y).lineTo(543, y).stroke();
  y += 18;
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text(copy.subPathwayScores.toUpperCase(), 52, y, { characterSpacing: 1.2 });
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
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text(copy.pathwayComparison.toUpperCase(), 52, y, { characterSpacing: 1.2 });
  y += 25;
  for (const pathway of input.report.pathways) {
    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(14).text(pathway.label, 52, y);
    doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(14).text(`${pathway.score} / 100`, 450, y, { width: 93, align: "right" });
    y += 19;
    y = writeBullets(doc, pathway.evidence, y, 9.5, MUTED) + 12;
  }
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text(copy.explorationPlan.toUpperCase(), 52, y, { characterSpacing: 1.2 });
  y += 21;
  y = writeBullets(doc, input.report.explorationPlan, y, 9.8, NAVY) + 18;
  if (y > 650) { addFooter(doc); doc.addPage(); y = 58; }
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text(copy.importantContext.toUpperCase(), 52, y, { characterSpacing: 1.2 });
  y += 20;
  writeBullets(doc, input.report.importantContext, y, 9.7, MUTED);
  addFooter(doc);
  doc.end();
  return finished;
}

export async function renderAssessmentReportPdf(input: ReportPdfInput): Promise<Buffer> {
  const copy = getGeneratedCopy(input.locale);
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
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(25).text(copy.assessmentReport, 52, 128);
  doc.fillColor(GOLD).font("Helvetica").fontSize(10).text(`REPORT #${input.attemptId}  ·  ${formatDate(input.createdAt)}`, 52, 163, { characterSpacing: 0.7 });
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(13).text(input.participantName, 52, 198);
  if (input.email) doc.fillColor(MUTED).font("Helvetica").fontSize(9.5).text(input.email, 52, 217);
  doc.strokeColor(GOLD).lineWidth(2).moveTo(52, 244).lineTo(543, 244).stroke();
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text("THE SIGNAL", 52, 258, { characterSpacing: 1.5 });
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(44).text(`${input.report.overallScore}`, 52, 278);
  doc.fillColor(MUTED).font("Helvetica").fontSize(12).text(copy.overallScore, 122, 302);
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(18).text(input.report.overallBand, 52, 342);

  let y = 395;
  const summary = input.report.executiveSummary;
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text(copy.executiveSummary.toUpperCase(), 52, y, { characterSpacing: 1.2 });
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
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text(copy.dimensionReadout.toUpperCase(), 52, y, { characterSpacing: 1.2 });
  y += 24;
  for (const dimension of input.report.dimensions) {
    if (y > 680) { addFooter(doc); doc.addPage(); y = 58; }
    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(10).text(dimension.label, 52, y);
    doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text(`${dimension.score} / 100`, 450, y, { width: 93, align: "right" });
    y += 17;
    y = writeText(doc, dimension.readout ?? dimension.description, 52, y, 491, 9.5, MUTED, 3) + 5;
    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(9).text(copy.reflectionPrompts, 52, y);
    y += 14;
    y = writeBullets(doc, getDimensionReflectionPoints(dimension), y, 9, NAVY);
    doc.strokeColor("#d8d1c1").lineWidth(1).moveTo(52, y + 4).lineTo(543, y + 4).stroke();
    y += 18;
  }
  addFooter(doc);

  doc.addPage();
  y = 58;
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text(copy.reflectionStartingPoints.toUpperCase(), 52, y, { characterSpacing: 1.2 });
  y += 31;
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(16).text(copy.strengthsToCompound, 52, y);
  y += 24;
  y = writeBullets(doc, input.report.strengths.map((item) => `${item} — make the behavior behind this signal visible, repeatable, and transferable.`), y, 10.5, NAVY) + 22;
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(16).text(copy.focusAreasToExplore, 52, y);
  y += 24;
  y = writeBullets(doc, input.report.focusAreas.map((item) => `${item} — choose one specific behavior to practice rather than treating the result as a fixed label.`), y, 10.5, NAVY) + 23;
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text(copy.practicalReflection.toUpperCase(), 52, y, { characterSpacing: 1.2 });
  y += 20;
  y = writeBullets(doc, input.report.reflectionPoints ?? [], y, 10, MUTED) + 26;
  if (y > 640) { addFooter(doc); doc.addPage(); y = 58; }
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text(copy.importantContext.toUpperCase(), 52, y, { characterSpacing: 1.2 });
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

export async function renderAssessmentScoreSummaryPdf(input: { participantName: string; email?: string; createdAt: Date | string; locale?: GeneratedLocale; reports: Array<{ version?: string | null; createdAt: Date | string; overallScore?: number | null; overallBand?: string | null; dimensionScores?: Array<{ label: string; score: number }> }> }): Promise<Buffer> {
  const copy = getGeneratedCopy(input.locale);
  const doc = new PDFDocument({ size: "A4", compress: false, margins: { top: 52, right: 52, bottom: 52, left: 52 }, info: { Title: "Profound IQ Score Summary", Author: "Profound IQ Consulting" } });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve, reject) => { doc.on("end", () => resolve(Buffer.concat(chunks))); doc.on("error", reject); });
  const brandLogo = await loadBrandLogo();
  doc.fillColor(NAVY).rect(0, 0, doc.page.width, 92).fill();
  if (brandLogo) { try { doc.image(brandLogo, 52, 10, { fit: [116, 72], valign: "center" }); } catch { /* Text lockup remains available. */ } }
  const headerX = brandLogo ? 190 : 52;
  doc.fillColor("#f7f3e8").font("Helvetica-Bold").fontSize(10).text("PROFOUND IQ / CONSULTING", headerX, 32, { characterSpacing: 1.4 });
  doc.fillColor(GOLD).font("Helvetica").fontSize(9).text("PERSONAL SCORE SUMMARY", headerX, 52, { characterSpacing: 1.1 });
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(25).text(copy.scoreSummary, 52, 128);
  doc.fillColor(GOLD).font("Helvetica").fontSize(10).text(`GENERATED ${formatDate(input.createdAt)}`, 52, 163, { characterSpacing: 0.7 });
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(13).text(input.participantName, 52, 198);
  if (input.email) doc.fillColor(MUTED).font("Helvetica").fontSize(9.5).text(input.email, 52, 217);
  doc.strokeColor(GOLD).lineWidth(2).moveTo(52, 244).lineTo(543, 244).stroke();
  let y = 278;
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text(copy.report.toUpperCase(), 52, y, { characterSpacing: 1.2 });
  y += 24;
  for (const report of input.reports) {
    if (y > 690) { addFooter(doc); doc.addPage(); y = 58; }
    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(12).text(report.version ?? "Assessment report", 52, y);
    doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(12).text(`${report.overallScore ?? "—"} / 100`, 450, y, { width: 93, align: "right" });
    y += 17;
    doc.fillColor(MUTED).font("Helvetica").fontSize(9.5).text(`${formatDate(report.createdAt)}${report.overallBand ? `  ·  ${report.overallBand}` : ""}`, 52, y);
    y += 18;
    for (const dimension of (report.dimensionScores ?? []).slice(0, 10)) {
      doc.fillColor(NAVY).font("Helvetica").fontSize(9.5).text(dimension.label, 74, y);
      doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(9.5).text(`${dimension.score} / 100`, 450, y, { width: 93, align: "right" });
      y += 14;
    }
    doc.strokeColor("#d8d1c1").lineWidth(1).moveTo(52, y + 4).lineTo(543, y + 4).stroke();
    y += 20;
  }
  if (!input.reports.length) writeText(doc, `${copy.report}: no paid assessment scores are available yet.`, 52, y, 491, 10, MUTED, 4);
  addFooter(doc);
  doc.end();
  return finished;
}


export async function renderPaymentReceiptPdf(input: { attemptId: number; participantName: string; email: string; reference: string; amountKes: number; paidAt?: Date | string; verificationUrl: string; locale?: GeneratedLocale }): Promise<Buffer> {
  const copy = getGeneratedCopy(input.locale);
  const doc = new PDFDocument({ size: "A4", compress: false, margins: { top: 52, right: 52, bottom: 52, left: 52 }, info: { Title: "Profound IQ Consulting Payment Receipt", Author: "Profound IQ Consulting", Subject: "Verified payment receipt" } });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve, reject) => { doc.on("end", () => resolve(Buffer.concat(chunks))); doc.on("error", reject); });
  const brandLogo = await loadBrandLogo();
  doc.fillColor(NAVY).rect(0, 0, doc.page.width, 100).fill();
  if (brandLogo) { try { doc.image(brandLogo, 52, 14, { fit: [120, 72] }); } catch { /* fall back to text */ } }
  doc.fillColor("#f7f3e8").font("Helvetica-Bold").fontSize(11).text("PROFOUND IQ / CONSULTING", brandLogo ? 190 : 52, 36, { characterSpacing: 1.3 });
  doc.fillColor(GOLD).font("Helvetica").fontSize(9).text("TRANSFORMATION SERVICES", brandLogo ? 190 : 52, 57, { characterSpacing: 1.1 });
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(25).text(copy.paymentReceipt, 52, 145);
  doc.fillColor(MUTED).font("Helvetica").fontSize(10).text(`Receipt #${input.attemptId} · ${formatDate(input.paidAt ?? new Date())}`, 52, 179);
  doc.strokeColor(GOLD).lineWidth(2).moveTo(52, 207).lineTo(543, 207).stroke();
  doc.fillColor(MUTED).font("Helvetica-Bold").fontSize(9).text(copy.learner.toUpperCase(), 52, 242, { characterSpacing: 1.1 });
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(14).text(input.participantName, 52, 260);
  doc.fillColor(MUTED).font("Helvetica").fontSize(10).text(input.email, 52, 282);
  doc.fillColor(MUTED).font("Helvetica-Bold").fontSize(9).text(copy.amountPaid.toUpperCase(), 52, 330, { characterSpacing: 1.1 });
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(23).text(`KES ${input.amountKes.toLocaleString("en-KE")}`, 52, 348);
  doc.fillColor(MUTED).font("Helvetica-Bold").fontSize(9).text(copy.transactionReference.toUpperCase(), 52, 404, { characterSpacing: 1.1 });
  doc.fillColor(NAVY).font("Helvetica").fontSize(10).text(input.reference, 52, 422);
  doc.fillColor(MUTED).font("Helvetica").fontSize(9).text("This receipt confirms a successful Paystack transaction for Profound IQ Consulting transformation services.", 52, 485, { width: 490, lineGap: 4 });
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(9).text(copy.verifyCredential.toUpperCase(), 52, 555, { characterSpacing: 1.1 });
  doc.fillColor(NAVY).font("Helvetica").fontSize(9).fillColor(NAVY).text(input.verificationUrl, 52, 575, { link: input.verificationUrl, underline: true, width: 490 });
  doc.fillColor(MUTED).font("Helvetica").fontSize(8).text("Scan the QR code on your credential or open the verification link above to confirm authenticity.", 52, 610, { width: 490 });
  doc.fillColor(NAVY).rect(0, 760, doc.page.width, 82).fill();
  doc.fillColor("#f7f3e8").font("Helvetica").fontSize(8).text("profoundiqconsulting.com  ·  admin@profoundiqconsulting.com  ·  +254 727 374 055", 52, 796, { width: 490, align: "center" });
  doc.end();
  return finished;
}

import type { PsychometricReport } from "../shared/psychometrics";

type PsychometricPdfInput = { attemptId: number; participantName: string; email?: string; createdAt: Date | string; report: PsychometricReport; verificationUrl: string; locale?: GeneratedLocale };

export async function renderPsychometricReportPdf(input: PsychometricPdfInput): Promise<Buffer> {
  const copy = getGeneratedCopy(input.locale);
  const doc = new PDFDocument({ size: "A4", compress: false, margins: { top: 52, right: 52, bottom: 52, left: 52 }, info: { Title: `${input.report.title} — Profound IQ Consulting`, Author: "Profound IQ Consulting" } });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve, reject) => { doc.on("end", () => resolve(Buffer.concat(chunks))); doc.on("error", reject); });
  const brandLogo = await loadBrandLogo();
  doc.fillColor(NAVY).rect(0, 0, doc.page.width, 92).fill();
  if (brandLogo) { try { doc.image(brandLogo, 52, 10, { fit: [116, 72], valign: "center" }); } catch { /* Text lockup remains the fallback. */ } }
  const headerX = brandLogo ? 190 : 52;
  doc.fillColor("#f7f3e8").font("Helvetica-Bold").fontSize(10).text("PROFOUND IQ / CONSULTING", headerX, 32, { characterSpacing: 1.4 });
  doc.fillColor(GOLD).font("Helvetica").fontSize(9).text("PSYCHOMETRIC ASSESSMENT SUITE", headerX, 52, { characterSpacing: 1.1 });
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(23).text(input.report.title, 52, 128, { width: 491 });
  doc.fillColor(GOLD).font("Helvetica").fontSize(9).text(`REPORT #${input.attemptId}  ·  ${formatDate(input.createdAt)}`, 52, 169, { characterSpacing: 0.7 });
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(13).text(input.participantName, 52, 204);
  if (input.email) doc.fillColor(MUTED).font("Helvetica").fontSize(9.5).text(input.email, 52, 223);
  doc.strokeColor(GOLD).lineWidth(2).moveTo(52, 250).lineTo(543, 250).stroke();
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text("OVERALL PROFILE", 52, 265, { characterSpacing: 1.3 });
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(42).text(`${input.report.overallScore}`, 52, 286);
  doc.fillColor(MUTED).font("Helvetica").fontSize(11).text(copy.overallScore, 124, 310);
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(16).text(input.report.overallBand, 52, 350);
  let y = 395;
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text(copy.executiveSummary.toUpperCase(), 52, y, { characterSpacing: 1.2 });
  y += 21;
  y = writeText(doc, `This report presents a structured development signal across the dimensions of the ${input.report.title}. Use it to guide reflection, learning plans, coaching, and evidence-based conversations.`, 52, y, 491, 10, MUTED, 4) + 14;
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text(copy.pathwaySignal.toUpperCase(), 52, y, { characterSpacing: 1.2 });
  y += 20;
  y = writeBullets(doc, input.report.strengths, y, 9.8, NAVY) + 10;
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text(copy.focusAreasToExplore.toUpperCase(), 52, y, { characterSpacing: 1.2 });
  y += 20;
  y = writeBullets(doc, input.report.developmentPriorities, y, 9.8, NAVY) + 10;
  addFooter(doc);
  doc.addPage();
  y = 58;
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text(copy.dimensionReadout.toUpperCase(), 52, y, { characterSpacing: 1.2 });
  y += 25;
  for (const dimension of input.report.domains) {
    if (y > 690) { addFooter(doc); doc.addPage(); y = 58; }
    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(12).text(dimension.label, 52, y);
    doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(12).text(`${dimension.score} / 100`, 450, y, { width: 93, align: "right" });
    y += 18;
    y = writeText(doc, dimension.readout, 52, y, 491, 9.3, MUTED, 3) + 4;
    y = writeBullets(doc, dimension.developmentActions, y, 9.1, NAVY) + 10;
  }
  if (y > 640) { addFooter(doc); doc.addPage(); y = 58; }
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text(copy.explorationPlan.toUpperCase(), 52, y, { characterSpacing: 1.2 });
  y += 21;
  y = writeBullets(doc, input.report.recommendations, y, 9.6, NAVY) + 16;
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text(copy.importantContext.toUpperCase(), 52, y, { characterSpacing: 1.2 });
  y += 20;
  writeText(doc, input.report.disclaimer, 52, y, 491, 8.8, MUTED, 3);
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(8.5).text(copy.verifyCredential.toUpperCase(), 52, 700, { characterSpacing: 1.1 });
  doc.fillColor(NAVY).font("Helvetica").fontSize(8.5).text(input.verificationUrl, 52, 716, { width: 491, link: input.verificationUrl, underline: true });
  addFooter(doc);
  doc.end();
  return finished;
}

export type PsychometricAnalyticsPdfInput = { fromDate?: string; toDate?: string; analytics: { totals: { started: number; paid: number; pending: number; sent: number; sending: number; failed: number; conversionRate: number; emailRate: number }; byProfile: Array<{ testSlug: string; started: number; paid: number; sent: number; pending: number; conversionRate: number; emailRate: number }>; trend: Array<{ date: string; started: number; paid: number; sent: number }> } };

export async function renderPsychometricAnalyticsPdf(input: PsychometricAnalyticsPdfInput): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margins: { top: 52, right: 52, bottom: 52, left: 52 }, info: { Title: "Profound IQ Psychometric Analytics", Author: "Profound IQ Consulting" } });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve, reject) => { doc.on("end", () => resolve(Buffer.concat(chunks))); doc.on("error", reject); });
  const brandLogo = await loadBrandLogo();
  doc.fillColor(NAVY).rect(0, 0, doc.page.width, 92).fill();
  if (brandLogo) { try { doc.image(brandLogo, 52, 10, { fit: [116, 72], valign: "center" }); } catch { /* Text lockup remains available. */ } }
  doc.fillColor("#f7f3e8").font("Helvetica-Bold").fontSize(15).text("PSYCHOMETRIC SUITE", brandLogo ? 190 : 52, 30);
  doc.font("Helvetica").fontSize(9).fillColor("#d7deea").text("Conversion and report-delivery observatory", brandLogo ? 190 : 52, 54);
  doc.y = 122;
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(22).text("Analytics summary");
  doc.font("Helvetica").fontSize(9).fillColor(MUTED).text(`Period: ${input.fromDate ?? "All time"} to ${input.toDate ?? "Present"}`);
  doc.moveDown(1);
  const metrics = [["Starts", input.analytics.totals.started], ["Paid", input.analytics.totals.paid], ["Conversion", `${input.analytics.totals.conversionRate}%`], ["Reports sent", input.analytics.totals.sent], ["Email rate", `${input.analytics.totals.emailRate}%`], ["Failures", input.analytics.totals.failed]];
  metrics.forEach(([label, value], index) => { const x = 52 + (index % 3) * 170; const y = 180 + Math.floor(index / 3) * 58; doc.fillColor("#f7f3e8").roundedRect(x, y, 150, 42, 5).fill(); doc.fillColor(MUTED).fontSize(8).text(String(label).toUpperCase(), x + 10, y + 8); doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(15).text(String(value), x + 10, y + 21); });
  doc.y = 310;
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(13).text("Profile performance");
  doc.moveDown(.5);
  input.analytics.byProfile.forEach((profile) => { doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(9).text(profile.testSlug); doc.fillColor(MUTED).font("Helvetica").fontSize(8).text(`${profile.started} starts · ${profile.paid} paid · ${profile.conversionRate}% conversion · ${profile.emailRate}% emailed`, { indent: 10 }); doc.moveDown(.4); });
  doc.moveDown(1); doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(13).text("Recent trend"); doc.moveDown(.5);
  input.analytics.trend.slice(-14).forEach((point) => { doc.fillColor(MUTED).font("Helvetica").fontSize(8).text(`${point.date}   ${point.started} starts   ${point.paid} paid   ${point.sent} sent`); });
  doc.moveDown(2); doc.fillColor(MUTED).fontSize(8).text("Operational analytics only. This report contains aggregate counts and does not expose learner responses or report payloads.");
  doc.end();
  return finished;
}

export async function renderCourseShareAnalyticsPdf(input: { total: number; byCourse: Array<{ courseSlug: string; shares: number }>; byPlatform: Array<{ platform: string; shares: number }>; matrix: Array<{ courseSlug: string; platform: string; shares: number }>; fromDate?: string; toDate?: string }): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margins: { top: 52, right: 52, bottom: 52, left: 52 }, info: { Title: "Profound IQ Course Share Analytics", Author: "Profound IQ Consulting" } });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve, reject) => { doc.on("end", () => resolve(Buffer.concat(chunks))); doc.on("error", reject); });
  doc.fillColor(NAVY).rect(0, 0, doc.page.width, 88).fill();
  doc.fillColor("#f7f3e8").font("Helvetica-Bold").fontSize(10).text("PROFOUND IQ / CONSULTING", 52, 30, { characterSpacing: 1.2 });
  doc.fillColor(GOLD).font("Helvetica").fontSize(9).text("SOCIAL SHARING OBSERVATORY", 52, 50, { characterSpacing: 1 });
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(24).text("Course share analytics", 52, 124);
  doc.fillColor(MUTED).font("Helvetica").fontSize(10).text(`Period: ${input.fromDate || "All time"} — ${input.toDate || "Present"}`, 52, 158);
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(12).text(`TOTAL SHARES  ${input.total}`, 52, 200);
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(13).text("By platform", 52, 248);
  input.byPlatform.slice(0, 8).forEach((row, index) => { const y = 274 + index * 22; doc.fillColor(NAVY).font("Helvetica").fontSize(10).text(row.platform, 52, y); doc.text(String(row.shares), 360, y, { width: 100, align: "right" }); });
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(13).text("Top courses", 52, 474);
  input.byCourse.slice(0, 10).forEach((row, index) => { const y = 500 + index * 20; doc.fillColor(NAVY).font("Helvetica").fontSize(9.5).text(row.courseSlug, 52, y, { width: 300 }); doc.text(String(row.shares), 360, y, { width: 100, align: "right" }); });
  doc.end();
  return finished;
}

export async function renderCourseAccessAnalyticsPdf(input: { totalDenied: number; conversion: { deniedUsers: number; convertedUsers: number; conversionRate: number }; trend: Array<{ date: string; denied: number; paid: number; conversionRate: number }>; fromDate?: string; toDate?: string }): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margins: { top: 52, right: 52, bottom: 52, left: 52 }, info: { Title: "Profound IQ Learning Access Observatory", Author: "Profound IQ Consulting" } });
  const chunks: Buffer[] = []; doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve, reject) => { doc.on("end", () => resolve(Buffer.concat(chunks))); doc.on("error", reject); });
  const logo = await loadBrandLogo(); doc.fillColor(NAVY).rect(0, 0, doc.page.width, 92).fill(); if (logo) { try { doc.image(logo, 52, 12, { fit: [116, 68] }); } catch {} }
  doc.fillColor("#f7f3e8").font("Helvetica-Bold").fontSize(10).text("PROFOUND IQ / CONSULTING", logo ? 190 : 52, 34, { characterSpacing: 1.2 });
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(23).text("Learning Access Observatory", 52, 128); doc.fillColor(GOLD).font("Helvetica").fontSize(10).text(`${input.fromDate ?? "All time"} — ${input.toDate ?? "Today"}`, 52, 164);
  const cards = [["DENIED ATTEMPTS", input.totalDenied], ["DENIED LEARNERS", input.conversion.deniedUsers], ["CONVERTED LEARNERS", input.conversion.convertedUsers], ["CONVERSION RATE", `${input.conversion.conversionRate}%`]]; cards.forEach(([label, value], index) => { const x = 52 + (index % 2) * 250; const y = 205 + Math.floor(index / 2) * 82; doc.fillColor("#fffaf0").rect(x, y, 220, 62).fill(); doc.fillColor(MUTED).font("Helvetica-Bold").fontSize(8).text(String(label), x + 12, y + 12); doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(20).text(String(value), x + 12, y + 29); });
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(13).text("Daily conversion trend", 52, 390); doc.fillColor(MUTED).font("Helvetica").fontSize(9).text("Navy = denied attempts · Gold = paid learners", 52, 409); const points = input.trend.slice(-30); const max = Math.max(1, ...points.map((point) => Math.max(point.denied, point.paid))); points.forEach((point, index) => { const x = 54 + index * 16; const base = 650; doc.fillColor(NAVY).rect(x, base - (point.denied / max) * 190, 6, (point.denied / max) * 190).fill(); doc.fillColor(GOLD).rect(x + 7, base - (point.paid / max) * 190, 6, (point.paid / max) * 190).fill(); }); doc.fillColor(MUTED).font("Helvetica").fontSize(8).text(points[0]?.date ?? "", 52, 665); doc.text(points.at(-1)?.date ?? "", 480, 665); doc.fillColor(MUTED).fontSize(8).text("Generated from persisted access and payment records. Internal administrative use only.", 52, 760);
  doc.end(); return finished;
}


type CourseLessonReviewAnalyticsPdfInput = {
  totalResponses: number;
  reviewedResponses: number;
  needsReviewResponses: number;
  reviewRate: number;
  aging: { averageAgeHours: number; oldestAgeHours: number; under24Hours: number; oneToThreeDays: number; overThreeDays: number };
  reviewerWorkload: Array<{ reviewerName: string; reviewedResponses: number; latestReviewedAt: Date | null }>;
  byCourse: Array<{ courseSlug: string; totalResponses: number; reviewedResponses: number; needsReviewResponses: number; reviewRate: number }>;
  byModule: Array<{ courseSlug: string; moduleIndex: number; totalResponses: number; reviewedResponses: number; needsReviewResponses: number; reviewRate: number }>;
  fromDate?: Date;
  toDate?: Date;
};

export async function renderCourseLessonReviewAnalyticsPdf(input: CourseLessonReviewAnalyticsPdfInput): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", compress: false, margins: { top: 52, right: 52, bottom: 52, left: 52 }, info: { Title: "Profound IQ Instructor Review Analytics", Author: "Profound IQ Consulting" } });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve, reject) => { doc.on("end", () => resolve(Buffer.concat(chunks))); doc.on("error", reject); });
  const brandLogo = await loadBrandLogo();
  doc.fillColor(NAVY).rect(0, 0, doc.page.width, 92).fill();
  if (brandLogo) { try { doc.image(brandLogo, 52, 10, { fit: [116, 72], valign: "center" }); } catch { /* Text lockup remains available. */ } }
  const headerX = brandLogo ? 190 : 52;
  doc.fillColor("#f7f3e8").font("Helvetica-Bold").fontSize(10).text("PROFOUND IQ / CONSULTING", headerX, 32, { characterSpacing: 1.4 });
  doc.fillColor(GOLD).font("Helvetica").fontSize(9).text("INSTRUCTOR REVIEW / ANALYTICS", headerX, 52, { characterSpacing: 1.1 });
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(23).text("Instructor review analytics", 52, 128);
  doc.fillColor(MUTED).font("Helvetica").fontSize(9.5).text(`Generated ${formatDate(new Date())}${input.fromDate || input.toDate ? ` · ${input.fromDate ? formatDate(input.fromDate) : "Start"} to ${input.toDate ? formatDate(input.toDate) : "Present"}` : ""}`, 52, 162);
  let y = 205;
  const metric = (label: string, value: string) => { doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(8).text(label.toUpperCase(), 52, y, { characterSpacing: 1 }); doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(20).text(value, 52, y + 15); y += 56; };
  metric("Total responses", String(input.totalResponses)); metric("Reviewed", String(input.reviewedResponses)); metric("Needs review", String(input.needsReviewResponses)); metric("Review rate", `${input.reviewRate}%`);
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(13).text("Response aging", 290, 205);
  doc.fillColor(MUTED).font("Helvetica").fontSize(10).text(`Average open response age: ${input.aging.averageAgeHours} hours`, 290, 230);
  doc.text(`Oldest open response: ${input.aging.oldestAgeHours} hours`, 290, 248);
  doc.text(`Under 24 hours: ${input.aging.under24Hours}`, 290, 266);
  doc.text(`1–3 days: ${input.aging.oneToThreeDays}`, 290, 284);
  doc.text(`Over 3 days: ${input.aging.overThreeDays}`, 290, 302);
  y = 360;
  const section = (title: string) => { if (y > 730) { doc.addPage(); y = 55; } doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text(title.toUpperCase(), 52, y, { characterSpacing: 1.2 }); y += 20; };
  section("Reviewer workload");
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(9).text("Reviewer", 52, y); doc.text("Reviewed", 330, y); doc.text("Latest", 420, y); y += 16;
  for (const row of input.reviewerWorkload.slice(0, 15)) { if (y > 760) { doc.addPage(); y = 55; } doc.fillColor(MUTED).font("Helvetica").fontSize(9).text(row.reviewerName, 52, y, { width: 250 }); doc.text(String(row.reviewedResponses), 330, y); doc.text(row.latestReviewedAt ? formatDate(row.latestReviewedAt) : "—", 420, y); y += 15; }
  y += 18; section("Course summary");
  for (const row of input.byCourse.slice(0, 15)) { if (y > 760) { doc.addPage(); y = 55; } doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(9).text(row.courseSlug, 52, y, { width: 260 }); doc.fillColor(MUTED).font("Helvetica").fontSize(9).text(`${row.reviewedResponses}/${row.totalResponses} reviewed · ${row.reviewRate}%`, 330, y); y += 15; }
  y += 18; section("Module summary");
  for (const row of input.byModule.slice(0, 30)) { if (y > 760) { doc.addPage(); y = 55; } doc.fillColor(MUTED).font("Helvetica").fontSize(9).text(`${row.courseSlug} · Module ${row.moduleIndex + 1}`, 52, y, { width: 260 }); doc.text(`${row.reviewedResponses}/${row.totalResponses} reviewed · ${row.reviewRate}%`, 330, y); y += 15; }
  doc.end();
  return finished;
}

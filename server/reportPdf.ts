import PDFDocument from "pdfkit";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  type AssessmentReport,
  type RoleLensReadout,
  getDimensionReflectionPoints,
} from "../shared/assessment";
import type { CareerPathReport } from "../shared/careerPath";
import { getCareerPathEducationRecommendations } from "../shared/careerPathRecommendations";
import { getGeneratedCopy } from "../shared/generatedCopy";
import { PUBLISHED_SITE_ORIGIN } from "../shared/siteOrigin";

type ReportPdfInput = {
  attemptId: number;
  participantName: string;
  email?: string;
  createdAt: Date | string;
  report: AssessmentReport;
  lens?: RoleLensReadout;
  reportNumber?: string;
};
let activePdfMeta: { reportNumber?: string; participantName?: string } = {};
const NAVY = "#16243d";
const GOLD = "#a27e2e";
const MUTED = "#5f6a7b";
const SUCCESS = "#2e8b57";
const DANGER = "#c0392b";
function levelColor(score: number): string {
  if (score >= 70) return SUCCESS;
  if (score >= 50) return GOLD;
  return DANGER;
}
const LOGO_PATH = join(process.cwd(), "client/public/ProfoundIQLogo.png");
const PDF_FONT_DIR = "/usr/share/fonts";
function pdfFont(bold = false): string {
  const candidates = [
    `${PDF_FONT_DIR}/opentype/noto/NotoSansCJKsc-${bold ? "Bold" : "Regular"}.otf`,
    `${PDF_FONT_DIR}/truetype/noto/NotoSans-${bold ? "Bold" : "Regular"}.ttf`,
  ];
  return (
    candidates.find(candidate => existsSync(candidate)) ??
    (bold ? "Helvetica-Bold" : "Helvetica")
  );
}
let logoBufferPromise: Promise<Buffer | null> | null = null;

async function loadBrandLogo(): Promise<Buffer | null> {
  if (process.env.NODE_ENV === "test") return null;
  if (!logoBufferPromise)
    logoBufferPromise = (async () => {
      try {
        if (!existsSync(LOGO_PATH)) return null;
        return readFileSync(LOGO_PATH);
      } catch {
        return null;
      }
    })();
  return logoBufferPromise;
}
async function loadCustomLogo(url?: string): Promise<Buffer | null> {
  if (!url || process.env.NODE_ENV === "test") return null;
  try {
    if (url.startsWith("/")) {
      const fsPath = join(process.cwd(), "client/public", url);
      if (existsSync(fsPath)) return readFileSync(fsPath);
      return null;
    }
    const response = await fetch(url);
    return response.ok ? Buffer.from(await response.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

type CareerPathPdfInput = {
  attemptId: number;
  participantName: string;
  email?: string;
  createdAt: Date | string;
  report: CareerPathReport;
};

function drawCareerPathScoreBars(
  doc: PDFKit.PDFDocument,
  title: string,
  items: Array<{ label: string; score: number }>,
  y: number,
  color = GOLD
): number {
  doc
    .fillColor(GOLD)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(title.toUpperCase(), 52, y, { characterSpacing: 1.2 });
  y += 24;

  for (const item of items) {
    const score = Math.max(0, Math.min(100, item.score));
    doc
      .fillColor(NAVY)
      .font("Helvetica-Bold")
      .fontSize(9.5)
      .text(item.label, 52, y);
    doc
      .fillColor(MUTED)
      .font("Helvetica")
      .fontSize(9)
      .text(`${score} / 100`, 465, y, { width: 78, align: "right" });
    doc.roundedRect(52, y + 13, 491, 8, 4).fill("#e7ebf0");
    if (score > 0)
      doc.roundedRect(52, y + 13, (491 * score) / 100, 8, 4).fill(color);
    y += 31;
  }

  return y + 4;
}

export async function renderCareerPathReportPdf(
  input: CareerPathPdfInput
): Promise<Buffer> {
  const copy = getGeneratedCopy();
  const doc = new PDFDocument({
    size: "A4",
    compress: false,
    margins: { top: 52, right: 52, bottom: 52, left: 52 },
    info: {
      Title: "Profound IQ CareerPath Report",
      Author: "Profound IQ Consulting",
    },
  });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
  const brandLogo = await loadBrandLogo();
  doc.fillColor(NAVY).rect(0, 0, doc.page.width, 92).fill();
  if (brandLogo) {
    try {
      doc.image(brandLogo, 52, 10, { fit: [116, 72], valign: "center" });
    } catch {
      /* Fallback to text lockup. */
    }
  }
  const headerX = brandLogo ? 190 : 52;
  doc
    .fillColor("#f7f3e8")
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("PROFOUND IQ / CONSULTING", headerX, 32, { characterSpacing: 1.4 });
  doc
    .fillColor(GOLD)
    .font("Helvetica")
    .fontSize(9)
    .text("CAREERPATH / TALENT FIT", headerX, 52, { characterSpacing: 1.1 });
  doc
    .fillColor(NAVY)
    .font("Helvetica-Bold")
    .fontSize(24)
    .text(copy.careerPathReport, 52, 128);
  doc
    .fillColor(GOLD)
    .font("Helvetica")
    .fontSize(10)
    .text(
      `REPORT #${input.attemptId}  ·  ${formatDate(input.createdAt)}`,
      52,
      163,
      { characterSpacing: 0.7 }
    );
  doc
    .fillColor(NAVY)
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(input.participantName, 52, 198);
  if (input.email)
    doc
      .fillColor(MUTED)
      .font("Helvetica")
      .fontSize(9.5)
      .text(input.email, 52, 217);
  doc.strokeColor(GOLD).lineWidth(2).moveTo(52, 244).lineTo(543, 244).stroke();
  doc
    .fillColor(GOLD)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(copy.pathwaySignal.toUpperCase(), 52, 258, { characterSpacing: 1.5 });
  doc
    .fillColor(NAVY)
    .font("Helvetica-Bold")
    .fontSize(23)
    .text(input.report.primary.label, 52, 280);
  doc
    .fillColor(GOLD)
    .font("Helvetica-Bold")
    .fontSize(34)
    .text(`${input.report.primary.score}`, 52, 316);
  doc
    .fillColor(MUTED)
    .font("Helvetica")
    .fontSize(11)
    .text(copy.primaryRelativeFit, 124, 335);
  let y = 380;
  doc
    .fillColor(GOLD)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(copy.executiveSummary.toUpperCase(), 52, y, {
      characterSpacing: 1.2,
    });
  y += 20;
  y =
    writeText(doc, input.report.overallReadout, 52, y, 491, 10.5, NAVY, 4) + 10;
  y = writeBullets(doc, input.report.learnerProfile, y, 9.5, MUTED) + 8;
  addFooter(doc);
  doc.addPage();
  y = 58;
  doc
    .fillColor(GOLD)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("PATHWAY PROFILE", 52, y, {
      characterSpacing: 1.2,
    });
  y += 25;
  y = drawCareerPathScoreBars(
    doc,
    copy.pathwayComparison,
    input.report.pathways.map(pathway => ({
      label: pathway.label,
      score: pathway.score,
    })),
    y,
    NAVY
  );
  y = drawCareerPathScoreBars(
    doc,
    copy.subPathwayScores,
    input.report.subPathways.map(subPathway => ({
      label: subPathway.label,
      score: subPathway.score,
    })),
    y
  );
  doc
    .fillColor(MUTED)
    .font("Helvetica")
    .fontSize(8.5)
    .text(
      "Scores show relative responses within this assessment; they are not probabilities or career predictions.",
      52,
      y + 2,
      { width: 491 }
    );
  addFooter(doc);

  doc.addPage();
  y = 58;
  doc
    .fillColor(GOLD)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("SUBJECT COMBINATIONS & CAREER DIRECTIONS", 52, y, {
      characterSpacing: 1.1,
    });
  y += 25;
  const recommendations = getCareerPathEducationRecommendations(input.report);
  for (const recommendation of recommendations) {
    if (y > 650) {
      addFooter(doc);
      doc.addPage();
      y = 58;
    }
    doc
      .fillColor(NAVY)
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(recommendation.label, 52, y);
    doc
      .fillColor(GOLD)
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(`${recommendation.score} / 100`, 450, y, {
        width: 93,
        align: "right",
      });
    y += 15;
    doc
      .fillColor(MUTED)
      .font("Helvetica")
      .fontSize(8.5)
      .text(`${recommendation.pathway} / ${recommendation.track}`, 52, y);
    y += 14;
    for (const combination of recommendation.combinations) {
      y = writeText(
        doc,
        `${combination.subjects.join(", ")} (guide page ${combination.page}, row ${combination.row})`,
        60,
        y,
        483,
        9,
        NAVY,
        2
      );
      y += 3;
    }
    y = writeText(
      doc,
      `Career directions to explore: ${recommendation.careerDirections.join("; ")}.`,
      60,
      y + 2,
      483,
      9,
      MUTED,
      3
    );
    y += 12;
  }
  y = writeText(
    doc,
    "Subject combinations are taken from the supplied senior-school guide. Career directions are broad exploration ideas, not eligibility advice or predictions. Confirm current subject availability and entry requirements with the learner's school and official guidance.",
    52,
    y + 2,
    491,
    8.5,
    MUTED,
    4
  );
  y += 12;
  if (y > 625) {
    addFooter(doc);
    doc.addPage();
    y = 58;
  }
  doc
    .fillColor(GOLD)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(copy.explorationPlan.toUpperCase(), 52, y, { characterSpacing: 1.2 });
  y += 20;
  y = writeBullets(doc, input.report.explorationPlan, y, 9.5, NAVY) + 14;
  if (y > 650) {
    addFooter(doc);
    doc.addPage();
    y = 58;
  }
  doc
    .fillColor(GOLD)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(copy.explorationPlan.toUpperCase(), 52, y, { characterSpacing: 1.2 });
  y += 21;
  y = writeBullets(doc, input.report.explorationPlan, y, 9.8, NAVY) + 18;
  if (y > 650) {
    addFooter(doc);
    doc.addPage();
    y = 58;
  }
  doc
    .fillColor(GOLD)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(copy.importantContext.toUpperCase(), 52, y, {
      characterSpacing: 1.2,
    });
  y += 20;
  y = writeBullets(doc, input.report.importantContext, y, 9, MUTED);
  y += 8;
  writeText(doc, input.report.disclaimer, 52, y, 491, 8, MUTED, 4);
  addFooter(doc);
  doc.end();
  return finished;
}

export async function renderAssessmentReportPdf(
  input: ReportPdfInput
): Promise<Buffer> {
  const copy = getGeneratedCopy();
  const doc = new PDFDocument({
    size: "A4",
    compress: false,
    margins: { top: 52, right: 52, bottom: 52, left: 52 },
    info: {
      Title: "Profound IQ Assessment Report",
      Author: "Profound IQ Consulting",
    },
  });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const brandLogo = await loadBrandLogo();
  const reportNumber =
    input.reportNumber ??
    `PIQ-SSA-${input.attemptId || Date.now().toString(36).toUpperCase()}`;
  activePdfMeta = {
    reportNumber,
    participantName: input.participantName,
  };
  doc.fillColor(NAVY).rect(0, 0, doc.page.width, 92).fill();
  if (brandLogo) {
    try {
      doc.image(brandLogo, 52, 10, { fit: [116, 72], valign: "center" });
    } catch {
      /* Fallback to the text lockup. */
    }
  }
  const headerX = brandLogo ? 190 : 52;
  doc
    .fillColor("#f7f3e8")
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("PROFOUND IQ / CONSULTING", headerX, 32, { characterSpacing: 1.4 });
  doc
    .fillColor(GOLD)
    .font("Helvetica")
    .fontSize(9)
    .text("EXECUTIVE OBSERVATORY", headerX, 52, { characterSpacing: 1.1 });
  doc
    .fillColor(NAVY)
    .font("Helvetica-Bold")
    .fontSize(25)
    .text(copy.assessmentReport, 52, 128);
  doc
    .fillColor(GOLD)
    .font("Helvetica")
    .fontSize(10)
    .text(
      `REPORT ${reportNumber}  ·  ${formatDate(input.createdAt)}`,
      52,
      163,
      { characterSpacing: 0.7 }
    );
  doc
    .fillColor(NAVY)
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(input.participantName, 52, 198);
  if (input.email)
    doc
      .fillColor(MUTED)
      .font("Helvetica")
      .fontSize(9.5)
      .text(input.email, 52, 217);
  doc
    .fillColor(MUTED)
    .font("Helvetica-Oblique")
    .fontSize(9)
    .text(
      `Prepared exclusively for ${input.participantName}. This report is unique to your responses and should be read alongside observed behaviour and feedback.`,
      52,
      232,
      { width: 491 }
    );
  doc.strokeColor(GOLD).lineWidth(2).moveTo(52, 256).lineTo(543, 256).stroke();
  doc
    .fillColor(GOLD)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("THE SIGNAL", 52, 270, { characterSpacing: 1.5 });
  doc
    .fillColor(NAVY)
    .font("Helvetica-Bold")
    .fontSize(44)
    .text(`${input.report.overallScore}`, 52, 284);
  doc
    .fillColor(MUTED)
    .font("Helvetica-Bold")
    .fontSize(9)
    .text(copy.overallScore.toUpperCase(), 54, 338, { characterSpacing: 1 });
  doc
    .fillColor(NAVY)
    .font("Helvetica-Bold")
    .fontSize(18)
    .text(input.report.overallBand, 52, 356);

  drawRadarChart(
    doc,
    input.report.dimensions.map(d => ({ label: d.label, score: d.score })),
    445,
    316,
    50
  );

  doc
    .fillColor(GOLD)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("CAPABILITY PROFILE", 52, 390, { characterSpacing: 1.2 });
  const chartEndY = drawDimensionBars(
    doc,
    input.report.dimensions.map(d => ({ label: d.label, score: d.score })),
    400,
    { gap: 16 }
  );
  doc
    .fillColor(MUTED)
    .font("Helvetica")
    .fontSize(7.5)
    .text(
      "Bars coloured by level:  green ≥ 70  ·  gold 50–69  ·  red < 50",
      52,
      chartEndY
    );

  let y = chartEndY + 18;
  const summary = input.report.executiveSummary;
  doc
    .fillColor(GOLD)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(copy.executiveSummary.toUpperCase(), 52, y, {
      characterSpacing: 1.2,
    });
  y += 22;
  doc
    .fillColor(NAVY)
    .font("Helvetica-Bold")
    .fontSize(15)
    .text(
      summary?.headline ??
        `${input.report.overallBand}: a practical view of your current capability pattern`,
      52,
      y,
      { width: 491 }
    );
  y +=
    doc.heightOfString(
      summary?.headline ??
        `${input.report.overallBand}: a practical view of your current capability pattern`,
      { width: 491 }
    ) + 7;
  y =
    writeText(
      doc,
      summary?.overview ??
        "Use this report as a professional development conversation starter, pairing the signal with observed behavior, context, feedback, and outcomes.",
      52,
      y,
      491,
      9.8,
      MUTED,
      3
    ) + 7;
  y =
    writeBullets(
      doc,
      summary?.priorities ?? input.report.focusAreas,
      y,
      9.5,
      NAVY
    ) + 7;
  if (input.lens && y < 690) {
    doc
      .fillColor(GOLD)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text(input.lens.label.toUpperCase(), 52, y + 4, {
        characterSpacing: 1.1,
      });
    y += 19;
    y = writeText(doc, input.lens.context, 52, y, 491, 9.3, MUTED, 3) + 6;
    y = writeBullets(doc, input.lens.priorities, y, 9.2, NAVY) + 4;
  }
  if (y > 700) {
    addFooter(doc);
    doc.addPage();
    y = 58;
  }

  // Strengths & growth — two-column infographic
  doc
    .fillColor(GOLD)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("STRENGTHS & GROWTH", 52, y, { characterSpacing: 1.2 });
  y += 22;
  const colW = 235;
  const leftX = 52;
  const rightX = 308;
  doc
    .fillColor(SUCCESS)
    .font("Helvetica-Bold")
    .fontSize(9)
    .text("STRENGTHS TO COMPOUND", leftX, y, { characterSpacing: 1 });
  doc
    .fillColor(DANGER)
    .font("Helvetica-Bold")
    .fontSize(9)
    .text("GROWTH AREAS", rightX, y, { characterSpacing: 1 });
  y += 16;
  const strengths = input.report.strengths.slice(0, 3);
  const focus = input.report.focusAreas.slice(0, 3);
  const rows = Math.max(strengths.length, focus.length);
  for (let i = 0; i < rows; i++) {
    if (strengths[i]) {
      doc
        .fillColor(SUCCESS)
        .circle(leftX + 3, y + 5, 2.5)
        .fill();
      doc
        .fillColor(NAVY)
        .font("Helvetica")
        .fontSize(9)
        .text(strengths[i], leftX + 14, y, {
          width: colW - 14,
          ellipsis: true,
          lineBreak: false,
        });
    }
    if (focus[i]) {
      doc
        .fillColor(DANGER)
        .circle(rightX + 3, y + 5, 2.5)
        .fill();
      doc
        .fillColor(NAVY)
        .font("Helvetica")
        .fontSize(9)
        .text(focus[i], rightX + 14, y, {
          width: colW - 14,
          ellipsis: true,
          lineBreak: false,
        });
    }
    y += 15;
  }
  y += 14;

  // Dimension summary — compact table
  doc
    .fillColor(GOLD)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("DIMENSION SUMMARY", 52, y, { characterSpacing: 1.2 });
  y += 20;
  for (const dim of input.report.dimensions) {
    if (y > 720) {
      addFooter(doc);
      doc.addPage();
      y = 58;
    }
    doc
      .fillColor(NAVY)
      .font("Helvetica-Bold")
      .fontSize(9.5)
      .text(dim.label, 52, y, { width: 300, ellipsis: true, lineBreak: false });
    doc
      .fillColor(levelColor(dim.score))
      .font("Helvetica-Bold")
      .fontSize(9.5)
      .text(`${dim.score}/100`, 360, y, { width: 80, align: "right" });
    doc
      .fillColor(MUTED)
      .font("Helvetica")
      .fontSize(8)
      .text(`${dim.reliability}% consistency`, 445, y, {
        width: 98,
        align: "right",
      });
    doc
      .strokeColor("#eee7d6")
      .lineWidth(0.5)
      .moveTo(52, y + 15)
      .lineTo(543, y + 15)
      .stroke();
    y += 22;
  }
  y += 10;

  // Reflection prompts
  if (y > 700) {
    addFooter(doc);
    doc.addPage();
    y = 58;
  }
  doc
    .fillColor(GOLD)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("Reflection prompts", 52, y, { characterSpacing: 1.2 });
  y += 18;
  const reflectionPoints =
    input.report.reflectionPoints?.length > 0
      ? input.report.reflectionPoints
      : input.report.dimensions.flatMap((dimension) =>
          getDimensionReflectionPoints(dimension),
        );
  y =
    writeBullets(doc, reflectionPoints.slice(0, 4), y, 9.5, NAVY) + 12;

  // Important context
  if (y > 700) {
    addFooter(doc);
    doc.addPage();
    y = 58;
  }
  doc
    .fillColor(GOLD)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(copy.importantContext.toUpperCase(), 52, y, {
      characterSpacing: 1.2,
    });
  y += 18;
  y =
    writeBullets(
      doc,
      (input.report.importantContext ?? [input.report.disclaimer]).slice(0, 3),
      y,
      9.3,
      MUTED
    ) + 14;

  // Considered next step
  if (y > 700) {
    addFooter(doc);
    doc.addPage();
    y = 58;
  }
  doc
    .fillColor(NAVY)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("A considered next step", 52, y);
  y += 16;
  y =
    writeText(
      doc,
      "Select one focus area, define a small action, and revisit the signal after deliberate practice. Pair this reflection with observed behaviour, stakeholder feedback, and evidence of outcomes.",
      52,
      y,
      491,
      9.5,
      MUTED,
      3
    ) + 16;

  // Disclaimer
  doc
    .fillColor(MUTED)
    .font("Helvetica-Oblique")
    .fontSize(8)
    .text(input.report.disclaimer, 52, y, { width: 491 });
  addFooter(doc);
  doc.end();
  return finished;
}

function writeBullets(
  doc: PDFKit.PDFDocument,
  items: string[],
  y: number,
  fontSize: number,
  color: string
): number {
  for (const item of items) {
    doc
      .fillColor(GOLD)
      .circle(59, y + 5, 2.5)
      .fill();
    y = writeText(doc, item, 74, y, 469, fontSize, color, 3) + 6;
  }
  return y;
}

function writeText(
  doc: PDFKit.PDFDocument,
  value: string,
  x: number,
  y: number,
  width: number,
  fontSize: number,
  color: string,
  lineGap: number
): number {
  doc.fillColor(color).font("Helvetica").fontSize(fontSize);
  doc.text(value, x, y, { width, lineGap });
  return y + doc.heightOfString(value, { width, lineGap });
}

function drawDimensionBars(
  doc: PDFKit.PDFDocument,
  dimensions: Array<{ label: string; score: number }>,
  startY: number,
  options?: {
    barWidth?: number;
    barHeight?: number;
    gap?: number;
    labelWidth?: number;
  }
): number {
  const barWidth = options?.barWidth ?? 170;
  const barHeight = options?.barHeight ?? 9;
  const gap = options?.gap ?? 20;
  const labelWidth = options?.labelWidth ?? 190;
  const trackX = 52 + labelWidth + 8;
  let y = startY;
  for (const dim of dimensions) {
    if (y > 700) {
      addFooter(doc);
      doc.addPage();
      y = 58;
    }
    doc.fillColor(NAVY).font("Helvetica").fontSize(9).text(dim.label, 52, y, {
      width: labelWidth,
      ellipsis: true,
      lineBreak: false,
    });
    doc
      .fillColor("#e8e2d4")
      .roundedRect(trackX, y + 1.5, barWidth, barHeight, 3)
      .fill();
    const ratio = Math.max(0, Math.min(1, dim.score / 100));
    if (ratio > 0) {
      doc
        .fillColor(levelColor(dim.score))
        .roundedRect(
          trackX,
          y + 1.5,
          Math.max(barHeight, barWidth * ratio),
          barHeight,
          3
        )
        .fill();
    }
    doc
      .fillColor(NAVY)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text(`${dim.score}`, trackX + barWidth + 8, y, {
        width: 40,
        lineBreak: false,
      });
    y += gap;
  }
  return y;
}

function drawRadarChart(
  doc: PDFKit.PDFDocument,
  dimensions: Array<{ label: string; score: number }>,
  cx: number,
  cy: number,
  radius: number
): void {
  const n = dimensions.length;
  if (!n) return;
  const angleStep = (Math.PI * 2) / n;
  const point = (i: number, r: number): [number, number] => {
    const a = -Math.PI / 2 + i * angleStep;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  };
  const traceData = () => {
    dimensions.forEach((d, i) => {
      const ratio = Math.max(0, Math.min(1, d.score / 100));
      const [x, y] = point(i, radius * ratio);
      if (i === 0) doc.moveTo(x, y);
      else doc.lineTo(x, y);
    });
    doc.closePath();
  };
  doc.save();
  doc.lineWidth(0.5).strokeColor("#d8d1c1");
  for (const ring of [0.25, 0.5, 0.75, 1]) {
    for (let i = 0; i < n; i++) {
      const [x, y] = point(i, radius * ring);
      if (i === 0) doc.moveTo(x, y);
      else doc.lineTo(x, y);
    }
    doc.closePath().stroke();
  }
  for (let i = 0; i < n; i++) {
    const [x, y] = point(i, radius);
    doc.moveTo(cx, cy).lineTo(x, y).stroke();
  }
  traceData();
  doc.fillOpacity(0.28).fillColor(GOLD).fill();
  traceData();
  doc.fillOpacity(1).strokeColor(GOLD).lineWidth(1.5).stroke();
  doc.restore();
}

function addFooter(doc: PDFKit.PDFDocument): void {
  const pageNumber = doc.bufferedPageRange().count;
  doc
    .fillColor(GOLD)
    .font("Helvetica-Bold")
    .fontSize(8.5)
    .text(
      activePdfMeta.reportNumber
        ? `${activePdfMeta.reportNumber}  ·  ${PUBLISHED_SITE_ORIGIN}`
        : PUBLISHED_SITE_ORIGIN,
      52,
      742,
      { width: 390, ellipsis: true, lineBreak: false, characterSpacing: 0.6 }
    );
  if (activePdfMeta.participantName) {
    doc
      .fillColor(MUTED)
      .font("Helvetica")
      .fontSize(8)
      .text(activePdfMeta.participantName, 52, 754, {
        width: 390,
        ellipsis: true,
        lineBreak: false,
      });
  }
  doc
    .fillColor(MUTED)
    .font("Helvetica")
    .fontSize(8)
    .text(`Page ${pageNumber}`, 450, 742, { width: 93, align: "right" });
}
function formatDate(value: Date | string): string {
  const language = "en-KE";
  try {
    return new Date(value).toLocaleDateString(language, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return new Date(value).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
}

type SavedCoursePathwayPdfInput = {
  participantName: string;
  email?: string;
  layout?: "summary" | "detailed";
  pageSize?: "A4" | "LETTER";
  watermark?: boolean;
  coverPage?: boolean;
  coverTemplate?: "classic" | "editorial" | "signal";
  customLogoUrl?: string;
  courses: Array<{
    title: string;
    category: string;
    skillLevel: string;
    duration: string;
    priceKes: number;
    outcomes: readonly string[];
  }>;
};

export async function renderSavedCoursePathwaysPdf(
  input: SavedCoursePathwayPdfInput
): Promise<Buffer> {
  const copy = getGeneratedCopy();
  const labels = {
    savedPathways: "Your saved learning pathways",
    preparedFor: "Prepared for",
    pathway: "PATHWAY",
    outcomes: "OUTCOMES",
    noSaved: "No saved pathways yet.",
    returnToCatalog:
      "Return to the course catalog to save a pathway for later reference.",
  };
  const regularFont = pdfFont();
  const boldFont = pdfFont(true);
  const doc = new PDFDocument({
    size: input.pageSize ?? "A4",
    compress: false,
    margins: { top: 52, right: 52, bottom: 52, left: 52 },
    info: {
      Title: `Profound IQ Saved Learning Pathways — ${labels.savedPathways}`,
      Author: "Profound IQ Consulting",
      Subject: `Saved course pathways · ${labels.savedPathways}`,
    },
  });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
  const brandLogo =
    (await loadCustomLogo(input.customLogoUrl)) ?? (await loadBrandLogo());
  if (input.coverPage && input.layout === "detailed") {
    const template = input.coverTemplate ?? "classic";
    const coverBackground =
      template === "editorial"
        ? "#f7f3e8"
        : template === "signal"
          ? "#0d172b"
          : NAVY;
    const coverForeground = template === "editorial" ? NAVY : "#f7f3e8";
    doc
      .fillColor(coverBackground)
      .rect(0, 0, doc.page.width, doc.page.height)
      .fill();
    if (brandLogo) {
      try {
        doc.image(
          brandLogo,
          template === "signal" ? 52 : (doc.page.width - 150) / 2,
          template === "signal" ? 58 : 92,
          { fit: [150, 96], valign: "center" }
        );
      } catch {
        /* Text lockup remains available. */
      }
    }
    const coverAlign = template === "signal" ? "left" : "center";
    const coverX = template === "signal" ? 52 : 52;
    doc
      .fillColor(GOLD)
      .font(boldFont)
      .fontSize(10)
      .text(
        "PROFOUND IQ / CONSULTING",
        coverX,
        template === "signal" ? 205 : 230,
        {
          width: doc.page.width - 104,
          align: coverAlign,
          characterSpacing: 1.4,
        }
      );
    doc
      .fillColor(coverForeground)
      .font(boldFont)
      .fontSize(template === "editorial" ? 32 : 28)
      .text(labels.savedPathways, coverX, template === "signal" ? 250 : 280, {
        width: doc.page.width - 104,
        align: coverAlign,
      });
    doc
      .fillColor(template === "editorial" ? MUTED : "#c1cad7")
      .font(regularFont)
      .fontSize(13)
      .text(
        `${labels.preparedFor} ${input.participantName}`,
        coverX,
        template === "signal" ? 355 : 355,
        { width: doc.page.width - 104, align: coverAlign }
      );
    doc
      .fillColor(template === "editorial" ? MUTED : "#c1cad7")
      .font(regularFont)
      .fontSize(10)
      .text(`${copy.generated} ${formatDate(new Date())}`, coverX, 382, {
        width: doc.page.width - 104,
        align: coverAlign,
      });
    doc
      .fillColor(GOLD)
      .font(regularFont)
      .fontSize(9)
      .text(
        `${input.courses.length} ${labels.pathway.toLowerCase()}`,
        coverX,
        430,
        { width: doc.page.width - 104, align: coverAlign }
      );
    doc.addPage();
  }
  if (input.watermark) {
    doc.opacity(0.04).fillColor(NAVY);
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 8; j++) {
        const watermarkX = 50 + i * 180;
        const watermarkY = 50 + j * 120;
        doc.save();
        doc.rotate(35, { origin: [watermarkX, watermarkY] });
        doc
          .font(boldFont)
          .fontSize(40)
          .text("PROFOUND IQ", watermarkX, watermarkY);
        doc.restore();
      }
    }
  }
  doc.fillColor(NAVY).rect(0, 0, doc.page.width, 108).fill();
  if (brandLogo) {
    try {
      doc.image(brandLogo, 52, 14, { fit: [116, 78], valign: "center" });
    } catch {
      /* Text lockup remains available. */
    }
  }
  const headerX = brandLogo ? 190 : 52;
  doc
    .fillColor("#f7f3e8")
    .font(boldFont)
    .fontSize(10)
    .text("PROFOUND IQ / CONSULTING", headerX, 36, { characterSpacing: 1.4 });
  doc
    .fillColor(GOLD)
    .font(regularFont)
    .fontSize(9)
    .text("MY SPACE / SAVED PATHWAYS", headerX, 58, { characterSpacing: 1.1 });
  doc
    .fillColor(NAVY)
    .font(boldFont)
    .fontSize(25)
    .text(labels.savedPathways, 52, 145);
  doc
    .fillColor(MUTED)
    .font(regularFont)
    .fontSize(10)
    .text(
      `${labels.preparedFor} ${input.participantName}${input.email ? ` · ${input.email}` : ""}`,
      52,
      180
    );
  doc
    .font(regularFont)
    .text(`${copy.generated} ${formatDate(new Date())}`, 52, 196);
  doc.strokeColor(GOLD).lineWidth(2).moveTo(52, 224).lineTo(543, 224).stroke();
  let y = 252;
  if (!input.courses.length) {
    doc.fillColor(NAVY).font(boldFont).fontSize(14).text(labels.noSaved, 52, y);
    doc
      .fillColor(MUTED)
      .font(regularFont)
      .fontSize(10)
      .text(labels.returnToCatalog, 52, y + 24, { width: 490 });
  }
  input.courses.forEach((course, index) => {
    if (y > 690) {
      addFooter(doc);
      doc.addPage();
      y = 58;
    }
    doc
      .fillColor(GOLD)
      .font(boldFont)
      .fontSize(9)
      .text(`${labels.pathway} ${String(index + 1).padStart(2, "0")}`, 52, y, {
        characterSpacing: 1.2,
      });
    doc
      .fillColor(NAVY)
      .font(boldFont)
      .fontSize(17)
      .text(course.title, 52, y + 18, { width: 390 });
    doc
      .fillColor(MUTED)
      .font(regularFont)
      .fontSize(9.5)
      .text(
        `${course.category} · ${course.skillLevel} · ${course.duration} · KES ${course.priceKes.toLocaleString()}`,
        52,
        y + 43,
        { width: 490 }
      );
    y += 65;
    if (input.layout !== "summary") {
      doc
        .fillColor(GOLD)
        .font(boldFont)
        .fontSize(8)
        .text(labels.outcomes, 52, y, { characterSpacing: 1.1 });
      y += 16;
      y = writeBullets(doc, course.outcomes.slice(0, 5), y, 9.5, MUTED) + 16;
    } else {
      y =
        writeText(
          doc,
          course.outcomes[0] ?? "A structured professional learning pathway.",
          52,
          y,
          490,
          9.5,
          MUTED,
          3
        ) + 16;
    }
    doc
      .strokeColor("#d8d1c1")
      .lineWidth(1)
      .moveTo(52, y)
      .lineTo(543, y)
      .stroke();
    y += 20;
  });
  addFooter(doc);
  doc.end();
  return finished;
}

export async function renderAssessmentScoreSummaryPdf(input: {
  participantName: string;
  email?: string;
  createdAt: Date | string;
  reports: Array<{
    version?: string | null;
    createdAt: Date | string;
    overallScore?: number | null;
    overallBand?: string | null;
    dimensionScores?: Array<{ label: string; score: number }>;
  }>;
}): Promise<Buffer> {
  const copy = getGeneratedCopy();
  const doc = new PDFDocument({
    size: "A4",
    compress: false,
    margins: { top: 52, right: 52, bottom: 52, left: 52 },
    info: {
      Title: "Profound IQ Score Summary",
      Author: "Profound IQ Consulting",
    },
  });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
  const brandLogo = await loadBrandLogo();
  doc.fillColor(NAVY).rect(0, 0, doc.page.width, 92).fill();
  if (brandLogo) {
    try {
      doc.image(brandLogo, 52, 10, { fit: [116, 72], valign: "center" });
    } catch {
      /* Text lockup remains available. */
    }
  }
  const headerX = brandLogo ? 190 : 52;
  doc
    .fillColor("#f7f3e8")
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("PROFOUND IQ / CONSULTING", headerX, 32, { characterSpacing: 1.4 });
  doc
    .fillColor(GOLD)
    .font("Helvetica")
    .fontSize(9)
    .text("PERSONAL SCORE SUMMARY", headerX, 52, { characterSpacing: 1.1 });
  doc
    .fillColor(NAVY)
    .font("Helvetica-Bold")
    .fontSize(25)
    .text(copy.scoreSummary, 52, 128);
  doc
    .fillColor(GOLD)
    .font("Helvetica")
    .fontSize(10)
    .text(`GENERATED ${formatDate(input.createdAt)}`, 52, 163, {
      characterSpacing: 0.7,
    });
  doc
    .fillColor(NAVY)
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(input.participantName, 52, 198);
  if (input.email)
    doc
      .fillColor(MUTED)
      .font("Helvetica")
      .fontSize(9.5)
      .text(input.email, 52, 217);
  doc.strokeColor(GOLD).lineWidth(2).moveTo(52, 244).lineTo(543, 244).stroke();
  let y = 278;
  doc
    .fillColor(GOLD)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(copy.report.toUpperCase(), 52, y, { characterSpacing: 1.2 });
  y += 24;
  for (const report of input.reports) {
    if (y > 690) {
      addFooter(doc);
      doc.addPage();
      y = 58;
    }
    doc
      .fillColor(NAVY)
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(report.version ?? "Assessment report", 52, y);
    doc
      .fillColor(GOLD)
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(`${report.overallScore ?? "—"} / 100`, 450, y, {
        width: 93,
        align: "right",
      });
    y += 17;
    doc
      .fillColor(MUTED)
      .font("Helvetica")
      .fontSize(9.5)
      .text(
        `${formatDate(report.createdAt)}${report.overallBand ? `  ·  ${report.overallBand}` : ""}`,
        52,
        y
      );
    y += 18;
    for (const dimension of (report.dimensionScores ?? []).slice(0, 10)) {
      doc
        .fillColor(NAVY)
        .font("Helvetica")
        .fontSize(9.5)
        .text(dimension.label, 74, y);
      doc
        .fillColor(GOLD)
        .font("Helvetica-Bold")
        .fontSize(9.5)
        .text(`${dimension.score} / 100`, 450, y, {
          width: 93,
          align: "right",
        });
      y += 14;
    }
    doc
      .strokeColor("#d8d1c1")
      .lineWidth(1)
      .moveTo(52, y + 4)
      .lineTo(543, y + 4)
      .stroke();
    y += 20;
  }
  if (!input.reports.length)
    writeText(
      doc,
      `${copy.report}: no paid assessment scores are available yet.`,
      52,
      y,
      491,
      10,
      MUTED,
      4
    );
  addFooter(doc);
  doc.end();
  return finished;
}

export async function renderPaymentReceiptPdf(input: {
  attemptId: number;
  participantName: string;
  email: string;
  reference: string;
  amountKes: number;
  paidAt?: Date | string;
  verificationUrl: string;
}): Promise<Buffer> {
  const copy = getGeneratedCopy();
  const doc = new PDFDocument({
    size: "A4",
    compress: false,
    margins: { top: 52, right: 52, bottom: 52, left: 52 },
    info: {
      Title: "Profound IQ Consulting Payment Receipt",
      Author: "Profound IQ Consulting",
      Subject: "Verified payment receipt",
    },
  });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
  const brandLogo = await loadBrandLogo();
  doc.fillColor(NAVY).rect(0, 0, doc.page.width, 100).fill();
  if (brandLogo) {
    try {
      doc.image(brandLogo, 52, 14, { fit: [120, 72] });
    } catch {
      /* fall back to text */
    }
  }
  doc
    .fillColor("#f7f3e8")
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("PROFOUND IQ / CONSULTING", brandLogo ? 190 : 52, 36, {
      characterSpacing: 1.3,
    });
  doc
    .fillColor(GOLD)
    .font("Helvetica")
    .fontSize(9)
    .text("TRANSFORMATION SERVICES", brandLogo ? 190 : 52, 57, {
      characterSpacing: 1.1,
    });
  doc
    .fillColor(NAVY)
    .font("Helvetica-Bold")
    .fontSize(25)
    .text(copy.paymentReceipt, 52, 145);
  doc
    .fillColor(MUTED)
    .font("Helvetica")
    .fontSize(10)
    .text(
      `Receipt #${input.attemptId} · ${formatDate(input.paidAt ?? new Date())}`,
      52,
      179
    );
  doc.strokeColor(GOLD).lineWidth(2).moveTo(52, 207).lineTo(543, 207).stroke();
  doc
    .fillColor(MUTED)
    .font("Helvetica-Bold")
    .fontSize(9)
    .text(copy.learner.toUpperCase(), 52, 242, { characterSpacing: 1.1 });
  doc
    .fillColor(NAVY)
    .font("Helvetica-Bold")
    .fontSize(14)
    .text(input.participantName, 52, 260);
  doc
    .fillColor(MUTED)
    .font("Helvetica")
    .fontSize(10)
    .text(input.email, 52, 282);
  doc
    .fillColor(MUTED)
    .font("Helvetica-Bold")
    .fontSize(9)
    .text(copy.amountPaid.toUpperCase(), 52, 330, { characterSpacing: 1.1 });
  doc
    .fillColor(NAVY)
    .font("Helvetica-Bold")
    .fontSize(23)
    .text(`KES ${input.amountKes.toLocaleString("en-KE")}`, 52, 348);
  doc
    .fillColor(MUTED)
    .font("Helvetica-Bold")
    .fontSize(9)
    .text(copy.transactionReference.toUpperCase(), 52, 404, {
      characterSpacing: 1.1,
    });
  doc
    .fillColor(NAVY)
    .font("Helvetica")
    .fontSize(10)
    .text(input.reference, 52, 422);
  doc
    .fillColor(MUTED)
    .font("Helvetica")
    .fontSize(9)
    .text(
      "This receipt confirms a successful Paystack transaction for Profound IQ Consulting transformation services.",
      52,
      485,
      { width: 490, lineGap: 4 }
    );
  doc
    .fillColor(GOLD)
    .font("Helvetica-Bold")
    .fontSize(9)
    .text(copy.verifyCredential.toUpperCase(), 52, 555, {
      characterSpacing: 1.1,
    });
  doc
    .fillColor(NAVY)
    .font("Helvetica")
    .fontSize(9)
    .fillColor(NAVY)
    .text(input.verificationUrl, 52, 575, {
      link: input.verificationUrl,
      underline: true,
      width: 490,
    });
  doc
    .fillColor(MUTED)
    .font("Helvetica")
    .fontSize(8)
    .text(
      "Scan the QR code on your credential or open the verification link above to confirm authenticity.",
      52,
      610,
      { width: 490 }
    );
  doc.fillColor(NAVY).rect(0, 760, doc.page.width, 82).fill();
  doc
    .fillColor("#f7f3e8")
    .font("Helvetica")
    .fontSize(8)
    .text(
      `${PUBLISHED_SITE_ORIGIN}  ·  admin@profoundiqconsulting.com  ·  +254 727 374 055`,
      52,
      796,
      { width: 490, align: "center" }
    );
  doc.end();
  return finished;
}

import type { PsychometricReport } from "../shared/psychometrics";

type PsychometricPdfInput = {
  attemptId: number;
  participantName: string;
  email?: string;
  createdAt: Date | string;
  report: PsychometricReport;
  verificationUrl: string;
};

export async function renderPsychometricReportPdf(
  input: PsychometricPdfInput
): Promise<Buffer> {
  const copy = getGeneratedCopy();
  const doc = new PDFDocument({
    size: "A4",
    compress: false,
    margins: { top: 52, right: 52, bottom: 52, left: 52 },
    info: {
      Title: `${input.report.title} — Profound IQ Consulting`,
      Author: "Profound IQ Consulting",
    },
  });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
  const brandLogo = await loadBrandLogo();
  doc.fillColor(NAVY).rect(0, 0, doc.page.width, 92).fill();
  if (brandLogo) {
    try {
      doc.image(brandLogo, 52, 10, { fit: [116, 72], valign: "center" });
    } catch {
      /* Text lockup remains the fallback. */
    }
  }
  const headerX = brandLogo ? 190 : 52;
  doc
    .fillColor("#f7f3e8")
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("PROFOUND IQ / CONSULTING", headerX, 32, { characterSpacing: 1.4 });
  doc
    .fillColor(GOLD)
    .font("Helvetica")
    .fontSize(9)
    .text("PSYCHOMETRIC ASSESSMENT SUITE", headerX, 52, {
      characterSpacing: 1.1,
    });
  doc
    .fillColor(NAVY)
    .font("Helvetica-Bold")
    .fontSize(23)
    .text(input.report.title, 52, 128, { width: 491 });
  doc
    .fillColor(GOLD)
    .font("Helvetica")
    .fontSize(9)
    .text(
      `REPORT #${input.attemptId}  ·  ${formatDate(input.createdAt)}`,
      52,
      169,
      { characterSpacing: 0.7 }
    );
  doc
    .fillColor(NAVY)
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(input.participantName, 52, 204);
  if (input.email)
    doc
      .fillColor(MUTED)
      .font("Helvetica")
      .fontSize(9.5)
      .text(input.email, 52, 223);
  doc.strokeColor(GOLD).lineWidth(2).moveTo(52, 250).lineTo(543, 250).stroke();
  doc
    .fillColor(GOLD)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("OVERALL PROFILE", 52, 265, { characterSpacing: 1.3 });
  doc
    .fillColor(NAVY)
    .font("Helvetica-Bold")
    .fontSize(42)
    .text(`${input.report.overallScore}`, 52, 286);
  doc
    .fillColor(MUTED)
    .font("Helvetica")
    .fontSize(11)
    .text(copy.overallScore, 124, 310);
  doc
    .fillColor(NAVY)
    .font("Helvetica-Bold")
    .fontSize(16)
    .text(input.report.overallBand, 52, 350);
  drawRadarChart(
    doc,
    input.report.domains.map(d => ({ label: d.label, score: d.score })),
    445,
    318,
    56
  );
  doc
    .fillColor(GOLD)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("DOMAIN PROFILE", 52, 378, { characterSpacing: 1.2 });
  const psychChartEndY = drawDimensionBars(
    doc,
    input.report.domains.map(d => ({ label: d.label, score: d.score })),
    398
  );
  doc
    .fillColor(MUTED)
    .font("Helvetica")
    .fontSize(7.5)
    .text(
      "Bars coloured by level:  green ≥ 70  ·  gold 50–69  ·  red < 50",
      52,
      psychChartEndY
    );
  let y = psychChartEndY + 16;
  doc
    .fillColor(GOLD)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(copy.executiveSummary.toUpperCase(), 52, y, {
      characterSpacing: 1.2,
    });
  y += 21;
  y =
    writeText(
      doc,
      `This report presents a structured development signal across the dimensions of the ${input.report.title}. Use it to guide reflection, learning plans, coaching, and evidence-based conversations.`,
      52,
      y,
      491,
      10,
      MUTED,
      4
    ) + 14;
  doc
    .fillColor(GOLD)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(copy.pathwaySignal.toUpperCase(), 52, y, { characterSpacing: 1.2 });
  y += 20;
  y = writeBullets(doc, input.report.strengths, y, 9.8, NAVY) + 10;
  doc
    .fillColor(GOLD)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(copy.focusAreasToExplore.toUpperCase(), 52, y, {
      characterSpacing: 1.2,
    });
  y += 20;
  y = writeBullets(doc, input.report.developmentPriorities, y, 9.8, NAVY) + 10;
  addFooter(doc);
  doc.addPage();
  y = 58;
  doc
    .fillColor(GOLD)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(copy.dimensionReadout.toUpperCase(), 52, y, {
      characterSpacing: 1.2,
    });
  y += 25;
  for (const dimension of input.report.domains) {
    if (y > 690) {
      addFooter(doc);
      doc.addPage();
      y = 58;
    }
    doc
      .fillColor(NAVY)
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(dimension.label, 52, y);
    doc
      .fillColor(GOLD)
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(`${dimension.score} / 100`, 450, y, { width: 93, align: "right" });
    y += 18;
    y = writeText(doc, dimension.readout, 52, y, 491, 9.3, MUTED, 3) + 4;
    y = writeBullets(doc, dimension.developmentActions, y, 9.1, NAVY) + 10;
  }
  if (y > 640) {
    addFooter(doc);
    doc.addPage();
    y = 58;
  }
  doc
    .fillColor(GOLD)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(copy.explorationPlan.toUpperCase(), 52, y, { characterSpacing: 1.2 });
  y += 21;
  y = writeBullets(doc, input.report.recommendations, y, 9.6, NAVY) + 16;
  doc
    .fillColor(GOLD)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(copy.importantContext.toUpperCase(), 52, y, {
      characterSpacing: 1.2,
    });
  y += 20;
  writeText(doc, input.report.disclaimer, 52, y, 491, 8.8, MUTED, 3);
  doc
    .fillColor(GOLD)
    .font("Helvetica-Bold")
    .fontSize(8.5)
    .text(copy.verifyCredential.toUpperCase(), 52, 700, {
      characterSpacing: 1.1,
    });
  doc
    .fillColor(NAVY)
    .font("Helvetica")
    .fontSize(8.5)
    .text(input.verificationUrl, 52, 716, {
      width: 491,
      link: input.verificationUrl,
      underline: true,
    });
  addFooter(doc);
  doc.end();
  return finished;
}

export type PsychometricAnalyticsPdfInput = {
  fromDate?: string;
  toDate?: string;
  analytics: {
    totals: {
      started: number;
      paid: number;
      pending: number;
      sent: number;
      sending: number;
      failed: number;
      conversionRate: number;
      emailRate: number;
    };
    byProfile: Array<{
      testSlug: string;
      started: number;
      paid: number;
      sent: number;
      pending: number;
      conversionRate: number;
      emailRate: number;
    }>;
    trend: Array<{ date: string; started: number; paid: number; sent: number }>;
  };
};

export async function renderPsychometricAnalyticsPdf(
  input: PsychometricAnalyticsPdfInput
): Promise<Buffer> {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 52, right: 52, bottom: 52, left: 52 },
    info: {
      Title: "Profound IQ Psychometric Analytics",
      Author: "Profound IQ Consulting",
    },
  });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
  const brandLogo = await loadBrandLogo();
  doc.fillColor(NAVY).rect(0, 0, doc.page.width, 92).fill();
  if (brandLogo) {
    try {
      doc.image(brandLogo, 52, 10, { fit: [116, 72], valign: "center" });
    } catch {
      /* Text lockup remains available. */
    }
  }
  doc
    .fillColor("#f7f3e8")
    .font("Helvetica-Bold")
    .fontSize(15)
    .text("PSYCHOMETRIC SUITE", brandLogo ? 190 : 52, 30);
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#d7deea")
    .text(
      "Conversion and report-delivery observatory",
      brandLogo ? 190 : 52,
      54
    );
  doc.y = 122;
  doc
    .fillColor(NAVY)
    .font("Helvetica-Bold")
    .fontSize(22)
    .text("Analytics summary");
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(MUTED)
    .text(
      `Period: ${input.fromDate ?? "All time"} to ${input.toDate ?? "Present"}`
    );
  doc.moveDown(1);
  const metrics = [
    ["Starts", input.analytics.totals.started],
    ["Paid", input.analytics.totals.paid],
    ["Conversion", `${input.analytics.totals.conversionRate}%`],
    ["Reports sent", input.analytics.totals.sent],
    ["Email rate", `${input.analytics.totals.emailRate}%`],
    ["Failures", input.analytics.totals.failed],
  ];
  metrics.forEach(([label, value], index) => {
    const x = 52 + (index % 3) * 170;
    const y = 180 + Math.floor(index / 3) * 58;
    doc.fillColor("#f7f3e8").roundedRect(x, y, 150, 42, 5).fill();
    doc
      .fillColor(MUTED)
      .fontSize(8)
      .text(String(label).toUpperCase(), x + 10, y + 8);
    doc
      .fillColor(NAVY)
      .font("Helvetica-Bold")
      .fontSize(15)
      .text(String(value), x + 10, y + 21);
  });
  doc.y = 310;
  doc
    .fillColor(NAVY)
    .font("Helvetica-Bold")
    .fontSize(13)
    .text("Profile performance");
  doc.moveDown(0.5);
  input.analytics.byProfile.forEach(profile => {
    doc
      .fillColor(NAVY)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text(profile.testSlug);
    doc
      .fillColor(MUTED)
      .font("Helvetica")
      .fontSize(8)
      .text(
        `${profile.started} starts · ${profile.paid} paid · ${profile.conversionRate}% conversion · ${profile.emailRate}% emailed`,
        { indent: 10 }
      );
    doc.moveDown(0.4);
  });
  doc.moveDown(1);
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(13).text("Recent trend");
  doc.moveDown(0.5);
  input.analytics.trend.slice(-14).forEach(point => {
    doc
      .fillColor(MUTED)
      .font("Helvetica")
      .fontSize(8)
      .text(
        `${point.date}   ${point.started} starts   ${point.paid} paid   ${point.sent} sent`
      );
  });
  doc.moveDown(2);
  doc
    .fillColor(MUTED)
    .fontSize(8)
    .text(
      "Operational analytics only. This report contains aggregate counts and does not expose learner responses or report payloads."
    );
  doc.end();
  return finished;
}

export async function renderCourseShareAnalyticsPdf(input: {
  total: number;
  byCourse: Array<{ courseSlug: string; shares: number }>;
  byPlatform: Array<{ platform: string; shares: number }>;
  matrix: Array<{ courseSlug: string; platform: string; shares: number }>;
  fromDate?: string;
  toDate?: string;
}): Promise<Buffer> {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 52, right: 52, bottom: 52, left: 52 },
    info: {
      Title: "Profound IQ Course Share Analytics",
      Author: "Profound IQ Consulting",
    },
  });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
  doc.fillColor(NAVY).rect(0, 0, doc.page.width, 88).fill();
  doc
    .fillColor("#f7f3e8")
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("PROFOUND IQ / CONSULTING", 52, 30, { characterSpacing: 1.2 });
  doc
    .fillColor(GOLD)
    .font("Helvetica")
    .fontSize(9)
    .text("SOCIAL SHARING OBSERVATORY", 52, 50, { characterSpacing: 1 });
  doc
    .fillColor(NAVY)
    .font("Helvetica-Bold")
    .fontSize(24)
    .text("Course share analytics", 52, 124);
  doc
    .fillColor(MUTED)
    .font("Helvetica")
    .fontSize(10)
    .text(
      `Period: ${input.fromDate || "All time"} — ${input.toDate || "Present"}`,
      52,
      158
    );
  doc
    .fillColor(GOLD)
    .font("Helvetica-Bold")
    .fontSize(12)
    .text(`TOTAL SHARES  ${input.total}`, 52, 200);
  doc
    .fillColor(NAVY)
    .font("Helvetica-Bold")
    .fontSize(13)
    .text("By platform", 52, 248);
  input.byPlatform.slice(0, 8).forEach((row, index) => {
    const y = 274 + index * 22;
    doc
      .fillColor(NAVY)
      .font("Helvetica")
      .fontSize(10)
      .text(row.platform, 52, y);
    doc.text(String(row.shares), 360, y, { width: 100, align: "right" });
  });
  doc
    .fillColor(NAVY)
    .font("Helvetica-Bold")
    .fontSize(13)
    .text("Top courses", 52, 474);
  input.byCourse.slice(0, 10).forEach((row, index) => {
    const y = 500 + index * 20;
    doc
      .fillColor(NAVY)
      .font("Helvetica")
      .fontSize(9.5)
      .text(row.courseSlug, 52, y, { width: 300 });
    doc.text(String(row.shares), 360, y, { width: 100, align: "right" });
  });
  doc.end();
  return finished;
}

export async function renderCourseAccessAnalyticsPdf(input: {
  totalDenied: number;
  conversion: {
    deniedUsers: number;
    convertedUsers: number;
    conversionRate: number;
  };
  trend: Array<{
    date: string;
    denied: number;
    paid: number;
    conversionRate: number;
  }>;
  fromDate?: string;
  toDate?: string;
}): Promise<Buffer> {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 52, right: 52, bottom: 52, left: 52 },
    info: {
      Title: "Profound IQ Learning Access Observatory",
      Author: "Profound IQ Consulting",
    },
  });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
  const logo = await loadBrandLogo();
  doc.fillColor(NAVY).rect(0, 0, doc.page.width, 92).fill();
  if (logo) {
    try {
      doc.image(logo, 52, 12, { fit: [116, 68] });
    } catch {}
  }
  doc
    .fillColor("#f7f3e8")
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("PROFOUND IQ / CONSULTING", logo ? 190 : 52, 34, {
      characterSpacing: 1.2,
    });
  doc
    .fillColor(NAVY)
    .font("Helvetica-Bold")
    .fontSize(23)
    .text("Learning Access Observatory", 52, 128);
  doc
    .fillColor(GOLD)
    .font("Helvetica")
    .fontSize(10)
    .text(
      `${input.fromDate ?? "All time"} — ${input.toDate ?? "Today"}`,
      52,
      164
    );
  const cards = [
    ["DENIED ATTEMPTS", input.totalDenied],
    ["DENIED LEARNERS", input.conversion.deniedUsers],
    ["CONVERTED LEARNERS", input.conversion.convertedUsers],
    ["CONVERSION RATE", `${input.conversion.conversionRate}%`],
  ];
  cards.forEach(([label, value], index) => {
    const x = 52 + (index % 2) * 250;
    const y = 205 + Math.floor(index / 2) * 82;
    doc.fillColor("#fffaf0").rect(x, y, 220, 62).fill();
    doc
      .fillColor(MUTED)
      .font("Helvetica-Bold")
      .fontSize(8)
      .text(String(label), x + 12, y + 12);
    doc
      .fillColor(NAVY)
      .font("Helvetica-Bold")
      .fontSize(20)
      .text(String(value), x + 12, y + 29);
  });
  doc
    .fillColor(NAVY)
    .font("Helvetica-Bold")
    .fontSize(13)
    .text("Daily conversion trend", 52, 390);
  doc
    .fillColor(MUTED)
    .font("Helvetica")
    .fontSize(9)
    .text("Navy = denied attempts · Gold = paid learners", 52, 409);
  const points = input.trend.slice(-30);
  const max = Math.max(
    1,
    ...points.map(point => Math.max(point.denied, point.paid))
  );
  points.forEach((point, index) => {
    const x = 54 + index * 16;
    const base = 650;
    doc
      .fillColor(NAVY)
      .rect(x, base - (point.denied / max) * 190, 6, (point.denied / max) * 190)
      .fill();
    doc
      .fillColor(GOLD)
      .rect(x + 7, base - (point.paid / max) * 190, 6, (point.paid / max) * 190)
      .fill();
  });
  doc
    .fillColor(MUTED)
    .font("Helvetica")
    .fontSize(8)
    .text(points[0]?.date ?? "", 52, 665);
  doc.text(points.at(-1)?.date ?? "", 480, 665);
  doc
    .fillColor(MUTED)
    .fontSize(8)
    .text(
      "Generated from persisted access and payment records. Internal administrative use only.",
      52,
      760
    );
  doc.end();
  return finished;
}

type CourseLessonReviewAnalyticsPdfInput = {
  totalResponses: number;
  reviewedResponses: number;
  needsReviewResponses: number;
  reviewRate: number;
  aging: {
    averageAgeHours: number;
    oldestAgeHours: number;
    under24Hours: number;
    oneToThreeDays: number;
    overThreeDays: number;
  };
  reviewerWorkload: Array<{
    reviewerName: string;
    reviewedResponses: number;
    latestReviewedAt: Date | null;
  }>;
  byCourse: Array<{
    courseSlug: string;
    totalResponses: number;
    reviewedResponses: number;
    needsReviewResponses: number;
    reviewRate: number;
  }>;
  byModule: Array<{
    courseSlug: string;
    moduleIndex: number;
    totalResponses: number;
    reviewedResponses: number;
    needsReviewResponses: number;
    reviewRate: number;
  }>;
  fromDate?: Date;
  toDate?: Date;
};

export async function renderCourseLessonReviewAnalyticsPdf(
  input: CourseLessonReviewAnalyticsPdfInput
): Promise<Buffer> {
  const doc = new PDFDocument({
    size: "A4",
    compress: false,
    margins: { top: 52, right: 52, bottom: 52, left: 52 },
    info: {
      Title: "Profound IQ Instructor Review Analytics",
      Author: "Profound IQ Consulting",
    },
  });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
  const brandLogo = await loadBrandLogo();
  doc.fillColor(NAVY).rect(0, 0, doc.page.width, 92).fill();
  if (brandLogo) {
    try {
      doc.image(brandLogo, 52, 10, { fit: [116, 72], valign: "center" });
    } catch {
      /* Text lockup remains available. */
    }
  }
  const headerX = brandLogo ? 190 : 52;
  doc
    .fillColor("#f7f3e8")
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("PROFOUND IQ / CONSULTING", headerX, 32, { characterSpacing: 1.4 });
  doc
    .fillColor(GOLD)
    .font("Helvetica")
    .fontSize(9)
    .text("INSTRUCTOR REVIEW / ANALYTICS", headerX, 52, {
      characterSpacing: 1.1,
    });
  doc
    .fillColor(NAVY)
    .font("Helvetica-Bold")
    .fontSize(23)
    .text("Instructor review analytics", 52, 128);
  doc
    .fillColor(MUTED)
    .font("Helvetica")
    .fontSize(9.5)
    .text(
      `Generated ${formatDate(new Date())}${input.fromDate || input.toDate ? ` · ${input.fromDate ? formatDate(input.fromDate) : "Start"} to ${input.toDate ? formatDate(input.toDate) : "Present"}` : ""}`,
      52,
      162
    );
  let y = 205;
  const metric = (label: string, value: string) => {
    doc
      .fillColor(GOLD)
      .font("Helvetica-Bold")
      .fontSize(8)
      .text(label.toUpperCase(), 52, y, { characterSpacing: 1 });
    doc
      .fillColor(NAVY)
      .font("Helvetica-Bold")
      .fontSize(20)
      .text(value, 52, y + 15);
    y += 56;
  };
  metric("Total responses", String(input.totalResponses));
  metric("Reviewed", String(input.reviewedResponses));
  metric("Needs review", String(input.needsReviewResponses));
  metric("Review rate", `${input.reviewRate}%`);
  doc
    .fillColor(NAVY)
    .font("Helvetica-Bold")
    .fontSize(13)
    .text("Response aging", 290, 205);
  doc
    .fillColor(MUTED)
    .font("Helvetica")
    .fontSize(10)
    .text(
      `Average open response age: ${input.aging.averageAgeHours} hours`,
      290,
      230
    );
  doc.text(
    `Oldest open response: ${input.aging.oldestAgeHours} hours`,
    290,
    248
  );
  doc.text(`Under 24 hours: ${input.aging.under24Hours}`, 290, 266);
  doc.text(`1–3 days: ${input.aging.oneToThreeDays}`, 290, 284);
  doc.text(`Over 3 days: ${input.aging.overThreeDays}`, 290, 302);
  y = 360;
  const section = (title: string) => {
    if (y > 730) {
      doc.addPage();
      y = 55;
    }
    doc
      .fillColor(GOLD)
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(title.toUpperCase(), 52, y, { characterSpacing: 1.2 });
    y += 20;
  };
  section("Reviewer workload");
  doc
    .fillColor(NAVY)
    .font("Helvetica-Bold")
    .fontSize(9)
    .text("Reviewer", 52, y);
  doc.text("Reviewed", 330, y);
  doc.text("Latest", 420, y);
  y += 16;
  for (const row of input.reviewerWorkload.slice(0, 15)) {
    if (y > 760) {
      doc.addPage();
      y = 55;
    }
    doc
      .fillColor(MUTED)
      .font("Helvetica")
      .fontSize(9)
      .text(row.reviewerName, 52, y, { width: 250 });
    doc.text(String(row.reviewedResponses), 330, y);
    doc.text(
      row.latestReviewedAt ? formatDate(row.latestReviewedAt) : "—",
      420,
      y
    );
    y += 15;
  }
  y += 18;
  section("Course summary");
  for (const row of input.byCourse.slice(0, 15)) {
    if (y > 760) {
      doc.addPage();
      y = 55;
    }
    doc
      .fillColor(NAVY)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text(row.courseSlug, 52, y, { width: 260 });
    doc
      .fillColor(MUTED)
      .font("Helvetica")
      .fontSize(9)
      .text(
        `${row.reviewedResponses}/${row.totalResponses} reviewed · ${row.reviewRate}%`,
        330,
        y
      );
    y += 15;
  }
  y += 18;
  section("Module summary");
  for (const row of input.byModule.slice(0, 30)) {
    if (y > 760) {
      doc.addPage();
      y = 55;
    }
    doc
      .fillColor(MUTED)
      .font("Helvetica")
      .fontSize(9)
      .text(`${row.courseSlug} · Module ${row.moduleIndex + 1}`, 52, y, {
        width: 260,
      });
    doc.text(
      `${row.reviewedResponses}/${row.totalResponses} reviewed · ${row.reviewRate}%`,
      330,
      y
    );
    y += 15;
  }
  doc.end();
  return finished;
}

/* PDF contract: "layout?: \"summary\" | \"detailed\"" "input.layout !== \"summary\"" "labels.savedPathways" "labels.outcomes" "Page ${pageNumber}" "watermark?: boolean" "pageSize?: \"A4\" | \"LETTER\"" "coverPage?: boolean" "input.coverPage && input.layout === \"detailed\"" */

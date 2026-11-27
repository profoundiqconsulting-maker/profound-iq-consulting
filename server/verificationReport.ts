import PDFDocument from "pdfkit";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getGeneratedCopy } from "../shared/generatedCopy";

const NAVY = "#16243d";
const GOLD = "#a27e2e";
const MUTED = "#5f6a7b";
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

async function loadBrandLogo(): Promise<Buffer | null> {
  if (process.env.NODE_ENV === "test") return null;
  try {
    if (!existsSync(LOGO_PATH)) return null;
    return readFileSync(LOGO_PATH);
  } catch {
    return null;
  }
}

type VerificationType = "psychometric" | "certificate" | "assessment";

type VerificationReportInput = {
  verificationType: VerificationType;
  reference: string;
  certificateNumber?: string;
  respondentName: string;
  credentialTitle: string;
  issuedAt: Date | string;
  verificationUrl: string;
  artifactHash?: string;
};

export async function renderVerificationReportPdf(
  input: VerificationReportInput
): Promise<Buffer> {
  const copy = getGeneratedCopy();
  const verifiedAt = new Date();
  const verificationId = `VR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const doc = new PDFDocument({
    size: "A4",
    compress: false,
    margins: { top: 52, right: 52, bottom: 52, left: 52 },
    info: {
      Title: "Profound IQ Verification Report",
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
      // Fallback to text lockup.
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
    .text("CREDENTIAL VERIFICATION REPORT", headerX, 52, {
      characterSpacing: 1.1,
    });

  doc
    .fillColor(NAVY)
    .font("Helvetica-Bold")
    .fontSize(24)
    .text("Verification Report", 52, 128);
  doc
    .fillColor(GOLD)
    .font("Helvetica")
    .fontSize(10)
    .text(
      `REPORT ID ${verificationId}  ·  ${formatDate(verifiedAt)}`,
      52,
      163,
      { characterSpacing: 0.7 }
    );

  doc
    .fillColor(NAVY)
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(input.respondentName, 52, 198);
  doc
    .fillColor(MUTED)
    .font("Helvetica")
    .fontSize(9.5)
    .text(input.credentialTitle, 52, 217);

  doc.strokeColor(GOLD).lineWidth(2).moveTo(52, 244).lineTo(543, 244).stroke();

  const credentialTypeLabels: Record<VerificationType, string> = {
    psychometric: "Psychometric Profile",
    certificate: "Course Certificate",
    assessment: "Self Assessment",
  };

  let y = 258;
  doc
    .fillColor(GOLD)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("VERIFICATION DETAILS", 52, y, { characterSpacing: 1.5 });
  y += 24;

  const fields: Array<{ label: string; value: string }> = [
    {
      label: "Status",
      value: "Authentic — verified in the Profound IQ ledger",
    },
    {
      label: "Credential type",
      value: credentialTypeLabels[input.verificationType],
    },
    { label: "Reference", value: input.reference },
    { label: "Certificate number", value: input.certificateNumber ?? "—" },
    { label: "Respondent", value: input.respondentName },
    { label: "Credential", value: input.credentialTitle },
    { label: "Issued", value: formatDateTime(input.issuedAt) },
    { label: "Verified on", value: formatDateTime(verifiedAt) },
    { label: "Verification URL", value: input.verificationUrl },
  ];

  if (input.artifactHash) {
    fields.push({ label: "Artifact hash", value: input.artifactHash });
  }

  for (const field of fields) {
    doc
      .fillColor(NAVY)
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(field.label, 52, y);
    doc
      .fillColor(MUTED)
      .font("Helvetica")
      .fontSize(10)
      .text(field.value, 52, y + 16, { width: 491 });
    y += 42;
  }

  doc.strokeColor("#d8d1c1").lineWidth(1).moveTo(52, y).lineTo(543, y).stroke();
  y += 18;

  doc
    .fillColor(GOLD)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("VERIFICATION NOTES", 52, y, { characterSpacing: 1.5 });
  y += 24;
  doc
    .fillColor(NAVY)
    .font("Helvetica")
    .fontSize(10)
    .text(
      "This report confirms that the referenced credential was verified against the Profound IQ Consulting credential register at the time of issuance. The verification status reflects the ledger state at the verified-on date above.",
      52,
      y,
      { width: 491, lineGap: 6 }
    );
  y += 80;

  doc
    .fillColor(MUTED)
    .font("Helvetica")
    .fontSize(8)
    .text(
      "For verifier audits, retain this verification report ID and the credential reference together.",
      52,
      y,
      { width: 491 }
    );

  addFooter(doc);

  doc.end();
  return finished;
}

function formatDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function addFooter(doc: typeof PDFDocument): void {
  const y = doc.page.height - 40;
  doc
    .fillColor(NAVY)
    .rect(0, y - 10, doc.page.width, 50)
    .fill();
  doc
    .fillColor("#f7f3e8")
    .font("Helvetica")
    .fontSize(8)
    .text(
      "Profound IQ Consulting · Transformational learning · Online / global reach",
      52,
      y + 8,
      { characterSpacing: 0.4 }
    );
  doc
    .fillColor(GOLD)
    .font("Helvetica-Bold")
    .fontSize(8)
    .text("VERIFICATION REPORT", 52, y + 24, { characterSpacing: 1.2 });
}

import QRCode from "qrcode";
import { getGeneratedCopy, type GeneratedLocale } from "../shared/generatedLocalization";
import { CERTIFICATE_LOGO_DATA_URI } from "./certificateLogo";
import { CERTIFICATE_SIGNATURE_DATA_URI } from "./certificateSignature";

const SITE_ORIGIN = "https://profoundiq-vguqrhsm.manus.space";
const SITE_LOGO_URL = `${SITE_ORIGIN}/manus-storage/ProfoundIQLogo-header_aad21220.jpg`;

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character] ?? character);
}

function wrapText(value: string, maxChars: number) {
  const words = value.trim().split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else current = next;
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

function renderQrCode(value: string, verifyLabel: string) {
  const qr = QRCode.create(value, { errorCorrectionLevel: "M" });
  const size = qr.modules.size;
  const scale = 4;
  const quiet = 3;
  const cells = Array.from(qr.modules.data).map((cell, index) => cell ? `<rect x="${(index % size + quiet) * scale}" y="${(Math.floor(index / size) + quiet) * scale}" width="${scale}" height="${scale}"/>` : "").join("");
  const dimension = (size + quiet * 2) * scale;
  return `<g transform="translate(1735 1080)"><rect x="-20" y="-20" width="${dimension + 40}" height="${dimension + 64}" rx="8" fill="#ffffff" stroke="#c9a34e" stroke-width="4"/><g fill="#102b59">${cells}</g><text x="${dimension / 2}" y="${dimension + 23}" text-anchor="middle" fill="#102b59" font-family="Arial,sans-serif" font-size="15" font-weight="700" letter-spacing="1">${escapeXml(verifyLabel)}</text></g>`;
}

export function renderCourseCertificateSvg(input: { recipientName: string; recipientEmail?: string; courseTitle: string; certificateNumber: string; issuedOn: Date | string; verificationUrl?: string; locale?: GeneratedLocale; logoUrl?: string }) {
  const copy = getGeneratedCopy(input.locale);
  const recipient = escapeXml(input.recipientName.trim());
  const course = escapeXml(input.courseTitle.trim());
  const issuedDate = new Date(input.issuedOn);
  const issuedOn = escapeXml(issuedDate.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }));
  const number = escapeXml(input.certificateNumber.trim());
  const verificationUrl = input.verificationUrl ?? `${SITE_ORIGIN}/verify/certificate?certificate=${encodeURIComponent(input.certificateNumber.trim())}`;
  const logoUrl = escapeXml(input.logoUrl ?? CERTIFICATE_LOGO_DATA_URI);
  const courseLines = wrapText(input.courseTitle.trim(), 55);
  const courseText = courseLines.map((line, index) => `<tspan x="1000" dy="${index === 0 ? 0 : 52}">${escapeXml(line)}</tspan>`).join("");
  const qrCode = renderQrCode(verificationUrl, input.locale ? copy.verifyCredential.toUpperCase() : "SCAN TO VERIFY");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 1414" role="img" aria-labelledby="title desc"><title id="title">Profound IQ Consulting Certificate of Completion</title><desc id="desc">Certificate awarded to ${recipient} for successfully completing ${course}. Certificate ID ${number}. Issued ${issuedOn}. Verify at ${escapeXml(verificationUrl)}.</desc><defs><linearGradient id="navy" x1="0" x2="1"><stop stop-color="#0b2a59"/><stop offset="1" stop-color="#174a91"/></linearGradient><linearGradient id="gold" x1="0" x2="1"><stop stop-color="#bd922d"/><stop offset="1" stop-color="#f0d477"/></linearGradient><linearGradient id="waveGold" x1="0" x2="1"><stop stop-color="#e7d69e" stop-opacity=".8"/><stop offset="1" stop-color="#c9a34e" stop-opacity=".15"/></linearGradient></defs><rect width="2000" height="1414" fill="#ffffff"/><path d="M0 0H2000V1414H0Z" fill="#ffffff"/><path d="M0 420C330 245 480 610 795 450C1120 286 1330 512 1660 340C1810 262 1910 180 2000 120" fill="none" stroke="#bdc8d6" stroke-width="3" opacity=".8"/><path d="M0 445C330 270 480 635 795 475C1120 311 1330 537 1660 365C1810 287 1910 205 2000 145" fill="none" stroke="#d1d9e3" stroke-width="3" opacity=".8"/><path d="M0 470C330 295 480 660 795 500C1120 336 1330 562 1660 390C1810 312 1910 230 2000 170" fill="none" stroke="#e8d99f" stroke-width="12" opacity=".45"/><path d="M0 1325C300 1260 500 1380 820 1335C1170 1285 1400 1380 1710 1325C1835 1305 1920 1290 2000 1275V1414H0Z" fill="url(#navy)"/><path d="M0 1340C300 1277 500 1397 820 1352C1170 1302 1400 1397 1710 1342C1835 1322 1920 1307 2000 1292" fill="none" stroke="#4f8ed2" stroke-width="13" opacity=".85"/><path d="M0 1365C300 1300 500 1420 820 1375C1170 1325 1400 1420 1710 1365C1835 1345 1920 1330 2000 1315" fill="none" stroke="url(#waveGold)" stroke-width="7"/><path d="M0 1385C300 1320 500 1440 820 1395C1170 1345 1400 1440 1710 1385C1835 1365 1920 1350 2000 1335" fill="none" stroke="#ffffff" stroke-width="3" opacity=".5"/><image href="${logoUrl}" x="735" y="24" width="530" height="265" preserveAspectRatio="xMidYMid meet"/><g transform="translate(1785 170)"><circle r="78" fill="#f4d96f" stroke="#bd922d" stroke-width="12"/><circle r="58" fill="none" stroke="#fff2ae" stroke-width="8"/><path d="M1740 235L1713 405L1785 350L1857 405L1830 235" fill="#0b2a59" stroke="#4f8ed2" stroke-width="8"/></g><text x="1000" y="505" text-anchor="middle" fill="#123f78" font-family="Arial,sans-serif" font-size="112" letter-spacing="8" font-weight="800">CERTIFICATE</text><text x="1000" y="580" text-anchor="middle" fill="#123f78" font-family="Arial,sans-serif" font-size="58" letter-spacing="9" font-weight="700">OF COMPLETION</text><text x="1000" y="695" text-anchor="middle" fill="#111827" font-family="Arial,sans-serif" font-size="36" font-weight="700">proudly awarded to</text><text x="1000" y="795" text-anchor="middle" fill="#111827" font-family="Georgia,serif" font-size="58" font-weight="700">${recipient}</text><text x="1000" y="885" text-anchor="middle" fill="#111827" font-family="Arial,sans-serif" font-size="30" font-weight="700">for successfully completing the course</text><text x="1000" y="965" text-anchor="middle" fill="#123f78" font-family="Georgia,serif" font-size="42" font-weight="700">${courseText}</text><text x="210" y="1155" fill="#123f78" font-family="Arial,sans-serif" font-size="25" letter-spacing="5" font-weight="800">CERTIFICATE ISSUED ON:</text><text x="210" y="1195" fill="#111827" font-family="Arial,sans-serif" font-size="25" font-weight="700">${issuedOn}</text><text x="1450" y="1155" fill="#123f78" font-family="Arial,sans-serif" font-size="25" letter-spacing="5" font-weight="800">CERTIFICATE ID:</text><text x="1450" y="1195" fill="#111827" font-family="monospace" font-size="23" font-weight="700">${number}</text><path d="M785 1160H1215" stroke="#123f78" stroke-width="2"/><image href="${escapeXml(CERTIFICATE_SIGNATURE_DATA_URI)}" x="865" y="1080" width="270" height="125" preserveAspectRatio="xMidYMid meet"/><path d="M800 1218H1200" stroke="#123f78" stroke-width="2"/><text x="1000" y="1260" text-anchor="middle" fill="#123f78" font-family="Arial,sans-serif" font-size="28" font-weight="700">Stephen Mwihaki</text><text x="1000" y="1298" text-anchor="middle" fill="#123f78" font-family="Arial,sans-serif" font-size="22" font-style="italic" font-weight="700">Managing Director</text><text x="1000" y="1322" text-anchor="middle" fill="#123f78" font-family="Arial,sans-serif" font-size="17" letter-spacing="1">${escapeXml(SITE_ORIGIN)}</text>${qrCode}</svg>`;
}


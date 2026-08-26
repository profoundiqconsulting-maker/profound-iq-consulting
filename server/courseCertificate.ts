import QRCode from "qrcode";
import { getGeneratedCopy, type GeneratedLocale } from "../shared/generatedLocalization";

function escapeXml(value: string) {
  return value.replace(/[&<>\"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&apos;" })[character] ?? character);
}

function renderQrCode(value: string, verifyLabel: string) {
  const qr = QRCode.create(value, { errorCorrectionLevel: "M" });
  const size = qr.modules.size;
  const scale = 6;
  const quiet = 4;
  const cells = Array.from(qr.modules.data)
    .map((cell, index) => cell ? `<rect x="${(index % size + quiet) * scale}" y="${(Math.floor(index / size) + quiet) * scale}" width="${scale}" height="${scale}"/>` : "")
    .join("");
  const dimension = (size + quiet * 2) * scale;
  return `<g transform="translate(1615 1015)"><rect x="-18" y="-18" width="${dimension + 36}" height="${dimension + 78}" rx="8" fill="#fbfaf6" stroke="#b88928" stroke-width="5"/><g fill="#0b1b3d">${cells}</g><text x="${dimension / 2}" y="${dimension + 28}" text-anchor="middle" fill="#0b1b3d" font-family="Arial,sans-serif" font-size="16" font-weight="700">${escapeXml(verifyLabel)}</text></g>`;
}

export function renderCourseCertificateSvg(input: { recipientName: string; recipientEmail?: string; courseTitle: string; certificateNumber: string; issuedOn: Date | string; verificationUrl?: string; locale?: GeneratedLocale }) {
  const copy = getGeneratedCopy(input.locale);
  const recipient = escapeXml(input.recipientName);
  const email = input.recipientEmail ? escapeXml(input.recipientEmail) : "";
  const course = escapeXml(input.courseTitle);
  const issuedOn = escapeXml(new Date(input.issuedOn).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }));
  const number = escapeXml(input.certificateNumber);
  const verificationUrl = input.verificationUrl ?? `https://profoundiq-vguqrhsm.manus.space/verify/certificate?certificate=${encodeURIComponent(input.certificateNumber)}`;
  const qrCode = renderQrCode(verificationUrl, input.locale ? copy.verifyCredential.toUpperCase() : "SCAN TO VERIFY");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 1414" role="img" aria-labelledby="title desc"><title id="title">Profound IQ Consulting Certificate of Completion</title><desc id="desc">Certificate awarded to ${recipient} for completing ${course}. Verify credential ${number} online.</desc><defs><linearGradient id="navy" x1="0" x2="1"><stop stop-color="#0b1b3d"/><stop offset="1" stop-color="#183d75"/></linearGradient><linearGradient id="gold" x1="0" x2="1"><stop stop-color="#b88928"/><stop offset="1" stop-color="#f3cf67"/></linearGradient></defs><rect width="2000" height="1414" fill="#fbfaf6"/><path d="M0 0H2000V110H0Z" fill="url(#navy)"/><path d="M0 1180C340 1050 520 1390 920 1260C1330 1125 1600 1300 2000 1160V1414H0Z" fill="url(#navy)"/><path d="M0 1190C340 1060 520 1400 920 1270C1330 1135 1600 1310 2000 1170" fill="none" stroke="#79a7e5" stroke-width="12" opacity=".8"/><path d="M0 1215C340 1085 520 1425 920 1295C1330 1160 1600 1335 2000 1195" fill="none" stroke="#c9a34e" stroke-width="5" opacity=".9"/><g transform="translate(1000 190)"><circle r="72" fill="url(#navy)" stroke="url(#gold)" stroke-width="8"/><path d="M-34 28V-30L0-52L34-30V28L0 51Z" fill="none" stroke="#f7f3e8" stroke-width="5"/><text x="0" y="13" text-anchor="middle" fill="#f7f3e8" font-family="Georgia,serif" font-size="36" font-weight="700">PIQ</text></g><text x="1000" y="330" text-anchor="middle" fill="#0b1b3d" font-family="Georgia,serif" font-size="54" letter-spacing="8" font-weight="700">PROFOUND IQ</text><text x="1000" y="380" text-anchor="middle" fill="#b88928" font-family="Arial,sans-serif" font-size="22" letter-spacing="9">CONSULTING · DISCOVER | GROW | ACTUALIZE</text><circle cx="1780" cy="210" r="78" fill="#f2ca53" stroke="#b88928" stroke-width="10"/><path d="M1740 275L1715 405L1780 355L1845 405L1820 275" fill="#0b1b3d" stroke="#79a7e5" stroke-width="8"/><text x="1000" y="535" text-anchor="middle" fill="#1254a1" font-family="Arial,sans-serif" font-size="104" letter-spacing="7" font-weight="800">${escapeXml(copy.certificateOfCompletion.split(" ")[0])}</text><text x="1000" y="610" text-anchor="middle" fill="#1254a1" font-family="Arial,sans-serif" font-size="56" letter-spacing="8" font-weight="700">${escapeXml(copy.certificateOfCompletion.split(" ").slice(1).join(" "))}</text><text x="1000" y="745" text-anchor="middle" fill="#111827" font-family="Arial,sans-serif" font-size="34" font-weight="700">${escapeXml(copy.certificateOfCompletion)} · ${escapeXml(copy.learner)}</text><text x="1000" y="875" text-anchor="middle" fill="#0b1b3d" font-family="Georgia,serif" font-size="62" font-weight="700">${recipient}</text>${email ? `<text x="1000" y="925" text-anchor="middle" fill="#5f6a7b" font-family="Arial,sans-serif" font-size="24">${email}</text>` : ""}<path d="M550 945H1450" stroke="#b88928" stroke-width="3"/><text x="1000" y="1005" text-anchor="middle" fill="#111827" font-family="Arial,sans-serif" font-size="27">${escapeXml(copy.congratulations)} · ${escapeXml(copy.course)}</text><text x="1000" y="1085" text-anchor="middle" fill="#0b1b3d" font-family="Georgia,serif" font-size="42" font-weight="700">${course}</text>${qrCode}<text x="1500" y="1260" text-anchor="middle" fill="#f7f3e8" font-family="Arial,sans-serif" font-size="23" font-weight="700">${escapeXml(copy.issued)} ${issuedOn} · ${escapeXml(copy.credential)} ${number}</text><text x="1500" y="1300" text-anchor="middle" fill="#c1cad7" font-family="Arial,sans-serif" font-size="14">${escapeXml(verificationUrl)}</text><text x="900" y="1258" text-anchor="middle" fill="#f7f3e8" font-family="Arial,sans-serif" font-size="24" font-weight="700">Stephen Mwihaki · Managing Director</text></svg>`;
}

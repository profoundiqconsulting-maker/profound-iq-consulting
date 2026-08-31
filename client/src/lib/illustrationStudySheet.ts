import { PUBLISHED_SITE_ORIGIN } from "@shared/siteOrigin";

export type IllustrationStudySheetInput = {
  imageUrl: string;
  courseTitle: string;
  lessonTitle: string;
  modeLabel: string;
  content: string;
  filename: string;
};

const escapeXml = (value: string) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character] ?? character);

export function buildIllustrationStudySheetSvg(input: IllustrationStudySheetInput) {
  const baseUrl = PUBLISHED_SITE_ORIGIN;
  const safeImageUrl = escapeXml(new URL(input.imageUrl, baseUrl).toString());
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1200 820" role="img" aria-labelledby="title description"><title id="title">${escapeXml(input.lessonTitle)}</title><desc id="description">${escapeXml(input.content)}</desc><rect width="1200" height="820" fill="#f7f3e8"/><rect x="48" y="48" width="1104" height="724" fill="#16243d"/><path d="M48 48h1104v12H48z" fill="#c9a34e"/><text x="88" y="112" fill="#d7b762" font-family="Arial, sans-serif" font-size="18" font-weight="700" letter-spacing="4">PROFOUND IQ CONSULTING · ${escapeXml(input.modeLabel).toUpperCase()}</text><text x="88" y="164" fill="#f7f3e8" font-family="Georgia, serif" font-size="38" font-weight="700">${escapeXml(input.courseTitle)}</text><text x="88" y="210" fill="#f7f3e8" font-family="Georgia, serif" font-size="30">${escapeXml(input.lessonTitle)}</text><image href="${safeImageUrl}" x="88" y="246" width="500" height="350" preserveAspectRatio="xMidYMid slice"/><rect x="620" y="246" width="444" height="350" fill="#243654"/><text x="660" y="300" fill="#d7b762" font-family="Arial, sans-serif" font-size="16" font-weight="700" letter-spacing="3">STUDY NOTE</text><foreignObject x="660" y="332" width="360" height="220"><div xmlns="http://www.w3.org/1999/xhtml" style="color:#f7f3e8;font:22px/1.55 Arial,sans-serif;">${escapeXml(input.content)}</div></foreignObject><line x1="88" y1="656" x2="1064" y2="656" stroke="#c9a34e" stroke-width="2"/><text x="88" y="708" fill="#b9c4d3" font-family="Arial, sans-serif" font-size="16">A visual study sheet for reflection, discussion, and practical transfer.</text><text x="88" y="742" fill="#b9c4d3" font-family="Arial, sans-serif" font-size="14">${baseUrl.replace(/^https?:\/\//, "")}</text></svg>`;
}

export function downloadIllustrationStudySheet(input: IllustrationStudySheetInput) {
  const svg = buildIllustrationStudySheetSvg(input);
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = input.filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const studySheetPngFilename = (filename: string) => filename.replace(/\.svg$/i, ".png");

const wrapCanvasText = (context: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (context.measureText(next).width > maxWidth && line) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line);
  return lines;
};

export async function downloadIllustrationStudySheetPng(input: IllustrationStudySheetInput) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 820;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("PNG export is not supported in this browser.");
  context.fillStyle = "#f7f3e8";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#16243d";
  context.fillRect(48, 48, 1104, 724);
  context.fillStyle = "#c9a34e";
  context.fillRect(48, 48, 1104, 12);
  context.fillStyle = "#d7b762";
  context.font = "700 18px Arial, sans-serif";
  context.fillText(`PROFOUND IQ CONSULTING · ${input.modeLabel.toUpperCase()}`, 88, 112);
  context.fillStyle = "#f7f3e8";
  context.font = "700 38px Georgia, serif";
  context.fillText(input.courseTitle.slice(0, 42), 88, 164);
  context.font = "30px Georgia, serif";
  context.fillText(input.lessonTitle.slice(0, 52), 88, 210);
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = new URL(input.imageUrl, PUBLISHED_SITE_ORIGIN).toString();
  await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("The artwork could not be loaded for PNG export.")); });
  const scale = Math.max(500 / image.naturalWidth, 350 / image.naturalHeight);
  const sourceWidth = 500 / scale;
  const sourceHeight = 350 / scale;
  const sourceX = (image.naturalWidth - sourceWidth) / 2;
  const sourceY = (image.naturalHeight - sourceHeight) / 2;
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 88, 246, 500, 350);
  context.fillStyle = "#243654";
  context.fillRect(620, 246, 444, 350);
  context.fillStyle = "#d7b762";
  context.font = "700 16px Arial, sans-serif";
  context.fillText("STUDY NOTE", 660, 300);
  context.fillStyle = "#f7f3e8";
  context.font = "22px Arial, sans-serif";
  const noteLines = wrapCanvasText(context, input.content, 360).slice(0, 7);
  for (let index = 0; index < noteLines.length; index += 1) context.fillText(noteLines[index], 660, 342 + index * 34);
  context.strokeStyle = "#c9a34e";
  context.lineWidth = 2;
  context.beginPath(); context.moveTo(88, 656); context.lineTo(1064, 656); context.stroke();
  context.fillStyle = "#b9c4d3";
  context.font = "16px Arial, sans-serif";
  context.fillText("A visual study sheet for reflection, discussion, and practical transfer.", 88, 708);
  context.font = "14px Arial, sans-serif";
  context.fillText(PUBLISHED_SITE_ORIGIN.replace(/^https?:\/\//, ""), 88, 742);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("PNG export could not be created.");
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = studySheetPngFilename(input.filename);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

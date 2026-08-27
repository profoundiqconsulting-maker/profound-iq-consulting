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
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://profoundiqconsulting.com";
  const safeImageUrl = escapeXml(new URL(input.imageUrl, baseUrl).toString());
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1200 820" role="img" aria-labelledby="title description"><title id="title">${escapeXml(input.lessonTitle)}</title><desc id="description">${escapeXml(input.content)}</desc><rect width="1200" height="820" fill="#f7f3e8"/><rect x="48" y="48" width="1104" height="724" fill="#16243d"/><path d="M48 48h1104v12H48z" fill="#c9a34e"/><text x="88" y="112" fill="#d7b762" font-family="Arial, sans-serif" font-size="18" font-weight="700" letter-spacing="4">PROFOUND IQ CONSULTING · ${escapeXml(input.modeLabel).toUpperCase()}</text><text x="88" y="164" fill="#f7f3e8" font-family="Georgia, serif" font-size="38" font-weight="700">${escapeXml(input.courseTitle)}</text><text x="88" y="210" fill="#f7f3e8" font-family="Georgia, serif" font-size="30">${escapeXml(input.lessonTitle)}</text><image href="${safeImageUrl}" x="88" y="246" width="500" height="350" preserveAspectRatio="xMidYMid slice"/><rect x="620" y="246" width="444" height="350" fill="#243654"/><text x="660" y="300" fill="#d7b762" font-family="Arial, sans-serif" font-size="16" font-weight="700" letter-spacing="3">STUDY NOTE</text><foreignObject x="660" y="332" width="360" height="220"><div xmlns="http://www.w3.org/1999/xhtml" style="color:#f7f3e8;font:22px/1.55 Arial,sans-serif;">${escapeXml(input.content)}</div></foreignObject><line x1="88" y1="656" x2="1064" y2="656" stroke="#c9a34e" stroke-width="2"/><text x="88" y="708" fill="#b9c4d3" font-family="Arial, sans-serif" font-size="16">A visual study sheet for reflection, discussion, and practical transfer.</text><text x="88" y="742" fill="#b9c4d3" font-family="Arial, sans-serif" font-size="14">profoundiqconsulting.com</text></svg>`;
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

export type SubPathwayVisualRow = {
  label: string;
  score: number;
};

export type SubPathwayVisualInput = {
  title?: string;
  subtitle?: string;
  rows: SubPathwayVisualRow[];
  generatedAt?: string;
};

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  })[character] ?? character);
}

export function buildSubPathwayComparisonSvg(input: SubPathwayVisualInput): string {
  const width = 1200;
  const rowHeight = 78;
  const top = 210;
  const height = Math.max(560, top + input.rows.length * rowHeight + 90);
  const title = escapeXml(input.title ?? "CareerPath sub-pathway comparison");
  const subtitle = escapeXml(input.subtitle ?? "Profound IQ Consulting · learner coaching visual");
  const generatedAt = input.generatedAt ? escapeXml(input.generatedAt) : "";
  const rows = input.rows.map((row, index) => {
    const y = top + index * rowHeight;
    const score = Math.max(0, Math.min(100, Math.round(row.score)));
    const barWidth = Math.round(score * 7.1);
    return `<g><text x="72" y="${y}" fill="#16243d" font-family="Arial, sans-serif" font-size="24" font-weight="700">${escapeXml(row.label)}</text><rect x="370" y="${y - 25}" width="710" height="24" rx="12" fill="#e6dfd0"/><rect x="370" y="${y - 25}" width="${barWidth}" height="24" rx="12" fill="#c9a34e"/><text x="1110" y="${y - 4}" text-anchor="end" fill="#16243d" font-family="Arial, sans-serif" font-size="24" font-weight="700">${score}</text></g>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title subtitle"><rect width="100%" height="100%" fill="#f7f3e8"/><rect x="0" y="0" width="100%" height="14" fill="#c9a34e"/><text id="title" x="72" y="78" fill="#16243d" font-family="Georgia, serif" font-size="42" font-weight="700">${title}</text><text id="subtitle" x="72" y="124" fill="#657084" font-family="Arial, sans-serif" font-size="20">${subtitle}</text><line x1="72" y1="162" x2="1128" y2="162" stroke="#16243d" stroke-opacity=".18"/><text x="72" y="198" fill="#a27e2e" font-family="Arial, sans-serif" font-size="14" font-weight="700" letter-spacing="2">RELATIVE FIT SIGNAL · 0–100</text>${rows}<text x="72" y="${height - 34}" fill="#657084" font-family="Arial, sans-serif" font-size="15">Educational guidance only · not a diagnosis or fixed career prediction${generatedAt ? ` · ${generatedAt}` : ""}</text></svg>`;
}

export function svgToDownloadUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

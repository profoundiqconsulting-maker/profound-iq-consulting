import { svgToDownloadUrl } from "@shared/reportComparisonVisual";

export async function svgToPngBlob(svg: string, scale = 2): Promise<Blob> {
  const image = new Image();
  const sourceUrl = svgToDownloadUrl(svg);
  image.src = sourceUrl;
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("The coaching visual could not be prepared as a PNG."));
  });
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth * scale;
  canvas.height = image.naturalHeight * scale;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("PNG export is not supported in this browser.");
  context.scale(scale, scale);
  context.drawImage(image, 0, 0);
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("The coaching visual could not be encoded as a PNG.")), "image/png");
  });
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

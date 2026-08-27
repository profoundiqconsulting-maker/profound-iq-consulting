export async function certificatePngBlob(svg: string, scale = 2): Promise<Blob> {
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const objectUrl = URL.createObjectURL(svgBlob);
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = objectUrl;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("The certificate preview could not be rasterized."));
    });
    const canvas = document.createElement("canvas");
    canvas.width = 2000 * scale;
    canvas.height = 1414 * scale;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("PNG export is unavailable in this browser.");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const pngBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png", 1));
    if (!pngBlob) throw new Error("The certificate PNG could not be created.");
    return pngBlob;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function downloadCertificatePng(svg: string, filename: string, scale = 2) {
  const pngBlob = await certificatePngBlob(svg, scale);
  const downloadUrl = URL.createObjectURL(pngBlob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = filename.endsWith(".png") ? filename : `${filename}.png`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
}

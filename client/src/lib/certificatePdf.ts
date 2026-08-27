export function downloadCertificatePdf(base64: string, filename: string) {
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

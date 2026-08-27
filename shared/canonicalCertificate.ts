export type CanonicalCertificateArtifact = {
  certificateNumber: string;
  fileKey: string | null;
  fileUrl: string | null;
};

export function getCanonicalCertificateArtifact(input: Partial<CanonicalCertificateArtifact> | null | undefined): CanonicalCertificateArtifact | null {
  if (!input?.certificateNumber || !input.fileUrl) return null;
  return {
    certificateNumber: input.certificateNumber,
    fileKey: input.fileKey ?? null,
    fileUrl: input.fileUrl,
  };
}

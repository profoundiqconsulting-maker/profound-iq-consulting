export const CERTIFICATE_DOWNLOAD_PLATFORMS = { pdf: "pdf", png: "png" } as const;

export function buildCertificateLinkedInPost(courseTitle: string, certificateUrl: string) {
  const cleanTitle = courseTitle.trim().replace(/\s+/g, " ");
  return `I’m proud to share that I successfully completed ${cleanTitle} with Profound IQ Consulting. The experience strengthened my practical capabilities and commitment to continuous growth. View my verified certificate: ${certificateUrl} #ProfoundIQConsulting #ProfessionalDevelopment #ContinuousLearning #CareerGrowth`;
}

export function buildLinkedInShareUrl(certificateUrl: string) {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl)}`;
}

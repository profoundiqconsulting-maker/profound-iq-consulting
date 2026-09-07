export const CERTIFICATE_DOWNLOAD_PLATFORMS = {
  pdf: "pdf",
  png: "png",
} as const;
export type CertificateSharePlatform =
  | "linkedin"
  | "facebook"
  | "whatsapp"
  | "twitter";

export function buildCertificateShareUrl(
  platform: CertificateSharePlatform,
  certificateUrl: string,
  courseTitle: string,
  message?: string
) {
  const shareMessage =
    message?.trim() ||
    `I completed ${courseTitle} with Profound IQ Consulting.`;
  if (platform === "linkedin")
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl)}`;
  if (platform === "facebook")
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(certificateUrl)}&quote=${encodeURIComponent(shareMessage)}`;
  if (platform === "whatsapp")
    return `https://wa.me/?text=${encodeURIComponent(`${shareMessage} ${certificateUrl}`)}`;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(certificateUrl)}`;
}

export function buildCertificateLinkedInPost(
  courseTitle: string,
  certificateUrl: string
) {
  const cleanTitle = courseTitle.trim().replace(/\s+/g, " ");
  return `I’m proud to share that I successfully completed ${cleanTitle} with Profound IQ Consulting. The experience strengthened my practical capabilities and commitment to continuous growth. View my verified certificate: ${certificateUrl} #ProfoundIQConsulting #ProfessionalDevelopment #ContinuousLearning #CareerGrowth`;
}

export function buildLinkedInShareUrl(certificateUrl: string) {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl)}`;
}

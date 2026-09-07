import { describe, expect, it } from "vitest";
import {
  buildCertificateLinkedInPost,
  buildCertificateShareUrl,
  buildLinkedInShareUrl,
  CERTIFICATE_DOWNLOAD_PLATFORMS,
} from "./certificateSharing";

describe("certificate sharing", () => {
  it("builds course-aware LinkedIn copy with the certificate URL and hashtags", () => {
    const text = buildCertificateLinkedInPost(
      "  AI for Educators  ",
      "https://example.com/verify/PIQ-123"
    );
    expect(text).toContain("AI for Educators");
    expect(text).toContain("https://example.com/verify/PIQ-123");
    expect(text).toContain("#ProfessionalDevelopment");
    expect(text).toContain("#ContinuousLearning");
  });

  it("keeps PDF and PNG download analytics platforms explicit", () => {
    expect(CERTIFICATE_DOWNLOAD_PLATFORMS).toEqual({ pdf: "pdf", png: "png" });
  });

  it("builds direct share URLs for every supported social platform", () => {
    const url = "https://example.com/verify/PIQ-123";
    expect(
      buildCertificateShareUrl("linkedin", url, "AI for Educators")
    ).toContain(encodeURIComponent(url));
    expect(
      buildCertificateShareUrl("facebook", url, "AI for Educators")
    ).toContain(encodeURIComponent(url));
    expect(
      buildCertificateShareUrl("whatsapp", url, "AI for Educators")
    ).toContain(encodeURIComponent(url));
    expect(
      buildCertificateShareUrl("twitter", url, "AI for Educators")
    ).toContain(encodeURIComponent(url));
  });

  it("encodes the certificate URL for LinkedIn sharing", () => {
    expect(buildLinkedInShareUrl("https://example.com/verify?id=PIQ 123")).toBe(
      "https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fexample.com%2Fverify%3Fid%3DPIQ%20123"
    );
  });
});

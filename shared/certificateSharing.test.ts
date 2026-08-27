import { describe, expect, it } from "vitest";
import { buildCertificateLinkedInPost, buildLinkedInShareUrl } from "./certificateSharing";

describe("certificate sharing", () => {
  it("builds course-aware LinkedIn copy with the certificate URL and hashtags", () => {
    const text = buildCertificateLinkedInPost("  AI for Educators  ", "https://example.com/verify/PIQ-123");
    expect(text).toContain("AI for Educators");
    expect(text).toContain("https://example.com/verify/PIQ-123");
    expect(text).toContain("#ProfessionalDevelopment");
    expect(text).toContain("#ContinuousLearning");
  });

  it("encodes the certificate URL for LinkedIn sharing", () => {
    expect(buildLinkedInShareUrl("https://example.com/verify?id=PIQ 123")).toBe("https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fexample.com%2Fverify%3Fid%3DPIQ%20123");
  });
});

import { describe, expect, it, vi } from "vitest";

vi.mock("@shared/siteOrigin", () => {
  const origin = "http://localhost:3000";
  return {
    PUBLISHED_SITE_ORIGIN: origin,
    publishedSiteUrl: (path = "") => `${origin}${path.startsWith("/") || path.length === 0 ? path : `/${path}`}`,
  };
});

import { buildSitemapXml } from "../server/seoRoutes";
import { getSeo } from "../client/src/components/SeoHead";
import { CONSENT_KEY } from "../client/src/components/CookieConsent";

describe("Privacy Policy page", () => {
  it("has dedicated indexable metadata", () => {
    const seo = getSeo("/privacy-policy");
    expect(seo.title).toBe("Privacy Policy | Profound IQ Consulting");
    expect(seo.noIndex).not.toBe(true);
    expect(seo.canonical).toBe("/privacy-policy");
  });

  it("is included in the public sitemap", () => {
    const sitemap = buildSitemapXml([]);
    expect(sitemap).toContain("http://localhost:3000/privacy-policy");
    expect(sitemap).toContain("http://localhost:3000/terms-of-service");
  });

  it("has dedicated Terms of Service metadata and a stable consent key", () => {
    const seo = getSeo("/terms-of-service");
    expect(seo.title).toBe("Terms of Service | Profound IQ Consulting");
    expect(seo.noIndex).not.toBe(true);
    expect(seo.canonical).toBe("/terms-of-service");
    expect(CONSENT_KEY).toBe("profound-iq-cookie-consent");
  });
});

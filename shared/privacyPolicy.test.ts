import { describe, expect, it } from "vitest";
import { buildSitemapXml } from "../server/seoRoutes";
import { getSeo } from "../client/src/components/SeoHead";

describe("Privacy Policy page", () => {
  it("has dedicated indexable metadata", () => {
    const seo = getSeo("/privacy-policy");
    expect(seo.title).toBe("Privacy Policy | Profound IQ Consulting");
    expect(seo.noIndex).not.toBe(true);
    expect(seo.canonical).toBe("/privacy-policy");
  });

  it("is included in the public sitemap", () => {
    expect(buildSitemapXml([])).toContain("https://profoundiqconsulting.com/privacy-policy");
  });
});

import { describe, expect, it } from "vitest";
import { getSeo, SITE_ORIGIN } from "@/components/SeoHead";

describe("public page SEO contracts", () => {
  const routes = [
    ["/about", "About Profound IQ Consulting", "AboutPage"],
    ["/services", "Consulting Services", "ItemList"],
    ["/school-solutions", "School Solutions", "Service"],
    ["/resources", "Resources for Learning and Leadership", "CollectionPage"],
    ["/blog", "Education and Leadership Insights", "Blog"],
    ["/contact", "Contact Profound IQ Consulting", "ContactPage"],
  ] as const;

  it.each(routes)("defines crawlable metadata for %s", (path, titleFragment, schemaType) => {
    const seo = getSeo(path);
    expect(seo.title).toContain(titleFragment);
    expect(seo.description.length).toBeGreaterThan(80);
    expect(seo.canonical).toBe(path);
    expect(seo.noIndex).not.toBe(true);
    expect(seo.jsonLd).toMatchObject({ "@context": "https://schema.org", "@type": schemaType });
  });

  it("keeps canonical paths relative to the configured public origin", () => {
    const seo = getSeo("/services");
    expect(`${SITE_ORIGIN}${seo.canonical}`).toBe("https://profoundiq-vguqrhsm.manus.space/services");
  });
});

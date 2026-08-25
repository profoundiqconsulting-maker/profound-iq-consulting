import { describe, expect, it } from "vitest";
import { buildSitemapXml, renderCourseCatalogPage, renderCourseDetailPage } from "./seoRoutes";

describe("course SEO server routes", () => {
  it("includes every published course slug in the sitemap without duplicates", () => {
    const xml = buildSitemapXml([{ slug: "leadership-development" }, { slug: "leadership-development" }, { slug: "new-course" }]);
    expect(xml).toContain("https://profoundiqconsulting.com/courses/leadership-development");
    expect(xml).toContain("https://profoundiqconsulting.com/courses/new-course");
    expect(xml.match(/<url>/g)?.length).toBe(9);
  });

  it("renders individual course metadata and JSON-LD inside the app root", () => {
    const html = renderCourseDetailPage({ slug: "decision-lab", title: "Decision Lab", strapline: "Practice better decisions", description: "A focused professional course.", audience: "Leaders", duration: "4 weeks", priceKes: 4999, outcomes: ["Frame options"] }, null);
    expect(html).toContain("<title>Decision Lab | Profound IQ Consulting</title>");
    expect(html).toContain('rel="canonical" href="https://profoundiqconsulting.com/courses/decision-lab"');
    expect(html).toContain('"@type":"Course"');
    expect(html).toContain("Frame options");
  });

  it("renders course titles, links, and crawlable metadata inside the app root", () => {
    const html = renderCourseCatalogPage([{ slug: "decision-lab", title: "Decision Lab", strapline: "Practice better decisions", description: "A focused professional course.", audience: "Leaders", duration: "4 weeks", priceKes: 4999 }], null);
    expect(html).toContain("<title>Professional Courses | Profound IQ Consulting</title>");
    expect(html).toContain('<div id="root"><main');
    expect(html).toContain("Decision Lab");
    expect(html).toContain('href="/courses/decision-lab"');
  });
});

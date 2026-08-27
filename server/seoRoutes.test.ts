import { describe, expect, it } from "vitest";
import { buildSitemapXml, courseSocialImageUrl, renderCourseCatalogPage, renderCourseDetailPage, renderCourseSocialImage, renderInsightArticlePage } from "./seoRoutes";
import { insightArticles } from "../shared/insightsArticles";
import sharp from "sharp";

describe("course SEO server routes", () => {
  it("includes every published course slug in the sitemap without duplicates", () => {
    const xml = buildSitemapXml([{ slug: "leadership-development" }, { slug: "leadership-development" }, { slug: "new-course" }]);
    expect(xml).toContain("https://profoundiqconsulting.com/courses/leadership-development?lang=en");
    expect(xml).toContain("https://profoundiqconsulting.com/courses/new-course?lang=ar");
    expect(xml).toContain("https://profoundiqconsulting.com/about?lang=en");
    expect(xml).toContain("https://profoundiqconsulting.com/school-solutions?lang=sw");
    expect(xml).toContain("https://profoundiqconsulting.com/contact?lang=ja");
    expect(xml).toContain(`https://profoundiqconsulting.com/blog/${insightArticles[0].slug}?lang=en`);
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(xml).toContain('hreflang="sw"');
    expect(xml.match(/<url>/g)?.length).toBe(200);
  });

  it("generates a course-specific absolute PNG preview image", async () => {
    const image = await renderCourseSocialImage({ slug: "decision-lab", title: "Decision Lab", strapline: "Practice better decisions", description: "A focused professional course.", priceKes: 4999 });
    const metadata = await sharp(image).metadata();
    expect(courseSocialImageUrl("decision-lab")).toBe("https://profoundiq-vguqrhsm.manus.space/og/course/decision-lab.png?v=1");
    expect(metadata.format).toBe("png");
    expect(metadata.width).toBe(1200);
    expect(metadata.height).toBe(630);
  });

  it("composites supplied cover artwork into a valid course card", async () => {
    const cover = await sharp({ create: { width: 40, height: 40, channels: 4, background: { r: 201, g: 163, b: 78, alpha: 1 } } }).png().toBuffer();
    const image = await renderCourseSocialImage({ slug: "decision-lab", title: "Decision Lab", strapline: "Practice better decisions", description: "A focused professional course.", priceKes: 4999, coverImageUrl: "https://invalid.example/cover.png" });
    const metadata = await sharp(image).metadata();
    expect(metadata.format).toBe("png");
    expect(metadata.width).toBe(1200);
    expect(metadata.height).toBe(630);
    expect(cover.length).toBeGreaterThan(0);
  });

  it("renders individual course metadata and JSON-LD inside the app root", () => {
    const html = renderCourseDetailPage({ slug: "decision-lab", title: "Decision Lab", strapline: "Practice better decisions", description: "A focused professional course.", audience: "Leaders", duration: "4 weeks", priceKes: 4999, outcomes: ["Frame options"] }, null);
    expect(html).toContain("<title>Decision Lab | Profound IQ Consulting</title>");
    expect(html).toContain('rel="canonical" href="https://profoundiqconsulting.com/courses/decision-lab"');
    expect(html).toContain('"@type":"Course"');
    expect(html).toContain("Frame options");
  });

  it("renders Insights article metadata and draft content inside the app root", () => {
    const html = renderInsightArticlePage(insightArticles[0], null);
    expect(html).toContain(`<title>${insightArticles[0].title} | Profound IQ Consulting</title>`);
    expect(html).toContain(`rel="canonical" href="https://profoundiqconsulting.com/blog/${insightArticles[0].slug}"`);
    expect(html).toContain('"@type":"Article"');
    expect(html).toContain("Draft preview");
    expect(html).toContain(insightArticles[0].sections[0].heading);
  });

  it("renders course titles, links, and crawlable metadata inside the app root", () => {
    const html = renderCourseCatalogPage([{ slug: "decision-lab", title: "Decision Lab", strapline: "Practice better decisions", description: "A focused professional course.", audience: "Leaders", duration: "4 weeks", priceKes: 4999 }], null);
    expect(html).toContain("<title>Professional Courses | Profound IQ Consulting</title>");
    expect(html).toContain('<div id="root"><main');
    expect(html).toContain("Decision Lab");
    expect(html).toContain('href="/courses/decision-lab"');
  });
});

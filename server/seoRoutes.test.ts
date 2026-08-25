import { describe, expect, it } from "vitest";
import { buildSitemapXml, courseSocialImageUrl, renderCourseCatalogPage, renderCourseDetailPage, renderCourseSocialImage } from "./seoRoutes";
import sharp from "sharp";

describe("course SEO server routes", () => {
  it("includes every published course slug in the sitemap without duplicates", () => {
    const xml = buildSitemapXml([{ slug: "leadership-development" }, { slug: "leadership-development" }, { slug: "new-course" }]);
    expect(xml).toContain("https://profoundiqconsulting.com/courses/leadership-development");
    expect(xml).toContain("https://profoundiqconsulting.com/courses/new-course");
    expect(xml.match(/<url>/g)?.length).toBe(10);
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

  it("renders course titles, links, and crawlable metadata inside the app root", () => {
    const html = renderCourseCatalogPage([{ slug: "decision-lab", title: "Decision Lab", strapline: "Practice better decisions", description: "A focused professional course.", audience: "Leaders", duration: "4 weeks", priceKes: 4999 }], null);
    expect(html).toContain("<title>Professional Courses | Profound IQ Consulting</title>");
    expect(html).toContain('<div id="root"><main');
    expect(html).toContain("Decision Lab");
    expect(html).toContain('href="/courses/decision-lab"');
  });
});

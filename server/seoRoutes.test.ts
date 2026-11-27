import { describe, expect, it, vi, beforeAll, afterAll } from "vitest";
import { readFileSync } from "node:fs";

const ORIGIN = "http://localhost:3000";

vi.mock("../shared/siteOrigin", () => {
  const origin = "http://localhost:3000";
  return {
    PUBLISHED_SITE_ORIGIN: origin,
    publishedSiteUrl: (path = "") =>
      `${origin}${path.startsWith("/") || path.length === 0 ? path : `/${path}`}`,
  };
});

const originalFetch = globalThis.fetch;

beforeAll(() => {
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
    if (url.includes("invalid.example")) {
      return new Response(null, { status: 404, statusText: "Not Found" });
    }
    if (url.includes("ProfoundIQLogo.png")) {
      const png = Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="74"></svg>`
      );
      return new Response(png, {
        status: 200,
        headers: { "Content-Type": "image/png" },
      });
    }
    if (originalFetch) {
      return originalFetch(input, init);
    }
    return new Response(null, { status: 404, statusText: "Not Found" });
  };
});

afterAll(() => {
  globalThis.fetch = originalFetch;
});

import {
  buildSitemapXml,
  courseSocialImageUrl,
  renderCourseCatalogPage,
  renderCourseDetailPage,
  renderCourseSocialImage,
  renderInsightArticlePage,
} from "./seoRoutes";
import { insightArticles } from "../shared/insightsArticles";
import sharp from "sharp";

describe("course SEO server routes", () => {
  it("includes every published course slug in the sitemap without duplicates", () => {
    const xml = buildSitemapXml([
      { slug: "leadership-development" },
      { slug: "leadership-development" },
      { slug: "new-course" },
    ]);
    expect(xml).toContain(
      "http://localhost:3000/courses/leadership-development"
    );
    expect(xml).toContain("http://localhost:3000/courses/new-course");
    expect(xml).toContain("http://localhost:3000/about");
    expect(xml).toContain("http://localhost:3000/school-solutions");
    expect(xml).toContain("http://localhost:3000/contact");
    expect(xml).toContain(
      `http://localhost:3000/blog/${insightArticles[0].slug}`
    );
    expect(xml).not.toContain("?lang=");
    expect(xml).not.toContain("hreflang");
    expect(xml.match(/<url>/g)?.length).toBe(21);
  });

  it("generates a course-specific absolute PNG preview image", async () => {
    const image = await renderCourseSocialImage({
      slug: "decision-lab",
      title: "Decision Lab",
      strapline: "Practice better decisions",
      description: "A focused professional course.",
      priceKes: 4999,
    });
    const metadata = await sharp(image).metadata();
    expect(courseSocialImageUrl("decision-lab")).toBe(
      "http://localhost:3000/og/course/decision-lab.png?v=1"
    );
    expect(metadata.format).toBe("png");
    expect(metadata.width).toBe(1200);
    expect(metadata.height).toBe(630);
  });

  it("composites supplied cover artwork into a valid course card", async () => {
    const cover = await sharp({
      create: {
        width: 40,
        height: 40,
        channels: 4,
        background: { r: 201, g: 163, b: 78, alpha: 1 },
      },
    })
      .png()
      .toBuffer();
    const image = await renderCourseSocialImage({
      slug: "decision-lab",
      title: "Decision Lab",
      strapline: "Practice better decisions",
      description: "A focused professional course.",
      priceKes: 4999,
      coverImageUrl: "https://invalid.example/cover.png",
    });
    const metadata = await sharp(image).metadata();
    expect(metadata.format).toBe("png");
    expect(metadata.width).toBe(1200);
    expect(metadata.height).toBe(630);
    expect(cover.length).toBeGreaterThan(0);
  });

  it("renders individual course metadata and JSON-LD inside the app root", () => {
    const html = renderCourseDetailPage(
      {
        slug: "decision-lab",
        title: "Decision Lab",
        strapline: "Practice better decisions",
        description: "A focused professional course.",
        audience: "Leaders",
        duration: "4 weeks",
        priceKes: 4999,
        outcomes: ["Frame options"],
      },
      null
    );
    expect(html).toContain(
      "<title>Decision Lab | Profound IQ Consulting</title>"
    );
    expect(html).toContain(
      'rel="canonical" href="http://localhost:3000/courses/decision-lab"'
    );
    expect(html).toContain('"@type":"Course"');
    expect(html).toContain("Frame options");
  });

  it("points SEO course actions to the selected course registration workflow", () => {
    const detail = renderCourseDetailPage(
      {
        slug: "decision-lab",
        title: "Decision Lab",
        strapline: "Practice better decisions",
        description: "A focused professional course.",
        audience: "Leaders",
        duration: "4 weeks",
        priceKes: 4999,
        outcomes: ["Frame options"],
      },
      null
    );
    expect(detail).toContain(
      'href="http://localhost:3000/courses?enroll=decision-lab"'
    );
    expect(detail).toContain(">Start course registration</a>");
    const routes = readFileSync("server/seoRoutes.ts", "utf8");
    expect(routes).toContain("COURSE_CATALOG_LISTING_PATH");
    expect(routes).not.toContain('app.get(\n    "/courses",');
  });

  it("keeps the server-rendered listing on its own route and canonicalises to the catalogue", () => {
    const html = renderCourseCatalogPage(
      [
        {
          slug: "decision-lab",
          title: "Decision Lab",
          strapline: "Practice better decisions",
          description: "A focused professional course.",
          audience: "Leaders",
          duration: "4 weeks",
          priceKes: 4999,
        },
      ],
      null
    );
    expect(html).toContain(
      '<link rel="canonical" href="http://localhost:3000/courses"/>'
    );
    expect(html).not.toContain("http://localhost:3000/courses/catalogue");
    expect(html).toContain(
      'href="http://localhost:3000/courses">Browse the interactive course catalogue</a>'
    );
  });

  it("renders Insights article metadata and draft content inside the app root", () => {
    const html = renderInsightArticlePage(insightArticles[0], null);
    expect(html).toContain(
      `<title>${insightArticles[0].title} | Profound IQ Consulting</title>`
    );
    expect(html).toContain(
      `rel="canonical" href="http://localhost:3000/blog/${insightArticles[0].slug}"`
    );
    expect(html).toContain('"@type":"Article"');
    expect(html).toContain("Draft preview");
    expect(html).toContain(insightArticles[0].sections[0].heading);
  });

  it("renders course titles, links, and crawlable metadata inside the app root", () => {
    const html = renderCourseCatalogPage(
      [
        {
          slug: "decision-lab",
          title: "Decision Lab",
          strapline: "Practice better decisions",
          description: "A focused professional course.",
          audience: "Leaders",
          duration: "4 weeks",
          priceKes: 4999,
        },
      ],
      null
    );
    expect(html).toContain(
      "<title>Professional Courses | Profound IQ Consulting</title>"
    );
    expect(html).toContain('<div id="root"><main');
    expect(html).toContain("Decision Lab");
    expect(html).toContain(
      'content="http://localhost:3000/ProfoundIQSocialSharingImage.png"'
    );
    expect(html).toContain('<meta property="og:image:width" content="1733"/>');
    expect(html).toContain('<meta property="og:image:height" content="908"/>');
    expect(html).toContain('href="/courses/decision-lab?workspace=1"');
  });
});

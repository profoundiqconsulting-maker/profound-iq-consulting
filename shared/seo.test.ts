import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getSeo, SITE_ORIGIN, DEFAULT_IMAGE } from "../client/src/components/SeoHead";

describe("route SEO metadata", () => {
  it("defines distinct public metadata and canonical paths", () => {
    const home = getSeo("/");
    const courses = getSeo("/courses");
    const assessment = getSeo("/assessment");
    const course = getSeo("/courses/leadership-development");
    expect(home.title).not.toBe(courses.title);
    expect(courses.description).toContain("interactive lessons");
    expect(assessment.canonical).toBe("/assessment");
    expect(course.title).toContain("Leadership Development");
    expect(course.jsonLd?.["@type"]).toBe("Course");
    expect(`${SITE_ORIGIN}${course.canonical}`).toBe("https://profoundiqconsulting.com/courses/leadership-development");
    expect(DEFAULT_IMAGE).toMatch(/^https:\/\/profoundiq-vguqrhsm\.manus\.space\/manus-storage\/.*\.png$/);
  });

  it("marks private workspace routes as noindex", () => {
    expect(getSeo("/dashboard").noIndex).toBe(true);
    expect(getSeo("/admin").noIndex).toBe(true);
    expect(getSeo("/courses/payment-success").noIndex).toBe(true);
  });

  it("ships crawl-supporting files", () => {
    const robots = readFileSync("client/public/robots.txt", "utf8");
    const sitemap = readFileSync("client/public/sitemap.xml", "utf8");
    expect(existsSync("client/public/robots.txt")).toBe(true);
    expect(robots).toContain("Sitemap: https://profoundiqconsulting.com/sitemap.xml");
    expect(robots).toContain("Disallow: /admin");
    expect(sitemap).toContain("https://profoundiqconsulting.com/courses");
  });
});

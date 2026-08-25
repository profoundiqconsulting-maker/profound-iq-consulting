import fs from "node:fs";
import path from "node:path";
import type { Express, Request, Response } from "express";
import { courseCatalog } from "../shared/courseCatalog";
import { listPublishedCatalogItems } from "./db";

const SITE_ORIGIN = "https://profoundiqconsulting.com";
const LOGO_URL = `${SITE_ORIGIN}/manus-storage/ProfoundIQLogo-header_aad21220.jpg`;

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

type PublicCourse = { slug: string; title: string; strapline?: string; description: string; audience?: string; duration?: string; priceKes: number; outcomes?: readonly string[] };

async function getPublicCourses(): Promise<PublicCourse[]> {
  const base = courseCatalog.map((course) => ({ slug: course.slug, title: course.title, strapline: course.strapline, description: course.description, audience: course.audience, duration: course.duration, priceKes: course.priceKes, outcomes: course.outcomes }));
  try {
    const published = await listPublishedCatalogItems();
    const overlays = published.filter((item) => item.itemType === "course" || item.itemType === "program").map((item) => ({ slug: item.slug, title: item.title, strapline: item.strapline, description: item.description, audience: item.audience, duration: item.duration, priceKes: item.priceKes, outcomes: Array.isArray(item.outcomes) ? item.outcomes.filter((value): value is string => typeof value === "string") : [] }));
    const bySlug = new Map(overlays.map((course) => [course.slug, course]));
    const merged = base.map((course) => { const overlay = bySlug.get(course.slug); if (!overlay) return course; bySlug.delete(course.slug); return { ...course, ...overlay }; });
    return [...merged, ...Array.from(bySlug.values())];
  } catch (error) {
    console.warn("[SEO] Published catalog unavailable; using bundled courses for SSR:", error instanceof Error ? error.message : error);
    return base;
  }
}

export function buildSitemapXml(courses: Array<{ slug: string }>) {
  const staticPaths = ["/", "/courses", "/assessment", "/careerpath", "/psychometrics", "/verify/certificate", "/verify/psychometric"];
  const paths = [...staticPaths, ...courses.map((course) => `/courses/${course.slug}`)];
  const uniquePaths = Array.from(new Set(paths));
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${uniquePaths.map((url) => `  <url><loc>${SITE_ORIGIN}${escapeHtml(url)}</loc></url>`).join("\n")}\n</urlset>\n`;
}

function findClientScript() {
  if (process.env.NODE_ENV === "development") return "/src/main.tsx";
  const assetsDirectory = path.resolve(import.meta.dirname, "../../dist/public/assets");
  const asset = fs.existsSync(assetsDirectory) ? fs.readdirSync(assetsDirectory).find((name) => /^index-.*\.js$/.test(name)) : null;
  return asset ? `/assets/${asset}` : null;
}

export function renderCourseCatalogPage(courses: PublicCourse[], clientScript: string | null) {
  const cards = courses.map((course) => `<article class="course-card"><p class="course-kicker">Professional course · KES ${escapeHtml(course.priceKes.toLocaleString())}</p><h2>${escapeHtml(course.title)}</h2><p class="course-strapline">${escapeHtml(course.strapline || "Applied professional learning")}</p><p>${escapeHtml(course.description)}</p><p class="course-meta">${escapeHtml(course.duration || "Online learning")} · For ${escapeHtml(course.audience || "Professionals and learners")}</p><a href="/courses/${encodeURIComponent(course.slug)}">View course details</a></article>`).join("\n");
  const script = clientScript ? `<script type="module" src="${escapeHtml(clientScript)}"></script>` : "";
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>Professional Courses | Profound IQ Consulting</title><meta name="description" content="Explore globally relevant professional courses with interactive lessons, applied practice, quizzes, and completion certificates."/><link rel="canonical" href="${SITE_ORIGIN}/courses"/><meta property="og:title" content="Professional Courses | Profound IQ Consulting"/><meta property="og:description" content="Explore globally relevant professional courses with interactive lessons, applied practice, quizzes, and completion certificates."/><meta property="og:type" content="website"/><meta property="og:url" content="${SITE_ORIGIN}/courses"/><meta property="og:image" content="${LOGO_URL}"/><meta name="twitter:card" content="summary_large_image"/><meta name="twitter:title" content="Professional Courses | Profound IQ Consulting"/><meta name="twitter:description" content="Explore globally relevant professional courses with interactive lessons, applied practice, quizzes, and completion certificates."/><meta name="twitter:image" content="${LOGO_URL}"/><link rel="icon" href="/favicon.ico"/><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet"/><style>body{margin:0;background:#101d35;color:#f7f3e8;font-family:Manrope,Arial,sans-serif}.shell{max-width:1180px;margin:auto;padding:64px 24px}.eyebrow,.course-kicker{color:#c9a34e;font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase}.hero{padding:44px 0 58px;border-bottom:1px solid #ffffff22}.hero h1{max-width:760px;margin:16px 0;font:500 clamp(3rem,8vw,6.8rem)/.92 Fraunces,serif;letter-spacing:-.05em}.hero p{max-width:620px;color:#c9d1df;font-size:18px;line-height:1.8}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px;padding-top:42px}.course-card{background:#f7f3e8;color:#16243d;padding:26px;min-height:280px;border:1px solid #c9a34e55}.course-card h2{font:600 30px/1 Fraunces,serif;margin:14px 0}.course-card p{line-height:1.65}.course-strapline{font-weight:700}.course-meta{color:#657084;font-size:13px}.course-card a{display:inline-block;margin-top:16px;color:#7d5e1e;font-weight:800;text-decoration:none;border-bottom:1px solid #7d5e1e;padding-bottom:4px}@media(max-width:640px){.shell{padding:32px 18px}.hero{padding-top:20px}.course-card{min-height:0}}</style></head><body><div id="root"><main class="shell"><section class="hero"><p class="eyebrow">01 / Course catalog</p><h1>Capability is built in <em>practice.</em></h1><p>Explore structured professional learning designed to turn insight into a repeatable way of working.</p></section><section class="grid" aria-label="Professional courses">${cards}</section></main></div>${script}</body></html>`;
}

export function registerSeoRoutes(app: Express) {
  app.get("/sitemap.xml", async (_req: Request, res: Response) => { const courses = await getPublicCourses(); res.type("application/xml").set("Cache-Control", "public, max-age=300").send(buildSitemapXml(courses)); });
  app.get("/courses", async (_req: Request, res: Response) => { const courses = await getPublicCourses(); res.type("html").set("Cache-Control", "no-cache").send(renderCourseCatalogPage(courses, findClientScript())); });
}

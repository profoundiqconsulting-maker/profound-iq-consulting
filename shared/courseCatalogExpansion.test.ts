import { describe, expect, it } from "vitest";
import { courseCatalog, COURSE_PASS_MARK, STANDARD_COURSE_PRICE_KES, STANDARD_COURSE_STAGE_AMOUNTS_KES } from "./courseCatalog";
import { renderCourseCertificateSvg } from "../server/courseCertificate";
import { readFileSync } from "node:fs";

describe("expanded professional course catalog", () => {
  const additionalSlugs = ["personal-growth-self-discovery", "building-a-growth-mindset", "continuous-self-improvement", "mastering-self-discipline", "mastering-time-management", "personal-finance-management-essentials", "self-confidence-and-self-esteem", "emotional-intelligence-mastery", "personal-brand-strategy", "personal-excellence-mastery", "effective-communication-essentials", "lasting-interpersonal-relationships", "building-thriving-business-empires", "negotiation-mastery", "critical-thinking-problem-solving", "creativity-and-innovation", "teamwork-and-collaboration", "leadership-and-self-leadership", "adaptability-and-resilience", "time-management-personal-productivity", "decision-making-skills", "conflict-resolution-negotiation", "interpersonal-and-relationship-skills", "digital-literacy-and-etiquette", "presentation-and-public-speaking", "professionalism-and-workplace-ethics", "career-development-employability", "entrepreneurial-mindset", "artificial-intelligence-for-educators", "artificial-intelligence-generative-ai", "generative-ai-prompt-engineering", "ai-business-organization-transformation", "ai-powered-productivity-automation", "responsible-ai-ethics-governance", "social-media-management", "digital-marketing", "research-methods", "business-analytics", "business-intelligence", "competency-based-education-assessments", "communication-presentation-skills", "report-writing-presentation-skills", "career-guidance-coaching", "customer-experience-management", "search-engine-optimization", "data-analytics"];

  it("contains every requested new course", () => {
    expect(additionalSlugs.every((slug) => courseCatalog.some((course) => course.slug === slug))).toBe(true);
  });

  it("gives each new course the complete learning structure and staged price", () => {
    for (const slug of additionalSlugs) {
      const course = courseCatalog.find((item) => item.slug === slug)!;
      expect(course.priceKes).toBe(STANDARD_COURSE_PRICE_KES);
      expect(course.stageAmountsKes).toEqual(STANDARD_COURSE_STAGE_AMOUNTS_KES);
      expect(course.stageAmountsKes.reduce((sum, amount) => sum + amount, 0)).toBe(4999);
      expect(course.modules).toHaveLength(10);
      expect(course.modules.length).toBe(10);
      expect(course.modules.every((module) => module.lessons.length === 7 && module.quiz.length === 15)).toBe(true);
      expect(course.modules.flatMap((module) => module.lessons).every((lesson) => lesson.durationMinutes === 30 && lesson.sections.length >= 4 && lesson.simulation.options.length >= 3 && lesson.reflectionPrompt.length > 30)).toBe(true);
    }
    expect(COURSE_PASS_MARK).toBe(50);
  });

  it("keeps quiz questions aligned to their source lessons and modules", () => {
    const course = courseCatalog.find((item) => item.slug === "decision-making-skills")!;
    for (const module of course.modules) {
      expect(new Set(module.quiz.map((question) => question.sourceLessonId)).size).toBeGreaterThan(1);
      expect(module.quiz.every((question) => module.lessons.some((lesson) => lesson.id === question.sourceLessonId) && question.options.length === 4 && question.correctOption >= 0 && question.correctOption < 4)).toBe(true);
    }
  });

  it("provides deeper concept teaching and everyday application guidance", () => {
    const lesson = courseCatalog.find((item) => item.slug === "mastering-time-management")!.modules[4].lessons[2];
    expect(lesson.durationMinutes).toBe(30);
    expect(lesson.sections.length).toBeGreaterThanOrEqual(6);
    expect(lesson.sections.map((section) => section.body).join(" ").length).toBeGreaterThan(1800);
    expect(lesson.sections.map((section) => section.body).join(" ")).toMatch(/work|study|family|finances|health|household/i);
    expect(lesson.example.context.length).toBeGreaterThan(70);
    expect(lesson.example.move.length).toBeGreaterThan(90);
    expect(lesson.simulation.prompt.length).toBeGreaterThan(50);
    expect(lesson.reflectionPrompt).toMatch(/work|study|relationships|finances|health|household/i);
    expect(lesson.keyTakeaway.length).toBeGreaterThan(70);
    expect(lesson.deepDive.length).toBeGreaterThan(120);
    expect(lesson.responseTasks.length).toBeGreaterThanOrEqual(3);
    expect(lesson.responseTasks.every((task) => task.required && task.prompt.length > 30)).toBe(true);
  });

  it("assigns discoverable taxonomy and managed cover artwork to every course", () => {
    expect(courseCatalog.every((course) => course.category && ["Foundation", "Practitioner", "Advanced"].includes(course.skillLevel) && course.coverImage.startsWith("/manus-storage/"))).toBe(true);
    expect(new Set(courseCatalog.map((course) => course.category)).size).toBeGreaterThanOrEqual(5);
    expect(courseCatalog.find((course) => course.slug === "artificial-intelligence-for-educators")?.category).toBe("AI & Digital");
    expect(courseCatalog.find((course) => course.slug === "business-analytics")?.category).toBe("Business & Analytics");
    expect(courseCatalog.find((course) => course.slug === "research-methods")?.category).toBe("Education & Research");
  });

  it("inherits branded certificate metadata for new courses", () => {
    const svg = renderCourseCertificateSvg({ recipientName: "Amina Otieno", recipientEmail: "amina@example.com", courseTitle: "Decision-Making Skills", certificateNumber: "PIQ-2026-0001", issuedOn: "2026-08-24T00:00:00Z", verificationUrl: "https://profoundiq-vguqrhsm.manus.space/verify/certificate?certificate=PIQ-2026-0001" });
    expect(svg).toContain("Amina Otieno");
    expect(svg).toContain("Decision-Making Skills");
    expect(svg).toContain("PIQ-2026-0001");
    expect(svg).toContain("SCAN TO VERIFY");
    expect(svg).toContain("https://profoundiq-vguqrhsm.manus.space/verify/certificate");
    expect(svg).toContain("Issued");
  });

  it("applies one persisted admin design consistently across every catalog course", () => {
    const sharedDesign = {
      trainerName: "Dr. Grace Wambui",
      trainerTitle: "Lead Facilitator",
      signatureDataUri: "data:image/png;base64,QUJD",
      fieldLayout: { recipient: { x: 1111, y: 777 }, course: { x: 1000, y: 985 }, trainerTitle: { visible: false } },
      customElements: { partnerMark: "https://example.com/partner-mark.svg" },
    };

    for (const [index, course] of courseCatalog.entries()) {
      const learnerName = `Learner ${index + 1}`;
      const certificateNumber = `PIQ-2026-${String(index + 1).padStart(4, "0")}`;
      const svg = renderCourseCertificateSvg({
        recipientName: learnerName,
        recipientEmail: `${course.slug}@example.com`,
        courseTitle: course.title,
        certificateNumber,
        issuedOn: "2026-08-24T00:00:00Z",
        verificationUrl: `https://profoundiq-vguqrhsm.manus.space/verify/certificate?certificate=${certificateNumber}`,
        ...sharedDesign,
      });

      expect(svg).toContain(learnerName);
      const escapedCourseTitle = course.title.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character] ?? character);
      expect(svg).toContain(escapedCourseTitle);
      expect(svg).toContain(certificateNumber);
      expect(svg).toContain('data-field="recipient" x="1111" y="777"');
      expect(svg).toContain('data-field="course" x="1000" y="985"');
      expect(svg).toContain('<text display="none" data-field="trainerTitle"');
      expect(svg).toContain("Dr. Grace Wambui");
      expect(svg).toContain("Lead Facilitator");
      expect(svg).toContain("data:image/png;base64,QUJD");
      expect(svg).toContain('data-field="custom:partnerMark"');
      expect(svg).not.toContain(`${course.slug}@example.com`);
    }
  });
});

describe("quiz learning feedback and analytics", () => {
  it("provides one explanation for every quiz option", () => {
    for (const course of courseCatalog) {
      for (const module of course.modules) {
        for (const question of module.quiz) {
          expect(question.options).toHaveLength(4);
          expect(question.optionExplanations).toHaveLength(4);
          expect(question.optionExplanations.every((explanation) => explanation.length > 35)).toBe(true);
          expect(question.optionExplanations[question.correctOption]).toMatch(/correct/i);
        }
      }
    }
  });

  it("exposes shareable comparison, recommendation, and preview controls", () => {
    const source = readFileSync("client/src/pages/Courses.tsx", "utf8");
    expect(source).toContain('params.get("compare")');
    expect(source).toContain("syncComparison");
    expect(source).toContain("shareComparison");
    expect(source).toContain("recommendedCourses");
    expect(source).toContain("setPreviewCourse(course)");
    expect(source).toContain("FIRST SIX MODULE HIGHLIGHTS");
    expect(source).toContain("saveCourseRecommendationAnswers");
    expect(source).toContain("toggleSavedCourse");
    expect(readFileSync("client/src/pages/CourseComparison.tsx", "utf8")).toContain("courses/compare?compare=");
    expect(readFileSync("client/src/App.tsx", "utf8")).toContain('path=\"/courses/compare\"');
  });

  it("exposes catalog comparison and discovery controls", () => {
    const source = readFileSync("client/src/pages/Courses.tsx", "utf8");
    expect(source).toContain("comparisonSlugs");
    expect(source).toContain("Compare up to three pathways");
    expect(source).toContain("Filter by skill level");
    expect(source).toContain("Price: low to high");
  });

  it("keeps every course entry action pointed at the interactive lesson workspace", () => {
    const catalog = readFileSync("client/src/pages/Courses.tsx", "utf8");
    const comparison = readFileSync("client/src/pages/CourseComparison.tsx", "utf8");
    const seoRoutes = readFileSync("server/seoRoutes.ts", "utf8");
    expect(catalog).toContain("/courses/${course.slug}?workspace=1");
    expect(catalog).toContain("/courses/${selectedCourse.slug}?workspace=1");
    expect(comparison).toContain("/courses/${course.slug}?workspace=1");
    expect(seoRoutes).toContain('req.query.workspace === "1"');
    expect(seoRoutes).toContain('href=\"/courses/${encodeURIComponent(course.slug)}?workspace=1\"');
    const workspace = readFileSync("client/src/pages/CourseWorkspace.tsx", "utf8");
    expect(workspace).toContain("/courses/${course.slug}?workspace=1");
    expect(workspace).toContain("window.location.pathname + window.location.search");
  });

  it("exposes the randomized-attempt and feedback contract in the workspace", async () => {
    const source = readFileSync("client/src/pages/CourseWorkspace.tsx", "utf8");
    expect(source).toContain("New randomized attempt");
    expect(source).toContain("Learning review");
    expect(source).toContain("optionExplanations");
  });

  it("exposes pointer editing and confirmed visual snapshot restore in the certificate editor", () => {
    const source = readFileSync("client/src/components/AdminCertificatePreview.tsx", "utf8");
    expect(source).toContain("beginAssetPointer");
    expect(source).toContain('mode: "move" | "resize"');
    expect(source).toContain('drag.mode === "resize"');
    expect(source).toContain("setPointerCapture");
    expect(source).toContain("Resize custom asset");
    expect(source).toContain("Saved certificate layout thumbnail");
    expect(source).toContain("window.confirm");
    expect(source).toContain("Unsaved layout changes will be replaced");
  });
});

describe("shareable comparison and personalized course revisit", () => {
  it("registers the dedicated comparison route and route metadata", () => {
    const app = readFileSync("client/src/App.tsx", "utf8");
    const comparison = readFileSync("client/src/pages/CourseComparison.tsx", "utf8");
    expect(app).toContain('path="/courses/compare"');
    expect(comparison).toContain('params.get("compare")');
    expect(comparison).toContain('meta[property="og:title"]');
    expect(comparison).toContain("Share comparison");
  });

  it("exposes authenticated persistence contracts for recommendations and saved courses", () => {
    const router = readFileSync("server/routers.ts", "utf8");
    const schema = readFileSync("drizzle/schema.ts", "utf8");
    const dashboard = readFileSync("client/src/pages/UserDashboard.tsx", "utf8");
    expect(router).toContain("saveCourseRecommendationAnswers");
    expect(router).toContain("toggleSavedCourse");
    expect(schema).toContain("recommendationAnswers");
    expect(schema).toContain("courseSavedCourses");
    expect(dashboard).toContain("savedCourses");
    expect(dashboard).toContain("Suggested follow-up");
  });
});

describe("comparison SSR and personalized revisit upgrades", () => {
  it("exposes server-rendered comparison metadata and Open Graph image generation", () => {
    const seoRoutes = readFileSync("server/seoRoutes.ts", "utf8");
    expect(seoRoutes).toContain("courses/compare");
    expect(seoRoutes).toContain("og:title");
    expect(seoRoutes).toContain("image/png");
    expect(seoRoutes).toContain("comparison");
  });

  it("exposes paginated saved-course management and recommendation history", () => {
    const router = readFileSync("server/routers.ts", "utf8");
    const db = readFileSync("server/db.ts", "utf8");
    const dashboard = readFileSync("client/src/pages/UserDashboard.tsx", "utf8");
    expect(router).toContain("savedCoursesPage");
    expect(router).toContain("recommendationHistory");
    expect(db).toContain("listSavedCoursesPage");
    expect(db).toContain("listCourseRecommendationHistory");
    expect(dashboard).toContain("savedCoursePage");
    expect(dashboard).toContain("Remove");
    expect(dashboard).toContain("Course finder history");
    expect(dashboard).toContain("Retake finder");
  });

  it("covers localized share copy and comparison analytics presentation", () => {
    const share = readFileSync("client/src/components/CourseShareActions.tsx", "utf8");
    const analytics = readFileSync("client/src/components/AdminCourseShareAnalytics.tsx", "utf8");
    expect(share).toContain('eventName: "course_shared"');
    expect(share).toContain("comparisonSlugs");
    for (const locale of ["en", "sw", "fr", "es", "pt", "ar", "zh", "hi", "de", "ja"]) expect(share).toContain(`${locale}:`);
    expect(analytics).toContain("byComparison");
    expect(analytics).toContain("Most shared comparisons.");
  });

  it("exposes the saved-pathways PDF preview contract", () => {
    const dashboard = readFileSync("client/src/pages/UserDashboard.tsx", "utf8");
    expect(dashboard).toContain("Saved learning pathways PDF preview");
    expect(dashboard).toContain("Download PDF");
    expect(dashboard).toContain("savedPathwaysPreview");
  });

  it("exposes summary and detailed PDF layout controls and comparison trends", () => {
    const dashboard = readFileSync("client/src/pages/UserDashboard.tsx", "utf8");
    const pdf = readFileSync("server/reportPdf.ts", "utf8");
    const router = readFileSync("server/routers.ts", "utf8");
    const analytics = readFileSync("client/src/components/AdminCourseShareAnalytics.tsx", "utf8");
    const db = readFileSync("server/db.ts", "utf8");
    expect(dashboard).toContain("savedPathwaysLayout");
    expect(dashboard).toContain('setSavedPathwaysLayout("summary")');
    expect(dashboard).toContain('setSavedPathwaysLayout("detailed")');
    expect(pdf).toContain('layout?: "summary" | "detailed"');
    expect(pdf).toContain('input.layout !== "summary"');
    expect(router).toContain('z.enum(["summary", "detailed"])');
    expect(db).toContain("comparisonShareTrend");
    expect(analytics).toContain("Comparison shares over time");
    expect(analytics).toContain("comparisonShareTrendData");
  });

  it("exposes localized PDF controls, preview zoom, and CSV sections", () => {
    const dashboard = readFileSync("client/src/pages/UserDashboard.tsx", "utf8");
    const csv = readFileSync("shared/adminExport.ts", "utf8");
    const router = readFileSync("server/routers.ts", "utf8");
    expect(dashboard).toContain("pdfLayoutCopy");
    expect(dashboard).toContain("savedPathwaysZoom");
    expect(dashboard).toContain("zoomIn");
    expect(csv).toContain("COMPARISON RANKINGS");
    expect(csv).toContain("DAILY SHARE TREND");
    expect(router).toContain("buildCourseShareAnalyticsCsv({ matrix: data.matrix");
  });

  it("exposes printable localized PDFs and date-scoped analytics CSVs", () => {
    const dashboard = readFileSync("client/src/pages/UserDashboard.tsx", "utf8");
    const pdf = readFileSync("server/reportPdf.ts", "utf8");
    const router = readFileSync("server/routers.ts", "utf8");
    const csv = readFileSync("shared/adminExport.ts", "utf8");
    expect(dashboard).toContain("printSavedPathways");
    expect(dashboard).toContain("printWindow.print");
    expect(dashboard).toContain("locale, watermark: savedPathwaysWatermark");
    expect(pdf).toContain("labels.savedPathways");
    expect(pdf).toContain("labels.outcomes");
    expect(router).toContain("locale: z.enum([\"en\", \"sw\"");
    expect(router).toContain("localizeCourseMetadata(locale");
    expect(csv).toContain("Date range");
    expect(router).toContain("fromDate: input?.fromDate, toDate: input?.toDate");
  });

  it("supports paginated print layouts, localized timestamps, and configurable branding", () => {
    const pdf = readFileSync("server/reportPdf.ts", "utf8");
    const printPage = readFileSync("client/src/pages/SavedPathwaysPrint.tsx", "utf8");
    const router = readFileSync("server/routers.ts", "utf8");
    const dashboard = readFileSync("client/src/pages/UserDashboard.tsx", "utf8");
    expect(pdf).toContain("Page ${pageNumber}");
    expect(pdf).toContain("formatDate(new Date(), input.locale)");
    expect(pdf).toContain("watermark?: boolean");
    expect(router).toContain("watermark: z.boolean().default(true)");
    expect(printPage).toContain("const chunkSize = 2");
    expect(printPage).toContain("formattedDate");
    expect(printPage).toContain("printPage");
    expect(printPage).toContain("showWatermark");
    expect(printPage).toContain("Page");
    expect(dashboard).toContain("savedPathwaysWatermark");
    expect(dashboard).toContain("savedPathwaysPageSize");
    expect(dashboard).toContain("savedPathwaysCoverPage");
    expect(dashboard).toContain("updateExportPreferences");
    expect(router).toContain("updateExportPreferences: protectedProcedure");
    expect(pdf).toContain("pageSize?: \"A4\" | \"LETTER\"");
    expect(pdf).toContain("coverPage?: boolean");
    expect(pdf).toContain("input.coverPage && input.layout === \"detailed\"");
    expect(printPage).toContain("@page { size: ${pageSize}");
    expect(printPage).toContain("print-cover");
  });

  it("supports Arabic and CJK PDF typography, quick date presets, and print layout routing", () => {
    const pdf = readFileSync("server/reportPdf.ts", "utf8");
    const analytics = readFileSync("client/src/components/AdminCourseShareAnalytics.tsx", "utf8");
    const app = readFileSync("client/src/App.tsx", "utf8");
    const printPage = readFileSync("client/src/pages/SavedPathwaysPrint.tsx", "utf8");
    expect(pdf).toContain("NotoNaskhArabic");
    expect(pdf).toContain("NotoSansCJKsc");
    expect(pdf).toContain("labels.savedPathways[localeKey]");
    expect(analytics).toContain("applyThisMonth");
    expect(analytics).toContain("This month");
    expect(app).toContain("/dashboard/print-pathways");
    expect(printPage).toContain("window.print");
    expect(printPage).toContain("print:hidden");
  });
});

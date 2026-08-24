import { describe, expect, it } from "vitest";
import { courseCatalog, COURSE_PASS_MARK, STANDARD_COURSE_PRICE_KES, STANDARD_COURSE_STAGE_AMOUNTS_KES } from "./courseCatalog";
import { renderCourseCertificateSvg } from "../server/courseCertificate";

describe("expanded professional course catalog", () => {
  const additionalSlugs = ["personal-growth-self-discovery", "building-a-growth-mindset", "continuous-self-improvement", "mastering-self-discipline", "mastering-time-management", "personal-finance-management-essentials", "self-confidence-and-self-esteem", "emotional-intelligence-mastery", "personal-brand-strategy", "personal-excellence-mastery", "effective-communication-essentials", "lasting-interpersonal-relationships", "building-thriving-business-empires", "negotiation-mastery", "critical-thinking-problem-solving", "creativity-and-innovation", "teamwork-and-collaboration", "leadership-and-self-leadership", "adaptability-and-resilience", "time-management-personal-productivity", "decision-making-skills", "conflict-resolution-negotiation", "interpersonal-and-relationship-skills", "digital-literacy-and-etiquette", "presentation-and-public-speaking", "professionalism-and-workplace-ethics", "career-development-employability", "entrepreneurial-mindset"];

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
      expect(course.modules.flatMap((module) => module.lessons).every((lesson) => lesson.durationMinutes === 40 && lesson.sections.length >= 4 && lesson.simulation.options.length >= 3 && lesson.reflectionPrompt.length > 30)).toBe(true);
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
    expect(lesson.durationMinutes).toBe(40);
    expect(lesson.sections.length).toBeGreaterThanOrEqual(6);
    expect(lesson.sections.map((section) => section.body).join(" ").length).toBeGreaterThan(1800);
    expect(lesson.sections.map((section) => section.body).join(" ")).toMatch(/work|study|family|finances|health|household/i);
    expect(lesson.example.context.length).toBeGreaterThan(70);
    expect(lesson.example.move.length).toBeGreaterThan(90);
    expect(lesson.simulation.prompt.length).toBeGreaterThan(50);
    expect(lesson.reflectionPrompt).toMatch(/work|study|relationships|finances|health|household/i);
    expect(lesson.keyTakeaway.length).toBeGreaterThan(70);
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
});

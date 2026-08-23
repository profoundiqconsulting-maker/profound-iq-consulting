import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { assessmentQuestions, ASSESSMENT_PRICE_KES, buildReport, buildRoleLens, compareReports } from "../shared/assessment";

const assessmentPageSource = readFileSync(resolve(process.cwd(), "client/src/pages/Assessment.tsx"), "utf8");

describe("assessment scoring", () => {
  it("exposes 100 questions across ten capability dimensions", () => {
    expect(ASSESSMENT_PRICE_KES).toBe(20);
    expect(assessmentQuestions).toHaveLength(100);
    expect(new Set(assessmentQuestions.map((question) => question.dimension)).size).toBe(10);
    expect(Math.ceil(assessmentQuestions.length / 10)).toBe(10);
  });

  it("builds a report from submitted five-point answers", () => {
    const report = buildReport(assessmentQuestions.map((question) => ({ questionId: question.id, value: 5 })));
    expect(report.overallScore).toBe(100);
    expect(report.overallBand).toBe("Strong foundation");
    expect(report.dimensions.every((dimension) => dimension.score === 100)).toBe(true);
    expect(report.dimensions.every((dimension) => dimension.readout.length > 120 && Array.isArray(dimension.reflectionPoints))).toBe(true);
    expect(report.dimensions.filter((dimension) => dimension.reflectionPoints.length === 3)).toHaveLength(10);
    expect(report.reflectionPoints).toHaveLength(4);
    expect(report.importantContext).toHaveLength(4);
    expect(report.importantContext.join(" ")).toMatch(/point-in-time|professional decisions/i);
    expect(report.disclaimer).toMatch(/not a clinical/i);
  });

  it("protects local draft actions and supports accessible module navigation", () => {
    expect(assessmentPageSource).toMatch(/Clear saved data\?/);
    expect(assessmentPageSource).toMatch(/event\.key === "ArrowLeft"/);
    expect(assessmentPageSource).toMatch(/event\.key === "ArrowRight"/);
    expect(assessmentPageSource).toMatch(/assessmentModules\[localDraft\.currentModule\]/);
    expect(assessmentPageSource).toMatch(/% complete/);
    expect(assessmentPageSource).toMatch(/Saved progress/);
    expect(assessmentPageSource).toMatch(/Moved to/);
    expect(assessmentPageSource).toMatch(/Download current progress/);
    expect(assessmentPageSource).toMatch(/application\/json/);
    expect(assessmentPageSource).toMatch(/resume-progress-fill/);
    expect(assessmentPageSource).toMatch(/event\.key === "Escape"/);
    expect(assessmentPageSource).toMatch(/toast\.dismiss\(\)/);
    expect(assessmentPageSource).toMatch(/piq-assessment-skip-resume-prompt/);
    expect(assessmentPageSource).toMatch(/Don’t show this again; always start fresh/);
    expect(assessmentPageSource).toMatch(/modules completed/);
    expect(assessmentPageSource).toMatch(/resume-celebration/);
    expect(assessmentPageSource).toMatch(/All modules complete/);
    expect(assessmentPageSource).toMatch(/const importProgress/);
    expect(assessmentPageSource).toMatch(/Import Progress/);
    expect(assessmentPageSource).toMatch(/Open assessment settings/);
    expect(assessmentPageSource).toMatch(/Share Results/);
    expect(assessmentPageSource).toMatch(/onDrop=/);
    expect(assessmentPageSource).toMatch(/Drop a JSON progress file here/);
    expect(assessmentPageSource).toMatch(/Manage resume preferences/);
    expect(assessmentPageSource).toMatch(/Review imported progress/);
    expect(assessmentPageSource).toMatch(/Use this progress/);
    expect(assessmentPageSource).toMatch(/completion-certificate/);
    expect(assessmentPageSource).toMatch(/wa\.me/);
    expect(assessmentPageSource).toMatch(/mailto:/);

  });

  it("exposes the Transformation Services grouping and CareerPath completion actions", () => {
    const homePageSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
    const careerPathSource = readFileSync(resolve(process.cwd(), "client/src/pages/CareerPath.tsx"), "utf8");
    expect(homePageSource).toMatch(/const transformationServices/);
    expect(homePageSource).toMatch(/Transformation services/);
    expect(homePageSource).toMatch(/Self Assessment/);
    expect(homePageSource).toMatch(/CareerPath/);
    expect(careerPathSource).toMatch(/downloadCompletionCertificate/);
    expect(careerPathSource).toMatch(/shareResult/);
    expect(careerPathSource).toMatch(/WhatsApp/);
    expect(careerPathSource).toMatch(/Email/);
  });

  it("uses one shared navigation across Transformation Services", () => {
    const navSource = readFileSync(resolve(process.cwd(), "client/src/components/TransformationNav.tsx"), "utf8");
    const assessmentSource = readFileSync(resolve(process.cwd(), "client/src/pages/Assessment.tsx"), "utf8");
    const careerPathSource = readFileSync(resolve(process.cwd(), "client/src/pages/CareerPath.tsx"), "utf8");
    expect(navSource).toMatch(/Self Assessment/);
    expect(navSource).toMatch(/CareerPath/);
    expect(navSource).toMatch(/Profile/);
    expect(navSource).toMatch(/Mobile transformation services navigation/);
    expect(assessmentSource).toMatch(/<TransformationNav active="assessment" \/>/);
    expect(careerPathSource).toMatch(/<TransformationNav active="careerpath" \/>/);
    expect(navSource).toMatch(/aria-label="Breadcrumb"/);
    expect(navSource).toMatch(/startViewTransition/);
    expect(assessmentSource).toMatch(/sticky top-14 z-10/);
    expect(assessmentSource).toMatch(/aria-current=\{moduleIndex === page \? "step" : undefined\}/);
    expect(assessmentSource).toMatch(/onClick=\{\(\) => navigateToModule\(moduleIndex\)\}/);
    expect(assessmentSource).toMatch(/Module \{page \+ 1\} of \{totalPages\}/);
    expect(assessmentSource).toMatch(/moduleRailCollapsed/);
    expect(assessmentSource).toMatch(/toggleModuleRail/);
    expect(assessmentSource).toMatch(/piq-search-query/);
    expect(assessmentSource).toMatch(/moduleScore/);
    expect(assessmentSource).toMatch(/out of 100/);
    expect(navSource).toMatch(/Saved progress/);
    expect(navSource).toMatch(/Certificates/);
    expect(navSource).toMatch(/Settings/);
    expect(navSource).toMatch(/setTheme\("auto"\)/);
    expect(navSource).toMatch(/Auto/);
    expect(navSource).toMatch(/piq-new-certificate-available/);
    expect(navSource).toMatch(/Search modules or topics/);
    expect(navSource).toMatch(/transformation-search/);
    const appSource = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
    expect(appSource).toMatch(/ThemeProvider defaultTheme="light" switchable/);
  });

  it("provides adaptable role lenses and longitudinal comparison deltas", () => {
    const current = buildReport(assessmentQuestions.map((question) => ({ questionId: question.id, value: 5 })));
    const previous = buildReport(assessmentQuestions.map((question) => ({ questionId: question.id, value: 4 })));
    expect(buildRoleLens(current, "leadership").priorities).toHaveLength(3);
    expect(buildRoleLens(current, "careerTransition").reflectionPoints[0]).toMatch(/achievement/i);
    expect(compareReports(current, previous).scoreDelta).toBe(20);
    expect(compareReports(current, previous).dimensions).toHaveLength(10);
  });
});

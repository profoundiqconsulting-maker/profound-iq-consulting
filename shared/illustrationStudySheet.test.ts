import { describe, expect, it } from "vitest";
import { buildIllustrationStudySheetSvg, studySheetPngFilename } from "@/lib/illustrationStudySheet";

describe("illustration study sheets", () => {
  it("converts the SVG download name to a compatible PNG name", () => {
    expect(studySheetPngFilename("leadership-study-sheet.svg")).toBe("leadership-study-sheet.png");
    expect(studySheetPngFilename("already.png")).toBe("already.png");
  });
  it("builds a branded, self-contained SVG with the artwork and lesson context", () => {
    const svg = buildIllustrationStudySheetSvg({
      imageUrl: "/manus-storage/lesson-art.png",
      courseTitle: "Strategic Growth",
      lessonTitle: "Decision architecture",
      modeLabel: "Explanatory lens",
      content: "Map the decision before you make it.",
      filename: "study-sheet.svg",
    });

    expect(svg).toContain("PROFOUND IQ CONSULTING");
    expect(svg).toContain("Strategic Growth");
    expect(svg).toContain("Decision architecture");
    expect(svg).toContain('href="https://profoundiqconsulting.com/manus-storage/lesson-art.png"');
    expect(svg).toContain("A visual study sheet for reflection");
  });

  it("escapes learner-facing text before placing it in SVG markup", () => {
    const svg = buildIllustrationStudySheetSvg({
      imageUrl: "https://cdn.example.test/art.png?x=1&y=2",
      courseTitle: "Growth <lab>",
      lessonTitle: "Read \"the signal\"",
      modeLabel: "Experiential & applied",
      content: "Use <strong>evidence</strong> & reflection.",
      filename: "safe.svg",
    });

    expect(svg).toContain("Growth &lt;lab&gt;");
    expect(svg).toContain("Read &quot;the signal&quot;");
    expect(svg).toContain("Use &lt;strong&gt;evidence&lt;/strong&gt; &amp; reflection.");
    expect(svg).not.toContain("<strong>");
  });
});

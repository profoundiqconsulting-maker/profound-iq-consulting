import { describe, expect, it } from "vitest";
import { buildCourseCompletionShareSvg } from "./courseCompletionVisual";

describe("course completion share visual", () => {
  it("personalizes the achievement card with learner and certificate data", () => {
    const svg = buildCourseCompletionShareSvg({ learnerName: "Amina Otieno", courseTitle: "Strategic Growth & Leadership", certificateNumber: "PIQ-2026-ABC123" });
    expect(svg).toContain("Amina Otieno");
    expect(svg).toContain("Strategic Growth &amp; Leadership");
    expect(svg).toContain("PIQ-2026-ABC123");
    expect(svg).toContain("Completion unlocked.");
  });

  it("escapes user-controlled identity fields for SVG output", () => {
    const svg = buildCourseCompletionShareSvg({ learnerName: "<Amina> & Co", courseTitle: 'Leadership "Applied"', certificateNumber: "PIQ-'26" });
    expect(svg).toContain("&lt;Amina&gt; &amp; Co");
    expect(svg).toContain("Leadership &quot;Applied&quot;");
    expect(svg).toContain("PIQ-&apos;26");
    expect(svg).not.toContain("<Amina>");
  });
});

import { describe, expect, it } from "vitest";
import { buildReflectionExportCsv } from "./reflectionWorkflow";

describe("reflection workflow", () => {
  it("exports selected prompts with notes and statuses as escaped CSV", () => {
    const csv = buildReflectionExportCsv([{ dimensionLabel: "Clarity of direction", promptText: "What would make your next priority easier to explain?", note: "Discuss with my manager\nthis week", status: "active" }]);
    expect(csv).toContain('"Dimension","Reflection prompt","Learner response","Action status"');
    expect(csv).toContain('"Clarity of direction","What would make your next priority easier to explain?","Discuss with my manager this week","active"');
  });

  it("preserves the supported action-status vocabulary", () => {
    const csv = buildReflectionExportCsv([
      { dimensionLabel: "Decision quality", promptText: "Which decision would benefit from a clearer review point?", note: "Set a review date", status: "planned" },
      { dimensionLabel: "Collaboration", promptText: "Where can you make expectations more explicit?", note: "Already testing this", status: "active" },
      { dimensionLabel: "Resilience", promptText: "What evidence would show that the new response is sustainable?", note: "Reviewed with coach", status: "reviewed" },
    ]);
    expect(csv).toContain('"planned"');
    expect(csv).toContain('"active"');
    expect(csv).toContain('"reviewed"');
  });
});

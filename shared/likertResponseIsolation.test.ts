import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { assessmentQuestions } from "./assessment";
import { careerPathQuestions } from "./careerPath";

const assessmentPage = readFileSync(
  new URL("../client/src/pages/Assessment.tsx", import.meta.url),
  "utf8"
);
const careerPathPage = readFileSync(
  new URL("../client/src/pages/CareerPath.tsx", import.meta.url),
  "utf8"
);
const likertComponent = readFileSync(
  new URL("../client/src/components/LikertScale.tsx", import.meta.url),
  "utf8"
);

describe("Likert response isolation", () => {
  it("uses unique IDs for every assessment question", () => {
    expect(new Set(assessmentQuestions.map(question => question.id)).size).toBe(
      assessmentQuestions.length
    );
    expect(new Set(careerPathQuestions.map(question => question.id)).size).toBe(
      careerPathQuestions.length
    );
  });

  it("stores each Self Assessment response under the clicked question ID", () => {
    expect(assessmentPage).toContain(
      "const nextAnswers = { ...answers, [questionId]: value };"
    );
    expect(assessmentPage).toContain("LikertScale");
    expect(assessmentPage).toContain(
      "onChange={(value) => setAnswer(question.id, value)}"
    );
  });

  it("binds each CareerPath Likert input to its owning question", () => {
    expect(careerPathPage).toContain("LikertScale");
    expect(likertComponent).toContain("name={id}");
    expect(likertComponent).toMatch(/checked=\{\s*isSelected\s*\}/);
    expect(likertComponent).toContain(
      "onChange={() => onChange(option.value)}"
    );
  });
});

import { describe, expect, it } from "vitest";
import { buildCourseModuleBadges } from "./courseBadges";

const modules = [
  {
    id: "module-1",
    title: "First module",
    lessons: [{ id: "m1-l1" }, { id: "m1-l2" }],
  },
  {
    id: "module-2",
    title: "Second module",
    lessons: [{ id: "m2-l1" }, { id: "m2-l2" }],
  },
];

describe("course module completion badges", () => {
  it("earns a badge only after every lesson and a passed quiz", () => {
    const badges = buildCourseModuleBadges({
      modules,
      completedLessonIds: ["m1-l1", "m1-l2"],
      passedQuizModuleIds: ["module-1"],
    });
    expect(badges[0]).toMatchObject({
      status: "earned",
      label: "Badge earned",
      completedLessons: 2,
      quizPassed: true,
    });
  });

  it("keeps a fully studied module in progress until its quiz is passed", () => {
    const badges = buildCourseModuleBadges({
      modules,
      completedLessonIds: ["m1-l1", "m1-l2"],
      passedQuizModuleIds: [],
    });
    expect(badges[0]).toMatchObject({
      status: "in-progress",
      completedLessons: 2,
      quizPassed: false,
    });
  });

  it("marks untouched modules as locked and partial work as in progress", () => {
    const badges = buildCourseModuleBadges({
      modules,
      completedLessonIds: ["m2-l1"],
      passedQuizModuleIds: [],
    });
    expect(badges[0].status).toBe("locked");
    expect(badges[1]).toMatchObject({
      status: "in-progress",
      completedLessons: 1,
    });
  });
});

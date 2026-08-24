import { courseCatalog } from "../shared/courseCatalog.ts";

let failures = 0;
for (const course of courseCatalog) {
  if (course.modules.length !== 10) { console.error(`${course.slug}: expected 10 modules`); failures++; }
  for (const module of course.modules) {
    const lessonIds = new Set(module.lessons.map((lesson) => lesson.id));
    if (module.lessons.length !== 7) { console.error(`${course.slug}/${module.id}: expected 7 lessons`); failures++; }
    if (module.quiz.length !== 15) { console.error(`${course.slug}/${module.id}: expected 15 questions`); failures++; }
    for (const question of module.quiz) {
      if (!lessonIds.has(question.sourceLessonId)) { console.error(`${question.id}: missing source lesson`); failures++; }
      if (question.options.length !== 4) { console.error(`${question.id}: expected 4 options`); failures++; }
      if (question.correctOption < 0 || question.correctOption >= question.options.length) { console.error(`${question.id}: invalid answer index`); failures++; }
      if (!question.explanation.includes(question.sourceLessonTitle)) { console.error(`${question.id}: explanation is not lesson-aligned`); failures++; }
    }
  }
}
if (failures) process.exit(1);
console.log(`Verified ${courseCatalog.length} courses, ${courseCatalog.length * 10} modules, ${courseCatalog.length * 10 * 15} aligned quiz questions.`);

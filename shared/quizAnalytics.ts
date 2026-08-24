export type QuizAnalyticsAttempt = { courseSlug: string; moduleId: string; score: number; passed: boolean; createdAt?: Date | string | null };

export type QuizAnalytics = {
  attempts: QuizAnalyticsAttempt[];
  averageScore: number;
  passedCount: number;
  passRate: number;
  trend: Array<{ label: string; score: number }>;
  improvementAreas: Array<{ courseSlug: string; moduleId: string; score: number; createdAt?: Date | string | null }>;
};

export function summarizeQuizAnalytics(attempts: QuizAnalyticsAttempt[], passMark = 50): QuizAnalytics {
  const averageScore = attempts.length ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length) : 0;
  const passedCount = attempts.filter((attempt) => attempt.passed || attempt.score >= passMark).length;
  const ordered = [...attempts].sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime());
  const trend = ordered.slice(-8).map((attempt, index) => ({ label: `Attempt ${index + 1}`, score: attempt.score }));
  const latestByModule = new Map<string, QuizAnalyticsAttempt>();
  for (const attempt of ordered) {
    const key = `${attempt.courseSlug}:${attempt.moduleId}`;
    latestByModule.set(key, attempt);
  }
  const improvementAreas = Array.from(latestByModule.values()).filter((attempt) => attempt.score < passMark).sort((a, b) => a.score - b.score).slice(0, 4).map(({ courseSlug, moduleId, score, createdAt }) => ({ courseSlug, moduleId, score, createdAt }));
  return { attempts: [...attempts], averageScore, passedCount, passRate: attempts.length ? Math.round((passedCount / attempts.length) * 100) : 0, trend, improvementAreas };
}

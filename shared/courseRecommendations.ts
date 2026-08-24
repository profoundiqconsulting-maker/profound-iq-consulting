import { courseCatalog, type CourseDefinition } from "@shared/courseCatalog";

export type RecommendationDimension = { key: string; label: string; score: number };
export type CourseRecommendation = {
  course: Pick<CourseDefinition, "slug" | "index" | "title" | "strapline" | "description" | "audience" | "duration" | "outcomes">;
  fitScore: number;
  matchedSignals: RecommendationDimension[];
  rationale: string;
};

const courseSignals: Record<string, Array<{ keys: string[]; weight: number; rationale: string }>> = {
  "lead-with-clarity": [
    { keys: ["clarity", "leadership", "influence"], weight: 3, rationale: "Builds on direction-setting, ownership, and ethical influence signals." },
    { keys: ["communication", "collaboration"], weight: 1, rationale: "Strengthens the conversations and trust required to align people." },
  ],
  "strategic-growth-mindset": [
    { keys: ["adaptability", "growth", "resilience"], weight: 3, rationale: "Turns learning agility, feedback, and resilient practice into repeatable growth." },
    { keys: ["selfAwareness"], weight: 1, rationale: "Uses self-observation to make development experiments more useful." },
  ],
  "professional-presence-influence": [
    { keys: ["communication", "influence", "collaboration"], weight: 3, rationale: "Develops clear communication, trust, and influence across professional contexts." },
    { keys: ["leadership", "selfAwareness"], weight: 1, rationale: "Connects personal patterns to credible professional presence." },
  ],
  "from-insight-to-action": [
    { keys: ["execution", "clarity", "selfAwareness"], weight: 3, rationale: "Converts insight and priorities into visible, accountable action." },
    { keys: ["growth", "resilience"], weight: 1, rationale: "Supports deliberate practice that can continue through setbacks." },
  ],
};

const publicCourse = (course: CourseDefinition): CourseRecommendation["course"] => ({
  slug: course.slug,
  index: course.index,
  title: course.title,
  strapline: course.strapline,
  description: course.description,
  audience: course.audience,
  duration: course.duration,
  outcomes: course.outcomes,
});

export function buildCourseRecommendations(dimensions: RecommendationDimension[], limit = 3): CourseRecommendation[] {
  const normalized = dimensions.filter((item) => Number.isFinite(item.score)).map((item) => ({ ...item, score: Math.max(0, Math.min(100, Math.round(item.score))) }));
  if (!normalized.length) return [];
  const byKey = new Map(normalized.map((item) => [item.key, item]));
  return courseCatalog.map((course) => {
    const matches = (courseSignals[course.slug] ?? []).flatMap((signal) => signal.keys.flatMap((key) => {
      const dimension = byKey.get(key);
      return dimension ? [{ dimension, weight: signal.weight, rationale: signal.rationale }] : [];
    }));
    const weightedTotal = matches.reduce((sum, match) => sum + match.dimension.score * match.weight, 0);
    const weightTotal = matches.reduce((sum, match) => sum + match.weight, 0);
    const fitScore = weightTotal ? Math.round(weightedTotal / weightTotal) : 0;
    const matchedSignals = Array.from(new Map(matches.map((match) => [match.dimension.key, match.dimension])).values()).sort((a, b) => b.score - a.score).slice(0, 3);
    const rationale = matches.length ? matches.sort((a, b) => b.weight - a.weight)[0].rationale : "A balanced professional pathway that complements your broader development profile.";
    return { course: publicCourse(course), fitScore, matchedSignals, rationale };
  }).sort((a, b) => b.fitScore - a.fitScore || a.course.index.localeCompare(b.course.index)).slice(0, limit);
}

import type { CareerPathReport, CareerSubPathwayKey } from "./careerPath";

export type CareerPathSubjectCombination = {
  subjects: string[];
  page: number;
  row: number;
};

export type CareerPathEducationRecommendation = {
  key: CareerSubPathwayKey;
  label: string;
  score: number;
  band: string;
  pathway: string;
  track: string;
  combinations: CareerPathSubjectCombination[];
  careerDirections: string[];
};

type RecommendationGuideEntry = Omit<
  CareerPathEducationRecommendation,
  "key" | "label" | "score" | "band"
>;

const guidanceBySubPathway: Record<
  CareerSubPathwayKey,
  RecommendationGuideEntry
> = {
  pureSciences: {
    pathway: "STEM",
    track: "Pure Sciences",
    combinations: [
      {
        subjects: ["Advanced Mathematics", "Biology", "Chemistry"],
        page: 6,
        row: 308,
      },
      {
        subjects: ["Advanced Mathematics", "Chemistry", "Physics"],
        page: 7,
        row: 328,
      },
    ],
    careerDirections: [
      "Biological and health sciences",
      "Chemistry, laboratory and biotechnology fields",
      "Scientific research and data-led work",
    ],
  },
  appliedSciences: {
    pathway: "STEM",
    track: "Applied Sciences",
    combinations: [
      {
        subjects: ["Agriculture", "Business Studies", "Biology"],
        page: 4,
        row: 211,
      },
      {
        subjects: ["Agriculture", "Computer Studies", "Geography"],
        page: 5,
        row: 231,
      },
    ],
    careerDirections: [
      "Agriculture, food systems and agribusiness",
      "Environmental and natural-resource work",
      "Applied computing and geographic information fields",
    ],
  },
  technicalStudies: {
    pathway: "STEM",
    track: "Technical Studies",
    combinations: [
      {
        subjects: ["Building Construction", "Geography", "Physics"],
        page: 8,
        row: 438,
      },
      {
        subjects: ["Electricity", "General Science", "Computer Studies"],
        page: 9,
        row: 448,
      },
    ],
    careerDirections: [
      "Electrical and energy systems",
      "Construction and built-environment fields",
      "Technical computing and engineering fields",
    ],
  },
  languages: {
    pathway: "Social Sciences",
    track: "Languages & Literature",
    combinations: [
      {
        subjects: ["Arabic", "French", "Computer Studies"],
        page: 3,
        row: 137,
      },
      {
        subjects: ["Mandarin", "French", "Business Studies"],
        page: 4,
        row: 194,
      },
    ],
    careerDirections: [
      "Translation and language services",
      "Communications and media",
      "International relations and global-facing services",
    ],
  },
  humanities: {
    pathway: "Social Sciences",
    track: "Humanities & Business Studies",
    combinations: [
      {
        subjects: ["Business Studies", "History & Citizenship", "Geography"],
        page: 2,
        row: 79,
      },
      {
        subjects: ["History & Citizenship", "Geography", "Business Studies"],
        page: 3,
        row: 126,
      },
    ],
    careerDirections: [
      "Business and entrepreneurship",
      "Public service and community development",
      "Geography, tourism and place-based planning",
    ],
  },
  arts: {
    pathway: "Arts & Sports",
    track: "Arts",
    combinations: [
      {
        subjects: ["Fine Arts", "Theatre & Film", "Computer Studies"],
        page: 1,
        row: 4,
      },
      {
        subjects: ["Theatre & Film", "Music & Dance", "Literature in English"],
        page: 1,
        row: 43,
      },
    ],
    careerDirections: [
      "Visual communication and creative design",
      "Film, media and production",
      "Music, theatre and performance",
    ],
  },
  sports: {
    pathway: "Arts & Sports",
    track: "Sports & Recreation",
    combinations: [
      {
        subjects: ["Sports & Recreation", "Biology", "Advanced Mathematics"],
        page: 2,
        row: 58,
      },
      {
        subjects: [
          "Sports & Recreation",
          "General Science",
          "Media Technology",
        ],
        page: 2,
        row: 72,
      },
    ],
    careerDirections: [
      "Coaching, recreation and sport development",
      "Fitness and sports performance",
      "Sport media and events",
    ],
  },
};

export function getCareerPathEducationRecommendations(
  report: Pick<CareerPathReport, "subPathways">,
  limit = 3
): CareerPathEducationRecommendation[] {
  return [...report.subPathways]
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
    .slice(0, Math.max(0, limit))
    .map(subPathway => ({
      key: subPathway.key,
      label: subPathway.label,
      score: subPathway.score,
      band: subPathway.band,
      ...guidanceBySubPathway[subPathway.key],
    }));
}

export type CareerPathTrendAttempt = {
  id: number;
  createdAt: Date | string;
  paidAt?: Date | string | null;
  paymentStatus: string;
  report?: unknown;
};

export type CareerPathTrendPoint = {
  attemptId: number;
  label: string;
  date: string;
  stem: number;
  socialSciences: number;
  artsSports: number;
};

const pathwayKeys = ["stem", "socialSciences", "artsSports"] as const;
type PathwayKey = (typeof pathwayKeys)[number];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getPathwayScores(
  report: unknown
): Record<PathwayKey, number> | undefined {
  if (!isRecord(report) || !Array.isArray(report.pathways)) return undefined;
  const scores: Partial<Record<PathwayKey, number>> = {};

  for (const key of pathwayKeys) {
    const pathway = report.pathways.find(
      item => isRecord(item) && item.key === key
    );
    if (
      !isRecord(pathway) ||
      typeof pathway.score !== "number" ||
      !Number.isFinite(pathway.score) ||
      pathway.score < 0 ||
      pathway.score > 100
    ) {
      return undefined;
    }
    scores[key] = pathway.score;
  }

  if (
    scores.stem === undefined ||
    scores.socialSciences === undefined ||
    scores.artsSports === undefined
  ) {
    return undefined;
  }
  return {
    stem: scores.stem,
    socialSciences: scores.socialSciences,
    artsSports: scores.artsSports,
  };
}

export function getCareerPathTrendData(
  attempts: readonly CareerPathTrendAttempt[]
): CareerPathTrendPoint[] {
  return attempts
    .filter(attempt => attempt.paymentStatus === "paid")
    .flatMap(attempt => {
      const timestamp = new Date(attempt.paidAt ?? attempt.createdAt).getTime();
      const scores = getPathwayScores(attempt.report);
      return Number.isFinite(timestamp) && scores
        ? [{ attemptId: attempt.id, timestamp, scores }]
        : [];
    })
    .sort((a, b) => a.timestamp - b.timestamp || a.attemptId - b.attemptId)
    .map((attempt, index) => ({
      attemptId: attempt.attemptId,
      label: `Report ${index + 1}`,
      date: new Date(attempt.timestamp).toLocaleDateString(),
      stem: attempt.scores.stem,
      socialSciences: attempt.scores.socialSciences,
      artsSports: attempt.scores.artsSports,
    }));
}

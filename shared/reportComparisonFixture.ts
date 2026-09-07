export const reportComparisonPreviewHistory = [
  {
    id: 901,
    version: "V1 · FOUNDATION",
    overallScore: 62,
    createdAt: new Date("2026-05-12T08:00:00Z"),
    paymentStatus: "paid",
    dimensionScores: [
      { key: "clarity", label: "Clarity of direction", score: 58 },
      { key: "execution", label: "Execution discipline", score: 64 },
      { key: "communication", label: "Communication", score: 66 },
      { key: "adaptability", label: "Adaptability", score: 60 },
    ],
  },
  {
    id: 902,
    version: "V2 · PRACTICE",
    overallScore: 71,
    createdAt: new Date("2026-06-23T08:00:00Z"),
    paymentStatus: "paid",
    dimensionScores: [
      { key: "clarity", label: "Clarity of direction", score: 70 },
      { key: "execution", label: "Execution discipline", score: 73 },
      { key: "communication", label: "Communication", score: 68 },
      { key: "adaptability", label: "Adaptability", score: 75 },
    ],
  },
  {
    id: 903,
    version: "V3 · MOMENTUM",
    overallScore: 79,
    createdAt: new Date("2026-08-18T08:00:00Z"),
    paymentStatus: "paid",
    dimensionScores: [
      { key: "clarity", label: "Clarity of direction", score: 82 },
      { key: "execution", label: "Execution discipline", score: 77 },
      { key: "communication", label: "Communication", score: 80 },
      { key: "adaptability", label: "Adaptability", score: 78 },
    ],
  },
] as const;

export const reportComparisonPreview = {
  comparison: {
    scoreDelta: 17,
    currentScore: 79,
    previousScore: 62,
    dimensions: reportComparisonPreviewHistory[2].dimensionScores.map(
      dimension => {
        const previous = reportComparisonPreviewHistory[0].dimensionScores.find(
          item => item.key === dimension.key
        )!;
        return {
          key: dimension.key,
          label: dimension.label,
          currentScore: dimension.score,
          previousScore: previous.score,
          delta: dimension.score - previous.score,
        };
      }
    ),
  },
};

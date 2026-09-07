export function getShareTrend(current: number, previous: number) {
  if (previous <= 0)
    return { deltaPercent: null, direction: "neutral" as const };
  const deltaPercent = ((current - previous) / previous) * 100;
  return {
    deltaPercent,
    direction:
      deltaPercent > 0
        ? ("up" as const)
        : deltaPercent < 0
          ? ("down" as const)
          : ("neutral" as const),
  };
}

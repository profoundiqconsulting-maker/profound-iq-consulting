export type AchievementBadge = {
  id: string;
  courseSlug: string;
  courseTitle: string;
  moduleId: string;
  moduleIndex: number;
  moduleTitle: string;
  completedLessons: number;
  totalLessons: number;
  quizScore: number;
  earnedAt: string;
  certificateLabel: string;
};

export type AchievementLeaderboardRow = {
  rank: number;
  displayName: string;
  earnedBadges: number;
  completedCourses: number;
  totalBadges: number;
};

export function normalizeLeaderboardDisplayName(name: string | null | undefined, fallback = "Respondent") {
  const cleaned = (name ?? "").replace(/[^a-zA-Z0-9 ._-]/g, "").trim().slice(0, 80);
  return cleaned || fallback;
}

export function rankAchievementLeaderboard(rows: Array<Omit<AchievementLeaderboardRow, "rank">>) {
  return [...rows]
    .sort((a, b) => b.earnedBadges - a.earnedBadges || b.completedCourses - a.completedCourses || a.displayName.localeCompare(b.displayName))
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

export function achievementBadgeFilename(badge: Pick<AchievementBadge, "courseSlug" | "moduleIndex">) {
  return `profound-iq-${badge.courseSlug}-module-${badge.moduleIndex + 1}-badge.svg`;
}

export function achievementMiniCertificateFilename(badge: Pick<AchievementBadge, "courseSlug" | "moduleIndex">) {
  return `profound-iq-${badge.courseSlug}-module-${badge.moduleIndex + 1}-certificate.svg`;
}

export function buildAchievementBadgeSvg(badge: AchievementBadge, variant: "badge" | "certificate" = "badge") {
  const title = escapeXml(badge.moduleTitle);
  const course = escapeXml(badge.courseTitle);
  const date = escapeXml(new Date(badge.earnedAt).toLocaleDateString());
  const width = variant === "certificate" ? 1200 : 900;
  const height = variant === "certificate" ? 675 : 900;
  const center = width / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${title} module completion ${variant}"><rect width="${width}" height="${height}" fill="#f7f3e8"/><rect x="24" y="24" width="${width - 48}" height="${height - 48}" fill="none" stroke="#c9a34e" stroke-width="4"/><circle cx="${center}" cy="${variant === "certificate" ? 170 : 250}" r="${variant === "certificate" ? 92 : 128}" fill="#16243d" stroke="#c9a34e" stroke-width="8"/><path d="M${center - 28} ${variant === "certificate" ? 170 : 250}l20 20 42-50" fill="none" stroke="#f7f3e8" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/><text x="${center}" y="${variant === "certificate" ? 315 : 430}" text-anchor="middle" fill="#16243d" font-family="Georgia,serif" font-size="${variant === "certificate" ? 42 : 48}" font-weight="700">MODULE COMPLETION</text><text x="${center}" y="${variant === "certificate" ? 375 : 500}" text-anchor="middle" fill="#a27e2e" font-family="Arial,sans-serif" font-size="30" letter-spacing="4">PROFOUND IQ CONSULTING</text><text x="${center}" y="${variant === "certificate" ? 450 : 590}" text-anchor="middle" fill="#16243d" font-family="Georgia,serif" font-size="${variant === "certificate" ? 52 : 44}" font-weight="700">${title}</text><text x="${center}" y="${variant === "certificate" ? 505 : 650}" text-anchor="middle" fill="#4a566a" font-family="Arial,sans-serif" font-size="25">${course}</text><text x="${center}" y="${variant === "certificate" ? 570 : 720}" text-anchor="middle" fill="#657084" font-family="Arial,sans-serif" font-size="22">Earned ${date} · Quiz passed at ${badge.quizScore}%</text><text x="${center}" y="${variant === "certificate" ? 625 : 790}" text-anchor="middle" fill="#a27e2e" font-family="Arial,sans-serif" font-size="18" letter-spacing="2">${escapeXml(badge.certificateLabel)}</text></svg>`;
}

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character] ?? character);
}

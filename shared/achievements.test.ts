import { describe, expect, it } from "vitest";
import {
  achievementBadgeFilename,
  achievementMiniCertificateFilename,
  buildAchievementBadgeSvg,
  normalizeLeaderboardDisplayName,
  rankAchievementLeaderboard,
  type AchievementBadge,
} from "./achievements";

describe("achievement contracts", () => {
  const badge: AchievementBadge = {
    id: "1-module-1",
    courseSlug: "lead-with-clarity",
    courseTitle: "Lead with Clarity",
    moduleId: "module-1",
    moduleIndex: 0,
    moduleTitle: "Orientation",
    completedLessons: 7,
    totalLessons: 7,
    quizScore: 80,
    earnedAt: "2026-08-24T00:00:00.000Z",
    certificateLabel: "Module 1 of 10",
  };

  it("sanitizes leaderboard display names and falls back safely", () => {
    expect(normalizeLeaderboardDisplayName("  Amina <script>  ")).toBe(
      "Amina script"
    );
    expect(normalizeLeaderboardDisplayName("", "Private learner")).toBe(
      "Private learner"
    );
  });

  it("ranks opted-in learners by badges, then courses, then name", () => {
    expect(
      rankAchievementLeaderboard(
        [
          {
            displayName: "Beta",
            earnedBadges: 2,
            completedCourses: 1,
            totalBadges: 10,
          },
          {
            displayName: "Alpha",
            earnedBadges: 2,
            completedCourses: 1,
            totalBadges: 10,
          },
          {
            displayName: "Gamma",
            earnedBadges: 1,
            completedCourses: 2,
            totalBadges: 10,
          },
        ].map(
          ({ displayName, earnedBadges, completedCourses, totalBadges }) => ({
            displayName,
            earnedBadges,
            completedCourses,
            totalBadges,
          })
        )
      ).map(row => row.displayName)
    ).toEqual(["Alpha", "Beta", "Gamma"]);
  });

  it("creates branded badge and mini-certificate SVG payloads without raw markup injection", () => {
    const svg = buildAchievementBadgeSvg(badge);
    const certificate = buildAchievementBadgeSvg(badge, "certificate");
    expect(svg).toContain("MODULE COMPLETION");
    expect(certificate).toContain("Lead with Clarity");
    expect(svg).not.toContain("<script");
    expect(achievementBadgeFilename(badge)).toContain("badge.svg");
    expect(achievementMiniCertificateFilename(badge)).toContain(
      "certificate.svg"
    );
  });
});

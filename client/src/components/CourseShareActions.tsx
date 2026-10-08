/* Profound IQ Consulting — compact share rail with accessible actions. */
import { PUBLISHED_SITE_ORIGIN } from "@shared/siteOrigin";

import { SocialSharing, type SocialPlatform } from "./SocialSharing";

type CourseShareActionsProps = {
  courseSlug?: string;
  courseTitle: string;
  shareUrl?: string;
  shareLabel?: string;
  pagePath?: string;
  platforms?: SocialPlatform[];
};

export function CourseShareActions({
  courseSlug,
  courseTitle,
  shareUrl: providedShareUrl,
  shareLabel,
  pagePath,
  platforms,
}: CourseShareActionsProps) {
  const getShareUrl = () =>
    providedShareUrl ??
    `${PUBLISHED_SITE_ORIGIN}/courses/${encodeURIComponent(courseSlug ?? "")}`;

  return (
    <SocialSharing
      url={getShareUrl()}
      title={courseTitle}
      summary={`${courseTitle} — Profound IQ Consulting.`}
      platforms={platforms}
      label={shareLabel}
    />
  );
}
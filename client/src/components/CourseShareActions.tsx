/* Profound IQ Consulting — compact share rail with accessible actions. */
import { PUBLISHED_SITE_ORIGIN } from "@shared/siteOrigin";

import { SocialSharing } from "./SocialSharing";

type CourseShareActionsProps = {
  courseSlug?: string;
  courseTitle: string;
  shareUrl?: string;
  shareLabel?: string;
  pagePath?: string;
};

export function CourseShareActions({
  courseSlug,
  courseTitle,
  shareUrl: providedShareUrl,
  shareLabel,
  pagePath,
}: CourseShareActionsProps) {
  const getShareUrl = () =>
    providedShareUrl ??
    `${PUBLISHED_SITE_ORIGIN}/courses/${encodeURIComponent(courseSlug ?? "")}`;

  return (
    <SocialSharing
      url={getShareUrl()}
      title={courseTitle}
      summary={`${courseTitle} — Profound IQ Consulting.`}
      platforms={["linkedin", "x", "facebook", "whatsapp", "email", "copy", "native"]}
      label={shareLabel}
          onShare={platform => {
        if (typeof window !== "undefined") {
          // Analytics hook point for course_shared events.
          void platform;
        }
      }}
    />
  );
}
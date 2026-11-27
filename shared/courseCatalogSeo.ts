export const COURSE_CATALOG_TITLE =
  "Professional Courses | Profound IQ Consulting";
export const COURSE_CATALOG_DESCRIPTION =
  "Explore globally relevant professional courses with interactive lessons, applied practice, quizzes, and completion certificates.";

/**
 * `/courses` is the interactive catalogue page. The server-rendered listing at
 * `/courses/catalogue` is a text-first variant of the same content, so it
 * canonicalises back here instead of competing for the same query.
 */
export const COURSE_CATALOG_PATH = "/courses";
export const COURSE_CATALOG_LISTING_PATH = "/courses/catalogue";

export const courseCatalogCanonical = (origin: string) =>
  `${origin}${COURSE_CATALOG_PATH}`;

export const courseCatalogListingUrl = (origin: string) =>
  `${origin}${COURSE_CATALOG_LISTING_PATH}`;

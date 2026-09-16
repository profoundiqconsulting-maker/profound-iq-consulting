const DEFAULT_SITE_ORIGIN = "https://profoundiqconsulting.com";

export const PUBLISHED_SITE_ORIGIN =
  typeof window === "undefined"
    ? (process.env.PUBLIC_SITE_ORIGIN ?? DEFAULT_SITE_ORIGIN)
    : window.location.origin;

export function publishedSiteUrl(path = "") {
  return `${PUBLISHED_SITE_ORIGIN}${path.startsWith("/") || path.length === 0 ? path : `/${path}`}`;
}

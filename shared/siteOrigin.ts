export const PUBLISHED_SITE_ORIGIN = "https://profoundiq-vguqrhsm.manus.space";

export function publishedSiteUrl(path = "") {
  return `${PUBLISHED_SITE_ORIGIN}${path.startsWith("/") || path.length === 0 ? path : `/${path}`}`;
}

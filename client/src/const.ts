export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Start the local credential sign-in flow from an event handler or effect.
export const startLogin = (returnTo?: string) => {
  const currentRoute = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const requestedReturnTo = returnTo ?? currentRoute;
  const safeReturnTo =
    requestedReturnTo.startsWith("/") &&
    !requestedReturnTo.startsWith("//") &&
    !requestedReturnTo.includes("\\")
      ? requestedReturnTo
      : "/";
  window.location.assign(
    `/auth?mode=login&returnTo=${encodeURIComponent(safeReturnTo)}`
  );
};

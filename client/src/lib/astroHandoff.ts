const resolveTarget = (url: string | URL | null | undefined) => {
  const base = window.location.href;
  try {
    return new URL(url ?? base, base);
  } catch {
    return new URL(base);
  }
};

/**
 * Bridges a statically rendered Astro page to the client-routed React app.
 *
 * Routes the Astro shell owns keep SPA behaviour: the history entry is written
 * and a `popstate` event lets wouter re-render in place. Anything outside the
 * owned routes belongs to the React bundle, so it hands off with a real
 * navigation instead of leaving a stale island on screen.
 */
export const installAstroRouteHandoff = (ownedRoutes: RegExp) => {
  const originalPushState = window.history.pushState.bind(window.history);
  const originalReplaceState = window.history.replaceState.bind(window.history);

  let handoff: string | null = null;

  const syncRouter = () => {
    queueMicrotask(() => {
      if (handoff) return;
      window.dispatchEvent(
        new PopStateEvent("popstate", { state: window.history.state })
      );
    });
  };

  const handle = (
    original: typeof window.history.pushState,
    data: unknown,
    unused: string,
    url?: string | URL | null
  ) => {
    const target = resolveTarget(url);
    if (!ownedRoutes.test(target.pathname)) {
      handoff = target.href;
      window.location.assign(target.href);
      return;
    }
    original(data, unused, target.href);
    syncRouter();
  };

  window.history.pushState = function patchedPushState(data, unused, url) {
    handle(originalPushState, data, unused, url);
  } as typeof window.history.pushState;

  window.history.replaceState = function patchedReplaceState(
    data,
    unused,
    url
  ) {
    handle(originalReplaceState, data, unused, url);
  } as typeof window.history.replaceState;

  return () => {
    window.history.pushState = originalPushState;
    window.history.replaceState = originalReplaceState;
  };
};

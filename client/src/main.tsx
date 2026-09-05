import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot, type Root } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import "./index.css";
import "./executive-header.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: false,
    },
  },
});

let isLoggingOut = false;

export const setLoggingOut = (value: boolean) => {
  isLoggingOut = value;
};

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  if (isLoggingOut) return;

  const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  window.location.assign(`/auth?mode=login&returnTo=${encodeURIComponent(returnTo)}`);
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

async function fetchWithTransientRetry(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const retryableStatuses = new Set([502, 503, 504]);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await globalThis.fetch(input, init);
    if (!retryableStatuses.has(response.status) || attempt === 2) return response;
    await new Promise((resolve) => window.setTimeout(resolve, 120 * (attempt + 1)));
  }
  return globalThis.fetch(input, init);
}

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      headers() {
        return {};
      },
      fetch(input, init) {
        return fetchWithTransientRetry(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

const rootElement = document.getElementById("root");
const root: Root | null = rootElement ? (rootElement as any)._reactRoot ?? (() => {
  const instance = createRoot(rootElement);
  (rootElement as any)._reactRoot = instance;
  return instance;
})() : null;

root?.render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);

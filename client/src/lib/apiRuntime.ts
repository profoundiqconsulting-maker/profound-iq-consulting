import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from "@shared/const";
import { QueryClient, type QueryClient as QueryClientType } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import superjson from "superjson";

let isLoggingOut = false;

export const setLoggingOut = (value: boolean) => {
  isLoggingOut = value;
};

export const createAppQueryClient = () =>
  new QueryClient({
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

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  if (isLoggingOut) return;

  const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  window.location.assign(
    `/auth?mode=login&returnTo=${encodeURIComponent(returnTo)}`
  );
};

export const installUnauthorizedRedirectHandlers = (queryClient: QueryClientType) => {
  queryClient.getQueryCache().subscribe((event) => {
    if (event.type === "updated" && event.action.type === "error") {
      redirectToLoginIfUnauthorized(event.query.state.error);
      console.error("[API Query Error]", event.query.state.error);
    }
  });

  queryClient.getMutationCache().subscribe((event) => {
    if (event.type === "updated" && event.action.type === "error") {
      redirectToLoginIfUnauthorized(event.mutation.state.error);
      console.error("[API Mutation Error]", event.mutation.state.error);
    }
  });
};

async function fetchWithTransientRetry(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const retryableStatuses = new Set([502, 503, 504]);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await globalThis.fetch(input, init);
    if (!retryableStatuses.has(response.status) || attempt === 2)
      return response;
    await new Promise((resolve) =>
      window.setTimeout(resolve, 120 * (attempt + 1))
    );
  }
  return globalThis.fetch(input, init);
}

export const createAppTrpcClient = () =>
  trpc.createClient({
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

import { trpc } from "@/lib/trpc";
import {
  createAppQueryClient,
  createAppTrpcClient,
  installUnauthorizedRedirectHandlers,
} from "@/lib/apiRuntime";
import { QueryClientProvider } from "@tanstack/react-query";
import { createRoot, type Root } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./executive-header.css";

const queryClient = createAppQueryClient();

installUnauthorizedRedirectHandlers(queryClient);

const trpcClient = createAppTrpcClient();

const rootElement = document.getElementById("root");
const root: Root | null = rootElement
  ? ((rootElement as any)._reactRoot ??
    (() => {
      const instance = createRoot(rootElement);
      (rootElement as any)._reactRoot = instance;
      return instance;
    })())
  : null;

root?.render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);

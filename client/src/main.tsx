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
import { registerWebMcpTools } from "@/lib/webMcp";

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

// Trusted Types bootstrap. CSP `require-trusted-types-for 'script'` (see
// server/_core/index.ts) locks DOM XSS sinks such as innerHTML,
// insertAdjacentHTML, and document.write. Register a default policy before
// React renders so the app's own sinks (JSON-LD structured data, Recharts
// theme injection, and print/preview popups) keep working.
// TODO(hardening): replace this pass-through with a sanitizing policy that
// only permits the exact HTML the app generates, rather than trusting all
// strings. Until then this keeps enforcement on without breaking features.
if (typeof window !== "undefined" && "trustedTypes" in window) {
  try {
    (
      window as unknown as {
        trustedTypes: {
          createPolicy: (
            name: string,
            rules: Record<string, (input: string) => string>
          ) => unknown;
        };
      }
    ).trustedTypes.createPolicy("default", {
      createHTML: (input: string) => input,
      createScript: (input: string) => input,
      createScriptURL: (input: string) => input,
    });
  } catch {
    /* a "default" policy is already registered */
  }
}

root?.render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);

// WebMCP (Web Model Context Protocol) progressive enhancement — feature
// detected and no-op where unsupported. See lib/webMcp.ts.
registerWebMcpTools();

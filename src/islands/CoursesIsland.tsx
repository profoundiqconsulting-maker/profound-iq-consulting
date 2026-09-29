import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { installAstroRouteHandoff } from "@/lib/astroHandoff";
import {
  createAppQueryClient,
  createAppTrpcClient,
  installUnauthorizedRedirectHandlers,
} from "@/lib/apiRuntime";
import { trpc } from "@/lib/trpc";
import Courses from "@/pages/Courses";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Router } from "wouter";

import "@/index.css";
import "@/executive-header.css";

const ASTRO_OWNED_ROUTES = /^\/courses\/?$/;

let sharedQueryClient: QueryClient | undefined;
let handlersInstalled = false;

const getQueryClient = () => {
  if (!sharedQueryClient) {
    sharedQueryClient = createAppQueryClient();
    if (typeof window !== "undefined" && !handlersInstalled) {
      installUnauthorizedRedirectHandlers(sharedQueryClient);
      handlersInstalled = true;
    }
  }
  return sharedQueryClient;
};

function AstroRouteHandoff() {
  useEffect(() => installAstroRouteHandoff(ASTRO_OWNED_ROUTES), []);
  return null;
}

export default function CoursesIsland({ ssrPath }: { ssrPath: string }) {
  const [queryClient] = useState(getQueryClient);
  const [trpcClient] = useState(createAppTrpcClient);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Router ssrPath={ssrPath}>
          <ThemeProvider defaultTheme="light" switchable>
            <TooltipProvider>
              <AstroRouteHandoff />
              <Toaster />
              <Courses />
            </TooltipProvider>
          </ThemeProvider>
        </Router>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

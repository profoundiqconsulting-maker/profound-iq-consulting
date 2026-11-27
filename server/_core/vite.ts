import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";

/**
 * Strip cache headers for HTML responses so the browser revalidates on reload
 * and when navigating via the back/forward button. This is the most reliable
 * way to avoid stale SPA shells being served from the HTTP cache.
 */
function noCacheHtmlMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const acceptsHtml =
    typeof req.headers.accept === "string" &&
    req.headers.accept.includes("text/html");
  if (req.method === "GET" && acceptsHtml) {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  }
  next();
}

/**
 * Locate the Astro static output. The production bundle runs from `dist/`, while
 * the dev server runs from `server/_core/`, so both roots are probed.
 */
function resolveAstroDist() {
  const candidates = [
    path.resolve(import.meta.dirname, "astro"),
    path.resolve(import.meta.dirname, "../..", "dist", "astro"),
  ];
  return candidates.find(candidate => fs.existsSync(candidate)) ?? null;
}

function serveAstroRoutes(app: Express) {
  const astroPath = resolveAstroDist();
  if (!astroPath) return;
  app.use(express.static(astroPath, { extensions: ["html"] }));
}

export async function setupVite(app: Express, server: Server) {
  const { createServer: createViteServer } = await import("vite");
  const viteConfigPath = "../../vite.config";
  const viteConfigModule = await import(viteConfigPath);
  const viteConfig =
    typeof viteConfigModule.default === "function"
      ? viteConfigModule.default({ mode: "development" })
      : viteConfigModule.default;

  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  // Install no-cache headers for HTML before any other middleware
  app.use(noCacheHtmlMiddleware);
  app.use(vite.middlewares);
  // Astro owns the statically rendered routes that sit outside the client
  // router, so they must resolve before the SPA shell claims them.
  serveAstroRoutes(app);
  app.use(async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      const nonce = (res.locals?.cspNonce as string | undefined) ?? "";
      const securedPage = page.replace(
        /<script\b/g,
        `<script nonce="${nonce}"`
      );
      res
        .status(200)
        .set({
          "Content-Type": "text/html",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        })
        .end(securedPage);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express, distPath?: string) {
  const resolvedDistPath =
    distPath ??
    (process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public"));
  if (!fs.existsSync(resolvedDistPath)) {
    console.error(
      `Could not find the build directory: ${resolvedDistPath}, make sure to build the client first`
    );
  }

  // Install no-cache headers for HTML before serving static files
  app.use(noCacheHtmlMiddleware);

  // Astro owns the statically rendered routes that sit outside the client
  // router, so they are served before the SPA bundle claims them.
  serveAstroRoutes(app);

  // Serve static assets with appropriate cache headers
  // - Hashed assets (with hash in filename) get long-term caching
  // - Non-hashed assets get short-term caching with revalidation
  app.use(
    express.static(resolvedDistPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          res.setHeader("Pragma", "no-cache");
          res.setHeader("Expires", "0");
        } else if (
          filePath.match(
            /\.(js|css|woff2?|ttf|eot|svg|png|jpg|jpeg|gif|webp|ico)$/i
          )
        ) {
          // Long cache for hashed/static assets (1 year)
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    })
  );

  // fall through to index.html if the file doesn't exist (SPA routing)
  app.use("/{*path}", (_req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.sendFile(path.resolve(resolvedDistPath, "index.html"));
  });
}

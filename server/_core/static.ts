import express, { type Express } from "express";
import fs from "fs";
import path from "path";

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

function resolveAstroDist() {
  const candidates = [
    path.resolve(import.meta.dirname, "astro"),
    path.resolve(import.meta.dirname, "../dist", "astro"),
  ];

  return candidates.find(candidate => fs.existsSync(candidate)) ?? null;
}

function serveAstroRoutes(app: Express) {
  const astroPath = resolveAstroDist();

  if (!astroPath) {
    return;
  }

  app.use(express.static(astroPath, { extensions: ["html"] }));
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(noCacheHtmlMiddleware);

  // Astro owns statically rendered routes.
  serveAstroRoutes(app);

  // Serve Vite-built client assets.
  app.use(
    express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) {
          res.setHeader(
            "Cache-Control",
            "no-cache, no-store, must-revalidate"
          );
          res.setHeader("Pragma", "no-cache");
          res.setHeader("Expires", "0");
        } else if (
          filePath.match(
            /\.(js|css|woff2?|ttf|eot|svg|png|jpg|jpeg|gif|webp|ico)$/i
          )
        ) {
          res.setHeader(
            "Cache-Control",
            "public, max-age=31536000, immutable"
          );
        }
      },
    })
  );

  // SPA fallback.
  app.use("*", (_req, res) => {
    res.setHeader(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

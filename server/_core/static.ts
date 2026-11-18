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
    path.resolve(import.meta.dirname, "../..", "dist", "astro"),
  ];

  return candidates.find(candidate => fs.existsSync(candidate)) ?? null;
}

function serveAstroRoutes(app: Express) {
  const astroPath = resolveAstroDist();

  if (!astroPath) {
    return;
  }

  // Serve Astro HTML through Express so CSP nonces can be injected.
  app.use(async (req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      return next();
    }

    const acceptsHtml =
      typeof req.headers.accept === "string" &&
      req.headers.accept.includes("text/html");

    if (!acceptsHtml) {
      return next();
    }

    try {
      const pathname = decodeURIComponent(req.path);
      const relativePath = pathname.replace(/^\/+/, "");
      const candidates = [
        path.resolve(astroPath, relativePath, "index.html"),
        path.resolve(astroPath, `${relativePath}.html`),
      ];

      const htmlPath = candidates.find(candidate =>
        candidate.startsWith(`${astroPath}${path.sep}`) &&
        fs.existsSync(candidate) &&
        fs.statSync(candidate).isFile()
      );

      if (!htmlPath) {
        return next();
      }

      const html = await fs.promises.readFile(htmlPath, "utf-8");
      const nonce = res.locals.cspNonce;

      const output = nonce
        ? html.replace(
            /<script\b(?![^>]*\bnonce\s*=)/gi,
            `<script nonce="${nonce}"`
          )
        : html;

      res.type("html");
      res.setHeader(
        "Cache-Control",
        "no-cache, no-store, must-revalidate"
      );
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");

      if (req.method === "HEAD") {
        return res.status(200).end();
      }

      return res.send(output);
    } catch (error) {
      return next(error);
    }
  });

  // Continue serving Astro assets normally.
  app.use(express.static(astroPath, { extensions: ["html"] }));
}

export function serveStatic(app: Express, distPath?: string) {
  const resolvedDistPath = distPath ?? path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(resolvedDistPath)) {
    console.error(
      `Could not find the build directory: ${resolvedDistPath}, make sure to build the client first`
    );
  }

  app.use(noCacheHtmlMiddleware);

  // AI-agent discoverability manifests. express.static ignores dot-prefixed
  // paths by default (and the bundled `send` doesn't accept a dotfiles policy
  // fn), so serve these well-known files via explicit routes with correct
  // content types before the SPA fallback can claim them.
  app.get("/.well-known/ai-catalog.json", (_req, res) => {
    res.type("application/ai-catalog+json");
    res.sendFile(path.resolve(resolvedDistPath, ".well-known", "ai-catalog.json"), {
      dotfiles: "allow",
    });
  });
  app.get("/llms.txt", (_req, res) => {
    res.type("text/markdown");
    res.sendFile(path.resolve(resolvedDistPath, "llms.txt"));
  });

  // Astro owns statically rendered routes.
  serveAstroRoutes(app);

  // Serve Vite-built client assets.
  app.use(
    express.static(resolvedDistPath, {
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
  app.use((_req, res) => {
    res.setHeader(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    res.sendFile(path.resolve(resolvedDistPath, "index.html"));
  });
}

import "dotenv/config";
import path from "path";
import fs from "node:fs";
import crypto from "node:crypto";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { registerPaystackWebhook } from "../paystackWebhook";
import { registerWeeklyEnrollmentExport } from "../scheduledEnrollmentExport";
import { registerBiweeklyNewsletter } from "../scheduledNewsletter";
import { registerDeliveryLogExportWorker } from "../deliveryLogExport";
import { registerWeeklyPsychometricAnalytics } from "../scheduledPsychometricAnalytics";
import { registerWeeklyCourseLessonReviewAnalytics } from "../scheduledCourseLessonReviewAnalytics";
import { verifySmtpConnection, getSmtpConfig } from "../email";
import { serveStatic } from "./static";
import { registerSeoRoutes } from "../seoRoutes";
import { ensureAdminUser, getDb } from "../db";
import { paystackRequest } from "./paystack";
import {
  assessmentAttempts,
  psychometricAttempts,
  careerPathAttempts,
  courseEnrollments,
} from "../../drizzle/schema";

export let criticalCssCache: string | null = null;
export let preloadLinksCache: string | null = null;

export function loadCriticalAssets() {
  if (criticalCssCache && preloadLinksCache) return;
  try {
    const publicDir = path.resolve(import.meta.dirname, "public");
    const assetsDir = path.join(publicDir, "assets");
    if (fs.existsSync(assetsDir)) {
      const files = fs.readdirSync(assetsDir);
      const cssFiles = files.filter(f => f.endsWith(".css") && f.startsWith("index-"));
      const jsFiles = files.filter(f => f.endsWith(".js") && f.startsWith("index-"));
      
      // Load critical CSS (inline the main CSS)
      if (cssFiles.length > 0) {
        const cssPath = path.join(assetsDir, cssFiles[0]);
        criticalCssCache = fs.readFileSync(cssPath, "utf-8");
      }
      
      // Generate preload links for critical JS chunks
      const preloadLinks: string[] = [];
      if (jsFiles.length > 0) {
        preloadLinks.push(`<link rel="modulepreload" href="/assets/${jsFiles[0]}" crossorigin>`);
      }
      // Preload vendor chunks that are likely needed early
      const vendorFiles = files.filter(f => f.endsWith(".js") && f.startsWith("vendor-"));
      for (const vf of vendorFiles.slice(0, 3)) {
        preloadLinks.push(`<link rel="modulepreload" href="/assets/${vf}" crossorigin>`);
      }
      preloadLinksCache = preloadLinks.join("\n");
    }
  } catch {
    criticalCssCache = "";
    preloadLinksCache = "";
  }
}

export function injectCriticalAssets(html: string): string {
  loadCriticalAssets();
  if (criticalCssCache) {
    const styleTag = `<style>${criticalCssCache}</style>`;
    html = html.replace("</head>", `${styleTag}\n</head>`);
    // Convert render-blocking stylesheet to non-blocking (loads async after critical CSS)
    html = html.replace(
      /<link rel="stylesheet"([^>]*href="\/assets\/index-[^"]*\.css"[^>]*)>/,
      '<link rel="preload" as="style"$1 onload="this.onload=null;this.rel=\'stylesheet\'"><noscript><link rel="stylesheet"$1></noscript>'
    );
  }
  if (preloadLinksCache) {
    html = html.replace("</head>", `${preloadLinksCache}\n</head>`);
  }
  return html;
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Content Security Policy (XSS hardening). A per-request nonce backs the
  // single inline SPA bootstrap script and the self-origin bundle; no
  // 'unsafe-inline'/'unsafe-eval' is used in script-src, so the policy is
  // effective against injected scripts. The analytics origin is allowlisted
  // only when configured. The nonce is injected into HTML <script> tags served
  // from disk (SPA shell) so the inline bootstrap keeps executing.
  app.use((req, res, next) => {
    const nonce = crypto.randomBytes(16).toString("base64");
    res.locals.cspNonce = nonce;
    const isDev = process.env.NODE_ENV !== "production";
    const analyticsOrigin = process.env.VITE_ANALYTICS_ENDPOINT;
    // Dev runs Vite, which injects inline scripts (HMR client, React refresh)
    // via its own HTML fallback — ahead of this middleware — so a strict nonce
    // policy can't cover them and would break HMR. Relax script-src (and skip
    // trusted-types) in dev; production keeps the strict, nonce-backed,
    // XSS-effective policy injected into the served SPA shell.
    let scriptSrc = isDev
      ? `'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co`
      : `'self' 'nonce-${nonce}' https://js.paystack.co`;
    let connectSrc = "'self' https://api.paystack.co https://js.paystack.co";
    if (analyticsOrigin) {
      try {
        const origin = new URL(analyticsOrigin).origin;
        scriptSrc += ` ${origin}`;
        connectSrc += ` ${origin}`;
      } catch {
        /* ignore malformed analytics endpoint */
      }
    }
    const csp = [
      "default-src 'self'",
      `script-src ${scriptSrc}`,
      ...(isDev ? [] : ["require-trusted-types-for 'script'"]),
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self' data:",
      `connect-src ${connectSrc}`,
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "frame-src 'self' https://api.paystack.co https://js.paystack.co",
    ].join("; ");
    res.setHeader("Content-Security-Policy", csp);
    // Strong HSTS: force HTTPS for a year across subdomains. Browsers ignore
    // this on plain-HTTP responses (per RFC 6797), so setting it
    // unconditionally is safe whether or not TLS is terminated upstream.
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
    // Isolate the top-level window from cross-origin openers while still
    // allowing popups this page opens (payments/auth) to keep references.
    res.setHeader(
      "Cross-Origin-Opener-Policy",
      "same-origin-allow-popups"
    );
    // Clickjacking protection. CSP `frame-ancestors 'self'` (above) is the
    // modern control; X-Frame-Options backs it up for browsers/proxies that
    // don't honor CSP framing directives. SAMEORIGIN matches frame-ancestors.
    res.setHeader("X-Frame-Options", "SAMEORIGIN");

    const injectNonce = (html: string) =>
      injectCriticalAssets(
        html.replace(
          /<script\b(?![^>]*\bnonce\s*=)/gi,
          `<script nonce="${nonce}"`
        )
      );

    // Inject the nonce into HTML generated by SEO routes using res.send().
    const originalSend = res.send.bind(res);
    res.send = ((body?: unknown) => {
      const contentType = String(res.getHeader("Content-Type") || "");
      if (
        typeof body === "string" &&
        /^text\/html\b/i.test(contentType)
      ) {
        return originalSend(injectNonce(body));
      }
      return originalSend(body as any);
    }) as typeof res.send;

    const originalSendFile = res.sendFile.bind(res);
    res.sendFile = ((filePath: unknown, options?: unknown) => {
      if (typeof filePath === "string" && filePath.endsWith(".html")) {
        const resolved = path.isAbsolute(filePath)
          ? filePath
          : path.resolve(
              ((options as { root?: string })?.root) || process.cwd(),
              filePath
            );
        fs.promises.readFile(resolved, "utf-8")
          .then(html => {
            res.type("html");
            res.setHeader(
              "Cache-Control",
              "no-cache, no-store, must-revalidate"
            );
            res.send(injectNonce(html));
          })
          .catch(next);
        return res;
      }
      return (originalSendFile as (p: string, o?: unknown) => unknown)(
        filePath as string,
        options
      );
    }) as typeof res.sendFile;

    next();
  });

  try {
    await ensureAdminUser();
  } catch (error) {
    console.error("[Bootstrap] Admin user ensure failed:", error);
  }
  try {
    const emailConfig = getSmtpConfig();
    await verifySmtpConnection();
    console.log(`[Email] Resend connection verified for ${emailConfig.from}`);
  } catch (error) {
    console.error("[Email] Resend connection failed:", error);
  }
  registerPaystackWebhook(app);
  registerWeeklyEnrollmentExport(app);
  registerBiweeklyNewsletter(app);
  registerDeliveryLogExportWorker(app);
  registerWeeklyPsychometricAnalytics(app);
  registerWeeklyCourseLessonReviewAnalytics(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  // Unified checkout initialization endpoint for CheckoutForm component
  app.post("/api/checkout/initialize", express.json(), async (req, res) => {
    try {
      const { productType, productSlug, productName, amountKes, customerName, customerEmail, upsellIds = [], returnUrl } = req.body;

      if (!productType || !productName || !amountKes || !customerEmail) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const db = await getDb();
      if (!db) {
        return res.status(503).json({ message: "Database temporarily unavailable" });
      }

      let result: { accessCode: string; reference: string; amountKes: number; authorizationUrl?: string } | null = null;

      switch (productType) {
        case "assessment": {
          const reference = `piq-assessment-${Date.now()}-${Math.random().toString(36).replace(/[^a-zA-Z0-9]/g, "").slice(0, 10)}`;
          const payment = await paystackRequest("/transaction/initialize", {
            method: "POST",
            body: JSON.stringify({
              amount: amountKes * 100,
              currency: "KES",
              email: customerEmail,
              reference,
              callback_url: `${process.env.PUBLISHED_SITE_ORIGIN || "https://profoundiqconsulting.com"}/assessment?payment=success&reference=${encodeURIComponent(reference)}`,
              metadata: JSON.stringify({ product_type: "assessment", product_name: productName }),
            }),
          });
          const accessCode = payment.data as { access_code?: string; authorization_url?: string };
          // Store attempt in DB
          await db.insert(assessmentAttempts).values({
            paystackReference: reference,
            name: customerName,
            email: customerEmail,
            answers: {},
            paymentStatus: "pending",
            consentedAt: new Date(),
          });
          result = { accessCode: accessCode.access_code as string, reference, amountKes, authorizationUrl: accessCode.authorization_url as string };
          break;
        }
        case "psychometric": {
          if (!productSlug) return res.status(400).json({ message: "productSlug required for psychometric" });
          const reference = `piq-psychometric-${Date.now()}-${Math.random().toString(36).replace(/[^a-zA-Z0-9]/g, "").slice(0, 10)}`;
          const payment = await paystackRequest("/transaction/initialize", {
            method: "POST",
            body: JSON.stringify({
              amount: amountKes * 100,
              currency: "KES",
              email: customerEmail,
              reference,
              callback_url: `${process.env.PUBLISHED_SITE_ORIGIN || "https://profoundiqconsulting.com"}/psychometrics/${productSlug}?payment=success&reference=${encodeURIComponent(reference)}`,
              metadata: JSON.stringify({ product_type: "psychometric", product_name: productName, test_slug: productSlug }),
            }),
          });
          const accessCode = payment.data as { access_code?: string; authorization_url?: string };
          await db.insert(psychometricAttempts).values({
            paystackReference: reference,
            testSlug: productSlug,
            name: customerName,
            email: customerEmail,
            answers: {},
            paymentStatus: "pending",
            consentedAt: new Date(),
          });
          result = { accessCode: accessCode.access_code as string, reference, amountKes, authorizationUrl: accessCode.authorization_url as string };
          break;
        }
        case "careerpath": {
          const reference = `piq-careerpath-${Date.now()}-${Math.random().toString(36).replace(/[^a-zA-Z0-9]/g, "").slice(0, 10)}`;
          const payment = await paystackRequest("/transaction/initialize", {
            method: "POST",
            body: JSON.stringify({
              amount: amountKes * 100,
              currency: "KES",
              email: customerEmail,
              reference,
              callback_url: `${process.env.PUBLISHED_SITE_ORIGIN || "https://profoundiqconsulting.com"}/careerpath?payment=success&reference=${encodeURIComponent(reference)}`,
              metadata: JSON.stringify({ product_type: "careerpath", product_name: productName }),
            }),
          });
          const accessCode = payment.data as { access_code?: string; authorization_url?: string };
          await db.insert(careerPathAttempts).values({
            paystackReference: reference,
            name: customerName,
            email: customerEmail,
            answers: {},
            paymentStatus: "pending",
            consentedAt: new Date(),
          });
          result = { accessCode: accessCode.access_code as string, reference, amountKes, authorizationUrl: accessCode.authorization_url as string };
          break;
        }
        case "course_stage": {
          if (!productSlug) return res.status(400).json({ message: "productSlug required for course" });
          // For courses, we need to find the enrollment
          // This is a simplified version - in production you'd look up the user's enrollment
          const reference = `piq-course-${Date.now()}-${Math.random().toString(36).replace(/[^a-zA-Z0-9]/g, "").slice(0, 10)}`;
          const payment = await paystackRequest("/transaction/initialize", {
            method: "POST",
            body: JSON.stringify({
              amount: amountKes * 100,
              currency: "KES",
              email: customerEmail,
              reference,
              callback_url: `${process.env.PUBLISHED_SITE_ORIGIN || "https://profoundiqconsulting.com"}/courses/${productSlug}?payment=success&reference=${encodeURIComponent(reference)}`,
              metadata: JSON.stringify({ product_type: "course_stage", product_name: productName, course_slug: productSlug, upsell_ids: upsellIds }),
            }),
          });
          const accessCode = payment.data as { access_code?: string; authorization_url?: string };
          result = { accessCode: accessCode.access_code as string, reference, amountKes, authorizationUrl: accessCode.authorization_url as string };
          break;
        }
        default:
          return res.status(400).json({ message: `Unknown product type: ${productType}` });
      }

      if (!result) {
        return res.status(500).json({ message: "Failed to initialize payment" });
      }

      return res.json({
        accessCode: result.accessCode,
        reference: result.reference,
        amountKes: result.amountKes,
        productName: result.authorizationUrl ? productName : productName,
        productType,
        testSlug: productSlug,
      });
    } catch (error) {
      console.error("[Checkout Initialize] Error:", error);
      return res.status(500).json({ message: error instanceof Error ? error.message : "Payment initialization failed" });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // Keep API failures JSON-shaped even when a path is mistyped or a deployment
  // proxy forwards an unmatched API request to the SPA fallback.
  app.use("/api/trpc", (_req, res) => {
    res.status(404).json({ error: { message: "API procedure not found" } });
  });
registerSeoRoutes(app);
  // Development uses Vite; production serves the pre-built static files.
  if (process.env.NODE_ENV === "development") {
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  } else {
    const staticPath = path.resolve(import.meta.dirname, "public");
    serveStatic(app, staticPath);
  }

  const port = Number(process.env.PORT || "3000");

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);

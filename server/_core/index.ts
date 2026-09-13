import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { registerPaystackWebhook } from "../paystackWebhook";
import { registerWeeklyEnrollmentExport } from "../scheduledEnrollmentExport";
import { registerBiweeklyNewsletter } from "../scheduledNewsletter";
import { registerDeliveryLogExportWorker } from "../deliveryLogExport";
import { registerWeeklyPsychometricAnalytics } from "../scheduledPsychometricAnalytics";
import { registerWeeklyCourseLessonReviewAnalytics } from "../scheduledCourseLessonReviewAnalytics";
import { serveStatic, setupVite } from "./vite";
import { registerSeoRoutes } from "../seoRoutes";
import { ensureAdminUser } from "../db";

async function startServer() {
  const app = express();
  const server = createServer(app);
  try {
    await ensureAdminUser();
  } catch (error) {
    console.error("[Bootstrap] Admin user ensure failed:", error);
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
  registerOAuthRoutes(app);
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
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = Number(process.env.PORT || "3000");

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);

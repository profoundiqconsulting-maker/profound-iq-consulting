import type { Express, NextFunction, Request, Response } from "express";
import { storageGet } from "../storage";

/**
 * Storage proxy for DigitalOcean Spaces.
 * Registers the /local-storage/* route so stored files resolve to their
 * short-lived DO Spaces URLs.
 */
export function registerStorageProxy(app: Express) {
  app.get(
    "/local-storage/*",
    async (req: Request, res: Response, next: NextFunction) => {
      await proxyStorageRequest(req, res, next, "/local-storage/");
    }
  );
}

async function proxyStorageRequest(
  req: Request,
  res: Response,
  next: NextFunction,
  prefix: string
) {
  try {
    const relativePath = req.originalUrl.slice(prefix.length);
    const key = relativePath.split("?")[0];
    const { url } = await storageGet(key);
    res.redirect(302, url);
  } catch (error) {
    console.error(`[Storage] Proxy failed for ${req.originalUrl}:`, error);
    if (!res.headersSent) {
      res.status(404).json({ error: "Storage is not configured." });
    } else {
      next(error);
    }
  }
}

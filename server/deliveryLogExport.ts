import type { Express, Request, Response } from "express";
import { sdk } from "./_core/sdk";
import { buildDeliveryLogCsv } from "../shared/adminDeliveryLog";
import {
  claimNextDeliveryLogExportJob,
  completeDeliveryLogExportJob,
  failDeliveryLogExportJob,
  getEmailPreviewDeliveriesForExport,
  getScheduledExport,
} from "./db";
import { storagePut } from "./storage";
import type { DeliveryLogFilters } from "../shared/adminDeliveryLog";

export const DELIVERY_LOG_EXPORT_KEY = "delivery_log_exports";

function parseFilters(value: unknown): DeliveryLogFilters {
  const filters = (value && typeof value === "object" ? value : {}) as {
    search?: string;
    status?: "all" | "sent" | "failed";
    fromDate?: string;
    toDate?: string;
  };
  return {
    search: filters.search,
    status: filters.status ?? "all",
    fromDate: filters.fromDate
      ? new Date(`${filters.fromDate}T00:00:00.000Z`)
      : undefined,
    toDate: filters.toDate
      ? new Date(`${filters.toDate}T23:59:59.999Z`)
      : undefined,
  };
}

export async function processNextDeliveryLogExportJob() {
  const job = await claimNextDeliveryLogExportJob();
  if (!job) return { processed: false as const };
  try {
    const rows = await getEmailPreviewDeliveriesForExport(
      parseFilters(job.filters)
    );
    const csv = buildDeliveryLogCsv(rows);
    const uploaded = await storagePut(
      `delivery-log-exports/delivery-log-${job.id}-${new Date().toISOString().slice(0, 10)}.csv`,
      csv,
      "text/csv;charset=utf-8"
    );
    const completed = await completeDeliveryLogExportJob(job.id, {
      fileKey: uploaded.key,
      fileUrl: uploaded.url,
      rowCount: rows.length,
    });
    return { processed: true as const, job: completed };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await failDeliveryLogExportJob(job.id, message);
    return {
      processed: true as const,
      failed: true as const,
      jobId: job.id,
      error: message,
    };
  }
}

export async function deliveryLogExportWorkerHandler(
  req: Request,
  res: Response
) {
  const timestamp = new Date();
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user || !user.isCron || !user.taskUid)
      return res.status(403).json({ error: "cron-only" });
    const config = await getScheduledExport(DELIVERY_LOG_EXPORT_KEY);
    if (!config || config.scheduleTaskUid !== user.taskUid)
      return res.json({ ok: true, skipped: "orphan" });
    const result = await processNextDeliveryLogExportJob();
    return res.json({ ok: true, ...result });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return res
      .status(500)
      .json({
        error: errorMessage,
        context: {
          url: req.originalUrl,
          taskUid: (error as { taskUid?: string })?.taskUid ?? null,
        },
        timestamp: timestamp.toISOString(),
      });
  }
}

export function registerDeliveryLogExportWorker(app: Express) {
  app.post(
    "/api/scheduled/deliveryLogExportWorker",
    deliveryLogExportWorkerHandler
  );
}

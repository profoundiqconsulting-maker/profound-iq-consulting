import type { Express, Request, Response } from "express";
import { sdk } from "./_core/sdk";
import { buildCourseEnrollmentCsv } from "../shared/adminExport";
import { addScheduledExportRun, getCourseEnrollments, getScheduledExport, updateScheduledExport } from "./db";
import { storagePut } from "./storage";

export const WEEKLY_EXPORT_KEY = "weekly_course_enrollments";

export function sameUtcWeek(a: Date, b: Date) {
  const start = (value: Date) => { const date = new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate())); const day = date.getUTCDay() || 7; date.setUTCDate(date.getUTCDate() - day + 1); return date.toISOString().slice(0, 10); };
  return start(a) === start(b);
}

export async function weeklyEnrollmentExportHandler(req: Request, res: Response) {
  const timestamp = new Date();
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
    const record = await getScheduledExport(WEEKLY_EXPORT_KEY);
    if (!record || record.scheduleTaskUid !== user.taskUid) return res.json({ ok: true, skipped: "orphan" });
    if (record.lastRunAt && sameUtcWeek(new Date(record.lastRunAt), timestamp)) return res.json({ ok: true, skipped: "already-generated", fileUrl: record.lastFileUrl });
    const fromDate = new Date(timestamp.getTime() - 7 * 24 * 60 * 60 * 1000);
    const rows = await getCourseEnrollments({ fromDate, toDate: timestamp });
    const data = buildCourseEnrollmentCsv(rows);
    const uploaded = await storagePut(`scheduled-exports/course-enrollments-${timestamp.toISOString().slice(0, 10)}.csv`, data, "text/csv;charset=utf-8");
    await addScheduledExportRun({ exportKey: WEEKLY_EXPORT_KEY, fileKey: uploaded.key, fileUrl: uploaded.url, rowCount: rows.length });
    await updateScheduledExport(WEEKLY_EXPORT_KEY, { lastRunAt: timestamp, lastFileKey: uploaded.key, lastFileUrl: uploaded.url });
    return res.json({ ok: true, rows: rows.length, fileUrl: uploaded.url });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error), context: { url: req.originalUrl, taskUid: (error as { taskUid?: string })?.taskUid ?? null }, timestamp: timestamp.toISOString() });
  }
}

export function registerWeeklyEnrollmentExport(app: Express) {
  app.post("/api/scheduled/weeklyEnrollmentExport", weeklyEnrollmentExportHandler);
}

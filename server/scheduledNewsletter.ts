import type { Express, Request, Response } from "express";
import { createHash, randomBytes } from "node:crypto";
import { sdk } from "./_core/sdk";
import { getScheduledExport, updateScheduledExport, listConfirmedNewsletterRecipients, rotateNewsletterUnsubscribeToken, listInsightArticles } from "./db";
import { sendNewsletterDigestEmail } from "./email";

export const BIWEEKLY_NEWSLETTER_KEY = "biweekly_insights_newsletter";
const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;
export const isBiweeklyDue = (lastRunAt: Date | string | null | undefined, now = new Date()) => !lastRunAt || now.getTime() - new Date(lastRunAt).getTime() >= TWO_WEEKS_MS;
export const hashNewsletterToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function biweeklyNewsletterHandler(req: Request, res: Response) {
  const timestamp = new Date();
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
    const record = await getScheduledExport(BIWEEKLY_NEWSLETTER_KEY);
    if (!record || record.scheduleTaskUid !== user.taskUid) return res.json({ ok: true, skipped: "orphan" });
    if (!isBiweeklyDue(record.lastRunAt, timestamp)) return res.json({ ok: true, skipped: "not-due", lastRunAt: record.lastRunAt });
    const articles = await listInsightArticles({ includeDrafts: false, page: 1, pageSize: 3 });
    if (!articles.rows.length) { await updateScheduledExport(BIWEEKLY_NEWSLETTER_KEY, { lastRunAt: timestamp }); return res.json({ ok: true, skipped: "no-published-insights", recipients: 0 }); }
    const recipients = await listConfirmedNewsletterRecipients();
    let sent = 0;
    for (const recipient of recipients) {
      const rawToken = randomBytes(32).toString("hex");
      await rotateNewsletterUnsubscribeToken(recipient.id, hashNewsletterToken(rawToken));
      await sendNewsletterDigestEmail({ to: recipient.email, articles: articles.rows, unsubscribeUrl: `https://profoundiq-vguqrhsm.manus.space/newsletter/unsubscribe?token=${rawToken}` });
      sent += 1;
    }
    await updateScheduledExport(BIWEEKLY_NEWSLETTER_KEY, { lastRunAt: timestamp });
    return res.json({ ok: true, sent, eligible: recipients.length, articleCount: articles.rows.length, sentAt: timestamp.toISOString() });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: errorMessage, context: { url: req.originalUrl, taskUid: (error as { taskUid?: string })?.taskUid ?? null }, timestamp: timestamp.toISOString() });
  }
}

export function registerBiweeklyNewsletter(app: Express) { app.post("/api/scheduled/biweeklyNewsletter", biweeklyNewsletterHandler); }

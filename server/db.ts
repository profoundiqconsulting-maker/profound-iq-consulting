import { and, desc, eq, gte, isNull, isNotNull, lt, lte, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { analyticsEvents, assessmentAttempts, courseEnrollments, emailTemplates, InsertAssessmentAttempt, InsertUser, scheduledExports, users } from "../drizzle/schema";
import type { AssessmentReport } from "../shared/assessment";
import { aggregateWeeklyAnalytics, summarizeAnalyticsEvents } from "../shared/adminAnalytics";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) { if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; } }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export type NotificationPreferences = { assessmentUpdates: boolean; courseAnnouncements: boolean; monthlyInsights: boolean };

export async function getUserProfile(openId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.select({ id: users.id, openId: users.openId, name: users.name, email: users.email, role: users.role, notificationPreferences: users.notificationPreferences, avatarUrl: users.avatarUrl, timezone: users.timezone }).from(users).where(eq(users.openId, openId)).limit(1);
  const profile = result[0];
  if (!profile) return undefined;
  return {
    ...profile,
    notificationPreferences: { assessmentUpdates: true, courseAnnouncements: true, monthlyInsights: false, ...((profile.notificationPreferences as Partial<NotificationPreferences> | null) ?? {}) },
    avatarUrl: profile.avatarUrl,
    timezone: profile.timezone ?? "Africa/Nairobi",
  };
}

export async function updateUserProfile(openId: string, input: { name: string; timezone: string; notificationPreferences: NotificationPreferences }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(users).set({ name: input.name, timezone: input.timezone, notificationPreferences: input.notificationPreferences }).where(eq(users.openId, openId));
  return getUserProfile(openId);
}

export async function updateUserAvatar(openId: string, avatarUrl: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(users).set({ avatarUrl }).where(eq(users.openId, openId));
  return getUserProfile(openId);
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function createAssessmentAttempt(input: Pick<InsertAssessmentAttempt, "name" | "email" | "answers">) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(assessmentAttempts).values({ ...input, paymentStatus: "pending", consentedAt: new Date() });
  return Number(result[0].insertId);
}

export async function setPaystackReference(id: number, reference: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(assessmentAttempts).set({ paystackReference: reference }).where(eq(assessmentAttempts.id, id));
}

export async function getAssessmentAttempt(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(assessmentAttempts).where(eq(assessmentAttempts.id, id)).limit(1);
  return result[0];
}

export async function getAssessmentAttemptByReference(reference: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(assessmentAttempts).where(eq(assessmentAttempts.paystackReference, reference)).limit(1);
  return result[0];
}

export async function markAssessmentPaid(id: number, report: AssessmentReport) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(assessmentAttempts).set({ paymentStatus: "paid", report, paidAt: new Date() }).where(eq(assessmentAttempts.id, id));
}

export async function claimAssessmentReportEmail(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const staleBefore = new Date(Date.now() - 10 * 60 * 1000);
  const result = await db.update(assessmentAttempts).set({ reportEmailStatus: "sending", reportEmailClaimedAt: new Date() }).where(and(eq(assessmentAttempts.id, id), eq(assessmentAttempts.paymentStatus, "paid"), isNotNull(assessmentAttempts.report), or(eq(assessmentAttempts.reportEmailStatus, "pending"), and(eq(assessmentAttempts.reportEmailStatus, "sending"), or(isNull(assessmentAttempts.reportEmailClaimedAt), lt(assessmentAttempts.reportEmailClaimedAt, staleBefore))))));
  return Number(result[0].affectedRows ?? 0) > 0;
}

export async function markAssessmentReportEmailSent(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(assessmentAttempts).set({ reportEmailStatus: "sent", reportEmailSentAt: new Date(), reportEmailClaimedAt: null }).where(and(eq(assessmentAttempts.id, id), eq(assessmentAttempts.reportEmailStatus, "sending")));
}

export async function releaseAssessmentReportEmailClaim(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(assessmentAttempts).set({ reportEmailStatus: "pending", reportEmailClaimedAt: null }).where(and(eq(assessmentAttempts.id, id), eq(assessmentAttempts.reportEmailStatus, "sending")));
}

export async function getLatestPaidAssessment(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(assessmentAttempts).where(eq(assessmentAttempts.email, email)).orderBy(desc(assessmentAttempts.createdAt)).limit(20);
  return result.find((item) => item.paymentStatus === "paid");
}

export async function getUserAssessmentHistory(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  const rows = await db.select({
    id: assessmentAttempts.id,
    name: assessmentAttempts.name,
    email: assessmentAttempts.email,
    paymentStatus: assessmentAttempts.paymentStatus,
    paystackReference: assessmentAttempts.paystackReference,
    createdAt: assessmentAttempts.createdAt,
    paidAt: assessmentAttempts.paidAt,
    reportEmailStatus: assessmentAttempts.reportEmailStatus,
    reportEmailSentAt: assessmentAttempts.reportEmailSentAt,
    report: assessmentAttempts.report,
  }).from(assessmentAttempts).where(eq(assessmentAttempts.email, email)).orderBy(desc(assessmentAttempts.createdAt)).limit(50);

  return rows.map((row) => ({
    id: row.id,
    createdAt: row.createdAt,
    paidAt: row.paidAt,
    reportEmailStatus: row.reportEmailStatus,
    reportEmailSentAt: row.reportEmailSentAt,
    paymentStatus: row.paymentStatus,
    paystackReference: row.paystackReference,
    overallScore: (row.report as AssessmentReport | null)?.overallScore ?? null,
    overallBand: (row.report as AssessmentReport | null)?.overallBand ?? null,
    report: row.paymentStatus === "paid" ? row.report : null,
  }));
}

export async function recordAnalyticsEvent(input: { eventName: string; attemptId?: number; userOpenId?: string; metadata?: Record<string, unknown> }) {
  const db = await getDb();
  if (!db) return;
  await db.insert(analyticsEvents).values({ eventName: input.eventName, attemptId: input.attemptId, userOpenId: input.userOpenId, metadata: input.metadata ?? null });
}

export async function createCourseEnrollment(input: { courseTitle: string; name: string; email: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(courseEnrollments).values({ ...input, consentedAt: new Date() });
  return Number(result[0].insertId);
}

export async function getCourseEnrollments(filters: { fromDate?: Date; toDate?: Date; status?: string } = {}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const conditions = [filters.fromDate ? gte(courseEnrollments.createdAt, filters.fromDate) : undefined, filters.toDate ? lte(courseEnrollments.createdAt, filters.toDate) : undefined, filters.status ? eq(courseEnrollments.status, filters.status) : undefined].filter(Boolean) as Array<ReturnType<typeof gte>>;
  return db.select({ id: courseEnrollments.id, courseTitle: courseEnrollments.courseTitle, name: courseEnrollments.name, email: courseEnrollments.email, status: courseEnrollments.status, createdAt: courseEnrollments.createdAt, consentedAt: courseEnrollments.consentedAt }).from(courseEnrollments).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(courseEnrollments.createdAt)).limit(1000);
}

export async function getAnalyticsDashboard(filters: { fromDate?: Date; toDate?: Date } = {}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const conditions = [filters.fromDate ? gte(analyticsEvents.createdAt, filters.fromDate) : undefined, filters.toDate ? lte(analyticsEvents.createdAt, filters.toDate) : undefined].filter(Boolean) as Array<ReturnType<typeof gte>>;
  const rows = await db.select({ eventName: analyticsEvents.eventName, count: sql<number>`count(*)` }).from(analyticsEvents).where(conditions.length ? and(...conditions) : undefined).groupBy(analyticsEvents.eventName);
  const summary = summarizeAnalyticsEvents(rows.map((row) => ({ eventName: row.eventName, count: Number(row.count) })));
  const trendFrom = filters.fromDate ?? new Date(Date.now() - 56 * 24 * 60 * 60 * 1000);
  const trendRows = await db.select({ week: sql<string>`DATE_FORMAT(${analyticsEvents.createdAt}, '%x-W%v')`, eventName: analyticsEvents.eventName, count: sql<number>`count(*)` }).from(analyticsEvents).where(and(gte(analyticsEvents.createdAt, trendFrom), filters.toDate ? lte(analyticsEvents.createdAt, filters.toDate) : undefined)).groupBy(sql`DATE_FORMAT(${analyticsEvents.createdAt}, '%x-W%v')`, analyticsEvents.eventName);
  const weekly = aggregateWeeklyAnalytics(trendRows.map((row) => ({ week: row.week, eventName: row.eventName, count: Number(row.count) })));
  return { summary, weekly };
}

const defaultEmailTemplates = [
  { templateKey: "assessment_report", label: "Assessment report delivery", subject: "Your Profound IQ assessment report", body: "Hello {{name}},\n\nYour assessment report is ready. Use the secure link in your dashboard to review your development signals.\n\nProfound IQ Consulting" },
  { templateKey: "course_enrollment", label: "Course enrollment follow-up", subject: "Your Profound IQ course inquiry", body: "Hello {{name}},\n\nThank you for your interest in {{course}}. Our team will follow up with availability and next steps.\n\nProfound IQ Consulting" },
];

export async function getScheduledExport(exportKey: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return (await db.select().from(scheduledExports).where(eq(scheduledExports.exportKey, exportKey)).limit(1))[0] ?? null;
}
export async function createScheduledExportIfMissing(exportKey: string) {
  const existing = await getScheduledExport(exportKey);
  if (existing) return existing;
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(scheduledExports).values({ exportKey });
  return getScheduledExport(exportKey);
}
export async function updateScheduledExport(exportKey: string, input: { scheduleTaskUid?: string; lastRunAt?: Date; lastFileKey?: string; lastFileUrl?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(scheduledExports).set(input).where(eq(scheduledExports.exportKey, exportKey));
  return getScheduledExport(exportKey);
}

export async function getEmailTemplates() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const rows = await db.select().from(emailTemplates).orderBy(emailTemplates.templateKey);
  return defaultEmailTemplates.map((fallback) => rows.find((row) => row.templateKey === fallback.templateKey) ?? { id: 0, ...fallback, updatedByOpenId: null, updatedAt: null });
}

export async function upsertEmailTemplate(input: { templateKey: string; label: string; subject: string; body: string; updatedByOpenId: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(emailTemplates).values(input).onDuplicateKeyUpdate({ set: { label: input.label, subject: input.subject, body: input.body, updatedByOpenId: input.updatedByOpenId } });
  return getEmailTemplates();
}

export async function getAssessmentAdminOverview() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  const rows = await db.select({
    id: assessmentAttempts.id,
    name: assessmentAttempts.name,
    email: assessmentAttempts.email,
    paymentStatus: assessmentAttempts.paymentStatus,
    paystackReference: assessmentAttempts.paystackReference,
    createdAt: assessmentAttempts.createdAt,
    paidAt: assessmentAttempts.paidAt,
    report: assessmentAttempts.report,
  }).from(assessmentAttempts).orderBy(desc(assessmentAttempts.createdAt)).limit(250);

  const attempts = rows.map((row) => {
    const report = row.report as AssessmentReport | null;
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      paymentStatus: row.paymentStatus,
      paystackReference: row.paystackReference,
      createdAt: row.createdAt,
      paidAt: row.paidAt,
      overallScore: report?.overallScore ?? null,
      overallBand: report?.overallBand ?? null,
    };
  });

  return {
    attempts,
    summary: {
      total: attempts.length,
      paid: attempts.filter((attempt) => attempt.paymentStatus === "paid").length,
      pending: attempts.filter((attempt) => attempt.paymentStatus !== "paid").length,
    },
  };
}

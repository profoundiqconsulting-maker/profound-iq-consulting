import { and, desc, eq, gte, isNull, isNotNull, like, lt, lte, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { adminAnalyticsSettings, analyticsEvents, assessmentAttempts, courseEnrollments, deliveryLogExportJobs, emailPreviewDeliveries, emailTemplates, InsertAssessmentAttempt, InsertUser, scheduledExportRuns, scheduledExports, users, verificationRevocationAudits } from "../drizzle/schema";
import type { AssessmentReport } from "../shared/assessment";
import { aggregateWeeklyAnalytics, summarizeAnalyticsEvents } from "../shared/adminAnalytics";
import { selectAdminNotificationRecipients } from "../shared/adminRecipients";
import type { DeliveryLogFilters, DeliveryLogRow } from "../shared/adminDeliveryLog";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function getAdminNotificationRecipients(): Promise<string[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({ role: users.role, email: users.email, emailVerifiedAt: users.emailVerifiedAt }).from(users).where(and(eq(users.role, "admin"), isNotNull(users.email), isNotNull(users.emailVerifiedAt)));
  return selectAdminNotificationRecipients(rows);
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
  if (user.email?.trim()) { values.emailVerifiedAt = new Date(); updateSet.emailVerifiedAt = new Date(); }
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
  let previousSummary: Record<string, number> = {};
  if (filters.fromDate && filters.toDate) {
    const duration = filters.toDate.getTime() - filters.fromDate.getTime();
    const previousTo = new Date(filters.fromDate.getTime() - 1);
    const previousFrom = new Date(previousTo.getTime() - duration);
    const previousRows = await db.select({ eventName: analyticsEvents.eventName, count: sql<number>`count(*)` }).from(analyticsEvents).where(and(gte(analyticsEvents.createdAt, previousFrom), lte(analyticsEvents.createdAt, previousTo))).groupBy(analyticsEvents.eventName);
    previousSummary = summarizeAnalyticsEvents(previousRows.map((row) => ({ eventName: row.eventName, count: Number(row.count) })));
  }
  const trendFrom = filters.fromDate ?? new Date(Date.now() - 56 * 24 * 60 * 60 * 1000);
  const trendRows = await db.select({ week: sql<string>`DATE_FORMAT(${analyticsEvents.createdAt}, '%x-W%v')`, eventName: analyticsEvents.eventName, count: sql<number>`count(*)` }).from(analyticsEvents).where(and(gte(analyticsEvents.createdAt, trendFrom), filters.toDate ? lte(analyticsEvents.createdAt, filters.toDate) : undefined)).groupBy(sql`DATE_FORMAT(${analyticsEvents.createdAt}, '%x-W%v')`, analyticsEvents.eventName);
  const weekly = aggregateWeeklyAnalytics(trendRows.map((row) => ({ week: row.week, eventName: row.eventName, count: Number(row.count) })));
  return { summary, previousSummary, weekly };
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
export async function updateScheduledExport(exportKey: string, input: { scheduleTaskUid?: string; lastRunAt?: Date; lastFileKey?: string; lastFileUrl?: string; retentionDays?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(scheduledExports).set(input).where(eq(scheduledExports.exportKey, exportKey));
  return getScheduledExport(exportKey);
}

export async function addScheduledExportRun(input: { exportKey: string; fileKey: string; fileUrl: string; rowCount: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(scheduledExportRuns).values(input);
}
export async function getScheduledExportRuns(exportKey: string, limit = 12) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.select().from(scheduledExportRuns).where(eq(scheduledExportRuns.exportKey, exportKey)).orderBy(desc(scheduledExportRuns.createdAt)).limit(limit);
}
export async function deleteExpiredScheduledExportRuns(exportKey: string, cutoff: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.delete(scheduledExportRuns).where(and(eq(scheduledExportRuns.exportKey, exportKey), lt(scheduledExportRuns.createdAt, cutoff)));
}
export async function getAdminAnalyticsSettings(adminOpenId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return (await db.select().from(adminAnalyticsSettings).where(eq(adminAnalyticsSettings.adminOpenId, adminOpenId)).limit(1))[0] ?? { adminOpenId, paidBenchmark: 35, downloadBenchmark: 60 };
}
export async function upsertAdminAnalyticsSettings(adminOpenId: string, input: { paidBenchmark: number; downloadBenchmark: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const existing = await getAdminAnalyticsSettings(adminOpenId);
  if ("id" in existing) await db.update(adminAnalyticsSettings).set(input).where(eq(adminAnalyticsSettings.adminOpenId, adminOpenId));
  else await db.insert(adminAnalyticsSettings).values({ adminOpenId, ...input });
  return getAdminAnalyticsSettings(adminOpenId);
}

export async function addEmailPreviewDelivery(input: { templateKey: string; recipientEmail: string; subject: string; body?: string | null; status: "sent" | "failed"; errorMessage?: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(emailPreviewDeliveries).values(input);
}
export async function getEmailPreviewDeliveries(limit = 20) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.select({ id: emailPreviewDeliveries.id, templateKey: emailPreviewDeliveries.templateKey, recipientEmail: emailPreviewDeliveries.recipientEmail, subject: emailPreviewDeliveries.subject, body: emailPreviewDeliveries.body, status: emailPreviewDeliveries.status, errorMessage: emailPreviewDeliveries.errorMessage, createdAt: emailPreviewDeliveries.createdAt }).from(emailPreviewDeliveries).orderBy(desc(emailPreviewDeliveries.createdAt)).limit(limit);
}

function deliveryLogConditions(filters: DeliveryLogFilters = {}) {
  const search = filters.search?.trim();
  return [
    search ? or(like(emailPreviewDeliveries.subject, `%${search}%`), like(emailPreviewDeliveries.recipientEmail, `%${search}%`), like(emailPreviewDeliveries.templateKey, `%${search}%`), like(emailPreviewDeliveries.errorMessage, `%${search}%`)) : undefined,
    filters.status && filters.status !== "all" ? eq(emailPreviewDeliveries.status, filters.status) : undefined,
    filters.fromDate ? gte(emailPreviewDeliveries.createdAt, filters.fromDate) : undefined,
    filters.toDate ? lte(emailPreviewDeliveries.createdAt, filters.toDate) : undefined,
  ].filter(Boolean) as Array<ReturnType<typeof gte>>;
}

const deliveryLogSelect = {
  id: emailPreviewDeliveries.id,
  templateKey: emailPreviewDeliveries.templateKey,
  recipientEmail: emailPreviewDeliveries.recipientEmail,
  subject: emailPreviewDeliveries.subject,
  status: emailPreviewDeliveries.status,
  errorMessage: emailPreviewDeliveries.errorMessage,
  createdAt: emailPreviewDeliveries.createdAt,
} as const;

export async function getEmailPreviewDeliveriesPage(filters: DeliveryLogFilters & { page: number; pageSize: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const conditions = deliveryLogConditions(filters);
  const where = conditions.length ? and(...conditions) : undefined;
  const [{ total }] = await db.select({ total: sql<number>`count(*)` }).from(emailPreviewDeliveries).where(where);
  const safePageSize = Math.min(100, Math.max(1, filters.pageSize));
  const totalCount = Number(total);
  const totalPages = Math.max(1, Math.ceil(totalCount / safePageSize));
  const page = Math.min(Math.max(1, filters.page), totalPages);
  const rows = await db.select(deliveryLogSelect).from(emailPreviewDeliveries).where(where).orderBy(desc(emailPreviewDeliveries.createdAt)).limit(safePageSize).offset((page - 1) * safePageSize);
  return { rows, total: totalCount, totalPages, page, pageSize: safePageSize };
}

export async function getEmailPreviewDeliveriesForExport(filters: DeliveryLogFilters = {}): Promise<DeliveryLogRow[]> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const conditions = deliveryLogConditions(filters);
  const where = conditions.length ? and(...conditions) : undefined;
  return db.select(deliveryLogSelect).from(emailPreviewDeliveries).where(where).orderBy(desc(emailPreviewDeliveries.createdAt)).limit(10000);
}

export async function getAdminUsersForReview(input: { page: number; pageSize: number; search?: string; verification: "all" | "verified" | "unverified" }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const search = input.search?.trim();
  const conditions = [
    search ? or(like(users.name, `%${search}%`), like(users.email, `%${search}%`), like(users.openId, `%${search}%`)) : undefined,
    input.verification === "verified" ? isNotNull(users.emailVerifiedAt) : undefined,
    input.verification === "unverified" ? isNull(users.emailVerifiedAt) : undefined,
  ].filter(Boolean) as Array<ReturnType<typeof gte>>;
  const where = conditions.length ? and(...conditions) : undefined;
  const [{ total }] = await db.select({ total: sql<number>`count(*)` }).from(users).where(where);
  const totalCount = Number(total);
  const safePageSize = Math.min(100, Math.max(1, input.pageSize));
  const totalPages = Math.max(1, Math.ceil(totalCount / safePageSize));
  const page = Math.min(Math.max(1, input.page), totalPages);
  const rows = await db.select({ id: users.id, openId: users.openId, name: users.name, email: users.email, role: users.role, emailVerifiedAt: users.emailVerifiedAt, createdAt: users.createdAt, lastSignedIn: users.lastSignedIn }).from(users).where(where).orderBy(desc(users.lastSignedIn)).limit(safePageSize).offset((page - 1) * safePageSize);
  return { rows, total: totalCount, totalPages, page, pageSize: safePageSize };
}

export async function revokeUserEmailVerification(openId: string, actor: { openId: string; name?: string | null; email?: string | null }, reason: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const target = await getUserByOpenId(openId);
  if (!target) return undefined;
  await db.transaction(async (tx) => {
    await tx.update(users).set({ emailVerifiedAt: null }).where(eq(users.openId, openId));
    await tx.insert(verificationRevocationAudits).values({ targetOpenId: target.openId, targetEmail: target.email, actorOpenId: actor.openId, actorName: actor.name ?? null, actorEmail: actor.email ?? null, reason });
  });
  return getUserByOpenId(openId);
}

export async function getVerificationRevocationAudits(limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.select().from(verificationRevocationAudits).orderBy(desc(verificationRevocationAudits.createdAt)).limit(Math.min(100, Math.max(1, limit)));
}

export type DeliveryLogExportJobFilters = { search?: string; status?: "all" | "sent" | "failed"; fromDate?: string; toDate?: string };

export async function createDeliveryLogExportJob(requestedByOpenId: string, filters: DeliveryLogExportJobFilters) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(deliveryLogExportJobs).values({ requestedByOpenId, filters, status: "queued" });
  return getDeliveryLogExportJob(Number(result[0].insertId));
}

export async function getDeliveryLogExportJob(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return (await db.select().from(deliveryLogExportJobs).where(eq(deliveryLogExportJobs.id, id)).limit(1))[0] ?? undefined;
}

export async function getDeliveryLogExportJobs(limit = 20) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.select().from(deliveryLogExportJobs).orderBy(desc(deliveryLogExportJobs.createdAt)).limit(Math.min(100, Math.max(1, limit)));
}

export async function claimNextDeliveryLogExportJob() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const next = (await db.select().from(deliveryLogExportJobs).where(eq(deliveryLogExportJobs.status, "queued")).orderBy(deliveryLogExportJobs.createdAt).limit(1))[0];
  if (!next) return undefined;
  const result = await db.update(deliveryLogExportJobs).set({ status: "running", startedAt: new Date(), errorMessage: null }).where(and(eq(deliveryLogExportJobs.id, next.id), eq(deliveryLogExportJobs.status, "queued")));
  return Number(result[0].affectedRows ?? 0) ? getDeliveryLogExportJob(next.id) : undefined;
}

export async function completeDeliveryLogExportJob(id: number, input: { fileKey: string; fileUrl: string; rowCount: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(deliveryLogExportJobs).set({ status: "completed", ...input, completedAt: new Date() }).where(and(eq(deliveryLogExportJobs.id, id), eq(deliveryLogExportJobs.status, "running")));
  return getDeliveryLogExportJob(id);
}

export async function failDeliveryLogExportJob(id: number, errorMessage: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(deliveryLogExportJobs).set({ status: "failed", errorMessage: errorMessage.slice(0, 500), completedAt: new Date() }).where(and(eq(deliveryLogExportJobs.id, id), eq(deliveryLogExportJobs.status, "running")));
  return getDeliveryLogExportJob(id);
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

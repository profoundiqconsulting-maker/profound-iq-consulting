import { createHash, randomBytes } from "node:crypto";
import { and, desc, eq, gte, inArray, isNull, isNotNull, like, lt, lte, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { adminAnalyticsSettings, adminSecuritySettings, analyticsEvents, assessmentAttempts, assessmentDrafts, careerPathAttempts, careerPathActiveModules, reportShares, reportShareAuditEvents, authLoginAttempts, courseEnrollments, contactInquiries, contactInquiryAuditLogs, courseLearnerEnrollments, courseLessonProgress, courseQuizAttempts, coursePaymentStages, courseCertificates, catalogItems, deliveryLogExportJobs, emailPreviewDeliveries, emailTemplates, InsertAssessmentAttempt, InsertUser, loginEvents, scheduledExportRuns, scheduledExports, userSessions, users, verificationRevocationAudits, organizationInvitations, organizationApprovalEvents, staffInvitations } from "../drizzle/schema";
import { compareReports, type AssessmentReport } from "../shared/assessment";
import { aggregateWeeklyAnalytics, summarizeAnalyticsEvents } from "../shared/adminAnalytics";
import { normalizeLoginAnalyticsRows } from "../shared/loginAnalytics";
import { selectAdminNotificationRecipients } from "../shared/adminRecipients";
import type { DeliveryLogFilters, DeliveryLogRow } from "../shared/adminDeliveryLog";
import { clampAuditPagination, type AuditHistoryFilters, type AuditHistoryPage, type AuditHistoryQuery } from "../shared/adminAudit";
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

export async function recordLoginEvent(input: { openId?: string | null; identifierType: string; success: boolean; failureCode?: string | null; networkHash: string; userAgent?: string | null; deviceType?: string | null; estimatedLocation?: string | null; createdAt?: Date }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(loginEvents).values({ ...input, createdAt: input.createdAt ?? new Date() });
}

export async function getLoginEventsForUser(input: { openId: string; limit?: number; deviceType?: string; locationSearch?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const conditions = [eq(loginEvents.openId, input.openId), input.deviceType && input.deviceType !== "all" ? eq(loginEvents.deviceType, input.deviceType) : undefined, input.locationSearch ? like(loginEvents.estimatedLocation, `%${input.locationSearch.trim()}%`) : undefined].filter(Boolean) as Array<ReturnType<typeof eq>>;
  return db.select({ id: loginEvents.id, identifierType: loginEvents.identifierType, success: loginEvents.success, failureCode: loginEvents.failureCode, userAgent: loginEvents.userAgent, deviceType: loginEvents.deviceType, estimatedLocation: loginEvents.estimatedLocation, createdAt: loginEvents.createdAt }).from(loginEvents).where(and(...conditions)).orderBy(desc(loginEvents.createdAt)).limit(Math.min(25, Math.max(1, input.limit ?? 10)));
}

export async function getFailedLoginEvents(input: { from?: Date; to?: Date; limit: number; offset: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const conditions = [eq(loginEvents.success, false)];
  if (input.from) conditions.push(gte(loginEvents.createdAt, input.from));
  if (input.to) conditions.push(lte(loginEvents.createdAt, input.to));
  return db.select().from(loginEvents).where(and(...conditions)).orderBy(desc(loginEvents.createdAt)).limit(input.limit).offset(input.offset);
}

export async function countFailedLoginEvents(input: { from?: Date; to?: Date }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const conditions = [eq(loginEvents.success, false)];
  if (input.from) conditions.push(gte(loginEvents.createdAt, input.from));
  if (input.to) conditions.push(lte(loginEvents.createdAt, input.to));
  const row = (await db.select({ count: sql<number>`count(*)` }).from(loginEvents).where(and(...conditions)))[0];
  return Number(row?.count ?? 0);
}

export async function getLoginSecurityAnalytics(input: { from?: Date; to?: Date; granularity?: "daily" | "weekly" } = {}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const loginConditions = [input.from ? gte(loginEvents.createdAt, input.from) : undefined, input.to ? lte(loginEvents.createdAt, input.to) : undefined].filter(Boolean) as Array<ReturnType<typeof gte>>;
  const sessionConditions = [input.from ? gte(userSessions.createdAt, input.from) : undefined, input.to ? lte(userSessions.createdAt, input.to) : undefined].filter(Boolean) as Array<ReturnType<typeof gte>>;
  const loginBucket = input.granularity === "daily" ? sql<string>`DATE_FORMAT(${loginEvents.createdAt}, '%Y-%m-%d')` : sql<string>`DATE_FORMAT(${loginEvents.createdAt}, '%x-W%v')`;
  const sessionBucket = input.granularity === "daily" ? sql<string>`DATE_FORMAT(${userSessions.createdAt}, '%Y-%m-%d')` : sql<string>`DATE_FORMAT(${userSessions.createdAt}, '%x-W%v')`;
  const loginRows = await db.select({ week: loginBucket, success: loginEvents.success, count: sql<number>`count(*)` }).from(loginEvents).where(loginConditions.length ? and(...loginConditions) : undefined).groupBy(loginBucket, loginEvents.success);
  const deviceRows = await db.select({ week: sessionBucket, deviceType: userSessions.deviceType, count: sql<number>`count(*)` }).from(userSessions).where(sessionConditions.length ? and(...sessionConditions) : undefined).groupBy(sessionBucket, userSessions.deviceType);
  return normalizeLoginAnalyticsRows(loginRows.map((row) => ({ ...row, count: Number(row.count) })), deviceRows.map((row) => ({ ...row, count: Number(row.count) })));
}

export async function getAdminSecuritySettings(adminOpenId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return (await db.select().from(adminSecuritySettings).where(eq(adminSecuritySettings.adminOpenId, adminOpenId)).limit(1))[0] ?? { id: 0, adminOpenId, alertThreshold: 5, reviewWindowDays: 7, loginEventRetentionDays: 90, updatedAt: new Date(0) };
}

export async function getEffectiveLoginAlertThreshold() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const row = (await db.select({ threshold: sql<number>`min(${adminSecuritySettings.alertThreshold})` }).from(adminSecuritySettings))[0];
  return Math.max(3, Math.min(20, Number(row?.threshold ?? 5)));
}

export async function getEffectiveLoginEventRetentionDays(adminOpenId: string) {
  const settings = await getAdminSecuritySettings(adminOpenId);
  return Math.max(30, Math.min(365, Number(settings.loginEventRetentionDays ?? 90)));
}

export async function purgeExpiredLoginEvents(retentionDays: number, now = new Date()) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const cutoff = new Date(now.getTime() - Math.max(30, Math.min(365, retentionDays)) * 24 * 60 * 60 * 1000);
  await db.delete(loginEvents).where(lt(loginEvents.createdAt, cutoff));
  return cutoff;
}

export async function saveAdminSecuritySettings(adminOpenId: string, input: { alertThreshold: number; reviewWindowDays: number; loginEventRetentionDays: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(adminSecuritySettings).values({ adminOpenId, ...input }).onDuplicateKeyUpdate({ set: input });
  return getAdminSecuritySettings(adminOpenId);
}

export async function createUserSession(input: { openId: string; tokenHash: string; networkHash?: string | null; userAgent?: string | null; deviceType?: string | null; estimatedLocation?: string | null; trustedDevice?: boolean; trustExpiresAt?: Date | null; createdAt?: Date; expiresAt: Date }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const now = input.createdAt ?? new Date();
  await db.insert(userSessions).values({ ...input, createdAt: now, lastSeenAt: now });
}

export async function getSessionByTokenHash(tokenHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return (await db.select().from(userSessions).where(eq(userSessions.tokenHash, tokenHash)).limit(1))[0] ?? undefined;
}

export async function touchUserSession(sessionId: number, now = new Date()) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(userSessions).set({ lastSeenAt: now }).where(and(eq(userSessions.id, sessionId), isNull(userSessions.revokedAt)));
}

export async function getUserSessions(openId: string, now = new Date()) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.select({ id: userSessions.id, openId: userSessions.openId, userAgent: userSessions.userAgent, deviceType: userSessions.deviceType, estimatedLocation: userSessions.estimatedLocation, trustedDevice: userSessions.trustedDevice, trustExpiresAt: userSessions.trustExpiresAt, createdAt: userSessions.createdAt, lastSeenAt: userSessions.lastSeenAt, expiresAt: userSessions.expiresAt, revokedAt: userSessions.revokedAt }).from(userSessions).where(and(eq(userSessions.openId, openId), isNull(userSessions.revokedAt), gte(userSessions.expiresAt, now))).orderBy(desc(userSessions.lastSeenAt));
}

export async function revokeUserSession(openId: string, sessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(userSessions).set({ revokedAt: new Date() }).where(and(eq(userSessions.id, sessionId), eq(userSessions.openId, openId), isNull(userSessions.revokedAt)));
}

export async function revokeOtherUserSessions(openId: string, currentTokenHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(userSessions).set({ revokedAt: new Date() }).where(and(eq(userSessions.openId, openId), sql`${userSessions.tokenHash} <> ${currentTokenHash}`, isNull(userSessions.revokedAt)));
}

export async function checkLoginRateLimit(identifierHash: string, networkHash: string, now = new Date()) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const row = (await db.select().from(authLoginAttempts).where(and(eq(authLoginAttempts.identifierHash, identifierHash), eq(authLoginAttempts.networkHash, networkHash))).limit(1))[0];
  if (!row) return { blocked: false, failedCount: 0 };
  const windowAge = now.getTime() - row.windowStartedAt.getTime();
  if (windowAge >= 15 * 60 * 1000) { await db.delete(authLoginAttempts).where(eq(authLoginAttempts.id, row.id)); return { blocked: false, failedCount: 0 }; }
  return { blocked: row.failedCount >= 5, failedCount: row.failedCount };
}

export async function recordFailedLogin(identifierHash: string, networkHash: string, now = new Date(), alertThreshold = 5) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const existing = (await db.select().from(authLoginAttempts).where(and(eq(authLoginAttempts.identifierHash, identifierHash), eq(authLoginAttempts.networkHash, networkHash))).limit(1))[0];
  if (!existing || now.getTime() - existing.windowStartedAt.getTime() >= 15 * 60 * 1000) {
    if (existing) await db.delete(authLoginAttempts).where(eq(authLoginAttempts.id, existing.id));
    await db.insert(authLoginAttempts).values({ identifierHash, networkHash, failedCount: 1, windowStartedAt: now, lastFailedAt: now });
    return { failedCount: 1, shouldAlert: false };
  }
  const nextCount = existing.failedCount + 1;
  const shouldAlert = nextCount >= alertThreshold && !existing.alertSentAt;
  await db.update(authLoginAttempts).set({ failedCount: nextCount, lastFailedAt: now, alertSentAt: shouldAlert ? now : existing.alertSentAt }).where(eq(authLoginAttempts.id, existing.id));
  return { failedCount: nextCount, shouldAlert };
}

export async function clearLoginFailures(identifierHash: string, networkHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.delete(authLoginAttempts).where(and(eq(authLoginAttempts.identifierHash, identifierHash), eq(authLoginAttempts.networkHash, networkHash)));
}

export async function findUserByLocalIdentifier(identifier: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return (await db.select().from(users).where(or(eq(users.email, identifier), eq(users.phone, identifier), eq(users.username, identifier))).limit(1))[0] ?? undefined;
}

export async function createLocalUser(input: { openId: string; name: string; email?: string | null; phone?: string | null; username?: string | null; passwordHash: string; role?: "user" | "staff" | "admin" }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(users).values({ ...input, loginMethod: "password", role: input.role ?? "user" });
  return getUserByOpenId(input.openId);
}

export async function setPasswordResetToken(openId: string, tokenHash: string, expiresAt: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(users).set({ passwordResetTokenHash: tokenHash, passwordResetExpiresAt: expiresAt }).where(eq(users.openId, openId));
}

export async function consumePasswordResetToken(tokenHash: string, passwordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const user = (await db.select().from(users).where(and(eq(users.passwordResetTokenHash, tokenHash), gte(users.passwordResetExpiresAt, new Date()))).limit(1))[0];
  if (!user) return undefined;
  await db.update(users).set({ passwordHash, passwordResetTokenHash: null, passwordResetExpiresAt: null }).where(and(eq(users.id, user.id), eq(users.passwordResetTokenHash, tokenHash)));
  return getUserByOpenId(user.openId);
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

export async function createAssessmentDraft(input: { name: string; email: string; answers: unknown; currentModule: number; expiresAt: Date }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = hashReportShareToken(rawToken);
  await db.insert(assessmentDrafts).values({ ...input, tokenHash });
  return { token: rawToken, expiresAt: input.expiresAt };
}

export async function getAssessmentDraft(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const tokenHash = hashReportShareToken(token);
  const rows = await db.select().from(assessmentDrafts).where(and(eq(assessmentDrafts.tokenHash, tokenHash), gte(assessmentDrafts.expiresAt, new Date()))).limit(1);
  return rows[0] ?? undefined;
}

export async function markAssessmentDraftResumed(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(assessmentDrafts).set({ resumedAt: new Date() }).where(eq(assessmentDrafts.id, id));
}

export async function createCareerPathAttempt(input: { name: string; email: string; answers: unknown; personalNotes?: string | null; receiptTitle?: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(careerPathAttempts).values({ ...input, paymentStatus: "pending", consentedAt: new Date() });
  return Number(result[0].insertId);
}

export async function listCareerPathAttemptsByEmail(email: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: careerPathAttempts.id, name: careerPathAttempts.name, email: careerPathAttempts.email, paystackReference: careerPathAttempts.paystackReference, paymentStatus: careerPathAttempts.paymentStatus, report: careerPathAttempts.report, reportEmailStatus: careerPathAttempts.reportEmailStatus, reportEmailSentAt: careerPathAttempts.reportEmailSentAt, receiptTitle: careerPathAttempts.receiptTitle, createdAt: careerPathAttempts.createdAt, paidAt: careerPathAttempts.paidAt }).from(careerPathAttempts).where(eq(careerPathAttempts.email, email)).orderBy(desc(careerPathAttempts.createdAt)).limit(50);
}

export async function claimCareerPathReportEmail(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const staleBefore = new Date(Date.now() - 10 * 60 * 1000);
  const result = await db.update(careerPathAttempts).set({ reportEmailStatus: "sending", reportEmailClaimedAt: new Date() }).where(and(eq(careerPathAttempts.id, id), eq(careerPathAttempts.paymentStatus, "paid"), isNotNull(careerPathAttempts.report), or(eq(careerPathAttempts.reportEmailStatus, "pending"), and(eq(careerPathAttempts.reportEmailStatus, "sending"), or(isNull(careerPathAttempts.reportEmailClaimedAt), lt(careerPathAttempts.reportEmailClaimedAt, staleBefore))))));
  return Number(result[0].affectedRows ?? 0) > 0;
}

export async function markCareerPathReportEmailSent(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(careerPathAttempts).set({ reportEmailStatus: "sent", reportEmailSentAt: new Date(), reportEmailClaimedAt: null }).where(and(eq(careerPathAttempts.id, id), eq(careerPathAttempts.reportEmailStatus, "sending")));
}

export async function releaseCareerPathReportEmailClaim(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(careerPathAttempts).set({ reportEmailStatus: "pending", reportEmailClaimedAt: null }).where(and(eq(careerPathAttempts.id, id), eq(careerPathAttempts.reportEmailStatus, "sending")));
}

export async function setCareerPathPaystackReference(id: number, reference: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(careerPathAttempts).set({ paystackReference: reference }).where(eq(careerPathAttempts.id, id));
}

export async function getCareerPathAttemptByReference(reference: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(careerPathAttempts).where(eq(careerPathAttempts.paystackReference, reference)).limit(1);
  return result[0];
}

export async function markCareerPathPaid(id: number, report: unknown) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(careerPathAttempts).set({ paymentStatus: "paid", report, paidAt: new Date() }).where(eq(careerPathAttempts.id, id));
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
    dimensionScores: row.paymentStatus === "paid" ? ((row.report as AssessmentReport | null)?.dimensions ?? []).map((dimension) => ({ key: dimension.key, label: dimension.label, score: dimension.score })) : [],
    report: row.paymentStatus === "paid" ? row.report : null,
  })).map((item, index, items) => ({ ...item, version: `v${items.length - index}` }));
}

export type CatalogItemInput = {
  slug: string;
  itemType: "course" | "service" | "program";
  title: string;
  strapline: string;
  description: string;
  audience: string;
  duration: string;
  outcomes: string[];
  priceKes: number;
  published: boolean;
  createdByOpenId: string;
};

export async function listPublishedCatalogItems() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.select().from(catalogItems).where(eq(catalogItems.published, true)).orderBy(catalogItems.createdAt);
}

export async function listCatalogItemsForAdmin() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.select().from(catalogItems).orderBy(desc(catalogItems.createdAt));
}

export async function createCatalogItem(input: CatalogItemInput) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(catalogItems).values({ ...input, outcomes: input.outcomes });
  return (await db.select().from(catalogItems).where(eq(catalogItems.slug, input.slug)).limit(1))[0];
}

function hashReportShareToken(token: string) { return createHash("sha256").update(token).digest("hex"); }

export async function createReportShare(input: { attemptId: number; ownerOpenId: string; lens: string; recipientPurpose?: string | null; expiresAt: Date }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = hashReportShareToken(rawToken);
  await db.insert(reportShares).values({ attemptId: input.attemptId, ownerOpenId: input.ownerOpenId, lens: input.lens, recipientPurpose: input.recipientPurpose ?? null, tokenHash, expiresAt: input.expiresAt });
  const created = await db.select({ id: reportShares.id }).from(reportShares).where(eq(reportShares.tokenHash, tokenHash)).limit(1);
  const shareId = created[0]?.id;
  if (!shareId) throw new Error("Report share could not be created");
  await db.insert(reportShareAuditEvents).values([
    { shareId, attemptId: input.attemptId, ownerOpenId: input.ownerOpenId, eventType: "consented", recipientPurpose: input.recipientPurpose ?? null },
    { shareId, attemptId: input.attemptId, ownerOpenId: input.ownerOpenId, eventType: "created", recipientPurpose: input.recipientPurpose ?? null },
  ]);
  return rawToken;
}

export async function getActiveReportShare(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select({ share: reportShares, attempt: assessmentAttempts }).from(reportShares).innerJoin(assessmentAttempts, eq(reportShares.attemptId, assessmentAttempts.id)).where(and(eq(reportShares.tokenHash, hashReportShareToken(token)), isNull(reportShares.revokedAt), gte(reportShares.expiresAt, new Date()))).limit(1);
  const row = rows[0];
  if (!row || row.attempt.paymentStatus !== "paid" || !row.attempt.report) return undefined;
  return { share: row.share, attempt: row.attempt };
}

export async function revokeReportShare(ownerOpenId: string, shareId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const existing = await db.select().from(reportShares).where(and(eq(reportShares.id, shareId), eq(reportShares.ownerOpenId, ownerOpenId), isNull(reportShares.revokedAt))).limit(1);
  if (!existing[0]) return;
  await db.update(reportShares).set({ revokedAt: new Date() }).where(eq(reportShares.id, shareId));
  await db.insert(reportShareAuditEvents).values({ shareId, attemptId: existing[0].attemptId, ownerOpenId, eventType: "revoked", recipientPurpose: existing[0].recipientPurpose ?? null });
}

export async function listReportShareAuditEvents(ownerOpenId: string, filters?: { attemptId?: number; eventType?: "consented" | "created" | "revoked" }) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reportShareAuditEvents).where(and(eq(reportShareAuditEvents.ownerOpenId, ownerOpenId), filters?.attemptId ? eq(reportShareAuditEvents.attemptId, filters.attemptId) : undefined, filters?.eventType ? eq(reportShareAuditEvents.eventType, filters.eventType) : undefined)).orderBy(desc(reportShareAuditEvents.createdAt)).limit(100);
}

export async function listReportShares(ownerOpenId: string, attemptId?: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reportShares).where(and(eq(reportShares.ownerOpenId, ownerOpenId), attemptId ? eq(reportShares.attemptId, attemptId) : undefined)).orderBy(desc(reportShares.createdAt)).limit(50);
}

export async function compareUserAssessmentReports(email: string, currentAttemptId: number, previousAttemptId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const rows = await db.select({ id: assessmentAttempts.id, createdAt: assessmentAttempts.createdAt, paymentStatus: assessmentAttempts.paymentStatus, report: assessmentAttempts.report }).from(assessmentAttempts).where(and(eq(assessmentAttempts.email, email), or(eq(assessmentAttempts.id, currentAttemptId), eq(assessmentAttempts.id, previousAttemptId))));
  const current = rows.find((row) => row.id === currentAttemptId);
  const previous = rows.find((row) => row.id === previousAttemptId);
  if (!current || !previous || current.paymentStatus !== "paid" || previous.paymentStatus !== "paid" || !current.report || !previous.report) return undefined;
  return { current: { id: current.id, createdAt: current.createdAt }, previous: { id: previous.id, createdAt: previous.createdAt }, comparison: compareReports(current.report as AssessmentReport, previous.report as AssessmentReport) };
}

export async function recordAnalyticsEvent(input: { eventName: string; attemptId?: number; userOpenId?: string; metadata?: Record<string, unknown> }) {
  const db = await getDb();
  if (!db) return;
  await db.insert(analyticsEvents).values({ eventName: input.eventName, attemptId: input.attemptId, userOpenId: input.userOpenId, metadata: input.metadata ?? null });
}

export async function createContactInquiry(input: { name: string; email: string; category: string; message: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(contactInquiries).values(input);
  return Number(result[0].insertId);
}

export async function listContactInquiries(input: ContactInquiryFilters & { page: number; pageSize: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const conditions = contactInquiryConditions(input);
  const where = conditions.length ? and(...conditions) : undefined;
  const rows = await db.select().from(contactInquiries).where(where).orderBy(desc(contactInquiries.createdAt)).limit(input.pageSize).offset((input.page - 1) * input.pageSize);
  const countRow = (await db.select({ count: sql<number>`count(*)` }).from(contactInquiries).where(where))[0];
  const total = Number(countRow?.count ?? 0);
  return { rows, total, page: input.page, pageSize: input.pageSize, totalPages: Math.max(1, Math.ceil(total / input.pageSize)) };
}

export type ContactInquiryFilters = { search?: string; category?: string; status?: string; assignedToOpenId?: string; fromDate?: Date; toDate?: Date };

function contactInquiryConditions(filters: ContactInquiryFilters) {
  return [filters.search ? or(like(contactInquiries.name, `%${filters.search}%`), like(contactInquiries.email, `%${filters.search}%`), like(contactInquiries.message, `%${filters.search}%`)) : undefined, filters.category && filters.category !== "all" ? eq(contactInquiries.category, filters.category) : undefined, filters.status && filters.status !== "all" ? eq(contactInquiries.status, filters.status) : undefined, filters.assignedToOpenId && filters.assignedToOpenId !== "all" ? filters.assignedToOpenId === "unassigned" ? isNull(contactInquiries.assignedToOpenId) : eq(contactInquiries.assignedToOpenId, filters.assignedToOpenId) : undefined, filters.fromDate ? gte(contactInquiries.createdAt, filters.fromDate) : undefined, filters.toDate ? lte(contactInquiries.createdAt, filters.toDate) : undefined].filter(Boolean) as Array<ReturnType<typeof eq>>;
}

export async function getContactInquiriesForExport(filters: ContactInquiryFilters = {}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const conditions = contactInquiryConditions(filters);
  return db.select().from(contactInquiries).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(contactInquiries.createdAt)).limit(5000);
}

export async function getContactInquiriesForExportWithAudit(filters: ContactInquiryFilters = {}) {
  const rows = await getContactInquiriesForExport(filters);
  const auditRows = await Promise.all(rows.map(row => getContactInquiryAuditHistory(row.id)));
  return rows.map((row, index) => ({ ...row, auditHistory: auditRows[index] }));
}

export async function getContactInquiryCategoryCounts(days = 30) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const rows = await db.select({ category: contactInquiries.category, count: sql<number>`count(*)` }).from(contactInquiries).where(gte(contactInquiries.createdAt, fromDate)).groupBy(contactInquiries.category).orderBy(desc(sql`count(*)`));
  return rows.map(row => ({ category: row.category, count: Number(row.count) }));
}

export type AdminRevenueFilters = { fromDate?: Date; toDate?: Date };
export async function getAdminRevenueReport(filters: AdminRevenueFilters = {}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const from = filters.fromDate ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const to = filters.toDate ?? new Date();
  const assessmentRows = await db.select({ paidAt: assessmentAttempts.paidAt, reference: assessmentAttempts.paystackReference }).from(assessmentAttempts).where(and(eq(assessmentAttempts.paymentStatus, "paid"), isNotNull(assessmentAttempts.paidAt), gte(assessmentAttempts.paidAt, from), lte(assessmentAttempts.paidAt, to)));
  const careerRows = await db.select({ paidAt: careerPathAttempts.paidAt, reference: careerPathAttempts.paystackReference }).from(careerPathAttempts).where(and(eq(careerPathAttempts.paymentStatus, "paid"), isNotNull(careerPathAttempts.paidAt), gte(careerPathAttempts.paidAt, from), lte(careerPathAttempts.paidAt, to)));
  const courseRows = await db.select({ paidAt: coursePaymentStages.paidAt, reference: coursePaymentStages.paystackReference, amountKes: coursePaymentStages.amountKes }).from(coursePaymentStages).where(and(eq(coursePaymentStages.paymentStatus, "paid"), isNotNull(coursePaymentStages.paidAt), gte(coursePaymentStages.paidAt, from), lte(coursePaymentStages.paidAt, to)));
  const transactions = [
    ...assessmentRows.map(row => ({ source: "Self-assessment", amountKes: 20, paidAt: row.paidAt as Date, reference: row.reference })),
    ...careerRows.map(row => ({ source: "CareerPath", amountKes: 20, paidAt: row.paidAt as Date, reference: row.reference })),
    ...courseRows.map(row => ({ source: "Professional course", amountKes: Number(row.amountKes), paidAt: row.paidAt as Date, reference: row.reference })),
  ].sort((a, b) => b.paidAt.getTime() - a.paidAt.getTime());
  const bySource = new Map<string, { source: string; revenueKes: number; transactions: number }>();
  const byDay = new Map<string, { date: string; revenueKes: number; transactions: number }>();
  for (const transaction of transactions) {
    const source = bySource.get(transaction.source) ?? { source: transaction.source, revenueKes: 0, transactions: 0 };
    source.revenueKes += transaction.amountKes; source.transactions += 1; bySource.set(transaction.source, source);
    const date = transaction.paidAt.toISOString().slice(0, 10);
    const day = byDay.get(date) ?? { date, revenueKes: 0, transactions: 0 };
    day.revenueKes += transaction.amountKes; day.transactions += 1; byDay.set(date, day);
  }
  const totalRevenueKes = transactions.reduce((sum, transaction) => sum + transaction.amountKes, 0);
  return { fromDate: from, toDate: to, totalRevenueKes, transactionCount: transactions.length, averageTransactionKes: transactions.length ? Math.round(totalRevenueKes / transactions.length) : 0, bySource: Array.from(bySource.values()).sort((a, b) => b.revenueKes - a.revenueKes), trend: Array.from(byDay.values()).sort((a, b) => a.date.localeCompare(b.date)), transactions: transactions.slice(0, 100) };
}

export type ContactInquiryActor = { openId: string; name?: string | null; email?: string | null };

async function recordContactInquiryAudit(db: Awaited<ReturnType<typeof getDb>>, input: { inquiryId: number; actor: ContactInquiryActor; action: "status" | "notes" | "assignment" | "workload"; previousValue?: string | null; nextValue?: string | null }) {
  if (!db) throw new Error("Database is not available");
  await db.insert(contactInquiryAuditLogs).values({ inquiryId: input.inquiryId, actorOpenId: input.actor.openId, actorName: input.actor.name ?? null, actorEmail: input.actor.email ?? null, action: input.action, previousValue: input.previousValue ?? null, nextValue: input.nextValue ?? null });
}

export async function createStaffInvitation(input: { email: string; name: string; role: "staff" | "admin"; tokenHash: string; invitedByOpenId: string; expiresAt: Date }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(staffInvitations).values(input);
  return Number(result[0].insertId);
}

export async function listStaffInvitations() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.select().from(staffInvitations).orderBy(desc(staffInvitations.createdAt)).limit(100);
}

export async function consumeStaffInvitation(tokenHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const invitation = (await db.select().from(staffInvitations).where(and(eq(staffInvitations.tokenHash, tokenHash), isNull(staffInvitations.acceptedAt), gte(staffInvitations.expiresAt, new Date()))).limit(1))[0];
  if (!invitation) return undefined;
  await db.update(staffInvitations).set({ acceptedAt: new Date() }).where(eq(staffInvitations.id, invitation.id));
  return invitation;
}

export async function updateUserRole(openId: string, role: "user" | "staff" | "admin") {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(users).set({ role }).where(eq(users.openId, openId));
  return getUserByOpenId(openId);
}

export async function updateContactInquiryWorkload(id: number, workload: { dueDate: Date | null; priority: "low" | "normal" | "high" | "urgent" }, actor: ContactInquiryActor) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const previous = (await db.select({ dueDate: contactInquiries.dueDate, priority: contactInquiries.priority }).from(contactInquiries).where(eq(contactInquiries.id, id)).limit(1))[0];
  await db.update(contactInquiries).set({ dueDate: workload.dueDate, priority: workload.priority }).where(eq(contactInquiries.id, id));
  const previousValue = JSON.stringify({ dueDate: previous?.dueDate?.toISOString() ?? null, priority: previous?.priority ?? "normal" });
  const nextValue = JSON.stringify({ dueDate: workload.dueDate?.toISOString() ?? null, priority: workload.priority });
  if (previousValue !== nextValue) await recordContactInquiryAudit(db, { inquiryId: id, actor, action: "workload", previousValue, nextValue });
  return (await db.select().from(contactInquiries).where(eq(contactInquiries.id, id)).limit(1))[0] ?? null;
}

export async function getStaffPerformanceSummary(input: { fromDate?: Date; toDate?: Date } = {}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const members = await db.select({ openId: users.openId, name: users.name, email: users.email, role: users.role }).from(users).where(or(eq(users.role, "admin"), eq(users.role, "staff"))).orderBy(users.name);
  const inquiries = await db.select().from(contactInquiries).where(isNotNull(contactInquiries.assignedToOpenId));
  const inRange = (date: Date) => (!input.fromDate || date >= input.fromDate) && (!input.toDate || date <= input.toDate);
  const audits = await db.select().from(contactInquiryAuditLogs).where(eq(contactInquiryAuditLogs.action, "status"));
  return members.map(member => {
    const assigned = inquiries.filter(row => row.assignedToOpenId === member.openId && inRange(row.createdAt));
    const completed = assigned.filter(row => row.status === "closed");
    const durations = completed.map(row => { const closed = audits.find(audit => audit.inquiryId === row.id && audit.nextValue === "closed"); return closed ? Math.max(0, (closed.createdAt.getTime() - row.createdAt.getTime()) / 86400000) : null; }).filter((value): value is number => value !== null);
    return { ...member, assignedCount: assigned.length, completedCount: completed.length, openCount: assigned.length - completed.length, averageResolutionDays: durations.length ? Math.round((durations.reduce((sum, value) => sum + value, 0) / durations.length) * 10) / 10 : null };
  });
}

export async function getAdminTeamMembers() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.select({ openId: users.openId, name: users.name, email: users.email, role: users.role }).from(users).where(or(eq(users.role, "admin"), eq(users.role, "staff"))).orderBy(users.name);
}

export async function getContactInquiryAuditHistory(inquiryId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.select().from(contactInquiryAuditLogs).where(eq(contactInquiryAuditLogs.inquiryId, inquiryId)).orderBy(desc(contactInquiryAuditLogs.createdAt)).limit(100);
}

export async function updateContactInquiryNotes(id: number, internalNotes: string, actor?: ContactInquiryActor) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const previous = (await db.select({ internalNotes: contactInquiries.internalNotes }).from(contactInquiries).where(eq(contactInquiries.id, id)).limit(1))[0]?.internalNotes ?? null;
  const next = internalNotes.trim() || null;
  await db.update(contactInquiries).set({ internalNotes: next }).where(eq(contactInquiries.id, id));
  if (actor && previous !== next) await recordContactInquiryAudit(db, { inquiryId: id, actor, action: "notes", previousValue: previous, nextValue: next });
  return (await db.select().from(contactInquiries).where(eq(contactInquiries.id, id)).limit(1))[0] ?? null;
}

export async function listAssignedContactInquiries(openId: string, input: Omit<ContactInquiryFilters, "assignedToOpenId"> & { page: number; pageSize: number }) {
  return listContactInquiries({ ...input, assignedToOpenId: openId });
}

async function assertAssignedInquiry(id: number, openId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const row = (await db.select().from(contactInquiries).where(and(eq(contactInquiries.id, id), eq(contactInquiries.assignedToOpenId, openId))).limit(1))[0];
  if (!row) throw new Error("This inquiry is not assigned to your staff account.");
  return row;
}

export async function updateAssignedContactInquiryStatus(id: number, openId: string, status: "new" | "contacted" | "closed", actor: ContactInquiryActor) {
  await assertAssignedInquiry(id, openId);
  return updateContactInquiryStatus(id, status, actor);
}

export async function updateAssignedContactInquiryNotes(id: number, openId: string, internalNotes: string, actor: ContactInquiryActor) {
  await assertAssignedInquiry(id, openId);
  return updateContactInquiryNotes(id, internalNotes, actor);
}

export async function updateContactInquiryStatus(id: number, status: "new" | "contacted" | "closed", actor?: ContactInquiryActor) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const previous = (await db.select({ status: contactInquiries.status }).from(contactInquiries).where(eq(contactInquiries.id, id)).limit(1))[0]?.status ?? null;
  await db.update(contactInquiries).set({ status }).where(eq(contactInquiries.id, id));
  if (actor && previous !== status) await recordContactInquiryAudit(db, { inquiryId: id, actor, action: "status", previousValue: previous, nextValue: status });
  return (await db.select().from(contactInquiries).where(eq(contactInquiries.id, id)).limit(1))[0] ?? null;
}

export async function updateContactInquiryAssignment(id: number, assignment: { openId: string | null; name: string | null }, actor: ContactInquiryActor) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const previous = (await db.select({ openId: contactInquiries.assignedToOpenId, name: contactInquiries.assignedToName }).from(contactInquiries).where(eq(contactInquiries.id, id)).limit(1))[0];
  await db.update(contactInquiries).set({ assignedToOpenId: assignment.openId, assignedToName: assignment.name }).where(eq(contactInquiries.id, id));
  const previousValue = previous?.openId ? `${previous.name ?? ""} (${previous.openId})` : null;
  const nextValue = assignment.openId ? `${assignment.name ?? ""} (${assignment.openId})` : null;
  if (previousValue !== nextValue) await recordContactInquiryAudit(db, { inquiryId: id, actor, action: "assignment", previousValue, nextValue });
  return (await db.select().from(contactInquiries).where(eq(contactInquiries.id, id)).limit(1))[0] ?? null;
}

export async function bulkUpdateContactInquiryStatus(ids: number[], status: "new" | "contacted" | "closed", actor?: ContactInquiryActor) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  if (!ids.length) return 0;
  for (const id of ids) await updateContactInquiryStatus(id, status, actor);
  return ids.length;
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

function auditHistoryConditions(filters: AuditHistoryFilters) {
  const conditions = [];
  if (filters.adminSearch) { const search = `%${filters.adminSearch}%`; conditions.push(or(like(verificationRevocationAudits.actorName, search), like(verificationRevocationAudits.actorEmail, search), like(verificationRevocationAudits.actorOpenId, search))); }
  if (filters.fromDate) conditions.push(gte(verificationRevocationAudits.createdAt, filters.fromDate));
  if (filters.toDate) conditions.push(lte(verificationRevocationAudits.createdAt, filters.toDate));
  return conditions;
}

export async function getVerificationRevocationAuditsPage(input: AuditHistoryQuery): Promise<AuditHistoryPage> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const { page: requestedPage, pageSize } = clampAuditPagination(input.page, input.pageSize);
  const conditions = auditHistoryConditions(input);
  const where = conditions.length ? and(...conditions) : undefined;
  const countRows = await db.select({ count: sql<number>`count(*)` }).from(verificationRevocationAudits).where(where);
  const total = Number(countRows[0]?.count ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const rows = await db.select().from(verificationRevocationAudits).where(where).orderBy(desc(verificationRevocationAudits.createdAt)).limit(pageSize).offset((page - 1) * pageSize);
  return { rows, total, totalPages, page, pageSize };
}

export async function getVerificationRevocationAudits(limit = 50) {
  const page = await getVerificationRevocationAuditsPage({ page: 1, pageSize: limit });
  return page.rows;
}

export async function getVerificationRevocationAuditsForExport(filters: AuditHistoryFilters = {}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const conditions = auditHistoryConditions(filters);
  return db.select().from(verificationRevocationAudits).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(verificationRevocationAudits.createdAt)).limit(10000);
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

export async function getOrCreateCourseEnrollment(input: { userOpenId: string; courseSlug: string; name: string; email: string; amountKes: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const existing = (await db.select().from(courseLearnerEnrollments).where(and(eq(courseLearnerEnrollments.userOpenId, input.userOpenId), eq(courseLearnerEnrollments.courseSlug, input.courseSlug))).limit(1))[0];
  if (existing) return existing;
  const result = await db.insert(courseLearnerEnrollments).values({ userOpenId: input.userOpenId, courseSlug: input.courseSlug, name: input.name, email: input.email });
  const enrollmentId = Number(result[0].insertId);
  await db.insert(coursePaymentStages).values([1, 2, 3, 4].map((stage) => ({ enrollmentId, stage, amountKes: input.amountKes })));
  return (await db.select().from(courseLearnerEnrollments).where(eq(courseLearnerEnrollments.id, enrollmentId)).limit(1))[0];
}
export async function getCourseEnrollment(userOpenId: string, courseSlug: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return (await db.select().from(courseLearnerEnrollments).where(and(eq(courseLearnerEnrollments.userOpenId, userOpenId), eq(courseLearnerEnrollments.courseSlug, courseSlug))).limit(1))[0] ?? undefined;
}
export async function listCourseEnrollmentState(userOpenId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const enrollments = await db.select().from(courseLearnerEnrollments).where(eq(courseLearnerEnrollments.userOpenId, userOpenId)).orderBy(desc(courseLearnerEnrollments.updatedAt));
  return Promise.all(enrollments.map(async (enrollment) => ({ enrollment, lessons: await db.select().from(courseLessonProgress).where(eq(courseLessonProgress.enrollmentId, enrollment.id)), quizAttempts: await db.select().from(courseQuizAttempts).where(eq(courseQuizAttempts.enrollmentId, enrollment.id)).orderBy(desc(courseQuizAttempts.createdAt)), stages: await db.select().from(coursePaymentStages).where(eq(coursePaymentStages.enrollmentId, enrollment.id)).orderBy(coursePaymentStages.stage), certificates: await db.select().from(courseCertificates).where(eq(courseCertificates.enrollmentId, enrollment.id)).orderBy(desc(courseCertificates.createdAt)) })));
}
export async function markCourseLessonComplete(enrollmentId: number, lessonId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(courseLessonProgress).values({ enrollmentId, lessonId }).onDuplicateKeyUpdate({ set: { completedAt: new Date() } });
}
export async function recordCourseQuizAttempt(input: { enrollmentId: number; moduleId: string; score: number; passed: boolean; answers: unknown }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(courseQuizAttempts).values(input);
  return Number(result[0].insertId);
}
export async function getCoursePaymentStageByReference(reference: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return (await db.select().from(coursePaymentStages).where(eq(coursePaymentStages.paystackReference, reference)).limit(1))[0] ?? undefined;
}
export async function setCoursePaymentStageReference(id: number, reference: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(coursePaymentStages).set({ paystackReference: reference, initializedAt: new Date() }).where(eq(coursePaymentStages.id, id));
}
export async function markCoursePaymentStagePaid(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(coursePaymentStages).set({ paymentStatus: "paid", paidAt: new Date() }).where(and(eq(coursePaymentStages.id, id), eq(coursePaymentStages.paymentStatus, "pending")));
}
export async function createCourseCertificate(input: { enrollmentId: number; recipientName: string; courseTitle: string; certificateNumber: string; fileKey?: string; fileUrl?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const existing = (await db.select().from(courseCertificates).where(eq(courseCertificates.enrollmentId, input.enrollmentId)).limit(1))[0];
  if (existing) return existing;
  const result = await db.insert(courseCertificates).values(input);
  return (await db.select().from(courseCertificates).where(eq(courseCertificates.id, Number(result[0].insertId))).limit(1))[0];
}

export async function getCareerPathActiveModule(userOpenId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return (await db.select().from(careerPathActiveModules).where(eq(careerPathActiveModules.userOpenId, userOpenId)).limit(1))[0] ?? null;
}

export async function upsertCareerPathActiveModule(userOpenId: string, moduleIndex: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(careerPathActiveModules).values({ userOpenId, moduleIndex }).onDuplicateKeyUpdate({ set: { moduleIndex, updatedAt: new Date() } });
  return getCareerPathActiveModule(userOpenId);
}

export async function countUserSocialShares(userOpenId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const rows = await db.select({ eventName: analyticsEvents.eventName, count: sql<number>`count(*)` }).from(analyticsEvents).where(eq(analyticsEvents.userOpenId, userOpenId)).groupBy(analyticsEvents.eventName);
  return Object.fromEntries(rows.filter((row) => row.eventName.startsWith("careerpath_shared_")).map((row) => [row.eventName.replace("careerpath_shared_", ""), Number(row.count)]));
}

export async function getCareerPathShareAnalytics() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const rows = await db.select({ eventName: analyticsEvents.eventName, count: sql<number>`count(*)` }).from(analyticsEvents).where(like(analyticsEvents.eventName, "careerpath_shared_%")).groupBy(analyticsEvents.eventName);
  return rows.map((row) => ({ platform: row.eventName.replace("careerpath_shared_", ""), count: Number(row.count) })).sort((a, b) => b.count - a.count);
}


export async function listOrganizationInvitations(input: { status?: string; search?: string; from?: Date; to?: Date; limit?: number; offset?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const conditions = [
    input.status && input.status !== "all" ? eq(organizationInvitations.status, input.status) : undefined,
    input.search?.trim() ? or(like(organizationInvitations.organizationName, `%${input.search.trim()}%`), like(organizationInvitations.organizationEmail, `%${input.search.trim()}%`)) : undefined,
    input.from ? gte(organizationInvitations.createdAt, input.from) : undefined,
    input.to ? lte(organizationInvitations.createdAt, input.to) : undefined,
  ].filter(Boolean) as Array<ReturnType<typeof eq>>;
  return db.select().from(organizationInvitations).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(organizationInvitations.createdAt)).limit(Math.min(500, Math.max(1, input.limit ?? 100))).offset(Math.max(0, input.offset ?? 0));
}

export async function listOrganizationApprovalEvents(input: { search?: string; from?: Date; to?: Date; page?: number; pageSize?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const conditions = [
    input.search?.trim() ? or(like(organizationApprovalEvents.organizationName, `%${input.search.trim()}%`), like(organizationApprovalEvents.organizationEmail, `%${input.search.trim()}%`), like(organizationApprovalEvents.eventType, `%${input.search.trim()}%`)) : undefined,
    input.from ? gte(organizationApprovalEvents.createdAt, input.from) : undefined,
    input.to ? lte(organizationApprovalEvents.createdAt, input.to) : undefined,
  ].filter(Boolean) as Array<ReturnType<typeof eq>>;
  const where = conditions.length ? and(...conditions) : undefined;
  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, input.pageSize ?? 20));
  const [rows, totalRows, trendRows] = await Promise.all([
    db.select().from(organizationApprovalEvents).where(where).orderBy(desc(organizationApprovalEvents.createdAt)).limit(pageSize).offset((page - 1) * pageSize),
    db.select({ count: sql<number>`count(*)` }).from(organizationApprovalEvents).where(where),
    db.select({ bucket: sql<string>`DATE_FORMAT(${organizationApprovalEvents.createdAt}, '%Y-%m-%d')`, eventType: organizationApprovalEvents.eventType, count: sql<number>`count(*)` }).from(organizationApprovalEvents).where(where).groupBy(sql`DATE_FORMAT(${organizationApprovalEvents.createdAt}, '%Y-%m-%d')`, organizationApprovalEvents.eventType).orderBy(sql`DATE_FORMAT(${organizationApprovalEvents.createdAt}, '%Y-%m-%d')`),
  ]);
  return { rows, total: Number(totalRows[0]?.count ?? 0), page, pageSize, totalPages: Math.max(1, Math.ceil(Number(totalRows[0]?.count ?? 0) / pageSize)), trends: trendRows.map((row) => ({ bucket: row.bucket, eventType: row.eventType, count: Number(row.count) })) };
}

export async function reviewOrganizationInvitation(input: { id: number; actorOpenId: string; status: "approved" | "rejected"; note?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const invitation = (await db.select().from(organizationInvitations).where(eq(organizationInvitations.id, input.id)).limit(1))[0];
  if (!invitation) return undefined;
  const now = new Date();
  await db.update(organizationInvitations).set({ status: input.status, reviewedAt: now, reviewedByOpenId: input.actorOpenId, reviewNote: input.note?.trim() || null }).where(and(eq(organizationInvitations.id, input.id), eq(organizationInvitations.status, "pending")));
  await db.insert(organizationApprovalEvents).values({ invitationId: invitation.id, organizationName: invitation.organizationName, organizationEmail: invitation.organizationEmail, requesterOpenId: invitation.requesterOpenId, actorOpenId: input.actorOpenId, eventType: input.status, note: input.note?.trim() || null, createdAt: now });
  return { ...invitation, status: input.status, reviewedAt: now };
}

export async function markOrganizationReminderSent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const now = new Date();
  await db.update(organizationInvitations).set({ reminderSentAt: now }).where(and(eq(organizationInvitations.id, id), eq(organizationInvitations.status, "pending"), isNull(organizationInvitations.reminderSentAt), gte(organizationInvitations.expiresAt, now)));
  return now;
}

export async function createOrganizationInvitation(input: { organizationName: string; organizationEmail: string; requesterOpenId: string; reportType: string; reportId: number; tokenHash: string; expiresAt: Date }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(organizationInvitations).values({ organizationName: input.organizationName, organizationEmail: input.organizationEmail, requesterOpenId: input.requesterOpenId, reportType: input.reportType, reportId: input.reportId, tokenHash: input.tokenHash, expiresAt: input.expiresAt, status: "pending" });
  return { id: Number(result[0].insertId), expiresAt: input.expiresAt };
}

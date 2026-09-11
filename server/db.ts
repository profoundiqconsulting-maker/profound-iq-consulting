import { createHash, randomBytes } from "node:crypto";
import {
  and,
  asc,
  desc,
  eq,
  gte,
  inArray,
  isNull,
  isNotNull,
  like,
  lt,
  lte,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  normalizeLeaderboardDisplayName,
  rankAchievementLeaderboard,
  type AchievementBadge,
  type AchievementLeaderboardRow,
} from "../shared/achievements";
import { courseCatalog } from "../shared/courseCatalog";
import { buildCourseModuleBadges } from "../shared/courseBadges";
import {
  adminAnalyticsSettings,
  adminCertificateSettings,
  certificateUsageEvents,
  adminSecuritySettings,
  adminSystemSettings,
  siteSeoSettings,
  analyticsEvents,
  assessmentAttempts,
  assessmentDrafts,
  assessmentReflectionResponses,
  careerPathAttempts,
  careerPathActiveModules,
  reportShares,
  reportShareAuditEvents,
  authLoginAttempts,
  courseEnrollments,
  contactInquiries,
  contactInquiryAuditLogs,
  courseLearnerEnrollments,
  courseAccessGrants,
  courseAccessGrantAudits,
  courseLessonProgress,
  courseLessonResponses,
  courseLessonResponseReviews,
  courseLessonResponseNotifications,
  courseLessonIllustrationBookmarks,
  courseSavedCourses,
  courseRecommendationHistory,
  courseQuizAttempts,
  coursePaymentStages,
  coursePaymentEvents,
  courseActivePositions,
  courseCertificates,
  courseDeliveryEvents,
  catalogItems,
  deliveryLogExportJobs,
  emailPreviewDeliveries,
  emailTemplates,
  InsertAssessmentAttempt,
  InsertUser,
  loginEvents,
  loginUnlockAudits,
  scheduledExportRuns,
  scheduledExports,
  userSessions,
  users,
  verificationRevocationAudits,
  organizationInvitations,
  organizationApprovalEvents,
  staffInvitations,
  psychometricAttempts,
  psychometricDeliveryAcknowledgementLogs,
  psychometricRecommendationFeedback,
  unlockAuditExportDownloads,
  resetLinkRevocationAudits,
  newsletterSubscribers,
  insightArticles as insightArticlesTable,
  conversations,
  messages,
  messageNotifications,
  type Conversation,
  type Message,
  type MessageNotification,
} from "../drizzle/schema";
import { compareReports, type AssessmentReport } from "../shared/assessment";
import {
  aggregateWeeklyAnalytics,
  summarizeAnalyticsEvents,
} from "../shared/adminAnalytics";
import { normalizeLoginAnalyticsRows } from "../shared/loginAnalytics";
import { summarizeCertificateUsageRows } from "../shared/certificateAnalytics";
import { selectAdminNotificationRecipients } from "../shared/adminRecipients";
import type {
  DeliveryLogFilters,
  DeliveryLogRow,
} from "../shared/adminDeliveryLog";
import {
  clampAuditPagination,
  type AuditHistoryFilters,
  type AuditHistoryPage,
  type AuditHistoryQuery,
} from "../shared/adminAudit";
import { ENV } from "./_core/env";
import { CERTIFICATE_SIGNATURE_DATA_URI } from "./certificateSignature";
import {
  insightArticles as bundledInsightArticles,
  type InsightArticle,
} from "../shared/insightsArticles";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function createPsychometricAttempt(input: {
  testSlug: string;
  name: string;
  email: string;
  answers: unknown;
  consentedAt: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db
    .insert(psychometricAttempts)
    .values({
      ...input,
      paymentStatus: "pending",
      reportEmailStatus: "pending",
    });
  return Number(result[0].insertId);
}

export async function setPsychometricPaystackReference(
  id: number,
  reference: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(psychometricAttempts)
    .set({ paystackReference: reference })
    .where(eq(psychometricAttempts.id, id));
}

export async function getPsychometricAttemptByReference(reference: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const rows = await db
    .select()
    .from(psychometricAttempts)
    .where(eq(psychometricAttempts.paystackReference, reference))
    .limit(1);
  return rows[0] ?? null;
}

export async function markPsychometricPaid(id: number, report: unknown) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(psychometricAttempts)
    .set({ paymentStatus: "paid", report, paidAt: new Date() })
    .where(eq(psychometricAttempts.id, id));
}

export async function listPsychometricAttemptsByEmail(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db
    .select()
    .from(psychometricAttempts)
    .where(eq(psychometricAttempts.email, email))
    .orderBy(desc(psychometricAttempts.createdAt));
}

export async function getAdminNotificationRecipients(): Promise<string[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      role: users.role,
      email: users.email,
      emailVerifiedAt: users.emailVerifiedAt,
    })
    .from(users)
    .where(
      and(
        eq(users.role, "admin"),
        isNotNull(users.email),
        isNotNull(users.emailVerifiedAt)
      )
    );
  return selectAdminNotificationRecipients(rows);
}

export async function recordLoginEvent(input: {
  openId?: string | null;
  identifierType: string;
  success: boolean;
  failureCode?: string | null;
  networkHash: string;
  networkAddress?: string | null;
  userAgent?: string | null;
  deviceType?: string | null;
  estimatedLocation?: string | null;
  createdAt?: Date;
}) {
  const db = await getDb();
  if (!db) return;
  try {
    await db
      .insert(loginEvents)
      .values({ ...input, createdAt: input.createdAt ?? new Date() });
  } catch {
    // ignore logging failures
  }
}

export async function getLoginEventsForUser(input: {
  openId: string;
  limit?: number;
  deviceType?: string;
  locationSearch?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const conditions = [
    eq(loginEvents.openId, input.openId),
    input.deviceType && input.deviceType !== "all"
      ? eq(loginEvents.deviceType, input.deviceType)
      : undefined,
    input.locationSearch
      ? like(loginEvents.estimatedLocation, `%${input.locationSearch.trim()}%`)
      : undefined,
  ].filter(Boolean) as Array<ReturnType<typeof eq>>;
  return db
    .select({
      id: loginEvents.id,
      identifierType: loginEvents.identifierType,
      success: loginEvents.success,
      failureCode: loginEvents.failureCode,
      userAgent: loginEvents.userAgent,
      deviceType: loginEvents.deviceType,
      estimatedLocation: loginEvents.estimatedLocation,
      createdAt: loginEvents.createdAt,
    })
    .from(loginEvents)
    .where(and(...conditions))
    .orderBy(desc(loginEvents.createdAt))
    .limit(Math.min(25, Math.max(1, input.limit ?? 10)));
}

export async function getFailedLoginEvents(input: {
  from?: Date;
  to?: Date;
  ipSearch?: string;
  locationSearch?: string;
  limit: number;
  offset: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const conditions = [eq(loginEvents.success, false)];
  if (input.from) conditions.push(gte(loginEvents.createdAt, input.from));
  if (input.to) conditions.push(lte(loginEvents.createdAt, input.to));
  if (input.ipSearch)
    conditions.push(
      like(loginEvents.networkAddress, `%${input.ipSearch.trim()}%`)
    );
  if (input.locationSearch)
    conditions.push(
      like(
        loginEvents.estimatedLocation,
        `%${input.locationSearch.trim().toUpperCase()}%`
      )
    );
  return db
    .select()
    .from(loginEvents)
    .where(and(...conditions))
    .orderBy(desc(loginEvents.createdAt))
    .limit(input.limit)
    .offset(input.offset);
}

export async function countFailedLoginEvents(input: {
  from?: Date;
  to?: Date;
  ipSearch?: string;
  locationSearch?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const conditions = [eq(loginEvents.success, false)];
  if (input.from) conditions.push(gte(loginEvents.createdAt, input.from));
  if (input.to) conditions.push(lte(loginEvents.createdAt, input.to));
  if (input.ipSearch)
    conditions.push(
      like(loginEvents.networkAddress, `%${input.ipSearch.trim()}%`)
    );
  if (input.locationSearch)
    conditions.push(
      like(
        loginEvents.estimatedLocation,
        `%${input.locationSearch.trim().toUpperCase()}%`
      )
    );
  const row = (
    await db
      .select({ count: sql<number>`count(*)` })
      .from(loginEvents)
      .where(and(...conditions))
  )[0];
  return Number(row?.count ?? 0);
}

export async function getLoginSecurityAnalytics(
  input: { from?: Date; to?: Date; granularity?: "daily" | "weekly" } = {}
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const loginConditions = [
    input.from ? gte(loginEvents.createdAt, input.from) : undefined,
    input.to ? lte(loginEvents.createdAt, input.to) : undefined,
  ].filter(Boolean) as Array<ReturnType<typeof gte>>;
  const sessionConditions = [
    input.from ? gte(userSessions.createdAt, input.from) : undefined,
    input.to ? lte(userSessions.createdAt, input.to) : undefined,
  ].filter(Boolean) as Array<ReturnType<typeof gte>>;
  const bucket = (value: Date) => {
    if (input.granularity === "daily") return value.toISOString().slice(0, 10);
    const start = new Date(Date.UTC(value.getUTCFullYear(), 0, 1));
    const day = Math.floor((value.getTime() - start.getTime()) / 86400000);
    return `${value.getUTCFullYear()}-W${String(Math.floor((day + start.getUTCDay()) / 7) + 1).padStart(2, "0")}`;
  };
  const [loginSource, deviceSource] = await Promise.all([
    db
      .select({
        createdAt: loginEvents.createdAt,
        success: loginEvents.success,
        failureCode: loginEvents.failureCode,
      })
      .from(loginEvents)
      .where(loginConditions.length ? and(...loginConditions) : undefined),
    db
      .select({
        createdAt: userSessions.createdAt,
        deviceType: userSessions.deviceType,
      })
      .from(userSessions)
      .where(sessionConditions.length ? and(...sessionConditions) : undefined),
  ]);
  const loginMap = new Map<string, number>();
  loginSource.forEach(row => {
    const key = `${bucket(row.createdAt)}::${row.success}::${row.failureCode ?? ""}`;
    loginMap.set(key, (loginMap.get(key) ?? 0) + 1);
  });
  const deviceMap = new Map<string, number>();
  deviceSource.forEach(row => {
    const key = `${bucket(row.createdAt)}::${row.deviceType ?? "unknown"}`;
    deviceMap.set(key, (deviceMap.get(key) ?? 0) + 1);
  });
  return normalizeLoginAnalyticsRows(
    Array.from(loginMap.entries()).map(([key, count]) => {
      const [week, success, failureCode] = key.split("::");
      return {
        week,
        success: success === "true",
        failureCode: failureCode || null,
        count,
      };
    }),
    Array.from(deviceMap.entries()).map(([key, count]) => {
      const [week, deviceType] = key.split("::");
      return { week, deviceType, count };
    })
  );
}

export async function getAdminSecuritySettings(adminOpenId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return (
    (
      await db
        .select()
        .from(adminSecuritySettings)
        .where(eq(adminSecuritySettings.adminOpenId, adminOpenId))
        .limit(1)
    )[0] ?? {
      id: 0,
      adminOpenId,
      alertThreshold: 5,
      reviewWindowDays: 7,
      loginEventRetentionDays: 90,
      lockoutWindowSeconds: 60,
      updatedAt: new Date(0),
    }
  );
}

export async function getEffectiveLoginAlertThreshold() {
  const db = await getDb();
  if (!db) return 5;
  try {
    const row = (
      await db
        .select({
          threshold: sql<number>`min(${adminSecuritySettings.alertThreshold})`,
        })
        .from(adminSecuritySettings)
    )[0];
    return Math.max(3, Math.min(20, Number(row?.threshold ?? 5)));
  } catch {
    return 5;
  }
}

export async function getEffectiveLoginLockoutWindowSeconds() {
  const db = await getDb();
  if (!db) return 60;
  try {
    const row = (
      await db
        .select({
          window: sql<number>`min(${adminSecuritySettings.lockoutWindowSeconds})`,
        })
        .from(adminSecuritySettings)
    )[0];
    return Math.max(60, Math.min(86400, Number(row?.window ?? 60)));
  } catch {
    return 60;
  }
}

export async function getEffectiveLoginEventRetentionDays(adminOpenId: string) {
  const settings = await getAdminSecuritySettings(adminOpenId);
  return Math.max(
    30,
    Math.min(365, Number(settings.loginEventRetentionDays ?? 90))
  );
}

export async function purgeExpiredLoginEvents(
  retentionDays: number,
  now = new Date()
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const cutoff = new Date(
    now.getTime() -
      Math.max(30, Math.min(365, retentionDays)) * 24 * 60 * 60 * 1000
  );
  await db.delete(loginEvents).where(lt(loginEvents.createdAt, cutoff));
  return cutoff;
}

export async function saveAdminSecuritySettings(
  adminOpenId: string,
  input: {
    alertThreshold: number;
    reviewWindowDays: number;
    loginEventRetentionDays: number;
    lockoutWindowSeconds: number;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .insert(adminSecuritySettings)
    .values({ adminOpenId, ...input })
    .onDuplicateKeyUpdate({ set: input });
  return getAdminSecuritySettings(adminOpenId);
}

export async function getAdminSystemSettings(adminOpenId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db
    .select()
    .from(adminSystemSettings)
    .where(eq(adminSystemSettings.updatedByOpenId, adminOpenId));
}

export async function upsertAdminSystemSetting(
  adminOpenId: string,
  settingKey: string,
  settingValue: string,
  masked = "plain"
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .insert(adminSystemSettings)
    .values({ settingKey, settingValue, masked, updatedByOpenId: adminOpenId })
    .onDuplicateKeyUpdate({
      set: { settingValue, masked, updatedByOpenId: adminOpenId },
    });
  return { settingKey, settingValue, masked };
}

export async function createConversation(input: {
  participantOpenIds: string[];
  subject?: string;
  contextType: string;
  contextId?: string;
  createdByOpenId: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const [conversation] = await db
    .insert(conversations)
    .values({
      participantOpenIds: input.participantOpenIds,
      subject: input.subject ?? null,
      contextType: input.contextType,
      contextId: input.contextId ?? null,
      createdByOpenId: input.createdByOpenId,
    })
    .$returningId();
  return conversation;
}

export async function getConversation(id: number, openId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const conversation = (
    await db.select().from(conversations).where(eq(conversations.id, id)).limit(1)
  )[0] as Conversation | undefined;
  if (!conversation || !(conversation.participantOpenIds as string[]).includes(openId)) return null;
  const conversationMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(messages.createdAt);
  return { ...conversation, messages: conversationMessages };
}

export async function createMessage(input: {
  conversationId: number;
  senderOpenId: string;
  senderName: string;
  senderRole: string;
  body: string;
  htmlBody?: string;
  attachmentUrls?: string[];
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const [message] = await db
    .insert(messages)
    .values({
      conversationId: input.conversationId,
      senderOpenId: input.senderOpenId,
      senderName: input.senderName,
      senderRole: input.senderRole,
      body: input.body,
      htmlBody: input.htmlBody ?? null,
      attachmentUrls: input.attachmentUrls ?? [],
    })
    .$returningId();
  await db
    .update(conversations)
    .set({ lastMessageAt: new Date() })
    .where(eq(conversations.id, input.conversationId));
  return message;
}

export async function listConversationsForUser(
  openId: string,
  filters?: { contextType?: string; status?: string }
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const all = await db
    .select()
    .from(conversations)
    .orderBy(desc(conversations.lastMessageAt ?? conversations.createdAt)) as Conversation[];
  return all.filter((conversation) => {
    if (!(conversation.participantOpenIds as string[]).includes(openId)) return false;
    if (filters?.contextType && conversation.contextType !== filters.contextType) return false;
    if (filters?.status && conversation.status !== filters.status) return false;
    return true;
  });
}

export async function getUnreadMessageCount(openId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const userConversations = (await db
    .select({ id: conversations.id, participantOpenIds: conversations.participantOpenIds })
    .from(conversations)) as Pick<Conversation, "id" | "participantOpenIds">[];
  let count = 0;
  for (const conversation of userConversations) {
    if (!(conversation.participantOpenIds as string[]).includes(openId)) continue;
    const unread = await db
      .select()
      .from(messages)
      .where(and(eq(messages.conversationId, conversation.id), sql`NOT JSON_CONTAINS(${messages.readBy}, JSON_OBJECT(?, true), '$')`));
    count += unread.filter(message => message.senderOpenId !== openId).length;
  }
  return count;
}

export async function markMessageRead(messageId: number, openId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(messages)
    .set({ readBy: sql`JSON_SET(COALESCE(${messages.readBy}, '{}'), ?, true)` })
    .where(eq(messages.id, messageId));
}

export async function createMessageNotification(input: {
  userOpenId: string;
  messageId: number;
  conversationId: number;
  type: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(messageNotifications).values(input);
}

export async function listMessageNotifications(openId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.select().from(messageNotifications).where(eq(messageNotifications.userOpenId, openId)).orderBy(desc(messageNotifications.createdAt));
}

export async function markNotificationRead(notificationId: number, openId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(messageNotifications)
    .set({ sentEmail: true, emailSentAt: new Date() })
    .where(and(eq(messageNotifications.id, notificationId), eq(messageNotifications.userOpenId, openId)));
}

export async function createUserSession(input: {
  openId: string;
  tokenHash: string;
  networkHash?: string | null;
  userAgent?: string | null;
  deviceType?: string | null;
  estimatedLocation?: string | null;
  trustedDevice?: boolean;
  trustExpiresAt?: Date | null;
  createdAt?: Date;
  expiresAt: Date;
}) {
  const db = await getDb();
  if (!db) return;
  try {
    const now = input.createdAt ?? new Date();
    await db
      .insert(userSessions)
      .values({ ...input, createdAt: now, lastSeenAt: now });
  } catch {
    // ignore session creation failures
  }
}

export async function getSessionByTokenHash(tokenHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return (
    (
      await db
        .select()
        .from(userSessions)
        .where(eq(userSessions.tokenHash, tokenHash))
        .limit(1)
    )[0] ?? undefined
  );
}

export async function touchUserSession(sessionId: number, now = new Date()) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(userSessions)
    .set({ lastSeenAt: now })
    .where(and(eq(userSessions.id, sessionId), isNull(userSessions.revokedAt)));
}

export async function getUserSessions(openId: string, now = new Date()) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db
    .select({
      id: userSessions.id,
      openId: userSessions.openId,
      userAgent: userSessions.userAgent,
      deviceType: userSessions.deviceType,
      estimatedLocation: userSessions.estimatedLocation,
      trustedDevice: userSessions.trustedDevice,
      trustExpiresAt: userSessions.trustExpiresAt,
      createdAt: userSessions.createdAt,
      lastSeenAt: userSessions.lastSeenAt,
      expiresAt: userSessions.expiresAt,
      revokedAt: userSessions.revokedAt,
    })
    .from(userSessions)
    .where(
      and(
        eq(userSessions.openId, openId),
        isNull(userSessions.revokedAt),
        gte(userSessions.expiresAt, now)
      )
    )
    .orderBy(desc(userSessions.lastSeenAt));
}

export async function revokeUserSession(openId: string, sessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(userSessions)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(userSessions.id, sessionId),
        eq(userSessions.openId, openId),
        isNull(userSessions.revokedAt)
      )
    );
}

export async function revokeOtherUserSessions(
  openId: string,
  currentTokenHash: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(userSessions)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(userSessions.openId, openId),
        sql`${userSessions.tokenHash} <> ${currentTokenHash}`,
        isNull(userSessions.revokedAt)
      )
    );
}

export async function checkLoginRateLimit(
  identifierHash: string,
  networkHash: string,
  now = new Date()
) {
  const db = await getDb();
  if (!db)
    return {
      blocked: false,
      failedCount: 0,
      unlockAt: null as Date | null,
      windowSeconds: 60,
    };
  try {
    const windowSeconds = await getEffectiveLoginLockoutWindowSeconds();
    const windowMs = windowSeconds * 1000;
    const row = (
      await db
        .select()
        .from(authLoginAttempts)
        .where(
          and(
            eq(authLoginAttempts.identifierHash, identifierHash),
            eq(authLoginAttempts.networkHash, networkHash)
          )
        )
        .limit(1)
    )[0];
    if (!row)
      return {
        blocked: false,
        failedCount: 0,
        unlockAt: null as Date | null,
        windowSeconds,
      };
    const windowAge = now.getTime() - row.windowStartedAt.getTime();
    if (windowAge >= windowMs) {
      await db
        .delete(authLoginAttempts)
        .where(eq(authLoginAttempts.id, row.id));
      return {
        blocked: false,
        failedCount: 0,
        unlockAt: null as Date | null,
        windowSeconds,
      };
    }
    const blocked = row.failedCount >= 5;
    return {
      blocked,
      failedCount: row.failedCount,
      unlockAt: blocked
        ? new Date(row.windowStartedAt.getTime() + windowMs)
        : null,
      windowSeconds,
    };
  } catch {
    return {
      blocked: false,
      failedCount: 0,
      unlockAt: null as Date | null,
      windowSeconds: 60,
    };
  }
}

export async function recordFailedLogin(
  identifierHash: string,
  networkHash: string,
  now = new Date(),
  alertThreshold = 5
) {
  const db = await getDb();
  if (!db) return { failedCount: 1, shouldAlert: false };
  try {
    const windowMs = (await getEffectiveLoginLockoutWindowSeconds()) * 1000;
    const existing = (
      await db
        .select()
        .from(authLoginAttempts)
        .where(
          and(
            eq(authLoginAttempts.identifierHash, identifierHash),
            eq(authLoginAttempts.networkHash, networkHash)
          )
        )
        .limit(1)
    )[0];
    if (
      !existing ||
      now.getTime() - existing.windowStartedAt.getTime() >= windowMs
    ) {
      if (existing)
        await db
          .delete(authLoginAttempts)
          .where(eq(authLoginAttempts.id, existing.id));
      await db
        .insert(authLoginAttempts)
        .values({
          identifierHash,
          networkHash,
          failedCount: 1,
          windowStartedAt: now,
          lastFailedAt: now,
        });
      return { failedCount: 1, shouldAlert: false };
    }
    const nextCount = existing.failedCount + 1;
    const shouldAlert = nextCount >= alertThreshold && !existing.alertSentAt;
    await db
      .update(authLoginAttempts)
      .set({
        failedCount: nextCount,
        lastFailedAt: now,
        alertSentAt: shouldAlert ? now : existing.alertSentAt,
      })
      .where(eq(authLoginAttempts.id, existing.id));
    return { failedCount: nextCount, shouldAlert };
  } catch {
    return { failedCount: 1, shouldAlert: false };
  }
}

export async function clearLoginFailures(
  identifierHash: string,
  networkHash: string
) {
  const db = await getDb();
  if (!db) return;
  try {
    await db
      .delete(authLoginAttempts)
      .where(
        and(
          eq(authLoginAttempts.identifierHash, identifierHash),
          eq(authLoginAttempts.networkHash, networkHash)
        )
      );
  } catch {
    // ignore cleanup failures
  }
}
export async function unlockUserLoginFailures(input: {
  targetOpenId: string;
  actorOpenId: string;
  actorName?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const user = (
    await db
      .select({
        openId: users.openId,
        email: users.email,
        phone: users.phone,
        username: users.username,
      })
      .from(users)
      .where(eq(users.openId, input.targetOpenId))
      .limit(1)
  )[0];
  if (!user) return { clearedAttemptCount: 0, targetEmail: null };
  const identifiers = [user.email, user.phone, user.username]
    .filter((value): value is string => Boolean(value))
    .map(value =>
      createHash("sha256")
        .update(
          value.trim().includes("@")
            ? value.trim().toLowerCase()
            : value
                .trim()
                .replace(/[\s().-]/g, "")
                .toLowerCase()
        )
        .digest("hex")
    );
  if (!identifiers.length)
    return { clearedAttemptCount: 0, targetEmail: user.email };
  const result = await db
    .delete(authLoginAttempts)
    .where(inArray(authLoginAttempts.identifierHash, identifiers));
  const clearedAttemptCount = Number(result[0].affectedRows ?? 0);
  await db
    .insert(loginUnlockAudits)
    .values({
      targetOpenId: input.targetOpenId,
      targetEmail: user.email,
      actorOpenId: input.actorOpenId,
      actorName: input.actorName ?? null,
      clearedAttemptCount,
    });
  return { clearedAttemptCount, targetEmail: user.email };
}

export async function recordResetLinkRevocationAudit(input: {
  targetOpenId: string;
  targetEmail: string;
  actorOpenId: string;
  actorName?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(resetLinkRevocationAudits).values(input);
}
export async function getResetLinkRevocationAudits(
  input: {
    page?: number;
    pageSize?: number;
    search?: string;
    actorSearch?: string;
    from?: Date;
    to?: Date;
  } = {}
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.min(50, Math.max(5, input.pageSize ?? 10));
  const filters = [];
  if (input.search?.trim()) {
    const q = `%${input.search.trim()}%`;
    filters.push(
      or(
        like(resetLinkRevocationAudits.targetEmail, q),
        like(resetLinkRevocationAudits.actorName, q),
        like(resetLinkRevocationAudits.actorOpenId, q)
      )
    );
  }
  if (input.actorSearch?.trim()) {
    const q = `%${input.actorSearch.trim()}%`;
    filters.push(
      or(
        like(resetLinkRevocationAudits.actorName, q),
        like(resetLinkRevocationAudits.actorOpenId, q)
      )
    );
  }
  if (input.from)
    filters.push(gte(resetLinkRevocationAudits.revokedAt, input.from));
  if (input.to)
    filters.push(lte(resetLinkRevocationAudits.revokedAt, input.to));
  const where = filters.length ? and(...filters) : undefined;
  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(resetLinkRevocationAudits)
      .where(where)
      .orderBy(desc(resetLinkRevocationAudits.revokedAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ count: sql<number>`count(*)` })
      .from(resetLinkRevocationAudits)
      .where(where),
  ]);
  const total = Number(totalRows[0]?.count ?? 0);
  return {
    rows,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}
export async function recordUnlockAuditExportDownload(input: {
  adminOpenId: string;
  adminName?: string | null;
  filename: string;
  filterSummary?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(unlockAuditExportDownloads).values(input);
}
export async function getUnlockAuditExportDownloads(
  input: {
    page?: number;
    pageSize?: number;
    search?: string;
    from?: Date;
    to?: Date;
  } = {}
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.min(50, Math.max(5, input.pageSize ?? 10));
  const filters = [];
  if (input.search?.trim()) {
    const q = `%${input.search.trim()}%`;
    filters.push(
      or(
        like(unlockAuditExportDownloads.adminName, q),
        like(unlockAuditExportDownloads.adminOpenId, q),
        like(unlockAuditExportDownloads.filename, q)
      )
    );
  }
  if (input.from)
    filters.push(gte(unlockAuditExportDownloads.createdAt, input.from));
  if (input.to)
    filters.push(lte(unlockAuditExportDownloads.createdAt, input.to));
  const where = filters.length ? and(...filters) : undefined;
  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(unlockAuditExportDownloads)
      .where(where)
      .orderBy(desc(unlockAuditExportDownloads.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ count: sql<number>`count(*)` })
      .from(unlockAuditExportDownloads)
      .where(where),
  ]);
  const total = Number(totalRows[0]?.count ?? 0);
  return {
    rows,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}
export async function getLoginUnlockAudits(
  input: {
    page?: number;
    pageSize?: number;
    targetSearch?: string;
    from?: Date;
    to?: Date;
  } = {}
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.min(50, Math.max(5, input.pageSize ?? 10));
  const search = input.targetSearch?.trim();
  const conditions = [
    search
      ? or(
          like(loginUnlockAudits.targetEmail, `%${search}%`),
          like(loginUnlockAudits.targetOpenId, `%${search}%`),
          like(loginUnlockAudits.actorName, `%${search}%`)
        )
      : undefined,
    input.from ? gte(loginUnlockAudits.createdAt, input.from) : undefined,
    input.to ? lte(loginUnlockAudits.createdAt, input.to) : undefined,
  ].filter(Boolean) as Array<ReturnType<typeof eq>>;
  const where = conditions.length ? and(...conditions) : undefined;
  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(loginUnlockAudits)
      .where(where)
      .orderBy(desc(loginUnlockAudits.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ count: sql<number>`count(*)` })
      .from(loginUnlockAudits)
      .where(where),
  ]);
  const total = Number(totalRows[0]?.count ?? 0);
  return {
    rows,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}
export async function getFailedLoginRegions(
  input: { from?: Date; to?: Date } = {}
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const conditions = [
    eq(loginEvents.success, false),
    input.from ? gte(loginEvents.createdAt, input.from) : undefined,
    input.to ? lte(loginEvents.createdAt, input.to) : undefined,
  ].filter(Boolean) as Array<ReturnType<typeof eq>>;
  const rows = await db
    .select({
      location: loginEvents.estimatedLocation,
      count: sql<number>`count(*)`,
    })
    .from(loginEvents)
    .where(and(...conditions))
    .groupBy(loginEvents.estimatedLocation)
    .orderBy(desc(sql<number>`count(*)`));
  return rows.map(row => ({
    location: row.location ?? "Unknown",
    count: Number(row.count),
  }));
}
export async function findUserByLocalIdentifier(identifier: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const normalized = identifier.toLowerCase();
  return (
    (
      await db
        .select()
        .from(users)
        .where(
          or(
            sql`lower(${users.email}) = ${normalized}`,
            sql`lower(${users.phone}) = ${normalized}`,
            sql`lower(${users.username}) = ${normalized}`
          )
        )
        .limit(1)
    )[0] ?? undefined
  );
}

export async function createLocalUser(input: {
  openId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  username?: string | null;
  passwordHash: string;
  role?: "user" | "staff" | "admin";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .insert(users)
    .values({ ...input, loginMethod: "password", role: input.role ?? "user" });
  return getUserByOpenId(input.openId);
}

export async function setPasswordResetToken(
  openId: string,
  tokenHash: string | null,
  expiresAt: Date | null
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(users)
    .set({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: expiresAt,
    })
    .where(eq(users.openId, openId));
}

export async function consumePasswordResetToken(
  tokenHash: string,
  passwordHash: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const user = (
    await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.passwordResetTokenHash, tokenHash),
          gte(users.passwordResetExpiresAt, new Date())
        )
      )
      .limit(1)
  )[0];
  if (!user) return undefined;
  await db
    .update(users)
    .set({
      passwordHash,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
    })
    .where(
      and(eq(users.id, user.id), eq(users.passwordResetTokenHash, tokenHash))
    );
  return getUserByOpenId(user.openId);
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod", "avatarUrl"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.email?.trim()) {
    values.emailVerifiedAt = new Date();
    updateSet.emailVerifiedAt = new Date();
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db
    .insert(users)
    .values(values)
    .onDuplicateKeyUpdate({ set: updateSet });
}

export type NotificationPreferences = {
  assessmentUpdates: boolean;
  courseAnnouncements: boolean;
  monthlyInsights: boolean;
  showAvatar?: boolean;
};

export async function getUserProfile(openId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db
    .select({
      id: users.id,
      openId: users.openId,
      name: users.name,
      email: users.email,
      role: users.role,
      notificationPreferences: users.notificationPreferences,
      avatarUrl: users.avatarUrl,
      timezone: users.timezone,
      learningGoals: users.learningGoals,
      recommendationAnswers: users.recommendationAnswers,
      leaderboardOptIn: users.leaderboardOptIn,
      leaderboardDisplayName: users.leaderboardDisplayName,
      exportPreferences: users.exportPreferences,
      exportLogoUrl: users.exportLogoUrl,
    })
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);
  const profile = result[0];
  if (!profile) return undefined;
  return {
    ...profile,
    notificationPreferences: {
      assessmentUpdates: true,
      courseAnnouncements: true,
      monthlyInsights: false,
      showAvatar: true,
      ...((profile.notificationPreferences as Partial<NotificationPreferences> | null) ??
        {}),
    },
    avatarUrl: profile.avatarUrl,
    timezone: profile.timezone ?? "Africa/Nairobi",
    leaderboardOptIn: profile.leaderboardOptIn,
    leaderboardDisplayName: profile.leaderboardDisplayName,
    exportPreferences: {
      pageSize: "A4",
      watermark: true,
      coverPage: false,
      coverTemplate: "classic",
      ...((profile.exportPreferences as Partial<{
        pageSize: "A4" | "LETTER";
        watermark: boolean;
        coverPage: boolean;
        coverTemplate: "classic" | "editorial" | "signal";
      }> | null) ?? {}),
    },
    exportLogoUrl: profile.exportLogoUrl ?? null,
  };
}

export async function updateUserProfile(
  openId: string,
  input: {
    name: string;
    timezone: string;
    learningGoals?: string[];
    notificationPreferences: NotificationPreferences;
    leaderboardOptIn?: boolean;
    leaderboardDisplayName?: string | null;
    exportPreferences?: {
      pageSize: "A4" | "LETTER";
      watermark: boolean;
      coverPage: boolean;
      coverTemplate?: "classic" | "editorial" | "signal";
    };
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(users)
    .set({
      name: input.name,
      timezone: input.timezone,
      learningGoals: input.learningGoals ?? [],
      notificationPreferences: input.notificationPreferences,
      ...(input.exportPreferences
        ? { exportPreferences: input.exportPreferences }
        : {}),
      ...(input.leaderboardOptIn === undefined
        ? {}
        : {
            leaderboardOptIn: input.leaderboardOptIn,
            leaderboardDisplayName: input.leaderboardOptIn
              ? normalizeLeaderboardDisplayName(
                  input.leaderboardDisplayName,
                  normalizeLeaderboardDisplayName(input.name)
                )
              : null,
          }),
    })
    .where(eq(users.openId, openId));
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
  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);
  return result[0];
}

export async function createAssessmentAttempt(
  input: Pick<InsertAssessmentAttempt, "name" | "email" | "answers">
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db
    .insert(assessmentAttempts)
    .values({ ...input, paymentStatus: "pending", consentedAt: new Date() });
  return Number(result[0].insertId);
}

export async function createAssessmentDraft(input: {
  name: string;
  email: string;
  answers: unknown;
  currentModule: number;
  expiresAt: Date;
}) {
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
  const rows = await db
    .select()
    .from(assessmentDrafts)
    .where(
      and(
        eq(assessmentDrafts.tokenHash, tokenHash),
        gte(assessmentDrafts.expiresAt, new Date())
      )
    )
    .limit(1);
  return rows[0] ?? undefined;
}

export async function markAssessmentDraftResumed(id: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(assessmentDrafts)
    .set({ resumedAt: new Date() })
    .where(eq(assessmentDrafts.id, id));
}

export async function createCareerPathAttempt(input: {
  name: string;
  email: string;
  answers: unknown;
  personalNotes?: string | null;
  receiptTitle?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db
    .insert(careerPathAttempts)
    .values({ ...input, paymentStatus: "pending", consentedAt: new Date() });
  return Number(result[0].insertId);
}

export async function listCareerPathAttemptsByEmail(email: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: careerPathAttempts.id,
      name: careerPathAttempts.name,
      email: careerPathAttempts.email,
      paystackReference: careerPathAttempts.paystackReference,
      paymentStatus: careerPathAttempts.paymentStatus,
      report: careerPathAttempts.report,
      reportEmailStatus: careerPathAttempts.reportEmailStatus,
      reportEmailSentAt: careerPathAttempts.reportEmailSentAt,
      receiptTitle: careerPathAttempts.receiptTitle,
      createdAt: careerPathAttempts.createdAt,
      paidAt: careerPathAttempts.paidAt,
    })
    .from(careerPathAttempts)
    .where(eq(careerPathAttempts.email, email))
    .orderBy(desc(careerPathAttempts.createdAt))
    .limit(50);
}

export async function claimCareerPathReportEmail(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const staleBefore = new Date(Date.now() - 10 * 60 * 1000);
  const result = await db
    .update(careerPathAttempts)
    .set({ reportEmailStatus: "sending", reportEmailClaimedAt: new Date() })
    .where(
      and(
        eq(careerPathAttempts.id, id),
        eq(careerPathAttempts.paymentStatus, "paid"),
        isNotNull(careerPathAttempts.report),
        or(
          eq(careerPathAttempts.reportEmailStatus, "pending"),
          and(
            eq(careerPathAttempts.reportEmailStatus, "sending"),
            or(
              isNull(careerPathAttempts.reportEmailClaimedAt),
              lt(careerPathAttempts.reportEmailClaimedAt, staleBefore)
            )
          )
        )
      )
    );
  return Number(result[0].affectedRows ?? 0) > 0;
}

export async function markCareerPathReportEmailSent(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(careerPathAttempts)
    .set({
      reportEmailStatus: "sent",
      reportEmailSentAt: new Date(),
      reportEmailClaimedAt: null,
    })
    .where(
      and(
        eq(careerPathAttempts.id, id),
        eq(careerPathAttempts.reportEmailStatus, "sending")
      )
    );
}

export async function releaseCareerPathReportEmailClaim(
  id: number
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(careerPathAttempts)
    .set({ reportEmailStatus: "pending", reportEmailClaimedAt: null })
    .where(
      and(
        eq(careerPathAttempts.id, id),
        eq(careerPathAttempts.reportEmailStatus, "sending")
      )
    );
}

export async function setCareerPathPaystackReference(
  id: number,
  reference: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(careerPathAttempts)
    .set({ paystackReference: reference })
    .where(eq(careerPathAttempts.id, id));
}

export async function getCareerPathAttemptByReference(reference: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(careerPathAttempts)
    .where(eq(careerPathAttempts.paystackReference, reference))
    .limit(1);
  return result[0];
}

export async function markCareerPathPaid(id: number, report: unknown) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(careerPathAttempts)
    .set({ paymentStatus: "paid", report, paidAt: new Date() })
    .where(eq(careerPathAttempts.id, id));
}

export async function setPaystackReference(id: number, reference: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(assessmentAttempts)
    .set({ paystackReference: reference })
    .where(eq(assessmentAttempts.id, id));
}

export async function getAssessmentAttempt(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(assessmentAttempts)
    .where(eq(assessmentAttempts.id, id))
    .limit(1);
  return result[0];
}

export async function getAssessmentAttemptByReference(reference: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(assessmentAttempts)
    .where(eq(assessmentAttempts.paystackReference, reference))
    .limit(1);
  return result[0];
}

export async function markAssessmentPaid(id: number, report: AssessmentReport) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(assessmentAttempts)
    .set({ paymentStatus: "paid", report, paidAt: new Date() })
    .where(eq(assessmentAttempts.id, id));
}

export async function claimAssessmentReportEmail(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const staleBefore = new Date(Date.now() - 10 * 60 * 1000);
  const result = await db
    .update(assessmentAttempts)
    .set({ reportEmailStatus: "sending", reportEmailClaimedAt: new Date() })
    .where(
      and(
        eq(assessmentAttempts.id, id),
        eq(assessmentAttempts.paymentStatus, "paid"),
        isNotNull(assessmentAttempts.report),
        or(
          eq(assessmentAttempts.reportEmailStatus, "pending"),
          and(
            eq(assessmentAttempts.reportEmailStatus, "sending"),
            or(
              isNull(assessmentAttempts.reportEmailClaimedAt),
              lt(assessmentAttempts.reportEmailClaimedAt, staleBefore)
            )
          )
        )
      )
    );
  return Number(result[0].affectedRows ?? 0) > 0;
}

export async function markAssessmentReportEmailSent(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(assessmentAttempts)
    .set({
      reportEmailStatus: "sent",
      reportEmailSentAt: new Date(),
      reportEmailClaimedAt: null,
    })
    .where(
      and(
        eq(assessmentAttempts.id, id),
        eq(assessmentAttempts.reportEmailStatus, "sending")
      )
    );
}

export async function releaseAssessmentReportEmailClaim(
  id: number
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(assessmentAttempts)
    .set({ reportEmailStatus: "pending", reportEmailClaimedAt: null })
    .where(
      and(
        eq(assessmentAttempts.id, id),
        eq(assessmentAttempts.reportEmailStatus, "sending")
      )
    );
}

export async function getLatestPaidAssessment(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(assessmentAttempts)
    .where(eq(assessmentAttempts.email, email))
    .orderBy(desc(assessmentAttempts.createdAt))
    .limit(20);
  return result.find(item => item.paymentStatus === "paid");
}

export async function listReflectionResponses(input: {
  attemptId: number;
  ownerOpenId: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const attempt = (
    await db
      .select({
        id: assessmentAttempts.id,
        paymentStatus: assessmentAttempts.paymentStatus,
      })
      .from(assessmentAttempts)
      .where(
        and(
          eq(assessmentAttempts.id, input.attemptId),
          eq(assessmentAttempts.paymentStatus, "paid")
        )
      )
      .limit(1)
  )[0];
  if (!attempt) return undefined;
  return db
    .select()
    .from(assessmentReflectionResponses)
    .where(
      and(
        eq(assessmentReflectionResponses.attemptId, input.attemptId),
        eq(assessmentReflectionResponses.ownerOpenId, input.ownerOpenId)
      )
    )
    .orderBy(
      assessmentReflectionResponses.dimensionKey,
      assessmentReflectionResponses.promptIndex
    );
}

export async function saveReflectionResponse(input: {
  attemptId: number;
  ownerOpenId: string;
  dimensionKey: string;
  promptIndex: number;
  promptText: string;
  note: string;
  status: "planned" | "active" | "reviewed";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const attempt = (
    await db
      .select({
        id: assessmentAttempts.id,
        paymentStatus: assessmentAttempts.paymentStatus,
      })
      .from(assessmentAttempts)
      .where(
        and(
          eq(assessmentAttempts.id, input.attemptId),
          eq(assessmentAttempts.paymentStatus, "paid")
        )
      )
      .limit(1)
  )[0];
  if (!attempt) return undefined;
  const existing = (
    await db
      .select({ id: assessmentReflectionResponses.id })
      .from(assessmentReflectionResponses)
      .where(
        and(
          eq(assessmentReflectionResponses.attemptId, input.attemptId),
          eq(assessmentReflectionResponses.ownerOpenId, input.ownerOpenId),
          eq(assessmentReflectionResponses.dimensionKey, input.dimensionKey),
          eq(assessmentReflectionResponses.promptIndex, input.promptIndex)
        )
      )
      .limit(1)
  )[0];
  if (existing) {
    await db
      .update(assessmentReflectionResponses)
      .set({
        promptText: input.promptText,
        note: input.note.trim() || null,
        status: input.status,
        updatedAt: new Date(),
      })
      .where(eq(assessmentReflectionResponses.id, existing.id));
  } else {
    await db
      .insert(assessmentReflectionResponses)
      .values({
        attemptId: input.attemptId,
        ownerOpenId: input.ownerOpenId,
        dimensionKey: input.dimensionKey,
        promptIndex: input.promptIndex,
        promptText: input.promptText,
        note: input.note.trim() || null,
        status: input.status,
      });
  }
  return (
    await db
      .select()
      .from(assessmentReflectionResponses)
      .where(
        and(
          eq(assessmentReflectionResponses.attemptId, input.attemptId),
          eq(assessmentReflectionResponses.ownerOpenId, input.ownerOpenId),
          eq(assessmentReflectionResponses.dimensionKey, input.dimensionKey),
          eq(assessmentReflectionResponses.promptIndex, input.promptIndex)
        )
      )
      .limit(1)
  )[0];
}

export async function getUserAssessmentHistory(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  const rows = await db
    .select({
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
    })
    .from(assessmentAttempts)
    .where(eq(assessmentAttempts.email, email))
    .orderBy(desc(assessmentAttempts.createdAt))
    .limit(50);

  return rows
    .map(row => ({
      id: row.id,
      createdAt: row.createdAt,
      paidAt: row.paidAt,
      reportEmailStatus: row.reportEmailStatus,
      reportEmailSentAt: row.reportEmailSentAt,
      paymentStatus: row.paymentStatus,
      paystackReference: row.paystackReference,
      overallScore:
        (row.report as AssessmentReport | null)?.overallScore ?? null,
      overallBand: (row.report as AssessmentReport | null)?.overallBand ?? null,
      dimensionScores:
        row.paymentStatus === "paid"
          ? ((row.report as AssessmentReport | null)?.dimensions ?? []).map(
              dimension => ({
                key: dimension.key,
                label: dimension.label,
                score: dimension.score,
              })
            )
          : [],
      report: row.paymentStatus === "paid" ? row.report : null,
    }))
    .map((item, index, items) => ({
      ...item,
      version: `v${items.length - index}`,
    }));
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
  coverImageUrl?: string | null;
  priceKes: number;
  published: boolean;
  createdByOpenId: string;
};

export async function listPublishedCatalogItems() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db
    .select()
    .from(catalogItems)
    .where(eq(catalogItems.published, true))
    .orderBy(catalogItems.createdAt);
}

export async function listCatalogItemsForAdmin() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.select().from(catalogItems).orderBy(desc(catalogItems.createdAt));
}

export async function updateCatalogItemCoverImage(
  id: number,
  coverImageUrl: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(catalogItems)
    .set({ coverImageUrl })
    .where(eq(catalogItems.id, id));
  return (
    (
      await db
        .select()
        .from(catalogItems)
        .where(eq(catalogItems.id, id))
        .limit(1)
    )[0] ?? null
  );
}

export async function createCatalogItem(input: CatalogItemInput) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(catalogItems).values({ ...input, outcomes: input.outcomes });
  return (
    await db
      .select()
      .from(catalogItems)
      .where(eq(catalogItems.slug, input.slug))
      .limit(1)
  )[0];
}

function hashReportShareToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createReportShare(input: {
  attemptId: number;
  ownerOpenId: string;
  lens: string;
  recipientPurpose?: string | null;
  expiresAt: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = hashReportShareToken(rawToken);
  await db
    .insert(reportShares)
    .values({
      attemptId: input.attemptId,
      ownerOpenId: input.ownerOpenId,
      lens: input.lens,
      recipientPurpose: input.recipientPurpose ?? null,
      tokenHash,
      expiresAt: input.expiresAt,
    });
  const created = await db
    .select({ id: reportShares.id })
    .from(reportShares)
    .where(eq(reportShares.tokenHash, tokenHash))
    .limit(1);
  const shareId = created[0]?.id;
  if (!shareId) throw new Error("Report share could not be created");
  await db.insert(reportShareAuditEvents).values([
    {
      shareId,
      attemptId: input.attemptId,
      ownerOpenId: input.ownerOpenId,
      eventType: "consented",
      recipientPurpose: input.recipientPurpose ?? null,
    },
    {
      shareId,
      attemptId: input.attemptId,
      ownerOpenId: input.ownerOpenId,
      eventType: "created",
      recipientPurpose: input.recipientPurpose ?? null,
    },
  ]);
  return rawToken;
}

export async function getActiveReportShare(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db
    .select({ share: reportShares, attempt: assessmentAttempts })
    .from(reportShares)
    .innerJoin(
      assessmentAttempts,
      eq(reportShares.attemptId, assessmentAttempts.id)
    )
    .where(
      and(
        eq(reportShares.tokenHash, hashReportShareToken(token)),
        isNull(reportShares.revokedAt),
        gte(reportShares.expiresAt, new Date())
      )
    )
    .limit(1);
  const row = rows[0];
  if (!row || row.attempt.paymentStatus !== "paid" || !row.attempt.report)
    return undefined;
  return { share: row.share, attempt: row.attempt };
}

export async function revokeReportShare(ownerOpenId: string, shareId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const existing = await db
    .select()
    .from(reportShares)
    .where(
      and(
        eq(reportShares.id, shareId),
        eq(reportShares.ownerOpenId, ownerOpenId),
        isNull(reportShares.revokedAt)
      )
    )
    .limit(1);
  if (!existing[0]) return;
  await db
    .update(reportShares)
    .set({ revokedAt: new Date() })
    .where(eq(reportShares.id, shareId));
  await db
    .insert(reportShareAuditEvents)
    .values({
      shareId,
      attemptId: existing[0].attemptId,
      ownerOpenId,
      eventType: "revoked",
      recipientPurpose: existing[0].recipientPurpose ?? null,
    });
}

export async function listReportShareAuditEvents(
  ownerOpenId: string,
  filters?: {
    attemptId?: number;
    eventType?: "consented" | "created" | "revoked";
  }
) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(reportShareAuditEvents)
    .where(
      and(
        eq(reportShareAuditEvents.ownerOpenId, ownerOpenId),
        filters?.attemptId
          ? eq(reportShareAuditEvents.attemptId, filters.attemptId)
          : undefined,
        filters?.eventType
          ? eq(reportShareAuditEvents.eventType, filters.eventType)
          : undefined
      )
    )
    .orderBy(desc(reportShareAuditEvents.createdAt))
    .limit(100);
}

export async function listReportShares(
  ownerOpenId: string,
  attemptId?: number
) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(reportShares)
    .where(
      and(
        eq(reportShares.ownerOpenId, ownerOpenId),
        attemptId ? eq(reportShares.attemptId, attemptId) : undefined
      )
    )
    .orderBy(desc(reportShares.createdAt))
    .limit(50);
}

export async function compareUserAssessmentReports(
  email: string,
  currentAttemptId: number,
  previousAttemptId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const rows = await db
    .select({
      id: assessmentAttempts.id,
      createdAt: assessmentAttempts.createdAt,
      paymentStatus: assessmentAttempts.paymentStatus,
      report: assessmentAttempts.report,
    })
    .from(assessmentAttempts)
    .where(
      and(
        eq(assessmentAttempts.email, email),
        or(
          eq(assessmentAttempts.id, currentAttemptId),
          eq(assessmentAttempts.id, previousAttemptId)
        )
      )
    );
  const current = rows.find(row => row.id === currentAttemptId);
  const previous = rows.find(row => row.id === previousAttemptId);
  if (
    !current ||
    !previous ||
    current.paymentStatus !== "paid" ||
    previous.paymentStatus !== "paid" ||
    !current.report ||
    !previous.report
  )
    return undefined;
  return {
    current: { id: current.id, createdAt: current.createdAt },
    previous: { id: previous.id, createdAt: previous.createdAt },
    comparison: compareReports(
      current.report as AssessmentReport,
      previous.report as AssessmentReport
    ),
  };
}

export async function getCourseShareAnalytics(
  input: { from?: Date; to?: Date; excludeAdminShares?: boolean } = {}
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const readRows = async (from?: Date, to?: Date) => {
    const conditions = [
      eq(analyticsEvents.eventName, "course_shared"),
      from ? gte(analyticsEvents.createdAt, from) : undefined,
      to ? lte(analyticsEvents.createdAt, to) : undefined,
    ].filter(Boolean) as Array<ReturnType<typeof eq>>;
    const rows = await db
      .select({
        metadata: analyticsEvents.metadata,
        createdAt: analyticsEvents.createdAt,
      })
      .from(analyticsEvents)
      .where(and(...conditions));
    return input.excludeAdminShares
      ? rows.filter(row => {
          const metadata =
            row.metadata &&
            typeof row.metadata === "object" &&
            !Array.isArray(row.metadata)
              ? (row.metadata as Record<string, unknown>)
              : {};
          return metadata.source !== "admin-preview";
        })
      : rows;
  };
  const rows = await readRows(input.from, input.to);
  const byCourse = new Map<string, number>();
  const byPlatform = new Map<string, number>();
  const matrix = new Map<string, number>();
  const trend = new Map<string, number>();
  const comparisonShareTrend = new Map<string, number>();
  const byComparison = new Map<string, number>();
  for (const row of rows) {
    const metadata =
      row.metadata &&
      typeof row.metadata === "object" &&
      !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : {};
    const course =
      typeof metadata.courseSlug === "string" && metadata.courseSlug.trim()
        ? metadata.courseSlug
        : "unknown-course";
    const platform =
      typeof metadata.platform === "string" && metadata.platform.trim()
        ? metadata.platform
        : "unknown";
    const comparison =
      typeof metadata.comparisonSlugs === "string"
        ? metadata.comparisonSlugs
            .split(",")
            .map(slug => {
              try {
                return decodeURIComponent(slug);
              } catch {
                return slug;
              }
            })
            .map(slug => slug.trim())
            .filter(Boolean)
            .sort()
            .join(" vs ")
        : "";
    byCourse.set(course, (byCourse.get(course) ?? 0) + 1);
    byPlatform.set(platform, (byPlatform.get(platform) ?? 0) + 1);
    if (comparison) {
      byComparison.set(comparison, (byComparison.get(comparison) ?? 0) + 1);
      const day = new Date(row.createdAt).toISOString().slice(0, 10);
      comparisonShareTrend.set(day, (comparisonShareTrend.get(day) ?? 0) + 1);
    }
    const key = `${course}::${platform}`;
    matrix.set(key, (matrix.get(key) ?? 0) + 1);
    const day = new Date(row.createdAt).toISOString().slice(0, 10);
    trend.set(day, (trend.get(day) ?? 0) + 1);
  }
  let comparisonTrend: Array<{ date: string; shares: number }> = [];
  let comparisonTotal = 0;
  if (input.from && input.to) {
    const durationMs = Math.max(
      86_400_000,
      input.to.getTime() - input.from.getTime() + 1
    );
    const previousTo = new Date(input.from.getTime() - 1);
    const previousFrom = new Date(previousTo.getTime() - durationMs + 1);
    const previousRows = await readRows(previousFrom, previousTo);
    comparisonTotal = previousRows.length;
    const previous = new Map<string, number>();
    for (const row of previousRows) {
      const day = new Date(row.createdAt).toISOString().slice(0, 10);
      previous.set(day, (previous.get(day) ?? 0) + 1);
    }
    comparisonTrend = Array.from(previous, ([date, shares]) => ({
      date,
      shares,
    })).sort((a, b) => a.date.localeCompare(b.date));
  }
  return {
    total: rows.length,
    comparisonTotal,
    byCourse: Array.from(byCourse, ([courseSlug, shares]) => ({
      courseSlug,
      shares,
    })).sort((a, b) => b.shares - a.shares),
    byPlatform: Array.from(byPlatform, ([platform, shares]) => ({
      platform,
      shares,
    })).sort((a, b) => b.shares - a.shares),
    byComparison: Array.from(byComparison, ([comparison, shares]) => ({
      comparison,
      shares,
    })).sort((a, b) => b.shares - a.shares),
    comparisonShareTrend: Array.from(
      comparisonShareTrend,
      ([date, shares]) => ({ date, shares })
    ).sort((a, b) => a.date.localeCompare(b.date)),
    matrix: Array.from(matrix, ([key, shares]) => {
      const [courseSlug, platform] = key.split("::");
      return { courseSlug, platform, shares };
    }).sort((a, b) => b.shares - a.shares),
    trend: Array.from(trend, ([date, shares]) => ({ date, shares })).sort(
      (a, b) => a.date.localeCompare(b.date)
    ),
    comparisonTrend,
  };
}

export async function getCourseAccessDeniedAnalytics(
  filters: {
    fromDate?: Date;
    toDate?: Date;
    cohort?: string;
    deviceType?: string;
  } = {}
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const conditions = [
    eq(analyticsEvents.eventName, "course_lesson_access_denied"),
    filters.fromDate
      ? gte(analyticsEvents.createdAt, filters.fromDate)
      : undefined,
    filters.toDate ? lte(analyticsEvents.createdAt, filters.toDate) : undefined,
  ].filter(Boolean) as Array<ReturnType<typeof eq>>;
  let rows = await db
    .select({
      id: analyticsEvents.id,
      userOpenId: analyticsEvents.userOpenId,
      metadata: analyticsEvents.metadata,
      createdAt: analyticsEvents.createdAt,
    })
    .from(analyticsEvents)
    .where(and(...conditions))
    .orderBy(desc(analyticsEvents.createdAt))
    .limit(1000);
  rows = rows.filter(row => {
    const metadata =
      row.metadata &&
      typeof row.metadata === "object" &&
      !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : {};
    return (
      (!filters.cohort || metadata.cohort === filters.cohort) &&
      (!filters.deviceType || metadata.deviceType === filters.deviceType)
    );
  });
  const summary = new Map<
    string,
    {
      courseSlug: string;
      moduleIndex: number;
      requiredStage: number;
      deniedCount: number;
      uniqueUsers: Set<string>;
    }
  >();
  for (const row of rows) {
    const metadata = (
      row.metadata && typeof row.metadata === "object" ? row.metadata : {}
    ) as { courseSlug?: string; moduleIndex?: number; requiredStage?: number };
    const courseSlug = metadata.courseSlug ?? "unknown";
    const moduleIndex = Number(metadata.moduleIndex ?? -1);
    const requiredStage = Number(metadata.requiredStage ?? 0);
    const key = `${courseSlug}:${moduleIndex}:${requiredStage}`;
    const current = summary.get(key) ?? {
      courseSlug,
      moduleIndex,
      requiredStage,
      deniedCount: 0,
      uniqueUsers: new Set<string>(),
    };
    current.deniedCount += 1;
    if (row.userOpenId) current.uniqueUsers.add(row.userOpenId);
    summary.set(key, current);
  }
  const paidRows = await db
    .select({
      courseSlug: courseLearnerEnrollments.courseSlug,
      userOpenId: courseLearnerEnrollments.userOpenId,
      paidAt: coursePaymentStages.paidAt,
    })
    .from(coursePaymentStages)
    .innerJoin(
      courseLearnerEnrollments,
      eq(coursePaymentStages.enrollmentId, courseLearnerEnrollments.id)
    )
    .where(
      and(
        eq(coursePaymentStages.paymentStatus, "paid"),
        filters.fromDate
          ? gte(coursePaymentStages.paidAt, filters.fromDate)
          : undefined,
        filters.toDate
          ? lte(coursePaymentStages.paidAt, filters.toDate)
          : undefined
      )
    );
  const deniedUsersByCourse = new Map<string, Set<string>>();
  for (const row of rows) {
    const metadata = (
      row.metadata && typeof row.metadata === "object" ? row.metadata : {}
    ) as { courseSlug?: string };
    const courseSlug = metadata.courseSlug ?? "unknown";
    const users = deniedUsersByCourse.get(courseSlug) ?? new Set<string>();
    if (row.userOpenId) users.add(row.userOpenId);
    deniedUsersByCourse.set(courseSlug, users);
  }
  const paidUsersByCourse = new Map<string, Set<string>>();
  for (const row of paidRows) {
    const users = paidUsersByCourse.get(row.courseSlug) ?? new Set<string>();
    users.add(row.userOpenId);
    paidUsersByCourse.set(row.courseSlug, users);
  }
  const conversionByCourse = Array.from(deniedUsersByCourse.entries())
    .map(([courseSlug, deniedUsers]) => {
      const paidUsers = paidUsersByCourse.get(courseSlug) ?? new Set<string>();
      const convertedUsers = Array.from(deniedUsers).filter(userOpenId =>
        paidUsers.has(userOpenId)
      ).length;
      return {
        courseSlug,
        deniedUsers: deniedUsers.size,
        convertedUsers,
        conversionRate: deniedUsers.size
          ? Math.round((convertedUsers / deniedUsers.size) * 100)
          : 0,
      };
    })
    .sort((a, b) => b.deniedUsers - a.deniedUsers);
  const trendMap = new Map<string, { denied: number; paid: number }>();
  for (const row of rows) {
    const key = new Date(row.createdAt).toISOString().slice(0, 10);
    const point = trendMap.get(key) ?? { denied: 0, paid: 0 };
    point.denied += 1;
    trendMap.set(key, point);
  }
  for (const row of paidRows) {
    if (!row.paidAt) continue;
    const key = new Date(row.paidAt).toISOString().slice(0, 10);
    const point = trendMap.get(key) ?? { denied: 0, paid: 0 };
    point.paid += 1;
    trendMap.set(key, point);
  }
  const trend = Array.from(trendMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, point]) => ({
      date,
      denied: point.denied,
      paid: point.paid,
      conversionRate: point.denied
        ? Math.round((point.paid / point.denied) * 100)
        : 0,
    }));
  const totalDeniedUsers = conversionByCourse.reduce(
    (sum, item) => sum + item.deniedUsers,
    0
  );
  const totalConvertedUsers = conversionByCourse.reduce(
    (sum, item) => sum + item.convertedUsers,
    0
  );
  let previousConversionRate: number | null = null;
  if (filters.fromDate && filters.toDate) {
    const duration = filters.toDate.getTime() - filters.fromDate.getTime() + 1;
    const previousTo = new Date(filters.fromDate.getTime() - 1);
    const previousFrom = new Date(previousTo.getTime() - duration + 1);
    const previousConditions = [
      eq(analyticsEvents.eventName, "course_lesson_access_denied"),
      gte(analyticsEvents.createdAt, previousFrom),
      lte(analyticsEvents.createdAt, previousTo),
    ];
    const previousRows = await db
      .select({
        userOpenId: analyticsEvents.userOpenId,
        metadata: analyticsEvents.metadata,
      })
      .from(analyticsEvents)
      .where(and(...previousConditions));
    const previousDenied = previousRows.filter(row => {
      const metadata =
        row.metadata &&
        typeof row.metadata === "object" &&
        !Array.isArray(row.metadata)
          ? (row.metadata as Record<string, unknown>)
          : {};
      return (
        (!filters.cohort || metadata.cohort === filters.cohort) &&
        (!filters.deviceType || metadata.deviceType === filters.deviceType)
      );
    });
    const previousUsers = new Set(
      previousDenied
        .map(row => row.userOpenId)
        .filter((value): value is string => Boolean(value))
    );
    const previousPaid = await db
      .select({ userOpenId: courseLearnerEnrollments.userOpenId })
      .from(coursePaymentStages)
      .innerJoin(
        courseLearnerEnrollments,
        eq(coursePaymentStages.enrollmentId, courseLearnerEnrollments.id)
      )
      .where(
        and(
          eq(coursePaymentStages.paymentStatus, "paid"),
          gte(coursePaymentStages.paidAt, previousFrom),
          lte(coursePaymentStages.paidAt, previousTo)
        )
      );
    const previousConverted = previousPaid.filter(row =>
      previousUsers.has(row.userOpenId)
    ).length;
    previousConversionRate = previousUsers.size
      ? Math.round((previousConverted / previousUsers.size) * 100)
      : 0;
  }
  const currentConversionRate = totalDeniedUsers
    ? Math.round((totalConvertedUsers / totalDeniedUsers) * 100)
    : 0;
  return {
    totalDenied: rows.length,
    rows: rows.map(row => ({ ...row, metadata: row.metadata ?? {} })),
    summary: Array.from(summary.values())
      .map(item => ({
        courseSlug: item.courseSlug,
        moduleIndex: item.moduleIndex,
        requiredStage: item.requiredStage,
        deniedCount: item.deniedCount,
        uniqueUsers: item.uniqueUsers.size,
      }))
      .sort((a, b) => b.deniedCount - a.deniedCount),
    conversion: {
      deniedUsers: totalDeniedUsers,
      convertedUsers: totalConvertedUsers,
      conversionRate: currentConversionRate,
    },
    conversionByCourse,
    trend,
    comparison: {
      previousConversionRate,
      changePoints:
        previousConversionRate === null
          ? null
          : currentConversionRate - previousConversionRate,
    },
  };
}

export async function recordAnalyticsEvent(input: {
  eventName: string;
  attemptId?: number;
  userOpenId?: string;
  metadata?: Record<string, unknown>;
}) {
  const db = await getDb();
  if (!db) return;
  await db
    .insert(analyticsEvents)
    .values({
      eventName: input.eventName,
      attemptId: input.attemptId,
      userOpenId: input.userOpenId,
      metadata: input.metadata ?? null,
    });
}

export async function createContactInquiry(input: {
  name: string;
  email: string;
  category: string;
  message: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(contactInquiries).values(input);
  return Number(result[0].insertId);
}

export async function listContactInquiries(
  input: ContactInquiryFilters & { page: number; pageSize: number }
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const conditions = contactInquiryConditions(input);
  const where = conditions.length ? and(...conditions) : undefined;
  const rows = await db
    .select()
    .from(contactInquiries)
    .where(where)
    .orderBy(desc(contactInquiries.createdAt))
    .limit(input.pageSize)
    .offset((input.page - 1) * input.pageSize);
  const countRow = (
    await db
      .select({ count: sql<number>`count(*)` })
      .from(contactInquiries)
      .where(where)
  )[0];
  const total = Number(countRow?.count ?? 0);
  return {
    rows,
    total,
    page: input.page,
    pageSize: input.pageSize,
    totalPages: Math.max(1, Math.ceil(total / input.pageSize)),
  };
}

export type ContactInquiryFilters = {
  search?: string;
  category?: string;
  status?: string;
  assignedToOpenId?: string;
  fromDate?: Date;
  toDate?: Date;
};

function contactInquiryConditions(filters: ContactInquiryFilters) {
  return [
    filters.search
      ? or(
          like(contactInquiries.name, `%${filters.search}%`),
          like(contactInquiries.email, `%${filters.search}%`),
          like(contactInquiries.message, `%${filters.search}%`)
        )
      : undefined,
    filters.category && filters.category !== "all"
      ? eq(contactInquiries.category, filters.category)
      : undefined,
    filters.status && filters.status !== "all"
      ? eq(contactInquiries.status, filters.status)
      : undefined,
    filters.assignedToOpenId && filters.assignedToOpenId !== "all"
      ? filters.assignedToOpenId === "unassigned"
        ? isNull(contactInquiries.assignedToOpenId)
        : eq(contactInquiries.assignedToOpenId, filters.assignedToOpenId)
      : undefined,
    filters.fromDate
      ? gte(contactInquiries.createdAt, filters.fromDate)
      : undefined,
    filters.toDate
      ? lte(contactInquiries.createdAt, filters.toDate)
      : undefined,
  ].filter(Boolean) as Array<ReturnType<typeof eq>>;
}

export async function getContactInquiriesForExport(
  filters: ContactInquiryFilters = {}
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const conditions = contactInquiryConditions(filters);
  return db
    .select()
    .from(contactInquiries)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(contactInquiries.createdAt))
    .limit(5000);
}

export async function getContactInquiriesForExportWithAudit(
  filters: ContactInquiryFilters = {}
) {
  const rows = await getContactInquiriesForExport(filters);
  const auditRows = await Promise.all(
    rows.map(row => getContactInquiryAuditHistory(row.id))
  );
  return rows.map((row, index) => ({ ...row, auditHistory: auditRows[index] }));
}

export async function getContactInquiryCategoryCounts(days = 30) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const rows = await db
    .select({
      category: contactInquiries.category,
      count: sql<number>`count(*)`,
    })
    .from(contactInquiries)
    .where(gte(contactInquiries.createdAt, fromDate))
    .groupBy(contactInquiries.category)
    .orderBy(desc(sql`count(*)`));
  return rows.map(row => ({
    category: row.category,
    count: Number(row.count),
  }));
}

export type AdminRevenueFilters = { fromDate?: Date; toDate?: Date };
export async function getAdminRevenueReport(filters: AdminRevenueFilters = {}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const from =
    filters.fromDate ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const to = filters.toDate ?? new Date();
  const assessmentRows = await db
    .select({
      paidAt: assessmentAttempts.paidAt,
      reference: assessmentAttempts.paystackReference,
    })
    .from(assessmentAttempts)
    .where(
      and(
        eq(assessmentAttempts.paymentStatus, "paid"),
        isNotNull(assessmentAttempts.paidAt),
        gte(assessmentAttempts.paidAt, from),
        lte(assessmentAttempts.paidAt, to)
      )
    );
  const careerRows = await db
    .select({
      paidAt: careerPathAttempts.paidAt,
      reference: careerPathAttempts.paystackReference,
    })
    .from(careerPathAttempts)
    .where(
      and(
        eq(careerPathAttempts.paymentStatus, "paid"),
        isNotNull(careerPathAttempts.paidAt),
        gte(careerPathAttempts.paidAt, from),
        lte(careerPathAttempts.paidAt, to)
      )
    );
  const courseRows = await db
    .select({
      paidAt: coursePaymentStages.paidAt,
      reference: coursePaymentStages.paystackReference,
      amountKes: coursePaymentStages.amountKes,
    })
    .from(coursePaymentStages)
    .where(
      and(
        eq(coursePaymentStages.paymentStatus, "paid"),
        isNotNull(coursePaymentStages.paidAt),
        gte(coursePaymentStages.paidAt, from),
        lte(coursePaymentStages.paidAt, to)
      )
    );
  const transactions = [
    ...assessmentRows.map(row => ({
      source: "Self-assessment",
      amountKes: 399,
      paidAt: row.paidAt as Date,
      reference: row.reference,
    })),
    ...careerRows.map(row => ({
      source: "CareerPath",
      amountKes: 399,
      paidAt: row.paidAt as Date,
      reference: row.reference,
    })),
    ...courseRows.map(row => ({
      source: "Professional course",
      amountKes: Number(row.amountKes),
      paidAt: row.paidAt as Date,
      reference: row.reference,
    })),
  ].sort((a, b) => b.paidAt.getTime() - a.paidAt.getTime());
  const bySource = new Map<
    string,
    { source: string; revenueKes: number; transactions: number }
  >();
  const byDay = new Map<
    string,
    { date: string; revenueKes: number; transactions: number }
  >();
  for (const transaction of transactions) {
    const source = bySource.get(transaction.source) ?? {
      source: transaction.source,
      revenueKes: 0,
      transactions: 0,
    };
    source.revenueKes += transaction.amountKes;
    source.transactions += 1;
    bySource.set(transaction.source, source);
    const date = transaction.paidAt.toISOString().slice(0, 10);
    const day = byDay.get(date) ?? { date, revenueKes: 0, transactions: 0 };
    day.revenueKes += transaction.amountKes;
    day.transactions += 1;
    byDay.set(date, day);
  }
  const totalRevenueKes = transactions.reduce(
    (sum, transaction) => sum + transaction.amountKes,
    0
  );
  return {
    fromDate: from,
    toDate: to,
    totalRevenueKes,
    transactionCount: transactions.length,
    averageTransactionKes: transactions.length
      ? Math.round(totalRevenueKes / transactions.length)
      : 0,
    bySource: Array.from(bySource.values()).sort(
      (a, b) => b.revenueKes - a.revenueKes
    ),
    trend: Array.from(byDay.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    ),
    transactions: transactions.slice(0, 100),
  };
}

export type ContactInquiryActor = {
  openId: string;
  name?: string | null;
  email?: string | null;
};

type NewsletterSubscriberFilters = {
  search?: string;
  status?: string;
  fromDate?: Date | string;
  toDate?: Date | string;
};
export function normalizeNewsletterDateBound(
  value: Date | string | undefined,
  endOfDay = false
) {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  const normalized = String(value).trim();
  if (!normalized) return undefined;
  return new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(normalized)
      ? `${normalized}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`
      : normalized
  );
}
function newsletterSubscriberConditions(
  filters: NewsletterSubscriberFilters = {}
) {
  const conditions: SQL[] = [];
  const search = filters.search?.trim();
  if (search)
    conditions.push(
      or(
        like(newsletterSubscribers.email, `%${search}%`),
        like(newsletterSubscribers.source, `%${search}%`)
      )!
    );
  if (filters.status && filters.status !== "all")
    conditions.push(eq(newsletterSubscribers.status, filters.status));
  const fromDate = normalizeNewsletterDateBound(filters.fromDate);
  const toDate = normalizeNewsletterDateBound(filters.toDate, true);
  if (fromDate && !Number.isNaN(fromDate.getTime()))
    conditions.push(gte(newsletterSubscribers.createdAt, fromDate));
  if (toDate && !Number.isNaN(toDate.getTime()))
    conditions.push(lte(newsletterSubscribers.createdAt, toDate));
  return conditions.length === 0
    ? undefined
    : conditions.length === 1
      ? conditions[0]
      : and(...conditions);
}

export async function listNewsletterSubscribers(
  input: { page?: number; pageSize?: number } & NewsletterSubscriberFilters = {}
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.min(100, Math.max(5, input.pageSize ?? 25));
  const conditions = newsletterSubscriberConditions(input);
  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(newsletterSubscribers)
      .where(conditions)
      .orderBy(desc(newsletterSubscribers.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ count: sql<number>`count(*)` })
      .from(newsletterSubscribers)
      .where(conditions),
  ]);
  const total = Number(totalRows[0]?.count ?? 0);
  return {
    rows,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getNewsletterSubscribersForExport(
  filters: NewsletterSubscriberFilters = {}
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db
    .select()
    .from(newsletterSubscribers)
    .where(newsletterSubscriberConditions(filters))
    .orderBy(desc(newsletterSubscribers.createdAt));
}

export async function subscribeToNewsletter(input: {
  email: string;
  source?: string;
  confirmationTokenHash: string;
  confirmationExpiresAt: Date;
  confirmationSentAt: Date;
  unsubscribeTokenHash: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const email = input.email.trim().toLowerCase();
  const existing = (
    await db
      .select({
        id: newsletterSubscribers.id,
        status: newsletterSubscribers.status,
        confirmedAt: newsletterSubscribers.confirmedAt,
      })
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, email))
      .limit(1)
  )[0];
  const now = new Date();
  if (existing) {
    const isConfirmed =
      existing.status === "confirmed" || existing.status === "subscribed";
    await db
      .update(newsletterSubscribers)
      .set({
        status: isConfirmed ? existing.status : "pending",
        consentedAt: now,
        source: input.source ?? "insights",
        confirmationTokenHash: isConfirmed ? null : input.confirmationTokenHash,
        confirmationExpiresAt: isConfirmed ? null : input.confirmationExpiresAt,
        confirmationSentAt: isConfirmed ? null : input.confirmationSentAt,
        confirmedAt: existing.confirmedAt,
        unsubscribeTokenHash: input.unsubscribeTokenHash,
        unsubscribedAt: isConfirmed ? null : null,
      })
      .where(eq(newsletterSubscribers.id, existing.id));
    return {
      id: existing.id,
      status: isConfirmed ? ("confirmed" as const) : ("pending" as const),
      alreadySubscribed: isConfirmed,
      confirmationRequired: !isConfirmed,
    };
  }
  const result = await db
    .insert(newsletterSubscribers)
    .values({
      email,
      source: input.source ?? "insights",
      status: "pending",
      consentedAt: now,
      confirmationTokenHash: input.confirmationTokenHash,
      confirmationExpiresAt: input.confirmationExpiresAt,
      confirmationSentAt: input.confirmationSentAt,
      unsubscribeTokenHash: input.unsubscribeTokenHash,
    });
  return {
    id: Number(result[0].insertId),
    status: "pending" as const,
    alreadySubscribed: false,
    confirmationRequired: true,
  };
}

export async function confirmNewsletterSubscription(tokenHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const now = new Date();
  const row = (
    await db
      .select()
      .from(newsletterSubscribers)
      .where(
        and(
          eq(newsletterSubscribers.confirmationTokenHash, tokenHash),
          gte(newsletterSubscribers.confirmationExpiresAt, now)
        )
      )
      .limit(1)
  )[0];
  if (!row) return null;
  await db
    .update(newsletterSubscribers)
    .set({
      status: "confirmed",
      confirmedAt: now,
      confirmationTokenHash: null,
      confirmationExpiresAt: null,
    })
    .where(eq(newsletterSubscribers.id, row.id));
  return { id: row.id, email: row.email, status: "confirmed" as const };
}

export async function unsubscribeNewsletter(tokenHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const row = (
    await db
      .select({
        id: newsletterSubscribers.id,
        email: newsletterSubscribers.email,
      })
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.unsubscribeTokenHash, tokenHash))
      .limit(1)
  )[0];
  if (!row) return null;
  await db
    .update(newsletterSubscribers)
    .set({
      status: "unsubscribed",
      unsubscribedAt: new Date(),
      confirmationTokenHash: null,
      confirmationExpiresAt: null,
    })
    .where(eq(newsletterSubscribers.id, row.id));
  return { id: row.id, email: row.email, status: "unsubscribed" as const };
}

export async function listConfirmedNewsletterRecipients() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db
    .select({
      id: newsletterSubscribers.id,
      email: newsletterSubscribers.email,
    })
    .from(newsletterSubscribers)
    .where(
      or(
        eq(newsletterSubscribers.status, "confirmed"),
        eq(newsletterSubscribers.status, "subscribed")
      )
    );
}

export async function rotateNewsletterUnsubscribeToken(
  id: number,
  tokenHash: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(newsletterSubscribers)
    .set({ unsubscribeTokenHash: tokenHash })
    .where(eq(newsletterSubscribers.id, id));
}

export async function updateNewsletterSubscriberStatus(
  id: number,
  status: "pending" | "confirmed" | "subscribed" | "unsubscribed"
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(newsletterSubscribers)
    .set({
      status,
      confirmedAt:
        status === "confirmed" || status === "subscribed"
          ? new Date()
          : undefined,
      unsubscribedAt: status === "unsubscribed" ? new Date() : undefined,
    })
    .where(eq(newsletterSubscribers.id, id));
  return { id, status };
}

function mapInsightRow(
  row: typeof insightArticlesTable.$inferSelect
): InsightArticle & {
  status: "Draft preview" | "Published";
  socialImageUrl?: string | null;
  publishedAt?: Date | null;
} {
  const source = bundledInsightArticles.find(
    article => article.slug === row.slug
  );
  return {
    slug: row.slug,
    index: source?.index ?? "",
    category: row.category,
    title: row.title,
    excerpt: row.excerpt,
    readTime: row.readTime,
    accent: row.accent,
    status: row.status === "published" ? "Published" : "Draft preview",
    sections:
      source?.sections ??
      (JSON.parse(row.sectionsJson) as Array<{
        heading: string;
        paragraphs: string[];
      }>),
    socialImageUrl: row.socialImageUrl,
    publishedAt: row.publishedAt,
  };
}

export async function listInsightArticles(
  input: {
    search?: string;
    category?: string;
    page?: number;
    pageSize?: number;
    includeDrafts?: boolean;
  } = {}
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, input.pageSize ?? 9));
  const search = input.search?.trim().toLowerCase();
  const rows = await db
    .select()
    .from(insightArticlesTable)
    .orderBy(desc(insightArticlesTable.updatedAt));
  const sourceRows = rows.length
    ? rows.map(mapInsightRow)
    : bundledInsightArticles.map(article => ({
        ...article,
        socialImageUrl: null,
        publishedAt: null,
      }));
  const filtered = sourceRows.filter(
    article =>
      (input.includeDrafts || article.status === "Published" || !rows.length) &&
      (!input.category ||
        input.category === "all" ||
        article.category === input.category) &&
      (!search ||
        `${article.title} ${article.excerpt} ${article.category} ${article.accent}`
          .toLowerCase()
          .includes(search))
  );
  const total = filtered.length;
  return {
    rows: filtered.slice((page - 1) * pageSize, page * pageSize),
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getInsightArticleBySlug(slug: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const row = (
    await db
      .select()
      .from(insightArticlesTable)
      .where(eq(insightArticlesTable.slug, slug))
      .limit(1)
  )[0];
  if (row) return mapInsightRow(row);
  const anyManagedRecord = (
    await db
      .select({ id: insightArticlesTable.id })
      .from(insightArticlesTable)
      .limit(1)
  )[0];
  return anyManagedRecord
    ? null
    : (bundledInsightArticles.find(article => article.slug === slug) ?? null);
}

export async function listInsightArticlesForAdmin() {
  return listInsightArticles({ includeDrafts: true, page: 1, pageSize: 50 });
}

export async function setInsightArticleStatus(input: {
  slug: string;
  status: "draft" | "published";
  socialImageUrl?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const bundled = bundledInsightArticles.find(
    article => article.slug === input.slug
  );
  if (!bundled) throw new Error("Insight article not found");
  const existing = (
    await db
      .select({ id: insightArticlesTable.id })
      .from(insightArticlesTable)
      .where(eq(insightArticlesTable.slug, input.slug))
      .limit(1)
  )[0];
  const publishedAt = input.status === "published" ? new Date() : null;
  if (existing)
    await db
      .update(insightArticlesTable)
      .set({
        status: input.status,
        socialImageUrl: input.socialImageUrl ?? null,
        publishedAt,
      })
      .where(eq(insightArticlesTable.id, existing.id));
  else
    await db
      .insert(insightArticlesTable)
      .values({
        slug: bundled.slug,
        category: bundled.category,
        title: bundled.title,
        excerpt: bundled.excerpt,
        readTime: bundled.readTime,
        accent: bundled.accent,
        sectionsJson: JSON.stringify(bundled.sections),
        status: input.status,
        socialImageUrl: input.socialImageUrl ?? null,
        publishedAt,
      });
  return { slug: input.slug, status: input.status };
}

async function recordContactInquiryAudit(
  db: Awaited<ReturnType<typeof getDb>>,
  input: {
    inquiryId: number;
    actor: ContactInquiryActor;
    action: "status" | "notes" | "assignment" | "workload";
    previousValue?: string | null;
    nextValue?: string | null;
  }
) {
  if (!db) throw new Error("Database is not available");
  await db
    .insert(contactInquiryAuditLogs)
    .values({
      inquiryId: input.inquiryId,
      actorOpenId: input.actor.openId,
      actorName: input.actor.name ?? null,
      actorEmail: input.actor.email ?? null,
      action: input.action,
      previousValue: input.previousValue ?? null,
      nextValue: input.nextValue ?? null,
    });
}

export async function createStaffInvitation(input: {
  email: string;
  name: string;
  role: "staff" | "admin";
  tokenHash: string;
  invitedByOpenId: string;
  expiresAt: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(staffInvitations).values(input);
  return Number(result[0].insertId);
}

export async function listStaffInvitations() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db
    .select()
    .from(staffInvitations)
    .orderBy(desc(staffInvitations.createdAt))
    .limit(100);
}

export async function consumeStaffInvitation(tokenHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const invitation = (
    await db
      .select()
      .from(staffInvitations)
      .where(
        and(
          eq(staffInvitations.tokenHash, tokenHash),
          isNull(staffInvitations.acceptedAt),
          gte(staffInvitations.expiresAt, new Date())
        )
      )
      .limit(1)
  )[0];
  if (!invitation) return undefined;
  await db
    .update(staffInvitations)
    .set({ acceptedAt: new Date() })
    .where(eq(staffInvitations.id, invitation.id));
  return invitation;
}

export async function updateUserRole(
  openId: string,
  role: "user" | "staff" | "admin"
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(users).set({ role }).where(eq(users.openId, openId));
  return getUserByOpenId(openId);
}

export async function updateContactInquiryWorkload(
  id: number,
  workload: {
    dueDate: Date | null;
    priority: "low" | "normal" | "high" | "urgent";
  },
  actor: ContactInquiryActor
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const previous = (
    await db
      .select({
        dueDate: contactInquiries.dueDate,
        priority: contactInquiries.priority,
      })
      .from(contactInquiries)
      .where(eq(contactInquiries.id, id))
      .limit(1)
  )[0];
  await db
    .update(contactInquiries)
    .set({ dueDate: workload.dueDate, priority: workload.priority })
    .where(eq(contactInquiries.id, id));
  const previousValue = JSON.stringify({
    dueDate: previous?.dueDate?.toISOString() ?? null,
    priority: previous?.priority ?? "normal",
  });
  const nextValue = JSON.stringify({
    dueDate: workload.dueDate?.toISOString() ?? null,
    priority: workload.priority,
  });
  if (previousValue !== nextValue)
    await recordContactInquiryAudit(db, {
      inquiryId: id,
      actor,
      action: "workload",
      previousValue,
      nextValue,
    });
  return (
    (
      await db
        .select()
        .from(contactInquiries)
        .where(eq(contactInquiries.id, id))
        .limit(1)
    )[0] ?? null
  );
}

export async function getStaffPerformanceSummary(
  input: { fromDate?: Date; toDate?: Date } = {}
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const members = await db
    .select({
      openId: users.openId,
      name: users.name,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(or(eq(users.role, "admin"), eq(users.role, "staff")))
    .orderBy(users.name);
  const inquiries = await db
    .select()
    .from(contactInquiries)
    .where(isNotNull(contactInquiries.assignedToOpenId));
  const inRange = (date: Date) =>
    (!input.fromDate || date >= input.fromDate) &&
    (!input.toDate || date <= input.toDate);
  const audits = await db
    .select()
    .from(contactInquiryAuditLogs)
    .where(eq(contactInquiryAuditLogs.action, "status"));
  return members.map(member => {
    const assigned = inquiries.filter(
      row => row.assignedToOpenId === member.openId && inRange(row.createdAt)
    );
    const completed = assigned.filter(row => row.status === "closed");
    const durations = completed
      .map(row => {
        const closed = audits.find(
          audit => audit.inquiryId === row.id && audit.nextValue === "closed"
        );
        return closed
          ? Math.max(
              0,
              (closed.createdAt.getTime() - row.createdAt.getTime()) / 86400000
            )
          : null;
      })
      .filter((value): value is number => value !== null);
    return {
      ...member,
      assignedCount: assigned.length,
      completedCount: completed.length,
      openCount: assigned.length - completed.length,
      averageResolutionDays: durations.length
        ? Math.round(
            (durations.reduce((sum, value) => sum + value, 0) /
              durations.length) *
              10
          ) / 10
        : null,
    };
  });
}

export async function getAdminTeamMembers() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db
    .select({
      openId: users.openId,
      name: users.name,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(or(eq(users.role, "admin"), eq(users.role, "staff")))
    .orderBy(users.name);
}

export async function getContactInquiryAuditHistory(inquiryId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db
    .select()
    .from(contactInquiryAuditLogs)
    .where(eq(contactInquiryAuditLogs.inquiryId, inquiryId))
    .orderBy(desc(contactInquiryAuditLogs.createdAt))
    .limit(100);
}

export async function updateContactInquiryNotes(
  id: number,
  internalNotes: string,
  actor?: ContactInquiryActor
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const previous =
    (
      await db
        .select({ internalNotes: contactInquiries.internalNotes })
        .from(contactInquiries)
        .where(eq(contactInquiries.id, id))
        .limit(1)
    )[0]?.internalNotes ?? null;
  const next = internalNotes.trim() || null;
  await db
    .update(contactInquiries)
    .set({ internalNotes: next })
    .where(eq(contactInquiries.id, id));
  if (actor && previous !== next)
    await recordContactInquiryAudit(db, {
      inquiryId: id,
      actor,
      action: "notes",
      previousValue: previous,
      nextValue: next,
    });
  return (
    (
      await db
        .select()
        .from(contactInquiries)
        .where(eq(contactInquiries.id, id))
        .limit(1)
    )[0] ?? null
  );
}

export async function listAssignedContactInquiries(
  openId: string,
  input: Omit<ContactInquiryFilters, "assignedToOpenId"> & {
    page: number;
    pageSize: number;
  }
) {
  return listContactInquiries({ ...input, assignedToOpenId: openId });
}

async function assertAssignedInquiry(id: number, openId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const row = (
    await db
      .select()
      .from(contactInquiries)
      .where(
        and(
          eq(contactInquiries.id, id),
          eq(contactInquiries.assignedToOpenId, openId)
        )
      )
      .limit(1)
  )[0];
  if (!row)
    throw new Error("This inquiry is not assigned to your staff account.");
  return row;
}

export async function updateAssignedContactInquiryStatus(
  id: number,
  openId: string,
  status: "new" | "contacted" | "closed",
  actor: ContactInquiryActor
) {
  await assertAssignedInquiry(id, openId);
  return updateContactInquiryStatus(id, status, actor);
}

export async function updateAssignedContactInquiryNotes(
  id: number,
  openId: string,
  internalNotes: string,
  actor: ContactInquiryActor
) {
  await assertAssignedInquiry(id, openId);
  return updateContactInquiryNotes(id, internalNotes, actor);
}

export async function updateContactInquiryStatus(
  id: number,
  status: "new" | "contacted" | "closed",
  actor?: ContactInquiryActor
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const previous =
    (
      await db
        .select({ status: contactInquiries.status })
        .from(contactInquiries)
        .where(eq(contactInquiries.id, id))
        .limit(1)
    )[0]?.status ?? null;
  await db
    .update(contactInquiries)
    .set({ status })
    .where(eq(contactInquiries.id, id));
  if (actor && previous !== status)
    await recordContactInquiryAudit(db, {
      inquiryId: id,
      actor,
      action: "status",
      previousValue: previous,
      nextValue: status,
    });
  return (
    (
      await db
        .select()
        .from(contactInquiries)
        .where(eq(contactInquiries.id, id))
        .limit(1)
    )[0] ?? null
  );
}

export async function updateContactInquiryAssignment(
  id: number,
  assignment: { openId: string | null; name: string | null },
  actor: ContactInquiryActor
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const previous = (
    await db
      .select({
        openId: contactInquiries.assignedToOpenId,
        name: contactInquiries.assignedToName,
      })
      .from(contactInquiries)
      .where(eq(contactInquiries.id, id))
      .limit(1)
  )[0];
  await db
    .update(contactInquiries)
    .set({
      assignedToOpenId: assignment.openId,
      assignedToName: assignment.name,
    })
    .where(eq(contactInquiries.id, id));
  const previousValue = previous?.openId
    ? `${previous.name ?? ""} (${previous.openId})`
    : null;
  const nextValue = assignment.openId
    ? `${assignment.name ?? ""} (${assignment.openId})`
    : null;
  if (previousValue !== nextValue)
    await recordContactInquiryAudit(db, {
      inquiryId: id,
      actor,
      action: "assignment",
      previousValue,
      nextValue,
    });
  return (
    (
      await db
        .select()
        .from(contactInquiries)
        .where(eq(contactInquiries.id, id))
        .limit(1)
    )[0] ?? null
  );
}

export async function bulkUpdateContactInquiryStatus(
  ids: number[],
  status: "new" | "contacted" | "closed",
  actor?: ContactInquiryActor
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  if (!ids.length) return 0;
  for (const id of ids) await updateContactInquiryStatus(id, status, actor);
  return ids.length;
}

export async function createCourseEnrollment(input: {
  courseTitle: string;
  name: string;
  email: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db
    .insert(courseEnrollments)
    .values({ ...input, consentedAt: new Date() });
  return Number(result[0].insertId);
}

export async function getCourseEnrollments(
  filters: { fromDate?: Date; toDate?: Date; status?: string } = {}
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const conditions = [
    filters.fromDate
      ? gte(courseEnrollments.createdAt, filters.fromDate)
      : undefined,
    filters.toDate
      ? lte(courseEnrollments.createdAt, filters.toDate)
      : undefined,
    filters.status ? eq(courseEnrollments.status, filters.status) : undefined,
  ].filter(Boolean) as Array<ReturnType<typeof gte>>;
  return db
    .select({
      id: courseEnrollments.id,
      courseTitle: courseEnrollments.courseTitle,
      name: courseEnrollments.name,
      email: courseEnrollments.email,
      status: courseEnrollments.status,
      createdAt: courseEnrollments.createdAt,
      consentedAt: courseEnrollments.consentedAt,
    })
    .from(courseEnrollments)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(courseEnrollments.createdAt))
    .limit(1000);
}

export async function getAnalyticsDashboard(
  filters: { fromDate?: Date; toDate?: Date } = {}
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const conditions = [
    filters.fromDate
      ? gte(analyticsEvents.createdAt, filters.fromDate)
      : undefined,
    filters.toDate ? lte(analyticsEvents.createdAt, filters.toDate) : undefined,
  ].filter(Boolean) as Array<ReturnType<typeof gte>>;
  const rows = await db
    .select({
      eventName: analyticsEvents.eventName,
      count: sql<number>`count(*)`,
    })
    .from(analyticsEvents)
    .where(conditions.length ? and(...conditions) : undefined)
    .groupBy(analyticsEvents.eventName);
  const summary = summarizeAnalyticsEvents(
    rows.map(row => ({ eventName: row.eventName, count: Number(row.count) }))
  );
  let previousSummary: Record<string, number> = {};
  if (filters.fromDate && filters.toDate) {
    const duration = filters.toDate.getTime() - filters.fromDate.getTime();
    const previousTo = new Date(filters.fromDate.getTime() - 1);
    const previousFrom = new Date(previousTo.getTime() - duration);
    const previousRows = await db
      .select({
        eventName: analyticsEvents.eventName,
        count: sql<number>`count(*)`,
      })
      .from(analyticsEvents)
      .where(
        and(
          gte(analyticsEvents.createdAt, previousFrom),
          lte(analyticsEvents.createdAt, previousTo)
        )
      )
      .groupBy(analyticsEvents.eventName);
    previousSummary = summarizeAnalyticsEvents(
      previousRows.map(row => ({
        eventName: row.eventName,
        count: Number(row.count),
      }))
    );
  }
  const trendFrom =
    filters.fromDate ?? new Date(Date.now() - 56 * 24 * 60 * 60 * 1000);
  const trendSource = await db
    .select({
      createdAt: analyticsEvents.createdAt,
      eventName: analyticsEvents.eventName,
    })
    .from(analyticsEvents)
    .where(
      and(
        gte(analyticsEvents.createdAt, trendFrom),
        filters.toDate
          ? lte(analyticsEvents.createdAt, filters.toDate)
          : undefined
      )
    );
  const trendMap = new Map<string, number>();
  trendSource.forEach(row => {
    const start = new Date(Date.UTC(row.createdAt.getUTCFullYear(), 0, 1));
    const day = Math.floor(
      (row.createdAt.getTime() - start.getTime()) / 86400000
    );
    const week = `${row.createdAt.getUTCFullYear()}-W${String(Math.floor((day + start.getUTCDay()) / 7) + 1).padStart(2, "0")}`;
    const key = `${week}::${row.eventName}`;
    trendMap.set(key, (trendMap.get(key) ?? 0) + 1);
  });
  const weekly = aggregateWeeklyAnalytics(
    Array.from(trendMap.entries()).map(([key, count]) => {
      const [week, eventName] = key.split("::");
      return { week, eventName, count };
    })
  );
  return { summary, previousSummary, weekly };
}

const defaultEmailTemplates = [
  {
    templateKey: "assessment_report",
    label: "Assessment report delivery",
    subject: "Your Profound IQ assessment report",
    body: "Hello {{name}},\n\nYour assessment report is ready. Use the secure link in your dashboard to review your development signals.\n\nProfound IQ Consulting",
  },
  {
    templateKey: "course_enrollment",
    label: "Course enrollment follow-up",
    subject: "Your Profound IQ course inquiry",
    body: "Hello {{name}},\n\nThank you for your interest in {{course}}. Our team will follow up with availability and next steps.\n\nProfound IQ Consulting",
  },
];

export async function getScheduledExport(exportKey: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return (
    (
      await db
        .select()
        .from(scheduledExports)
        .where(eq(scheduledExports.exportKey, exportKey))
        .limit(1)
    )[0] ?? null
  );
}
export async function createScheduledExportIfMissing(exportKey: string) {
  const existing = await getScheduledExport(exportKey);
  if (existing) return existing;
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(scheduledExports).values({ exportKey });
  return getScheduledExport(exportKey);
}
export async function updateScheduledExport(
  exportKey: string,
  input: {
    scheduleTaskUid?: string;
    lastRunAt?: Date;
    lastFileKey?: string;
    lastFileUrl?: string;
    retentionDays?: number;
    pausedAt?: Date | null;
    pausedByOpenId?: string | null;
    pausedByName?: string | null;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(scheduledExports)
    .set(input)
    .where(eq(scheduledExports.exportKey, exportKey));
  return getScheduledExport(exportKey);
}

export async function addScheduledExportRun(input: {
  exportKey: string;
  fileKey: string;
  fileUrl: string;
  rowCount: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(scheduledExportRuns).values(input);
}
export async function getScheduledExportRuns(exportKey: string, limit = 12) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db
    .select()
    .from(scheduledExportRuns)
    .where(eq(scheduledExportRuns.exportKey, exportKey))
    .orderBy(desc(scheduledExportRuns.createdAt))
    .limit(limit);
}
export async function deleteExpiredScheduledExportRuns(
  exportKey: string,
  cutoff: Date
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .delete(scheduledExportRuns)
    .where(
      and(
        eq(scheduledExportRuns.exportKey, exportKey),
        lt(scheduledExportRuns.createdAt, cutoff)
      )
    );
}
export type CertificateFieldLayout = Record<
  string,
  {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    visible?: boolean;
    text?: string;
  }
>;

export async function getAdminCertificateSettings(adminOpenId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return (
    (
      await db
        .select()
        .from(adminCertificateSettings)
        .where(eq(adminCertificateSettings.adminOpenId, adminOpenId))
        .limit(1)
    )[0] ?? {
      adminOpenId,
      trainerName: "Stephen Mwihaki",
      trainerTitle: "Managing Director",
      signatureDataUri: CERTIFICATE_SIGNATURE_DATA_URI,
    }
  );
}

export async function upsertAdminCertificateSettings(
  adminOpenId: string,
  input: {
    trainerName: string;
    trainerTitle: string;
    signatureDataUri?: string;
    fieldLayout?: CertificateFieldLayout;
    customElements?: Record<string, string>;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const existing = await getAdminCertificateSettings(adminOpenId);
  const values = {
    trainerName: input.trainerName.trim(),
    trainerTitle: input.trainerTitle.trim(),
    signatureDataUri:
      input.signatureDataUri?.trim() || existing.signatureDataUri,
    fieldLayout: input.fieldLayout ?? existing.fieldLayout ?? null,
    customElements:
      input.customElements ??
      (
        existing as typeof existing & {
          customElements?: Record<string, string>;
        }
      ).customElements ??
      null,
  };
  if ("id" in existing)
    await db
      .update(adminCertificateSettings)
      .set(values)
      .where(eq(adminCertificateSettings.adminOpenId, adminOpenId));
  else
    await db
      .insert(adminCertificateSettings)
      .values({ adminOpenId, ...values });
  return getAdminCertificateSettings(adminOpenId);
}

export async function recordCertificateUsageEvent(input: {
  certificateNumber: string;
  enrollmentId: number;
  userOpenId: string;
  eventType: "share" | "download";
  platform?: string;
  artifactHash?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(certificateUsageEvents).values(input);
}

export async function getCertificateUsageAnalytics(filters?: {
  fromDate?: Date;
  toDate?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const conditions: SQL[] = [];
  if (filters?.fromDate)
    conditions.push(gte(certificateUsageEvents.createdAt, filters.fromDate));
  if (filters?.toDate)
    conditions.push(lte(certificateUsageEvents.createdAt, filters.toDate));
  const where = conditions.length ? and(...conditions) : undefined;
  const rows = await db
    .select({
      eventType: certificateUsageEvents.eventType,
      platform: certificateUsageEvents.platform,
      count: sql<number>`count(*)`,
    })
    .from(certificateUsageEvents)
    .where(where)
    .groupBy(certificateUsageEvents.eventType, certificateUsageEvents.platform);
  const dailyRows = await db
    .select({
      day: sql<string>`DATE_FORMAT(${certificateUsageEvents.createdAt}, '%Y-%m-%d')`,
      eventType: certificateUsageEvents.eventType,
      platform: certificateUsageEvents.platform,
      count: sql<number>`count(*)`,
    })
    .from(certificateUsageEvents)
    .where(where)
    .groupBy(
      sql`DATE_FORMAT(${certificateUsageEvents.createdAt}, '%Y-%m-%d')`,
      certificateUsageEvents.eventType,
      certificateUsageEvents.platform
    )
    .orderBy(sql`DATE_FORMAT(${certificateUsageEvents.createdAt}, '%Y-%m-%d')`);
  const summary = summarizeCertificateUsageRows(
    rows.map(row => ({
      eventType: row.eventType,
      platform: row.platform,
      count: Number(row.count ?? 0),
    }))
  );
  return {
    totals: summary.totals,
    byPlatform: summary.byPlatform,
    daily: dailyRows.map(row => ({
      day: row.day,
      eventType: row.eventType,
      platform: row.platform ?? "unknown",
      count: Number(row.count ?? 0),
    })),
  };
}

export async function getPublicCertificateShareAnalytics(filters?: {
  fromDate?: Date;
  toDate?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const conditions: SQL[] = [eq(analyticsEvents.eventName, "course_shared")];
  if (filters?.fromDate)
    conditions.push(gte(analyticsEvents.createdAt, filters.fromDate));
  if (filters?.toDate)
    conditions.push(lte(analyticsEvents.createdAt, filters.toDate));
  const rows = await db
    .select({
      createdAt: analyticsEvents.createdAt,
      metadata: analyticsEvents.metadata,
    })
    .from(analyticsEvents)
    .where(and(...conditions))
    .orderBy(desc(analyticsEvents.createdAt))
    .limit(10000);
  const byPlatform = new Map<string, number>();
  const daily = new Map<string, number>();
  for (const row of rows) {
    const metadata =
      row.metadata &&
      typeof row.metadata === "object" &&
      !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : {};
    const platform =
      typeof metadata.platform === "string" && metadata.platform.trim()
        ? metadata.platform.trim()
        : "unknown";
    const day = new Date(row.createdAt).toISOString().slice(0, 10);
    byPlatform.set(platform, (byPlatform.get(platform) ?? 0) + 1);
    daily.set(day, (daily.get(day) ?? 0) + 1);
  }
  return {
    total: rows.length,
    byPlatform: Array.from(byPlatform, ([platform, count]) => ({
      platform,
      count,
    })).sort((a, b) => b.count - a.count),
    daily: Array.from(daily, ([day, count]) => ({ day, count })).sort((a, b) =>
      a.day.localeCompare(b.day)
    ),
  };
}

export async function getCertificateGenerationRecords(filters?: {
  fromDate?: Date;
  toDate?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const conditions: SQL[] = [];
  if (filters?.fromDate)
    conditions.push(gte(courseCertificates.createdAt, filters.fromDate));
  if (filters?.toDate)
    conditions.push(lte(courseCertificates.createdAt, filters.toDate));
  const rows = await db
    .select({
      certificateNumber: courseCertificates.certificateNumber,
      enrollmentId: courseCertificates.enrollmentId,
      recipientName: courseCertificates.recipientName,
      courseTitle: courseCertificates.courseTitle,
      status: courseCertificates.status,
      artifactHash: courseCertificates.artifactHash,
      createdAt: courseCertificates.createdAt,
    })
    .from(courseCertificates)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(courseCertificates.createdAt));
  return rows;
}

export async function getAdminAnalyticsSettings(adminOpenId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return (
    (
      await db
        .select()
        .from(adminAnalyticsSettings)
        .where(eq(adminAnalyticsSettings.adminOpenId, adminOpenId))
        .limit(1)
    )[0] ?? { adminOpenId, paidBenchmark: 35, downloadBenchmark: 60 }
  );
}
export async function upsertAdminAnalyticsSettings(
  adminOpenId: string,
  input: { paidBenchmark: number; downloadBenchmark: number }
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const existing = await getAdminAnalyticsSettings(adminOpenId);
  if ("id" in existing)
    await db
      .update(adminAnalyticsSettings)
      .set(input)
      .where(eq(adminAnalyticsSettings.adminOpenId, adminOpenId));
  else
    await db.insert(adminAnalyticsSettings).values({ adminOpenId, ...input });
  return getAdminAnalyticsSettings(adminOpenId);
}

export async function getSiteSeoSetting(settingKey: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return (
    (
      await db
        .select({ settingValue: siteSeoSettings.settingValue })
        .from(siteSeoSettings)
        .where(eq(siteSeoSettings.settingKey, settingKey))
        .limit(1)
    )[0]?.settingValue ?? null
  );
}

export async function upsertSiteSeoSetting(
  settingKey: string,
  settingValue: string,
  updatedByOpenId: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .insert(siteSeoSettings)
    .values({ settingKey, settingValue, updatedByOpenId })
    .onDuplicateKeyUpdate({ set: { settingValue, updatedByOpenId } });
  return getSiteSeoSetting(settingKey);
}

export async function addEmailPreviewDelivery(input: {
  templateKey: string;
  recipientEmail: string;
  subject: string;
  body?: string | null;
  status: "sent" | "failed";
  errorMessage?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(emailPreviewDeliveries).values(input);
}
export async function getEmailPreviewDeliveries(limit = 20) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db
    .select({
      id: emailPreviewDeliveries.id,
      templateKey: emailPreviewDeliveries.templateKey,
      recipientEmail: emailPreviewDeliveries.recipientEmail,
      subject: emailPreviewDeliveries.subject,
      body: emailPreviewDeliveries.body,
      status: emailPreviewDeliveries.status,
      errorMessage: emailPreviewDeliveries.errorMessage,
      createdAt: emailPreviewDeliveries.createdAt,
    })
    .from(emailPreviewDeliveries)
    .orderBy(desc(emailPreviewDeliveries.createdAt))
    .limit(limit);
}

function deliveryLogConditions(filters: DeliveryLogFilters = {}) {
  const search = filters.search?.trim();
  return [
    search
      ? or(
          like(emailPreviewDeliveries.subject, `%${search}%`),
          like(emailPreviewDeliveries.recipientEmail, `%${search}%`),
          like(emailPreviewDeliveries.templateKey, `%${search}%`),
          like(emailPreviewDeliveries.errorMessage, `%${search}%`)
        )
      : undefined,
    filters.status && filters.status !== "all"
      ? eq(emailPreviewDeliveries.status, filters.status)
      : undefined,
    filters.fromDate
      ? gte(emailPreviewDeliveries.createdAt, filters.fromDate)
      : undefined,
    filters.toDate
      ? lte(emailPreviewDeliveries.createdAt, filters.toDate)
      : undefined,
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

export async function getEmailPreviewDeliveriesPage(
  filters: DeliveryLogFilters & { page: number; pageSize: number }
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const conditions = deliveryLogConditions(filters);
  const where = conditions.length ? and(...conditions) : undefined;
  const [{ total }] = await db
    .select({ total: sql<number>`count(*)` })
    .from(emailPreviewDeliveries)
    .where(where);
  const safePageSize = Math.min(100, Math.max(1, filters.pageSize));
  const totalCount = Number(total);
  const totalPages = Math.max(1, Math.ceil(totalCount / safePageSize));
  const page = Math.min(Math.max(1, filters.page), totalPages);
  const rows = await db
    .select(deliveryLogSelect)
    .from(emailPreviewDeliveries)
    .where(where)
    .orderBy(desc(emailPreviewDeliveries.createdAt))
    .limit(safePageSize)
    .offset((page - 1) * safePageSize);
  return { rows, total: totalCount, totalPages, page, pageSize: safePageSize };
}

export async function getEmailPreviewDeliveriesForExport(
  filters: DeliveryLogFilters = {}
): Promise<DeliveryLogRow[]> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const conditions = deliveryLogConditions(filters);
  const where = conditions.length ? and(...conditions) : undefined;
  return db
    .select(deliveryLogSelect)
    .from(emailPreviewDeliveries)
    .where(where)
    .orderBy(desc(emailPreviewDeliveries.createdAt))
    .limit(10000);
}

export async function getAdminUsersForReview(input: {
  page: number;
  pageSize: number;
  search?: string;
  verification: "all" | "verified" | "unverified";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const search = input.search?.trim();
  const conditions = [
    search
      ? or(
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`),
          like(users.openId, `%${search}%`)
        )
      : undefined,
    input.verification === "verified"
      ? isNotNull(users.emailVerifiedAt)
      : undefined,
    input.verification === "unverified"
      ? isNull(users.emailVerifiedAt)
      : undefined,
  ].filter(Boolean) as Array<ReturnType<typeof gte>>;
  const where = conditions.length ? and(...conditions) : undefined;
  const [{ total }] = await db
    .select({ total: sql<number>`count(*)` })
    .from(users)
    .where(where);
  const totalCount = Number(total);
  const safePageSize = Math.min(100, Math.max(1, input.pageSize));
  const totalPages = Math.max(1, Math.ceil(totalCount / safePageSize));
  const page = Math.min(Math.max(1, input.page), totalPages);
  const rows = await db
    .select({
      id: users.id,
      openId: users.openId,
      name: users.name,
      email: users.email,
      role: users.role,
      emailVerifiedAt: users.emailVerifiedAt,
      createdAt: users.createdAt,
      lastSignedIn: users.lastSignedIn,
      cohort: users.cohort,
    })
    .from(users)
    .where(where)
    .orderBy(desc(users.lastSignedIn))
    .limit(safePageSize)
    .offset((page - 1) * safePageSize);
  return { rows, total: totalCount, totalPages, page, pageSize: safePageSize };
}

export async function importUserCohorts(
  rows: Array<{ identifier: string; cohort: string | null }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const normalized = rows
    .map(row => ({
      identifier: row.identifier.trim(),
      cohort: row.cohort?.trim() || null,
    }))
    .filter(row => row.identifier)
    .slice(0, 1000);
  const identifiers = normalized.map(row => row.identifier);
  const matched = identifiers.length
    ? await db
        .select({ openId: users.openId, email: users.email })
        .from(users)
        .where(
          or(
            inArray(users.openId, identifiers),
            inArray(users.email, identifiers)
          )
        )
    : [];
  const byIdentifier = new Map<string, string>();
  matched.forEach(user => {
    byIdentifier.set(user.openId, user.openId);
    if (user.email) byIdentifier.set(user.email, user.openId);
  });
  const unmatched: string[] = [];
  let updated = 0;
  for (const row of normalized) {
    const openId = byIdentifier.get(row.identifier);
    if (!openId) {
      unmatched.push(row.identifier);
      continue;
    }
    await db
      .update(users)
      .set({ cohort: row.cohort })
      .where(eq(users.openId, openId));
    updated += 1;
  }
  return {
    updated,
    unmatched: Array.from(new Set(unmatched)),
    processed: normalized.length,
  };
}

export async function updateUsersCohort(
  openIds: string[],
  cohort: string | null
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const ids = Array.from(
    new Set(openIds.map(id => id.trim()).filter(Boolean))
  ).slice(0, 500);
  if (ids.length)
    await db
      .update(users)
      .set({ cohort: cohort?.trim() || null })
      .where(inArray(users.openId, ids));
  return { updated: ids.length, cohort: cohort?.trim() || null };
}

export async function updateUserCohort(openId: string, cohort: string | null) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(users)
    .set({ cohort: cohort?.trim() || null })
    .where(eq(users.openId, openId));
  return { openId, cohort: cohort?.trim() || null };
}

export async function revokeUserEmailVerification(
  openId: string,
  actor: { openId: string; name?: string | null; email?: string | null },
  reason: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const target = await getUserByOpenId(openId);
  if (!target) return undefined;
  await db.transaction(async tx => {
    await tx
      .update(users)
      .set({ emailVerifiedAt: null })
      .where(eq(users.openId, openId));
    await tx
      .insert(verificationRevocationAudits)
      .values({
        targetOpenId: target.openId,
        targetEmail: target.email,
        actorOpenId: actor.openId,
        actorName: actor.name ?? null,
        actorEmail: actor.email ?? null,
        reason,
      });
  });
  return getUserByOpenId(openId);
}

function auditHistoryConditions(filters: AuditHistoryFilters) {
  const conditions = [];
  if (filters.adminSearch) {
    const search = `%${filters.adminSearch}%`;
    conditions.push(
      or(
        like(verificationRevocationAudits.actorName, search),
        like(verificationRevocationAudits.actorEmail, search),
        like(verificationRevocationAudits.actorOpenId, search)
      )
    );
  }
  if (filters.fromDate)
    conditions.push(
      gte(verificationRevocationAudits.createdAt, filters.fromDate)
    );
  if (filters.toDate)
    conditions.push(
      lte(verificationRevocationAudits.createdAt, filters.toDate)
    );
  return conditions;
}

export async function getVerificationRevocationAuditsPage(
  input: AuditHistoryQuery
): Promise<AuditHistoryPage> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const { page: requestedPage, pageSize } = clampAuditPagination(
    input.page,
    input.pageSize
  );
  const conditions = auditHistoryConditions(input);
  const where = conditions.length ? and(...conditions) : undefined;
  const countRows = await db
    .select({ count: sql<number>`count(*)` })
    .from(verificationRevocationAudits)
    .where(where);
  const total = Number(countRows[0]?.count ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const rows = await db
    .select()
    .from(verificationRevocationAudits)
    .where(where)
    .orderBy(desc(verificationRevocationAudits.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
  return { rows, total, totalPages, page, pageSize };
}

export async function getVerificationRevocationAudits(limit = 50) {
  const page = await getVerificationRevocationAuditsPage({
    page: 1,
    pageSize: limit,
  });
  return page.rows;
}

export async function getVerificationRevocationAuditsForExport(
  filters: AuditHistoryFilters = {}
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const conditions = auditHistoryConditions(filters);
  return db
    .select()
    .from(verificationRevocationAudits)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(verificationRevocationAudits.createdAt))
    .limit(10000);
}

export type DeliveryLogExportJobFilters = {
  search?: string;
  status?: "all" | "sent" | "failed";
  fromDate?: string;
  toDate?: string;
};

export async function createDeliveryLogExportJob(
  requestedByOpenId: string,
  filters: DeliveryLogExportJobFilters
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db
    .insert(deliveryLogExportJobs)
    .values({ requestedByOpenId, filters, status: "queued" });
  return getDeliveryLogExportJob(Number(result[0].insertId));
}

export async function getDeliveryLogExportJob(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return (
    (
      await db
        .select()
        .from(deliveryLogExportJobs)
        .where(eq(deliveryLogExportJobs.id, id))
        .limit(1)
    )[0] ?? undefined
  );
}

export async function getDeliveryLogExportJobs(limit = 20) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db
    .select()
    .from(deliveryLogExportJobs)
    .orderBy(desc(deliveryLogExportJobs.createdAt))
    .limit(Math.min(100, Math.max(1, limit)));
}

export async function claimNextDeliveryLogExportJob() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const next = (
    await db
      .select()
      .from(deliveryLogExportJobs)
      .where(eq(deliveryLogExportJobs.status, "queued"))
      .orderBy(deliveryLogExportJobs.createdAt)
      .limit(1)
  )[0];
  if (!next) return undefined;
  const result = await db
    .update(deliveryLogExportJobs)
    .set({ status: "running", startedAt: new Date(), errorMessage: null })
    .where(
      and(
        eq(deliveryLogExportJobs.id, next.id),
        eq(deliveryLogExportJobs.status, "queued")
      )
    );
  return Number(result[0].affectedRows ?? 0)
    ? getDeliveryLogExportJob(next.id)
    : undefined;
}

export async function completeDeliveryLogExportJob(
  id: number,
  input: { fileKey: string; fileUrl: string; rowCount: number }
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(deliveryLogExportJobs)
    .set({ status: "completed", ...input, completedAt: new Date() })
    .where(
      and(
        eq(deliveryLogExportJobs.id, id),
        eq(deliveryLogExportJobs.status, "running")
      )
    );
  return getDeliveryLogExportJob(id);
}

export async function failDeliveryLogExportJob(
  id: number,
  errorMessage: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(deliveryLogExportJobs)
    .set({
      status: "failed",
      errorMessage: errorMessage.slice(0, 500),
      completedAt: new Date(),
    })
    .where(
      and(
        eq(deliveryLogExportJobs.id, id),
        eq(deliveryLogExportJobs.status, "running")
      )
    );
  return getDeliveryLogExportJob(id);
}

export async function getEmailTemplates() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const rows = await db
    .select()
    .from(emailTemplates)
    .orderBy(emailTemplates.templateKey);
  return defaultEmailTemplates.map(
    fallback =>
      rows.find(row => row.templateKey === fallback.templateKey) ?? {
        id: 0,
        ...fallback,
        updatedByOpenId: null,
        updatedAt: null,
      }
  );
}

export async function upsertEmailTemplate(input: {
  templateKey: string;
  label: string;
  subject: string;
  body: string;
  updatedByOpenId: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .insert(emailTemplates)
    .values(input)
    .onDuplicateKeyUpdate({
      set: {
        label: input.label,
        subject: input.subject,
        body: input.body,
        updatedByOpenId: input.updatedByOpenId,
      },
    });
  return getEmailTemplates();
}

export async function getAssessmentAdminOverview() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  const rows = await db
    .select({
      id: assessmentAttempts.id,
      name: assessmentAttempts.name,
      email: assessmentAttempts.email,
      paymentStatus: assessmentAttempts.paymentStatus,
      paystackReference: assessmentAttempts.paystackReference,
      createdAt: assessmentAttempts.createdAt,
      paidAt: assessmentAttempts.paidAt,
      report: assessmentAttempts.report,
    })
    .from(assessmentAttempts)
    .orderBy(desc(assessmentAttempts.createdAt))
    .limit(250);

  const attempts = rows.map(row => {
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
      paid: attempts.filter(attempt => attempt.paymentStatus === "paid").length,
      pending: attempts.filter(attempt => attempt.paymentStatus !== "paid")
        .length,
    },
  };
}

export async function getOrCreateCourseEnrollment(input: {
  userOpenId: string;
  courseSlug: string;
  name: string;
  email: string;
  amountKes: number;
  stageAmountsKes?: readonly number[];
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const existing = (
    await db
      .select()
      .from(courseLearnerEnrollments)
      .where(
        and(
          eq(courseLearnerEnrollments.userOpenId, input.userOpenId),
          eq(courseLearnerEnrollments.courseSlug, input.courseSlug)
        )
      )
      .limit(1)
  )[0];
  if (existing) {
    await db
      .update(courseLearnerEnrollments)
      .set({ name: input.name, email: input.email, updatedAt: new Date() })
      .where(eq(courseLearnerEnrollments.id, existing.id));
    return (
      await db
        .select()
        .from(courseLearnerEnrollments)
        .where(eq(courseLearnerEnrollments.id, existing.id))
        .limit(1)
    )[0];
  }
  const result = await db
    .insert(courseLearnerEnrollments)
    .values({
      userOpenId: input.userOpenId,
      courseSlug: input.courseSlug,
      name: input.name,
      email: input.email,
    });
  const enrollmentId = Number(result[0].insertId);
  const stageAmounts =
    input.stageAmountsKes?.length === 4
      ? input.stageAmountsKes
      : [input.amountKes, input.amountKes, input.amountKes, input.amountKes];
  await db
    .insert(coursePaymentStages)
    .values(
      [1, 2, 3, 4].map(stage => ({
        enrollmentId,
        stage,
        amountKes: stageAmounts[stage - 1],
      }))
    );
  return (
    await db
      .select()
      .from(courseLearnerEnrollments)
      .where(eq(courseLearnerEnrollments.id, enrollmentId))
      .limit(1)
  )[0];
}
export async function getCourseEnrollmentById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return (
    (
      await db
        .select()
        .from(courseLearnerEnrollments)
        .where(eq(courseLearnerEnrollments.id, id))
        .limit(1)
    )[0] ?? undefined
  );
}

export async function getCourseEnrollment(
  userOpenId: string,
  courseSlug: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return (
    (
      await db
        .select()
        .from(courseLearnerEnrollments)
        .where(
          and(
            eq(courseLearnerEnrollments.userOpenId, userOpenId),
            eq(courseLearnerEnrollments.courseSlug, courseSlug)
          )
        )
        .limit(1)
    )[0] ?? undefined
  );
}
export async function hasCourseAccessGrant(
  userOpenId: string,
  courseSlug: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const row = (
    await db
      .select({ id: courseAccessGrants.id })
      .from(courseAccessGrants)
      .where(
        and(
          eq(courseAccessGrants.userOpenId, userOpenId),
          eq(courseAccessGrants.courseSlug, courseSlug),
          isNull(courseAccessGrants.revokedAt)
        )
      )
      .limit(1)
  )[0];
  return Boolean(row);
}

export async function listCourseAccessGrants(
  filters: { search?: string; courseSlug?: string; activeOnly?: boolean } = {}
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const rows = await db
    .select({
      grant: courseAccessGrants,
      userName: users.name,
      userEmail: users.email,
    })
    .from(courseAccessGrants)
    .leftJoin(users, eq(users.openId, courseAccessGrants.userOpenId))
    .orderBy(desc(courseAccessGrants.updatedAt))
    .limit(500);
  const search = filters.search?.trim().toLowerCase();
  return rows.filter(
    row =>
      (!filters.courseSlug || row.grant.courseSlug === filters.courseSlug) &&
      (!filters.activeOnly || !row.grant.revokedAt) &&
      (!search ||
        `${row.grant.userOpenId} ${row.userName ?? ""} ${row.userEmail ?? ""} ${row.grant.courseSlug}`
          .toLowerCase()
          .includes(search))
  );
}

export async function listCourseAccessGrantAudits() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db
    .select()
    .from(courseAccessGrantAudits)
    .orderBy(desc(courseAccessGrantAudits.createdAt))
    .limit(500);
}

export async function listCourseAccessGrantAuditExportRows(
  filters: {
    search?: string;
    courseSlug?: string;
    action?: "all" | "grant" | "revoke";
    fromDate?: Date;
    toDate?: Date;
  } = {}
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const rows = await db
    .select({
      id: courseAccessGrantAudits.id,
      userOpenId: courseAccessGrantAudits.userOpenId,
      userName: users.name,
      userEmail: users.email,
      courseSlug: courseAccessGrantAudits.courseSlug,
      action: courseAccessGrantAudits.action,
      actorOpenId: courseAccessGrantAudits.actorOpenId,
      actorName: courseAccessGrantAudits.actorName,
      actorEmail: courseAccessGrantAudits.actorEmail,
      createdAt: courseAccessGrantAudits.createdAt,
    })
    .from(courseAccessGrantAudits)
    .leftJoin(users, eq(users.openId, courseAccessGrantAudits.userOpenId))
    .orderBy(desc(courseAccessGrantAudits.createdAt))
    .limit(5000);
  const search = filters.search?.trim().toLowerCase();
  return rows.filter(
    row =>
      (!filters.courseSlug || row.courseSlug === filters.courseSlug) &&
      (!filters.action ||
        filters.action === "all" ||
        row.action === filters.action) &&
      (!filters.fromDate || row.createdAt >= filters.fromDate) &&
      (!filters.toDate || row.createdAt <= filters.toDate) &&
      (!search ||
        `${row.userOpenId} ${row.userName ?? ""} ${row.userEmail ?? ""} ${row.courseSlug} ${row.action} ${row.actorName ?? ""} ${row.actorEmail ?? ""}`
          .toLowerCase()
          .includes(search))
  );
}

export async function bulkSetCourseAccessGrants(input: {
  grants: Array<{ userOpenId: string; courseSlug: string; enabled: boolean }>;
  actorOpenId: string;
  actorName?: string | null;
  actorEmail?: string | null;
}) {
  const unique = Array.from(
    new Map(
      input.grants.map(item => [`${item.userOpenId}:${item.courseSlug}`, item])
    ).values()
  );
  if (!unique.length || unique.length > 100)
    throw new Error("Select between 1 and 100 learner-course access changes.");
  const results = [];
  for (const grant of unique)
    results.push(
      await setCourseAccessGrant({
        ...grant,
        actorOpenId: input.actorOpenId,
        actorName: input.actorName,
        actorEmail: input.actorEmail,
      })
    );
  return { updated: results.length, results };
}

export async function setCourseAccessGrant(input: {
  userOpenId: string;
  courseSlug: string;
  enabled: boolean;
  actorOpenId: string;
  actorName?: string | null;
  actorEmail?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const existing = (
    await db
      .select()
      .from(courseAccessGrants)
      .where(
        and(
          eq(courseAccessGrants.userOpenId, input.userOpenId),
          eq(courseAccessGrants.courseSlug, input.courseSlug)
        )
      )
      .limit(1)
  )[0];
  if (existing) {
    await db
      .update(courseAccessGrants)
      .set({
        grantedByOpenId: input.actorOpenId,
        grantedByName: input.actorName ?? null,
        grantedAt: input.enabled ? new Date() : existing.grantedAt,
        revokedAt: input.enabled ? null : new Date(),
        updatedAt: new Date(),
      })
      .where(eq(courseAccessGrants.id, existing.id));
  } else if (input.enabled) {
    await db
      .insert(courseAccessGrants)
      .values({
        userOpenId: input.userOpenId,
        courseSlug: input.courseSlug,
        grantedByOpenId: input.actorOpenId,
        grantedByName: input.actorName ?? null,
      });
  }
  await db
    .insert(courseAccessGrantAudits)
    .values({
      userOpenId: input.userOpenId,
      courseSlug: input.courseSlug,
      action: input.enabled ? "grant" : "revoke",
      actorOpenId: input.actorOpenId,
      actorName: input.actorName ?? null,
      actorEmail: input.actorEmail ?? null,
    });
  return (
    (
      await db
        .select()
        .from(courseAccessGrants)
        .where(
          and(
            eq(courseAccessGrants.userOpenId, input.userOpenId),
            eq(courseAccessGrants.courseSlug, input.courseSlug)
          )
        )
        .limit(1)
    )[0] ?? null
  );
}

export async function listCourseEnrollmentState(userOpenId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const enrollments = await db
    .select()
    .from(courseLearnerEnrollments)
    .where(eq(courseLearnerEnrollments.userOpenId, userOpenId))
    .orderBy(desc(courseLearnerEnrollments.updatedAt));
  const notifications = await db
    .select()
    .from(courseLessonResponseNotifications)
    .where(eq(courseLessonResponseNotifications.userOpenId, userOpenId))
    .orderBy(desc(courseLessonResponseNotifications.createdAt));
  const profile = (
    await db
      .select({ notificationPreferences: users.notificationPreferences })
      .from(users)
      .where(eq(users.openId, userOpenId))
      .limit(1)
  )[0];
  const preferences = (profile?.notificationPreferences ?? {}) as {
    instructorFeedbackInApp?: boolean;
  };
  const visibleNotifications =
    preferences.instructorFeedbackInApp === false ? [] : notifications;
  return Promise.all(
    enrollments.map(async enrollment => {
      const responses = await db
        .select()
        .from(courseLessonResponses)
        .where(eq(courseLessonResponses.enrollmentId, enrollment.id));
      const reviews = responses.length
        ? await db
            .select()
            .from(courseLessonResponseReviews)
            .where(
              inArray(
                courseLessonResponseReviews.responseId,
                responses.map(response => response.id)
              )
            )
            .orderBy(desc(courseLessonResponseReviews.updatedAt))
        : [];
      return {
        enrollment,
        lessons: await db
          .select()
          .from(courseLessonProgress)
          .where(eq(courseLessonProgress.enrollmentId, enrollment.id)),
        responses,
        reviews,
        notifications: visibleNotifications.filter(
          notification => notification.enrollmentId === enrollment.id
        ),
        quizAttempts: await db
          .select()
          .from(courseQuizAttempts)
          .where(eq(courseQuizAttempts.enrollmentId, enrollment.id))
          .orderBy(desc(courseQuizAttempts.createdAt)),
        stages: await db
          .select()
          .from(coursePaymentStages)
          .where(eq(coursePaymentStages.enrollmentId, enrollment.id))
          .orderBy(coursePaymentStages.stage),
        certificates: await db
          .select()
          .from(courseCertificates)
          .where(eq(courseCertificates.enrollmentId, enrollment.id))
          .orderBy(desc(courseCertificates.createdAt)),
        accessGrant: await hasCourseAccessGrant(
          userOpenId,
          enrollment.courseSlug
        ),
      };
    })
  );
}
export async function listCoursePaymentHistoryPage(
  userOpenId: string,
  input: {
    page: number;
    pageSize: number;
    courseSlug?: string;
    stage?: number;
    status?: string;
    from?: Date;
    to?: Date;
    sort:
      | "date-desc"
      | "date-asc"
      | "amount-desc"
      | "amount-asc"
      | "course-asc"
      | "stage-asc"
      | "status";
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const transactionDate = sql<Date>`COALESCE(${coursePaymentStages.paidAt}, ${coursePaymentStages.initializedAt}, ${coursePaymentStages.updatedAt}, ${courseLearnerEnrollments.updatedAt})`;
  const conditions = [
    eq(courseLearnerEnrollments.userOpenId, userOpenId),
    input.courseSlug
      ? eq(courseLearnerEnrollments.courseSlug, input.courseSlug)
      : undefined,
    input.stage ? eq(coursePaymentStages.stage, input.stage) : undefined,
    input.status
      ? eq(coursePaymentStages.paymentStatus, input.status)
      : undefined,
    input.from ? gte(transactionDate, input.from) : undefined,
    input.to ? lte(transactionDate, input.to) : undefined,
  ].filter((condition): condition is SQL => Boolean(condition));
  const where = and(...conditions);
  const sortExpression = (() => {
    switch (input.sort) {
      case "date-asc":
        return asc(transactionDate);
      case "amount-desc":
        return desc(coursePaymentStages.amountKes);
      case "amount-asc":
        return asc(coursePaymentStages.amountKes);
      case "course-asc":
        return asc(courseLearnerEnrollments.courseSlug);
      case "stage-asc":
        return asc(coursePaymentStages.stage);
      case "status":
        return asc(coursePaymentStages.paymentStatus);
      case "date-desc":
      default:
        return desc(transactionDate);
    }
  })();
  const offset = (Math.max(1, input.page) - 1) * input.pageSize;
  const [rows, totalRows, summaryRows] = await Promise.all([
    db
      .select({
        id: coursePaymentStages.id,
        enrollmentId: coursePaymentStages.enrollmentId,
        courseSlug: courseLearnerEnrollments.courseSlug,
        stage: coursePaymentStages.stage,
        amountKes: coursePaymentStages.amountKes,
        paymentStatus: coursePaymentStages.paymentStatus,
        paidAt: coursePaymentStages.paidAt,
        paystackReference: coursePaymentStages.paystackReference,
        transactionDate,
      })
      .from(coursePaymentStages)
      .innerJoin(
        courseLearnerEnrollments,
        eq(coursePaymentStages.enrollmentId, courseLearnerEnrollments.id)
      )
      .where(where)
      .orderBy(sortExpression, desc(coursePaymentStages.id))
      .limit(input.pageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(coursePaymentStages)
      .innerJoin(
        courseLearnerEnrollments,
        eq(coursePaymentStages.enrollmentId, courseLearnerEnrollments.id)
      )
      .where(where),
    db
      .select({
        paidTotal: sql<number>`COALESCE(SUM(CASE WHEN ${coursePaymentStages.paymentStatus} = 'paid' THEN ${coursePaymentStages.amountKes} ELSE 0 END), 0)`,
        pendingTotal: sql<number>`COALESCE(SUM(CASE WHEN ${coursePaymentStages.paymentStatus} <> 'paid' THEN ${coursePaymentStages.amountKes} ELSE 0 END), 0)`,
      })
      .from(coursePaymentStages)
      .innerJoin(
        courseLearnerEnrollments,
        eq(coursePaymentStages.enrollmentId, courseLearnerEnrollments.id)
      )
      .where(where),
  ]);
  const total = Number(totalRows[0]?.count ?? 0);
  return {
    rows,
    total,
    page: Math.max(1, input.page),
    pageSize: input.pageSize,
    pageCount: Math.max(1, Math.ceil(total / input.pageSize)),
    paidTotal: Number(summaryRows[0]?.paidTotal ?? 0),
    pendingTotal: Number(summaryRows[0]?.pendingTotal ?? 0),
  };
}

export async function markCourseFeedbackNotificationRead(
  userOpenId: string,
  notificationId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(courseLessonResponseNotifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(courseLessonResponseNotifications.id, notificationId),
        eq(courseLessonResponseNotifications.userOpenId, userOpenId),
        isNull(courseLessonResponseNotifications.readAt)
      )
    );
  return { saved: true as const };
}

export async function listCourseLessonResponses(enrollmentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db
    .select()
    .from(courseLessonResponses)
    .where(eq(courseLessonResponses.enrollmentId, enrollmentId));
}

export async function listCourseIllustrationBookmarks(
  userOpenId: string,
  courseSlug?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db
    .select()
    .from(courseLessonIllustrationBookmarks)
    .where(
      courseSlug
        ? and(
            eq(courseLessonIllustrationBookmarks.userOpenId, userOpenId),
            eq(courseLessonIllustrationBookmarks.courseSlug, courseSlug)
          )
        : eq(courseLessonIllustrationBookmarks.userOpenId, userOpenId)
    )
    .orderBy(
      asc(courseLessonIllustrationBookmarks.folder),
      asc(courseLessonIllustrationBookmarks.sortOrder),
      desc(courseLessonIllustrationBookmarks.updatedAt)
    );
}

export async function listCourseIllustrationBookmarksPage(input: {
  userOpenId: string;
  page?: number;
  pageSize?: number;
  search?: string;
  illustrationMode?: "all" | "explanatory" | "applicational" | "experiential";
  folder?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.min(48, Math.max(6, input.pageSize ?? 24));
  const conditions = [
    eq(courseLessonIllustrationBookmarks.userOpenId, input.userOpenId),
  ];
  if (input.illustrationMode && input.illustrationMode !== "all")
    conditions.push(
      eq(
        courseLessonIllustrationBookmarks.illustrationMode,
        input.illustrationMode
      )
    );
  if (input.folder && input.folder !== "all")
    conditions.push(eq(courseLessonIllustrationBookmarks.folder, input.folder));
  if (input.search?.trim()) {
    const query = `%${input.search.trim()}%`;
    conditions.push(
      or(
        like(courseLessonIllustrationBookmarks.courseSlug, query),
        like(courseLessonIllustrationBookmarks.lessonId, query),
        like(courseLessonIllustrationBookmarks.label, query),
        like(courseLessonIllustrationBookmarks.title, query),
        like(courseLessonIllustrationBookmarks.content, query)
      ) as (typeof conditions)[number]
    );
  }
  const where = and(...conditions);
  const [rows, totalRows, folderRows] = await Promise.all([
    db
      .select()
      .from(courseLessonIllustrationBookmarks)
      .where(where)
      .orderBy(
        asc(courseLessonIllustrationBookmarks.folder),
        asc(courseLessonIllustrationBookmarks.sortOrder),
        desc(courseLessonIllustrationBookmarks.updatedAt)
      )
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ count: sql<number>`count(*)` })
      .from(courseLessonIllustrationBookmarks)
      .where(where),
    db
      .select({ folder: courseLessonIllustrationBookmarks.folder })
      .from(courseLessonIllustrationBookmarks)
      .where(eq(courseLessonIllustrationBookmarks.userOpenId, input.userOpenId))
      .groupBy(courseLessonIllustrationBookmarks.folder)
      .orderBy(asc(courseLessonIllustrationBookmarks.folder)),
  ]);
  const total = Number(totalRows[0]?.count ?? 0);
  return {
    rows,
    folders: folderRows.map(row => row.folder),
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function listCourseIllustrationBookmarkIds(input: {
  userOpenId: string;
  search?: string;
  illustrationMode?: "all" | "explanatory" | "applicational" | "experiential";
  folder?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const conditions = [
    eq(courseLessonIllustrationBookmarks.userOpenId, input.userOpenId),
  ];
  if (input.illustrationMode && input.illustrationMode !== "all")
    conditions.push(
      eq(
        courseLessonIllustrationBookmarks.illustrationMode,
        input.illustrationMode
      )
    );
  if (input.folder && input.folder !== "all")
    conditions.push(eq(courseLessonIllustrationBookmarks.folder, input.folder));
  if (input.search?.trim()) {
    const query = `%${input.search.trim()}%`;
    conditions.push(
      or(
        like(courseLessonIllustrationBookmarks.courseSlug, query),
        like(courseLessonIllustrationBookmarks.lessonId, query),
        like(courseLessonIllustrationBookmarks.label, query),
        like(courseLessonIllustrationBookmarks.title, query),
        like(courseLessonIllustrationBookmarks.content, query)
      ) as (typeof conditions)[number]
    );
  }
  const rows = await db
    .select({ id: courseLessonIllustrationBookmarks.id })
    .from(courseLessonIllustrationBookmarks)
    .where(and(...conditions))
    .orderBy(
      asc(courseLessonIllustrationBookmarks.folder),
      asc(courseLessonIllustrationBookmarks.sortOrder),
      desc(courseLessonIllustrationBookmarks.updatedAt)
    );
  return rows.map(row => row.id);
}

export async function saveCourseRecommendationAnswers(
  userOpenId: string,
  answers: { careerGoal: string; skillLevel: string }
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const savedAt = new Date();
  await db
    .update(users)
    .set({
      recommendationAnswers: { ...answers, savedAt: savedAt.toISOString() },
    })
    .where(eq(users.openId, userOpenId));
  await db
    .insert(courseRecommendationHistory)
    .values({
      userOpenId,
      careerGoal: answers.careerGoal,
      skillLevel: answers.skillLevel,
      createdAt: savedAt,
    });
  return { saved: true as const, answers, savedAt: savedAt.toISOString() };
}

export async function listSavedCourses(userOpenId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db
    .select()
    .from(courseSavedCourses)
    .where(eq(courseSavedCourses.userOpenId, userOpenId))
    .orderBy(desc(courseSavedCourses.createdAt));
}

export async function listSavedCoursesPage(input: {
  userOpenId: string;
  page: number;
  pageSize: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const safePage = Math.max(1, Math.floor(input.page));
  const safePageSize = Math.min(24, Math.max(1, Math.floor(input.pageSize)));
  const where = eq(courseSavedCourses.userOpenId, input.userOpenId);
  const [rows, totals] = await Promise.all([
    db
      .select()
      .from(courseSavedCourses)
      .where(where)
      .orderBy(desc(courseSavedCourses.createdAt))
      .limit(safePageSize)
      .offset((safePage - 1) * safePageSize),
    db
      .select({ count: sql<number>`count(*)` })
      .from(courseSavedCourses)
      .where(where),
  ]);
  const total = Number(totals[0]?.count ?? 0);
  return {
    rows,
    page: safePage,
    pageSize: safePageSize,
    total,
    pageCount: Math.max(1, Math.ceil(total / safePageSize)),
  };
}

export async function listCourseRecommendationHistory(
  userOpenId: string,
  limit = 12
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db
    .select()
    .from(courseRecommendationHistory)
    .where(eq(courseRecommendationHistory.userOpenId, userOpenId))
    .orderBy(desc(courseRecommendationHistory.createdAt))
    .limit(Math.min(30, Math.max(1, limit)));
}

export async function toggleSavedCourse(
  userOpenId: string,
  courseSlug: string,
  saved: boolean
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  if (saved)
    await db
      .insert(courseSavedCourses)
      .values({ userOpenId, courseSlug })
      .onDuplicateKeyUpdate({ set: { courseSlug } });
  else
    await db
      .delete(courseSavedCourses)
      .where(
        and(
          eq(courseSavedCourses.userOpenId, userOpenId),
          eq(courseSavedCourses.courseSlug, courseSlug)
        )
      );
  return { saved, courseSlug };
}

export async function upsertCourseIllustrationBookmark(input: {
  userOpenId: string;
  courseSlug: string;
  lessonId: string;
  illustrationMode: "explanatory" | "applicational" | "experiential";
  label: string;
  title: string;
  content: string;
  folder?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const folder = input.folder?.trim() || "Unsorted";
  await db
    .insert(courseLessonIllustrationBookmarks)
    .values({ ...input, folder })
    .onDuplicateKeyUpdate({
      set: {
        label: input.label,
        title: input.title,
        content: input.content,
        folder,
        updatedAt: new Date(),
      },
    });
  return (
    await db
      .select()
      .from(courseLessonIllustrationBookmarks)
      .where(
        and(
          eq(courseLessonIllustrationBookmarks.userOpenId, input.userOpenId),
          eq(courseLessonIllustrationBookmarks.courseSlug, input.courseSlug),
          eq(courseLessonIllustrationBookmarks.lessonId, input.lessonId),
          eq(
            courseLessonIllustrationBookmarks.illustrationMode,
            input.illustrationMode
          )
        )
      )
      .limit(1)
  )[0];
}

export async function updateCourseIllustrationBookmarkFolder(input: {
  userOpenId: string;
  bookmarkId: number;
  folder: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const folder = input.folder.trim();
  if (!folder) throw new Error("Folder name cannot be blank.");
  await db
    .update(courseLessonIllustrationBookmarks)
    .set({ folder, updatedAt: new Date() })
    .where(
      and(
        eq(courseLessonIllustrationBookmarks.id, input.bookmarkId),
        eq(courseLessonIllustrationBookmarks.userOpenId, input.userOpenId)
      )
    );
  return (
    (
      await db
        .select()
        .from(courseLessonIllustrationBookmarks)
        .where(
          and(
            eq(courseLessonIllustrationBookmarks.id, input.bookmarkId),
            eq(courseLessonIllustrationBookmarks.userOpenId, input.userOpenId)
          )
        )
        .limit(1)
    )[0] ?? null
  );
}

export async function renameCourseIllustrationFolder(input: {
  userOpenId: string;
  fromFolder: string;
  toFolder: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const fromFolder = input.fromFolder.trim();
  const toFolder = input.toFolder.trim();
  if (!fromFolder || !toFolder)
    throw new Error("Folder names cannot be blank.");
  if (fromFolder === "Unsorted")
    throw new Error("The Unsorted folder cannot be renamed.");
  if (toFolder === "Unsorted")
    throw new Error("Use delete to move a custom folder back to Unsorted.");
  if (fromFolder === toFolder) return { renamed: 0, fromFolder, toFolder };
  const rows = await db
    .select({ id: courseLessonIllustrationBookmarks.id })
    .from(courseLessonIllustrationBookmarks)
    .where(
      and(
        eq(courseLessonIllustrationBookmarks.userOpenId, input.userOpenId),
        eq(courseLessonIllustrationBookmarks.folder, fromFolder)
      )
    );
  if (!rows.length)
    throw new Error("That folder is empty or no longer available.");
  await db
    .update(courseLessonIllustrationBookmarks)
    .set({ folder: toFolder, updatedAt: new Date() })
    .where(
      and(
        eq(courseLessonIllustrationBookmarks.userOpenId, input.userOpenId),
        eq(courseLessonIllustrationBookmarks.folder, fromFolder)
      )
    );
  return { renamed: rows.length, fromFolder, toFolder };
}

export async function deleteCourseIllustrationFolder(input: {
  userOpenId: string;
  folder: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const folder = input.folder.trim();
  if (!folder || folder === "Unsorted")
    throw new Error("The Unsorted folder cannot be deleted.");
  const rows = await db
    .select({ id: courseLessonIllustrationBookmarks.id })
    .from(courseLessonIllustrationBookmarks)
    .where(
      and(
        eq(courseLessonIllustrationBookmarks.userOpenId, input.userOpenId),
        eq(courseLessonIllustrationBookmarks.folder, folder)
      )
    );
  if (!rows.length)
    throw new Error("That folder is empty or no longer available.");
  await db
    .update(courseLessonIllustrationBookmarks)
    .set({ folder: "Unsorted", updatedAt: new Date() })
    .where(
      and(
        eq(courseLessonIllustrationBookmarks.userOpenId, input.userOpenId),
        eq(courseLessonIllustrationBookmarks.folder, folder)
      )
    );
  return { deleted: true as const, reassigned: rows.length, folder };
}

export async function bulkMoveCourseIllustrationBookmarks(input: {
  userOpenId: string;
  bookmarkIds: number[];
  folder: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const folder = input.folder.trim();
  const bookmarkIds = Array.from(new Set(input.bookmarkIds));
  if (!folder) throw new Error("Folder name cannot be blank.");
  if (!bookmarkIds.length || bookmarkIds.length > 500)
    throw new Error("Select between 1 and 500 illustrations.");
  await db
    .update(courseLessonIllustrationBookmarks)
    .set({ folder, updatedAt: new Date() })
    .where(
      and(
        eq(courseLessonIllustrationBookmarks.userOpenId, input.userOpenId),
        inArray(courseLessonIllustrationBookmarks.id, bookmarkIds)
      )
    );
  return { moved: bookmarkIds.length, folder };
}

export async function reorderCourseIllustrationBookmarks(input: {
  userOpenId: string;
  folder: string;
  orderedBookmarkIds: number[];
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const folder = input.folder.trim();
  const orderedIds = Array.from(new Set(input.orderedBookmarkIds));
  if (!folder || folder === "all")
    throw new Error("Choose a specific folder before reordering.");
  if (!orderedIds.length || orderedIds.length > 100)
    throw new Error(
      "A folder can reorder between 1 and 100 illustrations at a time."
    );
  const rows = await db
    .select({
      id: courseLessonIllustrationBookmarks.id,
      folder: courseLessonIllustrationBookmarks.folder,
    })
    .from(courseLessonIllustrationBookmarks)
    .where(
      and(
        eq(courseLessonIllustrationBookmarks.userOpenId, input.userOpenId),
        inArray(courseLessonIllustrationBookmarks.id, orderedIds)
      )
    );
  if (
    rows.length !== orderedIds.length ||
    rows.some(row => row.folder !== folder)
  )
    throw new Error("Some illustrations are not available in this folder.");
  await db.transaction(async transaction => {
    for (let index = 0; index < orderedIds.length; index += 1)
      await transaction
        .update(courseLessonIllustrationBookmarks)
        .set({ sortOrder: index, updatedAt: new Date() })
        .where(
          and(
            eq(courseLessonIllustrationBookmarks.id, orderedIds[index]),
            eq(courseLessonIllustrationBookmarks.userOpenId, input.userOpenId),
            eq(courseLessonIllustrationBookmarks.folder, folder)
          )
        );
  });
  return { reordered: orderedIds.length, folder };
}

export async function deleteCourseIllustrationBookmark(input: {
  userOpenId: string;
  courseSlug: string;
  lessonId: string;
  illustrationMode: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .delete(courseLessonIllustrationBookmarks)
    .where(
      and(
        eq(courseLessonIllustrationBookmarks.userOpenId, input.userOpenId),
        eq(courseLessonIllustrationBookmarks.courseSlug, input.courseSlug),
        eq(courseLessonIllustrationBookmarks.lessonId, input.lessonId),
        eq(
          courseLessonIllustrationBookmarks.illustrationMode,
          input.illustrationMode
        )
      )
    );
  return { deleted: true as const };
}

export async function upsertCourseLessonResponse(input: {
  enrollmentId: number;
  lessonId: string;
  taskId: string;
  responseHtml: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const responseHtml = input.responseHtml.trim();
  if (
    !responseHtml
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/gi, " ")
      .trim()
  )
    throw new Error("Lesson responses cannot be blank.");
  await db
    .insert(courseLessonResponses)
    .values({ ...input, responseHtml })
    .onDuplicateKeyUpdate({ set: { responseHtml, updatedAt: new Date() } });
  return { saved: true as const };
}

export async function listCourseLessonResponsesForStaff(input: {
  page: number;
  pageSize: number;
  search?: string;
  courseSlug?: string;
  reviewStatus?: "all" | "reviewed" | "needs-review";
  fromDate?: Date;
  toDate?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const enrollments = await db
    .select()
    .from(courseLearnerEnrollments)
    .orderBy(desc(courseLearnerEnrollments.updatedAt));
  const enrollmentIds = enrollments.map(enrollment => enrollment.id);
  if (!enrollmentIds.length)
    return {
      rows: [],
      total: 0,
      page: input.page,
      pageSize: input.pageSize,
      totalPages: 1,
    };
  const responses = await db
    .select()
    .from(courseLessonResponses)
    .where(inArray(courseLessonResponses.enrollmentId, enrollmentIds))
    .orderBy(desc(courseLessonResponses.updatedAt));
  if (!responses.length)
    return {
      rows: [],
      total: 0,
      page: input.page,
      pageSize: input.pageSize,
      totalPages: 1,
    };
  const reviews = await db
    .select()
    .from(courseLessonResponseReviews)
    .where(
      inArray(
        courseLessonResponseReviews.responseId,
        responses.map(response => response.id)
      )
    );
  const enrollmentMap = new Map(
    enrollments.map(enrollment => [enrollment.id, enrollment])
  );
  const reviewMap = new Map(reviews.map(review => [review.responseId, review]));
  const search = input.search?.toLowerCase();
  const rows = responses
    .map(response => ({
      response,
      enrollment: enrollmentMap.get(response.enrollmentId),
      review: reviewMap.get(response.id),
    }))
    .filter(row => {
      const updatedAt = row.response.updatedAt;
      return (
        row.enrollment &&
        (!input.courseSlug || row.enrollment.courseSlug === input.courseSlug) &&
        (!input.fromDate || updatedAt >= input.fromDate) &&
        (!input.toDate || updatedAt <= input.toDate) &&
        (!input.reviewStatus ||
          input.reviewStatus === "all" ||
          (input.reviewStatus === "reviewed"
            ? Boolean(row.review)
            : !row.review)) &&
        (!search ||
          `${row.enrollment.name} ${row.enrollment.email} ${row.enrollment.courseSlug} ${row.response.lessonId} ${row.response.taskId} ${row.response.responseHtml}`
            .toLowerCase()
            .includes(search))
      );
    });
  const start = Math.max(0, (input.page - 1) * input.pageSize);
  return {
    rows: rows.slice(start, start + input.pageSize),
    total: rows.length,
    page: input.page,
    pageSize: input.pageSize,
    totalPages: Math.max(1, Math.ceil(rows.length / input.pageSize)),
  };
}

export async function getCourseLessonReviewAnalytics(input: {
  courseSlug?: string;
  fromDate?: Date;
  toDate?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const enrollments = await db.select().from(courseLearnerEnrollments);
  const enrollmentMap = new Map(
    enrollments.map(enrollment => [enrollment.id, enrollment])
  );
  const enrollmentIds = enrollments.map(enrollment => enrollment.id);
  if (!enrollmentIds.length)
    return {
      totalResponses: 0,
      reviewedResponses: 0,
      needsReviewResponses: 0,
      reviewRate: 0,
      aging: {
        averageAgeHours: 0,
        oldestAgeHours: 0,
        under24Hours: 0,
        oneToThreeDays: 0,
        overThreeDays: 0,
      },
      reviewerWorkload: [],
      reviewerWorkloadTrend: [],
      byCourse: [],
      byModule: [],
    };
  const responses = await db
    .select()
    .from(courseLessonResponses)
    .where(inArray(courseLessonResponses.enrollmentId, enrollmentIds));
  const reviews = responses.length
    ? await db
        .select()
        .from(courseLessonResponseReviews)
        .where(
          inArray(
            courseLessonResponseReviews.responseId,
            responses.map(response => response.id)
          )
        )
    : [];
  const reviewMap = new Map(reviews.map(review => [review.responseId, review]));
  const filtered = responses.filter(response => {
    const enrollment = enrollmentMap.get(response.enrollmentId);
    return (
      enrollment &&
      (!input.courseSlug || enrollment.courseSlug === input.courseSlug) &&
      (!input.fromDate || response.updatedAt >= input.fromDate) &&
      (!input.toDate || response.updatedAt <= input.toDate)
    );
  });
  const byCourse = new Map<
    string,
    {
      courseSlug: string;
      totalResponses: number;
      reviewedResponses: number;
      needsReviewResponses: number;
    }
  >();
  const byModule = new Map<
    string,
    {
      courseSlug: string;
      moduleIndex: number;
      totalResponses: number;
      reviewedResponses: number;
      needsReviewResponses: number;
    }
  >();
  for (const response of filtered) {
    const courseSlug = enrollmentMap.get(response.enrollmentId)!.courseSlug;
    const moduleIndex = Math.max(
      0,
      Number(response.lessonId.match(/module-(\\d+)/)?.[1] ?? 1) - 1
    );
    const reviewed = Boolean(reviewMap.get(response.id));
    const course = byCourse.get(courseSlug) ?? {
      courseSlug,
      totalResponses: 0,
      reviewedResponses: 0,
      needsReviewResponses: 0,
    };
    course.totalResponses += 1;
    reviewed
      ? (course.reviewedResponses += 1)
      : (course.needsReviewResponses += 1);
    byCourse.set(courseSlug, course);
    const moduleKey = `${courseSlug}:${moduleIndex}`;
    const module = byModule.get(moduleKey) ?? {
      courseSlug,
      moduleIndex,
      totalResponses: 0,
      reviewedResponses: 0,
      needsReviewResponses: 0,
    };
    module.totalResponses += 1;
    reviewed
      ? (module.reviewedResponses += 1)
      : (module.needsReviewResponses += 1);
    byModule.set(moduleKey, module);
  }
  const totalResponses = filtered.length;
  const reviewedResponses = filtered.filter(response =>
    reviewMap.has(response.id)
  ).length;
  const openResponses = filtered.filter(
    response => !reviewMap.has(response.id)
  );
  const ages = openResponses.map(response =>
    Math.max(0, (Date.now() - response.updatedAt.getTime()) / 3600000)
  );
  const reviewerMap = new Map<
    string,
    {
      reviewerOpenId: string;
      reviewerName: string;
      reviewedResponses: number;
      latestReviewedAt: Date | null;
    }
  >();
  const workloadTrendMap = new Map<
    string,
    { date: string; reviewedResponses: number; reviewers: number }
  >();
  for (const response of filtered) {
    const review = reviewMap.get(response.id);
    if (!review) continue;
    const reviewerOpenId = review.reviewerOpenId;
    const current = reviewerMap.get(reviewerOpenId) ?? {
      reviewerOpenId,
      reviewerName: review.reviewerName ?? reviewerOpenId,
      reviewedResponses: 0,
      latestReviewedAt: null,
    };
    current.reviewedResponses += 1;
    if (
      !current.latestReviewedAt ||
      review.updatedAt > current.latestReviewedAt
    )
      current.latestReviewedAt = review.updatedAt;
    reviewerMap.set(reviewerOpenId, current);
    const date = review.updatedAt.toISOString().slice(0, 10);
    const trend = workloadTrendMap.get(date) ?? {
      date,
      reviewedResponses: 0,
      reviewers: 0,
    };
    trend.reviewedResponses += 1;
    trend.reviewers = new Set(
      filtered
        .filter(item => {
          const itemReview = reviewMap.get(item.id);
          return (
            itemReview &&
            itemReview.updatedAt.toISOString().slice(0, 10) === date
          );
        })
        .map(item => reviewMap.get(item.id)!.reviewerOpenId)
    ).size;
    workloadTrendMap.set(date, trend);
  }
  return {
    totalResponses,
    reviewedResponses,
    needsReviewResponses: totalResponses - reviewedResponses,
    reviewRate: totalResponses
      ? Math.round((reviewedResponses / totalResponses) * 100)
      : 0,
    aging: {
      averageAgeHours: ages.length
        ? Math.round(
            (ages.reduce((sum, age) => sum + age, 0) / ages.length) * 10
          ) / 10
        : 0,
      oldestAgeHours: ages.length ? Math.round(Math.max(...ages) * 10) / 10 : 0,
      under24Hours: ages.filter(age => age < 24).length,
      oneToThreeDays: ages.filter(age => age >= 24 && age < 72).length,
      overThreeDays: ages.filter(age => age >= 72).length,
    },
    reviewerWorkload: Array.from(reviewerMap.values()).sort(
      (a, b) => b.reviewedResponses - a.reviewedResponses
    ),
    reviewerWorkloadTrend: Array.from(workloadTrendMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    ),
    byCourse: Array.from(byCourse.values())
      .map(row => ({
        ...row,
        reviewRate: row.totalResponses
          ? Math.round((row.reviewedResponses / row.totalResponses) * 100)
          : 0,
      }))
      .sort((a, b) => b.totalResponses - a.totalResponses),
    byModule: Array.from(byModule.values())
      .map(row => ({
        ...row,
        reviewRate: row.totalResponses
          ? Math.round((row.reviewedResponses / row.totalResponses) * 100)
          : 0,
      }))
      .sort(
        (a, b) =>
          a.courseSlug.localeCompare(b.courseSlug) ||
          a.moduleIndex - b.moduleIndex
      ),
  };
}

export async function upsertCourseLessonResponseReview(input: {
  responseId: number;
  enrollmentId: number;
  lessonId: string;
  taskId: string;
  reviewerOpenId: string;
  reviewerName?: string | null;
  feedback: string;
  status: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const feedback = input.feedback.trim();
  if (!feedback) throw new Error("Instructor feedback cannot be blank.");
  const response = (
    await db
      .select()
      .from(courseLessonResponses)
      .where(eq(courseLessonResponses.id, input.responseId))
      .limit(1)
  )[0];
  if (
    !response ||
    response.enrollmentId !== input.enrollmentId ||
    response.lessonId !== input.lessonId ||
    response.taskId !== input.taskId
  )
    throw new Error("Learner response could not be verified.");
  const enrollment = (
    await db
      .select()
      .from(courseLearnerEnrollments)
      .where(eq(courseLearnerEnrollments.id, input.enrollmentId))
      .limit(1)
  )[0];
  if (!enrollment) throw new Error("Learner enrollment could not be verified.");
  const previousReview = (
    await db
      .select()
      .from(courseLessonResponseReviews)
      .where(eq(courseLessonResponseReviews.responseId, input.responseId))
      .limit(1)
  )[0];
  const reviewResult = await db
    .insert(courseLessonResponseReviews)
    .values({ ...input, feedback })
    .onDuplicateKeyUpdate({
      set: {
        reviewerName: input.reviewerName ?? null,
        feedback,
        status: input.status,
        updatedAt: new Date(),
      },
    });
  const reviewId = previousReview?.id ?? Number(reviewResult[0].insertId);
  let notificationCreated = false;
  if (
    input.status === "reviewed" &&
    (!previousReview ||
      previousReview.feedback !== feedback ||
      previousReview.status !== "reviewed")
  ) {
    await db
      .insert(courseLessonResponseNotifications)
      .values({
        userOpenId: enrollment.userOpenId,
        enrollmentId: input.enrollmentId,
        responseId: input.responseId,
        reviewId,
        courseSlug: enrollment.courseSlug,
        lessonId: input.lessonId,
        taskId: input.taskId,
        title: "New instructor feedback",
        body: feedback,
      });
    notificationCreated = true;
  }
  return {
    saved: true as const,
    notificationCreated,
    learnerOpenId: enrollment.userOpenId,
    learnerEmail: enrollment.email,
    learnerName: enrollment.name,
    courseSlug: enrollment.courseSlug,
  };
}

export async function markCourseLessonComplete(
  enrollmentId: number,
  lessonId: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .insert(courseLessonProgress)
    .values({ enrollmentId, lessonId })
    .onDuplicateKeyUpdate({ set: { completedAt: new Date() } });
}
export async function recordCourseQuizAttempt(input: {
  enrollmentId: number;
  moduleId: string;
  score: number;
  passed: boolean;
  answers: unknown;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(courseQuizAttempts).values(input);
  return Number(result[0].insertId);
}
export async function getCoursePaymentEventById(eventId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return (
    (
      await db
        .select()
        .from(coursePaymentEvents)
        .where(eq(coursePaymentEvents.eventId, eventId))
        .limit(1)
    )[0] ?? undefined
  );
}

export async function createCoursePaymentEvent(input: {
  eventId: string;
  enrollmentId?: number | null;
  paymentStageId?: number | null;
  reference?: string | null;
  eventType: string;
  transactionStatus?: string | null;
  amountKes?: number | null;
  currency?: string | null;
  payload?: unknown;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const existing = await getCoursePaymentEventById(input.eventId);
  if (existing) return { event: existing, duplicate: true as const };
  const result = await db
    .insert(coursePaymentEvents)
    .values({ ...input, payload: input.payload ?? null });
  const event = (
    await db
      .select()
      .from(coursePaymentEvents)
      .where(eq(coursePaymentEvents.id, Number(result[0].insertId)))
      .limit(1)
  )[0];
  return { event, duplicate: false as const };
}

export async function markCoursePaymentEventProcessed(
  eventId: string,
  errorMessage?: string | null
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(coursePaymentEvents)
    .set({ processedAt: new Date(), errorMessage: errorMessage ?? null })
    .where(eq(coursePaymentEvents.eventId, eventId));
}

export async function updateCoursePaymentStageStatus(
  id: number,
  input: { status: string; errorMessage?: string | null; paid?: boolean }
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const now = new Date();
  await db
    .update(coursePaymentStages)
    .set({
      paymentStatus: input.status,
      lastCheckedAt: now,
      lastError: input.errorMessage ?? null,
      paidAt: input.paid ? now : undefined,
    })
    .where(eq(coursePaymentStages.id, id));
  return (
    (
      await db
        .select()
        .from(coursePaymentStages)
        .where(eq(coursePaymentStages.id, id))
        .limit(1)
    )[0] ?? undefined
  );
}

export async function listCoursePaymentExceptions(input: {
  status?: "all" | "pending" | "failed" | "exception" | "paid";
  search?: string;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const status = input.status ?? "all";
  const search = input.search?.trim();
  const conditions = [
    status !== "all"
      ? eq(coursePaymentStages.paymentStatus, status)
      : undefined,
    search
      ? or(
          like(courseLearnerEnrollments.name, `%${search}%`),
          like(courseLearnerEnrollments.email, `%${search}%`),
          like(courseLearnerEnrollments.courseSlug, `%${search}%`),
          like(coursePaymentStages.paystackReference, `%${search}%`)
        )
      : undefined,
  ].filter(Boolean) as Array<ReturnType<typeof eq>>;
  const rows = await db
    .select({
      stage: coursePaymentStages,
      enrollment: courseLearnerEnrollments,
    })
    .from(coursePaymentStages)
    .innerJoin(
      courseLearnerEnrollments,
      eq(courseLearnerEnrollments.id, coursePaymentStages.enrollmentId)
    )
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(coursePaymentStages.updatedAt))
    .limit(Math.min(250, Math.max(1, input.limit ?? 100)));
  const summary = {
    total: rows.length,
    pending: rows.filter(row => row.stage.paymentStatus === "pending").length,
    failed: rows.filter(row => row.stage.paymentStatus === "failed").length,
    exception: rows.filter(row => row.stage.paymentStatus === "exception")
      .length,
    paid: rows.filter(row => row.stage.paymentStatus === "paid").length,
  };
  return { rows, summary };
}

export async function getCourseActivePosition(enrollmentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return (
    (
      await db
        .select()
        .from(courseActivePositions)
        .where(eq(courseActivePositions.enrollmentId, enrollmentId))
        .limit(1)
    )[0] ?? null
  );
}

export async function upsertCourseActivePosition(input: {
  enrollmentId: number;
  moduleIndex: number;
  lessonId?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .insert(courseActivePositions)
    .values(input)
    .onDuplicateKeyUpdate({
      set: {
        moduleIndex: input.moduleIndex,
        lessonId: input.lessonId ?? null,
        updatedAt: new Date(),
      },
    });
  return getCourseActivePosition(input.enrollmentId);
}

export async function getCoursePaymentStageById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return (
    (
      await db
        .select()
        .from(coursePaymentStages)
        .where(eq(coursePaymentStages.id, id))
        .limit(1)
    )[0] ?? undefined
  );
}

export async function getCoursePaymentStageByReference(reference: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return (
    (
      await db
        .select()
        .from(coursePaymentStages)
        .where(eq(coursePaymentStages.paystackReference, reference))
        .limit(1)
    )[0] ?? undefined
  );
}
export async function setCoursePaymentStageReference(
  id: number,
  reference: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(coursePaymentStages)
    .set({ paystackReference: reference, initializedAt: new Date() })
    .where(eq(coursePaymentStages.id, id));
}
export async function markCoursePaymentStagePaid(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(coursePaymentStages)
    .set({ paymentStatus: "paid", paidAt: new Date() })
    .where(
      and(
        eq(coursePaymentStages.id, id),
        eq(coursePaymentStages.paymentStatus, "pending")
      )
    );
}
export async function createCourseCertificate(input: {
  enrollmentId: number;
  recipientName: string;
  courseTitle: string;
  certificateNumber: string;
  fileKey?: string;
  fileUrl?: string;
  artifactHash?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const existing = (
    await db
      .select()
      .from(courseCertificates)
      .where(eq(courseCertificates.enrollmentId, input.enrollmentId))
      .limit(1)
  )[0];
  if (existing) return existing;
  const result = await db.insert(courseCertificates).values(input);
  return (
    await db
      .select()
      .from(courseCertificates)
      .where(eq(courseCertificates.id, Number(result[0].insertId)))
      .limit(1)
  )[0];
}

export async function findPublicCourseCertificate(certificateNumber: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return (
    (
      await db
        .select({
          certificateNumber: courseCertificates.certificateNumber,
          recipientName: courseCertificates.recipientName,
          courseTitle: courseCertificates.courseTitle,
          status: courseCertificates.status,
          artifactHash: courseCertificates.artifactHash,
          createdAt: courseCertificates.createdAt,
        })
        .from(courseCertificates)
        .where(
          and(
            eq(courseCertificates.certificateNumber, certificateNumber),
            eq(courseCertificates.status, "issued")
          )
        )
        .limit(1)
    )[0] ?? null
  );
}

export async function getCourseCertificateByEnrollmentId(
  enrollmentId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return (
    (
      await db
        .select()
        .from(courseCertificates)
        .where(eq(courseCertificates.enrollmentId, enrollmentId))
        .limit(1)
    )[0] ?? null
  );
}

export async function listCourseCertificatesForAdmin(
  input: {
    courseSlug?: string;
    status?: string;
    search?: string;
    from?: Date;
    to?: Date;
    limit?: number;
  } = {}
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const conditions = [
    input.courseSlug && input.courseSlug !== "all"
      ? eq(courseLearnerEnrollments.courseSlug, input.courseSlug)
      : undefined,
    input.status && input.status !== "all"
      ? eq(courseCertificates.status, input.status)
      : undefined,
    input.from ? gte(courseCertificates.createdAt, input.from) : undefined,
    input.to ? lte(courseCertificates.createdAt, input.to) : undefined,
    input.search?.trim()
      ? or(
          like(
            courseCertificates.certificateNumber,
            `%${input.search.trim()}%`
          ),
          like(courseCertificates.recipientName, `%${input.search.trim()}%`),
          like(courseCertificates.courseTitle, `%${input.search.trim()}%`)
        )
      : undefined,
  ].filter(Boolean) as Array<ReturnType<typeof eq>>;
  return db
    .select({
      id: courseCertificates.id,
      enrollmentId: courseCertificates.enrollmentId,
      certificateNumber: courseCertificates.certificateNumber,
      recipientName: courseCertificates.recipientName,
      courseTitle: courseCertificates.courseTitle,
      courseSlug: courseLearnerEnrollments.courseSlug,
      status: courseCertificates.status,
      artifactHash: courseCertificates.artifactHash,
      emailStatus: courseCertificates.emailStatus,
      createdAt: courseCertificates.createdAt,
    })
    .from(courseCertificates)
    .innerJoin(
      courseLearnerEnrollments,
      eq(courseCertificates.enrollmentId, courseLearnerEnrollments.id)
    )
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(courseCertificates.createdAt))
    .limit(Math.min(500, Math.max(1, input.limit ?? 100)));
}

export async function getCareerPathActiveModule(userOpenId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return (
    (
      await db
        .select()
        .from(careerPathActiveModules)
        .where(eq(careerPathActiveModules.userOpenId, userOpenId))
        .limit(1)
    )[0] ?? null
  );
}

export async function upsertCareerPathActiveModule(
  userOpenId: string,
  moduleIndex: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .insert(careerPathActiveModules)
    .values({ userOpenId, moduleIndex })
    .onDuplicateKeyUpdate({ set: { moduleIndex, updatedAt: new Date() } });
  return getCareerPathActiveModule(userOpenId);
}

export async function countUserSocialShares(userOpenId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const rows = await db
    .select({
      eventName: analyticsEvents.eventName,
      count: sql<number>`count(*)`,
    })
    .from(analyticsEvents)
    .where(eq(analyticsEvents.userOpenId, userOpenId))
    .groupBy(analyticsEvents.eventName);
  return Object.fromEntries(
    rows
      .filter(row => row.eventName.startsWith("careerpath_shared_"))
      .map(row => [
        row.eventName.replace("careerpath_shared_", ""),
        Number(row.count),
      ])
  );
}

export async function getCareerPathShareAnalytics() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const rows = await db
    .select({
      eventName: analyticsEvents.eventName,
      count: sql<number>`count(*)`,
    })
    .from(analyticsEvents)
    .where(like(analyticsEvents.eventName, "careerpath_shared_%"))
    .groupBy(analyticsEvents.eventName);
  return rows
    .map(row => ({
      platform: row.eventName.replace("careerpath_shared_", ""),
      count: Number(row.count),
    }))
    .sort((a, b) => b.count - a.count);
}

export async function listOrganizationInvitations(input: {
  status?: string;
  search?: string;
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const conditions = [
    input.status && input.status !== "all"
      ? eq(organizationInvitations.status, input.status)
      : undefined,
    input.search?.trim()
      ? or(
          like(
            organizationInvitations.organizationName,
            `%${input.search.trim()}%`
          ),
          like(
            organizationInvitations.organizationEmail,
            `%${input.search.trim()}%`
          )
        )
      : undefined,
    input.from ? gte(organizationInvitations.createdAt, input.from) : undefined,
    input.to ? lte(organizationInvitations.createdAt, input.to) : undefined,
  ].filter(Boolean) as Array<ReturnType<typeof eq>>;
  return db
    .select()
    .from(organizationInvitations)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(organizationInvitations.createdAt))
    .limit(Math.min(500, Math.max(1, input.limit ?? 100)))
    .offset(Math.max(0, input.offset ?? 0));
}

export async function listOrganizationApprovalEvents(input: {
  search?: string;
  from?: Date;
  to?: Date;
  page?: number;
  pageSize?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const conditions = [
    input.search?.trim()
      ? or(
          like(
            organizationApprovalEvents.organizationName,
            `%${input.search.trim()}%`
          ),
          like(
            organizationApprovalEvents.organizationEmail,
            `%${input.search.trim()}%`
          ),
          like(organizationApprovalEvents.eventType, `%${input.search.trim()}%`)
        )
      : undefined,
    input.from
      ? gte(organizationApprovalEvents.createdAt, input.from)
      : undefined,
    input.to ? lte(organizationApprovalEvents.createdAt, input.to) : undefined,
  ].filter(Boolean) as Array<ReturnType<typeof eq>>;
  const where = conditions.length ? and(...conditions) : undefined;
  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, input.pageSize ?? 20));
  const [rows, totalRows, trendSource] = await Promise.all([
    db
      .select()
      .from(organizationApprovalEvents)
      .where(where)
      .orderBy(desc(organizationApprovalEvents.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ count: sql<number>`count(*)` })
      .from(organizationApprovalEvents)
      .where(where),
    db
      .select({
        createdAt: organizationApprovalEvents.createdAt,
        eventType: organizationApprovalEvents.eventType,
      })
      .from(organizationApprovalEvents)
      .where(where)
      .orderBy(organizationApprovalEvents.createdAt),
  ]);
  const trendMap = new Map<string, number>();
  trendSource.forEach(row => {
    const key = `${row.createdAt.toISOString().slice(0, 10)}::${row.eventType}`;
    trendMap.set(key, (trendMap.get(key) ?? 0) + 1);
  });
  const trends = Array.from(trendMap.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, count]) => {
      const [bucket, eventType] = key.split("::");
      return { bucket, eventType, count };
    });
  return {
    rows,
    total: Number(totalRows[0]?.count ?? 0),
    page,
    pageSize,
    totalPages: Math.max(
      1,
      Math.ceil(Number(totalRows[0]?.count ?? 0) / pageSize)
    ),
    trends,
  };
}

export async function reviewOrganizationInvitation(input: {
  id: number;
  actorOpenId: string;
  status: "approved" | "rejected";
  note?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const invitation = (
    await db
      .select()
      .from(organizationInvitations)
      .where(eq(organizationInvitations.id, input.id))
      .limit(1)
  )[0];
  if (!invitation) return undefined;
  const now = new Date();
  await db
    .update(organizationInvitations)
    .set({
      status: input.status,
      reviewedAt: now,
      reviewedByOpenId: input.actorOpenId,
      reviewNote: input.note?.trim() || null,
    })
    .where(
      and(
        eq(organizationInvitations.id, input.id),
        eq(organizationInvitations.status, "pending")
      )
    );
  await db
    .insert(organizationApprovalEvents)
    .values({
      invitationId: invitation.id,
      organizationName: invitation.organizationName,
      organizationEmail: invitation.organizationEmail,
      requesterOpenId: invitation.requesterOpenId,
      actorOpenId: input.actorOpenId,
      eventType: input.status,
      note: input.note?.trim() || null,
      createdAt: now,
    });
  return { ...invitation, status: input.status, reviewedAt: now };
}

export async function markOrganizationReminderSent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const now = new Date();
  await db
    .update(organizationInvitations)
    .set({ reminderSentAt: now })
    .where(
      and(
        eq(organizationInvitations.id, id),
        eq(organizationInvitations.status, "pending"),
        isNull(organizationInvitations.reminderSentAt),
        gte(organizationInvitations.expiresAt, now)
      )
    );
  return now;
}

export async function createOrganizationInvitation(input: {
  organizationName: string;
  organizationEmail: string;
  requesterOpenId: string;
  reportType: string;
  reportId: number;
  tokenHash: string;
  expiresAt: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db
    .insert(organizationInvitations)
    .values({
      organizationName: input.organizationName,
      organizationEmail: input.organizationEmail,
      requesterOpenId: input.requesterOpenId,
      reportType: input.reportType,
      reportId: input.reportId,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
      status: "pending",
    });
  return { id: Number(result[0].insertId), expiresAt: input.expiresAt };
}

export async function recordCourseDeliveryEvent(input: {
  userOpenId: string;
  enrollmentId: number;
  certificateId?: number | null;
  step: "email" | "organization" | "social";
  status: "pending" | "sent" | "delivered" | "failed" | "downloaded" | "shared";
  recipientEmail?: string | null;
  organizationName?: string | null;
  metadata?: Record<string, unknown> | null;
  errorMessage?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(courseDeliveryEvents).values(input);
  return (
    await db
      .select()
      .from(courseDeliveryEvents)
      .where(eq(courseDeliveryEvents.id, Number(result[0].insertId)))
      .limit(1)
  )[0];
}
export async function listCourseDeliveryEventsForUser(
  userOpenId: string,
  enrollmentId?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db
    .select()
    .from(courseDeliveryEvents)
    .where(
      enrollmentId
        ? and(
            eq(courseDeliveryEvents.userOpenId, userOpenId),
            eq(courseDeliveryEvents.enrollmentId, enrollmentId)
          )
        : eq(courseDeliveryEvents.userOpenId, userOpenId)
    )
    .orderBy(desc(courseDeliveryEvents.createdAt))
    .limit(200);
}
export async function listCourseDeliveryEventsForAdmin(input: {
  status?: string;
  step?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const conditions = [
    input.status && input.status !== "all"
      ? eq(courseDeliveryEvents.status, input.status)
      : undefined,
    input.step && input.step !== "all"
      ? eq(courseDeliveryEvents.step, input.step)
      : undefined,
    input.search?.trim()
      ? or(
          like(courseDeliveryEvents.recipientEmail, `%${input.search.trim()}%`),
          like(
            courseDeliveryEvents.organizationName,
            `%${input.search.trim()}%`
          )
        )
      : undefined,
  ].filter(Boolean) as Array<ReturnType<typeof eq>>;
  return db
    .select()
    .from(courseDeliveryEvents)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(courseDeliveryEvents.createdAt))
    .limit(Math.min(500, Math.max(1, input.limit ?? 100)))
    .offset(Math.max(0, input.offset ?? 0));
}

export async function updateCourseEnrollmentIdentity(
  userOpenId: string,
  enrollmentId: number,
  input: { name: string; email: string }
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const existing = (
    await db
      .select()
      .from(courseLearnerEnrollments)
      .where(
        and(
          eq(courseLearnerEnrollments.id, enrollmentId),
          eq(courseLearnerEnrollments.userOpenId, userOpenId)
        )
      )
      .limit(1)
  )[0];
  if (!existing) return undefined;
  await db
    .update(courseLearnerEnrollments)
    .set({
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      updatedAt: new Date(),
    })
    .where(eq(courseLearnerEnrollments.id, enrollmentId));
  return (
    await db
      .select()
      .from(courseLearnerEnrollments)
      .where(eq(courseLearnerEnrollments.id, enrollmentId))
      .limit(1)
  )[0];
}

export async function listUserCourseAchievements(userOpenId: string) {
  const state = await listCourseEnrollmentState(userOpenId);
  const badges: AchievementBadge[] = [];
  for (const record of state) {
    const course = courseCatalog.find(
      item => item.slug === record.enrollment.courseSlug
    );
    if (!course) continue;
    const moduleBadges = buildCourseModuleBadges({
      modules: course.modules,
      completedLessonIds: record.lessons.map(lesson => lesson.lessonId),
      passedQuizModuleIds: record.quizAttempts
        .filter(attempt => attempt.passed)
        .map(attempt => attempt.moduleId),
    });
    for (const badge of moduleBadges.filter(item => item.status === "earned")) {
      const lessonDates = record.lessons
        .filter(lesson =>
          course.modules[badge.moduleIndex]?.lessons.some(
            item => item.id === lesson.lessonId
          )
        )
        .map(lesson => new Date(lesson.completedAt).getTime());
      const quizDates = record.quizAttempts
        .filter(
          attempt => attempt.moduleId === badge.moduleId && attempt.passed
        )
        .map(attempt => new Date(attempt.createdAt).getTime());
      const earnedAt = Math.max(...lessonDates, ...quizDates, Date.now());
      const latestQuiz = record.quizAttempts.find(
        attempt => attempt.moduleId === badge.moduleId && attempt.passed
      );
      badges.push({
        id: `${record.enrollment.id}-${badge.moduleId}`,
        courseSlug: course.slug,
        courseTitle: course.title,
        moduleId: badge.moduleId,
        moduleIndex: badge.moduleIndex,
        moduleTitle: badge.title,
        completedLessons: badge.completedLessons,
        totalLessons: badge.totalLessons,
        quizScore: latestQuiz?.score ?? 0,
        earnedAt: new Date(earnedAt).toISOString(),
        certificateLabel: `Module ${badge.moduleIndex + 1} of ${course.modules.length}`,
      });
    }
  }
  return {
    badges: badges.sort((a, b) => b.earnedAt.localeCompare(a.earnedAt)),
    earnedBadges: badges.length,
    totalBadges: state.reduce(
      (total, record) =>
        total +
        (courseCatalog.find(item => item.slug === record.enrollment.courseSlug)
          ?.modules.length ?? 0),
      0
    ),
    completedCourses: state.filter(record => record.certificates.length > 0)
      .length,
  };
}

export async function listOptInAchievementLeaderboard() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const participants = await db
    .select({
      openId: users.openId,
      name: users.name,
      leaderboardDisplayName: users.leaderboardDisplayName,
    })
    .from(users)
    .where(eq(users.leaderboardOptIn, true))
    .limit(250);
  const rows: Array<Omit<AchievementLeaderboardRow, "rank">> = [];
  for (const participant of participants) {
    const achievement = await listUserCourseAchievements(participant.openId);
    rows.push({
      displayName: normalizeLeaderboardDisplayName(
        participant.leaderboardDisplayName,
        normalizeLeaderboardDisplayName(participant.name)
      ),
      earnedBadges: achievement.earnedBadges,
      completedCourses: achievement.completedCourses,
      totalBadges: achievement.totalBadges,
    });
  }
  return rankAchievementLeaderboard(rows);
}

export async function claimPsychometricReportEmail(
  id: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db
    .update(psychometricAttempts)
    .set({ reportEmailStatus: "sending" })
    .where(
      and(
        eq(psychometricAttempts.id, id),
        eq(psychometricAttempts.paymentStatus, "paid"),
        isNotNull(psychometricAttempts.report),
        eq(psychometricAttempts.reportEmailStatus, "pending")
      )
    );
  return Number(result[0].affectedRows ?? 0) > 0;
}

export async function markPsychometricReportEmailSent(
  id: number
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(psychometricAttempts)
    .set({ reportEmailStatus: "sent", reportEmailSentAt: new Date() })
    .where(
      and(
        eq(psychometricAttempts.id, id),
        eq(psychometricAttempts.reportEmailStatus, "sending")
      )
    );
}

export async function releasePsychometricReportEmailClaim(
  id: number
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(psychometricAttempts)
    .set({ reportEmailStatus: "pending" })
    .where(
      and(
        eq(psychometricAttempts.id, id),
        eq(psychometricAttempts.reportEmailStatus, "sending")
      )
    );
}

export async function markPsychometricReportEmailFailed(
  id: number
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(psychometricAttempts)
    .set({ reportEmailStatus: "failed" })
    .where(
      and(
        eq(psychometricAttempts.id, id),
        eq(psychometricAttempts.reportEmailStatus, "sending")
      )
    );
}

export async function listPsychometricAttemptsForAdmin(input: {
  paymentStatus?: string;
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [
    input.paymentStatus && input.paymentStatus !== "all"
      ? eq(psychometricAttempts.paymentStatus, input.paymentStatus)
      : undefined,
    input.from ? gte(psychometricAttempts.createdAt, input.from) : undefined,
    input.to ? lte(psychometricAttempts.createdAt, input.to) : undefined,
  ].filter(Boolean) as Array<ReturnType<typeof eq>>;
  return db
    .select({
      id: psychometricAttempts.id,
      testSlug: psychometricAttempts.testSlug,
      name: psychometricAttempts.name,
      email: psychometricAttempts.email,
      paystackReference: psychometricAttempts.paystackReference,
      paymentStatus: psychometricAttempts.paymentStatus,
      reportEmailStatus: psychometricAttempts.reportEmailStatus,
      reportEmailSentAt: psychometricAttempts.reportEmailSentAt,
      createdAt: psychometricAttempts.createdAt,
      paidAt: psychometricAttempts.paidAt,
      overallScore: sql<
        number | null
      >`JSON_EXTRACT(${psychometricAttempts.report}, '$.overallScore')`,
    })
    .from(psychometricAttempts)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(psychometricAttempts.createdAt))
    .limit(Math.min(100, Math.max(1, input.limit ?? 50)))
    .offset(Math.max(0, input.offset ?? 0));
}

export async function resetPsychometricReportEmail(
  id: number,
  email: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db
    .update(psychometricAttempts)
    .set({ reportEmailStatus: "pending", reportEmailSentAt: null })
    .where(
      and(
        eq(psychometricAttempts.id, id),
        eq(psychometricAttempts.email, email),
        eq(psychometricAttempts.paymentStatus, "paid"),
        isNotNull(psychometricAttempts.report)
      )
    );
  return Number(result[0].affectedRows ?? 0) > 0;
}

export async function getPsychometricAdminAnalytics(
  input: { from?: Date; to?: Date } = {}
) {
  const db = await getDb();
  if (!db)
    return {
      totals: {
        started: 0,
        paid: 0,
        pending: 0,
        sent: 0,
        sending: 0,
        failed: 0,
        conversionRate: 0,
        emailRate: 0,
      },
      byProfile: [],
      trend: [],
    };
  const conditions = [
    input.from ? gte(psychometricAttempts.createdAt, input.from) : undefined,
    input.to ? lte(psychometricAttempts.createdAt, input.to) : undefined,
  ].filter(Boolean) as Array<ReturnType<typeof gte>>;
  const rows = await db
    .select({
      testSlug: psychometricAttempts.testSlug,
      paymentStatus: psychometricAttempts.paymentStatus,
      reportEmailStatus: psychometricAttempts.reportEmailStatus,
      createdAt: psychometricAttempts.createdAt,
    })
    .from(psychometricAttempts)
    .where(conditions.length ? and(...conditions) : undefined);
  const profiles = new Map<
    string,
    { started: number; paid: number; sent: number; pending: number }
  >();
  const trend = new Map<
    string,
    { started: number; paid: number; sent: number }
  >();
  let paid = 0,
    sent = 0,
    sending = 0,
    failed = 0;
  for (const row of rows) {
    const profile = profiles.get(row.testSlug) ?? {
      started: 0,
      paid: 0,
      sent: 0,
      pending: 0,
    };
    profile.started += 1;
    if (row.paymentStatus === "paid") {
      paid += 1;
      profile.paid += 1;
    } else profile.pending += 1;
    if (row.reportEmailStatus === "sent") {
      sent += 1;
      profile.sent += 1;
    }
    if (row.reportEmailStatus === "sending") sending += 1;
    if (row.reportEmailStatus === "failed") failed += 1;
    profiles.set(row.testSlug, profile);
    const day = new Date(row.createdAt).toISOString().slice(0, 10);
    const point = trend.get(day) ?? { started: 0, paid: 0, sent: 0 };
    point.started += 1;
    if (row.paymentStatus === "paid") point.paid += 1;
    if (row.reportEmailStatus === "sent") point.sent += 1;
    trend.set(day, point);
  }
  const started = rows.length;
  return {
    totals: {
      started,
      paid,
      pending: started - paid,
      sent,
      sending,
      failed,
      conversionRate: started ? Math.round((paid / started) * 100) : 0,
      emailRate: paid ? Math.round((sent / paid) * 100) : 0,
    },
    byProfile: Array.from(profiles.entries()).map(([testSlug, value]) => ({
      testSlug,
      ...value,
      conversionRate: value.started
        ? Math.round((value.paid / value.started) * 100)
        : 0,
      emailRate: value.paid ? Math.round((value.sent / value.paid) * 100) : 0,
    })),
    trend: Array.from(trend.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ date, ...value })),
  };
}

export async function acknowledgePsychometricDeliveryFailure(input: {
  attemptId: number;
  adminOpenId: string;
  adminName: string;
  note?: string | null;
}): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db
    .update(psychometricAttempts)
    .set({
      deliveryAcknowledgedAt: new Date(),
      deliveryAcknowledgedByOpenId: input.adminOpenId,
      deliveryAcknowledgedByName: input.adminName,
      deliveryAcknowledgementNote: input.note?.trim() || null,
    })
    .where(
      and(
        eq(psychometricAttempts.id, input.attemptId),
        eq(psychometricAttempts.reportEmailStatus, "failed")
      )
    );
  return Number(result[0].affectedRows ?? 0) > 0;
}

export async function clearPsychometricDeliveryAcknowledgement(
  id: number
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(psychometricAttempts)
    .set({
      deliveryAcknowledgedAt: null,
      deliveryAcknowledgedByOpenId: null,
      deliveryAcknowledgedByName: null,
      deliveryAcknowledgementNote: null,
    })
    .where(eq(psychometricAttempts.id, id));
}

export async function listPsychometricFailedDeliveries(
  input: { limit?: number } = {}
) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: psychometricAttempts.id,
      testSlug: psychometricAttempts.testSlug,
      name: psychometricAttempts.name,
      email: psychometricAttempts.email,
      reportEmailStatus: psychometricAttempts.reportEmailStatus,
      createdAt: psychometricAttempts.createdAt,
      deliveryAcknowledgedAt: psychometricAttempts.deliveryAcknowledgedAt,
      deliveryAcknowledgedByOpenId:
        psychometricAttempts.deliveryAcknowledgedByOpenId,
      deliveryAcknowledgedByName:
        psychometricAttempts.deliveryAcknowledgedByName,
      deliveryAcknowledgementNote:
        psychometricAttempts.deliveryAcknowledgementNote,
    })
    .from(psychometricAttempts)
    .where(eq(psychometricAttempts.reportEmailStatus, "failed"))
    .orderBy(desc(psychometricAttempts.createdAt))
    .limit(Math.min(100, Math.max(1, input.limit ?? 50)));
}

export async function getPsychometricWeeklySchedule() {
  return getScheduledExport("weekly_psychometric_analytics");
}

export async function setPsychometricWeeklySchedulePaused(input: {
  paused: boolean;
  adminOpenId: string;
  adminName: string;
}) {
  return updateScheduledExport(
    "weekly_psychometric_analytics",
    input.paused
      ? {
          pausedAt: new Date(),
          pausedByOpenId: input.adminOpenId,
          pausedByName: input.adminName,
        }
      : { pausedAt: null, pausedByOpenId: null, pausedByName: null }
  );
}

export async function addPsychometricAcknowledgementLog(input: {
  attemptId: number;
  actorOpenId: string;
  actorName: string;
  note: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(psychometricDeliveryAcknowledgementLogs).values(input);
}

export async function listPsychometricAcknowledgementLogs(limit = 250) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(psychometricDeliveryAcknowledgementLogs)
    .orderBy(desc(psychometricDeliveryAcknowledgementLogs.createdAt))
    .limit(Math.min(500, Math.max(1, limit)));
}

export async function savePsychometricRecommendationFeedback(input: {
  userOpenId: string;
  testSlug: string;
  courseSlug: string;
  rating: number;
  goal?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .insert(psychometricRecommendationFeedback)
    .values(input)
    .onDuplicateKeyUpdate({
      set: {
        rating: input.rating,
        goal: input.goal ?? null,
        createdAt: new Date(),
      },
    });
  return true;
}

export async function updateUserExportPreferences(
  openId: string,
  preferences: {
    pageSize: "A4" | "LETTER";
    watermark: boolean;
    coverPage: boolean;
    coverTemplate: "classic" | "editorial" | "signal";
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(users)
    .set({ exportPreferences: preferences })
    .where(eq(users.openId, openId));
  return getUserProfile(openId);
}

export async function updateUserExportLogo(
  openId: string,
  exportLogoUrl: string | null
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(users).set({ exportLogoUrl }).where(eq(users.openId, openId));
  return getUserProfile(openId);
}

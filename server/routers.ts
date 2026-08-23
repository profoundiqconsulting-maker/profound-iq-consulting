import { COOKIE_NAME } from "@shared/const";
import { assessmentQuestions, ASSESSMENT_PRICE_KES, buildReport, buildRoleLens, type AssessmentReport, type RoleLens } from "../shared/assessment";
import { careerPathQuestions, CAREER_PATH_PRICE_KES, buildCareerPathReport, type CareerPathReport } from "../shared/careerPath";
import { parse as parseCookie } from "cookie";
import { getAssessmentAttempt, createAssessmentAttempt, createAssessmentDraft, getAssessmentDraft, markAssessmentDraftResumed, getAssessmentAttemptByReference, markAssessmentPaid, setPaystackReference, compareUserAssessmentReports, createReportShare, getActiveReportShare, revokeReportShare, listReportShares, listReportShareAuditEvents, createCareerPathAttempt, setCareerPathPaystackReference, getCareerPathAttemptByReference, markCareerPathPaid, listCareerPathAttemptsByEmail } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { addEmailPreviewDelivery, checkLoginRateLimit, clearLoginFailures, countFailedLoginEvents, createCourseEnrollment, createDeliveryLogExportJob, createUserSession, getAdminAnalyticsSettings, getAdminNotificationRecipients, getAdminSecuritySettings, getEffectiveLoginEventRetentionDays, getLoginSecurityAnalytics, purgeExpiredLoginEvents, getAdminUsersForReview, getAnalyticsDashboard, getAssessmentAdminOverview, getCourseEnrollments, getDeliveryLogExportJob, getDeliveryLogExportJobs, getEmailPreviewDeliveries, getEmailPreviewDeliveriesForExport, getEmailPreviewDeliveriesPage, getEmailTemplates, getEffectiveLoginAlertThreshold, getFailedLoginEvents, getScheduledExport, getScheduledExportRuns, getSessionByTokenHash, getUserAssessmentHistory, getUserProfile, getUserSessions, getLoginEventsForUser, getVerificationRevocationAudits, getVerificationRevocationAuditsForExport, getVerificationRevocationAuditsPage, recordAnalyticsEvent, recordFailedLogin, recordLoginEvent, revokeOtherUserSessions, revokeUserEmailVerification, revokeUserSession, saveAdminSecuritySettings, touchUserSession, updateUserAvatar, updateUserProfile, upsertAdminAnalyticsSettings, upsertEmailTemplate, updateScheduledExport, createScheduledExportIfMissing } from "./db";
import { storagePut } from "./storage";
import { z } from "zod";
import { renderAssessmentReportPdf, renderAssessmentScoreSummaryPdf, renderCareerPathReportPdf } from "./reportPdf";
import { validateEmailTemplateBody } from "../shared/emailTemplate";
import { buildCourseEnrollmentCsv } from "../shared/adminExport";
import { buildDeliveryLogCsv, type DeliveryLogFilters } from "../shared/adminDeliveryLog";
import { emailAssessmentReportIfNeeded, emailCareerPathReportIfNeeded, sendAssessmentResumeEmail, sendFailedLoginAlert, sendTemplateTestEmail } from "./email";
import { createHeartbeatJob } from "./_core/heartbeat";
import { WEEKLY_EXPORT_KEY } from "./scheduledEnrollmentExport";
import { DELIVERY_LOG_EXPORT_KEY } from "./deliveryLogExport";
import { randomUUID } from "node:crypto";
import { consumePasswordResetToken, createLocalUser, findUserByLocalIdentifier, setPasswordResetToken } from "./db";
import { identifierSchema, normalizeIdentifier, validatePassword } from "../shared/localAuth";
import { createResetToken, hashPassword, hashRateLimitKey, hashResetToken, verifyPassword } from "./localAuthCrypto";
import { sendPasswordResetEmail } from "./email";
import { buildVerificationAuditCsv, type AuditHistoryFilters } from "../shared/adminAudit";
import { getRequestSecurityMetadata, buildSecurityLogCsv } from "./securityMetadata";

const answersSchema = z.array(z.object({ questionId: z.string(), value: z.number().int().min(1).max(5) })).length(assessmentQuestions.length);
const careerPathAnswersSchema = z.array(z.object({ questionId: z.string(), value: z.number().int().min(1).max(5) })).length(careerPathQuestions.length);
const analyticsEventSchema = z.object({ eventName: z.enum(["assessment_started", "payment_completed", "report_downloaded", "course_enrollment_submitted"]), attemptId: z.number().int().positive().optional(), metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional() });

async function paystackRequest(path: string, init?: RequestInit) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Paystack is not configured." });
  const response = await fetch(`https://api.paystack.co${path}`, { ...init, headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  const payload = await response.json() as { status?: boolean; message?: string; data?: any };
  if (!response.ok || !payload.status) throw new TRPCError({ code: "BAD_GATEWAY", message: payload.message ?? "Paystack request failed." });
  return payload;
}

function requestSecurityMeta(req: import("express").Request) {
  return getRequestSecurityMetadata(req);
}

function getIdentifierType(value: string) {
  if (value.includes("@")) return "email";
  if (/^\\+?\\d/.test(value)) return "phone";
  return "username";
}

export const appRouter = router({
  system: systemRouter,
  sharedReport: router({
    get: publicProcedure.input(z.object({ token: z.string().min(32).max(128) })).query(async ({ input }) => {
      const result = await getActiveReportShare(input.token);
      if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "This report link is invalid, expired, or no longer available." });
      const report = result.attempt.report as AssessmentReport;
      const lens = result.share.lens === "teamDevelopment" ? "teamDevelopment" : "leadership";
      return { report, roleLens: buildRoleLens(report, lens), createdAt: result.attempt.createdAt, participantName: result.attempt.name, expiresAt: result.share.expiresAt };
    }),
  }),
  auth: router({
    register: publicProcedure.input(z.object({ name: z.string().trim().min(2).max(160), email: z.string().trim().email().optional(), phone: z.string().trim().min(7).max(32).optional(), username: z.string().trim().min(3).max(40).regex(/^[a-zA-Z0-9_.-]+$/).optional(), password: z.string().refine(validatePassword, "Password must be 10–128 characters and include letters and numbers.") }).refine((input) => Boolean(input.email || input.phone || input.username), "Provide an email, phone number, or username." )).mutation(async ({ ctx, input }) => {
      const identifiers = [input.email ? normalizeIdentifier(input.email) : null, input.phone ? normalizeIdentifier(input.phone) : null, input.username ? normalizeIdentifier(input.username) : null].filter((value): value is string => Boolean(value));
      const existing = await Promise.all(identifiers.map((identifier) => findUserByLocalIdentifier(identifier)));
      if (existing.some(Boolean)) throw new TRPCError({ code: "CONFLICT", message: "An account already exists with one of those identifiers." });
      let user;
      try { user = await createLocalUser({ openId: `local_${randomUUID()}`, name: input.name, email: input.email ? normalizeIdentifier(input.email) : null, phone: input.phone ? normalizeIdentifier(input.phone) : null, username: input.username ? normalizeIdentifier(input.username) : null, passwordHash: hashPassword(input.password) }); } catch (error) {
        const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
        if (message.includes("duplicate") || message.includes("unique") || message.includes("constraint")) throw new TRPCError({ code: "CONFLICT", message: "An account already exists with one of those identifiers." });
        throw error;
      }
      if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Unable to create the account." });
      const token = await sdk.createSessionToken(user.openId, { name: user.name ?? input.name });
      const meta = requestSecurityMeta(ctx.req);
      await createUserSession({ openId: user.openId, tokenHash: hashRateLimitKey(token), ...meta, trustedDevice: false, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });
      await recordLoginEvent({ openId: user.openId, identifierType: "registration", success: true, ...meta });
      ctx.res.cookie(COOKIE_NAME, token, getSessionCookieOptions(ctx.req));
      return { user: { id: user.id, name: user.name, email: user.email, phone: user.phone, username: user.username } };
    }),
    login: publicProcedure.input(z.object({ identifier: z.string().trim().min(3).max(320), password: z.string().min(1).max(128), trustDevice: z.boolean().default(false) })).mutation(async ({ ctx, input }) => {
      const identifier = normalizeIdentifier(input.identifier);
      if (!identifierSchema.test(input.identifier)) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid identifier or password." });
      const meta = requestSecurityMeta(ctx.req);
      const identifierKey = hashRateLimitKey(identifier);
      const networkKey = meta.networkHash;
      const rateKeys = [[identifierKey, networkKey], [identifierKey, "global"], ["global", networkKey]] as const;
      const rates = await Promise.all(rateKeys.map(([identifierHash, networkHash]) => checkLoginRateLimit(identifierHash, networkHash)));
      if (rates.some((rate) => rate.blocked)) { await recordLoginEvent({ identifierType: getIdentifierType(identifier), success: false, failureCode: "rate_limited", ...meta }); throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many failed attempts. Please try again later." }); }
      const user = await findUserByLocalIdentifier(identifier);
      if (!user?.passwordHash || !verifyPassword(input.password, user.passwordHash)) {
        const alertThreshold = await getEffectiveLoginAlertThreshold();
        const failures = await Promise.all(rateKeys.map(([identifierHash, networkHash]) => recordFailedLogin(identifierHash, networkHash, new Date(), alertThreshold)));
        await recordLoginEvent({ openId: user?.openId, identifierType: getIdentifierType(identifier), success: false, failureCode: "invalid_credentials", ...meta });
        const alertFailure = failures.find((failure) => failure.shouldAlert);
        if (alertFailure) { getAdminNotificationRecipients().then((recipients) => sendFailedLoginAlert({ recipients, identifier, failedCount: alertFailure.failedCount })).catch((error) => console.error("[Auth] Failed-login alert could not be sent", error)); }
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid identifier or password." });
      }
      await Promise.all(rateKeys.map(([identifierHash, networkHash]) => clearLoginFailures(identifierHash, networkHash)));
      const token = await sdk.createSessionToken(user.openId, { name: user.name ?? identifier });
      const sessionExpiry = new Date(Date.now() + (input.trustDevice ? 365 : 1) * 24 * 60 * 60 * 1000);
      await createUserSession({ openId: user.openId, tokenHash: hashRateLimitKey(token), ...meta, trustedDevice: input.trustDevice, trustExpiresAt: input.trustDevice ? sessionExpiry : null, expiresAt: sessionExpiry });
      await recordLoginEvent({ openId: user.openId, identifierType: getIdentifierType(identifier), success: true, ...meta });
      ctx.res.cookie(COOKIE_NAME, token, getSessionCookieOptions(ctx.req));
      return { user: { id: user.id, name: user.name, email: user.email, phone: user.phone, username: user.username } };
    }),
    requestPasswordReset: publicProcedure.input(z.object({ email: z.string().trim().email(), origin: z.string().url() })).mutation(async ({ input }) => {
      const user = await findUserByLocalIdentifier(normalizeIdentifier(input.email));
      if (user?.email && user.passwordHash) { const reset = createResetToken(); await setPasswordResetToken(user.openId, reset.hash, new Date(Date.now() + 30 * 60 * 1000)); const resetUrl = `${input.origin.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(reset.raw)}`; try { await sendPasswordResetEmail({ to: user.email, name: user.name ?? "there", resetUrl }); } catch (error) { console.error("[Auth] Password reset email failed", error); } }
      return { success: true, message: "If an account matches that email, a password-reset link will arrive shortly." } as const;
    }),
    resetPassword: publicProcedure.input(z.object({ token: z.string().min(32).max(128), password: z.string().refine(validatePassword, "Password must be 10–128 characters and include letters and numbers.") })).mutation(async ({ input }) => {
      const user = await consumePasswordResetToken(hashResetToken(input.token), hashPassword(input.password));
      if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "This password-reset link is invalid or expired." });
      return { success: true } as const;
    }),
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(async ({ ctx }) => {
      const sessionToken = parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? "";
      if (sessionToken && ctx.user) { const session = await getSessionByTokenHash(hashRateLimitKey(sessionToken)); if (session) await revokeUserSession(ctx.user.openId, session.id); }
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  profile: router({
    get: protectedProcedure.query(({ ctx }) => getUserProfile(ctx.user.openId)),
    loginHistory: protectedProcedure.input(z.object({ deviceType: z.enum(["all", "desktop", "mobile", "tablet", "unknown"]).default("all"), locationSearch: z.string().trim().max(80).optional() }).optional()).query(({ ctx, input }) => getLoginEventsForUser({ openId: ctx.user.openId, limit: 10, deviceType: input?.deviceType ?? "all", locationSearch: input?.locationSearch })),
    sessions: protectedProcedure.query(async ({ ctx }) => {
      const cookie = parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? "";
      const current = cookie ? await getSessionByTokenHash(hashRateLimitKey(cookie)) : undefined;
      return { sessions: await getUserSessions(ctx.user.openId), currentSessionId: current?.id ?? null };
    }),
    revokeSession: protectedProcedure.input(z.object({ sessionId: z.number().int().positive() })).mutation(async ({ ctx, input }) => { await revokeUserSession(ctx.user.openId, input.sessionId); return { success: true as const }; }),
    revokeCurrentSession: protectedProcedure.mutation(async ({ ctx }) => { const cookie = parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? ""; if (cookie) { const session = await getSessionByTokenHash(hashRateLimitKey(cookie)); if (session) await revokeUserSession(ctx.user.openId, session.id); } ctx.res.clearCookie(COOKIE_NAME, { ...getSessionCookieOptions(ctx.req), maxAge: -1 }); return { success: true as const }; }),
    revokeOtherSessions: protectedProcedure.mutation(async ({ ctx }) => { const cookie = parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? ""; if (!cookie) throw new TRPCError({ code: "UNAUTHORIZED", message: "Current session could not be identified." }); await revokeOtherUserSessions(ctx.user.openId, hashRateLimitKey(cookie)); return { success: true as const }; }),
    update: protectedProcedure.input(z.object({
      name: z.string().trim().min(2).max(160),
      timezone: z.string().regex(/^[A-Za-z_]+\/[A-Za-z_]+(?:\/[A-Za-z_]+)?$/, "Use an IANA timezone such as Africa/Nairobi."),
      notificationPreferences: z.object({ assessmentUpdates: z.boolean(), courseAnnouncements: z.boolean(), monthlyInsights: z.boolean() }),
    })).mutation(({ ctx, input }) => updateUserProfile(ctx.user.openId, input)),
    uploadAvatar: protectedProcedure.input(z.object({ dataUrl: z.string().regex(/^data:image\/(png|jpeg|webp);base64,/, "Only PNG, JPEG, or WebP images are supported.").max(2_800_000) })).mutation(async ({ ctx, input }) => {
      const match = input.dataUrl.match(/^data:(image\/(?:png|jpeg|webp));base64,(.+)$/);
      if (!match) throw new TRPCError({ code: "BAD_REQUEST", message: "Only PNG, JPEG, or WebP images are supported." });
      const contentType = match[1];
      const buffer = Buffer.from(match[2], "base64");
      if (buffer.length > 2 * 1024 * 1024) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Avatar must be 2MB or smaller." });
      const extension = contentType === "image/jpeg" ? "jpg" : contentType.split("/")[1];
      const uploaded = await storagePut(`avatars/${ctx.user.openId}.${extension}`, buffer, contentType);
      return updateUserAvatar(ctx.user.openId, uploaded.url);
    }),
  }),
  analytics: router({
    track: publicProcedure.input(analyticsEventSchema).mutation(async ({ ctx, input }) => {
      await recordAnalyticsEvent({ ...input, userOpenId: ctx.user?.openId });
      return { tracked: true as const };
    }),
  }),
  enrollment: router({
    create: publicProcedure.input(z.object({ courseTitle: z.string().trim().min(2).max(180), name: z.string().trim().min(2).max(160), email: z.string().email(), consent: z.literal(true) })).mutation(async ({ input }) => {
      const id = await createCourseEnrollment({ courseTitle: input.courseTitle, name: input.name, email: input.email });
      await recordAnalyticsEvent({ eventName: "course_enrollment_submitted", metadata: { courseTitle: input.courseTitle } });
      return { id };
    }),
  }),
  admin: router({
    scheduledExportStatus: adminProcedure.query(async () => ({ config: await getScheduledExport(WEEKLY_EXPORT_KEY), runs: await getScheduledExportRuns(WEEKLY_EXPORT_KEY) })),
    verificationRevocationAudits: adminProcedure.input(z.object({ page: z.number().int().min(1).default(1), pageSize: z.number().int().min(1).max(100).default(10), adminSearch: z.string().trim().max(160).optional(), fromDate: z.string().optional(), toDate: z.string().optional() }).optional()).query(({ input }) => getVerificationRevocationAuditsPage({ page: input?.page ?? 1, pageSize: input?.pageSize ?? 10, adminSearch: input?.adminSearch, fromDate: input?.fromDate ? new Date(`${input.fromDate}T00:00:00.000Z`) : undefined, toDate: input?.toDate ? new Date(`${input.toDate}T23:59:59.999Z`) : undefined })),
    exportVerificationRevocationAudits: adminProcedure.input(z.object({ adminSearch: z.string().trim().max(160).optional(), fromDate: z.string().optional(), toDate: z.string().optional() }).optional()).query(async ({ input }) => { const filters: AuditHistoryFilters = { adminSearch: input?.adminSearch, fromDate: input?.fromDate ? new Date(`${input.fromDate}T00:00:00.000Z`) : undefined, toDate: input?.toDate ? new Date(`${input.toDate}T23:59:59.999Z`) : undefined }; return { filename: `profound-iq-verification-audit-${new Date().toISOString().slice(0, 10)}.csv`, contentType: "text/csv;charset=utf-8", data: buildVerificationAuditCsv(await getVerificationRevocationAuditsForExport(filters)) }; }),
    deliveryLogExportJobs: adminProcedure.query(() => getDeliveryLogExportJobs(20)),
    deliveryLogExportJob: adminProcedure.input(z.object({ id: z.number().int().positive() })).query(({ input }) => getDeliveryLogExportJob(input.id)),
    queueDeliveryLogExport: adminProcedure.input(z.object({ search: z.string().trim().max(160).optional(), status: z.enum(["all", "sent", "failed"]).default("all"), fromDate: z.string().optional(), toDate: z.string().optional() })).mutation(({ ctx, input }) => createDeliveryLogExportJob(ctx.user.openId, input)),
    enableDeliveryLogExportWorker: adminProcedure.mutation(async ({ ctx }) => { const existing = await createScheduledExportIfMissing(DELIVERY_LOG_EXPORT_KEY); if (existing?.scheduleTaskUid) return { taskUid: existing.scheduleTaskUid, alreadyEnabled: true }; const sessionToken = parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? ""; if (!sessionToken) throw new TRPCError({ code: "UNAUTHORIZED", message: "A valid admin session is required to enable background processing." }); const job = await createHeartbeatJob({ name: "delivery-log-export-worker", cron: "0 * * * * *", path: "/api/scheduled/deliveryLogExportWorker", description: "Process one queued delivery-log CSV export each minute." }, sessionToken); await updateScheduledExport(DELIVERY_LOG_EXPORT_KEY, { scheduleTaskUid: job.taskUid }); return { taskUid: job.taskUid, alreadyEnabled: false }; }),
    analyticsSettings: adminProcedure.query(({ ctx }) => getAdminAnalyticsSettings(ctx.user.openId)),
    saveAnalyticsSettings: adminProcedure.input(z.object({ paidBenchmark: z.number().int().min(0).max(100), downloadBenchmark: z.number().int().min(0).max(100) })).mutation(({ ctx, input }) => upsertAdminAnalyticsSettings(ctx.user.openId, input)),
    emailPreviewHistory: adminProcedure.input(z.object({ page: z.number().int().min(1).default(1), pageSize: z.number().int().min(1).max(100).default(12), search: z.string().trim().max(160).optional(), status: z.enum(["all", "sent", "failed"]).default("all"), fromDate: z.string().optional(), toDate: z.string().optional() }).optional()).query(({ input }) => getEmailPreviewDeliveriesPage({ page: input?.page ?? 1, pageSize: input?.pageSize ?? 12, search: input?.search, status: input?.status ?? "all", fromDate: input?.fromDate ? new Date(`${input.fromDate}T00:00:00.000Z`) : undefined, toDate: input?.toDate ? new Date(`${input.toDate}T23:59:59.999Z`) : undefined })),
    exportEmailPreviewHistory: adminProcedure.input(z.object({ search: z.string().trim().max(160).optional(), status: z.enum(["all", "sent", "failed"]).default("all"), fromDate: z.string().optional(), toDate: z.string().optional() }).optional()).query(async ({ input }) => { const filters: DeliveryLogFilters = { search: input?.search, status: input?.status ?? "all", fromDate: input?.fromDate ? new Date(`${input.fromDate}T00:00:00.000Z`) : undefined, toDate: input?.toDate ? new Date(`${input.toDate}T23:59:59.999Z`) : undefined }; return { filename: `profound-iq-delivery-log-${new Date().toISOString().slice(0, 10)}.csv`, contentType: "text/csv;charset=utf-8", data: buildDeliveryLogCsv(await getEmailPreviewDeliveriesForExport(filters)) }; }),
    userVerificationReview: adminProcedure.input(z.object({ page: z.number().int().min(1).default(1), pageSize: z.number().int().min(1).max(100).default(20), search: z.string().trim().max(160).optional(), verification: z.enum(["all", "verified", "unverified"]).default("all") }).optional()).query(({ input }) => getAdminUsersForReview({ page: input?.page ?? 1, pageSize: input?.pageSize ?? 20, search: input?.search, verification: input?.verification ?? "all" })),
    revokeUserEmailVerification: adminProcedure.input(z.object({ openId: z.string().min(1).max(64), reason: z.string().trim().min(5).max(1000) })).mutation(async ({ ctx, input }) => { if (ctx.user.openId === input.openId) throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot revoke verification for your own active admin account." }); const user = await revokeUserEmailVerification(input.openId, { openId: ctx.user.openId, name: ctx.user.name, email: ctx.user.email }, input.reason); if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found." }); return { openId: user.openId, emailVerifiedAt: user.emailVerifiedAt }; }),
    retryTemplateTestEmail: adminProcedure.input(z.object({ deliveryId: z.number().int().positive() })).mutation(async ({ ctx, input }) => { if (!ctx.user.email) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Your admin account needs a verified email address." }); const history = await getEmailPreviewDeliveries(100); const delivery = history.find((item) => item.id === input.deliveryId); if (!delivery || delivery.status !== "failed") throw new TRPCError({ code: "NOT_FOUND", message: "Failed preview delivery not found." }); try { await sendTemplateTestEmail({ to: ctx.user.email, subject: delivery.subject, body: delivery.body ?? `Hello {{name}},\n\nThis is a retry of your ${delivery.templateKey} preview.` }); await addEmailPreviewDelivery({ templateKey: delivery.templateKey, recipientEmail: ctx.user.email, subject: delivery.subject, body: delivery.body, status: "sent" }); return { sentTo: ctx.user.email }; } catch (error) { await addEmailPreviewDelivery({ templateKey: delivery.templateKey, recipientEmail: ctx.user.email, subject: delivery.subject, body: delivery.body, status: "failed", errorMessage: error instanceof Error ? error.message.slice(0, 500) : "Delivery failed" }); throw error; } }),
    analyticsSummary: adminProcedure.input(z.object({ fromDate: z.string().optional(), toDate: z.string().optional() }).optional()).query(({ input }) => getAnalyticsDashboard({ fromDate: input?.fromDate ? new Date(`${input.fromDate}T00:00:00.000Z`) : undefined, toDate: input?.toDate ? new Date(`${input.toDate}T23:59:59.999Z`) : undefined })),
    emailTemplates: adminProcedure.query(() => getEmailTemplates()),
    sendTemplateTestEmail: adminProcedure.input(z.object({ templateKey: z.enum(["assessment_report", "course_enrollment"]), subject: z.string().trim().min(2).max(240), body: z.string().trim().min(2).max(10000) })).mutation(async ({ ctx, input }) => { if (!ctx.user.email) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Your admin account needs a verified email address." }); const unsupported = validateEmailTemplateBody(input.body); if (unsupported.length) throw new TRPCError({ code: "BAD_REQUEST", message: `Unsupported template token: ${unsupported.join(", ")}.` }); try { await sendTemplateTestEmail({ to: ctx.user.email, subject: input.subject, body: input.body }); await addEmailPreviewDelivery({ templateKey: input.templateKey, recipientEmail: ctx.user.email, subject: input.subject, body: input.body, status: "sent" }); return { sentTo: ctx.user.email }; } catch (error) { await addEmailPreviewDelivery({ templateKey: input.templateKey, recipientEmail: ctx.user.email, subject: input.subject, body: input.body, status: "failed", errorMessage: error instanceof Error ? error.message.slice(0, 500) : "Delivery failed" }); throw error; } }),
    updateExportRetention: adminProcedure.input(z.object({ retentionDays: z.number().int().min(30).max(365) })).mutation(async ({ input }) => { await createScheduledExportIfMissing(WEEKLY_EXPORT_KEY); return updateScheduledExport(WEEKLY_EXPORT_KEY, { retentionDays: input.retentionDays }); }),
    enableWeeklyExport: adminProcedure.mutation(async ({ ctx }) => { const existing = await createScheduledExportIfMissing(WEEKLY_EXPORT_KEY); if (existing?.scheduleTaskUid) return { taskUid: existing.scheduleTaskUid, alreadyEnabled: true }; const sessionToken = parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? ""; if (!sessionToken) throw new TRPCError({ code: "UNAUTHORIZED", message: "A valid admin session is required to enable scheduling." }); const job = await createHeartbeatJob({ name: "weekly-course-enrollment-export", cron: "0 0 9 * * 1", path: "/api/scheduled/weeklyEnrollmentExport", description: "Generate and store the weekly course enrollment CSV export." }, sessionToken); await updateScheduledExport(WEEKLY_EXPORT_KEY, { scheduleTaskUid: job.taskUid }); return { taskUid: job.taskUid, alreadyEnabled: false }; }),

    saveEmailTemplate: adminProcedure.input(z.object({ templateKey: z.enum(["assessment_report", "course_enrollment"]), label: z.string().trim().min(2).max(160), subject: z.string().trim().min(2).max(240), body: z.string().trim().min(2).max(10000) })).mutation(({ ctx, input }) => { const unsupported = validateEmailTemplateBody(input.body); if (unsupported.length) throw new TRPCError({ code: "BAD_REQUEST", message: `Unsupported template token: ${unsupported.join(", ")}. Use only {{name}}, {{email}}, {{date}}, and {{course}}.` }); return upsertEmailTemplate({ ...input, updatedByOpenId: ctx.user.openId }); }),
    securitySettings: adminProcedure.query(({ ctx }) => getAdminSecuritySettings(ctx.user.openId)),
    saveSecuritySettings: adminProcedure.input(z.object({ alertThreshold: z.number().int().min(3).max(20), reviewWindowDays: z.number().int().min(1).max(90), loginEventRetentionDays: z.number().int().min(30).max(365) })).mutation(({ ctx, input }) => saveAdminSecuritySettings(ctx.user.openId, input)),
    failedLoginEvents: adminProcedure.input(z.object({ fromDate: z.string().optional(), toDate: z.string().optional(), page: z.number().int().min(1).default(1), pageSize: z.number().int().min(5).max(50).default(20) }).optional()).query(async ({ ctx, input }) => { const page = input?.page ?? 1; const pageSize = input?.pageSize ?? 20; const retentionDays = await getEffectiveLoginEventRetentionDays(ctx.user.openId); await purgeExpiredLoginEvents(retentionDays); const from = input?.fromDate ? new Date(`${input.fromDate}T00:00:00.000Z`) : undefined; const to = input?.toDate ? new Date(`${input.toDate}T23:59:59.999Z`) : undefined; const [rows, total] = await Promise.all([getFailedLoginEvents({ from, to, limit: pageSize, offset: (page - 1) * pageSize }), countFailedLoginEvents({ from, to })]); return { rows, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)), retentionDays }; }),
    loginSecurityAnalytics: adminProcedure.input(z.object({ fromDate: z.string().optional(), toDate: z.string().optional(), granularity: z.enum(["daily", "weekly"]).default("weekly") }).optional()).query(async ({ ctx, input }) => { const retentionDays = await getEffectiveLoginEventRetentionDays(ctx.user.openId); await purgeExpiredLoginEvents(retentionDays); return getLoginSecurityAnalytics({ from: input?.fromDate ? new Date(`${input.fromDate}T00:00:00.000Z`) : undefined, to: input?.toDate ? new Date(`${input.toDate}T23:59:59.999Z`) : undefined, granularity: input?.granularity ?? "weekly" }); }),
    exportSecurityLoginEvents: adminProcedure.input(z.object({ fromDate: z.string().optional(), toDate: z.string().optional() }).optional()).query(async ({ ctx, input }) => { const retentionDays = await getEffectiveLoginEventRetentionDays(ctx.user.openId); await purgeExpiredLoginEvents(retentionDays); const from = input?.fromDate ? new Date(`${input.fromDate}T00:00:00.000Z`) : undefined; const to = input?.toDate ? new Date(`${input.toDate}T23:59:59.999Z`) : undefined; const rows = await getFailedLoginEvents({ from, to, limit: 50_000, offset: 0 }); return { filename: `profound-iq-security-log-${new Date().toISOString().slice(0, 10)}.csv`, contentType: "text/csv;charset=utf-8", retentionDays, data: buildSecurityLogCsv(rows) }; }),
    exportCourseEnrollments: adminProcedure.input(z.object({ fromDate: z.string().optional(), toDate: z.string().optional(), status: z.enum(["all", "new", "contacted", "enrolled"]).default("all") }).optional()).query(async ({ input }) => {
      const rows = await getCourseEnrollments({ fromDate: input?.fromDate ? new Date(`${input.fromDate}T00:00:00.000Z`) : undefined, toDate: input?.toDate ? new Date(`${input.toDate}T23:59:59.999Z`) : undefined, status: input?.status && input.status !== "all" ? input.status : undefined });
      return { filename: `profound-iq-course-enrollments-${new Date().toISOString().slice(0, 10)}.csv`, contentType: "text/csv;charset=utf-8", data: buildCourseEnrollmentCsv(rows) };
    }),
  }),
  dashboard: router({
    mine: protectedProcedure.query(({ ctx }) => {
      if (!ctx.user.email) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A verified account email is required." });
      return getUserAssessmentHistory(ctx.user.email);
    }),
    compareReports: protectedProcedure.input(z.object({ currentAttemptId: z.number().int().positive(), previousAttemptId: z.number().int().positive() })).query(async ({ ctx, input }) => {
      if (!ctx.user.email) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A verified account email is required." });
      const result = await compareUserAssessmentReports(ctx.user.email, input.currentAttemptId, input.previousAttemptId);
      if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "Both paid report versions could not be found for this account." });
      return result;
    }),
    createShareLink: protectedProcedure.input(z.object({ attemptId: z.number().int().positive(), expiresInDays: z.union([z.literal(1), z.literal(7), z.literal(30)]).default(7), consent: z.literal(true), lens: z.enum(["leadership", "teamDevelopment"]).default("leadership"), recipientPurpose: z.enum(["coaching", "manager"]).optional() })).mutation(async ({ ctx, input }) => {
      if (!ctx.user.email) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A verified account email is required." });
      const attempt = await getAssessmentAttempt(input.attemptId);
      if (!attempt || attempt.email !== ctx.user.email) throw new TRPCError({ code: "NOT_FOUND", message: "Assessment report not found." });
      if (attempt.paymentStatus !== "paid" || !attempt.report) throw new TRPCError({ code: "FORBIDDEN", message: "A verified paid report is required to create a share link." });
      const expiresAt = new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000);
      const token = await createReportShare({ attemptId: attempt.id, ownerOpenId: ctx.user.openId, lens: input.lens, recipientPurpose: input.recipientPurpose, expiresAt });
      return { token, expiresAt, lens: input.lens };
    }),
    reportShares: protectedProcedure.input(z.object({ attemptId: z.number().int().positive().optional() }).optional()).query(({ ctx, input }) => listReportShares(ctx.user.openId, input?.attemptId)),
    reportShareAudit: protectedProcedure.input(z.object({ attemptId: z.number().int().positive().optional(), eventType: z.enum(["consented", "created", "revoked"]).optional() }).optional()).query(({ ctx, input }) => listReportShareAuditEvents(ctx.user.openId, input)),
    exportShareAudit: protectedProcedure.input(z.object({ attemptId: z.number().int().positive().optional(), eventType: z.enum(["consented", "created", "revoked"]).optional() }).optional()).query(async ({ ctx, input }) => {
      const rows = await listReportShareAuditEvents(ctx.user.openId, input);
      const escapeCsv = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
      const csv = ["event,report_version,purpose,occurred_at", ...rows.map((row) => [row.eventType, `v${row.attemptId}`, row.recipientPurpose ?? "", new Date(row.createdAt).toISOString()].map(escapeCsv).join(","))].join("\n");
      return { filename: "profound-iq-share-audit.csv", csv };
    }),
    revokeShareLink: protectedProcedure.input(z.object({ shareId: z.number().int().positive() })).mutation(({ ctx, input }) => revokeReportShare(ctx.user.openId, input.shareId).then(() => ({ revoked: true as const }))),
    resendReportEmail: protectedProcedure.input(z.object({ attemptId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      if (!ctx.user.email) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A verified account email is required." });
      const attempt = await getAssessmentAttempt(input.attemptId);
      if (!attempt || attempt.email !== ctx.user.email) throw new TRPCError({ code: "NOT_FOUND", message: "Assessment report not found." });
      if (attempt.paymentStatus !== "paid" || !attempt.report) throw new TRPCError({ code: "FORBIDDEN", message: "A verified payment is required to resend this report." });
      if (attempt.reportEmailStatus === "sent") throw new TRPCError({ code: "CONFLICT", message: "This report email has already been sent." });
      const sent = await emailAssessmentReportIfNeeded({ attemptId: attempt.id, participantName: attempt.name, email: attempt.email, createdAt: attempt.createdAt, report: attempt.report as AssessmentReport, reportEmailStatus: attempt.reportEmailStatus, reportEmailSentAt: attempt.reportEmailSentAt });
      if (!sent) throw new TRPCError({ code: "CONFLICT", message: "This report email is already being prepared. Please try again shortly." });
      return { sent: true as const };
    }),
    downloadScoreSummary: protectedProcedure.mutation(async ({ ctx }) => {
      if (!ctx.user.email) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A verified account email is required." });
      const attempts = await getUserAssessmentHistory(ctx.user.email);
      const paidReports = attempts.filter((attempt) => attempt.paymentStatus === "paid" && attempt.report).map((attempt) => { const report = attempt.report as AssessmentReport; return { version: attempt.version, createdAt: attempt.createdAt, overallScore: report.overallScore, overallBand: report.overallBand, dimensionScores: report.dimensions.map((dimension) => ({ label: dimension.label, score: dimension.score })) }; });
      const pdf = await renderAssessmentScoreSummaryPdf({ participantName: ctx.user.name ?? "Profound IQ learner", createdAt: new Date(), reports: paidReports });
      return { filename: `profound-iq-score-summary-${new Date().toISOString().slice(0, 10)}.pdf`, contentType: "application/pdf", data: pdf.toString("base64") };
    }),
    downloadReport: protectedProcedure.input(z.object({ attemptId: z.number().int().positive(), lens: z.enum(["leadership", "careerTransition", "teamDevelopment"]).default("leadership") })).mutation(async ({ ctx, input }) => {
      if (!ctx.user.email) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A verified account email is required." });
      const attempt = await getAssessmentAttempt(input.attemptId);
      if (!attempt || attempt.email !== ctx.user.email) throw new TRPCError({ code: "NOT_FOUND", message: "Assessment report not found." });
      if (attempt.paymentStatus !== "paid" || !attempt.report) throw new TRPCError({ code: "FORBIDDEN", message: "A verified payment is required to download this report." });
      const report = attempt.report as import("../shared/assessment").AssessmentReport;
      const pdf = await renderAssessmentReportPdf({ attemptId: attempt.id, participantName: attempt.name, createdAt: attempt.createdAt, report, lens: buildRoleLens(report, input.lens as RoleLens) });
      await recordAnalyticsEvent({ eventName: "report_downloaded", attemptId: attempt.id, userOpenId: ctx.user.openId });
      return { filename: `profound-iq-assessment-${attempt.id}.pdf`, contentType: "application/pdf", data: pdf.toString("base64") };
    }),
  }),
  careerPath: router({
    questions: publicProcedure.query(() => ({ questions: careerPathQuestions, modules: [{ name: "Career interests", items: 32 }, { name: "Aptitude and cognitive preferences", items: 28 }, { name: "Learning and work style", items: 20 }, { name: "Personality and behavioural tendencies", items: 24 }, { name: "Skills and competencies", items: 24 }, { name: "Values and motivators", items: 20 }, { name: "Creativity, talent and innovation", items: 16 }, { name: "Career aspirations and exposure", items: 8 }, { name: "Situational career judgement", items: 8 }], priceKes: CAREER_PATH_PRICE_KES, estimatedMinutes: "35–45" })),
    initializePayment: publicProcedure.input(z.object({ name: z.string().trim().min(2).max(160), email: z.string().email(), answers: careerPathAnswersSchema, consent: z.literal(true), personalNotes: z.string().trim().max(1000).optional().default(""), receiptTitle: z.string().trim().max(160).optional().default("") })).mutation(async ({ input, ctx }) => {
      const attemptId = await createCareerPathAttempt({ name: input.name, email: input.email, answers: input.answers, personalNotes: input.personalNotes || null, receiptTitle: input.receiptTitle || null });
      const reference = `piq-career-${Date.now()}-${randomUUID().replace(/-/g, "").slice(0, 12)}`;
      await setCareerPathPaystackReference(attemptId, reference);
      const originHeader = ctx.req.headers.origin;
      const origin = typeof originHeader === "string" ? originHeader : "https://profoundiqconsulting.com";
      const payment = await paystackRequest("/transaction/initialize", { method: "POST", body: JSON.stringify({ amount: CAREER_PATH_PRICE_KES * 100, currency: "KES", email: input.email, reference, callback_url: `${origin}/careerpath?payment=success&reference=${reference}`, metadata: JSON.stringify({ attemptId, assessment: "profound-iq-careerpath-talent-fit" }) }) });
      await recordAnalyticsEvent({ eventName: "assessment_started", attemptId, metadata: { product: "careerpath", priceKes: CAREER_PATH_PRICE_KES } });
      return { authorizationUrl: payment.data.authorization_url as string, reference, attemptId };
    }),
    verifyPayment: publicProcedure.input(z.object({ reference: z.string().min(10).max(120) })).mutation(async ({ input }) => {
      const attempt = await getCareerPathAttemptByReference(input.reference);
      if (!attempt) throw new TRPCError({ code: "NOT_FOUND", message: "CareerPath attempt not found." });
      if (attempt.paymentStatus === "paid" && attempt.report) {
        let emailSent = false;
        try { emailSent = await emailCareerPathReportIfNeeded({ attemptId: attempt.id, participantName: attempt.name, email: attempt.email, createdAt: attempt.createdAt, report: attempt.report as CareerPathReport, personalNotes: attempt.personalNotes, receiptTitle: attempt.receiptTitle, reportEmailStatus: attempt.reportEmailStatus, reportEmailSentAt: attempt.reportEmailSentAt }); } catch (error) { console.error("[CareerPath] Report email delivery retry failed:", error); }
        return { report: attempt.report as CareerPathReport, reference: input.reference, emailSent };
      }
      const verification = await paystackRequest(`/transaction/verify/${encodeURIComponent(input.reference)}`);
      const transaction = verification.data;
      if (transaction.reference !== input.reference || transaction.status !== "success" || transaction.amount !== CAREER_PATH_PRICE_KES * 100 || transaction.currency !== "KES") throw new TRPCError({ code: "PAYMENT_REQUIRED", message: "CareerPath payment could not be verified." });
      const report = buildCareerPathReport(attempt.answers as Array<{ questionId: string; value: number }>);
      await markCareerPathPaid(attempt.id, report);
      await recordAnalyticsEvent({ eventName: "payment_completed", attemptId: attempt.id, metadata: { product: "careerpath", currency: "KES", amount: CAREER_PATH_PRICE_KES } });
      let emailSent = false;
      try { emailSent = await emailCareerPathReportIfNeeded({ attemptId: attempt.id, participantName: attempt.name, email: attempt.email, createdAt: attempt.createdAt, report, personalNotes: attempt.personalNotes, receiptTitle: attempt.receiptTitle }); } catch (error) { console.error("[CareerPath] Report email delivery failed:", error); }
      return { report, reference: input.reference, emailSent };
    }),
    history: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user.email) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A verified account email is required." });
      return listCareerPathAttemptsByEmail(ctx.user.email);
    }),
    downloadReport: publicProcedure.input(z.object({ reference: z.string().min(10).max(120) })).mutation(async ({ input }) => {
      const attempt = await getCareerPathAttemptByReference(input.reference);
      if (!attempt || attempt.paymentStatus !== "paid" || !attempt.report) throw new TRPCError({ code: "FORBIDDEN", message: "A verified CareerPath payment is required to download this report." });
      const pdf = await renderCareerPathReportPdf({ attemptId: attempt.id, participantName: attempt.name, createdAt: attempt.createdAt, report: attempt.report as CareerPathReport });
      return { filename: `profound-iq-careerpath-${attempt.id}.pdf`, contentType: "application/pdf", data: pdf.toString("base64") };
    }),
    getReport: publicProcedure.input(z.object({ reference: z.string().min(10).max(120) })).query(async ({ input }) => {
      const attempt = await getCareerPathAttemptByReference(input.reference);
      if (!attempt || attempt.paymentStatus !== "paid" || !attempt.report) throw new TRPCError({ code: "FORBIDDEN", message: "A verified CareerPath payment is required to view this report." });
      return { report: attempt.report as CareerPathReport, reference: input.reference, participantName: attempt.name, createdAt: attempt.createdAt };
    }),
  }),
  assessment: router({
    adminOverview: adminProcedure.query(() => getAssessmentAdminOverview()),
    saveDraft: publicProcedure.input(z.object({ name: z.string().trim().min(2).max(160), email: z.string().email(), answers: z.array(z.object({ questionId: z.string(), value: z.number().int().min(1).max(5) })).max(assessmentQuestions.length), currentModule: z.number().int().min(0).max(assessmentQuestions.length - 1), origin: z.string().url() })).mutation(async ({ input }) => {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const draft = await createAssessmentDraft({ name: input.name, email: input.email, answers: input.answers, currentModule: input.currentModule, expiresAt });
      const resumeUrl = `${input.origin.replace(/\/$/, "")}/assessment?resume=${encodeURIComponent(draft.token)}`;
      await sendAssessmentResumeEmail({ to: input.email, name: input.name, resumeUrl, expiresAt });
      return { sent: true as const, expiresAt, resumeUrl };
    }),
    resendDraft: publicProcedure.input(z.object({ name: z.string().trim().min(2).max(160), email: z.string().email(), answers: z.array(z.object({ questionId: z.string(), value: z.number().int().min(1).max(5) })).max(assessmentQuestions.length), currentModule: z.number().int().min(0).max(assessmentQuestions.length - 1), origin: z.string().url() })).mutation(async ({ input }) => {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const draft = await createAssessmentDraft({ name: input.name, email: input.email, answers: input.answers, currentModule: input.currentModule, expiresAt });
      const resumeUrl = `${input.origin.replace(/\/$/, "")}/assessment?resume=${encodeURIComponent(draft.token)}`;
      await sendAssessmentResumeEmail({ to: input.email, name: input.name, resumeUrl, expiresAt });
      return { sent: true as const, expiresAt, resumeUrl };
    }),
    resumeDraft: publicProcedure.input(z.object({ token: z.string().min(32).max(128) })).query(async ({ input }) => {
      const draft = await getAssessmentDraft(input.token);
      if (!draft) throw new TRPCError({ code: "NOT_FOUND", message: "This resume link is invalid or expired." });
      await markAssessmentDraftResumed(draft.id);
      return { name: draft.name, email: draft.email, answers: draft.answers, currentModule: draft.currentModule, expiresAt: draft.expiresAt };
    }),
    questions: publicProcedure.query(() => ({ questions: assessmentQuestions, priceKes: ASSESSMENT_PRICE_KES })),
    initializePayment: publicProcedure.input(z.object({ name: z.string().trim().min(2).max(160), email: z.string().email(), answers: answersSchema, consent: z.literal(true) })).mutation(async ({ input, ctx }) => {
      const attemptId = await createAssessmentAttempt({ name: input.name, email: input.email, answers: input.answers });
      const reference = `piq-${Date.now()}-${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
      await setPaystackReference(attemptId, reference);
      const originHeader = ctx.req.headers.origin;
      const origin = typeof originHeader === "string" ? originHeader : "https://profoundiqconsulting.com";
      const payment = await paystackRequest("/transaction/initialize", { method: "POST", body: JSON.stringify({ amount: ASSESSMENT_PRICE_KES * 100, currency: "KES", email: input.email, reference, callback_url: `${origin}/assessment?payment=success&reference=${reference}`, metadata: JSON.stringify({ attemptId, assessment: "profound-iq-self-assessment" }) }) });
      return { authorizationUrl: payment.data.authorization_url as string, reference, attemptId };
    }),
    verifyPayment: publicProcedure.input(z.object({ reference: z.string().min(10).max(120) })).mutation(async ({ input }) => {
      const attempt = await getAssessmentAttemptByReference(input.reference);
      if (!attempt) throw new TRPCError({ code: "NOT_FOUND", message: "Assessment attempt not found." });
      if (attempt.paymentStatus === "paid" && attempt.report) {
        let emailSent = false;
        try {
          emailSent = await emailAssessmentReportIfNeeded({ attemptId: attempt.id, participantName: attempt.name, email: attempt.email, createdAt: attempt.createdAt, report: attempt.report as AssessmentReport, reportEmailStatus: attempt.reportEmailStatus, reportEmailSentAt: attempt.reportEmailSentAt });
        } catch (error) {
          console.error("[Assessment] Report email delivery retry failed:", error);
        }
        return { report: attempt.report, reference: input.reference, emailSent };
      }
      const verification = await paystackRequest(`/transaction/verify/${encodeURIComponent(input.reference)}`);
      const transaction = verification.data;
      if (transaction.reference !== input.reference || transaction.status !== "success" || transaction.amount !== ASSESSMENT_PRICE_KES * 100 || transaction.currency !== "KES") throw new TRPCError({ code: "PAYMENT_REQUIRED", message: "Payment could not be verified." });
      const report = buildReport(attempt.answers as Array<{ questionId: string; value: number }>);
      await markAssessmentPaid(attempt.id, report);
      await recordAnalyticsEvent({ eventName: "payment_completed", attemptId: attempt.id, metadata: { currency: "KES", amount: ASSESSMENT_PRICE_KES } });
      let emailSent = false;
      try {
        emailSent = await emailAssessmentReportIfNeeded({ attemptId: attempt.id, participantName: attempt.name, email: attempt.email, createdAt: attempt.createdAt, report, reportEmailSentAt: attempt.reportEmailSentAt });
      } catch (error) {
        console.error("[Assessment] Report email delivery failed:", error);
      }
      return { report, reference: input.reference, emailSent };
    }),
    getReport: publicProcedure.input(z.object({ reference: z.string().min(10).max(120) })).query(async ({ input }) => {
      const attempt = await getAssessmentAttemptByReference(input.reference);
      if (!attempt || attempt.paymentStatus !== "paid" || !attempt.report) throw new TRPCError({ code: "FORBIDDEN", message: "A verified payment is required to view this report." });
      return { report: attempt.report, reference: input.reference };
    }),
  }),
});

export type AppRouter = typeof appRouter;

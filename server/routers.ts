import { COOKIE_NAME } from "@shared/const";
import { assessmentQuestions, ASSESSMENT_PRICE_KES, buildReport, type AssessmentReport } from "../shared/assessment";
import { getAssessmentAttempt, createAssessmentAttempt, getAssessmentAttemptByReference, markAssessmentPaid, setPaystackReference } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { getAssessmentAdminOverview, getUserAssessmentHistory, getUserProfile, updateUserAvatar, updateUserProfile } from "./db";
import { storagePut } from "./storage";
import { z } from "zod";
import { renderAssessmentReportPdf } from "./reportPdf";
import { emailAssessmentReportIfNeeded } from "./email";

const answersSchema = z.array(z.object({ questionId: z.string(), value: z.number().int().min(1).max(5) })).length(assessmentQuestions.length);

async function paystackRequest(path: string, init?: RequestInit) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Paystack is not configured." });
  const response = await fetch(`https://api.paystack.co${path}`, { ...init, headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  const payload = await response.json() as { status?: boolean; message?: string; data?: any };
  if (!response.ok || !payload.status) throw new TRPCError({ code: "BAD_GATEWAY", message: payload.message ?? "Paystack request failed." });
  return payload;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  profile: router({
    get: protectedProcedure.query(({ ctx }) => getUserProfile(ctx.user.openId)),
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
  dashboard: router({
    mine: protectedProcedure.query(({ ctx }) => {
      if (!ctx.user.email) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A verified account email is required." });
      return getUserAssessmentHistory(ctx.user.email);
    }),
    downloadReport: protectedProcedure.input(z.object({ attemptId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      if (!ctx.user.email) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A verified account email is required." });
      const attempt = await getAssessmentAttempt(input.attemptId);
      if (!attempt || attempt.email !== ctx.user.email) throw new TRPCError({ code: "NOT_FOUND", message: "Assessment report not found." });
      if (attempt.paymentStatus !== "paid" || !attempt.report) throw new TRPCError({ code: "FORBIDDEN", message: "A verified payment is required to download this report." });
      const pdf = await renderAssessmentReportPdf({ attemptId: attempt.id, participantName: attempt.name, createdAt: attempt.createdAt, report: attempt.report as import("../shared/assessment").AssessmentReport });
      return { filename: `profound-iq-assessment-${attempt.id}.pdf`, contentType: "application/pdf", data: pdf.toString("base64") };
    }),
  }),
  assessment: router({
    adminOverview: adminProcedure.query(() => getAssessmentAdminOverview()),
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

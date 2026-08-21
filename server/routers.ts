import { COOKIE_NAME } from "@shared/const";
import { assessmentQuestions, ASSESSMENT_PRICE_KES, buildReport } from "../shared/assessment";
import { getAssessmentAttempt, createAssessmentAttempt, getAssessmentAttemptByReference, markAssessmentPaid, setPaystackReference } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { getAssessmentAdminOverview, getUserAssessmentHistory, getUserProfile, updateUserProfile } from "./db";
import { z } from "zod";

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
      notificationPreferences: z.object({ assessmentUpdates: z.boolean(), courseAnnouncements: z.boolean(), monthlyInsights: z.boolean() }),
    })).mutation(({ ctx, input }) => updateUserProfile(ctx.user.openId, input)),
  }),
  dashboard: router({
    mine: protectedProcedure.query(({ ctx }) => {
      if (!ctx.user.email) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A verified account email is required." });
      return getUserAssessmentHistory(ctx.user.email);
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
      if (attempt.paymentStatus === "paid" && attempt.report) return { report: attempt.report, reference: input.reference };
      const verification = await paystackRequest(`/transaction/verify/${encodeURIComponent(input.reference)}`);
      const transaction = verification.data;
      if (transaction.reference !== input.reference || transaction.status !== "success" || transaction.amount !== ASSESSMENT_PRICE_KES * 100 || transaction.currency !== "KES") throw new TRPCError({ code: "PAYMENT_REQUIRED", message: "Payment could not be verified." });
      const report = buildReport(attempt.answers as Array<{ questionId: string; value: number }>);
      await markAssessmentPaid(attempt.id, report);
      return { report, reference: input.reference };
    }),
    getReport: publicProcedure.input(z.object({ reference: z.string().min(10).max(120) })).query(async ({ input }) => {
      const attempt = await getAssessmentAttemptByReference(input.reference);
      if (!attempt || attempt.paymentStatus !== "paid" || !attempt.report) throw new TRPCError({ code: "FORBIDDEN", message: "A verified payment is required to view this report." });
      return { report: attempt.report, reference: input.reference };
    }),
  }),
});

export type AppRouter = typeof appRouter;

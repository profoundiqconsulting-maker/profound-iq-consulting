import crypto from "node:crypto";
import type { Express, Request, Response } from "express";
import express from "express";
import { ASSESSMENT_PRICE_KES, buildReport } from "../shared/assessment";
import { COURSE_STAGE_AMOUNT_KES } from "../shared/courseCatalog";
import { getAssessmentAttemptByReference, markAssessmentPaid, recordAnalyticsEvent, createCoursePaymentEvent, getCoursePaymentStageByReference, markCoursePaymentEventProcessed, updateCoursePaymentStageStatus } from "./db";
import { emailAssessmentReportIfNeeded } from "./email";

function isValidSignature(body: Buffer, signature: string | undefined, secret: string | undefined) {
  if (!secret || !signature || signature.length !== 128) return false;
  const expected = crypto.createHmac("sha512", secret).update(body).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

type PaystackEvent = { event?: string; data?: { id?: number | string; reference?: string; status?: string; amount?: number; currency?: string; metadata?: unknown } };

async function reconcileCoursePayment(event: PaystackEvent, rawPayload: unknown) {
  const data = event.data;
  const reference = data?.reference;
  if (!reference?.startsWith("piq-course-")) return false;
  const stage = await getCoursePaymentStageByReference(reference);
  if (!stage) return true;
  const eventId = String(data?.id ?? `${event.event ?? "unknown"}:${reference}`);
  const stored = await createCoursePaymentEvent({ eventId, enrollmentId: stage.enrollmentId, paymentStageId: stage.id, reference, eventType: event.event ?? "unknown", transactionStatus: data?.status ?? null, amountKes: typeof data?.amount === "number" ? Math.round(data.amount / 100) : null, currency: data?.currency ?? null, payload: rawPayload });
  if (stored.duplicate) return true;

  const validSuccess = event.event === "charge.success" && data?.status === "success" && data.amount === stage.amountKes * 100 && data.currency === "KES";
  if (validSuccess) {
    await updateCoursePaymentStageStatus(stage.id, { status: "paid", paid: true });
    await markCoursePaymentEventProcessed(eventId);
    return true;
  }

  const reason = event.event === "charge.success" ? "Paystack success payload did not match the expected stage amount or currency." : `Unhandled Paystack event ${event.event ?? "unknown"} for a course payment.`;
  await updateCoursePaymentStageStatus(stage.id, { status: "exception", errorMessage: reason });
  await markCoursePaymentEventProcessed(eventId, reason);
  return true;
}

export function registerPaystackWebhook(app: Express) {
  app.post("/api/paystack/webhook", express.raw({ type: "application/json" }), async (req: Request, res: Response) => {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const signature = req.header("x-paystack-signature");
    const body = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
    if (!isValidSignature(body, signature, secret)) return res.status(401).json({ verified: false });

    let event: PaystackEvent;
    try { event = JSON.parse(body.toString()) as PaystackEvent; } catch { return res.status(400).json({ received: false }); }
    const courseHandled = await reconcileCoursePayment(event, event);
    if (!courseHandled && event.event === "charge.success" && event.data?.reference && event.data.status === "success" && event.data.amount === ASSESSMENT_PRICE_KES * 100 && event.data.currency === "KES") {
      const attempt = await getAssessmentAttemptByReference(event.data.reference);
      if (attempt && attempt.paymentStatus !== "paid") {
        const report = buildReport(attempt.answers as Array<{ questionId: string; value: number }>);
        await markAssessmentPaid(attempt.id, report);
        await recordAnalyticsEvent({ eventName: "payment_completed", attemptId: attempt.id, metadata: { currency: "KES", amount: ASSESSMENT_PRICE_KES, source: "webhook" } });
        try {
          await emailAssessmentReportIfNeeded({ attemptId: attempt.id, participantName: attempt.name, email: attempt.email, createdAt: attempt.createdAt, report, reportEmailStatus: attempt.reportEmailStatus, reportEmailSentAt: attempt.reportEmailSentAt });
        } catch (error) {
          console.error("[Paystack] Report email delivery failed:", error);
        }
      }
    }
    return res.status(200).json({ received: true });
  });
}

import crypto from "node:crypto";
import type { Express, Request, Response } from "express";
import express from "express";
import { ASSESSMENT_PRICE_KES, buildReport } from "../shared/assessment";
import { getAssessmentAttemptByReference, markAssessmentPaid } from "./db";
import { emailAssessmentReportIfNeeded } from "./email";

export function registerPaystackWebhook(app: Express) {
  app.post("/api/paystack/webhook", express.raw({ type: "application/json" }), async (req: Request, res: Response) => {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const signature = req.header("x-paystack-signature");
    const body = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
    const expected = secret ? crypto.createHmac("sha512", secret).update(body).digest("hex") : "";
    if (!secret || !signature || signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return res.status(401).json({ verified: false });

    const event = JSON.parse(body.toString()) as { event?: string; data?: { reference?: string; status?: string; amount?: number; currency?: string } };
    if (event.event === "charge.success" && event.data?.reference && event.data.status === "success" && event.data.amount === ASSESSMENT_PRICE_KES * 100 && event.data.currency === "KES") {
      const attempt = await getAssessmentAttemptByReference(event.data.reference);
      if (attempt && attempt.paymentStatus !== "paid") {
        const report = buildReport(attempt.answers as Array<{ questionId: string; value: number }>);
        await markAssessmentPaid(attempt.id, report);
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

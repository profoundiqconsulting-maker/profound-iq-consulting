import { ENV } from "./_core/env";
import type { Express, Request, Response } from "express";
import express from "express";
import {
  ASSESSMENT_PRICE_KES,
  buildReport,
  type AssessmentReport,
} from "../shared/assessment";
import { CAREER_PATH_PRICE_KES } from "../shared/careerPath";
import {
  COURSE_STAGE_AMOUNT_KES,
  courseCatalog,
} from "../shared/courseCatalog";
import { PSYCHOMETRIC_PRICE_KES } from "../shared/psychometrics";
import {
  buildCareerPathReport,
  type CareerPathReport,
} from "../shared/careerPath";
import {
  scorePsychometricTest,
  type PsychometricAnswer,
  type PsychometricReport,
} from "../shared/psychometrics";
import {
  getAssessmentAttemptByReference,
  markAssessmentPaid,
  recordAnalyticsEvent,
  createCoursePaymentEvent,
  getCoursePaymentStageByReference,
  markCoursePaymentEventProcessed,
  updateCoursePaymentStageStatus,
  getPsychometricAttemptByReference,
  markPsychometricPaid,
  getCareerPathAttemptByReference,
  markCareerPathPaid,
  getCourseEnrollmentById,
  listCourseEnrollmentState,
  getAdminCertificateSettings,
  createCourseCertificate,
} from "./db";
import {
  emailAssessmentReportIfNeeded,
  emailCareerPathReportIfNeeded,
  emailPsychometricReportIfNeeded,
  sendPaymentReceiptEmail,
  sendCourseCertificateEmail,
} from "./email";
import { renderCourseCertificateSvg } from "./courseCertificate";
import { storagePut } from "./storage";
import { getRequestLocale } from "./requestLocale";
import {
  createHash,
  createHmac,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import { PUBLISHED_SITE_ORIGIN } from "../shared/siteOrigin";

function isValidSignature(
  body: Buffer,
  signature: string | undefined,
  secret: string | undefined
) {
  if (!secret || !signature || signature.length !== 128) return false;
  const expected = createHmac("sha512", secret).update(body).digest("hex");
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

type PaystackEvent = {
  event?: string;
  data?: {
    id?: number | string;
    reference?: string;
    status?: string;
    amount?: number;
    currency?: string;
    metadata?: unknown;
    failure_message?: string;
    failure_code?: string;
  };
};

async function reconcileCoursePayment(
  event: PaystackEvent,
  rawPayload: unknown,
  req?: Request
) {
  const data = event.data;
  const reference = data?.reference;
  if (!reference?.startsWith("piq-course-")) return false;
  const stage = await getCoursePaymentStageByReference(reference);
  if (!stage) return true;
  const eventId = String(
    data?.id ?? `${event.event ?? "unknown"}:${reference}`
  );
  const stored = await createCoursePaymentEvent({
    eventId,
    enrollmentId: stage.enrollmentId,
    paymentStageId: stage.id,
    reference,
    eventType: event.event ?? "unknown",
    transactionStatus: data?.status ?? null,
    amountKes:
      typeof data?.amount === "number" ? Math.round(data.amount / 100) : null,
    currency: data?.currency ?? null,
    payload: rawPayload,
  });
  if (stored.duplicate) return true;

  const validSuccess =
    event.event === "charge.success" &&
    data?.status === "success" &&
    data.amount === stage.amountKes * 100 &&
    data.currency === "KES";
  if (validSuccess) {
    await updateCoursePaymentStageStatus(stage.id, {
      status: "paid",
      paid: true,
    });
    await markCoursePaymentEventProcessed(eventId);
    const enrollment = await getCourseEnrollmentById(stage.enrollmentId);
    if (enrollment) {
      const course = courseCatalog.find(
        item => item.slug === enrollment.courseSlug
      );
      try {
        await sendPaymentReceiptEmail({
          to: enrollment.email,
          participantName: enrollment.name,
          reference: stage.paystackReference ?? reference,
          productName: course?.title ?? "Course",
          amountKes: stage.amountKes,
          paidAt: new Date(),
          productType: "course_stage",
          courseSlug: enrollment.courseSlug,
          enrollmentId: stage.enrollmentId,
        });
      } catch (error) {
        console.error("[Paystack] Course receipt email failed:", error);
      }
      if (stage.stage === 4 && course && enrollment.userOpenId) {
        const state = await listCourseEnrollmentState(enrollment.userOpenId);
        const record = state.find(
          item => item.enrollment.id === stage.enrollmentId
        );
        if (
          record &&
          record.stages.filter(s => s.paymentStatus === "paid").length >= 4 &&
          !record.certificates.length
        ) {
          const passed = new Set(
            record.quizAttempts
              .filter(attempt => attempt.passed)
              .map(attempt => attempt.moduleId)
          );
          if (
            record.lessons.length >= course.modules.length * 7 &&
            passed.size >= course.modules.length
          ) {
            const certificateNumber = `PIQ-${new Date().getFullYear()}-${randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()}`;
            const verificationUrl = `${PUBLISHED_SITE_ORIGIN}/verify/certificate?certificate=${encodeURIComponent(certificateNumber)}`;
            const certificateSettings = await getAdminCertificateSettings(
              ENV.ownerOpenId || record.enrollment.userOpenId
            );
            const certificateSvg = renderCourseCertificateSvg({
              recipientName: record.enrollment.name,
              recipientEmail: record.enrollment.email,
              courseTitle: course.title,
              certificateNumber,
              issuedOn: new Date(),
              verificationUrl,
              locale: req ? getRequestLocale(req) : "en",
              trainerName: certificateSettings.trainerName,
              trainerTitle: certificateSettings.trainerTitle,
              signatureDataUri: certificateSettings.signatureDataUri,
              customElements:
                (
                  certificateSettings as typeof certificateSettings & {
                    customElements?: Record<string, string>;
                  }
                ).customElements ?? undefined,
              fieldLayout: certificateSettings.fieldLayout as
                | Record<
                    string,
                    {
                      x?: number;
                      y?: number;
                      width?: number;
                      height?: number;
                      visible?: boolean;
                      text?: string;
                    }
                  >
                | undefined,
            });
            const artifactHash = createHash("sha256")
              .update(certificateSvg)
              .digest("hex");
            const uploaded = await storagePut(
              `course-certificates/${certificateNumber}.svg`,
              certificateSvg,
              "image/svg+xml"
            );
            await createCourseCertificate({
              enrollmentId: record.enrollment.id,
              recipientName: record.enrollment.name,
              courseTitle: course.title,
              certificateNumber,
              fileKey: uploaded.key,
              fileUrl: uploaded.url,
              artifactHash,
            });
            try {
              await sendCourseCertificateEmail({
                recipientName: record.enrollment.name,
                email: record.enrollment.email,
                courseTitle: course.title,
                certificateNumber,
                certificateSvg,
                locale: req ? getRequestLocale(req) : "en",
              });
            } catch (error) {
              console.error(
                "[Paystack] Course certificate email failed:",
                error
              );
            }
          }
        }
      }
    }
    return true;
  }

  const failureReason = data?.failure_message ?? data?.failure_code;

  if (
    event.event === "charge.failed" &&
    (data?.status === "failed" ||
      data?.status === "declined" ||
      data?.status === "abandoned")
  ) {
    await updateCoursePaymentStageStatus(stage.id, {
      status: "failed",
      errorMessage: failureReason ?? "Payment was declined or failed.",
    });
    await markCoursePaymentEventProcessed(eventId);
    return true;
  }

  if (event.event === "charge.pending" || data?.status === "pending") {
    await updateCoursePaymentStageStatus(stage.id, {
      status: "pending",
      errorMessage: null,
    });
    await markCoursePaymentEventProcessed(eventId);
    return true;
  }

  const reason = `Unhandled Paystack event ${event.event ?? "unknown"} (status: ${data?.status ?? "unspecified"}) for a course payment.`;
  await updateCoursePaymentStageStatus(stage.id, {
    status: "exception",
    errorMessage: reason,
  });
  await markCoursePaymentEventProcessed(eventId, reason);
  return true;
}

async function reconcileAssessmentPayment(event: PaystackEvent) {
  const data = event.data;
  if (
    !event.data?.reference ||
    event.data.status !== "success" ||
    event.data.amount !== ASSESSMENT_PRICE_KES * 100 ||
    event.data.currency !== "KES"
  )
    return false;
  const attempt = await getAssessmentAttemptByReference(event.data.reference);
  if (!attempt || attempt.paymentStatus === "paid") return true;
  const report = buildReport(
    attempt.answers as Array<{ questionId: string; value: number }>
  );
  await markAssessmentPaid(attempt.id, report);
  await recordAnalyticsEvent({
    eventName: "payment_completed",
    attemptId: attempt.id,
    metadata: {
      currency: "KES",
      amount: ASSESSMENT_PRICE_KES,
      source: "webhook",
    },
  });
  try {
    await emailAssessmentReportIfNeeded({
      attemptId: attempt.id,
      participantName: attempt.name,
      email: attempt.email,
      createdAt: attempt.createdAt,
      report,
      reportEmailStatus: attempt.reportEmailStatus,
      reportEmailSentAt: attempt.reportEmailSentAt,
    });
  } catch (error) {
    console.error("[Paystack] Assessment report email delivery failed:", error);
  }
  try {
    await sendPaymentReceiptEmail({
      to: attempt.email,
      participantName: attempt.name,
      reference: event.data.reference,
      productName: "Profound IQ Self Assessment",
      amountKes: ASSESSMENT_PRICE_KES,
      paidAt: new Date(),
      productType: "assessment",
    });
  } catch (error) {
    console.error("[Paystack] Assessment receipt email failed:", error);
  }
  return true;
}

async function reconcilePsychometricPayment(event: PaystackEvent) {
  const data = event.data;
  if (
    !event.data?.reference ||
    event.data.status !== "success" ||
    event.data.amount !== PSYCHOMETRIC_PRICE_KES * 100 ||
    event.data.currency !== "KES"
  )
    return false;
  const attempt = await getPsychometricAttemptByReference(event.data.reference);
  if (!attempt || attempt.paymentStatus === "paid") return true;
  const testSlug = attempt.testSlug;
  const test = (await import("../shared/psychometrics")).getPsychometricTest(
    testSlug
  );
  if (!test) return false;
  const report = scorePsychometricTest(
    test,
    attempt.answers as PsychometricAnswer[]
  );
  await markPsychometricPaid(attempt.id, report);
  await recordAnalyticsEvent({
    eventName: "payment_completed",
    attemptId: attempt.id,
    metadata: {
      product: testSlug,
      currency: "KES",
      amount: PSYCHOMETRIC_PRICE_KES,
      source: "webhook",
    },
  });
  try {
    await emailPsychometricReportIfNeeded({
      attemptId: attempt.id,
      participantName: attempt.name,
      email: attempt.email,
      createdAt: attempt.createdAt,
      report,
      reportEmailStatus: attempt.reportEmailStatus,
      reportEmailSentAt: attempt.reportEmailSentAt,
      verificationUrl: `${PUBLISHED_SITE_ORIGIN}/verify/psychometric?reference=${encodeURIComponent(event.data.reference)}`,
    });
  } catch (error) {
    console.error(
      "[Paystack] Psychometric report email delivery failed:",
      error
    );
  }
  try {
    await sendPaymentReceiptEmail({
      to: attempt.email,
      participantName: attempt.name,
      reference: event.data.reference,
      productName: test.title,
      amountKes: PSYCHOMETRIC_PRICE_KES,
      paidAt: new Date(),
      productType: "psychometric",
    });
  } catch (error) {
    console.error("[Paystack] Psychometric receipt email failed:", error);
  }
  return true;
}

async function reconcileCareerPathPayment(event: PaystackEvent) {
  const data = event.data;
  if (
    !event.data?.reference ||
    event.data.status !== "success" ||
    event.data.amount !== CAREER_PATH_PRICE_KES * 100 ||
    event.data.currency !== "KES"
  )
    return false;
  const attempt = await getCareerPathAttemptByReference(event.data.reference);
  if (!attempt || attempt.paymentStatus === "paid") return true;
  const report = buildCareerPathReport(
    attempt.answers as Array<{ questionId: string; value: number }>
  );
  await markCareerPathPaid(attempt.id, report);
  await recordAnalyticsEvent({
    eventName: "payment_completed",
    attemptId: attempt.id,
    metadata: {
      product: "careerpath",
      currency: "KES",
      amount: CAREER_PATH_PRICE_KES,
      source: "webhook",
    },
  });
  try {
    await emailCareerPathReportIfNeeded({
      attemptId: attempt.id,
      participantName: attempt.name,
      email: attempt.email,
      createdAt: attempt.createdAt,
      report,
      personalNotes: attempt.personalNotes,
      receiptTitle: attempt.receiptTitle,
    });
  } catch (error) {
    console.error("[Paystack] CareerPath report email delivery failed:", error);
  }
  try {
    await sendPaymentReceiptEmail({
      to: attempt.email,
      participantName: attempt.name,
      reference: event.data.reference,
      productName: "CareerPath Talent Fit",
      amountKes: CAREER_PATH_PRICE_KES,
      paidAt: new Date(),
      productType: "careerpath",
    });
  } catch (error) {
    console.error("[Paystack] CareerPath receipt email failed:", error);
  }
  return true;
}

export function registerPaystackWebhook(app: Express) {
  app.post(
    "/api/paystack/webhook",
    express.raw({ type: "application/json" }),
    async (req: Request, res: Response) => {
      const secret = process.env.PAYSTACK_SECRET_KEY;
      const signature = req.header("x-paystack-signature");
      const body = Buffer.isBuffer(req.body)
        ? req.body
        : Buffer.from(JSON.stringify(req.body));
      if (!isValidSignature(body, signature, secret))
        return res.status(401).json({ verified: false });

      let event: PaystackEvent;
      try {
        event = JSON.parse(body.toString()) as PaystackEvent;
      } catch {
        return res.status(400).json({ received: false });
      }

      const courseHandled = await reconcileCoursePayment(event, event, req);
      if (!courseHandled) {
        const assessmentHandled = await reconcileAssessmentPayment(event);
        if (!assessmentHandled) {
          const psychometricHandled = await reconcilePsychometricPayment(event);
          if (!psychometricHandled) {
            await reconcileCareerPathPayment(event);
          }
        }
      }
      return res.status(200).json({ received: true });
    }
  );
}

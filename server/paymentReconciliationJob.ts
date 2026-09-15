import { paystackRequest } from "./_core/paystack";
import {
  listStalePendingPaymentStages,
  updateCoursePaymentStageStatus,
  logPaymentReconciliation,
} from "./db";

export type ReconcileOutcome = "paid" | "failed" | "exception";

function logStage(
  stageId: number,
  action: string,
  outcome: ReconcileOutcome,
  note?: string | null
) {
  void logPaymentReconciliation({
    stageId,
    userOpenId: null,
    action,
    outcome,
    note: note ?? null,
    ip: null,
  }).catch(error => {
    console.error("[Reconciliation] Audit log write failed:", error);
  });
}

/**
 * Re-verifies course payment stages that are still `pending` beyond a cutoff
 * and reconciles them against Paystack. Intended to be invoked by a
 * scheduler (e.g. a cron job or the platform heartbeat mechanism). Returns a
 * summary of what was processed.
 */
export async function reconcileStalePendingPayments(input?: {
  maxAgeMinutes?: number;
}) {
  const maxAgeMinutes = input?.maxAgeMinutes ?? 30;
  const stages = await listStalePendingPaymentStages(maxAgeMinutes);
  let checked = 0;
  let paid = 0;
  let failed = 0;
  const errors: Array<{ reference: string; error: string }> = [];

  for (const stage of stages) {
    const reference = stage.paystackReference;
    if (!reference) continue;
    checked++;
    try {
      const verification = await paystackRequest(
        `/transaction/verify/${encodeURIComponent(reference)}`
      );
      const transaction = verification.data as {
        reference?: string;
        status?: string;
        amount?: number;
        currency?: string;
      };
      const valid =
        transaction.reference === reference &&
        transaction.status === "success" &&
        transaction.amount === stage.amountKes * 100 &&
        transaction.currency === "KES";
      if (valid) {
        await updateCoursePaymentStageStatus(stage.id, {
          status: "paid",
          paid: true,
          errorMessage: null,
        });
        logStage(stage.id, "nightly_reconcile", "paid");
        paid++;
      } else {
        const outcome: ReconcileOutcome =
          transaction.status === "failed" ? "failed" : "exception";
        await updateCoursePaymentStageStatus(stage.id, {
          status: outcome,
          errorMessage: `Nightly reconcile: Paystack returned ${transaction.status ?? "unknown"}.`,
        });
        logStage(stage.id, "nightly_reconcile", outcome, transaction.status);
        failed++;
      }
    } catch (error) {
      await updateCoursePaymentStageStatus(stage.id, {
        status: "exception",
        errorMessage:
          error instanceof Error
            ? error.message.slice(0, 1000)
            : "Nightly reconcile failed.",
      });
      logStage(
        stage.id,
        "nightly_reconcile",
        "exception",
        error instanceof Error ? error.message : "Nightly reconcile failed."
      );
      errors.push({
        reference,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { checked, paid, failed, errors };
}

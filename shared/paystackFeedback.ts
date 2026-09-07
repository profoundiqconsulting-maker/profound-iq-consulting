export type PaystackCheckoutState =
  | "idle"
  | "initializing"
  | "redirecting"
  | "verifying"
  | "paid"
  | "error";

export const paystackCheckoutCopy: Record<
  PaystackCheckoutState,
  { label: string; description: string }
> = {
  idle: {
    label: "Continue to secure checkout",
    description: "Your report unlocks after Paystack confirms payment.",
  },
  initializing: {
    label: "Preparing secure checkout…",
    description: "We are creating a secure Paystack session.",
  },
  redirecting: {
    label: "Redirecting to Paystack…",
    description: "Keep this window open while Paystack secure checkout loads.",
  },
  verifying: {
    label: "Verifying payment…",
    description:
      "We are confirming the transaction before unlocking your report.",
  },
  paid: {
    label: "Payment verified",
    description: "Your report is unlocked and ready to review.",
  },
  error: {
    label: "Try checkout again",
    description:
      "We could not complete the payment step. No report was unlocked.",
  },
};

export function paystackStateAfter(
  event: "begin" | "ready" | "verify" | "success" | "failure"
): PaystackCheckoutState {
  if (event === "begin") return "initializing";
  if (event === "ready") return "redirecting";
  if (event === "verify") return "verifying";
  if (event === "success") return "paid";
  return "error";
}

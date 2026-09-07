import { describe, expect, it } from "vitest";
import { paystackCheckoutCopy, paystackStateAfter } from "./paystackFeedback";

describe("Paystack checkout feedback", () => {
  it("moves through initialization, redirect, verification, success, and failure states", () => {
    expect(paystackStateAfter("begin")).toBe("initializing");
    expect(paystackStateAfter("ready")).toBe("redirecting");
    expect(paystackStateAfter("verify")).toBe("verifying");
    expect(paystackStateAfter("success")).toBe("paid");
    expect(paystackStateAfter("failure")).toBe("error");
  });

  it("keeps loading and success copy explicit", () => {
    expect(paystackCheckoutCopy.initializing.label).toContain("Preparing");
    expect(paystackCheckoutCopy.redirecting.description).toContain("Paystack");
    expect(paystackCheckoutCopy.paid.description).toContain("unlocked");
    expect(paystackCheckoutCopy.error.description).toContain(
      "No report was unlocked"
    );
  });
});

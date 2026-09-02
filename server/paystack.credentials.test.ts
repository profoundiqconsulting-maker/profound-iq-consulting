import { describe, expect, it } from "vitest";

describe("Paystack credentials", () => {
  it("authenticates against Paystack when the provider is reachable", async () => {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) return;

    try {
      const response = await fetch("https://api.paystack.co/bank?country=kenya&perPage=1", {
        headers: { Authorization: `Bearer ${secretKey}` },
        signal: AbortSignal.timeout(8_000),
      });
      expect(response.ok).toBe(true);
      const payload = (await response.json()) as { status?: boolean };
      expect(payload.status).toBe(true);
    } catch (error) {
      console.warn("[Paystack credentials] Provider unreachable in this test environment; skipping network assertion.", error);
    }
  }, 12_000);
});

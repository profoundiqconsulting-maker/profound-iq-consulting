import { describe, expect, it } from "vitest";

describe("Paystack credentials", () => {
  it("authenticates against Paystack", async () => {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    expect(secretKey, "PAYSTACK_SECRET_KEY must be configured").toBeTruthy();

    const response = await fetch("https://api.paystack.co/bank?country=kenya&perPage=1", {
      headers: { Authorization: `Bearer ${secretKey}` },
    });

    expect(response.ok).toBe(true);
    const payload = (await response.json()) as { status?: boolean };
    expect(payload.status).toBe(true);
  }, 15_000);
});

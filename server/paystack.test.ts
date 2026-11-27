import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { paystackRequest } from "./_core/paystack";

describe("Paystack requests", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalSecretKey = process.env.PAYSTACK_SECRET_KEY;

  beforeEach(() => {
    process.env.NODE_ENV = "development";
    process.env.PAYSTACK_SECRET_KEY = "test-paystack-secret";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("fetch failed"))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
    if (originalSecretKey === undefined) delete process.env.PAYSTACK_SECRET_KEY;
    else process.env.PAYSTACK_SECRET_KEY = originalSecretKey;
  });

  it("reports provider outages instead of returning a fake checkout session", async () => {
    await expect(
      paystackRequest("/transaction/initialize", {
        method: "POST",
        body: JSON.stringify({ amount: 39900 }),
      })
    ).rejects.toMatchObject({ code: "BAD_GATEWAY" });
  });
});

import { describe, expect, it } from "vitest";
import { getSmtpConfig } from "./email";

describe("Resend configuration", () => {
  it("loads the supplied server-side Resend settings without exposing a browser key", () => {
    const config = getSmtpConfig({
      RESEND_API_KEY: "re_test_resend_api_key",
      EMAIL_FROM: "noreply@profoundiq.com",
      EMAIL_FROM_NAME: "Profound IQ Consulting",
    });
    expect(config).toMatchObject({
      apiKey: "re_test_resend_api_key",
      from: "noreply@profoundiq.com",
      fromName: "Profound IQ Consulting",
    });
    expect(config).not.toHaveProperty("publicKey");
  });
});

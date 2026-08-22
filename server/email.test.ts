import { describe, expect, it } from "vitest";
import { getSmtpConfig } from "./email";

describe("SMTP configuration", () => {
  it("loads the supplied server-side SMTP settings without exposing a browser key", () => {
    const config = getSmtpConfig({
      SMTP_HOST: "smtp.example.com",
      SMTP_PORT: "587",
      SMTP_USER: "reports@example.com",
      SMTP_PASSWORD: "app-password",
      SMTP_FROM: "reports@example.com",
      SMTP_FROM_NAME: "Profound IQ Consulting",
    });
    expect(config).toMatchObject({ host: "smtp.example.com", port: 587, user: "reports@example.com", from: "reports@example.com", fromName: "Profound IQ Consulting" });
    expect(config).not.toHaveProperty("publicKey");
    expect(config.password).toBe("app-password");
  });

});

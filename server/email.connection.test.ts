import { describe, expect, it } from "vitest";
import { verifySmtpConnection } from "./email";

describe("configured SMTP account", () => {
  it("accepts the latest credentials without sending a message", async () => {
    if (process.env.RUN_SMTP_CONNECTION_TEST !== "1") return;
    if (!process.env.SMTP_HOST) return;
    await expect(verifySmtpConnection()).resolves.toBeUndefined();
  }, 15_000);
});

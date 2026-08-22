import crypto from "node:crypto";
import express from "express";
import { createServer } from "node:http";
import { afterEach, describe, expect, it, vi } from "vitest";

const getAssessmentAttemptByReference = vi.fn();
const markAssessmentPaid = vi.fn();
const emailAssessmentReportIfNeeded = vi.fn();

vi.mock("./db", () => ({ getAssessmentAttemptByReference, markAssessmentPaid }));
vi.mock("./email", () => ({ emailAssessmentReportIfNeeded }));

const { registerPaystackWebhook } = await import("./paystackWebhook");

describe("Paystack webhook", () => {
  const secret = process.env.PAYSTACK_SECRET_KEY ?? "test-secret";

  afterEach(() => {
    getAssessmentAttemptByReference.mockReset();
    markAssessmentPaid.mockReset();
    emailAssessmentReportIfNeeded.mockReset();
  });

  it("rejects an invalid signature", async () => {
    const app = express();
    registerPaystackWebhook(app);
    const server = createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;
    const response = await fetch(`http://127.0.0.1:${port}/api/paystack/webhook`, { method: "POST", headers: { "content-type": "application/json", "x-paystack-signature": "invalid" }, body: JSON.stringify({ event: "charge.success" }) });
    expect(response.status).toBe(401);
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  });

  it("unlocks a pending assessment only for a correctly signed KES 200 success", async () => {
    const reference = "piq-test-reference";
    getAssessmentAttemptByReference.mockResolvedValue({ id: 7, paymentStatus: "pending", answers: [] });
    const app = express();
    registerPaystackWebhook(app);
    const server = createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;
    const body = JSON.stringify({ event: "charge.success", data: { reference, status: "success", amount: 20000, currency: "KES" } });
    const signature = crypto.createHmac("sha512", secret).update(body).digest("hex");
    const response = await fetch(`http://127.0.0.1:${port}/api/paystack/webhook`, { method: "POST", headers: { "content-type": "application/json", "x-paystack-signature": signature }, body });
    expect(response.status).toBe(200);
    expect(markAssessmentPaid).toHaveBeenCalledOnce();
    expect(emailAssessmentReportIfNeeded).toHaveBeenCalledOnce();
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  });

  it("does not unlock an already-paid attempt on duplicate delivery", async () => {
    const reference = "piq-paid-reference";
    getAssessmentAttemptByReference.mockResolvedValue({ id: 8, paymentStatus: "paid", answers: [] });
    const app = express();
    registerPaystackWebhook(app);
    const server = createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;
    const body = JSON.stringify({ event: "charge.success", data: { reference, status: "success", amount: 20000, currency: "KES" } });
    const signature = crypto.createHmac("sha512", secret).update(body).digest("hex");
    const response = await fetch(`http://127.0.0.1:${port}/api/paystack/webhook`, { method: "POST", headers: { "content-type": "application/json", "x-paystack-signature": signature }, body });
    expect(response.status).toBe(200);
    expect(markAssessmentPaid).not.toHaveBeenCalled();
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  });
});

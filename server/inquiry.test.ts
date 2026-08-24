import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  createContactInquiry: vi.fn().mockResolvedValue(27),
  recordAnalyticsEvent: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./db", async (importOriginal) => ({ ...(await importOriginal<typeof import("./db")>()), ...mocks }));
const { appRouter } = await import("./routers");

function publicContext(): TrpcContext {
  return { user: null, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("inquiry.create", () => {
  it("persists the inquiry and records analytics", async () => {
    const result = await appRouter.createCaller(publicContext()).inquiry.create({ name: "Amina Njeri", email: "amina@example.com", message: "I would like to discuss leadership training for our team." });
    expect(result).toEqual({ id: 27 });
    expect(mocks.createContactInquiry).toHaveBeenCalledWith({ name: "Amina Njeri", email: "amina@example.com", message: "I would like to discuss leadership training for our team." });
    expect(mocks.recordAnalyticsEvent).toHaveBeenCalledWith({ eventName: "contact_inquiry_submitted", userOpenId: undefined, metadata: { inquiryId: 27 } });
  });

  it("rejects messages that are too short", async () => {
    await expect(appRouter.createCaller(publicContext()).inquiry.create({ name: "Amina Njeri", email: "amina@example.com", message: "Help" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

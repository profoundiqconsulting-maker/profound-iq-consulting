import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  createContactInquiry: vi.fn().mockResolvedValue(27),
  listContactInquiries: vi.fn().mockResolvedValue({ rows: [], total: 0, page: 1, pageSize: 8, totalPages: 1 }),
  updateContactInquiryStatus: vi.fn().mockResolvedValue({ id: 12, status: "contacted" }),
  recordAnalyticsEvent: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./db", async (importOriginal) => ({ ...(await importOriginal<typeof import("./db")>()), ...mocks }));
const { appRouter } = await import("./routers");

function publicContext(): TrpcContext {
  return { user: null, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

function adminContext(): TrpcContext {
  const now = new Date();
  return { user: { id: 1, openId: "admin-test", name: "Admin Test", email: "admin@example.com", loginMethod: "test", role: "admin", createdAt: now, updatedAt: now, lastSignedIn: now }, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("inquiry.create", () => {
  beforeEach(() => { mocks.createContactInquiry.mockClear(); mocks.listContactInquiries.mockClear(); mocks.updateContactInquiryStatus.mockClear(); mocks.recordAnalyticsEvent.mockClear(); });
  it("persists the inquiry and records analytics", async () => {
    const result = await appRouter.createCaller(publicContext()).inquiry.create({ name: "Amina Njeri", email: "amina@example.com", category: "organizational-development", message: "I would like to discuss leadership training for our team.", mathA: 7, mathB: 5, mathAnswer: 12 });
    expect(result).toEqual({ id: 27 });
    expect(mocks.createContactInquiry).toHaveBeenCalledWith({ name: "Amina Njeri", email: "amina@example.com", category: "organizational-development", message: "I would like to discuss leadership training for our team." });
    expect(mocks.recordAnalyticsEvent).toHaveBeenCalledWith({ eventName: "contact_inquiry_submitted", userOpenId: undefined, metadata: { inquiryId: 27 } });
  });

  it("rejects messages that are too short", async () => {
    await expect(appRouter.createCaller(publicContext()).inquiry.create({ name: "Amina Njeri", email: "amina@example.com", category: "general", message: "Help", mathA: 3, mathB: 4, mathAnswer: 7 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("allows an administrator to filter and manage inquiry status", async () => {
    const caller = appRouter.createCaller(adminContext());
    await caller.admin.contactInquiries({ page: 1, pageSize: 8, search: "amina", category: "general", status: "new" });
    await caller.admin.updateContactInquiryStatus({ id: 12, status: "contacted" });
    expect(mocks.listContactInquiries).toHaveBeenCalledWith({ page: 1, pageSize: 8, search: "amina", category: "general", status: "new" });
    expect(mocks.updateContactInquiryStatus).toHaveBeenCalledWith(12, "contacted");
  });

  it("rejects an incorrect math answer before persistence", async () => {
    await expect(appRouter.createCaller(publicContext()).inquiry.create({ name: "Amina Njeri", email: "amina@example.com", category: "general", message: "Please send more information about your services.", mathA: 3, mathB: 4, mathAnswer: 8 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mocks.createContactInquiry).not.toHaveBeenCalled();
  });
});

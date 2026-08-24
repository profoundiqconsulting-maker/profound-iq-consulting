import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  createContactInquiry: vi.fn().mockResolvedValue(27),
  listContactInquiries: vi.fn().mockResolvedValue({ rows: [], total: 0, page: 1, pageSize: 8, totalPages: 1 }),
  updateContactInquiryStatus: vi.fn().mockResolvedValue({ id: 12, status: "contacted" }),
  getContactInquiriesForExport: vi.fn().mockResolvedValue([{ id: 12, name: "Amina", email: "amina@example.com", category: "general", message: "Hello", status: "new", createdAt: new Date("2026-08-24T00:00:00Z") }]),
  getContactInquiryCategoryCounts: vi.fn().mockResolvedValue([{ category: "general", count: 3 }]),
  bulkUpdateContactInquiryStatus: vi.fn().mockResolvedValue(2),
  updateContactInquiryNotes: vi.fn().mockResolvedValue({ id: 12, internalNotes: "Follow up next week" }),
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
  beforeEach(() => { mocks.createContactInquiry.mockClear(); mocks.listContactInquiries.mockClear(); mocks.updateContactInquiryStatus.mockClear(); mocks.getContactInquiriesForExport.mockClear(); mocks.getContactInquiryCategoryCounts.mockClear(); mocks.bulkUpdateContactInquiryStatus.mockClear(); mocks.updateContactInquiryNotes.mockClear(); mocks.recordAnalyticsEvent.mockClear(); });
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
    await caller.admin.contactInquiries({ page: 1, pageSize: 8, search: "amina", category: "general", status: "new", fromDate: "2026-08-01", toDate: "2026-08-24" });
    await caller.admin.updateContactInquiryStatus({ id: 12, status: "contacted" });
    expect(mocks.listContactInquiries).toHaveBeenCalledWith({ page: 1, pageSize: 8, search: "amina", category: "general", status: "new", fromDate: new Date("2026-08-01T00:00:00.000Z"), toDate: new Date("2026-08-24T23:59:59.999Z") });
    expect(mocks.updateContactInquiryStatus).toHaveBeenCalledWith(12, "contacted");
    const exported = await caller.admin.exportContactInquiries({ search: "amina", category: "general", status: "new" });
    expect(exported.data).toContain("Name");
    expect(mocks.getContactInquiriesForExport).toHaveBeenCalledWith({ search: "amina", category: "general", status: "new" });
    await caller.admin.bulkUpdateContactInquiryStatus({ ids: [12, 13], status: "closed" });
    await caller.admin.updateContactInquiryNotes({ id: 12, internalNotes: "Follow up next week" });
    await caller.admin.contactInquiryCategoryCounts();
    expect(mocks.bulkUpdateContactInquiryStatus).toHaveBeenCalledWith([12, 13], "closed");
    expect(mocks.updateContactInquiryNotes).toHaveBeenCalledWith(12, "Follow up next week");
    expect(mocks.getContactInquiryCategoryCounts).toHaveBeenCalledWith(30);
  });

  it("rejects an incorrect math answer before persistence", async () => {
    await expect(appRouter.createCaller(publicContext()).inquiry.create({ name: "Amina Njeri", email: "amina@example.com", category: "general", message: "Please send more information about your services.", mathA: 3, mathB: 4, mathAnswer: 8 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mocks.createContactInquiry).not.toHaveBeenCalled();
  });
});

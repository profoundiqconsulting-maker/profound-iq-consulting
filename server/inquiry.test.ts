import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  createContactInquiry: vi.fn().mockResolvedValue(27),
  listContactInquiries: vi
    .fn()
    .mockResolvedValue({
      rows: [],
      total: 0,
      page: 1,
      pageSize: 8,
      totalPages: 1,
    }),
  listAssignedContactInquiries: vi
    .fn()
    .mockResolvedValue({
      rows: [
        {
          id: 12,
          name: "Amina",
          email: "amina@example.com",
          category: "general",
          message: "Hello",
          status: "new",
          internalNotes: null,
          createdAt: new Date("2026-08-24T00:00:00Z"),
        },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    }),
  updateAssignedContactInquiryStatus: vi
    .fn()
    .mockResolvedValue({ id: 12, status: "contacted" }),
  updateAssignedContactInquiryNotes: vi
    .fn()
    .mockResolvedValue({ id: 12, internalNotes: "Follow up" }),
  updateContactInquiryStatus: vi
    .fn()
    .mockResolvedValue({ id: 12, status: "contacted" }),
  getContactInquiriesForExport: vi
    .fn()
    .mockResolvedValue([
      {
        id: 12,
        name: "Amina",
        email: "amina@example.com",
        category: "general",
        message: "Hello",
        status: "new",
        createdAt: new Date("2026-08-24T00:00:00Z"),
      },
    ]),
  getContactInquiriesForExportWithAudit: vi
    .fn()
    .mockResolvedValue([
      {
        id: 12,
        name: "Amina",
        email: "amina@example.com",
        category: "general",
        message: "Hello",
        status: "new",
        assignedToName: null,
        createdAt: new Date("2026-08-24T00:00:00Z"),
        auditHistory: [],
      },
    ]),
  getContactInquiryCategoryCounts: vi
    .fn()
    .mockResolvedValue([{ category: "general", count: 3 }]),
  bulkUpdateContactInquiryStatus: vi.fn().mockResolvedValue(2),
  updateContactInquiryNotes: vi
    .fn()
    .mockResolvedValue({ id: 12, internalNotes: "Follow up next week" }),
  getAdminTeamMembers: vi
    .fn()
    .mockResolvedValue([
      { openId: "admin-2", name: "Team Member", email: "team@example.com" },
    ]),
  getContactInquiryAuditHistory: vi.fn().mockResolvedValue([]),
  updateContactInquiryAssignment: vi
    .fn()
    .mockResolvedValue({
      id: 12,
      assignedToOpenId: "admin-2",
      assignedToName: "Team Member",
    }),
  recordAnalyticsEvent: vi.fn().mockResolvedValue(undefined),
  listCourseLessonResponsesForStaff: vi
    .fn()
    .mockResolvedValue({
      rows: [],
      total: 0,
      page: 1,
      pageSize: 8,
      totalPages: 1,
    }),
  getCourseLessonReviewAnalytics: vi
    .fn()
    .mockResolvedValue({
      totalResponses: 0,
      reviewedResponses: 0,
      needsReviewResponses: 0,
      reviewRate: 0,
      byCourse: [],
      byModule: [],
    }),
  upsertCourseLessonResponseReview: vi.fn().mockResolvedValue({ saved: true }),
}));

vi.mock("./db", async importOriginal => ({
  ...(await importOriginal<typeof import("./db")>()),
  ...mocks,
}));
const { appRouter } = await import("./routers");

function publicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function staffContext(): TrpcContext {
  const now = new Date();
  return {
    user: {
      id: 2,
      openId: "staff-test",
      name: "Staff Test",
      email: "staff@example.com",
      loginMethod: "test",
      role: "staff",
      createdAt: now,
      updatedAt: now,
      lastSignedIn: now,
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function adminContext(): TrpcContext {
  const now = new Date();
  return {
    user: {
      id: 1,
      openId: "admin-test",
      name: "Admin Test",
      email: "admin@example.com",
      loginMethod: "test",
      role: "admin",
      createdAt: now,
      updatedAt: now,
      lastSignedIn: now,
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("inquiry.create", () => {
  beforeEach(() => {
    mocks.createContactInquiry.mockClear();
    mocks.listAssignedContactInquiries.mockClear();
    mocks.updateAssignedContactInquiryStatus.mockClear();
    mocks.updateAssignedContactInquiryNotes.mockClear();
    mocks.listContactInquiries.mockClear();
    mocks.updateContactInquiryStatus.mockClear();
    mocks.getAdminTeamMembers.mockClear();
    mocks.getContactInquiryAuditHistory.mockClear();
    mocks.updateContactInquiryAssignment.mockClear();
    mocks.getContactInquiriesForExport.mockClear();
    mocks.getContactInquiriesForExportWithAudit.mockClear();
    mocks.getContactInquiryCategoryCounts.mockClear();
    mocks.bulkUpdateContactInquiryStatus.mockClear();
    mocks.updateContactInquiryNotes.mockClear();
    mocks.recordAnalyticsEvent.mockClear();
    mocks.listCourseLessonResponsesForStaff.mockClear();
    mocks.getCourseLessonReviewAnalytics.mockClear();
    mocks.upsertCourseLessonResponseReview.mockClear();
  });
  it("persists the inquiry and records analytics", async () => {
    const result = await appRouter
      .createCaller(publicContext())
      .inquiry.create({
        name: "Amina Njeri",
        email: "amina@example.com",
        category: "organizational-development",
        message: "I would like to discuss leadership training for our team.",
        mathA: 7,
        mathB: 5,
        mathAnswer: 12,
      });
    expect(result).toEqual({ id: 27 });
    expect(mocks.createContactInquiry).toHaveBeenCalledWith({
      name: "Amina Njeri",
      email: "amina@example.com",
      category: "organizational-development",
      message: "I would like to discuss leadership training for our team.",
    });
    expect(mocks.recordAnalyticsEvent).toHaveBeenCalledWith({
      eventName: "contact_inquiry_submitted",
      userOpenId: undefined,
      metadata: { inquiryId: 27 },
    });
  });

  it("rejects messages that are too short", async () => {
    await expect(
      appRouter
        .createCaller(publicContext())
        .inquiry.create({
          name: "Amina Njeri",
          email: "amina@example.com",
          category: "general",
          message: "Help",
          mathA: 3,
          mathB: 4,
          mathAnswer: 7,
        })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("allows an administrator to filter and manage inquiry status", async () => {
    const caller = appRouter.createCaller(adminContext());
    await caller.admin.contactInquiries({
      page: 1,
      pageSize: 8,
      search: "amina",
      category: "general",
      status: "new",
      fromDate: "2026-08-01",
      toDate: "2026-08-24",
    });
    await caller.admin.updateContactInquiryStatus({
      id: 12,
      status: "contacted",
    });
    expect(mocks.listContactInquiries).toHaveBeenCalledWith({
      page: 1,
      pageSize: 8,
      search: "amina",
      category: "general",
      status: "new",
      assignedToOpenId: "all",
      fromDate: new Date("2026-08-01T00:00:00.000Z"),
      toDate: new Date("2026-08-24T23:59:59.999Z"),
    });
    expect(mocks.updateContactInquiryStatus).toHaveBeenCalledWith(
      12,
      "contacted",
      { openId: "admin-test", name: "Admin Test", email: "admin@example.com" }
    );
    await caller.admin.teamMembers();
    await caller.admin.contactInquiryAuditHistory({ inquiryId: 12 });
    await caller.admin.updateContactInquiryAssignment({
      id: 12,
      assignedToOpenId: "admin-2",
      assignedToName: "Team Member",
    });
    const exported = await caller.admin.exportContactInquiries({
      search: "amina",
      category: "general",
      status: "new",
    });
    expect(exported.data).toContain("Name");
    expect(mocks.getContactInquiriesForExportWithAudit).toHaveBeenCalledWith({
      search: "amina",
      category: "general",
      status: "new",
      assignedToOpenId: "all",
    });
    await caller.admin.bulkUpdateContactInquiryStatus({
      ids: [12, 13],
      status: "closed",
    });
    await caller.admin.updateContactInquiryNotes({
      id: 12,
      internalNotes: "Follow up next week",
    });
    await caller.admin.contactInquiryCategoryCounts();
    expect(mocks.bulkUpdateContactInquiryStatus).toHaveBeenCalledWith(
      [12, 13],
      "closed",
      { openId: "admin-test", name: "Admin Test", email: "admin@example.com" }
    );
    expect(mocks.updateContactInquiryNotes).toHaveBeenCalledWith(
      12,
      "Follow up next week",
      { openId: "admin-test", name: "Admin Test", email: "admin@example.com" }
    );
    expect(mocks.getAdminTeamMembers).toHaveBeenCalled();
    expect(mocks.getContactInquiryAuditHistory).toHaveBeenCalledWith(12);
    expect(mocks.updateContactInquiryAssignment).toHaveBeenCalledWith(
      12,
      { openId: "admin-2", name: "Team Member" },
      { openId: "admin-test", name: "Admin Test", email: "admin@example.com" }
    );
    expect(mocks.getContactInquiryCategoryCounts).toHaveBeenCalledWith(30);
  });

  it("allows staff to view and update only assigned inquiries", async () => {
    const caller = appRouter.createCaller(staffContext());
    await caller.staff.assignedInquiries({ search: "amina", status: "new" });
    await caller.staff.updateStatus({ id: 12, status: "contacted" });
    await caller.staff.updateNotes({ id: 12, internalNotes: "Follow up" });
    expect(mocks.listAssignedContactInquiries).toHaveBeenCalledWith(
      "staff-test",
      expect.objectContaining({ search: "amina", status: "new" })
    );
    expect(mocks.updateAssignedContactInquiryStatus).toHaveBeenCalledWith(
      12,
      "staff-test",
      "contacted",
      expect.objectContaining({ openId: "staff-test" })
    );
    expect(mocks.updateAssignedContactInquiryNotes).toHaveBeenCalledWith(
      12,
      "staff-test",
      "Follow up",
      expect.objectContaining({ openId: "staff-test" })
    );
  });

  it("allows staff to review learner responses and forwards reviewer identity", async () => {
    const caller = appRouter.createCaller(staffContext());
    await caller.staff.lessonResponses({
      page: 1,
      pageSize: 8,
      reviewStatus: "needs-review",
      courseSlug: "leadership",
      fromDate: "2026-08-01",
      toDate: "2026-08-24",
    });
    await caller.staff.reviewAnalytics({
      courseSlug: "leadership",
      fromDate: "2026-08-01",
      toDate: "2026-08-24",
    });
    await caller.staff.reviewLessonResponse({
      responseId: 21,
      enrollmentId: 9,
      lessonId: "module-1-lesson-1",
      taskId: "notice",
      feedback: "Connect this observation to one measurable next step.",
      status: "reviewed",
    });
    expect(mocks.listCourseLessonResponsesForStaff).toHaveBeenCalledWith({
      page: 1,
      pageSize: 8,
      reviewStatus: "needs-review",
      courseSlug: "leadership",
      fromDate: new Date("2026-08-01T00:00:00.000Z"),
      toDate: new Date("2026-08-24T23:59:59.999Z"),
    });
    expect(mocks.getCourseLessonReviewAnalytics).toHaveBeenCalledWith({
      courseSlug: "leadership",
      fromDate: new Date("2026-08-01T00:00:00.000Z"),
      toDate: new Date("2026-08-24T23:59:59.999Z"),
    });
    expect(mocks.upsertCourseLessonResponseReview).toHaveBeenCalledWith({
      responseId: 21,
      enrollmentId: 9,
      lessonId: "module-1-lesson-1",
      taskId: "notice",
      feedback: "Connect this observation to one measurable next step.",
      status: "reviewed",
      reviewerOpenId: "staff-test",
      reviewerName: "Staff Test",
    });
  });

  it("rejects regular users from the staff workspace", async () => {
    const now = new Date();
    const userContext = {
      user: {
        id: 3,
        openId: "user-test",
        name: "User Test",
        email: "user@example.com",
        loginMethod: "test",
        role: "user",
        createdAt: now,
        updatedAt: now,
        lastSignedIn: now,
      },
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    await expect(
      appRouter.createCaller(userContext).staff.assignedInquiries()
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(
      appRouter.createCaller(userContext).staff.lessonResponses()
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(
      appRouter
        .createCaller(userContext)
        .staff.reviewLessonResponse({
          responseId: 21,
          enrollmentId: 9,
          lessonId: "module-1-lesson-1",
          taskId: "notice",
          feedback: "Feedback",
          status: "reviewed",
        })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects an incorrect math answer before persistence", async () => {
    await expect(
      appRouter
        .createCaller(publicContext())
        .inquiry.create({
          name: "Amina Njeri",
          email: "amina@example.com",
          category: "general",
          message: "Please send more information about your services.",
          mathA: 3,
          mathB: 4,
          mathAnswer: 8,
        })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mocks.createContactInquiry).not.toHaveBeenCalled();
  });
});

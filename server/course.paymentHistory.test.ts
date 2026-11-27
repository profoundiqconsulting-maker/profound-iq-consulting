import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({ listCoursePaymentHistoryPage: vi.fn() }));

vi.mock("./db", async importOriginal => ({
  ...(await importOriginal<typeof import("./db")>()),
  listCoursePaymentHistoryPage: mocks.listCoursePaymentHistoryPage,
}));

const { appRouter } = await import("./routers");

function context(user: TrpcContext["user"]): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("course.paymentHistory pagination", () => {
  beforeEach(() => vi.clearAllMocks());

  it("forwards bounded filters and UTC date boundaries to the learner-owned database helper", async () => {
    const now = new Date("2026-08-26T12:00:00.000Z");
    const user = {
      id: 9,
      openId: "learner-payment-history",
      name: "Learner",
      email: "learner@example.com",
      loginMethod: "test",
      role: "user" as const,
      createdAt: now,
      updatedAt: now,
      lastSignedIn: now,
    };
    const page = {
      rows: [],
      total: 0,
      page: 2,
      pageSize: 15,
      pageCount: 1,
      paidTotal: 0,
      pendingTotal: 0,
    };
    mocks.listCoursePaymentHistoryPage.mockResolvedValueOnce(page);

    const result = await appRouter
      .createCaller(context(user))
      .course.paymentHistory({
        page: 2,
        pageSize: 15,
        courseSlug: "lead-with-clarity",
        stage: 2,
        status: "paid",
        from: "2026-08-01",
        to: "2026-08-31",
        sort: "amount-desc",
      });

    expect(mocks.listCoursePaymentHistoryPage).toHaveBeenCalledWith(
      "learner-payment-history",
      {
        page: 2,
        pageSize: 15,
        courseSlug: "lead-with-clarity",
        stage: 2,
        status: "paid",
        from: new Date("2026-08-01T00:00:00.000Z"),
        to: new Date("2026-08-31T23:59:59.999Z"),
        sort: "amount-desc",
      }
    );
    expect(result).toEqual(page);
  });

  it("normalizes the UI all-course sentinel before querying the server", async () => {
    const now = new Date("2026-08-26T12:00:00.000Z");
    const user = {
      id: 10,
      openId: "learner-all-courses",
      name: "Learner",
      email: "learner@example.com",
      loginMethod: "test",
      role: "user" as const,
      createdAt: now,
      updatedAt: now,
      lastSignedIn: now,
    };
    mocks.listCoursePaymentHistoryPage.mockResolvedValueOnce({
      rows: [],
      total: 0,
      page: 1,
      pageSize: 10,
      pageCount: 1,
      paidTotal: 0,
      pendingTotal: 0,
    });

    await appRouter.createCaller(context(user)).course.paymentHistory({
      page: 1,
      pageSize: 10,
      courseSlug: "all",
      sort: "date-desc",
    });

    expect(mocks.listCoursePaymentHistoryPage).toHaveBeenCalledWith(
      "learner-all-courses",
      expect.objectContaining({
        courseSlug: undefined,
        stage: undefined,
        status: undefined,
        from: undefined,
        to: undefined,
      })
    );
  });

  it("requires an authenticated learner", async () => {
    await expect(
      appRouter
        .createCaller(context(null))
        .course.paymentHistory({ page: 1, pageSize: 10, sort: "date-desc" })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(mocks.listCoursePaymentHistoryPage).not.toHaveBeenCalled();
  });
});

import { describe, expect, it } from "vitest";
import { filterAndSortPaymentHistory, flattenPaymentHistory, type PaymentHistoryRecord } from "./paymentHistory";

const records: PaymentHistoryRecord[] = [
  { enrollment: { id: 2, name: "A", email: "a@example.com", courseSlug: "beta", updatedAt: "2026-02-01T00:00:00.000Z" }, stages: [
    { id: 21, stage: 1, amountKes: 1250, paymentStatus: "paid", paidAt: "2026-02-02T10:00:00.000Z", paystackReference: "ref-beta-1" },
    { id: 22, stage: 2, amountKes: 1250, paymentStatus: "pending", paidAt: null },
  ] },
  { enrollment: { id: 1, name: "B", email: "b@example.com", courseSlug: "alpha", updatedAt: "2026-03-01T00:00:00.000Z" }, stages: [
    { id: 11, stage: 1, amountKes: 2000, paymentStatus: "paid", paidAt: "2026-03-03T10:00:00.000Z", paystackReference: "ref-alpha-1" },
  ] },
];

const defaults = { courseSlug: "all", stage: "all", status: "all", from: "", to: "", sort: "date-desc" as const };

describe("payment history projections", () => {
  it("flattens each staged payment and falls back to enrollment date", () => {
    const rows = flattenPaymentHistory(records);
    expect(rows).toHaveLength(3);
    expect(rows.find((row) => row.id === 22)?.transactionDate).toBe("2026-02-01T00:00:00.000Z");
  });

  it("filters by course, stage, status, and inclusive UTC date range", () => {
    const rows = filterAndSortPaymentHistory(flattenPaymentHistory(records), { ...defaults, courseSlug: "alpha", status: "paid", from: "2026-03-03", to: "2026-03-03" });
    expect(rows.map((row) => row.id)).toEqual([11]);
    expect(filterAndSortPaymentHistory(flattenPaymentHistory(records), { ...defaults, stage: "2", status: "pending" }).map((row) => row.id)).toEqual([22]);
  });

  it("sorts deterministically by amount and transaction date", () => {
    const transactions = flattenPaymentHistory(records);
    expect(filterAndSortPaymentHistory(transactions, { ...defaults, sort: "amount-desc" }).map((row) => row.id)).toEqual([11, 21, 22]);
    expect(filterAndSortPaymentHistory(transactions, { ...defaults, sort: "date-asc" }).map((row) => row.id)).toEqual([22, 21, 11]);
    expect(filterAndSortPaymentHistory(transactions, { ...defaults, sort: "course-asc" }).map((row) => row.courseSlug)).toEqual(["alpha", "beta", "beta"]);
  });
});

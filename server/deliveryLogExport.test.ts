import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  claimNextDeliveryLogExportJob: vi.fn(),
  completeDeliveryLogExportJob: vi.fn(),
  failDeliveryLogExportJob: vi.fn(),
  getEmailPreviewDeliveriesForExport: vi.fn(),
  storagePut: vi.fn(),
}));

vi.mock("./db", () => ({
  claimNextDeliveryLogExportJob: mocks.claimNextDeliveryLogExportJob,
  completeDeliveryLogExportJob: mocks.completeDeliveryLogExportJob,
  failDeliveryLogExportJob: mocks.failDeliveryLogExportJob,
  getEmailPreviewDeliveriesForExport: mocks.getEmailPreviewDeliveriesForExport,
  getScheduledExport: vi.fn(),
}));
vi.mock("./storage", () => ({ storagePut: mocks.storagePut }));

const { processNextDeliveryLogExportJob } = await import("./deliveryLogExport");

describe("delivery log export worker", () => {
  beforeEach(() => vi.clearAllMocks());

  it("claims, serializes, uploads, and completes one job", async () => {
    mocks.claimNextDeliveryLogExportJob.mockResolvedValue({ id: 7, filters: { status: "sent" } });
    mocks.getEmailPreviewDeliveriesForExport.mockResolvedValue([{ id: 1, templateKey: "assessment_report", recipientEmail: "admin@example.com", subject: "Preview", status: "sent", errorMessage: null, createdAt: new Date("2026-08-22T09:00:00.000Z") }]);
    mocks.storagePut.mockResolvedValue({ key: "delivery-log-exports/7.csv", url: "/manus-storage/delivery-log-exports/7.csv" });
    mocks.completeDeliveryLogExportJob.mockResolvedValue({ id: 7, status: "completed" });

    const result = await processNextDeliveryLogExportJob();

    expect(mocks.storagePut).toHaveBeenCalledWith(expect.stringContaining("delivery-log-exports/delivery-log-7-"), expect.stringContaining("Recipient"), "text/csv;charset=utf-8");
    expect(mocks.completeDeliveryLogExportJob).toHaveBeenCalledWith(7, { fileKey: "delivery-log-exports/7.csv", fileUrl: "/manus-storage/delivery-log-exports/7.csv", rowCount: 1 });
    expect(result).toEqual({ processed: true, job: { id: 7, status: "completed" } });
  });

  it("records a failed job without throwing", async () => {
    mocks.claimNextDeliveryLogExportJob.mockResolvedValue({ id: 8, filters: {} });
    mocks.getEmailPreviewDeliveriesForExport.mockRejectedValue(new Error("Database unavailable"));
    const result = await processNextDeliveryLogExportJob();
    expect(mocks.failDeliveryLogExportJob).toHaveBeenCalledWith(8, "Database unavailable");
    expect(result).toEqual({ processed: true, failed: true, jobId: 8, error: "Database unavailable" });
  });
});

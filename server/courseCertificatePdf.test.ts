import { describe, expect, it } from "vitest";
import { renderCourseCertificatePdf } from "./courseCertificate";

describe("course certificate PDF", () => {
  it("renders a non-empty PDF from the branded certificate SVG", async () => {
    const pdf = await renderCourseCertificatePdf({
      recipientName: "Amina Njeri",
      courseTitle: "Leadership and Strategic Growth",
      certificateNumber: "PIQ-2026-QA-0001",
      issuedOn: "2026-08-27T08:00:00.000Z",
      verificationUrl:
        "http://localhost:3000/verify/certificate?certificate=PIQ-2026-QA-0001",
    });
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(pdf.length).toBeGreaterThan(10_000);
  }, 30_000);
});

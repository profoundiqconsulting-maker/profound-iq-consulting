import { describe, expect, it } from "vitest";
import { renderCourseCertificateSvg } from "./courseCertificate";

describe("course certificate renderer", () => {
  it("embeds the managed logo as a base64 data URI and includes verified certificate fields", () => {
    const svg = renderCourseCertificateSvg({
      recipientName: "Amina Njeri",
      recipientEmail: "amina@example.com",
      courseTitle: "Professional Certificate in International Curriculum Pedagogy",
      certificateNumber: "PIQ-2026-ABC123",
      issuedOn: "2026-08-27T08:00:00.000Z",
      verificationUrl: "https://profoundiq-vguqrhsm.manus.space/verify/certificate?certificate=PIQ-2026-ABC123",
    });
    expect(svg).toContain('data:image/jpeg;base64,');
    expect(svg).toContain("Amina Njeri");
    expect(svg).toContain("amina@example.com");
    expect(svg).toContain("Professional Certificate in International Curriculum Pedagogy");
    expect(svg).toContain("PIQ-2026-ABC123");
    expect(svg).toContain("https://profoundiq-vguqrhsm.manus.space/verify/certificate");
    expect(svg).toContain("CERTIFICATE ISSUED ON:");
    expect(svg).toContain("CERTIFICATE ID:");
  });

  it("escapes learner-controlled fields while keeping the QR verification payload", () => {
    const svg = renderCourseCertificateSvg({
      recipientName: "Ada <Admin>",
      courseTitle: "Growth & Strategy",
      certificateNumber: "PIQ-2026-ESCAPE",
      issuedOn: "2026-08-27T08:00:00.000Z",
    });
    expect(svg).toContain("Ada &lt;Admin&gt;");
    expect(svg).not.toContain("<text x=\"1000\" y=\"825\" text-anchor=\"middle\" fill=\"#111827\" font-family=\"Arial,sans-serif\" font-size=\"34\" font-weight=\"700\">Ada <Admin>");
    expect(svg).toContain("SCAN TO VERIFY");
    expect(svg).toContain("PIQ-2026-ESCAPE");
  });
});

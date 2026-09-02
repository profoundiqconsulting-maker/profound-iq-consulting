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
      verificationUrl: "http://localhost:3000/verify/certificate?certificate=PIQ-2026-ABC123",
    });
    expect(svg).toContain('data:image/png;base64,');
    expect(svg).toContain("Amina Njeri");
    expect(svg).not.toContain("amina@example.com");
    expect(svg).toContain("proudly awarded to");
    expect(svg).toContain("for successfully completing the course");
    expect(svg).toContain("Professional Certificate in International Curriculum Pedagogy");
    expect(svg).toContain("PIQ-2026-ABC123");
    expect(svg).toContain("http://localhost:3000/verify/certificate");
    expect(svg).toContain("CERTIFICATE ISSUED ON:");
    expect(svg).toContain("CERTIFICATE ID:");
    expect(svg).toContain('data:image/png;base64,');
    expect(svg).toContain("Managing Director");
  });

  it("applies custom trainer settings and signature data", () => {
    const svg = renderCourseCertificateSvg({ recipientName: "Amina Njeri", courseTitle: "Leadership Essentials", certificateNumber: "PIQ-2026-CUSTOM", issuedOn: "2026-08-27T08:00:00.000Z", trainerName: "Dr. Grace Wambui", trainerTitle: "Lead Facilitator", signatureDataUri: "data:image/png;base64,QUJD" });
    expect(svg).toContain("Dr. Grace Wambui");
    expect(svg).toContain("Lead Facilitator");
    expect(svg).toContain("data:image/png;base64,QUJD");
  });

  it("applies the saved field layout to future certificate generations", () => {
    const svg = renderCourseCertificateSvg({ recipientName: "Amina Njeri", courseTitle: "Leadership Essentials", certificateNumber: "PIQ-2026-LAYOUT", issuedOn: "2026-08-27T08:00:00.000Z", fieldLayout: { recipient: { x: 1111, y: 777, text: "Amina Njeri · revised" }, trainerTitle: { visible: false } } });
    expect(svg).toContain('data-field="recipient" x="1111" y="777"');
    expect(svg).toContain("Amina Njeri · revised");
    expect(svg).toContain('<text display="none" data-field="trainerTitle"');
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

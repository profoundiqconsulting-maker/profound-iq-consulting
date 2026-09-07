import { describe, expect, it } from "vitest";
import {
  formatReportEmailSentAt,
  getReportEmailStatusLabel,
} from "./emailStatus";

describe("report email status helpers", () => {
  it("formats a valid sent timestamp for the dashboard", () => {
    expect(formatReportEmailSentAt("2026-08-22T06:28:54Z")).toBeTruthy();
    expect(formatReportEmailSentAt(null)).toBeNull();
    expect(formatReportEmailSentAt("not-a-date")).toBeNull();
  });

  it("keeps non-sent status labels explicit", () => {
    expect(getReportEmailStatusLabel("sent")).toBe("Email sent");
    expect(getReportEmailStatusLabel("sending")).toBe("Email in progress");
    expect(getReportEmailStatusLabel("pending")).toBe("Email pending");
  });
});

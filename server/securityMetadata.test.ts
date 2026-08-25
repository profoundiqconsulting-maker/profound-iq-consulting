import { describe, expect, it } from "vitest";
import { buildSecurityLogCsv, classifyDevice, getEstimatedLocation, getRequestSecurityMetadata } from "./securityMetadata";

describe("security metadata", () => {
  it("classifies common device families without exposing raw user agents", () => {
    expect(classifyDevice("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile")).toBe("mobile");
    expect(classifyDevice("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)")).toBe("tablet");
    expect(classifyDevice("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36")).toBe("desktop");
    expect(classifyDevice(null)).toBe("unknown");
  });

  it("uses coarse country headers only for estimated location", () => {
    expect(getEstimatedLocation({ headers: { "cf-ipcountry": "ke,ignored" }, ip: "198.51.100.10", socket: {} as never })).toBe("KE");
    expect(getEstimatedLocation({ headers: { "x-vercel-ip-country": "gb" }, ip: "198.51.100.10", socket: {} as never })).toBe("GB");
    expect(getEstimatedLocation({ headers: {}, ip: "198.51.100.10", socket: {} as never })).toBeNull();
  });

  it("hashes the network address while returning safe display metadata", () => {
    const metadata = getRequestSecurityMetadata({ headers: { "x-forwarded-for": "198.51.100.10", "user-agent": "Browser/1.0", "cf-ipcountry": "KE" }, ip: "127.0.0.1", socket: {} as never });
    expect(metadata.networkHash).toHaveLength(64);
    expect(metadata.networkHash).not.toContain("198.51.100.10");
    expect(metadata.networkAddress).toBe("198.51.100.10");
    expect(metadata.deviceType).toBe("desktop");
    expect(metadata.estimatedLocation).toBe("KE");
    expect(metadata.userAgent).toBe("Browser/1.0");
  });

  it("serializes security logs with safe CSV escaping", () => {
    const csv = buildSecurityLogCsv([{ id: 1, openId: "local_1", identifierType: "email", success: false, failureCode: "invalid_credentials", networkAddress: "198.51.100.10", networkHash: "hash", userAgent: 'Browser, "test"', createdAt: new Date("2026-08-22T00:00:00.000Z") }]);
    expect(csv).toContain("event_id,user_open_id,identifier_type,success,failure_code,network_address,network_hash,user_agent,created_at");
    expect(csv).toContain('"Browser, ""test"""');
    expect(csv).toContain("198.51.100.10");
  });
});

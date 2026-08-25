import type { Request } from "express";
import { hashRateLimitKey } from "./localAuthCrypto";

const MAX_USER_AGENT_LENGTH = 512;

export function classifyDevice(userAgent: string | null | undefined) {
  const value = (userAgent ?? "").toLowerCase();
  if (!value) return "unknown" as const;
  if (/ipad|tablet|android(?!.*mobile)/.test(value)) return "tablet" as const;
  if (/mobile|iphone|ipod|android/.test(value)) return "mobile" as const;
  return "desktop" as const;
}

export function getEstimatedLocation(req: Pick<Request, "headers" | "ip" | "socket">) {
  const headerValue = (name: string) => {
    const value = req.headers[name];
    return typeof value === "string" ? value.split(",")[0]?.trim().slice(0, 2).toUpperCase() : "";
  };
  const country = headerValue("cf-ipcountry") || headerValue("x-vercel-ip-country") || headerValue("x-country-code");
  return country && /^[A-Z]{2}$/.test(country) ? country : null;
}

export function getRequestSecurityMetadata(req: Pick<Request, "headers" | "ip" | "socket">) {
  const forwarded = req.headers["x-forwarded-for"];
  const networkAddress = typeof forwarded === "string" ? forwarded.split(",")[0]?.trim() : req.ip ?? req.socket?.remoteAddress ?? "unknown";
  const userAgent = typeof req.headers["user-agent"] === "string" ? req.headers["user-agent"].slice(0, MAX_USER_AGENT_LENGTH) : null;
  return {
    networkHash: hashRateLimitKey(networkAddress || "unknown"),
    networkAddress: networkAddress || null,
    userAgent,
    deviceType: classifyDevice(userAgent),
    estimatedLocation: getEstimatedLocation(req),
  };
}

type LoginEventForExport = {
  id: number;
  openId: string | null;
  identifierType: string;
  success: boolean;
  failureCode: string | null;
  networkHash: string;
  networkAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
};

function escapeCsv(value: unknown) {
  const text = value instanceof Date ? value.toISOString() : String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function buildSecurityLogCsv(rows: LoginEventForExport[]) {
  const header = ["event_id", "user_open_id", "identifier_type", "success", "failure_code", "network_address", "network_hash", "user_agent", "created_at"];
  const lines = rows.map((row) => [row.id, row.openId, row.identifierType, row.success ? "success" : "failed", row.failureCode, row.networkAddress, row.networkHash, row.userAgent, row.createdAt].map(escapeCsv).join(","));
  return [header.join(","), ...lines].join("\n") + "\n";
}

export type { LoginEventForExport };

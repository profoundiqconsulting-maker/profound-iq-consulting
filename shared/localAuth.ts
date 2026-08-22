import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export const identifierSchema = /^(?:[^\s@]+@[^\s@]+\.[^\s@]+|\+?[0-9][0-9\s().-]{6,}|[a-zA-Z0-9_][a-zA-Z0-9_.-]{2,39})$/;

export function normalizeIdentifier(value: string) {
  const trimmed = value.trim();
  return trimmed.includes("@") ? trimmed.toLowerCase() : trimmed.replace(/[\s().-]/g, "").toLowerCase();
}

export function validatePassword(password: string) {
  return password.length >= 10 && password.length <= 128 && /[A-Za-z]/.test(password) && /\d/.test(password);
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

export function verifyPassword(password: string, encoded: string) {
  const [algorithm, salt, expectedHex] = encoded.split("$");
  if (algorithm !== "scrypt" || !salt || !expectedHex) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");
  return expected.length === actual.length && timingSafeEqual(actual, expected);
}

export function createResetToken() {
  const raw = randomBytes(32).toString("hex");
  return { raw, hash: createHash("sha256").update(raw).digest("hex") };
}

export function hashResetToken(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

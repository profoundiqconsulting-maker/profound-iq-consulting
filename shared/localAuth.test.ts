import { describe, expect, it } from "vitest";
import { normalizeIdentifier, passwordStrength, validatePassword } from "./localAuth";
import { createResetToken, hashPassword, hashRateLimitKey, hashResetToken, verifyPassword } from "../server/localAuthCrypto";

describe("local credential authentication", () => {
  it("normalizes supported identifiers", () => {
    expect(normalizeIdentifier(" User.Name@Example.COM ")).toBe("user.name@example.com");
    expect(normalizeIdentifier("+254 727-374-055")).toBe("+254727374055");
    expect(normalizeIdentifier("  Amina_User ")).toBe("amina_user");
  });

  it("hashes passwords with a salted one-way encoding", () => {
    const first = hashPassword("securePassword123");
    const second = hashPassword("securePassword123");
    expect(first).not.toBe(second);
    expect(verifyPassword("securePassword123", first)).toBe(true);
    expect(verifyPassword("wrongPassword123", first)).toBe(false);
  });

  it("scores password strength and creates verifiable reset tokens", () => {
    expect(passwordStrength("")).toBe(0);
    expect(passwordStrength("long-enough-password-1")).toBe(4);
    expect(passwordStrength("StrongPassword123!")).toBe(5);
    expect(validatePassword("short1")).toBe(false);
    expect(validatePassword("long-enough-password-1")).toBe(true);
    expect(validatePassword("StrongPassword123!")).toBe(true);
    const token = createResetToken();
    expect(token.raw).not.toBe(token.hash);
    expect(hashResetToken(token.raw)).toBe(token.hash);
    expect(hashRateLimitKey("amina@example.com")).toHaveLength(64);
  });
});

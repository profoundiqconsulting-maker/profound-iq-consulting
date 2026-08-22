import { describe, expect, it } from "vitest";
import { createResetToken, hashPassword, hashResetToken, normalizeIdentifier, validatePassword, verifyPassword } from "./localAuth";

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

  it("requires a strong password and creates verifiable reset tokens", () => {
    expect(validatePassword("short1")).toBe(false);
    expect(validatePassword("long-enough-password-1")).toBe(true);
    const token = createResetToken();
    expect(token.raw).not.toBe(token.hash);
    expect(hashResetToken(token.raw)).toBe(token.hash);
  });
});

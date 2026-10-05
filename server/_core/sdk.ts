import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { parseCookie } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import { hashRateLimitKey } from "../localAuthCrypto";
import { getRequestSecurityMetadata } from "../securityMetadata";
import * as db from "../db";
import { ENV } from "./env";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

export type SessionPayload = {
  openId: string;
  name: string;
};

/**
 * Extended user type for request context.
 * Includes optional cron/task properties for scheduled job compatibility.
 */
export type AuthenticatedUser = User & {
  isCron?: boolean;
  taskUid?: string;
};

/**
 * Self-hosted session management using JWT tokens.
 * Session tokens are created during login/registration and stored as httpOnly cookies.
 */
class SessionManager {
  private getSessionSecret(): Uint8Array {
    if (!ENV.sessionSecret) {
      throw new Error(
        "SESSION_SECRET environment variable is not configured. Generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
      );
    }
    return new TextEncoder().encode(ENV.sessionSecret);
  }

  /**
   * Create a session JWT token for a user.
   * @param openId Unique user identifier
   * @param options Configuration options
   */
  async createSessionToken(
    openId: string,
    options: { expiresInMs?: number; name?: string } = {}
  ): Promise<string> {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);
    const secretKey = this.getSessionSecret();

    return new SignJWT({
      openId,
      name: options.name || "",
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt(Math.floor(issuedAt / 1000))
      .setExpirationTime(expirationSeconds)
      .sign(secretKey);
  }

  /**
   * Verify a session JWT token and extract the payload.
   * @param cookieValue The JWT token from the session cookie
   */
  async verifySession(
    cookieValue: string | undefined | null
  ): Promise<SessionPayload | null> {
    if (!cookieValue) {
      return null;
    }

    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"],
      });
      const { openId, name } = payload as Record<string, unknown>;

      if (!isNonEmptyString(openId)) {
        console.warn("[Auth] Session payload missing openId");
        return null;
      }

      return {
        openId,
        name: isNonEmptyString(name) ? name : "",
      };
    } catch (error) {
      console.debug("[Auth] Session verification failed", String(error));
      return null;
    }
  }

  /**
   * Authenticate a request by reading and verifying the session cookie.
   * Returns the user from the database if the session is valid.
   */
  async authenticateRequest(req: Request): Promise<AuthenticatedUser | null> {
    // 1. Prefer the session cookie
    const cookies = this.parseCookies(req.headers.cookie);
    let sessionToken = cookies.get(COOKIE_NAME);

    // 2. Fallback to the Authorization header (Bearer token)
    if (!sessionToken) {
      const authHeader = req.headers.authorization;
      if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        sessionToken = authHeader.slice(7);
      }
    }

    const session = await this.verifySession(sessionToken);
    if (!session) {
      return null;
    }

    // Load user from database
    const user = await db.getUserByOpenId(session.openId);
    if (!user) {
      console.warn("[Auth] User not found in database:", session.openId);
      return null;
    }

    // Update last signed in time and session activity
    const signedInAt = new Date();
    const tokenHash = hashRateLimitKey(sessionToken ?? "");

    try {
      // Update user's last signed in timestamp
      await db.upsertUser({
        openId: user.openId,
        lastSignedIn: signedInAt,
      });

      // Update or create session record for audit trail
      const existingSession = await db.getSessionByTokenHash(tokenHash);
      if (existingSession) {
        if (existingSession.expiresAt.getTime() < signedInAt.getTime()) {
          // Session expired
          return null;
        }
        if (!existingSession.revokedAt) {
          // Touch the session to update last seen
          await db.touchUserSession(existingSession.id, signedInAt);
        } else {
          // Session was revoked
          return null;
        }
      }
    } catch (error) {
      console.error("[Auth] Error updating session:", error);
      // Don't fail authentication if we can't update the session record
    }

    return user as AuthenticatedUser;
  }

  private parseCookies(cookieHeader: string | undefined): Map<string, string> {
    if (!cookieHeader) {
      return new Map();
    }
    const parsed = parseCookie(cookieHeader);
    return new Map(Object.entries(parsed));
  }
}

export const sdk = new SessionManager();

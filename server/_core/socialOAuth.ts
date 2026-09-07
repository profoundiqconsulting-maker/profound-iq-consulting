import crypto from "node:crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";
import type { Express, Request, Response } from "express";
import { parse as parseCookie } from "cookie";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { findUserByLocalIdentifier, upsertUser } from "../db";
import { ENV } from "./env";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

const STATE_COOKIE = "__Host-social_oauth_state";
const providers = {
  google: { authorization: "https://accounts.google.com/o/oauth2/v2/auth", token: "https://oauth2.googleapis.com/token", userinfo: "https://openidconnect.googleapis.com/v1/userinfo", issuer: ["https://accounts.google.com", "accounts.google.com"] as string[], clientId: () => ENV.googleOAuthClientId, clientSecret: () => ENV.googleOAuthClientSecret, jwks: createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs")) },
  linkedin: { authorization: "https://www.linkedin.com/oauth/v2/authorization", token: "https://www.linkedin.com/oauth/v2/accessToken", userinfo: "https://api.linkedin.com/v2/userinfo", issuer: ["https://www.linkedin.com/oauth"] as string[], clientId: () => ENV.linkedinOAuthClientId, clientSecret: () => ENV.linkedinOAuthClientSecret, jwks: createRemoteJWKSet(new URL("https://www.linkedin.com/oauth/openid/jwks")) },
} as const;
type Provider = keyof typeof providers;

function getParam(req: Request, key: string) { const value = req.query[key]; return typeof value === "string" ? value : undefined; }
function encodeState(value: { provider: Provider; nonce: string; origin: string; returnTo?: string }) { return Buffer.from(JSON.stringify(value), "utf8").toString("base64url"); }
function decodeState(value: string | undefined) { try { return value ? JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as { provider?: Provider; nonce?: string; origin?: string; returnTo?: string } : {}; } catch { return {}; } }
function safeOrigin(value: string | undefined) { try { const url = new URL(value || ""); return url.protocol === "https:" || (url.protocol === "http:" && url.hostname === "localhost") ? url.origin : null; } catch { return null; } }
function safeReturnTo(value: string | undefined) { return value && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") ? value : "/"; }
function redirectError(res: Response, origin: string | null, message: string) { res.redirect(`${origin ?? ""}/auth?error=${encodeURIComponent(message)}`); }

export function socialOAuthRedirectUri(provider: Provider, origin: string) { return `${origin}/api/oauth/${provider}/callback`; }

export function buildSocialAuthorizationUrl(provider: Provider, origin: string, state: string, nonce: string) {
  const config = providers[provider];
  const url = new URL(config.authorization);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", config.clientId());
  url.searchParams.set("redirect_uri", socialOAuthRedirectUri(provider, origin));
  url.searchParams.set("scope", "openid profile email");
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  return url.toString();
}

export function registerSocialOAuthRoutes(app: Express) {
  (Object.keys(providers) as Provider[]).forEach((provider) => {
    app.get(`/api/oauth/${provider}/start`, (req, res) => {
      const config = providers[provider];
      const origin = safeOrigin(getParam(req, "origin"));
      const returnTo = safeReturnTo(getParam(req, "returnTo"));
      if (!origin || !config.clientId() || !config.clientSecret()) { redirectError(res, origin, `${provider}_not_configured`); return; }
      const nonce = crypto.randomBytes(32).toString("base64url");
      const state = encodeState({ provider, nonce, origin, returnTo });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(STATE_COOKIE, `${provider}.${nonce}`, { httpOnly: true, ...cookieOptions, path: "/", maxAge: 600000 });
      res.redirect(buildSocialAuthorizationUrl(provider, origin, state, nonce));
    });

    app.get(`/api/oauth/${provider}/callback`, async (req, res) => {
      const code = getParam(req, "code"); const stateValue = getParam(req, "state"); const state = decodeState(stateValue); const origin = safeOrigin(state.origin); const cookie = parseCookie(req.headers.cookie ?? "")[STATE_COOKIE];
      if (!code || state.provider !== provider || !state.nonce || cookie !== `${provider}.${state.nonce}` || !origin) { redirectError(res, origin, "invalid_social_oauth_state"); return; }
      const cookieOptions = getSessionCookieOptions(req);
      res.clearCookie(STATE_COOKIE, { ...cookieOptions, path: "/" });
      const config = providers[provider];
      try {
        const redirectUri = socialOAuthRedirectUri(provider, origin);
        const tokenResponse = await fetch(config.token, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "authorization_code", code, client_id: config.clientId(), client_secret: config.clientSecret(), redirect_uri: redirectUri }) });
        if (!tokenResponse.ok) throw new Error(`Provider token exchange failed (${tokenResponse.status})`);
        const tokens = await tokenResponse.json() as { access_token?: string; id_token?: string };
        if (!tokens.access_token || !tokens.id_token) throw new Error("Provider did not return required identity tokens");
        const verified = await jwtVerify(tokens.id_token, config.jwks as any, { issuer: config.issuer as string[], audience: config.clientId() }); if (verified.payload.nonce !== state.nonce) throw new Error("Provider nonce validation failed");
        const profileResponse = await fetch(config.userinfo, { headers: { authorization: `Bearer ${tokens.access_token}` } });
        if (!profileResponse.ok) throw new Error(`Provider profile request failed (${profileResponse.status})`);
        const profile = await profileResponse.json() as { sub?: string; name?: string; email?: string; email_verified?: boolean; picture?: string };
        if (!profile.sub) throw new Error("Provider profile is missing a stable subject");
        const normalizedEmail = profile.email_verified === true && profile.email ? profile.email.trim().toLowerCase() : undefined;
        let existing;
        try { existing = normalizedEmail ? await findUserByLocalIdentifier(normalizedEmail) : undefined; } catch { existing = undefined; }
        const openId = existing?.openId ?? `social:${provider}:${profile.sub}`;
        try {
          await upsertUser({ openId, name: profile.name || existing?.name || `${provider} user`, email: normalizedEmail || existing?.email || null, loginMethod: provider, avatarUrl: profile.picture || existing?.avatarUrl || null, lastSignedIn: new Date() });
        } catch (error) {
          const raw = error instanceof Error ? error : new Error(String(error));
          let duplicateMessage: string | undefined;
          let code: string | undefined;
          let errno: number | undefined;
          let current: unknown = raw;
          for (let depth = 0; depth < 10 && current; depth++) {
            if (current instanceof Error) {
              const err = current as any;
              const msg = (err.message || "").toLowerCase();
              if (!duplicateMessage && (msg.includes("duplicate") || msg.includes("unique") || msg.includes("constraint"))) duplicateMessage = msg;
              if (!code && err.code) code = String(err.code);
              if (!errno && typeof err.errno === "number") errno = err.errno;
              current = err.cause;
            } else {
              break;
            }
          }
          const isDuplicate = Boolean(duplicateMessage) || code === "ER_DUP_ENTRY" || errno === 1062;
          if (isDuplicate) {
            const fallbackOpenId = existing?.openId ?? `social:${provider}:${profile.sub}`;
            if (fallbackOpenId !== openId) {
              await upsertUser({ openId: fallbackOpenId, name: profile.name || existing?.name || `${provider} user`, email: normalizedEmail || existing?.email || null, loginMethod: provider, avatarUrl: profile.picture || existing?.avatarUrl || null, lastSignedIn: new Date() });
            } else {
              throw error;
            }
          } else {
            throw error;
          }
        }
        const sessionToken = await sdk.createSessionToken(openId, { name: profile.name || existing?.name || `${provider} user`, expiresInMs: ONE_YEAR_MS });
        res.cookie(COOKIE_NAME, sessionToken, { ...getSessionCookieOptions(req), maxAge: ONE_YEAR_MS });
        res.redirect(`${origin}${safeReturnTo(state.returnTo)}`);
      } catch (error) { console.error(`[Social OAuth] ${provider} callback failed`, error); redirectError(res, origin, "social_sign_in_failed"); }
    });
  });
}

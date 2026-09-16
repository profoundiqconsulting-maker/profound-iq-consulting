export const identifierSchema =
  /^(?:[^\s@]+@[^\s@]+\.[^\s@]+|\+?[0-9][0-9\s().-]{6,}|[a-zA-Z0-9_][a-zA-Z0-9_.-]{2,39})$/;

export function normalizeIdentifier(value: string) {
  const trimmed = value.trim();
  if (trimmed.includes("@")) return trimmed.toLowerCase();
  const digitsOnly = trimmed.replace(/^\+/, "").replace(/[\s().-]/g, "");
  return digitsOnly.toLowerCase();
}

export function passwordStrength(password: string) {
  let score = 0;
  if (password.length >= 10) score++;
  if (password.length >= 14) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(5, score);
}

export const LOGIN_LOCKOUT_WINDOW_MS = 60_000;

export function getRateLimitCountdownSeconds(
  lockedUntil: number,
  now = Date.now()
) {
  return Math.max(0, Math.ceil((lockedUntil - now) / 1000));
}

export function validatePassword(password: string) {
  return passwordStrength(password) >= 3 && password.length <= 128;
}

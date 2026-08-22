export const identifierSchema = /^(?:[^\s@]+@[^\s@]+\.[^\s@]+|\+?[0-9][0-9\s().-]{6,}|[a-zA-Z0-9_][a-zA-Z0-9_.-]{2,39})$/;

export function normalizeIdentifier(value: string) {
  const trimmed = value.trim();
  return trimmed.includes("@") ? trimmed.toLowerCase() : trimmed.replace(/[\s().-]/g, "").toLowerCase();
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

export function validatePassword(password: string) {
  return passwordStrength(password) >= 3 && password.length <= 128;
}

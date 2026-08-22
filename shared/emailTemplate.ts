export const EMAIL_TEMPLATE_TOKENS = ["name", "email", "date", "course"] as const;
export type EmailTemplateToken = (typeof EMAIL_TEMPLATE_TOKENS)[number];
const tokenPattern = /{{\s*([a-zA-Z][a-zA-Z0-9_]*)\s*}}/g;

export function validateEmailTemplateBody(body: string): string[] {
  return Array.from(body.matchAll(tokenPattern)).map((match) => match[1]).filter((token, index, all) => !EMAIL_TEMPLATE_TOKENS.includes(token as EmailTemplateToken) && all.indexOf(token) === index);
}

export function renderEmailTemplate(body: string, values: Partial<Record<EmailTemplateToken, string>>): string {
  return body.replace(tokenPattern, (_, token: string) => EMAIL_TEMPLATE_TOKENS.includes(token as EmailTemplateToken) ? values[token as EmailTemplateToken] ?? `{{${token}}}` : "");
}

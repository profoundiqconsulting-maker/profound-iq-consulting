import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import type { GeneratedLocaleCode } from "../shared/generatedLocalization";

const supported: GeneratedLocaleCode[] = ["en", "sw", "fr", "es", "pt", "ar", "zh", "hi", "de", "ja"];

export function getRequestLocale(req: Request): GeneratedLocaleCode {
  const cookies = parseCookieHeader(req.headers.cookie ?? "");
  const cookieLocale = cookies["profound-iq-locale"];
  if (cookieLocale && supported.includes(cookieLocale as GeneratedLocaleCode)) return cookieLocale as GeneratedLocaleCode;
  const accepted = String(req.headers["accept-language"] ?? "").split(",").map((part) => part.trim().split(";")[0].toLowerCase());
  for (const language of accepted) {
    const code = language.split("-")[0] as GeneratedLocaleCode;
    if (supported.includes(code)) return code;
  }
  return "en";
}

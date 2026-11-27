declare module "cookie" {
  export interface ParseOptions {
    decode?: (str: string) => string | undefined;
  }

  export type Cookies = Record<string, string | undefined>;

  export function parseCookie(str: string, options?: ParseOptions): Cookies;

  export interface StringifyOptions {
    encode?: (str: string) => string;
  }

  export function stringifyCookie(
    cookie: Cookies,
    options?: StringifyOptions
  ): string;

  export interface SetCookie {
    name: string;
    value: string | undefined;
    maxAge?: number;
    expires?: Date;
    domain?: string;
    path?: string;
    httpOnly?: boolean;
    secure?: boolean;
    partitioned?: boolean;
    priority?: "low" | "medium" | "high";
    sameSite?: boolean | "lax" | "strict" | "none";
  }

  export type SerializeOptions = StringifyOptions &
    Omit<SetCookie, "name" | "value">;

  export function stringifySetCookie(
    cookie: SetCookie,
    options?: StringifyOptions
  ): string;

  export function parseSetCookie(
    str: string,
    options?: ParseOptions
  ): SetCookie;
}

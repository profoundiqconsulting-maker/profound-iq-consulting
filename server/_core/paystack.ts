import { TRPCError } from "@trpc/server";

const PAYSTACK_API_BASE = "https://api.paystack.co";
const DEFAULT_ATTEMPTS = 3;

export async function paystackFetch(
  input: RequestInfo,
  init: RequestInit | undefined,
  attempts = DEFAULT_ATTEMPTS
) {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const response = await fetch(input, init);
      if (response.ok || response.status < 500) return response;
      lastError = new Error(`Paystack returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    if (attempt === attempts - 1) break;
    await new Promise(resolve => setTimeout(resolve, 200 * 2 ** attempt));
  }
  throw new TRPCError({
    code: "BAD_GATEWAY",
    message:
      lastError instanceof Error
        ? lastError.message
        : "Paystack is temporarily unavailable. Please try again.",
    cause: lastError,
  });
}

export async function paystackRequest(path: string, init?: RequestInit) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!secretKey)
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Paystack is not configured.",
    });
  const response = await paystackFetch(`${PAYSTACK_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const rawBody = await response.text();
  let payload: { status?: boolean; message?: string; data?: any };
  try {
    payload = JSON.parse(rawBody) as {
      status?: boolean;
      message?: string;
      data?: any;
    };
  } catch {
    throw new TRPCError({
      code: "BAD_GATEWAY",
      message:
        response.status >= 500
          ? "Paystack is temporarily unavailable. Please try again."
          : "Paystack returned an unexpected response. Please retry checkout.",
    });
  }
  if (!response.ok || !payload.status)
    throw new TRPCError({
      code: "BAD_GATEWAY",
      message: payload.message ?? "Paystack request failed.",
    });
  return payload;
}

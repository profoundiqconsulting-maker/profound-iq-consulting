import {
  checkoutInitializeInputSchema,
  checkoutInitializeResultSchema,
  type CheckoutInitializeInput,
  type CheckoutInitializeResult,
} from "@shared/checkoutApi";

export async function initializeCheckout(
  input: CheckoutInitializeInput
): Promise<CheckoutInitializeResult> {
  const validatedInput = checkoutInitializeInputSchema.parse(input);
  const response = await fetch("/api/checkout/initialize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(validatedInput),
  });

  let responseBody: unknown;
  try {
    responseBody = await response.json();
  } catch {
    throw new Error(
      `Checkout service returned an invalid response (HTTP ${response.status}).`
    );
  }

  if (!response.ok) {
    const message =
      typeof responseBody === "object" &&
      responseBody !== null &&
      "message" in responseBody &&
      typeof responseBody.message === "string"
        ? responseBody.message
        : `Checkout request failed (HTTP ${response.status}).`;
    throw new Error(message);
  }

  return checkoutInitializeResultSchema.parse(responseBody);
}

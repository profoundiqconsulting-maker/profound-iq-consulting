/* Profound IQ Consulting — Unified payment initialization service.
 *
 * Centralizes payment initialization logic, country detection,
 * and provider selection to eliminate duplication across
 * CheckoutForm, EnrollButton, and direct API calls.
 */

import type { PaymentProvider, PaymentConfig } from "./paymentProviders";
import {
  getPaymentProviderForCountry,
  getPaymentConfig,
  toSmallestUnit,
  formatCurrency,
} from "./paymentProviders";
import { ASSESSMENT_PRICE_KES } from "./assessment";
import { CAREER_PATH_PRICE_KES } from "./careerPath";
import { PSYCHOMETRIC_PRICE_KES } from "./psychometrics";

export type ProductType =
  "assessment" | "careerpath" | "psychometric" | "course" | "course_stage";

export type PaymentInitInput = {
  productType: ProductType;
  productSlug?: string;
  productName: string;
  amountKes: number; // Base amount in KES (will be converted based on provider)
  customerName: string;
  customerEmail: string;
  customerCountry?: string;
  upsellIds?: string[];
  returnUrl?: string;
  /** For course_stage: the enrollment ID to associate payment with. */
  enrollmentId?: number;
  /** For course_stage: which stage number (1-4). */
  stage?: number;
};

export type PaymentInitResult = {
  accessCode: string;
  reference: string;
  amountKes: number;
  amountLocal: number; // Amount in provider's currency smallest unit
  currency: string;
  currencySymbol: string;
  provider: PaymentProvider;
  authorizationUrl?: string;
  productName: string;
  productType: ProductType;
  testSlug?: string;
  enrollmentId?: number;
  stage?: number;
};

export type CustomerDetails = {
  name: string;
  email: string;
  country?: string;
  consent: boolean;
};

const CHECKOUT_UPSELL_PRICES: Partial<
  Record<ProductType, Record<string, number>>
> = {
  careerpath: {
    coaching: 5000,
    team: 3000,
  },
  psychometric: {
    careerpath: 15000,
    coaching: 5000,
  },
};

function getBasePriceKes(productType: ProductType): number | null {
  switch (productType) {
    case "assessment":
      return ASSESSMENT_PRICE_KES;
    case "careerpath":
      return CAREER_PATH_PRICE_KES;
    case "psychometric":
      return PSYCHOMETRIC_PRICE_KES;
    case "course":
    case "course_stage":
      return null;
  }
}

export function calculateCheckoutAmountKes(
  productType: ProductType,
  upsellIds: string[] = []
): number | null {
  const basePrice = getBasePriceKes(productType);
  if (basePrice === null) return null;

  const upsellPrices = CHECKOUT_UPSELL_PRICES[productType] ?? {};
  const uniqueUpsellIds = new Set(upsellIds);
  if (
    uniqueUpsellIds.size !== upsellIds.length ||
    upsellIds.some(id => upsellPrices[id] === undefined)
  ) {
    return null;
  }

  return (
    basePrice +
    upsellIds.reduce((total, id) => total + (upsellPrices[id] ?? 0), 0)
  );
}

export function checkoutAmountFromMetadata(
  productType: ProductType,
  metadata: unknown
): number | null {
  let value = metadata;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value) as unknown;
    } catch {
      return null;
    }
  }

  if (typeof value !== "object" || value === null) {
    return calculateCheckoutAmountKes(productType);
  }

  const upsellIds = (value as Record<string, unknown>).upsell_ids;
  if (upsellIds === undefined || upsellIds === null || upsellIds === "") {
    return calculateCheckoutAmountKes(productType);
  }
  if (Array.isArray(upsellIds) && upsellIds.every(id => typeof id === "string")) {
    return calculateCheckoutAmountKes(productType, upsellIds);
  }
  if (typeof upsellIds === "string") {
    return calculateCheckoutAmountKes(
      productType,
      upsellIds.split(",").filter(Boolean)
    );
  }
  return null;
}

/**
 * Validates customer details for payment.
 */
export function validateCustomerDetails(details: CustomerDetails): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!details.name?.trim()) {
    errors.push("Full name is required");
  }

  if (!details.email?.trim()) {
    errors.push("Email address is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email.trim())) {
    errors.push("Please enter a valid email address");
  }

  if (!details.consent) {
    errors.push("You must agree to the terms and privacy policy");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Determines the best payment provider based on country.
 * If country is not provided, defaults to Paystack (KES) for backward compatibility.
 */
export function resolvePaymentProvider(
  input: PaymentInitInput
): PaymentProvider {
  if (input.customerCountry) {
    return getPaymentProviderForCountry(input.customerCountry);
  }
  // Default to Paystack for Kenya/local market
  return "paystack";
}

/**
 * Builds the callback URL based on product type.
 */
export function buildCallbackUrl(
  baseUrl: string,
  productType: ProductType,
  reference: string,
  productSlug?: string
): string {
  switch (productType) {
    case "assessment":
      return `${baseUrl}/assessment?payment=success&reference=${encodeURIComponent(reference)}`;
    case "careerpath":
      return `${baseUrl}/careerpath?payment=success&reference=${encodeURIComponent(reference)}`;
    case "psychometric":
      return `${baseUrl}/psychometrics/${productSlug}?payment=success&reference=${encodeURIComponent(reference)}`;
    case "course":
    case "course_stage":
      return `${baseUrl}/courses/${productSlug}?payment=success&reference=${encodeURIComponent(reference)}`;
    default:
      return `${baseUrl}/dashboard?payment=success&reference=${encodeURIComponent(reference)}`;
  }
}

/**
 * Builds metadata object for the payment provider.
 */
export function buildPaymentMetadata(
  input: PaymentInitInput
): Record<string, unknown> {
  const metadata: Record<string, unknown> = {
    product_type: input.productType,
    product_name: input.productName,
  };

  if (input.productSlug) {
    metadata.course_slug = input.productSlug;
    metadata.test_slug = input.productSlug;
  }

  if (input.upsellIds?.length) {
    metadata.upsell_ids = input.upsellIds.join(",");
  }

  if (input.enrollmentId) {
    metadata.enrollment_id = input.enrollmentId;
  }

  if (input.stage) {
    metadata.stage = input.stage;
  }

  return metadata;
}

/**
 * Converts KES amount to provider's currency.
 * For now, uses a simple conversion rate. In production, this should use real-time rates.
 */
export function convertAmount(
  amountKes: number,
  provider: PaymentProvider
): { amountLocal: number; currency: string } {
  const config = getPaymentConfig(provider);

  // Hardcoded conversion rates (in production, fetch from exchange rate API)
  const rates: Record<string, number> = {
    KES: 1,
    USD: 0.0078, // ~128 KES = 1 USD
    EUR: 0.0072,
    GBP: 0.0061,
    NGN: 12.5, // 1 KES ~ 12.5 NGN
    GHS: 0.095,
    ZAR: 0.14,
  };

  const rate = rates[config.currency] ?? 1;
  const amountLocal = Math.round(amountKes * rate);

  return {
    amountLocal: toSmallestUnit(amountLocal, provider),
    currency: config.currency,
  };
}

/**
 * Formats the display amount for the UI.
 */
export function formatDisplayAmount(
  amountKes: number,
  provider: PaymentProvider
): string {
  const config = getPaymentConfig(provider);
  if (provider === "paystack") {
    return formatCurrency(amountKes * 100, provider); // Paystack expects kobo/cents
  }
  const { amountLocal, currency } = convertAmount(amountKes, provider);
  const majorAmount =
    amountLocal /
    (currency === "KES" ||
    currency === "USD" ||
    currency === "EUR" ||
    currency === "GBP"
      ? 100
      : 100);
  return `${config.currencySymbol} ${majorAmount.toLocaleString()}`;
}

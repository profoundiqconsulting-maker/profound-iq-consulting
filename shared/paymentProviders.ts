/* Profound IQ Consulting — Payment provider configuration by country.
 *
 * Maps countries to their preferred payment providers and currencies.
 * Supports automatic fallback to international providers.
 */

export type PaymentProvider = "paystack" | "stripe" | "flutterwave" | "manual";

export type PaymentConfig = {
  provider: PaymentProvider;
  currency: string;
  currencySymbol: string;
  /** Minimum amount in the smallest currency unit (e.g., cents for USD, kobo for NGN). */
  minAmount: number;
  /** Maximum amount in the smallest currency unit. */
  maxAmount?: number;
  /** Whether the provider supports inline/embedded checkout. */
  supportsInline: boolean;
  /** Countries where this is the primary provider (ISO 3166-1 alpha-2). */
  primaryCountries: string[];
  /** Countries where this provider is available as fallback. */
  fallbackCountries?: string[];
};

export const PAYMENT_CONFIGS: Record<PaymentProvider, PaymentConfig> = {
  paystack: {
    provider: "paystack",
    currency: "KES",
    currencySymbol: "KES",
    minAmount: 100, // 1 KES in cents
    maxAmount: 10_000_000, // 100,000 KES
    supportsInline: true,
    primaryCountries: ["KE", "NG", "GH", "ZA", "ZA", "RW", "UG", "TZ"],
    fallbackCountries: [
      "ET",
      "CM",
      "CI",
      "SN",
      "ML",
      "BF",
      "NE",
      "TD",
      "CF",
      "CG",
      "GA",
      "GQ",
      "ST",
    ],
  },
  stripe: {
    provider: "stripe",
    currency: "USD",
    currencySymbol: "$",
    minAmount: 50, // $0.50
    maxAmount: 999_999_00, // $999,999
    supportsInline: true,
    primaryCountries: [
      "US",
      "CA",
      "GB",
      "AU",
      "EU",
      "AE",
      "SG",
      "HK",
      "JP",
      "CH",
      "NO",
      "SE",
      "DK",
      "FI",
      "IE",
      "NL",
      "BE",
      "DE",
      "FR",
      "IT",
      "ES",
      "PT",
      "AT",
      "PL",
      "CZ",
      "SK",
      "HU",
      "RO",
      "BG",
      "HR",
      "SI",
      "EE",
      "LV",
      "LT",
      "MT",
      "CY",
    ],
    fallbackCountries: [], // Global fallback
  },
  flutterwave: {
    provider: "flutterwave",
    currency: "NGN",
    currencySymbol: "₦",
    minAmount: 100, // 1 NGN in kobo
    maxAmount: 50_000_000, // 500,000 NGN
    supportsInline: true,
    primaryCountries: ["NG"],
    fallbackCountries: [
      "KE",
      "GH",
      "ZA",
      "UG",
      "TZ",
      "RW",
      "CM",
      "CI",
      "SN",
      "ML",
      "BF",
      "NE",
      "TD",
      "CF",
      "CG",
      "GA",
      "GQ",
      "ST",
      "ET",
    ],
  },
  manual: {
    provider: "manual",
    currency: "KES",
    currencySymbol: "KES",
    minAmount: 1,
    supportsInline: false,
    primaryCountries: [],
    fallbackCountries: [], // Manual/invoice fallback for all
  },
};

/**
 * Determines the best payment provider for a given country.
 * Falls back to Stripe (global) if no regional provider matches.
 */
export function getPaymentProviderForCountry(
  countryCode: string | null | undefined
): PaymentProvider {
  if (!countryCode) return "stripe"; // Default to global provider

  const normalized = countryCode.toUpperCase();

  // Check primary countries first
  for (const [provider, config] of Object.entries(PAYMENT_CONFIGS)) {
    if (config.primaryCountries.includes(normalized)) {
      return provider as PaymentProvider;
    }
  }

  // Check fallback countries
  for (const [provider, config] of Object.entries(PAYMENT_CONFIGS)) {
    if (config.fallbackCountries?.includes(normalized)) {
      return provider as PaymentProvider;
    }
  }

  // Default to Stripe for unsupported countries
  return "stripe";
}

/**
 * Gets the payment configuration for a provider.
 */
export function getPaymentConfig(provider: PaymentProvider): PaymentConfig {
  return PAYMENT_CONFIGS[provider];
}

/**
 * Converts amount in major currency units to smallest unit (cents/kobo).
 */
export function toSmallestUnit(
  amount: number,
  provider: PaymentProvider
): number {
  const config = getPaymentConfig(provider);
  if (
    config.currency === "KES" ||
    config.currency === "USD" ||
    config.currency === "EUR" ||
    config.currency === "GBP"
  ) {
    return Math.round(amount * 100);
  }
  if (
    config.currency === "NGN" ||
    config.currency === "GHS" ||
    config.currency === "ZAR"
  ) {
    return Math.round(amount * 100);
  }
  // Default to 2 decimal places
  return Math.round(amount * 100);
}

/**
 * Converts amount from smallest unit to major currency units.
 */
export function fromSmallestUnit(
  amount: number,
  provider: PaymentProvider
): number {
  const config = getPaymentConfig(provider);
  if (
    config.currency === "KES" ||
    config.currency === "USD" ||
    config.currency === "EUR" ||
    config.currency === "GBP"
  ) {
    return amount / 100;
  }
  if (
    config.currency === "NGN" ||
    config.currency === "GHS" ||
    config.currency === "ZAR"
  ) {
    return amount / 100;
  }
  return amount / 100;
}

/**
 * Gets the localized currency display for a provider.
 */
export function formatCurrency(
  amount: number,
  provider: PaymentProvider
): string {
  const config = getPaymentConfig(provider);
  const majorAmount = fromSmallestUnit(amount, provider);
  return `${config.currencySymbol} ${majorAmount.toLocaleString()}`;
}

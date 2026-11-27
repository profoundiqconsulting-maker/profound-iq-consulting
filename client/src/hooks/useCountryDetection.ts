/* Profound IQ Consulting — Client-side country detection hook.
 *
 * Detects user's country via browser APIs, IP geolocation services,
 * or falls back to a default. Provides the country code for
 * payment provider selection.
 */

import { useEffect, useState } from "react";

export type CountryDetectionResult = {
  countryCode: string | null;
  loading: boolean;
  error: string | null;
  /** Whether the result came from a cached/local source. */
  isCached: boolean;
};

const CACHE_KEY = "piq-detected-country";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export function useCountryDetection(): CountryDetectionResult {
  const [result, setResult] = useState<CountryDetectionResult>({
    countryCode: null,
    loading: true,
    error: null,
    isCached: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function detectCountry() {
      // 1. Check cache first
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { countryCode, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            if (!cancelled) {
              setResult({
                countryCode,
                loading: false,
                error: null,
                isCached: true,
              });
            }
            return;
          }
        } catch {
          // Invalid cache, continue
        }
      }

      // 2. Try browser's navigator.language as hint (not reliable for country)
      // 3. Try IP geolocation API
      try {
        // Use a free IP geolocation service
        // In production, use a proper service like ipapi.co, ipinfo.io, or Cloudflare headers
        const response = await fetch("https://ipapi.co/json/", {
          headers: { Accept: "application/json" },
        });

        if (!response.ok) throw new Error("Geolocation service unavailable");

        const data = await response.json();
        const countryCode = data?.country_code?.toUpperCase() || null;

        if (countryCode && /^[A-Z]{2}$/.test(countryCode)) {
          // Cache the result
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ countryCode, timestamp: Date.now() })
          );

          if (!cancelled) {
            setResult({
              countryCode,
              loading: false,
              error: null,
              isCached: false,
            });
          }
          return;
        }
      } catch (err) {
        console.warn("[CountryDetection] IP geolocation failed:", err);
      }

      // 4. Fallback: try to infer from browser locale
      const localeCountry = navigator.language.split("-")[1]?.toUpperCase();
      if (localeCountry && /^[A-Z]{2}$/.test(localeCountry)) {
        if (!cancelled) {
          setResult({
            countryCode: localeCountry,
            loading: false,
            error: null,
            isCached: false,
          });
        }
        return;
      }

      // 5. Ultimate fallback
      if (!cancelled) {
        setResult({
          countryCode: null,
          loading: false,
          error: "Could not detect country",
          isCached: false,
        });
      }
    }

    detectCountry();

    return () => {
      cancelled = true;
    };
  }, []);

  return result;
}

/**
 * Gets the detected country from cache without triggering a new detection.
 * Useful for immediate display while useCountryDetection loads.
 */
export function getCachedCountry(): string | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { countryCode, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        return countryCode;
      }
    }
  } catch {
    // Ignore cache errors
  }
  return null;
}

/* Profound IQ Consulting — reusable Paystack inline checkout modal. */
import { useEffect, useRef, useState } from "react";
import { Loader2, ShieldCheck, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type PaystackInlineProduct = {
  accessCode: string;
  reference: string;
  amountKes: number;
  authorizationUrl?: string;
  productName: string;
  productType:
    | "assessment"
    | "psychometric"
    | "careerpath"
    | "course"
    | "course_stage"
    | "resource";
  testSlug?: string;
  enrollmentId?: number;
  courseSlug?: string;
  stage?: number;
  resourceId?: number;
};

type PaystackInlineModalProps = {
  open: boolean;
  product: PaystackInlineProduct | null;
  customerEmail: string;
  onClose: () => void;
  onSuccess: (reference: string) => void;
  onError: (message: string) => void;
};

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        ref: string;
        currency?: string;
        access_code?: string;
        metadata?: Record<string, unknown>;
        callback?: (reference: { reference: string }) => void;
        onClose?: () => void;
        onError?: (error: { message: string }) => void;
      }) => { openIframe: () => void };
    };
  }
}

const PAYSTACK_SCRIPT_URL = "https://js.paystack.co/v1/inline.js";

function ensurePaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve();
      return;
    }

    const existing = document.querySelector(
      `script[src="${PAYSTACK_SCRIPT_URL}"]`
    );
    if (existing) {
      // Script exists, poll for PaystackPop
      const poll = setInterval(() => {
        if (window.PaystackPop) {
          clearInterval(poll);
          resolve();
        }
      }, 50);
      const timeout = setTimeout(() => {
        clearInterval(poll);
        if (!window.PaystackPop) {
          reject(new Error("Paystack script loaded but not initialized"));
        }
      }, 10000);
      return;
    }

    // Production: load real Paystack script
    const script = document.createElement("script");
    script.src = PAYSTACK_SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      const poll = setInterval(() => {
        if (window.PaystackPop) {
          clearInterval(poll);
          resolve();
        }
      }, 50);
      const timeout = setTimeout(() => {
        clearInterval(poll);
        if (!window.PaystackPop) {
          reject(new Error("Paystack script loaded but not initialized"));
        }
      }, 10000);
    };
    script.onerror = () => {
      reject(new Error("Failed to load Paystack script"));
    };
    document.body.appendChild(script);
  });
}

export default function PaystackInlineModal({
  open,
  product,
  customerEmail,
  onClose,
  onSuccess,
  onError,
}: PaystackInlineModalProps) {
  const [loading, setLoading] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const onSuccessRef = useRef(onSuccess);
  const onCloseRef = useRef(onClose);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onCloseRef.current = onClose;
    onErrorRef.current = onError;
  }, [onSuccess, onClose, onError]);

  useEffect(() => {
    if (!open || !product) return;
    if (product.authorizationUrl) {
      try {
        const authorizationUrl = new URL(product.authorizationUrl);
        if (
          authorizationUrl.protocol !== "https:" ||
          authorizationUrl.hostname !== "checkout.paystack.com"
        ) {
          throw new Error("Paystack returned an invalid checkout URL.");
        }
        window.location.assign(authorizationUrl.toString());
      } catch {
        onErrorRef.current("Paystack returned an invalid checkout URL.");
      }
      return;
    }

    let cancelled = false;
    setLoading(true);
    setScriptError(false);

    ensurePaystackScript()
      .then(() => {
        if (cancelled) return;
        const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "";
        if (!publicKey) {
          setLoading(false);
          onErrorRef.current(
            "Paystack public key is not configured. Contact support."
          );
          return;
        }
        const handler = window.PaystackPop!.setup({
          key: publicKey,
          email: customerEmail,
          amount: product.amountKes * 100,
          ref: product.reference,
          currency: "KES",
          access_code: product.accessCode,
          metadata: {
            product_type: product.productType,
            product_name: product.productName,
            test_slug: product.testSlug,
            enrollment_id: product.enrollmentId,
            course_slug: product.courseSlug,
            stage: product.stage,
            resource_id: product.resourceId,
          },
          callback: reference => {
            onSuccessRef.current(reference.reference);
          },
          onClose: () => {
            onCloseRef.current();
          },
          onError: error => {
            if (product.authorizationUrl)
              window.location.href = product.authorizationUrl;
            else
              onErrorRef.current(
                error.message || "Payment failed. Please try again."
              );
          },
        });
        try {
          handler.openIframe();
          setLoading(false);
        } catch {
          if (product.authorizationUrl)
            window.location.href = product.authorizationUrl;
          else onErrorRef.current("Payment gateway could not open.");
        }
      })
      .catch(err => {
        if (cancelled) return;
        setScriptError(true);
        setLoading(false);
        onErrorRef.current(
          err instanceof Error
            ? err.message
            : "Payment gateway could not load."
        );
      });

    return () => {
      cancelled = true;
    };
  }, [open, product, customerEmail]);

  if (!open) return null;

  const formattedAmount = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
  }).format(product?.amountKes ?? 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--brand)]/10">
      <div className="w-full max-w-md bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        {loading && !scriptError && (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--gold)]/15">
              <Loader2 className="animate-spin text-[var(--gold)]" size={28} />
            </div>
            <p className="mt-5 text-base font-bold text-[var(--foreground)]">
              Loading secure payment…
            </p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Please do not close this window.
            </p>
          </div>
        )}
        {scriptError && (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--destructive)]/15">
              <AlertTriangle className="text-[var(--destructive)]" size={28} />
            </div>
            <p className="mt-5 text-base font-bold text-[var(--destructive)]">
              Payment gateway could not load.
            </p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Check your internet connection and try again.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 inline-flex items-center gap-2 border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
            >
              <X size={16} /> Close
            </button>
          </div>
        )}
        {!loading && !scriptError && (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--gold)]/15">
              <ShieldCheck className="text-[var(--gold)]" size={28} />
            </div>
            <p className="mt-5 text-base font-bold text-[var(--foreground)]">
              {formattedAmount}
            </p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Redirecting to secure payment…
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

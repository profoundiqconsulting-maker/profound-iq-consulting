/* Profound IQ Consulting — reusable Paystack inline checkout modal. */
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

export type PaystackInlineProduct = {
  accessCode: string;
  reference: string;
  amountKes: number;
  productName: string;
  productType: "assessment" | "psychometric" | "careerpath" | "course_stage" | "resource";
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
        onSuccess?: (reference: { reference: string }) => void;
        onCancel?: () => void;
        onError?: (error: { message: string }) => void;
      }) => { openIframe: () => void };
    };
  }
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
  const [scriptReady, setScriptReady] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const onSuccessRef = useRef(onSuccess);
  const onCloseRef = useRef(onClose);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onCloseRef.current = onClose;
    onErrorRef.current = onError;
  }, [onSuccess, onClose, onError]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setScriptError(false);
    if (!window.PaystackPop) {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => setScriptReady(true);
      script.onerror = () => {
        setScriptError(true);
        setLoading(false);
      };
      document.body.appendChild(script);
      scriptRef.current = script;
      return () => {
        if (scriptRef.current && scriptRef.current.parentNode) {
          scriptRef.current.parentNode.removeChild(scriptRef.current);
        }
      };
    } else {
      setScriptReady(true);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !product || !scriptReady || !window.PaystackPop) return;
    setLoading(false);
    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "";
    if (!publicKey) {
      onErrorRef.current(
        "Paystack public key is not configured. Contact support."
      );
      return;
    }
    const handler = window.PaystackPop.setup({
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
      onSuccess: reference => {
        onSuccessRef.current(reference.reference);
      },
      onCancel: () => {
        onCloseRef.current();
      },
      onError: error => {
        onErrorRef.current(
          error.message || "Payment failed. Please try again."
        );
      },
    });
    handler.openIframe();
    return () => {
      // Paystack inline does not expose a destroy method; cleanup is limited.
    };
  }, [open, product, scriptReady, customerEmail]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-[#16243d]/10 bg-white p-8 text-center shadow-2xl">
        {loading && !scriptError && (
          <>
            <Loader2
              className="mx-auto animate-spin text-[#7d5e1e]"
              size={32}
            />
            <p className="mt-4 text-sm font-semibold text-[#16243d]">
              Loading secure payment…
            </p>
            <p className="mt-1 text-xs text-[#657084]">
              Please do not close this window.
            </p>
          </>
        )}
        {scriptError && (
          <>
            <p className="text-sm font-semibold text-red-700">
              Payment gateway could not load.
            </p>
            <p className="mt-2 text-xs text-[#657084]">
              Check your internet connection and try again.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 inline-flex items-center gap-2 border border-[#16243d]/25 px-4 py-2 text-xs font-black uppercase tracking-[.12em]"
            >
              Close
            </button>
          </>
        )}
        {!loading && !scriptError && (
          <>
            <p className="text-xs font-black uppercase tracking-[.14em] text-[#7d5e1e]">
              Secure checkout
            </p>
            <p className="mt-3 text-lg font-semibold text-[#16243d]">
              {product?.productName}
            </p>
            <p className="mt-1 text-sm text-[#657084]">
              KES {(product?.amountKes ?? 0).toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-[#657084]">
              Ref: {product?.reference}
            </p>
            <p className="mt-4 text-xs text-[#657084]">
              A secure payment form will appear shortly. If it does not open
              automatically, check your popup blocker.
            </p>
            <button
              type="button"
              onClick={() => onSuccessRef.current(product?.reference ?? "")}
              className="mt-4 inline-flex items-center gap-2 border border-[#16243d]/25 px-4 py-2 text-xs font-black uppercase tracking-[.12em]"
            >
              I have completed payment
            </button>
          </>
        )}
      </div>
    </div>
  );
}

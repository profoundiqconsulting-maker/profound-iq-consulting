/* Profound IQ Consulting — reusable Paystack inline checkout modal. */
import { useEffect, useRef, useState } from "react";
import { Loader2, ShieldCheck, AlertTriangle, ExternalLink } from "lucide-react";

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

  const formattedAmount = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
  }).format(product?.amountKes ?? 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/85 backdrop-blur-md">
      <div className="w-full max-w-md rounded-2xl border border-[#c9a34e]/40 bg-white p-8 text-center shadow-2xl">
        {loading && !scriptError && (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#c9a34e]/15">
              <Loader2
                className="animate-spin text-[#7d5e1e]"
                size={28}
              />
            </div>
            <p className="mt-5 text-base font-bold text-[#16243d]">
              Loading secure payment…
            </p>
            <p className="mt-2 text-sm text-[#4a566a]">
              Please do not close this window.
            </p>
          </>
        )}
        {scriptError && (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle className="text-red-700" size={28} />
            </div>
            <p className="mt-5 text-base font-bold text-red-900">
              Payment gateway could not load.
            </p>
            <p className="mt-2 text-sm text-[#4a566a]">
              Check your internet connection and try again.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#16243d] px-5 py-3 text-xs font-black uppercase tracking-[.12em] text-[#f7f3e8] transition hover:bg-[#16243d]/90"
            >
              Close
            </button>
          </>
        )}
        {!loading && !scriptError && (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#c9a34e]/15">
              <ShieldCheck className="text-[#7d5e1e]" size={24} />
            </div>
            <p className="mt-4 text-[10px] font-black uppercase tracking-[.16em] text-[#7d5e1e]">
              Secure checkout
            </p>
            <p className="mt-3 text-xl font-bold text-[#16243d]">
              {product?.productName}
            </p>
            <p className="mt-2 text-2xl font-black text-[#16243d]">
              {formattedAmount}
            </p>
            <p className="mt-1 text-xs text-[#4a566a]">
              Ref: {product?.reference}
            </p>
            <div className="mt-5 rounded-lg border border-[#16243d]/10 bg-[#f7f3e8] p-4 text-left">
              <p className="text-xs leading-5 text-[#4a566a]">
                A secure payment form will appear shortly. If it does not open
                automatically, check your popup blocker or use the button below.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSuccessRef.current(product?.reference ?? "")}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#16243d] px-5 py-3 text-xs font-black uppercase tracking-[.12em] text-[#f7f3e8] transition hover:bg-[#16243d]/90"
            >
              <ExternalLink size={14} />
              I have completed payment
            </button>
          </>
        )}
      </div>
    </div>
  );
}

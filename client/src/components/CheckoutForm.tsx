"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { CreditCard, Loader2, CheckCircle2, Shield, Zap, FileText, ArrowLeft, X, ArrowUpRight, HelpCircle, Lock, Globe, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import PaystackInlineModal, { type PaystackInlineProduct } from "@/components/PaystackInlineModal";
import { toast } from "sonner";

interface CheckoutFormProps {
  product: {
    name: string;
    priceKes: number;
    type: "assessment" | "course" | "course_stage" | "psychometric" | "careerpath";
    slug?: string;
    stage?: number;
    totalStages?: number;
    accessCode?: string;
  };
  prefilled?: { email?: string; name?: string };
  upsells?: Array<{ id: string; name: string; priceKes: number; description?: string }>;
  onSuccess: (reference: string, product: PaystackInlineProduct) => void;
  onClose?: () => void;
  returnUrl?: string;
}

export function CheckoutForm({
  product,
  prefilled,
  upsells = [],
  onSuccess,
  onClose,
  returnUrl,
}: CheckoutFormProps) {
  const [name, setName] = useState(prefilled?.name || "");
  const [email, setEmail] = useState(prefilled?.email || "");
  const [consent, setConsent] = useState(false);
  const [selectedUpsells, setSelectedUpsells] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [inlineProduct, setInlineProduct] = useState<PaystackInlineProduct | null>(null);
  const [inlineModalOpen, setInlineModalOpen] = useState(false);
  const [step, setStep] = useState<"form" | "processing" | "success">("form");
  const formRef = useRef<HTMLFormElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  // Focus trap and body scroll lock
  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    setTimeout(() => nameInputRef.current?.focus(), 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
        return;
      }
      if (e.key === "Tab") trapFocus(e);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      previousFocusRef.current?.focus();
    };
  }, [onClose]);

  const trapFocus = (e: KeyboardEvent) => {
    const focusable = overlayRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable?.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const totalPrice = product.priceKes + Array.from(selectedUpsells).reduce((sum, id) => {
    const upsell = upsells.find(u => u.id === id);
    return sum + (upsell?.priceKes || 0);
  }, 0);

  const validateForm = () => {
    let valid = true;
    if (!name.trim()) {
      setNameError("Full name is required");
      valid = false;
    } else {
      setNameError(null);
    }
    if (!email.trim()) {
      setEmailError("Email address is required");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address");
      valid = false;
    } else {
      setEmailError(null);
    }
    if (!consent) {
      valid = false;
    }
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please complete all required fields");
      return;
    }

    setIsProcessing(true);
    setStep("processing");

    try {
      const response = await fetch("/api/checkout/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productType: product.type === "course" ? "course_stage" : product.type,
          productSlug: product.slug,
          productName: product.name,
          amountKes: totalPrice,
          customerName: name.trim(),
          customerEmail: email.trim(),
          upsellIds: Array.from(selectedUpsells),
          returnUrl: returnUrl || window.location.href,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to initialize payment");
      }

      setInlineProduct({
        accessCode: data.accessCode,
        reference: data.reference,
        amountKes: data.amountKes,
        productName: data.productName,
        productType: data.productType as "assessment" | "course_stage" | "psychometric" | "careerpath",
        testSlug: data.testSlug,
      });
      setInlineModalOpen(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Payment initialization failed");
      setIsProcessing(false);
      setStep("form");
    }
  };

  const handlePaystackSuccess = (reference: string) => {
    setInlineModalOpen(false);
    setInlineProduct(null);
    setIsProcessing(false);
    setStep("success");
    onSuccess(reference, inlineProduct!);
  };

  const handlePaystackClose = () => {
    setInlineModalOpen(false);
    setInlineProduct(null);
    setIsProcessing(false);
    setStep("form");
  };

  const handlePaystackError = (message: string) => {
    setInlineModalOpen(false);
    setInlineProduct(null);
    setIsProcessing(false);
    setStep("form");
    toast.error("Payment failed", { description: message });
  };

  const toggleUpsell = (id: string) => {
    setSelectedUpsells(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatPrice = (price: number) => `KES ${price.toLocaleString()}`;

  const handleBackToForm = () => {
    setStep("form");
  };

  return (
    <>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
      >
        <div
          tabIndex={-1}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200"
          onClick={e => e.stopPropagation()}
        >
          {/* Header with progress indicator */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--border)] bg-[var(--muted)]/50 sticky top-0 z-10 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                aria-label="Close checkout"
              >
                <X size={20} />
              </Button>
              <div className="hidden sm:flex items-center gap-2">
                <span className="eyebrow text-[var(--gold)]">SECURE CHECKOUT</span>
                <span className="text-xs text-[var(--muted-foreground)]">Step 1 of 2</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-[var(--gold)]" />
              <span className="text-xs font-medium text-[var(--gold)]">Paystack Secured</span>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="hidden sm:flex px-6 py-4 border-b border-[var(--border)]">
            <div className="flex items-center justify-between w-full">
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors",
                step === "form" || step === "processing"
                  ? "bg-[var(--gold)] text-[var(--navy-deep)]"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)]"
              )}>
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-[var(--gold)]/20 text-[var(--gold)]">
                  {step === "success" ? <CheckCircle2 size={12} /> : "1"}
                </span>
                <span>Details</span>
              </div>
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors",
                step === "success"
                  ? "bg-[var(--gold)] text-[var(--navy-deep)]"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)]"
              )}>
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-[var(--gold)]/20 text-[var(--gold)]">
                  {step === "success" ? <CheckCircle2 size={12} /> : "2"}
                </span>
                <span>Payment</span>
              </div>
            </div>
          </div>

          <Card className="w-full mx-auto border-none shadow-none p-6 sm:p-8">
            {step === "form" && (
              <>
                <CardHeader className="pb-4">
                  <CardTitle className="text-display text-3xl text-[var(--foreground)]">
                    {product.name}
                  </CardTitle>
                  {product.type === "course_stage" && product.stage && product.totalStages && (
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--gold)]/10 text-[var(--gold)] font-medium">
                        Stage {product.stage} of {product.totalStages}
                      </span>
                      {product.slug && (
                        <span className="text-[var(--muted-foreground)]">for {product.slug}</span>
                      )}
                    </div>
                  )}
                  <p className="mt-2 text-[var(--muted-foreground)]">
                    Complete your purchase to get instant access.
                  </p>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Order Summary - Responsive sticky */}
                  <div className="rounded-xl bg-[var(--muted)] p-5 space-y-3 border border-[var(--border)] sticky top-20 sm:hidden">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--muted-foreground)]">{product.name}</span>
                      <span className="font-semibold text-[var(--foreground)]">{formatPrice(product.priceKes)}</span>
                    </div>

                    {upsells.length > 0 && (
                      <>
                        <Separator />
                        <p className="text-xs font-semibold uppercase tracking-[.1em] text-[var(--muted-foreground)]">
                          Add-ons
                        </p>
                        <div className="space-y-2">
                          {upsells.map(upsell => (
                            <label
                              key={upsell.id}
                              className="flex items-center justify-between gap-3 cursor-pointer p-2 rounded-lg hover:bg-[var(--card)] transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <Checkbox
                                  checked={selectedUpsells.has(upsell.id)}
                                  onCheckedChange={(checked: boolean) => {
                                    if (checked) {
                                      setSelectedUpsells(prev => new Set(prev).add(upsell.id));
                                    } else {
                                      setSelectedUpsells(prev => {
                                        const next = new Set(prev);
                                        next.delete(upsell.id);
                                        return next;
                                      });
                                    }
                                  }}
                                  className="data-[state=checked]:border-[var(--gold)] data-[state=checked]:bg-[var(--gold)]"
                                />
                                <div>
                                  <p className="text-sm font-medium text-[var(--foreground)]">{upsell.name}</p>
                                  {upsell.description && (
                                    <p className="text-xs text-[var(--muted-foreground)]">{upsell.description}</p>
                                  )}
                                </div>
                              </div>
                              <span className="text-sm font-semibold text-[var(--gold)]">
                                +{formatPrice(upsell.priceKes)}
                              </span>
                            </label>
                          ))}
                        </div>
                      </>
                    )}

                    <Separator />
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span className="text-[var(--foreground)]">Total</span>
                      <span className="text-[var(--gold)]">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>

                  {/* Trust Bar */}
                  <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-[var(--gold-muted)] border border-[var(--gold-muted)]">
                    <div className="flex items-center gap-2 text-sm text-[var(--gold)]">
                      <Shield size={16} className="shrink-0" />
                      <span className="font-medium">Secure Paystack</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--gold)]">
                      <Zap size={16} className="shrink-0" />
                      <span className="font-medium">Instant access</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--gold)]">
                      <FileText size={16} className="shrink-0" />
                      <span className="font-medium">Certificate included</span>
                    </div>
                  </div>

                  {/* Help Links */}
                  <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-[var(--muted)]/50 border border-[var(--border)]">
                    <a href="/help" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--gold)] transition-colors">
                      <HelpCircle size={12} />
                      Help Center
                    </a>
                    <a href="/contact" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--gold)] transition-colors">
                      <MessageCircle size={12} />
                      Contact Support
                    </a>
                    <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--gold)] transition-colors">
                      <Lock size={12} />
                      Privacy Policy
                    </a>
                    <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--gold)] transition-colors">
                      <FileText size={12} />
                      Terms of Service
                    </a>
                  </div>

                  {/* Form */}
                  <form ref={formRef} onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <div className="space-y-2">
                      <Label htmlFor="checkout-name" className="text-sm font-semibold text-[var(--foreground)]">
                        Full Name
                      </Label>
                      <Input
                        ref={nameInputRef}
                        id="checkout-name"
                        type="text"
                        placeholder="Your full name"
                        value={name}
                        onChange={e => { setName(e.target.value); setNameError(null); }}
                        required
                        autoComplete="name"
                        className={cn("h-12 text-base focus-gold-ring", nameError && "border-[var(--destructive)] focus:border-[var(--destructive)]")}
                        disabled={isProcessing}
                        aria-invalid={nameError ? "true" : "false"}
                        aria-describedby={nameError ? "name-error" : undefined}
                      />
                      {nameError && (
                        <p id="name-error" className="text-xs text-[var(--destructive)]" role="alert">
                          {nameError}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="checkout-email" className="text-sm font-semibold text-[var(--foreground)]">
                        Email Address
                      </Label>
                      <Input
                        id="checkout-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setEmailError(null); }}
                        required
                        autoComplete="email"
                        className={cn("h-12 text-base focus-gold-ring", emailError && "border-[var(--destructive)] focus:border-[var(--destructive)]")}
                        disabled={isProcessing}
                        aria-invalid={emailError ? "true" : "false"}
                        aria-describedby={emailError ? "email-error" : undefined}
                      />
                      {emailError && (
                        <p id="email-error" className="text-xs text-[var(--destructive)]" role="alert">
                          {emailError}
                        </p>
                      )}
                    </div>

                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="checkout-consent"
                        checked={consent}
                        onCheckedChange={(checked) => setConsent(checked === true)}
                        required
                        className="mt-1 shrink-0 data-[state=checked]:border-[var(--gold)] data-[state=checked]:bg-[var(--gold)]"
                      />
                      <Label
                        htmlFor="checkout-consent"
                        className="text-sm text-[var(--muted-foreground)] leading-6 cursor-pointer"
                      >
                        I agree to the{" "}
                        <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[var(--gold)]">
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[var(--gold)]">
                          Privacy Policy
                        </a>
                        . I understand I will receive immediate access upon payment.
                      </Label>
                    </div>

                    <Button
                      type="submit"
                      variant="gold"
                      size="xl"
                      className="w-full"
                      disabled={isProcessing || !consent}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="animate-spin h-5 w-5" />
                          Processing…
                        </>
                      ) : (
                        <>
                          <CreditCard size={20} />
                          Pay {formatPrice(totalPrice)}
                        </>
                      )}
                    </Button>

                    <p className="text-center text-xs text-[var(--muted-foreground)]">
                      By continuing, you authorize a one-time charge of {formatPrice(totalPrice)} via Paystack.
                    </p>
                  </form>
                </CardContent>
              </>
            )}

            {step === "processing" && (
              <div className="text-center py-12">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--gold)]/15">
                  <Loader2 className="animate-spin text-[var(--gold)]" size={28} />
                </div>
                <p className="mt-5 text-base font-bold text-[var(--foreground)]">
                  Initializing secure payment…
                </p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  Please do not close this window.
                </p>
                <p className="mt-4 text-xs text-[var(--muted-foreground)]">
                  Redirecting to Paystack secure checkout…
                </p>
              </div>
            )}

            {step === "success" && (
              <div className="text-center py-12">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--success-muted)]">
                  <CheckCircle2 className="text-[var(--success)]" size={28} />
                </div>
                <h3 className="mt-5 text-display text-2xl font-semibold text-[var(--foreground)]">
                  Payment Successful!
                </h3>
                <p className="mt-2 text-[var(--muted-foreground)]">
                  Your {product.name} is now unlocked.
                </p>
                <div className="mt-6 flex gap-3 justify-center">
                  <Button
                    variant="gold"
                    size="lg"
                    onClick={() => { onClose?.(); window.location.reload(); }}
                  >
                    Continue to Dashboard
                    <ArrowUpRight size={14} className="ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={onClose}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      <PaystackInlineModal
        open={inlineModalOpen}
        product={inlineProduct}
        customerEmail={email}
        onClose={handlePaystackClose}
        onSuccess={handlePaystackSuccess}
        onError={handlePaystackError}
      />
    </>
  );
}
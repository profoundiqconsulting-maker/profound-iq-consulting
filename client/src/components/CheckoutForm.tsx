"use client";

import { useState, useRef, useEffect } from "react";
import { CreditCard, Loader2, CheckCircle2, Shield, Zap, FileText, ArrowLeft } from "lucide-react";
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
    type: "assessment" | "course" | "psychometric" | "careerpath";
    slug?: string;
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
  const formRef = useRef<HTMLFormElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const totalPrice = product.priceKes + Array.from(selectedUpsells).reduce((sum, id) => {
    const upsell = upsells.find(u => u.id === id);
    return sum + (upsell?.priceKes || 0);
  }, 0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !consent) {
      toast.error("Please complete all required fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsProcessing(true);

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
    }
  };

  const handlePaystackSuccess = (reference: string) => {
    setInlineModalOpen(false);
    setInlineProduct(null);
    setIsProcessing(false);
    onSuccess(reference, inlineProduct!);
  };

  const handlePaystackClose = () => {
    setInlineModalOpen(false);
    setInlineProduct(null);
    setIsProcessing(false);
  };

  const handlePaystackError = (message: string) => {
    setInlineModalOpen(false);
    setInlineProduct(null);
    setIsProcessing(false);
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

  return (
    <>
      <Card className="w-full max-w-xl mx-auto border-[var(--border)] bg-[var(--card)] shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              aria-label="Close checkout"
            >
              <ArrowLeft size={20} />
            </Button>
            <span className="eyebrow text-[var(--gold)]">SECURE CHECKOUT</span>
          </div>
          <CardTitle className="mt-4 text-display text-3xl text-[var(--foreground)]">
            {product.name}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Order Summary - Sticky on mobile */}
          <div className="rounded-xl bg-[var(--muted)] p-5 space-y-3 border border-[var(--border)] sticky top-20">
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
                onChange={e => setName(e.target.value)}
                required
                autoComplete="name"
                className="h-12 text-base focus-gold-ring"
                disabled={isProcessing}
              />
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
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-12 text-base focus-gold-ring"
                disabled={isProcessing}
              />
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
      </Card>

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
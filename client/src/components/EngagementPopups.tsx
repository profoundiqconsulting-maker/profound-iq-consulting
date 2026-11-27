"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  X,
  ChevronDown,
  Mail,
  ArrowUpRight,
  Bell,
  Tag,
  Clock3,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface EngagementState {
  hasSeenExitIntent: boolean;
  hasSeenScrollCapture: boolean;
  hasSeenWelcomeBack: boolean;
  lastExitIntent: number;
  lastScrollCapture: number;
  draftExists: boolean;
  setDraftExists: (exists: boolean) => void;
  markExitIntentSeen: () => void;
  markScrollCaptureSeen: () => void;
  markWelcomeBackSeen: () => void;
  canShowExitIntent: () => boolean;
  canShowScrollCapture: () => boolean;
  canShowWelcomeBack: () => boolean;
}

export const useEngagementStore = create<EngagementState>()(
  persist(
    (set, get) => ({
      hasSeenExitIntent: false,
      hasSeenScrollCapture: false,
      hasSeenWelcomeBack: false,
      lastExitIntent: 0,
      lastScrollCapture: 0,
      draftExists: false,

      setDraftExists: (exists: boolean) => set({ draftExists: exists }),

      markExitIntentSeen: () =>
        set({
          hasSeenExitIntent: true,
          lastExitIntent: Date.now(),
        }),

      markScrollCaptureSeen: () =>
        set({
          hasSeenScrollCapture: true,
          lastScrollCapture: Date.now(),
        }),

      markWelcomeBackSeen: () =>
        set({
          hasSeenWelcomeBack: true,
        }),

      canShowExitIntent: () => {
        const { hasSeenExitIntent, lastExitIntent, draftExists } = get();
        if (hasSeenExitIntent && !draftExists) return false;
        if (Date.now() - lastExitIntent < 30 * 24 * 60 * 60 * 1000)
          return false; // 30 days
        return true;
      },

      canShowScrollCapture: () => {
        const { hasSeenScrollCapture, lastScrollCapture } = get();
        if (hasSeenScrollCapture) return false;
        if (Date.now() - lastScrollCapture < 7 * 24 * 60 * 60 * 1000)
          return false; // 7 days
        return true;
      },

      canShowWelcomeBack: () => {
        const { hasSeenWelcomeBack, draftExists } = get();
        return draftExists && !hasSeenWelcomeBack;
      },
    }),
    {
      name: "piq-engagement",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function PopupOverlay({
  isOpen,
  onClose,
  children,
  className,
}: PopupProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      setTimeout(() => overlayRef.current?.focus(), 0);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
        if (e.key === "Tab") trapFocus(e);
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
        previousFocusRef.current?.focus();
      };
    }
  }, [isOpen, onClose]);

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

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--brand)]/10",
        className
      )}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-title"
    >
      <div
        ref={overlayRef}
        tabIndex={-1}
        className="w-full max-w-md bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function ExitIntentPopup({ onClose }: { onClose: () => void }) {
  const store = useEngagementStore();

  useEffect(() => {
    let mouseY = 0;
    let hasTriggered = false;

    const handleMouseMove = (e: MouseEvent) => {
      mouseY = e.clientY;
      if (mouseY <= 20 && !hasTriggered && store.canShowExitIntent()) {
        hasTriggered = true;
        store.markExitIntentSeen();
        // Trigger via custom event
        window.dispatchEvent(new CustomEvent("piq:show-exit-intent"));
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [store]);

  return null; // Rendered via portal in EngagementProvider
}

export function ScrollCapturePopup({ onClose }: { onClose: () => void }) {
  const store = useEngagementStore();
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking || hasShown) return;
      const scrollPercent =
        window.scrollY /
        (document.documentElement.scrollHeight - window.innerHeight);
      if (scrollPercent >= 0.7 && store.canShowScrollCapture()) {
        ticking = true;
        setHasShown(true);
        store.markScrollCaptureSeen();
        window.dispatchEvent(new CustomEvent("piq:show-scroll-capture"));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [store, hasShown]);

  return null;
}

export function WelcomeBackBanner({
  isOpen,
  onClose,
  onResume,
}: {
  isOpen: boolean;
  onClose: () => void;
  onResume: () => void;
}) {
  const store = useEngagementStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen && store.canShowWelcomeBack()) {
      setIsVisible(true);
      store.markWelcomeBackSeen();
    } else if (!isOpen) {
      setIsVisible(false);
    }
  }, [isOpen, store]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-4 duration-300"
      role="status"
      aria-live="polite"
    >
      <Card className="border-[var(--brand)]/50 bg-[var(--brand-muted)] shadow-xl">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--brand)]/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-[var(--brand)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[var(--foreground)]">
                Welcome back!
              </p>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                Your assessment draft is saved. Pick up where you left off.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                onClose();
                setIsVisible(false);
              }}
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              aria-label="Dismiss"
            >
              <X size={18} />
            </Button>
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              variant="brand"
              size="sm"
              className="flex-1"
              onClick={() => {
                onResume();
                onClose();
                setIsVisible(false);
              }}
            >
              <ArrowUpRight size={14} className="mr-1" />
              Resume Assessment
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                setIsVisible(false);
              }}
            >
              Dismiss
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ExitIntentModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <PopupOverlay isOpen={isOpen} onClose={onClose}>
      <div className="p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--brand)]/10 flex items-center justify-center">
          <Tag className="w-8 h-8 text-[var(--brand)]" />
        </div>
        <h2 className="text-display text-2xl font-semibold text-[var(--foreground)] mb-2">
          Wait! Start free — no card needed
        </h2>
        <p className="text-[var(--muted-foreground)] mb-6 max-w-sm mx-auto">
          Try 10 questions of any assessment free. See your profile before you
          decide.
        </p>
        <div className="flex flex-col gap-3">
          <Button
            variant="brand"
            size="lg"
            className="w-full"
            onClick={() => {
              onClose();
              window.location.href = "/assessment?taster=true";
            }}
          >
            <Clock3 size={18} className="mr-2" />
            Start Free Taster (10 min)
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={onClose}
          >
            Maybe later
          </Button>
        </div>
        <p className="mt-4 text-xs text-[var(--muted-foreground)]">
          Your progress auto-saves. Resume anytime.
        </p>
      </div>
    </PopupOverlay>
  );
}

export function ScrollCaptureModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const newsletter = trpc.newsletter.subscribe.useMutation();

  return (
    <PopupOverlay isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-display text-xl font-semibold text-[var(--foreground)]">
            Join 10,000+ professionals
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </Button>
        </div>
        <p className="text-[var(--muted-foreground)] mb-6">
          Get weekly insights on leadership, strategy, and growth — free in your
          inbox.
        </p>
        <form
          onSubmit={async e => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const email = formData.get("email");
            if (typeof email !== "string" || !email.trim()) {
              toast.error("Enter a valid email address.");
              return;
            }
            if (formData.get("consent") !== "on") {
              toast.error("Please confirm your newsletter consent.");
              return;
            }

            try {
              const result = await newsletter.mutateAsync({
                email,
                consent: true,
              });
              toast.success(
                result.alreadySubscribed
                  ? "You’re already subscribed"
                  : "Check your inbox",
                {
                  description: result.alreadySubscribed
                    ? "This email address is already on the newsletter list."
                    : "Confirm your subscription using the link we sent.",
                }
              );
              onClose();
            } catch (error) {
              toast.error(
                error instanceof Error
                  ? error.message
                  : "Subscription failed. Please try again."
              );
            }
          }}
          className="space-y-3"
        >
          <div className="flex gap-2">
            <Input
              name="email"
              type="email"
              placeholder="your@email.com"
              required
              autoComplete="email"
              className="flex-1 h-12 focus-gold-ring"
            />
            <Button
              type="submit"
              variant="brand"
              size="lg"
              disabled={newsletter.isPending}
            >
              <Mail size={18} className="mr-1" />
              {newsletter.isPending ? "Subscribing…" : "Subscribe"}
            </Button>
          </div>
          <label className="flex items-start gap-2 text-xs leading-5 text-[var(--muted-foreground)]">
            <input
              name="consent"
              type="checkbox"
              required
              className="mt-1 h-4 w-4 accent-[#16243d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
            />
            <span>
              I agree to receive the newsletter and have read the{" "}
              <a href="/privacy-policy" className="underline">
                privacy policy
              </a>
              .
            </span>
          </label>
          <p className="text-xs text-[var(--muted-foreground)] text-center">
            No spam. Unsubscribe anytime.{" "}
            <a href="/privacy-policy" className="underline">
              Privacy
            </a>
          </p>
        </form>
      </div>
    </PopupOverlay>
  );
}

export function PostPurchaseUpsell({
  isOpen,
  onClose,
  productName,
  upsellName,
  upsellPrice,
  discount = 20,
  onAccept,
}: {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  upsellName: string;
  upsellPrice: number;
  discount?: number;
  onAccept: () => void;
}) {
  const discountedPrice = Math.round(upsellPrice * (1 - discount / 100));
  const formatPrice = (p: number) => `KES ${p.toLocaleString()}`;

  return (
    <PopupOverlay isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--success-muted)] flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-[var(--success)]" />
          </div>
          <div>
            <p className="font-semibold text-[var(--foreground)]">
              {productName} complete!
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">
              Your report is ready.
            </p>
          </div>
        </div>

        <Card className="border-[var(--brand)]/50 bg-[var(--brand-muted)] mb-4">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-[var(--brand)] mb-1">
              Special offer — {discount}% off
            </p>
            <h3 className="text-display text-lg font-semibold text-[var(--foreground)]">
              {upsellName}
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              Perfect next step based on your profile.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-display text-xl font-bold text-[var(--brand)]">
                {formatPrice(discountedPrice)}
              </span>
              <span className="text-sm line-through text-[var(--muted-foreground)]">
                {formatPrice(upsellPrice)}
              </span>
              <span className="text-xs font-bold text-[var(--success)] bg-[var(--success-muted)] px-2 py-0.5 rounded">
                Save {discount}%
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            variant="brand"
            size="lg"
            className="flex-1"
            onClick={() => {
              onAccept();
              onClose();
            }}
          >
            Yes, add this
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={onClose}
          >
            No thanks
          </Button>
        </div>
      </div>
    </PopupOverlay>
  );
}

export function AbandonedCheckoutBanner({
  isOpen,
  onClose,
  productName,
  onResume,
}: {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  onResume: () => void;
}) {
  return (
    <div
      className={cn(
        "fixed top-16 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-top-4 duration-300",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      role="status"
      aria-live="polite"
    >
      <Card className="border-[var(--brand)]/50 bg-[var(--brand-muted)] shadow-xl">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--brand)]/20 flex items-center justify-center">
              <Clock3 className="w-4 h-4 text-[var(--brand)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[var(--foreground)]">
                Complete your purchase
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">
                Your {productName} is waiting. Report ready in 2 minutes.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Dismiss"
            >
              <X size={18} />
            </Button>
          </div>
          <Button
            variant="brand"
            size="sm"
            className="w-full mt-3"
            onClick={() => {
              onResume();
              onClose();
            }}
          >
            Complete Purchase
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

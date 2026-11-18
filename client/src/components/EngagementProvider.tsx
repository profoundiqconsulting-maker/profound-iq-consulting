"use client";

import { useState, useEffect, useCallback } from "react";
import { useEngagementStore } from "./EngagementPopups";
import {
  ExitIntentModal,
  ScrollCaptureModal,
  WelcomeBackBanner,
  PostPurchaseUpsell,
  AbandonedCheckoutBanner,
} from "./EngagementPopups";

export function EngagementProvider({ children }: { children: React.ReactNode }) {
  const store = useEngagementStore();

  const [showExitIntent, setShowExitIntent] = useState(false);
  const [showScrollCapture, setShowScrollCapture] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [showPostPurchaseUpsell, setShowPostPurchaseUpsell] = useState<{
    isOpen: boolean;
    productName: string;
    upsellName: string;
    upsellPrice: number;
    discount?: number;
    onAccept: () => void;
  } | null>(null);
  const [showAbandonedCheckout, setShowAbandonedCheckout] = useState<{
    isOpen: boolean;
    productName: string;
    onResume: () => void;
  } | null>(null);

  // Listen for custom events
  useEffect(() => {
    const handleExitIntent = () => setShowExitIntent(true);
    const handleScrollCapture = () => setShowScrollCapture(true);

    window.addEventListener("piq:show-exit-intent", handleExitIntent);
    window.addEventListener("piq:show-scroll-capture", handleScrollCapture);

    return () => {
      window.removeEventListener("piq:show-exit-intent", handleExitIntent);
      window.removeEventListener("piq:show-scroll-capture", handleScrollCapture);
    };
  }, []);

  // Check for welcome back on mount
  useEffect(() => {
    if (store.canShowWelcomeBack()) {
      setShowWelcomeBack(true);
    }
  }, [store]);

  const handleWelcomeBackClose = useCallback(() => {
    setShowWelcomeBack(false);
  }, []);

  const handleWelcomeBackResume = useCallback(() => {
    setShowWelcomeBack(false);
    // Navigate to assessment with draft
    window.location.href = "/assessment?resume=true";
  }, []);

  const handleExitIntentClose = useCallback(() => {
    setShowExitIntent(false);
  }, []);

  const handleScrollCaptureClose = useCallback(() => {
    setShowScrollCapture(false);
  }, []);

  // Public API for other components to trigger popups
  const triggerPostPurchaseUpsell = useCallback((
    productName: string,
    upsellName: string,
    upsellPrice: number,
    discount: number,
    onAccept: () => void
  ) => {
    setShowPostPurchaseUpsell({ isOpen: true, productName, upsellName, upsellPrice, discount, onAccept });
  }, []);

  const triggerAbandonedCheckout = useCallback((
    productName: string,
    onResume: () => void
  ) => {
    setShowAbandonedCheckout({ isOpen: true, productName, onResume });
  }, []);

  const handlePostPurchaseClose = useCallback(() => {
    setShowPostPurchaseUpsell(null);
  }, []);

  const handlePostPurchaseAccept = useCallback(() => {
    showPostPurchaseUpsell?.onAccept();
    setShowPostPurchaseUpsell(null);
  }, [showPostPurchaseUpsell]);

  const handleAbandonedClose = useCallback(() => {
    setShowAbandonedCheckout(null);
  }, []);

  const handleAbandonedResume = useCallback(() => {
    showAbandonedCheckout?.onResume();
    setShowAbandonedCheckout(null);
  }, [showAbandonedCheckout]);

  // Expose API via context or window for other components
  useEffect(() => {
    (window as any).__PIQ_ENGAGEMENT__ = {
      triggerPostPurchaseUpsell,
      triggerAbandonedCheckout,
    };
    return () => {
      delete (window as any).__PIQ_ENGAGEMENT__;
    };
  }, [triggerPostPurchaseUpsell, triggerAbandonedCheckout]);

  return (
    <>
      {children}
      {/* Global Popups */}
      <ExitIntentModal isOpen={showExitIntent} onClose={handleExitIntentClose} />
      <ScrollCaptureModal isOpen={showScrollCapture} onClose={handleScrollCaptureClose} />
      <WelcomeBackBanner
        isOpen={showWelcomeBack}
        onClose={handleWelcomeBackClose}
        onResume={handleWelcomeBackResume}
      />
      {showPostPurchaseUpsell && (
        <PostPurchaseUpsell
          isOpen={showPostPurchaseUpsell.isOpen}
          onClose={handlePostPurchaseClose}
          productName={showPostPurchaseUpsell.productName}
          upsellName={showPostPurchaseUpsell.upsellName}
          upsellPrice={showPostPurchaseUpsell.upsellPrice}
          discount={showPostPurchaseUpsell.discount}
          onAccept={handlePostPurchaseAccept}
        />
      )}
      {showAbandonedCheckout && (
        <AbandonedCheckoutBanner
          isOpen={showAbandonedCheckout.isOpen}
          onClose={handleAbandonedClose}
          productName={showAbandonedCheckout.productName}
          onResume={handleAbandonedResume}
        />
      )}
    </>
  );
}

// Hook for components to access engagement API
export function useEngagement() {
  if (typeof window !== "undefined") {
    return (window as any).__PIQ_ENGAGEMENT__ || {
      triggerPostPurchaseUpsell: () => {},
      triggerAbandonedCheckout: () => {},
    };
  }
  return {
    triggerPostPurchaseUpsell: () => {},
    triggerAbandonedCheckout: () => {},
  };
}
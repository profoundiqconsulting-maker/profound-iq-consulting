import { useMutation } from "@tanstack/react-query";
import { initializeCheckout } from "@/lib/checkoutApi";

export function useCheckoutInitialization() {
  return useMutation({ mutationFn: initializeCheckout });
}

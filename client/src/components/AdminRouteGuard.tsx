import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const [, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth?mode=login", { replace: true });
      return;
    }
    const role = user?.role?.toLowerCase();
    if (role !== "admin") {
      if (role === "staff") {
        navigate("/staff", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, user?.role, navigate]);

  if (!isAuthenticated || user?.role?.toLowerCase() !== "admin") {
    return null;
  }

  return <>{children}</>;
}

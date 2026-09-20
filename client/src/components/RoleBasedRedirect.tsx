import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

export function RoleBasedRedirect() {
  const [, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user?.role) return;
    const role = user.role.toLowerCase();
    if (role === "admin") {
      navigate("/admin/overview", { replace: true });
    } else if (role === "staff") {
      navigate("/staff", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, user?.role, navigate]);

  return null;
}

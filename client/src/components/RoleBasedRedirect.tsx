import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

export function RoleBasedRedirect() {
  const [, navigate] = useLocation();
  const { isAuthenticated, user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || !user?.role) {
      navigate("/auth?mode=login", { replace: true });
      return;
    }
    const role = user.role.toLowerCase();
    if (role === "admin") {
      navigate("/admin/overview", { replace: true });
    } else if (role === "staff") {
      navigate("/staff", { replace: true });
    } else {
      navigate("/dashboard/overview", { replace: true });
    }
  }, [isAuthenticated, user?.role, navigate, loading]);

  return null;
}

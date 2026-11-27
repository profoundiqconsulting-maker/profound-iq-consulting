import { SiteNavigation } from "@/components/SiteNavigation";
import type { useAuth } from "@/_core/hooks/useAuth";
import type { ReactNode } from "react";

interface ExecutiveHeaderProps {
  breadcrumbs?: Array<{ label: string; href?: string }>;
  searchOpen?: boolean;
  setSearchOpen?: (open: boolean) => void;
  role?: "user" | "staff" | "admin";
  user: NonNullable<ReturnType<typeof useAuth>["user"]>;
  leadingAction?: ReactNode;
}

export function ExecutiveHeader(props: ExecutiveHeaderProps) {
  return <SiteNavigation variant="workspace" {...props} />;
}

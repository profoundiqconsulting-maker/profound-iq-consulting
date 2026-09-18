import AdminRevenuePanel from "@/components/AdminRevenuePanel";

interface RevenueScreenProps {
  activeTab: string;
}

export function RevenueScreen({ activeTab }: RevenueScreenProps) {
  if (activeTab !== "revenue") return null;
  return <AdminRevenuePanel />;
}

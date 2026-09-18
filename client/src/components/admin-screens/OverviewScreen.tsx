import AdminReportsPanel from "@/components/AdminReportsPanel";

interface OverviewScreenProps {
  activeTab: string;
}

export function OverviewScreen({ activeTab }: OverviewScreenProps) {
  if (activeTab !== "overview") return null;
  return <AdminReportsPanel />;
}

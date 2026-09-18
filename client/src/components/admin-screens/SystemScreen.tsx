import AdminSystemSettings from "@/components/AdminSystemSettings";

interface SystemScreenProps {
  activeTab: string;
}

export function SystemScreen({ activeTab }: SystemScreenProps) {
  if (activeTab !== "system") return null;
  return <AdminSystemSettings />;
}

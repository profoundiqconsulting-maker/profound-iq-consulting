import AdminResourcesPanel from "@/components/AdminResourcesPanel";

interface ResourcesScreenProps {
  activeTab: string;
}

export function ResourcesScreen({ activeTab }: ResourcesScreenProps) {
  if (activeTab !== "resources") return null;
  return <AdminResourcesPanel />;
}

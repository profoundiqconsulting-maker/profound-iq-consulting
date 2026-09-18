import AdminSurveysPanel from "@/components/AdminSurveysPanel";

interface SurveysScreenProps {
  activeTab: string;
}

export function SurveysScreen({ activeTab }: SurveysScreenProps) {
  if (activeTab !== "surveys") return null;
  return <AdminSurveysPanel />;
}

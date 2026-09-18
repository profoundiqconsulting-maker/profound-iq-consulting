import { OrganizationApprovalQueue } from "@/components/OrganizationApprovalQueue";

interface OrganizationScreenProps {
  activeTab: string;
}

export function OrganizationScreen({ activeTab }: OrganizationScreenProps) {
  if (activeTab !== "organization") return null;
  return <OrganizationApprovalQueue />;
}

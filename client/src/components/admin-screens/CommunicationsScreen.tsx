import AdminCommunicationPanel from "@/components/AdminCommunicationPanel";
import AdminNewsletterPanel from "@/components/AdminNewsletterPanel";
import AdminInsightsPanel from "@/components/AdminInsightsPanel";

interface CommunicationsScreenProps {
  activeTab: string;
}

export function CommunicationsScreen({ activeTab }: CommunicationsScreenProps) {
  if (activeTab !== "communications") return null;
  return (
    <>
      <AdminCommunicationPanel />
      <AdminNewsletterPanel />
      <AdminInsightsPanel />
    </>
  );
}

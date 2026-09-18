import AdminInquiryPanel from "@/components/AdminInquiryPanel";

interface InquiriesScreenProps {
  activeTab: string;
}

export function InquiriesScreen({ activeTab }: InquiriesScreenProps) {
  if (activeTab !== "inquiries") return null;
  return <AdminInquiryPanel />;
}

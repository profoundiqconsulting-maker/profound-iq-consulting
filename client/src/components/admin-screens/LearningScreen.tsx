import AdminCourseDeliveryPanel from "@/components/AdminCourseDeliveryPanel";
import AdminPaymentExceptionsPanel from "@/components/AdminPaymentExceptionsPanel";
import AdminCourseAccessAudit from "@/components/AdminCourseAccessAudit";
import AdminCertificatePreview from "@/components/AdminCertificatePreview";
import AdminRecentQCCertificates from "@/components/AdminRecentQCCertificates";

interface LearningScreenProps {
  activeTab: string;
}

export function LearningScreen({ activeTab }: LearningScreenProps) {
  if (activeTab !== "learning") return null;
  return (
    <>
      <AdminCourseDeliveryPanel />
      <AdminPaymentExceptionsPanel />
      <AdminCourseAccessAudit />
      <AdminCertificatePreview />
      <AdminRecentQCCertificates />
    </>
  );
}

import AdminStaffPanel from "@/components/AdminStaffPanel";

interface StaffScreenProps {
  activeTab: string;
}

export function StaffScreen({ activeTab }: StaffScreenProps) {
  if (activeTab !== "staff") return null;
  return <AdminStaffPanel />;
}

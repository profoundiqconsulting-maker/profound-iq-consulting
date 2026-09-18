import DashboardLayout from "@/components/DashboardLayout";
import AdminReportsPanel from "@/components/AdminReportsPanel";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  FileSpreadsheet,
  Download,
  Filter,
} from "lucide-react";

export default function AdminReports() {
  return (
    <DashboardLayout role="admin" title="Reports">
      <div className="admin-observatory w-full space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="exec-eyebrow">Reporting</p>
            <h1 className="display mt-2 text-3xl">Reports</h1>
            <p className="mt-1 text-sm text-[#64748b]">
              View, filter, and export platform reports. Choose a category below to
              generate a downloadable report.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-[.08em]">
              <FileSpreadsheet className="mr-1.5 h-3 w-3" />
              CSV / Excel / PDF
            </Badge>
            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-[.08em]">
              <Filter className="mr-1.5 h-3 w-3" />
              Date range filters
            </Badge>
          </div>
        </div>

        <Card className="exec-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#16243d]/5 text-[#16243d]">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <p className="exec-label-gold">Report categories</p>
              <p className="mt-1 text-xs text-[#64748b]">
                Select a category inside the panel to browse available reports and
                export formats.
              </p>
            </div>
          </div>
          <Separator className="my-5" />
          <AdminReportsPanel />
        </Card>
      </div>
    </DashboardLayout>
  );
}

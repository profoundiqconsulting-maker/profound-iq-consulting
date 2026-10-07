import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Award, Download } from "lucide-react";

export default function AdminCertificates() {
  const certificates = trpc.admin.recentCourseCertificates.useQuery(
    { limit: 100 },
    {
      retry: false,
      refetchInterval: 30000,
    }
  );
  const downloadPdf = trpc.admin.adminDownloadCertificatePdf.useMutation({
    onError: error =>
      console.error("Certificate download failed:", error),
  });

  const rows = certificates.data ?? [];

  const handleDownload = async (cert: {
    id: number;
    enrollmentId: number;
    certificateNumber: string;
    recipientName: string;
    courseTitle: string;
    status: string;
    createdAt: Date;
  }) => {
    try {
      const result = await downloadPdf.mutateAsync({
        enrollmentId: cert.enrollmentId,
      });
      const binary = atob(result.data);
      const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
      const blob = new Blob([bytes], { type: result.contentType });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = result.filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Certificate download failed:", error);
    }
  };

  return (
    <DashboardLayout role="admin" title="Certificate Management">
      <div className="admin-observatory w-full">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="exec-eyebrow">Certificates</p>
            <h1 className="display mt-2 text-3xl">Course Certificates</h1>
            <p className="mt-1 text-sm text-[#64748b]">
              Review and manage issued course completion certificates.
            </p>
          </div>
          <div className="exec-badge">
            <Award size={16} />
            <span>{rows.length} issued</span>
          </div>
        </div>

        <div className="exec-card overflow-hidden">
          {certificates.isLoading ? (
            <div className="p-6 text-center text-sm text-[#64748b]">
              Loading certificates…
            </div>
          ) : certificates.isError ? (
            <div className="p-6 text-center text-sm text-red-600">
              Failed to load certificates.
            </div>
          ) : rows.length === 0 ? (
            <div className="p-6 text-center text-sm text-[#64748b]">
              No certificates issued yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="exec-table">
                <thead>
                  <tr>
                    <th>Recipient</th>
                    <th>Course</th>
                    <th>Certificate #</th>
                    <th>Issued</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(cert => (
                    <tr key={cert.id}>
                      <td className="font-medium text-[#0f172a]">
                        {cert.recipientName}
                      </td>
                      <td className="text-[#475569]">{cert.courseTitle}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleDownload(cert)}
                          disabled={downloadPdf.isPending}
                          className="inline-flex items-center gap-1 text-[#7d5e1e] underline underline-offset-4 hover:text-[#5c4513] disabled:opacity-50"
                        >
                          <Download size={13} />
                          {cert.certificateNumber}
                        </button>
                      </td>
                      <td className="text-[#64748b]">
                        {new Date(cert.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

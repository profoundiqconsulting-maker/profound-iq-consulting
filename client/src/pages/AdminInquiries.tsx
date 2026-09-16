import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Mail } from "lucide-react";

export default function AdminInquiries() {
  const inquiries = trpc.admin.contactInquiries.useQuery(undefined, {
    retry: false,
    refetchInterval: 30000,
  });

  const rows = inquiries.data?.rows ?? [];

  return (
    <DashboardLayout role="admin" title="Contact Inquiries">
      <div className="admin-observatory w-full">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="exec-eyebrow">Contact Inquiries</p>
            <h1 className="display mt-2 text-3xl">Inquiries</h1>
            <p className="mt-1 text-sm text-[#64748b]">
              Review and manage contact form submissions from the website.
            </p>
          </div>
          <div className="exec-badge">
            <Mail size={16} />
            <span>
              {rows.filter(r => r.status === "new").length} open · {rows.length}{" "}
              total
            </span>
          </div>
        </div>

        <div className="exec-card overflow-hidden">
          {inquiries.isLoading ? (
            <div className="p-6 text-center text-sm text-[#64748b]">
              Loading inquiries…
            </div>
          ) : inquiries.isError ? (
            <div className="p-6 text-center text-sm text-red-600">
              Failed to load inquiries.
            </div>
          ) : rows.length === 0 ? (
            <div className="p-6 text-center text-sm text-[#64748b]">
              No inquiries yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
                <table className="exec-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Category</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Received</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(inquiry => (
                    <tr key={inquiry.id}>
                      <td className="font-medium text-[#0f172a]">
                        {inquiry.name}
                      </td>
                      <td className="text-[#475569]">{inquiry.email}</td>
                      <td className="text-[#475569]">{inquiry.category}</td>
                      <td className="text-[#475569]">
                        {inquiry.message.slice(0, 60)}
                        {inquiry.message.length > 60 ? "…" : ""}
                      </td>
                      <td>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            inquiry.status === "new"
                              ? "bg-[#fef3c7] text-[#92400e]"
                              : inquiry.status === "read"
                                ? "bg-[#dbeafe] text-[#1e40af]"
                                : "bg-[#f1f5f9] text-[#475569]"
                          }`}
                        >
                          {inquiry.status}
                        </span>
                      </td>
                      <td className="text-[#64748b]">
                        {new Date(inquiry.createdAt).toLocaleDateString()}
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

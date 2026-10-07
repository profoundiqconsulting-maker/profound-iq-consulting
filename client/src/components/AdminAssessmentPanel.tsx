import { useMemo } from "react";
import { Download, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function AdminAssessmentPanel() {
  const overview = trpc.assessment.adminOverview.useQuery(undefined, {
    retry: false,
    refetchInterval: 15000,
  });

  const download = trpc.assessment.adminDownloadAssessmentReport.useMutation();

  const rows = useMemo(() => overview.data?.attempts ?? [], [overview.data]);

  return (
    <section className="mt-8 border border-[#16243d]/15 bg-white/55 p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow text-[#b8860b]">Assessment observatory</p>
          <h2 className="display mt-2 text-2xl">Self-assessment attempts.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#475569]">
            Review assessment starts, payment status, and report delivery outcomes
            without exposing respondent content.
          </p>
        </div>
        <RefreshCw
          size={17}
          className={
            overview.isFetching
              ? "animate-spin text-[#b8860b]"
              : "text-[#b8860b]"
          }
          aria-label="Assessment overview refreshes automatically"
        />
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#16243d]/10">
              <th className="py-2 pr-4 text-[10px] font-black uppercase tracking-[.12em] text-[#475569]">Name</th>
              <th className="py-2 pr-4 text-[10px] font-black uppercase tracking-[.12em] text-[#475569]">Email</th>
              <th className="py-2 pr-4 text-[10px] font-black uppercase tracking-[.12em] text-[#475569]">Payment</th>
              <th className="py-2 pr-4 text-[10px] font-black uppercase tracking-[.12em] text-[#475569]">Reference</th>
              <th className="py-2 pr-4 text-[10px] font-black uppercase tracking-[.12em] text-[#475569]">Report</th>
              <th className="py-2 text-[10px] font-black uppercase tracking-[.12em] text-[#475569]">Started</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.id} className="border-b border-[#16243d]/5">
                <td className="py-2 pr-4 font-medium text-[#16243d]">{row.name}</td>
                <td className="py-2 pr-4 text-[#475569]">{row.email}</td>
                <td className="py-2 pr-4">
                  <span className={row.paymentStatus === "paid" ? "text-[#15803d]" : "text-[#b8860b]"}>
                    {row.paymentStatus}
                  </span>
                </td>
                <td className="py-2 pr-4 text-[#475569]">{row.paystackReference ?? "—"}</td>
                <td className="py-2 pr-4">
                  {row.paymentStatus === "paid" ? (
                    <button
                      type="button"
                      onClick={() =>
                        download.mutate({ attemptId: row.id }, {
                          onSuccess: (result: { contentType: string; filename: string; data: string }) => {
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
                          },
                        })
                      }
                      disabled={download.isPending}
                      className="inline-flex items-center gap-1 text-[#7d5e1e] underline underline-offset-4 hover:text-[#5c4513] disabled:opacity-50"
                    >
                      <Download size={13} />
                      PDF
                    </button>
                  ) : (
                    <span className="text-xs text-[#475569]">Pending payment</span>
                  )}
                </td>
                <td className="py-2 text-[#475569]">{new Date(row.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-xs text-[#475569]">
                  No assessment attempts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

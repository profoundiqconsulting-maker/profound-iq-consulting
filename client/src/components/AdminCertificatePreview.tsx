import { useMemo, useState } from "react";
import { Download, Eye, ImageDown } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { downloadCertificatePng } from "@/lib/certificatePng";
import { courseCatalog } from "@shared/courseCatalog";

export function AdminCertificatePreview() {
  const [courseTitle, setCourseTitle] = useState(courseCatalog[0]?.title ?? "Leadership and Strategic Growth");
  const [downloading, setDownloading] = useState(false);
  const preview = trpc.admin.certificatePreview.useQuery({ courseTitle }, { staleTime: 30_000 });
  const svgData = preview.data?.data ?? "";
  const svgSrc = useMemo(() => svgData ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}` : "", [svgData]);

  const downloadSvg = () => {
    if (!svgData) return;
    const link = document.createElement("a");
    link.href = svgSrc;
    link.download = "profound-iq-certificate-qa-preview.svg";
    link.click();
    toast.success("Certificate SVG preview downloaded");
  };

  const downloadPng = async () => {
    if (!svgData) return;
    setDownloading(true);
    try {
      await downloadCertificatePng(svgData, "profound-iq-certificate-qa-preview.png", 2);
      toast.success("High-resolution PNG preview downloaded");
    } catch (error) {
      toast.error("Could not create PNG preview", { description: error instanceof Error ? error.message : "Please retry." });
    } finally {
      setDownloading(false);
    }
  };

  return <section className="border border-[#c9a34e]/70 bg-[#fffaf0] p-5 text-[#16243d] shadow-sm sm:p-6" aria-labelledby="admin-certificate-preview-title">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow text-[#a27e2e]">Quality control</p><h2 id="admin-certificate-preview-title" className="display mt-2 text-3xl">Certificate preview</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#4a566a]">Review the production certificate layout with safe sample data before a learner certificate is issued.</p></div><div className="flex items-center gap-2 text-xs font-bold text-[#7d5e1e]"><Eye size={16} /> Sample data only</div></div>
    <label className="mt-5 block text-[10px] font-black uppercase tracking-[.14em] text-[#7d5e1e]">Course title<select value={courseTitle} onChange={(event) => setCourseTitle(event.target.value)} className="mt-2 block w-full border border-[#16243d]/20 bg-white px-3 py-3 text-sm font-normal tracking-normal outline-none focus:border-[#c9a34e] sm:max-w-md">{courseCatalog.slice(0, 30).map((course) => <option key={course.slug} value={course.title}>{course.title}</option>)}</select></label>
    <div className="mt-5 overflow-hidden border border-[#16243d]/15 bg-[#d7dbe2] p-2"><iframe title="Admin sample certificate preview" src={svgSrc} className="aspect-[2000/1414] h-auto min-h-[260px] w-full bg-white" /></div>
    <div className="mt-4 flex flex-wrap justify-end gap-3"><button type="button" disabled={!svgData} onClick={downloadSvg} className="inline-flex items-center gap-2 border border-[#16243d]/25 px-4 py-3 text-[10px] font-black uppercase tracking-[.12em] disabled:opacity-50"><Download size={14} /> Download SVG</button><button type="button" disabled={!svgData || downloading} onClick={() => void downloadPng()} className="inline-flex items-center gap-2 bg-[#c9a34e] px-4 py-3 text-[10px] font-black uppercase tracking-[.12em] text-[#16243d] disabled:opacity-50"><ImageDown size={14} /> {downloading ? "Rendering PNG…" : "Download PNG"}</button></div>
  </section>;
}

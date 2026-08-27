import { useEffect, useMemo, useState } from "react";
import { Download, Eye, ImageDown, Minus, Plus, Printer, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { downloadCertificatePng } from "@/lib/certificatePng";
import { courseCatalog } from "@shared/courseCatalog";

export function AdminCertificatePreview() {
  const [courseTitle, setCourseTitle] = useState(courseCatalog[0]?.title ?? "Leadership and Strategic Growth");
  const [trainerName, setTrainerName] = useState("Stephen Mwihaki");
  const [trainerTitle, setTrainerTitle] = useState("Managing Director");
  const [signatureDataUri, setSignatureDataUri] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const settings = trpc.admin.certificateSettings.useQuery();
  const saveSettings = trpc.admin.saveCertificateSettings.useMutation({
    onSuccess: (value) => { setTrainerName(value.trainerName); setTrainerTitle(value.trainerTitle); setSignatureDataUri(value.signatureDataUri); void preview.refetch(); toast.success("Certificate settings saved"); },
    onError: (error) => toast.error("Could not save certificate settings", { description: error.message }),
  });
  const preview = trpc.admin.certificatePreview.useQuery({ courseTitle }, { staleTime: 30_000 });
  const svgData = preview.data?.data ?? "";
  const svgSrc = useMemo(() => svgData ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}` : "", [svgData]);

  useEffect(() => {
    if (!settings.data) return;
    setTrainerName(settings.data.trainerName);
    setTrainerTitle(settings.data.trainerTitle);
    setSignatureDataUri(settings.data.signatureDataUri);
  }, [settings.data]);

  const downloadSvg = () => { if (!svgData) return; const link = document.createElement("a"); link.href = svgSrc; link.download = "profound-iq-certificate-qa-preview.svg"; link.click(); toast.success("Certificate SVG preview downloaded"); };
  const downloadPng = async () => { if (!svgData) return; setDownloading(true); try { await downloadCertificatePng(svgData, "profound-iq-certificate-qa-preview.png", 2); toast.success("High-resolution PNG preview downloaded"); } catch (error) { toast.error("Could not create PNG preview", { description: error instanceof Error ? error.message : "Please retry." }); } finally { setDownloading(false); } };
  const printPreview = () => { if (!svgData) return; const popup = window.open("", "_blank", "noopener,noreferrer"); if (!popup) { toast.error("Allow pop-ups to print the certificate preview"); return; } popup.document.write(`<html><head><title>Profound IQ certificate preview</title><style>@page{size:A4 landscape;margin:0}html,body{margin:0;background:#fff}img{display:block;width:100vw;height:100vh;object-fit:contain}</style></head><body><img alt="Certificate preview" src="${svgSrc}" /></body></html>`); popup.document.close(); popup.focus(); popup.print(); };
  const readSignature = (file: File) => { if (!file.type.startsWith("image/")) { toast.error("Choose a PNG, JPEG, or WebP signature image"); return; } const reader = new FileReader(); reader.onload = () => setSignatureDataUri(String(reader.result)); reader.readAsDataURL(file); };

  return <section className="border border-[#c9a34e]/70 bg-[#fffaf0] p-5 text-[#16243d] shadow-sm sm:p-6" aria-labelledby="admin-certificate-preview-title">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow text-[#a27e2e]">Quality control</p><h2 id="admin-certificate-preview-title" className="display mt-2 text-3xl">Certificate preview & settings</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#4a566a]">Edit the trainer identity and signature used on newly generated certificates, then review the production layout with safe sample data.</p></div><div className="flex items-center gap-2 text-xs font-bold text-[#7d5e1e]"><Eye size={16} /> Sample data only</div></div>
    <div className="mt-5 grid gap-4 md:grid-cols-2"><label className="block text-[10px] font-black uppercase tracking-[.14em] text-[#7d5e1e]">Trainer name<input value={trainerName} onChange={(event) => setTrainerName(event.target.value)} className="mt-2 block w-full border border-[#16243d]/20 bg-white px-3 py-3 text-sm font-normal tracking-normal outline-none focus:border-[#c9a34e]" maxLength={160} /></label><label className="block text-[10px] font-black uppercase tracking-[.14em] text-[#7d5e1e]">Trainer title<input value={trainerTitle} onChange={(event) => setTrainerTitle(event.target.value)} className="mt-2 block w-full border border-[#16243d]/20 bg-white px-3 py-3 text-sm font-normal tracking-normal outline-none focus:border-[#c9a34e]" maxLength={160} /></label></div>
    <div className="mt-4 flex flex-wrap items-center gap-3"><label className="inline-flex cursor-pointer items-center gap-2 border border-[#16243d]/25 bg-white px-4 py-3 text-[10px] font-black uppercase tracking-[.12em]"><Upload size={14} /> Replace signature<input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) readSignature(file); }} /></label><span className="text-xs text-[#657084]">{signatureDataUri ? "A signature image is ready to save." : "Using the default signature until you save a replacement."}</span><button type="button" onClick={() => saveSettings.mutate({ trainerName, trainerTitle, signatureDataUri: signatureDataUri || settings.data?.signatureDataUri || "" })} disabled={saveSettings.isPending || !trainerName.trim() || !trainerTitle.trim() || !signatureDataUri} className="inline-flex items-center gap-2 bg-[#16243d] px-4 py-3 text-[10px] font-black uppercase tracking-[.12em] text-[#f7f3e8] disabled:opacity-50"><Save size={14} /> {saveSettings.isPending ? "Saving…" : "Save settings"}</button></div>
    <label className="mt-5 block text-[10px] font-black uppercase tracking-[.14em] text-[#7d5e1e]">Course title<select value={courseTitle} onChange={(event) => setCourseTitle(event.target.value)} className="mt-2 block w-full border border-[#16243d]/20 bg-white px-3 py-3 text-sm font-normal tracking-normal outline-none focus:border-[#c9a34e] sm:max-w-md">{courseCatalog.slice(0, 30).map((course) => <option key={course.slug} value={course.title}>{course.title}</option>)}</select></label>
    <div className="mt-5 overflow-auto border border-[#16243d]/15 bg-[#d7dbe2] p-2"><iframe title="Admin sample certificate preview" src={svgSrc} className="aspect-[2000/1414] h-auto min-h-[260px] origin-top-left bg-white transition-transform duration-200" style={{ transform: `scale(${zoom})`, width: `${100 / zoom}%` }} /></div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><div className="inline-flex items-center gap-1 border border-[#16243d]/20 bg-white px-2 py-1"><span className="px-2 text-[10px] font-black uppercase tracking-[.1em] text-[#657084]">Preview {Math.round(zoom * 100)}%</span><button type="button" aria-label="Zoom out" onClick={() => setZoom((value) => Math.max(0.75, Number((value - 0.25).toFixed(2))))} disabled={zoom <= 0.75} className="p-2 disabled:opacity-40"><Minus size={14} /></button><button type="button" aria-label="Reset zoom" onClick={() => setZoom(1)} className="px-2 text-[10px] font-black uppercase tracking-[.1em]">Reset</button><button type="button" aria-label="Zoom in" onClick={() => setZoom((value) => Math.min(1.75, Number((value + 0.25).toFixed(2))))} disabled={zoom >= 1.75} className="p-2 disabled:opacity-40"><Plus size={14} /></button></div><div className="flex flex-wrap justify-end gap-3"><button type="button" disabled={!svgData} onClick={downloadSvg} className="inline-flex items-center gap-2 border border-[#16243d]/25 px-4 py-3 text-[10px] font-black uppercase tracking-[.12em] disabled:opacity-50"><Download size={14} /> Download SVG</button><button type="button" disabled={!svgData || downloading} onClick={() => void downloadPng()} className="inline-flex items-center gap-2 bg-[#c9a34e] px-4 py-3 text-[10px] font-black uppercase tracking-[.12em] text-[#16243d] disabled:opacity-50"><ImageDown size={14} /> {downloading ? "Rendering PNG…" : "Download PNG"}</button><button type="button" disabled={!svgData} onClick={printPreview} className="inline-flex items-center gap-2 border border-[#16243d]/25 px-4 py-3 text-[10px] font-black uppercase tracking-[.12em] disabled:opacity-50"><Printer size={14} /> Print</button></div></div>
  </section>;
}

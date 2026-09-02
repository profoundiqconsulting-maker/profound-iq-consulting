import { useEffect, useState } from "react";
import { Image as ImageIcon, Save } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { PUBLISHED_SITE_ORIGIN } from "@shared/siteOrigin";

const DEFAULT_PREVIEW_IMAGE = `${PUBLISHED_SITE_ORIGIN}/profound-iq-social-preview.svg`;

export default function AdminSocialPreviewSettings() {
  const settings = trpc.admin.socialPreviewSettings.useQuery();
  const save = trpc.admin.saveSocialPreviewSettings.useMutation({
    onSuccess: () => {
      void settings.refetch();
      toast.success("Social preview image updated", { description: "New public shares will use this fallback image." });
    },
    onError: (error) => toast.error("Could not update social preview image", { description: error.message }),
  });
  const [url, setUrl] = useState("");
  const [version, setVersion] = useState("1");
  useEffect(() => { setUrl(settings.data?.fallbackImageUrl ?? DEFAULT_PREVIEW_IMAGE); setVersion(settings.data?.version ?? "1"); }, [settings.data?.fallbackImageUrl, settings.data?.version]);
  const isValid = /^https:\/\//i.test(url.trim());
  return <section className="mt-8 border border-[#16243d]/15 bg-[#fffaf0] p-5 sm:p-7" aria-labelledby="social-preview-settings-title">
    <div className="flex items-start gap-3"><div className="grid size-10 shrink-0 place-items-center bg-[#16243d] text-[#c9a34e]"><ImageIcon size={18} /></div><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#a27e2e]">Share presentation</p><h2 id="social-preview-settings-title" className="mt-1 text-2xl font-semibold">Fallback social image</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#657084]">Set a publicly reachable HTTPS image for pages without a dedicated course preview. Use a 1200 × 630 image for consistent LinkedIn, WhatsApp, Facebook, and X previews.</p></div></div>
    <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_220px_260px] lg:items-end"><label className="block text-xs font-bold text-[#16243d]">Image URL<input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com/social-preview.png" className="mt-2 w-full border border-[#16243d]/20 bg-white px-3 py-3 text-sm outline-none transition focus:border-[#a27e2e] focus:ring-2 focus:ring-[#c9a34e]/30" aria-describedby="social-preview-url-help" /></label><label className="block text-xs font-bold text-[#16243d]">Card version<input value={version} onChange={(event) => setVersion(event.target.value)} placeholder="2026-08-25" className="mt-2 w-full border border-[#16243d]/20 bg-white px-3 py-3 text-sm outline-none transition focus:border-[#a27e2e] focus:ring-2 focus:ring-[#c9a34e]/30" aria-describedby="social-preview-version-help" /><span id="social-preview-version-help" className="mt-1 block text-[11px] font-normal text-[#657084]">Change this when an urgent refresh is needed.</span></label><div className="border border-[#16243d]/10 bg-[#101d35] p-2"><img src={url || DEFAULT_PREVIEW_IMAGE} alt="Current social preview" className="aspect-[1200/630] w-full object-cover" onError={(event) => { event.currentTarget.src = DEFAULT_PREVIEW_IMAGE; }} /></div></div>
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p id="social-preview-url-help" className="text-xs text-[#657084]">The image must be accessible without authentication. <button type="button" className="font-bold text-[#7d5e1e] underline" onClick={() => setUrl(DEFAULT_PREVIEW_IMAGE)}>Restore default</button></p><Button type="button" onClick={() => save.mutate({ fallbackImageUrl: url.trim(), version: version.trim() })} disabled={!isValid || save.isPending || !url.trim()} className="bg-[#16243d] text-[#f7f3e8] hover:bg-[#243a5f]"><Save size={15} />{save.isPending ? "Saving…" : "Save image"}</Button></div>
  </section>;
}

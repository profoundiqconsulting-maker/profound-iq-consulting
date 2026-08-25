import { useEffect, useRef, useState } from "react";
import { Check, Move, X } from "lucide-react";

export default function CourseCoverCropper({ file, title, onCancel, onComplete }: { file: File; title: string; onCancel: () => void; onComplete: (dataBase64: string, contentType: "image/png") => void }) {
  const [source, setSource] = useState("");
  const [focalX, setFocalX] = useState(50);
  const [focalY, setFocalY] = useState(50);
  const [zoom, setZoom] = useState(1);
  const imageRef = useRef<HTMLImageElement>(null);
  useEffect(() => { const url = URL.createObjectURL(file); setSource(url); return () => URL.revokeObjectURL(url); }, [file]);
  const exportCrop = () => {
    const image = imageRef.current;
    if (!image) return;
    const canvas = document.createElement("canvas"); canvas.width = 1200; canvas.height = 630;
    const context = canvas.getContext("2d"); if (!context) return;
    const ratio = canvas.width / canvas.height;
    const sourceRatio = image.naturalWidth / image.naturalHeight;
    let cropWidth = image.naturalWidth; let cropHeight = image.naturalHeight;
    if (sourceRatio > ratio) cropWidth = image.naturalHeight * ratio; else cropHeight = image.naturalWidth / ratio;
    cropWidth /= zoom; cropHeight /= zoom;
    const left = Math.max(0, Math.min(image.naturalWidth - cropWidth, (image.naturalWidth - cropWidth) * (focalX / 100)));
    const top = Math.max(0, Math.min(image.naturalHeight - cropHeight, (image.naturalHeight - cropHeight) * (focalY / 100)));
    context.drawImage(image, left, top, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);
    onComplete(canvas.toDataURL("image/png"), "image/png");
  };
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#071326]/80 p-4" role="dialog" aria-modal="true" aria-labelledby="cover-crop-title"><div className="max-h-[92vh] w-full max-w-3xl overflow-auto border border-[#c9a34e]/60 bg-[#f7f3e8] p-5 text-[#16243d] shadow-2xl sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#a27e2e]">Open Graph artwork</p><h2 id="cover-crop-title" className="mt-1 text-2xl font-semibold">Frame {title}</h2><p className="mt-2 text-sm text-[#657084]">Drag the focal controls or adjust them below. The output is cropped to the social-card ratio.</p></div><button type="button" onClick={onCancel} aria-label="Close crop editor" className="border border-[#16243d]/20 p-2"><X size={17} /></button></div><div className="mt-5 overflow-hidden bg-[#101d35] p-3"><div className="relative aspect-[1200/630] overflow-hidden"><img ref={imageRef} src={source} alt={`Crop preview for ${title}`} className="size-full object-cover transition-transform" style={{ objectPosition: `${focalX}% ${focalY}%`, transform: `scale(${zoom})` }} /><div className="pointer-events-none absolute inset-0 grid place-items-center"><div className="grid size-12 place-items-center rounded-full border-2 border-white/80 bg-[#16243d]/35 text-white"><Move size={18} /></div></div></div></div><div className="mt-5 grid gap-4 sm:grid-cols-3"><label className="text-[10px] font-black uppercase tracking-[.1em]">Focal horizontal<input aria-label="Focal horizontal" type="range" min="0" max="100" value={focalX} onChange={(event) => setFocalX(Number(event.target.value))} className="mt-2 w-full accent-[#a27e2e]" /><span className="mt-1 block text-xs font-normal normal-case tracking-normal text-[#657084]">{focalX}%</span></label><label className="text-[10px] font-black uppercase tracking-[.1em]">Focal vertical<input aria-label="Focal vertical" type="range" min="0" max="100" value={focalY} onChange={(event) => setFocalY(Number(event.target.value))} className="mt-2 w-full accent-[#a27e2e]" /><span className="mt-1 block text-xs font-normal normal-case tracking-normal text-[#657084]">{focalY}%</span></label><label className="text-[10px] font-black uppercase tracking-[.1em]">Zoom<input aria-label="Crop zoom" type="range" min="1" max="2.5" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="mt-2 w-full accent-[#a27e2e]" /><span className="mt-1 block text-xs font-normal normal-case tracking-normal text-[#657084]">{zoom.toFixed(2)}×</span></label></div><div className="mt-6 flex flex-wrap justify-end gap-3"><button type="button" onClick={onCancel} className="border border-[#16243d]/20 px-4 py-3 text-[10px] font-black uppercase tracking-[.1em]">Cancel</button><button type="button" onClick={exportCrop} className="inline-flex items-center gap-2 bg-[#16243d] px-4 py-3 text-[10px] font-black uppercase tracking-[.1em] text-[#f7f3e8]"><Check size={14} />Use framed cover</button></div></div></div>;
}

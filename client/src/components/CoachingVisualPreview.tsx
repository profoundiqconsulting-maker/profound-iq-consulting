import { useState } from "react";
import { Download, Eye, Loader2, Copy, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { svgToDownloadUrl } from "@shared/reportComparisonVisual";
import { toast } from "sonner";

type CoachingVisualPreviewProps = {
  svg: string;
  pngLoading?: boolean;
  onDownloadSvg: () => void;
  onDownloadPng: () => void;
};

export function CoachingVisualPreview({
  svg,
  pngLoading = false,
  onDownloadSvg,
  onDownloadPng,
}: CoachingVisualPreviewProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyVisual = async () => {
    try {
      if (navigator.clipboard && "ClipboardItem" in window) {
        const item = new ClipboardItem({
          "image/svg+xml": new Blob([svg], { type: "image/svg+xml" }),
        });
        await navigator.clipboard.write([item]);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(svg);
      } else {
        throw new Error("Clipboard access is unavailable in this browser.");
      }
      setCopied(true);
      toast.success("Coaching visual copied", {
        description: "Paste it into compatible coaching notes or documents.",
      });
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      onDownloadSvg();
      toast.success("Clipboard unavailable", {
        description: "A compatible SVG download was started instead.",
      });
    }
  };
  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 border-[#16243d]/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em]"
      >
        <Eye size={13} /> Preview visual
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto border-[#16243d]/20 bg-[#f7f3e8] text-[var(--fg)]">
          <DialogHeader>
            <DialogTitle className="display text-2xl">
              Review your coaching visual
            </DialogTitle>
            <DialogDescription className="text-[var(--fg-muted)]">
              Check the sub-pathway signals before downloading a copy for a
              learner coaching conversation.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-hidden border border-[#16243d]/15 bg-white shadow-sm">
            <img
              src={svgToDownloadUrl(svg)}
              alt="CareerPath sub-pathway comparison visual"
              className="h-auto w-full"
            />
          </div>
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="border-[#16243d]/25"
              >
                <X size={14} /> Close
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="outline"
              onClick={copyVisual}
              className="border-[#16243d]/25"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}{" "}
              {copied ? "Copied" : "Copy visual"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onDownloadSvg}
              className="border-[#16243d]/25"
            >
              <Download size={14} /> Download SVG
            </Button>
            <Button
              type="button"
              onClick={onDownloadPng}
              disabled={pngLoading}
              className="bg-[#16243d] text-[#f7f3e8] hover:bg-[#243657]"
            >
              {pngLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Preparing PNG…
                </>
              ) : (
                <>
                  <Download size={14} /> Download PNG
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

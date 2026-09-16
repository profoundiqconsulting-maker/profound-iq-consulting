import { useEffect, useState } from "react";
import { Image as ImageIcon, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { PUBLISHED_SITE_ORIGIN } from "@shared/siteOrigin";

const DEFAULT_PREVIEW_IMAGE = `${PUBLISHED_SITE_ORIGIN}/profound-iq-social-preview.svg`;

export default function AdminSocialPreviewSettings() {
  const settings = trpc.admin.socialPreviewSettings.useQuery(undefined, {
    retry: false,
    refetchInterval: 30000,
  });
  const save = trpc.admin.saveSocialPreviewSettings.useMutation({
    onSuccess: () => {
      void settings.refetch();
      toast.success("Social preview image updated", {
        description: "New public shares will use this fallback image.",
      });
    },
    onError: error =>
      toast.error("Could not update social preview image", {
        description: error.message,
      }),
  });
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>(DEFAULT_PREVIEW_IMAGE);
  const [file, setFile] = useState<File | null>(null);
  const [version, setVersion] = useState("1");
  useEffect(() => {
    setPreview(settings.data?.fallbackImageUrl ?? DEFAULT_PREVIEW_IMAGE);
    setVersion(settings.data?.version ?? "1");
  }, [settings.data?.fallbackImageUrl, settings.data?.version]);
  const isValid = preview.trim().length > 0;
  return (
    <section
      className="mt-8 border border-[#16243d]/15 bg-[#fffaf0] p-5 sm:p-7"
      aria-labelledby="social-preview-settings-title"
    >
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center bg-[#16243d] text-[#c9a34e]">
          <ImageIcon size={18} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#7d5e1e]">
            Share presentation
          </p>
          <h2
            id="social-preview-settings-title"
            className="mt-1 text-2xl font-semibold"
          >
            Fallback social image
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#657084]">
            Upload a 1200 × 630 PNG or JPEG for pages without a dedicated
            course preview. The image is stored in the site media library and
            used for LinkedIn, WhatsApp, Facebook, and X previews.
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_260px] lg:items-end">
        <label className="block text-xs font-bold text-[#16243d]">
          Upload image
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="mt-2"
            onChange={event => {
              const selected = event.target.files?.[0];
              if (!selected) return;
              if (!["image/png", "image/jpeg", "image/webp"].includes(selected.type)) {
                toast.error("Use PNG, JPEG, or WebP artwork.");
                return;
              }
              if (selected.size > 8 * 1024 * 1024) {
                toast.error("Image must be 8 MB or smaller.");
                return;
              }
              setFile(selected);
              const reader = new FileReader();
              reader.onload = () => {
                setPreview(reader.result as string);
              };
              reader.readAsDataURL(selected);
            }}
          />
          <span className="mt-1 block text-[11px] font-normal text-[#657084]">
            Max 8 MB. PNG, JPEG, or WebP.
          </span>
        </label>
        <div>
          <label className="block text-xs font-bold text-[#16243d]">
            Card version
            <input
              value={version}
              onChange={event => setVersion(event.target.value)}
              placeholder="2026-08-25"
              className="mt-2 w-full border border-[#16243d]/20 bg-white px-3 py-3 text-sm outline-none transition focus:border-[#a27e2e] focus:ring-2 focus:ring-[#c9a34e]/30"
            />
            <span className="mt-1 block text-[11px] font-normal text-[#657084]">
              Change this when an urgent refresh is needed.
            </span>
          </label>
          <div className="mt-3 border border-[#16243d]/10 bg-[#101d35] p-2">
            <img
              src={preview || DEFAULT_PREVIEW_IMAGE}
              alt="Current social preview"
              className="aspect-[1200/630] w-full object-cover"
              onError={event => {
                event.currentTarget.src = DEFAULT_PREVIEW_IMAGE;
              }}
            />
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[#657084]">
          <button
            type="button"
            className="font-bold text-[#7d5e1e] underline"
            onClick={() => {
              setPreview(DEFAULT_PREVIEW_IMAGE);
              setFile(null);
            }}
          >
            Restore default
          </button>
        </p>
        <Button
          type="button"
          onClick={async () => {
            if (!file) {
              toast.error("Choose an image first.");
              return;
            }
            setUploading(true);
            try {
              const dataBase64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = () => reject(reader.error);
                reader.readAsDataURL(file);
              });
              const contentType = file.type as "image/png" | "image/jpeg" | "image/webp";
              await save.mutateAsync({
                fallbackImageUrl: dataBase64,
                contentType,
                filename: file.name,
                version,
              });
              setFile(null);
            } catch (error) {
              toast.error("Upload failed", {
                description: error instanceof Error ? error.message : "Try again.",
              });
            } finally {
              setUploading(false);
            }
          }}
          disabled={uploading || save.isPending || !file}
          className="bg-[#16243d] text-[#f7f3e8] hover:bg-[#243a5f]"
        >
          <Upload size={15} />
          {uploading ? "Uploading…" : "Upload image"}
        </Button>
      </div>
    </section>
  );
}

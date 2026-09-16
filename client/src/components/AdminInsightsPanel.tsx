import { useState } from "react";
import {
  CheckCircle2,
  FileText,
  ImagePlus,
  RefreshCw,
  Send,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function AdminInsightsPanel() {
  const articles = trpc.insights.adminList.useQuery(undefined, {
    retry: false,
    refetchInterval: 30000,
  });
  const setStatus = trpc.insights.setStatus.useMutation({
    onSuccess: () => {
      void articles.refetch();
      toast.success("Insight publishing status updated.");
    },
    onError: error =>
      toast.error(error.message || "Unable to update article status."),
  });
  const [previewFiles, setPreviewFiles] = useState<Record<string, File | null>>(
    {}
  );
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const readFileAsBase64 = (slug: string, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrls(current => ({
        ...current,
        [slug]: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };
  return (
    <section
      id="insights-publishing"
      className="mt-10 scroll-mt-8 border border-[#c9a34e]/45 bg-[#fffaf0] p-5 sm:p-6"
    >
      <div className="flex flex-col justify-between gap-4 border-b border-[#16243d]/10 pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow text-[#7d5e1e]">Editorial / Insights</p>
          <h2 className="display mt-2 text-2xl">Publish with intention.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#657084]">
            Move approved article drafts into the public library, keep
            work-in-progress pieces private, and attach a branded social preview
            image when one is ready.
          </p>
        </div>
        <span className="text-xs font-bold text-[#7d5e1e]">Admin only</span>
      </div>
      {articles.isLoading ? (
        <p className="mt-6 flex items-center gap-2 text-sm text-[#657084]">
          <RefreshCw size={15} className="animate-spin" /> Loading editorial
          records…
        </p>
      ) : articles.isError ? (
        <p className="mt-6 text-sm text-red-800">
          Unable to load Insights publishing records.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {(articles.data?.rows ?? []).map(article => {
            const published = article.status === "Published";
            const file = previewFiles[article.slug];
            const preview = previewUrls[article.slug] ?? article.socialImageUrl;
            return (
              <article
                key={article.slug}
                className="border border-[#16243d]/12 bg-white/70 p-4 sm:p-5"
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[.12em] text-[#7d5e1e]">
                      <span>{article.category}</span>
                      <span
                        className={`inline-flex items-center gap-1 border px-2 py-1 ${published ? "border-emerald-800/30 text-emerald-800" : "border-[#7d5e1e]/30 text-[#7d5e1e]"}`}
                      >
                        {published ? (
                          <CheckCircle2 size={12} />
                        ) : (
                          <FileText size={12} />
                        )}
                        {published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <h3 className="mt-3 text-xl font-semibold text-[#16243d]">
                      {article.title}
                    </h3>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[#657084]">
                      {article.excerpt}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setStatus.mutate({
                          slug: article.slug,
                          status: published ? "draft" : "published",
                          socialImageUrl: preview || null,
                          contentType: file?.type as
                            | "image/png"
                            | "image/jpeg"
                            | "image/webp"
                            | undefined,
                        })
                      }
                      disabled={setStatus.isPending}
                      className="inline-flex min-h-10 items-center gap-2 bg-[#16243d] px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] text-[#f7f3e8] transition hover:-translate-y-0.5 hover:bg-[#c9a34e] hover:text-[#101d35] disabled:opacity-50"
                    >
                      {published ? <Undo2 size={13} /> : <Send size={13} />}
                      {published ? "Move to draft" : "Publish article"}
                    </button>
                  </div>
                </div>
                <label className="mt-4 flex items-center gap-2 text-xs text-[#657084]">
                  <ImagePlus size={15} className="text-[#7d5e1e]" />
                  <span className="sr-only">
                    Social preview image for {article.title}
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="text-sm"
                    onChange={event => {
                      const selected = event.target.files?.[0];
                      if (!selected) return;
                      setPreviewFiles(current => ({
                        ...current,
                        [article.slug]: selected,
                      }));
                      const reader = new FileReader();
                      reader.onload = () => {
                        setPreviewUrls(current => ({
                          ...current,
                          [article.slug]: reader.result as string,
                        }));
                      };
                      reader.readAsDataURL(selected);
                    }}
                  />
                  {file && (
                    <span className="text-[11px] font-normal text-[#657084]">
                      {file.name} · {(file.size / 1024).toFixed(1)} KB
                    </span>
                  )}
                </label>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

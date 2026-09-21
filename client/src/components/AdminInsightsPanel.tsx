import { useState } from "react";
import {
  CheckCircle2,
  FileText,
  ImagePlus,
  RefreshCw,
  Send,
  Undo2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ArticleForm = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  readTime: string;
  accent: string;
  sectionsJson: string;
  status: "draft" | "published";
};

const emptyForm: ArticleForm = {
  slug: "",
  category: "Education leadership",
  title: "",
  excerpt: "",
  readTime: "5 min read",
  accent: "",
  sectionsJson: "",
  status: "draft",
};

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
  const createArticle = trpc.insights.create.useMutation({
    onSuccess: () => {
      setForm(emptyForm);
      setSocialImageFile(null);
      setSocialImagePreview("");
      setCreating(false);
      toast.success("Insight article created.");
      articles.refetch();
    },
    onError: (error) => {
      setCreating(false);
      toast.error(error.message || "Unable to create article.");
    },
  });
  const [form, setForm] = useState<ArticleForm>(emptyForm);
  const [creating, setCreating] = useState(false);
  const [socialImageFile, setSocialImageFile] = useState<File | null>(null);
  const [socialImagePreview, setSocialImagePreview] = useState("");
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

  const handleCreate = () => {
    if (!form.slug.trim() || !form.title.trim() || !form.excerpt.trim() || !form.accent.trim() || !form.sectionsJson.trim()) {
      toast.error("Please complete all required fields.");
      return;
    }
    setCreating(true);
    createArticle.mutate({
      ...form,
      slug: form.slug.trim(),
      category: form.category.trim(),
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      readTime: form.readTime.trim(),
      accent: form.accent.trim(),
      sectionsJson: form.sectionsJson.trim(),
      status: form.status,
      socialImageUrl: socialImagePreview || null,
      contentType: socialImageFile?.type as
        | "image/png"
        | "image/jpeg"
        | "image/webp"
        | undefined,
    });
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

      <div className="mt-6 rounded-xl border border-[#16243d]/15 bg-white/80 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.12em] text-[#16243d]">
              New post
            </p>
            <p className="text-xs text-[#657084]">
              Create a new insight article. Required fields are marked with *.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-xs font-bold uppercase tracking-[.1em]">
              Slug *
            </label>
            <Input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="e.g. leading-without-losing-the-centre"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-bold uppercase tracking-[.1em]">
              Category *
            </label>
            <Select
              value={form.category}
              onValueChange={(value) => setForm({ ...form, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Education leadership">Education leadership</SelectItem>
                <SelectItem value="Learning design">Learning design</SelectItem>
                <SelectItem value="Professional growth">Professional growth</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 lg:col-span-2">
            <label className="text-xs font-bold uppercase tracking-[.1em]">
              Title *
            </label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Article title"
            />
          </div>
          <div className="grid gap-2 lg:col-span-2">
            <label className="text-xs font-bold uppercase tracking-[.1em]">
              Excerpt *
            </label>
            <Textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="Short summary for the card and SEO..."
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-bold uppercase tracking-[.1em]">
              Read time *
            </label>
            <Input
              value={form.readTime}
              onChange={(e) => setForm({ ...form, readTime: e.target.value })}
              placeholder="e.g. 6 min read"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-bold uppercase tracking-[.1em]">
              Accent line *
            </label>
            <Input
              value={form.accent}
              onChange={(e) => setForm({ ...form, accent: e.target.value })}
              placeholder="Short italicised hook"
            />
          </div>
          <div className="grid gap-2 lg:col-span-2">
            <label className="text-xs font-bold uppercase tracking-[.1em]">
              Sections (JSON) *
            </label>
            <Textarea
              value={form.sectionsJson}
              onChange={(e) => setForm({ ...form, sectionsJson: e.target.value })}
              placeholder='[{"heading":"First section","paragraphs":["First paragraph.","Second paragraph."]}]'
              rows={6}
              className="font-mono text-xs"
            />
            <p className="text-[11px] text-[#657084]">
              Provide a JSON array of sections. Each section needs a heading and an array of paragraphs.
            </p>
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-bold uppercase tracking-[.1em]">
              Status
            </label>
            <Select
              value={form.status}
              onValueChange={(value) =>
                setForm({ ...form, status: value as "draft" | "published" })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-bold uppercase tracking-[.1em]">
              Social image
            </label>
            <label className="flex items-center gap-2 text-xs text-[#657084]">
              <ImagePlus size={15} className="text-[#7d5e1e]" />
              <span className="sr-only">Social preview image</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="text-sm"
                onChange={(event) => {
                  const selected = event.target.files?.[0];
                  if (!selected) return;
                  setSocialImageFile(selected);
                  const reader = new FileReader();
                  reader.onload = () => {
                    setSocialImagePreview(reader.result as string);
                  };
                  reader.readAsDataURL(selected);
                }}
              />
              {socialImageFile && (
                <span className="text-[11px] font-normal text-[#657084]">
                  {socialImageFile.name} · {(socialImageFile.size / 1024).toFixed(1)} KB
                </span>
              )}
            </label>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            onClick={handleCreate}
            disabled={creating}
            className="bg-[#16243d] text-white"
          >
            <Plus size={14} className="mr-2" />
            {creating ? "Creating…" : "Create post"}
          </Button>
        </div>
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

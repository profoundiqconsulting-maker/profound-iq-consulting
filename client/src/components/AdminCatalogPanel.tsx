/* Profound IQ Consulting — Admin catalog controls use the same navy/gold editorial system while keeping publishing actions explicit and auditable. */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import CourseCoverCropper from "./CourseCoverCropper";
import {
  Image as ImageIcon,
  Loader2,
  Plus,
  RefreshCw,
  Upload,
} from "lucide-react";

const initialForm = {
  slug: "",
  itemType: "course" as const,
  title: "",
  strapline: "",
  description: "",
  audience: "",
  duration: "",
  outcomes: "",
  priceKes: "4999",
  published: false,
};

export default function AdminCatalogPanel() {
  const [form, setForm] = useState(initialForm);
  const [cropJob, setCropJob] = useState<{
    id: number;
    title: string;
    file: File;
  } | null>(null);
  const items = trpc.catalog.adminList.useQuery(undefined, {
    retry: false,
    refetchInterval: 30000,
  });
  const utils = trpc.useUtils();
  const create = trpc.catalog.create.useMutation({
    onSuccess: async () => {
      setForm(initialForm);
      toast.success("Catalog item created", {
        description: "The item is now available in the admin catalog.",
      });
      await Promise.all([
        utils.catalog.adminList.invalidate(),
        utils.catalog.listPublished.invalidate(),
      ]);
    },
    onError: error =>
      toast.error("Could not create catalog item", {
        description: error.message,
      }),
  });
  const uploadCover = trpc.catalog.uploadCoverImage.useMutation({
    onSuccess: async () => {
      toast.success("Course cover uploaded", {
        description: "New social cards will include the artwork.",
      });
      await Promise.all([
        utils.catalog.adminList.invalidate(),
        utils.catalog.listPublished.invalidate(),
      ]);
    },
    onError: error =>
      toast.error("Could not upload course cover", {
        description: error.message,
      }),
  });
  const update = (key: keyof typeof form, value: string | boolean) =>
    setForm(current => ({ ...current, [key]: value }));
  const handleCoverUpload = (
    catalogItemId: number,
    title: string,
    file: File | undefined
  ) => {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      toast.error("Use PNG, JPEG, or WebP artwork.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Cover image must be 8 MB or smaller.");
      return;
    }
    setCropJob({ id: catalogItemId, title, file });
  };
  const completeCrop = (dataBase64: string, contentType: "image/png") => {
    if (!cropJob) return;
    uploadCover.mutate({
      catalogItemId: cropJob.id,
      filename: `${cropJob.file.name.replace(/\.[^.]+$/, "")}-framed.png`,
      contentType,
      dataBase64,
    });
    setCropJob(null);
  };
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    create.mutate({
      ...form,
      priceKes: Number(form.priceKes),
      outcomes: form.outcomes
        .split("\n")
        .map(item => item.trim())
        .filter(Boolean),
    });
  };
  return (
    <>
      {cropJob && (
        <CourseCoverCropper
          file={cropJob.file}
          title={cropJob.title}
          onCancel={() => setCropJob(null)}
          onComplete={completeCrop}
        />
      )}
      <section className="mt-10 border border-[#c9a34e]/60 bg-[#16243d] p-5 text-[#f7f3e8] sm:p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow text-[#c9a34e]">Content operations</p>
            <h2 className="display mt-2 text-3xl">Keep the catalog moving.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#c1cad7]">
              Create a catalog item once. Published items flow into the public
              catalog automatically; unpublished items remain private until
              reviewed.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void items.refetch()}
            className="inline-flex items-center gap-2 self-start border border-white/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] hover:border-[#c9a34e]"
          >
            <RefreshCw
              size={13}
              className={items.isFetching ? "animate-spin" : ""}
            />{" "}
            Refresh
          </button>
        </div>
        <form
          onSubmit={submit}
          className="mt-6 grid gap-3 border border-white/15 bg-[#1b3152] p-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <Field
            label="Slug"
            value={form.slug}
            onChange={value => update("slug", value)}
            placeholder="new-program"
            required
          />
          <Field
            label="Title"
            value={form.title}
            onChange={value => update("title", value)}
            placeholder="New professional pathway"
            required
          />
          <Field
            label="Strapline"
            value={form.strapline}
            onChange={value => update("strapline", value)}
            placeholder="A concise promise"
            required
          />
          <Field
            label="Audience"
            value={form.audience}
            onChange={value => update("audience", value)}
            placeholder="Who it serves"
            required
          />
          <Field
            label="Duration"
            value={form.duration}
            onChange={value => update("duration", value)}
            placeholder="6 weeks · online"
            required
          />
          <Field
            label="Price (KES)"
            value={form.priceKes}
            onChange={value => update("priceKes", value)}
            placeholder="4999"
            type="number"
            required
          />
          <label className="text-[10px] font-black uppercase tracking-[.12em] text-[#c1cad7]">
            Type
            <select
              value={form.itemType}
              onChange={event => update("itemType", event.target.value)}
              className="mt-2 w-full border border-white/20 bg-[#16243d] px-3 py-3 text-sm font-normal normal-case tracking-normal text-[#f7f3e8]"
            >
              <option value="course">Course</option>
              <option value="program">Program</option>
              <option value="service">Service</option>
            </select>
          </label>
          <label className="flex items-center gap-2 self-end pb-3 text-xs text-[#c1cad7]">
            <input
              type="checkbox"
              checked={form.published}
              onChange={event => update("published", event.target.checked)}
              className="accent-[#c9a34e]"
            />{" "}
            Publish immediately
          </label>
          <label className="text-[10px] font-black uppercase tracking-[.12em] text-[#c1cad7] sm:col-span-2 lg:col-span-4">
            Description
            <textarea
              value={form.description}
              onChange={event => update("description", event.target.value)}
              placeholder="Describe the practical value and context."
              required
              rows={3}
              className="mt-2 w-full border border-white/20 bg-[#16243d] px-3 py-3 text-sm font-normal normal-case tracking-normal text-[#f7f3e8] placeholder:text-[#8f9db3]"
            />
          </label>
          <label className="text-[10px] font-black uppercase tracking-[.12em] text-[#c1cad7] sm:col-span-2 lg:col-span-4">
            Outcomes{" "}
            <span className="font-normal normal-case tracking-normal">
              (one per line)
            </span>
            <textarea
              value={form.outcomes}
              onChange={event => update("outcomes", event.target.value)}
              placeholder={
                "Frame the next decision.\nBuild a practical capability."
              }
              required
              rows={3}
              className="mt-2 w-full border border-white/20 bg-[#16243d] px-3 py-3 text-sm font-normal normal-case tracking-normal text-[#f7f3e8] placeholder:text-[#8f9db3]"
            />
          </label>
          <button
            type="submit"
            disabled={create.isPending}
            className="inline-flex items-center justify-center gap-2 bg-[#c9a34e] px-4 py-3 text-[10px] font-black uppercase tracking-[.12em] text-[#16243d] disabled:cursor-wait disabled:opacity-60 sm:col-span-2 lg:col-span-4"
          >
            {create.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}{" "}
            {create.isPending ? "Creating…" : "Create catalog item"}
          </button>
        </form>
        <div className="mt-6 border-t border-white/15 pt-5">
          <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#c9a34e]">
            Database overlays
          </p>
          {items.isLoading ? (
            <p className="mt-3 text-sm text-[#c1cad7]">
              Loading catalog items…
            </p>
          ) : items.data?.length ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.data.map(item => (
                <article
                  key={item.id}
                  className="border border-white/15 bg-[#1b3152] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-bold">{item.title}</p>
                    <span
                      className={`text-[10px] font-black uppercase tracking-[.1em] ${item.published ? "text-emerald-300" : "text-[#c9a34e]"}`}
                    >
                      {item.published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[#c1cad7]">
                    /{item.slug} · KES {item.priceKes.toLocaleString()}
                  </p>
                  <div className="mt-4 overflow-hidden border border-white/10 bg-[#16243d]">
                    <div className="aspect-[16/8] bg-[#101d35]">
                      {item.coverImageUrl ? (
                        <img
                          src={item.coverImageUrl}
                          alt={`${item.title} course cover`}
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="grid size-full place-items-center text-[#8f9db3]">
                          <ImageIcon size={22} />
                        </div>
                      )}
                    </div>
                    <label className="flex cursor-pointer items-center justify-center gap-2 border-t border-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] text-[#c9a34e] hover:bg-white/5">
                      <Upload size={13} />{" "}
                      {uploadCover.isPending
                        ? "Uploading…"
                        : item.coverImageUrl
                          ? "Replace cover"
                          : "Upload cover"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="sr-only"
                        onChange={event =>
                          handleCoverUpload(
                            item.id,
                            item.title,
                            event.target.files?.[0]
                          )
                        }
                        disabled={uploadCover.isPending}
                      />
                    </label>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[#8f9db3]">
                    Updated {new Date(item.updatedAt).toLocaleDateString()}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-[#c1cad7]">
              No database overlays yet. The four code-defined courses remain
              live.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="text-[10px] font-black uppercase tracking-[.12em] text-[#c1cad7]">
      {label}
      <input
        required={required}
        type={type}
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full border border-white/20 bg-[#16243d] px-3 py-3 text-sm font-normal normal-case tracking-normal text-[#f7f3e8] placeholder:text-[#8f9db3]"
      />
    </label>
  );
}

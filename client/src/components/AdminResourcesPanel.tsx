import { trpc } from "@/lib/trpc";
import {
  Upload,
  Trash2,
  Plus,
  Save,
  FileText,
  Image,
  File,
  RefreshCw,
  ExternalLink,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type ResourceForm = {
  title: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  sortOrder: number;
  status: string;
  file: File | null;
  coverImage: File | null;
};

const emptyForm: ResourceForm = {
  title: "",
  description: "",
  category: "guide",
  price: 0,
  currency: "KES",
  sortOrder: 0,
  status: "draft",
  file: null,
  coverImage: null,
};

export default function AdminResourcesPanel() {
  const [form, setForm] = useState<ResourceForm>({ ...emptyForm });
  const [editingId, setEditingId] = useState<number | null>(null);
  const resources = trpc.admin.listResources.useQuery(undefined, {
    retry: false,
    refetchInterval: 30000,
  });
  const createMutation = trpc.admin.createResource.useMutation({
    onSuccess: () => {
      resources.refetch();
      toast.success("Resource created");
      setForm({ ...emptyForm });
    },
    onError: error => toast.error(error.message),
  });
  const updateMutation = trpc.admin.updateResource.useMutation({
    onSuccess: () => {
      resources.refetch();
      toast.success("Resource updated");
      setEditingId(null);
      setForm({ ...emptyForm });
    },
    onError: error => toast.error(error.message),
  });
  const deleteMutation = trpc.admin.deleteResource.useMutation({
    onSuccess: () => {
      resources.refetch();
      toast.success("Resource deleted");
    },
    onError: error => toast.error(error.message),
  });

  const readFileAsBase64 = (selected: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(selected);
    });

  const startEdit = (resource: {
    id: number;
    title: string;
    description: string;
    category: string;
    price: number;
    currency: string;
    sortOrder: number;
    status: string;
  }) => {
    setEditingId(resource.id);
    setForm({
      title: resource.title,
      description: resource.description,
      category: resource.category,
      price: resource.price ?? 0,
      currency: resource.currency ?? "KES",
      sortOrder: resource.sortOrder ?? 0,
      status: resource.status ?? "draft",
      file: null,
      coverImage: null,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
  };

  const handleCreate = async () => {
    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.category.trim()
    ) {
      toast.error("Title, description, and category are required");
      return;
    }
    try {
      const [fileBase64, coverBase64] = await Promise.all([
        form.file ? readFileAsBase64(form.file) : Promise.resolve(""),
        form.coverImage
          ? readFileAsBase64(form.coverImage)
          : Promise.resolve(""),
      ]);
      createMutation.mutate({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        price: form.price,
        currency: form.currency,
        fileUrl: fileBase64 || undefined,
        fileType: form.file?.type,
        fileSize: form.file?.size,
        coverImageUrl: coverBase64 || undefined,
        sortOrder: form.sortOrder,
      });
    } catch (error) {
      toast.error("Could not read files", {
        description: error instanceof Error ? error.message : "Try again.",
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.category.trim()
    ) {
      toast.error("Title, description, and category are required");
      return;
    }
    try {
      const [fileBase64, coverBase64] = await Promise.all([
        form.file ? readFileAsBase64(form.file) : Promise.resolve(""),
        form.coverImage
          ? readFileAsBase64(form.coverImage)
          : Promise.resolve(""),
      ]);
      updateMutation.mutate({
        id: editingId,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        price: form.price,
        currency: form.currency,
        fileUrl: fileBase64 || undefined,
        fileType: form.file?.type,
        fileSize: form.file?.size,
        coverImageUrl: coverBase64 || undefined,
        sortOrder: form.sortOrder,
        status: form.status as "draft" | "published",
      });
    } catch (error) {
      toast.error("Could not read files", {
        description: error instanceof Error ? error.message : "Try again.",
      });
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this resource? This cannot be undone.")) return;
    deleteMutation.mutate({ id });
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <section className="mt-10 border border-[#16243d]/15 bg-white/55 p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow flex items-center gap-2 text-[var(--brand)]">
            <Upload size={13} /> Resource library
          </p>
          <h2 className="display mt-3 text-3xl">
            {editingId ? "Edit resource" : "Upload and manage resources"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--fg-muted)]">
            Add guides, templates, videos, and other resources to the public
            Resources page. Use price 0 for free resources.
          </p>
        </div>
        {editingId && (
          <button
            type="button"
            onClick={cancelEdit}
            className="inline-flex items-center gap-2 border border-[#16243d]/20 px-4 py-2 text-[10px] font-black uppercase tracking-[.1em]"
          >
            <X size={13} /> Cancel
          </button>
        )}
      </div>

      <div className="mt-8 grid gap-4 border border-[#16243d]/10 bg-[#f7f3e8] p-4 sm:grid-cols-2">
        <label className="text-[10px] font-black uppercase tracking-[.1em] text-[var(--fg-muted)]">
          Title
          <input
            id="resource-title"
            name="title"
            value={form.title}
            onChange={event => setForm({ ...form, title: event.target.value })}
            placeholder="Resource title"
            className="mt-1 w-full border border-[#16243d]/20 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-[var(--fg)]"
          />
        </label>
        <label className="text-[10px] font-black uppercase tracking-[.1em] text-[var(--fg-muted)]">
          Category
          <input
            id="resource-category"
            name="category"
            value={form.category}
            onChange={event =>
              setForm({ ...form, category: event.target.value })
            }
            placeholder="guide, template, video..."
            className="mt-1 w-full border border-[#16243d]/20 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-[var(--fg)]"
          />
        </label>
        <label className="text-[10px] font-black uppercase tracking-[.1em] text-[var(--fg-muted)]">
          Price (KES)
          <input
            type="number"
            min="0"
            value={form.price}
            onChange={event =>
              setForm({ ...form, price: Number(event.target.value) })
            }
            placeholder="0 for free"
            className="mt-1 w-full border border-[#16243d]/20 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-[var(--fg)]"
          />
        </label>
        <label className="text-[10px] font-black uppercase tracking-[.1em] text-[var(--fg-muted)]">
          Currency
          <input
            value={form.currency}
            onChange={event =>
              setForm({ ...form, currency: event.target.value })
            }
            placeholder="KES"
            className="mt-1 w-full border border-[#16243d]/20 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-[var(--fg)]"
          />
        </label>
        <label className="sm:col-span-2 text-[10px] font-black uppercase tracking-[.1em] text-[var(--fg-muted)]">
          Description
          <textarea
            value={form.description}
            onChange={event =>
              setForm({ ...form, description: event.target.value })
            }
            placeholder="Short description of this resource"
            rows={3}
            className="mt-1 w-full border border-[#16243d]/20 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-[var(--fg)]"
          />
        </label>
        <label className="text-[10px] font-black uppercase tracking-[.1em] text-[var(--fg-muted)]">
          File
          <input
            type="file"
            onChange={event =>
              setForm({ ...form, file: event.target.files?.[0] ?? null })
            }
            className="mt-1 block w-full text-sm"
          />
          {form.file && (
            <span className="mt-1 block text-[11px] font-normal text-[var(--fg-muted)]">
              {form.file.name} · {(form.file.size / 1024).toFixed(1)} KB
            </span>
          )}
        </label>
        <label className="text-[10px] font-black uppercase tracking-[.1em] text-[var(--fg-muted)]">
          Cover image
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={event =>
              setForm({ ...form, coverImage: event.target.files?.[0] ?? null })
            }
            className="mt-1 block w-full text-sm"
          />
          {form.coverImage && (
            <span className="mt-1 block text-[11px] font-normal text-[var(--fg-muted)]">
              {form.coverImage.name} ·{" "}
              {(form.coverImage.size / 1024).toFixed(1)} KB
            </span>
          )}
        </label>
        <label className="text-[10px] font-black uppercase tracking-[.1em] text-[var(--fg-muted)]">
          Sort order
          <input
            type="number"
            value={form.sortOrder}
            onChange={event =>
              setForm({ ...form, sortOrder: Number(event.target.value) })
            }
            className="mt-1 w-full border border-[#16243d]/20 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-[var(--fg)]"
          />
        </label>
        <label className="text-[10px] font-black uppercase tracking-[.1em] text-[var(--fg-muted)]">
          Status
          <select
            value={form.status}
            onChange={event => setForm({ ...form, status: event.target.value })}
            className="mt-1 w-full border border-[#16243d]/20 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-[var(--fg)]"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <button
          type="button"
          onClick={editingId ? handleUpdate : handleCreate}
          disabled={isPending}
          className="mt-auto inline-flex items-center justify-center gap-2 bg-[#16243d] px-4 py-2 text-[10px] font-black uppercase tracking-[.1em] text-[#f7f3e8] disabled:opacity-40"
        >
          {isPending ? (
            <RefreshCw size={13} className="animate-spin" />
          ) : editingId ? (
            <Save size={13} />
          ) : (
            <Plus size={13} />
          )}
          {editingId ? "Update resource" : "Add resource"}
        </button>
      </div>

      <div className="mt-8 divide-y divide-[#16243d]/10 border-y border-[#16243d]/10">
        {resources.isLoading ? (
          <p className="py-6 text-sm text-[var(--fg-muted)]">Loading resources…</p>
        ) : (resources.data ?? []).length === 0 ? (
          <p className="py-6 text-sm text-[var(--fg-muted)]">No resources yet.</p>
        ) : (
          (resources.data ?? []).map(resource => (
            <div
              key={resource.id}
              className="flex flex-wrap items-start justify-between gap-3 py-4"
            >
              <div className="min-w-0">
                <p className="font-bold">{resource.title}</p>
                <p className="text-xs text-[var(--fg-muted)]">{resource.description}</p>
                <div className="mt-1 flex flex-wrap gap-2 text-[10px] uppercase tracking-[.1em] text-[var(--brand)]">
                  <span className="rounded-full border border-[#16243d]/15 px-2 py-0.5">
                    {resource.category}
                  </span>
                  <span className="rounded-full border border-[#16243d]/15 px-2 py-0.5">
                    {resource.status}
                  </span>
                  <span className="rounded-full border border-[#16243d]/15 px-2 py-0.5">
                    {resource.price === 0
                      ? "Free"
                      : `${resource.price} ${resource.currency ?? "KES"}`}
                  </span>
                  {resource.fileUrl && (
                    <a
                      href={resource.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-[#16243d]/15 px-2 py-0.5 hover:text-[var(--brand)]"
                    >
                      <ExternalLink size={10} /> File
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(resource)}
                  className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[.1em] text-[var(--brand)]"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(resource.id)}
                  className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[.1em] text-red-700"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

import { trpc } from "@/lib/trpc";
import {
  Upload,
  Trash2,
  Plus,
  FileText,
  Image,
  File,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function AdminResourcesPanel() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("guide");
  const [price, setPrice] = useState(0);
  const [currency, setCurrency] = useState("KES");
  const [file, setFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [sortOrder, setSortOrder] = useState(0);
  const resources = trpc.admin.listResources.useQuery(undefined, {
    retry: false,
    refetchInterval: 30000,
  });
  const createMutation = trpc.admin.createResource.useMutation({
    onSuccess: () => {
      resources.refetch();
      toast.success("Resource created");
      setTitle("");
      setDescription("");
      setFile(null);
      setCoverImage(null);
      setSortOrder(0);
    },
    onError: error => toast.error(error.message),
  });
  const updateMutation = trpc.admin.updateResource.useMutation({
    onSuccess: () => {
      resources.refetch();
      toast.success("Resource updated");
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
  const [editingId, setEditingId] = useState<number | null>(null);

  const readFileAsBase64 = (selected: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(selected);
    });

  const handleCreate = async () => {
    if (!title.trim() || !description.trim() || !category.trim()) {
      toast.error("Title, description, and category are required");
      return;
    }
    try {
      const [fileBase64, coverBase64] = await Promise.all([
        file ? readFileAsBase64(file) : Promise.resolve(""),
        coverImage ? readFileAsBase64(coverImage) : Promise.resolve(""),
      ]);
      createMutation.mutate({
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        price,
        currency,
        fileUrl: fileBase64 || undefined,
        fileType: file?.type,
        fileSize: file?.size,
        coverImageUrl: coverBase64 || undefined,
        sortOrder,
      });
    } catch (error) {
      toast.error("Could not read files", {
        description: error instanceof Error ? error.message : "Try again.",
      });
    }
  };

  const handleUpdate = (id: number) => {
    updateMutation.mutate({ id, sortOrder });
    setEditingId(null);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this resource? This cannot be undone.")) return;
    deleteMutation.mutate({ id });
  };

  return (
    <section className="mt-10 border border-[#16243d]/15 bg-white/55 p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow flex items-center gap-2 text-[#7d5e1e]">
            <Upload size={13} /> Resource library
          </p>
          <h2 className="display mt-3 text-3xl">
            Upload and manage resources
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[#657084]">
            Add guides, templates, videos, and other resources to the public
            Resources page.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 border border-[#16243d]/10 bg-[#f7f3e8] p-4 sm:grid-cols-2">
        <label className="text-[10px] font-black uppercase tracking-[.1em] text-[#657084]">
          Title
          <input
            value={title}
            onChange={event => setTitle(event.target.value)}
            placeholder="Resource title"
            className="mt-1 w-full border border-[#16243d]/20 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#16243d]"
          />
        </label>
        <label className="text-[10px] font-black uppercase tracking-[.1em] text-[#657084]">
          Category
          <input
            value={category}
            onChange={event => setCategory(event.target.value)}
            placeholder="guide, template, video..."
            className="mt-1 w-full border border-[#16243d]/20 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#16243d]"
          />
        </label>
        <label className="text-[10px] font-black uppercase tracking-[.1em] text-[#657084]">
          Price (KES)
          <input
            type="number"
            min="0"
            value={price}
            onChange={event => setPrice(Number(event.target.value))}
            placeholder="0 for free"
            className="mt-1 w-full border border-[#16243d]/20 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#16243d]"
          />
        </label>
        <label className="text-[10px] font-black uppercase tracking-[.1em] text-[#657084]">
          Currency
          <input
            value={currency}
            onChange={event => setCurrency(event.target.value)}
            placeholder="KES"
            className="mt-1 w-full border border-[#16243d]/20 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#16243d]"
          />
        </label>
        <label className="sm:col-span-2 text-[10px] font-black uppercase tracking-[.1em] text-[#657084]">
          Description
          <textarea
            value={description}
            onChange={event => setDescription(event.target.value)}
            placeholder="Short description of this resource"
            rows={3}
            className="mt-1 w-full border border-[#16243d]/20 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#16243d]"
          />
        </label>
        <label className="text-[10px] font-black uppercase tracking-[.1em] text-[#657084]">
          File
          <input
            type="file"
            onChange={event => setFile(event.target.files?.[0] ?? null)}
            className="mt-1 block w-full text-sm"
          />
          {file && (
            <span className="mt-1 block text-[11px] font-normal text-[#657084]">
              {file.name} · {(file.size / 1024).toFixed(1)} KB
            </span>
          )}
        </label>
        <label className="text-[10px] font-black uppercase tracking-[.1em] text-[#657084]">
          Cover image
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={event =>
              setCoverImage(event.target.files?.[0] ?? null)
            }
            className="mt-1 block w-full text-sm"
          />
          {coverImage && (
            <span className="mt-1 block text-[11px] font-normal text-[#657084]">
              {coverImage.name} · {(coverImage.size / 1024).toFixed(1)} KB
            </span>
          )}
        </label>
        <label className="text-[10px] font-black uppercase tracking-[.1em] text-[#657084]">
          Sort order
          <input
            type="number"
            value={sortOrder}
            onChange={event => setSortOrder(Number(event.target.value))}
            className="mt-1 w-full border border-[#16243d]/20 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#16243d]"
          />
        </label>
        <button
          type="button"
          onClick={handleCreate}
          disabled={createMutation.isPending}
          className="mt-auto inline-flex items-center justify-center gap-2 bg-[#16243d] px-4 py-2 text-[10px] font-black uppercase tracking-[.1em] text-[#f7f3e8] disabled:opacity-40"
        >
          {createMutation.isPending ? (
            <RefreshCw size={13} className="animate-spin" />
          ) : (
            <Plus size={13} />
          )}
          Add resource
        </button>
      </div>

      <div className="mt-8 divide-y divide-[#16243d]/10 border-y border-[#16243d]/10">
        {resources.isLoading ? (
          <p className="py-6 text-sm text-[#657084]">Loading resources…</p>
        ) : (resources.data ?? []).length === 0 ? (
          <p className="py-6 text-sm text-[#657084]">No resources yet.</p>
        ) : (
          (resources.data ?? []).map(resource => (
            <div
              key={resource.id}
              className="flex flex-wrap items-start justify-between gap-3 py-4"
            >
              <div className="min-w-0">
                <p className="font-bold">{resource.title}</p>
                <p className="text-xs text-[#657084]">{resource.description}</p>
                <div className="mt-1 flex flex-wrap gap-2 text-[10px] uppercase tracking-[.1em] text-[#7d5e1e]">
                  <span className="rounded-full border border-[#16243d]/15 px-2 py-0.5">
                    {resource.category}
                  </span>
                  <span className="rounded-full border border-[#16243d]/15 px-2 py-0.5">
                    {resource.status}
                  </span>
                  {resource.fileUrl && (
                    <a
                      href={resource.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-[#16243d]/15 px-2 py-0.5 hover:text-[#7d5e1e]"
                    >
                      <ExternalLink size={10} /> File
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingId(resource.id)}
                  className="text-[10px] font-black uppercase tracking-[.1em] text-[#7d5e1e]"
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
              {editingId === resource.id && (
                <div className="mt-3 w-full rounded-lg border border-[#16243d]/10 bg-[#f7f3e8] p-3">
                  <label className="text-[10px] font-black uppercase tracking-[.1em] text-[#657084]">
                    Sort order
                    <input
                      type="number"
                      defaultValue={resource.sortOrder}
                      onBlur={event =>
                        editingId && handleUpdate(editingId)
                      }
                      className="mt-1 w-full border border-[#16243d]/20 bg-white px-3 py-2 text-sm"
                    />
                  </label>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

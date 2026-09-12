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
  const [fileUrl, setFileUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
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
      setFileUrl("");
      setCoverImageUrl("");
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

  const handleCreate = () => {
    if (!title.trim() || !description.trim() || !category.trim()) {
      toast.error("Title, description, and category are required");
      return;
    }
    createMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      fileUrl: fileUrl.trim() || undefined,
      coverImageUrl: coverImageUrl.trim() || undefined,
      sortOrder,
    });
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
          <p className="eyebrow flex items-center gap-2 text-[#a27e2e]">
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
          File URL
          <input
            value={fileUrl}
            onChange={event => setFileUrl(event.target.value)}
            placeholder="https://..."
            className="mt-1 w-full border border-[#16243d]/20 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#16243d]"
          />
        </label>
        <label className="text-[10px] font-black uppercase tracking-[.1em] text-[#657084]">
          Cover image URL
          <input
            value={coverImageUrl}
            onChange={event => setCoverImageUrl(event.target.value)}
            placeholder="https://..."
            className="mt-1 w-full border border-[#16243d]/20 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#16243d]"
          />
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
                      className="inline-flex items-center gap-1 rounded-full border border-[#16243d]/15 px-2 py-0.5 hover:text-[#a27e2e]"
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

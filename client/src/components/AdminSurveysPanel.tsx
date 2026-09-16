import { trpc } from "@/lib/trpc";
import {
  Plus,
  RefreshCw,
  Trash2,
  BarChart3,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function AdminSurveysPanel() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"poll" | "survey" | "review">("poll");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [status, setStatus] = useState<"draft" | "published" | "closed">("draft");
  const surveys = trpc.admin.listSurveys.useQuery(undefined, {
    retry: false,
    refetchInterval: 30000,
  });
  const createMutation = trpc.admin.createSurvey.useMutation({
    onSuccess: () => {
      surveys.refetch();
      toast.success("Survey created");
      setTitle("");
      setDescription("");
      setType("poll");
      setOptions(["", ""]);
      setStatus("draft");
    },
    onError: error => toast.error(error.message),
  });
  const updateMutation = trpc.admin.updateSurvey.useMutation({
    onSuccess: () => {
      surveys.refetch();
      toast.success("Survey updated");
    },
    onError: error => toast.error(error.message),
  });
  const deleteMutation = trpc.admin.deleteSurvey.useMutation({
    onSuccess: () => {
      surveys.refetch();
      toast.success("Survey deleted");
    },
    onError: error => toast.error(error.message),
  });

  const handleCreate = () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    const validOptions = options.filter(o => o.trim());
    if (validOptions.length < 2) {
      toast.error("At least 2 options are required");
      return;
    }
    createMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      type,
      options: validOptions,
    });
  };

  const handleStatusChange = (id: number, newStatus: "draft" | "published" | "closed") => {
    updateMutation.mutate({ id, status: newStatus });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this survey? This cannot be undone.")) return;
    deleteMutation.mutate({ id });
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  };

  const updateOption = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const statusIcon = {
    draft: <Clock3 size={14} className="text-[#7d5e1e]" />,
    published: <CheckCircle2 size={14} className="text-emerald-600" />,
    closed: <XCircle size={14} className="text-red-600" />,
  };

  return (
    <section className="mt-10 border border-[#16243d]/15 bg-white/55 p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow flex items-center gap-2 text-[#7d5e1e]">
            <BarChart3 size={13} /> Engagement & feedback
          </p>
          <h2 className="display mt-3 text-3xl">
            Surveys, polls, and reviews
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[#657084]">
            Create polls, surveys, and product reviews to engage visitors and
            collect feedback.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 border border-[#16243d]/10 bg-[#f7f3e8] p-4 lg:grid-cols-2">
        <label className="lg:col-span-2 text-[10px] font-black uppercase tracking-[.1em] text-[#657084]">
          Title
          <input
            value={title}
            onChange={event => setTitle(event.target.value)}
            placeholder="What do you want to ask?"
            className="mt-1 w-full border border-[#16243d]/20 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#16243d]"
          />
        </label>
        <label className="lg:col-span-2 text-[10px] font-black uppercase tracking-[.1em] text-[#657084]">
          Description
          <textarea
            value={description}
            onChange={event => setDescription(event.target.value)}
            placeholder="Provide context for this survey"
            rows={3}
            className="mt-1 w-full border border-[#16243d]/20 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#16243d]"
          />
        </label>
        <label className="text-[10px] font-black uppercase tracking-[.1em] text-[#657084]">
          Type
          <select
            value={type}
            onChange={event =>
              setType(event.target.value as "poll" | "survey" | "review")
            }
            className="mt-1 w-full border border-[#16243d]/20 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#16243d]"
          >
            <option value="poll">Poll</option>
            <option value="survey">Survey</option>
            <option value="review">Product review</option>
          </select>
        </label>
        <label className="text-[10px] font-black uppercase tracking-[.1em] text-[#657084]">
          Status
          <select
            value={status}
            onChange={event =>
              setStatus(
                event.target.value as "draft" | "published" | "closed"
              )
            }
            className="mt-1 w-full border border-[#16243d]/20 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#16243d]"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="closed">Closed</option>
          </select>
        </label>
        <div className="lg:col-span-2">
          <p className="text-[10px] font-black uppercase tracking-[.1em] text-[#657084]">
            Options
          </p>
          <div className="mt-2 space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  value={option}
                  onChange={event => updateOption(index, event.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 border border-[#16243d]/20 bg-white px-3 py-2 text-sm"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="text-[10px] font-black uppercase tracking-[.1em] text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {options.length < 6 && (
              <button
                type="button"
                onClick={addOption}
                className="text-[10px] font-black uppercase tracking-[.1em] text-[#7d5e1e]"
              >
                + Add option
              </button>
            )}
          </div>
        </div>
        <div className="lg:col-span-2">
          <button
            type="button"
            onClick={handleCreate}
            disabled={createMutation.isPending}
            className="inline-flex items-center justify-center gap-2 bg-[#16243d] px-4 py-2 text-[10px] font-black uppercase tracking-[.1em] text-[#f7f3e8] disabled:opacity-40"
          >
            {createMutation.isPending ? (
              <RefreshCw size={13} className="animate-spin" />
            ) : (
              <Plus size={13} />
            )}
            Create survey
          </button>
        </div>
      </div>

      <div className="mt-8 divide-y divide-[#16243d]/10 border-y border-[#16243d]/10">
        {surveys.isLoading ? (
          <p className="py-6 text-sm text-[#657084]">Loading surveys…</p>
        ) : (surveys.data ?? []).length === 0 ? (
          <p className="py-6 text-sm text-[#657084]">No surveys yet.</p>
        ) : (
          (surveys.data ?? []).map(survey => (
            <div
              key={survey.id}
              className="flex flex-wrap items-start justify-between gap-3 py-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold">{survey.title}</p>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#16243d]/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-[.1em] text-[#7d5e1e]">
                    {survey.type}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#657084]">
                  {survey.description}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#657084]">
                  <span className="inline-flex items-center gap-1">
                    {statusIcon[survey.status as keyof typeof statusIcon]}
                    {survey.status}
                  </span>
                  <span>
                    {survey.totalResponses} response{survey.totalResponses === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={survey.status}
                  onChange={event =>
                    handleStatusChange(
                      survey.id,
                      event.target.value as "draft" | "published" | "closed"
                    )
                  }
                  className="border border-[#16243d]/20 bg-[#f7f3e8] px-2 py-1 text-xs"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="closed">Closed</option>
                </select>
                <button
                  type="button"
                  onClick={() => handleDelete(survey.id)}
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

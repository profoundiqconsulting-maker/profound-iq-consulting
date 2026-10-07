import { trpc } from "@/lib/trpc";
import {
  Plus,
  RefreshCw,
  Trash2,
  BarChart3,
  CheckCircle2,
  Clock3,
  XCircle,
  GripVertical,
  Eye,
  Settings,
  ChevronDown,
  ChevronUp,
  X,
  Save,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type QuestionType = "single_choice" | "multiple_choice" | "text" | "rating" | "yes_no";

type Question = {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
  minRating?: number;
  maxRating?: number;
};

type SurveyType = "poll" | "survey" | "review";
type SurveyStatus = "draft" | "published" | "closed";

const QUESTION_TYPES: { value: QuestionType; label: string; description: string }[] = [
  { value: "single_choice", label: "Single choice", description: "One answer from a list" },
  { value: "multiple_choice", label: "Multiple choice", description: "One or more answers" },
  { value: "text", label: "Text answer", description: "Open-ended response" },
  { value: "rating", label: "Rating scale", description: "Numeric rating" },
  { value: "yes_no", label: "Yes / No", description: "Binary choice" },
];

function createQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: crypto.randomUUID(),
    type: "single_choice",
    title: "",
    description: "",
    required: true,
    options: ["", ""],
    ...overrides,
  };
}

export default function AdminSurveysPanel() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<SurveyType>("survey");
  const [status, setStatus] = useState<SurveyStatus>("draft");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const surveys = trpc.admin.listSurveys.useQuery(undefined, {
    retry: false,
    refetchInterval: 30000,
  });
  const createMutation = trpc.admin.createSurvey.useMutation({
    onSuccess: () => {
      surveys.refetch();
      toast.success("Survey created");
      resetForm();
    },
    onError: error => toast.error(error.message),
  });
  const updateMutation = trpc.admin.updateSurvey.useMutation({
    onSuccess: () => {
      surveys.refetch();
      toast.success("Survey updated");
      setEditingId(null);
      resetForm();
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

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setType("survey");
    setStatus("draft");
    setQuestions([]);
    setExpandedQuestion(null);
    setPreviewMode(false);
    setEditingId(null);
  };

  const startEdit = (survey: {
    id: number;
    title: string;
    description: string;
    type: SurveyType;
    status: SurveyStatus;
    questions?: Question[] | null;
    startsAt?: string | null;
    endsAt?: string | null;
  }) => {
    setEditingId(survey.id);
    setTitle(survey.title);
    setDescription(survey.description);
    setType(survey.type);
    setStatus(survey.status);
    setQuestions(
      survey.questions && survey.questions.length > 0
        ? survey.questions.map(q => ({ ...q, id: q.id || crypto.randomUUID() }))
        : []
    );
    setExpandedQuestion(null);
    setPreviewMode(false);
  };

  const addQuestion = (questionType: QuestionType = "single_choice") => {
    const newQuestion = createQuestion({ type: questionType });
    setQuestions([...questions, newQuestion]);
    setExpandedQuestion(newQuestion.id);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
    if (expandedQuestion === id) setExpandedQuestion(null);
  };

  const moveQuestion = (id: string, direction: "up" | "down") => {
    const index = questions.findIndex(q => q.id === id);
    if (index === -1) return;
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;
    const updated = [...questions];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setQuestions(updated);
  };

  const addOption = (questionId: string) => {
    updateQuestion(questionId, {
      options: [...(questions.find(q => q.id === questionId)?.options || []), ""],
    });
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question?.options) return;
    const updated = [...question.options];
    updated[optionIndex] = value;
    updateQuestion(questionId, { options: updated });
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    const question = questions.find(q => q.id === questionId);
    if (!question?.options || question.options.length <= 2) return;
    updateQuestion(questionId, { options: question.options.filter((_, i) => i !== optionIndex) });
  };

  const handleCreate = () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    if (questions.length === 0) {
      toast.error("Add at least one question");
      return;
    }
    const validQuestions = questions.filter(q => q.title.trim());
    if (validQuestions.length === 0) {
      toast.error("All questions must have a title");
      return;
    }
    for (const q of validQuestions) {
      if ((q.type === "single_choice" || q.type === "multiple_choice") && (!q.options || q.options.filter(o => o.trim()).length < 2)) {
        toast.error(`Question "${q.title}" needs at least 2 options`);
        return;
      }
    }
    createMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      type,
      options: [],
      questions: validQuestions.map(q => ({
        id: q.id,
        type: q.type,
        title: q.title.trim(),
        description: q.description?.trim() || undefined,
        required: q.required,
        ...(q.options ? { options: q.options.filter(o => o.trim()) } : {}),
        ...(q.minRating !== undefined ? { minRating: q.minRating } : {}),
        ...(q.maxRating !== undefined ? { maxRating: q.maxRating } : {}),
      })),
      startsAt: undefined,
      endsAt: undefined,
    });
  };

  const handleUpdate = () => {
    if (!editingId) return;
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    if (questions.length === 0) {
      toast.error("Add at least one question");
      return;
    }
    const validQuestions = questions.filter(q => q.title.trim());
    if (validQuestions.length === 0) {
      toast.error("All questions must have a title");
      return;
    }
    for (const q of validQuestions) {
      if ((q.type === "single_choice" || q.type === "multiple_choice") && (!q.options || q.options.filter(o => o.trim()).length < 2)) {
        toast.error(`Question "${q.title}" needs at least 2 options`);
        return;
      }
    }
    updateMutation.mutate({
      id: editingId,
      title: title.trim(),
      description: description.trim(),
      type,
      status,
      options: [],
      questions: validQuestions.map(q => ({
        id: q.id,
        type: q.type,
        title: q.title.trim(),
        description: q.description?.trim() || undefined,
        required: q.required,
        ...(q.options ? { options: q.options.filter(o => o.trim()) } : {}),
        ...(q.minRating !== undefined ? { minRating: q.minRating } : {}),
        ...(q.maxRating !== undefined ? { maxRating: q.maxRating } : {}),
      })),
      startsAt: undefined,
      endsAt: undefined,
    });
  };

  const handleStatusChange = (id: number, newStatus: SurveyStatus) => {
    updateMutation.mutate({ id, status: newStatus });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this survey? This cannot be undone.")) return;
    deleteMutation.mutate({ id });
  };

  const statusIcon = {
    draft: <Clock3 size={14} className="text-[#b8860b]" />,
    published: <CheckCircle2 size={14} className="text-emerald-700" />,
    closed: <XCircle size={14} className="text-red-600" />,
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <section className="mt-10 border border-[#16243d]/15 bg-white/55 p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow flex items-center gap-2 text-[#b8860b]">
            <BarChart3 size={13} /> Engagement & feedback
          </p>
          <h2 className="display mt-3 text-3xl">
            {editingId ? "Edit survey" : "Surveys, polls, and reviews"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[#475569]">
            Create structured surveys with multiple question types, or use simple polls for quick feedback.
          </p>
        </div>
        {editingId && (
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center gap-2 border border-[#16243d]/20 px-4 py-2 text-[10px] font-black uppercase tracking-[.1em]"
          >
            <X size={13} /> Cancel
          </button>
        )}
      </div>

      <div className="mt-8 grid gap-4 border border-[#16243d]/10 bg-[#f7f3e8] p-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="lg:col-span-2 text-[10px] font-black uppercase tracking-[.1em] text-[#475569]">
            Title
            <input
              value={title}
              onChange={event => setTitle(event.target.value)}
              placeholder="What do you want to ask?"
              className="mt-1 w-full border border-[#16243d]/20 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#16243d]"
            />
          </label>
          <label className="lg:col-span-2 text-[10px] font-black uppercase tracking-[.1em] text-[#475569]">
            Description
            <textarea
              value={description}
              onChange={event => setDescription(event.target.value)}
              placeholder="Provide context for this survey"
              rows={3}
              className="mt-1 w-full border border-[#16243d]/20 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#16243d]"
            />
          </label>
          <label className="text-[10px] font-black uppercase tracking-[.1em] text-[#475569]">
            Type
            <select
              value={type}
              onChange={event => setType(event.target.value as SurveyType)}
              className="mt-1 w-full border border-[#16243d]/20 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#16243d]"
            >
              <option value="poll">Poll</option>
              <option value="survey">Survey</option>
              <option value="review">Product review</option>
            </select>
          </label>
          <label className="text-[10px] font-black uppercase tracking-[.1em] text-[#475569]">
            Status
            <select
              value={status}
              onChange={event => setStatus(event.target.value as SurveyStatus)}
              className="mt-1 w-full border border-[#16243d]/20 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-[#16243d]"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="closed">Closed</option>
            </select>
          </label>
        </div>

        <div className="mt-4 border-t border-[#16243d]/10 pt-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[.1em] text-[#475569]">
              Questions ({questions.length})
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className="inline-flex items-center gap-1 border border-[#16243d]/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.1em]"
              >
                <Eye size={12} /> {previewMode ? "Edit" : "Preview"}
              </button>
              <div className="relative group">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 bg-[#16243d] px-3 py-1.5 text-[10px] font-black uppercase tracking-[.1em] text-[#f7f3e8]"
                >
                  <Plus size={12} /> Add question
                </button>
                <div className="absolute right-0 top-full z-10 mt-1 hidden w-48 border border-[#16243d]/10 bg-white shadow-md group-hover:block">
                  {QUESTION_TYPES.map(qt => (
                    <button
                      key={qt.value}
                      type="button"
                      onClick={() => addQuestion(qt.value)}
                      className="block w-full px-3 py-2 text-left text-xs hover:bg-[#f7f3e8]"
                    >
                      <p className="font-bold">{qt.label}</p>
                      <p className="text-[10px] text-[#475569]">{qt.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {previewMode ? (
            <div className="mt-4 space-y-4">
              {questions.length === 0 ? (
                <p className="py-6 text-sm text-[#475569]">No questions added yet.</p>
              ) : (
                questions.map((q, index) => (
                  <div key={q.id} className="border border-[#16243d]/10 bg-white p-4">
                    <p className="text-xs font-bold text-[#475569]">Q{index + 1}. {q.type.replace("_", " ")}</p>
                    <p className="mt-1 font-semibold">{q.title || "Untitled question"}</p>
                    {q.description && <p className="mt-1 text-sm text-[#475569]">{q.description}</p>}
                    <p className="mt-2 text-xs text-[#475569]">{q.required ? "Required" : "Optional"}</p>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {questions.length === 0 && (
                <p className="py-6 text-sm text-[#475569]">No questions yet. Add a question to get started.</p>
              )}
              {questions.map((q, index) => (
                <div key={q.id} className="border border-[#16243d]/10 bg-white">
                  <div className="flex items-center gap-2 border-b border-[#16243d]/10 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => moveQuestion(q.id, "up")}
                      disabled={index === 0}
                      className="disabled:opacity-30"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveQuestion(q.id, "down")}
                      disabled={index === questions.length - 1}
                      className="disabled:opacity-30"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <span className="text-xs font-bold text-[#475569]">Q{index + 1}</span>
                    <span className="text-xs font-black uppercase tracking-[.1em] text-[#b8860b]">
                      {q.type.replace("_", " ")}
                    </span>
                    <span className="flex-1 truncate text-sm font-semibold">
                      {q.title || "Untitled question"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
                      className="text-[#475569]"
                    >
                      <Settings size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeQuestion(q.id)}
                      className="text-red-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {expandedQuestion === q.id && (
                    <div className="space-y-3 p-4">
                      <label className="block text-[10px] font-black uppercase tracking-[.1em] text-[#475569]">
                        Question type
                        <select
                          value={q.type}
                          onChange={event => updateQuestion(q.id, { type: event.target.value as QuestionType })}
                          className="mt-1 w-full border border-[#16243d]/20 bg-white px-3 py-2 text-sm"
                        >
                          {QUESTION_TYPES.map(qt => (
                            <option key={qt.value} value={qt.value}>{qt.label} - {qt.description}</option>
                          ))}
                        </select>
                      </label>
                      <label className="block text-[10px] font-black uppercase tracking-[.1em] text-[#475569]">
                        Question title
                        <input
                          value={q.title}
                          onChange={event => updateQuestion(q.id, { title: event.target.value })}
                          placeholder="Enter your question"
                          className="mt-1 w-full border border-[#16243d]/20 bg-white px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="block text-[10px] font-black uppercase tracking-[.1em] text-[#475569]">
                        Description (optional)
                        <input
                          value={q.description || ""}
                          onChange={event => updateQuestion(q.id, { description: event.target.value })}
                          placeholder="Additional context"
                          className="mt-1 w-full border border-[#16243d]/20 bg-white px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={q.required}
                          onChange={event => updateQuestion(q.id, { required: event.target.checked })}
                          className="accent-[#a27e2e]"
                        />
                        Required question
                      </label>

                      {(q.type === "single_choice" || q.type === "multiple_choice") && (
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[.1em] text-[#475569]">Options</p>
                          <div className="mt-2 space-y-2">
                            {(q.options || []).map((option, optIndex) => (
                              <div key={optIndex} className="flex gap-2">
                                <input
                                  value={option}
                                  onChange={event => updateOption(q.id, optIndex, event.target.value)}
                                  placeholder={`Option ${optIndex + 1}`}
                                  className="flex-1 border border-[#16243d]/20 bg-white px-3 py-2 text-sm"
                                />
                                {(q.options?.length || 0) > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => removeOption(q.id, optIndex)}
                                    className="text-[10px] font-black uppercase tracking-[.1em] text-red-700"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => addOption(q.id)}
                              className="text-[10px] font-black uppercase tracking-[.1em] text-[#b8860b]"
                            >
                              + Add option
                            </button>
                          </div>
                        </div>
                      )}

                      {q.type === "rating" && (
                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="text-[10px] font-black uppercase tracking-[.1em] text-[#475569]">
                            Minimum rating
                            <input
                              type="number"
                              min={1}
                              max={10}
                              value={q.minRating ?? 1}
                              onChange={event => updateQuestion(q.id, { minRating: Number(event.target.value) })}
                              className="mt-1 w-full border border-[#16243d]/20 bg-white px-3 py-2 text-sm"
                            />
                          </label>
                          <label className="text-[10px] font-black uppercase tracking-[.1em] text-[#475569]">
                            Maximum rating
                            <input
                              type="number"
                              min={1}
                              max={10}
                              value={q.maxRating ?? 5}
                              onChange={event => updateQuestion(q.id, { maxRating: Number(event.target.value) })}
                              className="mt-1 w-full border border-[#16243d]/20 bg-white px-3 py-2 text-sm"
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <button
            type="button"
            onClick={editingId ? handleUpdate : handleCreate}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 bg-[#16243d] px-4 py-2 text-[10px] font-black uppercase tracking-[.1em] text-[#f7f3e8] disabled:opacity-40"
          >
            {isPending ? (
              <RefreshCw size={13} className="animate-spin" />
            ) : editingId ? (
              <Save size={13} />
            ) : (
              <Plus size={13} />
            )}
            {editingId ? "Update survey" : "Create survey"}
          </button>
        </div>
      </div>

      <div className="mt-8 divide-y divide-[#16243d]/10 border-y border-[#16243d]/10">
        {surveys.isLoading ? (
          <p className="py-6 text-sm text-[#475569]">Loading surveys…</p>
        ) : (surveys.data ?? []).length === 0 ? (
          <p className="py-6 text-sm text-[#475569]">No surveys yet.</p>
        ) : (
          (surveys.data ?? []).map(survey => (
            <div
              key={survey.id}
              className="flex flex-wrap items-start justify-between gap-3 py-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold">{survey.title}</p>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#16243d]/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-[.1em] text-[#b8860b]">
                    {survey.type}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#475569]">
                  {survey.description}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#475569]">
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
                <button
                  type="button"
                  onClick={() => startEdit(survey as Parameters<typeof startEdit>[0])}
                  className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[.1em] text-[#b8860b]"
                >
                  Edit
                </button>
                <select
                  value={survey.status}
                  onChange={event =>
                    handleStatusChange(
                      survey.id,
                      event.target.value as SurveyStatus
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



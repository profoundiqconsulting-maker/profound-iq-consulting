import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type ReflectionStatus = "planned" | "active" | "reviewed";

type ReflectionPromptCardProps = {
  prompt: string;
  note: string;
  status: ReflectionStatus;
  selected: boolean;
  saving: boolean;
  onNoteChange: (note: string) => void;
  onStatusChange: (status: ReflectionStatus) => void;
  onSelectedChange: (selected: boolean) => void;
  onSave: () => void;
  /** Unique identifier for this card (used for form field ids/names) */
  cardId: string;
};

const statusLabels: Record<ReflectionStatus, string> = {
  planned: "Planned",
  active: "Active",
  reviewed: "Reviewed",
};

export function ReflectionPromptCard({
  prompt,
  note,
  status,
  selected,
  saving,
  onNoteChange,
  onStatusChange,
  onSelectedChange,
  onSave,
  cardId,
}: ReflectionPromptCardProps) {
  const noteId = `${cardId}-note`;
  const statusId = `${cardId}-status`;
  const selectedId = `${cardId}-selected`;
  const noteName = `reflection_note_${cardId}`;
  const statusName = `reflection_status_${cardId}`;
  const selectedName = `reflection_selected_${cardId}`;

  return (
    <article className="border-l border-[#c9a34e] bg-[#fffaf0]/70 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="mt-1 text-[#7d5e1e]">→</span>
        <p className="text-sm leading-6 text-[#4a566a]">{prompt}</p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="block text-[10px] font-black uppercase tracking-[.12em] text-[#657084]">
          Your reflection note
          <textarea
            id={noteId}
            name={noteName}
            value={note}
            onChange={event => onNoteChange(event.target.value)}
            placeholder="Capture a recent example, decision, or next action…"
            rows={3}
            className="mt-2 w-full resize-y border border-[#16243d]/15 bg-white px-3 py-3 text-sm font-normal normal-case tracking-normal text-[#16243d] outline-none transition focus:border-[#a27e2e]"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <label className="text-[10px] font-black uppercase tracking-[.1em] text-[#657084]">
            Action status
            <select
              id={statusId}
              name={statusName}
              value={status}
              onChange={event =>
                onStatusChange(event.target.value as ReflectionStatus)
              }
              className="mt-2 block border border-[#16243d]/15 bg-white px-3 py-2 text-xs font-normal normal-case tracking-normal text-[#16243d] outline-none focus:border-[#a27e2e]"
              aria-label="Reflection action status"
            >
              {(Object.keys(statusLabels) as ReflectionStatus[]).map(value => (
                <option key={value} value={value}>
                  {statusLabels[value]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 self-end pb-2 text-[10px] font-black uppercase tracking-[.1em] text-[#657084]">
            <input
              id={selectedId}
              name={selectedName}
              type="checkbox"
              checked={selected}
              onChange={event => onSelectedChange(event.target.checked)}
              className="h-4 w-4 accent-[#c9a34e]"
            />{" "}
            Include in export
          </label>
          <Button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="self-end bg-[#16243d] px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] text-[#f7f3e8]"
          >
            {saving ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Check size={13} /> Save note
              </>
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}

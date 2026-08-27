import { useMemo, useState } from "react";
import { Check, RotateCcw, ShieldCheck } from "lucide-react";
import type { CourseDefinition } from "@shared/courseCatalog";

const checklistItems = [
  { id: "content", label: "Review lesson content and interactive activities", detail: "Check examples, simulations, reflection prompts, and visual illustrations." },
  { id: "timers", label: "Verify lesson timer and sequential navigation", detail: "Confirm the quality-control bypass opens lessons without waiting for the study timer." },
  { id: "responses", label: "Test response capture and autosave", detail: "Enter a sample response, confirm it saves, and verify the completion flow." },
  { id: "quiz", label: "Run a randomized module quiz", detail: "Confirm questions and answer options vary while the admin score is recorded as 100%." },
  { id: "certificate", label: "Generate and verify the course certificate", detail: "Check the learner identity, certificate number, QR verification URL, and branded artwork." },
  { id: "delivery", label: "Review certificate delivery and dashboard access", detail: "Confirm the email outcome, dashboard availability, download, and sharing actions." },
] as const;

type ChecklistId = (typeof checklistItems)[number]["id"];

type ChecklistState = Partial<Record<ChecklistId, boolean>>;

function storageKey(courseSlug: string) {
  return `piq-admin-qa-checklist:${courseSlug}`;
}

function readChecklist(courseSlug: string): ChecklistState {
  try {
    const raw = window.localStorage.getItem(storageKey(courseSlug));
    return raw ? JSON.parse(raw) as ChecklistState : {};
  } catch {
    return {};
  }
}

export function AdminCourseQAChecklist({ course }: { course: CourseDefinition }) {
  const [checked, setChecked] = useState<ChecklistState>(() => readChecklist(course.slug));
  const completed = useMemo(() => checklistItems.filter((item) => checked[item.id]).length, [checked]);
  const toggle = (id: ChecklistId) => setChecked((current) => {
    const next = { ...current, [id]: !current[id] };
    window.localStorage.setItem(storageKey(course.slug), JSON.stringify(next));
    return next;
  });
  const reset = () => {
    window.localStorage.removeItem(storageKey(course.slug));
    setChecked({});
  };

  return <section aria-labelledby="admin-qa-checklist-title" className="mt-8 border border-[#c9a34e]/60 bg-[#fff5cf] p-5 text-[#16243d] sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#16243d] text-[#c9a34e]"><ShieldCheck size={19} /></span><div><p className="eyebrow text-[#7d5e1e]">Admin quality-control checklist</p><h2 id="admin-qa-checklist-title" className="display mt-2 text-2xl">Validate {course.title} with intent.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#5d4613]">Track the key gates while reviewing this course. Checklist progress is saved only in this browser and does not change learner records.</p></div></div>
      <button type="button" onClick={reset} className="inline-flex items-center gap-2 border border-[#7d5e1e]/40 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] text-[#7d5e1e] hover:bg-white/60"><RotateCcw size={13} /> Reset checklist</button>
    </div>
    <div className="mt-5 flex items-center gap-3"><div className="h-2 flex-1 overflow-hidden bg-[#16243d]/15"><div className="h-full bg-[#a27e2e] transition-[width] duration-200" style={{ width: `${(completed / checklistItems.length) * 100}%` }} /></div><span className="text-xs font-bold text-[#7d5e1e]">{completed}/{checklistItems.length}</span></div>
    <div className="mt-5 grid gap-3 md:grid-cols-2">{checklistItems.map((item) => <label key={item.id} className={`flex cursor-pointer gap-3 border p-3 transition-colors ${checked[item.id] ? "border-[#a27e2e]/60 bg-white/60" : "border-[#7d5e1e]/20 bg-white/30 hover:border-[#a27e2e]"}`}><input type="checkbox" checked={Boolean(checked[item.id])} onChange={() => toggle(item.id)} className="mt-1 h-4 w-4 accent-[#a27e2e]" /><span><span className="flex items-center gap-2 text-sm font-bold">{checked[item.id] && <Check size={14} className="text-emerald-800" />}{item.label}</span><span className="mt-1 block text-xs leading-5 text-[#5d4613]">{item.detail}</span></span></label>)}</div>
  </section>;
}

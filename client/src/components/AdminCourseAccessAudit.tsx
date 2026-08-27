import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";

export function AdminCourseAccessAudit() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const input = useMemo(() => ({ fromDate: fromDate || undefined, toDate: toDate || undefined }), [fromDate, toDate]);
  const query = trpc.admin.courseAccessDeniedAnalytics.useQuery(input);
  const top = query.data?.summary.slice(0, 6) ?? [];
  return <section id="course-access-audit" className="border border-[#16243d]/15 bg-white/55 p-5 sm:p-7">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow text-[#a27e2e]">Learning access observatory</p><h2 className="display mt-2 text-3xl">Denied lesson access and drop-offs</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#657084]">Review where learners reached a payment gate, which installment they needed, and where checkout follow-up may improve completion.</p></div><span className="border border-[#c9a34e]/60 bg-[#fffaf0] px-3 py-2 text-xs font-bold">{query.data?.totalDenied ?? 0} denied attempts</span></div>
    <div className="mt-6 flex flex-wrap gap-3"><label className="text-xs font-bold">From <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="ml-2 border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 font-normal" /></label><label className="text-xs font-bold">To <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="ml-2 border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 font-normal" /></label></div>
    {query.isLoading ? <p className="mt-6 text-sm text-[#657084]">Loading access events…</p> : top.length === 0 ? <p className="mt-6 border-l-2 border-[#c9a34e] bg-[#fffaf0] p-4 text-sm text-[#657084]">No denied lesson-access events match this period.</p> : <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead><tr className="border-b border-[#16243d]/15 text-[10px] font-black uppercase tracking-[.12em] text-[#657084]"><th className="px-3 py-3">Course</th><th className="px-3 py-3">Module</th><th className="px-3 py-3">Required stage</th><th className="px-3 py-3">Denied attempts</th><th className="px-3 py-3">Learners</th></tr></thead><tbody>{top.map((item) => <tr key={`${item.courseSlug}-${item.moduleIndex}-${item.requiredStage}`} className="border-b border-[#16243d]/10"><td className="px-3 py-3 font-semibold">{item.courseSlug}</td><td className="px-3 py-3">{item.moduleIndex + 1}</td><td className="px-3 py-3">Stage {item.requiredStage}</td><td className="px-3 py-3 font-bold text-[#a27e2e]">{item.deniedCount}</td><td className="px-3 py-3">{item.uniqueUsers}</td></tr>)}</tbody></table></div>}
  </section>;
}

import { trpc } from "@/lib/trpc";
import { ChevronLeft, ChevronRight, Mail, RefreshCw, Search } from "lucide-react";
import { useMemo, useState } from "react";

const categories = [
  ["all", "All subjects"],
  ["professional-courses", "Professional courses"],
  ["educational-consulting", "Educational consulting"],
  ["psychometric-testing", "Psychometric testing"],
  ["research-surveys", "Research surveys"],
  ["organizational-development", "Organizational development"],
  ["general", "General question"],
] as const;

export default function AdminInquiryPanel() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number][0]>("all");
  const [status, setStatus] = useState<"all" | "new" | "contacted" | "closed">("all");
  const [page, setPage] = useState(1);
  const input = useMemo(() => ({ page, pageSize: 8, search: search || undefined, category, status }), [category, page, search, status]);
  const inquiries = trpc.admin.contactInquiries.useQuery(input, { retry: false });
  const updateStatus = trpc.admin.updateContactInquiryStatus.useMutation({ onSuccess: () => inquiries.refetch() });

  const resetPage = () => setPage(1);
  const subjectLabel = (value: string) => categories.find(([key]) => key === value)?.[1] ?? value;

  return <section className="mt-10 border border-[#16243d]/15 bg-white/45 p-5 sm:p-6" aria-labelledby="inquiries-title">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="eyebrow flex items-center gap-2 text-[#a27e2e]"><Mail size={13} /> Contact desk</p><h2 id="inquiries-title" className="display mt-3 text-3xl">Submitted inquiries.</h2><p className="mt-2 text-sm text-[#657084]">Review, triage, and close questions submitted through the public website.</p></div>
      <span className="text-xs font-bold uppercase tracking-[.12em] text-[#657084]">{inquiries.data?.total ?? 0} total</span>
    </div>
    <div className="mt-6 grid gap-3 md:grid-cols-[1.4fr_1fr_1fr]">
      <label className="relative"><span className="sr-only">Search inquiries</span><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#657084]" size={15} /><input value={search} onChange={event => { setSearch(event.target.value); resetPage(); }} placeholder="Search name, email, or message" className="w-full border border-[#16243d]/20 bg-[#f7f3e8] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#c9a34e]" /></label>
      <select value={category} onChange={event => { setCategory(event.target.value as typeof category); resetPage(); }} aria-label="Filter inquiries by subject" className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-sm"><option value="all">All subjects</option>{categories.filter(([key]) => key !== "all").map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
      <select value={status} onChange={event => { setStatus(event.target.value as typeof status); resetPage(); }} aria-label="Filter inquiries by status" className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-sm"><option value="all">All statuses</option><option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select>
    </div>
    {inquiries.isLoading ? <div className="mt-6 flex items-center gap-2 text-sm text-[#657084]"><RefreshCw size={15} className="animate-spin" /> Loading inquiries…</div> : inquiries.isError ? <div className="mt-6 border-l-2 border-red-700 bg-red-50 p-4 text-sm text-red-900">Unable to load inquiries. Please refresh and try again.</div> : inquiries.data?.rows.length ? <div className="mt-6 divide-y divide-[#16243d]/10 border-y border-[#16243d]/10">{inquiries.data.rows.map(inquiry => <article key={inquiry.id} className="py-5"><div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{inquiry.name}</h3><span className="border border-[#c9a34e]/60 px-2 py-1 text-[10px] font-black uppercase tracking-[.1em] text-[#7d5e1e]">{subjectLabel(inquiry.category)}</span><span className="border border-[#16243d]/15 px-2 py-1 text-[10px] font-black uppercase tracking-[.1em] text-[#657084]">{inquiry.status}</span></div><a href={`mailto:${inquiry.email}`} className="mt-1 inline-block text-sm text-[#a27e2e] hover:underline">{inquiry.email}</a><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#4a566a]">{inquiry.message}</p><p className="mt-3 text-[11px] uppercase tracking-[.1em] text-[#8a94a4]">Received {new Date(inquiry.createdAt).toLocaleString()}</p></div><select value={inquiry.status} onChange={event => updateStatus.mutate({ id: inquiry.id, status: event.target.value as "new" | "contacted" | "closed" })} disabled={updateStatus.isPending} aria-label={`Update status for inquiry from ${inquiry.name}`} className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-xs font-bold uppercase tracking-[.1em]"><option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select></div></article>)}</div> : <div className="mt-6 border border-dashed border-[#16243d]/20 p-6 text-sm text-[#657084]">No inquiries match the current filters.</div>}
    <div className="mt-5 flex items-center justify-between gap-3"><button type="button" onClick={() => setPage(value => Math.max(1, value - 1))} disabled={page <= 1 || inquiries.isLoading} className="inline-flex items-center gap-1 border border-[#16243d]/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] disabled:opacity-40"><ChevronLeft size={13} /> Previous</button><span className="text-xs text-[#657084]">Page {inquiries.data?.page ?? page} of {inquiries.data?.totalPages ?? 1}</span><button type="button" onClick={() => setPage(value => Math.min(inquiries.data?.totalPages ?? value, value + 1))} disabled={page >= (inquiries.data?.totalPages ?? 1) || inquiries.isLoading} className="inline-flex items-center gap-1 border border-[#16243d]/20 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] disabled:opacity-40">Next <ChevronRight size={13} /></button></div>
  </section>;
}

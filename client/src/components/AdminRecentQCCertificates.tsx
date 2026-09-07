import { useMemo, useState } from "react";
import { CalendarDays, Search, ShieldCheck } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { courseCatalog } from "@shared/courseCatalog";

const inputClass =
  "border border-[#16243d]/20 bg-white px-3 py-2 text-xs text-[#16243d] outline-none transition focus:border-[#c9a34e] focus:ring-2 focus:ring-[#c9a34e]/30";

export function AdminRecentQCCertificates() {
  const [courseSlug, setCourseSlug] = useState("all");
  const [status, setStatus] = useState("issued");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const queryInput = useMemo(
    () => ({
      courseSlug,
      status,
      search: search.trim() || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      limit: 25,
    }),
    [courseSlug, status, search, fromDate, toDate]
  );
  const certificates = trpc.admin.recentCourseCertificates.useQuery(
    queryInput,
    { retry: false, refetchInterval: 30000 }
  );
  const rows = certificates.data ?? [];

  return (
    <section
      id="recent-qc-certificates"
      className="mt-8 border border-[#c9a34e]/70 bg-[#fffaf0] p-5 text-[#16243d] shadow-sm sm:p-6"
      aria-labelledby="recent-qc-certificates-title"
    >
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-2 text-[#7d5e1e]">
            <ShieldCheck size={16} />
            <p className="eyebrow">Quality control tracking</p>
          </div>
          <h2
            id="recent-qc-certificates-title"
            className="display mt-2 text-3xl"
          >
            Recently generated certificates
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#657084]">
            Review the latest course certificates created through the canonical
            certificate pipeline. Filters are server-backed and limited to
            administrators.
          </p>
        </div>
        <div className="border border-[#c9a34e]/50 bg-white px-3 py-2 text-right">
          <p className="text-[9px] font-black uppercase tracking-[.12em] text-[#7d5e1e]">
            Visible records
          </p>
          <p className="mt-1 text-2xl font-bold">
            {certificates.isLoading ? "—" : rows.length}
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 border-y border-[#16243d]/10 py-4 sm:grid-cols-2 lg:grid-cols-5">
        <label className="flex flex-col gap-1 text-[10px] font-black uppercase tracking-[.1em] text-[#657084]">
          <span>Search</span>
          <span className="relative">
            <Search
              size={14}
              className="absolute left-3 top-2.5 text-[#7d5e1e]"
            />
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Name, course, ID"
              className={`${inputClass} w-full pl-9`}
            />
          </span>
        </label>
        <label className="flex flex-col gap-1 text-[10px] font-black uppercase tracking-[.1em] text-[#657084]">
          <span>Course</span>
          <select
            value={courseSlug}
            onChange={event => setCourseSlug(event.target.value)}
            className={inputClass}
          >
            <option value="all">All courses</option>
            {courseCatalog.map(course => (
              <option key={course.slug} value={course.slug}>
                {course.title}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[10px] font-black uppercase tracking-[.1em] text-[#657084]">
          <span>Status</span>
          <select
            value={status}
            onChange={event => setStatus(event.target.value)}
            className={inputClass}
          >
            <option value="all">All statuses</option>
            <option value="issued">Issued</option>
            <option value="revoked">Revoked</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[10px] font-black uppercase tracking-[.1em] text-[#657084]">
          <span>From</span>
          <span className="relative">
            <CalendarDays
              size={14}
              className="absolute left-3 top-2.5 text-[#7d5e1e]"
            />
            <input
              type="date"
              value={fromDate}
              onChange={event => setFromDate(event.target.value)}
              className={`${inputClass} w-full pl-9`}
            />
          </span>
        </label>
        <label className="flex flex-col gap-1 text-[10px] font-black uppercase tracking-[.1em] text-[#657084]">
          <span>To</span>
          <span className="relative">
            <CalendarDays
              size={14}
              className="absolute left-3 top-2.5 text-[#7d5e1e]"
            />
            <input
              type="date"
              value={toDate}
              onChange={event => setToDate(event.target.value)}
              className={`${inputClass} w-full pl-9`}
            />
          </span>
        </label>
      </div>
      {certificates.isLoading ? (
        <div
          className="grid min-h-32 place-items-center border border-dashed border-[#16243d]/20 text-sm text-[#657084]"
          role="status"
        >
          Loading recent certificates…
        </div>
      ) : certificates.error ? (
        <div className="border border-red-900/20 bg-red-50 p-4 text-sm text-red-900">
          Unable to load QC certificates. {certificates.error.message}
        </div>
      ) : rows.length === 0 ? (
        <div className="border border-dashed border-[#16243d]/20 p-6 text-sm text-[#657084]">
          No generated certificates match these filters.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#16243d]/15 text-[10px] font-black uppercase tracking-[.1em] text-[#657084]">
                <th className="px-3 py-3">Certificate</th>
                <th className="px-3 py-3">Respondent</th>
                <th className="px-3 py-3">Course</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Generated</th>
                <th className="px-3 py-3">Artifact hash</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr
                  key={row.id}
                  className="border-b border-[#16243d]/10 align-top last:border-0"
                >
                  <td className="px-3 py-3 font-semibold">
                    {row.certificateNumber}
                  </td>
                  <td className="px-3 py-3">{row.recipientName}</td>
                  <td className="px-3 py-3">{row.courseTitle}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex border px-2 py-1 text-[9px] font-black uppercase tracking-[.08em] ${row.status === "issued" ? "border-emerald-700/30 bg-emerald-50 text-emerald-800" : "border-red-700/30 bg-red-50 text-red-800"}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-[#657084]">
                    {new Date(row.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-3 font-mono text-[10px] text-[#657084]">
                    {row.artifactHash
                      ? `${row.artifactHash.slice(0, 12)}…`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

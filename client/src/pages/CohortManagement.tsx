import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";

export default function CohortManagement() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [cohort, setCohort] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [importStatus, setImportStatus] = useState("");
  const input = useMemo(
    () => ({
      page,
      pageSize: 25,
      search: search || undefined,
      verification: "all" as const,
    }),
    [page, search]
  );
  const users = trpc.admin.userVerificationReview.useQuery(input);
  const assign = trpc.admin.assignUsersCohort.useMutation({
    onSuccess: () => {
      setSelected([]);
      void users.refetch();
    },
  });
  const importCohorts = trpc.admin.importUserCohorts.useMutation({
    onSuccess: result => {
      setImportStatus(
        `Processed ${result.processed} row(s); updated ${result.updated}. Unmatched: ${result.unmatched.length}.`
      );
      void users.refetch();
    },
  });
  const parseCsv = (text: string) => {
    const lines = text
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean);
    if (lines.length < 2)
      throw new Error("The CSV must include a header and at least one row.");
    const headers = lines[0]
      .split(",")
      .map(header => header.trim().toLowerCase());
    const identifierIndex = Math.max(
      headers.indexOf("open_id"),
      headers.indexOf("openid"),
      headers.indexOf("email"),
      headers.indexOf("identifier")
    );
    const cohortIndex = headers.indexOf("cohort");
    if (identifierIndex < 0 || cohortIndex < 0)
      throw new Error(
        "CSV headers must include identifier or email/open_id, plus cohort."
      );
    return lines
      .slice(1)
      .map(line => {
        const cells = line
          .split(",")
          .map(cell => cell.trim().replace(/^\"|\"$/g, ""));
        return {
          identifier: cells[identifierIndex] || "",
          cohort: cells[cohortIndex] || null,
        };
      })
      .filter(row => row.identifier);
  };
  const handleCsvUpload = async (file: File) => {
    try {
      setImportStatus("Reading CSV…");
      const rows = parseCsv(await file.text());
      importCohorts.mutate({ rows });
    } catch (error) {
      setImportStatus(
        error instanceof Error ? error.message : "Could not read this CSV."
      );
    }
  };
  const toggle = (openId: string) =>
    setSelected(current =>
      current.includes(openId)
        ? current.filter(id => id !== openId)
        : [...current, openId]
    );
  return (
    <main className="container py-10 text-[#16243d]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-[#7d5e1e]">Admin workspace</p>
          <h1 className="display mt-2 text-4xl">Cohort management</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#657084]">
            Group learners intentionally for conversion analysis. Assignments
            are stored on the user record and can be changed at any time.
          </p>
        </div>
        <a
          href="/admin"
          className="border border-[#16243d]/25 px-4 py-2 text-[10px] font-black uppercase tracking-[.1em]"
        >
          Back to observatory
        </a>
      </div>
      <div className="mt-8 flex flex-wrap items-end gap-3">
        <label className="text-xs font-bold">
          Search
          <input
            value={search}
            onChange={event => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Name, email, or ID"
            className="mt-2 block w-64 border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 font-normal"
          />
        </label>
        <label className="text-xs font-bold">
          Cohort for selected users
          <input
            value={cohort}
            onChange={event => setCohort(event.target.value)}
            placeholder="e.g. Leadership 2026"
            className="mt-2 block w-56 border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 font-normal"
          />
        </label>
        <button
          type="button"
          disabled={!selected.length || assign.isPending}
          onClick={() =>
            assign.mutate({ openIds: selected, cohort: cohort.trim() || null })
          }
          className="border border-[#16243d] bg-[#16243d] px-4 py-2 text-[10px] font-black uppercase tracking-[.1em] text-[#f7f3e8] disabled:opacity-40"
        >
          {assign.isPending
            ? "Assigning…"
            : `Assign ${selected.length || "selected"}`}
        </button>
      </div>
      <div className="mt-5 flex flex-wrap items-end gap-3 border border-[#16243d]/15 bg-[#fffaf0] p-4">
        <label className="text-xs font-bold">
          Bulk import CSV
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={event => {
              const file = event.target.files?.[0];
              if (file) void handleCsvUpload(file);
              event.currentTarget.value = "";
            }}
            className="mt-2 block max-w-xs text-xs font-normal"
          />
        </label>
        <p className="text-xs text-[#657084]">
          Headers: <code>email</code> or <code>open_id</code>, and{" "}
          <code>cohort</code>.
        </p>
        {importCohorts.isPending && (
          <span className="text-xs font-bold">Importing…</span>
        )}
        {importStatus && (
          <span role="status" className="text-xs font-bold text-[#7d5e1e]">
            {importStatus}
          </span>
        )}
      </div>
      <div className="mt-6 overflow-x-auto border border-[#16243d]/15 bg-white/60">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#16243d]/15 text-[10px] font-black uppercase tracking-[.12em] text-[#657084]">
              <th className="px-4 py-3">Select</th>
              <th className="px-4 py-3">Learner</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Cohort</th>
              <th className="px-4 py-3">Last signed in</th>
            </tr>
          </thead>
          <tbody>
            {users.data?.rows.map(user => (
              <tr key={user.openId} className="border-b border-[#16243d]/10">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(user.openId)}
                    onChange={() => toggle(user.openId)}
                    aria-label={`Select ${user.name || user.email || user.openId}`}
                  />
                </td>
                <td className="px-4 py-3 font-semibold">
                  {user.name || "Unnamed learner"}
                </td>
                <td className="px-4 py-3">{user.email || "—"}</td>
                <td className="px-4 py-3">{user.cohort || "Unassigned"}</td>
                <td className="px-4 py-3">
                  {new Date(user.lastSignedIn).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users.isLoading && !users.data?.rows.length && (
          <p className="p-6 text-sm text-[#657084]">
            No learners match this search.
          </p>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between text-xs">
        <span>
          {users.data?.total ?? 0} learners · page {users.data?.page ?? page} of{" "}
          {users.data?.totalPages ?? 1}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(value => value - 1)}
            className="border border-[#16243d]/25 px-3 py-2 disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= (users.data?.totalPages ?? 1)}
            onClick={() => setPage(value => value + 1)}
            className="border border-[#16243d]/25 px-3 py-2 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
}

export { CohortManagement };

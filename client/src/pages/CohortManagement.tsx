import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Upload, Download, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { useAdminTableState } from "@/hooks/useAdminTableState";
import "@/components/dashboard/admin-observatory.css";

function CohortManagementInner() {
  const { state: table, setValue: setTable } = useAdminTableState(
    "cohort-management",
    {
      search: "",
      page: 1,
      cohort: "",
      selected: [] as string[],
    },
    { persistedKeys: ["search", "page", "cohort", "selected"] }
  );

  const search = table.search as string;
  const page = table.page as number;
  const cohort = table.cohort as string;
  const selected = table.selected as string[];

  const setSearch = (value: string) => setTable("search", value);
  const setPage = (value: number | ((prev: number) => number)) => setTable("page", value);
  const setCohort = (value: string) => setTable("cohort", value);
  const setSelected = (value: string[] | ((prev: string[]) => string[])) => setTable("selected", value);
  const [importStatus, setImportStatus] = useState("");
  const [importError, setImportError] = useState("");

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
      setImportError("");
      void users.refetch();
    },
    onError: (error) => {
      setImportError(error.message || "Import failed");
      setImportStatus("");
    }
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
      setImportError("");
      const rows = parseCsv(await file.text());
      importCohorts.mutate({ rows });
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Could not read this CSV.");
      setImportStatus("");
    }
  };

  const toggle = (openId: string) =>
    setSelected(current =>
      current.includes(openId)
        ? current.filter(id => id !== openId)
        : [...current, openId]
    );

  const totalLearners = users.data?.total ?? 0;

  return (
    <div className="admin-observatory w-full max-w-full space-y-6 overflow-x-hidden">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="exec-eyebrow">Admin workspace</p>
          <h1 className="display mt-2 text-3xl">Cohort management</h1>
          <p className="mt-1 text-sm text-[#64748b]">
            Group learners intentionally for conversion analysis. Assignments are stored on the user record and can be changed at any time.
          </p>
        </div>
        <div className="exec-badge w-fit">
          <Users size={16} />
          <span>{totalLearners} total learners</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4 overflow-x-hidden">
          <div className="exec-card p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" aria-hidden="true" />
                <Input
                  value={search}
                  onChange={event => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Name, email, or ID"
                  className="h-10 w-full pl-9 sm:w-72"
                />
              </div>
              <Input
                value={cohort}
                onChange={event => setCohort(event.target.value)}
                placeholder="Cohort label"
                className="h-10 w-full sm:w-56"
              />
              <Button
                disabled={!selected.length || assign.isPending}
                onClick={() =>
                  assign.mutate({ openIds: selected, cohort: cohort.trim() || null })
                }
                className="h-10 w-full sm:w-auto bg-[#16243d] text-[10px] font-black uppercase tracking-[.1em] text-[#f7f3e8] disabled:opacity-40"
              >
                {assign.isPending ? "Assigning…" : `Assign ${selected.length || "selected"}`}
              </Button>
              <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-[.1em]">
                {selected.length} selected
              </Badge>
            </div>
          </div>

          <div className="exec-card overflow-hidden">
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="exec-table min-w-[640px]">
                  <thead>
                    <tr>
                      <th>Select</th>
                      <th>Learner</th>
                      <th>Email</th>
                      <th>Cohort</th>
                      <th>Last signed in</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.data?.rows.map(user => (
                      <tr key={user.openId}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selected.includes(user.openId)}
                            onChange={() => toggle(user.openId)}
                            aria-label={`Select ${user.name || user.email || user.openId}`}
                            className="h-4 w-4 rounded border-[#16243d]/20"
                          />
                        </td>
                        <td className="font-medium text-[#0f172a]">
                          {user.name || "Unnamed learner"}
                        </td>
                        <td className="text-[#475569]">{user.email || "—"}</td>
                        <td>
                          {user.cohort ? (
                            <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-[.08em]">
                              {user.cohort}
                            </Badge>
                          ) : (
                            <span className="text-[#64748b]">Unassigned</span>
                          )}
                        </td>
                        <td className="text-[#64748b]">
                          {new Date(user.lastSignedIn).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {!users.isLoading && !users.data?.rows.length && (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <p className="text-sm font-semibold text-[#64748b]">No learners match this search.</p>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e2e8f0] px-4 py-4 text-xs text-[#64748b] sm:px-5">
              <span>
                {totalLearners} learners · page {users.data?.page ?? page} of{" "}
                {users.data?.totalPages ?? 1}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(value => value - 1)}
                  className="h-8 gap-1 border-[#e2e8f0] px-3 text-[10px] font-black uppercase tracking-[.08em] disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= (users.data?.totalPages ?? 1)}
                  onClick={() => setPage(value => value + 1)}
                  className="h-8 gap-1 border-[#e2e8f0] px-3 text-[10px] font-black uppercase tracking-[.08em] disabled:opacity-40"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="exec-card p-4 sm:p-5">
            <p className="exec-label-gold">Bulk import CSV</p>
            <p className="mt-2 text-sm leading-6 text-[#475569]">
              Upload a CSV to assign cohorts in bulk. Required headers:{" "}
              <code className="rounded bg-[#f1f5f9] px-1.5 py-0.5 text-xs font-semibold text-[#7d5e1e]">
                email
              </code>{" "}
              or{" "}
              <code className="rounded bg-[#f1f5f9] px-1.5 py-0.5 text-xs font-semibold text-[#7d5e1e]">
                open_id
              </code>
              , and{" "}
              <code className="rounded bg-[#f1f5f9] px-1.5 py-0.5 text-xs font-semibold text-[#7d5e1e]">
                cohort
              </code>
              .
            </p>
            <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[#e2e8f0] px-4 py-3 text-xs font-semibold text-[#64748b] transition-colors hover:border-[#c9a34e] hover:text-[#16243d]">
              <Upload className="h-4 w-4" />
              Upload CSV
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={event => {
                  const file = event.target.files?.[0];
                  if (file) void handleCsvUpload(file);
                  event.currentTarget.value = "";
                }}
                className="sr-only"
              />
            </label>
            {importStatus && (
              <p role="status" className="mt-3 text-xs font-semibold text-emerald-800">
                {importStatus}
              </p>
            )}
            {importError && (
              <p role="alert" className="mt-3 text-xs font-semibold text-red-700">
                {importError}
              </p>
            )}
            {importCohorts.isPending && (
              <p className="mt-3 text-xs font-semibold text-[#64748b]">Importing…</p>
            )}
          </div>

          <div className="exec-card p-4 sm:p-5">
            <p className="exec-label-gold">Quick actions</p>
            <div className="mt-4 space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-full justify-start gap-2 border-[#e2e8f0] text-[10px] font-black uppercase tracking-[.08em]"
              >
                <Download className="h-4 w-4" />
                Export current view
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-full justify-start gap-2 border-[#e2e8f0] text-[10px] font-black uppercase tracking-[.08em]"
              >
                <Upload className="h-4 w-4" />
                Import cohorts
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CohortManagement() {
  return (
    <DashboardLayout role="admin" title="Cohort management">
      <CohortManagementInner />
    </DashboardLayout>
  );
}

export { CohortManagement };

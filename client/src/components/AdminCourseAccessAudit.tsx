import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { courseCatalog } from "@shared/courseCatalog";

export function AdminCourseAccessAudit() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [threshold, setThreshold] = useState(20);
  const [cohort, setCohort] = useState("");
  const [deviceType, setDeviceType] = useState<
    "" | "desktop" | "mobile" | "tablet" | "unknown"
  >("");
  const [presetName, setPresetName] = useState("");
  const [presetVisibility, setPresetVisibility] = useState<
    "private" | "admins" | "staff"
  >("private");
  const [presets, setPresets] = useState<
    Array<{
      name: string;
      fromDate?: string;
      toDate?: string;
      cohort?: string;
      deviceType?: string;
      visibility: "private" | "admins" | "staff";
    }>
  >([]);
  const input = useMemo(
    () => ({
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      cohort: cohort || undefined,
      deviceType: deviceType || undefined,
    }),
    [fromDate, toDate, cohort, deviceType]
  );
  const query = trpc.admin.courseAccessDeniedAnalytics.useQuery(input, {
    retry: false,
    refetchInterval: 30000,
  });
  const presetsQuery = trpc.admin.accessFilterPresets.useQuery(undefined, {
    retry: false,
    refetchInterval: 30000,
  });
  const savePresets = trpc.admin.saveAccessFilterPresets.useMutation({
    onSuccess: () => void presetsQuery.refetch(),
  });
  const alertSettings = trpc.admin.getCourseAccessAlertSettings.useQuery(
    undefined,
    { retry: false, refetchInterval: 30000 }
  );
  const saveAlertSettings =
    trpc.admin.saveCourseAccessAlertSettings.useMutation({
      onSuccess: () => void alertSettings.refetch(),
    });
  const usersQuery = trpc.admin.userVerificationReview.useQuery(
    { page: 1, pageSize: 25, verification: "all" },
    { retry: false, refetchInterval: 30000 }
  );
  const assignCohort = trpc.admin.assignUserCohort.useMutation({
    onSuccess: () => void usersQuery.refetch(),
  });
  const grantsQuery = trpc.admin.courseAccessGrants.useQuery(undefined, {
    retry: false,
    refetchInterval: 30000,
  });
  const grantAuditsQuery = trpc.admin.courseAccessGrantAudits.useQuery(
    undefined,
    { retry: false, refetchInterval: 30000 }
  );
  const grantAuditExportQuery =
    trpc.admin.exportCourseAccessGrantAudits.useQuery(undefined, {
      enabled: false,
      retry: false,
    });
  const setGrant = trpc.admin.setCourseAccessGrant.useMutation({
    onSuccess: () => {
      void grantsQuery.refetch();
      void grantAuditsQuery.refetch();
    },
  });
  const [grantCourseByUser, setGrantCourseByUser] = useState<
    Record<string, string>
  >({});
  const activeGrantFor = (userOpenId: string, courseSlug: string) =>
    grantsQuery.data?.some(
      item =>
        item.grant.userOpenId === userOpenId &&
        item.grant.courseSlug === courseSlug &&
        !item.grant.revokedAt
    ) ?? false;
  const grantAudits = grantAuditsQuery.data ?? [];
  const [grantSearch, setGrantSearch] = useState("");
  const [selectedGrantUsers, setSelectedGrantUsers] = useState<string[]>([]);
  const [bulkCourseSlug, setBulkCourseSlug] = useState(
    courseCatalog[0]?.slug ?? ""
  );
  const bulkSetGrant = trpc.admin.bulkSetCourseAccessGrant.useMutation({
    onSuccess: () => {
      setSelectedGrantUsers([]);
      void grantsQuery.refetch();
      void grantAuditsQuery.refetch();
    },
  });
  const filteredGrantUsers = useMemo(
    () =>
      (usersQuery.data?.rows ?? []).filter(
        user =>
          !grantSearch.trim() ||
          `${user.name ?? ""} ${user.email ?? ""} ${user.openId}`
            .toLowerCase()
            .includes(grantSearch.trim().toLowerCase())
      ),
    [grantSearch, usersQuery.data?.rows]
  );
  const toggleGrantUser = (openId: string) =>
    setSelectedGrantUsers(current =>
      current.includes(openId)
        ? current.filter(item => item !== openId)
        : [...current, openId]
    );
  const bulkUpdateGrants = (enabled: boolean) => {
    if (!selectedGrantUsers.length) return;
    bulkSetGrant.mutate({
      grants: selectedGrantUsers.map(userOpenId => ({
        userOpenId,
        courseSlug: bulkCourseSlug,
        enabled,
      })),
    });
  };
  useEffect(() => {
    if (alertSettings.data) setThreshold(alertSettings.data.threshold);
  }, [alertSettings.data]);
  const exportQuery = trpc.admin.exportCourseAccessDeniedAnalytics.useQuery(
    input,
    { enabled: false, retry: false }
  );
  const pdfExport = trpc.admin.exportCourseAccessAnalyticsPdf.useMutation();
  const emailPdf = trpc.admin.emailCourseAccessAnalyticsPdf.useMutation();
  useEffect(() => {
    if (presetsQuery.data) setPresets(presetsQuery.data);
  }, [presetsQuery.data]);
  const downloadCsv = async () => {
    const result = await exportQuery.refetch();
    if (!result.data) return;
    const url = URL.createObjectURL(
      new Blob([result.data.data], { type: result.data.contentType })
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = result.data.filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const downloadGrantAuditCsv = async () => {
    const result = await grantAuditExportQuery.refetch();
    if (!result.data) return;
    const url = URL.createObjectURL(
      new Blob([result.data.data], { type: result.data.contentType })
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = result.data.filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const top = query.data?.summary.slice(0, 6) ?? [];
  const savePreset = () => {
    const name = presetName.trim();
    if (!name) return;
    const next = [
      ...presets.filter(item => item.name !== name),
      {
        name,
        fromDate,
        toDate,
        cohort,
        deviceType,
        visibility: presetVisibility,
      },
    ];
    setPresets(next);
    savePresets.mutate({ presets: next });
    setPresetName("");
  };
  const loadPreset = (name: string) => {
    const item = presets.find(entry => entry.name === name);
    if (!item) return;
    setFromDate(item.fromDate ?? "");
    setToDate(item.toDate ?? "");
    setCohort(item.cohort ?? "");
    setDeviceType((item.deviceType ?? "") as typeof deviceType);
  };
  const exportChartPng = () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="500"><rect width="100%" height="100%" fill="#fffaf0"/><text x="40" y="48" font-family="Arial" font-size="24" font-weight="700" fill="#16243d">Profound IQ Conversion Trend</text><text x="40" y="78" font-family="Arial" font-size="14" fill="#475569">${fromDate || "All time"} — ${toDate || "Today"}</text>${(
      query.data?.trend || []
    )
      .slice(-30)
      .map((point, index, values) => {
        const max = Math.max(
          1,
          ...values.map(entry => Math.max(entry.denied, entry.paid))
        );
        const x = 40 + index * 37;
        return `<rect x="${x}" y="${430 - (point.denied / max) * 300}" width="12" height="${(point.denied / max) * 300}" fill="#16243d"/><rect x="${x + 14}" y="${430 - (point.paid / max) * 300}" width="12" height="${(point.paid / max) * 300}" fill="#c9a34e"/>`;
      })
      .join("")}</svg>`;
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 500;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.drawImage(image, 0, 0);
      const anchor = document.createElement("a");
      anchor.href = canvas.toDataURL("image/png");
      anchor.download = "profound-iq-conversion-trend.png";
      anchor.click();
    };
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };
  const exportChartPdf = async () => {
    const result = await pdfExport.mutateAsync(input);
    const bytes = Uint8Array.from(atob(result.data), character =>
      character.charCodeAt(0)
    );
    const url = URL.createObjectURL(
      new Blob([bytes], { type: result.contentType })
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = result.filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const emailChartPdf = async () => {
    const recipient = window.prompt("Stakeholder email address");
    if (!recipient?.trim()) return;
    await emailPdf.mutateAsync({ ...input, recipient: recipient.trim() });
  };
  return (
    <section
      id="course-access-audit"
      className="border border-[#16243d]/15 bg-white/55 p-5 sm:p-7"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-[#b8860b]">Learning access observatory</p>
          <h2 className="display mt-2 text-3xl">
            Denied lesson access and drop-offs
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#475569]">
            Review where learners reached a payment gate, which installment they
            needed, and where checkout follow-up may improve completion.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex flex-wrap gap-2">
            <input
              value={presetName}
              onChange={event => setPresetName(event.target.value)}
              placeholder="Preset name"
              className="w-28 border border-[#16243d]/20 bg-[#f7f3e8] px-2 py-2 text-xs"
            />
            <select
              aria-label="Preset visibility"
              value={presetVisibility}
              onChange={event =>
                setPresetVisibility(
                  event.target.value as typeof presetVisibility
                )
              }
              className="border border-[#16243d]/20 bg-[#f7f3e8] px-2 py-2 text-xs"
            >
              <option value="private">Only me</option>
              <option value="admins">All admins</option>
              <option value="staff">Admins and staff</option>
            </select>
            <button
              type="button"
              onClick={savePreset}
              disabled={savePresets.isPending}
              className="border border-[#16243d]/25 px-2 py-2 text-[10px] font-black uppercase tracking-[.08em]"
            >
              Save preset
            </button>
            {presets.length > 0 && (
              <select
                aria-label="Load saved filter preset"
                defaultValue=""
                onChange={event => loadPreset(event.target.value)}
                className="border border-[#16243d]/20 bg-[#f7f3e8] px-2 py-2 text-xs"
              >
                <option value="">Load preset</option>
                {presets.map(item => (
                  <option key={item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            )}
            <button
              type="button"
              onClick={exportChartPng}
              className="border border-[#16243d]/25 px-2 py-2 text-[10px] font-black uppercase tracking-[.08em]"
            >
              PNG
            </button>
            <button
              type="button"
              onClick={() => void exportChartPdf()}
              disabled={pdfExport.isPending}
              className="border border-[#16243d]/25 px-2 py-2 text-[10px] font-black uppercase tracking-[.08em]"
            >
              PDF
            </button>
            <button
              type="button"
              onClick={() => void emailChartPdf()}
              disabled={emailPdf.isPending}
              className="border border-[#16243d]/25 px-2 py-2 text-[10px] font-black uppercase tracking-[.08em]"
            >
              {emailPdf.isPending ? "Sending…" : "Email PDF"}
            </button>
          </div>
          <span className="border border-[#c9a34e]/60 bg-[#fffaf0] px-3 py-2 text-xs font-bold">
            {query.data?.totalDenied ?? 0} denied attempts
          </span>
          <button
            type="button"
            onClick={() => void downloadCsv()}
            disabled={exportQuery.isFetching}
            className="inline-flex items-center gap-2 border border-[#16243d]/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.08em] disabled:opacity-50"
          >
            <Download size={13} />{" "}
            {exportQuery.isFetching ? "Preparing…" : "Export CSV"}
          </button>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                const end = new Date();
                const start = new Date(end);
                start.setUTCDate(end.getUTCDate() - 6);
                setFromDate(start.toISOString().slice(0, 10));
                setToDate(end.toISOString().slice(0, 10));
              }}
              className="border border-[#16243d]/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.08em]"
            >
              Last 7 days
            </button>
            <button
              type="button"
              onClick={() => {
                const end = new Date();
                const start = new Date(end);
                start.setUTCDate(end.getUTCDate() - 29);
                setFromDate(start.toISOString().slice(0, 10));
                setToDate(end.toISOString().slice(0, 10));
              }}
              className="border border-[#16243d]/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.08em]"
            >
              Last 30 days
            </button>
          </div>
          <label className="text-xs font-bold">
            From{" "}
            <input
              type="date"
              value={fromDate}
              onChange={event => setFromDate(event.target.value)}
              className="ml-2 border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 font-normal"
            />
          </label>
          <label className="text-xs font-bold">
            To{" "}
            <input
              type="date"
              value={toDate}
              onChange={event => setToDate(event.target.value)}
              className="ml-2 border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 font-normal"
            />
          </label>
          <label className="text-xs font-bold">
            Cohort{" "}
            <input
              value={cohort}
              onChange={event => setCohort(event.target.value)}
              placeholder="All cohorts"
              className="ml-2 w-28 border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 font-normal"
            />
          </label>
          <label className="text-xs font-bold">
            Device{" "}
            <select
              value={deviceType}
              onChange={event =>
                setDeviceType(event.target.value as typeof deviceType)
              }
              className="ml-2 border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 font-normal"
            >
              <option value="">All devices</option>
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
              <option value="tablet">Tablet</option>
              <option value="unknown">Unknown</option>
            </select>
          </label>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs font-bold">
            Alert below{" "}
            <input
              type="number"
              min="0"
              max="100"
              value={threshold}
              onChange={event =>
                setThreshold(
                  Math.min(100, Math.max(0, Number(event.target.value)))
                )
              }
              className="ml-2 w-20 border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 font-normal"
            />
            %
          </label>
          <button
            type="button"
            onClick={() => saveAlertSettings.mutate({ threshold })}
            disabled={saveAlertSettings.isPending}
            className="border border-[#16243d]/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.08em] disabled:opacity-50"
          >
            {saveAlertSettings.isPending ? "Saving…" : "Save alert"}
          </button>
        </div>
      </div>
      {query.data?.comparison?.previousConversionRate !== null &&
        query.data?.comparison?.previousConversionRate !== undefined && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-l-2 border-[#c9a34e] bg-[#fffaf0] px-4 py-3 text-sm">
            <span>
              <strong>Period comparison:</strong>{" "}
              {query.data.conversion.conversionRate}% now vs{" "}
              {query.data.comparison.previousConversionRate}% in the previous
              period.
            </span>
            <span
              className={
                (query.data.comparison.changePoints ?? 0) >= 0
                  ? "font-bold text-emerald-800"
                  : "font-bold text-red-800"
              }
            >
              {(query.data.comparison.changePoints ?? 0) >= 0 ? "+" : ""}
              {query.data.comparison.changePoints ?? 0} pts
            </span>
          </div>
        )}
      {query.data?.conversion &&
        query.data.conversion.conversionRate < threshold && (
          <div
            role="alert"
            className="mt-5 border-l-4 border-red-700 bg-red-50 px-4 py-3 text-sm text-red-900"
          >
            <strong>Drop-off alert:</strong> denied-to-paid conversion is{" "}
            {query.data.conversion.conversionRate}%, below your {threshold}%
            threshold.
          </div>
        )}
      {query.data?.trend && query.data.trend.length > 0 && (
        <div className="mt-5 border border-[#16243d]/10 bg-[#fffaf0] p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#b8860b]">
              Conversion trend over time
            </p>
            <span className="text-[10px] text-[#475569]">
              Daily denied vs paid
            </span>
          </div>
          <div className="mt-4 h-36 flex items-end gap-1">
            {query.data.trend.slice(-30).map(point => {
              const max = Math.max(
                1,
                ...query.data.trend
                  .slice(-30)
                  .map(entry => Math.max(entry.denied, entry.paid))
              );
              return (
                <div
                  key={point.date}
                  className="group relative flex h-full flex-1 items-end gap-px"
                  title={`${point.date}: ${point.conversionRate}% conversion`}
                >
                  <div
                    className="w-1/2 bg-[#16243d]"
                    style={{ height: `${(point.denied / max) * 100}%` }}
                  />
                  <div
                    className="w-1/2 bg-[#c9a34e]"
                    style={{ height: `${(point.paid / max) * 100}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-[#475569]">
            <span>{query.data.trend[0]?.date}</span>
            <span>{query.data.trend.at(-1)?.date}</span>
          </div>
        </div>
      )}
      {query.data?.conversion && (
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="border-t-2 border-[#c9a34e] bg-[#fffaf0] p-4">
            <p className="text-[10px] font-black uppercase tracking-[.1em] text-[#475569]">
              Denied learners
            </p>
            <p className="mt-2 text-2xl font-bold">
              {query.data.conversion.deniedUsers}
            </p>
          </div>
          <div className="border-t-2 border-emerald-700 bg-[#fffaf0] p-4">
            <p className="text-[10px] font-black uppercase tracking-[.1em] text-[#475569]">
              Converted to payment
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-800">
              {query.data.conversion.convertedUsers}
            </p>
          </div>
          <div className="border-t-2 border-[#16243d] bg-[#fffaf0] p-4">
            <p className="text-[10px] font-black uppercase tracking-[.1em] text-[#475569]">
              Denied → paid conversion
            </p>
            <p className="mt-2 text-2xl font-bold">
              {query.data.conversion.conversionRate}%
            </p>
          </div>
        </div>
      )}
      {usersQuery.data?.rows && usersQuery.data.rows.length > 0 && (
        <div className="mt-6 border border-[#16243d]/10 bg-[#fffaf0] p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#b8860b]">
              Cohort assignment
            </p>
            <span className="text-[10px] text-[#475569]">
              Assign named cohorts for segmentation
            </span>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-xs">
              <thead>
                <tr className="border-b border-[#16243d]/15 text-[10px] uppercase tracking-[.1em] text-[#475569]">
                  <th className="px-2 py-2">Respondent</th>
                  <th className="px-2 py-2">Current cohort</th>
                  <th className="px-2 py-2">Update</th>
                </tr>
              </thead>
              <tbody>
                {usersQuery.data.rows.slice(0, 10).map(user => (
                  <tr
                    key={user.openId}
                    className="border-b border-[#16243d]/10"
                  >
                    <td className="px-2 py-2">
                      {user.name || user.email || user.openId}
                    </td>
                    <td className="px-2 py-2">{user.cohort || "Unassigned"}</td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        onClick={() => {
                          const value = window.prompt(
                            "Enter a cohort name, or leave blank to clear:",
                            user.cohort || ""
                          );
                          if (value !== null)
                            assignCohort.mutate({
                              openId: user.openId,
                              cohort: value.trim() || null,
                            });
                        }}
                        className="border border-[#16243d]/25 px-2 py-1 text-[10px] font-black uppercase tracking-[.08em]"
                      >
                        Assign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {usersQuery.data?.rows && usersQuery.data.rows.length > 0 && (
        <div className="mt-6 border border-[#c9a34e]/45 bg-[#fffaf0] p-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#b8860b]">
                Quality-control access grants
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#475569]">
                Grant or revoke payment-free content access for a specific
                learner and course. Changes are server-authorized and recorded
                in the audit history.
              </p>
            </div>
            <span className="border border-[#c9a34e]/60 px-2 py-1 text-[10px] font-black uppercase tracking-[.1em]">
              Admin only
            </span>
            <button
              type="button"
              onClick={() => void downloadGrantAuditCsv()}
              disabled={grantAuditExportQuery.isFetching}
              className="inline-flex items-center gap-2 border border-[#16243d]/25 bg-white/50 px-3 py-2 text-[10px] font-black uppercase tracking-[.08em] disabled:opacity-50"
            >
              <Download size={13} />{" "}
              {grantAuditExportQuery.isFetching
                ? "Preparing…"
                : "Export grant audit"}
            </button>
          </div>
          <div className="mt-4 flex flex-col gap-3 border-y border-[#16243d]/10 py-3 sm:flex-row sm:items-center">
            <input
              type="search"
              value={grantSearch}
              onChange={event => setGrantSearch(event.target.value)}
              placeholder="Search learners by name, email, or ID"
              aria-label="Search learners for course access grants"
              className="min-w-0 flex-1 border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-xs"
            />
            <select
              aria-label="Bulk grant course"
              value={bulkCourseSlug}
              onChange={event => setBulkCourseSlug(event.target.value)}
              className="border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-xs sm:w-64"
            >
              {courseCatalog.map(course => (
                <option key={course.slug} value={course.slug}>
                  {course.title}
                </option>
              ))}
            </select>
            <span className="text-xs text-[#475569]">
              {selectedGrantUsers.length} selected
            </span>
            <button
              type="button"
              onClick={() => bulkUpdateGrants(true)}
              disabled={!selectedGrantUsers.length || bulkSetGrant.isPending}
              className="border border-[#16243d] bg-[#16243d] px-3 py-2 text-[10px] font-black uppercase tracking-[.08em] text-[#f7f3e8] disabled:opacity-50"
            >
              Grant selected
            </button>
            <button
              type="button"
              onClick={() => bulkUpdateGrants(false)}
              disabled={!selectedGrantUsers.length || bulkSetGrant.isPending}
              className="border border-red-700/40 px-3 py-2 text-[10px] font-black uppercase tracking-[.08em] text-red-800 disabled:opacity-50"
            >
              Revoke selected
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {filteredGrantUsers.map(user => {
              const selectedCourse =
                grantCourseByUser[user.openId] ?? courseCatalog[0]?.slug ?? "";
              const activeGrants = (grantsQuery.data ?? []).filter(
                item =>
                  item.grant.userOpenId === user.openId && !item.grant.revokedAt
              );
              return (
                <div
                  key={user.openId}
                  className="border border-[#16243d]/10 bg-white/60 p-3"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <input
                      type="checkbox"
                      checked={selectedGrantUsers.includes(user.openId)}
                      onChange={() => toggleGrantUser(user.openId)}
                      aria-label={`Select ${user.email || user.name || user.openId} for bulk course access`}
                      className="mt-1 accent-[#a27e2e]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">
                        {user.name || user.email || user.openId}
                      </p>
                      <p className="mt-1 truncate text-xs text-[#475569]">
                        {user.email || user.openId}
                      </p>
                    </div>
                    <select
                      aria-label={`Course access grant for ${user.email || user.name || user.openId}`}
                      value={selectedCourse}
                      onChange={event =>
                        setGrantCourseByUser(current => ({
                          ...current,
                          [user.openId]: event.target.value,
                        }))
                      }
                      className="w-full border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-xs lg:w-72"
                    >
                      {courseCatalog.map(course => (
                        <option key={course.slug} value={course.slug}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() =>
                        setGrant.mutate({
                          userOpenId: user.openId,
                          courseSlug: selectedCourse,
                          enabled: true,
                        })
                      }
                      disabled={
                        setGrant.isPending ||
                        activeGrantFor(user.openId, selectedCourse)
                      }
                      className="border border-[#16243d] bg-[#16243d] px-3 py-2 text-[10px] font-black uppercase tracking-[.08em] text-[#f7f3e8] disabled:opacity-50"
                    >
                      {activeGrantFor(user.openId, selectedCourse)
                        ? "Granted"
                        : "Grant access"}
                    </button>
                  </div>
                  {activeGrants.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {activeGrants.map(item => (
                        <span
                          key={item.grant.id}
                          className="inline-flex items-center gap-2 border border-emerald-700/30 bg-emerald-50 px-2 py-1 text-[11px] text-emerald-900"
                        >
                          <span className="max-w-[220px] truncate">
                            {courseCatalog.find(
                              course => course.slug === item.grant.courseSlug
                            )?.title ?? item.grant.courseSlug}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setGrant.mutate({
                                userOpenId: user.openId,
                                courseSlug: item.grant.courseSlug,
                                enabled: false,
                              })
                            }
                            className="font-black uppercase tracking-[.08em] underline underline-offset-2"
                          >
                            Revoke
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {filteredGrantUsers.length === 0 && (
            <p className="border-l-2 border-[#c9a34e] bg-[#fffaf0] p-3 text-xs text-[#475569]">
              No learners match this search.
            </p>
          )}
          {grantAudits.length > 0 && (
            <div className="mt-5 border-t border-[#16243d]/10 pt-4">
              <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#475569]">
                Recent grant audit
              </p>
              <div className="mt-3 space-y-2">
                {grantAudits.slice(0, 6).map(audit => (
                  <div
                    key={audit.id}
                    className="flex flex-wrap items-center justify-between gap-2 text-xs"
                  >
                    <span>
                      <strong
                        className={
                          audit.action === "grant"
                            ? "text-emerald-800"
                            : "text-red-800"
                        }
                      >
                        {audit.action === "grant" ? "Granted" : "Revoked"}
                      </strong>{" "}
                      · {audit.courseSlug}
                    </span>
                    <span className="text-[#475569]">
                      {new Date(audit.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {query.data?.conversionByCourse &&
        query.data.conversionByCourse.length > 0 && (
          <div className="mt-5 border border-[#16243d]/10 bg-[#fffaf0] p-4">
            <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#b8860b]">
              Conversion by course
            </p>
            <div className="mt-3 space-y-3">
              {query.data.conversionByCourse.slice(0, 5).map(item => (
                <div key={item.courseSlug}>
                  <div className="flex justify-between gap-3 text-xs">
                    <span className="font-semibold">{item.courseSlug}</span>
                    <span>
                      {item.convertedUsers}/{item.deniedUsers} ·{" "}
                      {item.conversionRate}%
                    </span>
                  </div>
                  <div className="mt-1 h-2 bg-[#16243d]/10">
                    <div
                      className="h-full bg-emerald-700"
                      style={{ width: `${item.conversionRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      {query.isLoading ? (
        <p className="mt-6 text-sm text-[#475569]">Loading access events…</p>
      ) : top.length === 0 ? (
        <p className="mt-6 border-l-2 border-[#c9a34e] bg-[#fffaf0] p-4 text-sm text-[#475569]">
          No denied lesson-access events match this period.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#16243d]/15 text-[10px] font-black uppercase tracking-[.12em] text-[#475569]">
                <th className="px-3 py-3">Course</th>
                <th className="px-3 py-3">Module</th>
                <th className="px-3 py-3">Required stage</th>
                <th className="px-3 py-3">Denied attempts</th>
                <th className="px-3 py-3">Respondents</th>
              </tr>
            </thead>
            <tbody>
              {top.map(item => (
                <tr
                  key={`${item.courseSlug}-${item.moduleIndex}-${item.requiredStage}`}
                  className="border-b border-[#16243d]/10"
                >
                  <td className="px-3 py-3 font-semibold">{item.courseSlug}</td>
                  <td className="px-3 py-3">{item.moduleIndex + 1}</td>
                  <td className="px-3 py-3">Stage {item.requiredStage}</td>
                  <td className="px-3 py-3 font-bold text-[#b8860b]">
                    {item.deniedCount}
                  </td>
                  <td className="px-3 py-3">{item.uniqueUsers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}



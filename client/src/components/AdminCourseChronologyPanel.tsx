import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Award,
  CreditCard,
  Package,
  Printer,
  RefreshCw,
  UserCheck,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { courseCatalog } from "@shared/courseCatalog";

type TimelineEntry = {
  kind: "delivery" | "payment" | "enrollment" | "certificate";
  date: Date;
  label: string;
  detail: string;
  status: string;
  user?: string;
};

type SortKey = "date" | "user" | "course" | "status" | "type";
type SortDir = "asc" | "desc";

const defaultSort = { key: "date" as SortKey, dir: "desc" as SortDir };

export default function AdminCourseChronologyPanel() {
  const [range, setRange] = useState({ from: "", to: "" });
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>(defaultSort);

  const delivery = trpc.admin.courseDeliveryOutcomes.useQuery(
    { limit: 200, offset: 0 },
    { retry: false, refetchInterval: 15000 }
  );
  const payments = trpc.admin.coursePaymentExceptions.useQuery(
    { status: "all", search: "", limit: 200 },
    { retry: false, refetchInterval: 15000 }
  );
  const grants = trpc.admin.courseAccessGrants.useQuery(
    { activeOnly: true, search: "", courseSlug: "all" },
    { retry: false, refetchInterval: 15000 }
  );
  const certificates = trpc.admin.recentCourseCertificates.useQuery(
    {
      courseSlug: "all",
      status: "all",
      search: "",
      fromDate: range.from || undefined,
      toDate: range.to || undefined,
      limit: 200,
    },
    { retry: false, refetchInterval: 15000 }
  );

  const analytics = useMemo(() => {
    const paymentRows = payments.data?.rows ?? [];
    const paidPayments = paymentRows.filter(
      row => row.stage.paymentStatus === "paid"
    ).length;
    const pendingPayments = paymentRows.filter(
      row => row.stage.paymentStatus !== "paid"
    ).length;
    const exceptionPayments = paymentRows.filter(row =>
      Boolean(row.stage.lastError)
    ).length;

    return {
      deliveries: delivery.data?.length ?? 0,
      payments: paymentRows.length,
      paidPayments,
      pendingPayments,
      exceptionPayments,
      enrollments: grants.data?.length ?? 0,
      certificates: certificates.data?.length ?? 0,
    };
  }, [delivery.data, payments.data, grants.data, certificates.data]);

  const timeline = useMemo<TimelineEntry[]>(() => {
    const items: TimelineEntry[] = [];

    for (const row of delivery.data ?? []) {
      const date = row.createdAt ? new Date(row.createdAt) : new Date();
      items.push({
        kind: "delivery",
        date,
        label: row.step || "Delivery",
        detail: row.recipientEmail || row.organizationName || "—",
        status: row.status,
        user: row.recipientEmail || row.organizationName || "—",
      });
    }

    for (const row of payments.data?.rows ?? []) {
      const date = row.stage.updatedAt
        ? new Date(row.stage.updatedAt)
        : row.stage.initializedAt
          ? new Date(row.stage.initializedAt)
          : new Date();
      const course = courseCatalog.find(
        c => c.slug === row.enrollment.courseSlug
      );
      items.push({
        kind: "payment",
        date,
        label: course?.title || row.enrollment.courseSlug || "Payment",
        detail: `${row.stage.stage ? `Stage ${row.stage.stage}` : "Course"} · ${row.stage.paystackReference ?? "—"}`,
        status: row.stage.lastError ? "exception" : row.stage.paymentStatus,
        user:
          row.enrollment.email ||
          row.enrollment.name ||
          row.enrollment.userOpenId ||
          "—",
      });
    }

    for (const row of grants.data ?? []) {
      const date = row.grant.grantedAt
        ? new Date(row.grant.grantedAt)
        : row.grant.updatedAt
          ? new Date(row.grant.updatedAt)
          : new Date();
      const course = courseCatalog.find(c => c.slug === row.grant.courseSlug);
      items.push({
        kind: "enrollment",
        date,
        label: course?.title || row.grant.courseSlug || "Enrollment",
        detail: row.userEmail || row.userName || row.grant.userOpenId,
        status: row.grant.revokedAt ? "revoked" : "active",
        user: row.userEmail || row.userName || row.grant.userOpenId || "—",
      });
    }

    for (const row of certificates.data ?? []) {
      const date = row.createdAt ? new Date(row.createdAt) : new Date();
      items.push({
        kind: "certificate",
        date,
        label: row.courseTitle || "Certificate",
        detail: `${row.recipientName} · ${row.certificateNumber}`,
        status: row.status,
        user: row.recipientName || "—",
      });
    }

    const sorted = items.sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      switch (sort.key) {
        case "date":
          return (a.date.getTime() - b.date.getTime()) * dir;
        case "user":
          return (a.user || "").localeCompare(b.user || "") * dir;
        case "course":
          return a.label.localeCompare(b.label) * dir;
        case "status":
          return a.status.localeCompare(b.status) * dir;
        case "type":
          return a.kind.localeCompare(b.kind) * dir;
        default:
          return 0;
      }
    });

    return sorted;
  }, [delivery.data, payments.data, grants.data, certificates.data, sort]);

  const busy =
    delivery.isLoading ||
    payments.isLoading ||
    grants.isLoading ||
    certificates.isLoading;

  const toggleSort = (key: SortKey) => {
    setSort(prev => ({
      key,
      dir: prev.key === key && prev.dir === "desc" ? "asc" : "desc",
    }));
  };

  const sortIcon = (key: SortKey) => {
    if (sort.key !== key) return null;
    return sort.dir === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} />;
  };

  const print = () => window.print();

  return (
    <section className="mt-8 border border-[#16243d]/15 bg-white/55 p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow text-[var(--brand)]">Course observatory</p>
          <h2 className="display mt-2 text-2xl">
            Courses — activity timeline.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--fg-muted)]">
            Chronological view of delivery, payments, enrollments, and
            certificates.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              delivery.refetch();
              payments.refetch();
              grants.refetch();
              certificates.refetch();
            }}
            className="inline-flex items-center gap-2 border border-[#16243d]/25 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] hover:border-[var(--brand)]"
          >
            <RefreshCw size={13} className={busy ? "animate-spin" : ""} />{" "}
            Refresh
          </button>
          <button
            type="button"
            onClick={print}
            className="inline-flex items-center gap-2 border border-[#16243d]/25 bg-[#16243d] px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] text-[#f7f3e8] hover:bg-[#16243d]/90"
          >
            <Printer size={13} /> Print / PDF
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#16243d]/15 bg-white/55 p-4">
          <div className="flex items-center gap-2 text-[var(--brand)]">
            <Package size={16} />
            <p className="text-[10px] font-black uppercase tracking-[.12em]">
              Deliveries
            </p>
          </div>
          <p className="display mt-2 text-2xl">{analytics.deliveries}</p>
        </div>
        <div className="rounded-xl border border-[#16243d]/15 bg-white/55 p-4">
          <div className="flex items-center gap-2 text-[var(--brand)]">
            <CreditCard size={16} />
            <p className="text-[10px] font-black uppercase tracking-[.12em]">
              Payments
            </p>
          </div>
          <p className="display mt-2 text-2xl">{analytics.payments}</p>
          <p className="mt-1 text-xs text-[var(--fg-muted)]">
            <span className="font-bold text-emerald-700">
              {analytics.paidPayments} paid
            </span>{" "}
            ·{" "}
            <span className="font-bold text-[var(--fg-muted)]">
              {analytics.pendingPayments} pending
            </span>{" "}
            ·{" "}
            <span className="font-bold text-red-700">
              {analytics.exceptionPayments} exceptions
            </span>
          </p>
        </div>
        <div className="rounded-xl border border-[#16243d]/15 bg-white/55 p-4">
          <div className="flex items-center gap-2 text-[var(--brand)]">
            <UserCheck size={16} />
            <p className="text-[10px] font-black uppercase tracking-[.12em]">
              Enrollments
            </p>
          </div>
          <p className="display mt-2 text-2xl">{analytics.enrollments}</p>
        </div>
        <div className="rounded-xl border border-[#16243d]/15 bg-white/55 p-4">
          <div className="flex items-center gap-2 text-[var(--brand)]">
            <Award size={16} />
            <p className="text-[10px] font-black uppercase tracking-[.12em]">
              Certificates
            </p>
          </div>
          <p className="display mt-2 text-2xl">{analytics.certificates}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-[10px] font-black uppercase tracking-[.12em] text-[var(--fg-muted)]">
          From
          <input
            id="course-chronology-from"
            type="date"
            value={range.from}
            onChange={event =>
              setRange(prev => ({ ...prev, from: event.target.value }))
            }
            className="mt-2 w-full border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-xs"
          />
        </label>
        <label className="text-[10px] font-black uppercase tracking-[.12em] text-[var(--fg-muted)]">
          To
          <input
            id="course-chronology-to"
            type="date"
            value={range.to}
            onChange={event =>
              setRange(prev => ({ ...prev, to: event.target.value }))
            }
            className="mt-2 w-full border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-xs"
          />
        </label>
        <label className="text-[10px] font-black uppercase tracking-[.12em] text-[var(--fg-muted)]">
          Sort
          <select
            value={sort.key}
            onChange={event => toggleSort(event.target.value as SortKey)}
            className="mt-2 w-full border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-xs"
          >
            <option value="date">Date</option>
            <option value="user">User</option>
            <option value="course">Course</option>
            <option value="status">Status</option>
            <option value="type">Type</option>
          </select>
        </label>
        <label className="text-[10px] font-black uppercase tracking-[.12em] text-[var(--fg-muted)]">
          Direction
          <select
            value={sort.dir}
            onChange={event =>
              setSort(prev => ({ ...prev, dir: event.target.value as SortDir }))
            }
            className="mt-2 w-full border border-[#16243d]/20 bg-[#f7f3e8] px-3 py-2 text-xs"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </label>
      </div>

      {busy && !timeline.length ? (
        <div className="mt-6 text-sm text-[var(--fg-muted)]">
          Loading course activity…
        </div>
      ) : !timeline.length ? (
        <div className="mt-6 border border-dashed border-[#16243d]/20 p-6 text-sm text-[var(--fg-muted)]">
          No course activity found for the selected period.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#16243d]/15 text-[10px] font-black uppercase tracking-[.12em] text-[var(--fg-muted)]">
                <th className="px-3 py-3">
                  <button
                    type="button"
                    onClick={() => toggleSort("date")}
                    className="inline-flex items-center gap-1"
                  >
                    When {sortIcon("date")}
                  </button>
                </th>
                <th className="px-3 py-3">
                  <button
                    type="button"
                    onClick={() => toggleSort("type")}
                    className="inline-flex items-center gap-1"
                  >
                    Type {sortIcon("type")}
                  </button>
                </th>
                <th className="px-3 py-3">
                  <button
                    type="button"
                    onClick={() => toggleSort("user")}
                    className="inline-flex items-center gap-1"
                  >
                    User {sortIcon("user")}
                  </button>
                </th>
                <th className="px-3 py-3">
                  <button
                    type="button"
                    onClick={() => toggleSort("course")}
                    className="inline-flex items-center gap-1"
                  >
                    Course {sortIcon("course")}
                  </button>
                </th>
                <th className="px-3 py-3">
                  <button
                    type="button"
                    onClick={() => toggleSort("status")}
                    className="inline-flex items-center gap-1"
                  >
                    Status {sortIcon("status")}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {timeline.map((row, idx) => (
                <tr
                  key={`${row.kind}-${idx}`}
                  className="border-b border-[#16243d]/10"
                >
                  <td className="whitespace-nowrap px-3 py-3 text-[var(--fg-muted)]">
                    {row.date.toLocaleString()}
                  </td>
                  <td className="px-3 py-3 capitalize">{row.kind}</td>
                  <td className="px-3 py-3">{row.user}</td>
                  <td className="px-3 py-3 font-medium">{row.label}</td>
                  <td className="px-3 py-3 capitalize">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

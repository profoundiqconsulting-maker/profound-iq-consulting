export type DeliveryLogRow = {
  id: number;
  templateKey: string;
  recipientEmail: string;
  subject: string;
  status: string;
  errorMessage: string | null;
  createdAt: Date;
};

export type DeliveryLogFilters = {
  search?: string;
  status?: "all" | "sent" | "failed";
  fromDate?: Date;
  toDate?: Date;
};

export function filterDeliveryLogRows(
  rows: DeliveryLogRow[],
  filters: DeliveryLogFilters = {}
) {
  const search = filters.search?.trim().toLowerCase();
  return rows.filter(row => {
    const matchesSearch =
      !search ||
      `${row.subject} ${row.recipientEmail} ${row.templateKey} ${row.errorMessage ?? ""}`
        .toLowerCase()
        .includes(search);
    const matchesStatus =
      !filters.status ||
      filters.status === "all" ||
      row.status === filters.status;
    const matchesFrom = !filters.fromDate || row.createdAt >= filters.fromDate;
    const matchesTo = !filters.toDate || row.createdAt <= filters.toDate;
    return matchesSearch && matchesStatus && matchesFrom && matchesTo;
  });
}

export function paginateDeliveryLogRows(
  rows: DeliveryLogRow[],
  page: number,
  pageSize: number
) {
  const safePage = Math.max(1, page);
  const safePageSize = Math.min(100, Math.max(1, pageSize));
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const currentPage = Math.min(safePage, totalPages);
  return {
    rows: rows.slice(
      (currentPage - 1) * safePageSize,
      currentPage * safePageSize
    ),
    total,
    totalPages,
    page: currentPage,
    pageSize: safePageSize,
  };
}

const csvCell = (value: unknown) =>
  `"${String(value ?? "").replace(/"/g, '""')}"`;

export function buildDeliveryLogCsv(rows: DeliveryLogRow[]) {
  const header = [
    "ID",
    "Template",
    "Recipient",
    "Subject",
    "Status",
    "Error",
    "Created at",
  ]
    .map(csvCell)
    .join(",");
  const lines = rows.map(row =>
    [
      row.id,
      row.templateKey,
      row.recipientEmail,
      row.subject,
      row.status,
      row.errorMessage,
      row.createdAt.toISOString(),
    ]
      .map(csvCell)
      .join(",")
  );
  return [header, ...lines].join("\n");
}

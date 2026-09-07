export type CertificateUsageEventRow = {
  eventType: string;
  platform: string | null;
  count: number;
  day?: string;
};

export function hasIssuedCertificate(
  certificateUrl: string | null | undefined
): certificateUrl is string {
  return typeof certificateUrl === "string" && certificateUrl.trim().length > 0;
}

export function summarizeCertificateUsageRows(
  rows: CertificateUsageEventRow[]
) {
  const totals = rows.reduce(
    (acc, row) => {
      if (row.eventType === "share") acc.shares += Number(row.count ?? 0);
      if (row.eventType === "download") acc.downloads += Number(row.count ?? 0);
      return acc;
    },
    { shares: 0, downloads: 0 }
  );
  const byPlatform = Object.entries(
    rows.reduce<Record<string, number>>((acc, row) => {
      const key = `${row.eventType}:${row.platform?.trim() || "unknown"}`;
      acc[key] = (acc[key] ?? 0) + Number(row.count ?? 0);
      return acc;
    }, {})
  ).map(([key, count]) => {
    const [eventType, platform] = key.split(":");
    return { eventType, platform, count };
  });
  return {
    totals,
    byPlatform,
    daily: buildCertificateDownloadChartData(rows).daily,
  };
}

export function buildCertificateDownloadChartData(
  rows: CertificateUsageEventRow[]
) {
  const downloads = rows.filter(row => row.eventType === "download");
  const byPlatform = Object.entries(
    downloads.reduce<Record<string, number>>((acc, row) => {
      const platform = row.platform?.trim() || "unknown";
      acc[platform] = (acc[platform] ?? 0) + Number(row.count ?? 0);
      return acc;
    }, {})
  ).map(([platform, count]) => ({ platform, count }));
  const daily = Object.entries(
    downloads.reduce<Record<string, number>>((acc, row) => {
      if (!row.day) return acc;
      acc[row.day] = (acc[row.day] ?? 0) + Number(row.count ?? 0);
      return acc;
    }, {})
  )
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([day, count]) => ({ day: day.slice(5), count }));
  return { byPlatform, daily };
}

export function normalizeCertificateUsageDateRange(
  fromDate?: string,
  toDate?: string
) {
  return {
    fromDate: fromDate ? new Date(`${fromDate}T00:00:00.000Z`) : undefined,
    toDate: toDate ? new Date(`${toDate}T23:59:59.999Z`) : undefined,
  };
}

export function filterCertificateUsageRows(
  rows: CertificateUsageEventRow[],
  fromDate?: string,
  toDate?: string
) {
  return rows.filter(row => {
    if (!row.day) return true;
    if (fromDate && row.day < fromDate) return false;
    if (toDate && row.day > toDate) return false;
    return true;
  });
}

export type PaymentHistoryStage = {
  id: number;
  stage: number;
  amountKes: number;
  paymentStatus: string;
  paidAt?: Date | string | null;
  paystackReference?: string | null;
};

export type PaymentHistoryRecord = {
  enrollment: {
    id: number;
    name: string;
    email: string;
    courseSlug: string;
    updatedAt?: Date | string | null;
  };
  stages: PaymentHistoryStage[];
};

export type PaymentHistoryTransaction = PaymentHistoryStage & {
  enrollmentId: number;
  courseSlug: string;
  transactionDate?: Date | string | null;
};

export type PaymentHistoryFilters = {
  courseSlug: string;
  stage: string;
  status: string;
  from: string;
  to: string;
  sort: "date-desc" | "date-asc" | "amount-desc" | "amount-asc" | "course-asc" | "stage-asc" | "status";
};

const timestamp = (value?: Date | string | null) => value ? new Date(value).getTime() : 0;

export function flattenPaymentHistory(records: PaymentHistoryRecord[]): PaymentHistoryTransaction[] {
  return records.flatMap((record) => record.stages.map((stage) => ({
    ...stage,
    enrollmentId: record.enrollment.id,
    courseSlug: record.enrollment.courseSlug,
    transactionDate: stage.paidAt ?? record.enrollment.updatedAt ?? null,
  })));
}

const startOfDate = (value: string) => value ? Date.parse(`${value}T00:00:00.000Z`) : Number.NEGATIVE_INFINITY;
const endOfDate = (value: string) => value ? Date.parse(`${value}T23:59:59.999Z`) : Number.POSITIVE_INFINITY;

export function filterAndSortPaymentHistory(transactions: PaymentHistoryTransaction[], filters: PaymentHistoryFilters) {
  const from = startOfDate(filters.from);
  const to = endOfDate(filters.to);
  const filtered = transactions.filter((transaction) => {
    const transactionTimestamp = timestamp(transaction.transactionDate);
    return (filters.courseSlug === "all" || transaction.courseSlug === filters.courseSlug)
      && (filters.stage === "all" || String(transaction.stage) === filters.stage)
      && (filters.status === "all" || transaction.paymentStatus === filters.status)
      && transactionTimestamp >= from
      && transactionTimestamp <= to;
  });

  return [...filtered].sort((left, right) => {
    switch (filters.sort) {
      case "date-asc": return timestamp(left.transactionDate) - timestamp(right.transactionDate) || left.id - right.id;
      case "amount-desc": return right.amountKes - left.amountKes || timestamp(right.transactionDate) - timestamp(left.transactionDate);
      case "amount-asc": return left.amountKes - right.amountKes || timestamp(right.transactionDate) - timestamp(left.transactionDate);
      case "course-asc": return left.courseSlug.localeCompare(right.courseSlug) || left.stage - right.stage;
      case "stage-asc": return left.stage - right.stage || timestamp(right.transactionDate) - timestamp(left.transactionDate);
      case "status": return left.paymentStatus.localeCompare(right.paymentStatus) || timestamp(right.transactionDate) - timestamp(left.transactionDate);
      case "date-desc":
      default: return timestamp(right.transactionDate) - timestamp(left.transactionDate) || right.id - left.id;
    }
  });
}
